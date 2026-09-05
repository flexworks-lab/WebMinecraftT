import * as THREE from "three";
import { createWorld, updateChunkVisibility, getPerformanceStats } from "./world.js";
import { setupControls } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";

const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x87ceeb);
const undergroundColor = new THREE.Color(0x11151a);
scene.background = skyColor.clone();
scene.fog = new THREE.Fog(skyColor.clone(), 40, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 7, 5);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const skyLight = new THREE.HemisphereLight(0xbfe8ff, 0x342c26, 1.35);
scene.add(skyLight);

const sun = new THREE.DirectionalLight(0xfff1cf, 3.2);
sun.position.set(45, 85, 30);
sun.castShadow = true;
sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 220;
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.02;
scene.add(sun);
scene.add(sun.target);

const depthLight = new THREE.PointLight(0x9db6d2, 0, 1, 2);
scene.add(depthLight);

createWorld(scene);

const mobileMode = new URLSearchParams(window.location.search).get("mobile") === "1" ||
    new URLSearchParams(window.location.search).get("mode") === "mobile";
if (mobileMode) document.body.classList.add("mobile-mode");

let gameStarted = false;
const defaults = { shadows: true, shadowQuality: 1024, pixelRatio: 1, lightingQuality: "high", brightness: 1 };
let settings;
try {
    const saved = JSON.parse(localStorage.getItem("webminecraft-settings") || "null");
    settings = { ...defaults, ...(saved && typeof saved === "object" ? saved : {}) };
} catch {
    settings = { ...defaults };
}

function saveSettings() {
    try {
        localStorage.setItem("webminecraft-settings", JSON.stringify(settings));
    } catch {
        // Settings persistence is optional.
    }
}

function getLightingProfile() {
    if (settings.lightingQuality === "performance") return { sun: 2.7, sky: 1.1, ambientFloor: 0.12, undergroundSun: 0.05 };
    if (settings.lightingQuality === "balanced") return { sun: 3.0, sky: 1.25, ambientFloor: 0.09, undergroundSun: 0.035 };
    return { sun: 3.35, sky: 1.35, ambientFloor: 0.06, undergroundSun: 0.02 };
}

function applySettings() {
    renderer.shadowMap.enabled = settings.shadows;
    sun.castShadow = settings.shadows;
    sun.shadow.mapSize.width = settings.shadowQuality;
    sun.shadow.mapSize.height = settings.shadowQuality;
    renderer.setPixelRatio(Math.min(settings.pixelRatio, 1.5));
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMappingExposure = 0.9 + settings.brightness * 0.35;
    for (const object of scene.children) {
        if (!object.isMesh) continue;
        object.castShadow = settings.shadows;
        object.receiveShadow = settings.shadows;
    }
    updateDepthLighting();
}

function smoothStep(edge0, edge1, value) {
    const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

function updateDepthLighting() {
    const y = camera.position.y;
    const underground = 1 - smoothStep(-1, 8, y);
    const deepDark = 1 - smoothStep(-24, -1, y);
    const profile = getLightingProfile();
    const sunlightFactor = THREE.MathUtils.lerp(1, profile.undergroundSun, underground);
    const skyFactor = THREE.MathUtils.lerp(1, profile.ambientFloor, underground);
    const exposure = THREE.MathUtils.lerp(1, 0.62, deepDark) * (0.9 + settings.brightness * 0.35);
    sun.intensity = profile.sun * sunlightFactor;
    skyLight.intensity = profile.sky * skyFactor;
    depthLight.intensity = underground * (0.08 + (1 - deepDark) * 0.08);
    depthLight.position.set(camera.position.x, camera.position.y + 1, camera.position.z);
    renderer.toneMappingExposure = exposure;
    scene.background.lerpColors(skyColor, undergroundColor, underground * 0.86);
    scene.fog.color.lerpColors(skyColor, undergroundColor, underground * 0.9);
    scene.fog.near = THREE.MathUtils.lerp(40, 8, underground);
    scene.fog.far = THREE.MathUtils.lerp(120, 55, underground);
}

applySettings();

const mainMenu = document.getElementById("mainMenu");
const playButton = document.getElementById("playButton");
const menuSettingsButton = document.getElementById("menuSettingsButton");
const mobileModeButton = document.getElementById("mobileModeButton");
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettings = document.getElementById("closeSettings");

function openSettings() {
    if (settingsMenu) {
        settingsMenu.style.display = "flex";
        document.exitPointerLock?.();
    }
}

function closeSettingsMenu() {
    if (settingsMenu) {
        settingsMenu.style.display = "none";
        if (gameStarted && !mobileMode) requestPointerLock();
    }
}

function requestPointerLock() {
    if (gameStarted && !mobileMode && document.pointerLockElement !== document.body) {
        document.body.requestPointerLock?.();
    }
}

function setMobileMode(enabled) {
    const url = new URL(window.location.href);
    if (enabled) url.searchParams.set("mobile", "1");
    else url.searchParams.delete("mobile");
    url.searchParams.delete("mode");
    window.location.href = url.toString();
}

if (playButton && mainMenu) {
    playButton.addEventListener("click", () => {
        gameStarted = true;
        mainMenu.style.display = "none";
        requestPointerLock();
    });
}
if (menuSettingsButton) menuSettingsButton.addEventListener("click", openSettings);
if (mobileModeButton) mobileModeButton.addEventListener("click", () => setMobileMode(!mobileMode));
if (settingsButton) settingsButton.addEventListener("pointerdown", (event) => { event.preventDefault(); event.stopPropagation(); openSettings(); });
if (closeSettings) closeSettings.addEventListener("pointerdown", (event) => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(); });
document.addEventListener("keydown", event => { if (event.code === "Escape" && gameStarted) setTimeout(openSettings, 0); });

