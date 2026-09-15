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
                    resolve(firebase);
                    return;
                }
            } catch {}
            if (Date.now() - started >= timeout) {
                resolve(null);
                return;
            }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

async function getDeveloper() {
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL.toLowerCase()) return null;
    return { firebase, user };
}

function setStatus(text, error = false) {
    const status = document.getElementById("devStatus");
    if (!status) return;
    status.textContent = text;
    status.style.color = error ? "#e38a7b" : "#9fce72";
}

async function loadDiscussions() {
    const access = await getDeveloper();
    if (!access || !messageList) return;
    try {
        const db = access.firebase.firestore();
        const results = [];
        for (const channel of CHANNELS) {
            const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").orderBy("createdAt", "desc").limit(100).get();
            snapshot.docs.forEach(doc => results.push({ channel, ref: doc.ref, data: doc.data() || {} }));
        }
        results.sort((a, b) => (b.data.createdAt?.toDate?.()?.getTime?.() || 0) - (a.data.createdAt?.toDate?.()?.getTime?.() || 0));
        messageList.replaceChildren();
        if (!results.length) {
            messageList.innerHTML = '<div class="devHint">No discussion messages.</div>';
            return;
        }
        results.forEach(item => {
            const row = document.createElement("article");
            row.className = "devDiscussionRow";
            const date = item.data.createdAt?.toDate?.();
            row.innerHTML = `<div class="devDiscussionMeta"><strong>${String(item.data.name || "Player").replace(/[&<>"']/g, "")}</strong><span>${item.channel}</span><time>${date ? date.toLocaleString() : ""}</time></div><div class="devDiscussionText"></div><button type="button" class="devButton danger">Delete</button>`;
            row.querySelector(".devDiscussionText").textContent = String(item.data.text || "");
            row.querySelector("button").addEventListener("click", async () => {
                if (!confirm("Delete this discussion message?")) return;
                try { await item.ref.delete(); row.remove(); } catch (error) { setStatus(error?.message || "Could not delete message.", true); }
            });
            messageList.appendChild(row);
        });
    } catch (error) {
        setStatus(error?.message || "Could not load discussions.", true);
    }
}

function buildPanel() {
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "devControlsPanel";
    panel.innerHTML = `<div id="devControlsBody"><div class="devSection"><h3>Developer Controls</h3><p class="devHint">Developer-only tools for site administration and testing.</p><div id="devStatus"></div></div><div class="devSection"><h3>Discussion Messages</h3><div id="devDiscussionList"></div></div></div>`;
    document.body.appendChild(panel);
    statusEl = panel.querySelector("#devStatus");
    messageList = panel.querySelector("#devDiscussionList");
    return panel;
}

async function install() {
    const access = await getDeveloper();
    if (!access) return false;
    buildPanel();
    loadDiscussions();
    return true;
}

function start() {
    install();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
