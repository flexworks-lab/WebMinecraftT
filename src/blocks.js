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

// GitHub Pages / Vite compatible asset paths.
const texturePath = (file) => new URL(`textures/${encodeURIComponent(file)}`, document.baseURI).href;

const grassTopTexture = loadTexture(texturePath("Grass_Block_(top_texture)_JE2.png"));
const grassSideTexture = loadTexture(texturePath("grass_block_side.png"));
const dirtTexture = loadTexture(texturePath("dirt.png"));
const oakSideTexture = loadTexture(texturePath("oak_log.png"));
const oakTopTexture = loadTexture(texturePath("oak_log_top.png"));
const stoneTexture = loadTexture(texturePath("stone.png"));
const cobblestoneTexture = createTexture("#666666", ["#555555", "#7b7b7b", "#4d4d4d", "#898989"], 75, 18);
const gravelTexture = createTexture("#88847a", ["#6f6b62", "#9d988c", "#747066", "#aba69a"], 80, 19);
const sandTexture = createTexture("#d8c07b", ["#c5aa64", "#e5d18f", "#b99f58", "#eddc9c"], 54, 14);
const sandstoneTexture = createTexture("#c7ae72", ["#b4985a", "#ddc790", "#ad8f51", "#ead59d"], 42, 20);
const bedrockTexture = createTexture("#303030", ["#242424", "#494949", "#1d1d1d", "#555555"], 80, 21);
const coalTexture = createTexture("#535353", ["#151515", "#252525", "#707070", "#0c0c0c"], 72, 22);
const ironTexture = createTexture("#88827b", ["#c0bbb3", "#6c6762", "#a7a098", "#5d5955"], 68, 23);
const oakPlankTexture = createTexture("#9b6a3b", ["#83562e", "#b67c45", "#744b28", "#c58d54"], 34, 24);
const leavesTexture = createTexture("#3c8c2e", ["#2d7525", "#55a63a", "#347d28", "#6bb949", "#24661f"], 72, 17);
const snowTexture = createTexture("#e8f1f4", ["#d6e2e7", "#ffffff", "#c3d3da", "#eef7fa"], 34, 25);
const waterTexture = createTexture("#3b83b5", ["#2f709d", "#66add4", "#327da9", "#83c6e3"], 24, 26);

const grassTopMaterial = new THREE.MeshLambertMaterial({ map: grassTopTexture });
const grassSideMaterial = new THREE.MeshLambertMaterial({ map: grassSideTexture });
const dirtMaterial = new THREE.MeshLambertMaterial({ map: dirtTexture });
const stoneMaterial = new THREE.MeshLambertMaterial({ map: stoneTexture });
const cobblestoneMaterial = new THREE.MeshLambertMaterial({ map: cobblestoneTexture });
const gravelMaterial = new THREE.MeshLambertMaterial({ map: gravelTexture });
const sandMaterial = new THREE.MeshLambertMaterial({ map: sandTexture });
const sandstoneMaterial = new THREE.MeshLambertMaterial({ map: sandstoneTexture });
const bedrockMaterial = new THREE.MeshLambertMaterial({ map: bedrockTexture });
const coalMaterial = new THREE.MeshLambertMaterial({ map: coalTexture });
const ironMaterial = new THREE.MeshLambertMaterial({ map: ironTexture });
const oakSideMaterial = new THREE.MeshLambertMaterial({ map: oakSideTexture });
const oakTopMaterial = new THREE.MeshLambertMaterial({ map: oakTopTexture });
const oakPlankMaterial = new THREE.MeshLambertMaterial({ map: oakPlankTexture });
const leavesMaterial = new THREE.MeshLambertMaterial({ map: leavesTexture });
const snowMaterial = new THREE.MeshLambertMaterial({ map: snowTexture });
const waterMaterial = new THREE.MeshLambertMaterial({ map: waterTexture, transparent: true, opacity: 0.62, depthWrite: false });

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
    waterMaterial, createBlock
};