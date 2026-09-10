const WORLD_DB_NAME = "webminecraft-local-worlds";
const WORLD_STORE_NAME = "worlds";
const WORLD_CACHE_KEY = "webminecraft_saved_worlds";

function addGameplayLayoutStyles() {
    if (document.getElementById("webMinecraftGameplayLayoutFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftGameplayLayoutFixes";
    style.textContent = `
/* Keep the in-game controls in separate screen zones. */
body.mobile-mode.webminecraft-in-world #settingsButton{
    top:18px !important;
    right:18px !important;
    z-index:90 !important;
}
body.mobile-mode.webminecraft-in-world #touchChatButton{
    top:76px !important;
    right:18px !important;
    bottom:auto !important;
    z-index:91 !important;
}
body.mobile-mode.webminecraft-in-world #touchActions{
    right:18px !important;
    bottom:24px !important;
    z-index:43 !important;
}
body.mobile-mode.webminecraft-in-world #touchMovePad{
    left:18px !important;
    bottom:24px !important;
    z-index:43 !important;
}
body.mobile-mode.webminecraft-in-world #touchLookArea{
    left:34% !important;
    right:0 !important;
    top:0 !important;
    bottom:0 !important;
}
body.mobile-mode.webminecraft-in-world #hotbar{
    bottom:18px !important;
    z-index:12 !important;
}
body.mobile-mode.webminecraft-in-world #crosshair{
    z-index:10 !important;
}

/* Keep small screens from squeezing controls into the hotbar. */
@media(max-width:700px){
    body.mobile-mode.webminecraft-in-world #hotbar{transform:translateX(-50%) scale(.88);transform-origin:center bottom;}
    body.mobile-mode.webminecraft-in-world #touchActions{transform:scale(.9);transform-origin:right bottom;}
    body.mobile-mode.webminecraft-in-world #touchMovePad{transform:scale(.9);transform-origin:left bottom;}
}

/* Saved-world header actions stay separated instead of colliding on narrow screens. */
#savedWorldDeleteAll{background:linear-gradient(#8d5353,#6e4040) !important;}
@media(max-width:700px){
    #savedWorldDeleteAll{width:100%;}
}
.savedWorldCardDelete{background:linear-gradient(#8d5353,#6e4040) !important;}
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
        try {
            await deleteAllWorlds();
            window.location.reload();
        } catch (error) {
            button.disabled = false;
            window.alert(error?.message || "Could not delete saved worlds.");
        }
    });
    if (backButton) header.insertBefore(button, backButton);
    else header.appendChild(button);
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
            event.preventDefault();
            event.stopPropagation();
            const name = card.querySelector("h3")?.textContent || "this world";
            if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
            button.disabled = true;
            try {
                await deleteWorldSeed(seed);
                card.remove();
                const count = document.getElementById("savedWorldsCount");
                if (count) {
                    const total = grid.querySelectorAll(".savedWorldCard").length;
                    count.textContent = `${total} saved world${total === 1 ? "" : "s"}`;
                }
            } catch (error) {
                button.disabled = false;
                window.alert(error?.message || "Could not delete this world.");
            }
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
    const observer = new MutationObserver(() => {
        addDeleteAllButton();
        addPerWorldDeleteButtons();
    });
    const header = document.getElementById("savedWorldsHeader");
    const grid = document.getElementById("savedWorldsGrid");
    if (header) observer.observe(header, { childList:true, subtree:true });
    if (grid) observer.observe(grid, { childList:true, subtree:true });
}

function setupMobileForwardBackFix() {
    const attach = () => {
        const forward = document.getElementById("moveForward");
        const back = document.getElementById("moveBack");
        if (!forward || !back || !window.__webMinecraftTouchForwardFix) return;
        const state = window.__webMinecraftTouchForwardFix;
        if (state.installed) return;
        state.installed = true;
        state.forward = false;
        state.back = false;
        const update = () => {
            if (!state.forward && !state.back) return;
            if (state.forward && !state.back) window.__webMinecraftTouchInputRef.moveZ = Math.abs(window.__webMinecraftTouchInputRef.moveZ);
            else if (state.back && !state.forward) window.__webMinecraftTouchInputRef.moveZ = -Math.abs(window.__webMinecraftTouchInputRef.moveZ);
        };
        const hook = (button, key, active) => {
            button.addEventListener("pointerdown", () => { state[key] = active; update(); });
            const release = () => { state[key] = false; };
            button.addEventListener("pointerup", release);
            button.addEventListener("pointercancel", release);
            button.addEventListener("lostpointercapture", release);
        };
        hook(forward, "forward", true);
        hook(back, "back", true);
        state.timer = window.setInterval(update, 16);
    };
    attach();
    const observer = new MutationObserver(() => attach());
    observer.observe(document.body, { childList:true, subtree:true });
}

function init() {
    addGameplayLayoutStyles();
    setupWorldManagement();
    setupMobileForwardBackFix();
    const observer = new MutationObserver(() => setupWorldManagement());
    observer.observe(document.body, { childList:true, subtree:true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
