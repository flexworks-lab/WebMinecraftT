import { keys, yaw, pitch } from "./controls.js";
import { getBlockAt } from "./world.js";

let velocityY = 0;
let onGround = false;
let jumpPressed = false;

const PLAYER_WIDTH = 0.6;
const PLAYER_HEIGHT = 1.8;

const MOVE_SPEED = 4.5;

const GRAVITY = 22;
const JUMP_FORCE = 8;

const MAX_FALL_SPEED = 40;

const MAX_STEP = 0.15;


// =========================
// PLAYER BOX
// =========================

function getPlayerBox(camera) {

    const halfWidth =
        PLAYER_WIDTH / 2;

    return {
        minX: camera.position.x - halfWidth,
        maxX: camera.position.x + halfWidth,

        minY:
            camera.position.y -
            PLAYER_HEIGHT,

        maxY:
            camera.position.y,

        minZ: camera.position.z - halfWidth,
        maxZ: camera.position.z + halfWidth
    };
}


// =========================
// CHECK BLOCK OVERLAP
// =========================

function overlaps(
    box,
    x,
    y,
    z
) {

    return (
        box.minX < x + 0.5 &&
        box.maxX > x - 0.5 &&

        box.minY < y + 0.5 &&
        box.maxY > y - 0.5 &&

        box.minZ < z + 0.5 &&
        box.maxZ > z - 0.5
    );
}


// =========================
// HORIZONTAL COLLISION
// =========================

