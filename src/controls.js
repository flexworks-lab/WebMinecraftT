import "./auth.js";

export const keys = {};

export let yaw = 0;
export let pitch = 0;
export let isFlying = false;

export function setFlying(value) {
    isFlying = !!value;
}

export function toggleFlying() {
    isFlying = !isFlying;
    return isFlying;
}

export function resetView(newYaw = 0, newPitch = 0) { yaw = newYaw; pitch = newPitch; }

export const touchInput = {
    moveX: 0,
    moveZ: 0,
    jump: false,
    sprint: false,
    lookActive: false,
    blockTouchActive: false,
    blockTouchStarted: 0,
    blockTouchX: 0,
    blockTouchY: 0,
    blockTapPending: false,
    blockHoldTriggered: false,
    blockTapX: 0,
    blockTapY: 0,
};

let joystickPointer = null;
let lookPointer = null;
let blockTouchPointer = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let lookLastX = 0;
let lookLastY = 0;
let blockTouchStartX = 0;
let blockTouchStartY = 0;
let lastJumpTapTime = 0;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function toNdcX(clientX) { return (clientX / Math.max(window.innerWidth, 1)) * 2 - 1; }
function toNdcY(clientY) { return 1 - (clientY / Math.max(window.innerHeight, 1)) * 2; }

function makeButton(id, text, className = "") {
    const button = document.createElement("button");
    button.id = id;
    button.className = `touchControl ${className}`.trim();
    button.type = "button";
    button.textContent = text;
    button.addEventListener("contextmenu", event => event.preventDefault());
    button.addEventListener("selectstart", event => event.preventDefault());
    return button;
}

function addActionButton(button, property) {
    const press = event => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        touchInput[property] = true;
        button.classList.add("pressed");
    };
    const release = () => {
        touchInput[property] = false;
        button.classList.remove("pressed");
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
}

