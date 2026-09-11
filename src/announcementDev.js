const DEV_EMAIL = "worthmarcus19@gmail.com";
const ANNOUNCEMENT_COLLECTION = "announcements";

let firebaseReady = null;
let announcementPanel = null;

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.auth === "function" && typeof firebase.firestore === "function") {
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

async function getDevUser() {
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL) return { firebase, user: null };
    return { firebase, user };
}

function setStatus(text, error = false) {
    const el = announcementPanel?.querySelector("#devAnnouncementStatus");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = error ? "#e38a7b" : "#9fce72";
}

function injectStyles() {
    if (document.getElementById("devAnnouncementStyles")) return;
    const style = document.createElement("style");
    style.id = "devAnnouncementStyles";
    style.textContent = `
#devAnnouncementPanel{display:flex;flex-direction:column;gap:9px}
#devAnnouncementPanel label{font-size:11px;color:#aaa}
#devAnnouncementReason,#devAnnouncementMessage{width:100%;box-sizing:border-box;background:#171717;color:#fff;border:1px solid #4a4a4a;border-top-color:#111;border-left-color:#111;padding:9px;font:12px Arial,sans-serif;outline:none}
#devAnnouncementReason{height:38px}#devAnnouncementMessage{min-height:110px;resize:vertical;line-height:1.4}
#devAnnouncementReason:focus,#devAnnouncementMessage:focus{border-color:#84ad5e}
#devAnnouncementStatus{min-height:16px;font-size:11px;color:#999}
`;
    document.head.appendChild(style);
}

function createAnnouncementSection() {
    if (announcementPanel) return;
    const body = document.getElementById("devControlsBody");
    if (!body) return;

    injectStyles();
    const section = document.createElement("section");
    section.className = "devSection";
    section.innerHTML = `
<h3>Website Announcements</h3>
<p class="devHint">Publish one announcement that appears to everyone when they open the website. Enter the reason and exactly what you want players to see.</p>
<div id="devAnnouncementPanel">
    <label for="devAnnouncementReason">Reason / title</label>
    <input id="devAnnouncementReason" maxlength="100" placeholder="Example: New update">
    <label for="devAnnouncementMessage">What should it say?</label>
    <textarea id="devAnnouncementMessage" maxlength="2000" placeholder="Write the announcement here..."></textarea>
    <div class="devGrid"><button id="devPublishAnnouncement" class="devButton good" type="button">Publish Announcement</button><button id="devClearAnnouncement" class="devButton danger" type="button">Clear Announcement</button></div>
    <div id="devAnnouncementStatus"></div>
</div>`;
    body.insertBefore(section, body.querySelector("#devControlsStatus") || null);
    announcementPanel = section;

    section.querySelector("#devPublishAnnouncement").addEventListener("click", publishAnnouncement);
    section.querySelector("#devClearAnnouncement").addEventListener("click", clearAnnouncement);
}

async function publishAnnouncement() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const reason = announcementPanel.querySelector("#devAnnouncementReason").value.trim();
    const message = announcementPanel.querySelector("#devAnnouncementMessage").value.trim();
    if (!reason) return setStatus("Enter a reason/title first.", true);
    if (!message) return setStatus("Enter an announcement message first.", true);

    try {
        await firebase.firestore().collection(ANNOUNCEMENT_COLLECTION).doc("active").set({
            active: true,
            reason,
            message,
            updatedAt: new Date(),
            updatedBy: user.email,
        });
        setStatus("Announcement published. Everyone will see it on their next website load.");
    } catch (error) {
        console.error("Announcement publish failed:", error);
        setStatus("Could not publish announcement. Check Firestore rules.", true);
    }
}

async function clearAnnouncement() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    if (!confirm("Clear the current website announcement?")) return;
    try {
        await firebase.firestore().collection(ANNOUNCEMENT_COLLECTION).doc("active").set({
            active: false,
            updatedAt: new Date(),
            updatedBy: user.email,
        }, { merge: true });
        setStatus("Announcement cleared. New visitors will no longer see it.");
    } catch (error) {
        console.error("Announcement clear failed:", error);
        setStatus("Could not clear announcement. Check Firestore rules.", true);
    }
}

function watchForDevPanel() {
    createAnnouncementSection();
    if (announcementPanel) return;
    const observer = new MutationObserver(() => {
        createAnnouncementSection();
        if (announcementPanel) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

watchForDevPanel();
