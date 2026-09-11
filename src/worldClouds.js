import * as THREE from "three";

const CLOUD_BLOCK_SIZE = 2;
const CLOUD_ALTITUDE = 78;
const CLOUD_CELL_SIZE = 64;
const CLOUD_GRID_RADIUS = 5;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.45;

let cloudRoot = null;
let cloudSeed = 0;
let cloudEntries = [];
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
#webMinecraftMovingClouds,
#webMinecraftVoxelClouds{display:none !important}
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
    // Keep every cloud inside a clear maximum size so none become enormous.
    const width = 5 + Math.floor(seedHash(cellX, cellZ, 17) * 5);   // 11-19 blocks wide
    const depth = 2 + Math.floor(seedHash(cellX, cellZ, 23) * 3);   // 5-9 blocks deep

    addRect(blocks, -width, width, -depth, depth, 0);

    // Small stepped rectangular sections give the clouds a Minecraft-like shape.
    const capWidth = Math.min(width - 2, 3 + Math.floor(seedHash(cellX, cellZ, 31) * 3));
    const sideWidth = Math.min(width - 1, 2 + Math.floor(seedHash(cellX, cellZ, 37) * 3));

    addRect(blocks, -capWidth, capWidth, -Math.max(1, depth - 2), Math.max(1, depth - 2), 1);
    addRect(blocks, -width + 1, -width + sideWidth, -depth + 1, depth - 1, 1);
    addRect(blocks, width - sideWidth, width - 1, -depth + 1, depth - 1, 1);

    if (seedHash(cellX, cellZ, 53) > 0.55) {
        addRect(blocks, -2, 2, -1, 1, 2);
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

    // Fixed world coordinates. Clouds no longer recenter around the player/camera.
    const baseX = cellX * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 71) - 0.5) * 24;
    const baseZ = cellZ * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 79) - 0.5) * 24;
    const baseY = CLOUD_ALTITUDE + (seedHash(cellX, cellZ, 83) - 0.5) * 4;

    cloudRoot.add(mesh);
    cloudEntries.push({ mesh, baseX, baseZ, baseY });
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
            if (seedHash(cellX, cellZ, 97) < 0.35) continue;
            makeCloud(cellX, cellZ);
        }
    }
}

function tick(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    windDistance += CLOUD_WIND_SPEED * delta;
    if (windDistance > CLOUD_WRAP) windDistance -= CLOUD_WRAP;

    if (cloudRoot?.visible) {
        for (const entry of cloudEntries) {
            const x = entry.baseX + windDistance;
            entry.mesh.position.set(x, entry.baseY, entry.baseZ);
        }
    }

    requestAnimationFrame(tick);
}

export function setupWorldClouds(scene) {
    ensureStyles();

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
    for (const entry of cloudEntries) {
        entry.mesh.position.set(entry.baseX + windDistance, entry.baseY, entry.baseZ);
    }
}
