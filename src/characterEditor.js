import * as THREE from "three";
import {
  createCharacterModel,
  createCharacterTexture,
  CHARACTER_TEXTURE_KEY,
  resetCharacterTexture
} from "./characterModel.js";

const PALETTE = [
  "#202020", "#f4f4f4", "#c98d62", "#8b5a3c", "#f0c7a0", "#3974bd",
  "#4b8051", "#a94d42", "#d1a43c", "#303947", "#171717", "#70472c",
  "#79b5c9", "#553e80", "#777777", "#b9b9b9"
];

const css = document.createElement("style");
css.textContent = `
#characterEditor{position:fixed;inset:0;z-index:500;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,10,12,.92);color:#f5f5f5;font-family:Arial,sans-serif}
#characterEditor.open{display:flex}#characterEditor *{box-sizing:border-box}
#characterEditorPanel{position:relative;width:min(1180px,100%);height:min(780px,94vh);min-height:480px;display:grid;grid-template-columns:minmax(0,1fr) minmax(350px,.9fr);overflow:hidden;background:#292929;border:2px solid #777;box-shadow:0 18px 60px #000b}
#characterEditorPreview{position:relative;min-width:0;min-height:0;background:radial-gradient(ellipse at 50% 38%,#565656 0,#303030 45%,#171717 100%)}#characterEditorPreview canvas{width:100%;height:100%;display:block}
#characterEditorHint{position:absolute;left:14px;bottom:12px;color:#ddd;font-size:11px;letter-spacing:1px;text-transform:uppercase;pointer-events:none}
#characterEditorControls{padding:20px;overflow:auto;background:#292929}#characterEditorTitle{margin:0 0 5px;font-size:23px;letter-spacing:.7px}#characterEditorSub{color:#bbb;font-size:12px;line-height:1.5;margin:0 0 14px}
#skinCanvasWrap{width:min(100%,420px);aspect-ratio:1;background-color:#ddd;background-image:linear-gradient(45deg,#aaa 25%,transparent 25%),linear-gradient(-45deg,#aaa 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#aaa 75%),linear-gradient(-45deg,transparent 75%,#aaa 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0;border:2px solid #888;image-rendering:pixelated;touch-action:none}
#skinCanvas{display:block;width:100%;height:100%;image-rendering:pixelated;cursor:crosshair;touch-action:none}
.characterLabel{display:block;margin:15px 0 7px;color:#ddd;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
#skinTools{display:flex;gap:6px;flex-wrap:wrap}.skinTool{min-height:32px;padding:0 10px;border:1px solid #111;border-top-color:#999;border-left-color:#999;background:#555;color:#fff;font-weight:700;font-size:11px;cursor:pointer}.skinTool.active{outline:2px solid #fff;outline-offset:1px;background:#777}
#skinPalette{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}.skinColor{aspect-ratio:1;border:2px solid #111;outline:1px solid #777;cursor:pointer;min-width:0}.skinColor[aria-pressed=true]{outline:3px solid white;outline-offset:1px}
#skinColorRow{display:flex;align-items:center;gap:9px;margin-top:9px;font-size:12px;color:#ccc}#skinCustomColor{width:42px;height:30px;padding:0;border:1px solid #aaa;background:transparent;cursor:pointer}
#characterActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:17px}.characterAction{min-height:39px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#626262;color:white;font-weight:700;font-size:11px;cursor:pointer}.characterAction.primary{background:#668746}
#characterClose{position:absolute;top:9px;right:9px;z-index:3;width:38px;height:38px;border:1px solid #888;background:#222;color:#fff;font-size:23px;cursor:pointer}
@media(max-width:760px){#characterEditor{padding:0}#characterEditorPanel{width:100%;height:100%;min-height:0;grid-template-columns:1fr;grid-template-rows:minmax(180px,30vh) 1fr}#characterEditorControls{padding:14px}#characterEditorTitle{font-size:20px}#characterEditorSub{margin-bottom:9px}#skinCanvasWrap{width:min(100%,330px)}.characterLabel{margin-top:11px}}
`;
document.head.appendChild(css);

