import {
    createBlock,
    grassMaterial,
    dirtMaterial,
    stoneMaterial
} from "./blocks.js";

const CHUNK_SIZE = 16;
const WORLD_SIZE = 30;

const chunks = new Map();
const blockMap = new Map();

function blockKey(x, y, z) {
    return `${x},${y},${z}`;
}

function registerBlock(block, x, y, z) {
    block.userData.isBlock = true;

    blockMap.set(
        blockKey(x, y, z),
        block
    );
}

export function getBlockAt(x, y, z) {
    return blockMap.get(
        blockKey(
            Math.floor(x),
            Math.floor(y),
            Math.floor(z)
        )
    );
}

export function registerWorldBlock(block) {
    const x = Math.round(block.position.x);
    const y = Math.round(block.position.y);
    const z = Math.round(block.position.z);

    registerBlock(block, x, y, z);
}

export function removeWorldBlock(block) {
    const x = Math.round(block.position.x);
    const y = Math.round(block.position.y);
    const z = Math.round(block.position.z);

    blockMap.delete(
        blockKey(x, y, z)
    );
}

function getChunkKey(chunkX, chunkZ) {
    return `${chunkX},${chunkZ}`;
}

function createChunk(scene, chunkX, chunkZ) {

    const key =
        getChunkKey(chunkX, chunkZ);

    if (chunks.has(key)) {
        return;
    }

    const chunk = {
        x: chunkX,
        z: chunkZ,
        blocks: [],
        loaded: true
    };

    chunks.set(key, chunk);

    const startX =
        chunkX * CHUNK_SIZE;

    const startZ =
        chunkZ * CHUNK_SIZE;

    const endX =
        Math.min(
            startX + CHUNK_SIZE - 1,
            WORLD_SIZE
        );

    const endZ =
        Math.min(
            startZ + CHUNK_SIZE - 1,
            WORLD_SIZE
        );

    for (
        let x = startX;
        x <= endX;
        x++
    ) {

        for (
            let z = startZ;
            z <= endZ;
            z++
        ) {

            if (
                x < -WORLD_SIZE ||
                z < -WORLD_SIZE
            ) {
                continue;
            }

            const height =
                Math.floor(
                    2 +
                    Math.sin(x * 0.25) * 2 +
                    Math.cos(z * 0.25) * 2
                );

            // Stone
            for (
                let y = -5;
                y < height - 2;
                y++
            ) {

                const block =
                    createBlock(
                        scene,
                        x,
                        y,
                        z,
                        stoneMaterial
                    );

                registerBlock(
                    block,
                    x,
                    y,
                    z
                );

                chunk.blocks.push(block);
            }

            // Dirt
            for (
                let y = height - 2;
                y < height;
                y++
            ) {

                const block =
                    createBlock(
                        scene,
                        x,
                        y,
                        z,
                        dirtMaterial
                    );

                registerBlock(
                    block,
                    x,
                    y,
                    z
                );

                chunk.blocks.push(block);
            }

            // Grass
            const grass =
                createBlock(
                    scene,
                    x,
                    height,
                    z,
                    grassMaterial
                );

            registerBlock(
                grass,
                x,
                height,
                z
            );

            chunk.blocks.push(grass);
        }
    }
}

export function createWorld(scene) {

    const minChunk =
        Math.floor(
            -WORLD_SIZE /
            CHUNK_SIZE
        );

    const maxChunk =
        Math.floor(
            WORLD_SIZE /
            CHUNK_SIZE
        );

    for (
        let chunkX = minChunk;
        chunkX <= maxChunk;
        chunkX++
    ) {

        for (
            let chunkZ = minChunk;
            chunkZ <= maxChunk;
            chunkZ++
        ) {

            createChunk(
                scene,
                chunkX,
                chunkZ
            );
        }
    }
}

export function getChunks() {
    return chunks;
}

export function getChunkSize() {
    return CHUNK_SIZE;
}