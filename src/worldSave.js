import { setBlockAt } from "./world.js";
import { loadCloudWorld, saveCloudWorld } from "./cloudWorlds.js";
import { isWorldDeleted } from "./worlds.js";

const WAIT_MS = 50;
const LOCAL_SAVE_DELAY_MS = 350;
const CLOUD_SAVE_DELAY_MS = 1500;
const LIVE_CLOUD_SAVE_MS = 5000;
const BLOCK_SNAPSHOT_PREFIX = "webminecraft-singleplayer-world-blocks-";
const PLAYER_STATE_PREFIX = "webminecraft-singleplayer-world-state-";

let activeWorld = null;
let activeWorldSeed = null;
let activeBlocks = {};
let saveTimer = null;
let cloudSaveTimer = null;
let liveCloudSaveTimer = null;
let worldSwitchId = 0;
const pendingChanges = new Map();

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function getSeedFromUrl() {
    return normalizeSeed(new URLSearchParams(window.location.search).get("seed"));
}

function waitForStorage(timeout = 10000) {
    const started = Date.now();
    return (async () => {
        while (Date.now() - started < timeout) {
            const storage = window.webMinecraftWorldStorage;
            if (storage && typeof storage.getLocalWorld === "function") return storage;
            await sleep(50);
        }
        return null;
    })();
}

function blockSnapshotKey(seed) {
    const normalized = normalizeSeed(seed);
    return normalized === null ? null : `${BLOCK_SNAPSHOT_PREFIX}${normalized}`;
}

function playerStateKey(seed) {
    const normalized = normalizeSeed(seed);
    return normalized === null ? null : `${PLAYER_STATE_PREFIX}${normalized}`;
}

function readLocalBlockSnapshot(seed) {
    const key = blockSnapshotKey(seed);
    if (!key) return {};
    try {
        const value = JSON.parse(localStorage.getItem(key) || "{}");
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
}

function writeLocalBlockSnapshot(seed, blocks) {
    const key = blockSnapshotKey(seed);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(blocks || {})); } catch {}
}

function clearLocalBlockSnapshot(seed) {
    const key = blockSnapshotKey(seed);
    if (!key) return;
    try { localStorage.removeItem(key); } catch {}
}

function inventoryTexture(itemId) {
    const textures = {
        1: "grass_block_side.png",
        2: "dirt.png",
        3: "stone.png",
        4: "sand.png",
        5: "oak_log_top.png",
        6: "oak-leaves-normal-original-default.png",
        7: "cobblestone.png",
        8: "gravel.png",
        9: "sandstone.png",
        10: "bedrock.png",
        11: "coal_ore.png",
        12: "iron_ore.png",
        13: "oak_planks.png",
        14: "snow.png",
        15: "tnt_side.png",
        16: "Flint_and_Steel_JE4_BE2.png",
        17: "oak_door_bottom.png"
    };
    return textures[Number(itemId)] || null;
}

function normalizeInventory(value) {
    if (!Array.isArray(value) || value.length !== 36) return Array.from({ length: 36 }, () => null);
    return value.map(slot => {
        if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
        const itemId = Math.floor(Number(slot.itemId));
        const count = Math.max(1, Math.min(64, Math.floor(Number(slot.count))));
        return {
            itemId,
            count,
            texture: slot.texture || inventoryTexture(itemId)
        };
    });
}

function readInventory() {
    try { return normalizeInventory(JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]")); }
    catch { return Array.from({ length: 36 }, () => null); }
}

function writePlayerState(seed, force = false) {
    const key = playerStateKey(seed);
    const camera = window.__webminecraftCamera;
    if (!key || !camera) return;
    if (!force && window.__webminecraftMultiplayerActive === true) return;
    const modeRaw = window.webMinecraftSelectedWorldMode;
    const mode = modeRaw === "survival" ? "survival" : (modeRaw === "creative" ? "creative" : null);
    let yaw = 0;
    let pitch = 0;
    try {
        yaw = Number(window.__webminecraftYaw ?? 0);
        pitch = Number(window.__webminecraftPitch ?? 0);
    } catch {}
    const state = {
        version: 2,
        seed: normalizeSeed(seed),
        mode,
        position: { x: Number(camera.position.x), y: Number(camera.position.y), z: Number(camera.position.z) },
        yaw,
        pitch,
        selectedSlot: Number.isFinite(Number(window.webMinecraftSelectedSlot)) ? Number(window.webMinecraftSelectedSlot) : 0,
        inventory: readInventory(),
        updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}

async function resolveActiveWorld(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed)) return null;
    if (activeWorld && activeWorld.seed === normalizedSeed && activeWorldSeed === normalizedSeed) return activeWorld;

    const storage = await waitForStorage();
    if (!storage || isWorldDeleted(normalizedSeed)) return null;
    const world = await storage.getLocalWorld(normalizedSeed).catch(() => null);
    if (!world || isWorldDeleted(normalizedSeed)) return null;

    if (switchId === worldSwitchId && !isWorldDeleted(normalizedSeed)) {
        activeWorld = { ...world, seed: normalizedSeed };
        activeWorldSeed = normalizedSeed;
    }
    return activeWorld || world;
}

