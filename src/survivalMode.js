import { getWorldSeed } from "./world.js";
import { yaw, pitch, resetView } from "./controls.js";

const MODE_PREFIX = "webminecraft-world-mode-";
const STATE_PREFIX = "webminecraft-singleplayer-world-state-";

function normalizeMode(mode) {
    return mode === "survival" ? "survival" : "creative";
}

function normalizeSeed(value) {
    const number = Number(value);
    return Number.isFinite(number) ? (Math.floor(Math.abs(number)) >>> 0) : null;
}

function getSeed() {
    return normalizeSeed(new URLSearchParams(window.location.search).get("seed"));
}

export function getWorldMode(seed = getSeed()) {
    const normalizedSeed = normalizeSeed(seed);
    const selectedMode = window.webMinecraftSelectedWorldMode;

    // Multiplayer room mode is authoritative while connected to a server.
    if (window.__webminecraftMultiplayerActive === true) {
        if (selectedMode === "survival" || selectedMode === "creative") return selectedMode;
        if (normalizedSeed === null) return "creative";
        try {
            return normalizeMode(localStorage.getItem(`${MODE_PREFIX}${normalizedSeed}`));
        } catch {
            return "creative";
        }
    }

    // Singleplayer worlds are identified by their seed. Always prefer the mode
    // saved for that exact seed so an old global mode cannot override Survival.
    if (normalizedSeed !== null) {
        try {
            const storedMode = localStorage.getItem(`${MODE_PREFIX}${normalizedSeed}`);
            if (storedMode === "survival" || storedMode === "creative") return storedMode;
        } catch {}
    }

    if (selectedMode === "survival" || selectedMode === "creative") return selectedMode;
    return "creative";
}

export function setWorldMode(seed, mode) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return;
    const value = normalizeMode(mode);
    try { localStorage.setItem(`${MODE_PREFIX}${normalizedSeed}`, value); } catch {}
}

export function isSurvivalWorld(seed = getSeed()) {
    return getWorldMode(seed) === "survival";
}

function worldStateKey(seed) {
    const normalizedSeed = normalizeSeed(seed);
    return normalizedSeed === null ? null : `${STATE_PREFIX}${normalizedSeed}`;
}

function readWorldState(seed) {
    const key = worldStateKey(seed);
    if (!key) return null;
    try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value && typeof value === "object" ? value : null;
    } catch {
        return null;
    }
}

function validNumber(value) {
    return Number.isFinite(Number(value));
}

function validPosition(position) {
    return position && validNumber(position.x) && validNumber(position.y) && validNumber(position.z);
}

function validInventory(value) {
    return Array.isArray(value) && value.length === 36;
}

function getStoredMode(seed) {
    const normalizedSeed = normalizeSeed(seed);
    if (normalizedSeed === null) return "creative";
    try {
        const value = localStorage.getItem(`${MODE_PREFIX}${normalizedSeed}`);
        return value === "survival" || value === "creative" ? value : "creative";
    } catch {
        return "creative";
    }
}

let syncedSeed = null;
let lastStateSave = 0;
let stateSyncStarted = false;

function shouldSyncSingleplayer() {
    return document.body.classList.contains("webminecraft-in-world") && window.__webminecraftMultiplayerActive !== true;
}

function loadSingleplayerWorldState() {
    if (!shouldSyncSingleplayer()) return;
    const camera = window.__webminecraftCamera;
    if (!camera) return;
    const seed = normalizeSeed(getWorldSeed());
    if (seed === null || seed === syncedSeed) return;

    syncedSeed = seed;
    lastStateSave = performance.now();

    const state = readWorldState(seed);
    const mode = normalizeMode(state?.mode || getStoredMode(seed));
    setWorldMode(seed, mode);
    window.webMinecraftSelectedWorldMode = mode;
    document.body.classList.toggle("webminecraft-survival", mode === "survival");
    document.body.classList.toggle("webminecraft-creative", mode !== "survival");
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode } }));

    if (validPosition(state?.position)) {
        camera.position.set(Number(state.position.x), Number(state.position.y), Number(state.position.z));
    }
    if (validNumber(state?.yaw) && validNumber(state?.pitch)) {
        resetView(Number(state.yaw), Number(state.pitch));
        camera.rotation.order = "YXZ";
        camera.rotation.y = Number(state.yaw);
        camera.rotation.x = Number(state.pitch);
    }

    if (validInventory(state?.inventory)) {
        try { localStorage.setItem("webminecraft_inventory", JSON.stringify(state.inventory)); } catch {}
        window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
    }
}

