import * as THREE from "three";

const SWORD_FILES = {
    186: "Wooden_Sword_JE2_BE2.png",
    187: "Stone_Sword_JE2_BE2.png",
    188: "Iron_Sword_JE2_BE2.png",
    189: "Golden_Sword_JE3_BE2.png",
    190: "Diamond_Sword_JE3_BE3.png"
};

const swordTextureRecords = new Map();
const PIXEL_SIZE = 0.048;
// The weapon's handle is near the lower-left corner of the 16px item sprite.
// This pivot lets the hand sit around the grip rather than behind the blade.
const GRIP_X = 3.5;
const GRIP_Y = 12.5;

function createFallbackPixels(itemId) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    const palette = {
        186: ["#9b6a3d", "#704529", "#d3aa70"],
        187: ["#8b9499", "#5d666d", "#c2c9cc"],
        188: ["#c5cbd0", "#7f8991", "#f1f4f5"],
        189: ["#f2c84c", "#b98424", "#fff0a1"],
        190: ["#42d5cf", "#168c98", "#a6fff0"]
    }[itemId] || ["#b8c4d0", "#657181", "#ffffff"];
    const [blade, dark, bright] = palette;
    for (let i = 0; i < 9; i++) {
        const x = 6 + i, y = 8 - i;
        context.fillStyle = blade;
        context.fillRect(x, y, 2, 2);
        context.fillStyle = bright;
        context.fillRect(x, y, 1, 1);
    }
    context.fillStyle = dark;
    context.fillRect(4, 11, 4, 2);
    context.fillRect(2, 12, 2, 3);
    context.fillStyle = bright;
    context.fillRect(7, 9, 2, 1);
    context.fillRect(1, 14, 2, 1);
    return canvas;
}

function loadSwordTexture(itemId) {
    let record = swordTextureRecords.get(itemId);
    if (record) return record;

    record = { texture: null, ready: false, waiters: [] };
    swordTextureRecords.set(itemId, record);
    const file = SWORD_FILES[itemId];
    const baseUrl = import.meta.env?.BASE_URL || "/";
    const url = baseUrl + "tools/" + file;
    record.texture = new THREE.TextureLoader().load(
        url,
        texture => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.generateMipmaps = false;
            record.ready = true;
            const waiters = record.waiters.splice(0);
            for (const waiter of waiters) waiter(texture);
        },
        undefined,
        error => {
            console.warn("Could not load sword texture:", file, error);
            record.ready = true;
            const waiters = record.waiters.splice(0);
            for (const waiter of waiters) waiter(null);
        }
    );
    record.texture.magFilter = THREE.NearestFilter;
    record.texture.minFilter = THREE.NearestFilter;
    record.texture.colorSpace = THREE.SRGBColorSpace;
    record.texture.generateMipmaps = false;
    return record;
}

function buildVoxelMesh(group, canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, 16, 16).data;
    const count = Array.from({ length: 256 }, (_, index) => index)
        .filter(index => pixels[index * 4 + 3] > 24).length;
    if (!count) return;

    const geometry = new THREE.BoxGeometry(PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE * 1.65);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.name = "voxelSwordPixels";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.renderOrder = 4;
    const position = new THREE.Object3D();
    const color = new THREE.Color();
    let instance = 0;

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const offset = (y * 16 + x) * 4;
            const alpha = pixels[offset + 3] / 255;
            if (alpha <= 24 / 255) continue;

            position.position.set(
                (x - GRIP_X) * PIXEL_SIZE,
                (GRIP_Y - y) * PIXEL_SIZE,
                0
            );
            position.updateMatrix();
            mesh.setMatrixAt(instance, position.matrix);
            color.setRGB(
                pixels[offset] / 255,
                pixels[offset + 1] / 255,
                pixels[offset + 2] / 255,
                THREE.SRGBColorSpace
            );
            color.multiplyScalar(0.82 + alpha * 0.18);
            mesh.setColorAt(instance, color);
            instance++;
        }
    }

    mesh.count = instance;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
}

export function createVoxelSword(itemId) {
    const id = Math.floor(Number(itemId));
    if (!SWORD_FILES[id]) return new THREE.Group();

    const group = new THREE.Group();
    group.name = "voxelSword";
    group.userData.itemId = id;
    let disposed = false;
    let currentMesh = null;

    const replaceMesh = canvas => {
        if (disposed) return;
        if (currentMesh) {
            group.remove(currentMesh);
            currentMesh.geometry.dispose();
            currentMesh.material.dispose();
            currentMesh = null;
        }
        buildVoxelMesh(group, canvas);
        currentMesh = group.children[group.children.length - 1] || null;
    };

    replaceMesh(createFallbackPixels(id));
    const record = loadSwordTexture(id);
    if (record.ready) {
        if (record.texture?.image) {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 16;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            context.imageSmoothingEnabled = false;
            context.drawImage(record.texture.image, 0, 0, 16, 16);
            replaceMesh(canvas);
        }
    } else {
        record.waiters.push(texture => {
            if (!texture?.image || disposed) return;
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 16;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            context.imageSmoothingEnabled = false;
            context.drawImage(texture.image, 0, 0, 16, 16);
            replaceMesh(canvas);
        });
    }

    group.userData.disposeVoxelSword = () => {
        disposed = true;
        for (const child of [...group.children]) {
            group.remove(child);
            child.geometry?.dispose?.();
            if (Array.isArray(child.material)) child.material.forEach(material => material?.dispose?.());
            else child.material?.dispose?.();
        }
    };
    return group;
}

export function isSwordItem(itemId) {
    const id = Math.floor(Number(itemId) || 0);
    return id >= 186 && id <= 190;
}
