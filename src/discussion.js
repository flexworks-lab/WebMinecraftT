import { censorUserText } from "./textCensorship.js";
const COLLECTION = "discussions";
const CHANNELS = {
    bugs: { title: "Report Bugs", subtitle: "Tell us about a problem you found." },
    chat: { title: "Universal Chat", subtitle: "Chat with everyone playing WebMinecraftT." }
};
const MAX_TEXT = 1000;
const MAX_NAME = 40;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const DEV_EMAIL = "worthmarcus19@gmail.com";
const DISCUSSION_SEEN_KEY = "webminecraft-discussions-seen-v1";
let unreadUnsubscribers = [];
let discussionUnreadCount = 0;
let discussionUnreadReady = false;
let discussionModalOpen = false;

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

function isDeveloper(user) {
    return String(user?.email || "").trim().toLowerCase() === DEV_EMAIL.toLowerCase();
}

function canViewBugReports(user) {
    return isDeveloper(user);
}

function getVerifiedChatRole(user) {
    if (!user) return "";
    if (isDeveloper(user)) return "developer";
    return "";
}

async function getMyVerifiedChatRole(firebase, user) {
    if (!user?.uid || !firebase?.firestore) return "";
    if (isDeveloper(user)) return "developer";
    try {
        const snap = await firebase.firestore().collection("admins").doc(user.uid).get();
        const data = snap.data() || {};
        if (snap.exists && data.enabled === true) {
            return String(data.role || "admin").toLowerCase() === "main" ? "main" : "admin";
        }
    } catch {}
    return "";
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
#discussionButton{position:fixed;left:28px;bottom:82px;width:118px;min-height:48px;z-index:97;border:2px solid #1b1b1b;border-top-color:#a4a4a4;border-left-color:#a4a4a4;border-radius:0;background:linear-gradient(#737373,#565656);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #333;box-shadow:inset 2px 2px 0 rgba(255,255,255,.14),inset -2px -3px 0 rgba(0,0,0,.3),0 4px 0 rgba(0,0,0,.62);outline:none;transition:none}
#discussionButton:hover,#discussionButton:active{filter:none;transform:none}
#discussionButton .discussionUnreadBadge{
position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;padding:0 5px;
display:flex;align-items:center;justify-content:center;border-radius:999px;background:#d93636;
border:2px solid #151515;color:#fff;font:900 10px/1 Arial,sans-serif;text-shadow:1px 1px 0 #5b1010;
box-shadow:0 2px 5px rgba(0,0,0,.45);pointer-events:none;z-index:5
}
body.webminecraft-in-world #discussionButton{display:none !important}
body.webminecraft-in-world #discussionModal{display:none !important}
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
.discussionVerifiedBadge{display:inline-flex;align-items:center;gap:3px;margin-left:-3px;padding:2px 5px;border-radius:999px;font:900 9px/1 Arial,sans-serif;white-space:nowrap;text-shadow:1px 1px 0 rgba(0,0,0,.35);vertical-align:1px}
.discussionVerifiedDeveloper{background:#7d2020;border:1px solid #ff6b5f;color:#fff0ed}
.discussionVerifiedMain{background:#6f5217;border:1px solid #d8ae48;color:#fff3bd}
.discussionVerifiedAdmin{background:#245a96;border:1px solid #5ea9ff;color:#eaf5ff}
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

function getSeenDiscussionIds() {
    try {
        const raw = JSON.parse(localStorage.getItem(DISCUSSION_SEEN_KEY) || "[]");
        return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch {
        return new Set();
    }
}

function saveSeenDiscussionIds(ids) {
    try {
        localStorage.setItem(DISCUSSION_SEEN_KEY, JSON.stringify([...ids].slice(-1000)));
    } catch {}
}

function setDiscussionUnreadCount(count) {
    const button = document.getElementById("discussionButton");
    if (!button) return;
    button.querySelector(".discussionUnreadBadge")?.remove();
    const total = Math.max(0, Number(count) || 0);
    discussionUnreadCount = total;
    if (!total) return;
    const badge = document.createElement("span");
    badge.className = "discussionUnreadBadge";
    badge.textContent = total > 9 ? "9+" : String(total);
    button.appendChild(badge);
}

function markDiscussionsRead() {
    const seen = getSeenDiscussionIds();
    saveSeenDiscussionIds(seen);
    setDiscussionUnreadCount(0);
}

function stopUnreadListeners() {
    for (const unsubscribe of unreadUnsubscribers) {
        try { unsubscribe?.(); } catch {}
    }
    unreadUnsubscribers = [];
    discussionUnreadReady = false;
}

function startUnreadListeners(firebase, user) {
    stopUnreadListeners();
    if (!firebase || !user) {
        setDiscussionUnreadCount(0);
        return;
    }
    const db = firestore(firebase);
    if (!db) return;

    const seen = getSeenDiscussionIds();
    const channelReady = new Map();

    const channels = isDeveloper(user) ? Object.keys(CHANNELS) : ["chat"];
    for (const channel of channels) {
        const ref = channelRef(firebase, channel);
        if (!ref) continue;
        try {
            const unsub = ref.orderBy("createdAt", "desc").limit(100).onSnapshot(snapshot => {
                const docs = snapshot.docs;
                if (!discussionUnreadReady) {
                    for (const doc of docs) seen.add(String(doc.id));
                    saveSeenDiscussionIds(seen);
                    channelReady.set(channel, true);
                    if (channels.every(name => channelReady.get(name))) discussionUnreadReady = true;
                    if (discussionModalOpen) setDiscussionUnreadCount(0);
                    return;
                }

                let added = 0;
                for (const change of snapshot.docChanges()) {
                    if (change.type !== "added") continue;
                    const id = String(change.doc.id);
                    if (seen.has(id)) continue;
                    seen.add(id);
                    const data = change.doc.data() || {};
                    if (String(data.uid || "") !== String(user.uid || "")) added++;
                }
                if (added) saveSeenDiscussionIds(seen);
                if (!discussionModalOpen && added) setDiscussionUnreadCount(discussionUnreadCount + added);
            }, error => console.warn("Discussion unread listener failed:", error));
            unreadUnsubscribers.push(unsub);
        } catch (error) {
            console.warn("Could not start discussion unread listener:", error);
        }
    }
}

function updateBugReportsVisibility(user = null) {
    if (!modal) return;
    const bugTab = modal.querySelector('.discussionTab[data-channel="bugs"]');
    const showBugs = isDeveloper(user);
    if (bugTab) bugTab.style.display = showBugs ? "" : "none";
    if (!showBugs && activeChannel === "bugs") {
        selectChannel("chat");
    }
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
        event.stopPropagation();
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    input.addEventListener("keyup", event => event.stopPropagation());
    input.addEventListener("keypress", event => event.stopPropagation());
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
    const verifiedRole = String(data.verifiedRole || "").toLowerCase();
    const badge = verifiedRole === "developer"
        ? `<span class="discussionVerifiedBadge discussionVerifiedDeveloper">✓ Developer</span>`
        : verifiedRole === "main"
            ? `<span class="discussionVerifiedBadge discussionVerifiedMain">★ Main Admin</span>`
            : verifiedRole === "admin"
                ? `<span class="discussionVerifiedBadge discussionVerifiedAdmin">✓ Verified Admin</span>`
                : "";
    wrapper.innerHTML = `<div class="discussionMessageHead"><span class="discussionMessageName">${escapeHtml(data.name || "Player")}</span>${badge}<span class="discussionMessageTime">${escapeHtml(time)}</span></div><div class="discussionMessageText">${escapeHtml(censorUserText(data.text || ""))}</div>`;
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
        const user = firebase?.auth?.()?.currentUser || null;
        if (activeChannel === "bugs" && !canViewBugReports(user)) {
            if (list) list.innerHTML = '<div id="discussionEmpty">Bug reports are private.</div>';
            setStatus("Only the developer can view bug reports.", true);
            return;
        }
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
    const rawText = input?.value || "";
    const text = censorUserText(rawText).trim();
    if (!text) return setStatus("Write a message first.", true);
    if (rawText.length > MAX_TEXT) return setStatus(`Messages are limited to ${MAX_TEXT} characters.`, true);

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
        const verifiedRole = await getMyVerifiedChatRole(firebase, user);
        const ref = channelRef(firebase, activeChannel);
        if (!ref) throw new Error("Firestore is not available.");
        await ref.add({
            uid: user.uid,
            name: currentDisplayName(user),
            text,
            verifiedRole,
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
    discussionModalOpen = true;
    setDiscussionUnreadCount(0);
    markDiscussionsRead();
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;

    // Discussions are login-only.
    if (!user) {
        closeDiscussions();
        setTimeout(() => alert("You need to log in to use Discussions."), 0);
        return;
    }

    updateBugReportsVisibility(user);
    if (!canViewBugReports(user) && activeChannel === "bugs") activeChannel = "chat";
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
    discussionModalOpen = false;
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}

async function init() {
    if (initialized) return;
    initialized = true;
    createUi();
    const firebase = await waitForFirebase();
    if (firebase?.auth) {
        firebase.auth().onAuthStateChanged(user => {
            stopUnreadListeners();
            updateBugReportsVisibility(user);
            if (user) startUnreadListeners(firebase, user);
            else setDiscussionUnreadCount(0);
        });
    }
    await cleanupExpired();
    clearInterval(cleanupTimer);
    cleanupTimer = setInterval(cleanupExpired, 10 * 60 * 1000);
    window.webMinecraftDiscussion = { open: openDiscussions, close: closeDiscussions };
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();