import * as THREE from "three";
import { isSurvivalWorld } from "./survivalMode.js";
import { getInventoryItem } from "./inventory.js";
import { createAvatar } from "./multiplayerAvatars.js";

const ITEM_DEFS = [
    { id: 1, name: "Grass Block", texture: "grass_block_side.png" },
    { id: 2, name: "Dirt", texture: "dirt.png" },
    { id: 3, name: "Stone", texture: "stone.png" },
    { id: 4, name: "Sand", texture: "sand.png" },
    { id: 5, name: "Oak Log", texture: "oak_log_top.png" },
    { id: 6, name: "Oak Leaves", texture: "oak-leaves-normal-original-default.png" },
    { id: 7, name: "Cobblestone", texture: "cobblestone.png" },
    { id: 8, name: "Gravel", texture: "gravel.png" },
    { id: 9, name: "Sandstone", texture: "sandstone.png" },
    { id: 10, name: "Bedrock", texture: "bedrock.png" },
    { id: 11, name: "Coal Ore", texture: "coal_ore.png" },
    { id: 12, name: "Iron Ore", texture: "iron_ore.png" },
    { id: 13, name: "Oak Planks", texture: "oak_planks.png" },
    { id: 14, name: "Snow", texture: "snow.png" },
    { id: 15, name: "TNT", texture: "tnt_side.png" },
    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png" },
    { id: 17, name: "Oak Door", texture: "oak_door_bottom.png" },
    { id: 18, name: "Bricks", texture: "bricks.png" },
    { id: 19, name: "Stone Bricks", texture: "stone_bricks.png" },
    { id: 20, name: "Cracked Stone Bricks", texture: "cracked_stone_bricks.png" },
    { id: 21, name: "Mossy Stone Bricks", texture: "mossy_stone_bricks.png" },
    { id: 22, name: "Dirt Path", texture: "dirt_path_top.png" },
    { id: 23, name: "Acacia Planks", texture: "acacia_planks.png" },
    { id: 24, name: "Bamboo Planks", texture: "bamboo_planks.png" },
    { id: 25, name: "Birch Planks", texture: "birch_planks.png" },
    { id: 26, name: "Crimson Planks", texture: "crimson_planks.png" },
    { id: 27, name: "Dark Oak Planks", texture: "dark_oak_planks.png" },
    { id: 28, name: "Jungle Planks", texture: "jungle_planks.png" },
    { id: 29, name: "Mangrove Planks", texture: "mangrove_planks.png" },
    { id: 30, name: "Spruce Planks", texture: "spruce_planks.png" },
    { id: 31, name: "Warped Planks", texture: "warped_planks.png" },
    { id: 32, name: "Blast Furnace", texture: "blast_furnace_front.png" },
    { id: 33, name: "Chiseled Deepslate", texture: "chiseled_deepslate.png" },
    { id: 34, name: "Cobbled Deepslate", texture: "cobbled_deepslate.png" },
    { id: 35, name: "Cracked Deepslate Bricks", texture: "cracked_deepslate_bricks.png" },
    { id: 36, name: "Cracked Deepslate Tiles", texture: "cracked_deepslate_tiles.png" },
    { id: 37, name: "Deepslate", texture: "deepslate.png" },
    { id: 38, name: "Deepslate Bricks", texture: "deepslate_bricks.png" },
    { id: 39, name: "Deepslate Coal Ore", texture: "deepslate_coal_ore.png" },
    { id: 40, name: "Deepslate Copper Ore", texture: "deepslate_copper_ore.png" },
    { id: 41, name: "Deepslate Diamond Ore", texture: "deepslate_diamond_ore.png" },
    { id: 42, name: "Deepslate Emerald Ore", texture: "deepslate_emerald_ore.png" },
    { id: 43, name: "Deepslate Gold Ore", texture: "deepslate_gold_ore.png" },
    { id: 44, name: "Deepslate Iron Ore", texture: "deepslate_iron_ore.png" },
    { id: 45, name: "Deepslate Lapis Ore", texture: "deepslate_lapis_ore.png" },
    { id: 46, name: "Deepslate Redstone Ore", texture: "deepslate_redstone_ore.png" },
    { id: 47, name: "Deepslate Tiles", texture: "deepslate_tiles.png" },
    { id: 48, name: "Polished Deepslate", texture: "polished_deepslate.png" },
    { id: 49, name: "Reinforced Deepslate", texture: "reinforced_deepslate_top.png" },
    { id: 50, name: "Furnace", texture: "furnace_front.png" },
    { id: 51, name: "Stone Slab", texture: "stone.png" },
    { id: 52, name: "Cobblestone Slab", texture: "cobblestone.png" },
    { id: 53, name: "Stone Bricks Slab", texture: "stone_bricks.png" },
    { id: 54, name: "Cracked Stone Bricks Slab", texture: "cracked_stone_bricks.png" },
    { id: 55, name: "Mossy Stone Bricks Slab", texture: "mossy_stone_bricks.png" },
    { id: 56, name: "Oak Planks Slab", texture: "oak_planks.png" },
    { id: 57, name: "Acacia Planks Slab", texture: "acacia_planks.png" },
    { id: 58, name: "Bamboo Planks Slab", texture: "bamboo_planks.png" },
    { id: 59, name: "Birch Planks Slab", texture: "birch_planks.png" },
    { id: 60, name: "Crimson Planks Slab", texture: "crimson_planks.png" },
    { id: 61, name: "Dark Oak Planks Slab", texture: "dark_oak_planks.png" },
    { id: 62, name: "Jungle Planks Slab", texture: "jungle_planks.png" },
    { id: 63, name: "Mangrove Planks Slab", texture: "mangrove_planks.png" },
    { id: 64, name: "Spruce Planks Slab", texture: "spruce_planks.png" },
    { id: 65, name: "Warped Planks Slab", texture: "warped_planks.png" },
    { id: 66, name: "Chiseled Deepslate Slab", texture: "chiseled_deepslate.png" },
    { id: 67, name: "Cobbled Deepslate Slab", texture: "cobbled_deepslate.png" },
    { id: 68, name: "Cracked Deepslate Bricks Slab", texture: "cracked_deepslate_bricks.png" },
    { id: 69, name: "Cracked Deepslate Tiles Slab", texture: "cracked_deepslate_tiles.png" },
    { id: 70, name: "Deepslate Slab", texture: "deepslate.png" },
    { id: 71, name: "Deepslate Bricks Slab", texture: "deepslate_bricks.png" },
    { id: 72, name: "Deepslate Tiles Slab", texture: "deepslate_tiles.png" },
    { id: 73, name: "Polished Deepslate Slab", texture: "polished_deepslate.png" },
    { id: 74, name: "Reinforced Deepslate Slab", texture: "reinforced_deepslate_top.png" },
    { id: 75, name: "Oak Planks Stairs", texture: "oak_planks.png" },
    { id: 76, name: "Acacia Planks Stairs", texture: "acacia_planks.png" },
    { id: 77, name: "Bamboo Planks Stairs", texture: "bamboo_planks.png" },
    { id: 78, name: "Birch Planks Stairs", texture: "birch_planks.png" },
    { id: 79, name: "Crimson Planks Stairs", texture: "crimson_planks.png" },
    { id: 80, name: "Dark Oak Planks Stairs", texture: "dark_oak_planks.png" },
    { id: 81, name: "Jungle Planks Stairs", texture: "jungle_planks.png" },
    { id: 82, name: "Mangrove Planks Stairs", texture: "mangrove_planks.png" },
    { id: 83, name: "Spruce Planks Stairs", texture: "spruce_planks.png" },
    { id: 84, name: "Warped Planks Stairs", texture: "warped_planks.png" }
];

