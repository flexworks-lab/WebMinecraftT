import * as THREE from "three";

export const CHARACTER_TEXTURE_KEY = "webminecraft-character-texture-v1";
const SKIN_SIZE = 64;

// Vanilla 64x64 Minecraft skin atlas. Coordinates are in top-left pixel space.
const SKIN_FACES = {
  head: {
    right: [0, 8, 8, 8], left: [16, 8, 8, 8],
    top: [8, 0, 8, 8], bottom: [16, 0, 8, 8],
    front: [8, 8, 8, 8], back: [24, 8, 8, 8]
  },
  torso: {
    right: [16, 20, 4, 12], left: [28, 20, 4, 12],
    top: [20, 16, 8, 4], bottom: [28, 16, 8, 4],
    front: [20, 20, 8, 12], back: [32, 20, 8, 12]
  },
  rightArm: {
    right: [40, 20, 4, 12], left: [48, 20, 4, 12],
    top: [44, 16, 4, 4], bottom: [48, 16, 4, 4],
    front: [44, 20, 4, 12], back: [52, 20, 4, 12]
  },
  leftArm: {
    right: [32, 52, 4, 12], left: [40, 52, 4, 12],
    top: [36, 48, 4, 4], bottom: [40, 48, 4, 4],
    front: [36, 52, 4, 12], back: [44, 52, 4, 12]
  },
  rightLeg: {
    right: [0, 20, 4, 12], left: [8, 20, 4, 12],
    top: [4, 16, 4, 4], bottom: [8, 16, 4, 4],
    front: [4, 20, 4, 12], back: [12, 20, 4, 12]
  },
  leftLeg: {
    right: [16, 52, 4, 12], left: [24, 52, 4, 12],
    top: [20, 48, 4, 4], bottom: [24, 48, 4, 4],
    front: [20, 52, 4, 12], back: [28, 52, 4, 12]
  }
};

// Create a useful default skin while leaving the complete 64x64 atlas paintable.
function drawDefaultSkin(ctx) {
  ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
  ctx.fillStyle = "#b9b9b9";
  ctx.fillRect(0, 0, SKIN_SIZE, SKIN_SIZE);

  // Head base and hair/eyes, on the correct front-face atlas region.
  ctx.fillStyle = "#c98d62";
  ctx.fillRect(8, 8, 8, 8);
  ctx.fillStyle = "#39291f";
  ctx.fillRect(8, 8, 8, 2);
  ctx.fillRect(8, 8, 2, 8);
  ctx.fillStyle = "#263f68";
  ctx.fillRect(10, 11, 1, 1);
  ctx.fillRect(13, 11, 1, 1);

  // Shirt front/back and side faces.
  ctx.fillStyle = "#3974bd";
  ctx.fillRect(20, 20, 8, 12);
  ctx.fillRect(32, 20, 8, 12);
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(20, 16, 8, 4);
  ctx.fillRect(28, 16, 8, 4);

  // Arms and legs: fill every face of the classic right-side limbs.
  ctx.fillStyle = "#c98d62";
  for (const [x, y, w, h] of [[40,20,4,12],[48,20,4,12],[44,16,4,4],[48,16,4,4],[44,20,4,12],[52,20,4,12]]) ctx.fillRect(x,y,w,h);
  ctx.fillStyle = "#303947";
  for (const [x, y, w, h] of [[0,20,4,12],[8,20,4,12],[4,16,4,4],[8,16,4,4],[4,20,4,12],[12,20,4,12]]) ctx.fillRect(x,y,w,h);
}

export function createCharacterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = SKIN_SIZE;
  canvas.height = SKIN_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  drawDefaultSkin(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData = { canvas };

  try {
    const saved = localStorage.getItem(CHARACTER_TEXTURE_KEY);
    if (saved) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
        ctx.drawImage(image, 0, 0, SKIN_SIZE, SKIN_SIZE);
        texture.needsUpdate = true;
        window.dispatchEvent(new CustomEvent("webminecraft-character-texture-loaded"));
      };
      image.onerror = () => {};
      image.src = saved;
    }
  } catch {}

  return texture;
}

function faceMaterial(texture, rect) {
  const map = texture.clone();
  map.image = texture.image;
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  const [x, y, w, h] = rect;
  map.repeat.set(w / SKIN_SIZE, h / SKIN_SIZE);
  map.offset.set(x / SKIN_SIZE, 1 - (y + h) / SKIN_SIZE);
  map.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    map,
    roughness: 1,
    metalness: 0,
    flatShading: true
  });
}

function createSkinMaterials(texture, faceRects) {
  // BoxGeometry groups: +X, -X, +Y, -Y, +Z, -Z.
  return [
    faceMaterial(texture, faceRects.right),
    faceMaterial(texture, faceRects.left),
    faceMaterial(texture, faceRects.top),
    faceMaterial(texture, faceRects.bottom),
    faceMaterial(texture, faceRects.front),
    faceMaterial(texture, faceRects.back)
  ];
}

export function createCharacterModel(texture = createCharacterTexture()) {
  const root = new THREE.Group();
  root.name = "webminecraft-character";
  root.userData.skinAtlas = "minecraft-64x64";

  function box(name, size, position, faceRects) {
    const geometry = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(geometry, createSkinMaterials(texture, faceRects));
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.skinPart = name;
    root.add(mesh);
    return mesh;
  }

  // Keep the same 1.8-block silhouette used by WebMinecraft's player physics.
  // Both the editor preview and remote-player avatars call this exact factory.
  box("torso", [0.52, 0.58, 0.28], [0, 1.18, 0], SKIN_FACES.torso);
  box("head", [0.5, 0.5, 0.5], [0, 1.73, 0], SKIN_FACES.head);
  box("left-arm", [0.24, 0.58, 0.27], [-0.39, 1.18, 0], SKIN_FACES.leftArm);
  box("right-arm", [0.24, 0.58, 0.27], [0.39, 1.18, 0], SKIN_FACES.rightArm);
  box("left-leg", [0.25, 0.64, 0.28], [-0.14, 0.51, 0], SKIN_FACES.leftLeg);
  box("right-leg", [0.25, 0.64, 0.28], [0.14, 0.51, 0], SKIN_FACES.rightLeg);

  return root;
}
