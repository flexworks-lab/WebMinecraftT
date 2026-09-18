import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange, sendPlayerAction, sendMiningProgress, sendMiningStop, sendItemDrop, sendItemClaim, isMultiplayerActive } from "./multiplayerClient.js";
import { handleDoorTarget } from "./door.js";
import { isSurvivalWorld } from "./survivalMode.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const RANGE = 4.5;
const HOLD_TO_MINE_MS = 320;
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
let lastSentMiningStage = -1;
const remoteMining = new Map();
const drops = [];

const HARDNESS = {
    1: 700, 2: 430, 3: 1050, 4: 380, 5: 900, 6: 280, 7: 1050,
    8: 420, 9: 900, 10: Infinity, 11: 1200, 12: 1250, 13: 750, 14: 300, 15: 800, 18: 900, 19: 1100, 20: 1100, 21: 1100, 22: 500,
    23: 750, 24: 750, 25: 750, 26: 750, 27: 750, 28: 750, 29: 750, 30: 750, 31: 750,
    32: 1200, 33: 1500, 34: 900, 35: 1200, 36: 1200, 37: 1400, 38: 1200,
    39: 1500, 40: 1500, 41: 1500, 42: 1500, 43: 1500, 44: 1500, 45: 1500, 46: 1500,
    47: 1200, 48: 1100, 49: Infinity, 50: 1200
};

const TEXTURES = {
    1: "Grass_Block_(top_texture)_JE2.png", 2: "dirt.png", 3: "stone.png", 4: "sand.png",
    5: "oak_log_top.png", 6: "oak-leaves-normal-original-default.png", 7: "cobblestone.png",
    8: "gravel.png", 9: "sandstone.png", 10: "bedrock.png", 11: "coal_ore.png",
    12: "iron_ore.png", 13: "oak_planks.png", 14: "snow.png", 15: "tnt_side.png", 18: "bricks.png", 19: "stone_bricks.png", 20: "cracked_stone_bricks.png", 21: "mossy_stone_bricks.png", 22: "dirt_path_top.png",
    23: "acacia_planks.png", 24: "bamboo_planks.png", 25: "birch_planks.png", 26: "crimson_planks.png", 27: "dark_oak_planks.png",
    28: "jungle_planks.png", 29: "mangrove_planks.png", 30: "spruce_planks.png", 31: "warped_planks.png",
    32: "blast_furnace_front.png", 33: "chiseled_deepslate.png", 34: "cobbled_deepslate.png",
    35: "cracked_deepslate_bricks.png", 36: "cracked_deepslate_tiles.png", 37: "deepslate.png",
    38: "deepslate_bricks.png", 39: "deepslate_coal_ore.png", 40: "deepslate_copper_ore.png",
    41: "deepslate_diamond_ore.png", 42: "deepslate_emerald_ore.png", 43: "deepslate_gold_ore.png",
    44: "deepslate_iron_ore.png", 45: "deepslate_lapis_ore.png", 46: "deepslate_redstone_ore.png",
    47: "deepslate_tiles.png", 48: "polished_deepslate.png", 49: "reinforced_deepslate_top.png", 50: "furnace_front.png",
    51: "stone.png", 52: "cobblestone.png", 53: "stone_bricks.png", 54: "cracked_stone_bricks.png", 55: "mossy_stone_bricks.png",
    56: "oak_planks.png", 57: "acacia_planks.png", 58: "bamboo_planks.png", 59: "birch_planks.png", 60: "crimson_planks.png",
    61: "dark_oak_planks.png", 62: "jungle_planks.png", 63: "mangrove_planks.png", 64: "spruce_planks.png", 65: "warped_planks.png",
    66: "chiseled_deepslate.png", 67: "cobbled_deepslate.png", 68: "cracked_deepslate_bricks.png", 69: "cracked_deepslate_tiles.png",
    70: "deepslate.png", 71: "deepslate_bricks.png", 72: "deepslate_tiles.png", 73: "polished_deepslate.png", 74: "reinforced_deepslate_top.png"
};

