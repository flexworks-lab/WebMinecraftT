const DEV_EMAIL = "worthmarcus19@gmail.com";
const SERVER_API = "https://webminecraft-server.onrender.com";

let installed = false;
let pollTimer = null;
let selectedServerId = "";
const selectedWarningPlayers = new Map();

const RANDOM_SERVER_REMINDERS = [
    "Please behave appropriately and follow the server rules.",
    "Please keep the chat respectful.",
    "Remember to treat other players fairly.",
    "Please do not spam the chat.",
    "Keep the server fun and friendly for everyone.",
    "Please avoid inappropriate language.",
    "Please respect the other players in this server.",
    "Remember that everyone is here to have fun.",
    "Please follow the server rules.",
    "Keep the chat appropriate for everyone.",
    "Please do not harass or bother other players.",
    "Be respectful when talking to other players.",
    "Please avoid unnecessary spam or repeated messages.",
    "Let's keep the server friendly and fun.",
    "Please play fairly and respect the rules.",
    "Remember to be a good sport.",
    "Please keep things appropriate in the server.",
    "Respect other players and their builds.",
    "Please do not intentionally disrupt other players.",
    "Keep conversations friendly and appropriate.",
    "Please give other players room to enjoy the game.",
    "Remember to follow the rules while playing.",
    "Please keep disagreements respectful.",
    "Help keep this server a welcoming place.",
    "Please do not use the chat to annoy other players.",
    "Have fun, but remember to follow the server rules.",
    "Please be considerate of everyone in the server.",
    "Keep the server peaceful and enjoyable for everyone.",
    "Please use appropriate language in chat.",
    "Remember: respect other players and have fun."
];

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
#devServerSection{display:block}.devServerList{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto}.devServerCard{background:#171717;border:1px solid #414141;padding:10px}.devServerHead{display:flex;align-items:center;gap:8px}.devServerName{font-weight:700;font-size:13px;flex:1}.devServerCount{font-size:10px;color:#9fce72}.devServerPlayers{display:flex;flex-direction:column;gap:5px;margin:8px 0}.devPlayer{display:flex;align-items:center;gap:7px;background:#252525;border:1px solid #444;padding:6px 7px;font-size:10px}.devPlayerName{display:flex;align-items:center;gap:6px;flex:1;min-width:0}.devPlayerSelect{width:14px;height:14px;margin:0;accent-color:#9fce72}.devKick,.devWarnOne{border:1px solid #111;background:#633f3b;color:#fff;padding:3px 6px;cursor:pointer;font-size:9px}.devWarnOne{background:#735d34}.devPlayerTools{display:flex;gap:5px;flex-wrap:wrap}.devWarningActions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.devSelectAll{background:#3d4f31!important}.devClearSelection{background:#3d3d3d!important}.devServerActions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.devServerChat{margin-top:9px;background:#111;border:1px solid #333;padding:8px}.devServerChatFeed{height:130px;overflow:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:7px}.devServerChatLine{font-size:10px;line-height:1.35;color:#eee}.devServerChatLine strong{color:#b8dc95}.devServerChatInputRow{display:flex;gap:6px}.devServerChatInput{min-width:0;flex:1;background:#222;border:1px solid #555;color:#fff;padding:7px;font-size:11px}.devServerChatSend{min-width:65px}.devRandomReminder{width:100%;margin-bottom:6px}.devServerEmpty{color:#888;font-size:11px;padding:8px;background:#171717;border:1px solid #333}@media(max-width:650px){.devServerActions,.devWarningActions{grid-template-columns:1fr}.devServerChatInputRow{flex-direction:column}}
`;
    document.head.appendChild(style);
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
        <p class="devHint">See every active server, watch its chat, warn players, kick players, shut down a server, delete a server, or send a developer message from the home screen.</p>
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

function updateChatFeeds(servers) {
    for (const server of servers) {
        const card = document.querySelector(`.devServerCard[data-server-id="${CSS.escape(String(server.id))}"]`);
        if (!card) continue;
        const feed = card.querySelector(".devServerChatFeed");
        if (!feed) continue;
        const chat = server.chat || [];
        const oldKey = feed.dataset.chatKey || "";
        const newKey = chat.map(message => `${message.time || ""}|${message.name || ""}|${message.text || ""}`).join("\n");
        if (oldKey === newKey) continue;
        feed.dataset.chatKey = newKey;
        feed.replaceChildren();
        if (!chat.length) {
            feed.innerHTML = '<div class="devHint">No chat yet.</div>';
        } else {
            chat.slice(-100).forEach(message => {
                const line = document.createElement("div");
                line.className = "devServerChatLine";
                const time = message.time ? new Date(message.time).toLocaleTimeString() : "";
                line.innerHTML = `<strong>${escapeHtml(message.name || "Player")}:</strong> ${escapeHtml(message.text || "")} <span style="color:#666">${escapeHtml(time)}</span>`;
                feed.appendChild(line);
            });
            feed.scrollTop = feed.scrollHeight;
        }
    }
}

async function refreshServers() {
    if (!isDev()) return;
    const list = document.getElementById("devServerList");
    if (!list) return;
    try {
        const data = await adminRequest("/admin/servers");
        const servers = data.servers || [];
        if (isServerChatInputActive()) {
            updateChatFeeds(servers);
            return;
        }
        renderServers(servers);
    } catch (error) {
        if (!isServerChatInputActive()) list.innerHTML = `<div class="devServerEmpty">${escapeHtml(error.message)}</div>`;
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
        card.dataset.serverId = String(server.id);
        const players = server.players || [];
        const chat = server.chat || [];
        card.innerHTML = `
            <div class="devServerHead"><span class="devServerName">${escapeHtml(server.name || server.id)}</span><span class="devServerCount">${players.length} player${players.length === 1 ? "" : "s"}</span></div>
            <div class="devServerPlayers"></div>
            <div class="devServerActions"><button class="devButton danger devShutdown" type="button">Shut Down</button><button class="devButton danger devDelete" type="button">Delete Server</button></div>
            <div class="devServerChat"><button class="devButton devRandomReminder" type="button">Random Server Reminder</button><div class="devServerChatFeed"></div><div class="devServerChatInputRow"><input class="devServerChatInput" maxlength="120" placeholder="Talk in this server..." autocomplete="off" /><button class="devButton devServerChatSend" type="button">Send</button></div></div>`;
        const playersEl = card.querySelector(".devServerPlayers");
        if (!players.length) playersEl.innerHTML = '<span class="devHint">No players.</span>';
        else {
            players.forEach(player => {
                const row = document.createElement("div");
                row.className = "devPlayer";
                row.innerHTML = `<label class="devPlayerName"><input class="devPlayerSelect" type="checkbox"><span>${escapeHtml(player.name)}</span></label><div class="devPlayerTools"><button class="devWarnOne" type="button">Warn</button><button class="devKick" type="button">Kick</button></div>`;
                const checkbox = row.querySelector(".devPlayerSelect");
                checkbox.checked = selectedWarningPlayers.get(server.id)?.has(String(player.id)) || false;
                checkbox.addEventListener("change", () => setPlayerSelection(server.id, player.id, checkbox.checked));
                row.querySelector(".devWarnOne").addEventListener("click", () => warnPlayers(server.id, [player.id]));
                row.querySelector(".devKick").addEventListener("click", () => kickPlayer(server.id, player.id, player.name));
                playersEl.appendChild(row);
            });
            const warningActions = document.createElement("div");
            warningActions.className = "devWarningActions";
            warningActions.innerHTML = `<button class="devButton devSelectAll" type="button">Select All</button><button class="devButton devClearSelection" type="button">Clear Selection</button><button class="devButton danger devWarnSelected" type="button">Warn Selected</button>`;
            const buttons = warningActions.querySelectorAll("button");
            buttons[0].addEventListener("click", () => selectAllPlayers(server));
            buttons[1].addEventListener("click", () => clearSelectedPlayers(server.id));
            buttons[2].addEventListener("click", () => {
                const selected = [...(selectedWarningPlayers.get(server.id) || [])];
                warnPlayers(server.id, selected);
            });
            playersEl.appendChild(warningActions);
        }
        const feed = card.querySelector(".devServerChatFeed");
        const chatKey = chat.map(message => `${message.time || ""}|${message.name || ""}|${message.text || ""}`).join("\n");
        feed.dataset.chatKey = chatKey;
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
        card.querySelector(".devRandomReminder").addEventListener("click", () => sendRandomReminder(server.id));
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

function setPlayerSelection(serverId, playerId, selected) {
    const id = String(serverId);
    const player = String(playerId);
    let set = selectedWarningPlayers.get(id);
    if (!set) {
        set = new Set();
        selectedWarningPlayers.set(id, set);
    }
    if (selected) set.add(player);
    else set.delete(player);
    if (!set.size) selectedWarningPlayers.delete(id);
}

function selectAllPlayers(server) {
    const set = new Set((server.players || []).map(player => String(player.id)));
    if (set.size) selectedWarningPlayers.set(String(server.id), set);
    refreshServers();
}

function clearSelectedPlayers(serverId) {
    selectedWarningPlayers.delete(String(serverId));
    refreshServers();
}

async function runAction(body) {
    const data = await adminRequest("/admin/action", { method: "POST", body: JSON.stringify(body) });
    const status = document.getElementById("devControlsStatus");
    if (status) { status.textContent = data.message || "Done."; status.style.color = "#9fce72"; }
    await refreshServers();
}

async function kickPlayer(serverId, playerId, name) {
    if (!confirm(`Kick ${name} from this server?`)) return;
    try { await runAction({ action: "kick", serverId, playerId }); } catch (error) { alert(error.message); }
}

async function warnPlayers(serverId, playerIds) {
    const ids = [...new Set((playerIds || []).map(id => String(id)).filter(Boolean))];
    if (!ids.length) {
        alert("Select at least one player to warn.");
        return;
    }
    const message = "Please behave appropriately and follow the server rules.";
    if (!confirm(`Send a warning to ${ids.length} selected player${ids.length === 1 ? "" : "s"}?\n\n“${message}”`)) return;
    try {
        await runAction({ action: "warn", serverId, playerIds: ids, text: message });
        selectedWarningPlayers.delete(String(serverId));
    } catch (error) { alert(error.message); }
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

async function sendRandomReminder(serverId) {
    const text = RANDOM_SERVER_REMINDERS[Math.floor(Math.random() * RANDOM_SERVER_REMINDERS.length)];
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
