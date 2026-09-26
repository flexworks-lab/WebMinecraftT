const DEV_EMAIL = "worthmarcus19@gmail.com";
const DISCUSSION_COLLECTION = "discussions";
const CHANNELS = ["bugs", "chat"];

let firebaseReady = null;
let panel = null;
let statusEl = null;
let messageList = null;
let maintenanceEnabled = false;
let maintenanceUnsubscribe = null;
let devPinUnlocked = false;
let devPinPrompt = null;
let devPinResolve = null;
let activeDevUid = null;
let discussionUnsubscribers = [];
let liveDiscussionDocs = new Map();

const DEV_PIN_HASH_KEY = "webminecraft-dev-pin-hash-v1";
const DEV_PIN_SALT_KEY = "webminecraft-dev-pin-salt-v1";
const DEV_PIN_SESSION_KEY = "webminecraft-dev-pin-session-v1";

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.auth === "function" && typeof firebase.firestore === "function") {
                    const db = firebase.firestore();
                    if (db && typeof db.collection === "function") {
                        resolve(firebase);
                        return;
                    }
                }
            } catch {}
            if (Date.now() - started >= timeout) { resolve(null); return; }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

function dbFor(firebase) {
    try { return firebase?.firestore?.() || null; } catch { return null; }
}

async function getDevUser() {
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL) return { firebase, user: null };
    return { firebase, user };
}

function setStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.style.color = error ? "#e38a7b" : "#9fce72";
}


function pinStorageAvailable() {
    try {
        return typeof localStorage !== "undefined";
    } catch {
        return false;
    }
}

function sessionStorageAvailable() {
    try {
        return typeof sessionStorage !== "undefined";
    } catch {
        return false;
    }
}

function bytesToHex(buffer) {
    return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function hashDevPin(pin, saltHex) {
    if (!window.crypto?.subtle) throw new Error("Secure PIN hashing is not available in this browser.");
    const encoder = new TextEncoder();
    const salt = saltHex
        ? Uint8Array.from((saltHex.match(/../g) || []).map(hex => parseInt(hex, 16)))
        : crypto.getRandomValues(new Uint8Array(16));
    const baseKey = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
        baseKey,
        256
    );
    return { hash: bytesToHex(bits), salt: saltHex || bytesToHex(salt) };
}

function hasDevPin() {
    if (!pinStorageAvailable()) return false;
    try {
        return Boolean(localStorage.getItem(DEV_PIN_HASH_KEY) && localStorage.getItem(DEV_PIN_SALT_KEY));
    } catch {
        return false;
    }
}

function isDevPinSessionUnlocked(uid) {
    if (!sessionStorageAvailable() || !uid) return false;
    try {
        return sessionStorage.getItem(DEV_PIN_SESSION_KEY) === uid;
    } catch {
        return false;
    }
}

function setDevPinSession(uid, unlocked) {
    if (!sessionStorageAvailable()) return;
    try {
        if (unlocked) sessionStorage.setItem(DEV_PIN_SESSION_KEY, uid);
        else sessionStorage.removeItem(DEV_PIN_SESSION_KEY);
    } catch {}
}

async function saveNewDevPin(pin) {
    const value = String(pin || "");
    if (!/^[0-9]{4,12}$/.test(value)) {
        throw new Error("PIN must be 4 to 12 digits.");
    }
    const result = await hashDevPin(value);
    localStorage.setItem(DEV_PIN_HASH_KEY, result.hash);
    localStorage.setItem(DEV_PIN_SALT_KEY, result.salt);
}

async function verifyDevPin(pin) {
    if (!hasDevPin()) return false;
    const expectedHash = localStorage.getItem(DEV_PIN_HASH_KEY);
    const salt = localStorage.getItem(DEV_PIN_SALT_KEY);
    const result = await hashDevPin(String(pin || ""), salt);
    return result.hash === expectedHash;
}

function closeDevPinPrompt(result = false) {
    if (!devPinPrompt) return;
    devPinPrompt.remove();
    devPinPrompt = null;
    const resolve = devPinResolve;
    devPinResolve = null;
    if (resolve) resolve(result);
}

async function changeDevPin() {
    if (!hasDevPin()) return showDevPinPrompt("setup");
    const currentPin = await showDevPinPrompt("unlock");
    if (!currentPin) return false;
    const setup = await showDevPinPrompt("setup");
    return setup;
}

