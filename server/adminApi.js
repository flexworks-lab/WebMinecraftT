import crypto from "node:crypto";

const DEV_EMAIL = "worthmarcus19@gmail.com";
const FIREBASE_PROJECT_ID = "webminecraft-f9064";
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const MAX_CHAT_LENGTH = 120;

let certCache = null;
let certCacheExpiresAt = 0;

function sendJson(response, status, data) {
    response.writeHead(status, {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
    });
    response.end(JSON.stringify(data));
}

function decodeBase64Url(value) {
    return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

async function getFirebaseCerts() {
    if (certCache && Date.now() < certCacheExpiresAt) return certCache;

    const response = await fetch(FIREBASE_CERTS_URL);
    if (!response.ok) throw new Error(`Firebase certificate request failed: ${response.status}`);

    const certs = await response.json();
    const cacheControl = response.headers.get("cache-control") || "";
    const match = cacheControl.match(/max-age=(\d+)/i);
    const maxAge = Math.max(300, Math.min(Number(match?.[1] || 3600), 86400));

    certCache = certs;
    certCacheExpiresAt = Date.now() + maxAge * 1000;
    return certs;
}

async function verifyFirebaseIdToken(token) {
    const parts = String(token).split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    let header;
    let payload;

    try {
        header = JSON.parse(decodeBase64Url(encodedHeader));
        payload = JSON.parse(decodeBase64Url(encodedPayload));
    } catch {
        return null;
    }

    if (header?.alg !== "RS256" || !header?.kid) return null;
    if (payload?.aud !== FIREBASE_PROJECT_ID) return null;
    if (payload?.iss !== FIREBASE_ISSUER) return null;
    if (!payload?.sub || typeof payload.sub !== "string" || payload.sub.length > 128) return null;

    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(payload.exp) || payload.exp <= now) return null;
    if (Number.isFinite(payload.iat) && payload.iat > now + 300) return null;

    const certs = await getFirebaseCerts();
    const certificate = certs?.[header.kid];
    if (!certificate) return null;

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();

    const signature = Buffer.from(
        encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
    );

    if (!verifier.verify(certificate, signature)) return null;
    return payload;
}

async function verifyDeveloper(request) {
    const auth = String(request.headers.authorization || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) return false;

    try {
        const data = await verifyFirebaseIdToken(token);
        if (!data) return false;

        const email = String(data.email || "").trim().toLowerCase();
        const verified = data.email_verified === true || data.email_verified === "true";

        return email === DEV_EMAIL.toLowerCase() && verified;
    } catch (error) {
        console.error("Firebase developer authentication failed:", error?.message || error);
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
        try {
            player.ws.sendText(JSON.stringify({
                type: "player_kicked",
                message: "You were kicked from the server by the developer."
            }));
        } catch {}
        try { player.ws.close(); } catch {}
        sendJson(response, 200, { ok: true, message: `${player.name} was kicked.` });
        return true;
    }

    if (action === "warn") {
        const playerIds = Array.isArray(body?.playerIds) ? body.playerIds : [body?.playerId];
        const players = [...new Set(playerIds.map(id => String(id || "")).filter(Boolean))]
            .map(id => room.players.get(id))
            .filter(Boolean);
        if (!players.length) return sendJson(response, 404, { ok: false, error: "No players selected." });

        const text = String(body?.text || "Please behave appropriately and follow the server rules.")
            .replace(/[\r\n]+/g, " ")
            .replace(/[<>]/g, "")
            .trim()
            .slice(0, MAX_CHAT_LENGTH) || "Please behave appropriately and follow the server rules.";

        const payload = JSON.stringify({
            type: "chat_system",
            text: `Developer warning: ${text}`
        });
        for (const player of players) {
            try {
                if (player.ws?.connected) player.ws.sendText(payload);
            } catch {}
        }
        sendJson(response, 200, { ok: true, message: `Warning sent to ${players.length} player${players.length === 1 ? "" : "s"}.` });
        return true;
    }

    if (action === "shutdown" || action === "delete") {
        const message = action === "delete"
            ? "This server was deleted by the developer. Returning to the main menu."
            : "This server was shut down by the developer. Returning to the main menu.";

        for (const player of [...room.players.values()]) {
            try {
                player.ws.sendText(JSON.stringify({
                    type: "server_removed",
                    message
                }));
            } catch {}
        }

        for (const player of [...room.players.values()]) {
            try { player.ws.close(); } catch {}
        }
        rooms.delete(room.id);
        sendJson(response, 200, { ok: true, message: `${room.name} was ${action === "delete" ? "deleted" : "shut down"}.` });
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
