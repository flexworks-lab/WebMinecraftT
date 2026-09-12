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
    { id: 10, name: "Bedrock", texture: null, color: "#4b4b4b", category: "natural" },
    { id: 11, name: "Coal Ore", texture: null, color: "#343434", category: "natural" },
    { id: 12, name: "Iron Ore", texture: null, color: "#8c8c8c", category: "natural" },
    { id: 13, name: "Oak Planks", texture: null, color: "#b48754", category: "natural" },
    { id: 14, name: "Snow", texture: null, color: "#e9f4ff", category: "natural" },
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
#inventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.64);z-index:150;pointer-events:auto;font-family:Arial,sans-serif;color:#fff}
#inventoryScreen.open{display:flex}
#inventoryPanel{width:min(900px,94vw);height:min(690px,91vh);display:flex;flex-direction:column;padding:10px;background:#3b3b3b;border:3px solid #151515;border-top-color:#777;border-left-color:#777;box-shadow:10px 10px 0 rgba(0,0,0,.58),inset 2px 2px 0 #5b5b5b;image-rendering:pixelated;overflow:hidden}
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
.slotTexture{position:absolute;inset:6px;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.slotFallback{position:absolute;inset:6px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;text-shadow:2px 2px 0 #222}
.slotCount{position:absolute;right:3px;bottom:1px;font:bold 14px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none}.slotNumber{position:absolute;left:3px;top:1px;font:bold 11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none}
.destroySlot,.offhandSlot{width:64px;height:64px;justify-self:center;display:flex;align-items:center;justify-content:center;font-size:38px;color:#d33;background:#5b3838;cursor:pointer}
.destroySlot{color:#f14}.destroySlot:hover{background:#733b3b;filter:brightness(1.15)}.offhandSlot{color:#bbb;font-size:13px;cursor:default}
.offhandSlot::after{content:"";position:absolute;inset:10px;border:2px dashed #aaa;opacity:.35}
#inventoryMobileButton{display:none;position:fixed;right:18px;bottom:84px;width:54px;height:54px;z-index:10001;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#555;color:#fff;font-size:27px;box-shadow:0 3px 0 #171717;touch-action:manipulation}
body.mobile-mode.webminecraft-in-world #inventoryMobileButton{display:block;left:calc(50% - min(252px,45vw) - 66px);right:auto;bottom:8px;z-index:10001}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{z-index:10000!important;bottom:8px!important}
#heldBlock{display:none!important;pointer-events:none}
@media(max-width:700px){#inventoryPanel{width:96vw;height:94vh;padding:7px}#catalogGrid{grid-template-columns:repeat(6,minmax(42px,1fr))}#creativeTabs{gap:4px}.inventoryTab{width:48px;height:44px}#catalogToolbar{align-items:flex-start;flex-direction:column;gap:6px}#catalogSearchWrap{width:100%}#inventoryBottom{grid-template-columns:54px 1fr 54px;gap:5px}#hotbarInventory{grid-template-columns:repeat(9,minmax(27px,1fr));gap:3px}.destroySlot,.offhandSlot{width:50px;height:50px;font-size:30px}}
`;
    document.head.appendChild(style);

    renderTabs();
    document.getElementById("catalogSearch").addEventListener("input", event => {
        searchQuery = event.target.value;
        if (searchQuery.trim()) selectedTab = "search";
        renderTabs();
        renderCatalog();
    });
    screen.addEventListener("pointerdown", event => { if (event.target === screen) closeInventory(); });
    document.getElementById("inventoryClose").addEventListener("click", closeInventory);
    document.getElementById("destroySlot").addEventListener("dragover", event => event.preventDefault());
    document.getElementById("destroySlot").addEventListener("drop", event => {
        event.preventDefault();
        if (draggedInventory !== null) {
            inventory[draggedInventory] = null;
            draggedInventory = null;
            saveInventory();
            renderInventory();
        } else if (draggedCatalog) {
            draggedCatalog = null;
        }
    });
}

function renderTabs() {
    const tabs = document.getElementById("creativeTabs");
    if (!tabs) return;
    tabs.innerHTML = TAB_DEFS.map(tab => `<button class="inventoryTab${selectedTab === tab.id ? " active" : ""}" type="button" data-tab="${tab.id}" title="${tab.label}" aria-label="${tab.label}">${iconSvg(tab.id)}</button>`).join("");
    tabs.querySelectorAll(".inventoryTab").forEach(button => button.addEventListener("click", () => {
        selectedTab = button.dataset.tab;
        if (selectedTab !== "search") {
            searchQuery = "";
            const input = document.getElementById("catalogSearch");
            if (input) input.value = "";
        }
        renderTabs();
        renderCatalog();
        renderSurvival();
    }));
}

function renderCatalog() {
    const grid = document.getElementById("catalogGrid");
    const section = document.getElementById("catalogSectionName");
    const searchWrap = document.getElementById("catalogSearchWrap");
    if (!grid || !section) return;
    if (selectedTab === "survival") {
        document.getElementById("catalogPanel").style.display = "none";
        document.getElementById("survivalPanel").hidden = false;
        return;
    }
    document.getElementById("catalogPanel").style.display = "flex";
    document.getElementById("survivalPanel").hidden = true;
    section.textContent = selectedTab === "search" ? "Search Results" : (selectedTab === "tools" ? "Tools & Utilities" : "Natural Blocks");
    if (searchWrap) searchWrap.style.display = selectedTab === "search" || searchQuery ? "flex" : "none";
    const items = itemsForCurrentTab();
    grid.innerHTML = items.length ? items.map(item => `<div class="catalogSlot" draggable="true" data-item-id="${item.id}" title="${item.name}">${itemVisual(item)}<span class="catalogName">${item.name}</span></div>`).join("") : `<div style="grid-column:1/-1;color:#999;text-align:center;padding:30px 10px;font-size:13px">No items found</div>`;
    grid.querySelectorAll(".catalogSlot").forEach(cell => {
        const itemId = Number(cell.dataset.itemId);
        cell.addEventListener("dragstart", event => {
            draggedCatalog = itemId;
            cell.style.opacity = ".45";
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", String(itemId));
        });
        cell.addEventListener("dragend", () => { draggedCatalog = null; cell.style.opacity = ""; });
        cell.addEventListener("click", () => addItem(itemId, MAX_STACK));
    });
    grid.querySelectorAll(".catalogTexture").forEach(texture => {
        const fallback = texture.nextElementSibling;
        texture.addEventListener("error", () => {
            texture.style.display = "none";
            if (fallback) fallback.style.display = "flex";
        });
    });
}

function renderSlot(slot, index, options = {}) {
    const cell = document.createElement("div");
    cell.className = options.extraClass || "inventorySlot";
    cell.draggable = !!slot;
    if (slot) {
        const item = getItem(slot.itemId);
        if (item) {
            let visual = item.texture ? `<span class="slotTexture" style="background-image:url('${textureUrl(item.texture)}')"></span><span class="slotFallback">${item.name.charAt(0)}</span>` : `<span class="slotTexture" style="background:${item.color}"></span>`;
            cell.innerHTML = visual + `<span class="slotCount">${slot.count > 1 ? slot.count : ""}</span>` + (options.hotbar ? `<span class="slotNumber">${index + 1}</span>` : "");
            cell.title = `${item.name} (${slot.count})`;
            cell.addEventListener("dragstart", event => {
                draggedInventory = index;
                cell.classList.add("dragging");
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", `inventory:${index}`);
            });
            cell.addEventListener("dragend", () => { draggedInventory = null; cell.classList.remove("dragging"); });
        }
    } else if (options.hotbar) {
        cell.innerHTML = `<span class="slotNumber">${index + 1}</span>`;
        cell.title = "Empty slot";
    }
    cell.addEventListener("dragover", event => event.preventDefault());
    cell.addEventListener("drop", event => {
        event.preventDefault();
        const sourceInventory = draggedInventory;
        const sourceCatalog = draggedCatalog;
        if (sourceInventory !== null && sourceInventory !== undefined) {
            if (sourceInventory === index) return;
            [inventory[index], inventory[sourceInventory]] = [inventory[sourceInventory], inventory[index]];
        } else if (sourceCatalog !== null && sourceCatalog !== undefined) {
            inventory[index] = { itemId: sourceCatalog, count: MAX_STACK };
        } else return;
        draggedInventory = null;
        draggedCatalog = null;
        saveInventory();
        renderInventory();
    });
    return cell;
}

function renderInventory() {
    const hotbar = document.getElementById("hotbarInventory");
    if (!hotbar) return;
    hotbar.innerHTML = "";
    for (let i = 0; i < HOTBAR_SIZE; i++) hotbar.appendChild(renderSlot(inventory[i], i, { hotbar: true }));
    const remainder = inventory.slice(HOTBAR_SIZE);
    if (selectedTab === "survival") renderSurvival(remainder);
    syncHotbar();
}

function renderSurvival() {
    const panel = document.getElementById("survivalPanel");
    if (!panel) return;
    panel.innerHTML = `<div style="font-weight:700;font-size:16px;margin-bottom:10px">Inventory</div><div id="survivalGrid"></div>`;
    const grid = document.getElementById("survivalGrid");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(9,minmax(38px,1fr));gap:5px;max-width:620px";
    for (let i = HOTBAR_SIZE; i < INVENTORY_SIZE; i++) grid.appendChild(renderSlot(inventory[i], i));
}

function syncHotbar() {
    document.querySelectorAll("#hotbar .slot").forEach((slotEl, index) => {
        const slot = inventory[index];
        let countEl = slotEl.querySelector(".hotbarCount");
        if (!countEl) { countEl = document.createElement("span"); countEl.className = "hotbarCount"; slotEl.appendChild(countEl); }
        countEl.textContent = slot?.count > 1 ? slot.count : "";
        const textureEl = slotEl.querySelector(".hotbarTexture");
        if (slot && textureEl) {
            const item = getItem(slot.itemId);
            if (item?.texture) textureEl.style.backgroundImage = `url('${textureUrl(item.texture)}')`;
            else textureEl.style.backgroundImage = "none";
        }
    });
    updateHeldBlock();
}

function loadHeldTexture(info) {
    if (!heldTextureLoader) heldTextureLoader = new THREE.TextureLoader();
    if (heldTextureCache.has(info.texture)) return heldTextureCache.get(info.texture);
    const texture = heldTextureLoader.load(textureUrl(info.texture));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    heldTextureCache.set(info.texture, texture);
    return texture;
}

function makeHandMaterial() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.MeshLambertMaterial({ color: 0xd59b72 });
    ctx.fillStyle = "#d79b72";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#bf815c";
    ctx.fillRect(0, 11, 16, 5);
    ctx.fillStyle = "#e4ad85";
    ctx.fillRect(3, 1, 10, 7);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return new THREE.MeshLambertMaterial({ map: texture });
}

function createHeld3D(camera) {
    if (!camera || held3D) return;
    held3DCamera = camera;
    const root = new THREE.Group();
    root.name = "WebMinecraftHeldBlock";
    root.position.set(0.62, -0.48, -1.18);
    root.rotation.set(-0.08, -0.18, -0.16);
    root.visible = false;

    const handMaterial = makeHandMaterial();
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.62, 0.22), handMaterial);
    forearm.position.set(0.20, -0.11, 0.06);
    forearm.rotation.set(0.08, -0.12, -0.16);
    root.add(forearm);

    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 0.28), handMaterial);
    hand.position.set(0.07, 0.17, -0.02);
    hand.rotation.set(0.12, -0.08, -0.12);
    root.add(hand);

    const block = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), Array.from({ length: 6 }, () => new THREE.MeshLambertMaterial({ color: 0xffffff })));
    block.name = "HeldTexturedBlock";
    block.position.set(-0.03, 0.26, -0.22);
    block.rotation.set(0.08, -0.22, 0.10);
    root.add(block);
    camera.add(root);
    held3D = { root, block, forearm, hand };
}

function updateHeldBlock() {
    const inWorld = document.body.classList.contains("webminecraft-in-world");
    const slotIndex = Number.isInteger(window.webMinecraftSelectedSlot) ? window.webMinecraftSelectedSlot : 0;
    const item = inventory[slotIndex];
    if (!held3D) return;
    if (!inWorld || !item) { held3D.root.visible = false; return; }
    const info = getItem(item.itemId);
    if (!info || !info.texture) { held3D.root.visible = false; return; }
    const texture = loadHeldTexture(info);
    for (const material of held3D.block.material) { material.map = texture; material.needsUpdate = true; }
    held3D.root.visible = true;
}

export function getSelectedItemId(slotIndex) { return inventory[slotIndex]?.itemId ?? null; }
export function consumeSelected(slotIndex) { return removeItem(slotIndex, 1); }
export function giveBrokenBlock(itemId) { return addItem(itemId, 1); }

export function setupInventory(camera) {
    loadInventory();
    createInventoryUI();
    createHeld3D(camera);
    renderTabs();
    renderInventory();
    renderCatalog();
    renderSurvival();
    window.webMinecraftSelectedSlot = 0;
    updateHeldBlock();
    window.addEventListener("webminecraft:selectedslot", event => {
        window.webMinecraftSelectedSlot = event.detail?.slot ?? 0;
        updateHeldBlock();
    });
    document.addEventListener("keydown", event => {
        if (event.key.toLowerCase() === "e" && !event.repeat && document.body.classList.contains("webminecraft-in-world")) {
            event.preventDefault();
            inventoryOpen ? closeInventory() : openInventory();
        }
        if (event.key === "Escape" && inventoryOpen) closeInventory();
    });
    const worldObserver = new MutationObserver(updateHeldBlock);
    worldObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

function openInventory() {
    inventoryOpen = true;
    document.getElementById("inventoryScreen")?.classList.add("open");
    document.exitPointerLock?.();
    renderTabs();
    renderInventory();
    renderCatalog();
    renderSurvival();
}
function closeInventory() {
    inventoryOpen = false;
    document.getElementById("inventoryScreen")?.classList.remove("open");
}
