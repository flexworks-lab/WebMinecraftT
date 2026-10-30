// Keep the native Game Mode dropdown authoritative for Singleplayer world creation.
const MODE_KEY_PREFIX = "webminecraft-world-mode-";
const PICKER_MARK = "data-singleplayer-game-mode-select-ready";

function normalizeMode(mode) {
    return String(mode || "").toLowerCase() === "creative" ? "creative" : "survival";
}

function normalizeSeed(value) {
    const n = Number(value);
    return Number.isFinite(n) ? (Math.floor(Math.abs(n)) >>> 0) : null;
}

function applyMode(mode, seed = null) {
    const value = normalizeMode(mode);
    window.webMinecraftSelectedWorldMode = value;
    window.__webminecraftPendingSingleplayerMode = value;
    document.body.classList.toggle("webminecraft-survival", value === "survival");
    document.body.classList.toggle("webminecraft-creative", value === "creative");
    try {
        localStorage.setItem("webminecraft-pending-singleplayer-mode", value);
        if (seed !== null) localStorage.setItem(`${MODE_KEY_PREFIX}${seed}`, value);
    } catch {}
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode: value } }));
}

function makeDropdownVisible(select) {
    // The legacy card picker hid the native select. Clear that legacy state and
    // force the actual select to remain visible, clickable, and keyboard-accessible.
    select.removeAttribute("data-singleplayer-game-mode-hidden");
    select.style.cssText = [
        "position:static!important",
        "inset:auto!important",
        "display:block!important",
        "visibility:visible!important",
        "opacity:1!important",
        "pointer-events:auto!important",
        "width:100%!important",
        "min-width:180px!important",
        "height:38px!important"
    ].join(";");
    select.closest(".createWorldSettingsControl")?.querySelectorAll(".sp-game-mode-picker,.sw2-mode-label,.sw2-help").forEach(node => {
        if (node !== select) node.remove();
    });
}

function enhanceModal(modal) {
    if (!modal) return;
    const select = modal.querySelector("#cwGameMode");
    const seed = modal.querySelector("[data-new-seed]");
    if (!select) return;

    makeDropdownVisible(select);
    if (select.hasAttribute(PICKER_MARK)) return;
    select.setAttribute(PICKER_MARK, "1");

    const sync = () => {
        const value = normalizeMode(select.value);
        select.value = value;
        const seedValue = normalizeSeed(seed?.textContent?.trim());
        applyMode(value, seedValue);
    };

    select.addEventListener("change", sync);
    select.addEventListener("input", sync);
    sync();
}

function rememberModeBeforeCreate(event) {
    const create = event.target.closest?.('#savedWorlds [data-act="create"]');
    if (!create) return;
    const modal = document.querySelector("#savedWorlds .sw2-modal");
    const select = modal?.querySelector("#cwGameMode");
    const seed = normalizeSeed(modal?.querySelector("[data-new-seed]")?.textContent?.trim());
    if (select) applyMode(select.value, seed);
}

function init() {
    const observer = new MutationObserver(() => {
        const modal = document.querySelector("#savedWorlds .sw2-modal");
        if (modal) enhanceModal(modal);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const onReady = () => {
        const modal = document.querySelector("#savedWorlds .sw2-modal");
        if (modal) enhanceModal(modal);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady, { once: true });
    else onReady();
    document.addEventListener("click", rememberModeBeforeCreate, true);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
