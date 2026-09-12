import * as THREE from "three";

const INVENTORY_SIZE = 36;
const HOTBAR_SIZE = 9;
const MAX_STACK = 64;
const INVENTORY_VERSION = 5;

const ITEM_TYPES = [
    { id: 1, name: "Grass Block", texture: "Grass_Block_(top_texture)_JE2.png", category: "natural" },
    { id: 2, name: "Dirt", texture: "dirt.png", category: "natural" },
    { id: 3, name: "Stone", texture: "stone.png", category: "natural" },
    { id: 4, name: "Sand", texture: "sand.png", category: "natural" },
    { id: 5, name: "Oak Log", texture: "oak_log_top.png", category: "natural" },
    { id: 6, name: "Oak Leaves", texture: "oak-leaves-normal-original-default.png", category: "natural" },
    { id: 7, name: "Cobblestone", texture: "stone.png", category: "natural" },
    { id: 8, name: "Gravel", texture: "dirt.png", category: "natural" },
    { id: 9, name: "Sandstone", texture: "sand.png", category: "natural" },
    { id: 10, name: "Bedrock", texture: "bedrock.png", category: "natural" },
    { id: 11, name: "Coal Ore", texture: "coal_ore.png", category: "natural" },
    { id: 12, name: "Iron Ore", texture: "iron_ore.png", category: "natural" },
    { id: 13, name: "Oak Planks", texture: "oak_planks.png", category: "natural" },
    { id: 14, name: "Snow", texture: "snow.png", category: "natural" },
    { id: 15, name: "TNT", texture: "tnt_side.png", category: "tools" },
    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png", category: "tools" }
];

const TAB_DEFS = [
    { id: "tools", label: "Tools & Utilities", icon: "⚒" },
    { id: "natural", label: "Natural Blocks", icon: "◆" },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "survival", label: "Survival Inventory", icon: "▣" }
];

let inventory = Array.from({ length: INVENTORY_SIZE }, () => null);
let inventoryOpen = false;
let selectedTab = "natural";
let searchQuery = "";
let draggedCatalog = null;
let draggedInventory = null;
let held3D = null;
let held3DCamera = null;
let heldTextureLoader = null;
let heldTextureCache = new Map();

