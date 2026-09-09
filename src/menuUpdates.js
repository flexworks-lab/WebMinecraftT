const updates = document.getElementById("menuUpdates");
const menu = document.getElementById("mainMenu");

function syncMenuUpdates() {
    if (!updates || !menu) return;
    const menuVisible = getComputedStyle(menu).display !== "none";
    updates.style.display = menuVisible ? "block" : "none";
}

syncMenuUpdates();

if (menu && updates) {
    const observer = new MutationObserver(syncMenuUpdates);
    observer.observe(menu, { attributes: true, attributeFilter: ["style", "class"] });
}

window.addEventListener("pageshow", syncMenuUpdates);
