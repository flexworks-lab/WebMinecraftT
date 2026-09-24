import { setBlockAt } from "./world.js";
import { loadCloudWorld, saveCloudWorld } from "./cloudWorlds.js";
import { isWorldDeleted } from "./worlds.js";

const WAIT_MS = 50;
const LOCAL_SAVE_DELAY_MS = 350;
const CLOUD_SAVE_DELAY_MS = 1500;
const LIVE_CLOUD_SAVE_MS = 5000;

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

async function waitForStorage(timeout = 10000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
        const storage = window.webMinecraftWorldStorage;
        if (storage && typeof storage.getLocalWorld === "function") return storage;
        await sleep(50);
    }
    return null;
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
    return world;
}

async function loadSavedBlocks(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed)) return null;

    try {
        let world = await resolveActiveWorld(normalizedSeed, switchId);
        if (switchId !== worldSwitchId || isWorldDeleted(normalizedSeed)) return null;

        world = await loadCloudWorld(normalizedSeed, world);
        if (switchId !== worldSwitchId || !world || isWorldDeleted(normalizedSeed)) return null;

        activeWorld = {
            ...world,
            seed: normalizedSeed,
            blocks: world.blocks && typeof world.blocks === "object" ? { ...world.blocks } : {}
        };
        activeWorldSeed = normalizedSeed;
        activeBlocks = { ...activeWorld.blocks };

        const storage = await waitForStorage();
        if (!storage || isWorldDeleted(normalizedSeed) || switchId !== worldSwitchId) return null;
        if (storage.saveLocalWorld) await storage.saveLocalWorld(activeWorld).catch(() => {});

        for (const [key, value] of Object.entries(activeBlocks)) {
            if (switchId !== worldSwitchId || activeWorldSeed !== normalizedSeed || isWorldDeleted(normalizedSeed)) return null;
            const parts = key.split(",").map(Number);
            if (parts.length !== 3 || parts.some(number => !Number.isFinite(number))) continue;
            const type = Number(value);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }

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
        void saveCloudNow(activeWorld, worldSwitchId);
    }, LIVE_CLOUD_SAVE_MS);
}

function stopLiveCloudSave() {
    clearInterval(liveCloudSaveTimer);
    liveCloudSaveTimer = null;
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld || pendingChanges.size === 0) return;

    const worldToSave = activeWorld;
    const seedToSave = worldToSave.seed;
    const saveSwitchId = worldSwitchId;
    if (isWorldDeleted(seedToSave)) {
        pendingChanges.clear();
        return;
    }

    const blocksToSave = { ...activeBlocks };
    pendingChanges.clear();

    const storage = await waitForStorage();
    if (!storage?.saveLocalWorld || saveSwitchId !== worldSwitchId || activeWorld !== worldToSave || isWorldDeleted(seedToSave)) {
        if (activeWorld === worldToSave && activeWorldSeed === seedToSave && saveSwitchId === worldSwitchId && !isWorldDeleted(seedToSave)) saveTimer = setTimeout(flushBlockSaves, 1000);
        return;
    }

    try {
        worldToSave.blocks = blocksToSave;
        worldToSave.updatedAt = new Date().toISOString();
        if (isWorldDeleted(seedToSave) || saveSwitchId !== worldSwitchId) return;
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

export async function setWorldSeedForPersistence(seed) {
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

    try {
        const world = await loadSavedBlocks(normalizedSeed, switchId);
        if (switchId !== worldSwitchId || isWorldDeleted(normalizedSeed)) return null;
        return world;
    } catch (error) {
        console.warn("Could not switch world persistence:", error);
        return null;
    }
}

export async function saveCurrentWorld() {
    if (!activeWorld || isWorldDeleted(activeWorld.seed)) return null;
    clearTimeout(saveTimer);
    saveTimer = null;
    if (pendingChanges.size > 0) await flushBlockSaves();
    if (activeWorld && !isWorldDeleted(activeWorld.seed)) {
        activeWorld.updatedAt = new Date().toISOString();
        const storage = await waitForStorage();
        if (storage?.saveLocalWorld && activeWorldSeed === activeWorld.seed && !isWorldDeleted(activeWorld.seed)) {
            try { activeWorld = await storage.saveLocalWorld(activeWorld) || activeWorld; } catch {}
        }
        // Do not wait for the delayed timer when the player is leaving the world.
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
    await setWorldSeedForPersistence(seed);
}

window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void saveCurrentWorld();
});
window.addEventListener("pagehide", () => { void saveCurrentWorld(); });
window.addEventListener("beforeunload", () => { void saveCurrentWorld(); });

initialize().catch(error => console.warn("World persistence initialization failed:", error));
