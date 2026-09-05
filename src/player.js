import { keys, yaw, pitch, touchInput, isFlying } from "./controls.js";
import { getBlockAt } from "./world.js";

let velocityX = 0;
let velocityY = 0;
let velocityZ = 0;
let onGround = false;
let jumpWasDown = false;

const PLAYER_WIDTH = 1.0;
const PLAYER_HEIGHT = 1.8;
const HALF_WIDTH = PLAYER_WIDTH / 2;

const WALK_SPEED = 4.3;
const SPRINT_SPEED = 5.6;
const FLY_SPEED = 10;
const FLY_SPRINT_SPEED = 18;

const GROUND_ACCEL = 32;
const AIR_ACCEL = 8;
const GROUND_FRICTION = 24;
const AIR_FRICTION = 1.5;

const GRAVITY = 24;
const JUMP_SPEED = 8.0;
const MAX_FALL_SPEED = 40;

const STEP_HEIGHT = 0.6;
const SKIN = 0.001;
const HORIZONTAL_SKIN = 0;
const MAX_PHYSICS_STEP = 1 / 120;

function blockExists(x, y, z) {
    return !!getBlockAt(x, y, z);
}

function getBox(camera) {
    return {
        minX: camera.position.x - HALF_WIDTH,
        maxX: camera.position.x + HALF_WIDTH,
        minY: camera.position.y - PLAYER_HEIGHT,
        maxY: camera.position.y,
        minZ: camera.position.z - HALF_WIDTH,
        maxZ: camera.position.z + HALF_WIDTH
    };
}

function intersectsBlock(box, x, y, z) {
    return (
        box.minX < x + 0.5 - HORIZONTAL_SKIN &&
        box.maxX > x - 0.5 + HORIZONTAL_SKIN &&
        box.minY < y + 0.5 - SKIN &&
        box.maxY > y - 0.5 + SKIN &&
        box.minZ < z + 0.5 - HORIZONTAL_SKIN &&
        box.maxZ > z - 0.5 + HORIZONTAL_SKIN
    );
}

function collides(camera) {
    const box = getBox(camera);
    const minX = Math.floor(box.minX - 0.5);
    const maxX = Math.floor(box.maxX + 0.5);
    const minY = Math.floor(box.minY - 0.5);
    const maxY = Math.floor(box.maxY + 0.5);
    const minZ = Math.floor(box.minZ - 0.5);
    const maxZ = Math.floor(box.maxZ + 0.5);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                if (blockExists(x, y, z) && intersectsBlock(box, x, y, z)) return true;
            }
        }
    }
    return false;
}

function updateGround(camera) {
    const box = getBox(camera);
    const footY = box.minY;
    const blockY = Math.floor(footY - 0.5);

    const minX = Math.floor(box.minX + HORIZONTAL_SKIN);
    const maxX = Math.floor(box.maxX - HORIZONTAL_SKIN);
    const minZ = Math.floor(box.minZ + HORIZONTAL_SKIN);
    const maxZ = Math.floor(box.maxZ - HORIZONTAL_SKIN);

    let bestTop = -Infinity;
    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            for (let y = blockY - 1; y <= blockY + 1; y++) {
                if (!blockExists(x, y, z)) continue;
                const top = y + 0.5;
                if (top <= footY + 0.08 && top >= footY - 0.08) bestTop = Math.max(bestTop, top);
            }
        }
    }

    if (bestTop !== -Infinity && velocityY <= 0) {
        camera.position.y = bestTop + PLAYER_HEIGHT;
        velocityY = 0;
        onGround = true;
        return;
    }
    onGround = false;
}

function getNearbyBlockRange(box) {
    return {
        minX: Math.floor(box.minX - 0.5),
        maxX: Math.floor(box.maxX + 0.5),
        minY: Math.floor(box.minY - 0.5),
        maxY: Math.floor(box.maxY + 0.5),
        minZ: Math.floor(box.minZ - 0.5),
        maxZ: Math.floor(box.maxZ + 0.5)
    };
}

function tryStep(camera, axis, amount) {
    if (!onGround || velocityY > 0) return false;
    const oldX = camera.position.x;
    const oldY = camera.position.y;
    const oldZ = camera.position.z;
    camera.position.y += STEP_HEIGHT;
    if (collides(camera)) {
        camera.position.set(oldX, oldY, oldZ);
        return false;
    }
    camera.position[axis] += amount;
    if (collides(camera)) {
        camera.position.set(oldX, oldY, oldZ);
        return false;
    }
    return true;
}

