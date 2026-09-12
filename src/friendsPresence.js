const FIREBASE_VERSION = "12.18.0";

let database = null;
let currentUser = null;
let ownPresenceRef = null;
let presenceRef = null;
let lastState = null;
let stateTimer = null;
let authStarted = false;
let lastPresence = {};
let listRenderScheduled = false;

function getFirebase() {
    try {
        if (!window.firebase?.auth) return null;
        if (!window.firebase?.database) {
            const script = document.querySelector('script[src*="firebase-database-compat"]');
            if (!script) {
                const loader = document.createElement("script");
                loader.src = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database-compat.js`;
                loader.async = true;
                document.head.appendChild(loader);
                return null;
            }
            return null;
        }
        database = window.firebase.database();
        return database;
    } catch {
        return null;
    }
}

function getState() {
    return Boolean(window.__webminecraftMultiplayerActive) ? "server" : "menu";
}

function scheduleFriendRows() {
    if (listRenderScheduled) return;
    listRenderScheduled = true;
    requestAnimationFrame(() => {
        listRenderScheduled = false;
        renderFriendRows();
    });
}

function renderFriendRows() {
    const list = document.getElementById("friendsList");
    if (!list) return;

    list.querySelectorAll("[data-unfriend]").forEach(button => {
        const row = button.closest(".friendFullRow");
        const meta = row?.querySelector(".friendFullMeta");
        const uid = button.dataset.unfriend;
        if (!meta || !uid) return;

        const item = lastPresence[uid];
        let text = "⚪ Offline";
        if (item?.online) {
            text = item.state === "server" ? "🟢 In a server" : "🟡 Main Menu";
        }
        if (meta.textContent !== text) meta.textContent = text;
    });
}

function stop() {
    if (stateTimer) {
        clearInterval(stateTimer);
        stateTimer = null;
    }
    try { presenceRef?.off("value", handlePresence); } catch {}
    presenceRef = null;
    try { ownPresenceRef?.remove(); } catch {}
    ownPresenceRef = null;
    currentUser = null;
    lastState = null;
    lastPresence = {};
    scheduleFriendRows();
}

function handlePresence(snapshot) {
    lastPresence = snapshot?.val?.() || {};
    scheduleFriendRows();
}

async function updateOwnPresence(force = false) {
    if (!currentUser || !database) return;
    const state = getState();
    if (!force && state === lastState) return;
    lastState = state;

    if (!ownPresenceRef) {
        ownPresenceRef = database.ref(`friendPresence/${currentUser.uid}`);
        try { await ownPresenceRef.onDisconnect().remove(); } catch {}
    }

    try {
        await ownPresenceRef.set({
            online: true,
            state,
            updatedAt: window.firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.warn("Friend presence update failed:", error);
    }
}

function start(user) {
    stop();
    currentUser = user;
    if (!currentUser) return;

    const db = getFirebase();
    if (!db) {
        setTimeout(() => {
            const retryDb = getFirebase();
            if (retryDb && currentUser) start(currentUser);
        }, 500);
        return;
    }

    presenceRef = database.ref("friendPresence");
    presenceRef.on("value", handlePresence, error => {
        console.warn("Friend presence listener failed:", error);
    });

    void updateOwnPresence(true);
    stateTimer = setInterval(() => {
        void updateOwnPresence();
        scheduleFriendRows();
    }, 5000);
}

function init() {
    if (authStarted || !window.firebase?.auth) return;
    authStarted = true;
    window.firebase.auth().onAuthStateChanged(user => {
        start(user || null);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}

window.addEventListener("beforeunload", () => {
    try { ownPresenceRef?.remove(); } catch {}
});
