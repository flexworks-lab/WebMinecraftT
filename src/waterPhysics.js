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
    opacity: 0.58,
    depthWrite: false,
    side: THREE.DoubleSide,
    shininess: 110,
    specular: 0xbfeeff
});

function isOpen(x, y, z) {
    return y >= -32 && y <= 95 && getBlockAt(x, y, z) === BLOCK.AIR;
}

function registerExistingWaterMesh(mesh) {
    if (!mesh || mesh.userData?.isDynamicWater) return;
    mesh.visible = false;
    const position = mesh.geometry?.getAttribute("position");
    if (!position) return;

    // The old renderer creates one four-vertex quad per ocean column.
    for (let i = 0; i + 3 < position.count; i += 4) {
        const x = Math.round(position.getX(i) + 0.5);
        const z = Math.round(position.getZ(i) + 0.5);
        const y = Math.round(position.getY(i) - 0.42);
        const waterKey = key(x, y, z);
        naturalSources.add(waterKey);
        water.set(waterKey, { level: MAX_FLOW, falling: false, source: true });
    }
    dirty = true;
}

// Capture the world's existing water meshes without requiring changes to the
// main renderer. The world module tags them with userData.isWater before adding.
const originalSceneAdd = THREE.Scene.prototype.add;
if (!THREE.Scene.prototype.__webMinecraftWaterPatched) {
    THREE.Scene.prototype.__webMinecraftWaterPatched = true;
    THREE.Scene.prototype.add = function (...objects) {
        const result = originalSceneAdd.apply(this, objects);
        for (const object of objects) {
            if (object?.userData?.isWater === true && !object.userData.isDynamicWater) {
                gameScene = this;
                registerExistingWaterMesh(object);
                ensureDynamicMesh();
            }
        }
        return result;
    };
}

function ensureDynamicMesh() {
    if (!gameScene || dynamicWaterMesh) return;
    dynamicWaterMesh = new THREE.Mesh(new THREE.BufferGeometry(), waterMaterial);
    dynamicWaterMesh.userData.isDynamicWater = true;
    dynamicWaterMesh.userData.isWater = true;
    dynamicWaterMesh.renderOrder = 4;
    gameScene.add(dynamicWaterMesh);
}

function addQuad(positions, normals, indices, vertices, a, b, c, d) {
    positions.push(...a, ...b, ...c, ...d);
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    indices.push(vertices, vertices + 1, vertices + 2, vertices, vertices + 2, vertices + 3);
    return vertices + 4;
}

