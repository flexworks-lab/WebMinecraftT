import "./chat.js";
import { clearWorld, getWorldSeed } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");
const VERSION_KEY = "webminecraft-game-version";
const VERSIONS = ["v1.0", "v1.1", "v1.2", "Beta"];
const NEWS_SEEN_KEY = "webminecraft-news-seen-v2";

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
        #newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:118px !important;margin:0 !important;z-index:98 !important;display:block !important;pointer-events:auto !important;border-radius:0 !important;background:linear-gradient(#737373,#565656) !important;border:2px solid #1b1b1b !important;border-top-color:#a4a4a4 !important;border-left-color:#a4a4a4 !important;outline:none !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.14),inset -2px -3px 0 rgba(0,0,0,.3),0 4px 0 rgba(0,0,0,.62) !important;transition:none !important;animation:none !important}
#newsButton:hover,#newsButton:active{filter:none !important;transform:none !important}
        #newsButton.newsHasUnread::after{content:"";position:absolute;top:7px;right:7px;width:10px;height:10px;border-radius:50%;background:#e33;border:2px solid #4b0000;box-shadow:0 0 0 1px rgba(0,0,0,.65),0 0 8px rgba(255,40,40,.55)}
        #newsCenter{position:fixed;inset:0;display:none;background:linear-gradient(180deg,#1b1b1b,#111);z-index:240;color:#fff;overflow:hidden}
        #newsPanel{position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;display:grid;grid-template-columns:minmax(260px,31vw) minmax(0,1fr);grid-template-rows:100%;background:#1a1a1a;overflow:hidden}
        #newsSidebar{min-width:0;min-height:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#242424,#191919);border-right:2px solid #0b0b0b}
        #newsHeader{flex:0 0 auto;padding:28px 24px 22px;background:linear-gradient(180deg,#343434,#292929);border-bottom:2px solid #0f0f0f}
        #newsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(26px,2.5vw,38px);text-shadow:3px 3px 0 #000}
        #newsSubtitle{margin:7px 0 0;color:#aaa;font-size:13px;line-height:1.4}
        #newsList{flex:1 1 auto;min-height:0;padding:14px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:#6f6f6f #151515}
        #newsList::-webkit-scrollbar{width:13px}
        #newsList::-webkit-scrollbar-track{background:#151515}
        #newsList::-webkit-scrollbar-thumb{background:#686868;border:2px solid #151515}
        #newsList::-webkit-scrollbar-thumb:hover{background:#818181}
        .newsItem{display:block;width:100%;margin:0 0 10px;padding:15px;text-align:left;background:#3b3b3b;border:2px solid #171717;border-top-color:#777;border-left-color:#777;color:#fff;cursor:pointer}
        .newsItem:hover,.newsItem:focus-visible{filter:brightness(1.1);outline:2px solid rgba(255,255,255,.65);outline-offset:1px}
        .newsItem:last-child{margin-bottom:0}
        .newsItemVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:1px 1px 0 #111}
        .newsItemTitle{margin-top:5px;font-family:"MinecraftFont",monospace;font-size:16px;text-shadow:2px 2px 0 #111}
        .newsItemBody{margin-top:6px;color:#cfcfcf;font-size:12px;line-height:1.45}
<<<<<<< HEAD
        #newsDetails{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.74);z-index:250;padding:20px}
        #newsDetailsPanel{width:min(650px,94vw);max-height:85vh;overflow:auto;padding:28px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:7px 7px 0 rgba(0,0,0,.58)}
        #newsDetailsVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:12px;margin-bottom:10px}
        #newsDetailsTitle{margin:0 0 14px;font-family:"MinecraftFont",monospace;font-size:30px;text-shadow:3px 3px 0 #000}
        #newsDetailsBody{color:#d6d6d6;font-size:14px;line-height:1.65;margin-bottom:22px}
        @media(max-width:600px){#newsHeader{padding:13px}.newsItem{padding:12px}#newsDetailsPanel{padding:22px}#newsDetailsTitle{font-size:25px}}
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
=======
        #newsClose{width:calc(100% - 28px);margin:14px 14px 18px;min-height:44px;flex:0 0 auto}
        #newsReading{min-width:0;min-height:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#2b2b2b,#202020)}
        #newsReadingHeader{flex:0 0 auto;padding:26px 34px 20px;border-bottom:2px solid #111;background:#2e2e2e}
        #newsReadingVersion{margin-bottom:8px;color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:14px;text-shadow:2px 2px 0 #111}
        #newsReadingTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(28px,3vw,44px);line-height:1.15;text-shadow:3px 3px 0 #000}
        #newsReadingBody{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:28px 34px 60px;color:#d9d9d9;font-size:16px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin;scrollbar-color:#777 #171717}
        #newsReadingBody::-webkit-scrollbar{width:14px}
        #newsReadingBody::-webkit-scrollbar-track{background:#171717}
        #newsReadingBody::-webkit-scrollbar-thumb{background:#707070;border:2px solid #171717;border-radius:7px}
        #newsReadingBody::-webkit-scrollbar-thumb:hover{background:#898989}
        @media(max-width:700px){
            #newsButton{left:12px !important;bottom:18px !important;width:calc(50vw - 18px) !important}
            #newsPanel{grid-template-columns:1fr;grid-template-rows:44% 56%}
            #newsSidebar{border-right:0;border-bottom:2px solid #0b0b0b}
            #newsHeader{padding:16px 16px 12px}
            #newsList{padding:10px}
            .newsItem{padding:12px;margin-bottom:8px}
            .newsItemBody{font-size:11px}
            #newsClose{margin:8px 12px 10px;width:calc(100% - 24px)}
            #newsReadingHeader{padding:18px 18px 14px}
            #newsReadingBody{padding:18px 18px 34px;font-size:14px;line-height:1.6}
        }
>>>>>>> 230c89e8ed1d4d1cf25173e2e4d1a680b101e68c
    `;
    document.head.appendChild(style);
}

<<<<<<< HEAD
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
=======
function setNewsUnread(unread){
    const button=document.getElementById("newsButton");
    if(button) button.classList.toggle("newsHasUnread",unread);
    try{localStorage.setItem(NEWS_SEEN_KEY,unread?"0":"1")}catch{}
}

function hasNewsBeenSeen(){
    try{return localStorage.getItem(NEWS_SEEN_KEY)==="1"}catch{return false}
}

function createNewsUi(){
    if(document.getElementById("newsButton"))return;
    addStyles();
    const button=document.createElement("button");
    button.id="newsButton";
    button.className="menuButton";
    button.type="button";
    button.textContent="News";
    document.body.appendChild(button);
    const center=document.createElement("div");
    center.id="newsCenter";
    center.setAttribute("aria-hidden","true");
    center.innerHTML=`
>>>>>>> 230c89e8ed1d4d1cf25173e2e4d1a680b101e68c
        <div id="newsPanel" role="dialog" aria-modal="true" aria-labelledby="newsTitle">
            <aside id="newsSidebar">
                <header id="newsHeader"><h2 id="newsTitle">News & Updates</h2><p id="newsSubtitle">The latest WebMinecraftT changes</p></header>
                <div id="newsList"></div>
                <button id="newsClose" class="menuButton" type="button">Back to Main Menu</button>
            </aside>
            <section id="newsReading">
                <header id="newsReadingHeader"><div id="newsReadingVersion">Open a patch note</div><h2 id="newsReadingTitle">Open a patch note</h2></header>
                <div id="newsReadingBody">Select a patch note from the list to view its full details.</div>
            </section>
        </div>`;
    document.body.appendChild(center);
    const list=center.querySelector("#newsList");
    const detailVersion=center.querySelector("#newsReadingVersion");
    const detailTitle=center.querySelector("#newsReadingTitle");
    const detailBody=center.querySelector("#newsReadingBody");
    const showItem=item=>{detailVersion.textContent=item.version;detailTitle.textContent=item.title;detailBody.textContent=item.body;};
    UPDATE_DETAILS.forEach((item,index)=>{
        const card=document.createElement("button");card.className="newsItem";card.type="button";
        card.innerHTML=`<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(item.body)}</div>`;
        card.addEventListener("click",event=>{event.stopPropagation();showItem(item);});
        list.appendChild(card);
<<<<<<< HEAD
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
=======
        if(index===0)showItem(item);
>>>>>>> 230c89e8ed1d4d1cf25173e2e4d1a680b101e68c
    });
    const closeNews=()=>{center.style.display="none";center.setAttribute("aria-hidden","true");};
    const openNews=event=>{event?.preventDefault();event?.stopPropagation();center.style.display="block";center.setAttribute("aria-hidden","false");setNewsUnread(false);list.scrollTop=0;};
    button.addEventListener("click",openNews);
    center.querySelector("#newsClose").addEventListener("click",closeNews);
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(center.style.display==="block")closeNews();},true);
    setNewsUnread(!hasNewsBeenSeen());
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
    style.textContent=[
        "#pauseMenu{position:fixed;inset:0;display:none;background:rgba(0,0,0,.38);color:#fff;z-index:2000000!important;pointer-events:auto;font-family:Arial,sans-serif}",
        "#pauseMenu.pauseOpen{display:block}",
        "#pauseShell{position:absolute;inset:0;display:grid;grid-template-columns:minmax(460px,1fr) minmax(300px,34vw);background:linear-gradient(180deg,rgba(25,29,26,.48),rgba(14,17,15,.58))}",
        "#pauseMain{position:relative;min-width:0;display:flex;flex-direction:column;align-items:center;padding:clamp(34px,7vh,72px) 7vw 28px;box-sizing:border-box;justify-content:flex-start}",
        "#pauseLogo{display:block;width:min(500px,76%);height:auto;max-height:150px;object-fit:contain;image-rendering:auto;margin:0 0 clamp(22px,4vh,38px);filter:drop-shadow(4px 5px 0 rgba(0,0,0,.62))}",
        "#pauseLogoSub{margin-top:-18px;margin-bottom:clamp(34px,7vh,62px);color:#a9cf87;font:800 11px Arial,sans-serif;letter-spacing:4px;text-shadow:0 2px 0 #111}",
        "#pauseNav{width:min(390px,100%);margin-left:-7vw;margin-top:clamp(88px,14vh,150px);display:grid;gap:6px}",
        ".pauseButton{width:100%;min-height:48px;padding:11px 16px;border:2px solid #111;border-top-color:#919791;border-left-color:#919791;background:linear-gradient(#6b6d6b,#505451);color:#fff;font-family:Arial Black,Arial,sans-serif;font-size:13px;text-align:left;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:inset 2px 2px 0 rgba(255,255,255,.08),inset -3px -3px 0 rgba(0,0,0,.28),0 4px 0 #111}",
        ".pauseButton:hover{filter:brightness(1.08)}.pauseButton:active{transform:translateY(2px)}",
        "#pauseResume{background:linear-gradient(#6f9a4d,#537539);font-size:14px}",
        "#pauseNavSpacer{display:none}#pauseQuit{margin-top:2px;background:linear-gradient(#5c5c5c,#434343)}",
        "#pauseSide{min-width:0;min-height:0;padding:clamp(28px,5vh,50px) clamp(22px,3vw,42px);box-sizing:border-box;background:linear-gradient(180deg,#252a26,#1a1f1b);border-left:2px solid #111;box-shadow:inset 2px 0 0 rgba(255,255,255,.04);overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:#687166 #141814}",
        "#pauseSide::-webkit-scrollbar{width:12px}#pauseSide::-webkit-scrollbar-track{background:#141814}#pauseSide::-webkit-scrollbar-thumb{background:#687166;border:2px solid #141814}#pauseSide::-webkit-scrollbar-thumb:hover{background:#818b80}",
        "#pauseSideHeader{padding-bottom:16px;border-bottom:2px solid #101310}#pauseSideTitle{margin:0;font-family:Arial Black,Arial,sans-serif;font-size:24px;text-shadow:3px 3px 0 #111}#pauseSideSubtitle{margin:7px 0 0;color:#9ea79f;font-size:11px;line-height:1.45}",
        ".pauseInfoCard{margin-top:14px;padding:13px;background:#202520;border:2px solid #101310;border-top-color:#687166;border-left-color:#687166;box-shadow:3px 3px 0 rgba(0,0,0,.3)}.pauseInfoLabel{color:#8f9b90;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px}.pauseInfoValue{margin-top:5px;color:#fff;font-family:Arial Black,Arial,sans-serif;font-size:14px;line-height:1.4;overflow-wrap:anywhere;text-shadow:1px 1px 0 #111}.pauseMeta{margin-top:8px;color:#afb7b0;font-size:10px;line-height:1.6}",
        "#pauseMembersWrap{margin-top:18px;min-height:0;display:flex;flex-direction:column}#pauseMembersHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}#pauseMembersTitle{margin:0;font-family:Arial Black,Arial,sans-serif;font-size:15px;text-shadow:2px 2px 0 #111}#pauseMemberCount{padding:4px 7px;background:#303730;border:1px solid #525d51;color:#b9c9b1;font:bold 9px Arial,sans-serif}",
        "#pauseMembers{min-height:0;max-height:34vh;overflow-y:auto;display:grid;gap:7px;padding-right:3px;scrollbar-width:thin;scrollbar-color:#687166 #141814}.pauseMember{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:9px 10px;background:#202520;border:1px solid #3d463e}.pauseMemberName{min-width:0;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pauseMemberRole{display:block;margin-top:2px;color:#89938a;font-size:9px}",
        "#pauseServerControls{display:none;margin-top:16px;padding-top:14px;border-top:2px solid #101310}#pauseServerControls.visible{display:block}#pauseServerControlsHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}#pauseServerControlsTitle{margin:0;font-family:Arial Black,Arial,sans-serif;font-size:15px;text-shadow:2px 2px 0 #111}.pauseRoleBadge{padding:4px 7px;background:#35452f;border:1px solid #617454;color:#b9d79e;font:bold 9px Arial,sans-serif}.pauseControlBox{padding:10px;background:#202520;border:1px solid #3d463e}.pauseControlLabel{display:block;margin:0 0 5px;color:#929d93;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}.pauseControlSelect{box-sizing:border-box;width:100%;height:34px;padding:6px 8px;background:#161a17;color:#fff;border:2px solid #111;border-top-color:#6f786e;border-left-color:#6f786e;font:10px Arial,sans-serif;outline:none;cursor:pointer}.pauseControlGrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:7px}.pauseControlButton{min-height:34px;padding:6px 7px;background:linear-gradient(#5b625b,#454a46);color:#fff;border:2px solid #111;border-top-color:#858d83;border-left-color:#858d83;cursor:pointer;font:700 9px Arial,sans-serif;text-shadow:1px 1px 0 #111}.pauseControlButton:hover{filter:brightness(1.08)}.pauseControlButton.warn{background:linear-gradient(#70453f,#5a3834)}.pauseControlButton.good{background:linear-gradient(#618047,#4d6839)}.pauseControlStatus{min-height:15px;margin-top:7px;color:#a8ca8e;font-size:9px;line-height:1.35}",
        ".pauseInvite{min-width:64px;padding:6px 8px;background:linear-gradient(#596958,#465346);color:#fff;border:1px solid #111;border-top-color:#7f8d7d;border-left-color:#7f8d7d;font:700 9px Arial,sans-serif;cursor:pointer}.pauseInvite:hover{filter:brightness(1.08)}#pauseInviteAll{width:100%;margin-top:9px;min-height:40px;text-align:center;background:linear-gradient(#6f9253,#54743d)}#pauseInviteStatus{min-height:16px;margin-top:7px;color:#9fbd8d;font-size:10px;line-height:1.35}#pauseFooter{position:absolute;right:18px;bottom:13px;color:#667067;font-size:9px}",
        "@media(max-width:820px){#pauseShell{grid-template-columns:1fr;overflow-y:auto}#pauseMain{min-height:68vh;padding:26px 7vw 18px}#pauseLogo{margin-bottom:26px}#pauseNav{margin-left:0;width:min(400px,92vw)}#pauseSide{border-left:0;border-top:2px solid #111;padding:22px 7vw 34px}#pauseMembers{max-height:none}#pauseFooter{position:static;margin-top:8px;text-align:center}}"
    ].join("");
    document.head.appendChild(style);
    const overlay=document.createElement("div"); overlay.id="pauseMenu"; overlay.setAttribute("aria-hidden","true");
    overlay.innerHTML=[
        "<div id=\"pauseShell\">",
        "<main id=\"pauseMain\"><img id=\"pauseLogo\" src=\"" + import.meta.env.BASE_URL + "WEBMINECRAFT-9-12-2026.png\" alt=\"WebMinecraftT\"><div id=\"pauseLogoSub\">WEB EDITION</div><div id=\"pauseNav\">",
        "<button id=\"pauseResume\" class=\"pauseButton\" type=\"button\">Resume Game</button>",
        "<button id=\"pauseSettings\" class=\"pauseButton\" type=\"button\">Settings</button>",
        "<div id=\"pauseNavSpacer\"></div><button id=\"pauseQuit\" class=\"pauseButton\" type=\"button\">Save &amp; Quit</button></div><div id=\"pauseFooter\">WebMinecraftT</div></main>",
        "<aside id=\"pauseSide\"><header id=\"pauseSideHeader\"><h2 id=\"pauseSideTitle\">World</h2><p id=\"pauseSideSubtitle\">Current world and multiplayer information</p></header>",
        "<div id=\"pauseWorldInfo\"></div><section id=\"pauseMembersWrap\"><div id=\"pauseMembersHead\"><h3 id=\"pauseMembersTitle\">Players</h3><span id=\"pauseMemberCount\">1</span></div>",
        "<div id=\"pauseMembers\"></div><button id=\"pauseInviteAll\" class=\"pauseInvite\" type=\"button\">Invite Players</button><div id=\"pauseInviteStatus\" aria-live=\"polite\"></div></section>"+
        "<section id=\"pauseServerControls\"><div id=\"pauseServerControlsHead\"><h3 id=\"pauseServerControlsTitle\">Server Controls</h3><span class=\"pauseRoleBadge\">OP</span></div><div class=\"pauseControlBox\"><label class=\"pauseControlLabel\" for=\"pauseControlTarget\">Player</label><select id=\"pauseControlTarget\" class=\"pauseControlSelect\"></select><div class=\"pauseControlLabel\" style=\"margin-top:9px\">Role</div><div class=\"pauseControlGrid\"><button class=\"pauseControlButton good\" type=\"button\" data-role=\"visitor\">Visitor</button><button class=\"pauseControlButton good\" type=\"button\" data-role=\"member\">Member</button><button class=\"pauseControlButton good\" type=\"button\" data-role=\"operator\">Operator</button></div><div class=\"pauseControlGrid\"><button class=\"pauseControlButton\" type=\"button\" data-action=\"gamemode-survival\">Survival</button><button class=\"pauseControlButton\" type=\"button\" data-action=\"gamemode-creative\">Creative</button><button class=\"pauseControlButton\" type=\"button\" data-action=\"teleport\">Teleport to Me</button><button class=\"pauseControlButton\" type=\"button\" data-action=\"give\">Give</button><button class=\"pauseControlButton warn\" type=\"button\" data-action=\"kick\">Kick</button><button class=\"pauseControlButton warn\" type=\"button\" data-action=\"ban\">Ban</button></div><div id=\"pauseControlStatus\" class=\"pauseControlStatus\" aria-live=\"polite\"></div></div></section></aside></div>"
    ].join("");
    document.body.appendChild(overlay);
    const isGameRunning=()=>Boolean(menu&&menu.style.display==="none"); let paused=false;
    const getRoomInfo=()=>{const mp=window.__webminecraftMultiplayerRoomInfo||{};return {active:Boolean(window.__webminecraftMultiplayerActive),room:String(mp.room||window.__webminecraftMultiplayerRoom||""),server:String(mp.serverName||window.__webminecraftMultiplayerServerName||""),private:Boolean(mp.private),mode:String(window.__webminecraftMultiplayerMode||"survival"),seed:getWorldSeed()};};
    const getMembers=()=>{const localName=localStorage.getItem("webminecraft-player-name")||"Player";const remotes=typeof window.__webminecraftGetRemotePlayers==="function"?window.__webminecraftGetRemotePlayers():new Map();const localRole=String(window.__webminecraftMultiplayerRole||"member");const members=[{id:"local",name:localName,role:localRole}];if(remotes instanceof Map){for(const [id,player] of remotes)members.push({id:String(id),name:String(player?.name||"Player"),role:String(player?.role||"member").toLowerCase()});}return members;};
    const makeInvite=()=>{window.__webminecraftOpenGameInvitePicker?.();};
    const renderSide=()=>{const info=getRoomInfo();const members=getMembers();const worldInfo=overlay.querySelector("#pauseWorldInfo"),membersEl=overlay.querySelector("#pauseMembers"),count=overlay.querySelector("#pauseMemberCount"),title=overlay.querySelector("#pauseSideTitle"),subtitle=overlay.querySelector("#pauseSideSubtitle");title.textContent=info.active?(info.room||"Multiplayer World"):"World";subtitle.textContent=info.active?"Server · "+(info.server||"WebMinecraft server"):"Singleplayer world";worldInfo.innerHTML="<div class=\"pauseInfoCard\"><div class=\"pauseInfoLabel\">Game Mode</div><div class=\"pauseInfoValue\">"+(info.mode==="creative"?"Creative":"Survival")+"</div><div class=\"pauseMeta\">Seed: "+escapeHtml(info.seed)+"</div></div>"+(info.active?"<div class=\"pauseInfoCard\"><div class=\"pauseInfoLabel\">Server</div><div class=\"pauseInfoValue\">"+escapeHtml(info.server||"WebMinecraft Server")+"</div><div class=\"pauseMeta\">"+(info.private?"Private room":"Public room")+"</div></div>":"");count.textContent=String(members.length);membersEl.innerHTML="";for(const member of members){const row=document.createElement("div");row.className="pauseMember";row.innerHTML="<div><div class=\"pauseMemberName\">"+escapeHtml(member.name)+"</div><span class=\"pauseMemberRole\">"+escapeHtml(member.role)+"</span></div>";if(member.id!=="local"){const invite=document.createElement("button");invite.type="button";invite.className="pauseInvite";invite.textContent="Invite";invite.addEventListener("click",makeInvite);row.appendChild(invite);}membersEl.appendChild(row);}renderServerControls(members);};
    const renderServerControls=members=>{const controls=overlay.querySelector("#pauseServerControls"),select=overlay.querySelector("#pauseControlTarget");if(!controls||!select)return;const host=Boolean(window.__webminecraftMultiplayerIsHost);controls.classList.toggle("visible",host);if(!host)return;const current=select.value;select.innerHTML="";for(const member of members.filter(item=>item.id!=="local")){const option=document.createElement("option");option.value=member.id;option.textContent=member.name+" · "+String(member.role||"member").toUpperCase();select.appendChild(option);}if(current&&[...select.options].some(option=>option.value===current))select.value=current;};
    const selectedControlMember=()=>{const select=overlay.querySelector("#pauseControlTarget");return getMembers().find(member=>member.id===select?.value)||null;};
    const close=event=>{event?.preventDefault();event?.stopPropagation();paused=false;overlay.classList.remove("pauseOpen");overlay.setAttribute("aria-hidden","true");if(isGameRunning()&&!window.__webminecraftHasOpenMenu?.())document.body.requestPointerLock?.();};
    const open=event=>{event?.preventDefault();event?.stopPropagation();if(!isGameRunning())return;paused=true;renderSide();overlay.classList.add("pauseOpen");overlay.setAttribute("aria-hidden","false");document.exitPointerLock?.();overlay.querySelector("#pauseResume").focus();};
    overlay.querySelector("#pauseResume").addEventListener("click",close);
    overlay.querySelector("#pauseSettings").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();overlay.classList.remove("pauseOpen");overlay.setAttribute("aria-hidden","true");paused=false;if(settingsMenu){settingsMenu.style.display="flex";document.exitPointerLock?.();}});
    overlay.querySelector("#pauseInviteAll").addEventListener("click",makeInvite);
    overlay.querySelector("#pauseQuit").addEventListener("click",()=>{const button=overlay.querySelector("#pauseQuit");const saveAndReturn=async()=>{if(button){button.disabled=true;button.textContent="Saving...";}try{if(window.__webminecraftMultiplayerActive===true){await window.__webminecraftSaveMultiplayerAndQuit?.(3000);}else{await window.webminecraftSaveCurrentWorld?.({ skipCloud:true, skipPreview:true });}}catch{}window.__webminecraftFastQuit=true;window.location.reload();};void saveAndReturn();});
    const refreshMembers=()=>{if(paused)renderSide();};
    window.addEventListener("webminecraft:multiplayer-player-joined",refreshMembers);window.addEventListener("webminecraft:multiplayer-player-left",refreshMembers);window.addEventListener("webminecraft:multiplayer-state-changed",refreshMembers);
    window.addEventListener("webminecraft:multiplayer-role-changed",refreshMembers);window.addEventListener("webminecraft:multiplayer-player-role-changed",refreshMembers);
    overlay.querySelectorAll("#pauseServerControls [data-role]").forEach(button=>button.addEventListener("click",()=>{const member=selectedControlMember();if(!member)return;window.__webminecraftSendServerControl?.("set_role",{targetName:member.name,role:button.dataset.role});overlay.querySelector("#pauseControlStatus").textContent="Role change sent.";setTimeout(refreshMembers,200);}));
    overlay.querySelectorAll("#pauseServerControls [data-action]").forEach(button=>button.addEventListener("click",()=>{const member=selectedControlMember();if(!member)return;const action=button.dataset.action;const details={targetName:member.name};if(action.startsWith("gamemode-")){details.mode=action.endsWith("creative")?"creative":"survival";window.__webminecraftSendServerControl?.("gamemode",details);}else if(action==="teleport"){details.x=Math.floor(Number(window.__webminecraftCamera?.position?.x)||0);details.y=Math.floor(Number(window.__webminecraftCamera?.position?.y)||0);details.z=Math.floor(Number(window.__webminecraftCamera?.position?.z)||0);window.__webminecraftSendServerControl?.("teleport",details);}else if(action==="give"){const itemId=Math.floor(Number(prompt("Item ID to give (1-184):","1")));const count=Math.floor(Number(prompt("Amount (1-64):","1")));if(Number.isFinite(itemId)&&Number.isFinite(count))window.__webminecraftSendServerControl?.("give",{...details,itemId,count});}else window.__webminecraftSendServerControl?.(action,details);overlay.querySelector("#pauseControlStatus").textContent="Control sent.";setTimeout(refreshMembers,200);}));
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
    const style=document.createElement("style");
    style.id="gameVersionStyles";
    style.textContent=`#gameVersionButton{position:fixed;right:10px;bottom:8px;min-width:88px;height:34px;padding:5px 10px;border:2px solid #111;border-top-color:#9a9a9a;border-left-color:#9a9a9a;background:linear-gradient(#666,#4d4d4d);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;cursor:pointer;z-index:97;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),0 2px 0 rgba(0,0,0,.7)}#gameVersionPicker{position:fixed;right:10px;bottom:48px;width:160px;padding:6px;background:#191919;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.55);z-index:97;display:none}.gameVersionOption{display:block;width:100%;min-height:34px;margin:3px 0;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#3d3d3d;color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-align:left;padding:7px 9px;cursor:pointer;text-shadow:2px 2px 0 #111}.gameVersionOption.active{background:#5e5e5e}`;
    document.head.appendChild(style);

    const button=document.createElement("button");
    button.id="gameVersionButton";
    button.type="button";
    const picker=document.createElement("div");
    picker.id="gameVersionPicker";
    let current=VERSIONS.includes(localStorage.getItem(VERSION_KEY))?localStorage.getItem(VERSION_KEY):VERSIONS[0];

    VERSIONS.forEach(version=>{
        const option=document.createElement("button");
        option.className="gameVersionOption";
        option.type="button";
        option.dataset.version=version;
        option.textContent=version;
        option.addEventListener("click",()=>{
            current=version;
            localStorage.setItem(VERSION_KEY,version);
            window.webminecraftVersion=version;
            refresh();
            picker.style.display="none";
        });
        picker.appendChild(option);
    });

    const refresh=()=>{
        button.textContent=current;
        picker.querySelectorAll(".gameVersionOption").forEach(option=>option.classList.toggle("active",option.dataset.version===current));
    };

    button.addEventListener("click",event=>{
        event.preventDefault();
        event.stopPropagation();
        picker.style.display=picker.style.display==="block"?"none":"block";
    });

    document.addEventListener("click",event=>{
        if(event.target!==button&&!picker.contains(event.target)) picker.style.display="none";
    });
    document.addEventListener("keydown",event=>{if(event.code==="Escape")picker.style.display="none";});

    document.body.append(button,picker);
    window.webminecraftVersion=current;
    refresh();

    if(menu){
        const observer=new MutationObserver(()=>{
            const visible=getComputedStyle(menu).display!=="none";
            button.style.display=visible?"block":"none";
            if(!visible) picker.style.display="none";
        });
        observer.observe(menu,{attributes:true,attributeFilter:["style","class"]});
    }
}

addStyles();
createNewsUi();
setupPauseMenu();
>>>>>>> 3b6eb35da2cafd8fac0c64b277b1cdbca6cba417
setupSeedBackButton();
createVersionPicker();

if(seedMenu){let cleared=false;const observer=new MutationObserver(()=>{const open=getComputedStyle(seedMenu).display!=="none";if(open&&!cleared){clearWorld();cleared=true;}else if(!open)cleared=false;});observer.observe(seedMenu,{attributes:true,attributeFilter:["style","class"]});}