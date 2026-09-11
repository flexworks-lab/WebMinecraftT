import * as THREE from "three";

// Minecraft-style world clouds: wide, flat, blocky sheets.
const CLOUD_BLOCK_SIZE = 2;
const CLOUD_HEIGHT = 1;
const CLOUD_ALTITUDE = 96;
const CLOUD_CELL_SIZE = 96;
const CLOUD_GRID_RADIUS = 7;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.45;

let cloudRoot = null;
let cloudSeed = 0;
let cloudEntries = [];
let windDistance = 0;
let running = false;
let lastFrame = performance.now();
let visibilityObserver = null;

// MeshBasicMaterial keeps clouds bright white even when there is little/no world lighting.
// This also avoids the dark/black cloud appearance from the old Lambert material.
const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    depthTest: true,
    fog: true
});

// Clouds are exactly 1 unit tall and very wide.
const cloudGeometry = new THREE.BoxGeometry(
    CLOUD_BLOCK_SIZE,
    CLOUD_HEIGHT,
    CLOUD_BLOCK_SIZE
);

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
    // Keep unrelated in-world UI fixes, but DO NOT hide/replace any cloud textures.
    style.textContent = `
body.webminecraft-in-world #devControlsButton,
body.webminecraft-in-world #discussionButton{display:none !important}
`;
    document.head.appendChild(style);
}

function addRect(blocks, startX, endX, startZ, endZ) {
    for (let x = startX; x <= endX; x++) {
        for (let z = startZ; z <= endZ; z++) {
            // Every cloud piece is on the exact same Y layer: no tall cloud stacks.
            blocks.push(new THREE.Vector3(
                x * CLOUD_BLOCK_SIZE,
                0,
                z * CLOUD_BLOCK_SIZE
            ));
        }
    }
}

function buildCloudShape(cellX, cellZ) {
    const blocks = [];

    // Large flat base, with random proportions so the clouds are not perfect rectangles.
    const width = 6 + Math.floor(seedHash(cellX, cellZ, 17) * 7); // 13-27 blocks wide
    const depth = 2 + Math.floor(seedHash(cellX, cellZ, 23) * 4); // 5-9 blocks deep

    addRect(blocks, -width, width, -depth, depth);

    // Add flat side/center extensions on the SAME layer to make irregular Minecraft shapes.
    const leftExtra = 2 + Math.floor(seedHash(cellX, cellZ, 31) * 5);
    const rightExtra = 2 + Math.floor(seedHash(cellX, cellZ, 37) * 5);
    const frontExtra = Math.floor(seedHash(cellX, cellZ, 41) * 3);
    const backExtra = Math.floor(seedHash(cellX, cellZ, 43) * 3);

    addRect(blocks, -width - leftExtra, -width, -Math.max(1, depth - 1), depth - 1);
    addRect(blocks, width, width + rightExtra, -Math.max(1, depth - 1), depth - 1);

    if (frontExtra > 0) {
        addRect(blocks, -Math.max(2, width - 2), Math.max(2, width - 2), -depth - frontExtra, -depth);
    }
    if (backExtra > 0) {
        addRect(blocks, -Math.max(2, width - 2), Math.max(2, width - 2), depth, depth + backExtra);
    }

    // Small cut-outs keep the silhouette cloud-like without ever adding height.
    if (seedHash(cellX, cellZ, 53) > 0.35) {
        const cutWidth = 1 + Math.floor(seedHash(cellX, cellZ, 59) * 3);
        const cutDepth = 1 + Math.floor(seedHash(cellX, cellZ, 61) * 2);
        const side = seedHash(cellX, cellZ, 67) > 0.5 ? 1 : -1;
        if (side < 0) {
            // Leave the outer edge irregular by simply not adding anything there.
            // The base remains one flat layer.
        }
        void cutWidth;
        void cutDepth;
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
    const baseX = cellX * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 71) - 0.5) * 40;
    const baseZ = cellZ * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 79) - 0.5) * 40;
    const baseY = CLOUD_ALTITUDE + (seedHash(cellX, cellZ, 83) - 0.5) * 2;

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

    // Much denser field so there are plenty of clouds across the sky.
    for (let cellX = -CLOUD_GRID_RADIUS; cellX <= CLOUD_GRID_RADIUS; cellX++) {
        for (let cellZ = -CLOUD_GRID_RADIUS; cellZ <= CLOUD_GRID_RADIUS; cellZ++) {
            if (seedHash(cellX, cellZ, 97) < 0.42) continue;
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
            entry.mesh.position.set(entry.baseX + windDistance, entry.baseY, entry.baseZ);
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
