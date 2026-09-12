const INDEX_KEY = "webminecraft_saved_world_index_v2";
const DELETED_KEY = "webminecraft_deleted_worlds";
const CACHE_NAME = "webminecraft-worlds-v2";
const CACHE_PREFIX = "/__webminecraft_world_v2__/";
const FALLBACK_PREFIX = "webminecraft_world_v2_";
const FALLBACK_CHUNK_PREFIX = "webminecraft_world_v2_chunk_";
const MAX_CHUNK = 120000;
const MAX_NAME = 40;

let overlay = null;
let details = null;
let createModal = null;
let list = null;
let selected = null;
let pendingSeed = null;
let initialized = false;
let openWorldCallback = null;
let worldsCache = [];
let storageReady = null;
let liveCloudRefreshRunning = false;

function seedOf(value) {
    const n = Number(value);
    return Number.isFinite(n) ? (Math.floor(Math.abs(n)) >>> 0) : null;
}

function deletedSeeds() {
    try {
        const raw = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(seedOf).filter(v => v !== null) : []);
    } catch { return new Set(); }
}

function setDeleted(seeds) {
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...seeds])); } catch {}
}

function markDeleted(seed) {
    const s = seedOf(seed);
    if (s === null) return;
    const set = deletedSeeds();
    set.add(s);
    setDeleted(set);
}

function unmarkDeleted(seed) {
    const s = seedOf(seed);
    if (s === null) return;
    const set = deletedSeeds();
    set.delete(s);
    setDeleted(set);
}

function normalize(world, fallbackIndex = 0) {
    const seed = seedOf(world?.seed);
    if (seed === null || deletedSeeds().has(seed)) return null;
    const createdAt = world?.createdAt || new Date().toISOString();
    return {
        seed,
        name: String(world?.name || `World ${fallbackIndex + 1}`).trim().slice(0, MAX_NAME) || `World ${fallbackIndex + 1}`,
        createdAt,
        updatedAt: world?.updatedAt || createdAt,
        blocks: world?.blocks && typeof world.blocks === "object" && !Array.isArray(world.blocks) ? world.blocks : {}
    };
}

function requestFor(seed) {
    return new Request(`${location.origin}${CACHE_PREFIX}${seed}.json`);
}

async function cacheRead(seed) {
    if (!window.caches) return null;
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(requestFor(seedOf(seed)));
        return response ? normalize(await response.json()) : null;
    } catch { return null; }
}

async function cacheWrite(world) {
    if (!window.caches) return false;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(requestFor(world.seed), new Response(JSON.stringify(world), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    }));
    return true;
}

async function cacheDelete(seed) {
    if (!window.caches) return;
    try { await (await caches.open(CACHE_NAME)).delete(requestFor(seedOf(seed))); } catch {}
}

function clearFallback(seed) {
    const s = seedOf(seed);
    if (s === null) return;
    try {
        const meta = JSON.parse(localStorage.getItem(`${FALLBACK_PREFIX}${s}`) || "null");
        const count = Number(meta?.chunks);
        if (Number.isInteger(count)) for (let i = 0; i < count; i++) localStorage.removeItem(`${FALLBACK_CHUNK_PREFIX}${s}_${i}`);
        localStorage.removeItem(`${FALLBACK_PREFIX}${s}`);
    } catch {}
}

function fallbackWrite(world) {
    const s = world.seed;
    const json = JSON.stringify(world);
    const chunks = [];
    for (let i = 0; i < json.length; i += MAX_CHUNK) chunks.push(json.slice(i, i + MAX_CHUNK));
    clearFallback(s);
    try {
        chunks.forEach((chunk, i) => localStorage.setItem(`${FALLBACK_CHUNK_PREFIX}${s}_${i}`, chunk));
        localStorage.setItem(`${FALLBACK_PREFIX}${s}`, JSON.stringify({ version: 2, chunks: chunks.length, updatedAt: world.updatedAt }));
        return true;
    } catch {
        clearFallback(s);
        return false;
    }
}

