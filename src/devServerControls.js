const DEV_EMAIL = "worthmarcus19@gmail.com";
const SERVER_API = "https://webminecraft-server.onrender.com";

let installed = false;
let pollTimer = null;
let selectedServerId = "";

function isDev() {
    return String(window.firebase?.auth?.()?.currentUser?.email || "").toLowerCase() === DEV_EMAIL.toLowerCase();
}

async function getToken() {
    const user = window.firebase?.auth?.()?.currentUser;
    if (!user) return "";
    try { return await user.getIdToken(); } catch { return ""; }
}

async function adminRequest(path, options = {}) {
    const token = await getToken();
    if (!token) throw new Error("Developer login is required.");
    const response = await fetch(`${SERVER_API}${path}`, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Server request failed.");
    return data;
}

function addServerStyles() {
    if (document.getElementById("devServerControlsStyles")) return;
    const style = document.createElement("style");
    style.id = "devServerControlsStyles";
    style.textContent = `
#devServerSection{display:block}.devServerList{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto}.devServerCard{background:#171717;border:1px solid #414141;padding:10px}.devServerHead{display:flex;align-items:center;gap:8px}.devServerName{font-weight:700;font-size:13px;flex:1}.devServerCount{font-size:10px;color:#9fce72}.devServerPlayers{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}.devPlayer{display:inline-flex;align-items:center;gap:5px;background:#252525;border:1px solid #444;padding:5px 7px;font-size:10px}.devKick{border:1px solid #111;background:#633f3b;color:#fff;padding:3px 6px;cursor:pointer;font-size:9px}.devServerActions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.devServerChat{margin-top:9px;background:#111;border:1px solid #333;padding:8px}.devServerChatFeed{height:130px;overflow:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:7px}.devServerChatLine{font-size:10px;line-height:1.35;color:#eee}.devServerChatLine strong{color:#b8dc95}.devServerChatInputRow{display:flex;gap:6px}.devServerChatInput{min-width:0;flex:1;background:#222;border:1px solid #555;color:#fff;padding:7px;font-size:11px}.devServerChatSend{min-width:65px}.devServerEmpty{color:#888;font-size:11px;padding:8px;background:#171717;border:1px solid #333}@media(max-width:650px){.devServerActions{grid-template-columns:1fr}.devServerChatInputRow{flex-direction:column}}
`;
    document.head.appendChild(style);
}

function getSection() {
    return document.getElementById("devServerSection");
}

function install() {
    if (installed || !isDev()) return;
    const body = document.getElementById("devControlsBody");
    if (!body) return;
    addServerStyles();
    const section = document.createElement("section");
    section.className = "devSection";
    section.id = "devServerSection";
    section.innerHTML = `
        <h3>Live Multiplayer Servers</h3>
        <p class="devHint">See every active server, watch its chat, kick players, shut down a server, delete a server, or send a developer message from the home screen.</p>
        <div class="devGrid"><button id="devServerRefresh" class="devButton" type="button">Refresh Servers</button><button id="devServerCloseAll" class="devButton danger" type="button">Shut Down All</button></div>
        <div id="devServerList" class="devServerList"><div class="devServerEmpty">Loading servers...</div></div>`;
    body.insertBefore(section, body.firstElementChild);
    installed = true;
    section.querySelector("#devServerRefresh").addEventListener("click", refreshServers);
    section.querySelector("#devServerCloseAll").addEventListener("click", shutdownAll);
    refreshServers();
}

function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function isServerChatInputActive() {
    const active = document.activeElement;
    return active instanceof HTMLInputElement && active.classList.contains("devServerChatInput");
}

async function refreshServers() {
    if (!isDev()) return;
    // Never rebuild the server cards while the developer is typing.
    // Rebuilding replaces the input element and used to erase the text mid-message.
    if (isServerChatInputActive()) return;
    const list = document.getElementById("devServerList");
    if (!list) return;
    try {
        const data = await adminRequest("/admin/servers");
        // The input may have received focus while the request was in progress.
        if (isServerChatInputActive()) return;
        renderServers(data.servers || []);
    } catch (error) {
        list.innerHTML = `<div class="devServerEmpty">${escapeHtml(error.message)}</div>`;
    }
}

function renderServers(servers) {
    const list = document.getElementById("devServerList");
    if (!list) return;
    if (!servers.length) {
        list.innerHTML = '<div class="devServerEmpty">No active servers. Empty servers close automatically.</div>';
        return;
    }
    if (!selectedServerId || !servers.some(server => server.id === selectedServerId)) selectedServerId = servers[0].id;
    list.innerHTML = "";
    for (const server of servers) {
        const card = document.createElement("div");
        card.className = "devServerCard";
        const players = server.players || [];
        const chat = server.chat || [];
        card.innerHTML = `
            <div class="devServerHead"><span class="devServerName">${escapeHtml(server.name || server.id)}</span><span class="devServerCount">${players.length} player${players.length === 1 ? "" : "s"}</span></div>
            <div class="devServerPlayers"></div>
            <div class="devServerActions"><button class="devButton danger devShutdown" type="button">Shut Down</button><button class="devButton danger devDelete" type="button">Delete Server</button></div>
            <div class="devServerChat"><div class="devServerChatFeed"></div><div class="devServerChatInputRow"><input class="devServerChatInput" maxlength="120" placeholder="Talk in this server..." autocomplete="off" /><button class="devButton devServerChatSend" type="button">Send</button></div></div>`;
        const playersEl = card.querySelector(".devServerPlayers");
        if (!players.length) playersEl.innerHTML = '<span class="devHint">No players.</span>';
        else players.forEach(player => {
            const row = document.createElement("span");
            row.className = "devPlayer";
            row.innerHTML = `<span>${escapeHtml(player.name)}</span><button class="devKick" type="button">Kick</button>`;
            row.querySelector(".devKick").addEventListener("click", () => kickPlayer(server.id, player.id, player.name));
            playersEl.appendChild(row);
        });
        const feed = card.querySelector(".devServerChatFeed");
        if (!chat.length) feed.innerHTML = '<div class="devHint">No chat yet.</div>';
        else chat.slice(-100).forEach(message => {
            const line = document.createElement("div");
            line.className = "devServerChatLine";
            const time = message.time ? new Date(message.time).toLocaleTimeString() : "";
            line.innerHTML = `<strong>${escapeHtml(message.name || "Player")}:</strong> ${escapeHtml(message.text || "")} <span style="color:#666">${escapeHtml(time)}</span>`;
            feed.appendChild(line);
        });
        feed.scrollTop = feed.scrollHeight;
        card.querySelector(".devShutdown").addEventListener("click", () => shutdownServer(server.id, server.name));
        card.querySelector(".devDelete").addEventListener("click", () => deleteServer(server.id, server.name));
        const input = card.querySelector(".devServerChatInput");
        const send = () => {
            const text = input.value.trim();
            if (!text) return;
            input.value = "";
            sendServerChat(server.id, text);
        };
        card.querySelector(".devServerChatSend").addEventListener("click", send);
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                send();
            }
        });
        list.appendChild(card);
    }
}

