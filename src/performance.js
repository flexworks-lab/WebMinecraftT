const SETTINGS_KEY = "webminecraft-settings";

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

        // Retain the native-ish 1x canvas resolution, but avoid settings saved
        // on a desktop forcing expensive shadow maps onto an iPad.
        if (IS_LOW_POWER_DEVICE) {
            if (settings.pixelRatio == null || settings.pixelRatio > 1) settings.pixelRatio = 1;
            if (settings.shadowQuality == null || settings.shadowQuality > 512) settings.shadowQuality = 512;
        }
        if (IS_TOUCH_DEVICE) settings.shadows = false;

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
}

function pauseWhenHidden() {
    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("webminecraft-tab-hidden", document.hidden);
    }, { passive: true });
}

optimizeSettings();
pauseWhenHidden();
