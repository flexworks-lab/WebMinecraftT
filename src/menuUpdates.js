import { clearWorld } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");

const VERSION_KEY = "webminecraft-game-version";
const VERSIONS = ["v1.0", "v1.1", "v1.2"];

const UPDATE_DETAILS = [
    {
        version: "v1.1 • World Seeds",
        title: "World Seeds",
        body: "World generation is now driven by the world seed. Terrain height, caves, biomes, trees, water, and the world spawn all use the same seed, so entering that seed again recreates the same generated world layout."
    },
    {
        version: "v1.1 • Seed Links",
        title: "Shareable Seed Links",
        body: "Use Copy World Link to copy the current world URL with its seed attached. Opening that link loads the matching generated world, making it easy to share a specific world with someone else."
    },
    {
        version: "Latest • World Screen",
        title: "Full-Screen World Screen",
        body: "Singleplayer now opens a dedicated full-screen world setup screen. You can edit the seed, copy the seed, copy a complete world link, open the world, or return to the main menu."
    },
    {
        version: "Latest • Update Details",
        title: "Interactive Update Logs",
        body: "Every update log can now be opened as a full-screen detail page. Select an update from the Latest Updates panel to read its expanded description, then use Back or Escape to return to the main menu."
    }
];

function injectMenuAnimations() {
    if (document.getElementById("menuAnimationStyles")) return;

    const style = document.createElement("style");
    style.id = "menuAnimationStyles";
    style.textContent = `
        @keyframes wmMenuFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wmMenuTitleIn {
            0% { opacity: 0; transform: translateY(-14px) scaleX(1.04) scale(.98); }
            70% { transform: translateY(2px) scaleX(1.04) scale(1.015); }
            100% { opacity: 1; transform: translateY(0) scaleX(1.04) scale(1); }
        }
        @keyframes wmMenuSplash {
            0% { opacity: 0; transform: rotate(-3deg) scale(.94); }
            55% { opacity: 1; transform: rotate(-3deg) scale(1.04); }
            100% { opacity: 1; transform: rotate(-3deg) scale(1); }
        }
        @keyframes wmMenuButtonIn {
            from { opacity: 0; transform: translateY(10px) scale(.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wmUpdateIn {
            from { opacity: 0; transform: translateX(-16px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes wmSeedIn {
            from { opacity: 0; transform: scale(1.018); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes wmUpdateDetailIn {
            from { opacity: 0; transform: scale(.985); }
            to { opacity: 1; transform: scale(1); }
        }

        #menuPanel > * { opacity: 0; animation: wmMenuFadeUp .45s cubic-bezier(.2,.75,.25,1) forwards; }
        #menuTitle { animation: wmMenuTitleIn .7s cubic-bezier(.16,.8,.24,1) .05s forwards; }
        #menuSubtitle { animation-delay: .15s; }
        #menuSplash { animation: wmMenuSplash .55s cubic-bezier(.2,.8,.2,1) .22s forwards; }
        #menuButtons { opacity: 1; }
        #menuButtons .menuButton { opacity: 0; animation: wmMenuButtonIn .4s cubic-bezier(.2,.8,.2,1) forwards; }
        #menuButtons .menuButton:nth-child(1) { animation-delay: .30s; }
        #menuButtons .menuButton:nth-child(2) { animation-delay: .37s; }
        #menuButtons .menuButton:nth-child(3) { animation-delay: .44s; }
        #menuButtons .menuButton:nth-child(4) { animation-delay: .51s; }

        .menuButton,
        .seedButton,
        #settingsButton,
        #settingsCloseTop,
        #closeSettings,
        #gameVersionButton,
        .gameVersionOption,
        .settingsTab {
            transition: transform .12s cubic-bezier(.2,.8,.2,1), filter .12s ease, box-shadow .12s ease, background .12s ease;
            will-change: transform;
        }
        .menuButton:hover,
        .seedButton:hover,
        #settingsButton:hover,
        #settingsCloseTop:hover,
        #closeSettings:hover,
        #gameVersionButton:hover,
        .gameVersionOption:hover,
        .settingsTab:hover {
            transform: translateY(-2px) scale(1.015);
            filter: brightness(1.08);
        }
        .menuButton:active,
        .seedButton:active,
        #settingsButton:active,
        #settingsCloseTop:active,
        #closeSettings:active,
        #gameVersionButton:active,
        .gameVersionOption:active,
        .settingsTab:active {
            transform: translateY(2px) scale(.985);
            filter: brightness(.94);
        }

        #menuUpdates { animation: wmUpdateIn .5s cubic-bezier(.2,.8,.2,1) .18s both; }
        .menuUpdate {
            cursor: pointer;
            transition: transform .16s ease, filter .16s ease, background .16s ease;
        }
        .menuUpdate:hover { transform: translateX(4px); filter: brightness(1.08); background:#4a4a4a; }
        .menuUpdate:focus-visible { outline:2px solid #fff; outline-offset:1px; }

        #menuFooter, #menuCopyright { transition: opacity .2s ease, transform .2s ease; }
        #menuFooter:hover { transform: translateY(-2px); }
        #menuCopyright:hover { transform: translateY(-2px); }

        #seedPanel { animation: wmSeedIn .22s ease-out both; }
        #seedBackWrap, #seedTitle, #seedSubtitle, #seedInput, #seedActions, #seedLinkStatus { opacity: 0; animation: wmMenuFadeUp .4s cubic-bezier(.2,.75,.25,1) forwards; }
        #seedBackWrap { animation-delay: .03s; }
        #seedTitle { animation-delay: .07s; }
        #seedSubtitle { animation-delay: .12s; }
        #seedInput { animation-delay: .17s; }
        #seedActions { animation-delay: .22s; }
        #seedLinkStatus { animation-delay: .27s; }

        #gameVersionPicker { transform-origin: bottom right; }
        #gameVersionPicker[style*="display: block"] { animation: wmMenuFadeUp .16s ease-out both; }

        #updateDetail {
            position:fixed;
            inset:0;
            display:none;
            align-items:center;
            justify-content:center;
            padding:clamp(18px,4vw,60px);
            background:#171717;
            z-index:300;
            color:#fff;
        }
        #updateDetail.open { display:flex; animation:wmUpdateDetailIn .2s ease-out both; }
        #updateDetailPanel {
            position:relative;
            width:min(900px,100%);
            max-height:min(720px,92vh);
            overflow:auto;
            padding:clamp(26px,5vw,58px);
            background:linear-gradient(180deg,#252525 0%,#1b1b1b 100%);
            border:2px solid #111;
            border-top-color:#777;
            border-left-color:#777;
            box-shadow:6px 6px 0 rgba(0,0,0,.55),inset 2px 2px 0 rgba(255,255,255,.05);
        }
        #updateDetailBack {
            position:absolute;
            top:18px;
            left:18px;
            min-width:110px;
            min-height:42px;
            padding:8px 12px;
            border:2px solid #111;
            border-top-color:#888;
            border-left-color:#888;
            background:linear-gradient(#696969,#505050);
            color:#fff;
            font-family:"MinecraftFont",monospace;
            font-size:12px;
            cursor:pointer;
            text-shadow:2px 2px 0 #222;
        }
        #updateDetailBack:hover { filter:brightness(1.1); transform:translateY(-1px); }
        #updateDetailVersion {
            margin:52px 0 10px;
            color:#8fca68;
            font-family:"MinecraftFont",monospace;
            font-size:13px;
            text-shadow:2px 2px 0 #111;
        }
        #updateDetailTitle {
            margin:0 0 22px;
            font-family:"MinecraftFont",monospace;
            font-size:clamp(30px,5vw,54px);
            line-height:1.05;
            text-shadow:3px 3px 0 #000;
        }
        #updateDetailBody {
            max-width:760px;
            margin:0;
            color:#d0d0d0;
            font-family:Arial,sans-serif;
            font-size:clamp(15px,1.6vw,18px);
            line-height:1.65;
        }
        @media(max-width:760px) {
            #updateDetail { padding:0; }
            #updateDetailPanel { width:100vw; height:100vh; max-height:none; border:0; padding:22px; }
            #updateDetailBack { top:16px; left:16px; }
            #updateDetailVersion { margin-top:70px; }
        }

        @media (prefers-reduced-motion: reduce) {
            #menuPanel > *, #menuButtons .menuButton, #menuUpdates,
            #seedPanel, #seedBackWrap, #seedTitle, #seedSubtitle,
            #seedInput, #seedActions, #seedLinkStatus, #updateDetail.open { animation: none !important; opacity: 1 !important; }
            *, *::before, *::after { scroll-behavior: auto !important; }
        }
    `;
    document.head.appendChild(style);
}

