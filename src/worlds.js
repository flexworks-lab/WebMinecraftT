import { firebaseConfig, isFirebaseConfigured } from "./firebaseConfig.js";
import { saveNewWorldToDrive, loadWorldsFromDrive, restoreDriveWorldToFirestore } from "./drive.js";

const FIREBASE_VERSION = "12.18.0";
const WORLDS_COLLECTION = "worlds";
const CACHE_KEY = "webminecraft_saved_worlds";

let db = null;
let auth = null;
let currentUser = null;
let authReadyPromise = null;
let authReadyResolve = null;
let overlay = null;
let worldsList = null;
let detailsPanel = null;
let createPanel = null;
let selectedWorld = null;
let pendingWorldSeed = null;
let initialized = false;
let openWorldCallback = null;
let worldsCache = [];
let worldsCacheUid = null;
let loadRequest = 0;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (src.includes("firebase-app-compat") && window.firebase) return resolve();
            if (src.includes("firebase-auth-compat") && window.firebase?.auth) return resolve();
            if (src.includes("firebase-firestore-compat") && window.firebase?.firestore) return resolve();
            const cleanup = () => { existing.removeEventListener("load", onLoad); existing.removeEventListener("error", onError); };
            const onLoad = () => { cleanup(); resolve(); };
            const onError = () => { cleanup(); reject(new Error(`Could not load ${src}`)); };
            existing.addEventListener("load", onLoad, { once: true });
            existing.addEventListener("error", onError, { once: true });
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(script);
    });
}

async function ensureFirebase() {
    if (!isFirebaseConfigured()) throw new Error("Firebase is not configured.");
    if (!window.firebase) await loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
    const app = window.firebase.apps?.length ? window.firebase.apps[0] : window.firebase.initializeApp(firebaseConfig);
    await Promise.all([
        window.firebase.auth ? Promise.resolve() : loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`),
        window.firebase.firestore ? Promise.resolve() : loadScript(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`)
    ]);
    auth = window.firebase.auth(app);
    db = window.firebase.firestore(app);
    if (!authReadyPromise) {
        authReadyPromise = new Promise(resolve => { authReadyResolve = resolve; });
        try { await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL); } catch {}
        auth.onAuthStateChanged(user => {
            currentUser = user || null;
            if (!user) { worldsCache = []; worldsCacheUid = null; }
            authReadyResolve?.(currentUser);
            if (overlay?.style.display === "block" && currentUser) loadWorlds(true);
        });
    }
    return true;
}

async function waitForAuthState() {
    await ensureFirebase();
    if (auth?.currentUser) { currentUser = auth.currentUser; return currentUser; }
    return authReadyPromise || null;
}

