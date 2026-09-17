import * as THREE from "three";
import { getBlockAt, getBlockTypes, CHUNK_SIZE } from "./world.js";
import { waterTexture } from "./blocks.js";

const SOURCE_LEVEL = 0;
const MAX_LEVEL = 7;
const MIN_Y = -32;
const MAX_Y = 95;

const FLOW_INTERVAL = 500;
const MAX_CELLS_PER_TICK = 1400;
const MAX_CHUNK_REBUILDS_PER_TICK = 6;
const MAX_WATER_CELLS = 90000;
const DROP_SEARCH = 4;
const ACTIVE_QUEUE_LIMIT = 120000;

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BLOCK = getBlockTypes();

const water = new Map();
const chunkCells = new Map();
const active = [];
const activeSet = new Set();
const dirtyChunks = new Set();
const dynamicMeshes = new Map();
const loadedChunkRefs = new Map();
const staticWaterOwners = new WeakMap();
const sourceOwnerCounts = new Map();
const dropCache = new Map();

let scene = null;
let sceneHooksInstalled = false;
let queueHead = 0;
let lastTick = 0;
let initialized = false;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.ClampToEdgeWrapping;
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
    depthTest: true,
    side: THREE.DoubleSide,
    shininess: 85,
    specular: 0x8fcfe8,
    emissive: 0x071a22,
    emissiveIntensity: 0.08,
    vertexColors: true
});
fluidMaterial.forceSinglePass = true;

