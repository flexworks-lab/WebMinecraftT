import { keys, yaw, pitch } from "./controls.js";
import { getBlockAt } from "./world.js";

let velocityY = 0;
let velocityX = 0;
let velocityZ = 0;
let onGround = false;
let jumpPressed = false;

const PLAYER_WIDTH = 0.6;
const PLAYER_HEIGHT = 1.8;
const HALF_WIDTH = PLAYER_WIDTH / 2;

const WALK_SPEED = 4.5;
const SPRINT_SPEED = 6.5;

const GROUND_ACCELERATION = 38;
const AIR_ACCELERATION = 12;
const GROUND_FRICTION = 30;
const AIR_FRICTION = 2;

const GRAVITY = 24;
const JUMP_FORCE = 8.5;
const MAX_FALL_SPEED = 45;

const MAX_SUBSTEP = 0.08;
const SKIN = 0.001;


function getPlayerBox(camera) {
    return {
        minX: camera.position.x - HALF_WIDTH,
        maxX: camera.position.x + HALF_WIDTH,
        minY: camera.position.y - PLAYER_HEIGHT,
        maxY: camera.position.y,
        minZ: camera.position.z - HALF_WIDTH,
        maxZ: camera.position.z + HALF_WIDTH
    };
}


function isSolidAt(x, y, z) {
    return !!getBlockAt(x, y, z);
}


function boxCollides(camera) {
    const box = getPlayerBox(camera);

    const minX = Math.floor(box.minX - SKIN);
    const maxX = Math.floor(box.maxX + SKIN);
    const minY = Math.floor(box.minY - SKIN);
    const maxY = Math.floor(box.maxY + SKIN);
    const minZ = Math.floor(box.minZ - SKIN);
    const maxZ = Math.floor(box.maxZ + SKIN);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                if (!isSolidAt(x, y, z)) continue;

                if (
                    box.minX < x + 0.5 &&
                    box.maxX > x - 0.5 &&
                    box.minY < y + 0.5 &&
                    box.maxY > y - 0.5 &&
                    box.minZ < z + 0.5 &&
                    box.maxZ > z - 0.5
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}


function groundCheck(camera) {
    const box = getPlayerBox(camera);
    const footY = box.minY;
    const blockY = Math.floor(footY + 0.5 - 0.0001);

    const minX = Math.floor(box.minX + SKIN);
    const maxX = Math.floor(box.maxX - SKIN);
    const minZ = Math.floor(box.minZ + SKIN);
    const maxZ = Math.floor(box.maxZ - SKIN);

    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            if (!isSolidAt(x, blockY, z)) continue;

            const top = blockY + 0.5;

            if (
                footY >= top - 0.08 &&
                footY <= top + 0.08
            ) {
                return top;
            }
        }
    }

    return null;
}


function approach(current, target, amount) {
    if (current < target) {
        return Math.min(current + amount, target);
    }

    if (current > target) {
        return Math.max(current - amount, target);
    }

    return target;
}


function moveAxis(camera, axis, amount) {
    if (amount === 0) return true;

    const steps = Math.max(
        1,
        Math.ceil(Math.abs(amount) / MAX_SUBSTEP)
    );

    const step = amount / steps;

    for (let i = 0; i < steps; i++) {
        camera.position[axis] += step;

        if (!boxCollides(camera)) {
            continue;
        }

        const direction = Math.sign(step);
        let correction = 0;

        for (let j = 0; j < 20; j++) {
            camera.position[axis] -= direction * 0.005;

            if (!boxCollides(camera)) {
                correction = 0.005;
                break;
            }
        }

        if (correction === 0) {
            camera.position[axis] -= step;
        }

        return false;
    }

    return true;
}


