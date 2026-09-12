const ADMIN_API = "https://webminecraft-server.onrender.com";
const DEV_EMAIL = "worthmarcus19@gmail.com";
const ADMIN_COLLECTION = "admins";
let adminModal = null;
let adminPoll = null;

function firebaseUser() { try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; } }
function isDeveloper() { return String(firebaseUser()?.email || "").toLowerCase() === DEV_EMAIL.toLowerCase(); }

async function isAdminUser() {
    const user = firebaseUser();
    if (!user) return false;
    if (isDeveloper()) return true;
    try {
        const uid = String(user.uid || "").trim();
        const firestore = window.firebase?.firestore?.();
        if (!uid || !firestore) return false;
        const doc = await firestore.collection(ADMIN_COLLECTION).doc(uid).get();
        return doc.exists && doc.data()?.enabled === true;
    } catch (error) {
        console.warn("Could not check admin access:", error);
        return false;
    }
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
    const style = document.createElement("style"); style.id = "adminControlsStyles";
    style.textContent = `#accountAdminControlsButton{background:linear-gradient(#5b7445,#466036)}#adminControlsModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);z-index:310;padding:18px;box-sizing:border-box;font-family:Arial,sans-serif}#adminControlsPanel{width:min(900px,97vw);height:min(760px,92vh);background:#1b1b1b;border:2px solid #111;color:#fff;display:flex;flex-direction:column}#adminControlsHeader{display:flex;align-items:center;padding:13px 15px;background:#303030;border-bottom:2px solid #111}.adminControlsTitle{font-family:MinecraftFont,monospace;font-size:20px}.adminControlsClose{margin-left:auto;background:#4c4c4c;color:#fff;border:2px solid #111;width:40px;height:36px;font-size:20px;cursor:pointer}#adminControlsTabs{display:grid;grid-template-columns:1fr 1fr;background:#242424;border-bottom:2px solid #111}.adminControlsTab{border:0;background:#333;color:#aaa;padding:12px;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer}.adminControlsTab.active{background:#5c7b43;color:#fff}#adminControlsContent{flex:1;min-height:0;overflow:auto;padding:12px}.adminServerCard,.adminDiscussionCard{background:#171717;border:1px solid #414141;padding:10px;margin-bottom:9px}.adminServerHead{display:flex;gap:8px;align-items:center}.adminServerName{font-weight:700;flex:1}.adminServerPlayers{display:flex;flex-direction:column;gap:5px;margin-top:8px}.adminPlayer{display:flex;align-items:center;gap:7px;background:#252525;padding:6px;font-size:11px}.adminPlayerName{flex:1}.adminKick,.adminDeleteDiscussion{background:#633f3b;color:#fff;border:1px solid #111;padding:4px 8px;font-size:9px;cursor:pointer}.adminChat{margin-top:8px;background:#111;border:1px solid #333;padding:7px}.adminChatFeed{max-height:120px;overflow:auto;font-size:10px;display:flex;flex-direction:column;gap:4px}.adminChatInputRow{display:flex;gap:5px;margin-top:6px}.adminChatInput{flex:1;min-width:0;background:#222;color:#fff;border:1px solid #555;padding:7px;font-size:10px}.adminChatSend{background:#526f3c;color:#fff;border:1px solid #111;padding:5px 8px}.adminDiscussionTop{display:flex;align-items:center;gap:8px;margin-bottom:8px}.adminDiscussionChannel{font-weight:700;color:#b8dc95}.adminDiscussionText{white-space:pre-wrap;word-break:break-word;font-size:11px;color:#eee;margin:5px 0}.adminEmpty{color:#888;padding:15px;text-align:center}@media(max-width:600px){#adminControlsPanel{height:95vh;width:99vw}.adminChatInputRow{flex-direction:column}}`;
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
    adminModal.innerHTML = `<div id="adminControlsPanel"><header id="adminControlsHeader"><span class="adminControlsTitle">Admin Controls</span><button class="adminControlsClose" type="button">×</button></header><div id="adminControlsTabs"><button class="adminControlsTab active" data-tab="servers" type="button">Live Multiplayer Servers</button><button class="adminControlsTab" data-tab="discussions" type="button">Discussions</button></div><div id="adminControlsContent"><div class="adminEmpty">Loading...</div></div></div>`;
    document.body.appendChild(adminModal);
    adminModal.querySelector(".adminControlsClose").addEventListener("click", closeAdminControls);
    adminModal.addEventListener("click", e => { if (e.target === adminModal) closeAdminControls(); });
    adminModal.querySelectorAll(".adminControlsTab").forEach(tab => tab.addEventListener("click", () => { adminModal.querySelectorAll(".adminControlsTab").forEach(t => t.classList.toggle("active", t === tab)); if (tab.dataset.tab === "servers") loadAdminServers(); else loadAdminDiscussions(); }));
}

