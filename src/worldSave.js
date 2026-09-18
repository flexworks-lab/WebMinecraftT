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
let worldDirty = false;
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

function readWorldPreview(seed) {
    const normalized = normalizeSeed(seed);
    if (normalized === null) return null;
    try {
        const value = localStorage.getItem(`webminecraft-world-preview-${normalized}`);
        return typeof value === "string" && value.startsWith("data:image/") ? value : null;
    } catch { return null; }
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
        17: "oak_door_bottom.png",
        18: "bricks.png",
        19: "stone_bricks.png",
        20: "cracked_stone_bricks.png",
        21: "mossy_stone_bricks.png",
        22: "dirt_path_top.png",
        23: "acacia_planks.png",
        24: "bamboo_planks.png",
        25: "birch_planks.png",
        26: "crimson_planks.png",
        27: "dark_oak_planks.png",
        28: "jungle_planks.png",
        29: "mangrove_planks.png",
        30: "spruce_planks.png",
        31: "warped_planks.png",
        32: "blast_furnace_front.png",
        33: "chiseled_deepslate.png",
        34: "cobbled_deepslate.png",
        35: "cracked_deepslate_bricks.png",
        36: "cracked_deepslate_tiles.png",
        37: "deepslate.png",
        38: "deepslate_bricks.png",
        39: "deepslate_coal_ore.png",
        40: "deepslate_copper_ore.png",
        41: "deepslate_diamond_ore.png",
        42: "deepslate_emerald_ore.png",
        43: "deepslate_gold_ore.png",
        44: "deepslate_iron_ore.png",
        45: "deepslate_lapis_ore.png",
        46: "deepslate_redstone_ore.png",
        47: "deepslate_tiles.png",
        48: "polished_deepslate.png",
        49: "reinforced_deepslate_top.png",
        50: "furnace_front.png",
        51: "stone.png",
        52: "cobblestone.png",
        53: "stone_bricks.png",
        54: "cracked_stone_bricks.png",
        55: "mossy_stone_bricks.png",
        56: "oak_planks.png",
        57: "acacia_planks.png",
        58: "bamboo_planks.png",
        59: "birch_planks.png",
        60: "crimson_planks.png",
        61: "dark_oak_planks.png",
        62: "jungle_planks.png",
        63: "mangrove_planks.png",
        64: "spruce_planks.png",
        65: "warped_planks.png",
        66: "chiseled_deepslate.png",
        67: "cobbled_deepslate.png",
        68: "cracked_deepslate_bricks.png",
        69: "cracked_deepslate_tiles.png",
        70: "deepslate.png",
        71: "deepslate_bricks.png",
        72: "deepslate_tiles.png",
        73: "polished_deepslate.png",
        74: "reinforced_deepslate_top.png"
    };
    return textures[Number(itemId)] || null;
}

function normalizeInventory(value) {
    if (!Array.isArray(value) || value.length !== 36) return Array.from({ length: 36 }, () => null);
    return value.map(slot => {
        if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
        const itemId = Math.floor(Number(slot.itemId));
        const count = Math.max(1, Math.min(64, Math.floor(Number(slot.count))));
        return { itemId, count, texture: slot.texture || inventoryTexture(itemId) };
    });
}

function readInventory() {
    try { return normalizeInventory(JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]")); }
    catch { return Array.from({ length: 36 }, () => null); }
}

function saveWorldPreview(seed, force = false) {
    const normalized = normalizeSeed(seed);
    const renderer = window.__webminecraftRenderer;
    if (normalized === null || (!force && !worldDirty) || !renderer?.domElement) return false;
    try {
        const source = renderer.domElement;
        if (!source.width || !source.height) return false;
        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 236;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.62);
        if (!dataUrl || dataUrl.length < 100) return false;
        localStorage.setItem(`webminecraft-world-preview-${normalized}`, dataUrl);
        if (activeWorld && activeWorldSeed === normalized) activeWorld.preview = dataUrl;
        return true;
    } catch (error) {
        console.warn("Could not capture saved-world preview:", error);
        return false;
    }
}

window.webminecraftSaveWorldPreview = saveWorldPreview;
window.webminecraftSaveCurrentWorld = saveCurrentWorld;

