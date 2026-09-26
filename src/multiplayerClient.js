import { setBlockAt, setWorldSeed, beginWorldEditBatch, endWorldEditBatch } from "./world.js";
import { addItem } from "./inventory.js";
import { hidePlayerDataSync, resetPlayerDataSyncCancellation, isPlayerDataSyncCancelled, setPlayerDataSyncProgress, showPlayerDataSync } from "./playerDataSyncUi.js";

let overlay = null;
let socket = null;
let localPlayerId = null;
let intentionalDisconnect = false;
let connectionLostTimer = null;
let connectionLostInterval = null;
let localRole = "member";
let localIsHost = false;
let remotePlayers = new Map();
window.__webminecraftGetRemotePlayers = () => remotePlayers;
window.__webminecraftMultiplayerRole = "member";
window.__webminecraftMultiplayerIsHost = false;
window.__webminecraftMultiplayerRoomInfo = { room: "", serverName: "", websocket: "", private: false };
const pendingWorldChanges = new Map();
let pendingPlayerAction = "idle";
let playerDataSyncActive = false;
let playerDataSyncCancelHandlerInstalled = false;
let pendingSaveAndQuit = null;

function ensureConnectionLostUI() {
    let screen = document.getElementById("multiplayerConnectionLost");
    if (screen) return screen;
    const style = document.createElement("style");
    style.id = "multiplayerConnectionLostStyles";
    style.textContent = `
        #multiplayerConnectionLost{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(0,0,0,.82);font-family:"MinecraftFont",Arial,sans-serif;color:#fff;text-align:center}
        #multiplayerConnectionLost.multiplayerConnectionLostVisible{display:flex}
        #multiplayerConnectionLostPanel{width:min(520px,92vw);padding:26px 24px 24px;box-sizing:border-box;background:#555;border:3px solid #1b1b1b;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 #222}
        #multiplayerConnectionLostTitle{margin:0;font-size:30px;line-height:1.1;text-shadow:3px 3px 0 #222}
        #multiplayerConnectionLostMessage{margin:12px 0 18px;color:#fff;font:600 14px/1.5 Arial,sans-serif}
        #multiplayerConnectionLostStatus{padding:9px 12px;background:#333;border:2px solid #1b1b1b;color:#ddd;font:700 11px Arial,sans-serif}
    `;
    document.head.appendChild(style);
    screen = document.createElement("div");
    screen.id = "multiplayerConnectionLost";
    screen.setAttribute("aria-hidden","true");
    screen.innerHTML = `<div id="multiplayerConnectionLostPanel" role="alertdialog" aria-modal="true" aria-labelledby="multiplayerConnectionLostTitle"><h2 id="multiplayerConnectionLostTitle">Connection Lost</h2><p id="multiplayerConnectionLostMessage">You have lost connection to the server.</p><div id="multiplayerConnectionLostStatus">Returning to Home Screen in 3...</div></div>`;
    document.body.appendChild(screen);
    return screen;
}
function hideConnectionLostUI() {
    if (connectionLostTimer) { clearTimeout(connectionLostTimer); connectionLostTimer = null; }
    if (connectionLostInterval) { clearInterval(connectionLostInterval); connectionLostInterval = null; }
    const screen = document.getElementById("multiplayerConnectionLost");
    if (!screen) return;
    screen.classList.remove("multiplayerConnectionLostVisible");
    screen.setAttribute("aria-hidden","true");
}
function showConnectionLostUI() {
    const screen = ensureConnectionLostUI();
    hideConnectionLostUI();
    const status = screen.querySelector("#multiplayerConnectionLostStatus");
    let secondsLeft = 3;
    screen.classList.add("multiplayerConnectionLostVisible");
    screen.setAttribute("aria-hidden","false");
    if (status) status.textContent = `Returning to Home Screen in ${secondsLeft}...`;
    connectionLostInterval = setInterval(() => {
        secondsLeft -= 1;
        if (status && secondsLeft > 0) status.textContent = `Returning to Home Screen in ${secondsLeft}...`;
    },1000);
    connectionLostTimer = setTimeout(() => {
        if (connectionLostInterval) { clearInterval(connectionLostInterval); connectionLostInterval = null; }
        const homeUrl = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
        if (new URLSearchParams(window.location.search).get("mobile") === "1") homeUrl.searchParams.set("mobile", "1");
        window.location.assign(homeUrl.href);
    },3000);
}
window.addEventListener("webminecraft:account-username-changed", event => {
    const username = String(event.detail?.username || "").trim().slice(0, 16);
    if (!username) return;
    localStorage.setItem("webminecraft-account-username", username);
    const usernameInput = document.getElementById("multiplayerUsername");
    if (usernameInput) usernameInput.value = username;
    if (socket && socket.readyState === WebSocket.OPEN && window.__webminecraftMultiplayerActive) {
        try { socket.send(JSON.stringify({ type: "player_name", name: username })); } catch {}
    }
});
function beginPlayerDataSync() {
    resetPlayerDataSyncCancellation();
    showPlayerDataSync("Connecting to the multiplayer server and syncing your player data...");
    setPlayerDataSyncProgress(8, "Connecting to the multiplayer server...");
    playerDataSyncActive = true;
}
function updatePlayerDataSync(percent, message) {
    if (!playerDataSyncActive) return false;
    if (isPlayerDataSyncCancelled()) { playerDataSyncActive = false; return true; }
    setPlayerDataSyncProgress(percent, message);
    return false;
}
function finishPlayerDataSync(message = "Player data synced successfully.") {
    if (!playerDataSyncActive) return;
    playerDataSyncActive = false;
    setPlayerDataSyncProgress(100, message);
    setTimeout(hidePlayerDataSync, 500);
}
function installPlayerDataSyncCancelHandler() {
    if (playerDataSyncCancelHandlerInstalled) return;
    playerDataSyncCancelHandlerInstalled = true;
    window.addEventListener("webminecraft:playerdatasynccancel", () => {
        intentionalDisconnect = true;
        playerDataSyncActive = false;
        if (socket) { try { socket.close(); } catch {} socket = null; }
        localPlayerId = null;
        remotePlayers.clear();
        pendingWorldChanges.clear();
        window.__webminecraftMultiplayerActive = false;
        window.__webminecraftMultiplayerPlayerId = null;
        window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-state-changed"));
    });
}
installPlayerDataSyncCancelHandler();

