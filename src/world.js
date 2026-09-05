import * as THREE from "three";

import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
} from "./blocks.js";

export const CHUNK_SIZE = 16;
export const WORLD_SIZE = 64;
export const MIN_Y = -4;
export const CHUNK_HEIGHT = 64;
export const RENDER_DISTANCE = 5;

const BLOCK = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    SAND: 4,
    OAK: 5,
    LEAVES: 6
};

const chunks = new Map();
const chunkMeshes = new Map();
let worldScene = null;

const chunkMaterials = [
    grassMaterial[0],
    grassMaterial[2],
    grassMaterial[3],
    stoneMaterial,
    sandMaterial,
    oakLogMaterial[0],
    oakLogMaterial[2],
    leavesMaterial
];

const waterMaterial = new THREE.MeshLambertMaterial({
    color: 0x4fa7e8,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
});

const FACES = [
    { normal: [1, 0, 0], corners: [[0.5,-0.5,-0.5],[0.5,0.5,-0.5],[0.5,0.5,0.5],[0.5,-0.5,0.5]] },
    { normal: [-1, 0, 0], corners: [[-0.5,-0.5,0.5],[-0.5,0.5,0.5],[-0.5,0.5,-0.5],[-0.5,-0.5,-0.5]] },
    { normal: [0, 1, 0], corners: [[-0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,-0.5],[-0.5,0.5,-0.5]] },
    { normal: [0, -1, 0], corners: [[-0.5,-0.5,-0.5],[0.5,-0.5,-0.5],[0.5,-0.5,0.5],[-0.5,-0.5,0.5]] },
    { normal: [0, 0, 1], corners: [[0.5,-0.5,0.5],[0.5,0.5,0.5],[-0.5,0.5,0.5],[-0.5,-0.5,0.5]] },
    { normal: [0, 0, -1], corners: [[-0.5,-0.5,-0.5],[-0.5,0.5,-0.5],[0.5,0.5,-0.5],[0.5,-0.5,-0.5]] }
];

function chunkKey(chunkX, chunkZ) {
    return `${chunkX},${chunkZ}`;
}

function getChunkCoords(x, z) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { chunkX, chunkZ, localX, localZ };
}

function getChunk(chunkX, chunkZ) {
    return chunks.get(chunkKey(chunkX, chunkZ));
}

function blockIndex(localX, y, localZ) {
    return (y - MIN_Y) * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX;
}

function isInsideWorld(x, z) {
    return x >= -WORLD_SIZE && x <= WORLD_SIZE && z >= -WORLD_SIZE && z <= WORLD_SIZE;
}

function setBlockData(x, y, z, type) {
    if (!isInsideWorld(x, z) || y < MIN_Y || y >= MIN_Y + CHUNK_HEIGHT) return false;

    const { chunkX, chunkZ, localX, localZ } = getChunkCoords(x, z);
    const chunk = getChunk(chunkX, chunkZ);
    if (!chunk) return false;

    chunk.blocks[blockIndex(localX, y, localZ)] = type;
    return true;
}

function getBlockType(x, y, z) {
    x = Math.floor(x);
    y = Math.floor(y);
    z = Math.floor(z);

    if (!isInsideWorld(x, z) || y < MIN_Y || y >= MIN_Y + CHUNK_HEIGHT) return BLOCK.AIR;

    const { chunkX, chunkZ, localX, localZ } = getChunkCoords(x, z);
    const chunk = getChunk(chunkX, chunkZ);
    if (!chunk) return BLOCK.AIR;

    return chunk.blocks[blockIndex(localX, y, localZ)] || BLOCK.AIR;
}

export function getBlockAt(x, y, z) {
    return getBlockType(x, y, z);
}

export function setBlockAt(x, y, z, type) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);

    if (!setBlockData(x, y, z, type)) return false;

    rebuildChunkAt(x, z);

    const { chunkX, chunkZ } = getChunkCoords(x, z);
    if (x % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX - 1, chunkZ));
    if ((x + 1) % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX + 1, chunkZ));
    if (z % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX, chunkZ - 1));
    if ((z + 1) % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX, chunkZ + 1));

    return true;
}

export function registerWorldBlock(block) {
    if (!block?.userData?.blockPosition) return;
    const { x, y, z, type } = block.userData.blockPosition;
    setBlockAt(x, y, z, type);
}

export function removeWorldBlock(block) {
    if (!block?.userData?.blockPosition) return false;
    const { x, y, z } = block.userData.blockPosition;
    return setBlockAt(x, y, z, BLOCK.AIR);
}

function noise2D(x, z) {
    const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
    return n - Math.floor(n);
}

