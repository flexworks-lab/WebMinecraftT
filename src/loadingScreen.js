const openWorldButton = document.getElementById("openWorldButton");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");
const menuUpdates = document.getElementById("menuUpdates");

let loadingOpen = false;
let allowWorldStart = false;
let funnyStatusTimer = null;
let loadingStage = "Generating terrain...";

const funnyLoadingMessages = {
    "Generating terrain...": [
        "Generating terrain... hopefully the ground is still there.",
        "Asking the mountains where they came from...",
        "Convincing trees that leaves belong on trees...",
        "Teaching the dirt how to be dirt...",
        "Making 8 billion blocks behave themselves...",
        "Negotiating with the caves...",
    ],
    "Building world...": [
        "Building the world... one suspicious block at a time.",
        "Placing blocks without dropping any on our foot...",
        "Assembling the universe with zero instructions.",
        "Making the world look like somebody planned it...",
        "Counting blocks. We lost count.",
        "Constructing important Minecraft stuff™...",
    ],
    "Loading saved world data...": [
        "Loading saved world data... checking the ancient scrolls.",
        "Looking for your world... it was here five seconds ago.",
        "Reassembling your blocks from the cloud...",
        "Asking the save file what happened while you were gone...",
        "Dusting off your world save...",
        "Making sure your hard work did not vanish into the void...",
    ],
    "Applying server world data...": [
        "Applying server world data... politely asking everyone to stand by.",
        "Syncing the server... no, the creeper did not break it.",
        "Making your blocks agree with everybody else's blocks...",
        "Checking what changed while you were away...",
        "Connecting all the tiny multiplayer block brains...",
        "Making sure everybody sees the same dirt...",
    ],
    "Building world chunks...": [
        "Building world chunks... chunk by chunk by chunk by chunk...",
        "Convincing distant chunks to load faster.",
        "Waking up the next patch of terrain...",
        "Carving out places for you to immediately get lost.",
        "Generating somewhere nice to fall from...",
        "Loading chunks. Please do not stare at them. They get nervous.",
    ],
    "Finding a safe place to stand...": [
        "Finding a safe place to stand... preferably not a cliff.",
        "Looking for solid ground that is not secretly a trap...",
        "Checking if the floor exists. Very important.",
        "Searching for somewhere you probably will not fall through...",
        "Finding a spawn point with actual ground underneath it...",
        "Making sure you are standing on blocks and not pure optimism...",
    ]
};

