import * as THREE from "three";

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

function hash(x, y = 0) {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return value - Math.floor(value);
}

function createTexture(baseColor, colors, density = 45, seed = 1) {
    const size = 16;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = baseColor; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < density; i++) {
        const x = Math.floor(hash(i + seed, seed * 3.17) * size);
        const y = Math.floor(hash(i + seed * 7.1, seed * 5.3) * size);
        ctx.fillStyle = colors[i % colors.length]; ctx.fillRect(x, y, 1, 1);
        if (i % 13 === 0) ctx.fillRect((x + 1) % size, y, 1, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const textureCache = new Map();

function loadTexture(path, label = path) {
    if (textureCache.has(path)) return textureCache.get(path);

    const texture = new THREE.TextureLoader().load(
        path,
        loaded => {
            loaded.magFilter = THREE.NearestFilter;
            loaded.minFilter = THREE.NearestFilter;
            loaded.wrapS = THREE.ClampToEdgeWrapping;
            loaded.wrapT = THREE.ClampToEdgeWrapping;
            loaded.colorSpace = THREE.SRGBColorSpace;
            loaded.needsUpdate = true;
        },
        undefined,
        error => {
            console.error(`[WebMinecraftT] Failed to load texture: ${label}`, error);
            textureCache.delete(path);
        }
    );

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    textureCache.set(path, texture);
    return texture;
}

const texturePath = (file) => `${import.meta.env.BASE_URL}textures/${encodeURIComponent(file)}`;

const grassTopTexture = loadTexture(texturePath("Grass_Block_(top_texture)_JE2.png"));
const grassSideTexture = loadTexture(texturePath("grass_block_side.png"));
const dirtTexture = loadTexture(texturePath("dirt.png"));
const oakSideTexture = loadTexture(texturePath("oak_log.png"));
const oakTopTexture = loadTexture(texturePath("oak_log_top.png"));
const stoneTexture = loadTexture(texturePath("stone.png"));
const cobblestoneTexture = loadTexture(texturePath("cobblestone.png"), "cobblestone");
const gravelTexture = loadTexture(texturePath("gravel.png"), "gravel");
const sandTexture = loadTexture(texturePath("sand.png"), "sand");
const sandstoneTexture = loadTexture(texturePath("sandstone.png"), "sandstone");
const sandstoneTopTexture = loadTexture(texturePath("sandstone_top.png"), "sandstone top");
const sandstoneBottomTexture = loadTexture(texturePath("sandstone_bottom.png"), "sandstone bottom");
const bedrockTexture = loadTexture(texturePath("bedrock.png"), "bedrock");
const coalTexture = loadTexture(texturePath("coal_ore.png"), "coal ore");
const ironTexture = loadTexture(texturePath("iron_ore.png"), "iron ore");
const oakPlankTexture = loadTexture(texturePath("oak_planks.png"), "oak planks");
const leavesTexture = loadTexture(texturePath("oak-leaves-normal-original-default.png"));
const snowTexture = loadTexture(texturePath("snow.png"), "snow");
const tntBottomTexture = loadTexture(texturePath("tnt_bottom.png"), "TNT bottom");
const tntSideTexture = loadTexture(texturePath("tnt_side.png"), "TNT side");
const tntTopTexture = loadTexture(texturePath("tnt_top.png"), "TNT top");
const bricksTexture = loadTexture(texturePath("bricks.png"), "bricks");
const stoneBricksTexture = loadTexture(texturePath("stone_bricks.png"), "stone bricks");
const crackedStoneBricksTexture = loadTexture(texturePath("cracked_stone_bricks.png"), "cracked stone bricks");
const mossyStoneBricksTexture = loadTexture(texturePath("mossy_stone_bricks.png"), "mossy stone bricks");
const dirtPathSideTexture = loadTexture(texturePath("dirt_path_side.png"), "dirt path side");
const dirtPathTopTexture = loadTexture(texturePath("dirt_path_top.png"), "dirt path top");
const waterTexture = loadTexture(texturePath("Water_(texture)_JE4.png"), "Water texture");

const acaciaPlanksTexture = loadTexture(texturePath("acacia_planks.png"), "acacia planks");
const bambooPlanksTexture = loadTexture(texturePath("bamboo_planks.png"), "bamboo planks");
const birchPlanksTexture = loadTexture(texturePath("birch_planks.png"), "birch planks");
const crimsonPlanksTexture = loadTexture(texturePath("crimson_planks.png"), "crimson planks");
const darkOakPlanksTexture = loadTexture(texturePath("dark_oak_planks.png"), "dark oak planks");
const junglePlanksTexture = loadTexture(texturePath("jungle_planks.png"), "jungle planks");
const mangrovePlanksTexture = loadTexture(texturePath("mangrove_planks.png"), "mangrove planks");
const sprucePlanksTexture = loadTexture(texturePath("spruce_planks.png"), "spruce planks");
const warpedPlanksTexture = loadTexture(texturePath("warped_planks.png"), "warped planks");

const blastFurnaceFrontTexture = loadTexture(texturePath("blast_furnace_front.png"), "blast furnace front");
const blastFurnaceSideTexture = loadTexture(texturePath("blast_furnace_side.png"), "blast furnace side");
const blastFurnaceTopTexture = loadTexture(texturePath("blast_furnace_top.png"), "blast furnace top");
const furnaceFrontTexture = loadTexture(texturePath("furnace_front.png"), "furnace front");
const furnaceSideTexture = loadTexture(texturePath("furnace_side.png"), "furnace side");
const furnaceTopTexture = loadTexture(texturePath("furnace_top.png"), "furnace top");

const chiseledDeepslateTexture = loadTexture(texturePath("chiseled_deepslate.png"), "chiseled deepslate");
const cobbledDeepslateTexture = loadTexture(texturePath("cobbled_deepslate.png"), "cobbled deepslate");
const crackedDeepslateBricksTexture = loadTexture(texturePath("cracked_deepslate_bricks.png"), "cracked deepslate bricks");
const crackedDeepslateTilesTexture = loadTexture(texturePath("cracked_deepslate_tiles.png"), "cracked deepslate tiles");
const deepslateTexture = loadTexture(texturePath("deepslate.png"), "deepslate");
const deepslateTopTexture = loadTexture(texturePath("deepslate_top.png"), "deepslate top");
const deepslateBricksTexture = loadTexture(texturePath("deepslate_bricks.png"), "deepslate bricks");
const deepslateCoalOreTexture = loadTexture(texturePath("deepslate_coal_ore.png"), "deepslate coal ore");
const deepslateCopperOreTexture = loadTexture(texturePath("deepslate_copper_ore.png"), "deepslate copper ore");
const deepslateDiamondOreTexture = loadTexture(texturePath("deepslate_diamond_ore.png"), "deepslate diamond ore");
const deepslateEmeraldOreTexture = loadTexture(texturePath("deepslate_emerald_ore.png"), "deepslate emerald ore");
const deepslateGoldOreTexture = loadTexture(texturePath("deepslate_gold_ore.png"), "deepslate gold ore");
const deepslateIronOreTexture = loadTexture(texturePath("deepslate_iron_ore.png"), "deepslate iron ore");
const deepslateLapisOreTexture = loadTexture(texturePath("deepslate_lapis_ore.png"), "deepslate lapis ore");
const deepslateRedstoneOreTexture = loadTexture(texturePath("deepslate_redstone_ore.png"), "deepslate redstone ore");
const deepslateTilesTexture = loadTexture(texturePath("deepslate_tiles.png"), "deepslate tiles");
const polishedDeepslateTexture = loadTexture(texturePath("polished_deepslate.png"), "polished deepslate");
const reinforcedDeepslateBottomTexture = loadTexture(texturePath("reinforced_deepslate_bottom.png"), "reinforced deepslate bottom");
const reinforcedDeepslateSideTexture = loadTexture(texturePath("reinforced_deepslate_side.png"), "reinforced deepslate side");
const reinforcedDeepslateTopTexture = loadTexture(texturePath("reinforced_deepslate_top.png"), "reinforced deepslate top");

// Keep the darker block palette while adding a small material floor so textures
// never become completely black when underground lighting gets very low.
const textureShade = 0xd8d8d8;
const grassTextureShade = 0x858585;
const textureEmissive = 0x2a2a2a;
const textureEmissiveIntensity = 0.32;
const materialOptions = {
    vertexColors: true,
    emissive: textureEmissive,
    emissiveIntensity: textureEmissiveIntensity
};

const grassTopMaterial = new THREE.MeshPhongMaterial({ map: grassTopTexture, color: grassTextureShade, ...materialOptions });
const grassSideMaterial = new THREE.MeshPhongMaterial({ map: grassSideTexture, color: grassTextureShade, ...materialOptions });
const dirtMaterial = new THREE.MeshPhongMaterial({ map: dirtTexture, color: grassTextureShade, ...materialOptions });
const stoneMaterial = new THREE.MeshPhongMaterial({ map: stoneTexture, color: textureShade, ...materialOptions });
const cobblestoneMaterial = new THREE.MeshPhongMaterial({ map: cobblestoneTexture, color: textureShade, ...materialOptions });
const gravelMaterial = new THREE.MeshPhongMaterial({ map: gravelTexture, color: textureShade, ...materialOptions });
const sandMaterial = new THREE.MeshPhongMaterial({ map: sandTexture, color: textureShade, ...materialOptions });
const sandstoneSideMaterial = new THREE.MeshPhongMaterial({ map: sandstoneTexture, color: textureShade, ...materialOptions });
const sandstoneTopMaterial = new THREE.MeshPhongMaterial({ map: sandstoneTopTexture, color: textureShade, ...materialOptions });
const sandstoneBottomMaterial = new THREE.MeshPhongMaterial({ map: sandstoneBottomTexture, color: textureShade, ...materialOptions });
const sandstoneMaterial = [sandstoneSideMaterial, sandstoneSideMaterial, sandstoneTopMaterial, sandstoneBottomMaterial, sandstoneSideMaterial, sandstoneSideMaterial];
const bedrockMaterial = new THREE.MeshPhongMaterial({ map: bedrockTexture, color: textureShade, ...materialOptions });
const coalMaterial = new THREE.MeshPhongMaterial({ map: coalTexture, color: textureShade, ...materialOptions });
const ironMaterial = new THREE.MeshPhongMaterial({ map: ironTexture, color: textureShade, ...materialOptions });
const oakSideMaterial = new THREE.MeshPhongMaterial({ map: oakSideTexture, color: textureShade, ...materialOptions });
const oakTopMaterial = new THREE.MeshPhongMaterial({ map: oakTopTexture, color: textureShade, ...materialOptions });
const oakPlankMaterial = new THREE.MeshPhongMaterial({ map: oakPlankTexture, color: textureShade, ...materialOptions });
const bricksMaterial = new THREE.MeshPhongMaterial({ map: bricksTexture, color: textureShade, ...materialOptions });
const stoneBricksMaterial = new THREE.MeshPhongMaterial({ map: stoneBricksTexture, color: textureShade, ...materialOptions });
const crackedStoneBricksMaterial = new THREE.MeshPhongMaterial({ map: crackedStoneBricksTexture, color: textureShade, ...materialOptions });
const mossyStoneBricksMaterial = new THREE.MeshPhongMaterial({ map: mossyStoneBricksTexture, color: textureShade, ...materialOptions });
const dirtPathSideMaterial = new THREE.MeshPhongMaterial({ map: dirtPathSideTexture, color: textureShade, ...materialOptions });
const dirtPathTopMaterial = new THREE.MeshPhongMaterial({ map: dirtPathTopTexture, color: textureShade, ...materialOptions });

const acaciaPlanksMaterial = new THREE.MeshPhongMaterial({ map: acaciaPlanksTexture, color: textureShade, ...materialOptions });
const bambooPlanksMaterial = new THREE.MeshPhongMaterial({ map: bambooPlanksTexture, color: textureShade, ...materialOptions });
const birchPlanksMaterial = new THREE.MeshPhongMaterial({ map: birchPlanksTexture, color: textureShade, ...materialOptions });
const crimsonPlanksMaterial = new THREE.MeshPhongMaterial({ map: crimsonPlanksTexture, color: textureShade, ...materialOptions });
const darkOakPlanksMaterial = new THREE.MeshPhongMaterial({ map: darkOakPlanksTexture, color: textureShade, ...materialOptions });
const junglePlanksMaterial = new THREE.MeshPhongMaterial({ map: junglePlanksTexture, color: textureShade, ...materialOptions });
const mangrovePlanksMaterial = new THREE.MeshPhongMaterial({ map: mangrovePlanksTexture, color: textureShade, ...materialOptions });
const sprucePlanksMaterial = new THREE.MeshPhongMaterial({ map: sprucePlanksTexture, color: textureShade, ...materialOptions });
const warpedPlanksMaterial = new THREE.MeshPhongMaterial({ map: warpedPlanksTexture, color: textureShade, ...materialOptions });

const furnaceFrontMaterial = new THREE.MeshPhongMaterial({ map: furnaceFrontTexture, color: textureShade, ...materialOptions });
const blastFurnaceFrontMaterial = new THREE.MeshPhongMaterial({ map: blastFurnaceFrontTexture, color: textureShade, ...materialOptions });
const blastFurnaceSideMaterial = new THREE.MeshPhongMaterial({ map: blastFurnaceSideTexture, color: textureShade, ...materialOptions });
const blastFurnaceTopMaterial = new THREE.MeshPhongMaterial({ map: blastFurnaceTopTexture, color: textureShade, ...materialOptions });
const blastFurnaceMaterial = [
    blastFurnaceSideMaterial, blastFurnaceSideMaterial, blastFurnaceTopMaterial,
    blastFurnaceSideMaterial, blastFurnaceFrontMaterial, blastFurnaceSideMaterial
];

const furnaceSideMaterial = new THREE.MeshPhongMaterial({ map: furnaceSideTexture, color: textureShade, ...materialOptions });
const furnaceTopMaterial = new THREE.MeshPhongMaterial({ map: furnaceTopTexture, color: textureShade, ...materialOptions });
const furnaceMaterial = [
    furnaceSideMaterial, furnaceSideMaterial, furnaceTopMaterial,
    furnaceSideMaterial, furnaceFrontMaterial, furnaceSideMaterial
];

const chiseledDeepslateMaterial = new THREE.MeshPhongMaterial({ map: chiseledDeepslateTexture, color: textureShade, ...materialOptions });
const cobbledDeepslateMaterial = new THREE.MeshPhongMaterial({ map: cobbledDeepslateTexture, color: textureShade, ...materialOptions });
const crackedDeepslateBricksMaterial = new THREE.MeshPhongMaterial({ map: crackedDeepslateBricksTexture, color: textureShade, ...materialOptions });
const crackedDeepslateTilesMaterial = new THREE.MeshPhongMaterial({ map: crackedDeepslateTilesTexture, color: textureShade, ...materialOptions });
const deepslateMaterial = [new THREE.MeshPhongMaterial({ map: deepslateTexture, color: textureShade, ...materialOptions }), new THREE.MeshPhongMaterial({ map: deepslateTopTexture, color: textureShade, ...materialOptions })];
const deepslateBricksMaterial = new THREE.MeshPhongMaterial({ map: deepslateBricksTexture, color: textureShade, ...materialOptions });
const deepslateCoalOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateCoalOreTexture, color: textureShade, ...materialOptions });
const deepslateCopperOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateCopperOreTexture, color: textureShade, ...materialOptions });
const deepslateDiamondOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateDiamondOreTexture, color: textureShade, ...materialOptions });
const deepslateEmeraldOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateEmeraldOreTexture, color: textureShade, ...materialOptions });
const deepslateGoldOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateGoldOreTexture, color: textureShade, ...materialOptions });
const deepslateIronOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateIronOreTexture, color: textureShade, ...materialOptions });
const deepslateLapisOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateLapisOreTexture, color: textureShade, ...materialOptions });
const deepslateRedstoneOreMaterial = new THREE.MeshPhongMaterial({ map: deepslateRedstoneOreTexture, color: textureShade, ...materialOptions });
const deepslateTilesMaterial = new THREE.MeshPhongMaterial({ map: deepslateTilesTexture, color: textureShade, ...materialOptions });
const polishedDeepslateMaterial = new THREE.MeshPhongMaterial({ map: polishedDeepslateTexture, color: textureShade, ...materialOptions });
const reinforcedDeepslateMaterial = [
    new THREE.MeshPhongMaterial({ map: reinforcedDeepslateSideTexture, color: textureShade, ...materialOptions }),
    new THREE.MeshPhongMaterial({ map: reinforcedDeepslateTopTexture, color: textureShade, ...materialOptions }),
    new THREE.MeshPhongMaterial({ map: reinforcedDeepslateBottomTexture, color: textureShade, ...materialOptions })
];


