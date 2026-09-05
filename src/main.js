import * as THREE from "three";
import { createWorld } from "./world.js";

import {
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
} from "./blocks.js";

import { setupControls } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 45, 150);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 7, 5);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.75);
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x506050,
    2.5
);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(40, 80, 25);
sun.castShadow = false;
sun.shadow.mapSize.width = 512;
sun.shadow.mapSize.height = 512;
sun.shadow.camera.left = -70;
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 220;
scene.add(sun);

createWorld(scene);

let gameStarted = false;
let settingsWasOpenedByEscape = false;

const settings = {
    shadows: false,
    shadowQuality: 512,
    pixelRatio: 0.75
};

function applySettings() {
    renderer.shadowMap.enabled = settings.shadows;
    sun.castShadow = settings.shadows;
    sun.shadow.mapSize.width = settings.shadowQuality;
    sun.shadow.mapSize.height = settings.shadowQuality;
    renderer.setPixelRatio(settings.pixelRatio);

    for (const object of scene.children) {
        if (!object.isMesh) continue;
        object.castShadow = settings.shadows;
        object.receiveShadow = settings.shadows;
    }
}

applySettings();

const mainMenu = document.getElementById("mainMenu");
const playButton = document.getElementById("playButton");
const menuSettingsButton = document.getElementById("menuSettingsButton");
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettings = document.getElementById("closeSettings");

function openSettings(fromEscape = false) {
    if (!settingsMenu) return;

    settingsWasOpenedByEscape = fromEscape;
    settingsMenu.style.display = "flex";
    document.exitPointerLock();
}

function closeSettingsMenu() {
    if (!settingsMenu) return;

    settingsMenu.style.display = "none";

    if (gameStarted && settingsWasOpenedByEscape) {
        requestPointerLock();
    }
}

function requestPointerLock() {
    if (gameStarted) {
        renderer.domElement.requestPointerLock();
    }
}

if (playButton && mainMenu) {
    playButton.addEventListener("click", () => {
        gameStarted = true;
        mainMenu.style.display = "none";
        requestPointerLock();
    });
}

if (menuSettingsButton) {
    menuSettingsButton.addEventListener("click", () => openSettings(false));
}

if (settingsButton) {
    settingsButton.addEventListener("click", () => openSettings(false));
}

if (closeSettings) {
    closeSettings.addEventListener("click", closeSettingsMenu);
}

// ESC opens the settings menu while playing.
document.addEventListener("keydown", (event) => {
    if (event.code !== "Escape" || !gameStarted) return;

    // Pointer lock exits automatically on Escape. Delay the menu by one frame
    // so the browser has finished releasing the pointer first.
    setTimeout(() => openSettings(true), 0);
});

const shadowsToggle = document.getElementById("shadowsToggle");
const shadowQuality = document.getElementById("shadowQuality");
const pixelQuality = document.getElementById("pixelQuality");

if (shadowsToggle) {
    shadowsToggle.checked = settings.shadows;
    shadowsToggle.addEventListener("change", () => {
        settings.shadows = shadowsToggle.checked;
        applySettings();
    });
}

if (shadowQuality) {
    shadowQuality.value = settings.shadowQuality;
    shadowQuality.addEventListener("change", () => {
        settings.shadowQuality = Number(shadowQuality.value);
        applySettings();
    });
}

if (pixelQuality) {
    pixelQuality.value = settings.pixelRatio;
    pixelQuality.addEventListener("change", () => {
        settings.pixelRatio = Number(pixelQuality.value);
        applySettings();
    });
}

setupControls();

setupInteraction(
    scene,
    camera,
    blockGeometry,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    sandMaterial,
    oakLogMaterial,
    leavesMaterial
);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    if (gameStarted) {
        updatePlayer(camera, scene, deltaTime);
    }

    renderer.render(scene, camera);
}

animate();