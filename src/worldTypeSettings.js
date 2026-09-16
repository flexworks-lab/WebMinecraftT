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
