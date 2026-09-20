import * as THREE from "three";
import {
    getBlockAt,
    getBlockTypes,
    getTerrainProfile,
    CHUNK_SIZE,
    SEA_LEVEL,
    MIN_Y,
    WORLD_TOP
} from "./world.js";
import { waterTexture } from "./blocks.js";

const SOURCE_LEVEL = 0;
const MAX_LEVEL = 7;
const FLOW_INTERVAL = 250;
const MAX_CELLS_PER_TICK = 1800;
const MAX_CHUNK_REBUILDS_PER_TICK = 8;
const MAX_WATER_CELLS = 90000;
const ACTIVE_QUEUE_LIMIT = 120000;

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BLOCK = getBlockTypes();

const water = new Map();
const chunkCells = new Map();
const activeQueue = [];
const activeSet = new Set();
const dirtyChunks = new Set();
const dynamicMeshes = new Map();
const loadedChunks = new Set();
const pendingChunkPrunes = new Map();

let scene = null;
let initialized = false;
let hooksInstalled = false;
let queueHead = 0;
let lastTick = 0;

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
    opacity: 0.8,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    shininess: 95,
    specular: 0x8fd5ec,
    emissive: 0x071b24,
    emissiveIntensity: 0.08,
    flatShading: false
});
fluidMaterial.forceSinglePass = true;

const key = (x, y, z) => Math.floor(x) + "," + Math.floor(y) + "," + Math.floor(z);
const parseKey = value => value.split(",").map(Number);
const chunkKey = (x, z) => Math.floor(x / CHUNK_SIZE) + "," + Math.floor(z / CHUNK_SIZE);
const floorCoord = value => Math.floor(Number(value));

