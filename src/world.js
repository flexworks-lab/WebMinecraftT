import {
    createBlock,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
} from "./blocks.js";

const CHUNK_SIZE = 16;
const WORLD_SIZE = 64;
const MIN_Y = -4;

const chunks = new Map();
const blockMap = new Map();

function blockKey(x, y, z) {
    return `${x},${y},${z}`;
}

function registerBlock(block, x, y, z) {
    block.userData.isBlock = true;
    blockMap.set(blockKey(x, y, z), block);
}

export function getBlockAt(x, y, z) {
    return blockMap.get(
        blockKey(Math.floor(x), Math.floor(y), Math.floor(z))
    );
}

export function registerWorldBlock(block) {
    registerBlock(
        block,
        Math.round(block.position.x),
        Math.round(block.position.y),
        Math.round(block.position.z)
    );
}

export function removeWorldBlock(block) {
    blockMap.delete(
        blockKey(
            Math.round(block.position.x),
            Math.round(block.position.y),
            Math.round(block.position.z)
        )
    );
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

    let height =
        2 +
        (large - 0.5) * 10 +
        (medium - 0.5) * 5 +
        (detail - 0.5) * 2;

    const distance = Math.hypot(x, z);
    const spawnFlatten = Math.max(0, 1 - distance / 18);
    height = height * (1 - spawnFlatten) + 3 * spawnFlatten;

    return Math.max(-1, Math.floor(height));
}

function isWaterColumn(x, z, height) {
    return height < 1;
}

function addBlock(scene, chunk, x, y, z, material) {
    if (getBlockAt(x, y, z)) return;

    const block = createBlock(scene, x, y, z, material);
    registerBlock(block, x, y, z);
    chunk.blocks.push(block);
}

function addTree(scene, chunk, x, y, z) {
    const trunkHeight = 4 + Math.floor(noise2D(x * 2, z * 2) * 2);

    for (let i = 0; i < trunkHeight; i++) {
        addBlock(scene, chunk, x, y + i, z, oakLogMaterial);
    }

    const top = y + trunkHeight - 1;

    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            const distance = Math.abs(dx) + Math.abs(dz);
            if (distance > 3) continue;

            addBlock(scene, chunk, x + dx, top, z + dz, leavesMaterial);
        }
    }

    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            addBlock(scene, chunk, x + dx, top + 1, z + dz, leavesMaterial);
        }
    }

    addBlock(scene, chunk, x, top + 2, z, leavesMaterial);
}

function createChunk(scene, chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;
    if (chunks.has(key)) return;

    const chunk = {
        x: chunkX,
        z: chunkZ,
        blocks: [],
        loaded: true
    };

    chunks.set(key, chunk);

    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;
    const endX = startX + CHUNK_SIZE - 1;
    const endZ = startZ + CHUNK_SIZE - 1;

    for (let x = startX; x <= endX; x++) {
        for (let z = startZ; z <= endZ; z++) {
            if (x < -WORLD_SIZE || x > WORLD_SIZE || z < -WORLD_SIZE || z > WORLD_SIZE) {
                continue;
            }

            const height = terrainHeight(x, z);
            const water = isWaterColumn(x, z, height);

            const surfaceHeight = water ? 1 : height;

            for (let y = MIN_Y; y <= surfaceHeight; y++) {
                let material = stoneMaterial;

                if (y === surfaceHeight) {
                    material = water ? sandMaterial : grassMaterial;
                } else if (y >= surfaceHeight - 2) {
                    material = water ? sandMaterial : dirtMaterial;
                }

                addBlock(scene, chunk, x, y, z, material);
            }

            if (water) {
                // Water is represented visually as a shallow transparent block.
                // It is intentionally not registered as solid terrain.
                const waterBlock = createBlock(scene, x, 1.45, z, sandMaterial);
                waterBlock.scale.y = 0.08;
                waterBlock.material = sandMaterial.clone();
                waterBlock.material.transparent = true;
                waterBlock.material.opacity = 0.38;
                waterBlock.userData.isWater = true;
                chunk.blocks.push(waterBlock);
            }
        }
    }

    // Trees are generated after terrain so their roots always sit on the surface.
    for (let x = startX; x <= endX; x++) {
        for (let z = startZ; z <= endZ; z++) {
            if (x < -WORLD_SIZE || x > WORLD_SIZE || z < -WORLD_SIZE || z > WORLD_SIZE) continue;

            const height = terrainHeight(x, z);
            if (height < 2) continue;

            const treeChance = noise2D(x + 900, z - 700);
            const spacing = noise2D(x * 3 + 17, z * 3 - 41);

            if (treeChance > 0.84 && spacing > 0.38) {
                const nearEdge =
                    x <= startX + 2 ||
                    x >= endX - 2 ||
                    z <= startZ + 2 ||
                    z >= endZ - 2;

                if (!nearEdge && !getBlockAt(x, height + 1, z)) {
                    addTree(scene, chunk, x, height + 1, z);
                }
            }
        }
    }
}

export function createWorld(scene) {
    const minChunk = Math.floor(-WORLD_SIZE / CHUNK_SIZE);
    const maxChunk = Math.floor(WORLD_SIZE / CHUNK_SIZE);

    for (let chunkX = minChunk; chunkX <= maxChunk; chunkX++) {
        for (let chunkZ = minChunk; chunkZ <= maxChunk; chunkZ++) {
            createChunk(scene, chunkX, chunkZ);
        }
    }
}

export function getChunks() {
    return chunks;
}

export function getChunkSize() {
    return CHUNK_SIZE;
}