import { clearHotbar } from "./inventory.js";

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
        lastPlayedAt: world?.lastPlayedAt || world?.updatedAt || createdAt,
        mode: world?.mode === "creative" ? "creative" : "survival",
        preview: typeof world?.preview === "string" && world.preview.startsWith("data:image/") ? world.preview : null,
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
        updatedAt: w.updatedAt,
        lastPlayedAt: w.lastPlayedAt,
        mode: w.mode
    }));
    try { localStorage.setItem(INDEX_KEY, JSON.stringify(metadata)); } catch {}
}

async function getRecord(seed) {
    const s = seedOf(seed);
    if (s === null || deletedSeeds().has(s)) return null;
    const record = (await cacheRead(s)) || fallbackRead(s);
    if (!record) return null;
    if (!record.preview) {
        try {
            const legacy = localStorage.getItem(`webminecraft-world-preview-${s}`);
            if (legacy && legacy.startsWith("data:image/")) record.preview = legacy;
        } catch {}
    }
    return record;
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
#savedWorlds{position:fixed;inset:0;z-index:240;display:none;background:rgba(8,8,8,.72);color:#fff;font-family:Arial,sans-serif}
#savedWorlds .sw2-wrap{height:100%;display:flex;flex-direction:column;background:rgba(10,10,10,.58)}
#savedWorlds .sw2-head{display:flex;align-items:center;gap:14px;padding:14px 22px;background:#b7b7b7;color:#151515;border-bottom:2px solid #7a7a7a;box-shadow:0 3px 0 rgba(0,0,0,.35)}
#savedWorlds .sw2-title{margin:0 auto 0 0;font-family:"MinecraftFont",monospace;font-size:26px;font-weight:700;text-shadow:1px 1px 0 rgba(255,255,255,.45)}
#savedWorlds .sw2-count{color:#424242;font:12px Arial,sans-serif;margin-left:10px}
.sw2-btn{min-height:42px;padding:9px 14px;border:2px solid #1b1b1b;border-top-color:#a4a4a4;border-left-color:#a4a4a4;border-radius:0;background:linear-gradient(180deg,#737373,#565656);color:#fff;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:12px;text-shadow:2px 2px 0 #333;box-shadow:inset 2px 2px 0 rgba(255,255,255,.14),inset -2px -3px 0 rgba(0,0,0,.3),0 4px 0 rgba(0,0,0,.62);transition:none}
.sw2-btn:hover,.sw2-btn:active{background:linear-gradient(180deg,#737373,#565656);filter:none;transform:none}
.sw2-btn:focus,.sw2-btn:focus-visible{outline:none}
.sw2-btn:disabled{opacity:.5;cursor:default}
.sw2-green,.sw2-red{background:linear-gradient(180deg,#737373,#565656)}
#savedWorlds .sw2-create-wrap{max-width:1180px;width:calc(100% - 44px);margin:22px auto 12px}
#savedWorlds .sw2-create{width:100%;min-height:52px;padding:12px 18px;border:2px solid #1b1b1b;border-top-color:#a4a4a4;border-left-color:#a4a4a4;border-radius:0;background:linear-gradient(180deg,#858585,#666);color:#fff;font-family:"MinecraftFont",monospace;font-size:16px;text-shadow:2px 2px 0 #333;box-shadow:inset 2px 2px 0 rgba(255,255,255,.16),inset -2px -3px 0 rgba(0,0,0,.28),0 4px 0 rgba(0,0,0,.62);cursor:pointer;transition:none}
#savedWorlds .sw2-create:hover,#savedWorlds .sw2-create:active{background:linear-gradient(180deg,#858585,#666);filter:none;transform:none}
#savedWorlds .sw2-body{flex:1;overflow:auto;padding:0 22px 30px}
#savedWorlds .sw2-grid{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:10px}
#savedWorlds .sw2-card{display:grid;grid-template-columns:250px minmax(0,1fr) auto;align-items:center;gap:18px;background:rgba(40,40,40,.84);border:2px solid #101010;border-top-color:#6e6e6e;border-left-color:#6e6e6e;border-radius:0;padding:12px;box-shadow:4px 4px 0 rgba(0,0,0,.5);min-height:148px}
#savedWorlds .sw2-preview{width:250px;height:118px;display:block;object-fit:cover;background:linear-gradient(145deg,#5d6d78 0%,#8ba1af 45%,#6a7d55 46%,#415337 100%);border:2px solid #121212;image-rendering:auto}
#savedWorlds .sw2-info{min-width:0;display:flex;flex-direction:column;gap:8px}
#savedWorlds .sw2-name{margin:0;font-family:"MinecraftFont",monospace;font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#savedWorlds .sw2-mode{display:inline-flex;align-items:center;gap:7px;color:#d8d8d8;font-size:12px}
#savedWorlds .sw2-mode-icon{display:inline-grid;place-items:center;width:24px;height:24px;background:#4b4b4b;border:1px solid #777;font-size:14px}
#savedWorlds .sw2-details{display:grid;grid-template-columns:repeat(2,minmax(130px,1fr));gap:6px 18px;color:#b9b9b9;font-size:12px}
#savedWorlds .sw2-detail-label{color:#808080;text-transform:uppercase;font-size:9px;letter-spacing:.8px}
#savedWorlds .sw2-actions{display:flex;flex-direction:column;gap:8px;min-width:110px}
#savedWorlds .sw2-empty{max-width:760px;margin:18px auto;padding:34px;text-align:center;background:rgba(32,32,32,.82);border:2px solid #111;border-top-color:#707070;border-left-color:#707070;border-radius:0;color:#aaa}
#savedWorlds .sw2-empty h2{color:#fff;margin:0 0 10px;font-size:26px}
#savedWorlds .sw2-empty .sw2-btn{margin-top:12px}
#savedWorlds .sw2-panel{position:fixed;right:24px;top:94px;width:min(430px,calc(100% - 48px));max-height:calc(100% - 118px);overflow:auto;transform:none;display:none;background:#252525;border:2px solid #101010;border-top-color:#777;border-left-color:#777;border-radius:0;box-shadow:8px 8px 0 rgba(0,0,0,.55)}
#savedWorlds .sw2-panel.open{display:block}
#savedWorlds .sw2-panel-head{padding:15px;border-bottom:2px solid #111;display:flex;align-items:center}
#savedWorlds .sw2-panel-head h2{margin:0 auto 0 0}
#savedWorlds .sw2-panel-body{padding:18px}
#savedWorlds .sw2-label{color:#aaa;font-size:12px;margin:0 0 7px}
#savedWorlds .sw2-seed{padding:12px;background:#111;border:1px solid #555;border-radius:0;font-family:monospace;word-break:break-all}
#savedWorlds .sw2-field{width:100%;height:44px;margin-top:10px;padding:0 11px;border-radius:0;border:2px solid #151515;border-top-color:#777;border-left-color:#777;background:#111;color:#fff;box-sizing:border-box}
#savedWorlds .sw2-modal{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.7);padding:20px}
#savedWorlds .sw2-modal-card{width:min(480px,94vw);background:#272727;border:2px solid #111;border-top-color:#777;border-left-color:#777;border-radius:0;padding:25px;box-sizing:border-box}
#savedWorlds .sw2-modal-card h2{margin:0 0 8px}
#savedWorlds .sw2-help{color:#aaa;font-size:12px;line-height:1.5;margin:0 0 15px}
@media(max-width:760px){#savedWorlds .sw2-head{padding:12px 14px;flex-wrap:wrap}#savedWorlds .sw2-title{font-size:22px;width:100%}#savedWorlds .sw2-count{margin-left:8px}.sw2-btn{min-height:40px}#savedWorlds .sw2-create-wrap{width:calc(100% - 28px);margin:14px auto 10px}#savedWorlds .sw2-body{padding:0 14px 24px}#savedWorlds .sw2-card{grid-template-columns:120px minmax(0,1fr);gap:12px;min-height:112px;padding:9px}#savedWorlds .sw2-preview{width:120px;height:92px}#savedWorlds .sw2-actions{grid-column:1/-1;flex-direction:row}.sw2-card .sw2-actions .sw2-btn{flex:1}.sw2-details{grid-template-columns:1fr!important}.sw2-panel{right:12px!important;top:12px!important;width:calc(100% - 24px)!important;max-height:calc(100% - 24px)!important}}`;

    document.head.appendChild(style);
}

function buildUI() {
    if (overlay) return;
    addStyle();
    overlay = document.createElement("div");
    overlay.id = "savedWorlds";
    overlay.innerHTML = `<div class="sw2-wrap"><div class="sw2-head"><h1 class="sw2-title">Worlds <span class="sw2-count"></span></h1><button class="sw2-btn" data-act="back">← Back</button></div><div class="sw2-create-wrap"><button class="sw2-create" data-act="new">+ Create New</button></div><div class="sw2-body"><div class="sw2-grid"></div><aside class="sw2-panel"><div class="sw2-panel-head"><h2></h2><button class="sw2-btn" data-act="close">×</button></div><div class="sw2-panel-body"><p class="sw2-label">World seed</p><div class="sw2-seed" data-seed>—</div><p class="sw2-help">Your complete world, including block changes, is stored in this browser and synced to your account when signed in.</p><button class="sw2-btn" style="width:100%;margin:5px 0" data-act="copy">Copy Seed</button><button class="sw2-btn sw2-green" style="width:100%;margin:5px 0" data-act="play">Play World</button><button class="sw2-btn sw2-red" style="width:100%;margin:5px 0" data-act="delete">Delete World</button><div data-message style="min-height:20px;margin-top:8px;font-size:12px"></div></div></aside><div class="sw2-modal"><div class="sw2-modal-card"><h2>Create New World</h2><p class="sw2-help">Give the world a name. The seed below is unique and can be copied later.</p><p class="sw2-label">Seed</p><div class="sw2-seed" data-new-seed></div><input class="sw2-field" maxlength="40" placeholder="World name" data-name><div data-create-message style="min-height:20px;font-size:12px;margin-top:8px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px"><button class="sw2-btn sw2-green" data-act="create">Create & Play</button><button class="sw2-btn" data-act="cancel">Cancel</button></div></div></div></div>`;
    document.body.appendChild(overlay);
    list = overlay.querySelector(".sw2-grid");
    details = overlay.querySelector(".sw2-panel");
    createModal = overlay.querySelector(".sw2-modal");
    overlay.addEventListener("click", event => {
        const action = event.target.closest("[data-act]")?.dataset.act;
        if (!action) return;
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
    document.body.classList.add("webminecraft-worlds-menu");
    document.getElementById("mainMenu")?.style && (document.getElementById("mainMenu").style.display = "none");
}

function closeMenu() {
    clearHotbar();
    closeDetails();
    closeCreate();
    if (overlay) overlay.style.display = "none";
    document.body.classList.remove("webminecraft-worlds-menu");
    const menu = document.getElementById("mainMenu");
    if (menu) menu.style.display = "flex";
}

function formatSize(world) {
    try {
        const bytes = new Blob([JSON.stringify(world)]).size;
        if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${bytes} B`;
    } catch { return "Storage size unavailable"; }
}

function formatLastPlayed(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Never";
    return date.toLocaleDateString([], { year:"numeric", month:"short", day:"numeric" });
}

function getMode(world) {
    try {
        const stored = localStorage.getItem(`webminecraft-world-mode-${world.seed}`);
        return stored === "creative" || world.mode === "creative" ? "creative" : "survival";
    } catch { return world.mode === "creative" ? "creative" : "survival"; }
}

function getPreviewUrl(world) {
    if (typeof world?.preview === "string" && world.preview.startsWith("data:image/")) return world.preview;
    try {
        const preview = localStorage.getItem(`webminecraft-world-preview-${world.seed}`);
        if (preview && preview.startsWith("data:image/")) return preview;
    } catch {}
    return "";
}

function renderPreviewFallback(world) {
    const canvas = document.createElement("canvas");
    canvas.width = 500; canvas.height = 236;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.imageSmoothingEnabled = false;
    const sky = ctx.createLinearGradient(0,0,0,150);
    sky.addColorStop(0,"#657988"); sky.addColorStop(1,"#aebac0");
    ctx.fillStyle=sky; ctx.fillRect(0,0,500,236);
    ctx.fillStyle="#48613e"; ctx.fillRect(0,145,500,91);
    const entries=Object.entries(world.blocks||{}).slice(0,180);
    const cols=["#5d5d5d","#826647","#7b8b4f","#777777","#a08a5e","#4a6b42"];
    entries.forEach(([key,value],index)=>{
        const parts=key.split(",").map(Number);
        if(parts.length!==3||parts.some(n=>!Number.isFinite(n))) return;
        const x=((parts[0]*17+index*13)%470+470)%470;
        const y=145-Math.max(0,Math.min(95,Math.floor((parts[1]-8)*7)));
        ctx.fillStyle=cols[Math.abs(Number(value)||0)%cols.length];
        ctx.fillRect(x,y,18,18);
    });
    ctx.fillStyle="rgba(0,0,0,.24)"; ctx.fillRect(0,0,500,236);
    return canvas.toDataURL("image/png");
}

function render(worlds) {
    worldsCache = worlds.map(normalize).filter(Boolean).sort((a,b) => new Date(b.lastPlayedAt || b.updatedAt).getTime() - new Date(a.lastPlayedAt || a.updatedAt).getTime());
    writeIndex(worldsCache);
    overlay.querySelector(".sw2-count").textContent = `${worldsCache.length} world${worldsCache.length === 1 ? "" : "s"}`;
    if (!worldsCache.length) {
        list.innerHTML = `<div class="sw2-empty"><h2>No worlds yet</h2><p>Create a new world to get started.</p><button class="sw2-btn" data-act="new">+ Create New</button></div>`;
        return;
    }
    list.innerHTML = worldsCache.map((world, i) => {
        const mode=getMode(world);
        const preview=getPreviewUrl(world) || renderPreviewFallback(world);
        const safePreview=preview ? `<img class="sw2-preview" src="${esc(preview)}" alt="Screenshot preview of ${esc(world.name || `World ${i+1}`)}">` : `<div class="sw2-preview" aria-label="World preview"></div>`;
        return `<article class="sw2-card"><div>${safePreview}</div><div class="sw2-info"><h3 class="sw2-name">${esc(world.name || `World ${i+1}`)}</h3><div class="sw2-mode"><span class="sw2-mode-icon">${mode === "creative" ? "▦" : "⛏"}</span><span>${mode === "creative" ? "Creative" : "Survival"}</span></div><div class="sw2-details"><div><div class="sw2-detail-label">Storage</div>${esc(formatSize(world))}</div><div><div class="sw2-detail-label">Last Played</div>${esc(formatLastPlayed(world.lastPlayedAt || world.updatedAt))}</div></div></div><div class="sw2-actions"><button class="sw2-btn" data-play-seed="${world.seed}">Play</button><button class="sw2-btn" data-details-seed="${world.seed}">Details</button></div></article>`;
    }).join("");
    list.querySelectorAll("[data-play-seed]").forEach(button => button.addEventListener("click", () => void playWorld(worldsCache.find(w => w.seed === seedOf(button.dataset.playSeed)))));
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

async function playWorld(world) {
    if (!world || !openWorldCallback) return;
    const now = new Date().toISOString();
    const mode = getMode(world);
    world.lastPlayedAt = now;
    world.updatedAt = world.updatedAt || now;
    world.mode = mode;
    // Persist the mode by seed so returning to this world restores the
    // exact mode even after a page reload or a later Worlds-menu session.
    try { localStorage.setItem(`webminecraft-world-mode-${world.seed}`, mode); } catch {}
    try { await putRecord(world); } catch {}
    closeMenu();
    openWorldCallback(world.seed);
}

function playSelected() { void playWorld(selected); }

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
        let mode = "survival";
        try {
            const pending = localStorage.getItem("webminecraft-pending-singleplayer-mode");
            const seeded = localStorage.getItem(`webminecraft-world-mode-${seed}`);
            mode = pending === "creative" || seeded === "creative" ? "creative" : "survival";
        } catch {}
        try { localStorage.setItem(`webminecraft-world-mode-${seed}`, mode); } catch {}
        const world = await putRecord({ seed, name, createdAt: now, updatedAt: now, lastPlayedAt: now, mode, blocks: {} });
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
                mode: cloud.mode || local?.mode || "survival",
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
