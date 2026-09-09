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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyDirtBackgrounds, { once:true });
} else {
    applyDirtBackgrounds();
}
