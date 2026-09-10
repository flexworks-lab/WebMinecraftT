const DB_NAME = "webminecraft-local-worlds";
const DB_VERSION = 1;
const STORE_NAME = "worlds";
const CHUNK_SIZE = 16;
const DELETED_KEY = "webminecraft_deleted_worlds";

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

function firestore() { return window.firebase.firestore(); }
function worldRef(uid, seed) { return firestore().collection("users").doc(uid).collection("worlds").doc(String(seed)); }
function deletedRef(uid, seed) { return firestore().collection("users").doc(uid).collection("deletedWorlds").doc(String(seed)); }

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
    if (!user || !world || getDeletedSeeds().has(Number(world.seed))) return false;
    const ref = worldRef(user.uid, world.seed);
    await ref.set({
        name: String(world.name || `World ${world.seed}`),
        seed: Number(world.seed),
        createdAt: world.createdAt || new Date().toISOString(),
        updatedAt: world.updatedAt || new Date().toISOString()
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
        const deletedSnap = await deletedRef(user.uid, numberSeed).get();
        if (deletedSnap.exists) {
            await deleteLocalWorld(numberSeed);
            rememberDeletedSeed(numberSeed);
            return null;
        }
        const ref = worldRef(user.uid, seed);
        const metaSnap = await ref.get();
        if (!metaSnap.exists) return localWorld;
        const meta = metaSnap.data() || {};
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
        const userRef = firestore().collection("users").doc(user.uid);
        const worldsRef = userRef.collection("worlds");
        const deletedSnapshot = await userRef.collection("deletedWorlds").get();
        const cloudDeleted = new Set(deletedSnapshot.docs.map(doc => Number(doc.id)).filter(Number.isFinite));
        const localDeleted = getDeletedSeeds();

        for (const seed of localDeleted) {
            if (!cloudDeleted.has(seed)) {
                await deleteCloudWorld(seed, false);
                cloudDeleted.add(seed);
            }
            await deleteLocalWorld(seed).catch(() => {});
        }

        const snapshot = await worldsRef.get();
        for (const doc of snapshot.docs) {
            const meta = doc.data() || {};
            const seed = Number(meta.seed ?? doc.id);
            if (!Number.isFinite(seed) || cloudDeleted.has(seed)) {
                if (cloudDeleted.has(seed)) await deleteCloudWorld(seed, false).catch(() => {});
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
            } else if (localTime > cloudTime) {
                await uploadWorld(local);
            }
        }
        return true;
    } catch (error) {
        console.warn("Cloud world sync failed:", error);
        return false;
    }
}

export async function deleteCloudWorld(seed, remember = true) {
    try {
        const numberSeed = Number(seed);
        const user = await getUser();
        if (!user) return false;
        if (remember) rememberDeletedSeed(numberSeed);
        await deleteLocalWorld(numberSeed).catch(() => {});
        const ref = worldRef(user.uid, numberSeed);
        const data = await ref.collection("data").get();
        for (const doc of data.docs) await doc.ref.delete();
        await ref.delete();
        await deletedRef(user.uid, numberSeed).set({ deletedAt: new Date().toISOString(), seed: numberSeed });
        return true;
    } catch (error) {
        console.warn("Cloud world delete failed:", error);
        return false;
    }
}

window.webMinecraftCloudSync = syncCloudWorlds;
window.webMinecraftDeleteCloudWorld = deleteCloudWorld;

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
