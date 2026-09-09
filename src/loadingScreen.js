const openWorldButton = document.getElementById("openWorldButton");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");
const menuUpdates = document.getElementById("menuUpdates");

let loadingOpen = false;
let allowWorldStart = false;

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
            z-index: 500;
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
    const status = document.getElementById("worldLoadingStatus");
    if (status) status.textContent = text;
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
    document.body.style.cursor = "wait";
}

function hideLoading() {
    const overlay = document.getElementById("worldLoadingScreen");
    loadingOpen = false;
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.cursor = "";
}

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

    setStatus("Finding a safe spawn...");
    await nextFrame();
    await nextFrame();
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