const overlay = document.createElement("section");
overlay.id = "characterEditor";
overlay.setAttribute("aria-label", "Character texture editor");
overlay.innerHTML = `
<div id="characterEditorPanel">
  <div id="characterEditorPreview">
    <button id="characterClose" type="button" aria-label="Close character editor">×</button>
    <div id="characterEditorHint">Drag model to rotate · Preview updates live</div>
  </div>
  <div id="characterEditorControls">
    <h2 id="characterEditorTitle">SKIN TEXTURE STUDIO</h2>
    <p id="characterEditorSub">Paint the 64 × 64 Minecraft skin atlas. The character model and proportions stay the same. Transparent pixels are preserved.</p>
    <span class="characterLabel">Skin atlas · 64 × 64 pixels</span>
    <div id="skinCanvasWrap"><canvas id="skinCanvas" width="64" height="64"></canvas></div>
    <span class="characterLabel">Tool</span>
    <div id="skinTools">
      <button class="skinTool active" type="button" data-tool="paint">PAINT</button>
      <button class="skinTool" type="button" data-tool="erase">ERASER</button>
      <button class="skinTool" type="button" data-tool="pick">PICK COLOR</button>
      <button class="skinTool" type="button" id="skinUndo">UNDO</button>
      <button class="skinTool" type="button" id="skinGrid" aria-pressed="true">PIXEL GRID: ON</button>
    </div>
    <div id="skinColorRow">Brush size
      <select id="skinBrushSize" aria-label="Brush size" style="background:#444;color:#fff;border:1px solid #888;padding:6px">
        <option value="1">1 px</option><option value="2">2 px</option><option value="3">3 px</option><option value="4">4 px</option>
      </select>
      <label for="skinCustomColor">Custom</label><input id="skinCustomColor" type="color" value="#3974bd">
    </div>
    <span class="characterLabel">Palette</span><div id="skinPalette"></div>
    <div id="characterActions">
      <button class="characterAction" id="skinImport" type="button">IMPORT PNG</button>
      <button class="characterAction" id="skinExport" type="button">EXPORT PNG</button>
      <button class="characterAction" id="characterReset" type="button">RESET TEXTURE</button>
      <button class="characterAction primary" id="characterSave" type="button">SAVE TEXTURE</button>
    </div>
    <input id="skinFileInput" type="file" accept="image/png,image/webp,image/jpeg" hidden>
  </div>
</div>`;
document.body.appendChild(overlay);

const skinCanvas = overlay.querySelector("#skinCanvas");
const skinCtx = skinCanvas.getContext("2d", { willReadFrequently: true, alpha: true });
skinCtx.imageSmoothingEnabled = false;

const texture = createCharacterTexture();
const textureCanvas = texture.userData.canvas;
const textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true, alpha: true });
textureCtx.imageSmoothingEnabled = false;

function copyTextureToEditor() {
  skinCtx.clearRect(0, 0, 64, 64);
  skinCtx.drawImage(textureCanvas, 0, 0);
  skinCtx.imageSmoothingEnabled = false;
}
copyTextureToEditor();
window.addEventListener("webminecraft-character-texture-loaded", copyTextureToEditor);

let selectedColor = PALETTE[5];
let tool = "paint";
let brushSize = 1;
let painting = false;
let lastPixel = null;
let strokeSnapshot = null;
let undoStack = [];
let avatarYaw = -0.22;
const palette = overlay.querySelector("#skinPalette");
const brushSelect = overlay.querySelector("#skinBrushSize");
const gridButton = overlay.querySelector("#skinGrid");
const canvasWrap = overlay.querySelector("#skinCanvasWrap");

