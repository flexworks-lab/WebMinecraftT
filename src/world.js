import * as THREE from "three";
import {
    grassMaterial, dirtMaterial, stoneMaterial, cobblestoneMaterial,
    gravelMaterial, sandMaterial, sandstoneMaterial, bedrockMaterial,
    coalMaterial, ironMaterial, oakLogMaterial, oakPlankMaterial,
    leavesMaterial, snowMaterial, waterMaterial
} from "./blocks.js";

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 96;
export const MIN_Y = -16;
export const WORLD_TOP = MIN_Y + CHUNK_HEIGHT - 1;
export const SEA_LEVEL = 16;
export const RENDER_DISTANCE = 6;
export const UNLOAD_DISTANCE = RENDER_DISTANCE + 2;
export const MAX_CHUNKS_PER_FRAME = 1;

const BLOCK = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, OAK: 5, LEAVES: 6, COBBLESTONE: 7, GRAVEL: 8, SANDSTONE: 9, BEDROCK: 10, COAL_ORE: 11, IRON_ORE: 12, OAK_PLANKS: 13, SNOW: 14 };
const WORLD_SEED = 48151623;
const chunks = new Map();
const chunkMeshes = new Map();
const generationQueue = [];
const queuedKeys = new Set();
let worldScene = null;
let lastPlayerChunkX = Infinity;
let lastPlayerChunkZ = Infinity;

const chunkMaterials = [grassMaterial[0], grassMaterial[2], dirtMaterial, stoneMaterial, sandMaterial, oakLogMaterial[0], oakLogMaterial[2], leavesMaterial, cobblestoneMaterial, gravelMaterial, sandstoneMaterial, bedrockMaterial, coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial];

