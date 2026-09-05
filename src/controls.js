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

    document.addEventListener("click", () => {
        document.body.requestPointerLock();
    });

    document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement !== document.body) return;

        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        pitch = Math.max(
            -Math.PI / 2 + 0.1,
            Math.min(Math.PI / 2 - 0.1, pitch)
        );
    });
}