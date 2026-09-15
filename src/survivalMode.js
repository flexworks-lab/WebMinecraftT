const MODE_PREFIX = "webminecraft-world-mode-";

function getSeed() {
    const value = Number(new URLSearchParams(window.location.search).get("seed"));
    return Number.isFinite(value) ? (Math.floor(Math.abs(value)) >>> 0) : null;
}

export function getWorldMode(seed = getSeed()) {
    if (seed === null) return "creative";
    try { return localStorage.getItem(`${MODE_PREFIX}${seed}`) || "creative"; } catch { return "creative"; }
}

export function isSurvivalWorld(seed = getSeed()) {
    return getWorldMode(seed) === "survival";
}

function saveWorldMode(seed, mode) {
    if (seed === null) return;
    try { localStorage.setItem(`${MODE_PREFIX}${seed}`, mode === "survival" ? "survival" : "creative"); } catch {}
}

function addModePicker() {
    const modal = document.getElementById("savedWorlds")?.querySelector(".sw2-modal-card");
    if (!modal || modal.querySelector("[data-world-mode]")) return false;

    const label = document.createElement("p");
    label.className = "sw2-label";
    label.textContent = "Game mode";

    const select = document.createElement("select");
    select.dataset.worldMode = "";
    select.className = "sw2-field";
    select.style.marginTop = "0";
    select.innerHTML = `
        <option value="survival">⛏️ Survival — achievements enabled</option>
        <option value="creative">🧱 Creative — achievements disabled</option>
    `;

    const help = document.createElement("p");
    help.className = "sw2-help";
    help.dataset.worldModeHelp = "";
    help.style.marginTop = "8px";
    help.textContent = "Survival worlds enable achievement progress. Creative worlds do not track achievements.";

    const seed = modal.querySelector("[data-new-seed]");
    seed?.parentElement?.insertAdjacentElement("afterend", label);
    label.insertAdjacentElement("afterend", select);
    select.insertAdjacentElement("afterend", help);
    return true;
}

function rememberCreateMode() {
    const seedElement = document.querySelector("#savedWorlds [data-new-seed]");
    const select = document.querySelector("#savedWorlds [data-world-mode]");
    if (!seedElement || !select) return;
    const seed = Number(seedElement.textContent.trim());
    if (!Number.isFinite(seed)) return;
    saveWorldMode(Math.floor(Math.abs(seed)) >>> 0, select.value);
}

function markCurrentWorld() {
    const mode = getWorldMode();
    document.body.classList.toggle("webminecraft-survival", mode === "survival");
    document.body.classList.toggle("webminecraft-creative", mode !== "survival");
}

function init() {
    const tryAddPicker = () => {
        if (addModePicker()) pickerObserver.disconnect();
    };

    const pickerObserver = new MutationObserver(tryAddPicker);
    tryAddPicker();
    if (!document.querySelector("#savedWorlds [data-world-mode]")) {
        pickerObserver.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener("click", event => {
        if (event.target.closest('#savedWorlds [data-act="create"]')) rememberCreateMode();
    }, true);

    markCurrentWorld();
    window.addEventListener("popstate", markCurrentWorld);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
