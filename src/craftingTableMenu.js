import { getInventoryItem } from "./inventory.js";

const INVENTORY_SIZE = 36;
const HOTBAR_SIZE = 9;
const MAX_STACK = 64;
const PLANK_IDS = new Set([13, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
const LOG_IDS = new Set([5, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167]);

let root = null;
let open = false;
let inventory = Array.from({ length: INVENTORY_SIZE }, () => null);
let craftGrid = Array.from({ length: 9 }, () => null);
let craftOutput = null;
let dragged = null;
let suppressClick = false;

function textureUrl(name) {
    return name ? `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}` : "";
}
function itemDef(id) {
    return getInventoryItem(id) || null;
}
function cloneSlot(slot) {
    return slot ? {
        itemId: Number(slot.itemId),
        count: Number(slot.count),
        texture: slot.texture || itemDef(slot.itemId)?.texture || null
    } : null;
}
function sameItem(a, b) {
    return !!a && !!b && Number(a.itemId) === Number(b.itemId);
}
function normalizeSlot(slot) {
    if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
    const item = itemDef(slot.itemId);
    if (!item) return null;
    return {
        itemId: Math.floor(Number(slot.itemId)),
        count: Math.max(1, Math.min(MAX_STACK, Math.floor(Number(slot.count)))),
        texture: slot.texture || item.texture || null
    };
}
function loadInventory() {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        inventory = Array.isArray(saved) && saved.length === INVENTORY_SIZE
            ? saved.map(normalizeSlot)
            : Array.from({ length: INVENTORY_SIZE }, () => null);
    } catch {
        inventory = Array.from({ length: INVENTORY_SIZE }, () => null);
    }
}
function saveInventory() {
    inventory = inventory.map(normalizeSlot);
    try { localStorage.setItem("webminecraft_inventory", JSON.stringify(inventory)); } catch {}
    window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
}
function insertStack(stack) {
    if (!stack) return null;
    const item = itemDef(stack.itemId);
    if (!item) return cloneSlot(stack);
    let left = Number(stack.count) || 0;
    for (let i = 0; i < inventory.length && left > 0; i++) {
        const target = inventory[i];
        if (!sameItem(target, stack) || target.count >= MAX_STACK) continue;
        const add = Math.min(left, MAX_STACK - target.count);
        target.count += add;
        left -= add;
    }
    for (let i = 0; i < inventory.length && left > 0; i++) {
        if (inventory[i]) continue;
        const add = Math.min(left, MAX_STACK);
        inventory[i] = { itemId: Number(stack.itemId), count: add, texture: stack.texture || item.texture || null };
        left -= add;
    }
    return left > 0 ? { ...cloneSlot(stack), count: left } : null;
}
function itemVisual(slot, craft = false) {
    if (!slot?.itemId) return "";
    const item = itemDef(slot.itemId);
    if (!item) return "";
    const texture = slot.texture || item.texture;
    if (!texture) return "";
    return `<img class="ctm-item${craft ? " ctm-craft-item" : ""}" src="${textureUrl(texture)}" alt="" draggable="false">`;
}
function slotCount(slot) {
    return slot?.count > 1 ? `<b>${slot.count}</b>` : "";
}
function renderSlot(index, type = "inventory") {
    const slot = type === "inventory" ? inventory[index] : craftGrid[index];
    const button = document.createElement("button");
    button.type = "button";
    button.className = type === "inventory" ? "ctm-slot" : "ctm-slot ctm-craft-slot";
    button.draggable = !!slot && !document.body.classList.contains("mobile-mode");
    button.innerHTML = itemVisual(slot, type !== "inventory") + slotCount(slot);
    button.title = slot ? (itemDef(slot.itemId)?.name || "Item") + ` (${slot.count})` : "Empty slot";

    if (document.body.classList.contains("mobile-mode")) {
        button.addEventListener("pointerdown", event => {
            if (event.button === 2) {
                event.preventDefault();
                if (!dragged) takeHalf(type, index);
                else placeOne(type, index);
            } else {
                event.preventDefault();
                pickupStack(type, index);
            }
            render();
        });
    } else if (slot) {
        button.addEventListener("dragstart", event => {
            dragged = { type, index };
            suppressClick = true;
            button.classList.add("dragging");
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", `crafting-table:${type}:${index}`);
        });
        button.addEventListener("dragend", () => {
            dragged = null;
            button.classList.remove("dragging");
            suppressClick = true;
        });
        button.addEventListener("pointerdown", event => {
            if (event.button !== 2) return;
            event.preventDefault();
            event.stopPropagation();
            if (!dragged) takeHalf(type, index);
            else placeOne(type, index);
            render();
        });
    } else if (type === "inventory") {
        button.addEventListener("pointerdown", event => {
            if (event.button !== 2 || !dragged) return;
            event.preventDefault();
            event.stopPropagation();
            placeOne(type, index);
            render();
        });
    }

    button.addEventListener("click", event => {
        if (suppressClick) {
            suppressClick = false;
            event.preventDefault();
            event.stopPropagation();
        }
    });
    button.addEventListener("dragover", event => {
        if (!document.body.classList.contains("mobile-mode")) event.preventDefault();
    });
    button.addEventListener("drop", event => {
        if (document.body.classList.contains("mobile-mode")) return;
        event.preventDefault();
        event.stopPropagation();
        if (!dragged) return;
        dropInto(type, index);
        dragged = null;
        suppressClick = true;
        render();
    });
    button.addEventListener("contextmenu", event => event.preventDefault());
    return button;
}
function getSlot(type, index) {
    return type === "inventory" ? inventory[index] : craftGrid[index];
}
function setSlot(type, index, value) {
    if (type === "inventory") inventory[index] = value;
    else craftGrid[index] = value;
}
function pickupStack(type, index) {
    const slot = getSlot(type, index);
    if (!slot || dragged) return;
    dragged = { type: "cursor", slot: cloneSlot(slot) };
    setSlot(type, index, null);
}
function takeHalf(type, index) {
    const slot = getSlot(type, index);
    if (!slot || dragged) return;
    const amount = Math.ceil(slot.count / 2);
    dragged = { type: "cursor", slot: { ...cloneSlot(slot), count: amount } };
    slot.count -= amount;
    if (slot.count <= 0) setSlot(type, index, null);
}
function placeOne(type, index) {
    if (!dragged?.slot) return;
    const target = getSlot(type, index);
    if (!target) {
        setSlot(type, index, { ...cloneSlot(dragged.slot), count: 1 });
        dragged.slot.count--;
    } else if (sameItem(target, dragged.slot) && target.count < MAX_STACK) {
        target.count++;
        dragged.slot.count--;
    }
    if (dragged.slot.count <= 0) dragged = null;
}
function dropInto(type, index) {
    if (!dragged) return;
    const target = getSlot(type, index);
    if (dragged.type === "inventory" && type === "inventory") {
        if (dragged.index === index) return;
        [inventory[index], inventory[dragged.index]] = [inventory[dragged.index], inventory[index]];
        return;
    }
    if (dragged.type === "craft" && type === "craft") {
        if (dragged.index === index) return;
        [craftGrid[index], craftGrid[dragged.index]] = [craftGrid[dragged.index], craftGrid[index]];
        return;
    }
    if (dragged.type === "inventory" && type === "craft") {
        [craftGrid[index], inventory[dragged.index]] = [inventory[dragged.index], craftGrid[index]];
        return;
    }
    if (dragged.type === "craft" && type === "inventory") {
        [inventory[index], craftGrid[dragged.index]] = [craftGrid[dragged.index], inventory[index]];
    }
    updateCraftResult();
    saveInventory();
}
function updateCraftResult() {
    craftOutput = null;
    const entries = craftGrid.map((slot, index) => ({ slot, index })).filter(x => x.slot);
    if (entries.length === 1 && LOG_IDS.has(Number(entries[0].slot.itemId))) {
        craftOutput = {
            itemId: 13,
            count: 4,
            texture: itemDef(13)?.texture || null,
            recipe: [{ index: entries[0].index, amount: 1 }]
        };
        return;
    }
    let totalPlanks = 0;
    const recipe = [];
    for (const entry of entries) {
        if (!PLANK_IDS.has(Number(entry.slot.itemId))) continue;
        const needed = Math.min(entry.slot.count, 4 - totalPlanks);
        if (needed <= 0) break;
        totalPlanks += needed;
        recipe.push({ index: entry.index, amount: needed });
        if (totalPlanks >= 4) break;
    }
    if (totalPlanks >= 4) {
        craftOutput = {
            itemId: 168,
            count: 1,
            texture: itemDef(168)?.texture || null,
            recipe
        };
    }
}
function takeOutput() {
    updateCraftResult();
    if (!craftOutput) return;
    const leftover = insertStack(craftOutput);
    if (leftover) return;
    for (const ingredient of craftOutput.recipe) {
        const slot = craftGrid[ingredient.index];
        if (!slot) continue;
        slot.count -= ingredient.amount;
        if (slot.count <= 0) craftGrid[ingredient.index] = null;
    }
    saveInventory();
    render();
}
function render() {
    if (!root) return;
    updateCraftResult();
    const grid = root.querySelector("#ctm-craft-grid");
    const inventoryGrid = root.querySelector("#ctm-storage");
    const hotbarGrid = root.querySelector("#ctm-hotbar");
    const output = root.querySelector("#ctm-output");
    if (!grid || !inventoryGrid || !hotbarGrid || !output) return;
    grid.innerHTML = "";
    inventoryGrid.innerHTML = "";
    hotbarGrid.innerHTML = "";
    for (let i = 0; i < 9; i++) grid.appendChild(renderSlot(i, "craft"));
    for (let i = HOTBAR_SIZE; i < INVENTORY_SIZE; i++) inventoryGrid.appendChild(renderSlot(i, "inventory"));
    for (let i = 0; i < HOTBAR_SIZE; i++) hotbarGrid.appendChild(renderSlot(i, "inventory"));
    output.innerHTML = craftOutput ? itemVisual(craftOutput, true) + slotCount(craftOutput) : "";
    output.classList.toggle("ready", !!craftOutput);
    output.onclick = event => { event.preventDefault(); event.stopPropagation(); takeOutput(); };
    output.oncontextmenu = event => event.preventDefault();
    renderCursor();
}
function renderCursor() {
    const cursor = root?.querySelector("#ctm-cursor");
    if (!cursor) return;
    cursor.innerHTML = dragged?.slot ? itemVisual(dragged.slot, true) + slotCount(dragged.slot) : "";
    cursor.classList.toggle("visible", !!dragged?.slot);
}
function closeMenu() {
    if (!open) return;
    if (dragged?.slot) {
        const leftover = insertStack(dragged.slot);
        if (leftover) return;
        dragged = null;
    }
    for (let i = 0; i < craftGrid.length; i++) {
        if (!craftGrid[i]) continue;
        const leftover = insertStack(craftGrid[i]);
        if (leftover) return;
        craftGrid[i] = null;
    }
    saveInventory();
    open = false;
    root.classList.remove("open");
    document.body.classList.remove("crafting-table-open");
    renderCursor();
    if (!document.body.classList.contains("mobile-mode") && document.body.classList.contains("webminecraft-in-world") && !window.__webminecraftHasOpenMenu?.()) {
        setTimeout(() => document.body.requestPointerLock?.(), 0);
    }
}
export function openCraftingTableMenu() {
    if (!document.body.classList.contains("webminecraft-in-world")) return false;
    if (!root) createUI();
    loadInventory();
    craftGrid = Array.from({ length: 9 }, () => null);
    dragged = null;
    render();
    root.classList.add("open");
    document.body.classList.add("crafting-table-open");
    open = true;
    document.exitPointerLock?.();
    return true;
}
function createUI() {
    root = document.createElement("div");
    root.id = "craftingTableScreen";
    root.innerHTML = `
      <div id="ctm-panel">
        <header id="ctm-header"><span>Crafting Table</span><button id="ctm-close" type="button" aria-label="Close">×</button></header>
        <section id="ctm-top">
          <div id="ctm-craft-box">
            <div class="ctm-title">Crafting</div>
            <div class="ctm-craft-row">
              <div id="ctm-craft-grid"></div>
              <span class="ctm-arrow">→</span>
              <button id="ctm-output" type="button" aria-label="Crafting output"></button>
            </div>
            <button id="ctm-recipe-book" type="button">Recipe Book</button>
          </div>
          <div id="ctm-help">
            <div class="ctm-title">Crafting Table</div>
            <p>Use the 3×3 grid for expanded recipes.</p>
            <p>Four planks craft a Crafting Table.</p>
            <p>One log crafts four Oak Planks.</p>
          </div>
        </section>
        <section id="ctm-storage-section"><div class="ctm-title">Inventory</div><div id="ctm-storage"></div></section>
        <section id="ctm-hotbar-section"><div class="ctm-title">Hotbar</div><div id="ctm-hotbar"></div></section>
        <div id="ctm-actions"><span>Desktop: drag to move stacks · Right click takes half / places one.</span><button id="ctm-delete" type="button">Delete held</button></div>
      </div>`;
    document.body.appendChild(root);
    const style = document.createElement("style");
    style.id = "craftingTableMenuStyles";
    style.textContent = `
#craftingTableScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.48);z-index:1000001;font-family:Arial,sans-serif;color:#404040;image-rendering:pixelated;touch-action:none}
#craftingTableScreen.open{display:flex}
#ctm-panel{width:min(680px,84vw);height:min(960px,92vh);aspect-ratio:.71;box-sizing:border-box;padding:10px;background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;box-shadow:8px 8px 0 rgba(0,0,0,.28);display:flex;flex-direction:column;gap:10px;overflow:auto}
#ctm-header{display:flex;align-items:center;justify-content:space-between;font-size:19px;font-weight:800;color:#404040;min-height:28px;text-shadow:1px 1px rgba(255,255,255,.55)}
#ctm-close{width:30px;height:28px;background:#C6C6C6;color:#404040;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;font-size:20px;line-height:20px;cursor:pointer;padding:0;box-shadow:inset -2px -2px #555}
#ctm-top{display:grid;grid-template-columns:1.08fr .92fr;gap:10px;min-height:265px}
#ctm-craft-box,#ctm-help,#ctm-storage-section,#ctm-hotbar-section{background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;padding:8px;box-sizing:border-box}
#ctm-craft-box{display:flex;flex-direction:column;align-items:center;justify-content:center}
#ctm-help{font-size:11px;color:#404040}
#ctm-help p{margin:8px 2px;line-height:1.45}
.ctm-title{font-size:13px;font-weight:800;margin-bottom:6px;color:#404040;text-shadow:1px 1px rgba(255,255,255,.45)}
.ctm-craft-row{display:flex;align-items:center;justify-content:center;gap:10px}
.ctm-arrow{font-size:28px;color:#555;text-shadow:1px 1px #FFFFFF}
#ctm-craft-grid{display:grid;grid-template-columns:repeat(3,42px);gap:4px}
.ctm-slot{position:relative;width:42px;height:42px;background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF;color:#FFFFFF;padding:0;cursor:pointer;overflow:hidden;contain:layout paint;isolation:isolate}
.ctm-craft-slot{width:42px;height:42px}
.ctm-slot.dragging{opacity:.45}
.ctm-item{position:relative;width:30px;height:30px;max-width:30px;max-height:30px;display:block;margin:auto;object-fit:contain;object-position:center;image-rendering:pixelated;pointer-events:none}
.ctm-craft-item{width:30px;height:30px;max-width:30px;max-height:30px;object-fit:contain}
.ctm-slot b,#ctm-output b{position:absolute;right:2px;bottom:0;color:#FFFFFF;font-size:12px;text-shadow:1px 1px #3F3F3F;z-index:2;pointer-events:none}
#ctm-output{position:relative;width:50px;height:50px;background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF;padding:0;cursor:pointer;overflow:hidden;contain:layout paint;isolation:isolate}
#ctm-output.ready{outline:3px solid #FFFFFF;outline-offset:-3px}
#ctm-output .ctm-item{width:34px;height:34px;max-width:34px;max-height:34px}
#ctm-recipe-book{margin-top:10px;background:#8B8B8B;color:#404040;border:2px solid #373737;border-top-color:#FFFFFF;border-left-color:#FFFFFF;padding:5px 10px;cursor:pointer;font-weight:800;font-size:11px;box-shadow:inset -1px -1px #555}
#ctm-recipe-book.active{background:#FFFFFF}
#ctm-storage,#ctm-hotbar{display:grid;grid-template-columns:repeat(9,minmax(38px,1fr));gap:4px}
#ctm-hotbar-section{min-height:70px}
#ctm-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:#404040}
#ctm-delete{border:2px solid #373737;border-top-color:#FFFFFF;border-left-color:#FFFFFF;background:#8B8B8B;color:#404040;padding:5px 9px;cursor:pointer;font-weight:700;box-shadow:inset -1px -1px #555}
#ctm-cursor{display:none;position:fixed;width:54px;height:54px;z-index:2147483647;pointer-events:none;background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF}
#ctm-cursor.visible{display:block}
body.crafting-table-open #hotbar.textured-hotbar{display:none!important}
body.crafting-table-open #inventoryButton{pointer-events:none!important;opacity:.5}
@media(max-width:720px){
#ctm-panel{width:min(430px,92vw);height:min(760px,92vh);aspect-ratio:.71;padding:8px;gap:7px}
#ctm-top{grid-template-columns:1fr;min-height:0;gap:7px}
#ctm-help{display:none}
#ctm-craft-grid{grid-template-columns:repeat(3,36px);gap:3px}
.ctm-slot,.ctm-craft-slot{width:36px;height:36px}
#ctm-output{width:46px;height:46px}
#ctm-storage,#ctm-hotbar{grid-template-columns:repeat(9,minmax(28px,1fr));gap:3px}
}
`;
    document.head.appendChild(style);
    root.querySelector("#ctm-close").addEventListener("click", closeMenu);
    root.querySelector("#ctm-delete").addEventListener("click", () => {
        dragged = null;
        renderCursor();
    });
    root.addEventListener("pointerdown", event => {
        if (event.target === root) event.preventDefault();
    });
    root.addEventListener("contextmenu", event => event.preventDefault());
    document.addEventListener("keydown", event => {
        if (!open) return;
        if (event.code === "Escape" || event.code === "KeyE") {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeMenu();
        }
        if (event.code === "Delete" && dragged?.slot) {
            event.preventDefault();
            dragged = null;
            renderCursor();
        }
    }, true);
    document.addEventListener("pointermove", event => {
        if (!open || !dragged?.slot) return;
        const cursor = root.querySelector("#ctm-cursor");
        if (!cursor) return;
        cursor.style.left = `${event.clientX + 12}px`;
        cursor.style.top = `${event.clientY + 12}px`;
    });
    document.addEventListener("click", event => {
        if (!open) return;
        if (suppressClick) {
            suppressClick = false;
            return;
        }
    }, true);
}

export function setupCraftingTableMenu() {
    if (root) return;
    createUI();
}