function moveX(camera, amount) {
    if (amount === 0) return true;
    camera.position.x += amount;
    if (!collides(camera)) return true;
    camera.position.x -= amount;
    if (tryStep(camera, "x", amount)) return true;
    camera.position.x += amount;
    const box = getBox(camera);
    const range = getNearbyBlockRange(box);
    let resolved = false;

    if (amount > 0) {
        let nearest = Infinity;
        for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
            if (!blockExists(x, y, z)) continue;
            const blockMinX = x - 0.5;
            if (box.minX < blockMinX && box.maxY > y - 0.5 + SKIN && box.minY < y + 0.5 - SKIN && box.maxZ > z - 0.5 + HORIZONTAL_SKIN && box.minZ < z + 0.5 - HORIZONTAL_SKIN) nearest = Math.min(nearest, blockMinX - HALF_WIDTH - HORIZONTAL_SKIN);
        }
        if (nearest !== Infinity) { camera.position.x = nearest; resolved = true; }
    } else {
        let nearest = -Infinity;
        for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
            if (!blockExists(x, y, z)) continue;
            const blockMaxX = x + 0.5;
            if (box.maxX > blockMaxX && box.maxY > y - 0.5 + SKIN && box.minY < y + 0.5 - SKIN && box.maxZ > z - 0.5 + HORIZONTAL_SKIN && box.minZ < z + 0.5 - HORIZONTAL_SKIN) nearest = Math.max(nearest, blockMaxX + HALF_WIDTH + HORIZONTAL_SKIN);
        }
        if (nearest !== -Infinity) { camera.position.x = nearest; resolved = true; }
    }
    if (!resolved || collides(camera)) camera.position.x -= amount;
    return false;
}

function moveZ(camera, amount) {
    if (amount === 0) return true;
    camera.position.z += amount;
    if (!collides(camera)) return true;
    camera.position.z -= amount;
    if (tryStep(camera, "z", amount)) return true;
    camera.position.z += amount;
    const box = getBox(camera);
    const range = getNearbyBlockRange(box);
    let resolved = false;

    if (amount > 0) {
        let nearest = Infinity;
        for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
            if (!blockExists(x, y, z)) continue;
            const blockMinZ = z - 0.5;
            if (box.minZ < blockMinZ && box.maxX > x - 0.5 + HORIZONTAL_SKIN && box.minX < x + 0.5 - HORIZONTAL_SKIN && box.maxY > y - 0.5 + SKIN && box.minY < y + 0.5 - SKIN) nearest = Math.min(nearest, blockMinZ - HALF_WIDTH - HORIZONTAL_SKIN);
        }
        if (nearest !== Infinity) { camera.position.z = nearest; resolved = true; }
    } else {
        let nearest = -Infinity;
        for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
            if (!blockExists(x, y, z)) continue;
            const blockMaxZ = z + 0.5;
            if (box.maxZ > blockMaxZ && box.maxX > x - 0.5 + HORIZONTAL_SKIN && box.minX < x + 0.5 - HORIZONTAL_SKIN && box.maxY > y - 0.5 + SKIN && box.minY < y + 0.5 - SKIN) nearest = Math.max(nearest, blockMaxZ + HALF_WIDTH + HORIZONTAL_SKIN);
        }
        if (nearest !== -Infinity) { camera.position.z = nearest; resolved = true; }
    }
    if (!resolved || collides(camera)) camera.position.z -= amount;
    return false;
}

function moveY(camera, amount) {
    if (amount === 0) return;
    camera.position.y += amount;
    if (!collides(camera)) return;
    const box = getBox(camera);
    const range = getNearbyBlockRange(box);

    if (amount < 0) {
        let highestTop = -Infinity;
        for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
            if (!blockExists(x, y, z)) continue;
            const top = y + 0.5;
            if (box.minY < top && box.maxY > y - 0.5 + SKIN && box.maxX > x - 0.5 + HORIZONTAL_SKIN && box.minX < x + 0.5 - HORIZONTAL_SKIN && box.maxZ > z - 0.5 + HORIZONTAL_SKIN && box.minZ < z + 0.5 - HORIZONTAL_SKIN) highestTop = Math.max(highestTop, top);
        }
        camera.position.y = highestTop !== -Infinity ? highestTop + PLAYER_HEIGHT : camera.position.y - amount;
        velocityY = 0;
        onGround = true;
        return;
    }

    let lowestBottom = Infinity;
    for (let x = range.minX; x <= range.maxX; x++) for (let y = range.minY; y <= range.maxY; y++) for (let z = range.minZ; z <= range.maxZ; z++) {
        if (!blockExists(x, y, z)) continue;
        const bottom = y - 0.5;
        if (box.maxY > bottom && box.minY < y + 0.5 - SKIN && box.maxX > x - 0.5 + HORIZONTAL_SKIN && box.minX < x + 0.5 - HORIZONTAL_SKIN && box.maxZ > z - 0.5 + HORIZONTAL_SKIN && box.minZ < z + 0.5 - HORIZONTAL_SKIN) lowestBottom = Math.min(lowestBottom, bottom);
    }
    camera.position.y = lowestBottom !== Infinity ? lowestBottom - SKIN : camera.position.y - amount;
    velocityY = 0;
}