function enqueue(x, y, z) {
    x = floorCoord(x);
    y = floorCoord(y);
    z = floorCoord(z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
    if (y < MIN_Y || y > WORLD_TOP) return;
    const k = key(x, y, z);
    if (activeSet.has(k) || activeQueue.length - queueHead >= ACTIVE_QUEUE_LIMIT) return;
    activeSet.add(k);
    activeQueue.push(k);
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
    if (queueHead < 4096 || queueHead * 2 < activeQueue.length) return;
    activeQueue.splice(0, queueHead);
    queueHead = 0;
}

function markChunkDirty(x, z) {
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    dirtyChunks.add(cx + "," + cz);

    if (Math.floor((x + 1) / CHUNK_SIZE) !== cx) dirtyChunks.add(chunkKey(x + 1, z));
    if (Math.floor((x - 1) / CHUNK_SIZE) !== cx) dirtyChunks.add(chunkKey(x - 1, z));
    if (Math.floor((z + 1) / CHUNK_SIZE) !== cz) dirtyChunks.add(chunkKey(x, z + 1));
    if (Math.floor((z - 1) / CHUNK_SIZE) !== cz) dirtyChunks.add(chunkKey(x, z - 1));
}

function isLoaded(x, z) {
    return loadedChunks.has(chunkKey(x, z));
}

function isAir(x, y, z) {
    return isLoaded(x, z) && y >= MIN_Y && y <= WORLD_TOP && getBlockAt(x, y, z) === BLOCK.AIR;
}

function getWater(x, y, z) {
    return water.get(key(x, y, z)) || null;
}

function isFullWater(state) {
    return !!state && (state.source || state.falling || state.level === SOURCE_LEVEL);
}

function waterHeight(state) {
    if (!state) return 0;
    if (state.source || state.falling || state.level === SOURCE_LEVEL) return 1;
    return Math.max(0.125, (MAX_LEVEL + 1 - state.level) / (MAX_LEVEL + 1));
}

function isSolidBelow(x, y, z) {
    if (!isLoaded(x, z)) return false;
    return getBlockAt(x, y - 1, z) !== BLOCK.AIR;
}

function isSupported(x, y, z) {
    return isSolidBelow(x, y, z) || !!getWater(x, y - 1, z);
}

function makeState(level, falling = false, source = false, generatedSource = false) {
    if (source) return { level: SOURCE_LEVEL, falling: false, source: true, generatedSource: !!generatedSource };
    if (falling) return { level: SOURCE_LEVEL, falling: true, source: false, generatedSource: false };
    return {
        level: THREE.MathUtils.clamp(Math.floor(level), 1, MAX_LEVEL),
        falling: false,
        source: false,
        generatedSource: false
    };
}

function sameState(a, b) {
    return !!a === !!b && (!a || (
        a.level === b.level &&
        a.falling === b.falling &&
        a.source === b.source &&
        a.generatedSource === b.generatedSource
    ));
}

function addCell(x, y, z, state, activate = true) {
    x = floorCoord(x);
    y = floorCoord(y);
    z = floorCoord(z);
    if (!isAir(x, y, z)) return false;

    const k = key(x, y, z);
    const current = water.get(k);
    if (current) {
        if (current.source && !state.source) return false;
        if (sameState(current, state)) return false;
        water.set(k, state);
    } else {
        if (water.size >= MAX_WATER_CELLS) return false;
        water.set(k, state);

        const ck = chunkKey(x, z);
        let cells = chunkCells.get(ck);
        if (!cells) {
            cells = new Set();
            chunkCells.set(ck, cells);
        }
        cells.add(k);
    }

    if (activate) {
        enqueue(x, y, z);
        activateNeighbors(x, y, z);
    }
    markChunkDirty(x, z);
    return true;
}

function removeCell(x, y, z) {
    const k = key(x, y, z);
    if (!water.has(k)) return false;

    water.delete(k);
    const ck = chunkKey(x, z);
    const cells = chunkCells.get(ck);
    if (cells) {
        cells.delete(k);
        if (!cells.size) chunkCells.delete(ck);
    }

    enqueue(x, y, z);
    activateNeighbors(x, y, z);
    markChunkDirty(x, z);
    return true;
}

function clearDynamicMeshes() {
    if (!scene) {
        dynamicMeshes.clear();
        return;
    }
    for (const mesh of dynamicMeshes.values()) {
        scene.remove(mesh);
        mesh.geometry?.dispose();
    }
    dynamicMeshes.clear();
}

function resetState() {
    clearDynamicMeshes();
    water.clear();
    chunkCells.clear();
    activeQueue.length = 0;
    activeSet.clear();
    dirtyChunks.clear();
    loadedChunks.clear();
    pendingChunkPrunes.clear();
    queueHead = 0;
    lastTick = performance.now();
}

function seedOceanChunk(ck) {
    const parts = ck.split(",").map(Number);
    const chunkX = parts[0];
    const chunkZ = parts[1];
    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            const x = startX + lx;
            const z = startZ + lz;
            if (getTerrainProfile(x, z).height >= SEA_LEVEL) continue;
            if (!isAir(x, SEA_LEVEL, z)) continue;

            const k = key(x, SEA_LEVEL, z);
            const current = water.get(k);
            if (current?.source) continue;

            addCell(x, SEA_LEVEL, z, makeState(SOURCE_LEVEL, false, true, false), false);
            enqueue(x, SEA_LEVEL, z);
            activateNeighbors(x, SEA_LEVEL, z);
            markChunkDirty(x, z);
        }
    }
}

function scheduleChunkPrune(ck) {
    if (pendingChunkPrunes.has(ck)) return;
    const timer = window.setTimeout(() => {
        pendingChunkPrunes.delete(ck);
        if (loadedChunks.has(ck)) return;

        const cells = chunkCells.get(ck);
        if (cells) {
            for (const k of cells) water.delete(k);
            chunkCells.delete(ck);
        }

        const mesh = dynamicMeshes.get(ck);
        if (mesh) {
            scene?.remove(mesh);
            mesh.geometry?.dispose();
            dynamicMeshes.delete(ck);
        }

        dirtyChunks.delete(ck);

        for (const boundaryKey of [...water.keys()]) {
            const [x, y, z] = parseKey(boundaryKey);
            if (chunkKey(x, z) !== ck) continue;
            enqueue(x, y, z);
            activateNeighbors(x, y, z);
        }
    }, 0);
    pendingChunkPrunes.set(ck, timer);
}

