// Keep closing Friends from bubbling into the Account button handler.
(function installFriendsCloseFix() {
    if (window.__webMinecraftFriendsCloseFix) return;
    window.__webMinecraftFriendsCloseFix = true;

    document.addEventListener("click", event => {
        const closeButton = event.target?.closest?.("#friendsClose");
        if (!closeButton) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const modal = document.getElementById("friendsModal");
        if (modal) modal.classList.remove("open");
    }, true);
})();
