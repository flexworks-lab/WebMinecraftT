const INDEX_KEY = "webminecraft_saved_world_index_v2";
const DELETED_KEY = "webminecraft_deleted_worlds";
const CACHE_NAME = "webminecraft-worlds-v2";
const CACHE_PREFIX = "/__webminecraft_world_v2__/";
const FALLBACK_PREFIX = "webminecraft_world_v2_";
const FALLBACK_CHUNK_PREFIX = "webminecraft_world_v2_chunk_";

let observer = null;
let refreshTimer = null;

function seedOf(value) {
    const n = Number(value);
    return Number.isFinite(n) ? (Math.floor(Math.abs(n)) >>> 0) : null;
}

function readIndex() {
    try {
        const raw = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
    } catch { return []; }
}

function writeIndex(worlds) {
    try { localStorage.setItem(INDEX_KEY, JSON.stringify(worlds)); } catch {}
}

function deletedSeeds() {
    try {
        const raw = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(seedOf).filter(v => v !== null) : []);
    } catch { return new Set(); }
}

function writeDeleted(set) {
    try { localStorage.setItem(DELETED_KEY, JSON.stringify([...set])); } catch {}
}

async function clearStoredWorld(seed) {
    const s = seedOf(seed);
    if (s === null) return;

    if (window.caches) {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(new Request(`${location.origin}${CACHE_PREFIX}${s}.json`));
        } catch {}
    }

    try {
        const metaKey = `${FALLBACK_PREFIX}${s}`;
        const meta = JSON.parse(localStorage.getItem(metaKey) || "null");
        const count = Number(meta?.chunks);
        if (Number.isInteger(count) && count > 0) {
            for (let i = 0; i < count; i++) localStorage.removeItem(`${FALLBACK_CHUNK_PREFIX}${s}_${i}`);
        }
        localStorage.removeItem(metaKey);
    } catch {}
}

function getCardSeed(card, index, indexWorlds) {
    const direct = card.dataset.seed || card.getAttribute("data-seed") || card.querySelector("[data-seed]")?.textContent;
    const directSeed = seedOf(direct?.trim?.() ?? direct);
    if (directSeed !== null) return directSeed;

    const fromWorld = seedOf(indexWorlds[index]?.seed);
    return fromWorld;
}

function addStyles() {
    if (document.getElementById("sw2BulkDeleteStyles")) return;
    const style = document.createElement("style");
    style.id = "sw2BulkDeleteStyles";
    style.textContent = `
#sw2BulkToolbar{max-width:1180px;margin:0 auto 18px;padding:12px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:rgba(25,25,25,.94);border:1px solid #555;border-radius:8px;box-shadow:0 4px 12px #0007}
#sw2BulkToolbar label{display:flex;align-items:center;gap:9px;color:#fff;font-weight:700;cursor:pointer}
#sw2BulkToolbar input{width:22px;height:22px;accent-color:#84ad5e;cursor:pointer}
#sw2BulkCount{color:#aaa;font-size:12px;margin-right:auto}
#sw2BulkDelete{min-height:40px;padding:8px 14px;border:1px solid #111;border-top-color:#888;border-left-color:#888;border-radius:6px;background:#774747;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 3px #111}
#sw2BulkDelete:disabled{opacity:.45;cursor:default}
.sw2-bulk-check{position:absolute;top:12px;left:12px;width:23px;height:23px;z-index:3;accent-color:#84ad5e;cursor:pointer}
.sw2-card.sw2-selected{outline:2px solid #84ad5e;outline-offset:1px}
.sw2-card.sw2-has-bulk-check{position:relative;padding-left:50px}
@media(max-width:700px){#sw2BulkToolbar{align-items:stretch}#sw2BulkCount{width:100%;margin:0}.sw2-bulk-check{top:10px;left:10px}}
`;
    document.head.appendChild(style);
}

function cardsAndSeeds() {
    const grid = document.querySelector("#savedWorlds .sw2-grid");
    if (!grid) return [];
    const indexWorlds = readIndex();
    return [...grid.querySelectorAll(":scope > .sw2-card")].map((card, index) => ({ card, seed: getCardSeed(card, index, indexWorlds) })).filter(item => item.seed !== null);
}

