const DB_NAME = "webminecraft-local-worlds";
const STORE_NAME = "worlds";
const KNOWN_SEEDS_KEY = "webminecraft-known-world-seeds";
const SYNC_ROOT = "webminecraftWorldSync";
const POLL_MS = 4000;

let started = false;
let lastLocalSeeds = new Set();
let syncBusy = false;

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

function getLocalSeeds() {
    return new Promise((resolve, reject) => {
        let request;
        try { request = indexedDB.open(DB_NAME, 1); }
        catch (error) { reject(error); return; }
        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                resolve(new Set());
                db.close();
                return;
            }
            let tx;
            try { tx = db.transaction(STORE_NAME, "readonly"); }
            catch (error) { db.close(); reject(error); return; }
            const getAll = tx.objectStore(STORE_NAME).getAll();
            getAll.onsuccess = () => {
                const seeds = new Set((getAll.result || []).map(world => normalizedSeed(world?.seed)).filter(value => value !== null));
                db.close();
                resolve(seeds);
            };
            getAll.onerror = () => { const error = getAll.error || new Error("Could not read saved worlds."); db.close(); reject(error); };
        };
        request.onerror = () => reject(request.error || new Error("Could not open saved worlds."));
    });
}

function deleteLocalSeed(seed) {
    return new Promise((resolve, reject) => {
        let request;
        try { request = indexedDB.open(DB_NAME, 1); }
        catch (error) { reject(error); return; }
        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.close();
                resolve();
                return;
            }
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).delete(seed);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { const error = tx.error || new Error("Could not delete synced world."); db.close(); reject(error); };
            tx.onabort = () => { const error = tx.error || new Error("Could not delete synced world."); db.close(); reject(error); };
        };
        request.onerror = () => reject(request.error || new Error("Could not open saved worlds."));
    });
}

function syncCollection(db, uid) {
    return db.collection(SYNC_ROOT).doc(uid).collection("deleted");
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
    } catch (error) {
        console.warn("World deletion sync unavailable:", error);
    } finally {
        syncBusy = false;
    }
}

function start() {
    if (started) return;
    started = true;
    syncOnce();
    window.setInterval(syncOnce, POLL_MS);
    window.addEventListener("webminecraft-worlds-changed", syncOnce);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
