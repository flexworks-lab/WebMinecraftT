import { setBlockAt, setWorldSeed } from "./world.js";

let overlay = null;
let socket = null;
let localPlayerId = null;
let remotePlayers = new Map();
const pendingWorldChanges = new Map();
let pendingPlayerAction = "idle";

const PRODUCTION_SERVER_URL = "wss://webminecraft-server.onrender.com/multiplayer";
const PRODUCTION_API_URL = "https://webminecraft-server.onrender.com";

function queueWorldChange(change) {
    const x = Math.floor(Number(change?.x));
    const y = Math.floor(Number(change?.y));
    const z = Math.floor(Number(change?.z));
    const rawType = change?.blockType ?? change?.type;
    const type = Math.floor(Number(rawType));
    if (![x, y, z, type].every(Number.isFinite)) return;
    pendingWorldChanges.set(`${x},${y},${z}`, { x, y, z, type });
}

function applyPendingWorldChanges() {
    for (const [key, change] of pendingWorldChanges) {
        if (setBlockAt(change.x, change.y, change.z, change.type)) pendingWorldChanges.delete(key);
    }
}

function ensureChatUI() {
    if (document.getElementById("multiplayerChat")) return;

    const style = document.createElement("style");
    style.id = "multiplayerChatStyles";
    style.textContent = `
        #multiplayerChat{position:fixed;top:12px;left:12px;width:min(380px,calc(100vw - 24px));z-index:180;display:none;font-family:Arial,sans-serif;text-shadow:1px 1px 2px #000;pointer-events:none}
        #multiplayerChatFeed{box-sizing:border-box;max-height:230px;overflow-y:auto;padding:8px 9px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.16);scrollbar-width:thin}
        .multiplayerChatLine{font-size:13px;line-height:1.4;color:#fff;overflow-wrap:anywhere;margin:2px 0}
        .multiplayerChatSystem{color:#c6c6c6;font-style:italic}
        .multiplayerChatName{font-weight:700}
        #multiplayerChatInput{box-sizing:border-box;width:100%;height:34px;margin-top:6px;padding:6px 9px;background:rgba(0,0,0,.72);color:#fff;border:1px solid rgba(255,255,255,.2);outline:none;pointer-events:auto;font:13px Arial,sans-serif}
        #multiplayerChatInput::placeholder{color:#aaa}
    `;
    document.head.appendChild(style);

    const chat = document.createElement("div");
    chat.id = "multiplayerChat";
    chat.innerHTML = `
        <div id="multiplayerChatFeed" aria-live="polite"></div>
        <input id="multiplayerChatInput" maxlength="120" autocomplete="off" placeholder="Press Enter to chat...">
    `;
    document.body.appendChild(chat);

    const feed = chat.querySelector("#multiplayerChatFeed");
    const input = chat.querySelector("#multiplayerChatInput");

    window.__webminecraftChatAdd = (text, system = false, name = "") => {
        const line = document.createElement("div");
        line.className = `multiplayerChatLine${system ? " multiplayerChatSystem" : ""}`;
        if (system) {
            line.textContent = text;
        } else {
            const label = document.createElement("span");
            label.className = "multiplayerChatName";
            label.textContent = `${name}: `;
            line.appendChild(label);
            line.appendChild(document.createTextNode(text));
        }
        feed.appendChild(line);
        while (feed.children.length > 30) feed.firstElementChild.remove();
        feed.scrollTop = feed.scrollHeight;
    };

    window.__webminecraftChatShow = () => { chat.style.display = "block"; };
    window.__webminecraftChatHide = () => { chat.style.display = "none"; input.blur(); };

    input.addEventListener("keydown", event => {
        event.stopPropagation();
        if (event.key === "Enter") {
            const text = input.value.trim();
            if (text && isMultiplayerActive()) {
                try { socket.send(JSON.stringify({ type: "chat_message", text })); } catch {}
            }
            input.value = "";
            input.blur();
            event.preventDefault();
        } else if (event.key === "Escape") {
            input.value = "";
            input.blur();
            event.preventDefault();
        }
    });
}