async function loadSavedBlocks(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed)) return null;

    try {
        const localWorld = await resolveActiveWorld(normalizedSeed, switchId);
        if (switchId !== worldSwitchId || isWorldDeleted(normalizedSeed)) return null;

        const cloudWorld = await loadCloudWorld(normalizedSeed, localWorld).catch(() => null);
        if (switchId !== worldSwitchId || isWorldDeleted(normalizedSeed)) return null;

        const storedBlocks = readLocalBlockSnapshot(normalizedSeed);
        const cloudBlocks = cloudWorld?.blocks && typeof cloudWorld.blocks === "object" ? cloudWorld.blocks : {};
        const localBlocks = localWorld?.blocks && typeof localWorld.blocks === "object" ? localWorld.blocks : {};
        const mergedBlocks = { ...cloudBlocks, ...localBlocks, ...storedBlocks };

        const baseWorld = cloudWorld || localWorld;
        if (!baseWorld) return null;
        activeWorld = {
            ...baseWorld,
            seed: normalizedSeed,
            blocks: mergedBlocks
        };
        activeWorldSeed = normalizedSeed;
        activeBlocks = { ...mergedBlocks };

        const storage = await waitForStorage();
        if (!storage || isWorldDeleted(normalizedSeed) || switchId !== worldSwitchId) return null;
        await storage.saveLocalWorld(activeWorld).catch(() => {});

        for (const [key, value] of Object.entries(activeBlocks)) {
            if (switchId !== worldSwitchId || activeWorldSeed !== normalizedSeed || isWorldDeleted(normalizedSeed)) return null;
            const parts = key.split(",").map(Number);
            if (parts.length !== 3 || parts.some(number => !Number.isFinite(number))) continue;
            const type = Number(value);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }

        writeLocalBlockSnapshot(normalizedSeed, activeBlocks);
        writePlayerState(normalizedSeed, true);
        startLiveCloudSave();
        return activeWorld;
    } catch (error) {
        console.warn("Could not load saved world blocks:", error);
        return null;
    }
}

async function queueBlockSave(change) {
    const seed = getSeedFromUrl();
    if (seed === null || activeWorldSeed !== seed || isWorldDeleted(seed)) return;

    const world = activeWorld?.seed === seed
        ? activeWorld
        : await resolveActiveWorld(seed, worldSwitchId);
    if (!world || world.seed !== seed || activeWorldSeed !== seed || isWorldDeleted(seed)) return;

    const key = `${change.x},${change.y},${change.z}`;
    activeBlocks[key] = change.type;
    pendingChanges.set(key, change);
    writeLocalBlockSnapshot(seed, activeBlocks);
    writePlayerState(seed);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushBlockSaves, LOCAL_SAVE_DELAY_MS);
}

async function saveCloudNow(world, switchId = worldSwitchId) {
    if (!world || isWorldDeleted(world.seed)) return false;
    if (switchId !== worldSwitchId || activeWorldSeed !== world.seed || activeWorld !== world) return false;
    try {
        await saveCloudWorld(world);
        return true;
    } catch (error) {
        console.warn("Cloud world save failed:", error);
        return false;
    }
}

function scheduleCloudSave(world, switchId = worldSwitchId, immediate = false) {
    clearTimeout(cloudSaveTimer);
    if (!world || isWorldDeleted(world.seed)) return;
    if (immediate) {
        void saveCloudNow(world, switchId);
        return;
    }
    cloudSaveTimer = setTimeout(async () => {
        cloudSaveTimer = null;
        await saveCloudNow(world, switchId);
    }, CLOUD_SAVE_DELAY_MS);
}

function startLiveCloudSave() {
    clearInterval(liveCloudSaveTimer);
    liveCloudSaveTimer = setInterval(() => {
        if (!activeWorld || !activeWorldSeed || isWorldDeleted(activeWorldSeed)) return;
        if (pendingChanges.size > 0 || saveTimer) return;
        writePlayerState(activeWorldSeed);
        void saveCloudNow(activeWorld, worldSwitchId);
    }, LIVE_CLOUD_SAVE_MS);
}

