import * as THREE from "three";

// Minecraft-style world clouds: wide, flat, blocky sheets.
const CLOUD_BLOCK_SIZE = 3;
const CLOUD_HEIGHT = 1;
const CLOUD_ALTITUDE = 78;
const CLOUD_CELL_SIZE = 105;
const CLOUD_GRID_RADIUS = 9;
const CLOUD_WRAP = 2048;
const CLOUD_WIND_SPEED = 0.45;

let cloudRoot = null;
let cloudScene = null;
let cloudSeed = 0;
let cloudEntries = [];
let windDistance = 0;
let running = false;
let lastFrame = performance.now();
let visibilityObserver = null;
let cloudCamera = null;
let skyDome = null;
let undergroundAmbient = null;
let legacyDepthLightNeutralized = false;
let outdoorLights = [];

const cloudMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: false,
    opacity: 1,
    depthWrite: false,
    depthTest: true,
    fog: true,
    toneMapped: false
});
const cloudGeometry = new THREE.BoxGeometry(CLOUD_BLOCK_SIZE, CLOUD_HEIGHT, CLOUD_BLOCK_SIZE);

// The sky and square sun are rendered together on a camera-centered sphere.
// This makes them behave like a real skybox and avoids the sun being clipped by
// the normal camera far plane.
const SKY_SUN_DIRECTION = new THREE.Vector3(0.48, 0.76, 0.44).normalize();

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
    const halfWidth = 11 + Math.floor(seedHash(cellX, cellZ, 17) * 13);
    const halfDepth = 4 + Math.floor(seedHash(cellX, cellZ, 23) * 8);

    for (let z = -halfDepth; z <= halfDepth; z++) {
        const rowRandom = seedHash(cellX, cellZ, 30 + z + halfDepth);
        const rowWidth = Math.max(3, Math.floor(halfWidth * (0.48 + rowRandom * 0.52)));
        const rowOffset = Math.floor((seedHash(cellX, cellZ, 70 + z + halfDepth) - 0.5) * halfWidth * 0.5);
        for (let x = -rowWidth + rowOffset; x <= rowWidth + rowOffset; x++) addBlock(blocks, x, z);
    }

    const edgeCuts = 9 + Math.floor(seedHash(cellX, cellZ, 140) * 10);
    for (let i = 0; i < edgeCuts; i++) {
        const cutZ = -halfDepth + Math.floor(seedHash(cellX, cellZ, 150 + i) * (halfDepth * 2 + 1));
        const rowRandom = seedHash(cellX, cellZ, 180 + cutZ + halfDepth);
        const rowWidth = Math.max(3, Math.floor(halfWidth * (0.48 + rowRandom * 0.52)));
        const rowOffset = Math.floor((seedHash(cellX, cellZ, 220 + cutZ + halfDepth) - 0.5) * halfWidth * 0.5);
        const side = seedHash(cellX, cellZ, 260 + i) > 0.5 ? 1 : -1;
        const cutSize = 1 + Math.floor(seedHash(cellX, cellZ, 280 + i) * 5);
        const cutStart = side > 0 ? rowWidth + rowOffset - cutSize + 1 : -rowWidth + rowOffset;
        const cutEnd = side > 0 ? rowWidth + rowOffset : -rowWidth + rowOffset + cutSize - 1;
        for (let x = cutStart; x <= cutEnd; x++) seen.add(`${x}|${cutZ}`);
    }

    const protrusions = 5 + Math.floor(seedHash(cellX, cellZ, 320) * 8);
    for (let i = 0; i < protrusions; i++) {
        const side = Math.floor(seedHash(cellX, cellZ, 330 + i) * 4);
        const amount = 1 + Math.floor(seedHash(cellX, cellZ, 350 + i) * 6);
        const span = 1 + Math.floor(seedHash(cellX, cellZ, 370 + i) * 4);
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
    cloudRoot.add(mesh);
    cloudEntries.push({ mesh, baseX, baseZ, baseY: CLOUD_ALTITUDE });
}

function createSkyDome(scene) {
    if (skyDome) return;
    const geometry = new THREE.SphereGeometry(1000, 32, 16);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x3f9fe8) },
            horizonColor: { value: new THREE.Color(0x9fddff) },
            bottomColor: { value: new THREE.Color(0x72bde7) },
            sunDirection: { value: SKY_SUN_DIRECTION.clone() }
        },
        vertexShader: `
            varying vec3 vSkyDirection;
            void main() {
                vSkyDirection = normalize(position);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vSkyDirection;
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;
            uniform vec3 sunDirection;
            void main() {
                vec3 dir = normalize(vSkyDirection);
                float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
                vec3 sky = h < 0.5
                    ? mix(bottomColor, horizonColor, h * 2.0)
                    : mix(horizonColor, topColor, (h - 0.5) * 2.0);

                vec3 upAxis = abs(sunDirection.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
                vec3 sunRight = normalize(cross(sunDirection, upAxis));
                vec3 sunUp = normalize(cross(sunRight, sunDirection));
                float sx = dot(dir, sunRight);
                float sy = dot(dir, sunUp);
                float squareDistance = max(abs(sx), abs(sy));
                float sunMask = 1.0 - smoothstep(0.012, 0.014, squareDistance);
                float glow = 1.0 - smoothstep(0.018, 0.085, squareDistance);
                vec3 sunColor = vec3(1.0, 0.86, 0.36);
                sky += sunColor * glow * 0.18;
                sky = mix(sky, sunColor, sunMask);
                gl_FragColor = vec4(sky, 1.0);
            }
        `,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        toneMapped: false
    });
    skyDome = new THREE.Mesh(geometry, material);
    skyDome.name = "MinecraftSkybox";
    skyDome.frustumCulled = false;
    skyDome.renderOrder = -100;
    scene.add(skyDome);
}

function createUndergroundLighting(scene) {
    if (undergroundAmbient) return;
    undergroundAmbient = new THREE.AmbientLight(0x87a5b8, 0.22);
    undergroundAmbient.name = "MinecraftUndergroundAmbient";
    scene.add(undergroundAmbient);
    outdoorLights = scene.children.filter(object => object.isDirectionalLight || object.isHemisphereLight);

    if (!legacyDepthLightNeutralized) {
        for (const object of scene.children) {
            if (!object.isPointLight) continue;
            if (object.color?.getHex?.() !== 0x9db6d2) continue;
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

function updateSkyPosition() {
    if (cloudCamera && skyDome) skyDome.position.copy(cloudCamera.position);
}

function updateUndergroundAmbient() {
    if (!cloudCamera || !undergroundAmbient) return;
    const y = cloudCamera.position.y;
    const underground = 1 - THREE.MathUtils.smoothstep(y, -1, 8);
    const deepDark = 1 - THREE.MathUtils.smoothstep(y, -24, -1);
    const outdoorVisible = y >= 8;
    for (const light of outdoorLights) light.visible = outdoorVisible;
    undergroundAmbient.intensity = underground * (0.08 + (1 - deepDark) * 0.04);
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
            if (seedHash(cellX, cellZ, 97) < 0.32) continue;
            makeCloud(cellX, cellZ);
        }
    }
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
