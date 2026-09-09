let overlay = null;
let socket = null;
let localPlayerId = null;
let remotePlayers = new Map();

const PRODUCTION_SERVER_URL = "wss://webminecraft-server.onrender.com/multiplayer";
const PRODUCTION_API_URL = "https://webminecraft-server.onrender.com";

function makeStyle() {
    if (document.getElementById("multiplayerMenuStyles")) return;
    const style = document.createElement("style");
    style.id = "multiplayerMenuStyles";
    style.textContent = `
        #multiplayerMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.64);z-index:210;color:#fff}
        #multiplayerPanel{width:min(760px,94vw);max-height:90vh;overflow:auto;padding:26px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);font-family:Arial,sans-serif}
        #multiplayerTitle{margin:0 0 6px;font-family:"MinecraftFont",monospace;font-size:30px;text-shadow:3px 3px 0 #000}
        #multiplayerSubtitle{margin:0 0 18px;color:#aaa;font-size:12px;line-height:1.4}
        #multiplayerViewTitle{margin:0 0 10px;font-family:"MinecraftFont",monospace;font-size:18px}
        #multiplayerServerList,#multiplayerRoomList{display:grid;gap:9px;margin:10px 0 14px}
        .multiplayerCard{width:100%;text-align:left;padding:14px;background:#353535;color:#fff;border:2px solid #111;border-top-color:#707070;border-left-color:#707070;cursor:pointer}
        .multiplayerCard:hover{background:#414141}
        .multiplayerCard.selected{background:#45543a;border-color:#83a15f}
        .multiplayerCardTop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px}
        .multiplayerCardName{font-family:"MinecraftFont",monospace;font-size:15px;text-shadow:2px 2px 0 #000}
        .multiplayerOnline{font-size:11px;color:#9fce72}
        .multiplayerOffline{font-size:11px;color:#e38a7b}
        .multiplayerMeta{color:#bbb;font-size:11px;line-height:1.5}
        .multiplayerEmpty{padding:14px;background:#1d1d1d;color:#999;border:1px solid #444;font-size:12px}
        .multiplayerField{margin:10px 0}
        .multiplayerField label{display:block;margin-bottom:6px;color:#ddd;font-size:12px;font-weight:700}
        .multiplayerField input{box-sizing:border-box;width:100%;height:42px;padding:8px 10px;background:#151515;color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;outline:none}
        .multiplayerField input:focus{border-color:#84ad5e}
        #multiplayerStatus{min-height:18px;margin:12px 0;color:#9fce72;font-size:12px;line-height:1.4}
        #multiplayerButtons{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}
        .multiplayerButton{min-height:44px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222}
        .multiplayerButton:hover{background:#777}
        .multiplayerButton:disabled{opacity:.5;cursor:default}
        #multiplayerJoin{background:linear-gradient(#6d8d4e,#526f3c)}
        #multiplayerBack{background:linear-gradient(#696969,#505050)}
        #multiplayerSelected{padding:10px 12px;background:#1a1a1a;border:1px solid #444;color:#ccc;font-size:11px;line-height:1.5}
        #multiplayerRefresh{margin-bottom:5px;width:100%}
        .multiplayerHint{color:#888;font-size:10px;line-height:1.4;margin-top:5px}
        @media(max-width:620px){#multiplayerPanel{padding:20px}.multiplayerCardTop{align-items:flex-start}.multiplayerButton{font-size:11px}}
    `;
    document.head.appendChild(style);
}

function defaultServerUrl() {
    const hostname = window.location.hostname || "localhost";
    if (hostname === "localhost" || hostname === "127.0.0.1") return `ws://${hostname}:2567`;
    return PRODUCTION_SERVER_URL;
}

function serverApiUrl(address) {
    try {
        const url = new URL(address.replace(/^ws/i, "http"));
        return `${url.origin}/servers`;
    } catch {
        return `${PRODUCTION_API_URL}/servers`;
    }
}

function startSharedWorld(worldSeed) {
    const seedInput = document.getElementById("seedInput");
    const openWorldButton = document.getElementById("openWorldButton");
    if (!seedInput || !openWorldButton) return;
    seedInput.value = String(worldSeed >>> 0);
    window.__webminecraftMultiplayerActive = true;
    window.__webminecraftMultiplayerPlayerId = localPlayerId;
    if (overlay) {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
    }
    openWorldButton.click();
}

