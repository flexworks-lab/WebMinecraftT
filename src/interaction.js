import * as THREE from "three";

import {
    registerWorldBlock,
    removeWorldBlock
} from "./world.js";

const raycaster =
    new THREE.Raycaster();

let selectedSlot = 0;


export function setupInteraction(
    scene,
    camera,
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial
) {

    const materials = [

        grassMaterial,
        dirtMaterial,
        stoneMaterial,

        grassMaterial,
        dirtMaterial,
        stoneMaterial,

        grassMaterial,
        dirtMaterial,
        stoneMaterial

    ];


    // =========================
    // HOTBAR
    // =========================

    document.addEventListener(
        "keydown",
        (event) => {

            const number =
                Number(event.key);

            if (
                number >= 1 &&
                number <= 9
            ) {

                selectedSlot =
                    number - 1;

                updateHotbar();
            }
        }
    );


    function updateHotbar() {

        const slots =
            document.querySelectorAll(
                ".slot"
            );

        slots.forEach(
            (slot, index) => {

                slot.classList.toggle(
                    "selected",
                    index ===
                    selectedSlot
                );
            }
        );
    }


    // =========================
    // MOUSE
    // =========================

    document.addEventListener(
        "mousedown",
        (event) => {

            raycaster.setFromCamera(
                new THREE.Vector2(0, 0),
                camera
            );


            const hits =
                raycaster.intersectObjects(
                    scene.children
                );


            if (
                hits.length === 0
            ) {
                return;
            }


            const hit =
                hits[0];

            const block =
                hit.object;


            if (
                block.geometry !==
                blockGeometry
            ) {
                return;
            }


            // =========================
            // BREAK
            // =========================

            if (
                event.button === 0
            ) {

                removeWorldBlock(
                    block
                );

                scene.remove(
                    block
                );
            }


            // =========================
            // PLACE
            // =========================

            if (
                event.button === 2
            ) {

                const position =
                    block.position.clone();


                position.add(
                    hit.face.normal
                );


                position.x =
                    Math.round(
                        position.x
                    );

                position.y =
                    Math.round(
                        position.y
                    );

                position.z =
                    Math.round(
                        position.z
                    );


                // Don't place inside player
                const dx =
                    Math.abs(
                        position.x -
                        camera.position.x
                    );

                const dy =
                    Math.abs(
                        position.y -
                        (
                            camera.position.y -
                            0.9
                        )
                    );

                const dz =
                    Math.abs(
                        position.z -
                        camera.position.z
                    );


                if (
                    dx < 1 &&
                    dy < 1.8 &&
                    dz < 1
                ) {
                    return;
                }


                // Don't create duplicate blocks
                if (
                    getBlockAtPosition(
                        position.x,
                        position.y,
                        position.z
                    )
                ) {
                    return;
                }


                const newBlock =
                    new THREE.Mesh(
                        blockGeometry,
                        materials[
                            selectedSlot
                        ]
                    );


                newBlock.position.copy(
                    position
                );


                newBlock.userData.isBlock =
                    true;


                scene.add(
                    newBlock
                );


                registerWorldBlock(
                    newBlock
                );
            }
        }
    );


    // =========================
    // PREVENT RIGHT CLICK MENU
    // =========================

    document.addEventListener(
        "contextmenu",
        (event) => {
            event.preventDefault();
        }
    );


    function getBlockAtPosition(
        x,
        y,
        z
    ) {

        // Check scene objects only
        // for placement duplicate protection.
        for (
            const object of scene.children
        ) {

            if (
                !object.isMesh ||
                object.geometry !==
                    blockGeometry
            ) {
                continue;
            }


            if (
                Math.round(
                    object.position.x
                ) === x &&

                Math.round(
                    object.position.y
                ) === y &&

                Math.round(
                    object.position.z
                ) === z
            ) {

                return object;
            }
        }


        return null;
    }
}