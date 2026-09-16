export * from "./worldsV2.js";

// Early menu fixes: keep the menu camera fully automatic and keep the News
// button hidden until its final fixed position is applied, preventing the
// startup teleport caused by later menu layout code.
(function installEarlyMenuFixes(){
    if (window.__webminecraftEarlyMenuFixes) return;
    window.__webminecraftEarlyMenuFixes = true;

    const style = document.createElement("style");
    style.id = "webMinecraftEarlyMenuFixes";
    style.textContent = `
#newsButton{
    position:fixed !important;
    left:28px !important;
    bottom:28px !important;
    width:118px !important;
    margin:0 !important;
    z-index:97 !important;
    visibility:hidden !important;
}
@media(max-width:560px){
    #newsButton{
        left:12px !important;
        bottom:18px !important;
        width:calc(50vw - 18px) !important;
    }
}
`;
    (document.head || document.documentElement).appendChild(style);

    const syncNewsButton = () => {
        const button = document.getElementById("newsButton");
        if (!button) return;
        const mobile = window.innerWidth <= 560;
        button.style.position = "fixed";
        button.style.left = mobile ? "12px" : "28px";
        button.style.bottom = mobile ? "18px" : "28px";
        button.style.width = mobile ? "calc(50vw - 18px)" : "118px";
        button.style.margin = "0";
        button.style.zIndex = "97";
        button.style.visibility = "visible";
    };

    const observer = new MutationObserver(() => {
        if (document.getElementById("newsButton")) syncNewsButton();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
    syncNewsButton();
    window.addEventListener("resize", syncNewsButton, { passive:true });

    window.addEventListener("pointermove", event => {
        const menu = document.getElementById("mainMenu");
        if (!menu || getComputedStyle(menu).display === "none") return;
        event.stopImmediatePropagation();
    }, true);
})();