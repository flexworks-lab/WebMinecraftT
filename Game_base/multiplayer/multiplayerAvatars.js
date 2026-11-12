import * as THREE from "three";
import { getRemotePlayers, isMultiplayerActive } from "./multiplayerClient.js";
import * as blockMaterials from "../world/blocks.js";
import { getCharacterAppearanceId, readCharacterTextureRecord } from "../player/appearanceIdentity.js";

const avatars = new Map();
let animationStarted = false;
const HEAD_TURN_LIMIT = 1.35;

const SKIN_COLORS = [0xf3d2b6, 0xe6b892, 0xd39a72, 0xb87752, 0x965d43, 0x714331];
const HAIR_COLORS = [0x17110d, 0x2a1a12, 0x4a2d1c, 0x6b4125, 0x7a4a2b, 0xa36b3d];
const SHIRT_COLORS = [0x3f6fa2, 0x5e8d47, 0xa34e43, 0x815c9f, 0xc0783a, 0x3f817b, 0x666b70, 0x40577c];
const PANTS_COLORS = [0x273b53, 0x344444, 0x4a382f, 0x39475d, 0x4a4a4a, 0x3c2e32];
const SHOE_COLORS = [0x1c1815, 0x302a25, 0x50555a, 0x232a35];

const HELD_BASE_MATERIAL_KEYS = {
    1:"grassMaterial",2:"dirtMaterial",3:"stoneMaterial",4:"sandMaterial",5:"oakLogMaterial",
    6:"leavesMaterial",7:"cobblestoneMaterial",8:"gravelMaterial",9:"sandstoneMaterial",10:"bedrockMaterial",
    11:"coalMaterial",12:"ironMaterial",13:"oakPlankMaterial",14:"snowMaterial",15:"tntMaterial",
    18:"bricksMaterial",19:"stoneBricksMaterial",20:"crackedStoneBricksMaterial",21:"mossyStoneBricksMaterial",
    22:"dirtPathMaterial",23:"acaciaPlanksMaterial",24:"bambooPlanksMaterial",25:"birchPlanksMaterial",
    26:"crimsonPlanksMaterial",27:"darkOakPlanksMaterial",28:"junglePlanksMaterial",29:"mangrovePlanksMaterial",
    30:"sprucePlanksMaterial",31:"warpedPlanksMaterial",32:"blastFurnaceMaterial",33:"chiseledDeepslateMaterial",
    34:"cobbledDeepslateMaterial",35:"crackedDeepslateBricksMaterial",36:"crackedDeepslateTilesMaterial",
    37:"deepslateMaterial",38:"deepslateBricksMaterial",39:"deepslateCoalOreMaterial",40:"deepslateCopperOreMaterial",
    41:"deepslateDiamondOreMaterial",42:"deepslateEmeraldOreMaterial",43:"deepslateGoldOreMaterial",
    44:"deepslateIronOreMaterial",45:"deepslateLapisOreMaterial",46:"deepslateRedstoneOreMaterial",
    47:"deepslateTilesMaterial",48:"polishedDeepslateMaterial",49:"reinforcedDeepslateMaterial",50:"furnaceMaterial"
};

const HELD_VARIANT_BASE = {
    51:3,52:7,53:19,54:20,55:21,56:13,57:23,58:24,59:25,60:26,
    61:27,62:28,63:29,64:30,65:31,66:33,67:34,68:35,69:36,70:37,
    71:38,72:47,73:48,74:49,75:13,76:23,77:24,78:25,79:26,80:27,
    81:28,82:29,83:30,84:31
};

function heldSourceMaterial(itemId) {
    const id = Math.floor(Number(itemId) || 0);
    if ((id >= 155 && id <= 184) || (id >= 191 && id <= 223)) return blockMaterials.extraBlockMaterials?.[id] || null;
    const baseId = HELD_VARIANT_BASE[id] || id;
    const key = HELD_BASE_MATERIAL_KEYS[baseId];
    return key ? blockMaterials[key] || null : null;
}