function addStyles() {
    if (document.getElementById("savedWorldsStyles")) return;
    const style = document.createElement("style");
    style.id = "savedWorldsStyles";
    style.textContent = `
#savedWorlds{position:fixed;inset:0;display:none;background:#171717;color:#fff;z-index:240;font-family:Arial,sans-serif;overflow:hidden}
#savedWorldsShell{width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,#242424 0%,#181818 100%)}
#savedWorldsHeader{height:82px;flex:0 0 82px;display:flex;align-items:center;gap:16px;padding:0 28px;background:#2b2b2b;border-bottom:2px solid #101010;box-shadow:0 3px 0 rgba(0,0,0,.28)}
#savedWorldsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:27px;text-shadow:2px 2px 0 #000;white-space:nowrap}
#savedWorldsCount{color:#8fca68;font-size:12px;margin-right:auto}
.savedWorldButton{min-height:42px;padding:9px 15px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 2px 0 #101010}
.savedWorldButton:hover{filter:brightness(1.12)}
.savedWorldButton:active{transform:translateY(2px)}
.savedWorldButton:disabled{opacity:.55;cursor:default;filter:none}
#savedWorldNew{background:linear-gradient(#6d8d4e,#526f3c)}
#savedWorldBack{background:#4a4a4a}
#savedWorldsBody{position:relative;flex:1;min-height:0;overflow:auto;padding:30px}
#savedWorldsGrid{width:min(1120px,100%);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.savedWorldCard{position:relative;min-height:170px;padding:18px;background:linear-gradient(180deg,#3a3a3a,#2d2d2d);border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.4);display:flex;flex-direction:column}
.savedWorldCard h3{margin:0 0 7px;font-family:"MinecraftFont",monospace;font-size:17px;text-shadow:2px 2px 0 #000;word-break:break-word}
.savedWorldMeta{color:#999;font-size:12px;line-height:1.45}
.savedWorldActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto;padding-top:16px}
.savedWorldPlay{background:linear-gradient(#6d8d4e,#526f3c)}
.savedWorldDetails{background:linear-gradient(#666,#4d4d4d)}
#savedWorldsEmpty{width:min(620px,92vw);margin:10vh auto;text-align:center;color:#aaa}
#savedWorldsEmpty h2{margin:0 0 10px;font-family:"MinecraftFont",monospace;color:#fff;font-size:25px;text-shadow:2px 2px 0 #000}
#savedWorldsEmpty p{margin:0 0 22px;line-height:1.5}
#savedWorldsError{text-align:center;color:#e8a4a4;padding:40px 20px}
#worldDetailsPanel{width:min(440px,100vw);height:100%;background:#202020;border-left:2px solid #777;box-shadow:-8px 0 20px rgba(0,0,0,.35);transform:translateX(100%);transition:transform .18s ease;pointer-events:auto;display:flex;flex-direction:column}
#worldDetailsPanel.open{transform:translateX(0)}
#worldDetailsHeader{height:76px;flex:0 0 76px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:#2c2c2c;border-bottom:2px solid #111}
#worldDetailsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:19px;text-shadow:2px 2px 0 #000;word-break:break-word;padding-right:10px}
#worldDetailsClose{width:40px;height:40px;padding:0;font-size:21px}
#worldDetailsContent{overflow:auto;padding:24px}
.worldDetailLabel{margin:0 0 7px;color:#999;font-size:12px}
.worldDetailSeed{padding:14px;background:#111;border:2px solid #080808;border-top-color:#777;border-left-color:#777;font:16px monospace;word-break:break-all;color:#fff}
#worldDetailsHint{margin:12px 0 20px;color:#aaa;font-size:12px;line-height:1.45}
.worldDetailAction{width:100%;margin:8px 0}
#worldDetailsPlay{background:linear-gradient(#6d8d4e,#526f3c)}
#worldDetailsDelete{background:linear-gradient(#804b4b,#633b3b)}
#worldCreateModal{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.68);backdrop-filter:blur(2px);pointer-events:auto;padding:20px}
#worldCreateCard{width:min(480px,94vw);padding:25px;background:#282828;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.55)}
#worldCreateTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:25px;text-shadow:2px 2px 0 #000}
#worldCreateText{margin:0 0 14px;color:#999;font-size:12px;line-height:1.45}
#worldCreateSeedWrap{margin:0 0 16px}
#worldCreateSeedLabel{margin:0 0 7px;color:#999;font-size:12px}
#worldCreateSeed{padding:12px;background:#111;border:2px solid #080808;border-top-color:#777;border-left-color:#777;font:15px monospace;word-break:break-all}
#worldNameInput{width:100%;height:46px;padding:0 12px;background:#111;color:#fff;border:2px solid #080808;border-top-color:#777;border-left-color:#777;outline:none;box-sizing:border-box}
#worldCreateMessage{min-height:20px;margin-top:9px;color:#d8d8d8;font-size:12px}
#worldCreateActions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
#worldCreateConfirm{background:linear-gradient(#6d8d4e,#526f3c)}
@media(max-width:700px){#savedWorldsHeader{height:auto;min-height:76px;flex-wrap:wrap;padding:12px 14px;gap:8px}#savedWorldsTitle{font-size:21px}#savedWorldsCount{order:3;width:100%;margin:0}#savedWorldsBody{padding:16px}#savedWorldsGrid{grid-template-columns:1fr}.savedWorldCard{min-height:150px}#worldDetailsPanel{width:100%}}
`;
    document.head.appendChild(style);
}

