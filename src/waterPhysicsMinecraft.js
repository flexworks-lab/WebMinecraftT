import * as THREE from "three";
import { getBlockAt, getBlockTypes, CHUNK_SIZE } from "./world.js";
import { waterTexture } from "./blocks.js";

// Minecraft-style water simulation + renderer.
// Flowing water uses the real water texture on its top and sides, with
// world-aligned UVs and lightly sloped surfaces so streams read as fluid.

const MAX_LEVEL = 8;
const MIN_Y = -32;
const MAX_Y = 95;
const FLOW_INTERVAL = 125;
const MAX_CELLS_PER_STEP = 700;
const MAX_CHUNK_REBUILDS_PER_STEP = 5;
const MAX_WATER_CELLS = 65000;
const DROP_SEARCH = 7;
const DROP_CACHE_MAX = 3500;
const ACTIVE_QUEUE_LIMIT = 120000;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BLOCK = getBlockTypes();

const water = new Map();
const chunkCells = new Map();
const sources = new Set();
const active = [];
const activeSet = new Set();
const dirtyChunks = new Set();
const meshes = new Map();
const dropCache = new Map();

let scene = null;
let installed = false;
let lastStep = performance.now();
let queueHead = 0;
let animationFrame = 0;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.needsUpdate = true;

const fluidMaterial = new THREE.MeshPhongMaterial({
    map: waterTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    side: THREE.DoubleSide,
    shininess: 75,
    specular: 0x6da8c0,
    emissive: 0x071a22,
    emissiveIntensity: 0.1,
    vertexColors: true
});
fluidMaterial.forceSinglePass = true;

