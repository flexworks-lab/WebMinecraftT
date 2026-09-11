const SERVER_HEALTH_URL = "https://webminecraft-server.onrender.com/health";
const SERVER_LIST_URL = "https://webminecraft-server.onrender.com/servers";
const POLL_MS = 4000;

let countEl = null;
let panel = null;
let listEl = null;
let timer = null;
let open = false;
let localPlayerName = localStorage.getItem("webminecraft-player-name") || "Player";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isMainMenuVisible() {
    const menu = document.getElementById("mainMenu");
    return Boolean(menu && getComputedStyle(menu).display !== "none");
}

function ensureUi() {
    if (countEl) return;
    const style = document.createElement("style");
    style.id = "globalPlayerListStyles";
    style.textContent = `
#globalPlayerCount{position:fixed;left:auto;right:28px;bottom:28px;z-index:96;display:none;width:142px;min-height:48px;padding:7px 13px;text-align:center;background:linear-gradient(180deg,#3b3b3b,#292929);border:2px solid #111;border-top-color:#8c8c8c;border-left-color:#8c8c8c;color:#fff;font-family:"MinecraftFont",monospace;cursor:pointer;text-shadow:2px 2px 0 #111;box-shadow:4px 4px 0 rgba(0,0,0,.5),inset 1px 1px 0 rgba(255,255,255,.09)}
#globalPlayerCount:hover{filter:brightness(1.12);transform:translateY(-1px)}
#globalPlayerCount:active{transform:translateY(1px);filter:brightness(.95)}
#globalPlayerCount strong{font-size:16px;line-height:1}
#globalPlayerCount span{display:block;margin-top:5px;color:#b7b7b7;font:10px Arial,sans-serif}
#globalPlayerPanel{position:fixed;left:auto;right:28px;bottom:88px;z-index:97;width:min(390px,calc(100vw - 56px));max-height:min(520px,calc(100vh - 116px));display:none;overflow:hidden;background:#202020;color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.55);font-family:Arial,sans-serif}
#globalPlayerHeader{padding:14px 16px;background:#2b2b2b;border-bottom:2px solid #111;display:flex;align-items:center;justify-content:space-between;gap:10px}
#globalPlayerTitle{font:17px "MinecraftFont",monospace;text-shadow:2px 2px 0 #000}
#globalPlayerTotal{color:#9fce72;font-size:11px}
#globalPlayerList{overflow:auto;padding:10px;max-height:430px}
.globalServerGroup{margin:0 0 10px;padding:9px;background:#292929;border:1px solid #4b4b4b}
.globalServerName{font-family:"MinecraftFont",monospace;font-size:12px;color:#ddd;text-shadow:1px 1px 0 #000;margin-bottom:7px}
.globalServerMeta{font-size:10px;color:#888;margin-bottom:7px}
.globalPlayerRow{display:flex;align-items:center;gap:9px;padding:8px 9px;margin:4px 0;background:#343434;border:1px solid #555;font-size:12px}
.globalPlayerDot{width:8px;height:8px;flex:0 0 8px;background:#83b95f;box-shadow:0 0 4px rgba(131,185,95,.5)}
.globalPlayerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.globalPlayerMe{color:#9fce72}
.globalPlayerEmpty{padding:14px;color:#999;text-align:center;font-size:11px;line-height:1.45}
@media(max-width:600px){#globalPlayerCount{right:12px;bottom:40px;width:170px}#globalPlayerPanel{right:12px;bottom:102px;width:calc(100vw - 24px)}}
`;
    document.head.appendChild(style);

    countEl = document.createElement("button");
    countEl.type = "button";
    countEl.id = "globalPlayerCount";
    countEl.innerHTML = `<strong>0 Players</strong><span>View players online</span>`;
    document.body.appendChild(countEl);

    panel = document.createElement("div");
    panel.id = "globalPlayerPanel";
    panel.innerHTML = `<div id="globalPlayerHeader"><div id="globalPlayerTitle">Players Online</div><div id="globalPlayerTotal">0 online</div></div><div id="globalPlayerList"><div class="globalPlayerEmpty">No players are online.</div></div>`;
    document.body.appendChild(panel);
    listEl = panel.querySelector("#globalPlayerList");

    countEl.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        open = !open;
        panel.style.display = open ? "block" : "none";
    });

    document.addEventListener("click", event => {
        if (!open || event.target === countEl || panel.contains(event.target)) return;
        open = false;
        panel.style.display = "none";
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && open) {
            open = false;
            panel.style.display = "none";
        }
    });

    // Leaving a multiplayer world through the game's Return to Main Menu
    // button must close the page's WebSocket so the server immediately
    // removes this player from its online count.
    document.addEventListener("click", event => {
        const target = event.target instanceof Element ? event.target.closest("button") : null;
        if (!target || !window.__webminecraftMultiplayerActive) return;
        const label = String(target.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        if (!label.includes("main menu") || !label.includes("return")) return;
        window.setTimeout(() => {
            if (window.__webminecraftMultiplayerActive) window.location.reload();
        }, 0);
    }, true);
}

