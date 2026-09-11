import * as THREE from "three";
import { createWorld, updateChunkVisibility, getPerformanceStats, getBlockAt, getBlockTypes, setWorldSeed, getWorldSeed } from "./world.js";
import { setupControls, resetView } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";
import { initSavedWorlds } from "./worlds.js";
import { setWorldSeedForPersistence } from "./worldSave.js";
import { setupWorldClouds, setWorldCloudSeed } from "./worldClouds.js";
import "./background.js";
import "./auth.js";
import "./chat.js";

const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x87ceeb);
const undergroundColor = new THREE.Color(0x11151a);
scene.background = skyColor.clone();
scene.fog = new THREE.Fog(skyColor.clone(), 40, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 7, 5);
camera.up.set(0, 1, 0);
camera.rotation.order = "YXZ";

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

const params = new URLSearchParams(window.location.search);
function normalizeSeed(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.floor(Math.abs(numeric)) >>> 0;
}
function makeNewSeed() {
    try {
        const values = new Uint32Array(2);
        crypto.getRandomValues(values);
        return (values[0] * 4096 + (values[1] >>> 20)) >>> 0;
    } catch {
        return Math.floor(Math.random() * 4294967296) >>> 0;
    }
}
const urlSeed = normalizeSeed(params.get("seed"));
if (urlSeed !== null) setWorldSeed(urlSeed);
createWorld(scene);
setupWorldClouds(scene, camera);
setWorldCloudSeed(getWorldSeed());
const mobileMode = params.get("mobile") === "1" || params.get("mode") === "mobile";
if (mobileMode) document.body.classList.add("mobile-mode");

let gameStarted = false;
const defaults = { shadows: true, shadowQuality: 1024, pixelRatio: 1, lightingQuality: "high", brightness: 1 };
let settings;
try { const saved = JSON.parse(localStorage.getItem("webminecraft-settings") || "null"); settings = { ...defaults, ...(saved && typeof saved === "object" ? saved : {}) }; }
catch { settings = { ...defaults }; }
function saveSettings() { try { localStorage.setItem("webminecraft-settings", JSON.stringify(settings)); } catch {} }
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMappingExposure = 0.9 + settings.brightness * 0.35;
    for (const object of scene.children) {
        if (!object.isMesh) continue;
        object.castShadow = settings.shadows;
        object.receiveShadow = settings.shadows;
    }
    updateDepthLighting();
}
function smoothStep(edge0, edge1, value) { const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); }
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
const multiplayerButton = document.getElementById("multiplayerButton");
const menuSettingsButton = document.getElementById("menuSettingsButton");
const seedMenu = document.getElementById("seedMenu");
const seedInput = document.getElementById("seedInput");
const seedTitle = document.getElementById("seedTitle");
const seedSubtitle = document.getElementById("seedSubtitle");
const seedLinkStatus = document.getElementById("seedLinkStatus");
const copySeedButton = document.getElementById("copySeedButton");
const copyWorldLinkButton = document.getElementById("copyWorldLinkButton");
const openWorldButton = document.getElementById("openWorldButton");
const openSeedButton = document.getElementById("openSeedButton");
const mobileModeButton = document.getElementById("mobileModeButton");
const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettings = document.getElementById("closeSettings");
const settingsCloseTop = document.getElementById("settingsCloseTop");
const menuUpdates = document.getElementById("menuUpdates");
const crosshair = document.getElementById("crosshair");
const hotbar = document.getElementById("hotbar");
function openSettings() { if (settingsMenu) { settingsMenu.style.display = "flex"; document.exitPointerLock?.(); } }
function closeSettingsMenu() { if (settingsMenu) { settingsMenu.style.display = "none"; if (gameStarted && !mobileMode) requestPointerLock(); } }
function requestPointerLock() { if (gameStarted && !mobileMode && document.pointerLockElement !== document.body) document.body.requestPointerLock?.(); }
function setMobileMode(enabled) { const url = new URL(window.location.href); if (enabled) url.searchParams.set("mobile", "1"); else url.searchParams.delete("mobile"); url.searchParams.delete("mode"); window.location.href = url.toString(); }
function setMenuUiVisible(visible) {
    const display = visible ? "" : "none";
    if (crosshair) crosshair.style.display = display;
    if (hotbar) hotbar.style.display = display;
    if (settingsButton) settingsButton.style.display = display;
    if (menuUpdates) menuUpdates.style.display = visible ? "block" : "none";
    if (performanceHud) performanceHud.style.display = display;
}