if (mobileModeButton) mobileModeButton.textContent = mobileMode ? "Desktop Mode" : "Mobile Mode";

const shadowsToggle = document.getElementById("shadowsToggle");
const shadowQuality = document.getElementById("shadowQuality");
const pixelQuality = document.getElementById("pixelQuality");
const lightingQuality = document.getElementById("lightingQuality");
const brightnessControl = document.getElementById("brightnessControl");

if (shadowsToggle) { shadowsToggle.checked = settings.shadows; shadowsToggle.addEventListener("change", () => { settings.shadows = shadowsToggle.checked; saveSettings(); applySettings(); }); }
if (shadowQuality) { shadowQuality.value = String(settings.shadowQuality); shadowQuality.addEventListener("change", () => { settings.shadowQuality = Number(shadowQuality.value); saveSettings(); applySettings(); }); }
if (pixelQuality) { pixelQuality.value = String(settings.pixelRatio); pixelQuality.addEventListener("change", () => { settings.pixelRatio = Number(pixelQuality.value); saveSettings(); applySettings(); }); }
if (lightingQuality) { lightingQuality.value = settings.lightingQuality; lightingQuality.addEventListener("change", () => { settings.lightingQuality = lightingQuality.value; saveSettings(); applySettings(); }); }
if (brightnessControl) { brightnessControl.value = String(settings.brightness); brightnessControl.addEventListener("input", () => { settings.brightness = Number(brightnessControl.value); saveSettings(); applySettings(); }); }

setupControls();
setupInteraction(scene, camera);
const performanceHud = document.createElement("div");
performanceHud.id = "performanceHud";
performanceHud.style.cssText = "position:fixed;top:12px;left:12px;padding:6px 8px;background:rgba(0,0,0,.45);color:white;font:12px monospace;line-height:1.4;pointer-events:none;z-index:15;border-radius:5px;";
performanceHud.textContent = "FPS: -- | Chunks: -- | Calls: --";
document.body.appendChild(performanceHud);
window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
let lastTime = performance.now(), fpsTime = lastTime, fpsFrames = 0, lastSunX = camera.position.x, lastSunZ = camera.position.z;
const sunFollowDistance = 8;
function updateSunPosition() {
    const dx = camera.position.x - lastSunX, dz = camera.position.z - lastSunZ;
    if (dx * dx + dz * dz < sunFollowDistance * sunFollowDistance) return;
    lastSunX = camera.position.x; lastSunZ = camera.position.z;
    sun.target.position.set(camera.position.x, camera.position.y, camera.position.z);
    sun.position.set(camera.position.x + 45, camera.position.y + 85, camera.position.z + 30);
    sun.target.updateMatrixWorld();
}
function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;
    if (gameStarted) { updatePlayer(camera, scene, deltaTime); updateChunkVisibility(camera.position, camera); updateSunPosition(); updateDepthLighting(); }
    renderer.render(scene, camera);
    fpsFrames++;
    if (currentTime - fpsTime >= 500) { const fps = Math.round((fpsFrames * 1000) / (currentTime - fpsTime)); const stats = getPerformanceStats(); performanceHud.textContent = `FPS: ${fps} | Chunks: ${stats.loadedChunks} | Calls: ${renderer.info.render.calls}`; fpsFrames = 0; fpsTime = currentTime; }
}
animate();
