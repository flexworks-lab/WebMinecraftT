const CHAT_CLASS = "webminecraft-chat-open";
const CHAT_HIDE_DELAY = 25000;
const MOBILE_CHAT_HIDE_DELAY = 10000;
const CHAT_NOTIFICATION_DELAY = 5000;
let chatHideTimer = null;
let chatNotificationTimer = null;
let chatApiWrapped = null;
let lastChatNotificationKey = "";
let lastChatNotificationAt = 0;

function isMultiplayerActive() { return Boolean(window.__webminecraftMultiplayerActive); }
function chatInput() { return document.querySelector("#multiplayerChat input, #multiplayerChat textarea"); }
function chatElement() { return document.getElementById("multiplayerChat"); }
function chatIsOpen() { return document.body.classList.contains(CHAT_CLASS); }
function getChatFeed() { return document.querySelector("#multiplayerChat .chat-messages, #multiplayerChat .messages, #multiplayerChat [class*=message], #multiplayerChatFeed"); }

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
    if (command === "/help") addSystem("Commands: /help, /seed, /clear, /ping");
    else if (command === "/seed") addSystem(`Seed: ${window.__webminecraftSeed ?? "unknown"}`);
    else if (command === "/clear") { const feed = getChatFeed(); if (feed) feed.innerHTML = ""; }
    else if (command === "/ping") addSystem("Pong!");
    else addSystem(`Unknown command: ${text}`);
}

