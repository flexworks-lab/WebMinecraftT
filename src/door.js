import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { sendBlockChange } from "./multiplayerClient.js";

const texturePath = file => `${import.meta.env.BASE_URL}textures/${encodeURIComponent(file)}`;
const textureLoader = new THREE.TextureLoader();
const DOOR_TEXTURE = textureLoader.load(texturePath("oak_door_bottom.png"));
const DOOR_TOP_TEXTURE = textureLoader.load(texturePath("oak_door_top.png"));
for (const texture of [DOOR_TEXTURE, DOOR_TOP_TEXTURE]) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
}

let doorCompositeDataUrl = null;
let doorCompositeReady = false;
let scene = null;
let camera = null;
let selected = false;
const doors = new Map();
const openDoorStates = new Map();
const BLOCK = getBlockTypes();
const DOOR_BLOCK = BLOCK.OAK_DOOR ?? 17;
const DOOR_SCAN_RADIUS = 14;
const DOOR_SCAN_MIN_Y = -3;
const DOOR_SCAN_MAX_Y = 4;
let lastDoorScan = 0;

function key(x, y, z) { return `${x},${y},${z}`; }

function loadDoorImage(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = texturePath(file);
    });
}

async function buildFullDoorTexture() {
    try {
        const [bottom, top] = await Promise.all([
            loadDoorImage("oak_door_bottom.png"),
            loadDoorImage("oak_door_top.png")
        ]);
        const width = Math.max(bottom.naturalWidth || bottom.width, top.naturalWidth || top.width, 1);
        const height = Math.max(bottom.naturalHeight || bottom.height, top.naturalHeight || top.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height * 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(top, 0, 0, width, height);
        ctx.drawImage(bottom, 0, height, width, height);
        doorCompositeDataUrl = canvas.toDataURL("image/png");
        doorCompositeReady = true;
        refreshDoorInventoryIcons();
        updateHeldDoor();
    } catch (error) {
        console.warn("WebMinecraft: failed to combine oak door textures", error);
    }
}

function refreshDoorInventoryIcons() {
    if (!doorCompositeDataUrl) return;
    const selectors = [
        '[data-item-id="17"] .catalogTexture',
        '[data-item-id="17"] .hotbarTexture',
        '[data-item-id="17"] .inventoryTexture',
        '.catalogTexture[style*="oak_door_bottom"]',
        '.hotbarTexture[style*="oak_door_bottom"]',
        '.inventoryTexture[style*="oak_door_bottom"]'
    ];
    document.querySelectorAll(selectors.join(",")).forEach(element => {
        element.style.backgroundImage = `url("${doorCompositeDataUrl}")`;
        element.style.backgroundSize = "100% 100%";
        element.style.backgroundPosition = "center";
        element.style.backgroundRepeat = "no-repeat";
        element.style.imageRendering = "pixelated";
    });
}

function makeHeldDoorTexture(image) {
    const texture = new THREE.CanvasTexture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
}

function getHeldRoot() {
    return camera?.getObjectByName("WebMinecraftHeldBlock") || null;
}

let heldDoorGroup = null;
function updateHeldDoor() {
    const root = getHeldRoot();
    if (!root || !doorCompositeReady || !doorCompositeDataUrl) return;
    const slot = Number.isInteger(window.webMinecraftSelectedSlot) ? window.webMinecraftSelectedSlot : 0;
    const selectedSlot = document.querySelectorAll("#hotbar .slot")[slot];
    const itemId = Number(selectedSlot?.dataset.itemId || selectedSlot?.getAttribute("data-item-id") || 0);
    const isDoor = itemId === DOOR_BLOCK || !!selectedSlot?.querySelector('.hotbarTexture[style*="oak_door_bottom"]');
    if (!isDoor) {
        if (heldDoorGroup) heldDoorGroup.visible = false;
        return;
    }
    if (!heldDoorGroup) {
        const image = new Image();
        image.onload = () => {
            if (heldDoorGroup) return;
            const texture = makeHeldDoorTexture(image);
            heldDoorGroup = new THREE.Group();
            heldDoorGroup.name = "HeldOakDoor";
            const materials = Array.from({ length: 6 }, () => new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.08), materials);
            mesh.position.set(-0.04, 0.28, -0.24);
            mesh.rotation.set(0.08, -0.22, 0.10);
            heldDoorGroup.add(mesh);
            root.add(heldDoorGroup);
            heldDoorGroup.visible = true;
        };
        image.src = doorCompositeDataUrl;
    } else {
        heldDoorGroup.visible = true;
    }
}

