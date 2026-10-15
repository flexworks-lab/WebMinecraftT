const SETTINGS_KEY = "webminecraft-settings";
const EXTENDED_SETTINGS_KEY = "webminecraft-settings-v2";

// Safari identifies recent iPads as Macintosh, so touch points are part of
// the detection instead of relying on the user-agent string alone.
export const IS_TOUCH_DEVICE = (() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const appleTouchDevice = navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1;
    const coarsePointer = typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(pointer: coarse)").matches;
    return coarsePointer || appleTouchDevice || /iPad|iPhone|iPod|Android/i.test(ua);
})();

export const IS_LOW_POWER_DEVICE = (() => {
    if (typeof navigator === "undefined") return IS_TOUCH_DEVICE;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = Number(navigator.deviceMemory) || 0;
    return IS_TOUCH_DEVICE || cores <= 4 || (memory > 0 && memory <= 4);
})();

function optimizeSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
        const settings = saved && typeof saved === "object" ? saved : {};

        // Keep the main renderer at a sensible resolution on low-power devices.
        if (IS_LOW_POWER_DEVICE) {
            if (settings.pixelRatio == null || settings.pixelRatio > 1) settings.pixelRatio = 1;
            if (settings.shadowQuality == null || settings.shadowQuality > 512) settings.shadowQuality = 512;
        }
        if (IS_TOUCH_DEVICE) settings.shadows = false;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

        // The game reads its extended graphics preferences from a separate key.
        // Clamp those too, otherwise old desktop settings can undo the mobile caps.
        const extendedSaved = JSON.parse(localStorage.getItem(EXTENDED_SETTINGS_KEY) || "null");
        const extended = extendedSaved && typeof extendedSaved === "object" ? extendedSaved : {};
        if (IS_LOW_POWER_DEVICE) {
            if (extended.pixelRatio == null || Number(extended.pixelRatio) > 1) extended.pixelRatio = 1;
            if (extended.shadowQuality == null || Number(extended.shadowQuality) > 512) extended.shadowQuality = 512;
            if (Number(extended.renderDistance) > 90) extended.renderDistance = 90;
            if (extended.lightingQuality === "high") extended.lightingQuality = "balanced";
        }
        if (IS_TOUCH_DEVICE) {
            extended.shadows = false;
            if (extended.deviceProfile !== "touch") extended.renderDistance = 60;
            extended.deviceProfile = "touch";
        }
        localStorage.setItem(EXTENDED_SETTINGS_KEY, JSON.stringify(extended));
    } catch {}
}

function pauseWhenHidden() {
    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("webminecraft-tab-hidden", document.hidden);
    }, { passive: true });
}

optimizeSettings();
pauseWhenHidden();
