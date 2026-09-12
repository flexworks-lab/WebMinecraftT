import * as THREE from "three";
import { waterTexture } from "./blocks.js";

const BLUE_WATER = 0x3c8fc0;
const WATER_TOP_Y = 16.42;
const WATER_ANIMATION_FPS = 10;
const UV_WORLD_SCALE = 0.22;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.matrixAutoUpdate = true;
waterTexture.needsUpdate = true;

let waterFrameCount = 1;
let waterStripAxis = "x";
let animationStarted = false;
let waterTextureSanitized = false;

function sanitizeWaterTexture() {
    if (waterTextureSanitized) return true;

    const image = waterTexture.image;
    const width = Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
    const height = Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
    if (!width || !height) return false;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;

    try {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, width, height);
        const pixels = ctx.getImageData(0, 0, width, height);

        for (let i = 0; i < pixels.data.length; i += 4) {
            const r = pixels.data[i];
            const g = pixels.data[i + 1];
            const b = pixels.data[i + 2];
            const a = pixels.data[i + 3];

            // Remove only near-black pixels from the water sheet. These can
            // otherwise appear as black translucent blocks on the flowing water.
            if (a > 0 && r < 18 && g < 18 && b < 18) pixels.data[i + 3] = 0;
        }

        ctx.putImageData(pixels, 0, 0);
        waterTexture.image = canvas;
        waterTexture.needsUpdate = true;
        waterTextureSanitized = true;
        return true;
    } catch (error) {
        console.warn("[WebMinecraftT] Could not sanitize water texture", error);
        return false;
    }
}

function setupWaterAnimation() {
    if (!sanitizeWaterTexture()) return false;

    const image = waterTexture.image;
    const width = Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
    const height = Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
    if (!width || !height) return false;

    if (width >= height * 2) {
        waterStripAxis = "x";
        waterFrameCount = Math.max(1, Math.round(width / height));
    } else if (height >= width * 2) {
        waterStripAxis = "y";
        waterFrameCount = Math.max(1, Math.round(height / width));
    } else {
        waterStripAxis = "x";
        waterFrameCount = 1;
    }

    waterTexture.repeat.set(
        waterStripAxis === "x" ? 1 / waterFrameCount : 1,
        waterStripAxis === "y" ? 1 / waterFrameCount : 1
    );
    waterTexture.offset.set(0, 0);
    waterTexture.needsUpdate = true;
    return true;
}

function startWaterAnimation() {
    if (animationStarted) return;
    animationStarted = true;

    let lastFrame = -1;
    const animate = (time) => {
        if (waterFrameCount > 1) {
            const frame = Math.floor(time / (1000 / WATER_ANIMATION_FPS)) % waterFrameCount;
            if (frame !== lastFrame) {
                lastFrame = frame;
                const progress = frame / waterFrameCount;
                if (waterStripAxis === "x") {
                    waterTexture.offset.x = progress;
                    waterTexture.offset.y = 0;
                } else {
                    waterTexture.offset.x = 0;
                    waterTexture.offset.y = progress;
                }
                waterTexture.needsUpdate = true;
            }
        }
        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
}

const prepareWaterTexture = () => {
    if (setupWaterAnimation()) {
        startWaterAnimation();
        return true;
    }
    return false;
};

if (!prepareWaterTexture()) {
    const originalOnLoad = waterTexture.onUpdate;
    waterTexture.onUpdate = (...args) => {
        originalOnLoad?.(...args);
        prepareWaterTexture();
    };

    const retry = () => {
        if (!prepareWaterTexture()) window.setTimeout(retry, 100);
    };
    window.setTimeout(retry, 100);
}

function applyWaterMaterial(material) {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
        if (!mat) continue;
        mat.map = waterTexture;
        mat.color?.set(BLUE_WATER);
        mat.transparent = true;
        mat.opacity = Math.max(0.76, Number(mat.opacity) || 0);
        mat.alphaTest = 0.02;
        mat.depthTest = true;
        mat.depthWrite = false;
        mat.side = THREE.DoubleSide;
        mat.needsUpdate = true;
    }
}

function alignStaticWaterTop(mesh) {
    const geometry = mesh?.geometry;
    const position = geometry?.getAttribute("position");
    const normal = geometry?.getAttribute("normal");
    if (!geometry || !position) return;

    for (let i = 0; i < position.count; i++) {
        if (!normal || normal.getY(i) > 0.5) {
            position.setY(i, WATER_TOP_Y - (mesh.position?.y || 0));
        }
    }
    position.needsUpdate = true;
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
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
            u = x * UV_WORLD_SCALE;
            v = z * UV_WORLD_SCALE;
        } else if (Math.abs(nx) >= Math.abs(nz)) {
            u = z * UV_WORLD_SCALE;
            v = y * UV_WORLD_SCALE;
        } else {
            u = x * UV_WORLD_SCALE;
            v = y * UV_WORLD_SCALE;
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
        alignStaticWaterTop(child);
        applyContinuousWaterUvs(child);
    });
}

const originalSceneAdd = THREE.Scene.prototype.add;
THREE.Scene.prototype.add = function (...objects) {
    const result = originalSceneAdd.apply(this, objects);
    for (const object of objects) applyWaterTexture(object);
    return result;
};
