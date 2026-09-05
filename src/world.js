import * as THREE from "three";

import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    cobblestoneMaterial,
    gravelMaterial,
    sandMaterial,
    sandstoneMaterial,
    bedrockMaterial,
    coalMaterial,
    ironMaterial,
    oakLogMaterial,
    oakPlankMaterial,
    leavesMaterial,
    snowMaterial
} from "./blocks.js";

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 96;
export const MIN_Y = -16;
export const RENDER_DISTANCE = 6;
export const UNLOAD_DISTANCE = RENDER_DISTANCE + 2;

const BLOCK = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    SAND: 4,
    OAK: 5,
    LEAVES: 6,
    COBBLESTONE: 7,
    GRAVEL: 8,
    SANDSTONE: 9,
    BEDROCK: 10,
    COAL_ORE: 11,
    IRON_ORE: 12,
    OAK_PLANKS: 13,
    SNOW: 14
};

const chunks = new Map();
const chunkMeshes = new Map();
let worldScene = null;
let lastPlayerChunkX = Infinity;
let lastPlayerChunkZ = Infinity;

const chunkMaterials = [
    grassMaterial[0], grassMaterial[2], grassMaterial[3], stoneMaterial,
    sandMaterial, oakLogMaterial[0], leavesMaterial, cobblestoneMaterial,
    gravelMaterial, sandstoneMaterial, bedrockMaterial, coalMaterial,
    ironMaterial, oakPlankMaterial, snowMaterial
];

const waterMaterial = new THREE.MeshLambertMaterial({
    color: 0x4fa7e8,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
});

const FACES = [
    { normal: [1,0,0], corners: [[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]] },
    { normal: [-1,0,0], corners: [[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]] },
    { normal: [0,1,0], corners: [[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]] },
    { normal: [0,-1,0], corners: [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]] },
    { normal: [0,0,1], corners: [[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]] },
    { normal: [0,0,-1], corners: [[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]] }
];

function chunkKey(x,z) { return `${x},${z}`; }

function getChunkCoords(x,z) {
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return { chunkX, chunkZ, localX, localZ };
}

function blockIndex(localX,y,localZ) {
    return (y - MIN_Y) * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX;
}

function getChunk(x,z) { return chunks.get(chunkKey(x,z)); }

function noise2D(x,z) {
    const n = Math.sin(x * 127.1 + z * 311.7 + 91.17) * 43758.5453123;
    return n - Math.floor(n);
}

function smoothNoise(x,z,scale) {
    const sx=x/scale, sz=z/scale;
    const x0=Math.floor(sx), z0=Math.floor(sz);
    const tx=sx-x0, tz=sz-z0;
    const fx=tx*tx*(3-2*tx), fz=tz*tz*(3-2*tz);
    const a=noise2D(x0,z0), b=noise2D(x0+1,z0), c=noise2D(x0,z0+1), d=noise2D(x0+1,z0+1);
    return (a+(b-a)*fx)+((c+(d-c)*fx)-(a+(b-a)*fx))*fz;
}

function getBiome(x,z) {
    const temperature=smoothNoise(x+3300,z+500,240);
    const humidity=smoothNoise(x-700,z+1200,130);
    const dryness=smoothNoise(x+1500,z-900,180);

    if (temperature < 0.20) return "tundra";
    if (temperature < 0.32 && humidity > 0.45) return "snow";
    if (dryness < 0.23) return "desert";
    if (dryness < 0.34 && humidity < 0.40) return "badlands";
    if (humidity > 0.68) return "forest";
    if (humidity < 0.25) return "plains";
    return "forest";
}

function terrainHeight(x,z,biome) {
    const continental=smoothNoise(x+400,z-200,90);
    const large=smoothNoise(x,z,55);
    const medium=smoothNoise(x+300,z-200,24);
    const detail=smoothNoise(x-800,z+500,9);
    let height=5+(continental-.5)*18+(large-.5)*14+(medium-.5)*6+(detail-.5)*2;

    if (biome === "mountains") height += smoothNoise(x+4000,z-3000,35)*24;
    if (biome === "desert") height=4+(large-.5)*9+(medium-.5)*4;
    if (biome === "badlands") height=7+(large-.5)*17+(medium-.5)*8;
    if (biome === "snow" || biome === "tundra") height += (large-.5)*7;
    if (biome === "plains") height=4+(large-.5)*9+(medium-.5)*4;

    const distance=Math.hypot(x,z);
    const spawnFlatten=Math.max(0,1-distance/22);
    height=height*(1-spawnFlatten)+5*spawnFlatten;
    return Math.max(1,Math.min(MIN_Y+CHUNK_HEIGHT-8,Math.floor(height)));
}

