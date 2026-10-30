export function createDevPerformanceLab(deps) {
    const {
        THREE, renderer, mainScene, mainCamera, mainMenu,
        createWorld, clearWorld, updateChunkVisibility, getPerformanceStats,
        setWorldSeed, getWorldSeed, getTerrainProfile, setRenderDistance, CHUNK_SIZE,
        setupWaterPhysics, updateWaterPhysics, resetWaterPhysics, getWaterPerformanceStats,
        updatePlayer, keys, spawnBlockBreakParticles, getBlockTypes, setBlockAt,
        onResume
    } = deps;

    const root = document.createElement("section");
    root.id = "webminecraftDevPerformanceLab";
    root.setAttribute("aria-hidden", "true");
    root.style.cssText = "position:fixed;inset:0;display:none;z-index:2000003;color:#f4f7f4;font:13px/1.45 Arial,sans-serif;background:linear-gradient(90deg,rgba(4,8,6,.22) 0%,rgba(4,8,6,.10) 48%,rgba(10,15,12,.94) 100%);pointer-events:auto;";
    root.innerHTML = [
        '<div style="position:absolute;left:20px;top:18px;max-width:min(520px,48vw);text-shadow:0 2px 5px #000">',
        '<div style="font:900 11px Arial,sans-serif;letter-spacing:3px;color:#a9d5b5">WEBMINECRAFT / DEVELOPER TOOLS</div>',
        '<h1 style="margin:8px 0 5px;font:900 clamp(22px,3vw,36px) Arial,sans-serif;text-shadow:0 3px 8px #000">Performance Simulation</h1>',
        '<div id="devBenchMessage" style="max-width:470px;color:#d7e2d9;font-size:12px;line-height:1.55">An isolated test scene runs the real chunk, water, particle, player-physics and renderer systems one at a time. It never starts a playable world or spawns your player.</div>',
        '</div>',
        '<aside id="devBenchSide" style="position:absolute;right:0;top:0;bottom:0;width:min(410px,44vw);min-width:300px;overflow:auto;padding:20px 18px 22px;background:rgba(15,20,17,.96);border-left:1px solid rgba(215,236,220,.22);box-shadow:-12px 0 36px rgba(0,0,0,.28);">',
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #35433a;padding-bottom:13px">',
        '<div><div style="font-size:10px;font-weight:800;letter-spacing:2px;color:#90b59b">LIVE TELEMETRY</div><div style="font-size:18px;font-weight:900;margin-top:3px">System benchmark</div></div>',
        '<span id="devBenchState" style="padding:5px 8px;border:1px solid #4b634f;background:#26352a;color:#c7e9ce;font-size:9px;font-weight:900;letter-spacing:1px">READY</span>',
        '</div>',
        '<div style="padding:14px 0 12px;border-bottom:1px solid #303b33">',
        '<div id="devBenchStage" style="font-size:13px;font-weight:800;color:#fff">Ready to test</div>',
        '<div id="devBenchStageDetail" style="margin-top:4px;color:#9ca99f;font-size:10px">Press Start test to begin the system sequence.</div>',
        '<div style="height:7px;margin-top:12px;background:#29332c;border:1px solid #405045;overflow:hidden"><div id="devBenchProgress" style="width:0%;height:100%;background:linear-gradient(90deg,#6a9d72,#b4df9f);transition:width .12s linear"></div></div>',
        '<div id="devBenchProgressText" style="display:flex;justify-content:space-between;margin-top:5px;color:#829086;font-size:9px"><span>Overall progress</span><span>0%</span></div>',
        '</div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:13px 0">',
        '<div style="padding:11px;background:#202a23;border:1px solid #3b4b3f"><div style="color:#94a398;font-size:9px;font-weight:800;letter-spacing:1px">CURRENT FPS</div><div id="devBenchFps" style="margin-top:4px;font-size:27px;font-weight:900;font-variant-numeric:tabular-nums">--</div></div>',
        '<div style="padding:11px;background:#202a23;border:1px solid #3b4b3f"><div style="color:#94a398;font-size:9px;font-weight:800;letter-spacing:1px">1% LOW</div><div id="devBenchLow" style="margin-top:4px;font-size:27px;font-weight:900;font-variant-numeric:tabular-nums">--</div></div>',
        '<div style="padding:10px;background:#1b241e;border:1px solid #334238"><div style="color:#94a398;font-size:9px;font-weight:800">FRAME TIME AVG</div><div id="devBenchFrame" style="margin-top:4px;font-size:16px;font-weight:800;font-variant-numeric:tabular-nums">-- ms</div></div>',
        '<div style="padding:10px;background:#1b241e;border:1px solid #334238"><div style="color:#94a398;font-size:9px;font-weight:800">WORST FRAME</div><div id="devBenchWorst" style="margin-top:4px;font-size:16px;font-weight:800;font-variant-numeric:tabular-nums">-- ms</div></div>',
        '</div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Loaded chunks</div><div id="devBenchChunks" style="margin-top:3px;font-weight:800">0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Queued chunks</div><div id="devBenchQueue" style="margin-top:3px;font-weight:800">0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Mesh work / frame</div><div id="devBenchMesh" style="margin-top:3px;font-weight:800">0 ms</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Draw calls</div><div id="devBenchCalls" style="margin-top:3px;font-weight:800">0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Triangles</div><div id="devBenchTriangles" style="margin-top:3px;font-weight:800">0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">GPU resources</div><div id="devBenchMemory" style="margin-top:3px;font-weight:800">0 / 0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Water cells / active</div><div id="devBenchWaterCells" style="margin-top:3px;font-weight:800">0 / 0</div></div>',
        '<div style="padding:8px 9px;background:#1b241e;border:1px solid #303d33"><div style="color:#87958b;font-size:9px">Water fluid / mesh</div><div id="devBenchWaterWork" style="margin-top:3px;font-weight:800">0 / 0 ms</div></div>',
        '</div>',
        '<div style="margin-top:16px;padding-top:13px;border-top:1px solid #303b33"><div style="font-size:10px;font-weight:900;letter-spacing:1.7px;color:#9fb6a4">STAGE RESULTS</div><div id="devBenchResults" style="display:grid;gap:8px;margin-top:10px"><div style="color:#78867c;font-size:10px">Results appear here as each system finishes.</div></div></div>',
        '<div id="devBenchFinal" style="display:none;margin-top:14px;padding:12px;background:#202a23;border:1px solid #526c56"><div style="font-size:9px;font-weight:900;letter-spacing:1px;color:#99caa1">OVERALL PERFORMANCE LEVEL</div><div id="devBenchOverall" style="margin-top:4px;font-size:20px;font-weight:900"></div><div id="devBenchSummary" style="margin-top:6px;font-size:10px;color:#c2cec5;line-height:1.5"></div></div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:17px">',
        '<button id="devBenchStart" type="button" style="min-height:42px;border:1px solid #94c49b;background:linear-gradient(#6d9d73,#426a49);color:#fff;font-weight:900;cursor:pointer">START TEST</button>',
        '<button id="devBenchStop" type="button" style="min-height:42px;border:1px solid #72534d;background:linear-gradient(#784c45,#563630);color:#fff;font-weight:900;cursor:pointer;display:none">STOP TEST</button>',
        '<button id="devBenchCopy" type="button" style="min-height:38px;border:1px solid #536459;background:#303b33;color:#dce8df;font-size:10px;font-weight:800;cursor:pointer">COPY RESULTS</button>',
        '<button id="devBenchClose" type="button" style="min-height:38px;border:1px solid #536459;background:#303b33;color:#dce8df;font-size:10px;font-weight:800;cursor:pointer">CLOSE LAB</button>',
        '</div>',
        '<div style="margin-top:10px;color:#728078;font-size:9px;line-height:1.45">Frame counts are measured from the rendered simulation loop. Results depend on browser load, GPU drivers, display refresh rate and other open tabs.</div>',
        '</aside>'
    ].join("");
    document.body.appendChild(root);

    const el = id => root.querySelector("#" + id);
    const startButton = el("devBenchStart");
    const stopButton = el("devBenchStop");
    const closeButton = el("devBenchClose");
    const copyButton = el("devBenchCopy");
    let benchScene = null;
    let benchCamera = null;
    let preview = null;
    let opened = false;
    let running = false;
    let worldPrepared = false;
    let stopRequested = false;
    let closeAfterStop = false;
    let originalSeed = 0;
    let originalRenderDistance = 3;
    let savedKeys = null;
    let results = [];
    let currentSamples = [];
    let currentStage = "Ready";
    let lastFrameMs = 0;
    let currentStageIndex = -1;
    let totalStageCount = 7;
    let lastParticleBurst = 0;
    let lastBlockEdit = 0;
    let blockEditCursor = 0;
    let blockEditTargets = [];
    let lastStreamX = 0;
    let lastStreamZ = 0;
    let lastHudUpdate = 0;
    let runStartedAt = 0;
    let lastStageError = "";
    let reportText = "";

    const stages = [
        { name: "Renderer baseline", detail: "Measures the browser renderer with a controlled preview scene.", duration: 2400 },
        { name: "Chunk generation + meshing", detail: "Runs the real terrain generator, chunk scheduler and chunk mesh builder.", duration: 8500 },
        { name: "Chunk visibility + streaming", detail: "Moves the simulation camera through chunk boundaries and measures streaming work.", duration: 4500 },
        { name: "Water simulation", detail: "Runs the real water-cell update and dynamic water mesh rebuild loop.", duration: 4500 },
        { name: "Block edits + chunk remeshing", detail: "Places and breaks blocks through the real world setter to measure queued chunk mesh rebuilds.", duration: 4200 },
        { name: "Block-break particles", detail: "Spawns the game's instanced block-fragment effects and measures their render/update cost.", duration: 3600 },
        { name: "Player collision + movement", detail: "Runs the real player movement and block-collision update against the simulation terrain.", duration: 4400 },
        { name: "Combined gameplay load", detail: "Runs streaming, water, movement, particles and rendering together.", duration: 5600 }
    ];
    totalStageCount = stages.length;

    function ensureScene() {
        if (benchScene) return;
        benchScene = new THREE.Scene();
        benchScene.background = mainScene.background?.clone?.() || new THREE.Color(0x87ceeb);
        benchScene.fog = mainScene.fog?.clone?.() || new THREE.Fog(0x87ceeb, 26, 72);
        benchScene.add(new THREE.HemisphereLight(0xcfeeff, 0x3f3b43, 0.82));
        benchScene.add(new THREE.AmbientLight(0x98a4ad, 0.20));
        const sun = new THREE.DirectionalLight(0xfff0cf, 1.45);
        sun.position.set(45, 85, 30);
        benchScene.add(sun);
        const fill = new THREE.DirectionalLight(0x9fc8ef, 0.10);
        fill.position.set(-38, 58, -26);
        benchScene.add(fill);
        benchCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 260);
        benchCamera.position.set(23, 18, 25);
        benchCamera.lookAt(0, 0, 0);
        addPreview();
    }

    function addPreview() {
        if (!benchScene || preview) return;
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x879d7c, roughness: 0.92 });
        const mesh = new THREE.InstancedMesh(geometry, material, 18 * 18);
        const dummy = new THREE.Object3D();
        let index = 0;
        for (let x = -9; x < 9; x++) {
            for (let z = -9; z < 9; z++) {
                const height = 0.2 + Math.sin(x * 0.55) * 0.25 + Math.cos(z * 0.47) * 0.25;
                dummy.position.set(x, height, z);
                dummy.scale.set(0.94, 0.5 + Math.max(0, height), 0.94);
                dummy.updateMatrix();
                mesh.setMatrixAt(index++, dummy.matrix);
            }
        }
        mesh.instanceMatrix.needsUpdate = true;
        preview = { mesh, geometry, material };
        benchScene.add(mesh);
    }

    function removePreview() {
        if (!preview) return;
        benchScene?.remove(preview.mesh);
        preview.geometry.dispose();
        preview.material.dispose();
        preview = null;
    }

    function updateHud(now, stageProgress = 0, overallProgress = 0) {
        const recent = currentSamples.slice(-90);
        const avg = recent.length ? recent.reduce((sum, n) => sum + n, 0) / recent.length : 0;
        const sorted = recent.slice().sort((a, b) => a - b);
        const p99 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))] : 0;
        const fps = avg > 0 ? 1000 / avg : 0;
        const low = p99 > 0 ? 1000 / p99 : 0;
        const liveWorld = getPerformanceStats();
        const world = worldPrepared ? liveWorld : { loadedChunks: 0, queuedChunks: 0, queuedGenerationChunks: 0, queuedMeshRebuilds: 0, chunkProcessMs: 0 };
        const water = getWaterPerformanceStats();
        const render = renderer.info.render;
        const memory = renderer.info.memory;
        el("devBenchFps").textContent = fps > 0 ? fps.toFixed(1) : "--";
        el("devBenchLow").textContent = low > 0 ? low.toFixed(1) : "--";
        el("devBenchFrame").textContent = avg > 0 ? avg.toFixed(2) + " ms" : "-- ms";
        el("devBenchWorst").textContent = currentSamples.length ? Math.max(...currentSamples.slice(-90)).toFixed(1) + " ms" : "-- ms";
        el("devBenchChunks").textContent = String(world.loadedChunks ?? 0);
        el("devBenchQueue").textContent = String(world.queuedChunks ?? 0) + "  (gen " + String(world.queuedGenerationChunks ?? 0) + " / mesh " + String(world.queuedMeshRebuilds ?? 0) + ")";
        el("devBenchMesh").textContent = Number(world.chunkProcessMs || 0).toFixed(2) + " ms";
        el("devBenchCalls").textContent = String(render.calls ?? 0);
        el("devBenchTriangles").textContent = Number(render.triangles || 0).toLocaleString();
        el("devBenchMemory").textContent = String(memory.geometries ?? 0) + " / " + String(memory.textures ?? 0);
        el("devBenchWaterCells").textContent = String(water.waterCells ?? 0) + " / " + String(water.activeCells ?? 0);
        el("devBenchWaterWork").textContent = Number(water.fluidProcessMs || 0).toFixed(2) + " / " + Number(water.meshBuildMs || 0).toFixed(2) + " ms";
        el("devBenchStage").textContent = currentStage;
        const elapsed = runStartedAt ? Math.max(0, (now - runStartedAt) / 1000) : 0;
        el("devBenchStageDetail").textContent = running
            ? "Stage " + (currentStageIndex + 1) + " of " + totalStageCount + " · " + elapsed.toFixed(1) + " s elapsed"
            : "Completed frame-count results stay visible until you close the lab.";
        const percent = Math.max(0, Math.min(100, overallProgress * 100));
        el("devBenchProgress").style.width = percent.toFixed(1) + "%";
        el("devBenchProgressText").lastElementChild.textContent = Math.round(percent) + "%";
        const samplesForNerds = currentSamples.slice(-120);
        window.__webminecraftDevBenchStats = {
            stage: currentStage,
            samples: samplesForNerds,
            lastFrameMs,
            fps,
            onePercentLow: low,
            loadedChunks: world.loadedChunks,
            queuedChunks: world.queuedChunks
        };
        if (now - lastHudUpdate > 250) {
            lastHudUpdate = now;
            deps.updateNerdStats?.();
        }
    }

    function gradeFor(fps, low) {
        if (fps >= 55 && low >= 42) return { label: "Excellent", color: "#9cdda4" };
        if (fps >= 45 && low >= 30) return { label: "Good", color: "#c5df91" };
        if (fps >= 30) return { label: "Fair", color: "#e2c77f" };
        return { label: "Poor", color: "#f09b8d" };
    }

    function summarize(samples) {
        if (samples.length < 12) {
            const fallback = samples.length ? Math.max(...samples) : 1000;
            return {
                frames: samples.length,
                avgMs: fallback,
                p99Ms: fallback,
                worstMs: fallback,
                fps: 0,
                low: 0,
                grade: { label: "Insufficient samples", color: "#e2c77f" },
                reliable: false
            };
        }
        const sorted = samples.slice().sort((a, b) => a - b);
        const total = samples.reduce((sum, n) => sum + n, 0);
        const avgMs = total / samples.length;
        const p99Ms = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))];
        const worstMs = sorted[sorted.length - 1];
        const fps = 1000 / Math.max(0.01, avgMs);
        const low = 1000 / Math.max(0.01, p99Ms);
        return { frames: samples.length, avgMs, p99Ms, worstMs, fps, low, grade: gradeFor(fps, low) };
    }

    function renderResults() {
        const rows = results.map(item => {
            const bar = item.stats.reliable === false ? 2 : Math.max(2, Math.min(100, item.stats.fps / 60 * 100));
            return '<div style="padding:9px 10px;background:#1c251f;border:1px solid #35443a">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">' +
                '<span style="font-size:10px;font-weight:800;color:#e4ebe5">' + item.name + '</span>' +
                '<span style="font-size:9px;font-weight:900;color:' + item.stats.grade.color + '">' + item.stats.grade.label + '</span></div>' +
                '<div style="height:5px;margin-top:7px;background:#303b33;overflow:hidden"><div style="height:100%;width:' + bar.toFixed(1) + '%;background:' + item.stats.grade.color + '"></div></div>' +
                '<div style="display:flex;justify-content:space-between;gap:8px;margin-top:5px;color:#9ca99f;font-size:9px;font-variant-numeric:tabular-nums">' +
                '<span>' + (item.stats.reliable === false ? 'Not enough frames to grade' : item.stats.fps.toFixed(1) + ' avg FPS · ' + item.stats.low.toFixed(1) + ' 1% low') + '</span>' +
                '<span>' + item.stats.avgMs.toFixed(1) + ' ms · ' + item.stats.frames + ' frames</span></div></div>';
        }).join("");
        el("devBenchResults").innerHTML = rows || '<div style="color:#78867c;font-size:10px">No completed stages yet.</div>';
        if (results.length === stages.length) {
            const reliableResults = results.filter(item => item.stats.reliable !== false);
            const overallFps = reliableResults.length ? reliableResults.reduce((sum, item) => sum + item.stats.fps, 0) / reliableResults.length : 0;
            const overallLow = reliableResults.length ? reliableResults.reduce((sum, item) => sum + item.stats.low, 0) / reliableResults.length : 0;
            const grade = reliableResults.length ? gradeFor(overallFps, overallLow) : { label: "Insufficient data", color: "#e2c77f" };
            el("devBenchFinal").style.display = "block";
            el("devBenchOverall").textContent = reliableResults.length ? grade.label + " · " + overallFps.toFixed(1) + " average FPS" : "Insufficient data";
            el("devBenchOverall").style.color = grade.color;
            el("devBenchSummary").textContent = reliableResults.length
                ? "Mean 1% low: " + overallLow.toFixed(1) + " FPS across " + reliableResults.length + " reliable stages. Stages marked insufficient had too few frames to grade, usually because one operation blocked the browser for too long."
                : "No stage produced enough frame samples for a reliable grade. Check for a system blocking the browser main thread.";
        } else {
            el("devBenchFinal").style.display = "none";
        }
        reportText = [
            "WebMinecraft Developer Performance Test",
            "Browser: " + navigator.userAgent,
            "Cores: " + String(navigator.hardwareConcurrency || "unknown"),
            "Device memory: " + String(navigator.deviceMemory || "unknown") + " GB",
            "Renderer pixel ratio: " + renderer.getPixelRatio().toFixed(2),
            "Benchmark status: " + (running ? "RUNNING / PARTIAL" : (lastStageError ? "STOPPED ON ERROR" : (results.length === stages.length ? "COMPLETE" : "STOPPED / INCOMPLETE"))),
            ...(lastStageError ? ["Stage error: " + lastStageError] : []),
            ...results.map(item => item.name + ": " + (item.stats.reliable === false ? "INSUFFICIENT SAMPLES, " : item.stats.fps.toFixed(1) + " average FPS, " + item.stats.low.toFixed(1) + " 1% low, ") + item.stats.avgMs.toFixed(2) + " ms average frame, " + item.stats.worstMs.toFixed(2) + " ms worst frame, " + item.stats.frames + " frames (" + item.stats.grade.label + ")" +
                ", workload " + Number(item.stats.workloadAvgMs || 0).toFixed(2) + " ms avg / " + Number(item.stats.workloadWorstMs || 0).toFixed(2) + " ms worst" +
                ", render " + Number(item.stats.renderAvgMs || 0).toFixed(2) + " ms avg / " + Number(item.stats.renderWorstMs || 0).toFixed(2) + " ms worst" +
                ", chunk work " + Number(item.stats.chunkWorkMs || 0).toFixed(2) + " ms, mesh queue " + Number(item.stats.queuedMeshRebuilds || 0) +
                ", water " + Number(item.stats.waterCells || 0) + " cells, " + Number(item.stats.waterFluidMs || 0).toFixed(2) + " ms fluid / " + Number(item.stats.waterMeshMs || 0).toFixed(2) + " ms mesh" +
                (item.error ? ", ERROR: " + item.error : ""))
        ].join("\\n");
    }

    function setCameraForWorld(x = 0, z = 0, height = 34) {
        benchCamera.position.set(x + 34, height, z + 46);
        benchCamera.lookAt(x, 16, z);
        benchCamera.updateMatrixWorld(true);
    }

    function setupSimulationWorld() {
        removePreview();
        if (!worldPrepared) {
            originalSeed = getWorldSeed();
            originalRenderDistance = getPerformanceStats().renderDistance || 3;
        }
        resetWaterPhysics();
        const testDistance = Math.max(2, Math.min(originalRenderDistance, 3));
        setRenderDistance(testDistance * CHUNK_SIZE);
        setWorldSeed(20261029);
        createWorld(benchScene);
        setupWaterPhysics(benchScene);
        worldPrepared = true;
        const terrain = getTerrainProfile(0, 0);
        setCameraForWorld(0, 0, Math.max(terrain.height + 24, 34));
        lastParticleBurst = 0;
        lastBlockEdit = 0;
        blockEditCursor = 0;
        blockEditTargets = [];
        lastStreamX = 0;
        lastStreamZ = 0;
    }

    function stageWorkload(stageName, now, dt, elapsed) {
        const terrain = getTerrainProfile(0, 0);
        const safeY = terrain.height + 1.35;
        if (stageName === "Chunk generation + meshing") {
            updateChunkVisibility(new THREE.Vector3(0, 24, 0), benchCamera);
            updateWaterPhysics();
        } else if (stageName === "Chunk visibility + streaming") {
            const angle = elapsed * 0.85;
            const x = Math.cos(angle) * 58;
            const z = Math.sin(angle) * 58;
            lastStreamX = x;
            lastStreamZ = z;
            benchCamera.position.set(x + 28, terrain.height + 26, z + 38);
            benchCamera.lookAt(x, 16, z);
            updateChunkVisibility(new THREE.Vector3(x, 24, z), benchCamera);
            updateWaterPhysics();
        } else if (stageName === "Water simulation") {
            updateWaterPhysics();
            benchCamera.rotation.y += dt * 0.08;
        } else if (stageName === "Block edits + chunk remeshing") {
            // Keep the edit workload inside the chunk that the streaming test
            // just generated. The old origin-based targets could be unloaded,
            // which meant setBlockAt only changed the override cache and never
            // queued a real chunk mesh rebuild.
            const anchorChunkX = Math.floor(lastStreamX / CHUNK_SIZE);
            const anchorChunkZ = Math.floor(lastStreamZ / CHUNK_SIZE);
            const targetOffsets = [[4,4],[7,4],[10,4],[13,4],[4,8],[7,8],[10,8],[13,8],[4,12],[7,12],[10,12],[13,12]];
            if (!blockEditTargets.length) {
                blockEditTargets = targetOffsets.map(([ox, oz]) => ({
                    x: anchorChunkX * CHUNK_SIZE + ox,
                    z: anchorChunkZ * CHUNK_SIZE + oz
                }));
            }
            // Drain queued generation/rebuild work in this same region every
            // frame so the stage measures both edit cost and mesh regeneration.
            updateChunkVisibility(new THREE.Vector3(lastStreamX, 24, lastStreamZ), benchCamera);
            if (now - lastBlockEdit > 140) {
                lastBlockEdit = now;
                const target = blockEditTargets[blockEditCursor++ % blockEditTargets.length];
                const y = Math.floor(getTerrainProfile(target.x, target.z).height) + 1;
                const block = getBlockTypes();
                const oldType = getBlockAt(target.x, y, target.z);
                const nextType = oldType === block.AIR ? block.STONE : block.AIR;
                const changed = setBlockAt(target.x, y, target.z, nextType);
                if (!changed) throw new Error("Block edit was rejected at " + target.x + "," + y + "," + target.z);
                window.dispatchEvent(new CustomEvent("webminecraft:blockchange", {
                    detail: { x: target.x, y, z: target.z, type: nextType }
                }));
            }
        } else if (stageName === "Block-break particles") {
            if (now - lastParticleBurst > 820) {
                lastParticleBurst = now;
                spawnBlockBreakParticles(benchScene, new THREE.Vector3(0, safeY, 0), getBlockTypes().STONE);
            }
        } else if (stageName === "Player collision + movement") {
            keys.KeyW = true;
            keys.KeyA = Math.floor(elapsed * 1.5) % 2 === 0;
            updatePlayer(benchCamera, benchScene, dt);
        } else if (stageName === "Combined gameplay load") {
            updateChunkVisibility(benchCamera.position, benchCamera);
            updateWaterPhysics();
            keys.KeyW = true;
            keys.KeyA = Math.floor(elapsed * 1.2) % 2 === 0;
            updatePlayer(benchCamera, benchScene, dt);
            if (now - lastParticleBurst > 930) {
                lastParticleBurst = now;
                spawnBlockBreakParticles(benchScene, new THREE.Vector3(0, safeY, 0), getBlockTypes().STONE);
            }
        }
    }

    function runStage(stage, index) {
        return new Promise(resolve => {
            currentStageIndex = index;
            currentStage = stage.name;
            el("devBenchStageDetail").textContent = stage.detail;
            currentSamples = [];
            const workloadSamples = [];
            const renderSamples = [];
            const start = performance.now();
            let previous = start;
            el("devBenchState").textContent = "RUNNING";
            el("devBenchState").style.color = "#d7f0d8";
            const loop = now => {
                if (stopRequested) {
                    resolve({ name: stage.name, stats: summarize(currentSamples) });
                    return;
                }
                lastFrameMs = Math.max(0.1, now - previous);
                previous = now;
                currentSamples.push(Math.min(1000, lastFrameMs));
                const elapsed = now - start;
                try {
                    const workloadStarted = performance.now();
                    stageWorkload(stage.name, now, Math.min(0.05, lastFrameMs / 1000), elapsed / 1000);
                    workloadSamples.push(performance.now() - workloadStarted);
                    const renderStarted = performance.now();
                    renderer.render(benchScene, benchCamera);
                    renderSamples.push(performance.now() - renderStarted);
                } catch (error) {
                    lastStageError = String(error?.stack || error?.message || error);
                    el("devBenchMessage").textContent = "Simulation error in " + stage.name + ": " + lastStageError;
                    stopRequested = true;
                    resolve({ name: stage.name, stats: summarize(currentSamples), error: lastStageError });
                    return;
                }
                const progress = Math.max(0, Math.min(1, elapsed / stage.duration));
                const overall = (index + progress) / totalStageCount;
                updateHud(now, progress, overall);
                if (elapsed >= stage.duration) {
                    const average = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
                    const worst = values => values.length ? Math.max(...values) : 0;
                    const worldStats = getPerformanceStats();
                    const waterStats = getWaterPerformanceStats();
                    resolve({
                        name: stage.name,
                        stats: {
                            ...summarize(currentSamples),
                            workloadAvgMs: average(workloadSamples),
                            workloadWorstMs: worst(workloadSamples),
                            renderAvgMs: average(renderSamples),
                            renderWorstMs: worst(renderSamples),
                            chunkWorkMs: Number(worldStats.chunkProcessMs || 0),
                            queuedMeshRebuilds: Number(worldStats.queuedMeshRebuilds || 0),
                            waterCells: Number(waterStats.waterCells || 0),
                            activeWaterCells: Number(waterStats.activeCells || 0),
                            waterFluidMs: Number(waterStats.fluidProcessMs || 0),
                            waterMeshMs: Number(waterStats.meshBuildMs || 0)
                        }
                    });
                    return;
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        });
    }

    async function run() {
        if (running) return;
        ensureScene();
        running = true;
        stopRequested = false;
        closeAfterStop = false;
        results = [];
        currentSamples = [];
        runStartedAt = performance.now();
        lastStageError = "";
        el("devBenchResults").innerHTML = '<div style="color:#aab9ad;font-size:10px">Running staged systems...</div>';
        el("devBenchFinal").style.display = "none";
        el("devBenchMessage").textContent = "The benchmark is active in an isolated simulation scene. You are not inside a playable world.";
        startButton.style.display = "none";
        stopButton.style.display = "block";
        copyButton.disabled = true;
        copyButton.textContent = "TEST RUNNING";
        el("devBenchState").textContent = "RUNNING";
        try {
            for (let i = 0; i < stages.length; i++) {
                if (stopRequested) break;
                if (i === 1) setupSimulationWorld();
                const result = await runStage(stages[i], i);
                results.push(result);
                renderResults();
                if (stopRequested || result.error) break;
            }
        } catch (error) {
            el("devBenchMessage").textContent = "Benchmark stopped: " + String(error?.message || error);
        } finally {
            running = false;
            restoreKeys();
            stopButton.style.display = "none";
            startButton.style.display = "block";
            el("devBenchState").textContent = stopRequested ? "STOPPED" : "COMPLETE";
            currentStage = stopRequested ? "Stopped" : "Complete";
            copyButton.disabled = false;
            copyButton.textContent = "COPY RESULTS";
            updateHud(performance.now(), 1, results.length / totalStageCount);
            renderResults();
            if (lastStageError) {
                el("devBenchMessage").textContent = "Test stopped at " + currentStage + ": " + lastStageError;
            } else if (results.length === stages.length) {
                el("devBenchMessage").textContent = "Test complete. All system stages finished. Use Copy results to send the measurements back.";
            } else if (stopRequested) {
                el("devBenchMessage").textContent = "Test stopped manually. Completed stages are preserved; start again to run the full sequence.";
            }
            if (closeAfterStop) cleanupAndHide();
        }
    }

    function restoreKeys() {
        if (!savedKeys) return;
        for (const key of Object.keys(keys)) delete keys[key];
        Object.assign(keys, savedKeys);
        savedKeys = null;
    }

    function cleanupAndHide() {
        if (running) {
            closeAfterStop = true;
            stopRequested = true;
            return;
        }
        try {
            restoreKeys();
            if (worldPrepared) {
                resetWaterPhysics();
                createWorld(mainScene);
                clearWorld();
                setRenderDistance(originalRenderDistance * CHUNK_SIZE);
                setWorldSeed(originalSeed);
                worldPrepared = false;
            }
            removePreview();
            if (benchScene) benchScene.clear();
            benchScene = null;
            benchCamera = null;
        } catch (error) {
            console.warn("Developer benchmark cleanup:", error);
        }
        opened = false;
        window.__webminecraftDevBenchActive = false;
        window.__webminecraftDevBenchStats = null;
        root.style.display = "none";
        root.setAttribute("aria-hidden", "true");
        mainMenu.style.display = "";
        renderer.render(mainScene, mainCamera);
        onResume?.();
    }

    function open() {
        if (opened) return;
        ensureScene();
        opened = true;
        window.__webminecraftDevBenchActive = true;
        document.exitPointerLock?.();
        mainMenu.style.display = "none";
        root.style.display = "block";
        root.setAttribute("aria-hidden", "false");
        currentStage = "Ready";
        el("devBenchStage").textContent = "Ready to test";
        el("devBenchStageDetail").textContent = "The simulation is separate from your player and saved worlds.";
        renderer.render(benchScene, benchCamera);
    }

    startButton.addEventListener("click", () => {
        if (!opened || running) return;
        savedKeys = { ...keys };
        void run();
    });
    stopButton.addEventListener("click", () => { stopRequested = true; });
    closeButton.addEventListener("click", cleanupAndHide);
    copyButton.disabled = true;
    copyButton.addEventListener("click", async () => {
        if (running) {
            el("devBenchMessage").textContent = "Wait for the current system sequence to finish before copying the complete report.";
            return;
        }
        if (!reportText) {
            el("devBenchMessage").textContent = "Run at least one stage before copying results.";
            return;
        }
        try {
            await navigator.clipboard.writeText(reportText);
            el("devBenchMessage").textContent = "Benchmark results copied. Paste them into the chat so the slowest stage can be identified.";
        } catch {
            el("devBenchMessage").textContent = "Clipboard access was blocked. The results remain visible in the Stage Results panel.";
        }
    });
    window.addEventListener("resize", () => {
        if (!benchCamera || !opened) return;
        benchCamera.aspect = window.innerWidth / window.innerHeight;
        benchCamera.updateProjectionMatrix();
    });

    return {
        open,
        close: cleanupAndHide,
        start: run,
        stop: () => { stopRequested = true; },
        isRunning: () => running
    };
}
