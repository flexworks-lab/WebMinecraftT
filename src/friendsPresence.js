const FIREBASE_VERSION = "12.18.0";

let database = null;
let currentUser = null;
let ownPresenceRef = null;
let presenceRef = null;
let stateTimer = null;
let heartbeatTimer = null;
let renderTimer = null;
let authRetryTimer = null;
let authStarted = false;
let lastState = null;
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

function addStatusStyles() {
    if (document.getElementById("friendPresenceStyles")) return;
    const style = document.createElement("style");
    style.id = "friendPresenceStyles";
    style.textContent = `
.friendFullStatus{margin-top:4px;font-size:11px;font-weight:700;line-height:1.2;white-space:nowrap}
`;
    document.head.appendChild(style);
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
    addStatusStyles();

    list.querySelectorAll("[data-unfriend]").forEach(button => {
        const row = button.closest(".friendFullRow");
        const details = row?.querySelector(".friendFullName")?.parentElement;
        const uid = button.dataset.unfriend;
        if (!details || !uid) return;

        const item = lastPresence[uid];
        let text = "⚪ Offline";
        if (item?.online) {
            text = item.state === "server" ? "🟢 In a server" : "🟡 Main Menu";
        }

        let status = details.querySelector(".friendFullStatus");
        if (!status) {
            status = document.createElement("div");
            status.className = "friendFullStatus";
            details.appendChild(status);
        }
        status.textContent = `Current status: ${text}`;
        status.style.color = item?.online ? "#b7df8b" : "#999";
    });
}

function stop() {
    if (stateTimer) {
        clearInterval(stateTimer);
        stateTimer = null;
    }
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
    if (renderTimer) {
        clearInterval(renderTimer);
        renderTimer = null;
    }
    if (authRetryTimer) {
        clearTimeout(authRetryTimer);
        authRetryTimer = null;
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
        const retryUser = currentUser;
        authRetryTimer = setTimeout(() => {
            authRetryTimer = null;
            const retryDb = getFirebase();
            if (retryDb && retryUser) start(retryUser);
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
    }, 250);

    heartbeatTimer = setInterval(() => {
        void updateOwnPresence(true);
    }, 5000);

    renderTimer = setInterval(scheduleFriendRows, 250);
    scheduleFriendRows();
}

function init() {
    if (authStarted) return;
    if (!window.firebase?.auth) {
        authRetryTimer = setTimeout(() => {
            authRetryTimer = null;
            init();
        }, 200);
        return;
    }

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
