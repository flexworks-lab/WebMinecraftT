const DB_NAME = "webminecraft-local-worlds";
const DB_VERSION = 1;
const STORE_NAME = "worlds";
const CHUNK_SIZE = 16;
const DELETED_KEY = "webminecraft_deleted_worlds";
const CLOUD_DELETED_COLLECTION = "deletedWorlds";

// Cloud world sync is optional and must never prevent local/browser world saves from working.
let authPromise = null;
let syncTimer = null;

function waitForFirebase(timeout = 15000) {
    if (authPromise) return authPromise;
    authPromise = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                if (window.firebase?.apps?.length && window.firebase.auth && window.firebase.firestore) {
                    resolve(window.firebase.auth());
                    return;
                }
            } catch {}
            if (Date.now() - started >= timeout) { resolve(null); return; }
            setTimeout(check, 100);
        };
        check();
    });
    return authPromise;
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "seed" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open local world storage."));
    });
}

function getLocalWorld(seed) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(Number(seed));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    }));
}

function putLocalWorld(world) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(world);
        tx.oncomplete = () => resolve(world);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    }));
}

function deleteLocalWorld(seed) {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(Number(seed));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    }));
}

function getDeletedSeeds() {
    try {
        const values = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
        return new Set(Array.isArray(values) ? values.map(Number).filter(Number.isFinite) : []);
    } catch {
        return new Set();
    }
}

function rememberDeletedSeed(seed) {
    const deleted = getDeletedSeeds();
    deleted.add(Number(seed));
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted])); } catch {}
}

function clearDeletedSeed(seed) {
    const deleted = getDeletedSeeds();
    deleted.delete(Number(seed));
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted])); } catch {}
}

function firestore() { return window.firebase.firestore(); }
function userRoot(uid) { return firestore().collection("users").doc(uid); }
function worldRef(uid, seed) { return userRoot(uid).collection("worlds").doc(String(seed)); }
function cloudDeletedRef(uid, seed) { return userRoot(uid).collection(CLOUD_DELETED_COLLECTION).doc(String(seed)); }

async function isCloudWorldDeleted(uid, seed) {
    const snap = await cloudDeletedRef(uid, seed).get();
    return snap.exists;
}

async function getUser() {
    const auth = await waitForFirebase();
    return auth?.currentUser || null;
}