function showDevPinPrompt(mode = "unlock") {
    closeDevPinPrompt(false);
    return new Promise(resolve => {
        devPinResolve = resolve;
        const overlay = document.createElement("div");
        overlay.id = "devPinPrompt";
        overlay.innerHTML = `
<div id="devPinCard" role="dialog" aria-modal="true" aria-labelledby="devPinTitle">
    <div class="devPinEyebrow">WEBMINECRAFTT • DEVELOPER</div>
    <h2 id="devPinTitle">${mode === "setup" ? "Set Developer PIN" : "Developer PIN Required"}</h2>
    <p id="devPinDescription">${mode === "setup" ? "Create the PIN that protects Developer Controls on this browser." : "Enter the developer PIN to unlock Developer Controls for this login."}</p>
    <input id="devPinInput" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="12" autocomplete="one-time-code" placeholder="PIN">
    ${mode === "setup" ? '<input id="devPinConfirm" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="12" autocomplete="one-time-code" placeholder="Confirm PIN">' : ""}
    <div id="devPinStatus"></div>
    <div class="devPinActions">
        <button id="devPinCancel" class="devButton" type="button">Cancel</button>
        <button id="devPinSubmit" class="devButton good" type="button">${mode === "setup" ? "Save PIN" : "Unlock"}</button>
    </div>
</div>`;
        document.body.appendChild(overlay);
        devPinPrompt = overlay;
        const input = overlay.querySelector("#devPinInput");
        const confirm = overlay.querySelector("#devPinConfirm");
        const status = overlay.querySelector("#devPinStatus");
        const submit = overlay.querySelector("#devPinSubmit");
        const cancel = overlay.querySelector("#devPinCancel");

        const setPinStatus = (message, error = true) => {
            status.textContent = message || "";
            status.style.color = error ? "#e38a7b" : "#9fce72";
        };

        const submitPin = async () => {
            const pin = input.value.trim();
            if (!/^[0-9]{4,12}$/.test(pin)) {
                setPinStatus("Use 4 to 12 digits.");
                input.focus();
                return;
            }
            if (mode === "setup") {
                if (confirm.value.trim() !== pin) {
                    setPinStatus("The PINs do not match.");
                    confirm.focus();
                    return;
                }
                try {
                    submit.disabled = true;
                    await saveNewDevPin(pin);
                    setDevPinSession(activeDevUid, true);
                    devPinUnlocked = true;
                    closeDevPinPrompt(true);
                } catch (error) {
                    submit.disabled = false;
                    setPinStatus(error?.message || "Could not save the PIN.");
                }
                return;
            }
            try {
                submit.disabled = true;
                const valid = await verifyDevPin(pin);
                if (!valid) {
                    submit.disabled = false;
                    setPinStatus("Incorrect PIN.");
                    input.select();
                    return;
                }
                setDevPinSession(activeDevUid, true);
                devPinUnlocked = true;
                closeDevPinPrompt(true);
            } catch (error) {
                submit.disabled = false;
                setPinStatus(error?.message || "Could not verify the PIN.");
            }
        };

        submit.addEventListener("click", submitPin);
        cancel.addEventListener("click", () => closeDevPinPrompt(false));
        overlay.addEventListener("click", event => {
            if (event.target === overlay) closeDevPinPrompt(false);
        });
        overlay.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                submitPin();
            } else if (event.key === "Escape") {
                event.preventDefault();
                closeDevPinPrompt(false);
            }
            event.stopPropagation();
        });
        setTimeout(() => input.focus(), 0);
    });
}

async function ensureDevPinUnlocked() {
    if (!activeDevUid) return false;
    if (devPinUnlocked || isDevPinSessionUnlocked(activeDevUid)) {
        devPinUnlocked = true;
        return true;
    }
    const mode = hasDevPin() ? "unlock" : "setup";
    return showDevPinPrompt(mode);
}

