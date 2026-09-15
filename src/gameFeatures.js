import * as THREE from "three";
import { getBlockTypes } from "./world.js";

const DAY_LENGTH_SECONDS = 180;

export function setupGameFeatures(scene, camera, sun, skyLight) {
    const blockTypes = getBlockTypes();
    let worldTime = 0.28;
    let blocksBroken = 0;
    let blocksPlaced = 0;
    let lastAchievement = "";

    const hud = document.createElement("div");
    hud.id = "immersiveHud";
    hud.innerHTML = `
        <div class="worldClock">☀️ <span id="worldClockValue">06:43</span></div>
        <div class="worldCoords" id="worldCoords">XYZ 0, 0, 0</div>
    `;
    document.body.appendChild(hud);

    const toast = document.createElement("div");
    toast.id = "featureToast";
    document.body.appendChild(toast);

    const stars = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, sizeAttenuation: false, transparent: true, opacity: 0 })
    );
    const starPositions = new Float32Array(900);
    for (let i = 0; i < starPositions.length; i += 3) {
        const r = 75 + Math.random() * 55;
        const theta = Math.random() * Math.PI * 2;
        const phi = 0.08 + Math.random() * 0.75;
        starPositions[i] = Math.cos(theta) * Math.cos(phi) * r;
        starPositions[i + 1] = Math.sin(phi) * r + 18;
        starPositions[i + 2] = Math.sin(theta) * Math.cos(phi) * r;
    }
    stars.geometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(stars);

    const style = document.createElement("style");
    style.id = "immersiveFeatureStyles";
    style.textContent = `
#immersiveHud{position:fixed;top:14px;left:14px;z-index:9998;pointer-events:none;font:700 13px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;color:#fff;text-shadow:2px 2px 0 #000;background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:7px 10px;backdrop-filter:blur(4px);transition:opacity .2s}
#immersiveHud .worldClock{font-size:15px}
#immersiveHud .worldCoords{opacity:.8;margin-top:1px}
#featureToast{position:fixed;left:50%;top:18%;transform:translate(-50%,-20px);z-index:10010;pointer-events:none;opacity:0;color:#fff;background:rgba(12,12,12,.9);border:2px solid rgba(255,255,255,.35);border-radius:10px;padding:9px 15px;font:800 14px Arial,sans-serif;text-shadow:1px 1px 0 #000;box-shadow:0 6px 24px rgba(0,0,0,.35);transition:opacity .18s,transform .18s}
#featureToast.show{opacity:1;transform:translate(-50%,0)}
body:not(.webminecraft-in-world) #immersiveHud,body:not(.webminecraft-in-world) #featureToast{display:none}
`;
    document.head.appendChild(style);

    const clock = hud.querySelector("#worldClockValue");
    const coords = hud.querySelector("#worldCoords");
    const originalSky = new THREE.Color(0x87ceeb);
    const nightSky = new THREE.Color(0x081329);
    const dawnSky = new THREE.Color(0xd78368);
    const daySun = new THREE.Color(0xfff1cf);
    const nightSun = new THREE.Color(0x7c91d6);
    const achievementTargets = [
        [1, "🌱 First steps — you broke your first block!"],
        [10, "⛏️ Busy builder — 10 blocks mined!"],
        [50, "💎 Hardcore digger — 50 blocks mined!"],
    ];

    let toastTimer = 0;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function updateAchievement() {
        const match = achievementTargets.find(([count]) => blocksBroken === count);
        if (match && match[1] !== lastAchievement) {
            lastAchievement = match[1];
            showToast(match[1]);
        }
    }

    function onBlockChange(event) {
        const type = event.detail?.type;
        if (type === blockTypes.AIR) {
            blocksBroken += 1;
            updateAchievement();
        } else if (type) {
            blocksPlaced += 1;
            if (blocksPlaced === 1) showToast("🧱 Nice! Your first block is down.");
        }
    }
    window.addEventListener("webminecraft:blockchange", onBlockChange);

    function update(deltaTime) {
        if (!document.body.classList.contains("webminecraft-in-world")) return;
        worldTime = (worldTime + deltaTime / DAY_LENGTH_SECONDS) % 1;
        const angle = worldTime * Math.PI * 2 - Math.PI / 2;
        const daylight = THREE.MathUtils.clamp(Math.sin(angle) * 0.5 + 0.5, 0, 1);
        const night = 1 - daylight;
        const dawn = Math.max(0, 1 - Math.abs(daylight - 0.5) * 5);

        sun.position.y = camera.position.y + 18 + daylight * 72;
        sun.position.x = camera.position.x + Math.cos(angle) * 65;
        sun.position.z = camera.position.z + Math.sin(angle) * 65;
        sun.target.position.set(camera.position.x, camera.position.y, camera.position.z);
        sun.target.updateMatrixWorld();
        sun.intensity = 0.45 + daylight * 2.85;
        sun.color.copy(daySun).lerp(nightSun, night * 0.78);
        skyLight.intensity = 0.45 + daylight * 0.95;

        const sky = new THREE.Color();
        if (daylight < 0.35) sky.copy(nightSky).lerp(dawnSky, daylight / 0.35);
        else if (daylight < 0.62) sky.copy(dawnSky).lerp(originalSky, (daylight - 0.35) / 0.27);
        else sky.copy(originalSky).lerp(new THREE.Color(0x6e9fd1), (daylight - 0.62) / 0.38);
        scene.background.copy(sky);
        scene.fog.color.copy(sky);
        stars.material.opacity = THREE.MathUtils.clamp(night * 1.35, 0, 0.95);
        stars.position.set(camera.position.x, 0, camera.position.z);

        const totalMinutes = Math.floor(worldTime * 24 * 60);
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        clock.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        clock.parentElement.firstChild.textContent = daylight > 0.35 ? "☀️ " : "🌙 ";
        coords.textContent = `XYZ ${Math.floor(camera.position.x)}, ${Math.floor(camera.position.y)}, ${Math.floor(camera.position.z)}  •  Mined ${blocksBroken} • Placed ${blocksPlaced}`;
    }

    showToast("✨ New world features unlocked!");
    return { update };
}
