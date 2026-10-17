let commandsOverlay = null;
let commandsInitialized = false;

const COMMANDS = [
    { command: "/help", description: "Show the command list." },
    { command: "/coords", description: "Show your current X, Y, Z coordinates." },
    { command: "/seed", description: "Show the current world seed." },
    { command: "/players", description: "Show how many players are in the room." },
    { command: "/tp", description: "Teleport to coordinates: /tp X Y Z." },
    { command: "/clear", description: "Clear the chat messages." }
];

function ensureCommandsUI() {
    if (commandsInitialized) return;
    commandsInitialized = true;

    const style = document.createElement("style");
    style.id = "multiplayerCommandsStyles";
    style.textContent = `
        #multiplayerCommandsPanel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(430px,calc(100vw - 28px));max-height:min(70vh,520px);overflow:auto;padding:16px;background:rgba(25,25,25,.98);color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.55);z-index:230;font-family:Arial,sans-serif;display:none}
        #multiplayerCommandsPanel h3{margin:0 0 4px;font-family:"MinecraftFont",monospace;font-size:21px;text-shadow:2px 2px 0 #000}
        #multiplayerCommandsPanel p{margin:0 0 12px;color:#aaa;font-size:11px}
        .multiplayerCommandRow{display:flex;align-items:center;gap:12px;padding:9px 8px;background:#303030;border:1px solid #444;margin-top:6px}
        .multiplayerCommandName{min-width:82px;font-family:"MinecraftFont",monospace;color:#9fce72;font-size:12px}
        .multiplayerCommandDescription{color:#ddd;font-size:11px;line-height:1.35}
        #multiplayerCommandsClose{margin-top:12px;width:100%;min-height:38px;padding:8px;background:linear-gradient(#696969,#505050);color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222}
        #multiplayerCommandsButton{box-sizing:border-box;width:100%;height:30px;margin-top:6px;padding:4px 8px;background:#303030;color:#ddd;border:1px solid #555;cursor:pointer;font:11px Arial,sans-serif;pointer-events:auto}
        #multiplayerCommandsButton:hover{background:#414141;color:#fff}
    `;
    document.head.appendChild(style);

    commandsOverlay = document.createElement("div");
    commandsOverlay.id = "multiplayerCommandsPanel";
    commandsOverlay.innerHTML = `
        <h3>Commands</h3>
        <p>Available commands</p>
        <div id="multiplayerCommandList"></div>
        <button id="multiplayerCommandsClose" type="button">Close</button>
    `;
    document.body.appendChild(commandsOverlay);

    const list = commandsOverlay.querySelector("#multiplayerCommandList");
    for (const entry of COMMANDS) {
        const row = document.createElement("div");
        row.className = "multiplayerCommandRow";
        const name = document.createElement("span");
        name.className = "multiplayerCommandName";
        name.textContent = entry.command;
        const description = document.createElement("span");
        description.className = "multiplayerCommandDescription";
        description.textContent = entry.description;
        row.append(name, description);
        list.appendChild(row);
    }

    commandsOverlay.querySelector("#multiplayerCommandsClose")?.addEventListener("click", closeCommands);
}

export function openCommands() {
    ensureCommandsUI();
    commandsOverlay.style.display = "block";
}

export function closeCommands() {
    if (commandsOverlay) commandsOverlay.style.display = "none";
}

export function makeCommandsButton() {
    ensureCommandsUI();
    const button = document.createElement("button");
    button.id = "multiplayerCommandsButton";
    button.type = "button";
    button.textContent = "Commands";
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openCommands();
    });
    return button;
}

export function runLocalCommand(rawText, context = {}) {
    const text = String(rawText || "").trim();
    if (!text.startsWith("/")) return false;

    const parts = text.slice(1).trim().split(/\s+/);
    const name = (parts.shift() || "").toLowerCase();
    const args = parts;
    const addMessage = typeof context.addMessage === "function" ? context.addMessage : () => {};

    switch (name) {
        case "help":
            addMessage(COMMANDS.map(entry => `${entry.command} - ${entry.description}`).join("\n"), true);
            return true;
        case "coords": {
            const camera = context.camera;
            if (!camera?.position) {
                addMessage("Coordinates are unavailable.", true);
                return true;
            }
            addMessage(`X: ${Math.floor(camera.position.x)}  Y: ${Math.floor(camera.position.y)}  Z: ${Math.floor(camera.position.z)}`, true);
            return true;
        }
        case "seed":
            addMessage(context.getWorldSeed ? `World Seed: ${context.getWorldSeed()}` : "World seed is unavailable.", true);
            return true;
        case "players": {
            const count = Number(context.getPlayerCount?.() ?? 0);
            addMessage(`Players in room: ${Number.isFinite(count) ? count : 0}`, true);
            return true;
        }
        case "tp": {
            const camera = context.camera;
            if (!camera?.position) {
                addMessage("Teleport is unavailable.", true);
                return true;
            }
            if (args.length !== 3) {
                addMessage("Usage: /tp X Y Z", true);
                return true;
            }

            const [x, y, z] = args.map(Number);
            if (![x, y, z].every(Number.isFinite)) {
                addMessage("Usage: /tp X Y Z", true);
                return true;
            }

            camera.position.set(x, y, z);
            addMessage(`Teleported to ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)}`, true);
            context.syncPlayer?.();
            return true;
        }
        case "clear":
            context.clearChat?.();
            return true;
        default:
            addMessage(`Unknown command: ${name}. Use /help.`, true);
            return true;
    }
}

export { COMMANDS };
