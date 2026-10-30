import { getKeybinds, setKeybind, resetKeybinds, formatKeyCode, keybindLabels } from "../player/keybinds.js";
import { IS_TOUCH_DEVICE } from "../core/performance.js";

const STORAGE_KEY = "webminecraft-settings-v2";

const defaults = {
    shadows: !IS_TOUCH_DEVICE,
    shadowQuality: IS_TOUCH_DEVICE ? 512 : 1024,
    pixelRatio: 1,
    lightingQuality: IS_TOUCH_DEVICE ? "balanced" : "high",
    brightness: 1,
    fov: 75,
    renderDistance: IS_TOUCH_DEVICE ? 60 : 120,
    fog: true,
    waterEffects: true,
    crosshair: true,
    hotbar: true,
    performanceHud: false,
    mouseSensitivity: 1,
    touchSensitivity: 1,
    touchControlSize: 1,
    touchControlOpacity: 0.9,
    showTouchControls: true,
    leftHandedControls: false,
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
    let result = { ...defaults };
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (saved && typeof saved === "object") result = { ...defaults, ...saved };
    } catch {}
    // On the first touch-device migration, replace the old desktop default
    // with a lightweight distance. After that, preserve the user's own choice.
    if (IS_TOUCH_DEVICE) {
        result.shadows = false;
        result.shadowQuality = Math.min(Number(result.shadowQuality) || 512, 512);
        result.pixelRatio = Math.min(Number(result.pixelRatio) || 1, 1);
        if (result.deviceProfile !== "touch") result.renderDistance = 60;
        if (result.lightingQuality === "high") result.lightingQuality = "balanced";
        result.deviceProfile = "touch";
    } else {
        result.deviceProfile = "desktop";
    }
    return result;
}

