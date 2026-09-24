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
let lastPrimaryPress = null;
let recipeBookOpen = true;

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
    // Use pointer events for dragging so it works consistently across browsers
    // and does not depend on native HTML5 drag/drop behavior.
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
    } else if (slot || lastPrimaryPress?.type === type && lastPrimaryPress?.index === index) {
        button.addEventListener("pointerdown", event => {
            if (event.button === 0) {
                event.preventDefault();
                event.stopPropagation();
                if (!dragged) {
                    pickupStack(type, index);
                } else {
                    dropInto(type, index);
                }
                lastPrimaryPress = null;
                suppressClick = true;
                render();
                return;
            }
            if (event.button !== 2) return;
            lastPrimaryPress = null;
            event.preventDefault();
            event.stopPropagation();
            if (!dragged) {
                takeHalf(type, index);
            } else {
                placeOne(type, index);
            }
            lastPrimaryPress = null;
            suppressClick = true;
            render();
        });
    } else if (type === "inventory") {
        button.addEventListener("pointerdown", event => {
            if (event.button !== 2 || !dragged) return;
            lastPrimaryPress = null;
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

    // Pointer-based dragging uses a temporary cursor stack. Support placing,
    // merging, and swapping it into any inventory/crafting slot.
    if (dragged.type === "cursor" && dragged.slot) {
        if (!target) {
            setSlot(type, index, cloneSlot(dragged.slot));
            dragged = null;
        } else if (sameItem(target, dragged.slot) && target.count < MAX_STACK) {
            const add = Math.min(MAX_STACK - target.count, dragged.slot.count);
            target.count += add;
            dragged.slot.count -= add;
            if (dragged.slot.count <= 0) dragged = null;
        } else if (!sameItem(target, dragged.slot)) {
            setSlot(type, index, cloneSlot(dragged.slot));
            dragged.slot = cloneSlot(target);
        }
        updateCraftResult();
        saveInventory();
        return;
    }
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
function countInventoryItem(itemIds) {
    const ids = new Set(itemIds.map(Number));
    return inventory.reduce((sum, slot) => ids.has(Number(slot?.itemId)) ? sum + Number(slot.count || 0) : sum, 0);
}
function craftableRecipes() {
    const recipes = [
        { itemId: 13, count: 4, label: "Oak Planks", tip: "1 log", ingredients: [{ ids: [...LOG_IDS], count: 1 }] },
        { itemId: 185, count: 4, label: "Stick", tip: "2 planks", ingredients: [{ ids: [...PLANK_IDS], count: 2 }] },
        { itemId: 168, count: 1, label: "Crafting Table", tip: "4 planks", ingredients: [{ ids: [...PLANK_IDS], count: 4 }] },
        { itemId: 17, count: 3, label: "Oak Door", tip: "6 oak planks", ingredients: [{ ids: [13], count: 6 }] },
        { itemId: 56, count: 6, label: "Oak Slab", tip: "3 oak planks", ingredients: [{ ids: [13], count: 3 }] },
        { itemId: 75, count: 4, label: "Oak Stairs", tip: "6 oak planks", ingredients: [{ ids: [13], count: 6 }] },
        { itemId: 51, count: 6, label: "Stone Slab", tip: "3 stone", ingredients: [{ ids: [3], count: 3 }] },
        { itemId: 52, count: 6, label: "Cobblestone Slab", tip: "3 cobblestone", ingredients: [{ ids: [7], count: 3 }] },
        { itemId: 19, count: 4, label: "Stone Bricks", tip: "4 stone", ingredients: [{ ids: [3], count: 4 }] },
        { itemId: 50, count: 1, label: "Furnace", tip: "8 cobblestone", ingredients: [{ ids: [7], count: 8 }] }
    ];
    return recipes.filter(recipe => recipe.ingredients.every(ingredient => countInventoryItem(ingredient.ids) >= ingredient.count));
}
function renderRecipeBrowser() {
    const panel = root?.querySelector("#ctm-help");
    if (!panel) return;
    const recipes = craftableRecipes();
    panel.innerHTML = `
        <div class="ctm-title">Craftable</div>
        <div class="ctm-recipe-tip">${recipes.length ? "Click a recipe to load it into the table." : "Collect ingredients to unlock recipes."}</div>
        <div id="ctm-recipe-grid">
            ${recipes.map((recipe, recipeIndex) => {
                const item = itemDef(recipe.itemId);
                if (!item) return "";
                const texture = item.texture;
                return \`<button class="ctm-recipe-card" type="button" data-recipe-index="${recipeIndex}" title="${recipe.label}: ${recipe.tip}">
                    <div class="ctm-recipe-icon">${texture ? \`<img src="${textureUrl(texture)}" alt="" draggable="false">\` : ""}</div>
                    <div class="ctm-recipe-name">${recipe.label}</div>
                    <div class="ctm-recipe-count">${recipe.count}× · ${recipe.tip}</div>
                </button>\`;
            }).join("")}
        </div>`;
    panel.querySelectorAll("[data-recipe-index]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const recipe = recipes[Number(button.dataset.recipeIndex)];
            if (recipe) useRecipe(recipe);
        });
    });
}

function clearCraftGridToInventory() {
    for (let i = 0; i < craftGrid.length; i++) {
        if (!craftGrid[i]) continue;
        const leftover = insertStack(craftGrid[i]);
        if (leftover) return false;
        craftGrid[i] = null;
    }
    return true;
}

function useRecipe(recipe) {
    if (!recipe || !recipe.ingredients?.length) return;

    // Return anything currently on the table before loading a new recipe.
    if (!clearCraftGridToInventory()) {
        render();
        return;
    }

    const needed = recipe.ingredients.map(ingredient => ({
        ids: new Set(ingredient.ids.map(Number)),
        count: Number(ingredient.count) || 0
    }));

    // Move the required ingredients from inventory into the crafting grid.
    for (const ingredient of needed) {
        let remaining = ingredient.count;
        for (let i = 0; i < inventory.length && remaining > 0; i++) {
            const slot = inventory[i];
            if (!slot || !ingredient.ids.has(Number(slot.itemId))) continue;
            const take = Math.min(remaining, slot.count);
            craftGrid[i % 9] = craftGrid[i % 9] && sameItem(craftGrid[i % 9], slot)
                ? { ...craftGrid[i % 9], count: craftGrid[i % 9].count + take }
                : { ...cloneSlot(slot), count: take };
            slot.count -= take;
            remaining -= take;
            if (slot.count <= 0) inventory[i] = null;
        }
        if (remaining > 0) {
            // Should not happen because the recipe list is filtered first.
            render();
            return;
        }
    }

    saveInventory();
    render();
}
}