function fallbackRead(seed) {
    const s = seedOf(seed);
    if (s === null) return null;
    try {
        const meta = JSON.parse(localStorage.getItem(`${FALLBACK_PREFIX}${s}`) || "null");
        const count = Number(meta?.chunks);
        if (!Number.isInteger(count) || count < 1) return null;
        let text = "";
        for (let i = 0; i < count; i++) {
            const chunk = localStorage.getItem(`${FALLBACK_CHUNK_PREFIX}${s}_${i}`);
            if (chunk === null) return null;
            text += chunk;
        }
        return normalize(JSON.parse(text));
    } catch { return null; }
}

function readIndex() {
    try {
        const raw = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
        const deleted = deletedSeeds();
        return Array.isArray(raw) ? raw.filter(v => {
            const s = seedOf(v?.seed);
            return s !== null && !deleted.has(s);
        }) : [];
    } catch { return []; }
}

function writeIndex(worlds) {
    const deleted = deletedSeeds();
    const metadata = worlds.map(normalize).filter(Boolean).filter(w => !deleted.has(w.seed)).map(w => ({
        seed: w.seed,
        name: w.name,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
    }));
    try { localStorage.setItem(INDEX_KEY, JSON.stringify(metadata)); } catch {}
}

async function getRecord(seed) {
    const s = seedOf(seed);
    if (s === null || deletedSeeds().has(s)) return null;
    return (await cacheRead(s)) || fallbackRead(s);
}

async function putRecord(world) {
    const normalized = normalize(world);
    if (!normalized) throw new Error("This world is deleted or invalid.");
    if (deletedSeeds().has(normalized.seed)) throw new Error("This world was deleted.");

    let saved = false;
    try { saved = await cacheWrite(normalized); } catch (error) { console.warn("World Cache Storage save failed:", error); }
    if (saved) clearFallback(normalized.seed);
    else if (!fallbackWrite(normalized)) throw new Error("Could not save the world. Browser storage may be full or disabled.");

    if (deletedSeeds().has(normalized.seed)) {
        await removeStoredData(normalized.seed);
        throw new Error("World was deleted while it was being saved.");
    }

    writeIndex([...readIndex().filter(w => seedOf(w.seed) !== normalized.seed), normalized]);
    return normalized;
}

async function removeStoredData(seed) {
    await cacheDelete(seed);
    clearFallback(seed);
}

async function deleteRecord(seed) {
    const s = seedOf(seed);
    if (s === null) return;
    markDeleted(s);
    await removeStoredData(s);
    writeIndex(readIndex().filter(w => seedOf(w.seed) !== s));
}

async function allRecords() {
    const records = [];
    for (const metadata of readIndex()) {
        const record = await getRecord(metadata.seed);
        if (record) records.push(record);
    }
    return records;
}

async function migrateOldFallback() {
    try {
        if (window.caches) {
            const old = await caches.open("webminecraft-world-fallback-v1");
            const response = await old.match(new Request(`${location.origin}/__webminecraft_world_storage__`));
            if (response) {
                const values = await response.json();
                if (Array.isArray(values)) for (const value of values) {
                    const world = normalize(value);
                    if (world && !(await getRecord(world.seed))) {
                        try { await putRecord(world); } catch {}
                    }
                }
            }
        }
    } catch (error) { console.warn("Old world migration skipped:", error); }
}

