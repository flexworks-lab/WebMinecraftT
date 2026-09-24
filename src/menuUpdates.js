import "./chat.js";
import { clearWorld, getWorldSeed } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");
const VERSION_KEY = "webminecraft-game-version";
const VERSIONS = ["v1.0", "v1.1", "v1.2", "Beta"];

const UPDATE_DETAILS = [
    { version: "LATEST • World Saves", title: "Separate World Saves Fixed", body: "Each saved world now keeps its own block data. Creating or opening another world no longer overwrites the first world's saved blocks." },
    { version: "LATEST • Welcome", title: "New Player Welcome Screen", body: "New players now get a centered welcome screen with tabs explaining WebMinecraftT, setup, account information, and gameplay before they start playing." },
    { version: "LATEST • News", title: "New News Center", body: "The main menu news feed is now opened from a dedicated News button. All update notes are shown in one scrollable list, with details available for every update." },
    { version: "LATEST • Saved Worlds", title: "Saved Worlds", body: "Singleplayer now has a proper saved-world list with world names, seeds, details, creation dates, and Play controls." },
    { version: "LATEST • Drive", title: "Google Drive World Backup", body: "Saved worlds can be backed up to Google Drive and discovered again when loading the saved-world screen." },
    { version: "BETA • Multiplayer", title: "WebMinecraftT Beta", body: "WebMinecraftT is now in beta. Multiplayer servers, shared worlds, chat, private servers, mobile support, and more are being actively improved." },
    { version: "BETA • Private Servers", title: "Private Servers", body: "Private servers stay visible in the server list. Players can select a private server and enter its private code before joining." },
    { version: "BETA • Shared World", title: "Live World Changes", body: "Breaking and placing blocks can sync between players in the same multiplayer server so everyone can build together." },
    { version: "BETA • Chat", title: "Server Chat", body: "Multiplayer includes in-game chat with join messages so players can talk while they play together." },
    { version: "v1.2 • Server Making", title: "Make Your Own Server", body: "Players can enter a new server name when joining to create their own multiplayer server. The first player becomes the server owner." },
    { version: "v1.1 • World Seeds", title: "World Seeds", body: "World generation uses the world seed for reproducible terrain, caves, biomes, trees, water, and world spawning." },
    { version: "v1.1 • Seed Links", title: "Shareable Seed Links", body: "Copy a world link with the seed attached so another player can open the same generated world." },
    { version: "v1.1 • Settings", title: "Graphics Settings", body: "Graphics, shadow quality, lighting quality, brightness, and render scale can be adjusted from the settings screen." },
    { version: "v1.0 • Mobile", title: "Mobile Mode", body: "Mobile Mode provides touch-friendly controls and a layout designed for smaller screens." }
];

