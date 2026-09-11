import * as THREE from "three";
import {
    grassMaterial, dirtMaterial, stoneMaterial, cobblestoneMaterial,
    gravelMaterial, sandMaterial, sandstoneMaterial, bedrockMaterial,
    coalMaterial, ironMaterial, oakLogMaterial, oakPlankMaterial,
    leavesMaterial, snowMaterial, tntMaterial
} from "./blocks.js";

export const CHUNK_SIZE = 19;
export const CHUNK_HEIGHT = 128;
export const MIN_Y = -32;
export const SEA_LEVEL = 16;
export const WORLD_TOP = MIN_Y + CHUNK_HEIGHT - 1;
export const RENDER_DISTANCE = 6;
export const UNLOAD_DISTANCE = RENDER_DISTANCE + 2;

const BLOCK = {
    AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4,
    OAK: 5, LEAVES: 6, COBBLESTONE: 7, GRAVEL: 8,
    SANDSTONE: 9, BEDROCK: 10, COAL_ORE: 11, IRON_ORE: 12,
    OAK_PLANKS: 13, SNOW: 14, TNT: 15
};

function makeWorldSeed() {
    try {
        const values = new Uint32Array(2);
        crypto.getRandomValues(values);
        return (values[0] * 4096 + (values[1] >>> 20)) >>> 0;
    } catch {
        return Math.floor(Math.random() * 4294967296) >>> 0;
    }
}

let WORLD_SEED = makeWorldSeed();

export function setWorldSeed(seed) {
    const numeric = Number(seed);
    if (!Number.isFinite(numeric)) return WORLD_SEED;
    WORLD_SEED = (Math.floor(Math.abs(numeric)) >>> 0);
    return WORLD_SEED;
}

export function createNewWorldSeed() {
    const seed = makeWorldSeed();
    setWorldSeed(seed);
    if (worldScene) createWorld(worldScene);
    return seed;
}

const chunks = new Map();
const chunkMeshes = new Map();
const generationQueue = [];
const queuedKeys = new Set();
const worldOverrides = new Map();
let worldScene = null;
let lastPlayerChunkX = Infinity;
let lastPlayerChunkZ = Infinity;

const chunkMaterials = [
    grassMaterial[0], grassMaterial[2], dirtMaterial, stoneMaterial,
    sandMaterial, oakLogMaterial[0], oakLogMaterial[2], leavesMaterial,
    cobblestoneMaterial, gravelMaterial, sandstoneMaterial, bedrockMaterial,
    coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial, tntMaterial
];

