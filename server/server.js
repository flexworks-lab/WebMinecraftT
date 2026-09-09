import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT) || 2567;
const MAX_PLAYERS_PER_SERVER = Math.max(2, Number(process.env.MAX_PLAYERS) || 10);
const TICK_RATE = 20;
const BROADCAST_INTERVAL = 1000 / TICK_RATE;
const MAX_NAME_LENGTH = 16;

const rooms = new Map();

function createRoom(id) {
    return {
        id,
        players: new Map(),
        createdAt: Date.now(),
    };
}

function getOrCreateRoom(id) {
    if (!rooms.has(id)) rooms.set(id, createRoom(id));
    return rooms.get(id);
}

function cleanRoom(room) {
    if (room.players.size === 0) rooms.delete(room.id);
}

function sanitizeRoom(value) {
    const room = String(value ?? "default")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 32);
    return room || "default";
}

function sanitizeName(value) {
    const name = String(value ?? "Player")
        .trim()
        .replace(/[<>]/g, "")
        .slice(0, MAX_NAME_LENGTH);
    return name || "Player";
}

function send(ws, message) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

function broadcast(room, message, exceptId = null) {
    const payload = JSON.stringify(message);
    for (const player of room.players.values()) {
        if (player.id === exceptId) continue;
        if (player.ws.readyState === player.ws.OPEN) player.ws.send(payload);
    }
}

function publicPlayer(player) {
    return {
        id: player.id,
        name: player.name,
        position: player.position,
        rotation: player.rotation,
    };
}

const httpServer = http.createServer((request, response) => {
    if (request.url === "/health") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({
            ok: true,
            rooms: rooms.size,
            players: [...rooms.values()].reduce((count, room) => count + room.players.size, 0),
        }));
        return;
    }

    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("WebMinecraft multiplayer server is running.");
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
    let player = null;
    let joined = false;

    send(ws, {
        type: "server_info",
        tickRate: TICK_RATE,
        maxPlayers: MAX_PLAYERS_PER_SERVER,
    });

    ws.on("message", (raw) => {
        let message;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            send(ws, { type: "error", code: "invalid_json", message: "Invalid message." });
            return;
        }

        if (!message || typeof message.type !== "string") return;

        if (message.type === "join") {
            if (joined) return;

            const roomId = sanitizeRoom(message.room);
            const room = getOrCreateRoom(roomId);
            if (room.players.size >= MAX_PLAYERS_PER_SERVER) {
                send(ws, { type: "error", code: "server_full", message: "This server is full." });
                return;
            }

            player = {
                id: randomUUID(),
                name: sanitizeName(message.name),
                room: roomId,
                ws,
                position: {
                    x: Number(message.position?.x) || 0,
                    y: Number(message.position?.y) || 0,
                    z: Number(message.position?.z) || 0,
                },
                rotation: {
                    x: Number(message.rotation?.x) || 0,
                    y: Number(message.rotation?.y) || 0,
                    z: Number(message.rotation?.z) || 0,
                },
                lastUpdate: Date.now(),
            };

            room.players.set(player.id, player);
            joined = true;

            send(ws, {
                type: "joined",
                playerId: player.id,
                room: room.id,
                players: [...room.players.values()].map(publicPlayer),
            });

            broadcast(room, {
                type: "player_joined",
                player: publicPlayer(player),
            }, player.id);
            return;
        }

        if (!joined || !player) return;

        if (message.type === "player_state") {
            const now = Date.now();
            if (now - player.lastUpdate < 20) return;

            const position = message.position;
            const rotation = message.rotation;
            if (!position || !rotation) return;

            player.position.x = Number(position.x) || player.position.x;
            player.position.y = Number(position.y) || player.position.y;
            player.position.z = Number(position.z) || player.position.z;
            player.rotation.x = Number(rotation.x) || player.rotation.x;
            player.rotation.y = Number(rotation.y) || player.rotation.y;
            player.rotation.z = Number(rotation.z) || player.rotation.z;
            player.lastUpdate = now;
            return;
        }

        if (message.type === "ping") {
            send(ws, { type: "pong", time: Date.now() });
        }
    });

    ws.on("close", () => {
        if (!player) return;
        const room = rooms.get(player.room);
        if (!room) return;

        room.players.delete(player.id);
        broadcast(room, {
            type: "player_left",
            playerId: player.id,
        });
        cleanRoom(room);
    });

    ws.on("error", () => {
        try { ws.close(); } catch {}
    });
});

setInterval(() => {
    for (const room of rooms.values()) {
        if (room.players.size < 2) continue;
        broadcast(room, {
            type: "player_states",
            players: [...room.players.values()].map(publicPlayer),
            serverTime: Date.now(),
        });
    }
}, BROADCAST_INTERVAL);

httpServer.listen(PORT, () => {
    console.log(`WebMinecraft multiplayer server listening on port ${PORT}`);
});
