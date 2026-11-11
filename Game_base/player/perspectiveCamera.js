import * as THREE from "three";

/**
 * Third-person camera rig.
 *
 * The gameplay camera remains the authoritative first-person/player-eye
 * position. This rig only moves the render camera after player physics and
 * restores the first-person pose automatically when the mode changes.
 */
export function createPerspectiveCameraRig(camera, options = {}) {
    const distance = Number(options.distance) || 4.35;
    const followRate = Number(options.followRate) || 16;
    const collisionPadding = Number(options.collisionPadding) || 0.28;
    const cameraRadius = Number(options.cameraRadius) || 0.18;
    const pivotHeight = Number(options.pivotHeight) || 0.72;

    const desired = new THREE.Vector3();
    const pivot = new THREE.Vector3();
    const probe = new THREE.Vector3();
    const current = new THREE.Vector3();
    let initialized = false;
    let activeMode = "first";
    let boomLength = distance;
    let savedPosition = null;
    let savedRotation = null;

    function pointBlocked(point, getBlockAt, getBlockCollisionBoxes) {
        const offsets = [
            [0, 0, 0],
            [cameraRadius, 0, 0],
            [-cameraRadius, 0, 0],
            [0, cameraRadius, 0],
            [0, -cameraRadius, 0],
            [0, 0, cameraRadius],
            [0, 0, -cameraRadius]
        ];
        for (const [ox, oy, oz] of offsets) {
            const x = Math.floor(point.x + ox + 0.5);
            const y = Math.floor(point.y + oy + 0.5);
            const z = Math.floor(point.z + oz + 0.5);
            const boxes = getBlockCollisionBoxes(getBlockAt(x, y, z), x, y, z) || [];
            for (const box of boxes) {
                if (
                    point.x + ox >= box.minX && point.x + ox <= box.maxX &&
                    point.y + oy >= box.minY && point.y + oy <= box.maxY &&
                    point.z + oz >= box.minZ && point.z + oz <= box.maxZ
                ) return true;
            }
        }
        return false;
    }

    function findSafeBoom(origin, direction, getBlockAt, getBlockCollisionBoxes) {
        const steps = Math.ceil(distance / 0.12);
        for (let i = 1; i <= steps; i++) {
            const length = distance * i / steps;
            probe.copy(origin).addScaledVector(direction, length);
            if (pointBlocked(probe, getBlockAt, getBlockCollisionBoxes)) {
                return Math.max(0.38, length - collisionPadding);
            }
        }
        return distance;
    }

    function update({
        mode = "first",
        yaw = 0,
        pitch = 0,
        deltaTime = 1 / 60,
        getBlockAt,
        getBlockCollisionBoxes
    } = {}) {
        if (mode === "first") {
            initialized = false;
            activeMode = "first";
            return;
        }

        if (typeof getBlockAt !== "function" || typeof getBlockCollisionBoxes !== "function") return;

        savedPosition = camera.position.clone();
        savedRotation = camera.rotation.clone();
        const eye = savedPosition;
        pivot.set(eye.x, eye.y - pivotHeight, eye.z);

        const front = mode === "front";
        const safePitch = THREE.MathUtils.clamp(Number(pitch) || 0, -1.30, 1.30);
        const safeYaw = Number.isFinite(yaw) ? yaw : 0;
        const horizontal = Math.cos(safePitch);
        const vertical = Math.sin(safePitch) * (front ? 1 : -1);

        // Player forward is -Z at yaw zero. Back view sits behind that
        // direction; front view mirrors the boom and camera facing.
        const sign = front ? 1 : -1;
        const boomDirection = new THREE.Vector3(
            -Math.sin(safeYaw) * sign * horizontal,
            vertical,
            -Math.cos(safeYaw) * sign * horizontal
        ).normalize();

        const safeDistance = findSafeBoom(pivot, boomDirection, getBlockAt, getBlockCollisionBoxes);
        const blocked = safeDistance < distance - 0.001;
        if (!initialized || mode !== activeMode) {
            boomLength = safeDistance;
        } else if (blocked) {
            // Pull in immediately so the camera never lingers inside a wall.
            boomLength = safeDistance;
        } else {
            // Ease back out after leaving an obstruction.
            const recovery = 1 - Math.exp(-5.5 * Math.max(0, Math.min(deltaTime, 0.05)));
            boomLength += (safeDistance - boomLength) * recovery;
        }

        desired.copy(pivot).addScaledVector(boomDirection, boomLength);
        if (!initialized || mode !== activeMode) {
            current.copy(desired);
            initialized = true;
            activeMode = mode;
        } else {
            const alpha = 1 - Math.exp(-followRate * Math.max(0, Math.min(deltaTime, 0.05)));
            current.lerp(desired, alpha);
        }

        camera.position.copy(current);
        camera.rotation.order = "YXZ";
        camera.rotation.y = safeYaw + (front ? Math.PI : 0);
        camera.rotation.x = front ? -safePitch : safePitch;
        camera.rotation.z = 0;
        camera.updateMatrixWorld(true);
    }

    function restore() {
        if (!savedPosition || !savedRotation) return;
        camera.position.copy(savedPosition);
        camera.rotation.copy(savedRotation);
        camera.updateMatrixWorld(true);
        savedPosition = null;
        savedRotation = null;
    }

    function reset() {
        restore();
        initialized = false;
        activeMode = "first";
    }

    return { update, restore, reset };
}
