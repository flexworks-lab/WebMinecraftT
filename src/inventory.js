import * as THREE from "three";

const INVENTORY_SIZE = 36;
const HOTBAR_SIZE = 9;
const MAX_STACK = 64;
const INVENTORY_VERSION = 6;
const EXPANDED_CATALOG_GROUPS = new Set();

const ITEM_TYPES = [
    { id: 1, name: "Grass Block", texture: "grass_block_side.png", category: "natural" },
    { id: 2, name: "Dirt", texture: "dirt.png", category: "natural" },
    { id: 3, name: "Stone", texture: "stone.png", category: "natural" },
    { id: 4, name: "Sand", texture: "sand.png", category: "natural" },
    { id: 5, name: "Oak Log", texture: "oak_log_top.png", category: "natural" },
    { id: 6, name: "Oak Leaves", texture: "oak-leaves-normal-original-default.png", category: "natural" },
    { id: 7, name: "Cobblestone", texture: "cobblestone.png", category: "natural" },
    { id: 8, name: "Gravel", texture: "gravel.png", category: "natural" },
    { id: 9, name: "Sandstone", texture: "sandstone.png", category: "natural" },
    { id: 10, name: "Bedrock", texture: "bedrock.png", category: "natural" },
    { id: 11, name: "Coal Ore", texture: "coal_ore.png", category: "natural" },
    { id: 12, name: "Iron Ore", texture: "iron_ore.png", category: "natural" },
    { id: 13, name: "Oak Planks", texture: "oak_planks.png", category: "natural" },
    { id: 14, name: "Snow", texture: "snow.png", category: "natural" },
    { id: 15, name: "TNT", texture: "tnt_side.png", category: "tools" },
    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png", category: "tools" },
    { id: 17, name: "Oak Door", texture: "oak_door_bottom.png", category: "tools" },
    { id: 18, name: "Bricks", texture: "bricks.png", category: "natural" },
    { id: 19, name: "Stone Bricks", texture: "stone_bricks.png", category: "natural" },
    { id: 20, name: "Cracked Stone Bricks", texture: "cracked_stone_bricks.png", category: "natural" },
    { id: 21, name: "Mossy Stone Bricks", texture: "mossy_stone_bricks.png", category: "natural" },
    { id: 22, name: "Dirt Path", texture: "dirt_path_top.png", category: "natural" },
    { id: 23, name: "Acacia Planks", texture: "acacia_planks.png", category: "natural" },
    { id: 24, name: "Bamboo Planks", texture: "bamboo_planks.png", category: "natural" },
    { id: 25, name: "Birch Planks", texture: "birch_planks.png", category: "natural" },
    { id: 26, name: "Crimson Planks", texture: "crimson_planks.png", category: "natural" },
    { id: 27, name: "Dark Oak Planks", texture: "dark_oak_planks.png", category: "natural" },
    { id: 28, name: "Jungle Planks", texture: "jungle_planks.png", category: "natural" },
    { id: 29, name: "Mangrove Planks", texture: "mangrove_planks.png", category: "natural" },
    { id: 30, name: "Spruce Planks", texture: "spruce_planks.png", category: "natural" },
    { id: 31, name: "Warped Planks", texture: "warped_planks.png", category: "natural" },
    { id: 32, name: "Blast Furnace", texture: "blast_furnace_front.png", category: "tools" },
    { id: 33, name: "Chiseled Deepslate", texture: "chiseled_deepslate.png", category: "natural" },
    { id: 34, name: "Cobbled Deepslate", texture: "cobbled_deepslate.png", category: "natural" },
    { id: 35, name: "Cracked Deepslate Bricks", texture: "cracked_deepslate_bricks.png", category: "natural" },
    { id: 36, name: "Cracked Deepslate Tiles", texture: "cracked_deepslate_tiles.png", category: "natural" },
    { id: 37, name: "Deepslate", texture: "deepslate.png", category: "natural" },
    { id: 38, name: "Deepslate Bricks", texture: "deepslate_bricks.png", category: "natural" },
    { id: 39, name: "Deepslate Coal Ore", texture: "deepslate_coal_ore.png", category: "natural" },
    { id: 40, name: "Deepslate Copper Ore", texture: "deepslate_copper_ore.png", category: "natural" },
    { id: 41, name: "Deepslate Diamond Ore", texture: "deepslate_diamond_ore.png", category: "natural" },
    { id: 42, name: "Deepslate Emerald Ore", texture: "deepslate_emerald_ore.png", category: "natural" },
    { id: 43, name: "Deepslate Gold Ore", texture: "deepslate_gold_ore.png", category: "natural" },
    { id: 44, name: "Deepslate Iron Ore", texture: "deepslate_iron_ore.png", category: "natural" },
    { id: 45, name: "Deepslate Lapis Ore", texture: "deepslate_lapis_ore.png", category: "natural" },
    { id: 46, name: "Deepslate Redstone Ore", texture: "deepslate_redstone_ore.png", category: "natural" },
    { id: 47, name: "Deepslate Tiles", texture: "deepslate_tiles.png", category: "natural" },
    { id: 48, name: "Polished Deepslate", texture: "polished_deepslate.png", category: "natural" },
    { id: 49, name: "Reinforced Deepslate", texture: "reinforced_deepslate_top.png", category: "natural" },
    { id: 50, name: "Furnace", texture: "furnace_front.png", category: "tools" },
    { id: 51, name: "Stone Slab", texture: "stone.png", category: "natural" },
    { id: 52, name: "Cobblestone Slab", texture: "cobblestone.png", category: "natural" },
    { id: 53, name: "Stone Bricks Slab", texture: "stone_bricks.png", category: "natural" },
    { id: 54, name: "Cracked Stone Bricks Slab", texture: "cracked_stone_bricks.png", category: "natural" },
    { id: 55, name: "Mossy Stone Bricks Slab", texture: "mossy_stone_bricks.png", category: "natural" },
    { id: 56, name: "Oak Planks Slab", texture: "oak_planks.png", category: "natural" },
    { id: 57, name: "Acacia Planks Slab", texture: "acacia_planks.png", category: "natural" },
    { id: 58, name: "Bamboo Planks Slab", texture: "bamboo_planks.png", category: "natural" },
    { id: 59, name: "Birch Planks Slab", texture: "birch_planks.png", category: "natural" },
    { id: 60, name: "Crimson Planks Slab", texture: "crimson_planks.png", category: "natural" },
    { id: 61, name: "Dark Oak Planks Slab", texture: "dark_oak_planks.png", category: "natural" },
    { id: 62, name: "Jungle Planks Slab", texture: "jungle_planks.png", category: "natural" },
    { id: 63, name: "Mangrove Planks Slab", texture: "mangrove_planks.png", category: "natural" },
    { id: 64, name: "Spruce Planks Slab", texture: "spruce_planks.png", category: "natural" },
    { id: 65, name: "Warped Planks Slab", texture: "warped_planks.png", category: "natural" },
    { id: 66, name: "Chiseled Deepslate Slab", texture: "chiseled_deepslate.png", category: "natural" },
    { id: 67, name: "Cobbled Deepslate Slab", texture: "cobbled_deepslate.png", category: "natural" },
    { id: 68, name: "Cracked Deepslate Bricks Slab", texture: "cracked_deepslate_bricks.png", category: "natural" },
    { id: 69, name: "Cracked Deepslate Tiles Slab", texture: "cracked_deepslate_tiles.png", category: "natural" },
    { id: 70, name: "Deepslate Slab", texture: "deepslate.png", category: "natural" },
    { id: 71, name: "Deepslate Bricks Slab", texture: "deepslate_bricks.png", category: "natural" },
    { id: 72, name: "Deepslate Tiles Slab", texture: "deepslate_tiles.png", category: "natural" },
    { id: 73, name: "Polished Deepslate Slab", texture: "polished_deepslate.png", category: "natural" },
    { id: 74, name: "Reinforced Deepslate Slab", texture: "reinforced_deepslate_top.png", category: "natural" },
    { id: 75, name: "Oak Planks Stairs", texture: "oak_planks.png", category: "natural" },
    { id: 76, name: "Acacia Planks Stairs", texture: "acacia_planks.png", category: "natural" },
    { id: 77, name: "Bamboo Planks Stairs", texture: "bamboo_planks.png", category: "natural" },
    { id: 78, name: "Birch Planks Stairs", texture: "birch_planks.png", category: "natural" },
    { id: 79, name: "Crimson Planks Stairs", texture: "crimson_planks.png", category: "natural" },
    { id: 80, name: "Dark Oak Planks Stairs", texture: "dark_oak_planks.png", category: "natural" },
    { id: 81, name: "Jungle Planks Stairs", texture: "jungle_planks.png", category: "natural" },
    { id: 82, name: "Mangrove Planks Stairs", texture: "mangrove_planks.png", category: "natural" },
    { id: 83, name: "Spruce Planks Stairs", texture: "spruce_planks.png", category: "natural" },
    { id: 84, name: "Warped Planks Stairs", texture: "warped_planks.png", category: "natural" },

    { id: 155, name: "Acacia Log", texture: "acacia_log_top.png", category: "natural" },
    { id: 156, name: "Birch Log", texture: "birch_log_top.png", category: "natural" },
    { id: 157, name: "Dark Oak Log", texture: "dark_oak_log_top.png", category: "natural" },
    { id: 158, name: "Jungle Log", texture: "jungle_log_top.png", category: "natural" },
    { id: 159, name: "Mangrove Log", texture: "mangrove_log_top.png", category: "natural" },
    { id: 160, name: "Spruce Log", texture: "spruce_log_top.png", category: "natural" },
    { id: 161, name: "Stripped Oak Log", texture: "stripped_oak_log_top.png", category: "natural" },
    { id: 162, name: "Stripped Acacia Log", texture: "stripped_acacia_log_top.png", category: "natural" },
    { id: 163, name: "Stripped Birch Log", texture: "stripped_birch_log_top.png", category: "natural" },
    { id: 164, name: "Stripped Dark Oak Log", texture: "stripped_dark_oak_log_top.png", category: "natural" },
    { id: 165, name: "Stripped Jungle Log", texture: "stripped_jungle_log_top.png", category: "natural" },
    { id: 166, name: "Stripped Mangrove Log", texture: "stripped_mangrove_log_top.png", category: "natural" },
    { id: 167, name: "Stripped Spruce Log", texture: "stripped_spruce_log_top.png", category: "natural" },
    { id: 168, name: "Crafting Table", texture: "crafting_table_front.png", category: "tools" },
    { id: 169, name: "Black Concrete", texture: "black_concrete.png", category: "natural" },
    { id: 170, name: "Blue Concrete", texture: "blue_concrete.png", category: "natural" },
    { id: 171, name: "Brown Concrete", texture: "brown_concrete.png", category: "natural" },
    { id: 172, name: "Cyan Concrete", texture: "cyan_concrete.png", category: "natural" },
    { id: 173, name: "Gray Concrete", texture: "gray_concrete.png", category: "natural" },
    { id: 174, name: "Green Concrete", texture: "green_concrete.png", category: "natural" },
    { id: 175, name: "Light Blue Concrete", texture: "light_blue_concrete.png", category: "natural" },
    { id: 176, name: "Light Gray Concrete", texture: "light_gray_concrete.png", category: "natural" },
    { id: 177, name: "Lime Concrete", texture: "lime_concrete.png", category: "natural" },
    { id: 178, name: "Magenta Concrete", texture: "magenta_concrete.png", category: "natural" },
    { id: 179, name: "Orange Concrete", texture: "orange_concrete.png", category: "natural" },
    { id: 180, name: "Pink Concrete", texture: "pink_concrete.png", category: "natural" },
    { id: 181, name: "Purple Concrete", texture: "purple_concrete.png", category: "natural" },
    { id: 182, name: "Red Concrete", texture: "red_concrete.png", category: "natural" },
    { id: 183, name: "White Concrete", texture: "white_concrete.png", category: "natural" },
    { id: 184, name: "Yellow Concrete", texture: "yellow_concrete.png", category: "natural" }
];

