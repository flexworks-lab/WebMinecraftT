import * as THREE from "three";

export const CHARACTER_TEXTURE_KEY = "webminecraft-character-texture-v1";
export const CHARACTER_TEXTURE_SIZE = 64;
const SIZE = CHARACTER_TEXTURE_SIZE;
const TEXTURE_LOADED_EVENT = "webminecraft-character-texture-loaded";

// Classic 64×64 Minecraft skin layout, coordinates measured from the top-left.
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

function paintRects(ctx, color, rects) {
  ctx.fillStyle = color;
  for (const [x, y, w, h] of rects) ctx.fillRect(x, y, w, h);
}

// A complete classic skin atlas. Empty overlay regions stay transparent so
// saved/imported skins can use the vanilla outer-layer areas without gray fill.
function drawDefaultSkin(ctx) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  // Head base (all six faces).
  paintRects(ctx, "#c98d62", [
    [0, 8, 8, 8], [16, 8, 8, 8], [8, 0, 8, 8], [16, 0, 8, 8],
    [8, 8, 8, 8], [24, 8, 8, 8]
  ]);
  // Hair is painted on the head's front/top and sides, not outside its UVs.
  paintRects(ctx, "#39291f", [[8, 8, 8, 2], [8, 8, 2, 8], [16, 8, 2, 8], [8, 0, 8, 2]]);
  paintRects(ctx, "#263f68", [[10, 11, 1, 1], [13, 11, 1, 1]]);

  // Shirt: front, back, both sides, top and bottom.
  paintRects(ctx, "#3974bd", [
    [16, 20, 4, 12], [28, 20, 4, 12], [20, 16, 8, 4],
    [28, 16, 8, 4], [20, 20, 8, 12], [32, 20, 8, 12]
  ]);
  // Both arms, including every side face in the classic atlas.
  paintRects(ctx, "#c98d62", [
    [40, 20, 4, 12], [48, 20, 4, 12], [44, 16, 4, 4],
    [48, 16, 4, 4], [44, 20, 4, 12], [52, 20, 4, 12],
    [32, 52, 4, 12], [40, 52, 4, 12], [36, 48, 4, 4],
    [40, 48, 4, 4], [36, 52, 4, 12], [44, 52, 4, 12]
  ]);
  // Both legs, including top/bottom and all four side faces.
  paintRects(ctx, "#303947", [
    [0, 20, 4, 12], [8, 20, 4, 12], [4, 16, 4, 4],
    [8, 16, 4, 4], [4, 20, 4, 12], [12, 20, 4, 12],
    [16, 52, 4, 12], [24, 52, 4, 12], [20, 48, 4, 4],
    [24, 48, 4, 4], [20, 52, 4, 12], [28, 52, 4, 12]
  ]);
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: true });
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

function isSkinImage(image) {
  return image && Number.isFinite(image.width) && Number.isFinite(image.height) &&
    image.width > 0 && image.height > 0;
}

function loadSavedSkin(canvas, ctx, texture) {
  try {
    const saved = localStorage.getItem(CHARACTER_TEXTURE_KEY);
    if (!saved) return;
    const image = new Image();
    image.onload = () => {
      if (!isSkinImage(image)) return;
      // Accept older 64×32 classic skins and normalize them to a 64×64 atlas.
      // The legacy top half is kept in place; the unused lower half stays
      // transparent rather than stretching the old texture over the model.
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(image, 0, 0, Math.min(SIZE, image.width), Math.min(SIZE, image.height));
      texture.needsUpdate = true;
      window.dispatchEvent(new CustomEvent(TEXTURE_LOADED_EVENT));
    };
    image.onerror = () => {};
    image.src = saved;
  } catch {}
}

export function resetCharacterTexture(texture) {
  const canvas = texture?.userData?.canvas;
  const ctx = canvas?.getContext("2d", { willReadFrequently: true, alpha: true });
  if (!canvas || !ctx) return false;
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawDefaultSkin(ctx);
  texture.needsUpdate = true;
  return true;
}

export function createCharacterTexture() {
  const { canvas, ctx } = makeCanvas();
  drawDefaultSkin(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 1;
  texture.userData = { canvas, isCharacterSkinAtlas: true, size: SIZE };
  loadSavedSkin(canvas, ctx, texture);
  return texture;
}

function faceMaterial(texture, rect) {
  // Each cuboid face samples only its own vanilla atlas rectangle. Cloned
  // Texture objects keep face UV transforms independent while sharing pixels.
  const map = texture.clone();
  map.image = texture.image;
  map.colorSpace = THREE.SRGBColorSpace;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  const [x, y, w, h] = rect;
  map.repeat.set(w / SIZE, h / SIZE);
  map.offset.set(x / SIZE, 1 - (y + h) / SIZE);
  map.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    alphaTest: 0.01,
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

// The character silhouette and proportions intentionally remain unchanged;
// the texture atlas/material pipeline is the part being replaced.
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

  box("torso", [0.52, 0.58, 0.28], [0, 1.18, 0], SKIN_FACES.torso);
  box("head", [0.5, 0.5, 0.5], [0, 1.73, 0], SKIN_FACES.head);
  box("left-arm", [0.24, 0.58, 0.27], [-0.39, 1.18, 0], SKIN_FACES.leftArm);
  box("right-arm", [0.24, 0.58, 0.27], [0.39, 1.18, 0], SKIN_FACES.rightArm);
  box("left-leg", [0.25, 0.64, 0.28], [-0.14, 0.51, 0], SKIN_FACES.leftLeg);
  box("right-leg", [0.25, 0.64, 0.28], [0.14, 0.51, 0], SKIN_FACES.rightLeg);

  return root;
}
