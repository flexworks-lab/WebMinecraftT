const NEWS_COLLECTION = "news";
const NEWS_SEEN_KEY = "webminecraft-news-seen-live-v2";
const PREVIEW_LENGTH = 110;

let firebaseReady = null;
let latestDocs = [];
let latestSignatureValue = "";
let attached = false;
let selectedLiveId = "";

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

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTimestampValue(data) {
    try {
        return data?.updatedAt?.toMillis?.() || data?.createdAt?.toMillis?.() || 0;
    } catch {
        return 0;
    }
}

function previewText(value) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (text.length <= PREVIEW_LENGTH) return text;
    return `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

function latestSignature(docs) {
    return docs.map(doc => {
        const data = doc.data() || {};
        return [
            doc.id,
            getTimestampValue(data),
            String(data.version || ""),
            String(data.title || ""),
            String(data.body || ""),
            data.active === false ? "0" : "1"
        ].join(":");
    }).join("|");
}

function getSeenSignature() {
    try {
        return localStorage.getItem(NEWS_SEEN_KEY) || "";
    } catch {
        return "";
    }
}

function setSeenSignature(value) {
    try {
        localStorage.setItem(NEWS_SEEN_KEY, value);
    } catch {}
}

function setRedDot(show) {
    const button = document.getElementById("newsButton");
    if (button) button.dataset.newsNew = show ? "true" : "false";
}

function getSortedDocs(snapshot) {
    return snapshot.docs
        .filter(doc => doc.data()?.active !== false)
        .sort((a, b) => getTimestampValue(b.data()) - getTimestampValue(a.data()));
}

function getLiveEntry(doc) {
    const data = doc.data() || {};
    return {
        id: doc.id,
        version: String(data.version || "NEWS"),
        title: String(data.title || "Untitled News"),
        body: String(data.body || "")
    };
}

function showLiveEntry(item, card) {
    selectedLiveId = item.id;

    const version = document.getElementById("newsCurrentVersion");
    const currentTitle = document.getElementById("newsCurrentTitle");
    const detailsTitle = document.getElementById("newsDetailsTitle");
    const detailsBody = document.getElementById("newsDetailsBody");
    if (!version || !currentTitle || !detailsTitle || !detailsBody) return;

    document.querySelectorAll("#newsList .newsItem").forEach(node => node.classList.remove("active"));
    card?.classList.add("active");

    version.textContent = item.version;
    currentTitle.textContent = item.title;
    detailsTitle.textContent = item.title;
    detailsBody.textContent = item.body;
    detailsBody.scrollTop = 0;
}

function appendOrRefreshLiveNews(docs) {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.querySelectorAll(".liveNewsItem").forEach(node => node.remove());

    const entries = docs.map(getLiveEntry);
    const cards = new Map();

    entries.forEach(item => {
        const card = document.createElement("button");
        card.className = "newsItem liveNewsItem";
        card.type = "button";
        card.dataset.newsId = item.id;
        card.innerHTML = `<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(previewText(item.body))}</div>`;
        card.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            showLiveEntry(item, card);
        });
        cards.set(item.id, card);
    });

    entries.slice().reverse().forEach(item => list.prepend(cards.get(item.id));

    if (selectedLiveId) {
        const selected = entries.find(item => item.id === selectedLiveId);
        if (selected) {
            showLiveEntry(selected, cards.get(selected.id));
            return;
        }
        selectedLiveId = "";
    }
}

function bindNewsButton() {
    const button = document.getElementById("newsButton");
    if (!button || button.dataset.liveNewsClickBound === "1") return;
    button.dataset.liveNewsClickBound = "1";
    button.addEventListener("click", () => {
        setSeenSignature(latestSignatureValue);
        setRedDot(false);
    }, true);
}

function installLiveNews() {
    if (attached) return;
    const list = document.getElementById("newsList");
    if (!list) return;
    attached = true;

    bindNewsButton();

    waitForFirebase().then(firebase => {
        const db = firebase?.firestore?.();
        if (!db) return;

        try {
            db.collection(NEWS_COLLECTION).onSnapshot(snapshot => {
                latestDocs = getSortedDocs(snapshot);
                latestSignatureValue = latestSignature(latestDocs);

                appendOrRefreshLiveNews(latestDocs);
                bindNewsButton();

                if (latestSignatureValue) {
                    setRedDot(getSeenSignature() !== latestSignatureValue);
                } else {
                    setRedDot(false);
                }
            }, error => {
                console.warn("Live news load failed:", error);
            });
        } catch (error) {
            console.warn("Live news listener failed:", error);
        }
    });
}

function watchNewsUi() {
    installLiveNews();
    if (attached) return;

    const observer = new MutationObserver(() => {
        installLiveNews();
        if (attached) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchNewsUi, { once: true });
} else {
    watchNewsUi();
}
