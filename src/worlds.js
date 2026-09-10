const DB_NAME = "webminecraft-local-worlds";
const DB_VERSION = 1;
const STORE_NAME = "worlds";
const CACHE_KEY = "webminecraft_saved_worlds";

let dbPromise = null;
let overlay = null;
let worldsList = null;
let detailsPanel = null;
let createPanel = null;
let selectedWorld = null;
let pendingWorldSeed = null;
let initialized = false;
let openWorldCallback = null;
let worldsCache = [];

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "seed" });
                store.createIndex("updatedAt", "updatedAt", { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open browser world storage."));
    }).catch(error => {
        dbPromise = null;
        throw error;
    });
    return dbPromise;
}

function idbRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Browser world storage request failed."));
    });
}

async function getAllWorldRecords() {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    return idbRequest(tx.objectStore(STORE_NAME).getAll());
}

async function getWorldRecord(seed) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    return idbRequest(tx.objectStore(STORE_NAME).get(seed));
}

async function putWorldRecord(world) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(world);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(world);
        tx.onerror = () => reject(tx.error || new Error("Could not save world in browser storage."));
        tx.onabort = () => reject(tx.error || new Error("Could not save world in browser storage."));
    });
}

async function deleteWorldRecord(seed) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(seed);
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("Could not delete world from browser storage."));
        tx.onabort = () => reject(tx.error || new Error("Could not delete world from browser storage."));
    });
}

function cacheWorlds(worlds) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(worlds.map(world => ({
            name: world.name,
            seed: world.seed,
            createdAt: world.createdAt,
            updatedAt: world.updatedAt
        }))));
    } catch {}
}

function getCachedWorlds() {
    try {
        const worlds = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
        return Array.isArray(worlds) ? worlds : [];
    } catch {
        return [];
    }
}

function normalizeWorld(world, index = 0) {
    const seed = Number(world?.seed);
    if (!Number.isFinite(seed)) return null;
    const normalizedSeed = Math.floor(Math.abs(seed)) >>> 0;
    return {
        seed: normalizedSeed,
        name: String(world?.name || `World ${index + 1}`).trim() || `World ${index + 1}`,
        createdAt: world?.createdAt || new Date().toISOString(),
        updatedAt: world?.updatedAt || world?.createdAt || new Date().toISOString(),
        blocks: world?.blocks && typeof world.blocks === "object" ? world.blocks : {}
    };
}

async function migrateCachedWorlds() {
    const cached = getCachedWorlds();
    if (!cached.length) return;
    for (const [index, cachedWorld] of cached.entries()) {
        const world = normalizeWorld(cachedWorld, index);
        if (!world) continue;
        const existing = await getWorldRecord(world.seed).catch(() => null);
        if (!existing) await putWorldRecord(world);
    }
}

