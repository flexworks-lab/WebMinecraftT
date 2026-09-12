const NEWS_COLLECTION = "news";
const NEWS_SEEN_KEY = "webminecraft-news-seen-live";

let firebaseReady = null;
let newsSnapshot = null;
let attached = false;

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

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getTimestampValue(data) {
    try { return data?.updatedAt?.toMillis?.() || 0; } catch { return 0; }
}

function latestSignature(docs) {
    return docs.map(doc => `${doc.id}:${getTimestampValue(doc.data())}`).join("|");
}

function getSeenSignature() {
    try { return localStorage.getItem(NEWS_SEEN_KEY) || ""; } catch { return ""; }
}

function setSeenSignature(value) {
    try { localStorage.setItem(NEWS_SEEN_KEY, value); } catch {}
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

function appendOrRefreshLiveNews(docs) {
    const list = document.getElementById("newsList");
    if (!list) return;

    list.querySelectorAll(".liveNewsItem").forEach(node => node.remove());
    const cards = [];
    const entries = docs.map(doc => ({
        id: doc.id,
        version: String(doc.data()?.version || "NEWS"),
        title: String(doc.data()?.title || "Untitled News"),
        body: String(doc.data()?.body || "")
    }));

    entries.forEach(item => {
        const card = document.createElement("button");
        card.className = "newsItem liveNewsItem";
        card.type = "button";
        card.innerHTML = `<div class="newsItemVersion">${escapeHtml(item.version)}</div><div class="newsItemTitle">${escapeHtml(item.title)}</div><div class="newsItemBody">${escapeHtml(item.body.split("\\n")[0])}</div>`;
        card.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const version = document.getElementById("newsReadingVersion");
            const title = document.getElementById("newsReadingTitle");
            const body = document.getElementById("newsReadingBody");
            if (!version || !title || !body) return;
            document.querySelectorAll("#newsList .newsItem").forEach(node => node.classList.remove("active"));
            card.classList.add("active");
            version.textContent = item.version;
            title.textContent = item.title;
            body.textContent = item.body;
            body.scrollTop = 0;
        });
        cards.push(card);
    });

    entries.slice().reverse().forEach((_, index) => list.prepend(cards[entries.length - 1 - index]));
}

function installLiveNews() {
    if (attached) return;
    const list = document.getElementById("newsList");
    if (!list) return;
    attached = true;

    const firebasePromise = waitForFirebase();
    firebasePromise.then(firebase => {
        const db = firebase?.firestore?.();
        if (!db) return;
        try {
            db.collection(NEWS_COLLECTION).onSnapshot(snapshot => {
                const docs = getSortedDocs(snapshot);
                newsSnapshot = docs;
                appendOrRefreshLiveNews(docs);

                const signature = latestSignature(docs);
                if (!signature) return;
                setRedDot(getSeenSignature() !== signature);

                const button = document.getElementById("newsButton");
                if (button && !button.dataset.liveNewsClickBound) {
                    button.dataset.liveNewsClickBound = "1";
                    button.addEventListener("click", () => {
                        setSeenSignature(latestSignature(newsSnapshot || []));
                        setRedDot(false);
                    }, true);
                }
            }, error => console.warn("Live news load failed:", error));
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

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchNewsUi, { once: true });
else watchNewsUi();
