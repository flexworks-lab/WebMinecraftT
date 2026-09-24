import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { sendBlockChange } from "./multiplayerClient.js";
import { sendTNTIgnite } from "./tntMultiplayer.js";
import { blockGeometry, tntMaterial, sandMaterial } from "./blocks.js";

const FLINT_AND_STEEL_ITEM_ID = 16;
const FUSE_MS = 2500;
const EXPLOSION_RADIUS = 4;
const INTERACTION_DISTANCE = 5;
const TNT_GRAVITY = 22;
const TNT_MAX_FALL_SPEED = 28;
const SAND_GRAVITY = 22;
const SAND_MAX_FALL_SPEED = 28;

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const primed = new Set();
const fallingSand = new Map();
let suppressPhysicsBlockEvent = false;
let lastScene = null;
let physicsLoopStarted = false;
let lastPhysicsTime = performance.now();

function makeKey(x, y, z) { return `${x},${y},${z}`; }

function notifyBlockChange(x, y, z, type) {
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y, z, type } }));
}
function isSolidBlock(type, BLOCK = getBlockTypes()) { return !!type && type !== BLOCK.AIR && type !== BLOCK.WATER; }
function setBlockFromPhysics(x, y, z, type) {
    suppressPhysicsBlockEvent = true;
    try {
        if (!setBlockAt(x, y, z, type)) return false;
        sendBlockChange(x, y, z, type);
        notifyBlockChange(x, y, z, type);
        return true;
    } finally { suppressPhysicsBlockEvent = false; }
}
function cloneMaterials(materials) { return materials.map(material => material.clone()); }
function createDynamicBlock(scene, x, y, z, materials, kind) {
    const cloned = cloneMaterials(materials);
    const mesh = new THREE.Mesh(blockGeometry, cloned);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.dynamicBlockType = kind;
    mesh.userData.originalColors = cloned.map(material => material.color.clone());
    scene.add(mesh); return mesh;
}
function disposeDynamicMesh(mesh) {
    if (!mesh) return;
    if (mesh.parent) mesh.parent.remove(mesh);
    if (Array.isArray(mesh.material)) for (const material of mesh.material) material.dispose();
}
function activateFallingSand(scene, x, y, z) {
    const key = makeKey(x, y, z), BLOCK = getBlockTypes();
    if (fallingSand.has(key) || getBlockAt(x, y, z) !== BLOCK.SAND) return false;
    if (isSolidBlock(getBlockAt(x, y - 1, z), BLOCK)) return false;
    const mesh = createDynamicBlock(scene, x, y, z, [sandMaterial], "sand");
    fallingSand.set(key, { x, y, z, velocity: 0, mesh });
    if (!setBlockFromPhysics(x, y, z, BLOCK.AIR)) {
        fallingSand.delete(key); disposeDynamicMesh(mesh); return false;
    }
    return true;
}
function tryTrackSandAt(scene, x, y, z) {
    const BLOCK = getBlockTypes();
    if (getBlockAt(x, y, z) !== BLOCK.SAND) return;
    activateFallingSand(scene, x, y, z);
}
function processBlockChangeForPhysics(scene, detail) {
    if (suppressPhysicsBlockEvent || !scene || !detail) return;
    const { x, y, z, type } = detail, BLOCK = getBlockTypes();
    if (type === BLOCK.SAND) { tryTrackSandAt(scene, x, y, z); return; }
    if (type === BLOCK.AIR) for (let offset = 1; offset <= 4; offset++) tryTrackSandAt(scene, x, y + offset, z);
}
function getLandingY(x, startY, nextY, z, BLOCK) {
    const highestSupportY = Math.floor(startY - 0.5 + 0.00001);
    const lowestSupportY = Math.floor(nextY - 0.5 + 0.00001);
    for (let supportY = highestSupportY; supportY >= lowestSupportY; supportY--) {
        if (isSolidBlock(getBlockAt(x, supportY, z), BLOCK)) return supportY + 1;
    }
    return null;
}
function updateFallingSand(deltaTime) {
    if (!lastScene || fallingSand.size === 0) return;
    const BLOCK = getBlockTypes(), dt = Math.min(Math.max(deltaTime, 0), 0.05);
    for (const [key, entity] of fallingSand) {
        if (!entity.mesh?.parent) { fallingSand.delete(key); continue; }
        entity.velocity = Math.min(entity.velocity + SAND_GRAVITY * dt, SAND_MAX_FALL_SPEED);
        const startY = entity.y, nextY = startY - entity.velocity * dt;
        const landingY = getLandingY(entity.x, startY, nextY, entity.z, BLOCK);
        if (landingY !== null && landingY <= startY) {
            entity.y = landingY; entity.mesh.position.y = landingY; fallingSand.delete(key); disposeDynamicMesh(entity.mesh);
            setBlockFromPhysics(entity.x, landingY, entity.z, BLOCK.SAND); continue;
        }
        entity.y = nextY; entity.mesh.position.y = nextY;
        if (nextY < -60) { fallingSand.delete(key); disposeDynamicMesh(entity.mesh); }
    }
}
function startPhysicsLoop() {
    if (physicsLoopStarted) return;
    physicsLoopStarted = true;
    const loop = time => {
        const deltaTime = Math.min((time - lastPhysicsTime) / 1000, 0.05);
        lastPhysicsTime = time; updateFallingSand(deltaTime); requestAnimationFrame(loop);
    };
    lastPhysicsTime = performance.now(); requestAnimationFrame(loop);
}
function getTarget(scene, camera) {
    camera.updateMatrixWorld(true); raycaster.setFromCamera(CENTER, camera); raycaster.near = 0.01; raycaster.far = INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(scene.children, true);
    const hit = hits.find(entry => {
        if (!entry.object?.userData?.isChunk || !entry.face) return false;
        let object = entry.object;
        while (object) { if (object.userData?.isWater === true) return false; object = object.parent; }
        return true;
    });
    raycaster.near = 0; raycaster.far = Infinity;
    if (!hit || hit.distance > INTERACTION_DISTANCE) return null;
    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone().sub(normal.clone().multiplyScalar(0.01));
    const x = Math.floor(point.x + 0.5), y = Math.floor(point.y + 0.5), z = Math.floor(point.z + 0.5), type = getBlockAt(x, y, z);
    if (!type) return null;
    return { x, y, z, type };
}
function setFlashState(mesh, originalColors, flashState) {
    if (!Array.isArray(mesh.material)) return;
    mesh.material.forEach((material, index) => {
        if (!material?.color) return;
        if (flashState) {
            material.color.setHex(0xffffff);
            if (material.emissive) { material.emissive.setHex(0xffffff); material.emissiveIntensity = 1.15; }
        } else {
            material.color.copy(originalColors[index]);
            if (material.emissive) { material.emissive.setHex(0x000000); material.emissiveIntensity = 0; }
        }
    });
}

