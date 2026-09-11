import * as THREE from "three";
import { getRemotePlayers, isMultiplayerActive } from "./multiplayerClient.js";

const avatars = new Map();
let animationStarted = false;

const SKIN_COLORS = [0xf3d2b6, 0xe6b892, 0xd39a72, 0xb87752, 0x965d43, 0x714331];
const HAIR_COLORS = [0x17110d, 0x2a1a12, 0x4a2d1c, 0x6b4125, 0x7a4a2b, 0xa36b3d];
const SHIRT_COLORS = [0x3f6fa2, 0x5e8d47, 0xa34e43, 0x815c9f, 0xc0783a, 0x3f817b, 0x666b70, 0x40577c];
const PANTS_COLORS = [0x273b53, 0x344444, 0x4a382f, 0x39475d, 0x4a4a4a, 0x3c2e32];
const SHOE_COLORS = [0x1c1815, 0x302a25, 0x50555a, 0x232a35];

function hashString(value) {
    let h = 2166136261 >>> 0;
    const text = String(value ?? "");
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function makeRng(seed) {
    let value = seed >>> 0;
    return () => {
        value += 0x6D2B79F5;
        let t = value;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shade(hex, amount) {
    const color = new THREE.Color(hex);
    color.offsetHSL(0, 0, amount);
    return `#${color.getHexString()}`;
}

function makeCanvasTexture(draw) {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
}

function makeFaceTexture(seed, skinHex, hairHex) {
    const rng = makeRng(seed ^ 0xF00DBAAD);
    const skinMain = `#${new THREE.Color(skinHex).getHexString()}`;
    const skinLight = shade(skinHex, 0.035);
    const skinDark = shade(skinHex, -0.055);
    const hairMain = `#${new THREE.Color(hairHex).getHexString()}`;
    const hairLight = shade(hairHex, 0.04);
    const eye = rng() > 0.5 ? "#171717" : "#2b211b";
    return makeCanvasTexture(ctx => {
        ctx.fillStyle = skinMain; ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = skinDark; ctx.fillRect(0, 4, 2, 9); ctx.fillRect(14, 4, 2, 9); ctx.fillRect(2, 13, 12, 3);
        ctx.fillStyle = skinLight; ctx.fillRect(3, 5, 10, 7);
        ctx.fillStyle = hairMain; ctx.fillRect(0, 0, 16, 4); ctx.fillRect(1, 3, 14, 2);
        for (let x = 1; x < 15; x++) if (rng() > 0.38) ctx.fillRect(x, 4 + Math.floor(rng() * 2), 1, 1);
        if (rng() > 0.55) ctx.fillRect(0, 2, 2, 4);
        if (rng() > 0.55) ctx.fillRect(14, 2, 2, 4);
        ctx.fillStyle = eye; ctx.fillRect(4, 7, 2, 2); ctx.fillRect(10, 7, 2, 2);
        if (rng() > 0.68) { ctx.fillStyle = "#6d8794"; ctx.fillRect(5, 7, 1, 1); ctx.fillRect(10, 7, 1, 1); }
        ctx.fillStyle = skinDark; ctx.fillRect(7, 9, 2, 1); ctx.fillRect(8, 10, 1, 1);
        ctx.fillStyle = rng() > 0.5 ? "#7c3f3d" : "#6b3431"; ctx.fillRect(6, 12, 4, 1);
        if (rng() > 0.55) { ctx.fillStyle = shade(skinHex, -0.025); ctx.fillRect(3, 10, 2, 1); ctx.fillRect(11, 10, 2, 1); }
        ctx.fillStyle = hairLight;
        if (rng() > 0.6) ctx.fillRect(4, 1, 2, 1);
        if (rng() > 0.6) ctx.fillRect(10, 2, 2, 1);
    });
}

function makeHeadTexture(seed, skinHex, hairHex, variant) {
    const rng = makeRng(seed ^ (variant * 0x27D4EB2D));
    const base = `#${new THREE.Color(skinHex).getHexString()}`;
    const light = shade(skinHex, 0.025);
    const dark = shade(skinHex, -0.075);
    const hair = `#${new THREE.Color(hairHex).getHexString()}`;
    const hairLight = shade(hairHex, 0.06);
    return makeCanvasTexture(ctx => {
        if (variant === 2) {
            // Top of the head: solid hair coverage so the cube never has a bald spot.
            ctx.fillStyle = hair;
            ctx.fillRect(0, 0, 16, 16);
            ctx.fillStyle = hairLight;
            for (let y = 1; y < 15; y += 3) {
                for (let x = (y % 2) + 1; x < 16; x += 4) ctx.fillRect(x, y, 2, 1);
            }
            ctx.fillStyle = shade(hairHex, -0.055);
            for (let x = 1; x < 16; x += 4) ctx.fillRect(x, 12, 2, 1);
            return;
        }

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = light;
        for (let i = 0; i < 10; i++) ctx.fillRect(Math.floor(rng() * 14) + 1, Math.floor(rng() * 13) + 2, 1, 1);
        ctx.fillStyle = dark;
        for (let i = 0; i < 8; i++) ctx.fillRect(Math.floor(rng() * 14) + 1, Math.floor(rng() * 13) + 2, 1, 1);
        ctx.fillStyle = hair;

        if (variant === 0) {
            ctx.fillRect(0, 0, 16, 4);
            ctx.fillRect(1, 3, 14, 3);
            for (let x = 0; x < 16; x += 3) ctx.fillRect(x, 4, 1, 2);
        } else {
            ctx.fillRect(0, 0, 16, 3);
            ctx.fillRect(0, 2, 5, 6);
            ctx.fillRect(11, 2, 5, 6);
        }

        ctx.fillStyle = hairLight;
        for (let i = 0; i < 5; i++) ctx.fillRect(Math.floor(rng() * 13) + 1, Math.floor(rng() * 5), 1, 1);
    });
}

function makeClothTexture(seed, baseHex, variant) {
    const rng = makeRng(seed ^ (variant * 0x45D9F3B));
    const dark = shade(baseHex, -0.08), light = shade(baseHex, 0.07), accent = shade(baseHex, rng() > 0.5 ? 0.13 : -0.13);
    const pattern = Math.floor(rng() * 4);
    return makeCanvasTexture(ctx => {
        ctx.fillStyle = baseHex; ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
            const roll = rng();
            if (roll > 0.9) { ctx.fillStyle = light; ctx.fillRect(x, y, 1, 1); }
            else if (roll < 0.08) { ctx.fillStyle = dark; ctx.fillRect(x, y, 1, 1); }
        }
        ctx.fillStyle = dark;
        if (pattern === 0) for (let x = 2; x < 16; x += 4) ctx.fillRect(x, 0, 1, 16);
        else if (pattern === 1) for (let y = 2; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
        else if (pattern === 2) for (let i = -16; i < 32; i += 4) ctx.fillRect(i, 0, 1, 16);
        else { ctx.fillRect(0, 6, 16, 2); ctx.fillRect(6, 0, 2, 16); }
        ctx.fillStyle = accent;
        if (pattern === 3) {
            ctx.fillRect(2, 2, 2, 2); ctx.fillRect(12, 3, 2, 2); ctx.fillRect(4, 12, 2, 2); ctx.fillRect(11, 11, 2, 2);
        } else {
            for (let i = 0; i < 5; i++) ctx.fillRect(Math.floor(rng() * 14) + 1, Math.floor(rng() * 14) + 1, 1, 1);
        }
    });
}

function makeMaterial(textureOrColor, options = {}) {
    if (textureOrColor instanceof THREE.Texture) return new THREE.MeshLambertMaterial({ map: textureOrColor, ...options });
    return new THREE.MeshLambertMaterial({ color: textureOrColor, ...options });
}

function createAvatar(id, name) {
    const rng = makeRng(hashString(id));
    const skinColor = SKIN_COLORS[Math.floor(rng() * SKIN_COLORS.length)];
    const hairColor = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
    const shirtColor = SHIRT_COLORS[Math.floor(rng() * SHIRT_COLORS.length)];
    const pantsColor = PANTS_COLORS[Math.floor(rng() * PANTS_COLORS.length)];
    const shoeColor = SHOE_COLORS[Math.floor(rng() * SHOE_COLORS.length)];
    const faceTexture = makeFaceTexture(hashString(id), skinColor, hairColor);
    const headBack = makeHeadTexture(hashString(id), skinColor, hairColor, 0);
    const headSide = makeHeadTexture(hashString(id), skinColor, hairColor, 1);
    const headTop = makeHeadTexture(hashString(id), skinColor, hairColor, 2);
    const shirtTexture = makeClothTexture(hashString(id), `#${new THREE.Color(shirtColor).getHexString()}`, 1);
    const pantsTexture = makeClothTexture(hashString(id), `#${new THREE.Color(pantsColor).getHexString()}`, 2);
    const skin = makeMaterial(skinColor);
    const face = makeMaterial(faceTexture);
    const back = makeMaterial(headBack);
    const side = makeMaterial(headSide);
    const top = makeMaterial(headTop);
    const shirt = makeMaterial(shirtTexture);
    const pants = makeMaterial(pantsTexture);
    const shoes = makeMaterial(shoeColor);

    const group = new THREE.Group();
    group.userData.multiplayerAvatar = true;

    // BoxGeometry material order is +X, -X, +Y, -Y, +Z, -Z.
    // The player's visible/front-facing side is the -Z side in this avatar setup.
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.62, 0.62),
        [side, side, top, skin, back, face]
    );
    head.position.y = 1.8;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.78, 0.44), shirt); torso.position.y = 1.1;
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.38), shirt); leftArm.position.set(-0.53, 1.23, 0);
    const rightArm = leftArm.clone(); rightArm.position.x = 0.53;
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.38), skin); leftHand.position.set(-0.53, 0.86, 0);
    const rightHand = leftHand.clone(); rightHand.position.x = 0.53;
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.40), pants); leftLeg.position.set(-0.2, 0.35, 0);
    const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.2;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.46), shoes); leftShoe.position.set(-0.2, 0.09, -0.025);
    const rightShoe = leftShoe.clone(); rightShoe.position.x = 0.2;
    group.add(head, torso, leftArm, rightArm, leftHand, rightHand, leftLeg, rightLeg, leftShoe, rightShoe);

    const nameCanvas = document.createElement("canvas"); nameCanvas.width = 384; nameCanvas.height = 72;
    const ctx = nameCanvas.getContext("2d"); const text = String(name || "Player").slice(0, 16);
    ctx.clearRect(0, 0, 384, 72); ctx.font = "bold 30px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 8; ctx.strokeStyle = "rgba(0,0,0,.9)"; ctx.fillStyle = "#fff"; ctx.strokeText(text, 192, 36); ctx.fillText(text, 192, 36);
    const nameTexture = new THREE.CanvasTexture(nameCanvas); nameTexture.colorSpace = THREE.SRGBColorSpace; nameTexture.minFilter = THREE.LinearFilter; nameTexture.magFilter = THREE.LinearFilter;
    const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTexture, transparent: true, depthTest: false })); nameSprite.scale.set(Math.max(1.1, Math.min(2.8, 0.8 + text.length * 0.13)), 0.36, 1); nameSprite.position.y = 2.28; group.add(nameSprite);
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });

    return { group, parts: { head, torso, leftArm, rightArm, leftHand, rightHand, leftLeg, rightLeg, leftShoe, rightShoe } };
}

