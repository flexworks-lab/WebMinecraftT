import { setBlockAt } from "./world.js";

const WORLDS_COLLECTION = "worlds";
const WAIT_MS = 50;

let firebaseReadyPromise = null;
let currentUser = null;
let activeWorld = null;
let activeWorldPromise = null;
let activeWorldSeed = null;
let activeBlocks = {};
let saveTimer = null;
let worldSwitchId = 0;
const pendingChanges = new Map();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFirebase() {
    if (firebaseReadyPromise) return firebaseReadyPromise;
    firebaseReadyPromise = (async () => {
        for (let i = 0; i < 240; i++) {
            if (window.firebase?.auth && window.firebase?.firestore) return true;
            await sleep(WAIT_MS);
        }
        throw new Error("Firebase is not ready.");
    })().catch(error => {
        firebaseReadyPromise = null;
        throw error;
    });
    return firebaseReadyPromise;
}

async function waitForUser() {
    await waitForFirebase();
    const auth = window.firebase.auth();
    if (auth.currentUser) {
        currentUser = auth.currentUser;
        return currentUser;
    }
    return new Promise(resolve => {
        let settled = false;
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (settled) return;
            settled = true;
            unsubscribe();
            currentUser = user || null;
            resolve(currentUser);
        });
    });
}

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function getSeedFromUrl() {
    return normalizeSeed(new URLSearchParams(window.location.search).get("seed"));
}

async function findWorldBySeed(seed) {
    if (!currentUser || seed === null) return null;
    const snapshot = await window.firebase.firestore()
        .collection("users")
        .doc(currentUser.uid)
        .collection(WORLDS_COLLECTION)
        .where("seed", "==", seed)
        .limit(1)
        .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ref: doc.ref, seed, data: doc.data() };
}

async function resolveActiveWorld(seed, switchId = worldSwitchId) {
    if (activeWorld && activeWorld.seed === seed && activeWorldSeed === seed) return activeWorld;

    if (activeWorldPromise && activeWorldSeed === seed) return activeWorldPromise;

    const promise = (async () => {
        const user = await waitForUser();
        if (!user) return null;
        const world = await findWorldBySeed(seed);
        if (switchId === worldSwitchId) {
            activeWorld = world;
            activeWorldSeed = seed;
        }
        return world;
    })();

    activeWorldSeed = seed;
    activeWorldPromise = promise.finally(() => {
        if (activeWorldPromise === promise || activeWorldSeed === seed) {
            activeWorldPromise = null;
        }
    });

    return promise;
}

async function loadSavedBlocks(seed, switchId = worldSwitchId) {
    if (seed === null) return;
    try {
        const world = await resolveActiveWorld(seed, switchId);
        if (!world) return;
        if (switchId !== worldSwitchId || activeWorld?.seed !== seed) return;

        const data = world.data || (await world.ref.get()).data() || {};
        if (switchId !== worldSwitchId || activeWorld?.seed !== seed) return;

        activeBlocks = data.blocks && typeof data.blocks === "object" ? { ...data.blocks } : {};

        for (const [key, value] of Object.entries(activeBlocks)) {
            if (switchId !== worldSwitchId || activeWorld?.seed !== seed) return;
            const parts = key.split(",").map(Number);
            if (parts.length !== 3 || parts.some(number => !Number.isFinite(number))) continue;
            const type = Number(value);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }
    } catch (error) {
        console.warn("Could not load saved world blocks:", error);
    }
}

async function queueBlockSave(change) {
    if (!currentUser) return;
    const seed = getSeedFromUrl();
    if (seed === null) return;

    const world = activeWorld && activeWorld.seed === seed
        ? activeWorld
        : await resolveActiveWorld(seed, worldSwitchId);
    if (!world || world.seed !== seed || activeWorld?.seed !== seed) return;

    const key = `${change.x},${change.y},${change.z}`;
    activeBlocks[key] = change.type;
    pendingChanges.set(key, change);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushBlockSaves, 500);
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld || !currentUser || pendingChanges.size === 0) return;

    const worldToSave = activeWorld;
    const seedToSave = activeWorld.seed;
    const blocksToSave = { ...activeBlocks };
    pendingChanges.clear();

    try {
        await worldToSave.ref.set({
            blocks: blocksToSave,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.warn(`Could not save world blocks for seed ${seedToSave}:`, error);
        if (activeWorld === worldToSave && activeWorld.seed === seedToSave) {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(flushBlockSaves, 1500);
        }
    }
}

window.addEventListener("webminecraft:blockchange", event => {
    const detail = event.detail || {};
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    const type = Math.floor(Number(detail.type));
    if (![x, y, z, type].every(Number.isFinite)) return;
    queueBlockSave({ x, y, z, type }).catch(error => console.warn("Could not queue world block save:", error));
});

export async function setWorldSeedForPersistence(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return null;

    const switchId = ++worldSwitchId;
    clearTimeout(saveTimer);
    saveTimer = null;
    pendingChanges.clear();
    activeBlocks = {};
    activeWorld = null;
    activeWorldSeed = normalizedSeed;
    activeWorldPromise = null;

    try {
        await waitForUser();
        const world = await resolveActiveWorld(normalizedSeed, switchId);
        await loadSavedBlocks(normalizedSeed, switchId);
        if (switchId !== worldSwitchId) return null;
        return world;
    } catch (error) {
        console.warn("Could not switch saved world persistence:", error);
        return null;
    }
}

async function initialize() {
    const seed = getSeedFromUrl();
    if (seed === null) return;
    await sleep(0);
    const switchId = worldSwitchId;
    await loadSavedBlocks(seed, switchId);
}

window.webMinecraftWorldSave = { setWorldSeedForPersistence };
initialize().catch(error => console.warn("Saved world persistence setup failed:", error));
