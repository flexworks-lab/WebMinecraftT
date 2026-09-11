import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { sendBlockChange } from "./multiplayerClient.js";

const FLINT_AND_STEEL_ITEM_ID = 16;
const FUSE_MS = 2500;
const EXPLOSION_RADIUS = 4;
const INTERACTION_DISTANCE = 5;

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const primed = new Set();

function notifyBlockChange(x, y, z, type) {
    window.dispatchEvent(new CustomEvent("webminecraft:blockchange", {
        detail: { x, y, z, type }
    }));
}

function getTarget(scene, camera) {
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(CENTER, camera);
    raycaster.near = 0.01;
    raycaster.far = INTERACTION_DISTANCE;
    const hits = raycaster.intersectObjects(scene.children, true);
    const hit = hits.find(entry => {
        if (!entry.object?.userData?.isChunk || !entry.face) return false;
        let object = entry.object;
        while (object) {
            if (object.userData?.isWater === true) return false;
            object = object.parent;
        }
        return true;
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
    if (!type) return null;
    return { x, y, z, type };
}

function startFuse(scene, x, y, z) {
    const key = `${x},${y},${z}`;
    const BLOCK = getBlockTypes();
    if (primed.has(key) || getBlockAt(x, y, z) !== BLOCK.TNT) return false;
    primed.add(key);

    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd55 })
    );
    marker.position.set(x, y + 0.58, z);
    scene.add(marker);

    const light = new THREE.PointLight(0xff782e, 1.8, 4);
    light.position.set(x, y + 0.45, z);
    scene.add(light);

    const started = performance.now();
    const tick = time => {
        const age = time - started;
        marker.visible = Math.floor(age / 110) % 2 === 0;
        light.intensity = 1.5 + Math.sin(age * 0.06) * 0.9;
        if (age < FUSE_MS) {
            requestAnimationFrame(tick);
            return;
        }

        scene.remove(marker);
        marker.geometry.dispose();
        marker.material.dispose();
        scene.remove(light);
        light.dispose();
        primed.delete(key);
        explode(scene, x, y, z);
    };
    requestAnimationFrame(tick);
    return true;
}

function makeExplosionEffect(scene, x, y, z) {
    const flash = new THREE.PointLight(0xff9a42, 9, 12);
    flash.position.set(x, y + 0.5, z);
    scene.add(flash);

    const particles = [];
    const geometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const start = performance.now();

    for (let i = 0; i < 40; i++) {
        const particle = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: i % 3 === 0 ? 0x222222 : 0xc46b36,
                transparent: true,
                opacity: 1
            })
        );
        particle.position.set(x, y + 0.5, z);
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 7,
            2 + Math.random() * 7,
            (Math.random() - 0.5) * 7
        );
        scene.add(particle);
        particles.push(particle);
    }

    const update = time => {
        const age = time - start;
        flash.intensity = Math.max(0, 9 * (1 - age / 220));

        if (age >= 650) {
            for (const particle of particles) {
                if (!particle.parent) continue;
                particle.parent.remove(particle);
                particle.material.dispose();
            }
            scene.remove(flash);
            flash.dispose();
            geometry.dispose();
            return;
        }

        for (const particle of particles) {
            particle.userData.velocity.y -= 11 / 60;
            particle.position.addScaledVector(particle.userData.velocity, 1 / 60);
            particle.rotation.x += 0.18;
            particle.rotation.y += 0.14;
            particle.material.opacity = Math.max(0, 1 - age / 650);
        }
        requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
}

function explode(scene, cx, cy, cz) {
    const BLOCK = getBlockTypes();

    for (let x = Math.floor(cx - EXPLOSION_RADIUS); x <= Math.floor(cx + EXPLOSION_RADIUS); x++) {
        for (let y = Math.floor(cy - EXPLOSION_RADIUS); y <= Math.floor(cy + EXPLOSION_RADIUS); y++) {
            for (let z = Math.floor(cz - EXPLOSION_RADIUS); z <= Math.floor(cz + EXPLOSION_RADIUS); z++) {
                const distance = Math.hypot(x - cx, y - cy, z - cz);
                if (distance > EXPLOSION_RADIUS) continue;

                const type = getBlockAt(x, y, z);
                if (!type || type === BLOCK.AIR || type === BLOCK.BEDROCK) continue;

                if (type === BLOCK.TNT && !(x === cx && y === cy && z === cz)) {
                    const delay = 100 + Math.random() * 300;
                    setTimeout(() => startFuse(scene, x, y, z), delay);
                    continue;
                }

                const resistance = distance / EXPLOSION_RADIUS;
                const chance = 0.97 - resistance * 0.42;
                if (Math.random() > chance) continue;

                if (setBlockAt(x, y, z, BLOCK.AIR)) {
                    sendBlockChange(x, y, z, BLOCK.AIR);
                    notifyBlockChange(x, y, z, BLOCK.AIR);
                }
            }
        }
    }

    makeExplosionEffect(scene, cx, cy, cz);
}

export function tryIgniteTNT(scene, camera, itemId) {
    if (itemId !== FLINT_AND_STEEL_ITEM_ID) return false;
    const BLOCK = getBlockTypes();
    const target = getTarget(scene, camera);
    if (!target || target.type !== BLOCK.TNT) return false;
    return startFuse(scene, target.x, target.y, target.z);
}
