const KNOWN_SEEDS_KEY = "webminecraft-known-world-seeds";
const POLL_MS = 4000;

let started = false;
let lastLocalSeeds = new Set();
let syncBusy = false;
let storageWarningShown = false;

function getUser() {
    try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; }
}

function getFirestore() {
    try { return window.firebase?.firestore?.() || null; } catch { return null; }
}

function normalizedSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.floor(Math.abs(number)) >>> 0 : null;
}

function readKnownSeeds() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KNOWN_SEEDS_KEY) || "[]");
        return new Set(Array.isArray(parsed) ? parsed.map(normalizedSeed).filter(value => value !== null) : []);
    } catch {
        return new Set();
    }
}

function writeKnownSeeds(seeds) {
    try { localStorage.setItem(KNOWN_SEEDS_KEY, JSON.stringify([...seeds])); } catch {}
}

async function getLocalSeeds() {
    const storage = window.webMinecraftWorldStorage;
    if (!storage) return new Set();

    // Browser world storage is centralized in worlds.js. Never open IndexedDB
    // directly from the 4-second cloud deletion-sync loop.
    if (typeof storage.getLocalSeeds === "function") {
        const seeds = await storage.getLocalSeeds();
        return new Set([...seeds].map(normalizedSeed).filter(value => value !== null));
    }

    if (typeof window.webMinecraftBrowserWorldStorage?.getAllWorlds === "function") {
        const worlds = await window.webMinecraftBrowserWorldStorage.getAllWorlds();
        return new Set(worlds.map(world => normalizedSeed(world?.seed)).filter(value => value !== null));
    }

    return new Set();
}

async function deleteLocalSeed(seed) {
    const storage = window.webMinecraftWorldStorage;
    if (storage?.deleteLocalWorld) {
        await storage.deleteLocalWorld(seed);
        return;
    }
    if (window.webMinecraftBrowserWorldStorage?.deleteWorld) {
        await window.webMinecraftBrowserWorldStorage.deleteWorld(seed);
    }
}

function syncCollection(db, uid) {
    return db.collection("users").doc(uid).collection("deletedWorlds");
}

async function pushDeletedSeeds(db, uid, currentSeeds) {
    const known = readKnownSeeds();
    const deleted = [...known].filter(seed => !currentSeeds.has(seed));
    if (!deleted.length) return;

    const batch = db.batch();
    const collection = syncCollection(db, uid);
    const now = Date.now();

    for (const seed of deleted) {
        batch.set(collection.doc(String(seed)), { seed, deletedAt: now });
    }

    await batch.commit();

    for (const seed of deleted) known.delete(seed);
    writeKnownSeeds(known);
}

async function pullDeletedSeeds(db, uid, currentSeeds) {
    const snapshot = await syncCollection(db, uid).get();
    if (snapshot.empty) return currentSeeds;

    let changed = false;
    const nextSeeds = new Set(currentSeeds);

    for (const doc of snapshot.docs) {
        const seed = normalizedSeed(doc.data()?.seed ?? doc.id);
        if (seed === null || !nextSeeds.has(seed)) continue;
        await deleteLocalSeed(seed);
        nextSeeds.delete(seed);
        changed = true;
    }

    if (changed) {
        lastLocalSeeds = nextSeeds;
        writeKnownSeeds(nextSeeds);
        window.dispatchEvent(new CustomEvent("webminecraft-worlds-changed"));
    }

    return nextSeeds;
}

async function syncOnce() {
    if (syncBusy) return;

    const user = getUser();
    const db = getFirestore();
    if (!user || !db) return;

    syncBusy = true;
    try {
        const currentSeeds = await getLocalSeeds();
        const known = readKnownSeeds();

        if (!known.size && currentSeeds.size) {
            writeKnownSeeds(currentSeeds);
        } else {
            await pullDeletedSeeds(db, user.uid, currentSeeds);
            const afterPull = await getLocalSeeds();
            await pushDeletedSeeds(db, user.uid, afterPull);
            writeKnownSeeds(afterPull);
            lastLocalSeeds = afterPull;
            return;
        }

        lastLocalSeeds = currentSeeds;
    } catch {
        // The browser storage layer handles its own fallback. Keep this loop
        // silent so a broken IndexedDB cannot spam the console every 4 seconds.
        if (!storageWarningShown) {
            storageWarningShown = true;
            console.warn("World sync temporarily unavailable; worlds remain stored locally.");
        }
    } finally {
        syncBusy = false;
    }
}

function start() {
    if (started) return;
    started = true;

    const begin = () => syncOnce();
    if (window.webMinecraftWorldStorage) begin();
    else window.setTimeout(begin, 250);

    window.setInterval(syncOnce, POLL_MS);
    window.addEventListener("webminecraft-worlds-changed", syncOnce);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
