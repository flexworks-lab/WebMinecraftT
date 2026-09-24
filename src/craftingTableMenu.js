import { BUILD_BLOCK_IDS, getInventoryItem } from "./inventory.js";

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
let activeRecipe = null;

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
    return "";
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
    } else {
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
    activeRecipe = null;
    const slot = getSlot(type, index);
    if (!slot || dragged) return;
    dragged = { type: "cursor", slot: cloneSlot(slot) };
    setSlot(type, index, null);
}
function takeHalf(type, index) {
    activeRecipe = null;
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
    activeRecipe = null;
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
function recipeDefinitions() {
    return [
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
}

function recipeAvailable(recipe) {
    return !!recipe && recipe.ingredients?.every(ingredient =>
        countInventoryItem(ingredient.ids) >= Number(ingredient.count || 0)
    );
}

function craftableRecipes() {
    return recipeDefinitions().filter(recipeAvailable);
}

function renderRecipeBrowser() {
    const panel = root?.querySelector("#ctm-help");
    if (!panel) return;

    const recipes = recipeDefinitions();
    const recipeByItemId = new Map(recipes.map(recipe => [Number(recipe.itemId), recipe]));
    // Show every block in the build catalog, including TNT and the oak door.
    const blockItems = [...new Set([...BUILD_BLOCK_IDS, 15, 17])]
        .map(id => itemDef(id))
        .filter(Boolean)
        .filter(item => Number(item.id) !== 185)
        .map(item => {
            const recipe = recipeByItemId.get(Number(item.id));
            const available = recipe
                ? recipeAvailable(recipe)
                : countInventoryItem([Number(item.id)]) > 0;
            return { item, recipe, available };
        })
        .sort((a, b) => Number(b.available) - Number(a.available));

    panel.innerHTML = `
        <div id="ctm-recipe-grid">
            ${blockItems.map(({ item, available }) => {
                const texture = item.texture;
                const stateClass = available ? "" : " unavailable";
                return '<button class="ctm-recipe-card' + stateClass + '" type="button" data-recipe-item="' + Number(item.id) + '" aria-label="">' +
                    '<div class="ctm-recipe-icon"><img src="' + textureUrl(texture) + '" alt="" draggable="false"></div>' +
                '</button>';
            }).join("")}
        </div>`;

    panel.querySelectorAll("[data-recipe-item]").forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const itemId = Number(button.dataset.recipeItem);
            const recipe = recipeByItemId.get(itemId);
            if (recipe && recipeAvailable(recipe)) {
                useRecipe(recipe);
            }
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
    activeRecipe = recipe;

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
function matchStickRecipe() {
    // Vanilla Minecraft shaped recipe:
    // # = any item in the planks tag
    // [#]
    // [#]
    //
    // It can be shifted anywhere inside the 3x3 crafting grid and produces 4 sticks.
    const pattern = [
        ["#"],
        ["#"]
    ];

    for (let row = 0; row <= 3 - pattern.length; row++) {
        for (let col = 0; col <= 3 - pattern[0].length; col++) {
            const used = [];
            let matches = true;

            for (let py = 0; py < pattern.length && matches; py++) {
                for (let px = 0; px < pattern[py].length; px++) {
                    const index = (row + py) * 3 + (col + px);
                    const slot = craftGrid[index];
                    if (!slot || !PLANK_IDS.has(Number(slot.itemId)) || Number(slot.count) < 1) {
                        matches = false;
                        break;
                    }
                    used.push({ index, amount: 1 });
                }
            }

            if (!matches) continue;

            // A shaped recipe cannot have anything outside its pattern.
            const occupied = craftGrid.reduce((count, slot) => count + (slot ? 1 : 0), 0);
            if (occupied !== used.length) continue;

            return {
                itemId: 185,
                count: 4,
                texture: itemDef(185)?.texture || null,
                recipe: used
            };
        }
    }

    return null;
}

function updateCraftResult() {
    craftOutput = null;

    const stickCraft = matchStickRecipe();
    if (stickCraft) {
        craftOutput = stickCraft;
        return;
    }

    // A recipe selected from the recipe book is valid when the crafting grid
    // contains exactly the ingredients required by that recipe.
    if (activeRecipe) {
        const totalGridItems = craftGrid.reduce((sum, slot) => sum + Number(slot?.count || 0), 0);
        const requiredTotal = activeRecipe.ingredients.reduce((sum, ingredient) => sum + Number(ingredient.count || 0), 0);

        if (totalGridItems === requiredTotal) {
            const matches = activeRecipe.ingredients.every(ingredient => {
                const ids = new Set(ingredient.ids.map(Number));
                const have = craftGrid.reduce((sum, slot) => (
                    slot && ids.has(Number(slot.itemId)) ? sum + Number(slot.count || 0) : sum
                ), 0);
                return have === Number(ingredient.count || 0);
            });

            if (matches) {
                const recipe = [];
                for (let index = 0; index < craftGrid.length; index++) {
                    const slot = craftGrid[index];
                    if (!slot) continue;
                    recipe.push({ index, amount: slot.count });
                }
                craftOutput = {
                    itemId: activeRecipe.itemId,
                    count: activeRecipe.count,
                    texture: itemDef(activeRecipe.itemId)?.texture || null,
                    recipe
                };
                return;
            }
        }
    }

    // Keep the classic quick recipes working even when the player places
    // ingredients manually instead of using the recipe book.
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
    renderRecipeBrowser();
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
        <header id="ctm-header"><button id="ctm-close" type="button" aria-label="Close"></button></header>
        <section id="ctm-pages">
          <div id="ctm-left-page" class="ctm-page">
            <div id="ctm-help" aria-label="Craftable recipes"></div>
          </div>

          <div id="ctm-right-page" class="ctm-page">
            <div class="ctm-craft-box">
              <div class="ctm-craft-row">
                <div id="ctm-craft-grid"></div>
                <span class="ctm-arrow" aria-hidden="true"></span>
                <button id="ctm-output" type="button" aria-label="Crafting output"></button>
              </div>
            </div>
            <div id="ctm-storage-section">
              <div id="ctm-storage"></div>
            </div>
            <div id="ctm-hotbar-section">
              <div id="ctm-hotbar"></div>
            </div>
          </div>
        </section>
              </div>
      <div id="ctm-cursor" aria-hidden="true"></div>`;
    document.body.appendChild(root);
    const style = document.createElement("style");
    style.id = "craftingTableMenuStyles";
    style.textContent = `
#craftingTableScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.48);z-index:1000001;font-family:Arial,sans-serif;color:#404040;image-rendering:pixelated;touch-action:none}
#craftingTableScreen.open{display:flex}
#ctm-panel{width:min(720px,92vw);max-height:94vh;box-sizing:border-box;padding:10px;background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;box-shadow:8px 8px 0 rgba(0,0,0,.28);display:flex;flex-direction:column;gap:8px;overflow:hidden}
#ctm-header{display:flex;align-items:center;justify-content:flex-end;min-height:28px}
#ctm-close{position:relative;width:30px;height:28px;margin-left:auto;background:#C6C6C6;color:transparent;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;font-size:0;line-height:0;cursor:pointer;padding:0;box-shadow:inset -2px -2px #555}
#ctm-close::before,#ctm-close::after{content:"";position:absolute;left:7px;top:12px;width:14px;height:2px;background:#404040}
#ctm-close::before{transform:rotate(45deg)}
#ctm-close::after{transform:rotate(-45deg)}
#ctm-pages{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;flex:1}
.ctm-page{background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;padding:10px;box-sizing:border-box;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
#ctm-left-page{overflow:hidden}
#ctm-right-page{gap:10px}
.ctm-page-title{font-size:16px;font-weight:800;color:#404040;margin-bottom:8px;text-shadow:1px 1px rgba(255,255,255,.55)}
#ctm-help{font-size:11px;color:#404040;overflow-y:auto;overflow-x:hidden;min-height:0;flex:1;padding-right:3px}
.ctm-craft-box{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:0 0 auto;background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;padding:12px;box-sizing:border-box}
#ctm-storage-section,#ctm-hotbar-section{background:#C6C6C6;border:2px solid #555;border-top-color:#FFFFFF;border-left-color:#FFFFFF;padding:8px;box-sizing:border-box}
.ctm-recipe-tip{font-size:10px;color:#555;margin:-1px 0 7px}
#ctm-recipe-grid{display:grid;grid-template-rows:repeat(7,minmax(0,1fr));grid-auto-flow:column;grid-auto-columns:minmax(58px,1fr);gap:6px;align-content:start;overflow-x:auto;overflow-y:hidden;padding:2px 3px 4px 2px;min-height:0;flex:1}
.ctm-recipe-card{min-width:0;min-height:0;aspect-ratio:1;background:#8B8B8B;border:2px solid #373737;border-top-color:#FFFFFF;border-left-color:#FFFFFF;box-shadow:inset -1px -1px #555;padding:4px;cursor:pointer;display:grid;place-items:center}
.ctm-recipe-card.unavailable{cursor:default}
.ctm-recipe-icon{width:100%;height:100%;background:#707070;border:2px solid #373737;box-shadow:inset -1px -1px #FFFFFF;display:grid;place-items:center;overflow:hidden}
.ctm-recipe-icon img{width:80%;height:80%;max-width:80%;max-height:80%;object-fit:contain;image-rendering:pixelated}
.ctm-recipe-card.unavailable .ctm-recipe-icon img{filter:brightness(.28) saturate(.25);opacity:.75}
.ctm-title{font-size:13px;font-weight:800;margin-bottom:6px;color:#404040;text-shadow:1px 1px rgba(255,255,255,.45)}
.ctm-craft-row{display:flex;align-items:center;justify-content:center;gap:10px}
.ctm-arrow{position:relative;width:28px;height:28px;flex:0 0 28px}
.ctm-arrow::before{content:"";position:absolute;left:2px;top:13px;width:18px;height:2px;background:#555}
.ctm-arrow::after{content:"";position:absolute;right:2px;top:8px;width:10px;height:10px;border-top:2px solid #555;border-right:2px solid #555;transform:rotate(45deg)}
#ctm-craft-grid{display:grid;grid-template-columns:repeat(3,42px);gap:4px}
.ctm-slot{position:relative;width:42px;height:42px;background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF;color:#FFFFFF;padding:0;cursor:pointer;overflow:hidden;contain:layout paint;isolation:isolate}
.ctm-craft-slot{width:42px;height:42px}
.ctm-item{position:relative;width:30px;height:30px;max-width:30px;max-height:30px;display:block;margin:auto;object-fit:contain;object-position:center;image-rendering:pixelated;pointer-events:none}
.ctm-craft-item{width:30px;height:30px;max-width:30px;max-height:30px;object-fit:contain}
.ctm-slot b,#ctm-output b{position:absolute;right:2px;bottom:0;color:#FFFFFF;font-size:12px;text-shadow:1px 1px #3F3F3F;z-index:2;pointer-events:none}
#ctm-output{position:relative;width:50px;height:50px;background:#8B8B8B;border:2px solid #373737;box-shadow:inset -2px -2px #FFFFFF;padding:0;cursor:pointer;overflow:hidden;contain:layout paint;isolation:isolate}
#ctm-output.ready{outline:3px solid #FFFFFF;outline-offset:-3px}
#ctm-output .ctm-item{width:34px;height:34px;max-width:34px;max-height:34px}
#ctm-storage,#ctm-hotbar{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:4px}
#ctm-hotbar-section{min-height:0}
#ctm-cursor{display:none;position:fixed;width:46px;height:46px;z-index:2147483647;pointer-events:none;background:transparent;border:0;transform:translate(-50%,-50%);filter:drop-shadow(2px 2px 1px rgba(0,0,0,.55))}
#ctm-cursor.visible{display:block}
#ctm-cursor .ctm-item{width:40px;height:40px;max-width:40px;max-height:40px;margin:3px}
#ctm-cursor b{position:absolute;right:0;bottom:0;color:#FFFFFF;font-size:12px;text-shadow:1px 1px #3F3F3F;z-index:2}
body.crafting-table-open #hotbar.textured-hotbar{display:none!important}
body.crafting-table-open #inventoryButton{pointer-events:none!important;opacity:.5}
@media(max-width:720px){
#ctm-panel{width:min(760px,96vw);max-height:94vh;padding:7px;gap:6px}
#ctm-pages{grid-template-columns:1fr 1fr;gap:6px}
.ctm-page{padding:6px}
.ctm-page-title{font-size:12px;margin-bottom:4px}
.ctm-craft-box,#ctm-storage-section,#ctm-hotbar-section{padding:6px}
#ctm-title,.ctm-title{font-size:11px;margin-bottom:4px}
#ctm-help{display:block}
#ctm-recipe-grid{grid-template-rows:repeat(7,minmax(0,1fr));grid-auto-flow:column;grid-auto-columns:58px;gap:3px}
.ctm-recipe-card{padding:3px}
.ctm-recipe-icon{width:100%;height:100%}
.ctm-recipe-icon img{width:82%;height:82%;max-width:82%;max-height:82%}
#ctm-craft-grid{grid-template-columns:repeat(3,32px);gap:2px}
.ctm-slot,.ctm-craft-slot{width:32px;height:32px}
.ctm-item{width:24px;height:24px;max-width:24px;max-height:24px}
#ctm-output{width:40px;height:40px}
#ctm-output .ctm-item{width:28px;height:28px;max-width:28px;max-height:28px}
#ctm-storage,#ctm-hotbar{grid-template-columns:repeat(9,minmax(0,1fr));gap:2px}
#ctm-actions{font-size:8px}
#ctm-delete{padding:4px 6px;font-size:9px}
}
`;
    document.head.appendChild(style);
    root.querySelector("#ctm-close").addEventListener("click", closeMenu);
    window.addEventListener("webminecraft:inventorychanged", () => {
        if (open) {
            loadInventory();
            render();
        }
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
    function slotAtPoint(clientX, clientY) {
        const target = document.elementFromPoint(clientX, clientY)?.closest(".ctm-slot");
        if (!target || !root.contains(target)) return null;
        const type = target.classList.contains("ctm-craft-slot") ? "craft" : "inventory";
        const slots = type === "craft"
            ? [...root.querySelectorAll("#ctm-craft-grid .ctm-slot")]
            : [...root.querySelectorAll("#ctm-storage .ctm-slot"), ...root.querySelectorAll("#ctm-hotbar .ctm-slot")];
        const index = slots.indexOf(target);
        return index >= 0 ? { type, index } : null;
    }

    document.addEventListener("pointermove", event => {
        if (!open || !dragged?.slot) return;
        const cursor = root.querySelector("#ctm-cursor");
        if (!cursor) return;
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    });

    document.addEventListener("pointerup", event => {
        if (!open || !dragged?.slot) return;
        // Left click is handled immediately on the slot press. If the player
        // releases after moving away, keep the stack on the cursor.
        // Right click places one item only when the cursor is touching a slot.
        if (event.button === 2) {
            const hit = slotAtPoint(event.clientX, event.clientY);
            if (hit) placeOne(hit.type, hit.index);
            render();
        }
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
