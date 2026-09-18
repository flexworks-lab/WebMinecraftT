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

function loadTexture(path, label = path) {
    const texture = new THREE.TextureLoader().load(
        path,
        loaded => { loaded.needsUpdate = true; },
        undefined,
        error => { console.error(`[WebMinecraftT] Failed to load texture: ${label}`, error); }
    );
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
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
    stoneBricksTexture, crackedStoneBricksTexture, mossyStoneBricksTexture, dirtPathSideTexture, dirtPathTopTexture, waterMaterial, waterTexture, createBlock
};
