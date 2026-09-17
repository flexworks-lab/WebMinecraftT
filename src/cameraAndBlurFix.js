// Remove UI background blur and disable manual touch/mouse camera look.
(function installCameraAndBlurFix() {
    if (window.__webMinecraftCameraAndBlurFix) return;
    window.__webMinecraftCameraAndBlurFix = true;

    const style = document.createElement("style");
    style.id = "webMinecraftCameraAndBlurFix";
    style.textContent = `
#accountModal,#devControlsModal,#discussionModal,#welcomeOverlay,#welcomeModal,.modalOverlay{
    -webkit-backdrop-filter:none!important;
    backdrop-filter:none!important;
}
`;
    document.head.appendChild(style);

    // Mobile touch look remains available for tapping blocks, but finger movement
    // no longer changes the camera yaw/pitch.
    document.addEventListener("pointermove", event => {
        if (!document.body.classList.contains("mobile-mode")) return;
        if (event.pointerType !== "touch") return;
        if (!event.target?.closest?.("#touchLookArea")) return;
        event.stopPropagation();
    }, true);

    // The game does not use mouse movement for gameplay camera rotation. Keep
    // mouse movement from being interpreted as a touch-style look gesture.
    document.addEventListener("mousemove", event => {
        if (document.body.classList.contains("mobile-mode")) return;
        const lookArea = document.getElementById("touchLookArea");
        if (lookArea && event.target === lookArea) event.stopPropagation();
    }, true);
})();