function cloneHeldMaterial(material) {
    if (!material?.clone) return material;
    const copy = material.clone();
    copy.vertexColors = false;
    copy.needsUpdate = true;
    if (copy.color) copy.color.setRGB(1,1,1);
    return copy;
}

function makeHeldMaterials(itemId) {
    const source = heldSourceMaterial(itemId);
    if (!source) return null;
    return Array.isArray(source) ? source.map(cloneHeldMaterial) : cloneHeldMaterial(source);
}

function createHeldBlock() {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.38,0.38,0.38),
        cloneHeldMaterial(blockMaterials.stoneMaterial)
    );
    mesh.name = "multiplayerHandBlock";
    mesh.position.set(0,-0.09,-0.30);
    mesh.rotation.set(0.12,0.35,-0.08);
    mesh.visible = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.itemId = 0;
    return mesh;
}

function syncHeldBlock(entry, player) {
    const hand = entry.parts?.rightHand;
    if (!hand) return;

    if (!entry.heldBlock) {
        entry.heldBlock = createHeldBlock();
        hand.add(entry.heldBlock);
    }

    const itemId = Math.floor(Number(player?.heldItemId) || 0);
    const source = heldSourceMaterial(itemId);
    if (!source) {
        entry.heldBlock.visible = false;
        entry.heldBlock.userData.itemId = 0;
        return;
    }

    if (entry.heldBlock.userData.itemId !== itemId) {
        const next = makeHeldMaterials(itemId);
        if (next) {
            const previous = entry.heldBlock.material;
            entry.heldBlock.material = next;
            for (const material of (Array.isArray(previous) ? previous : [previous])) material?.dispose?.();
            entry.heldBlock.userData.itemId = itemId;
        }
    }

    const isSlab = itemId >= 51 && itemId <= 74;
    const isStair = itemId >= 75 && itemId <= 84;
    entry.heldBlock.scale.set(
        isStair || isSlab ? 0.76 : 0.92,
        isStair || isSlab ? 0.42 : 0.92,
        isStair ? 0.76 : 0.92
    );
    entry.heldBlock.position.set(0, isStair || isSlab ? -0.04 : -0.09, -0.30);
    entry.heldBlock.rotation.set(0.12,0.35,-0.08);
    entry.heldBlock.visible = true;
}


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
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.userData = { canvas, size: 16, proceduralAvatarTexture: true };
    texture.needsUpdate = true;
    return texture;
}

function makeSolidTexture(hex) {
    return makeCanvasTexture(ctx => {
        ctx.fillStyle = `#${new THREE.Color(hex).getHexString()}`;
        ctx.fillRect(0, 0, 16, 16);
    });
}

export const AVATAR_TEXTURE_PARTS = [
    { key: "face", label: "Face" },
    { key: "headBack", label: "Head back" },
    { key: "headSide", label: "Head sides" },
    { key: "headTop", label: "Hair / top" },
    { key: "skin", label: "Skin" },
    { key: "hand", label: "Hand" },
    { key: "shirt", label: "Shirt / arms" },
    { key: "pants", label: "Pants / legs" },
    { key: "shoes", label: "Shoes" }
];

export function exportAvatarTextureData(textures) {
    const result = {};
    for (const { key } of AVATAR_TEXTURE_PARTS) {
        const canvas = textures?.[key]?.userData?.canvas;
        if (canvas) result[key] = canvas.toDataURL("image/png");
    }
    return result;
}

export function resetAvatarTextureData(textures) {
    for (const { key } of AVATAR_TEXTURE_PARTS) {
        const texture = textures?.[key];
        const canvas = texture?.userData?.canvas;
        const pixels = texture?.userData?.proceduralBasePixels;
        if (!canvas || !pixels) continue;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.putImageData(pixels, 0, 0);
        texture.needsUpdate = true;
    }
}

