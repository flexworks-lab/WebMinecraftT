import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange } from "./multiplayerClient.js";

const raycaster = new THREE.Raycaster();
const INTERACTION_DISTANCE = 4;
const MOBILE_HOLD_TIME = 700;
let selectedSlot = 0;
let lastBreak = false;
let lastPunch = false;
let lastPlace = false;

export function setupInteraction(scene, camera) {
    const BLOCK = getBlockTypes();
    const materials = [
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

    const selectionOutline = createSelectionOutline();
    scene.add(selectionOutline);

    let mobilePressStart = 0;
    let mobilePressKey = null;
    let mobileHoldBroken = false;

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
        const select = (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectedSlot = index;
            updateHotbar();
        };
        slot.addEventListener("pointerdown", select);
    });

    document.addEventListener("mousedown", (event) => {
        if (document.body.classList.contains("mobile-mode")) return;
        if (document.pointerLockElement !== document.body) return;
        if (event.button !== 0 && event.button !== 2) return;
        performAction(scene, camera, BLOCK, materials, event.button === 0 ? "break" : "place");
    });

    document.addEventListener("contextmenu", (event) => event.preventDefault());

    function pollTouchActions() {
        const mobile = document.body.classList.contains("mobile-mode");
        if (mobile) {
            const currentBreak = !!(touchInput.breakPressed || touchInput.punchPressed);
            const currentPlace = !!touchInput.placePressed;

            if (currentBreak && !lastBreak) {
                const target = getTargetBlock(camera, BLOCK);
                if (target) {
                    mobilePressStart = performance.now();
                    mobilePressKey = `${target.x},${target.y},${target.z}`;
                    mobileHoldBroken = false;
                } else {
                    mobilePressStart = 0;
                    mobilePressKey = null;
                    mobileHoldBroken = false;
                }
            }

            if (currentBreak) {
                const target = getTargetBlock(camera, BLOCK);
                const key = target ? `${target.x},${target.y},${target.z}` : null;
                if (!target || key !== mobilePressKey) {
                    mobilePressStart = target ? performance.now() : 0;
                    mobilePressKey = key;
                    mobileHoldBroken = false;
                } else if (!mobileHoldBroken && mobilePressStart && performance.now() - mobilePressStart >= MOBILE_HOLD_TIME) {
                    performAction(scene, camera, BLOCK, materials, "break");
                    mobileHoldBroken = true;
                }
            } else {
                mobilePressStart = 0;
                mobilePressKey = null;
                mobileHoldBroken = false;
            }

            if (currentPlace && !lastPlace) {
                performAction(scene, camera, BLOCK, materials, "place");
            }
        } else {
            mobilePressStart = 0;
            mobilePressKey = null;
            mobileHoldBroken = false;
        }

        lastBreak = !!(touchInput.breakPressed || touchInput.punchPressed);
        lastPlace = !!touchInput.placePressed;
        lastPunch = !!touchInput.punchPressed;
        requestAnimationFrame(pollTouchActions);
    }
    pollTouchActions();

    function updateSelection() {
        const target = getTargetBlock(camera, BLOCK);

        if (!target) {
            selectionOutline.visible = false;
            requestAnimationFrame(updateSelection);
            return;
        }

        selectionOutline.position.copy(new THREE.Vector3(target.x, target.y, target.z))
            .addScaledVector(target.normal, 0.506);
        selectionOutline.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), target.normal);
        selectionOutline.visible = true;
        requestAnimationFrame(updateSelection);
    }
    updateSelection();
}

function getTargetBlock(camera, BLOCK) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.near = 0;
    raycaster.far = INTERACTION_DISTANCE;

    const hits = raycaster.intersectObjects(camera.parent?.children || [], false);
    const hit = hits.find((entry) => entry.object.userData?.isChunk && entry.face);
    raycaster.far = Infinity;

    if (!hit || !hit.face || hit.distance > INTERACTION_DISTANCE) return null;

    const block = getHitBlock(hit, BLOCK);
    if (!block) return null;

    return {
        ...block,
        normal: hit.face.normal.clone().normalize(),
        distance: hit.distance
    };
}

