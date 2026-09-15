// Make administrator messages visibly distinct in both multiplayer chat and the admin server popup.
// The server identifies admin messages with the exact name "admin".

let installed = false;

function installAdminChatStyle() {
    if (installed || typeof window.__webminecraftChatAdd !== "function") return;
    const original = window.__webminecraftChatAdd;
    if (original.__webminecraftAdminChatFix) return;

    const wrapped = function(text, system = false, name = "", isAdmin = false) {
        original.call(this, text, system, name, isAdmin);
        if (system || (String(name || "").toLowerCase() !== "admin" && !isAdmin)) return;
        const feed = document.getElementById("multiplayerChatFeed");
        const line = feed?.lastElementChild;
        const label = line?.querySelector(".multiplayerChatName");
        if (label) {
            label.style.color = "#55ff55";
            label.style.textShadow = "1px 1px 2px #000";
        }
    };
    wrapped.__webminecraftAdminChatFix = true;
    window.__webminecraftChatAdd = wrapped;
    installed = true;
}

function formatAdminPopupChat() {
    document.querySelectorAll(".adminChatLine").forEach(line => {
        if (line.dataset.adminFormatted === "1") return;
        const strong = line.querySelector("strong");
        if (!strong || String(strong.textContent || "").trim().toLowerCase() !== "admin:") return;

        const fullText = line.textContent || "";
        const messageText = fullText.replace(/^admin:\s*/i, "");
        line.innerHTML = "";

        const label = document.createElement("strong");
        label.textContent = "admin";
        label.style.color = "#55ff55";
        label.style.textShadow = "1px 1px 2px #000";

        const icon = document.createElement("span");
        icon.className = "adminChatVerify";
        icon.textContent = "✓";
        icon.title = "Verified admin";
        icon.setAttribute("aria-label", "Verified admin");

        line.appendChild(label);
        line.appendChild(document.createTextNode("("));
        line.appendChild(icon);
        line.appendChild(document.createTextNode("): "));
        line.appendChild(document.createTextNode(messageText));
        line.dataset.adminFormatted = "1";
    });
}

installAdminChatStyle();
formatAdminPopupChat();

const adminChatStyleTimer = setInterval(() => {
    installAdminChatStyle();
    formatAdminPopupChat();
    if (installed) clearInterval(adminChatStyleTimer);
}, 250);

const adminPopupObserver = new MutationObserver(() => formatAdminPopupChat());
if (document.body) adminPopupObserver.observe(document.body, { childList: true, subtree: true });
else document.addEventListener("DOMContentLoaded", () => adminPopupObserver.observe(document.body, { childList: true, subtree: true }), { once: true });
