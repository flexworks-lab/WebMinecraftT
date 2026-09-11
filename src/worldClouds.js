import * as THREE from "three";

// Minecraft-style world clouds: wide, flat, blocky sheets.
const CLOUD_BLOCK_SIZE = 2;
const CLOUD_HEIGHT = 1;
const CLOUD_ALTITUDE = 96;
const CLOUD_CELL_SIZE = 80;
const CLOUD_GRID_RADIUS = 9;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.45;
// Keep the sun inside the camera's normal far clipping range, while moving it with
// the camera every frame so it can never actually be reached.
const SUN_DISTANCE = 500;

let cloudRoot = null;
let cloudScene = null;
let cloudSeed = 0;
let cloudEntries = [];
let windDistance = 0;
let running = false;
let lastFrame = performance.now();
let visibilityObserver = null;
let sunMesh = null;
let sunGlowMeshes = [];
let cloudCamera = null;
let skyDome = null;
let undergroundAmbient = null;
let legacyDepthLightNeutralized = false;

const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: false,
    opacity: 1,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false
});

const cloudGeometry = new THREE.BoxGeometry(CLOUD_BLOCK_SIZE, CLOUD_HEIGHT, CLOUD_BLOCK_SIZE);

const sunGeometry = new THREE.PlaneGeometry(10, 10);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffe87a,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false
});

