import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { sendBlockChange, sendPlayerAction } from "./multiplayerClient.js";
import { handleDoorTarget } from "./door.js";
import { isSurvivalWorld } from "./survivalMode.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const RANGE = 5;
const MAX_DROP_DISTANCE = 2.25;
const DROP_DESPAWN_MS = 5 * 60 * 1000;

let sceneRef = null;
let cameraRef = null;
let mining = null;
let capturedTargetType = null;
const drops = [];
let initialized = false;

const DROP_TEXTURES = {
    1: "Grass_Block_(top_texture)_JE2.png",
    2: "dirt.png",
    3: "stone.png",
    4: "sand.png",
    5: "oak_log_top.png",
    6: "oak-leaves-normal-original-default.png",
    7: "cobblestone.png",
    8: "dirt.png",
    9: "sand.png",
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: "tnt_side.png"
};

const HARDNESS_MS = {
    1: 700, 2: 430, 3: 1050, 4: 380, 5: 900, 6: 280, 7: 1050,
    8: 420, 9: 900, 10: Infinity, 11: 1200, 12: 1250, 13: 750, 14: 300, 15: 800
};

function textureUrl(name) {
    return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`;
}

function installStyles() {
    if (document.getElementById("survivalMiningStyles")) return;
    const style = document.createElement("style");
    style.id = "survivalMiningStyles";
    style.textContent = `
#survivalMiningHud{position:fixed;left:50%;top:calc(50% + 24px);transform:translateX(-50%);z-index:9997;display:none;pointer-events:none;min-width:150px;padding:4px 7px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.28);border-radius:4px;text-align:center;font:700 10px Arial,sans-serif;color:#fff;text-shadow:1px 1px #000}
body.webminecraft-survival.webminecraft-in-world #survivalMiningHud.active{display:block}
`;
    document.head.appendChild(style);
    const hud = document.createElement("div");
    hud.id = "survivalMiningHud";
    hud.textContent = "Breaking…";
    document.body.appendChild(hud);
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
    if (!hit || hit.distance > RANGE) return null;
    const normal = hit.face.normal.clone().normalize();
    const p = hit.point.clone();
    const x = Math.floor(p.x - normal.x * 0.01 + 0.5);
    const y = Math.floor(p.y - normal.y * 0.01 + 0.5);
    const z = Math.floor(p.z - normal.z * 0.01 + 0.5);
    const type = getBlockAt(x, y, z);
    if (!type) return null;
    return { x, y, z, type, normal };
}

function crackTexture(stage) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 128, 128);
    ctx.strokeStyle = "rgba(8,8,8,.96)";
    ctx.lineWidth = 4;
    ctx.lineCap = "square";
    const center = { x: 64, y: 63 };
    const branches = [
        [[64,63],[51,48],[56,31],[43,17]],
        [[64,63],[76,50],[70,35],[84,20]],
        [[64,63],[47,69],[29,63],[14,72]],
        [[64,63],[77,70],[94,67],[113,79]],
        [[64,63],[60,78],[51,96],[43,113]],
        [[64,63],[71,77],[82,94],[89,113]],
        [[64,63],[59,51],[41,42],[26,39]],
        [[64,63],[72,53],[90,43],[106,45]]
    ];
    const count = Math.min(branches.length, 1 + stage * 2);
    for (let i = 0; i < count; i++) {
        const points = branches[i];
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let j = 1; j < points.length; j++) {
            ctx.lineTo(points[j][0], points[j][1]);
        }
        ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function addCrackOverlay(target) {
    const group = new THREE.Group();
    group.name = "survivalCrackOverlay";
    group.position.set(target.x, target.y, target.z);
    const normal = target.normal.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    group.quaternion.copy(quaternion);
    const geometry = new THREE.PlaneGeometry(0.99, 0.99);
    const stages = [];
    for (let i = 0; i < 5; i++) {
        const map = crackTexture(i);
        const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.z = 0.506;
        plane.visible = false;
        plane.renderOrder = 1100;
        group.add(plane);
        stages.push(plane);
    }
    sceneRef.add(group);
    return { group, stages };
}

function setCrackStage(overlay, progress) {
    const stage = Math.min(4, Math.max(0, Math.floor(progress * 5)));
    overlay.stages.forEach((mesh, index) => mesh.visible = index === stage);
    const hud = document.getElementById("survivalMiningHud");
    if (hud) hud.textContent = `Breaking… ${Math.round(progress * 100)}%`;
}

function removeCrackOverlay(overlay) {
    if (!overlay?.group) return;
    sceneRef?.remove(overlay.group);
    overlay.stages.forEach(mesh => {
        mesh.material.map?.dispose();
        mesh.material.dispose();
    });
    overlay.group.children.length = 0;
}

function particleColor(type) {
    const colors = { 1: 0x72a83b, 2: 0x8b5a3a, 3: 0x8e8e8e, 4: 0xd8c085, 5: 0x8d5d35, 6: 0x3f8d3a, 7: 0x777777, 8: 0x8c816e, 9: 0xd6bf8f, 10: 0x4b4b4b, 11: 0x343434, 12: 0x969696, 13: 0xb88b55, 14: 0xf1f7ff, 15: 0xd73535 };
    return colors[type] ?? 0xaaaaaa;
}

function createBreakParticles(center, type) {
    const geometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
    const particles = [];
    const start = performance.now();
    for (let i = 0; i < 8; i++) {
        const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: particleColor(type), transparent: true }));
        particle.position.copy(center).add(new THREE.Vector3((Math.random() - .5) * .7, (Math.random() - .5) * .7, (Math.random() - .5) * .7));
        particle.userData.velocity = new THREE.Vector3((Math.random() - .5) * 2.2, .8 + Math.random() * 2, (Math.random() - .5) * 2.2);
        particle.userData.start = start;
        sceneRef.add(particle);
        particles.push(particle);
    }
    function tick(now) {
        let alive = false;
        for (const p of particles) {
            if (!p.parent) continue;
            const age = now - p.userData.start;
            if (age > 450) {
                p.parent.remove(p);
                p.material.dispose();
                continue;
            }
            alive = true;
            p.userData.velocity.y -= 0.085;
            p.position.addScaledVector(p.userData.velocity, 0.016);
            p.rotation.x += .11;
            p.rotation.y += .09;
            p.material.opacity = 1 - age / 450;
        }
        if (alive) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function createDrop(type, position) {
    const group = new THREE.Group();
    group.name = "survivalDroppedItem";
    group.userData = { type, count: 1, spawnedAt: performance.now(), mergeKey: String(type), bobOffset: Math.random() * Math.PI * 2 };
    const textureName = DROP_TEXTURES[type];
    let material;
    if (textureName) {
        const texture = new THREE.TextureLoader().load(textureUrl(textureName));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        material = new THREE.MeshLambertMaterial({ map: texture });
    } else {
        material = new THREE.MeshLambertMaterial({ color: particleColor(type) });
    }
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25), [material, material, material, material, material, material]);
    mesh.userData.isDroppedItem = true;
    group.add(mesh);
    group.position.copy(position).add(new THREE.Vector3(0, .25, 0));
    sceneRef.add(group);
    drops.push(group);
}

function mergeDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        const a = drops[i];
        if (!a.parent) { drops.splice(i, 1); continue; }
        for (let j = i - 1; j >= 0; j--) {
            const b = drops[j];
            if (!b.parent) continue;
            if (a.userData.mergeKey !== b.userData.mergeKey) continue;
            if (a.position.distanceTo(b.position) > .65) continue;
            b.userData.count += a.userData.count;
            a.parent.remove(a);
            drops.splice(i, 1);
            break;
        }
    }
}

function addToStoredInventory(type, count) {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        const inv = Array.isArray(saved) && saved.length === 36 ? saved : Array.from({ length: 36 }, () => null);
        let left = count;
        for (let i = 0; i < inv.length && left > 0; i++) {
            if (inv[i]?.itemId === type && Number(inv[i].count) < 64) {
                const add = Math.min(left, 64 - Number(inv[i].count));
                inv[i].count = Number(inv[i].count) + add;
                left -= add;
            }
        }
        for (let i = 0; i < inv.length && left > 0; i++) {
            if (!inv[i]) {
                const add = Math.min(left, 64);
                inv[i] = { itemId: type, count: add };
                left -= add;
            }
        }
        localStorage.setItem("webminecraft_inventory", JSON.stringify(inv));
        window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
    } catch {}
}

function updateDrops(time) {
    if (!sceneRef || !cameraRef || !isSurvivalWorld()) return;
    const player = cameraRef.position;
    mergeDrops();
    for (let i = drops.length - 1; i >= 0; i--) {
        const drop = drops[i];
        if (!drop.parent) { drops.splice(i, 1); continue; }
        if (time - drop.userData.spawnedAt >= DROP_DESPAWN_MS) {
            drop.parent.remove(drop);
            drops.splice(i, 1);
            continue;
        }
        const age = (time + drop.userData.bobOffset * 100) * 0.003;
        drop.position.y += Math.sin(age) * 0.0018;
        drop.rotation.y += 0.025;
        const distance = drop.position.distanceTo(player);
        if (distance < MAX_DROP_DISTANCE) {
            const direction = player.clone().sub(drop.position);
            const strength = Math.min(0.18, Math.max(.025, (MAX_DROP_DISTANCE - distance) * .055));
            drop.position.addScaledVector(direction.normalize(), strength);
        }
        if (distance < .62) {
            addToStoredInventory(drop.userData.type, drop.userData.count);
            drop.parent.remove(drop);
            drops.splice(i, 1);
        }
    }
    requestAnimationFrame(updateDrops);
}

function beginMining() {
    if (!isSurvivalWorld() || mining || !document.body.classList.contains("webminecraft-in-world")) return;
    if (handleDoorTarget("break")) {
        sendPlayerAction("mine");
        return;
    }
    const target = getTarget();
    if (!target || target.type === getBlockTypes().BEDROCK) return;
    const duration = HARDNESS_MS[target.type] ?? 700;
    if (!Number.isFinite(duration)) return;
    mining = { ...target, duration, started: performance.now(), overlay: addCrackOverlay(target) };
    capturedTargetType = target.type;
    setCrackStage(mining.overlay, 0.01);
    document.getElementById("survivalMiningHud")?.classList.add("active");
    sendPlayerAction("mine");
}

function cancelMining() {
    if (!mining) return;
    removeCrackOverlay(mining.overlay);
    mining = null;
    capturedTargetType = null;
    document.getElementById("survivalMiningHud")?.classList.remove("active");
}

function finishMining() {
    if (!mining) return;
    const current = getBlockAt(mining.x, mining.y, mining.z);
    if (current !== mining.type) { cancelMining(); return; }
    if (!setBlockAt(mining.x, mining.y, mining.z, getBlockTypes().AIR)) { cancelMining(); return; }
    sendBlockChange(mining.x, mining.y, mining.z, getBlockTypes().AIR);
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x: mining.x, y: mining.y, z: mining.z, type: getBlockTypes().AIR, brokenType: mining.type } }));
    createBreakParticles(new THREE.Vector3(mining.x, mining.y, mining.z), mining.type);
    createDrop(mining.type, new THREE.Vector3(mining.x, mining.y, mining.z));
    removeCrackOverlay(mining.overlay);
    mining = null;
    capturedTargetType = null;
    document.getElementById("survivalMiningHud")?.classList.remove("active");
}

function tickMining(time, held) {
    if (!mining) return;
    if (!held) { cancelMining(); return; }
    const target = getTarget();
    if (!target || target.x !== mining.x || target.y !== mining.y || target.z !== mining.z) { cancelMining(); return; }
    const progress = Math.min(1, (time - mining.started) / mining.duration);
    setCrackStage(mining.overlay, progress);
    if (progress >= 1) finishMining();
}

function init() {
    if (initialized) return;
    initialized = true;
    installStyles();
    // Capture the scene and camera used by the existing interaction system.
    const originalAdd = THREE.Object3D.prototype.add;
    if (!THREE.Object3D.prototype.__webMinecraftMiningPatched) {
        THREE.Object3D.prototype.add = function (...objects) {
            if (this.isScene) sceneRef = this;
            for (const object of objects) {
                if (object?.name === "blockSelectionOutline" && this.isScene) sceneRef = this;
            }
            return originalAdd.apply(this, objects);
        };
        THREE.Object3D.prototype.__webMinecraftMiningPatched = true;
    }
    const originalSetFromCamera = THREE.Raycaster.prototype.setFromCamera;
    if (!THREE.Raycaster.prototype.__webMinecraftMiningCameraPatched) {
        THREE.Raycaster.prototype.setFromCamera = function (...args) {
            cameraRef = args[1] || cameraRef;
            return originalSetFromCamera.apply(this, args);
        };
        THREE.Raycaster.prototype.__webMinecraftMiningCameraPatched = true;
    }

    document.addEventListener("mousedown", event => {
        if (!isSurvivalWorld() || !document.body.classList.contains("webminecraft-in-world")) return;
        if (document.body.classList.contains("mobile-mode") || event.button !== 0) return;
        if (event.target instanceof Element && event.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        beginMining();
    }, true);

    document.addEventListener("mouseup", event => {
        if (event.button === 0) cancelMining();
    }, true);
    window.addEventListener("blur", cancelMining);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelMining(); });

    let lastPunchState = false;
    function mobileLoop() {
        const mobile = document.body.classList.contains("mobile-mode");
        const held = mobile && !!window.__webMinecraftTouchPunch;
        if (held && !lastPunchState) beginMining();
        lastPunchState = held;
        requestAnimationFrame(mobileLoop);
    }
    mobileLoop();

    let last = performance.now();
    function frame(time) {
        const desktopHeld = !!mining;
        tickMining(time, document.body.classList.contains("mobile-mode") ? !!window.__webMinecraftTouchPunch : desktopHeld);
        updateDrops(time);
        last = time;
        if (last > 0) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Track the real mobile punch state from the existing controls object without modifying controls.js.
    setInterval(() => {
        try {
            const script = window.__webMinecraftTouchInput;
            if (script) window.__webMinecraftTouchPunch = !!script.punchPressed;
        } catch {}
    }, 30);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
