import * as THREE from "three";
import { waterTexture } from "./blocks.js";

const FRAME_COUNT = 32;
const FRAME_FPS = 10;

let prepared = false;
let animating = false;
let frame = 0;
let lastAnimationTime = 0;
let frameCanvas = null;
let frameContext = null;
let frameSize = 0;
let sourceLayout = null;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.needsUpdate = true;

function imageSize() {
    const image = waterTexture.image;
    return {
        image,
        width: Number(image?.naturalWidth || image?.videoWidth || image?.width || 0),
        height: Number(image?.naturalHeight || image?.videoHeight || image?.height || 0)
    };
}

function getSourceLayout(width, height) {
    if (!width || !height) return null;

    if (height === width * FRAME_COUNT) {
        return { axis: "y", sourceFrameCount: FRAME_COUNT, frameWidth: width, frameHeight: width };
    }

    if (width === height * FRAME_COUNT) {
        return { axis: "x", sourceFrameCount: FRAME_COUNT, frameWidth: height, frameHeight: height };
    }

    if (height >= width * 2) {
        return { axis: "y", sourceFrameCount: Math.max(1, Math.round(height / width)), frameWidth: width, frameHeight: width };
    }

    if (width >= height * 2) {
        return { axis: "x", sourceFrameCount: Math.max(1, Math.round(width / height)), frameWidth: height, frameHeight: height };
    }

    return { axis: "single", sourceFrameCount: 1, frameWidth: Math.min(width, height), frameHeight: Math.min(width, height) };
}

function sanitizeCanvas(ctx, width, height) {
    try {
        const imageData = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            if (a > 0 && r < 18 && g < 18 && b < 18) imageData.data[i + 3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
    } catch {
        // Some browsers can block canvas pixel reads; keep the source frame.
    }
}

function drawSourceFrame(targetContext, image, layout, sourceIndex) {
    targetContext.clearRect(0, 0, frameSize, frameSize);

    if (layout.axis === "x") {
        targetContext.drawImage(
            image,
            sourceIndex * layout.frameWidth, 0,
            layout.frameWidth, layout.frameHeight,
            0, 0,
            frameSize, frameSize
        );
        return;
    }

    if (layout.axis === "y") {
        targetContext.drawImage(
            image,
            0, sourceIndex * layout.frameHeight,
            layout.frameWidth, layout.frameHeight,
            0, 0,
            frameSize, frameSize
        );
        return;
    }

    targetContext.drawImage(
        image,
        0, 0,
        layout.frameWidth, layout.frameHeight,
        0, 0,
        frameSize, frameSize
    );
}

function prepareWaterFrameTexture() {
    if (prepared) return true;

    const { image, width, height } = imageSize();
    if (!image || !width || !height) return false;

    sourceLayout = getSourceLayout(width, height);
    if (!sourceLayout) return false;

    frameSize = sourceLayout.frameWidth;
    frameCanvas = document.createElement("canvas");
    frameCanvas.width = frameSize;
    frameCanvas.height = frameSize;
    frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });
    if (!frameContext) {
        frameCanvas = null;
        return false;
    }

    frameContext.imageSmoothingEnabled = false;
    drawSourceFrame(frameContext, image, sourceLayout, 0);
    sanitizeCanvas(frameContext, frameSize, frameSize);

    waterTexture.image = frameCanvas;
    waterTexture.repeat.set(1, 1);
    waterTexture.offset.set(0, 0);
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.magFilter = THREE.NearestFilter;
    waterTexture.minFilter = THREE.NearestFilter;
    waterTexture.needsUpdate = true;

    prepared = true;
    return true;
}

function drawAnimationFrame(nextFrame) {
    if (!prepared || !frameContext || !sourceLayout) return;
    const sourceIndex = sourceLayout.sourceFrameCount === 1
        ? 0
        : nextFrame % sourceLayout.sourceFrameCount;

    drawSourceFrame(frameContext, waterTexture.image, sourceLayout, sourceIndex);
    sanitizeCanvas(frameContext, frameSize, frameSize);
    waterTexture.needsUpdate = true;
}

function animate(time) {
    if (!prepared) prepareWaterFrameTexture();

    if (prepared && time - lastAnimationTime >= 1000 / FRAME_FPS) {
        lastAnimationTime = time;
        frame = (frame + 1) % FRAME_COUNT;
        drawAnimationFrame(frame);
    }

    window.requestAnimationFrame(animate);
}

function start() {
    if (animating) return;
    animating = true;
    window.requestAnimationFrame(animate);
}

if (typeof window !== "undefined") {
    start();

    if (!prepareWaterFrameTexture()) {
        const retry = () => {
            if (!prepareWaterFrameTexture()) window.setTimeout(retry, 100);
        };
        window.setTimeout(retry, 100);
    }
}
