import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange, sendPlayerAction } from "./multiplayerClient.js";
import { handleDoorTarget } from "./door.js";
import { isSurvivalWorld } from "./survivalMode.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const RANGE = 5;
const MAX_DROP_DISTANCE = 2.5;
const PICKUP_RANGE = 2.5;
const DROP_DESPAWN_MS = 5 * 60 * 1000;
const DROP_GRAVITY = 18;
const DROP_HALF_SIZE = 0.125;
const MIN_DROP_Y = -64;

let sceneRef = null;
let cameraRef = null;
let mining = null;
let initialized = false;
let lastDropUpdateTime = 0;
const drops = [];

const HARDNESS = {
    1: 700, 2: 430, 3: 1050, 4: 380, 5: 900, 6: 280, 7: 1050,
    8: 420, 9: 900, 10: Infinity, 11: 1200, 12: 1250, 13: 750, 14: 300, 15: 800
};

const TEXTURES = {
    1: "Grass_Block_(top_texture)_JE2.png", 2: "dirt.png", 3: "stone.png", 4: "sand.png",
    5: "oak_log_top.png", 6: "oak-leaves-normal-original-default.png", 7: "cobblestone.png",
    8: "gravel.png", 9: "sandstone.png", 10: "bedrock.png", 11: "coal_ore.png",
    12: "iron_ore.png", 13: "oak_planks.png", 14: "snow.png", 15: "tnt_side.png"
};

const COLORS = {
    1: 0x73a83f, 2: 0x8c5e3c, 3: 0x8c8c8c, 4: 0xd9c28b, 5: 0x8f6238,
    6: 0x3e8a3c, 7: 0x777777, 8: 0x8d806d, 9: 0xd5bd8d, 10: 0x4b4b4b,
    11: 0x343434, 12: 0x929292, 13: 0xb68752, 14: 0xf1f7ff, 15: 0xd73636
};

