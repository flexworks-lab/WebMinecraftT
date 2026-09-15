// Small UI fixes that stay isolated from the larger News/Admin modules.
// 1) The News center previously rendered two Back buttons; keep the main-menu
//    back button in the sidebar and hide the duplicate reader back button.
// 2) Developer server chat cards are periodically re-rendered. Preserve any
//    text the developer is typing so a refresh cannot erase it.

let adminDrafts = new Map();
let observerInstalled = false;

function applyNewsFix() {
    const duplicateBack = document.getElementById("newsReadingBack");
    if (duplicateBack) duplicateBack.style.display = "none";
}

function rememberAdminDraft(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("devServerChatInput")) return;
    const card = input.closest(".devServerCard");
    const serverId = card?.dataset?.serverId;
    if (!serverId) return;
    adminDrafts.set(String(serverId), input.value);
}

function restoreAdminDrafts() {
    for (const input of document.querySelectorAll(".devServerChatInput")) {
        const card = input.closest(".devServerCard");
        const serverId = card?.dataset?.serverId;
        if (!serverId || !adminDrafts.has(String(serverId))) continue;
        const draft = adminDrafts.get(String(serverId));
        if (document.activeElement === input || draft) input.value = draft;
    }
}

function cleanupDrafts() {
    for (const [serverId, value] of adminDrafts) {
        if (!value) adminDrafts.delete(serverId);
    }
}

function install() {
    if (observerInstalled) return;
    observerInstalled = true;

    document.addEventListener("input", rememberAdminDraft, true);

    const observer = new MutationObserver(() => {
        applyNewsFix();
        restoreAdminDrafts();
        cleanupDrafts();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    applyNewsFix();
    restoreAdminDrafts();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
    install();
}
