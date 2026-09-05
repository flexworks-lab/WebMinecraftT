import * as THREE from "three";

import {
    registerWorldBlock,
    removeWorldBlock,
    getBlockAt
} from "./world.js";

const raycaster = new THREE.Raycaster();
let selectedSlot = 0;

export function setupInteraction(
    scene,
    camera,
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
) {
    const materials = [
        grassMaterial,
        dirtMaterial,
        stoneMaterial,
        sandMaterial,
        oakLogMaterial,
        leavesMaterial,
        grassMaterial,
        dirtMaterial,
        stoneMaterial
    ];

    document.addEventListener("keydown", (event) => {
        const number = Number(event.key);

        if (number >= 1 && number <= 9) {
            selectedSlot = number - 1;
            updateHotbar();
        }
    });

    function updateHotbar() {
        document.querySelectorAll(".slot").forEach((slot, index) => {
            slot.classList.toggle("selected", index === selectedSlot);
        });
    }

    document.addEventListener("mousedown", (event) => {
        if (document.pointerLockElement !== document.body) return;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        const hits = raycaster.intersectObjects(scene.children, false);
        if (hits.length === 0) return;

        const hit = hits[0];
        const block = hit.object;

        if (block.geometry !== blockGeometry || block.userData.isWater) return;

        if (event.button === 0) {
            removeWorldBlock(block);
            scene.remove(block);
            return;
        }

        if (event.button !== 2 || !hit.face) return;

        const position = block.position.clone().add(hit.face.normal);
        position.x = Math.round(position.x);
        position.y = Math.round(position.y);
        position.z = Math.round(position.z);

        if (getBlockAt(position.x, position.y, position.z)) return;

        if (playerOverlapsBlock(position, camera)) return;

        const newBlock = new THREE.Mesh(
            blockGeometry,
            materials[selectedSlot]
        );

        newBlock.position.copy(position);
        newBlock.userData.isBlock = true;
        scene.add(newBlock);
        registerWorldBlock(newBlock);
    });

    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}

function playerOverlapsBlock(position, camera) {
    const halfWidth = 0.3;
    const playerHeight = 1.8;

    return (
        camera.position.x - halfWidth < position.x + 0.5 &&
        camera.position.x + halfWidth > position.x - 0.5 &&
        camera.position.y - playerHeight < position.y + 0.5 &&
        camera.position.y > position.y - 0.5 &&
        camera.position.z - halfWidth < position.z + 0.5 &&
        camera.position.z + halfWidth > position.z - 0.5
    );
}