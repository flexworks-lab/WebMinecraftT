const DELETED_KEY = "webminecraft_deleted_worlds";
const PENDING_CLEANUP_KEY = "webminecraft_pending_cloud_cleanup";

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function db() {
    return window.firebase?.firestore?.() || null;
}

function getAuthUser() {
    try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; }
}

function rememberDeleted(seed) {
    const s = normalizeSeed(seed);
    if (s === null) return;
    try {
        const values = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
        const set = new Set(Array.isArray(values) ? values.map(normalizeSeed).filter(v => v !== null) : []);
        set.add(s);
        localStorage.setItem(DELETED_KEY, JSON.stringify([...set]));
    } catch {}
}

function getPendingCleanup() {
    try {
        const values = JSON.parse(localStorage.getItem(PENDING_CLEANUP_KEY) || "[]");
        return new Set(Array.isArray(values) ? values.map(normalizeSeed).filter(v => v !== null) : []);
    } catch { return new Set(); }
}

function setPendingCleanup(values) {
    try { localStorage.setItem(PENDING_CLEANUP_KEY, JSON.stringify([...values])); } catch {}
}

function rememberPendingCleanup(seed) {
    const s = normalizeSeed(seed);
    if (s === null) return;
    const pending = getPendingCleanup();
    pending.add(s);
    setPendingCleanup(pending);
}

function forgetPendingCleanup(seed) {
    const s = normalizeSeed(seed);
    if (s === null) return;
    const pending = getPendingCleanup();
    pending.delete(s);
    setPendingCleanup(pending);
}

async function cleanupChunks(seed) {
    const user = getAuthUser();
    const firestore = db();
    const s = normalizeSeed(seed);
    if (!user || !firestore || s === null) return false;

    const ref = firestore.collection("users").doc(user.uid).collection("worlds").doc(String(s));
    const snapshot = await ref.collection("data").get();
    if (!snapshot.docs.length) return true;

    // Firestore batches are much faster than deleting chunks one by one.
    const MAX_BATCH = 450;
    for (let start = 0; start < snapshot.docs.length; start += MAX_BATCH) {
        const batch = firestore.batch();
        for (const doc of snapshot.docs.slice(start, start + MAX_BATCH)) batch.delete(doc.ref);
        await batch.commit();
    }
    return true;
}

async function fastDeleteCloudWorld(seed, permanent = true) {
    const s = normalizeSeed(seed);
    if (s === null) return false;

    // Hide the world locally immediately so no queued save can bring it back.
    rememberDeleted(s);

    const user = getAuthUser();
    const firestore = db();
    if (!user || !firestore) return false;

    const worldRef = firestore.collection("users").doc(user.uid).collection("worlds").doc(String(s));
    const deletedRef = firestore.collection("users").doc(user.uid).collection("deletedWorlds").doc(String(s));

    try {
        // Remove the world record and create the deletion tombstone together.
        // This is the fast part the other devices use to know the world is gone.
        const batch = firestore.batch();
        if (permanent) batch.delete(worldRef);
        else batch.set(worldRef, {
            deleted: true,
            seed: s,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        batch.set(deletedRef, {
            seed: s,
            deletedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        await batch.commit();

        // Chunk cleanup is no longer on the critical path.
        rememberPendingCleanup(s);
        cleanupChunks(s).then(ok => {
            if (ok) forgetPendingCleanup(s);
        }).catch(() => {});

        return true;
    } catch (error) {
        console.warn("Fast cloud world delete failed; will retry:", error);
        rememberPendingCleanup(s);
        return false;
    }
}

async function retryPendingCleanup() {
    for (const seed of [...getPendingCleanup()]) {
        try {
            if (await cleanupChunks(seed)) forgetPendingCleanup(seed);
        } catch {}
    }
}

// Import the existing cloud module first, then replace its slower delete hook.
import("./cloudWorlds.js").then(() => {
    window.webMinecraftDeleteCloudWorld = fastDeleteCloudWorld;
}).catch(() => {});

window.webMinecraftFastDeleteCloudWorld = fastDeleteCloudWorld;
window.webMinecraftRetryCloudCleanup = retryPendingCleanup;

setInterval(() => {
    if (navigator.onLine !== false) retryPendingCleanup().catch(() => {});
}, 10000);

window.addEventListener("online", () => retryPendingCleanup().catch(() => {}));
