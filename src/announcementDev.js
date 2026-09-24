const DEV_EMAIL = "worthmarcus19@gmail.com";
const ANNOUNCEMENT_COLLECTION = "announcements";
const NEWS_COLLECTION = "news";

let firebaseReady = null;
let announcementPanel = null;
let newsPanel = null;
let newsUnsubscribe = null;

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

function setNewsStatus(text, error = false) {
    const el = newsPanel?.querySelector("#devNewsStatus");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = error ? "#e38a7b" : "#9fce72";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function injectStyles() {
    if (document.getElementById("devAnnouncementStyles")) return;
    const style = document.createElement("style");
    style.id = "devAnnouncementStyles";
    style.textContent = `
#devAnnouncementPanel,#devNewsPanel{display:flex;flex-direction:column;gap:9px}
#devAnnouncementPanel label,#devNewsPanel label{font-size:11px;color:#aaa}
#devAnnouncementReason,#devAnnouncementMessage,#devNewsVersion,#devNewsTitle,#devNewsMessage{width:100%;box-sizing:border-box;background:#171717;color:#fff;border:1px solid #4a4a4a;border-top-color:#111;border-left-color:#111;padding:9px;font:12px Arial,sans-serif;outline:none}
#devAnnouncementReason{height:38px}#devAnnouncementMessage{min-height:110px;resize:vertical;line-height:1.4}
#devNewsVersion,#devNewsTitle{height:38px}#devNewsMessage{min-height:120px;resize:vertical;line-height:1.45}
#devAnnouncementReason:focus,#devAnnouncementMessage:focus,#devNewsVersion:focus,#devNewsTitle:focus,#devNewsMessage:focus{border-color:#84ad5e}
#devAnnouncementStatus,#devNewsStatus{min-height:16px;font-size:11px;color:#999}
#devNewsList{display:flex;flex-direction:column;gap:7px;max-height:300px;overflow:auto;margin-top:4px}
.devNewsItem{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:7px;padding:9px;background:#171717;border:1px solid #414141}
.devNewsInfo{min-width:0}.devNewsItemVersion{color:#9dcc76;font-family:MinecraftFont,monospace;font-size:10px}.devNewsItemTitle{margin-top:3px;color:#fff;font-weight:700;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.devNewsItemPreview{margin-top:3px;color:#888;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.devNewsEdit,.devNewsDelete{min-height:32px;padding:6px 9px;border:1px solid #111;color:#fff;cursor:pointer;font-size:10px}.devNewsEdit{background:#505e70}.devNewsDelete{background:#633f3b}.devNewsEdit:hover,.devNewsDelete:hover{filter:brightness(1.1)}
@media(max-width:650px){.devNewsItem{grid-template-columns:1fr 1fr}.devNewsInfo{grid-column:1/-1}.devNewsEdit,.devNewsDelete{width:100%}}
`;
    document.head.appendChild(style);
}

function allowNormalTyping(field) {
    field.addEventListener("keydown", event => {
        if (event.key === " ") event.stopPropagation();
    }, true);
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

    allowNormalTyping(section.querySelector("#devAnnouncementReason"));
    allowNormalTyping(section.querySelector("#devAnnouncementMessage"));

    section.querySelector("#devPublishAnnouncement").addEventListener("click", publishAnnouncement);
    section.querySelector("#devClearAnnouncement").addEventListener("click", clearAnnouncement);
}

function createNewsSection() {
    if (newsPanel) return;
    const body = document.getElementById("devControlsBody");
    if (!body) return;

    injectStyles();
    const section = document.createElement("section");
    section.className = "devSection";
    section.innerHTML = `
<h3>News Tabs</h3>
<p class="devHint">Create, edit, and delete the tabs that appear in the News screen. These news tabs are stored in Firestore and are visible to everyone.</p>
<div id="devNewsPanel">
    <label for="devNewsVersion">Version / label</label>
    <input id="devNewsVersion" maxlength="60" placeholder="Example: LATEST • Update">
    <label for="devNewsTitle">Tab title</label>
    <input id="devNewsTitle" maxlength="100" placeholder="Example: New TNT Optimization">
    <label for="devNewsMessage">News content</label>
    <textarea id="devNewsMessage" maxlength="6000" placeholder="Write the full news post here..."></textarea>
    <div class="devGrid"><button id="devCreateNews" class="devButton good" type="button">Create News Tab</button><button id="devCancelNews" class="devButton" type="button" style="display:none">Cancel Edit</button></div>
    <div id="devNewsStatus"></div>
    <div id="devNewsList"><div class="devHint">Open Developer Controls to load news tabs.</div></div>
</div>`;
    const announcement = body.querySelector("#devAnnouncementPanel")?.closest("section");
    body.insertBefore(section, announcement?.nextSibling || body.querySelector("#devControlsStatus") || null);
    newsPanel = section;

    for (const id of ["devNewsVersion", "devNewsTitle", "devNewsMessage"]) allowNormalTyping(section.querySelector(`#${id}`));

    section.querySelector("#devCreateNews").addEventListener("click", saveNewsTab);
    section.querySelector("#devCancelNews").addEventListener("click", resetNewsEditor);
    loadNewsTabs();
}

function resetNewsEditor() {
    if (!newsPanel) return;
    newsPanel.dataset.editingId = "";
    newsPanel.querySelector("#devNewsVersion").value = "";
    newsPanel.querySelector("#devNewsTitle").value = "";
    newsPanel.querySelector("#devNewsMessage").value = "";
    newsPanel.querySelector("#devCreateNews").textContent = "Create News Tab";
    newsPanel.querySelector("#devCancelNews").style.display = "none";
}

async function saveNewsTab() {
    const { firebase, user } = await getDevUser();
    if (!user) return setNewsStatus("Developer access denied.", true);
    const db = firebase?.firestore?.();
    if (!db) return setNewsStatus("Firebase is not ready yet.", true);
    const version = newsPanel.querySelector("#devNewsVersion").value.trim();
    const title = newsPanel.querySelector("#devNewsTitle").value.trim();
    const message = newsPanel.querySelector("#devNewsMessage").value.trim();
    if (!version) return setNewsStatus("Enter a version / label.", true);
    if (!title) return setNewsStatus("Enter a tab title.", true);
    if (!message) return setNewsStatus("Enter the news content.", true);

    try {
        const editingId = newsPanel.dataset.editingId || "";
        const data = { version, title, body: message, updatedAt: new Date(), updatedBy: user.email, active: true };
        if (editingId) {
            await db.collection(NEWS_COLLECTION).doc(editingId).set(data, { merge: true });
            setNewsStatus("News tab updated.");
        } else {
            await db.collection(NEWS_COLLECTION).add({ ...data, createdAt: new Date() });
            setNewsStatus("News tab created.");
        }
        resetNewsEditor();
        await loadNewsTabs();
    } catch (error) {
        console.error("News tab save failed:", error);
        setNewsStatus(error?.message || "Could not save news tab. Check Firestore rules.", true);
    }
}

async function loadNewsTabs() {
    const { firebase, user } = await getDevUser();
    if (!user || !newsPanel) return;
    const db = firebase?.firestore?.();
    const list = newsPanel.querySelector("#devNewsList");
    if (!db || !list) return;
    try {
        const snapshot = await db.collection(NEWS_COLLECTION).orderBy("updatedAt", "desc").get();
        list.innerHTML = "";
        if (snapshot.empty) {
            list.innerHTML = '<div class="devHint">No custom news tabs yet.</div>';
            return;
        }
        snapshot.docs.forEach(doc => {
            const data = doc.data() || {};
            const row = document.createElement("div");
            row.className = "devNewsItem";
            row.innerHTML = `<div class="devNewsInfo"><div class="devNewsItemVersion">${escapeHtml(data.version || "NEWS")}</div><div class="devNewsItemTitle">${escapeHtml(data.title || "Untitled")}</div><div class="devNewsItemPreview">${escapeHtml(String(data.body || "").replace(/\s+/g, " "))}</div></div><button class="devNewsEdit" type="button">Edit</button><button class="devNewsDelete" type="button">Delete</button>`;
            row.querySelector(".devNewsEdit").addEventListener("click", () => editNewsTab(doc.id, data));
            row.querySelector(".devNewsDelete").addEventListener("click", () => deleteNewsTab(doc.id, data.title || "this news tab"));
            list.appendChild(row);
        });
    } catch (error) {
        console.error("News tab load failed:", error);
        list.innerHTML = '<div class="devHint">Could not load news tabs. Check Firestore rules.</div>';
    }
}

function editNewsTab(id, data) {
    if (!newsPanel) return;
    newsPanel.dataset.editingId = id;
    newsPanel.querySelector("#devNewsVersion").value = data.version || "";
    newsPanel.querySelector("#devNewsTitle").value = data.title || "";
    newsPanel.querySelector("#devNewsMessage").value = data.body || "";
    newsPanel.querySelector("#devCreateNews").textContent = "Save News Tab";
    newsPanel.querySelector("#devCancelNews").style.display = "block";
    newsPanel.querySelector("#devNewsVersion").focus();
}

async function deleteNewsTab(id, title) {
    const { firebase, user } = await getDevUser();
    if (!user) return setNewsStatus("Developer access denied.", true);
    if (!confirm(`Delete “${title}” from News? This cannot be undone.`)) return;
    try {
        await firebase.firestore().collection(NEWS_COLLECTION).doc(id).delete();
        setNewsStatus("News tab deleted.");
        await loadNewsTabs();
        resetNewsEditor();
    } catch (error) {
        console.error("News tab delete failed:", error);
        setNewsStatus(error?.message || "Could not delete news tab.", true);
    }
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
    createNewsSection();
    if (announcementPanel && newsPanel) return;
    const observer = new MutationObserver(() => {
        createAnnouncementSection();
        createNewsSection();
        if (announcementPanel && newsPanel) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

watchForDevPanel();
