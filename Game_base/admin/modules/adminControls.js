const ADMIN_API = "https://webminecraft-server.onrender.com";
const DEV_EMAIL = "worthmarcus19@gmail.com";
const ADMIN_COLLECTION = "admins";
let adminModal = null;
let adminPoll = null;
let currentAdminRole = "admin";

function firebaseUser() { try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; } }
function isDeveloper() { return String(firebaseUser()?.email || "").toLowerCase() === DEV_EMAIL.toLowerCase(); }

async function getAdminRole() {
    const user = firebaseUser();
    if (!user) return "";
    if (isDeveloper()) return "developer";
    try {
        const uid = String(user.uid || "").trim();
        const firestore = window.firebase?.firestore?.();
        if (!uid || !firestore) return "";
        const doc = await firestore.collection(ADMIN_COLLECTION).doc(uid).get();
        const data = doc.data() || {};
        if (!doc.exists || data.enabled !== true) return "";
        return String(data.role || "admin").toLowerCase() === "main" ? "main" : "admin";
    } catch (error) {
        console.warn("Could not check admin access:", error);
        return "";
    }
}
async function isAdminUser() {
    const role = await getAdminRole();
    currentAdminRole = role || "admin";
    return Boolean(role);
}

async function adminToken() { const user = firebaseUser(); if (!user) return ""; try { return await user.getIdToken(); } catch { return ""; } }

