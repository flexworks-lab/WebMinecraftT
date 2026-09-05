export const keys = {};

export let yaw = 0;
export let pitch = 0;

export const touchInput = {
    moveX: 0,
    moveZ: 0,
    jump: false,
    sprint: false,
    lookActive: false
};

let joystickPointer = null;
let lookPointer = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let lookLastX = 0;
let lookLastY = 0;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function makeButton(id, text, className = "") {
    const button = document.createElement("button");
    button.id = id;
    button.className = `touchControl ${className}`.trim();
    button.type = "button";
    button.textContent = text;
    button.addEventListener("contextmenu", (event) => event.preventDefault());
    return button;
}

function createTouchControls() {
    if (document.getElementById("touchControls")) return;

    const root = document.createElement("div");
    root.id = "touchControls";
    root.innerHTML = `
        <div id="touchJoystick"><div id="touchStick"></div></div>
        <div id="touchActions"></div>
        <div id="touchHint">Swipe right side to look</div>
    `;

    const actions = root.querySelector("#touchActions");
    const jump = makeButton("touchJump", "↑", "actionButton");
    const sprint = makeButton("touchSprint", "Run", "actionButton");
    actions.append(jump, sprint);
    document.body.appendChild(root);

    jump.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        jump.setPointerCapture?.(event.pointerId);
        touchInput.jump = true;
    });
    jump.addEventListener("pointerup", () => { touchInput.jump = false; });
    jump.addEventListener("pointercancel", () => { touchInput.jump = false; });
    jump.addEventListener("lostpointercapture", () => { touchInput.jump = false; });

    sprint.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        sprint.setPointerCapture?.(event.pointerId);
        touchInput.sprint = true;
        sprint.classList.add("pressed");
    });
    const releaseSprint = () => {
        touchInput.sprint = false;
        sprint.classList.remove("pressed");
    };
    sprint.addEventListener("pointerup", releaseSprint);
    sprint.addEventListener("pointercancel", releaseSprint);
    sprint.addEventListener("lostpointercapture", releaseSprint);

    const joystick = root.querySelector("#touchJoystick");
    const stick = root.querySelector("#touchStick");
    const joystickRadius = 58;

    joystick.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (joystickPointer !== null) return;
        joystickPointer = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        const rect = joystick.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
        joystickCenterY = rect.top + rect.height / 2;
        updateJoystick(event.clientX, event.clientY, stick, joystickRadius);
    });

    joystick.addEventListener("pointermove", (event) => {
        if (event.pointerId !== joystickPointer) return;
        updateJoystick(event.clientX, event.clientY, stick, joystickRadius);
    });

    const releaseJoystick = (event) => {
        if (event.pointerId !== joystickPointer) return;
        joystickPointer = null;
        touchInput.moveX = 0;
        touchInput.moveZ = 0;
        stick.style.transform = "translate(-50%, -50%)";
    };
    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
    joystick.addEventListener("lostpointercapture", releaseJoystick);

    const lookArea = document.createElement("div");
    lookArea.id = "touchLookArea";
    root.appendChild(lookArea);

    lookArea.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (lookPointer !== null) return;
        lookPointer = event.pointerId;
        lookLastX = event.clientX;
        lookLastY = event.clientY;
        lookArea.setPointerCapture(event.pointerId);
    });

    lookArea.addEventListener("pointermove", (event) => {
        if (event.pointerId !== lookPointer) return;
        const dx = event.clientX - lookLastX;
        const dy = event.clientY - lookLastY;
        lookLastX = event.clientX;
        lookLastY = event.clientY;

        yaw -= dx * 0.006;
        pitch -= dy * 0.006;
        const limit = Math.PI / 2 - 0.01;
        pitch = clamp(pitch, -limit, limit);
        touchInput.lookActive = true;
    });

    const releaseLook = (event) => {
        if (event.pointerId !== lookPointer) return;
        lookPointer = null;
        touchInput.lookActive = false;
    };
    lookArea.addEventListener("pointerup", releaseLook);
    lookArea.addEventListener("pointercancel", releaseLook);
    lookArea.addEventListener("lostpointercapture", releaseLook);
}

function updateJoystick(clientX, clientY, stick, radius) {
    let dx = clientX - joystickCenterX;
    let dy = clientY - joystickCenterY;
    const length = Math.hypot(dx, dy);
    if (length > radius) {
        dx = (dx / length) * radius;
        dy = (dy / length) * radius;
    }

    const amountX = dx / radius;
    const amountY = dy / radius;
    touchInput.moveX = amountX;
    touchInput.moveZ = -amountY;
    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}

export function setupControls() {
    document.addEventListener("keydown", (event) => {
        keys[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
        keys[event.code] = false;
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest("#mainMenu, #settingsMenu, #settingsButton, #touchControls")) return;
        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock?.();
        }
    });

    document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== document.body) return;
        yaw -= event.movementX * 0.0022;
        pitch -= event.movementY * 0.0022;
        const limit = Math.PI / 2 - 0.01;
        pitch = clamp(pitch, -limit, limit);
    });

    createTouchControls();
}

export function isTouchDevice() {
    return window.matchMedia?.("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
}
