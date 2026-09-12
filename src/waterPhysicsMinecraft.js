import * as THREE from "three";
import { getBlockAt, getBlockTypes, CHUNK_SIZE } from "./world.js";
import { waterTexture } from "./blocks.js";

// Minecraft-style water for WebMinecraftT.
//
// Design goals:
// - source water is full-strength and effectively infinite
// - water falls before attempting horizontal flow
// - horizontal flow loses one level per block (8 -> 7 -> ... -> 1)
// - two adjacent source blocks can create a new source when supported
// - flowing water retracts when its support disappears
// - updates are queued and chunk-meshed, so stable water does no work
// - newly streamed chunk water is registered automatically

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

const fluidMaterial = new THREE.MeshLambertMaterial({
    map: waterTexture,
    color: 0x3c8fc0,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
    side: THREE.DoubleSide
});
fluidMaterial.forceSinglePass = true;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.needsUpdate = true;

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

    sources.add(k);
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
            const next = Math.max(1, MAX_LEVEL - 1);
            if (getLevel(target.x, y, target.z) < next) addCell(target.x, y, target.z, next, false);
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
        if (getLevel(target.x, y, target.z) < newLevel - 1) setLevel(target.x, y, target.z, newLevel - 1);
    }
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
    const indices = [];
    let vertex = 0;
    let count = 0;

    for (const k of cells) {
        const cell = water.get(k);
        if (!cell) continue;
        if (++count > 4500) break;

        const { x, y, z, level } = cell;
        const top = y - 0.5 + Math.max(0.125, level / MAX_LEVEL);
        const above = getLevel(x, y + 1, z);

        if (above <= 0) {
            positions.push(
                x - 0.5, top, z - 0.5,
                x + 0.5, top, z - 0.5,
                x + 0.5, top, z + 0.5,
                x - 0.5, top, z + 0.5
            );
            normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
            indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
            vertex += 4;
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = getLevel(x + dx, y, z + dz);
            if (neighbor >= level) continue;

            const sideLevel = neighbor > 0 ? neighbor : 0;
            const sideTop = y - 0.5 + Math.max(0.0625, sideLevel / MAX_LEVEL);
            let points;
            let normal;

            if (dx === 1) {
                points = [[x + 0.5, y - 0.5, z - 0.5], [x + 0.5, sideTop, z - 0.5], [x + 0.5, sideTop, z + 0.5], [x + 0.5, y - 0.5, z + 0.5]];
                normal = [1, 0, 0];
            } else if (dx === -1) {
                points = [[x - 0.5, y - 0.5, z + 0.5], [x - 0.5, sideTop, z + 0.5], [x - 0.5, sideTop, z - 0.5], [x - 0.5, y - 0.5, z - 0.5]];
                normal = [-1, 0, 0];
            } else if (dz === 1) {
                points = [[x + 0.5, y - 0.5, z + 0.5], [x + 0.5, sideTop, z + 0.5], [x - 0.5, sideTop, z + 0.5], [x - 0.5, y - 0.5, z + 0.5]];
                normal = [0, 0, 1];
            } else {
                points = [[x - 0.5, y - 0.5, z - 0.5], [x - 0.5, sideTop, z - 0.5], [x + 0.5, sideTop, z - 0.5], [x + 0.5, y - 0.5, z - 0.5]];
                normal = [0, 0, -1];
            }

            for (const point of points) positions.push(...point);
            normals.push(...normal, ...normal, ...normal, ...normal);
            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
            indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
            vertex += 4;
        }
    }

    if (!positions.length) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
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

export function setupWaterPhysics(sceneRef) {
    scene = sceneRef;
    installSceneHook();
    initialScan();
    for (const k of sources) {
        const [x, y, z] = parseKey(k);
        enqueue(x, y, z);
    }
    while (dirtyChunks.size) rebuildDirty(32);
}

export function notifyWaterBlockChanged(x, y, z, type = BLOCK.AIR) {
    const k = key(Math.floor(x), Math.floor(y), Math.floor(z));
    if (type !== BLOCK.AIR && water.has(k)) removeCell(x, y, z, true);
    dropCache.clear();
    enqueue(x, y, z);
    activateNeighbors(x, y, z);
    markCell(x, z);
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
}

if (typeof window !== "undefined") {
    const loop = () => {
        updateWaterPhysics();
        window.setTimeout(loop, 100);
    };
    window.setTimeout(loop, 100);
}