function disposeAvatar(group) {
    const materials = new Set();
    group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) for (const material of (Array.isArray(child.material) ? child.material : [child.material])) materials.add(material);
    });
    for (const material of materials) { if (material.map) material.map.dispose(); material.dispose(); }
}

function animateAvatar(entry, player, time) {
    const parts = entry.parts;
    const previous = entry.lastPosition;
    const current = entry.group.position;
    const dx = current.x - previous.x;
    const dz = current.z - previous.z;
    const speed = Math.hypot(dx, dz) / Math.max(entry.lastTimeDelta, 1 / 60);
    entry.lastPosition.copy(current);
    entry.lastTimeDelta = Math.max((time - entry.lastTime) / 1000, 1 / 60);
    entry.lastTime = time;

    const moving = String(player.action || "") === "walk" || speed > 0.35;
    const phase = time * 0.014 + entry.walkPhase;
    const swing = moving ? Math.sin(phase) * Math.min(0.72, 0.28 + speed * 0.08) : 0;
    const bob = moving ? Math.abs(Math.sin(phase * 2)) * 0.045 : 0;

    parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, swing, 0.35);
    parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, -swing, 0.35);
    parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, -swing * 0.8, 0.35);
    parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, swing * 0.8, 0.35);
    parts.leftHand.rotation.x = THREE.MathUtils.lerp(parts.leftHand.rotation.x, -swing * 0.35, 0.35);
    parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, swing * 0.35, 0.35);
    parts.torso.position.y = THREE.MathUtils.lerp(parts.torso.position.y, 1.1 + bob, 0.3);
    parts.head.position.y = THREE.MathUtils.lerp(parts.head.position.y, 1.8 + bob * 0.7, 0.3);

    const action = String(player.action || "idle");
    if (action === "mine") {
        const pulse = Math.sin((time - entry.actionStarted) * 0.035);
        const target = -1.05 - Math.max(0, pulse) * 0.65;
        parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, target, 0.5);
        parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, target * 0.55, 0.5);
        parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, -0.08, 0.25);
    } else if (action === "place") {
        const pulse = Math.sin((time - entry.actionStarted) * 0.028);
        const target = -0.35 + Math.max(0, pulse) * 0.9;
        parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, target, 0.45);
        parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, target * 0.7, 0.45);
    } else {
        parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, 0, 0.2);
    }
}

