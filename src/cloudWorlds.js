const DELETED_KEY = "webminecraft_deleted_worlds";
const PENDING_DELETE_KEY = "webminecraft_pending_cloud_deletes";
const MAX_NAME = 40;
const CHUNK_SIZE = 16;

let firebasePromise = null;
let syncRunning = false;
let deleteRetryRunning = false;
let worldListenerStartedForUid = null;

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function loadFirebaseDatabaseScript() {
    if (window.__webMinecraftFirebaseDatabaseLoad) return window.__webMinecraftFirebaseDatabaseLoad;
    const version = "12.18.0";
    const src = `https://www.gstatic.com/firebasejs/${version}/firebase-database-compat.js`;
    window.__webMinecraftFirebaseDatabaseLoad = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (window.firebase?.database) return resolve();
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(script);
    });
    return window.__webMinecraftFirebaseDatabaseLoad;
}

async function waitForFirebase(timeout = 12000) {
    if (firebasePromise) return firebasePromise;
    firebasePromise = new Promise(resolve => {
        const started = Date.now();
        const check = async () => {
            try {
                if (window.firebase?.apps?.length && window.firebase.auth) {
                    await loadFirebaseDatabaseScript();
                    if (window.firebase.database) {
                        resolve({ auth: window.firebase.auth(), db: window.firebase.database() });
                        return;
                    }
                }
            } catch (error) {
                console.warn("Realtime Database SDK setup failed:", error);
            }
            if (Date.now() - started >= timeout) {
                resolve(null);
                return;
            }
            setTimeout(check, 100);
        };
        check();
    });
    return firebasePromise;
}

async function getUserAndDb() {
    const services = await waitForFirebase();
    const user = services?.auth?.currentUser || null;
    return user && services?.db ? { user, db: services.db } : null;
}