function buildUi() {
    if (overlay) return;
    addStyles();
    overlay = document.createElement("div");
    overlay.id = "savedWorlds";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div id="savedWorldsShell">
            <header id="savedWorldsHeader">
                <h1 id="savedWorldsTitle">Saved Worlds</h1>
                <span id="savedWorldsCount"></span>
                <button id="savedWorldNew" class="savedWorldButton" type="button">+ New World</button>
                <button id="savedWorldBack" class="savedWorldButton" type="button">← Back</button>
            </header>
            <main id="savedWorldsBody">
                <div id="savedWorldsGrid"></div>
                <aside id="worldDetailsPanel" aria-hidden="true">
                    <header id="worldDetailsHeader"><h2 id="worldDetailsTitle">World</h2><button id="worldDetailsClose" class="savedWorldButton" type="button">×</button></header>
                    <div id="worldDetailsContent">
                        <p class="worldDetailLabel">World seed</p>
                        <div id="worldDetailsSeed" class="worldDetailSeed"></div>
                        <p id="worldDetailsHint">The seed is hidden from the world card. Open this panel whenever you need to copy or view it.</p>
                        <button id="worldDetailsCopy" class="savedWorldButton worldDetailAction" type="button">Copy Seed</button>
                        <button id="worldDetailsPlay" class="savedWorldButton worldDetailAction" type="button">Play World</button>
                        <button id="worldDetailsDelete" class="savedWorldButton worldDetailAction" type="button">Delete World</button>
                        <div id="worldDetailsMessage"></div>
                    </div>
                </aside>
                <div id="worldCreateModal" aria-hidden="true">
                    <div id="worldCreateCard" role="dialog" aria-modal="true" aria-labelledby="worldCreateTitle">
                        <h2 id="worldCreateTitle">Create New World</h2>
                        <p id="worldCreateText">Give your world a name. A random seed has been generated for it.</p>
                        <div id="worldCreateSeedWrap"><p id="worldCreateSeedLabel">World seed</p><div id="worldCreateSeed"></div></div>
                        <input id="worldNameInput" type="text" maxlength="40" autocomplete="off" placeholder="World name">
                        <div id="worldCreateMessage"></div>
                        <div id="worldCreateActions">
                            <button id="worldCreateConfirm" class="savedWorldButton" type="button">Create & Play</button>
                            <button id="worldCreateCancel" class="savedWorldButton" type="button">Cancel</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
    document.body.appendChild(overlay);
    worldsList = overlay.querySelector("#savedWorldsGrid");
    detailsPanel = overlay.querySelector("#worldDetailsPanel");
    createPanel = overlay.querySelector("#worldCreateModal");
    overlay.querySelector("#savedWorldBack").addEventListener("click", closeWorldMenu);
    overlay.querySelector("#savedWorldNew").addEventListener("click", openCreateWorld);
    overlay.querySelector("#worldDetailsClose").addEventListener("click", closeDetails);
    overlay.querySelector("#worldDetailsCopy").addEventListener("click", copySelectedSeed);
    overlay.querySelector("#worldDetailsPlay").addEventListener("click", playSelectedWorld);
    overlay.querySelector("#worldDetailsDelete").addEventListener("click", deleteSelectedWorld);
    overlay.querySelector("#worldCreateCancel").addEventListener("click", closeCreateWorld);
    overlay.querySelector("#worldCreateConfirm").addEventListener("click", createNewWorld);
    overlay.querySelector("#worldNameInput").addEventListener("keydown", event => {
        if (event.key === "Enter") createNewWorld();
        if (event.key === "Escape") closeCreateWorld();
    });
    createPanel.addEventListener("click", event => { if (event.target === createPanel) closeCreateWorld(); });
}

function makeSeed() {
    try {
        const values = new Uint32Array(2);
        crypto.getRandomValues(values);
        return (values[0] * 4096 + (values[1] >>> 20)) >>> 0;
    } catch {
        return Math.floor(Math.random() * 4294967296) >>> 0;
    }
}

function timestampToCacheValue(timestamp) {
    if (!timestamp) return null;
    if (typeof timestamp === "string") return timestamp;
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toISOString();
    return null;
}

function formatDate(timestamp) {
    const date = timestamp?.toDate ? timestamp.toDate() : timestamp ? new Date(timestamp) : null;
    if (!date || Number.isNaN(date.getTime())) return "Just created";
    return `Last saved ${date.toLocaleDateString()}`;
}

