const SETTINGS_KEY = "webminecraft-settings";

function optimizeSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
        const settings = saved && typeof saved === "object" ? saved : {};
        const cores = navigator.hardwareConcurrency || 4;
        const mobile = matchMedia("(max-width: 700px), (pointer: coarse)").matches;
        const memory = navigator.deviceMemory || 4;
        const lowPower = mobile || cores <= 4 || memory <= 4;

        // Keep the game looking good while avoiding unnecessarily expensive defaults.
        if (lowPower) {
            if (settings.pixelRatio == null || settings.pixelRatio > 1) settings.pixelRatio = 1;
            if (settings.shadowQuality == null || settings.shadowQuality > 768) settings.shadowQuality = 512;
        }
        if (mobile && settings.shadows == null) settings.shadows = false;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
}

function pauseWhenHidden() {
    // Three.js still gets a browser animation frame when visible; this only helps
    // background tabs avoid keeping game-side timers and rendering work alive.
    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("webminecraft-tab-hidden", document.hidden);
    }, { passive: true });
}

optimizeSettings();
pauseWhenHidden();
