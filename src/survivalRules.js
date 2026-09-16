import { isSurvivalWorld } from "./survivalMode.js";
import "./survivalInventory.js";
import "./survivalInventoryCompact.css";
import "./survivalMiningSystemV2.js";

const MAX_HEALTH = 20;
let lastSurvivalState = null;
let lastInWorldState = null;
function isInWorld() {
    const mainMenu = document.getElementById("mainMenu");
    const savedWorlds = document.getElementById("savedWorlds");
    const seedMenu = document.getElementById("seedMenu");
    const gameStarted = mainMenu?.style.display === "none";
    const worldsOpen = savedWorlds && savedWorlds.style.display !== "none";
    const seedOpen = seedMenu && seedMenu.style.display !== "none";
    return Boolean(gameStarted && !worldsOpen && !seedOpen);
}
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
        style.textContent = `#webMinecraftHealthHud{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:10001;display:none;align-items:center;gap:7px;padding:6px 10px;background:rgba(18,18,18,.82);border:2px solid rgba(0,0,0,.86);border-top-color:rgba(255,255,255,.22);border-left-color:rgba(255,255,255,.18);border-radius:6px;box-shadow:0 4px 18px rgba(0,0,0,.3);font:700 12px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none;white-space:nowrap}body.webminecraft-survival.webminecraft-in-world #webMinecraftHealthHud{display:flex!important}body.webminecraft-survival.webminecraft-in-world #touchFly{display:none!important}.healthLabel{color:#aaa;font-size:10px;letter-spacing:.6px}.healthHearts{color:#ef5350;letter-spacing:1px;font-size:15px;line-height:1;white-space:nowrap}.healthValue{color:#fff;font-size:11px}@media(max-width:700px){#webMinecraftHealthHud{bottom:76px;padding:5px 8px}.healthHearts{font-size:12px;letter-spacing:0}.healthValue{font-size:10px}}`;
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
    if (hearts.textContent !== heartText) hearts.textContent = heartText;
    const ariaLabel = `${clamped} health`;
    if (hearts.getAttribute("aria-label") !== ariaLabel) hearts.setAttribute("aria-label", ariaLabel);
    const healthText = `${clamped}/20`;
    if (value.textContent !== healthText) value.textContent = healthText;
}
function syncState() {
    const survival = isSurvivalWorld();
    const inWorld = isInWorld();
    if (survival !== lastSurvivalState || inWorld !== lastInWorldState) {
        lastSurvivalState = survival;
        lastInWorldState = inWorld;
        document.body.classList.toggle("webminecraft-survival", survival);
        document.body.classList.toggle("webminecraft-creative", !survival);
        document.body.classList.toggle("webminecraft-in-world", inWorld);
    }
    if (survival && inWorld) {
        if (window.webMinecraftSurvivalHealth == null) window.webMinecraftSurvivalHealth = MAX_HEALTH;
        addHealthHud();
        updateHealthHud();
        document.getElementById("touchFly")?.classList.remove("pressed");
    }
}
function init() {
    addHealthHud();
    syncState();
    window.setInterval(syncState, 100);
    document.addEventListener("keydown", event => { if (!isSurvivalWorld() || event.code !== "KeyF") return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
    document.addEventListener("pointerdown", event => { if (!isSurvivalWorld()) return; const flyButton = event.target.closest?.("#touchFly"); if (!flyButton) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
    document.addEventListener("click", event => { if (!isSurvivalWorld()) return; const flyButton = event.target.closest?.("#touchFly"); if (!flyButton) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