function saveSingleplayerWorldState(force = false) {
    if (!shouldSyncSingleplayer()) return;
    const camera = window.__webminecraftCamera;
    const seed = normalizeSeed(getWorldSeed());
    if (!camera || seed === null || (syncedSeed !== null && seed !== syncedSeed)) return;

    const now = performance.now();
    if (!force && now - lastStateSave < 500) return;
    lastStateSave = now;
    syncedSeed = seed;

    let inventory = [];
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        inventory = validInventory(saved) ? saved : Array.from({ length: 36 }, () => null);
    } catch {
        inventory = Array.from({ length: 36 }, () => null);
    }

    const mode = getWorldMode(seed);
    const state = {
        version: 1,
        seed,
        mode,
        position: {
            x: Number(camera.position.x),
            y: Number(camera.position.y),
            z: Number(camera.position.z)
        },
        yaw: Number(yaw),
        pitch: Number(pitch),
        inventory,
        updatedAt: new Date().toISOString()
    };

    const key = worldStateKey(seed);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}

function startSingleplayerWorldStateSync() {
    if (stateSyncStarted) return;
    stateSyncStarted = true;

    const sync = () => {
        if (!shouldSyncSingleplayer()) {
            syncedSeed = null;
            return;
        }
        loadSingleplayerWorldState();
        saveSingleplayerWorldState();
    };

    setInterval(sync, 100);
    window.addEventListener("pagehide", () => saveSingleplayerWorldState(true));
    window.addEventListener("beforeunload", () => saveSingleplayerWorldState(true));
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") saveSingleplayerWorldState(true);
    });
}

function addPickerStyles() {
    if (document.getElementById("survivalModePickerStyles")) return;
    const style = document.createElement("style");
    style.id = "survivalModePickerStyles";
    style.textContent = `
#savedWorlds .sw2-mode-label{margin-top:18px;margin-bottom:9px;font-weight:800;color:#eee}
#savedWorlds .sw2-mode-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
#savedWorlds .sw2-mode-card{position:relative;min-height:118px;padding:16px;border:2px solid #151515;border-radius:9px;background:linear-gradient(145deg,#383838,#242424);color:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 0 #101010,0 8px 18px #0006;transition:transform .12s ease,border-color .12s ease,background .12s ease,box-shadow .12s ease;box-sizing:border-box}
#savedWorlds .sw2-mode-card:hover{transform:translateY(-1px);background:linear-gradient(145deg,#454545,#292929)}
#savedWorlds .sw2-mode-card.selected{border-color:#a7d36d;background:linear-gradient(145deg,#50663a,#293521);box-shadow:0 4px 0 #18210f,0 8px 18px #0007}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected{border-color:#8eb9df;background:linear-gradient(145deg,#3d5870,#263543);box-shadow:0 4px 0 #17232d,0 8px 18px #0007}
#savedWorlds .sw2-mode-icon{font-size:28px;line-height:1;margin-bottom:8px;display:block}
#savedWorlds .sw2-mode-title{font-size:16px;font-weight:900;display:block;margin-bottom:5px}
#savedWorlds .sw2-mode-desc{display:block;color:#c3c3c3;font-size:10px;line-height:1.4}
#savedWorlds .sw2-mode-check{position:absolute;right:9px;top:8px;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-size:12px;opacity:0}
#savedWorlds .sw2-mode-card.selected .sw2-mode-check{opacity:1;background:#86ad55}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected .sw2-mode-check{background:#6c9bc3}
#savedWorlds [data-world-mode]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
@media(max-width:560px){#savedWorlds .sw2-mode-picker{grid-template-columns:1fr}.sw2-mode-card{min-height:100px!important}}
`;
    document.head.appendChild(style);
}

