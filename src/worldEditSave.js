import { getLocalWorld, saveLocalWorld, isWorldDeleted } from "./worlds.js";
import { loadCloudWorld, saveCloudWorld } from "./cloudWorlds.js";

const SNAPSHOT_PREFIX = "webminecraft-singleplayer-world-blocks-";
const SAVE_DELAY_MS = 150;

let timer = null;
let saving = false;
let queuedSeed = null;

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function currentSeed() {
    return normalizeSeed(new URLSearchParams(window.location.search).get("seed"));
}

function snapshotKey(seed) {
    const normalized = normalizeSeed(seed);
    return normalized === null ? null : `${SNAPSHOT_PREFIX}${normalized}`;
}

function readSnapshot(seed) {
    const key = snapshotKey(seed);
    if (!key) return {};
    try {
        const value = JSON.parse(localStorage.getItem(key) || "{}");
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch { return {}; }
}

function writeSnapshot(seed, blocks) {
    const key = snapshotKey(seed);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(blocks || {})); } catch {}
}

async function persistSeed(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed) || saving) return;
    saving = true;
    try {
        const world = await getLocalWorld(normalizedSeed);
        if (!world || isWorldDeleted(normalizedSeed)) return;

        const snapshot = readSnapshot(normalizedSeed);
        const blocks = {
            ...(world.blocks && typeof world.blocks === "object" ? world.blocks : {}),
            ...snapshot
        };
        writeSnapshot(normalizedSeed, blocks);

        const updated = await saveLocalWorld({
            ...world,
            seed: normalizedSeed,
            blocks,
            updatedAt: new Date().toISOString()
        });

        if (updated && typeof window.webMinecraftSaveCloudWorld === "function") {
            try { await window.webMinecraftSaveCloudWorld(updated); } catch {}
        } else if (updated) {
            const cloud = await loadCloudWorld(normalizedSeed, updated).catch(() => null);
            if (cloud && typeof saveCloudWorld === "function") {
                try { await saveCloudWorld(updated); } catch {}
            }
        }
    } catch (error) {
        console.warn("World edit save failed:", error);
    } finally {
        saving = false;
    }
}

function scheduleSave(seed) {
    queuedSeed = seed;
    clearTimeout(timer);
    timer = setTimeout(async () => {
        const saveSeed = queuedSeed;
        queuedSeed = null;
        await persistSeed(saveSeed);
    }, SAVE_DELAY_MS);
}

window.addEventListener("webminecraft:blockchange", event => {
    const seed = currentSeed();
    if (seed === null || isWorldDeleted(seed)) return;
    const detail = event.detail || {};
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    const type = Math.floor(Number(detail.type));
    if (![x, y, z, type].every(Number.isFinite)) return;

    const snapshot = readSnapshot(seed);
    snapshot[`${x},${y},${z}`] = type;
    writeSnapshot(seed, snapshot);
    scheduleSave(seed);
});

window.addEventListener("pagehide", () => {
    const seed = currentSeed();
    if (seed !== null) void persistSeed(seed);
});

window.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    const seed = currentSeed();
    if (seed !== null) void persistSeed(seed);
});
