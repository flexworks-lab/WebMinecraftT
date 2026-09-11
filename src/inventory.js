const INVENTORY_SIZE = 36;
const HOTBAR_SIZE = 9;
const MAX_STACK = 64;

const ITEM_TYPES = [
    { id: 1, name: "Grass Block", texture: "Grass_Block_(top_texture)_JE2.png" },
    { id: 2, name: "Dirt", texture: "dirt.png" },
    { id: 3, name: "Stone", texture: "stone.png" },
    { id: 4, name: "Sand", texture: "sand.png" },
    { id: 5, name: "Oak Log", texture: "oak_log_top.png" },
    { id: 6, name: "Leaves", texture: "oak-leaves-normal-original-default.png" },
    { id: 7, name: "Cobblestone", texture: "stone.png" },
    { id: 8, name: "Gravel", texture: "dirt.png" },
    { id: 9, name: "Sandstone", texture: "sand.png" }
];

let inventory = Array.from({ length: INVENTORY_SIZE }, () => null);
let inventoryOpen = false;
let draggedSlot = null;

function textureUrl(texture) { return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(texture)}`; }
function ensureInitialItems() { ITEM_TYPES.forEach((item, index) => { if (!inventory[index]) inventory[index] = { itemId: item.id, count: 64 }; }); }
function getItem(itemId) { return ITEM_TYPES.find(item => item.id === itemId) || null; }
function saveInventory() { try { localStorage.setItem("webminecraft_inventory", JSON.stringify(inventory)); } catch {} }
function loadInventory() {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));
        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) inventory = saved;
        else ensureInitialItems();
    } catch { ensureInitialItems(); }
}

function addItem(itemId, amount = 1) {
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

function createInventoryUI() {
    if (document.getElementById("inventoryScreen")) return;
    const screen = document.createElement("div");
    screen.id = "inventoryScreen";
    screen.innerHTML = `<div id="inventoryPanel"><div id="inventoryHeader"><span>Inventory</span><button id="inventoryClose" type="button">×</button></div><div id="inventoryGrid"></div><div id="inventoryHint">E / Esc to close • Drag items between slots</div></div>`;
    document.body.appendChild(screen);

    const mobileButton = document.createElement("button");
    mobileButton.id = "inventoryMobileButton";
    mobileButton.type = "button";
    mobileButton.textContent = "▦";
    mobileButton.title = "Inventory";
    mobileButton.addEventListener("click", openInventory);
    document.body.appendChild(mobileButton);

    const style = document.createElement("style");
    style.id = "webMinecraftInventoryStyles";
    style.textContent = `
#inventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.58);z-index:150;pointer-events:auto;font-family:Arial,sans-serif}
#inventoryScreen.open{display:flex}
#inventoryPanel{width:min(620px,94vw);padding:12px;background:#383838;border:3px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:8px 8px 0 rgba(0,0,0,.6),inset 2px 2px 0 #555;color:#fff;image-rendering:pixelated}
#inventoryHeader{height:42px;display:flex;align-items:center;justify-content:space-between;font-family:"MinecraftFont",monospace;font-size:20px;text-shadow:2px 2px 0 #111;padding:0 4px 8px}
#inventoryClose{width:34px;height:34px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#666;color:#fff;font-size:25px;line-height:24px;cursor:pointer}
#inventoryGrid{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;padding:7px;background:#202020;border:2px solid #111}
.inventorySlot{position:relative;aspect-ratio:1;border:2px solid #555;border-top-color:#222;border-left-color:#222;background:#8b8b8b;cursor:pointer;touch-action:none}
.inventorySlot:hover{filter:brightness(1.15);border-color:#fff}.inventorySlot.dragging{opacity:.45}
.inventoryTexture{position:absolute;inset:5px;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}
.inventoryCount{position:absolute;right:3px;bottom:1px;color:#fff;font:bold 15px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none}
.inventoryNumber{position:absolute;left:3px;top:1px;color:#fff;font:bold 11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none}
#inventoryHint{padding:9px 3px 1px;color:#aaa;font-size:11px;text-align:center}
#inventoryMobileButton{display:none;position:fixed;right:18px;bottom:84px;width:54px;height:54px;z-index:90;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#555;color:#fff;font-size:27px;box-shadow:0 3px 0 #171717;touch-action:manipulation}
body.mobile-mode.webminecraft-in-world #inventoryMobileButton{display:block}
@media(max-width:700px){#inventoryPanel{width:96vw;padding:8px}#inventoryGrid{gap:3px}.inventoryTexture{inset:4px}.inventoryCount{font-size:12px}}
`;
    document.head.appendChild(style);
    screen.addEventListener("pointerdown", event => { if (event.target === screen) closeInventory(); });
    document.getElementById("inventoryClose").addEventListener("click", closeInventory);
}

function renderInventory() {
    const grid = document.getElementById("inventoryGrid");
    if (!grid) return;
    grid.innerHTML = "";
    inventory.forEach((slot, index) => {
        const cell = document.createElement("div");
        cell.className = "inventorySlot";
        cell.draggable = !!slot;
        if (slot) {
            const item = getItem(slot.itemId);
            if (item) cell.innerHTML = `<span class="inventoryTexture" style="background-image:url('${textureUrl(item.texture)}')"></span><span class="inventoryCount">${slot.count}</span>${index < HOTBAR_SIZE ? `<span class="inventoryNumber">${index + 1}</span>` : ""}`;
        } else if (index < HOTBAR_SIZE) cell.innerHTML = `<span class="inventoryNumber">${index + 1}</span>`;
        cell.title = slot ? `${getItem(slot.itemId)?.name || "Item"} (${slot.count})` : "Empty slot";
        cell.addEventListener("dragstart", event => { draggedSlot = index; cell.classList.add("dragging"); event.dataTransfer.effectAllowed = "move"; });
        cell.addEventListener("dragend", () => { draggedSlot = null; cell.classList.remove("dragging"); });
        cell.addEventListener("dragover", event => event.preventDefault());
        cell.addEventListener("drop", event => {
            event.preventDefault();
            if (draggedSlot === null || draggedSlot === index) return;
            const temp = inventory[index]; inventory[index] = inventory[draggedSlot]; inventory[draggedSlot] = temp;
            draggedSlot = null; saveInventory(); renderInventory();
        });
        grid.appendChild(cell);
    });
    syncHotbar();
}

function syncHotbar() {
    document.querySelectorAll("#hotbar .slot").forEach((slotEl, index) => {
        const slot = inventory[index];
        let countEl = slotEl.querySelector(".hotbarCount");
        if (!countEl) { countEl = document.createElement("span"); countEl.className = "hotbarCount"; slotEl.appendChild(countEl); }
        countEl.textContent = slot?.count > 1 ? slot.count : "";
        if (slot) slotEl.title = `${getItem(slot.itemId)?.name || "Item"} (${slot.count})`;
    });
}

export function getSelectedItemId(slotIndex) { return inventory[slotIndex]?.itemId ?? null; }
export function consumeSelected(slotIndex) { return removeItem(slotIndex, 1); }
export function giveBrokenBlock(itemId) { return addItem(itemId, 1); }

export function setupInventory() {
    loadInventory();
    createInventoryUI();
    renderInventory();
    document.addEventListener("keydown", event => {
        if (event.key.toLowerCase() === "e" && !event.repeat && document.body.classList.contains("webminecraft-in-world")) {
            event.preventDefault();
            inventoryOpen ? closeInventory() : openInventory();
        }
        if (event.key === "Escape" && inventoryOpen) closeInventory();
    });
}

function openInventory() {
    inventoryOpen = true;
    document.getElementById("inventoryScreen")?.classList.add("open");
    document.exitPointerLock?.();
    renderInventory();
}
function closeInventory() {
    inventoryOpen = false;
    document.getElementById("inventoryScreen")?.classList.remove("open");
}
