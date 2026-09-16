import "./discussion.js";
import "./welcome.js";
import "./playerList.js";
import "./worldSync.js";
import "./mobileFlightControls.js";
import "./uiFixes.js";
import "./waterPhysics.js";
import "./waterTextureFix.js";
import "./gameEnhancements.js";
import "./survivalMode.js";
import "./performance.js";

function applyDirtBackgrounds() {
    if (document.getElementById("webMinecraftDirtBackgrounds")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftDirtBackgrounds";
    style.textContent = `
#savedWorlds {
    background-color:rgba(35,24,16,.72) !important;
    background-image:url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsShell {
    background-color:rgba(28,20,14,.82) !important;
    background-image:linear-gradient(rgba(20,14,10,.62),rgba(20,14,10,.82)),url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsBody { background:rgba(0,0,0,.08); }
`;
    document.head.appendChild(style);
}

function setupMenuAndMobileUi() {
    if (document.getElementById("webMinecraftMenuUiFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftMenuUiFixes";
    style.textContent = `
#newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:118px !important;margin:0 !important;z-index:97 !important}
#friendsButton{position:fixed !important;left:158px !important;bottom:28px !important;width:118px !important;height:48px !important;margin:0 !important;z-index:97 !important}
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
body.webminecraft-in-world #devControlsButton{display:none !important}
body.webminecraft-in-world #webMinecraftMovingClouds{display:none !important}
body.webminecraft-in-world #globalPlayerCount{display:none !important}
#settingsVersion{display:none !important}
#gameVersionButton,#gameVersionPicker{display:none !important}
#webMinecraftMovingClouds{display:none !important}
#touchMovePad{overflow:visible}
@media(max-width:560px){
    #newsButton{left:12px !important;bottom:18px !important;width:calc(50vw - 18px) !important}
    #friendsButton{left:calc(50vw + 6px) !important;bottom:18px !important;width:calc(50vw - 18px) !important}
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
        button.style.width = mobile ? "calc(50vw - 18px)" : "118px";
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
        button.textContent = "Friends";
        button.addEventListener("click", () => {
            const accountButton = document.getElementById("accountButton");
            if (accountButton) accountButton.click();
        });
        document.body.appendChild(button);
    };

    ensureFriendsButton();

    const syncState = () => {
        const menuVisible = getComputedStyle(mainMenu).display !== "none";
        const inWorld = !menuVisible;
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
