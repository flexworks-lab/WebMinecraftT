const FIREBASE_VERSION = "12.18.0";
let database = null;
let currentUser = null;
let friendsListenerRef = null;
let friendsListener = null;
let initialized = false;

function waitForFirebase() {
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
            if (window.firebase?.auth && !window.firebase?.database && !document.querySelector(`script[src*="firebase-database-compat"]`)) {
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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function stopFriendsListener() {
    if (friendsListenerRef && friendsListener) {
        try { friendsListenerRef.off("value", friendsListener); } catch {}
    }
    friendsListenerRef = null;
    friendsListener = null;
}

function renderFriends(snapshot) {
    const list = document.getElementById("friendsList");
    if (!list) return;

    const friends = [];
    snapshot.forEach(child => {
        const value = child.val() || {};
        friends.push({
            uid: child.key,
            name: value.name || "Player",
            friendCode: value.friendCode || ""
        });
    });

    friends.sort((a, b) => a.name.localeCompare(b.name));

    list.innerHTML = friends.length
        ? friends.map(friend => `
            <div class="friendFullRow" data-live-friend="${escapeHtml(friend.uid)}">
                <div style="min-width:0">
                    <div class="friendFullName">${escapeHtml(friend.name)}</div>
                    <div class="friendFullMeta">Friend${friend.friendCode ? ` • ${escapeHtml(friend.friendCode)}` : ""}</div>
                </div>
                <div class="friendFullActions">
                    <button class="friendSmallAction unfriend" type="button" data-unfriend="${escapeHtml(friend.uid)}">Unfriend</button>
                </div>
            </div>`).join("")
        : '<div class="friendEmpty">No friends yet.</div>';
}

async function unfriend(friendUid) {
    if (!database || !currentUser || !friendUid || friendUid === currentUser.uid) return;
    try {
        const updates = {};
        updates[`friends/${currentUser.uid}/${friendUid}`] = null;
        updates[`friends/${friendUid}/${currentUser.uid}`] = null;
        await database.ref().update(updates);
    } catch (error) {
        console.warn("RTDB unfriend failed:", error);
        const status = document.getElementById("friendsStatus");
        if (status) {
            status.textContent = "Could not remove that friend.";
            status.style.color = "#ff8b8b";
        }
    }
}

function installUnfriendHandler() {
    const list = document.getElementById("friendsList");
    if (!list || list.dataset.liveUnfriendInstalled === "1") return;
    list.dataset.liveUnfriendInstalled = "1";
    list.addEventListener("click", event => {
        const button = event.target.closest("[data-unfriend]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const friendUid = button.dataset.unfriend;
        if (!friendUid) return;
        button.disabled = true;
        button.textContent = "Removing…";
        unfriend(friendUid);
    });
}

function startFriendsListener() {
    stopFriendsListener();
    if (!database || !currentUser) return;
    friendsListenerRef = database.ref(`friends/${currentUser.uid}`);
    friendsListener = snapshot => renderFriends(snapshot);
    friendsListenerRef.on("value", friendsListener, error => console.warn("Live friends listener failed:", error));
    installUnfriendHandler();
}

function watchAuth() {
    if (!window.firebase?.auth || watchAuth.done) return;
    watchAuth.done = true;
    window.firebase.auth().onAuthStateChanged(async user => {
        stopFriendsListener();
        currentUser = user || null;
        if (!currentUser) return;
        if (!(await waitForFirebase()) || !database) return;
        const start = Date.now();
        const waitForUi = () => {
            installUnfriendHandler();
            if (document.getElementById("friendsList") || Date.now() - start > 10000) {
                startFriendsListener();
                return;
            }
            setTimeout(waitForUi, 100);
        };
        waitForUi();
    });
}

function init() {
    if (initialized) return;
    initialized = true;
    watchAuth();
    const observer = new MutationObserver(() => installUnfriendHandler());
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