const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    vertexColors: true,
    transparent: true,
    opacity: 0.56,
    depthWrite: false,
    side: THREE.DoubleSide,
    shininess: 120,
    specular: 0xe8f8ff,
    flatShading: false
});

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
function hash2D(x, z, salt = 0) { let h = Math.imul((x | 0) ^ 0x9e3779b9, 374761393); h = Math.imul(h ^ (z | 0), 668265263); h = Math.imul(h ^ (WORLD_SEED + salt), 1274126177); h ^= h >>> 13; h = Math.imul(h, 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967295; }
function hash3D(x, y, z, salt = 0) { let h = Math.imul((x | 0) ^ 0x9e3779b9, 374761393); h = Math.imul(h ^ (y | 0), 668265263); h = Math.imul(h ^ (z | 0), 2147483647); h = Math.imul(h ^ (WORLD_SEED + salt), 1274126177); h ^= h >>> 13; h = Math.imul(h, 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967295; }
function fade(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }
function valueNoise2D(x, z, scale = 1, salt = 0) { const sx = x / scale, sz = z / scale, x0 = Math.floor(sx), z0 = Math.floor(sz), tx = fade(sx - x0), tz = fade(sz - z0); return lerp(lerp(hash2D(x0,z0,salt),hash2D(x0+1,z0,salt),tx),lerp(hash2D(x0,z0+1,salt),hash2D(x0+1,z0+1,salt),tx),tz); }
function valueNoise3D(x, y, z, scale = 1, salt = 0) { const sx=x/scale,sy=y/scale,sz=z/scale,x0=Math.floor(sx),y0=Math.floor(sy),z0=Math.floor(sz),tx=fade(sx-x0),ty=fade(sy-y0),tz=fade(sz-z0); const n000=hash3D(x0,y0,z0,salt),n100=hash3D(x0+1,y0,z0,salt),n010=hash3D(x0,y0+1,z0,salt),n110=hash3D(x0+1,y0+1,z0,salt),n001=hash3D(x0,y0,z0+1,salt),n101=hash3D(x0+1,y0,z0+1,salt),n011=hash3D(x0,y0+1,z0+1,salt),n111=hash3D(x0+1,y0+1,z0+1,salt); const nx00=lerp(n000,n100,tx),nx10=lerp(n010,n110,tx),nx01=lerp(n001,n101,tx),nx11=lerp(n011,n111,tx),nxy0=lerp(nx00,nx10,ty),nxy1=lerp(nx01,nx11,ty); return lerp(nxy0,nxy1,tz); }
function octave2D(x,z,octaves,scale,persistence,salt){let value=0,amplitude=1,frequency=1,total=0;for(let i=0;i<octaves;i++){value+=valueNoise2D(x,z,scale/frequency,salt+i*101)*amplitude;total+=amplitude;amplitude*=persistence;frequency*=2;}return value/total;}
function octave3D(x,y,z,octaves,scale,persistence,salt){let value=0,amplitude=1,frequency=1,total=0;for(let i=0;i<octaves;i++){value+=valueNoise3D(x,y,z,scale/frequency,salt+i*83)*amplitude;total+=amplitude;amplitude*=persistence;frequency*=2;}return value/total;}
function getClimate(x,z){return{temperature:octave2D(x+900,z-1200,3,420,.55,11),humidity:octave2D(x-1700,z+600,3,360,.58,29)};}
function getBiome(x,z){const{temperature,humidity}=getClimate(x,z),weirdness=octave2D(x+300,z+700,2,220,.55,47);if(temperature<.24)return humidity>.45?"snow":"tundra";if(temperature>.86&&humidity<.24)return weirdness>.72?"badlands":"desert";if(humidity>.79)return"forest";if(humidity<.12)return"plains";if(weirdness>.88&&temperature>.58)return"desert";return humidity>.54?"forest":"plains";}
function getTerrainProfile(x,z){const continentalness=octave2D(x,z,4,320,.52,61),erosion=octave2D(x+1400,z-800,3,160,.54,73),peaks=octave2D(x-600,z+1100,4,120,.5,89),detail=octave2D(x+2400,z-1700,3,28,.5,97);let baseHeight=21+(continentalness-.5)*21;baseHeight+=(.5-erosion)*10;const mountainMask=Math.max(0,(peaks-.57)/.43);baseHeight+=mountainMask*mountainMask*30;baseHeight+=(detail-.5)*5;const oceanMask=Math.max(0,.09-continentalness)/.09;baseHeight-=oceanMask*4;return{height:Math.floor(THREE.MathUtils.clamp(baseHeight,MIN_Y+4,WORLD_TOP-8)),continentalness,erosion,peaks,detail};}
function shouldCarveCave(x,y,z,surfaceY){if(y>surfaceY-6||y>42||y<MIN_Y+3)return false;const depth=surfaceY-y,giant=octave3D(x,y,z,3,44,.55,121),spaghetti=octave3D(x,y,z,2,24,.53,157);if(depth>22&&giant>.67&&giant<.78)return true;if(depth>9&&Math.abs(spaghetti-.5)<.032)return true;return false;}
function oreChance(x,y,z,salt,scale){return octave3D(x,y,z,2,scale,.55,salt);}
function chooseStoneVariant(x,y,z,surfaceY){const variation=hash3D(x,y,z,911),gravel=octave3D(x,y,z,2,13,.55,313);if(y<surfaceY-3){if(y<=18&&oreChance(x,y,z,211,22)>.765)return BLOCK.IRON_ORE;if(y>-8&&oreChance(x+73,y-19,z-51,239,16)>.79)return BLOCK.COAL_ORE;if(variation>.93&&gravel>.57)return BLOCK.COBBLESTONE;if(gravel<.2)return BLOCK.GRAVEL;}return BLOCK.STONE;}
function getUnderwaterBlock(x,y,z,surfaceY){const depth=surfaceY-y,surfaceRoll=hash3D(x,y,z,1701),blockRoll=hash3D(x,y,z,1707);if(depth<=0){if(surfaceRoll<.72)return BLOCK.DIRT;if(surfaceRoll<.94)return BLOCK.SAND;return BLOCK.STONE;}if(depth<=4){if(blockRoll<.64)return BLOCK.DIRT;if(blockRoll<.88)return BLOCK.SAND;return BLOCK.STONE;}if(blockRoll<.46)return BLOCK.DIRT;if(blockRoll<.67)return BLOCK.SAND;return chooseStoneVariant(x,y,z,surfaceY);}
function getSurfaceBlock(biome,y,surfaceY,x,z){const submerged=surfaceY<SEA_LEVEL,beach=!submerged&&surfaceY<=SEA_LEVEL+1;if(submerged)return getUnderwaterBlock(x,y,z,surfaceY);if(biome==="desert"){if(y>=surfaceY-4)return BLOCK.SAND;if(y>=surfaceY-7)return BLOCK.SANDSTONE;return chooseStoneVariant(x,y,z,surfaceY);}if(biome==="badlands"){if(y===surfaceY)return BLOCK.SAND;if(y>=surfaceY-5)return BLOCK.SANDSTONE;return chooseStoneVariant(x,y,z,surfaceY);}if(biome==="snow"||biome==="tundra"){if(y===surfaceY)return BLOCK.SNOW;if(y>=surfaceY-4)return BLOCK.DIRT;return chooseStoneVariant(x,y,z,surfaceY);}if(beach){if(y>=surfaceY-1)return BLOCK.SAND;if(y===surfaceY-2)return BLOCK.SANDSTONE;}if(y===surfaceY)return BLOCK.GRASS;if(y>=surfaceY-3)return BLOCK.DIRT;return chooseStoneVariant(x,y,z,surfaceY);}
function setBlockData(x,y,z,type){if(y<MIN_Y||y>WORLD_TOP)return false;const{chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z),chunk=getChunk(chunkX,chunkZ);if(!chunk)return false;chunk.blocks[blockIndex(localX,y,localZ)]=type;return true;}
function getBlockType(x,y,z){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<MIN_Y||y>WORLD_TOP)return BLOCK.AIR;const{chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z),chunk=getChunk(chunkX,chunkZ);if(!chunk)return BLOCK.AIR;return chunk.blocks[blockIndex(localX,y,localZ)]||BLOCK.AIR;}
export function getBlockAt(x,y,z){return getBlockType(x,y,z);}
export function getBlockTypes(){return{...BLOCK};}
export function isPointInWater(x,y,z){const profile=getTerrainProfile(Math.floor(x),Math.floor(z));if(profile.height>=SEA_LEVEL)return false;const waterSurface=SEA_LEVEL+.42,solidFloor=profile.height+.5;return y<waterSurface-.02&&y>solidFloor+.05;}
function treeChance(x,z){const{temperature,humidity}=getClimate(x,z);if(temperature<.28||humidity<.3)return 0;const forest=THREE.MathUtils.clamp((humidity-.34)/.34,0,1),base=hash2D(x,z,1201),jitter=hash2D(x+137,z-411,1207),density=humidity>.6?.18+forest*.14:.045+forest*.045;return(base*.78+jitter*.22)<density?1:0;}
function addTree(x,y,z){const heightRoll=hash2D(x,z,1301),sizeRoll=hash2D(x,z,1303),shapeRoll=hash2D(x,z,1307),trunkHeight=4+Math.floor(heightRoll*4),canopyRadius=sizeRoll>.78?3:sizeRoll>.38?2:1,canopyLayers=shapeRoll>.68?4:shapeRoll>.32?3:2;for(let i=0;i<trunkHeight;i++)setBlockData(x,y+i,z,BLOCK.OAK);const top=y+trunkHeight-1;for(let layer=0;layer<canopyLayers;layer++){const layerY=top-layer,layerRadius=layer===canopyLayers-1?Math.max(1,canopyRadius-1):canopyRadius;for(let dx=-layerRadius;dx<=layerRadius;dx++){for(let dz=-layerRadius;dz<=layerRadius;dz++){const distance=Math.sqrt(dx*dx+dz*dz),edgeNoise=hash2D(x+dx*31+layer*17,z+dz*37-layer*11,1313),edgeLimit=layerRadius+.35+edgeNoise*.35;if(distance>edgeLimit)continue;if(layer===0&&dx===0&&dz===0)continue;setBlockData(x+dx,layerY,z+dz,BLOCK.LEAVES);}}}setBlockData(x,top+1,z,BLOCK.LEAVES);if(shapeRoll>.56){setBlockData(x-1,top,z,BLOCK.LEAVES);setBlockData(x+1,top,z,BLOCK.LEAVES);}if(canopyRadius>=3&&sizeRoll>.86){setBlockData(x,top-1,z-2,BLOCK.LEAVES);setBlockData(x,top-1,z+2,BLOCK.LEAVES);}}
function generateTerrain(chunk){const startX=chunk.x*CHUNK_SIZE,startZ=chunk.z*CHUNK_SIZE;for(let lx=0;lx<CHUNK_SIZE;lx++){for(let lz=0;lz<CHUNK_SIZE;lz++){const x=startX+lx,z=startZ+lz,biome=getBiome(x,z),surfaceY=getTerrainProfile(x,z).height;for(let y=MIN_Y;y<=surfaceY;y++){let type=y===MIN_Y?BLOCK.BEDROCK:getSurfaceBlock(biome,y,surfaceY,x,z);if(type!==BLOCK.BEDROCK&&shouldCarveCave(x,y,z,surfaceY))type=BLOCK.AIR;setBlockData(x,y,z,type);}}}for(let lx=0;lx<CHUNK_SIZE;lx++){for(let lz=0;lz<CHUNK_SIZE;lz++){const x=startX+lx,z=startZ+lz,biome=getBiome(x,z),surfaceY=getTerrainProfile(x,z).height;if(surfaceY<=SEA_LEVEL+1)continue;if(biome==="desert"||biome==="badlands"||biome==="snow"||biome==="tundra")continue;const patch=octave2D(x-400,z+900,2,11,.55,1409);if(patch>.82){const depth=2+Math.floor(hash2D(x,z,1411)*2);for(let d=0;d<depth;d++)if(getBlockType(x,surfaceY-d,z)===BLOCK.DIRT)setBlockData(x,surfaceY-d,z,BLOCK.GRASS);}}}}
function generateTrees(chunk){const startX=chunk.x*CHUNK_SIZE,startZ=chunk.z*CHUNK_SIZE;for(let lx=2;lx<CHUNK_SIZE-2;lx++){for(let lz=2;lz<CHUNK_SIZE-2;lz++){const x=startX+lx,z=startZ+lz,biome=getBiome(x,z);if(biome!=="forest"&&biome!=="plains")continue;const surfaceY=getTerrainProfile(x,z).height;if(surfaceY<SEA_LEVEL+1||getBlockType(x,surfaceY,z)!==BLOCK.GRASS||!treeChance(x,z))continue;let crowded=false;for(let dx=-1;dx<=1&&!crowded;dx++){for(let dz=-1;dz<=1;dz++){if(dx===0&&dz===0)continue;if(treeChance(x+dx,z+dz)&&hash2D(x+dx,z+dz,1417)>.48){crowded=true;break;}}}if(!crowded)addTree(x,surfaceY+1,z);}}}
function applyWorldOverridesToChunk(chunk){for(const[key,type]of worldOverrides){const[x,y,z]=key.split(',').map(Number);if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))continue;if(Math.floor(x/CHUNK_SIZE)!==chunk.x||Math.floor(z/CHUNK_SIZE)!==chunk.z||y<MIN_Y||y>WORLD_TOP)continue;const localX=((x%CHUNK_SIZE)+CHUNK_SIZE)%CHUNK_SIZE,localZ=((z%CHUNK_SIZE)+CHUNK_SIZE)%CHUNK_SIZE;chunk.blocks[blockIndex(localX,y,localZ)]=type;}}
function generateChunk(chunkX,chunkZ){const key=chunkKey(chunkX,chunkZ);if(chunks.has(key))return chunks.get(key);const chunk={x:chunkX,z:chunkZ,blocks:new Uint8Array(CHUNK_SIZE*CHUNK_SIZE*CHUNK_HEIGHT),generated:false,waterMesh:null};chunks.set(key,chunk);generateTerrain(chunk);generateTrees(chunk);applyWorldOverridesToChunk(chunk);chunk.generated=true;return chunk;}
function materialIndexFor(type,faceIndex){switch(type){case BLOCK.GRASS:return faceIndex===2?1:faceIndex===3?2:0;case BLOCK.DIRT:return 2;case BLOCK.STONE:return 3;case BLOCK.SAND:return 4;case BLOCK.OAK:return faceIndex===2||faceIndex===3?6:5;case BLOCK.LEAVES:return 7;case BLOCK.COBBLESTONE:return 8;case BLOCK.GRAVEL:return 9;case BLOCK.SANDSTONE:return 10;case BLOCK.BEDROCK:return 11;case BLOCK.COAL_ORE:return 12;case BLOCK.IRON_ORE:return 13;case BLOCK.OAK_PLANKS:return 14;case BLOCK.SNOW:return 15;case BLOCK.TNT:return faceIndex===2?17:faceIndex===3?18:16;default:return 0;}}
function isSolid(type){return type!==BLOCK.AIR;}
function getUnderwaterShade(x,y,z){const surfaceY=getTerrainProfile(x,z).height;if(surfaceY>=SEA_LEVEL||y>surfaceY)return 1;const depth=Math.max(0,SEA_LEVEL-(y+.5)),depthT=THREE.MathUtils.clamp(depth/24,0,1),shade=THREE.MathUtils.lerp(1,.43,depthT),variation=.96+hash3D(x,y,z,1911)*.06;return THREE.MathUtils.clamp(shade*variation,.40,1);}
function makeGeometryForChunk(chunk){const positions=[],normals=[],uvs=[],colors=[],groups=Array.from({length:chunkMaterials.length},()=>[]);let vertexCount=0;for(let lx=0;lx<CHUNK_SIZE;lx++){for(let lz=0;lz<CHUNK_SIZE;lz++){for(let y=MIN_Y;y<=WORLD_TOP;y++){const type=chunk.blocks[blockIndex(lx,y,lz)];if(!isSolid(type))continue;const x=chunk.x*CHUNK_SIZE+lx,z=chunk.z*CHUNK_SIZE+lz,underwaterShade=getUnderwaterShade(x,y,z);for(let faceIndex=0;faceIndex<6;faceIndex++){const face=FACES[faceIndex],neighbor=getBlockType(x+face.normal[0],y+face.normal[1],z+face.normal[2]);if(isSolid(neighbor)&&neighbor!==BLOCK.LEAVES)continue;const base=vertexCount;for(const corner of face.corners){positions.push(x+corner[0],y+corner[1],z+corner[2]);normals.push(face.normal[0],face.normal[1],face.normal[2]);colors.push(underwaterShade,underwaterShade,underwaterShade);}uvs.push(0,0,0,1,1,1,1,0);const matIndex=materialIndexFor(type,faceIndex);groups[matIndex].push(base,base+1,base+2,base,base+2,base+3);vertexCount+=4;}}}}if(vertexCount===0)return null;const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));const index=[];for(let i=0;i<groups.length;i++){const start=index.length;index.push(...groups[i]);if(groups[i].length)geometry.addGroup(start,groups[i].length,i);}geometry.setIndex(index);geometry.computeBoundingSphere();geometry.computeBoundingBox();return geometry;}

