import "./welcome.js";
import "./playerList.js";
import "./worldSync.js";
import { touchInput } from "./controls.js";
import "./uiFixes.js";

function applyDirtBackgrounds() {
    if (document.getElementById("webMinecraftDirtBackgrounds")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftDirtBackgrounds";
    style.textContent = `
#savedWorlds {
    background-color:rgba(35,24,16,.72) !important;
    background-image:url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsShell {
    background-color:rgba(28,20,14,.82) !important;
    background-image:linear-gradient(rgba(20,14,10,.62),rgba(20,14,10,.82)),url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsBody { background:rgba(0,0,0,.08); }
`;
    document.head.appendChild(style);
}

function setupMenuAndMobileUi() {
    if (document.getElementById("webMinecraftMenuUiFixes")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftMenuUiFixes";
    style.textContent = `
#newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:118px !important;margin:0 !important;z-index:97 !important}
#globalPlayerCount{left:auto !important;right:28px !important;bottom:28px !important;width:142px !important;min-height:48px !important;text-align:center !important}
#globalPlayerPanel{left:auto !important;right:28px !important;bottom:88px !important}
#mobileModeButton{margin-top:12px !important;background:linear-gradient(#536b82,#3e5265) !important;border-color:#111 !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -2px -3px 0 rgba(0,0,0,.3),0 3px 0 rgba(0,0,0,.72) !important}
#mobileModeButton:hover,#mobileModeButton:focus-visible{background:linear-gradient(#617c96,#496178) !important}
#mobileModeButton.mobileOn{background:linear-gradient(#6d8d4e,#526f3c) !important}
#mobileModeButton.mobileOn:hover,#mobileModeButton.mobileOn:focus-visible{background:linear-gradient(#7da65a,#5f8145) !important}
#mobileModeButton::before{content:"▣ "}

body:not(.webminecraft-in-world) #crosshair,
body:not(.webminecraft-in-world) #hotbar,
body:not(.webminecraft-in-world) #performanceHud,
body:not(.webminecraft-in-world) #touchControls,
body:not(.webminecraft-in-world) #touchAimKnob,
body:not(.webminecraft-in-world) #touchHint{display:none !important}
body.webminecraft-in-world #accountButton,
body.webminecraft-in-world #newsButton,
body.webminecraft-in-world #globalPlayerPanel,
body.webminecraft-in-world #mainMenu button,
body.webminecraft-in-world #seedMenu,
body.webminecraft-in-world #menuUpdates{display:none !important}
body.webminecraft-in-world #globalPlayerCount{display:none !important}
#settingsVersion{display:none !important}
#gameVersionButton,#gameVersionPicker{display:none !important}

#webMinecraftMovingClouds{
    position:fixed;
    inset:0;
    overflow:hidden;
    pointer-events:none;
    z-index:5;
    opacity:.72;
    transition:opacity .25s ease;
}
body.webminecraft-in-world #webMinecraftMovingClouds{opacity:.62}
.webMinecraftCloud{
    position:absolute;
    width:150px;
    height:40px;
    border-radius:28px;
    background:rgba(255,255,255,.88);
    filter:blur(1.2px);
    box-shadow:35px 5px 0 7px rgba(255,255,255,.86),72px -2px 0 12px rgba(255,255,255,.84),104px 8px 0 4px rgba(255,255,255,.86),20px -10px 0 2px rgba(255,255,255,.88);
    will-change:transform;
}
.webMinecraftCloud::after{
    content:"";
    position:absolute;
    left:42px;
    top:-11px;
    width:54px;
    height:34px;
    border-radius:50%;
    background:rgba(255,255,255,.88);
}
body:not(.webminecraft-in-world) #webMinecraftMovingClouds{z-index:5}

#touchMovePad{overflow:visible}
#touchHybridJoystick{
    position:absolute;
    left:56px;
    top:56px;
    width:56px;
    height:56px;
    margin:0;
    border:2px solid rgba(255,255,255,.24);
    border-radius:14px;
    background:rgba(20,20,20,.34);
    pointer-events:auto;
    touch-action:none;
    z-index:4;
    -webkit-tap-highlight-color:transparent;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
}
#touchHybridJoystickKnob{
    position:absolute;
    left:50%;
    top:50%;
    width:28px;
    height:28px;
    margin:-14px 0 0 -14px;
    border:2px solid rgba(255,255,255,.5);
    border-radius:9px;
    background:rgba(255,255,255,.2);
    pointer-events:none;
    transition:transform .05s ease;
}
#touchHybridJoystick.dragging #touchHybridJoystickKnob{background:rgba(255,255,255,.3)}
`;
    document.head.appendChild(style);

    const settingsButton = document.getElementById("settingsButton");
    const mainMenu = document.getElementById("mainMenu");
    const mobileModeButton = document.getElementById("mobileModeButton");
    if (!mainMenu) return;

    const isMobileMode = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("mobile") === "1" || params.get("mode") === "mobile";
    };

    const syncState = () => {
        const menuVisible = getComputedStyle(mainMenu).display !== "none";
        const inWorld = !menuVisible;
        document.body.classList.toggle("webminecraft-in-world", inWorld);

        if (settingsButton) {
            settingsButton.style.display = menuVisible || (inWorld && isMobileMode()) ? "block" : "none";
        }
    };

    const syncMobileButton = () => {
        if (!mobileModeButton) return;
        const enabled = isMobileMode();
        mobileModeButton.classList.toggle("mobileOn", enabled);
        mobileModeButton.textContent = enabled ? "Desktop Mode" : "Mobile Mode";
        mobileModeButton.title = enabled ? "Switch back to desktop controls" : "Use touch-friendly mobile controls";
        mobileModeButton.setAttribute("aria-pressed", String(enabled));
    };

    syncState();
    syncMobileButton();

    const observer = new MutationObserver(() => {
        syncState();
        syncMobileButton();
    });
    observer.observe(mainMenu, { attributes:true, attributeFilter:["style","class"] });
    if (settingsButton) observer.observe(settingsButton, { attributes:true, attributeFilter:["style","class"] });

    const attachHybridJoystick = () => {
        const pad = document.getElementById("touchMovePad");
        if (!pad || document.getElementById("touchHybridJoystick")) return !!pad;

        const joystick = document.createElement("div");
        joystick.id = "touchHybridJoystick";
        joystick.setAttribute("aria-label", "Joystick movement");
        const knob = document.createElement("div");
        knob.id = "touchHybridJoystickKnob";
        joystick.appendChild(knob);
        pad.appendChild(joystick);

        let pointerId = null;
        const radius = 30;
        const release = () => {
            pointerId = null;
            touchInput.moveX = 0;
            touchInput.moveZ = 0;
            joystick.classList.remove("dragging");
            knob.style.transform = "translate(0,0)";
        };
        const update = (x, y) => {
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let dx = x - centerX;
            let dy = y - centerY;
            const distance = Math.hypot(dx, dy);
            if (distance > radius && distance > 0) {
                dx = (dx / distance) * radius;
                dy = (dy / distance) * radius;
            }
            const normalizedX = dx / radius;
            const normalizedZ = -dy / radius;
            touchInput.moveX = Math.abs(normalizedX) > .12 ? Math.max(-1, Math.min(1, normalizedX)) : 0;
            touchInput.moveZ = Math.abs(normalizedZ) > .12 ? Math.max(-1, Math.min(1, normalizedZ)) : 0;
            knob.style.transform = `translate(${dx}px,${dy}px)`;
        };

        joystick.addEventListener("pointerdown", event => {
            event.preventDefault();
            event.stopPropagation();
            if (pointerId !== null || event.pointerType === "mouse") return;
            pointerId = event.pointerId;
            joystick.setPointerCapture?.(event.pointerId);
            joystick.classList.add("dragging");
            update(event.clientX, event.clientY);
        });
        joystick.addEventListener("pointermove", event => {
            if (event.pointerId !== pointerId) return;
            event.preventDefault();
            update(event.clientX, event.clientY);
        });
        joystick.addEventListener("pointerup", event => {
            if (event.pointerId === pointerId) { event.preventDefault(); release(); }
        });
        joystick.addEventListener("pointercancel", event => {
            if (event.pointerId === pointerId) release();
        });
        joystick.addEventListener("lostpointercapture", release);
        return true;
    };

    if (!attachHybridJoystick()) {
        const touchObserver = new MutationObserver(() => {
            if (attachHybridJoystick()) touchObserver.disconnect();
        });
        touchObserver.observe(document.body, { childList:true, subtree:true });
    }
}

function setupMovingClouds() {
    if (document.getElementById("webMinecraftMovingClouds")) return;
    const layer = document.createElement("div");
    layer.id = "webMinecraftMovingClouds";
    const clouds = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement("div");
        cloud.className = "webMinecraftCloud";
        const y = 8 + (i % 5) * 10 + Math.random() * 7;
        const scale = 0.62 + Math.random() * 0.52;
        cloud.style.top = `${y}%`;
        cloud.style.left = `${-240 + Math.random() * 130}%;`;
        cloud.style.transform = `scale(${scale})`;
        layer.appendChild(cloud);
        clouds.push({ el: cloud, x: -260 - Math.random() * 240, y, speed: 8 + Math.random() * 15, scale });
    }
    document.body.appendChild(layer);

    let last = performance.now();
    const tick = now => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        for (const cloud of clouds) {
            cloud.x += cloud.speed * dt;
            if (cloud.x > 125) cloud.x = -40 - Math.random() * 30;
            cloud.el.style.transform = `translate3d(${cloud.x}vw,0,0) scale(${cloud.scale})`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function init() {
    applyDirtBackgrounds();
    setupMenuAndMobileUi();
    setupMovingClouds();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