function selectedItems() {
    return cardsAndSeeds().filter(({ card }) => card.querySelector(".sw2-bulk-check")?.checked);
}

function updateToolbarState() {
    const toolbar = document.getElementById("sw2BulkToolbar");
    if (!toolbar) return;
    const items = cardsAndSeeds();
    const selected = selectedItems();
    const allChecked = items.length > 0 && selected.length === items.length;
    const someChecked = selected.length > 0 && !allChecked;
    const selectAll = toolbar.querySelector("#sw2BulkSelectAll");
    const deleteButton = toolbar.querySelector("#sw2BulkDelete");
    const count = toolbar.querySelector("#sw2BulkCount");
    if (selectAll) { selectAll.checked = allChecked; selectAll.indeterminate = someChecked; }
    if (deleteButton) deleteButton.disabled = selected.length === 0;
    if (count) count.textContent = `${selected.length} selected / ${items.length} worlds`;
    items.forEach(({ card }) => {
        const checked = !!card.querySelector(".sw2-bulk-check")?.checked;
        card.classList.toggle("sw2-selected", checked);
    });
}

function ensureCheckboxes() {
    const grid = document.querySelector("#savedWorlds .sw2-grid");
    if (!grid) return false;
    addStyles();

    let toolbar = document.getElementById("sw2BulkToolbar");
    if (!toolbar) {
        toolbar = document.createElement("div");
        toolbar.id = "sw2BulkToolbar";
        toolbar.innerHTML = `
<label><input id="sw2BulkSelectAll" type="checkbox"> Select All</label>
<span id="sw2BulkCount">0 selected / 0 worlds</span>
<button id="sw2BulkDelete" type="button" disabled>Delete Selected</button>`;
        grid.parentNode.insertBefore(toolbar, grid);

        toolbar.querySelector("#sw2BulkSelectAll").addEventListener("change", event => {
            cardsAndSeeds().forEach(({ card }) => {
                const checkbox = card.querySelector(".sw2-bulk-check");
                if (checkbox) checkbox.checked = event.target.checked;
            });
            updateToolbarState();
        });

        toolbar.querySelector("#sw2BulkDelete").addEventListener("click", deleteSelected);
    }

    cardsAndSeeds().forEach(({ card }) => {
        if (card.querySelector(".sw2-bulk-check")) return;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "sw2-bulk-check";
        checkbox.title = "Select this world";
        checkbox.setAttribute("aria-label", "Select this world");
        checkbox.addEventListener("click", event => event.stopPropagation());
        checkbox.addEventListener("change", updateToolbarState);
        card.classList.add("sw2-has-bulk-check");
        card.appendChild(checkbox);
    });

    updateToolbarState();
    return true;
}

async function deleteSelected() {
    const items = selectedItems();
    if (!items.length) return;
    const names = items.map(({ card }) => card.querySelector("h3")?.textContent?.trim() || "Unnamed world");
    const message = items.length === 1
        ? `Delete “${names[0]}”? This cannot be undone.`
        : `Delete these ${items.length} worlds? This cannot be undone.`;
    if (!window.confirm(message)) return;

    const button = document.getElementById("sw2BulkDelete");
    if (button) { button.disabled = true; button.textContent = "Deleting…"; }

    const indexWorlds = readIndex();
    const selectedSeeds = new Set(items.map(item => item.seed));
    const deleted = deletedSeeds();
    selectedSeeds.forEach(seed => deleted.add(seed));
    writeDeleted(deleted);

    await Promise.all([...selectedSeeds].map(clearStoredWorld));
    writeIndex(indexWorlds.filter(world => !selectedSeeds.has(seedOf(world?.seed))));

    const reloadButton = document.querySelector('#savedWorlds [data-act="reload"]');
    if (reloadButton) reloadButton.click();
    else window.location.reload();
}

function sync() {
    if (!document.getElementById("savedWorlds")) return;
    const visible = getComputedStyle(document.getElementById("savedWorlds")).display !== "none";
    if (!visible) return;
    ensureCheckboxes();
}

function init() {
    if (observer || refreshTimer) return;
    observer = new MutationObserver(() => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => { refreshTimer = null; sync(); }, 0);
    });
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["style","class"] });
    sync();
    window.addEventListener("resize", sync, { passive:true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