async function loadAdminServers() {
    const content = document.getElementById("adminControlsContent"); if (!content) return;
    try {
        const data = await adminRequest("/admin/servers"); const servers = data.servers || [];
        if (!servers.length) { content.innerHTML = '<div class="adminEmpty">No active multiplayer servers.</div>'; return; }
        content.innerHTML = "";
        servers.forEach(server => {
            const card = document.createElement("section"); card.className = "adminServerCard";
            card.innerHTML = `<div class="adminServerHead"><strong class="adminServerName">${esc(server.name || server.id)}</strong><span>${server.players?.length || 0} player${server.players?.length === 1 ? "" : "s"}</span></div><div class="adminServerPlayers"></div><div class="adminChat"><div class="adminChatFeed"></div><div class="adminChatInputRow"><input class="adminChatInput" maxlength="120" placeholder="Talk in this server..."><button class="adminChatSend" type="button">Send</button></div></div>`;
            const players = card.querySelector(".adminServerPlayers"); if (!(server.players || []).length) players.innerHTML = '<div class="adminEmpty">No players.</div>';
            (server.players || []).forEach(player => { const row = document.createElement("div"); row.className = "adminPlayer"; row.innerHTML = `<span class="adminPlayerName">${esc(player.name)}</span><button class="adminKick" type="button">Kick</button>`; row.querySelector("button").addEventListener("click", async () => { if (!confirm(`Kick ${player.name} from this server?`)) return; try { await adminRequest("/admin/action", {method:"POST",body:JSON.stringify({action:"kick",serverId:server.id,playerId:player.id})}); await loadAdminServers(); } catch(e) { alert(e.message); } }); players.appendChild(row); });
            const feed = card.querySelector(".adminChatFeed"); (server.chat || []).slice(-100).forEach(message => { const line = document.createElement("div"); line.innerHTML = `<strong>${esc(message.name || "Player")}:</strong> ${esc(message.text || "")}`; feed.appendChild(line); });
            const input = card.querySelector(".adminChatInput"); const send = async () => { const text = input.value.trim(); if (!text) return; input.value = ""; try { await adminRequest("/admin/action", {method:"POST",body:JSON.stringify({action:"chat",serverId:server.id,text})}); await loadAdminServers(); } catch(e) { alert(e.message); } }; card.querySelector(".adminChatSend").addEventListener("click", send); input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } }); content.appendChild(card);
        });
    } catch (error) { content.innerHTML = `<div class="adminEmpty">${esc(error.message)}</div>`; }
}

async function loadAdminDiscussions() {
    const content = document.getElementById("adminControlsContent"); if (!content) return; content.innerHTML = '<div class="adminEmpty">Loading discussions...</div>';
    try {
        const db = window.firebase.firestore(); const results = [];
        for (const channel of ["chat", "bugs"]) { const snap = await db.collection("discussions").doc(channel).collection("messages").orderBy("createdAt", "desc").limit(100).get(); snap.docs.forEach(doc => results.push({channel,ref:doc.ref,data:doc.data()||{}})); }
        results.sort((a,b) => (b.data.createdAt?.toDate?.()?.getTime?.() || 0) - (a.data.createdAt?.toDate?.()?.getTime?.() || 0));
        if (!results.length) { content.innerHTML = '<div class="adminEmpty">No discussion messages.</div>'; return; }
        content.innerHTML = "";
        results.forEach(item => { const card = document.createElement("article"); card.className = "adminDiscussionCard"; card.innerHTML = `<div class="adminDiscussionTop"><strong class="adminDiscussionChannel">${esc(item.channel === "bugs" ? "Report Bugs" : "Universal Chat")}</strong><span>${esc(item.data.name || "Player")}</span><button class="adminDeleteDiscussion" type="button">Delete</button></div><div class="adminDiscussionText">${esc(item.data.text || "")}</div>`; card.querySelector("button").addEventListener("click", async () => { if (!confirm("Delete this discussion message?")) return; try { await item.ref.delete(); card.remove(); } catch(e) { alert(e.message); } }); content.appendChild(card); });
    } catch(error) { content.innerHTML = `<div class="adminEmpty">${esc(error.message)}</div>`; }
}

async function openAdminControls() { if (!(await isAdminUser())) return alert("Admin access is no longer enabled for this account."); createModal(); adminModal.style.display = "flex"; await loadAdminServers(); clearInterval(adminPoll); adminPoll = setInterval(() => { if (adminModal?.style.display === "flex" && adminModal.querySelector(".adminControlsTab.active")?.dataset.tab === "servers") loadAdminServers(); }, 4000); }
function closeAdminControls() { if (adminModal) adminModal.style.display = "none"; clearInterval(adminPoll); adminPoll = null; }
function watch() { addStyles(); installButton(); const observer = new MutationObserver(installButton); observer.observe(document.body,{childList:true,subtree:true}); setInterval(installButton,1500); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",watch,{once:true}); else watch();