function writePlayerState(seed, force = false) {
    const key = playerStateKey(seed);
    const camera = window.__webminecraftCamera;
    if (!key || !camera || (!force && window.__webminecraftMultiplayerActive === true)) return;

    let existing = {};
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || "{}");
        if (parsed && typeof parsed === "object") existing = parsed;
    } catch {}

    const state = {
        ...existing,
        version: 2,
        seed: normalizeSeed(seed),
        position: existing.position && Number.isFinite(Number(existing.position.x)) && Number.isFinite(Number(existing.position.y)) && Number.isFinite(Number(existing.position.z))
            ? existing.position
            : { x: Number(camera.position.x), y: Number(camera.position.y), z: Number(camera.position.z) },
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

        const liveEdits = {};
        for (const change of pendingChanges.values()) {
            liveEdits[`${change.x},${change.y},${change.z}`] = change.type;
        }

        const mergedBlocks = { ...cloudBlocks, ...localBlocks, ...storedBlocks, ...liveEdits };

        const baseWorld = cloudWorld || localWorld;
        if (!baseWorld) return null;
        const storedPreview = baseWorld?.preview || localWorld?.preview || readWorldPreview(normalizedSeed);
        activeWorld = { ...baseWorld, seed: normalizedSeed, blocks: mergedBlocks, preview: storedPreview || null };
        activeWorldSeed = normalizedSeed;
        activeBlocks = { ...mergedBlocks };
        worldDirty = false;

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
        startLiveCloudSave();
        return activeWorld;
    } catch (error) {
        console.warn("Could not load saved world blocks:", error);
        return null;
    }
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

    const blocksToSave = { ...activeBlocks, ...readLocalBlockSnapshot(seedToSave) };
    pendingChanges.clear();
    activeBlocks = { ...blocksToSave };
    writeLocalBlockSnapshot(seedToSave, blocksToSave);
    writePlayerState(seedToSave, true);

    // Block edits make the world dirty. Capture a new preview now so the
    // previous snapshot remains untouched when the world is only opened.
    const previewSaved = worldDirty ? saveWorldPreview(seedToSave) : false;

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
            if (previewSaved) worldDirty = false;
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

    const seed = getSeedFromUrl();
    if (seed === null || isWorldDeleted(seed)) return;
    const key = `${x},${y},${z}`;
    activeBlocks[key] = type;
    pendingChanges.set(key, { x, y, z, type });
    worldDirty = true;
    writeLocalBlockSnapshot(seed, activeBlocks);
    writePlayerState(seed);

    // Mirror the edit into the active world, but let worldEditSave.js be the only
    // module responsible for persisting block edits to the browser world record.
    if (activeWorld && activeWorldSeed === seed) {
        activeWorld.blocks = { ...activeWorld.blocks, ...activeBlocks };
        activeWorld.updatedAt = new Date().toISOString();
    }
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
    worldDirty = false;

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
        const savedBlocks = { ...activeBlocks, ...readLocalBlockSnapshot(activeWorld.seed) };
        activeBlocks = savedBlocks;
        activeWorld.blocks = savedBlocks;
        const savedAt = new Date().toISOString();
        activeWorld.updatedAt = savedAt;
        const previewSaved = worldDirty ? saveWorldPreview(activeWorld.seed) : false;
        writeLocalBlockSnapshot(activeWorld.seed, savedBlocks);
        writePlayerState(activeWorld.seed, true);

        const storage = await waitForStorage();
        if (storage?.saveLocalWorld && activeWorldSeed === activeWorld.seed && !isWorldDeleted(activeWorld.seed)) {
            try {
                const saved = await storage.saveLocalWorld(activeWorld);
                if (saved) activeWorld = saved;
                if (previewSaved && activeWorld === saved) worldDirty = false;
            } catch {}
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
    worldDirty = false;
    try {
        localStorage.removeItem(playerStateKey(normalizedSeed));
        localStorage.removeItem(`webminecraft-world-preview-${normalizedSeed}`);
    } catch {}

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
    if (document.visibilityState === "hidden") {
        saveWorldPreview(getSeedFromUrl());
        void saveCurrentWorld();
    }
});
window.addEventListener("pagehide", () => {
    saveWorldPreview(getSeedFromUrl());
    void saveCurrentWorld();
});
window.addEventListener("beforeunload", () => {
    saveWorldPreview(getSeedFromUrl());
    void saveCurrentWorld();
});

initialize().catch(error => console.warn("World persistence initialization failed:", error));