function setOverlayVisible(visible) {
    if (!overlay) return;
    overlay.style.display = visible ? "block" : "none";
    overlay.setAttribute("aria-hidden", visible ? "false" : "true");
}

function cacheWorldsForUser(user, worlds) {
    if (!user) return;
    try {
        localStorage.setItem(`${CACHE_KEY}:${user.uid}`, JSON.stringify(worlds.map(world => ({
            id: world.id,
            name: world.name,
            seed: world.seed,
            createdAt: timestampToCacheValue(world.createdAt),
            updatedAt: timestampToCacheValue(world.updatedAt),
            driveFileId: world.driveFileId || null
        }))));
    } catch {}
}

function getCachedWorlds(user) {
    if (!user) return [];
    try { return JSON.parse(localStorage.getItem(`${CACHE_KEY}:${user.uid}`) || "[]"); } catch { return []; }
}

function showStatus(text, error = false) {
    worldsList.innerHTML = `<div id="${error ? "savedWorldsError" : "savedWorldsEmpty"}"><h2>${escapeHtml(text)}</h2></div>`;
}

async function mergeDriveWorlds(user, driveWorlds) {
    if (!Array.isArray(driveWorlds) || !driveWorlds.length) return;
    for (const driveWorld of driveWorlds) {
        const existing = worldsCache.find(world => Number(world.seed) === Number(driveWorld.seed));
        if (existing) {
            if (!existing.driveFileId) {
                existing.driveFileId = driveWorld.driveFileId;
                cacheWorldsForUser(user, worldsCache);
            }
            continue;
        }
        try {
            const restored = await restoreDriveWorldToFirestore(driveWorld);
            worldsCache.unshift({
                id: restored.id,
                name: restored.name,
                seed: restored.seed,
                createdAt: restored.createdAt,
                updatedAt: restored.updatedAt,
                driveFileId: restored.driveFileId
            });
        } catch (error) {
            console.warn("Could not restore Drive world:", error);
        }
    }
    worldsCache.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    cacheWorldsForUser(user, worldsCache);
    renderWorlds(worldsCache);
}

async function checkGoogleDrive(user) {
    try {
        const driveWorlds = await loadWorldsFromDrive();
        await mergeDriveWorlds(user, driveWorlds);
    } catch (error) {
        const message = String(error?.message || "");
        if (!message.includes("Google Account") && !message.includes("log in")) console.warn("Drive world check skipped:", error);
    }
}

async function loadWorlds(forceRefresh = false) {
    if (!worldsList) return;
    const requestId = ++loadRequest;
    const user = currentUser || await waitForAuthState();
    if (!user) {
        worldsCache = [];
        worldsCacheUid = null;
        showStatus("Log in to save worlds");
        overlay.querySelector("#savedWorldsCount").textContent = "Account required";
        return;
    }
    currentUser = user;
    if (worldsCacheUid !== user.uid) {
        worldsCacheUid = user.uid;
        worldsCache = getCachedWorlds(user);
        renderWorlds(worldsCache);
    } else if (!forceRefresh && worldsCache.length) {
        renderWorlds(worldsCache);
    }
    try {
        const snapshot = await db.collection("users").doc(user.uid).collection(WORLDS_COLLECTION).get();
        if (requestId !== loadRequest) return;
        worldsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => {
            const getMs = value => value?.toMillis ? value.toMillis() : value ? new Date(value).getTime() : 0;
            return getMs(b.updatedAt || b.createdAt) - getMs(a.updatedAt || a.createdAt);
        });
        worldsCacheUid = user.uid;
        cacheWorldsForUser(user, worldsCache);
        renderWorlds(worldsCache);
    } catch (error) {
        console.error("Could not load saved worlds:", error);
        if (!worldsCache.length) {
            showStatus("Could not load saved worlds.", true);
            overlay.querySelector("#savedWorldsCount").textContent = "Error";
        }
    }
    await checkGoogleDrive(user);
}

