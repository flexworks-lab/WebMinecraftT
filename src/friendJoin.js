const FIREBASE_VERSION = "12.18.0";
const SERVER_LIST_URL = "https://webminecraft-server.onrender.com/servers";
const FRIEND_JOIN_STYLE_ID = "friendJoinStyles";

let database = null;
let currentUser = null;
let presenceRef = null;
let presenceHandler = null;
let authStarted = false;
let authRetryTimer = null;
let renderScheduled = false;
let lastPresence = {};
let serverLookupPromise = null;
let serverLookupAt = 0;

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
            }
            return null;
        }
        database = window.firebase.database();
        return database;
    } catch {
        return null;
    }
}

function addStyles() {
    if (document.getElementById(FRIEND_JOIN_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FRIEND_JOIN_STYLE_ID;
    style.textContent = `
.friendJoinAction{background:linear-gradient(#587c8f,#415f6d)!important;border-color:#111!important;border-top-color:#9aaeb8!important;border-left-color:#9aaeb8!important}
.friendJoinAction:hover{filter:brightness(1.1)}
.friendJoinAction.joining{opacity:.7;cursor:wait}
`;
    document.head.appendChild(style);
}

function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
        renderScheduled = false;
        renderFriendJoinButtons();
    });
}

function setFriendStatus(text, error = false) {
    const element = document.getElementById("friendsStatus");
    if (!element) return;
    element.textContent = text || "";
    element.style.color = error ? "#ff8b8b" : "#9dcc76";
}

function removeJoinButton(row) {
    row?.querySelector("[data-friend-join]")?.remove();
}

function renderFriendJoinButtons() {
    addStyles();
    const list = document.getElementById("friendsList");
    if (!list) return;

    list.querySelectorAll("[data-unfriend]").forEach(unfriendButton => {
        const row = unfriendButton.closest(".friendFullRow");
        if (!row) return;
        const uid = String(unfriendButton.dataset.unfriend || "");
        const presence = lastPresence[uid];
        const isInServer = Boolean(presence?.online) && presence?.state === "server";

        if (!isInServer) {
            removeJoinButton(row);
            return;
        }

        const actions = row.querySelector(".friendFullActions");
        if (!actions || actions.querySelector("[data-friend-join]")) return;

        const friendName = row.querySelector(".friendFullName")?.textContent?.trim() || "Friend";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "friendSmallAction friendJoinAction";
        button.dataset.friendJoin = uid;
        button.textContent = "Join";
        button.title = `Join ${friendName}'s server`;
        actions.insertBefore(button, actions.firstChild);
    });
}

async function loadServers() {
    const now = Date.now();
    if (serverLookupPromise && now - serverLookupAt < 2000) return serverLookupPromise;
    serverLookupAt = now;
    serverLookupPromise = fetch(SERVER_LIST_URL, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => Array.isArray(data?.servers) ? data.servers : [])
        .finally(() => {
            serverLookupPromise = null;
        });
    return serverLookupPromise;
}

function findFriendLocation(servers, friendName) {
    const target = String(friendName || "").trim().toLowerCase();
    if (!target) return null;

    for (const server of servers) {
        if (server?.online === false) continue;
        const rooms = Array.isArray(server?.rooms) ? server.rooms : [];
        for (const room of rooms) {
            const names = Array.isArray(room?.playerNames) ? room.playerNames : [];
            if (!names.some(name => String(name || "").trim().toLowerCase() === target)) continue;
            return {
                serverName: String(server.name || "Server"),
                websocket: String(server.websocket || "wss://webminecraft-server.onrender.com/multiplayer"),
                roomId: String(room.id || room.name || "default"),
                roomName: String(room.name || room.id || "default"),
                isPrivate: Boolean(room.private || room.isPrivate)
            };
        }
    }
    return null;
}

async function waitForMultiplayerMenu() {
    for (let attempt = 0; attempt < 80; attempt++) {
        const menu = document.getElementById("multiplayerMenu");
        if (menu) return menu;
        await new Promise(resolve => setTimeout(resolve, 25));
    }
    return null;
}

