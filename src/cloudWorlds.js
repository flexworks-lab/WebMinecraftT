const DB_NAME = "webminecraft-local-worlds";
const DB_VERSION = 1;
const STORE_NAME = "worlds";
const CHUNK_SIZE = 16;
const DELETED_KEY = "webminecraft_deleted_worlds";
const CLOUD_DELETED_COLLECTION = "deletedWorlds";
const WORLD_OWNER_KEY = "webminecraft_world_owners";
const LOGOUT_CACHE_KEY = "webminecraft_logged_out_worlds";
const CACHE_KEY = "webminecraft_saved_worlds";

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

function getAllLocalWorlds() {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
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

function clearAllLocalWorlds() {
    return openDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
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

function getWorldOwners() {
    try {
        const value = JSON.parse(localStorage.getItem(WORLD_OWNER_KEY) || "{}");
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
}

function setWorldOwner(seed, uid) {
    if (!uid || !Number.isFinite(Number(seed))) return;
    const owners = getWorldOwners();
    owners[String(Number(seed))] = String(uid);
    try { localStorage.setItem(WORLD_OWNER_KEY, JSON.stringify(owners)); } catch {}
}

function forgetWorldOwner(seed) {
    const owners = getWorldOwners();
    delete owners[String(Number(seed))];
    try { localStorage.setItem(WORLD_OWNER_KEY, JSON.stringify(owners)); } catch {}
}

// Firebase helpers used by cloud save/load/sync.
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

function getLogoutWorldCache() {
    try {
        const value = JSON.parse(localStorage.getItem(LOGOUT_CACHE_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function saveLogoutWorldCache(worlds) {
    try { localStorage.setItem(LOGOUT_CACHE_KEY, JSON.stringify(worlds)); } catch {}
}

async function archiveWorldsForLogout() {
    const worlds = await getAllLocalWorlds().catch(() => []);
    if (!worlds.length) {
        try { localStorage.removeItem(CACHE_KEY); } catch {}
        return;
    }

    const owners = getWorldOwners();
    const archived = worlds.map(world => ({
        world,
        ownerUid: owners[String(Number(world?.seed))] || world?.ownerUid || null
    }));
    saveLogoutWorldCache(archived);
    await clearAllLocalWorlds().catch(() => {});
    try { localStorage.removeItem(CACHE_KEY); } catch {}
}

async function restoreWorldsForUser(uid) {
    if (!uid) return;
    const archived = getLogoutWorldCache();
    if (!archived.length) return;

    const remaining = [];
    for (const entry of archived) {
        const ownerUid = String(entry?.ownerUid || entry?.world?.ownerUid || "");
        const world = entry?.world;
        const seed = Number(world?.seed);
        if (!world || !Number.isFinite(seed)) continue;
        if (ownerUid === String(uid)) {
            if (!getDeletedSeeds().has(seed)) {
                setWorldOwner(seed, uid);
                await putLocalWorld({ ...world, seed, ownerUid: uid }).catch(() => {});
            }
        } else {
            remaining.push(entry);
        }
    }
    saveLogoutWorldCache(remaining);
}

function clearWorldsUiForLogout() {
    const overlay = document.getElementById("savedWorlds");
    if (!overlay) return;
    const grid = overlay.querySelector("#savedWorldsGrid");
    if (grid) {
        grid.innerHTML = `<div id="savedWorldsEmpty"><h2>Log in to see your worlds</h2><p>Your worlds are kept safe and will return when you sign back into this account.</p></div>`;
    }
    const count = overlay.querySelector("#savedWorldsCount");
    if (count) count.textContent = "";
}

async function closeWorldsForLogout() {
    await archiveWorldsForLogout();
    const overlay = document.getElementById("savedWorlds");
    if (!overlay) return;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    overlay.querySelector("#worldDetailsPanel")?.classList.remove("open");
    const createPanel = overlay.querySelector("#worldCreateModal");
    if (createPanel) createPanel.style.display = "none";
    clearWorldsUiForLogout();
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.display = "flex";
}

function refreshOpenWorldsMenu() {
    const overlay = document.getElementById("savedWorlds");
    const reloadButton = overlay?.querySelector("#savedWorldReload");
    if (overlay?.style.display === "block" && reloadButton) reloadButton.click();
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
    setWorldOwner(seed, user.uid);
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
            forgetWorldOwner(numberSeed);
            await deleteLocalWorld(numberSeed).catch(() => {});
            return null;
        }
        const ref = worldRef(user.uid, numberSeed);
        const metaSnap = await ref.get();
        if (!metaSnap.exists) return localWorld;
        const meta = metaSnap.data() || {};
        if (meta.deleted === true) {
            forgetWorldOwner(numberSeed);
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
            ownerUid: user.uid,
            blocks
        };
        setWorldOwner(numberSeed, user.uid);
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
        if (!user) {
            await closeWorldsForLogout();
            return false;
        }

        await restoreWorldsForUser(user.uid);

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
        const owners = getWorldOwners();

        for (const doc of snapshot.docs) {
            const meta = doc.data() || {};
            const seed = Number(meta.seed ?? doc.id);
            if (!Number.isFinite(seed)) continue;
            if (meta.deleted === true || cloudDeleted.has(seed)) continue;
            setWorldOwner(seed, user.uid);
        }

        const localWorlds = await getAllLocalWorlds().catch(() => []);
        for (const local of localWorlds) {
            const seed = Number(local?.seed);
            if (!Number.isFinite(seed) || localDeleted.has(seed)) continue;
            const owner = owners[String(seed)] || local?.ownerUid || null;
            if (owner && owner !== user.uid) {
                await deleteLocalWorld(seed).catch(() => {});
                continue;
            }
            if (!owner) setWorldOwner(seed, user.uid);
        }

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
                forgetWorldOwner(seed);
                await deleteLocalWorld(seed).catch(() => {});
                continue;
            }

            setWorldOwner(seed, user.uid);
            const local = await getLocalWorld(seed).catch(() => null);
            const cloudTime = new Date(meta.updatedAt || 0).getTime();
            const localTime = new Date(local?.updatedAt || 0).getTime();
            if (!local || cloudTime > localTime) {
                const dataSnap = await doc.ref.collection("data").get();
                const blocks = {};
                for (const chunk of dataSnap.docs) {
                    const chunkBlocks = chunk.data()?.blocks;
                    if (chunkBlocks && typeof chunkBlocks === "object") Object.assign(blocks, chunkBlocks);
                }
                await putLocalWorld({
                    seed,
                    name: String(meta.name || `World ${seed}`),
                    createdAt: meta.createdAt || new Date().toISOString(),
                    updatedAt: meta.updatedAt || new Date().toISOString(),
                    ownerUid: user.uid,
                    blocks
                });
            } else if (localTime > cloudTime && !cloudDeleted.has(seed)) {
                await uploadWorld(local);
            }
        }

        refreshOpenWorldsMenu();
        return true;
    } catch (error) {
        console.warn("Cloud world sync failed:", error);
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
        await cloudDeletedRef(user.uid, numberSeed).set({ seed: numberSeed, deletedAt: now });
        forgetWorldOwner(numberSeed);

        const ref = worldRef(user.uid, numberSeed);
        try {
            const data = await ref.collection("data").get();
            for (const doc of data.docs) await doc.ref.delete();
        } catch (error) {
            console.warn("Could not remove old world chunks; deletion tombstone is still active:", error);
        }

        try {
            await ref.set({
                seed: numberSeed,
                deleted: true,
                deletedAt: now,
                updatedAt: now
            }, { merge: true });
        } catch (error) {
            console.warn("Could not mark world metadata deleted; tombstone is still active:", error);
        }
        return true;
    } catch (error) {
        console.warn("Could not create world deletion tombstone:", error);
        return false;
    }
}

export async function deleteCloudWorld(seed, remember = true) {
    try {
        const numberSeed = Number(seed);
        if (remember) rememberDeletedSeed(numberSeed);
        forgetWorldOwner(numberSeed);
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
    setWorldOwner(numberSeed, user.uid);
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
            if (!user) {
                void closeWorldsForLogout();
                return;
            }
            syncTimer = setTimeout(() => syncCloudWorlds(), 50);
        });
    });
}

watchAuth();
