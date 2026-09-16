import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, "server.js");

// Prepare the live multiplayer server before starting it. This keeps the
// existing server file simple while adding authenticated developer APIs.
try {
    const source = fs.readFileSync(serverPath, "utf8");
    const adminImport = 'import { handleAdminRequest as __webMinecraftHandleAdmin } from "./adminApi.js";\n';
    const devAIImport = 'import { handleDevAIRequest as __webMinecraftHandleDevAI } from "./devAiApi.js";\n';
    let fixed = source;
    if (!fixed.includes("__webMinecraftHandleAdmin")) fixed = adminImport + fixed;
    if (!fixed.includes("__webMinecraftHandleDevAI")) fixed = devAIImport + fixed;
    fixed = fixed.replace(
        'broadcast(room, { type: "block_change", x, y, z, type });',
        'broadcast(room, { type: "block_change", x, y, z, blockType: type });'
    ).replace(
        'send(ws, { type: "block_change_ack", x, y, z, type });',
        'send(ws, { type: "block_change_ack", x, y, z, blockType: type });'
    );
    fixed = fixed.replace(
        'const rooms = new Map();',
        'const rooms = new Map();\n\nfor (const room of rooms.values()) room.adminChat ||= [];'
    );
    fixed = fixed.replace(
        '        blockChanges: new Map(),\n        createdAt: Date.now(),',
        '        blockChanges: new Map(),\n        adminChat: [],\n        createdAt: Date.now(),'
    );
    fixed = fixed.replace(
        '        broadcast(room, { type: "chat_message", playerId: player.id, name: player.name, text });',
        '        room.adminChat ||= [];\n        room.adminChat.push({ name: player.name, text, system: false, time: Date.now() });\n        while (room.adminChat.length > 100) room.adminChat.shift();\n        broadcast(room, { type: "chat_message", playerId: player.id, name: player.name, text });'
    );

    // Add a persistent Creative/Survival mode to each multiplayer room.
    if (!fixed.includes("__webMinecraftNormalizeMode")) {
        fixed = fixed.replace(
            'function sanitizeRoom(value) {',
            'function __webMinecraftNormalizeMode(value) {\n    return String(value).toLowerCase() === "creative" ? "creative" : "survival";\n}\n\nfunction sanitizeRoom(value) {'
        );
        fixed = fixed.replace(
            'function createRoom(id, ownerName = "Player", isPrivate = false, privateCode = "") {',
            'function createRoom(id, ownerName = "Player", isPrivate = false, privateCode = "", mode = "survival") {'
        );
        fixed = fixed.replace(
            '        isPrivate: Boolean(isPrivate),\n        privateCode:',
            '        isPrivate: Boolean(isPrivate),\n        mode: __webMinecraftNormalizeMode(mode),\n        privateCode:'
        );
        fixed = fixed.replace(
            'function getOrCreateRoom(id, ownerName = "Player", isPrivate = false) {',
            'function getOrCreateRoom(id, ownerName = "Player", isPrivate = false, mode = "survival") {'
        );
        fixed = fixed.replace(
            '    room = createRoom(id, ownerName, isPrivate);',
            '    room = createRoom(id, ownerName, isPrivate, "", mode);'
        );
        fixed = fixed.replace(
            '        private: Boolean(room.isPrivate),\n        worldSeed:',
            '        private: Boolean(room.isPrivate),\n        mode: __webMinecraftNormalizeMode(room.mode),\n        worldSeed:'
        );
        fixed = fixed.replace(
            '        const wantsPrivate = Boolean(message.private);\n        const suppliedCode',
            '        const wantsPrivate = Boolean(message.private);\n        const requestedMode = __webMinecraftNormalizeMode(message.mode);\n        const suppliedCode'
        );
        fixed = fixed.replace(
            '        room = getOrCreateRoom(roomId, safeName, wantsPrivate);',
            '        room = getOrCreateRoom(roomId, safeName, wantsPrivate, requestedMode);\n        room.mode = __webMinecraftNormalizeMode(room.mode);'
        );
        fixed = fixed.replace(
            '            private: Boolean(room.isPrivate),\n            privateCode:',
            '            private: Boolean(room.isPrivate),\n            mode: __webMinecraftNormalizeMode(room.mode),\n            privateCode:'
        );
        fixed = fixed.replace(
            '    if (!fixed.includes("__webMinecraftModePatchComplete")) fixed += "\n";',
            '    fixed'
        );
    }

    fixed = fixed.replace(
        'const httpServer = http.createServer((request, response) => {',
        'const httpServer = http.createServer(async (request, response) => {\n    if (request.url?.startsWith("/admin/")) {\n        const handled = await __webMinecraftHandleAdmin(request, response, rooms, cleanRoom);\n        if (handled) return;\n    }\n    if (request.url === "/api/dev-ai") {\n        const handled = await __webMinecraftHandleDevAI(request, response);\n        if (handled) return;\n    }'
    );
    fs.writeFileSync(serverPath, fixed, "utf8");
} catch (error) {
    console.error("Could not prepare multiplayer server:", error);
}

await import(pathToFileURL(serverPath).href + `?worldSync=${Date.now()}`);
