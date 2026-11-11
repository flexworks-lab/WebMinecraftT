import "../accounts/discussion.js";
import "../ui/welcome.js";
import "../multiplayer/playerList.js";
import "./worldSync.js";
import "../player/mobileFlightControls.js";
import "../ui/uiFixes.js";
import "./waterPhysicsMinecraft.js";
import "./waterTextureFix.js";
import "../inventory/survivalMode.js";
import "../core/performance.js";

function applyDirtBackgrounds() {
    if (document.getElementById("webMinecraftDirtBackgrounds")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftDirtBackgrounds";
    style.textContent = `
#savedWorlds {
    background-color:rgba(32,32,32,.78) !important;
    background-image:none !important;
}
#savedWorldsShell {
    background-color:rgba(42,42,42,.86) !important;
    background-image:none !important;
}
#savedWorldsBody { background:rgba(0,0,0,.03); }
`;
    document.head.appendChild(style);
}

function setupMenuAndMobileUi() {
    if (document.getElementById("webMinecraftMenuUiFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftMenuUiFixes";
    style.textContent = `
#newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:48px !important;height:48px !important;margin:0 !important;z-index:97 !important}
#friendsButton{position:fixed!important;left:84px!important;bottom:28px!important;width:48px!important;height:48px!important;margin:0!important;z-index:98!important}
#globalPlayerCount{left:auto !important;right:28px !important;bottom:28px !important;width:142px !important;min-height:48px !important;text-align:center !important}
#globalPlayerPanel{left:auto !important;right:28px !important;bottom:88px !important}
#mobileModeButton{margin-top:12px !important;background:linear-gradient(#536b82,#3e5265) !important;border-color:#111 !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -2px -3px 0 rgba(0,0,0,.3),0 3px 0 rgba(0,0,0,.72) !important}
#mobileModeButton:hover,#mobileModeButton:focus-visible{background:linear-gradient(#617c96,#496178) !important}
#mobileModeButton.mobileOn{background:linear-gradient(#6d8d4e,#526f3c) !important}
#mobileModeButton.mobileOn:hover,#mobileModeButton.mobileOn:focus-visible{background:linear-gradient(#7da65a,#5f8145) !important}
#mobileModeButton::before{content:"▣ "}

body:not(.webminecraft-in-world) #crosshair,
body:not(.webminecraft-in-world) #hotbar,
body:not(.webminecraft-in-world) #performanceHud,
body:not(.webminecraft-in-world) #touchControls,
body:not(.webminecraft-in-world) #touchAimKnob,
body:not(.webminecraft-in-world) #touchHint{display:none !important}
body.webminecraft-in-world #accountButton,
body.webminecraft-in-world #newsButton,
body.webminecraft-in-world #friendsButton,
body.webminecraft-in-world #globalPlayerPanel,
body.webminecraft-in-world #mainMenu button,
body.webminecraft-in-world #menuButtons,
body.webminecraft-in-world #playButton,
body.webminecraft-in-world #multiplayerButton,
body.webminecraft-in-world #menuSettingsButton,
body.webminecraft-in-world #mobileModeButton,
body.webminecraft-in-world #mainMenu .menuButton,
body.webminecraft-in-world #seedMenu,
body.webminecraft-in-world #menuUpdates{display:none !important}
body.webminecraft-in-world #devControlsButton{display:none !important;visibility:hidden !important;pointer-events:none !important}
body.webminecraft-in-world #webMinecraftMovingClouds{display:none !important}
body.webminecraft-in-world #globalPlayerCount{display:none !important}
#settingsVersion{display:none !important}
#gameVersionButton,#gameVersionPicker{display:none !important}
#webMinecraftMovingClouds{display:none !important}
#touchMovePad{overflow:visible}
@media(max-width:560px){
    #newsButton{left:12px !important;bottom:18px !important;width:48px !important;height:48px !important}
    #friendsButton{left:68px!important;bottom:18px!important;width:48px!important;height:48px!important}
}
@media(max-width:600px){
    #globalPlayerCount{right:12px !important;bottom:76px !important;width:min(180px,calc(100vw - 24px)) !important}
    #globalPlayerPanel{right:12px !important;bottom:144px !important;width:calc(100vw - 24px) !important;max-height:calc(100dvh - 160px) !important}
    #globalPlayerList{max-height:calc(100dvh - 260px) !important}
}
`;
    document.head.appendChild(style);

    const settingsButton = document.getElementById("settingsButton");
    const mainMenu = document.getElementById("mainMenu");
    const mobileModeButton = document.getElementById("mobileModeButton");
    if (!mainMenu) return;

    const isMobileMode = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("mobile") === "1" || params.get("mode") === "mobile";
    };

    const syncNewsButtonPosition = () => {
        const button = document.getElementById("newsButton");
        if (!button) return;
        const mobile = isMobileMode() || window.innerWidth <= 560;
        button.style.position = "fixed";
        button.style.left = mobile ? "12px" : "28px";
        button.style.bottom = mobile ? "18px" : "28px";
        button.style.width = "48px";
        button.style.height = "48px";
        button.style.margin = "0";
        button.style.zIndex = "97";
    };

    const menuButtons = document.getElementById("menuButtons");
    if (menuButtons) {
        new MutationObserver(syncNewsButtonPosition).observe(menuButtons, { childList:true });
    }
    syncNewsButtonPosition();
    window.addEventListener("resize", syncNewsButtonPosition, { passive:true });

    const ensureFriendsButton = () => {
        if (document.getElementById("friendsButton")) return;
        const button = document.createElement("button");
        button.id = "friendsButton";
        button.type = "button";
        button.setAttribute("aria-label", "Friends");
        button.title = "Friends";
        button.dataset.tooltip = "Friends";
        button.innerHTML = '<svg viewBox="0 0 16 16" width="25" height="25" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="1" width="4" height="4" fill="#f0f0f0"/><rect x="9" y="2" width="4" height="4" fill="#c9c9c9"/><rect x="1" y="6" width="8" height="8" fill="#f0f0f0"/><rect x="8" y="7" width="7" height="7" fill="#c9c9c9"/><rect x="4" y="8" width="2" height="2" fill="#555"/><rect x="11" y="9" width="2" height="2" fill="#555"/></svg>';
        button.addEventListener("click", () => {
            const accountButton = document.getElementById("accountButton");
            if (accountButton) accountButton.click();
        });
        document.body.appendChild(button);
    };

    ensureFriendsButton();

    const syncState = () => {
        const menuVisible = getComputedStyle(mainMenu).display !== "none";
        const worldsMenuOpen = document.body.classList.contains("webminecraft-worlds-menu");
        const inWorld = !menuVisible && !worldsMenuOpen;
        document.body.classList.toggle("webminecraft-in-world", inWorld);

        if (settingsButton) {
            settingsButton.style.display = menuVisible || (inWorld && isMobileMode()) ? "block" : "none";
        }
        ensureFriendsButton();
        syncNewsButtonPosition();
    };

    const syncMobileButton = () => {
        if (!mobileModeButton) return;
        const enabled = isMobileMode();
        mobileModeButton.classList.toggle("mobileOn", enabled);
        mobileModeButton.textContent = enabled ? "Desktop Mode" : "Mobile Mode";
        mobileModeButton.title = enabled ? "Switch back to desktop controls" : "Use touch-friendly mobile controls";
        mobileModeButton.setAttribute("aria-pressed", String(enabled));
    };

    syncState();
    syncMobileButton();

    const observer = new MutationObserver(() => {
        syncState();
        syncMobileButton();
    });
    observer.observe(mainMenu, { attributes:true, attributeFilter:["style","class"] });
    if (settingsButton) observer.observe(settingsButton, { attributes:true, attributeFilter:["style","class"] });
}

function init() {
    applyDirtBackgrounds();
    setupMenuAndMobileUi();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
