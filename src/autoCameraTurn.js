import { yaw, pitch, resetView } from "./controls.js";

// Turn the camera automatically while the player is in the world.
// Mouse and touch movement stay blocked by cameraAndBlurFix.js.
(function installAutoCameraTurn() {
    if (window.__webMinecraftAutoCameraTurn) return;
    window.__webMinecraftAutoCameraTurn = true;

    const TURN_SPEED = 0.12; // radians per second (~6.9 degrees/sec)
    let lastTime = performance.now();

    const tick = now => {
        const deltaSeconds = Math.min(Math.max((now - lastTime) / 1000, 0), 0.1);
        lastTime = now;

        const mainMenu = document.getElementById("mainMenu");
        const menuHidden = mainMenu && getComputedStyle(mainMenu).display === "none";

        if (!document.hidden && menuHidden) {
            resetView(yaw + TURN_SPEED * deltaSeconds, pitch);
        }

        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
})();
