const STORAGE_KEY = "webminecraft-settings-extra";

const defaults = {
    fullscreen: false,
    pixelated: false,
    performanceHud: false,
    fov: 75,
    renderDistance: 120,
    fog: true,
    waterEffects: true,
    crosshair: true,
    hotbar: true,
    mouseSensitivity: 1,
    invertY: false,
    reducedMotion: false,
    largeUi: false,
    highContrast: false,
    colorblind: false,
    uiOpacity: 1,
    masterVolume: 1,
    soundEffects: true,
    music: true,
    touchSensitivity: 1
};

let settings = { ...defaults };
try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") settings = { ...settings, ...saved };
} catch {}

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
}

function toast() {
    let el = document.getElementById("settingsToast");
    if (!el) {
        el = document.createElement("div");
        el.id = "settingsToast";
        el.style.cssText = "position:fixed;left:50%;bottom:34px;transform:translate(-50%,18px) scale(.96);opacity:0;z-index:1000;padding:11px 18px;background:rgba(25,25,25,.96);border:2px solid #111;border-top-color:#777;border-left-color:#777;color:#fff;font:13px Arial,sans-serif;box-shadow:0 4px 0 #000;pointer-events:none;transition:opacity .16s ease,transform .16s cubic-bezier(.2,.9,.25,1.25);";
        document.body.appendChild(el);
    }
    el.textContent = "Saved";
    el.style.opacity = "1";
    el.style.transform = "translate(-50%,0) scale(1)";
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%,18px) scale(.96)";
    }, 1300);
}

function broadcast(name, value) {
    window.dispatchEvent(new CustomEvent("webminecraft-setting-changed", {
        detail: { name, value, settings: { ...settings } }
    }));
}

