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
#globalPlayerCount{position:fixed;left:auto;right:28px;bottom:28px;z-index:96;display:none;width:176px;min-height:54px;padding:9px 14px;text-align:left;background:linear-gradient(180deg,#3f3f3f 0%,#292929 100%);border:2px solid #111;border-top-color:#8e8e8e;border-left-color:#8e8e8e;color:#fff;font-family:"MinecraftFont",monospace;cursor:pointer;text-shadow:2px 2px 0 #111;box-shadow:5px 5px 0 rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .12s,filter .12s}
#globalPlayerCount:hover{filter:brightness(1.12);transform:translateY(-2px)}
#globalPlayerCount:active{transform:translateY(1px);filter:brightness(.95)}
#globalPlayerCount strong{display:block;font-size:16px;line-height:1}
#globalPlayerCount span{display:block;margin-top:6px;color:#aaa;font:10px Arial,sans-serif}
#globalPlayerCount::before{content:"";display:inline-block;width:7px;height:7px;margin-right:7px;vertical-align:2px;background:#78bd52;box-shadow:0 0 7px rgba(120,189,82,.55)}
#globalPlayerPanel{position:fixed;left:auto;right:28px;bottom:92px;z-index:97;width:min(430px,calc(100vw - 40px));max-height:min(570px,calc(100vh - 116px));display:none;overflow:hidden;background:linear-gradient(180deg,#242424,#1b1b1b);color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;box-shadow:8px 8px 0 rgba(0,0,0,.5),0 12px 35px rgba(0,0,0,.28);font-family:Arial,sans-serif;animation:serverPanelIn .13s ease-out}
@keyframes serverPanelIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
#globalPlayerHeader{padding:15px 17px 13px;background:linear-gradient(180deg,#353535,#292929);border-bottom:2px solid #111;display:flex;align-items:center;justify-content:space-between;gap:12px}
#globalPlayerTitle{font:18px "MinecraftFont",monospace;text-shadow:2px 2px 0 #000;letter-spacing:.2px}
#globalPlayerSubtitle{margin-top:4px;color:#999;font-size:10px}
#globalPlayerTotal{flex:0 0 auto;padding:6px 9px;background:#202020;border:1px solid #4c4c4c;color:#9fce72;font-size:10px;font-weight:bold}
#globalPlayerList{overflow:auto;padding:11px;max-height:455px;scrollbar-width:thin;scrollbar-color:#555 #202020}
.globalServerGroup{position:relative;margin:0 0 10px;padding:0;overflow:hidden;background:#292929;border:1px solid #4b4b4b;box-shadow:0 2px 0 rgba(0,0,0,.22)}
.globalServerGroup:last-child{margin-bottom:0}
.globalServerHead{padding:11px 12px 9px;background:linear-gradient(180deg,#333,#2c2c2c);border-bottom:1px solid #454545}
.globalServerName{font-family:"MinecraftFont",monospace;font-size:13px;color:#eee;text-shadow:1px 1px 0 #000}
.globalServerMeta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;color:#999;font-size:10px}
.globalServerStatus{color:#80bd59;font-weight:bold}
.globalServerCapacity{height:4px;margin-top:8px;background:#1d1d1d;overflow:hidden}
.globalServerCapacityFill{height:100%;background:#78b954;min-width:3px;box-shadow:0 0 5px rgba(120,185,84,.25)}
.globalServerPlayers{padding:7px 8px 8px}
.globalPlayerRow{display:flex;align-items:center;gap:9px;padding:8px 9px;margin:3px 0;background:#343434;border:1px solid #484848;font-size:12px;transition:background .1s,border-color .1s}
.globalPlayerRow:hover{background:#3b3b3b;border-color:#5a5a5a}
.globalPlayerDot{width:8px;height:8px;flex:0 0 8px;background:#83b95f;box-shadow:0 0 5px rgba(131,185,95,.5)}
.globalPlayerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ddd}
.globalPlayerMe{color:#a8d77b;font-weight:bold}
.globalPlayerEmpty{padding:25px 14px;color:#999;text-align:center;font-size:11px;line-height:1.5}
@media(max-width:600px){#globalPlayerCount{right:12px;bottom:40px;width:180px}#globalPlayerPanel{right:12px;bottom:105px;width:calc(100vw - 24px);max-height:calc(100vh - 125px)}#globalPlayerList{max-height:calc(100vh - 225px)}}
`;
    document.head.appendChild(style);

    countEl = document.createElement("button");
    countEl.type = "button";
    countEl.id = "globalPlayerCount";
    countEl.innerHTML = `<strong>0 Players</strong><span>View servers and players</span>`;
    document.body.appendChild(countEl);

    panel = document.createElement("div");
    panel.id = "globalPlayerPanel";
    panel.innerHTML = `<div id="globalPlayerHeader"><div><div id="globalPlayerTitle">Servers</div><div id="globalPlayerSubtitle">Multiplayer worlds online</div></div><div id="globalPlayerTotal">0 online</div></div><div id="globalPlayerList"><div class="globalPlayerEmpty">No players are online.</div></div>`;
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
    countEl.querySelector("span").textContent = total ? "View servers and players" : "No players online";
    panel.querySelector("#globalPlayerTotal").textContent = `${total} online`;

    const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
    const groups = rooms.filter(room => Array.isArray(room.playerNames) && room.playerNames.length > 0);

    if (!groups.length) {
        listEl.innerHTML = `<div class="globalPlayerEmpty">No multiplayer players are online right now.</div>`;
        return;
    }

    listEl.innerHTML = groups.map(room => {
        const serverName = room.name || room.id || "World";
        const playerCount = Number(room.players) || room.playerNames.length;
        const maxPlayers = Number(room.maxPlayers) || 10;
        const percent = Math.max(3, Math.min(100, (playerCount / maxPlayers) * 100));
        const players = room.playerNames.map(name => {
            const me = String(name).toLowerCase() === String(localPlayerName).toLowerCase();
            return `<div class="globalPlayerRow"><span class="globalPlayerDot"></span><span class="globalPlayerName${me ? " globalPlayerMe" : ""}">${escapeHtml(name)}${me ? " (You)" : ""}</span></div>`;
        }).join("");
        return `<div class="globalServerGroup"><div class="globalServerHead"><div class="globalServerName">${escapeHtml(serverName)}</div><div class="globalServerMeta"><span class="globalServerStatus">● Online</span><span>${playerCount}/${maxPlayers} players</span></div><div class="globalServerCapacity"><div class="globalServerCapacityFill" style="width:${percent}%"></div></div></div><div class="globalServerPlayers">${players}</div></div>`;
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