function moveVertical(camera, amount) {
    if (amount === 0) return;

    const steps = Math.max(
        1,
        Math.ceil(Math.abs(amount) / MAX_SUBSTEP)
    );

    const step = amount / steps;

    for (let i = 0; i < steps; i++) {
        const oldY = camera.position.y;

        camera.position.y += step;

        if (!boxCollides(camera)) {
            continue;
        }

        camera.position.y = oldY;

        if (step < 0) {
            const box = getPlayerBox(camera);
            const minX = Math.floor(box.minX + SKIN);
            const maxX = Math.floor(box.maxX - SKIN);
            const minZ = Math.floor(box.minZ + SKIN);
            const maxZ = Math.floor(box.maxZ - SKIN);

            let highestTop = -Infinity;

            for (let x = minX; x <= maxX; x++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const blockY = Math.floor(box.minY - 0.5);

                    for (let y = blockY - 1; y <= blockY + 1; y++) {
                        if (!isSolidAt(x, y, z)) continue;

                        const top = y + 0.5;

                        if (top <= box.minY + 0.12) {
                            highestTop = Math.max(highestTop, top);
                        }
                    }
                }
            }

            if (highestTop !== -Infinity) {
                camera.position.y = highestTop + PLAYER_HEIGHT;
                onGround = true;
            }

            velocityY = 0;
            return;
        }

        velocityY = 0;
        return;
    }
}


function updateGroundState(camera) {
    const groundY = groundCheck(camera);

    if (groundY === null) {
        onGround = false;
        return;
    }

    const targetY = groundY + PLAYER_HEIGHT;
    const difference = targetY - camera.position.y;

    if (Math.abs(difference) <= 0.08 && velocityY <= 0) {
        camera.position.y = targetY;
        velocityY = 0;
        onGround = true;
    } else if (difference < 0 && difference > -0.15 && velocityY <= 0) {
        camera.position.y = targetY;
        velocityY = 0;
        onGround = true;
    } else {
        onGround = false;
    }
}


export function updatePlayer(
    camera,
    scene,
    deltaTime = 1 / 60
) {
    deltaTime = Math.min(deltaTime, 0.05);

    if (document.pointerLockElement !== document.body) {
        return;
    }

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    updateGroundState(camera);

    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    let inputX = 0;
    let inputZ = 0;

    if (keys["KeyW"]) {
        inputX += forwardX;
        inputZ += forwardZ;
    }

    if (keys["KeyS"]) {
        inputX -= forwardX;
        inputZ -= forwardZ;
    }

    if (keys["KeyA"]) {
        inputX -= rightX;
        inputZ -= rightZ;
    }

    if (keys["KeyD"]) {
        inputX += rightX;
        inputZ += rightZ;
    }

    const inputLength = Math.hypot(inputX, inputZ);

    if (inputLength > 0) {
        inputX /= inputLength;
        inputZ /= inputLength;
    }

    const sprinting = !!keys["ShiftLeft"] || !!keys["ShiftRight"];
    const targetSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED;

    const targetX = inputX * targetSpeed;
    const targetZ = inputZ * targetSpeed;

    const acceleration = onGround
        ? GROUND_ACCELERATION
        : AIR_ACCELERATION;

    if (inputLength > 0) {
        velocityX = approach(
            velocityX,
            targetX,
            acceleration * deltaTime
        );

        velocityZ = approach(
            velocityZ,
            targetZ,
            acceleration * deltaTime
        );
    } else {
        const friction = onGround
            ? GROUND_FRICTION
            : AIR_FRICTION;

        velocityX = approach(
            velocityX,
            0,
            friction * deltaTime
        );

        velocityZ = approach(
            velocityZ,
            0,
            friction * deltaTime
        );
    }

    const horizontalVelocityBeforeX = velocityX;
    const horizontalVelocityBeforeZ = velocityZ;

    const movedX = moveAxis(
        camera,
        "x",
        velocityX * deltaTime
    );

    if (!movedX) {
        velocityX = 0;
    } else {
        velocityX = horizontalVelocityBeforeX;
    }

    const movedZ = moveAxis(
        camera,
        "z",
        velocityZ * deltaTime
    );

    if (!movedZ) {
        velocityZ = 0;
    } else {
        velocityZ = horizontalVelocityBeforeZ;
    }

    const spaceDown = !!keys["Space"];

    if (
        spaceDown &&
        !jumpPressed &&
        onGround
    ) {
        velocityY = JUMP_FORCE;
        onGround = false;
    }

    jumpPressed = spaceDown;

    velocityY -= GRAVITY * deltaTime;
    velocityY = Math.max(velocityY, -MAX_FALL_SPEED);

    moveVertical(
        camera,
        velocityY * deltaTime
    );

    updateGroundState(camera);

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}