function performAction(scene, camera, BLOCK, materials, action) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.near = 0;
    raycaster.far = INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(scene.children, false);
    raycaster.far = Infinity;
    const hit = hits.find((entry) => entry.object.userData?.isChunk);
    if (!hit || !hit.face || hit.distance > INTERACTION_DISTANCE) return;

    if (action === "break") {
        const point = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.01));
        const x = Math.floor(point.x + 0.5);
        const y = Math.floor(point.y + 0.5);
        const z = Math.floor(point.z + 0.5);
        const blockType = getBlockAt(x, y, z);
        if (blockType) {
            createBreakParticles(scene, new THREE.Vector3(x, y, z), blockType, BLOCK);
            if (setBlockAt(x, y, z, BLOCK.AIR)) sendBlockChange(x, y, z, BLOCK.AIR);
        }
        return;
    }

    const point = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.51));
    const x = Math.floor(point.x + 0.5);
    const y = Math.floor(point.y + 0.5);
    const z = Math.floor(point.z + 0.5);

    if (getBlockAt(x, y, z)) return;
    if (playerOverlapsBlock({ x, y, z }, camera)) return;
    if (setBlockAt(x, y, z, materials[selectedSlot])) sendBlockChange(x, y, z, materials[selectedSlot]);
}

function getHitBlock(hit, BLOCK) {
    const point = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.01));
    const x = Math.floor(point.x + 0.5);
    const y = Math.floor(point.y + 0.5);
    const z = Math.floor(point.z + 0.5);
    const type = getBlockAt(x, y, z);
    if (!type || type === BLOCK.AIR) return null;
    return { x, y, z, type };
}

function createSelectionOutline() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -0.492, -0.492, 0,
         0.492, -0.492, 0,
         0.492, -0.492, 0,
         0.492,  0.492, 0,
         0.492,  0.492, 0,
        -0.492,  0.492, 0,
        -0.492,  0.492, 0,
        -0.492, -0.492, 0
    ]);
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.95,
        depthTest: false,
        linewidth: 4
    });

    const outline = new THREE.LineSegments(geometry, material);
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
    const color = getParticleColor(blockType, BLOCK);
    const count = 12;
    const particles = [];
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const now = performance.now();

    for (let i = 0; i < count; i++) {
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(center).add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.72,
            (Math.random() - 0.5) * 0.72,
            (Math.random() - 0.5) * 0.72
        ));
        particle.scale.setScalar(0.65 + Math.random() * 0.9);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2.8,
            1.2 + Math.random() * 2.6,
            (Math.random() - 0.5) * 2.8
        );
        particle.userData.rotationVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 9,
            (Math.random() - 0.5) * 9,
            (Math.random() - 0.5) * 9
        );
        particle.userData.createdAt = now;
        particle.userData.life = 420 + Math.random() * 180;
        scene.add(particle);
        particles.push(particle);
    }

    const update = (time) => {
        let alive = false;
        for (const particle of particles) {
            if (!particle.parent) continue;
            const age = time - particle.userData.createdAt;
            const life = particle.userData.life;
            if (age >= life) {
                particle.parent.remove(particle);
                particle.material.dispose();
                continue;
            }

            alive = true;
            const delta = 1 / 60;
            particle.userData.velocity.y -= 5.5 * delta;
            particle.position.addScaledVector(particle.userData.velocity, delta);
            particle.rotation.x += particle.userData.rotationVelocity.x * delta;
            particle.rotation.y += particle.userData.rotationVelocity.y * delta;
            particle.rotation.z += particle.userData.rotationVelocity.z * delta;
            particle.material.opacity = Math.max(0, 1 - age / life);
            particle.scale.multiplyScalar(0.998);
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