function registerChunk(object) {
    if (!object?.userData?.isChunk || object.userData?.isWater || object.userData?.isDynamicWater) return;
    const geometry = object.geometry;
    if (!geometry) return;

    const chunkX = Number.isFinite(object.userData.chunkX)
        ? object.userData.chunkX
        : Math.floor(((geometry.boundingBox?.min.x ?? 0) + (geometry.boundingBox?.max.x ?? 0)) * 0.5 / CHUNK_SIZE);
    const chunkZ = Number.isFinite(object.userData.chunkZ)
        ? object.userData.chunkZ
        : Math.floor(((geometry.boundingBox?.min.z ?? 0) + (geometry.boundingBox?.max.z ?? 0)) * 0.5 / CHUNK_SIZE);

    const ck = chunkX + "," + chunkZ;
    object.userData.waterPhysicsChunkKey = ck;

    if (pendingChunkPrunes.has(ck)) {
        window.clearTimeout(pendingChunkPrunes.get(ck));
        pendingChunkPrunes.delete(ck);
    }

    if (loadedChunks.has(ck)) return;
    loadedChunks.add(ck);
    seedOceanChunk(ck);
    markChunkDirty(chunkX * CHUNK_SIZE, chunkZ * CHUNK_SIZE);
}

function unregisterChunk(object) {
    const ck = object?.userData?.waterPhysicsChunkKey;
    if (!ck) return;
    scheduleChunkPrune(ck);
}

function registerObject(object) {
    if (!object || object.userData?.isDynamicWater) return;
    if (object.userData?.isWater) {
        object.visible = false;
        return;
    }
    registerChunk(object);
}

function unregisterObject(object) {
    if (!object || object.userData?.isDynamicWater) return;
    if (object.userData?.isWater) {
        object.visible = false;
        return;
    }
    unregisterChunk(object);
}

function installSceneHooks() {
    if (hooksInstalled) return;
    hooksInstalled = true;

    const originalAdd = THREE.Scene.prototype.add;
    THREE.Scene.prototype.add = function (...objects) {
        const result = originalAdd.apply(this, objects);
        for (const object of objects) {
            object?.traverse ? object.traverse(registerObject) : registerObject(object);
        }
        return result;
    };

    const originalRemove = THREE.Scene.prototype.remove;
    THREE.Scene.prototype.remove = function (...objects) {
        const result = originalRemove.apply(this, objects);
        for (const object of objects) {
            object?.traverse ? object.traverse(unregisterObject) : unregisterObject(object);
        }
        return result;
    };
}

function scanScene() {
    if (scene) scene.traverse(registerObject);
}

function propose(proposals, k, state) {
    const existing = proposals.get(k);
    if (!existing) {
        proposals.set(k, state);
        return;
    }

    if (!state) {
        if (existing.source || existing.falling) return;
        if (existing.level <= 1) proposals.set(k, null);
        return;
    }

    const score = value => {
        if (!value) return -1;
        if (value.source) return 1000;
        if (value.falling) return 500;
        return 100 - value.level;
    };

    if (score(state) > score(existing)) proposals.set(k, state);
}

function adjacentSourceCount(x, y, z) {
    let count = 0;
    for (const [dx, dz] of DIRS) if (getWater(x + dx, y, z + dz)?.source) count++;
    return count;
}

function bestHorizontalLevel(x, y, z) {
    let best = Infinity;
    for (const [dx, dz] of DIRS) {
        const state = getWater(x + dx, y, z + dz);
        if (!state || state.falling) continue;
        best = Math.min(best, state.source ? SOURCE_LEVEL : state.level);
    }
    return Number.isFinite(best) ? best : null;
}

function tryInfiniteSource(x, y, z) {
    if (!isAir(x, y, z) || getWater(x, y, z) || !isSolidBelow(x, y, z)) return null;
    if (adjacentSourceCount(x, y, z) < 2) return null;
    return makeState(SOURCE_LEVEL, false, true, true);
}

function spreadHorizontal(x, y, z, level, proposals) {
    if (level > MAX_LEVEL) return;

    for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;
        if (!isAir(nx, y, nz)) continue;

        const target = getWater(nx, y, nz);
        const wanted = makeState(level);
        if (!target || (!target.source && wanted.level < target.level)) {
            propose(proposals, key(nx, y, nz), wanted);
        }
    }
}

