import { setBlockAt } from "./world.js";

const WORLDS_COLLECTION = "worlds";
const BLOCKS_COLLECTION = "blocks";
const WAIT_MS = 50;

let firebaseReadyPromise = null;
let currentUser = null;
let activeWorld = null;
let activeWorldPromise = null;
let saveTimer = null;
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

function getSeedFromUrl() {
    const value = Number(new URLSearchParams(window.location.search).get("seed"));
    return Number.isFinite(value) ? (Math.floor(Math.abs(value)) >>> 0) : null;
}

async function findWorldBySeed(seed) {
    if (!currentUser || seed === null) return null;
    const db = window.firebase.firestore();
    const snapshot = await db.collection("users")
        .doc(currentUser.uid)
        .collection(WORLDS_COLLECTION)
        .where("seed", "==", seed)
        .limit(1)
        .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ref: doc.ref, seed, data: doc.data() };
}

async function resolveActiveWorld(seed) {
    if (activeWorld && activeWorld.seed === seed) return activeWorld;
    if (activeWorldPromise) return activeWorldPromise;
    activeWorldPromise = (async () => {
        const user = await waitForUser();
        if (!user) return null;
        const world = await findWorldBySeed(seed);
        activeWorld = world;
        return world;
    })().finally(() => {
        activeWorldPromise = null;
    });
    return activeWorldPromise;
}

async function loadSavedBlocks(seed) {
    if (seed === null) return;
    try {
        const world = await resolveActiveWorld(seed);
        if (!world) return;

        const snapshot = await world.ref.collection(BLOCKS_COLLECTION).get();
        if (snapshot.empty) return;

        for (const doc of snapshot.docs) {
            const parts = doc.id.split(",").map(Number);
            if (parts.length !== 3 || parts.some(value => !Number.isFinite(value))) continue;
            const type = Number(doc.data()?.type);
            if (!Number.isFinite(type)) continue;
            setBlockAt(parts[0], parts[1], parts[2], type);
        }
    } catch (error) {
        console.warn("Could not load saved world blocks:", error);
    }
}

function queueBlockSave(change) {
    if (!activeWorld || !currentUser) return;
    const key = `${change.x},${change.y},${change.z}`;
    pendingChanges.set(key, change);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushBlockSaves, 500);
}

async function flushBlockSaves() {
    saveTimer = null;
    if (!activeWorld || !currentUser || pendingChanges.size === 0) return;

    const changes = Array.from(pendingChanges.values());
    pendingChanges.clear();

    try {
        const batch = window.firebase.firestore().batch();
        for (const change of changes) {
            const blockRef = activeWorld.ref.collection(BLOCKS_COLLECTION).doc(`${change.x},${change.y},${change.z}`);
            batch.set(blockRef, {
                type: change.type,
                updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        batch.set(activeWorld.ref, {
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        await batch.commit();
    } catch (error) {
        console.warn("Could not save world blocks:", error);
        for (const change of changes) {
            pendingChanges.set(`${change.x},${change.y},${change.z}`, change);
        }
        clearTimeout(saveTimer);
        saveTimer = setTimeout(flushBlockSaves, 1500);
    }
}

window.addEventListener("webminecraft:blockchange", event => {
    const detail = event.detail || {};
    const x = Math.floor(Number(detail.x));
    const y = Math.floor(Number(detail.y));
    const z = Math.floor(Number(detail.z));
    const type = Math.floor(Number(detail.type));
    if (![x, y, z, type].every(Number.isFinite)) return;
    queueBlockSave({ x, y, z, type });
});

async function initialize() {
    const seed = getSeedFromUrl();
    if (seed === null) return;
    await sleep(0);
    await loadSavedBlocks(seed);
}

initialize().catch(error => console.warn("Saved world persistence setup failed:", error));
