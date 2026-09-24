import { applyDeveloperChange } from "./devAiGithub.js";

const DEV_EMAIL = "worthmarcus19@gmail.com";
const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY || "AIzaSyByaINh47IFMYmnc9Ty49aHTfTBe2u-jyU";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_DEV_MODEL || "gpt-5.6-luna";
const MAX_BODY = 256 * 1024;

function json(response, status, payload) {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "no-store" });
    response.end(JSON.stringify(payload));
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => {
            body += chunk.toString("utf8");
            if (body.length > MAX_BODY) { reject(new Error("Request body is too large.")); request.destroy(); }
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

async function verifyDeveloperToken(token) {
    if (!token) return false;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken: token }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    const user = data?.users?.[0];
    return String(user?.email || "").toLowerCase() === DEV_EMAIL && user?.disabled !== true;
}

function normalizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter(message => message && (message.role === "user" || message.role === "assistant"))
        .slice(-24)
        .map(message => ({ role: message.role, content: String(message.content || "").slice(0, 12000) }));
}

function lastUserMessage(messages) {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i]?.role === "user") return messages[i].content;
    return "";
}

function extractOutputText(data) {
    if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
    const parts = [];
    for (const item of Array.isArray(data?.output) ? data.output : []) {
        for (const content of Array.isArray(item?.content) ? item.content : []) {
            if (typeof content?.text === "string" && content.text.trim()) parts.push(content.text.trim());
        }
    }
    return parts.join("\n\n").trim();
}

async function askOpenAI({ instructions, input, maxOutputTokens = 2200 }) {
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ model: OPENAI_MODEL, instructions, input, max_output_tokens: maxOutputTokens }),
    });
    const data = await response.json();
    if (!response.ok) {
        console.error("OpenAI developer AI error:", data);
        throw new Error(data?.error?.message || "The AI service returned an error.");
    }
    const reply = extractOutputText(data);
    if (!reply) throw new Error("The AI returned a response without any text.");
    return reply;
}

function clearlyRequestsCodeChange(text) {
    const value = String(text || "").trim().toLowerCase();
    if (!value) return false;
    const patterns = [
        /\b(add|remove|delete|change|edit|fix|update|create|make|implement|rewrite|replace|modify|improve|optimize|rework|redo|patch)\b/,
        /\b(code|script|file|github|commit|pull request|pr|bug|build|deploy|website|game)\b.*\b(change|fix|update|add|remove|make|create|implement|edit|modify)\b/,
        /^\s*\/\b(fix|edit|add|remove|build|optimize)\b/,
    ];
    const isQuestion = /^(what|why|how|when|where|who|can|could|would|is|are|do|does|did|should)\b/.test(value);
    if (isQuestion && !/\bfix\b|\bchange\b|\badd\b|\bremove\b|\bedit\b|\bmake\b/.test(value)) return false;
    return patterns.some(pattern => pattern.test(value));
}

const PROJECT_KNOWLEDGE = [
    "WebMinecraftT is a browser Minecraft-style game for desktop and mobile.",
    "Frontend uses Vite, Three.js and JavaScript ES modules.",
    "Firebase is used for authentication and some persistent/social systems.",
    "A Node.js server handles multiplayer and the private developer AI endpoint.",
    "The owner prefers direct practical changes, simple wording, and keeping existing behavior unless a request explicitly changes it.",
    "Important project areas include world generation, chunks/rendering, controls, player movement, block interaction, inventory, water, clouds, multiplayer, chat, world saving, mobile UI, and settings.",
    "Developer AI changes are sent to GitHub through a branch and pull request rather than silently changing main.",
    "Never invent file names, systems, test results, commits, deployment status, or features that were not verified.",
    "Understand shorthand, spelling mistakes, incomplete sentences, and references such as 'make it darker', 'like before', 'fix that', and 'don't change anything else'."
].join("\n");

export async function handleDevAIRequest(request, response) {
    if (request.url !== "/api/dev-ai") return false;
    if (request.method === "OPTIONS") {
        response.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "Content-Type, Authorization" });
        response.end();
        return true;
    }
    if (request.method !== "POST") { json(response, 405, { error: "Method not allowed." }); return true; }

    try {
        const auth = String(request.headers.authorization || "");
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!(await verifyDeveloperToken(token))) { json(response, 403, { error: "Developer access denied." }); return true; }
        if (!OPENAI_API_KEY) { json(response, 503, { error: "Add OPENAI_API_KEY to the server environment first." }); return true; }

        const body = JSON.parse(await readBody(request) || "{}");
        const messages = normalizeMessages(body.messages);
        if (!messages.length) { json(response, 400, { error: "No message was provided." }); return true; }

        const userRequest = String(body.userRequest || lastUserMessage(messages) || "").trim().slice(0, 12000);
        if (!userRequest) { json(response, 400, { error: "No user request was provided." }); return true; }
        const mode = ["auto", "chat", "edit"].includes(body.mode) ? body.mode : "auto";
        const wantsChange = mode === "edit" || (mode === "auto" && clearlyRequestsCodeChange(userRequest));

        if (!wantsChange) {
            const instructions = [
                "You are the private developer AI for WebMinecraftT, but right now you are in NORMAL CONVERSATION mode.",
                PROJECT_KNOWLEDGE,
                "Talk naturally and casually like a helpful assistant. You can discuss the game, coding, ideas, names, explanations, planning, or unrelated everyday topics.",
                "Do not turn ordinary conversation into a code change. Do not create a GitHub branch or pull request in normal conversation mode.",
                "Only discuss a code change when the user explicitly asks for one; the UI has a separate Edit game mode for direct edits.",
                "Interpret typos, shorthand, slang, and incomplete sentences naturally.",
                "Use recent conversation context when the owner says 'that', 'it', 'again', 'same as before', etc.",
                "When you are uncertain, state the assumption briefly instead of pretending certainty.",
                "Do not claim that code was changed or tested.",
                "Be friendly, natural, and concise without sounding robotic."
            ].join("\n");
            const reply = await askOpenAI({ instructions, input: messages, maxOutputTokens: 1800 });
            json(response, 200, { reply, changed: false });
            return true;
        }

        try {
            const result = await applyDeveloperChange({ instruction: userRequest, messages, model: OPENAI_MODEL });
            if (result.configured && result.changed) {
                const reply = [
                    "Done — I prepared the requested code change.",
                    `\n${result.summary}`,
                    `\nChanged files:\n${result.files.map(path => `- ${path}`).join("\n")}`,
                    result.pullRequest ? `\nPull request: ${result.pullRequest}` : "",
                    `\n${result.note}`,
                ].join("\n");
                json(response, 200, { reply, changed: true, files: result.files, branch: result.branch, commit: result.commit, pullRequest: result.pullRequest });
                return true;
            }
            if (!result.configured) {
                json(response, 503, { error: result.message });
                return true;
            }
        } catch (error) {
            console.error("Developer AI GitHub change failed:", error);
            json(response, 502, { error: error?.message || "The developer AI could not apply the requested change." });
            return true;
        }

        json(response, 502, { error: "The developer AI did not produce a code change." });
        return true;
    } catch (error) {
        console.error("Developer AI request failed:", error);
        json(response, 500, { error: error?.message || "Developer AI request failed." });
        return true;
    }
}
