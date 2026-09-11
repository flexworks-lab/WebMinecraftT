import * as THREE from "three";

// Minecraft-style world clouds: wide, flat, blocky sheets.
const CLOUD_BLOCK_SIZE = 2;
const CLOUD_HEIGHT = 1;
const CLOUD_ALTITUDE = 96;
const CLOUD_CELL_SIZE = 80;
const CLOUD_GRID_RADIUS = 9;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.45;

let cloudRoot = null;
let cloudSeed = 0;
let cloudEntries = [];
let windDistance = 0;
let running = false;
let lastFrame = performance.now();
let visibilityObserver = null;

// Keep clouds bright instead of allowing them to render black under weak lighting.
const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    depthTest: true,
    fog: true
});

// Every cloud piece is exactly 1 unit tall and 2 units wide/deep.
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
    // Only hide unrelated in-world UI. No cloud texture/element is hidden here.
    style.textContent = `
body.webminecraft-in-world #devControlsButton,
body.webminecraft-in-world #discussionButton{display:none !important}
`;
    document.head.appendChild(style);
}

function addRect(blocks, startX, endX, startZ, endZ) {
    for (let x = startX; x <= endX; x++) {
        for (let z = startZ; z <= endZ; z++) {
            blocks.push(new THREE.Vector3(
                x * CLOUD_BLOCK_SIZE,
                0,
                z * CLOUD_BLOCK_SIZE
            ));
        }
    }
}

function addRandomPatch(blocks, cellX, cellZ, patchIndex, width, depth) {
    const h = (n) => seedHash(cellX, cellZ, n + patchIndex * 97);

    // Pick a rectangular flat patch inside/around the cloud.
    const patchWidth = 1 + Math.floor(h(11) * Math.max(2, Math.floor(width * 0.65)));
    const patchDepth = 1 + Math.floor(h(13) * Math.max(2, Math.floor(depth * 0.8)));
    const startX = -Math.floor(width / 2) + Math.floor(h(17) * Math.max(1, width - patchWidth + 1));
    const startZ = -Math.floor(depth / 2) + Math.floor(h(19) * Math.max(1, depth - patchDepth + 1));

    addRect(
        blocks,
        startX,
        startX + patchWidth - 1,
        startZ,
        startZ + patchDepth - 1
    );
}

function buildCloudShape(cellX, cellZ) {
    const blocks = [];

    // Much wider flat clouds with random proportions.
    const width = 8 + Math.floor(seedHash(cellX, cellZ, 17) * 9); // 17-33 blocks wide
    const depth = 3 + Math.floor(seedHash(cellX, cellZ, 23) * 6); // 7-17 blocks deep

    // Start with a broad irregular base made entirely on one Y layer.
    addRect(
        blocks,
        -width,
        width,
        -depth,
        depth
    );

    // Cut the silhouette with deterministic missing edge sections.
    const cuts = 5 + Math.floor(seedHash(cellX, cellZ, 29) * 6);
    for (let i = 0; i < cuts; i++) {
        const edge = Math.floor(seedHash(cellX, cellZ, 40 + i) * 4);
        const cutSize = 1 + Math.floor(seedHash(cellX, cellZ, 60 + i) * 4);

        if (edge === 0) {
            for (let z = -cutSize; z <= cutSize; z++) {
                blocks.splice(blocks.length, 0);
            }
            // No-op here; shape irregularity is added below with visible patches.
        }
    }

    // Layered-in flat patches make each cloud a different chunky shape without increasing height.
    const patchCount = 8 + Math.floor(seedHash(cellX, cellZ, 83) * 8);
    for (let i = 0; i < patchCount; i++) {
        addRandomPatch(blocks, cellX, cellZ, i, width * 2 + 1, depth * 2 + 1);
    }

    // Add a few flat protrusions around random edges for the classic blocky silhouette.
    const protrusions = 3 + Math.floor(seedHash(cellX, cellZ, 101) * 5);
    for (let i = 0; i < protrusions; i++) {
        const side = Math.floor(seedHash(cellX, cellZ, 120 + i) * 4);
        const amount = 1 + Math.floor(seedHash(cellX, cellZ, 140 + i) * 4);
        const span = 1 + Math.floor(seedHash(cellX, cellZ, 160 + i) * 3);

        if (side === 0) {
            addRect(blocks, -width - amount, -width, -span, span);
        } else if (side === 1) {
            addRect(blocks, width, width + amount, -span, span);
        } else if (side === 2) {
            addRect(blocks, -span, span, -depth - amount, -depth);
        } else {
            addRect(blocks, -span, span, depth, depth + amount);
        }
    }

    // Remove duplicate blocks so the random patches/protrusions stay visually clean.
    const seen = new Set();
    return blocks.filter((block) => {
        const key = `${block.x}|${block.z}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
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
    const baseX = cellX * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 201) - 0.5) * 24;
    const baseZ = cellZ * CLOUD_CELL_SIZE + (seedHash(cellX, cellZ, 211) - 0.5) * 24;
    const baseY = CLOUD_ALTITUDE + (seedHash(cellX, cellZ, 221) - 0.5) * 2;

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

    // Larger area + higher spawn rate = many more clouds across the sky.
    for (let cellX = -CLOUD_GRID_RADIUS; cellX <= CLOUD_GRID_RADIUS; cellX++) {
        for (let cellZ = -CLOUD_GRID_RADIUS; cellZ <= CLOUD_GRID_RADIUS; cellZ++) {
            if (seedHash(cellX, cellZ, 97) < 0.50) continue;
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
