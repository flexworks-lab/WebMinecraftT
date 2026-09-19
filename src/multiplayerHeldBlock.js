import * as THREE from "three";
import { getRemotePlayers as getMultiplayerRemotePlayers } from "./multiplayerClient.js";
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
    dirtPathMaterial,
    acaciaPlanksMaterial, bambooPlanksMaterial, birchPlanksMaterial, crimsonPlanksMaterial,
    darkOakPlanksMaterial, junglePlanksMaterial, mangrovePlanksMaterial, sprucePlanksMaterial, warpedPlanksMaterial,
    blastFurnaceMaterial, furnaceMaterial, chiseledDeepslateMaterial, cobbledDeepslateMaterial,
    crackedDeepslateBricksMaterial, crackedDeepslateTilesMaterial, deepslateMaterial, deepslateBricksMaterial,
    deepslateCoalOreMaterial, deepslateCopperOreMaterial, deepslateDiamondOreMaterial, deepslateEmeraldOreMaterial,
    deepslateGoldOreMaterial, deepslateIronOreMaterial, deepslateLapisOreMaterial, deepslateRedstoneOreMaterial,
    deepslateTilesMaterial, polishedDeepslateMaterial, reinforcedDeepslateMaterial
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
    22: dirtPathMaterial,
    23: acaciaPlanksMaterial,
    24: bambooPlanksMaterial,
    25: birchPlanksMaterial,
    26: crimsonPlanksMaterial,
    27: darkOakPlanksMaterial,
    28: junglePlanksMaterial,
    29: mangrovePlanksMaterial,
    30: sprucePlanksMaterial,
    31: warpedPlanksMaterial,
    32: blastFurnaceMaterial,
    33: chiseledDeepslateMaterial,
    34: cobbledDeepslateMaterial,
    35: crackedDeepslateBricksMaterial,
    36: crackedDeepslateTilesMaterial,
    37: deepslateMaterial,
    38: deepslateBricksMaterial,
    39: deepslateCoalOreMaterial,
    40: deepslateCopperOreMaterial,
    41: deepslateDiamondOreMaterial,
    42: deepslateEmeraldOreMaterial,
    43: deepslateGoldOreMaterial,
    44: deepslateIronOreMaterial,
    45: deepslateLapisOreMaterial,
    46: deepslateRedstoneOreMaterial,
    47: deepslateTilesMaterial,
    48: polishedDeepslateMaterial,
    49: reinforcedDeepslateMaterial,
     50: furnaceMaterial,
    51: stoneMaterial, 52: cobblestoneMaterial, 53: stoneBricksMaterial, 54: crackedStoneBricksMaterial, 55: mossyStoneBricksMaterial,
    56: oakPlankMaterial, 57: acaciaPlanksMaterial, 58: bambooPlanksMaterial, 59: birchPlanksMaterial, 60: crimsonPlanksMaterial,
    61: darkOakPlanksMaterial, 62: junglePlanksMaterial, 63: mangrovePlanksMaterial, 64: sprucePlanksMaterial, 65: warpedPlanksMaterial,
    66: chiseledDeepslateMaterial, 67: cobbledDeepslateMaterial, 68: crackedDeepslateBricksMaterial, 69: crackedDeepslateTilesMaterial,
    70: deepslateMaterial, 71: deepslateBricksMaterial, 72: deepslateTilesMaterial, 73: polishedDeepslateMaterial, 74: reinforcedDeepslateMaterial,
    75: oakPlankMaterial, 76: acaciaPlanksMaterial, 77: bambooPlanksMaterial, 78: birchPlanksMaterial, 79: crimsonPlanksMaterial,
    80: darkOakPlanksMaterial, 81: junglePlanksMaterial, 82: mangrovePlanksMaterial, 83: sprucePlanksMaterial, 84: warpedPlanksMaterial
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

function createStairHeldMesh(material){
    const group = new THREE.Group();
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.21,0.42), material);
    lower.position.y = -0.105;
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.42,0.21,0.21), material.clone?.() || material);
    upper.position.set(0,-0.0,-0.105);
    group.add(lower,upper);
    group.userData.isHeldStair = true;
    return group;
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
        return getMultiplayerRemotePlayers?.() || new Map();
    } catch {
        return new Map();
    }
}

function findPlayerForAvatar(avatar, players) {
    const id = String(avatar?.userData?.multiplayerPlayerId || "");
    if (id && players.has(id)) return players.get(id);
    return null;
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
    const slab = itemId >= 51 && itemId <= 74;
    const stair = itemId >= 75 && itemId <= 84;
    if (stair) {
        mesh.scale.set(0.94, 0.5, 0.94);
        mesh.position.y = 0.81;
    } else {
        mesh.scale.y = slab ? 0.5 : 1;
        mesh.position.y = slab ? 0.81 : 0.87;
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
