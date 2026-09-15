// Make administrator messages in the actual multiplayer chat visibly distinct.
// The server identifies admin messages with the exact name "admin".

let installed = false;

function installAdminChatStyle() {
    if (installed || typeof window.__webminecraftChatAdd !== "function") return;
    const original = window.__webminecraftChatAdd;
    if (original.__webminecraftAdminChatFix) return;

    const wrapped = function(text, system = false, name = "") {
        original.call(this, text, system, name);
        if (system || String(name || "").toLowerCase() !== "admin") return;
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

installAdminChatStyle();
const adminChatStyleTimer = setInterval(() => {
    installAdminChatStyle();
    if (installed) clearInterval(adminChatStyleTimer);
}, 250);
