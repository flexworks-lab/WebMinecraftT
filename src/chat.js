const CHAT_CLASS = "webminecraft-chat-open";

function isMultiplayerActive() {
    return Boolean(window.__webminecraftMultiplayerActive);
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
    const args = parts.join(" ");

    switch (command) {
        case "help":
            addSystem("Commands: /help /seed /clear /ping");
            return true;
        case "seed": {
            const seed = document.getElementById("seedInput")?.value;
            addSystem(`Seed: ${seed || "Unknown"}`);
            return true;
        }
        case "clear": {
            const feed = getChatFeed();
            if (feed) feed.replaceChildren();
            return true;
        }
        case "ping":
            addSystem("Pong!");
            return true;
        default:
            addSystem(`Unknown command: /${command || ""}`);
            return true;
    }
}

function openChat() {
    if (!isMultiplayerActive()) return;
    window.__webminecraftChatShow?.();
    document.body.classList.add(CHAT_CLASS);
    const input = document.getElementById("multiplayerChatInput");
    input?.focus();
}

function closeChat() {
    document.body.classList.remove(CHAT_CLASS);
    window.__webminecraftChatHide?.();
}

function installChatGuard() {
    const input = document.getElementById("multiplayerChatInput");
    if (!input || input.dataset.commandsInstalled) return;
    input.dataset.commandsInstalled = "1";

    input.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        const text = input.value.trim();
        if (!text.startsWith("/")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        runCommand(text);
        input.value = "";
        input.blur();
        closeChat();
    }, true);
}

function watchChatCreation() {
    installChatGuard();
    const observer = new MutationObserver(() => installChatGuard());
    observer.observe(document.body, { childList: true, subtree: true });
}

function createMobileChatButton() {
    if (document.getElementById("touchChatButton")) return;

    const style = document.createElement("style");
    style.id = "webMinecraftChatButtonStyles";
    style.textContent = `
#touchChatButton{
    display:none;
    position:fixed;
    right:18px;
    bottom:152px;
    width:74px;
    min-height:44px;
    padding:8px 10px;
    z-index:46;
    pointer-events:auto;
    border:2px solid #111;
    border-top-color:#888;
    border-left-color:#888;
    background:linear-gradient(#696969,#505050);
    color:#fff;
    font-family:"MinecraftFont",monospace;
    font-size:11px;
    text-shadow:2px 2px 0 #222;
    user-select:none;
    -webkit-user-select:none;
    touch-action:none;
}
body.mobile-mode.webminecraft-in-world #touchChatButton{display:block}
body.mobile-mode.webminecraft-in-world.webminecraft-chat-open #touchChatButton{background:linear-gradient(#6d8d4e,#526f3c)}
body:not(.webminecraft-in-world) #touchChatButton{display:none !important}
body:not(.mobile-mode) #touchChatButton{display:none !important}
#multiplayerChat{display:none !important}
body.webminecraft-chat-open #multiplayerChat{display:block !important}
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

function init() {
    createMobileChatButton();
    watchChatCreation();

    document.addEventListener("keydown", event => {
        if (!isMultiplayerActive() || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

        if (event.key === "/") {
            event.preventDefault();
            event.stopPropagation();
            openChat();
            return;
        }

        if (event.key === "Escape" && chatIsOpen()) {
            event.preventDefault();
            event.stopPropagation();
            closeChat();
        }

        // Do not let the old Enter/T chat shortcut open the chat anymore.
        if (event.key === "Enter" || event.key.toLowerCase() === "t") {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    const observer = new MutationObserver(() => {
        if (!isMultiplayerActive() && chatIsOpen()) closeChat();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