function chunkKeyFromBlockKey(key) {
    const [x, , z] = String(key).split(",").map(Number);
    if (![x, z].every(Number.isFinite)) return null;
    return `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;
}

function splitBlocksIntoChunks(blocks) {
    const chunks = new Map();
    for (const [key, type] of Object.entries(blocks || {})) {
        const chunk = chunkKeyFromBlockKey(key);
        if (!chunk) continue;
        if (!chunks.has(chunk)) chunks.set(chunk, {});
        chunks.get(chunk)[key] = Number(type);
    }
    return chunks;
}

async function uploadWorld(world) {
    const user = await getUser();
    const seed = Number(world?.seed);
    if (!user || !world || !Number.isFinite(seed) || getDeletedSeeds().has(seed)) return false;
    if (await isCloudWorldDeleted(user.uid, seed)) return false;

    const ref = worldRef(user.uid, seed);
    await ref.set({
        name: String(world.name || `World ${seed}`),
        seed,
        createdAt: world.createdAt || new Date().toISOString(),
        updatedAt: world.updatedAt || new Date().toISOString(),
        deleted: false
    }, { merge: true });

    const chunks = splitBlocksIntoChunks(world.blocks || {});
    const existing = await ref.collection("data").get();
    const wanted = new Set(chunks.keys());
    for (const doc of existing.docs) {
        if (!wanted.has(doc.id)) await doc.ref.delete();
    }
    for (const [chunk, blocks] of chunks) {
        await ref.collection("data").doc(chunk).set({ blocks, updatedAt: world.updatedAt || new Date().toISOString() });
    }
    return true;
}

export async function saveCloudWorld(world) {
    try { return await uploadWorld(world); }
    catch (error) { console.warn("Cloud world save failed:", error); return false; }
}

export async function loadCloudWorld(seed, localWorld = null) {
    try {
        const numberSeed = Number(seed);
        if (getDeletedSeeds().has(numberSeed)) return null;
        const user = await getUser();
        if (!user) return localWorld;
        if (await isCloudWorldDeleted(user.uid, numberSeed)) {
            rememberDeletedSeed(numberSeed);
            await deleteLocalWorld(numberSeed).catch(() => {});
            return null;
        }
        const ref = worldRef(user.uid, numberSeed);
        const metaSnap = await ref.get();
        if (!metaSnap.exists) return localWorld;
        const meta = metaSnap.data() || {};
        if (meta.deleted === true) {
            await deleteLocalWorld(numberSeed);
            rememberDeletedSeed(numberSeed);
            return null;
        }
        const cloudTime = new Date(meta.updatedAt || 0).getTime();
        const localTime = new Date(localWorld?.updatedAt || 0).getTime();
        if (localWorld && localTime > cloudTime) {
            await uploadWorld(localWorld);
            return localWorld;
        }
        const dataSnap = await ref.collection("data").get();
        const blocks = {};
        for (const doc of dataSnap.docs) {
            const chunkBlocks = doc.data()?.blocks;
            if (!chunkBlocks || typeof chunkBlocks !== "object") continue;
            Object.assign(blocks, chunkBlocks);
        }
        const world = {
            seed: Number(meta.seed ?? seed),
            name: String(meta.name || localWorld?.name || `World ${seed}`),
            createdAt: meta.createdAt || localWorld?.createdAt || new Date().toISOString(),
            updatedAt: meta.updatedAt || localWorld?.updatedAt || new Date().toISOString(),
            blocks
        };
        await putLocalWorld(world);
        return world;
    } catch (error) {
        console.warn("Cloud world load failed:", error);
        return localWorld;
    }
}

export async function syncCloudWorlds() {
    try {
        const user = await getUser();
        if (!user) return false;
        const root = userRoot(user.uid);
        const worldsRef = root.collection("worlds");
        const snapshot = await worldsRef.get();
        const deletedSnapshot = await root.collection(CLOUD_DELETED_COLLECTION).get().catch(() => null);
        const cloudDeleted = new Set();
        for (const doc of deletedSnapshot?.docs || []) {
            const seed = Number(doc.data()?.seed ?? doc.id);
            if (Number.isFinite(seed)) cloudDeleted.add(seed);
        }
        const localDeleted = getDeletedSeeds();

        for (const seed of localDeleted) {
            cloudDeleted.add(seed);
            const existing = snapshot.docs.find(doc => Number(doc.id) === seed);
            if (existing) await markCloudWorldDeleted(seed, false).catch(() => {});
            await deleteLocalWorld(seed).catch(() => {});
        }

        for (const doc of snapshot.docs) {
            const meta = doc.data() || {};
            const seed = Number(meta.seed ?? doc.id);
            if (!Number.isFinite(seed)) continue;

            if (meta.deleted === true || cloudDeleted.has(seed)) {
                rememberDeletedSeed(seed);
                await deleteLocalWorld(seed).catch(() => {});
                continue;
            }

            const local = await getLocalWorld(seed).catch(() => null);
            const cloudTime = new Date(meta.updatedAt || 0).getTime();
            const localTime = new Date(local?.updatedAt || 0).getTime();
            if (!local || cloudTime > localTime) {
                await putLocalWorld({
                    seed,
                    name: String(meta.name || `World ${seed}`),
                    createdAt: meta.createdAt || new Date().toISOString(),
                    updatedAt: meta.updatedAt || new Date().toISOString(),
                    blocks: local?.blocks || {}
                });
            } else if (localTime > cloudTime && !cloudDeleted.has(seed)) {
                await uploadWorld(local);
            }
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function markCloudWorldDeleted(seed, remember = true) {
    const numberSeed = Number(seed);
    const user = await getUser();
    if (!user || !Number.isFinite(numberSeed)) return false;
    if (remember) rememberDeletedSeed(numberSeed);

    const now = new Date().toISOString();
    try {
        // Permanent tombstone: it survives browser/cache resets and stops the world from being recreated.
        await cloudDeletedRef(user.uid, numberSeed).set({ seed: numberSeed, deletedAt: now });

        const ref = worldRef(user.uid, numberSeed);
        const data = await ref.collection("data").get();
        for (const doc of data.docs) await doc.ref.delete();
        await ref.set({
            seed: numberSeed,
            deleted: true,
            deletedAt: now,
            updatedAt: now
        }, { merge: true });
        return true;
    } catch {
        return false;
    }
}

export async function deleteCloudWorld(seed, remember = true) {
    try {
        const numberSeed = Number(seed);
        if (remember) rememberDeletedSeed(numberSeed);
        await deleteLocalWorld(numberSeed).catch(() => {});
        await markCloudWorldDeleted(numberSeed, false);
        return true;
    } catch {
        return true;
    }
}

export async function clearCloudWorldDeletion(seed) {
    const numberSeed = Number(seed);
    const user = await getUser();
    if (!user || !Number.isFinite(numberSeed)) return false;
    try { await cloudDeletedRef(user.uid, numberSeed).delete(); } catch {}
    clearDeletedSeed(numberSeed);
    return true;
}

window.webMinecraftCloudSync = syncCloudWorlds;
window.webMinecraftDeleteCloudWorld = deleteCloudWorld;
window.webMinecraftClearCloudWorldDeletion = clearCloudWorldDeletion;

function watchAuth() {
    waitForFirebase().then(auth => {
        if (!auth) return;
        auth.onAuthStateChanged(user => {
            if (syncTimer) clearTimeout(syncTimer);
            if (!user) return;
            syncTimer = setTimeout(() => syncCloudWorlds(), 50);
        });
    });
}

watchAuth();
