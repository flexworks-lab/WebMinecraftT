import { touchInput } from "./controls.js";

const remotePlayers = new Map();
const claimedByOthers = new Set();
const ownedDrops = new Map();
let hookInstalled = false;
let localId = null;

const HELD_ITEM_ROTATION_TAG = 1000;

window.__webminecraftGetRemotePlayers = () => remotePlayers;
window.__webminecraftTouchInput = touchInput;

function survivalActive() {
    return document.body.classList.contains("webminecraft-multiplayer") && document.body.classList.contains("webminecraft-survival");
}

function decodeHeldItem(player) {
    if (!player?.rotation) return;
    const encoded = Number(player.rotation.z);
    if (!Number.isFinite(encoded) || Math.abs(encoded) < 900) return;
    const heldItemId = Math.floor(encoded / HELD_ITEM_ROTATION_TAG);
    const actualZ = encoded - heldItemId * HELD_ITEM_ROTATION_TAG;
    if (heldItemId >= 0 && heldItemId <= 15 && Math.abs(actualZ) < 20) {
        player.heldItemId = heldItemId;
        player.rotation.z = actualZ;
    }
}

function syncPlayers(message) {
    if (!message || typeof message !== "object") return;
    if (message.type === "joined") {
        localId = String(message.playerId || "");
        remotePlayers.clear();
        for (const player of message.players || []) {
            if (player?.id && String(player.id) !== localId) {
                decodeHeldItem(player);
                remotePlayers.set(String(player.id), player);
            }
        }
    } else if (message.type === "player_joined") {
        if (message.player?.id && String(message.player.id) !== localId) {
            decodeHeldItem(message.player);
            remotePlayers.set(String(message.player.id), message.player);
        }
    } else if (message.type === "player_left") {
        if (message.playerId) remotePlayers.delete(String(message.playerId));
    } else if (message.type === "player_states") {
        for (const player of message.players || []) {
            if (player?.id && String(player.id) !== localId) {
                decodeHeldItem(player);
                remotePlayers.set(String(player.id), player);
            }
        }
        processClaims(message.players || []);
    }
}

function processClaims(players) {
    if (!survivalActive()) return;
    const scene = window.__webMinecraftMiningScene;
    for (const player of players) {
        if (!Array.isArray(player?.claimedDropIds)) continue;
        for (const id of player.claimedDropIds) {
            const key = String(id || "");
            if (!key) continue;
            claimedByOthers.add(key);
            const drop = ownedDrops.get(key);
            if (!drop) continue;
            if (scene) {
                for (const child of [...scene.children]) {
                    if (child?.name !== "survivalDroppedItem") continue;
                    if (Number(child.userData?.type) !== Number(drop.type)) continue;
                    if (child.position.distanceTo({ x: drop.x, y: drop.y + .28, z: drop.z }) > .8) continue;
                    child.parent?.remove(child);
                    break;
                }
            }
            ownedDrops.delete(key);
        }
    }
}

function trackLocalDrop(event) {
    if (!survivalActive()) return;
    const detail = event.detail || {};
    const type = Math.floor(Number(detail.brokenType));
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    if (!Number.isFinite(type) || type <= 0 || ![x, y, z].every(Number.isFinite)) return;
    const id = `${localId || "local"}:${x}:${y}:${z}:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    ownedDrops.set(id, { id, x, y, z, type });
}

function getLocalHeldItemId() {
    try {
        const inventory = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        const slot = Number(window.__webminecraftSelectedSlot ?? 0);
        return Math.max(0, Math.floor(Number(inventory?.[slot]?.itemId) || 0));
    } catch {
        return 0;
    }
}

function patchOutgoing(data) {
    if (typeof data !== "string" || !survivalActive()) return data;
    try {
        const message = JSON.parse(data);
        if (message?.type !== "player_state") return data;
        if (Array.isArray(message.sharedDrops)) {
            message.sharedDrops = message.sharedDrops.filter(drop => !claimedByOthers.has(String(drop?.id || "")));
        }
        if (Array.isArray(window.__webminecraftClaimedDropIds)) {
            message.claimedDropIds = [...new Set(window.__webminecraftClaimedDropIds.map(String))].slice(-32);
        }
        if (message.rotation && typeof message.rotation === "object") {
            const heldItemId = getLocalHeldItemId();
            const actualZ = Number(message.rotation.z);
            if (Number.isFinite(actualZ)) {
                message.rotation.z = actualZ + heldItemId * HELD_ITEM_ROTATION_TAG;
            }
        }
        return JSON.stringify(message);
    } catch {
        return data;
    }
}

function installSocketHook() {
    if (hookInstalled || !window.WebSocket) return;
    hookInstalled = true;

    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
        return originalSend.call(this, patchOutgoing(data));
    };

    const originalAddEventListener = WebSocket.prototype.addEventListener;
    WebSocket.prototype.addEventListener = function(type, listener, options) {
        if (type !== "message" || typeof listener !== "function") return originalAddEventListener.call(this, type, listener, options);
        const wrapped = event => {
            try { syncPlayers(JSON.parse(event.data)); } catch {}
            return listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrapped, options);
    };
}

window.addEventListener("webminecraft:blockchange", trackLocalDrop);
window.addEventListener("webminecraft:selectedslot", event => {
    window.__webminecraftSelectedSlot = Number(event.detail?.slot ?? 0);
});
window.addEventListener("webminecraft:inventorychanged", () => {
    if (!survivalActive()) return;
    const camera = window.__webMinecraftMiningCamera;
    if (!camera) return;
    const p = camera.position;
    for (const drop of [...ownedDrops.values()]) {
        const dx = p.x - drop.x, dy = p.y - (drop.y + .28), dz = p.z - drop.z;
        if (Math.hypot(dx, dy, dz) <= 2.5) ownedDrops.delete(drop.id);
    }
});

installSocketHook();
window.__webminecraftSurvivalBridgeReady = true;
