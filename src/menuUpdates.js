import "./chat.js";
import { clearWorld, getWorldSeed } from "./world.js";

const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");
const seedMenu = document.getElementById("seedMenu");
const VERSION_KEY = "webminecraft-game-version";
const NEWS_SEEN_KEY = "webminecraft-news-seen-v2";
const NEWS_VERSION = "2026-09-12-patch-notes";
const VERSIONS = ["v1.0", "v1.1", "v1.2", "Beta"];

const UPDATE_DETAILS = [
    { version: "LATEST • Patch Notes", title: "Full WebMinecraftT Patch Notes", body: `WebMinecraftT Patch Notes\n\nWORLD SAVES\n• Separate world saves keep each world's block data independent.\n• Saved worlds keep their names, seeds, creation dates, and updated data.\n• World seed links make it easier to share and reopen generated worlds.\n• World loading and deletion behavior has been improved to keep saves consistent.\n\nGAMEPLAY\n• Added a full world creation/opening screen for entering and sharing seeds.\n• Added Copy Seed and Copy World Link tools.\n• Improved spawning and generated-world consistency.\n• Added pause, settings, mobile mode, and return-to-menu controls.\n\nWORLD & BLOCKS\n• Seed-based terrain generation is used for repeatable worlds.\n• Terrain, caves, biomes, trees, water, and spawn locations are tied to the world seed.\n• Block interaction and world updates have been improved for smoother gameplay.\n\nWATER\n• Improved flowing-water behavior with source creation, falling water, horizontal flow, and retraction.\n• Water simulation is queue-based and limits work per update to reduce lag.\n• Water rendering and transparency were improved.\n• Water textures use Minecraft-style filtering and continuous world UVs.\n\nTNT & PERFORMANCE\n• TNT behavior has been optimized to reduce freezes when explosions happen.\n• Explosion block updates are processed together to reduce repeated rendering work.\n• Performance systems limit expensive world and water updates per frame.\n\nVISUALS & TEXTURES\n• Block textures and lighting were improved for a darker Minecraft-style look.\n• Underground lighting and fog transition more naturally with depth.\n• Shadows, render quality, brightness, and lighting quality can be adjusted in Settings.\n• Water and world materials received visual cleanup.\n\nCLOUDS & SKY\n• Added larger, more visible block-style clouds.\n• Cloud shapes and placement are randomized for a less repetitive sky.\n• Added a glowing square sun positioned high in the sky.\n• Sky and underground color transitions were improved.\n\nPLAYER & MOVEMENT\n• Movement, camera handling, spawning, and controls have been polished.\n• Desktop pointer-lock behavior is handled more reliably.\n• Added mobile-friendly movement controls and Mobile Mode.\n\nMOBILE\n• Added touch-friendly controls for smaller screens.\n• Added a hybrid joystick layout for movement.\n• Mobile UI positioning was improved for phones and tablets.\n• Crosshair, hotbar, and in-world UI visibility are handled more cleanly.\n\nCHAT\n• Desktop chat can be triggered with /.\n• Chat messages can remain visible in the top-left without constantly opening full chat.\n• Full-screen chat was improved for desktop and mobile.\n• Chat visibility and input behavior were cleaned up.\n\nMULTIPLAYER\n• Added multiplayer server and room support.\n• Added public and private server options.\n• Added server names, private codes, player names, and server lists.\n• Shared block changes can sync between players.\n• Multiplayer chat supports join messages and player communication.\n• Multiplayer systems continue to receive performance and stability improvements.\n\nUI & MENUS\n• Main menu has been redesigned with a more Minecraft-like appearance.\n• News is now a dedicated full-screen News & Updates center.\n• Website announcements use a larger title/reason layout and scrollable messages.\n• Friends has its own button beside News.\n• Settings uses a full-screen, scrollable layout with graphics and performance controls.\n\nSOCIAL & ACCOUNTS\n• Added account and friend-system groundwork.\n• Friends and player presence features can be accessed from the main menu.\n• Developer/account controls are separated from normal player UI.\n\nNEWS & UPDATES\n• Added a dedicated News Center for update notes.\n• News entries open into a larger details view.\n• Website announcements can be delivered separately from normal update notes.\n• This update adds the complete patch notes to the News Center.\n\nBUG FIXES & TECHNICAL IMPROVEMENTS\n• Fixed and improved world-save persistence and loading.\n• Improved UI visibility when entering and leaving worlds.\n• Improved mobile/desktop control switching.\n• Reduced unnecessary work during world updates.\n• Improved rendering, lighting, water, and multiplayer stability.\n\nThanks for playing WebMinecraftT!` },
    { version: "LATEST • World Saves", title: "Separate World Saves Fixed", body: "Each saved world now keeps its own block data. Creating or opening another world no longer overwrites the first world's saved blocks." },
    { version: "LATEST • Welcome", title: "New Player Welcome Screen", body: "New players now get a centered welcome screen with tabs explaining WebMinecraftT, setup, account information, and gameplay before they start playing." },
    { version: "LATEST • News", title: "New News Center", body: "The main menu news feed is now opened from a dedicated News button with a full update list and details view." },
    { version: "LATEST • Saved Worlds", title: "Saved Worlds", body: "Singleplayer has a saved-world list with world names, seeds, details, creation dates, and Play controls." },
    { version: "LATEST • Drive", title: "Google Drive World Backup", body: "Saved worlds can be backed up to Google Drive and discovered again when loading the saved-world screen." },
    { version: "BETA • Multiplayer", title: "WebMinecraftT Beta", body: "WebMinecraftT is in beta. Multiplayer servers, shared worlds, chat, private servers, mobile support, and more are being actively improved." },
    { version: "BETA • Private Servers", title: "Private Servers", body: "Private servers stay visible in the server list and can require a private code before joining." },
    { version: "BETA • Shared World", title: "Live World Changes", body: "Breaking and placing blocks can sync between players in the same multiplayer server." },
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
#newsButton{margin-top:8px;position:relative}
#newsButton[data-news-new="true"]::after{content:"";position:absolute;right:10px;top:8px;width:10px;height:10px;border-radius:50%;background:#e53935;border:2px solid #101010;box-shadow:0 0 0 1px rgba(255,255,255,.16),0 0 8px rgba(229,57,53,.55)}
#newsCenter{position:fixed;inset:0;display:none;background:#171717;color:#fff;z-index:240;overflow:hidden}
#newsPanel{width:100%;height:100%;display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr);background:linear-gradient(180deg,#292929,#181818)}
#newsSidebar{min-width:0;display:flex;flex-direction:column;background:#202020;border-right:2px solid #0d0d0d}
#newsSidebarHeader{padding:26px 22px 18px;background:linear-gradient(#383838,#2b2b2b);border-bottom:2px solid #111}
#newsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(25px,3vw,36px);text-shadow:3px 3px 0 #000}
#newsSubtitle{margin:7px 0 0;color:#aaa;font-size:12px;line-height:1.4}
#newsList{min-height:0;overflow:auto;padding:14px}
#newsList::-webkit-scrollbar,#newsDetailsBody::-webkit-scrollbar{width:12px}
#newsList::-webkit-scrollbar-track,#newsDetailsBody::-webkit-scrollbar-track{background:#151515}
#newsList::-webkit-scrollbar-thumb,#newsDetailsBody::-webkit-scrollbar-thumb{background:#555;border:2px solid #151515}
.newsItem{display:block;width:100%;margin:0 0 10px;padding:14px;text-align:left;background:#353535;border:2px solid #111;border-top-color:#777;border-left-color:#777;color:#fff;cursor:pointer;transition:filter .08s,transform .08s}
.newsItem:hover{filter:brightness(1.12);transform:translateY(-1px)}
.newsItem.active{background:linear-gradient(#526642,#3e4d32);border-top-color:#a6c98a;border-left-color:#a6c98a}
.newsItemVersion{color:#a6d47f;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:1px 1px 0 #111}
.newsItemTitle{margin-top:6px;font-family:"MinecraftFont",monospace;font-size:15px;line-height:1.25;text-shadow:2px 2px 0 #111}
.newsItemBody{margin-top:6px;color:#c9c9c9;font-size:12px;line-height:1.4}
#newsMain{min-width:0;min-height:0;display:flex;flex-direction:column}
#newsHeader{height:82px;flex:0 0 82px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 28px;background:#2c2c2c;border-bottom:2px solid #101010}
#newsHeaderLabel{min-width:0}
#newsCurrentVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:12px;margin-bottom:5px}
#newsCurrentTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(21px,2.5vw,31px);text-shadow:3px 3px 0 #000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#newsClose{min-width:95px;flex:0 0 auto}
#newsDetails{flex:1;min-height:0;display:flex;flex-direction:column;padding:30px 34px 26px;background:radial-gradient(circle at 70% 10%,rgba(255,255,255,.05),transparent 30%),#242424}
#newsDetailsTitle{margin:0 0 16px;font-family:"MinecraftFont",monospace;font-size:clamp(30px,4vw,48px);line-height:1.08;text-shadow:4px 4px 0 #000}
#newsDetailsBody{min-height:0;overflow:auto;white-space:pre-wrap;color:#dedede;font-size:16px;line-height:1.7;padding-right:12px}
#newsDetailsBack{align-self:flex-start;margin-top:20px;min-width:150px}
@media(max-width:760px){
    #newsPanel{grid-template-columns:1fr;grid-template-rows:minmax(170px,34vh) minmax(0,1fr)}
    #newsSidebar{border-right:0;border-bottom:2px solid #0d0d0d}
    #newsSidebarHeader{padding:15px 16px 12px}
    #newsList{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:10px}
    .newsItem{min-width:230px;margin:0}
    #newsHeader{height:72px;flex-basis:72px;padding:0 15px}
    #newsClose{min-width:80px}
    #newsDetails{padding:22px 17px 18px}
    #newsDetailsTitle{font-size:28px}
    #newsDetailsBody{font-size:14px;line-height:1.6}
}
`;
    document.head.appendChild(style);
}

function hasSeenNews(){
    try{return localStorage.getItem(NEWS_SEEN_KEY)===NEWS_VERSION;}catch{return false;}
}
function markNewsSeen(){try{localStorage.setItem(NEWS_SEEN_KEY,NEWS_VERSION);}catch{}}
function setNewsDot(button,show){if(button)button.dataset.newsNew=show?"true":"false";}

function createNewsUi(){
    if(!updates||!menu||document.getElementById("newsButton"))return;
    addStyles();
    const buttons=document.getElementById("menuButtons");
    if(!buttons)return;
    const button=document.createElement("button");
    button.id="newsButton";button.className="menuButton";button.type="button";button.textContent="News";
    buttons.insertBefore(button,document.getElementById("menuSettingsButton"));
    setNewsDot(button,!hasSeenNews());

    const center=document.createElement("div");
    center.id="newsCenter";center.setAttribute("aria-hidden","true");
    center.innerHTML=`
<div id="newsPanel">
    <aside id="newsSidebar">
        <div id="newsSidebarHeader"><h2 id="newsTitle">News & Updates</h2><p id="newsSubtitle">WebMinecraftT patch notes, updates, and changes</p></div>
        <div id="newsList"></div>
    </aside>
    <section id="newsMain">
        <header id="newsHeader">
            <div id="newsHeaderLabel"><div id="newsCurrentVersion">LATEST</div><h2 id="newsCurrentTitle">Select an update</h2></div>
            <button id="newsClose" class="menuButton" type="button">Close</button>
        </header>
        <div id="newsDetails"><h1 id="newsDetailsTitle">Welcome to News</h1><div id="newsDetailsBody">Select an update from the list to read the details.</div><button id="newsDetailsBack" class="menuButton" type="button">Back to Updates</button></div>
    </section>
</div>`;
    document.body.appendChild(center);

    const list=center.querySelector("#newsList");
    const version=center.querySelector("#newsCurrentVersion");
    const currentTitle=center.querySelector("#newsCurrentTitle");
    const detailsTitle=center.querySelector("#newsDetailsTitle");
    const detailsBody=center.querySelector("#newsDetailsBody");
    const cards=[];

    const selectUpdate=(item,index)=>{
        cards.forEach((card,i)=>card.classList.toggle("active",i===index));
        version.textContent=item.version;
        currentTitle.textContent=item.title;
        detailsTitle.textContent=item.title;
        detailsBody.textContent=item.body;
    };

    UPDATE_DETAILS.forEach((item,index)=>{
        const card=document.createElement("button");
        card.className="newsItem";card.type="button";
        card.innerHTML=`<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(item.body.split("\\n")[0])}</div>`;
        card.addEventListener("click",event=>{event.stopPropagation();selectUpdate(item,index);});
        list.appendChild(card);cards.push(card);
    });

    const closeNews=()=>{center.style.display="none";center.setAttribute("aria-hidden","true");};
    const openNews=event=>{
        event?.preventDefault();event?.stopPropagation();
        center.style.display="block";center.setAttribute("aria-hidden","false");
        markNewsSeen();setNewsDot(button,false);
        selectUpdate(UPDATE_DETAILS[0],0);
        center.querySelector("#newsClose")?.focus();
    };

    button.addEventListener("click",openNews);
    center.querySelector("#newsClose").addEventListener("click",closeNews);
    center.querySelector("#newsDetailsBack").addEventListener("click",()=>list.firstElementChild?.focus());
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(center.style.display==="block")closeNews();},true);
    center.addEventListener("click",event=>{if(event.target===center)closeNews();});
}

function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

function setupPauseMenu(){
    if(document.getElementById("pauseMenu"))return;
    const style=document.createElement("style");style.id="pauseMenuStyles";style.textContent=`#pauseMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);color:#fff;z-index:500;pointer-events:auto}#pausePanel{width:min(420px,90vw);padding:30px 28px 26px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);text-align:center}#pauseTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:34px;text-shadow:3px 3px 0 #000}#pauseSeed{min-height:20px;margin:0 0 20px;color:#999;font:12px Arial,sans-serif;overflow-wrap:anywhere}#pauseButtons{display:grid;gap:9px}.pauseButton{width:100%;min-height:46px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}#pauseResume{background:linear-gradient(#6d8d4e,#526f3c)}#pauseReturn{background:linear-gradient(#5d5d5d,#444)}`;
    document.head.appendChild(style);
    const overlay=document.createElement("div");overlay.id="pauseMenu";overlay.setAttribute("aria-hidden","true");
    overlay.innerHTML=`<div id="pausePanel"><h2 id="pauseTitle">Game Paused</h2><div id="pauseSeed"></div><div id="pauseButtons"><button id="pauseResume" class="pauseButton" type="button">Resume Game</button><button id="pauseSettings" class="pauseButton" type="button">Settings</button><button id="pauseMobile" class="pauseButton" type="button">Mobile Mode</button><button id="pauseReturn" class="pauseButton" type="button">Return to Main Menu</button></div></div>`;
    document.body.appendChild(overlay);
    const isGameRunning=()=>Boolean(menu&&menu.style.display==="none");let paused=false;
    const close=event=>{event?.preventDefault();paused=false;overlay.style.display="none";overlay.setAttribute("aria-hidden","true");if(isGameRunning())document.body.requestPointerLock?.();};
    const open=event=>{event?.preventDefault();event?.stopPropagation();if(!isGameRunning())return;paused=true;overlay.querySelector("#pauseSeed").textContent=`Seed: ${getWorldSeed()}`;overlay.style.display="flex";overlay.setAttribute("aria-hidden","false");document.exitPointerLock?.();overlay.querySelector("#pauseResume").focus();};
    overlay.querySelector("#pauseResume").addEventListener("click",close);
    overlay.querySelector("#pauseSettings").addEventListener("click",()=>{overlay.style.display="none";overlay.setAttribute("aria-hidden","true");document.getElementById("settingsMenu")?.style.setProperty("display","flex");document.exitPointerLock?.();paused=false;});
    overlay.querySelector("#pauseMobile").addEventListener("click",()=>{const url=new URL(window.location.href);const enabled=url.searchParams.get("mobile")==="1"||url.searchParams.get("mode")==="mobile";if(enabled){url.searchParams.delete("mobile");url.searchParams.delete("mode");}else{url.searchParams.set("mobile","1");url.searchParams.delete("mode");}window.location.href=url.toString();});
    overlay.querySelector("#pauseReturn").addEventListener("click",()=>window.location.reload());
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(paused)close(event);else if(isGameRunning())open(event);},true);
    document.getElementById("settingsButton")?.addEventListener("pointerdown",event=>{if(!isGameRunning())return;event.preventDefault();event.stopImmediatePropagation();open(event);},true);
    window.webminecraftPause={open,close,isOpen:()=>paused};
}

function setupSeedBackButton(){
    const button=document.getElementById("backSeedButton");if(!button||button.dataset.backHookInstalled)return;button.dataset.backHookInstalled="1";
    button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();if(seedMenu){seedMenu.style.display="none";seedMenu.setAttribute("aria-hidden","true");}if(menu)menu.style.display="flex";window.setTimeout(()=>window.location.reload(),80);});
}

function createVersionPicker(){
    if(document.getElementById("gameVersionPicker"))return;
    const style=document.createElement("style");style.id="gameVersionStyles";style.textContent=`#gameVersionButton{position:fixed;right:10px;bottom:8px;min-width:88px;height:34px;padding:5px 10px;border:2px solid #111;border-top-color:#9a9a9a;border-left-color:#9a9a9a;background:linear-gradient(#666,#4d4d4d);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;cursor:pointer;z-index:97;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),0 2px 0 rgba(0,0,0,.7)}#gameVersionPicker{position:fixed;right:10px;bottom:48px;width:160px;padding:6px;background:#191919;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.55);z-index:97;display:none}.gameVersionOption{display:block;width:100%;min-height:34px;margin:3px 0;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#3d3d3d;color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-align:left;padding:7px 9px;cursor:pointer;text-shadow:2px 2px 0 #111}.gameVersionOption.active{background:#5e5e5e}`;
    document.head.appendChild(style);
    const button=document.createElement("button");button.id="gameVersionButton";button.type="button";const picker=document.createElement("div");picker.id="gameVersionPicker";
    let current=VERSIONS.includes(localStorage.getItem(VERSION_KEY))?localStorage.getItem(VERSION_KEY):VERSIONS[0];
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
setupSeedBackButton();
createVersionPicker();

if(seedMenu){let cleared=false;const observer=new MutationObserver(()=>{const open=getComputedStyle(seedMenu).display!=="none";if(open&&!cleared){clearWorld();cleared=true;}else if(!open)cleared=false;});observer.observe(seedMenu,{attributes:true,attributeFilter:["style","class"]});}
