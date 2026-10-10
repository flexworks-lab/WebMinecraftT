import * as THREE from "three";

const STORAGE_KEY = "webminecraft-character-v1";
const defaults = {
  skin: "#c98d62",
  shirt: "#3974bd",
  pants: "#303947",
  hair: "#39291f",
  hairStyle: "short",
  outfit: "adventurer",
  eyes: "#263f68",
  accessory: "none"
};

function loadLook() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return { ...defaults, ...(saved && typeof saved === "object" ? saved : {}) };
  } catch {
    return { ...defaults };
  }
}

let look = loadLook();
window.__webMinecraftCharacterLook = { ...look };

const css = document.createElement("style");
css.textContent = `
#characterEditor { position:fixed; inset:0; z-index:500; display:none; align-items:center; justify-content:center; padding:18px; background:rgba(9,12,15,.88); backdrop-filter:blur(5px); color:#f5f5f5; font-family:Arial,sans-serif; }
#characterEditor.open { display:flex; }
#characterEditor * { box-sizing:border-box; }
#characterEditorPanel { width:min(1040px,100%); height:min(720px,94vh); min-height:480px; display:grid; grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr); overflow:hidden; background:#202020; border:2px solid #777; box-shadow:0 18px 60px #000b; }
#characterEditorPreview { position:relative; min-width:0; background:radial-gradient(ellipse at 50% 38%,#555 0,#303030 42%,#181818 100%); }
#characterEditorPreview canvas { width:100%; height:100%; display:block; }
#characterEditorPreviewHint { position:absolute; left:14px; bottom:12px; color:#ccc; font-size:11px; letter-spacing:1px; text-transform:uppercase; pointer-events:none; }
#characterEditorControls { padding:24px; overflow:auto; background:#292929; }
#characterEditorTitle { margin:0 0 5px; font-size:25px; letter-spacing:1px; }
#characterEditorSub { color:#aaa; font-size:12px; margin:0 0 22px; }
.characterField { margin:0 0 18px; }
.characterField label { display:block; margin:0 0 8px; color:#ddd; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
.characterSwatches { display:flex; flex-wrap:wrap; gap:8px; }
.characterSwatch { width:34px; height:34px; padding:0; border:2px solid #111; outline:1px solid #777; cursor:pointer; }
.characterSwatch[aria-pressed="true"] { outline:3px solid #fff; outline-offset:2px; }
.characterChoices { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
.characterChoice { min-height:37px; padding:8px; border:1px solid #555; background:#383838; color:#eee; cursor:pointer; font-size:12px; }
.characterChoice[aria-pressed="true"] { border-color:#fff; background:#555; box-shadow:inset 0 0 0 1px #fff; }
#characterEditorActions { display:flex; gap:8px; margin-top:26px; }
.characterAction { flex:1; min-height:43px; border:2px solid #111; border-top-color:#aaa; border-left-color:#aaa; background:#666; color:white; font-weight:700; cursor:pointer; }
#characterSave { background:#668746; }
#characterClose { position:absolute; top:10px; right:12px; z-index:3; width:40px; height:40px; border:1px solid #888; background:#222; color:#fff; font-size:23px; cursor:pointer; }
@media(max-width:700px) {
 #characterEditor { padding:0; }
 #characterEditorPanel { width:100%; height:100%; min-height:0; grid-template-columns:1fr; grid-template-rows:minmax(190px,34vh) 1fr; }
 #characterEditorControls { padding:16px; }
 #characterEditorTitle { font-size:21px; }
 #characterEditorSub { margin-bottom:14px; }
 .characterField { margin-bottom:13px; }
 .characterSwatch { width:29px; height:29px; }
 #characterEditorActions { margin-top:15px; }
}
`;
document.head.appendChild(css);