function renderPlayers(data) {
    ensureUi();
    const total = Number(data?.totalPlayers) || 0;
    countEl.querySelector("strong").textContent = `${total} ${total === 1 ? "Player" : "Players"}`;
    countEl.querySelector("span").textContent = "View players online";
    panel.querySelector("#globalPlayerTotal").textContent = `${total} online`;

    const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
    const groups = rooms.filter(room => Array.isArray(room.playerNames) && room.playerNames.length > 0);

    if (!groups.length) {
        listEl.innerHTML = `<div class="globalPlayerEmpty">No players are online.</div>`;
        return;
    }

    listEl.innerHTML = groups.map(room => {
        const serverName = room.name || room.id || "World";
        const playerCount = Number(room.players) || room.playerNames.length;
        const players = room.playerNames.map(name => {
            const me = String(name).toLowerCase() === String(localPlayerName).toLowerCase();
            return `<div class="globalPlayerRow"><span class="globalPlayerDot"></span><span class="globalPlayerName${me ? " globalPlayerMe" : ""}">${escapeHtml(name)}${me ? " (You)" : ""}</span></div>`;
        }).join("");
        return `<div class="globalServerGroup"><div class="globalServerName">${escapeHtml(serverName)}</div><div class="globalServerMeta">${playerCount}/${Number(room.maxPlayers) || 10} players</div>${players}</div>`;
    }).join("");
}

async function refresh() {
    ensureUi();
    const mainMenuVisible = isMainMenuVisible();
    const active = Boolean(window.__webminecraftMultiplayerActive);
    if (!mainMenuVisible && !active) {
        countEl.style.display = "none";
        panel.style.display = "none";
        open = false;
        return;
    }

    countEl.style.display = "block";
    localPlayerName = localStorage.getItem("webminecraft-player-name") || localPlayerName || "Player";

    try {
        const response = await fetch(SERVER_LIST_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const rooms = (data.servers || []).flatMap(server => (server.rooms || []).map(room => ({ ...room, serverName: server.name })));
        renderPlayers({ totalPlayers: Number(data.servers?.reduce?.((sum, server) => sum + (Number(server.players) || 0), 0)) || 0, rooms });
    } catch {
        try {
            const response = await fetch(SERVER_HEALTH_URL, { cache: "no-store" });
            const data = await response.json();
            renderPlayers({ totalPlayers: Number(data.players) || 0, rooms: [] });
        } catch {
            renderPlayers({ totalPlayers: 0, rooms: [] });
        }
    }
}

function tick() {
    void refresh();
    clearTimeout(timer);
    timer = setTimeout(tick, POLL_MS);
}

ensureUi();
tick();
