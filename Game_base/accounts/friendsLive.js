const FIREBASE_VERSION = "12.18.0";
let database = null;
let currentUser = null;
let friendsListenerRef = null;
let friendsListener = null;
let requestsListenerRef = null;
let requestsListener = null;
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

function stopListener(ref, handler) {
    if (ref && handler) {
        try { ref.off("value", handler); } catch {}
    }
}

function stopFriendsListener() {
    stopListener(friendsListenerRef, friendsListener);
    friendsListenerRef = null;
    friendsListener = null;
}

function stopRequestsListener() {
    stopListener(requestsListenerRef, requestsListener);
    requestsListenerRef = null;
    requestsListener = null;
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

function renderRequests(snapshot) {
    const requestsEl = document.getElementById("friendsRequests");
    if (!requestsEl) return;

    const requests = [];
    snapshot.forEach(child => {
        const value = child.val() || {};
        if (value.status === "pending") requests.push({ id: child.key, ...value });
    });

    requests.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

    requestsEl.innerHTML = requests.length
        ? requests.map(request => `
            <div class="friendFullRow" data-live-request="${escapeHtml(request.id)}">
                <div style="min-width:0">
                    <div class="friendFullName">${escapeHtml(request.fromName || "Player")}</div>
                    <div class="friendFullMeta">Pending friend request</div>
                </div>
                <div class="friendFullActions">
                    <button class="friendSmallAction accept" type="button" data-live-accept="${escapeHtml(request.id)}">Accept</button>
                    <button class="friendSmallAction decline" type="button" data-live-decline="${escapeHtml(request.id)}">Decline</button>
                </div>
            </div>`).join("")
        : '<div class="friendEmpty">No pending requests.</div>';
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

async function respondToRequest(requestId, accept) {
    if (!database || !currentUser || !requestId) return;
    try {
        const incomingRef = database.ref(`friendRequests/${currentUser.uid}/${requestId}`);
        const snap = await incomingRef.once("value");
        const request = snap.val();
        if (!request?.fromUid) return;

        const updates = {};
        updates[`friendRequests/${currentUser.uid}/${requestId}`] = null;
        updates[`sentFriendRequests/${request.fromUid}/${requestId}`] = null;

        if (accept) {
            updates[`friends/${currentUser.uid}/${request.fromUid}`] = {
                uid: request.fromUid,
                name: request.fromName || "Player",
                friendCode: request.fromCode || ""
            };
            updates[`friends/${request.fromUid}/${currentUser.uid}`] = {
                uid: currentUser.uid,
                name: currentUser.displayName || "Player",
                friendCode: makeFriendCode(currentUser.uid)
            };
        }

        await database.ref().update(updates);
    } catch (error) {
        console.warn("RTDB live friend request response failed:", error);
    }
}

function makeFriendCode(uid) {
    let a = 2166136261;
    for (const char of String(uid)) {
        a ^= char.charCodeAt(0);
        a = Math.imul(a, 16777619);
    }
    let b = a >>> 0;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        b = (Math.imul(b ^ (b >>> 13), 1274126177) + 1013904223) >>> 0;
        code += alphabet[b % alphabet.length];
    }
    return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function installLiveControls() {
    const friendsList = document.getElementById("friendsList");
    if (friendsList && friendsList.dataset.liveControlsInstalled !== "1") {
        friendsList.dataset.liveControlsInstalled = "1";
        friendsList.addEventListener("click", event => {
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

    const requestsEl = document.getElementById("friendsRequests");
    if (requestsEl && requestsEl.dataset.liveControlsInstalled !== "1") {
        requestsEl.dataset.liveControlsInstalled = "1";
        requestsEl.addEventListener("click", event => {
            const acceptButton = event.target.closest("[data-live-accept]");
            const declineButton = event.target.closest("[data-live-decline]");
            const button = acceptButton || declineButton;
            if (!button) return;
            event.preventDefault();
            event.stopPropagation();
            const requestId = acceptButton?.dataset.liveAccept || declineButton?.dataset.liveDecline;
            if (!requestId) return;
            button.disabled = true;
            button.textContent = acceptButton ? "Accepting…" : "Removing…";
            respondToRequest(requestId, !!acceptButton);
        });
    }
}

function startFriendsListener() {
    stopFriendsListener();
    if (!database || !currentUser) return;
    friendsListenerRef = database.ref(`friends/${currentUser.uid}`);
    friendsListener = snapshot => renderFriends(snapshot);
    friendsListenerRef.on("value", friendsListener, error => console.warn("Live friends listener failed:", error));
}

function startRequestsListener() {
    stopRequestsListener();
    if (!database || !currentUser) return;
    requestsListenerRef = database.ref(`friendRequests/${currentUser.uid}`);
    requestsListener = snapshot => renderRequests(snapshot);
    requestsListenerRef.on("value", requestsListener, error => console.warn("Live friend requests listener failed:", error));
}

function startEverything() {
    if (!currentUser || !database) return;
    startFriendsListener();
    startRequestsListener();
    installLiveControls();
}

function watchAuth() {
    if (!window.firebase?.auth || watchAuth.done) return;
    watchAuth.done = true;
    window.firebase.auth().onAuthStateChanged(async user => {
        stopFriendsListener();
        stopRequestsListener();
        currentUser = user || null;
        if (!currentUser) return;
        if (!(await waitForFirebase()) || !database) return;

        const started = Date.now();
        const waitForUi = () => {
            installLiveControls();
            if (document.getElementById("friendsList") && document.getElementById("friendsRequests")) {
                startEverything();
                return;
            }
            if (Date.now() - started > 10000) {
                startEverything();
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
    const observer = new MutationObserver(() => installLiveControls());
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
