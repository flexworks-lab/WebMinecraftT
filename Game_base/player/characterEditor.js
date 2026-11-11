import * as THREE from "three";
import {
  AVATAR_TEXTURE_PARTS,
  createAvatar,
  applyAvatarTextureData
} from "../multiplayer/multiplayerAvatars.js";
import { sendCharacterSkin } from "../multiplayer/multiplayerClient.js";
import { getCharacterAppearanceId, readCharacterTextureRecord, writeCharacterTextureRecord } from "./appearanceIdentity.js";

const STORAGE_KEY = "webminecraft-procedural-character-textures-v1";
const PALETTE = [
  "#171717", "#f4f4f4", "#c98d62", "#8b5a3c", "#f0c7a0", "#3974bd",
  "#4b8051", "#a94d42", "#d1a43c", "#303947", "#70472c", "#79b5c9",
  "#553e80", "#777777", "#b9b9b9", "#ffffff"
];
const TEXTURE_SIZE = 16;

function getIdentity() {
  let user = null;
  try { user = window.firebase?.auth?.()?.currentUser || null; } catch {}
  const username = String(
    user?.uid && user?.isAnonymous !== true
      ? (localStorage.getItem("webminecraft-account-username") || user.displayName || "Player")
      : (sessionStorage.getItem("webminecraft-guest-name") ||
         localStorage.getItem("webminecraft-player-name") || "Player")
  ).trim().slice(0, 16) || "Player";
  const appearanceId = getCharacterAppearanceId();
  return { id: appearanceId, appearanceId, name: username };
}

function readSavedTextures() {
  return readCharacterTextureRecord()?.textures || null;
}

function getTextureCanvas(textures, key) {
  return textures?.[key]?.userData?.canvas || null;
}

function snapshotTextures(textures) {
  const snapshots = {};
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = getTextureCanvas(textures, key);
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (context) snapshots[key] = context.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  }
  return snapshots;
}

