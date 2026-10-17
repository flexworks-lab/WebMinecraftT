// Keeps Admin Controls server chat inputs stable while the server list polls.
const ADMIN_CHAT_API = "https://webminecraftt-multiplayer-production.up.railway.app";
let adminChatFixInstalled = false;
const drafts = new Map();

function adminChatUser() {
    try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; }
}

async function adminChatToken() {
    const user = adminChatUser();
    if (!user) return "";
    try { return await user.getIdToken(); } catch { return ""; }
}

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
            inputs.forEach(remember);
        }
    }
}

function restore() {
    document.querySelectorAll(".adminChatInput").forEach(input => {
        const id = getId(input);
        if (!id || !drafts.has(id)) return;
        const value = drafts.get(id) ?? "";
        if (input.value === value) return;
        const focused = document.activeElement === input;
        input.value = value;
        if (focused) {
            try { input.setSelectionRange(value.length, value.length); } catch {}
        }
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function updateServerChats(servers) {
    for (const server of servers || []) {
        const id = String(server.id || "");
        if (!id) continue;
        const cards = Array.from(document.querySelectorAll(".adminServerCard"));
        const card = cards.find(item => String(item.dataset.serverId || "") === id || String(item.querySelector(".adminServerName")?.textContent || "") === String(server.name || server.id));
        if (!card) continue;
        const feed = card.querySelector(".adminChatFeed");
        if (!feed) continue;

        const chat = server.chat || [];
        const key = chat.map(message => `${message.time || ""}|${message.name || ""}|${message.text || ""}`).join("\n");
        if (feed.dataset.chatKey === key) continue;
        feed.dataset.chatKey = key;
        feed.replaceChildren();

        if (!chat.length) {
            feed.innerHTML = '<div class="adminHint">No recent chat.</div>';
            continue;
        }

        chat.slice(-100).forEach(message => {
            const line = document.createElement("div");
            line.className = "adminChatLine";
            line.innerHTML = `<strong>${escapeHtml(message.name || "Player")}:</strong> ${escapeHtml(message.text || "")}`;
            feed.appendChild(line);
        });
        feed.scrollTop = feed.scrollHeight;
    }
}

async function refreshServerChats() {
    const modal = document.getElementById("adminControlsModal");
    if (!modal || modal.style.display !== "flex") return;
    if (modal.querySelector(".adminControlsTab.active")?.dataset.tab !== "servers") return;

    const token = await adminChatToken();
    if (!token) return;
    try {
        const response = await fetch(`${ADMIN_CHAT_API}/admin/servers`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            cache: "no-store"
        });
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        updateServerChats(data.servers || []);
    } catch {}
}

function install() {
    if (adminChatFixInstalled) return;
    adminChatFixInstalled = true;

    document.addEventListener("beforeinput", event => remember(event.target), true);
    document.addEventListener("input", event => remember(event.target), true);
    document.addEventListener("keyup", event => remember(event.target), true);
    document.addEventListener("focusin", event => remember(event.target), true);
    document.addEventListener("focusout", event => remember(event.target), true);

    const innerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    if (innerHTMLDescriptor?.set && innerHTMLDescriptor?.get) {
        Object.defineProperty(Element.prototype, "innerHTML", {
            configurable: innerHTMLDescriptor.configurable,
            enumerable: innerHTMLDescriptor.enumerable,
            get: innerHTMLDescriptor.get,
            set(value) {
                if (this.id === "adminControlsContent" && this.querySelector?.("#adminServerGrid") && String(value).includes("adminServerGrid")) {
                    this.__adminChatOnlyRefresh = true;
                    refreshServerChats();
                    setTimeout(() => { this.__adminChatOnlyRefresh = false; }, 0);
                    return;
                }
                innerHTMLDescriptor.set.call(this, value);
            }
        });
    }

    const appendChildDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, "appendChild");
    if (appendChildDescriptor?.value) {
        const originalAppendChild = appendChildDescriptor.value;
        Object.defineProperty(Node.prototype, "appendChild", {
            configurable: appendChildDescriptor.configurable,
            enumerable: appendChildDescriptor.enumerable,
            writable: appendChildDescriptor.writable,
            value(node) {
                if (this instanceof Element && this.id === "adminServerGrid" && this.parentElement?.id === "adminControlsContent" && this.parentElement.__adminChatOnlyRefresh && node instanceof Element && node.classList.contains("adminServerCard")) {
                    return node;
                }
                return originalAppendChild.call(this, node);
            }
        });
    }

    const observer = new MutationObserver(records => {
        captureRemoved(records);
        restore();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(() => {
        restore();
        refreshServerChats();
    }, 4000);
    restore();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
} else {
    install();
}