let settings = readSettings();
settings.fullscreen = Boolean(document.fullscreenElement);

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
    document.body.classList.toggle("settings-device-touch", IS_TOUCH_DEVICE);
    document.documentElement.style.setProperty("--ui-opacity", String(settings.uiOpacity));
    document.documentElement.style.setProperty("--touch-control-scale", String(settings.touchControlSize));
    document.documentElement.style.setProperty("--touch-control-opacity", String(settings.touchControlOpacity));
    document.body.classList.toggle("settings-large-ui", settings.largeUi);
    document.body.classList.toggle("settings-high-contrast", settings.highContrast);
    document.body.classList.toggle("settings-colorblind", settings.colorblind);
    document.body.classList.toggle("settings-reduced-motion", settings.reducedMotion);
    document.body.classList.toggle("settings-pixelated", settings.pixelated);
    document.body.classList.toggle("settings-touch-controls-hidden", !settings.showTouchControls);
    document.body.classList.toggle("settings-left-handed", settings.leftHandedControls);
    window.__webminecraftAudioSettings = {
        masterVolume: Math.max(0, Math.min(1, Number(settings.masterVolume) || 0)),
        soundEffects: settings.soundEffects !== false,
        music: settings.music !== false
    };
    document.dispatchEvent(new CustomEvent("webminecraft-audio-settings-changed", {
        detail: { ...window.__webminecraftAudioSettings }
    }));
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
    Video: `
        <div class="settingsGroup"><h3>World</h3>
        ${control("sShadows", "Shadows", "Show shadows around the world.", "checkbox")}
        ${control("sShadowQuality", "Shadow Detail", "Choose how detailed shadows look.", "select", [[512,"Low"],[1024,"High"],[2048,"Ultra"]])}
        ${control("sPixelRatio", "Graphics Quality", "Choose a balance between looks and speed.", "select", [[0.75,"Performance"],[1,"Balanced"],[1.25,"High"],[1.5,"Ultra"]])}
        ${control("sLighting", "Lighting", "Choose how lighting looks.", "select", [["performance","Low"],["balanced","Balanced"],["high","High"]])}
        ${control("sBrightness", "Brightness", "Make the world brighter or darker.", "range", [0.5,1.5,0.05])}
        ${control("sFog", "Fog", "Show fog in the distance.", "checkbox")}
        ${control("sWaterEffects", "Water Effects", "Show extra water effects.", "checkbox")}
        </div>
        <div class="settingsGroup"><h3>View</h3>
        ${control("sFov", "Field of View", "Change how wide your view is.", "range", [60,110,1])}
        ${control("sRenderDistance", "View Distance", "Choose how far you can see.", "select", [[60,"Short"],[90,"Normal"],[120,"Far"],[150,"Very Far"],[180,"Extreme"]])}
        ${control("sPixelated", "Classic Pixels", "Use a crisp, blocky look.", "checkbox")}
        </div>`,
    Controls: `
        <div class="settingsGroup"><h3>Keyboard & Mouse</h3>
        ${control("sMouseSensitivity", "Mouse Speed", "How quickly you turn with the mouse.", "range", [0.35,2,0.05])}
        ${control("sInvertY", "Invert Look", "Reverse up and down camera movement.", "checkbox")}
        </div>
        <div class="settingsGroup settings-touch-only"><h3>Touch</h3>
        ${control("sTouchSensitivity", "Look Speed", "How quickly you turn when dragging.", "range", [0.5,2,0.05])}
        ${control("sTouchControlSize", "Button Size", "Make the touch buttons bigger or smaller.", "range", [0.7,1.35,0.05])}
        ${control("sTouchControlOpacity", "Button Opacity", "Make the touch buttons easier or harder to see.", "range", [0.3,1,0.05])}
        ${control("sShowTouchControls", "Show Touch Buttons", "Show or hide the on-screen buttons.", "checkbox")}
        ${control("sLeftHandedControls", "Left-Handed Layout", "Move the touch buttons to the other side.", "checkbox")}
        </div>
        <div class="settingsGroup settings-desktop-only"><h3>Keyboard</h3>
            <div id="settingsKeybinds"></div>
            <div class="setting settingInfo"><div><label>Reset Keys</label><small>Put all keys back to their defaults.</small></div><div class="settingControl"><button id="resetKeybinds" type="button">Reset</button></div></div>
        </div>`,
    Audio: `
        <div class="settingsGroup"><h3>Sound</h3>
        ${control("sMasterVolume", "Volume", "Set the overall game volume.", "range", [0,1,0.05])}
        ${control("sSoundEffects", "Sound Effects", "Turn game sounds on or off.", "checkbox")}
        </div>`,
    Accessibility: `
        <div class="settingsGroup"><h3>Screen</h3>
        ${control("sLargeUi", "Larger Text & Buttons", "Make menus easier to see.", "checkbox")}
        ${control("sHighContrast", "High Contrast", "Make menu items easier to tell apart.", "checkbox")}
        ${control("sColorblind", "Color-Friendly Mode", "Use clearer colors in the interface.", "checkbox")}
        ${control("sUiOpacity", "Menu Opacity", "Change how see-through the game interface is.", "range", [0.5,1,0.05])}
        ${control("sReducedMotion", "Reduce Movement", "Tone down menu animations.", "checkbox")}
        </div>
        <div class="settingsGroup"><h3>In-Game Display</h3>
        ${control("sCrosshair", "Crosshair", "Show the center marker.", "checkbox")}
        ${control("sHotbar", "Hotbar", "Show your item bar.", "checkbox")}
        ${control("sPerformanceHud", "Show FPS", "Show the frame-rate counter while playing.", "checkbox")}
        </div>`,
    Game: `
        <div class="settingsGroup"><h3>Game</h3>
        ${control("sFullscreen", "Full Screen", "Play using the whole screen.", "checkbox")}
        <div class="setting settingInfo"><div><label>Reset Settings</label><small>Put all settings back to their defaults.</small></div><div class="settingControl"><button id="resetSettings" type="button">Reset</button></div></div>
        </div>`
};

