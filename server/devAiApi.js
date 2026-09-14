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
    return messages.filter(message => message && (message.role === "user" || message.role === "assistant"))
        .slice(-20).map(message => ({ role: message.role, content: String(message.content || "").slice(0, 8000) }));
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

        const instructions = [
            "You are the private developer AI for WebMinecraftT, a browser Minecraft-style game for PC and mobile.",
            "The owner wants practical implementation help for the actual game project.",
            "The project uses Vite, Three.js, JavaScript modules, Firebase, and an optional Node multiplayer server.",
            "When the owner asks for a change, explain the implementation briefly and provide concrete file/code guidance.",
            "Do not claim that code was changed, committed, deployed, or tested unless it actually was.",
            "If a request is ambiguous, make the smallest reasonable assumption and say what you assumed.",
            "Keep answers concise and focused on the game."
        ].join("\n");

        const aiResponse = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
            body: JSON.stringify({ model: OPENAI_MODEL, instructions, input: messages, max_output_tokens: 1800 }),
        });
        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
            console.error("OpenAI developer AI error:", aiData);
            json(response, 502, { error: "The AI service returned an error." });
            return true;
        }

        const reply = extractOutputText(aiData);
        if (!reply) {
            console.error("OpenAI developer AI returned no text:", JSON.stringify(aiData));
            json(response, 502, { error: "The AI returned a response without any text." });
            return true;
        }
        json(response, 200, { reply });
        return true;
    } catch (error) {
        console.error("Developer AI request failed:", error);
        json(response, 500, { error: "Developer AI request failed." });
        return true;
    }
}
