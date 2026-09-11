import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange } from "./multiplayerClient.js";
import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";
import "./worldSave.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const INTERACTION_DISTANCE = 5;
let selectedSlot = 0;
let lastPunch = false;
let lastPlace = false;

function setupTexturedHotbar() {
    let hotbar = document.getElementById("hotbar");

    // Rebuild the hotbar if the page did not provide one.
    if (!hotbar) {
        hotbar = document.createElement("div");
        hotbar.id = "hotbar";
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement("div");
            slot.className = "slot";
            hotbar.appendChild(slot);
        }
        document.body.appendChild(hotbar);
    }

    const BASE = import.meta.env.BASE_URL;
    const textures = [
        "Grass_Block_(top_texture)_JE2.png",
        "dirt.png",
        "stone.png",
        "sand.png",
        "oak_log_top.png",
        "oak-leaves-normal-original-default.png",
        "Grass_Block_(top_texture)_JE2.png",
        "dirt.png",
        "stone.png"
    ];

    // Always make exactly 9 usable hotbar slots.
    while (hotbar.querySelectorAll(".slot").length < 9) {
        const slot = document.createElement("div");
        slot.className = "slot";
        hotbar.appendChild(slot);
    }

    hotbar.classList.add("textured-hotbar");
    hotbar.style.setProperty("display", "flex", "important");
    hotbar.style.setProperty("pointer-events", "auto", "important");

    hotbar.querySelectorAll(".slot").forEach((slot, index) => {
        const texture = textures[index] || textures[0];
        slot.title = `${index + 1}`;
        slot.setAttribute("aria-label", `Hotbar slot ${index + 1}`);
        slot.innerHTML = `<span class="hotbarTexture" style="background-image:url('${BASE}textures/${encodeURIComponent(texture)}')"></span><span class="hotbarNumber">${index + 1}</span>`;
    });

    if (!document.getElementById("webMinecraftTexturedHotbarStyles")) {
        const style = document.createElement("style");
        style.id = "webMinecraftTexturedHotbarStyles";
        style.textContent = `
#hotbar.textured-hotbar{position:fixed!important;left:50%!important;bottom:20px!important;transform:translateX(-50%)!important;display:flex!important;gap:0!important;padding:4px!important;background:rgba(25,25,25,.96)!important;border:3px solid #111!important;box-shadow:inset 2px 2px 0 #777,inset -2px -2px 0 #333,0 3px 0 rgba(0,0,0,.65)!important;z-index:10000!important;visibility:visible!important;opacity:1!important;image-rendering:pixelated;pointer-events:auto!important}
#hotbar.textured-hotbar .slot{position:relative;width:52px!important;height:52px!important;flex:0 0 52px!important;padding:0!important;margin:0!important;border:2px solid #555!important;background:#222!important;overflow:hidden;cursor:pointer;image-rendering:pixelated}
#hotbar.textured-hotbar .slot.selected{border:3px solid #fff!important;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111!important;z-index:2}
#hotbar.textured-hotbar .hotbarTexture{position:absolute;inset:3px;display:block;background-position:center;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated;pointer-events:none}
#hotbar.textured-hotbar .hotbarNumber{position:absolute;left:2px;top:1px;min-width:13px;height:14px;padding:0 2px;color:#fff;font:11px/14px Arial,sans-serif;font-weight:700;text-align:center;text-shadow:1px 1px 0 #000;background:rgba(0,0,0,.45);pointer-events:none;z-index:3}
#hotbar.textured-hotbar .hotbarCount{position:absolute;right:3px;bottom:1px;color:#fff;font:bold 13px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none;z-index:3}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{bottom:154px!important;max-width:calc(100vw - 12px)!important;overflow-x:auto!important;scrollbar-width:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar::-webkit-scrollbar{display:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar .slot{width:56px!important;height:56px!important;flex-basis:56px!important}
@media(max-width:700px){#hotbar.textured-hotbar .slot{width:48px!important;height:48px!important;flex-basis:48px!important}}
`;
        document.head.appendChild(style);
    }

    // main.js hides the hotbar while switching from the menu into the world.
    // Keep forcing it visible once the world is active, including when no body-class mutation fires.
    const forceHotbarVisible = () => {
        const inWorld = document.body.classList.contains("webminecraft-in-world");
        if (inWorld || !document.getElementById("mainMenu") || document.getElementById("mainMenu")?.style.display === "none") {
            hotbar.style.setProperty("display", "flex", "important");
            hotbar.style.setProperty("visibility", "visible", "important");
            hotbar.style.setProperty("opacity", "1", "important");
        }
    };
    forceHotbarVisible();
    setInterval(forceHotbarVisible, 250);
    new MutationObserver(forceHotbarVisible).observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    setupTexturedHotbar();
    setupInventory();

    const outline = createSelectionOutline();
    scene.add(outline);

    const updateHotbar = () => {
        document.querySelectorAll("#hotbar .slot").forEach((slot, index) => slot.classList.toggle("selected", index === selectedSlot));
    };

    document.addEventListener("keydown", event => {
        const number = Number(event.key);
        if (number >= 1 && number <= 9) {
            selectedSlot = number - 1;
            updateHotbar();
        }
    });

    document.querySelectorAll("#hotbar .slot").forEach((slot, index) => {
        slot.addEventListener("pointerdown", event => {
            event.preventDefault();
            event.stopPropagation();
            selectedSlot = index;
            updateHotbar();
        });
    });

    document.addEventListener("mousedown", event => {
        if (document.body.classList.contains("mobile-mode")) return;
        if (document.pointerLockElement !== document.body) return;
        if (event.button === 0) breakBlock();
        if (event.button === 2) placeBlock();
    });
    document.addEventListener("contextmenu", event => event.preventDefault());

    function pollTouchActions() {
        const mobile = document.body.classList.contains("mobile-mode");
        const punch = mobile && !!touchInput.punchPressed;
        const place = mobile && !!touchInput.placePressed;
        if (punch && !lastPunch) breakBlock();
        if (place && !lastPlace) placeBlock();
        lastPunch = punch;
        lastPlace = place;
        requestAnimationFrame(pollTouchActions);
    }
    pollTouchActions();

    function notifyBlockChange(x, y, z, type) {
        window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y, z, type } }));
    }

    function breakBlock() {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) return;
        const type = getBlockAt(target.x, target.y, target.z);
        if (!type || type === BLOCK.AIR || type === BLOCK.BEDROCK) return;
        if (!setBlockAt(target.x, target.y, target.z, BLOCK.AIR)) return;
        sendBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        notifyBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        giveBrokenBlock(type);
        createBreakParticles(scene, new THREE.Vector3(target.x, target.y, target.z), type, BLOCK);
    }

    function placeBlock() {
        const itemId = getSelectedItemId(selectedSlot);
        if (!itemId) return;
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) return;
        const point = target.hit.point.clone().add(target.normal.clone().multiplyScalar(0.51));
        const x = Math.floor(point.x + 0.5);
        const y = Math.floor(point.y + 0.5);
        const z = Math.floor(point.z + 0.5);
        if (getBlockAt(x, y, z) !== BLOCK.AIR) return;
        if (playerOverlapsBlock({ x, y, z }, camera)) return;
        if (!setBlockAt(x, y, z, itemId)) return;
        if (!consumeSelected(selectedSlot)) {
            setBlockAt(x, y, z, BLOCK.AIR);
            return;
        }
        sendBlockChange(x, y, z, itemId);
        notifyBlockChange(x, y, z, itemId);
    }

    function updateSelection() {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) outline.visible = false;
        else {
            outline.position.set(target.x, target.y, target.z);
            outline.visible = true;
        }
        requestAnimationFrame(updateSelection);
    }
    updateSelection();
    updateHotbar();
}

