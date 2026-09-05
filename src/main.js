import * as THREE from "three";
import { createWorld, updateChunkVisibility, getPerformanceStats } from "./world.js";

import { grassMaterial, dirtMaterial, stoneMaterial, sandMaterial, oakLogMaterial, leavesMaterial } from "./blocks.js";
import { setupControls } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 7, 5);

const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x506050, 2.5));

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

const settings = {
    shadows: false,
    shadowQuality: 512,
    pixelRatio: 1
};

function applySettings() {
    renderer.shadowMap.enabled = settings.shadows;
    sun.castShadow = settings.shadows;
    sun.shadow.mapSize.width = settings.shadowQuality;
    sun.shadow.mapSize.height = settings.shadowQuality;
    renderer.setPixelRatio(Math.min(settings.pixelRatio, 1.5));

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

function openSettings() {
    if (!settingsMenu) return;
    settingsMenu.style.display = "flex";
    document.exitPointerLock();
}

function closeSettingsMenu() {
    if (!settingsMenu) return;
    settingsMenu.style.display = "none";
    if (gameStarted) requestPointerLock();
}

function requestPointerLock() {
    if (gameStarted && document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
    }
}

if (playButton && mainMenu) {
    playButton.addEventListener("click", () => {
        gameStarted = true;
        mainMenu.style.display = "none";
        requestPointerLock();
    });
}

if (menuSettingsButton) menuSettingsButton.addEventListener("click", openSettings);
if (settingsButton) settingsButton.addEventListener("click", openSettings);
if (closeSettings) closeSettings.addEventListener("click", closeSettingsMenu);

document.addEventListener("keydown", (event) => {
    if (event.code !== "Escape" || !gameStarted) return;
    setTimeout(openSettings, 0);
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
setupInteraction(scene, camera);

const performanceHud = document.createElement("div");
performanceHud.id = "performanceHud";
performanceHud.style.cssText = "position:fixed;top:12px;left:12px;padding:6px 8px;background:rgba(0,0,0,.45);color:white;font:12px monospace;line-height:1.4;pointer-events:none;z-index:15;border-radius:5px;";
performanceHud.textContent = "FPS: -- | Chunks: -- | Calls: --";
document.body.appendChild(performanceHud);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTime = performance.now();
let fpsTime = lastTime;
let fpsFrames = 0;
let lastChunkX = Infinity;
let lastChunkZ = Infinity;

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    if (gameStarted) {
        updatePlayer(camera, scene, deltaTime);

        const chunkX = Math.floor(camera.position.x / 16);
        const chunkZ = Math.floor(camera.position.z / 16);

        if (chunkX !== lastChunkX || chunkZ !== lastChunkZ) {
            updateChunkVisibility(camera.position);
            lastChunkX = chunkX;
            lastChunkZ = chunkZ;
        }
    }

    renderer.render(scene, camera);

    fpsFrames++;
    if (currentTime - fpsTime >= 500) {
        const fps = Math.round((fpsFrames * 1000) / (currentTime - fpsTime));
        const stats = getPerformanceStats();
        performanceHud.textContent = `FPS: ${fps} | Chunks: ${stats.loadedChunks}/${stats.chunks} | Calls: ${renderer.info.render.calls}`;
        fpsFrames = 0;
        fpsTime = currentTime;
    }
}

animate();
