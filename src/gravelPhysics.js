import { getBlockAt, getBlockTypes, setBlockAt } from "./world.js";

const GRAVITY = 30;
const MAX_FALL_SPEED = 12;
const FALL_STEP_INTERVAL = 0.07;

let sceneReady = false;
let lastTime = performance.now();
let accumulator = 0;
const falling = new Map();

function key(x, y, z) {
    return `${x},${y},${z}`;
}

function isReplaceable(type, BLOCK) {
    return type === BLOCK.AIR;
}

function canFallFrom(x, y, z, BLOCK) {
    if (y <= -31) return false;
    return isReplaceable(getBlockAt(x, y - 1, z), BLOCK);
}

function startFalling(x, y, z) {
    const BLOCK = getBlockTypes();
    if (getBlockAt(x, y, z) !== BLOCK.GRAVEL) return;
    if (!canFallFrom(x, y, z, BLOCK)) return;
    falling.set(key(x, y, z), {
        x,
        y,
        z,
        velocity: 0,
        carry: 0
    });
}

function moveOneStep(state, BLOCK) {
    const currentType = getBlockAt(state.x, state.y, state.z);
    if (currentType !== BLOCK.GRAVEL) return false;

    const nextY = state.y - 1;
    if (nextY < -31 || !isReplaceable(getBlockAt(state.x, nextY, state.z), BLOCK)) {
        return false;
    }

    if (!setBlockAt(state.x, state.y, state.z, BLOCK.AIR)) return false;
    if (!setBlockAt(state.x, nextY, state.z, BLOCK.GRAVEL)) {
        setBlockAt(state.x, state.y, state.z, BLOCK.GRAVEL);
        return false;
    }

    state.y = nextY;
    return true;
}

function tick(delta) {
    if (!sceneReady) return;
    const BLOCK = getBlockTypes();

    for (const [id, state] of falling) {
        if (getBlockAt(state.x, state.y, state.z) !== BLOCK.GRAVEL) {
            falling.delete(id);
            continue;
        }

        state.velocity = Math.min(MAX_FALL_SPEED, state.velocity + GRAVITY * delta);
        state.carry += Math.max(FALL_STEP_INTERVAL, 1 / (state.velocity + 2));

        if (state.carry < 1) continue;
        state.carry = 0;

        if (!canFallFrom(state.x, state.y, state.z, BLOCK)) {
            falling.delete(id);
            continue;
        }

        const oldKey = key(state.x, state.y, state.z);
        if (!moveOneStep(state, BLOCK)) {
            falling.delete(oldKey);
            continue;
        }

        falling.delete(oldKey);
        const newKey = key(state.x, state.y, state.z);
        if (canFallFrom(state.x, state.y, state.z, BLOCK)) {
            falling.set(newKey, state);
        }
    }
}

export function setupGravelPhysics() {
    sceneReady = true;
    lastTime = performance.now();
    accumulator = 0;

    window.addEventListener("webminecraft:blockchange", event => {
        const { x, y, z, type } = event.detail || {};
        const BLOCK = getBlockTypes();
        if (type !== BLOCK.GRAVEL || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
        startFalling(Math.floor(x), Math.floor(y), Math.floor(z));
    });

    const frame = now => {
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        accumulator += delta;
        if (accumulator >= 0.016) {
            tick(accumulator);
            accumulator = 0;
        }
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}