function selectColor(color) {
  selectedColor = color;
  overlay.querySelector("#skinCustomColor").value = color;
  for (const el of palette.children) el.setAttribute("aria-pressed", String(el.dataset.color === selectedColor));
}
for (const color of PALETTE) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "skinColor";
  button.dataset.color = color;
  button.style.background = color;
  button.title = color;
  button.setAttribute("aria-label", `Select ${color}`);
  button.setAttribute("aria-pressed", String(color === selectedColor));
  button.addEventListener("click", () => selectColor(color));
  palette.appendChild(button);
}
overlay.querySelector("#skinCustomColor").addEventListener("input", e => selectColor(e.target.value));
brushSelect.addEventListener("change", () => { brushSize = Number(brushSelect.value) || 1; });
overlay.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => {
  tool = button.dataset.tool;
  overlay.querySelectorAll("[data-tool]").forEach(el => el.classList.toggle("active", el === button));
  skinCanvas.style.cursor = tool === "pick" ? "copy" : tool === "erase" ? "cell" : "crosshair";
}));
gridButton.addEventListener("click", () => {
  const on = gridButton.getAttribute("aria-pressed") !== "true";
  gridButton.setAttribute("aria-pressed", String(on));
  gridButton.textContent = `PIXEL GRID: ${on ? "ON" : "OFF"}`;
  skinCanvas.style.imageRendering = on ? "pixelated" : "auto";
  canvasWrap.style.borderColor = on ? "#888" : "#555";
});