async function joinFriend(button) {
    if (!currentUser) {
        setFriendStatus("Sign in to use Join.", true);
        return;
    }
    if (window.__webminecraftMultiplayerActive) {
        setFriendStatus("You are already in a multiplayer server.", true);
        return;
    }

    const row = button.closest(".friendFullRow");
    const friendName = row?.querySelector(".friendFullName")?.textContent?.trim() || "";
    if (!friendName) {
        setFriendStatus("Could not find that friend's name.", true);
        return;
    }

    button.disabled = true;
    button.classList.add("joining");
    button.textContent = "Finding…";
    setFriendStatus(`Finding ${friendName}'s server…`);

    try {
        const servers = await loadServers();
        const location = findFriendLocation(servers, friendName);
        if (!location) {
            setFriendStatus(`${friendName} is online, but their server could not be found yet.`, true);
            return;
        }

        document.getElementById("friendsModal")?.classList.remove("open");
        const multiplayer = await import("./multiplayerClient.js");
        multiplayer.openMultiplayerMenu();
        const menu = await waitForMultiplayerMenu();
        if (!menu) throw new Error("Multiplayer menu did not open.");

        const serverInput = menu.querySelector("#multiplayerServer");
        const roomInput = menu.querySelector("#multiplayerRoom");
        const publicButton = menu.querySelector("#multiplayerPublic");
        const privateButton = menu.querySelector("#multiplayerPrivate");
        const privateCodeInput = menu.querySelector("#multiplayerPrivateCodeInput");
        const joinButton = menu.querySelector("#multiplayerJoin");
        const status = menu.querySelector("#multiplayerStatus");

        if (!serverInput || !roomInput || !joinButton) throw new Error("Multiplayer join controls are missing.");
        serverInput.value = location.websocket;
        roomInput.value = location.roomId.slice(0, 32);

        if (location.isPrivate) {
            privateButton?.click();
            if (privateCodeInput) privateCodeInput.value = "";
            if (status) {
                status.textContent = `${friendName} is in a private room. Enter the private code to join.`;
                status.style.color = "#a8ca8e";
                status.style.borderLeftColor = "#6f8e58";
            }
            requestAnimationFrame(() => privateCodeInput?.focus());
            setFriendStatus(`Opened ${location.serverName} — enter the private code to join ${friendName}.`);
            return;
        }

        publicButton?.click();
        joinButton.disabled = false;
        joinButton.click();
        setFriendStatus(`Joining ${friendName} in ${location.roomName}…`);
    } catch (error) {
        console.warn("Join friend failed:", error);
        setFriendStatus("Could not join that friend's server.", true);
    } finally {
        button.disabled = false;
        button.classList.remove("joining");
        button.textContent = "Join";
    }
}

function stop() {
    try { presenceRef?.off("value", presenceHandler); } catch {}
    presenceRef = null;
    presenceHandler = null;
    currentUser = null;
    lastPresence = {};
    if (authRetryTimer) {
        clearTimeout(authRetryTimer);
        authRetryTimer = null;
    }
    scheduleRender();
}

function start(user) {
    stop();
    currentUser = user || null;
    if (!currentUser) return;

    const db = getFirebase();
    if (!db) {
        const retryUser = currentUser;
        authRetryTimer = setTimeout(() => {
            authRetryTimer = null;
            if (getFirebase() && retryUser) start(retryUser);
        }, 500);
        return;
    }

    presenceRef = database.ref("friendPresence");
    presenceHandler = snapshot => {
        lastPresence = snapshot?.val?.() || {};
        scheduleRender();
    };
    presenceRef.on("value", presenceHandler, error => console.warn("Join-friend presence listener failed:", error));
    scheduleRender();
}

function attachControls() {
    const list = document.getElementById("friendsList");
    if (!list || list.dataset.joinFriendControlsAttached === "1") return;
    list.dataset.joinFriendControlsAttached = "1";
    list.addEventListener("click", event => {
        const button = event.target.closest("[data-friend-join]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        void joinFriend(button);
    });
}

function init() {
    if (authStarted) return;
    addStyles();
    attachControls();

    if (!window.firebase?.auth) {
        authRetryTimer = setTimeout(() => {
            authRetryTimer = null;
            init();
        }, 250);
        return;
    }

    authStarted = true;
    window.firebase.auth().onAuthStateChanged(user => start(user || null));

    const observer = new MutationObserver(() => {
        attachControls();
        scheduleRender();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
