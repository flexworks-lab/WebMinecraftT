import * as THREE from "three";
import { getBlockAt, getWorldSeed, getBlockTypes } from "./world.js";

const ROOT_NAME = "ShortGrassVegetation";
const SCAN_RADIUS = 40;
const SCAN_INTERVAL = 700;
const MAX_GRASS = 1800;
const GRASS_HEIGHT = 0.82;
const GRASS_WIDTH = 0.68;

let root = null;
let cameraRef = null;
let mesh = null;
let geometry = null;
let material = null;
let running = false;
let lastScan = 0;
let lastSeed = null;
let observer = null;
let blockChangeHandler = null;
let removedGrass = new Set();
let grassOutline = null;

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
    const texture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}textures/shortgrass.png`);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function makeCrossGeometry() {
    const halfW = GRASS_WIDTH * 0.5;
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
        -halfW,0,0, halfW,0,0, halfW,GRASS_HEIGHT,0, -halfW,GRASS_HEIGHT,0,
        0,0,-halfW, 0,0,halfW, 0,GRASS_HEIGHT,halfW, 0,GRASS_HEIGHT,-halfW
    ]), 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]), 2));
    geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0]), 3));
    geometry.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);
    geometry.computeBoundingSphere();
    return geometry;
}

function ensureMesh() {
    if (mesh) return;
    material = new THREE.MeshLambertMaterial({ map: makeGrassTexture(), transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, depthWrite: true, fog: true });
    mesh = new THREE.InstancedMesh(makeCrossGeometry(), material, MAX_GRASS);
    mesh.name = "ShortGrassInstancedMesh";
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = 0;
    root.add(mesh);
}

function ensureGrassOutline() {
    if (grassOutline) return;
    const hw = GRASS_WIDTH * 0.5 + 0.04;
    const y0 = 0.03, y1 = GRASS_HEIGHT + 0.04, z = hw;
    const vertices = new Float32Array([
        -hw,y0,-z, hw,y0,-z, hw,y0,-z, hw,y1,-z, hw,y1,-z, -hw,y1,-z, -hw,y1,-z, -hw,y0,-z,
        -hw,y0,z, hw,y0,z, hw,y0,z, hw,y1,z, hw,y1,z, -hw,y1,z, -hw,y1,z, -hw,y0,z,
        -hw,y0,-z, -hw,y0,z, hw,y0,-z, hw,y0,z,
        -hw,y1,-z, -hw,y1,z, hw,y1,-z, hw,y1,z
    ]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    grassOutline = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthTest: true }));
    grassOutline.name = "shortGrassSelectionOutline";
    grassOutline.visible = false;
    grassOutline.renderOrder = 20;
    root.add(grassOutline);
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
    if (!root || !cameraRef || !mesh) return;
    root.visible = document.body.classList.contains("webminecraft-in-world");
    if (!root.visible) { mesh.count = 0; if (grassOutline) grassOutline.visible = false; return; }
    const seed = getWorldSeed();
    if (seed !== lastSeed) { lastSeed = seed; lastScan = 0; removedGrass.clear(); }
    const types = getBlockTypes();
    const cx = Math.floor(cameraRef.position.x), cz = Math.floor(cameraRef.position.z), cameraY = cameraRef.position.y;
    const matrix = new THREE.Matrix4(), scaleVector = new THREE.Vector3();
    let count = 0;
    for (let dz = -SCAN_RADIUS; dz <= SCAN_RADIUS && count < MAX_GRASS; dz++) {
        for (let dx = -SCAN_RADIUS; dx <= SCAN_RADIUS && count < MAX_GRASS; dx++) {
            if (dx * dx + dz * dz > SCAN_RADIUS * SCAN_RADIUS) continue;
            const x = cx + dx, z = cz + dz;
            if (hash2D(x, z, seed, 31) > 0.16) continue;
            const surface = findSurfaceY(x, z, cameraY);
            if (!surface || surface.type !== types.GRASS) continue;
            const key = `${x},${surface.y},${z}`;
            if (removedGrass.has(key) || getBlockAt(x, surface.y + 1, z) !== types.AIR) continue;
            const scale = 0.84 + hash2D(x, z, seed, 59) * 0.30;
            matrix.makeRotationY(hash2D(x, z, seed, 83) * Math.PI * 2);
            matrix.setPosition(x + 0.5, surface.y + 0.505, z + 0.5);
            scaleVector.set(scale, scale, scale); matrix.scale(scaleVector);
            mesh.setMatrixAt(count++, matrix);
        }
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
}

function getGrassHit() {
    if (!mesh || !root?.visible) return null;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef);
    const hit = raycaster.intersectObject(mesh, false)[0];
    if (!hit || hit.instanceId == null || hit.distance > 5) return null;
    const matrix = new THREE.Matrix4();
    mesh.getMatrixAt(hit.instanceId, matrix);
    const position = new THREE.Vector3().setFromMatrixPosition(matrix);
    const x = Math.floor(position.x), z = Math.floor(position.z);
    const surface = findSurfaceY(x, z, cameraRef.position.y);
    if (!surface || getBlockAt(x, surface.y + 1, z) !== getBlockTypes().AIR) return null;
    return { x, y: surface.y, z };
}

function updateGrassOutline() {
    if (!grassOutline) return;
    const target = getGrassHit();
    if (!target) { grassOutline.visible = false; return; }
    grassOutline.position.set(target.x + 0.5, target.y + 0.505, target.z + 0.5);
    grassOutline.visible = true;
}

function punchGrass(event) {
    if (!mesh || !root?.visible || event.button !== 0) return;
    if (event.target?.closest?.("#hotbar, #inventoryScreen, button, input, select, textarea, a")) return;
    const target = getGrassHit();
    if (!target) return;
    removedGrass.add(`${target.x},${target.y},${target.z}`);
    scan();
}

function tick(now) {
    if (now - lastScan >= SCAN_INTERVAL) { lastScan = now; scan(); }
    updateGrassOutline();
    requestAnimationFrame(tick);
}

export function initShortGrass(scene, camera) {
    cameraRef = camera;
    if (!root) { root = new THREE.Group(); root.name = ROOT_NAME; root.renderOrder = 5; scene.add(root); }
    ensureMesh();
    ensureGrassOutline();
    if (!observer) {
        observer = new MutationObserver(() => { if (root) root.visible = document.body.classList.contains("webminecraft-in-world"); });
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
    if (!blockChangeHandler) {
        blockChangeHandler = (event) => {
            const d = event.detail || {};
            if (Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.z) && d.type === 0) removedGrass.delete(`${d.x},${d.y},${d.z}`);
            lastScan = performance.now(); scan();
        };
        window.addEventListener("webminecraft:blockchange", blockChangeHandler);
    }
    if (!running) { running = true; requestAnimationFrame(tick); document.addEventListener("mousedown", punchGrass); }
    scan();
}