function createUpdateDetail() {
    if (!updates || document.getElementById("updateDetail")) return;

    const detail = document.createElement("div");
    detail.id = "updateDetail";
    detail.setAttribute("aria-hidden", "true");
    detail.innerHTML = `
        <div id="updateDetailPanel" role="dialog" aria-modal="true" aria-labelledby="updateDetailTitle">
            <button id="updateDetailBack" type="button">Back</button>
            <div id="updateDetailVersion"></div>
            <h1 id="updateDetailTitle"></h1>
            <p id="updateDetailBody"></p>
        </div>
    `;
    document.body.appendChild(detail);

    const back = detail.querySelector("#updateDetailBack");
    const version = detail.querySelector("#updateDetailVersion");
    const title = detail.querySelector("#updateDetailTitle");
    const body = detail.querySelector("#updateDetailBody");

    function close() {
        detail.classList.remove("open");
        detail.setAttribute("aria-hidden", "true");
        if (menu) menu.style.pointerEvents = "auto";
    }

    function open(index) {
        const item = UPDATE_DETAILS[index];
        if (!item) return;
        version.textContent = item.version;
        title.textContent = item.title;
        body.textContent = item.body;
        detail.classList.add("open");
        detail.setAttribute("aria-hidden", "false");
        if (menu) menu.style.pointerEvents = "none";
        back.focus();
    }

    back.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        close();
    });

    detail.addEventListener("click", event => {
        if (event.target === detail) close();
    });

    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && detail.classList.contains("open")) {
            event.preventDefault();
            close();
        }
    });

    const cards = updates.querySelectorAll(".menuUpdate");
    cards.forEach((card, index) => {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Open details for ${card.textContent.trim()}`);
        card.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            open(index);
        });
        card.addEventListener("keydown", event => {
            if (event.code === "Enter" || event.code === "Space") {
                event.preventDefault();
                open(index);
            }
        });
    });
}

function syncMenuUpdates() {
    if (!updates || !menu) return;
    const menuVisible = getComputedStyle(menu).display !== "none";
    updates.style.display = menuVisible ? "block" : "none";
}

function watchSeedMenu() {
    if (!seedMenu) return;
    let cleared = false;
    const syncSeedMenu = () => {
        const open = getComputedStyle(seedMenu).display !== "none";
        if (open && !cleared) {
            clearWorld();
            cleared = true;
        } else if (!open) {
            cleared = false;
        }
    };
    const observer = new MutationObserver(syncSeedMenu);
    observer.observe(seedMenu, { attributes: true, attributeFilter: ["style", "class"] });
    syncSeedMenu();
}

function setupSeedBackButton() {
    const backButton = document.getElementById("backSeedButton");
    if (!backButton || backButton.dataset.backHookInstalled) return;
    backButton.dataset.backHookInstalled = "1";

    const goBack = event => {
        event.preventDefault();
        event.stopPropagation();
        if (seedMenu) {
            seedMenu.style.display = "none";
            seedMenu.setAttribute("aria-hidden", "true");
        }
        if (menu) menu.style.display = "flex";

        window.setTimeout(() => {
            window.location.reload();
        }, 80);
    };

    backButton.addEventListener("click", goBack);
    backButton.addEventListener("pointerup", goBack);
}

function getSavedVersion() {
    const saved = localStorage.getItem(VERSION_KEY);
    return VERSIONS.includes(saved) ? saved : VERSIONS[0];
}

function createVersionPicker() {
    if (document.getElementById("gameVersionPicker")) return;

    const style = document.createElement("style");
    style.textContent = `
        #gameVersionButton {
            position: fixed;
            right: 10px;
            bottom: 8px;
            min-width: 88px;
            height: 34px;
            padding: 5px 10px;
            border: 2px solid #111;
            border-top-color: #9a9a9a;
            border-left-color: #9a9a9a;
            border-radius: 2px;
            background: linear-gradient(#666,#4d4d4d);
            color: #fff;
            font-family: "MinecraftFont", monospace;
            font-size: 11px;
            text-shadow: 2px 2px 0 #222;
            cursor: pointer;
            z-index: 97;
            box-shadow: inset 2px 2px 0 rgba(255,255,255,.12), 0 2px 0 rgba(0,0,0,.7);
        }
        #gameVersionButton:hover, #gameVersionButton:focus-visible {
            background: linear-gradient(#777,#5a5a5a);
            outline: 2px solid rgba(255,255,255,.85);
            outline-offset: 1px;
        }
        #gameVersionButton:active {
            transform: translateY(2px);
            background: #444;
        }
        #gameVersionPicker {
            position: fixed;
            right: 10px;
            bottom: 48px;
            width: 160px;
            padding: 6px;
            background: #191919;
            border: 2px solid #111;
            border-top-color: #777;
            border-left-color: #777;
            box-shadow: 4px 4px 0 rgba(0,0,0,.55), inset 2px 2px 0 rgba(255,255,255,.08);
            z-index: 97;
            display: none;
        }
        .gameVersionOption {
            display: block;
            width: 100%;
            min-height: 34px;
            margin: 3px 0;
            border: 2px solid #111;
            border-top-color: #777;
            border-left-color: #777;
            background: #3d3d3d;
            color: white;
            font-family: "MinecraftFont", monospace;
            font-size: 11px;
            text-align: left;
            padding: 7px 9px;
            cursor: pointer;
            text-shadow: 2px 2px 0 #111;
        }
        .gameVersionOption:hover, .gameVersionOption:focus-visible {
            background: #545454;
            outline: 2px solid rgba(255,255,255,.8);
            outline-offset: 0;
        }
        .gameVersionOption.active {
            background: #5e5e5e;
        }
        @media(max-width:760px) {
            #gameVersionButton { right: 8px; bottom: 8px; }
            #gameVersionPicker { right: 8px; bottom: 48px; width: 145px; }
        }
    `;
    document.head.appendChild(style);

    const button = document.createElement("button");
    button.id = "gameVersionButton";
    button.type = "button";
    button.setAttribute("aria-label", "Change game version");

    const picker = document.createElement("div");
    picker.id = "gameVersionPicker";
    picker.setAttribute("role", "menu");

    let currentVersion = getSavedVersion();

    function updateButton() {
        button.textContent = currentVersion;
        for (const option of picker.querySelectorAll(".gameVersionOption")) {
            option.classList.toggle("active", option.dataset.version === currentVersion);
        }
    }

    for (const gameVersion of VERSIONS) {
        const option = document.createElement("button");
        option.className = "gameVersionOption";
        option.type = "button";
        option.dataset.version = gameVersion;
        option.textContent = gameVersion;
        option.setAttribute("role", "menuitem");
        option.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            currentVersion = gameVersion;
            localStorage.setItem(VERSION_KEY, gameVersion);
            window.webminecraftVersion = gameVersion;
            updateButton();
            picker.style.display = "none";
        });
        picker.appendChild(option);
    }

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        picker.style.display = picker.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", event => {
        if (event.target === button || picker.contains(event.target)) return;
        picker.style.display = "none";
    });

    document.addEventListener("keydown", event => {
        if (event.code === "Escape") picker.style.display = "none";
    });

    document.body.appendChild(button);
    document.body.appendChild(picker);
    window.webminecraftVersion = currentVersion;
    updateButton();

    if (menu) {
        const observer = new MutationObserver(() => {
            const menuVisible = getComputedStyle(menu).display !== "none";
            button.style.display = menuVisible ? "block" : "none";
            if (!menuVisible) picker.style.display = "none";
        });
        observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
        button.style.display = getComputedStyle(menu).display !== "none" ? "block" : "none";
    }
}

injectMenuAnimations();
syncMenuUpdates();
createUpdateDetail();
createVersionPicker();
setupSeedBackButton();
watchSeedMenu();

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
