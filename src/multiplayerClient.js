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
        .multiplayerChatName.multiplayerChatAdmin{color:#55ff55}
        .multiplayerChatVerify{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;margin-left:3px;margin-right:2px;border-radius:50%;background:#3f8cff;color:#fff;font:700 9px Arial,sans-serif;text-shadow:none;vertical-align:-1px;box-shadow:0 0 2px rgba(0,0,0,.8)}
        #multiplayerChatInput{box-sizing:border-box;width:100%;height:34px;margin-top:6px;padding:6px 9px;background:rgba(0,0,0,.72);color:#fff;border:1px solid rgba(255,255,255,.2);outline:none;pointer-events:auto;font:13px Arial,sans-serif}
        #multiplayerChatInput::placeholder{color:#aaa}
    `;
    document.head.appendChild(style);
    const chat = document.createElement("div");
    chat.id = "multiplayerChat";
    chat.innerHTML = `<div id="multiplayerChatFeed" aria-live="polite"></div><input id="multiplayerChatInput" maxlength="120" autocomplete="off" placeholder="Press Enter to chat...">`;
    document.body.appendChild(chat);
    const feed = chat.querySelector("#multiplayerChatFeed");
    const input = chat.querySelector("#multiplayerChatInput");
    window.__webminecraftChatAdd = (text, system = false, name = "", isAdmin = false) => {
        const line = document.createElement("div");
        line.className = `multiplayerChatLine${system ? " multiplayerChatSystem" : ""}`;
        if (system) line.textContent = text;
        else {
            const admin = Boolean(isAdmin) || String(name).toLowerCase() === "admin";
            const label = document.createElement("span");
            label.className = `multiplayerChatName${admin ? " multiplayerChatAdmin" : ""}`;
            label.textContent = `${name}: `;
            line.appendChild(label);
            if (admin) {
                const verify = document.createElement("span");
                verify.className = "multiplayerChatVerify";
                verify.textContent = "✓";
                verify.title = "Verified admin";
                verify.setAttribute("aria-label", "Verified admin");
                label.insertAdjacentElement("afterend", verify);
            }
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
            if (text && isMultiplayerActive()) { try { socket.send(JSON.stringify({ type: "chat_message", text })); } catch {} }
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
        #multiplayerMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(8,12,14,.76);z-index:210;color:#fff;backdrop-filter:blur(3px);animation:mpFadeIn .16s ease-out}
        @keyframes mpFadeIn{from{opacity:0}to{opacity:1}}
        #multiplayerPanel{position:relative;width:min(900px,96vw);max-height:min(92vh,840px);overflow:auto;padding:0;background:linear-gradient(180deg,#2e332f 0%,#202522 100%);border:3px solid #111;border-top-color:#8f9a8f;border-left-color:#8f9a8f;box-shadow:0 14px 0 rgba(0,0,0,.25),10px 10px 0 rgba(0,0,0,.52),0 20px 50px rgba(0,0,0,.35);font-family:Arial,sans-serif}
        #multiplayerPanel::before{content:"";display:block;height:8px;background:repeating-linear-gradient(135deg,#6e8e50 0 10px,#5c7844 10px 20px);border-bottom:3px solid #1a1a1a}
        #multiplayerHero{padding:22px 24px 18px;background:linear-gradient(180deg,#39443a,#2c352e);border-bottom:2px solid #141814;display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
        #multiplayerHeroMain{min-width:0}
        #multiplayerEyebrow{font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:2px;color:#a6bc93;font-weight:800;margin-bottom:8px}
        #multiplayerTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:32px;line-height:1.05;letter-spacing:.3px;text-shadow:3px 3px 0 #111}
        #multiplayerSubtitle{margin:8px 0 0;color:#c3cbc3;font-size:12px;line-height:1.5;max-width:620px}
        #multiplayerLivePill{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:8px 11px;background:#20261f;border:2px solid #111;border-top-color:#68735e;border-left-color:#68735e;color:#d8e4d0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        #multiplayerLiveDot{width:8px;height:8px;background:#7fc15b;box-shadow:0 0 8px rgba(127,193,91,.5)}
        #multiplayerSteps{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 24px;background:#252b26;border-bottom:1px solid #151915}
        .multiplayerStep{display:flex;align-items:center;gap:9px;padding:8px 10px;background:#1b201c;border:1px solid #3d463e;color:#8f9890;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        .multiplayerStepNum{display:grid;place-items:center;width:20px;height:20px;background:#303830;color:#aeb8ad;font-family:"MinecraftFont",monospace;font-size:11px}
        .multiplayerStep.active{background:#30422d;border-color:#6c8b58;color:#edf5e8}
        .multiplayerStep.active .multiplayerStepNum{background:#6d8e52;color:#fff}
        #multiplayerContent{padding:18px 24px 20px}
        .multiplayerSectionHead{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:10px}
        .multiplayerSectionTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:18px;text-shadow:2px 2px 0 #111}
        .multiplayerSectionHint{color:#8f9990;font-size:10px}
        #multiplayerServerList,#multiplayerRoomList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 14px}
        .multiplayerCard{width:100%;min-width:0;text-align:left;padding:14px;background:linear-gradient(180deg,#3a413b,#303632);color:#fff;border:2px solid #111;border-top-color:#788176;border-left-color:#788176;cursor:pointer;box-shadow:0 3px 0 #181d19;transition:transform .12s,filter .12s,background .12s,border-color .12s}
        .multiplayerCard:hover{background:linear-gradient(180deg,#465047,#384139);transform:translateY(-2px);filter:brightness(1.04);border-top-color:#98a995;border-left-color:#98a995}
        .multiplayerCard:active{transform:translateY(1px)}
        .multiplayerOnline,.multiplayerOffline{font-size:10px;font-weight:800;padding:5px 7px;border:1px solid #465241;background:#20261f;white-space:nowrap}
        .multiplayerOnline{color:#a7d57f}.multiplayerOffline{color:#df9387}
        .multiplayerCardTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}
        .multiplayerCardName{font-family:"MinecraftFont",monospace;font-size:14px;line-height:1.35;text-shadow:2px 2px 0 #111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .multiplayerMeta{color:#aeb6af;font-size:10px;line-height:1.55;overflow-wrap:anywhere}
        .multiplayerEmpty{padding:22px;background:#1b201c;color:#98a099;border:1px dashed #465047;font-size:11px;line-height:1.5;text-align:center;grid-column:1/-1}
        .multiplayerEmpty::before{content:"✦";display:block;margin-bottom:5px;color:#769260;font-size:18px}
        .multiplayerField{margin:0 0 12px}.multiplayerField label{display:block;margin-bottom:6px;color:#d8ded8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        .multiplayerField input{box-sizing:border-box;width:100%;height:42px;padding:8px 11px;background:#171b18;color:#fff;border:2px solid #111;border-top-color:#717a70;border-left-color:#717a70;outline:none;font:12px Arial,sans-serif;box-shadow:inset 0 2px 0 rgba(255,255,255,.03)}
        .multiplayerField input::placeholder{color:#69716b}.multiplayerField input:focus{border-top-color:#92b576;border-left-color:#92b576;box-shadow:0 0 0 2px rgba(125,166,95,.18)}
        #multiplayerSelected{padding:11px 13px;margin-bottom:10px;background:#1b211c;border:1px solid #4a564b;color:#cbd2cb;font-size:11px;line-height:1.5}
        #multiplayerSelected strong{color:#fff;font-family:"MinecraftFont",monospace;text-shadow:1px 1px 0 #111}
        #multiplayerServerType{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px}.multiplayerTypeButton{padding:11px;background:#252b26;color:#9ea69f;border:2px solid #111;border-top-color:#717a70;border-left-color:#717a70;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:11px;transition:background .12s,transform .12s}.multiplayerTypeButton:hover{background:#303831}.multiplayerTypeButton:active{transform:translateY(1px)}.multiplayerTypeButton.selected{background:linear-gradient(#587344,#465d37);color:#fff;border-color:#88a86a;box-shadow:0 2px 0 #1b2418}
        #multiplayerPrivateCode{display:none}#multiplayerPrivateCode.visible{display:block}
        #multiplayerStatus{min-height:18px;margin:4px 0 8px;padding:9px 10px;background:#1a1f1b;border-left:3px solid #6f8e58;color:#a8ca8e;font-size:10px;line-height:1.5}
        #multiplayerButtons{display:flex;gap:10px;padding:14px 24px 20px;background:#252b26;border-top:1px solid #151915}.multiplayerButton{min-height:42px;padding:9px 14px;border:2px solid #111;border-top-color:#879184;border-left-color:#879184;background:linear-gradient(#686f69,#505752);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #171b18;transition:transform .1s,filter .1s,background .1s}.multiplayerButton:hover{filter:brightness(1.08)}.multiplayerButton:active{transform:translateY(2px);box-shadow:0 1px 0 #171b18}.multiplayerButton:disabled{opacity:.52;cursor:default;transform:none;filter:none}
        #multiplayerJoin{flex:1;background:linear-gradient(#719251,#57743e)}#multiplayerBack{min-width:170px}#multiplayerRefresh{width:auto;min-width:152px}
        .multiplayerHint{color:#7f8980;font-size:9px;line-height:1.45;margin-top:4px}.multiplayerAdvanced{margin-top:4px;padding-top:12px;border-top:1px solid #3a433c}
        @media(max-width:700px){#multiplayerMenu{padding:10px}#multiplayerHero{padding:18px}.multiplayerLivePill{display:none}#multiplayerSteps{padding:10px 18px}#multiplayerContent{padding:16px 18px 18px}#multiplayerServerList,#multiplayerRoomList{grid-template-columns:1fr}#multiplayerButtons{padding:12px 18px 16px}.multiplayerCardName{font-size:13px}#multiplayerBack{min-width:0}}
        @media(max-width:480px){#multiplayerTitle{font-size:26px}#multiplayerSubtitle{font-size:11px}.multiplayerStep{font-size:9px}.multiplayerStepNum{width:18px;height:18px}.multiplayerSectionTitle{font-size:16px}}
    `;
    document.head.appendChild(style);
}

function defaultServerUrl() {
    const hostname = window.location.hostname || "localhost";
    if (hostname === "localhost" || hostname === "127.0.0.1") return `ws://${hostname}:2567`;
    return PRODUCTION_SERVER_URL;
}
function serverApiUrl(address) {
    try { const url = new URL(address.replace(/^ws/i, "http")); return `${url.origin}/servers`; }
    catch { return `${PRODUCTION_API_URL}/servers`; }
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
    if (overlay) { overlay.style.display = "none"; overlay.setAttribute("aria-hidden", "true"); }
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
            <div id="multiplayerHero">
                <div id="multiplayerHeroMain">
                    <div id="multiplayerEyebrow">WebMinecraft • Online</div>
                    <h2 id="multiplayerTitle">Multiplayer</h2>
                    <p id="multiplayerSubtitle">Pick a server, choose a room, and jump into a world with other players.</p>
                </div>
                <div id="multiplayerLivePill"><span id="multiplayerLiveDot"></span>Live servers</div>
            </div>
            <div id="multiplayerSteps">
                <div id="multiplayerStepServer" class="multiplayerStep active"><span class="multiplayerStepNum">1</span><span>Choose a server</span></div>
                <div id="multiplayerStepRoom" class="multiplayerStep"><span class="multiplayerStepNum">2</span><span>Choose a room</span></div>
            </div>
            <div id="multiplayerContent">
                <section id="multiplayerServerView">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Servers</h3><div class="multiplayerSectionHint">Find an online WebMinecraft server</div></div><button id="multiplayerRefresh" class="multiplayerButton" type="button">↻ Refresh</button></div>
                    <div id="multiplayerServerList"><div class="multiplayerEmpty">Loading servers...</div></div>
                    <div class="multiplayerHint">Private servers can still appear here, but they need their private code when you join.</div>
                </section>
                <section id="multiplayerRoomView" style="display:none">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Rooms</h3><div class="multiplayerSectionHint">Choose where you want to spawn</div></div></div>
                    <div id="multiplayerSelected"></div>
                    <div id="multiplayerRoomList"></div>
                    <div class="multiplayerAdvanced">
                        <div class="multiplayerField"><label for="multiplayerName">Your Player Name</label><input id="multiplayerName" maxlength="16" autocomplete="nickname" placeholder="Player"></div>
                        <div class="multiplayerField"><label for="multiplayerRoom">Room Name</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="MyWorld"></div>
                        <div id="multiplayerServerType" role="group" aria-label="Server type"><button id="multiplayerPublic" class="multiplayerTypeButton selected" type="button">PUBLIC</button><button id="multiplayerPrivate" class="multiplayerTypeButton" type="button">PRIVATE</button></div>
                        <div id="multiplayerPrivateCode" class="multiplayerField"><label for="multiplayerPrivateCodeInput">Private Code</label><input id="multiplayerPrivateCodeInput" maxlength="16" autocomplete="off" placeholder="Enter code or leave blank to create"></div>
                        <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
                    </div>
                    <div class="multiplayerHint">Public and private servers both work. Private rooms require the correct code.</div>
                    <div id="multiplayerStatus" aria-live="polite"></div>
                </section>
            </div>
            <div id="multiplayerButtons"><button id="multiplayerJoin" class="multiplayerButton" type="button" disabled>Join Room</button><button id="multiplayerBack" class="multiplayerButton" type="button">Back</button></div>
        </div>`;
    document.body.appendChild(overlay);
    const serverView = overlay.querySelector("#multiplayerServerView"), roomView = overlay.querySelector("#multiplayerRoomView"), serverList = overlay.querySelector("#multiplayerServerList"), roomList = overlay.querySelector("#multiplayerRoomList"), selectedInfo = overlay.querySelector("#multiplayerSelected"), refreshButton = overlay.querySelector("#multiplayerRefresh"), nameInput = overlay.querySelector("#multiplayerName"), roomInput = overlay.querySelector("#multiplayerRoom"), serverInput = overlay.querySelector("#multiplayerServer"), publicButton = overlay.querySelector("#multiplayerPublic"), privateButton = overlay.querySelector("#multiplayerPrivate"), privateCodeWrap = overlay.querySelector("#multiplayerPrivateCode"), privateCodeInput = overlay.querySelector("#multiplayerPrivateCodeInput"), status = overlay.querySelector("#multiplayerStatus"), joinButton = overlay.querySelector("#multiplayerJoin"), backButton = overlay.querySelector("#multiplayerBack"), stepServer = overlay.querySelector("#multiplayerStepServer"), stepRoom = overlay.querySelector("#multiplayerStepRoom");
    let selectedServer = null, serverData = [], selectedPrivate = false;
    nameInput.value = localStorage.getItem("webminecraft-player-name") || "Player";
    roomInput.value = localStorage.getItem("webminecraft-room") || "default";
    serverInput.value = defaultServerUrl();
    const setStatus = (text, error = false) => { status.textContent = text; status.style.color = error ? "#ef9a8e" : "#a8ca8e"; status.style.borderLeftColor = error ? "#b96a60" : "#6f8e58"; };
    const setServerType = isPrivate => { selectedPrivate = Boolean(isPrivate); publicButton.classList.toggle("selected", !selectedPrivate); privateButton.classList.toggle("selected", selectedPrivate); privateCodeWrap.classList.toggle("visible", selectedPrivate); if (!selectedPrivate) privateCodeInput.value = ""; };
    publicButton.addEventListener("click", () => setServerType(false));
    privateButton.addEventListener("click", () => setServerType(true));
    const showServerView = () => { selectedServer = null; setServerType(false); roomView.style.display = "none"; serverView.style.display = "block"; joinButton.disabled = true; stepServer.classList.add("active"); stepRoom.classList.remove("active"); setStatus(""); backButton.textContent = "Back"; };
    const renderRoomList = server => { roomList.innerHTML = ""; const rooms = [...(server.rooms || [])].sort((a, b) => String(a.id).localeCompare(String(b.id))); if (!rooms.length) { roomList.innerHTML = '<div class="multiplayerEmpty">No rooms are listed yet. Create one below.</div>'; return; } for (const room of rooms) { const button = document.createElement("button"); button.type = "button"; button.className = "multiplayerCard"; const count = Number(room.players) || 0, max = Number(room.maxPlayers) || 0; const roomIsPrivate = Boolean(room.private || room.isPrivate); button.innerHTML = `<div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(room.name || room.id || "Room")}</span><span class="${roomIsPrivate ? "multiplayerOffline" : "multiplayerOnline"}">${roomIsPrivate ? "🔒 PRIVATE" : `${count}${max ? `/${max}` : ""} online`}</span></div><div class="multiplayerMeta">${escapeHtml(room.id || "default")} • ${roomIsPrivate ? "Private room • code required" : "Joinable room"}</div>`; button.addEventListener("click", () => { roomInput.value = String(room.id || room.name || "default").slice(0, 32); setServerType(roomIsPrivate); joinButton.disabled = false; if (roomIsPrivate) { privateCodeInput.value = ""; setStatus(`🔒 Private room selected. Enter its private code to join.`); requestAnimationFrame(() => { privateCodeInput.focus(); }); } else { setStatus(`Selected room "${room.name || room.id || "default"}".`); } }); roomList.appendChild(button); } };
    const showRoomView = server => { selectedServer = server; serverView.style.display = "none"; roomView.style.display = "block"; stepServer.classList.remove("active"); stepRoom.classList.add("active"); serverInput.value = server.websocket || defaultServerUrl(); selectedInfo.innerHTML = `<strong>${escapeHtml(server.name || "Server")}</strong> · ${escapeHtml(server.description || "Multiplayer server")}`; renderRoomList(server); joinButton.disabled = false; setStatus(""); backButton.textContent = "Back to Servers"; };
    const renderServers = servers => { serverData = servers; serverList.innerHTML = ""; if (!servers.length) { serverList.innerHTML = '<div class="multiplayerEmpty">No servers found.</div>'; return; } for (const server of servers) { const button = document.createElement("button"); button.type = "button"; button.className = "multiplayerCard"; const online = server.online !== false; button.innerHTML = `<div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(server.name || "Server")}</span><span class="${online ? "multiplayerOnline" : "multiplayerOffline"}">${online ? "● ONLINE" : "○ OFFLINE"}</span></div><div class="multiplayerMeta">${escapeHtml(server.description || "Multiplayer server")} · ${online ? "Ready to join" : "Unavailable"}</div>`; button.addEventListener("click", () => showRoomView(server)); serverList.appendChild(button); } };
    const fallbackServer = () => ({ name: "Official WebMinecraft Server", description: "Official multiplayer server", online: true, websocket: defaultServerUrl(), rooms: [] });
    const loadServers = async () => { renderServers([fallbackServer()]); refreshButton.disabled = true; try { const response = await fetch(`${PRODUCTION_API_URL}/servers`, { cache: "no-store" }); if (!response.ok) throw new Error(`HTTP ${response.status}`); const data = await response.json(); const servers = (Array.isArray(data.servers) ? data.servers : []).map(server => ({ ...server, websocket: server.websocket || PRODUCTION_SERVER_URL })); renderServers(servers.length ? servers : [fallbackServer()]); } catch (error) { console.error("Failed to load multiplayer servers:", error); setStatus("Live server list unavailable. The official server is still available.", false); } finally { refreshButton.disabled = false; } };
    const closeMenu = () => { if (socket) { try { socket.close(); } catch {} socket = null; } remotePlayers.clear(); localPlayerId = null; pendingPlayerAction = "idle"; window.__webminecraftMultiplayerActive = false; window.__webminecraftMultiplayerPlayerId = null; window.__webminecraftChatHide?.(); overlay.style.display = "none"; overlay.setAttribute("aria-hidden", "true"); showServerView(); setStatus(""); joinButton.disabled = true; joinButton.textContent = "Join Room"; };
    const connect = () => { const address = serverInput.value.trim(), name = (nameInput.value.trim() || "Player").slice(0, 16), room = (roomInput.value.trim() || "default").slice(0, 32), privateCode = privateCodeInput.value.trim().slice(0, 16); if (!address) return setStatus("Enter a server address.", true); if (!/^wss?:\/\//i.test(address)) return setStatus("Server address must start with ws:// or wss://.", true); if (!room) return setStatus("Enter a room name.", true); if (socket) { try { socket.close(); } catch {} socket = null; } localStorage.setItem("webminecraft-player-name", name); localStorage.setItem("webminecraft-room", room); joinButton.disabled = true; joinButton.textContent = "Joining..."; setStatus("Connecting to server..."); try { socket = new WebSocket(address); } catch { joinButton.disabled = false; joinButton.textContent = "Join Room"; setStatus("Could not create the connection.", true); return; }
        socket.addEventListener("open", () => { setStatus("Connected. Joining room..."); socket.send(JSON.stringify({ type: "join", room, name, private: selectedPrivate, privateCode, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, action: "idle" })); });
        socket.addEventListener("message", event => { let message; try { message = JSON.parse(event.data); } catch { return; } if (message.type === "server_info") setStatus(`Server online. ${message.maxPlayers || "?"} player slots available.`); else if (message.type === "joined") { localPlayerId = message.playerId || null; remotePlayers = new Map((message.players || []).filter(player => player.id !== localPlayerId).map(player => [player.id, player])); pendingWorldChanges.clear(); for (const change of message.worldChanges || []) queueWorldChange(change); const privateInfo = message.private ? ` · Private code: ${message.privateCode || "use the code you entered"}` : " · Public"; setStatus(`Joined server "${message.serverName || message.room}". Players: ${message.players?.length || 1}${privateInfo}.`); joinButton.textContent = "Connected"; startSharedWorld(Number(message.worldSeed) || 0); } else if (message.type === "block_change") { queueWorldChange(message); applyPendingWorldChanges(); } else if (message.type === "chat_system") { ensureChatUI(); window.__webminecraftChatShow?.(); window.__webminecraftChatAdd?.(String(message.text || ""), true); } else if (message.type === "chat_message") { ensureChatUI(); window.__webminecraftChatShow?.(); window.__webminecraftChatAdd?.(String(message.text || ""), false, String(message.name || "Player"), Boolean(message.isAdmin)); } else if (message.type === "player_joined") { if (message.player?.id && message.player.id !== localPlayerId) remotePlayers.set(message.player.id, message.player); } else if (message.type === "player_left") { if (message.playerId) remotePlayers.delete(message.playerId); } else if (message.type === "world_sync") { if (Number.isFinite(Number(message.worldSeed))) { const currentSeed = Number(message.worldSeed) >>> 0; if (currentSeed !== 0) { setWorldSeed(currentSeed); const seedInput = document.getElementById("seedInput"); if (seedInput && Number(seedInput.value) !== currentSeed) seedInput.value = String(currentSeed); } } for (const change of message.worldChanges || []) queueWorldChange(change); applyPendingWorldChanges(); } else if (message.type === "player_states") { for (const player of message.players || []) { if (player.id === localPlayerId) continue; remotePlayers.set(player.id, player); } } else if (message.type === "error") { setStatus(message.message || "Server error.", true); joinButton.disabled = false; joinButton.textContent = "Join Room"; if (message.code === "private_code_required") { setServerType(true); privateCodeInput.value = ""; requestAnimationFrame(() => privateCodeInput.focus()); } } });
        socket.addEventListener("close", () => { if (window.__webminecraftMultiplayerActive) setStatus("Disconnected from server.", true); window.__webminecraftChatHide?.(); joinButton.disabled = false; joinButton.textContent = "Join Room"; socket = null; });
        socket.addEventListener("error", () => setStatus("Multiplayer connection failed.", true));
    };
    refreshButton.addEventListener("click", loadServers); joinButton.addEventListener("click", connect); backButton.addEventListener("click", () => { if (roomView.style.display !== "none") showServerView(); else closeMenu(); });
    window.addEventListener("keydown", event => { if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return; if (!isMultiplayerActive()) return; if (event.key === "/") { event.preventDefault(); event.stopImmediatePropagation(); openChatInput("/"); return; } if (event.key === "Enter" || event.key.toLowerCase() === "t") { event.preventDefault(); event.stopImmediatePropagation(); openChatInput(); } }, true);
    window.addEventListener("beforeunload", () => { if (socket) { try { socket.close(); } catch {} } });
    overlay.addEventListener("click", event => { if (event.target === overlay) showServerView(); });
    loadServers();
}

function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }

export function isMultiplayerActive() { return Boolean(window.__webminecraftMultiplayerActive && socket && socket.readyState === WebSocket.OPEN); }
export function sendPlayerState(position, rotation, action = null) { if (!isMultiplayerActive()) return; const outgoingAction = pendingPlayerAction !== "idle" ? pendingPlayerAction : (action || "idle"); pendingPlayerAction = "idle"; socket.send(JSON.stringify({ type: "player_state", position: { x: Number(position?.x) || 0, y: Number(position?.y) || 0, z: Number(position?.z) || 0 }, rotation: { x: Number(rotation?.x) || 0, y: Number(rotation?.y) || 0, z: Number(rotation?.z) || 0 }, action: ["idle", "walk", "mine", "place", "jump"].includes(outgoingAction) ? outgoingAction : "idle" })); }
export function sendPlayerAction(action) { if (["mine", "place", "jump"].includes(action)) pendingPlayerAction = action; }
export function sendBlockChange(x, y, z, blockType) { if (!isMultiplayerActive()) return; socket.send(JSON.stringify({ type: "block_change", x: Math.floor(x), y: Math.floor(y), z: Math.floor(z), blockType: Math.floor(blockType) })); }
export function syncWorldChanges() { if (isMultiplayerActive()) applyPendingWorldChanges(); }
export function getRemotePlayers() { return remotePlayers; }
export function openMultiplayerMenu() { ensureMenu(); overlay.style.display = "flex"; overlay.setAttribute("aria-hidden", "false"); }
