import * as THREE from "three";
import {
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    cobblestoneMaterial,
    gravelMaterial,
    sandMaterial,
    sandstoneMaterial,
    oakLogMaterial,
    leavesMaterial,
    oakPlankMaterial,
    bedrockMaterial,
    coalMaterial,
    ironMaterial,
    snowMaterial
} from "./blocks.js";

const ITEM_TEXTURES = [
    null,
    "Grass_Block_(top_texture)_JE2.png",
    "dirt.png",
    "stone.png",
    "sand.png",
    "oak_log_top.png",
    "oak-leaves-normal-original-default.png",
    "stone.png",
    "dirt.png",
    "sand.png"
];

const ITEM_MATERIALS = {
    1: grassMaterial,
    2: dirtMaterial,
    3: stoneMaterial,
    4: sandMaterial,
    5: oakLogMaterial,
    6: leavesMaterial,
    7: cobblestoneMaterial,
    8: gravelMaterial,
    9: sandstoneMaterial
};

let renderer;
let camera;
let heldRoot;
let blockMesh;
let handMesh;
let animationFrame = 0;
let visible = false;
let selectedItemId = 1;

function makeHandTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#d69b72";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#c18461";
    ctx.fillRect(0, 12, 16, 4);
    ctx.fillStyle = "#e2ad83";
    ctx.fillRect(2, 2, 11, 8);
    ctx.fillStyle = "#b87655";
    ctx.fillRect(11, 4, 5, 8);
    ctx.fillStyle = "#70452f";
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function materialFor(itemId) {
    const materials = ITEM_MATERIALS[itemId] || stoneMaterial;
    return Array.isArray(materials) ? materials.map(material => material.clone()) : materials.clone();
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.id = "heldBlock3DCanvas";
    Object.assign(renderer.domElement.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "79",
        display: "none",
        imageRendering: "pixelated"
    });
    document.body.appendChild(renderer.domElement);

    const style = document.createElement("style");
    style.id = "heldBlock3DStyles";
    style.textContent = `
#heldBlock{display:none!important}
body:not(.webminecraft-in-world) #heldBlock3DCanvas{display:none!important}
body.webminecraft-in-world #heldBlock3DCanvas{display:block}
`;
    document.head.appendChild(style);
}

function createScene() {
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.position.set(0, 0, 2.8);

    heldRoot = new THREE.Group();
    heldRoot.position.set(0.78, -0.43, -1.35);
    heldRoot.rotation.set(0.08, -0.28, -0.12);
    heldRoot.scale.setScalar(0.72);

    const armGeometry = new THREE.BoxGeometry(0.26, 0.62, 0.26);
    const handMaterial = new THREE.MeshBasicMaterial({ map: makeHandTexture() });
    handMesh = new THREE.Mesh(armGeometry, handMaterial);
    handMesh.position.set(0.18, -0.23, 0.05);
    handMesh.rotation.z = -0.12;
    handMesh.rotation.x = -0.25;
    heldRoot.add(handMesh);

    const blockGeometry = new THREE.BoxGeometry(0.56, 0.56, 0.56);
    blockMesh = new THREE.Mesh(blockGeometry, materialFor(selectedItemId));
    blockMesh.position.set(-0.02, 0.10, 0);
    blockMesh.rotation.set(0.05, 0.25, -0.05);
    blockMesh.castShadow = false;
    blockMesh.receiveShadow = false;
    heldRoot.add(blockMesh);

    updateBlockMaterial();
}

function updateBlockMaterial() {
    if (!blockMesh) return;
    const next = materialFor(selectedItemId);
    if (Array.isArray(blockMesh.material)) {
        blockMesh.material.forEach(material => material.dispose());
    } else {
        blockMesh.material.dispose();
    }
    blockMesh.material = next;
}

function updateVisibility() {
    visible = document.body.classList.contains("webminecraft-in-world") && !!ITEM_MATERIALS[selectedItemId];
    if (renderer) renderer.domElement.style.display = visible ? "block" : "none";
}

function animate(time) {
    animationFrame = requestAnimationFrame(animate);
    if (!visible || !heldRoot) return;
    heldRoot.rotation.y = -0.28 + Math.sin(time * 0.0016) * 0.018;
    heldRoot.rotation.z = -0.12 + Math.sin(time * 0.0021) * 0.012;
    renderer.render(heldRoot.parent ? heldRoot.parent : heldRoot, camera);
}

function resize() {
    if (!renderer) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function init() {
    createRenderer();
    createScene();

    const scene = new THREE.Scene();
    scene.add(heldRoot);

    const light = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(light);
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(-2, 3, 4);
    scene.add(key);

    heldRoot.parent.remove(heldRoot);
    scene.add(heldRoot);

    window.addEventListener("resize", resize);
    window.addEventListener("webminecraft:selectedslot", event => {
        const slot = Number(event.detail?.slot ?? 0);
        const saved = Number.parseInt(localStorage.getItem("webminecraft_inventory") || "", 10);
        void saved;
        const raw = (() => {
            try { return JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]"); } catch { return []; }
        })();
        const item = raw?.[slot];
        selectedItemId = Number(item?.itemId) || 1;
        updateBlockMaterial();
        updateVisibility();
    });

    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    updateVisibility();
    animate(0);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
