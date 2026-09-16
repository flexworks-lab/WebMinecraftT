import { setWorldMode } from "./survivalMode.js";

const STORAGE_KEY = "webminecraft-multiplayer-game-mode";
const VALID_MODES = new Set(["survival", "creative"]);

function normalizeMode(mode) {
    return VALID_MODES.has(String(mode)) ? String(mode) : "survival";
}

function getStoredMode() {
    try {
        return normalizeMode(localStorage.getItem(STORAGE_KEY));
    } catch {
        return "survival";
    }
}

function applyMode(mode, seed = null) {
    const value = normalizeMode(mode);
    window.__webminecraftMultiplayerMode = value;
    window.webMinecraftSelectedWorldMode = value;
    document.body.classList.toggle("webminecraft-survival", value === "survival");
    document.body.classList.toggle("webminecraft-creative", value === "creative");
    if (seed !== null && Number.isFinite(Number(seed))) setWorldMode(seed, value);
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode: value } }));
}

function saveMode(mode) {
    const value = normalizeMode(mode);
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
    applyMode(value);
}

function buildModePicker(container) {
    if (!container || document.getElementById("multiplayerGameModePicker")) return;

    const field = document.createElement("div");
    field.className = "multiplayerField";
    field.id = "multiplayerGameModePicker";
    field.innerHTML = `
        <label>Game Mode</label>
        <div class="multiplayerGameModeButtons" role="radiogroup" aria-label="Game mode">
            <button id="multiplayerSurvivalMode" class="multiplayerTypeButton" type="button" role="radio" aria-checked="false">SURVIVAL</button>
            <button id="multiplayerCreativeMode" class="multiplayerTypeButton" type="button" role="radio" aria-checked="false">CREATIVE</button>
        </div>
        <div class="multiplayerHint">Choose the mode for a new room. Players joining the room use its saved mode.</div>
    `;
    const style = document.createElement("style");
    style.id = "multiplayerGameModeStyles";
    style.textContent = `
        .multiplayerGameModeButtons{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .multiplayerGameModeButtons .multiplayerTypeButton{margin:0}
        .multiplayerGameModeButtons .multiplayerTypeButton.modeDisabled{opacity:.62;cursor:default}
    `;
    document.head.appendChild(style);

    const serverField = container.querySelector("#multiplayerServer")?.closest(".multiplayerField");
    if (serverField) container.insertBefore(field, serverField);
    else container.appendChild(field);

    const survivalButton = field.querySelector("#multiplayerSurvivalMode");
    const creativeButton = field.querySelector("#multiplayerCreativeMode");

    const render = () => {
        const current = normalizeMode(window.__webminecraftMultiplayerMode || getStoredMode());
        survivalButton.classList.toggle("selected", current === "survival");
        creativeButton.classList.toggle("selected", current === "creative");
        survivalButton.setAttribute("aria-checked", String(current === "survival"));
        creativeButton.setAttribute("aria-checked", String(current === "creative"));
    };

    survivalButton.addEventListener("click", () => saveMode("survival"));
    creativeButton.addEventListener("click", () => saveMode("creative"));
    window.addEventListener("webminecraft-modechange", render);
    render();
}

function watchMultiplayerMenu() {
    const tryBuild = () => {
        const advanced = document.querySelector("#multiplayerRoomView .multiplayerAdvanced");
        if (advanced) buildModePicker(advanced);
    };
    const observer = new MutationObserver(tryBuild);
    observer.observe(document.body, { childList: true, subtree: true });
    tryBuild();
}

function installWebSocketModeBridge() {
    if (window.__webminecraftMultiplayerModeBridgeInstalled || !window.WebSocket) return;
    window.__webminecraftMultiplayerModeBridgeInstalled = true;

    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
        if (typeof data === "string") {
            try {
                const message = JSON.parse(data);
                if (message && message.type === "join") {
                    message.mode = normalizeMode(window.__webminecraftMultiplayerMode || getStoredMode());
                    data = JSON.stringify(message);
                }
            } catch {}
        }
        return originalSend.call(this, data);
    };

    const originalAddEventListener = WebSocket.prototype.addEventListener;
    WebSocket.prototype.addEventListener = function(type, listener, options) {
        if (type !== "message" || typeof listener !== "function") {
            return originalAddEventListener.call(this, type, listener, options);
        }
        const wrapped = event => {
            try {
                const message = JSON.parse(event.data);
                if (message?.type === "joined") {
                    const mode = normalizeMode(message.mode || window.__webminecraftMultiplayerMode || getStoredMode());
                    applyMode(mode, message.worldSeed);
                    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
                }
            } catch {}
            return listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrapped, options);
    };
}

applyMode(getStoredMode());
installWebSocketModeBridge();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchMultiplayerMenu, { once: true });
else watchMultiplayerMenu();