function ensureStyles() {
    if (document.getElementById("worldLoadingStyles")) return;
    const style = document.createElement("style");
    style.id = "worldLoadingStyles";
    style.textContent = `
        @keyframes wmLoadingFade {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes wmLoadingPanelIn {
            from { opacity: 0; transform: translateY(18px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wmLoadingSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes wmLoadingBar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(-8%); }
            100% { transform: translateX(100%); }
        }
        #worldLoadingScreen {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: #171717;
            color: #fff;
            z-index: 2147483647 !important;
            isolation: isolate;
            pointer-events: auto;
        }
        #worldLoadingScreen.open {
            display: flex;
            animation: wmLoadingFade .16s ease-out both;
        }
        #worldLoadingPanel {
            width: min(520px, 88vw);
            text-align: center;
            animation: wmLoadingPanelIn .28s cubic-bezier(.2,.75,.25,1) both;
        }
        #worldLoadingTitle {
            margin: 0 0 12px;
            font-family: "MinecraftFont", monospace;
            font-size: clamp(28px, 5vw, 46px);
            text-shadow: 3px 3px 0 #000;
        }
        #worldLoadingStatus {
            min-height: 22px;
            margin-bottom: 20px;
            color: #aaa;
            font-size: 14px;
        }
        #worldLoadingSpinner {
            width: 34px;
            height: 34px;
            margin: 0 auto 20px;
            border: 4px solid #414141;
            border-top-color: #8fca68;
            border-radius: 50%;
            animation: wmLoadingSpin .8s linear infinite;
        }
        #worldLoadingTrack {
            width: 100%;
            height: 8px;
            overflow: hidden;
            background: #303030;
            border: 2px solid #111;
        }
        #worldLoadingFill {
            width: 45%;
            height: 100%;
            background: #8fca68;
            transform: translateX(-100%);
            animation: wmLoadingBar 1.1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
            #worldLoadingScreen.open, #worldLoadingPanel, #worldLoadingSpinner, #worldLoadingFill {
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function ensureOverlay() {
    if (document.getElementById("worldLoadingScreen")) return document.getElementById("worldLoadingScreen");
    const overlay = document.createElement("div");
    overlay.id = "worldLoadingScreen";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div id="worldLoadingPanel" role="status" aria-live="polite" aria-label="Loading world">
            <h1 id="worldLoadingTitle">Loading World</h1>
            <div id="worldLoadingSpinner" aria-hidden="true"></div>
            <div id="worldLoadingStatus">Generating terrain...</div>
            <div id="worldLoadingTrack" aria-hidden="true"><div id="worldLoadingFill"></div></div>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function setStatus(text) {
    loadingStage = String(text || "Working...");
    const status = document.getElementById("worldLoadingStatus");
    if (status) status.textContent = getFunnyStatus(loadingStage);
}

function getFunnyStatus(stage = loadingStage) {
    const pool = funnyLoadingMessages[stage] || [
        "Doing important block things...",
        "Turning computer magic into Minecraft...",
        "The blocks are thinking very hard...",
        "Almost ready... probably.",
        "Checking one last thing...",
        "Please hold. The pixels are negotiating."
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

function startFunnyStatusCycle() {
    stopFunnyStatusCycle();
    const showNext = () => {
        if (!loadingOpen) return;
        setStatus(loadingStage);
    };
    showNext();
    funnyStatusTimer = window.setInterval(showNext, 1500);
}

function stopFunnyStatusCycle() {
    if (funnyStatusTimer !== null) {
        window.clearInterval(funnyStatusTimer);
        funnyStatusTimer = null;
    }
}

function waitForWorldReady(timeoutMs = 15000) {
    return new Promise(resolve => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            window.removeEventListener("webminecraft:world-ready", onReady);
            clearTimeout(timer);
            resolve();
        };
        const onReady = () => finish();
        const timer = setTimeout(finish, timeoutMs);
        window.addEventListener("webminecraft:world-ready", onReady, { once: true });
    });
}

function showLoading() {
    ensureStyles();
    const overlay = ensureOverlay();
    loadingOpen = true;
    overlay.classList.remove("open");
    void overlay.offsetWidth;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    setStatus("Generating terrain...");
    startFunnyStatusCycle();
    document.body.style.cursor = "wait";
}

function hideLoading() {
    const overlay = document.getElementById("worldLoadingScreen");
    loadingOpen = false;
    stopFunnyStatusCycle();
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.cursor = "";
}

window.__webminecraftShowWorldLoading = showLoading;
window.__webminecraftSetWorldLoadingStatus = setStatus;
window.__webminecraftHideWorldLoading = hideLoading;
window.__webminecraftWaitForWorldReady = waitForWorldReady;

function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function runWorldStart() {
    if (loadingOpen) return;
    showLoading();
    await nextFrame();

    allowWorldStart = true;
    setStatus("Building world...");
    openWorldButton.click();

    setStatus("Loading saved world data...");
    await waitForWorldReady(15000);
    hideLoading();
}

function setupWorldStartHook() {
    if (!openWorldButton || openWorldButton.dataset.loadingHookInstalled) return;
    openWorldButton.dataset.loadingHookInstalled = "1";

    openWorldButton.addEventListener("click", event => {
        if (allowWorldStart) {
            allowWorldStart = false;
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        runWorldStart();
    }, true);
}

function addLoadingUpdateLog() {
    if (!menuUpdates || menuUpdates.querySelector('[data-loading-update="1"]')) return;
    const card = document.createElement("article");
    card.className = "menuUpdate";
    card.dataset.loadingUpdate = "1";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Open details for World Loading Screen");
    card.innerHTML = `
        <div class="menuUpdateVersion">Latest • Loading Screen</div>
        <div class="menuUpdateText">World creation now uses a loading screen only while a world is being prepared.</div>
    `;
    menuUpdates.appendChild(card);

    const openDetails = event => {
        event?.preventDefault();
        event?.stopPropagation();
        const detail = document.getElementById("loadingUpdateDetail");
        if (!detail) return;
        detail.style.display = "flex";
        detail.setAttribute("aria-hidden", "false");
        detail.classList.remove("open");
        void detail.offsetWidth;
        detail.classList.add("open");
    };
    card.addEventListener("click", openDetails);
    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") openDetails(event);
    });
}

function addLoadingUpdateDetail() {
    if (document.getElementById("loadingUpdateDetail")) return;
    ensureStyles();
    const detail = document.createElement("div");
    detail.id = "loadingUpdateDetail";
    detail.setAttribute("aria-hidden", "true");
    detail.innerHTML = `
        <div class="loadingUpdateDetailPanel">
            <button id="loadingUpdateDetailBack" class="seedButton" type="button">← Back</button>
            <div class="loadingUpdateDetailVersion">Latest • Loading Screen</div>
            <h2>World Loading Screen</h2>
            <p>World creation now has its own loading surface. It appears when a new world is being built, stays visible while the first world setup finishes, and disappears after the game has had time to render the new world.</p>
            <p>The loading screen is not shown during normal gameplay, so it does not get in the way once the world is ready.</p>
        </div>
    `;
    document.body.appendChild(detail);

    const close = event => {
        event?.preventDefault();
        detail.classList.remove("open");
        detail.style.display = "none";
        detail.setAttribute("aria-hidden", "true");
    };
    document.getElementById("loadingUpdateDetailBack")?.addEventListener("click", close);
    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && detail.style.display === "flex") close(event);
    });

    const style = document.createElement("style");
    style.id = "loadingUpdateDetailStyles";
    style.textContent = `
        #loadingUpdateDetail {
            position: fixed;
            inset: 0;
            display: none;
            align-items: stretch;
            justify-content: center;
            overflow: auto;
            background: linear-gradient(180deg,#252525 0%,#171717 100%);
            color: white;
            z-index: 220;
        }
        #loadingUpdateDetail.open { animation: wmLoadingFade .22s ease-out both; }
        .loadingUpdateDetailPanel {
            width: min(1040px,100vw);
            min-height: 100vh;
            padding: clamp(28px,6vh,72px) clamp(22px,7vw,92px);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .loadingUpdateDetailPanel h2 {
            margin: 22px 0;
            font-family: "MinecraftFont",monospace;
            font-size: clamp(32px,5vw,62px);
            line-height: 1;
            text-shadow: 3px 3px 0 #000;
        }
        .loadingUpdateDetailPanel p {
            max-width: 860px;
            color: #d6d6d6;
            font-size: clamp(15px,1.65vw,20px);
            line-height: 1.7;
            margin: 0 0 18px;
        }
        .loadingUpdateDetailVersion {
            color: #8fca68;
            font-family: "MinecraftFont",monospace;
            font-size: clamp(12px,1.5vw,16px);
        }
        #loadingUpdateDetailBack { align-self: flex-start; min-width: 130px; }
    `;
    document.head.appendChild(style);
}

ensureStyles();
setupWorldStartHook();
addLoadingUpdateDetail();
window.setTimeout(addLoadingUpdateLog, 0);

if (menu && seedMenu) {
    const observer = new MutationObserver(() => {
        const menuVisible = getComputedStyle(menu).display !== "none";
        const seedVisible = getComputedStyle(seedMenu).display !== "none";
        if (menuVisible && !seedVisible) window.setTimeout(addLoadingUpdateLog, 0);
    });
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}
