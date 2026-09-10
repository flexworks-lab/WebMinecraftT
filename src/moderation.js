const DEV_EMAIL = "worthmarcus19@gmail.com";
const COLLECTION = "discussions";
const CHANNELS = ["bugs", "chat"];
const NOTICE_TEXT = "dev:flexworks deleted this message";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

let firebaseReady = null;
let devStarted = false;
let warningStarted = false;
const unsubscribers = [];

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const startedAt = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.auth === "function" && typeof firebase.firestore === "function") {
                    const db = firebase.firestore();
                    if (db && typeof db.collection === "function") {
                        resolve(firebase);
                        return;
                    }
                }
            } catch {}
            if (Date.now() - startedAt >= timeout) { resolve(null); return; }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

function getDb(firebase) {
    try { return firebase?.firestore?.() || null; } catch { return null; }
}

function isDev(user) {
    return Boolean(
        user &&
        String(user.email || "").toLowerCase() === DEV_EMAIL &&
        user.emailVerified === true
    );
}

async function announceDeletedMessage(firebase, channel, doc) {
    const data = doc.data() || {};
    const targetUid = String(data.uid || "").trim();
    const devUser = firebase?.auth?.()?.currentUser || null;
    if (!targetUid || !isDev(devUser)) return;

    const db = getDb(firebase);
    if (!db) return;

    const noticeId = `moderation_${channel}_${doc.id}`;
    const expiresAt = new Date(Date.now() + TWO_DAYS_MS);

    try {
        await db.collection(COLLECTION).doc("chat").collection("messages").doc(noticeId).set({
            uid: devUser.uid,
            name: "dev:flexworks",
            text: NOTICE_TEXT,
            moderation: true,
            targetUid,
            deletedChannel: channel,
            deletedMessageId: doc.id,
            createdAt: new Date(),
            expiresAt
        });
    } catch (error) {
        console.warn("Could not create moderation notice:", error);
    }
}

function watchChannel(firebase, channel) {
    const db = getDb(firebase);
    if (!db) return;

    try {
        const ref = db.collection(COLLECTION).doc(channel).collection("messages")
            .orderBy("createdAt", "desc")
            .limit(500);

        const unsubscribe = ref.onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type !== "removed") return;

                const data = change.doc.data() || {};
                const expiresAt = data.expiresAt?.toDate?.() || (data.expiresAt ? new Date(data.expiresAt) : null);
                if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) return;
                if (data.moderation === true) return;

                announceDeletedMessage(firebase, channel, change.doc);
            });
        }, error => {
            console.warn(`Moderation listener failed for ${channel}:`, error);
        });

        unsubscribers.push(unsubscribe);
    } catch (error) {
        console.warn(`Could not start moderation listener for ${channel}:`, error);
    }
}

function startDevModeration(firebase) {
    if (devStarted) return;
    devStarted = true;
    CHANNELS.forEach(channel => watchChannel(firebase, channel));
}

function startPlayerWarnings(firebase, user) {
    if (warningStarted || !user) return;
    warningStarted = true;

    const db = getDb(firebase);
    if (!db) return;

    try {
        const ref = db.collection(COLLECTION).doc("chat").collection("messages")
            .orderBy("createdAt", "desc")
            .limit(100);

        ref.onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type !== "added") return;
                const data = change.doc.data() || {};
                if (data.moderation !== true || data.targetUid !== user.uid) return;

                const key = `webminecraft-moderation-warning:${change.doc.id}`;
                try {
                    if (sessionStorage.getItem(key)) return;
                    sessionStorage.setItem(key, "1");
                } catch {}

                alert("Warning: your message was deleted by dev:flexworks. Please keep the chat respectful.");
            });
        }, () => {});
    } catch {}
}

async function init() {
    const firebase = await waitForFirebase();
    if (!firebase) return;

    const auth = firebase.auth?.();
    if (!auth?.onAuthStateChanged) return;

    auth.onAuthStateChanged(user => {
        if (isDev(user)) startDevModeration(firebase);
        if (user) startPlayerWarnings(firebase, user);
    });
}

init();