function addStyles() {
    if (document.getElementById("savedWorldsStyles")) return;
    const style = document.createElement("style");
    style.id = "savedWorldsStyles";
    style.textContent = `
#savedWorlds{position:fixed;inset:0;display:none;background:#171717;color:#fff;z-index:240;font-family:Arial,sans-serif;overflow:hidden}
#savedWorldsShell{width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,#242424 0%,#181818 100%)}
#savedWorldsHeader{height:82px;flex:0 0 82px;display:flex;align-items:center;gap:16px;padding:0 28px;background:#2b2b2b;border-bottom:2px solid #101010;box-shadow:0 3px 0 rgba(0,0,0,.28);box-sizing:border-box}
#savedWorldsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:27px;text-shadow:2px 2px 0 #000;white-space:nowrap}
#savedWorldsCount{color:#8fca68;font-size:12px;margin-right:auto}
.savedWorldButton{min-height:42px;padding:9px 15px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 2px 0 #101010}
.savedWorldButton:hover{filter:brightness(1.12)}
.savedWorldButton:active{transform:translateY(2px)}
.savedWorldButton:disabled{opacity:.55;cursor:default;filter:none}
#savedWorldNew{background:linear-gradient(#6d8d4e,#526f3c)}
#savedWorldBack{background:#4a4a4a}
#savedWorldsBody{position:relative;flex:1;min-height:0;overflow:auto;padding:24px 28px;box-sizing:border-box}
#savedWorldsGrid{width:min(1100px,100%);margin:0 auto;display:flex;flex-direction:column;gap:12px}
.savedWorldCard{position:relative;min-height:128px;padding:16px 18px;background:linear-gradient(180deg,#3a3a3a,#2d2d2d);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.4);display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:1fr auto;column-gap:18px;box-sizing:border-box}
.savedWorldCard h3{grid-column:1;grid-row:1;margin:0 0 7px;align-self:start;font-family:"MinecraftFont",monospace;font-size:18px;text-shadow:2px 2px 0 #000;word-break:break-word}
.savedWorldMeta{grid-column:1;grid-row:2;color:#999;font-size:12px;line-height:1.5;align-self:end}
.savedWorldActions{grid-column:2;grid-row:1 / span 2;display:flex;align-items:center;gap:8px;min-width:220px}
.savedWorldActions .savedWorldButton{min-width:104px}
.savedWorldPlay{background:linear-gradient(#6d8d4e,#526f3c)}
.savedWorldDetails{background:linear-gradient(#666,#4d4d4d)}
#savedWorldsEmpty{width:min(620px,92vw);margin:10vh auto;text-align:center;color:#aaa}
#savedWorldsEmpty h2{margin:0 0 10px;font-family:"MinecraftFont",monospace;color:#fff;font-size:25px;text-shadow:2px 2px 0 #000}
#savedWorldsEmpty p{margin:0 0 22px;line-height:1.5}
#savedWorldsError{text-align:center;color:#e8a4a4;padding:40px 20px}
#worldDetailsPanel{position:absolute;top:24px;right:24px;width:min(440px,calc(100% - 48px));height:auto;max-height:calc(100% - 48px);background:#202020;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.45);transform:translateX(110%);transition:transform .18s ease;pointer-events:auto;display:flex;flex-direction:column;box-sizing:border-box}
#worldDetailsPanel.open{transform:translateX(0)}
#worldDetailsHeader{min-height:76px;flex:0 0 76px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:#2c2c2c;border-bottom:2px solid #111;box-sizing:border-box}
#worldDetailsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:19px;text-shadow:2px 2px 0 #000;word-break:break-word;padding-right:10px}
#worldDetailsClose{width:40px;height:40px;padding:0;font-size:21px}
#worldDetailsContent{overflow:auto;padding:24px;box-sizing:border-box;min-height:0}
.worldDetailLabel{margin:0 0 7px;color:#999;font-size:12px}
.worldDetailSeed{padding:14px;background:#111;border:2px solid #080808;border-top-color:#777;border-left-color:#777;font:16px monospace;word-break:break-all;color:#fff;min-height:48px;box-sizing:border-box}
#worldDetailsHint{margin:12px 0 20px;color:#aaa;font-size:12px;line-height:1.45}
.worldDetailAction{width:100%;margin:8px 0}
#worldDetailsPlay{background:linear-gradient(#6d8d4e,#526f3c)}
#worldDetailsDelete{background:linear-gradient(#804b4b,#633b3b)}
#worldCreateModal{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.68);backdrop-filter:blur(2px);pointer-events:auto;padding:20px;box-sizing:border-box}
#worldCreateCard{width:min(480px,94vw);max-height:calc(100% - 40px);overflow:auto;padding:25px;background:#282828;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.55);box-sizing:border-box}
#worldCreateTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:25px;text-shadow:2px 2px 0 #000}
#worldCreateText{margin:0 0 14px;color:#999;font-size:12px;line-height:1.45}
#worldCreateSeedWrap{margin:0 0 16px}
#worldCreateSeedLabel{margin:0 0 7px;color:#999;font-size:12px}
#worldCreateSeed{padding:12px;background:#111;border:2px solid #080808;border-top-color:#777;border-left-color:#777;font:15px monospace;word-break:break-all;color:#fff}
#worldNameInput{width:100%;height:46px;padding:0 12px;background:#111;color:#fff;border:2px solid #080808;border-top-color:#777;border-left-color:#777;outline:none;box-sizing:border-box}
#worldCreateMessage{min-height:20px;margin-top:9px;color:#d8d8d8;font-size:12px}
#worldCreateActions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
#worldCreateConfirm{background:linear-gradient(#6d8d4e,#526f3c)}
@media(max-width:700px){#savedWorldsHeader{height:auto;min-height:76px;flex-wrap:wrap;padding:12px 14px;gap:8px}#savedWorldsTitle{font-size:21px}#savedWorldsCount{order:3;width:100%;margin:0}#savedWorldsBody{padding:16px}#savedWorldsGrid{gap:10px}.savedWorldCard{min-height:0;display:flex;flex-direction:column;gap:12px;padding:15px}.savedWorldCard h3,.savedWorldMeta{display:block}.savedWorldActions{min-width:0;display:grid;grid-template-columns:1fr 1fr;width:100%}.savedWorldActions .savedWorldButton{width:100%}#worldDetailsPanel{top:12px;right:12px;width:calc(100% - 24px);max-height:calc(100% - 24px)}#worldCreateCard{padding:20px}}
`;
    document.head.appendChild(style);
}

