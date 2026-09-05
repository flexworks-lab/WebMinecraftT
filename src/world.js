import * as THREE from "three";

import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
} from "./blocks.js";

// Change this one value to control how large each generated chunk is.
export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;
export const MIN_Y = -4;
export const RENDER_DISTANCE = 6;
export const UNLOAD_DISTANCE = RENDER_DISTANCE + 2;

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
let lastPlayerChunkX = Infinity;
let lastPlayerChunkZ = Infinity;

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

function chunkKey(x, z) {
    return `${x},${z}`;
}

function getChunkCoords(x, z) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { chunkX, chunkZ, localX, localZ };
}

function blockIndex(localX, y, localZ) {
    return (y - MIN_Y) * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX;
}

function getChunk(chunkX, chunkZ) {
    return chunks.get(chunkKey(chunkX, chunkZ));
}

function noise2D(x, z) {
    const n = Math.sin(x * 127.1 + z * 311.7 + 91.17) * 43758.5453123;
    return n - Math.floor(n);
}

function smoothNoise(x, z, scale) {
    const sx = x / scale;
    const sz = z / scale;
    const x0 = Math.floor(sx);
    const z0 = Math.floor(sz);
    const tx = sx - x0;
    const tz = sz - z0;
    const fx = tx * tx * (3 - 2 * tx);
    const fz = tz * tz * (3 - 2 * tz);

    const a = noise2D(x0, z0);
    const b = noise2D(x0 + 1, z0);
    const c = noise2D(x0, z0 + 1);
    const d = noise2D(x0 + 1, z0 + 1);

    return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fz;
}

function getBiome(x, z) {
    const climate = smoothNoise(x + 1500, z - 900, 180);
    const humidity = smoothNoise(x - 700, z + 1200, 130);
    const temperature = smoothNoise(x + 3300, z + 500, 240);

    if (temperature < 0.27) return "snow";
    if (climate < 0.25) return "desert";
    if (humidity > 0.70) return "forest";
    if (humidity < 0.28) return "plains";
    return "forest";
}

function terrainHeight(x, z, biome) {
    const large = smoothNoise(x, z, 55);
    const medium = smoothNoise(x + 300, z - 200, 24);
    const detail = smoothNoise(x - 800, z + 500, 9);

    let height = 3 + (large - 0.5) * 12 + (medium - 0.5) * 5 + (detail - 0.5) * 2;

    if (biome === "mountains") height += smoothNoise(x + 4000, z - 3000, 35) * 16;
    if (biome === "desert") height = 3 + (large - 0.5) * 7 + (medium - 0.5) * 3;
    if (biome === "snow") height += (large - 0.5) * 4;

    const distance = Math.hypot(x, z);
    const spawnFlatten = Math.max(0, 1 - distance / 18);
    height = height * (1 - spawnFlatten) + 3 * spawnFlatten;

    return Math.max(-1, Math.min(MIN_Y + CHUNK_HEIGHT - 5, Math.floor(height)));
}

function surfaceBlock(biome, y, surfaceY) {
    if (biome === "desert") return BLOCK.SAND;
    if (biome === "snow") return y === surfaceY ? BLOCK.SAND : BLOCK.STONE;
    if (y === surfaceY) return BLOCK.GRASS;
    if (y >= surfaceY - 2) return BLOCK.DIRT;
    return BLOCK.STONE;
}

function setBlockData(x, y, z, type) {
    if (y < MIN_Y || y >= MIN_Y + CHUNK_HEIGHT) return false;
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
    if (y < MIN_Y || y >= MIN_Y + CHUNK_HEIGHT) return BLOCK.AIR;

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

    const { chunkX, chunkZ } = getChunkCoords(x, z);
    const chunk = getChunk(chunkX, chunkZ);
    if (!chunk) return false;

    chunk.blocks[blockIndex(((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE, y, ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE)] = type;
    rebuildChunkMesh(chunk);

    if (x % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX - 1, chunkZ));
    if ((x + 1) % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX + 1, chunkZ));
    if (z % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX, chunkZ - 1));
    if ((z + 1) % CHUNK_SIZE === 0) rebuildChunkMesh(getChunk(chunkX, chunkZ + 1));
    return true;
}

function addTree(x, y, z) {
    const height = 4 + Math.floor(noise2D(x * 2, z * 2) * 2);
    for (let i = 0; i < height; i++) setBlockData(x, y + i, z, BLOCK.OAK);

    const top = y + height - 1;
    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= 3) setBlockData(x + dx, top, z + dz, BLOCK.LEAVES);
        }
    }
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) setBlockData(x + dx, top + 1, z + dz, BLOCK.LEAVES);
    }
    setBlockData(x, top + 2, z, BLOCK.LEAVES);
}

