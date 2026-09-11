const ANNOUNCEMENT_DOC = "announcements/active";

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

function addStyles() {
    if (document.getElementById("siteAnnouncementStyles")) return;
    const style = document.createElement("style");
    style.id = "siteAnnouncementStyles";
    style.textContent = `
#siteAnnouncementOverlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#siteAnnouncement{width:min(620px,94vw);box-sizing:border-box;background:linear-gradient(#303030,#191919);border:2px solid #111;border-top-color:#888;border-left-color:#888;box-shadow:9px 9px 0 rgba(0,0,0,.45);color:#fff;font-family:Arial,sans-serif}
#siteAnnouncementHeader{padding:16px 18px;border-bottom:2px solid #111;background:#3b2928;font-family:MinecraftFont,monospace;font-size:20px;text-shadow:2px 2px 0 #000}
#siteAnnouncementReason{padding:16px 18px 5px;font-family:MinecraftFont,monospace;font-size:13px;color:#b8dc95}
#siteAnnouncementMessage{padding:5px 18px 18px;font-size:15px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
#siteAnnouncementClose{display:block;margin:0 18px 18px;width:calc(100% - 36px);min-height:44px;padding:8px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#666,#4e4e4e);color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
#siteAnnouncementClose:disabled{opacity:.55;cursor:not-allowed;filter:none}
#siteAnnouncementClose:hover:not(:disabled){filter:brightness(1.1)}
`;
    document.head.appendChild(style);
}

function showAnnouncement(data) {
    const reason = String(data?.reason || "Announcement").trim();
    const message = String(data?.message || "").trim();
    if (!message) return;

    addStyles();
    document.getElementById("siteAnnouncementOverlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "siteAnnouncementOverlay";
    overlay.innerHTML = `
<div id="siteAnnouncement" role="dialog" aria-modal="true" aria-labelledby="siteAnnouncementHeader">
    <div id="siteAnnouncementHeader">Website Announcement</div>
    <div id="siteAnnouncementReason"></div>
    <div id="siteAnnouncementMessage"></div>
    <button id="siteAnnouncementClose" type="button" disabled>Please wait 5...</button>
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
        clearInterval(countdown);
        overlay.remove();
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay && !closeButton.disabled) {
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
