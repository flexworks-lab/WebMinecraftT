const DEV_EMAIL = "worthmarcus19@gmail.com";

let installed = false;

function currentUser() {
    try { return window.firebase?.auth?.()?.currentUser || null; } catch { return null; }
}

function isDeveloper() {
    return String(currentUser()?.email || "").toLowerCase() === DEV_EMAIL.toLowerCase();
}

function getDb() {
    try { return window.firebase?.firestore?.() || null; } catch { return null; }
}

function escapeAdminHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function addAdminStyles() {
    if (document.getElementById("adminManagementStyles")) return;
    const style = document.createElement("style");
    style.id = "adminManagementStyles";
    style.textContent = `
#adminManagementSection{margin-bottom:12px}.adminManageRow{display:flex;gap:7px;margin:8px 0}.adminManageInput{flex:1;min-width:0;background:#222;color:#fff;border:1px solid #555;padding:8px;font-size:11px}.adminManageList{display:flex;flex-direction:column;gap:5px;max-height:180px;overflow:auto}.adminManageItem{display:flex;align-items:center;gap:7px;background:#222;border:1px solid #444;padding:7px;font-size:10px}.adminManageEmail{flex:1;word-break:break-all}.adminManageToggle{border:1px solid #111;background:#63433f;color:#fff;padding:4px 7px;font-size:9px;cursor:pointer}.adminManageToggle.on{background:#526f3c}
`;
    document.head.appendChild(style);
}

async function refreshAdminList() {
    const list = document.getElementById("adminManageList");
    if (!list || !isDeveloper()) return;
    const db = getDb();
    if (!db) return;
    try {
        const snapshot = await db.collection("adminUsers").get();
        list.innerHTML = "";
        if (snapshot.empty) {
            list.innerHTML = '<div class="devHint">No admins added yet.</div>';
            return;
        }
        snapshot.docs.forEach(doc => {
            const data = doc.data() || {};
            if (String(doc.id).toLowerCase() === DEV_EMAIL.toLowerCase()) return;
            const email = String(data.email || doc.id);
            const enabled = data.enabled === true;
            const row = document.createElement("div");
            row.className = "adminManageItem";
            row.innerHTML = `<span class="adminManageEmail">${escapeAdminHtml(email)}</span><button class="adminManageToggle ${enabled ? "on" : ""}" type="button">${enabled ? "Turn Off" : "Turn On"}</button>`;
            row.querySelector("button").addEventListener("click", async () => {
                try {
                    await db.collection("adminUsers").doc(doc.id).set({ email: email.toLowerCase(), enabled: !enabled, updatedAt: new Date() }, { merge: true });
                    refreshAdminList();
                } catch (error) { alert(error?.message || "Could not change admin status."); }
            });
            list.appendChild(row);
        });
    } catch (error) {
        list.innerHTML = `<div class="devHint">Could not load admins: ${escapeAdminHtml(error?.message || "Unknown error")}</div>`;
    }
}

function installAdminManagement() {
    if (installed || !isDeveloper()) return;
    const body = document.getElementById("devControlsBody");
    if (!body) return;
    addAdminStyles();
    const section = document.createElement("section");
    section.className = "devSection";
    section.id = "adminManagementSection";
    section.innerHTML = `
        <h3>Admin Accounts</h3>
        <p class="devHint">Give an account Admin Controls. Admins can view live multiplayer servers, kick players, and moderate Discussions, but cannot shut down or delete servers.</p>
        <div class="adminManageRow"><input id="adminManageEmail" class="adminManageInput" type="email" maxlength="160" placeholder="Player account email" autocomplete="off"><button id="adminManageAdd" class="devButton" type="button">Make Admin</button></div>
        <div id="adminManageStatus" class="devHint"></div>
        <div id="adminManageList" class="adminManageList"><div class="devHint">Loading admins...</div></div>`;
    body.insertBefore(section, body.firstElementChild);
    installed = true;
    const input = section.querySelector("#adminManageEmail");
    section.querySelector("#adminManageAdd").addEventListener("click", async () => {
        const email = input.value.trim().toLowerCase();
        const status = section.querySelector("#adminManageStatus");
        if (!email || !email.includes("@")) { status.textContent = "Enter a valid account email."; return; }
        if (email === DEV_EMAIL.toLowerCase()) { status.textContent = "The developer account is already the developer."; return; }
        try {
            const db = getDb();
            await db.collection("adminUsers").doc(email).set({ email, enabled: true, createdAt: new Date(), updatedAt: new Date() }, { merge: true });
            input.value = "";
            status.textContent = `${email} is now an admin.`;
            refreshAdminList();
        } catch (error) { status.textContent = error?.message || "Could not add admin."; }
    });
    refreshAdminList();
}

function watchAdminManagement() {
    installAdminManagement();
    const observer = new MutationObserver(() => installAdminManagement());
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => {
        if (!isDeveloper()) {
            document.getElementById("adminManagementSection")?.remove();
            installed = false;
        } else installAdminManagement();
    }, 1000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchAdminManagement, { once: true });
else watchAdminManagement();
