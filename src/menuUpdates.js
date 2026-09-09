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
        body: "Every update log can be opened as a full-screen detail page. Select an update from the Latest Updates panel to read its expanded description, then use Back or Escape to return to the main menu."
    }
];

// Keep the UI completely static for now. This also overrides transitions already
// present in index.html so no menu animation code runs or affects startup.
function disableMotion() {
    if (document.getElementById("noMenuMotion")) return;
    const style = document.createElement("style");
    style.id = "noMenuMotion";
    style.textContent = `
        *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
        }
    `;
    document.head.appendChild(style);
}

function syncMenuUpdates() {
    if (!updates || !menu) return;
    updates.style.display = getComputedStyle(menu).display === "none" ? "none" : "block";
}

function setupSeedBackButton() {
    const button = document.getElementById("backSeedButton");
    if (!button || button.dataset.backHookInstalled) return;
    button.dataset.backHookInstalled = "1";

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (seedMenu) {
            seedMenu.style.display = "none";
            seedMenu.setAttribute("aria-hidden", "true");
        }
        if (menu) menu.style.display = "flex";
        window.setTimeout(() => window.location.reload(), 80);
    });
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

    const style = document.createElement("style");
    style.id = "updateDetailStaticStyles";
    style.textContent = `
        #updateDetailMenu {
            position: fixed;
            inset: 0;
            display: none;
            align-items: stretch;
            justify-content: center;
            overflow: auto;
            background: #171717;
            color: #fff;
            z-index: 220;
        }
        #updateDetailPanel {
            position: relative;
            width: min(1040px, 100vw);
            min-height: 100vh;
            padding: clamp(28px, 6vh, 72px) clamp(22px, 7vw, 92px);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        #updateDetailBackWrap {
            position: absolute;
            left: clamp(18px, 4vw, 60px);
            top: clamp(18px, 4vh, 44px);
        }
        #updateDetailBack { min-width: 130px; }
        #updateDetailVersion {
            margin: 0 0 10px;
            color: #8fca68;
            font-family: "MinecraftFont", monospace;
            font-size: clamp(12px, 1.5vw, 16px);
            text-shadow: 2px 2px 0 #111;
        }
        #updateDetailTitle {
            margin: 0 0 22px;
            max-width: 900px;
            font-family: "MinecraftFont", monospace;
            font-size: clamp(32px, 5vw, 62px);
            line-height: 1;
            text-shadow: 3px 3px 0 #000;
        }
        #updateDetailBody {
            max-width: 860px;
            color: #d6d6d6;
            font-size: clamp(15px, 1.65vw, 20px);
            line-height: 1.7;
        }
    `;
    document.head.appendChild(style);

    const backButton = detailMenu.querySelector("#updateDetailBack");
    const version = detailMenu.querySelector("#updateDetailVersion");
    const title = detailMenu.querySelector("#updateDetailTitle");
    const body = detailMenu.querySelector("#updateDetailBody");
    let detailOpen = false;

    const closeDetails = event => {
        event?.preventDefault();
        event?.stopPropagation();
        detailOpen = false;
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
        detailMenu.style.display = "flex";
        detailMenu.setAttribute("aria-hidden", "false");
        if (menu) menu.style.pointerEvents = "none";
    };

    cards.forEach(card => {
        const activate = event => {
            if (event.type === "keydown" && event.code !== "Enter" && event.code !== "Space") return;
            event.preventDefault();
            event.stopPropagation();
            openDetails(Number(card.dataset.updateIndex));
        };
        card.addEventListener("click", activate);
        card.addEventListener("keydown", activate);
        card.style.cursor = "pointer";
        card.style.userSelect = "none";
    });

    backButton.addEventListener("click", closeDetails);
    detailMenu.addEventListener("click", event => {
        if (event.target === detailMenu) closeDetails(event);
    });
    document.addEventListener("keydown", event => {
        if (event.code === "Escape" && detailOpen) closeDetails(event);
    });
}

function getSavedVersion() {
    try {
        const saved = localStorage.getItem(VERSION_KEY);
        return VERSIONS.includes(saved) ? saved : VERSIONS[0];
    } catch {
        return VERSIONS[0];
    }
}

function createVersionPicker() {
    if (document.getElementById("gameVersionPicker")) return;

    const style = document.createElement("style");
    style.id = "gameVersionStyles";
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
            background: linear-gradient(#666,#4d4d4d);
            color: #fff;
            font-family: "MinecraftFont", monospace;
            font-size: 11px;
            text-shadow: 2px 2px 0 #222;
            cursor: pointer;
            z-index: 97;
            box-shadow: inset 2px 2px 0 rgba(255,255,255,.12), 0 2px 0 rgba(0,0,0,.7);
        }
        #gameVersionButton:hover,
        #gameVersionButton:focus-visible { background: #777; outline: 2px solid #fff; outline-offset: 1px; }
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
            box-shadow: 4px 4px 0 rgba(0,0,0,.55);
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
            color: #fff;
            font-family: "MinecraftFont", monospace;
            font-size: 11px;
            text-align: left;
            padding: 7px 9px;
            cursor: pointer;
            text-shadow: 2px 2px 0 #111;
        }
        .gameVersionOption:hover,
        .gameVersionOption:focus-visible { background: #545454; outline: 2px solid #fff; }
        .gameVersionOption.active { background: #5e5e5e; }
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

    for (const v of VERSIONS) {
        const option = document.createElement("button");
        option.className = "gameVersionOption";
        option.type = "button";
        option.dataset.version = v;
        option.textContent = v;
        option.setAttribute("role", "menuitem");
        option.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            currentVersion = v;
            try { localStorage.setItem(VERSION_KEY, v); } catch {}
            window.webminecraftVersion = v;
            refresh();
            picker.style.display = "none";
        });
        picker.appendChild(option);
    }

    const refresh = () => {
        button.textContent = currentVersion;
        picker.querySelectorAll(".gameVersionOption").forEach(option => {
            option.classList.toggle("active", option.dataset.version === currentVersion);
        });
    };

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        picker.style.display = picker.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", event => {
        if (event.target !== button && !picker.contains(event.target)) picker.style.display = "none";
    });
    document.addEventListener("keydown", event => {
        if (event.code === "Escape") picker.style.display = "none";
    });

    document.body.append(button, picker);
    window.webminecraftVersion = currentVersion;
    refresh();

    if (menu) {
        const observer = new MutationObserver(() => {
            const visible = getComputedStyle(menu).display !== "none";
            button.style.display = visible ? "block" : "none";
            if (!visible) picker.style.display = "none";
        });
        observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
        button.style.display = getComputedStyle(menu).display !== "none" ? "block" : "none";
    }
}

disableMotion();
syncMenuUpdates();
setupSeedBackButton();
setupUpdateDetails();
createVersionPicker();

if (seedMenu) {
    let cleared = false;
    const observer = new MutationObserver(() => {
        const open = getComputedStyle(seedMenu).display !== "none";
        if (open && !cleared) {
            clearWorld();
            cleared = true;
        } else if (!open) {
            cleared = false;
        }
    });
    observer.observe(seedMenu, { attributes: true, attributeFilter: ["style", "class"] });
}

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