const style = document.createElement("style");
style.textContent = `
#characterEditor{position:fixed;inset:0;z-index:500;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,10,12,.92);color:#f5f5f5;font-family:Arial,sans-serif}
#characterEditor.open{display:flex}#characterEditor *{box-sizing:border-box}
#characterEditorPanel{position:relative;width:min(1200px,100%);height:min(790px,94vh);min-height:490px;display:grid;grid-template-columns:minmax(0,1fr) minmax(370px,.86fr);overflow:hidden;background:#292929;border:2px solid #777;box-shadow:0 18px 60px #000b}
#characterEditorPreview{position:relative;min-width:0;min-height:0;background:radial-gradient(ellipse at 50% 38%,#565656 0,#303030 45%,#171717 100%)}
#characterEditorPreview>canvas{width:100%;height:100%;display:block}
#characterEditorHint{position:absolute;left:14px;bottom:12px;color:#ddd;font-size:11px;letter-spacing:1px;text-transform:uppercase;pointer-events:none}
#characterEditorStatus{position:absolute;top:14px;left:14px;padding:7px 9px;background:rgba(0,0,0,.48);border:1px solid #777;color:#d8efbd;font:bold 10px Arial,sans-serif;letter-spacing:.6px;pointer-events:none}
#characterEditorControls{padding:18px;overflow:auto;background:#292929}
#characterEditorTitle{margin:0 0 5px;font-size:23px;letter-spacing:.7px}
#characterEditorSub{color:#bbb;font-size:12px;line-height:1.5;margin:0 0 12px}
.characterLabel{display:block;margin:13px 0 7px;color:#ddd;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
#avatarTextureList{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.avatarTextureChoice{min-width:0;padding:6px 3px 5px;border:1px solid #151515;border-top-color:#666;border-left-color:#666;background:#444;color:#eee;font-size:10px;font-weight:700;cursor:pointer}
.avatarTextureChoice.active{outline:2px solid #fff;outline-offset:1px;background:#626262}
.avatarTextureChoice canvas{display:block;width:38px;height:38px;margin:0 auto 5px;image-rendering:pixelated; background-color:#777}
#skinCanvasWrap{width:min(100%,330px);aspect-ratio:1;background-color:#ddd;background-image:linear-gradient(45deg,#aaa 25%,transparent 25%),linear-gradient(-45deg,#aaa 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#aaa 75%),linear-gradient(-45deg,transparent 75%,#aaa 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0;border:2px solid #888;touch-action:none}
#skinCanvas{display:block;width:100%;height:100%;image-rendering:pixelated;cursor:crosshair;touch-action:none}
#skinTools{display:flex;gap:6px;flex-wrap:wrap}
.skinTool{min-height:30px;padding:0 9px;border:1px solid #111;border-top-color:#999;border-left-color:#999;background:#555;color:#fff;font-weight:700;font-size:10px;cursor:pointer}
.skinTool.active{outline:2px solid #fff;outline-offset:1px;background:#777}
#skinPalette{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}
.skinColor{aspect-ratio:1;border:2px solid #111;outline:1px solid #777;cursor:pointer;min-width:0}
.skinColor[aria-pressed=true]{outline:3px solid white;outline-offset:1px}
#skinColorRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:#ccc}
#skinCustomColor{width:38px;height:28px;padding:0;border:1px solid #aaa;background:transparent;cursor:pointer}
#skinBrushSize{background:#444;color:#fff;border:1px solid #888;padding:5px}
#characterActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:15px}
.characterAction{min-height:38px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#626262;color:white;font-weight:700;font-size:10px;cursor:pointer}
.characterAction.primary{background:#668746}
#characterClose{position:absolute;top:9px;right:9px;z-index:3;width:38px;height:38px;border:1px solid #888;background:#222;color:#fff;font-size:23px;cursor:pointer}
@media(max-width:760px){#characterEditor{padding:0}#characterEditorPanel{width:100%;height:100%;min-height:0;grid-template-columns:1fr;grid-template-rows:minmax(180px,30vh) 1fr}#characterEditorControls{padding:13px}#characterEditorTitle{font-size:20px}#characterEditorSub{margin-bottom:8px}#avatarTextureList{grid-template-columns:repeat(4,minmax(0,1fr))}#skinCanvasWrap{width:min(100%,280px)}.characterLabel{margin-top:10px}}
/* Main-menu character showcase uses this same procedural avatar and renderer. */
#characterShowcase{position:fixed;right:clamp(18px,5.5vw,88px);bottom:clamp(32px,7vh,72px);z-index:84;width:214px;height:318px;display:flex;flex-direction:column;overflow:hidden;background:linear-gradient(180deg,#393939,#202020);border:2px solid #111;border-top-color:#999;border-left-color:#999;box-shadow:5px 5px 0 rgba(0,0,0,.55),inset 1px 1px 0 rgba(255,255,255,.08);color:#fff;pointer-events:auto}
#characterShowcase[hidden]{display:none!important}
#characterShowcaseTitle{height:30px;flex:0 0 30px;display:flex;align-items:center;justify-content:center;background:#292929;border-bottom:2px solid #111;color:#ddd;font:11px MinecraftFont,monospace;letter-spacing:1px;text-shadow:2px 2px 0 #000}
#characterShowcasePreview{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#555 0,#303030 52%,#171717 100%);touch-action:pan-y}
#characterShowcasePreview>canvas{display:block;width:100%;height:100%;touch-action:pan-y}
#characterEditorOpen{width:100%;height:44px;flex:0 0 44px;margin:0;padding:0 6px;border:0;border-top:2px solid #999;background:linear-gradient(#747474,#555);color:#fff;font:12px MinecraftFont,monospace;text-shadow:2px 2px 0 #222;cursor:pointer}
#characterEditorOpen:active{filter:brightness(.86)}
body.webminecraft-in-world #characterShowcase{display:none!important}
@media(max-width:1360px){
  #menuPanel{width:min(760px,calc(100vw - 280px))!important;margin:0 auto 0 24px!important}
  #characterShowcase{right:clamp(16px,4vw,60px);width:min(214px,20vw)}
}
@media(max-width:760px){
  #menuPanel{width:calc(100vw - 148px)!important;max-width:420px!important;margin:0 auto 0 8px!important}
  #menuTitle{font-size:clamp(22px,6.4vw,38px)!important;letter-spacing:-1px!important;-webkit-text-stroke:1.5px #111!important}
  #menuSubtitle{font-size:8px!important;line-height:1.25!important;margin:6px 0 8px!important}
  #menuSplash{width:100%!important;max-width:100%!important;font-size:clamp(9px,2.8vw,12px)!important;margin:2px auto 8px!important;padding:5px 6px!important}
  #menuButtons{width:100%!important}
  #menuButtons .menuButton{height:clamp(38px,6.2vh,46px)!important;margin:6px auto!important;padding:5px 3px!important;font-size:clamp(10px,2.9vw,13px)!important}
  #characterShowcase{right:8px;bottom:max(58px,env(safe-area-inset-bottom));width:min(34vw,132px);height:min(32vh,220px);min-height:168px}
  #characterShowcaseTitle{height:24px;flex-basis:24px;font-size:9px}
  #characterEditorOpen{height:37px;flex-basis:37px;font-size:10px}
}
@media(max-height:520px) and (max-width:900px){
  #characterShowcase{height:155px;min-height:155px;bottom:10px}
  #characterShowcaseTitle{height:20px;flex-basis:20px}
  #characterEditorOpen{height:32px;flex-basis:32px}
  #menuPanel{margin-top:0!important}
}
`;
document.head.appendChild(style);

