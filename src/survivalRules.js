import { isSurvivalWorld } from "./survivalMode.js";
import { setFlying } from "./controls.js";
import "./survivalInventory.js";
import "./survivalInventoryCompact.css";
import "./survivalMiningSystem.js";
import "./worldEditSave.js";

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
        hud.innerHTML = `<span class="healthHearts" aria-label="20 health">❤❤❤❤❤❤❤❤❤❤</span>`;
        document.body.appendChild(hud);
    }
    if (!document.getElementById("webMinecraftHealthStyles")) {
        const style = document.createElement("style");
        style.id = "webMinecraftHealthStyles";
        style.textContent = `#webMinecraftHealthHud{position:fixed;left:0;bottom:84px;transform:none;z-index:10001;display:none;align-items:center;padding:0;pointer-events:none;white-space:nowrap}body.webminecraft-survival.webminecraft-in-world #webMinecraftHealthHud{display:flex!important}body.webminecraft-survival.webminecraft-in-world #touchFly{display:none!important}.healthHearts{color:#ef5350;letter-spacing:1px;font-size:20px;line-height:1;text-shadow:2px 2px 0 #000,-1px -1px 0 #000;white-space:nowrap}@media(max-width:700px){.healthHearts{font-size:16px;letter-spacing:0}}`;
        document.head.appendChild(style);
    }
}
function positionHealthHud() {
    const hud = document.getElementById("webMinecraftHealthHud");
    const hotbar = document.getElementById("hotbar");
    if (!hud || !hotbar) return;

    const rect = hotbar.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Always anchor the hearts to the real rendered hotbar. Multiplayer can
    // recreate/re-style the hotbar after the world opens, so do not rely on a
    // fixed screen position or on the survival-mode lookup timing.
    hud.style.left = `${Math.round(rect.left + 4)}px`;
    hud.style.bottom = `${Math.max(0, Math.round(window.innerHeight - rect.top + 6))}px`;
    hud.style.transform = "none";
}
function updateHealthHud() {
    const hud = document.getElementById("webMinecraftHealthHud");
    if (!hud || !isSurvivalWorld()) return;
    const hearts = hud.querySelector(".healthHearts");
    if (!hearts) return;
    const health = Number(window.webMinecraftSurvivalHealth ?? MAX_HEALTH);
    const clamped = Math.max(0, Math.min(MAX_HEALTH, health));
    const full = Math.floor(clamped / 2);
    const half = clamped % 2;
    const heartText = "❤".repeat(full) + (half ? "♥" : "") + "♡".repeat(10 - full - half);
    if (hearts.textContent !== heartText) hearts.textContent = heartText;
    const ariaLabel = `${clamped} health`;
    if (hearts.getAttribute("aria-label") !== ariaLabel) hearts.setAttribute("aria-label", ariaLabel);
    positionHealthHud();
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
    if (inWorld) {
        addHealthHud();
        // Position independently of the mode lookup so multiplayer has the
        // same hotbar-relative placement as singleplayer.
        positionHealthHud();
        requestAnimationFrame(positionHealthHud);

        if (survival) {
            if (window.webMinecraftSurvivalHealth == null) window.webMinecraftSurvivalHealth = MAX_HEALTH;
            updateHealthHud();
            setFlying(false);
        }
    }
}
function init() {
    addHealthHud();
    syncState();
    window.setInterval(syncState, 100);
    window.addEventListener("resize", positionHealthHud);

    // Re-anchor after multiplayer joins, hotbar texture/layout changes, or
    // any late UI sizing change.
    const hotbar = document.getElementById("hotbar");
    if (hotbar && typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(positionHealthHud);
        observer.observe(hotbar);
    }
    window.addEventListener("webminecraft-modechange", () => {
        requestAnimationFrame(positionHealthHud);
    });
    document.addEventListener("keydown", event => { if (!isSurvivalWorld() || event.code !== "KeyF") return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
    document.addEventListener("pointerdown", event => { if (!isSurvivalWorld()) return; const flyButton = event.target.closest?.("#touchFly"); if (!flyButton) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
    document.addEventListener("click", event => { if (!isSurvivalWorld()) return; const flyButton = event.target.closest?.("#touchFly"); if (!flyButton) return; event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); }, true);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();