const INVENTORY_SIZE = 36;
const HOTBAR_SIZE = 9;
const MAX_STACK = 64;

let root = null;
let previewRenderer = null;
let previewScene = null;
let previewCamera = null;
let previewModel = null;
let previewFrame = 0;
let open = false;
let data = [];
let selectedHotbar = 0;
let cursorStack = null;
let craftData = Array.from({ length: 4 }, () => null);
let craftOutput = null;
let cursorElement = null;
let equipment = Array.from({ length: 5 }, () => null);
const EQUIPMENT_SIZE = 5;

function isInWorld() { return document.body.classList.contains("webminecraft-in-world"); }
function textureUrl(name) { return name ? `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}` : ""; }
function itemDef(id) { return getInventoryItem(id) || ITEM_DEFS.find(item => item.id === Number(id)) || null; }

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
function cloneSlot(slot) { return slot ? { itemId: slot.itemId, count: slot.count, texture: slot.texture || itemDef(slot.itemId)?.texture || null } : null; }
function sameItem(a, b) { return !!a && !!b && Number(a.itemId) === Number(b.itemId); }

function maxStackForItem(itemId) {
    const item = itemDef(itemId);
    const name = String(item?.name || "").toLowerCase();
    if (/helmet|chestplate|leggings|boots|sword|pickaxe|axe|shovel|hoe|bow|crossbow|trident|elytra|shield|flint and steel|fishing rod|shears/.test(name)) return 1;
    if (/snowball|ender pearl|sign|firework|arrow/.test(name)) return 16;
    return MAX_STACK;
}
function normalizeEquipmentSlot(slot, index) {
    if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
    const item = itemDef(slot.itemId);
    if (!item) return null;
    const name = String(item.name || "").toLowerCase();
    let allowed = false;
    if (index === 0) allowed = /helmet|skull|head/.test(name);
    if (index === 1) allowed = /chestplate|elytra/.test(name);
    if (index === 2) allowed = /leggings/.test(name);
    if (index === 3) allowed = /boots/.test(name);
    if (index === 4) allowed = /shield|arrow|firework|totem|map/.test(name);
    if (!allowed) return null;
    return { itemId: Math.floor(Number(slot.itemId)), count: Math.max(1, Math.min(maxStackForItem(slot.itemId), Math.floor(Number(slot.count)))), texture: slot.texture || item.texture || null };
}
function loadEquipment() {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_survival_equipment") || "[]");
        equipment = Array.from({ length: EQUIPMENT_SIZE }, (_, index) => normalizeEquipmentSlot(Array.isArray(saved) ? saved[index] : null, index));
    } catch {
        equipment = Array.from({ length: EQUIPMENT_SIZE }, () => null);
    }
}
function saveEquipment() {
    equipment = equipment.map((slot, index) => normalizeEquipmentSlot(slot, index));
    try { localStorage.setItem("webminecraft_survival_equipment", JSON.stringify(equipment)); } catch {}
    window.dispatchEvent(new CustomEvent("webminecraft:equipmentchanged"));
}
function equipmentSlotButton(index, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "svi-equipment-slot";
    button.dataset.equipmentIndex = String(index);
    button.title = equipment[index] ? `${itemDef(equipment[index].itemId)?.name || label} (${equipment[index].count})` : label;
    button.setAttribute("aria-label", button.title);
    button.innerHTML = itemHtml(equipment[index]) || `<span class="svi-equipment-glyph">${["⛑","▣","▥","◈","◫"][index]}</span>`;
    button.addEventListener("pointerdown", event => {
        if (!open) return;
        event.preventDefault();
        event.stopPropagation();
        handleEquipmentSlot(index, event.button === 2 ? 2 : 0);
    });
    button.addEventListener("contextmenu", event => event.preventDefault());
    return button;
}
function handleEquipmentSlot(index, button = 0) {
    const target = equipment[index];
    if (cursorStack) {
        const accepted = normalizeEquipmentSlot(cursorStack, index);
        if (!accepted) return;
        if (button === 2) {
            if (target) return;
            equipment[index] = { ...accepted, count: 1 };
            cursorStack.count--;
            if (cursorStack.count <= 0) cursorStack = null;
        } else {
            equipment[index] = accepted;
            cursorStack = target ? cloneSlot(target) : null;
        }
    } else if (target) {
        if (button === 2) {
            cursorStack = { ...cloneSlot(target), count: 1 };
            target.count--;
            if (target.count <= 0) equipment[index] = null;
        } else {
            cursorStack = cloneSlot(target);
            equipment[index] = null;
        }
    }
    saveEquipment();
    renderSlots();
}

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        data = Array.isArray(saved) && saved.length === INVENTORY_SIZE
            ? saved.map(normalizeSlot)
            : Array.from({ length: INVENTORY_SIZE }, () => null);
    } catch {
        data = Array.from({ length: INVENTORY_SIZE }, () => null);
    }
}
function saveData() {
    data = data.map(normalizeSlot);
    try { localStorage.setItem("webminecraft_inventory", JSON.stringify(data)); } catch {}
    window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
}
function insertStack(stack, start = 0, end = INVENTORY_SIZE) {
    let left = stack?.count || 0;
    if (!left) return null;
    const item = itemDef(stack.itemId);
    if (!item) return stack;
    for (let i = start; i < end && left > 0; i++) {
        const target = data[i];
        if (!target || !sameItem(target, stack) || target.count >= MAX_STACK) continue;
        const add = Math.min(left, MAX_STACK - target.count);
        target.count += add;
        left -= add;
    }
    for (let i = start; i < end && left > 0; i++) {
        if (data[i]) continue;
        const add = Math.min(left, MAX_STACK);
        data[i] = { itemId: Number(stack.itemId), count: add, texture: stack.texture || item.texture || null };
        left -= add;
    }
    return left > 0 ? { ...cloneSlot(stack), count: left } : null;
}
function depositCraftAndCursor() {
    let changed = false;
    for (let i = 0; i < craftData.length; i++) {
        if (!craftData[i]) continue;
        const leftover = insertStack(craftData[i]);
        if (!leftover) {
            craftData[i] = null;
            changed = true;
        } else if (leftover.count !== craftData[i].count) {
            craftData[i] = leftover;
            changed = true;
        }
    }
    if (cursorStack) {
        const leftover = insertStack(cursorStack);
        if (!leftover) {
            cursorStack = null;
            changed = true;
        } else if (leftover.count !== cursorStack.count) {
            cursorStack = leftover;
            changed = true;
        }
    }
    if (changed) saveData();
    return !cursorStack && craftData.every(slot => !slot);
}