function buildUi() {
    if (overlay) return;
    addStyles();
    overlay = document.createElement("div");
    overlay.id = "savedWorlds";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div id="savedWorldsShell">
            <header id="savedWorldsHeader">
                <h1 id="savedWorldsTitle">Saved Worlds</h1>
                <span id="savedWorldsCount"></span>
                <button id="savedWorldNew" class="savedWorldButton" type="button">+ New World</button>
                <button id="savedWorldBack" class="savedWorldButton" type="button">← Back</button>
            </header>
            <main id="savedWorldsBody">
                <div id="savedWorldsGrid"></div>
                <aside id="worldDetailsPanel" aria-hidden="true">
                    <header id="worldDetailsHeader"><h2 id="worldDetailsTitle">World</h2><button id="worldDetailsClose" class="savedWorldButton" type="button">×</button></header>
                    <div id="worldDetailsContent">
                        <p class="worldDetailLabel">World seed</p>
                        <div id="worldDetailsSeed" class="worldDetailSeed">—</div>
                        <p id="worldDetailsHint">This world is saved in this browser. Clearing browser site data can remove local worlds.</p>
                        <button id="worldDetailsCopy" class="savedWorldButton worldDetailAction" type="button">Copy Seed</button>
                        <button id="worldDetailsPlay" class="savedWorldButton worldDetailAction" type="button">Play World</button>
                        <button id="worldDetailsDelete" class="savedWorldButton worldDetailAction" type="button">Delete World</button>
                        <div id="worldDetailsMessage"></div>
                    </div>
                </aside>
                <div id="worldCreateModal" aria-hidden="true">
                    <div id="worldCreateCard" role="dialog" aria-modal="true" aria-labelledby="worldCreateTitle">
                        <h2 id="worldCreateTitle">Create New World</h2>
                        <p id="worldCreateText">Give your world a name. A random seed has been generated for it.</p>
                        <div id="worldCreateSeedWrap"><p id="worldCreateSeedLabel">World seed</p><div id="worldCreateSeed"></div></div>
                        <input id="worldNameInput" type="text" maxlength="40" autocomplete="off" placeholder="World name">
                        <div id="worldCreateMessage"></div>
                        <div id="worldCreateActions">
                            <button id="worldCreateConfirm" class="savedWorldButton" type="button">Create & Play</button>
                            <button id="worldCreateCancel" class="savedWorldButton" type="button">Cancel</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
    document.body.appendChild(overlay);
    worldsList = overlay.querySelector("#savedWorldsGrid");
    detailsPanel = overlay.querySelector("#worldDetailsPanel");
    createPanel = overlay.querySelector("#worldCreateModal");
    overlay.querySelector("#savedWorldBack").addEventListener("click", closeWorldMenu);
    overlay.querySelector("#savedWorldNew").addEventListener("click", openCreateWorld);
    overlay.querySelector("#worldDetailsClose").addEventListener("click", closeDetails);
    overlay.querySelector("#worldDetailsCopy").addEventListener("click", copySelectedSeed);
    overlay.querySelector("#worldDetailsPlay").addEventListener("click", playSelectedWorld);
    overlay.querySelector("#worldDetailsDelete").addEventListener("click", deleteSelectedWorld);
    overlay.querySelector("#worldCreateCancel").addEventListener("click", closeCreateWorld);
    overlay.querySelector("#worldCreateConfirm").addEventListener("click", createNewWorld);
    overlay.querySelector("#worldNameInput").addEventListener("keydown", event => {
        if (event.key === "Enter") createNewWorld();
        if (event.key === "Escape") closeCreateWorld();
    });
    createPanel.addEventListener("click", event => { if (event.target === createPanel) closeCreateWorld(); });
}

function makeSeed() {
    try {
        const values = new Uint32Array(2);
        crypto.getRandomValues(values);
        return (values[0] * 4096 + (values[1] >>> 20)) >>> 0;
    } catch {
        return Math.floor(Math.random() * 4294967296) >>> 0;
    }
}

function formatDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "Just created";
    return `Last saved ${date.toLocaleDateString()}`;
}

function setOverlayVisible(visible) {
    if (!overlay) return;
    overlay.style.display = visible ? "block" : "none";
    overlay.setAttribute("aria-hidden", visible ? "false" : "true");
}

