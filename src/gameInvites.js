const FIREBASE_VERSION = "12.18.0";
const ROOT = "gameInvites";
const SEEN_KEY = "webminecraft_seen_game_invites_v1";
let db = null;
let user = null;
let picker = null;
let activeInvite = null;
let toastTimer = null;
let inviteListenerRef = null;

const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");

async function firebaseReady() {
    const start = Date.now();
    while (Date.now() - start < 10000) {
        if (window.firebase?.auth && window.firebase?.database) {
            try { db = window.firebase.database(); return true; } catch {}
        }
        await new Promise(r => setTimeout(r, 80));
    }
    return false;
}

function seen() {
    try { const a = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); return new Set(Array.isArray(a) ? a.map(String) : []); } catch { return new Set(); }
}
function markSeen(id) {
    const s = seen(); s.add(String(id));
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-100))); } catch {}
}

function styles() {
    if (document.getElementById("gameInviteStyles")) return;
    const s = document.createElement("style");
    s.id = "gameInviteStyles";
    s.textContent = `
#gameInvitePicker{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.62);z-index:2200000;color:#fff;font-family:Arial,sans-serif}
#gameInvitePicker.open{display:flex}
#gameInvitePanel{width:min(560px,94vw);max-height:88vh;display:flex;flex-direction:column;background:linear-gradient(#303730,#202520);border:3px solid #111;border-top-color:#929b90;border-left-color:#929b90;box-shadow:8px 8px 0 rgba(0,0,0,.55)}
#gameInviteHeader{display:flex;justify-content:space-between;align-items:center;padding:17px 20px;background:#343b34;border-bottom:2px solid #111}
#gameInviteTitle{margin:0;font:bold 22px Arial Black,Arial,sans-serif;text-shadow:2px 2px 0 #111}
#gameInviteClose{width:38px;height:36px;background:#676b68;color:#fff;border:2px solid #111;border-top-color:#999;border-left-color:#999;font-size:24px;cursor:pointer}
#gameInviteContext{padding:12px 20px;background:#20251f;border-bottom:1px solid #111;color:#aeb8ae;font-size:11px;line-height:1.5}
#gameInviteList{min-height:0;overflow:auto;padding:14px 16px}
.gameInviteFriend{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;margin-bottom:8px;background:#2d332e;border:2px solid #111;border-top-color:#687266;border-left-color:#687266}
.gameInviteFriendMain{min-width:0}.gameInviteFriendName{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gameInviteFriendMeta{margin-top:4px;color:#8f9990;font-size:10px}
.gameInviteSend{min-width:90px;min-height:36px;background:linear-gradient(#719251,#54743d);color:#fff;border:2px solid #111;border-top-color:#9bbb83;border-left-color:#9bbb83;font:bold 10px Arial,sans-serif;cursor:pointer}
.gameInviteEmpty{padding:28px 16px;text-align:center;color:#929a92;font-size:11px;line-height:1.5}
#gameInviteStatus{min-height:18px;padding:11px 16px;background:#252b26;border-top:1px solid #111;color:#a8ca8e;font-size:10px}
#gameInviteToast{position:fixed;right:22px;top:22px;width:min(410px,calc(100vw - 44px));display:none;z-index:2300000;background:linear-gradient(#303630,#222722);border:2px solid #111;border-top-color:#939c92;border-left-color:#939c92;color:#fff;box-shadow:7px 7px 0 rgba(0,0,0,.5);font-family:Arial,sans-serif}
#gameInviteToast.show{display:block}
#gameInviteToastHead{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-bottom:1px solid #111;font-weight:800}
#gameInviteToastClose{border:0;background:none;color:#aaa;font-size:18px;cursor:pointer}
#gameInviteToastBody{padding:12px 14px;color:#c3cbc3;font-size:11px;line-height:1.5}
#gameInviteToastButtons{display:flex;gap:7px;padding:0 14px 13px}.gameInviteToastButton{flex:1;min-height:36px;background:#565c57;color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;font:bold 10px Arial,sans-serif;cursor:pointer}.gameInviteToastJoin{background:linear-gradient(#719251,#54743d)}
@media(max-width:600px){#gameInviteToast{right:12px;top:12px;width:calc(100vw - 24px)}}
`;
    document.head.appendChild(s);
}

