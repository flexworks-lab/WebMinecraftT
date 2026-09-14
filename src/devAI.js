const DEV_EMAIL = "worthmarcus19@gmail.com";
const AI_API = "https://webminecraft-server.onrender.com/api/dev-ai";
const STORAGE_KEY = "webminecraft-dev-ai-chats-v2";

let panel = null;
let chatsEl = null;
let messagesEl = null;
let inputEl = null;
let statusEl = null;
let modeEl = null;
let searchEl = null;
let chats = [];
let activeChatId = null;
let busy = false;

function waitForFirebase(timeout = 12000) {
    return new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase?.auth) return resolve(firebase);
            } catch {}
            if (Date.now() - started >= timeout) return resolve(null);
            setTimeout(check, 80);
        };
        check();
    });
}

async function getDeveloperToken() {
    const firebase = await waitForFirebase();
    const user = firebase?.auth?.()?.currentUser || null;
    if (!user || String(user.email || "").toLowerCase() !== DEV_EMAIL) return null;
    try { return await user.getIdToken(); } catch { return null; }
}

function loadChats() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        chats = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch { chats = []; }
    if (!chats.length) createChat(false);
    activeChatId = activeChatId && chats.some(chat => chat.id === activeChatId) ? activeChatId : chats[0].id;
}

function saveChats() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 40))); } catch {}
}

