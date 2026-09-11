import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, "server.js");

// Prepare the live multiplayer server before starting it. This keeps the
// existing server file simple while adding the authenticated developer API.
try {
    const source = fs.readFileSync(serverPath, "utf8");
    const adminImport = 'import { handleAdminRequest as __webMinecraftHandleAdmin } from "./adminApi.js";\n';
    let fixed = source;
    if (!fixed.includes("__webMinecraftHandleAdmin")) fixed = adminImport + fixed;
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
    fixed = fixed.replace(
        'const httpServer = http.createServer((request, response) => {',
        'const httpServer = http.createServer(async (request, response) => {\n    if (request.url?.startsWith("/admin/")) {\n        const handled = await __webMinecraftHandleAdmin(request, response, rooms, cleanRoom);\n        if (handled) return;\n    }'
    );
    fs.writeFileSync(serverPath, fixed, "utf8");
} catch (error) {
    console.error("Could not prepare multiplayer server:", error);
}

await import(pathToFileURL(serverPath).href + `?worldSync=${Date.now()}`);
