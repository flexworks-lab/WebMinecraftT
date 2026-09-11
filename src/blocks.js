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

function loadTexture(path) {
    const texture = new THREE.TextureLoader().load(path);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const texturePath = (file) => `${import.meta.env.BASE_URL}textures/${encodeURIComponent(file)}`;

const grassTopTexture = loadTexture(texturePath("Grass_Block_(top_texture)_JE2.png"));
const grassSideTexture = loadTexture(texturePath("grass_block_side.png"));
const dirtTexture = loadTexture(texturePath("dirt.png"));
const oakSideTexture = loadTexture(texturePath("oak_log.png"));
const oakTopTexture = loadTexture(texturePath("oak_log_top.png"));
const stoneTexture = loadTexture(texturePath("stone.png"));
const cobblestoneTexture = createTexture("#555555", ["#454545", "#686868", "#3f3f3f", "#737373"], 75, 18);
const gravelTexture = createTexture("#74716a", ["#5e5b54", "#858178", "#626057", "#918d82"], 80, 19);
const sandTexture = createTexture("#b9a568", ["#a89155", "#c9b77a", "#9d864c", "#d0c18b"], 54, 14);
const sandstoneTexture = createTexture("#a9966a", ["#988455", "#b9a878", "#8f7b49", "#c5b58a"], 42, 20);
const bedrockTexture = createTexture("#282828", ["#1e1e1e", "#3d3d3d", "#181818", "#484848"], 80, 21);
const coalTexture = createTexture("#444444", ["#111111", "#202020", "#5c5c5c", "#090909"], 72, 22);
const ironTexture = createTexture("#706d68", ["#a7a39d", "#595650", "#908b84", "#4e4b47"], 68, 23);
const oakPlankTexture = createTexture("#80582f", ["#6d4828", "#98663a", "#5e3d23", "#aa7645"], 34, 24);
const leavesTexture = loadTexture(texturePath("oak-leaves-normal-original-default.png"));
const snowTexture = createTexture("#cbd6da", ["#c0ccd1", "#e3e9eb", "#adbcc2", "#d6e1e5"], 34, 25);
const tntBottomTexture = loadTexture(texturePath("tnt_bottom.png"));
const tntSideTexture = loadTexture(texturePath("tnt_side.png"));
const tntTopTexture = loadTexture(texturePath("tnt_top.png"));
const waterTexture = createTexture("#2b78aa", ["#1e628f", "#3f91c0", "#6bb9dc", "#245f86"], 30, 26);

// Keep blocks at their normal texture brightness outside of water.
// Underwater darkening is handled by the water/underwater rendering instead.
const grassTopMaterial = new THREE.MeshLambertMaterial({ map: grassTopTexture, vertexColors: true, color: 0xffffff });
const grassSideMaterial = new THREE.MeshLambertMaterial({ map: grassSideTexture, vertexColors: true, color: 0xffffff });
const dirtMaterial = new THREE.MeshLambertMaterial({ map: dirtTexture, vertexColors: true, color: 0xffffff });
const stoneMaterial = new THREE.MeshLambertMaterial({ map: stoneTexture, vertexColors: true, color: 0xffffff });
const cobblestoneMaterial = new THREE.MeshLambertMaterial({ map: cobblestoneTexture, vertexColors: true, color: 0xffffff });
const gravelMaterial = new THREE.MeshLambertMaterial({ map: gravelTexture, vertexColors: true, color: 0xffffff });
const sandMaterial = new THREE.MeshLambertMaterial({ map: sandTexture, vertexColors: true, color: 0xffffff });
const sandstoneMaterial = new THREE.MeshLambertMaterial({ map: sandstoneTexture, vertexColors: true, color: 0xffffff });
const bedrockMaterial = new THREE.MeshLambertMaterial({ map: bedrockTexture, vertexColors: true, color: 0xffffff });
const coalMaterial = new THREE.MeshLambertMaterial({ map: coalTexture, vertexColors: true, color: 0xffffff });
const ironMaterial = new THREE.MeshLambertMaterial({ map: ironTexture, vertexColors: true, color: 0xffffff });
const oakSideMaterial = new THREE.MeshLambertMaterial({ map: oakSideTexture, vertexColors: true, color: 0xffffff });
const oakTopMaterial = new THREE.MeshLambertMaterial({ map: oakTopTexture, vertexColors: true, color: 0xffffff });
const oakPlankMaterial = new THREE.MeshLambertMaterial({ map: oakPlankTexture, vertexColors: true, color: 0xffffff });

const leavesMaterial = new THREE.MeshLambertMaterial({
    map: leavesTexture,
    transparent: false,
    opacity: 1,
    alphaTest: 0.1,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    vertexColors: true,
    color: 0xffffff
});

const snowMaterial = new THREE.MeshLambertMaterial({ map: snowTexture, vertexColors: true, color: 0xffffff });
const tntSideMaterial = new THREE.MeshLambertMaterial({ map: tntSideTexture, vertexColors: true, color: 0xffffff });
const tntTopMaterial = new THREE.MeshLambertMaterial({ map: tntTopTexture, vertexColors: true, color: 0xffffff });
const tntBottomMaterial = new THREE.MeshLambertMaterial({ map: tntBottomTexture, vertexColors: true, color: 0xffffff });
const tntMaterial = [tntSideMaterial, tntSideMaterial, tntTopMaterial, tntBottomMaterial, tntSideMaterial, tntSideMaterial];
const waterMaterial = new THREE.MeshLambertMaterial({
    map: waterTexture,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    side: THREE.DoubleSide
});

const grassMaterial = [grassSideMaterial, grassSideMaterial, grassTopMaterial, dirtMaterial, grassSideMaterial, grassSideMaterial];
const oakLogMaterial = [oakSideMaterial, oakSideMaterial, oakTopMaterial, oakTopMaterial, oakSideMaterial, oakSideMaterial];

function createBlock(scene, x, y, z, material) {
    const block = new THREE.Mesh(blockGeometry, material);
    block.position.set(x, y, z); block.matrixAutoUpdate = true; scene.add(block);
    return block;
}

export {
    blockGeometry, grassMaterial, dirtMaterial, stoneMaterial, cobblestoneMaterial,
    gravelMaterial, sandMaterial, sandstoneMaterial, bedrockMaterial, coalMaterial,
    ironMaterial, oakLogMaterial, oakPlankMaterial, leavesMaterial, snowMaterial,
    tntMaterial, waterMaterial, waterTexture, createBlock
};
