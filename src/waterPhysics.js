import * as THREE from "three";
import { getBlockAt, getBlockTypes } from "./world.js";

// Minecraft-style water: sources are full blocks, flat flow drops one level per
// block and stops after seven horizontal blocks. If the block below is open,
// water falls first instead of spreading sideways.
const MAX_FLOW = 8;
const FLOW_INTERVAL = 125;
const water = new Map();
const active = new Set();
const naturalSources = new Set();
const BLOCK = getBlockTypes();
let gameScene = null;
let dynamicWaterMesh = null;
let dirty = true;
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
    shininess: 110,
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
        naturalSources.add(k);
        water.set(k, MAX_FLOW);
        active.add(k);
    }
}

function scanSceneForWater() {
    if (!gameScene) return;
    gameScene.traverse(object => {
        if (!object.isMesh || object.userData?.isDynamicWater) return;
        if (object.userData?.isWater || object.name?.toLowerCase().includes("water")) registerExistingWaterMesh(object);
    });
}

function rebuildMesh() {
    if (!gameScene) return;
    if (dynamicWaterMesh) {
        gameScene.remove(dynamicWaterMesh);
        dynamicWaterMesh.geometry.dispose();
    }

    const positions = [];
    const normals = [];
    const indices = [];
    let vertex = 0;

    for (const [k, level] of water) {
        if (level <= 0) continue;
        const [x, y, z] = parseKey(k);
        const height = level >= MAX_FLOW ? 1 : Math.max(0.125, level / MAX_FLOW);
        const topY = y - 0.5 + height;

        const above = water.get(key(x, y + 1, z)) || 0;
        if (above <= 0) {
            const p = [
                [x - .5, topY, z - .5], [x + .5, topY, z - .5],
                [x + .5, topY, z + .5], [x - .5, topY, z + .5]
            ];
            p.forEach(v => positions.push(...v));
            normals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
            indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
            vertex += 4;
        }

        for (const [dx, dz] of DIRS) {
            const neighbor = water.get(key(x + dx, y, z)) || 0;
            if (neighbor >= level) continue;
            const sideHeight = Math.max(0.125, neighbor / MAX_FLOW);
            const nh = y - 0.5 + sideHeight;
            let p;
            let normal;
            if (dx === 1) {
                p = [[x+.5, y-.5, z-.5], [x+.5, nh, z-.5], [x+.5, nh, z+.5], [x+.5, y-.5, z+.5]];
                normal = [1,0,0];
            } else if (dx === -1) {
                p = [[x-.5, y-.5, z+.5], [x-.5, nh, z+.5], [x-.5, nh, z-.5], [x-.5, y-.5, z-.5]];
                normal = [-1,0,0];
            } else if (dz === 1) {
                p = [[x+.5, y-.5, z+.5], [x+.5, nh, z+.5], [x-.5, nh, z+.5], [x-.5, y-.5, z+.5]];
                normal = [0,0,1];
            } else {
                p = [[x-.5, y-.5, z-.5], [x-.5, nh, z-.5], [x+.5, nh, z-.5], [x+.5, y-.5, z-.5]];
                normal = [0,0,-1];
            }
            p.forEach(v => positions.push(...v));
            normals.push(...normal, ...normal, ...normal, ...normal);
            indices.push(vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3);
            vertex += 4;
        }
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
    for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;
        if (isOpen(nx, y - 1, nz) && !water.has(key(nx, y - 1, nz))) {
            water.set(key(nx, y - 1, nz), MAX_FLOW);
            active.add(key(nx, y - 1, nz));
            continue;
        }
        if (!isOpen(nx, y, nz)) continue;
        const nk = key(nx, y, nz);
        const nextLevel = level - 1;
        if ((water.get(nk) || 0) < nextLevel) {
            water.set(nk, nextLevel);
            active.add(nk);
        }
    }
}

function stepWater() {
    scanSceneForWater();
    const current = [...active];
    active.clear();
    for (const k of current) {
        const level = water.get(k) || 0;
        if (level <= 0) continue;
        const [x, y, z] = parseKey(k);
        if (isOpen(x, y - 1, z) && !water.has(key(x, y - 1, z))) {
            const down = key(x, y - 1, z);
            water.set(down, MAX_FLOW);
            active.add(down);
        } else {
            spread(x, y, z, level);
        }
    }
    dirty = true;
}

export function setupWaterPhysics(scene) {
    gameScene = scene;
    scanSceneForWater();
    rebuildMesh();
}

export function updateWaterPhysics() {
    if (!gameScene) return;
    const now = performance.now();
    if (now - lastStep >= FLOW_INTERVAL) {
        lastStep = now;
        stepWater();
    }
    if (dirty) rebuildMesh();
}

export function notifyWaterBlockChanged(x, y, z) {
    const k = key(x, y, z);
    active.add(k);
    active.add(key(x + 1, y, z));
    active.add(key(x - 1, y, z));
    active.add(key(x, y, z + 1));
    active.add(key(x, y, z - 1));
    active.add(key(x, y + 1, z));
    active.add(key(x, y - 1, z));
    dirty = true;
}
