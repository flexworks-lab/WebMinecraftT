const DEV_EMAIL = "worthmarcus19@gmail.com";
const AI_API = "https://webminecraft-server.onrender.com/api/dev-ai";

let panel = null;
let messagesEl = null;
let inputEl = null;
let statusEl = null;
let history = [];

function waitForFirebase(timeout = 15000) {
    return new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase?.auth) return resolve(firebase);
            } catch {}
            if (Date.now() - started >= timeout) return resolve(null);
            setTimeout(check, 100);
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

function addStyles() {
    if (document.getElementById("devAIStyles")) return;
    const style = document.createElement("style");
    style.id = "devAIStyles";
    style.textContent = `
#devAIButton{position:fixed;right:28px;bottom:138px;z-index:98;display:none;min-height:48px;padding:0 16px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:linear-gradient(#4e6e8b,#3d566d);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#devAIButton:hover{filter:brightness(1.1)}
#devAIModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.82);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:510;padding:20px;box-sizing:border-box}
#devAIPanel{width:min(900px,96vw);height:min(760px,92vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#181818);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:9px 9px 0 rgba(0,0,0,.5);color:#fff;font-family:Arial,sans-serif;box-sizing:border-box}
#devAIHeader{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:2px solid #0d0d0d;background:#27394a}
#devAITitle{margin:0;font-family:MinecraftFont,monospace;font-size:22px;text-shadow:2px 2px 0 #000}
#devAIClose{margin-left:auto;width:42px;height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#4c4c4c;color:#fff;font-size:20px;cursor:pointer}
#devAIBody{flex:1;min-height:0;display:flex;flex-direction:column;padding:14px;gap:10px}
#devAIChat{flex:1;min-height:0;overflow:auto;padding:8px;background:#111;border:1px solid #3b3b3b;display:flex;flex-direction:column;gap:9px}
.devAIMessage{max-width:85%;padding:10px 12px;border:1px solid #3b3b3b;background:#202020;font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
.devAIMessage.user{align-self:flex-end;background:#304357;border-color:#4d6680}
.devAIMessage.assistant{align-self:flex-start;background:#222}
.devAIName{font-size:10px;color:#999;margin-bottom:4px;font-family:MinecraftFont,monospace}
#devAIComposer{display:flex;gap:8px}
#devAIInput{flex:1;min-height:76px;resize:none;box-sizing:border-box;padding:11px;background:#111;border:2px solid #111;border-top-color:#555;border-left-color:#555;color:#fff;font:13px Arial,sans-serif;outline:none}
#devAISend{width:120px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#657f4b,#4f683b);color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
#devAISend:disabled{opacity:.5;cursor:default}
#devAIStatus{min-height:16px;color:#999;font-size:11px}
@media(max-width:650px){#devAIButton{right:14px;bottom:138px}.devAIMessage{max-width:94%}#devAIComposer{flex-direction:column}#devAISend{width:100%;min-height:42px}}
`;
    document.head.appendChild(style);
}

function createUI() {
    if (panel) return;
    addStyles();

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
    <header id="devAIHeader"><h2 id="devAITitle">Developer AI</h2><button id="devAIClose" type="button" aria-label="Close">×</button></header>
    <div id="devAIBody">
        <div id="devAIChat"></div>
        <div id="devAIStatus">Tell the developer AI what you want changed in WebMinecraft.</div>
        <div id="devAIComposer"><textarea id="devAIInput" maxlength="8000" placeholder="Example: Make TNT destroy nearby blocks in one frame without freezing players."></textarea><button id="devAISend" type="button">Send</button></div>
    </div>
</div>`;
    document.body.appendChild(panel);

    messagesEl = panel.querySelector("#devAIChat");
    inputEl = panel.querySelector("#devAIInput");
    statusEl = panel.querySelector("#devAIStatus");

    panel.querySelector("#devAIClose").addEventListener("click", closePanel);
    panel.addEventListener("click", event => { if (event.target === panel) closePanel(); });
    panel.querySelector("#devAISend").addEventListener("click", sendMessage);
    inputEl.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}

function renderMessage(role, text) {
    const row = document.createElement("div");
    row.className = `devAIMessage ${role}`;
    const name = document.createElement("div");
    name.className = "devAIName";
    name.textContent = role === "user" ? "YOU" : "DEV AI";
    const body = document.createElement("div");
    body.textContent = text;
    row.append(name, body);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStatus(text, error = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = error ? "#e38a7b" : "#999";
}

async function sendMessage() {
    const text = inputEl?.value?.trim();
    if (!text) return;
    const token = await getDeveloperToken();
    if (!token) return setStatus("Developer access denied.", true);

    inputEl.value = "";
    renderMessage("user", text);
    history.push({ role: "user", content: text });

    const sendButton = panel.querySelector("#devAISend");
    sendButton.disabled = true;
    setStatus("Thinking...");

    try {
        const response = await fetch(AI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                messages: history,
                game: "WebMinecraftT",
                instruction: "You are the developer assistant for WebMinecraftT. Help the owner plan and implement requested game changes. Be concise, inspect the existing project context supplied by the server, and clearly say what files/code should change. Do not claim a change was committed unless the server actually performed it."
            }),
            cache: "no-store"
        });

        let data = null;
        try { data = await response.json(); } catch {}
        if (!response.ok) throw new Error(data?.error || `AI server returned ${response.status}.`);

        const answer = String(data?.reply || data?.message || data?.content || "No response received.");
        history.push({ role: "assistant", content: answer });
        renderMessage("assistant", answer);
        setStatus(data?.changed ? "The developer AI applied the requested change." : "Ready for your next request.");
    } catch (error) {
        console.error("Developer AI failed:", error);
        setStatus(error?.message || "Developer AI could not connect.", true);
        renderMessage("assistant", "I could not reach the developer AI server. Make sure the WebMinecraft server has the /api/dev-ai endpoint configured.");
    } finally {
        sendButton.disabled = false;
        inputEl.focus();
    }
}

async function openPanel() {
    createUI();
    const token = await getDeveloperToken();
    if (!token) return alert("Developer access denied.");
    panel.style.display = "flex";
    document.exitPointerLock?.();
    if (!messagesEl.children.length) {
        renderMessage("assistant", "Tell me what you want to add, remove, fix, or change in WebMinecraft. I can help turn your request into a game-code change.");
    }
    inputEl.focus();
}

function closePanel() {
    if (panel) panel.style.display = "none";
}

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
