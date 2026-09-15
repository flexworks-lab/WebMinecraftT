import "./friendsUi.js";
import { touchInput } from "./controls.js";

const WORLD_DB_NAME = "webminecraft-local-worlds";
const WORLD_STORE_NAME = "worlds";
const WORLD_CACHE_KEY = "webminecraft_saved_worlds";

function addGameplayLayoutStyles() {
    if (document.getElementById("webMinecraftGameplayLayoutFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftGameplayLayoutFixes";
    style.textContent = `
body.mobile-mode.webminecraft-in-world #settingsButton{top:18px !important;right:18px !important;z-index:90 !important}
body.mobile-mode.webminecraft-in-world #touchChatButton{top:76px !important;right:18px !important;bottom:auto !important;z-index:91 !important}
body.mobile-mode.webminecraft-in-world #touchActions{right:18px !important;bottom:24px !important;z-index:43 !important}
body.mobile-mode.webminecraft-in-world #touchMovePad{left:18px !important;bottom:24px !important;z-index:43 !important}
body.mobile-mode.webminecraft-in-world #touchLookArea{left:34% !important;right:0 !important;top:0 !important;bottom:0 !important}
body.mobile-mode.webminecraft-in-world #hotbar{bottom:18px !important;z-index:12 !important}
body.mobile-mode.webminecraft-in-world #crosshair{z-index:10 !important}
@media(max-width:700px){
body.mobile-mode.webminecraft-in-world #hotbar{transform:translateX(-50%) scale(.88);transform-origin:center bottom}
body.mobile-mode.webminecraft-in-world #touchActions{transform:scale(.9);transform-origin:right bottom}
body.mobile-mode.webminecraft-in-world #touchMovePad{transform:scale(.9);transform-origin:left bottom}
}
#savedWorldDeleteAll{background:linear-gradient(#8d5353,#6e4040) !important}
@media(max-width:700px){#savedWorldDeleteAll{width:100%}}
.savedWorldCardDelete{background:linear-gradient(#8d5353,#6e4040) !important}
`;
    document.head.appendChild(style);
}

function openWorldDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(WORLD_DB_NAME, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open world storage."));
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(WORLD_STORE_NAME)) db.createObjectStore(WORLD_STORE_NAME, { keyPath: "seed" });
        };
    });
}

function deleteWorldSeed(seed) {
    return openWorldDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(WORLD_STORE_NAME, "readwrite");
        tx.objectStore(WORLD_STORE_NAME).delete(Number(seed) >>> 0);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("Could not delete world."));
        tx.onabort = () => reject(tx.error || new Error("Could not delete world."));
    }));
}

function deleteAllWorlds() {
    return openWorldDatabase().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(WORLD_STORE_NAME, "readwrite");
        tx.objectStore(WORLD_STORE_NAME).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("Could not delete saved worlds."));
        tx.onabort = () => reject(tx.error || new Error("Could not delete saved worlds."));
    })).then(() => {
        try { localStorage.removeItem(WORLD_CACHE_KEY); } catch {}
    });
}

function addDeleteAllButton() {
    const header = document.getElementById("savedWorldsHeader");
    if (!header || document.getElementById("savedWorldDeleteAll")) return;
    const backButton = document.getElementById("savedWorldBack");
    const button = document.createElement("button");
    button.id = "savedWorldDeleteAll";
    button.className = "savedWorldButton";
    button.type = "button";
    button.textContent = "Delete All";
    button.title = "Delete every saved world from this browser";
    button.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        const countText = document.getElementById("savedWorldsCount")?.textContent || "saved worlds";
        if (!window.confirm(`Delete all ${countText}? This cannot be undone.`)) return;
        button.disabled = true;
        try { await deleteAllWorlds(); window.location.reload(); }
        catch (error) { button.disabled = false; window.alert(error?.message || "Could not delete saved worlds."); }
    });
    if (backButton) header.insertBefore(button, backButton); else header.appendChild(button);
}

function addPerWorldDeleteButtons() {
    const grid = document.getElementById("savedWorldsGrid");
    if (!grid) return;
    for (const card of grid.querySelectorAll(".savedWorldCard")) {
        if (card.querySelector(".savedWorldCardDelete")) continue;
        const actions = card.querySelector(".savedWorldActions");
        const playButton = card.querySelector(".savedWorldPlay");
        if (!actions || !playButton) continue;
        const meta = card.querySelector(".savedWorldMeta")?.textContent || "";
        const seedMatch = meta.match(/Seed:\s*(\d+)/);
        if (!seedMatch) continue;
        const seed = Number(seedMatch[1]);
        const button = document.createElement("button");
        button.className = "savedWorldButton savedWorldCardDelete";
        button.type = "button";
        button.textContent = "Delete";
        button.addEventListener("click", async event => {
            event.preventDefault(); event.stopPropagation();
            const name = card.querySelector("h3")?.textContent || "this world";
            if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
            button.disabled = true;
            try {
                await deleteWorldSeed(seed);
                card.remove();
                const count = document.getElementById("savedWorldsCount");
                if (count) { const total = grid.querySelectorAll(".savedWorldCard").length; count.textContent = `${total} saved world${total === 1 ? "" : "s"}`; }
            } catch (error) { button.disabled = false; window.alert(error?.message || "Could not delete this world."); }
        });
        actions.appendChild(button);
    }
}

