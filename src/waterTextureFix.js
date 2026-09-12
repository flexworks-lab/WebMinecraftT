import * as THREE from "three";
import { waterTexture } from "./blocks.js";

const BLUE_WATER = 0x3c8fc0;
const UV_SCALE = 0.22;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.needsUpdate = true;

function applyWaterMaterial(material) {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
        if (!mat) continue;
        mat.map = waterTexture;
        mat.color?.set(BLUE_WATER);
        mat.transparent = true;
        mat.opacity = Math.max(0.76, Number(mat.opacity) || 0);
        mat.depthWrite = false;
        mat.side = THREE.DoubleSide;
        mat.needsUpdate = true;
    }
}

function applyContinuousWaterUvs(mesh) {
    const geometry = mesh?.geometry;
    const position = geometry?.getAttribute("position");
    if (!geometry || !position) return;

    const normal = geometry.getAttribute("normal");
    const uvs = new Float32Array(position.count * 2);
    const offset = mesh.position || new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i) + offset.x;
        const y = position.getY(i) + offset.y;
        const z = position.getZ(i) + offset.z;

        let u;
        let v;
        const nx = normal ? normal.getX(i) : 0;
        const ny = normal ? normal.getY(i) : 1;
        const nz = normal ? normal.getZ(i) : 0;

        if (Math.abs(ny) >= Math.abs(nx) && Math.abs(ny) >= Math.abs(nz)) {
            u = x * UV_SCALE;
            v = z * UV_SCALE;
        } else if (Math.abs(nx) >= Math.abs(nz)) {
            u = z * UV_SCALE;
            v = y * UV_SCALE;
        } else {
            u = x * UV_SCALE;
            v = y * UV_SCALE;
        }

        uvs[i * 2] = u;
        uvs[i * 2 + 1] = v;
    }

    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.attributes.uv.needsUpdate = true;
}

function applyWaterTexture(object) {
    if (!object) return;
    const isWater = object.userData?.isWater === true || object.userData?.isDynamicWater === true;
    if (!isWater) return;

    object.traverse(child => {
        if (!child.isMesh) return;
        applyWaterMaterial(child.material);
        applyContinuousWaterUvs(child);
    });
}

const originalSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
    const result = originalSceneAdd.apply(this, objects);
    for (const object of objects) applyWaterTexture(object);
    return result;
};