const extraBlockMaterials = {};

function makeExtraBlockMaterial(textureName) {
    return new THREE.MeshPhongMaterial({
        map: loadTexture(texturePath(textureName), textureName),
        color: textureShade,
        ...materialOptions
    });
}

function addExtraBlock(id, sideTexture, topTexture = sideTexture, bottomTexture = sideTexture, frontTexture = sideTexture) {
    extraBlockMaterials[id] = [
        makeExtraBlockMaterial(sideTexture),
        makeExtraBlockMaterial(sideTexture),
        makeExtraBlockMaterial(topTexture),
        makeExtraBlockMaterial(bottomTexture),
        makeExtraBlockMaterial(frontTexture),
        makeExtraBlockMaterial(sideTexture)
    ];
}

addExtraBlock(155, "acacia_log.png", "acacia_log_top.png");
addExtraBlock(156, "birch_log.png", "birch_log_top.png");
addExtraBlock(157, "dark_oak_log.png", "dark_oak_log_top.png");
addExtraBlock(158, "jungle_log.png", "jungle_log_top.png");
addExtraBlock(159, "mangrove_log.png", "mangrove_log_top.png");
addExtraBlock(160, "spruce_log.png", "spruce_log_top.png");

addExtraBlock(161, "stripped_oak_log.png", "stripped_oak_log_top.png");
addExtraBlock(162, "stripped_acacia_log.png", "stripped_acacia_log_top.png");
addExtraBlock(163, "stripped_birch_log.png", "stripped_birch_log_top.png");
addExtraBlock(164, "stripped_dark_oak_log.png", "stripped_dark_oak_log_top.png");
addExtraBlock(165, "stripped_jungle_log.png", "stripped_jungle_log_top.png");
addExtraBlock(166, "stripped_mangrove_log.png", "stripped_mangrove_log_top.png");
addExtraBlock(167, "stripped_spruce_log.png", "stripped_spruce_log_top.png");