const overlay = document.createElement("section");
overlay.id = "characterEditor";
overlay.setAttribute("aria-label", "Character editor");
overlay.innerHTML = `
  <div id="characterEditorPanel">
    <div id="characterEditorPreview">
      <button id="characterClose" aria-label="Close character editor" title="Close">×</button>
      <div id="characterEditorPreviewHint">Drag to rotate · Preview</div>
    </div>
    <div id="characterEditorControls">
      <h2 id="characterEditorTitle">CHARACTER EDITOR</h2>
      <p id="characterEditorSub">Build your look. Changes are saved in this browser.</p>
      <div class="characterField"><label>Skin tone</label><div class="characterSwatches" data-key="skin"></div></div>
      <div class="characterField"><label>Shirt / armor</label><div class="characterSwatches" data-key="shirt"></div></div>
      <div class="characterField"><label>Pants</label><div class="characterSwatches" data-key="pants"></div></div>
      <div class="characterField"><label>Hair color</label><div class="characterSwatches" data-key="hair"></div></div>
      <div class="characterField"><label>Hair style</label><div class="characterChoices" data-key="hairStyle" data-options="short,spiky,hood,none"></div></div>
      <div class="characterField"><label>Outfit</label><div class="characterChoices" data-key="outfit" data-options="adventurer,miner,explorer,knight"></div></div>
      <div class="characterField"><label>Eyes</label><div class="characterSwatches" data-key="eyes"></div></div>
      <div class="characterField"><label>Accessory</label><div class="characterChoices" data-key="accessory" data-options="none,glasses,headset,bandana"></div></div>
      <div id="characterEditorActions"><button class="characterAction" id="characterReset">RESET</button><button class="characterAction" id="characterSave">SAVE LOOK</button></div>
    </div>
  </div>`;
document.body.appendChild(overlay);

const palettes = {
  skin: ["#f5cba7","#e7b18a","#c98d62","#a96845","#75452f","#4b2d22"],
  shirt: ["#3974bd","#4b8051","#a94d42","#d1a43c","#555b65","#e4e4e4","#553e80","#252525"],
  pants: ["#303947","#4b392d","#3d5942","#777777","#263d59","#191919"],
  hair: ["#171717","#39291f","#70472c","#b77c32","#d6c29b","#9b3434","#4c5791"],
  eyes: ["#263f68","#477f59","#6b492f","#272727","#79b5c9"]
};
const labels = { short:"Short", spiky:"Spiky", hood:"Hood", none:"Bald", adventurer:"Adventurer", miner:"Miner", explorer:"Explorer", knight:"Knight", glasses:"Glasses", headset:"Headset", bandana:"Bandana" };

for (const container of overlay.querySelectorAll(".characterSwatches")) {
  const key = container.dataset.key;
  for (const color of palettes[key] || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "characterSwatch";
    button.style.background = color;
    button.title = color;
    button.setAttribute("aria-label", color);
    button.addEventListener("click", () => { look[key] = color; renderChoices(); buildAvatar(); });
    container.appendChild(button);
  }
}
for (const container of overlay.querySelectorAll(".characterChoices")) {
  const key = container.dataset.key;
  for (const value of container.dataset.options.split(",")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "characterChoice";
    button.textContent = labels[value] || value;
    button.dataset.value = value;
    button.addEventListener("click", () => { look[key] = value; renderChoices(); buildAvatar(); });
    container.appendChild(button);
  }
}
function renderChoices() {
  for (const button of overlay.querySelectorAll(".characterSwatch")) {
    const key = button.closest("[data-key]").dataset.key;
    button.setAttribute("aria-pressed", String(button.title === look[key]));
  }
  for (const button of overlay.querySelectorAll(".characterChoice")) {
    const key = button.closest("[data-key]").dataset.key;
    button.setAttribute("aria-pressed", String(button.dataset.value === look[key]));
  }
}
function material(color, roughness = 0.88) { return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true }); }

