const SERVER_HEALTH_URL = "https://webminecraft-server.onrender.com/health";
const POLL_MS = 4000;

let countEl = null;
let panel = null;
let listEl = null;
let timer = null;
let open = false;

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]));
}

function isActive() {
    return Boolean(window.__webminecraftMultiplayerActive);
}

function ensureUi() {
    if (countEl) return;
    const style = document.createElement("style");
    style.id = "globalPlayerListStyles";
    style.textContent = `
#globalPlayerCount{position:fixed;top:78px;right:20px;z-index:89;display:none;min-width:48px;padding:8px 11px;background:rgba(0,0,0,.68);border:1px solid rgba(255,255,255,.25);color:#fff;font:12px Arial,sans-serif;text-align:center;cursor:pointer;text-shadow:1px 1px 2px #000;box-shadow:0 2px 0 rgba(0,0,0,.5)}
#globalPlayerCount strong{display:block;font-size:15px;font-family:"MinecraftFont",monospace}
#globalPlayerCount span{display:block;color:#bbb;margin-top:2px}
#globalPlayerPanel{position:fixed;top:20px;right:78px;width:min(280px,calc(100vw - 96px));max-height:min(430px,calc(100vh - 40px));z-index:91;display:none;overflow:hidden;background:#202020;color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:5px 5px 0 rgba(0,0,0,.55);font-family:Arial,sans-serif}
#globalPlayerHeader{padding:14px 16px;background:#2b2b2b;border-bottom:2px solid #111;display:flex;align-items:center;justify-content:space-between;gap:8px}
#globalPlayerTitle{font:16px "MinecraftFont",monospace;text-shadow:2px 2px 0 #000}
#globalPlayerTotal{color:#9fce72;font-size:11px}
#globalPlayerList{overflow:auto;padding:10px;max-height:350px}
.globalPlayerRow{display:flex;align-items:center;gap:9px;padding:9px 10px;margin:4px 0;background:#333;border:1px solid #555;font-size:12px}
.globalPlayerDot{width:8px;height:8px;flex:0 0 8px;background:#83b95f;box-shadow:0 0 4px rgba(131,185,95,.5)}
.globalPlayerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.globalPlayerMe{color:#9fce72}
.globalPlayerEmpty{padding:12px;color:#999;text-align:center;font-size:11px}
@media(max-width:600px){#globalPlayerCount{top:76px;right:12px}#globalPlayerPanel{top:12px;right:12px;width:min(300px,calc(100vw - 24px))}
}
`;
    document.head.appendChild(style);

    countEl = document.createElement("button");
    countEl.type = "button";
    countEl.id = "globalPlayerCount";
    countEl.innerHTML = `<strong>0</strong><span>Players</span>`;
    document.body.appendChild(countEl);

    panel = document.createElement("div");
    panel.id = "globalPlayerPanel";
    panel.innerHTML = `<div id="globalPlayerHeader"><div id="globalPlayerTitle">Players Online</div><div id="globalPlayerTotal">0 online</div></div><div id="globalPlayerList"><div class="globalPlayerEmpty">No players found.</div></div>`;
    document.body.appendChild(panel);
    listEl = panel.querySelector("#globalPlayerList");

    countEl.addEventListener("click", () => {
        open = !open;
        panel.style.display = open ? "block" : "none";
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Tab" || !isActive()) return;
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
        event.preventDefault();
        open = !open;
        panel.style.display = open ? "block" : "none";
    });
}

function getLocalName() {
    return localStorage.getItem("webminecraft-player-name") || "Player";
}

function getRoomPlayers() {
    const remote = window.webMinecraftRemotePlayers;
    const names = [];
    if (remote instanceof Map) {
        for (const player of remote.values()) {
            if (player?.name) names.push(String(player.name));
        }
    }
    return [getLocalName(), ...names];
}

function renderPlayers(total, names, available = true) {
    ensureUi();
    countEl.querySelector("strong").textContent = String(total);
    countEl.querySelector("span").textContent = total === 1 ? "Player" : "Players";
    panel.querySelector("#globalPlayerTotal").textContent = `${total} online`;

    if (!available) {
        listEl.innerHTML = `<div class="globalPlayerEmpty">Global list unavailable.<br>${escapeHtml(names.length)} player${names.length === 1 ? "" : "s"} in this world.</div>`;
        return;
    }

    const uniqueNames = [];
    const seen = new Set();
    for (const name of names) {
        const clean = String(name || "Player").slice(0, 16);
        const key = clean.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueNames.push(clean);
    }
    listEl.innerHTML = uniqueNames.length
        ? uniqueNames.map((name, index) => `<div class="globalPlayerRow"><span class="globalPlayerDot"></span><span class="globalPlayerName${index === 0 ? " globalPlayerMe" : ""}">${escapeHtml(name)}${index === 0 ? " (You)" : ""}</span></div>`).join("")
        : `<div class="globalPlayerEmpty">No players online.</div>`;
}

async function refresh() {
    ensureUi();
    if (!isActive()) {
        countEl.style.display = "none";
        panel.style.display = "none";
        open = false;
        return;
    }

    countEl.style.display = "block";
    const roomNames = getRoomPlayers();
    try {
        const response = await fetch(SERVER_HEALTH_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const total = Number.isFinite(Number(data.players)) ? Number(data.players) : roomNames.length;
        renderPlayers(total, roomNames, false);
    } catch {
        renderPlayers(roomNames.length, roomNames, false);
    }
}

function tick() {
    void refresh();
    clearTimeout(timer);
    timer = setTimeout(tick, POLL_MS);
}

ensureUi();
tick();
