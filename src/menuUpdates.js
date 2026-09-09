import { clearWorld } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");

const VERSION_KEY = "webminecraft-game-version";
const VERSIONS = ["v1.0", "v1.1", "v1.2"];

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

syncMenuUpdates();
createVersionPicker();
watchSeedMenu();

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
