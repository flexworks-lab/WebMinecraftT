import { deleteCloudWorld, retryCloudWorldDeletes } from "./cloudWorlds.js";

// Keep the fast-delete API name used by the rest of the game, but route it
// through the Realtime Database world store instead of Firestore.
async function fastDeleteCloudWorld(seed) {
    return deleteCloudWorld(seed);
}

window.webMinecraftFastDeleteCloudWorld = fastDeleteCloudWorld;
window.webMinecraftDeleteCloudWorld = fastDeleteCloudWorld;
window.webMinecraftRetryCloudCleanup = retryCloudWorldDeletes;

setInterval(() => {
    if (navigator.onLine !== false) retryCloudWorldDeletes().catch(() => {});
}, 10000);

window.addEventListener("online", () => retryCloudWorldDeletes().catch(() => {}));