const COLORS = {
    1: 0x73a83f, 2: 0x8c5e3c, 3: 0x8c8c8c, 4: 0xd9c28b, 5: 0x8f6238,
    6: 0x3e8a3c, 7: 0x777777, 8: 0x8d806d, 9: 0xd5bd8d, 10: 0x4b4b4b,
    11: 0x343434, 12: 0x929292, 13: 0xb68752, 14: 0xf1f7ff, 15: 0xd73636, 18: 0xa44b3b, 19: 0x7f7f7f, 20: 0x707070, 21: 0x5f7b50, 22: 0x8f7a55,
    23: 0xb86f4d, 24: 0xc9a66b, 25: 0xe1d0b6, 26: 0x714a6e, 27: 0x4b3025, 28: 0x6b4a34, 29: 0x744839, 30: 0x7c5b43, 31: 0x2f6a63,
    32: 0x5e5e59, 33: 0x52504f, 34: 0x585654, 35: 0x57534f, 36: 0x4b4947, 37: 0x4f4d4c, 38: 0x56514f,
    39: 0x3f3d3d, 40: 0x4a403d, 41: 0x44464f, 42: 0x3f4a42, 43: 0x4b4340, 44: 0x45474a, 45: 0x3e4a52, 46: 0x4b4148,
    47: 0x4a4847, 48: 0x4d4b4a, 49: 0x3d3e3e, 50: 0x62605b
};

