import * as THREE from "three";
import { waterTexture } from "./blocks.js";

const FRAME_COUNT = 32;
const FRAME_FPS = 10;

let prepared = false;
let animating = false;
let frame = 0;
let lastAnimationTime = 0;

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.ClampToEdgeWrapping;
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
        // Pixel access may be unavailable; keep the original texture colors.
    }
}

function drawFrame(ctx, image, layout, sourceIndex, targetSize, targetY) {
    const sourceWidth = layout.frameWidth;
    const sourceHeight = layout.frameHeight;

    if (layout.axis === "x") {
        const sourceX = sourceIndex * sourceWidth;
        ctx.drawImage(image, sourceX, 0, sourceWidth, sourceHeight, 0, targetY, targetSize, targetSize);
        return;
    }

    if (layout.axis === "y") {
        const sourceY = sourceIndex * sourceHeight;
        ctx.drawImage(image, 0, sourceY, sourceWidth, sourceHeight, 0, targetY, targetSize, targetSize);
        return;
    }

    const strip = document.createElement("canvas");
    strip.width = targetSize * 2;
    strip.height = targetSize;
    const stripCtx = strip.getContext("2d");
    if (!stripCtx) return;

    stripCtx.imageSmoothingEnabled = false;
    stripCtx.drawImage(image, 0, 0, targetSize, targetSize);
    stripCtx.drawImage(image, targetSize, 0, targetSize, targetSize);

    const offset = (sourceIndex / FRAME_COUNT) * targetSize;
    ctx.drawImage(strip, offset, 0, targetSize, targetSize, 0, targetY, targetSize, targetSize);
}

function prepareWaterSpritesheet() {
    if (prepared) return true;

    const { image, width, height } = imageSize();
    if (!image || !width || !height) return false;

    const layout = getSourceLayout(width, height);
    if (!layout) return false;

    const targetSize = layout.frameWidth;
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize * FRAME_COUNT;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < FRAME_COUNT; i++) {
        const sourceIndex = layout.sourceFrameCount === 1 ? i : i % layout.sourceFrameCount;
        drawFrame(ctx, image, layout, sourceIndex, targetSize, i * targetSize);
    }

    sanitizeCanvas(ctx, canvas.width, canvas.height);

    waterTexture.image = canvas;
    waterTexture.repeat.set(1, 1 / FRAME_COUNT);
    waterTexture.offset.set(0, 0);
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.ClampToEdgeWrapping;
    waterTexture.magFilter = THREE.NearestFilter;
    waterTexture.minFilter = THREE.NearestFilter;
    waterTexture.needsUpdate = true;

    prepared = true;
    return true;
}

function animate(time) {
    if (!prepared) prepareWaterSpritesheet();

    if (prepared && time - lastAnimationTime >= 1000 / FRAME_FPS) {
        lastAnimationTime = time;
        frame = (frame + 1) % FRAME_COUNT;
        waterTexture.offset.x = 0;
        waterTexture.offset.y = frame / FRAME_COUNT;
        waterTexture.needsUpdate = true;
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

    if (!prepareWaterSpritesheet()) {
        const retry = () => {
            if (!prepareWaterSpritesheet()) window.setTimeout(retry, 100);
        };
        window.setTimeout(retry, 100);
    }
}