function surfaceBlock(biome,y,surfaceY) {
    if (biome === "desert") return y >= surfaceY-3 ? BLOCK.SAND : BLOCK.SANDSTONE;
    if (biome === "badlands") return y === surfaceY ? BLOCK.SAND : y >= surfaceY-3 ? BLOCK.SANDSTONE : BLOCK.STONE;
    if (biome === "snow" || biome === "tundra") return y === surfaceY ? BLOCK.SNOW : y >= surfaceY-3 ? BLOCK.DIRT : BLOCK.STONE;
    if (y === surfaceY) return BLOCK.GRASS;
    if (y >= surfaceY-3) return BLOCK.DIRT;
    return BLOCK.STONE;
}

function setBlockData(x,y,z,type) {
    if (y<MIN_Y || y>=MIN_Y+CHUNK_HEIGHT) return false;
    const {chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z);
    const chunk=getChunk(chunkX,chunkZ);
    if (!chunk) return false;
    chunk.blocks[blockIndex(localX,y,localZ)]=type;
    return true;
}

function getBlockType(x,y,z) {
    x=Math.floor(x); y=Math.floor(y); z=Math.floor(z);
    if (y<MIN_Y || y>=MIN_Y+CHUNK_HEIGHT) return BLOCK.AIR;
    const {chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z);
    const chunk=getChunk(chunkX,chunkZ);
    if (!chunk) return BLOCK.AIR;
    return chunk.blocks[blockIndex(localX,y,localZ)] || BLOCK.AIR;
}

export function getBlockAt(x,y,z) { return getBlockType(x,y,z); }

export function setBlockAt(x,y,z,type) {
    x=Math.round(x); y=Math.round(y); z=Math.round(z);
    const {chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z);
    const chunk=getChunk(chunkX,chunkZ);
    if (!chunk || y<MIN_Y || y>=MIN_Y+CHUNK_HEIGHT) return false;
    chunk.blocks[blockIndex(localX,y,localZ)]=type;
    rebuildChunkMesh(chunk);
    if (localX===0) rebuildChunkMesh(getChunk(chunkX-1,chunkZ));
    if (localX===CHUNK_SIZE-1) rebuildChunkMesh(getChunk(chunkX+1,chunkZ));
    if (localZ===0) rebuildChunkMesh(getChunk(chunkX,chunkZ-1));
    if (localZ===CHUNK_SIZE-1) rebuildChunkMesh(getChunk(chunkX,chunkZ+1));
    return true;
}

function addTree(x,y,z) {
    const height=5+Math.floor(noise2D(x*2,z*2)*3);
    for (let i=0;i<height;i++) setBlockData(x,y+i,z,BLOCK.OAK);
    const top=y+height-1;

    for (let layer=0;layer<4;layer++) {
        const radius=layer===0?2:layer===1?3:layer===2?2:1;
        const ly=top-layer;
        for (let dx=-radius;dx<=radius;dx++) {
            for (let dz=-radius;dz<=radius;dz++) {
                const dist=Math.abs(dx)+Math.abs(dz);
                if (dist<=radius+1 && !(layer===0 && Math.abs(dx)+Math.abs(dz)<2)) setBlockData(x+dx,ly,z+dz,BLOCK.LEAVES);
            }
        }
    }
    setBlockData(x,top+1,z,BLOCK.LEAVES);
    setBlockData(x,top+2,z,BLOCK.LEAVES);
}