function evaluateCell(x, y, z, proposals) {
    const k = key(x, y, z);
    const current = water.get(k);

    if (!isLoaded(x, z) || getBlockAt(x, y, z) !== BLOCK.AIR) {
        if (current) propose(proposals, k, null);
        return;
    }

    if (!current) {
        const source = tryInfiniteSource(x, y, z);
        if (source) propose(proposals, k, source);
        else {
            const best = bestHorizontalLevel(x, y, z);
            if (best !== null && best + 1 <= MAX_LEVEL) propose(proposals, k, makeState(best + 1));
        }
        return;
    }

    if (current.source) {
        if (current.generatedSource && adjacentSourceCount(x, y, z) < 2) {
            const best = bestHorizontalLevel(x, y, z);
            if (best === null) {
                propose(proposals, k, null);
                return;
            }
            propose(proposals, k, makeState(Math.min(MAX_LEVEL, best + 1)));
        } else {
            propose(proposals, k, makeState(SOURCE_LEVEL, false, true, current.generatedSource));
            if (isAir(x, y - 1, z) && !getWater(x, y - 1, z)) {
                propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
            } else if (isSupported(x, y, z)) {
                spreadHorizontal(x, y, z, 1, proposals);
            }
        }
        return;
    }

    if (current.falling) {
        if (isAir(x, y - 1, z) && !getWater(x, y - 1, z)) {
            propose(proposals, k, makeState(SOURCE_LEVEL, true));
            propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
            return;
        }

        const best = bestHorizontalLevel(x, y, z);
        if (best !== null && best + 1 <= MAX_LEVEL) {
            propose(proposals, k, makeState(best + 1));
        } else {
            propose(proposals, k, makeState(1));
        }

        if (isSupported(x, y, z)) spreadHorizontal(x, y, z, 1, proposals);
        return;
    }

    if (adjacentSourceCount(x, y, z) >= 2 && isSolidBelow(x, y, z)) {
        propose(proposals, k, makeState(SOURCE_LEVEL, false, true, true));
        return;
    }

    if (isAir(x, y - 1, z) && !getWater(x, y - 1, z)) {
        propose(proposals, k, current);
        propose(proposals, key(x, y - 1, z), makeState(SOURCE_LEVEL, true));
        return;
    }

    const best = bestHorizontalLevel(x, y, z);
    if (best === null) {
        propose(proposals, k, null);
        return;
    }

    const desired = Math.min(MAX_LEVEL, best + 1);
    propose(proposals, k, desired <= MAX_LEVEL ? makeState(desired) : null);

    if (current.level < MAX_LEVEL && isSupported(x, y, z)) {
        spreadHorizontal(x, y, z, current.level + 1, proposals);
    }
}

function runFluidTick() {
    const proposals = new Map();
    let processed = 0;

    while (processed < MAX_CELLS_PER_TICK && queueHead < activeQueue.length) {
        const k = activeQueue[queueHead++];
        activeSet.delete(k);
        const [x, y, z] = parseKey(k);
        evaluateCell(x, y, z, proposals);
        processed++;
    }

    for (const [k, state] of proposals) {
        const [x, y, z] = parseKey(k);
        const current = water.get(k);

        if (!state) {
            if (current) removeCell(x, y, z);
            continue;
        }

        if (current?.source && !state.source) continue;

        if (sameState(current, state)) continue;

        if (current) {
            water.set(k, state);
        } else {
            if (water.size >= MAX_WATER_CELLS) continue;
            water.set(k, state);
            const ck = chunkKey(x, z);
            let cells = chunkCells.get(ck);
            if (!cells) {
                cells = new Set();
                chunkCells.set(ck, cells);
            }
            cells.add(k);
        }

        enqueue(x, y, z);
        activateNeighbors(x, y, z);
        markChunkDirty(x, z);
    }

    compactQueue();
}

function wrap01(value) {
    value %= 1;
    return value < 0 ? value + 1 : value;
}

function topUv(x, z) {
    const u = (x + z * 0.34) / 7;
    const v = wrap01((z - x * 0.16) / 64);
    return [u, v];
}

function sideUv(x, z, y, vertical) {
    const u = (x + z * 0.22) / 6;
    const v = THREE.MathUtils.clamp(vertical, 0, 1);
    return [u, v];
}

function cornerHeight(x, y, z, sx, sz, fallback) {
    const xs = sx > 0 ? [0, 1] : [-1, 0];
    const zs = sz > 0 ? [0, 1] : [-1, 0];
    let total = 0;
    let count = 0;

    for (const ox of xs) {
        for (const oz of zs) {
            const sample = getWater(x + ox, y, z + oz);
            if (!sample) continue;
            total += waterHeight(sample);
            count++;
        }
    }

    return count ? total / count : fallback;
}