function applyFullscreen(enabled) {
    if (enabled) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function applyVisualAccessibility() {
    document.documentElement.style.setProperty("--ui-opacity", settings.uiOpacity);
    document.body.classList.toggle("settings-large-ui", settings.largeUi);
    document.body.classList.toggle("settings-high-contrast", settings.highContrast);
    document.body.classList.toggle("settings-reduced-motion", settings.reducedMotion);
    document.body.classList.toggle("settings-colorblind", settings.colorblind);
    document.body.classList.toggle("settings-pixelated", settings.pixelated);
}

function control(id, label, type, description, options = []) {
    let input;
    if (type === "select") {
        input = `<select id="${id}">${options.map(([v,t]) => `<option value="${v}">${t}</option>`).join("")}</select>`;
    } else if (type === "range") {
        input = `<input id="${id}" type="range" min="${options[0]}" max="${options[1]}" step="${options[2] || 0.01}">`;
    } else {
        input = `<input id="${id}" type="checkbox">`;
    }
    return `<div class="setting"><div><label>${label}</label><small>${description}</small></div><div class="settingControl">${input}</div></div>`;
}

function buildPanels() {
    const scroll = document.getElementById("settingsScroll");
    const tabs = document.getElementById("settingsTabs");
    if (!scroll || !tabs || document.getElementById("settingsExtraReady")) return;

    const marker = document.createElement("span");
    marker.id = "settingsExtraReady";
    marker.style.display = "none";
    tabs.appendChild(marker);

    const panels = {
        Video: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Display & Performance</h3>
            ${control("extraFullscreen", "Fullscreen", "checkbox", "Fill the entire browser window.")}
            ${control("extraPixelated", "Pixelated Rendering", "checkbox", "Use a crisp pixel-style presentation.")}
            ${control("extraFov", "Field of View", "range", "Adjust how wide your view feels while playing.", [60,110,1])}
            ${control("extraPerformanceHudVideo", "Performance HUD", "checkbox", "Show FPS and renderer information.")}
            ${control("extraRenderDistanceVideo", "View Distance", "select", "How far terrain is rendered.", [[60,"Short"],[90,"Normal"],[120,"Far"],[150,"Very Far"],[180,"Extreme"]])}
            </div>
            <div class="settingsGroup"><h3 class="settingsGroupTitle">World Effects</h3>
            ${control("extraFogVideo", "Fog", "checkbox", "Enable distance and underground fog.")}
            ${control("extraWaterEffectsVideo", "Water Effects", "checkbox", "Enable the underwater screen effect.")}
            </div>`,
        Accessibility: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Readability</h3>
            ${control("extraLargeUiAccess", "Large UI", "checkbox", "Increase interface size for easier reading.")}
            ${control("extraHighContrastAccess", "High Contrast", "checkbox", "Increase contrast for interface elements.")}
            ${control("extraColorblind", "Colorblind-Friendly", "checkbox", "Adjust interface colors to improve color distinction.")}
            ${control("extraUiOpacityAccess", "UI Opacity", "range", "Adjust interface opacity.", [0.5,1,0.05])}
            </div>
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Motion</h3>
            ${control("extraReducedMotionAccess", "Reduced Motion", "checkbox", "Reduce interface animations and movement.")}
            </div>
            <div class="settingsGroup"><h3 class="settingsGroupTitle">HUD</h3>
            ${control("extraCrosshairAccess", "Crosshair", "checkbox", "Show the center crosshair while playing.")}
            ${control("extraHotbarAccess", "Hotbar", "checkbox", "Show the item hotbar while playing.")}
            </div>`,
        Controls: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Mouse & Touch</h3>
            ${control("extraMouseSensitivity", "Mouse Sensitivity", "range", "Adjust how quickly the camera turns.", [0.35,2,0.05])}
            ${control("extraTouchSensitivity", "Touch Sensitivity", "range", "Adjust touch camera movement.", [0.5,2,0.05])}
            ${control("extraInvertY", "Invert Y Axis", "checkbox", "Reverse vertical camera movement.")}
            </div>`,
        Audio: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Audio</h3>
            ${control("extraMasterVolume", "Master Volume", "range", "Overall game volume.", [0,1,0.05])}
            ${control("extraSoundEffects", "Sound Effects", "checkbox", "Enable gameplay sound effects.")}
            ${control("extraMusic", "Music", "checkbox", "Enable menu and gameplay music.")}
            </div>`,
        Gameplay: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">World & Gameplay</h3>
            ${control("extraRenderDistance", "View Distance", "select", "How far terrain is rendered.", [[60,"Short"],[90,"Normal"],[120,"Far"],[150,"Very Far"],[180,"Extreme"]])}
            ${control("extraFog", "Fog", "checkbox", "Enable distance and underground fog.")}
            ${control("extraWaterEffects", "Water Effects", "checkbox", "Enable the blue underwater screen effect.")}
            </div>`,
        Interface: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">HUD & Interface</h3>
            ${control("extraCrosshair", "Crosshair", "checkbox", "Show the center crosshair while playing.")}
            ${control("extraHotbar", "Hotbar", "checkbox", "Show the item hotbar while playing.")}
            ${control("extraPerformanceHud", "Performance HUD", "checkbox", "Show FPS and chunk performance information.")}
            </div>`
    };

    for (const [name, html] of Object.entries(panels)) {
        const section = document.createElement("section");
        section.className = "settingsExtraPanel";
        section.dataset.settingsTab = name;
        section.innerHTML = html;
        section.style.display = "none";
        scroll.appendChild(section);
        const button = [...tabs.querySelectorAll(".settingsTab")].find(b => b.textContent.trim() === name);
        if (button) button.dataset.settingsTab = name;
        else {
            const newButton = document.createElement("button");
            newButton.className = "settingsTab";
            newButton.type = "button";
            newButton.textContent = name;
            newButton.dataset.settingsTab = name;
            tabs.appendChild(newButton);
        }
    }

    const originalGroups = [...scroll.children].filter(el => !el.classList.contains("settingsExtraPanel"));
    function show(name) {
        [...tabs.querySelectorAll(".settingsTab")].forEach(b => b.classList.toggle("active", b.textContent.trim() === name));
        [...scroll.querySelectorAll(".settingsExtraPanel")].forEach(p => p.style.display = p.dataset.settingsTab === name ? "block" : "none");
        originalGroups.forEach(p => p.style.display = name === "Graphics" ? "block" : "none");
        const title = document.getElementById("settingsSectionTitle");
        if (title) title.textContent = name;
        scroll.scrollTop = 0;
    }

    [...tabs.querySelectorAll(".settingsTab")].forEach(button => {
        const name = button.dataset.settingsTab || button.textContent.trim();
        button.dataset.settingsTab = name;
        button.addEventListener("click", () => show(name));
    });
    show("Graphics");

    wireCheck("extraFullscreen", "fullscreen", applyFullscreen);
    wireCheck("extraPixelated", "pixelated", value => document.body.classList.toggle("settings-pixelated", value));
    wireRange("extraFov", "fov");
    wireCheck("extraPerformanceHudVideo", "performanceHud");
    wireSelect("extraRenderDistanceVideo", "renderDistance");
    wireCheck("extraFogVideo", "fog");
    wireCheck("extraWaterEffectsVideo", "waterEffects");

    wireCheck("extraLargeUiAccess", "largeUi", value => document.body.classList.toggle("settings-large-ui", value));
    wireCheck("extraHighContrastAccess", "highContrast", value => document.body.classList.toggle("settings-high-contrast", value));
    wireCheck("extraColorblind", "colorblind", value => document.body.classList.toggle("settings-colorblind", value));
    wireRange("extraUiOpacityAccess", "uiOpacity", value => document.documentElement.style.setProperty("--ui-opacity", value));
    wireCheck("extraReducedMotionAccess", "reducedMotion", value => document.body.classList.toggle("settings-reduced-motion", value));
    wireCheck("extraCrosshairAccess", "crosshair");
    wireCheck("extraHotbarAccess", "hotbar");

    wireRange("extraMouseSensitivity", "mouseSensitivity");
    wireRange("extraTouchSensitivity", "touchSensitivity");
    wireRange("extraMasterVolume", "masterVolume");
    wireRange("extraUiOpacity", "uiOpacity", value => document.documentElement.style.setProperty("--ui-opacity", value));
    wireSelect("extraRenderDistance", "renderDistance");
    wireCheck("extraInvertY", "invertY");
    wireCheck("extraFog", "fog");
    wireCheck("extraWaterEffects", "waterEffects");
    wireCheck("extraCrosshair", "crosshair");
    wireCheck("extraHotbar", "hotbar");
    wireCheck("extraPerformanceHud", "performanceHud");
    wireCheck("extraSoundEffects", "soundEffects");
    wireCheck("extraMusic", "music");

    applyVisualAccessibility();

    function wireRange(id, key, after) {
        const el = document.getElementById(id); if (!el) return;
        el.value = settings[key];
        el.addEventListener("input", () => { settings[key] = Number(el.value); after?.(settings[key]); save(); broadcast(key, settings[key]); toast(); });
    }
    function wireSelect(id, key) {
        const el = document.getElementById(id); if (!el) return;
        el.value = String(settings[key]);
        el.addEventListener("change", () => { settings[key] = Number(el.value); save(); broadcast(key, settings[key]); toast(); });
    }
    function wireCheck(id, key, after) {
        const el = document.getElementById(id); if (!el) return;
        el.checked = !!settings[key];
        el.addEventListener("change", () => { settings[key] = el.checked; after?.(el.checked); save(); broadcast(key, settings[key]); toast(); });
    }
}

export function setupSettingsExtras() {
    const start = () => buildPanels();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
}

setupSettingsExtras();
