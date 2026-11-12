import { saveCurrentWorld } from "../world/worldSave.js";
import { leaveMultiplayerSession } from "../multiplayer/multiplayerClient.js";

let pauseMenu = null;
let pauseStatus = null;
let saveQuitButton = null;
let leaveButton = null;
let sessionWasMultiplayer = false;

function isVisible(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none"
        && style.visibility !== "hidden"
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0;
}

function hasAnotherMenuOpen() {
    const selectors = [
        "#settingsMenu", "#inventoryScreen", "#survivalInventoryScreen",
        "#craftingTableScreen", "#friendsModal", "#newsCenter",
        "#accountModal", "#welcomeScreen", "#devControlsPanel",
        "#bugReportModal", "#multiplayerMenu"
    ];
    return selectors.some(selector => isVisible(document.querySelector(selector)));
}

function installStyles() {
    if (document.getElementById("webMinecraftPauseMenuStyles")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftPauseMenuStyles";
    style.textContent = `
#pauseMenu{
    position:fixed;inset:0;z-index:900000;display:none;align-items:center;justify-content:center;
    padding:20px;box-sizing:border-box;background:rgba(0,0,0,.58);color:#fff;
    font-family:Arial,sans-serif;image-rendering:pixelated
}
#pauseMenu[aria-hidden="false"]{display:flex}
#pauseMenuPanel{
    width:min(430px,calc(100vw - 32px));max-height:calc(100dvh - 40px);overflow:auto;
    padding:24px;background:rgba(45,45,45,.97);border:3px solid #111;
    border-top-color:#888;border-left-color:#888;box-shadow:7px 7px 0 rgba(0,0,0,.58);
    box-sizing:border-box;text-align:center
}
#pauseMenuTitle{
    margin:0 0 20px;color:#fff;font-family:MinecraftFont,monospace;
    font-size:clamp(22px,4vw,30px);font-weight:700;letter-spacing:.4px;
    text-shadow:3px 3px 0 #222
}
.pauseMenuButtons{display:flex;flex-direction:column;gap:10px}
.pauseMenuButton{
    display:block;width:100%;min-height:48px;padding:10px 14px;box-sizing:border-box;
    border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;
    background:linear-gradient(#737373,#4b4b4b);color:#fff;
    font:13px MinecraftFont,monospace;text-shadow:2px 2px #222;
    box-shadow:inset 2px 2px rgba(255,255,255,.12),inset -2px -2px rgba(0,0,0,.3),0 3px #171717;
    cursor:pointer
}
.pauseMenuButton:hover:not(:disabled){filter:brightness(1.13)}
.pauseMenuButton:active:not(:disabled){transform:translateY(2px);box-shadow:inset 2px 2px rgba(0,0,0,.22),0 1px #171717}
.pauseMenuButton:disabled{opacity:.55;cursor:wait}
#pauseMenuLeave{background:linear-gradient(#865050,#623a3a);border-top-color:#c18b8b;border-left-color:#c18b8b}
#pauseMenuSaveQuit{background:linear-gradient(#668a48,#496633);border-top-color:#a6c981;border-left-color:#a6c981}
#pauseMenuStatus{min-height:18px;margin:15px 0 0;color:#c8c8c8;font:12px/1.4 Arial,sans-serif}
@media(max-width:520px){#pauseMenu{padding:12px}#pauseMenuPanel{padding:20px 16px} .pauseMenuButton{min-height:50px}}
`;
    document.head.appendChild(style);
}

function renderActions() {
    const multiplayer = sessionWasMultiplayer || window.__webminecraftMultiplayerActive === true;
    if (leaveButton) leaveButton.hidden = !multiplayer;
    if (saveQuitButton) saveQuitButton.hidden = multiplayer;
    if (pauseStatus) pauseStatus.textContent = "";
}

function close({ relock = true } = {}) {
    if (!pauseMenu) return;
    pauseMenu.style.display = "none";
    pauseMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("webminecraft-game-paused");
    if (relock && !document.body.classList.contains("mobile-mode")
        && document.body.classList.contains("webminecraft-in-world")
        && !hasAnotherMenuOpen()) {
        try { document.body.requestPointerLock?.(); } catch {}
    }
}

function open(event) {
    if (!document.body.classList.contains("webminecraft-in-world")) return;
    if (!pauseMenu) createUI();
    if (hasAnotherMenuOpen()) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();
    renderActions();
    pauseMenu.style.display = "flex";
    pauseMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("webminecraft-game-paused");
    document.exitPointerLock?.();
}

function setBusy(busy, message = "") {
    for (const button of pauseMenu?.querySelectorAll("button") || []) button.disabled = busy;
    if (pauseStatus) pauseStatus.textContent = message;
}

async function saveAndQuit() {
    setBusy(true, "Saving your world...");
    try {
        const savedWorld = await saveCurrentWorld();
        if (!savedWorld) throw new Error("The current single-player world could not be found to save.");
        pauseStatus.textContent = "World saved.";
        sessionWasMultiplayer = false;
        close({ relock: false });
        window.dispatchEvent(new CustomEvent("webminecraft:return-home"));
    } catch (error) {
        setBusy(false, error?.message || "Could not save the world. Try again.");
    }
}

async function leaveServer() {
    setBusy(true, "Leaving server...");
    try {
        await leaveMultiplayerSession();
        sessionWasMultiplayer = false;
        close({ relock: false });
        window.dispatchEvent(new CustomEvent("webminecraft:return-home"));
    } catch (error) {
        setBusy(false, error?.message || "Could not leave the server. Try again.");
    }
}

function openSettings() {
    close({ relock: false });
    const settings = document.getElementById("settingsMenu");
    if (settings) {
        settings.style.display = "flex";
        settings.setAttribute("aria-hidden", "false");
    }
    document.exitPointerLock?.();
}

function createUI() {
    if (pauseMenu) return;
    installStyles();
    pauseMenu = document.getElementById("pauseMenu") || document.createElement("section");
    pauseMenu.id = "pauseMenu";
    pauseMenu.setAttribute("role", "dialog");
    pauseMenu.setAttribute("aria-modal", "true");
    pauseMenu.setAttribute("aria-label", "Game menu");
    pauseMenu.setAttribute("aria-hidden", "true");
    pauseMenu.innerHTML = `
        <div id="pauseMenuPanel">
            <h1 id="pauseMenuTitle">GAME MENU</h1>
            <div class="pauseMenuButtons">
                <button class="pauseMenuButton" id="pauseMenuResume" type="button">BACK TO GAME</button>
                <button class="pauseMenuButton" id="pauseMenuSettings" type="button">SETTINGS</button>
                <button class="pauseMenuButton" id="pauseMenuSaveQuit" type="button">SAVE &amp; QUIT</button>
                <button class="pauseMenuButton" id="pauseMenuLeave" type="button" hidden>LEAVE</button>
            </div>
            <div id="pauseMenuStatus" role="status" aria-live="polite"></div>
        </div>
    `;
    if (!pauseMenu.isConnected) document.body.appendChild(pauseMenu);
    pauseStatus = pauseMenu.querySelector("#pauseMenuStatus");
    saveQuitButton = pauseMenu.querySelector("#pauseMenuSaveQuit");
    leaveButton = pauseMenu.querySelector("#pauseMenuLeave");

    pauseMenu.querySelector("#pauseMenuResume").addEventListener("click", () => close());
    pauseMenu.querySelector("#pauseMenuSettings").addEventListener("click", openSettings);
    saveQuitButton.addEventListener("click", () => void saveAndQuit());
    leaveButton.addEventListener("click", () => void leaveServer());
    pauseMenu.addEventListener("click", event => {
        if (event.target === pauseMenu) close();
    });
}

function init() {
    if (!document.body) return;
    createUI();
    window.webminecraftPause = Object.freeze({
        open,
        close,
        toggle: () => isVisible(pauseMenu) ? close() : open()
    });
}

window.addEventListener("webminecraft:multiplayer-state-changed", () => {
    if (window.__webminecraftMultiplayerActive === true) sessionWasMultiplayer = true;
});
window.addEventListener("webminecraft:return-home", () => {
    sessionWasMultiplayer = false;
    close({ relock: false });
});
window.addEventListener("keydown", event => {
    if (event.key !== "Escape" || event.repeat) return;
    if (!document.body.classList.contains("webminecraft-in-world")) return;
    if (isVisible(pauseMenu)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        return;
    }
    if (hasAnotherMenuOpen()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(event);
}, true);

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