const overlay = document.createElement("section");
overlay.id = "characterEditor";
overlay.setAttribute("aria-label", "Procedural character texture editor");
overlay.innerHTML = `
<div id="characterEditorPanel">
  <div id="characterEditorPreview">
    <button id="characterClose" type="button" aria-label="Close character editor">×</button>
    <div id="characterEditorStatus">LIVE PREVIEW · SAME PROCEDURAL MODEL</div>
    <div id="characterEditorHint">Drag to rotate · F5 changes in-game view</div>
  </div>
  <div id="characterEditorControls">
    <h2 id="characterEditorTitle">CHARACTER TEXTURE STUDIO</h2>
    <p id="characterEditorSub">These are the game's actual generated character textures. Paint pixels on each texture; the procedural model and its proportions stay locked.</p>
    <span class="characterLabel">Generated texture maps</span>
    <div id="avatarTextureList"></div>
    <span class="characterLabel" id="activeTextureLabel">Face · 16 × 16</span>
    <div id="skinCanvasWrap"><canvas id="skinCanvas" width="16" height="16"></canvas></div>
    <span class="characterLabel">Paint tools</span>
    <div id="skinTools">
      <button class="skinTool active" type="button" data-tool="paint">PAINT</button>
      <button class="skinTool" type="button" data-tool="erase">ERASER</button>
      <button class="skinTool" type="button" data-tool="pick">PICK COLOR</button>
      <button class="skinTool" type="button" id="skinUndo">UNDO</button>
      <button class="skinTool" type="button" id="skinGrid" aria-pressed="true">PIXEL GRID: ON</button>
    </div>
    <div id="skinColorRow">Brush
      <select id="skinBrushSize" aria-label="Brush size">
        <option value="1">1 px</option><option value="2">2 px</option>
        <option value="3">3 px</option><option value="4">4 px</option>
      </select>
      <label for="skinCustomColor">Custom</label><input id="skinCustomColor" type="color" value="#3974bd">
    </div>
    <span class="characterLabel">Color palette</span><div id="skinPalette"></div>
    <div id="characterActions">
      <button class="characterAction" id="skinImport" type="button">IMPORT MAP PNG</button>
      <button class="characterAction" id="skinExport" type="button">EXPORT MAP PNG</button>
      <button class="characterAction" id="characterReset" type="button">RESET GENERATED TEXTURES</button>
      <button class="characterAction primary" id="characterSave" type="button">SAVE TEXTURES</button>
    </div>
    <input id="skinFileInput" type="file" accept="image/png,image/webp,image/jpeg" hidden>
  </div>
</div>`;
document.body.appendChild(overlay);

