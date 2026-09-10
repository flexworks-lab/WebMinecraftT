import { defineConfig } from "vite";

const worldTerrainPlugin = {
    name: "webminecraft-terrain-fixes",
    transform(code, id) {
        if (!id.endsWith("/src/world.js")) return null;

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
        code = code.replace(
            'if (y >= surfaceY - 4) return BLOCK.SAND;\n        if (y >= surfaceY - 7) return BLOCK.SANDSTONE;',
            'if (y >= surfaceY - 1) return BLOCK.SAND;\n        if (y >= surfaceY - 5) return BLOCK.SANDSTONE;'
        );
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

const gameplayUiPlugin = {
    name: "webminecraft-gameplay-ui-fixes",
    transform(code, id) {
        if (id.endsWith("/src/interaction.js")) {
            code = code.replace(
                "const punch = mobile && !!touchInput.punchPressed;",
                "const punch = mobile && !!touchInput.breakPressed;"
            );
            return { code, map: null };
        }

        if (id.endsWith("/src/playerList.js")) {
            code = code.replace(
                "if (!mainMenuVisible && !active) {",
                "if (!mainMenuVisible) {"
            );
            return { code, map: null };
        }

        if (id.endsWith("/src/main.js")) {
            code = code.replace(
                'import * as THREE from "three";',
                'import * as THREE from "three";\nimport { initMultiplayerAvatars } from "./multiplayerAvatars.js";'
            );
            code = code.replace(
                "const scene = new THREE.Scene();",
                "const scene = new THREE.Scene();\ninitMultiplayerAvatars(scene);"
            );
            code = code.replace(
                'const defaults = { shadows: true, shadowQuality: 1024, pixelRatio: 1, lightingQuality: "high", brightness: 1 };',
                'const defaults = { shadows: true, shadowQuality: 1024, pixelRatio: 1, lightingQuality: "high", brightness: 1, showCoordinates: false };'
            );
            const anchor = 'const hotbar = document.getElementById("hotbar");';
            const injected = `${anchor}

const coordinatesHud = document.createElement("div");
coordinatesHud.id = "coordinatesHud";
coordinatesHud.setAttribute("aria-live", "polite");
coordinatesHud.textContent = "X: 0  Y: 0  Z: 0";
document.body.appendChild(coordinatesHud);

function updateCoordinatesHud() {
    const visible = gameStarted && settings.showCoordinates === true && settingsMenu?.style.display !== "flex";
    coordinatesHud.style.display = visible ? "block" : "none";
    if (visible) {
        coordinatesHud.textContent = \`X: \${Math.floor(camera.position.x)}  Y: \${Math.floor(camera.position.y)}  Z: \${Math.floor(camera.position.z)}\`;
    }
}

const showCoordinatesToggle = document.getElementById("showCoordinatesToggle");
if (showCoordinatesToggle) {
    showCoordinatesToggle.checked = settings.showCoordinates === true;
    showCoordinatesToggle.addEventListener("change", () => {
        settings.showCoordinates = showCoordinatesToggle.checked;
        saveSettings();
        updateCoordinatesHud();
    });
}

setInterval(updateCoordinatesHud, 100);`;
            if (!code.includes('id = "coordinatesHud"')) code = code.replace(anchor, injected);
            code = code.replace(
                'if (performanceHud) performanceHud.style.display = display;\n}',
                'if (performanceHud) performanceHud.style.display = display;\n    updateCoordinatesHud();\n}'
            );
            return { code, map: null };
        }

        if (id.endsWith("/src/player.js")) {
            code = code.replace(
                /function updateMultiplayerAvatars\(scene\) \{[\s\S]*?\n\}\n\nfunction syncMultiplayerState/,
                'function updateMultiplayerAvatars(scene) {}\n\nfunction syncMultiplayerState'
            );
            return { code, map: null };
        }

        return null;
    }
};

const gameplayHtmlPlugin = {
    name: "webminecraft-gameplay-html-fixes",
    transform(code, id) {
        if (!id.endsWith("/index.html")) return null;
        code = code.replace(
            "</style>",
            `#coordinatesHud{position:fixed;left:20px;top:20px;z-index:70;display:none;padding:8px 12px;background:rgba(0,0,0,.58);border:2px solid rgba(255,255,255,.22);color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;line-height:1.3;text-shadow:2px 2px 0 #000;pointer-events:none}\nbody.mobile-mode #coordinatesHud{left:max(12px,env(safe-area-inset-left));top:max(160px,calc(env(safe-area-inset-top) + 148px))}\n</style>`,
            1
        );
        const settingsBottomAnchor = '<div id="settingsBottom">';
        const settingRow = `<div class="setting" id="coordinatesSetting"><div><label for="showCoordinatesToggle">Show Coordinates</label><small>Show your X, Y, and Z position while playing.</small></div><div class="settingControl"><input id="showCoordinatesToggle" type="checkbox"></div></div>`;
        if (!code.includes('id="showCoordinatesToggle"')) code = code.replace(settingsBottomAnchor, `${settingRow}\n${settingsBottomAnchor}`);
        return { code, map: null };
    }
};

export default defineConfig({
    base: "/WebMinecraftT/",
    plugins: [worldTerrainPlugin, gameplayUiPlugin, gameplayHtmlPlugin]
});
