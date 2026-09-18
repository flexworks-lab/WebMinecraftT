import * as THREE from "three";
import { isSurvivalWorld } from "./survivalMode.js";

const ITEM_DEFS = [
    { id: 1, name: "Grass Block", texture: "grass_block_side.png" },
    { id: 2, name: "Dirt", texture: "dirt.png" },
    { id: 3, name: "Stone", texture: "stone.png" },
    { id: 4, name: "Sand", texture: "sand.png" },
    { id: 5, name: "Oak Log", texture: "oak_log_top.png" },
    { id: 6, name: "Oak Leaves", texture: "oak-leaves-normal-original-default.png" },
    { id: 7, name: "Cobblestone", texture: "cobblestone.png" },
    { id: 8, name: "Gravel", texture: "gravel.png" },
    { id: 9, name: "Sandstone", texture: "sandstone.png" },
    { id: 10, name: "Bedrock", texture: "bedrock.png" },
    { id: 11, name: "Coal Ore", texture: "coal_ore.png" },
    { id: 12, name: "Iron Ore", texture: "iron_ore.png" },
    { id: 13, name: "Oak Planks", texture: "oak_planks.png" },
    { id: 14, name: "Snow", texture: "snow.png" },
    { id: 15, name: "TNT", texture: "tnt_side.png" },
    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png" },
    { id: 17, name: "Oak Door", texture: "oak_door_bottom.png" }
];

let root = null;
let previewRenderer = null;
let previewScene = null;
let previewCamera = null;
let previewModel = null;
let previewFrame = 0;
let open = false;
let data = [];
let selectedHotbar = 0;

