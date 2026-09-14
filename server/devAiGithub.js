const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "flexworks-lab/WebMinecraftT";
const GITHUB_BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || "main";
const GITHUB_API = "https://api.github.com";

const BLOCKED = [/^\.env(?:\.|$)/i, /(^|\/)\.git(\/|$)/i, /(^|\/)(?:secrets?|credentials?)(?:\/|\.|$)/i, /service-account.*\.json$/i, /firebase-admin.*\.json$/i, /(^|\/)node_modules(\/|$)/i];
const ALLOWED_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".css", ".html", ".md", ".txt", ".yml", ".yaml"]);

function isSafePath(filePath) {
    if (typeof filePath !== "string" || !filePath || filePath.length > 220) return false;
    const normalized = filePath.replaceAll("\\", "/");
    if (normalized.startsWith("/") || normalized.includes("../") || normalized === "..") return false;
    if (BLOCKED.some(pattern => pattern.test(normalized))) return false;
    const dot = normalized.lastIndexOf(".");
    return dot >= 0 && ALLOWED_EXTENSIONS.has(normalized.slice(dot).toLowerCase());
}

async function githubRequest(path, options = {}) {
    if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not configured on the server.");
    const response = await fetch(`${GITHUB_API}${path}`, { ...options, headers: { accept: "application/vnd.github+json", authorization: `Bearer ${GITHUB_TOKEN}`, "x-github-api-version": "2022-11-28", "content-type": "application/json", ...(options.headers || {}) } });
    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!response.ok) {
        const detail = typeof data === "object" ? data?.message : String(data || "");
        throw new Error(`GitHub API ${response.status}: ${detail}`);
    }
    return data;
}

function repoParts() {
    const match = /^([^/]+)\/([^/]+)$/.exec(GITHUB_REPO.trim());
    if (!match) throw new Error("GITHUB_REPO must look like owner/repository.");
    return { owner: match[1], repo: match[2] };
}

async function getBaseSha(owner, repo) {
    const data = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(GITHUB_BASE_BRANCH)}`);
    return data.object.sha;
}

async function getTree(owner, repo, sha) {
    const data = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${sha}?recursive=1`);
    return (data.tree || []).filter(item => item.type === "blob" && isSafePath(item.path)).map(item => item.path).slice(0, 1200);
}

