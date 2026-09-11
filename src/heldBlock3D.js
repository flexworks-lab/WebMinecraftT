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
    leavesMaterial
} from "./blocks.js";

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
let scene;
let heldRoot;
let blockMesh;
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
    ctx.fillStyle = "#e2ad83";
    ctx.fillRect(1, 1, 12, 10);
    ctx.fillStyle = "#c18461";
    ctx.fillRect(0, 11, 16, 5);
    ctx.fillStyle = "#b87655";
    ctx.fillRect(12, 3, 4, 10);
    ctx.fillStyle = "#754932";
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function cloneMaterial(material) {
    if (!material?.clone) return material;
    const cloned = material.clone();
    // The world materials expect a vertex-color attribute on chunk geometry.
    // The held cube uses a plain BoxGeometry without that attribute, so leaving
    // vertexColors enabled makes the material render black.
    cloned.vertexColors = false;
    if ("color" in cloned && cloned.color) cloned.color.setRGB(1, 1, 1);
    cloned.needsUpdate = true;
    return cloned;
}

function getMaterials(itemId) {
    const source = ITEM_MATERIALS[itemId] || stoneMaterial;
    return Array.isArray(source) ? source.map(cloneMaterial) : cloneMaterial(source);
}

function isWorldVisible() {
    const inWorldClass = document.body.classList.contains("webminecraft-in-world");
    const mainMenu = document.getElementById("mainMenu");
    const seedMenu = document.getElementById("seedMenu");
    const savedWorlds = document.getElementById("savedWorlds");
    const mainHidden = !mainMenu || getComputedStyle(mainMenu).display === "none";
    const seedHidden = !seedMenu || getComputedStyle(seedMenu).display === "none";
    const savedHidden = !savedWorlds || getComputedStyle(savedWorlds).display === "none";
    return !!ITEM_MATERIALS[selectedItemId] && (inWorldClass || (mainHidden && seedHidden && savedHidden));
}

function updateVisibility() {
    visible = isWorldVisible();
    if (renderer) renderer.domElement.style.display = visible ? "block" : "none";
}

function updateBlock() {
    if (!blockMesh) return;
    const next = getMaterials(selectedItemId);
    if (Array.isArray(blockMesh.material)) {
        blockMesh.material.forEach(material => material?.dispose?.());
    } else {
        blockMesh.material?.dispose?.();
    }
    blockMesh.material = next;
}

function readSelectedItem(slot) {
    try {
        const inventory = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        return Number(inventory?.[slot]?.itemId) || 1;
    } catch {
        return 1;
    }
}

function init() {
    if (document.getElementById("heldBlock3DCanvas")) return;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.id = "heldBlock3DCanvas";
    Object.assign(renderer.domElement.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "79",
        display: "none"
    });
    document.body.appendChild(renderer.domElement);

    const style = document.createElement("style");
    style.id = "heldBlock3DStyles";
    style.textContent = `#heldBlock{display:none!important}`;
    document.head.appendChild(style);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 30);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    heldRoot = new THREE.Group();
    heldRoot.position.set(0.72, -0.38, -1.05);
    heldRoot.rotation.set(0.08, -0.18, -0.10);
    heldRoot.scale.setScalar(0.9);
    scene.add(heldRoot);

    const armGeometry = new THREE.BoxGeometry(0.28, 0.70, 0.28);
    const handMaterial = new THREE.MeshBasicMaterial({ map: makeHandTexture() });
    const hand = new THREE.Mesh(armGeometry, handMaterial);
    hand.position.set(0.20, -0.26, 0.08);
    hand.rotation.x = -0.22;
    hand.rotation.z = -0.12;
    heldRoot.add(hand);

    const blockGeometry = new THREE.BoxGeometry(0.58, 0.58, 0.58);
    blockMesh = new THREE.Mesh(blockGeometry, getMaterials(selectedItemId));
    blockMesh.position.set(-0.04, 0.10, 0);
    blockMesh.rotation.set(0.06, 0.32, -0.06);
    heldRoot.add(blockMesh);

    updateBlock();
    updateVisibility();

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    window.addEventListener("webminecraft:selectedslot", event => {
        const slot = Number(event.detail?.slot ?? 0);
        selectedItemId = readSelectedItem(slot);
        updateBlock();
        updateVisibility();
    });

    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    setInterval(updateVisibility, 250);

    function render() {
        requestAnimationFrame(render);
        if (!visible) return;
        const time = performance.now();
        heldRoot.rotation.y = -0.18 + Math.sin(time * 0.0015) * 0.018;
        heldRoot.rotation.z = -0.10 + Math.sin(time * 0.0020) * 0.012;
        renderer.render(scene, camera);
    }
    render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
