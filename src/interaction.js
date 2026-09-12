import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange, sendPlayerAction } from "./multiplayerClient.js";
import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";
import { tryIgniteTNT, registerTNTPhysicsScene } from "./tnt.js";
import "./worldSave.js";
import "./heldBlock3D.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const INTERACTION_DISTANCE = 5;
let selectedSlot = 0;
let lastPunch = false;
let lastPlace = false;

function setupTexturedHotbar() {
    let hotbar = document.getElementById("hotbar");
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
    while (hotbar.querySelectorAll(".slot").length < 9) {
        const slot = document.createElement("div");
        slot.className = "slot";
        hotbar.appendChild(slot);
    }
    hotbar.classList.add("textured-hotbar");
    hotbar.style.removeProperty("display");
    hotbar.style.removeProperty("visibility");
    hotbar.style.removeProperty("opacity");
    hotbar.style.setProperty("pointer-events", "auto", "important");
    hotbar.querySelectorAll(".slot").forEach((slot, index) => {
        slot.title = `${index + 1}`;
        slot.setAttribute("aria-label", `Hotbar slot ${index + 1}`);
        slot.innerHTML = `<span class="hotbarNumber">${index + 1}</span>`;
    });
    if (!document.getElementById("webMinecraftTexturedHotbarStyles")) {
        const style = document.createElement("style");
        style.id = "webMinecraftTexturedHotbarStyles";
        style.textContent = `
#hotbar.textured-hotbar{position:fixed!important;left:50%!important;bottom:20px!important;transform:translateX(-50%)!important;display:flex!important;gap:0!important;padding:4px!important;background:rgba(25,25,25,.96)!important;border:3px solid #111!important;box-shadow:inset 2px 2px 0 #777,inset -2px -2px 0 #333,0 3px 0 rgba(0,0,0,.65)!important;z-index:10000!important;image-rendering:pixelated;pointer-events:auto!important}
body:not(.webminecraft-in-world) #hotbar.textured-hotbar{display:none!important}
body.inventory-open #hotbar.textured-hotbar{display:none!important}
#savedWorlds{z-index:20000!important}
#savedWorlds:not([style*="display: none"]) ~ #hotbar.textured-hotbar{display:none!important}
#hotbar.textured-hotbar .slot{position:relative;width:52px!important;height:52px!important;flex:0 0 52px!important;padding:0!important;margin:0!important;border:2px solid #555!important;background:#222!important;overflow:hidden;cursor:pointer;image-rendering:pixelated}
#hotbar.textured-hotbar .slot.selected{border:3px solid #fff!important;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111!important;z-index:2}
#hotbar.textured-hotbar .hotbarNumber{position:absolute;left:2px;top:1px;min-width:13px;height:14px;padding:0 2px;color:#fff;font:11px/14px Arial,sans-serif;font-weight:700;text-align:center;text-shadow:1px 1px 0 #000;background:rgba(0,0,0,.45);pointer-events:none;z-index:3}
#hotbar.textured-hotbar .hotbarCount{position:absolute;right:3px;bottom:1px;color:#fff;font:bold 13px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none;z-index:3}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{left:50%!important;bottom:8px!important;transform:translateX(-50%)!important;z-index:10000!important;max-width:calc(100vw - 92px)!important;overflow-x:auto!important;scrollbar-width:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar::-webkit-scrollbar{display:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar .slot{width:56px!important;height:56px!important;flex-basis:56px!important}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar + #inventoryButton{z-index:10001!important}
@media(max-width:700px){#hotbar.textured-hotbar .slot{width:48px!important;height:48px!important;flex-basis:48px!important}}
`;
        document.head.appendChild(style);
    }
}

