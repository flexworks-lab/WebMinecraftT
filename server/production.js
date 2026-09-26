// Production launcher for the WebMinecraft multiplayer server.
// These defaults raise capacity while keeping every value overridable by Railway
// or another host through environment variables.
const defaults = {
    MAX_PLAYERS: "32",
    MAX_ROOMS: "2000",
    NODE_OPTIONS: "--max-old-space-size=1536",
    UV_THREADPOOL_SIZE: "16",
};

for (const [key, value] of Object.entries(defaults)) {
    if (!process.env[key]) process.env[key] = value;
}

// Keep explicit NODE_OPTIONS supplied by the host; otherwise use the production
// memory ceiling above. Node reads NODE_OPTIONS before the imported server starts.
await import("./start.js");
