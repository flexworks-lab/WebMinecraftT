import * as THREE from "three";

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

// Create a pixel-style texture
function createTexture(baseColor, pixelColor) {

    const size = 16;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    // Base
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Random pixels
    ctx.fillStyle = pixelColor;

    for (let i = 0; i < 35; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);

        ctx.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    return texture;
}

// Grass
const grassTexture = createTexture(
    "#55aa33",
    "#3d8525"
);

// Dirt
const dirtTexture = createTexture(
    "#8b5a2b",
    "#70451f"
);

// Stone
const stoneTexture = createTexture(
    "#888888",
    "#666666"
);

const grassMaterial = new THREE.MeshLambertMaterial({
    map: grassTexture
});

const dirtMaterial = new THREE.MeshLambertMaterial({
    map: dirtTexture
});

const stoneMaterial = new THREE.MeshLambertMaterial({
    map: stoneTexture
});

function createBlock(scene, x, y, z, material) {

    const block = new THREE.Mesh(
        blockGeometry,
        material
    );

    block.position.set(x, y, z);

    scene.add(block);

    return block;
}

export {
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    createBlock
};