function generateChunk(chunkX,chunkZ) {
    const key=chunkKey(chunkX,chunkZ);
    if (chunks.has(key)) return chunks.get(key);

    const chunk={x:chunkX,z:chunkZ,blocks:new Uint8Array(CHUNK_SIZE*CHUNK_SIZE*CHUNK_HEIGHT),generated:false};
    chunks.set(key,chunk);
    const startX=chunkX*CHUNK_SIZE, startZ=chunkZ*CHUNK_SIZE;

    for (let lx=0;lx<CHUNK_SIZE;lx++) {
        for (let lz=0;lz<CHUNK_SIZE;lz++) {
            const x=startX+lx, z=startZ+lz;
            const biome=getBiome(x,z), height=terrainHeight(x,z,biome);
            for (let y=MIN_Y;y<=height;y++) {
                let type=surfaceBlock(biome,y,height);
                if (y===MIN_Y) type=BLOCK.BEDROCK;
                else if (type===BLOCK.STONE) {
                    const oreNoise=noise2D(x*5+y*3,z*5-y*2);
                    if (y<height-5 && oreNoise>0.94) type=BLOCK.IRON_ORE;
                    else if (y<height-3 && oreNoise>0.82) type=BLOCK.COAL_ORE;
                    else if (oreNoise>0.76) type=BLOCK.COBBLESTONE;
                    else if (oreNoise<0.07) type=BLOCK.GRAVEL;
                }
                setBlockData(x,y,z,type);
            }

            if (height<2) {
                for (let y=height+1;y<=2;y++) setBlockData(x,y,z,BLOCK.AIR);
            }
        }
    }

    for (let lx=4;lx<CHUNK_SIZE-4;lx++) {
        for (let lz=4;lz<CHUNK_SIZE-4;lz++) {
            const x=startX+lx,z=startZ+lz,biome=getBiome(x,z),height=terrainHeight(x,z,biome);
            if (biome!=="forest" && biome!=="plains") continue;
            if (getBlockType(x,height,z)!==BLOCK.GRASS) continue;
            if (noise2D(x+900,z-700)<=0.72) continue;
            if (noise2D(x*3+17,z*3-41)<=0.28) continue;
            addTree(x,height+1,z);
        }
    }

    chunk.generated=true;
    return chunk;
}

function materialIndexFor(type,faceIndex) {
    switch(type) {
        case BLOCK.GRASS: return faceIndex===2?1:faceIndex===3?2:0;
        case BLOCK.DIRT: return 2;
        case BLOCK.STONE: return 3;
        case BLOCK.SAND: return 4;
        case BLOCK.OAK: return faceIndex===2||faceIndex===3?6:5;
        case BLOCK.LEAVES: return 6;
        case BLOCK.COBBLESTONE: return 7;
        case BLOCK.GRAVEL: return 8;
        case BLOCK.SANDSTONE: return 9;
        case BLOCK.BEDROCK: return 10;
        case BLOCK.COAL_ORE: return 11;
        case BLOCK.IRON_ORE: return 12;
        case BLOCK.OAK_PLANKS: return 13;
        case BLOCK.SNOW: return 14;
        default: return 0;
    }
}

function makeGeometryForChunk(chunk) {
    const positions=[],normals=[],uvs=[],indices=[];
    const faceData=Array.from({length:chunkMaterials.length},()=>[]);
    let vertices=0;

    for (let lx=0;lx<CHUNK_SIZE;lx++) {
        for (let lz=0;lz<CHUNK_SIZE;lz++) {
            for (let y=MIN_Y;y<MIN_Y+CHUNK_HEIGHT;y++) {
                const type=chunk.blocks[blockIndex(lx,y,lz)];
                if (!type) continue;
                const x=chunk.x*CHUNK_SIZE+lx,z=chunk.z*CHUNK_SIZE+lz;
                for (let faceIndex=0;faceIndex<6;faceIndex++) {
                    const face=FACES[faceIndex];
                    if (getBlockType(x+face.normal[0],y+face.normal[1],z+face.normal[2])!==BLOCK.AIR) continue;
                    const materialIndex=materialIndexFor(type,faceIndex);
                    const base=vertices;
                    for (const corner of face.corners) {
                        positions.push(x+corner[0],y+corner[1],z+corner[2]);
                        normals.push(...face.normal);
                    }
                    uvs.push(0,0,0,1,1,1,1,0);
                    indices.push(base,base+1,base+2,base,base+2,base+3);
                    faceData[materialIndex].push(...indices.slice(-6));
                    vertices+=4;
                }
            }
        }
    }

    if (!vertices) return null;
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));

    const orderedIndices=[];
    for (let materialIndex=0;materialIndex<faceData.length;materialIndex++) {
        const start=orderedIndices.length;
        orderedIndices.push(...faceData[materialIndex]);
        if (faceData[materialIndex].length) geometry.addGroup(start,faceData[materialIndex].length,materialIndex);
    }
    geometry.setIndex(orderedIndices);
    geometry.computeBoundingSphere();
    return geometry;
}

