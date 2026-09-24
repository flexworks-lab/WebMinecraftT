const b="webminecraft_seen_announcement",h=`WebMinecraftT Patch Notes

WORLD SAVES
• Separate world saves keep each world’s block data independent.
• Saved worlds keep their names, seeds, creation dates, and updated data.
• World seed links make it easier to share and reopen generated worlds.
• World loading and deletion behavior has been improved to keep saves consistent.

GAMEPLAY
• Added a full world creation/opening screen for entering and sharing seeds.
• Added Copy Seed and Copy World Link tools.
• Improved spawning and generated-world consistency.
• Added pause, settings, mobile mode, and return-to-menu controls.

WORLD & BLOCKS
• Seed-based terrain generation is used for repeatable worlds.
• Terrain, caves, biomes, trees, water, and spawn locations are tied to the world seed.
• Block interaction and world updates have been improved for smoother gameplay.

WATER
• Improved flowing-water behavior with source creation, falling water, horizontal flow, and retraction.
• Water simulation is queue-based and limits work per update to reduce lag.
• Water rendering and transparency were improved.
• Water textures now use Minecraft-style filtering and continuous world UVs.

TNT & PERFORMANCE
• TNT behavior has been optimized to reduce freezes when explosions happen.
• Explosion block updates are processed together to reduce repeated rendering work.
• Performance systems now limit expensive world and water updates per frame.

VISUALS & TEXTURES
• Block textures and lighting were improved for a darker Minecraft-style look.
• Underground lighting and fog transition more naturally with depth.
• Shadows, render quality, brightness, and lighting quality can be adjusted in Settings.
• Water and world materials received visual cleanup.

CLOUDS & SKY
• Added larger, more visible block-style clouds.
• Cloud shapes and placement are randomized for a less repetitive sky.
• Added a glowing square sun positioned high in the sky.
• Sky and underground color transitions were improved.

PLAYER & MOVEMENT
• Movement, camera handling, spawning, and controls have been polished.
• Desktop pointer-lock behavior is handled more reliably.
• Added mobile-friendly movement controls and Mobile Mode.

MOBILE
• Added touch-friendly controls for smaller screens.
• Added a hybrid joystick layout for movement.
• Mobile UI positioning was improved for phones and tablets.
• Crosshair, hotbar, and in-world UI visibility are handled more cleanly.

CHAT
• Desktop chat can be triggered with `/`.
• Chat messages can remain visible in the top-left without constantly opening the full chat.
• Full-screen chat was improved for desktop and mobile.
• Chat visibility and input behavior were cleaned up.

MULTIPLAYER
• Added multiplayer server and room support.
• Added public and private server options.
• Added server names, private codes, player names, and server lists.
• Shared block changes can sync between players.
• Multiplayer chat supports join messages and player communication.
• Multiplayer systems continue to receive performance and stability improvements.

UI & MENUS
• Main menu has been redesigned with a more Minecraft-like appearance.
• News is now a dedicated button with a scrollable News & Updates center.
• Website announcements use a larger title/reason layout and scrollable messages.
• Friends has its own button beside News.
• Settings uses a full-screen, scrollable layout with graphics and performance controls.

SOCIAL & ACCOUNTS
• Added account and friend-system groundwork.
• Friends and player presence features can be accessed from the main menu.
• Developer/account controls are separated from normal player UI.

NEWS & UPDATES
• Added a dedicated News Center for update notes.
• News entries open into a larger details view.
• Website announcements can be delivered separately from normal update notes.
• This patch adds the complete patch notes to the News Center.

BUG FIXES & TECHNICAL IMPROVEMENTS
• Fixed and improved world-save persistence and loading.
• Improved UI visibility when entering and leaving worlds.
• Improved mobile/desktop control switching.
• Reduced unnecessary work during world updates.
• Improved rendering, lighting, water, and multiplayer stability.

Thanks for playing WebMinecraftT!`;let s=null;function x(e=15e3){return s||(s=new Promise(o=>{const n=Date.now(),t=()=>{try{const a=window.firebase;if(a&&typeof a.firestore=="function"){o(a);return}}catch{}if(Date.now()-n>=e){o(null);return}setTimeout(t,100)};t()}),s)}function g(e){const o=e?.updatedAt;let n="";try{o&&typeof o.toMillis=="function"?n=String(o.toMillis()):o&&(n=String(o))}catch{}return n||(n=`${String(e?.reason||"").trim()}|${String(e?.message||"").trim()}`),n}function w(e){try{return localStorage.getItem(b)===g(e)}catch{return!1}}function u(e){try{localStorage.setItem(b,g(e))}catch{}}function y(){if(document.getElementById("siteAnnouncementStyles"))return;const e=document.createElement("style");e.id="siteAnnouncementStyles",e.textContent=`
#siteAnnouncementOverlay{
    position:fixed;
    inset:0;
    z-index:1000;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
    box-sizing:border-box;
    background:rgba(0,0,0,.76);
    backdrop-filter:blur(5px);
    -webkit-backdrop-filter:blur(5px);
    animation:siteAnnouncementFade .16s ease-out;
}
#siteAnnouncement{
    width:min(760px,96vw);
    max-height:min(88vh,820px);
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    overflow:hidden;
    background:linear-gradient(180deg,#3a3a3a 0%,#282828 38%,#1b1b1b 100%);
    border:2px solid #101010;
    border-top-color:#aaa;
    border-left-color:#aaa;
    border-radius:7px;
    box-shadow:0 24px 70px rgba(0,0,0,.8),0 5px 0 rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.1);
    color:#fff;
    font-family:Arial,sans-serif;
    animation:siteAnnouncementPop .18s ease-out;
}
#siteAnnouncementHeader{
    flex:0 0 auto;
    position:relative;
    padding:20px 24px 17px;
    border-bottom:2px solid #111;
    background:linear-gradient(180deg,#51403d,#372827);
    font-family:MinecraftFont,monospace;
    font-size:clamp(22px,3vw,32px);
    line-height:1.05;
    letter-spacing:.4px;
    text-shadow:3px 3px 0 #000,0 0 10px rgba(255,255,255,.08);
}
#siteAnnouncementHeader::after{
    content:"";
    position:absolute;
    left:24px;
    right:24px;
    bottom:-2px;
    height:2px;
    background:rgba(255,255,255,.1);
}
#siteAnnouncementReason{
    flex:0 0 auto;
    margin:0;
    padding:22px 24px 9px;
    color:#d4efae;
    font-family:MinecraftFont,monospace;
    font-size:clamp(18px,2.5vw,27px);
    font-weight:700;
    line-height:1.2;
    letter-spacing:.3px;
    text-shadow:2px 2px 0 #111;
}
#siteAnnouncementReason::before{
    content:"• ";
    color:#efffcf;
}
#siteAnnouncementMessage{
    flex:1 1 auto;
    min-height:0;
    margin:0 5px 0 0;
    padding:8px 24px 20px;
    overflow-y:auto;
    overflow-x:hidden;
    color:#eeeeee;
    font-size:16px;
    line-height:1.7;
    white-space:pre-wrap;
    overflow-wrap:anywhere;
    scrollbar-width:thin;
    scrollbar-color:#737373 #1e1e1e;
}
#siteAnnouncementMessage::-webkit-scrollbar{width:12px}
#siteAnnouncementMessage::-webkit-scrollbar-track{background:#1d1d1d;border-left:1px solid #101010}
#siteAnnouncementMessage::-webkit-scrollbar-thumb{background:#707070;border:2px solid #1d1d1d;border-radius:7px}
#siteAnnouncementMessage::-webkit-scrollbar-thumb:hover{background:#858585}
#siteAnnouncementFooter{
    flex:0 0 auto;
    display:flex;
    justify-content:flex-end;
    padding:13px 22px 17px;
    border-top:2px solid #111;
    background:linear-gradient(180deg,#292929,#222);
}
#siteAnnouncementClose{
    width:min(200px,100%);
    min-height:48px;
    padding:10px 16px;
    border:2px solid #111;
    border-top-color:#aaa;
    border-left-color:#aaa;
    border-radius:3px;
    background:linear-gradient(#777,#555);
    color:#fff;
    font-family:MinecraftFont,monospace;
    font-size:13px;
    cursor:pointer;
    text-shadow:2px 2px 0 #222;
    box-shadow:inset 1px 1px 0 rgba(255,255,255,.14),inset -2px -2px 0 rgba(0,0,0,.28),0 3px 0 rgba(0,0,0,.45);
}
#siteAnnouncementClose:not(:disabled):hover{filter:brightness(1.1)}
#siteAnnouncementClose:not(:disabled):active{transform:translateY(2px);box-shadow:inset 1px 1px 0 rgba(0,0,0,.25)}
#siteAnnouncementClose:disabled{opacity:.62;cursor:not-allowed}
@keyframes siteAnnouncementFade{from{opacity:0}to{opacity:1}}
@keyframes siteAnnouncementPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:600px){
    #siteAnnouncementOverlay{padding:9px}
    #siteAnnouncement{width:100%;max-height:94vh;border-radius:4px}
    #siteAnnouncementHeader{padding:17px 17px 14px;font-size:clamp(20px,7vw,27px)}
    #siteAnnouncementReason{padding:18px 17px 8px;font-size:clamp(17px,6vw,24px)}
    #siteAnnouncementMessage{padding:7px 17px 15px;font-size:14px;line-height:1.58}
    #siteAnnouncementFooter{padding:10px 12px 12px}
    #siteAnnouncementClose{width:100%}
}
`,document.head.appendChild(e)}function v(e){const o=String(e?.reason||"Announcement").trim(),n=String(e?.message||"").trim();if(!n||w(e))return;y(),document.getElementById("siteAnnouncementOverlay")?.remove();const t=document.createElement("div");t.id="siteAnnouncementOverlay",t.innerHTML=`
<div id="siteAnnouncement" role="dialog" aria-modal="true" aria-labelledby="siteAnnouncementHeader">
    <div id="siteAnnouncementHeader">Website Announcement</div>
    <div id="siteAnnouncementReason"></div>
    <div id="siteAnnouncementMessage"></div>
    <div id="siteAnnouncementFooter"><button id="siteAnnouncementClose" type="button" disabled>Please wait 5...</button></div>
</div>`,t.querySelector("#siteAnnouncementReason").textContent=o,t.querySelector("#siteAnnouncementMessage").textContent=n;const a=t.querySelector("#siteAnnouncementClose");let r=5;const i=setInterval(()=>{r--,r>0?a.textContent=`Please wait ${r}...`:(clearInterval(i),a.disabled=!1,a.textContent="Got it")},1e3);a.addEventListener("click",()=>{a.disabled||(u(e),clearInterval(i),t.remove())}),t.addEventListener("click",d=>{d.target===t&&!a.disabled&&(u(e),clearInterval(i),t.remove())}),document.body.appendChild(t)}function m(){const e=document.getElementById("newsList"),o=document.getElementById("newsCenter"),n=document.getElementById("newsDetails");if(!e||!o||!n||document.getElementById("fullPatchNotesNews"))return!!(e&&o&&n);const t=document.createElement("button");t.id="fullPatchNotesNews",t.className="newsItem",t.type="button";const a=document.createElement("div");a.className="newsItemVersion",a.textContent="LATEST • Patch Notes";const r=document.createElement("div");r.className="newsItemTitle",r.textContent="Full WebMinecraftT Patch Notes";const i=document.createElement("div");return i.className="newsItemBody",i.textContent="All major world, gameplay, water, TNT, visual, mobile, chat, multiplayer, UI, social, news, performance, and bug-fix updates in one entry.",t.append(a,r,i),t.addEventListener("click",d=>{d.stopPropagation();const l=n.querySelector("#newsDetailsVersion"),c=n.querySelector("#newsDetailsTitle"),p=n.querySelector("#newsDetailsBody");!l||!c||!p||(l.textContent=a.textContent,c.textContent=r.textContent,p.textContent=h,n.style.display="flex",n.setAttribute("aria-hidden","false"))}),e.prepend(t),!0}function A(){if(m())return;let e=0;const o=setInterval(()=>{e++,(m()||e>=150)&&clearInterval(o)},100)}async function k(){const o=(await x())?.firestore?.();if(o)try{const n=await o.collection("announcements").doc("active").get();n.exists&&n.data()?.active!==!1&&v(n.data())}catch(n){console.warn("Could not load website announcement:",n)}}function f(){A(),k()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",f,{once:!0}):f();