function addStyles() {
    if (document.getElementById("devControlsStyles")) return;
    const style = document.createElement("style");
    style.id = "devControlsStyles";
    style.textContent = `
#devControlsButton{position:fixed;right:28px;bottom:82px;z-index:98;display:none;min-height:48px;padding:0 16px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:linear-gradient(#75504d,#5d3f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#devControlsButton:hover{filter:brightness(1.1)}
#devControlsModal{position:fixed;inset:0;display:none;align-items:stretch;justify-content:stretch;background:#101313;z-index:500;box-sizing:border-box}
#devControlsPanel{width:100vw;height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#1c211e,#111513);color:#fff;font-family:Arial,sans-serif;box-sizing:border-box}
#devControlsHeader{display:flex;align-items:center;gap:16px;padding:18px 24px;border-bottom:2px solid #0a0c0b;background:linear-gradient(180deg,#27302a,#1b211e);min-height:74px;box-sizing:border-box}
#devControlsTitle{margin:0;font-family:MinecraftFont,monospace;font-size:24px;letter-spacing:.5px;text-shadow:2px 2px 0 #000}
#devControlsHeader::after{content:"DEVELOPER MODE";font-family:MinecraftFont,monospace;font-size:10px;color:#93b36e;margin-left:4px;opacity:.9}
#devControlsClose{margin-left:auto;width:44px;height:44px;border:0;background:transparent;color:#fff;font-size:30px;line-height:1;cursor:pointer;box-shadow:none}
#devControlsClose:hover{background:rgba(255,255,255,.06);transform:none}
#devControlsBody{flex:1;min-height:0;overflow:auto;padding:22px 24px 30px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:18px;align-content:start}
.devSection{margin:0;padding:18px;background:linear-gradient(180deg,#202722,#1a201c);border:1px solid #344139;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
.devSection h3{margin:0 0 10px;font-family:MinecraftFont,monospace;font-size:15px;color:#e8f0e5}
.devHint{color:#94a097;font-size:11px;line-height:1.5;margin:0 0 12px}
.devGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.devButton{min-height:44px;padding:9px 12px;border:2px solid #101311;border-top-color:#777f79;border-left-color:#777f79;background:linear-gradient(#656b67,#505653);color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
.devButton:hover{filter:brightness(1.08)}
.devButton.danger{background:linear-gradient(#7a4d48,#603b37)}
.devButton.good{background:linear-gradient(#657f4b,#50683d)}
.devButton:disabled{opacity:.5;cursor:default}
#devControlsStatus{grid-column:1/-1;min-height:22px;padding:7px 2px;color:#9fce72;font-size:11px}
#devMessageList{display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 390px);overflow:auto;margin-top:12px;padding-right:3px}
.devMessage{padding:10px;background:#121714;border:1px solid #313b34}
.devMessageTop{display:flex;gap:8px;align-items:center;margin-bottom:5px;font-size:11px}
.devMessageChannel{font-weight:700;color:#d4a58f}
.devMessageName{font-weight:700;color:#b8dc95;word-break:break-word}
.devMessageTime{margin-left:auto;color:#777;white-space:nowrap}
.devMessageText{font-size:12px;line-height:1.4;color:#eee;white-space:pre-wrap;word-break:break-word;margin-bottom:7px}
.devMessageDelete{min-height:30px;padding:5px 9px;border:1px solid #111;background:#633f3b;color:#fff;cursor:pointer;font-size:10px}
.devMessageDelete:hover{background:#7b4c48}
.devToggleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;background:#121714;border:1px solid #313b34}
.devToggleText strong{display:block;font-size:12px;margin-bottom:3px}.devToggleText span{color:#888;font-size:10px}
.devState{font-family:MinecraftFont,monospace;font-size:10px;color:#9fce72}
#devPinPrompt{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.84);padding:20px;box-sizing:border-box}
#devPinCard{width:min(430px,92vw);padding:24px;background:linear-gradient(#202722,#151a17);border:2px solid #0c0f0d;border-top-color:#68736a;border-left-color:#68736a;box-shadow:0 10px 32px rgba(0,0,0,.55);box-sizing:border-box}
.devPinEyebrow{font-family:MinecraftFont,monospace;font-size:9px;color:#8eab70;margin-bottom:10px}
#devPinTitle{margin:0 0 8px;font-family:MinecraftFont,monospace;font-size:18px;text-shadow:2px 2px 0 #000}
#devPinDescription{margin:0 0 16px;color:#a7b0aa;font-size:12px;line-height:1.5}
#devPinInput,#devPinConfirm{display:block;width:100%;box-sizing:border-box;margin-top:9px;padding:12px;background:#0e1210;color:#fff;border:2px solid #0a0c0b;border-top-color:#657068;border-left-color:#657068;outline:none;font-size:18px;letter-spacing:5px;text-align:center}
#devPinInput:focus,#devPinConfirm:focus{border-color:#7fa05f}
#devPinStatus{min-height:20px;margin-top:9px;font-size:11px}
.devPinActions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
@media(max-width:900px){#devControlsBody{grid-template-columns:1fr}.devGrid{grid-template-columns:1fr}#devMessageList{max-height:420px}}
@media(max-width:650px){#devControlsButton{right:14px;bottom:82px}#devControlsHeader{padding:15px 16px}#devControlsBody{padding:15px 16px 24px}.devSection{padding:14px}#devControlsTitle{font-size:19px}#devControlsHeader::after{display:none}.devMessageTime{display:none}}
`;
    document.head.appendChild(style);
}