const sunGlowGeometry = new THREE.PlaneGeometry(1, 1);
const sunGlowColors = [0xfff6a8, 0xffef88, 0xffe36a];
const sunGlowSizes = [15, 20, 27];
const sunGlowOpacities = [0.20, 0.10, 0.045];

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
body.webminecraft-in-world #devControlsButton,
body.webminecraft-in-world #discussionButton{display:none !important}
`;
    document.head.appendChild(style);
}

function addBlock(blocks, x, z) {
    blocks.push(new THREE.Vector3(x * CLOUD_BLOCK_SIZE, 0, z * CLOUD_BLOCK_SIZE));
}

function buildCloudShape(cellX, cellZ) {
    const blocks = [];
    const seen = new Set();
    const halfWidth = 8 + Math.floor(seedHash(cellX, cellZ, 17) * 10);
    const halfDepth = 3 + Math.floor(seedHash(cellX, cellZ, 23) * 6);

    for (let z = -halfDepth; z <= halfDepth; z++) {
        const rowRandom = seedHash(cellX, cellZ, 30 + z + halfDepth);
        const rowWidth = Math.max(2, Math.floor(halfWidth * (0.48 + rowRandom * 0.52)));
        const rowOffset = Math.floor((seedHash(cellX, cellZ, 70 + z + halfDepth) - 0.5) * halfWidth * 0.5);
        for (let x = -rowWidth + rowOffset; x <= rowWidth + rowOffset; x++) addBlock(blocks, x, z);
    }

    const edgeCuts = 7 + Math.floor(seedHash(cellX, cellZ, 140) * 8);
    for (let i = 0; i < edgeCuts; i++) {
        const cutZ = -halfDepth + Math.floor(seedHash(cellX, cellZ, 150 + i) * (halfDepth * 2 + 1));
        const rowRandom = seedHash(cellX, cellZ, 180 + cutZ + halfDepth);
        const rowWidth = Math.max(2, Math.floor(halfWidth * (0.48 + rowRandom * 0.52)));
        const rowOffset = Math.floor((seedHash(cellX, cellZ, 220 + cutZ + halfDepth) - 0.5) * halfWidth * 0.5);
        const side = seedHash(cellX, cellZ, 260 + i) > 0.5 ? 1 : -1;
        const cutSize = 1 + Math.floor(seedHash(cellX, cellZ, 280 + i) * 4);
        const cutStart = side > 0 ? rowWidth + rowOffset - cutSize + 1 : -rowWidth + rowOffset;
        const cutEnd = side > 0 ? rowWidth + rowOffset : -rowWidth + rowOffset + cutSize - 1;
        for (let x = cutStart; x <= cutEnd; x++) seen.add(`${x}|${cutZ}`);
    }

    const protrusions = 4 + Math.floor(seedHash(cellX, cellZ, 320) * 6);
    for (let i = 0; i < protrusions; i++) {
        const side = Math.floor(seedHash(cellX, cellZ, 330 + i) * 4);
        const amount = 1 + Math.floor(seedHash(cellX, cellZ, 350 + i) * 5);
        const span = 1 + Math.floor(seedHash(cellX, cellZ, 370 + i) * 3);
        if (side === 0 || side === 1) {
            const zCenter = -halfDepth + Math.floor(seedHash(cellX, cellZ, 390 + i) * (halfDepth * 2 + 1));
            const startX = side === 0 ? -halfWidth - amount : halfWidth;
            const endX = side === 0 ? -halfWidth - 1 : halfWidth + amount - 1;
            for (let x = startX; x <= endX; x++) {
                for (let z = zCenter - span; z <= zCenter + span; z++) addBlock(blocks, x, z);
            }
        } else {
            const xCenter = -halfWidth + Math.floor(seedHash(cellX, cellZ, 430 + i) * (halfWidth * 2 + 1));
            const startZ = side === 2 ? -halfDepth - amount : halfDepth;
            const endZ = side === 2 ? -halfDepth - 1 : halfDepth + amount - 1;
            for (let z = startZ; z <= endZ; z++) {
                for (let x = xCenter - span; x <= xCenter + span; x++) addBlock(blocks, x, z);
            }
        }
    }

    const unique = new Map();
    for (const block of blocks) {
        const key = `${block.x}|${block.z}`;
        if (!seen.has(key)) unique.set(key, block);
    }
    return [...unique.values()];
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
    mesh.renderOrder = 10;

    const randomX = seedHash(cellX, cellZ, 500);
    const randomZ = seedHash(cellX, cellZ, 510);
    const baseX = (cellX + randomX - 0.5) * CLOUD_CELL_SIZE;
    const baseZ = (cellZ + randomZ - 0.5) * CLOUD_CELL_SIZE;
    const baseY = CLOUD_ALTITUDE;
    cloudRoot.add(mesh);
    cloudEntries.push({ mesh, baseX, baseZ, baseY });
}

function createSkyDome(scene) {
    if (skyDome) return;
    const geometry = new THREE.SphereGeometry(1000, 32, 16);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x3f9fe8) },
            horizonColor: { value: new THREE.Color(0x9fddff) },
            bottomColor: { value: new THREE.Color(0x72bde7) }
        },
        vertexShader: `
            varying float vSkyHeight;
            void main() {
                vec3 worldDirection = normalize((modelMatrix * vec4(position, 0.0)).xyz);
                vSkyHeight = clamp(worldDirection.y * 0.5 + 0.5, 0.0, 1.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying float vSkyHeight;
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;
            void main() {
                vec3 sky;
                if (vSkyHeight < 0.5) sky = mix(bottomColor, horizonColor, vSkyHeight * 2.0);
                else sky = mix(horizonColor, topColor, (vSkyHeight - 0.5) * 2.0);
                gl_FragColor = vec4(sky, 1.0);
            }
        `,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true,
        fog: false
    });
    skyDome = new THREE.Mesh(geometry, material);
    skyDome.name = "MinecraftSkyDome";
    skyDome.frustumCulled = false;
    skyDome.renderOrder = -100;
    scene.add(skyDome);
}

function createUndergroundLighting(scene) {
    if (undergroundAmbient) return;
    undergroundAmbient = new THREE.AmbientLight(0x87a5b8, 0.22);
    undergroundAmbient.name = "MinecraftUndergroundAmbient";
    scene.add(undergroundAmbient);

    if (!legacyDepthLightNeutralized) {
        for (const object of scene.children) {
            if (!object.isPointLight) continue;
            const hex = object.color?.getHex?.();
            if (hex !== 0x9db6d2) continue;
            object.intensity = 0;
            try {
                Object.defineProperty(object, "intensity", {
                    configurable: true,
                    get() { return 0; },
                    set() {}
                });
            } catch {
                object.intensity = 0;
            }
        }
        legacyDepthLightNeutralized = true;
    }
}

function removeWaterSpecularHighlights(scene) {
    scene.traverse(object => {
        const material = object.material;
        if (!material || Array.isArray(material)) return;
        if (!material.isMeshPhongMaterial || !material.transparent) return;
        material.shininess = 0;
        if (material.specular?.set) material.specular.set(0x000000);
        else material.specular = 0x000000;
        material.needsUpdate = true;
    });
}

function createSun() {
    if (sunMesh || !cloudRoot) return;
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.name = "MinecraftSquareSun";
    sunMesh.renderOrder = 30;
    sunMesh.frustumCulled = false;
    sunMesh.userData.isSun = true;
    cloudRoot.add(sunMesh);
    sunGlowMeshes = [];
    for (let i = 0; i < sunGlowSizes.length; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: sunGlowColors[i], transparent: true, opacity: sunGlowOpacities[i],
            blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
            side: THREE.DoubleSide, fog: false, toneMapped: false
        });
        const glow = new THREE.Mesh(sunGlowGeometry, material);
        glow.name = `MinecraftSunGlow${i + 1}`;
        glow.renderOrder = 29 - i;
        glow.frustumCulled = false;
        cloudRoot.add(glow);
        sunGlowMeshes.push(glow);
    }
}

function updateSunPosition() {
    if (!cloudCamera || !sunMesh) return;
    const direction = new THREE.Vector3(0.48, 0.76, 0.44).normalize();
    const position = cloudCamera.position.clone().addScaledVector(direction, SUN_DISTANCE);
    sunMesh.position.copy(position);
    for (const glow of sunGlowMeshes) glow.position.copy(position);
}

function updateSunFacing() {
    if (!cloudCamera || !sunMesh) return;
    sunMesh.lookAt(cloudCamera.position);
    for (const glow of sunGlowMeshes) glow.lookAt(cloudCamera.position);
}

function updateSkyPosition() {
    if (!cloudCamera || !skyDome) return;
    skyDome.position.copy(cloudCamera.position);
}

function updateUndergroundAmbient() {
    if (!cloudCamera || !undergroundAmbient) return;
    const y = cloudCamera.position.y;
    const underground = 1 - THREE.MathUtils.smoothstep(y, -1, 8);
    const deepDark = 1 - THREE.MathUtils.smoothstep(y, -24, -1);
    undergroundAmbient.intensity = underground * (0.16 + (1 - deepDark) * 0.08);
}

function clearClouds() {
    cloudEntries.length = 0;
    if (!cloudRoot) return;
    while (cloudRoot.children.length) cloudRoot.remove(cloudRoot.children[0]);
    sunMesh = null;
    sunGlowMeshes = [];
}

function rebuildCloudField(seed) {
    cloudSeed = (Math.floor(Math.abs(Number(seed))) >>> 0) || 0;
    clearClouds();
    for (let cellX = -CLOUD_GRID_RADIUS; cellX <= CLOUD_GRID_RADIUS; cellX++) {
        for (let cellZ = -CLOUD_GRID_RADIUS; cellZ <= CLOUD_GRID_RADIUS; cellZ++) {
            if (seedHash(cellX, cellZ, 97) < 0.32) continue;
            makeCloud(cellX, cellZ);
        }
    }
    createSun();
    updateSunPosition();
    updateSunFacing();
    updateSkyPosition();
}

function tick(now) {
    const delta = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    windDistance += CLOUD_WIND_SPEED * delta;
    if (windDistance > CLOUD_WRAP) windDistance -= CLOUD_WRAP;
    if (cloudRoot?.visible) {
        for (const entry of cloudEntries) entry.mesh.position.set(entry.baseX + windDistance, entry.baseY, entry.baseZ);
    }
    updateSunPosition();
    updateSunFacing();
    updateSkyPosition();
    updateUndergroundAmbient();
    requestAnimationFrame(tick);
}

export function setupWorldClouds(scene, camera = null) {
    ensureStyles();
    cloudCamera = camera;
    cloudScene = scene;
    createSkyDome(scene);
    createUndergroundLighting(scene);
    removeWaterSpecularHighlights(scene);
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
    for (const entry of cloudEntries) entry.mesh.position.set(entry.baseX + windDistance, entry.baseY, entry.baseZ);
}