function itemHtml(slot) {
    if (!slot?.itemId) return "";
    const item = itemDef(slot.itemId);
    if (!item) return "";
    const texture = slot.texture || item.texture;
    const id = Number(slot.itemId);
    const slabClass = id >= 51 && id <= 74 ? " slab-item" : "";
    const stairClass = id >= 75 && id <= 84 ? " stair-item" : "";
    let visual = "";
    if (texture) {
        visual = stairClass
            ? `<span class="svi-item${stairClass}" style="--stair-texture:url('${textureUrl(texture)}')" aria-hidden="true"></span>`
            : `<img class="svi-item${slabClass}" src="${textureUrl(texture)}" alt="" draggable="false">`;
    } else {
        visual = `<span class="svi-item svi-color${slabClass}${stairClass}" style="--c:#777"></span>`;
    }
    return `${visual}${slot.count > 1 ? `<b>${slot.count}</b>` : ""}`;
}

function renderCursor() {
    if (!cursorElement) return;
    cursorElement.innerHTML = cursorStack ? itemHtml(cursorStack) : "";
    cursorElement.classList.toggle("visible", !!cursorStack);
}
function updateCursorPosition(x, y) {
    if (!cursorElement) return;
    cursorElement.style.left = `${x + 12}px`;
    cursorElement.style.top = `${y + 12}px`;
}
function ensureCursorUI() {
    if (cursorElement) return;
    cursorElement = document.createElement("div");
    cursorElement.id = "svi-cursor-stack";
    cursorElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursorElement);
    document.addEventListener("pointermove", event => updateCursorPosition(event.clientX, event.clientY));
    renderCursor();
}