const FACES = [
    { normal: [1, 0, 0], corners: [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5]] },
    { normal: [-1, 0, 0], corners: [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, -0.5, -0.5]] },
    { normal: [0, 1, 0], corners: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
    { normal: [0, -1, 0], corners: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
    { normal: [0, 0, 1], corners: [[0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, -0.5, 0.5]] },
    { normal: [0, 0, -1], corners: [[-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5]] }
];

function chunkKey(x, z) { return `${x},${z}`; }
function getChunkCoords(x, z) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((Math.floor(x) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((Math.floor(z) % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { chunkX, chunkZ, localX, localZ };
}
function blockIndex(localX, y, localZ) { return (y - MIN_Y) * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX; }
function getChunk(x, z) { return chunks.get(chunkKey(x, z)); }
function hash2D(x, z) {
    const n = Math.sin(x * 127.1 + z * 311.7 + WORLD_SEED * 0.000131) * 43758.5453123;
    return n - Math.floor(n);
}
function smoothNoise(x, z, scale) {
    const sx = x / scale, sz = z / scale;
    const x0 = Math.floor(sx), z0 = Math.floor(sz);
    const tx = sx - x0, tz = sz - z0;
    const fx = tx * tx * (3 - 2 * tx), fz = tz * tz * (3 - 2 * tz);
    const a = hash2D(x0, z0), b = hash2D(x0 + 1, z0), c = hash2D(x0, z0 + 1), d = hash2D(x0 + 1, z0 + 1);
    const ab = a + (b - a) * fx;
    const cd = c + (d - c) * fx;
    return ab + (cd - ab) * fz;
}
function fbm(x, z, scales, weights) {
    let total = 0, weightTotal = 0;
    for (let i = 0; i < scales.length; i++) {
        const weight = weights[i] ?? 1;
        total += smoothNoise(x, z, scales[i]) * weight;
        weightTotal += weight;
    }
    return total / weightTotal;
}
function getBiome(x, z) {
    const temperature = fbm(x + 1800, z - 900, [280, 140, 70], [0.58, 0.28, 0.14]);
    const humidity = fbm(x - 2300, z + 1700, [230, 110, 55], [0.58, 0.28, 0.14]);
    const continental = smoothNoise(x + 500, z - 400, 420);
    if (temperature < 0.20) return "tundra";
    if (temperature < 0.32 && humidity > 0.43) return "snow";
    if (temperature > 0.72 && humidity < 0.32) return "desert";
    if (temperature > 0.61 && humidity < 0.43) return "badlands";
    if (humidity > 0.68 && continental > 0.38) return "forest";
    if (humidity < 0.25) return "plains";
    return "forest";
}
function terrainHeight(x, z, biome) {
    const continental = smoothNoise(x + 800, z - 600, 220);
    const mountains = smoothNoise(x - 1800, z + 1300, 120);
    const hills = smoothNoise(x + 350, z - 250, 42);
    const detail = smoothNoise(x - 700, z + 500, 13);
    let height = 8 + (continental - 0.5) * 20 + (mountains - 0.5) * 15 + (hills - 0.5) * 8 + (detail - 0.5) * 3;
    if (biome === "plains") height = 10 + (hills - 0.5) * 8 + (detail - 0.5) * 2;
    if (biome === "forest") height += (hills - 0.5) * 3;
    if (biome === "desert") height = 9 + (hills - 0.5) * 7 + (detail - 0.5) * 2;
    if (biome === "badlands") height = 12 + (mountains - 0.5) * 13 + (hills - 0.5) * 8;
    if (biome === "snow" || biome === "tundra") height += 5 + (mountains - 0.5) * 9;
    const spawnFlatten = Math.max(0, 1 - Math.hypot(x, z) / 28);
    height = height * (1 - spawnFlatten) + 12 * spawnFlatten;
    return THREE.MathUtils.clamp(Math.floor(height), 2, WORLD_TOP - 8);
}
function getSurfaceBlock(biome, y, surfaceY) {
    if (biome === "desert") return y >= surfaceY - 3 ? BLOCK.SAND : BLOCK.SANDSTONE;
    if (biome === "badlands") return y === surfaceY ? BLOCK.SAND : y >= surfaceY - 3 ? BLOCK.SANDSTONE : BLOCK.STONE;
    if (biome === "snow" || biome === "tundra") return y === surfaceY ? BLOCK.SNOW : y >= surfaceY - 3 ? BLOCK.DIRT : BLOCK.STONE;
    if (y === surfaceY) return BLOCK.GRASS;
    if (y >= surfaceY - 3) return BLOCK.DIRT;
    return BLOCK.STONE;
}
function shouldCarveCave(x, y, z, surfaceY) {
    if (y >= surfaceY - 3 || y > 11 || y < MIN_Y + 3) return false;
    const a = smoothNoise(x + y * 0.37, z - y * 0.21, 23);
    const b = smoothNoise(x - z * 0.17, z + y * 0.33, 16);
    const value = a * 0.58 + b * 0.42;
    return value > (y < 2 ? 0.82 : 0.77);
}
function oreType(x, y, z, surfaceY) {
    if (y > surfaceY - 4 || y > 12) return BLOCK.STONE;
    const iron = smoothNoise(x + y * 5.1, z - y * 3.7, 11);
    const coal = smoothNoise(x - y * 2.4, z + y * 4.2, 9);
    const gravel = smoothNoise(x * 1.7 + y, z * 1.3 - y, 7);
    const cobble = smoothNoise(x * 2.7 - y, z * 2.1 + y, 6);
    if (iron > 0.91 && y < 9) return BLOCK.IRON_ORE;
    if (coal > 0.86) return BLOCK.COAL_ORE;
    if (gravel < 0.07) return BLOCK.GRAVEL;
    if (cobble > 0.93) return BLOCK.COBBLESTONE;
    return BLOCK.STONE;
}
function setBlockData(x, y, z, type) {
    if (y < MIN_Y || y > WORLD_TOP) return false;
    const { chunkX, chunkZ, localX, localZ } = getChunkCoords(x, z);
    const chunk = getChunk(chunkX, chunkZ);
    if (!chunk) return false;
    chunk.blocks[blockIndex(localX, y, localZ)] = type;
    return true;
}
function getBlockType(x, y, z) {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    if (y < MIN_Y || y > WORLD_TOP) return BLOCK.AIR;
    const { chunkX, chunkZ, localX, localZ } = getChunkCoords(x, z);
    const chunk = getChunk(chunkX, chunkZ);
    if (!chunk) return BLOCK.AIR;
    return chunk.blocks[blockIndex(localX, y, localZ)] || BLOCK.AIR;
}
export function getBlockAt(x, y, z) { return getBlockType(x, y, z); }
function treeNoise(x, z) { return smoothNoise(x + 700, z - 1300, 21) * 0.62 + smoothNoise(x - 1800, z + 900, 11) * 0.38; }
function shouldSpawnTree(x, z) { return treeNoise(x, z) > 0.73 && treeNoise(x * 1.37 + 211, z * 0.83 - 149) > 0.36; }
function addTree(x, y, z) {
    const variation = treeNoise(x + 37, z - 91);
    const height = 4 + Math.floor(variation * 4);
    for (let i = 0; i < height; i++) setBlockData(x, y + i, z, BLOCK.OAK);
    const top = y + height - 1;
    const layers = 4 + Math.floor(variation * 2);
    for (let layer = 0; layer < layers; layer++) {
        const radius = layer === 0 ? 2 : layer === 1 ? 3 : layer >= 4 ? 1 : 2;
        const leafY = top - layer;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                const distance = Math.abs(dx) + Math.abs(dz);
                if (distance > radius + 1) continue;
                if (layer === 0 && distance < 2) continue;
                if (treeNoise(x + dx * 17 + layer * 31, z + dz * 23 - layer * 19) <= 0.16) continue;
                setBlockData(x + dx, leafY, z + dz, BLOCK.LEAVES);
            }
        }
    }
    setBlockData(x, top + 1, z, BLOCK.LEAVES);
    if (variation > 0.67) setBlockData(x, top + 2, z, BLOCK.LEAVES);
}
function generateChunk(chunkX, chunkZ) {
    const key = chunkKey(chunkX, chunkZ);
    if (chunks.has(key)) return chunks.get(key);
    const chunk = { x: chunkX, z: chunkZ, blocks: new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT), generated: false, waterMesh: null };
    chunks.set(key, chunk);
    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            const x = startX + lx, z = startZ + lz;
            const biome = getBiome(x, z);
            const surfaceY = terrainHeight(x, z, biome);
            for (let y = MIN_Y; y <= surfaceY; y++) {
                let type;
                if (y === MIN_Y) type = BLOCK.BEDROCK;
                else if (shouldCarveCave(x, y, z, surfaceY)) type = BLOCK.AIR;
                else {
                    type = getSurfaceBlock(biome, y, surfaceY);
                    if (type === BLOCK.STONE) type = oreType(x, y, z, surfaceY);
                }
                setBlockData(x, y, z, type);
            }
        }
    }
    for (let lx = 2; lx < CHUNK_SIZE - 2; lx++) {
        for (let lz = 2; lz < CHUNK_SIZE - 2; lz++) {
            const x = startX + lx, z = startZ + lz;
            const biome = getBiome(x, z);
            const surfaceY = terrainHeight(x, z, biome);
            if ((biome !== "forest" && biome !== "plains") || surfaceY < SEA_LEVEL) continue;
            if (getBlockType(x, surfaceY, z) !== BLOCK.GRASS || !shouldSpawnTree(x, z)) continue;
            let nearby = false;
            for (let dx = -2; dx <= 2 && !nearby; dx++) {
                for (let dz = -2; dz <= 2; dz++) {
                    if ((dx || dz) && Math.abs(dx) + Math.abs(dz) <= 2 && shouldSpawnTree(x + dx, z + dz)) { nearby = true; break; }
                }
            }
            if (!nearby) addTree(x, surfaceY + 1, z);
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
        case BLOCK.COBBLESTONE: return 8;
        case BLOCK.GRAVEL: return 9;
        case BLOCK.SANDSTONE: return 10;
        case BLOCK.BEDROCK: return 11;
        case BLOCK.COAL_ORE: return 12;
        case BLOCK.IRON_ORE: return 13;
        case BLOCK.OAK_PLANKS: return 14;
        case BLOCK.SNOW: return 15;
        default: return 0;
    }
}
function makeGeometryForChunk(chunk) {
    const positions = [], normals = [], uvs = [], groups = Array.from({ length: chunkMaterials.length }, () => []);
    let vertices = 0;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) for (let lz = 0; lz < CHUNK_SIZE; lz++) for (let y = MIN_Y; y <= WORLD_TOP; y++) {
        const type = chunk.blocks[blockIndex(lx, y, lz)];
        if (!type) continue;
        const x = chunk.x * CHUNK_SIZE + lx, z = chunk.z * CHUNK_SIZE + lz;
        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            const face = FACES[faceIndex];
            if (getBlockType(x + face.normal[0], y + face.normal[1], z + face.normal[2]) !== BLOCK.AIR) continue;
            const base = vertices, materialIndex = materialIndexFor(type, faceIndex);
            for (const corner of face.corners) {
                positions.push(x + corner[0], y + corner[1], z + corner[2]);
                normals.push(face.normal[0], face.normal[1], face.normal[2]);
            }
            uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
            groups[materialIndex].push(base, base + 1, base + 2, base, base + 2, base + 3);
            vertices += 4;
        }
    }
    if (!vertices) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    const index = [];
    for (let i = 0; i < groups.length; i++) { const start = index.length; index.push(...groups[i]); if (groups[i].length) geometry.addGroup(start, groups[i].length, i); }
    geometry.setIndex(index);
    geometry.computeBoundingSphere();
    return geometry;
}
function makeWaterGeometry(chunk) {
    const positions = [], normals = [], uvs = [], indices = [];
    let vertices = 0;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const x = chunk.x * CHUNK_SIZE + lx, z = chunk.z * CHUNK_SIZE + lz;
        const biome = getBiome(x, z), surfaceY = terrainHeight(x, z, biome);
        if (surfaceY >= SEA_LEVEL) continue;
        const y = SEA_LEVEL + 0.42;
        positions.push(x - 0.5, y, z - 0.5, x - 0.5, y, z + 0.5, x + 0.5, y, z + 0.5, x + 0.5, y, z - 0.5);
        normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
        uvs.push(0, 0, 0, 1, 1, 1, 1, 0);
        indices.push(vertices, vertices + 1, vertices + 2, vertices, vertices + 2, vertices + 3);
        vertices += 4;
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
function disposeChunkMesh(chunk) {
    if (!chunk || !worldScene) return;
    const key = chunkKey(chunk.x, chunk.z), mesh = chunkMeshes.get(key);
    if (mesh) { worldScene.remove(mesh); mesh.geometry.dispose(); chunkMeshes.delete(key); }
    if (chunk.waterMesh) { worldScene.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); chunk.waterMesh = null; }
}
function rebuildChunkMesh(chunk) {
    if (!chunk || !worldScene) return;
    disposeChunkMesh(chunk);
    const geometry = makeGeometryForChunk(chunk);
    if (geometry) {
        const mesh = new THREE.Mesh(geometry, chunkMaterials);
        mesh.userData.isChunk = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        worldScene.add(mesh);
        chunkMeshes.set(chunkKey(chunk.x, chunk.z), mesh);
    }
    const waterGeometry = makeWaterGeometry(chunk);
    if (waterGeometry) {
        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        waterMesh.userData.isChunk = true;
        worldScene.add(waterMesh);
        chunk.waterMesh = waterMesh;
    }
}
function rebuildNeighbors(chunkX, chunkZ) {
    const neighborCoords = [[chunkX, chunkZ], [chunkX - 1, chunkZ], [chunkX + 1, chunkZ], [chunkX, chunkZ - 1], [chunkX, chunkZ + 1]];
    for (const [x, z] of neighborCoords) {
        const chunk = getChunk(x, z);
        if (chunk?.generated) rebuildChunkMesh(chunk);
    }
}
function queueNeededChunks(playerChunkX, playerChunkZ) {
    const wanted = [];
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dz));
        if (distance > RENDER_DISTANCE) continue;
        const x = playerChunkX + dx, z = playerChunkZ + dz, key = chunkKey(x, z);
        if (chunks.has(key) || queuedKeys.has(key)) continue;
        wanted.push({ x, z, distance, manhattan: Math.abs(dx) + Math.abs(dz) });
    }
    wanted.sort((a, b) => a.distance - b.distance || a.manhattan - b.manhattan);
    for (const item of wanted) { const key = chunkKey(item.x, item.z); queuedKeys.add(key); generationQueue.push(item); }
}
function processChunkQueue() {
    let processed = 0;
    while (processed < MAX_CHUNKS_PER_FRAME && generationQueue.length) {
        const item = generationQueue.shift();
        queuedKeys.delete(chunkKey(item.x, item.z));
        if (chunks.has(chunkKey(item.x, item.z))) continue;
        generateChunk(item.x, item.z);
        rebuildNeighbors(item.x, item.z);
        processed++;
    }
}
function unloadFarChunks(playerChunkX, playerChunkZ) {
    for (const [key, chunk] of chunks) {
        if (Math.max(Math.abs(chunk.x - playerChunkX), Math.abs(chunk.z - playerChunkZ)) > UNLOAD_DISTANCE) {
            disposeChunkMesh(chunk);
            chunks.delete(key);
        }
    }
}

