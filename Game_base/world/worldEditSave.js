import { getLocalWorld, saveLocalWorld, isWorldDeleted } from "./worlds.js";
import { getWorldSeed } from "./world.js";
import { saveCloudWorld } from "./cloudWorlds.js";

const SNAPSHOT_PREFIX = "webminecraft-singleplayer-world-blocks-";
const SAVE_DELAY_MS = 180;
const RETRY_DELAY_MS = 750;

let timer = null;
let saving = false;
let queuedSeeds = new Set();
const revisions = new Map();

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function currentSeed() {
    const worldSeed = normalizeSeed(typeof getWorldSeed === "function" ? getWorldSeed() : null);
    if (worldSeed !== null) return worldSeed;
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
    } catch {
        return {};
    }
}

function writeSnapshot(seed, blocks) {
    const key = snapshotKey(seed);
    if (!key) return false;
    try {
        localStorage.setItem(key, JSON.stringify(blocks || {}));
        return true;
    } catch (error) {
        console.warn("Block snapshot save failed:", error);
        return false;
    }
}

function bumpRevision(seed) {
    const normalized = normalizeSeed(seed);
    if (normalized === null) return 0;
    const next = (revisions.get(normalized) || 0) + 1;
    revisions.set(normalized, next);
    return next;
}

function queueSeed(seed, delay = SAVE_DELAY_MS) {
    const normalized = normalizeSeed(seed);
    if (normalized === null || isWorldDeleted(normalized)) return;
    queuedSeeds.add(normalized);
    clearTimeout(timer);
    timer = setTimeout(flushQueue, delay);
}

async function persistSeed(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed)) return;

    const revisionAtStart = revisions.get(normalizedSeed) || 0;
    const snapshot = readSnapshot(normalizedSeed);
    if (!Object.keys(snapshot).length) return;

    try {
        const world = await getLocalWorld(normalizedSeed);
        if (!world || isWorldDeleted(normalizedSeed)) {
            queueSeed(normalizedSeed, RETRY_DELAY_MS);
            return;
        }

        const latestSnapshot = readSnapshot(normalizedSeed);
        const blocks = {
            ...(world.blocks && typeof world.blocks === "object" ? world.blocks : {}),
            ...latestSnapshot
        };
        const updatedWorld = {
            ...world,
            seed: normalizedSeed,
            blocks,
            updatedAt: new Date().toISOString()
        };

        await saveLocalWorld(updatedWorld);

        // Cloud sync is best-effort. Local persistence never depends on Firebase.
        try {
            await saveCloudWorld(updatedWorld);
        } catch (error) {
            console.warn("Cloud block save failed:", error);
        }

        if ((revisions.get(normalizedSeed) || 0) !== revisionAtStart) {
            queueSeed(normalizedSeed, SAVE_DELAY_MS);
        }
    } catch (error) {
        console.warn(`World block save failed for seed ${normalizedSeed}:`, error);
        queueSeed(normalizedSeed, RETRY_DELAY_MS);
    }
}

async function flushQueue() {
    timer = null;
    if (saving || queuedSeeds.size === 0) return;

    saving = true;
    const seeds = [...queuedSeeds];
    queuedSeeds.clear();

    try {
        for (const seed of seeds) {
            await persistSeed(seed);
        }
    } finally {
        saving = false;
        if (queuedSeeds.size) queueSeed([...queuedSeeds][0], SAVE_DELAY_MS);
    }
}

function recordBlockChange(seed, detail) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || isWorldDeleted(normalizedSeed)) return;

    const x = Math.floor(Number(detail?.x));
    const y = Math.floor(Number(detail?.y));
    const z = Math.floor(Number(detail?.z));
    const type = Math.floor(Number(detail?.type));
    if (![x, y, z, type].every(Number.isFinite)) return;

    const snapshot = readSnapshot(normalizedSeed);
    snapshot[`${x},${y},${z}`] = type;

    // This is the authoritative local save. It is synchronous, so a tab close
    // immediately after breaking/placing a block cannot discard the edit.
    writeSnapshot(normalizedSeed, snapshot);
    bumpRevision(normalizedSeed);
    queueSeed(normalizedSeed);
}

window.addEventListener("webminecraft:blockchange", event => {
    recordBlockChange(currentSeed(), event.detail || {});
});

function flushCurrentWorld() {
    const seed = currentSeed();
    if (seed === null || isWorldDeleted(seed)) return;
    // The snapshot was already written synchronously on every edit. This only
    // asks the asynchronous world/cloud records to catch up when possible.
    bumpRevision(seed);
    queueSeed(seed, 0);
}

window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCurrentWorld();
});
window.addEventListener("pagehide", flushCurrentWorld);
