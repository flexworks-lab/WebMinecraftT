import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { sendBlockChange } from "./multiplayerClient.js";
import { blockGeometry, tntMaterial } from "./blocks.js";

const FLINT_AND_STEEL_ITEM_ID = 16;
const FUSE_MS = 2500;
const EXPLOSION_RADIUS = 4;
const INTERACTION_DISTANCE = 5;
const TNT_GRAVITY = 22;
const TNT_MAX_FALL_SPEED = 28;

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const primed = new Set();
const fallingTNT = new Map();
let suppressPhysicsBlockEvent = false;
let lastScene = null;

function makeKey(x, y, z) {
    return `${x},${y},${z}`;
}

function notifyBlockChange(x, y, z, type) {
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", {
        detail: { x, y, z, type }
    }));
}

function isSolidBlock(type, BLOCK = getBlockTypes()) {
    return !!type && type !== BLOCK.AIR && type !== BLOCK.WATER;
}

function setBlockFromPhysics(x, y, z, type) {
    suppressPhysicsBlockEvent = true;
    try {
        if (!setBlockAt(x, y, z, type)) return false;
        sendBlockChange(x, y, z, type);
        notifyBlockChange(x, y, z, type);
        return true;
    } finally {
        suppressPhysicsBlockEvent = false;
    }
}

function cloneTNTMaterials() {
    return tntMaterial.map(material => material.clone());
}

function setTNTFlash(mesh, white) {
    if (!Array.isArray(mesh.material)) return;
    for (const material of mesh.material) {
        if (!material?.color) continue;
        material.color.setHex(white ? 0xffffff : 0xffffff);
        if (material.emissive) {
            material.emissive.setHex(white ? 0xffffff : 0x000000);
            material.emissiveIntensity = white ? 1.2 : 0;
        }
    }
    mesh.material.forEach((material, index) => {
        const original = mesh.userData.originalColors?.[index];
        if (!white && original !== undefined && material?.color) material.color.copy(original);
    });
}

function createDynamicTNT(scene, x, y, z) {
    const materials = cloneTNTMaterials();
    const mesh = new THREE.Mesh(blockGeometry, materials);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isDynamicTNT = true;
    mesh.userData.originalColors = materials.map(material => material.color.clone());
    scene.add(mesh);
    return mesh;
}

function removeFallingTNT(key, disposeMaterials = true) {
    const entity = fallingTNT.get(key);
    if (!entity) return null;
    fallingTNT.delete(key);
    if (entity.mesh?.parent) entity.mesh.parent.remove(entity.mesh);
    if (disposeMaterials && Array.isArray(entity.mesh?.material)) {
        for (const material of entity.mesh.material) material.dispose();
    }
    return entity;
}

function activateFallingTNT(scene, x, y, z) {
    const key = makeKey(x, y, z);
    if (primed.has(key) || fallingTNT.has(key)) return false;
    const BLOCK = getBlockTypes();
    if (getBlockAt(x, y, z) !== BLOCK.TNT) return false;

    const below = getBlockAt(x, y - 1, z);
    if (isSolidBlock(below, BLOCK)) return false;

    const mesh = createDynamicTNT(scene, x, y, z);
    fallingTNT.set(key, {
        x,
        z,
        y,
        velocity: 0,
        mesh
    });

    if (!setBlockFromPhysics(x, y, z, BLOCK.AIR)) {
        removeFallingTNT(key);
        return false;
    }
    return true;
}

function tryTrackTNTAt(scene, x, y, z) {
    if (!scene) return;
    if (getBlockAt(x, y, z) !== getBlockTypes().TNT) return;
    activateFallingTNT(scene, x, y, z);
}

function processBlockChangeForTNT(scene, detail) {
    if (suppressPhysicsBlockEvent || !scene || !detail) return;
    const { x, y, z, type } = detail;
    const BLOCK = getBlockTypes();

    if (type === BLOCK.TNT) {
        activateFallingTNT(scene, x, y, z);
        return;
    }

    if (type === BLOCK.AIR) {
        tryTrackTNTAt(scene, x, y + 1, z);
        tryTrackTNTAt(scene, x, y + 2, z);

        for (const [key, entity] of fallingTNT) {
            if (entity.x === x && entity.z === z && entity.y <= y + 1) {
                const current = getBlockAt(entity.x, Math.floor(entity.y + 0.5), entity.z);
                if (current !== BLOCK.TNT) removeFallingTNT(key);
            }
        }
    }
}

