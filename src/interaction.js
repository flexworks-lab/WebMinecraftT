import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange } from "./multiplayerClient.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const INTERACTION_DISTANCE = 5;
let selectedSlot = 0;
let lastPunch = false;
let lastPlace = false;

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    const placeTypes = [
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

    const outline = createSelectionOutline();
    scene.add(outline);

    const updateHotbar = () => {
        document.querySelectorAll(".slot").forEach((slot, index) => {
            slot.classList.toggle("selected", index === selectedSlot);
        });
    };

    document.addEventListener("keydown", (event) => {
        const number = Number(event.key);
        if (number >= 1 && number <= 9) {
            selectedSlot = number - 1;
            updateHotbar();
        }
    });

    document.querySelectorAll(".slot").forEach((slot, index) => {
        slot.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectedSlot = index;
            updateHotbar();
        });
    });

    // Desktop controls.
    document.addEventListener("mousedown", (event) => {
        if (document.body.classList.contains("mobile-mode")) return;
        if (document.pointerLockElement !== document.body) return;
        if (event.button === 0) breakBlock();
        if (event.button === 2) placeBlock(placeTypes[selectedSlot]);
    });
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Mobile controls. Punch is the only block-breaking button.
    function pollTouchActions() {
        const mobile = document.body.classList.contains("mobile-mode");
        const punch = mobile && !!touchInput.punchPressed;
        const place = mobile && !!touchInput.placePressed;

        if (punch && !lastPunch) breakBlock();
        if (place && !lastPlace) placeBlock(placeTypes[selectedSlot]);

        lastPunch = punch;
        lastPlace = place;
        requestAnimationFrame(pollTouchActions);
    }
    pollTouchActions();

    function breakBlock() {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) return;

        const type = getBlockAt(target.x, target.y, target.z);
        if (!type || type === BLOCK.AIR) return;
        if (type === BLOCK.BEDROCK) return;

        // Change the world first, then tell multiplayer and spawn the effect.
        if (!setBlockAt(target.x, target.y, target.z, BLOCK.AIR)) return;
        sendBlockChange(target.x, target.y, target.z, BLOCK.AIR);
        createBreakParticles(scene, new THREE.Vector3(target.x, target.y, target.z), type, BLOCK);
    }

    function placeBlock(type) {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) return;

        const point = target.hit.point.clone().add(target.normal.clone().multiplyScalar(0.51));
        const x = Math.floor(point.x + 0.5);
        const y = Math.floor(point.y + 0.5);
        const z = Math.floor(point.z + 0.5);

        if (getBlockAt(x, y, z) !== BLOCK.AIR) return;
        if (playerOverlapsBlock({ x, y, z }, camera)) return;
        if (!setBlockAt(x, y, z, type)) return;
        sendBlockChange(x, y, z, type);
    }

    function updateSelection() {
        const target = getTargetBlock(scene, camera, BLOCK);
        if (!target) {
            outline.visible = false;
        } else {
            outline.position.set(target.x, target.y, target.z);
            outline.visible = true;
        }
        requestAnimationFrame(updateSelection);
    }
    updateSelection();
    updateHotbar();
}

function getTargetBlock(scene, camera, BLOCK) {
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(CENTER, camera);
    raycaster.near = 0.01;
    raycaster.far = INTERACTION_DISTANCE;

    // IMPORTANT: raycast the scene, not camera.parent.
    const hits = raycaster.intersectObjects(scene.children, true);
    const hit = hits.find((entry) => {
        const object = entry.object;
        return object?.userData?.isChunk === true && !!entry.face;
    });

    raycaster.near = 0;
    raycaster.far = Infinity;

    if (!hit || hit.distance > INTERACTION_DISTANCE) return null;

    const normal = hit.face.normal.clone().normalize();
    const point = hit.point.clone().sub(normal.clone().multiplyScalar(0.01));
    const x = Math.floor(point.x + 0.5);
    const y = Math.floor(point.y + 0.5);
    const z = Math.floor(point.z + 0.5);
    const type = getBlockAt(x, y, z);

    if (!type || type === BLOCK.AIR) return null;

    return { x, y, z, type, normal, hit };
}

function createSelectionOutline() {
    const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true,
        opacity: 0.95,
        depthTest: false
    });
    const outline = new THREE.Mesh(geometry, material);
    outline.visible = false;
    outline.renderOrder = 1000;
    return outline;
}

function getParticleColor(blockType, BLOCK) {
    if (blockType === BLOCK.GRASS) return 0x67a74d;
    if (blockType === BLOCK.DIRT) return 0x8b5a34;
    if (blockType === BLOCK.STONE) return 0x7d7d7d;
    if (blockType === BLOCK.COBBLESTONE) return 0x6f6f6f;
    if (blockType === BLOCK.GRAVEL) return 0x88847d;
    if (blockType === BLOCK.SAND) return 0xd9c486;
    if (blockType === BLOCK.SANDSTONE) return 0xc9ad70;
    if (blockType === BLOCK.OAK || blockType === BLOCK.OAK_PLANKS) return 0x9a6b3f;
    if (blockType === BLOCK.LEAVES) return 0x4d8d3d;
    if (blockType === BLOCK.COAL_ORE) return 0x555555;
    if (blockType === BLOCK.IRON_ORE) return 0x9a8d84;
    if (blockType === BLOCK.SNOW) return 0xe9f1f5;
    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;
    return 0xb0b0b0;
}

function createBreakParticles(scene, center, blockType, BLOCK) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const particles = [];
    const start = performance.now();

    for (let i = 0; i < 10; i++) {
        const particle = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: getParticleColor(blockType, BLOCK),
                transparent: true,
                opacity: 1
            })
        );
        particle.position.copy(center).add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.7,
            (Math.random() - 0.5) * 0.7
        ));
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            1 + Math.random() * 2.2,
            (Math.random() - 0.5) * 2.5
        );
        particle.userData.createdAt = start;
        scene.add(particle);
        particles.push(particle);
    }

    const update = (time) => {
        let alive = false;
        for (const particle of particles) {
            if (!particle.parent) continue;
            const age = time - particle.userData.createdAt;
            if (age >= 500) {
                particle.parent.remove(particle);
                particle.material.dispose();
                continue;
            }
            alive = true;
            particle.userData.velocity.y -= 5.5 / 60;
            particle.position.addScaledVector(particle.userData.velocity, 1 / 60);
            particle.rotation.x += 0.12;
            particle.rotation.y += 0.1;
            particle.material.opacity = Math.max(0, 1 - age / 500);
        }
        if (alive) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
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