function installFullscreenChatStyles() {
    if (document.getElementById("webMinecraftFullscreenChatStyles")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftFullscreenChatStyles";
    style.textContent = `
#multiplayerChat{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;box-sizing:border-box!important;z-index:50000!important;display:none!important;pointer-events:auto!important;font-family:Arial,sans-serif;text-shadow:2px 2px 0 #000;background:rgba(0,0,0,.72)!important;padding:clamp(18px,4vw,52px)!important}
body.webminecraft-chat-open #multiplayerChat{display:flex!important;flex-direction:column!important}
#multiplayerChat::before{content:"CHAT";display:block;flex:0 0 auto;color:#fff;font-family:"MinecraftFont",monospace;font-size:clamp(24px,4vw,38px);font-weight:700;letter-spacing:1px;text-shadow:3px 3px 0 #000;margin:0 0 14px}
#multiplayerChatFeed{box-sizing:border-box!important;width:100%!important;max-width:1100px!important;flex:1 1 auto!important;min-height:0!important;max-height:none!important;overflow-y:auto!important;padding:16px 18px!important;background:rgba(0,0,0,.34)!important;border:2px solid rgba(255,255,255,.18)!important;scrollbar-width:thin!important;margin:0 auto!important}
.multiplayerChatLine{font-size:clamp(15px,2vw,19px)!important;line-height:1.55!important;color:#fff!important;overflow-wrap:anywhere!important;margin:4px 0!important;text-shadow:2px 2px 0 #000!important}
.multiplayerChatSystem{color:#cfcfcf!important;font-style:italic!important}.multiplayerChatName{font-weight:700!important;color:#fff!important}
#multiplayerChatInput{box-sizing:border-box!important;width:100%!important;max-width:1100px!important;height:52px!important;flex:0 0 52px!important;margin:14px auto 0!important;padding:9px 13px!important;background:rgba(0,0,0,.82)!important;color:#fff!important;border:2px solid #777!important;border-top-color:#aaa!important;border-left-color:#aaa!important;outline:none!important;pointer-events:auto!important;font:18px Arial,sans-serif!important;text-shadow:1px 1px 0 #000!important}
#multiplayerChatInput:focus{border-color:#fff!important}#multiplayerChatInput::placeholder{color:#aaa!important}
#webMinecraftChatClose{display:none!important;position:absolute!important;top:14px!important;right:14px!important;width:78px!important;height:40px!important;z-index:99999!important;box-sizing:border-box!important;border:2px solid #111!important;border-top-color:#888!important;border-left-color:#888!important;background:linear-gradient(#696969,#505050)!important;color:#fff!important;font-family:"MinecraftFont",monospace!important;font-size:11px!important;text-shadow:2px 2px 0 #222!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important;-webkit-user-select:none!important}
#webMinecraftChatClose:active{background:#3f3f3f!important}
#webMinecraftChatNotifications{position:fixed!important;top:14px!important;left:14px!important;width:min(520px,calc(100vw - 28px))!important;z-index:49999!important;display:flex!important;flex-direction:column!important;gap:4px!important;pointer-events:none!important;font-family:Arial,sans-serif!important;text-shadow:2px 2px 0 #000!important}
.webMinecraftChatNotification{box-sizing:border-box!important;width:100%!important;padding:8px 12px!important;background:rgba(0,0,0,.82)!important;border:2px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:16px!important;line-height:1.35!important;overflow-wrap:anywhere!important;animation:webMinecraftChatNotificationIn .16s ease-out!important}
.webMinecraftChatNotificationName{font-weight:700!important;color:#fff!important}
@keyframes webMinecraftChatNotificationIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
body.webminecraft-chat-open #webMinecraftChatNotifications{display:none!important}body.webminecraft-chat-open #touchChatButton{display:none!important}
@media(max-width:700px){#multiplayerChat{padding:14px!important;background:rgba(0,0,0,.78)!important}#multiplayerChat::before{font-size:25px!important;margin-bottom:10px!important}#multiplayerChatFeed{padding:11px 12px!important}.multiplayerChatLine{font-size:15px!important;line-height:1.5!important;margin:3px 0!important}#multiplayerChatInput{height:50px!important;flex-basis:50px!important;margin-top:10px!important;font-size:16px!important}#webMinecraftChatClose{display:block!important}#webMinecraftChatNotifications{top:10px!important;left:10px!important;width:calc(100vw - 20px)!important}.webMinecraftChatNotification{font-size:14px!important;padding:7px 10px!important}}
`;
    document.head.appendChild(style);
}

function ensureChatNotifications() {
    let container = document.getElementById("webMinecraftChatNotifications");
    if (container) return container;
    container = document.createElement("div");
    container.id = "webMinecraftChatNotifications";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
    return container;
}

function showChatNotification(args) {
    if (chatIsOpen()) return;
    const system = args?.[1] === true;
    const text = typeof args?.[0] === "string" ? args[0].trim() : "";
    const name = typeof args?.[2] === "string" ? args[2].trim() : "";
    if (system || !text) return;
    const key = `${name}\n${text}`;
    const now = Date.now();
    if (key === lastChatNotificationKey && now - lastChatNotificationAt < 1000) return;
    lastChatNotificationKey = key;
    lastChatNotificationAt = now;
    const container = ensureChatNotifications();
    const line = document.createElement("div");
    line.className = "webMinecraftChatNotification";
    if (name) {
        const nameSpan = document.createElement("span");
        nameSpan.className = "webMinecraftChatNotificationName";
        nameSpan.textContent = `${name}: `;
        line.appendChild(nameSpan);
    }
    line.appendChild(document.createTextNode(text));
    container.appendChild(line);
    while (container.children.length > 4) container.firstElementChild?.remove();
    clearTimeout(chatNotificationTimer);
    chatNotificationTimer = setTimeout(() => {
        if (chatIsOpen()) return;
        container.querySelectorAll(".webMinecraftChatNotification").forEach(item => {
            item.style.transition = "opacity .25s ease, transform .25s ease";
            item.style.opacity = "0";
            item.style.transform = "translateY(-4px)";
        });
        setTimeout(() => { if (!chatIsOpen()) container.innerHTML = ""; }, 280);
    }, CHAT_NOTIFICATION_DELAY);
}

function showChat(prefill = "") {
    const chat = chatElement();
    if (!chat) return false;
    clearTimeout(chatHideTimer);
    installFullscreenChatStyles();
    ensureMobileChatCloseButton();
    document.body.classList.add(CHAT_CLASS);
    chat.style.display = "flex";
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
    chatHideTimer = setTimeout(hideChat, CHAT_HIDE_DELAY);
}

function keepMobileChatOpen() {
    clearTimeout(chatHideTimer);
    document.body.classList.add(CHAT_CLASS);
    const check = () => {
        const input = chatInput();
        const typing = Boolean(input && (document.activeElement === input || input.value.trim()));
        if (typing) { chatHideTimer = setTimeout(check, 1000); return; }
        hideChat();
    };
    chatHideTimer = setTimeout(check, MOBILE_CHAT_HIDE_DELAY);
}

function openChat(prefill = "") { if (!showChat(prefill)) return; try { document.exitPointerLock?.(); } catch {} }
function closeChat() { hideChat(); }

function wrapIncomingChat() {
    const add = window.__webminecraftChatAdd;
    if (typeof add !== "function") return;
    if (add.__webminecraftChatNotificationWrapper === true) {
        chatApiWrapped = add;
        return;
    }
    const wrapped = function (...args) {
        const result = add.apply(this, args);
        showChatNotification(args);
        return result;
    };
    wrapped.__webminecraftChatNotificationWrapper = true;
    wrapped.__webminecraftChatOriginal = add;
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
            if (!text) { event.preventDefault(); event.stopImmediatePropagation(); closeChat(); return; }
            if (text.startsWith("/")) { event.preventDefault(); event.stopImmediatePropagation(); runCommand(text); input.value = ""; keepChatOpenAfterSend(); return; }
            keepChatOpenAfterSend();
        }
        if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); input.value = ""; closeChat(); }
    }, true);
}

