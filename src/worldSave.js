import { setBlockAt } from "./world.js";

const DB_NAME = "webminecraft-local-worlds";
const DB_VERSION = 1;
const STORE_NAME = "worlds";
const WAIT_MS = 50;

let dbPromise = null;
let activeWorld = null;
let activeWorldSeed = null;
let activeBlocks = {};
let saveTimer = null;
let worldSwitchId = 0;
const pendingChanges = new Map();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "seed" });
                store.createIndex("updatedAt", "updatedAt", { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open browser world storage."));
    }).catch(error => {
        dbPromise = null;
        throw error;
    });
    return dbPromise;
}

function idbRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Browser world storage request failed."));
    });
}

async function getWorld(seed) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    return idbRequest(tx.objectStore(STORE_NAME).get(seed));
}

async function putWorld(world) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(world);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(world);
        tx.onerror = () => reject(tx.error || new Error("Could not save world in browser storage."));
        tx.onabort = () => reject(tx.error || new Error("Could not save world in browser storage."));
    });
}

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function getSeedFromUrl() {
    return normalizeSeed(new URLSearchParams(window.location.search).get("seed"));
}

async function ensureWorld(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;
    let world = await getWorld(normalizedSeed).catch(() => null);
    if (world) return world;
    const now = new Date().toISOString();
    world = {
        seed: normalizedSeed,
        name: `World ${normalizedSeed}`,
        createdAt: now,
        updatedAt: now,
        blocks: {}
    };
    try {
        await putWorld(world);
        return world;
    } catch {
        return null;
    }
}

async function resolveActiveWorld(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;
    if (activeWorld && activeWorld.seed === normalizedSeed && activeWorldSeed === normalizedSeed) return activeWorld;
    const world = await ensureWorld(normalizedSeed);
    if (switchId === worldSwitchId) {
        activeWorld = world;
        activeWorldSeed = normalizedSeed;
    }
    return world;
}

async function loadSavedBlocks(seed, switchId) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return;
    try {
        const world = await resolveActiveWorld(normalizedSeed, switchId);
        if (!world || switchId !== worldSwitchId || activeWorld?.seed !== normalizedSeed) return;

        activeBlocks = world.blocks && typeof world.blocks === "object" ? { ...world.blocks } : {};
        for (const [key, value] of Object.entries(activeBlocks)) {
            if (switchId !== worldSwitchId || activeWorld?.seed !== normalizedSeed) return;
            const parts = key.split(",").map(Number);
            if (parts.length !== 3 || parts.some(number => !Number.isFinite(number))) continue;
            const type = Number(value);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }
    } catch (error) {
        console.warn("Could not load saved world blocks from browser storage:", error);
    }
}

async function queueBlockSave(change) {
    const seed = getSeedFromUrl();
    if (seed === null) return;

    const world = activeWorld && activeWorld.seed === seed
        ? activeWorld
        : await resolveActiveWorld(seed, worldSwitchId);
    if (!world || world.seed !== seed || activeWorld?.seed !== seed) return;

    const key = `${change.x},${change.y},${change.z}`;
    activeBlocks[key] = change.type;
    pendingChanges.set(key, change);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushBlockSaves, 500);
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld || pendingChanges.size === 0) return;

    const worldToSave = activeWorld;
    const seedToSave = activeWorld.seed;
    const blocksToSave = { ...activeBlocks };
    pendingChanges.clear();

    try {
        worldToSave.blocks = blocksToSave;
        worldToSave.updatedAt = new Date().toISOString();
        await putWorld(worldToSave);
    } catch (error) {
        console.warn(`Could not save world blocks for seed ${seedToSave}:`, error);
        if (activeWorld === worldToSave && activeWorld.seed === seedToSave) {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(flushBlockSaves, 1500);
        }
    }
}

window.addEventListener("webminecraft:blockchange", event => {
    const detail = event.detail || {};
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    const type = Math.floor(Number(detail.type));
    if (![x, y, z, type].every(Number.isFinite)) return;
    queueBlockSave({ x, y, z, type }).catch(error => console.warn("Could not queue browser world block save:", error));
});

export async function setWorldSeedForPersistence(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;

    const switchId = ++worldSwitchId;
    clearTimeout(saveTimer);
    saveTimer = null;
    pendingChanges.clear();
    activeBlocks = {};
    activeWorld = null;
    activeWorldSeed = normalizedSeed;

    try {
        const world = await resolveActiveWorld(normalizedSeed, switchId);
        await loadSavedBlocks(normalizedSeed, switchId);
        if (switchId !== worldSwitchId) return null;
        return world;
    } catch (error) {
        console.warn("Could not switch browser saved world persistence:", error);
        return null;
    }
}

async function initialize() {
    const seed = getSeedFromUrl();
    if (seed === null) return;
    await sleep(0);
    const switchId = worldSwitchId;
    await loadSavedBlocks(seed, switchId);
}

window.webMinecraftWorldSave = { setWorldSeedForPersistence };
initialize().catch(error => console.warn("Browser world persistence setup failed:", error));
