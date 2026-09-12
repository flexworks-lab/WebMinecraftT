import * as THREE from "three";
import { getBlockAt, getBlockTypes, CHUNK_SIZE } from "./world.js";
import { waterTexture } from "./blocks.js";

// Minecraft-style water simulation tuned for a browser voxel world.
// Only active cells are evaluated; stable water does no simulation work.
const MAX_FLOW = 8;
const FLOW_INTERVAL = 125;
const MAX_CELLS_PER_STEP = 750;
const MAX_MESH_CELLS_PER_CHUNK = 4000;
const MAX_CHUNK_REBUILDS_PER_UPDATE = 4;
const MAX_WATER_CELLS = 75000;
const DROP_SEARCH_DISTANCE = 4;
const DROP_CACHE_LIMIT = 2500;

const water = new Map();
const cellsByChunk = new Map();
const activeQueue = [];
const activeSet = new Set();
const naturalSources = new Set();
const dirtyChunks = new Set();
const chunkMeshes = new Map();
const BLOCK = getBlockTypes();
let gameScene = null;
let sceneScanned = false;
let queueHead = 0;
let lastStep = performance.now();
let dropCache = new Map();

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (x, y, z) => `${x},${y},${z}`;
const parseKey = value => value.split(",").map(Number);
const chunkKey = (x, z) => `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;

const waterMaterial = new THREE.MeshLambertMaterial({
    map: waterTexture,
    color: 0x3c8fc0,
    transparent: true,
    opacity: 0.76,
    depthWrite: false,
    side: THREE.DoubleSide
});
waterMaterial.forceSinglePass = true;

function enqueue(x, y, z) {
    if (y < -32 || y > 95) return;
    const k = key(x, y, z);
    if (activeSet.has(k)) return;
    activeSet.add(k);
    activeQueue.push(k);
}

function compactQueue() {
    if (queueHead < 2048 || queueHead * 2 < activeQueue.length) return;
    activeQueue.splice(0, queueHead);
    queueHead = 0;
}

function activateNeighbors(x, y, z) {
    enqueue(x + 1, y, z);
    enqueue(x - 1, y, z);
    enqueue(x, y, z + 1);
    enqueue(x, y, z - 1);
    enqueue(x, y + 1, z);
    enqueue(x, y - 1, z);
}

function markChunkDirty(x, z) {
    dirtyChunks.add(chunkKey(x, z));
}

function markCellDirty(x, z) {
    markChunkDirty(x, z);
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    if (cx !== Math.floor((x + 1) / CHUNK_SIZE)) markChunkDirty(x + 1, z);
    if (cx !== Math.floor((x - 1) / CHUNK_SIZE)) markChunkDirty(x - 1, z);
    if (cz !== Math.floor((z + 1) / CHUNK_SIZE)) markChunkDirty(x, z + 1);
    if (cz !== Math.floor((z - 1) / CHUNK_SIZE)) markChunkDirty(x, z - 1);
}

function setWater(x, y, z, level) {
    if (level <= 0 || y < -32 || y > 95) return false;
    const k = key(x, y, z);
    const existing = water.get(k);
    const old = existing?.level || 0;
    if (level <= old) return false;

    if (existing) existing.level = level;
    else {
        if (water.size >= MAX_WATER_CELLS) return false;
        water.set(k, { x, y, z, level });
        const ck = chunkKey(x, z);
        let cells = cellsByChunk.get(ck);
        if (!cells) { cells = new Set(); cellsByChunk.set(ck, cells); }
        cells.add(k);
    }

    enqueue(x, y, z);
    markCellDirty(x, z);
    return true;
}

function removeWater(x, y, z, force = false) {
    const k = key(x, y, z);
    if (!water.has(k) || (!force && naturalSources.has(k))) return false;

    water.delete(k);
    naturalSources.delete(k);

    const ck = chunkKey(x, z);
    const cells = cellsByChunk.get(ck);
    if (cells) {
        cells.delete(k);
        if (!cells.size) cellsByChunk.delete(ck);
    }

    markCellDirty(x, z);
    activateNeighbors(x, y, z);
    return true;
}

function setWaterLevel(x, y, z, level) {
    if (level <= 0) return removeWater(x, y, z);
    const k = key(x, y, z);
    const cell = water.get(k);
    if (!cell) return setWater(x, y, z, level);

    if (naturalSources.has(k)) {
        if (cell.level !== MAX_FLOW) {
            cell.level = MAX_FLOW;
            markCellDirty(x, z);
        }
        enqueue(x, y, z);
        return true;
    }

    if (cell.level === level) return false;
    cell.level = level;
    enqueue(x, y, z);
    markCellDirty(x, z);
    activateNeighbors(x, y, z);
    return true;
}

function isOpen(x, y, z) {
    return y >= -32 && y <= 95 && getBlockAt(x, y, z) === BLOCK.AIR;
}

function registerExistingWaterMesh(mesh) {
    if (!mesh || mesh.userData?.isDynamicWater) return;
    mesh.visible = false;
    const position = mesh.geometry?.getAttribute("position");
    if (!position) return;

    const seen = new Set();
    for (let i = 0; i < position.count; i += 3) {
        const x = Math.floor(position.getX(i) + mesh.position.x);
        const y = Math.floor(position.getY(i) + mesh.position.y);
        const z = Math.floor(position.getZ(i) + mesh.position.z);
        const k = key(x, y, z);
        if (seen.has(k)) continue;
        seen.add(k);
        naturalSources.add(k);
        setWater(x, y, z, MAX_FLOW);
    }
}

function scanSceneForWater() {
    if (!gameScene || sceneScanned) return;
    sceneScanned = true;
    gameScene.traverse(object => {
        if (!object.isMesh || object.userData?.isDynamicWater) return;
        if (object.userData?.isWater || object.name?.toLowerCase().includes("water")) registerExistingWaterMesh(object);
    });
}

function removeChunkMesh(ck) {
    const mesh = chunkMeshes.get(ck);
    if (!mesh) return;
    gameScene.remove(mesh);
    mesh.geometry.dispose();
    chunkMeshes.delete(ck);
}

function rebuildChunk(ck) {
    if (!gameScene) return;
    const cells = cellsByChunk.get(ck);
    if (!cells || !cells.size) {
        removeChunkMesh(ck);
        return;
    }

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let vertex = 0;
    let cellCount = 0;

    for (const k of cells) {
        const cell = water.get(k);
        if (!cell || cell.level <= 0) continue;
        if (++cellCount > MAX_MESH_CELLS_PER_CHUNK) break;

        const { x, y, z, level } = cell;
        const height = level >= MAX_FLOW ? 1 : Math.max(0.125, level / MAX_FLOW);
        const topY = y - 0.5 + height;
        const above = water.get(key(x, y + 1, z))?.level || 0;

        if (above <= 0) {
            positions.push(
                x - 0.5, topY, z - 0.5,
                x + 0.5, topY, z - 0.5,
                x + 0.5, topY, z + 0.5,
                x - 0.5, topY, z + 0.5
            );
            normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            uvs.push(0,0, 1,0, 1,1, 0,1);
            indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
            vertex += 4;
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = water.get(key(x + dx, y, z + dz))?.level || 0;
            if (neighbor >= level) continue;
            const sideHeight = Math.max(0.125, neighbor / MAX_FLOW);
            const nh = y - 0.5 + sideHeight;
            let p, normal;

            if (dx === 1) {
                p = [[x + 0.5,y - 0.5,z - 0.5],[x + 0.5,nh,z - 0.5],[x + 0.5,nh,z + 0.5],[x + 0.5,y - 0.5,z + 0.5]];
                normal = [1,0,0];
            } else if (dx === -1) {
                p = [[x - 0.5,y - 0.5,z + 0.5],[x - 0.5,nh,z + 0.5],[x - 0.5,nh,z - 0.5],[x - 0.5,y - 0.5,z - 0.5]];
                normal = [-1,0,0];
            } else if (dz === 1) {
                p = [[x + 0.5,y - 0.5,z + 0.5],[x + 0.5,nh,z + 0.5],[x - 0.5,nh,z + 0.5],[x - 0.5,y - 0.5,z + 0.5]];
                normal = [0,0,1];
            } else {
                p = [[x - 0.5,y - 0.5,z - 0.5],[x - 0.5,nh,z - 0.5],[x + 0.5,nh,z - 0.5],[x + 0.5,y - 0.5,z - 0.5]];
                normal = [0,0,-1];
            }

            for (const v of p) positions.push(...v);
            normals.push(...normal,...normal,...normal,...normal);
            uvs.push(0,0, 1,0, 1,1, 0,1);
            indices.push(vertex,vertex+1,vertex+2,vertex,vertex+2,vertex+3);
            vertex += 4;
        }
    }

    removeChunkMesh(ck);
    if (!positions.length) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, waterMaterial);
    mesh.userData.isDynamicWater = true;
    mesh.userData.waterChunk = ck;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    chunkMeshes.set(ck, mesh);
    gameScene.add(mesh);
}

function rebuildDirtyChunks(limit = MAX_CHUNK_REBUILDS_PER_UPDATE) {
    if (!gameScene || !dirtyChunks.size) return;
    let count = 0;
    for (const ck of dirtyChunks) {
        dirtyChunks.delete(ck);
        rebuildChunk(ck);
        if (++count >= limit) break;
    }
}

function findNearestDropDistance(x, y, z) {
    const cacheKey = `${x},${y},${z}`;
    const cached = dropCache.get(cacheKey);
    if (cached !== undefined) return cached;

    let result = Infinity;
    if (!isOpen(x, y, z)) {
        result = Infinity;
    } else if (isOpen(x, y - 1, z)) {
        result = 0;
    } else {
        const queue = [[x, z, 0]];
        const visited = new Set([`${x},${z}`]);
        let head = 0;
        while (head < queue.length) {
            const [cx, cz, distance] = queue[head++];
            if (distance >= DROP_SEARCH_DISTANCE) continue;
            for (const [dx, dz] of DIRS) {
                const nx = cx + dx;
                const nz = cz + dz;
                const d = distance + 1;
                const k = `${nx},${nz}`;
                if (visited.has(k) || !isOpen(nx, y, nz)) continue;
                visited.add(k);
                if (isOpen(nx, y - 1, nz)) {
                    result = d;
                    queue.length = 0;
                    break;
                }
                queue.push([nx, nz, d]);
            }
        }
    }

    if (dropCache.size >= DROP_CACHE_LIMIT) dropCache.clear();
    dropCache.set(cacheKey, result);
    return result;
}

function getPreferredHorizontalDirections(x, y, z) {
    const candidates = [];
    let bestWeight = Infinity;
    for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;
        if (!isOpen(nx, y, nz)) continue;
        const weight = findNearestDropDistance(nx, y, nz);
        if (weight < bestWeight) bestWeight = weight;
        candidates.push({ dx, dz, weight });
    }
    return candidates.filter(candidate => candidate.weight === bestWeight);
}

function tryFlowDown(x, y, z) {
    if (!isOpen(x, y - 1, z)) return false;
    const below = water.get(key(x, y - 1, z))?.level || 0;
    if (below < MAX_FLOW) setWaterLevel(x, y - 1, z, MAX_FLOW);
    return true;
}

function spreadHorizontal(x, y, z, level) {
    if (level <= 1) return;
    const nextLevel = level - 1;
    for (const { dx, dz } of getPreferredHorizontalDirections(x, y, z)) {
        const nx = x + dx;
        const nz = z + dz;
        const current = water.get(key(nx, y, nz))?.level || 0;
        if (current < nextLevel) setWater(nx, y, nz, nextLevel);
    }
}

function tryCreateSource(x, y, z) {
    if (!isOpen(x, y, z) || getBlockAt(x, y - 1, z) === BLOCK.AIR) return false;
    let sourceCount = 0;
    for (const [dx, dz] of DIRS) {
        if (naturalSources.has(key(x + dx, y, z + dz))) sourceCount++;
    }
    if (sourceCount < 2) return false;
    const k = key(x, y, z);
    naturalSources.add(k);
    setWater(x, y, z, MAX_FLOW);
    return true;
}

function updateFlowCell(x, y, z) {
    const k = key(x, y, z);
    const cell = water.get(k);

    if (cell && !isOpen(x, y, z)) {
        removeWater(x, y, z, true);
        return;
    }

    tryCreateSource(x, y, z);
    const currentCell = water.get(k);
    if (!currentCell) {
        let desired = 0;
        for (const [dx, dz] of DIRS) {
            const neighbor = water.get(key(x + dx, y, z + dz))?.level || 0;
            if (neighbor > 1) desired = Math.max(desired, neighbor - 1);
        }
        if (desired > 0) setWater(x, y, z, desired);
        return;
    }

    if (naturalSources.has(k)) {
        setWaterLevel(x, y, z, MAX_FLOW);
        if (tryFlowDown(x, y, z)) return;
        spreadHorizontal(x, y, z, MAX_FLOW);
        return;
    }

    if (tryFlowDown(x, y, z)) return;

    const above = water.get(key(x, y + 1, z))?.level || 0;
    if (above > 0) {
        setWaterLevel(x, y, z, MAX_FLOW);
        return;
    }

    let bestLevel = 0;
    for (const [dx, dz] of DIRS) {
        const neighbor = water.get(key(x + dx, y, z + dz))?.level || 0;
        bestLevel = Math.max(bestLevel, neighbor - 1);
    }

    if (bestLevel <= 0) {
        removeWater(x, y, z);
        return;
    }

    bestLevel = Math.min(MAX_FLOW - 1, bestLevel);
    setWaterLevel(x, y, z, bestLevel);
    spreadHorizontal(x, y, z, bestLevel);
}

function stepWater() {
    const budget = Math.min(MAX_CELLS_PER_STEP, activeQueue.length - queueHead);
    let processed = 0;
    dropCache.clear();

    while (processed < budget && queueHead < activeQueue.length) {
        const k = activeQueue[queueHead++];
        activeSet.delete(k);
        const [x, y, z] = parseKey(k);
        updateFlowCell(x, y, z);
        processed++;
    }

    compactQueue();
}

export function setupWaterPhysics(scene) {
    gameScene = scene;
    scanSceneForWater();
    for (const k of naturalSources) {
        const [x, y, z] = parseKey(k);
        enqueue(x, y, z);
    }
    while (dirtyChunks.size) rebuildDirtyChunks(32);
}

export function updateWaterPhysics() {
    if (!gameScene) return;
    const now = performance.now();
    if (now - lastStep >= FLOW_INTERVAL && activeQueue.length > queueHead) {
        lastStep = now;
        stepWater();
    }
    rebuildDirtyChunks();
}

export function notifyWaterBlockChanged(x, y, z, type = BLOCK.AIR) {
    if (type !== BLOCK.AIR && water.has(key(x, y, z))) removeWater(x, y, z, true);
    dropCache.clear();
    enqueue(x, y, z);
    activateNeighbors(x, y, z);
    markCellDirty(x, z);
    markCellDirty(x + 1, z);
    markCellDirty(x - 1, z);
    markCellDirty(x, z + 1);
    markCellDirty(x, z - 1);
}

if (typeof window !== "undefined") {
    window.addEventListener("webminecraft:blockchange", event => {
        const detail = event.detail || {};
        if (!Number.isFinite(detail.x) || !Number.isFinite(detail.y) || !Number.isFinite(detail.z)) return;
        notifyWaterBlockChanged(detail.x, detail.y, detail.z, detail.type ?? BLOCK.AIR);
    });
}

const originalSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
    const result = originalSceneAdd.apply(this, objects);
    if (!gameScene) gameScene = this;
    return result;
};

function waterLoop() {
    updateWaterPhysics();
    setTimeout(waterLoop, 100);
}
setTimeout(waterLoop, 100);
