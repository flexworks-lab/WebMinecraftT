import { isSurvivalWorld } from "./survivalMode.js";

const MAX_HEALTH = 20;

function addHealthHud() {
    if (document.getElementById("webMinecraftHealthHud")) return;
    const hud = document.createElement("div");
    hud.id = "webMinecraftHealthHud";
    hud.innerHTML = `<span class="healthLabel">HP</span><span class="healthHearts" aria-label="20 health">❤❤❤❤❤❤❤❤❤❤</span><span class="healthValue">20/20</span>`;
    document.body.appendChild(hud);

    const style = document.createElement("style");
    style.id = "webMinecraftHealthStyles";
    style.textContent = `
#webMinecraftHealthHud{position:fixed;left:14px;top:14px;z-index:9998;display:none;align-items:center;gap:7px;padding:8px 10px;background:rgba(18,18,18,.72);border:2px solid rgba(0,0,0,.82);border-top-color:rgba(255,255,255,.2);border-left-color:rgba(255,255,255,.16);border-radius:7px;box-shadow:0 4px 18px rgba(0,0,0,.28);font:700 12px Arial,sans-serif;text-shadow:1px 1px 0 #000;backdrop-filter:blur(5px)}
body.webminecraft-survival.webminecraft-in-world #webMinecraftHealthHud{display:flex}
.healthLabel{color:#aaa;font-size:10px;letter-spacing:.6px}.healthHearts{color:#ef5350;letter-spacing:1px;font-size:13px;white-space:nowrap}.healthValue{color:#fff;font-size:11px}
@media(max-width:600px){#webMinecraftHealthHud{left:8px;top:8px;padding:7px 8px}.healthHearts{font-size:11px;letter-spacing:0}.healthValue{font-size:10px}}
`;
    document.head.appendChild(style);
}

function updateHealthHud() {
    const hud = document.getElementById("webMinecraftHealthHud");
    if (!hud) return;
    const hearts = hud.querySelector(".healthHearts");
    const value = hud.querySelector(".healthValue");
    if (!isSurvivalWorld()) return;
    const health = Number(window.webMinecraftSurvivalHealth ?? MAX_HEALTH);
    const clamped = Math.max(0, Math.min(MAX_HEALTH, health));
    const full = Math.floor(clamped / 2);
    const half = clamped % 2;
    hearts.textContent = "❤".repeat(full) + (half ? "♥" : "") + "♡".repeat(10 - full - half);
    hearts.setAttribute("aria-label", `${clamped} health`);
    value.textContent = `${clamped}/20`;
}

function enforceNoFlight() {
    if (!isSurvivalWorld()) return;
    document.body.classList.add("webminecraft-no-flight");
}

function init() {
    addHealthHud();
    enforceNoFlight();
    window.webMinecraftSurvivalHealth = MAX_HEALTH;
    updateHealthHud();

    document.addEventListener("keydown", event => {
        if (!isSurvivalWorld() || event.code !== "KeyF") return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);

    document.addEventListener("pointerdown", event => {
        if (!isSurvivalWorld()) return;
        if (!event.target.closest?.("#touchFly")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);

    const observer = new MutationObserver(() => {
        enforceNoFlight();
        updateHealthHud();
    });
    observer.observe(document.body, { attributes:true, attributeFilter:["class"], childList:true, subtree:true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