function esc(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatSaved(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Saved locally";
    return `Last saved ${date.toLocaleString()}`;
}

function addStyle() {
    if (document.getElementById("savedWorldsV2Style")) return;
    const style = document.createElement("style");
    style.id = "savedWorldsV2Style";
    style.textContent = `
#savedWorlds{position:fixed;inset:0;z-index:240;display:none;background:#171717;color:#fff;font-family:Arial,sans-serif}#savedWorlds .sw2-wrap{height:100%;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 0,#3b3b3b 0,#191919 55%,#111 100%)}#savedWorlds .sw2-head{display:flex;align-items:center;gap:10px;padding:18px 26px;background:#292929;border-bottom:2px solid #111}#savedWorlds .sw2-title{margin:0 auto 0 0;font-size:28px;font-weight:800;text-shadow:2px 2px #000}#savedWorlds .sw2-count{color:#aaa;font-size:12px;margin-left:8px}.sw2-btn{min-height:42px;padding:9px 14px;border:1px solid #0b0b0b;border-radius:6px;background:#4a4a4a;color:#fff;cursor:pointer;font-weight:700;box-shadow:0 3px #0b0b0b}.sw2-btn:hover{filter:brightness(1.12)}.sw2-btn:disabled{opacity:.5;cursor:default}.sw2-green{background:#65864b}.sw2-red{background:#774747}#savedWorlds .sw2-body{flex:1;overflow:auto;padding:26px}.sw2-grid{max-width:1180px;margin:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px}.sw2-card{background:linear-gradient(145deg,#424242,#2b2b2b);border:1px solid #101010;border-radius:9px;padding:18px;box-shadow:0 9px 22px #0006;display:flex;flex-direction:column;min-height:175px}.sw2-card h3{margin:0 0 8px;font-size:20px;word-break:break-word}.sw2-badge{align-self:flex-start;padding:4px 8px;border-radius:99px;background:#1e1e1e;color:#aaa;font-size:10px;text-transform:uppercase;letter-spacing:.5px}.sw2-meta{margin-top:auto;color:#aaa;font-size:12px;line-height:1.5}.sw2-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:15px}.sw2-empty{max-width:600px;margin:12vh auto;padding:34px;text-align:center;background:#252525;border:1px solid #555;border-radius:10px;color:#aaa}.sw2-empty h2{color:#fff;margin:0 0 10px;font-size:26px}.sw2-panel{position:fixed;right:24px;top:100px;width:min(430px,calc(100% - 48px));max-height:calc(100% - 124px);overflow:auto;transform:translateX(120%);transition:.18s;background:#222;border:1px solid #666;border-radius:10px;box-shadow:0 18px 40px #000a}.sw2-panel.open{transform:translateX(0)}.sw2-panel-head{padding:17px;border-bottom:1px solid #111;display:flex;align-items:center}.sw2-panel-head h2{margin:0 auto 0 0}.sw2-panel-body{padding:20px}.sw2-label{color:#999;font-size:12px;margin:0 0 7px}.sw2-seed{padding:13px;background:#101010;border:1px solid #000;border-radius:6px;font-family:monospace;word-break:break-all}.sw2-field{width:100%;height:44px;margin-top:10px;padding:0 11px;border-radius:6px;border:1px solid #555;background:#111;color:#fff;box-sizing:border-box}.sw2-modal{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000b;padding:20px}.sw2-modal-card{width:min(480px,94vw);background:#272727;border:1px solid #666;border-radius:10px;padding:25px;box-sizing:border-box}.sw2-modal-card h2{margin:0 0 8px}.sw2-help{color:#aaa;font-size:12px;line-height:1.5;margin:0 0 15px}@media(max-width:700px){#savedWorlds .sw2-head{flex-wrap:wrap;padding:12px 14px}.sw2-title{width:100%;font-size:22px}.sw2-count{margin-left:auto}.sw2-grid{grid-template-columns:1fr}.sw2-panel{right:12px;top:12px;width:calc(100% - 24px);max-height:calc(100% - 24px)}}`;
    document.head.appendChild(style);
}

function buildUI() {
    if (overlay) return;
    addStyle();
    overlay = document.createElement("div");
    overlay.id = "savedWorlds";
    overlay.innerHTML = `<div class="sw2-wrap"><div class="sw2-head"><h1 class="sw2-title">Saved Worlds <span class="sw2-count"></span></h1><button class="sw2-btn" data-act="reload">↻ Reload</button><button class="sw2-btn sw2-green" data-act="new">+ New World</button><button class="sw2-btn" data-act="back">← Back</button></div><div class="sw2-body"><div class="sw2-grid"></div><aside class="sw2-panel"><div class="sw2-panel-head"><h2></h2><button class="sw2-btn" data-act="close">×</button></div><div class="sw2-panel-body"><p class="sw2-label">World seed</p><div class="sw2-seed" data-seed>—</div><p class="sw2-help">Your complete world, including block changes, is stored in this browser and synced to your account when signed in.</p><button class="sw2-btn" style="width:100%;margin:5px 0" data-act="copy">Copy Seed</button><button class="sw2-btn sw2-green" style="width:100%;margin:5px 0" data-act="play">Play World</button><button class="sw2-btn sw2-red" style="width:100%;margin:5px 0" data-act="delete">Delete World</button><div data-message style="min-height:20px;margin-top:8px;font-size:12px"></div></div></aside><div class="sw2-modal"><div class="sw2-modal-card"><h2>Create New World</h2><p class="sw2-help">Give the world a name. The seed below is unique and can be copied later.</p><p class="sw2-label">Seed</p><div class="sw2-seed" data-new-seed></div><input class="sw2-field" maxlength="40" placeholder="World name" data-name><div data-create-message style="min-height:20px;font-size:12px;margin-top:8px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px"><button class="sw2-btn sw2-green" data-act="create">Create & Play</button><button class="sw2-btn" data-act="cancel">Cancel</button></div></div></div></div>`;
    document.body.appendChild(overlay);
    list = overlay.querySelector(".sw2-grid");
    details = overlay.querySelector(".sw2-panel");
    createModal = overlay.querySelector(".sw2-modal");
    overlay.addEventListener("click", event => {
        const action = event.target.closest("[data-act]")?.dataset.act;
        if (!action) return;
        if (action === "reload") reload();
        if (action === "new") openCreate();
        if (action === "back") closeMenu();
        if (action === "close") closeDetails();
        if (action === "copy") copySelected();
        if (action === "play") playSelected();
        if (action === "delete") deleteSelected();
        if (action === "cancel") closeCreate();
        if (action === "create") createWorld();
    });
    overlay.querySelector("[data-name]").addEventListener("keydown", event => {
        event.stopPropagation();
        if (event.key === "Enter") createWorld();
        if (event.key === "Escape") closeCreate();
    });
    overlay.addEventListener("keydown", event => event.stopPropagation());
}

function randomSeed() {
    try {
        const a = new Uint32Array(2);
        crypto.getRandomValues(a);
        return (a[0] ^ a[1]) >>> 0;
    } catch { return Math.floor(Math.random() * 4294967296) >>> 0; }
}

function showMenu() {
    overlay.style.display = "block";
    document.getElementById("mainMenu")?.style && (document.getElementById("mainMenu").style.display = "none");
}

function closeMenu() {
    closeDetails();
    closeCreate();
    if (overlay) overlay.style.display = "none";
    const menu = document.getElementById("mainMenu");
    if (menu) menu.style.display = "flex";
}

function render(worlds) {
    worldsCache = worlds.map(normalize).filter(Boolean).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    writeIndex(worldsCache);
    overlay.querySelector(".sw2-count").textContent = `${worldsCache.length} world${worldsCache.length === 1 ? "" : "s"}`;
    if (!worldsCache.length) {
        list.innerHTML = `<div class="sw2-empty"><h2>No saved worlds</h2><p>Create a world and your block changes will be saved here automatically.</p><button class="sw2-btn sw2-green" data-act="new">+ Create New World</button></div>`;
        return;
    }
    list.innerHTML = worldsCache.map((world, i) => `<article class="sw2-card"><h3>${esc(world.name || `World ${i+1}`)}</h3><span class="sw2-badge">Synced</span><div class="sw2-meta">Seed: ${esc(world.seed)}<br>${esc(formatSaved(world.updatedAt))}</div><div class="sw2-actions"><button class="sw2-btn sw2-green" data-play-seed="${world.seed}">Play</button><button class="sw2-btn" data-details-seed="${world.seed}">Details</button></div></article>`).join("");
    list.querySelectorAll("[data-play-seed]").forEach(button => button.addEventListener("click", () => playWorld(worldsCache.find(w => w.seed === seedOf(button.dataset.playSeed)))));
    list.querySelectorAll("[data-details-seed]").forEach(button => button.addEventListener("click", () => openDetails(worldsCache.find(w => w.seed === seedOf(button.dataset.detailsSeed)))));
}

function openDetails(world) {
    if (!world) return;
    selected = world;
    details.querySelector("h2").textContent = world.name;
    details.querySelector("[data-seed]").textContent = String(world.seed);
    details.querySelector("[data-message]").textContent = "";
    details.classList.add("open");
}

function closeDetails() { details?.classList.remove("open"); selected = null; }

async function copySelected() {
    if (!selected) return;
    let ok = false;
    try { await navigator.clipboard.writeText(String(selected.seed)); ok = true; } catch {}
    const message = details.querySelector("[data-message]");
    message.style.color = ok ? "#9bc47c" : "#d7a0a0";
    message.textContent = ok ? "Seed copied!" : "Could not copy the seed.";
}

function playWorld(world) {
    if (!world || !openWorldCallback) return;
    closeMenu();
    openWorldCallback(world.seed);
}

function playSelected() { playWorld(selected); }

async function deleteSelected() {
    if (!selected) return;
    const world = selected;
    if (!confirm(`Delete "${String(world.name).replaceAll("\n", " ")}"? This will remove the world from this browser and from cloud storage when available.`)) return;
    const seed = seedOf(world.seed);
    if (seed === null) return;
    const button = details.querySelector('[data-act="delete"]');
    button.disabled = true;
    button.textContent = "Deleting...";
    try {
        await deleteRecord(seed);
        worldsCache = worldsCache.filter(w => seedOf(w.seed) !== seed);
        render(worldsCache);
        closeDetails();

        const cloudDelete = window.webMinecraftDeleteCloudWorld;
        if (typeof cloudDelete === "function") {
            let ok = false;
            try { ok = await cloudDelete(seed); } catch {}
            if (!ok) {
                try {
                    const key = "webminecraft_pending_cloud_deletes";
                    const pending = JSON.parse(localStorage.getItem(key) || "[]");
                    const set = new Set(Array.isArray(pending) ? pending.map(seedOf).filter(v => v !== null) : []);
                    set.add(seed);
                    localStorage.setItem(key, JSON.stringify([...set]));
                } catch {}
            }
        }
        await removeStoredData(seed);
    } catch (error) {
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = "Delete World";
    }
}

function openCreate() {
    pendingSeed = randomSeed();
    const modal = createModal;
    modal.querySelector("[data-new-seed]").textContent = pendingSeed;
    modal.querySelector("[data-name]").value = "";
    modal.querySelector("[data-create-message]").textContent = "";
    modal.style.display = "flex";
    modal.querySelector("[data-name]").focus();
}

function closeCreate() { if (createModal) createModal.style.display = "none"; pendingSeed = null; }

async function createWorld() {
    const modal = createModal;
    const input = modal.querySelector("[data-name]");
    const message = modal.querySelector("[data-create-message]");
    const button = modal.querySelector('[data-act="create"]');
    let seed = seedOf(pendingSeed) ?? randomSeed();
    const name = input.value.trim().slice(0, MAX_NAME) || `World ${worldsCache.length + 1}`;
    button.disabled = true;
    message.textContent = "Creating world...";
    try {
        while (await getRecord(seed)) seed = randomSeed();
        unmarkDeleted(seed);
        const now = new Date().toISOString();
        const world = await putRecord({ seed, name, createdAt: now, updatedAt: now, blocks: {} });
        if (typeof window.webMinecraftClearCloudWorldDeletion === "function") {
            try { await window.webMinecraftClearCloudWorldDeletion(seed); } catch {}
        }
        if (typeof window.webMinecraftSaveCloudWorld === "function") {
            const cloudSaved = await window.webMinecraftSaveCloudWorld(world);
            if (!cloudSaved) console.warn("World created locally but could not be uploaded to the account yet.");
        }
        worldsCache = [world, ...worldsCache.filter(w => w.seed !== seed)];
        render(worldsCache);
        closeCreate();
        playWorld(world);
    } catch (error) {
        console.error(error);
        message.style.color = "#d7a0a0";
        message.textContent = error?.message || "Could not create the world.";
    } finally { button.disabled = false; }
}

async function retryCloudDeletes() {
    const cloudDelete = window.webMinecraftDeleteCloudWorld;
    if (typeof cloudDelete !== "function") return;
    const key = "webminecraft_pending_cloud_deletes";
    let pending = [];
    try { pending = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
    if (!Array.isArray(pending) || !pending.length) return;
    const remaining = [];
    for (const seed of [...new Set(pending.map(seedOf).filter(v => v !== null))]) {
        try { if (!(await cloudDelete(seed))) remaining.push(seed); } catch { remaining.push(seed); }
    }
    try { localStorage.setItem(key, JSON.stringify(remaining)); } catch {}
}

async function refreshFromLiveCloud() {
    if (liveCloudRefreshRunning) return;
    if (navigator.onLine === false) return;
    const listCloud = window.webMinecraftListCloudWorlds;
    if (typeof listCloud !== "function") return;
    liveCloudRefreshRunning = true;
    try {
        const cloudWorlds = await listCloud();
        const localWorlds = await allRecords();
        const localBySeed = new Map(localWorlds.map(world => [world.seed, world]));
        const merged = cloudWorlds.map(cloud => {
            const seed = seedOf(cloud.seed ?? cloud.id);
            const local = localBySeed.get(seed);
            return normalize({
                ...(local || {}),
                seed,
                name: cloud.name || local?.name,
                createdAt: cloud.createdAt || local?.createdAt,
                updatedAt: cloud.updatedAt || local?.updatedAt,
                blocks: local?.blocks || {}
            });
        }).filter(Boolean);
        render(merged);
    } catch (error) {
        console.warn("Live saved-world refresh failed:", error);
    } finally {
        liveCloudRefreshRunning = false;
    }
}

async function reload() {
    const button = overlay.querySelector('[data-act="reload"]');
    button.disabled = true;
    try {
        await retryCloudDeletes();
        const worlds = await allRecords();
        render(worlds);
        if (typeof window.webMinecraftCloudSync === "function") {
            try { await window.webMinecraftCloudSync(); } catch {}
            render(await allRecords());
        }
    } catch (error) { console.error("Could not reload worlds:", error); }
    finally { button.disabled = false; }
}

async function openMenu() {
    buildUI();
    showMenu();
    try {
        await storageReady;
        await retryCloudDeletes();
        render(await allRecords());
        if (typeof window.webMinecraftCloudSync === "function") {
            try { await window.webMinecraftCloudSync(); } catch {}
            render(await allRecords());
        }
    } catch (error) { console.error("Could not load saved worlds:", error); }
}

export async function getLocalWorld(seed) {
    return getRecord(seed);
}

export async function saveLocalWorld(world) {
    return putRecord(world);
}

export async function deleteLocalWorld(seed) {
    await deleteRecord(seed);
    worldsCache = worldsCache.filter(w => seedOf(w.seed) !== seedOf(seed));
    writeIndex(worldsCache);
}

export function isWorldDeleted(seed) {
    const s = seedOf(seed);
    return s !== null && deletedSeeds().has(s);
}

export async function initSavedWorldStorage() {
    if (!storageReady) storageReady = migrateOldFallback();
    await storageReady;
    return true;
}

export function initSavedWorlds({ onOpenWorld } = {}) {
    if (initialized) return;
    initialized = true;
    openWorldCallback = onOpenWorld;
    buildUI();
    storageReady = initSavedWorldStorage();
    const playButton = document.getElementById("playButton");
    if (playButton) playButton.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openMenu(); }, true);
    window.addEventListener("webminecraft:cloudworldschanged", () => {
        refreshFromLiveCloud().catch(() => {});
    });
    window.addEventListener("webminecraft:cloudworldssynced", () => {
        if (overlay?.style.display === "block") refreshFromLiveCloud().catch(() => {});
    });
    window.addEventListener("keydown", event => {
        if (event.code === "Escape" && overlay?.style.display === "block") {
            if (details?.classList.contains("open")) closeDetails();
            else if (createModal?.style.display === "flex") closeCreate();
            else closeMenu();
        }
    });
}