function getDeletedSeeds() {
    try {
        const values = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
        return new Set(Array.isArray(values) ? values.map(normalizeSeed).filter(v => v !== null) : []);
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

function worldMetaRef(db, uid, seed) {
    return db.ref(`users/${uid}/worlds/${seed}`);
}

function worldDataRef(db, uid, seed) {
    return db.ref(`users/${uid}/worldData/${seed}`);
}

function deletedRef(db, uid, seed) {
    return db.ref(`users/${uid}/deletedWorlds/${seed}`);
}

function chunkKeyFromBlockKey(key) {
    const [x, , z] = String(key).split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
    return `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;
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

function serverTimestamp() {
    return window.firebase?.database?.ServerValue?.TIMESTAMP || Date.now();
}

async function isCloudDeleted(db, user, seed) {
    const snap = await deletedRef(db, user.uid, seed).once("value");
    return snap.exists();
}

async function uploadWorld(world) {
    const services = await getUserAndDb();
    const seed = normalizeSeed(world?.seed);
    if (!services || !world || seed === null) return false;
    if (getDeletedSeeds().has(seed)) return false;
    if (await isCloudDeleted(services.db, services.user, seed)) return false;

    const updatedAt = world.updatedAt || new Date().toISOString();
    const chunks = splitBlocksIntoChunks(world.blocks || {});
    const meta = {
        name: String(world.name || `World ${seed}`).trim().slice(0, MAX_NAME) || `World ${seed}`,
        seed,
        createdAt: world.createdAt || updatedAt,
        updatedAt,
        deleted: false
    };

    const root = `users/${services.user.uid}`;
    const updates = {};
    updates[`worlds/${seed}`] = meta;
    updates[`deletedWorlds/${seed}`] = null;

    const existingSnap = await worldDataRef(services.db, services.user.uid, seed).once("value");
    const existing = existingSnap.val() || {};
    const wanted = new Set(chunks.keys());
    for (const chunk of Object.keys(existing)) {
        if (!wanted.has(chunk)) updates[`worldData/${seed}/${chunk}`] = null;
    }
    for (const [chunk, blocks] of chunks) updates[`worldData/${seed}/${chunk}`] = { blocks, updatedAt };

    await services.db.ref(root).update(updates);
    return true;
}

export async function saveCloudWorld(world) {
    try {
        return await uploadWorld(world);
    } catch (error) {
        console.warn("Realtime Database world save failed:", error);
        return false;
    }
}

export async function loadCloudWorld(seed, localWorld = null) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null || getDeletedSeeds().has(normalizedSeed)) return null;

    try {
        const services = await getUserAndDb();
        if (!services) return localWorld;

        if (await isCloudDeleted(services.db, services.user, normalizedSeed)) {
            rememberDeletedSeed(normalizedSeed);
            return null;
        }

        const metaSnap = await worldMetaRef(services.db, services.user.uid, normalizedSeed).once("value");
        if (!metaSnap.exists()) return localWorld;
        const meta = metaSnap.val() || {};
        if (meta.deleted === true) {
            rememberDeletedSeed(normalizedSeed);
            return null;
        }

        const dataSnap = await worldDataRef(services.db, services.user.uid, normalizedSeed).once("value");
        const data = dataSnap.val() || {};
        const blocks = {};
        for (const chunk of Object.values(data)) {
            if (!chunk?.blocks || typeof chunk.blocks !== "object") continue;
            Object.assign(blocks, chunk.blocks);
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
        console.warn("Realtime Database world load failed:", error);
        return localWorld;
    }
}

export async function deleteCloudWorld(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return false;

    rememberDeletedSeed(normalizedSeed);
    const services = await getUserAndDb();
    if (!services) {
        rememberPendingDelete(normalizedSeed);
        return false;
    }

    try {
        const root = `users/${services.user.uid}`;
        const updates = {};
        updates[`worlds/${normalizedSeed}`] = null;
        updates[`worldData/${normalizedSeed}`] = null;
        updates[`deletedWorlds/${normalizedSeed}`] = {
            seed: normalizedSeed,
            deletedAt: serverTimestamp()
        };
        await services.db.ref(root).update(updates);
        forgetPendingDelete(normalizedSeed);
        window.dispatchEvent(new CustomEvent("webminecraft:cloudworldschanged", { detail: { type: "deleted", seed: normalizedSeed } }));
        return true;
    } catch (error) {
        rememberPendingDelete(normalizedSeed);
        console.warn("Realtime Database world delete failed; will retry automatically:", error);
        return false;
    }
}

export async function retryCloudWorldDeletes() {
    if (deleteRetryRunning) return;
    deleteRetryRunning = true;
    try {
        for (const seed of [...getPendingDeletes()]) {
            try { if (await deleteCloudWorld(seed)) forgetPendingDelete(seed); } catch {}
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
    const services = await getUserAndDb();
    if (!services) return false;

    try {
        await deletedRef(services.db, services.user.uid, normalizedSeed).remove();
        return true;
    } catch (error) {
        console.warn("Could not clear Realtime Database world deletion:", error);
        return false;
    }
}

export async function listCloudWorlds() {
    try {
        const services = await getUserAndDb();
        if (!services) return [];
        const worldsRef = services.db.ref(`users/${services.user.uid}/worlds`);
        const deletedRefForUser = services.db.ref(`users/${services.user.uid}/deletedWorlds`);
        const [worldSnap, deletedSnap] = await Promise.all([
            worldsRef.once("value"),
            deletedRefForUser.once("value")
        ]);
        const worlds = worldSnap.val() || {};
        const deleted = deletedSnap.val() || {};
        return Object.entries(worlds).map(([id, world]) => ({ id, ...(world || {}) })).filter(world => {
            const seed = normalizeSeed(world.seed ?? world.id);
            return seed !== null && !deleted[seed] && world.deleted !== true;
        });
    } catch (error) {
        console.warn("Could not list Realtime Database worlds:", error);
        return [];
    }
}

export async function syncCloudWorlds() {
    if (syncRunning) return;
    syncRunning = true;
    try {
        const storage = window.webMinecraftWorldStorage;
        if (!storage?.saveLocalWorld) return;
        const services = await getUserAndDb();
        if (!services) return;

        await retryCloudWorldDeletes();
        const cloudWorlds = await listCloudWorlds();
        for (const cloudWorld of cloudWorlds) {
            const seed = normalizeSeed(cloudWorld.seed ?? cloudWorld.id);
            if (seed === null || getDeletedSeeds().has(seed)) continue;
            const local = await storage.getLocalWorld(seed).catch(() => null);
            const cloudTime = new Date(cloudWorld.updatedAt || 0).getTime();
            const localTime = new Date(local?.updatedAt || 0).getTime();
            if (local && localTime > cloudTime) {
                await saveCloudWorld(local).catch(() => {});
                continue;
            }
            const loaded = await loadCloudWorld(seed, local);
            if (loaded) await storage.saveLocalWorld(loaded).catch(() => {});
        }
        window.dispatchEvent(new CustomEvent("webminecraft:cloudworldssynced"));
    } finally {
        syncRunning = false;
    }
}

async function startLiveWorldListener(services) {
    const uid = services?.user?.uid;
    if (!uid || worldListenerStartedForUid === uid) return;
    worldListenerStartedForUid = uid;
    const worldsRef = services.db.ref(`users/${uid}/worlds`);
    const deletedWorldsRef = services.db.ref(`users/${uid}/deletedWorlds`);
    const notify = async (type, snapshot) => {
        const seed = normalizeSeed(snapshot?.key);
        window.dispatchEvent(new CustomEvent("webminecraft:cloudworldschanged", {
            detail: { type, seed, world: snapshot?.val() || null }
        }));
        try { await syncCloudWorlds(); } catch {}
    };
    worldsRef.on("child_added", snapshot => notify("added", snapshot));
    worldsRef.on("child_changed", snapshot => notify("changed", snapshot));
    worldsRef.on("child_removed", snapshot => notify("deleted", snapshot));
    deletedWorldsRef.on("child_added", snapshot => notify("deleted", snapshot));
}

window.webMinecraftCloudSync = syncCloudWorlds;
window.webMinecraftSaveCloudWorld = saveCloudWorld;
window.webMinecraftDeleteCloudWorld = deleteCloudWorld;
window.webMinecraftRetryCloudDeletes = retryCloudWorldDeletes;
window.webMinecraftClearCloudWorldDeletion = clearCloudWorldDeletion;
window.webMinecraftListCloudWorlds = listCloudWorlds;

waitForFirebase().then(services => {
    if (!services?.auth?.onAuthStateChanged) return;
    services.auth.onAuthStateChanged(user => {
        if (user) {
            startLiveWorldListener(services).catch(() => {});
            setTimeout(() => syncCloudWorlds().catch(() => {}), 250);
            setTimeout(() => retryCloudWorldDeletes().catch(() => {}), 500);
        }
    });
});

setInterval(() => {
    if (navigator.onLine !== false) retryCloudWorldDeletes().catch(() => {});
}, 5000);

window.addEventListener("online", () => retryCloudWorldDeletes().catch(() => {}));
