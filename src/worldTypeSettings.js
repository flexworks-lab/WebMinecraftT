const WORLD_TYPE_PREFIX = "webminecraft-world-type-";

function seedValue() {
    const value = Number(document.getElementById("cwSeed")?.textContent);
    return Number.isFinite(value) ? (Math.floor(Math.abs(value)) >>> 0) : null;
}

function saveSelectedWorldType() {
    const seed = seedValue();
    const select = document.getElementById("cwWorldType");
    if (seed === null || !select) return;
    const type = String(select.value || "Default").trim().toLowerCase();
    try {
        localStorage.setItem(`${WORLD_TYPE_PREFIX}${seed}`, type === "flat" ? "flat" : "default");
    } catch {}
}

// Capture the Create World click before the existing worlds system starts opening the world.
document.addEventListener("click", event => {
    if (!event.target.closest("#createWorldSettingsCreate")) return;
    saveSelectedWorldType();
}, true);

// Safety shim for the chunk-unload variable typo in the current terrain module.
// It derives the player's current chunk Z dynamically, so the existing unload logic
// continues to use the correct value without touching any other gameplay systems.
if (!Object.prototype.hasOwnProperty.call(globalThis, "playerChunkChunkZ")) {
    try {
        Object.defineProperty(globalThis, "playerChunkChunkZ", {
            configurable: true,
            enumerable: false,
            get() {
                const camera = globalThis.__webminecraftCamera;
                const z = Number(camera?.position?.z);
                return Number.isFinite(z) ? Math.floor(z / 19) : 0;
            }
        });
    } catch {}
}