function openChatInput(initialText = "") {
    if (!isMultiplayerActive()) return;
    ensureChatUI();
    window.__webminecraftChatShow?.();
    const input = document.getElementById("multiplayerChatInput");
    if (!input) return;
    input.value = initialText;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

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
        #multiplayerServerType{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}
        .multiplayerTypeButton{padding:11px;background:#303030;color:#bbb;border:2px solid #111;border-top-color:#777;border-left-color:#777;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:11px}
        .multiplayerTypeButton.selected{background:#45543a;color:#fff;border-color:#83a15f}
        #multiplayerPrivateCode{display:none}
        #multiplayerPrivateCode.visible{display:block}
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
    const numericSeed = Number(worldSeed);
    if (!seedInput || !openWorldButton || !Number.isFinite(numericSeed)) return;
    const sharedSeed = Math.floor(Math.abs(numericSeed)) >>> 0;
    setWorldSeed(sharedSeed);
    seedInput.value = String(sharedSeed);
    window.__webminecraftMultiplayerActive = true;
    window.__webminecraftMultiplayerPlayerId = localPlayerId;
    pendingPlayerAction = "idle";
    ensureChatUI();
    window.__webminecraftChatShow?.();
    if (overlay) {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
    }
    openWorldButton.click();
    requestAnimationFrame(applyPendingWorldChanges);
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
                <div class="multiplayerHint">PRIVATE servers are visible in the list, but require a private code to join.</div>
            </section>
            <section id="multiplayerRoomView" style="display:none">
                <div id="multiplayerViewTitle">Join Room</div>
                <div id="multiplayerSelected"></div>
                <div id="multiplayerRoomList"></div>
                <div class="multiplayerField"><label for="multiplayerName">Player Name</label><input id="multiplayerName" maxlength="16" autocomplete="nickname" placeholder="Player"></div>
                <div class="multiplayerField"><label for="multiplayerRoom">Server Name</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="MyWorld"></div>
                <div id="multiplayerServerType" role="group" aria-label="Server type">
                    <button id="multiplayerPublic" class="multiplayerTypeButton selected" type="button">PUBLIC</button>
                    <button id="multiplayerPrivate" class="multiplayerTypeButton" type="button">PRIVATE</button>
                </div>
                <div id="multiplayerPrivateCode" class="multiplayerField"><label for="multiplayerPrivateCodeInput">Private Code</label><input id="multiplayerPrivateCodeInput" maxlength="16" autocomplete="off" placeholder="Enter code or leave blank to create"></div>
                <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
                <div class="multiplayerHint">Public and private servers both appear in the list. Private servers require their private code to join.</div>
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
    const publicButton = overlay.querySelector("#multiplayerPublic");
    const privateButton = overlay.querySelector("#multiplayerPrivate");
    const privateCodeWrap = overlay.querySelector("#multiplayerPrivateCode");
    const privateCodeInput = overlay.querySelector("#multiplayerPrivateCodeInput");
    const status = overlay.querySelector("#multiplayerStatus");
    const joinButton = overlay.querySelector("#multiplayerJoin");
    const backButton = overlay.querySelector("#multiplayerBack");

    let selectedServer = null;
    let serverData = [];
    let selectedPrivate = false;

    nameInput.value = localStorage.getItem("webminecraft-player-name") || "Player";
    roomInput.value = localStorage.getItem("webminecraft-room") || "default";
    serverInput.value = defaultServerUrl();

    const setStatus = (text, error = false) => {
        status.textContent = text;
        status.style.color = error ? "#e38a7b" : "#9fce72";
    };

    const setServerType = isPrivate => {
        selectedPrivate = Boolean(isPrivate);
        publicButton.classList.toggle("selected", !selectedPrivate);
        privateButton.classList.toggle("selected", selectedPrivate);
        privateCodeWrap.classList.toggle("visible", selectedPrivate);
        if (!selectedPrivate) privateCodeInput.value = "";
    };

    publicButton.addEventListener("click", () => setServerType(false));
    privateButton.addEventListener("click", () => setServerType(true));

    const showServerView = () => {
        selectedServer = null;
        setServerType(false);
        roomView.style.display = "none";
        serverView.style.display = "block";
        joinButton.disabled = true;
        setStatus("");
        backButton.textContent = "Back";
    };

    const renderRoomList = server => {
        roomList.innerHTML = "";
        const rooms = [...(server.rooms || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        if (!rooms.length) {
            roomList.innerHTML = '<div class="multiplayerEmpty">No rooms are listed yet. Create one below.</div>';
            return;
        }
        for (const room of rooms) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "multiplayerCard";
            const count = Number(room.players) || 0;
            const max = Number(room.maxPlayers) || 0;
            button.innerHTML = `<div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(room.name || room.id || "Room")}</span><span class="multiplayerOnline">${count}${max ? `/${max}` : ""} online</span></div><div class="multiplayerMeta">${escapeHtml(room.id || "default")}</div>`;
            button.addEventListener("click", () => {
                roomInput.value = String(room.id || room.name || "default").slice(0, 32);
                setStatus(`Selected room "${room.name || room.id || "default"}".`);
                joinButton.disabled = false;
            });
            roomList.appendChild(button);
        }
    };

    const showRoomView = server => {
        selectedServer = server;
        serverView.style.display = "none";
        roomView.style.display = "block";
        serverInput.value = server.websocket || defaultServerUrl();
        selectedInfo.innerHTML = `<strong>${escapeHtml(server.name || "Server")}</strong> · ${escapeHtml(server.description || "Multiplayer server")}`;
        renderRoomList(server);
        joinButton.disabled = false;
        setStatus("");
        backButton.textContent = "Back to Servers";
    };

    const renderServers = servers => {
        serverData = servers;
        serverList.innerHTML = "";
        if (!servers.length) {
            serverList.innerHTML = '<div class="multiplayerEmpty">No servers found.</div>';
            return;
        }
        for (const server of servers) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "multiplayerCard";
            const online = server.online !== false;
            button.innerHTML = `<div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(server.name || "Server")}</span><span class="${online ? "multiplayerOnline" : "multiplayerOffline"}">${online ? "ONLINE" : "OFFLINE"}</span></div><div class="multiplayerMeta">${escapeHtml(server.description || "Multiplayer server")}</div>`;
            button.addEventListener("click", () => showRoomView(server));
            serverList.appendChild(button);
        }
    };

    const fallbackServer = () => ({ name: "Official WebMinecraft Server", description: "Official multiplayer server", online: true, websocket: defaultServerUrl(), rooms: [] });

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
        pendingPlayerAction = "idle";
        window.__webminecraftMultiplayerActive = false;
        window.__webminecraftMultiplayerPlayerId = null;
        window.__webminecraftChatHide?.();
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
        const privateCode = privateCodeInput.value.trim().slice(0, 16);
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
                private: selectedPrivate,
                privateCode,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                action: "idle",
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
                pendingWorldChanges.clear();
                for (const change of message.worldChanges || []) queueWorldChange(change);
                const privateInfo = message.private ? ` · Private code: ${message.privateCode || "use the code you entered"}` : " · Public";
                setStatus(`Joined server "${message.serverName || message.room}". Players: ${message.players?.length || 1}${privateInfo}.`);
                joinButton.textContent = "Connected";
                startSharedWorld(Number(message.worldSeed) || 0);
            } else if (message.type === "block_change") {
                queueWorldChange(message);
                applyPendingWorldChanges();
            } else if (message.type === "chat_system") {
                ensureChatUI();
                window.__webminecraftChatShow?.();
                window.__webminecraftChatAdd?.(String(message.text || ""), true);
            } else if (message.type === "chat_message") {
                ensureChatUI();
                window.__webminecraftChatShow?.();
                window.__webminecraftChatAdd?.(String(message.text || ""), false, String(message.name || "Player"));
            } else if (message.type === "player_joined") {
                if (message.player?.id && message.player.id !== localPlayerId) remotePlayers.set(message.player.id, message.player);
            } else if (message.type === "player_left") {
                if (message.playerId) remotePlayers.delete(message.playerId);
            } else if (message.type === "world_sync") {
                if (Number.isFinite(Number(message.worldSeed))) {
                    const currentSeed = Number(message.worldSeed) >>> 0;
                    if (currentSeed !== 0) {
                        setWorldSeed(currentSeed);
                        const seedInput = document.getElementById("seedInput");
                        if (seedInput && Number(seedInput.value) !== currentSeed) seedInput.value = String(currentSeed);
                    }
                }
                for (const change of message.worldChanges || []) queueWorldChange(change);
                applyPendingWorldChanges();
            } else if (message.type === "player_states") {
                for (const player of message.players || []) {
                    if (player.id === localPlayerId) continue;
                    remotePlayers.set(player.id, player);
                }
            } else if (message.type === "error") {
                setStatus(message.message || "Server error.", true);
                joinButton.disabled = false;
                joinButton.textContent = "Join Room";
            }
        });

        socket.addEventListener("close", () => {
            if (window.__webminecraftMultiplayerActive) {
                setStatus("Disconnected from server.", true);
            }
            window.__webminecraftChatHide?.();
            joinButton.disabled = false;
            joinButton.textContent = "Join Room";
            socket = null;
        });

        socket.addEventListener("error", () => setStatus("Multiplayer connection failed.", true));
    };

    refreshButton.addEventListener("click", loadServers);
    joinButton.addEventListener("click", connect);
    backButton.addEventListener("click", () => {
        if (roomView.style.display !== "none") showServerView();
        else closeMenu();
    });

    window.addEventListener("keydown", event => {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
        if (!isMultiplayerActive()) return;
        if (event.key === "/") {
            event.preventDefault();
            event.stopImmediatePropagation();
            openChatInput("/");
            return;
        }
        if (event.key === "Enter" || event.key.toLowerCase() === "t") {
            event.preventDefault();
            event.stopImmediatePropagation();
            openChatInput();
        }
    }, true);

    window.addEventListener("beforeunload", () => {
        if (socket) {
            try { socket.close(); } catch {}
        }
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) showServerView();
    });

    loadServers();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function isMultiplayerActive() {
    return Boolean(window.__webminecraftMultiplayerActive && socket && socket.readyState === WebSocket.OPEN);
}