export function applyAvatarTextureData(textures, savedTextures) {
    const jobs = [];
    for (const { key } of AVATAR_TEXTURE_PARTS) {
        // Older saved skins do not have a dedicated Hand map; carry their Skin map forward.
        const dataUrl = key === "hand" ? (savedTextures?.hand || savedTextures?.skin) : savedTextures?.[key];
        const canvas = textures?.[key]?.userData?.canvas;
        const texture = textures?.[key];
        if (!canvas || !texture || typeof dataUrl !== "string" ||
            !dataUrl.startsWith("data:image/") || dataUrl.length > 50000) continue;

        jobs.push(new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.clearRect(0, 0, 16, 16);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, 16, 16);
                texture.needsUpdate = true;
                resolve(true);
            };
            image.onerror = () => resolve(false);
            image.src = dataUrl;
        }));
    }
    return Promise.all(jobs);
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
    if (textureOrColor instanceof THREE.Texture) {
        return new THREE.MeshLambertMaterial({
            map: textureOrColor,
            transparent: true,
            alphaTest: 0.01,
            ...options
        });
    }
    return new THREE.MeshLambertMaterial({ color: textureOrColor, ...options });
}

export function createAvatar(id, name, savedTextures = null, appearanceId = id) {
    const appearanceSeed = String(appearanceId || id);
    const seededHash = hashString(appearanceSeed);
    const rng = makeRng(seededHash);
    const skinColor = SKIN_COLORS[Math.floor(rng() * SKIN_COLORS.length)];
    const hairColor = HAIR_COLORS[Math.floor(rng() * HAIR_COLORS.length)];
    const shirtColor = SHIRT_COLORS[Math.floor(rng() * SHIRT_COLORS.length)];
    const pantsColor = PANTS_COLORS[Math.floor(rng() * PANTS_COLORS.length)];
    const shoeColor = SHOE_COLORS[Math.floor(rng() * SHOE_COLORS.length)];
    const faceTexture = makeFaceTexture(seededHash, skinColor, hairColor);
    const headBack = makeHeadTexture(seededHash, skinColor, hairColor, 0);
    const headSide = makeHeadTexture(seededHash, skinColor, hairColor, 1);
    const headTop = makeHeadTexture(seededHash, skinColor, hairColor, 2);
    const shirtTexture = makeClothTexture(seededHash, `#${new THREE.Color(shirtColor).getHexString()}`, 1);
    const pantsTexture = makeClothTexture(seededHash, `#${new THREE.Color(pantsColor).getHexString()}`, 2);
    const skinTexture = makeSolidTexture(skinColor);
    const handTexture = makeSolidTexture(skinColor);
    const shoeTexture = makeSolidTexture(shoeColor);
    const textures = {
        face: faceTexture,
        headBack,
        headSide,
        headTop,
        skin: skinTexture,
        hand: handTexture,
        shirt: shirtTexture,
        pants: pantsTexture,
        shoes: shoeTexture
    };
    // Keep a private copy of the originally generated pixels. Resetting a skin
    // restores the seeded procedural texture instead of flattening it to gray.
    for (const { key } of AVATAR_TEXTURE_PARTS) {
        const canvas = textures[key]?.userData?.canvas;
        const ctx = canvas?.getContext("2d", { willReadFrequently: true });
        if (ctx) textures[key].userData.proceduralBasePixels = ctx.getImageData(0, 0, 16, 16);
    }
    const textureReady = applyAvatarTextureData(textures, savedTextures);
    const skin = makeMaterial(skinTexture);
    const handSkin = makeMaterial(handTexture);
    const face = makeMaterial(faceTexture);
    const back = makeMaterial(headBack);
    const side = makeMaterial(headSide);
    const top = makeMaterial(headTop);
    const shirt = makeMaterial(shirtTexture);
    const pants = makeMaterial(pantsTexture);
    const shoes = makeMaterial(shoeTexture);

    const group = new THREE.Group();
    group.userData.multiplayerAvatar = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), [side, side, top, skin, back, face]);
    head.position.y = 1.8;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.78, 0.44), shirt);
    torso.position.y = 1.1;

    // Limb pivots sit at the shoulders and hips so rotations swing the full
    // limb naturally instead of spinning each box around its centre.
    const leftArm = new THREE.Group();
    leftArm.name = "leftArm";
    leftArm.position.set(-0.53, 1.48, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.38), shirt);
    leftArmMesh.position.y = -0.25;
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.38), handSkin);
    leftHand.name = "leftHand";
    leftHand.position.set(0, -0.62, 0);
    leftArm.add(leftArmMesh, leftHand);

    const rightArm = new THREE.Group();
    rightArm.name = "rightArm";
    rightArm.position.set(0.53, 1.48, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.38), shirt);
    rightArmMesh.position.y = -0.25;
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.16, 0.38), handSkin);
    rightHand.name = "rightHand";
    rightHand.position.set(0, -0.62, 0);
    rightArm.add(rightArmMesh, rightHand);

    const leftLeg = new THREE.Group();
    leftLeg.name = "leftLeg";
    leftLeg.position.set(-0.2, 0.70, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.40), pants);
    leftLegMesh.position.y = -0.35;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.46), shoes);
    leftShoe.position.set(0, -0.61, -0.025);
    leftLeg.add(leftLegMesh, leftShoe);

    const rightLeg = new THREE.Group();
    rightLeg.name = "rightLeg";
    rightLeg.position.set(0.2, 0.70, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.7, 0.40), pants);
    rightLegMesh.position.y = -0.35;
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.46), shoes);
    rightShoe.position.set(0, -0.61, -0.025);
    rightLeg.add(rightLegMesh, rightShoe);

    group.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);

    const nameCanvas = document.createElement("canvas"); nameCanvas.width = 384; nameCanvas.height = 72;
    const ctx = nameCanvas.getContext("2d"); const text = String(name || "Player").slice(0, 16);
    ctx.clearRect(0, 0, 384, 72); ctx.font = "bold 30px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 8; ctx.strokeStyle = "rgba(0,0,0,.9)"; ctx.fillStyle = "#fff"; ctx.strokeText(text, 192, 36); ctx.fillText(text, 192, 36);
    const nameTexture = new THREE.CanvasTexture(nameCanvas); nameTexture.colorSpace = THREE.SRGBColorSpace; nameTexture.minFilter = THREE.LinearFilter; nameTexture.magFilter = THREE.LinearFilter;
    const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nameTexture, transparent: true, depthTest: false })); nameSprite.scale.set(Math.max(1.1, Math.min(2.8, 0.8 + text.length * 0.13)), 0.36, 1); nameSprite.position.y = 2.28; group.add(nameSprite);
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return {
        group,
        parts: { head, torso, leftArm, rightArm, leftHand, rightHand, leftLeg, rightLeg, leftShoe, rightShoe },
        textures,
        textureReady
    };
}

