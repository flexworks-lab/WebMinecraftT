export const keys = {};

export let yaw = 0;
export let pitch = 0;

export function resetView(newYaw = 0, newPitch = 0) {
    yaw = newYaw;
    pitch = newPitch;
}

export const touchInput = {
    moveX: 0,
    moveZ: 0,
    jump: false,
    sprint: false,
    breakPressed: false,
    punchPressed: false,
    placePressed: false,
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

function addActionButton(button, property) {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        touchInput[property] = true;
        button.classList.add("pressed");
    });
    const release = () => {
        touchInput[property] = false;
        button.classList.remove("pressed");
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
}

function createTouchControls() {
    if (document.getElementById("touchControls")) return;

    const root = document.createElement("div");
    root.id = "touchControls";
    root.innerHTML = `
        <div id="touchJoystick"><div id="touchStick"></div></div>
        <div id="touchActions"></div>
        <div id="touchHint">Swipe right side to look</div>
        <div id="touchLookArea"></div>
    `;

    const actions = root.querySelector("#touchActions");
    const mineButton = makeButton("touchBreak", "Mine", "actionButton mineButton");
    const punchButton = makeButton("touchPunch", "Punch", "actionButton punchButton");
    const placeButton = makeButton("touchPlace", "Place", "actionButton placeButton");
    const jumpButton = makeButton("touchJump", "Jump", "actionButton jumpButton");
    const sprintButton = makeButton("touchSprint", "Run", "actionButton sprintButton");
    actions.append(mineButton, punchButton, placeButton, jumpButton, sprintButton);
    document.body.appendChild(root);

    addActionButton(mineButton, "breakPressed");
    addActionButton(punchButton, "punchPressed");
    addActionButton(placeButton, "placePressed");
    addActionButton(sprintButton, "sprint");

    jumpButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        jumpButton.setPointerCapture?.(event.pointerId);
        touchInput.jump = true;
        jumpButton.classList.add("pressed");
    });
    const releaseJump = () => {
        touchInput.jump = false;
        jumpButton.classList.remove("pressed");
    };
    jumpButton.addEventListener("pointerup", releaseJump);
    jumpButton.addEventListener("pointercancel", releaseJump);
    jumpButton.addEventListener("lostpointercapture", releaseJump);

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

    const lookArea = root.querySelector("#touchLookArea");
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

    const style = document.createElement("style");
    style.textContent = `
        #touchControls { display:none; position:fixed; inset:0; z-index:40; pointer-events:none; user-select:none; -webkit-user-select:none; touch-action:none; }
        #touchJoystick { position:absolute; left:28px; bottom:28px; width:132px; height:132px; border-radius:50%; background:rgba(255,255,255,.14); border:2px solid rgba(255,255,255,.35); pointer-events:auto; touch-action:none; z-index:2; }
        #touchStick { position:absolute; left:50%; top:50%; width:58px; height:58px; margin:-29px; border-radius:50%; background:rgba(255,255,255,.45); border:2px solid rgba(255,255,255,.7); box-sizing:border-box; pointer-events:none; }
        #touchActions { position:absolute; right:24px; bottom:24px; display:grid; grid-template-columns:repeat(2,76px); grid-auto-rows:76px; gap:10px; pointer-events:auto; z-index:5; }
        .touchControl { width:76px; height:76px; border-radius:50%; border:2px solid rgba(255,255,255,.5); background:rgba(25,25,25,.62); color:white; font:bold 14px Arial,sans-serif; -webkit-tap-highlight-color:transparent; touch-action:none; box-shadow:0 3px 10px rgba(0,0,0,.28); }
        .touchControl.pressed { background:rgba(100,100,100,.78); transform:scale(.95); }
        #touchLookArea { position:absolute; left:38%; right:0; top:0; bottom:0; pointer-events:auto; touch-action:none; z-index:1; }
        #touchHint { position:absolute; top:12px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,.55); font:12px Arial,sans-serif; pointer-events:none; z-index:6; }
        body.mobile-mode #touchControls { display:block; }
        body.mobile-mode #settingsButton { z-index:70; }
        @media (orientation:portrait) { #touchJoystick { left:18px; bottom:18px; } #touchActions { right:16px; bottom:18px; } }
    `;
    document.head.appendChild(style);
}

function updateJoystick(clientX, clientY, stick, radius) {
    let dx = clientX - joystickCenterX;
    let dy = clientY - joystickCenterY;
    const length = Math.hypot(dx, dy);
    if (length > radius) {
        dx = (dx / length) * radius;
        dy = (dy / length) * radius;
    }
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    touchInput.moveX = dx / radius;
    touchInput.moveZ = dy / radius;
}

export function setupControls() {
    window.addEventListener("keydown", (event) => {
        keys[event.code] = true;
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
    });
    window.addEventListener("keyup", (event) => { keys[event.code] = false; });

    window.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== document.body || document.body.classList.contains("mobile-mode")) return;
        yaw -= event.movementX * 0.0025;
        pitch -= event.movementY * 0.0025;
        const limit = Math.PI / 2 - 0.01;
        pitch = clamp(pitch, -limit, limit);
    });

    createTouchControls();
}