function makeWaterGeometry(chunk){const positions=[],normals=[],uvs=[],colors=[],indices=[];let vertices=0;const startX=chunk.x*CHUNK_SIZE,startZ=chunk.z*CHUNK_SIZE;for(let lx=0;lx<CHUNK_SIZE;lx++){for(let lz=0;lz<CHUNK_SIZE;lz++){const x=startX+lx,z=startZ+lz,surfaceY=getTerrainProfile(x,z).height;if(surfaceY>=SEA_LEVEL)continue;const y=SEA_LEVEL+.42,waveA=Math.sin((x+z)*.19)*.042,waveB=Math.sin((x*.31-z*.17)+1.7)*.025,waveC=Math.cos((x*.13+z*.27)-.6)*.02,base=vertices;positions.push(x-.5,y+waveA+waveC,z-.5,x-.5,y+waveB,z+.5,x+.5,y-waveA+waveC*.5,z+.5,x+.5,y-waveB,z-.5);normals.push(0,1,0,0,1,0,0,1,0,0,1,0);const shimmer=.94+hash2D(x,z,1931)*.12;colors.push(.16*shimmer,.52*shimmer,.80*shimmer,.20*shimmer,.59*shimmer,.86*shimmer,.13*shimmer,.47*shimmer,.75*shimmer,.19*shimmer,.56*shimmer,.84*shimmer);uvs.push(0,0,0,1,1,1,1,0);indices.push(base,base+1,base+2,base,base+2,base+3);vertices+=4;}}if(vertices===0)return null;const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeBoundingSphere();return geometry;}
function disposeChunkMesh(chunk){if(!chunk||!worldScene)return;const key=chunkKey(chunk.x,chunk.z),mesh=chunkMeshes.get(key);if(mesh){worldScene.remove(mesh);mesh.geometry.dispose();chunkMeshes.delete(key);}if(chunk.waterMesh){worldScene.remove(chunk.waterMesh);chunk.waterMesh.geometry.dispose();chunk.waterMesh=null;}}
function rebuildChunkMesh(chunk){if(!chunk||!worldScene)return;disposeChunkMesh(chunk);const geometry=makeGeometryForChunk(chunk);if(geometry){const mesh=new THREE.Mesh(geometry,chunkMaterials);mesh.userData.isChunk=true;mesh.castShadow=true;mesh.receiveShadow=true;worldScene.add(mesh);chunkMeshes.set(chunkKey(chunk.x,chunk.z),mesh);}const waterGeometry=makeWaterGeometry(chunk);if(waterGeometry){const waterMesh=new THREE.Mesh(waterGeometry,waterMaterial);waterMesh.userData.isChunk=true;waterMesh.userData.isWater=true;waterMesh.castShadow=false;waterMesh.receiveShadow=false;worldScene.add(waterMesh);chunk.waterMesh=waterMesh;}}
function queueNeededChunks(playerChunkX,playerChunkZ){const wanted=[];for(let dx=-RENDER_DISTANCE;dx<=RENDER_DISTANCE;dx++){for(let dz=-RENDER_DISTANCE;dz<=RENDER_DISTANCE;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))>RENDER_DISTANCE)continue;const x=playerChunkX+dx,z=playerChunkZ+dz,key=chunkKey(x,z);if(chunks.has(key)||queuedKeys.has(key))continue;wanted.push({x,z,distance:Math.sqrt(dx*dx+dz*dz)});}}wanted.sort((a,b)=>a.distance-b.distance);for(const item of wanted){const key=chunkKey(item.x,item.z);queuedKeys.add(key);generationQueue.push(item);}}
function processChunkQueue(){const first=generationQueue.shift();if(!first)return;const key=chunkKey(first.x,first.z);queuedKeys.delete(key);if(chunks.has(key))return;const chunk=generateChunk(first.x,first.z);rebuildChunkMesh(chunk);}
function unloadFarChunks(playerChunkX,playerChunkZ){for(const[key,chunk]of chunks){const distance=Math.max(Math.abs(chunk.x-playerChunkX),Math.abs(chunk.z-playerChunkZ));if(distance>UNLOAD_DISTANCE){disposeChunkMesh(chunk);chunks.delete(key);}}for(let i=generationQueue.length-1;i>=0;i--){const item=generationQueue[i];if(Math.max(Math.abs(item.x-playerChunkX),Math.abs(item.z-playerChunkZ))>UNLOAD_DISTANCE){queuedKeys.delete(chunkKey(item.x,item.z));generationQueue.splice(i,1);}}}
function updateFacingVisibility(playerPosition,camera){if(!camera)return;const direction=new THREE.Vector3();camera.getWorldDirection(direction);direction.y=0;if(direction.lengthSq()<.0001)return;direction.normalize();const playerChunk=getChunkCoords(playerPosition.x,playerPosition.z),maxDistance=RENDER_DISTANCE+1;for(const chunk of chunks.values()){const mesh=chunkMeshes.get(chunkKey(chunk.x,chunk.z)),water=chunk.waterMesh;if(!mesh&&!water)continue;const dx=chunk.x-playerChunk.chunkX,dz=chunk.z-playerChunk.chunkZ;if(Math.max(Math.abs(dx),Math.abs(dz))>maxDistance){if(mesh)mesh.visible=false;if(water)water.visible=false;continue;}const toChunk=new THREE.Vector3(dx,0,dz),distance=toChunk.length(),shouldKeep=distance<2.4||toChunk.normalize().dot(direction)>-.72;if(mesh)mesh.visible=shouldKeep;if(water)water.visible=shouldKeep;}}
export function setBlockAt(x,y,z,type){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);type=Math.floor(Number(type));if(![x,y,z,type].every(Number.isFinite)||y<MIN_Y||y>WORLD_TOP)return false;worldOverrides.set(`${x},${y},${z}`,type);const{chunkX,chunkZ,localX,localZ}=getChunkCoords(x,z),chunk=getChunk(chunkX,chunkZ);if(!chunk)return true;chunk.blocks[blockIndex(localX,y,localZ)]=type;rebuildChunkMesh(chunk);if(localX===0){const neighbor=getChunk(chunkX-1,chunkZ);if(neighbor)rebuildChunkMesh(neighbor);}if(localX===CHUNK_SIZE-1){const neighbor=getChunk(chunkX+1,chunkZ);if(neighbor)rebuildChunkMesh(neighbor);}if(localZ===0){const neighbor=getChunk(chunkX,chunkZ-1);if(neighbor)rebuildChunkMesh(neighbor);}if(localZ===CHUNK_SIZE-1){const neighbor=getChunk(chunkX,chunkZ+1);if(neighbor)rebuildChunkMesh(neighbor);}return true;}
export function clearWorld(){for(const chunk of chunks.values())disposeChunkMesh(chunk);chunks.clear();chunkMeshes.clear();generationQueue.length=0;queuedKeys.clear();worldOverrides.clear();lastPlayerChunkX=Infinity;lastPlayerChunkZ=Infinity;}
export function createWorld(scene){worldScene=scene;clearWorld();for(let dx=-1;dx<=1;dx++){for(let dz=-1;dz<=1;dz++){const chunk=generateChunk(dx,dz);rebuildChunkMesh(chunk);}}queueNeededChunks(0,0);}
export function updateChunkVisibility(position,camera){if(!worldScene||!position)return;const{chunkX,chunkZ}=getChunkCoords(position.x,position.z);if(chunkX!==lastPlayerChunkX||chunkZ!==lastPlayerChunkZ){lastPlayerChunkX=chunkX;lastPlayerChunkZ=chunkZ;queueNeededChunks(chunkX,chunkZ);unloadFarChunks(chunkX,chunkZ);}processChunkQueue();updateFacingVisibility(position,camera);}
export function getPerformanceStats(){return{loadedChunks:chunks.size,queuedChunks:generationQueue.length,renderDistance:RENDER_DISTANCE,seed:WORLD_SEED};}
export function getWorldSeed(){return WORLD_SEED;}
