const ANNOUNCEMENT_DOC = "announcements/active";
const ANNOUNCEMENT_SEEN_KEY = "webminecraft_seen_announcement";

let firebaseReady = null;

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.firestore === "function") {
                    resolve(firebase);
                    return;
                }
            } catch {}
            if (Date.now() - started >= timeout) { resolve(null); return; }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

function getAnnouncementId(data) {
    const updatedAt = data?.updatedAt;
    let version = "";

    try {
        if (updatedAt && typeof updatedAt.toMillis === "function") {
            version = String(updatedAt.toMillis());
        } else if (updatedAt) {
            version = String(updatedAt);
        }
    } catch {}

    if (!version) {
        version = `${String(data?.reason || "").trim()}|${String(data?.message || "").trim()}`;
    }

    return version;
}

function hasSeenAnnouncement(data) {
    try {
        return localStorage.getItem(ANNOUNCEMENT_SEEN_KEY) === getAnnouncementId(data);
    } catch {
        return false;
    }
}

function markAnnouncementSeen(data) {
    try {
        localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, getAnnouncementId(data));
    } catch {}
}

function addStyles() {
    if (document.getElementById("siteAnnouncementStyles")) return;
    const style = document.createElement("style");
    style.id = "siteAnnouncementStyles";
    style.textContent = `
#siteAnnouncementOverlay{
    position:fixed;
    inset:0;
    z-index:1000;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
    box-sizing:border-box;
    background:rgba(0,0,0,.74);
    backdrop-filter:blur(4px);
    -webkit-backdrop-filter:blur(4px);
    animation:siteAnnouncementFade .16s ease-out;
}
#siteAnnouncement{
    width:min(700px,96vw);
    max-height:min(86vh,760px);
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    overflow:hidden;
    background:linear-gradient(180deg,#343434 0%,#252525 42%,#1b1b1b 100%);
    border:2px solid #111;
    border-top-color:#999;
    border-left-color:#999;
    border-radius:6px;
    box-shadow:0 18px 50px rgba(0,0,0,.72),0 4px 0 rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08);
    color:#fff;
    font-family:Arial,sans-serif;
    animation:siteAnnouncementPop .18s ease-out;
}
#siteAnnouncementHeader{
    flex:0 0 auto;
    position:relative;
    padding:17px 54px 15px 20px;
    border-bottom:2px solid #111;
    background:linear-gradient(180deg,#4a3735,#342625);
    font-family:MinecraftFont,monospace;
    font-size:clamp(17px,2.4vw,23px);
    letter-spacing:.2px;
    text-shadow:2px 2px 0 #000;
}
#siteAnnouncementHeader::before{
    content:"";
    position:absolute;
    left:20px;
    right:20px;
    bottom:-2px;
    height:2px;
    background:rgba(255,255,255,.08);
}
#siteAnnouncementReason{
    flex:0 0 auto;
    margin:0;
    padding:16px 20px 8px;
    color:#b9dc8f;
    font-family:MinecraftFont,monospace;
    font-size:13px;
    line-height:1.35;
    text-shadow:1px 1px 0 #111;
}
#siteAnnouncementReason::before{
    content:"• ";
    color:#d8efb4;
}
#siteAnnouncementMessage{
    flex:1 1 auto;
    min-height:0;
    margin:0 4px 0 0;
    padding:6px 20px 18px;
    overflow-y:auto;
    overflow-x:hidden;
    color:#ececec;
    font-size:15px;
    line-height:1.62;
    white-space:pre-wrap;
    overflow-wrap:anywhere;
    scrollbar-width:thin;
    scrollbar-color:#6f6f6f #202020;
}
#siteAnnouncementMessage::-webkit-scrollbar{width:11px}
#siteAnnouncementMessage::-webkit-scrollbar-track{background:#202020;border-left:1px solid #111}
#siteAnnouncementMessage::-webkit-scrollbar-thumb{background:#666;border:2px solid #202020;border-radius:6px}
#siteAnnouncementMessage::-webkit-scrollbar-thumb:hover{background:#7b7b7b}
#siteAnnouncementFooter{
    flex:0 0 auto;
    display:flex;
    justify-content:flex-end;
    padding:12px 18px 16px;
    border-top:2px solid #111;
    background:#222;
}
#siteAnnouncementClose{
    width:min(190px,100%);
    min-height:46px;
    padding:9px 14px;
    border:2px solid #111;
    border-top-color:#999;
    border-left-color:#999;
    border-radius:3px;
    background:linear-gradient(#707070,#555);
    color:#fff;
    font-family:MinecraftFont,monospace;
    font-size:12px;
    cursor:pointer;
    text-shadow:2px 2px 0 #222;
    box-shadow:inset 1px 1px 0 rgba(255,255,255,.12),inset -2px -2px 0 rgba(0,0,0,.25),0 3px 0 rgba(0,0,0,.45);
}
#siteAnnouncementClose:not(:disabled):hover{filter:brightness(1.1)}
#siteAnnouncementClose:not(:disabled):active{transform:translateY(2px);box-shadow:inset 1px 1px 0 rgba(0,0,0,.25)}
#siteAnnouncementClose:disabled{opacity:.62;cursor:not-allowed}
@keyframes siteAnnouncementFade{from{opacity:0}to{opacity:1}}
@keyframes siteAnnouncementPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
@media(max-width:600px){
    #siteAnnouncementOverlay{padding:10px}
    #siteAnnouncement{width:100%;max-height:92vh;border-radius:4px}
    #siteAnnouncementHeader{padding:15px 16px 13px}
    #siteAnnouncementReason{padding:14px 16px 7px;font-size:12px}
    #siteAnnouncementMessage{padding:6px 16px 14px;font-size:14px;line-height:1.55}
    #siteAnnouncementFooter{padding:10px 12px 12px}
    #siteAnnouncementClose{width:100%}
}
`;
    document.head.appendChild(style);
}