function smoothNoise(x, z, scale) {
    const sx = x / scale;
    const sz = z / scale;
    const x0 = Math.floor(sx);
    const z0 = Math.floor(sz);
    const tx = sx - x0;
    const tz = sz - z0;
    const fadeX = tx * tx * (3 - 2 * tx);
    const fadeZ = tz * tz * (3 - 2 * tz);
    const a = noise2D(x0, z0);
    const b = noise2D(x0 + 1, z0);
    const c = noise2D(x0, z0 + 1);
    const d = noise2D(x0 + 1, z0 + 1);
    const ab = a + (b - a) * fadeX;
    const cd = c + (d - c) * fadeX;
    return ab + (cd - ab) * fadeZ;
}

function terrainHeight(x, z) {
    const large = smoothNoise(x, z, 42);
    const medium = smoothNoise(x + 300, z - 200, 20);
    const detail = smoothNoise(x - 800, z + 500, 9);

    let height = 2 + (large - 0.5) * 10 + (medium - 0.5) * 5 + (detail - 0.5) * 2;
    const distance = Math.hypot(x, z);
    const spawnFlatten = Math.max(0, 1 - distance / 18);
    height = height * (1 - spawnFlatten) + 3 * spawnFlatten;

    return Math.max(-1, Math.floor(height));
}

function buildWorldData() {
    const minChunk = Math.floor(-WORLD_SIZE / CHUNK_SIZE);
    const maxChunk = Math.floor(WORLD_SIZE / CHUNK_SIZE);

    for (let chunkX = minChunk; chunkX <= maxChunk; chunkX++) {
        for (let chunkZ = minChunk; chunkZ <= maxChunk; chunkZ++) {
            chunks.set(chunkKey(chunkX, chunkZ), {
                x: chunkX,
                z: chunkZ,
                blocks: new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT)
            });
        }
    }

    for (let x = -WORLD_SIZE; x <= WORLD_SIZE; x++) {
        for (let z = -WORLD_SIZE; z <= WORLD_SIZE; z++) {
            const height = terrainHeight(x, z);
            const water = height < 1;
            const surfaceHeight = water ? 1 : height;

            for (let y = MIN_Y; y <= surfaceHeight; y++) {
                let type = BLOCK.STONE;
                if (y === surfaceHeight) type = water ? BLOCK.SAND : BLOCK.GRASS;
                else if (y >= surfaceHeight - 2) type = water ? BLOCK.SAND : BLOCK.DIRT;
                setBlockData(x, y, z, type);
            }
        }
    }

    for (let x = -WORLD_SIZE + 3; x <= WORLD_SIZE - 3; x++) {
        for (let z = -WORLD_SIZE + 3; z <= WORLD_SIZE - 3; z++) {
            const height = terrainHeight(x, z);
            if (height < 2) continue;

            const treeChance = noise2D(x + 900, z - 700);
            const spacing = noise2D(x * 3 + 17, z * 3 - 41);
            if (treeChance <= 0.84 || spacing <= 0.38) continue;
            if (getBlockType(x, height, z) !== BLOCK.GRASS) continue;
            if (getBlockType(x, height + 1, z) !== BLOCK.AIR) continue;

            addTreeData(x, height + 1, z);
        }
    }
}

function addTreeData(x, y, z) {
    const trunkHeight = 4 + Math.floor(noise2D(x * 2, z * 2) * 2);

    for (let i = 0; i < trunkHeight; i++) setBlockData(x, y + i, z, BLOCK.OAK);

    const top = y + trunkHeight - 1;

    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) + Math.abs(dz) > 3) continue;
            setBlockData(x + dx, top, z + dz, BLOCK.LEAVES);
        }
    }

    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) setBlockData(x + dx, top + 1, z + dz, BLOCK.LEAVES);
    }

    setBlockData(x, top + 2, z, BLOCK.LEAVES);
}

function materialIndexFor(blockType, faceIndex) {
    switch (blockType) {
        case BLOCK.GRASS: return faceIndex === 2 ? 1 : faceIndex === 3 ? 2 : 0;
        case BLOCK.DIRT: return 2;
        case BLOCK.STONE: return 3;
        case BLOCK.SAND: return 4;
        case BLOCK.OAK: return faceIndex === 2 || faceIndex === 3 ? 6 : 5;
        case BLOCK.LEAVES: return 7;
        default: return 0;
    }
}

