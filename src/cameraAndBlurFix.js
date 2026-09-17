import "./autoCameraTurn.js";

// Remove main-menu/UI blur and disable manual mouse/touch camera look.
(function installCameraAndBlurFix() {
    if (window.__webMinecraftCameraAndBlurFix) return;
    window.__webMinecraftCameraAndBlurFix = true;

    const style = document.createElement("style");
    style.id = "webMinecraftCameraAndBlurFix";
    style.textContent = `
#mainMenu,
#mainMenu::after,
#accountModal,#devControlsModal,#discussionModal,#welcomeOverlay,#welcomeModal,.modalOverlay{
    -webkit-backdrop-filter:none!important;
    backdrop-filter:none!important;
    filter:none!important;
}

#mainMenu::after{
    background:transparent!important;
}
`;
    document.head.appendChild(style);

    // Block manual touch camera movement before the game's touch look handler.
    document.addEventListener("pointermove", event => {
        if (event.pointerType !== "touch") return;
        if (!document.body.classList.contains("mobile-mode")) return;
        if (!event.target?.closest?.("#touchLookArea")) return;
        event.stopImmediatePropagation();
    }, true);

    // Block manual mouse camera movement before the game's mouse-look handler.
    document.addEventListener("mousemove", event => {
        if (document.body.classList.contains("mobile-mode")) return;
        event.stopImmediatePropagation();
    }, true);
})();
