import { setBlockAt } from "../world/world.js";

const ROOMS = "p2pRooms";
const MAX_PLAYERS = 6;
const ROOM_STALE_MS = 18000;
const HEARTBEAT_MS = 3500;
const TAKEOVER_MS = 10500;
const REPLICA_PREFIX = "webminecraft-p2p-replica-";
const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" }
];

let firebasePromise = null;

function cleanText(value, max = 32) {
    return String(value ?? "").replace(/[<>]/g, "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}
function randomId() {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
}
async function getFirebase(requireAuth = true) {
    if (!firebasePromise) {
        firebasePromise = (async () => {
            const started = Date.now();
            while (Date.now() - started < 12000) {
                if (window.firebase?.auth && window.firebase?.firestore) break;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!window.firebase?.auth || !window.firebase?.firestore) {
                throw new Error("The room directory could not connect to Firebase.");
            }
            return { auth: window.firebase.auth(), db: window.firebase.firestore() };
        })();
    }
    try {
        const { auth, db } = await firebasePromise;
        let user = auth.currentUser;
        if (requireAuth && !user) {
            try {
                const result = await auth.signInAnonymously();
                user = result.user || auth.currentUser;
            } catch (error) {
                if (error?.code === "auth/operation-not-allowed") {
                    throw new Error("Player-hosted rooms need Anonymous sign-in enabled in Firebase Authentication.");
                }
                throw new Error("Could not start a secure player session. Try signing in to WebMinecraft again.");
            }
        }
        if (requireAuth && !user) throw new Error("Firebase did not provide a player session.");
        return { auth, db, user: user || null };
    } catch (error) {
        firebasePromise = null;
        throw error;
    }
}
function makePlayer(uid, name, role = "member") {
    return {
        id: uid,
        name: cleanText(name || "Player", 20) || "Player",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        heldItemId: 0,
        sneaking: false,
        action: "idle",
        role,
        verifiedRole: ""
    };
}
function replicaKey(roomId) {
    return REPLICA_PREFIX + String(roomId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}
function readReplica(roomId, fallbackSeed = 0) {
    try {
        const parsed = JSON.parse(localStorage.getItem(replicaKey(roomId)) || "null");
        if (!parsed || typeof parsed !== "object") return { seed: fallbackSeed >>> 0, changes: [] };
        return {
            seed: Number(parsed.seed) >>> 0 || (fallbackSeed >>> 0),
            changes: (Array.isArray(parsed.changes) ? parsed.changes : []).filter(change =>
                [change?.x, change?.y, change?.z, change?.blockType ?? change?.type].every(value => Number.isFinite(Number(value)))
            ).slice(-12000)
        };
    } catch {
        return { seed: fallbackSeed >>> 0, changes: [] };
    }
}
function writeReplica(roomId, seed, changes) {
    try {
        localStorage.setItem(replicaKey(roomId), JSON.stringify({
            version: 1,
            seed: Number(seed) >>> 0,
            savedAt: Date.now(),
            changes: [...changes.values()].slice(-12000)
        }));
    } catch (error) {
        console.warn("The local P2P world backup could not be saved:", error);
    }
}
function roomCardData(id, data) {
    return {
        id,
        name: cleanText(data.name || "Player World", 32),
        owner: cleanText(data.ownerName || "Player", 20),
        players: Math.max(1, Math.min(MAX_PLAYERS, Number(data.players) || 1)),
        maxPlayers: Math.max(2, Math.min(MAX_PLAYERS, Number(data.maxPlayers) || MAX_PLAYERS)),
        mode: data.mode === "creative" ? "creative" : "survival",
        backupReady: Boolean(data.backupUid),
        lastHeartbeat: Number(data.lastHeartbeat) || 0
    };
}

export async function listP2PRooms() {
    const { db } = await getFirebase(false);
    const snapshot = await db.collection(ROOMS).where("visibility", "==", "public").limit(60).get();
    const now = Date.now();
    return snapshot.docs
        .map(doc => roomCardData(doc.id, doc.data() || {}))
        .filter(room => room.lastHeartbeat > 0 && now - room.lastHeartbeat <= ROOM_STALE_MS)
        .sort((a, b) => b.lastHeartbeat - a.lastHeartbeat);
}

export async function createP2PRoom({ name, ownerName, mode = "survival" } = {}) {
    const { db, user } = await getFirebase(true);
    const roomName = cleanText(name, 32);
    if (!roomName) throw new Error("Enter a room name first.");
    const hostName = cleanText(ownerName || user.displayName || "Player", 20) || "Player";
    const roomId = "p2p-" + randomId();
    const worldSeed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
    const now = Date.now();
    const roomRef = db.collection(ROOMS).doc(roomId);
    await roomRef.set({
        roomId, name: roomName, ownerUid: user.uid, ownerName: hostName,
        hostUid: user.uid, hostName, backupUid: "", backupName: "",
        visibility: "public", mode: mode === "creative" ? "creative" : "survival",
        worldSeed, players: 1, maxPlayers: MAX_PLAYERS, status: "online",
        generation: 1, lastHeartbeat: now, createdAt: now, updatedAt: now
    });
    await roomRef.collection("participants").doc(user.uid).set({
        uid: user.uid, name: hostName, role: "owner", status: "connected",
        joinedAt: now, lastSeen: now
    });
    return { id: roomId, name: roomName, worldSeed };
}

export function setNextP2PJoin(details = {}) {
    window.__webminecraftP2PNextJoin = {
        role: details.role === "host" ? "host" : "join",
        roomId: String(details.roomId || "").slice(0, 80)
    };
}
function parseMessage(data) {
    try {
        const value = JSON.parse(data);
        return value && typeof value === "object" ? value : null;
    } catch {
        return null;
    }
}

class P2PMultiplayerSocket extends EventTarget {
    constructor() {
        super();
        this.readyState = 0;
        this.session = null;
        this.closed = false;
        queueMicrotask(() => {
            if (this.closed) return;
            this.readyState = 1;
            this.dispatchEvent(new Event("open"));
        });
    }
    emitMessage(message) {
        if (!this.closed) this.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(message) }));
    }
    emitError(error) {
        if (this.closed) return;
        console.warn("Player-hosted multiplayer:", error);
        this.dispatchEvent(new Event("error"));
    }
    send(raw) {
        if (this.readyState !== 1 || this.closed) throw new Error("The player-hosted room is not connected.");
        const message = parseMessage(raw);
        if (!message) return;
        if (message.type === "join") {
            if (this.session) return;
            this.session = new P2PRoomSession(this);
            void this.session.start(message).catch(error => this.emitError(error));
            return;
        }
        this.session?.sendLocal(message);
    }
    close() {
        if (this.closed) return;
        this.readyState = 2;
        const finish = () => {
            if (this.closed) return;
            this.closed = true;
            this.readyState = 3;
            this.dispatchEvent(new Event("close"));
        };
        if (this.session) void this.session.leave().finally(finish);
        else finish();
    }
}
export function createP2PTransport() {
    return new P2PMultiplayerSocket();
}