function horizontalCollision(camera) {

    const box =
        getPlayerBox(camera);

    const minX =
        Math.floor(box.minX);

    const maxX =
        Math.floor(box.maxX);

    const minY =
        Math.floor(box.minY);

    const maxY =
        Math.floor(box.maxY);

    const minZ =
        Math.floor(box.minZ);

    const maxZ =
        Math.floor(box.maxZ);


    for (
        let x = minX;
        x <= maxX;
        x++
    ) {

        for (
            let y = minY;
            y <= maxY;
            y++
        ) {

            for (
                let z = minZ;
                z <= maxZ;
                z++
            ) {

                if (
                    getBlockAt(
                        x,
                        y,
                        z
                    ) &&
                    overlaps(
                        box,
                        x,
                        y,
                        z
                    )
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}


// =========================
// HORIZONTAL MOVEMENT
// =========================

function moveHorizontal(
    camera,
    axis,
    amount
) {

    if (amount === 0) {
        return;
    }

    const steps =
        Math.max(
            1,
            Math.ceil(
                Math.abs(amount) /
                MAX_STEP
            )
        );

    const step =
        amount / steps;


    for (
        let i = 0;
        i < steps;
        i++
    ) {

        const old =
            camera.position[axis];

        camera.position[axis] +=
            step;


        if (
            horizontalCollision(
                camera
            )
        ) {

            camera.position[axis] =
                old;

            break;
        }
    }
}


// =========================
// VERTICAL MOVEMENT
// =========================

function moveVertical(
    camera,
    amount
) {

    if (amount === 0) {
        return;
    }

    const steps =
        Math.max(
            1,
            Math.ceil(
                Math.abs(amount) /
                MAX_STEP
            )
        );

    const step =
        amount / steps;


    for (
        let i = 0;
        i < steps;
        i++
    ) {

        const oldY =
            camera.position.y;

        const oldBottom =
            oldY -
            PLAYER_HEIGHT;

        const oldTop =
            oldY;


        camera.position.y +=
            step;


        const newY =
            camera.position.y;

        const newBottom =
            newY -
            PLAYER_HEIGHT;

        const newTop =
            newY;


        const box =
            getPlayerBox(camera);


        const minX =
            Math.floor(box.minX);

        const maxX =
            Math.floor(box.maxX);

        const minZ =
            Math.floor(box.minZ);

        const maxZ =
            Math.floor(box.maxZ);


        // =========================
        // FALLING
        // =========================

        if (step < 0) {

            let floor =
                -Infinity;


            const minY =
                Math.floor(
                    newBottom
                ) - 1;

            const maxY =
                Math.floor(
                    oldBottom
                ) + 1;


            for (
                let x = minX;
                x <= maxX;
                x++
            ) {

                for (
                    let z = minZ;
                    z <= maxZ;
                    z++
                ) {

                    for (
                        let y = minY;
                        y <= maxY;
                        y++
                    ) {

                        if (
                            !getBlockAt(
                                x,
                                y,
                                z
                            )
                        ) {
                            continue;
                        }


                        const top =
                            y + 0.5;


                        // Feet crossed the
                        // top of this block
                        if (
                            oldBottom >= top &&
                            newBottom <= top
                        ) {

                            floor =
                                Math.max(
                                    floor,
                                    top
                                );
                        }
                    }
                }
            }


            if (
                floor !==
                -Infinity
            ) {

                camera.position.y =
                    floor +
                    PLAYER_HEIGHT;

                velocityY = 0;
                onGround = true;

                return;
            }


            onGround = false;
        }


        // =========================
        // CEILING
        // =========================

        if (step > 0) {

            let ceiling =
                Infinity;


            const minY =
                Math.floor(
                    oldTop
                ) - 1;

            const maxY =
                Math.floor(
                    newTop
                ) + 1;


            for (
                let x = minX;
                x <= maxX;
                x++
            ) {

                for (
                    let z = minZ;
                    z <= maxZ;
                    z++
                ) {

                    for (
                        let y = minY;
                        y <= maxY;
                        y++
                    ) {

                        if (
                            !getBlockAt(
                                x,
                                y,
                                z
                            )
                        ) {
                            continue;
                        }


                        const bottom =
                            y - 0.5;


                        if (
                            oldTop <= bottom &&
                            newTop >= bottom
                        ) {

                            ceiling =
                                Math.min(
                                    ceiling,
                                    bottom
                                );
                        }
                    }
                }
            }


            if (
                ceiling !==
                Infinity
            ) {

                camera.position.y =
                    ceiling;

                velocityY = 0;

                return;
            }
        }
    }
}


// =========================
// UPDATE PLAYER
// =========================

export function updatePlayer(
    camera,
    scene,
    deltaTime = 1 / 60
) {

    deltaTime =
        Math.min(
            deltaTime,
            0.05
        );


    // =========================
    // DIRECTIONS
    // =========================

    const forwardX =
        -Math.sin(yaw);

    const forwardZ =
        -Math.cos(yaw);

    const rightX =
        Math.cos(yaw);

    const rightZ =
        -Math.sin(yaw);


    let moveX = 0;
    let moveZ = 0;


    if (keys["KeyW"]) {
        moveX += forwardX;
        moveZ += forwardZ;
    }

    if (keys["KeyS"]) {
        moveX -= forwardX;
        moveZ -= forwardZ;
    }

    if (keys["KeyA"]) {
        moveX -= rightX;
        moveZ -= rightZ;
    }

    if (keys["KeyD"]) {
        moveX += rightX;
        moveZ += rightZ;
    }


    // =========================
    // NORMALIZE
    // =========================

    const length =
        Math.sqrt(
            moveX * moveX +
            moveZ * moveZ
        );

    if (length > 0) {

        moveX /= length;
        moveZ /= length;
    }


    // =========================
    // MOVEMENT
    // =========================

    const movement =
        MOVE_SPEED *
        deltaTime;


    moveHorizontal(
        camera,
        "x",
        moveX * movement
    );

    moveHorizontal(
        camera,
        "z",
        moveZ * movement
    );


    // =========================
    // JUMP
    // =========================

    const spaceDown =
        !!keys["Space"];


    if (
        spaceDown &&
        !jumpPressed &&
        onGround
    ) {

        velocityY =
            JUMP_FORCE;

        onGround = false;
    }


    jumpPressed =
        spaceDown;


    // =========================
    // GRAVITY
    // =========================

    velocityY -=
        GRAVITY *
        deltaTime;

    velocityY =
        Math.max(
            velocityY,
            -MAX_FALL_SPEED
        );


    // =========================
    // VERTICAL
    // =========================

    moveVertical(
        camera,
        velocityY *
        deltaTime
    );


    // =========================
    // CAMERA
    // =========================

    camera.rotation.order =
        "YXZ";

    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;
}