function updateFallingTNT(deltaTime) {
    if (!lastScene || fallingTNT.size === 0) return;
    const BLOCK = getBlockTypes();
    const dt = Math.min(Math.max(deltaTime, 0), 0.05);

    for (const [key, entity] of fallingTNT) {
        if (!entity.mesh?.parent) {
            fallingTNT.delete(key);
            continue;
        }

        entity.velocity = Math.min(entity.velocity + TNT_GRAVITY * dt, TNT_MAX_FALL_SPEED);
        const startY = entity.y;
        const nextY = startY - entity.velocity * dt;
        const highestSupportY = Math.floor(startY - 0.5 + 0.00001);
        const lowestSupportY = Math.floor(nextY - 0.5 + 0.00001);
        let landingY = null;

        for (let supportY = highestSupportY; supportY >= lowestSupportY; supportY--) {
            const supportType = getBlockAt(entity.x, supportY, entity.z);
            if (isSolidBlock(supportType, BLOCK)) {
                landingY = supportY + 1;
                break;
            }
        }

        if (landingY !== null && landingY <= startY) {
            entity.y = landingY;
            entity.mesh.position.y = landingY;
            fallingTNT.delete(key);
            entity.mesh.parent.remove(entity.mesh);
            if (Array.isArray(entity.mesh.material)) {
                for (const material of entity.mesh.material) material.dispose();
            }
            setBlockFromPhysics(entity.x, landingY, entity.z, BLOCK.TNT);
            continue;
        }

        entity.y = nextY;
        entity.mesh.position.y = nextY;
    }
}

function getTarget(scene, camera) {
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(CENTER, camera);
    raycaster.near = 0.01;
    raycaster.far = INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(scene.children, true);
    const hit = hits.find(entry => {
        if (!entry.object?.userData?.isChunk || !entry.face) return false;
        let object = entry.object;
        while (object) {
            if (object.userData?.isWater === true) return false;
            object = object.parent;
        }
        return true;
    });
    raycaster.near = 0;
    raycaster.far = Infinity;
    if (!hit || hit.distance > INTERACTION_DISTANCE) return null;

    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone().sub(normal.clone().multiplyScalar(0.01));
    const x = Math.floor(point.x + 0.5);
    const y = Math.floor(point.y + 0.5);
    const z = Math.floor(point.z + 0.5);
    const type = getBlockAt(x, y, z);
    if (!type) return null;
    return { x, y, z, type };
}

function startFuse(scene, x, y, z) {
    const key = makeKey(x, y, z);
    const BLOCK = getBlockTypes();
    if (primed.has(key)) return false;

    const staticTNT = getBlockAt(x, y, z) === BLOCK.TNT;
    const fallingKey = [...fallingTNT.entries()].find(([, entity]) => entity.x === x && entity.y === y && entity.z === z)?.[0];
    if (!staticTNT && !fallingKey) return false;

    if (fallingKey) removeFallingTNT(fallingKey);
    else if (!setBlockAt(x, y, z, BLOCK.AIR)) return false;

    notifyBlockChange(x, y, z, BLOCK.AIR);
    primed.add(key);

    const mesh = createDynamicTNT(scene, x, y, z);
    mesh.userData.isPrimedTNT = true;

    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd55 })
    );
    marker.position.set(x, y + 0.58, z);
    scene.add(marker);

    const light = new THREE.PointLight(0xff782e, 1.8, 4);
    light.position.set(x, y + 0.45, z);
    scene.add(light);

    const originalColors = mesh.userData.originalColors.map(color => color.clone());
    let lastFlashState = false;
    const started = performance.now();

    const tick = time => {
        const age = time - started;
        const progress = Math.min(age / FUSE_MS, 1);
        const flashInterval = THREE.MathUtils.lerp(150, 55, progress);
        const flashState = Math.floor(age / flashInterval) % 2 === 0;

        marker.visible = flashState;
        light.intensity = 1.5 + Math.sin(age * 0.06) * 0.9;

        if (flashState !== lastFlashState) {
            lastFlashState = flashState;
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((material, index) => {
                    if (!material?.color) return;
                    if (flashState) {
                        material.color.setHex(0xffffff);
                        if (material.emissive) {
                            material.emissive.setHex(0xffffff);
                            material.emissiveIntensity = 1.15;
                        }
                    } else {
                        material.color.copy(originalColors[index]);
                        if (material.emissive) {
                            material.emissive.setHex(0x000000);
                            material.emissiveIntensity = 0;
                        }
                    }
                });
            }
        }

        if (age < FUSE_MS) {
            requestAnimationFrame(tick);
            return;
        }

        scene.remove(mesh);
        if (Array.isArray(mesh.material)) {
            for (const material of mesh.material) material.dispose();
        }
        scene.remove(marker);
        marker.geometry.dispose();
        marker.material.dispose();
        scene.remove(light);
        light.dispose();
        primed.delete(key);
        explode(scene, x, y, z);
    };

    requestAnimationFrame(tick);
    return true;
}