function addVertex(positions, normals, uvs, map, x, y, z, nx, ny, nz, uvX, uvY) {
    const mapKey = x + "|" + y + "|" + z + "|" + nx + "|" + ny + "|" + nz;
    const existing = map.get(mapKey);
    if (existing !== undefined) return existing;

    const index = positions.length / 3;
    positions.push(x, y, z);
    normals.push(nx, ny, nz);
    uvs.push(uvX, uvY);
    map.set(mapKey, index);
    return index;
}

function addQuad(indices, a, b, c, d) {
    indices.push(a, b, c, a, c, d);
}

function buildChunk(ck) {
    if (!scene || !loadedChunks.has(ck)) return;

    const old = dynamicMeshes.get(ck);
    if (old) {
        scene.remove(old);
        old.geometry?.dispose();
        dynamicMeshes.delete(ck);
    }

    const cells = chunkCells.get(ck);
    if (!cells?.size) return;

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const vertexMap = new Map();

    for (const k of cells) {
        const state = water.get(k);
        if (!state) continue;

        const [x, y, z] = parseKey(k);
        const h = waterHeight(state);
        const baseY = y - 0.5;
        const topY = baseY + h;
        const above = getWater(x, y + 1, z);

        if (!above) {
            const hNW = cornerHeight(x, y, z, -1, -1, h);
            const hNE = cornerHeight(x, y, z, 1, -1, h);
            const hSE = cornerHeight(x, y, z, 1, 1, h);
            const hSW = cornerHeight(x, y, z, -1, 1, h);

            const p0 = [x - 0.5, baseY + hNW, z - 0.5];
            const p1 = [x + 0.5, baseY + hNE, z - 0.5];
            const p2 = [x + 0.5, baseY + hSE, z + 0.5];
            const p3 = [x - 0.5, baseY + hSW, z + 0.5];

            const uv0 = topUv(p0[0], p0[2]);
            const uv1 = topUv(p1[0], p1[2]);
            const uv2 = topUv(p2[0], p2[2]);
            const uv3 = topUv(p3[0], p3[2]);

            const v0 = addVertex(positions, normals, uvs, vertexMap, ...p0, 0, 1, 0, ...uv0);
            const v1 = addVertex(positions, normals, uvs, vertexMap, ...p1, 0, 1, 0, ...uv1);
            const v2 = addVertex(positions, normals, uvs, vertexMap, ...p2, 0, 1, 0, ...uv2);
            const v3 = addVertex(positions, normals, uvs, vertexMap, ...p3, 0, 1, 0, ...uv3);
            addQuad(indices, v0, v1, v2, v3);
        }

        const neighborDirections = [
            [1, 0, [1, 0, 0]],
            [-1, 0, [-1, 0, 0]],
            [0, 1, [0, 0, 1]],
            [0, -1, [0, 0, -1]]
        ];

        for (const [dx, dz, normal] of neighborDirections) {
            const neighbor = getWater(x + dx, y, z + dz);
            const nh = waterHeight(neighbor);
            if (neighbor && nh >= h - 0.0001) continue;

            const edgeA = dx !== 0 ? [
                x + dx * 0.5,
                baseY + (dx > 0 ? hNEFromCell(x, y, z, dx, dz, h) : hNWFromCell(x, y, z, dx, dz, h)),
                z - 0.5
            ] : [
                x - 0.5,
                baseY + (dz > 0 ? hSWFromCell(x, y, z, dx, dz, h) : hNWFromCell(x, y, z, dx, dz, h)),
                z + dz * 0.5
            ];
            const edgeB = dx !== 0 ? [
                x + dx * 0.5,
                baseY + (dx > 0 ? hSEFromCell(x, y, z, dx, dz, h) : hSWFromCell(x, y, z, dx, dz, h)),
                z + 0.5
            ] : [
                x + 0.5,
                baseY + (dz > 0 ? hSEFromCell(x, y, z, dx, dz, h) : hNEFromCell(x, y, z, dx, dz, h)),
                z + dz * 0.5
            ];

            const lower = baseY + nh;
            const topA = edgeA[1];
            const topB = edgeB[1];
            const bottom = baseY;

            const aTop = addVertex(
                positions, normals, uvs, vertexMap,
                edgeA[0], topA, edgeA[2],
                normal[0], normal[1], normal[2],
                ...sideUv(edgeA[0], edgeA[2], y, (topA - bottom) / Math.max(0.001, h))
            );
            const bTop = addVertex(
                positions, normals, uvs, vertexMap,
                edgeB[0], topB, edgeB[2],
                normal[0], normal[1], normal[2],
                ...sideUv(edgeB[0], edgeB[2], y, (topB - bottom) / Math.max(0.001, h))
            );
            const bBottom = addVertex(
                positions, normals, uvs, vertexMap,
                edgeB[0], lower, edgeB[2],
                normal[0], normal[1], normal[2],
                ...sideUv(edgeB[0], edgeB[2], y, 0)
            );
            const aBottom = addVertex(
                positions, normals, uvs, vertexMap,
                edgeA[0], lower, edgeA[2],
                normal[0], normal[1], normal[2],
                ...sideUv(edgeA[0], edgeA[2], y, 0)
            );
            addQuad(indices, aTop, bTop, bBottom, aBottom);
        }
    }

    if (!positions.length) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, fluidMaterial);
    mesh.userData.isDynamicWater = true;
    mesh.userData.waterChunk = ck;
    mesh.frustumCulled = true;
    scene.add(mesh);
    dynamicMeshes.set(ck, mesh);
}