function makeWaterGeometry(chunk) {
    const positions=[],normals=[],uvs=[],indices=[];
    let vertices=0;
    for (let lx=0;lx<CHUNK_SIZE;lx++) for (let lz=0;lz<CHUNK_SIZE;lz++) {
        const x=chunk.x*CHUNK_SIZE+lx,z=chunk.z*CHUNK_SIZE+lz;
        const biome=getBiome(x,z),height=terrainHeight(x,z,biome);
        if (height>=1) continue;
        const y=1.45;
        positions.push(x-.5,y,z-.5,x-.5,y,z+.5,x+.5,y,z+.5,x+.5,y,z-.5);
        normals.push(0,1,0,0,1,0,0,1,0,0,1,0);
        uvs.push(0,0,0,1,1,1,1,0);
        indices.push(vertices,vertices+1,vertices+2,vertices,vertices+2,vertices+3);
        vertices+=4;
    }
    if (!vertices) return null;
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
}

function rebuildChunkMesh(chunk) {
    if (!chunk || !worldScene) return;
    const key=chunkKey(chunk.x,chunk.z);
    const old=chunkMeshes.get(key);
    if (old) {
        worldScene.remove(old);
        old.geometry.dispose();
        chunkMeshes.delete(key);
    }
    const geometry=makeGeometryForChunk(chunk);
    if (geometry) {
        const mesh=new THREE.Mesh(geometry,chunkMaterials);
        mesh.userData.isChunk=true;
        mesh.castShadow=false;
        mesh.receiveShadow=false;
        worldScene.add(mesh);
        chunkMeshes.set(key,mesh);
    }

    const oldWater=chunk.waterMesh;
    if (oldWater) { worldScene.remove(oldWater); oldWater.geometry.dispose(); }
    const waterGeometry=makeWaterGeometry(chunk);
    if (waterGeometry) {
        const waterMesh=new THREE.Mesh(waterGeometry,waterMaterial);
        waterMesh.userData.isChunk=true;
        worldScene.add(waterMesh);
        chunk.waterMesh=waterMesh;
    } else chunk.waterMesh=null;
}

function distanceToPlayerChunk(chunkX,chunkZ,playerChunkX,playerChunkZ) {
    return Math.max(Math.abs(chunkX-playerChunkX),Math.abs(chunkZ-playerChunkZ));
}

export function updateVisibleChunks(playerX,playerZ) {
    if (!worldScene) return;
    const {chunkX:playerChunkX,chunkZ:playerChunkZ}=getChunkCoords(playerX,playerZ);
    for (let dx=-RENDER_DISTANCE;dx<=RENDER_DISTANCE;dx++) {
        for (let dz=-RENDER_DISTANCE;dz<=RENDER_DISTANCE;dz++) {
            const distance=Math.max(Math.abs(dx),Math.abs(dz));
            if (distance>RENDER_DISTANCE) continue;
            const chunk=generateChunk(playerChunkX+dx,playerChunkZ+dz);
            rebuildChunkMesh(chunk);
        }
    }
    for (const [key,chunk] of chunks) {
        if (distanceToPlayerChunk(chunk.x,chunk.z,playerChunkX,playerChunkZ)>UNLOAD_DISTANCE) {
            const mesh=chunkMeshes.get(key);
            if (mesh) { worldScene.remove(mesh); mesh.geometry.dispose(); chunkMeshes.delete(key); }
            if (chunk.waterMesh) { worldScene.remove(chunk.waterMesh); chunk.waterMesh.geometry.dispose(); chunk.waterMesh=null; }
            chunks.delete(key);
        }
    }
}

export function updateChunkVisibility(position) {
    const {chunkX,chunkZ}=getChunkCoords(position.x,position.z);
    if (chunkX===lastPlayerChunkX && chunkZ===lastPlayerChunkZ) return;
    lastPlayerChunkX=chunkX; lastPlayerChunkZ=chunkZ;
    updateVisibleChunks(position.x,position.z);
}

export function createWorld(scene) {
    worldScene=scene;
    lastPlayerChunkX=Infinity;
    lastPlayerChunkZ=Infinity;
    updateVisibleChunks(0,0);
}

export function getChunkSize() { return CHUNK_SIZE; }
export function getBlockTypes() { return BLOCK; }
export function getPerformanceStats() { return {loadedChunks:chunkMeshes.size}; }
