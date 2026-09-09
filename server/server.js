import http from "node:http";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT) || 2567;
const HOST = process.env.HOST || "0.0.0.0";
const MAX_PLAYERS_PER_SERVER = Math.max(2, Number(process.env.MAX_PLAYERS) || 10);
const MAX_ROOMS = Math.max(10, Number(process.env.MAX_ROOMS) || 500);
const TICK_RATE = 20;
const BROADCAST_INTERVAL = 1000 / TICK_RATE;
const MAX_NAME_LENGTH = 16;
const MAX_MESSAGE_SIZE = 16 * 1024;
const MAX_CHAT_LENGTH = 120;

const rooms = new Map();

function createRoom(id, ownerName = "Player") {
    return {
        id,
        name: id,
        ownerName,
        players: new Map(),
        worldSeed: Math.floor(Math.random() * 4294967296) >>> 0,
        blockChanges: new Map(),
        createdAt: Date.now(),
    };
}

function getOrCreateRoom(id, ownerName = "Player") {
    let room = rooms.get(id);
    if (room) return room;
    if (rooms.size >= MAX_ROOMS) return null;
    room = createRoom(id, ownerName);
    rooms.set(id, room);
    return room;
}

function cleanRoom(room) {
    // Player-created servers stay listed even when everyone leaves.
    // Their world seed and block changes remain available for the next join.
    if (!room || room.players.size !== 0) return;
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

function sanitizeChat(value) {
    return String(value ?? "")
        .replace(/[<>]/g, "")
        .replace(/[\r\n]+/g, " ")
        .trim()
        .slice(0, MAX_CHAT_LENGTH);
}

function numberOr(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function publicPlayer(player) {
    return {
        id: player.id,
        name: player.name,
        position: player.position,
        rotation: player.rotation,
    };
}

function publicRoom(room) {
    return {
        id: room.id,
        name: room.name,
        owner: room.ownerName,
        players: room.players.size,
        maxPlayers: MAX_PLAYERS_PER_SERVER,
        worldSeed: room.worldSeed,
        createdAt: room.createdAt,
    };
}

function send(ws, message) {
    if (!ws.connected) return;
    ws.sendText(JSON.stringify(message));
}

function broadcast(room, message, exceptId = null) {
    const payload = JSON.stringify(message);
    for (const player of room.players.values()) {
        if (player.id === exceptId || !player.ws.connected) continue;
        player.ws.sendText(payload);
    }
}

function encodeFrame(text) {
    const payload = Buffer.from(text);
    let header;
    if (payload.length < 126) {
        header = Buffer.from([0x81, payload.length]);
    } else if (payload.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    return Buffer.concat([header, payload]);
}

function decodeFrames(buffer, onMessage, onClose) {
    let offset = 0;
    while (offset + 2 <= buffer.length) {
        const first = buffer[offset];
        const second = buffer[offset + 1];
        const opcode = first & 0x0f;
        const masked = Boolean(second & 0x80);
        let length = second & 0x7f;
        let headerLength = 2;

        if (length === 126) {
            if (offset + 4 > buffer.length) break;
            length = buffer.readUInt16BE(offset + 2);
            headerLength = 4;
        } else if (length === 127) {
            if (offset + 10 > buffer.length) break;
            const bigLength = buffer.readBigUInt64BE(offset + 2);
            if (bigLength > BigInt(MAX_MESSAGE_SIZE)) return { consumed: buffer.length, closed: true };
            length = Number(bigLength);
            headerLength = 10;
        }

        const maskLength = masked ? 4 : 0;
        const frameLength = headerLength + maskLength + length;
        if (offset + frameLength > buffer.length) break;

        if (opcode === 0x8) {
            onClose();
            return { consumed: offset + frameLength, closed: true };
        }

        if (opcode === 0x9) {
            onMessage({ kind: "ping", payload: Buffer.alloc(0) });
            offset += frameLength;
            continue;
        }

        if (opcode !== 0x1) {
            offset += frameLength;
            continue;
        }

        let payload = buffer.subarray(offset + headerLength + maskLength, offset + frameLength);
        if (masked) {
            const maskStart = offset + headerLength;
            const mask = buffer.subarray(maskStart, maskStart + 4);
            payload = Buffer.from(payload);
            for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
        }

        onMessage({ kind: "text", payload });
        offset += frameLength;
    }

    return { consumed: offset, closed: false };
}

class SimpleWebSocket {
    constructor(socket) {
        this.socket = socket;
        this.connected = true;
        this.buffer = Buffer.alloc(0);
        this.messageHandler = null;
        this.closeHandler = null;
        this.pingHandler = null;

        socket.on("data", chunk => this.handleData(chunk));
        socket.on("close", () => this.close());
        socket.on("error", () => this.close());
    }

    onMessage(handler) { this.messageHandler = handler; }
    onClose(handler) { this.closeHandler = handler; }
    onPing(handler) { this.pingHandler = handler; }

    sendText(text) {
        if (!this.connected) return;
        this.socket.write(encodeFrame(text));
    }

    sendPong() {
        if (!this.connected) return;
        this.socket.write(Buffer.from([0x8a, 0x00]));
    }

    handleData(chunk) {
        if (!this.connected) return;
        this.buffer = Buffer.concat([this.buffer, chunk]);
        if (this.buffer.length > MAX_MESSAGE_SIZE * 2) {
            this.close();
            return;
        }

        const result = decodeFrames(
            this.buffer,
            frame => {
                if (frame.kind === "ping") {
                    this.sendPong();
                    this.pingHandler?.();
                    return;
                }
                if (frame.payload.length > MAX_MESSAGE_SIZE) {
                    this.close();
                    return;
                }
                this.messageHandler?.(frame.payload.toString("utf8"));
            },
            () => this.close(),
        );

        if (result.closed) {
            this.buffer = Buffer.alloc(0);
        } else if (result.consumed > 0) {
            this.buffer = this.buffer.subarray(result.consumed);
        }
    }

    close() {
        if (!this.connected) return;
        this.connected = false;
        try { this.socket.end(); } catch {}
        this.closeHandler?.();
    }
}

function acceptWebSocket(request, socket) {
    const key = request.headers["sec-websocket-key"];
    if (!key) {
        socket.destroy();
        return null;
    }

    const accept = crypto
        .createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");

    socket.write(
        "HTTP/1.1 101 Switching Protocols\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
    );

    return new SimpleWebSocket(socket);
}

function handleMessage(ws, raw, state) {
    let message;
    try {
        message = JSON.parse(raw);
    } catch {
        send(ws, { type: "error", code: "invalid_json", message: "Invalid message." });
        return;
    }

    if (!message || typeof message.type !== "string") return;

    if (message.type === "join") {
        if (state.joined) return;

        const roomId = sanitizeRoom(message.room);
        const safeName = sanitizeName(message.name);
        const room = getOrCreateRoom(roomId, safeName);
        if (!room) {
            send(ws, { type: "error", code: "server_limit", message: "The server has reached its room limit." });
            ws.close();
            return;
        }
        if (room.players.size >= MAX_PLAYERS_PER_SERVER) {
            send(ws, { type: "error", code: "server_full", message: "This server is full." });
            ws.close();
            return;
        }

        const player = {
            id: randomUUID(),
            name: safeName,
            room: roomId,
            ws,
            position: {
                x: numberOr(message.position?.x),
                y: numberOr(message.position?.y),
                z: numberOr(message.position?.z),
            },
            rotation: {
                x: numberOr(message.rotation?.x),
                y: numberOr(message.rotation?.y),
                z: numberOr(message.rotation?.z),
            },
            lastUpdate: 0,
        };

        room.players.set(player.id, player);
        state.player = player;
        state.joined = true;

        send(ws, {
            type: "joined",
            playerId: player.id,
            room: room.id,
            serverName: room.name,
            ownerName: room.ownerName,
            worldSeed: room.worldSeed,
            maxPlayers: MAX_PLAYERS_PER_SERVER,
            worldChanges: [...room.blockChanges.values()],
            players: [...room.players.values()].map(publicPlayer),
        });

        broadcast(room, { type: "player_joined", player: publicPlayer(player) }, player.id);
        broadcast(room, { type: "chat_system", text: `${player.name} has joined the server` });
        return;
    }

    const player = state.player;
    if (!state.joined || !player) return;

    if (message.type === "chat_message") {
        const room = rooms.get(player.room);
        if (!room) return;
        const text = sanitizeChat(message.text);
        if (!text) return;
        broadcast(room, {
            type: "chat_message",
            playerId: player.id,
            name: player.name,
            text,
        });
        return;
    }

    if (message.type === "block_change") {
        const x = Math.floor(numberOr(message.x, NaN));
        const y = Math.floor(numberOr(message.y, NaN));
        const z = Math.floor(numberOr(message.z, NaN));
        const type = Math.floor(numberOr(message.blockType, NaN));
        if (![x, y, z, type].every(Number.isFinite) || y < -32 || y > 95 || type < 0 || type > 15) return;
        const room = rooms.get(player.room);
        if (!room) return;
        const key = `${x},${y},${z}`;
        const change = { x, y, z, type };
        room.blockChanges.set(key, change);
        if (room.blockChanges.size > 50000) {
            const oldest = room.blockChanges.keys().next().value;
            if (oldest) room.blockChanges.delete(oldest);
        }

        broadcast(room, { type: "block_change", x, y, z, type });
        send(ws, { type: "block_change_ack", x, y, z, type });
        return;
    }

    if (message.type === "world_sync_request") {
        const room = rooms.get(player.room);
        if (!room) return;
        send(ws, {
            type: "world_sync",
            worldSeed: room.worldSeed,
            worldChanges: [...room.blockChanges.values()],
        });
        return;
    }

    if (message.type === "player_state") {
        const now = Date.now();
        if (now - player.lastUpdate < 20) return;

        if (message.position && message.rotation) {
            player.position.x = numberOr(message.position.x, player.position.x);
            player.position.y = numberOr(message.position.y, player.position.y);
            player.position.z = numberOr(message.position.z, player.position.z);
            player.rotation.x = numberOr(message.rotation.x, player.rotation.x);
            player.rotation.y = numberOr(message.rotation.y, player.rotation.y);
            player.rotation.z = numberOr(message.rotation.z, player.rotation.z);
            player.lastUpdate = now;
        }
        return;
    }

    if (message.type === "ping") {
        send(ws, { type: "pong", time: Date.now() });
    }
}

const httpServer = http.createServer((request, response) => {
    if (request.url === "/health") {
        response.writeHead(200, {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-store",
        });
        response.end(JSON.stringify({
            ok: true,
            rooms: rooms.size,
            players: [...rooms.values()].reduce((count, room) => count + room.players.size, 0),
            maxPlayers: MAX_PLAYERS_PER_SERVER,
            maxRooms: MAX_ROOMS,
        }));
        return;
    }

    if (request.url === "/servers") {
        const totalPlayers = [...rooms.values()].reduce((count, room) => count + room.players.size, 0);
        response.writeHead(200, {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "no-store",
        });
        response.end(JSON.stringify({
            servers: [{
                id: "webminecraft-official",
                name: "WebMinecraft Official",
                online: true,
                players: totalPlayers,
                maxPlayers: MAX_PLAYERS_PER_SERVER,
                rooms: [...rooms.values()].map(publicRoom),
            }],
            updatedAt: Date.now(),
        }));
        return;
    }

    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("WebMinecraft multiplayer server is running.");
});

httpServer.on("upgrade", (request, socket) => {
    if (request.url !== "/multiplayer") {
        socket.destroy();
        return;
    }

    const ws = acceptWebSocket(request, socket);
    if (!ws) return;

    const state = { joined: false, player: null };

    send(ws, {
        type: "server_info",
        tickRate: TICK_RATE,
        maxPlayers: MAX_PLAYERS_PER_SERVER,
        maxRooms: MAX_ROOMS,
    });

    ws.onMessage(raw => handleMessage(ws, raw, state));
    ws.onClose(() => {
        const player = state.player;
        if (!player) return;
        const room = rooms.get(player.room);
        if (!room) return;

        room.players.delete(player.id);
        broadcast(room, { type: "chat_system", text: `${player.name} has left the server` });
        broadcast(room, { type: "player_left", playerId: player.id });
        cleanRoom(room);
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

httpServer.listen(PORT, HOST, () => {
    console.log(`WebMinecraft multiplayer server listening on ${HOST}:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`WebSocket: ws://localhost:${PORT}/multiplayer`);
});
