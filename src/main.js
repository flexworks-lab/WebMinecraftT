import * as THREE from "three";
import { createWorld, updateChunkVisibility, getPerformanceStats, getBlockAt, getBlockTypes, isPointInWater, setWorldSeed, getWorldSeed, getTerrainProfile, SEA_LEVEL } from "./world.js";
import { setupControls, resetView } from "./controls.js";
import { updatePlayer } from "./player.js";
import { setupInteraction } from "./interaction.js";
import { initSavedWorlds } from "./worlds.js";
import { setWorldSeedForPersistence } from "./worldSave.js";
import { setupWorldClouds, setWorldCloudSeed } from "./worldClouds.js";
import { setupWaterPhysics } from "./waterPhysics.js";
import { clearHotbar } from "./inventory.js";
import "./background.js";
import "./auth.js";
import "./chat.js";
import { getWorldMode } from "./survivalMode.js";
import "./survivalRules.js";

const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x87ceeb);
const caveFogColor = new THREE.Color(0x252a2e);
const underwaterColor = new THREE.Color(0x071b2b);
const skyLightColor = new THREE.Color(0xcfeeff);
const groundLightColor = new THREE.Color(0x3f3b43);
const sunColor = new THREE.Color(0xfff0cf);
const fillColor = new THREE.Color(0x9fc8ef);
scene.background = skyColor.clone();
scene.fog = new THREE.Fog(skyColor.clone(), 55, 175);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 180);
camera.position.set(0, 7, 5);
camera.up.set(0, 1, 0);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
window.__webminecraftRenderer = renderer;
window.__webminecraftCamera = camera;

const skyLight = new THREE.HemisphereLight(skyLightColor, groundLightColor, 1.15);
scene.add(skyLight);

const ambientLight = new THREE.AmbientLight(0x98a4ad, 0.10);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(sunColor, 3.0);
sun.position.set(45, 85, 30);
sun.castShadow = true;
sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;
sun.shadow.camera.left = -76;
sun.shadow.camera.right = 76;
sun.shadow.camera.top = 76;
sun.shadow.camera.bottom = -76;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 210;
sun.shadow.bias = -0.00045;
sun.shadow.normalBias = 0.025;
sun.shadow.radius = 2.5;
scene.add(sun);
scene.add(sun.target);

const fillLight = new THREE.DirectionalLight(fillColor, 0.20);
fillLight.position.set(-38, 58, -26);
fillLight.castShadow = false;
scene.add(fillLight);
scene.add(fillLight.target);

