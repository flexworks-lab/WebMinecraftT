const CHAT_CLASS = "webminecraft-chat-open";
const CHAT_HIDE_DELAY = 25000;
let chatHideTimer = null;

function isMultiplayerActive() {
    return Boolean(window.__webminecraftMultiplayerActive);
}

function chatInput() {
    return document.getElementById("multiplayerChatInput");
}

function chatElement() {
    return document.getElementById("multiplayerChat");
}

function chatIsOpen() {
    return document.body.classList.contains(CHAT_CLASS);
}

function getChatFeed() {
    return document.getElementById("multiplayerChatFeed");
}

function addSystem(text) {
    window.__webminecraftChatAdd?.(String(text), true);
}

function runCommand(raw) {
    const input = String(raw || "").trim();
    if (!input.startsWith("/")) return false;

    const parts = input.slice(1).trim().split(/\s+/);
    const command = (parts.shift() || "").toLowerCase();

    switch (command) {
        case "help": addSystem("Commands: /help /seed /clear /ping"); return true;
        case "seed": addSystem(`Seed: ${document.getElementById("seedInput")?.value || "Unknown"}`); return true;
        case "clear": { const feed = getChatFeed(); if (feed) feed.replaceChildren(); return true; }
        case "ping": addSystem("Pong!"); return true;
        default: addSystem(`Unknown command: /${command || ""}`); return true;
    }
}

function showChat() {
    const chat = chatElement();
    if (chat) chat.style.setProperty("display", "block", "important");
    document.body.classList.add(CHAT_CLASS);
}

function hideChat() {
    if (chatHideTimer) {
        clearTimeout(chatHideTimer);
        chatHideTimer = null;
    }

    const chat = chatElement();
    if (chat) chat.style.setProperty("display", "none", "important");
    document.body.classList.remove(CHAT_CLASS);
    window.__webminecraftChatHide?.();
}

function keepChatOpenAfterSend() {
    showChat();

    if (chatHideTimer) clearTimeout(chatHideTimer);

    chatHideTimer = setTimeout(() => {
        chatHideTimer = null;
        if (isMultiplayerActive()) hideChat();
    }, CHAT_HIDE_DELAY);
}

function openChat(initialText = "") {
    if (!isMultiplayerActive()) return false;

    if (chatHideTimer) {
        clearTimeout(chatHideTimer);
        chatHideTimer = null;
    }

    showChat();
    document.exitPointerLock?.();

    const input = chatInput();
    if (!input) {
        requestAnimationFrame(() => openChat(initialText));
        return true;
    }

    input.value = initialText;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
    return true;
}

function closeChat() {
    const input = chatInput();
    if (input) input.blur();
    hideChat();
}

function installChatInput() {
    const input = chatInput();
    if (!input || input.dataset.webminecraftChatInstalled === "1") return;
    input.dataset.webminecraftChatInstalled = "1";

    input.addEventListener("keydown", event => {
        event.stopPropagation();

        if (event.key === "Enter") {
            event.preventDefault();
            event.stopImmediatePropagation();

            const text = input.value.trim();
            if (text) {
                if (text.startsWith("/")) {
                    runCommand(text);
                } else if (isMultiplayerActive()) {
                    try { window.__webminecraftSendChat?.(text); } catch {}
                }

                // Keep the chat visible for 25 seconds after the message is sent.
                keepChatOpenAfterSend();
            } else {
                closeChat();
            }

            input.value = "";
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();
            input.value = "";
            closeChat();
        }
    }, true);
}

function watchChatCreation() {
    installChatInput();
    new MutationObserver(() => installChatInput()).observe(document.body, {
        childList: true,
        subtree: true
    });
}

function createMobileChatButton() {
    if (document.getElementById("touchChatButton")) return;

    const style = document.createElement("style");
    style.id = "webMinecraftChatButtonStyles";
    style.textContent = `
#touchChatButton{display:none;position:fixed;right:18px;top:18px;width:74px;min-height:44px;padding:8px 10px;z-index:190;pointer-events:auto;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;user-select:none;-webkit-user-select:none;touch-action:none}
body.mobile-mode.webminecraft-in-world #touchChatButton{display:block}
body.mobile-mode.webminecraft-in-world.webminecraft-chat-open #touchChatButton{background:linear-gradient(#6d8d4e,#526f3c)}
body:not(.webminecraft-in-world) #touchChatButton{display:none!important}
body:not(.mobile-mode) #touchChatButton{display:none!important}
#multiplayerChat{display:none!important}
body.webminecraft-chat-open #multiplayerChat{display:block!important}
`;
    document.head.appendChild(style);

    const button = document.createElement("button");
    button.id = "touchChatButton";
    button.type = "button";
    button.textContent = "CHAT";
    button.setAttribute("aria-label", "Open chat");
    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        openChat();
    });
    document.body.appendChild(button);
}

function isTypingInAnotherField(target) {
    if (!target) return false;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return target.id !== "multiplayerChatInput";
    }
    return Boolean(target.isContentEditable);
}

function installKeyboardChat() {
    // Capture on window so pointer-lock/canvas controls cannot swallow the shortcut.
    window.addEventListener("keydown", event => {
        if (!isMultiplayerActive()) return;
        if (isTypingInAnotherField(event.target)) return;

        const slashPressed = event.code === "Slash" || event.key === "/";
        const enterPressed = event.code === "Enter" || event.key === "Enter";
        const tPressed = event.code === "KeyT" || event.key.toLowerCase() === "t";

        if (slashPressed) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat("/");
            return;
        }

        if (enterPressed && !chatIsOpen()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat();
            return;
        }

        if (tPressed && !chatIsOpen() && !event.repeat) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat();
            return;
        }

        if (event.key === "Escape" && chatIsOpen()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeChat();
        }
    }, true);
}

function exposeChatAPI() {
    window.__webminecraftOpenChat = openChat;
    window.__webminecraftCloseChat = closeChat;
}

function init() {
    createMobileChatButton();
    watchChatCreation();
    installKeyboardChat();
    exposeChatAPI();

    new MutationObserver(() => {
        installChatInput();
        if (!isMultiplayerActive() && chatIsOpen()) closeChat();
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