function createChat(save = true) {
    const now = Date.now();
    const chat = {
        id: `chat-${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: "New chat",
        createdAt: now,
        updatedAt: now,
        messages: []
    };
    chats.unshift(chat);
    activeChatId = chat.id;
    if (save) saveChats();
    renderAll();
    inputEl?.focus();
    return chat;
}

function activeChat() { return chats.find(chat => chat.id === activeChatId) || null; }

function updateTitle(chat, text) {
    if (!chat || chat.title !== "New chat") return;
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean) chat.title = clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
}

function deleteChat(id) {
    const index = chats.findIndex(chat => chat.id === id);
    if (index < 0) return;
    chats.splice(index, 1);
    if (!chats.length) createChat(false);
    activeChatId = chats[Math.min(index, chats.length - 1)].id;
    saveChats();
    renderAll();
}

function addStyles() {
    if (document.getElementById("devAIStyles")) return;
    const style = document.createElement("style");
    style.id = "devAIStyles";
    style.textContent = `
#devAIButton{position:fixed;right:28px;bottom:138px;z-index:98;display:none;min-height:48px;padding:0 17px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:5px;background:linear-gradient(#587b9d,#344d63);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px #222;box-shadow:0 3px #111}
#devAIButton:hover{filter:brightness(1.08)}
#devAIModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);z-index:510;padding:16px;box-sizing:border-box}
#devAIPanel{width:min(1120px,98vw);height:min(780px,94vh);display:flex;flex-direction:column;background:#15181c;border:1px solid #56616d;border-radius:12px;box-shadow:0 22px 70px rgba(0,0,0,.65);color:#f4f7fa;font-family:Arial,sans-serif;overflow:hidden}
#devAIHeader{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #303841;background:linear-gradient(#242b33,#1d2329)}
#devAITitle{margin:0;font-family:MinecraftFont,monospace;font-size:20px;text-shadow:2px 2px #000}
#devAISubtitle{font-size:11px;color:#9aa6b2}
#devAIClose{margin-left:auto;width:38px;height:34px;border:1px solid #6b747e;border-radius:7px;background:#343b43;color:#fff;font-size:20px;cursor:pointer}
#devAILayout{flex:1;min-height:0;display:grid;grid-template-columns:250px minmax(0,1fr)}
#devAISidebar{min-width:0;background:#101317;border-right:1px solid #2b333b;display:flex;flex-direction:column}
#devAISideTop{padding:10px;border-bottom:1px solid #242b31;display:flex;gap:7px}
#devAINew{flex:1;height:38px;border:1px solid #788592;border-radius:7px;background:#e8eef4;color:#12161b;font-weight:700;cursor:pointer}
#devAISearch{width:34px;height:38px;border:1px solid #3d4650;border-radius:7px;background:#222930;color:#fff;cursor:pointer}
#devAIChatList{overflow:auto;flex:1;padding:8px}
.devAIChatRow{display:flex;align-items:center;gap:4px;margin-bottom:5px}
.devAIChatPick{flex:1;text-align:left;border:1px solid transparent;border-radius:7px;background:transparent;color:#dfe6ec;padding:9px 10px;cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.devAIChatRow.active .devAIChatPick{background:#28323c;border-color:#3b4a58}
.devAIChatPick small{display:block;color:#7f8a95;font-size:10px;margin-top:3px}
.devAIDelete{width:28px;height:30px;border:0;border-radius:6px;background:transparent;color:#77818b;cursor:pointer}
.devAIDelete:hover{background:#3a2424;color:#f08b8b}
#devAIContent{min-width:0;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 0,#202832 0,#161b20 36%,#121519 100%)}
#devAIToolbar{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #29313a}
#devAIMode{height:34px;border:1px solid #49545f;border-radius:7px;background:#20272e;color:#eef3f7;padding:0 10px}
#devAIStatus{margin-left:auto;min-height:16px;color:#8d99a5;font-size:11px}
#devAIChat{flex:1;min-height:0;overflow:auto;padding:18px 18px 26px;display:flex;flex-direction:column;gap:14px}
.devAIMessage{max-width:min(860px,90%);padding:11px 13px;border:1px solid #313b45;border-radius:10px;background:#1b2127;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.devAIMessage.user{align-self:flex-end;background:#29445c;border-color:#3f617e}
.devAIMessage.assistant{align-self:flex-start}
.devAIName{font-size:10px;color:#8d99a5;margin-bottom:5px;font-family:MinecraftFont,monospace}
#devAIComposer{padding:12px;border-top:1px solid #29313a;background:rgba(13,16,19,.92);display:flex;gap:9px}
#devAIInput{flex:1;min-height:64px;max-height:190px;resize:vertical;box-sizing:border-box;padding:12px 13px;border:1px solid #46515c;border-radius:9px;background:#0d1013;color:#fff;font:13px Arial,sans-serif;outline:none}
#devAIInput:focus{border-color:#718190}
#devAISend{width:112px;border:1px solid #80936f;border-radius:9px;background:linear-gradient(#718f58,#526b43);color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px #222}
#devAISend:disabled{opacity:.5;cursor:default}
@media(max-width:760px){#devAIPanel{height:96vh}#devAILayout{grid-template-columns:1fr}#devAISidebar{display:none}.devAIMessage{max-width:96%}#devAIComposer{flex-direction:column}#devAISend{width:100%;min-height:42px}}
`;
    document.head.appendChild(style);
}

function renderChats() {
    if (!chatsEl) return;
    const query = String(searchEl?.value || "").trim().toLowerCase();
    chatsEl.innerHTML = "";
    for (const chat of chats.filter(item => !query || item.title.toLowerCase().includes(query) || item.messages.some(m => String(m.content).toLowerCase().includes(query)))) {
        const row = document.createElement("div");
        row.className = `devAIChatRow${chat.id === activeChatId ? " active" : ""}`;
        const pick = document.createElement("button");
        pick.className = "devAIChatPick";
        pick.type = "button";
        pick.innerHTML = `<span>${escapeHtml(chat.title)}</span><small>${chat.messages.length ? `${chat.messages.length} messages` : "Empty chat"}</small>`;
        pick.addEventListener("click", () => { activeChatId = chat.id; renderAll(); inputEl?.focus(); });
        const del = document.createElement("button");
        del.className = "devAIDelete";
        del.type = "button";
        del.title = "Delete chat";
        del.textContent = "×";
        del.addEventListener("click", event => { event.stopPropagation(); deleteChat(chat.id); });
        row.append(pick, del);
        chatsEl.appendChild(row);
    }
}

function escapeHtml(text) { return String(text).replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char])); }

function renderMessages() {
    if (!messagesEl) return;
    const chat = activeChat();
    messagesEl.innerHTML = "";
    if (!chat?.messages.length) {
        renderMessage("assistant", "Hey! I’m here. We can just talk normally, or you can ask me to help with WebMinecraft. I’ll only change the game when you ask me to.");
        return;
    }
    for (const message of chat.messages) renderMessage(message.role, message.content, false);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessage(role, text, persist = true) {
    if (!messagesEl) return;
    const row = document.createElement("div");
    row.className = `devAIMessage ${role}`;
    const name = document.createElement("div");
    name.className = "devAIName";
    name.textContent = role === "user" ? "YOU" : "DEV AI";
    const body = document.createElement("div");
    body.textContent = text;
    row.append(name, body);
    messagesEl.appendChild(row);
    if (persist) messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = error ? "#ef8c7f" : "#8d99a5";
}

function setBusy(value) {
    busy = value;
    const button = panel?.querySelector("#devAISend");
    if (button) button.disabled = value;
}

async function sendMessage() {
    if (busy) return;
    const text = inputEl?.value?.trim();
    if (!text) return;
    const token = await getDeveloperToken();
    if (!token) return setStatus("Developer access denied.", true);
    const chat = activeChat() || createChat(false);
    const mode = modeEl?.value || "auto";

    inputEl.value = "";
    updateTitle(chat, text);
    chat.messages.push({ role: "user", content: text });
    chat.updatedAt = Date.now();
    saveChats();
    renderAll();
    setBusy(true);
    setStatus(mode === "chat" ? "Thinking…" : mode === "edit" ? "Inspecting project and preparing change…" : "Understanding request…");

    try {
        const response = await fetch(AI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                messages: chat.messages.slice(-24),
                userRequest: text,
                game: "WebMinecraftT",
                mode,
                applyChange: mode !== "chat",
                instruction: "Use the userRequest field as the actual request. Understand casual wording, shorthand, typos, prior chat context, and references to earlier decisions. For normal conversation, talk naturally like a helpful assistant. Only modify code when the user clearly asks to add, remove, fix, change, edit, or implement something. Never claim code was changed, committed, tested, or deployed unless it actually happened."
            }),
            cache: "no-store"
        });
        let data = null;
        try { data = await response.json(); } catch {}
        if (!response.ok) throw new Error(data?.error || `AI server returned ${response.status}.`);
        const answer = String(data?.reply || data?.message || data?.content || "No response received.");
        chat.messages.push({ role: "assistant", content: answer });
        chat.updatedAt = Date.now();
        saveChats();
        renderAll();
        setStatus(data?.changed ? "Change prepared in GitHub." : "Ready for your next request.");
    } catch (error) {
        console.error("Developer AI failed:", error);
        chat.messages.push({ role: "assistant", content: `I could not complete that request. ${error?.message || "The AI server could not be reached."}` });
        chat.updatedAt = Date.now();
        saveChats();
        renderAll();
        setStatus(error?.message || "Developer AI could not connect.", true);
    } finally {
        setBusy(false);
        inputEl?.focus();
    }
}

function createUI() {
    if (panel) return;
    addStyles();
    loadChats();

    const button = document.createElement("button");
    button.id = "devAIButton";
    button.type = "button";
    button.textContent = "Dev AI";
    button.addEventListener("click", openPanel);
    document.body.appendChild(button);

    panel = document.createElement("div");
    panel.id = "devAIModal";
    panel.innerHTML = `
<div id="devAIPanel" role="dialog" aria-modal="true" aria-labelledby="devAITitle">
<header id="devAIHeader"><div><h2 id="devAITitle">Developer AI</h2><div id="devAISubtitle">Talk normally or build WebMinecraft</div></div><button id="devAIClose" type="button" aria-label="Close">×</button></header>
<div id="devAILayout">
<aside id="devAISidebar"><div id="devAISideTop"><button id="devAINew" type="button">＋ New chat</button><button id="devAISearch" type="button" title="Search chats">⌕</button></div><input id="devAISearchInput" aria-label="Search chats" placeholder="Search chats…" style="display:none;margin:0 10px 8px;padding:9px;border:1px solid #3d4650;border-radius:7px;background:#171c21;color:#fff"><div id="devAIChatList"></div></aside>
<main id="devAIContent"><div id="devAIToolbar"><select id="devAIMode" aria-label="AI mode"><option value="auto">Auto</option><option value="chat">Normal chat</option><option value="edit">Edit game</option></select><div id="devAIStatus">Ready</div></div><div id="devAIChat"></div><div id="devAIComposer"><textarea id="devAIInput" maxlength="12000" placeholder="Talk to me or tell me what you want changed…"></textarea><button id="devAISend" type="button">Send</button></div></main>
</div></div>`;
    document.body.appendChild(panel);

    chatsEl = panel.querySelector("#devAIChatList");
    messagesEl = panel.querySelector("#devAIChat");
    inputEl = panel.querySelector("#devAIInput");
    statusEl = panel.querySelector("#devAIStatus");
    modeEl = panel.querySelector("#devAIMode");
    searchEl = panel.querySelector("#devAISearchInput");

    panel.querySelector("#devAIClose").addEventListener("click", closePanel);
    panel.addEventListener("click", event => { if (event.target === panel) closePanel(); });
    panel.querySelector("#devAINew").addEventListener("click", () => createChat());
    panel.querySelector("#devAISend").addEventListener("click", sendMessage);
    panel.querySelector("#devAISearch").addEventListener("click", () => { searchEl.style.display = searchEl.style.display === "none" ? "block" : "none"; if (searchEl.style.display === "block") searchEl.focus(); else searchEl.value = ""; renderChats(); });
    searchEl.addEventListener("input", renderChats);

    const stopGameKeyboard = event => event.stopPropagation();
    inputEl.addEventListener("keydown", stopGameKeyboard);
    inputEl.addEventListener("keyup", stopGameKeyboard);
    inputEl.addEventListener("keypress", stopGameKeyboard);
    inputEl.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); }
    });
}

function renderAll() { renderChats(); renderMessages(); }

async function openPanel() {
    createUI();
    const token = await getDeveloperToken();
    if (!token) return alert("Developer access denied.");
    panel.style.display = "flex";
    document.exitPointerLock?.();
    renderAll();
    inputEl.focus();
}

function closePanel() { if (panel) panel.style.display = "none"; }

async function init() {
    createUI();
    const firebase = await waitForFirebase();
    const sync = user => {
        const allowed = String(user?.email || "").toLowerCase() === DEV_EMAIL;
        const button = document.getElementById("devAIButton");
        if (button) button.style.display = allowed ? "block" : "none";
        if (!allowed) closePanel();
    };
    sync(firebase?.auth?.()?.currentUser || null);
    firebase?.auth?.()?.onAuthStateChanged?.(sync);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
