import { isSurvivalWorld } from "./survivalMode.js";

const MAX_HEALTH = 20;
let lastSurvivalState = null;

function addHealthHud() {
    let hud = document.getElementById("webMinecraftHealthHud");
    if (!hud) {
        hud = document.createElement("div");
        hud.id = "webMinecraftHealthHud";
        hud.innerHTML = `<span class="healthLabel">HP</span><span class="healthHearts" aria-label="20 health">❤❤❤❤❤❤❤❤❤❤</span><span class="healthValue">20/20</span>`;
        document.body.appendChild(hud);
    }

    if (!document.getElementById("webMinecraftHealthStyles")) {
        const style = document.createElement("style");
        style.id = "webMinecraftHealthStyles";
        style.textContent = `
#webMinecraftHealthHud{position:fixed;left:14px;top:14px;z-index:9998;display:none;align-items:center;gap:7px;padding:8px 10px;background:rgba(18,18,18,.78);border:2px solid rgba(0,0,0,.82);border-top-color:rgba(255,255,255,.2);border-left-color:rgba(255,255,255,.16);border-radius:7px;box-shadow:0 4px 18px rgba(0,0,0,.28);font:700 12px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none}
body.webminecraft-survival #webMinecraftHealthHud{display:flex!important}
body.webminecraft-survival #touchFly{display:none!important}
.healthLabel{color:#aaa;font-size:10px;letter-spacing:.6px}.healthHearts{color:#ef5350;letter-spacing:1px;font-size:15px;line-height:1;white-space:nowrap}.healthValue{color:#fff;font-size:11px}
@media(max-width:600px){#webMinecraftHealthHud{left:8px;top:8px;padding:7px 8px}.healthHearts{font-size:12px;letter-spacing:0}.healthValue{font-size:10px}}
`;
        document.head.appendChild(style);
    }
}

function updateHealthHud() {
    const hud = document.getElementById("webMinecraftHealthHud");
    if (!hud || !isSurvivalWorld()) return;
    const hearts = hud.querySelector(".healthHearts");
    const value = hud.querySelector(".healthValue");
    if (!hearts || !value) return;

    const health = Number(window.webMinecraftSurvivalHealth ?? MAX_HEALTH);
    const clamped = Math.max(0, Math.min(MAX_HEALTH, health));
    const full = Math.floor(clamped / 2);
    const half = clamped % 2;
    const heartText = "❤".repeat(full) + (half ? "♥" : "") + "♡".repeat(10 - full - half);
    hearts.textContent = heartText;
    hearts.setAttribute("aria-label", `${clamped} health`);
    value.textContent = `${clamped}/20`;
}

function syncSurvivalState() {
    const survival = isSurvivalWorld();
    if (survival === lastSurvivalState) {
        if (survival) updateHealthHud();
        return;
    }

    lastSurvivalState = survival;
    document.body.classList.toggle("webminecraft-survival", survival);
    document.body.classList.toggle("webminecraft-creative", !survival);

    if (survival) {
        window.webMinecraftSurvivalHealth = MAX_HEALTH;
        addHealthHud();
        updateHealthHud();
        document.getElementById("touchFly")?.classList.remove("pressed");
    } else {
        document.getElementById("webMinecraftHealthHud")?.style.setProperty("display", "none", "important");
    }
}

function init() {
    addHealthHud();
    syncSurvivalState();

    // World creation uses history.replaceState(), which does not fire popstate.
    // Polling lets the Survival state activate immediately after a new world opens.
    window.setInterval(syncSurvivalState, 100);

    document.addEventListener("keydown", event => {
        if (!isSurvivalWorld() || event.code !== "KeyF") return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    document.addEventListener("pointerdown", event => {
        if (!isSurvivalWorld()) return;
        const flyButton = event.target.closest?.("#touchFly");
        if (!flyButton) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);

    document.addEventListener("click", event => {
        if (!isSurvivalWorld()) return;
        const flyButton = event.target.closest?.("#touchFly");
        if (!flyButton) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }, true);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
