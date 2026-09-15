import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";

const texturePath = file => `${import.meta.env.BASE_URL}textures/${encodeURIComponent(file)}`;
const DOOR_TEXTURE = new THREE.TextureLoader().load(texturePath("oak_door_bottom.png"));
const DOOR_TOP_TEXTURE = new THREE.TextureLoader().load(texturePath("oak_door_top.png"));
for (const texture of [DOOR_TEXTURE, DOOR_TOP_TEXTURE]) {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
}

let scene = null;
let camera = null;
let selected = false;
const doors = new Map();
const BLOCK = getBlockTypes();

function key(x, y, z) { return `${x},${y},${z}`; }

function createDoorMesh(x, y, z, facing = "z") {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.userData.isDoor = true;
    group.userData.doorBase = { x, y, z };
    group.userData.open = false;
    group.userData.facing = facing;

    const width = 0.86;
    const depth = 0.10;
    const bottom = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1, depth),
        new THREE.MeshPhongMaterial({ map: DOOR_TEXTURE, color: 0xffffff, side: THREE.DoubleSide })
    );
    const top = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1, depth),
        new THREE.MeshPhongMaterial({ map: DOOR_TOP_TEXTURE, color: 0xffffff, side: THREE.DoubleSide })
    );
    bottom.position.y = 0.5;
    top.position.y = 1.5;
    bottom.userData.isDoor = true;
    top.userData.isDoor = true;
    bottom.userData.doorBase = { x, y, z };
    top.userData.doorBase = { x, y, z };
    group.add(bottom, top);
    if (facing === "x") group.rotation.y = Math.PI / 2;
    scene.add(group);
    doors.set(key(x, y, z), group);
    return group;
}

function removeDoorMesh(x, y, z) {
    const group = doors.get(key(x, y, z));
    if (!group) return;
    scene.remove(group);
    group.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
            else object.material.dispose();
        }
    });
    doors.delete(key(x, y, z));
}

function syncDoorCollision(door, open) {
    const { x, y, z } = door.userData.doorBase;
    if (open) {
        setBlockAt(x, y, z, BLOCK.AIR);
        setBlockAt(x, y + 1, z, BLOCK.AIR);
    } else {
        if (getBlockAt(x, y, z) !== BLOCK.AIR || getBlockAt(x, y + 1, z) !== BLOCK.AIR) return false;
        setBlockAt(x, y, z, BLOCK.OAK_PLANKS);
        setBlockAt(x, y + 1, z, BLOCK.OAK_PLANKS);
    }
    return true;
}

function toggleDoor(door) {
    if (!door) return false;
    const nextOpen = !door.userData.open;
    if (!syncDoorCollision(door, nextOpen)) return false;
    door.userData.open = nextOpen;
    door.rotation.y = nextOpen
        ? (door.userData.facing === "x" ? -Math.PI / 2 : Math.PI / 2)
        : (door.userData.facing === "x" ? Math.PI / 2 : 0);
    return true;
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

function getDoorTarget() {
    if (!scene || !camera) return null;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = 5;
    const hits = raycaster.intersectObjects([...doors.values()], true);
    const hit = hits[0];
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
        setBlockAt(x, y, z, BLOCK.AIR);
        setBlockAt(x, y + 1, z, BLOCK.AIR);
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
    if (document.getElementById("doorSelectButton")) return;

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
    style.textContent = `
#doorSelectButton .doorIcon{display:block;width:28px;height:36px;background:url('${texturePath("oak_door_bottom.png")}') center/100% 100% no-repeat;image-rendering:pixelated}
#doorSelectButton .doorLabel{font:700 9px Arial,sans-serif;text-shadow:1px 1px 0 #000}
#doorSelectButton.selected{border-color:#fff;box-shadow:0 0 0 2px #222}
body.mobile-mode.webminecraft-in-world #doorSelectButton{bottom:76px}
body.webminecraft-in-world #doorSelectButton{display:flex}
body:not(.webminecraft-in-world) #doorSelectButton{display:none}
`;
    document.head.appendChild(style);
    document.body.appendChild(button);
    button.addEventListener("click", event => {
        event.preventDefault();
        selected = !selected;
        button.classList.toggle("selected", selected);
    });
}

export function placeDoor(target) {
    if (!scene || !camera || !target) return false;
    const normal = target.normal.clone().set(Math.round(target.normal.x), Math.round(target.normal.y), Math.round(target.normal.z));
    let x = target.x + normal.x;
    let y = target.y + normal.y;
    let z = target.z + normal.z;
    if (normal.y !== 0) return false;
    if (getBlockAt(x, y, z) !== BLOCK.AIR || getBlockAt(x, y + 1, z) !== BLOCK.AIR) return false;
    if (getBlockAt(x, y - 1, z) === BLOCK.AIR) return false;
    const facing = Math.abs(normal.x) > Math.abs(normal.z) ? "x" : "z";
    const door = createDoorMesh(x, y, z, facing);
    setBlockAt(x, y, z, BLOCK.OAK_PLANKS);
    setBlockAt(x, y + 1, z, BLOCK.OAK_PLANKS);
    selected = false;
    const button = document.getElementById("doorSelectButton");
    button?.classList.remove("selected");
    return !!door;
}

export function getDoorSelectionTarget() {
    return getDoorTarget();
}