const TAB_DEFS = [
    { id: "tools", label: "Tools & Utilities", icon: "⚒" },
    { id: "building", label: "Build Blocks", icon: "building" },
    { id: "natural", label: "Natural Blocks", icon: "◆" },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "survival", label: "Survival Inventory", icon: "▣" }
];

export const BUILD_BLOCK_IDS = new Set(
    ITEM_TYPES
        .filter(item => ![15, 16, 17].includes(item.id))
        .map(item => item.id)
);

const CATALOG_GROUPS = {
    wood_planks: {
        id: "wood_planks",
        label: "Planks",
        primaryId: 13,
        variantIds: [13, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    },
    wood_stairs: {
        id: "wood_stairs",
        label: "Stairs",
        primaryId: 75,
        variantIds: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84],
    },
    stone_deepslate: {
        id: "stone_deepslate",
        label: "Stone & Deepslate",
        primaryId: 3,
        variantIds: [3, 7, 18, 19, 20, 21, 51, 52, 53, 54, 55, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 66, 67, 68, 69, 70, 71, 72, 73, 74],
    },
    concrete: {
        id: "concrete",
        label: "Concrete",
        primaryId: 169,
        variantIds: [169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184],
    }
};

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
function getItem(itemId) { return ITEM_TYPES.find(item => item.id === Number(itemId)) || null; }
function normalizeSlot(slot) {
    if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
    const itemId = Math.floor(Number(slot.itemId));
    const item = getItem(itemId);
    if (!item) return null;
    const count = Math.max(1, Math.min(MAX_STACK, Math.floor(Number(slot.count))));
    return { itemId, count, texture: slot.texture || item.texture || null };
}
function normalizeInventory(value) {
    if (!Array.isArray(value) || value.length !== INVENTORY_SIZE) return Array.from({ length: INVENTORY_SIZE }, () => null);
    return value.map(normalizeSlot);
}
function saveInventory() {
    inventory = normalizeInventory(inventory);
    try { localStorage.setItem("webminecraft_inventory", JSON.stringify(inventory)); } catch {}
}
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
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) {
            inventory = normalizeInventory(saved);
            try { localStorage.setItem("webminecraft_inventory", JSON.stringify(inventory)); } catch {}
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
            inventory[i] = { itemId, count: add, texture: item.texture || null };
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
    if (selectedTab === "building") {
        const groups = Object.values(CATALOG_GROUPS).filter(group => ["wood_planks", "wood_stairs", "concrete"].includes(group.id));
        if (!searchQuery.trim()) return groups.map(group => ({ group: true, ...group, variants: group.variantIds.map(getItem).filter(Boolean) }));
        return groups.flatMap(group => group.variantIds.map(getItem).filter(Boolean).filter(itemMatchesSearch));
    }
    if (selectedTab === "natural" && !searchQuery.trim()) {
        const group = CATALOG_GROUPS.stone_deepslate;
        const groupedIds = new Set(group.variantIds);
        const concreteIds = new Set(CATALOG_GROUPS.concrete.variantIds);
        const naturalItems = ITEM_TYPES.filter(item =>
            item.category === selectedTab &&
            !item.name.toLowerCase().includes("planks") &&
            !groupedIds.has(item.id) &&
            !concreteIds.has(item.id) &&
            itemMatchesSearch(item)
        );
        return [{ group: true, ...group, variants: group.variantIds.map(getItem).filter(Boolean) }, ...naturalItems];
    }
    return ITEM_TYPES.filter(item => item.category === selectedTab && !item.name.toLowerCase().includes("planks") && itemMatchesSearch(item));
}

