import { firebaseConfig, isFirebaseConfigured } from "./firebaseConfig.js";

const FRIENDS_STYLE_ID = "webMinecraftFriendsStyles";
const FRIENDS_MODAL_ID = "friendsModal";
let readyPromise = null;
let currentUser = null;
let friendUnsubscribe = null;
let initialized = false;

function waitForFirebase() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise(resolve => {
        const start = Date.now();
        const check = () => {
            if (window.firebase?.auth && window.firebase?.firestore) return resolve(true);
            if (Date.now() - start > 8000) return resolve(false);
            setTimeout(check, 80);
        };
        check();
    });
    return readyPromise;
}

function makeFriendCode(uid) {
    let a = 2166136261;
    for (const char of String(uid)) { a ^= char.charCodeAt(0); a = Math.imul(a, 16777619); }
    let b = a >>> 0;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) { b = (Math.imul(b ^ (b >>> 13), 1274126177) + 1013904223) >>> 0; code += alphabet[b % alphabet.length]; }
    return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function esc(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }

function addStyles() {
    if (document.getElementById(FRIENDS_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FRIENDS_STYLE_ID;
    style.textContent = `
#friendsButton{position:fixed !important;left:158px !important;bottom:28px !important;width:126px !important;height:48px !important;margin:0 !important;z-index:98 !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;padding:0 14px !important;border:2px solid #111 !important;border-top-color:#9a9a9a !important;border-left-color:#9a9a9a !important;border-radius:4px !important;background:linear-gradient(#526d8a,#384e67) !important;color:#fff !important;font:bold 13px Arial,sans-serif !important;letter-spacing:.2px !important;cursor:pointer !important;text-shadow:2px 2px 0 #18212a !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.1),inset -2px -3px 0 rgba(0,0,0,.3),0 3px 0 #171717 !important;transition:transform .08s ease,filter .08s ease !important}
#friendsButton::before{content:"♟";font-size:17px;line-height:1;transform:rotate(180deg);display:inline-block;opacity:.95}
#friendsButton:hover{filter:brightness(1.13) !important;transform:translateY(-1px) !important}
#friendsButton:active{transform:translateY(2px) !important;box-shadow:inset 2px 2px 0 rgba(0,0,0,.25),inset -2px -2px 0 rgba(255,255,255,.06),0 1px 0 #171717 !important}
#friendsButton.friendAlert{animation:friendsButtonPulse .8s steps(2,end) infinite !important}
#friendsButton .friendsBadge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border:2px solid #111;border-radius:2px;background:#b83d3d;color:#fff;font:bold 10px Arial,sans-serif;box-shadow:1px 1px 0 #000;text-shadow:none}
@keyframes friendsButtonPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
#accountUser #friendCodeBox,#accountUser .friendSection{display:none !important}
#friendsModal{position:fixed;inset:0;z-index:450;display:none;background:rgba(8,10,12,.9);font-family:Arial,sans-serif;color:#fff;overflow:auto}
#friendsModal.open{display:block}
#friendsPage{min-height:100%;box-sizing:border-box;padding:30px 34px 40px;background:radial-gradient(circle at 50% 0%,rgba(90,126,80,.12),transparent 42%),linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.18))}
#friendsTop{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1180px;margin:0 auto 22px}
#friendsHeading{margin:0;font-family:MinecraftFont,monospace;font-size:32px;text-shadow:3px 3px 0 #000;letter-spacing:.4px}
#friendsSubheading{margin:5px 0 0;color:#aaa;font-size:12px}
#friendsClose{min-width:110px;height:44px;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#676767,#474747);color:#fff;font:bold 13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#friendsClose:hover{filter:brightness(1.12)}
#friendsGrid{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(260px,330px) minmax(0,1fr);gap:18px}
.friendsCard{background:linear-gradient(#292929,#1b1b1b);border:2px solid #101010;border-top-color:#737373;border-left-color:#737373;box-shadow:6px 6px 0 rgba(0,0,0,.45);padding:20px}
.friendsCard h3{margin:0 0 13px;font:16px MinecraftFont,monospace;text-shadow:2px 2px 0 #000}
#friendsCodeCard{text-align:center}
#friendsCodeLabel{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px}
#friendsCodeValue{margin:9px 0 15px;padding:13px 8px;background:#111;border:1px solid #4b4b4b;color:#b7df8b;font:bold 26px MinecraftFont,monospace;letter-spacing:3px;text-shadow:2px 2px 0 #000}
.friendsAction{width:100%;min-height:42px;padding:9px 12px;margin:8px 0;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#6e8f50,#526f3c);color:#fff;font:13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-sizing:border-box}
.friendsAction:hover{filter:brightness(1.1)}
.friendsInput{width:100%;height:44px;box-sizing:border-box;padding:0 12px;background:#101010;color:#fff;border:2px solid #070707;border-top-color:#737373;border-left-color:#737373;outline:none;margin-bottom:4px}
.friendsInput:focus{border-color:#88b363;box-shadow:0 0 0 2px rgba(136,179,99,.16)}
#friendsStatus{min-height:20px;margin:8px 0 0;color:#aaa;font-size:12px;line-height:1.4;text-align:center}
#friendsSections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.friendsList{min-height:120px}
.friendFullRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;margin:7px 0;background:#303030;border:1px solid #4d4d4d}
.friendFullName{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.friendFullMeta{font-size:10px;color:#999;margin-top:3px}.friendFullActions{display:flex;gap:6px;flex:0 0 auto}.friendSmallAction{min-height:32px;padding:5px 10px;background:#4d4d4d;border:1px solid #777;color:#fff;cursor:pointer}.friendSmallAction.accept{background:#5e8242}.friendSmallAction.decline{background:#6a3f3f}.friendEmpty{padding:16px;color:#888;background:#181818;border:1px solid #333;font-size:12px;text-align:center}
@media(max-width:800px){#friendsPage{padding:18px 14px 30px}#friendsGrid{grid-template-columns:1fr}#friendsSections{grid-template-columns:1fr}#friendsTop{align-items:flex-start}.friendsCard{padding:16px}}
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
      <div class="friendsCard" style="margin-top:18px"><h3>Add a Friend</h3><input id="friendsCodeInput" class="friendsInput" maxlength="9" autocomplete="off" placeholder="Enter friend code"><button class="friendsAction" id="friendsAdd" type="button">Send Friend Request</button><div id="friendsStatus"></div></div>
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
}

function getDb() { return window.firebase?.firestore?.() || null; }
function getAuth() { return window.firebase?.auth?.() || null; }

async function copyCode() {
    const code = currentUser?.uid ? makeFriendCode(currentUser.uid) : "";
    if (!code) return setStatus("Sign in to get a friend code.");
    try { await navigator.clipboard.writeText(code); setStatus("Friend code copied!"); } catch { setStatus("Could not copy the friend code."); }
}

function setStatus(text) { const el = document.getElementById("friendsStatus"); if (el) el.textContent = text || ""; }

async function addFriend() {
    if (!currentUser || !getDb()) return setStatus("Sign in to add friends.");
    const input = document.getElementById("friendsCodeInput");
    const code = input.value.trim().toUpperCase();
    if (!code) return setStatus("Enter a friend code.");
    const ownCode = makeFriendCode(currentUser.uid);
    if (code === ownCode) return setStatus("You cannot add yourself.");
    try {
        const db = getDb();
        const snap = await db.collection("publicProfiles").where("friendCode", "==", code).limit(1).get();
        if (snap.empty) return setStatus("No account was found with that friend code.");
        const target = snap.docs[0].data();
        if (!target.uid || target.uid === currentUser.uid) return setStatus("You cannot add yourself.");
        const id = `${currentUser.uid}_${target.uid}`;
        const existing = await db.collection("friendRequests").doc(id).get();
        if (existing.exists) {
            const status = existing.data()?.status;
            if (status === "accepted") return setStatus("You are already friends.");
            if (status === "pending") return setStatus("A request is already pending.");
        }
        await db.collection("friendRequests").doc(id).set({ fromUid: currentUser.uid, toUid: target.uid, fromName: currentUser.displayName || "Player", toName: target.displayName || "Player", status: "pending", createdAt: new Date(), updatedAt: new Date() });
        input.value = "";
        setStatus(`Friend request sent to ${target.displayName || "Player"}.`);
        refreshFriends();
    } catch (error) { console.warn(error); setStatus("Could not send the friend request."); }
}

async function setRequest(id, accept) {
    if (!currentUser || !getDb()) return;
    try { await getDb().collection("friendRequests").doc(id).update({ status: accept ? "accepted" : "declined", updatedAt: new Date() }); refreshFriends(); }
    catch { setStatus("Could not update that request."); }
}

async function refreshFriends() {
    if (!currentUser || !getDb()) return;
    const db = getDb();
    const requestsEl = document.getElementById("friendsRequests"), listEl = document.getElementById("friendsList");
    if (!requestsEl || !listEl) return;
    try {
        const incoming = await db.collection("friendRequests").where("toUid", "==", currentUser.uid).get();
        const outgoing = await db.collection("friendRequests").where("fromUid", "==", currentUser.uid).get();
        const incomingPending = incoming.docs.map(d => ({ id:d.id, ...d.data() })).filter(x => x.status === "pending");
        requestsEl.innerHTML = incomingPending.length ? incomingPending.map(x => `<div class="friendFullRow"><div><div class="friendFullName">${esc(x.fromName || "Player")}</div><div class="friendFullMeta">Friend request</div></div><div class="friendFullActions"><button class="friendSmallAction accept" data-accept="${esc(x.id)}">Accept</button><button class="friendSmallAction decline" data-decline="${esc(x.id)}">Decline</button></div></div>`).join("") : '<div class="friendEmpty">No pending requests.</div>';
        requestsEl.querySelectorAll("[data-accept]").forEach(btn => btn.addEventListener("click", () => setRequest(btn.dataset.accept, true)));
        requestsEl.querySelectorAll("[data-decline]").forEach(btn => btn.addEventListener("click", () => setRequest(btn.dataset.decline, false)));
        const all = new Map();
        for (const doc of [...incoming.docs, ...outgoing.docs]) {
            const x = doc.data();
            if (x.status !== "accepted") continue;
            const uid = x.fromUid === currentUser.uid ? x.toUid : x.fromUid;
            const name = x.fromUid === currentUser.uid ? x.toName : x.fromName;
            if (uid) all.set(uid, { uid, name:name || "Player" });
        }
        listEl.innerHTML = all.size ? [...all.values()].map(x => `<div class="friendFullRow"><div><div class="friendFullName">${esc(x.name)}</div><div class="friendFullMeta">Friend</div></div></div>`).join("") : '<div class="friendEmpty">No friends yet.</div>';
    } catch (error) { console.warn("Could not load friends:", error); requestsEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>'; listEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>'; }
}

function updateBadge(count = 0) {
    const button = document.getElementById("friendsButton");
    if (!button) return;
    button.classList.toggle("friendAlert", count > 0);
    button.querySelector(".friendsBadge")?.remove();
    if (count > 0) {
        const badge = document.createElement("span"); badge.className = "friendsBadge"; badge.textContent = count > 99 ? "99+" : String(count); button.appendChild(badge);
    }
}

function syncFromAccountBadge() {
    const accountButton = document.getElementById("accountButton");
    if (!accountButton) return;
    const badge = accountButton.querySelector(".friendRequestBadge");
    const count = badge ? parseInt(badge.textContent, 10) || 0 : 0;
    updateBadge(count);
    badge?.remove();
    accountButton.classList.remove("friendRequestAlert");
}

function openFriends() {
    createUi();
    const modal = document.getElementById(FRIENDS_MODAL_ID);
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    updateFriendUi();
}

function closeFriends() {
    const modal = document.getElementById(FRIENDS_MODAL_ID);
    if (modal) modal.classList.remove("open");
    document.body.style.overflow = "";
}

async function updateFriendUi() {
    const auth = getAuth();
    currentUser = auth?.currentUser || null;
    const code = currentUser ? makeFriendCode(currentUser.uid) : "--------";
    const codeEl = document.getElementById("friendsCodeValue");
    if (codeEl) codeEl.textContent = code;
    const requestsEl = document.getElementById("friendsRequests"), listEl = document.getElementById("friendsList");
    if (!currentUser) {
        if (requestsEl) requestsEl.innerHTML = '<div class="friendEmpty">Log in to view friend requests.</div>';
        if (listEl) listEl.innerHTML = '<div class="friendEmpty">Log in to view your friends.</div>';
        setStatus("Sign in through Account to manage friends.");
        return;
    }
    setStatus("");
    refreshFriends();
}

function setupButton() {
    if (document.getElementById("friendsButton")) return;
    const button = document.createElement("button");
    button.id = "friendsButton";
    button.type = "button";
    button.textContent = "Friends";
    button.addEventListener("click", openFriends);
    document.body.appendChild(button);
    syncFromAccountBadge();
}

function watchAccountBadge() {
    const observer = new MutationObserver(syncFromAccountBadge);
    observer.observe(document.body, { childList:true, subtree:true });
    syncFromAccountBadge();
    const toastObserver = new MutationObserver(() => {
        const toast = document.getElementById("friendRequestToast");
        if (!toast || toast.dataset.friendsBound === "1") return;
        toast.dataset.friendsBound = "1";
        toast.addEventListener("click", event => { event.preventDefault(); event.stopImmediatePropagation(); openFriends(); }, true);
        toast.querySelector(".friendToastHint")?.replaceChildren(document.createTextNode("Click to open Friends"));
    });
    toastObserver.observe(document.body, { childList:true, subtree:true });
}

async function init() {
    if (initialized) return;
    initialized = true;
    addStyles();
    createUi();
    setupButton();
    watchAccountBadge();
    if (!isFirebaseConfigured()) return;
    await waitForFirebase();
    const auth = getAuth();
    if (!auth) return;
    const sync = user => { currentUser = user || null; if (friendUnsubscribe) { try { friendUnsubscribe(); } catch {} friendUnsubscribe = null; } if (user && getDb()) { friendUnsubscribe = getDb().collection("friendRequests").where("toUid", "==", user.uid).onSnapshot(snapshot => updateBadge(snapshot.docs.filter(d => d.data()?.status === "pending").length)); } else updateBadge(0); if (document.getElementById(FRIENDS_MODAL_ID)?.classList.contains("open")) updateFriendUi(); };
    sync(auth.currentUser);
    auth.onAuthStateChanged(sync);
}

window.openFriends = openFriends;

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
