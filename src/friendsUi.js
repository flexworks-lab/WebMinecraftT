const FRIENDS_STYLE_ID = "webMinecraftFriendsStyles";
const FRIENDS_MODAL_ID = "friendsModal";
const FIREBASE_VERSION = "12.18.0";

let firebaseReadyPromise = null;
let currentUser = null;
let database = null;
let friendRequestUnsubscribe = null;
let friendsUnsubscribe = null;
let initialized = false;

function waitForFirebase() {
    if (firebaseReadyPromise) return firebaseReadyPromise;
    firebaseReadyPromise = new Promise(resolve => {
        const start = Date.now();
        const check = () => {
            if (window.firebase?.auth && window.firebase?.database) return resolve(true);
            if (window.firebase?.auth && !window.firebase?.database && !document.querySelector(`script[src*="firebase-database-compat"]`)) {
                const script = document.createElement("script");
                script.src = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database-compat.js`;
                script.async = true;
                script.onload = () => resolve(!!window.firebase?.database);
                script.onerror = () => resolve(false);
                document.head.appendChild(script);
                return;
            }
            if (Date.now() - start > 10000) return resolve(false);
            setTimeout(check, 80);
        };
        check();
    }).then(ready => {
        if (!ready) return false;
        try {
            database = window.firebase.database();
            return true;
        } catch (error) {
            console.warn("Could not initialize Realtime Database:", error);
            return false;
        }
    });
    return firebaseReadyPromise;
}

function getAuthUser() {
    try { return window.firebase?.auth?.().currentUser || null; } catch { return null; }
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

function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addStyles() {
    if (document.getElementById(FRIENDS_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FRIENDS_STYLE_ID;
    style.textContent = `
#friendsButton{position:fixed !important;left:158px !important;bottom:28px !important;width:126px !important;height:48px !important;margin:0 !important;z-index:98 !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;padding:0 14px !important;border:2px solid #111 !important;border-top-color:#9a9a9a !important;border-left-color:#9a9a9a !important;border-radius:5px !important;background:linear-gradient(#5f7fa0,#3d5873) !important;color:#fff !important;font:bold 13px Arial,sans-serif !important;letter-spacing:.2px !important;cursor:pointer !important;text-shadow:2px 2px 0 #18212a !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.13),inset -2px -3px 0 rgba(0,0,0,.32),0 4px 0 #151515 !important;transition:transform .08s ease,filter .08s ease !important}
#friendsButton::before{content:"♟";font-size:17px;line-height:1;transform:rotate(180deg);display:inline-block;opacity:.95}
#friendsButton:hover{filter:brightness(1.12) !important;transform:translateY(-1px) !important}
#friendsButton:active{transform:translateY(2px) !important;box-shadow:inset 2px 2px 0 rgba(0,0,0,.25),inset -2px -2px 0 rgba(255,255,255,.06),0 1px 0 #171717 !important}
#friendsButton.friendAlert{animation:friendsButtonPulse .8s steps(2,end) infinite !important}
#friendsButton .friendsBadge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border:2px solid #111;border-radius:2px;background:#b83d3d;color:#fff;font:bold 10px Arial,sans-serif;box-shadow:1px 1px 0 #000;text-shadow:none}
@keyframes friendsButtonPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
#accountUser #friendCodeBox,#accountUser .friendSection{display:none !important}
#friendsModal{position:fixed;inset:0;z-index:450;display:none;background:rgba(8,10,12,.94);font-family:Arial,sans-serif;color:#fff;overflow:auto}
#friendsModal.open{display:block}
#friendsPage{min-height:100%;box-sizing:border-box;padding:32px 38px 46px;background:radial-gradient(circle at 50% 0%,rgba(91,127,80,.16),transparent 42%),linear-gradient(rgba(0,0,0,.07),rgba(0,0,0,.2))}
#friendsTop{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1220px;margin:0 auto 24px}
#friendsHeading{margin:0;font-family:MinecraftFont,monospace;font-size:34px;text-shadow:3px 3px 0 #000;letter-spacing:.5px}
#friendsSubheading{margin:6px 0 0;color:#aaa;font-size:12px}
#friendsClose{min-width:110px;height:44px;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#676767,#474747);color:#fff;font:bold 13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#friendsClose:hover{filter:brightness(1.12)}
#friendsGrid{max-width:1220px;margin:0 auto;display:grid;grid-template-columns:minmax(270px,340px) minmax(0,1fr);gap:20px}
.friendsCard{background:linear-gradient(#292929,#191919);border:2px solid #101010;border-top-color:#757575;border-left-color:#757575;box-shadow:6px 6px 0 rgba(0,0,0,.45);padding:21px}
.friendsCard h3{margin:0 0 13px;font:16px MinecraftFont,monospace;text-shadow:2px 2px 0 #000}
#friendsCodeCard{text-align:center}
#friendsCodeLabel{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px}
#friendsCodeValue{margin:10px 0 16px;padding:14px 8px;background:#101010;border:1px solid #505050;color:#b7df8b;font:bold 26px MinecraftFont,monospace;letter-spacing:3px;text-shadow:2px 2px 0 #000}
.friendsAction{width:100%;min-height:43px;padding:9px 12px;margin:8px 0;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#6e8f50,#526f3c);color:#fff;font:13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-sizing:border-box}
.friendsAction:hover{filter:brightness(1.1)}
.friendsInput{width:100%;height:44px;box-sizing:border-box;padding:0 12px;background:#101010;color:#fff;border:2px solid #070707;border-top-color:#737373;border-left-color:#737373;outline:none;margin-bottom:4px}
.friendsInput:focus{border-color:#88b363;box-shadow:0 0 0 2px rgba(136,179,99,.16)}
#friendsStatus{min-height:20px;margin:8px 0 0;color:#aaa;font-size:12px;line-height:1.4;text-align:center}
#friendsSections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.friendsList{min-height:120px}
.friendFullRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;margin:7px 0;background:#303030;border:1px solid #4d4d4d}
.friendFullName{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.friendFullMeta{font-size:10px;color:#999;margin-top:3px}.friendFullActions{display:flex;gap:6px;flex:0 0 auto}.friendSmallAction{min-height:32px;padding:5px 10px;background:#4d4d4d;border:1px solid #777;color:#fff;cursor:pointer}.friendSmallAction.accept{background:#5e8242}.friendSmallAction.decline{background:#6a3f3f}.friendEmpty{padding:16px;color:#888;background:#181818;border:1px solid #333;font-size:12px;text-align:center}
@media(max-width:850px){#friendsPage{padding:18px 14px 30px}#friendsGrid{grid-template-columns:1fr}#friendsSections{grid-template-columns:1fr}#friendsTop{align-items:flex-start}.friendsCard{padding:17px}}
@media(max-width:560px){#friendsButton{left:calc(50vw + 6px) !important;bottom:18px !important;width:calc(50vw - 18px) !important;height:46px !important}.friendsBadge{min-width:17px !important;height:17px !important}}
`;
    document.head.appendChild(style);
}

function createUi() {
    if (document.getElementById(FRIENDS_MODAL_ID)) return;
    const modal = document.createElement("div");
    modal.id = FRIENDS_MODAL_ID;
    modal.innerHTML = `
<div id="friendsPage">
  <div id="friendsTop"><div><h1 id="friendsHeading">Friends</h1><p id="friendsSubheading">Add people, manage requests, and see who is on your friends list.</p></div><button id="friendsClose" type="button">Close</button></div>
  <div id="friendsGrid">
    <div>
      <div class="friendsCard" id="friendsCodeCard"><h3>Your Friend Code</h3><div id="friendsCodeLabel">Share this code with someone</div><div id="friendsCodeValue">--------</div><button class="friendsAction" id="friendsCopy" type="button">Copy Friend Code</button></div>
      <div class="friendsCard" style="margin-top:20px"><h3>Add a Friend</h3><input id="friendsCodeInput" class="friendsInput" maxlength="9" autocomplete="off" placeholder="Enter friend code"><button class="friendsAction" id="friendsAdd" type="button">Send Friend Request</button><div id="friendsStatus"></div></div>
    </div>
    <div id="friendsSections">
      <div class="friendsCard"><h3>Friend Requests</h3><div id="friendsRequests" class="friendsList"><div class="friendEmpty">Sign in to see requests.</div></div></div>
      <div class="friendsCard"><h3>Your Friends</h3><div id="friendsList" class="friendsList"><div class="friendEmpty">Sign in to see friends.</div></div></div>
    </div>
  </div>
</div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => { if (event.target === modal || event.target.id === "friendsPage") closeFriends(); });
    modal.querySelector("#friendsClose").addEventListener("click", closeFriends);
    modal.querySelector("#friendsCopy").addEventListener("click", copyCode);
    modal.querySelector("#friendsAdd").addEventListener("click", addFriend);
    modal.querySelector("#friendsCodeInput").addEventListener("input", event => {
        event.target.value = event.target.value.replace(/\s+/g, "").toUpperCase().slice(0, 9);
    });
    modal.querySelector("#friendsCodeInput").addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            addFriend();
        }
    });
}

function getButton() { return document.getElementById("friendsButton"); }
function getFriendCode() { return currentUser?.uid ? makeFriendCode(currentUser.uid) : ""; }

function setStatus(text, type = "") {
    const el = document.getElementById("friendsStatus");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = type === "error" ? "#ff8b8b" : type === "success" ? "#9dcc76" : "#aaa";
}

function updateBadge(count = 0) {
    const button = getButton();
    if (!button) return;
    const total = Math.max(0, Number(count) || 0);
    button.classList.toggle("friendAlert", total > 0);
    button.querySelector(".friendsBadge")?.remove();
    if (total <= 0) return;
    const badge = document.createElement("span");
    badge.className = "friendsBadge";
    badge.textContent = total > 99 ? "99+" : String(total);
    button.appendChild(badge);
}

function closeFriends() {
    document.getElementById(FRIENDS_MODAL_ID)?.classList.remove("open");
}

async function openFriends() {
    const modal = document.getElementById(FRIENDS_MODAL_ID);
    if (!modal) return;
    modal.classList.add("open");
    await waitForFirebase();
    currentUser = getAuthUser();
    renderStaticData();
    if (!currentUser) {
        setStatus("Sign in to add and manage friends.", "error");
        renderSignedOut();
        return;
    }
    await syncPublicProfile();
    await refreshFriends();
}

function renderStaticData() {
    const value = document.getElementById("friendsCodeValue");
    if (value) value.textContent = getFriendCode() || "--------";
}

function renderSignedOut() {
    document.getElementById("friendsCodeValue")?.replaceChildren(document.createTextNode("--------"));
    document.getElementById("friendsRequests").innerHTML = '<div class="friendEmpty">Sign in to see requests.</div>';
    document.getElementById("friendsList").innerHTML = '<div class="friendEmpty">Sign in to see friends.</div>';
    updateBadge(0);
}

async function syncPublicProfile() {
    if (!database || !currentUser) return;
    const code = getFriendCode();
    const profileRef = database.ref(`publicProfiles/${currentUser.uid}`);
    await profileRef.update({
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Player",
        friendCode: code,
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP
    });
}

async function copyCode() {
    const code = getFriendCode();
    if (!code) return setStatus("Sign in to get a friend code.", "error");
    try {
        await navigator.clipboard.writeText(code);
        setStatus("Friend code copied!", "success");
    } catch {
        setStatus("Could not copy the friend code.", "error");
    }
}

async function addFriend() {
    if (!(await waitForFirebase()) || !currentUser) return setStatus("Sign in to add friends.", "error");
    const input = document.getElementById("friendsCodeInput");
    const button = document.getElementById("friendsAdd");
    if (!input || !button) return;
    const code = input.value.replace(/\s+/g, "").toUpperCase();
    if (!code) return setStatus("Enter a friend code.", "error");
    if (code === getFriendCode()) return setStatus("You cannot add yourself.", "error");

    button.disabled = true;
    button.textContent = "Sending…";
    setStatus("Looking up player…");

    try {
        const profileSnap = await database.ref("publicProfiles").orderByChild("friendCode").equalTo(code).limitToFirst(1).once("value");
        let target = null;
        profileSnap.forEach(child => {
            target = child.val();
            return true;
        });
        if (!target?.uid || target.uid === currentUser.uid) {
            setStatus("No account was found with that friend code.", "error");
            return;
        }

        const requestId = `${currentUser.uid}_${target.uid}`;
        const incomingRef = database.ref(`friendRequests/${target.uid}/${requestId}`);
        const sentRef = database.ref(`sentFriendRequests/${currentUser.uid}/${requestId}`);
        const friendRef = database.ref(`friends/${currentUser.uid}/${target.uid}`);

        const [existingIncoming, existingSent, existingFriend] = await Promise.all([
            incomingRef.once("value"),
            sentRef.once("value"),
            friendRef.once("value")
        ]);
        if (existingFriend.exists()) {
            setStatus("You are already friends.", "error");
            return;
        }
        if (existingIncoming.exists() || existingSent.exists()) {
            setStatus("A request is already pending.", "error");
            return;
        }

        const request = {
            requestId,
            fromUid: currentUser.uid,
            toUid: target.uid,
            fromName: currentUser.displayName || "Player",
            toName: target.displayName || "Player",
            fromCode: getFriendCode(),
            toCode: target.friendCode || code,
            status: "pending",
            createdAt: window.firebase.database.ServerValue.TIMESTAMP,
            updatedAt: window.firebase.database.ServerValue.TIMESTAMP
        };
        const updates = {};
        updates[`friendRequests/${target.uid}/${requestId}`] = request;
        updates[`sentFriendRequests/${currentUser.uid}/${requestId}`] = request;
        await database.ref().update(updates);
        input.value = "";
        setStatus(`Friend request sent to ${target.displayName || "Player"}.`, "success");
    } catch (error) {
        console.warn("RTDB friend request failed:", error);
        setStatus(error?.code === "PERMISSION_DENIED" ? "Friend request blocked by Realtime Database rules." : "Could not send the friend request.", "error");
    } finally {
        button.disabled = false;
        button.textContent = "Send Friend Request";
        await refreshFriends();
    }
}

async function respondToRequest(request, accept) {
    if (!currentUser || !database || !request?.fromUid || !request?.requestId) return;
    try {
        const updates = {};
        const incomingPath = `friendRequests/${currentUser.uid}/${request.requestId}`;
        const sentPath = `sentFriendRequests/${request.fromUid}/${request.requestId}`;
        if (accept) {
            updates[`friends/${currentUser.uid}/${request.fromUid}`] = {
                uid: request.fromUid,
                name: request.fromName || "Player",
                friendCode: request.fromCode || ""
            };
            updates[`friends/${request.fromUid}/${currentUser.uid}`] = {
                uid: currentUser.uid,
                name: currentUser.displayName || "Player",
                friendCode: getFriendCode()
            };
        }
        updates[incomingPath] = null;
        updates[sentPath] = null;
        await database.ref().update(updates);
        setStatus(accept ? `You are now friends with ${request.fromName || "Player"}!` : "Friend request declined.", accept ? "success" : "");
        await refreshFriends();
    } catch (error) {
        console.warn("RTDB friend response failed:", error);
        setStatus("Could not update that friend request.", "error");
    }
}

function renderRequestsSnapshot(snapshot) {
    const requestsEl = document.getElementById("friendsRequests");
    if (!requestsEl) return;
    const requests = [];
    snapshot.forEach(child => {
        const value = child.val() || {};
        if (value.status === "pending") requests.push({ id: child.key, ...value });
    });
    requests.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    requestsEl.innerHTML = requests.length
        ? requests.map(x => `<div class="friendFullRow"><div><div class="friendFullName">${esc(x.fromName || "Player")}</div><div class="friendFullMeta">Friend request</div></div><div class="friendFullActions"><button class="friendSmallAction accept" data-accept="${esc(x.id)}">Accept</button><button class="friendSmallAction decline" data-decline="${esc(x.id)}">Decline</button></div></div>`).join("")
        : '<div class="friendEmpty">No pending requests.</div>';
    requestsEl.querySelectorAll("[data-accept]").forEach(btn => btn.addEventListener("click", () => respondToRequest(requests.find(x => x.id === btn.dataset.accept), true)));
    requestsEl.querySelectorAll("[data-decline]").forEach(btn => btn.addEventListener("click", () => respondToRequest(requests.find(x => x.id === btn.dataset.decline), false)));
}

function renderFriendsSnapshot(snapshot) {
    const listEl = document.getElementById("friendsList");
    if (!listEl) return;
    const friends = [];
    snapshot.forEach(child => friends.push({ id: child.key, ...(child.val() || {}) }));
    friends.sort((a, b) => String(a.name || "Player").localeCompare(String(b.name || "Player")));
    listEl.innerHTML = friends.length
        ? friends.map(x => `<div class="friendFullRow"><div><div class="friendFullName">${esc(x.name || "Player")}</div><div class="friendFullMeta">Friend</div></div></div>`).join("")
        : '<div class="friendEmpty">No friends yet.</div>';
}

async function refreshFriends() {
    if (!currentUser || !database) return;
    const requestsEl = document.getElementById("friendsRequests");
    const listEl = document.getElementById("friendsList");
    if (!requestsEl || !listEl) return;
    try {
        const [requestsSnap, friendsSnap] = await Promise.all([
            database.ref(`friendRequests/${currentUser.uid}`).once("value"),
            database.ref(`friends/${currentUser.uid}`).once("value")
        ]);
        renderRequestsSnapshot(requestsSnap);
        renderFriendsSnapshot(friendsSnap);
    } catch (error) {
        console.warn("Could not load RTDB friends:", error);
        requestsEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>';
        listEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>';
    }
}

function startRequestListener() {
    stopRequestListener();
    if (!currentUser || !database) return;

    const requestRef = database.ref(`friendRequests/${currentUser.uid}`);
    const friendRef = database.ref(`friends/${currentUser.uid}`);

    const requestHandler = snapshot => {
        let pending = 0;
        snapshot.forEach(child => {
            if (child.val()?.status === "pending") pending++;
        });
        updateBadge(pending);
        if (document.getElementById(FRIENDS_MODAL_ID)?.classList.contains("open")) {
            renderRequestsSnapshot(snapshot);
        }
    };

    const friendHandler = snapshot => {
        if (document.getElementById(FRIENDS_MODAL_ID)?.classList.contains("open")) {
            renderFriendsSnapshot(snapshot);
        }
    };

    requestRef.on("value", requestHandler, error => console.warn("RTDB friend request listener failed:", error));
    friendRef.on("value", friendHandler, error => console.warn("RTDB friends listener failed:", error));

    friendRequestUnsubscribe = () => requestRef.off("value", requestHandler);
    friendsUnsubscribe = () => friendRef.off("value", friendHandler);
}

function stopRequestListener() {
    try { friendRequestUnsubscribe?.(); } catch {}
    try { friendsUnsubscribe?.(); } catch {}
    friendRequestUnsubscribe = null;
    friendsUnsubscribe = null;
    updateBadge(0);
}

function attachButton() {
    const button = getButton();
    if (!button || button.dataset.friendsRtdbInstalled === "1") return false;
    button.dataset.friendsRtdbInstalled = "1";
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openFriends();
    });
    return true;
}

function watchAuth() {
    if (!window.firebase?.auth || watchAuth.done) return;
    watchAuth.done = true;
    window.firebase.auth().onAuthStateChanged(async user => {
        stopRequestListener();
        currentUser = user || null;
        if (!currentUser) {
            renderSignedOut();
            return;
        }
        if (!(await waitForFirebase()) || !database) return;
        try {
            await syncPublicProfile();
            startRequestListener();
            renderStaticData();
            if (document.getElementById(FRIENDS_MODAL_ID)?.classList.contains("open")) refreshFriends();
        } catch (error) {
            console.warn("Could not initialize RTDB friend profile:", error);
        }
    });
}

function init() {
    if (initialized) return;
    initialized = true;
    addStyles();
    createUi();
    attachButton();
    const observer = new MutationObserver(() => attachButton());
    observer.observe(document.body, { childList: true, subtree: true });
    watchAuth();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
