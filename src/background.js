function applyDirtBackgrounds() {
    if (document.getElementById("webMinecraftDirtBackgrounds")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftDirtBackgrounds";
    style.textContent = `
html, body {
    background:#6b4728 url("./textures/dirt.png") repeat;
    background-size:64px 64px;
}
#mainMenu,
#seedMenu,
#settingsMenu,
#savedWorlds {
    background-color:rgba(35,24,16,.72) !important;
    background-image:url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#mainMenu::before {
    background:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.5)),url("./textures/dirt.png") repeat !important;
    background-size:64px 64px !important;
    opacity:.92;
}
#mainMenu::after {
    background:rgba(0,0,0,.18) !important;
    backdrop-filter:blur(1px);
    -webkit-backdrop-filter:blur(1px);
}
#seedPanel,
#settingsPanel,
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDirtBackgrounds, { once:true });
} else {
    applyDirtBackgrounds();
}
