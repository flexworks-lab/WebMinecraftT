const NEWS_COLLECTION = "news";
const NEWS_SEEN_KEY = "webminecraft-news-seen-live-v2";
const NEWS_SEEN_IDS_KEY = "webminecraft-news-seen-ids-v1";
const PREVIEW_LENGTH = 110;
const TITLE_IMAGE_PATH = "./WEBMINECRAFT-9-12-2026.png";

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

function addBadgeStyles() {
    if (document.getElementById("newsUnreadBadgeStyles")) return;
    const style = document.createElement("style");
    style.id = "newsUnreadBadgeStyles";
    style.textContent = `
#newsButton .newsUnreadBadge{
    position:absolute;
    top:-7px;
    right:-7px;
    min-width:20px;
    height:20px;
    padding:0 5px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:999px;
    background:#d93636;
    border:2px solid #151515;
    color:#fff;
    font:900 10px/1 Arial,sans-serif;
    text-shadow:1px 1px 0 #5b1010;
    box-shadow:0 2px 5px rgba(0,0,0,.45);
    pointer-events:none;
    z-index:5;
}
`;
    document.head.appendChild(style);
}

function getSeenIds() {
    try {
        const raw = JSON.parse(localStorage.getItem(NEWS_SEEN_IDS_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch {
        return new Set();
    }
}

function saveSeenIds(ids) {
    try {
        const values = [...ids].slice(-500);
        localStorage.setItem(NEWS_SEEN_IDS_KEY, JSON.stringify(values));
    } catch {}
}

function setUnreadCount(count) {
    const button = document.getElementById("newsButton");
    if (!button) return;
    addBadgeStyles();
    button.querySelector(".newsUnreadBadge")?.remove();
    const total = Math.max(0, Number(count) || 0);
    button.dataset.newsNew = total > 0 ? "true" : "false";
    if (!total) return;
    const badge = document.createElement("span");
    badge.className = "newsUnreadBadge";
    badge.textContent = total > 9 ? "9+" : String(total);
    button.appendChild(badge);
}

function markNewsRead() {
    const ids = new Set(latestDocs.map(doc => String(doc.id)));
    if (ids.size) saveSeenIds(ids);
    setSeenSignature(latestSignatureValue);
    setUnreadCount(0);
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

    const version = document.getElementById("newsReadingVersion");
    const title = document.getElementById("newsReadingTitle");
    const body = document.getElementById("newsReadingBody");
    if (!version || !title || !body) return;

    document.querySelectorAll("#newsList .newsItem").forEach(node => node.classList.remove("active"));
    card?.classList.add("active");

    version.textContent = item.version;
    title.textContent = item.title;
    body.textContent = item.body;
    body.scrollTop = 0;
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

    entries.slice().reverse().forEach(item => list.prepend(cards.get(item.id)));

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
    addBadgeStyles();
    button.addEventListener("click", markNewsRead, true);
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

                const seenIds = getSeenIds();
                const unread = latestDocs.filter(doc => !seenIds.has(String(doc.id))).length;
                if (seenIds.size === 0 && latestDocs.length) {
                    saveSeenIds(new Set(latestDocs.map(doc => String(doc.id))));
                    setUnreadCount(0);
                } else {
                    setUnreadCount(unread);
                }
            }, error => {
                console.warn("Live news load failed:", error);
            });
        } catch (error) {
            console.warn("Live news listener failed:", error);
        }
    });
}

function installGameTitleImage() {
    const subtitle = document.getElementById("menuSubtitle");
    if (subtitle) {
        subtitle.style.display = "none";
        subtitle.setAttribute("aria-hidden", "true");
    }

    if (document.getElementById("webminecraftTitleImage")) return;
    const title = document.getElementById("menuTitle");
    if (!title) return;

    const image = document.createElement("img");
    image.id = "webminecraftTitleImage";
    image.src = TITLE_IMAGE_PATH;
    image.alt = "WebMinecraftT";
    image.decoding = "async";
    image.loading = "eager";
    image.style.display = "block";
    image.style.width = "min(620px, 92vw)";
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    image.style.maxHeight = "155px";
    image.style.objectFit = "contain";
    image.style.objectPosition = "center";
    image.style.margin = "0 auto 4px";
    image.style.filter = "drop-shadow(0 5px 3px rgba(0,0,0,.65))";

    title.replaceWith(image);

    const splash = document.getElementById("menuSplash");
    if (splash) splash.style.marginBottom = "8px";
}

function watchNewsUi() {
    installGameTitleImage();
    addBadgeStyles();
    installLiveNews();
    if (attached) return;

    const observer = new MutationObserver(() => {
        installGameTitleImage();
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
