import * as THREE from "three";
import { getBlockAt, getBlockTypes } from "./world.js";

// Lightweight Minecraft-style water simulation. The important optimization is
// that water is simulated and meshed only when something actually changes.
const MAX_FLOW = 8;
const FLOW_INTERVAL = 150;
const MAX_CELLS_PER_STEP = 900;
const MAX_MESH_CELLS = 12000;
const water = new Map();
const active = new Set();
const naturalSources = new Set();
const BLOCK = getBlockTypes();
let gameScene = null;
let dynamicWaterMesh = null;
let dirty = true;
let sceneScanned = false;
let lastStep = performance.now();

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const key = (x, y, z) => `${x},${y},${z}`;
const parseKey = value => value.split(",").map(Number);

const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x438fbd,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    side: THREE.DoubleSide,
    shininess: 90,
    specular: 0x9ccfe0
});

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
            water.set(k, MAX_FLOW);
            active.add(k);
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

function rebuildMesh() {
    if (!gameScene) return;
    if (dynamicWaterMesh) {
        gameScene.remove(dynamicWaterMesh);
        dynamicWaterMesh.geometry.dispose();
        dynamicWaterMesh = null;
    }

    const positions = [];
    const normals = [];
    const indices = [];
    let vertex = 0;
    let cellCount = 0;

    for (const [k, level] of water) {
        if (level <= 0) continue;
        if (++cellCount > MAX_MESH_CELLS) break;
        const [x, y, z] = parseKey(k);
        const height = level >= MAX_FLOW ? 1 : Math.max(0.125, level / MAX_FLOW);
        const topY = y - 0.5 + height;
        const above = water.get(key(x, y + 1, z)) || 0;

        if (above <= 0) {
            positions.push(x-.5,topY,z-.5, x+.5,topY,z-.5, x+.5,topY,z+.5, x-.5,topY,z+.5);
            normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            indices.push(vertex, vertex+1, vertex+2, vertex, vertex+2, vertex+3);
            vertex += 4;
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = water.get(key(x + dx, y, z)) || 0;
            if (neighbor >= level) continue;
            const sideHeight = Math.max(0.125, neighbor / MAX_FLOW);
            const nh = y - 0.5 + sideHeight;
            let p, normal;
            if (dx === 1) {
                p=[[x+.5,y-.5,z-.5],[x+.5,nh,z-.5],[x+.5,nh,z+.5],[x+.5,y-.5,z+.5]]; normal=[1,0,0];
            } else if (dx === -1) {
                p=[[x-.5,y-.5,z+.5],[x-.5,nh,z+.5],[x-.5,nh,z-.5],[x-.5,y-.5,z-.5]]; normal=[-1,0,0];
            } else if (dz === 1) {
                p=[[x+.5,y-.5,z+.5],[x+.5,nh,z+.5],[x-.5,nh,z+.5],[x-.5,y-.5,z+.5]]; normal=[0,0,1];
            } else {
                p=[[x-.5,y-.5,z-.5],[x-.5,nh,z-.5],[x+.5,nh,z-.5],[x+.5,y-.5,z-.5]]; normal=[0,0,-1];
            }
            for (const v of p) positions.push(...v);
            normals.push(...normal,...normal,...normal,...normal);
            indices.push(vertex,vertex+1,vertex+2,vertex,vertex+2,vertex+3);
            vertex += 4;
        }
    }

    if (!positions.length) {
        dirty = false;
        return;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    dynamicWaterMesh = new THREE.Mesh(geometry, waterMaterial);
    dynamicWaterMesh.userData.isDynamicWater = true;
    gameScene.add(dynamicWaterMesh);
    dirty = false;
}

function spread(x, y, z, level) {
    if (level <= 1) return;
    const nextLevel = level - 1;
    for (const [dx, dz] of DIRS) {
        const nx=x+dx, nz=z+dz;
        const below=key(nx,y-1,nz);
        if (isOpen(nx,y-1,nz) && !water.has(below)) {
            water.set(below,MAX_FLOW);
            active.add(below);
            continue;
        }
        if (!isOpen(nx,y,nz)) continue;
        const nk=key(nx,y,nz);
        if ((water.get(nk)||0) < nextLevel) {
            water.set(nk,nextLevel);
            active.add(nk);
        }
    }
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
        const level=water.get(k)||0;
        if (level<=0) continue;
        const [x,y,z]=parseKey(k);
        const below=key(x,y-1,z);
        if (isOpen(x,y-1,z) && !water.has(below)) {
            water.set(below,MAX_FLOW);
            active.add(below);
        } else {
            spread(x,y,z,level);
        }
    }
    dirty = true;
}

export function setupWaterPhysics(scene) {
    gameScene=scene;
    scanSceneForWater();
    rebuildMesh();
}

export function updateWaterPhysics() {
    if (!gameScene) return;
    const now=performance.now();
    if (now-lastStep >= FLOW_INTERVAL && active.size) {
        lastStep=now;
        stepWater();
    }
    // Do not rebuild geometry every render frame. Only rebuild after a fluid step
    // or a block edit marked the water dirty.
    if (dirty) rebuildMesh();
}

export function notifyWaterBlockChanged(x,y,z) {
    active.add(key(x,y,z));
    active.add(key(x+1,y,z));
    active.add(key(x-1,y,z));
    active.add(key(x,y,z+1));
    active.add(key(x,y,z-1));
    active.add(key(x,y+1,z));
    active.add(key(x,y-1,z));
    dirty=true;
}

// The water module is imported for side effects by background.js.
const originalSceneAdd=THREE.Scene.prototype.add;
THREE.Scene.prototype.add=function(...objects){
    const result=originalSceneAdd.apply(this,objects);
    if(!gameScene) gameScene=this;
    return result;
};

// Low-frequency scheduler instead of another full animation loop.
// This prevents water from competing with the main render loop every frame.
function waterLoop(){
    updateWaterPhysics();
    setTimeout(waterLoop,100);
}
setTimeout(waterLoop,100);
