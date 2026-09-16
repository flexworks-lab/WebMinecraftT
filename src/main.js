import * as THREE from "three";
import { createWorld, updateChunkVisibility, getPerformanceStats, getBlockAt, getBlockTypes, isPointInWater, setWorldSeed, getWorldSeed } from "./world.js";
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
import "./survivalMode.js";
import "./survivalRules.js";

const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x87ceeb);
const undergroundColor = new THREE.Color(0x11151a);
const underwaterColor = new THREE.Color(0x071b2b);
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
setupWaterPhysics(scene);
setupWorldClouds(scene, camera);
setWorldCloudSeed(getWorldSeed());
const mobileMode = params.get("mobile") === "1" || params.get("mode") === "mobile";
if (mobileMode) document.body.classList.add("mobile-mode");
