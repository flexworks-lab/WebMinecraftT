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
        @keyframes wmSeedScreenIn {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wmSeedContentIn {
            from { opacity: 0; transform: translateY(70px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wmUpdateDetailIn {
            from { opacity: 0; transform: translateY(70px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wmUpdateDetailContentIn {
            from { opacity: 0; transform: translateY(22px); }
            to { opacity: 1; transform: translateY(0); }
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
        .settingsTab,
        .menuUpdate {
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
            user-select: none;
        }
        .menuUpdate:hover,
        .menuUpdate:focus-visible {
            transform: translateX(4px) scale(1.015);
            filter: brightness(1.08);
            outline: 2px solid rgba(255,255,255,.78);
            outline-offset: 1px;
        }
        .menuUpdate:active { transform: translateX(3px) scale(.985); filter: brightness(.94); }

        #updateDetailMenu {
            position: fixed;
            inset: 0;
            display: none;
            align-items: stretch;
            justify-content: center;
            overflow: auto;
            background: linear-gradient(180deg,#252525 0%,#171717 100%);
            color: #fff;
            z-index: 220;
            opacity: 0;
        }
        #updateDetailMenu.update-detail-opening {
            display: flex;
            animation: wmUpdateDetailIn .48s cubic-bezier(.16,.8,.24,1) forwards;
        }
        #updateDetailPanel {
            position: relative;
            width: min(1040px,100vw);
            min-height: 100vh;
            padding: clamp(28px,6vh,72px) clamp(22px,7vw,92px);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        #updateDetailBackWrap {
            position: absolute;
            left: clamp(18px,4vw,60px);
            top: clamp(18px,4vh,44px);
            z-index: 2;
        }
        #updateDetailBack { min-width: 130px; }
        #updateDetailVersion {
            margin: 0 0 10px;
            color: #8fca68;
            font-family: "MinecraftFont",monospace;
            font-size: clamp(12px,1.5vw,16px);
            text-shadow: 2px 2px 0 #111;
            opacity: 0;
        }
        #updateDetailTitle {
            margin: 0 0 22px;
            max-width: 900px;
            font-family: "MinecraftFont",monospace;
            font-size: clamp(32px,5vw,62px);
            line-height: 1;
            text-shadow: 3px 3px 0 #000;
            opacity: 0;
        }
        #updateDetailBody {
            max-width: 860px;
            color: #d6d6d6;
            font-size: clamp(15px,1.65vw,20px);
            line-height: 1.7;
            opacity: 0;
        }
        #updateDetailMenu.update-detail-ready #updateDetailBackWrap,
        #updateDetailMenu.update-detail-ready #updateDetailVersion,
        #updateDetailMenu.update-detail-ready #updateDetailTitle,
        #updateDetailMenu.update-detail-ready #updateDetailBody {
            animation: wmUpdateDetailContentIn .38s cubic-bezier(.2,.75,.25,1) forwards;
        }
        #updateDetailMenu.update-detail-ready #updateDetailVersion { animation-delay: .10s; }
        #updateDetailMenu.update-detail-ready #updateDetailTitle { animation-delay: .16s; }
        #updateDetailMenu.update-detail-ready #updateDetailBody { animation-delay: .22s; }

        #menuFooter, #menuCopyright { transition: opacity .2s ease, transform .2s ease; }
        #menuFooter:hover { transform: translateY(-2px); }
        #menuCopyright:hover { transform: translateY(-2px); }

        #seedMenu { overflow: hidden; }
        #seedMenu.seed-menu-opening {
            animation: wmSeedScreenIn .55s cubic-bezier(.16,.8,.24,1) both;
        }
        #seedMenu.seed-menu-opening #seedPanel { animation: none; }
        #seedMenu.seed-menu-opening #seedBackWrap,
        #seedMenu.seed-menu-opening #seedTitle,
        #seedMenu.seed-menu-opening #seedSubtitle,
        #seedMenu.seed-menu-opening #seedInput,
        #seedMenu.seed-menu-opening #seedActions,
        #seedMenu.seed-menu-opening #seedLinkStatus {
            opacity: 0;
            animation: wmSeedContentIn .42s cubic-bezier(.2,.75,.25,1) forwards;
        }
        #seedMenu.seed-menu-opening #seedBackWrap { animation-delay: .12s; }
        #seedMenu.seed-menu-opening #seedTitle { animation-delay: .17s; }
        #seedMenu.seed-menu-opening #seedSubtitle { animation-delay: .22s; }
        #seedMenu.seed-menu-opening #seedInput { animation-delay: .27s; }
        #seedMenu.seed-menu-opening #seedActions { animation-delay: .32s; }
        #seedMenu.seed-menu-opening #seedLinkStatus { animation-delay: .37s; }

        #gameVersionPicker { transform-origin: bottom right; }
        #gameVersionPicker[style*="display: block"] { animation: wmMenuFadeUp .16s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
            #menuPanel > *, #menuButtons .menuButton, #menuUpdates,
            #seedMenu.seed-menu-opening, #seedMenu.seed-menu-opening #seedBackWrap,
            #seedMenu.seed-menu-opening #seedTitle, #seedMenu.seed-menu-opening #seedSubtitle,
            #seedMenu.seed-menu-opening #seedInput, #seedMenu.seed-menu-opening #seedActions,
            #seedMenu.seed-menu-opening #seedLinkStatus,
            #updateDetailMenu.update-detail-opening,
            #updateDetailMenu.update-detail-ready #updateDetailBackWrap,
            #updateDetailMenu.update-detail-ready #updateDetailVersion,
            #updateDetailMenu.update-detail-ready #updateDetailTitle,
            #updateDetailMenu.update-detail-ready #updateDetailBody { animation: none !important; opacity: 1 !important; }
            *, *::before, *::after { scroll-behavior: auto !important; }
        }
    `;
    document.head.appendChild(style);
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
            seedMenu.classList.remove("seed-menu-opening");
            void seedMenu.offsetWidth;
            seedMenu.classList.add("seed-menu-opening");
        } else if (!open) {
            cleared = false;
            seedMenu.classList.remove("seed-menu-opening");
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
            seedMenu.classList.remove("seed-menu-opening");
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

function setupUpdateDetails() {
    if (!updates || document.getElementById("updateDetailMenu")) return;

    const cards = Array.from(updates.querySelectorAll(".menuUpdate"));
    cards.forEach((card, index) => {
        if (!UPDATE_DETAILS[index]) return;
        card.dataset.updateIndex = String(index);
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `Open details for ${UPDATE_DETAILS[index].title}`);
    });

    const newCard = document.createElement("article");
    newCard.className = "menuUpdate";
    newCard.dataset.updateIndex = "3";
    newCard.setAttribute("role", "button");
    newCard.setAttribute("tabindex", "0");
    newCard.setAttribute("aria-label", "Open details for Interactive Update Logs");
    newCard.innerHTML = `
        <div class="menuUpdateVersion">${UPDATE_DETAILS[3].version}</div>
        <div class="menuUpdateText">${UPDATE_DETAILS[3].body}</div>
    `;
    updates.appendChild(newCard);

    const detailMenu = document.createElement("div");
    detailMenu.id = "updateDetailMenu";
    detailMenu.setAttribute("aria-hidden", "true");
    detailMenu.innerHTML = `
        <div id="updateDetailPanel">
            <div id="updateDetailBackWrap">
                <button id="updateDetailBack" class="seedButton" type="button">← Back</button>
            </div>
            <div id="updateDetailVersion"></div>
            <h2 id="updateDetailTitle"></h2>
            <div id="updateDetailBody"></div>
        </div>
    `;
    document.body.appendChild(detailMenu);

    const backButton = detailMenu.querySelector("#updateDetailBack");
    const version = detailMenu.querySelector("#updateDetailVersion");
    const title = detailMenu.querySelector("#updateDetailTitle");
    const body = detailMenu.querySelector("#updateDetailBody");

    let detailOpen = false;

    const closeDetails = event => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!detailOpen) return;
        detailOpen = false;
        detailMenu.classList.remove("update-detail-ready");
        detailMenu.classList.remove("update-detail-opening");
        detailMenu.style.display = "none";
        detailMenu.setAttribute("aria-hidden", "true");
        if (menu && getComputedStyle(menu).display === "none") menu.style.display = "flex";
        syncMenuUpdates();
    };

    const openDetails = index => {
        const detail = UPDATE_DETAILS[index];
        if (!detail) return;
        detailOpen = true;
        version.textContent = detail.version;
        title.textContent = detail.title;
        body.textContent = detail.body;
        detailMenu.classList.remove("update-detail-ready");
        detailMenu.classList.remove("update-detail-opening");
        detailMenu.style.display = "flex";
        detailMenu.setAttribute("aria-hidden", "false");
        void detailMenu.offsetWidth;
        detailMenu.classList.add("update-detail-opening");
        window.setTimeout(() => {
            if (detailOpen) detailMenu.classList.add("update-detail-ready");
        }, 30);
    };

    const attachCard = card => {
        const index = Number(card.dataset.updateIndex);
        const activate = event => {
            if (event.type === "keydown" && event.code !== "Enter" && event.code !== "Space") return;
            event.preventDefault();
            event.stopPropagation();
            openDetails(index);
        };
        card.addEventListener("click", activate);
        card.addEventListener("keydown", activate);
    };

    updates.querySelectorAll(".menuUpdate").forEach(attachCard);
    backButton.addEventListener("click", closeDetails);
    backButton.addEventListener("pointerup", event => {
        event.preventDefault();
        event.stopPropagation();
        closeDetails(event);
    });
    detailMenu.addEventListener("click", event => {
        if (event.target === detailMenu) closeDetails(event);
    });
    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && detailOpen) closeDetails(event);
    });
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

    for (const version of VERSIONS) {
        const option = document.createElement("button");
        option.className = "gameVersionOption";
        option.type = "button";
        option.dataset.version = version;
        option.textContent = version;
        option.setAttribute("role", "menuitem");
        option.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            currentVersion = version;
            localStorage.setItem(VERSION_KEY, version);
            window.webminecraftVersion = version;
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
createVersionPicker();
setupSeedBackButton();
setupUpdateDetails();
watchSeedMenu();

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
