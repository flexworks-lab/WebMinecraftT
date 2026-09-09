const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_API = "https://www.googleapis.com";
const WORLD_COLLECTION = "worlds";
const DRIVE_MIME = "application/json";
const DRIVE_WORLD_MARKER = "WebMinecraftT World";

let buttonInjected = false;
let saving = false;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getFirebase() {
    if (!window.firebase?.auth || !window.firebase?.firestore) {
        throw new Error("Account service is not ready yet.");
    }
    return window.firebase;
}

function getCurrentUser() {
    const firebase = getFirebase();
    const user = firebase.auth().currentUser;
    if (!user) throw new Error("Log in first to save a world to Google Drive.");
    return user;
}

function getWorldDetails() {
    const panel = document.getElementById("worldDetailsPanel");
    if (!panel?.classList.contains("open")) throw new Error("Open a world first.");
    const title = panel.querySelector("#worldDetailsTitle")?.textContent?.trim() || "World";
    const seedText = panel.querySelector("#worldDetailsSeed")?.textContent?.trim() || "";
    const seed = Number(seedText);
    if (!Number.isFinite(seed)) throw new Error("This world does not have a valid seed.");
    return { title, seed: Math.floor(Math.abs(seed)) >>> 0 };
}

function setMessage(text, success = false) {
    const message = document.getElementById("worldDetailsMessage");
    if (!message) return;
    message.style.color = success ? "#8fca68" : "#d8a0a0";
    message.textContent = text;
}

function providerIsGoogle(user) {
    return user.providerData?.some(provider => provider.providerId === "google.com");
}

async function getDriveAccessToken(user) {
    if (!providerIsGoogle(user)) {
        throw new Error("Google Drive saving requires a Google Account. Log in with Google for this account first.");
    }

    const firebase = getFirebase();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope(DRIVE_SCOPE);
    provider.setCustomParameters({ prompt: "consent", include_granted_scopes: "true" });

    const result = await user.reauthenticateWithPopup(provider);
    const credential = result?.credential;
    const token = credential?.accessToken;
    if (!token) throw new Error("Google did not return a Drive access token.");
    return token;
}

async function getWorldFromFirestore(user, seed) {
    const firebase = getFirebase();
    const db = firebase.firestore();
    const snapshot = await db.collection("users").doc(user.uid).collection(WORLD_COLLECTION)
        .where("seed", "==", seed)
        .limit(1)
        .get();
    if (snapshot.empty) throw new Error("Could not find this saved world.");
    const doc = snapshot.docs[0];
    return { id: doc.id, ref: doc.ref, data: doc.data() || {} };
}

function serializeTimestamp(value) {
    if (!value) return null;
    if (value.toDate) return value.toDate().toISOString();
    if (value.seconds) return new Date(value.seconds * 1000).toISOString();
    return typeof value === "string" ? value : null;
}

function buildWorldExport(world, title, seed) {
    const data = world.data || {};
    return {
        format: DRIVE_WORLD_MARKER,
        formatVersion: 1,
        name: data.name || title || "World",
        seed,
        createdAt: serializeTimestamp(data.createdAt),
        updatedAt: serializeTimestamp(data.updatedAt),
        blocks: data.blocks && typeof data.blocks === "object" ? data.blocks : {}
    };
}

function buildNewWorldExport(name, seed) {
    const now = new Date().toISOString();
    return {
        format: DRIVE_WORLD_MARKER,
        formatVersion: 1,
        name: String(name || "New World"),
        seed: Math.floor(Math.abs(Number(seed))) >>> 0,
        createdAt: now,
        updatedAt: now,
        blocks: {}
    };
}