function disposeAvatar(group) {
    const materials = new Set();
    group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) for (const material of (Array.isArray(child.material) ? child.material : [child.material])) materials.add(material);
    });
    for (const material of materials) { if (material.map) material.map.dispose(); material.dispose(); }
}

function shortestAngleDelta(from, to) {
    return THREE.MathUtils.euclideanModulo(to - from + Math.PI, Math.PI * 2) - Math.PI;
}

function normalizeAngle(angle) {
    return THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI;
}

function animateAvatar(entry, player, time) {
    const parts = entry.parts;
    const sneaking = Boolean(player.sneaking);
    const crouch = sneaking ? 1 : 0;
    const previous = entry.lastPosition;
    const current = entry.group.position;
    const dx = current.x - previous.x;
    const dz = current.z - previous.z;
    const delta = Math.max(entry.lastTimeDelta || 1 / 60, 1 / 120);
    const speed = Math.hypot(dx, dz) / delta;
    entry.lastPosition.copy(current);
    entry.lastTimeDelta = Math.max((time - entry.lastTime) / 1000, 1 / 60);
    entry.lastTime = time;

    if (speed > 0.35) {
        const movementYaw = Math.atan2(dx, -dz);
        const turn = shortestAngleDelta(entry.bodyYaw, movementYaw);
        entry.bodyYaw = normalizeAngle(entry.bodyYaw + turn * 0.18);
    }
    entry.group.rotation.y = entry.bodyYaw;

    const action = String(player.action || "idle");
    const moving = action === "walk" || speed > 0.35;
    const cadence = THREE.MathUtils.clamp(speed / 4.3, 0.75, 1.5);
    const phase = time * 0.0105 * cadence + entry.walkPhase;
    const stride = moving ? Math.sin(phase) * Math.min(0.92, 0.38 + speed * 0.12) : 0;
    const bob = moving ? Math.abs(Math.sin(phase * 2)) * 0.055 : 0;
    const blend = Math.min(1, delta * 18);

    // Opposing arm and leg swings create a readable Minecraft-style walk cycle.
    parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, stride + crouch * 0.20, blend);
    parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, -stride - crouch * 0.20, blend);
    parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, -stride * 0.72, blend);
    parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, stride * 0.72, blend);
    parts.leftHand.rotation.x = THREE.MathUtils.lerp(parts.leftHand.rotation.x, -stride * 0.18, blend);
    parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, stride * 0.18, blend);

    parts.leftArm.position.y = THREE.MathUtils.lerp(parts.leftArm.position.y, 1.48 - crouch * 0.16, blend);
    parts.rightArm.position.y = THREE.MathUtils.lerp(parts.rightArm.position.y, 1.48 - crouch * 0.16, blend);
    parts.leftLeg.position.y = THREE.MathUtils.lerp(parts.leftLeg.position.y, 0.70 - crouch * 0.035, blend);
    parts.rightLeg.position.y = THREE.MathUtils.lerp(parts.rightLeg.position.y, 0.70 - crouch * 0.035, blend);
    parts.torso.position.y = THREE.MathUtils.lerp(parts.torso.position.y, 1.1 + bob - crouch * 0.16, blend);
    parts.head.position.y = THREE.MathUtils.lerp(parts.head.position.y, 1.8 + bob * 0.7 - crouch * 0.38, blend);
    parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, crouch * 0.28, blend);
    parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, crouch * 0.18, blend);
    parts.leftArm.rotation.z = THREE.MathUtils.lerp(parts.leftArm.rotation.z, 0, blend);
    parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, 0, blend);

    if (action === "punch") {
        const progress = THREE.MathUtils.clamp((time - entry.actionStarted) / 380, 0, 1);
        let punchAngle;
        if (progress < 0.22) {
            const t = progress / 0.22;
            punchAngle = THREE.MathUtils.lerp(0, -0.58, t * t);
        } else if (progress < 0.55) {
            const t = (progress - 0.22) / 0.33;
            punchAngle = THREE.MathUtils.lerp(-0.58, 1.72, t * (2 - t));
        } else {
            const t = (progress - 0.55) / 0.45;
            punchAngle = THREE.MathUtils.lerp(1.72, 0, t * t * (3 - 2 * t));
        }
        parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, punchAngle, 0.78);
        parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, -0.12, 0.55);
        parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, -0.14, 0.55);
        parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, 0.22 - stride * 0.25, 0.4);
        parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, -0.12 + crouch * 0.28, 0.4);
    } else if (action === "mine") {
        const pulse = Math.sin((time - entry.actionStarted) * 0.035);
        const target = -1.05 - Math.max(0, pulse) * 0.65;
        parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, target, 0.5);
        parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, target * 0.55, 0.5);
        parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, -0.08 + crouch * 0.28, 0.25);
    } else if (action === "place") {
        const pulse = Math.sin((time - entry.actionStarted) * 0.028);
        const target = -0.35 + Math.max(0, pulse) * 0.9;
        parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, target, 0.45);
        parts.rightHand.rotation.x = THREE.MathUtils.lerp(parts.rightHand.rotation.x, target * 0.7, 0.45);
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
            const avatar = createAvatar(id, player.name, player.skinTextures, player.appearanceId || id);
            scene.add(avatar.group);
            window.dispatchEvent(new CustomEvent("webminecraft:multiplayer-avatar-created", { detail: { avatar: avatar.group, playerId: String(id) } }));
            entry = {
                ...avatar,
                target: new THREE.Vector3(),
                lastPosition: new THREE.Vector3(Number(player.position.x) || 0, (Number(player.position.y) || 0) - 1.8, Number(player.position.z) || 0),
                lastTime: now,
                lastTimeDelta: 1 / 60,
                walkPhase: hashString(id) % 1000,
                actionStarted: now,
                lastAction: "idle",
                lastReceivedAction: "idle",
                actionUntil: 0,
                bodyYaw: 0,
                heldBlock: null
            };
            entry.group.position.copy(entry.lastPosition);
            avatars.set(id, entry);
        }

        entry.target.set(Number(player.position.x) || 0, (Number(player.position.y) || 0) - 1.8, Number(player.position.z) || 0);
        entry.group.position.lerp(entry.target, 0.32);

        const action = String(player.action || "idle");
        if (action !== entry.lastReceivedAction) {
            entry.lastReceivedAction = action;
            if (["punch", "mine", "place", "jump"].includes(action)) {
                entry.lastAction = action;
                entry.actionStarted = now;
                entry.actionUntil = now + (action === "punch" ? 380 : 210);
            } else if (now >= entry.actionUntil) {
                entry.lastAction = action;
                entry.actionStarted = now;
            }
        }
        const animationAction = now < entry.actionUntil ? entry.lastAction : action;
        animateAvatar(entry, { ...player, action: animationAction }, now);
        syncHeldBlock(entry, player);

        // Let the head look left/right, but once it reaches the limit the body catches up.
        const rawPitch = Number(player.rotation?.x) || 0;
        const targetPitch = THREE.MathUtils.clamp(rawPitch, -1.25, 1.25);
        const rawLookYaw = Number(player.rotation?.y) || 0;
        let headYawDelta = shortestAngleDelta(entry.bodyYaw, rawLookYaw);
        if (Math.abs(headYawDelta) > HEAD_TURN_LIMIT) {
            const excess = Math.abs(headYawDelta) - HEAD_TURN_LIMIT;
            const turnDirection = headYawDelta > 0 ? 1 : -1;
            entry.bodyYaw = normalizeAngle(entry.bodyYaw + turnDirection * excess * 0.16);
            entry.group.rotation.y = entry.bodyYaw;
            headYawDelta = shortestAngleDelta(entry.bodyYaw, rawLookYaw);
        }

        const targetHeadYaw = THREE.MathUtils.clamp(headYawDelta, -HEAD_TURN_LIMIT, HEAD_TURN_LIMIT);
        const parts = entry.parts;
        parts.head.rotation.order = "YXZ";
        parts.head.rotation.x = THREE.MathUtils.lerp(parts.head.rotation.x, targetPitch, 0.28);
        parts.head.rotation.y = THREE.MathUtils.lerp(parts.head.rotation.y, targetHeadYaw, 0.28);
        parts.head.rotation.z = THREE.MathUtils.lerp(parts.head.rotation.z, 0, 0.35);
    }

    for (const [id, entry] of avatars) {
        if (!players.has(id)) { scene.remove(entry.group); disposeAvatar(entry.group); avatars.delete(id); }
    }
}

