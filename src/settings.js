const STORAGE_KEY = "webminecraft-settings-extra";

const defaults = {
    fov: 75,
    renderDistance: 120,
    fog: true,
    waterEffects: true,
    performanceHud: false,
    crosshair: true,
    hotbar: true,
    mouseSensitivity: 1,
    invertY: false,
    reducedMotion: false,
    largeUi: false,
    highContrast: false,
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

function control(id, label, type, value, description, options = []) {
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
        Controls: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Mouse & Touch</h3>
            ${control("extraMouseSensitivity", "Mouse Sensitivity", "range", settings.mouseSensitivity, "Adjust how quickly the camera turns.", [0.35,2,0.05])}
            ${control("extraTouchSensitivity", "Touch Sensitivity", "range", settings.touchSensitivity, "Adjust touch camera movement.", [0.5,2,0.05])}
            ${control("extraInvertY", "Invert Y Axis", "checkbox", settings.invertY, "Reverse vertical camera movement.")}
            </div>`,
        Audio: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">Audio</h3>
            ${control("extraMasterVolume", "Master Volume", "range", settings.masterVolume, "Overall game volume.", [0,1,0.05])}
            ${control("extraSoundEffects", "Sound Effects", "checkbox", settings.soundEffects, "Enable gameplay sound effects.")}
            ${control("extraMusic", "Music", "checkbox", settings.music, "Enable menu and gameplay music.")}
            </div>`,
        Gameplay: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">World & Gameplay</h3>
            ${control("extraRenderDistance", "View Distance", "select", settings.renderDistance, "How far terrain is rendered.", [[60,"Short"],[90,"Normal"],[120,"Far"],[150,"Very Far"],[180,"Extreme"]])}
            ${control("extraFog", "Fog", "checkbox", settings.fog, "Enable distance and underground fog.")}
            ${control("extraWaterEffects", "Water Effects", "checkbox", settings.waterEffects, "Enable the blue underwater screen effect.")}
            </div>`,
        Interface: `
            <div class="settingsGroup"><h3 class="settingsGroupTitle">HUD & Accessibility</h3>
            ${control("extraCrosshair", "Crosshair", "checkbox", settings.crosshair, "Show the center crosshair while playing.")}
            ${control("extraHotbar", "Hotbar", "checkbox", settings.hotbar, "Show the item hotbar while playing.")}
            ${control("extraPerformanceHud", "Performance HUD", "checkbox", settings.performanceHud, "Show FPS and chunk performance information.")}
            ${control("extraLargeUi", "Large UI", "checkbox", settings.largeUi, "Increase interface size for easier reading.")}
            ${control("extraHighContrast", "High Contrast", "checkbox", settings.highContrast, "Increase contrast for interface elements.")}
            ${control("extraReducedMotion", "Reduced Motion", "checkbox", settings.reducedMotion, "Reduce interface animations.")}
            ${control("extraUiOpacity", "UI Opacity", "range", settings.uiOpacity, "Adjust interface opacity.", [0.5,1,0.05])}
            </div>`
    };

    for (const [name, html] of Object.entries(panels)) {
        const section = document.createElement("section");
        section.className = "settingsExtraPanel";
        section.dataset.settingsTab = name;
        section.innerHTML = html;
        section.style.display = "none";
        scroll.appendChild(section);
        const button = document.createElement("button");
        button.className = "settingsTab";
        button.type = "button";
        button.textContent = name;
        button.dataset.settingsTab = name;
        tabs.appendChild(button);
    }

    const original = [...tabs.querySelectorAll(".settingsTab")].find(b => b.textContent === "Graphics");
    const originalGroups = [...scroll.children].filter(el => !el.classList.contains("settingsExtraPanel"));

    function show(name) {
        [...tabs.querySelectorAll(".settingsTab")].forEach(b => b.classList.toggle("active", b.textContent === name));
        [...scroll.querySelectorAll(".settingsExtraPanel")].forEach(p => p.style.display = p.dataset.settingsTab === name ? "block" : "none");
        originalGroups.forEach(p => p.style.display = name === "Graphics" ? "block" : "none");
        const title = document.getElementById("settingsSectionTitle");
        if (title) title.textContent = name;
        scroll.scrollTop = 0;
    }

    [...tabs.querySelectorAll(".settingsTab")].forEach(button => {
        if (button.dataset.settingsTab === "") return;
        button.addEventListener("click", () => show(button.textContent));
    });
    if (original) original.addEventListener("click", () => show("Graphics"));
    show("Graphics");

    wireRange("extraMouseSensitivity", "mouseSensitivity", v => { settings.mouseSensitivity = v; });
    wireRange("extraTouchSensitivity", "touchSensitivity", v => { settings.touchSensitivity = v; });
    wireRange("extraMasterVolume", "masterVolume", v => { settings.masterVolume = v; });
    wireRange("extraUiOpacity", "uiOpacity", v => { settings.uiOpacity = v; document.documentElement.style.setProperty("--ui-opacity", v); });
    wireSelect("extraRenderDistance", "renderDistance");
    wireCheck("extraInvertY", "invertY");
    wireCheck("extraFog", "fog");
    wireCheck("extraWaterEffects", "waterEffects");
    wireCheck("extraCrosshair", "crosshair");
    wireCheck("extraHotbar", "hotbar");
    wireCheck("extraPerformanceHud", "performanceHud");
    wireCheck("extraLargeUi", "largeUi", v => document.body.classList.toggle("settings-large-ui", v));
    wireCheck("extraHighContrast", "highContrast", v => document.body.classList.toggle("settings-high-contrast", v));
    wireCheck("extraReducedMotion", "reducedMotion", v => document.body.classList.toggle("settings-reduced-motion", v));
    wireCheck("extraSoundEffects", "soundEffects");
    wireCheck("extraMusic", "music");

    document.documentElement.style.setProperty("--ui-opacity", settings.uiOpacity);
    document.body.classList.toggle("settings-large-ui", settings.largeUi);
    document.body.classList.toggle("settings-high-contrast", settings.highContrast);
    document.body.classList.toggle("settings-reduced-motion", settings.reducedMotion);

    function wireRange(id, key, after) {
        const el = document.getElementById(id); if (!el) return;
        el.value = settings[key];
        el.addEventListener("input", () => { settings[key] = Number(el.value); after?.(settings[key]); save(); toast(); });
    }
    function wireSelect(id, key) {
        const el = document.getElementById(id); if (!el) return;
        el.value = String(settings[key]);
        el.addEventListener("change", () => { settings[key] = Number(el.value); save(); toast(); });
    }
    function wireCheck(id, key, after) {
        const el = document.getElementById(id); if (!el) return;
        el.checked = !!settings[key];
        el.addEventListener("change", () => { settings[key] = el.checked; after?.(el.checked); save(); toast(); });
    }
}

export function setupSettingsExtras() {
    const start = () => buildPanels();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
}

setupSettingsExtras();
