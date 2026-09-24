import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes, isSlabBlock, slabParentType, isStairBlock, stairShapeMask, stairOrientedType } from "./world.js";
import { touchInput, yaw } from "./controls.js";
import { sendBlockChange, sendSlabPlacement, sendPlayerAction } from "./multiplayerClient.js";
import { setupInventory, getSelectedItemId, consumeSelected } from "./inventory.js";
import { tryIgniteTNT, registerTNTPhysicsScene } from "./tnt.js";
import { setupDoorSystem, isDoorSelected, placeDoor, handleDoorTarget, getDoorSelectionTarget } from "./door.js";
import { startSurvivalMining, setMiningContext } from "./survivalMiningSystem.js";
import "./worldSave.js";
import "./heldBlock3D.js";
import { spawnBlockBreakParticles } from "./blockParticles.js";
import { setupCraftingTableMenu, openCraftingTableMenu } from "./craftingTableMenu.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const SURVIVAL_REACH = 4.5;
const CREATIVE_REACH = 12;
const CREATIVE_PLACE_TAP_MAX_MS = 180;
let selectedSlot = 0;


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
body.mobile-mode #webMinecraftCrosshair{display:none!important}
body.mobile-mode #crosshair{display:none!important}
`;
    document.head.appendChild(style);
    document.body.appendChild(crosshair);
    return crosshair;
}

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    registerTNTPhysicsScene(scene);
    setMiningContext(scene, camera);
    setupTexturedHotbar();
    setupInventory(camera);
    setupCraftingTableMenu();
    setupDoorSystem(scene, camera);
    positionMobileInventoryButton();
    const outline = createSelectionOutline();
    scene.add(outline);
    createCrosshair();
    const updateHotbar = () => {
        document.querySelectorAll("#hotbar .slot").forEach((slot, index) => slot.classList.toggle("selected", index === selectedSlot));
        window.dispatchEvent(new CustomEvent("webminecraft:selectedslot", { detail: { slot: selectedSlot } }));
    };
    document.addEventListener("keydown", event => {
        if (document.body.classList.contains("mobile-mode") && event.isTrusted) return;
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
        if (!document.body.classList.contains("webminecraft-in-world")) return;
        if (document.body.classList.contains("inventory-open")) return;
        if (document.body.classList.contains("crafting-table-open")) return;
        if (event.target instanceof Element && event.target.closest("#hotbar, #inventoryScreen, #doorSelectButton, button, input, select, textarea, a")) return;
        if (event.button === 0) {
            if (isSurvivalWorldActive()) {
                event.preventDefault();
                event.stopImmediatePropagation();
                startSurvivalMining(scene, camera);
                return;
            }
            breakBlock();
        }
        if (event.button === 2) {
            const target = getTargetBlock(scene, camera, BLOCK);
            if (target && getBlockAt(target.x, target.y, target.z) === BLOCK.CRAFTING_TABLE) {
                openCraftingTableMenu();
                return;
            }
            placeBlock();
        }
    });
    document.addEventListener("contextmenu", event => {
        if (document.body.classList.contains("webminecraft-in-world")) event.preventDefault();
    });
    function pollTouchActions() {
        const mobile = document.body.classList.contains("mobile-mode");
        if (mobile && touchInput.blockTapPending) {
            const ndcX = Number(touchInput.blockTapX) || 0;
            const ndcY = Number(touchInput.blockTapY) || 0;
            touchInput.blockTapPending = false;
            // Short grass is its own decorative mesh, so give mobile taps a
            // chance to break it before normal block placement runs.
            if (window.__webMinecraftTryBreakShortGrass?.(ndcX, ndcY)) return;
            if (isSurvivalWorldActive()) {
                const target = getTargetBlock(scene, camera, BLOCK, ndcX, ndcY);
                if (target && getBlockAt(target.x, target.y, target.z) === BLOCK.CRAFTING_TABLE) {
                    openCraftingTableMenu();
                } else {
                    placeBlock(ndcX, ndcY);
                }
            }
            else if (document.body.classList.contains("webminecraft-creative")) {
                const duration = Number(touchInput.blockTapDuration) || 0;
                if (duration <= CREATIVE_PLACE_TAP_MAX_MS) placeBlock(ndcX, ndcY);
                else breakBlock(ndcX, ndcY);
            }
        }
        positionMobileInventoryButton();
        requestAnimationFrame(pollTouchActions);
    }
    pollTouchActions();
    function isSurvivalWorldActive() {
        return document.body.classList.contains("webminecraft-survival");
    }
    function notifyBlockChange(x, y, z, type) {
        window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y, z, type } }));
    }
    function breakBlock(ndcX = 0, ndcY = 0) {
        if (window.__webminecraftMultiplayerRole === "visitor") {
            window.__webMinecraftChatAdd?.("Visitors cannot break blocks.", true);
            return;
        }
        if (handleDoorTarget("break")) {
            sendPlayerAction("mine");
            return;
        }
        const target = getTargetBlock(scene, camera, BLOCK, ndcX, ndcY);
        if (!target) return;
        const type = getBlockAt(target.x, target.y, target.z);
        if (!type || type === BLOCK.AIR || type === BLOCK.BEDROCK) return;
        if (!setBlockAt(target.x, target.y, target.z, BLOCK.AIR)) return;
        sendPlayerAction("mine");
        sendBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        notifyBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        createBreakParticles(scene, new THREE.Vector3(target.x, target.y, target.z), type, BLOCK);
    }
    function placeBlock(ndcX = 0, ndcY = 0) {
        if (window.__webminecraftMultiplayerRole === "visitor") {
            window.__webMinecraftChatAdd?.("Visitors cannot build or interact with blocks.", true);
            return;
        }
        const creative = document.body.classList.contains("webminecraft-creative");
        if (getDoorSelectionTarget()) {
            if (handleDoorTarget("use")) sendPlayerAction("place");
            return;
        }
        const itemId = getSelectedItemId(selectedSlot);
        if (!itemId) return;
        if (itemId === 17 || isDoorSelected()) {
            const target = getTargetBlock(scene, camera, BLOCK, ndcX, ndcY);
            if (!target) return;
            if (placeDoor(target)) {
                if (!creative && itemId === 17) consumeSelected(selectedSlot);
                sendPlayerAction("place");
            }
            return;
        }
        if (itemId >= 75 && itemId <= 84) {
            const target = getTargetBlock(scene, camera, BLOCK, ndcX, ndcY);
            if (!target) return;
            const normal = target.normal.clone().set(
                Math.round(target.normal.x),
                Math.round(target.normal.y),
                Math.round(target.normal.z)
            );
            const x = target.x + normal.x;
            const y = target.y + normal.y;
            const z = target.z + normal.z;
            if (getBlockAt(x, y, z) !== BLOCK.AIR) return;
            if (playerOverlapsBlock({ x, y, z }, camera)) return;
            // The stair facing value identifies the direction of the
            // raised/high side. Its low/open side is the opposite direction,
            // so using the camera's look direction makes the stair open toward
            // the player standing behind the block.
            const quarter = Math.round(Number(yaw) / (Math.PI / 2));
            const facing = ((quarter % 4) + 4) % 4;
            // Click the upper half of a block to place a bottom stair;
            // click the lower half to place an upside-down (TOP) stair.
            const hitYInBlock = target.hit?.point ? target.hit.point.y - target.y : 0;
            const half = normal.y > 0.5 ? 0 : normal.y < -0.5 ? 1 : (hitYInBlock < 0 ? 1 : 0);
            const placedType = stairOrientedType(itemId, facing, half);
            if (!isStairBlock(placedType) || !setBlockAt(x, y, z, placedType)) return;
            if (!creative && !consumeSelected(selectedSlot)) {
                setBlockAt(x, y, z, BLOCK.AIR);
                return;
            }
            sendPlayerAction("place");
            sendBlockChange(x, y, z, placedType);
            notifyBlockChange(x, y, z, placedType);
            return;
        }
        if (itemId === 16) {
            if (tryIgniteTNT(scene, camera, itemId, ndcX, ndcY)) {
                if (!creative) consumeSelected(selectedSlot);
                sendPlayerAction("place");
            }
            return;
        }
        if (itemId < 1 || itemId > 184 || itemId === 16 || itemId === 17) return;
        const target = getTargetBlock(scene, camera, BLOCK, ndcX, ndcY);
        if (!target) return;
        if (tryIgniteTNT(scene, camera, itemId, ndcX, ndcY)) {
            if (creative || consumeSelected(selectedSlot)) sendPlayerAction("place");
            return;
        }
        const normal = target.normal.clone().set(
            Math.round(target.normal.x),
            Math.round(target.normal.y),
            Math.round(target.normal.z)
        );
        const targetType = getBlockAt(target.x, target.y, target.z);
        // Two matching bottom slabs stack into the corresponding full block
        // when the second slab is placed against the top face.
        if (isSlabBlock(itemId) && isSlabBlock(targetType) && normal.y > 0.5 && itemId === targetType) {
            const fullBlock = slabParentType(itemId);
            if (!setBlockAt(target.x, target.y, target.z, fullBlock)) return;
            if (!creative && !consumeSelected(selectedSlot)) {
                setBlockAt(target.x, target.y, target.z, targetType);
                return;
            }
            sendPlayerAction("place");
            sendBlockChange(target.x, target.y, target.z, fullBlock);
            notifyBlockChange(target.x, target.y, target.z, fullBlock);
            return;
        }
        const x = target.x + normal.x;
        const y = target.y + normal.y;
        const z = target.z + normal.z;
        if (getBlockAt(x, y, z) !== BLOCK.AIR) return;
        if (playerOverlapsBlock({ x, y, z }, camera)) return;
        if (!setBlockAt(x, y, z, itemId)) return;
        if (!creative && !consumeSelected(selectedSlot)) { setBlockAt(x, y, z, BLOCK.AIR); return; }
        sendPlayerAction("place");
        if (isSlabBlock(itemId)) sendSlabPlacement(x, y, z, itemId);
        else sendBlockChange(x, y, z, itemId);
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
        const mobile = document.body.classList.contains("mobile-mode");
        const target = mobile && !touchInput.blockTouchActive
            ? null
            : getTargetBlock(
                scene,
                camera,
                BLOCK,
                mobile ? Number(touchInput.blockTouchX) || 0 : 0,
                mobile ? Number(touchInput.blockTouchY) || 0 : 0
            );
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

function getTargetBlock(scene, camera, BLOCK, ndcX = 0, ndcY = 0) {
    const doorTarget = getDoorSelectionTarget();
    if (doorTarget) return doorTarget;
    camera.updateMatrixWorld(true);
    const screenPoint = Number.isFinite(ndcX) && Number.isFinite(ndcY) && (ndcX !== 0 || ndcY !== 0) ? new THREE.Vector2(ndcX, ndcY) : CENTER;
    raycaster.setFromCamera(screenPoint, camera);
    raycaster.near = 0.01;
    const reach = document.body.classList.contains("webminecraft-creative") ? CREATIVE_REACH : SURVIVAL_REACH;
    raycaster.far = reach;
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
    if (!hit || hit.distance > reach) return null;
    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone();
    const voxel = {
        x: Math.floor(point.x - normal.x * 0.01 + 0.5),
        y: Math.floor(point.y - normal.y * 0.01 + 0.5),
        z: Math.floor(point.z - normal.z * 0.01 + 0.5)
    };
    return { hit, normal, x: voxel.x, y: voxel.y, z: voxel.z };
}

function makeBoxSelectionGeometry(){
    const geometry=new THREE.BufferGeometry();
    const vertices=new Float32Array([
        -0.501,-0.501,-0.501, 0.501,-0.501,-0.501, 0.501,-0.501,-0.501, 0.501,0.501,-0.501,
        0.501,0.501,-0.501, -0.501,0.501,-0.501, -0.501,0.501,-0.501, -0.501,-0.501,-0.501,
        -0.501,-0.501,0.501, 0.501,-0.501,0.501, 0.501,-0.501,0.501, 0.501,0.501,0.501,
        0.501,0.501,0.501, -0.501,0.501,0.501, -0.501,0.501,0.501, -0.501,-0.501,0.501,
        -0.501,-0.501,-0.501, -0.501,-0.501,0.501, 0.501,-0.501,-0.501, 0.501,-0.501,0.501,
        0.501,0.501,-0.501, 0.501,0.501,0.501, -0.501,0.501,-0.501, -0.501,0.501,0.501
    ]);
    geometry.setAttribute("position",new THREE.BufferAttribute(vertices,3));
    return geometry;
}

function makeStairSelectionGeometry(shapeMask,half=0){
    const occupied=new Set();
    const key=(layer,xi,zi)=>`${layer}:${xi}:${zi}`;
    for(let zi=0;zi<2;zi++)for(let xi=0;xi<2;xi++)occupied.add(key(0,xi,zi));
    for(let zi=0;zi<2;zi++)for(let xi=0;xi<2;xi++){
        if(shapeMask&(1<<(zi*2+xi)))occupied.add(key(1,xi,zi));
    }

    const positions=[];
    const edge=(a,b)=>positions.push(...a,...b);
    for(const cell of occupied){
        const[layer0,xi,zi]=cell.split(":").map(Number);
        const layer=half?1-layer0:layer0;
        const minX=-.502+xi*.5,maxX=minX+.5;
        const minZ=-.502+zi*.5,maxZ=minZ+.5;
        const minY=layer===0?-.502:0,maxY=layer===0?0:.502;
        const neighbors=[
            [layer0,xi+1,zi],[layer0,xi-1,zi],
            [layer0,xi,zi+1],[layer0,xi,zi-1],
            [layer0+1,xi,zi],[layer0-1,xi,zi]
        ];
        const occupiedLayerKeys=new Set();
        for(const item of occupied)occupiedLayerKeys.add(item);
        const faceNeighbors=[
            key(layer0,xi+1,zi),key(layer0,xi-1,zi),
            key(layer0,xi,zi+1),key(layer0,xi,zi-1),
            key(layer0+1,xi,zi),key(layer0-1,xi,zi)
        ];
        const corners=[
            [[maxX,minY,minZ],[maxX,maxY,minZ],[maxX,maxY,maxZ],[maxX,minY,maxZ]],
            [[minX,minY,maxZ],[minX,maxY,maxZ],[minX,maxY,minZ],[minX,minY,minZ]],
            [[minX,maxY,maxZ],[maxX,maxY,maxZ],[maxX,maxY,minZ],[minX,maxY,minZ]],
            [[minX,minY,minZ],[maxX,minY,minZ],[maxX,minY,maxZ],[minX,minY,maxZ]],
            [[maxX,minY,maxZ],[maxX,maxY,maxZ],[minX,maxY,maxZ],[minX,minY,maxZ]],
            [[minX,minY,minZ],[minX,maxY,minZ],[maxX,maxY,minZ],[maxX,minY,minZ]]
        ];
        for(let fi=0;fi<6;fi++){
            if(occupiedLayerKeys.has(faceNeighbors[fi]))continue;
            if(layer0===1&&fi===3)continue;
            const face=corners[fi];
            edge(face[0],face[1]); edge(face[1],face[2]);
            edge(face[2],face[3]); edge(face[3],face[0]);
        }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    return geometry;
}
function createSelectionOutline() {
    const group = new THREE.Group();
    group.name = "blockSelectionOutline";
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9 });
    const lines = new THREE.LineSegments(makeBoxSelectionGeometry(), edgeMaterial);
    lines.name = "selectionEdges";
    group.add(lines);
    group.userData.selectionEdges = lines;
    group.userData.selectionShape = "box";
    return group;
}

function updateSelectionOutline(outline, target, camera) {
    outline.position.set(target.x, target.y, target.z);
    const type = getBlockAt(target.x, target.y, target.z);
    const edges = outline.userData.selectionEdges;
    if (!edges) return;

    if (isStairBlock(type)) {
        const shapeMask = stairShapeMask(type,target.x,target.y,target.z);
        const half = Number(type) >= 115 ? 1 : 0;
        const shapeKey = `stair:${shapeMask}:${half}`;
        if (outline.userData.selectionShape !== shapeKey) {
            edges.geometry.dispose();
            edges.geometry = makeStairSelectionGeometry(shapeMask,half);
            outline.userData.selectionShape = shapeKey;
        }
        outline.scale.set(1,1,1);
        return;
    }

    if (outline.userData.selectionShape !== "box") {
        edges.geometry.dispose();
        edges.geometry = makeBoxSelectionGeometry();
        outline.userData.selectionShape = "box";
    }

    const slab = isSlabBlock(type);
    outline.scale.set(1, slab ? 0.5 : 1, 1);
    outline.position.y += slab ? -0.25 : 0;
}
function playerOverlapsBlock(pos, camera) {
    const p = camera.position;
    const slab = isSlabBlock(getBlockAt(pos.x, pos.y, pos.z));
    const maxY = slab ? pos.y : pos.y + 0.5;
    return p.x > pos.x - 0.3 && p.x < pos.x + 1.3 && p.z > pos.z - 0.3 && p.z < pos.z + 1.3 && p.y > pos.y - 0.5 && p.y < maxY + 1.3;
}

function createBreakParticles(scene, center, type, BLOCK) {
    spawnBlockBreakParticles(scene, center, type);
}