import { spawn } from "node:child_process";

const MAX_DELAY_MS = 15000;
const MAX_OLD_SPACE_MB = Math.max(512, Number(process.env.NODE_MAX_OLD_SPACE_MB) || 1536);
let restartDelay = 1000;
let stopping = false;
let child = null;

function startServer() {
    if (stopping) return;

    console.log(`[watchdog] Starting multiplayer server (restart delay: ${restartDelay}ms)`);
    child = spawn(process.execPath, [`--max-old-space-size=${MAX_OLD_SPACE_MB}`, "production.js"], {
        cwd: new URL(".", import.meta.url),
        stdio: "inherit",
        env: process.env
    });

    child.on("error", error => {
        console.error("[watchdog] Could not start server:", error);
    });

    child.on("exit", (code, signal) => {
        child = null;
        if (stopping) return;

        console.error(`[watchdog] Server stopped (code=${code ?? "null"}, signal=${signal ?? "none"}). Restarting...`);
        setTimeout(startServer, restartDelay);
        restartDelay = Math.min(restartDelay * 2, MAX_DELAY_MS);
    });

    // A healthy run resets the backoff after five minutes.
    setTimeout(() => {
        if (child && !stopping) restartDelay = 1000;
    }, 5 * 60 * 1000);
}

function shutdown(signal) {
    if (stopping) return;
    stopping = true;
    console.log(`[watchdog] Received ${signal}; shutting down cleanly.`);
    if (child) child.kill(signal);
    else process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