addExtraBlock(168, "crafting_table_side.png", "crafting_table_top.png", "crafting_table_side.png", "crafting_table_front.png");

const concreteTextures = {
    169: "black_concrete.png", 170: "blue_concrete.png", 171: "brown_concrete.png", 172: "cyan_concrete.png",
    173: "gray_concrete.png", 174: "green_concrete.png", 175: "light_blue_concrete.png", 176: "light_gray_concrete.png",
    177: "lime_concrete.png", 178: "magenta_concrete.png", 179: "orange_concrete.png", 180: "pink_concrete.png",
    181: "purple_concrete.png", 182: "red_concrete.png", 183: "white_concrete.png", 184: "yellow_concrete.png"
};
for (const [id, texture] of Object.entries(concreteTextures)) addExtraBlock(Number(id), texture);


const leavesMaterial = new THREE.MeshPhongMaterial({
    map: leavesTexture, transparent: false, opacity: 1, alphaTest: 0.1,
    depthWrite: true, depthTest: true, side: THREE.DoubleSide,
    vertexColors: true, color: textureShade,
    emissive: textureEmissive, emissiveIntensity: textureEmissiveIntensity
});

const snowMaterial = new THREE.MeshPhongMaterial({ map: snowTexture, color: textureShade, ...materialOptions });
const tntSideMaterial = new THREE.MeshPhongMaterial({ map: tntSideTexture, color: textureShade, ...materialOptions });
const tntTopMaterial = new THREE.MeshPhongMaterial({ map: tntTopTexture, color: textureShade, ...materialOptions });
const tntBottomMaterial = new THREE.MeshPhongMaterial({ map: tntBottomTexture, color: textureShade, ...materialOptions });

