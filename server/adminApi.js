const DEV_EMAIL = "worthmarcus19@gmail.com";
const MAX_CHAT_LENGTH = 120;

function sendJson(response, status, data) {
    response.writeHead(status, {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
    });
    response.end(JSON.stringify(data));
}

async function verifyDeveloper(request) {
    const auth = String(request.headers.authorization || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return false;

    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
        if (!response.ok) return false;
        const data = await response.json();
        return String(data.email || "").toLowerCase() === DEV_EMAIL.toLowerCase() && data.email_verified !== "false";
    } catch {
        return false;
    }
}

function roomInfo(room) {
    return {
        id: room.id,
        name: room.name,
        owner: room.ownerName,
        players: [...room.players.values()].map(player => ({ id: player.id, name: player.name })),
        chat: [...(room.adminChat || [])],
        private: Boolean(room.isPrivate),
        createdAt: room.createdAt,
    };
}

function addChat(room, name, text) {
    const cleanText = String(text || "").replace(/[\r\n]+/g, " ").replace(/[<>]/g, "").trim().slice(0, MAX_CHAT_LENGTH);
    if (!cleanText) return false;
    room.adminChat ||= [];
    room.adminChat.push({ name, text: cleanText, system: false, time: Date.now() });
    while (room.adminChat.length > 100) room.adminChat.shift();
    return cleanText;
}

function broadcast(room, message) {
    const payload = JSON.stringify(message);
    for (const player of room.players.values()) {
        if (player.ws?.connected) player.ws.sendText(payload);
    }
}

async function readBody(request) {
    return await new Promise(resolve => {
        let body = "";
        request.on("data", chunk => {
            body += chunk;
            if (body.length > 64 * 1024) request.destroy();
        });
        request.on("end", () => {
            try { resolve(JSON.parse(body || "{}")); } catch { resolve(null); }
        });
        request.on("error", () => resolve(null));
    });
}

export async function handleAdminRequest(request, response, rooms, cleanRoom) {
    if (request.method === "OPTIONS") {
        response.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "Authorization, Content-Type", "access-control-allow-methods": "GET, POST, OPTIONS" });
        response.end();
        return true;
    }

    if (!(await verifyDeveloper(request))) {
        sendJson(response, 403, { ok: false, error: "Developer access denied." });
        return true;
    }

    if (request.method === "GET" && request.url === "/admin/servers") {
        sendJson(response, 200, { ok: true, servers: [...rooms.values()].map(roomInfo), updatedAt: Date.now() });
        return true;
    }

    if (request.method !== "POST" || request.url !== "/admin/action") {
        sendJson(response, 404, { ok: false, error: "Not found." });
        return true;
    }

    const body = await readBody(request);
    const action = String(body?.action || "");
    const room = rooms.get(String(body?.serverId || ""));
    if (!room) {
        sendJson(response, 404, { ok: false, error: "Server not found." });
        return true;
    }

    if (action === "kick") {
        const player = room.players.get(String(body?.playerId || ""));
        if (!player) return sendJson(response, 404, { ok: false, error: "Player not found." });
        try { player.ws.close(); } catch {}
        sendJson(response, 200, { ok: true, message: `${player.name} was kicked.` });
        return true;
    }

    if (action === "shutdown") {
        for (const player of [...room.players.values()]) {
            try { player.ws.close(); } catch {}
        }
        rooms.delete(room.id);
        sendJson(response, 200, { ok: true, message: `${room.name} was shut down.` });
        return true;
    }

    if (action === "delete") {
        for (const player of [...room.players.values()]) {
            try { player.ws.close(); } catch {}
        }
        rooms.delete(room.id);
        sendJson(response, 200, { ok: true, message: `${room.name} was deleted.` });
        return true;
    }

    if (action === "chat") {
        const text = addChat(room, "Developer", body?.text);
        if (!text) return sendJson(response, 400, { ok: false, error: "Message is empty." });
        broadcast(room, { type: "chat_message", playerId: "developer", name: "Developer", text });
        sendJson(response, 200, { ok: true });
        return true;
    }

    sendJson(response, 400, { ok: false, error: "Unknown action." });
    return true;
}