function slotButton(index, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "svi-slot";
    button.dataset.index = String(index);
    button.title = data[index] ? `${itemDef(data[index].itemId)?.name || "Item"} (${data[index].count})` : (label || `Slot ${index + 1}`);
    button.setAttribute("aria-label", button.title);
    button.innerHTML = itemHtml(data[index]);
    button.addEventListener("pointerdown", event => {
        if (!open) return;
        event.preventDefault();
        event.stopPropagation();
        handleInventorySlot(index, event.button === 2 ? 2 : 0, event.shiftKey);
    });
    button.addEventListener("dblclick", event => {
        event.preventDefault();
        event.stopPropagation();
        collectMatching(index);
    });
    button.addEventListener("contextmenu", event => event.preventDefault());
    return button;
}

function renderSlots() {
    if (!root) return;
    const storage = root.querySelector("#svi-storage");
    const hotbar = root.querySelector("#svi-hotbar");
    const armor = root.querySelector("#svi-armor");
    const offhandOld = root.querySelector("#svi-offhand");
    if (!storage || !hotbar || !armor || !offhandOld) return;
    storage.innerHTML = "";
    hotbar.innerHTML = "";
    armor.innerHTML = "";
    for (let i = 0; i < 4; i++) armor.appendChild(equipmentSlotButton(i, ["Helmet","Chestplate","Leggings","Boots"][i]));
    const offhandButton = equipmentSlotButton(4, "Offhand");
    offhandButton.id = "svi-offhand";
    offhandOld.replaceWith(offhandButton);
    for (let i = HOTBAR_SIZE; i < INVENTORY_SIZE; i++) storage.appendChild(slotButton(i, `Inventory slot ${i - HOTBAR_SIZE + 1}`));
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const button = slotButton(i, `Hotbar slot ${i + 1}`);
        if (i === selectedHotbar) button.classList.add("selected");
        hotbar.appendChild(button);
    }
    renderCrafting();
    renderCursor();
}

