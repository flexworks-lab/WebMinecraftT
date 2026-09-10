const DEV_EMAIL = "worthmarcus19@gmail.com";
const DISCUSSION_COLLECTION = "discussions";
const CHANNELS = ["bugs", "chat"];

let firebaseReady = null;
let panel = null;
let statusEl = null;
let messageList = null;
let maintenanceEnabled = false;
let maintenanceUnsubscribe = null;

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.auth === "function" && typeof firebase.firestore === "function") {
                    const db = firebase.firestore();
                    if (db && typeof db.collection === "function") {
                        resolve(firebase);
                        return;
                    }
                }
            } catch {}
            if (Date.now() - started >= timeout) { resolve(null); return; }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

function dbFor(firebase) {
    try { return firebase?.firestore?.() || null; } catch { return null; }
}

async function getDevUser() {
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL) return { firebase, user: null };
    return { firebase, user };
}

function setStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.style.color = error ? "#e38a7b" : "#9fce72";
}

function addStyles() {
    if (document.getElementById("devControlsStyles")) return;
    const style = document.createElement("style");
    style.id = "devControlsStyles";
    style.textContent = `
#devControlsButton{position:fixed;right:28px;bottom:82px;z-index:98;display:none;min-height:48px;padding:0 16px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:linear-gradient(#75504d,#5d3f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#devControlsButton:hover{filter:brightness(1.1)}
#devControlsModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:500;padding:20px;box-sizing:border-box}
#devControlsPanel{width:min(900px,96vw);height:min(760px,92vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#181818);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:9px 9px 0 rgba(0,0,0,.5);color:#fff;font-family:Arial,sans-serif;box-sizing:border-box}
#devControlsHeader{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:2px solid #0d0d0d;background:#3b2928}
#devControlsTitle{margin:0;font-family:MinecraftFont,monospace;font-size:23px;text-shadow:2px 2px 0 #000}
#devControlsClose{margin-left:auto;width:42px;height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#4c4c4c;color:#fff;font-size:20px;cursor:pointer}
#devControlsBody{flex:1;min-height:0;overflow:auto;padding:18px}
.devSection{margin-bottom:18px;padding:14px;background:#222;border:1px solid #414141}
.devSection h3{margin:0 0 10px;font-family:MinecraftFont,monospace;font-size:15px}
.devHint{color:#999;font-size:11px;line-height:1.45;margin:0 0 11px}
.devGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.devButton{min-height:42px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#666,#4e4e4e);color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
.devButton:hover{filter:brightness(1.1)}
.devButton.danger{background:linear-gradient(#7b4c48,#603b38)}
.devButton.good{background:linear-gradient(#657f4b,#4f683b)}
.devButton:disabled{opacity:.5;cursor:default}
#devControlsStatus{min-height:18px;color:#999;font-size:11px;margin-top:8px}
#devMessageList{display:flex;flex-direction:column;gap:7px;max-height:310px;overflow:auto}
.devMessage{padding:9px;background:#171717;border:1px solid #3b3b3b}
.devMessageTop{display:flex;gap:8px;align-items:center;margin-bottom:5px;font-size:11px}
.devMessageChannel{font-weight:700;color:#d4a58f}
.devMessageName{font-weight:700;color:#b8dc95;word-break:break-word}
.devMessageTime{margin-left:auto;color:#777;white-space:nowrap}
.devMessageText{font-size:12px;line-height:1.4;color:#eee;white-space:pre-wrap;word-break:break-word;margin-bottom:7px}
.devMessageDelete{min-height:30px;padding:5px 9px;border:1px solid #111;background:#633f3b;color:#fff;cursor:pointer;font-size:10px}
.devMessageDelete:hover{background:#7b4c48}
.devToggleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px;background:#171717;border:1px solid #3b3b3b}
.devToggleText strong{display:block;font-size:12px;margin-bottom:3px}.devToggleText span{color:#888;font-size:10px}
.devState{font-family:MinecraftFont,monospace;font-size:10px;color:#9fce72}
@media(max-width:650px){#devControlsButton{right:14px;bottom:82px}.devGrid{grid-template-columns:1fr}.devMessageTime{display:none}}
`;
    document.head.appendChild(style);
}