function makeGeometryForChunk(chunk) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const groupCounts = new Array(chunkMaterials.length).fill(0);
    let vertexCount = 0;

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
            for (let y = MIN_Y; y < MIN_Y + CHUNK_HEIGHT; y++) {
                const type = chunk.blocks[blockIndex(localX, y, localZ)];
                if (!type) continue;

                const worldX = chunk.x * CHUNK_SIZE + localX;
                const worldZ = chunk.z * CHUNK_SIZE + localZ;

                for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
                    const face = FACES[faceIndex];
                    if (getBlockType(worldX + face.normal[0], y + face.normal[1], worldZ + face.normal[2]) !== BLOCK.AIR) continue;

                    const materialIndex = materialIndexFor(type, faceIndex);
                    const start = vertexCount;

                    for (const corner of face.corners) {
                        positions.push(worldX + corner[0], y + corner[1], worldZ + corner[2]);
                        normals.push(face.normal[0], face.normal[1], face.normal[2]);
                    }

                    uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
                    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
                    groupCounts[materialIndex] += 6;
                    vertexCount += 4;
                }
            }
        }
    }

    if (vertexCount === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    let startIndex = 0;
    for (let materialIndex = 0; materialIndex < groupCounts.length; materialIndex++) {
        const count = groupCounts[materialIndex];
        if (count > 0) {
            geometry.addGroup(startIndex, count, materialIndex);
            startIndex += count;
        }
    }

    geometry.computeBoundingSphere();
    return geometry;
}

function makeWaterGeometry(chunk) {
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let vertexCount = 0;

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
            const worldX = chunk.x * CHUNK_SIZE + localX;
            const worldZ = chunk.z * CHUNK_SIZE + localZ;
            if (terrainHeight(worldX, worldZ) >= 1) continue;

            const y = 1.45;
            positions.push(worldX - 0.5, y, worldZ - 0.5, worldX - 0.5, y, worldZ + 0.5, worldX + 0.5, y, worldZ + 0.5, worldX + 0.5, y, worldZ - 0.5);
            normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            uvs.push(0,0, 0,1, 1,1, 1,0);
            indices.push(vertexCount, vertexCount + 1, vertexCount + 2, vertexCount, vertexCount + 2, vertexCount + 3);
            vertexCount += 4;
        }
    }

    if (vertexCount === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
}

function disposeChunkMesh(mesh) {
    if (!mesh) return;
    worldScene.remove(mesh);
    mesh.geometry?.dispose();
}

function rebuildChunkMesh(chunk) {
    if (!chunk || !worldScene) return;

    const key = chunkKey(chunk.x, chunk.z);
    const old = chunkMeshes.get(key);
    if (old) {
        disposeChunkMesh(old.terrain);
        disposeChunkMesh(old.water);
        chunkMeshes.delete(key);
    }

    const terrainGeometry = makeGeometryForChunk(chunk);
    const waterGeometry = makeWaterGeometry(chunk);
    const result = { terrain: null, water: null };

    if (terrainGeometry) {
        const mesh = new THREE.Mesh(terrainGeometry, chunkMaterials);
        mesh.userData.isChunk = true;
        mesh.userData.chunkX = chunk.x;
        mesh.userData.chunkZ = chunk.z;
        mesh.frustumCulled = true;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        worldScene.add(mesh);
        result.terrain = mesh;
    }

    if (waterGeometry) {
        const mesh = new THREE.Mesh(waterGeometry, waterMaterial);
        mesh.userData.isWater = true;
        mesh.userData.chunkX = chunk.x;
        mesh.userData.chunkZ = chunk.z;
        mesh.frustumCulled = true;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        worldScene.add(mesh);
        result.water = mesh;
    }

    chunkMeshes.set(key, result);
}

function rebuildChunkAt(x, z) {
    const { chunkX, chunkZ } = getChunkCoords(x, z);
    rebuildChunkMesh(getChunk(chunkX, chunkZ));
}

function setChunkVisibility(chunk, visible) {
    const meshes = chunkMeshes.get(chunkKey(chunk.x, chunk.z));
    if (!meshes) return;
    if (meshes.terrain) meshes.terrain.visible = visible;
    if (meshes.water) meshes.water.visible = visible;
}

export function updateChunkVisibility(position) {
    if (!position) return;

    const playerChunkX = Math.floor(position.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(position.z / CHUNK_SIZE);

    for (const chunk of chunks.values()) {
        const distance = Math.max(Math.abs(chunk.x - playerChunkX), Math.abs(chunk.z - playerChunkZ));
        const visible = distance <= RENDER_DISTANCE;
        const key = chunkKey(chunk.x, chunk.z);

        if (visible && !chunkMeshes.has(key)) rebuildChunkMesh(chunk);
        setChunkVisibility(chunk, visible);
    }
}

export function createWorld(scene) {
    worldScene = scene;
    buildWorldData();
    updateChunkVisibility({ x: 0, z: 0 });
}

export function getChunks() {
    return chunks;
}

export function getChunkSize() {
    return CHUNK_SIZE;
}

export function getBlockTypes() {
    return BLOCK;
}

export function getPerformanceStats() {
    let loaded = 0;
    for (const meshes of chunkMeshes.values()) {
        if (meshes.terrain?.visible || meshes.water?.visible) loaded++;
    }

    return {
        chunks: chunks.size,
        loadedChunks: loaded,
        renderDistance: RENDER_DISTANCE
    };
}
