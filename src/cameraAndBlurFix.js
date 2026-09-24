// Keep the UI blur removed, but let the normal game controls own camera movement.
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
})();