async function getFile(owner, repo, path, ref) {
    const data = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`);
    if (!data || data.type !== "file") throw new Error(`GitHub path is not a file: ${path}`);
    const content = Buffer.from(String(data.content || "").replace(/\s/g, ""), "base64").toString("utf8");
    return { path, content, sha: data.sha };
}

function trimForAI(text, max = 30000) {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}\n\n/* [truncated for developer AI] */`;
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

async function askOpenAI(instructions, input, model) {
    const key = process.env.OPENAI_API_KEY || "";
    if (!key) throw new Error("OPENAI_API_KEY is not configured on the server.");
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ model, instructions, input, max_output_tokens: 12000 }) });
    const data = await response.json();
    if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${data?.error?.message || "request failed"}`);
    const text = extractOutputText(data);
    if (!text) {
        const outputTypes = Array.isArray(data?.output) ? data.output.map(item => item?.type || "unknown").join(", ") : "none";
        throw new Error(`OpenAI returned no text for the code change (output types: ${outputTypes}).`);
    }
    return text;
}

function parseJson(text) {
    const cleaned = String(text || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    try { return JSON.parse(cleaned); } catch {}
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
    throw new Error("Developer AI did not return valid JSON change data.");
}

export async function applyDeveloperChange({ instruction, messages, model }) {
    if (!GITHUB_TOKEN) return { configured: false, message: "Add GITHUB_TOKEN to the server environment to let Dev AI edit GitHub." };
    const { owner, repo } = repoParts();
    const baseSha = await getBaseSha(owner, repo);
    const tree = await getTree(owner, repo, baseSha);
    const recent = Array.isArray(messages) ? messages.slice(-8) : [];

    const selectionText = await askOpenAI(
        ["You are selecting files for an AI code change in a browser Minecraft-style game.", "Return JSON only: {\"files\":[\"path\",...],\"summary\":\"short summary\"}.", "Choose only files from the supplied repository tree. Select the smallest set that can implement the request.", "Never select .env, credentials, secrets, node_modules, or generated build output.", "Select at most 8 files. If a new file is needed, include its intended path even if it is not in the tree."].join("\n"),
        `USER REQUEST:\n${instruction}\n\nRECENT CHAT:\n${JSON.stringify(recent)}\n\nREPOSITORY FILE TREE:\n${tree.join("\n")}`,
        model
    );
    const selection = parseJson(selectionText);
    const selectedPaths = [...new Set(Array.isArray(selection?.files) ? selection.files.filter(isSafePath) : [])].slice(0, 8);
    if (!selectedPaths.length) throw new Error("Dev AI could not identify safe project files to change.");

    const files = [];
    for (const path of selectedPaths) {
        if (tree.includes(path)) files.push(await getFile(owner, repo, path, GITHUB_BASE_BRANCH));
        else files.push({ path, content: "", sha: null, newFile: true });
    }

    const fileContext = files.map(file => `===== FILE: ${file.path} =====\n${trimForAI(file.content)}`).join("\n\n");
    const changeText = await askOpenAI(
        [
            "You are the coding agent for WebMinecraftT.",
            "Make the requested change using the actual files supplied below.",
            "Return ONLY one JSON object. No Markdown, no code fences, no explanation before or after it.",
            "Exact shape: {\"summary\":\"short summary\",\"files\":[{\"path\":\"existing path\",\"action\":\"update\",\"content\":\"COMPLETE FILE CONTENT\"}]}",
            "The files array MUST contain at least 1 object and no more than 8 objects.",
            "Every object must have path, action, and content.",
            "For existing files use action=update. For new files use action=create.",
            "Content must be the complete replacement file, not a diff, snippet, or shortened version.",
            "Only modify files from the supplied file list.",
            "If one file is enough, return exactly one file object.",
            "Do not add secrets, tokens, passwords, or external credentials.",
            "Keep unrelated code unchanged whenever practical.",
        ].join("\n"),
        `REQUEST:\n${instruction}\n\nCURRENT FILES:\n${fileContext}`,
        model
    );
    const changes = parseJson(changeText);
    const proposed = Array.isArray(changes?.files) ? changes.files : [];
    if (!proposed.length || proposed.length > 8) {
        throw new Error(`Dev AI returned an invalid number of file changes: ${proposed.length}. It must return between 1 and 8 file objects.`);
    }

    const allowed = new Map(files.map(file => [file.path, file]));
    const finalChanges = [];
    for (const change of proposed) {
        if (!isSafePath(change?.path) || !allowed.has(change.path)) throw new Error(`Dev AI tried to change an unapproved path: ${change?.path || "unknown"}`);
        if (change.action !== "update" && change.action !== "create") throw new Error(`Invalid action for ${change.path}.`);
        if (typeof change.content !== "string" || change.content.length > 150000) throw new Error(`Invalid content for ${change.path}.`);
        const existing = allowed.get(change.path);
        if (change.action === "create" && !existing.newFile) throw new Error(`Dev AI tried to create an existing file: ${change.path}`);
        if (change.action === "update" && existing.newFile) throw new Error(`Dev AI tried to update a new file: ${change.path}`);
        finalChanges.push({ ...change, sha: existing.sha });
    }

    const safeBranch = `dev-ai/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${safeBranch}`, sha: baseSha }) });
    const commitShas = [];
    for (const change of finalChanges) {
        const encodedPath = change.path.split("/").map(encodeURIComponent).join("/");
        const body = { message: `Dev AI: ${String(changes.summary || instruction).slice(0, 120)}`, content: Buffer.from(change.content, "utf8").toString("base64"), branch: safeBranch };
        if (change.action === "update") body.sha = change.sha;
        const result = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`, { method: "PUT", body: JSON.stringify(body) });
        commitShas.push(result.commit?.sha || null);
    }

    const prResponse = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, { method: "POST", body: JSON.stringify({ title: `Dev AI: ${String(changes.summary || "Game change").slice(0, 90)}`, head: safeBranch, base: GITHUB_BASE_BRANCH, body: `Created by WebMinecraftT Dev AI.\n\nRequest:\n${instruction}\n\nChanged files:\n${finalChanges.map(file => `- ${file.path}`).join("\n")}` }) });
    return { configured: true, changed: true, summary: String(changes.summary || "Requested game change prepared."), files: finalChanges.map(file => file.path), branch: safeBranch, commit: commitShas.filter(Boolean).at(-1) || null, pullRequest: prResponse?.html_url || null, note: "The change was committed to a Dev AI branch and opened as a pull request. Merge the pull request to deploy it to the main game branch." };
}
