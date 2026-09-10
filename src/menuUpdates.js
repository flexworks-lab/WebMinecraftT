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
    `;
    document.head.appendChild(style);
}

function createNewsUi() {
    if (!updates || !menu || document.getElementById("newsButton")) return;
    addStyles();

    const buttons = document.getElementById("menuButtons");
    if (!buttons) return;

    const button = document.createElement("button");
    button.id = "newsButton";
    button.className = "menuButton";
    button.type = "button";
    button.textContent = "News";
    buttons.insertBefore(button, document.getElementById("menuSettingsButton"));

    const center = document.createElement("div");
    center.id = "newsCenter";
    center.setAttribute("aria-hidden", "true");
    center.innerHTML = `
        <div id="newsPanel" role="dialog" aria-modal="true" aria-labelledby="newsTitle">
            <header id="newsHeader">
                <div><h2 id="newsTitle">News & Updates</h2><p id="newsSubtitle">The latest WebMinecraftT changes</p></div>
                <button id="newsClose" class="menuButton" type="button">Close</button>
            </header>
            <div id="newsList"></div>
        </div>
    `;
    document.body.appendChild(center);

    const details = document.createElement("div");
    details.id = "newsDetails";
    details.setAttribute("aria-hidden", "true");
    details.innerHTML = `
        <div id="newsDetailsPanel" role="dialog" aria-modal="true" aria-labelledby="newsDetailsTitle">
            <div id="newsDetailsVersion"></div>
            <h2 id="newsDetailsTitle"></h2>
            <div id="newsDetailsBody"></div>
            <button id="newsDetailsBack" class="menuButton" type="button">← Back</button>
        </div>
    `;
    document.body.appendChild(details);

    const list = center.querySelector("#newsList");
    const detailVersion = details.querySelector("#newsDetailsVersion");
    const detailTitle = details.querySelector("#newsDetailsTitle");
    const detailBody = details.querySelector("#newsDetailsBody");

    UPDATE_DETAILS.forEach((item, index) => {
        const card = document.createElement("button");
        card.className = "newsItem";
        card.type = "button";
        card.innerHTML = `<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(item.body)}</div>`;
        card.addEventListener("click", event => {
            event.stopPropagation();
            const selected = UPDATE_DETAILS[index];
            detailVersion.textContent = selected.version;
            detailTitle.textContent = selected.title;
            detailBody.textContent = selected.body;
            details.style.display = "flex";
            details.setAttribute("aria-hidden", "false");
        });
        list.appendChild(card);
    });

    const closeNews = () => {
        details.style.display = "none";
        details.setAttribute("aria-hidden", "true");
        center.style.display = "none";
        center.setAttribute("aria-hidden", "true");
    };

    const openNews = event => {
        event?.preventDefault();
        event?.stopPropagation();
        center.style.display = "flex";
        center.setAttribute("aria-hidden", "false");
        details.style.display = "none";
        details.setAttribute("aria-hidden", "true");
        center.querySelector("#newsClose")?.focus();
    };

    button.addEventListener("click", openNews);
    center.querySelector("#newsClose").addEventListener("click", closeNews);
    details.querySelector("#newsDetailsBack").addEventListener("click", () => {
        details.style.display = "none";
        details.setAttribute("aria-hidden", "true");
    });
    center.addEventListener("click", event => { if (event.target === center) closeNews(); });
    details.addEventListener("click", event => { if (event.target === details) details.style.display = "none"; });

    document.addEventListener("keydown", event => {
        if (event.code !== "Escape") return;
        if (details.style.display === "flex") {
            details.style.display = "none";
            details.setAttribute("aria-hidden", "true");
        } else if (center.style.display === "flex") {
            closeNews();
        }
    }, true);
}

function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function setupPauseMenu() {
    if (document.getElementById("pauseMenu")) return;
    const style = document.createElement("style");
    style.id = "pauseMenuStyles";
    style.textContent = `#pauseMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);color:#fff;z-index:500;pointer-events:auto}#pausePanel{width:min(420px,90vw);padding:30px 28px 26px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);text-align:center}#pauseTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:34px;text-shadow:3px 3px 0 #000}#pauseSeed{min-height:20px;margin:0 0 20px;color:#999;font:12px Arial,sans-serif;overflow-wrap:anywhere}#pauseButtons{display:grid;gap:9px}.pauseButton{width:100%;min-height:46px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}#pauseResume{background:linear-gradient(#6d8d4e,#526f3c)}#pauseReturn{background:linear-gradient(#5d5d5d,#444)}`;
    document.head.appendChild(style);
    const overlay = document.createElement("div");
    overlay.id = "pauseMenu";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `<div id="pausePanel"><h2 id="pauseTitle">Game Paused</h2><div id="pauseSeed"></div><div id="pauseButtons"><button id="pauseResume" class="pauseButton" type="button">Resume Game</button><button id="pauseSettings" class="pauseButton" type="button">Settings</button><button id="pauseMobile" class="pauseButton" type="button">Mobile Mode</button><button id="pauseReturn" class="pauseButton" type="button">Return to Main Menu</button></div></div>`;
    document.body.appendChild(overlay);
    const isGameRunning = () => Boolean(menu && menu.style.display === "none");
    let paused = false;
    const close = event => { event?.preventDefault(); paused = false; overlay.style.display = "none"; overlay.setAttribute("aria-hidden", "true"); if (isGameRunning()) document.body.requestPointerLock?.(); };
    const open = event => { event?.preventDefault(); event?.stopPropagation(); if (!isGameRunning()) return; paused = true; overlay.querySelector("#pauseSeed").textContent = `Seed: ${getWorldSeed()}`; overlay.style.display = "flex"; overlay.setAttribute("aria-hidden", "false"); document.exitPointerLock?.(); overlay.querySelector("#pauseResume").focus(); };
    overlay.querySelector("#pauseResume").addEventListener("click", close);
    overlay.querySelector("#pauseSettings").addEventListener("click", event => { event.preventDefault(); overlay.style.display = "none"; overlay.setAttribute("aria-hidden", "true"); document.getElementById("settingsMenu")?.style.setProperty("display", "flex"); document.exitPointerLock?.(); paused = false; });
    overlay.querySelector("#pauseMobile").addEventListener("click", () => { const url = new URL(window.location.href); const enabled = url.searchParams.get("mobile") === "1" || url.searchParams.get("mode") === "mobile"; if (enabled) { url.searchParams.delete("mobile"); url.searchParams.delete("mode"); } else { url.searchParams.set("mobile", "1"); url.searchParams.delete("mode"); } window.location.href = url.toString(); });
    overlay.querySelector("#pauseReturn").addEventListener("click", () => window.location.reload());
    document.addEventListener("keydown", event => { if (event.code !== "Escape") return; if (paused) close(event); else if (isGameRunning()) open(event); }, true);
    document.getElementById("settingsButton")?.addEventListener("pointerdown", event => { if (!isGameRunning()) return; event.preventDefault(); event.stopImmediatePropagation(); open(event); }, true);
    window.webminecraftPause = { open, close, isOpen: () => paused };
}

