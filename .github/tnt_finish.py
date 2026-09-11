from pathlib import Path


def patch(path, replacements):
    p = Path(path)
    s = p.read_text()
    for old, new in replacements:
        if old not in s:
            raise SystemExit(f"Pattern not found in {path}: {old[:120]!r}")
        s = s.replace(old, new, 1)
    p.write_text(s)

patch("src/world.js", [
    (
        'leavesMaterial, snowMaterial\n} from "./blocks.js";',
        'leavesMaterial, snowMaterial, tntMaterial\n} from "./blocks.js";'
    ),
    (
        'OAK_PLANKS: 13, SNOW: 14\n};',
        'OAK_PLANKS: 13, SNOW: 14, TNT: 15\n};'
    ),
    (
        'coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial\n];',
        'coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial, tntMaterial\n];'
    ),
    (
        'case BLOCK.SNOW: return 15;\n        default:',
        'case BLOCK.SNOW: return 15;\n        case BLOCK.TNT: return 16;\n        default:'
    )
])

patch("src/inventory.js", [
    (
        '{ id: 6, name: "Leaves", texture: "oak-leaves-normal-original-default.png" },\n    { id: 7, name: "Cobblestone", texture: "stone.png" },',
        '{ id: 6, name: "Leaves", texture: "oak-leaves-normal-original-default.png" },\n    { id: 15, name: "TNT", texture: "tnt_side.png" },\n    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png" },\n    { id: 7, name: "Cobblestone", texture: "stone.png" },'
    ),
    (
        'function loadInventory() {\n    try {\n        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));\n        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) inventory = saved;\n        else ensureInitialItems();\n    } catch { ensureInitialItems(); }\n}',
        '''function loadInventory() {
    let freshInventory = false;
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));
        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) inventory = saved;
        else { ensureInitialItems(); freshInventory = true; }
    } catch { ensureInitialItems(); freshInventory = true; }
    const migrationKey = "webminecraft_tnt_items_v1";
    if (localStorage.getItem(migrationKey) !== "1") {
        if (!freshInventory) {
            addItem(15, 64);
            addItem(16, 64);
        }
        try { localStorage.setItem(migrationKey, "1"); } catch {}
        saveInventory();
    }
}'''
    )
])

patch("src/interaction.js", [
    (
        'import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";\n',
        'import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";\nimport { tryIgniteTNT } from "./tnt.js";\n'
    ),
    (
        '"oak_log_top.png", "oak-leaves-normal-original-default.png",\n        "Grass_Block_(top_texture)_JE2.png", "dirt.png", "stone.png"',
        '"oak_log_top.png", "oak-leaves-normal-original-default.png",\n        "tnt_side.png", "Flint_and_Steel_JE4_BE2.png", "stone.png"'
    ),
    (
        '    function placeBlock() {\n        const itemId = getSelectedItemId(selectedSlot);\n        if (!itemId) return;\n        const target = getTargetBlock(scene, camera, BLOCK);',
        '    function placeBlock() {\n        const itemId = getSelectedItemId(selectedSlot);\n        if (!itemId) return;\n        if (tryIgniteTNT(scene, camera, itemId)) {\n            if (consumeSelected(selectedSlot)) sendPlayerAction("place");\n            return;\n        }\n        const target = getTargetBlock(scene, camera, BLOCK);'
    ),
    (
        '    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;\n    return 0xb0b0b0;',
        '    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;\n    if (blockType === BLOCK.TNT) return 0xd33a2c;\n    return 0xb0b0b0;'
    )
])
