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

function addPickerStyles() {
    if (document.getElementById("survivalModePickerStyles")) return;
    const style = document.createElement("style");
    style.id = "survivalModePickerStyles";
    style.textContent = `
#savedWorlds .sw2-mode-label{margin-top:18px;margin-bottom:8px;font-weight:800;color:#ddd}
#savedWorlds .sw2-mode-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
#savedWorlds .sw2-mode-card{position:relative;min-height:112px;padding:15px;border:2px solid #171717;border-radius:9px;background:linear-gradient(145deg,#383838,#242424);color:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 0 #111,0 8px 18px #0006;transition:transform .12s ease,border-color .12s ease,background .12s ease,box-shadow .12s ease;box-sizing:border-box}
#savedWorlds .sw2-mode-card:hover{transform:translateY(-1px);background:linear-gradient(145deg,#464646,#292929)}
#savedWorlds .sw2-mode-card.selected{border-color:#a7d36d;background:linear-gradient(145deg,#4f6539,#293421);box-shadow:0 4px 0 #18210f,0 8px 18px #0007}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected{border-color:#8eb9df;background:linear-gradient(145deg,#3d5870,#263543);box-shadow:0 4px 0 #17232d,0 8px 18px #0007}
#savedWorlds .sw2-mode-icon{font-size:27px;line-height:1;margin-bottom:8px}
#savedWorlds .sw2-mode-title{font-size:15px;font-weight:900;display:block;margin-bottom:4px}
#savedWorlds .sw2-mode-desc{display:block;color:#bcbcbc;font-size:10px;line-height:1.35}
#savedWorlds .sw2-mode-check{position:absolute;right:9px;top:8px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-size:12px;opacity:0}
#savedWorlds .sw2-mode-card.selected .sw2-mode-check{opacity:1;background:#86ad55}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected .sw2-mode-check{background:#6c9bc3}
#savedWorlds [data-world-mode]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
@media(max-width:560px){#savedWorlds .sw2-mode-picker{grid-template-columns:1fr}.sw2-mode-card{min-height:94px!important}}
`;
    document.head.appendChild(style);
}

function addModePicker() {
    const modal = document.getElementById("savedWorlds")?.querySelector(".sw2-modal-card");
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
    select.innerHTML = `<option value="survival">Survival</option><option value="creative">Creative</option>`;
    const modes = [
        { mode:"survival", icon:"⛏️", title:"Survival", desc:"Achievements enabled • normal movement" },
        { mode:"creative", icon:"🧱", title:"Creative", desc:"Achievements disabled • flying enabled" },
    ];

    const cards = modes.map(({ mode, icon, title, desc }) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "sw2-mode-card";
        card.dataset.mode = mode;
        card.setAttribute("role", "radio");
        card.innerHTML = `<span class="sw2-mode-check">✓</span><span class="sw2-mode-icon">${icon}</span><span class="sw2-mode-title">${title}</span><span class="sw2-mode-desc">${desc}</span>`;
        card.addEventListener("click", () => setMode(mode));
        picker.appendChild(card);
        return card;
    });

    function setMode(mode) {
        select.value = mode;
        cards.forEach(card => {
            const selected = card.dataset.mode === mode;
            card.classList.toggle("selected", selected);
            card.setAttribute("aria-checked", String(selected));
        });
        select.dispatchEvent(new Event("change", { bubbles:true }));
    }

    select.addEventListener("change", () => setMode(select.value));
    setMode("survival");

    const help = document.createElement("p");
    help.className = "sw2-help";
    help.style.margin = "10px 0 0";
    help.textContent = "Survival gives you health, disables flight, and tracks your achievements. Creative is free-building with flight and no achievement progress.";

    const seed = modal.querySelector("[data-new-seed]");
    seed?.parentElement?.insertAdjacentElement("afterend", label);
    label.insertAdjacentElement("afterend", picker);
    picker.insertAdjacentElement("afterend", select);
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