function iconSvg(name) {
    if (name === "tools") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.2a5 5 0 0 0-6.1 6.1l-5 5a2 2 0 0 0 2.8 2.8l5-5a5 5 0 0 0 6.1-6.1l-3 3-2-2 3-3Z"/><path d="m15 15 5.2 5.2M17.8 12.2l4-4M19.8 4.2l1.9 1.9"/></svg>';
    if (name === "natural") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4.9 2.5 8 6.1 8 10.1A8 8 0 1 1 4 13.1C4 9.8 6.7 6 12 3Z"/><path d="M12 21c0-5 1.8-9 5.9-12"/></svg>';
    if (name === "building") return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l8-5 8 5v12H4Z"/><path d="M8 20v-6h8v6M7 9h2M15 9h2M7 12h2M15 12h2"/></svg>';
    if (name === "search") return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4z"/><path d="M7 6.5v-2h10v2M7 10h10M7 14h4"/></svg>';
}

function isSlabItem(itemId) { return Number(itemId) >= 51 && Number(itemId) <= 74; }
function isStairItem(itemId) { return Number(itemId) >= 75 && Number(itemId) <= 84; }

function blockFaceTextures(item) {
    const id = Number(item?.id);
    const base = item?.texture ? textureUrl(item.texture) : "";
    const side = base;
    let front = side;
    let back = side;
    let right = side;
    let left = side;
    let top = side;
    let bottom = side;

    const setFaces = (faces = {}) => {
        if (faces.side) {
            const sideTexture = textureUrl(faces.side);
            front = sideTexture;
            back = sideTexture;
            right = sideTexture;
            left = sideTexture;
        }
        if (faces.front) front = textureUrl(faces.front);
        if (faces.back) back = textureUrl(faces.back);
        if (faces.right) right = textureUrl(faces.right);
        if (faces.left) left = textureUrl(faces.left);
        if (faces.top) top = textureUrl(faces.top);
        if (faces.bottom) bottom = textureUrl(faces.bottom);
    };

    if (id === 1) {
        setFaces({
            side: "grass_block_side.png",
            top: "Grass_Block_(top_texture)_JE2.png",
            bottom: "dirt.png"
        });
    }
    if (id === 5) setFaces({ side: "oak_log.png", top: "oak_log_top.png", bottom: "oak_log_top.png" });
    if (id === 9) setFaces({ side: "sandstone.png", top: "sandstone_top.png", bottom: "sandstone_bottom.png" });
    if (id === 15) setFaces({ side: "tnt_side.png", top: "tnt_top.png", bottom: "tnt_bottom.png" });
    if (id === 32) setFaces({ front: "blast_furnace_front.png", side: "blast_furnace_side.png", top: "blast_furnace_top.png" });
    if (id === 37) setFaces({ side: "deepslate.png", top: "deepslate_top.png" });
    if (id === 49) setFaces({ side: "reinforced_deepslate_side.png", top: "reinforced_deepslate_top.png", bottom: "reinforced_deepslate_bottom.png" });
    if (id === 50) setFaces({ front: "furnace_front.png", side: "furnace_side.png", top: "furnace_top.png" });

    const extraLogFaces = {
        155: ["acacia_log.png", "acacia_log_top.png"],
        156: ["birch_log.png", "birch_log_top.png"],
        157: ["dark_oak_log.png", "dark_oak_log_top.png"],
        158: ["jungle_log.png", "jungle_log_top.png"],
        159: ["mangrove_log.png", "mangrove_log_top.png"],
        160: ["spruce_log.png", "spruce_log_top.png"],
        161: ["stripped_oak_log.png", "stripped_oak_log_top.png"],
        162: ["stripped_acacia_log.png", "stripped_acacia_log_top.png"],
        163: ["stripped_birch_log.png", "stripped_birch_log_top.png"],
        164: ["stripped_dark_oak_log.png", "stripped_dark_oak_log_top.png"],
        165: ["stripped_jungle_log.png", "stripped_jungle_log_top.png"],
        166: ["stripped_mangrove_log.png", "stripped_mangrove_log_top.png"],
        167: ["stripped_spruce_log.png", "stripped_spruce_log_top.png"]
    };
    if (extraLogFaces[id]) {
        const [logSide, logTop] = extraLogFaces[id];
        setFaces({ side: logSide, top: logTop, bottom: logTop });
    }
    if (id === 168) setFaces({
        front: "crafting_table_front.png",
        back: "crafting_table_side.png",
        right: "crafting_table_side.png",
        left: "crafting_table_side.png",
        top: "crafting_table_top.png",
        bottom: "crafting_table_side.png"
    });

    return { front, back, right, left, top, bottom };
}