function textureUrl(name) {
    return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`;
}

function getTarget(ndcX = 0, ndcY = 0) {
    if (!sceneRef || !cameraRef) return null;
    cameraRef.updateMatrixWorld(true);
    const screenPoint = Number.isFinite(ndcX) && Number.isFinite(ndcY) && (ndcX !== 0 || ndcY !== 0) ? new THREE.Vector2(ndcX, ndcY) : CENTER;
    raycaster.setFromCamera(screenPoint, cameraRef);
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
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw at a low resolution so the crack texture stays intentionally blocky.
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 32, 32);

    const paths = [
        [[16,16],[14,13],[15,10],[13,7],[11,4]],
        [[16,16],[19,13],[18,10],[20,7],[22,4]],
        [[16,16],[13,18],[10,18],[7,20],[4,23]],
        [[16,16],[19,18],[22,17],[25,19],[28,21]],
        [[16,16],[15,20],[13,23],[11,27],[10,30]],
        [[16,16],[18,20],[20,23],[22,27],[23,30]],
        [[16,16],[14,14],[11,13],[8,12],[5,11]],
        [[16,16],[19,14],[22,13],[25,12],[28,13]],
    ];

    const segmentsPerStage = [1, 3, 5, 7, paths.length];
    const segmentLimit = segmentsPerStage[Math.max(0, Math.min(4, stage))];

    function drawPixelLine(a, b, size = 1) {
        let x = a[0];
        let y = a[1];
        const dx = Math.abs(b[0] - a[0]);
        const dy = Math.abs(b[1] - a[1]);
        const sx = a[0] < b[0] ? 1 : -1;
        const sy = a[1] < b[1] ? 1 : -1;
        let error = dx - dy;

        while (true) {
            ctx.fillRect(x - Math.floor(size / 2), y - Math.floor(size / 2), size, size);
            if (x === b[0] && y === b[1]) break;

            const twice = error * 2;
            if (twice > -dy) { error -= dy; x += sx; }
            if (twice < dx) { error += dx; y += sy; }
        }
    }

    // A darker one-pixel shadow makes the cracks read clearly against bright blocks.
    ctx.fillStyle = "rgba(0,0,0,.9)";
    for (let i = 0; i < segmentLimit; i++) {
        const path = paths[i];
        for (let p = 1; p < path.length; p++) drawPixelLine(path[p - 1], path[p], stage >= 3 ? 2 : 1);
    }

    // Chunky fracture chips appear as the block gets closer to breaking.
    if (stage >= 1) {
        const chips = [
            [13,12],[20,11],[10,20],[22,18],[14,23],[20,23],
            [8,14],[24,14],[7,22],[26,20],[12,28],[24,27]
        ];
        const chipCount = Math.min(chips.length, 2 + stage * 2);
        ctx.fillStyle = "rgba(0,0,0,.96)";
        for (let i = 0; i < chipCount; i++) {
            const [x, y] = chips[i];
            ctx.fillRect(x, y, stage >= 3 ? 2 : 1, stage >= 4 ? 2 : 1);
        }
    }

    // Final stage gets a dense center fracture for a stronger break cue.
    if (stage >= 4) {
        ctx.fillRect(14, 15, 5, 2);
        ctx.fillRect(15, 13, 2, 6);
        ctx.fillRect(12, 17, 7, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
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
            const material = new THREE.MeshBasicMaterial({ map: crackMap(stage), transparent: true, depthTest: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
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

function remoteMiningKey(playerId, x, y, z) { return String(playerId) + ":" + x + "," + y + "," + z; }
function stopAllRemoteMiningAt(x, y, z) {
    for (const [key, entry] of remoteMining) {
        if (entry.x === x && entry.y === y && entry.z === z) {
            destroyCracks(entry.overlay);
            remoteMining.delete(key);
        }
    }
}
function handleRemoteMining(event) {
    const d = event.detail || {};
    const playerId = String(d.playerId || "");
    const x = Math.floor(Number(d.x)), y = Math.floor(Number(d.y)), z = Math.floor(Number(d.z));
    const blockType = Math.floor(Number(d.blockType));
    const progress = Math.max(0, Math.min(1, Number(d.progress) || 0));
    if (!playerId || ![x, y, z, blockType, progress].every(Number.isFinite) || !sceneRef) return;
    if (getBlockAt(x, y, z) !== blockType) return;
    const key = remoteMiningKey(playerId, x, y, z);
    let entry = remoteMining.get(key);
    if (!entry) {
        entry = { playerId, x, y, z, blockType, overlay: createCracks({ x, y, z }) };
        remoteMining.set(key, entry);
    }
    updateCracks(entry.overlay, progress);
}
function handleRemoteMiningStop(event) {
    const d = event.detail || {};
    const playerId = String(d.playerId || "");
    const x = Math.floor(Number(d.x)), y = Math.floor(Number(d.y)), z = Math.floor(Number(d.z));
    if (!playerId || ![x, y, z].every(Number.isFinite)) return;
    const key = remoteMiningKey(playerId, x, y, z);
    const entry = remoteMining.get(key);
    if (entry) {
        destroyCracks(entry.overlay);
        remoteMining.delete(key);
    }
}
function clearRemoteMiningForPlayer(playerId) {
    const id = String(playerId || "");
    for (const [key, entry] of remoteMining) {
        if (entry.playerId === id) {
            destroyCracks(entry.overlay);
            remoteMining.delete(key);
        }
    }
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

function createDrop(type, position, options = {}) {
    const group = new THREE.Group();
    group.name = "survivalDroppedItem";
    group.userData.type = type;
    group.userData.count = Math.max(1, Math.floor(Number(options.count) || 1));
    group.userData.dropId = String(options.dropId || ("drop:" + Date.now() + ":" + Math.random().toString(36).slice(2, 10)));
    group.userData.networked = options.networked !== false;
    group.userData.claimRequested = false;
    group.userData.spawnedAt = performance.now();
    group.userData.bob = Math.random() * Math.PI * 2;
    group.userData.velocityX = Number.isFinite(Number(options.velocityX)) ? Number(options.velocityX) : (Math.random() - 0.5) * 1.2;
    group.userData.velocityY = Number.isFinite(Number(options.velocityY)) ? Number(options.velocityY) : 1.8;
    group.userData.velocityZ = Number.isFinite(Number(options.velocityZ)) ? Number(options.velocityZ) : (Math.random() - 0.5) * 1.2;
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
    return group;
}

function findDropById(dropId) {
    const id = String(dropId || "");
    return drops.find(drop => drop?.userData?.dropId === id) || null;
}

function removeDropById(dropId) {
    const drop = findDropById(dropId);
    if (!drop) return null;
    const index = drops.indexOf(drop);
    if (drop.parent) drop.parent.remove(drop);
    if (index >= 0) drops.splice(index, 1);
    return drop;
}

function handleRemoteItemDrop(event) {
    const d = event.detail || {};
    const id = String(d.id || "");
    const itemType = Math.floor(Number(d.itemType));
    const count = Math.max(1, Math.floor(Number(d.count) || 1));
    const x = Number(d.x), y = Number(d.y), z = Number(d.z);
    if (!id || ![itemType, count, x, y, z].every(Number.isFinite) || !sceneRef) return;
    if (findDropById(id)) return;
    createDrop(itemType, new THREE.Vector3(x, y, z), {
        dropId: id,
        count,
        networked: true,
        velocityX: Number(d.velocityX),
        velocityY: Number(d.velocityY),
        velocityZ: Number(d.velocityZ)
    });
}

function handleRemoteItemClaimed(event) {
    const d = event.detail || {};
    const id = String(d.id || "");
    const drop = removeDropById(id);
    if (!drop) return;
    if (addToInventory(Number(drop.userData.type), Number(drop.userData.count))) refreshHotbarTextures();
}

function handleRemoteItemRemoved(event) {
    removeDropById(event.detail?.id);
}

function handleRemoteItemClaimDenied(event) {
    const drop = findDropById(event.detail?.id);
    if (drop) drop.userData.claimRequested = false;
}

function mergeDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        const a = drops[i];
        if (!a.parent) { drops.splice(i, 1); continue; }
        for (let j = i - 1; j >= 0; j--) {
            const b = drops[j];
            if (!b.parent || a.userData.networked || b.userData.networked || a.userData.type !== b.userData.type || a.position.distanceTo(b.position) > .7) continue;
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
            const slab = Number(item?.itemId) >= 51 && Number(item?.itemId) <= 74;
            icon.style.inset = slab ? "44% 3px 3px" : "3px";
            icon.style.borderTop = slab ? "2px solid rgba(255,255,255,.22)" : "";
            icon.style.boxShadow = slab ? "0 -2px 0 rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.10)" : "";
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

            const nextX = drop.position.x + drop.userData.velocityX * dt;
            const nextZ = drop.position.z + drop.userData.velocityZ * dt;
            const nextY = drop.position.y + drop.userData.velocityY * dt;

            const checkSolid = (x, y, z) => {
                const block = getBlockAt(Math.floor(x + .5), Math.floor(y + .5), Math.floor(z + .5));
                return block && block !== getBlockTypes().AIR;
            };

            if (!checkSolid(nextX, drop.position.y, drop.position.z)) {
                drop.position.x = nextX;
            } else {
                drop.userData.velocityX = 0;
            }

            if (!checkSolid(drop.position.x, drop.position.y, nextZ)) {
                drop.position.z = nextZ;
            } else {
                drop.userData.velocityZ = 0;
            }

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
                drop.userData.baseY = drop.position.y;
            } else {
                drop.position.y = Math.max(nextY, MIN_DROP_Y);
            }
        } else {
            // A dropped item can lose its support after the block below it is mined.
            // Re-check the exact block directly underneath every frame instead of
            // assuming that a previously grounded item can stay suspended forever.
            const supportX = Math.floor(drop.position.x + .5);
            const supportZ = Math.floor(drop.position.z + .5);
            const supportY = Math.floor(drop.position.y - DROP_HALF_SIZE + .5);
            const supportBlock = getBlockAt(supportX, supportY, supportZ);
            const hasSupport = supportBlock && supportBlock !== getBlockTypes().AIR;

            if (!hasSupport) {
                drop.userData.grounded = false;
                drop.userData.baseY = undefined;
                drop.userData.velocityY = 0;
                continue;
            }

            const baseY = drop.userData.baseY ?? (drop.userData.baseY = drop.position.y);
            drop.position.y = baseY + Math.sin(time * .003 + drop.userData.bob) * .045;
        }

        // Once an item lands, stop all horizontal motion so it never drifts across the ground.
        if (drop.userData.grounded) {
            drop.userData.velocityX = 0;
            drop.userData.velocityZ = 0;
        }
        drop.rotation.y += .018;

        // Items are picked up when the player reaches them; do not magnetically pull them,
        // since that causes visible drifting even when the item is resting on a block.
        if (drop.position.distanceTo(player) <= PICKUP_RANGE && !drop.userData.claimRequested) {
            if (drop.userData.networked) {
                drop.userData.claimRequested = true;
                sendItemClaim(drop.userData.dropId);
            } else if (addToInventory(drop.userData.type, drop.userData.count)) {
                drop.parent.remove(drop);
                drops.splice(i, 1);
                refreshHotbarTextures();
            }
        }
    }
}

export function startSurvivalMining(scene, camera, ndcX = 0, ndcY = 0) {
    if (scene) sceneRef = scene;
    if (camera) cameraRef = camera;
    if (!isSurvivalWorld() || !document.body.classList.contains("webminecraft-in-world") || mining) return;
    if (handleDoorTarget("break")) { sendPlayerAction("mine"); return; }
    const target = getTarget(ndcX, ndcY);
    if (!target) return;
    const duration = HARDNESS[target.type] ?? 700;
    if (!Number.isFinite(duration)) return;
    mining = { ...target, ndcX, ndcY, started: performance.now(), duration, overlay: createCracks(target) };
    lastSentMiningStage = -1;
    updateCracks(mining.overlay, .01);
    sendMiningProgress(mining.x, mining.y, mining.z, mining.type, .01);
    lastSentMiningStage = 0;
    sendPlayerAction("mine");
}

function cancelMining() {
    hideTouchMiningProgress();
    if (!mining) return;
    sendMiningStop(mining.x, mining.y, mining.z);
    destroyCracks(mining.overlay);
    mining = null;
    lastSentMiningStage = -1;
}

function finishMining() {
    if (!mining) return;
    if (getBlockAt(mining.x, mining.y, mining.z) !== mining.type) { cancelMining(); return; }
    sendMiningStop(mining.x, mining.y, mining.z);
    if (!setBlockAt(mining.x, mining.y, mining.z, getBlockTypes().AIR)) { cancelMining(); return; }
    sendBlockChange(mining.x, mining.y, mining.z, getBlockTypes().AIR);
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x: mining.x, y: mining.y, z: mining.z, type: getBlockTypes().AIR, brokenType: mining.type } }));
    burst(new THREE.Vector3(mining.x, mining.y, mining.z), mining.type);
    const dropId = "drop:" + Date.now() + ":" + Math.random().toString(36).slice(2, 10);
    const drop = createDrop(mining.type, new THREE.Vector3(mining.x, mining.y, mining.z), { dropId, networked: isMultiplayerActive() });
    if (drop?.userData.networked) {
        sendItemDrop({
            id: drop.userData.dropId,
            itemType: drop.userData.type,
            count: drop.userData.count,
            x: drop.position.x,
            y: drop.position.y - 0.28,
            z: drop.position.z,
            velocityX: drop.userData.velocityX,
            velocityY: drop.userData.velocityY,
            velocityZ: drop.userData.velocityZ
        });
    }
    destroyCracks(mining.overlay);
    mining = null;
}

function showTouchMiningProgress(ndcX, ndcY, progress) {
    let indicator = document.getElementById("touchMiningProgress");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "touchMiningProgress";
        indicator.innerHTML = '<div id="touchMiningProgressFill"></div>';
        document.body.appendChild(indicator);
        const style = document.createElement("style");
        style.id = "touchMiningProgressStyles";
        style.textContent = `
#touchMiningProgress{display:none;position:fixed;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;z-index:10020;pointer-events:none;background:conic-gradient(rgba(255,255,255,.95) 0deg,rgba(255,255,255,.95) 0deg,rgba(0,0,0,.5) 0deg,rgba(0,0,0,.5) 360deg);box-shadow:0 0 0 2px rgba(0,0,0,.75);}
#touchMiningProgressFill{position:absolute;inset:6px;border-radius:50%;background:rgba(0,0,0,.55);}
body:not(.mobile-mode) #touchMiningProgress{display:none!important}
`;
        document.head.appendChild(style);
    }
    indicator.style.left = `${((ndcX + 1) * 0.5) * window.innerWidth}px`;
    indicator.style.top = `${((1 - ndcY) * 0.5) * window.innerHeight}px`;
    const angle = Math.max(0, Math.min(1, progress)) * 360;
    indicator.style.background = `conic-gradient(rgba(255,255,255,.95) 0deg,rgba(255,255,255,.95) ${angle}deg,rgba(0,0,0,.5) ${angle}deg,rgba(0,0,0,.5) 360deg)`;
    indicator.style.display = "block";
}

function hideTouchMiningProgress() {
    document.getElementById("touchMiningProgress")?.style.setProperty("display", "none");
}

function tickMining(time, held) {
    if (!mining) return;
    if (!held) { hideTouchMiningProgress(); cancelMining(); return; }
    const target = document.body.classList.contains("mobile-mode") ? getTarget(mining.ndcX, mining.ndcY) : getTarget();
    if (!target || target.x !== mining.x || target.y !== mining.y || target.z !== mining.z) { cancelMining(); return; }
    const progress = Math.min(1, (time - mining.started) / mining.duration);
    updateCracks(mining.overlay, progress);
    const networkStage = Math.min(4, Math.floor(Math.max(0, progress) * 5));
    if (networkStage !== lastSentMiningStage) {
        sendMiningProgress(mining.x, mining.y, mining.z, mining.type, progress);
        lastSentMiningStage = networkStage;
    }
    if (document.body.classList.contains("mobile-mode")) showTouchMiningProgress(mining.ndcX, mining.ndcY, progress);
    if (progress >= 1) { hideTouchMiningProgress(); finishMining(); }
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
    window.addEventListener("webminecraft:multiplayer-mining", handleRemoteMining);
    window.addEventListener("webminecraft:multiplayer-mining-stop", handleRemoteMiningStop);
    window.addEventListener("webminecraft:blockchange", event => {
        const d = event.detail || {};
        const x = Math.floor(Number(d.x)), y = Math.floor(Number(d.y)), z = Math.floor(Number(d.z));
        if ([x, y, z].every(Number.isFinite)) stopAllRemoteMiningAt(x, y, z);
    });
    window.addEventListener("webminecraft:multiplayer-player-left", event => {
        clearRemoteMiningForPlayer(event.detail?.playerId);
    });
    window.addEventListener("webminecraft:multiplayer-item-drop", handleRemoteItemDrop);
    window.addEventListener("webminecraft:multiplayer-item-claimed", handleRemoteItemClaimed);
    window.addEventListener("webminecraft:multiplayer-item-removed", handleRemoteItemRemoved);
    window.addEventListener("webminecraft:multiplayer-item-claim-denied", handleRemoteItemClaimDenied);
    function frame(time) {
        const mobile = document.body.classList.contains("mobile-mode");
        if (mobile && touchInput.blockTouchActive && !touchInput.blockHoldTriggered) {
            const heldFor = performance.now() - Number(touchInput.blockTouchStarted || performance.now());
            if (isSurvivalWorld() && heldFor >= HOLD_TO_MINE_MS) {
                touchInput.blockHoldTriggered = true;
                startSurvivalMining(sceneRef, cameraRef, Number(touchInput.blockTouchX) || 0, Number(touchInput.blockTouchY) || 0);
            }
        }
        const held = mobile ? !!(touchInput.blockTouchActive && touchInput.blockHoldTriggered) : !!mining;
        tickMining(time, held);
        updateDrops(time);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

export function setMiningContext(scene, camera) { sceneRef = scene || sceneRef; cameraRef = camera || cameraRef; }

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