window.addEventListener("webminecraft:player-skin-changed", event => {
    const playerId = String(event.detail?.playerId || "");
    const entry = avatars.get(playerId);
    if (!entry) return;
    resetAvatarTextureData(entry.textures);
    void applyAvatarTextureData(entry.textures, event.detail?.textures);
});

let localAvatarEntry = null;
let localAvatarScene = null;
let localAvatarIdentity = "";

function localCharacterName() {
    let user = null;
    try { user = window.firebase?.auth?.()?.currentUser || null; } catch {}
    return String(
        user?.uid && user?.isAnonymous !== true
            ? (localStorage.getItem("webminecraft-account-username") || user.displayName || "Player")
            : (sessionStorage.getItem("webminecraft-guest-name") ||
               localStorage.getItem("webminecraft-player-name") || "Player")
    ).trim().slice(0, 16) || "Player";
}

function disposeLocalAvatar() {
    if (!localAvatarEntry) return;
    localAvatarScene?.remove(localAvatarEntry.group);
    disposeAvatar(localAvatarEntry.group);
    localAvatarEntry = null;
    localAvatarIdentity = "";
}

function copyLiveAvatarTextures(sourceTextures) {
    if (!localAvatarEntry || !sourceTextures) return;
    for (const { key } of AVATAR_TEXTURE_PARTS) {
        const sourceCanvas = sourceTextures[key]?.userData?.canvas;
        const targetTexture = localAvatarEntry.textures?.[key];
        const targetCanvas = targetTexture?.userData?.canvas;
        if (!sourceCanvas || !targetCanvas) continue;
        const context = targetCanvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, 16, 16);
        context.imageSmoothingEnabled = false;
        context.drawImage(sourceCanvas, 0, 0, 16, 16);
        targetTexture.needsUpdate = true;
    }
}

