(function () {
    const STYLE_ID = "newsFreshStartStyles";

    function installStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            #newsList .newsItem:not(.liveNewsItem) { display: none !important; }
            #newsList .newsEmptyState {
                padding: 18px 14px;
                color: #999;
                font-size: 12px;
                line-height: 1.5;
                text-align: center;
                border: 1px dashed #444;
                background: #242424;
            }
        `;
        document.head.appendChild(style);
    }

    function refresh() {
        installStyles();
        const list = document.getElementById("newsList");
        if (!list) return false;

        let empty = list.querySelector(".newsEmptyState");
        if (!empty) {
            empty = document.createElement("div");
            empty.className = "newsEmptyState";
            empty.textContent = "No news tabs yet. Create a new News tab from Developer Controls.";
            list.appendChild(empty);
        }

        empty.style.display = list.querySelector(".liveNewsItem") ? "none" : "block";
        return true;
    }

    function start() {
        if (refresh()) {
            const list = document.getElementById("newsList");
            const observer = new MutationObserver(refresh);
            observer.observe(list, { childList: true });
            return;
        }

        const observer = new MutationObserver(() => {
            if (refresh()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
