import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
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
const EMPTY_ROOM_RETENTION_MS = 24 * 60 * 60 * 1000;
const ROOM_STATE_FILE = process.env.ROOM_STATE_FILE || "./data/rooms.json";
const MAX_BLOCK_TYPE = 184;

const rooms = new Map();
let roomSaveTimer = null;

function roomStatePath() {
    return path.resolve(ROOM_STATE_FILE);
}

function serializeRoom(room) {
    return {
        id: room.id,
        name: room.name,
        ownerName: room.ownerName,
        isPrivate: Boolean(room.isPrivate),
        mode: normalizeMode(room.mode),
        keepOpen24h: Boolean(room.keepOpen24h),
        privateCode: room.privateCode || "",
        worldSeed: room.worldSeed,
        createdAt: Number(room.createdAt) || Date.now(),
        emptySince: Number(room.emptySince) || null,
        blockChanges: [...room.blockChanges.values()],
    };
}

function saveRoomsStateSync() {
    try {
        const file = roomStatePath();
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify([...rooms.values()].map(serializeRoom)), "utf8");
    } catch (error) {
        console.warn("Could not persist multiplayer room state:", error);
    }
}

function scheduleRoomStateSave() {
    clearTimeout(roomSaveTimer);
    roomSaveTimer = setTimeout(() => {
        roomSaveTimer = null;
        saveRoomsStateSync();
    }, 250);
}

function loadRoomsState() {
    try {
        const file = roomStatePath();
        if (!fs.existsSync(file)) return;
        const saved = JSON.parse(fs.readFileSync(file, "utf8"));
        if (!Array.isArray(saved)) return;

        const now = Date.now();
        for (const data of saved) {
            const id = String(data?.id || "").trim();
            if (!id || id.toLowerCase() === "player" || rooms.has(id)) continue;

            const emptySince = Number(data?.emptySince) || Number(data?.createdAt) || now;
            if (now - emptySince > EMPTY_ROOM_RETENTION_MS) continue;

            const room = createRoom(
                sanitizeRoom(id),
                sanitizeName(data?.ownerName),
                Boolean(data?.isPrivate),
                String(data?.privateCode || "").slice(0, 16),
                normalizeMode(data?.mode),
                data?.keepOpen24h !== false
            );
            room.name = room.id;
            room.worldSeed = Number(data?.worldSeed) >>> 0;
            room.createdAt = Number(data?.createdAt) || now;
            room.emptySince = emptySince;
            room.blockChanges = new Map();

            for (const change of Array.isArray(data?.blockChanges) ? data.blockChanges : []) {
                const x = Math.floor(numberOr(change?.x, NaN));
                const y = Math.floor(numberOr(change?.y, NaN));
                const z = Math.floor(numberOr(change?.z, NaN));
                const type = Math.floor(numberOr(change?.type ?? change?.blockType, NaN));
                if (![x, y, z, type].every(Number.isFinite) || y < -32 || y > 95 || type < 0 || type > MAX_BLOCK_TYPE) continue;
                room.blockChanges.set(`${x},${y},${z}`, { x, y, z, type });
            }

            while (room.blockChanges.size > 50000) {
                const oldest = room.blockChanges.keys().next().value;
                if (oldest) room.blockChanges.delete(oldest); else break;
            }
            rooms.set(room.id, room);
        }
    } catch (error) {
        console.warn("Could not load persisted multiplayer rooms:", error);
    }
}

function normalizeMode(value) {
    return String(value ?? "").toLowerCase() === "creative" ? "creative" : "survival";
}

function createRoom(id, ownerName = "Player", isPrivate = false, privateCode = "", mode = "survival", keepOpen24h = false) {
    return {
        id,
        name: id,
        ownerName,
        isPrivate: Boolean(isPrivate),
        mode: normalizeMode(mode),
        keepOpen24h: Boolean(keepOpen24h),
        privateCode: privateCode || (isPrivate ? String(Math.floor(100000 + Math.random() * 900000)) : ""),
        players: new Map(),
        worldSeed: Math.floor(Math.random() * 4294967296) >>> 0,
        blockChanges: new Map(),
        drops: new Map(),
        createdAt: Date.now(),
        emptySince: Date.now(),
    };
}

function getOrCreateRoom(id, ownerName = "Player", isPrivate = false, mode = "survival", keepOpen24h = false) {
    let room = rooms.get(id);
    if (room) return room;
    if (rooms.size >= MAX_ROOMS) return null;
    room = createRoom(id, ownerName, isPrivate, "", mode, keepOpen24h);
    rooms.set(id, room);
    scheduleRoomStateSave();
    return room;
}