window.addEventListener("webminecraft:character-live-preview", event => {
    copyLiveAvatarTextures(event.detail?.textures);
});
window.addEventListener("webminecraft:character-changed", event => {
    if (!localAvatarEntry) return;
    resetAvatarTextureData(localAvatarEntry.textures);
    void applyAvatarTextureData(localAvatarEntry.textures, event.detail?.textures);
});
window.addEventListener("webminecraft:character-profile-loaded", event => {
    if (!localAvatarEntry) return;
    resetAvatarTextureData(localAvatarEntry.textures);
    void applyAvatarTextureData(localAvatarEntry.textures, event.detail?.textures);
});

window.addEventListener("webminecraft:player-action", event => {
    if (String(event.detail?.action || "") !== "punch" || !localAvatarEntry) return;
    const now = performance.now();
    localAvatarEntry.lastAction = "punch";
    localAvatarEntry.lastReceivedAction = "punch";
    localAvatarEntry.actionStarted = now;
    localAvatarEntry.actionUntil = now + 380;
});

export function updateLocalAvatar(scene, camera, perspective = "first") {
    if (!camera?.position) return;
    if (perspective === "first") {
        if (localAvatarEntry) localAvatarEntry.group.visible = false;
        return;
    }

    const name = localCharacterName();
    const appearanceId = getCharacterAppearanceId(name);
    if (!localAvatarEntry || localAvatarScene !== scene || localAvatarIdentity !== appearanceId) {
        disposeLocalAvatar();
        localAvatarScene = scene;
        localAvatarIdentity = appearanceId;
        const cached = readCharacterTextureRecord();
        const avatar = createAvatar("local:" + appearanceId, name, cached?.textures || null, appearanceId);
        const now = performance.now();
        localAvatarEntry = {
            ...avatar,
            lastPosition: new THREE.Vector3(Number(camera.position.x) || 0, (Number(camera.position.y) || 0) - 1.8, Number(camera.position.z) || 0),
            lastTime: now,
            lastTimeDelta: 1 / 60,
            walkPhase: hashString(appearanceId) % 1000,
            actionStarted: now,
            lastAction: "idle",
            lastReceivedAction: "idle",
            actionUntil: 0,
            bodyYaw: Number(camera.userData.__webminecraftPlayerYaw) || 0,
            heldBlock: null
        };
        localAvatarEntry.group.traverse(object => { if (object.isSprite) object.visible = false; });
        localAvatarEntry.group.visible = true;
        localAvatarScene.add(localAvatarEntry.group);
    }

    const group = localAvatarEntry.group;
    group.visible = true;
    group.position.set(
        Number(camera.position.x) || 0,
        (Number(camera.position.y) || 0) - 1.8,
        Number(camera.position.z) || 0
    );
    localAvatarEntry.bodyYaw = Number(camera.userData.__webminecraftPlayerYaw) || 0;
    const now = performance.now();
    const localAction = now < localAvatarEntry.actionUntil ? localAvatarEntry.lastAction : "idle";
    animateAvatar(localAvatarEntry, {
        position: { x: group.position.x, y: group.position.y + 1.8, z: group.position.z },
        sneaking: Boolean(window.__webminecraftPlayerSneaking),
        action: localAction
    }, now);
    group.rotation.y = localAvatarEntry.bodyYaw;
}

export function initMultiplayerAvatars(scene) {
    if (animationStarted) return;
    animationStarted = true;
    const tick = () => { updateMultiplayerAvatars(scene); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
}