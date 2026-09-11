from pathlib import Path


def patch(path, replacements):
    p = Path(path)
    s = p.read_text()
    for old, new in replacements:
        if old not in s:
            raise SystemExit(f'Pattern not found in {path}: {old[:100]!r}')
        s = s.replace(old, new, 1)
    p.write_text(s)

patch('src/blocks.js', [
    ('const snowTexture = createTexture("#cbd6da", ["#c0ccd1", "#e3e9eb", "#adbcc2", "#d6e1e5"], 34, 25);\nconst waterTexture', 'const snowTexture = createTexture("#cbd6da", ["#c0ccd1", "#e3e9eb", "#adbcc2", "#d6e1e5"], 34, 25);\nconst tntBottomTexture = loadTexture(texturePath("tnt_bottom.png"));\nconst tntSideTexture = loadTexture(texturePath("tnt_side.png"));\nconst tntTopTexture = loadTexture(texturePath("tnt_top.png"));\nconst waterTexture'),
    ('const snowMaterial = new THREE.MeshLambertMaterial({ map: snowTexture, vertexColors: true, color: 0xffffff });\nconst waterMaterial', 'const snowMaterial = new THREE.MeshLambertMaterial({ map: snowTexture, vertexColors: true, color: 0xffffff });\nconst tntSideMaterial = new THREE.MeshLambertMaterial({ map: tntSideTexture, vertexColors: true, color: 0xffffff });\nconst tntTopMaterial = new THREE.MeshLambertMaterial({ map: tntTopTexture, vertexColors: true, color: 0xffffff });\nconst tntBottomMaterial = new THREE.MeshLambertMaterial({ map: tntBottomTexture, vertexColors: true, color: 0xffffff });\nconst tntMaterial = [tntSideMaterial, tntSideMaterial, tntTopMaterial, tntBottomMaterial, tntSideMaterial, tntSideMaterial];\nconst waterMaterial'),
    ('ironMaterial, oakLogMaterial, oakPlankMaterial, leavesMaterial, snowMaterial,\n    waterMaterial', 'ironMaterial, oakLogMaterial, oakPlankMaterial, leavesMaterial, snowMaterial, tntMaterial,\n    waterMaterial')
])

patch('src/world.js', [
    ('leavesMaterial, snowMaterial\n} from "./blocks.js";', 'leavesMaterial, snowMaterial, tntMaterial\n} from "./blocks.js";'),
    ('OAK_PLANKS: 13, SNOW: 14\n};', 'OAK_PLANKS: 13, SNOW: 14, TNT: 15\n};'),
    ('coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial\n];', 'coalMaterial, ironMaterial, oakPlankMaterial, snowMaterial, tntMaterial\n];'),
    ('case BLOCK.SNOW: return 15;\n        default:', 'case BLOCK.SNOW: return 15;\n        case BLOCK.TNT: return 16;\n        default:')
])

patch('src/inventory.js', [
    ('{ id: 6, name: "Leaves", texture: "oak-leaves-normal-original-default.png" },\n    { id: 7, name: "Cobblestone", texture: "stone.png" },', '{ id: 6, name: "Leaves", texture: "oak-leaves-normal-original-default.png" },\n    { id: 15, name: "TNT", texture: "tnt_side.png" },\n    { id: 16, name: "Flint and Steel", texture: "Flint_and_Steel_JE4_BE2.png" },\n    { id: 7, name: "Cobblestone", texture: "stone.png" },'),
    ('function loadInventory() {\n    try {\n        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));\n        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) inventory = saved;\n        else ensureInitialItems();\n    } catch { ensureInitialItems(); }\n}', '''function loadInventory() {
    let freshInventory = false;
    try {
        const saved = JSON.parse(localStorage.getItem("webminecraft_inventory"));
        if (Array.isArray(saved) && saved.length === INVENTORY_SIZE) inventory = saved;
        else { ensureInitialItems(); freshInventory = true; }
    } catch { ensureInitialItems(); freshInventory = true; }

    const migrationKey = "webminecraft_tnt_items_v1";
    if (localStorage.getItem(migrationKey) !== "1") {
        if (!freshInventory) {
            addItem(15, 64);
            addItem(16, 64);
        }
        try { localStorage.setItem(migrationKey, "1"); } catch {}
        saveInventory();
    }
}''')
])

patch('src/interaction.js', [
    ('import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";\n', 'import { setupInventory, giveBrokenBlock, getSelectedItemId, consumeSelected } from "./inventory.js";\nimport { tryIgniteTNT } from "./tnt.js";\n'),
    ('"oak_log_top.png", "oak-leaves-normal-original-default.png",\n        "Grass_Block_(top_texture)_JE2.png", "dirt.png", "stone.png"', '"oak_log_top.png", "oak-leaves-normal-original-default.png",\n        "tnt_side.png", "Flint_and_Steel_JE4_BE2.png", "stone.png"'),
    ('    function placeBlock() {\n        const itemId = getSelectedItemId(selectedSlot);\n        if (!itemId) return;\n        const target = getTargetBlock(scene, camera, BLOCK);', '    function placeBlock() {\n        const itemId = getSelectedItemId(selectedSlot);\n        if (!itemId) return;\n        if (tryIgniteTNT(scene, camera, itemId)) {\n            if (consumeSelected(selectedSlot)) sendPlayerAction("place");\n            return;\n        }\n        const target = getTargetBlock(scene, camera, BLOCK);'),
    ('    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;\n    return 0xb0b0b0;', '    if (blockType === BLOCK.BEDROCK) return 0x3e3e3e;\n    if (blockType === BLOCK.TNT) return 0xd33a2c;\n    return 0xb0b0b0;')
])

Path('src/tnt.js').write_text(r'''import * as THREE from "three";
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
    if (primed.has(key) || getBlockAt(x, y, z) !== getBlockTypes().TNT) return false;
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
        particle.userData.createdAt = start;
        scene.add(particle);
        particles.push(particle);
    }

    const update = time => {
        const age = time - start;
        flash.intensity = Math.max(0, 9 * (1 - age / 220));
        let alive = age < 650;
        for (const particle of particles) {
            if (!particle.parent) continue;
            if (age >= 650) {
                particle.parent.remove(particle);
                particle.material.dispose();
                continue;
            }
            particle.userData.velocity.y -= 11 / 60;
            particle.position.addScaledVector(particle.userData.velocity, 1 / 60);
            particle.rotation.x += 0.18;
            particle.rotation.y += 0.14;
            particle.material.opacity = Math.max(0, 1 - age / 650);
        }
        if (alive) requestAnimationFrame(update);
        else {
            scene.remove(flash);
            flash.dispose();
            geometry.dispose();
        }
    };
    requestAnimationFrame(update);
}

function explode(scene, cx, cy, cz) {
    const BLOCK = getBlockTypes();
    for (let x = Math.floor(cx - EXPLOSION_RADIUS); x <= Math.floor(cx + EXPLOSION_RADIUS); x++) {
        for (let y = Math.floor(cy - EXPLOSION_RADIUS); y <= Math.floor(cy + EXPLOSION_RADIUS); y++) {
            for (let z = Math.floor(cz - EXPLOSION_RADIUS); z <= Math.floor(cz + EXPLOSION_RADIUS); z++) {
                const dx = x - cx;
                const dy = y - cy;
                const dz = z - cz;
                const distance = Math.hypot(dx, dy, dz);
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
''')