function createUi() {
    if (panel) return;
    addStyles();

    const button = document.createElement("button");
    button.id = "devControlsButton";
    button.type = "button";
    button.textContent = "Dev Controls";
    button.addEventListener("click", openPanel);
    document.body.appendChild(button);

    panel = document.createElement("div");
    panel.id = "devControlsModal";
    panel.innerHTML = `
<div id="devControlsPanel" role="dialog" aria-modal="true" aria-labelledby="devControlsTitle">
    <header id="devControlsHeader"><h2 id="devControlsTitle">Developer Controls</h2><button id="devControlsClose" type="button" aria-label="Close">×</button></header>
    <div id="devControlsBody">
        <section class="devSection">
            <h3>Server</h3>
            <p class="devHint">Maintenance mode blocks players from creating new multiplayer servers. Existing server joining remains available. It does not expose a Render/API secret in the browser.</p>
            <div class="devToggleRow"><div class="devToggleText"><strong>Multiplayer maintenance</strong><span>Disconnect players and block new joins on the website.</span></div><button id="devMaintenance" class="devButton danger" type="button">Enable</button></div>
        </section>
        <section class="devSection">
            <h3>Discussions</h3>
            <p class="devHint">You can remove individual messages or wipe an entire discussion channel.</p>
            <div class="devGrid"><button id="devRefreshMessages" class="devButton" type="button">Refresh Messages</button><button id="devDeleteChat" class="devButton danger" type="button">Delete All Chat</button><button id="devDeleteBugs" class="devButton danger" type="button">Delete All Bug Reports</button><button id="devDeleteAll" class="devButton danger" type="button">Delete Everything</button></div>
            <div id="devMessageList"><div class="devHint">Open the panel to load messages.</div></div>
        </section>
        <section class="devSection">
            <h3>Admin</h3>
            <p class="devHint">Open the full Admin Controls window directly from Developer Controls.</p>
            <button id="devOpenAdmin" class="devButton good" type="button">Open Admin Controls</button>
            <div id="devAdminMakerMount"></div>
        </section>
        <section class="devSection">
            <h3>Quick actions</h3>
            <p class="devHint">Useful owner tools for keeping the site under control.</p>
            <div class="devGrid"><button id="devReload" class="devButton" type="button">Reload Website</button><button id="devChangePin" class="devButton" type="button">Change PIN</button><button id="devLogout" class="devButton danger" type="button">Sign Out</button></div>
        </section>
        <div id="devControlsStatus"></div>
    </div>
</div>`;
    document.body.appendChild(panel);

    statusEl = panel.querySelector("#devControlsStatus");
    messageList = panel.querySelector("#devMessageList");

    panel.querySelector("#devControlsClose").addEventListener("click", closePanel);
    panel.addEventListener("click", event => { if (event.target === panel) closePanel(); });
    panel.querySelector("#devMaintenance").addEventListener("click", toggleMaintenance);
    panel.querySelector("#devRefreshMessages").addEventListener("click", loadMessages);
    panel.querySelector("#devDeleteChat").addEventListener("click", () => deleteChannel("chat"));
    panel.querySelector("#devDeleteBugs").addEventListener("click", () => deleteChannel("bugs"));
    panel.querySelector("#devDeleteAll").addEventListener("click", deleteEverything);
    panel.querySelector("#devOpenAdmin").addEventListener("click", async () => {
        if (typeof window.WebMinecraftTAdminControls?.open !== "function") {
            setStatus("Admin Controls is still loading. Try again in a moment.", true);
            return;
        }
        await window.WebMinecraftTAdminControls.open();
    });
    panel.querySelector("#devReload").addEventListener("click", () => location.reload());
    panel.querySelector("#devChangePin").addEventListener("click", async () => {
        if (!activeDevUid) return setStatus("Developer access denied.", true);
        const ok = await changeDevPin();
        if (ok) setStatus("Developer PIN changed.");
    });
    panel.querySelector("#devLogout").addEventListener("click", async () => {
        const firebase = await waitForFirebase();
        setDevPinSession(activeDevUid, false);
        devPinUnlocked = false;
        try { await firebase?.auth?.()?.signOut?.(); } catch {}
        closePanel();
    });
}

