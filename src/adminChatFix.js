// Keeps the real Admin Controls server-chat draft alive while server polling
// rebuilds the Live Multiplayer Servers section every few seconds.
let installed = false;
const drafts = new Map();

function getId(input) {
    const card = input?.closest?.(".adminServerCard");
    return card?.dataset?.serverId ? String(card.dataset.serverId) : "";
}

function remember(input) {
    if (!(input instanceof HTMLInputElement) || !input.classList.contains("adminChatInput")) return;
    const id = getId(input);
    if (id) drafts.set(id, input.value);
}

function captureRemoved(records) {
    for (const record of records) {
        for (const removed of record.removedNodes) {
            if (!(removed instanceof Element)) continue;
            const inputs = [];
            if (removed.matches?.(".adminChatInput")) inputs.push(removed);
            inputs.push(...(removed.querySelectorAll?.(".adminChatInput") || []));
            for (const input of inputs) remember(input);
        }
    }
}

function restore() {
    document.querySelectorAll(".adminChatInput").forEach(input => {
        const id = getId(input);
        if (!id || !drafts.has(id)) return;
        const value = drafts.get(id) ?? "";
        if (input.value !== value) {
            const focused = document.activeElement === input;
            input.value = value;
            if (focused) {
                try { input.setSelectionRange(value.length, value.length); } catch {}
            }
        }
    });
}

function install() {
    if (installed) return;
    installed = true;

    document.addEventListener("beforeinput", event => remember(event.target), true);
    document.addEventListener("input", event => remember(event.target), true);
    document.addEventListener("keyup", event => remember(event.target), true);
    document.addEventListener("focusin", event => remember(event.target), true);
    document.addEventListener("focusout", event => remember(event.target), true);

    const observer = new MutationObserver(records => {
        captureRemoved(records);
        restore();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(restore, 50);
    restore();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
    install();
}