function applySelectedMode(mode) {
    const value = normalizeMode(mode);
    window.webMinecraftSelectedWorldMode = value;
    document.body.classList.toggle("webminecraft-survival", value === "survival");
    document.body.classList.toggle("webminecraft-creative", value !== "survival");
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode: value } }));
}

function addModePicker() {
    const modal = document.querySelector("#savedWorlds .sw2-modal-card");
    if (!modal || modal.querySelector("[data-world-mode]")) return false;
    addPickerStyles();

    const label = document.createElement("p");
    label.className = "sw2-label sw2-mode-label";
    label.textContent = "Choose your game mode";

    const picker = document.createElement("div");
    picker.className = "sw2-mode-picker";
    picker.setAttribute("role", "radiogroup");
    picker.setAttribute("aria-label", "Game mode");

    const select = document.createElement("select");
    select.dataset.worldMode = "";
    select.setAttribute("aria-label", "Game mode");
    select.innerHTML = `<option value="survival">Survival</option><option value="creative">Creative</option>`;

    const modes = [
        { mode:"survival", icon:"⛏️", title:"Survival", desc:"Health, normal mining, no flying, and achievements." },
        { mode:"creative", icon:"🧱", title:"Creative", desc:"Unlimited building, instant mining, flying, no health damage." },
    ];
    const cards = [];

    function setMode(mode) {
        const value = normalizeMode(mode);
        select.value = value;
        cards.forEach(card => {
            const selected = card.dataset.mode === value;
            card.classList.toggle("selected", selected);
            card.setAttribute("aria-checked", String(selected));
        });
        applySelectedMode(value);
    }

    for (const item of modes) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "sw2-mode-card";
        card.dataset.mode = item.mode;
        card.setAttribute("role", "radio");
        card.innerHTML = `<span class="sw2-mode-check">✓</span><span class="sw2-mode-icon">${item.icon}</span><span class="sw2-mode-title">${item.title}</span><span class="sw2-mode-desc">${item.desc}</span>`;
        card.addEventListener("click", () => setMode(item.mode));
        picker.appendChild(card);
        cards.push(card);
    }

    // Survival is the default for every newly-created world.
    setMode("survival");

    const help = document.createElement("p");
    help.className = "sw2-help";
    help.style.margin = "10px 0 0";
    help.textContent = "Pick the mode before creating the world. The selected mode is saved with that world's seed.";

    const seed = modal.querySelector("[data-new-seed]");
    seed?.parentElement?.insertAdjacentElement("afterend", label);
    label.insertAdjacentElement("afterend", picker);
    picker.insertAdjacentElement("afterend", select);
    select.insertAdjacentElement("afterend", help);
    return true;
}

function rememberCreateMode() {
    const seedElement = document.querySelector("#savedWorlds [data-new-seed]");
    const legacySelect = document.querySelector("#savedWorlds [data-world-mode]");
    const settingsSelect = document.querySelector("#savedWorlds #cwGameMode");
    const select = legacySelect || settingsSelect;
    if (!seedElement || !select) return;
    const seed = normalizeSeed(seedElement.textContent.trim());
    if (seed === null) return;
    const mode = normalizeMode(select.value);
    window.webMinecraftSelectedWorldMode = mode;
    setWorldMode(seed, mode);
    window.__webminecraftPendingSingleplayerMode = mode;
}

function markCurrentWorld() {
    const mode = getWorldMode();
    document.body.classList.toggle("webminecraft-survival", mode === "survival");
    document.body.classList.toggle("webminecraft-creative", mode !== "survival");
}

function init() {
    const tryAddPicker = () => {
        if (addModePicker()) observer.disconnect();
    };
    const observer = new MutationObserver(tryAddPicker);
    tryAddPicker();
    if (!document.querySelector("#savedWorlds [data-world-mode]")) observer.observe(document.body, { childList:true, subtree:true });

    document.addEventListener("click", event => {
        if (event.target.closest('#savedWorlds [data-act="create"]')) rememberCreateMode();
    }, true);

    markCurrentWorld();
    startSingleplayerWorldStateSync();
    window.addEventListener("popstate", markCurrentWorld);
    window.addEventListener("webminecraft-modechange", markCurrentWorld);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();