function addStyles() {
    if (document.getElementById("newsButtonStyles")) return;
    const style = document.createElement("style");
    style.id = "newsButtonStyles";
    style.textContent = `
<<<<<<< HEAD
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
<<<<<<< HEAD
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
=======
            transition: transform .16s ease, filter .16s ease, background .16s ease;
        }
        .menuUpdate:hover { transform: translateX(4px); filter: brightness(1.08); background:#4a4a4a; }
        .menuUpdate:focus-visible { outline:2px solid #fff; outline-offset:1px; }
>>>>>>> 8cf521c0847471e01f70dbe635b93219a24b727e

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
<<<<<<< HEAD
            #seedMenu.seed-menu-opening, #seedMenu.seed-menu-opening #seedBackWrap,
            #seedMenu.seed-menu-opening #seedTitle, #seedMenu.seed-menu-opening #seedSubtitle,
            #seedMenu.seed-menu-opening #seedInput, #seedMenu.seed-menu-opening #seedActions,
            #seedMenu.seed-menu-opening #seedLinkStatus,
            #updateDetailMenu.update-detail-opening,
            #updateDetailMenu.update-detail-ready #updateDetailBackWrap,
            #updateDetailMenu.update-detail-ready #updateDetailVersion,
            #updateDetailMenu.update-detail-ready #updateDetailTitle,
            #updateDetailMenu.update-detail-ready #updateDetailBody { animation: none !important; opacity: 1 !important; }
=======
            #seedPanel, #seedBackWrap, #seedTitle, #seedSubtitle,
            #seedInput, #seedActions, #seedLinkStatus, #updateDetail.open { animation: none !important; opacity: 1 !important; }
>>>>>>> 8cf521c0847471e01f70dbe635b93219a24b727e
            *, *::before, *::after { scroll-behavior: auto !important; }
        }
=======
        #menuUpdates{display:none!important}
        #newsButton{margin-top:8px}
        #newsCenter{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.68);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);z-index:240;padding:20px;color:#fff}
        #newsPanel{width:min(760px,94vw);max-height:min(760px,90vh);display:flex;flex-direction:column;background:#242424;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:7px 7px 0 rgba(0,0,0,.58)}
        #newsHeader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 18px;background:#303030;border-bottom:2px solid #111}
        #newsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:25px;text-shadow:2px 2px 0 #000}
        #newsSubtitle{margin:3px 0 0;color:#999;font-size:11px}
        #newsClose{min-width:78px}
        #newsList{padding:16px;overflow:auto}
        .newsItem{display:block;width:100%;margin:0 0 10px;padding:14px;text-align:left;background:#3b3b3b;border:2px solid #171717;border-top-color:#777;border-left-color:#777;color:#fff;cursor:pointer}
        .newsItem:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .newsItem:last-child{margin-bottom:0}
        .newsItemVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:1px 1px 0 #111}
        .newsItemTitle{margin-top:5px;font-family:"MinecraftFont",monospace;font-size:16px;text-shadow:2px 2px 0 #111}
        .newsItemBody{margin-top:6px;color:#cfcfcf;font-size:12px;line-height:1.45}
        #newsDetails{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.74);z-index:250;padding:20px}
        #newsDetailsPanel{width:min(650px,94vw);max-height:85vh;overflow:auto;padding:28px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:7px 7px 0 rgba(0,0,0,.58)}
        #newsDetailsVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:12px;margin-bottom:10px}
        #newsDetailsTitle{margin:0 0 14px;font-family:"MinecraftFont",monospace;font-size:30px;text-shadow:3px 3px 0 #000}
        #newsDetailsBody{color:#d6d6d6;font-size:14px;line-height:1.65;margin-bottom:22px}
        @media(max-width:600px){#newsHeader{padding:13px}.newsItem{padding:12px}#newsDetailsPanel{padding:22px}#newsDetailsTitle{font-size:25px}}
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
    `;
    document.head.appendChild(style);
}

<<<<<<< HEAD
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

=======
function createNewsUi() {
    if (!updates || !menu || document.getElementById("newsButton")) return;
    addStyles();
    const buttons = document.getElementById("menuButtons");
    if (!buttons) return;
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
    const button = document.createElement("button");
    button.id = "newsButton";
    button.className = "menuButton";
    button.type = "button";
<<<<<<< HEAD
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
=======
    button.textContent = "News";
    buttons.insertBefore(button, document.getElementById("menuSettingsButton"));
    const center = document.createElement("div");
    center.id = "newsCenter";
    center.setAttribute("aria-hidden", "true");
    center.innerHTML = `
        <div id="newsPanel" role="dialog" aria-modal="true" aria-labelledby="newsTitle">
            <header id="newsHeader"><div><h2 id="newsTitle">News & Updates</h2><p id="newsSubtitle">The latest WebMinecraftT changes</p></div><button id="newsClose" class="menuButton" type="button">Close</button></header>
            <div id="newsList"></div>
        </div>`;
    document.body.appendChild(center);
    const details = document.createElement("div");
    details.id = "newsDetails";
    details.setAttribute("aria-hidden", "true");
    details.innerHTML = `<div id="newsDetailsPanel" role="dialog" aria-modal="true" aria-labelledby="newsDetailsTitle"><div id="newsDetailsVersion"></div><h2 id="newsDetailsTitle"></h2><div id="newsDetailsBody"></div><button id="newsDetailsBack" class="menuButton" type="button">← Back</button></div>`;
    document.body.appendChild(details);
    const list = center.querySelector("#newsList");
    const detailVersion = details.querySelector("#newsDetailsVersion");
    const detailTitle = details.querySelector("#newsDetailsTitle");
    const detailBody = details.querySelector("#newsDetailsBody");
    UPDATE_DETAILS.forEach((item,index)=>{
        const card=document.createElement("button"); card.className="newsItem"; card.type="button";
        card.innerHTML=`<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(item.body)}</div>`;
        card.addEventListener("click",event=>{event.stopPropagation();detailVersion.textContent=item.version;detailTitle.textContent=item.title;detailBody.textContent=item.body;details.style.display="flex";details.setAttribute("aria-hidden","false");});
        list.appendChild(card);
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
    });
    const closeNews=()=>{details.style.display="none";details.setAttribute("aria-hidden","true");center.style.display="none";center.setAttribute("aria-hidden","true");};
    const openNews=event=>{event?.preventDefault();event?.stopPropagation();center.style.display="flex";center.setAttribute("aria-hidden","false");details.style.display="none";details.setAttribute("aria-hidden","true");center.querySelector("#newsClose")?.focus();};
    button.addEventListener("click",openNews);
    center.querySelector("#newsClose").addEventListener("click",closeNews);
    details.querySelector("#newsDetailsBack").addEventListener("click",()=>{details.style.display="none";details.setAttribute("aria-hidden","true");});
    center.addEventListener("click",event=>{if(event.target===center)closeNews();});
    details.addEventListener("click",event=>{if(event.target===details)details.style.display="none";});
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(details.style.display==="flex"){details.style.display="none";details.setAttribute("aria-hidden","true");}else if(center.style.display==="flex")closeNews();},true);
}

