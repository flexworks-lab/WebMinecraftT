let overlay = null;
let socket = null;
let localPlayerId = null;
let remotePlayers = new Map();

const PRODUCTION_SERVER_URL = "wss://webminecraft-server.onrender.com/multiplayer";

function makeStyle() {
    if (document.getElementById("multiplayerMenuStyles")) return;
    const style = document.createElement("style");
    style.id = "multiplayerMenuStyles";
    style.textContent = `
        #multiplayerMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);z-index:210;color:#fff}
        #multiplayerPanel{width:min(460px,92vw);padding:28px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);font-family:Arial,sans-serif}
        #multiplayerTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:32px;text-shadow:3px 3px 0 #000}
        #multiplayerSubtitle{margin:0 0 20px;color:#aaa;font-size:12px;line-height:1.4}
        .multiplayerField{margin:12px 0}
        .multiplayerField label{display:block;margin-bottom:6px;color:#ddd;font-size:12px;font-weight:700}
        .multiplayerField input{width:100%;height:42px;padding:8px 10px;background:#151515;color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;outline:none}
        .multiplayerField input:focus{border-color:#84ad5e}
        #multiplayerStatus{min-height:18px;margin:14px 0;color:#9fce72;font-size:12px;line-height:1.4}
        #multiplayerButtons{display:grid;grid-template-columns:1fr 1fr;gap:9px}
        .multiplayerButton{min-height:44px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222}
        .multiplayerButton:hover{background:#777}
        #multiplayerJoin{background:linear-gradient(#6d8d4e,#526f3c)}
        @media(max-width:520px){#multiplayerPanel{padding:22px}.multiplayerButton{font-size:11px}}
    `;
    document.head.appendChild(style);
}

function defaultServerUrl() {
    const hostname = window.location.hostname || "localhost";
    if (hostname === "localhost" || hostname === "127.0.0.1") return `ws://${hostname}:2567`;
    return PRODUCTION_SERVER_URL;
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
            <p id="multiplayerSubtitle">Join a room hosted by a WebMinecraft multiplayer server.</p>
            <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
            <div class="multiplayerField"><label for="multiplayerName">Player Name</label><input id="multiplayerName" maxlength="16" autocomplete="nickname" placeholder="Player"></div>
            <div class="multiplayerField"><label for="multiplayerRoom">Room</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="default"></div>
            <div id="multiplayerStatus" aria-live="polite">Start the multiplayer server, then connect.</div>
            <div id="multiplayerButtons">
                <button id="multiplayerJoin" class="multiplayerButton" type="button">Join Server</button>
                <button id="multiplayerClose" class="multiplayerButton" type="button">Back</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const serverInput = overlay.querySelector("#multiplayerServer");
    const nameInput = overlay.querySelector("#multiplayerName");
    const roomInput = overlay.querySelector("#multiplayerRoom");
    const status = overlay.querySelector("#multiplayerStatus");
    const joinButton = overlay.querySelector("#multiplayerJoin");
    const closeButton = overlay.querySelector("#multiplayerClose");

    serverInput.value = defaultServerUrl();
    nameInput.value = localStorage.getItem("webminecraft-player-name") || "Player";
    roomInput.value = localStorage.getItem("webminecraft-room") || "default";

    const setStatus = (text, error = false) => {
        status.textContent = text;
        status.style.color = error ? "#e38a7b" : "#9fce72";
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
        setStatus("Start the multiplayer server, then connect.");
        joinButton.disabled = false;
        joinButton.textContent = "Join Server";
    };

    const connect = () => {
        const address = serverInput.value.trim();
        const name = (nameInput.value.trim() || "Player").slice(0, 16);
        const room = (roomInput.value.trim() || "default").slice(0, 32);
        if (!address) return setStatus("Enter a server address.", true);
        if (!/^wss?:\/\//i.test(address)) return setStatus("Server address must start with ws:// or wss://.", true);

        if (socket) {
            try { socket.close(); } catch {}
            socket = null;
        }

        localStorage.setItem("webminecraft-player-name", name);
        localStorage.setItem("webminecraft-room", room);
        joinButton.disabled = true;
        joinButton.textContent = "Connecting...";
        setStatus("Connecting to server...");

        try {
            socket = new WebSocket(address);
        } catch {
            joinButton.disabled = false;
            joinButton.textContent = "Join Server";
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
                joinButton.disabled = false;
                joinButton.textContent = "Connected";
                startSharedWorld(Number(message.worldSeed) || 0);
            } else if (message.type === "player_joined") {
                if (message.player?.id && message.player.id !== localPlayerId) remotePlayers.set(message.player.id, message.player);
                setStatus(`${message.player?.name || "A player"} joined the room.`);
            } else if (message.type === "player_left") {
                if (message.playerId) remotePlayers.delete(message.playerId);
                setStatus("A player left the room.");
            } else if (message.type === "player_states") {
                for (const player of message.players || []) {
                    if (player.id === localPlayerId) continue;
                    remotePlayers.set(player.id, player);
                }
            } else if (message.type === "error") {
                setStatus(message.message || "The server rejected the connection.", true);
                joinButton.disabled = false;
                joinButton.textContent = "Join Server";
            }
        });

        socket.addEventListener("close", () => {
            if (socket) {
                socket = null;
                remotePlayers.clear();
                window.__webminecraftMultiplayerActive = false;
                window.__webminecraftMultiplayerPlayerId = null;
                joinButton.disabled = false;
                joinButton.textContent = "Join Server";
                setStatus("Disconnected from server.", true);
            }
        });

        socket.addEventListener("error", () => {
            joinButton.disabled = false;
            joinButton.textContent = "Join Server";
            setStatus("Could not connect to that server.", true);
        });
    };

    joinButton.addEventListener("click", connect);
    closeButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", event => { if (event.target === overlay) closeMenu(); });
    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && overlay.style.display === "flex") closeMenu();
    }, true);
}

export function openMultiplayerMenu() {
    ensureMenu();
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelector("#multiplayerServer").focus();
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