function syncGameplayInventory() {
    saveData();
}
function selectHotbarSlot(index) {
    if (index < 0 || index >= HOTBAR_SIZE) return;
    selectedHotbar = index;
    const event = new KeyboardEvent("keydown", {
        key: String(selectedHotbar + 1),
        code: `Digit${selectedHotbar + 1}`,
        bubbles: true
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    renderSlots();
}

function quickMove(index) {
    const slot = data[index];
    if (!slot) return false;
    const start = index < HOTBAR_SIZE ? HOTBAR_SIZE : 0;
    const end = index < HOTBAR_SIZE ? INVENTORY_SIZE : HOTBAR_SIZE;
    let moving = cloneSlot(slot);
    const merged = insertStack(moving, start, end);
    if (!merged) {
        data[index] = null;
    } else {
        data[index] = merged;
    }
    saveData();
    return true;
}

function pickUp(index, button) {
    const source = data[index];
    if (button === 2) {
        if (!source) return;
        const amount = Math.ceil(source.count / 2);
        cursorStack = { ...cloneSlot(source), count: amount };
        source.count -= amount;
        if (source.count <= 0) data[index] = null;
        return;
    }
    if (!source) return;
    cursorStack = cloneSlot(source);
    data[index] = null;
}

function placeInto(index, button) {
    const target = data[index];
    if (button === 2) {
        if (!cursorStack || (target && !sameItem(target, cursorStack))) return;
        if (!target) {
            data[index] = { ...cloneSlot(cursorStack), count: 1 };
            cursorStack.count--;
        } else if (target.count < MAX_STACK) {
            target.count++;
            cursorStack.count--;
        }
        if (cursorStack.count <= 0) cursorStack = null;
        return;
    }

    if (!target) {
        data[index] = cloneSlot(cursorStack);
        cursorStack = null;
        return;
    }
    if (sameItem(target, cursorStack)) {
        const add = Math.min(cursorStack.count, MAX_STACK - target.count);
        target.count += add;
        cursorStack.count -= add;
        if (cursorStack.count <= 0) cursorStack = null;
        return;
    }
    data[index] = cloneSlot(cursorStack);
    cursorStack = cloneSlot(target);
}

function handleInventorySlot(index, button = 0, shiftKey = false) {
    if (!open || index < 0 || index >= INVENTORY_SIZE) return;
    if (!cursorStack && shiftKey && button === 0) {
        quickMove(index);
        renderSlots();
        return;
    }
    if (!cursorStack) pickUp(index, button);
    else placeInto(index, button);
    saveData();
    renderSlots();
}

function collectMatching(index) {
    const clicked = data[index];
    if (!cursorStack && !clicked) return;
    if (!cursorStack && clicked) {
        cursorStack = cloneSlot(clicked);
        data[index] = null;
    }
    if (!cursorStack) return;
    for (let i = 0; i < data.length && cursorStack.count < MAX_STACK; i++) {
        if (i === index || !sameItem(data[i], cursorStack)) continue;
        const amount = Math.min(cursorStack.count > 0 ? MAX_STACK - cursorStack.count : 0, data[i].count);
        if (!amount) continue;
        cursorStack.count += amount;
        data[i].count -= amount;
        if (data[i].count <= 0) data[i] = null;
    }
    saveData();
    renderSlots();
}

function renderCraftSlot(index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "svi-craft-slot";
    button.innerHTML = itemHtml(craftData[index]);
    button.title = craftData[index] ? `${itemDef(craftData[index].itemId)?.name || "Item"} (${craftData[index].count})` : "Crafting slot";
    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        handleCraftSlot(index, event.button === 2 ? 2 : 0);
    });
    button.addEventListener("contextmenu", event => event.preventDefault());
    return button;
}
function updateCraftResult() {
    const nonEmpty = craftData.map((slot, index) => ({ slot, index })).filter(entry => entry.slot);
    craftOutput = null;
    if (nonEmpty.length === 1 && nonEmpty[0].slot.itemId === 5) {
        craftOutput = { itemId: 13, count: 4, texture: itemDef(13)?.texture || null, recipe: [{ index: nonEmpty[0].index, amount: 1 }] };
    } else if (craftData.every(slot => slot?.itemId === 13)) {
        craftOutput = { itemId: 168, count: 1, texture: itemDef(168)?.texture || null, recipe: [0,1,2,3].map(index => ({ index, amount: 1 })) };
    }
}
function handleCraftSlot(index, button = 0) {
    const target = craftData[index];
    if (button === 2) {
        if (!cursorStack) {
            if (!target) return;
            const amount = Math.ceil(target.count / 2);
            cursorStack = { ...cloneSlot(target), count: amount };
            target.count -= amount;
            if (target.count <= 0) craftData[index] = null;
        } else if (!target) {
            craftData[index] = { ...cloneSlot(cursorStack), count: 1 };
            cursorStack.count--;
            if (cursorStack.count <= 0) cursorStack = null;
        } else if (sameItem(target, cursorStack) && target.count < MAX_STACK) {
            target.count++;
            cursorStack.count--;
            if (cursorStack.count <= 0) cursorStack = null;
        }
    } else if (!cursorStack) {
        if (!target) return;
        cursorStack = cloneSlot(target);
        craftData[index] = null;
    } else if (!target) {
        craftData[index] = cloneSlot(cursorStack);
        cursorStack = null;
    } else if (sameItem(target, cursorStack)) {
        const add = Math.min(cursorStack.count, MAX_STACK - target.count);
        target.count += add;
        cursorStack.count -= add;
        if (cursorStack.count <= 0) cursorStack = null;
    } else {
        craftData[index] = cloneSlot(cursorStack);
        cursorStack = cloneSlot(target);
    }
    updateCraftResult();
    renderCrafting();
    renderCursor();
}
function takeCraftOutput() {
    updateCraftResult();
    if (!craftOutput) return;
    if (cursorStack && (!sameItem(cursorStack, craftOutput) || cursorStack.count + craftOutput.count > MAX_STACK)) return;
    if (!cursorStack) cursorStack = cloneSlot(craftOutput);
    else cursorStack.count += craftOutput.count;
    for (const ingredient of craftOutput.recipe) {
        const slot = craftData[ingredient.index];
        if (!slot) continue;
        slot.count -= ingredient.amount;
        if (slot.count <= 0) craftData[ingredient.index] = null;
    }
    updateCraftResult();
    renderCrafting();
    renderCursor();
}
function renderCrafting() {
    if (!root) return;
    const craft = root.querySelector("#svi-craft-grid");
    const output = root.querySelector("#svi-craft-output");
    if (!craft || !output) return;
    updateCraftResult();
    craft.innerHTML = "";
    for (let i = 0; i < 4; i++) craft.appendChild(renderCraftSlot(i));
    output.innerHTML = craftOutput ? itemHtml(craftOutput) : "";
    output.title = craftOutput ? `Craft ${itemDef(craftOutput.itemId)?.name || "item"}` : "Crafting output";
    output.classList.toggle("ready", !!craftOutput);
    output.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        takeCraftOutput();
    };
    output.oncontextmenu = event => event.preventDefault();
}

function getSurvivalAvatarIdentity() {
    const seed = (() => {
        try {
            const value = Number(new URLSearchParams(window.location.search).get("seed"));
            return Number.isFinite(value) ? Math.floor(Math.abs(value)) >>> 0 : 0;
        } catch {
            return 0;
        }
    })();
    const playerId = String(
        window.__webminecraftMultiplayerPlayerId
        || window.__webminecraftPlayerId
        || `survival-${seed}`
    );
    const playerName = String(
        window.__webminecraftPlayerName
        || window.__webminecraftUsername
        || window.__webminecraftAccountName
        || "Player"
    ).slice(0, 16);
    return { playerId, playerName };
}