<<<<<<< HEAD
injectMenuAnimations();
syncMenuUpdates();
createUpdateDetail();
createVersionPicker();
=======
function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

function setupPauseMenu(){
    if(document.getElementById("pauseMenu"))return;
    const style=document.createElement("style"); style.id="pauseMenuStyles";
    style.textContent=`#pauseMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);color:#fff;z-index:500;pointer-events:auto}#pausePanel{width:min(420px,90vw);padding:30px 28px 26px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);text-align:center}#pauseTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:34px;text-shadow:3px 3px 0 #000}#pauseSeed{min-height:20px;margin:0 0 20px;color:#999;font:12px Arial,sans-serif;overflow-wrap:anywhere}#pauseButtons{display:grid;gap:9px}.pauseButton{width:100%;min-height:46px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}#pauseResume{background:linear-gradient(#6d8d4e,#526f3c)}#pauseReturn{background:linear-gradient(#5d5d5d,#444)}`;
    document.head.appendChild(style);
    const overlay=document.createElement("div"); overlay.id="pauseMenu"; overlay.setAttribute("aria-hidden","true");
    overlay.innerHTML=`<div id="pausePanel"><h2 id="pauseTitle">Game Paused</h2><div id="pauseSeed"></div><div id="pauseButtons"><button id="pauseResume" class="pauseButton" type="button">Resume Game</button><button id="pauseSettings" class="pauseButton" type="button">Settings</button><button id="pauseMobile" class="pauseButton" type="button">Mobile Mode</button><button id="pauseReturn" class="pauseButton" type="button">Return to Main Menu</button></div></div>`;
    document.body.appendChild(overlay);
    const isGameRunning=()=>Boolean(menu&&menu.style.display==="none"); let paused=false;
    const close=event=>{event?.preventDefault();paused=false;overlay.style.display="none";overlay.setAttribute("aria-hidden","true");if(isGameRunning())document.body.requestPointerLock?.();};
    const open=event=>{event?.preventDefault();event?.stopPropagation();if(!isGameRunning())return;paused=true;overlay.querySelector("#pauseSeed").textContent=`Seed: ${getWorldSeed()}`;overlay.style.display="flex";overlay.setAttribute("aria-hidden","false");document.exitPointerLock?.();overlay.querySelector("#pauseResume").focus();};
    overlay.querySelector("#pauseResume").addEventListener("click",close);
    overlay.querySelector("#pauseSettings").addEventListener("click",event=>{event.preventDefault();overlay.style.display="none";overlay.setAttribute("aria-hidden","true");document.getElementById("settingsMenu")?.style.setProperty("display","flex");document.exitPointerLock?.();paused=false;});
    overlay.querySelector("#pauseMobile").addEventListener("click",()=>{const url=new URL(window.location.href);const enabled=url.searchParams.get("mobile")==="1"||url.searchParams.get("mode")==="mobile";if(enabled){url.searchParams.delete("mobile");url.searchParams.delete("mode");}else{url.searchParams.set("mobile","1");url.searchParams.delete("mode");}window.location.href=url.toString();});
    overlay.querySelector("#pauseReturn").addEventListener("click",()=>window.location.reload());
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(paused)close(event);else if(isGameRunning())open(event);},true);
    document.getElementById("settingsButton")?.addEventListener("pointerdown",event=>{if(!isGameRunning())return;event.preventDefault();event.stopImmediatePropagation();open(event);},true);
    window.webminecraftPause={open,close,isOpen:()=>paused};
}