function findRandomSpawn() {
    const types = getBlockTypes();
    for (let attempt = 0; attempt < 700; attempt++) {
        const x = Math.floor(Math.random() * 97) - 48;
        const z = Math.floor(Math.random() * 97) - 48;
        for (let y = 70; y >= -31; y--) {
            if (getBlockAt(x, y, z) !== types.GRASS) continue;
            if (getBlockAt(x, y + 1, z) !== types.AIR || getBlockAt(x, y + 2, z) !== types.AIR) continue;
            let safeLand = true;
            for (let ox = -1; ox <= 1 && safeLand; ox++) {
                for (let oz = -1; oz <= 1; oz++) {
                    if (ox === 0 && oz === 0) continue;
                    const below = getBlockAt(x + ox, y, z + oz);
                    if (below !== types.GRASS && below !== types.DIRT) { safeLand = false; break; }
                }
            }
            if (safeLand) return { x: x + 0.5, y: y + 0.5 + 1.8, z: z + 0.5 };
            break;
        }
    }
    for (let x = -16; x <= 16; x++) {
        for (let z = -16; z <= 16; z++) {
            for (let y = 60; y >= -31; y--) {
                if (getBlockAt(x, y, z) !== types.GRASS) continue;
                if (getBlockAt(x, y + 1, z) !== types.AIR || getBlockAt(x, y + 2, z) !== types.AIR) continue;
                return { x: x + 0.5, y: y + 0.5 + 1.8, z: z + 0.5 };
            }
        }
    }
    return { x: 0.5, y: 80, z: 0.5 };
}

function spawnPlayer() {
    const spawn = findRandomSpawn();
    camera.up.set(0, 1, 0);
    camera.position.set(spawn.x, spawn.y, spawn.z);
    const spawnYaw = Math.random() * Math.PI * 2;
    resetView(spawnYaw, 0);
    camera.rotation.order = "YXZ";
    camera.rotation.set(0, spawnYaw, 0);
    camera.updateMatrixWorld(true);
    return true;
}

let seedMenuMode = "create";
function openSeedMenu(mode = "create") {
    if (!seedMenu || gameStarted) return;
    seedMenuMode = mode;
    const currentSeed = mode === "create" ? makeNewSeed() : getWorldSeed();
    if (seedTitle) seedTitle.textContent = mode === "create" ? "Create World" : "Open World";
    if (seedSubtitle) seedSubtitle.textContent = mode === "create"
        ? "Your new world seed is below. Copy it to share the exact same world later."
        : "Enter a seed number to return to the exact same world.";
    if (seedInput) { seedInput.value = String(currentSeed); seedInput.focus(); seedInput.select(); }
    if (seedLinkStatus) seedLinkStatus.textContent = "";
    seedMenu.style.display = "flex";
    seedMenu.setAttribute("aria-hidden", "false");
}
function closeSeedMenu() {
    if (!seedMenu) return;
    seedMenu.style.display = "none";
    seedMenu.setAttribute("aria-hidden", "true");
}
function getSeedFromInput() {
    const seed = normalizeSeed(seedInput?.value?.trim());
    if (seed === null) {
        if (seedLinkStatus) seedLinkStatus.textContent = "Enter a valid seed number.";
        seedInput?.focus();
        return null;
    }
    return seed;
}
function setWorldUrl(seed) {
    const url = new URL(window.location.href);
    url.searchParams.set("seed", String(seed));
    if (mobileMode) url.searchParams.set("mobile", "1");
    else url.searchParams.delete("mobile");
    window.history.replaceState({}, "", url.toString());
}
async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
        const helper = document.createElement("textarea");
        helper.value = text; helper.style.position = "fixed"; helper.style.opacity = "0";
        document.body.appendChild(helper); helper.select();
        let ok = false; try { ok = document.execCommand("copy"); } catch {}
        helper.remove(); return ok;
    }
}
async function startWorldWithSeed(seed) {
    setWorldSeed(seed);
    createWorld(scene);
    setWorldCloudSeed(seed);
    setWorldUrl(seed);
    spawnPlayer();
    gameStarted = true;
    closeSeedMenu();
    if (mainMenu) mainMenu.style.display = "none";
    setMenuUiVisible(false);
    await setWorldSeedForPersistence(seed);
    requestPointerLock();
}

initSavedWorlds({ onOpenWorld: startWorldWithSeed });

if (multiplayerButton) multiplayerButton.addEventListener("click", async event => {
    event.preventDefault(); event.stopPropagation();
    try {
        const { openMultiplayerMenu } = await import("./multiplayerClient.js");
        openMultiplayerMenu();
    } catch (error) {
        console.error("Failed to open multiplayer menu:", error);
    }
});
if (openSeedButton) openSeedButton.addEventListener("click", event => {
    event.preventDefault(); event.stopPropagation();
    openSeedMenu("open");
});
if (copySeedButton) copySeedButton.addEventListener("click", async () => {
    const seed = getSeedFromInput(); if (seed === null) return;
    if (await copyText(String(seed))) { if (seedLinkStatus) seedLinkStatus.textContent = "Seed copied!"; }
    else if (seedLinkStatus) seedLinkStatus.textContent = "Could not copy automatically.";
});
if (copyWorldLinkButton) copyWorldLinkButton.addEventListener("click", async () => {
    const seed = getSeedFromInput(); if (seed === null) return;
    const url = new URL(window.location.href);
    url.searchParams.set("seed", String(seed));
    if (mobileMode) url.searchParams.set("mobile", "1");
    else url.searchParams.delete("mobile");
    if (await copyText(url.toString())) { if (seedLinkStatus) seedLinkStatus.textContent = "World link copied!"; }
    else if (seedLinkStatus) seedLinkStatus.textContent = "Could not copy automatically.";
});
if (openWorldButton) openWorldButton.addEventListener("click", () => {
    const seed = getSeedFromInput(); if (seed === null) return;
    startWorldWithSeed(seed);
});
if (seedInput) seedInput.addEventListener("keydown", event => {
    if (event.key === "Enter") openWorldButton?.click();
    if (event.key === "Escape") closeSeedMenu();
});
if (menuSettingsButton) menuSettingsButton.addEventListener("click", openSettings);
if (mobileModeButton) mobileModeButton.addEventListener("click", () => setMobileMode(!mobileMode));
if (settingsButton) settingsButton.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); openSettings(); });
if (closeSettings) {
    closeSettings.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(); });
    closeSettings.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(); });
}
if (settingsCloseTop) {
    settingsCloseTop.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(); });
    settingsCloseTop.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(); });
}
document.addEventListener("keydown", event => {
    if (event.code !== "Escape") return;
    if (settingsMenu?.style.display === "flex") closeSettingsMenu();
    else if (gameStarted) setTimeout(openSettings, 0);
});
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
setMenuUiVisible(true);
window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

