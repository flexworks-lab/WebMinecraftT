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
    `;
    document.head.appendChild(style);
}

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
        if(index===0)showItem(item);
    });
    const closeNews=()=>{center.style.display="none";center.setAttribute("aria-hidden","true");};
    const openNews=event=>{event?.preventDefault();event?.stopPropagation();center.style.display="block";center.setAttribute("aria-hidden","false");setNewsUnread(false);list.scrollTop=0;};
    button.addEventListener("click",openNews);
    center.querySelector("#newsClose").addEventListener("click",closeNews);
    document.addEventListener("keydown",event=>{if(event.code!=="Escape")return;if(center.style.display==="block")closeNews();},true);
    setNewsUnread(!hasNewsBeenSeen());
}

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
        "#pauseSide{min-width:0;min-height:0;padding:clamp(28px,5vh,50px) clamp(22px,3vw,42px);box-sizing:border-box;background:linear-gradient(180deg,#252a26,#1a1f1b);border-left:2px solid #111;box-shadow:inset 2px 0 0 rgba(255,255,255,.04)}",
        "#pauseSideHeader{padding-bottom:16px;border-bottom:2px solid #101310}#pauseSideTitle{margin:0;font-family:Arial Black,Arial,sans-serif;font-size:24px;text-shadow:3px 3px 0 #111}#pauseSideSubtitle{margin:7px 0 0;color:#9ea79f;font-size:11px;line-height:1.45}",
        ".pauseInfoCard{margin-top:14px;padding:13px;background:#202520;border:2px solid #101310;border-top-color:#687166;border-left-color:#687166;box-shadow:3px 3px 0 rgba(0,0,0,.3)}.pauseInfoLabel{color:#8f9b90;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px}.pauseInfoValue{margin-top:5px;color:#fff;font-family:Arial Black,Arial,sans-serif;font-size:14px;line-height:1.4;overflow-wrap:anywhere;text-shadow:1px 1px 0 #111}.pauseMeta{margin-top:8px;color:#afb7b0;font-size:10px;line-height:1.6}",
        "#pauseMembersWrap{margin-top:18px;min-height:0;display:flex;flex-direction:column}#pauseMembersHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}#pauseMembersTitle{margin:0;font-family:Arial Black,Arial,sans-serif;font-size:15px;text-shadow:2px 2px 0 #111}#pauseMemberCount{padding:4px 7px;background:#303730;border:1px solid #525d51;color:#b9c9b1;font:bold 9px Arial,sans-serif}",
        "#pauseMembers{min-height:0;max-height:34vh;overflow-y:auto;display:grid;gap:7px;padding-right:3px;scrollbar-width:thin;scrollbar-color:#687166 #141814}.pauseMember{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;padding:9px 10px;background:#202520;border:1px solid #3d463e}.pauseMemberName{min-width:0;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pauseMemberRole{display:block;margin-top:2px;color:#89938a;font-size:9px}",
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
        "<div id=\"pauseMembers\"></div><button id=\"pauseInviteAll\" class=\"pauseInvite\" type=\"button\">Invite Players</button><div id=\"pauseInviteStatus\" aria-live=\"polite\"></div></section></aside></div>"
    ].join("");
    document.body.appendChild(overlay);
    const isGameRunning=()=>Boolean(menu&&menu.style.display==="none"); let paused=false;
    const getRoomInfo=()=>{const mp=window.__webminecraftMultiplayerRoomInfo||{};return {active:Boolean(window.__webminecraftMultiplayerActive),room:String(mp.room||window.__webminecraftMultiplayerRoom||""),server:String(mp.serverName||window.__webminecraftMultiplayerServerName||""),private:Boolean(mp.private),mode:String(window.__webminecraftMultiplayerMode||"survival"),seed:getWorldSeed()};};
    const getMembers=()=>{const localName=localStorage.getItem("webminecraft-player-name")||"Player";const remotes=typeof window.__webminecraftGetRemotePlayers==="function"?window.__webminecraftGetRemotePlayers():new Map();const members=[{id:"local",name:localName,role:"You"}];if(remotes instanceof Map){for(const [id,player] of remotes)members.push({id:String(id),name:String(player?.name||"Player"),role:"Player"});}return members;};
    const makeInvite=()=>{window.__webminecraftOpenGameInvitePicker?.();};
    const renderSide=()=>{const info=getRoomInfo();const members=getMembers();const worldInfo=overlay.querySelector("#pauseWorldInfo"),membersEl=overlay.querySelector("#pauseMembers"),count=overlay.querySelector("#pauseMemberCount"),title=overlay.querySelector("#pauseSideTitle"),subtitle=overlay.querySelector("#pauseSideSubtitle");title.textContent=info.active?(info.room||"Multiplayer World"):"World";subtitle.textContent=info.active?"Server · "+(info.server||"WebMinecraft server"):"Singleplayer world";worldInfo.innerHTML="<div class=\"pauseInfoCard\"><div class=\"pauseInfoLabel\">Game Mode</div><div class=\"pauseInfoValue\">"+(info.mode==="creative"?"Creative":"Survival")+"</div><div class=\"pauseMeta\">Seed: "+escapeHtml(info.seed)+"</div></div>"+(info.active?"<div class=\"pauseInfoCard\"><div class=\"pauseInfoLabel\">Server</div><div class=\"pauseInfoValue\">"+escapeHtml(info.server||"WebMinecraft Server")+"</div><div class=\"pauseMeta\">"+(info.private?"Private room":"Public room")+"</div></div>":"");count.textContent=String(members.length);membersEl.innerHTML="";for(const member of members){const row=document.createElement("div");row.className="pauseMember";row.innerHTML="<div><div class=\"pauseMemberName\">"+escapeHtml(member.name)+"</div><span class=\"pauseMemberRole\">"+escapeHtml(member.role)+"</span></div>";if(member.role!=="You"){const invite=document.createElement("button");invite.type="button";invite.className="pauseInvite";invite.textContent="Invite";invite.addEventListener("click",makeInvite);row.appendChild(invite);}membersEl.appendChild(row);}};
    const close=event=>{event?.preventDefault();event?.stopPropagation();paused=false;overlay.classList.remove("pauseOpen");overlay.setAttribute("aria-hidden","true");if(isGameRunning()&&!window.__webminecraftHasOpenMenu?.())document.body.requestPointerLock?.();};
    const open=event=>{event?.preventDefault();event?.stopPropagation();if(!isGameRunning())return;paused=true;renderSide();overlay.classList.add("pauseOpen");overlay.setAttribute("aria-hidden","false");document.exitPointerLock?.();overlay.querySelector("#pauseResume").focus();};
    overlay.querySelector("#pauseResume").addEventListener("click",close);
    overlay.querySelector("#pauseSettings").addEventListener("click",event=>{event.preventDefault();event.stopPropagation();overlay.classList.remove("pauseOpen");overlay.setAttribute("aria-hidden","true");paused=false;if(settingsMenu){settingsMenu.style.display="flex";document.exitPointerLock?.();}});
    overlay.querySelector("#pauseInviteAll").addEventListener("click",makeInvite);
    overlay.querySelector("#pauseQuit").addEventListener("click",()=>{const saveAndReturn=async()=>{try{await window.webminecraftSaveCurrentWorld?.({ skipCloud:true, skipPreview:true });}catch{}window.location.reload();};void saveAndReturn();});
    const refreshMembers=()=>{if(paused)renderSide();};
    window.addEventListener("webminecraft:multiplayer-player-joined",refreshMembers);window.addEventListener("webminecraft:multiplayer-player-left",refreshMembers);window.addEventListener("webminecraft:multiplayer-state-changed",refreshMembers);
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
setupSeedBackButton();
createVersionPicker();

if(seedMenu){let cleared=false;const observer=new MutationObserver(()=>{const open=getComputedStyle(seedMenu).display!=="none";if(open&&!cleared){clearWorld();cleared=true;}else if(!open)cleared=false;});observer.observe(seedMenu,{attributes:true,attributeFilter:["style","class"]});}