function makePlayerModel() {
    const { playerId, playerName } = getSurvivalAvatarIdentity();
    const avatar = createAvatar(playerId, playerName);
    avatar.group.traverse(object => {
        if (object.isSprite) {
            object.visible = false;
        }
    });
    avatar.group.scale.setScalar(1.25);
    return avatar.group;
}
function startPreview() {
    const canvas = root?.querySelector("#svi-player-preview");
    if (!canvas) return;
    if (!previewRenderer) {
        previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
        previewScene = new THREE.Scene();
        previewScene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.6));
        const light = new THREE.DirectionalLight(0xffffff, 2.2);
        light.position.set(2,5,4);
        previewScene.add(light);
        previewCamera = new THREE.PerspectiveCamera(34, 1, .1, 50);
        previewCamera.position.set(3.2,2.4,4.2);
        previewModel = makePlayerModel();
        previewScene.add(previewModel);
    }
    const rect = canvas.getBoundingClientRect();
    previewRenderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
    previewModel.rotation.y += .008;
    previewRenderer.render(previewScene, previewCamera);
    if (open) previewFrame = requestAnimationFrame(startPreview);
}
function recipeBook() {
    const button = root?.querySelector("#svi-recipe-book");
    const panel = root?.querySelector("#svi-recipe-panel");
    if (!button || !panel) return;
    const shown = !panel.hidden;
    panel.hidden = shown;
    button.classList.toggle("active", !shown);
}
function createUI() {
    root = document.createElement("div");
    root.id = "survivalInventoryScreen";
    root.innerHTML = `
      <div id="svi-panel">
        <header id="svi-header"><span>Inventory</span><button id="svi-close" type="button" aria-label="Close inventory">×</button></header>
        <div id="svi-top">
          <section id="svi-player-box" aria-label="Character and equipment">
            <div id="svi-armor"></div>
            <canvas id="svi-player-preview"></canvas>
            <div id="svi-offhand" title="Offhand"></div>
            <span class="svi-box-label">Character</span>
          </section>
          <section id="svi-crafting">
            <div class="svi-section-title">Crafting</div>
            <div class="svi-craft-row"><div id="svi-craft-grid"></div><span class="svi-arrow">→</span><button id="svi-craft-output" class="svi-craft-output" type="button" aria-label="Crafting output"></button></div>
            <button id="svi-recipe-book" type="button">Recipe Book</button>
            <div id="svi-recipe-panel" hidden>Basic recipes: Oak Log → 4 Oak Planks. Four Oak Planks → Crafting Table.</div>
          </section>
        </div>
        <section id="svi-storage-section"><div class="svi-section-title">Inventory</div><div id="svi-storage"></div></section>
        <section id="svi-hotbar-section"><div class="svi-section-title">Hotbar</div><div id="svi-hotbar"></div></section>
        <div id="svi-actions"><button id="svi-trash" type="button" title="Delete held item">Delete</button><span>Left click moves stacks · Right click takes half / places one · Shift click quick-moves.</span></div>
      </div>`
    document.body.appendChild(root);
    ensureCursorUI();

    const style = document.createElement("style");
    style.id = "survivalInventoryUsableStyles";
    style.textContent = `
#survivalInventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.48);z-index:1000000;font-family:Arial,sans-serif;color:#fff;touch-action:none}
#survivalInventoryScreen.open{display:flex}
#svi-panel{width:min(610px,78vw);height:min(860px,92vh);aspect-ratio:0.71;box-sizing:border-box;padding:10px;background:linear-gradient(#555,#444);border:2px solid #262626;border-top-color:#a8a8a8;border-left-color:#a8a8a8;box-shadow:8px 8px 0 rgba(0,0,0,.28),inset 1px 1px #777;display:flex;flex-direction:column;gap:7px;overflow:auto;border-radius:4px;touch-action:pan-y}
#svi-header{display:flex;align-items:center;justify-content:space-between;font-size:19px;font-weight:800;text-shadow:2px 2px #111;min-height:30px}
#svi-close{width:32px;height:30px;background:#888;color:#fff;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;border-radius:3px;font-size:22px;line-height:22px;cursor:pointer;box-shadow:inset -1px -1px #333}
#svi-top{display:grid;grid-template-columns:1fr 1fr;gap:8px;min-height:205px}
.svi-section-title{font-size:13px;font-weight:800;margin-bottom:5px;text-shadow:1px 1px #111}
.svi-section-title small{color:#aaa;font-size:10px;font-weight:600}
#svi-player-box,#svi-crafting,#svi-storage-section,#svi-hotbar-section{background:#363636;border:2px solid #222;padding:8px;box-sizing:border-box;border-radius:3px;box-shadow:inset 1px 1px rgba(255,255,255,.05)}
#svi-player-box{position:relative;display:grid;grid-template-columns:1fr 58px;grid-template-rows:1fr 40px;min-height:205px}
#svi-player-preview{width:100%;height:100%;min-height:145px;background:radial-gradient(circle,#777 0%,#4a4a4a 70%)}
#svi-armor{display:flex;flex-direction:column;gap:4px;padding-left:6px;align-items:center;justify-content:center}
.svi-armor-slot,.svi-craft-slot,.svi-craft-output,#svi-offhand{border:2px solid #555;border-top-color:#1d1d1d;border-left-color:#1d1d1d;background:#969696;box-shadow:inset -1px -1px #414141;display:grid;place-items:center;font-size:20px;color:#ddd;border-radius:2px}
.svi-armor-slot{width:38px;height:38px}
#svi-offhand{width:40px;height:40px;grid-column:2;grid-row:2;justify-self:center}
#svi-crafting{display:flex;flex-direction:column;align-items:center}
.svi-craft-row{display:flex;align-items:center;justify-content:center;gap:9px;flex:1}
.svi-arrow{font-size:30px;color:#bbb}
.svi-craft-output{width:50px;height:50px;padding:0;cursor:pointer}
.svi-craft-output.ready{outline:2px solid #ddd;filter:brightness(1.08)}
.svi-craft-slot{width:42px;height:42px;padding:0;cursor:pointer}
#svi-craft-grid{display:grid;grid-template-columns:repeat(2,42px);gap:4px}
#svi-recipe-book{margin-top:5px;border:2px solid #315d34;background:#4c8a50;color:#fff;border-radius:4px;padding:5px 9px;cursor:pointer;font-weight:800;font-size:11px}
#svi-recipe-book.active{background:#6cad6c}
#svi-recipe-panel{width:100%;margin-top:5px;padding:6px;background:#2d2d2d;border:1px solid #6a6a6a;color:#ddd;font-size:10px;text-align:center;border-radius:2px}
#svi-storage-section{flex:1;min-height:174px}
#svi-storage,#svi-hotbar{display:grid;grid-template-columns:repeat(9,minmax(28px,1fr));gap:3px}
.svi-slot{position:relative;aspect-ratio:1;background:#989898;border:2px solid #575757;border-top-color:#202020;border-left-color:#202020;box-shadow:inset -1px -1px #3c3c3c;color:#fff;padding:0;cursor:pointer;overflow:hidden;border-radius:2px;touch-action:manipulation;user-select:none;-webkit-user-select:none;max-width:44px;justify-self:center;width:100%}
.svi-slot:hover{filter:brightness(1.12)}
.svi-slot.selected{border:2px solid #fff;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111}
.svi-item{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);object-fit:cover;object-position:center;image-rendering:pixelated;pointer-events:none}
.svi-item.stair-item{width:auto;height:auto;overflow:visible}
.svi-item.stair-item::before,.svi-item.stair-item::after{content:"";position:absolute;display:block;background-image:var(--stair-texture);background-repeat:no-repeat;background-position:center;background-size:100% 100%;image-rendering:pixelated}
.svi-item.stair-item::before{left:0;right:0;bottom:0;height:58%}
.svi-item.stair-item::after{right:0;top:0;width:56%;height:46%}
.svi-item.slab-item{top:44%;bottom:4px;height:auto;object-position:center top;border-top:2px solid rgba(255,255,255,.22);box-shadow:0 -2px 0 rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.1)}
.svi-color{background:var(--c)}
.svi-slot b,.svi-craft-slot b,.svi-craft-output b{position:absolute;right:3px;bottom:1px;font-size:12px;text-shadow:2px 2px #111;pointer-events:none}
#svi-actions{display:flex;align-items:center;gap:10px;font-size:10px;color:#aaa}
#svi-trash{border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#744;color:#fff;padding:6px 10px;cursor:pointer;border-radius:3px;font-weight:700}
#svi-cursor-stack{display:none;position:fixed;width:54px;height:54px;z-index:2147483647;pointer-events:none;background:#989898;border:2px solid #ddd;box-sizing:border-box;border-radius:2px;box-shadow:3px 3px 0 rgba(0,0,0,.3)}
#svi-cursor-stack.visible{display:block}
@media(max-width:720px){
#svi-panel{width:min(430px,92vw);height:min(760px,92vh);aspect-ratio:0.71;padding:8px;gap:6px}
#svi-top{grid-template-columns:1fr;min-height:0;gap:6px}
#svi-player-box{min-height:180px}
#svi-player-preview{min-height:120px}
#svi-storage-section{min-height:0}
#svi-storage,#svi-hotbar{gap:3px}
.svi-slot{min-width:0}
.svi-item{inset:3px;width:calc(100% - 6px);height:calc(100% - 6px)}
#svi-hotbar{grid-template-columns:repeat(9,minmax(26px,40px))}
#svi-actions span{line-height:1.25}
}
`;
    style.textContent += `
/* Bedrock-style Survival inventory skin */
#survivalInventoryScreen{color:#404040;image-rendering:pixelated}
#svi-panel{width:min(680px,84vw);height:min(960px,92vh);aspect-ratio:.71;background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;box-shadow:8px 8px 0 rgba(0,0,0,.28);border-radius:0;gap:10px}
#svi-header{color:#404040;text-shadow:1px 1px rgba(255,255,255,.55)}
#svi-close{width:30px;height:28px;background:#C6C6C6;color:#404040;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;border-radius:0;box-shadow:inset -2px -2px #555}
#svi-top{grid-template-columns:1.08fr .92fr;gap:10px;min-height:265px}
#svi-player-box,#svi-crafting,#svi-storage-section,#svi-hotbar-section{background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;border-radius:0;box-shadow:none}
#svi-player-box{grid-template-columns:48px 1fr;grid-template-rows:1fr 38px;min-height:265px}
#svi-player-preview{background:#C6C6C6}
#svi-armor{gap:5px;padding-right:4px}
.svi-equipment-slot,.svi-craft-slot,.svi-craft-output{border:2px solid #373737;background:#8B8B8B;box-shadow:inset -2px -2px #FFFFFF;border-radius:0;color:#FFFFFF}
.svi-equipment-slot{width:40px;height:40px}
.svi-equipment-glyph{opacity:.65;text-shadow:1px 1px #3F3F3F}
#svi-offhand{width:40px;height:40px}
.svi-craft-output.ready{outline:3px solid #FFFFFF;outline-offset:-3px}
#svi-recipe-book{background:#8B8B8B;color:#404040;border:2px solid #373737;border-top-color:#FFFFFF;border-left-color:#FFFFFF;border-radius:0;box-shadow:inset -1px -1px #555}
#svi-recipe-book.active{background:#FFFFFF}
#svi-recipe-panel{background:#100010;border:1px solid #25015B;color:#FFFFFF;border-radius:0}
#svi-storage,#svi-hotbar{grid-template-columns:repeat(9,minmax(38px,1fr));gap:4px}
.svi-slot{background:#8B8B8B;border:2px solid #373737;border-top-color:#373737;border-left-color:#373737;box-shadow:inset -2px -2px #FFFFFF;border-radius:0}
.svi-slot::after,.svi-equipment-slot::after,.svi-craft-slot::after,.svi-craft-output::after{background:rgba(255,255,255,0)}
.svi-slot:hover::after,.svi-equipment-slot:hover::after,.svi-craft-slot:hover::after,.svi-craft-output:hover::after{background:rgba(255,255,255,.35)}
.svi-slot.selected{border:3px solid #FFFFFF;box-shadow:inset 0 0 0 1px #373737}
.svi-slot b,.svi-equipment-slot b,.svi-craft-slot b,.svi-craft-output b{color:#FFFFFF;text-shadow:1px 1px #3F3F3F}
#svi-actions{color:#404040}
#svi-trash{border:2px solid #373737;border-top-color:#FFFFFF;border-left-color:#FFFFFF;background:#8B8B8B;color:#404040;border-radius:0;box-shadow:inset -1px -1px #555}
#svi-cursor-stack{background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF;border-radius:0}
@media(max-width:720px){
#svi-panel{width:min(430px,92vw);height:min(760px,92vh);aspect-ratio:.71;padding:8px;gap:7px}
#svi-storage,#svi-hotbar{grid-template-columns:repeat(9,minmax(28px,1fr));gap:3px}
}
`;
    document.head.appendChild(style);

    root.querySelector("#svi-close").addEventListener("click", close);
    root.querySelector("#svi-recipe-book").addEventListener("click", recipeBook);
    root.querySelector("#svi-trash").addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        cursorStack = null;
        renderCursor();
    });
    root.querySelector("#svi-craft-output").addEventListener("contextmenu", event => event.preventDefault());
    root.addEventListener("contextmenu", event => event.preventDefault());
    root.addEventListener("pointerdown", event => {
        if (event.target === root) {
            event.preventDefault();
        }
    });
}

