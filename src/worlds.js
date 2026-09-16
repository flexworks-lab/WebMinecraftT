export * from "./worldsV2.js";

// Early menu fixes: keep the menu camera fully automatic and prevent the News
// button from appearing in its old in-flow position before layout fixes load.
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

    window.addEventListener("pointermove", event => {
        const menu = document.getElementById("mainMenu");
        if (!menu || getComputedStyle(menu).display === "none") return;
        event.stopImmediatePropagation();
    }, true);
})();
