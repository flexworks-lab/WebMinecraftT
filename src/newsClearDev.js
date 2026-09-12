const DEV_EMAIL = "worthmarcus19@gmail.com";
const NEWS_COLLECTION = "news";

let firebaseReady = null;
let installed = false;

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
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL) return null;
    return { firebase, user };
}

function setStatus(text, error = false) {
    const status = document.getElementById("devNewsStatus");
    if (!status) return;
    status.textContent = text;
    status.style.color = error ? "#e38a7b" : "#9fce72";
}

async function clearAllNewsTabs() {
    const access = await getDeveloper();
    if (!access) return setStatus("Developer access denied.", true);

    if (!confirm("Delete ALL News tabs? This cannot be undone.")) return;

    const db = access.firebase.firestore();
    try {
        const snapshot = await db.collection(NEWS_COLLECTION).get();
        const docs = snapshot.docs;

        for (let i = 0; i < docs.length; i += 400) {
            const batch = db.batch();
            docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }

        setStatus(`Cleared ${docs.length} News tab${docs.length === 1 ? "" : "s"}.`);
        const list = document.getElementById("devNewsList");
        if (list) list.innerHTML = '<div class="devHint">No custom news tabs yet.</div>';
    } catch (error) {
        console.error("Clear all News tabs failed:", error);
        setStatus(error?.message || "Could not clear all News tabs.", true);
    }
}

function install() {
    if (installed) return true;
    const panel = document.getElementById("devNewsPanel");
    if (!panel) return false;
    installed = true;

    const button = document.createElement("button");
    button.id = "devClearAllNews";
    button.className = "devButton danger";
    button.type = "button";
    button.textContent = "Clear All News Tabs";
    button.style.marginTop = "2px";
    button.addEventListener("click", clearAllNewsTabs);

    const status = panel.querySelector("#devNewsStatus");
    panel.insertBefore(button, status || null);
    return true;
}

function start() {
    if (install()) return;
    const observer = new MutationObserver(() => {
        if (install()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}