function createDoorMesh(x, y, z, facing = "z", openAngle = 0) {
    if (!scene) return null;
    const group = new THREE.Group();
    const hinge = facing === "x"
        ? new THREE.Vector3(x, y, z + 0.43)
        : new THREE.Vector3(x - 0.43, y, z);
    group.position.copy(hinge);
    group.rotation.y = facing === "x" ? Math.PI / 2 : 0;
    group.userData.isDoor = true;
    group.userData.doorBase = { x, y, z };
    const preservedAngle = openAngle || openDoorStates.get(key(x, y, z)) || 0;
    group.userData.open = preservedAngle !== 0;
    group.userData.openAngle = preservedAngle;
    group.userData.facing = facing;
    group.userData.hinge = hinge.clone();

    const panel = new THREE.Group();
    panel.rotation.y = preservedAngle;

    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 1, 0.10),
        new THREE.MeshPhongMaterial({ map: DOOR_TEXTURE, color: 0xffffff, side: THREE.DoubleSide })
    );
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 1, 0.10),
        new THREE.MeshPhongMaterial({ map: DOOR_TOP_TEXTURE, color: 0xffffff, side: THREE.DoubleSide })
    );
    bottom.position.set(0.43, 0.5, 0);
    top.position.set(0.43, 1.5, 0);
    for (const part of [bottom, top]) {
        part.userData.isDoor = true;
        part.userData.doorBase = { x, y, z };
        panel.add(part);
    }
    group.add(panel);
    scene.add(group);
    doors.set(key(x, y, z), group);
    return group;
}

function removeDoorMesh(x, y, z) {
    const group = doors.get(key(x, y, z));
    if (!group) return;
    scene?.remove(group);
    group.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
    });
    doors.delete(key(x, y, z));
}

function updateDoorCollisionState(door) {
    if (!door) return false;
    const { x, y, z } = door.userData.doorBase;
    const k = key(x, y, z);
    if (door.userData.open) openDoorStates.set(k, door.userData.openAngle || Math.PI / 2);
    else openDoorStates.delete(k);
    return true;
}

function toggleDoor(door) {
    if (!door) return false;
    const { x, z } = door.userData.doorBase;
    if (door.userData.open) {
        door.userData.open = false;
        door.userData.openAngle = 0;
    } else {
        const side = door.userData.facing === 'x' ? camera.position.x - x : camera.position.z - z;
        door.userData.open = true;
        door.userData.openAngle = side >= 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    updateDoorCollisionState(door);
    const panel = door.children[0];
    if (panel) panel.rotation.y = door.userData.openAngle;
    return true;
}

export function isDoorBlocking(x, y, z) {
    return !openDoorStates.has(key(x, y, z));
}

function getDoorFromObject(object) {
    let current = object;
    while (current) {
        if (current.userData?.isDoor && current.userData?.doorBase) {
            const { x, y, z } = current.userData.doorBase;
            return doors.get(key(x, y, z)) || null;
        }
        current = current.parent;
    }
    return null;
}

function inferFacingFromWorld(x, y, z) {
    const sideX = getBlockAt(x + 1, y, z) === DOOR_BLOCK || getBlockAt(x - 1, y, z) === DOOR_BLOCK;
    const sideZ = getBlockAt(x, y, z + 1) === DOOR_BLOCK || getBlockAt(x, y, z - 1) === DOOR_BLOCK;
    if (sideX && !sideZ) return "z";
    if (sideZ && !sideX) return "x";
    return "z";
}

function reconcileDoors(force = false) {
    if (!scene || !camera) return;
    const now = performance.now();
    if (!force && now - lastDoorScan < 400) return;
    lastDoorScan = now;
    const cx = Math.floor(camera.position.x);
    const cy = Math.floor(camera.position.y - 1);
    const cz = Math.floor(camera.position.z);
    const wanted = new Set();
    for (let x = cx - DOOR_SCAN_RADIUS; x <= cx + DOOR_SCAN_RADIUS; x++) {
        for (let z = cz - DOOR_SCAN_RADIUS; z <= cz + DOOR_SCAN_RADIUS; z++) {
            for (let y = cy + DOOR_SCAN_MIN_Y; y <= cy + DOOR_SCAN_MAX_Y; y++) {
                if (getBlockAt(x, y, z) !== DOOR_BLOCK || getBlockAt(x, y + 1, z) !== DOOR_BLOCK) continue;
                if (getBlockAt(x, y - 1, z) === DOOR_BLOCK) continue;
                const k = key(x, y, z);
                wanted.add(k);
                if (!doors.has(k)) createDoorMesh(x, y, z, inferFacingFromWorld(x, y, z));
            }
        }
    }
    for (const [k, door] of doors) {
        const base = door.userData.doorBase;
        const far = Math.max(Math.abs(base.x - cx), Math.abs(base.z - cz));
        if (far > DOOR_SCAN_RADIUS + 3 || !getBlockAt(base.x, base.y, base.z) || !getBlockAt(base.x, base.y + 1, base.z)) {
            if (!wanted.has(k) && !door.userData.open) removeDoorMesh(base.x, base.y, base.z);
        }
    }
}

function getDoorTarget() {
    if (!scene || !camera) return null;
    reconcileDoors(true);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.near = 0.01;
    raycaster.far = 5;
    const hits = raycaster.intersectObjects([...doors.values()], true);
    raycaster.near = 0;
    raycaster.far = Infinity;
    const hit = hits.find(entry => entry.distance <= 5);
    if (!hit) return null;
    const door = getDoorFromObject(hit.object);
    if (!door) return null;
    const base = door.userData.doorBase;
    return { door, x: base.x, y: base.y, z: base.z, hit, normal: hit.face?.normal?.clone() || new THREE.Vector3(0, 0, 1), isDoor: true };
}

export function handleDoorTarget(action) {
    const target = getDoorTarget();
    if (!target) return false;
    if (action === "break") {
        const { x, y, z } = target;
        openDoorStates.delete(key(x, y, z));
        setBlockAt(x, y, z, BLOCK.AIR);
        setBlockAt(x, y + 1, z, BLOCK.AIR);
        sendBlockChange(x, y, z, BLOCK.AIR);
        sendBlockChange(x, y + 1, z, BLOCK.AIR);
        window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y, z, type: BLOCK.AIR } }));
        window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y: y + 1, z, type: BLOCK.AIR } }));
        removeDoorMesh(x, y, z);
        return true;
    }
    if (action === "use") return toggleDoor(target.door);
    return false;
}