function ensurePicker() {
    if (picker) return picker;
    styles();
    picker = document.createElement("div");
    picker.id = "gameInvitePicker";
    picker.innerHTML = `
<div id="gameInvitePanel" role="dialog" aria-modal="true" aria-labelledby="gameInviteTitle">
<div id="gameInviteHeader"><h2 id="gameInviteTitle">Invite Friends</h2><button id="gameInviteClose" type="button">×</button></div>
<div id="gameInviteContext"></div><div id="gameInviteList"></div><div id="gameInviteStatus" aria-live="polite"></div>
</div>`;
    document.body.appendChild(picker);
    picker.addEventListener("click", e => {
        if (e.target === picker) picker.classList.remove("open");
        const b = e.target.closest("[data-game-invite-friend]");
        if (b) sendInvite(b.dataset.gameInviteFriend);
    });
    picker.querySelector("#gameInviteClose").addEventListener("click", () => picker.classList.remove("open"));
    return picker;
}

function roomInfo() {
    const x = window.__webminecraftMultiplayerRoomInfo || {};
    return {
        active: Boolean(window.__webminecraftMultiplayerActive),
        room: String(x.room || "default"),
        serverName: String(x.serverName || "WebMinecraft Server"),
        websocket: String(x.websocket || window.__webminecraftMultiplayerWebsocket || ""),
        mode: String(window.__webminecraftMultiplayerMode || "survival"),
        private: Boolean(x.private)
    };
}

async function openPicker() {
    const p = ensurePicker();
    if (!(await firebaseReady())) {
        p.querySelector("#gameInviteContext").textContent = "Friends are unavailable right now.";
        p.querySelector("#gameInviteList").innerHTML = '<div class="gameInviteEmpty">Could not connect to the friends service.</div>';
        p.classList.add("open"); return;
    }
    user = window.firebase.auth().currentUser;
    const info = roomInfo();
    if (!user) {
        p.querySelector("#gameInviteContext").textContent = "Sign in to invite friends.";
        p.querySelector("#gameInviteList").innerHTML = '<div class="gameInviteEmpty">Sign in to send game invites.</div>';
        p.classList.add("open"); return;
    }
    if (!info.active) {
        p.querySelector("#gameInviteContext").textContent = "You are not in a multiplayer world.";
        p.querySelector("#gameInviteList").innerHTML = '<div class="gameInviteEmpty">Join a multiplayer world before sending an invite.</div>';
        p.classList.add("open"); return;
    }
    p.querySelector("#gameInviteContext").innerHTML = `Invite friends to <strong>${esc(info.room)}</strong> on <strong>${esc(info.serverName)}</strong>.`;
    try {
        const snap = await db.ref(`friends/${user.uid}`).once("value");
        const friends = [];
        snap.forEach(child => { const v = child.val() || {}; friends.push({ uid:String(child.key), name:String(v.name || "Player") }); });
        friends.sort((a,b) => a.name.localeCompare(b.name));
        p.querySelector("#gameInviteList").innerHTML = friends.length ? friends.map(f =>
            `<div class="gameInviteFriend"><div class="gameInviteFriendMain"><div class="gameInviteFriendName">${esc(f.name)}</div><div class="gameInviteFriendMeta">Friend</div></div><button class="gameInviteSend" type="button" data-game-invite-friend="${esc(f.uid)}">Send Invite</button></div>`
        ).join("") : '<div class="gameInviteEmpty">You do not have any friends yet. Add friends from the Friends screen first.</div>';
        p.querySelector("#gameInviteStatus").textContent = "";
    } catch (e) {
        console.warn("Game invite friends load failed:", e);
        p.querySelector("#gameInviteList").innerHTML = '<div class="gameInviteEmpty">Could not load your friends.</div>';
    }
    p.classList.add("open");
}