function stopLiveCloudSave() {
    clearInterval(liveCloudSaveTimer);
    liveCloudSaveTimer = null;
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld) return;

    const worldToSave = activeWorld;
    const seedToSave = worldToSave.seed;
    const saveSwitchId = worldSwitchId;
    if (isWorldDeleted(seedToSave)) {
        pendingChanges.clear();
        return;
    }

    const blocksToSave = { ...activeBlocks };
    pendingChanges.clear();
    writeLocalBlockSnapshot(seedToSave, blocksToSave);
    writePlayerState(seedToSave, true);

    const storage = await waitForStorage();
    if (!storage?.saveLocalWorld || saveSwitchId !== worldSwitchId || activeWorld !== worldToSave || isWorldDeleted(seedToSave)) {
        if (activeWorld === worldToSave && activeWorldSeed === seedToSave && saveSwitchId === worldSwitchId && !isWorldDeleted(seedToSave)) saveTimer = setTimeout(flushBlockSaves, 1000);
        return;
    }

    try {
        worldToSave.blocks = blocksToSave;
        worldToSave.updatedAt = new Date().toISOString();
        const saved = await storage.saveLocalWorld(worldToSave);
        if (saved && activeWorld === worldToSave && activeWorldSeed === seedToSave && saveSwitchId === worldSwitchId && !isWorldDeleted(seedToSave)) {
            activeWorld = saved;
            scheduleCloudSave(saved, saveSwitchId);
        }
    } catch (error) {
        console.warn(`Could not save world blocks for seed ${seedToSave}:`, error);
        if (activeWorld === worldToSave && activeWorldSeed === seedToSave && saveSwitchId === worldSwitchId && !isWorldDeleted(seedToSave)) saveTimer = setTimeout(flushBlockSaves, 1000);
    }
}

window.addEventListener("webminecraft:blockchange", event => {
    const detail = event.detail || {};
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    const type = Math.floor(Number(detail.type));
    if (![x, y, z, type].every(Number.isFinite)) return;
    queueBlockSave({ x, y, z, type }).catch(error => console.warn("Could not queue world block save:", error));
});

async function switchWorld(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;

    const switchId = ++worldSwitchId;
    clearTimeout(saveTimer);
    clearTimeout(cloudSaveTimer);
    stopLiveCloudSave();
    saveTimer = null;
    cloudSaveTimer = null;
    pendingChanges.clear();
    activeBlocks = {};
    activeWorld = null;
    activeWorldSeed = normalizedSeed;

    if (isWorldDeleted(normalizedSeed)) {
        activeWorldSeed = null;
        return null;
    }

    return loadSavedBlocks(normalizedSeed, switchId);
}

export async function setWorldSeedForPersistence(seed) {
    return switchWorld(seed);
}

export async function saveCurrentWorld() {
    if (!activeWorld || isWorldDeleted(activeWorld.seed)) return null;
    clearTimeout(saveTimer);
    saveTimer = null;
    if (pendingChanges.size > 0) await flushBlockSaves();

    if (activeWorld && !isWorldDeleted(activeWorld.seed)) {
        activeWorld.blocks = { ...activeBlocks };
        activeWorld.updatedAt = new Date().toISOString();
        writeLocalBlockSnapshot(activeWorld.seed, activeBlocks);
        writePlayerState(activeWorld.seed, true);

        const storage = await waitForStorage();
        if (storage?.saveLocalWorld && activeWorldSeed === activeWorld.seed && !isWorldDeleted(activeWorld.seed)) {
            try { activeWorld = await storage.saveLocalWorld(activeWorld) || activeWorld; } catch {}
        }
        await saveCloudNow(activeWorld, worldSwitchId);
    }
    return activeWorld;
}

export async function deleteCurrentWorld(seed) {
    const normalizedSeed = normalizeSeed(seed ?? activeWorldSeed);
    if (normalizedSeed === null) return false;

    ++worldSwitchId;
    clearTimeout(saveTimer);
    clearTimeout(cloudSaveTimer);
    stopLiveCloudSave();
    pendingChanges.clear();
    saveTimer = null;
    cloudSaveTimer = null;

    const wasActive = activeWorldSeed === normalizedSeed;
    if (wasActive) {
        activeWorld = null;
        activeWorldSeed = null;
        activeBlocks = {};
    }

    clearLocalBlockSnapshot(normalizedSeed);
    try { localStorage.removeItem(playerStateKey(normalizedSeed)); } catch {}

    const storage = await waitForStorage();
    if (!storage?.deleteLocalWorld) return false;

    try {
        await storage.deleteLocalWorld(normalizedSeed);
        return true;
    } catch (error) {
        console.warn(`Could not delete world ${normalizedSeed}:`, error);
        return false;
    }
}

async function initialize() {
    const seed = getSeedFromUrl();
    if (seed === null) return;
    await sleep(WAIT_MS);
    await switchWorld(seed);
}

window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void saveCurrentWorld();
});
window.addEventListener("pagehide", () => { void saveCurrentWorld(); });
window.addEventListener("beforeunload", () => { void saveCurrentWorld(); });

initialize().catch(error => console.warn("World persistence initialization failed:", error));