function renderWorlds(worlds) {
    const count = overlay.querySelector("#savedWorldsCount");
    count.textContent = `${worlds.length} world${worlds.length === 1 ? "" : "s"}`;
    if (!worlds.length) {
        worldsList.innerHTML = `<div id="savedWorldsEmpty"><h2>No worlds found</h2><p>This account has no saved worlds yet.</p><button id="emptyCreateWorld" class="savedWorldButton" type="button">+ Create New World</button></div>`;
        worldsList.querySelector("#emptyCreateWorld").addEventListener("click", openCreateWorld);
        return;
    }
    worldsList.innerHTML = "";
    for (const world of worlds) {
        const card = document.createElement("article");
        card.className = "savedWorldCard";
        card.innerHTML = `<h3>${escapeHtml(world.name || "Unnamed World")}</h3><div class="savedWorldMeta">Singleplayer<br>${escapeHtml(formatDate(world.updatedAt || world.createdAt))}</div><div class="savedWorldActions"><button class="savedWorldButton savedWorldPlay" type="button">Play</button><button class="savedWorldButton savedWorldDetails" type="button">Details →</button></div>`;
        card.querySelector(".savedWorldPlay").addEventListener("click", () => playWorld(world));
        card.querySelector(".savedWorldDetails").addEventListener("click", () => openDetails(world));
        worldsList.appendChild(card);
    }
}

function openDetails(world) {
    selectedWorld = world;
    overlay.querySelector("#worldDetailsTitle").textContent = world.name || "World";
    overlay.querySelector("#worldDetailsSeed").textContent = String(world.seed ?? "");
    overlay.querySelector("#worldDetailsMessage").textContent = "";
    detailsPanel.classList.add("open");
    detailsPanel.setAttribute("aria-hidden", "false");
}

function closeDetails() {
    detailsPanel?.classList.remove("open");
    detailsPanel?.setAttribute("aria-hidden", "true");
    selectedWorld = null;
}

async function copySelectedSeed() {
    if (!selectedWorld) return;
    const ok = await copyText(String(selectedWorld.seed));
    const message = overlay.querySelector("#worldDetailsMessage");
    message.style.color = ok ? "#8fca68" : "#d8a0a0";
    message.textContent = ok ? "Seed copied!" : "Could not copy the seed automatically.";
}

async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
        const helper = document.createElement("textarea");
        helper.value = text; helper.style.position = "fixed"; helper.style.opacity = "0";
        document.body.appendChild(helper); helper.select();
        let ok = false; try { ok = document.execCommand("copy"); } catch {}
        helper.remove(); return ok;
    }
}

function playWorld(world) {
    if (!world || !openWorldCallback) return;
    closeDetails();
    closeWorldMenu();
    openWorldCallback(Number(world.seed));
    saveUpdatedTime(world).catch(() => {});
}

function playSelectedWorld() { if (selectedWorld) playWorld(selectedWorld); }