const key = (x, y, z) => `${x},${y},${z}`;
const parseKey = value => value.split(",").map(Number);
const chunkKey = (x, z) => `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;
const floorCoord = value => Math.floor(Number(value));

function enqueue(x, y, z) {
    x = floorCoord(x); y = floorCoord(y); z = floorCoord(z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    if (y < MIN_Y || y > MAX_Y) return;
    const k = key(x, y, z);
    if (activeSet.has(k) || active.length - queueHead >= ACTIVE_QUEUE_LIMIT) return;
    activeSet.add(k);
    active.push(k);
}

function activateNeighbors(x, y, z) {
    enqueue(x + 1, y, z); enqueue(x - 1, y, z);
    enqueue(x, y + 1, z); enqueue(x, y - 1, z);
    enqueue(x, y, z + 1); enqueue(x, y, z - 1);
}

function compactQueue() {
    if (queueHead < 4096 || queueHead * 2 < active.length) return;
    active.splice(0, queueHead);
    queueHead = 0;
}

function markCell(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    dirtyChunks.add(chunkKey(x, z));
    if (Math.floor((x + 1) / CHUNK_SIZE) !== cx) dirtyChunks.add(chunkKey(x + 1, z));
    if (Math.floor((x - 1) / CHUNK_SIZE) !== cx) dirtyChunks.add(chunkKey(x - 1, z));
    if (Math.floor((z + 1) / CHUNK_SIZE) !== cz) dirtyChunks.add(chunkKey(x, z + 1));
    if (Math.floor((z - 1) / CHUNK_SIZE) !== cz) dirtyChunks.add(chunkKey(x, z - 1));
}

function isWorldAir(x, y, z) {
    return y >= MIN_Y && y <= MAX_Y && getBlockAt(x, y, z) === BLOCK.AIR;
}

function getWater(x, y, z) { return water.get(key(x, y, z)) || null; }
function isFullWater(cell) { return !!cell && (cell.level === SOURCE_LEVEL || cell.falling || cell.source); }
function isSupported(x, y, z) {
    if (y <= MIN_Y || getBlockAt(x, y - 1, z) !== BLOCK.AIR) return true;
    return isFullWater(getWater(x, y - 1, z));
}

function makeState(level, falling = false, source = false, createdSource = false) {
    if (source) return { level: SOURCE_LEVEL, falling: false, source: true, createdSource };
    if (falling) return { level: SOURCE_LEVEL, falling: true, source: false, createdSource: false };
    return { level: THREE.MathUtils.clamp(Math.floor(level), 1, MAX_LEVEL), falling: false, source: false, createdSource: false };
}

function sameState(a, b) {
    return !!a === !!b && (!a || (
        a.level === b.level && a.falling === b.falling &&
        a.source === b.source && a.createdSource === b.createdSource
    ));
}

function addCell(x, y, z, state, activate = true) {
    x = floorCoord(x); y = floorCoord(y); z = floorCoord(z);
    if (y < MIN_Y || y > MAX_Y || !isWorldAir(x, y, z)) return false;
    const k = key(x, y, z);
    const current = water.get(k);
    if (current) {
        const next = { ...state, createdSource: current.createdSource || state.createdSource };
        if (sameState(current, next)) return false;
        water.set(k, { ...current, ...next });
        enqueue(x, y, z); activateNeighbors(x, y, z); markCell(x, z);
        return true;
    }
    if (water.size >= MAX_WATER_CELLS) return false;
    water.set(k, { ...state });
    let cells = chunkCells.get(chunkKey(x, z));
    if (!cells) { cells = new Set(); chunkCells.set(chunkKey(x, z), cells); }
    cells.add(k);
    if (activate) { enqueue(x, y, z); activateNeighbors(x, y, z); }
    markCell(x, z);
    return true;
}

function removeCell(x, y, z) {
    const k = key(floorCoord(x), floorCoord(y), floorCoord(z));
    if (!water.has(k)) return false;
    const [cx, cy, cz] = parseKey(k);
    water.delete(k);
    const cells = chunkCells.get(chunkKey(cx, cz));
    if (cells) { cells.delete(k); if (!cells.size) chunkCells.delete(chunkKey(cx, cz)); }
    enqueue(cx, cy, cz); activateNeighbors(cx, cy, cz); markCell(cx, cz);
    return true;
}

function registerChunkRef(object) {
    if (!object?.userData?.isChunk || object.userData?.isDynamicWater) return null;
    if (object.userData.waterPhysicsChunkRegistered) return object.userData.waterPhysicsChunkKey || null;
    const geometry = object.geometry;
    if (!geometry) return null;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    if (!geometry.boundingBox) return null;
    const centerX = (geometry.boundingBox.min.x + geometry.boundingBox.max.x) * 0.5;
    const centerZ = (geometry.boundingBox.min.z + geometry.boundingBox.max.z) * 0.5;
    const ck = `${Math.floor(centerX / CHUNK_SIZE)},${Math.floor(centerZ / CHUNK_SIZE)}`;
    loadedChunkRefs.set(ck, (loadedChunkRefs.get(ck) || 0) + 1);
    object.userData.waterPhysicsChunkRegistered = true;
    object.userData.waterPhysicsChunkKey = ck;
    return ck;
}

function pruneUnloadedChunk(ck) {
    const cells = chunkCells.get(ck);
    if (!cells?.size) return;
    const boundary = [];
    for (const k of cells) {
        const [x, y, z] = parseKey(k);
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        if (lx === 0 || lx === CHUNK_SIZE - 1 || lz === 0 || lz === CHUNK_SIZE - 1) boundary.push([x, y, z]);
        sourceOwnerCounts.delete(k);
        water.delete(k);
    }
    chunkCells.delete(ck);
    dirtyChunks.delete(ck);
    for (const [x, y, z] of boundary) activateNeighbors(x, y, z);
}

function unregisterChunkRef(ck) {
    if (!ck) return;
    const next = (loadedChunkRefs.get(ck) || 1) - 1;
    if (next <= 0) { loadedChunkRefs.delete(ck); pruneUnloadedChunk(ck); }
    else loadedChunkRefs.set(ck, next);
}

function addSourceOwner(k) {
    const count = (sourceOwnerCounts.get(k) || 0) + 1;
    sourceOwnerCounts.set(k, count);
    return count;
}

function removeSourceOwner(k) {
    const count = (sourceOwnerCounts.get(k) || 0) - 1;
    if (count > 0) { sourceOwnerCounts.set(k, count); return; }
    sourceOwnerCounts.delete(k);
    const cell = water.get(k);
    if (!cell || cell.createdSource) return;
    cell.source = false;
    if (cell.level === SOURCE_LEVEL && !cell.falling) cell.level = 1;
    const [x, y, z] = parseKey(k);
    enqueue(x, y, z); activateNeighbors(x, y, z); markCell(x, z);
}

function registerWaterMesh(mesh) {
    if (!mesh || mesh.userData?.isDynamicWater || mesh.userData?.waterPhysicsRegistered) return;
    if (mesh.userData?.isWater !== true && !mesh.name?.toLowerCase().includes("water")) return;
    const position = mesh.geometry?.getAttribute("position");
    if (!position) return;
    mesh.userData.waterPhysicsRegistered = true;
    mesh.visible = false;
    const owned = new Set();
    staticWaterOwners.set(mesh, owned);

    for (let i = 0; i < position.count; i += 4) {
        const x = Math.round(position.getX(i) + (mesh.position?.x || 0));
        const y = Math.round(position.getY(i) + (mesh.position?.y || 0));
        const z = Math.round(position.getZ(i) + (mesh.position?.z || 0));
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
        const k = key(x, y, z);
        if (owned.has(k)) continue;
        owned.add(k);
        addSourceOwner(k);
        const current = water.get(k);
        if (current) {
            current.level = SOURCE_LEVEL; current.falling = false; current.source = true;
            enqueue(x, y, z); activateNeighbors(x, y, z); markCell(x, z);
        } else addCell(x, y, z, makeState(SOURCE_LEVEL, false, true), false);
    }
}

function unregisterWaterMesh(mesh) {
    const owned = staticWaterOwners.get(mesh);
    if (!owned) return;
    for (const k of owned) removeSourceOwner(k);
    staticWaterOwners.delete(mesh);
}

function registerObject(object) {
    if (!object || object.userData?.isDynamicWater) return;
    registerChunkRef(object);
    registerWaterMesh(object);
}

function unregisterObject(object) {
    if (!object || object.userData?.isDynamicWater) return;
    if (object.userData?.waterPhysicsChunkRegistered) {
        unregisterChunkRef(object.userData.waterPhysicsChunkKey);
        delete object.userData.waterPhysicsChunkRegistered;
        delete object.userData.waterPhysicsChunkKey;
    }
    unregisterWaterMesh(object);
}

function installSceneHooks() {
    if (sceneHooksInstalled) return;
    sceneHooksInstalled = true;
    const previousAdd = THREE.Scene.prototype.add;
    THREE.Scene.prototype.add = function (...objects) {
        const result = previousAdd.apply(this, objects);
        for (const object of objects) object?.traverse ? object.traverse(registerObject) : registerObject(object);
        return result;
    };
    const previousRemove = THREE.Scene.prototype.remove;
    THREE.Scene.prototype.remove = function (...objects) {
        const result = previousRemove.apply(this, objects);
        for (const object of objects) object?.traverse ? object.traverse(unregisterObject) : unregisterObject(object);
        return result;
    };
}

function scanSceneObjects() { if (scene) scene.traverse(registerObject); }
function isFluidSpace(x, y, z) { return isWorldAir(x, y, z); }

function fluidHeight(state) {
    if (!state) return 0;
    if (state.source || state.falling || state.level === SOURCE_LEVEL) return 1;
    return (MAX_LEVEL + 1 - state.level) / (MAX_LEVEL + 1);
}

function computeFlowVector(x, y, z) {
    const center = getWater(x, y, z);
    if (!center || center.falling) return { x: 0, z: 0 };
    const h = fluidHeight(center);
    let vx = h - fluidHeight(getWater(x + 1, y, z));
    vx -= h - fluidHeight(getWater(x - 1, y, z));
    let vz = h - fluidHeight(getWater(x, y, z + 1));
    vz -= h - fluidHeight(getWater(x, y, z - 1));
    const length = Math.hypot(vx, vz);
    return length < 0.0001 ? { x: 0, z: 0 } : { x: vx / length, z: vz / length };
}

function cornerHeight(x, y, z, cx, cz, fallback) {
    const xs = cx > 0 ? [0, 1] : [-1, 0];
    const zs = cz > 0 ? [0, 1] : [-1, 0];
    const samples = [];
    for (const ox of xs) for (const oz of zs) {
        const state = getWater(x + ox, y, z + oz);
        if (state) samples.push(fluidHeight(state));
    }
    if (!samples.length) return fallback;
    return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

function findDropDistance(x, y, z, dx, dz) {
    const ck = `${x},${y},${z},${dx},${dz}`;
    if (dropCache.has(ck)) return dropCache.get(ck);
    for (let step = 0; step <= DROP_SEARCH; step++) {
        const nx = x + dx * step, nz = z + dz * step;
        if (!isFluidSpace(nx, y, nz)) break;
        if (isWorldAir(nx, y - 1, nz)) { dropCache.set(ck, step); return step; }
    }
    dropCache.set(ck, Infinity);
    return Infinity;
}

function getHorizontalTargets(x, y, z) {
    const available = [];
    for (const [dx, dz] of DIRS) {
        const nx = x + dx, nz = z + dz;
        if (!isFluidSpace(nx, y, nz)) continue;
        available.push({ x: nx, z: nz, dx, dz, dropDistance: findDropDistance(nx, y, nz, dx, dz) });
    }
    if (!available.length) return [];
    const shortest = Math.min(...available.map(item => item.dropDistance));
    return Number.isFinite(shortest) ? available.filter(item => item.dropDistance === shortest) : available;
}

function countAdjacentSources(x, y, z) {
    let count = 0;
    for (const [dx, dz] of DIRS) if (getWater(x + dx, y, z + dz)?.source) count++;
    return count;
}

function tryCreateSource(x, y, z) {
    if (!isFluidSpace(x, y, z) || getWater(x, y, z) || !isSupported(x, y, z)) return null;
    return countAdjacentSources(x, y, z) >= 2 ? makeState(SOURCE_LEVEL, false, true, true) : null;
}

function strongestHorizontalNeighborLevel(x, y, z) {
    let best = Infinity;
    for (const [dx, dz] of DIRS) {
        const neighbor = getWater(x + dx, y, z + dz);
        if (!neighbor || neighbor.falling) continue;
        best = Math.min(best, neighbor.source ? SOURCE_LEVEL : neighbor.level);
    }
    return Number.isFinite(best) ? best : null;
}

function makeHorizontalFlowFromNeighbors(x, y, z) {
    const source = tryCreateSource(x, y, z);
    if (source) return source;
    const neighborLevel = strongestHorizontalNeighborLevel(x, y, z);
    if (neighborLevel == null || neighborLevel + 1 > MAX_LEVEL) return null;
    return makeState(neighborLevel + 1);
}

function evaluateCell(x, y, z, proposals) {
    const k = key(x, y, z);
    const current = water.get(k);
    if (!isWorldAir(x, y, z)) { propose(proposals, k, null); return; }

    if (!current) {
        if ((sourceOwnerCounts.get(k) || 0) > 0) { propose(proposals, k, makeState(SOURCE_LEVEL, false, true)); return; }
        const source = tryCreateSource(x, y, z);
        if (source) { propose(proposals, k, source); return; }
        const incoming = makeHorizontalFlowFromNeighbors(x, y, z);
        if (incoming) propose(proposals, k, incoming);
        return;
    }

    if (current.source) {
        propose(proposals, k, makeState(SOURCE_LEVEL, false, true, current.createdSource));
        if (isWorldAir(x, y - 1, z) && !getWater(x, y - 1, z)) {
            propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
            return;
        }
        if (isSupported(x, y, z)) for (const target of getHorizontalTargets(x, y, z)) propose(proposals, key(target.x, y, target.z), makeState(1));
        return;
    }

    const above = getWater(x, y + 1, z);
    const below = getWater(x, y - 1, z);
    const belowOpen = isWorldAir(x, y - 1, z);

    if (current.falling) {
        if (belowOpen && !below) {
            propose(proposals, k, makeState(SOURCE_LEVEL, true));
            propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
            return;
        }
        if (isSupported(x, y, z)) {
            propose(proposals, k, above && isFullWater(above) ? makeState(SOURCE_LEVEL) : (makeHorizontalFlowFromNeighbors(x, y, z) || makeState(1)));
            return;
        }
        propose(proposals, k, makeState(SOURCE_LEVEL, true));
        return;
    }

    if (belowOpen && !below) {
        propose(proposals, k, makeState(SOURCE_LEVEL, true));
        propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
        return;
    }

    if (above && isFullWater(above) && !isSupported(x, y, z)) {
        propose(proposals, k, makeState(SOURCE_LEVEL, true));
        return;
    }

    const desired = makeHorizontalFlowFromNeighbors(x, y, z);
    if (!desired) { propose(proposals, k, null); return; }
    propose(proposals, k, desired);

    if (desired.level < MAX_LEVEL && isSupported(x, y, z)) {
        const nextLevel = desired.level + 1;
        for (const target of getHorizontalTargets(x, y, z)) propose(proposals, key(target.x, y, target.z), makeState(nextLevel));
    }
}

function proposalStrength(state) {
    if (!state) return 0;
    return (state.source ? 100 : state.falling ? 75 : 1) + MAX_LEVEL - state.level;
}

function propose(proposals, k, state) {
    const previous = proposals.get(k);
    if (!previous || proposalStrength(state) > proposalStrength(previous)) proposals.set(k, state);
}

function applyProposals(proposals) {
    for (const [k, raw] of proposals) {
        const [x, y, z] = parseKey(k);
        const previous = water.get(k);
        if (!raw) { if (previous) removeCell(x, y, z); continue; }
        const next = { ...raw };
        if (previous?.source) {
            next.source = true; next.createdSource = previous.createdSource; next.level = SOURCE_LEVEL; next.falling = false;
        } else if (previous?.createdSource) next.createdSource = true;
        if (sameState(previous, next)) continue;
        if (previous) water.set(k, { ...previous, ...next });
        else {
            if (water.size >= MAX_WATER_CELLS) continue;
            water.set(k, next);
            let cells = chunkCells.get(chunkKey(x, z));
            if (!cells) { cells = new Set(); chunkCells.set(chunkKey(x, z), cells); }
            cells.add(k);
        }
        enqueue(x, y, z); activateNeighbors(x, y, z); markCell(x, z);
    }
}

function runFluidTick() {
    dropCache.clear();
    const proposals = new Map();
    let processed = 0;
    while (processed < MAX_CELLS_PER_TICK && queueHead < active.length) {
        const k = active[queueHead++];
        activeSet.delete(k);
        const [x, y, z] = parseKey(k);
        evaluateCell(x, y, z, proposals);
        processed++;
    }
    applyProposals(proposals);
    compactQueue();
}

function rotatedUvPoints(angle) {
    const radius = 0.34, cos = Math.cos(angle), sin = Math.sin(angle);
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => [
        0.5 + (u * cos - v * sin) * radius,
        0.5 + (u * sin + v * cos) * radius
    ]);
}

function pushQuad(positions, normals, uvs, colors, indices, points, normal, uvPoints, shade, vertex) {
    for (const point of points) positions.push(...point);
    for (let i = 0; i < 4; i++) { normals.push(...normal); colors.push(shade, shade, shade); }
    for (const uv of uvPoints) uvs.push(...uv);
    indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
    return vertex + 4;
}

function buildChunk(ck) {
    if (!scene || !loadedChunkRefs.has(ck)) return;
    const cells = chunkCells.get(ck);
    const old = dynamicMeshes.get(ck);
    if (old) { scene.remove(old); old.geometry.dispose(); dynamicMeshes.delete(ck); }
    if (!cells?.size) return;

    const positions = [], normals = [], uvs = [], colors = [], indices = [];
    let vertex = 0;

    for (const k of cells) {
        const cell = water.get(k);
        if (!cell) continue;
        const [x, y, z] = parseKey(k);
        const h = fluidHeight(cell), baseY = y - 0.5, topY = baseY + h;
        if (!getWater(x, y + 1, z)) {
            const flow = computeFlowVector(x, y, z);
            vertex = pushQuad(
                positions, normals, uvs, colors, indices,
                [
                    [x - 0.5, baseY + cornerHeight(x, y, z, -1, -1, h), z - 0.5],
                    [x + 0.5, baseY + cornerHeight(x, y, z, 1, -1, h), z - 0.5],
                    [x + 0.5, baseY + cornerHeight(x, y, z, 1, 1, h), z + 0.5],
                    [x - 0.5, baseY + cornerHeight(x, y, z, -1, 1, h), z + 0.5]
                ],
                [0, 1, 0],
                rotatedUvPoints(Math.atan2(flow.z, flow.x)),
                0.96,
                vertex
            );
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = getWater(x + dx, y, z + dz);
            const nh = fluidHeight(neighbor);
            if (nh >= h - 0.0001) continue;
            const sideTop = baseY + nh;
            let points, normal;
            if (dx === 1) {
                points = [[x + 0.5, baseY, z - 0.5], [x + 0.5, topY, z - 0.5], [x + 0.5, sideTop, z + 0.5], [x + 0.5, baseY, z + 0.5]];
                normal = [1, 0, 0];
            } else if (dx === -1) {
                points = [[x - 0.5, baseY, z + 0.5], [x - 0.5, topY, z + 0.5], [x - 0.5, sideTop, z - 0.5], [x - 0.5, baseY, z - 0.5]];
                normal = [-1, 0, 0];
            } else if (dz === 1) {
                points = [[x + 0.5, baseY, z + 0.5], [x + 0.5, topY, z + 0.5], [x - 0.5, sideTop, z + 0.5], [x - 0.5, baseY, z + 0.5]];
                normal = [0, 0, 1];
            } else {
                points = [[x - 0.5, baseY, z - 0.5], [x - 0.5, topY, z - 0.5], [x + 0.5, sideTop, z - 0.5], [x + 0.5, baseY, z - 0.5]];
                normal = [0, 0, -1];
            }
            vertex = pushQuad(positions, normals, uvs, colors, indices, points, normal, [[0, 0], [0, Math.max(0.15, h)], [1, Math.max(0.15, h)], [1, 0]], 0.84, vertex);
        }
    }

    if (!positions.length) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, fluidMaterial);
    mesh.userData.isDynamicWater = true;
    mesh.userData.waterChunk = ck;
    mesh.frustumCulled = true;
    dynamicMeshes.set(ck, mesh);
    scene.add(mesh);
}

function rebuildDirtyChunks(limit = MAX_CHUNK_REBUILDS_PER_TICK) {
    let rebuilt = 0;
    for (const ck of dirtyChunks) {
        dirtyChunks.delete(ck);
        buildChunk(ck);
        if (++rebuilt >= limit) break;
    }
}

export function setupWaterPhysics(sceneRef) {
    if (!sceneRef) return;
    scene = sceneRef;
    initialized = true;
    lastTick = performance.now();
    installSceneHooks();
    scanSceneObjects();
    for (const [k, cell] of water) if (cell.source) enqueue(...parseKey(k));
    while (dirtyChunks.size) rebuildDirtyChunks(64);
}

export function notifyWaterBlockChanged(x, y, z, type = BLOCK.AIR) {
    if (!initialized) return;
    x = floorCoord(x); y = floorCoord(y); z = floorCoord(z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    if (type !== BLOCK.AIR && water.has(key(x, y, z))) removeCell(x, y, z);
    dropCache.clear();
    enqueue(x, y, z); activateNeighbors(x, y, z); markCell(x, z);
}

export function updateWaterPhysics() {
    if (!initialized || !scene) return;
    const now = performance.now();
    if (now - lastTick >= FLOW_INTERVAL) { lastTick = now; runFluidTick(); }
    rebuildDirtyChunks();
}

if (typeof window !== "undefined") {
    window.addEventListener("webminecraft:blockchange", event => {
        const detail = event.detail || {};
        if (!Number.isFinite(detail.x) || !Number.isFinite(detail.y) || !Number.isFinite(detail.z)) return;
        notifyWaterBlockChanged(detail.x, detail.y, detail.z, detail.type ?? BLOCK.AIR);
    });
    const loop = () => { updateWaterPhysics(); window.setTimeout(loop, 100); };
    window.setTimeout(loop, 100);
}
