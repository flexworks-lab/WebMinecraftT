// Isolated UI fixes for News + developer live-server controls.
// The server list is re-rendered during polling, which can replace the chat
// input node. Capture the old node from MutationObserver records before it is
// lost, then restore its exact text into the new input.

let observerInstalled = false;
const adminDrafts = new Map();

function applyNewsFix() {
    const duplicateBack = document.getElementById("newsReadingBack");
    if (duplicateBack) duplicateBack.style.display = "none";
}

function serverIdFromCard(card) {
    return card?.dataset?.serverId ? String(card.dataset.serverId) : "";
}

function serverIdFromInput(input) {
    return serverIdFromCard(input?.closest?.(".devServerCard"));
}

function rememberAdminDraft(input) {
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("devServerChatInput")) return;
    const id = serverIdFromInput(input);
    if (id) adminDrafts.set(id, input.value);
}

function captureRemovedInputs(records) {
    for (const record of records) {
        for (const removed of record.removedNodes) {
            if (!(removed instanceof Element)) continue;
            const inputs = [];
            if (removed.matches?.(".devServerChatInput")) inputs.push(removed);
            inputs.push(...removed.querySelectorAll?.(".devServerChatInput") || []);
            for (const input of inputs) {
                const id = serverIdFromInput(input);
                if (id) adminDrafts.set(id, input.value);
            }
        }
    }
}

function restoreAdminDrafts() {
    for (const input of document.querySelectorAll(".devServerChatInput")) {
        const id = serverIdFromInput(input);
        if (!id || !adminDrafts.has(id)) continue;
        const draft = adminDrafts.get(id) ?? "";
        if (input.value !== draft) input.value = draft;
    }
}

function cleanupDrafts() {
    for (const [id, draft] of adminDrafts) {
        if (draft === "" && !document.querySelector(`.devServerCard[data-server-id="${CSS.escape(id)}"]`)) {
            adminDrafts.delete(id);
        }
    }
}

function improveAdminServerUI() {
    if (document.getElementById("devServerControlsPolish")) return;
    const style = document.createElement("style");
    style.id = "devServerControlsPolish";
    style.textContent = `
#devServerSection{background:linear-gradient(180deg,#222820,#151814);border:1px solid #414b3c;border-radius:16px;padding:16px;box-shadow:0 14px 34px rgba(0,0,0,.3)}
#devServerSection>h3{margin:0 0 5px;font-size:18px;letter-spacing:.2px}
#devServerSection>.devHint{margin:0 0 13px;line-height:1.5;opacity:.78}
#devServerSection .devGrid{gap:9px;margin-bottom:13px}
#devServerSection .devGrid .devButton{min-height:40px;border-radius:10px;font-weight:700}
.devServerList{max-height:440px!important;gap:12px!important;padding:1px 3px 3px 1px!important}
.devServerCard{background:linear-gradient(180deg,#20251f,#151814)!important;border:1px solid #3d4939!important;border-radius:14px!important;padding:13px!important;box-shadow:0 9px 24px rgba(0,0,0,.24)}
.devServerHead{padding-bottom:10px;border-bottom:1px solid #30382d}
.devServerName{font-size:14px!important;color:#f4f6ef}
.devServerCount{background:#293728;padding:4px 9px;border:1px solid #4b5b43;border-radius:999px;font-size:10px!important;font-weight:700}
.devServerPlayers{margin:10px 0!important;gap:6px!important}
.devPlayer{background:#242922!important;border:1px solid #394335!important;border-radius:9px!important;padding:8px 9px!important}
.devPlayerName{font-size:11px}
.devPlayerTools button{border-radius:7px!important}
.devServerActions{gap:8px!important;margin-top:10px!important}
.devServerActions .devButton{min-height:36px;border-radius:9px!important;font-weight:700}
.devServerChat{margin-top:12px!important;background:linear-gradient(180deg,#11150f,#0a0c09)!important;border:1px solid #394236!important;border-radius:12px!important;padding:10px!important}
.devRandomReminder{border-radius:9px!important;min-height:35px;font-weight:700}
.devServerChatFeed{height:165px!important;background:#090b08;border:1px solid #293028;border-radius:9px;padding:9px;box-sizing:border-box;margin:8px 0!important}
.devServerChatLine{font-size:10.5px!important;padding:3px 2px;line-height:1.42;word-break:break-word}
.devServerChatInputRow{gap:7px!important}
.devServerChatInput{min-height:39px!important;box-sizing:border-box;background:#1d221b!important;border:1px solid #53604d!important;border-radius:9px!important;padding:9px 11px!important;font-size:12px!important;outline:none;transition:border-color .15s,box-shadow .15s}
.devServerChatInput:focus{border-color:#9fc58a!important;box-shadow:0 0 0 2px rgba(159,197,138,.15)}
.devServerChatSend{min-height:39px;border-radius:9px!important;padding:0 15px!important;font-weight:700}
.devServerEmpty{border-radius:9px!important}
`;
    document.head.appendChild(style);
}

function install() {
    if (observerInstalled) return;
    observerInstalled = true;
    improveAdminServerUI();

    document.addEventListener("input", event => rememberAdminDraft(event.target), true);
    document.addEventListener("beforeinput", event => rememberAdminDraft(event.target), true);
    document.addEventListener("focusin", event => rememberAdminDraft(event.target), true);

    const observer = new MutationObserver(records => {
        // IMPORTANT: read removed nodes first. Their input.value still exists
        // here, even though the node is no longer attached to the document.
        captureRemovedInputs(records);
        restoreAdminDrafts();
        applyNewsFix();
        cleanupDrafts();
        improveAdminServerUI();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        restoreAdminDrafts();
        applyNewsFix();
    }, 100);

    applyNewsFix();
    restoreAdminDrafts();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
    install();
}
