const CHAT_CLASS = "webminecraft-chat-open";
const CHAT_HIDE_DELAY = 25000;
const MOBILE_CHAT_HIDE_DELAY = 10000;
let chatHideTimer = null;
let chatApiWrapped = null;

function isMultiplayerActive() {
    return Boolean(window.__webminecraftMultiplayerActive);
}

function chatInput() {
    return document.querySelector("#multiplayerChat input, #multiplayerChat textarea");
}

function chatElement() {
    return document.getElementById("multiplayerChat");
}

function chatIsOpen() {
    return document.body.classList.contains(CHAT_CLASS);
}

function getChatFeed() {
    return document.querySelector("#multiplayerChat .chat-messages, #multiplayerChat .messages, #multiplayerChat [class*=message], #multiplayerChatFeed");
}

function addSystem(message) {
    const feed = getChatFeed();
    if (!feed) return;
    const line = document.createElement("div");
    line.textContent = message;
    line.style.opacity = "0.8";
    feed.appendChild(line);
    feed.scrollTop = feed.scrollHeight;
}

function runCommand(text) {
    const command = text.trim().toLowerCase();
    if (command === "/help") {
        addSystem("Commands: /help, /seed, /clear, /ping");
    } else if (command === "/seed") {
        addSystem(`Seed: ${window.__webminecraftSeed ?? "unknown"}`);
    } else if (command === "/clear") {
        const feed = getChatFeed();
        if (feed) feed.innerHTML = "";
    } else if (command === "/ping") {
        addSystem("Pong!");
    } else {
        addSystem(`Unknown command: ${text}`);
    }
}

function showChat(prefill = "") {
    const chat = chatElement();
    if (!chat) return false;

    clearTimeout(chatHideTimer);
    document.body.classList.add(CHAT_CLASS);
    chat.style.display = "block";

    const input = chatInput();
    if (input) {
        if (input.value !== prefill) input.value = prefill;
        input.focus({ preventScroll: true });
        try { input.setSelectionRange(input.value.length, input.value.length); } catch {}
    }

    return true;
}

function hideChat() {
    clearTimeout(chatHideTimer);
    chatHideTimer = null;
    document.body.classList.remove(CHAT_CLASS);

    const input = chatInput();
    if (input) input.blur();
}

function keepChatOpenAfterSend() {
    clearTimeout(chatHideTimer);
    document.body.classList.add(CHAT_CLASS);
    chatHideTimer = setTimeout(() => {
        hideChat();
    }, CHAT_HIDE_DELAY);
}

function keepMobileChatOpen() {
    clearTimeout(chatHideTimer);
    document.body.classList.add(CHAT_CLASS);

    const check = () => {
        const input = chatInput();
        const typing = Boolean(input && (document.activeElement === input || input.value.trim()));

        if (typing) {
            chatHideTimer = setTimeout(check, 1000);
            return;
        }

        hideChat();
    };

    chatHideTimer = setTimeout(check, MOBILE_CHAT_HIDE_DELAY);
}

function openChat(prefill = "") {
    if (!showChat(prefill)) return;
    try { document.exitPointerLock?.(); } catch {}
}

function closeChat() {
    hideChat();
}

function wrapIncomingChat() {
    const add = window.__webminecraftChatAdd;
    if (typeof add !== "function" || add === chatApiWrapped) return;

    const wrapped = function (...args) {
        const result = add.apply(this, args);
        // Every incoming chat/system message makes the chat visible.
        if (chatElement()) {
            document.body.classList.add(CHAT_CLASS);
            chatElement().style.display = "block";
            clearTimeout(chatHideTimer);
            chatHideTimer = setTimeout(() => hideChat(), CHAT_HIDE_DELAY);
        }
        return result;
    };

    window.__webminecraftChatAdd = wrapped;
    chatApiWrapped = wrapped;
}

function installChatInput() {
    const input = chatInput();
    if (!input || input.dataset.webminecraftChatInstalled === "1") return;
    input.dataset.webminecraftChatInstalled = "1";

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            const text = input.value.trim();

            if (!text) {
                event.preventDefault();
                event.stopImmediatePropagation();
                closeChat();
                return;
            }

            if (text.startsWith("/")) {
                event.preventDefault();
                event.stopImmediatePropagation();
                runCommand(text);
                input.value = "";
                keepChatOpenAfterSend();
                return;
            }

            // Let multiplayerClient.js handle normal message sending.
            keepChatOpenAfterSend();
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
    wrapIncomingChat();

    const observer = new MutationObserver(() => {
        installChatInput();
        wrapIncomingChat();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // multiplayerClient.js assigns its chat API while creating the UI.
    // Keep checking briefly so incoming messages are hooked even when the
    // chat element already existed before this module ran.
    let checks = 0;
    const timer = setInterval(() => {
        wrapIncomingChat();
        installChatInput();
        if (++checks >= 30 && chatApiWrapped) clearInterval(timer);
    }, 250);
}

function createMobileChatButton() {
    if (document.getElementById("touchChatButton")) return;
    const button = document.createElement("button");
    button.id = "touchChatButton";
    button.type = "button";
    button.textContent = "CHAT";
    button.addEventListener("click", () => {
        openChat("");
        keepMobileChatOpen();
    });
    document.body.appendChild(button);

    const style = document.createElement("style");
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
}

function isTypingInAnotherField(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toLowerCase();
    return (tag === "input" || tag === "textarea" || target.isContentEditable) && !target.closest("#multiplayerChat");
}

function installKeyboardChat() {
    window.addEventListener("keydown", event => {
        const target = event.target;
        const input = chatInput();
        const chatOpen = chatIsOpen();

        if (input && target === input) return;
        if (isTypingInAnotherField(target)) return;

        if (event.key === "Escape" && chatOpen) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeChat();
            return;
        }

        if (event.key === "/" || event.code === "Slash") {
            if (!isMultiplayerActive() && !chatElement()) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat("/");
            return;
        }

        if (event.key.toLowerCase() === "t") {
            if (!isMultiplayerActive() && !chatElement()) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat("");
            return;
        }

        if (event.key === "Enter" && !chatOpen) {
            if (!isMultiplayerActive() && !chatElement()) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            openChat("");
        }
    }, true);
}

function exposeChatAPI() {
    window.__webminecraftOpenChat = openChat;
    window.__webminecraftCloseChat = closeChat;
}

function init() {
    watchChatCreation();
    createMobileChatButton();
    installKeyboardChat();
    exposeChatAPI();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
