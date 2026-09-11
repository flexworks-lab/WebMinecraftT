const TNT_SIGNAL_PREFIX = "\u2063WM_TNT:";
let chatBridgeInstalled = false;

function installChatBridge() {
    if (chatBridgeInstalled) return;
    const tryInstall = () => {
        const add = window.__webminecraftChatAdd;
        if (typeof add !== "function" || add.__webminecraftTNTBridge) return;
        const wrapped = (text, system = false, name = "") => {
            const value = String(text ?? "");
            if (value.startsWith(TNT_SIGNAL_PREFIX)) {
                const coords = value.slice(TNT_SIGNAL_PREFIX.length).split(",").map(Number);
                if (coords.length === 3 && coords.every(Number.isFinite)) {
                    window.dispatchEvent(new CustomEvent("webminecraft:tntignite", {
                        detail: { x: coords[0], y: coords[1], z: coords[2] }
                    }));
                }
                return;
            }
            return add(value, system, name);
        };
        wrapped.__webminecraftTNTBridge = true;
        window.__webminecraftChatAdd = wrapped;
    };
    tryInstall();
    const timer = setInterval(() => {
        tryInstall();
        if (chatBridgeInstalled) clearInterval(timer);
    }, 50);
    chatBridgeInstalled = true;
}

export function sendTNTIgnite(x, y, z) {
    const input = document.getElementById("multiplayerChatInput");
    if (!input) return false;
    input.value = `${TNT_SIGNAL_PREFIX}${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
    input.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true
    }));
    return true;
}

installChatBridge();