function pixelFromEvent(event) {
  const rect = skinCanvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(63, Math.floor((event.clientX - rect.left) / rect.width * 64))),
    y: Math.max(0, Math.min(63, Math.floor((event.clientY - rect.top) / rect.height * 64)))
  };
}
function snapshotBeforeStroke() {
  strokeSnapshot = textureCtx.getImageData(0, 0, 64, 64);
}
function applyBrush(x, y) {
  if (tool === "pick") {
    const pixel = textureCtx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, "0")).join("");
      selectColor(hex);
    }
    tool = "paint";
    overlay.querySelectorAll("[data-tool]").forEach(el => el.classList.toggle("active", el.dataset.tool === "paint"));
    skinCanvas.style.cursor = "crosshair";
    return;
  }
  const half = Math.floor(brushSize / 2);
  const left = x - half, top = y - half;
  if (tool === "erase") textureCtx.clearRect(left, top, brushSize, brushSize);
  else {
    textureCtx.fillStyle = selectedColor;
    textureCtx.fillRect(left, top, brushSize, brushSize);
  }
  texture.needsUpdate = true;
  copyTextureToEditor();
}
function paintLine(from, to) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(from.x + dx * i / steps);
    const y = Math.round(from.y + dy * i / steps);
    applyBrush(x, y);
  }
}
skinCanvas.addEventListener("pointerdown", event => {
  if (tool === "pick") {
    const p = pixelFromEvent(event);
    applyBrush(p.x, p.y);
    return;
  }
  painting = true;
  skinCanvas.setPointerCapture(event.pointerId);
  snapshotBeforeStroke();
  lastPixel = pixelFromEvent(event);
  applyBrush(lastPixel.x, lastPixel.y);
});
skinCanvas.addEventListener("pointermove", event => {
  if (!painting || !lastPixel) return;
  const next = pixelFromEvent(event);
  paintLine(lastPixel, next);
  lastPixel = next;
});
function finishStroke() {
  if (painting && strokeSnapshot) {
    undoStack.push(strokeSnapshot);
    if (undoStack.length > 40) undoStack.shift();
    strokeSnapshot = null;
  }
  painting = false;
  lastPixel = null;
}
skinCanvas.addEventListener("pointerup", finishStroke);
skinCanvas.addEventListener("pointercancel", finishStroke);
function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  textureCtx.putImageData(previous, 0, 0);
  texture.needsUpdate = true;
  copyTextureToEditor();
}
overlay.querySelector("#skinUndo").addEventListener("click", undo);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#303030");
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
camera.position.set(3.8, 2.7, 6.8);
camera.lookAt(0, 0.95, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
overlay.querySelector("#characterEditorPreview").prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight("#e9f4ff", "#6b5946", 2));
const keyLight = new THREE.DirectionalLight("#fff1d8", 2.7);
keyLight.position.set(4, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight("#9bbfff", 1.2);
rimLight.position.set(-4, 4, -3);
scene.add(rimLight);
const avatar = createCharacterModel(texture);
scene.add(avatar);
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(2.4, 32),
  new THREE.MeshStandardMaterial({ color: "#414141", roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);

let dragging = false;
let lastX = 0;
const previewCanvas = renderer.domElement;
previewCanvas.style.touchAction = "pan-y";
previewCanvas.addEventListener("pointerdown", event => {
  dragging = true;
  lastX = event.clientX;
  previewCanvas.setPointerCapture(event.pointerId);
});
previewCanvas.addEventListener("pointermove", event => {
  if (!dragging) return;
  avatarYaw += (event.clientX - lastX) * 0.012;
  lastX = event.clientX;
  avatar.rotation.y = avatarYaw;
});
previewCanvas.addEventListener("pointerup", () => dragging = false);
previewCanvas.addEventListener("pointercancel", () => dragging = false);

function resize() {
  const host = overlay.querySelector("#characterEditorPreview");
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
function show() {
  overlay.classList.add("open");
  resize();
  copyTextureToEditor();
}
function close() {
  overlay.classList.remove("open");
}
function save() {
  try {
    localStorage.setItem(CHARACTER_TEXTURE_KEY, textureCanvas.toDataURL("image/png"));
  } catch (error) {
    console.warn("Could not save character texture in this browser.", error);
  }
  window.dispatchEvent(new CustomEvent("webminecraft-character-changed"));
  const button = overlay.querySelector("#characterSave");
  button.textContent = "SAVED ✓";
  setTimeout(() => button.textContent = "SAVE TEXTURE", 1000);
}
function reset() {
  undoStack.push(textureCtx.getImageData(0, 0, 64, 64));
  if (undoStack.length > 40) undoStack.shift();
  resetCharacterTexture(texture);
  copyTextureToEditor();
}
function exportPng() {
  const link = document.createElement("a");
  link.download = "webminecraft-skin-64x64.png";
  link.href = textureCanvas.toDataURL("image/png");
  link.click();
}
function importPng(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    undoStack.push(textureCtx.getImageData(0, 0, 64, 64));
    if (undoStack.length > 40) undoStack.shift();
    textureCtx.clearRect(0, 0, 64, 64);
    textureCtx.drawImage(image, 0, 0, 64, 64);
    texture.needsUpdate = true;
    copyTextureToEditor();
    URL.revokeObjectURL(url);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    alert("That image could not be loaded. Choose a valid skin PNG.");
  };
  image.src = url;
}
overlay.querySelector("#characterClose").addEventListener("click", close);
overlay.querySelector("#characterReset").addEventListener("click", reset);
overlay.querySelector("#characterSave").addEventListener("click", save);
overlay.querySelector("#skinExport").addEventListener("click", exportPng);
const fileInput = overlay.querySelector("#skinFileInput");
overlay.querySelector("#skinImport").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", event => {
  importPng(event.target.files?.[0]);
  event.target.value = "";
});
overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
window.addEventListener("keydown", event => {
  if (!overlay.classList.contains("open")) return;
  if (event.key === "Escape") close();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }
});
window.addEventListener("resize", resize);

function addMenuButton() {
  const host = document.querySelector("#menuButtons");
  if (!host || document.querySelector("#characterEditorOpen")) return;
  const button = document.createElement("button");
  button.className = "menuButton";
  button.id = "characterEditorOpen";
  button.type = "button";
  button.textContent = "CHARACTER TEXTURE";
  button.addEventListener("click", show);
  const settings = host.querySelector("#menuSettingsButton");
  if (settings) host.insertBefore(button, settings);
  else host.appendChild(button);
}
addMenuButton();
window.addEventListener("DOMContentLoaded", addMenuButton, { once: true });

function render() {
  requestAnimationFrame(render);
  if (overlay.classList.contains("open")) renderer.render(scene, camera);
}
render();