const key = (x, y, z) => `${x},${y},${z}`;
const parseKey = k => k.split(",").map(Number);
const chunkKey = (x, z) => `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;

function enqueue(x, y, z) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    if (y < MIN_Y || y > MAX_Y) return;
    const k = key(Math.floor(x), Math.floor(y), Math.floor(z));
    if (activeSet.has(k)) return;
    if (active.length - queueHead >= ACTIVE_QUEUE_LIMIT) return;
    activeSet.add(k);
    active.push(k);
}

function activateNeighbors(x, y, z) {
    enqueue(x + 1, y, z);
    enqueue(x - 1, y, z);
    enqueue(x, y + 1, z);
    enqueue(x, y - 1, z);
    enqueue(x, y, z + 1);
    enqueue(x, y, z - 1);
}

function compactQueue() {
    if (queueHead < 4096 || queueHead * 2 < active.length) return;
    active.splice(0, queueHead);
    queueHead = 0;
}

function markChunk(x, z) {
    dirtyChunks.add(chunkKey(x, z));
}

function markCell(x, z) {
    markChunk(x, z);
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    if (Math.floor((x + 1) / CHUNK_SIZE) !== cx) markChunk(x + 1, z);
    if (Math.floor((x - 1) / CHUNK_SIZE) !== cx) markChunk(x - 1, z);
    if (Math.floor((z + 1) / CHUNK_SIZE) !== cz) markChunk(x, z + 1);
    if (Math.floor((z - 1) / CHUNK_SIZE) !== cz) markChunk(x, z - 1);
}

function isAir(x, y, z) {
    return y >= MIN_Y && y <= MAX_Y && getBlockAt(x, y, z) === BLOCK.AIR;
}

function getLevel(x, y, z) {
    return water.get(key(x, y, z))?.level || 0;
}

function addCell(x, y, z, level, source = false) {
    if (level <= 0 || y < MIN_Y || y > MAX_Y) return false;
    const k = key(x, y, z);
    const existing = water.get(k);

    if (existing) {
        let changed = false;
        if (level !== existing.level) {
            existing.level = level;
            changed = true;
        }
        if (source && !sources.has(k)) {
            sources.add(k);
            changed = true;
        }
        if (changed) {
            enqueue(x, y, z);
            markCell(x, z);
        }
        return changed;
    }

    if (water.size >= MAX_WATER_CELLS) return false;
    const cell = { x, y, z, level };
    water.set(k, cell);

    const ck = chunkKey(x, z);
    let set = chunkCells.get(ck);
    if (!set) {
        set = new Set();
        chunkCells.set(ck, set);
    }
    set.add(k);

    if (source) sources.add(k);
    enqueue(x, y, z);
    markCell(x, z);
    return true;
}

function removeCell(x, y, z, force = false) {
    const k = key(x, y, z);
    if (!water.has(k)) return false;
    if (!force && sources.has(k)) return false;

    water.delete(k);
    sources.delete(k);

    const set = chunkCells.get(chunkKey(x, z));
    if (set) {
        set.delete(k);
        if (!set.size) chunkCells.delete(chunkKey(x, z));
    }

    markCell(x, z);
    activateNeighbors(x, y, z);
    return true;
}

function setLevel(x, y, z, level) {
    const k = key(x, y, z);
    if (level <= 0) return removeCell(x, y, z);
    if (sources.has(k)) level = MAX_LEVEL;

    const cell = water.get(k);
    if (!cell) return addCell(x, y, z, level, false);
    if (cell.level === level) return false;

    cell.level = level;
    enqueue(x, y, z);
    activateNeighbors(x, y, z);
    markCell(x, z);
    return true;
}

function registerWaterMesh(mesh) {
    if (!mesh || mesh.userData?.isDynamicWater || mesh.userData?.waterPhysicsRegistered) return;
    if (!mesh.userData?.isWater && !mesh.name?.toLowerCase().includes("water")) return;

    mesh.userData.waterPhysicsRegistered = true;
    mesh.visible = false;

    const position = mesh.geometry?.getAttribute("position");
    if (!position) return;

    const seen = new Set();
    for (let i = 0; i < position.count; i += 3) {
        const x = Math.floor(position.getX(i) + (mesh.position?.x || 0));
        const y = Math.floor(position.getY(i) + (mesh.position?.y || 0));
        const z = Math.floor(position.getZ(i) + (mesh.position?.z || 0));
        const k = key(x, y, z);
        if (seen.has(k)) continue;
        seen.add(k);
        addCell(x, y, z, MAX_LEVEL, true);
    }
}

function registerObject(object) {
    if (!object) return;
    if (object.isMesh) registerWaterMesh(object);
    if (object.traverse) object.traverse(registerWaterMesh);
}

function initialScan() {
    if (!scene) return;
    scene.traverse(registerWaterMesh);
}

function findDropDistance(x, y, z) {
    const cacheKey = `${x},${y},${z}`;
    const cached = dropCache.get(cacheKey);
    if (cached !== undefined) return cached;

    if (!isAir(x, y, z)) {
        dropCache.set(cacheKey, Infinity);
        return Infinity;
    }
    if (isAir(x, y - 1, z)) {
        dropCache.set(cacheKey, 0);
        return 0;
    }

    const queue = [[x, z, 0]];
    const visited = new Set([`${x},${z}`]);
    let head = 0;
    let result = Infinity;

    while (head < queue.length) {
        const [cx, cz, distance] = queue[head++];
        if (distance >= DROP_SEARCH) continue;

        for (const [dx, dz] of DIRS) {
            const nx = cx + dx;
            const nz = cz + dz;
            const d = distance + 1;
            const planar = `${nx},${nz}`;
            if (visited.has(planar) || !isAir(nx, y, nz)) continue;
            visited.add(planar);
            if (isAir(nx, y - 1, nz)) {
                result = d;
                head = queue.length;
                break;
            }
            queue.push([nx, nz, d]);
        }
    }

    if (dropCache.size >= DROP_CACHE_MAX) dropCache.clear();
    dropCache.set(cacheKey, result);
    return result;
}

function horizontalTargets(x, y, z) {
    let best = Infinity;
    const targets = [];

    for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;
        if (!isAir(nx, y, nz)) continue;
        const distance = findDropDistance(nx, y, nz);
        if (distance < best) best = distance;
        targets.push({ x: nx, z: nz, distance });
    }

    if (!targets.length) return [];
    if (best !== Infinity) return targets.filter(item => item.distance === best);
    return targets;
}

function tryCreateSource(x, y, z) {
    const k = key(x, y, z);
    if (!isAir(x, y, z) || sources.has(k)) return false;
    if (isAir(x, y - 1, z)) return false;

    let adjacentSources = 0;
    for (const [dx, dz] of DIRS) {
        if (sources.has(key(x + dx, y, z + dz))) adjacentSources++;
    }
    if (adjacentSources < 2) return false;

    addCell(x, y, z, MAX_LEVEL, true);
    return true;
}

function updateCell(x, y, z) {
    const k = key(x, y, z);
    let cell = water.get(k);

    if (cell && !isAir(x, y, z)) {
        removeCell(x, y, z, true);
        return;
    }

    tryCreateSource(x, y, z);
    cell = water.get(k);

    if (!cell) {
        let desired = 0;
        for (const [dx, dz] of DIRS) {
            const neighbor = getLevel(x + dx, y, z + dz);
            if (neighbor >= 2) desired = Math.max(desired, neighbor - 1);
        }
        if (desired > 0) setLevel(x, y, z, desired);
        return;
    }

    if (sources.has(k)) {
        if (cell.level !== MAX_LEVEL) {
            cell.level = MAX_LEVEL;
            markCell(x, z);
        }

        if (isAir(x, y - 1, z)) {
            addCell(x, y - 1, z, MAX_LEVEL, false);
            return;
        }

        for (const target of horizontalTargets(x, y, z)) {
            if (getLevel(target.x, y, target.z) < MAX_LEVEL - 1) {
                addCell(target.x, y, target.z, MAX_LEVEL - 1, false);
            }
        }
        return;
    }

    if (isAir(x, y - 1, z)) {
        addCell(x, y - 1, z, MAX_LEVEL, false);
        return;
    }

    const above = getLevel(x, y + 1, z);
    if (above > 0) {
        setLevel(x, y, z, MAX_LEVEL);
        return;
    }

    let bestFromNeighbors = 0;
    for (const [dx, dz] of DIRS) {
        bestFromNeighbors = Math.max(bestFromNeighbors, getLevel(x + dx, y, z + dz) - 1);
    }

    if (bestFromNeighbors <= 0) {
        removeCell(x, y, z);
        return;
    }

    const newLevel = Math.min(MAX_LEVEL - 1, bestFromNeighbors);
    setLevel(x, y, z, newLevel);

    for (const target of horizontalTargets(x, y, z)) {
        if (getLevel(target.x, y, target.z) < newLevel - 1) {
            setLevel(target.x, y, target.z, newLevel - 1);
        }
    }
}

function levelHeight(level) {
    return Math.max(0.0625, level / MAX_LEVEL);
}

function cornerHeight(x, y, z, dx, dz, currentLevel) {
    if (currentLevel >= MAX_LEVEL) return levelHeight(MAX_LEVEL);

    const sx = dx > 0 ? 0 : -1;
    const sz = dz > 0 ? 0 : -1;
    const samples = [currentLevel];
    const candidates = [
        getLevel(x + sx, y, z),
        getLevel(x, y, z + sz),
        getLevel(x + sx, y, z + sz)
    ];

    for (const level of candidates) {
        if (level > 0) samples.push(level);
    }

    const average = samples.reduce((sum, level) => sum + level, 0) / samples.length;
    return levelHeight(average);
}

function pushQuad(positions, normals, uvs, colors, indices, points, normal, uvPoints, shade, vertex) {
    for (const point of points) positions.push(...point);
    for (let i = 0; i < 4; i++) {
        normals.push(...normal);
        colors.push(shade, shade, shade);
    }
    for (const uv of uvPoints) uvs.push(...uv);
    indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
    return vertex + 4;
}

function buildChunk(ck) {
    if (!scene) return;

    const cells = chunkCells.get(ck);
    const old = meshes.get(ck);
    if (old) {
        scene.remove(old);
        old.geometry.dispose();
        meshes.delete(ck);
    }
    if (!cells || !cells.size) return;

    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];
    let vertex = 0;
    let count = 0;

    for (const k of cells) {
        const cell = water.get(k);
        if (!cell) continue;
        if (++count > 4500) break;

        const { x, y, z, level } = cell;
        const above = getLevel(x, y + 1, z);
        const current = levelHeight(level);
        const baseY = y - 0.5;
        const flowShade = 0.94 + 0.06 * (level / MAX_LEVEL);

        if (above <= 0) {
            const hNW = baseY + cornerHeight(x, y, z, -1, -1, level);
            const hNE = baseY + cornerHeight(x, y, z, 1, -1, level);
            const hSE = baseY + cornerHeight(x, y, z, 1, 1, level);
            const hSW = baseY + cornerHeight(x, y, z, -1, 1, level);

            vertex = pushQuad(
                positions,
                normals,
                uvs,
                colors,
                indices,
                [
                    [x - 0.5, hNW, z - 0.5],
                    [x + 0.5, hNE, z - 0.5],
                    [x + 0.5, hSE, z + 0.5],
                    [x - 0.5, hSW, z + 0.5]
                ],
                [0, 1, 0],
                [[0, 0], [1, 0], [1, 1], [0, 1]],
                flowShade,
                vertex
            );
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = getLevel(x + dx, y, z + dz);
            if (neighbor >= level) continue;

            const sideLevel = neighbor > 0 ? neighbor : 0;
            const sideTop = baseY + levelHeight(sideLevel);
            const topA = current;
            const topB = current;
            let points;
            let normal;

            if (dx === 1) {
                points = [
                    [x + 0.5, baseY, z - 0.5],
                    [x + 0.5, sideTop, z - 0.5],
                    [x + 0.5, sideTop, z + 0.5],
                    [x + 0.5, baseY, z + 0.5]
                ];
                normal = [1, 0, 0];
            } else if (dx === -1) {
                points = [
                    [x - 0.5, baseY, z + 0.5],
                    [x - 0.5, sideTop, z + 0.5],
                    [x - 0.5, sideTop, z - 0.5],
                    [x - 0.5, baseY, z - 0.5]
                ];
                normal = [-1, 0, 0];
            } else if (dz === 1) {
                points = [
                    [x + 0.5, baseY, z + 0.5],
                    [x + 0.5, sideTop, z + 0.5],
                    [x - 0.5, sideTop, z + 0.5],
                    [x - 0.5, baseY, z + 0.5]
                ];
                normal = [0, 0, 1];
            } else {
                points = [
                    [x - 0.5, baseY, z - 0.5],
                    [x - 0.5, sideTop, z - 0.5],
                    [x + 0.5, sideTop, z - 0.5],
                    [x + 0.5, baseY, z - 0.5]
                ];
                normal = [0, 0, -1];
            }

            const horizontalAxis = dx !== 0;
            const uvPoints = horizontalAxis
                ? [[0, 0], [0, topA], [1, topB], [1, 0]]
                : [[0, 0], [0, topA], [1, topB], [1, 0]];

            vertex = pushQuad(
                positions,
                normals,
                uvs,
                colors,
                indices,
                points,
                normal,
                uvPoints,
                Math.max(0.82, flowShade - 0.08),
                vertex
            );
        }
    }

    if (!positions.length) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, fluidMaterial);
    mesh.userData.isDynamicWater = true;
    mesh.userData.waterChunk = ck;
    mesh.frustumCulled = true;
    meshes.set(ck, mesh);
    scene.add(mesh);
}

function rebuildDirty(limit = MAX_CHUNK_REBUILDS_PER_STEP) {
    if (!scene) return;
    let done = 0;
    for (const ck of dirtyChunks) {
        dirtyChunks.delete(ck);
        buildChunk(ck);
        if (++done >= limit) break;
    }
}

function step() {
    dropCache.clear();
    const budget = Math.min(MAX_CELLS_PER_STEP, active.length - queueHead);
    let done = 0;

    while (done < budget && queueHead < active.length) {
        const k = active[queueHead++];
        activeSet.delete(k);
        const [x, y, z] = parseKey(k);
        updateCell(x, y, z);
        done++;
    }

    compactQueue();
}

function installSceneHook() {
    if (installed) return;
    installed = true;

    const originalAdd = THREE.Scene.prototype.add;
    THREE.Scene.prototype.add = function (...objects) {
        const result = originalAdd.apply(this, objects);
        for (const object of objects) registerObject(object);
        return result;
    };
}

function animateTexture() {
    const speed = 0.018;
    waterTexture.offset.x = (performance.now() * speed * 0.001) % 1;
    waterTexture.offset.y = (performance.now() * speed * 0.00065) % 1;
    animationFrame = window.setTimeout(animateTexture, 90);
}

export function setupWaterPhysics(sceneRef) {
    scene = sceneRef;
    installSceneHook();
    initialScan();

    for (const k of sources) {
        const [x, y, z] = parseKey(k);
        enqueue(x, y, z);
    }

    while (dirtyChunks.size) rebuildDirty(32);

    if (typeof window !== "undefined" && !animationFrame) animateTexture();
}

export function notifyWaterBlockChanged(x, y, z, type = BLOCK.AIR) {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    const cellZ = Math.floor(z);
    const k = key(cellX, cellY, cellZ);

    if (type !== BLOCK.AIR && water.has(k)) removeCell(cellX, cellY, cellZ, true);
    dropCache.clear();
    enqueue(cellX, cellY, cellZ);
    activateNeighbors(cellX, cellY, cellZ);
    markCell(cellX, cellZ);
}

export function updateWaterPhysics() {
    if (!scene) return;

    const now = performance.now();
    if (now - lastStep >= FLOW_INTERVAL && queueHead < active.length) {
        lastStep = now;
        step();
    }

    rebuildDirty();
}

if (typeof window !== "undefined") {
    window.addEventListener("webminecraft:blockchange", event => {
        const detail = event.detail || {};
        if (!Number.isFinite(detail.x) || !Number.isFinite(detail.y) || !Number.isFinite(detail.z)) return;
        notifyWaterBlockChanged(detail.x, detail.y, detail.z, detail.type ?? BLOCK.AIR);
    });

    const loop = () => {
        updateWaterPhysics();
        window.setTimeout(loop, 100);
    };
    window.setTimeout(loop, 100);
}