function isInWorld() { return document.body.classList.contains("webminecraft-in-world"); }
function textureUrl(name) { return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`; }
function itemDef(id) { return ITEM_DEFS.find(item => item.id === Number(id)); }
function normalizeSlot(slot) {
    if (!slot || !Number.isFinite(Number(slot.itemId)) || !Number.isFinite(Number(slot.count))) return null;
    const item = itemDef(slot.itemId);
    if (!item) return null;
    return { itemId: Number(slot.itemId), count: Math.max(1, Math.min(64, Math.floor(Number(slot.count)))), texture: slot.texture || item.texture || null };
}
function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        data = Array.isArray(saved) && saved.length === 36 ? saved.map(normalizeSlot) : Array.from({ length: 36 }, () => null);
    } catch { data = Array.from({ length: 36 }, () => null); }
}
function saveData() {
    data = data.map(normalizeSlot);
    try { localStorage.setItem("webminecraft_inventory", JSON.stringify(data)); } catch {}
    window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));
}
function itemHtml(slot) {
    if (!slot?.itemId) return "";
    const item = itemDef(slot.itemId);
    if (!item) return "";
    const texture = slot.texture || item.texture;
    const visual = texture
        ? `<img class="svi-item" src="${textureUrl(texture)}" alt="" draggable="false">`
        : `<span class="svi-item svi-color" style="--c:#777"></span>`;
    return `${visual}${slot.count > 1 ? `<b>${slot.count}</b>` : ""}`;
}
function slotButton(index, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "svi-slot";
    button.dataset.index = String(index);
    button.title = label || `Slot ${index + 1}`;
    button.setAttribute("aria-label", button.title);
    button.innerHTML = itemHtml(data[index]);
    button.addEventListener("click", () => selectSlot(index));
    return button;
}
function renderSlots() {
    const storage = root.querySelector("#svi-storage");
    const hotbar = root.querySelector("#svi-hotbar");
    storage.innerHTML = "";
    hotbar.innerHTML = "";
    for (let i = 9; i < 36; i++) storage.appendChild(slotButton(i, `Storage slot ${i - 8}`));
    for (let i = 0; i < 9; i++) {
        const button = slotButton(i, `Hotbar slot ${i + 1}`);
        if (i === selectedHotbar) button.classList.add("selected");
        hotbar.appendChild(button);
    }
}
function selectSlot(index) {
    if (index < 0 || index >= 9) return;
    selectedHotbar = index;
    const event = new KeyboardEvent("keydown", { key: String(selectedHotbar + 1), code: `Digit${selectedHotbar + 1}`, bubbles: true });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    renderSlots();
}
function close() { open = false; root?.classList.remove("open"); document.body.classList.remove("survival-inventory-open"); cancelAnimationFrame(previewFrame); if (!document.body.classList.contains("mobile-mode") && isInWorld()) { try { document.body.requestPointerLock?.(); } catch {} } }
function openInventory() {
    if (!isInWorld() || !isSurvivalWorld()) return false;
    loadData();
    if (!root) createUI();
    renderSlots();
    root.classList.add("open");
    document.body.classList.add("survival-inventory-open");
    open = true;
    document.exitPointerLock?.();
    startPreview();
    return true;
}
function makePlayerModel() {
    const group = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xd39a72 });
    const shirt = new THREE.MeshLambertMaterial({ color: 0x3f6fa2 });
    const pants = new THREE.MeshLambertMaterial({ color: 0x273b53 });
    const hair = new THREE.MeshLambertMaterial({ color: 0x2a1a12 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(.82,.82,.82), [skin,skin,skin,skin,hair,skin]);
    head.position.y = 2.25;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(.96,1.0,.55), shirt); torso.position.y = 1.35;
    const armL = new THREE.Mesh(new THREE.BoxGeometry(.36,1.0,.5), shirt); armL.position.set(-.66,1.35,0);
    const armR = armL.clone(); armR.position.x = .66;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(.42,1.0,.48), pants); legL.position.set(-.25,.35,0);
    const legR = legL.clone(); legR.position.x = .25;
    group.add(head,torso,armL,armR,legL,legR);
    group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return group;
}
function startPreview() {
    const canvas = root.querySelector("#svi-player-preview");
    if (!previewRenderer) {
        previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
        previewScene = new THREE.Scene();
        previewScene.add(new THREE.HemisphereLight(0xffffff,0x444444,1.6));
        const light = new THREE.DirectionalLight(0xffffff,2.2); light.position.set(2,5,4); previewScene.add(light);
        previewCamera = new THREE.PerspectiveCamera(34,1,.1,50); previewCamera.position.set(3.2,2.4,4.2);
        previewModel = makePlayerModel(); previewScene.add(previewModel);
    }
    const rect = canvas.getBoundingClientRect();
    previewRenderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    previewModel.rotation.y += .008;
    previewRenderer.render(previewScene, previewCamera);
    if (open) previewFrame = requestAnimationFrame(startPreview);
}
function recipeBook() {
    const button = root.querySelector("#svi-recipe-book");
    const panel = root.querySelector("#svi-recipe-panel");
    const shown = !panel.hidden;
    panel.hidden = shown;
    button.classList.toggle("active", !shown);
}
function createUI() {
    root = document.createElement("div");
    root.id = "survivalInventoryScreen";
    root.innerHTML = `
      <div id="svi-panel">
        <header id="svi-header"><span>Survival Inventory</span><button id="svi-close" type="button">×</button></header>
        <div id="svi-top">
          <section id="svi-player-box">
            <canvas id="svi-player-preview"></canvas>
            <div id="svi-armor">
              <div class="svi-armor-slot" title="Helmet">⛑</div>
              <div class="svi-armor-slot" title="Chestplate">▣</div>
              <div class="svi-armor-slot" title="Leggings">▥</div>
              <div class="svi-armor-slot" title="Boots">◈</div>
            </div>
            <div id="svi-offhand" title="Off-hand">🛡</div>
            <span class="svi-box-label">Character & Armor</span>
          </section>
          <section id="svi-crafting">
            <div class="svi-section-title">Crafting</div>
            <div class="svi-craft-row"><div id="svi-craft-grid"></div><span class="svi-arrow">→</span><div class="svi-craft-output"> </div></div>
            <button id="svi-recipe-book" type="button">📗 Recipe Book</button>
            <div id="svi-recipe-panel" hidden>Basic recipes will appear here as they are added.</div>
          </section>
        </div>
        <section id="svi-storage-section"><div class="svi-section-title">Inventory</div><div id="svi-storage"></div></section>
        <section id="svi-hotbar-section"><div class="svi-section-title">Hotbar <small>1–9</small></div><div id="svi-hotbar"></div></section>
      </div>`;
    document.body.appendChild(root);
    const craft = root.querySelector("#svi-craft-grid");
    for (let i=0;i<4;i++) craft.appendChild(document.createElement("div")).className="svi-craft-slot";
    root.querySelector("#svi-close").addEventListener("click", close);
    root.querySelector("#svi-recipe-book").addEventListener("click", recipeBook);
    const style = document.createElement("style");
    style.textContent = `
#survivalInventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.48);z-index:1000000;font-family:Arial,sans-serif;color:#fff}
#survivalInventoryScreen.open{display:flex}
#svi-panel{width:min(790px,92vw);height:min(585px,88vh);box-sizing:border-box;padding:10px;background:linear-gradient(#555,#444);border:2px solid #262626;border-top-color:#a8a8a8;border-left-color:#a8a8a8;box-shadow:8px 8px 0 rgba(0,0,0,.28),inset 1px 1px #777;display:flex;flex-direction:column;gap:8px;overflow:auto;border-radius:4px}
#svi-header{display:flex;align-items:center;justify-content:space-between;font-size:19px;font-weight:800;text-shadow:2px 2px #111;min-height:30px}#svi-close{width:32px;height:30px;background:#888;color:#fff;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;border-radius:3px;font-size:22px;line-height:22px;cursor:pointer;box-shadow:inset -1px -1px #333}#svi-close:hover{filter:brightness(1.12)}
#svi-top{display:grid;grid-template-columns:1fr 1fr;gap:8px;min-height:205px}.svi-section-title{font-size:13px;font-weight:800;margin-bottom:5px;text-shadow:1px 1px #111}.svi-section-title small{color:#aaa;font-size:10px;font-weight:600}
#svi-player-box,#svi-crafting,#svi-storage-section,#svi-hotbar-section{background:#363636;border:2px solid #222;padding:8px;box-sizing:border-box;border-radius:3px;box-shadow:inset 1px 1px rgba(255,255,255,.05)}.svi-box-label{display:block;color:#999;font-size:10px;margin-top:4px}
#svi-player-box{position:relative;display:grid;grid-template-columns:1fr 58px;grid-template-rows:1fr 40px;min-height:205px}#svi-player-preview{width:100%;height:100%;min-height:145px;background:radial-gradient(circle,#777 0%,#4a4a4a 70%)}#svi-armor{display:flex;flex-direction:column;gap:4px;padding-left:6px;align-items:center;justify-content:center}.svi-armor-slot,.svi-craft-slot,.svi-craft-output,#svi-offhand{border:2px solid #555;border-top-color:#1d1d1d;border-left-color:#1d1d1d;background:#969696;box-shadow:inset -1px -1px #414141;display:grid;place-items:center;font-size:20px;color:#ddd;border-radius:2px}.svi-armor-slot{width:38px;height:38px}.svi-armor-slot:hover,#svi-offhand:hover{filter:brightness(1.15)}#svi-offhand{width:40px;height:40px;grid-column:2;grid-row:2;justify-self:center}
#svi-crafting{display:flex;flex-direction:column;align-items:center}.svi-craft-row{display:flex;align-items:center;justify-content:center;gap:9px;flex:1}.svi-arrow{font-size:30px;color:#bbb}.svi-craft-output{width:48px;height:48px}.svi-craft-slot{width:42px;height:42px}.svi-craft-slot:hover,.svi-craft-output:hover{filter:brightness(1.15)}#svi-craft-grid{display:grid;grid-template-columns:repeat(2,42px);gap:4px}#svi-recipe-book{margin-top:5px;border:2px solid #315d34;background:#4c8a50;color:#fff;border-radius:4px;padding:5px 9px;cursor:pointer;font-weight:800;font-size:11px}#svi-recipe-book.active{background:#6cad6c}#svi-recipe-panel{width:100%;margin-top:5px;padding:6px;background:#2d2d2d;border:1px solid #6a6a6a;color:#ddd;font-size:10px;text-align:center;border-radius:2px}
#svi-storage-section{flex:1;min-height:174px}#svi-storage,#svi-hotbar{display:grid;grid-template-columns:repeat(9,minmax(34px,1fr));gap:4px}.svi-slot{position:relative;aspect-ratio:1;background:#989898;border:2px solid #575757;border-top-color:#202020;border-left-color:#202020;box-shadow:inset -1px -1px #3c3c3c;color:#fff;padding:0;cursor:pointer;overflow:hidden;border-radius:2px}.svi-slot:hover{filter:brightness(1.12)}.svi-slot.selected{border:2px solid #fff;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111}.svi-item{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);object-fit:cover;object-position:center;image-rendering:pixelated;pointer-events:none}.svi-color{background:var(--c);box-shadow:inset 3px 3px rgba(255,255,255,.15),inset -3px -3px rgba(0,0,0,.2)}.svi-slot b{position:absolute;right:3px;bottom:1px;font-size:12px;text-shadow:2px 2px #111}.svi-slot::after{content:attr(data-index);position:absolute;left:3px;top:1px;color:rgba(255,255,255,.55);font-size:8px;text-shadow:1px 1px #111;pointer-events:none}
#svi-hotbar-section{flex:0 0 auto}#svi-hotbar{grid-template-columns:repeat(9,42px);justify-content:center}.survival-inventory-open #hotbar{display:none!important}.survival-inventory-open #inventoryScreen{display:none!important}
@media(max-width:720px){#svi-panel{width:min(520px,94vw);height:88vh;padding:8px;gap:6px}#svi-top{grid-template-columns:1fr;min-height:0;gap:6px}#svi-player-box{min-height:180px}#svi-player-preview{min-height:120px}#svi-storage-section{min-height:0}.svi-slot{min-width:0}.svi-item{inset:3px;width:calc(100% - 6px);height:calc(100% - 6px)}#svi-hotbar{grid-template-columns:repeat(9,minmax(26px,40px))}.svi-section-title{font-size:12px}}
`;
    document.head.appendChild(style);
}
function init() {
    document.addEventListener("keydown", event => {
        if (!isInWorld() || !isSurvivalWorld()) return;
        if (event.code === "KeyE") {
            event.preventDefault(); event.stopImmediatePropagation();
            open ? close() : openInventory();
        }
        if (event.code === "Escape" && open) { event.preventDefault(); close(); }
    }, true);
    document.addEventListener("click", event => {
        if (!isInWorld() || !isSurvivalWorld()) return;
        const button = event.target.closest?.("#inventoryButton, #inventoryMobileButton");
        if (!button) return;
        event.preventDefault(); event.stopImmediatePropagation();
        openInventory();
    }, true);
    window.addEventListener("webminecraft:inventorychanged", () => {
        loadData();
        if (!open || !root || !isInWorld() || !isSurvivalWorld()) return;
        renderSlots();
    });
    window.addEventListener("webminecraft:modechange", () => { if (!isInWorld() || !isSurvivalWorld()) close(); });
    const worldObserver = new MutationObserver(() => {
        if (!isInWorld() && open) close();
        if (!isInWorld() && root?.classList.contains("open")) root.classList.remove("open");
    });
    worldObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();