const depthLight = new THREE.PointLight(0x6f879b, 0, 12, 2);
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
setupWaterPhysics(scene);
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
    if (settings.lightingQuality === "performance") {
        return { sun: 2.45, sky: 0.92, ambient: 0.13, fill: 0.13 };
    }
    if (settings.lightingQuality === "balanced") {
        return { sun: 2.75, sky: 1.04, ambient: 0.11, fill: 0.17 };
    }
    return { sun: 3.05, sky: 1.16, ambient: 0.10, fill: 0.21 };
}
function applySettings() {
    renderer.shadowMap.enabled = settings.shadows;
    sun.castShadow = settings.shadows;
    sun.shadow.mapSize.width = settings.shadowQuality;
    sun.shadow.mapSize.height = settings.shadowQuality;
    renderer.setPixelRatio(Math.min(settings.pixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMappingExposure = 0.98 + settings.brightness * 0.30;

    const profile = getLightingProfile();
    ambientLight.intensity = profile.ambient;
    fillLight.intensity = profile.fill;
    skyLight.intensity = profile.sky;

    for (const object of scene.children) {
        if (!object.isMesh) continue;
        if (object.userData?.isChunk) {
            object.castShadow = settings.shadows;
            object.receiveShadow = settings.shadows;
            continue;
        }
        object.castShadow = settings.shadows;
        object.receiveShadow = settings.shadows;
    }
    updateDepthLighting();
}
function smoothStep(edge0, edge1, value) { const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); }
let cachedWaterX = NaN;
let cachedWaterZ = NaN;
let cachedWaterFloor = 0;
let cachedWaterSurface = 0;
let cachedUnderwater = false;
let cachedLightingKey = "";

function updateDepthLighting() {
    const x = Math.floor(camera.position.x);
    const y = camera.position.y;
    const z = Math.floor(camera.position.z);

    if (x !== cachedWaterX || z !== cachedWaterZ) {
        cachedWaterX = x;
        cachedWaterZ = z;

        if (document.body.classList.contains("webminecraft-flat")) {
            cachedWaterFloor = -Infinity;
            cachedWaterSurface = -Infinity;
        } else {
            const profile = getTerrainProfile(x, z);
            cachedWaterFloor = profile.height + 0.5;
            cachedWaterSurface = SEA_LEVEL + 0.42;
        }
    }

    cachedUnderwater = y < cachedWaterSurface - 0.02 && y > cachedWaterFloor + 0.05;

    const profile = getLightingProfile();

    const undergroundDepth = Math.max(0, cachedWaterFloor - y);
    const undergroundT = smoothStep(0, 18, undergroundDepth);

    // A shallow falloff keeps the surface bright while caves progressively
    // lose the direct daylight that should not reach them.
    const sunDepthFactor = THREE.MathUtils.lerp(1, 0.12, undergroundT);
    const skyDepthFactor = THREE.MathUtils.lerp(1, 0.34, undergroundT);
    const ambientDepthFactor = THREE.MathUtils.lerp(1, 0.56, undergroundT);
    const fillDepthFactor = THREE.MathUtils.lerp(1, 0.30, undergroundT);

    const waterSunFactor = cachedUnderwater ? 0.22 : 1;
    const waterSkyFactor = cachedUnderwater ? 0.34 : 1;
    const waterAmbientFactor = cachedUnderwater ? 0.50 : 1;
    const waterFillFactor = cachedUnderwater ? 0.18 : 1;

    const targetSun = profile.sun * sunDepthFactor * waterSunFactor;
    const targetSky = profile.sky * skyDepthFactor * waterSkyFactor;
    const targetAmbient = profile.ambient * ambientDepthFactor * waterAmbientFactor;
    const targetFill = profile.fill * fillDepthFactor * waterFillFactor;

    const exposureBase = 0.98 + settings.brightness * 0.30;
    const caveExposure = THREE.MathUtils.lerp(1, 0.76, undergroundT);
    const underwaterExposure = cachedUnderwater ? 0.66 : 1;
    const targetExposure = exposureBase * caveExposure * underwaterExposure;

    const lightingKey = [
        Math.round(targetSun * 100),
        Math.round(targetSky * 100),
        Math.round(targetAmbient * 100),
        Math.round(targetFill * 100),
        Math.round(targetExposure * 100),
        Math.round(undergroundT * 100),
        cachedUnderwater
    ].join("|");

    if (lightingKey === cachedLightingKey) return;
    cachedLightingKey = lightingKey;

    sun.intensity = targetSun;
    skyLight.intensity = targetSky;
    ambientLight.intensity = targetAmbient;
    fillLight.intensity = targetFill;
    depthLight.intensity = cachedUnderwater ? 0.16 : 0;
    depthLight.position.set(camera.position.x, camera.position.y - 1.2, camera.position.z);
    renderer.toneMappingExposure = targetExposure;

    if (cachedUnderwater) {
        scene.background.lerpColors(skyColor, underwaterColor, 0.98);
        scene.fog.color.lerpColors(skyColor, underwaterColor, 0.98);
        scene.fog.near = 1.8;
        scene.fog.far = 26;
    } else if (undergroundT > 0.08) {
        scene.background.copy(skyColor);
        scene.fog.color.copy(caveFogColor);
        scene.fog.near = THREE.MathUtils.lerp(55, 7, undergroundT);
        scene.fog.far = THREE.MathUtils.lerp(175, 48, undergroundT);
    } else {
        scene.background.copy(skyColor);
        scene.fog.color.copy(skyColor);
        scene.fog.near = 55;
        scene.fog.far = 175;
    }

    skyLight.color.copy(skyLightColor);
    skyLight.groundColor.copy(groundLightColor);
    sun.color.copy(sunColor);
    fillLight.color.copy(fillColor);
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

function createMobileSettingsButton() {
    if (document.getElementById("mobilePauseButton")) return;
    const button = document.createElement("button");
    button.id = "mobilePauseButton";
    button.type = "button";
    button.setAttribute("aria-label", "Pause");
    button.setAttribute("title", "Pause");
    button.textContent = "⏸";
    button.addEventListener("pointerdown", event => {
        if (!gameStarted || !mobileMode) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        window.webminecraftPause?.open?.(event);
    }, true);

    const style = document.createElement("style");
    style.textContent = `
#mobilePauseButton{
    display:none;
    position:fixed;
    top:max(12px,env(safe-area-inset-top));
    right:max(12px,env(safe-area-inset-right));
    width:52px;
    height:52px;
    padding:0;
    align-items:center;
    justify-content:center;
    border:2px solid #111;
    border-top-color:#aaa;
    border-left-color:#aaa;
    border-radius:9px;
    background:linear-gradient(180deg,#6b756c,#4e5751);
    color:#fff;
    font-size:27px;
    line-height:1;
    cursor:pointer;
    z-index:80;
    box-shadow:0 4px 0 #171b17,0 6px 15px rgba(0,0,0,.28);
    touch-action:manipulation;
}
#mobilePauseButton:active{
    transform:translateY(2px);
}
body.mobile-mode.webminecraft-in-world #mobilePauseButton{
    display:flex !important;
}
body.mobile-mode #settingsButton{
    display:none !important;
}
`;
    document.head.appendChild(style);
    document.body.appendChild(button);
}
function openSettings() { if (settingsMenu) { settingsMenu.style.display = "flex"; document.exitPointerLock?.(); } }
function hasOpenMenuScreen() {
    const selectors = [
        "#mainMenu",
        "#seedMenu",
        "#settingsMenu",
        "#pauseMenu",
        "#inventoryScreen",
        "#survivalInventoryScreen",
        "#multiplayerMenu",
        "#friendsModal",
        "#newsCenter",
        "#accountModal",
        "#welcomeScreen",
        "#devControlsPanel"
    ];
    return selectors.some(selector => {
        const element = document.querySelector(selector);
        if (!element) return false;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const visible = style.display !== "none"
            && style.visibility !== "hidden"
            && Number(style.opacity || 1) > 0
            && rect.width > 0
            && rect.height > 0;
        if (!visible) return false;
        if (element.classList.contains("open")) return true;
        if (element.getAttribute("aria-hidden") === "false") return true;
        return style.pointerEvents !== "none";
    });
}
window.__webminecraftHasOpenMenu = hasOpenMenuScreen;
function requestPointerLock() {
    if (!gameStarted || mobileMode || hasOpenMenuScreen()) return;
    if (document.pointerLockElement !== document.body) document.body.requestPointerLock?.();
}
function closeSettingsMenu(lockMouse = false) {
    if (!settingsMenu) return;
    if (lockMouse) requestPointerLock();
    settingsMenu.style.display = "none";
    if (!lockMouse && gameStarted && !mobileMode) setTimeout(requestPointerLock, 0);
}
function setMobileMode(enabled) { const url = new URL(window.location.href); if (enabled) url.searchParams.set("mobile", "1"); else url.searchParams.delete("mobile"); url.searchParams.delete("mode"); window.location.href = url.toString(); }
function setMenuUiVisible(visible) {
    const display = visible ? "" : "none";
    if (crosshair) crosshair.style.display = display;
    if (hotbar) hotbar.style.display = display;
    if (settingsButton) settingsButton.style.display = (!visible && gameStarted && mobileMode) ? "flex" : display;
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
function startWorldWithSeed(seed, savedMode = null) {
    clearHotbar();
    setWorldSeed(seed);
    const mode = savedMode === "creative" || savedMode === "survival" ? savedMode : getWorldMode(seed);
    window.webMinecraftSelectedWorldMode = mode;
    window.__webminecraftPendingSingleplayerMode = mode;
    document.body.classList.toggle("webminecraft-survival", mode === "survival");
    document.body.classList.toggle("webminecraft-creative", mode === "creative");
    window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode } }));
    createWorld(scene);
    setupWaterPhysics(scene);
    setWorldCloudSeed(seed);
    setWorldUrl(seed);
    spawnPlayer();
    gameStarted = true;
    closeSeedMenu();
    if (mainMenu) mainMenu.style.display = "none";
    setMenuUiVisible(false);
    requestPointerLock();
    void setWorldSeedForPersistence(seed).then(() => { const restoredMode = getWorldMode(seed); window.webMinecraftSelectedWorldMode = restoredMode; document.body.classList.toggle("webminecraft-survival", restoredMode === "survival"); document.body.classList.toggle("webminecraft-creative", restoredMode === "creative"); window.dispatchEvent(new CustomEvent("webminecraft-modechange", { detail: { mode: restoredMode } })); }).catch(error => console.warn("World persistence load failed:", error));
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
    closeSettings.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(true); }, { capture:true });
    closeSettings.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(true); });
}
if (settingsCloseTop) {
    settingsCloseTop.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(true); }, { capture:true });
    settingsCloseTop.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); closeSettingsMenu(true); });
}
document.addEventListener("keydown", event => {
    if (event.code !== "Escape") return;
    if (settingsMenu?.style.display === "flex") closeSettingsMenu();
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

createMobileSettingsButton();
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
    const worldsMenuOpen = document.body.classList.contains("webminecraft-worlds-menu");
    if (gameStarted || !mainMenu || (mainMenu.style.display === "none" && !worldsMenuOpen)) return;
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
    const dx = camera.position.x - lastSunX;
    const dz = camera.position.z - lastSunZ;
    if (dx * dx + dz * dz < sunFollowDistance * sunFollowDistance) return;

    lastSunX = camera.position.x;
    lastSunZ = camera.position.z;

    // Keep the shadow volume centered on the player so nearby terrain and
    // trees receive stable, detailed shadows instead of losing them at range.
    sun.target.position.set(camera.position.x, camera.position.y, camera.position.z);
    sun.position.set(camera.position.x + 48, camera.position.y + 92, camera.position.z + 34);
    sun.target.updateMatrixWorld(true);
    sun.shadow.camera.updateProjectionMatrix();

    // Moving the shadow volume requires a fresh shadow-map render.
    renderer.shadowMap.needsUpdate = true;
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