function itemVisual(item) {
    if (item.texture) {
        const slabClass = isSlabItem(item.id) ? " slabIcon" : "";
        const stairClass = isStairItem(item.id) ? " stairIcon" : "";
        const texture = textureUrl(item.texture);
        if (!slabClass && !stairClass && Number(item.id) !== 16) {
            const faces = blockFaceTextures(item);
            const style = `--block-front:url('${faces.front}');--block-back:url('${faces.back}');--block-right:url('${faces.right}');--block-left:url('${faces.left}');--block-top:url('${faces.top}');--block-bottom:url('${faces.bottom}')`;
            return `<span class="catalogIcon catalogBlock3d" style="${style}"><i class="blockFace blockFront"></i><i class="blockFace blockBack"></i><i class="blockFace blockRight"></i><i class="blockFace blockLeft"></i><i class="blockFace blockTop"></i><i class="blockFace blockBottom"></i></span><span class="catalogFallback">${item.name.charAt(0)}</span>`;
        }
        const iconStyle = stairClass
            ? `--stair-texture:url('${texture}')`
            : `background-image:url('${texture}')`;
        return `<span class="catalogIcon catalogTexture${slabClass}${stairClass}" style="${iconStyle}"></span><span class="catalogFallback">${item.name.charAt(0)}</span>`;
    }
    return `<span class="catalogIcon catalogColor" style="--item-color:#777"></span>`;
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
.hotbarTexture.stairIcon{background-image:none!important;background-size:auto!important;background-position:initial!important;overflow:visible}.hotbarTexture.stairIcon::before,.hotbarTexture.stairIcon::after{content:"";position:absolute;display:block;background-image:var(--stair-texture);background-repeat:no-repeat;background-position:center;background-size:100% 100%;image-rendering:pixelated}.hotbarTexture.stairIcon::before{left:0;right:0;bottom:0;height:58%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.22)}.hotbarTexture.stairIcon::after{right:0;top:0;width:56%;height:46%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset -2px 0 0 rgba(0,0,0,.16)}#inventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.48);z-index:999999;pointer-events:auto;font-family:Arial,sans-serif;color:#fff}
#inventoryScreen.open{display:flex}
body.inventory-open #hotbar.textured-hotbar{display:none!important}
#inventoryPanel{position:relative;z-index:1000000;width:min(900px,94vw);height:min(690px,91vh);display:flex;flex-direction:column;padding:10px;background:#555;border:3px solid #252525;border-top-color:#777;border-left-color:#777;box-shadow:10px 10px 0 rgba(0,0,0,.32),inset 2px 2px 0 #747474;image-rendering:pixelated;overflow:hidden}
#inventoryTopBar{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 4px 6px;flex:0 0 auto}
#inventoryTitle{font-size:22px;font-weight:700;text-shadow:2px 2px 0 #171717}
#inventoryClose{width:32px;height:30px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#8a8a8a;color:#fff;font-size:22px;line-height:19px;cursor:pointer;box-shadow:inset -2px -2px 0 #444}#inventoryScreen button:not(.inventoryTab){box-sizing:border-box;transform:scale(.86);transform-origin:center center}
#creativeTabs{display:flex;gap:6px;flex:0 0 auto;padding:0 3px 8px;border-bottom:2px solid #171717}
.inventoryTab{width:46px;height:40px;border:2px solid #161616;border-top-color:#8b8b8b;border-left-color:#8b8b8b;background:#777;color:#ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset -2px -2px 0 #444;position:relative}
.inventoryTab:hover{filter:brightness(1.14)}.inventoryTab.active{background:#9b9b9b;border-color:#f0f0f0;color:#fff;transform:translateY(1px)}
.inventoryTab svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:square;stroke-linejoin:miter}.inventoryTab:nth-child(2) svg{fill:currentColor;stroke:currentColor}
#inventoryBody{min-height:0;flex:1;display:flex;padding-top:10px}
#catalogPanel{min-width:0;flex:1;display:flex;flex-direction:column;background:#3a3a3a;border:2px solid #222;padding:8px}
#catalogToolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex:0 0 auto}
#catalogSectionName{font-size:16px;font-weight:700;text-shadow:1px 1px 0 #000}
#catalogSearchWrap{width:min(300px,45%);height:34px;display:flex;align-items:center;border:2px solid #121212;background:#2a2a2a;box-shadow:inset 2px 2px 0 #181818}
#catalogSearchWrap .searchIcon{font-size:22px;color:#aaa;padding:0 5px 2px}
#catalogSearch{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;padding:0 8px;font-size:14px}
#catalogSearch::placeholder{color:#858585}
#catalogViewport{min-height:0;flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 2px 2px 1px;scrollbar-color:#48a84a #262626;scrollbar-width:auto}
#catalogGrid{display:grid;grid-template-columns:repeat(9,minmax(44px,1fr));gap:5px;align-content:start}\n#catalogViewport::-webkit-scrollbar{width:12px}\n#catalogViewport::-webkit-scrollbar-track{background:#262626;border-left:2px solid #171717}\n#catalogViewport::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#69c95e,#2d8e38);border:2px solid #171717;box-shadow:inset 1px 1px 0 rgba(255,255,255,.22),inset -1px -1px 0 rgba(0,0,0,.25)}\n#catalogViewport::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#7bdd70,#3da648)}
.catalogSlot{position:relative;min-width:0;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#9a9a9a;cursor:grab;box-shadow:inset -1px -1px 0 #666;touch-action:none}
button.catalogGroup{appearance:none;-webkit-appearance:none;padding:0;margin:0;font:inherit;color:inherit;text-align:left;outline:0;transform:scale(.88);transform-origin:center}
.catalogGroupBadge{position:absolute;right:3px;bottom:3px;z-index:4;min-width:16px;height:16px;padding:0 2px;display:flex;align-items:center;justify-content:center;background:#202020;border:1px solid #111;color:#fff;font:bold 14px/14px Arial,sans-serif;text-shadow:1px 1px 0 #000;box-shadow:inset 1px 1px 0 rgba(255,255,255,.18),inset -1px -1px 0 rgba(0,0,0,.35);pointer-events:none}
.catalogGroupLabel{position:absolute;left:2px;right:22px;bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px;text-shadow:1px 1px 0 #000;opacity:0;pointer-events:none}
.catalogGroup:hover .catalogGroupLabel{opacity:1}
.catalogSlot:active{cursor:grabbing}.catalogSlot:hover{filter:brightness(1.13);border-color:#fff}
.catalogIcon{position:absolute;inset:6px;display:block}.catalogGroupExpanded .catalogIcon{background-color:#656565}.catalogTexture{background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.catalogTexture{background-color:transparent}.catalogBlock3d{left:50%;top:50%;right:auto;bottom:auto;width:40px;height:40px;transform:translate(-50%,-50%) rotateX(-30deg) rotateY(45deg);transform-style:preserve-3d;transform-origin:center center;pointer-events:none;background:transparent}.catalogBlock3d .blockFace{position:absolute;left:0;top:0;width:40px;height:40px;display:block;margin:0;background-image:var(--block-front);background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated;backface-visibility:hidden;transform-style:preserve-3d;border:0}.catalogBlock3d .blockFront{transform:translateZ(20px);background-image:var(--block-front);filter:brightness(.95)}.catalogBlock3d .blockBack{transform:rotateY(180deg) translateZ(20px);background-image:var(--block-back)}.catalogBlock3d .blockRight{transform:rotateY(90deg) translateZ(20px);background-image:var(--block-right);filter:brightness(.78)}.catalogBlock3d .blockLeft{transform:rotateY(-90deg) translateZ(20px);background-image:var(--block-left);filter:brightness(.88)}.catalogBlock3d .blockTop{transform:rotateX(90deg) translateZ(20px);background-image:var(--block-top);filter:brightness(1.12)}.catalogBlock3d .blockBottom{transform:rotateX(-90deg) translateZ(20px);background-image:var(--block-bottom);filter:brightness(.62)}.catalogTexture.slabIcon{top:44%;bottom:6px;background-size:100% 200%;background-position:center top;border-top:2px solid rgba(255,255,255,.22);box-shadow:0 -2px 0 rgba(0,0,0,.28),inset 0 2px 0 rgba(255,255,255,.10)}
.catalogTexture.stairIcon{background-image:none!important;background-size:auto!important;background-position:initial!important;border-top:0!important;box-shadow:none!important;overflow:visible}
.catalogTexture.stairIcon::before,.catalogTexture.stairIcon::after{content:"";position:absolute;display:block;background-image:var(--stair-texture);background-repeat:no-repeat;background-position:center;background-size:100% 100%;image-rendering:pixelated}
.catalogTexture.stairIcon::before{left:0;right:0;bottom:0;height:58%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.22)}
.catalogTexture.stairIcon::after{right:0;top:0;width:56%;height:46%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset -2px 0 0 rgba(0,0,0,.16)}
.catalogFallback{position:absolute;inset:6px;display:none;align-items:center;justify-content:center;font-size:22px;font-weight:700;text-shadow:2px 2px 0 #222;background:#858585;color:#fff}
.catalogColor{background:var(--item-color);box-shadow:inset 3px 3px 0 rgba(255,255,255,.14),inset -3px -3px 0 rgba(0,0,0,.2)}
.catalogName{position:absolute;left:2px;right:2px;bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px;text-shadow:1px 1px 0 #000;opacity:0;pointer-events:none}
.catalogSlot:hover .catalogName{opacity:1}
#survivalPanel{flex:1;background:#3a3a3a;border:2px solid #222;padding:10px}
#inventoryBottom{height:96px;flex:0 0 auto;display:grid;grid-template-columns:76px 1fr 76px;align-items:center;gap:12px;padding-top:10px}
#hotbarInventory{display:grid;grid-template-columns:repeat(9,minmax(42px,58px));justify-content:center;gap:5px}
.inventorySlot,.destroySlot,.offhandSlot{position:relative;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#9a9a9a;box-shadow:inset -1px -1px 0 #666;min-width:0}
.inventorySlot{cursor:grab;touch-action:none}.inventorySlot:hover{filter:brightness(1.12);border-color:#fff}.inventorySlot.dragging{opacity:.42}
.slotTexture{position:absolute;inset:6px;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.hotbarBlock3d{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;display:block!important;transform:none!important;transform-style:flat;pointer-events:none;background:transparent!important;overflow:visible!important}.hotbarCube3d{position:absolute;left:50%;top:50%;width:22px;height:22px;margin-left:-11px;margin-top:-11px;display:block;transform:rotateX(-30deg) rotateY(45deg);transform-style:preserve-3d;transform-origin:center center;background:transparent}.hotbarCube3d .blockFace{position:absolute;left:0;top:0;width:22px;height:22px;display:block;margin:0;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated;backface-visibility:hidden;transform-style:preserve-3d;border:0}.hotbarCube3d .blockFront{transform:translateZ(11px);background-image:var(--block-front);filter:brightness(.95)}.hotbarCube3d .blockBack{transform:rotateY(180deg) translateZ(11px);background-image:var(--block-back)}.hotbarCube3d .blockRight{transform:rotateY(90deg) translateZ(11px);background-image:var(--block-right);filter:brightness(.78)}.hotbarCube3d .blockLeft{transform:rotateY(-90deg) translateZ(11px);background-image:var(--block-left);filter:brightness(.88)}.hotbarCube3d .blockTop{transform:rotateX(90deg) translateZ(11px);background-image:var(--block-top);filter:brightness(1.12)}.hotbarCube3d .blockBottom{transform:rotateX(-90deg) translateZ(11px);background-image:var(--block-bottom);filter:brightness(.62)}
.slotTexture.stairIcon{background-image:none!important;background-size:auto!important;background-position:initial!important;overflow:visible}.slotTexture.stairIcon::before,.slotTexture.stairIcon::after{content:"";position:absolute;display:block;background-image:var(--stair-texture);background-repeat:no-repeat;background-position:center;background-size:100% 100%;image-rendering:pixelated}.slotTexture.stairIcon::before{left:0;right:0;bottom:0;height:58%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.22)}.slotTexture.stairIcon::after{right:0;top:0;width:56%;height:46%;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset -2px 0 0 rgba(0,0,0,.16)}
.slotFallback{position:absolute;inset:6px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;text-shadow:2px 2px 0 #222}
.slotCount{position:absolute;right:3px;bottom:1px;font:bold 14px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none}
body.webminecraft-creative .slotCount,body.webminecraft-creative .hotbarCount{display:none!important}.slotNumber{position:absolute;left:3px;top:1px;font:bold 11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none}
.destroySlot,.offhandSlot{width:64px;height:64px;justify-self:center;display:flex;align-items:center;justify-content:center;font-size:38px;color:#d33;background:#7b4a4a;cursor:pointer}
.destroySlot{color:#ff5a5a}.destroySlot:hover{background:#955252;filter:brightness(1.08)}.offhandSlot{color:#bbb;font-size:13px;cursor:default}
.offhandSlot::after{content:"";position:absolute;inset:10px;border:2px dashed #aaa;opacity:.35}
#inventoryMobileButton{display:none;position:fixed;right:18px;bottom:84px;width:46px;height:46px;z-index:10001;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#777;color:#fff;font-size:22px;box-shadow:0 3px 0 #171717;touch-action:manipulation}
body.mobile-mode.webminecraft-in-world #inventoryMobileButton{display:block;left:calc(50% - min(252px,45vw) - 66px);right:auto;bottom:8px;z-index:10001}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{z-index:10000!important;bottom:8px!important}
#heldBlock{display:none!important;pointer-events:none}
@media(max-width:700px){#inventoryPanel{width:96vw;height:94vh;padding:7px}#catalogGrid{grid-template-columns:repeat(6,minmax(42px,1fr));touch-action:none}#creativeTabs{gap:4px}.inventoryTab{width:42px;height:38px}#catalogToolbar{align-items:flex-start;flex-direction:column;gap:6px}#catalogSearchWrap{width:100%}#catalogViewport{touch-action:none;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;scrollbar-width:auto;scrollbar-color:#58a846 #242424;padding-right:5px;overscroll-behavior-x:none}.catalogSlot{touch-action:none;user-select:none;-webkit-user-select:none;cursor:default}#catalogViewport::-webkit-scrollbar{width:16px}#catalogViewport::-webkit-scrollbar-track{background:#242424;border:2px solid #111;border-radius:2px}#catalogViewport::-webkit-scrollbar-thumb{background:linear-gradient(#74c35a,#3f8f32);border:2px solid #1d4718;box-shadow:inset 1px 1px 0 rgba(255,255,255,.28),inset -1px -1px 0 rgba(0,0,0,.3);border-radius:3px;min-height:48px}#catalogViewport::-webkit-scrollbar-thumb:hover{background:linear-gradient(#86d66a,#4ca83e)}#inventoryBottom{grid-template-columns:54px 1fr 54px;gap:5px}#hotbarInventory{grid-template-columns:repeat(9,minmax(27px,1fr));gap:3px}.destroySlot,.offhandSlot{width:50px;height:50px;font-size:30px}}
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

let mobileCatalogTouchActive = false;
let mobileCatalogTouchMoved = false;
let mobileCatalogTouchY = 0;
let mobileCatalogTouchLastY = 0;
let mobileCatalogIgnoreClickUntil = 0;

function setupMobileCatalogScroll() {
    const viewport = document.getElementById("catalogViewport");
    if (!viewport || viewport.dataset.mobileScrollReady === "1") return;
    viewport.dataset.mobileScrollReady = "1";
    const isMobile = () => document.body.classList.contains("mobile-mode");

    viewport.addEventListener("touchstart", event => {
        if (!isMobile() || event.touches.length !== 1) return;
        const y = event.touches[0].clientY;
        mobileCatalogTouchActive = true;
        mobileCatalogTouchMoved = false;
        mobileCatalogTouchY = y;
        mobileCatalogTouchLastY = y;
    }, { passive: true });

    viewport.addEventListener("touchmove", event => {
        if (!mobileCatalogTouchActive || !isMobile() || event.touches.length !== 1) return;
        const y = event.touches[0].clientY;
        const delta = mobileCatalogTouchLastY - y;
        if (Math.abs(y - mobileCatalogTouchY) > 6) mobileCatalogTouchMoved = true;
        if (!mobileCatalogTouchMoved) {
            mobileCatalogTouchLastY = y;
            return;
        }
        event.preventDefault();
        viewport.scrollTop += delta;
        mobileCatalogTouchLastY = y;
    }, { passive: false });

    const finishTouch = () => {
        if (mobileCatalogTouchMoved) mobileCatalogIgnoreClickUntil = Date.now() + 350;
        mobileCatalogTouchActive = false;
        mobileCatalogTouchMoved = false;
    };
    viewport.addEventListener("touchend", finishTouch, { passive: true });
    viewport.addEventListener("touchcancel", finishTouch, { passive: true });
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
    section.textContent = selectedTab === "search"
        ? "All"
        : (selectedTab === "tools" ? "Tools & Utilities" : (selectedTab === "building" ? "Build Blocks" : "Natural Blocks"));
    if (searchWrap) searchWrap.style.display = selectedTab === "search" || searchQuery ? "flex" : "none";

    const items = itemsForCurrentTab();
    if (!items.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;color:#999;text-align:center;padding:30px 10px;font-size:13px">No items found</div>`;
        return;
    }

    const slotMarkup = item => `<div class="catalogSlot" draggable="true" data-item-id="${item.id}" title="${item.name}">${itemVisual(item)}<span class="catalogName">${item.name}</span></div>`;
    grid.innerHTML = items.map(item => {
        if (!item.group) return slotMarkup(item);
        const primary = getItem(item.primaryId);
        if (!primary) return "";
        const expanded = EXPANDED_CATALOG_GROUPS.has(item.id);
        const groupButton = `<button type="button" class="catalogSlot catalogGroup" data-catalog-group="${item.id}" title="${expanded ? "Collapse" : "Expand"} ${item.label}" aria-expanded="${expanded}">${itemVisual(primary)}<span class="catalogGroupLabel">${item.label}</span><span class="catalogGroupBadge" aria-hidden="true">${expanded ? "−" : "+"}</span></button>`;
        const variants = expanded
            ? item.variants.map(variant => slotMarkup(variant)).join("")
            : "";
        return groupButton + variants;
    }).join("");

    grid.querySelectorAll(".catalogGroup").forEach(cell => {
        cell.addEventListener("click", () => {
            if (document.body.classList.contains("mobile-mode") && Date.now() < mobileCatalogIgnoreClickUntil) return;
            const id = cell.dataset.catalogGroup;
            if (!id) return;
            if (EXPANDED_CATALOG_GROUPS.has(id)) EXPANDED_CATALOG_GROUPS.delete(id);
            else EXPANDED_CATALOG_GROUPS.add(id);
            renderCatalog();
        });
    });

    grid.querySelectorAll(".catalogSlot[data-item-id]").forEach(cell => {
        const itemId = Number(cell.dataset.itemId);
        cell.draggable = !document.body.classList.contains("mobile-mode");
        cell.addEventListener("dragstart", event => {
            if (document.body.classList.contains("mobile-mode")) { event.preventDefault(); return; }
            draggedCatalog = itemId;
            cell.style.opacity = ".45";
            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData("text/plain", String(itemId));
        });
        cell.addEventListener("dragend", () => { draggedCatalog = null; cell.style.opacity = ""; });
        cell.addEventListener("click", () => {
            if (document.body.classList.contains("mobile-mode") && Date.now() < mobileCatalogIgnoreClickUntil) return;
            addItem(itemId, MAX_STACK);
        });
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
            const texture = slot.texture || item.texture;
            const slabClass = isSlabItem(item.id) ? " slabIcon" : "";
            const stairClass = isStairItem(item.id) ? " stairIcon" : "";
            const visualStyle = isStairItem(item.id)
                ? `--stair-texture:url('${textureUrl(texture)}')`
                : `background-image:url('${textureUrl(texture)}')`;
            const visual = texture
                ? `<span class="slotTexture${slabClass}${stairClass}" style="${visualStyle}"></span><span class="slotFallback">${item.name.charAt(0)}</span>`
                : `<span class="slotTexture${slabClass}${stairClass}" style="background:#777"></span>`;
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
            const item = getItem(sourceCatalog);
            inventory[index] = item ? { itemId: sourceCatalog, count: MAX_STACK, texture: item.texture || null } : null;
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
    if (selectedTab === "survival") renderSurvival();
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
        let countEl = slotEl.querySelector(".hotbarCount");
        if (!countEl) { countEl = document.createElement("span"); countEl.className = "hotbarCount"; slotEl.appendChild(countEl); }
        const slot = inventory[index];
        let textureEl = slotEl.querySelector(".hotbarTexture");
        if (slot?.itemId) {
            const item = getItem(slot.itemId);
            const texture = slot.texture || item?.texture || null;
            if (texture) {
                if (!textureEl) {
                    textureEl = document.createElement("span");
                    textureEl.className = "hotbarTexture";
                    slotEl.appendChild(textureEl);
                }
                const slab = isSlabItem(slot.itemId);
                const stair = isStairItem(slot.itemId);
                textureEl.style.imageRendering = "pixelated";
                textureEl.style.position = "absolute";
                textureEl.style.inset = "3px";
                textureEl.style.borderTop = "";
                textureEl.style.boxShadow = "";
                textureEl.style.zIndex = "1";

                if (!slab && !stair && item && Number(slot.itemId) !== 16) {
                    const faces = blockFaceTextures(item);
                    const faceStyle = `--block-front:url('${faces.front}');--block-back:url('${faces.back}');--block-right:url('${faces.right}');--block-left:url('${faces.left}');--block-top:url('${faces.top}');--block-bottom:url('${faces.bottom}')`;
                    textureEl.className = "hotbarTexture hotbarBlock3d";
                    textureEl.style.cssText += `;${faceStyle}`;
                    textureEl.innerHTML = `<span class="hotbarCube3d" style="${faceStyle}"><i class="blockFace blockFront"></i><i class="blockFace blockBack"></i><i class="blockFace blockRight"></i><i class="blockFace blockLeft"></i><i class="blockFace blockTop"></i><i class="blockFace blockBottom"></i></span>`;
                } else {
                    textureEl.className = `hotbarTexture${stair ? " stairIcon" : ""}`;
                    textureEl.innerHTML = "";
                    textureEl.style.backgroundImage = stair ? "none" : `url('${textureUrl(texture)}')`;
                    textureEl.style.backgroundSize = stair ? "auto" : (slab ? "100% 200%" : "100% 100%");
                    textureEl.style.backgroundPosition = slab && !stair ? "center top" : "center";
                    textureEl.style.backgroundRepeat = "no-repeat";
                    if (stair) textureEl.style.setProperty("--stair-texture", `url('${textureUrl(texture)}')`);
                    else textureEl.style.removeProperty("--stair-texture");
                }
            } else if (textureEl) {
                textureEl.remove();
            }
            countEl.textContent = slot.count > 1 ? String(slot.count) : "";
            countEl.style.zIndex = "3";
        } else {
            if (textureEl) textureEl.remove();
            countEl.textContent = "";
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
    const inWorld = document.body.classList.contains("webminecraft-in-world") && !inventoryOpen;
    const slotIndex = Number.isInteger(window.webMinecraftSelectedSlot) ? window.webMinecraftSelectedSlot : 0;
    const item = inventory[slotIndex];
    if (!held3D) return;
    if (!inWorld || !item) { held3D.root.visible = false; return; }
    const info = getItem(item.itemId);
    const textureName = item.texture || info?.texture;
    if (!info || !textureName) { held3D.root.visible = false; return; }
    const texture = loadHeldTexture({ ...info, texture: textureName });
    for (const material of held3D.block.material) { material.map = texture; material.needsUpdate = true; }
    const slab = isSlabItem(item.itemId);
    held3D.block.scale.y = slab ? 0.5 : 1;
    held3D.block.position.y = slab ? 0.115 : 0.26;
    held3D.root.visible = true;
}

export function getSelectedItemId(slotIndex) { return inventory[slotIndex]?.itemId ?? null; }
export function consumeSelected(slotIndex) { return removeItem(slotIndex, 1); }

export function setupInventory(camera) {
    loadInventory();
    createInventoryUI();
    setupMobileCatalogScroll();
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
    window.addEventListener("webminecraft:inventorychanged", () => {
        loadInventory();
        renderInventory();
        renderCatalog();
        renderSurvival();
        updateHeldBlock();
    });
    document.addEventListener("keydown", event => {
        if (document.body.classList.contains("mobile-mode")) return;
        if (event.key.toLowerCase() === "e" && !event.repeat && document.body.classList.contains("webminecraft-in-world")) {
            event.preventDefault();
            inventoryOpen ? closeInventory() : openInventory();
        }
        if (event.key === "Escape" && inventoryOpen && document.body.classList.contains("webminecraft-in-world")) closeInventory();
    });
    const worldObserver = new MutationObserver(() => {
        if (!document.body.classList.contains("webminecraft-in-world") && inventoryOpen) closeInventory();
        updateHeldBlock();
    });
    worldObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

function openInventory() {
    if (!document.body.classList.contains("webminecraft-in-world")) return;
    inventoryOpen = true;
    document.body.classList.add("inventory-open");
    document.getElementById("inventoryScreen")?.classList.add("open");
    document.exitPointerLock?.();
    renderTabs();
    renderInventory();
    renderCatalog();
    renderSurvival();
    updateHeldBlock();
}
function closeInventory() {
    inventoryOpen = false;
    document.body.classList.remove("inventory-open");
    document.getElementById("inventoryScreen")?.classList.remove("open");
    updateHeldBlock();
    if (!document.body.classList.contains("mobile-mode") && document.body.classList.contains("webminecraft-in-world") && !window.__webminecraftHasOpenMenu?.()) {
        try { document.body.requestPointerLock?.(); } catch {}
    }
}
