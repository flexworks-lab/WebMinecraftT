import * as THREE from "three";

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

function hash(x, y = 0) {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return value - Math.floor(value);
}

function createTexture(baseColor, colors, density = 45, seed = 1) {
    const size = 16;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < density; i++) {
        const x = Math.floor(hash(i + seed, seed * 3.17) * size);
        const y = Math.floor(hash(i + seed * 7.1, seed * 5.3) * size);
        const color = colors[i % colors.length];

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);

        if (i % 13 === 0) {
            ctx.fillRect((x + 1) % size, y, 1, 1);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

const grassTopTexture = createTexture(
    "#63b238",
    ["#4e962d", "#76c747", "#3f8627", "#8ad153"],
    64,
    10
);

const grassSideTexture = createTexture(
    "#7a512b",
    ["#5f3e21", "#8d5c30", "#704621", "#9b6737"],
    52,
    11
);

const dirtTexture = createTexture(
    "#7a4d27",
    ["#633d20", "#8c5a30", "#6b431f", "#9a6335"],
    58,
    12
);

const stoneTexture = createTexture(
    "#818181",
    ["#707070", "#969696", "#626262", "#a2a2a2"],
    54,
    13
);

const sandTexture = createTexture(
    "#d8c07b",
    ["#c5aa64", "#e5d18f", "#b99f58", "#eddc9c"],
    54,
    14
);

const oakSideTexture = createTexture(
    "#704625",
    ["#5a381c", "#845632", "#613d20", "#956039"],
    40,
    15
);

const oakTopTexture = createTexture(
    "#95613b",
    ["#714522", "#ad7549", "#7c4d2d", "#bb8354"],
    32,
    16
);

const leavesTexture = createTexture(
    "#3c8c2e",
    ["#2d7525", "#55a63a", "#347d28", "#6bb949", "#24661f"],
    72,
    17
);

const grassTopMaterial = new THREE.MeshLambertMaterial({
    map: grassTopTexture
});

const grassSideMaterial = new THREE.MeshLambertMaterial({
    map: grassSideTexture
});

const dirtMaterial = new THREE.MeshLambertMaterial({
    map: dirtTexture
});

const stoneMaterial = new THREE.MeshLambertMaterial({
    map: stoneTexture
});

const sandMaterial = new THREE.MeshLambertMaterial({
    map: sandTexture
});

const oakSideMaterial = new THREE.MeshLambertMaterial({
    map: oakSideTexture
});

const oakTopMaterial = new THREE.MeshLambertMaterial({
    map: oakTopTexture
});

const leavesMaterial = new THREE.MeshLambertMaterial({
    map: leavesTexture
});

// BoxGeometry material order: right, left, top, bottom, front, back.
const grassMaterial = [
    grassSideMaterial,
    grassSideMaterial,
    grassTopMaterial,
    dirtMaterial,
    grassSideMaterial,
    grassSideMaterial
];

const oakLogMaterial = [
    oakSideMaterial,
    oakSideMaterial,
    oakTopMaterial,
    oakTopMaterial,
    oakSideMaterial,
    oakSideMaterial
];

function createBlock(scene, x, y, z, material) {
    const block = new THREE.Mesh(
        blockGeometry,
        material
    );

    block.position.set(x, y, z);
    block.matrixAutoUpdate = true;
    scene.add(block);

    return block;
}

export {
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial,
    createBlock
};