function makeMultipartBody(metadata, blob) {
    const boundary = `webminecraft_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
    const body = new Blob([
        `--${boundary}\r\n`,
        "Content-Type: application/json; charset=UTF-8\r\n\r\n",
        JSON.stringify(metadata),
        `\r\n--${boundary}\r\n`,
        `Content-Type: ${DRIVE_MIME}\r\n\r\n`,
        blob,
        `\r\n--${boundary}--`
    ]);
    return { boundary, body };
}

async function driveRequest(url, options) {
    const response = await fetch(url, options);
    if (response.ok) return response.json();
    let detail = "";
    try {
        const payload = await response.json();
        detail = payload?.error?.message || "";
    } catch {}
    throw new Error(detail || `Google Drive request failed (${response.status}).`);
}

async function uploadWorldToDrive(accessToken, exportData, existingFileId) {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: DRIVE_MIME });
    const safeName = String(exportData.name || "World").replace(/[\\/:*?"<>|]/g, "_").trim() || "World";
    const metadata = {
        name: `${safeName}.webminecraftworld`,
        mimeType: DRIVE_MIME,
        description: "WebMinecraftT world backup"
    };
    const { boundary, body } = makeMultipartBody(metadata, blob);

    if (existingFileId) {
        try {
            return await driveRequest(
                `${DRIVE_API}/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id,name,webViewLink`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": `multipart/related; boundary=${boundary}`
                    },
                    body
                }
            );
        } catch (error) {
            if (!String(error.message).includes("404")) throw error;
        }
    }

    return driveRequest(
        `${DRIVE_API}/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": `multipart/related; boundary=${boundary}`
            },
            body
        }
    );
}

async function saveCurrentWorldToDrive() {
    if (saving) return;
    saving = true;
    const button = document.getElementById("worldDetailsDrive");
    if (button) {
        button.disabled = true;
        button.textContent = "Saving to Drive…";
    }
    setMessage("");

    try {
        const user = getCurrentUser();
        const { title, seed } = getWorldDetails();
        const world = await getWorldFromFirestore(user, seed);
        const exportData = buildWorldExport(world, title, seed);
        const accessToken = await getDriveAccessToken(user);
        const result = await uploadWorldToDrive(accessToken, exportData, world.data.driveFileId);

        await world.ref.set({
            driveFileId: result.id,
            driveFileUrl: result.webViewLink || `https://drive.google.com/open?id=${encodeURIComponent(result.id)}`,
            driveSavedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        setMessage("World saved to Google Drive!", true);
    } catch (error) {
        console.error("Could not save world to Google Drive:", error);
        setMessage(error?.message || "Could not save this world to Google Drive.");
    } finally {
        saving = false;
        if (button) {
            button.disabled = false;
            button.textContent = "Save to Google Drive";
        }
    }
}

export async function saveNewWorldToDrive(name, seed) {
    const user = getCurrentUser();
    const accessToken = await getDriveAccessToken(user);
    const exportData = buildNewWorldExport(name, seed);
    const result = await uploadWorldToDrive(accessToken, exportData, null);
    return { ...exportData, id: result.id, webViewLink: result.webViewLink || null };
}

export async function loadWorldsFromDrive() {
    const user = getCurrentUser();
    const accessToken = await getDriveAccessToken(user);
    const query = `name contains '.webminecraftworld' and trashed = false`;
    const list = await driveRequest(
        `${DRIVE_API}/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name,modifiedTime)&pageSize=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const worlds = [];
    for (const file of list.files || []) {
        try {
            const response = await fetch(
                `${DRIVE_API}/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!response.ok) continue;
            const data = await response.json();
            if (data?.format !== DRIVE_WORLD_MARKER || !Number.isFinite(Number(data.seed))) continue;
            worlds.push({
                id: `drive-${file.id}`,
                driveFileId: file.id,
                name: data.name || file.name.replace(/\.webminecraftworld$/i, "") || "World",
                seed: Math.floor(Math.abs(Number(data.seed))) >>> 0,
                createdAt: data.createdAt || file.modifiedTime || new Date().toISOString(),
                updatedAt: data.updatedAt || file.modifiedTime || data.createdAt || new Date().toISOString(),
                blocks: data.blocks && typeof data.blocks === "object" ? data.blocks : {}
            });
        } catch (error) {
            console.warn("Could not read Drive world:", file.name, error);
        }
    }
    return worlds;
}

function injectButton() {
    const panel = document.getElementById("worldDetailsPanel");
    const deleteButton = document.getElementById("worldDetailsDelete");
    if (!panel || !deleteButton || document.getElementById("worldDetailsDrive")) return;

    const button = document.createElement("button");
    button.id = "worldDetailsDrive";
    button.className = "savedWorldButton worldDetailAction";
    button.type = "button";
    button.textContent = "Save to Google Drive";
    button.title = "Save a backup of this world to your Google Drive";
    button.addEventListener("click", saveCurrentWorldToDrive);
    deleteButton.before(button);
    buttonInjected = true;
}

function init() {
    injectButton();
    const observer = new MutationObserver(() => injectButton());
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();

window.webMinecraftDrive = { saveCurrentWorldToDrive, saveNewWorldToDrive, loadWorldsFromDrive };
