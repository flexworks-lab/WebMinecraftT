const STORAGE_KEY = "webminecraft-procedural-character-textures-v1";

function getAccountUid() {
    let uid = String(window.__webMinecraftAccountUid || "").trim();
    if (!uid) {
        try {
            const user = window.firebase?.auth?.()?.currentUser || null;
            if (user?.isAnonymous !== true) uid = String(user?.uid || "").trim();
        } catch {}
    }
    return uid;
}

function getGuestBrowserId() {
    const key = "webminecraft-character-guest-id-v1";
    try {
        let id = String(localStorage.getItem(key) || "").trim();
        if (!id) {
            id = typeof crypto?.randomUUID === "function"
                ? crypto.randomUUID()
                : "guest-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem(key, id);
        }
        return id;
    } catch {
        return "guest-session-" + String(sessionStorage.getItem("webminecraft-guest-name") || "player").toLowerCase();
    }
}

export function getCharacterAppearanceId() {
    const uid = getAccountUid();
    const source = uid ? "account:" + uid : "browser:" + getGuestBrowserId();
    let hash = 2166136261;
    for (let i = 0; i < source.length; i++) {
        hash ^= source.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    const id = "skin-" + (hash >>> 0).toString(16).padStart(8, "0");
    window.__webminecraftCharacterAppearanceId = id;
    return id;
}

function getTextureStorageKey() {
    const uid = getAccountUid();
    return uid ? `${STORAGE_KEY}:account:${uid}` : STORAGE_KEY;
}

export function readCharacterTextureRecord() {
    try {
        const storageKey = getTextureStorageKey();
        let raw = localStorage.getItem(storageKey);
        // Migrate pre-account browser saves into the signed-in account once.
        // This keeps the skin already visible in the menu instead of replacing
        // it with a freshly generated account appearance.
        if (!raw && getAccountUid()) {
            raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localStorage.setItem(storageKey, raw);
        }
        const record = JSON.parse(raw || "null");
        if (!record || ![1, 2].includes(Number(record.version)) ||
            !record.textures || typeof record.textures !== "object" || Array.isArray(record.textures)) return null;
        return {
            version: Number(record.version),
            savedAt: Math.max(0, Number(record.savedAt) || 0),
            textures: record.textures
        };
    } catch {
        return null;
    }
}

export function writeCharacterTextureRecord(textures, savedAt = Date.now()) {
    const storageKey = getTextureStorageKey();
    try {
        if (!textures || typeof textures !== "object" || !Object.keys(textures).length) {
            localStorage.removeItem(storageKey);
            return true;
        }
        localStorage.setItem(storageKey, JSON.stringify({
            version: 2,
            savedAt: Math.max(0, Number(savedAt) || Date.now()),
            textures
        }));
        return true;
    } catch (error) {
        console.warn("Could not save character textures in this browser.", error);
        return false;
    }
}

export { STORAGE_KEY as CHARACTER_TEXTURE_STORAGE_KEY };