function setupWorldManagement() {
    addDeleteAllButton();
    addPerWorldDeleteButtons();
    const overlay = document.getElementById("savedWorlds");
    if (!overlay || overlay.dataset.managementFixesInstalled) return;
    overlay.dataset.managementFixesInstalled = "1";
    const observer = new MutationObserver(() => { addDeleteAllButton(); addPerWorldDeleteButtons(); });
    const header = document.getElementById("savedWorldsHeader");
    const grid = document.getElementById("savedWorldsGrid");
    if (header) observer.observe(header, { childList:true, subtree:true });
    if (grid) observer.observe(grid, { childList:true, subtree:true });
}

function setupMobileJoystick() {
    const attach = () => {
        const pad = document.getElementById("touchMovePad");
        if (!pad || pad.dataset.joystickInstalled) return;
        pad.dataset.joystickInstalled = "1";
        pad.innerHTML = `<div id="mobileJoystickBase" aria-label="Movement joystick"><div id="mobileJoystickThumb"></div></div>`;
        const base = pad.querySelector("#mobileJoystickBase");
        const thumb = pad.querySelector("#mobileJoystickThumb");
        let pointerId = null;
        const radius = 58;

        const update = (clientX, clientY) => {
            const rect = base.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let dx = clientX - cx;
            let dy = clientY - cy;
            const distance = Math.hypot(dx, dy);
            if (distance > radius) { dx = dx / distance * radius; dy = dy / distance * radius; }
            touchInput.moveX = dx / radius;
            // The player movement code treats positive moveZ as forward.
            // Screen Y grows downward, so pushing the joystick upward (negative dy)
            // must produce positive moveZ.
            touchInput.moveZ = -dy / radius;
            thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        };
        const reset = () => {
            pointerId = null;
            touchInput.moveX = 0;
            touchInput.moveZ = 0;
            thumb.style.transform = "translate(-50%, -50%)";
            base.classList.remove("active");
        };
        base.addEventListener("pointerdown", event => {
            event.preventDefault(); event.stopPropagation();
            if (pointerId !== null) return;
            pointerId = event.pointerId;
            base.setPointerCapture?.(event.pointerId);
            base.classList.add("active");
            update(event.clientX, event.clientY);
        }, { passive:false });
        base.addEventListener("pointermove", event => {
            if (event.pointerId !== pointerId) return;
            event.preventDefault(); update(event.clientX, event.clientY);
        }, { passive:false });
        base.addEventListener("pointerup", reset);
        base.addEventListener("pointercancel", reset);
        base.addEventListener("lostpointercapture", reset);

        const style = document.createElement("style");
        style.id = "mobileJoystickStyles";
        style.textContent = `
body.mobile-mode.webminecraft-in-world #touchMovePad{width:132px !important;height:132px !important;display:block !important;pointer-events:none !important;filter:none !important}
#touchMovePad .moveKey{display:none !important}
#mobileJoystickBase{position:absolute;left:0;bottom:0;width:132px;height:132px;border-radius:50%;box-sizing:border-box;border:3px solid rgba(255,255,255,.32);background:rgba(0,0,0,.32);box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),0 3px 8px rgba(0,0,0,.45);pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#mobileJoystickBase.active{background:rgba(0,0,0,.4)}
#mobileJoystickThumb{position:absolute;left:50%;top:50%;width:62px;height:62px;border-radius:50%;box-sizing:border-box;border:3px solid rgba(255,255,255,.55);background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 2px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.45);pointer-events:none;transform:translate(-50%,-50%)}
@media(max-width:700px){body.mobile-mode.webminecraft-in-world #touchMovePad{transform:none !important}}
@media(orientation:portrait){body.mobile-mode.webminecraft-in-world #touchMovePad{width:118px !important;height:118px !important}#mobileJoystickBase{width:118px;height:118px}}
`;
        document.head.appendChild(style);
    };
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList:true, subtree:true });
}

function init() {
    addGameplayLayoutStyles();
    setupWorldManagement();
    setupMobileJoystick();
    const observer = new MutationObserver(() => setupWorldManagement());
    observer.observe(document.body, { childList:true, subtree:true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();