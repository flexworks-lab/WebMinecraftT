import * as THREE from "three";
import { createWorld } from "./world.js";

import {
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial
} from "./blocks.js";

import { setupControls } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";


// =========================
// SCENE
// =========================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// =========================
// CAMERA
// =========================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 6, 5);


// =========================
// RENDERER
// =========================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(0.75);

renderer.shadowMap.enabled = false;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


// =========================
// LIGHTING
// =========================

const ambientLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x555555,
        3
    );

scene.add(ambientLight);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

sun.position.set(
    50,
    100,
    30
);

sun.castShadow = false;

sun.shadow.mapSize.width = 512;
sun.shadow.mapSize.height = 512;

sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 250;

scene.add(sun);


// =========================
// WORLD
// =========================

createWorld(scene);


// =========================
// GAME STATE
// =========================

let gameStarted = false;


// =========================
// GRAPHICS SETTINGS
// =========================

const settings = {

    shadows: false,

    shadowQuality: 512,

    pixelRatio: 0.75
};


// =========================
// APPLY SETTINGS
// =========================

function applySettings() {

    renderer.shadowMap.enabled =
        settings.shadows;

    sun.castShadow =
        settings.shadows;

    sun.shadow.mapSize.width =
        settings.shadowQuality;

    sun.shadow.mapSize.height =
        settings.shadowQuality;

    renderer.setPixelRatio(
        settings.pixelRatio
    );

    for (const object of scene.children) {

        if (!object.isMesh) {
            continue;
        }

        object.castShadow =
            settings.shadows;

        object.receiveShadow =
            settings.shadows;
    }
}


applySettings();


// =========================
// MENU
// =========================

const mainMenu =
    document.getElementById(
        "mainMenu"
    );

const playButton =
    document.getElementById(
        "playButton"
    );

const menuSettingsButton =
    document.getElementById(
        "menuSettingsButton"
    );

const settingsButton =
    document.getElementById(
        "settingsButton"
    );

const settingsMenu =
    document.getElementById(
        "settingsMenu"
    );

const closeSettings =
    document.getElementById(
        "closeSettings"
    );


function openSettings() {

    if (!settingsMenu) return;

    settingsMenu.style.display =
        "flex";

    document.exitPointerLock();
}


if (playButton && mainMenu) {

    playButton.addEventListener(
        "click",
        () => {

            gameStarted = true;

            mainMenu.style.display =
                "none";

            document.body.requestPointerLock();
        }
    );
}


if (menuSettingsButton) {

    menuSettingsButton.addEventListener(
        "click",
        openSettings
    );
}


if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        openSettings
    );
}


if (closeSettings && settingsMenu) {

    closeSettings.addEventListener(
        "click",
        () => {

            settingsMenu.style.display =
                "none";
        }
    );
}


// =========================
// SETTINGS CONTROLS
// =========================

const shadowsToggle =
    document.getElementById(
        "shadowsToggle"
    );

const shadowQuality =
    document.getElementById(
        "shadowQuality"
    );

const pixelQuality =
    document.getElementById(
        "pixelQuality"
    );


if (shadowsToggle) {

    shadowsToggle.checked =
        settings.shadows;

    shadowsToggle.addEventListener(
        "change",
        () => {

            settings.shadows =
                shadowsToggle.checked;

            applySettings();
        }
    );
}


if (shadowQuality) {

    shadowQuality.value =
        settings.shadowQuality;

    shadowQuality.addEventListener(
        "change",
        () => {

            settings.shadowQuality =
                Number(shadowQuality.value);

            applySettings();
        }
    );
}


if (pixelQuality) {

    pixelQuality.value =
        settings.pixelRatio;

    pixelQuality.addEventListener(
        "change",
        () => {

            settings.pixelRatio =
                Number(pixelQuality.value);

            applySettings();
        }
    );
}


// =========================
// CONTROLS
// =========================

setupControls();


// =========================
// BLOCK INTERACTION
// =========================

setupInteraction(
    scene,
    camera,
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial
);


// =========================
// WINDOW RESIZE
// =========================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// =========================
// GAME LOOP
// =========================

let lastTime =
    performance.now();


function animate() {

    requestAnimationFrame(
        animate
    );

    const currentTime =
        performance.now();

    let deltaTime =
        (currentTime - lastTime) /
        1000;

    lastTime =
        currentTime;

    deltaTime =
        Math.min(
            deltaTime,
            0.05
        );

    if (gameStarted) {

        updatePlayer(
            camera,
            scene,
            deltaTime
        );
    }

    renderer.render(
        scene,
        camera
    );
}


animate();