async function applyFullscreen(enabled) {
    const toggle = document.getElementById("sFullscreen");
    try {
        if (enabled && !document.fullscreenElement) {
            if (typeof document.documentElement.requestFullscreen !== "function") throw new Error("Fullscreen is not supported here.");
            await document.documentElement.requestFullscreen();
        } else if (!enabled && document.fullscreenElement) {
            if (typeof document.exitFullscreen !== "function") throw new Error("Fullscreen exit is not supported here.");
            await document.exitFullscreen();
        }
    } catch {
        settings.fullscreen = Boolean(document.fullscreenElement);
        if (toggle) toggle.checked = settings.fullscreen;
        save();
        toast(settings.fullscreen ? "Fullscreen remains active." : "Fullscreen isn't supported by this browser.");
    }
}
document.addEventListener("fullscreenchange", () => {
    settings.fullscreen = Boolean(document.fullscreenElement);
    const toggle = document.getElementById("sFullscreen");
    if (toggle) toggle.checked = settings.fullscreen;
    save();
});

function build() {
    const menu = document.getElementById("settingsMenu");
    if (!menu || menu.dataset.redone === "1") return;
    menu.dataset.redone = "1";
    menu.innerHTML = `
        <div id="settingsPanel" class="settingsRedonePanel">
            <aside id="settingsSidebar"><div class="settingsBrand">SETTINGS</div><div class="settingsHint">Change your game</div><nav id="settingsTabs"></nav></aside>
            <section id="settingsContent"><header id="settingsHeader"><div><h2 id="settingsSectionTitle">Video</h2><span id="settingsSaveHint">Changes save automatically</span></div><button id="settingsCloseTop" type="button" aria-label="Done with settings">Done</button></header><div id="settingsScroll"></div></section>
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
        const formatValue = value => {
            const number = Number(value);
            if (key === "fov") return Math.round(number) + "°";
            if (["brightness", "masterVolume", "uiOpacity", "touchControlSize", "touchControlOpacity"].includes(key)) return Math.round(number * 100) + "%";
            if (["mouseSensitivity", "touchSensitivity"].includes(key)) return number.toFixed(2) + "x";
            return String(value);
        };
        const updateOutput = () => { if (output) output.textContent = type === "range" ? formatValue(settings[key]) : ""; };
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
    bind("sTouchControlSize", "touchControlSize", "range");
    bind("sTouchControlOpacity", "touchControlOpacity", "range");
    bind("sShowTouchControls", "showTouchControls", "checkbox");
    bind("sLeftHandedControls", "leftHandedControls", "checkbox");
    bind("sInvertY", "invertY", "checkbox");
    bind("sMasterVolume", "masterVolume", "range");
    bind("sSoundEffects", "soundEffects", "checkbox");
    bind("sLargeUi", "largeUi", "checkbox");
    bind("sHighContrast", "highContrast", "checkbox");
    bind("sColorblind", "colorblind", "checkbox");
    bind("sUiOpacity", "uiOpacity", "range");
    bind("sReducedMotion", "reducedMotion", "checkbox");
    bind("sCrosshair", "crosshair", "checkbox");
    bind("sHotbar", "hotbar", "checkbox");
    bind("sPerformanceHud", "performanceHud", "checkbox");
    bind("sFullscreen", "fullscreen", "checkbox", applyFullscreen);
    if (!IS_TOUCH_DEVICE) setupKeybindControls();
    if (IS_TOUCH_DEVICE) {
        for (const id of ["sShadows", "sShadowQuality"]) {
            const input = document.getElementById(id);
            if (input) input.disabled = true;
        }
        const quality = document.getElementById("sPixelRatio");
        if (quality) for (const option of quality.options) {
            if (Number(option.value) > 1) option.disabled = true;
        }
        const lighting = document.getElementById("sLighting");
        if (lighting) {
            const high = [...lighting.options].find(option => option.value === "high");
            if (high) high.disabled = true;
        }
        const shadowHint = document.querySelector('label[for="sShadows"]')?.parentElement?.querySelector("small");
        if (shadowHint) shadowHint.textContent = "Dynamic shadows are disabled on touch devices to protect frame rate.";
        const qualityHint = document.querySelector('label[for="sPixelRatio"]')?.parentElement?.querySelector("small");
        if (qualityHint) qualityHint.textContent = "Higher render scales are disabled on touch devices for smoother gameplay.";
    }
    document.getElementById("resetKeybinds")?.addEventListener("click", () => {
        resetKeybinds();
        refreshKeybindControls();
        toast("Keybinds reset");
    });

    document.getElementById("resetSettings")?.addEventListener("click", () => {
        if (document.fullscreenElement) applyFullscreen(false);
        settings = { ...defaults, deviceProfile: IS_TOUCH_DEVICE ? "touch" : "desktop" };
        resetKeybinds();
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


    ensureSettingsStyles();
    applyUi();
    show("Video");
    save();
    window.dispatchEvent(new CustomEvent("webminecraft-settings-ready", { detail: { settings: { ...settings } } }));
}

let keybindRefresh = null;

function setupKeybindControls() {
    const root = document.getElementById("settingsKeybinds");
    if (!root || root.dataset.ready === "1") return;
    root.dataset.ready = "1";

    if (!document.getElementById("settingsKeybindStyles")) {
        const style = document.createElement("style");
        style.id = "settingsKeybindStyles";
        style.textContent = '#settingsKeybinds{display:flex;flex-direction:column;gap:6px}#settingsKeybinds .settingsKeybindRow{display:grid;grid-template-columns:minmax(0,1fr) 150px;align-items:center;gap:12px;min-height:48px;padding:8px 10px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08)}#settingsKeybinds .settingsKeybindName{display:block;font-weight:700}#settingsKeybinds .settingsKeybindHint{display:block;margin-top:2px;color:#aaa;font-size:10px}#settingsKeybinds .settingsKeybindButton{width:150px;min-height:34px;padding:6px 8px;border:2px solid #222;border-top-color:#aaa;border-left-color:#aaa;background:#777;color:#fff;font:700 11px "MinecraftFont",monospace;cursor:pointer;text-shadow:1px 1px #222}#settingsKeybinds .settingsKeybindButton:hover{filter:brightness(1.08)}#settingsKeybinds .settingsKeybindButton.waiting{background:#555;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}#settingsKeybinds .settingsKeybindStatus{margin-top:7px;color:#d7d7d7;font-size:10px;min-height:14px}@media(max-width:700px){#settingsKeybinds .settingsKeybindRow{grid-template-columns:1fr}#settingsKeybinds .settingsKeybindButton{width:100%}}';
        document.head.appendChild(style);
    }

    const current = getKeybinds();
    root.innerHTML = "";

    for (const action of Object.keys(keybindLabels)) {
        const row = document.createElement("div");
        row.className = "settingsKeybindRow";
        row.dataset.keybindAction = action;

        const info = document.createElement("div");
        const name = document.createElement("span");
        name.className = "settingsKeybindName";
        name.textContent = keybindLabels[action];

        const hint = document.createElement("small");
        hint.className = "settingsKeybindHint";
        hint.textContent = "Click Change, then press the key.";
        info.append(name, hint);

        const button = document.createElement("button");
        button.className = "settingsKeybindButton";
        button.type = "button";
        button.dataset.keybindButton = "1";
        button.textContent = formatKeyCode(current[action]);

        row.append(info, button);
        root.appendChild(row);
    }

    const status = document.createElement("div");
    status.className = "settingsKeybindStatus";
    status.id = "settingsKeybindStatus";
    status.setAttribute("aria-live", "polite");
    root.appendChild(status);

    let waitingAction = null;

    const refresh = () => {
        const values = getKeybinds();
        root.querySelectorAll("[data-keybind-action]").forEach(row => {
            const action = row.dataset.keybindAction;
            const button = row.querySelector("[data-keybind-button]");
            if (button && button.dataset.waiting !== "1") button.textContent = formatKeyCode(values[action]);
        });
    };
    keybindRefresh = refresh;

    root.querySelectorAll("[data-keybind-button]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            root.querySelectorAll("[data-keybind-button]").forEach(other => {
                delete other.dataset.waiting;
                other.classList.remove("waiting");
            });
            waitingAction = button.closest("[data-keybind-action]")?.dataset.keybindAction || null;
            button.dataset.waiting = "1";
            button.classList.add("waiting");
            button.textContent = "Press a key...";
            status.textContent = "Press the new key. Esc cancels.";
        });
    });

    window.addEventListener("keydown", event => {
        if (!waitingAction) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.code === "Escape") {
            waitingAction = null;
            root.querySelectorAll("[data-keybind-button]").forEach(button => {
                delete button.dataset.waiting;
                button.classList.remove("waiting");
            });
            refresh();
            status.textContent = "Change cancelled.";
            return;
        }

        const values = getKeybinds();
        const conflict = Object.entries(values).find(([action, code]) => action !== waitingAction && code === event.code);
        if (conflict) {
            status.textContent = "That key is already assigned to " + keybindLabels[conflict[0]] + ".";
            return;
        }

        setKeybind(waitingAction, event.code);
        waitingAction = null;
        root.querySelectorAll("[data-keybind-button]").forEach(button => {
            delete button.dataset.waiting;
            button.classList.remove("waiting");
        });
        refresh();
        status.textContent = "Keybind saved.";
        toast("Keybind saved");
    }, true);

    window.addEventListener("webminecraft-keybinds-changed", refresh);
}

function refreshKeybindControls() {
    keybindRefresh?.();
}

function show(name) {
    document.querySelectorAll(".settingsTab").forEach(button => button.classList.toggle("active", button.textContent === name));
    document.querySelectorAll(".settingsPage").forEach(page => page.style.display = page.dataset.page === name ? "block" : "none");
    const title = document.getElementById("settingsSectionTitle");
    if (title) title.textContent = name;
    const scroll = document.getElementById("settingsScroll");
    if (scroll) scroll.scrollTop = 0;
}

function ensureSettingsStyles() {
    if (document.getElementById("webminecraftSettingsBehaviorStyles")) return;
    const style = document.createElement("style");
    style.id = "webminecraftSettingsBehaviorStyles";
    style.textContent = `
.settings-device-touch .settings-desktop-only{display:none!important}
body:not(.settings-device-touch) .settings-touch-only{display:none!important}
.settings-large-ui .setting label{font-size:18px!important}
.settings-large-ui .setting small{font-size:14px!important}
.settings-large-ui .settingsKeybindButton,.settings-large-ui .settingsTab{font-size:14px!important}
.settings-high-contrast .setting{border-color:#eee!important;background:#171717!important}
.settings-high-contrast .setting label,.settings-high-contrast .setting small{color:#fff!important}
.settings-high-contrast .settingsTab{border-color:#fff!important;color:#fff!important}
.settings-colorblind .settingsTab.active{background:linear-gradient(#416d9e,#244f7c)!important}
.settings-colorblind #crosshair{filter:hue-rotate(150deg) saturate(1.3)}
.settings-reduced-motion *,body.settings-reduced-motion *::before,body.settings-reduced-motion *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
.settings-pixelated #hotbar,.settings-pixelated #hotbar img,.settings-pixelated #hotbar canvas{image-rendering:pixelated!important}
body #hotbar,body #crosshair,body #performanceHud,body #coordinatesHud{opacity:var(--ui-opacity,1)}
.settings-pixelated canvas,.settings-pixelated #hotbar img,.settings-pixelated #hotbar canvas{image-rendering:pixelated!important}
#touchControls{opacity:var(--touch-control-opacity,.9)}
#touchMovePad{transform:scale(var(--touch-control-scale,1));transform-origin:bottom left}
#touchActions{transform:scale(var(--touch-control-scale,1));transform-origin:bottom right}
.settings-touch-controls-hidden #touchMovePad,.settings-touch-controls-hidden #touchActions,.settings-touch-controls-hidden #touchHint{display:none!important}
.settings-left-handed #touchMovePad{left:auto!important;right:max(12px,env(safe-area-inset-right))!important;transform-origin:bottom right!important}
.settings-left-handed #touchActions{right:auto!important;left:max(12px,env(safe-area-inset-left))!important;transform-origin:bottom left!important}
.settings-left-handed #touchLookArea{left:0!important;right:31%!important}
`;
    document.head.appendChild(style);

    if (!document.getElementById("webminecraftSettingsMinecraftStyles")) {
        const minecraftStyle = document.createElement("style");
        minecraftStyle.id = "webminecraftSettingsMinecraftStyles";
        minecraftStyle.textContent = `
#settingsMenu{
  align-items:center!important;
  justify-content:center!important;
  padding:18px!important;
  background:rgba(0,0,0,.72)!important;
  backdrop-filter:blur(2px)!important;
  -webkit-backdrop-filter:blur(2px)!important;
}
#settingsPanel{
  position:relative!important;
  width:min(1180px,calc(100vw - 36px))!important;
  height:min(820px,calc(100dvh - 36px))!important;
  max-width:1180px!important;
  max-height:820px!important;
  margin:auto!important;
  grid-template-columns:250px minmax(0,1fr)!important;
  grid-template-rows:minmax(0,1fr)!important;
  border:4px solid #171717!important;
  border-radius:0!important;
  background:#858585!important;
  color:#fff!important;
  box-shadow:0 8px 0 rgba(0,0,0,.78),inset 0 0 0 2px rgba(255,255,255,.15)!important;
  font-family:Arial,sans-serif!important;
}
#settingsSidebar{
  min-width:0!important;
  padding:26px 15px 18px!important;
  background:linear-gradient(180deg,#555 0%,#454545 100%)!important;
  border:0!important;
  border-right:4px solid #222!important;
  box-shadow:inset -2px 0 rgba(255,255,255,.1)!important;
}
#settingsPanel .settingsBrand{
  margin:0 10px 5px!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:27px!important;
  letter-spacing:.5px!important;
  text-shadow:2px 2px 0 #222!important;
}
#settingsPanel .settingsHint{
  margin:0 10px 25px!important;
  color:#dedede!important;
  font-size:12px!important;
}
#settingsTabs{
  display:flex!important;
  flex-direction:column!important;
  gap:7px!important;
}
#settingsMenu .settingsTab{
  position:relative!important;
  width:100%!important;
  min-height:49px!important;
  margin:0!important;
  padding:11px 13px!important;
  border:2px solid #202020!important;
  border-top-color:#c2c2c2!important;
  border-left-color:#c2c2c2!important;
  border-radius:0!important;
  background:linear-gradient(#888,#707070)!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:13px!important;
  text-align:left!important;
  text-shadow:2px 2px 0 #333!important;
  box-shadow:inset 1px 1px rgba(255,255,255,.16),0 3px 0 #222!important;
}
#settingsMenu .settingsTab:hover{
  filter:brightness(1.12)!important;
  transform:none!important;
}
#settingsMenu .settingsTab.active{
  border-color:#171717!important;
  border-top-color:#e0e0e0!important;
  border-left-color:#e0e0e0!important;
  background:linear-gradient(#aaa,#898989)!important;
  color:#fff!important;
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.13),0 3px 0 #222!important;
}
#settingsVersion{
  margin-top:auto!important;
  padding:16px 10px 5px!important;
  color:#d4d4d4!important;
  font-size:10px!important;
  line-height:1.5!important;
}
#settingsContent{
  min-width:0!important;
  min-height:0!important;
  display:flex!important;
  flex-direction:column!important;
  background:#858585!important;
}
#settingsHeader{
  flex:0 0 76px!important;
  height:76px!important;
  padding:0 24px!important;
  background:linear-gradient(#686868,#595959)!important;
  border:0!important;
  border-bottom:4px solid #252525!important;
  box-shadow:inset 0 1px rgba(255,255,255,.14)!important;
}
#settingsHeader h2,#settingsSectionTitle{
  margin:0!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:21px!important;
  text-shadow:2px 2px 0 #292929!important;
}
#settingsSaveHint{
  display:block!important;
  margin-top:5px!important;
  color:#dedede!important;
  font-size:10px!important;
}
#settingsMenu #settingsCloseTop{
  width:auto!important;
  min-width:112px!important;
  height:39px!important;
  padding:7px 16px!important;
  border:2px solid #202020!important;
  border-top-color:#c8c8c8!important;
  border-left-color:#c8c8c8!important;
  border-radius:0!important;
  background:linear-gradient(#858585,#686868)!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:12px!important;
  text-shadow:2px 2px 0 #333!important;
  box-shadow:0 3px 0 #222!important;
  cursor:pointer!important;
}
#settingsMenu #settingsCloseTop:hover{filter:brightness(1.12)!important}
#settingsScroll{
  min-height:0!important;
  flex:1 1 auto!important;
  overflow:auto!important;
  padding:23px 26px 30px!important;
  background:#858585!important;
}
#settingsScroll::-webkit-scrollbar{width:13px!important}
#settingsScroll::-webkit-scrollbar-track{background:#555!important;border:2px solid #222!important}
#settingsScroll::-webkit-scrollbar-thumb{background:#aaa!important;border:2px solid #333!important}
#settingsScroll .settingsGroup{
  max-width:920px!important;
  margin:0 auto 24px!important;
}
#settingsScroll .settingsGroup h3{
  margin:0 0 10px!important;
  padding:0 0 7px 2px!important;
  border:0!important;
  border-bottom:2px solid #303030!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:14px!important;
  text-shadow:2px 2px 0 #444!important;
}
#settingsScroll .setting{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(150px,220px)!important;
  align-items:center!important;
  gap:18px!important;
  min-height:66px!important;
  margin:7px 0!important;
  padding:12px 14px!important;
  border:2px solid #292929!important;
  border-top-color:#c5c5c5!important;
  border-left-color:#c5c5c5!important;
  border-radius:0!important;
  background:linear-gradient(180deg,#707070,#626262)!important;
  box-shadow:inset 1px 1px rgba(255,255,255,.11),0 3px 0 #363636!important;
  transition:none!important;
}
#settingsScroll .setting:hover{transform:none!important;filter:brightness(1.035)!important}
#settingsScroll .setting label{
  display:block!important;
  margin:0 0 4px!important;
  color:#fff!important;
  font-size:14px!important;
  font-weight:700!important;
  text-shadow:1px 1px 0 #444!important;
}
#settingsScroll .setting small{
  display:block!important;
  color:#e0e0e0!important;
  font-size:11px!important;
  line-height:1.35!important;
}
#settingsScroll .settingControl{
  min-width:0!important;
  display:flex!important;
  justify-content:flex-end!important;
  align-items:center!important;
  gap:8px!important;
  padding:0!important;
}
#settingsScroll .settingControl select,
#settingsScroll .settingControl button{
  width:100%!important;
  min-height:37px!important;
  padding:7px 10px!important;
  border:2px solid #222!important;
  border-top-color:#c3c3c3!important;
  border-left-color:#c3c3c3!important;
  border-radius:0!important;
  background:linear-gradient(#777,#5e5e5e)!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:11px!important;
  text-shadow:1px 1px #333!important;
  box-shadow:0 2px 0 #333!important;
}
#settingsScroll .settingControl select option{background:#555!important;color:#fff!important}
#settingsScroll .settingControl input[type=range]{
  width:100%!important;
  min-width:80px!important;
  height:8px!important;
  accent-color:#d7d7d7!important;
  cursor:pointer!important;
}
#settingsScroll .settingControl input[type=checkbox]{
  appearance:none!important;
  -webkit-appearance:none!important;
  position:relative!important;
  flex:0 0 29px!important;
  width:29px!important;
  height:29px!important;
  margin:0!important;
  border:2px solid #222!important;
  border-top-color:#c8c8c8!important;
  border-left-color:#c8c8c8!important;
  border-radius:0!important;
  background:#5b5b5b!important;
  cursor:pointer!important;
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.18)!important;
}
#settingsScroll .settingControl input[type=checkbox]:checked{
  background:#8a8a8a!important;
}
#settingsScroll .settingControl input[type=checkbox]:checked::after{
  content:"✓"!important;
  position:absolute!important;
  inset:0!important;
  display:grid!important;
  place-items:center!important;
  color:#fff!important;
  font:bold 21px Arial,sans-serif!important;
  text-shadow:1px 1px #333!important;
}
#settingsScroll output{
  min-width:52px!important;
  color:#fff!important;
  font-size:11px!important;
  font-weight:800!important;
  text-align:right!important;
  text-shadow:1px 1px #333!important;
}
#settingsKeybinds .settingsKeybindRow{
  grid-template-columns:minmax(0,1fr) 150px!important;
  background:#696969!important;
  border:2px solid #292929!important;
  border-top-color:#c5c5c5!important;
  border-left-color:#c5c5c5!important;
  border-radius:0!important;
}
#settingsKeybinds .settingsKeybindName{color:#fff!important}
#settingsKeybinds .settingsKeybindHint{color:#e0e0e0!important}
#settingsKeybinds .settingsKeybindButton{
  border:2px solid #222!important;
  border-top-color:#c2c2c2!important;
  border-left-color:#c2c2c2!important;
  border-radius:0!important;
  background:linear-gradient(#858585,#686868)!important;
  box-shadow:0 2px 0 #333!important;
}
#settingsKeybinds .settingsKeybindStatus{color:#fff!important}
#settingsScroll .settingInfo .settingControl button{
  max-width:130px!important;
}
@media(max-width:900px){
  #settingsMenu{padding:0!important}
  #settingsPanel{
    width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;
    grid-template-columns:1fr!important;grid-template-rows:auto minmax(0,1fr)!important;
    border:0!important;box-shadow:none!important;
  }
  #settingsSidebar{
    padding:max(12px,env(safe-area-inset-top)) 12px 10px!important;
    border:0!important;border-bottom:4px solid #222!important;
  }
  #settingsPanel .settingsBrand{margin:0 5px 3px!important;font-size:21px!important}
  #settingsPanel .settingsHint{display:none!important}
  #settingsTabs{flex-direction:row!important;gap:6px!important;overflow-x:auto!important;padding:2px 2px 5px!important}
  #settingsMenu .settingsTab{flex:0 0 auto!important;width:auto!important;min-width:102px!important;min-height:39px!important;padding:8px 10px!important;font-size:11px!important;text-align:center!important}
  #settingsVersion{display:none!important}
  #settingsHeader{flex-basis:62px!important;height:62px!important;padding:0 14px!important}
  #settingsHeader h2,#settingsSectionTitle{font-size:16px!important}
  #settingsMenu #settingsCloseTop{min-width:82px!important;height:34px!important;font-size:10px!important}
  #settingsScroll{padding:15px 12px 24px!important}
  #settingsScroll .setting{grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;padding:11px 10px!important}
  #settingsScroll .setting label{font-size:12px!important}
  #settingsScroll .setting small{font-size:10px!important}
  #settingsScroll .settingControl{min-width:92px!important;max-width:44vw!important}
  #settingsScroll .settingControl select{min-width:0!important;font-size:10px!important}
  #settingsScroll .settingControl input[type=range]{width:100%!important}
}
@media(max-width:480px){
  #settingsScroll .setting{grid-template-columns:1fr!important;gap:8px!important}
  #settingsScroll .settingControl{max-width:none!important;width:100%!important;justify-content:flex-start!important}
  #settingsScroll .settingControl input[type=checkbox]{margin-left:2px!important}
  #settingsKeybinds .settingsKeybindRow{grid-template-columns:1fr!important}
  #settingsKeybinds .settingsKeybindButton{width:100%!important}
}
`;
        document.head.appendChild(minecraftStyle);
    }
}

function init() { build(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