function setupSeedBackButton() {
    const button = document.getElementById("backSeedButton");
    if (!button || button.dataset.backHookInstalled) return;
    button.dataset.backHookInstalled = "1";
    button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); if (seedMenu) { seedMenu.style.display = "none"; seedMenu.setAttribute("aria-hidden", "true"); } if (menu) menu.style.display = "flex"; window.setTimeout(() => window.location.reload(), 80); });
}

function createVersionPicker() {
    if (document.getElementById("gameVersionPicker")) return;
    const style = document.createElement("style");
    style.id = "gameVersionStyles";
    style.textContent = `#gameVersionButton{position:fixed;right:10px;bottom:8px;min-width:88px;height:34px;padding:5px 10px;border:2px solid #111;border-top-color:#9a9a9a;border-left-color:#9a9a9a;background:linear-gradient(#666,#4d4d4d);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;cursor:pointer;z-index:97;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),0 2px 0 rgba(0,0,0,.7)}#gameVersionPicker{position:fixed;right:10px;bottom:48px;width:160px;padding:6px;background:#191919;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.55);z-index:97;display:none}.gameVersionOption{display:block;width:100%;min-height:34px;margin:3px 0;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#3d3d3d;color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-align:left;padding:7px 9px;cursor:pointer;text-shadow:2px 2px 0 #111}.gameVersionOption.active{background:#5e5e5e}`;
    document.head.appendChild(style);
    const button = document.createElement("button");
    button.id = "gameVersionButton";
    button.type = "button";
    const picker = document.createElement("div");
    picker.id = "gameVersionPicker";
    let current = VERSIONS.includes(localStorage.getItem(VERSION_KEY)) ? localStorage.getItem(VERSION_KEY) : VERSIONS[0];
    VERSIONS.forEach(version => { const option = document.createElement("button"); option.className = "gameVersionOption"; option.type = "button"; option.dataset.version = version; option.textContent = version; option.addEventListener("click", () => { current = version; localStorage.setItem(VERSION_KEY, version); window.webminecraftVersion = version; refresh(); picker.style.display = "none"; }); picker.appendChild(option); });
    const refresh = () => { button.textContent = current; picker.querySelectorAll(".gameVersionOption").forEach(option => option.classList.toggle("active", option.dataset.version === current)); };
    button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); picker.style.display = picker.style.display === "block" ? "none" : "block"; });
    document.addEventListener("click", event => { if (event.target !== button && !picker.contains(event.target)) picker.style.display = "none"; });
    document.addEventListener("keydown", event => { if (event.code === "Escape") picker.style.display = "none"; });
    document.body.append(button, picker);
    window.webminecraftVersion = current;
    refresh();
    if (menu) { const observer = new MutationObserver(() => { const visible = getComputedStyle(menu).display !== "none"; button.style.display = visible ? "block" : "none"; if (!visible) picker.style.display = "none"; }); observer.observe(menu, { attributes:true, attributeFilter:["style","class"] }); }
}

addStyles();
createNewsUi();
setupPauseMenu();
setupSeedBackButton();
createVersionPicker();

if (seedMenu) {
    let cleared = false;
    const observer = new MutationObserver(() => { const open = getComputedStyle(seedMenu).display !== "none"; if (open && !cleared) { clearWorld(); cleared = true; } else if (!open) cleared = false; });
    observer.observe(seedMenu, { attributes:true, attributeFilter:["style","class"] });
}
