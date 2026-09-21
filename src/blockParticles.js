import * as THREE from "three";
import { getBlockAt, getBlockTypes } from "./world.js";

const textureLoader = new THREE.TextureLoader();
const fragmentCache = new Map();

const BASE_TEXTURES = {
    1: "grass_block_side.png",
    2: "dirt.png",
    3: "stone.png",
    4: "sand.png",
    5: "oak_log.png",
    6: "oak-leaves-normal-original-default.png",
    7: "cobblestone.png",
    8: "gravel.png",
    9: "sandstone.png",
    10: "bedrock.png",
    11: "coal_ore.png",
    12: "iron_ore.png",
    13: "oak_planks.png",
    14: "snow.png",
    15: "tnt_side.png",
    18: "bricks.png",
    19: "stone_bricks.png",
    20: "cracked_stone_bricks.png",
    21: "mossy_stone_bricks.png",
    22: "dirt_path_top.png",
    23: "acacia_planks.png",
    24: "bamboo_planks.png",
    25: "birch_planks.png",
    26: "crimson_planks.png",
    27: "dark_oak_planks.png",
    28: "jungle_planks.png",
    29: "mangrove_planks.png",
    30: "spruce_planks.png",
    31: "warped_planks.png",
    32: "blast_furnace_side.png",
    33: "chiseled_deepslate.png",
    34: "cobbled_deepslate.png",
    35: "cracked_deepslate_bricks.png",
    36: "cracked_deepslate_tiles.png",
    37: "deepslate.png",
    38: "deepslate_bricks.png",
    39: "deepslate_coal_ore.png",
    40: "deepslate_copper_ore.png",
    41: "deepslate_diamond_ore.png",
    42: "deepslate_emerald_ore.png",
    43: "deepslate_gold_ore.png",
    44: "deepslate_iron_ore.png",
    45: "deepslate_lapis_ore.png",
    46: "deepslate_redstone_ore.png",
    47: "deepslate_tiles.png",
    48: "polished_deepslate.png",
    49: "reinforced_deepslate_side.png",
    50: "furnace_side.png"
};

const SLAB_BASES = [
    3, 7, 19, 20, 21,
    13, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    33, 34, 35, 36, 37, 38, 47, 48, 49
];

const WOOD_TEXTURES = [
    "oak_planks.png",
    "acacia_planks.png",
    "bamboo_planks.png",
    "birch_planks.png",
    "crimson_planks.png",
    "dark_oak_planks.png",
    "jungle_planks.png",
    "mangrove_planks.png",
    "spruce_planks.png",
    "warped_planks.png"
];