async function saveUpdatedTime(world) {
    if (!currentUser || !world?.id || world.id.startsWith("drive-") || !db) return;
    const updatedAt = new Date().toISOString();
    try {
        await db.collection("users").doc(currentUser.uid).collection(WORLDS_COLLECTION).doc(world.id).set({ updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        const cachedWorld = worldsCache.find(item => item.id === world.id);
        if (cachedWorld) { cachedWorld.updatedAt = updatedAt; cacheWorldsForUser(currentUser, worldsCache); }
    } catch {}
}

async function deleteSelectedWorld() {
    if (!selectedWorld || !currentUser || !db || selectedWorld.id.startsWith("drive-")) return;
    const name = selectedWorld.name || "this world";
    if (!window.confirm(`Delete \"${name}\"? This cannot be undone.`)) return;
    try {
        await db.collection("users").doc(currentUser.uid).collection(WORLDS_COLLECTION).doc(selectedWorld.id).delete();
        worldsCache = worldsCache.filter(world => world.id !== selectedWorld.id);
        cacheWorldsForUser(currentUser, worldsCache);
        closeDetails();
        renderWorlds(worldsCache);
    } catch (error) {
        overlay.querySelector("#worldDetailsMessage").textContent = error?.message || "Could not delete this world.";
    }
}

function openCreateWorld() {
    if (!currentUser) {
        showStatus("Log in with your Account first to save worlds.", true);
        return;
    }
    pendingWorldSeed = makeSeed();
    overlay.querySelector("#worldNameInput").value = "";
    overlay.querySelector("#worldCreateSeed").textContent = String(pendingWorldSeed);
    overlay.querySelector("#worldCreateMessage").textContent = "";
    createPanel.style.display = "flex";
    createPanel.setAttribute("aria-hidden", "false");
    overlay.querySelector("#worldNameInput").focus();
}

function closeCreateWorld() {
    createPanel.style.display = "none";
    createPanel.setAttribute("aria-hidden", "true");
    pendingWorldSeed = null;
}

async function createNewWorld() {
    const user = currentUser || await waitForAuthState();
    if (!user) return;
    currentUser = user;
    const input = overlay.querySelector("#worldNameInput");
    const message = overlay.querySelector("#worldCreateMessage");
    const button = overlay.querySelector("#worldCreateConfirm");
    const name = input.value.trim() || "New World";
    const seed = pendingWorldSeed ?? makeSeed();
    button.disabled = true;
    message.style.color = "#d8d8d8";
    message.textContent = "Saving world...";
    try {
        const ref = db.collection("users").doc(user.uid).collection(WORLDS_COLLECTION).doc();
        const now = new Date();
        await ref.set({ name, seed, createdAt: window.firebase.firestore.Timestamp.fromDate(now), updatedAt: window.firebase.firestore.Timestamp.fromDate(now) });
        const created = { id: ref.id, name, seed, createdAt: now.toISOString(), updatedAt: now.toISOString() };
        worldsCache = [created, ...worldsCache.filter(world => Number(world.seed) !== seed)];
        worldsCacheUid = user.uid;
        cacheWorldsForUser(user, worldsCache);
        renderWorlds(worldsCache);

        try {
            message.textContent = "Saving to Google Drive...";
            const driveWorld = await saveNewWorldToDrive(name, seed);
            await ref.set({ driveFileId: driveWorld.id, driveFileUrl: driveWorld.webViewLink || null, driveSavedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            created.driveFileId = driveWorld.id;
            cacheWorldsForUser(user, worldsCache);
        } catch (driveError) {
            console.warn("World created but Drive backup failed:", driveError);
        }

        closeCreateWorld();
        closeWorldMenu();
        openWorldCallback?.(seed);
    } catch (error) {
        console.error("Could not create world:", error);
        message.style.color = "#d8a0a0";
        message.textContent = error?.message || "Could not create the world.";
    } finally {
        button.disabled = false;
    }
}

function closeWorldMenu() {
    closeDetails();
    closeCreateWorld();
    setOverlayVisible(false);
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.display = "flex";
    const seedMenu = document.getElementById("seedMenu");
    if (seedMenu) { seedMenu.style.display = "none"; seedMenu.setAttribute("aria-hidden", "true"); }
}

async function openWorldMenu() {
    buildUi();
    setOverlayVisible(true);
    document.exitPointerLock?.();
    const mainMenu = document.getElementById("mainMenu");
    if (mainMenu) mainMenu.style.display = "none";
    const seedMenu = document.getElementById("seedMenu");
    if (seedMenu) { seedMenu.style.display = "none"; seedMenu.setAttribute("aria-hidden", "true"); }
    if (currentUser && worldsCacheUid === currentUser.uid) renderWorlds(worldsCache);
    try {
        await waitForAuthState();
        currentUser = auth.currentUser || currentUser || null;
        await loadWorlds(true);
    } catch (error) {
        console.error("Saved worlds setup failed:", error);
        if (!worldsCache.length) showStatus("Could not connect to saved worlds.", true);
    }
}

export function initSavedWorlds({ onOpenWorld } = {}) {
    if (initialized) return;
    initialized = true;
    openWorldCallback = onOpenWorld;
    buildUi();
    const playButton = document.getElementById("playButton");
    if (playButton) playButton.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openWorldMenu(); }, true);
    window.addEventListener("keydown", event => {
        if (event.code !== "Escape" || overlay?.style.display !== "block") return;
        if (detailsPanel?.classList.contains("open")) closeDetails();
        else if (createPanel?.style.display === "flex") closeCreateWorld();
        else closeWorldMenu();
    });
    ensureFirebase().catch(error => console.warn("Saved worlds auth setup waiting:", error));
}
