export const keys = {};

export let yaw = 0;
export let pitch = 0;
export let isFlying = false;

export function resetView(newYaw = 0, newPitch = 0) { yaw = newYaw; pitch = newPitch; }

export const touchInput = { moveX: 0, moveZ: 0, jump: false, sprint: false, breakPressed: false, punchPressed: false, placePressed: false, lookActive: false, blockTouchActive: false, blockTouchStarted: 0 };
let joystickPointer = null, lookPointer = null, blockTouchPointer = null, joystickCenterX = 0, joystickCenterY = 0, lookLastX = 0, lookLastY = 0;
let blockTouchStartX = 0, blockTouchStartY = 0;
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function makeButton(id, text, className = "") {
    const button = document.createElement("button"); button.id = id; button.className = `touchControl ${className}`.trim(); button.type = "button"; button.textContent = text;
    button.addEventListener("contextmenu", event => event.preventDefault()); return button;
}
function addActionButton(button, property) {
    button.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); button.setPointerCapture?.(event.pointerId); touchInput[property] = true; button.classList.add("pressed"); });
    const release = () => { touchInput[property] = false; button.classList.remove("pressed"); };
    button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release); button.addEventListener("lostpointercapture", release);
}
function createTouchControls() {
    if (document.getElementById("touchControls")) return;
    const root = document.createElement("div"); root.id = "touchControls";
    root.innerHTML = `<div id="touchJoystick"><div class="joystickKnob"></div></div><div id="touchActions"></div><div id="touchHint">Drag right side to look • Tap a block to select • Hold to mine</div><div id="touchLookArea"></div>`;
    const actions = root.querySelector("#touchActions");
    const mineButton = makeButton("touchBreak", "Mine", "actionButton mineButton"), punchButton = makeButton("touchPunch", "Punch", "actionButton punchButton"), placeButton = makeButton("touchPlace", "Place", "actionButton placeButton"), jumpButton = makeButton("touchJump", "Jump", "actionButton jumpButton"), sprintButton = makeButton("touchSprint", "Run", "actionButton sprintButton"), flyButton = makeButton("touchFly", "Fly", "actionButton flyButton");
    actions.append(mineButton, punchButton, placeButton, jumpButton, sprintButton, flyButton);
    addActionButton(mineButton, "breakPressed"); addActionButton(punchButton, "punchPressed"); addActionButton(placeButton, "placePressed"); addActionButton(sprintButton, "sprint");
    flyButton.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); isFlying = !isFlying; flyButton.classList.toggle("pressed", isFlying); });
    document.body.appendChild(root);

    jumpButton.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); jumpButton.setPointerCapture?.(event.pointerId); touchInput.jump = true; jumpButton.classList.add("pressed"); });
    const releaseJump = () => { touchInput.jump = false; jumpButton.classList.remove("pressed"); };
    jumpButton.addEventListener("pointerup", releaseJump); jumpButton.addEventListener("pointercancel", releaseJump); jumpButton.addEventListener("lostpointercapture", releaseJump);

    const joystick = root.querySelector("#touchJoystick"), joystickKnob = root.querySelector(".joystickKnob"), joystickRadius = 58;
    const resetJoystick = () => { joystickPointer = null; touchInput.moveX = 0; touchInput.moveZ = 0; joystickKnob.style.transform = "translate(-50%, -50%)"; joystick.classList.remove("active"); };
    const updateJoystick = (clientX, clientY) => {
        let dx = clientX - joystickCenterX, dy = clientY - joystickCenterY; const distance = Math.hypot(dx, dy);
        if (distance > joystickRadius) { dx = dx / distance * joystickRadius; dy = dy / distance * joystickRadius; }
        const normalizedX = dx / joystickRadius, normalizedZ = -dy / joystickRadius;
        touchInput.moveX = Math.abs(normalizedX) > .12 ? clamp(normalizedX, -1, 1) : 0;
        touchInput.moveZ = Math.abs(normalizedZ) > .12 ? clamp(normalizedZ, -1, 1) : 0;
        joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    joystick.addEventListener("pointerdown", event => { event.preventDefault(); event.stopPropagation(); if (joystickPointer !== null) return; joystickPointer = event.pointerId; joystick.setPointerCapture(event.pointerId); const rect = joystick.getBoundingClientRect(); joystickCenterX = rect.left + rect.width / 2; joystickCenterY = rect.top + rect.height / 2; joystick.classList.add("active"); updateJoystick(event.clientX, event.clientY); });
    joystick.addEventListener("pointermove", event => { if (event.pointerId === joystickPointer) updateJoystick(event.clientX, event.clientY); }); joystick.addEventListener("pointerup", resetJoystick); joystick.addEventListener("pointercancel", resetJoystick); joystick.addEventListener("lostpointercapture", resetJoystick);

    const lookArea = root.querySelector("#touchLookArea");
    lookArea.addEventListener("pointerdown", event => {
        event.preventDefault();
        if (lookPointer !== null || blockTouchPointer !== null) return;
        blockTouchPointer = event.pointerId;
        blockTouchStartX = event.clientX;
        blockTouchStartY = event.clientY;
        touchInput.blockTouchActive = true;
        touchInput.blockTouchStarted = performance.now();
        lookLastX = event.clientX;
        lookLastY = event.clientY;
        lookPointer = event.pointerId;
        lookArea.setPointerCapture(event.pointerId);
    });
    lookArea.addEventListener("pointermove", event => {
        if (event.pointerId !== lookPointer) return;
        const dx = event.clientX - lookLastX, dy = event.clientY - lookLastY;
        if (Math.hypot(event.clientX - blockTouchStartX, event.clientY - blockTouchStartY) > 18) touchInput.blockTouchActive = false;
        lookLastX = event.clientX;
        lookLastY = event.clientY;
        const sensitivity = Number(localStorage.getItem("webminecraft-touch-sensitivity") || 1);
        yaw -= dx * .006 * sensitivity;
        pitch -= dy * .006 * sensitivity;
        pitch = clamp(pitch, -Math.PI / 2 + .01, Math.PI / 2 - .01);
        touchInput.lookActive = true;
    });
    const releaseLook = event => {
        if (event.pointerId !== lookPointer) return;
        lookPointer = null;
        blockTouchPointer = null;
        touchInput.blockTouchActive = false;
        touchInput.blockTouchStarted = 0;
        touchInput.lookActive = false;
    };
    lookArea.addEventListener("pointerup", releaseLook); lookArea.addEventListener("pointercancel", releaseLook); lookArea.addEventListener("lostpointercapture", releaseLook);

    const style = document.createElement("style"); style.textContent = `#touchControls{display:none;position:fixed;inset:0;z-index:40;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none}#touchJoystick{position:absolute;left:28px;bottom:28px;width:132px;height:132px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);pointer-events:auto;touch-action:none;z-index:2;box-sizing:border-box;transition:background .1s ease}.joystickKnob{position:absolute;left:50%;top:50%;width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.5);box-sizing:border-box;transform:translate(-50%,-50%);pointer-events:none}.#touchJoystick.active{background:rgba(255,255,255,.16)}#touchActions{position:absolute;right:24px;bottom:24px;display:grid;grid-template-columns:repeat(2,76px);grid-auto-rows:76px;gap:10px;pointer-events:auto;z-index:5}.touchControl{width:76px;height:76px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(25,25,25,.62);color:white;font:bold 14px Arial,sans-serif;touch-action:none;box-shadow:0 3px 10px rgba(0,0,0,.28);-webkit-tap-highlight-color:transparent}.touchControl.pressed{background:rgba(100,100,100,.78);transform:scale(.95)}#touchLookArea{position:absolute;left:38%;right:0;top:0;bottom:0;pointer-events:auto;touch-action:none;z-index:1;-webkit-tap-highlight-color:transparent}#touchHint{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:90%;text-align:center;color:rgba(255,255,255,.55);font:12px Arial,sans-serif;pointer-events:none;z-index:6}body.mobile-mode #touchControls{display:block}body.mobile-mode #settingsButton{z-index:70}@media (orientation:portrait){#touchJoystick{left:18px;bottom:18px}#touchActions{right:16px;bottom:18px;grid-template-columns:repeat(2,70px);grid-auto-rows:70px;gap:8px}.touchControl{width:70px;height:70px}#touchHint{top:8px}}body.settings-large-ui .setting label{font-size:18px}body.settings-high-contrast #settingsMenu{background:#000}body.settings-high-contrast .setting,body.settings-high-contrast .settingsTab{border-color:#fff}body.settings-reduced-motion *,body.settings-reduced-motion *::before,body.settings-reduced-motion *::after{transition:none!important;animation:none!important}:root{--ui-opacity:1}#settingsMenu,#settingsButton,#hotbar,#crosshair{opacity:var(--ui-opacity)}`; document.head.appendChild(style);
}

export function setupControls() {
    window.addEventListener("keydown", event => { if (event.code === "KeyF" && !event.repeat) isFlying = !isFlying; keys[event.code] = true; if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code)) event.preventDefault(); });
    window.addEventListener("keyup", event => { keys[event.code] = false; });
    window.addEventListener("mousemove", event => { if (document.pointerLockElement !== document.body || document.body.classList.contains("mobile-mode")) return; const sensitivity = Number(localStorage.getItem("webminecraft-mouse-sensitivity") || 1); yaw -= event.movementX * .0025 * sensitivity; const invert = localStorage.getItem("webminecraft-invert-y") === "true"; pitch += (invert ? 1 : -1) * event.movementY * .0025 * sensitivity; pitch = clamp(pitch, -Math.PI / 2 + .01, Math.PI / 2 - .01); });
    createTouchControls();
    import("./settings.js").catch(error => console.warn("Settings extras failed to load:", error));
}