const menuLook = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener("pointermove", event => {
    if (gameStarted || !mainMenu || mainMenu.style.display === "none") return;
    menuLook.targetX = THREE.MathUtils.clamp((event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2, -1, 1);
    menuLook.targetY = THREE.MathUtils.clamp((event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2, -1, 1);
});
window.addEventListener("pointerleave", () => { menuLook.targetX = 0; menuLook.targetY = 0; });

let lastTime = performance.now(), fpsTime = lastTime, fpsFrames = 0, lastSunX = camera.position.x, lastSunZ = camera.position.z;
const sunFollowDistance = 8;
const panoramaAngle = Math.random() * Math.PI * 2;
const panoramaDistance = 48 + Math.random() * 112;
const panoramaCenter = new THREE.Vector3(Math.round(Math.cos(panoramaAngle) * panoramaDistance / 16) * 16, 10, Math.round(Math.sin(panoramaAngle) * panoramaDistance / 16) * 16);
const panoramaCamera = { position: new THREE.Vector3(panoramaCenter.x, 16, panoramaCenter.z), targetY: 16, angle: Math.random() * Math.PI * 2, speed: 0.035, swayX: 0, swayY: 0, safeHeight: null };
function getMenuCameraHeight() {
    const x = Math.floor(panoramaCamera.position.x);
    const z = Math.floor(panoramaCamera.position.z);
    const types = getBlockTypes();
    for (let y = 94; y >= -31; y--) {
        if (getBlockAt(x, y, z) !== types.AIR) return y + 4.5;
    }
    return 32;
}
function updateMenuCamera(deltaTime) {
    if (gameStarted || !mainMenu || mainMenu.style.display === "none") return;
    panoramaCamera.angle += panoramaCamera.speed * deltaTime;
    menuLook.x = THREE.MathUtils.lerp(menuLook.x, menuLook.targetX, Math.min(deltaTime * 2.5, 1));
    menuLook.y = THREE.MathUtils.lerp(menuLook.y, menuLook.targetY, Math.min(deltaTime * 2.5, 1));
    panoramaCamera.swayX = THREE.MathUtils.lerp(panoramaCamera.swayX, menuLook.x, Math.min(deltaTime * 1.8, 1));
    panoramaCamera.swayY = THREE.MathUtils.lerp(panoramaCamera.swayY, menuLook.targetY, Math.min(deltaTime * 1.8, 1));
    updateChunkVisibility(panoramaCamera.position, camera);
    if (panoramaCamera.safeHeight === null) {
        panoramaCamera.safeHeight = getMenuCameraHeight();
        panoramaCamera.position.y = Math.max(20, panoramaCamera.safeHeight);
        panoramaCamera.targetY = Math.max(16, panoramaCamera.position.y - 10);
    }
    camera.position.copy(panoramaCamera.position);
    const lookDistance = 40;
    const mouseYaw = panoramaCamera.swayX * 0.12;
    const mousePitch = panoramaCamera.swayY * 0.055;
    const lookAngle = panoramaCamera.angle + mouseYaw;
    const lookTarget = new THREE.Vector3(panoramaCamera.position.x + Math.sin(lookAngle) * lookDistance, panoramaCamera.targetY - mousePitch * lookDistance, panoramaCamera.position.z + Math.cos(lookAngle) * lookDistance);
    camera.up.set(0, 1, 0);
    camera.lookAt(lookTarget);
    updateDepthLighting();
}
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
    else updateMenuCamera(deltaTime);
    renderer.render(scene, camera);
    fpsFrames++;
    if (currentTime - fpsTime >= 500) { const fps = Math.round((fpsFrames * 1000) / (currentTime - fpsTime)); const stats = getPerformanceStats(); performanceHud.textContent = `FPS: ${fps} | Chunks: ${stats.loadedChunks} | Calls: ${renderer.info.render.calls}`; fpsFrames = 0; fpsTime = currentTime; }
}
animate();
