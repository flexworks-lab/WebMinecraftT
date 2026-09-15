const STORAGE_KEY = "webminecraft-settings-v2";

const defaults = {
    shadows: true,
    shadowQuality: 1024,
    pixelRatio: 1,
    lightingQuality: "high",
    brightness: 1,
    fov: 75,
    renderDistance: 120,
    fog: true,
    waterEffects: true,
    crosshair: true,
    hotbar: true,
    performanceHud: false,
    mouseSensitivity: 1,
    touchSensitivity: 1,
    invertY: false,
    reducedMotion: false,
    largeUi: false,
    highContrast: false,
    colorblind: false,
    uiOpacity: 1,
    masterVolume: 1,
    soundEffects: true,
    music: true,
    fullscreen: false,
    pixelated: false,
};

function readSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        return { ...defaults, ...(saved && typeof saved === "object" ? saved : {}) };
    } catch { return { ...defaults }; }
}

let settings = readSettings();

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        localStorage.setItem("webminecraft-settings", JSON.stringify({
            shadows: settings.shadows,
            shadowQuality: settings.shadowQuality,
            pixelRatio: settings.pixelRatio,
            lightingQuality: settings.lightingQuality,
            brightness: settings.brightness,
        }));
        localStorage.setItem("webminecraft-mouse-sensitivity", String(settings.mouseSensitivity));
        localStorage.setItem("webminecraft-touch-sensitivity", String(settings.touchSensitivity));
        localStorage.setItem("webminecraft-invert-y", String(settings.invertY));
    } catch {}
}

function emit(name) {
    window.dispatchEvent(new CustomEvent("webminecraft-setting-changed", {
        detail: { name, value: settings[name], settings: { ...settings } }
    }));
}

function applyUi() {
    document.documentElement.style.setProperty("--ui-opacity", String(settings.uiOpacity));
    document.body.classList.toggle("settings-large-ui", settings.largeUi);
    document.body.classList.toggle("settings-high-contrast", settings.highContrast);
    document.body.classList.toggle("settings-colorblind", settings.colorblind);
    document.body.classList.toggle("settings-reduced-motion", settings.reducedMotion);
    document.body.classList.toggle("settings-pixelated", settings.pixelated);
    const crosshair = document.getElementById("crosshair");
    const hotbar = document.getElementById("hotbar");
    if (crosshair) crosshair.style.visibility = settings.crosshair ? "visible" : "hidden";
    if (hotbar) hotbar.style.visibility = settings.hotbar ? "visible" : "hidden";
    const hud = document.getElementById("performanceHud");
    if (hud) hud.style.visibility = settings.performanceHud ? "visible" : "hidden";
}

function toast(message = "Saved") {
    let el = document.getElementById("settingsToast");
    if (!el) {
        el = document.createElement("div");
        el.id = "settingsToast";
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 1000);
}

function control(id, label, description, type, options) {
    let input = "";
    if (type === "checkbox") input = `<input id="${id}" type="checkbox">`;
    if (type === "range") input = `<input id="${id}" type="range" min="${options[0]}" max="${options[1]}" step="${options[2]}"><output id="${id}Value"></output>`;
    if (type === "select") input = `<select id="${id}">${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}</select>`;
    return `<div class="setting"><div><label for="${id}">${label}</label><small>${description}</small></div><div class="settingControl">${input}</div></div>`;
}