async function adminRequest(path, options = {}) {
    const token = await adminToken();
    const response = await fetch(`${ADMIN_API}${path}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Admin request failed.");
    return data;
}

function esc(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function addStyles() {
    if (document.getElementById("adminControlsStyles")) return;
    const style = document.createElement("style");
    style.id = "adminControlsStyles";
    style.textContent = `
#accountAdminControlsButton{background:linear-gradient(#66864b,#4d693a)!important;border-color:#25351d!important}
#adminControlsModal{position:fixed;inset:0;display:none;align-items:stretch;justify-content:stretch;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);z-index:600;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
#adminControlsPanel{width:100vw;height:100vh;max-width:none;max-height:none;display:flex;flex-direction:column;overflow:hidden;background:#151515;color:#fff;border:0;box-shadow:0 18px 55px rgba(0,0,0,.65),inset 1px 1px 0 rgba(255,255,255,.08)}
#adminControlsHeader{display:flex;align-items:center;gap:14px;padding:16px 20px;background:linear-gradient(90deg,#303030,#242424);border-bottom:2px solid #0b0b0b;min-height:72px}
.adminControlsHeaderIcon{width:42px;height:42px;display:grid;place-items:center;background:#3d5b2f;border:2px solid #101010;color:#fff;font-size:22px;box-shadow:inset 2px 2px 0 rgba(255,255,255,.1)}
.adminControlsHeadText{min-width:0}.adminControlsTitle{display:block;font-family:MinecraftFont,monospace;font-size:21px;line-height:1.1;text-shadow:2px 2px 0 #000}.adminControlsSubtitle{display:block;margin-top:4px;color:#9d9d9d;font-size:11px}
.adminControlsBadge{margin-left:auto;display:flex;align-items:center;gap:7px;padding:7px 10px;background:#1e2b18;border:1px solid #39532d;color:#a8d98b;font-size:10px}.adminControlsBadgeDot{width:7px;height:7px;border-radius:50%;background:#7fc85b;box-shadow:0 0 8px rgba(127,200,91,.8)}
.adminControlsClose{margin-left:0;width:42px;height:40px;background:#484848;color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;font-size:22px;cursor:pointer;line-height:1}.adminControlsClose:hover{filter:brightness(1.15)}
#adminControlsTabs{display:flex;gap:6px;padding:10px 14px;background:#1d1d1d;border-bottom:1px solid #0b0b0b}.adminControlsTab{position:relative;border:1px solid #353535;background:#292929;color:#9f9f9f;padding:11px 16px;font-family:MinecraftFont,monospace;font-size:10px;cursor:pointer;transition:.12s}.adminControlsTab:hover{background:#343434;color:#fff}.adminControlsTab.active{background:#5b793f;color:#fff;border-color:#739b52}.adminControlsTab.active:after{content:"";position:absolute;left:10px;right:10px;bottom:-11px;height:2px;background:#88b260}
#adminControlsContent{flex:1;min-height:0;overflow:auto;padding:18px;background:linear-gradient(#1c1c1c,#171717)}#adminControlsContent::-webkit-scrollbar{width:11px}#adminControlsContent::-webkit-scrollbar-track{background:#111}#adminControlsContent::-webkit-scrollbar-thumb{background:#454545;border:3px solid #111}
.adminOverview{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}.adminStat{padding:13px 15px;background:#222;border:1px solid #343434}.adminStatLabel{display:block;color:#898989;text-transform:uppercase;font-size:9px;letter-spacing:.08em}.adminStatValue{display:block;margin-top:5px;font-size:24px;font-weight:800}.adminStatValue.green{color:#98c875}.adminSectionTitle{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:0 0 10px}.adminSectionTitle h3{margin:0;font-family:MinecraftFont,monospace;font-size:13px}.adminSectionTitle span{color:#777;font-size:10px}
.adminServerGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.adminServerCard{background:#202020;border:1px solid #383838;padding:0;overflow:hidden}.adminServerCard:hover{border-color:#4b4b4b}.adminServerHead{display:flex;align-items:center;gap:10px;padding:13px 14px;background:#292929;border-bottom:1px solid #111}.adminServerIcon{width:34px;height:34px;display:grid;place-items:center;background:#333;border:1px solid #444;font-size:17px}.adminServerName{font-weight:800;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.adminServerMeta{font-size:10px;color:#8fbc72}.adminServerBody{padding:11px}.adminServerLabel{color:#777;text-transform:uppercase;letter-spacing:.08em;font-size:8px;margin-bottom:6px}.adminServerPlayers{display:flex;flex-direction:column;gap:5px}.adminPlayer{display:flex;align-items:center;gap:9px;background:#171717;border:1px solid #303030;padding:7px 8px;font-size:11px}.adminPlayerAvatar{width:26px;height:26px;background:#3b3b3b;display:grid;place-items:center;font-size:11px}.adminPlayerName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.adminOnlineDot{width:6px;height:6px;border-radius:50%;background:#84c65c}.adminKick{background:#633f3b;color:#fff;border:1px solid #7a4843;padding:5px 8px;font-size:9px;cursor:pointer}.adminKick:hover{background:#7b4c48}.adminEmpty{color:#777;padding:20px;text-align:center;font-size:11px;background:#171717;border:1px dashed #303030}
.adminChat{margin-top:10px;border:1px solid #303030;background:#111}.adminChatTitle{padding:7px 9px;border-bottom:1px solid #292929;color:#999;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.adminChatFeed{max-height:130px;min-height:38px;overflow:auto;padding:8px;font-size:10px;display:flex;flex-direction:column;gap:5px}.adminChatLine{line-height:1.4;color:#ddd}.adminChatLine strong{color:#9fc87f}.adminChatLine.adminChatAdmin strong{color:#55ff55}.adminChatVerify{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;margin-left:3px;margin-right:3px;border-radius:50%;background:#3f8cff;color:#fff;font:700 9px Arial,sans-serif;text-shadow:none;vertical-align:-1px;box-shadow:0 0 2px rgba(0,0,0,.8)}.adminChatInputRow{display:flex;gap:6px;padding:7px;border-top:1px solid #292929}.adminChatInput{flex:1;min-width:0;background:#222;color:#fff;border:1px solid #4a4a4a;padding:8px;font-size:10px;outline:none}.adminChatInput:focus{border-color:#719d50}.adminChatSend{background:#587640;color:#fff;border:1px solid #111;padding:7px 12px;font-family:MinecraftFont,monospace;font-size:9px;cursor:pointer}.adminChatSend:hover{filter:brightness(1.1)}
.adminDiscussionCard{background:#202020;border:1px solid #383838;padding:12px;margin-bottom:9px}.adminDiscussionTop{display:flex;align-items:center;gap:8px;margin-bottom:8px}.adminDiscussionChannel{padding:4px 7px;background:#34462a;border:1px solid #4c673b;color:#a8cd8c;font-size:9px;text-transform:uppercase}.adminDiscussionUser{font-weight:700;font-size:11px}.adminDiscussionTime{margin-left:auto;color:#666;font-size:9px}.adminDiscussionText{white-space:pre-wrap;word-break:break-word;color:#e7e7e7;font-size:11px;line-height:1.45;padding:9px;background:#171717;border:1px solid #2b2b2b}.adminDeleteDiscussion{margin-top:8px;background:#633f3b;color:#fff;border:1px solid #7a4843;padding:6px 10px;font-size:9px;cursor:pointer}.adminDeleteDiscussion:hover{background:#7b4c48}
.adminHint{color:#777;font-size:10px;line-height:1.4;padding:4px 0 10px}
.adminAnnouncementPanel{display:flex;flex-direction:column;gap:9px}.adminAnnouncementLabel{font-size:11px;color:#aaa}.adminAnnouncementInput,.adminAnnouncementMessage{width:100%;box-sizing:border-box;background:#171717;color:#fff;border:1px solid #4a4a4a;padding:9px;font:12px Arial,sans-serif;outline:none}.adminAnnouncementInput{height:38px}.adminAnnouncementMessage{min-height:150px;resize:vertical;line-height:1.45}.adminAnnouncementInput:focus,.adminAnnouncementMessage:focus{border-color:#84ad5e}.adminAnnouncementStatus{min-height:18px;font-size:11px;color:#999}.adminRefresh{border:1px solid #444;background:#292929;color:#ddd;padding:6px 10px;font-size:9px;cursor:pointer}.adminRefresh:hover{background:#353535}
@media(max-width:800px){#adminControlsPanel{width:100vw;height:100vh;border:0}.adminControlsBadge{display:none}.adminServerGrid{grid-template-columns:1fr}.adminOverview{grid-template-columns:1fr 1fr}.adminControlsSubtitle{display:none}.adminControlsHeader{padding:14px 16px;min-height:64px}.adminControlsTabs{overflow-x:auto;scrollbar-width:none}.adminControlsTabs::-webkit-scrollbar{display:none}}
@media(max-width:520px){#adminControlsModal{padding:0}#adminControlsPanel{width:100vw;height:100vh}.adminOverview{grid-template-columns:1fr 1fr 1fr;gap:6px}.adminStat{padding:10px}.adminStatValue{font-size:19px}.adminControlsTab{flex:1;padding:10px 6px;font-size:8px}.adminServerHead{padding:11px}.adminServerBody{padding:8px}.adminChatInputRow{flex-direction:column}.adminChatSend{width:100%}}
`;
    document.head.appendChild(style);
}

function createAccountButton(accountUser) {
    if (document.getElementById("accountAdminControlsButton")) return;
    const button = document.createElement("button"); button.id = "accountAdminControlsButton"; button.className = "accountAction"; button.type = "button"; button.textContent = "Admin Controls"; button.addEventListener("click", openAdminControls);
    const logout = document.getElementById("accountLogout"); if (logout) accountUser.insertBefore(button, logout); else accountUser.appendChild(button);
}

function installButton() {
    const accountUser = document.getElementById("accountUser"); if (!accountUser) return;
    const existing = document.getElementById("accountAdminControlsButton"); const user = firebaseUser();
    if (!user) { existing?.remove(); return; }
    if (isDeveloper()) { if (!existing) createAccountButton(accountUser); return; }
    isAdminUser().then(ok => { if (!ok) existing?.remove(); else if (!document.getElementById("accountAdminControlsButton")) createAccountButton(accountUser); });
}

function createModal() {
    if (adminModal) return; addStyles();
    adminModal = document.createElement("div"); adminModal.id = "adminControlsModal";
    adminModal.innerHTML = `<div id="adminControlsPanel"><header id="adminControlsHeader"><div class="adminControlsHeaderIcon">⚙</div><div class="adminControlsHeadText"><span class="adminControlsTitle">Admin Controls</span><span class="adminControlsSubtitle">Manage multiplayer servers and community discussions</span></div><div class="adminControlsBadge"><span class="adminControlsBadgeDot"></span>ADMIN ACCESS</div><button class="adminControlsClose" type="button" aria-label="Close">×</button></header><nav id="adminControlsTabs"><button class="adminControlsTab active" data-tab="servers" type="button">Servers</button><button class="adminControlsTab" data-tab="discussions" type="button">Discussions</button><button class="adminControlsTab" data-tab="announcements" type="button" style="display:none">Announcements</button></nav><div id="adminControlsContent"><div class="adminEmpty">Loading...</div></div></div>`;
    document.body.appendChild(adminModal);
    adminModal.querySelector(".adminControlsClose").addEventListener("click", closeAdminControls);
    adminModal.addEventListener("click", e => { if (e.target === adminModal) closeAdminControls(); });
    adminModal.querySelectorAll(".adminControlsTab").forEach(tab => tab.addEventListener("click", () => { adminModal.querySelectorAll(".adminControlsTab").forEach(t => t.classList.toggle("active", t === tab)); if (tab.dataset.tab === "servers") loadAdminServers(); else if (tab.dataset.tab === "discussions") loadAdminDiscussions(); else loadAdminAnnouncements(); }));
}

function renderServerStats(servers) {
    const totalPlayers = servers.reduce((sum, server) => sum + (server.players?.length || 0), 0);
    const totalChat = servers.reduce((sum, server) => sum + (server.chat?.length || 0), 0);
    return `<div class="adminOverview"><div class="adminStat"><span class="adminStatLabel">Active Servers</span><span class="adminStatValue">${servers.length}</span></div><div class="adminStat"><span class="adminStatLabel">Players Online</span><span class="adminStatValue green">${totalPlayers}</span></div><div class="adminStat"><span class="adminStatLabel">Recent Chat</span><span class="adminStatValue">${totalChat}</span></div></div>`;
}

async function loadAdminServers() {
    const content = document.getElementById("adminControlsContent"); if (!content) return;
    try {
        const data = await adminRequest("/admin/servers"); const servers = data.servers || [];
        content.innerHTML = renderServerStats(servers) + `<div class="adminSectionTitle"><div><h3>Live Multiplayer</h3><span>Currently running servers</span></div><button class="adminRefresh" type="button">Refresh</button></div><div class="adminServerGrid" id="adminServerGrid"></div>`;
        content.querySelector(".adminRefresh").addEventListener("click", loadAdminServers);
        const grid = content.querySelector("#adminServerGrid");
        if (!servers.length) { grid.innerHTML = '<div class="adminEmpty">No active multiplayer servers.</div>'; return; }
        servers.forEach(server => {
            const card = document.createElement("section"); card.className = "adminServerCard"; card.dataset.serverId = String(server.id || "");
            const players = server.players || []; const chat = server.chat || [];
            card.innerHTML = `<div class="adminServerHead"><div class="adminServerIcon">▣</div><strong class="adminServerName">${esc(server.name || server.id)}</strong><span class="adminServerMeta">${players.length} player${players.length === 1 ? "" : "s"}</span></div><div class="adminServerBody"><div class="adminServerLabel">Players</div><div class="adminServerPlayers"></div><div class="adminChat"><div class="adminChatTitle">Server Chat</div><div class="adminChatFeed"></div><div class="adminChatInputRow"><input class="adminChatInput" maxlength="120" placeholder="Send a developer message..."><button class="adminChatSend" type="button">Send</button></div></div></div>`;
            const playersEl = card.querySelector(".adminServerPlayers");
            if (!players.length) playersEl.innerHTML = '<div class="adminEmpty">No players in this server.</div>';
            players.forEach(player => {
                const row = document.createElement("div"); row.className = "adminPlayer";
                const initial = String(player.name || "?").slice(0,1).toUpperCase();
                row.innerHTML = `<div class="adminPlayerAvatar">${esc(initial)}</div><div class="adminOnlineDot"></div><span class="adminPlayerName">${esc(player.name || "Player")}</span><button class="adminKick" type="button">Kick</button>`;
                row.querySelector(".adminKick").addEventListener("click", async () => { if (!confirm(`Kick ${player.name} from this server?`)) return; try { await adminRequest("/admin/action", {method:"POST",body:JSON.stringify({action:"kick",serverId:server.id,playerId:player.id})}); await loadAdminServers(); } catch(e) { alert(e.message); } });
                playersEl.appendChild(row);
            });
            const feed = card.querySelector(".adminChatFeed");
            if (!chat.length) feed.innerHTML = '<div class="adminHint">No recent chat.</div>';
            chat.slice(-100).forEach(message => {
                const line = document.createElement("div");
                const isAdmin = Boolean(message.isAdmin) || String(message.name || "").toLowerCase() === "admin";
                line.className = `adminChatLine${isAdmin ? " adminChatAdmin" : ""}`;
                const name = document.createElement("strong");
                name.textContent = `${message.name || "Player"}:`;
                line.appendChild(name);
                if (isAdmin) {
                    const verify = document.createElement("span");
                    verify.className = "adminChatVerify";
                    verify.textContent = "✓";
                    verify.title = "Verified admin";
                    verify.setAttribute("aria-label", "Verified admin");
                    name.insertAdjacentElement("afterend", verify);
                }
                line.appendChild(document.createTextNode(` ${message.text || ""}`));
                feed.appendChild(line);
            });
            feed.scrollTop = feed.scrollHeight;
            const input = card.querySelector(".adminChatInput");
            const send = async () => { const text = input.value.trim(); if (!text) return; input.value = ""; try { await adminRequest("/admin/action", {method:"POST",body:JSON.stringify({action:"chat",serverId:server.id,text})}); await loadAdminServers(); } catch(e) { alert(e.message); } };
            card.querySelector(".adminChatSend").addEventListener("click", send); input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } });
            grid.appendChild(card);
        });
    } catch (error) { content.innerHTML = `<div class="adminEmpty">${esc(error.message)}</div>`; }
}

async function loadAdminDiscussions() {
    const content = document.getElementById("adminControlsContent"); if (!content) return; content.innerHTML = '<div class="adminEmpty">Loading discussions...</div>';
    try {
        const db = window.firebase.firestore(); const results = [];
        const currentEmail = String(firebaseUser()?.email || "").trim().toLowerCase();
        const channels = currentEmail === DEV_EMAIL.toLowerCase() ? ["chat", "bugs"] : ["chat"];
        for (const channel of channels) { const snap = await db.collection("discussions").doc(channel).collection("messages").orderBy("createdAt", "desc").limit(100).get(); snap.docs.forEach(doc => results.push({channel,ref:doc.ref,data:doc.data()||{}})); }
        results.sort((a,b) => (b.data.createdAt?.toDate?.()?.getTime?.() || 0) - (a.data.createdAt?.toDate?.()?.getTime?.() || 0));
        content.innerHTML = `<div class="adminOverview"><div class="adminStat"><span class="adminStatLabel">Messages Loaded</span><span class="adminStatValue">${results.length}</span></div><div class="adminStat"><span class="adminStatLabel">Chat</span><span class="adminStatValue green">${results.filter(r=>r.channel==='chat').length}</span></div><div class="adminStat" style="${channels.includes("bugs") ? "" : "display:none"}"><span class="adminStatLabel">Bug Reports</span><span class="adminStatValue">${results.filter(r=>r.channel==='bugs').length}</span></div></div><div class="adminSectionTitle"><div><h3>Community Discussions</h3><span>Review and remove messages</span></div><button class="adminRefresh" type="button">Refresh</button></div><div id="adminDiscussionList"></div>`;
        content.querySelector(".adminRefresh").addEventListener("click", loadAdminDiscussions);
        const list = content.querySelector("#adminDiscussionList");
        if (!results.length) { list.innerHTML = '<div class="adminEmpty">No discussion messages.</div>'; return; }
        results.forEach(item => { const card = document.createElement("article"); card.className = "adminDiscussionCard"; const date = item.data.createdAt?.toDate?.(); card.innerHTML = `<div class="adminDiscussionTop"><span class="adminDiscussionChannel">${esc(item.channel === "bugs" ? "Report Bugs" : "Universal Chat")}</span><span class="adminDiscussionUser">${esc(item.data.name || "Player")}</span><span class="adminDiscussionTime">${date ? esc(date.toLocaleString()) : ""}</span></div><div class="adminDiscussionText">${esc(item.data.text || "")}</div><button class="adminDeleteDiscussion" type="button">Delete Message</button>`; card.querySelector("button").addEventListener("click", async () => {
            if (!confirm("Delete this discussion message?")) return;
            try {
                const user = firebaseUser();
                const actorName = String(user?.displayName || user?.email || "Admin").trim().slice(0, 40);
                const actorRole = currentAdminRole === "developer" ? "developer" : currentAdminRole === "main" ? "main" : "admin";
                await item.ref.update({
                    deleted: true,
                    deletedByUid: user?.uid || "",
                    deletedByName: actorName,
                    deletedByRole: actorRole,
                    deletedAt: new Date()
                });
                await item.ref.delete();
                card.remove();
            } catch(e) { alert(e.message); }
        }); list.appendChild(card); });
    } catch(error) { content.innerHTML = `<div class="adminEmpty">${esc(error.message)}</div>`; }
}

async function loadAdminAnnouncements() {
    const content = document.getElementById("adminControlsContent"); if (!content) return;
    if (currentAdminRole !== "main" && currentAdminRole !== "developer") {
        content.innerHTML = '<div class="adminEmpty">Announcement access is not enabled for this account.</div>';
        return;
    }
    content.innerHTML = `
        <div class="adminSectionTitle"><div><h3>Website Announcements</h3><span>Publish a message that appears to website visitors</span></div></div>
        <div class="adminAnnouncementPanel">
            <label class="adminAnnouncementLabel" for="adminAnnouncementReason">Reason / title</label>
            <input id="adminAnnouncementReason" class="adminAnnouncementInput" maxlength="100" placeholder="Example: New update">
            <label class="adminAnnouncementLabel" for="adminAnnouncementMessage">Announcement message</label>
            <textarea id="adminAnnouncementMessage" class="adminAnnouncementMessage" maxlength="2000" placeholder="Write the announcement here..."></textarea>
            <div class="adminGridAction"><button id="adminPublishAnnouncement" class="adminRefresh" type="button">Publish Announcement</button><button id="adminClearAnnouncement" class="adminRefresh" type="button">Clear Announcement</button></div>
            <div id="adminAnnouncementStatus" class="adminAnnouncementStatus"></div>
        </div>`;
    const style = document.createElement("style");
    if (!document.getElementById("adminAnnouncementActionStyles")) {
        style.id = "adminAnnouncementActionStyles";
        style.textContent = ".adminGridAction{display:grid;grid-template-columns:1fr 1fr;gap:8px}.adminGridAction button{min-height:42px;background:#587640;color:#fff;border:1px solid #111;font-family:Arial,sans-serif;font-size:11px;cursor:pointer}.adminGridAction button:last-child{background:#633f3b}@media(max-width:520px){.adminGridAction{grid-template-columns:1fr}}";
        document.head.appendChild(style);
    }
    const db = window.firebase?.firestore?.();
    const status = content.querySelector("#adminAnnouncementStatus");
    const user = firebaseUser();
    const setStatus = (msg, error=false) => { status.textContent = msg; status.style.color = error ? "#e38a7b" : "#9fce72"; };
    const publish = async () => {
        const reason = content.querySelector("#adminAnnouncementReason").value.trim();
        const message = content.querySelector("#adminAnnouncementMessage").value.trim();
        if (!reason) return setStatus("Enter a reason/title first.", true);
        if (!message) return setStatus("Enter an announcement message first.", true);
        try {
            await db.collection("announcements").doc("active").set({active:true,reason,message,updatedAt:new Date(),updatedBy:user?.email||""});
            setStatus("Announcement published. Everyone will see it on their next website load.");
        } catch (error) { setStatus(error?.message || "Could not publish announcement.", true); }
    };
    const clear = async () => {
        if (!confirm("Clear the current website announcement?")) return;
        try {
            await db.collection("announcements").doc("active").set({active:false,updatedAt:new Date(),updatedBy:user?.email||""},{merge:true});
            setStatus("Announcement cleared.");
        } catch (error) { setStatus(error?.message || "Could not clear announcement.", true); }
    };
    content.querySelector("#adminPublishAnnouncement").addEventListener("click", publish);
    content.querySelector("#adminClearAnnouncement").addEventListener("click", clear);
}

async function openAdminControls() { if (!(await isAdminUser())) return alert("Admin access is no longer enabled for this account."); createModal(); const announcementTab = adminModal.querySelector('[data-tab="announcements"]'); if (announcementTab) announcementTab.style.display = currentAdminRole === "main" || currentAdminRole === "developer" ? "block" : "none"; adminModal.style.display = "flex"; await loadAdminServers(); clearInterval(adminPoll); adminPoll = setInterval(() => { if (adminModal?.style.display === "flex" && adminModal.querySelector(".adminControlsTab.active")?.dataset.tab === "servers") loadAdminServers(); }, 4000); }
function closeAdminControls() { if (adminModal) adminModal.style.display = "none"; clearInterval(adminPoll); adminPoll = null; }
function watch() { addStyles(); installButton(); const observer = new MutationObserver(installButton); observer.observe(document.body,{childList:true,subtree:true}); setInterval(installButton,1500); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",watch,{once:true}); else watch();


// Expose the existing admin window to Developer Controls without duplicating the UI.
window.WebMinecraftTAdminControls = { open: openAdminControls, close: closeAdminControls };