function setupSeedBackButton(){
    const button=document.getElementById("backSeedButton"); if(!button||button.dataset.backHookInstalled)return; button.dataset.backHookInstalled="1";
    button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();if(seedMenu){seedMenu.style.display="none";seedMenu.setAttribute("aria-hidden","true");}if(menu)menu.style.display="flex";window.setTimeout(()=>window.location.reload(),80);});
}

function createVersionPicker(){
    if(document.getElementById("gameVersionPicker"))return;
    const style=document.createElement("style");style.id="gameVersionStyles";
    style.textContent=`#gameVersionButton{position:fixed;right:10px;bottom:8px;min-width:88px;height:34px;padding:5px 10px;border:2px solid #111;border-top-color:#9a9a9a;border-left-color:#9a9a9a;background:linear-gradient(#666,#4d4d4d);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;cursor:pointer;z-index:97;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),0 2px 0 rgba(0,0,0,.7)}#gameVersionPicker{position:fixed;right:10px;bottom:48px;width:160px;padding:6px;background:#191919;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.55);z-index:97;display:none}.gameVersionOption{display:block;width:100%;min-height:34px;margin:3px 0;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#3d3d3d;color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-align:left;padding:7px 9px;cursor:pointer;text-shadow:2px 2px 0 #111}.gameVersionOption.active{background:#5e5e5e}`;
    document.head.appendChild(style); const button=document.createElement("button");button.id="gameVersionButton";button.type="button";const picker=document.createElement("div");picker.id="gameVersionPicker";let current=VERSIONS.includes(localStorage.getItem(VERSION_KEY))?localStorage.getItem(VERSION_KEY):VERSIONS[0];
    VERSIONS.forEach(version=>{const option=document.createElement("button");option.className="gameVersionOption";option.type="button";option.dataset.version=version;option.textContent=version;option.addEventListener("click",()=>{current=version;localStorage.setItem(VERSION_KEY,version);window.webminecraftVersion=version;refresh();picker.style.display="none";});picker.appendChild(option);});
    const refresh=()=>{button.textContent=current;picker.querySelectorAll(".gameVersionOption").forEach(option=>option.classList.toggle("active",option.dataset.version===current));};
    button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();picker.style.display=picker.style.display==="block"?"none":"block";});
    document.addEventListener("click",event=>{if(event.target!==button&&!picker.contains(event.target))picker.style.display="none";});
    document.addEventListener("keydown",event=>{if(event.code==="Escape")picker.style.display="none";});
    document.body.append(button,picker);window.webminecraftVersion=current;refresh();
    if(menu){const observer=new MutationObserver(()=>{const visible=getComputedStyle(menu).display!=="none";button.style.display=visible?"block":"none";if(!visible)picker.style.display="none";});observer.observe(menu,{attributes:true,attributeFilter:["style","class"]});}
}

addStyles();
createNewsUi();
setupPauseMenu();
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
setupSeedBackButton();
createVersionPicker();

if(seedMenu){let cleared=false;const observer=new MutationObserver(()=>{const open=getComputedStyle(seedMenu).display!=="none";if(open&&!cleared){clearWorld();cleared=true;}else if(!open)cleared=false;});observer.observe(seedMenu,{attributes:true,attributeFilter:["style","class"]});}
