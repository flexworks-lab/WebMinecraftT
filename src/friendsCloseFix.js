// Keep closing Friends from bubbling into the Account button handler or reopening Account.
(function installFriendsCloseFix() {
    if (window.__webMinecraftFriendsCloseFix) return;
    window.__webMinecraftFriendsCloseFix = true;

    let ignoreAccountUntil = 0;

    function hideAccountUi() {
        const accountModal = document.getElementById("accountModal");
        if (accountModal) accountModal.style.display = "none";
    }

    function handleFriendsClose(event) {
        const closeButton = event.target?.closest?.("#friendsClose");
        if (!closeButton) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        ignoreAccountUntil = Date.now() + 900;
        document.getElementById("friendsModal")?.classList.remove("open");
        hideAccountUi();
    }

    // Intercept every pointer/click phase before other UI handlers see the close action.
    ["pointerdown", "mousedown", "touchstart", "pointerup", "mouseup", "touchend", "click"].forEach(type => {
        document.addEventListener(type, handleFriendsClose, true);
    });

    // Suppress a delayed Account-button event during the close transition.
    ["pointerdown", "mousedown", "touchstart", "pointerup", "mouseup", "touchend", "click"].forEach(type => {
        document.addEventListener(type, event => {
            if (Date.now() >= ignoreAccountUntil) return;
            if (!event.target?.closest?.("#accountButton")) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            hideAccountUi();
        }, true);
    });

    // Guard against an Account handler that opens its modal asynchronously.
    const guard = () => {
        if (Date.now() < ignoreAccountUntil) hideAccountUi();
        window.requestAnimationFrame(guard);
    };
    window.requestAnimationFrame(guard);
})();