function setButtonState() {
    const button = document.getElementById("devControlsButton");
    if (button) button.style.display = maintenanceEnabled || panel?.dataset.devVisible === "1" ? "block" : "none";
}

async function loadMaintenanceState() {
    const firebase = await waitForFirebase();
    const db = dbFor(firebase);
    if (!db) return;
    try {
        if (maintenanceUnsubscribe) maintenanceUnsubscribe();
        maintenanceUnsubscribe = db.collection("serverControl").doc("main").onSnapshot(snapshot => {
            maintenanceEnabled = Boolean(snapshot.data()?.maintenance);
            const button = panel?.querySelector("#devMaintenance");
            if (button) {
                button.textContent = maintenanceEnabled ? "Disable" : "Enable";
                button.classList.toggle("good", maintenanceEnabled);
                button.classList.toggle("danger", !maintenanceEnabled);
            }
        }, () => {});
    } catch {}
}

async function toggleMaintenance() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const db = dbFor(firebase);
    if (!db) return setStatus("Firebase is not ready.", true);
    const next = !maintenanceEnabled;
    try {
        await db.collection("serverControl").doc("main").set({
            maintenance: next,
            updatedAt: new Date(),
            updatedBy: user.email,
        }, { merge: true });
        setStatus(next ? "Multiplayer maintenance is ON." : "Multiplayer maintenance is OFF.");
    } catch (error) {
        console.error(error);
        setStatus("Could not change maintenance mode.", true);
    }
}

function discussionDate(data) {
    const value = data?.createdAt?.toDate?.() || (data?.createdAt ? new Date(data.createdAt) : null);
    return value && !Number.isNaN(value.getTime()) ? value : new Date(0);
}

function stopDiscussionListeners() {
    discussionUnsubscribers.forEach(unsubscribe => {
        try { unsubscribe?.(); } catch {}
    });
    discussionUnsubscribers = [];
    liveDiscussionDocs.clear();
}

function renderLiveDiscussionMessages() {
    if (!messageList) return;
    const results = [];
    for (const [key, item] of liveDiscussionDocs) {
        results.push(item);
    }
    results.sort((a, b) => discussionDate(b.data).getTime() - discussionDate(a.data).getTime());

    messageList.innerHTML = "";
    if (!results.length) {
        messageList.innerHTML = '<div class="devHint">No messages found.</div>';
        return;
    }

    for (const item of results) {
        const data = item.data || {};
        const row = document.createElement("div");
        row.className = "devMessage";
        const date = discussionDate(data);
        row.innerHTML = `<div class="devMessageTop"><span class="devMessageChannel">${item.channel === "bugs" ? "BUG" : "CHAT"}</span><span class="devMessageName">${escapeHtml(data.name || "Player")}</span><span class="devMessageTime">${date.getTime() ? escapeHtml(date.toLocaleString()) : ""}</span></div><div class="devMessageText">${escapeHtml(data.text || "")}</div><button class="devMessageDelete" type="button">Delete Message</button>`;
        row.querySelector(".devMessageDelete").addEventListener("click", () => deleteMessage(item.channel, item.id, row));
        messageList.appendChild(row);
    }
}

