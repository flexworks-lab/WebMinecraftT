function addStyles() {
    if (document.getElementById("webMinecraftVoxelCloudStyles")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftVoxelCloudStyles";
    style.textContent = `
#webMinecraftMovingClouds{display:none !important}
#webMinecraftVoxelClouds{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:5;perspective:900px;transform-style:preserve-3d}
body.webminecraft-in-world #webMinecraftVoxelClouds{opacity:.86}
.wmVoxelCloud{position:absolute;left:0;top:0;width:1px;height:1px;transform-style:preserve-3d;will-change:transform}
.wmVoxelCube{position:absolute;width:34px;height:34px;transform-style:preserve-3d;transform:translate(-17px,-17px)}
.wmVoxelFace{position:absolute;width:34px;height:34px;background:#fff;backface-visibility:hidden;box-sizing:border-box}
.wmVoxelFace.top{transform:rotateX(90deg) translateZ(17px);background:#fff}
.wmVoxelFace.bottom{transform:rotateX(-90deg) translateZ(17px);background:#d7d7d7}
.wmVoxelFace.front{transform:translateZ(17px);background:#f5f5f5}
.wmVoxelFace.back{transform:rotateY(180deg) translateZ(17px);background:#d8d8d8}
.wmVoxelFace.left{transform:rotateY(-90deg) translateZ(17px);background:#e6e6e6}
.wmVoxelFace.right{transform:rotateY(90deg) translateZ(17px);background:#cfcfcf}
@media(max-width:700px){.wmVoxelCube{width:27px;height:27px;transform:translate(-13.5px,-13.5px)}.wmVoxelFace{width:27px;height:27px}.wmVoxelFace.top{transform:rotateX(90deg) translateZ(13.5px)}.wmVoxelFace.bottom{transform:rotateX(-90deg) translateZ(13.5px)}.wmVoxelFace.front{transform:translateZ(13.5px)}.wmVoxelFace.back{transform:rotateY(180deg) translateZ(13.5px)}.wmVoxelFace.left{transform:rotateY(-90deg) translateZ(13.5px)}.wmVoxelFace.right{transform:rotateY(90deg) translateZ(13.5px)}}
body.webminecraft-in-world #discussionButton,
body.webminecraft-in-world #discussionModal,
body.webminecraft-in-world #devControlsButton,
body.webminecraft-in-world #devControlsModal{display:none !important}
`;
    document.head.appendChild(style);
}

function cube(x, y, z) {
    const cube = document.createElement("div");
    cube.className = "wmVoxelCube";
    cube.style.left = `${x}px`;
    cube.style.top = `${y}px`;
    cube.style.transform = `translate(-17px,-17px) translateZ(${z}px)`;
    for (const face of ["top", "bottom", "front", "back", "left", "right"]) {
        const node = document.createElement("div");
        node.className = `wmVoxelFace ${face}`;
        cube.appendChild(node);
    }
    return cube;
}

function createCloudShape() {
    const cloud = document.createElement("div");
    cloud.className = "wmVoxelCloud";
    const blocks = [
        [-68, 10, 0], [-34, 10, 4], [0, 10, 0], [34, 10, -3], [68, 10, 0],
        [-51, -24, 0], [-17, -24, 4], [17, -24, 0], [51, -24, -2],
        [-18, 44, 2], [18, 44, 0]
    ];
    for (const [x, y, z] of blocks) cloud.appendChild(cube(x, y, z));
    return cloud;
}

function initVoxelClouds() {
    if (document.getElementById("webMinecraftVoxelClouds")) return;
    addStyles();
    const layer = document.createElement("div");
    layer.id = "webMinecraftVoxelClouds";
    document.body.appendChild(layer);

    const clouds = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
        const element = createCloudShape();
        const y = 7 + Math.random() * 42;
        const scale = 0.65 + Math.random() * 0.75;
        const x = -45 - Math.random() * 55;
        const speed = 4 + Math.random() * 6;
        element.style.top = `${y}%`;
        element.style.transform = `translate3d(${x}vw,0,0) scale(${scale})`;
        layer.appendChild(element);
        clouds.push({ element, x, y, speed, scale });
    }

    let last = performance.now();
    const tick = now => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        for (const cloud of clouds) {
            cloud.x += cloud.speed * dt;
            if (cloud.x > 115) cloud.x = -65 - Math.random() * 35;
            cloud.element.style.transform = `translate3d(${cloud.x}vw,0,0) scale(${cloud.scale})`;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function init() {
    initVoxelClouds();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