function cleanRoom(room) {
    if (!room || room.players.size !== 0) return;
    if (rooms.get(room.id) !== room) return;

    if (!room.keepOpen24h) {
        rooms.delete(room.id);
        saveRoomsStateSync();
        return;
    }

    if (!room.emptySince) room.emptySince = Date.now();
    scheduleRoomStateSave();
}

function pruneExpiredEmptyRooms() {
    const now = Date.now();
    let changed = false;
    for (const room of rooms.values()) {
        if (room.players.size > 0 || !room.emptySince) continue;
        if (now - room.emptySince <= EMPTY_ROOM_RETENTION_MS) continue;
        rooms.delete(room.id);
        changed = true;
    }
    if (changed) saveRoomsStateSync();
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
        .replace(/[\r\n]+/g, " ")
        .replace(/[<>]/g, "")
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
        heldItemId: Number.isFinite(player.heldItemId) ? player.heldItemId : 0,
        sneaking: Boolean(player.sneaking),
        action: String(player.action || "idle"),
    };
}

function publicRoom(room) {
    return {
        id: room.id,
        name: room.name,
        owner: room.ownerName,
        players: room.players.size,
        playerNames: [...room.players.values()].map(player => player.name),
        maxPlayers: MAX_PLAYERS_PER_SERVER,
        private: Boolean(room.isPrivate),
        mode: normalizeMode(room.mode),
        keepOpen24h: Boolean(room.keepOpen24h),
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
    sendText(text) { if (this.connected) this.socket.write(encodeFrame(text)); }
    sendPong() { if (this.connected) this.socket.write(Buffer.from([0x8a, 0x00])); }
    handleData(chunk) {
        if (!this.connected) return;
        this.buffer = Buffer.concat([this.buffer, chunk]);
        if (this.buffer.length > MAX_MESSAGE_SIZE * 2) { this.close(); return; }
        const result = decodeFrames(this.buffer, frame => {
            if (frame.kind === "ping") { this.sendPong(); this.pingHandler?.(); return; }
            if (frame.payload.length > MAX_MESSAGE_SIZE) { this.close(); return; }
            this.messageHandler?.(frame.payload.toString("utf8"));
        }, () => this.close());
        if (result.closed) this.buffer = Buffer.alloc(0);
        else if (result.consumed > 0) this.buffer = this.buffer.subarray(result.consumed);
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
    if (!key) { socket.destroy(); return null; }
    const accept = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols\r\n" + "Upgrade: websocket\r\n" + "Connection: Upgrade\r\n" + `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
    return new SimpleWebSocket(socket);
}

function handleMessage(ws, raw, state) {
    let message;
    try { message = JSON.parse(raw); }
    catch { send(ws, { type: "error", code: "invalid_json", message: "Invalid message." }); return; }
    if (!message || typeof message.type !== "string") return;

    if (message.type === "join") {
        if (state.joined) return;
        const roomId = sanitizeRoom(message.room);
        const safeName = sanitizeName(message.name);
        const wantsPrivate = Boolean(message.private);
        const requestedMode = normalizeMode(message.mode);
        const suppliedCode = String(message.privateCode ?? "").trim().slice(0, 16);
        const keepOpen24h = Boolean(message.keepOpen24h);

        if (roomId.toLowerCase() === "player") {
            send(ws, { type: "error", code: "reserved_room_name", message: "The room name \"player\" is reserved. Choose another room name." });
            ws.close();
            return;
        }

        let room = rooms.get(roomId);
        if (room && room.isPrivate && suppliedCode !== room.privateCode) {
            send(ws, { type: "error", code: "private_code_required", message: "This is a private server. Enter the correct private code." });
            ws.close();
            return;
        }
        room = getOrCreateRoom(roomId, safeName, wantsPrivate, requestedMode, keepOpen24h);
        if (!room) { send(ws, { type: "error", code: "server_limit", message: "The server has reached its room limit." }); ws.close(); return; }
        if (room.players.size >= MAX_PLAYERS_PER_SERVER) { send(ws, { type: "error", code: "server_full", message: "This server is full." }); ws.close(); return; }

        const player = {
            id: randomUUID(),
            name: safeName,
            room: roomId,
            ws,
            position: { x: numberOr(message.position?.x), y: numberOr(message.position?.y), z: numberOr(message.position?.z) },
            rotation: { x: numberOr(message.rotation?.x), y: numberOr(message.rotation?.y), z: numberOr(message.rotation?.z) },
            heldItemId: 0,
            sneaking: false,
            action: "idle",
            lastUpdate: 0,
        };
        room.players.set(player.id, player);
        room.emptySince = null;
        scheduleRoomStateSave();
        state.player = player;
        state.joined = true;

        send(ws, {
            type: "joined",
            playerId: player.id,
            room: room.id,
            serverName: room.name,
            ownerName: room.ownerName,
            private: Boolean(room.isPrivate),
            mode: normalizeMode(room.mode),
            keepOpen24h: Boolean(room.keepOpen24h),
            privateCode: room.isPrivate && room.ownerName === safeName ? room.privateCode : "",
            worldSeed: room.worldSeed,
            maxPlayers: MAX_PLAYERS_PER_SERVER,
            players: [...room.players.values()].map(publicPlayer),
            worldChanges: [...room.blockChanges.values()],
            worldDrops: [...room.drops.values()],
        });
        broadcast(room, { type: "player_joined", player: publicPlayer(player) }, player.id);
        broadcast(room, { type: "chat_system", text: `${player.name} has joined the server` });
        return;
    }

    const player = state.player;
    if (!state.joined || !player) return;
    if (message.type === "server_control") {
        const room = rooms.get(player.room);
        if (!room) return;
        if (getPlayerRole(room, player) !== ROLE_OPERATOR) {
            send(ws, { type: "error", code: "operator_required", message: "Operator permission is required for server controls." });
            return;
        }

        const action = String(message.action || "").toLowerCase();
        const targetName = sanitizeName(message.targetName || "");
        const target = [...room.players.values()].find(candidate => roleKey(candidate.name) === roleKey(targetName));

        if (action === "set_role") {
            if (!target) {
                send(ws, { type: "error", code: "player_not_found", message: "Player is not online." });
                return;
            }
            if (roleKey(target.name) === roleKey(room.ownerName)) {
                send(ws, { type: "error", code: "owner_role_locked", message: "The server owner is always Operator." });
                return;
            }
            const role = normalizeRole(message.role);
            setPlayerRole(room, target.name, role);
            scheduleRoomStateSave();
            send(target.ws, { type: "role_changed", role: getPlayerRole(room, target), reason: "Your server permission was changed by an Operator." });
            broadcast(room, { type: "player_role_changed", playerId: target.id, name: target.name, role: getPlayerRole(room, target) });
            return;
        }

        if (!target) {
            send(ws, { type: "error", code: "player_not_found", message: "Player is not online." });
            return;
        }
        if (roleKey(target.name) === roleKey(room.ownerName) && ["kick", "ban"].includes(action)) {
            send(ws, { type: "error", code: "owner_protected", message: "The server owner cannot be kicked or banned." });
            return;
        }

        if (action === "kick" || action === "ban") {
            if (action === "ban") {
                room.bannedNames ||= new Set();
                room.bannedNames.add(roleKey(target.name));
                scheduleRoomStateSave();
            }
            send(target.ws, { type: "server_kick", reason: action === "ban" ? "You were banned by an Operator." : "You were kicked by an Operator." });
            target.ws.close();
            return;
        }

        if (action === "gamemode") {
            const mode = normalizeMode(message.mode);
            send(target.ws, { type: "set_gamemode", mode });
            target.action = "idle";
            return;
        }

        if (action === "teleport") {
            const x = numberOr(message.x, NaN);
            const y = numberOr(message.y, NaN);
            const z = numberOr(message.z, NaN);
            if (![x, y, z].every(Number.isFinite) || y < -32 || y > 96) {
                send(ws, { type: "error", code: "invalid_coordinates", message: "Enter valid teleport coordinates." });
                return;
            }
            send(target.ws, { type: "teleport_player", x, y, z });
            return;
        }

        if (action === "give") {
            const itemId = Math.floor(numberOr(message.itemId, NaN));
            const count = Math.max(1, Math.min(64, Math.floor(numberOr(message.count, 1))));
            if (!Number.isFinite(itemId) || itemId < 1 || itemId > MAX_BLOCK_TYPE) {
                send(ws, { type: "error", code: "invalid_item", message: "Enter a valid item ID." });
                return;
            }
            send(target.ws, { type: "admin_give", itemId, count });
            return;
        }

        send(ws, { type: "error", code: "unknown_server_control", message: "Unknown server control action." });
        return;
    }

    if (message.type === "chat_message") {
        const room = rooms.get(player.room);
        if (!room) return;
        const text = sanitizeChat(message.text);
        if (!text) return;
        broadcast(room, { type: "chat_message", playerId: player.id, name: player.name, text });
        return;
    }
    if (message.type === "block_changes") {
        if (!Array.isArray(message.changes) || message.changes.length > 1024) return;
        const room = rooms.get(player.room);
        if (!room) return;
        const changes = [];
        for (const rawChange of message.changes) {
            const x = Math.floor(numberOr(rawChange?.x, NaN));
            const y = Math.floor(numberOr(rawChange?.y, NaN));
            const z = Math.floor(numberOr(rawChange?.z, NaN));
            const type = Math.floor(numberOr(rawChange?.blockType ?? rawChange?.type, NaN));
            if (![x, y, z, type].every(Number.isFinite) || y < -32 || y > 95 || type < 0 || type > MAX_BLOCK_TYPE) continue;
            const key = `${x},${y},${z}`;
            room.blockChanges.set(key, { x, y, z, type });
            changes.push({ x, y, z, blockType: type });
        }
        while (room.blockChanges.size > 50000) {
            const oldest = room.blockChanges.keys().next().value;
            if (oldest) room.blockChanges.delete(oldest); else break;
        }
        if (changes.length) {
            scheduleRoomStateSave();
            broadcast(room, { type: "block_changes", changes }, player.id);
        }
        return;
    }
    if (message.type === "slab_place") {
        const x = Math.floor(numberOr(message.x, NaN));
        const y = Math.floor(numberOr(message.y, NaN));
        const z = Math.floor(numberOr(message.z, NaN));
        const type = Math.floor(numberOr(message.blockType, NaN));
        if (![x, y, z, type].every(Number.isFinite) || y < -32 || y > 95 || type < 51 || type > MAX_BLOCK_TYPE) return;
        const room = rooms.get(player.room);
        if (!room) return;
        const key = `${x},${y},${z}`;
        room.blockChanges.set(key, { x, y, z, type });
        scheduleRoomStateSave();
        while (room.blockChanges.size > 50000) {
            const oldest = room.blockChanges.keys().next().value;
            if (oldest) room.blockChanges.delete(oldest); else break;
        }
        broadcast(room, { type: "block_change", x, y, z, blockType: type }, player.id);
        return;
    }
    if (message.type === "block_change") {
        const x = Math.floor(numberOr(message.x, NaN));
        const y = Math.floor(numberOr(message.y, NaN));
        const z = Math.floor(numberOr(message.z, NaN));
        const type = Math.floor(numberOr(message.blockType, NaN));
        if (![x, y, z, type].every(Number.isFinite) || y < -32 || y > 95 || type < 0 || type > MAX_BLOCK_TYPE) return;
        const room = rooms.get(player.room);
        if (!room) return;
        const key = `${x},${y},${z}`;
        const change = { x, y, z, type };
        room.blockChanges.set(key, change);
        scheduleRoomStateSave();
        if (room.blockChanges.size > 50000) {
            const oldest = room.blockChanges.keys().next().value;
            if (oldest) room.blockChanges.delete(oldest);
        }
        broadcast(room, { type: "block_change", x, y, z, blockType: type });
        send(ws, { type: "block_change_ack", x, y, z, blockType: type });
        return;
    }
    if (message.type === "block_mining") {
        const x = Math.floor(numberOr(message.x, NaN));
        const y = Math.floor(numberOr(message.y, NaN));
        const z = Math.floor(numberOr(message.z, NaN));
        const blockType = Math.floor(numberOr(message.blockType, NaN));
        const progress = Number(message.progress);
        if (![x, y, z, blockType, progress].every(Number.isFinite) || y < -32 || y > 95 || blockType < 0 || blockType > 184 || progress < 0 || progress > 1) return;
        const room = rooms.get(player.room);
        if (!room) return;
        broadcast(room, { type: "block_mining", playerId: player.id, x, y, z, blockType, progress }, player.id);
        return;
    }
    if (message.type === "block_mining_stop") {
        const x = Math.floor(numberOr(message.x, NaN));
        const y = Math.floor(numberOr(message.y, NaN));
        const z = Math.floor(numberOr(message.z, NaN));
        if (![x, y, z].every(Number.isFinite) || y < -32 || y > 95) return;
        const room = rooms.get(player.room);
        if (!room) return;
        broadcast(room, { type: "block_mining_stop", playerId: player.id, x, y, z }, player.id);
        return;
    }
    if (message.type === "item_drop") {
        const id = String(message.id || "").trim().slice(0, 96);
        const itemType = Math.floor(numberOr(message.itemType, NaN));
        const count = Math.max(1, Math.floor(numberOr(message.count, 1)));
        const x = numberOr(message.x, NaN);
        const y = numberOr(message.y, NaN);
        const z = numberOr(message.z, NaN);
        const velocityX = numberOr(message.velocityX, 0);
        const velocityY = numberOr(message.velocityY, 0);
        const velocityZ = numberOr(message.velocityZ, 0);
        if (!id || ![itemType, count, x, y, z, velocityX, velocityY, velocityZ].every(Number.isFinite)) return;
        if (itemType < 1 || itemType > 184 || count > 64 || y < -64 || y > 128) return;
        const room = rooms.get(player.room);
        if (!room) return;
        if (room.drops.size >= 5000 && !room.drops.has(id)) return;
        const drop = { id, itemType, count, x, y, z, velocityX, velocityY, velocityZ, createdAt: Date.now(), ownerId: player.id };
        room.drops.set(id, drop);
        broadcast(room, { type: "item_drop", ...drop }, player.id);
        return;
    }
    if (message.type === "item_claim") {
        const id = String(message.id || "").trim().slice(0, 96);
        if (!id) return;
        const room = rooms.get(player.room);
        if (!room) return;
        const drop = room.drops.get(id);
        if (!drop) {
            send(ws, { type: "item_claim_denied", id });
            return;
        }
        const dx = player.position.x - drop.x;
        const dy = player.position.y - (drop.y + 0.28);
        const dz = player.position.z - drop.z;
        if (Math.hypot(dx, dy, dz) > 4.0) {
            send(ws, { type: "item_claim_denied", id });
            return;
        }
        room.drops.delete(id);
        send(ws, { type: "item_claimed", id, itemType: drop.itemType, count: drop.count });
        broadcast(room, { type: "item_removed", id }, player.id);
        return;
    }
    if (message.type === "world_sync_request") {
        const room = rooms.get(player.room);
        if (!room) return;
        send(ws, { type: "world_sync", worldSeed: room.worldSeed, worldChanges: [...room.blockChanges.values()], worldDrops: [...room.drops.values()] });
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
            const heldItemId = Math.floor(numberOr(message.heldItemId, player.heldItemId));
            player.heldItemId = heldItemId >= 0 && heldItemId <= 184 ? heldItemId : 0;
            player.sneaking = Boolean(message.sneaking);
            player.action = ["idle", "walk", "mine", "place", "jump"].includes(message.action) ? message.action : "idle";
            player.lastUpdate = now;
        }
        return;
    }
    if (message.type === "ping") send(ws, { type: "pong", time: Date.now() });
}

loadRoomsState();
setInterval(pruneExpiredEmptyRooms, 60 * 60 * 1000).unref?.();
process.on("SIGTERM", () => { saveRoomsStateSync(); process.exit(0); });
process.on("SIGINT", () => { saveRoomsStateSync(); process.exit(0); });

const httpServer = http.createServer((request, response) => {
    if (request.url === "/health") {
        response.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "no-store" });
        response.end(JSON.stringify({ ok: true, rooms: rooms.size, players: [...rooms.values()].reduce((count, room) => count + room.players.size, 0), maxPlayers: MAX_PLAYERS_PER_SERVER, maxRooms: MAX_ROOMS }));
        return;
    }
    if (request.url === "/servers") {
        const totalPlayers = [...rooms.values()].reduce((count, room) => count + room.players.size, 0);
        response.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "no-store" });
        response.end(JSON.stringify({
            servers: [{ id: "webminecraft-official", name: "WebMinecraft Official", online: true, players: totalPlayers, maxPlayers: MAX_PLAYERS_PER_SERVER, rooms: [...rooms.values()].map(publicRoom) }],
            updatedAt: Date.now(),
        }));
        return;
    }
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("WebMinecraft multiplayer server is running.");
});

httpServer.on("upgrade", (request, socket) => {
    if (request.url !== "/multiplayer") { socket.destroy(); return; }
    const ws = acceptWebSocket(request, socket);
    if (!ws) return;
    const state = { joined: false, player: null };
    send(ws, { type: "server_info", tickRate: TICK_RATE, maxPlayers: MAX_PLAYERS_PER_SERVER, maxRooms: MAX_ROOMS });
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
    const now = Date.now();
    for (const room of rooms.values()) {
        for (const [id, drop] of room.drops) {
            if (now - Number(drop.createdAt || now) > 5 * 60 * 1000) {
                room.drops.delete(id);
                broadcast(room, { type: "item_removed", id });
            }
        }
        if (room.players.size < 2) continue;
        const players = [...room.players.values()];
        const payload = JSON.stringify({ type: "player_states", players: players.map(publicPlayer) });
        for (const player of players) {
            if (player.ws.connected) player.ws.sendText(payload);
        }
    }
}, BROADCAST_INTERVAL);

httpServer.listen(PORT, HOST, () => {
    console.log(`WebMinecraft multiplayer server listening on ${HOST}:${PORT}`);
});