function makeExplosionEffect(scene, x, y, z) {
    const flash = new THREE.PointLight(0xff9a42, 9, 12);
    flash.position.set(x, y + 0.5, z);
    scene.add(flash);

    const particles = [];
    const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const start = performance.now();

    for (let i = 0; i < 40; i++) {
        const particle = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x222222 : 0xc46b36,
                transparent: true,
                opacity: 1
            })
        );
        particle.position.set(x, y + 0.5, z);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 7,
            2 + Math.random() * 7,
            (Math.random() - 0.5) * 7
        );
        scene.add(particle);
        particles.push(particle);
    }

    const update = time => {
        const age = time - start;
        flash.intensity = Math.max(0, 9 * (1 - age / 220));

        if (age >= 650) {
            for (const particle of particles) {
                if (!particle.parent) continue;
                particle.parent.remove(particle);
                particle.material.dispose();
            }
            scene.remove(flash);
            flash.dispose();
            geometry.dispose();
            return;
        }

        for (const particle of particles) {
            particle.userData.velocity.y -= 11 / 60;
            particle.position.addScaledVector(particle.userData.velocity, 1 / 60);
            particle.rotation.x += 0.18;
            particle.rotation.y += 0.14;
            particle.material.opacity = Math.max(0, 1 - age / 650);
        }
        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
}

function explode(scene, cx, cy, cz) {
    const BLOCK = getBlockTypes();

    for (let x = Math.floor(cx - EXPLOSION_RADIUS); x <= Math.floor(cx + EXPLOSION_RADIUS); x++) {
        for (let y = Math.floor(cy - EXPLOSION_RADIUS); y <= Math.floor(cy + EXPLOSION_RADIUS); y++) {
            for (let z = Math.floor(cz - EXPLOSION_RADIUS); z <= Math.floor(cz + EXPLOSION_RADIUS); z++) {
                const distance = Math.hypot(x - cx, y - cy, z - cz);
                if (distance > EXPLOSION_RADIUS) continue;

                const type = getBlockAt(x, y, z);
                if (!type || type === BLOCK.AIR || type === BLOCK.BEDROCK) continue;

                if (type === BLOCK.TNT && !(x === cx && y === cy && z === cz)) {
                    const delay = 100 + Math.random() * 300;
                    setTimeout(() => startFuse(scene, x, y, z), delay);
                    continue;
                }

                const resistance = distance / EXPLOSION_RADIUS;
                const chance = 0.97 - resistance * 0.42;
                if (Math.random() > chance) continue;

                if (setBlockAt(x, y, z, BLOCK.AIR)) {
                    sendBlockChange(x, y, z, BLOCK.AIR);
                    notifyBlockChange(x, y, z, BLOCK.AIR);
                }
            }
        }
    }

    makeExplosionEffect(scene, cx, cy, cz);
}

window.addEventListener("webminecraft:blockchange", event => {
    if (!lastScene) return;
    processBlockChangeForTNT(lastScene, event.detail);
});

export function tryIgniteTNT(scene, camera, itemId) {
    lastScene = scene;
    if (itemId !== FLINT_AND_STEEL_ITEM_ID) return false;
    const BLOCK = getBlockTypes();
    const target = getTarget(scene, camera);
    if (!target || target.type !== BLOCK.TNT) return false;
    return startFuse(scene, target.x, target.y, target.z);
}

export function updateTNTPhysics(scene, deltaTime) {
    lastScene = scene;
    updateFallingTNT(deltaTime);
}

export function registerTNTPhysicsScene(scene) {
    lastScene = scene;
}