const PRODUCTION_SERVER_URL = "wss://webminecraftt-multiplayer-production.up.railway.app/multiplayer";
const PRODUCTION_API_URL = "https://webminecraftt-multiplayer-production.up.railway.app";

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
    if (pendingWorldChanges.size === 0) return;
    beginWorldEditBatch();
    try {
        for (const [key, change] of pendingWorldChanges) {
            if (setBlockAt(change.x, change.y, change.z, change.type)) pendingWorldChanges.delete(key);
        }
    } finally {
        endWorldEditBatch();
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
        #multiplayerJoin{flex:1;background:linear-gradient(#719251,#57743e)}#multiplayerBack{min-width:170px}
        .multiplayerHint{color:#7f8980;font-size:9px;line-height:1.45;margin-top:4px}.multiplayerAdvanced{margin-top:4px;padding-top:12px;border-top:1px solid #3a433c}
        @media(max-width:700px){#multiplayerMenu{padding:10px}#multiplayerHero{padding:18px}.multiplayerLivePill{display:none}#multiplayerSteps{padding:10px 18px}#multiplayerContent{padding:16px 18px 18px}#multiplayerServerList,#multiplayerRoomList{grid-template-columns:1fr}#multiplayerButtons{padding:12px 18px 16px}.multiplayerCardName{font-size:13px}#multiplayerBack{min-width:0}}
        /* Worlds-style full server screen */
        #multiplayerPanel.servers-screen{width:100%;max-width:none;height:100%;max-height:none;overflow:auto;background:rgba(10,10,10,.58);border:0;box-shadow:none}
        #multiplayerPanel.servers-screen::before{display:none}
        #multiplayerPanel.servers-screen #multiplayerHero,
        #multiplayerPanel.servers-screen #multiplayerSteps{display:none}
        #multiplayerPanel.servers-screen #multiplayerContent{padding:0}
        #multiplayerPanel.servers-screen #multiplayerButtons{position:absolute;top:14px;right:22px;z-index:3;padding:0;background:transparent;border:0;display:flex;gap:8px}
        #multiplayerPanel.servers-screen #multiplayerJoin{display:none}
        #multiplayerPanel.create-server-screen{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;overflow:auto;padding:0;border:0;box-shadow:none;border-radius:0;background:linear-gradient(180deg,#252b26,#171b18)}
        #multiplayerPanel.create-server-screen::before{display:none}
        #multiplayerPanel.create-server-screen #multiplayerHero,#multiplayerPanel.create-server-screen #multiplayerSteps{display:none}
        #multiplayerPanel.create-server-screen #multiplayerContent{min-height:100vh;padding:0}
        #multiplayerPanel.create-server-screen #multiplayerRoomView{min-height:100vh;padding:clamp(28px,6vh,72px) clamp(18px,7vw,110px);box-sizing:border-box;display:flex!important;flex-direction:column;justify-content:center}
        #multiplayerPanel.create-server-screen #multiplayerRoomView > .multiplayerSectionHead{margin:0 auto 22px;width:min(760px,100%)}
        #multiplayerPanel.create-server-screen .multiplayerAdvanced{width:min(760px,100%);margin:0 auto;padding:22px;border-radius:8px;background:linear-gradient(180deg,#303730,#252b26);border:2px solid #111;border-top-color:#687268;border-left-color:#687268;box-shadow:0 5px 0 #0f120f,0 18px 40px rgba(0,0,0,.25)}
        #multiplayerPanel.create-server-screen #multiplayerButtons{position:static;width:min(760px,100%);margin:16px auto 0;padding:0;background:transparent;border:0}
        #multiplayerPanel.create-server-screen #multiplayerBack{display:none}
        #multiplayerPanel.create-server-screen #multiplayerJoin{width:100%;display:block;min-height:54px}
        #multiplayerPanel.create-server-screen .multiplayerHint{width:min(760px,100%);margin:12px auto 0;text-align:center}
        .multiplayerIdentityFields{display:none}
        .multiplayerIdentityFields.visible{display:block}
        .multiplayerGuestIdentity{display:none;margin:0 0 12px;padding:11px 12px;background:#20261f;border:1px solid #485447;color:#b9c3b9;font-size:11px}
        .multiplayerGuestIdentity.visible{display:block}
        .multiplayerGuestIdentity strong{color:#fff;font-family:"MinecraftFont",monospace}
        .multiplayerIdentityNotice{margin:0 0 10px;padding:9px 10px;background:#20261f;border-left:3px solid #7a9b5d;color:#b8c8af;font-size:10px;line-height:1.45}
        @media(max-width:700px){#multiplayerPanel.create-server-screen #multiplayerRoomView{padding:22px 14px}#multiplayerPanel.create-server-screen .multiplayerAdvanced{padding:16px}}

        #multiplayerPanel.servers-screen #multiplayerBack{min-width:0;min-height:38px;padding:8px 14px}
        
        /* Worlds-style server browser */
        #multiplayerServerView.serversStyle{display:block;background:transparent}
        #multiplayerServerView.serversStyle .multiplayerSectionHead{padding:14px 22px;background:#b7b7b7;color:#1b1b1b;border-bottom:2px solid #111;align-items:center}
        #multiplayerServerView.serversStyle .multiplayerSectionTitle{font-size:24px;color:#171717;text-shadow:1px 1px 0 rgba(255,255,255,.35)}
        #multiplayerServerView.serversStyle .multiplayerSectionHint{color:#4c4c4c;font-size:10px}
        #multiplayerServerView.serversStyle #multiplayerRefresh{min-height:38px;background:linear-gradient(#686868,#505050);border:2px solid #111;border-top-color:#8d8d8d;border-left-color:#8d8d8d;box-shadow:3px 3px 0 rgba(0,0,0,.35)}
        #multiplayerServerView.serversStyle #multiplayerServerList{display:grid;grid-template-columns:1fr;gap:12px;padding:14px 22px 8px;margin:0}
        #multiplayerServerView.serversStyle .multiplayerCard{display:grid;grid-template-columns:150px minmax(0,1fr) auto;align-items:stretch;gap:14px;padding:10px;background:rgba(40,40,40,.88);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:5px 5px 0 rgba(0,0,0,.35);min-height:112px}
        #multiplayerServerView.serversStyle .multiplayerCard:hover{transform:translateY(-2px);filter:brightness(1.05);background:rgba(48,48,48,.94)}
        #multiplayerServerView.serversStyle .multiplayerCardPreview{display:flex;align-items:center;justify-content:center;min-height:90px;background:linear-gradient(180deg,#71879a 0%,#a8b4b8 56%,#536842 56%,#435637 100%);border:1px solid #202020;overflow:hidden;position:relative}
        #multiplayerServerView.serversStyle .multiplayerCardPreview::before{content:"";width:58px;height:58px;background:linear-gradient(135deg,#6d8a4f 0 50%,#4d6739 50% 100%);box-shadow:18px 16px 0 rgba(38,48,31,.5),-18px 22px 0 rgba(68,89,54,.7);image-rendering:pixelated}
        #multiplayerServerView.serversStyle .multiplayerCardBody{min-width:0;display:flex;flex-direction:column;justify-content:center}
        #multiplayerServerView.serversStyle .multiplayerCardTop{margin-bottom:8px}
        #multiplayerServerView.serversStyle .multiplayerCardName{font-size:17px}
        #multiplayerServerView.serversStyle .multiplayerMeta{font-size:10px;color:#b4b4b4;line-height:1.65}
        #multiplayerServerView.serversStyle .multiplayerCardAction{align-self:center;min-width:92px;padding:9px 12px;background:linear-gradient(#6b9250,#52733b);color:#fff;border:2px solid #111;border-top-color:#92b579;border-left-color:#92b579;font-family:"MinecraftFont",monospace;font-size:10px;text-shadow:2px 2px 0 #24301f;box-shadow:3px 3px 0 #171b18}
        #multiplayerServerView.serversStyle .multiplayerEmpty{margin:14px 22px;padding:30px;background:rgba(40,40,40,.8);border:2px solid #111;border-top-color:#777;border-left-color:#777}
        #multiplayerServerView.serversStyle .multiplayerHint{padding:0 22px 16px;color:#666;font-size:9px}
        #multiplayerServerDetails{position:static;width:auto;max-height:none;overflow:visible;display:none;margin:0 22px 14px;background:#252525;border:2px solid #101010;border-top-color:#777;border-left-color:#777;box-shadow:5px 5px 0 rgba(0,0,0,.45);color:#fff}
        #multiplayerServerDetails.open{display:block;animation:mpServerDetailsIn .16s ease-out}
        @keyframes mpServerDetailsIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
        #multiplayerServerDetails .sw2-inline{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px}
        #multiplayerServerDetails .sw2-copy{min-width:0}
        #multiplayerServerDetails .sw2-status{display:inline-block;margin-bottom:5px;padding:4px 7px;background:#20261f;border:1px solid #465241;color:#a7d57f;font-size:10px;font-weight:800}
        #multiplayerServerDetails .sw2-status.offline{color:#df9387}
        #multiplayerServerDetails .sw2-title{font-family:"MinecraftFont",monospace;font-size:14px;text-shadow:2px 2px 0 #000}
        #multiplayerServerDetails .sw2-help{margin-top:4px;color:#aaa;font-size:10px;line-height:1.45}
        #multiplayerServerDetails .sw2-btn{min-width:150px;min-height:42px;padding:9px 14px;background:linear-gradient(#686868,#505050);color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:10px;text-shadow:2px 2px 0 #222;box-sizing:border-box}
        #multiplayerServerDetails .sw2-green{background:linear-gradient(#719251,#57743e)}
        #multiplayerServerDetails .sw2-btn:disabled{opacity:.5;cursor:default}
        @media(max-width:760px){
            #multiplayerServerDetails{margin:0 14px 12px}
            #multiplayerServerDetails .sw2-inline{align-items:stretch;flex-direction:column}
            #multiplayerServerDetails .sw2-btn{width:100%}
        }
        /* Worlds-style live server room page */
        #multiplayerPanel.rooms-screen{width:100%;max-width:none;height:100%;max-height:none;overflow:auto;background:rgba(10,10,10,.58);border:0;box-shadow:none}
        #multiplayerPanel.rooms-screen::before{display:none}
        #multiplayerPanel.rooms-screen #multiplayerHero,#multiplayerPanel.rooms-screen #multiplayerSteps{display:none}
        #multiplayerPanel.rooms-screen #multiplayerContent{padding:0}
        #multiplayerPanel.rooms-screen #multiplayerButtons{position:absolute;top:14px;right:22px;z-index:3;padding:0;background:transparent;border:0;display:flex;gap:8px}
        #multiplayerPanel.rooms-screen #multiplayerJoin{display:none}
        #multiplayerPanel.rooms-screen #multiplayerBack{min-width:0;min-height:38px;padding:8px 14px}
        #multiplayerRoomView.roomsStyle{display:block;background:transparent}
        #multiplayerRoomView.roomsStyle .multiplayerSectionHead{padding:14px 22px;background:#b7b7b7;color:#1b1b1b;border-bottom:2px solid #111;align-items:center}
        #multiplayerRoomView.roomsStyle .multiplayerSectionTitle{font-size:24px;color:#171717;text-shadow:1px 1px 0 rgba(255,255,255,.35)}
        #multiplayerRoomView.roomsStyle .multiplayerSectionHint{color:#4c4c4c;font-size:10px}
        #multiplayerRoomView.roomsStyle #multiplayerSelected{margin:14px 22px 10px;padding:10px 12px;background:rgba(40,40,40,.8);border:2px solid #111;border-top-color:#777;border-left-color:#777;color:#ddd}
        #multiplayerRoomView.roomsStyle #multiplayerRoomList{display:grid;grid-template-columns:1fr;gap:12px;padding:0 22px 10px;margin:0}
        #multiplayerRoomView.roomsStyle .multiplayerCard{display:grid;grid-template-columns:150px minmax(0,1fr) auto;align-items:stretch;gap:14px;padding:10px;background:rgba(40,40,40,.88);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:5px 5px 0 rgba(0,0,0,.35);min-height:112px}
        #multiplayerRoomView.roomsStyle .multiplayerCard:hover{transform:translateY(-2px);filter:brightness(1.05);background:rgba(48,48,48,.94)}
        #multiplayerRoomView.roomsStyle .multiplayerRoomPreview{display:flex;align-items:center;justify-content:center;min-height:90px;background:linear-gradient(180deg,#71879a 0%,#a8b4b8 56%,#536842 56%,#435637 100%);border:1px solid #202020;position:relative;overflow:hidden}
        #multiplayerRoomView.roomsStyle .multiplayerRoomPreview::before{content:"";width:58px;height:58px;background:linear-gradient(135deg,#7e9561 0 50%,#526b40 50% 100%);box-shadow:18px 16px 0 rgba(38,48,31,.5),-18px 22px 0 rgba(68,89,54,.7)}
        #multiplayerRoomView.roomsStyle .multiplayerCardBody{min-width:0;display:flex;flex-direction:column;justify-content:center}
        #multiplayerRoomView.roomsStyle .multiplayerCardName{font-size:17px}
        #multiplayerRoomView.roomsStyle .multiplayerMeta{font-size:10px;color:#b4b4b4;line-height:1.65}
        #multiplayerRoomView.roomsStyle .multiplayerCardAction{align-self:center;min-width:92px;padding:9px 12px;background:linear-gradient(#6b9250,#52733b);color:#fff;border:2px solid #111;border-top-color:#92b579;border-left-color:#92b579;font-family:"MinecraftFont",monospace;font-size:10px;text-shadow:2px 2px 0 #24301f;box-shadow:3px 3px 0 #171b18}
        #multiplayerRoomView.roomsStyle .multiplayerEmpty{margin:14px 22px;padding:30px;background:rgba(40,40,40,.8);border:2px solid #111;border-top-color:#777;border-left-color:#777}
        #multiplayerRoomView.roomsStyle #multiplayerRoomCreate{margin:0 22px 12px}
        #multiplayerRoomView.roomsStyle #multiplayerRoomCreateButton{min-height:40px;padding:8px 14px;background:linear-gradient(#686868,#505050);color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:10px;box-shadow:3px 3px 0 rgba(0,0,0,.35)}
        .multiplayerToggle{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:#1a1f1b;color:#d8ded8;border:2px solid #111;border-top-color:#717a70;border-left-color:#717a70;cursor:pointer;text-align:left;font:10px Arial,sans-serif;box-sizing:border-box}
        .multiplayerToggleBox{width:16px;height:16px;flex:0 0 16px;display:grid;place-items:center;background:#111;border:2px solid #717a70;box-sizing:border-box;font:700 11px Arial,sans-serif;color:#fff}
        .multiplayerToggle.selected{background:linear-gradient(180deg,#30442e,#263624);border-top-color:#88a86a;border-left-color:#88a86a}
        .multiplayerToggle.selected .multiplayerToggleBox{background:#6d8e52;border-color:#9fbe86}
        .multiplayerToggleTitle{display:block;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
        .multiplayerToggleHint{display:block;margin-top:2px;color:#8e998f;font-size:9px;line-height:1.35}
        #multiplayerPanel.rooms-screen .multiplayerAdvanced{display:none;margin:0 22px 14px;padding:16px;background:#272727;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:5px 5px 0 rgba(0,0,0,.35)}
        #multiplayerRoomView.roomsStyle #multiplayerCreateAndJoin{width:100%;margin-top:12px;background:linear-gradient(#719251,#57743e)}
        #multiplayerPanel.rooms-screen .roomsStyle.create-open .multiplayerAdvanced{display:block}
        #multiplayerRoomView.roomsStyle .multiplayerAdvanced .multiplayerField:last-of-type{margin-bottom:0}
        #multiplayerRoomView.roomsStyle .multiplayerAdvanced + .multiplayerHint{padding:0 22px 16px;color:#666;font-size:9px}
        @media(max-width:700px){
            #multiplayerRoomView.roomsStyle .multiplayerSectionHead{padding:12px 14px}
            #multiplayerRoomView.roomsStyle #multiplayerSelected{margin:12px 14px 10px}
            #multiplayerRoomView.roomsStyle #multiplayerRoomList{padding:0 14px 8px}
            #multiplayerRoomView.roomsStyle .multiplayerCard{grid-template-columns:96px minmax(0,1fr);gap:10px;min-height:96px;padding:8px}
            #multiplayerRoomView.roomsStyle .multiplayerRoomPreview{min-height:78px}
            #multiplayerRoomView.roomsStyle .multiplayerCardAction{grid-column:2;justify-self:start;min-width:84px}
            #multiplayerRoomView.roomsStyle .multiplayerEmpty{margin:12px 14px}
            #multiplayerRoomView.roomsStyle #multiplayerRoomCreate{margin:0 14px 12px}
            #multiplayerPanel.rooms-screen .multiplayerAdvanced{margin:0 14px 12px}
            #multiplayerPanel.rooms-screen #multiplayerButtons{right:14px;top:12px}
        }

        #multiplayerRoomView{background:rgba(18,18,18,.18)}
        @media(max-width:700px){#multiplayerServerView.serversStyle .multiplayerSectionHead{padding:12px 14px}#multiplayerServerView.serversStyle #multiplayerServerList{padding:12px 14px 6px}#multiplayerServerView.serversStyle .multiplayerCard{grid-template-columns:96px minmax(0,1fr);gap:10px;min-height:96px;padding:8px}#multiplayerServerView.serversStyle .multiplayerCardPreview{min-height:78px}#multiplayerServerView.serversStyle .multiplayerCardAction{grid-column:2;justify-self:start;min-width:84px}#multiplayerServerView.serversStyle .multiplayerEmpty{margin:12px 14px}#multiplayerServerView.serversStyle .multiplayerHint{padding:0 14px 14px}}
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

    // Let the game start first, then apply the complete server snapshot before
    // telling the loading screen that multiplayer world data is ready.
    requestAnimationFrame(() => {
        applyPendingWorldChanges();
        requestAnimationFrame(() => {
            applyPendingWorldChanges();
            window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-world-ready", {
                detail: { seed: sharedSeed, blockChanges: pendingWorldChanges.size }
            }));
        });
    });
}

function ensureMenu() {
    const existing = window.__webminecraftMultiplayerMenuOverlay;
    if (existing && existing.isConnected && existing.dataset.webminecraftMenuVersion === "rooms-v3") {
        overlay = existing;
        return;
    }
    document.querySelectorAll("#multiplayerMenu").forEach(element => element.remove());
    const staleStyle = document.getElementById("multiplayerMenuStyles");
    if (staleStyle) staleStyle.remove();
    overlay = null;
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
                <section id="multiplayerServerView" class="serversStyle">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Servers</h3><div class="multiplayerSectionHint">Automatically updating every 5 seconds</div></div></div>
                    <div id="multiplayerServerList"><div class="multiplayerEmpty">Loading servers...</div></div>
                    <div class="multiplayerHint">Private servers can still appear here, but they need their private code when you join.</div>
                    <aside id="multiplayerServerDetails" aria-hidden="true"></aside>
                </section>
                <section id="multiplayerRoomView" style="display:none">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Rooms</h3><div class="multiplayerSectionHint">Choose a room on this live server</div></div></div>
                    <div id="multiplayerSelected"></div>
                    <div id="multiplayerRoomCreate"><button id="multiplayerRoomCreateButton" type="button">+ Create Room</button></div>
                    <div id="multiplayerRoomList"></div>
                    <div class="multiplayerAdvanced">
                        <div id="multiplayerAccountIdentity" class="multiplayerIdentityFields">
                            <div class="multiplayerIdentityNotice">Signed-in players must provide their account username and an in-game nickname.</div>
                            <div class="multiplayerField"><label for="multiplayerUsername">Username</label><input id="multiplayerUsername" maxlength="16" autocomplete="username" spellcheck="false" placeholder="Username"></div>
                            <div class="multiplayerField"><label for="multiplayerNickname">Nickname</label><input id="multiplayerNickname" maxlength="20" autocomplete="nickname" placeholder="Nickname"></div>
                        </div>
                        <div id="multiplayerGuestIdentity" class="multiplayerGuestIdentity">Guest name: <strong id="multiplayerGuestName">Loading…</strong></div>
                        <div class="multiplayerField"><label for="multiplayerRoom">Room Name</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="MyWorld"></div>
                        <div id="multiplayerServerType" role="group" aria-label="Server type"><button id="multiplayerPublic" class="multiplayerTypeButton selected" type="button">PUBLIC</button><button id="multiplayerPrivate" class="multiplayerTypeButton" type="button">PRIVATE</button></div>
                        <div id="multiplayerPrivateCode" class="multiplayerField"><label for="multiplayerPrivateCodeInput">Private Code</label><input id="multiplayerPrivateCodeInput" maxlength="16" autocomplete="off" placeholder="Enter code or leave blank to create"></div>
                        <button id="multiplayerKeepOpen24h" class="multiplayerToggle" type="button" aria-pressed="false"><span class="multiplayerToggleBox">✓</span><span><span class="multiplayerToggleTitle">Keep room open for 24 hours</span><span class="multiplayerToggleHint">When everyone leaves, keep this room and its blocks available for 24 hours.</span></span></button>
                        <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
                        <button id="multiplayerCreateAndJoin" class="multiplayerButton" type="button">Create & Join</button>
                    </div>
                    <div class="multiplayerHint">Public and private servers both work. Private rooms require the correct code.</div>
                    <div id="multiplayerStatus" aria-live="polite"></div>
                </section>
            </div>
            <div id="multiplayerButtons"><button id="multiplayerJoin" class="multiplayerButton" type="button" disabled>Join Room</button><button id="multiplayerBack" class="multiplayerButton" type="button">Back</button></div>
        </div>`;
    overlay.dataset.webminecraftMenuVersion = "rooms-v3";
    document.body.appendChild(overlay);
    window.__webminecraftMultiplayerMenuOverlay = overlay;
    if (!window.__webminecraftMultiplayerMenuGuard) {
        window.__webminecraftMultiplayerMenuGuard = new MutationObserver(() => {
            const canonical = window.__webminecraftMultiplayerMenuOverlay;
            for (const menu of document.querySelectorAll("#multiplayerMenu")) {
                if (menu !== canonical) menu.remove();
            }
        });
        window.__webminecraftMultiplayerMenuGuard.observe(document.body, { childList: true, subtree: true });
    }
    const serverView = overlay.querySelector("#multiplayerServerView"), roomView = overlay.querySelector("#multiplayerRoomView"), serverList = overlay.querySelector("#multiplayerServerList"), serverDetails = overlay.querySelector("#multiplayerServerDetails"), roomCreateButton = overlay.querySelector("#multiplayerRoomCreateButton"), roomList = overlay.querySelector("#multiplayerRoomList"), selectedInfo = overlay.querySelector("#multiplayerSelected"), usernameInput = overlay.querySelector("#multiplayerUsername"), nicknameInput = overlay.querySelector("#multiplayerNickname"), identityFields = overlay.querySelector("#multiplayerAccountIdentity"), guestIdentity = overlay.querySelector("#multiplayerGuestIdentity"), guestNameLabel = overlay.querySelector("#multiplayerGuestName"), roomInput = overlay.querySelector("#multiplayerRoom"), serverInput = overlay.querySelector("#multiplayerServer"), publicButton = overlay.querySelector("#multiplayerPublic"), privateButton = overlay.querySelector("#multiplayerPrivate"), privateCodeWrap = overlay.querySelector("#multiplayerPrivateCode"), privateCodeInput = overlay.querySelector("#multiplayerPrivateCodeInput"), keepOpen24hButton = overlay.querySelector("#multiplayerKeepOpen24h"), status = overlay.querySelector("#multiplayerStatus"), joinButton = overlay.querySelector("#multiplayerJoin"), backButton = overlay.querySelector("#multiplayerBack"), stepServer = overlay.querySelector("#multiplayerStepServer"), stepRoom = overlay.querySelector("#multiplayerStepRoom");
    let selectedServer = null, serverData = [], selectedPrivate = false, keepOpen24h = false;
    let serverRefreshTimer = null;
    let serverLoadInFlight = false;
    let generatedGuestName = "";

    const makeGuestName = () => {
        const adjectives = ["Pixel","Block","Creeper","Stone","Craft","Redstone","Sky","Oak","Ender","Moss"];
        const animals = ["Fox","Wolf","Bee","Bear","Cat","Otter","Panda","Raven","Goat","Frog"];
        const wordA = adjectives[Math.floor(Math.random() * adjectives.length)];
        const wordB = animals[Math.floor(Math.random() * animals.length)];
        const number = Math.floor(100 + Math.random() * 900);
        return `${wordA}${wordB}${number}`.slice(0, 20);
    };

    const getMultiplayerIdentity = () => {
        const user = window.firebase?.auth?.().currentUser || null;
        const username = String(localStorage.getItem("webminecraft-account-username") || "").trim().slice(0, 16);
        const nickname = String(user?.displayName || localStorage.getItem("webminecraft-account-nickname") || "").trim().slice(0, 20);
        return { loggedIn: Boolean(user?.uid), username, nickname };
    };

    const refreshCreateIdentityUi = () => {
        const identity = getMultiplayerIdentity();
        if (identity.loggedIn) {
            identityFields.classList.add("visible");
            guestIdentity.classList.remove("visible");
            usernameInput.value = identity.username;
            nicknameInput.value = identity.nickname;
        } else {
            identityFields.classList.remove("visible");
            guestIdentity.classList.add("visible");
            generatedGuestName = sessionStorage.getItem("webminecraft-guest-name") || generatedGuestName || makeGuestName();
            sessionStorage.setItem("webminecraft-guest-name", generatedGuestName);
            guestNameLabel.textContent = generatedGuestName;
        }
    };

    roomInput.value = localStorage.getItem("webminecraft-room") || "default";
    serverInput.value = defaultServerUrl();
    const setStatus = (text, error = false) => { status.textContent = text; status.style.color = error ? "#ef9a8e" : "#a8ca8e"; status.style.borderLeftColor = error ? "#b96a60" : "#6f8e58"; };
    const setKeepOpen24h = enabled => { keepOpen24h = Boolean(enabled); keepOpen24hButton.classList.toggle("selected", keepOpen24h); keepOpen24hButton.setAttribute("aria-pressed", String(keepOpen24h)); keepOpen24hButton.querySelector(".multiplayerToggleBox").textContent = keepOpen24h ? "✓" : ""; };
    setKeepOpen24h(false);
    const setServerType = isPrivate => { selectedPrivate = Boolean(isPrivate); publicButton.classList.toggle("selected", !selectedPrivate); privateButton.classList.toggle("selected", selectedPrivate); privateCodeWrap.classList.toggle("visible", selectedPrivate); if (!selectedPrivate) privateCodeInput.value = ""; };
    roomCreateButton.addEventListener("click", () => {
        const open = roomView.classList.toggle("create-open");
        const panel = overlay.querySelector("#multiplayerPanel");
        const createTitle = roomView.querySelector(".multiplayerSectionTitle");
        const createHint = roomView.querySelector(".multiplayerSectionHint");
        panel?.classList.toggle("create-server-screen", open);
        roomCreateButton.textContent = open ? "× Cancel" : "+ Create Server";
        if (createTitle) createTitle.textContent = open ? "Create Server" : "Rooms";
        if (createHint) createHint.textContent = open ? "Set up your multiplayer server" : "Choose a room on this live server";
        if (open) {
            roomInput.value = "";
            setServerType(false);
            setKeepOpen24h(false);
            refreshCreateIdentityUi();
            joinButton.disabled = false;
            requestAnimationFrame(() => {
                const identity = getMultiplayerIdentity();
                (identity.loggedIn ? usernameInput : roomInput)?.focus();
            });
        } else {
            roomInput.value = "";
            setKeepOpen24h(false);
            identityFields.classList.remove("visible");
            guestIdentity.classList.remove("visible");
        }
    });
    keepOpen24hButton.addEventListener("click", () => setKeepOpen24h(!keepOpen24h));
    const createAndJoinButton = overlay.querySelector("#multiplayerCreateAndJoin");
    createAndJoinButton.addEventListener("click", () => {
        const roomName = (roomInput.value.trim() || "").slice(0,32);
        if (!roomName) { roomInput.focus(); setStatus("Enter a room name first.", true); return; }
        if (roomName.toLowerCase() === "player") { roomInput.focus(); setStatus("The room name \"player\" is reserved. Choose another room name.", true); return; }
        const identity = getMultiplayerIdentity();
        if (identity.loggedIn) {
            const username = String(usernameInput.value || "").trim().slice(0,16);
            const nickname = String(nicknameInput.value || "").trim().slice(0,20);
            if (!username) { usernameInput.focus(); setStatus("Enter your username.", true); return; }
            if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { usernameInput.focus(); setStatus("Username must be 3–16 characters using letters, numbers, or underscores.", true); return; }
            if (!nickname) { nicknameInput.focus(); setStatus("Enter your nickname.", true); return; }
            localStorage.setItem("webminecraft-account-username", username);
            localStorage.setItem("webminecraft-account-nickname", nickname);
        }
        joinButton.disabled = false;
        joinButton.click();
    });
    publicButton.addEventListener("click", () => setServerType(false));
    privateButton.addEventListener("click", () => setServerType(true));
    const closeServerDetails = () => { selectedServer = null; serverDetails?.classList.remove("open"); serverDetails?.setAttribute("aria-hidden","true"); };
    const showServerView = () => { closeServerDetails(); roomView.classList.remove("roomsStyle","create-open"); overlay.querySelector("#multiplayerPanel")?.classList.remove("rooms-screen","create-server-screen"); identityFields.classList.remove("visible"); guestIdentity.classList.remove("visible"); setServerType(false); roomView.style.display = "none"; serverView.style.display = "block"; joinButton.disabled = true; stepServer.classList.add("active"); stepRoom.classList.remove("active"); setStatus(""); backButton.textContent = "Back"; overlay.querySelector("#multiplayerPanel")?.classList.add("servers-screen"); };
    const renderRoomList = server => { roomList.innerHTML = ""; const rooms = [...(server.rooms || [])].sort((a, b) => String(a.id).localeCompare(String(b.id))); if (!rooms.length) { roomList.innerHTML = '<div class="multiplayerEmpty">No rooms are listed yet. Create one below.</div>'; return; } for (const room of rooms) { const button = document.createElement("button"); button.type = "button"; button.className = "multiplayerCard"; const count = Number(room.players) || 0, max = Number(room.maxPlayers) || 0; const roomIsPrivate = Boolean(room.private || room.isPrivate); button.innerHTML = `<div class="multiplayerRoomPreview" aria-hidden="true"></div><div class="multiplayerCardBody"><div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(room.name || room.id || "Room")}</span><span class="${roomIsPrivate ? "multiplayerOffline" : "multiplayerOnline"}">${roomIsPrivate ? "🔒 PRIVATE" : "● ONLINE"}</span></div><div class="multiplayerMeta">${roomIsPrivate ? "Private room • code required" : "Public room"}<br>${count}${max ? `/${max}` : ""} players online${room.owner ? " · Owner: " + escapeHtml(room.owner) : ""}</div></div><span class="multiplayerCardAction">${roomIsPrivate ? "Select" : "Join"}</span>`; button.addEventListener("click", event => { event.stopPropagation(); roomInput.value = String(room.id || room.name || "default").slice(0, 32); setServerType(roomIsPrivate); joinButton.disabled = false; if (roomIsPrivate) { const code = window.prompt("Enter the private code for this room:"); if (code === null) return; privateCodeInput.value = String(code).trim().slice(0, 16); } joinButton.click(); }); roomList.appendChild(button); } };
    const showRoomView = server => { selectedServer = server; overlay.querySelector("#multiplayerPanel")?.classList.remove("servers-screen","create-server-screen"); overlay.querySelector("#multiplayerPanel")?.classList.add("rooms-screen"); roomView.classList.add("roomsStyle"); roomView.classList.remove("create-open"); identityFields.classList.remove("visible"); guestIdentity.classList.remove("visible"); serverView.style.display = "none"; roomView.style.display = "block"; stepServer.classList.remove("active"); stepRoom.classList.add("active"); serverInput.value = server.websocket || defaultServerUrl(); selectedInfo.innerHTML = `<strong>${escapeHtml(server.name || "Server")}</strong> · ${escapeHtml(server.description || "Multiplayer server")}`; renderRoomList(server); joinButton.disabled = false; setStatus(""); backButton.textContent = "Back to Servers"; };
    const openServerDetails = server => {
        if (!server || !serverDetails) return;
        selectedServer = server;
        const online = server.online !== false;
        serverDetails.innerHTML = `<div class="sw2-inline">
            <div class="sw2-copy">
                <span class="sw2-status${online ? "" : " offline"}">${online ? "● ONLINE" : "○ OFFLINE"}</span>
                <div class="sw2-title">${escapeHtml(server.name || "Server")}</div>
                <div class="sw2-help">${escapeHtml(server.description || "Multiplayer server")} · ${Number(server.players) || 0}${Number(server.maxPlayers) ? "/" + Number(server.maxPlayers) : ""} players online</div>
            </div>
            <button class="sw2-btn sw2-green" type="button" data-server-join ${online ? "" : "disabled"}>Join Server</button>
        </div>`;
        serverDetails.classList.add("open");
        serverDetails.setAttribute("aria-hidden","false");
        const join = serverDetails.querySelector("[data-server-join]");
        join?.addEventListener("click", () => {
            closeServerDetails();
            showRoomView(server);
        });
    };
    const renderServers = servers => { serverData = servers; serverList.innerHTML = ""; if (!servers.length) { serverList.innerHTML = '<div class="multiplayerEmpty">No servers found.</div>'; return; } for (const server of servers) { const button = document.createElement("button"); button.type = "button"; button.className = "multiplayerCard"; const online = server.online !== false; button.innerHTML = `<div class="multiplayerCardPreview" aria-hidden="true"></div><div class="multiplayerCardBody"><div class="multiplayerCardTop"><span class="multiplayerCardName">${escapeHtml(server.name || "Server")}</span><span class="${online ? "multiplayerOnline" : "multiplayerOffline"}">${online ? "● ONLINE" : "○ OFFLINE"}</span></div><div class="multiplayerMeta">${escapeHtml(server.description || "Multiplayer server")} · ${online ? "Ready to join" : "Unavailable"}<br>${Number(server.players) || 0}${Number(server.maxPlayers) ? "/" + Number(server.maxPlayers) : ""} players online</div></div><span class="multiplayerCardAction">${online ? "Join" : "Offline"}</span>`; button.addEventListener("click", () => { if (online) showRoomView(server); }); serverList.appendChild(button); } };
    const fallbackServer = () => ({ name: "Official WebMinecraft Server", description: "Official multiplayer server", online: true, websocket: defaultServerUrl(), rooms: [] });
    const loadServers = async () => {
        if (serverLoadInFlight) return;
        serverLoadInFlight = true;
        try {
            const response = await fetch(`${PRODUCTION_API_URL}/servers`, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const servers = (Array.isArray(data.servers) ? data.servers : []).map(server => ({ ...server, websocket: server.websocket || PRODUCTION_SERVER_URL }));
            renderServers(servers.length ? servers : [fallbackServer()]);
        } catch (error) {
            console.error("Failed to load multiplayer servers:", error);
            if (!serverData.length) renderServers([fallbackServer()]);
            setStatus("Live server list unavailable. The official server is still available.", false);
        } finally {
            serverLoadInFlight = false;
        }
    };
    const startServerAutoRefresh = () => {
        if (serverRefreshTimer) return;
        serverRefreshTimer = setInterval(() => {
            if (overlay.style.display !== "none" && serverView.style.display !== "none") loadServers();
        }, 5000);
    };
    const closeMenu = () => { intentionalDisconnect = true; hideConnectionLostUI(); if (socket) { try { socket.close(); } catch {} socket = null; } remotePlayers.clear(); localPlayerId = null; pendingPlayerAction = "idle"; window.__webminecraftMultiplayerActive = false; window.__webminecraftMultiplayerPlayerId = null; window.__webminecraftMultiplayerRoomInfo = { room: "", serverName: "", websocket: "", private: false }; window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-state-changed")); window.__webminecraftChatHide?.(); overlay.style.display = "none"; overlay.setAttribute("aria-hidden", "true"); showServerView(); setStatus(""); joinButton.disabled = true; joinButton.textContent = "Join Room"; };
    const connect = () => {
        intentionalDisconnect = false;
        hideConnectionLostUI();
        const address = serverInput.value.trim();
        const room = (roomInput.value.trim() || "default").slice(0, 32);
        const privateCode = privateCodeInput.value.trim().slice(0, 16);
        const identity = getMultiplayerIdentity();
        let name = "";
        let username = "";
        let nickname = "";

        if (identity.loggedIn) {
            username = String(usernameInput.value || identity.username || "").trim().slice(0,16);
            nickname = String(nicknameInput.value || identity.nickname || "").trim().slice(0,20);
            if (!username) { setStatus("Enter your username.", true); usernameInput?.focus(); return; }
            if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) { setStatus("Username must be 3–16 characters using letters, numbers, or underscores.", true); usernameInput?.focus(); return; }
            if (!nickname) { setStatus("Enter your nickname.", true); nicknameInput?.focus(); return; }
            name = nickname;
            localStorage.setItem("webminecraft-account-username", username);
            localStorage.setItem("webminecraft-account-nickname", nickname);
        } else {
            generatedGuestName = sessionStorage.getItem("webminecraft-guest-name") || generatedGuestName || makeGuestName();
            sessionStorage.setItem("webminecraft-guest-name", generatedGuestName);
            name = generatedGuestName;
        } if (room.toLowerCase() === "player") return setStatus("The room name \"player\" is reserved. Choose another room name.", true); if (!address) return setStatus("Enter a server address.", true); if (!/^wss?:\/\//i.test(address)) return setStatus("Server address must start with ws:// or wss://.", true); if (!room) return setStatus("Enter a room name.", true); if (socket) { try { socket.close(); } catch {} socket = null; } localStorage.setItem("webminecraft-player-name", name); localStorage.setItem("webminecraft-room", room); joinButton.disabled = true; joinButton.textContent = "Joining..."; setStatus("Connecting to server..."); beginPlayerDataSync(); try { socket = new WebSocket(address); } catch { playerDataSyncActive = false; hidePlayerDataSync(); joinButton.disabled = false; joinButton.textContent = "Join Room"; setStatus("Could not create the connection.", true); return; }
        socket.addEventListener("open", () => { updatePlayerDataSync(28, "Connected. Sending your player data..."); if (isPlayerDataSyncCancelled()) return; setStatus("Connected. Joining room..."); socket.send(JSON.stringify({ type: "join", room, name, username, nickname, authenticated: identity.loggedIn, private: selectedPrivate, privateCode, keepOpen24h, mode: window.__webminecraftMultiplayerMode === "creative" ? "creative" : "survival", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, action: "idle" })); });
        socket.addEventListener("message", event => { let message; try { message = JSON.parse(event.data); } catch { return; } if (message.type === "server_info") setStatus(`Server online. ${message.maxPlayers || "?"} player slots available.`); else if (message.type === "joined") { if (updatePlayerDataSync(55, "Server accepted your player data. Syncing the world...")) return; window.__webminecraftMultiplayerMode = message.mode === "creative" ? "creative" : "survival"; window.webMinecraftSelectedWorldMode = window.__webminecraftMultiplayerMode; document.body.classList.toggle("webminecraft-survival", window.__webminecraftMultiplayerMode === "survival"); document.body.classList.toggle("webminecraft-creative", window.__webminecraftMultiplayerMode === "creative"); localPlayerId = message.playerId || null; localRole = String(message.role || "member").toLowerCase(); if (!["visitor","member","operator"].includes(localRole)) localRole = "member"; localIsHost = Boolean(message.isHost); remotePlayers = new Map((message.players || []).filter(player => player.id !== localPlayerId).map(player => [player.id, player])); window.__webminecraftMultiplayerRole = localRole; window.__webminecraftMultiplayerIsHost = localIsHost; window.__webminecraftMultiplayerActive = true; window.__webminecraftMultiplayerRoomInfo = { room: String(message.room || message.serverRoom || "default"), serverName: String(message.serverName || ""), websocket: String(address), private: Boolean(message.private) }; window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-state-changed")); pendingWorldChanges.clear(); for (const change of message.worldChanges || []) queueWorldChange(change); updatePlayerDataSync(78, "Applying player and world data..."); if (isPlayerDataSyncCancelled()) return; for (const drop of message.worldDrops || []) window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-drop", { detail: drop })); const privateInfo = message.private ? ` · Private code: ${message.privateCode || "use the code you entered"}` : " · Public"; setStatus(`Joined server "${message.serverName || message.room}". Players: ${message.players?.length || 1}${privateInfo}.`); joinButton.textContent = "Connected"; startSharedWorld(Number(message.worldSeed) || 0); finishPlayerDataSync(); } else if (message.type === "block_change") { queueWorldChange(message); applyPendingWorldChanges(); } else if (message.type === "block_changes") { for (const change of message.changes || []) queueWorldChange(change); applyPendingWorldChanges(); } else if (message.type === "block_mining") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-mining", { detail: { playerId: String(message.playerId || ""), x: Math.floor(Number(message.x)), y: Math.floor(Number(message.y)), z: Math.floor(Number(message.z)), blockType: Math.floor(Number(message.blockType)), progress: Math.max(0, Math.min(1, Number(message.progress) || 0)) } })); } else if (message.type === "block_mining_stop") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-mining-stop", { detail: { playerId: String(message.playerId || ""), x: Math.floor(Number(message.x)), y: Math.floor(Number(message.y)), z: Math.floor(Number(message.z)) } })); } else if (message.type === "item_drop") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-drop", { detail: message })); } else if (message.type === "item_claimed") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-claimed", { detail: message })); } else if (message.type === "item_removed") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-removed", { detail: message })); } else if (message.type === "item_claim_denied") { window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-claim-denied", { detail: message })); } else if (message.type === "chat_system") { ensureChatUI(); window.__webminecraftChatShow?.(); window.__webminecraftChatAdd?.(String(message.text || ""), true); } else if (message.type === "chat_message") { ensureChatUI(); window.__webminecraftChatShow?.(); window.__webminecraftChatAdd?.(String(message.text || ""), false, String(message.name || "Player"), Boolean(message.isAdmin)); } else if (message.type === "player_joined") { if (message.player?.id && message.player.id !== localPlayerId) { remotePlayers.set(message.player.id, message.player); window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-player-joined", { detail: { playerId: String(message.player.id), player: message.player } })); } } else if (message.type === "player_left") {
                if (message.playerId) { remotePlayers.delete(message.playerId); window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-player-left", { detail: { playerId: String(message.playerId) } })); }
            } else if (message.type === "player_renamed") {
                const renamedId = String(message.playerId || "");
                const newName = String(message.name || "Player").slice(0, 16);
                if (renamedId === String(localPlayerId || "")) {
                    localStorage.setItem("webminecraft-player-name", newName);
                    const nicknameField = document.getElementById("multiplayerNickname");
                    if (nicknameField) nicknameField.value = newName;
                    localStorage.setItem("webminecraft-account-nickname", newName);
                } else if (renamedId) {
                    const existing = remotePlayers.get(renamedId);
                    if (existing) { existing.name = newName; remotePlayers.set(renamedId, existing); }
                }
                window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-player-renamed", { detail: { playerId: renamedId, name: newName } }));
            } else if (message.type === "player_name_changed") {
                const newName = String(message.name || "Player").slice(0, 16);
                localStorage.setItem("webminecraft-player-name", newName);
                const nicknameField = document.getElementById("multiplayerNickname");
                if (nicknameField) nicknameField.value = newName;
                localStorage.setItem("webminecraft-account-nickname", newName);
            } else if (message.type === "world_sync") { if (Number.isFinite(Number(message.worldSeed))) { const currentSeed = Number(message.worldSeed) >>> 0; if (currentSeed !== 0) { setWorldSeed(currentSeed); const seedInput = document.getElementById("seedInput"); if (seedInput && Number(seedInput.value) !== currentSeed) seedInput.value = String(currentSeed); } } for (const change of message.worldChanges || []) queueWorldChange(change); for (const drop of message.worldDrops || []) window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-item-drop", { detail: drop })); applyPendingWorldChanges(); } else if (message.type === "player_states") { for (const player of message.players || []) { if (player.id === localPlayerId) continue; remotePlayers.set(player.id, player); } } else if (message.type === "role_changed") { localRole = ["visitor","member","operator"].includes(String(message.role).toLowerCase()) ? String(message.role).toLowerCase() : "member"; window.__webminecraftMultiplayerRole = localRole; document.body.classList.toggle("webminecraft-visitor", localRole === "visitor"); window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-role-changed", { detail: { role: localRole } })); window.__webMinecraftChatAdd?.(String(message.reason || "Your server permission changed."), true); } else if (message.type === "player_role_changed") { const existing = remotePlayers.get(String(message.playerId)); if (existing) { existing.role = message.role; remotePlayers.set(String(message.playerId), existing); } window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-player-role-changed", { detail: message })); } else if (message.type === "teleport_player") { const camera = window.__webminecraftCamera; if (camera?.position) { camera.position.set(Number(message.x) || 0, Number(message.y) || 0, Number(message.z) || 0); window.dispatchEvent(new CustomEvent("webminecraft:player-teleported")); } } else if (message.type === "set_gamemode") { const mode = message.mode === "creative" ? "creative" : "survival"; window.__webminecraftMultiplayerMode = mode; document.body.classList.toggle("webminecraft-survival", mode === "survival"); document.body.classList.toggle("webminecraft-creative", mode === "creative"); window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-gamemode-changed", { detail: { mode } })); } else if (message.type === "admin_give") { const itemId = Math.floor(Number(message.itemId)); const count = Math.max(1, Math.min(64, Math.floor(Number(message.count) || 1))); if (Number.isFinite(itemId) && itemId >= 1 && itemId <= 184) { addItem(itemId, count); window.__webMinecraftChatAdd?.("Received " + count + " item" + (count === 1 ? "" : "s") + " (ID " + itemId + ").", true); } } else if (message.type === "server_kick") { window.__webMinecraftChatAdd?.(String(message.reason || "You were removed from the server."), true); try { socket?.close(); } catch {} } else if (message.type === "save_and_quit_ack") {
            const pending = pendingSaveAndQuit;
            pendingSaveAndQuit = null;
            pending?.resolve(Boolean(message.ok));
        } else if (message.type === "error") { playerDataSyncActive = false; hidePlayerDataSync(); setStatus(message.message || "Server error.", true); joinButton.disabled = false; joinButton.textContent = "Join Room"; if (message.code === "private_code_required") { setServerType(true); privateCodeInput.value = ""; requestAnimationFrame(() => privateCodeInput.focus()); } } });
        socket.addEventListener("close", () => {
            const lostConnection = Boolean(window.__webminecraftMultiplayerActive) && !intentionalDisconnect;
            if (pendingSaveAndQuit) {
                const pending = pendingSaveAndQuit;
                pendingSaveAndQuit = null;
                pending.resolve(false);
            }
            playerDataSyncActive = false; hidePlayerDataSync(); localRole = "member"; localIsHost = false; window.__webminecraftMultiplayerRole = "member"; window.__webminecraftMultiplayerIsHost = false; document.body.classList.remove("webminecraft-visitor"); if (window.__webminecraftMultiplayerActive) setStatus("Disconnected from server.", true); window.__webminecraftChatHide?.(); joinButton.disabled = false; joinButton.textContent = "Join Room"; socket = null; window.__webminecraftMultiplayerActive = false; window.__webminecraftMultiplayerRole = "member"; window.__webminecraftMultiplayerIsHost = false; window.__webminecraftMultiplayerRoomInfo = { room: "", serverName: "", websocket: "", private: false }; window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-state-changed")); if (lostConnection) showConnectionLostUI(); });
        socket.addEventListener("error", () => setStatus("Multiplayer connection failed.", true));
    };
    joinButton.addEventListener("click", connect); backButton.addEventListener("click", () => { if (roomView.style.display !== "none") showServerView(); else closeMenu(); });
    window.addEventListener("keydown", event => { if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return; if (!isMultiplayerActive()) return; if (event.key === "/") { event.preventDefault(); event.stopImmediatePropagation(); openChatInput("/"); return; } if (event.key === "Enter" || event.key.toLowerCase() === "t") { event.preventDefault(); event.stopImmediatePropagation(); openChatInput(); } }, true);
    window.addEventListener("beforeunload", () => { intentionalDisconnect = true; if (socket) { try { socket.close(); } catch {} } });
    overlay.addEventListener("click", event => { if (event.target === overlay) showServerView(); });
    startServerAutoRefresh();
    loadServers();
}

function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }

export function isMultiplayerActive() { return Boolean(window.__webminecraftMultiplayerActive && socket && socket.readyState === WebSocket.OPEN); }
export function sendPlayerState(position, rotation, heldItemId = 0, action = null, sneaking = false) { if (!isMultiplayerActive()) return; const outgoingAction = pendingPlayerAction !== "idle" ? pendingPlayerAction : (action || "idle"); pendingPlayerAction = "idle"; socket.send(JSON.stringify({ type: "player_state", position: { x: Number(position?.x) || 0, y: Number(position?.y) || 0, z: Number(position?.z) || 0 }, rotation: { x: Number(rotation?.x) || 0, y: Number(rotation?.y) || 0, z: Number(rotation?.z) || 0 }, heldItemId: Math.max(0, Math.floor(Number(heldItemId) || 0)), sneaking: Boolean(sneaking), action: ["idle", "walk", "mine", "place", "jump"].includes(outgoingAction) ? outgoingAction : "idle" })); }
export function sendPlayerAction(action) { if (["mine", "place", "jump"].includes(action)) pendingPlayerAction = action; }
export function sendBlockChange(x, y, z, blockType) { if (!isMultiplayerActive()) return; socket.send(JSON.stringify({ type: "block_change", x: Math.floor(x), y: Math.floor(y), z: Math.floor(z), blockType: Math.floor(blockType) })); }
export function sendSlabPlacement(x, y, z, blockType) {
    if (!isMultiplayerActive()) return;
    const type = Math.floor(Number(blockType));
    if (!Number.isFinite(type) || type < 51 || type > 74) return;
    socket.send(JSON.stringify({ type: "slab_place", x: Math.floor(x), y: Math.floor(y), z: Math.floor(z), blockType: type }));
}
export function sendBlockChanges(changes) {
    if (!isMultiplayerActive() || !Array.isArray(changes) || changes.length === 0) return;
    const normalized = changes.map(change => ({ x: Math.floor(change.x), y: Math.floor(change.y), z: Math.floor(change.z), blockType: Math.floor(change.blockType ?? change.type) }))
        .filter(change => [change.x, change.y, change.z, change.blockType].every(Number.isFinite));
    if (!normalized.length) return;
    socket.send(JSON.stringify({ type: "block_changes", changes: normalized }));
}
export function sendMiningProgress(x, y, z, blockType, progress) { if (!isMultiplayerActive()) return; socket.send(JSON.stringify({ type: "block_mining", x: Math.floor(x), y: Math.floor(y), z: Math.floor(z), blockType: Math.floor(blockType), progress: Math.max(0, Math.min(1, Number(progress) || 0)) })); }
export function sendMiningStop(x, y, z) { if (!isMultiplayerActive()) return; socket.send(JSON.stringify({ type: "block_mining_stop", x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) })); }
export function sendItemDrop(drop) { if (!isMultiplayerActive() || !drop) return; socket.send(JSON.stringify({ type: "item_drop", id: String(drop.id || ""), itemType: Math.floor(Number(drop.itemType)), count: Math.max(1, Math.floor(Number(drop.count) || 1)), x: Number(drop.x) || 0, y: Number(drop.y) || 0, z: Number(drop.z) || 0, velocityX: Number(drop.velocityX) || 0, velocityY: Number(drop.velocityY) || 0, velocityZ: Number(drop.velocityZ) || 0 })); }
export function sendItemClaim(dropId) { if (!isMultiplayerActive() || !dropId) return; socket.send(JSON.stringify({ type: "item_claim", id: String(dropId) })); }
export function syncWorldChanges() { if (isMultiplayerActive()) applyPendingWorldChanges(); }
export function getRemotePlayers() { return remotePlayers; }
export function openMultiplayerMenu() { ensureMenu(); document.querySelectorAll("#multiplayerMenu").forEach(element => { if (element !== overlay) element.remove(); }); const stalePlayerPanel = document.getElementById("globalPlayerPanel"); const stalePlayerCount = document.getElementById("globalPlayerCount"); if (stalePlayerPanel) stalePlayerPanel.style.setProperty("display","none","important"); if (stalePlayerCount) stalePlayerCount.style.setProperty("display","none","important"); overlay.style.display = "flex"; overlay.setAttribute("aria-hidden", "false"); roomView?.classList.remove("roomsStyle","create-open"); overlay.querySelector("#multiplayerPanel")?.classList.remove("rooms-screen"); overlay.querySelector("#multiplayerPanel")?.classList.add("servers-screen"); }
export function joinMultiplayerRoomFromInvite(details = {}) {
    ensureMenu();
    const server = overlay?.querySelector("#multiplayerServer");
    const room = overlay?.querySelector("#multiplayerRoom");
    const publicButton = overlay?.querySelector("#multiplayerPublic");
    const privateButton = overlay?.querySelector("#multiplayerPrivate");
    const joinButton = overlay?.querySelector("#multiplayerJoin");
    if (!server || !room || !joinButton) return false;
    const websocket = String(details.websocket || "").trim();
    const roomName = String(details.room || "default").trim().slice(0, 32);
    if (!websocket || !/^wss?:\/\//i.test(websocket) || !roomName || roomName.toLowerCase() === "player") return false;
    window.__webminecraftMultiplayerMode = String(details.mode || "survival").toLowerCase() === "creative" ? "creative" : "survival";
    server.value = websocket;
    room.value = roomName;
    if (details.private) privateButton?.click(); else publicButton?.click();
    if (details.private) {
        const code = String(details.privateCode || "").trim().slice(0, 16);
        const codeInput = overlay.querySelector("#multiplayerPrivateCodeInput");
        if (codeInput) codeInput.value = code;
    }
    openMultiplayerMenu();
    requestAnimationFrame(() => {
        joinButton.disabled = false;
        joinButton.click();
    });
    return true;
}

export function sendServerControl(action, details = {}) {
    if (!isMultiplayerActive()) return false;
    const payload = { type: "server_control", action: String(action || ""), ...details };
    try { socket.send(JSON.stringify(payload)); return true; } catch { return false; }
}

export function saveMultiplayerAndQuit(timeoutMs = 2500) {
    if (!isMultiplayerActive()) return Promise.resolve(false);
    if (pendingSaveAndQuit) return pendingSaveAndQuit.promise;

    let timer = null;
    let resolvePromise = null;
    const promise = new Promise(resolve => {
        resolvePromise = resolve;
        pendingSaveAndQuit = {
            promise,
            resolve: resolvePromise
        };
    });

    timer = setTimeout(() => {
        if (pendingSaveAndQuit?.promise !== promise) return;
        pendingSaveAndQuit = null;
        resolvePromise(false);
    }, Math.max(500, Number(timeoutMs) || 2500));

    const originalResolve = resolvePromise;
    pendingSaveAndQuit.resolve = ok => {
        clearTimeout(timer);
        originalResolve(Boolean(ok));
    };

    try {
        socket.send(JSON.stringify({ type: "save_and_quit" }));
    } catch {
        pendingSaveAndQuit = null;
        clearTimeout(timer);
        return Promise.resolve(false);
    }

    return promise;
}

window.__webminecraftSendServerControl = sendServerControl;
window.__webminecraftSaveMultiplayerAndQuit = saveMultiplayerAndQuit;