function startFuse(scene, x, y, z, broadcastIgnite = true, allowAir = false) {
    const key = makeKey(x, y, z), BLOCK = getBlockTypes();
    if (primed.has(key)) return false;
    const currentType = getBlockAt(x, y, z);
    if (currentType !== BLOCK.TNT && !(allowAir && currentType === BLOCK.AIR)) return false;

    if (currentType === BLOCK.TNT) {
        if (!setBlockAt(x, y, z, BLOCK.AIR)) return false;
        notifyBlockChange(x, y, z, BLOCK.AIR);
        if (broadcastIgnite) sendBlockChange(x, y, z, BLOCK.AIR);
    } else if (!allowAir) return false;

    primed.add(key);
    if (broadcastIgnite) sendTNTIgnite(x, y, z);

    const mesh = createDynamicBlock(scene, x, y, z, tntMaterial, "primedTNT");
    mesh.userData.isPrimedTNT = true;
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffdd55 }));
    marker.position.set(x, y + 0.58, z); scene.add(marker);
    const light = new THREE.PointLight(0xff782e, 1.8, 4);
    light.position.set(x, y + 0.45, z); scene.add(light);
    const originalColors = mesh.userData.originalColors.map(color => color.clone());
    let lastFlashState = false, velocityY = 0, currentY = y, lastTickTime = performance.now();
    const started = performance.now();
    const tick = time => {
        const frameDelta = Math.min(Math.max((time - lastTickTime) / 1000, 0), 0.05);
        lastTickTime = time;
        const age = time - started, progress = Math.min(age / FUSE_MS, 1);
        const flashInterval = THREE.MathUtils.lerp(150, 55, progress);
        const flashState = Math.floor(age / flashInterval) % 2 === 0;
        velocityY = Math.min(velocityY + TNT_GRAVITY * frameDelta, TNT_MAX_FALL_SPEED);
        const nextY = currentY - velocityY * frameDelta;
        const landingY = getLandingY(x, currentY, nextY, z, BLOCK);
        if (landingY !== null && landingY <= currentY) { currentY = landingY; velocityY = 0; } else currentY = nextY;
        mesh.position.y = currentY; marker.position.y = currentY + 0.58; light.position.y = currentY + 0.45;
        marker.visible = flashState; light.intensity = 1.5 + Math.sin(age * 0.06) * 0.9;
        if (flashState !== lastFlashState) { lastFlashState = flashState; setFlashState(mesh, originalColors, flashState); }
        if (age < FUSE_MS) { requestAnimationFrame(tick); return; }
        disposeDynamicMesh(mesh); scene.remove(marker); marker.geometry.dispose(); marker.material.dispose(); scene.remove(light); light.dispose(); primed.delete(key);
        explode(scene, x, Math.round(currentY), z);
    };
    requestAnimationFrame(tick); return true;
}
function makeExplosionEffect(scene, x, y, z) {
    const flash = new THREE.PointLight(0xff9a42, 9, 12); flash.position.set(x, y + 0.5, z); scene.add(flash);
    const particles = [], geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12), start = performance.now();
    for (let i = 0; i < 40; i++) {
        const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x222222 : 0xc46b36, transparent: true, opacity: 1 }));
        particle.position.set(x, y + 0.5, z); particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 7, 2 + Math.random() * 7, (Math.random() - 0.5) * 7); scene.add(particle); particles.push(particle);
    }
    const update = time => {
        const age = time - start; flash.intensity = Math.max(0, 9 * (1 - age / 220));
        if (age >= 650) {
            for (const particle of particles) { if (!particle.parent) continue; particle.parent.remove(particle); particle.material.dispose(); }
            scene.remove(flash); flash.dispose(); geometry.dispose(); return;
        }
        for (const particle of particles) { particle.userData.velocity.y -= 11 / 60; particle.position.addScaledVector(particle.userData.velocity, 1 / 60); particle.rotation.x += 0.18; particle.rotation.y += 0.14; particle.material.opacity = Math.max(0, 1 - age / 650); }
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}
function explode(scene, cx, cy, cz) {
    const BLOCK = getBlockTypes();
    for (let x = Math.floor(cx - EXPLOSION_RADIUS); x <= Math.floor(cx + EXPLOSION_RADIUS); x++) {
        for (let y = Math.floor(cy - EXPLOSION_RADIUS); y <= Math.floor(cy + EXPLOSION_RADIUS); y++) {
            for (let z = Math.floor(cz - EXPLOSION_RADIUS); z <= Math.floor(cz + EXPLOSION_RADIUS); z++) {
                const distance = Math.hypot(x - cx, y - cy, z - cz); if (distance > EXPLOSION_RADIUS) continue;
                const type = getBlockAt(x, y, z); if (!type || type === BLOCK.AIR || type === BLOCK.BEDROCK) continue;
                if (type === BLOCK.TNT && !(x === cx && y === cy && z === cz)) {
                    const delay = 100 + Math.random() * 300; setTimeout(() => startFuse(scene, x, y, z), delay); continue;
                }
                const resistance = distance / EXPLOSION_RADIUS, chance = 0.97 - resistance * 0.42; if (Math.random() > chance) continue;
                if (setBlockAt(x, y, z, BLOCK.AIR)) { sendBlockChange(x, y, z, BLOCK.AIR); notifyBlockChange(x, y, z, BLOCK.AIR); }
            }
        }
    }
    makeExplosionEffect(scene, cx, cy, cz);
}

window.addEventListener("webminecraft:tntignite", event => {
    if (!lastScene) return;
    const x = Number(event.detail?.x), y = Number(event.detail?.y), z = Number(event.detail?.z);
    if (![x, y, z].every(Number.isFinite)) return;
    startFuse(lastScene, Math.floor(x), Math.floor(y), Math.floor(z), false, true);
});
window.addEventListener("webminecraft:blockchange", event => { if (lastScene) processBlockChangeForPhysics(lastScene, event.detail); });

export function tryIgniteTNT(scene, camera, itemId) {
    lastScene = scene; startPhysicsLoop();
    if (itemId !== FLINT_AND_STEEL_ITEM_ID) return false;
    const BLOCK = getBlockTypes(), target = getTarget(scene, camera);
    if (!target || target.type !== BLOCK.TNT) return false;
    return startFuse(scene, target.x, target.y, target.z, true, false);
}
export function updateTNTPhysics(scene, deltaTime) { lastScene = scene; updateFallingSand(deltaTime); }
export function registerTNTPhysicsScene(scene) { lastScene = scene; startPhysicsLoop(); }