async function sendInvite(friendUid) {
    if (!db || !user || !friendUid) return;
    const info = roomInfo();
    if (!info.active || !info.websocket) {
        picker.querySelector("#gameInviteStatus").textContent = "Server connection information is not available yet.";
        return;
    }
    const button = picker.querySelector(`[data-game-invite-friend="${CSS.escape(friendUid)}"]`);
    if (button) { button.disabled = true; button.textContent = "Sending…"; }
    const inviteId = `${user.uid}_${friendUid}_${Date.now()}`;
    const payload = {
        inviteId, fromUid:user.uid,
        fromName:user.displayName || localStorage.getItem("webminecraft-player-name") || "Player",
        toUid:friendUid, room:info.room, serverName:info.serverName, websocket:info.websocket,
        mode:info.mode, private:info.private, createdAt:window.firebase.database.ServerValue.TIMESTAMP, status:"pending"
    };
    try {
        await db.ref(`${ROOT}/${friendUid}/${inviteId}`).set(payload);
        picker.querySelector("#gameInviteStatus").textContent = "Invite sent!";
        if (button) { button.textContent = "Sent"; }
    } catch (e) {
        console.warn("Game invite send failed:", e);
        picker.querySelector("#gameInviteStatus").textContent = "Could not send that invite.";
        if (button) { button.disabled = false; button.textContent = "Send Invite"; }
    }
}

function ensureToast() {
    styles();
    let toast = document.getElementById("gameInviteToast");
    if (toast) return toast;
    toast = document.createElement("div");
    toast.id = "gameInviteToast";
    toast.innerHTML = `
<div id="gameInviteToastHead"><span>Game Invite</span><button id="gameInviteToastClose" type="button">×</button></div>
<div id="gameInviteToastBody"></div>
<div id="gameInviteToastButtons"><button id="gameInviteToastJoin" class="gameInviteToastButton gameInviteToastJoin" type="button">Join World</button><button id="gameInviteToastDismiss" class="gameInviteToastButton" type="button">Dismiss</button></div>`;
    document.body.appendChild(toast);
    toast.querySelector("#gameInviteToastClose").addEventListener("click", () => hideToast());
    toast.querySelector("#gameInviteToastDismiss").addEventListener("click", () => hideToast());
    toast.querySelector("#gameInviteToastJoin").addEventListener("click", joinInvite);
    return toast;
}

function showInvite(invite) {
    const toast = ensureToast();
    activeInvite = invite;
    toast.querySelector("#gameInviteToastBody").textContent = `${invite.fromName || "A friend"} invited you to join ${invite.room || "their world"}`;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 12000);
    markSeen(invite.inviteId);
}

function hideToast() {
    const t = document.getElementById("gameInviteToast");
    if (t) t.classList.remove("show");
    activeInvite = null;
}

async function joinInvite() {
    const invite = activeInvite;
    hideToast();
    if (!invite?.websocket || !invite?.room) return;
    if (invite.private) {
        window.alert?.("This room is private. Ask the host for the private code.");
        return;
    }
    try {
        if (window.__webminecraftMultiplayerActive) return;
        const mp = await import("./multiplayerClient.js");
        mp.openMultiplayerMenu();
        const start = Date.now();
        while (Date.now() - start < 5000) {
            const menu = document.getElementById("multiplayerMenu");
            if (menu) {
                const server = menu.querySelector("#multiplayerServer"), room = menu.querySelector("#multiplayerRoom"), pub = menu.querySelector("#multiplayerPublic"), join = menu.querySelector("#multiplayerJoin");
                if (server && room && join) {
                    server.value = invite.websocket; room.value = String(invite.room).slice(0,32); pub?.click(); join.disabled=false; join.click(); return;
                }
            }
            await new Promise(r => setTimeout(r,60));
        }
    } catch (e) { console.warn("Game invite join failed:", e); }
}

function startInviteListener() {
    if (!db || !user?.uid) return;
    if (inviteListenerRef) { try { inviteListenerRef.off("child_added"); } catch {} }
    inviteListenerRef = db.ref(`${ROOT}/${user.uid}`);
    inviteListenerRef.on("child_added", snap => {
        const invite = snap.val() || {};
        const id = String(invite.inviteId || snap.key || "");
        if (!id || invite.status !== "pending" || invite.toUid !== user.uid || seen().has(id)) return;
        showInvite(invite);
    });
}

async function start() {
    styles();
    if (!(await firebaseReady())) return;
    window.firebase.auth().onAuthStateChanged(u => {
        user = u || null;
        if (inviteListenerRef) { try { inviteListenerRef.off(); } catch {} inviteListenerRef = null; }
        if (user) startInviteListener();
    });
}
void start();
window.__webminecraftOpenGameInvitePicker = openPicker;
