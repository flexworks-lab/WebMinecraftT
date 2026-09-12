import * as THREE from "three";
import { getBlockAt, getBlockTypes, getWorldSeed } from "./world.js";

const ROOT_NAME = "ShortGrassVegetation";
const SCAN_RADIUS = 40;
const SCAN_INTERVAL = 700;
const MAX_GRASS = 1800;
const GRASS_HEIGHT = 0.72;
const GRASS_WIDTH = 0.62;

let root = null;
let cameraRef = null;
let mesh = null;
let geometry = null;
let material = null;
let running = false;
let lastScan = 0;
let lastSeed = null;
let observer = null;

function hash2D(x, z, seed, salt = 0) {
    let h = Math.imul((x | 0) ^ 0x9e3779b9, 374761393);
    h = Math.imul(h ^ (z | 0), 668265263);
    h = Math.imul(h ^ ((seed | 0) + salt), 1274126177);
    h ^= h >>> 13;
    h = Math.imul(h, 1103515245);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
}

function makeGrassTexture() {
    const size = 16;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#4fa83d";
    const pixels = [
        [7, 15, 2, 1], [6, 14, 2, 1], [8, 13, 2, 2], [6, 12, 2, 2],
        [5, 10, 2, 2], [9, 11, 2, 2], [4, 8, 2, 2], [10, 9, 2, 2],
        [7, 7, 2, 2], [6, 5, 2, 2], [8, 4, 2, 2], [9, 2, 2, 2]
    ];
    for (const [x, y, w, h] of pixels) ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#67bd4c";
    ctx.fillRect(7, 11, 2, 3);
    ctx.fillRect(8, 7, 2, 3);
    ctx.fillRect(6, 4, 2, 3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function makeCrossGeometry() {
    const halfW = GRASS_WIDTH * 0.5;
    const y0 = 0;
    const y1 = GRASS_HEIGHT;
    const positions = new Float32Array([
        -halfW, y0, 0,  halfW, y0, 0,  halfW, y1, 0,  -halfW, y1, 0,
        0, y0, -halfW,  0, y0, halfW,  0, y1, halfW,  0, y1, -halfW
    ]);
    const uvs = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1
    ]);
    const normals = new Float32Array([
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
    ]);
    const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
}

function ensureMesh() {
    if (mesh) return;
    const texture = makeGrassTexture();
    geometry = makeCrossGeometry();
    material = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        depthWrite: true,
        fog: true
    });
    mesh = new THREE.InstancedMesh(geometry, material, MAX_GRASS);
    mesh.name = "ShortGrassInstancedMesh";
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.count = 0;
    root.add(mesh);
}

function findSurfaceY(x, z, cameraY) {
    const top = Math.min(127, Math.floor(cameraY + 20));
    const bottom = Math.max(-32, Math.floor(cameraY - 32));
    for (let y = top; y >= bottom; y--) {
        const type = getBlockAt(x, y, z);
        if (type !== 0) return { y, type };
    }
    return null;
}

function scan() {
    if (!root || !cameraRef) return;
    root.visible = document.body.classList.contains("webminecraft-in-world");
    if (!root.visible) {
        if (mesh) mesh.count = 0;
        return;
    }

    const seed = getWorldSeed();
    if (seed !== lastSeed) {
        lastSeed = seed;
        lastScan = 0;
    }

    const types = getBlockTypes();
    const cx = Math.floor(cameraRef.position.x);
    const cz = Math.floor(cameraRef.position.z);
    const cameraY = cameraRef.position.y;
    const matrix = new THREE.Matrix4();
    let count = 0;

    for (let dz = -SCAN_RADIUS; dz <= SCAN_RADIUS && count < MAX_GRASS; dz++) {
        for (let dx = -SCAN_RADIUS; dx <= SCAN_RADIUS && count < MAX_GRASS; dx++) {
            if (dx * dx + dz * dz > SCAN_RADIUS * SCAN_RADIUS) continue;
            const x = cx + dx;
            const z = cz + dz;
            const chance = hash2D(x, z, seed, 31);
            if (chance > 0.30) continue;

            const surface = findSurfaceY(x, z, cameraY);
            if (!surface || surface.type !== types.GRASS || getBlockAt(x, surface.y + 1, z) !== types.AIR) continue;

            const scale = 0.72 + hash2D(x, z, seed, 59) * 0.33;
            const rotation = hash2D(x, z, seed, 83) * Math.PI * 2;
            const y = surface.y + 0.505;
            matrix.makeRotationY(rotation);
            matrix.setPosition(x + 0.5, y, z + 0.5);
            matrix.scale(new THREE.Vector3(scale, scale, scale));
            mesh.setMatrixAt(count, matrix);
            count++;
        }
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
}

function tick(now) {
    if (now - lastScan >= SCAN_INTERVAL) {
        lastScan = now;
        scan();
    }
    requestAnimationFrame(tick);
}

export function initShortGrass(scene, camera) {
    cameraRef = camera;
    if (!root) {
        root = new THREE.Group();
        root.name = ROOT_NAME;
        root.renderOrder = 5;
        scene.add(root);
    }
    ensureMesh();

    if (!observer) {
        observer = new MutationObserver(() => {
            if (root) root.visible = document.body.classList.contains("webminecraft-in-world");
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    if (!running) {
        running = true;
        requestAnimationFrame(tick);
    }
    scan();
}