async function loadMessages() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const db = dbFor(firebase);
    if (!db || !messageList) return;

    stopDiscussionListeners();
    messageList.innerHTML = '<div class="devHint">Connecting to live discussions...</div>';

    try {
        for (const channel of CHANNELS) {
            const ref = db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").limit(200);
            const unsubscribe = ref.onSnapshot(snapshot => {
                for (const change of snapshot.docChanges()) {
                    const key = `${channel}:${change.doc.id}`;
                    if (change.type === "removed") {
                        liveDiscussionDocs.delete(key);
                    } else {
                        liveDiscussionDocs.set(key, {
                            channel,
                            id: change.doc.id,
                            data: change.doc.data() || {}
                        });
                    }
                }
                renderLiveDiscussionMessages();
            }, error => {
                console.error(`Live ${channel} discussion load failed:`, error);
                setStatus(`Live ${channel === "bugs" ? "bug reports" : "chat"} could not be loaded.`, true);
            });
            discussionUnsubscribers.push(unsubscribe);
        }
        renderLiveDiscussionMessages();
        setStatus("Discussions are live. New messages update automatically.");
    } catch (error) {
        console.error("Developer live discussion setup failed:", error);
        messageList.innerHTML = '<div class="devHint">Could not connect to live discussions.</div>';
        setStatus("Could not connect to live discussions.", true);
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function deleteMessage(channel, id, row) {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    if (!confirm("Delete this message?")) return;
    try {
        const db = dbFor(firebase);
        await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").doc(id).delete();
        row?.remove();
        setStatus("Message deleted.");
    } catch (error) {
        console.error(error);
        setStatus("Could not delete message.", true);
    }
}

async function deleteChannel(channel) {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    const label = channel === "bugs" ? "all bug reports" : "all chat messages";
    if (!confirm(`Delete ${label}?`)) return;
    try {
        const db = dbFor(firebase);
        let total = 0;
        while (true) {
            const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").limit(400).get();
            if (snapshot.empty) break;
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            total += snapshot.size;
            if (snapshot.size < 400) break;
        }
        setStatus(`Deleted ${total} messages from ${channel}. Live list updated automatically.`);
    } catch (error) {
        console.error(error);
        setStatus("Could not delete the channel messages.", true);
    }
}

async function deleteEverything() {
    const { firebase, user } = await getDevUser();
    if (!user) return setStatus("Developer access denied.", true);
    if (!confirm("Delete ALL Report Bugs and Universal Chat messages? This cannot be undone.")) return;
    for (const channel of CHANNELS) {
        try {
            const db = dbFor(firebase);
            while (true) {
                const snapshot = await db.collection(DISCUSSION_COLLECTION).doc(channel).collection("messages").limit(400).get();
                if (snapshot.empty) break;
                const batch = db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                if (snapshot.size < 400) break;
            }
        } catch (error) {
            console.error(error);
            return setStatus("Could not finish deleting everything.", true);
        }
    }
    setStatus("All discussion messages deleted. Live list updated automatically.");
}

async function openPanel() {
    createUi();
    const { user } = await getDevUser();
    if (!user) return alert("Developer access denied.");
    activeDevUid = user.uid;
    const unlocked = await ensureDevPinUnlocked();
    if (!unlocked) return;
    panel.dataset.devVisible = "1";
    panel.style.display = "flex";
    document.exitPointerLock?.();
    setStatus("Developer access granted.");
    await loadMaintenanceState();
    await loadMessages();
}

function closePanel() {
    if (!panel) return;
    panel.style.display = "none";
}

async function init() {
    createUi();
    const firebase = await waitForFirebase();
    const syncButton = async () => {
        const user = firebase?.auth?.()?.currentUser || null;
        const button = document.getElementById("devControlsButton");
        const allowed = String(user?.email || "").toLowerCase() === DEV_EMAIL;
        const previousUid = activeDevUid;
        if (!allowed && previousUid) setDevPinSession(previousUid, false);
        activeDevUid = allowed ? user.uid : null;
        devPinUnlocked = allowed && isDevPinSessionUnlocked(user.uid);
        if (button) button.style.display = allowed ? "block" : "none";
        if (!allowed) {
            closePanel();
            closeDevPinPrompt(false);
        } else if (user && !devPinUnlocked) {
            await ensureDevPinUnlocked();
        }
    };
    await syncButton();
    firebase?.auth?.()?.onAuthStateChanged?.(async user => {
        await syncButton();
    });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