async function runAction(body) {
    const data = await adminRequest("/admin/action", { method: "POST", body: JSON.stringify(body) });
    const status = document.getElementById("devControlsStatus");
    if (status) { status.textContent = data.message || "Done."; status.style.color = "#9fce72"; }
    // Do not refresh immediately if the chat input is focused. This prevents the
    // newly rendered input from stealing focus while the developer is typing.
    if (!isServerChatInputActive()) await refreshServers();
}

async function kickPlayer(serverId, playerId, name) {
    if (!confirm(`Kick ${name} from this server?`)) return;
    try { await runAction({ action: "kick", serverId, playerId }); } catch (error) { alert(error.message); }
}

async function shutdownServer(serverId, name) {
    if (!confirm(`Shut down ${name}? Everyone in it will be disconnected.`)) return;
    try { await runAction({ action: "shutdown", serverId }); } catch (error) { alert(error.message); }
}

async function deleteServer(serverId, name) {
    if (!confirm(`Delete ${name}? This will disconnect everyone and remove the server immediately.`)) return;
    try { await runAction({ action: "delete", serverId }); } catch (error) { alert(error.message); }
}

async function shutdownAll() {
    try {
        const data = await adminRequest("/admin/servers");
        const servers = data.servers || [];
        if (!servers.length) return;
        if (!confirm(`Shut down all ${servers.length} active servers?`)) return;
        for (const server of servers) await runAction({ action: "shutdown", serverId: server.id });
    } catch (error) { alert(error.message); }
}

async function sendServerChat(serverId, text) {
    try { await runAction({ action: "chat", serverId, text }); } catch (error) { alert(error.message); }
}

function watch() {
    if (!isDev()) return;
    install();
    if (!pollTimer) pollTimer = setInterval(() => { if (document.getElementById("devServerSection")?.offsetParent !== null) refreshServers(); }, 2000);
}

const observer = new MutationObserver(() => watch());
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { observer.observe(document.body, { childList: true, subtree: true }); watch(); }, { once: true });
else { observer.observe(document.body, { childList: true, subtree: true }); watch(); }
