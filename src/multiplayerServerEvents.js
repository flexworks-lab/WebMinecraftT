// Handles server-side removals and kicks before the multiplayer socket closes.
// The multiplayer client owns its WebSocket, so this small bridge watches all
// browser WebSockets and only reacts to WebMinecraft admin disconnect messages.

if (!window.__webminecraftAdminSocketWatcher) {
    const NativeWebSocket = window.WebSocket;

    window.WebSocket = new Proxy(NativeWebSocket, {
        construct(Target, args, NewTarget) {
            const socket = Reflect.construct(Target, args, NewTarget);

            socket.addEventListener("message", event => {
                let message;
                try { message = JSON.parse(event.data); } catch { return; }

                if (message?.type === "server_removed") {
                    try {
                        sessionStorage.setItem(
                            "webminecraft-server-message",
                            String(message.message || "This server was shut down by the developer.")
                        );
                    } catch {}

                    window.__webminecraftMultiplayerActive = false;
                    window.__webminecraftMultiplayerPlayerId = null;

                    try { socket.close(); } catch {}
                    window.setTimeout(() => window.location.reload(), 50);
                }

                if (message?.type === "player_kicked") {
                    try {
                        sessionStorage.setItem(
                            "webminecraft-server-message",
                            String(message.message || "You were kicked from the server.")
                        );
                    } catch {}

                    window.__webminecraftMultiplayerActive = false;
                    window.__webminecraftMultiplayerPlayerId = null;

                    try { socket.close(); } catch {}
                    window.setTimeout(() => window.location.reload(), 50);
                }
            });

            return socket;
        }
    });

    window.__webminecraftAdminSocketWatcher = true;
}

// Show the reason after returning to the home/main menu.
try {
    const message = sessionStorage.getItem("webminecraft-server-message");
    if (message) {
        sessionStorage.removeItem("webminecraft-server-message");
        window.setTimeout(() => {
            const show = () => {
                const mainMenu = document.getElementById("mainMenu");
                if (mainMenu) mainMenu.style.display = "flex";
                window.alert(message);
            };
            if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show, { once: true });
            else show();
        }, 100);
    }
} catch {}