export function isDoorSelected() { return selected; }

export function setupDoorSystem(nextScene, nextCamera) {
    scene = nextScene;
    camera = nextCamera;
    if (!document.getElementById("doorSelectButton")) {
        const button = document.createElement("button");
        button.id = "doorSelectButton";
        button.type = "button";
        button.title = "Oak Door";
        button.setAttribute("aria-label", "Oak Door");
        button.innerHTML = `<span class="doorIcon"></span><span class="doorLabel">Door</span>`;
        Object.assign(button.style, {
            position: "fixed", left: "50%", bottom: "84px", transform: "translateX(-50%)",
            width: "58px", height: "58px", padding: "4px", display: "none", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "2px", zIndex: "10001",
            border: "2px solid #555", background: "rgba(35,35,35,.96)", color: "#fff",
            cursor: "pointer", imageRendering: "pixelated"
        });
        const style = document.createElement("style");
        style.textContent = `#doorSelectButton .doorIcon{display:block;width:28px;height:36px;background:url('${texturePath("oak_door_bottom.png")}') center/100% 100% no-repeat;image-rendering:pixelated}#doorSelectButton .doorLabel{font:700 9px Arial,sans-serif;text-shadow:1px 1px 0 #000}#doorSelectButton.selected{border-color:#fff;box-shadow:0 0 0 2px #222}body.mobile-mode.webminecraft-in-world #doorSelectButton{bottom:76px}body.webminecraft-in-world #doorSelectButton{display:flex}body:not(.webminecraft-in-world) #doorSelectButton{display:none}`;
        document.head.appendChild(style);
        document.body.appendChild(button);
        button.addEventListener("click", event => {
            event.preventDefault();
            selected = !selected;
            button.classList.toggle("selected", selected);
        });
    }
    document.addEventListener("webminecraft:selectedslot", updateHeldDoor);
    updateHeldDoor();
    reconcileDoors(true);
}

export function placeDoor(target) {
    if (!scene || !camera || !target) return false;
    const normal = target.normal.clone().set(Math.round(target.normal.x), Math.round(target.normal.y), Math.round(target.normal.z));
    if (normal.y < 0) return false;
    const x = target.x + normal.x;
    const y = target.y + normal.y;
    const z = target.z + normal.z;
    if (getBlockAt(x, y, z) !== BLOCK.AIR || getBlockAt(x, y + 1, z) !== BLOCK.AIR) return false;
    if (getBlockAt(x, y - 1, z) === BLOCK.AIR) return false;
    const facing = Math.abs(normal.x) > Math.abs(normal.z) ? "x" : "z";
    openDoorStates.delete(key(x, y, z));
    if (!setBlockAt(x, y, z, DOOR_BLOCK)) return false;
    if (!setBlockAt(x, y + 1, z, DOOR_BLOCK)) {
        setBlockAt(x, y, z, BLOCK.AIR);
        return false;
    }
    createDoorMesh(x, y, z, facing);
    sendBlockChange(x, y, z, DOOR_BLOCK);
    sendBlockChange(x, y + 1, z, DOOR_BLOCK);
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y, z, type: DOOR_BLOCK } }));
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", { detail: { x, y: y + 1, z, type: DOOR_BLOCK } }));
    selected = false;
    document.getElementById("doorSelectButton")?.classList.remove("selected");
    return true;
}

export function getDoorSelectionTarget() { return getDoorTarget(); }

buildFullDoorTexture();

const inventoryIconObserver = new MutationObserver(refreshDoorInventoryIcons);
if (document.body) inventoryIconObserver.observe(document.body, { childList: true, subtree: true });
else window.addEventListener("DOMContentLoaded", () => inventoryIconObserver.observe(document.body, { childList: true, subtree: true }), { once: true });