function createCrosshair() {
    let crosshair = document.getElementById("webMinecraftCrosshair");
    if (crosshair) return crosshair;
    crosshair = document.createElement("div");
    crosshair.id = "webMinecraftCrosshair";
    crosshair.setAttribute("aria-hidden", "true");
    crosshair.innerHTML = "<span></span><span></span>";
    crosshair.style.cssText = "position:fixed;left:50%;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);pointer-events:none;z-index:9999;";
    const style = document.createElement("style");
    style.id = "webMinecraftCrosshairStyles";
    style.textContent = `
#webMinecraftCrosshair span{position:absolute;display:block;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.8)}
#webMinecraftCrosshair span:first-child{left:1px;right:1px;top:8px;height:2px}
#webMinecraftCrosshair span:last-child{top:1px;bottom:1px;left:8px;width:2px}
body.webminecraft-in-world #webMinecraftCrosshair{display:block}
body:not(.webminecraft-in-world) #webMinecraftCrosshair{display:none}
`;
    document.head.appendChild(style);
    document.body.appendChild(crosshair);
    return crosshair;
}

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    registerTNTPhysicsScene(scene);
    setupTexturedHotbar();
    setupInventory(camera);
    positionMobileInventoryButton();
    const outline = createSelectionOutline();
    scene.add(outline);
    createCrosshair();
    const updateHotbar = () => {
        document.querySelectorAll("#hotbar .slot").forEach((slot, index) => slot.classList.toggle("selected", index === selectedSlot));
        window.dispatchEvent(new CustomEvent("webminecraft:selectedslot", { detail: { slot: selectedSlot } }));
    };
    document.addEventListener("keydown", event => {
        const number = Number(event.key);
        if (number >= 1 && number <= 9) { selectedSlot = number - 1; updateHotbar(); }
    });
    document.querySelectorAll("#hotbar .slot").forEach((slot, index) => {
        slot.addEventListener("pointerdown", event => {
            event.preventDefault(); event.stopPropagation(); selectedSlot = index; updateHotbar();
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
        positionMobileInventoryButton();
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
        sendPlayerAction("mine");
        sendBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        notifyBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        giveBrokenBlock(type);
        createBreakParticles(scene, new THREE.Vector3(target.x, target.y, target.z), type, BLOCK);
    }
    function placeBlock() {
        const itemId = getSelectedItemId(selectedSlot);
        if (!itemId) return;
        if (tryIgniteTNT(scene, camera, itemId)) {
            if (consumeSelected(selectedSlot)) sendPlayerAction("place");
            return;
        }
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) return;
        const point = target.hit.point.clone().add(target.normal.clone().multiplyScalar(0.51));
        const x = Math.floor(point.x + 0.5);
        const y = Math.floor(point.y + 0.5);
        const z = Math.floor(point.z + 0.5);
        if (getBlockAt(x, y, z) !== BLOCK.AIR) return;
        if (playerOverlapsBlock({ x, y, z }, camera)) return;
        if (!setBlockAt(x, y, z, itemId)) return;
        if (!consumeSelected(selectedSlot)) { setBlockAt(x, y, z, BLOCK.AIR); return; }
        sendPlayerAction("place");
        sendBlockChange(x, y, z, itemId);
        notifyBlockChange(x, y, z, itemId);
    }
    function positionMobileInventoryButton() {
        if (!document.body.classList.contains("mobile-mode") || !document.body.classList.contains("webminecraft-in-world")) return;
        const hotbar = document.getElementById("hotbar");
        const button = document.getElementById("inventoryButton");
        if (!hotbar || !button || hotbar.offsetParent === null) return;
        const rect = hotbar.getBoundingClientRect();
        const size = Math.max(rect.height, 48);
        button.style.setProperty("position", "fixed", "important");
        button.style.setProperty("left", `${Math.max(6, rect.left - size - 8)}px`, "important");
        button.style.setProperty("top", `${rect.top + (rect.height - size) / 2}px`, "important");
        button.style.setProperty("width", `${size}px`, "important");
        button.style.setProperty("height", `${size}px`, "important");
        button.style.setProperty("right", "auto", "important");
        button.style.setProperty("bottom", "auto", "important");
        button.style.setProperty("z-index", "10001", "important");
    }
    function updateSelection() {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) outline.visible = false;
        else {
            updateSelectionOutline(outline, target, camera);
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
    const hit = hits.find(entry => {
        if (!entry.object?.userData?.isChunk || !entry.face) return false;
        let object = entry.object;
        while (object) {
            if (object.userData?.isWater === true) return false;
            object = object.parent;
        }
        return true;
    });
    raycaster.near = 0;
    raycaster.far = Infinity;
    if (!hit || hit.distance > INTERACTION_DISTANCE) return null;
    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone();
    const voxel = {
        x: Math.floor(point.x - normal.x * 0.01 + 0.5),
        y: Math.floor(point.y - normal.y * 0.01 + 0.5),
        z: Math.floor(point.z - normal.z * 0.01 + 0.5)
    };
    return { hit, normal, x: voxel.x, y: voxel.y, z: voxel.z };
}

function createSelectionOutline() {
    const group = new THREE.Group();
    group.name = "blockSelectionOutline";
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 });
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -0.501,-0.501,-0.501, 0.501,-0.501,-0.501, 0.501,-0.501,-0.501, 0.501,0.501,-0.501,
        0.501,0.501,-0.501, -0.501,0.501,-0.501, -0.501,0.501,-0.501, -0.501,-0.501,-0.501,
        -0.501,-0.501,0.501, 0.501,-0.501,0.501, 0.501,-0.501,0.501, 0.501,0.501,0.501,
        0.501,0.501,0.501, -0.501,0.501,0.501, -0.501,0.501,0.501, -0.501,-0.501,0.501,
        -0.501,-0.501,-0.501, -0.501,-0.501,0.501, 0.501,-0.501,-0.501, 0.501,-0.501,0.501,
        0.501,0.501,-0.501, 0.501,0.501,0.501, -0.501,0.501,-0.501, -0.501,0.501,0.501
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const lines = new THREE.LineSegments(geometry, edgeMaterial);
    lines.name = "selectionEdges";
    group.add(lines);
    group.visible = false;
    return group;
}

function updateSelectionOutline(outline, target, camera) {
    outline.position.set(target.x, target.y, target.z);
    const facing = target.normal;
    const lines = outline.getObjectByName("selectionEdges");
    if (!lines) return;
    lines.material.opacity = 0.9;
    const dot = camera.getWorldDirection(new THREE.Vector3()).dot(facing);
    if (Math.abs(dot) < 0.22) lines.material.opacity = 0.9;
    lines.visible = true;
}

function playerOverlapsBlock(block) {
    const player = camera.position;
    return Math.abs(player.x - block.x) < 0.8 && Math.abs(player.z - block.z) < 0.8 && player.y > block.y - 0.9 && player.y < block.y + 2.1;
}

function createBreakParticles(scene, position, type, BLOCK) {
    const count = type === BLOCK.TNT ? 12 : 6;
    const group = new THREE.Group();
    group.position.copy(position);
    for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xaaaaaa }));
        mesh.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
        mesh.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5);
        group.add(mesh);
    }
    scene.add(group);
    const start = performance.now();
    const animate = now => {
        const t = (now - start) / 700;
        if (t >= 1) { scene.remove(group); group.traverse(obj => obj.geometry?.dispose()); return; }
        group.children.forEach(mesh => {
            mesh.position.addScaledVector(mesh.userData.velocity, 1 / 60);
            mesh.userData.velocity.y -= 0.03;
            mesh.rotation.x += 0.1;
            mesh.rotation.y += 0.1;
            mesh.material.opacity = 1 - t;
            mesh.material.transparent = true;
        });
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
}