function close() {
    if (!open) return;
    if (!depositCraftAndCursor()) return;
    open = false;
    root?.classList.remove("open");
    document.body.classList.remove("survival-inventory-open");
    cancelAnimationFrame(previewFrame);
    renderCursor();
    if (!document.body.classList.contains("mobile-mode") && isInWorld() && !window.__webminecraftHasOpenMenu?.()) {
        try { document.body.requestPointerLock?.(); } catch {}
    }
}

function openInventory() {
    if (!isInWorld() || !isSurvivalWorld()) return false;
    loadData();
    loadEquipment();
    if (!root) createUI();
    renderSlots();
    root.classList.add("open");
    document.body.classList.add("survival-inventory-open");
    open = true;
    document.exitPointerLock?.();
    ensureCursorUI();
    startPreview();
    return true;
}

function init() {
    ensureCursorUI();
    document.addEventListener("keydown", event => {
        if (!isInWorld() || !isSurvivalWorld()) return;
        if (event.code === "KeyE") {
            event.preventDefault();
            event.stopImmediatePropagation();
            open ? close() : openInventory();
        }
        if (event.code === "Escape" && open) {
            event.preventDefault();
            event.stopImmediatePropagation();
            close();
        }
        if (open && event.code === "Delete" && cursorStack) {
            event.preventDefault();
            cursorStack = null;
            renderCursor();
        }
    }, true);
    document.addEventListener("click", event => {
        if (!isInWorld() || !isSurvivalWorld()) return;
        const button = event.target.closest?.("#inventoryButton, #inventoryMobileButton");
        if (!button) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openInventory();
    }, true);
    window.addEventListener("webminecraft:inventorychanged", () => {
        loadData();
        if (!open || !root || !isInWorld() || !isSurvivalWorld()) return;
        renderSlots();
    });
    window.addEventListener("webminecraft:equipmentchanged", () => {
        loadEquipment();
        if (!open || !root || !isInWorld() || !isSurvivalWorld()) return;
        renderSlots();
    });
    window.addEventListener("webminecraft:modechange", () => {
        if (!isInWorld() || !isSurvivalWorld()) close();
    });
    const worldObserver = new MutationObserver(() => {
        if (!isInWorld() && open) close();
        if (!isInWorld()) root?.classList.remove("open");
    });
    worldObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
