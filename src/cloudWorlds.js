const DELETED_KEY = "webminecraft_deleted_worlds";
const CLOUD_DELETED_COLLECTION = "deletedWorlds";
const PENDING_DELETE_KEY = "webminecraft_pending_cloud_deletes";

let authPromise = null;
let syncRunning = false;
let deleteRetryRunning = false;

function waitForFirebase(timeout = 12000) {
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
            if (Date.now() - started >= timeout) {
                resolve(null);
                return;
            }
            setTimeout(check, 100);
        };
        check();
    });
    return authPromise;
}

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function firestore() {
    return window.firebase?.firestore?.() || null;
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
    const normalized = normalizeSeed(seed);
    if (normalized === null) return;
    const deleted = getDeletedSeeds();
    deleted.add(normalized);
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted])); } catch {}
}

function clearDeletedSeed(seed) {
    const normalized = normalizeSeed(seed);
    if (normalized === null) return;
    const deleted = getDeletedSeeds();
    deleted.delete(normalized);
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...deleted])); } catch {}
}

function getPendingDeletes() {
    try {
        const values = JSON.parse(localStorage.getItem(PENDING_DELETE_KEY) || "[]");
        return new Set(Array.isArray(values) ? values.map(normalizeSeed).filter(v => v !== null) : []);
    } catch {
        return new Set();
    }
}

function setPendingDeletes(values) {
    try { localStorage.setItem(PENDING_DELETE_KEY, JSON.stringify([...values])); } catch {}
}

function rememberPendingDelete(seed) {
    const s = normalizeSeed(seed);
    if (s === null) return;
    const pending = getPendingDeletes();
    pending.add(s);
    setPendingDeletes(pending);
}

function forgetPendingDelete(seed) {
    const s = normalizeSeed(seed);
    if (s === null) return;
    const pending = getPendingDeletes();
    pending.delete(s);
    setPendingDeletes(pending);
}

async function getUser() {
    const auth = await waitForFirebase();
    return auth?.currentUser || null;
}

function worldRef(uid, seed) {
    return firestore().collection("users").doc(uid).collection("worlds").doc(String(seed));
}

function deletedRef(uid, seed) {
    return firestore().collection("users").doc(uid).collection(CLOUD_DELETED_COLLECTION).doc(String(seed));
}

function chunkKeyFromBlockKey(key) {
    const [x, , z] = String(key).split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
    return `${Math.floor(x / 16)},${Math.floor(z / 16)}`;
}

function splitBlocksIntoChunks(blocks) {
    const chunks = new Map();
    for (const [key, value] of Object.entries(blocks || {})) {
        const chunk = chunkKeyFromBlockKey(key);
        const type = Number(value);
        if (!chunk || !Number.isFinite(type)) continue;
        if (!chunks.has(chunk)) chunks.set(chunk, {});
        chunks.get(chunk)[key] = type;
    }
    return chunks;
}

async function isCloudDeleted(user, seed) {
    const snap = await deletedRef(user.uid, seed).get();
    return snap.exists;
}

async function uploadWorld(world) {
    const user = await getUser();
    const seed = normalizeSeed(world?.seed);
    const db = firestore();
    if (!user || !db || !world || seed === null) return false;
    if (getDeletedSeeds().has(seed)) return false;
    if (await isCloudDeleted(user, seed)) return false;

    const updatedAt = world.updatedAt || new Date().toISOString();
    const metaRef = worldRef(user.uid, seed);
    await metaRef.set({
        name: String(world.name || `World ${seed}`).trim() || `World ${seed}`,
        seed,
        createdAt: world.createdAt || updatedAt,
        updatedAt,
        deleted: false
    }, { merge: true });

    const chunks = splitBlocksIntoChunks(world.blocks || {});
    const oldChunks = await metaRef.collection("data").get();
    const wanted = new Set(chunks.keys());

    for (const doc of oldChunks.docs) {
        if (!wanted.has(doc.id)) await doc.ref.delete();
    }
    for (const [chunk, blocks] of chunks) {
        await metaRef.collection("data").doc(chunk).set({ blocks, updatedAt }, { merge: false });
    }

    return true;
}

export async function saveCloudWorld(world) {
    try {
        return await uploadWorld(world);
    } catch (error) {
        console.warn("Cloud world save failed:", error);
        return false;
    }
}

export async function loadCloudWorld(seed, localWorld = null) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || getDeletedSeeds().has(normalizedSeed)) return null;

    try {
        const user = await getUser();
        const db = firestore();
        if (!user || !db) return localWorld;

        if (await isCloudDeleted(user, normalizedSeed)) {
            rememberDeletedSeed(normalizedSeed);
            return null;
        }

        const ref = worldRef(user.uid, normalizedSeed);
        const metaSnap = await ref.get();
        if (!metaSnap.exists) return localWorld;

        const meta = metaSnap.data() || {};
        if (meta.deleted === true) {
            rememberDeletedSeed(normalizedSeed);
            return null;
        }

        const dataSnap = await ref.collection("data").get();
        const blocks = {};
        for (const doc of dataSnap.docs) {
            const data = doc.data() || {};
            if (!data.blocks || typeof data.blocks !== "object") continue;
            Object.assign(blocks, data.blocks);
        }

        return {
            ...(localWorld || {}),
            seed: normalizedSeed,
            name: String(meta.name || localWorld?.name || `World ${normalizedSeed}`),
            createdAt: meta.createdAt || localWorld?.createdAt || new Date().toISOString(),
            updatedAt: meta.updatedAt || localWorld?.updatedAt || new Date().toISOString(),
            blocks
        };
    } catch (error) {
        console.warn("Cloud world load failed:", error);
        return localWorld;
    }
}