function hNWFromCell(x, y, z, dx, dz, fallback) {
    return cornerHeight(x, y, z, -1, -1, fallback);
}

function hNEFromCell(x, y, z, dx, dz, fallback) {
    return cornerHeight(x, y, z, 1, -1, fallback);
}

function hSEFromCell(x, y, z, dx, dz, fallback) {
    return cornerHeight(x, y, z, 1, 1, fallback);
}

function hSWFromCell(x, y, z, dx, dz, fallback) {
    return cornerHeight(x, y, z, -1, 1, fallback);
}

function rebuildDirtyChunks(limit = MAX_CHUNK_REBUILDS_PER_TICK) {
    let rebuilt = 0;
    for (const ck of [...dirtyChunks]) {
        dirtyChunks.delete(ck);
        buildChunk(ck);
        if (++rebuilt >= limit) break;
    }
}

export function resetWaterPhysics() {
    resetState();
}

export function setupWaterPhysics(sceneRef) {
    if (!sceneRef) return;

    if (scene && scene !== sceneRef) resetState();
    scene = sceneRef;
    initialized = true;
    lastTick = performance.now();

    installSceneHooks();
    scanScene();

    for (const ck of loadedChunks) {
        seedOceanChunk(ck);
        dirtyChunks.add(ck);
    }

    rebuildDirtyChunks(64);
}

export function notifyWaterBlockChanged(x, y, z, type = BLOCK.AIR) {
    if (!initialized) return;

    x = floorCoord(x);
    y = floorCoord(y);
    z = floorCoord(z);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;

    const k = key(x, y, z);

    if (type !== BLOCK.AIR) {
        if (water.has(k)) removeCell(x, y, z);
    } else if (y === SEA_LEVEL && isLoaded(x, z)) {
        if (getTerrainProfile(x, z).height < SEA_LEVEL && isAir(x, y, z) && !getWater(x, y, z)) {
            addCell(x, y, z, makeState(SOURCE_LEVEL, false, true, false));
        }
    }

    enqueue(x, y, z);
    activateNeighbors(x, y, z);
    markChunkDirty(x, z);
}

export function updateWaterPhysics() {
    if (!initialized || !scene) return;

    const now = performance.now();
    if (now - lastTick >= FLOW_INTERVAL) {
        lastTick = now;
        runFluidTick();
    }

    rebuildDirtyChunks();
}

if (typeof window !== "undefined") {
    window.addEventListener("webminecraft:blockchange", event => {
        const detail = event.detail || {};
        if (!Number.isFinite(detail.x) || !Number.isFinite(detail.y) || !Number.isFinite(detail.z)) return;
        notifyWaterBlockChanged(detail.x, detail.y, detail.z, detail.type ?? BLOCK.AIR);
    });

    window.addEventListener("webminecraft:worldreset", () => {
        resetState();
    });

    const loop = () => {
        updateWaterPhysics();
        window.setTimeout(loop, 100);
    };
    window.setTimeout(loop, 100);
}