const skinCanvas = overlay.querySelector("#skinCanvas");
const skinCtx = skinCanvas.getContext("2d", { willReadFrequently: true, alpha: true });
skinCtx.imageSmoothingEnabled = false;
const textureList = overlay.querySelector("#avatarTextureList");
const palette = overlay.querySelector("#skinPalette");
const brushSelect = overlay.querySelector("#skinBrushSize");
const gridButton = overlay.querySelector("#skinGrid");
const customColorInput = overlay.querySelector("#skinCustomColor");
const fileInput = overlay.querySelector("#skinFileInput");
const canvasWrap = overlay.querySelector("#skinCanvasWrap");

let scene;
let camera;
let renderer;
let previewAvatar;
let currentTextures = {};
let baseSnapshots = {};
let savedTextureData = readSavedTextures() || {};
let dirtyTextureKeys = new Set();
let resetOverridesPending = false;
let currentIdentity = "";
let selectedTextureKey = "face";
let selectedColor = PALETTE[5];
let tool = "paint";
let brushSize = 1;
let painting = false;
let lastPixel = null;
let strokeSnapshot = null;
let undoStack = [];
let avatarYaw = -0.22;
let dragging = false;
let lastX = 0;
let livePreviewFrame = 0;
let onlineSkinSyncTimer = null;

function getCurrentTextureOverrides() {
  const textures = resetOverridesPending ? {} : { ...savedTextureData };
  for (const key of dirtyTextureKeys) {
    const canvas = textureCanvas(key);
    if (canvas) textures[key] = canvas.toDataURL("image/png");
  }
  return textures;
}
function scheduleLivePreview() {
  if (livePreviewFrame) return;
  livePreviewFrame = requestAnimationFrame(() => {
    livePreviewFrame = 0;
    window.dispatchEvent(new CustomEvent("webminecraft:character-live-preview", { detail: { textures: currentTextures } }));
  });
}
function scheduleOnlineSkinSync() {
  if (onlineSkinSyncTimer) clearTimeout(onlineSkinSyncTimer);
  onlineSkinSyncTimer = window.setTimeout(() => {
    onlineSkinSyncTimer = null;
    const textures = getCurrentTextureOverrides();
    sendCharacterSkin(Object.keys(textures).length ? textures : null);
  }, 320);
}

function setSelectedColor(color) {
  selectedColor = color;
  customColorInput.value = color;
  for (const button of palette.children) {
    button.setAttribute("aria-pressed", String(button.dataset.color === selectedColor));
  }
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
  button.addEventListener("click", () => setSelectedColor(color));
  palette.appendChild(button);
}
customColorInput.addEventListener("input", event => setSelectedColor(event.target.value));
brushSelect.addEventListener("change", () => { brushSize = Number(brushSelect.value) || 1; });

