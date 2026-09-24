// Reliable game-mode selector for Singleplayer > Create New World.
// Keeps the native select for compatibility while giving the player clear
// clickable Survival/Creative choices and making the selected mode authoritative.

const STYLE_ID = "webminecraft-singleplayer-game-mode-fix";
const PICKER_MARK = "data-singleplayer-game-mode-fix";
const MODE_KEY_PREFIX = "webminecraft-world-mode-";

function normalizeMode(mode) {
    return mode === "creative" ? "creative" : "survival";
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
    if (seed !== null) {
        try {
            localStorage.setItem(`${MODE_KEY_PREFIX}${seed}`, value);
            localStorage.setItem("webminecraft-pending-singleplayer-mode", value);
        } catch {}
    }
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode: value } }));
}

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#savedWorlds .sp-game-mode-picker{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px}
#savedWorlds .sp-game-mode-card{position:relative;min-height:118px;padding:15px 16px;border:2px solid #111;border-radius:7px;background:linear-gradient(180deg,#4b4b4b,#303030);color:#fff;text-align:left;cursor:pointer;font:inherit;box-shadow:0 4px 0 #101010;transition:transform .1s ease,filter .1s ease,border-color .1s ease,background .1s ease}
#savedWorlds .sp-game-mode-card:hover{transform:translateY(-1px);filter:brightness(1.08)}
#savedWorlds .sp-game-mode-card.selected{border-color:#91bf63;background:linear-gradient(180deg,#607b48,#405431);box-shadow:0 4px 0 #1b2514}
#savedWorlds .sp-game-mode-card[data-mode="creative"].selected{border-color:#83add4;background:linear-gradient(180deg,#506b86,#35495b);box-shadow:0 4px 0 #18242d}
#savedWorlds .sp-game-mode-icon{display:block;font-size:28px;line-height:1;margin-bottom:9px}
#savedWorlds .sp-game-mode-title{display:block;font-size:16px;font-weight:900;margin-bottom:5px}
#savedWorlds .sp-game-mode-desc{display:block;color:#ccc;font-size:10px;line-height:1.4;padding-right:18px}
#savedWorlds .sp-game-mode-check{position:absolute;right:9px;top:9px;width:21px;height:21px;display:grid;place-items:center;border-radius:50%;background:#111;color:#fff;font-size:12px;opacity:0}
#savedWorlds .sp-game-mode-card.selected .sp-game-mode-check{opacity:1;background:#83ad59}
#savedWorlds .sp-game-mode-card[data-mode="creative"].selected .sp-game-mode-check{background:#6f9bc1}
#savedWorlds #cwGameMode[data-singleplayer-game-mode-hidden]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
@media(max-width:560px){#savedWorlds .sp-game-mode-picker{grid-template-columns:1fr}.sp-game-mode-card{min-height:104px!important}}
`;
    document.head.appendChild(style);
}

function enhanceModal(modal) {
    if (!modal || modal.querySelector(`[${PICKER_MARK}]`)) return;
    const select = modal.querySelector("#cwGameMode");
    const seed = modal.querySelector("[data-new-seed]");
    if (!select || !seed) return;
    injectStyle();

    select.setAttribute("data-singleplayer-game-mode-hidden", "1");

    const label = document.createElement("p");
    label.className = "sw2-label sw2-mode-label";
    label.textContent = "Choose your game mode";

    const picker = document.createElement("div");
    picker.className = "sp-game-mode-picker";
    picker.setAttribute(PICKER_MARK, "1");
    picker.setAttribute("role", "radiogroup");
    picker.setAttribute("aria-label", "Game mode");

    const choices = [
        { mode: "survival", icon: "⛏️", title: "Survival", desc: "Gather resources, take damage, and play with normal mining." },
        { mode: "creative", icon: "🧱", title: "Creative", desc: "Fly, build freely, and use instant block breaking." }
    ];
    const cards = [];

    const syncCards = mode => {
        const value = normalizeMode(mode);
        select.value = value;
        for (const card of cards) {
            const selected = card.dataset.mode === value;
            card.classList.toggle("selected", selected);
            card.setAttribute("aria-checked", String(selected));
        }
        const currentSeed = normalizeSeed(seed.textContent.trim());
        applyMode(value, currentSeed);
        select.dispatchEvent(new Event("change", { bubbles: true }));
    };

    for (const choice of choices) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "sp-game-mode-card";
        card.dataset.mode = choice.mode;
        card.setAttribute("role", "radio");
        card.innerHTML = `<span class="sp-game-mode-check">✓</span><span class="sp-game-mode-icon">${choice.icon}</span><span class="sp-game-mode-title">${choice.title}</span><span class="sp-game-mode-desc">${choice.desc}</span>`;
        card.addEventListener("click", () => syncCards(choice.mode));
        picker.appendChild(card);
        cards.push(card);
    }

    const help = document.createElement("p");
    help.className = "sw2-help";
    help.style.margin = "10px 0 0";
    help.textContent = "The selected mode is saved to this new world's seed when you create it.";

    const gameModeRow = select.closest(".createWorldSettingsRow");
    const control = select.closest(".createWorldSettingsControl");
    if (control) {
        control.innerHTML = "";
        control.appendChild(select);
        control.appendChild(picker);
        control.appendChild(help);
        control.style.display = "block";
    } else if (gameModeRow) {
        gameModeRow.appendChild(picker);
    }

    syncCards("survival");
}

function rememberModeBeforeCreate(event) {
    const create = event.target.closest?.('#savedWorlds [data-act="create"]');
    if (!create) return;
    const modal = document.querySelector("#savedWorlds .sw2-modal");
    const select = modal?.querySelector("#cwGameMode");
    const seed = normalizeSeed(modal?.querySelector("[data-new-seed]")?.textContent?.trim());
    if (!select || seed === null) return;
    applyMode(select.value, seed);
}

function init() {
    const observer = new MutationObserver(() => {
        const modal = document.querySelector("#savedWorlds .sw2-modal");
        if (modal) enhanceModal(modal);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => {
        const modal = document.querySelector("#savedWorlds .sw2-modal");
        if (modal) enhanceModal(modal);
    }, { once: true });
    document.addEventListener("click", rememberModeBeforeCreate, true);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
