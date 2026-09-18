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
    sneak: false,
    lookActive: false,
    blockTouchActive: false,
    blockTouchStarted: 0,
    blockTouchX: 0,
    blockTouchY: 0,
    blockTapPending: false,
    blockTapDuration: 0,
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

let keyboardLockRequested = false;

function isGameplayActive() {
    return window.__webminecraftGameStarted === true || document.body.classList.contains("webminecraft-in-world");
}

async function enterGameplayKeyboardCapture() {
    if (!isGameplayActive() || keyboardLockRequested) return;
    const keyboard = navigator.keyboard;
    const root = document.documentElement;
    if (!keyboard?.lock || !root?.requestFullscreen) return;

    try {
        if (!document.fullscreenElement) {
            try {
                await root.requestFullscreen({ navigationUI: "hide", keyboardLock: "browser" });
            } catch {
                await root.requestFullscreen();
            }
        }
        await keyboard.lock(["KeyW"]);
        keyboardLockRequested = true;
    } catch {
        keyboardLockRequested = false;
    }
}

function unlockGameKeyboard() {
    keyboardLockRequested = false;
    try { navigator.keyboard?.unlock?.(); } catch {}
}

window.addEventListener("keydown", event => {
    if (!isGameplayActive()) return;
    if (event.ctrlKey && (event.code === "KeyW" || String(event.key).toLowerCase() === "w")) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);

window.addEventListener("pointerdown", event => {
    if (!isGameplayActive()) return;
    if (document.fullscreenElement || keyboardLockRequested) return;
    void enterGameplayKeyboardCapture();
}, true);

document.addEventListener("fullscreenchange", () => {
    if (isGameplayActive() && document.fullscreenElement && !keyboardLockRequested) {
        void enterGameplayKeyboardCapture();
    } else if (!document.fullscreenElement) {
        unlockGameKeyboard();
    }
}, true);

document.addEventListener("pointerlockchange", () => {
    if (isGameplayActive() && document.pointerLockElement === document.body && document.fullscreenElement) {
        void enterGameplayKeyboardCapture();
    }
}, true);

const gameplayStateObserver = new MutationObserver(() => {
    if (!isGameplayActive()) unlockGameKeyboard();
});
gameplayStateObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

export { enterGameplayKeyboardCapture };

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function toNdcX(clientX) { return (clientX / Math.max(window.innerWidth, 1)) * 2 - 1; }
function toNdcY(clientY) { return 1 - (clientY / Math.max(window.innerHeight, 1)) * 2; }

function makeButton(id, text, className = "", icon = text) {
    const button = document.createElement("button");
    button.id = id;
    button.className = `touchControl ${className}`.trim();