const preview = new THREE.Scene();
preview.background = new THREE.Color("#303030");
preview.fog = new THREE.Fog("#303030", 12, 25);
const previewCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
previewCamera.position.set(4.4, 3.3, 7.5);
previewCamera.lookAt(0, 1.25, 0);
const previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
previewRenderer.setClearColor("#303030");
previewRenderer.shadowMap.enabled = true;
previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
overlay.querySelector("#characterEditorPreview").prepend(previewRenderer.domElement);
preview.add(new THREE.HemisphereLight("#e9f4ff", "#6b5946", 2.0));
const keyLight = new THREE.DirectionalLight("#fff1d8", 3.0);
keyLight.position.set(4, 8, 5); keyLight.castShadow = true; preview.add(keyLight);
const rimLight = new THREE.DirectionalLight("#9bbfff", 1.3);
rimLight.position.set(-4, 4, -3); preview.add(rimLight);
const avatar = new THREE.Group();
preview.add(avatar);
const ground = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), material("#414141"));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; preview.add(ground);
let dragging = false, lastX = 0, avatarYaw = -0.22;
const previewCanvas = previewRenderer.domElement;
previewCanvas.style.touchAction = "pan-y";
previewCanvas.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; previewCanvas.setPointerCapture(e.pointerId); });
previewCanvas.addEventListener("pointermove", e => { if (!dragging) return; avatarYaw += (e.clientX-lastX)*0.012; lastX=e.clientX; avatar.rotation.y=avatarYaw; });
previewCanvas.addEventListener("pointerup", () => { dragging = false; });
previewCanvas.addEventListener("pointercancel", () => { dragging = false; });

function addBox(parent, name, size, pos, color, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, opts.roughness ?? 0.88));
  mesh.name = name; mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}
