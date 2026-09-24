import * as THREE from "three";
import { keys, touchInput } from "./controls.js";
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
    tntMaterial
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
    9: sandstoneMaterial,
    15: tntMaterial
};

const BASE_POS = new THREE.Vector3(0.84, -0.76, -1.05);
const BASE_ROT = new THREE.Euler(0.08, -0.18, -0.10);
const ACTION_DURATION = 180;
const texturePath = (file) => `${import.meta.env.BASE_URL}textures/${encodeURIComponent(file)}`;

let renderer, camera, scene, heldRoot, blockMesh, itemMesh, hand;
let visible = false;
let selectedItemId = 1;
let action = null;
let actionStartedAt = 0;

function loadHeldTexture(file) {
    const texture = new THREE.TextureLoader().load(texturePath(file));
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const flintSteelTexture = loadHeldTexture("Flint_and_Steel_JE4_BE2.png");

function makeHandTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 16;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#d69b72"; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#e2ad83"; ctx.fillRect(1, 1, 12, 10);
    ctx.fillStyle = "#c18461"; ctx.fillRect(0, 11, 16, 5);
    ctx.fillStyle = "#b87655"; ctx.fillRect(12, 3, 4, 10);
    ctx.fillStyle = "#754932"; ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 15, 16, 1);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function cloneMaterial(material) {
    if (!material?.clone) return material;
    const cloned = material.clone();
    cloned.vertexColors = false;
    if (cloned.color) cloned.color.setRGB(1, 1, 1);
    cloned.needsUpdate = true;
    return cloned;
}

function getMaterials(itemId) {
    const source = ITEM_MATERIALS[itemId] || stoneMaterial;
    return Array.isArray(source) ? source.map(cloneMaterial) : cloneMaterial(source);
}

function isWorldVisible() {
    const inWorld = document.body.classList.contains("webminecraft-in-world");
    const main = document.getElementById("mainMenu");
    const seed = document.getElementById("seedMenu");
    const saved = document.getElementById("savedWorlds");
    return (ITEM_MATERIALS[selectedItemId] || selectedItemId === 16) && inWorld
        && (!main || getComputedStyle(main).display === "none")
        && (!seed || getComputedStyle(seed).display === "none")
        && (!saved || getComputedStyle(saved).display === "none");
}

function updateVisibility() {
    visible = isWorldVisible();
    if (renderer) renderer.domElement.style.display = visible ? "block" : "none";
}

function clearHeldMesh() {
    if (blockMesh) {
        blockMesh.geometry.dispose();
        if (Array.isArray(blockMesh.material)) blockMesh.material.forEach(m => m?.dispose?.());
        else blockMesh.material?.dispose?.();
        heldRoot.remove(blockMesh);
        blockMesh = null;
    }
    if (itemMesh) {
        itemMesh.geometry.dispose();
        itemMesh.material?.dispose?.();
        heldRoot.remove(itemMesh);
        itemMesh = null;
    }
}

function updateBlock() {
    clearHeldMesh();

    if (selectedItemId === 16) {
        // Flint & Steel is a thin held item, not a cube.
        const geometry = new THREE.PlaneGeometry(0.48, 0.72);
        const material = new THREE.MeshBasicMaterial({
            map: flintSteelTexture,
            transparent: true,
            alphaTest: 0.05,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        itemMesh = new THREE.Mesh(geometry, material);
        itemMesh.position.set(-0.01, 0.02, -0.03);
        itemMesh.rotation.set(0.02, 0.12, -0.12);
        itemMesh.renderOrder = 3;
        heldRoot.add(itemMesh);
        return;
    }

    if (ITEM_MATERIALS[selectedItemId]) {
        blockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.64), getMaterials(selectedItemId));
        blockMesh.position.set(-0.04, 0.10, 0);
        blockMesh.rotation.set(0.06, 0.32, -0.06);
        blockMesh.renderOrder = 2;
        heldRoot.add(blockMesh);
    }
}

function readSelectedItem(slot) {
    try {
        const inv = JSON.parse(localStorage.getItem("webminecraft_inventory") || "[]");
        return Number(inv?.[slot]?.itemId) || 1;
    } catch { return 1; }
}

function triggerAction(type) {
    if (!visible) return;
    action = type;
    actionStartedAt = performance.now();
}

function moving() {
    return !!(keys["KeyW"] || keys["KeyA"] || keys["KeyS"] || keys["KeyD"]
        || Math.abs(touchInput.moveX || 0) > 0.08 || Math.abs(touchInput.moveZ || 0) > 0.08);
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
        position: "fixed", left: "0", top: "0", width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: "35", display: "none"
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

    scene.add(new THREE.AmbientLight(0xffffff, 2.8));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-2, 3, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.5);
    fill.position.set(3, 1, 2); scene.add(fill);

    heldRoot = new THREE.Group();
    heldRoot.position.copy(BASE_POS);
    heldRoot.rotation.copy(BASE_ROT);
    heldRoot.scale.setScalar(1.08);
    scene.add(heldRoot);

    hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.30, 0.76, 0.30),
        new THREE.MeshBasicMaterial({ map: makeHandTexture() })
    );
    hand.position.set(0.22, -0.29, 0.08);
    hand.rotation.x = -0.22;
    hand.rotation.z = -0.12;
    heldRoot.add(hand);

    updateBlock();
    updateVisibility();

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    window.addEventListener("webminecraft:selectedslot", event => {
        selectedItemId = readSelectedItem(Number(event.detail?.slot ?? 0));
        updateBlock();
        updateVisibility();
    });

    window.addEventListener("mousedown", event => {
        if (!visible || document.body.classList.contains("mobile-mode")) return;
        if (document.pointerLockElement !== document.body) return;
        if (event.button === 0) triggerAction("mine");
        if (event.button === 2) triggerAction("place");
    });

    window.addEventListener("webminecraft:heldaction", event => {
        const type = event.detail?.type;
        if (type === "mine" || type === "place") triggerAction(type);
    });

    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    setInterval(updateVisibility, 250);

    function render() {
        requestAnimationFrame(render);
        if (!visible) return;

        const now = performance.now();
        const walk = moving();
        const speed = walk ? 0.012 : 0.0022;
        const bob = walk ? Math.sin(now * speed) * 0.055 : Math.sin(now * speed) * 0.008;
        const sway = walk ? Math.cos(now * speed * 0.52) * 0.018 : 0;

        let actionX = 0, actionY = 0, actionPX = 0, actionPZ = 0;
        if (action) {
            const t = THREE.MathUtils.clamp((now - actionStartedAt) / ACTION_DURATION, 0, 1);
            const p = Math.sin(Math.PI * t);
            if (action === "mine") {
                actionX = -0.72 * p;
                actionY = 0.18 * p;
                actionPX = 0.11 * p;
                actionPZ = 0.10 * p;
            } else {
                actionX = -0.38 * p;
                actionY = 0.10 * p;
                actionPX = -0.04 * p;
                actionPZ = 0.12 * p;
            }
            if (t >= 1) action = null;
        }

        heldRoot.position.set(BASE_POS.x + sway + actionPX, BASE_POS.y + bob - Math.abs(actionPX) * 0.2, BASE_POS.z + actionPZ);
        heldRoot.rotation.set(BASE_ROT.x + actionX, BASE_ROT.y, BASE_ROT.z + actionY + sway * 0.5);
        renderer.render(scene, camera);
    }
    render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