function ensureMenu() {
    if (overlay) return;
    makeStyle();
    overlay = document.createElement("div");
    overlay.id = "multiplayerMenu";
    overlay.innerHTML = `
        <div id="multiplayerPanel" role="dialog" aria-modal="true" aria-labelledby="multiplayerTitle">
            <h2 id="multiplayerTitle">Multiplayer</h2>
            <p id="multiplayerSubtitle">Choose a server, then choose a room to join.</p>

            <section id="multiplayerServerView">
                <div id="multiplayerViewTitle">Servers</div>
                <button id="multiplayerRefresh" class="multiplayerButton" type="button">Refresh Servers</button>
                <div id="multiplayerServerList"><div class="multiplayerEmpty">Loading servers...</div></div>
            </section>

            <section id="multiplayerRoomView" style="display:none">
                <div id="multiplayerViewTitle">Join Room</div>
                <div id="multiplayerSelected"></div>
                <div id="multiplayerRoomList"></div>
                <div class="multiplayerField"><label for="multiplayerName">Player Name</label><input id="multiplayerName" maxlength="16" autocomplete="nickname" placeholder="Player"></div>
                <div class="multiplayerField"><label for="multiplayerRoom">Room Name</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="default"></div>
                <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
                <div class="multiplayerHint">Pick an existing room above, or type a new room name to create one when you join.</div>
                <div id="multiplayerStatus" aria-live="polite"></div>
            </section>

            <div id="multiplayerButtons">
                <button id="multiplayerJoin" class="multiplayerButton" type="button" disabled>Join Room</button>
                <button id="multiplayerBack" class="multiplayerButton" type="button">Back</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const serverView = overlay.querySelector("#multiplayerServerView");
    const roomView = overlay.querySelector("#multiplayerRoomView");
    const serverList = overlay.querySelector("#multiplayerServerList");
    const roomList = overlay.querySelector("#multiplayerRoomList");
    const selectedInfo = overlay.querySelector("#multiplayerSelected");
    const refreshButton = overlay.querySelector("#multiplayerRefresh");
    const nameInput = overlay.querySelector("#multiplayerName");
    const roomInput = overlay.querySelector("#multiplayerRoom");
    const serverInput = overlay.querySelector("#multiplayerServer");
    const status = overlay.querySelector("#multiplayerStatus");
    const joinButton = overlay.querySelector("#multiplayerJoin");
    const backButton = overlay.querySelector("#multiplayerBack");

    let selectedServer = null;
    let serverData = [];

    nameInput.value = localStorage.getItem("webminecraft-player-name") || "Player";
    roomInput.value = localStorage.getItem("webminecraft-room") || "default";
    serverInput.value = defaultServerUrl();

    const setStatus = (text, error = false) => {
        status.textContent = text;
        status.style.color = error ? "#e38a7b" : "#9fce72";
    };

    const showServerView = () => {
        selectedServer = null;
        roomView.style.display = "none";
        serverView.style.display = "block";
        joinButton.disabled = true;
        setStatus("");
        backButton.textContent = "Back";
    };

    const renderRoomList = server => {
        roomList.innerHTML = "";
        const rooms = [...(server.rooms || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        if (!rooms.some(room => room.id === "default")) rooms.unshift({ id: "default", players: 0, maxPlayers: server.maxPlayers || 10 });
        if (!rooms.length) {
            roomList.innerHTML = '<div class="multiplayerEmpty">No rooms yet. Create one by typing a room name below.</div>';
            return;
        }
        for (const room of rooms) {
            const full = Number(room.players) >= Number(room.maxPlayers || server.maxPlayers || 10);
            const card = document.createElement("button");
            card.type = "button";
            card.className = "multiplayerCard";
            card.disabled = full;
            card.innerHTML = `
                <div class="multiplayerCardTop">
                    <div class="multiplayerCardName">${escapeHtml(room.id)}</div>
                    <div class="${full ? "multiplayerOffline" : "multiplayerOnline"}">${full ? "FULL" : "OPEN"}</div>
                </div>
                <div class="multiplayerMeta">${Number(room.players) || 0} / ${Number(room.maxPlayers || server.maxPlayers || 10)} players</div>
            `;
            card.addEventListener("click", () => {
                roomInput.value = room.id;
                localStorage.setItem("webminecraft-room", room.id);
                [...roomList.querySelectorAll(".multiplayerCard")].forEach(item => item.classList.remove("selected"));
                card.classList.add("selected");
                joinButton.disabled = false;
                setStatus(`Ready to join room "${room.id}".`);
            });
            roomList.appendChild(card);
        }
    };

    const selectServer = server => {
        selectedServer = server;
        serverView.style.display = "none";
        roomView.style.display = "block";
        serverInput.value = server.websocket || defaultServerUrl();
        selectedInfo.innerHTML = `<strong>${escapeHtml(server.name || "Server")}</strong><br><span class="multiplayerMeta">${server.online === false ? "Offline" : `${Number(server.players) || 0} / ${Number(server.maxPlayers) || 10} players online`} · ${(server.rooms || []).length || 1} room${(server.rooms || []).length === 1 ? "" : "s"}</span>`;
        renderRoomList(server);
        const defaultRoom = (server.rooms || []).find(room => room.id === (roomInput.value || "default")) || (server.rooms || [])[0];
        if (defaultRoom) {
            roomInput.value = defaultRoom.id;
            joinButton.disabled = Number(defaultRoom.players) >= Number(defaultRoom.maxPlayers || server.maxPlayers || 10);
        } else {
            roomInput.value = localStorage.getItem("webminecraft-room") || "default";
            joinButton.disabled = false;
        }
        setStatus(joinButton.disabled ? "That room is full." : "Select a room or enter a new room name.");
    };

    const renderServers = servers => {
        serverData = servers;
        serverList.innerHTML = "";
        if (!servers.length) {
            serverList.innerHTML = '<div class="multiplayerEmpty">No multiplayer servers are available.</div>';
            return;
        }
        for (const server of servers) {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "multiplayerCard";
            const online = server.online !== false;
            card.innerHTML = `
                <div class="multiplayerCardTop">
                    <div class="multiplayerCardName">${escapeHtml(server.name || "WebMinecraft Server")}</div>
                    <div class="${online ? "multiplayerOnline" : "multiplayerOffline"}">${online ? "ONLINE" : "OFFLINE"}</div>
                </div>
                <div class="multiplayerMeta">${Number(server.players) || 0} / ${Number(server.maxPlayers) || 10} players · ${(server.rooms || []).length || 1} room${(server.rooms || []).length === 1 ? "" : "s"}</div>
            `;
            card.addEventListener("click", () => selectServer(server));
            serverList.appendChild(card);
        }
    };

    const fallbackServer = () => ({
        id: "webminecraft-official",
        name: "WebMinecraft Official",
        online: true,
        players: 0,
        maxPlayers: 10,
        rooms: [],
        websocket: PRODUCTION_SERVER_URL,
    });

    const loadServers = async () => {
        renderServers([fallbackServer()]);
        refreshButton.disabled = true;
        try {
            const response = await fetch(`${PRODUCTION_API_URL}/servers`, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const servers = (Array.isArray(data.servers) ? data.servers : []).map(server => ({
                ...server,
                websocket: server.websocket || PRODUCTION_SERVER_URL,
            }));
            renderServers(servers.length ? servers : [fallbackServer()]);
        } catch (error) {
            console.error("Failed to load multiplayer servers:", error);
            setStatus("Live server list unavailable. The official server is still available.", false);
        } finally {
            refreshButton.disabled = false;
        }
    };

    const closeMenu = () => {
        if (socket) {
            try { socket.close(); } catch {}
            socket = null;
        }
        remotePlayers.clear();
        localPlayerId = null;
        window.__webminecraftMultiplayerActive = false;
        window.__webminecraftMultiplayerPlayerId = null;
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
        showServerView();
        setStatus("");
        joinButton.disabled = true;
        joinButton.textContent = "Join Room";
    };

    const connect = () => {
        const address = serverInput.value.trim();
        const name = (nameInput.value.trim() || "Player").slice(0, 16);
        const room = (roomInput.value.trim() || "default").slice(0, 32);
        if (!address) return setStatus("Enter a server address.", true);
        if (!/^wss?:\/\//i.test(address)) return setStatus("Server address must start with ws:// or wss://.", true);
        if (!room) return setStatus("Enter a room name.", true);

        if (socket) {
            try { socket.close(); } catch {}
            socket = null;
        }

        localStorage.setItem("webminecraft-player-name", name);
        localStorage.setItem("webminecraft-room", room);
        joinButton.disabled = true;
        joinButton.textContent = "Joining...";
        setStatus("Connecting to server...");

        try {
            socket = new WebSocket(address);
        } catch {
            joinButton.disabled = false;
            joinButton.textContent = "Join Room";
            setStatus("Could not create the connection.", true);
            return;
        }

        socket.addEventListener("open", () => {
            setStatus("Connected. Joining room...");
            socket.send(JSON.stringify({
                type: "join",
                room,
                name,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
            }));
        });

        socket.addEventListener("message", event => {
            let message;
            try { message = JSON.parse(event.data); } catch { return; }
            if (message.type === "server_info") {
                setStatus(`Server online. ${message.maxPlayers || "?"} player slots available.`);
            } else if (message.type === "joined") {
                localPlayerId = message.playerId || null;
                remotePlayers = new Map((message.players || []).filter(player => player.id !== localPlayerId).map(player => [player.id, player]));
                setStatus(`Joined room "${message.room}". Players: ${message.players?.length || 1}.`);
                joinButton.textContent = "Connected";
                startSharedWorld(Number(message.worldSeed) || 0);
            } else if (message.type === "player_joined") {
                if (message.player?.id && message.player.id !== localPlayerId) remotePlayers.set(message.player.id, message.player);
            } else if (message.type === "player_left") {
                if (message.playerId) remotePlayers.delete(message.playerId);
            } else if (message.type === "player_states") {
                for (const player of message.players || []) {
                    if (player.id === localPlayerId) continue;
                    remotePlayers.set(player.id, player);
                }
            } else if (message.type === "error") {
                setStatus(message.message || "The server rejected the connection.", true);
                joinButton.disabled = false;
                joinButton.textContent = "Join Room";
            }
        });

        socket.addEventListener("close", () => {
            if (socket) {
                socket = null;
                remotePlayers.clear();
                window.__webminecraftMultiplayerActive = false;
                window.__webminecraftMultiplayerPlayerId = null;
                if (roomView.style.display !== "none") {
                    joinButton.disabled = false;
                    joinButton.textContent = "Join Room";
                    setStatus("Disconnected from server.", true);
                }
            }
        });

        socket.addEventListener("error", () => {
            joinButton.disabled = false;
            joinButton.textContent = "Join Room";
            setStatus("Could not connect to that server.", true);
        });
    };

    refreshButton.addEventListener("click", loadServers);
    roomInput.addEventListener("input", () => {
        const room = roomInput.value.trim();
        joinButton.disabled = !selectedServer || !room;
        if (room) localStorage.setItem("webminecraft-room", room);
    });
    nameInput.addEventListener("input", () => {
        localStorage.setItem("webminecraft-player-name", nameInput.value.trim().slice(0, 16));
    });
    joinButton.addEventListener("click", connect);
    backButton.addEventListener("click", () => {
        if (roomView.style.display !== "none") showServerView();
        else closeMenu();
    });
    overlay.addEventListener("click", event => { if (event.target === overlay) closeMenu(); });
    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && overlay.style.display === "flex") closeMenu();
    }, true);

    loadServers();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function openMultiplayerMenu() {
    ensureMenu();
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelector("#multiplayerName").focus();
}

export function isMultiplayerActive() {
    return Boolean(window.__webminecraftMultiplayerActive && socket && socket.readyState === WebSocket.OPEN);
}

export function sendPlayerState(position, rotation) {
    if (!isMultiplayerActive()) return;
    socket.send(JSON.stringify({ type: "player_state", position, rotation }));
}

export function getRemotePlayers() {
    return remotePlayers;
}
