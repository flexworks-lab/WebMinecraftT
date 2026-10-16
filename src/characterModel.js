import * as THREE from "three";

export const CHARACTER_TEXTURE_KEY = "webminecraft-character-texture-v1";

export function createCharacterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#b9b9b9";
  ctx.fillRect(0, 0, 64, 64);
  // Simple Minecraft-style skin atlas regions: head, torso, arms and legs.
  ctx.fillStyle = "#c98d62"; ctx.fillRect(8, 8, 8, 8);
  ctx.fillStyle = "#3974bd"; ctx.fillRect(20, 20, 8, 12);
  ctx.fillStyle = "#c98d62"; ctx.fillRect(44, 20, 4, 12); ctx.fillRect(36, 52, 4, 12);
  ctx.fillStyle = "#303947"; ctx.fillRect(4, 20, 4, 12); ctx.fillRect(20, 52, 4, 12);
  ctx.fillStyle = "#39291f"; ctx.fillRect(8, 8, 8, 2); ctx.fillRect(8, 8, 2, 8);
  ctx.fillStyle = "#263f68"; ctx.fillRect(10, 11, 1, 1); ctx.fillRect(13, 11, 1, 1);
  try {
    const saved = localStorage.getItem(CHARACTER_TEXTURE_KEY);
    if (saved) {
      const image = new Image();
      image.onload = () => { ctx.clearRect(0, 0, 64, 64); ctx.drawImage(image, 0, 0, 64, 64); texture.needsUpdate = true; };
      image.src = saved;
    }
  } catch {}
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData = { canvas };
  return texture;
}

function partMaterial(texture, region, fallback) {
  const map = texture.clone();
  map.image = texture.image;
  map.needsUpdate = true;
  map.magFilter = THREE.NearestFilter;
  map.minFilter = THREE.NearestFilter;
  map.generateMipmaps = false;
  if (region) {
    const [x, y, w, h] = region;
    map.repeat.set(w / 64, h / 64);
    map.offset.set(x / 64, 1 - (y + h) / 64);
  }
  return new THREE.MeshStandardMaterial({ map, color: fallback || "#ffffff", roughness: 1, flatShading: true });
}

export function createCharacterModel(texture = createCharacterTexture()) {
  const root = new THREE.Group();
  root.name = "webminecraft-character";
  const regions = {
    head: [8, 8, 8, 8], torso: [20, 20, 8, 12],
    arm: [44, 20, 4, 12], leg: [4, 20, 4, 12]
  };
  function box(name, size, position, region, fallback) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), partMaterial(texture, region, fallback));
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }
  // Bedrock-style block proportions, sized to the game's 1.8-block player capsule.
  box("torso", [0.52, 0.58, 0.28], [0, 1.18, 0], regions.torso, "#3974bd");
  box("head", [0.5, 0.5, 0.5], [0, 1.73, 0], regions.head, "#c98d62");
  box("left-arm", [0.24, 0.58, 0.27], [-0.39, 1.18, 0], regions.arm, "#c98d62");
  box("right-arm", [0.24, 0.58, 0.27], [0.39, 1.18, 0], regions.arm, "#c98d62");
  box("left-leg", [0.25, 0.64, 0.28], [-0.14, 0.51, 0], regions.leg, "#303947");
  box("right-leg", [0.25, 0.64, 0.28], [0.14, 0.51, 0], regions.leg, "#303947");
  return root;
}