function textureUrl(texture) { return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(texture)}`; }
function getItem(itemId) { return ITEM_TYPES.find(item => item.id === itemId) || null; }
function saveInventory() { try { localStorage.setItem("webminecraft_inventory", JSON.stringify(inventory)); } catch {} }
function resetInventoryForNewUI() {
    inventory = Array.from({ length: INVENTORY_SIZE }, () => null);
    try {
        localStorage.setItem("webminecraft_inventory_ui_version", String(INVENTORY_VERSION));
        saveInventory();
    } catch {}
}
function loadInventory() {
    let version = null;
    try { version = Number(localStorage.getItem("webminecraft_inventory_ui_version")); } catch {}
    if (version !== INVENTORY_VERSION) {
        resetInventoryForNewUI();
        return;
    }
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));
        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) {
            inventory = saved.map(slot => slot && Number.isFinite(slot.itemId) && Number.isFinite(slot.count) ? { itemId: slot.itemId, count: Math.max(1, Math.min(MAX_STACK, slot.count)) } : null);
        }
    } catch {}
}

function addItem(itemId, amount = 1) {
    const item = getItem(itemId);
    if (!item) return false;
    let left = amount;
    for (const slot of inventory) {
        if (left <= 0) break;
        if (slot?.itemId === itemId && slot.count < MAX_STACK) {
            const add = Math.min(left, MAX_STACK - slot.count);
            slot.count += add;
            left -= add;
        }
    }
    for (let i = 0; i < inventory.length && left > 0; i++) {
        if (!inventory[i]) {
            const add = Math.min(left, MAX_STACK);
            inventory[i] = { itemId, count: add };
            left -= add;
        }
    }
    saveInventory();
    renderInventory();
    return left === 0;
}

function removeItem(slotIndex, amount = 1) {
    const slot = inventory[slotIndex];
    if (!slot || slot.count < amount) return false;
    slot.count -= amount;
    if (slot.count <= 0) inventory[slotIndex] = null;
    saveInventory();
    renderInventory();
    return true;
}

export function clearHotbar() {
    let changed = false;
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        if (inventory[i] !== null) {
            inventory[i] = null;
            changed = true;
        }
    }
    if (changed) saveInventory();
    renderInventory();
    updateHeldBlock();
}

function itemMatchesSearch(item) {
    if (!searchQuery.trim()) return true;
    return item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
}

function itemsForCurrentTab() {
    if (selectedTab === "search") return ITEM_TYPES.filter(itemMatchesSearch);
    if (selectedTab === "survival") return [];
    return ITEM_TYPES.filter(item => item.category === selectedTab && itemMatchesSearch(item));
}

function iconSvg(name) {
    if (name === "tools") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.2a5 5 0 0 0-6.1 6.1l-5 5a2 2 0 0 0 2.8 2.8l5-5a5 5 0 0 0 6.1-6.1l-3 3-2-2 3-3Z"/><path d="m15 15 5.2 5.2M17.8 12.2l4-4M19.8 4.2l1.9 1.9"/></svg>';
    if (name === "natural") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4.9 2.5 8 6.1 8 10.1A8 8 0 1 1 4 13.1C4 9.8 6.7 6 12 3Z"/><path d="M12 21c0-5 1.8-9 5.9-12"/></svg>';
    if (name === "search") return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4z"/><path d="M7 6.5v-2h10v2M7 10h10M7 14h4"/></svg>';
}

function itemVisual(item) {
    if (item.texture) {
        return `<span class="catalogIcon catalogTexture" style="background-image:url('${textureUrl(item.texture)}')"></span><span class="catalogFallback">${item.name.charAt(0)}</span>`;
    }
    return `<span class="catalogIcon catalogColor" style="--item-color:${item.color}"></span>`;
}

function createInventoryUI() {
    if (document.getElementById("inventoryScreen")) return;
    const screen = document.createElement("div");
    screen.id = "inventoryScreen";
    screen.innerHTML = `
        <div id="inventoryPanel">
            <div id="inventoryTopBar">
                <div id="inventoryTitle">Creative</div>
                <button id="inventoryClose" type="button" aria-label="Close inventory">×</button>
            </div>
            <div id="creativeTabs" role="tablist" aria-label="Inventory categories"></div>
            <div id="inventoryBody">
                <div id="catalogPanel">
                    <div id="catalogToolbar">
                        <div id="catalogSectionName">Natural Blocks</div>
                        <div id="catalogSearchWrap"><span class="searchIcon">⌕</span><input id="catalogSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Search" aria-label="Search items"></div>
                    </div>
                    <div id="catalogViewport"><div id="catalogGrid"></div></div>
                </div>
                <div id="survivalPanel" hidden></div>
            </div>
            <div id="inventoryBottom">
                <div id="destroySlot" class="destroySlot" title="Destroy item" aria-label="Destroy item">×</div>
                <div id="hotbarInventory"></div>
                <div id="offhandSlot" class="offhandSlot" title="Off-hand"></div>
            </div>
        </div>`;
    document.body.appendChild(screen);

    const mobileButton = document.createElement("button");
    mobileButton.id = "inventoryMobileButton";
    mobileButton.type = "button";
    mobileButton.textContent = "▣";
    mobileButton.title = "Inventory";
    mobileButton.setAttribute("aria-label", "Inventory");
    mobileButton.addEventListener("click", openInventory);
    document.body.appendChild(mobileButton);

    const held = document.createElement("div");
    held.id = "heldBlock";
    held.setAttribute("aria-hidden", "true");
    document.body.appendChild(held);

    const style = document.createElement("style");
    style.id = "webMinecraftInventoryStyles";
    style.textContent = `
#inventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.64);z-index:999999;pointer-events:auto;font-family:Arial,sans-serif;color:#fff}
#inventoryScreen.open{display:flex}
body.inventory-open #hotbar.textured-hotbar{display:none!important}
#inventoryPanel{position:relative;z-index:1000000;width:min(900px,94vw);height:min(690px,91vh);display:flex;flex-direction:column;padding:10px;background:#3b3b3b;border:3px solid #151515;border-top-color:#777;border-left-color:#777;box-shadow:10px 10px 0 rgba(0,0,0,.58),inset 2px 2px 0 #5b5b5b;image-rendering:pixelated;overflow:hidden}
#inventoryTopBar{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 4px 6px;flex:0 0 auto}
#inventoryTitle{font-size:22px;font-weight:700;text-shadow:2px 2px 0 #171717}
#inventoryClose{width:38px;height:36px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#696969;color:#fff;font-size:27px;line-height:25px;cursor:pointer;box-shadow:inset -2px -2px 0 #444}
#creativeTabs{display:flex;gap:6px;flex:0 0 auto;padding:0 3px 8px;border-bottom:2px solid #171717}
.inventoryTab{width:54px;height:48px;border:2px solid #161616;border-top-color:#8b8b8b;border-left-color:#8b8b8b;background:#5e5e5e;color:#ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset -2px -2px 0 #444;position:relative}
.inventoryTab:hover{filter:brightness(1.14)}.inventoryTab.active{background:#898989;border-color:#f0f0f0;color:#fff;transform:translateY(1px)}
.inventoryTab svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:square;stroke-linejoin:miter}.inventoryTab:nth-child(2) svg{fill:currentColor;stroke:currentColor}
#inventoryBody{min-height:0;flex:1;display:flex;padding-top:10px}
#catalogPanel{min-width:0;flex:1;display:flex;flex-direction:column;background:#252525;border:2px solid #111;padding:8px}
#catalogToolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex:0 0 auto}
#catalogSectionName{font-size:16px;font-weight:700;text-shadow:1px 1px 0 #000}
#catalogSearchWrap{width:min(300px,45%);height:34px;display:flex;align-items:center;border:2px solid #121212;background:#131313;box-shadow:inset 2px 2px 0 #080808}
#catalogSearchWrap .searchIcon{font-size:22px;color:#aaa;padding:0 5px 2px}
#catalogSearch{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;padding:0 8px;font-size:14px}
#catalogSearch::placeholder{color:#858585}
#catalogViewport{min-height:0;flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 2px 2px 1px;scrollbar-color:#777 #171717;scrollbar-width:thin}
#catalogGrid{display:grid;grid-template-columns:repeat(9,minmax(44px,1fr));gap:5px;align-content:start}
.catalogSlot{position:relative;min-width:0;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#858585;cursor:grab;box-shadow:inset -1px -1px 0 #444;touch-action:none}
.catalogSlot:active{cursor:grabbing}.catalogSlot:hover{filter:brightness(1.13);border-color:#fff}
.catalogIcon{position:absolute;inset:6px;display:block}.catalogTexture{background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.catalogTexture{background-color:transparent}
.catalogFallback{position:absolute;inset:6px;display:none;align-items:center;justify-content:center;font-size:22px;font-weight:700;text-shadow:2px 2px 0 #222;background:#666;color:#fff}
.catalogColor{background:var(--item-color);box-shadow:inset 3px 3px 0 rgba(255,255,255,.14),inset -3px -3px 0 rgba(0,0,0,.2)}
.catalogName{position:absolute;left:2px;right:2px;bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px;text-shadow:1px 1px 0 #000;opacity:0;pointer-events:none}
.catalogSlot:hover .catalogName{opacity:1}
#survivalPanel{flex:1;background:#252525;border:2px solid #111;padding:10px}
#inventoryBottom{height:96px;flex:0 0 auto;display:grid;grid-template-columns:76px 1fr 76px;align-items:center;gap:12px;padding-top:10px}
#hotbarInventory{display:grid;grid-template-columns:repeat(9,minmax(42px,58px));justify-content:center;gap:5px}
.inventorySlot,.destroySlot,.offhandSlot{position:relative;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#858585;box-shadow:inset -1px -1px 0 #444;min-width:0}
.inventorySlot{cursor:grab;touch-action:none}.inventorySlot:hover{filter:brightness(1.12);border-color:#fff}.inventorySlot.dragging{opacity:.42}
.slotTexture{position:absolute;inset:5px;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated;pointer-events:none}.slotFallback{position:absolute;inset:5px;display:none;align-items:center;justify-content:center;font-size:20px;font-weight:700;text-shadow:2px 2px 0 #222;background:#666;color:#fff;pointer-events:none}.slotCount{position:absolute;right:3px;bottom:1px;color:#fff;font:bold 13px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none}.slotName{position:absolute;left:2px;right:2px;bottom:2px;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;pointer-events:none;text-shadow:1px 1px 0 #000}.inventorySlot:hover .slotName{opacity:1}
#destroySlot{font-size:36px;font-weight:700;color:#ddd;text-align:center;line-height:1;display:flex;align-items:center;justify-content:center}
#offhandSlot{opacity:.55}
#heldBlock{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);width:112px;height:112px;display:none;z-index:1000001;pointer-events:none}
body.webminecraft-in-world #inventoryMobileButton{display:none}
#inventoryMobileButton{position:fixed;right:14px;bottom:72px;width:50px;height:50px;border:2px solid #222;border-top-color:#aaa;border-left-color:#aaa;background:#656565;color:#fff;font-size:25px;z-index:99998;box-shadow:inset -2px -2px 0 #333}
@media (max-width:720px){#inventoryPanel{width:96vw;height:92vh;padding:7px}#inventoryBottom{grid-template-columns:52px 1fr 52px;gap:7px}#hotbarInventory{grid-template-columns:repeat(9,minmax(28px,1fr));gap:3px}.inventorySlot,.destroySlot,.offhandSlot{border-width:1px}.slotTexture{inset:4px}.catalogSlot{min-width:34px}.catalogGrid{grid-template-columns:repeat(6,minmax(36px,1fr))}.catalogSlot{aspect-ratio:1}}
`;
    document.head.appendChild(style);
}

function renderCatalog() {
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const items = itemsForCurrentTab();
    for (const item of items) {
        const slot = document.createElement("div");
        slot.className = "catalogSlot";
        slot.draggable = true;
        slot.innerHTML = `${itemVisual(item)}<span class="catalogName">${item.name}</span>`;
        slot.addEventListener("dragstart", () => { draggedCatalog = item.id; });
        slot.addEventListener("dragend", () => { draggedCatalog = null; });
        slot.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;
            draggedCatalog = item.id;
        });
        grid.appendChild(slot);
    }
}

function renderInventory() {
    const hotbar = document.getElementById("hotbarInventory");
    if (!hotbar) return;
    hotbar.innerHTML = "";
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const slot = document.createElement("div");
        slot.className = "inventorySlot";
        const value = inventory[i];
        if (value) {
            const item = getItem(value.itemId);
            if (item) {
                if (item.texture) slot.innerHTML = `<span class="slotTexture" style="background-image:url('${textureUrl(item.texture)}')"></span>`;
                else slot.innerHTML = `<span class="slotFallback">${item.name.charAt(0)}</span>`;
                if (value.count > 1) slot.innerHTML += `<span class="slotCount">${value.count}</span>`;
                slot.innerHTML += `<span class="slotName">${item.name}</span>`;
            }
        }
        hotbar.appendChild(slot);
    }
}

export function getSelectedItemId(slotIndex) {
    return inventory[slotIndex]?.itemId || 0;
}

export function consumeSelected(slotIndex, amount = 1) {
    return removeItem(slotIndex, amount);
}

export function updateHeldBlock() {
    const held = document.getElementById("heldBlock");
    if (!held) return;
    held.style.display = "none";
}

function openInventory() {
    createInventoryUI();
    inventoryOpen = true;
    document.body.classList.add("inventory-open");
    document.getElementById("inventoryScreen")?.classList.add("open");
    renderInventory();
    renderCatalog();
    document.exitPointerLock?.();
}

function closeInventory() {
    inventoryOpen = false;
    document.body.classList.remove("inventory-open");
    document.getElementById("inventoryScreen")?.classList.remove("open");
    if (!document.body.classList.contains("mobile-mode") && document.body.classList.contains("webminecraft-in-world")) {
        try { document.body.requestPointerLock?.(); } catch {}
    }
}

export function setupInventory() {
    loadInventory();
    createInventoryUI();
    renderInventory();
    renderCatalog();
    document.getElementById("inventoryClose")?.addEventListener("click", closeInventory);
    document.addEventListener("keydown", event => {
        if (event.code === "KeyE") {
            event.preventDefault();
            inventoryOpen ? closeInventory() : openInventory();
        }
    });
}
