import * as THREE from "three";
import { getBlockAt, getBlockTypes, CHUNK_SIZE } from "./world.js";
import { waterTexture } from "./blocks.js";

// Performance-first Minecraft-style water simulation.
// Water is local to chunks, and only cells affected by flow changes are updated.
const MAX_FLOW = 8;
const FLOW_INTERVAL = 200;
const MAX_CELLS_PER_STEP = 500;
const MAX_MESH_CELLS_PER_CHUNK = 4000;
const MAX_CHUNK_REBUILDS_PER_UPDATE = 2;
const MAX_WATER_CELLS = 50000;

const water = new Map();
const cellsByChunk = new Map();
const active = new Set();
const naturalSources = new Set();
const dirtyChunks = new Set();
const chunkMeshes = new Map();
const BLOCK = getBlockTypes();
let gameScene = null;
let sceneScanned = false;
let lastStep = performance.now();

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (x, y, z) => `${x},${y},${z}`;
const parseKey = value => value.split(",").map(Number);
const chunkKey = (x, z) => `${Math.floor(x / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE)}`;

// Lambert is cheaper than Phong and still reacts to scene lighting.
// Use the real water texture with a blue tint and keep water fairly opaque.
const waterMaterial = new THREE.MeshLambertMaterial({
    map: waterTexture,
    color: 0x3c8fc0,
    transparent: true,
    opacity: 0.76,
    depthWrite: false,
    side: THREE.DoubleSide
});
waterMaterial.forceSinglePass = true;

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

function activateNeighbors(x, y, z) {
    active.add(key(x + 1, y, z));
    active.add(key(x - 1, y, z));
    active.add(key(x, y, z + 1));
    active.add(key(x, y, z - 1));
    active.add(key(x, y + 1, z));
    active.add(key(x, y - 1, z));
}

function setWater(x, y, z, level) {
    if (level <= 0 || water.size >= MAX_WATER_CELLS) return false;

    const k = key(x, y, z);
    const existing = water.get(k);
    const old = existing?.level || 0;
    if (level <= old) return false;

    if (existing) {
        existing.level = level;
    } else {
        water.set(k, { x, y, z, level });

        const ck = chunkKey(x, z);
        let cells = cellsByChunk.get(ck);
        if (!cells) {
            cells = new Set();
            cellsByChunk.set(ck, cells);
        }
        cells.add(k);
    }

    active.add(k);
    markCellDirty(x, z);
    return true;
}

function removeWater(x, y, z) {
    const k = key(x, y, z);
    if (!water.has(k) || naturalSources.has(k)) return false;

    water.delete(k);
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
    const k = key(x, y, z);
    if (level <= 0) return removeWater(x, y, z);

    const cell = water.get(k);
    if (!cell) return setWater(x, y, z, level);

    if (naturalSources.has(k)) {
        if (cell.level !== MAX_FLOW) {
            cell.level = MAX_FLOW;
            markCellDirty(x, z);
        }
        active.add(k);
        return true;
    }

    if (cell.level === level) return false;
    cell.level = level;
    active.add(k);
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

        if (!naturalSources.has(k)) {
            naturalSources.add(k);
            setWater(x, y, z, MAX_FLOW);
        }
    }
}

function scanSceneForWater() {
    if (!gameScene || sceneScanned) return;
    sceneScanned = true;

    gameScene.traverse(object => {
        if (!object.isMesh || object.userData?.isDynamicWater) return;
        if (object.userData?.isWater || object.name?.toLowerCase().includes("water")) {
            registerExistingWaterMesh(object);
        }
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

        // A full water column hides the top face underneath it.
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
            const neighbor = water.get(key(x + dx, y, z))?.level || 0;
            if (neighbor >= level) continue;

            const sideHeight = Math.max(0.125, neighbor / MAX_FLOW);
            const nh = y - 0.5 + sideHeight;
            let p;
            let normal;

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
            indices.push(vertex,vertex + 1,vertex + 2,vertex,vertex + 2,vertex + 3);
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

function getDesiredFlow(x, y, z) {
    const k = key(x, y, z);
    if (naturalSources.has(k)) return MAX_FLOW;
    if (!isOpen(x, y, z)) return 0;

    // Water directly above creates a full-height falling column.
    const above = water.get(key(x, y + 1, z))?.level || 0;
    if (above > 0) return MAX_FLOW;

    // Otherwise water spreads sideways and loses one level per cell.
    let desired = 0;
    for (const [dx, dz] of DIRS) {
        const neighbor = water.get(key(x + dx, y, z))?.level || 0;
        if (neighbor > 1) desired = Math.max(desired, neighbor - 1);
    }
    return desired;
}

function spread(x, y, z, level) {
    if (level <= 1) return;
    const nextLevel = level - 1;

    for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;

        // Falling water gets full strength in the column below.
        if (isOpen(nx, y - 1, nz) && !water.has(key(nx, y - 1, nz))) {
            setWater(nx, y - 1, nz, MAX_FLOW);
            continue;
        }

        if (!isOpen(nx, y, nz)) continue;
        const current = water.get(key(nx, y, nz))?.level || 0;
        if (current < nextLevel) setWater(nx, y, nz, nextLevel);
    }
}

function updateFlowCell(x, y, z) {
    const k = key(x, y, z);
    const cell = water.get(k);

    if (naturalSources.has(k)) {
        setWaterLevel(x, y, z, MAX_FLOW);
        spread(x, y, z, MAX_FLOW);
        return;
    }

    const desired = getDesiredFlow(x, y, z);

    // No source above or beside us: let the flow disappear.
    if (!cell) {
        if (desired > 0) setWater(x, y, z, desired);
        return;
    }

    if (desired <= 0) {
        removeWater(x, y, z);
        return;
    }

    setWaterLevel(x, y, z, desired);
    if (desired > 1) spread(x, y, z, desired);
}

function stepWater() {
    const current = [];
    let count = 0;

    for (const k of active) {
        current.push(k);
        if (++count >= MAX_CELLS_PER_STEP) break;
    }
    for (const k of current) active.delete(k);

    for (const k of current) {
        const [x, y, z] = parseKey(k);
        updateFlowCell(x, y, z);
    }
}

export function setupWaterPhysics(scene) {
    gameScene = scene;
    scanSceneForWater();

    while (dirtyChunks.size) {
        rebuildDirtyChunks(32);
    }
}

export function updateWaterPhysics() {
    if (!gameScene) return;

    const now = performance.now();
    if (now - lastStep >= FLOW_INTERVAL && active.size) {
        lastStep = now;
        stepWater();
    }

    rebuildDirtyChunks();
}

export function notifyWaterBlockChanged(x, y, z) {
    active.add(key(x,y,z));
    activateNeighbors(x, y, z);
    markCellDirty(x, z);
    markCellDirty(x + 1, z);
    markCellDirty(x - 1, z);
    markCellDirty(x, z + 1);
    markCellDirty(x, z - 1);
}

const originalSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
    const result = originalSceneAdd.apply(this, objects);
    if (!gameScene) gameScene = this;
    return result;
};

function waterLoop() {
    updateWaterPhysics();
    setTimeout(waterLoop, 150);
}
setTimeout(waterLoop, 150);
