const FIREBASE_VERSION = "12.18.0";

let database = null;
let currentUser = null;
let presenceRef = null;
let presenceValueRef = null;
let presencePoll = null;
let lastPresenceKey = "";
let authWatching = false;
let observer = null;
let lastPresenceSnapshot = null;
let visibilityHandler = null;
let unloadHandler = null;

function waitForFirebase() {
    if (window.firebase?.auth && window.firebase?.database) {
        try {
            database = window.firebase.database();
            return Promise.resolve(true);
        } catch {}
    }

    return new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            if (window.firebase?.auth && window.firebase?.database) {
                try {
                    database = window.firebase.database();
                    resolve(true);
                } catch {
                    resolve(false);
                }
                return;
            }

            if (window.firebase?.auth && !window.firebase?.database && !document.querySelector('script[src*="firebase-database-compat"]')) {
                const script = document.createElement("script");
                script.src = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database-compat.js`;
                script.async = true;
                script.onload = () => {
                    try {
                        database = window.firebase.database();
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                };
                script.onerror = () => resolve(false);
                document.head.appendChild(script);
                return;
            }

            if (Date.now() - started > 10000) return resolve(false);
            setTimeout(check, 80);
        };
        check();
    });
}

function getPresenceState() {
    return Boolean(window.__webminecraftMultiplayerActive) ? "server" : "menu";
}

function getPresenceText(presence) {
    if (!presence || presence.online === false) return "Offline";
    return presence.state === "server" ? "In a server" : "Main Menu";
}

function renderFriendPresence() {
    const presence = lastPresenceSnapshot?.val?.() || {};

    document.querySelectorAll("#friendsList [data-unfriend]").forEach(button => {
        const row = button.closest(".friendFullRow");
        if (!row) return;

        const uid = button.dataset.unfriend;
        const meta = row.querySelector(".friendFullMeta");
        if (!uid || !meta) return;

        const friendPresence = presence[uid];
        const state = friendPresence?.state || "offline";
        const text = getPresenceText(friendPresence);
        const dot = state === "server" ? "●" : state === "menu" ? "●" : "○";

        meta.textContent = `${dot} ${text}`;
        meta.style.color = state === "server" ? "#84bd5c" : state === "menu" ? "#d5b65b" : "#777";
    });
}

function handlePresenceSnapshot(snapshot) {
    lastPresenceSnapshot = snapshot;
    renderFriendPresence();
}

function stopPresenceListener() {
    try { presenceRef?.off("value", handlePresenceSnapshot); } catch {}
    presenceRef = null;
}

function startPresenceListener() {
    stopPresenceListener();
    if (!database || !currentUser) return;

    presenceRef = database.ref("friendPresence");
    presenceRef.on("value", handlePresenceSnapshot, error => {
        console.warn("Live friend presence listener failed:", error);
    });
}

async function writePresence(force = false) {
    if (!database || !currentUser) return;

    const state = getPresenceState();
    if (!force && state === lastPresenceKey) return;
    lastPresenceKey = state;

    if (!presenceValueRef) {
        presenceValueRef = database.ref(`friendPresence/${currentUser.uid}`);
        try {
            await presenceValueRef.onDisconnect().remove();
        } catch {}
    }

    try {
        await presenceValueRef.set({
            uid: currentUser.uid,
            online: true,
            state,
            updatedAt: window.firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.warn("Could not update friend presence:", error);
    }
}

function clearPresence() {
    clearInterval(presencePoll);
    presencePoll = null;
    try { presenceValueRef?.remove(); } catch {}
    presenceValueRef = null;
    lastPresenceKey = "";
}

function stopPresenceWatchers() {
    clearInterval(presencePoll);
    presencePoll = null;

    if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
        visibilityHandler = null;
    }

    if (unloadHandler) {
        window.removeEventListener("beforeunload", unloadHandler);
        unloadHandler = null;
    }
}

function startPresenceWatchers() {
    stopPresenceWatchers();
    if (!currentUser || !database) return;

    visibilityHandler = () => void writePresence(true);
    unloadHandler = () => {
        try { presenceValueRef?.remove(); } catch {}
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("beforeunload", unloadHandler);

    void writePresence(true);
    presencePoll = setInterval(() => void writePresence(), 750);
}

function stopAll() {
    stopPresenceWatchers();
    stopPresenceListener();
    clearPresence();
    currentUser = null;
    renderFriendPresence();
}

function watchAuth() {
    if (authWatching || !window.firebase?.auth) return;
    authWatching = true;

    window.firebase.auth().onAuthStateChanged(async user => {
        stopAll();
        currentUser = user || null;
        if (!currentUser) return;
        if (!(await waitForFirebase()) || !database) return;

        startPresenceListener();
        startPresenceWatchers();
    });
}

function init() {
    if (observer) return;

    observer = new MutationObserver(renderFriendPresence);
    observer.observe(document.body, { childList: true, subtree: true });

    waitForFirebase().then(ready => {
        if (ready) watchAuth();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