async function refreshWorlds() {
    await migrateCachedWorlds();
    const records = await getAllWorldRecords();
    worldsCache = records
        .map((world, index) => normalizeWorld(world, index))
        .filter(Boolean)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    cacheWorlds(worldsCache);
    renderWorlds(worldsCache);
}

function renderWorlds(worlds) {
    const validWorlds = worlds.filter(world => Number.isFinite(Number(world.seed)));
    const count = overlay.querySelector("#savedWorldsCount");
    count.textContent = `${validWorlds.length} world${validWorlds.length === 1 ? "" : "s"}`;
    if (!validWorlds.length) {
        worldsList.innerHTML = `<div id="savedWorldsEmpty"><h2>No worlds found</h2><p>This browser has no saved worlds yet.</p><button id="emptyCreateWorld" class="savedWorldButton" type="button">+ Create New World</button></div>`;
        worldsList.querySelector("#emptyCreateWorld").addEventListener("click", openCreateWorld);
        return;
    }
    worldsList.innerHTML = "";
    for (const world of validWorlds) {
        const card = document.createElement("article");
        card.className = "savedWorldCard";
        const name = String(world.name || "World").trim() || "World";
        card.innerHTML = `<h3>${escapeHtml(name)}</h3><div class="savedWorldMeta">Singleplayer<br>Seed: ${escapeHtml(String(world.seed))}<br>${escapeHtml(formatDate(world.updatedAt || world.createdAt))}</div><div class="savedWorldActions"><button class="savedWorldButton savedWorldPlay" type="button">Play</button><button class="savedWorldButton savedWorldDetails" type="button">Details →</button></div>`;
        card.querySelector(".savedWorldPlay").addEventListener("click", () => playWorld(world));
        card.querySelector(".savedWorldDetails").addEventListener("click", () => openDetails(world));
        worldsList.appendChild(card);
    }
}

function openDetails(world) {
    selectedWorld = world;
    overlay.querySelector("#worldDetailsTitle").textContent = world.name || "World";
    overlay.querySelector("#worldDetailsSeed").textContent = String(world.seed ?? "—");
    overlay.querySelector("#worldDetailsMessage").textContent = "";
    detailsPanel.classList.add("open");
    detailsPanel.setAttribute("aria-hidden", "false");
}

function closeDetails() {
    detailsPanel?.classList.remove("open");
    detailsPanel?.setAttribute("aria-hidden", "true");
    selectedWorld = null;
}

async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
        const helper = document.createElement("textarea");
        helper.value = text; helper.style.position = "fixed"; helper.style.opacity = "0";
        document.body.appendChild(helper); helper.select();
        let ok = false; try { ok = document.execCommand("copy"); } catch {}
        helper.remove(); return ok;
    }
}

async function copySelectedSeed() {
    if (!selectedWorld) return;
    const ok = await copyText(String(selectedWorld.seed));
    const message = overlay.querySelector("#worldDetailsMessage");
    message.style.color = ok ? "#8fca68" : "#d8a0a0";
    message.textContent = ok ? "Seed copied!" : "Could not copy the seed automatically.";
}

function playWorld(world) {
    if (!world || !openWorldCallback) return;
    closeDetails();
    closeWorldMenu();
    openWorldCallback(Number(world.seed));
    void touchWorld(world.seed);
}

function playSelectedWorld() { if (selectedWorld) playWorld(selectedWorld); }

async function touchWorld(seed) {
    const world = await getWorldRecord(seed).catch(() => null);
    if (!world) return;
    world.updatedAt = new Date().toISOString();
    await putWorldRecord(world).catch(() => {});
    await refreshWorlds().catch(() => {});
}

async function deleteSelectedWorld() {
    if (!selectedWorld) return;
    const name = selectedWorld.name || "this world";
    if (!window.confirm(`Delete \"${name}\"? This cannot be undone.`)) return;
    try {
        await deleteWorldRecord(Number(selectedWorld.seed));
        closeDetails();
        await refreshWorlds();
    } catch (error) {
        overlay.querySelector("#worldDetailsMessage").textContent = error?.message || "Could not delete this world.";
    }
}

function openCreateWorld() {
    pendingWorldSeed = makeSeed();
    overlay.querySelector("#worldNameInput").value = "";
    overlay.querySelector("#worldCreateSeed").textContent = String(pendingWorldSeed);
    overlay.querySelector("#worldCreateMessage").textContent = "";
    createPanel.style.display = "flex";
    createPanel.setAttribute("aria-hidden", "false");
    overlay.querySelector("#worldNameInput").focus();
}