function approach(current, target, amount) {
    if (current < target) return Math.min(current + amount, target);
    if (current > target) return Math.max(current - amount, target);
    return target;
}

function physicsStep(camera, dt) {
    if (isFlying) {
        const forwardX = -Math.sin(yaw);
        const forwardZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);
        let inputX = touchInput.moveX * rightX + touchInput.moveZ * forwardX;
        let inputZ = touchInput.moveX * rightZ + touchInput.moveZ * forwardZ;
        if (keys["KeyW"]) { inputX += forwardX; inputZ += forwardZ; }
        if (keys["KeyS"]) { inputX -= forwardX; inputZ -= forwardZ; }
        if (keys["KeyA"]) { inputX -= rightX; inputZ -= rightZ; }
        if (keys["KeyD"]) { inputX += rightX; inputZ += rightZ; }
        const inputLength = Math.hypot(inputX, inputZ);
        if (inputLength > 1) { inputX /= inputLength; inputZ /= inputLength; }
        const fast = keys["ShiftLeft"] || keys["ShiftRight"] || touchInput.sprint;
        const speed = fast ? FLY_SPRINT_SPEED : FLY_SPEED;
        const targetX = inputX * speed;
        const targetZ = inputZ * speed;
        velocityX = approach(velocityX, targetX, 45 * dt);
        velocityZ = approach(velocityZ, targetZ, 45 * dt);
        let verticalInput = 0;
        if (keys["Space"] || touchInput.jump) verticalInput += 1;
        if (keys["ControlLeft"] || keys["ControlRight"]) verticalInput -= 1;
        velocityY = approach(velocityY, verticalInput * speed, 45 * dt);
        camera.position.x += velocityX * dt;
        camera.position.y += velocityY * dt;
        camera.position.z += velocityZ * dt;
        onGround = false;
        jumpWasDown = !!keys["Space"] || touchInput.jump;
        return;
    }

    updateGround(camera);
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);
    let inputX = touchInput.moveX * rightX + touchInput.moveZ * forwardX;
    let inputZ = touchInput.moveX * rightZ + touchInput.moveZ * forwardZ;
    if (keys["KeyW"]) { inputX += forwardX; inputZ += forwardZ; }
    if (keys["KeyS"]) { inputX -= forwardX; inputZ -= forwardZ; }
    if (keys["KeyA"]) { inputX -= rightX; inputZ -= rightZ; }
    if (keys["KeyD"]) { inputX += rightX; inputZ += rightZ; }
    const inputLength = Math.hypot(inputX, inputZ);
    if (inputLength > 1) { inputX /= inputLength; inputZ /= inputLength; }
    const sprinting = ((keys["ShiftLeft"] || keys["ShiftRight"]) || touchInput.sprint) && (keys["KeyW"] || Math.hypot(touchInput.moveX, touchInput.moveZ) > 0.65);
    const targetSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED;
    const targetX = inputX * targetSpeed;
    const targetZ = inputZ * targetSpeed;
    if (inputLength > 0.02) {
        const acceleration = onGround ? GROUND_ACCEL : AIR_ACCEL;
        velocityX = approach(velocityX, targetX, acceleration * dt);
        velocityZ = approach(velocityZ, targetZ, acceleration * dt);
    } else {
        const friction = onGround ? GROUND_FRICTION : AIR_FRICTION;
        velocityX = approach(velocityX, 0, friction * dt);
        velocityZ = approach(velocityZ, 0, friction * dt);
    }
    const jumpDown = !!keys["Space"] || touchInput.jump;
    if (jumpDown && !jumpWasDown && onGround) {
        velocityY = JUMP_SPEED;
        onGround = false;
    }
    jumpWasDown = jumpDown;
    velocityY -= GRAVITY * dt;
    velocityY = Math.max(velocityY, -MAX_FALL_SPEED);
    if (!moveX(camera, velocityX * dt)) velocityX = 0;
    if (!moveZ(camera, velocityZ * dt)) velocityZ = 0;
    moveY(camera, velocityY * dt);
    updateGround(camera);
}

export function updatePlayer(camera, scene, deltaTime = 1 / 60) {
    deltaTime = Math.min(deltaTime, 0.05);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    let remaining = deltaTime;
    while (remaining > 0) {
        const step = Math.min(remaining, MAX_PHYSICS_STEP);
        physicsStep(camera, step);
        remaining -= step;
    }
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}