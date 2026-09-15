const DEV_EMAIL = "worthmarcus19@gmail.com";
const SERVER_API = "https://webminecraft-server.onrender.com";

let installed = false;
let pollTimer = null;
let selectedServerId = "";
const selectedWarningPlayers = new Map();
const serverChatDrafts = new Map();

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
#devServerSection{display:block}.devServerList{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto}.devServerCard{background:#171717;border:1px solid #414141;padding:10px}.devServerHead{display:flex;align-items:center;gap:8px}.devServerName{font-weight:700;font-size:13px;flex:1}.devServerCount{font-size:10px;color:#9fce72}.devServerPlayers{display:flex;flex-direction:column;gap:5px;margin:8px 0}.devPlayer{display:flex;align-items:center;gap:7px;background:#252525;border:1px solid #444;padding:6px 7px;font-size:10px}.devPlayerName{display:flex;align-items:center;gap:6px;flex:1;min-width:0}.devPlayerSelect{width:14px;height:14px;margin:0;accent-color:#9fce72}.devKick,.devWarnOne{border:1px solid #111;background:#633f3b;color:#fff;padding:3px 6px;cursor:pointer;font-size:9px}.devWarnOne{background:#735d34}.devPlayerTools{display:flex;gap:5px;flex-wrap:wrap}.devWarningActions{margin-top:7px}.devServerActions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.devServerChat{margin-top:9px;background:#111;border:1px solid #333;padding:8px}.devServerChatFeed{height:130px;overflow:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:7px}.devServerChatLine{font-size:10px;line-height:1.35;color:#eee}.devServerChatSend{min-width:65px}.devRandomReminder{width:100%;margin-bottom:6px}.devServerEmpty{color:#888;font-size:11px;padding:8px;background:#171717;border:1px solid #333}@media(max-width:650px){.devServerActions{grid-template-columns:1fr}.devServerChatInputRow{flex-direction:column}}
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

function getChatInputServerId(input) {
    const card = input?.closest?.(".devServerCard");
    return card?.dataset?.serverId ? String(card.dataset.serverId) : "";
}

function rememberChatDraft(input) {
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("devServerChatInput")) return;
    const serverId = getChatInputServerId(input);
    if (serverId) serverChatDrafts.set(serverId, input.value);
}

function rememberVisibleChatDrafts() {
    document.querySelectorAll(".devServerChatInput").forEach(input => {
        const serverId = getChatInputServerId(input);
        if (!serverId) return;
        if (document.activeElement === input || input.value !== "") serverChatDrafts.set(serverId, input.value);
    });
}

function restoreChatDraft(input) {
    if (!(input instanceof HTMLInputElement)) return;
    const serverId = getChatInputServerId(input);
    if (!serverId || !serverChatDrafts.has(serverId)) return;
    const draft = serverChatDrafts.get(serverId) ?? "";
    if (input.value === draft) return;
    const wasFocused = document.activeElement === input;
    input.value = draft;
    if (wasFocused) {
        try { input.setSelectionRange(draft.length, draft.length); } catch {}
    }
}

function clearChatDraft(input) {
    if (!(input instanceof HTMLInputElement)) return;
    const serverId = getChatInputServerId(input);
    if (serverId) serverChatDrafts.delete(serverId);
}

function captureRemovedChatInputs(records) {
    for (const record of records) {
        for (const removed of record.removedNodes) {
            if (!(removed instanceof Element)) continue;
            const inputs = [];
            if (removed.matches?.(".devServerChatInput")) inputs.push(removed);
            inputs.push(...(removed.querySelectorAll?.(".devServerChatInput") || []));
            inputs.forEach(rememberChatDraft);
        }
    }
}

function restoreAllChatDrafts() {
    document.querySelectorAll(".devServerChatInput").forEach(restoreChatDraft);
}

function isServerChatInputActive() {
    const active = document.activeElement;
    return active instanceof HTMLInputElement && active.classList.contains("devServerChatInput");
}

function hasChatDraft() {
    rememberVisibleChatDrafts();
    for (const value of serverChatDrafts.values()) {
        if (value) return true;
    }
    return false;
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

function updateExistingServerCards(servers) {
    const list = document.getElementById("devServerList");
    if (!list) return false;
    const existingCards = [...list.querySelectorAll(".devServerCard[data-server-id]")];
    const existingIds = new Set(existingCards.map(card => String(card.dataset.serverId)));
    const serverIds = new Set(servers.map(server => String(server.id)));
    if (!existingCards.length || existingCards.length !== servers.length || [...existingIds].some(id => !serverIds.has(id))) return false;

    for (const server of servers) {
        const card = list.querySelector(`.devServerCard[data-server-id="${CSS.escape(String(server.id))}"]`);
        if (!card) return false;
        const count = card.querySelector(".devServerCount");
        if (count) {
            const length = (server.players || []).length;
            count.textContent = `${length} player${length === 1 ? "" : "s"}`;
        }
        updateChatFeeds([server]);
    }
    return true;
}

async function refreshServers() {
    if (!isDev()) return;
    const list = document.getElementById("devServerList");
    if (!list) return;
    rememberVisibleChatDrafts();
    try {
        const data = await adminRequest("/admin/servers");
        const servers = data.servers || [];
        // When the same server cards already exist, update them in place. This
        // means polling never destroys/recreates the input the developer is typing into.
        if (updateExistingServerCards(servers)) {
            restoreAllChatDrafts();
            return;
        }
        // Do not rebuild the list while a draft exists. A manual refresh can
        // be performed after sending/clearing the draft.
        if (isServerChatInputActive() || hasChatDraft()) {
            updateChatFeeds(servers);
            restoreAllChatDrafts();
            return;
        }
        renderServers(servers);
        restoreAllChatDrafts();
    } catch (error) {
        if (!isServerChatInputActive() && !hasChatDraft()) list.innerHTML = `<div class="devServerEmpty">${escapeHtml(error.message)}</div>`;
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
                checkbox.checked = selectedWarningPlayers.get(String(server.id))?.has(String(player.id)) || false;
                checkbox.addEventListener("change", () => setPlayerSelection(server.id, player.id, checkbox.checked));
                row.querySelector(".devWarnOne").addEventListener("click", () => warnPlayers(server.id, [player.id]));
                row.querySelector(".devKick").addEventListener("click", () => kickPlayer(server.id, player.id, player.name));
                playersEl.appendChild(row);
            });
            const warningActions = document.createElement("div");
            warningActions.className = "devWarningActions";
            warningActions.innerHTML = `<button class="devButton danger devWarnSelected" type="button">Warn Selected</button>`;
            warningActions.querySelector(".devWarnSelected").addEventListener("click", () => {
                const selected = [...(selectedWarningPlayers.get(String(server.id)) || [])];
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
        input.addEventListener("input", () => rememberChatDraft(input));
        const send = async () => {
            const text = input.value.trim();
            if (!text) return;
            clearChatDraft(input);
            input.value = "";
            await sendServerChat(server.id, text);
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
    restoreAllChatDrafts();
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