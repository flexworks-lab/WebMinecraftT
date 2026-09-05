export const keys = {};

export let yaw = 0;
export let pitch = 0;

export function setupControls() {
    document.addEventListener("keydown", (event) => {
        keys[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
        keys[event.code] = false;
    });

    document.addEventListener("click", (event) => {
        if (event.target.closest("#mainMenu, #settingsMenu, #settingsButton")) {
            return;
        }

        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== document.body) return;

        yaw -= event.movementX * 0.0022;
        pitch -= event.movementY * 0.0022;

        const limit = Math.PI / 2 - 0.01;
        pitch = Math.max(-limit, Math.min(limit, pitch));
    });
}