const panels = {
    Graphics: `
        <div class="settingsGroup"><h3>Rendering</h3>
        ${control("sShadows", "Shadows", "Toggle dynamic shadows.", "checkbox")}
        ${control("sShadowQuality", "Shadow Quality", "Higher values look better but use more GPU power.", "select", [[512,"Low"],[1024,"High"],[2048,"Ultra"]])}
        ${control("sPixelRatio", "Render Quality", "Controls the resolution used for 3D rendering.", "select", [[0.75,"Performance"],[1,"Balanced"],[1.25,"Quality"],[1.5,"Ultra"]])}
        ${control("sLighting", "Lighting Quality", "Choose the lighting performance profile.", "select", [["performance","Performance"],["balanced","Balanced"],["high","High"]])}
        ${control("sBrightness", "Brightness", "Adjust scene exposure.", "range", [0.5,1.5,0.05])}
        ${control("sFov", "Field of View", "Change how wide your camera view feels.", "range", [60,110,1])}
        ${control("sRenderDistance", "View Distance", "How far terrain remains visible.", "select", [[60,"Short"],[90,"Normal"],[120,"Far"],[150,"Very Far"],[180,"Extreme"]])}
        ${control("sFog", "Fog", "Enable distance fog.", "checkbox")}
        ${control("sWaterEffects", "Water Effects", "Enable underwater visual effects.", "checkbox")}
        ${control("sPixelated", "Pixelated Mode", "Give the interface a crisp pixel presentation.", "checkbox")}
        </div>`,
    Controls: `
        <div class="settingsGroup"><h3>Mouse & Touch</h3>
        ${control("sMouseSensitivity", "Mouse Sensitivity", "Camera turn speed on desktop.", "range", [0.35,2,0.05])}
        ${control("sTouchSensitivity", "Touch Sensitivity", "Camera turn speed on phones and tablets.", "range", [0.5,2,0.05])}
        ${control("sInvertY", "Invert Y Axis", "Reverse vertical camera movement.", "checkbox")}
        </div>`,
    Audio: `
        <div class="settingsGroup"><h3>Sound</h3>
        ${control("sMasterVolume", "Master Volume", "Overall volume level.", "range", [0,1,0.05])}
        ${control("sSoundEffects", "Sound Effects", "Enable gameplay sound effects.", "checkbox")}
        ${control("sMusic", "Music", "Enable menu and gameplay music.", "checkbox")}
        </div>`,
    Accessibility: `
        <div class="settingsGroup"><h3>Interface</h3>
        ${control("sLargeUi", "Large UI", "Make interface controls easier to read.", "checkbox")}
        ${control("sHighContrast", "High Contrast", "Increase contrast of interface elements.", "checkbox")}
        ${control("sColorblind", "Colorblind-Friendly", "Use a more color-distinct interface palette.", "checkbox")}
        ${control("sUiOpacity", "UI Opacity", "Adjust interface opacity.", "range", [0.5,1,0.05])}
        ${control("sReducedMotion", "Reduced Motion", "Reduce interface animation.", "checkbox")}
        </div>
        <div class="settingsGroup"><h3>HUD</h3>
        ${control("sCrosshair", "Crosshair", "Show the center crosshair.", "checkbox")}
        ${control("sHotbar", "Hotbar", "Show the block hotbar.", "checkbox")}
        ${control("sPerformanceHud", "Performance HUD", "Show FPS and renderer statistics.", "checkbox")}
        </div>`,
    Gameplay: `
        <div class="settingsGroup"><h3>Gameplay</h3>
        ${control("sFullscreen", "Fullscreen", "Enter or leave browser fullscreen.", "checkbox")}
        <div class="setting settingInfo"><div><label>Reset Settings</label><small>Restore every option to its default value.</small></div><div class="settingControl"><button id="resetSettings" type="button">Reset</button></div></div>
        </div>`
};