export function updateMultiplayerAvatars(scene) {
    if (!isMultiplayerActive()) {
        for (const entry of avatars.values()) { scene.remove(entry.group); disposeAvatar(entry.group); }
        avatars.clear();
        return;
    }

    const players = getRemotePlayers();
    const now = performance.now();
    for (const [id, player] of players) {
        if (!player?.position) continue;
        let entry = avatars.get(id);
        if (!entry) {
            const avatar = createAvatar(id, player.name);
            scene.add(avatar.group);
            entry = {
                ...avatar,
                target: new THREE.Vector3(),
                lastPosition: new THREE.Vector3(Number(player.position.x) || 0, (Number(player.position.y) || 0) - 1.8, Number(player.position.z) || 0),
                lastTime: now,
                lastTimeDelta: 1 / 60,
                walkPhase: hashString(id) % 1000,
                actionStarted: now,
                lastAction: "idle"
            };
            entry.group.position.copy(entry.lastPosition);
            avatars.set(id, entry);
        }

        entry.target.set(Number(player.position.x) || 0, (Number(player.position.y) || 0) - 1.8, Number(player.position.z) || 0);
        entry.group.position.lerp(entry.target, 0.32);

        const targetYaw = Number(player.rotation?.y) || 0;
        entry.group.rotation.y = THREE.MathUtils.lerp(entry.group.rotation.y, targetYaw, 0.35);

        const rawPitch = Number(player.rotation?.x) || 0;
        const targetPitch = THREE.MathUtils.clamp(rawPitch, -1.25, 1.25);
        const parts = entry.parts;
        parts.head.rotation.order = "YXZ";
        parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, targetPitch, 0.28);
        parts.head.rotation.y = THREE.MathUtils.lerp(parts.head.rotation.y, 0, 0.35);
        parts.head.rotation.z = THREE.MathUtils.lerp(parts.head.rotation.z, 0, 0.35);

        const action = String(player.action || "idle");
        if (action !== entry.lastAction) { entry.lastAction = action; entry.actionStarted = now; }
        animateAvatar(entry, player, now);
    }

    for (const [id, entry] of avatars) {
        if (!players.has(id)) { scene.remove(entry.group); disposeAvatar(entry.group); avatars.delete(id); }
    }
}

export function initMultiplayerAvatars(scene) {
    if (animationStarted) return;
    animationStarted = true;
    const tick = () => { updateMultiplayerAvatars(scene); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
}
