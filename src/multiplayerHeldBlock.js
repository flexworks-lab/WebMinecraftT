import * as THREE from "three";
import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial,
    cobblestoneMaterial,
    gravelMaterial,
    sandstoneMaterial,
    bedrockMaterial,
    coalMaterial,
    ironMaterial,
    oakPlankMaterial,
    snowMaterial,
    tntMaterial,
    bricksMaterial,
    stoneBricksMaterial,
    crackedStoneBricksMaterial,
    mossyStoneBricksMaterial,
    dirtPathMaterial
} from "./blocks.js";

const ITEM_MATERIALS = {
    1: grassMaterial,
    2: dirtMaterial,
    3: stoneMaterial,
    4: sandMaterial,
    5: oakLogMaterial,
    6: leavesMaterial,
    7: cobblestoneMaterial,
    8: gravelMaterial,
    9: sandstoneMaterial,
    10: bedrockMaterial,
    11: coalMaterial,
    12: ironMaterial,
    13: oakPlankMaterial,
    14: snowMaterial,
    15: tntMaterial,
    18: bricksMaterial,
    19: stoneBricksMaterial,
    20: crackedStoneBricksMaterial,
    21: mossyStoneBricksMaterial,
    22: dirtPathMaterial
};

const avatars = new Set();
const heldMeshes = new WeakMap();
const originalAdd = THREE.Object3D.prototype.add;
let installed = false;

function cloneMaterial(material) {
    if (!material?.clone) return material;
    const cloned = material.clone();
    cloned.vertexColors = false;
    if (cloned.color) cloned.color.setRGB(1, 1, 1);
    cloned.needsUpdate = true;
    return cloned;
}

function makeMaterials(itemId) {
    const source = ITEM_MATERIALS[itemId];
    if (!source) return null;
    return Array.isArray(source) ? source.map(cloneMaterial) : cloneMaterial(source);
}

function createHeldMesh() {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.42),
        cloneMaterial(stoneMaterial)
    );
    mesh.name = "multiplayerHeldBlock";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(0.53, 0.87, -0.24);
    mesh.rotation.set(0.08, 0.28, -0.06);
    mesh.visible = false;
    mesh.userData.itemId = 0;
    return mesh;
}

function installAvatarHook() {
    if (installed) return;
    installed = true;
    THREE.Object3D.prototype.add = function(...objects) {
        const result = originalAdd.apply(this, objects);
        for (const object of objects) {
            if (!object?.userData?.multiplayerAvatar) continue;
            let mesh = heldMeshes.get(object);
            if (!mesh) {
                mesh = createHeldMesh();
                object.add(mesh);
                heldMeshes.set(object, mesh);
                avatars.add(object);
            }
        }
        return result;
    };
}

function getRemotePlayers() {
    try {
        return window.__webminecraftGetRemotePlayers?.() || new Map();
    } catch {
        return new Map();
    }
}

function findPlayerForAvatar(avatar, players) {
    let best = null;
    let bestDistance = Infinity;
    for (const player of players.values()) {
        const p = player?.position;
        if (!p) continue;
        const dx = Number(p.x) - avatar.position.x;
        const dy = Number(p.y) - avatar.position.y;
        const dz = Number(p.z) - avatar.position.z;
        const distance = dx * dx + dy * dy + dz * dz;
        if (distance < bestDistance) {
            bestDistance = distance;
            best = player;
        }
    }
    return bestDistance <= 4 ? best : null;
}

function updateHeldMesh(avatar, player) {
    const mesh = heldMeshes.get(avatar);
    if (!mesh) return;
    const itemId = Math.floor(Number(player?.heldItemId) || 0);
    if (!ITEM_MATERIALS[itemId]) {
        mesh.visible = false;
        mesh.userData.itemId = 0;
        return;
    }
    if (mesh.userData.itemId !== itemId) {
        const nextMaterials = makeMaterials(itemId);
        if (nextMaterials) {
            const old = mesh.material;
            mesh.material = nextMaterials;
            if (Array.isArray(old)) old.forEach(material => material?.dispose?.());
            else old?.dispose?.();
            mesh.userData.itemId = itemId;
        }
    }
    mesh.visible = true;
}

function render() {
    const players = getRemotePlayers();
    for (const avatar of [...avatars]) {
        if (!avatar.parent) {
            avatars.delete(avatar);
            continue;
        }
        updateHeldMesh(avatar, findPlayerForAvatar(avatar, players));
    }
    requestAnimationFrame(render);
}

installAvatarHook();
window.addEventListener("webminecraft:selectedslot", event => {
    window.__webminecraftSelectedSlot = Number(event.detail?.slot ?? 0);
});
render();