function textureUrl(name) {
    return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`;
}

function getTarget() {
    if (!sceneRef || !cameraRef) return null;
    cameraRef.updateMatrixWorld(true);
    raycaster.setFromCamera(CENTER, cameraRef);
    raycaster.near = 0.01;
    raycaster.far = RANGE;
    const hits = raycaster.intersectObjects(sceneRef.children, true);
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
    if (!hit) return null;
    const normal = hit.face.normal.clone().normalize();
    const p = hit.point;
    const x = Math.floor(p.x - normal.x * 0.01 + 0.5);
    const y = Math.floor(p.y - normal.y * 0.01 + 0.5);
    const z = Math.floor(p.z - normal.z * 0.01 + 0.5);
    const type = getBlockAt(x, y, z);
    if (!type || type === getBlockTypes().AIR) return null;
    return { x, y, z, type, normal };
}

function crackMap(stage) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = "rgba(0,0,0,.96)";
    ctx.lineWidth = 4;
    ctx.lineCap = "square";
    const paths = [
        [[64,63],[51,49],[56,30],[43,15]], [[64,63],[78,49],[71,32],[87,19]],
        [[64,63],[47,69],[29,63],[14,73]], [[64,63],[78,71],[95,66],[113,79]],
        [[64,63],[60,80],[50,98],[43,114]], [[64,63],[72,78],[84,97],[90,114]],
        [[64,63],[58,51],[40,41],[24,38]], [[64,63],[73,53],[91,43],[108,46]]
    ];
    const count = Math.min(paths.length, 1 + stage * 2);
    for (let i = 0; i < count; i++) {
        const path = paths[i];
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let p = 1; p < path.length; p++) ctx.lineTo(path[p][0], path[p][1]);
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createCracks(target) {
    const group = new THREE.Group();
    group.name = "survivalMiningCracks";
    group.position.set(target.x, target.y, target.z);
    const geometry = new THREE.PlaneGeometry(.995, .995);
    const stages = [];
    const faces = [
        { normal: new THREE.Vector3(1, 0, 0) }, { normal: new THREE.Vector3(-1, 0, 0) },
        { normal: new THREE.Vector3(0, 1, 0) }, { normal: new THREE.Vector3(0, -1, 0) },
        { normal: new THREE.Vector3(0, 0, 1) }, { normal: new THREE.Vector3(0, 0, -1) }
    ];
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex++) {
        const normal = faces[faceIndex].normal;
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        for (let stage = 0; stage < 5; stage++) {
            const material = new THREE.MeshBasicMaterial({ map: crackMap(stage), transparent: true, depthTest: false, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);
            plane.quaternion.copy(quaternion);
            plane.position.copy(normal).multiplyScalar(0.508);
            plane.visible = false;
            plane.renderOrder = 1200;
            group.add(plane);
            stages.push({ mesh: plane, faceIndex, stage });
        }
    }
    sceneRef.add(group);
    return { group, stages };
}

function updateCracks(overlay, progress) {
    const stage = Math.min(4, Math.floor(Math.max(0, progress) * 5));
    for (const entry of overlay.stages) entry.mesh.visible = entry.stage === stage;
}

function destroyCracks(overlay) {
    if (!overlay) return;
    sceneRef?.remove(overlay.group);
    const materials = new Set();
    for (const entry of overlay.stages) if (entry.mesh.material) materials.add(entry.mesh.material);
    for (const material of materials) { material.map?.dispose(); material.dispose(); }
    overlay.group.clear();
}

function burst(center, type) {
    const geometry = new THREE.BoxGeometry(.07, .07, .07);
    const particles = [];
    const start = performance.now();
    for (let i = 0; i < 8; i++) {
        const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: COLORS[type] ?? 0xaaaaaa, transparent: true }));
        particle.position.copy(center).add(new THREE.Vector3((Math.random() - .5) * .65, (Math.random() - .5) * .65, (Math.random() - .5) * .65));
        particle.userData.velocity = new THREE.Vector3((Math.random() - .5) * 2.1, .9 + Math.random() * 1.8, (Math.random() - .5) * 2.1);
        particle.userData.start = start;
        sceneRef.add(particle);
        particles.push(particle);
    }
    function tick(time) {
        let alive = false;
        for (const particle of particles) {
            if (!particle.parent) continue;
            const age = time - particle.userData.start;
            if (age >= 450) { particle.parent.remove(particle); particle.material.dispose(); continue; }
            alive = true;
            particle.userData.velocity.y -= .085;
            particle.position.addScaledVector(particle.userData.velocity, .016);
            particle.rotation.x += .1;
            particle.rotation.y += .08;
            particle.material.opacity = 1 - age / 450;
        }
        if (alive) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function createDrop(type, position) {
    const group = new THREE.Group();
    group.name = "survivalDroppedItem";
    group.userData.type = type;
    group.userData.count = 1;
    group.userData.spawnedAt = performance.now();
    group.userData.bob = Math.random() * Math.PI * 2;
    group.userData.velocityY = 1.2;
    group.userData.grounded = false;

    const textureName = TEXTURES[type];
    let material;
    if (textureName) {
        const texture = new THREE.TextureLoader().load(textureUrl(textureName));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        material = new THREE.MeshLambertMaterial({ map: texture });
    } else material = new THREE.MeshLambertMaterial({ color: COLORS[type] ?? 0xaaaaaa });

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25), material);
    mesh.userData.isDroppedItem = true;
    group.add(mesh);
    group.position.copy(position).add(new THREE.Vector3(0, .28, 0));
    sceneRef.add(group);
    drops.push(group);
}

function mergeDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        const a = drops[i];
        if (!a.parent) { drops.splice(i, 1); continue; }
        for (let j = i - 1; j >= 0; j--) {
            const b = drops[j];
            if (!b.parent || a.userData.type !== b.userData.type || a.position.distanceTo(b.position) > .7) continue;
            b.userData.count += a.userData.count;
            a.parent.remove(a);
            drops.splice(i, 1);
            break;
        }
    }
}

function addToInventory(type, count) {
    try {
        const raw = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        const inv = Array.isArray(raw) && raw.length === 36 ? raw : Array.from({ length: 36 }, () => null);
        let left = count;
        for (const slot of inv) {
            if (slot?.itemId === type && Number(slot.count) < 64) {
                const add = Math.min(left, 64 - Number(slot.count));
                slot.count = Number(slot.count) + add;
                left -= add;
                if (!left) break;
            }
        }
        for (let i = 0; i < inv.length && left; i++) {
            if (!inv[i]) {
                const add = Math.min(left, 64);
                inv[i] = { itemId: type, count: add };
                left -= add;
            }
        }
        localStorage.setItem("webminecraft_inventory", JSON.stringify(inv));
        window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
        return left === 0;
    } catch { return false; }
}

function refreshHotbarTextures() {
    const hotbar = document.getElementById("hotbar");
    if (!hotbar) return;
    const slots = hotbar.querySelectorAll(".slot");
    let inv = [];
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        inv = Array.isArray(saved) && saved.length >= 9 ? saved : Array.from({ length: 36 }, () => null);
    } catch { inv = Array.from({ length: 36 }, () => null); }
    slots.forEach((slot, index) => {
        let icon = slot.querySelector(".hotbarTexture");
        if (!icon) {
            icon = document.createElement("span");
            icon.className = "hotbarTexture";
            slot.appendChild(icon);
        }
        const item = inv[index];
        const texture = item?.itemId != null ? TEXTURES[item.itemId] : null;
        if (texture && item?.count > 0) {
            icon.style.backgroundImage = `url("${textureUrl(texture)}")`;
            icon.style.display = "block";
            slot.dataset.itemId = String(item.itemId);
            let countNode = slot.querySelector(".hotbarCount");
            if (!countNode) { countNode = document.createElement("span"); countNode.className = "hotbarCount"; slot.appendChild(countNode); }
            countNode.textContent = item.count > 1 ? String(item.count) : "";
        } else {
            icon.style.backgroundImage = "none";
            icon.style.display = "none";
            delete slot.dataset.itemId;
            slot.querySelector(".hotbarCount")?.remove();
        }
    });
}

function updateDrops(time) {
    if (!sceneRef || !cameraRef || !isSurvivalWorld()) return;
    mergeDrops();
    const player = cameraRef.position;
    const dt = lastDropUpdateTime > 0 ? Math.min(.05, Math.max(.001, (time - lastDropUpdateTime) / 1000)) : .016;
    lastDropUpdateTime = time;
    for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop.parent) { drops.splice(i, 1); continue; }
        if (time - drop.userData.spawnedAt >= DROP_DESPAWN_MS) { drop.parent.remove(drop); drops.splice(i, 1); continue; }

        if (!drop.userData.grounded) {
            drop.userData.velocityY -= DROP_GRAVITY * dt;
            const nextY = drop.position.y + drop.userData.velocityY * dt;
            const blockX = Math.floor(drop.position.x + .5);
            const blockZ = Math.floor(drop.position.z + .5);
            let supportY = null;
            const startY = Math.floor(nextY - DROP_HALF_SIZE + .5);
            for (let y = startY; y >= MIN_DROP_Y; y--) {
                const block = getBlockAt(blockX, y, blockZ);
                if (block && block !== getBlockTypes().AIR) { supportY = y; break; }
            }
            if (supportY !== null && nextY - DROP_HALF_SIZE <= supportY + .5) {
                drop.position.y = supportY + .5 + DROP_HALF_SIZE;
                drop.userData.velocityY = 0;
                drop.userData.grounded = true;
            } else {
                drop.position.y = nextY;
                if (drop.position.y < MIN_DROP_Y) drop.position.y = MIN_DROP_Y;
            }
        } else {
            const baseY = drop.userData.baseY ?? (drop.userData.baseY = drop.position.y);
            drop.position.y = baseY + Math.sin(time * .003 + drop.userData.bob) * .045;
        }

        drop.rotation.y += .018;
        const distance = drop.position.distanceTo(player);
        if (distance <= MAX_DROP_DISTANCE) {
            const direction = player.clone().sub(drop.position);
            const strength = Math.min(.24, Math.max(.055, (MAX_DROP_DISTANCE - distance) * .11));
            if (direction.lengthSq() > 0.0001) drop.position.addScaledVector(direction.normalize(), strength);
        }
        if (drop.position.distanceTo(player) <= PICKUP_RANGE) {
            if (addToInventory(drop.userData.type, drop.userData.count)) {
                drop.parent.remove(drop);
                drops.splice(i, 1);
                refreshHotbarTextures();
            }
        }
    }
}

export function startSurvivalMining(scene, camera) {
    if (scene) sceneRef = scene;
    if (camera) cameraRef = camera;
    if (!isSurvivalWorld() || !document.body.classList.contains("webminecraft-in-world") || mining) return;
    if (handleDoorTarget("break")) { sendPlayerAction("mine"); return; }
    const target = getTarget();
    if (!target) return;
    const duration = HARDNESS[target.type] ?? 700;
    if (!Number.isFinite(duration)) return;
    mining = { ...target, started: performance.now(), duration, overlay: createCracks(target) };
    updateCracks(mining.overlay, .01);
    sendPlayerAction("mine");
}

function cancelMining() {
    if (!mining) return;
    destroyCracks(mining.overlay);
    mining = null;
}

function finishMining() {
    if (!mining) return;
    if (getBlockAt(mining.x, mining.y, mining.z) !== mining.type) { cancelMining(); return; }
    if (!setBlockAt(mining.x, mining.y, mining.z, getBlockTypes().AIR)) { cancelMining(); return; }
    sendBlockChange(mining.x, mining.y, mining.z, getBlockTypes().AIR);
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x: mining.x, y: mining.y, z: mining.z, type: getBlockTypes().AIR, brokenType: mining.type } }));
    burst(new THREE.Vector3(mining.x, mining.y, mining.z), mining.type);
    createDrop(mining.type, new THREE.Vector3(mining.x, mining.y, mining.z));
    destroyCracks(mining.overlay);
    mining = null;
}

function tickMining(time, held) {
    if (!mining) return;
    if (!held) { cancelMining(); return; }
    const target = getTarget();
    if (!target || target.x !== mining.x || target.y !== mining.y || target.z !== mining.z) { cancelMining(); return; }
    const progress = Math.min(1, (time - mining.started) / mining.duration);
    updateCracks(mining.overlay, progress);
    if (progress >= 1) finishMining();
}

function init() {
    if (initialized) return;
    initialized = true;
    document.addEventListener("mousedown", event => {
        if (!isSurvivalWorld() || !document.body.classList.contains("webminecraft-in-world") || document.body.classList.contains("mobile-mode")) return;
        if (event.button !== 0) return;
        if (event.target instanceof Element && event.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        startSurvivalMining(sceneRef, cameraRef);
    }, true);
    document.addEventListener("mouseup", event => { if (event.button === 0) cancelMining(); }, true);
    window.addEventListener("blur", cancelMining);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelMining(); });
    function frame(time) {
        const mobile = document.body.classList.contains("mobile-mode");
        const held = mobile ? !!touchInput.punchPressed : !!mining;
        if (mobile && held && !mining) startSurvivalMining(sceneRef, cameraRef);
        tickMining(time, held);
        updateDrops(time);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

export function setMiningContext(scene, camera) { sceneRef = scene || sceneRef; cameraRef = camera || cameraRef; }

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