function showAnnouncement(data) {
    const reason = String(data?.reason || "Announcement").trim();
    const message = String(data?.message || "").trim();
    if (!message || hasSeenAnnouncement(data)) return;

    addStyles();
    document.getElementById("siteAnnouncementOverlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "siteAnnouncementOverlay";
    overlay.innerHTML = `
<div id="siteAnnouncement" role="dialog" aria-modal="true" aria-labelledby="siteAnnouncementHeader">
    <div id="siteAnnouncementHeader">Website Announcement</div>
    <div id="siteAnnouncementReason"></div>
    <div id="siteAnnouncementMessage"></div>
    <div id="siteAnnouncementFooter"><button id="siteAnnouncementClose" type="button" disabled>Please wait 5...</button></div>
</div>`;
    overlay.querySelector("#siteAnnouncementReason").textContent = reason;
    overlay.querySelector("#siteAnnouncementMessage").textContent = message;

    const closeButton = overlay.querySelector("#siteAnnouncementClose");
    let seconds = 5;

    const countdown = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            closeButton.textContent = `Please wait ${seconds}...`;
        } else {
            clearInterval(countdown);
            closeButton.disabled = false;
            closeButton.textContent = "Got it";
        }
    }, 1000);

    closeButton.addEventListener("click", () => {
        if (closeButton.disabled) return;
        markAnnouncementSeen(data);
        clearInterval(countdown);
        overlay.remove();
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay && !closeButton.disabled) {
            markAnnouncementSeen(data);
            clearInterval(countdown);
            overlay.remove();
        }
    });

    document.body.appendChild(overlay);
}

async function loadAnnouncement() {
    const firebase = await waitForFirebase();
    const db = firebase?.firestore?.();
    if (!db) return;
    try {
        const snapshot = await db.collection("announcements").doc("active").get();
        if (snapshot.exists && snapshot.data()?.active !== false) showAnnouncement(snapshot.data());
    } catch (error) {
        console.warn("Could not load website announcement:", error);
    }
}

function init() {
    loadAnnouncement();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