class P2PRoomSession {
    constructor(socket) {
        this.socket = socket;
        this.db = null;
        this.user = null;
        this.uid = "";
        this.roomId = "";
        this.roomRef = null;
        this.roomData = null;
        this.name = "Player";
        this.isHost = false;
        this.started = false;
        this.leaving = false;
        this.generation = 1;
        this.hostUid = "";
        this.players = new Map();
        this.blockChanges = new Map();
        this.peers = new Map();
        this.pendingCandidates = new Map();
        this.seenSignals = new Set();
        this.unsubscribers = [];
        this.signalUnsubscribe = null;
        this.heartbeatTimer = null;
        this.takeoverTimer = null;
    }
    emit(message) { this.socket.emitMessage(message); }
    roomPlayerList() { return [...this.players.values()].map(player => ({ ...player })); }

    async start(joinMessage) {
        this.name = cleanText(joinMessage.nickname || joinMessage.name || "Player", 20) || "Player";
        const next = window.__webminecraftP2PNextJoin || {};
        this.roomId = String(next.roomId || joinMessage.room || "").trim().slice(0, 80);
        if (!this.roomId) throw new Error("The player-hosted room ID is missing.");
        const firebase = await getFirebase(true);
        this.db = firebase.db;
        this.user = firebase.user;
        this.uid = firebase.user.uid;
        this.roomRef = this.db.collection(ROOMS).doc(this.roomId);
        const snapshot = await this.roomRef.get();
        if (!snapshot.exists) throw new Error("This player-hosted room no longer exists.");
        this.roomData = snapshot.data() || {};
        this.generation = Number(this.roomData.generation) || 1;
        this.hostUid = String(this.roomData.hostUid || "");

        if (next.role === "host") {
            if (this.roomData.ownerUid !== this.uid || this.hostUid !== this.uid) {
                throw new Error("Only the room creator can start this player-hosted world.");
            }
            this.isHost = true;
            const replica = readReplica(this.roomId, this.roomData.worldSeed);
            this.roomData.worldSeed = replica.seed || (Number(this.roomData.worldSeed) >>> 0);
            replica.changes.forEach(change => this.rememberBlockChange(change, false));
            await this.roomRef.collection("participants").doc(this.uid).set({
                uid: this.uid, name: this.name, role: "owner", status: "connected",
                joinedAt: Date.now(), lastSeen: Date.now()
            }, { merge: true });
            this.players.set(this.uid, makePlayer(this.uid, this.name, "operator"));
            this.emitJoined();
            await this.startHostListeners();
        } else {
            if (this.roomData.status !== "online" || Date.now() - (Number(this.roomData.lastHeartbeat) || 0) > ROOM_STALE_MS) {
                throw new Error("This room's host is offline. Try another room.");
            }
            if (Number(this.roomData.players) >= Number(this.roomData.maxPlayers || MAX_PLAYERS)) {
                throw new Error("This room is full.");
            }
            await this.roomRef.collection("participants").doc(this.uid).set({
                uid: this.uid, name: this.name, role: "member", status: "joining",
                joinedAt: Date.now(), lastSeen: Date.now()
            });
            this.players.set(this.uid, makePlayer(this.uid, this.name));
            this.listenForRoomChanges();
            this.listenForSignals();
            this.connectToHost(this.hostUid);
        }
        this.started = true;
        this.startHeartbeat();
    }