export async function deleteCloudWorld(seed, permanent = true) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return false;

    rememberDeletedSeed(normalizedSeed);

    try {
        const user = await getUser();
        const db = firestore();
        if (!user || !db) {
            rememberPendingDelete(normalizedSeed);
            return false;
        }

        const ref = worldRef(user.uid, normalizedSeed);
        const chunks = await ref.collection("data").get();
        for (const doc of chunks.docs) await doc.ref.delete();

        if (permanent) {
            await ref.delete();
        } else {
            await ref.set({ deleted: true, seed: normalizedSeed, updatedAt: new Date().toISOString() }, { merge: true });
        }

        await deletedRef(user.uid, normalizedSeed).set({
            seed: normalizedSeed,
            deletedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        forgetPendingDelete(normalizedSeed);
        return true;
    } catch (error) {
        rememberPendingDelete(normalizedSeed);
        console.warn("Cloud world delete failed; will retry automatically:", error);
        return false;
    }
}

export async function retryCloudWorldDeletes() {
    if (deleteRetryRunning) return;
    deleteRetryRunning = true;
    try {
        const pending = [...getPendingDeletes()];
        for (const seed of pending) {
            try { await deleteCloudWorld(seed); } catch {}
        }
    } finally {
        deleteRetryRunning = false;
    }
}

export async function clearCloudWorldDeletion(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return false;

    clearDeletedSeed(normalizedSeed);
    forgetPendingDelete(normalizedSeed);

    try {
        const user = await getUser();
        const db = firestore();
        if (!user || !db) return false;
        await deletedRef(user.uid, normalizedSeed).delete();
        return true;
    } catch (error) {
        console.warn("Could not clear cloud world deletion:", error);
        return false;
    }
}

export async function listCloudWorlds() {
    try {
        const user = await getUser();
        const db = firestore();
        if (!user || !db) return [];

        const [worldSnap, deletedSnap] = await Promise.all([
            firestore().collection("users").doc(user.uid).collection("worlds").get(),
            firestore().collection("users").doc(user.uid).collection(CLOUD_DELETED_COLLECTION).get()
        ]);

        const deleted = new Set(deletedSnap.docs.map(doc => Number(doc.id)));
        return worldSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(world => {
                const seed = normalizeSeed(world.seed ?? world.id);
                return seed !== null && !deleted.has(seed) && world.deleted !== true;
            });
    } catch (error) {
        console.warn("Could not list cloud worlds:", error);
        return [];
    }
}

export async function syncCloudWorlds() {
    if (syncRunning) return;
    syncRunning = true;
    try {
        const storage = window.webMinecraftWorldStorage;
        if (!storage?.saveLocalWorld) return;

        const user = await getUser();
        if (!user) return;

        await retryCloudWorldDeletes();
        const cloudWorlds = await listCloudWorlds();
        for (const cloudWorld of cloudWorlds) {
            const seed = normalizeSeed(cloudWorld.seed ?? cloudWorld.id);
            if (seed === null || getDeletedSeeds().has(seed)) continue;
            const local = await storage.getLocalWorld(seed).catch(() => null);
            if (local && new Date(local.updatedAt || 0).getTime() > new Date(cloudWorld.updatedAt || 0).getTime()) continue;
            const loaded = await loadCloudWorld(seed, local);
            if (loaded) await storage.saveLocalWorld(loaded).catch(() => {});
        }
    } finally {
        syncRunning = false;
    }
}

window.webMinecraftCloudSync = syncCloudWorlds;
window.webMinecraftSaveCloudWorld = saveCloudWorld;
window.webMinecraftDeleteCloudWorld = deleteCloudWorld;
window.webMinecraftRetryCloudDeletes = retryCloudWorldDeletes;
window.webMinecraftClearCloudWorldDeletion = clearCloudWorldDeletion;
window.webMinecraftListCloudWorlds = listCloudWorlds;

waitForFirebase().then(auth => {
    if (!auth?.onAuthStateChanged) return;
    auth.onAuthStateChanged(user => {
        if (user) {
            setTimeout(() => syncCloudWorlds().catch(() => {}), 250);
            setTimeout(() => retryCloudWorldDeletes().catch(() => {}), 500);
        }
    });
});

setInterval(() => {
    if (navigator.onLine !== false) retryCloudWorldDeletes().catch(() => {});
}, 5000);

window.addEventListener("online", () => retryCloudWorldDeletes().catch(() => {}));