function textureCanvas(key) {
  return getTextureCanvas(currentTextures, key);
}
function refreshTextureButtons() {
  for (const button of textureList.children) {
    const key = button.dataset.textureKey;
    const thumb = button.querySelector("canvas");
    const source = textureCanvas(key);
    if (thumb && source) {
      const ctx = thumb.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(source, 0, 0, 16, 16);
    }
    button.classList.toggle("active", key === selectedTextureKey);
  }
}
function copySelectedTextureToEditor() {
  const source = textureCanvas(selectedTextureKey);
  if (!source) return;
  skinCtx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  skinCtx.drawImage(source, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  skinCtx.imageSmoothingEnabled = false;
  const descriptor = AVATAR_TEXTURE_PARTS.find(part => part.key === selectedTextureKey);
  overlay.querySelector("#activeTextureLabel").textContent = `${descriptor?.label || selectedTextureKey} · 16 × 16`;
  refreshTextureButtons();
}
function pushEditorIntoTexture() {
  const target = textureCanvas(selectedTextureKey);
  const texture = currentTextures[selectedTextureKey];
  if (!target || !texture) return;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(skinCanvas, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  texture.needsUpdate = true;
  refreshTextureButtons();
  scheduleLivePreview();
}
function chooseTexture(key) {
  pushEditorIntoTexture();
  selectedTextureKey = key;
  undoStack = [];
  copySelectedTextureToEditor();
}
for (const { key, label } of AVATAR_TEXTURE_PARTS) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "avatarTextureChoice";
  button.dataset.textureKey = key;
  button.innerHTML = `<canvas width="16" height="16" aria-hidden="true"></canvas><span>${label}</span>`;
  button.addEventListener("click", () => chooseTexture(key));
  textureList.appendChild(button);
}

function makeScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#303030");
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(3.8, 2.65, 6.8);
  camera.lookAt(0, 1.12, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  overlay.querySelector("#characterEditorPreview").prepend(renderer.domElement);
  const previewCanvas = renderer.domElement;
  previewCanvas.style.touchAction = "pan-y";
  previewCanvas.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    previewCanvas.setPointerCapture(event.pointerId);
  });
  previewCanvas.addEventListener("pointermove", event => {
    if (!dragging || !previewAvatar) return;
    avatarYaw += (event.clientX - lastX) * 0.012;
    lastX = event.clientX;
    previewAvatar.group.rotation.y = avatarYaw;
  });
  const stopDragging = () => { dragging = false; };
  previewCanvas.addEventListener("pointerup", stopDragging);
  previewCanvas.addEventListener("pointercancel", stopDragging);
  scene.add(new THREE.HemisphereLight("#e9f4ff", "#6b5946", 1.8));
  const key = new THREE.DirectionalLight("#fff1d8", 2.1);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#9bbfff", 1);
  rim.position.set(-4, 4, -3);
  scene.add(rim);
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 32),
    new THREE.MeshLambertMaterial({ color: "#414141" })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);
}

async function buildPreview(force = false) {
  const identity = getIdentity();
  const key = identity.id;
  if (!force && previewAvatar && currentIdentity === key) return;
  if (previewAvatar) {
    scene.remove(previewAvatar.group);
    const materials = new Set();
    previewAvatar.group.traverse(object => {
      object.geometry?.dispose?.();
      const list = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of list) {
        if (!material) continue;
        if (material.map) material.map.dispose?.();
        materials.add(material);
      }
    });
    for (const material of materials) material.dispose?.();
  }
  currentIdentity = key;
  previewAvatar = createAvatar(identity.id, identity.name, null, identity.appearanceId);
  currentTextures = previewAvatar.textures;
  previewAvatar.group.traverse(object => { if (object.isSprite) object.visible = false; });
  previewAvatar.group.rotation.y = avatarYaw;
  scene.add(previewAvatar.group);
  await previewAvatar.textureReady;
  if (currentIdentity !== key) return;
  baseSnapshots = snapshotTextures(currentTextures);
  undoStack = [];
  savedTextureData = readSavedTextures() || {};
  dirtyTextureKeys = new Set();
  resetOverridesPending = false;
  if (Object.keys(savedTextureData).length) await applyAvatarTextureData(currentTextures, savedTextureData);
  if (currentIdentity !== key) return;
  copySelectedTextureToEditor();
  refreshTextureButtons();
  scheduleLivePreview();
}

function pixelFromEvent(event) {
  const rect = skinCanvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(15, Math.floor((event.clientX - rect.left) / rect.width * 16))),
    y: Math.max(0, Math.min(15, Math.floor((event.clientY - rect.top) / rect.height * 16)))
  };
}
function pushUndoSnapshot() {
  strokeSnapshot = {
    key: selectedTextureKey,
    image: skinCtx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  };
}
function applyBrush(x, y) {
  if (tool === "pick") {
    const pixel = skinCtx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, "0")).join("");
      setSelectedColor(hex);
    }
    tool = "paint";
    overlay.querySelectorAll("[data-tool]").forEach(button => button.classList.toggle("active", button.dataset.tool === "paint"));
    skinCanvas.style.cursor = "crosshair";
    return;
  }
  const start = Math.floor((brushSize - 1) / 2);
  const left = Math.max(0, Math.min(16 - brushSize, x - start));
  const top = Math.max(0, Math.min(16 - brushSize, y - start));
  if (tool === "erase") skinCtx.clearRect(left, top, brushSize, brushSize);
  else {
    skinCtx.fillStyle = selectedColor;
    skinCtx.fillRect(left, top, brushSize, brushSize);
  }
  dirtyTextureKeys.add(selectedTextureKey);
  pushEditorIntoTexture();
}
function paintLine(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    applyBrush(
      Math.round(from.x + dx * i / steps),
      Math.round(from.y + dy * i / steps)
    );
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
  pushUndoSnapshot();
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
    scheduleLivePreview();
    scheduleOnlineSkinSync();
  }
  painting = false;
  lastPixel = null;
}
skinCanvas.addEventListener("pointerup", finishStroke);
skinCanvas.addEventListener("pointercancel", finishStroke);