function applyFullscreen(enabled) {
    if (enabled) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function build() {
    const menu = document.getElementById("settingsMenu");
    if (!menu || menu.dataset.redone === "1") return;
    menu.dataset.redone = "1";
    menu.innerHTML = `
        <div id="settingsPanel" class="settingsRedonePanel">
            <aside id="settingsSidebar"><div class="settingsBrand">SETTINGS</div><div class="settingsHint">WebMinecraftT</div><nav id="settingsTabs"></nav></aside>
            <section id="settingsContent"><header id="settingsHeader"><div><h2 id="settingsSectionTitle">Graphics</h2><span id="settingsSaveHint">Changes save automatically</span></div><button id="settingsCloseTop" type="button" aria-label="Close settings">×</button></header><div id="settingsScroll"></div></section>
        </div>`;

    const tabs = document.getElementById("settingsTabs");
    const scroll = document.getElementById("settingsScroll");
    for (const [name, html] of Object.entries(panels)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "settingsTab";
        button.textContent = name;
        button.addEventListener("click", () => show(name));
        tabs.appendChild(button);
        const section = document.createElement("section");
        section.className = "settingsPage";
        section.dataset.page = name;
        section.innerHTML = html;
        scroll.appendChild(section);
    }

    const bind = (id, key, type, after) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (type === "checkbox") el.checked = !!settings[key];
        if (type === "range" || type === "select") el.value = String(settings[key]);
        const output = document.getElementById(`${id}Value`);
        const updateOutput = () => { if (output) output.textContent = type === "range" ? String(settings[key]) : ""; };
        const changed = () => {
            settings[key] = type === "checkbox" ? el.checked : (type === "range" ? Number(el.value) : el.value);
            save(); applyUi(); after?.(settings[key]); emit(key); updateOutput(); toast();
        };
        el.addEventListener(type === "checkbox" || type === "select" ? "change" : "input", changed);
        updateOutput();
    };

    bind("sShadows", "shadows", "checkbox");
    bind("sShadowQuality", "shadowQuality", "select");
    bind("sPixelRatio", "pixelRatio", "select");
    bind("sLighting", "lightingQuality", "select");
    bind("sBrightness", "brightness", "range");
    bind("sFov", "fov", "range");
    bind("sRenderDistance", "renderDistance", "select");
    bind("sFog", "fog", "checkbox");
    bind("sWaterEffects", "waterEffects", "checkbox");
    bind("sPixelated", "pixelated", "checkbox");
    bind("sMouseSensitivity", "mouseSensitivity", "range");
    bind("sTouchSensitivity", "touchSensitivity", "range");
    bind("sInvertY", "invertY", "checkbox");
    bind("sMasterVolume", "masterVolume", "range");
    bind("sSoundEffects", "soundEffects", "checkbox");
    bind("sMusic", "music", "checkbox");
    bind("sLargeUi", "largeUi", "checkbox");
    bind("sHighContrast", "highContrast", "checkbox");
    bind("sColorblind", "colorblind", "checkbox");
    bind("sUiOpacity", "uiOpacity", "range");
    bind("sReducedMotion", "reducedMotion", "checkbox");
    bind("sCrosshair", "crosshair", "checkbox");
    bind("sHotbar", "hotbar", "checkbox");
    bind("sPerformanceHud", "performanceHud", "checkbox");
    bind("sFullscreen", "fullscreen", "checkbox", applyFullscreen);

    document.getElementById("resetSettings")?.addEventListener("click", () => {
        settings = { ...defaults };
        save();
        menu.dataset.redone = "";
        menu.innerHTML = "";
        build();
        toast("Settings reset");
        window.dispatchEvent(new CustomEvent("webminecraft-settings-reset"));
    });

    document.getElementById("settingsCloseTop")?.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        menu.style.display = "none";
        window.dispatchEvent(new Event("webminecraft-close-settings"));
    });

    applyUi();
    show("Graphics");
    save();
}

function show(name) {
    document.querySelectorAll(".settingsTab").forEach(button => button.classList.toggle("active", button.textContent === name));
    document.querySelectorAll(".settingsPage").forEach(page => page.style.display = page.dataset.page === name ? "block" : "none");
    const title = document.getElementById("settingsSectionTitle");
    if (title) title.textContent = name;
    const scroll = document.getElementById("settingsScroll");
    if (scroll) scroll.scrollTop = 0;
}

function init() { build(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