function ensureMobileChatCloseButton() {
    const chat = chatElement();
    if (!chat) return;
    let button = document.getElementById("webMinecraftChatClose");
    if (button && button.parentElement !== chat) {
        button.remove();
        button = null;
    }
    if (button) return;
    button = document.createElement("button");
    button.id = "webMinecraftChatClose";
    button.type = "button";
    button.textContent = "CLOSE";
    button.setAttribute("aria-label", "Close chat");
    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
    });
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        closeChat();
    });
    chat.appendChild(button);
}

function watchChatCreation() {
    installFullscreenChatStyles();
    ensureChatNotifications();
    installChatInput();
    ensureMobileChatCloseButton();
    wrapIncomingChat();
    const observer = new MutationObserver(() => {
        installChatInput();
        wrapIncomingChat();
        ensureChatNotifications();
        ensureMobileChatCloseButton();
        if (chatElement()) installFullscreenChatStyles();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    let checks = 0;
    const timer = setInterval(() => { wrapIncomingChat(); installChatInput(); ensureMobileChatCloseButton(); if (++checks >= 30 && chatApiWrapped) clearInterval(timer); }, 250);
}

function createMobileChatButton() {
    if (document.getElementById("touchChatButton")) return;
    const button = document.createElement("button");
    button.id = "touchChatButton";
    button.type = "button";
    button.textContent = "CHAT";
    button.addEventListener("click", () => { openChat(""); keepMobileChatOpen(); });
    document.body.appendChild(button);
    const style = document.createElement("style");
    style.textContent = `#touchChatButton{display:none;position:fixed;right:18px;top:18px;width:74px;min-height:44px;padding:8px 10px;z-index:190;pointer-events:auto;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;user-select:none;-webkit-user-select:none;touch-action:none}body.mobile-mode.webminecraft-in-world #touchChatButton{display:block}body.mobile-mode.webminecraft-in-world.webminecraft-chat-open #touchChatButton{background:linear-gradient(#6d8d4e,#526f3c)}body:not(.webminecraft-in-world) #touchChatButton{display:none!important}body:not(.mobile-mode) #touchChatButton{display:none!important}`;
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
        if (event.key === "Escape" && chatOpen) { event.preventDefault(); event.stopImmediatePropagation(); closeChat(); return; }
        if (event.key === "/" || event.code === "Slash") { if (!isMultiplayerActive() && !chatElement()) return; event.preventDefault(); event.stopImmediatePropagation(); openChat("/"); return; }
        if (event.key.toLowerCase() === "t") { if (!isMultiplayerActive() && !chatElement()) return; event.preventDefault(); event.stopImmediatePropagation(); openChat(""); return; }
        if (event.key === "Enter" && !chatOpen) { if (!isMultiplayerActive() && !chatElement()) return; event.preventDefault(); event.stopImmediatePropagation(); openChat(""); }
    }, true);
}

function exposeChatAPI() { window.__webminecraftOpenChat = openChat; window.__webminecraftCloseChat = closeChat; }
function init() { installFullscreenChatStyles(); watchChatCreation(); createMobileChatButton(); installKeyboardChat(); exposeChatAPI(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
