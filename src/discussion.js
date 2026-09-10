const COLLECTION = "discussions";
const CHANNELS = {
    bugs: { title: "Report Bugs", subtitle: "Tell us about a problem you found." },
    chat: { title: "Universal Chat", subtitle: "Chat with everyone playing WebMinecraftT." }
};
const MAX_TEXT = 1000;
const MAX_NAME = 40;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

let authReady = null;
let modal = null;
let list = null;
let input = null;
let sendButton = null;
let status = null;
let activeChannel = "chat";
let unsubscribe = null;
let cleanupTimer = null;
let initialized = false;

function waitForFirebase(timeout = 15000) {
    if (authReady) return authReady;
    authReady = new Promise(resolve => {
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
    return authReady;
}

function firestore(firebase) {
    try { return firebase?.firestore?.(); } catch { return null; }
}

function channelRef(firebase, channel) {
    const db = firestore(firebase);
    return db?.collection(COLLECTION).doc(channel).collection("messages") || null;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function addStyles() {
    if (document.getElementById("discussionStyles")) return;
    const style = document.createElement("style");
    style.id = "discussionStyles";
    style.textContent = `
#discussionButton{position:fixed;left:28px;bottom:82px;width:118px;min-height:48px;z-index:97;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:linear-gradient(#666,#4c4c4c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#discussionButton:hover{filter:brightness(1.1)}
#discussionModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:260;padding:20px;box-sizing:border-box}
#discussionPanel{width:min(760px,96vw);height:min(700px,90vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#1a1a1a);border:2px solid #101010;border-top-color:#747474;border-left-color:#747474;box-shadow:8px 8px 0 rgba(0,0,0,.45);color:#fff;font-family:Arial,sans-serif;box-sizing:border-box}
#discussionHeader{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:2px solid #0d0d0d;background:#323232}
#discussionTitle{margin:0;font-family:MinecraftFont,monospace;font-size:24px;text-shadow:2px 2px 0 #000}
#discussionClose{margin-left:auto;width:42px;height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#4c4c4c;color:#fff;font-size:20px;cursor:pointer}
#discussionTabs{display:grid;grid-template-columns:1fr 1fr;border-bottom:2px solid #0d0d0d;background:#242424}
.discussionTab{height:50px;border:0;border-right:1px solid #111;background:#333;color:#aaa;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer}
.discussionTab.active{background:#5c7b43;color:#fff;box-shadow:inset 0 -3px 0 #89aa69}
#discussionSubtitle{margin:12px 18px 4px;color:#aaa;font-size:12px}
#discussionWarning{margin:8px 18px 0;padding:9px 11px;background:#4a3920;border:1px solid #80652f;color:#f3dca5;font-size:11px;line-height:1.4}
#discussionMessages{flex:1;min-height:0;overflow:auto;padding:12px 18px 18px;display:flex;flex-direction:column;gap:9px}
.discussionMessage{padding:10px 12px;background:#222;border:1px solid #3f3f3f;border-radius:4px}
.discussionMessageHead{display:flex;align-items:center;gap:9px;margin-bottom:5px}
.discussionMessageName{font-weight:700;color:#b8dc95;word-break:break-word}
.discussionMessageTime{font-size:10px;color:#777;margin-left:auto;white-space:nowrap}
.discussionMessageText{font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#eee}
#discussionEmpty{text-align:center;color:#777;padding:50px 20px;font-size:13px}
#discussionComposer{padding:12px 18px;border-top:2px solid #0d0d0d;background:#292929}
#discussionInput{width:100%;min-height:78px;resize:none;padding:10px 12px;box-sizing:border-box;background:#111;color:#fff;border:2px solid #0a0a0a;border-top-color:#666;border-left-color:#666;outline:none;font:13px Arial,sans-serif}
#discussionInput:focus{border-color:#79a158}
#discussionComposerBottom{display:flex;align-items:center;gap:10px;margin-top:9px}
#discussionStatus{flex:1;min-height:18px;color:#999;font-size:11px}
#discussionSend{min-width:110px;min-height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#6d8d4e,#526f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222}
#discussionSend:disabled{opacity:.55;cursor:default}
@media(max-width:600px){#discussionButton{left:14px;bottom:82px;width:112px}#discussionPanel{height:94vh;width:98vw}#discussionTitle{font-size:19px}.discussionMessageTime{display:none}}
`;
    document.head.appendChild(style);
}

function createUi() {
    if (modal) return;
    addStyles();

    const button = document.createElement("button");
    button.id = "discussionButton";
    button.type = "button";
    button.textContent = "Discussions";
    button.addEventListener("click", openDiscussions);
    document.body.appendChild(button);

    modal = document.createElement("div");
    modal.id = "discussionModal";
    modal.innerHTML = `
<div id="discussionPanel" role="dialog" aria-modal="true" aria-labelledby="discussionTitle">
    <header id="discussionHeader"><h2 id="discussionTitle">Discussions</h2><button id="discussionClose" type="button" aria-label="Close">×</button></header>
    <div id="discussionTabs">
        <button class="discussionTab" data-channel="bugs" type="button">Report Bugs</button>
        <button class="discussionTab active" data-channel="chat" type="button">Universal Chat</button>
    </div>
    <div id="discussionSubtitle"></div>
    <div id="discussionWarning">⚠ Please be respectful. Do not post bad, hateful, threatening, or inappropriate content. Keep the chat friendly for everyone.</div>
    <div id="discussionMessages"><div id="discussionEmpty">Loading…</div></div>
    <div id="discussionComposer">
        <textarea id="discussionInput" maxlength="1000" placeholder="Write a message..."></textarea>
        <div id="discussionComposerBottom"><div id="discussionStatus"></div><button id="discussionSend" type="button">Send</button></div>
    </div>
</div>`;
    document.body.appendChild(modal);
    list = modal.querySelector("#discussionMessages");
    input = modal.querySelector("#discussionInput");
    sendButton = modal.querySelector("#discussionSend");
    status = modal.querySelector("#discussionStatus");

    modal.querySelector("#discussionClose").addEventListener("click", closeDiscussions);
    modal.addEventListener("click", event => { if (event.target === modal) closeDiscussions(); });
    modal.querySelectorAll(".discussionTab").forEach(tab => tab.addEventListener("click", () => selectChannel(tab.dataset.channel)));
    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

async function getUser() {
    const firebase = await waitForFirebase();
    return firebase?.auth?.()?.currentUser || null;
}

function currentDisplayName(user) {
    const name = String(user?.displayName || user?.email?.split("@")[0] || "Player").trim();
    return name.slice(0, MAX_NAME) || "Player";
}

function setStatus(text, error = false) {
    if (!status) return;
    status.textContent = text || "";
    status.style.color = error ? "#d99a9a" : "#999";
}

function renderMessage(doc) {
    const data = doc.data() || {};
    const wrapper = document.createElement("article");
    wrapper.className = "discussionMessage";
    const date = data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null);
    const validDate = date && !Number.isNaN(date.getTime()) ? date : null;
    const time = validDate ? validDate.toLocaleString([], { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }) : "";
    wrapper.innerHTML = `<div class="discussionMessageHead"><span class="discussionMessageName">${escapeHtml(data.name || "Player")}</span><span class="discussionMessageTime">${escapeHtml(time)}</span></div><div class="discussionMessageText">${escapeHtml(data.text || "")}</div>`;
    return wrapper;
}

function renderSnapshot(snapshot) {
    if (!list) return;
    list.innerHTML = "";
    if (snapshot.empty) {
        list.innerHTML = `<div id="discussionEmpty">${activeChannel === "bugs" ? "No bug reports yet." : "No messages yet. Start the conversation!"}</div>`;
        return;
    }
    snapshot.docs.forEach(doc => list.appendChild(renderMessage(doc)));
    list.scrollTop = list.scrollHeight;
}

async function subscribe() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    if (!list) return;
    list.innerHTML = `<div id="discussionEmpty">Loading…</div>`;
    const firebase = await waitForFirebase();
    if (!firebase) {
        list.innerHTML = `<div id="discussionEmpty">Could not connect to discussions.</div>`;
        setStatus("Firebase is not ready.", true);
        return;
    }
    try {
        const ref = channelRef(firebase, activeChannel);
        const db = firestore(firebase);
        if (!ref || !db) throw new Error("Firestore is not available.");
        unsubscribe = ref
            .where("expiresAt", ">", new Date())
            .orderBy("expiresAt", "asc")
            .onSnapshot(renderSnapshot, error => {
                console.error("Discussion load failed:", error);
                list.innerHTML = `<div id="discussionEmpty">Could not load discussions.</div>`;
                setStatus("Could not load discussions. Check your Firebase rules.", true);
            });
    } catch (error) {
        console.error("Could not subscribe to discussions:", error);
        list.innerHTML = `<div id="discussionEmpty">Could not load discussions.</div>`;
        setStatus("Could not load discussions.", true);
    }
}

async function cleanupExpired() {
    const firebase = await waitForFirebase();
    if (!firebase) return;
    try {
        const db = firestore(firebase);
        if (!db) return;
        const now = new Date();
        for (const channel of Object.keys(CHANNELS)) {
            const ref = channelRef(firebase, channel);
            if (!ref) continue;
            const snapshot = await ref.where("expiresAt", "<=", now).limit(50).get();
            if (snapshot.empty) continue;
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    } catch (error) {
        console.warn("Discussion cleanup failed:", error);
    }
}

async function sendMessage() {
    const text = input?.value.trim() || "";
    if (!text) return setStatus("Write a message first.", true);
    if (text.length > MAX_TEXT) return setStatus(`Messages are limited to ${MAX_TEXT} characters.`, true);

    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    const db = firestore(firebase);
    if (!firebase || !user || !db) {
        setStatus("You need to log in to post in Discussions.", true);
        return;
    }

    try {
        sendButton.disabled = true;
        setStatus("Sending...");
        const createdAt = new Date();
        const expiresAt = new Date(Date.now() + TWO_DAYS_MS);
        const ref = channelRef(firebase, activeChannel);
        if (!ref) throw new Error("Firestore is not available.");
        await ref.add({
            uid: user.uid,
            name: currentDisplayName(user),
            text,
            createdAt,
            expiresAt
        });
        input.value = "";
        setStatus("Sent!");
    } catch (error) {
        console.error("Discussion send failed:", error);
        setStatus(error?.message || "Could not send your message.", true);
    } finally {
        sendButton.disabled = false;
    }
}

function selectChannel(channel) {
    if (!CHANNELS[channel]) return;
    activeChannel = channel;
    modal.querySelectorAll(".discussionTab").forEach(tab => tab.classList.toggle("active", tab.dataset.channel === channel));
    modal.querySelector("#discussionSubtitle").textContent = CHANNELS[channel].subtitle;
    input.placeholder = channel === "bugs" ? "Describe the bug and what happened..." : "Write a message...";
    setStatus("");
    subscribe();
}

async function openDiscussions() {
    createUi();
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;

    // Discussions are login-only.
    if (!user) {
        closeDiscussions();
        setTimeout(() => alert("You need to log in to use Discussions."), 0);
        return;
    }

    modal.style.display = "flex";
    document.exitPointerLock?.();
    modal.querySelector("#discussionSubtitle").textContent = CHANNELS[activeChannel].subtitle;
    setStatus("Please keep the chat respectful.");
    await subscribe();
    await cleanupExpired();
}

function closeDiscussions() {
    if (!modal) return;
    modal.style.display = "none";
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}

async function init() {
    if (initialized) return;
    initialized = true;
    createUi();
    await cleanupExpired();
    clearInterval(cleanupTimer);
    cleanupTimer = setInterval(cleanupExpired, 10 * 60 * 1000);
    window.webMinecraftDiscussion = { open: openDiscussions, close: closeDiscussions };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
