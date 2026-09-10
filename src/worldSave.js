import { setBlockAt } from "./world.js";
import { loadCloudWorld, saveCloudWorld } from "./cloudWorlds.js";

const WAIT_MS = 50;

let activeWorld = null;
let activeWorldSeed = null;
let activeBlocks = {};
let saveTimer = null;
let cloudSaveTimer = null;
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
    if (normalizedSeed === null) return null;
    if (activeWorld && activeWorld.seed === normalizedSeed && activeWorldSeed === normalizedSeed) return activeWorld;

    const storage = await waitForStorage();
    if (!storage) return null;
    const world = await storage.getLocalWorld(normalizedSeed).catch(() => null);
    if (!world) return null;

    if (switchId === worldSwitchId) {
        activeWorld = { ...world, seed: normalizedSeed };
        activeWorldSeed = normalizedSeed;
    }
    return world;
}

async function loadSavedBlocks(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;

    try {
        let world = await resolveActiveWorld(normalizedSeed, switchId);
        if (switchId !== worldSwitchId) return null;

        world = await loadCloudWorld(normalizedSeed, world);
        if (switchId !== worldSwitchId || !world) return null;

        activeWorld = {
            ...world,
            seed: normalizedSeed,
            blocks: world.blocks && typeof world.blocks === "object" ? { ...world.blocks } : {}
        };
        activeWorldSeed = normalizedSeed;
        activeBlocks = { ...activeWorld.blocks };

        const storage = await waitForStorage();
        if (storage?.saveLocalWorld) await storage.saveLocalWorld(activeWorld).catch(() => {});

        for (const [key, value] of Object.entries(activeBlocks)) {
            if (switchId !== worldSwitchId || activeWorldSeed !== normalizedSeed) return null;
            const parts = key.split(",").map(Number);
            if (parts.length !== 3 || parts.some(number => !Number.isFinite(number))) continue;
            const type = Number(value);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }

        return activeWorld;
    } catch (error) {
        console.warn("Could not load saved world blocks:", error);
        return null;
    }
}

async function queueBlockSave(change) {
    const seed = getSeedFromUrl();
    if (seed === null || activeWorldSeed !== seed) return;

    const world = activeWorld?.seed === seed
        ? activeWorld
        : await resolveActiveWorld(seed, worldSwitchId);
    if (!world || world.seed !== seed || activeWorldSeed !== seed) return;

    const key = `${change.x},${change.y},${change.z}`;
    activeBlocks[key] = change.type;
    pendingChanges.set(key, change);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushBlockSaves, 350);
}

function scheduleCloudSave(world) {
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(async () => {
        cloudSaveTimer = null;
        try { await saveCloudWorld(world); }
        catch (error) { console.warn("Cloud world save failed:", error); }
    }, 1500);
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld || pendingChanges.size === 0) return;

    const worldToSave = activeWorld;
    const seedToSave = worldToSave.seed;
    const blocksToSave = { ...activeBlocks };
    pendingChanges.clear();

    const storage = await waitForStorage();
    if (!storage?.saveLocalWorld) {
        if (activeWorld === worldToSave && activeWorldSeed === seedToSave) saveTimer = setTimeout(flushBlockSaves, 1000);
        return;
    }

    try {
        worldToSave.blocks = blocksToSave;
        worldToSave.updatedAt = new Date().toISOString();
        const saved = await storage.saveLocalWorld(worldToSave);
        if (saved && activeWorld === worldToSave && activeWorldSeed === seedToSave) {
            activeWorld = saved;
            scheduleCloudSave(saved);
        }
    } catch (error) {
        console.warn(`Could not save world blocks for seed ${seedToSave}:`, error);
        if (activeWorld === worldToSave && activeWorldSeed === seedToSave) saveTimer = setTimeout(flushBlockSaves, 1000);
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
    saveTimer = null;
    cloudSaveTimer = null;
    pendingChanges.clear();
    activeBlocks = {};
    activeWorld = null;
    activeWorldSeed = normalizedSeed;

    try {
        const world = await loadSavedBlocks(normalizedSeed, switchId);
        if (switchId !== worldSwitchId) return null;
        return world;
    } catch (error) {
        console.warn("Could not switch world persistence:", error);
        return null;
    }
}

export async function saveCurrentWorld() {
    if (!activeWorld) return null;
    clearTimeout(saveTimer);
    saveTimer = null;
    if (pendingChanges.size > 0) await flushBlockSaves();
    if (activeWorld) scheduleCloudSave(activeWorld);
    return activeWorld;
}

export async function deleteCurrentWorld(seed) {
    const normalizedSeed = normalizeSeed(seed ?? activeWorldSeed);
    if (normalizedSeed === null) return false;

    const storage = await waitForStorage();
    if (!storage?.deleteLocalWorld) return false;

    clearTimeout(saveTimer);
    clearTimeout(cloudSaveTimer);
    pendingChanges.clear();
    saveTimer = null;
    cloudSaveTimer = null;

    await storage.deleteLocalWorld(normalizedSeed);
    if (activeWorldSeed === normalizedSeed) {
        activeWorld = null;
        activeWorldSeed = null;
        activeBlocks = {};
    }
    return true;
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

window.webMinecraftWorldSave = {
    setWorldSeedForPersistence,
    saveCurrentWorld,
    deleteCurrentWorld
};

initialize().catch(error => console.warn("World persistence setup failed:", error));
