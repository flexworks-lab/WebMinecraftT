import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, "server.js");

// Keep the server's live block-change message schema consistent with the
// stored worldChanges schema. Older server.js versions accidentally reused
// `type` for both the message name and numeric block ID.
try {
    const source = fs.readFileSync(serverPath, "utf8");
    const fixed = source.replace(
        'broadcast(room, { type: "block_change", x, y, z, type });',
        'broadcast(room, { type: "block_change", x, y, z, blockType: type });'
    ).replace(
        'send(ws, { type: "block_change_ack", x, y, z, type });',
        'send(ws, { type: "block_change_ack", x, y, z, blockType: type });'
    );
    if (fixed !== source) fs.writeFileSync(serverPath, fixed, "utf8");
} catch (error) {
    console.error("Could not prepare multiplayer world sync patch:", error);
}

await import(pathToFileURL(serverPath).href + `?worldSync=${Date.now()}`);