export function initWorld(scene) { worldScene = scene; }
export function createWorld(scene) { initWorld(scene); }
export function updateChunkVisibility(position) {
    const { chunkX, chunkZ } = getChunkCoords(position.x, position.z);
    if (chunkX !== lastPlayerChunkX || chunkZ !== lastPlayerChunkZ) {
        lastPlayerChunkX = chunkX;
        lastPlayerChunkZ = chunkZ;
        queueNeededChunks(chunkX, chunkZ);
        unloadFarChunks(chunkX, chunkZ);
    }
    processChunkQueue();
}
export function setBlockAt(x, y, z, type) {
    x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
    if (y < MIN_Y || y > WORLD_TOP) return false;
    const { chunkX, chunkZ } = getChunkCoords(x, z);
    let chunk = getChunk(chunkX, chunkZ);
    if (!chunk) chunk = generateChunk(chunkX, chunkZ);
    if (!chunk || !setBlockData(x, y, z, type)) return false;
    rebuildNeighbors(chunkX, chunkZ);
    return true;
}
export function getPerformanceStats() { return { chunks: chunks.size, loadedChunks: chunks.size, meshes: chunkMeshes.size, queued: generationQueue.length }; }
export function getBlockTypes() { return BLOCK; }
export function getWorldSeed() { return WORLD_SEED; }
