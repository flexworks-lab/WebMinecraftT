import * as THREE from "three";

const CLOUD_BLOCK_SIZE = 3;
const CLOUD_ALTITUDE = 78;
const CLOUD_CELL_SIZE = 64;
const CLOUD_GRID_RADIUS = 5;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.9;

let cloudRoot = null;
let cloudSeed = 0;
let cloudEntries = [];
let cameraRef = null;
let windDistance = 0;
let running = false;
let lastFrame = performance.now();
let visibilityObserver = null;

const cloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    depthTest: true,
    fog: true,
    flatShading: true
});

const cloudGeometry = new THREE.BoxGeometry(CLOUD_BLOCK_SIZE, CLOUD_BLOCK_SIZE, CLOUD_BLOCK_SIZE);

function seedHash(a, b, c = 0) {
    let h = Math.imul((a | 0) ^ 0x9e3779b9, 374761393);
    h = Math.imul(h ^ (b | 0), 668265263);
    h = Math.imul(h ^ (c | 0), 1274126177);
    h = Math.imul(h ^ (cloudSeed | 0), 1103515245);
    h ^= h >>> 13;
    h = Math.imul(h, 2246822519);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
}

function ensureStyles() {
    if (document.getElementById("webMinecraftWorldCloudFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftWorldCloudFixes";
    style.textContent = `
#webMinecraftMovingClouds{display:none !important}
body.webminecraft-in-world #devControlsButton,
body.webminecraft-in-world #discussionButton{display:none !important}
`;
    document.head.appendChild(style);
}

function addRect(blocks, startX, endX, startZ, endZ, y) {
    for (let x = startX; x <= endX; x++) {
        for (let z = startZ; z <= endZ; z++) {
            blocks.push(new THREE.Vector3(x * CLOUD_BLOCK_SIZE, y * CLOUD_BLOCK_SIZE, z * CLOUD_BLOCK_SIZE));
        }
    }
}

function buildCloudShape(cellX, cellZ) {
    const blocks = [];
    const width = 7 + Math.floor(seedHash(cellX, cellZ, 17) * 7);
    const depth = 3 + Math.floor(seedHash(cellX, cellZ, 23) * 4);

    // Large rectangular Minecraft-style cloud base.
    addRect(blocks, -width, width, -depth, depth, 0);

    // Chunky rectangular upper sections make the cloud feel built from blocks.
    const leftWidth = 2 + Math.floor(seedHash(cellX, cellZ, 31) * 4);
    const middleWidth = 3 + Math.floor(seedHash(cellX, cellZ, 37) * 5);
    const rightWidth = 2 + Math.floor(seedHash(cellX, cellZ, 43) * 4);

    addRect(blocks, -width + 1, -width + leftWidth, -depth + 1, depth - 1, 1);
    addRect(blocks, -middleWidth, middleWidth, -Math.max(1, depth - 2), Math.max(1, depth - 2), 1);
    addRect(blocks, width - rightWidth, width - 1, -depth + 1, depth - 1, 1);

    if (seedHash(cellX, cellZ, 53) > 0.35) {
        addRect(blocks, -Math.max(2, middleWidth - 2), Math.max(2, middleWidth - 2), -1, 1, 2);
    }

    return blocks;
}

function makeCloud(cellX, cellZ) {
    const blocks = buildCloudShape(cellX, cellZ);
    const mesh = new THREE.InstancedMesh(cloudGeometry, cloudMaterial, blocks.length);
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < blocks.length; i++) {
        matrix.makeTranslation(blocks[i].x, blocks[i].y, blocks[i].z);
        mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.isCloud = true;
    mesh.userData.isInteractive = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const baseX = cellX * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 71) - 0.5) * 28;
    const baseZ = cellZ * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 79) - 0.5) * 28;
    const baseY = CLOUD_ALTITUDE + (seedHash(cellX, cellZ, 83) - 0.5) * 5;

    cloudRoot.add(mesh);
    cloudEntries.push({ mesh, cellX, cellZ, baseX, baseZ, baseY });
}

function clearClouds() {
    cloudEntries.length = 0;
    if (!cloudRoot) return;
    while (cloudRoot.children.length) cloudRoot.remove(cloudRoot.children[0]);
}

function rebuildCloudField(seed) {
    cloudSeed = (Math.floor(Math.abs(Number(seed))) >>> 0) || 0;
    clearClouds();

    for (let cellX = -CLOUD_GRID_RADIUS; cellX <= CLOUD_GRID_RADIUS; cellX++) {
        for (let cellZ = -CLOUD_GRID_RADIUS; cellZ <= CLOUD_GRID_RADIUS; cellZ++) {
            const coverage = seedHash(cellX, cellZ, 97);
            if (coverage < 0.28) continue;
            makeCloud(cellX, cellZ);
        }
    }
}

function wrap(value, half) {
    return ((value + half) % (half * 2) + (half * 2)) % (half * 2) - half;
}

function updateCloudPositions() {
    if (!cameraRef || !cloudRoot || !cloudRoot.visible) return;

    const cameraX = cameraRef.position.x;
    const cameraZ = cameraRef.position.z;
    const cameraCellX = Math.floor(cameraX / CLOUD_CELL_SIZE);
    const cameraCellZ = Math.floor(cameraZ / CLOUD_CELL_SIZE);

    for (const entry of cloudEntries) {
        const cellDX = entry.cellX - cameraCellX;
        const cellDZ = entry.cellZ - cameraCellZ;
        const localBaseX = cellDX * CLOUD_CELL_SIZE + (entry.baseX - entry.cellX * CLOUD_CELL_SIZE) + windDistance;
        const localBaseZ = cellDZ * CLOUD_CELL_SIZE + (entry.baseZ - entry.cellZ * CLOUD_CELL_SIZE);
        const x = cameraX + wrap(localBaseX, CLOUD_WRAP / 2);
        const z = cameraZ + wrap(localBaseZ, CLOUD_WRAP / 2);
        entry.mesh.position.set(x, entry.baseY, z);
    }
}

function tick(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    windDistance += CLOUD_WIND_SPEED * delta;
    if (windDistance > CLOUD_WRAP) windDistance -= CLOUD_WRAP;
    updateCloudPositions();
    requestAnimationFrame(tick);
}

export function setupWorldClouds(scene, camera) {
    ensureStyles();
    cameraRef = camera;

    if (!cloudRoot) {
        cloudRoot = new THREE.Group();
        cloudRoot.name = "MinecraftWorldClouds";
        cloudRoot.renderOrder = 2;
        cloudRoot.visible = document.body.classList.contains("webminecraft-in-world");
        scene.add(cloudRoot);
    }

    if (!running) {
        running = true;
        lastFrame = performance.now();
        requestAnimationFrame(tick);
    }

    if (!visibilityObserver) {
        visibilityObserver = new MutationObserver(() => {
            if (cloudRoot) cloudRoot.visible = document.body.classList.contains("webminecraft-in-world");
        });
        visibilityObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    return cloudRoot;
}

export function setWorldCloudSeed(seed) {
    if (!cloudRoot) return;
    rebuildCloudField(seed);
    updateCloudPositions();
}