function generateChunk(chunkX, chunkZ) {
    const key = chunkKey(chunkX, chunkZ);
    if (chunks.has(key)) return chunks.get(key);

    const chunk = {
        x: chunkX,
        z: chunkZ,
        blocks: new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT),
        generated: false
    };
    chunks.set(key, chunk);

    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            const x = startX + lx;
            const z = startZ + lz;
            const biome = getBiome(x, z);
            const height = terrainHeight(x, z, biome);
            const water = height < 1;
            const surfaceY = water ? 1 : height;

            for (let y = MIN_Y; y <= surfaceY; y++) {
                setBlockData(x, y, z, surfaceBlock(biome, y, surfaceY));
            }
        }
    }

    // Trees use deterministic world coordinates, so the same tree is generated
    // every time its chunk is loaded.
    for (let lx = 3; lx < CHUNK_SIZE - 3; lx++) {
        for (let lz = 3; lz < CHUNK_SIZE - 3; lz++) {
            const x = startX + lx;
            const z = startZ + lz;
            const biome = getBiome(x, z);
            const height = terrainHeight(x, z, biome);

            if (biome !== "forest" && biome !== "plains") continue;
            if (height < 2 || getBlockType(x, height, z) !== BLOCK.GRASS) continue;
            if (noise2D(x + 900, z - 700) <= 0.86) continue;
            if (noise2D(x * 3 + 17, z * 3 - 41) <= 0.38) continue;

            addTree(x, height + 1, z);
        }
    }

    chunk.generated = true;
    return chunk;
}

function materialIndexFor(type, faceIndex) {
    switch (type) {
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
    let vertices = 0;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            for (let y = MIN_Y; y < MIN_Y + CHUNK_HEIGHT; y++) {
                const type = chunk.blocks[blockIndex(lx, y, lz)];
                if (!type) continue;

                const x = chunk.x * CHUNK_SIZE + lx;
                const z = chunk.z * CHUNK_SIZE + lz;

                for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
                    const face = FACES[faceIndex];
                    if (getBlockType(x + face.normal[0], y + face.normal[1], z + face.normal[2]) !== BLOCK.AIR) continue;

                    const materialIndex = materialIndexFor(type, faceIndex);
                    for (const corner of face.corners) {
                        positions.push(x + corner[0], y + corner[1], z + corner[2]);
                        normals.push(...face.normal);
                    }
                    uvs.push(0,0, 0,1, 1,1, 1,0);
                    indices.push(vertices, vertices + 1, vertices + 2, vertices, vertices + 2, vertices + 3);
                    groupCounts[materialIndex] += 6;
                    vertices += 4;
                }
            }
        }
    }

    if (!vertices) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    let start = 0;
    for (let i = 0; i < groupCounts.length; i++) {
        if (groupCounts[i]) {
            geometry.addGroup(start, groupCounts[i], i);
            start += groupCounts[i];
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
    let vertices = 0;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            const x = chunk.x * CHUNK_SIZE + lx;
            const z = chunk.z * CHUNK_SIZE + lz;
            const biome = getBiome(x, z);
            const height = terrainHeight(x, z, biome);
            if (height >= 1) continue;

            const y = 1.45;
            positions.push(x - .5,y,z-.5, x-.5,y,z+.5, x+.5,y,z+.5, x+.5,y,z-.5);
            normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            uvs.push(0,0, 0,1, 1,1, 1,0);
            indices.push(vertices, vertices+1, vertices+2, vertices, vertices+2, vertices+3);
            vertices += 4;
        }
    }

    if (!vertices) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
}

function disposeMesh(mesh) {
    if (!mesh) return;
    worldScene.remove(mesh);
    mesh.geometry.dispose();
}

function rebuildChunkMesh(chunk) {
    if (!chunk || !worldScene) return;
    const key = chunkKey(chunk.x, chunk.z);
    const old = chunkMeshes.get(key);
    if (old) {
        disposeMesh(old.terrain);
        disposeMesh(old.water);
    }

    const result = { terrain: null, water: null };
    const terrainGeometry = makeGeometryForChunk(chunk);
    const waterGeometry = makeWaterGeometry(chunk);

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

function unloadChunk(chunk) {
    const key = chunkKey(chunk.x, chunk.z);
    const meshes = chunkMeshes.get(key);
    if (meshes) {
        disposeMesh(meshes.terrain);
        disposeMesh(meshes.water);
        chunkMeshes.delete(key);
    }
    chunks.delete(key);
}

function updateVisibleChunks(playerX, playerZ) {
    const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

    // Generate a square around the player. Generation is deterministic, so
    // walking back to an unloaded area produces the same terrain again.
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
        for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) > RENDER_DISTANCE) continue;
            const chunk = generateChunk(playerChunkX + dx, playerChunkZ + dz);
            if (!chunkMeshes.has(chunkKey(chunk.x, chunk.z))) rebuildChunkMesh(chunk);
        }
    }

    for (const chunk of [...chunks.values()]) {
        const distance = Math.max(Math.abs(chunk.x - playerChunkX), Math.abs(chunk.z - playerChunkZ));
        if (distance > UNLOAD_DISTANCE) unloadChunk(chunk);
    }

    lastPlayerChunkX = playerChunkX;
    lastPlayerChunkZ = playerChunkZ;
}

export function updateChunkVisibility(position) {
    if (!position || !worldScene) return;
    const cx = Math.floor(position.x / CHUNK_SIZE);
    const cz = Math.floor(position.z / CHUNK_SIZE);
    if (cx === lastPlayerChunkX && cz === lastPlayerChunkZ) return;
    updateVisibleChunks(position.x, position.z);
}

export function createWorld(scene) {
    worldScene = scene;
    lastPlayerChunkX = Infinity;
    lastPlayerChunkZ = Infinity;
    updateVisibleChunks(0, 0);
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
    return {
        chunks: chunks.size,
        loadedChunks: chunkMeshes.size,
        renderDistance: RENDER_DISTANCE
    };
}