function textureUrl(name) {
    return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`;
}

function textureNameFor(type) {
    type = Math.floor(Number(type));
    if (BASE_TEXTURES[type]) return BASE_TEXTURES[type];

    if (type >= 51 && type <= 74) {
        const baseType = SLAB_BASES[type - 51];
        return BASE_TEXTURES[baseType] || null;
    }

    if (type >= 75 && type <= 154) {
        return WOOD_TEXTURES[(type - 75) % WOOD_TEXTURES.length];
    }

    return null;
}

function fallbackMaterial(type) {
    const colors = {
        1: 0x72a83b, 2: 0x8b5a3a, 3: 0x8e8e8e, 4: 0xd8c085,
        5: 0x8d5d35, 6: 0x3f8d3a, 7: 0x777777, 8: 0x8c816e,
        9: 0xd6bf8f, 10: 0x4b4b4b, 11: 0x343434, 12: 0x969696,
        13: 0xb88b55, 14: 0xf1f7ff, 15: 0xd73535
    };
    return colors[type] ?? 0xaaaaaa;
}

function makeFragmentTexture(image, seed) {
    const width = Number(image?.naturalWidth || image?.width || 0);
    const height = Number(image?.naturalHeight || image?.height || 0);
    if (!width || !height) return null;

    const size = Math.min(width, height);
    const patch = Math.max(2, Math.min(5, Math.floor(size * 0.28)));
    const maxX = Math.max(0, width - patch);
    const maxY = Math.max(0, height - patch);
    const rand = THREE.MathUtils.clamp(seed, 0, 0.999999);
    const seed2 = (seed * 17.371 + 0.193) % 1;
    const sx = Math.floor(rand * (maxX + 1));
    const sy = Math.floor(seed2 * (maxY + 1));

    const canvas = document.createElement("canvas");
    canvas.width = patch;
    canvas.height = patch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, patch, patch);
    ctx.drawImage(image, sx, sy, patch, patch, 0, 0, patch, patch);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
}

function materialForFragment(type, seed) {
    const name = textureNameFor(type);
    const material = new THREE.MeshBasicMaterial({
        color: fallbackMaterial(type),
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        toneMapped: false
    });

    if (!name) return material;

    const cacheKey = name + ":" + Math.floor(seed * 8);
    const cached = fragmentCache.get(cacheKey);
    if (cached) {
        material.map = cached;
        material.color.set(0xffffff);
        material.needsUpdate = true;
        return material;
    }

    textureLoader.load(textureUrl(name), texture => {
        const fragment = makeFragmentTexture(texture.image, seed);
        if (!fragment) return;
        fragmentCache.set(cacheKey, fragment);
        material.map = fragment;
        material.color.set(0xffffff);
        material.needsUpdate = true;
        texture.dispose();
    }, undefined, () => {});

    return material;
}

function disposeParticle(particle) {
    particle.parent?.remove(particle);
    particle.material?.map?.dispose?.();
    particle.material?.dispose?.();
    particle.geometry?.dispose?.();
}

export function spawnBlockBreakParticles(scene, center, type) {
    if (!scene || !center) return;

    const particles = [];
    const start = performance.now();
    const count = 14;
    const baseGeometry = new THREE.BoxGeometry(1, 1, 1);
    const block = getBlockTypes();

    for (let i = 0; i < count; i++) {
        const size = i < 4 ? 0.032 + Math.random() * 0.018 : 0.048 + Math.random() * 0.026;
        const particle = new THREE.Mesh(baseGeometry.clone(), materialForFragment(type, Math.random()));
        particle.scale.setScalar(size);
        particle.position.copy(center).add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.68,
            (Math.random() - 0.5) * 0.68,
            (Math.random() - 0.5) * 0.68
        ));

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 3.4,
            1.8 + Math.random() * 3.0,
            (Math.random() - 0.5) * 3.4
        );
        velocity.addScaledVector(
            new THREE.Vector3(
                particle.position.x - center.x,
                particle.position.y - center.y,
                particle.position.z - center.z
            ).normalize(),
            0.5 + Math.random() * 1.2
        );

        particle.userData.velocity = velocity;
        particle.userData.rotation = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        particle.userData.start = start;
        scene.add(particle);
        particles.push(particle);
    }

    function tick(now) {
        let alive = false;
        const dt = Math.min(0.033, Math.max(0.001, (now - tick.last) / 1000));
        tick.last = now;

        for (const particle of particles) {
            if (!particle.parent) continue;

            const age = now - particle.userData.start;
            const life = 760 + (particle.id % 4) * 55;
            if (age >= life) {
                disposeParticle(particle);
                continue;
            }

            alive = true;
            const velocity = particle.userData.velocity;
            velocity.y -= 8.6 * dt;
            velocity.x *= Math.exp(-0.7 * dt);
            velocity.z *= Math.exp(-0.7 * dt);
            particle.position.addScaledVector(velocity, dt);

            const groundX = Math.floor(particle.position.x + 0.5);
            const groundY = Math.floor(particle.position.y - 0.045 + 0.5);
            const groundZ = Math.floor(particle.position.z + 0.5);
            const support = getBlockAt(groundX, groundY, groundZ);
            if (support !== block.AIR && velocity.y < 0 && particle.position.y <= groundY + 0.545) {
                particle.position.y = groundY + 0.545;
                velocity.y *= -0.24;
                velocity.x *= 0.72;
                velocity.z *= 0.72;
            }

            particle.rotation.x += particle.userData.rotation.x * dt;
            particle.rotation.y += particle.userData.rotation.y * dt;
            particle.rotation.z += particle.userData.rotation.z * dt;

            const fadeStart = life * 0.55;
            particle.material.opacity = age <= fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / (life - fadeStart));
        }

        if (alive) requestAnimationFrame(tick);
        else baseGeometry.dispose();
    }

    tick.last = start;
    requestAnimationFrame(tick);
}