function buildAvatar() {
  while (avatar.children.length) {
    const child = avatar.children.pop();
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose()); else child.material?.dispose();
  }
  const shirt = look.outfit === "knight" ? "#777d86" : look.outfit === "miner" ? "#826343" : look.outfit === "explorer" ? "#617b50" : look.shirt;
  const pants = look.outfit === "knight" ? "#424751" : look.pants;
  addBox(avatar,"torso",[0.78,0.78,0.38],[0,1.35,0],shirt);
  addBox(avatar,"belt",[0.8,0.12,0.4],[0,1.02,0],look.outfit==="knight"?"#b8a16b":"#49382b");
  addBox(avatar,"neck",[0.24,0.2,0.24],[0,1.84,0],look.skin);
  addBox(avatar,"head",[0.72,0.72,0.72],[0,2.28,0],look.skin);
  // Pixel-style face on the front of the head.
  addBox(avatar,"left-eye",[0.105,0.085,0.025],[-0.17,2.32,0.371],look.eyes);
  addBox(avatar,"right-eye",[0.105,0.085,0.025],[0.17,2.32,0.371],look.eyes);
  addBox(avatar,"nose",[0.09,0.13,0.08],[0,2.19,0.39],look.skin);
  addBox(avatar,"mouth",[0.19,0.045,0.025],[0,2.09,0.371],"#633a32");
  if (look.hairStyle === "hood") {
    addBox(avatar,"hood-top",[0.79,0.27,0.79],[0,2.66,0],shirt);
    addBox(avatar,"hood-side-l",[0.12,0.4,0.76],[-0.34,2.43,0],shirt);
    addBox(avatar,"hood-side-r",[0.12,0.4,0.76],[0.34,2.43,0],shirt);
  } else if (look.hairStyle !== "none") {
    addBox(avatar,"hair-top",[0.76,0.17,0.76],[0,2.69,0],look.hair);
    addBox(avatar,"hair-back",[0.73,0.42,0.13],[0,2.48,-0.34],look.hair);
    if (look.hairStyle === "spiky") {
      for (let i=-1;i<=1;i++) addBox(avatar,"spike-"+i,[0.17,0.22,0.18],[i*0.2,2.84,0],look.hair);
    } else addBox(avatar,"fringe",[0.72,0.14,0.2],[0,2.57,0.29],look.hair);
  }
  if (look.accessory === "glasses") {
    addBox(avatar,"glasses-left",[0.2,0.13,0.035],[-0.17,2.32,0.405],"#202020");
    addBox(avatar,"glasses-right",[0.2,0.13,0.035],[0.17,2.32,0.405],"#202020");
    addBox(avatar,"glasses-bridge",[0.11,0.035,0.035],[0,2.32,0.415],"#202020");
  } else if (look.accessory === "headset") {
    addBox(avatar,"headband",[0.66,0.1,0.78],[0,2.67,0],"#22252a");
    addBox(avatar,"earcup-left",[0.13,0.28,0.15],[-0.4,2.35,0],"#22252a");
    addBox(avatar,"earcup-right",[0.13,0.28,0.15],[0.4,2.35,0],"#22252a");
  } else if (look.accessory === "bandana") {
    addBox(avatar,"bandana",[0.74,0.13,0.75],[0,2.53,0],look.shirt);
  }
  for (const side of [-1,1]) {
    addBox(avatar,"arm-"+side,[0.24,0.7,0.3],[side*0.53,1.38,0],look.skin);
    addBox(avatar,"sleeve-"+side,[0.29,0.34,0.34],[side*0.51,1.58,0],shirt);
    addBox(avatar,"hand-"+side,[0.22,0.2,0.24],[side*0.53,0.94,0.02],look.skin);
    addBox(avatar,"leg-"+side,[0.31,0.74,0.34],[side*0.2,0.57,0],pants);
    addBox(avatar,"boot-"+side,[0.34,0.18,0.46],[side*0.2,0.1,0.055],"#292929");
  }
  if (look.outfit === "miner") {
    addBox(avatar,"helmet",[0.8,0.17,0.8],[0,2.72,0],"#d0a13e");
    addBox(avatar,"lamp",[0.16,0.12,0.07],[0,2.7,0.42],"#f5edbb");
  } else if (look.outfit === "knight") {
    addBox(avatar,"shoulder-left",[0.37,0.22,0.42],[-0.53,1.76,0],"#9299a3");
    addBox(avatar,"shoulder-right",[0.37,0.22,0.42],[0.53,1.76,0],"#9299a3");
    addBox(avatar,"chest-emblem",[0.18,0.24,0.04],[0,1.4,0.215],"#c8ad65");
  } else if (look.outfit === "explorer") {
    addBox(avatar,"pack",[0.5,0.55,0.22],[0,1.42,-0.28],"#514433");
  }
  avatar.rotation.y = avatarYaw;
}
function resizePreview() {
  const host = overlay.querySelector("#characterEditorPreview");
  const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
  previewRenderer.setSize(width, height, false);
  previewCamera.aspect = width / height;
  previewCamera.updateProjectionMatrix();
}
function showEditor() {
  overlay.classList.add("open");
  renderChoices();
  buildAvatar();
  resizePreview();
}
function closeEditor() { overlay.classList.remove("open"); }
function saveLook() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(look)); } catch {}
  window.__webMinecraftCharacterLook = { ...look };
  window.dispatchEvent(new CustomEvent("webminecraft-character-changed", { detail: { ...look } }));
  const button = overlay.querySelector("#characterSave");
  button.textContent = "SAVED ✓";
  setTimeout(() => { button.textContent = "SAVE LOOK"; }, 1200);
}
overlay.querySelector("#characterClose").addEventListener("click", closeEditor);
overlay.querySelector("#characterReset").addEventListener("click", () => { look = { ...defaults }; renderChoices(); buildAvatar(); });
overlay.querySelector("#characterSave").addEventListener("click", saveLook);
overlay.addEventListener("click", e => { if (e.target === overlay) closeEditor(); });
window.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("open")) closeEditor(); });
window.addEventListener("resize", resizePreview);

const menuButtons = document.querySelector("#menuButtons");
if (menuButtons) {
  const button = document.createElement("button");
  button.className = "menuButton";
  button.id = "characterEditorOpen";
  button.type = "button";
  button.textContent = "CHARACTER";
  button.addEventListener("click", showEditor);
  const settingsButton = menuButtons.querySelector("#menuSettingsButton");
  if (settingsButton) menuButtons.insertBefore(button, settingsButton);
  else menuButtons.appendChild(button);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    const host = document.querySelector("#menuButtons");
    if (!host || document.querySelector("#characterEditorOpen")) return;
    const button = document.createElement("button");
    button.className = "menuButton"; button.id = "characterEditorOpen"; button.textContent = "CHARACTER";
    button.addEventListener("click", showEditor); host.appendChild(button);
  }, { once: true });
}

buildAvatar();
function renderPreview() {
  requestAnimationFrame(renderPreview);
  if (!overlay.isConnected) return;
  if (overlay.classList.contains("open")) previewRenderer.render(preview, previewCamera);
}
renderPreview();
