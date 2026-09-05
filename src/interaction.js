import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";

const raycaster = new THREE.Raycaster();
let selectedSlot = 0;

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    const materials = [
        BLOCK.GRASS,
        BLOCK.DIRT,
        BLOCK.STONE,
        BLOCK.COBBLESTONE,
        BLOCK.GRAVEL,
        BLOCK.SAND,
        BLOCK.SANDSTONE,
        BLOCK.OAK,
        BLOCK.LEAVES
    ];

    document.addEventListener("keydown", (event) => {
        const number = Number(event.key);
        if (number >= 1 && number <= 9) {
            selectedSlot = number - 1;
            document.querySelectorAll(".slot").forEach((slot, index) => slot.classList.toggle("selected", index === selectedSlot));
        }
    });

    document.addEventListener("mousedown", (event) => {
        if (document.pointerLockElement !== document.body) return;
        if (event.button !== 0 && event.button !== 2) return;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects(scene.children, false);
        const hit = hits.find((entry) => entry.object.userData?.isChunk);
        if (!hit || !hit.face) return;

        if (event.button === 0) {
            const point = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.01));
            const x = Math.floor(point.x + 0.5);
            const y = Math.floor(point.y + 0.5);
            const z = Math.floor(point.z + 0.5);
            if (getBlockAt(x, y, z)) setBlockAt(x, y, z, BLOCK.AIR);
            return;
        }

        const point = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.51));
        const x = Math.floor(point.x + 0.5);
        const y = Math.floor(point.y + 0.5);
        const z = Math.floor(point.z + 0.5);

        if (getBlockAt(x, y, z)) return;
        if (playerOverlapsBlock({ x, y, z }, camera)) return;
        setBlockAt(x, y, z, materials[selectedSlot]);
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());
}

function playerOverlapsBlock(position, camera) {
    const halfWidth = 0.3;
    const playerHeight = 1.8;
    return camera.position.x - halfWidth < position.x + 0.5 &&
        camera.position.x + halfWidth > position.x - 0.5 &&
        camera.position.y - playerHeight < position.y + 0.5 &&
        camera.position.y > position.y - 0.5 &&
        camera.position.z - halfWidth < position.z + 0.5 &&
        camera.position.z + halfWidth > position.z - 0.5;
}