function createUi() {
    if (panel) return;
    addStyles();

    const button = document.createElement("button");
    button.id = "devControlsButton";
    button.type = "button";
    button.textContent = "Dev Controls";
    button.addEventListener("click", openPanel);
    document.body.appendChild(button);

    panel = document.createElement("div");
    panel.id = "devControlsModal";
    panel.innerHTML = `
<div id="devControlsPanel" role="dialog" aria-modal="true" aria-labelledby="devControlsTitle">
    <header id="devControlsHeader"><h2 id="devControlsTitle">Developer Controls</h2><button id="devControlsClose" type="button" aria-label="Close">×</button></header>
    <div id="devControlsBody">
        <section class="devSection">
            <h3>Server</h3>
            <p class="devHint">Maintenance mode closes multiplayer for everyone. It does not expose a Render/API secret in the browser.</p>
            <div class="devToggleRow"><div class="devToggleText"><strong>Multiplayer maintenance</strong><span>Disconnect players and block new joins on the website.</span></div><button id="devMaintenance" class="devButton danger" type="button">Enable</button></div>
        </section>
        <section class="devSection">
            <h3>Discussions</h3>
            <p class="devHint">You can remove individual messages or wipe an entire discussion channel.</p>
            <div class="devGrid"><button id="devRefreshMessages" class="devButton" type="button">Refresh Messages</button><button id="devDeleteChat" class="devButton danger" type="button">Delete All Chat</button><button id="devDeleteBugs" class="devButton danger" type="button">Delete All Bug Reports</button><button id="devDeleteAll" class="devButton danger" type="button">Delete Everything</button></div>
            <div id="devMessageList"><div class="devHint">Open the panel to load messages.</div></div>
        </section>
        <section class="devSection">
            <h3>Quick actions</h3>
            <p class="devHint">Useful owner tools for keeping the site under control.</p>
            <div class="devGrid"><button id="devReload" class="devButton" type="button">Reload Website</button><button id="devLogout" class="devButton" type="button">Sign Out</button></div>
        </section>
        <div id="devControlsStatus"></div>
    </div>
</div>`;
    document.body.appendChild(panel);

    statusEl = panel.querySelector("#devControlsStatus");
    messageList = panel.querySelector("#devMessageList");

    panel.querySelector("#devControlsClose").addEventListener("click", closePanel);
    panel.addEventListener("click", event => { if (event.target === panel) closePanel(); });
    panel.querySelector("#devMaintenance").addEventListener("click", toggleMaintenance);
    panel.querySelector("#devRefreshMessages").addEventListener("click", loadMessages);
    panel.querySelector("#devDeleteChat").addEventListener("click", () => deleteChannel("chat"));
    panel.querySelector("#devDeleteBugs").addEventListener("click", () => deleteChannel("bugs"));
    panel.querySelector("#devDeleteAll").addEventListener("click", deleteEverything);
    panel.querySelector("#devReload").addEventListener("click", () => location.reload());
    panel.querySelector("#devLogout").addEventListener("click", async () => {
        const firebase = await waitForFirebase();
        try { await firebase?.auth?.()?.signOut?.(); } catch {}
        closePanel();
    });
}

function setButtonState() {
    const button = document.getElementById("devControlsButton");
    if (button) button.style.display = maintenanceEnabled || panel?.dataset.devVisible === "1" ? "block" : "none";
}

async function loadMaintenanceState() {
    const firebase = await waitForFirebase();
    const db = dbFor(firebase);
    if (!db) return;
    try {
        if (maintenanceUnsubscribe) maintenanceUnsubscribe();
        maintenanceUnsubscribe = db.collection("serverControl").doc("main").onSnapshot(snapshot => {
            maintenanceEnabled = Boolean(snapshot.data()?.maintenance);
            const button = panel?.querySelector("#devMaintenance");
            if (button) {
                button.textContent = maintenanceEnabled ? "Disable" : "Enable";
                button.classList.toggle("good", maintenanceEnabled);
                button.classList.toggle("danger", !maintenanceEnabled);
            }
        }, () => {});
    } catch {}
}

async function toggleMaintenance() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const db = dbFor(firebase);
    if (!db) return setStatus("Firebase is not ready.", true);
    const next = !maintenanceEnabled;
    try {
        await db.collection("serverControl").doc("main").set({
            maintenance: next,
            updatedAt: new Date(),
            updatedBy: user.email,
        }, { merge: true });
        setStatus(next ? "Multiplayer maintenance is ON." : "Multiplayer maintenance is OFF.");
    } catch (error) {
        console.error(error);
        setStatus("Could not change maintenance mode.", true);
    }
}