function undo() {
  pushEditorIntoTexture();
  const previous = undoStack.pop();
  if (!previous) return;
  if (previous.key !== selectedTextureKey) {
    selectedTextureKey = previous.key;
    copySelectedTextureToEditor();
  }
  skinCtx.putImageData(previous.image, 0, 0);
  pushEditorIntoTexture();
  scheduleLivePreview();
  scheduleOnlineSkinSync();
}
overlay.querySelector("#skinUndo").addEventListener("click", undo);
overlay.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => {
  tool = button.dataset.tool;
  overlay.querySelectorAll("[data-tool]").forEach(item => item.classList.toggle("active", item === button));
  skinCanvas.style.cursor = tool === "pick" ? "copy" : tool === "erase" ? "cell" : "crosshair";
}));
gridButton.addEventListener("click", () => {
  const on = gridButton.getAttribute("aria-pressed") !== "true";
  gridButton.setAttribute("aria-pressed", String(on));
  gridButton.textContent = `PIXEL GRID: ${on ? "ON" : "OFF"}`;
  skinCanvas.style.imageRendering = on ? "pixelated" : "auto";
  canvasWrap.style.borderColor = on ? "#888" : "#555";
});

function resize() {
  if (!renderer || !camera) return;
  const host = renderer.domElement.parentElement;
  if (!host) return;
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
async function show() {
  overlay.classList.add("open");
  const editorHost = overlay.querySelector("#characterEditorPreview");
  if (editorHost && renderer?.domElement.parentElement !== editorHost) editorHost.prepend(renderer.domElement);
  await buildPreview();
  resize();
  copySelectedTextureToEditor();
}
function close() {
  overlay.classList.remove("open");
  const showcaseHost = document.getElementById("characterShowcasePreview");
  if (showcaseHost && renderer?.domElement.parentElement !== showcaseHost) showcaseHost.appendChild(renderer.domElement);
  resize();
}

function resetTextures() {
  pushEditorIntoTexture();
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = textureCanvas(key);
    const image = baseSnapshots[key];
    if (!canvas || !image) continue;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.putImageData(image, 0, 0);
    currentTextures[key].needsUpdate = true;
  }
  savedTextureData = {};
  dirtyTextureKeys.clear();
  resetOverridesPending = true;
  undoStack = [];
  copySelectedTextureToEditor();
  refreshTextureButtons();
  scheduleLivePreview();
  scheduleOnlineSkinSync();
}
async function saveTextures() {
  pushEditorIntoTexture();
  if (!resetOverridesPending && dirtyTextureKeys.size === 0) {
    const button = overlay.querySelector("#characterSave");
    button.textContent = "ALREADY SAVED";
    window.setTimeout(() => { button.textContent = "SAVE TEXTURES"; }, 1200);
    return;
  }

  // Only override the maps the player actually painted. The unedited maps
  // remain the same seeded procedural textures on every device and in every room.
  const textures = resetOverridesPending ? {} : { ...savedTextureData };
  for (const key of dirtyTextureKeys) {
    const canvas = textureCanvas(key);
    if (canvas) textures[key] = canvas.toDataURL("image/png");
  }
  const savedAt = Date.now();
  if (!writeCharacterTextureRecord(textures, savedAt)) {
    alert("Unable to save these textures in this browser. Try exporting the individual maps instead.");
    return;
  }

  sendCharacterSkin(Object.keys(textures).length ? textures : null);
  savedTextureData = textures;
  dirtyTextureKeys.clear();
  resetOverridesPending = false;
  window.dispatchEvent(new CustomEvent("webminecraft:character-changed", { detail: { textures } }));

  let profileSaved = false;
  try {
    profileSaved = Boolean(await window.webMinecraftSaveCharacterProfile?.(textures, savedAt));
  } catch (error) {
    console.warn("Character textures were saved to this browser, but not to the cloud profile.", error);
  }
  const button = overlay.querySelector("#characterSave");
  button.textContent = profileSaved ? "PROFILE + BROWSER SAVED ✓" : "BROWSER SAVED ✓";
  window.setTimeout(() => { button.textContent = "SAVE TEXTURES"; }, 1800);
}
function exportPng() {
  pushEditorIntoTexture();
  const canvas = textureCanvas(selectedTextureKey);
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `webminecraft-${selectedTextureKey}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
function importPng(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    pushUndoSnapshot();
    undoStack.push(strokeSnapshot);
    strokeSnapshot = null;
    if (undoStack.length > 40) undoStack.shift();
    const target = textureCanvas(selectedTextureKey);
    if (!target) { URL.revokeObjectURL(url); return; }
    const ctx = target.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, 16, 16);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, 16, 16);
    currentTextures[selectedTextureKey].needsUpdate = true;
    dirtyTextureKeys.add(selectedTextureKey);
    URL.revokeObjectURL(url);
    copySelectedTextureToEditor();
    scheduleLivePreview();
    scheduleOnlineSkinSync();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    alert("That image could not be loaded. Choose a valid image.");
  };
  image.src = url;
}
overlay.querySelector("#skinImport").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", event => {
  importPng(event.target.files?.[0]);
  event.target.value = "";
});
overlay.querySelector("#skinExport").addEventListener("click", exportPng);
overlay.querySelector("#characterReset").addEventListener("click", resetTextures);
overlay.querySelector("#characterSave").addEventListener("click", saveTextures);
overlay.querySelector("#characterClose").addEventListener("click", close);
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
window.addEventListener("webminecraft:multiplayer-state-changed", () => {
  if (overlay.classList.contains("open")) void buildPreview();
});
window.addEventListener("webminecraft:character-profile-loaded", event => {
  savedTextureData = event.detail?.textures && typeof event.detail.textures === "object" ? event.detail.textures : {};
  if (!previewAvatar) {
    void buildPreview(true).then(resize);
    return;
  }
  void applyAvatarTextureData(currentTextures, savedTextureData).then(() => {
    if (overlay.classList.contains("open")) copySelectedTextureToEditor();
    scheduleLivePreview();
  });
});

makeScene();

function addMenuButton() {
  if (document.getElementById("characterShowcase")) return;
  const showcase = document.createElement("aside");
  showcase.id = "characterShowcase";
  showcase.setAttribute("aria-label", "Your character");
  showcase.innerHTML = `
    <div id="characterShowcaseTitle">YOUR CHARACTER</div>
    <div id="characterShowcasePreview" aria-label="Drag to rotate your character"></div>
    <button id="characterEditorOpen" type="button">CUSTOMIZE</button>
  `;
  showcase.querySelector("#characterEditorOpen").addEventListener("click", show);
  document.body.appendChild(showcase);
  const previewHost = showcase.querySelector("#characterShowcasePreview");
  if (renderer?.domElement && renderer.domElement.parentElement !== previewHost) previewHost.appendChild(renderer.domElement);
  void buildPreview().then(resize).catch(error => console.warn("Could not build the character showcase:", error));
}
addMenuButton();
window.addEventListener("DOMContentLoaded", addMenuButton, { once: true });

function render() {
  requestAnimationFrame(render);
  const editorOpen = overlay.classList.contains("open");
  const showcase = document.getElementById("characterShowcase");
  const showcaseVisible = Boolean(
    showcase &&
    !document.body.classList.contains("webminecraft-in-world") &&
    getComputedStyle(showcase).display !== "none" &&
    showcase.getBoundingClientRect().width > 0
  );
  if ((editorOpen || showcaseVisible) && renderer && scene && camera && previewAvatar) renderer.render(scene, camera);
}
render();