function getTargetBlock(scene, camera, BLOCK) {
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(CENTER, camera);
    raycaster.near = 0.01;
    raycaster.far = INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(scene.children, true);
    const hit = hits.find(entry => entry.object?.userData?.isChunk === true && !!entry.face);
    raycaster.near = 0;
    raycaster.far = Infinity;
    if (!hit || hit.distance > INTERACTION_DISTANCE) return null;
    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone().sub(normal.clone().multiplyScalar(0.01));
    const x = Math.floor(point.x + 0.5);
    const y = Math.floor(point.y + 0.5);
    const z = Math.floor(point.z + 0.5);
    const type = getBlockAt(x, y, z);
    if (!type || type === BLOCK.AIR) return null;
    return { x, y, z, type, normal, hit };
}

function createSelectionOutline() {
    const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.95, depthTest: false });
    const outline = new THREE.Mesh(geometry, material);
    outline.visible = false;
    outline.renderOrder = 1000;
    return outline;
}

function getParticleColor(blockType, BLOCK) {
    if (blockType === BLOCK.GRASS) return 0x67a74d;
    if (blockType === BLOCK.DIRT) return 0x8b5a34;
    if (blockType === BLOCK.STONE) return 0x7d7d7d;
    if (blockType === BLOCK.COBBLESTONE) return 0x6f6f6f;
    if (blockType === BLOCK.GRAVEL) return 0x88847d;
    if (blockType === BLOCK.SAND) return 0xd9c486;
    if (blockType === BLOCK.SANDSTONE) return 0xc9ad70;
    if (blockType === BLOCK.OAK || blockType === BLOCK.OAK_PLANKS) return 0x9a6b3f;
    if (blockType === BLOCK.LEAVES) return 0x4d8d3d;
    if (blockType === BLOCK.COAL_ORE) return 0x555555;
    if (blockType === BLOCK.IRON_ORE) return 0x9a8d84;
    if (blockType === BLOCK.SNOW) return 0xe9f1f5;
    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;
    return 0xb0b0b0;
}

function createBreakParticles(scene, center, blockType, BLOCK) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const particles = [];
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
        const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: getParticleColor(blockType, BLOCK), transparent: true, opacity: 1 }));
        particle.position.copy(center).add(new THREE.Vector3((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7));
        particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 2.5, 1 + Math.random() * 2.2, (Math.random() - 0.5) * 2.5);
        particle.userData.createdAt = start;
        scene.add(particle);
        particles.push(particle);
    }
    const update = time => {
        let alive = false;
        for (const particle of particles) {
            if (!particle.parent) continue;
            const age = time - particle.userData.createdAt;
            if (age >= 500) {
                particle.parent.remove(particle);
                particle.material.dispose();
                continue;
            }
            alive = true;
            particle.userData.velocity.y -= 5.5 / 60;
            particle.position.addScaledVector(particle.userData.velocity, 1 / 60);
            particle.rotation.x += 0.12;
            particle.rotation.y += 0.1;
            particle.material.opacity = Math.max(0, 1 - age / 500);
        }
        if (alive) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

function playerOverlapsBlock(position, camera) {
    const halfWidth = 0.3;
    const playerHeight = 1.8;
    return camera.position.x - halfWidth < position.x + 0.5 && camera.position.x + halfWidth > position.x - 0.5 && camera.position.y - playerHeight < position.y + 0.5 && camera.position.y > position.y - 0.5 && camera.position.z - halfWidth < position.z + 0.5 && camera.position.z + halfWidth > position.z - 0.5;
}