function closeCreateWorld() {
    createPanel.style.display = "none";
    createPanel.setAttribute("aria-hidden", "true");
    pendingWorldSeed = null;
}

async function createNewWorld() {
    const input = overlay.querySelector("#worldNameInput");
    const message = overlay.querySelector("#worldCreateMessage");
    const button = overlay.querySelector("#worldCreateConfirm");
    const name = input.value.trim() || `World ${worldsCache.length + 1}`;
    let seed = pendingWorldSeed ?? makeSeed();
    while (await getWorldRecord(seed).catch(() => null)) seed = makeSeed();
    const now = new Date().toISOString();
    const world = { seed, name, createdAt: now, updatedAt: now, blocks: {} };

    button.disabled = true;
    message.style.color = "#d8d8d8";
    message.textContent = "Saving world...";
    try {
        await putWorldRecord(world);
        worldsCache = [world, ...worldsCache.filter(item => Number(item.seed) !== seed)];
        cacheWorlds(worldsCache);
        renderWorlds(worldsCache);

        closeCreateWorld();
        closeWorldMenu();
        openWorldCallback?.(seed);
    } catch (error) {
        console.error("Could not create local world:", error);
        message.style.color = "#d8a0a0";
        message.textContent = error?.message || "Could not create the world in this browser.";
    } finally {
        button.disabled = false;
    }
}

function closeWorldMenu() {
    closeDetails();
    closeCreateWorld();
    setOverlayVisible(false);
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.display = "flex";
    const seedMenu = document.getElementById("seedMenu");
    if (seedMenu) { seedMenu.style.display = "none"; seedMenu.setAttribute("aria-hidden", "true"); }
}

async function openWorldMenu() {
    buildUi();
    setOverlayVisible(true);
    document.exitPointerLock?.();
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.display = "none";
    const seedMenu = document.getElementById("seedMenu");
    if (seedMenu) { seedMenu.style.display = "none"; seedMenu.setAttribute("aria-hidden", "true"); }
    try {
        await refreshWorlds();
    } catch (error) {
        console.error("Could not load browser worlds:", error);
        showStatus("Could not load saved worlds.", true);
    }
}

function showStatus(text, error = false) {
    worldsList.innerHTML = `<div id="${error ? "savedWorldsError" : "savedWorldsEmpty"}"><h2>${escapeHtml(text)}</h2></div>`;
}

async function ensureWorldExists(seed) {
    const normalizedSeed = Math.floor(Math.abs(Number(seed))) >>> 0;
    if (!Number.isFinite(normalizedSeed)) return null;
    const existing = await getWorldRecord(normalizedSeed).catch(() => null);
    if (existing) return existing;
    const now = new Date().toISOString();
    const world = { seed: normalizedSeed, name: `World ${normalizedSeed}`, createdAt: now, updatedAt: now, blocks: {} };
    try { return await putWorldRecord(world); } catch { return null; }
}

export async function getLocalWorld(seed) {
    return getWorldRecord(Math.floor(Math.abs(Number(seed))) >>> 0).catch(() => null);
}

export async function saveLocalWorld(world) {
    const normalized = normalizeWorld(world);
    if (!normalized) return null;
    await putWorldRecord(normalized);
    cacheWorlds(await getAllWorldRecords());
    return normalized;
}

export async function deleteLocalWorld(seed) {
    await deleteWorldRecord(Math.floor(Math.abs(Number(seed))) >>> 0);
    cacheWorlds(await getAllWorldRecords());
}

export async function initSavedWorldStorage() {
    await openDatabase();
    await migrateCachedWorlds();
    return true;
}

export function initSavedWorlds({ onOpenWorld } = {}) {
    if (initialized) return;
    initialized = true;
    openWorldCallback = onOpenWorld;
    buildUi();
    const playButton = document.getElementById("playButton");
    if (playButton) playButton.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openWorldMenu(); }, true);
    window.addEventListener("keydown", event => {
        if (event.code !== "Escape" || overlay?.style.display !== "block") return;
        if (detailsPanel?.classList.contains("open")) closeDetails();
        else if (createPanel?.style.display === "flex") closeCreateWorld();
        else closeWorldMenu();
    });
    initSavedWorldStorage().catch(error => console.warn("Browser world storage setup failed:", error));
    window.webMinecraftWorldStorage = { getLocalWorld, saveLocalWorld, deleteLocalWorld, ensureWorldExists };
}