const waterMaterial = new THREE.MeshPhongMaterial({
    map: waterTexture,
    color: 0x3c8fc0,
    transparent: true,
    opacity: 0.76,
    depthWrite: false,
    side: THREE.DoubleSide,
    emissive: 0x0b2432,
    emissiveIntensity: 0.18
});

const grassMaterial = [grassSideMaterial, grassSideMaterial, grassTopMaterial, dirtMaterial, grassSideMaterial, grassSideMaterial];
const oakLogMaterial = [oakSideMaterial, oakSideMaterial, oakTopMaterial, oakTopMaterial, oakSideMaterial, oakSideMaterial];
const tntMaterial = [tntSideMaterial, tntSideMaterial, tntTopMaterial, tntBottomMaterial, tntSideMaterial, tntSideMaterial];
const dirtPathMaterial = [dirtPathSideMaterial, dirtPathSideMaterial, dirtPathTopMaterial, dirtPathSideMaterial, dirtPathSideMaterial, dirtPathSideMaterial];

function createBlock(scene, x, y, z, material) {
    const block = new THREE.Mesh(blockGeometry, material);
    block.position.set(x, y, z); block.matrixAutoUpdate = true; scene.add(block);
    return block;
}

export {
    blockGeometry, grassMaterial, dirtMaterial, stoneMaterial, cobblestoneMaterial,
    gravelMaterial, sandMaterial, sandstoneMaterial, sandstoneSideMaterial, sandstoneTopMaterial, sandstoneBottomMaterial, bedrockMaterial, coalMaterial,
    ironMaterial, oakLogMaterial, oakPlankMaterial, leavesMaterial, snowMaterial,
    tntSideMaterial, tntTopMaterial, tntBottomMaterial, tntMaterial,
    bricksMaterial, bricksTexture, stoneBricksMaterial, crackedStoneBricksMaterial, mossyStoneBricksMaterial, dirtPathMaterial,
    acaciaPlanksMaterial, bambooPlanksMaterial, birchPlanksMaterial, crimsonPlanksMaterial, darkOakPlanksMaterial,
    junglePlanksMaterial, mangrovePlanksMaterial, sprucePlanksMaterial, warpedPlanksMaterial,
    blastFurnaceMaterial, furnaceMaterial, chiseledDeepslateMaterial, cobbledDeepslateMaterial,
    crackedDeepslateBricksMaterial, crackedDeepslateTilesMaterial, deepslateMaterial, deepslateBricksMaterial,
    deepslateCoalOreMaterial, deepslateCopperOreMaterial, deepslateDiamondOreMaterial, deepslateEmeraldOreMaterial,
    deepslateGoldOreMaterial, deepslateIronOreMaterial, deepslateLapisOreMaterial, deepslateRedstoneOreMaterial,
    deepslateTilesMaterial, polishedDeepslateMaterial, reinforcedDeepslateMaterial, extraBlockMaterials,
    stoneBricksTexture, crackedStoneBricksTexture, mossyStoneBricksTexture, dirtPathSideTexture, dirtPathTopTexture,
    waterMaterial, waterTexture, createBlock
};
