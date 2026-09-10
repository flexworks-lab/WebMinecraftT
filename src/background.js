import "./welcome.js";
import "./playerList.js";

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
#savedWorldsBody {
    background:rgba(0,0,0,.08);
}
`;
    document.head.appendChild(style);
}

function setupMenuAndMobileUi() {
    const style = document.createElement("style");
    style.id = "webMinecraftMenuUiFixes";
    style.textContent = `
#newsButton {
    position:fixed !important;
    left:28px !important;
    bottom:28px !important;
    width:118px !important;
    margin:0 !important;
    z-index:97 !important;
}
#globalPlayerCount {
    left:auto !important;
    right:28px !important;
    bottom:28px !important;
    width:142px !important;
    min-height:48px !important;
    text-align:center !important;
}
#globalPlayerPanel {
    left:auto !important;
    right:28px !important;
    bottom:88px !important;
}
#mobileModeButton {
    margin-top:12px !important;
    background:linear-gradient(#536b82,#3e5265) !important;
    border-color:#111 !important;
    box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -2px -3px 0 rgba(0,0,0,.3),0 3px 0 rgba(0,0,0,.72) !important;
}
#mobileModeButton:hover,#mobileModeButton:focus-visible {
    background:linear-gradient(#617c96,#496178) !important;
}
#mobileModeButton.mobileOn {
    background:linear-gradient(#6d8d4e,#526f3c) !important;
}
#mobileModeButton.mobileOn:hover,#mobileModeButton.mobileOn:focus-visible {
    background:linear-gradient(#7da65a,#5f8145) !important;
}
#mobileModeButton::before { content:"▣ "; }
`;
    document.head.appendChild(style);

    const settingsButton = document.getElementById("settingsButton");
    const mainMenu = document.getElementById("mainMenu");
    const mobileModeButton = document.getElementById("mobileModeButton");
    if (!settingsButton || !mainMenu) return;

    const isMobileMode = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("mobile") === "1" || params.get("mode") === "mobile";
    };

    const syncSettingsVisibility = () => {
        const menuVisible = getComputedStyle(mainMenu).display !== "none";
        const gameRunning = !menuVisible;
        settingsButton.style.display = menuVisible || (gameRunning && isMobileMode()) ? "block" : "none";
    };

    const syncMobileButton = () => {
        if (!mobileModeButton) return;
        const enabled = isMobileMode();
        mobileModeButton.classList.toggle("mobileOn", enabled);
        mobileModeButton.textContent = enabled ? "Mobile Mode: ON" : "Mobile Mode";
        mobileModeButton.title = enabled ? "Switch back to desktop controls" : "Use touch-friendly mobile controls";
        mobileModeButton.setAttribute("aria-pressed", String(enabled));
    };

    syncSettingsVisibility();
    syncMobileButton();

    const observer = new MutationObserver(() => {
        syncSettingsVisibility();
        syncMobileButton();
    });
    observer.observe(mainMenu, { attributes:true, attributeFilter:["style", "class"] });
    observer.observe(settingsButton, { attributes:true, attributeFilter:["style", "class"] });
};

function init() {
    applyDirtBackgrounds();
    setupMenuAndMobileUi();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once:true });
} else {
    init();
}