function rebuildWaterMesh() {
    if (!gameScene) return;
    ensureDynamicMesh();
    if (!dynamicWaterMesh) return;

    const positions = [];
    const normals = [];
    const indices = [];
    let vertices = 0;

    for (const [waterKey, state] of water) {
        const [x, y, z] = parseKey(waterKey);
        if (!Number.isFinite(x + y + z) || !isOpen(x, y, z)) continue;

        const level = state.falling ? MAX_FLOW : Math.max(1, Math.min(MAX_FLOW, state.level));
        const height = level >= MAX_FLOW ? 1 : level / MAX_FLOW;
        const top = y - 0.5 + height;
        const x0 = x - 0.5, x1 = x + 0.5;
        const z0 = z - 0.5, z1 = z + 0.5;

        const wave = Math.sin((x + z + performance.now() * 0.0008) * 0.18) * 0.018;
        vertices = addQuad(
            positions, normals, indices, vertices,
            [x0, top + wave, z0], [x0, top + wave, z1],
            [x1, top - wave, z1], [x1, top - wave, z0]
        );

        // Draw vertical faces where water is higher than the neighboring water.
        for (const [dx, dz] of DIRS) {
            const neighbor = water.get(key(x + dx, y, z + dz));
            const neighborLevel = neighbor ? (neighbor.falling ? MAX_FLOW : neighbor.level) : 0;
            if (neighborLevel >= level) continue;

            const neighborHeight = neighborLevel ? neighborLevel / MAX_FLOW : 0;
            const neighborTop = y - 0.5 + neighborHeight;
            const bottom = y - 0.5;
            let a, b, c, d;
            if (dx === 1) {
                a = [x1, bottom, z0]; b = [x1, bottom, z1]; c = [x1, top, z1]; d = [x1, top, z0];
            } else if (dx === -1) {
                a = [x0, bottom, z1]; b = [x0, bottom, z0]; c = [x0, top, z0]; d = [x0, top, z1];
            } else if (dz === 1) {
                a = [x1, bottom, z1]; b = [x0, bottom, z1]; c = [x0, top, z1]; d = [x1, top, z1];
            } else {
                a = [x0, bottom, z0]; b = [x1, bottom, z0]; c = [x1, top, z0]; d = [x0, top, z0];
            }
            // The lower edge follows the neighbor's water height for sloped flow.
            if (neighborLevel > 0) {
                if (dx === 1 || dx === -1) {
                    a[1] = b[1] = neighborTop;
                } else {
                    a[1] = b[1] = neighborTop;
                }
            }
            vertices = addQuad(positions, normals, indices, vertices, a, b, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();
    if (vertices) {
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();
    }
    const oldGeometry = dynamicWaterMesh.geometry;
    dynamicWaterMesh.geometry = geometry;
    oldGeometry.dispose();
    dirty = false;
}

function removeWaterAt(x, y, z) {
    const k = key(x, y, z);
    if (!water.has(k)) return false;
    if (naturalSources.has(k)) naturalSources.delete(k);
    water.delete(k);
    for (const [dx, dz] of DIRS) active.add(key(x + dx, y, z + dz));
    active.add(k);
    dirty = true;
    return true;
}

function wakeAround(x, y, z) {
    active.add(key(x, y, z));
    for (const [dx, dz] of DIRS) {
        active.add(key(x + dx, y, z + dz));
        active.add(key(x + dx, y + 1, z + dz));
        active.add(key(x + dx, y - 1, z + dz));
    }
    active.add(key(x, y + 1, z));
    active.add(key(x, y - 1, z));
}

function sourceConversion(x, y, z) {
    if (!isOpen(x, y, z)) return false;
    let count = 0;
    for (const [dx, dz] of DIRS) {
        const neighbor = water.get(key(x + dx, y, z + dz));
        if (neighbor?.source && !neighbor.falling) count++;
    }
    return count >= 2 && getBlockAt(x, y - 1, z) !== BLOCK.AIR;
}

function simulateWater() {
    if (!active.size) return;
    const nextActive = new Set();

    for (const activeKey of active) {
        const [x, y, z] = parseKey(activeKey);
        if (!Number.isFinite(x + y + z)) continue;

        const current = water.get(activeKey);
        if (current && !isOpen(x, y, z)) {
            removeWaterAt(x, y, z);
            continue;
        }

        if (sourceConversion(x, y, z)) {
            water.set(activeKey, { level: MAX_FLOW, falling: false, source: true });
            naturalSources.add(activeKey);
            dirty = true;
        }

        const state = water.get(activeKey);
        if (!state) continue;

        const belowKey = key(x, y - 1, z);
        if (isOpen(x, y - 1, z)) {
            const below = water.get(belowKey);
            if (!below || !below.falling || below.level < MAX_FLOW) {
                water.set(belowKey, { level: MAX_FLOW, falling: true, source: false });
                dirty = true;
            }
            nextActive.add(belowKey);
            continue;
        }

        if (state.source || state.level > 1) {
            const nextLevel = state.source ? 7 : state.level - 1;
            for (const [dx, dz] of DIRS) {
                const nx = x + dx, nz = z + dz;
                if (!isOpen(nx, y, nz)) continue;
                const nk = key(nx, y, nz);
                const existing = water.get(nk);
                if (!existing || existing.level < nextLevel || existing.falling) {
                    water.set(nk, { level: nextLevel, falling: false, source: false });
                    dirty = true;
                }
                nextActive.add(nk);
            }
        }

        // Flowing water that no longer has a source path disappears.
        if (!state.source) {
            let supported = false;
            for (const [dx, dz] of DIRS) {
                const neighbor = water.get(key(x + dx, y, z + dz));
                if (neighbor && (neighbor.source || neighbor.level > state.level)) {
                    supported = true;
                    break;
                }
            }
            if (!supported && !water.has(belowKey)) {
                water.delete(activeKey);
                dirty = true;
            }
        }
    }

    active.clear();
    for (const value of nextActive) active.add(value);
}

window.addEventListener("webminecraft:blockchange", event => {
    const detail = event.detail || {};
    const x = Math.floor(detail.x), y = Math.floor(detail.y), z = Math.floor(detail.z);
    if (![x, y, z].every(Number.isFinite)) return;

    if (detail.type !== BLOCK.AIR) removeWaterAt(x, y, z);
    wakeAround(x, y, z);
    dirty = true;
});

function tick() {
    const now = performance.now();
    if (now - lastStep >= FLOW_INTERVAL) {
        lastStep = now;
        simulateWater();
        if (dirty) rebuildWaterMesh();
    }
    requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