function createTouchControls() {
    if (document.getElementById("touchControls")) return;

    const root = document.createElement("div");
    root.id = "touchControls";
    root.innerHTML = `
        <div id="touchMovePad" aria-label="Movement controls">
            <button id="moveForward" class="moveKey" type="button" aria-label="Move forward">▲</button>
            <button id="moveLeft" class="moveKey" type="button" aria-label="Move left">◀</button>
            <button id="moveBack" class="moveKey" type="button" aria-label="Move backward">▼</button>
            <button id="moveRight" class="moveKey" type="button" aria-label="Move right">▶</button>
        </div>
        <div id="touchActions"></div>
        <div id="touchAimKnob" aria-hidden="true"></div>
        <div id="touchLookArea"></div>
        <div id="touchHint">Drag to look • Survival: tap to place, hold to mine • Creative: tap to break</div>
    `;

    const actions = root.querySelector("#touchActions");
    const jumpButton = makeButton("touchJump", "JUMP", "actionButton jumpButton");
    const sprintButton = makeButton("touchSprint", "RUN", "actionButton sprintButton");

    actions.append(sprintButton, jumpButton);
    addActionButton(sprintButton, "sprint");

    const jumpPress = event => {
        event.preventDefault();
        event.stopPropagation();
        jumpButton.setPointerCapture?.(event.pointerId);

        const now = performance.now();
        const doubleTap = now - lastJumpTapTime <= 320;
        lastJumpTapTime = now;

        if (document.body.classList.contains("webminecraft-creative") && doubleTap) {
            toggleFlying();
            touchInput.jump = false;
        } else {
            touchInput.jump = true;
        }
        jumpButton.classList.toggle("pressed", touchInput.jump);
    };
    const releaseJump = () => {
        touchInput.jump = false;
        jumpButton.classList.remove("pressed");
    };
    jumpButton.addEventListener("pointerdown", jumpPress);
    jumpButton.addEventListener("pointerup", releaseJump);
    jumpButton.addEventListener("pointercancel", releaseJump);
    jumpButton.addEventListener("lostpointercapture", releaseJump);

    document.body.appendChild(root);

    const dpad = root.querySelector("#touchMovePad");
    const moveButtons = {
        moveForward: { x: 0, z: -1 },
        moveLeft: { x: -1, z: 0 },
        moveBack: { x: 0, z: 1 },
        moveRight: { x: 1, z: 0 },
    };
    const activeDirections = new Set();

    const updateDpad = () => {
        let x = 0;
        let z = 0;
        for (const id of activeDirections) {
            x += moveButtons[id].x;
            z += moveButtons[id].z;
        }
        const length = Math.hypot(x, z);
        if (length > 1) { x /= length; z /= length; }
        touchInput.moveX = x;
        touchInput.moveZ = z;
    };

    for (const [id, direction] of Object.entries(moveButtons)) {
        const button = dpad.querySelector(`#${id}`);
        const press = event => {
            event.preventDefault();
            event.stopPropagation();
            button.setPointerCapture?.(event.pointerId);
            activeDirections.add(id);
            button.classList.add("pressed");
            updateDpad();
        };
        const release = () => {
            activeDirections.delete(id);
            button.classList.remove("pressed");
            updateDpad();
        };
        button.addEventListener("pointerdown", press);
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("lostpointercapture", release);
    }

    const lookArea = root.querySelector("#touchLookArea");
    const aimKnob = root.querySelector("#touchAimKnob");

    lookArea.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse") return;
        event.preventDefault();
        if (lookPointer !== null || blockTouchPointer !== null) return;
        blockTouchPointer = event.pointerId;
        blockTouchStartX = event.clientX;
        blockTouchStartY = event.clientY;
        touchInput.blockTouchX = toNdcX(event.clientX);
        touchInput.blockTouchY = toNdcY(event.clientY);
        touchInput.blockTapPending = false;
        touchInput.blockHoldTriggered = false;
        touchInput.blockTouchActive = true;
        touchInput.blockTouchStarted = performance.now();
        lookLastX = event.clientX;
        lookLastY = event.clientY;
        lookPointer = event.pointerId;
        lookArea.setPointerCapture?.(event.pointerId);
        aimKnob.style.left = `${event.clientX}px`;
        aimKnob.style.top = `${event.clientY}px`;
        aimKnob.classList.add("visible");
    }, { passive: false });

    lookArea.addEventListener("pointermove", event => {
        if (event.pointerId !== lookPointer) return;
        event.preventDefault();
        const dx = event.clientX - lookLastX;
        const dy = event.clientY - lookLastY;
        if (Math.hypot(event.clientX - blockTouchStartX, event.clientY - blockTouchStartY) > 18) {
            touchInput.blockTouchActive = false;
        }
        lookLastX = event.clientX;
        lookLastY = event.clientY;
        const sensitivity = Number(localStorage.getItem("webminecraft-touch-sensitivity") || 1);
        yaw -= dx * .006 * sensitivity;
        pitch -= dy * .006 * sensitivity;
        pitch = clamp(pitch, -Math.PI / 2 + .01, Math.PI / 2 - .01);
        touchInput.lookActive = true;
        aimKnob.style.left = `${event.clientX}px`;
        aimKnob.style.top = `${event.clientY}px`;
    }, { passive: false });

    const releaseLook = event => {
        if (event.pointerId !== lookPointer) return;
        event.preventDefault();
        const moved = Math.hypot(event.clientX - blockTouchStartX, event.clientY - blockTouchStartY);
        if (moved <= 18 && touchInput.blockTouchActive && !touchInput.blockHoldTriggered) {
            touchInput.blockTapX = toNdcX(event.clientX);
            touchInput.blockTapY = toNdcY(event.clientY);
            touchInput.blockTapPending = true;
        }
        lookPointer = null;
        blockTouchPointer = null;
        touchInput.blockTouchActive = false;
        touchInput.blockTouchStarted = 0;
        touchInput.lookActive = false;
        aimKnob.classList.remove("visible");
    };

    lookArea.addEventListener("pointerup", releaseLook, { passive: false });
    lookArea.addEventListener("pointercancel", releaseLook, { passive: false });
    lookArea.addEventListener("lostpointercapture", releaseLook, { passive: false });

    const style = document.createElement("style");
    style.id = "mobileGameplayControlsStyles";
    style.textContent = `
#touchControls{display:none;position:fixed;inset:0;z-index:40;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-touch-callout:none}
body.mobile-mode #touchControls{display:block}
#touchLookArea{position:absolute;left:31%;right:0;top:0;bottom:0;pointer-events:auto;touch-action:none;z-index:1;-webkit-tap-highlight-color:transparent}
#touchMovePad{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(28px,env(safe-area-inset-bottom));width:168px;height:168px;display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(3,56px);z-index:5;pointer-events:none;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.65))}
#moveForward{grid-column:2;grid-row:1}#moveLeft{grid-column:1;grid-row:2}#moveBack{grid-column:2;grid-row:3}#moveRight{grid-column:3;grid-row:2}
.moveKey{width:52px;height:52px;margin:2px;border:2px solid #111;border-right-color:#555;border-bottom-color:#555;background:#7b7b7b;color:#fff;font:700 22px Arial,sans-serif;border-radius:2px;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:inset 2px 2px 0 rgba(255,255,255,.22),inset -2px -2px 0 rgba(0,0,0,.28);text-shadow:2px 2px 0 #333}
.moveKey:active,.moveKey.pressed{background:#9a9a9a;border-color:#111;transform:translate(1px,1px);box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -1px -1px 0 rgba(0,0,0,.3)}
#touchActions{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(26px,env(safe-area-inset-bottom));width:185px;height:205px;z-index:6;pointer-events:none;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.65))}
.touchControl{position:absolute;width:70px;height:52px;border:2px solid #111;border-right-color:#555;border-bottom-color:#555;border-radius:2px;background:#7b7b7b;color:#fff;font:700 11px Arial,sans-serif;letter-spacing:.5px;text-shadow:2px 2px 0 #333;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:inset 2px 2px 0 rgba(255,255,255,.22),inset -2px -2px 0 rgba(0,0,0,.28)}
.touchControl.pressed{background:#9a9a9a;transform:translate(1px,1px);box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -1px -1px 0 rgba(0,0,0,.3)}
#touchJump{right:0;top:0;width:82px;height:64px;font-size:12px}
#touchBreak{right:0;top:76px}#touchPlace{right:0;top:134px}#touchSprint{left:0;top:76px}#touchFly{left:0;top:134px}
#touchFly.pressed{background:#6f914b;border-right-color:#3f572d;border-bottom-color:#3f572d}
#touchAimKnob{position:fixed;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:0;border:2px solid rgba(255,255,255,.75);background:rgba(255,255,255,.08);box-shadow:0 0 0 2px rgba(0,0,0,.55);pointer-events:none;z-index:4;opacity:0;transition:opacity .08s ease}
#touchAimKnob.visible{opacity:1}
#touchHint{position:absolute;top:max(10px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:90%;text-align:center;color:rgba(255,255,255,.5);font:11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none;z-index:7}
@media(max-width:680px){#touchMovePad{transform:scale(.94);transform-origin:bottom left}#touchActions{transform:scale(.94);transform-origin:bottom right}}
@media(orientation:portrait){#touchMovePad{left:max(12px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom));transform:scale(.88)}#touchActions{right:max(12px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));transform:scale(.88)}#touchLookArea{left:28%}#touchHint{font-size:10px}}
body.mobile-mode #settingsButton{z-index:70;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right))}
html,body,.mobile-mode,canvas{touch-action:none;overscroll-behavior:none}
@media(max-width:680px){body.mobile-mode canvas{touch-action:none!important}}
`;
    document.head.appendChild(style);

    if (navigator.maxTouchPoints > 0 || "ontouchstart" in window) document.body.classList.add("mobile-mode");

    const blockBrowserGestures = event => {
        if (!document.body.classList.contains("mobile-mode")) return;
        event.preventDefault();
    };
    document.addEventListener("gesturestart", blockBrowserGestures, { passive: false });
    document.addEventListener("gesturechange", blockBrowserGestures, { passive: false });
    document.addEventListener("gestureend", blockBrowserGestures, { passive: false });
    document.addEventListener("dblclick", blockBrowserGestures, { passive: false });
    document.addEventListener("touchmove", event => {
        if (document.body.classList.contains("mobile-mode") && event.touches.length > 1) event.preventDefault();
    }, { passive: false });
}

export function setupControls() {
    window.addEventListener("keydown", event => {
        if (document.body.classList.contains("mobile-mode")) {
            for (const code of Object.keys(keys)) keys[code] = false;
            return;
        }
        if (event.code === "KeyF" && !event.repeat) toggleFlying();
        keys[event.code] = true;
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    });
    window.addEventListener("keyup", event => {
        if (document.body.classList.contains("mobile-mode")) {
            keys[event.code] = false;
            return;
        }
        keys[event.code] = false;
    });
    window.addEventListener("mousemove", event => {
        if (document.pointerLockElement !== document.body || document.body.classList.contains("mobile-mode")) return;
        const sensitivity = Number(localStorage.getItem("webminecraft-mouse-sensitivity") || 1);
        yaw -= event.movementX * .0025 * sensitivity;
        const invert = localStorage.getItem("webminecraft-invert-y") === "true";
        pitch += (invert ? 1 : -1) * event.movementY * .0025 * sensitivity;
        pitch = clamp(pitch, -Math.PI / 2 + .01, Math.PI / 2 - .01);
    });
    createTouchControls();
    import("./settings.js").catch(error => console.warn("Settings extras failed to load:", error));
}
