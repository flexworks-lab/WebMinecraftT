let started = false;
let forwardingCreativeClick = false;

function multiplayerActive() {
    return window.__webminecraftMultiplayerActive === true;
}

function creativeActive() {
    return multiplayerActive() && document.body.classList.contains("webminecraft-creative");
}

function forceGameplayState() {
    if (!multiplayerActive()) return;

    document.body.classList.add("webminecraft-in-world", "webminecraft-multiplayer");

    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.setProperty("display", "none", "important");

    const hiddenIds = ["seedMenu", "multiplayerMenu", "accountButton", "newsButton", "friendsButton", "globalPlayerPanel", "menuUpdates", "devControlsButton", "menuButtons", "playButton", "multiplayerButton"];
    for (const id of hiddenIds) {
        document.getElementById(id)?.style.setProperty("display", "none", "important");
    }

    document.getElementById("crosshair")?.style.setProperty("display", "block", "important");
    document.getElementById("webMinecraftCrosshair")?.style.setProperty("display", "block", "important");
    document.getElementById("hotbar")?.style.setProperty("display", "flex", "important");

    const held = document.getElementById("heldBlock3DCanvas");
    if (held) held.style.setProperty("display", "block", "important");

    const touch = document.getElementById("touchControls");
    if (touch) {
        const mobile = document.body.classList.contains("mobile-mode");
        touch.style.setProperty("display", mobile ? "block" : "none", "important");
    }
}

function installCreativeInputBridge() {
    if (started) return;
    started = true;

    document.addEventListener("mousedown", event => {
        if (!creativeActive() || forwardingCreativeClick || event.button !== 0) return;
        if (event.target instanceof Element && event.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a")) return;

        const canvas = document.querySelector("body > canvas");
        if (!canvas) return;

        if (document.pointerLockElement !== document.body && typeof document.body.requestPointerLock === "function") {
            try { document.body.requestPointerLock(); } catch {}
        }

        // Send the user's click through the normal interaction handler. The
        // original event is stopped so Creative cannot break twice.
        forwardingCreativeClick = true;
        try {
            canvas.dispatchEvent(new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 1,
                clientX: event.clientX,
                clientY: event.clientY
            }));
        } catch {}
        forwardingCreativeClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);

    const style = document.createElement("style");
    style.id = "multiplayerGameplayStateFixStyles";
    style.textContent = `
body.webminecraft-multiplayer #heldBlock3DCanvas{display:block!important;visibility:visible!important;opacity:1!important}
body.webminecraft-multiplayer.webminecraft-creative #touchFly{display:block!important;pointer-events:auto!important}
body.webminecraft-multiplayer.webminecraft-survival #touchFly{display:none!important;pointer-events:none!important}
body.webminecraft-multiplayer #hotbar{visibility:visible!important;opacity:1!important}
body.webminecraft-multiplayer #webMinecraftCrosshair{visibility:visible!important;opacity:1!important}
`;
    document.head.appendChild(style);

    setInterval(forceGameplayState, 100);
    forceGameplayState();
}

installCreativeInputBridge();
