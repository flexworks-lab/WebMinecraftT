import { defineConfig } from "vite";

const multiplayerAvatarPlugin = {
    name: "webminecraft-low-poly-avatars",
    transform(code, id) {
        if (!id.endsWith("/src/player.js")) return null;

        const start = code.indexOf("function avatarColor");
        const end = code.indexOf("function syncMultiplayerState", start);
        if (start === -1 || end === -1) return null;

        const replacement = String.raw`function avatarColor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    const hue = ((hash >>> 0) % 360) / 360;
    return new THREE.Color().setHSL(hue, 0.72, 0.57);
}

function createMultiplayerNameplate(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 80;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "bold 34px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineWidth = 10;
    context.strokeStyle = "rgba(0,0,0,0.9)";
    context.fillStyle = "#ffffff";
    const text = String(name || "Player").slice(0, 16);
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(material);
    const width = Math.max(1.15, Math.min(2.7, text.length * 0.13 + 0.9));
    sprite.scale.set(width, 0.38, 1);
    sprite.position.set(0, 2.18, 0);
    return sprite;
}

function createPlayerAvatar(id, name) {
    const group = new THREE.Group();
    const baseColor = avatarColor(id);
    const lightColor = baseColor.clone().offsetHSL(0, 0.02, 0.12);
    const darkColor = baseColor.clone().offsetHSL(0, 0, -0.16);

    const bodyMaterial = new THREE.MeshLambertMaterial({ color: baseColor });
    const lightMaterial = new THREE.MeshLambertMaterial({ color: lightColor });
    const darkMaterial = new THREE.MeshLambertMaterial({ color: darkColor });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x161616 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.36, 0.72, 8), bodyMaterial);
    body.position.y = 1.02;
    body.castShadow = true;

    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), lightMaterial);
    head.scale.y = 0.92;
    head.position.y = 1.69;
    head.castShadow = true;

    const eyeGeometry = new THREE.SphereGeometry(0.055, 6, 4);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 1.72, -0.31);
    rightEye.position.set(0.12, 1.72, -0.31);

    const armGeometry = new THREE.CylinderGeometry(0.105, 0.12, 0.58, 7);
    const leftArm = new THREE.Mesh(armGeometry, lightMaterial);
    const rightArm = new THREE.Mesh(armGeometry, lightMaterial);
    leftArm.position.set(-0.43, 1.04, 0);
    rightArm.position.set(0.43, 1.04, 0);
    leftArm.rotation.z = -0.08;
    rightArm.rotation.z = 0.08;

    const legGeometry = new THREE.CylinderGeometry(0.12, 0.14, 0.62, 7);
    const leftLeg = new THREE.Mesh(legGeometry, darkMaterial);
    const rightLeg = new THREE.Mesh(legGeometry, darkMaterial);
    leftLeg.position.set(-0.17, 0.38, 0);
    rightLeg.position.set(0.17, 0.38, 0);

    group.add(body, head, leftEye, rightEye, leftArm, rightArm, leftLeg, rightLeg);
    group.add(createMultiplayerNameplate(name));
    group.userData.multiplayerAvatar = true;
    group.userData.armLeft = leftArm;
    group.userData.armRight = rightArm;
    group.userData.createdAt = performance.now();
    return group;
}

function updateMultiplayerAvatars(scene) {
    if (!isMultiplayerActive()) {
        for (const avatar of avatarDots.values()) scene.remove(avatar);
        avatarDots.clear();
        return;
    }

    const players = getRemotePlayers();
    const time = performance.now() * 0.004;

    for (const [id, player] of players) {
        if (!player?.position) continue;
        let avatar = avatarDots.get(id);
        if (!avatar) {
            avatar = createPlayerAvatar(id, player.name);
            scene.add(avatar);
            avatarDots.set(id, avatar);
        }

        avatar.position.set(
            Number(player.position.x) || 0,
            (Number(player.position.y) || 0) - PLAYER_HEIGHT,
            Number(player.position.z) || 0,
        );

        const remoteYaw = Number(player.rotation?.y);
        if (Number.isFinite(remoteYaw)) avatar.rotation.y = remoteYaw;

        const moving = Number(player.velocity?.x) !== 0 || Number(player.velocity?.z) !== 0;
        if (moving) {
            avatar.userData.armLeft.rotation.x = Math.sin(time) * 0.32;
            avatar.userData.armRight.rotation.x = -Math.sin(time) * 0.32;
        } else {
            avatar.userData.armLeft.rotation.x *= 0.82;
            avatar.userData.armRight.rotation.x *= 0.82;
        }
    }

    for (const [id, avatar] of avatarDots) {
        if (!players.has(id)) {
            scene.remove(avatar);
            avatar.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
            avatarDots.delete(id);
        }
    }

`;

        return code.slice(0, start) + replacement + code.slice(end);
    }
};

const worldTerrainPlugin = {
    name: "webminecraft-terrain-fixes",
    transform(code, id) {
        if (!id.endsWith("/src/world.js")) return null;

        // Less sand underwater: more dirt/stone and much less random sand.
        code = code.replace(
            "if (surfaceRoll < 0.94) return BLOCK.SAND;",
            "if (surfaceRoll < 0.84) return BLOCK.SAND;"
        );
        code = code.replace(
            "if (blockRoll < 0.88) return BLOCK.SAND;",
            "if (blockRoll < 0.78) return BLOCK.SAND;"
        );
        code = code.replace(
            "if (blockRoll < 0.67) return BLOCK.SAND;",
            "if (blockRoll < 0.57) return BLOCK.SAND;"
        );

        // Make deserts mostly stone/sandstone with only a thin sand surface.
        code = code.replace(
            'if (y >= surfaceY - 4) return BLOCK.SAND;\n        if (y >= surfaceY - 7) return BLOCK.SANDSTONE;',
            'if (y >= surfaceY - 1) return BLOCK.SAND;\n        if (y >= surfaceY - 5) return BLOCK.SANDSTONE;'
        );

        // Make water a perfectly flat, full-size block surface. The old per-block
        // wave heights caused neighboring water quads to miss each other at edges.
        code = code.replace(
            /const waveA = Math\.sin\(\(x \+ z\) \* 0\.19\) \* 0\.042;\n\s*const waveB = Math\.sin\(\(x \* 0\.31 - z \* 0\.17\) \+ 1\.7\) \* 0\.025;\n\s*const waveC = Math\.cos\(\(x \* 0\.13 \+ z \* 0\.27\) - 0\.6\) \* 0\.02;/,
            'const waveA = 0;\n            const waveB = 0;\n            const waveC = 0;'
        );
        code = code.replace("x - 0.5, y + waveA + waveC, z - 0.5", "x - 0.5, y, z - 0.5");
        code = code.replace("x - 0.5, y + waveB, z + 0.5", "x - 0.5, y, z + 0.5");
        code = code.replace("x + 0.5, y - waveA + waveC * 0.5, z + 0.5", "x + 0.5, y, z + 0.5");
        code = code.replace("x + 0.5, y - waveB, z - 0.5", "x + 0.5, y, z - 0.5");

        return { code, map: null };
    }
};

export default defineConfig({
    base: "/WebMinecraftT/",
    plugins: [multiplayerAvatarPlugin, worldTerrainPlugin]
});