    emitJoined() {
        this.emit({
            type: "joined", playerId: this.uid,
            room: this.roomData.name || this.roomId,
            serverName: "Player-hosted world",
            ownerName: this.roomData.ownerName || this.name,
            private: false,
            mode: this.roomData.mode === "creative" ? "creative" : "survival",
            worldSeed: Number(this.roomData.worldSeed) >>> 0,
            players: this.roomPlayerList(),
            worldChanges: [...this.blockChanges.values()],
            role: "operator", isHost: this.isHost
        });
    }

    startHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (this.takeoverTimer) clearInterval(this.takeoverTimer);
        let lastReplicaAt = 0;
        this.heartbeatTimer = setInterval(() => {
            if (this.leaving) return;
            const now = Date.now();
            void this.roomRef.collection("participants").doc(this.uid)
                .set({ lastSeen: now, status: "connected" }, { merge: true }).catch(() => {});
            if (this.isHost) {
                void this.roomRef.update({
                    lastHeartbeat: now, players: Math.max(1, this.players.size),
                    hostName: this.name, updatedAt: now
                }).catch(error => console.warn("P2P heartbeat failed:", error));
                if (now - lastReplicaAt > 10000) {
                    lastReplicaAt = now;
                    writeReplica(this.roomId, this.roomData.worldSeed, this.blockChanges);
                }
            }
        }, HEARTBEAT_MS);
        this.takeoverTimer = setInterval(() => void this.checkTakeover(), 3000);
    }

    listenForRoomChanges() {
        const unsubscribe = this.roomRef.onSnapshot(snapshot => {
            if (!snapshot.exists || this.leaving) return;
            const next = snapshot.data() || {};
            const previousHost = this.hostUid;
            this.roomData = next;
            this.generation = Number(next.generation) || 1;
            this.hostUid = String(next.hostUid || "");
            if (!this.hostUid || this.hostUid === previousHost) return;
            if (this.hostUid === this.uid && !this.isHost) {
                void this.becomeHostAfterTakeover();
            } else if (this.hostUid !== this.uid) {
                this.closePeerConnections();
                this.connectToHost(this.hostUid);
            }
        }, error => console.warn("P2P room status listener failed:", error));
        this.unsubscribers.push(unsubscribe);
    }

    async checkTakeover() {
        if (this.leaving || this.isHost || !this.roomData || String(this.roomData.backupUid || "") !== this.uid) return;
        if (Date.now() - (Number(this.roomData.lastHeartbeat) || 0) < TAKEOVER_MS) return;
        try {
            await this.db.runTransaction(async transaction => {
                const snapshot = await transaction.get(this.roomRef);
                if (!snapshot.exists) return;
                const data = snapshot.data() || {};
                const stale = Date.now() - (Number(data.lastHeartbeat) || 0) >= TAKEOVER_MS;
                if (!stale || String(data.backupUid || "") !== this.uid) return;
                transaction.update(this.roomRef, {
                    hostUid: this.uid, hostName: this.name,
                    generation: (Number(data.generation) || 1) + 1,
                    lastHeartbeat: Date.now(), updatedAt: Date.now()
                });
            });
        } catch (error) {
            console.warn("Automatic P2P host transfer failed:", error);
        }
    }

    async becomeHostAfterTakeover() {
        if (this.leaving || this.isHost) return;
        this.isHost = true;
        this.hostUid = this.uid;
        this.roomData.backupUid = "";
        this.closePeerConnections();
        const replica = readReplica(this.roomId, this.roomData.worldSeed);
        replica.changes.forEach(change => this.rememberBlockChange(change, false));
        this.players.set(this.uid, makePlayer(this.uid, this.name, "operator"));
        await this.roomRef.update({ backupUid: "", backupName: "" }).catch(() => {});
        await this.startHostListeners();
        this.emit({ type: "chat_system", text: this.name + " is now hosting this room." });
        this.emit({ type: "player_name_changed", name: this.name, ownerName: this.roomData.ownerName, isHost: true });
        this.broadcastPlayerStates();
    }

    async startHostListeners() {
        if (!this.isHost || this.leaving) return;
        this.listenForSignals();
        const unsubscribe = this.roomRef.collection("participants").onSnapshot(snapshot => {
            if (!this.isHost || this.leaving) return;
            const active = new Map();
            snapshot.forEach(doc => {
                const participant = doc.data() || {};
                const uid = String(doc.id);
                if (uid === this.uid || participant.status === "disconnected") return;
                if (Date.now() - (Number(participant.lastSeen) || 0) > 20000) return;
                active.set(uid, cleanText(participant.name || "Player", 20));
                if (!this.peers.has(uid)) void this.createHostPeer(uid, participant.name);
            });
            for (const uid of [...this.players.keys()]) {
                if (uid !== this.uid && !active.has(uid)) {
                    this.players.delete(uid);
                    this.emit({ type: "player_left", playerId: uid });
                    this.broadcast({ type: "player_left", playerId: uid });
                }
            }
            const candidates = [...active.entries()];
            const backup = candidates.find(([uid]) => uid !== this.uid);
            if (backup && (!this.roomData.backupUid || !active.has(String(this.roomData.backupUid)))) {
                this.roomData.backupUid = backup[0];
                this.roomData.backupName = backup[1];
                void this.roomRef.update({ backupUid: backup[0], backupName: backup[1], updatedAt: Date.now() }).catch(() => {});
            } else if (!backup && this.roomData.backupUid) {
                this.roomData.backupUid = "";
                this.roomData.backupName = "";
                void this.roomRef.update({ backupUid: "", backupName: "", updatedAt: Date.now() }).catch(() => {});
            }
        }, error => console.warn("P2P participant listener failed:", error));
        this.unsubscribers.push(unsubscribe);
        await this.roomRef.update({
            status: "online", hostUid: this.uid, hostName: this.name,
            lastHeartbeat: Date.now(), players: Math.max(1, this.players.size)
        }).catch(() => {});
    }

    listenForSignals() {
        this.signalUnsubscribe?.();
        const unsubscribe = this.roomRef.collection("signals").where("toUid", "==", this.uid).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type !== "added") return;
                const doc = change.doc;
                if (this.seenSignals.has(doc.id)) return;
                this.seenSignals.add(doc.id);
                const signal = doc.data() || {};
                if (Number(signal.generation) !== this.generation) {
                    void doc.ref.delete().catch(() => {});
                    return;
                }
                void this.handleSignal(doc, signal);
            });
        }, error => console.warn("P2P signaling listener failed:", error));
        this.signalUnsubscribe = unsubscribe;
    }

    async writeSignal(toUid, type, payload) {
        if (!toUid || this.leaving) return;
        await this.roomRef.collection("signals").add({
            fromUid: this.uid, toUid, type, payload,
            generation: this.generation, createdAt: Date.now()
        });
    }

    async handleSignal(doc, signal) {
        try {
            const peerUid = String(signal.fromUid || "");
            if (!peerUid || peerUid === this.uid) return;
            let peer = this.peers.get(peerUid);
            if (signal.type === "offer" && !this.isHost) {
                if (!peer) {
                    this.connectToHost(peerUid);
                    peer = this.peers.get(peerUid);
                }
                await peer.pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                await this.flushCandidates(peerUid);
                const answer = await peer.pc.createAnswer();
                await peer.pc.setLocalDescription(answer);
                await this.writeSignal(peerUid, "answer", peer.pc.localDescription.toJSON());
                await this.flushCandidates(peerUid);
            } else if (signal.type === "answer" && this.isHost && peer) {
                await peer.pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                await this.flushCandidates(peerUid);
            } else if (signal.type === "candidate" && signal.payload) {
                const candidate = new RTCIceCandidate(signal.payload);
                if (peer?.pc?.remoteDescription) await peer.pc.addIceCandidate(candidate);
                else {
                    const pending = this.pendingCandidates.get(peerUid) || [];
                    pending.push(candidate);
                    this.pendingCandidates.set(peerUid, pending);
                }
            }
        } catch (error) {
            console.warn("Could not process P2P signaling:", error);
        } finally {
            await doc.ref.delete().catch(() => {});
        }
    }

    async flushCandidates(peerUid) {
        const peer = this.peers.get(peerUid);
        const candidates = this.pendingCandidates.get(peerUid) || [];
        if (!peer?.pc?.remoteDescription || !candidates.length) return;
        this.pendingCandidates.delete(peerUid);
        for (const candidate of candidates) {
            try { await peer.pc.addIceCandidate(candidate); } catch {}
        }
    }

    async createHostPeer(peerUid, peerName = "Player") {
        if (!this.isHost || this.leaving || this.peers.has(peerUid)) return;
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        const peer = { uid: peerUid, name: cleanText(peerName, 20), pc, channel: null };
        this.peers.set(peerUid, peer);
        pc.onicecandidate = event => {
            if (event.candidate) void this.writeSignal(peerUid, "candidate", event.candidate.toJSON()).catch(() => {});
        };
        pc.onconnectionstatechange = () => {
            if (["failed", "closed"].includes(pc.connectionState)) this.removePeer(peerUid, true);
        };
        const channel = pc.createDataChannel("webminecraft-game", { ordered: true });
        this.attachHostChannel(peer, channel);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await this.writeSignal(peerUid, "offer", pc.localDescription.toJSON());
    }

    connectToHost(hostUid) {
        if (!hostUid || hostUid === this.uid || this.leaving) return;
        const current = this.peers.get(hostUid);
        if (current && !["failed", "closed"].includes(current.pc.connectionState)) return;
        if (current) {
            try { current.pc.close(); } catch {}
            this.peers.delete(hostUid);
        }
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        const peer = { uid: hostUid, name: this.roomData?.hostName || "Host", pc, channel: null };
        this.peers.set(hostUid, peer);
        pc.onicecandidate = event => {
            if (event.candidate) void this.writeSignal(hostUid, "candidate", event.candidate.toJSON()).catch(() => {});
        };
        pc.ondatachannel = event => this.attachClientChannel(peer, event.channel);
        pc.onconnectionstatechange = () => {
            if (["failed", "closed"].includes(pc.connectionState)) {
                this.emit({ type: "chat_system", text: "Direct connection to the room host was lost." });
            }
        };
    }

    attachHostChannel(peer, channel) {
        peer.channel = channel;
        channel.onopen = () => {
            if (this.leaving) return;
            const player = makePlayer(peer.uid, peer.name);
            this.players.set(peer.uid, player);
            void this.roomRef.collection("participants").doc(peer.uid)
                .set({ status: "connected", lastSeen: Date.now() }, { merge: true }).catch(() => {});
            const joined = {
                type: "joined", playerId: peer.uid,
                room: this.roomData.name, serverName: "Player-hosted world",
                ownerName: this.roomData.ownerName, mode: this.roomData.mode,
                worldSeed: Number(this.roomData.worldSeed) >>> 0,
                players: this.roomPlayerList(), worldChanges: [],
                role: "member", isHost: false
            };
            this.sendPeer(peer, joined);
            const changes = [...this.blockChanges.values()];
            for (let offset = 0; offset < changes.length; offset += 150) {
                this.sendPeer(peer, {
                    type: "world_sync",
                    worldSeed: Number(this.roomData.worldSeed) >>> 0,
                    worldChanges: changes.slice(offset, offset + 150)
                });
            }
            this.emit({ type: "player_joined", player });
            this.broadcast({ type: "player_joined", player }, peer.uid);
            this.broadcastPlayerStates();
            this.refreshPlayerCount();
        };
        channel.onmessage = event => {
            const message = parseMessage(event.data);
            if (message) this.handlePeerMessage(peer.uid, message);
        };
        channel.onclose = () => this.removePeer(peer.uid, true);
        channel.onerror = () => this.removePeer(peer.uid, true);
    }

    attachClientChannel(peer, channel) {
        peer.channel = channel;
        channel.onopen = () => {
            if (this.leaving) return;
            void this.roomRef.collection("participants").doc(this.uid)
                .set({ status: "connected", lastSeen: Date.now() }, { merge: true }).catch(() => {});
        };
        channel.onmessage = event => {
            const message = parseMessage(event.data);
            if (!message || this.isHost) return;
            if (message.type === "block_change") this.rememberBlockChange(message);
            if (message.type === "block_changes") {
                for (const change of message.changes || []) this.rememberBlockChange(change, false);
                writeReplica(this.roomId, this.roomData.worldSeed, this.blockChanges);
            }
            if (message.type === "player_states") {
                for (const player of message.players || []) {
                    if (player?.id) this.players.set(player.id, player);
                }
            }
            if (message.type === "player_joined" && message.player?.id) {
                this.players.set(message.player.id, message.player);
            }
            if (message.type === "player_left") this.players.delete(String(message.playerId || ""));
            this.emit(message);
        };
        channel.onclose = () => this.removePeer(peer.uid, false);
        channel.onerror = () => this.removePeer(peer.uid, false);
    }

    sendPeer(peer, message) {
        if (peer?.channel?.readyState !== "open") return false;
        try { peer.channel.send(JSON.stringify(message)); return true; } catch { return false; }
    }
    broadcast(message, exceptUid = "") {
        for (const [uid, peer] of this.peers) {
            if (uid !== exceptUid) this.sendPeer(peer, message);
        }
    }
    broadcastPlayerStates() {
        const message = { type: "player_states", players: this.roomPlayerList() };
        this.emit(message);
        this.broadcast(message);
    }
    refreshPlayerCount() {
        if (!this.isHost || this.leaving) return;
        void this.roomRef.update({
            players: Math.max(1, this.players.size), lastHeartbeat: Date.now(), updatedAt: Date.now()
        }).catch(() => {});
    }
    rememberBlockChange(change, write = true) {
        const x = Math.floor(Number(change?.x));
        const y = Math.floor(Number(change?.y));
        const z = Math.floor(Number(change?.z));
        const blockType = Math.floor(Number(change?.blockType ?? change?.type));
        if (![x, y, z, blockType].every(Number.isFinite) || y < -32 || y > 95 || blockType < 0 || blockType > 184) return null;
        const normalized = { x, y, z, blockType };
        this.blockChanges.set(x + "," + y + "," + z, normalized);
        if (this.blockChanges.size > 12000) {
            const oldest = this.blockChanges.keys().next().value;
            if (oldest) this.blockChanges.delete(oldest);
        }
        if (write) writeReplica(this.roomId, this.roomData?.worldSeed || 0, this.blockChanges);
        return normalized;
    }
    applyIncomingBlock(change) {
        const normalized = this.rememberBlockChange(change);
        if (!normalized) return;
        try { setBlockAt(normalized.x, normalized.y, normalized.z, normalized.blockType); } catch {}
        this.broadcast({ type: "block_change", ...normalized });
        this.emit({ type: "block_change", ...normalized });
    }

    handlePeerMessage(peerUid, message) {
        if (!this.isHost || this.leaving) return;
        const player = this.players.get(peerUid) || makePlayer(peerUid, "Player");
        switch (message.type) {
            case "player_state":
                player.position = message.position || player.position;
                player.rotation = message.rotation || player.rotation;
                player.heldItemId = Number(message.heldItemId) || 0;
                player.sneaking = Boolean(message.sneaking);
                player.action = String(message.action || "idle");
                this.players.set(peerUid, player);
                this.broadcastPlayerStates();
                break;
            case "block_change":
                this.applyIncomingBlock(message);
                break;
            case "block_changes": {
                const normalized = [];
                for (const change of (Array.isArray(message.changes) ? message.changes : []).slice(0, 256)) {
                    const item = this.rememberBlockChange(change, false);
                    if (!item) continue;
                    try { setBlockAt(item.x, item.y, item.z, item.blockType); } catch {}
                    normalized.push(item);
                }
                if (normalized.length) {
                    writeReplica(this.roomId, this.roomData.worldSeed, this.blockChanges);
                    const payload = { type: "block_changes", changes: normalized };
                    this.emit(payload);
                    this.broadcast(payload);
                }
                break;
            }
            case "chat_message": {
                const payload = {
                    type: "chat_message", playerId: peerUid, name: player.name,
                    text: cleanText(message.text, 400), verifiedRole: player.verifiedRole || ""
                };
                this.emit(payload);
                this.broadcast(payload);
                break;
            }
            case "player_name": {
                player.name = cleanText(message.name, 20) || player.name;
                this.players.set(peerUid, player);
                void this.roomRef.collection("participants").doc(peerUid)
                    .set({ name: player.name }, { merge: true }).catch(() => {});
                const payload = { type: "player_renamed", playerId: peerUid, name: player.name };
                this.emit(payload);
                this.broadcast(payload);
                this.broadcastPlayerStates();
                break;
            }
            case "item_drop":
            case "item_claim":
            case "item_claimed":
            case "item_removed":
            case "block_mining":
            case "block_mining_stop":
            case "player_skin":
            case "player_skin_reset":
            case "slab_place":
                this.broadcast({ ...message, playerId: peerUid });
                break;
            case "export_room_world_request":
                this.sendPeer(this.peers.get(peerUid), {
                    type: "room_world_export", room: this.roomData.name,
                    worldSeed: Number(this.roomData.worldSeed) >>> 0,
                    worldChanges: [...this.blockChanges.values()]
                });
                break;
            case "save_and_quit":
                this.sendPeer(this.peers.get(peerUid), { type: "save_and_quit_ack", ok: true });
                break;
            default:
                break;
        }
    }

    sendLocal(message) {
        if (!this.started || this.leaving) return;
        if (this.isHost) {
            const player = this.players.get(this.uid) || makePlayer(this.uid, this.name, "operator");
            if (message.type === "player_state") {
                player.position = message.position || player.position;
                player.rotation = message.rotation || player.rotation;
                player.heldItemId = Number(message.heldItemId) || 0;
                player.sneaking = Boolean(message.sneaking);
                player.action = String(message.action || "idle");
                this.players.set(this.uid, player);
                this.broadcastPlayerStates();
            } else if (message.type === "block_change") {
                this.rememberBlockChange(message);
                this.broadcast({ type: "block_change", ...message });
            } else if (message.type === "block_changes") {
                const changes = [];
                for (const change of (Array.isArray(message.changes) ? message.changes : []).slice(0, 256)) {
                    const item = this.rememberBlockChange(change, false);
                    if (item) changes.push(item);
                }
                if (changes.length) {
                    writeReplica(this.roomId, this.roomData.worldSeed, this.blockChanges);
                    this.broadcast({ type: "block_changes", changes });
                }
            } else if (message.type === "chat_message") {
                const payload = { type: "chat_message", playerId: this.uid, name: this.name, text: cleanText(message.text, 400) };
                this.emit(payload);
                this.broadcast(payload);
            } else if (message.type === "export_room_world_request") {
                this.emit({
                    type: "room_world_export", room: this.roomData.name,
                    worldSeed: Number(this.roomData.worldSeed) >>> 0,
                    worldChanges: [...this.blockChanges.values()]
                });
            } else if (message.type === "shutdown_room") {
                void this.shutdownRoom();
            } else {
                this.broadcast({ ...message, playerId: this.uid });
            }
            return;
        }
        const host = this.peers.get(this.hostUid);
        if (message.type === "player_state") {
            this.lastLocalState = message;
            const self = this.players.get(this.uid) || makePlayer(this.uid, this.name);
            self.position = message.position || self.position;
            self.rotation = message.rotation || self.rotation;
            self.heldItemId = Number(message.heldItemId) || 0;
            self.sneaking = Boolean(message.sneaking);
            self.action = String(message.action || "idle");
            this.players.set(this.uid, self);
        }
        if (message.type === "block_change") this.rememberBlockChange(message);
        if (message.type === "block_changes") {
            for (const change of message.changes || []) this.rememberBlockChange(change, false);
            writeReplica(this.roomId, this.roomData.worldSeed, this.blockChanges);
        }
        this.sendPeer(host, message);
    }

    async shutdownRoom() {
        if (!this.isHost || this.leaving) return;
        this.broadcast({ type: "room_shutdown", message: "The room host shut down this player-hosted world." });
        await this.roomRef.update({ status: "closed", players: 0, lastHeartbeat: 0, updatedAt: Date.now() }).catch(() => {});
        await this.leave(true);
    }

    removePeer(uid, removePlayer = true) {
        const peer = this.peers.get(uid);
        if (!peer) return;
        this.peers.delete(uid);
        try { peer.pc.close(); } catch {}
        if (removePlayer && this.isHost && this.players.has(uid)) {
            this.players.delete(uid);
            void this.roomRef.collection("participants").doc(uid)
                .set({ status: "disconnected", lastSeen: Date.now() }, { merge: true }).catch(() => {});
            this.emit({ type: "player_left", playerId: uid });
            this.broadcast({ type: "player_left", playerId: uid });
            this.broadcastPlayerStates();
            this.refreshPlayerCount();
        }
    }
    closePeerConnections() {
        for (const uid of [...this.peers.keys()]) this.removePeer(uid, false);
        this.peers.clear();
    }

    async leave(fromShutdown = false) {
        if (this.leaving) return;
        this.leaving = true;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (this.takeoverTimer) clearInterval(this.takeoverTimer);
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            try { unsubscribe?.(); } catch {}
        }
        try { this.signalUnsubscribe?.(); } catch {}
        try {
            if (this.isHost && !fromShutdown && this.roomRef) {
                const backupUid = String(this.roomData?.backupUid || "");
                const backupDoc = backupUid
                    ? await this.roomRef.collection("participants").doc(backupUid).get().catch(() => null)
                    : null;
                if (backupUid && backupDoc?.exists && backupDoc.data()?.status !== "disconnected") {
                    await this.roomRef.update({
                        hostUid: backupUid,
                        hostName: cleanText(backupDoc.data()?.name || this.roomData.backupName || "Player", 20),
                        generation: (Number(this.roomData.generation) || 1) + 1,
                        lastHeartbeat: Date.now(), updatedAt: Date.now()
                    });
                } else {
                    await this.roomRef.update({ status: "offline", players: 0, lastHeartbeat: 0, updatedAt: Date.now() }).catch(() => {});
                }
            }
        } catch (error) {
            console.warn("P2P room cleanup failed; backup will also detect a stale host heartbeat:", error);
        }
        await this.roomRef?.collection("participants").doc(this.uid).delete().catch(() => {});
        this.closePeerConnections();
        this.started = false;
    }
}