async function loadMessages() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const db = dbFor(firebase);
    if (!db || !messageList) return;
    messageList.innerHTML = '<div class="devHint">Loading...</div>';
    try {
        const results = [];
        for (const channel of CHANNELS) {
            const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").orderBy("createdAt", "desc").limit(100).get();
            snapshot.docs.forEach(doc => results.push({ channel, doc }));
        }
        results.sort((a, b) => {
            const at = a.doc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            const bt = b.doc.data()?.createdAt?.toDate?.()?.getTime?.() || 0;
            return bt - at;
        });
        messageList.innerHTML = "";
        if (!results.length) {
            messageList.innerHTML = '<div class="devHint">No messages found.</div>';
            return;
        }
        for (const item of results) {
            const data = item.doc.data() || {};
            const row = document.createElement("div");
            row.className = "devMessage";
            const date = data.createdAt?.toDate?.();
            row.innerHTML = `<div class="devMessageTop"><span class="devMessageChannel">${item.channel === "bugs" ? "BUG" : "CHAT"}</span><span class="devMessageName">${escapeHtml(data.name || "Player")}</span><span class="devMessageTime">${date ? escapeHtml(date.toLocaleString()) : ""}</span></div><div class="devMessageText">${escapeHtml(data.text || "")}</div><button class="devMessageDelete" type="button">Delete Message</button>`;
            row.querySelector(".devMessageDelete").addEventListener("click", () => deleteMessage(item.channel, item.doc.id, row));
            messageList.appendChild(row);
        }
    } catch (error) {
        console.error("Developer message load failed:", error);
        messageList.innerHTML = '<div class="devHint">Could not load messages. Check Firestore rules.</div>';
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function deleteMessage(channel, id, row) {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    if (!confirm("Delete this message?")) return;
    try {
        const db = dbFor(firebase);
        await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").doc(id).delete();
        row?.remove();
        setStatus("Message deleted.");
    } catch (error) {
        console.error(error);
        setStatus("Could not delete message.", true);
    }
}

async function deleteChannel(channel) {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const label = channel === "bugs" ? "all bug reports" : "all chat messages";
    if (!confirm(`Delete ${label}?`)) return;
    try {
        const db = dbFor(firebase);
        let total = 0;
        while (true) {
            const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").limit(400).get();
            if (snapshot.empty) break;
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            total += snapshot.size;
            if (snapshot.size < 400) break;
        }
        setStatus(`Deleted ${total} messages from ${channel}.`);
        await loadMessages();
    } catch (error) {
        console.error(error);
        setStatus("Could not delete the channel messages.", true);
    }
}

async function deleteEverything() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    if (!confirm("Delete ALL Report Bugs and Universal Chat messages? This cannot be undone.")) return;
    for (const channel of CHANNELS) {
        try {
            const db = dbFor(firebase);
            while (true) {
                const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").limit(400).get();
                if (snapshot.empty) break;
                const batch = db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                if (snapshot.size < 400) break;
            }
        } catch (error) {
            console.error(error);
            return setStatus("Could not finish deleting everything.", true);
        }
    }
    setStatus("All discussion messages deleted.");
    await loadMessages();
}

async function openPanel() {
    createUi();
    const { user } = await getDevUser();
    if (!user) return alert("Developer access denied.");
    panel.dataset.devVisible = "1";
    panel.style.display = "flex";
    document.exitPointerLock?.();
    setStatus("Developer access granted.");
    await loadMaintenanceState();
    await loadMessages();
}

function closePanel() {
    if (!panel) return;
    panel.style.display = "none";
}

async function init() {
    createUi();
    const firebase = await waitForFirebase();
    const syncButton = () => {
        const user = firebase?.auth?.()?.currentUser || null;
        const button = document.getElementById("devControlsButton");
        const allowed = String(user?.email || "").toLowerCase() === DEV_EMAIL;
        if (button) button.style.display = allowed ? "block" : "none";
    };
    syncButton();
    firebase?.auth?.()?.onAuthStateChanged?.(user => {
        const button = document.getElementById("devControlsButton");
        const allowed = String(user?.email || "").toLowerCase() === DEV_EMAIL;
        if (button) button.style.display = allowed ? "block" : "none";
        if (!allowed) closePanel();
    });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
