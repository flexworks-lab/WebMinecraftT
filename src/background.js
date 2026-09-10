import "./welcome.js";

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
`;
    document.head.appendChild(style);

    const settingsButton = document.getElementById("settingsButton");
    const mainMenu = document.getElementById("mainMenu");
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

    syncSettingsVisibility();

    const observer = new MutationObserver(syncSettingsVisibility);
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