export function sendPlayerState(position, rotation, action = null) {
    if (!isMultiplayerActive()) return;
    const outgoingAction = action || pendingPlayerAction || "idle";
    pendingPlayerAction = "idle";
    socket.send(JSON.stringify({
        type: "player_state",
        position: {
            x: Number(position?.x) || 0,
            y: Number(position?.y) || 0,
            z: Number(position?.z) || 0,
        },
        rotation: {
            x: Number(rotation?.x) || 0,
            y: Number(rotation?.y) || 0,
            z: Number(rotation?.z) || 0,
        },
        action: ["idle", "walk", "mine", "place", "jump"].includes(outgoingAction) ? outgoingAction : "idle",
    }));
}

export function sendPlayerAction(action) {
    if (!["mine", "place", "jump"].includes(action)) return;
    pendingPlayerAction = action;
}

export function sendBlockChange(x, y, z, blockType) {
    if (!isMultiplayerActive()) return;
    socket.send(JSON.stringify({
        type: "block_change",
        x: Math.floor(x), y: Math.floor(y), z: Math.floor(z),
        blockType: Math.floor(blockType),
    }));
}

export function syncWorldChanges() {
    if (isMultiplayerActive()) applyPendingWorldChanges();
}

export function getRemotePlayers() {
    return remotePlayers;
}

export function openMultiplayerMenu() {
    ensureMenu();
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
}
