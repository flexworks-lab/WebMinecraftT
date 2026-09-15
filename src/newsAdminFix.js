// Isolated UI fixes for News + the developer live-server controls.
// Protect the text currently being typed from server-list refreshes and improve
// the visual layout of the live-server cards.

let observerInstalled = false;
const adminDrafts = new Map();

function applyNewsFix() {
    const duplicateBack = document.getElementById("newsReadingBack");
    if (duplicateBack) duplicateBack.style.display = "none";
}

function getServerIdFromInput(input) {
    const card = input?.closest?.(".devServerCard");
    return card?.dataset?.serverId ? String(card.dataset.serverId) : "";
}

function rememberAdminDraft(input) {
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("devServerChatInput")) return;
    const serverId = getServerIdFromInput(input);
    if (serverId) adminDrafts.set(serverId, input.value);
}

function restoreAdminDrafts() {
    document.querySelectorAll(".devServerChatInput").forEach(input => {
        const serverId = getServerIdFromInput(input);
        if (!serverId || !adminDrafts.has(serverId)) return;
        const draft = adminDrafts.get(serverId) || "";
        if (input.value !== draft) input.value = draft;
    });
}

function protectActiveChatCard() {
    const active = document.activeElement;
    if (!(active instanceof HTMLInputElement) || !active.classList.contains("devServerChatInput")) return;
    rememberAdminDraft(active);
}

function installChatProtection() {
    document.addEventListener("input", event => rememberAdminDraft(event.target), true);
    document.addEventListener("beforeinput", event => rememberAdminDraft(event.target), true);
    document.addEventListener("focusin", event => rememberAdminDraft(event.target), true);

    // The server controls module rebuilds cards during polling. Continuously save
    // the active field immediately before/after that DOM replacement.
    const observer = new MutationObserver(() => {
        protectActiveChatCard();
        restoreAdminDrafts();
        applyNewsFix();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        protectActiveChatCard();
        restoreAdminDrafts();
    }, 75);
}

function improveAdminServerUI() {
    if (document.getElementById("devServerControlsPolish")) return;
    const style = document.createElement("style");
    style.id = "devServerControlsPolish";
    style.textContent = `
#devServerSection{background:linear-gradient(180deg,#20251f,#151814);border:1px solid #394334;border-radius:16px;padding:15px;box-shadow:0 14px 34px rgba(0,0,0,.3)}
#devServerSection>h3{margin:0 0 6px;font-size:18px;letter-spacing:.2px}
#devServerSection>.devHint{margin:0 0 13px;line-height:1.45;opacity:.8}
#devServerSection .devGrid{gap:9px;margin-bottom:13px}
#devServerSection .devGrid .devButton{min-height:40px;border-radius:10px}
.devServerList{max-height:440px!important;gap:12px!important;padding:1px 3px 3px 1px}
.devServerCard{background:linear-gradient(180deg,#20251f,#161915)!important;border:1px solid #3b4536!important;border-radius:13px!important;padding:13px!important;box-shadow:0 8px 24px rgba(0,0,0,.22)}
.devServerHead{padding-bottom:9px;border-bottom:1px solid #30362d}
.devServerName{font-size:14px!important;color:#f3f5ef}
.devServerCount{background:#263225;padding:4px 8px;border:1px solid #45553e;border-radius:999px;font-size:10px!important}
.devServerPlayers{margin:10px 0!important;gap:6px!important}
.devPlayer{background:#242922!important;border:1px solid #384033!important;border-radius:9px!important;padding:8px 9px!important}
.devPlayerName{font-size:11px}
.devPlayerTools button{border-radius:7px!important}
.devServerActions{gap:8px!important;margin-top:10px!important}
.devServerActions .devButton{min-height:35px;border-radius:9px!important}
.devServerChat{margin-top:12px!important;background:linear-gradient(180deg,#11140f,#0b0d0a)!important;border:1px solid #353c31!important;border-radius:11px!important;padding:10px!important}
.devRandomReminder{border-radius:8px!important;min-height:34px}
.devServerChatFeed{height:165px!important;background:#090b08;border:1px solid #272d25;border-radius:9px;padding:8px;box-sizing:border-box;margin:8px 0!important}
.devServerChatLine{font-size:10.5px!important;padding:3px 2px;line-height:1.4;word-break:break-word}
.devServerChatInputRow{gap:7px!important}
.devServerChatInput{min-height:38px!important;box-sizing:border-box;background:#1c211b!important;border:1px solid #505b4b!important;border-radius:9px!important;padding:8px 10px!important;font-size:12px!important;outline:none}
.devServerChatInput:focus{border-color:#9bc486!important;box-shadow:0 0 0 2px rgba(155,196,134,.14)}
.devServerChatSend{min-height:38px;border-radius:9px!important;padding:0 14px!important}
.devServerEmpty{border-radius:9px!important}
`;
    document.head.appendChild(style);
}

function install() {
    if (observerInstalled) return;
    observerInstalled = true;
    improveAdminServerUI();
    installChatProtection();
    applyNewsFix();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
    install();
}
