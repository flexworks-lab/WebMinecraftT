import { clearWorld } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");

const VERSION_KEY = "webminecraft-game-version";
const VERSIONS = ["v1.0", "v1.1", "v1.2"];

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
        .menuUpdate { transition: transform .16s ease, filter .16s ease; }
        .menuUpdate:hover { transform: translateX(4px); filter: brightness(1.08); }
        #menuFooter, #menuCopyright { transition: opacity .2s ease, transform .2s ease; }
        #menuFooter:hover { transform: translateY(-2px); }
        #menuCopyright:hover { transform: translateY(-2px); }

        /* The seed screen now rises from below the viewport as one full-screen surface. */
        #seedMenu {
            overflow: hidden;
        }
        #seedMenu.seed-menu-opening {
            animation: wmSeedScreenIn .55s cubic-bezier(.16,.8,.24,1) both;
        }
        #seedMenu.seed-menu-opening #seedPanel {
            animation: none;
        }
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
            #seedMenu.seed-menu-opening #seedLinkStatus { animation: none !important; opacity: 1 !important; }
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
watchSeedMenu();

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
