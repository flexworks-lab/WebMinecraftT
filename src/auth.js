import { firebaseConfig, isFirebaseConfigured } from "./firebaseConfig.js";

let firebaseReady = false;
let auth = null;
let currentUser = null;
let friendCode = "";
let friendRefreshTimer = null;

function loadFirebaseScript(src) {
    if (!window.__webMinecraftFirebaseLoads) window.__webMinecraftFirebaseLoads = new Map();
    const loads = window.__webMinecraftFirebaseLoads;
    if (loads.has(src)) return loads.get(src);
    const promise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            const ready = src.includes("firebase-app-compat") ? window.firebase : src.includes("firebase-auth-compat") ? window.firebase?.auth : window.firebase?.firestore;
            if (ready) return resolve();
            const cleanup = () => { existing.removeEventListener("load", onLoad); existing.removeEventListener("error", onError); };
            const onLoad = () => { cleanup(); resolve(); };
            const onError = () => { cleanup(); reject(new Error(`Could not load ${src}`)); };
            existing.addEventListener("load", onLoad, { once: true });
            existing.addEventListener("error", onError, { once: true });
            return;
        }
        const script = document.createElement("script");
        script.src = src; script.async = true;
        script.onload = () => resolve(); script.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(script);
    });
    loads.set(src, promise);
    return promise;
}

function makeFriendCode(uid) {
    let a = 2166136261;
    for (const char of String(uid)) { a ^= char.charCodeAt(0); a = Math.imul(a, 16777619); }
    let b = a >>> 0;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) { b = (Math.imul(b ^ (b >>> 13), 1274126177) + 1013904223) >>> 0; code += alphabet[b % alphabet.length]; }
    return `${code.slice(0, 4)}-${code.slice(4)}`;
}

function getFriendCode() { return friendCode || (currentUser?.uid ? makeFriendCode(currentUser.uid) : ""); }

async function syncUserProfile(user) {
    if (!user?.uid || !user?.email || !window.firebase?.firestore) return;
    const db = window.firebase.firestore();
    const code = makeFriendCode(user.uid);
    friendCode = code;
    try {
        await db.collection("profiles").doc(user.uid).set({ uid: user.uid, email: user.email, displayName: user.displayName || "", updatedAt: new Date() }, { merge: true });
        await db.collection("publicProfiles").doc(user.uid).set({ uid: user.uid, displayName: user.displayName || "Player", friendCode: code, updatedAt: new Date() }, { merge: true });
    } catch (error) { console.warn("Could not sync account profile:", error); }
}

async function initFirebase() {
    if (firebaseReady) return true;
    if (!isFirebaseConfigured()) return false;
    try {
        const version = "12.18.0";
        await loadFirebaseScript(`https://www.gstatic.com/firebasejs/${version}/firebase-app-compat.js`);
        if (!window.firebase) throw new Error("Firebase SDK did not load.");
        const apps = window.firebase.apps || [];
        const app = apps.length ? apps[0] : window.firebase.initializeApp(firebaseConfig);
        await Promise.all([
            loadFirebaseScript(`https://www.gstatic.com/firebasejs/${version}/firebase-auth-compat.js`),
            loadFirebaseScript(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore-compat.js`)
        ]);
        auth = window.firebase.auth(app);
        auth.onAuthStateChanged(user => {
            currentUser = user || null;
            friendCode = currentUser ? makeFriendCode(currentUser.uid) : "";
            if (user) syncUserProfile(user);
            else { if (friendRefreshTimer) clearTimeout(friendRefreshTimer); friendRefreshTimer = null; }
            updateAccountUi();
        });
        firebaseReady = true;
        return true;
    } catch (error) { console.error("Firebase authentication setup failed:", error); return false; }
}

function addStyles() {
    if (document.getElementById("accountStyles")) return;
    const style = document.createElement("style");
    style.id = "accountStyles";
    style.textContent = `
#accountButton{position:fixed;top:92px;right:20px;left:auto;z-index:90;min-width:48px;height:48px;padding:0 14px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:#4c4c4c;color:#fff;font:bold 13px Arial,sans-serif;cursor:pointer;box-shadow:0 3px 0 #171717}
#accountButton:hover{background:#5e5e5e}
#accountModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:250;padding:20px}
#accountPanel{width:min(480px,94vw);max-height:90vh;overflow:auto;background:linear-gradient(#282828,#1b1b1b);border:2px solid #101010;border-top-color:#707070;border-left-color:#707070;box-shadow:7px 7px 0 rgba(0,0,0,.55);padding:26px 24px 22px;color:#fff;font-family:Arial,sans-serif}
#accountTitle{margin:0 0 6px;font-family:MinecraftFont,monospace;font-size:28px;text-align:center;text-shadow:2px 2px 0 #000}
#accountSubtitle{margin:0 0 18px;color:#999;font-size:12px;text-align:center;line-height:1.45}
.accountField{display:block;box-sizing:border-box;width:100%;height:44px;margin:9px 0;padding:0 12px;background:#111;color:#fff;border:2px solid #080808;border-top-color:#777;border-left-color:#777;outline:none}
.accountField:focus{border-color:#84ad5e;box-shadow:0 0 0 2px rgba(132,173,94,.18)}
.accountAction{display:block;width:100%;min-height:44px;margin:9px 0;padding:10px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#6d6d6d,#505050);color:#fff;font-family:MinecraftFont,monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}
.accountAction:hover{filter:brightness(1.1)}
.accountPrimary{background:linear-gradient(#6d8d4e,#526f3c)}
.googleAction{background:#fff;color:#222;text-shadow:none;font-family:Arial,sans-serif;font-weight:700}
#accountSwitch{margin-top:14px;text-align:center;color:#aaa;font-size:12px}
#accountSwitch button,#accountForgot{border:0;background:none;color:#9dcc76;text-decoration:underline;cursor:pointer;padding:0;font-size:inherit}
#accountForgot{display:block;margin:4px auto 10px}
#accountMessage{min-height:20px;margin:10px 0 0;color:#d8d8d8;text-align:center;font-size:12px;line-height:1.4}
#accountUser{display:none;text-align:center}
#accountAvatar{width:64px;height:64px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 10px;background:#4a4a4a}
#accountName{font-size:18px;font-weight:700;margin-bottom:4px}
#accountEmail{font-size:12px;color:#999;word-break:break-all;margin-bottom:12px}
#friendCodeBox{margin:12px 0 16px;padding:13px;background:#161616;border:1px solid #4b4b4b;text-align:left}
#friendCodeLabel{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px}
#friendCodeValue{font:bold 21px MinecraftFont,monospace;letter-spacing:2px;color:#b5dd87;text-align:center;text-shadow:2px 2px 0 #000}
#friendCopy{margin-top:8px;min-height:36px;font-size:11px}
.friendSection{margin-top:16px;text-align:left;border-top:1px solid #3f3f3f;padding-top:14px}
.friendSectionTitle{font:14px MinecraftFont,monospace;margin-bottom:8px;text-shadow:2px 2px 0 #000}
.friendRow{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;margin:5px 0;background:#303030;border:1px solid #484848;font-size:12px}
.friendRowName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.friendRowCode{color:#999;font-size:9px;margin-top:2px}.friendRow button{flex:0 0 auto;min-height:30px;padding:5px 9px;background:#4c4c4c;color:#fff;border:1px solid #777;cursor:pointer}
.friendEmpty{padding:10px;color:#888;background:#181818;border:1px solid #333;font-size:11px}
#accountClose{background:#454545}
#accountLoading{font-size:12px;color:#aaa;text-align:center;padding:10px 0}
@media(max-width:560px){#accountButton{top:76px;right:12px;left:auto}.settingsOpenPlaceholder{top:12px;right:12px}}
`;
    document.head.appendChild(style);
}

function createUi() {
    if (document.getElementById("accountButton")) return;
    addStyles();
    const button = document.createElement("button"); button.id = "accountButton"; button.type = "button"; button.textContent = "Account"; button.addEventListener("click", openAccountModal); document.body.appendChild(button);
    const modal = document.createElement("div"); modal.id = "accountModal";
    modal.innerHTML = `
<div id="accountPanel">
<section id="accountLoginView"><h2 id="accountTitle">Player Account</h2><p id="accountSubtitle">Save your profile and use the same account across devices.</p><input id="accountEmailInput" class="accountField" type="email" autocomplete="email" placeholder="Email"><input id="accountPasswordInput" class="accountField" type="password" autocomplete="current-password" placeholder="Password"><button id="accountSubmit" class="accountAction accountPrimary" type="button">Log In</button><button id="accountGoogle" class="accountAction googleAction" type="button">Continue with Google</button><button id="accountForgot" type="button">Forgot password?</button><div id="accountSwitch">New here? <button id="accountSwitchButton" type="button">Create an account</button></div><div id="accountMessage"></div><button id="accountClose" class="accountAction" type="button">Close</button></section>
<section id="accountUser"><h2 id="accountTitle">Your Account</h2><img id="accountAvatar" alt=""><div id="accountName"></div><div id="accountEmail"></div><div id="friendCodeBox"><div id="friendCodeLabel">Your Friend Code</div><div id="friendCodeValue">--------</div><button id="friendCopy" class="accountAction accountPrimary" type="button">Copy Friend Code</button></div><div class="friendSection"><div class="friendSectionTitle">Add a Friend</div><input id="friendCodeInput" class="accountField" maxlength="9" autocomplete="off" placeholder="Enter friend code"><button id="friendAdd" class="accountAction accountPrimary" type="button">Send Friend Request</button></div><div class="friendSection"><div class="friendSectionTitle">Friend Requests</div><div id="friendRequests"><div class="friendEmpty">No pending requests.</div></div></div><div class="friendSection"><div class="friendSectionTitle">Friends</div><div id="friendList"><div class="friendEmpty">No friends yet.</div></div></div><button id="accountLogout" class="accountAction accountPrimary" type="button">Log Out</button><button id="accountCloseUser" class="accountAction" type="button">Close</button></section>
<div id="accountLoading">Connecting to account service…</div></div>`;
    document.body.appendChild(modal);
    const close = () => modal.style.display = "none";
    modal.addEventListener("click", event => { if (event.target === modal) close(); });
    modal.querySelector("#accountClose").addEventListener("click", close); modal.querySelector("#accountCloseUser").addEventListener("click", close);
    modal.querySelector("#accountLogout").addEventListener("click", async () => { if (!auth) return; try { await auth.signOut(); } catch (error) { setMessage(error); } });
    modal.querySelector("#friendCopy").addEventListener("click", async () => { try { await navigator.clipboard.writeText(getFriendCode()); modal.querySelector("#friendCopy").textContent = "Copied!"; setTimeout(() => modal.querySelector("#friendCopy").textContent = "Copy Friend Code", 1200); } catch { setMessage("Could not copy the friend code."); } });
    modal.querySelector("#friendAdd").addEventListener("click", sendFriendRequest);
    let signUpMode = false;
    const submit = modal.querySelector("#accountSubmit"), switchButton = modal.querySelector("#accountSwitchButton"), password = modal.querySelector("#accountPasswordInput"), email = modal.querySelector("#accountEmailInput");
    switchButton.addEventListener("click", () => { signUpMode = !signUpMode; submit.textContent = signUpMode ? "Sign Up" : "Log In"; password.autocomplete = signUpMode ? "new-password" : "current-password"; password.placeholder = signUpMode ? "Create a password" : "Password"; switchButton.textContent = signUpMode ? "Log in instead" : "Create an account"; modal.querySelector("#accountSwitch").firstChild.textContent = signUpMode ? "Already have an account? " : "New here? "; setMessage(""); });
    submit.addEventListener("click", async () => { if (!(await ensureReady())) return; const emailValue = email.value.trim(), passwordValue = password.value; if (!emailValue || !passwordValue) return setMessage("Enter your email and password."); try { submit.disabled = true; if (signUpMode) await auth.createUserWithEmailAndPassword(emailValue, passwordValue); else await auth.signInWithEmailAndPassword(emailValue, passwordValue); setMessage(""); } catch (error) { setMessage(error); } finally { submit.disabled = false; } });
    modal.querySelector("#accountGoogle").addEventListener("click", async () => { if (!(await ensureReady())) return; try { await auth.signInWithPopup(new window.firebase.auth.GoogleAuthProvider()); } catch (error) { setMessage(error); } });
    modal.querySelector("#accountForgot").addEventListener("click", async () => { if (!(await ensureReady())) return; const emailValue = email.value.trim(); if (!emailValue) return setMessage("Enter your email first."); try { await auth.sendPasswordResetEmail(emailValue); setMessage("Password reset email sent."); } catch (error) { setMessage(error); } });
}

function setMessage(value) {
    const el = document.getElementById("accountMessage"); if (!el) return;
    if (!value) { el.textContent = ""; return; }
    if (typeof value === "string") { el.textContent = value; return; }
    const messages = { "auth/invalid-email":"That email address is not valid.", "auth/user-not-found":"No account was found with that email.", "auth/wrong-password":"That password is incorrect.", "auth/invalid-credential":"The email or password is incorrect.", "auth/email-already-in-use":"That email is already in use.", "auth/weak-password":"Use a stronger password.", "auth/popup-closed-by-user":"Google sign-in was closed.", "auth/operation-not-allowed":"This sign-in method is not enabled yet." };
    el.textContent = messages[value?.code] || value?.message || "Something went wrong. Please try again.";
}

async function ensureReady() {
    const loading = document.getElementById("accountLoading");
    if (!isFirebaseConfigured()) { if (loading) loading.textContent = "Firebase is not connected yet. Add your Firebase web config in src/firebaseConfig.js."; return false; }
    if (firebaseReady) return true;
    if (loading) loading.style.display = "block";
    const ready = await initFirebase(); if (loading) loading.style.display = "none"; if (!ready) setMessage("Could not connect to the account service."); return ready;
}

function openAccountModal() {
    const modal = document.getElementById("accountModal"); if (!modal) return;
    modal.style.display = "flex";
    const loading = document.getElementById("accountLoading");
    if (!isFirebaseConfigured()) { if (loading) { loading.style.display = "block"; loading.textContent = "Connect Firebase to enable accounts."; } updateAccountUi(); return; }
    ensureReady().then(() => updateAccountUi());
}

function renderFriendCode() { const el = document.getElementById("friendCodeValue"); if (el) el.textContent = getFriendCode() || "--------"; }

async function sendFriendRequest() {
    if (!(await ensureReady()) || !currentUser) return;
    const input = document.getElementById("friendCodeInput"), code = input.value.trim().toUpperCase();
    if (!code) return setMessage("Enter a friend code.");
    if (code === getFriendCode()) return setMessage("You cannot add yourself.");
    const db = window.firebase.firestore();
    try {
        const snap = await db.collection("publicProfiles").where("friendCode", "==", code).limit(1).get();
        if (snap.empty) return setMessage("No account was found with that friend code.");
        const target = snap.docs[0].data();
        if (target.uid === currentUser.uid) return setMessage("You cannot add yourself.");
        const requestId = `${currentUser.uid}_${target.uid}`;
        const existing = await db.collection("friendRequests").doc(requestId).get();
        if (existing.exists) {
            const status = existing.data().status;
            if (status === "accepted") return setMessage("You are already friends.");
            if (status === "pending") return setMessage("A friend request is already pending.");
        }
        await db.collection("friendRequests").doc(requestId).set({ fromUid: currentUser.uid, toUid: target.uid, fromName: currentUser.displayName || "Player", toName: target.displayName || "Player", status: "pending", createdAt: new Date(), updatedAt: new Date() });
        input.value = ""; setMessage(`Friend request sent to ${target.displayName || "Player"}.`); refreshFriends();
    } catch (error) { console.warn("Friend request failed:", error); setMessage("Could not send the friend request. Check your Firestore rules."); }
}

async function updateFriendRequest(id, accept) {
    if (!currentUser || !window.firebase?.firestore) return;
    try { await window.firebase.firestore().collection("friendRequests").doc(id).update({ status: accept ? "accepted" : "declined", updatedAt: new Date() }); refreshFriends(); }
    catch { setMessage("Could not update that friend request."); }
}

async function refreshFriends() {
    if (!currentUser || !window.firebase?.firestore) return;
    const db = window.firebase.firestore(), requestEl = document.getElementById("friendRequests"), listEl = document.getElementById("friendList");
    if (!requestEl || !listEl) return;
    try {
        const [incoming, sent, fromFriends, toFriends] = await Promise.all([
            db.collection("friendRequests").where("toUid", "==", currentUser.uid).get(),
            db.collection("friendRequests").where("fromUid", "==", currentUser.uid).get(),
            db.collection("friendRequests").where("fromUid", "==", currentUser.uid).get(),
            db.collection("friendRequests").where("toUid", "==", currentUser.uid).get()
        ]);
        const incomingPending = incoming.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.status === "pending");
        requestEl.innerHTML = incomingPending.length ? incomingPending.map(x => `<div class="friendRow"><div><div class="friendRowName">${escapeHtml(x.fromName || "Player")}</div><div class="friendRowCode">Friend request</div></div><div><button data-friend-accept="${escapeHtml(x.id)}">Accept</button><button data-friend-decline="${escapeHtml(x.id)}">Decline</button></div></div>`).join("") : '<div class="friendEmpty">No pending requests.</div>';
        requestEl.querySelectorAll("[data-friend-accept]").forEach(b => b.addEventListener("click", () => updateFriendRequest(b.dataset.friendAccept, true)));
        requestEl.querySelectorAll("[data-friend-decline]").forEach(b => b.addEventListener("click", () => updateFriendRequest(b.dataset.friendDecline, false)));
        const all = new Map();
        for (const doc of [...fromFriends.docs, ...toFriends.docs]) { const x = doc.data(); if (x.status !== "accepted") continue; const uid = x.fromUid === currentUser.uid ? x.toUid : x.fromUid; const name = x.fromUid === currentUser.uid ? x.toName : x.fromName; if (uid) all.set(uid, { uid, name: name || "Player" }); }
        listEl.innerHTML = all.size ? [...all.values()].map(x => `<div class="friendRow"><div class="friendRowName">${escapeHtml(x.name)}</div><span class="friendRowCode">Friend</span></div>`).join("") : '<div class="friendEmpty">No friends yet.</div>';
        const sentPending = sent.docs.some(d => d.data().status === "pending");
        if (sentPending) setMessage("Friend request sent.");
    } catch (error) { console.warn("Could not load friends:", error); requestEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>'; listEl.innerHTML = '<div class="friendEmpty">Friends are unavailable right now.</div>'; }
}

function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;"); }

function updateAccountUi() {
    const loginView = document.getElementById("accountLoginView"), userView = document.getElementById("accountUser"), loading = document.getElementById("accountLoading"), button = document.getElementById("accountButton");
    if (!loginView || !userView || !button) return;
    if (loading && firebaseReady) loading.style.display = "none";
    if (currentUser) {
        loginView.style.display = "none"; userView.style.display = "block";
        button.textContent = currentUser.displayName ? `Hi, ${currentUser.displayName.split(" ")[0]}` : "Account";
        const avatar = document.getElementById("accountAvatar");
        if (avatar) avatar.src = currentUser.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%234a4a4a'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23aaa'/%3E%3Cpath d='M14 57c2-12 10-18 18-18s16 6 18 18' fill='%23aaa'/%3E%3C/svg%3E";
        document.getElementById("accountName").textContent = currentUser.displayName || "Player"; document.getElementById("accountEmail").textContent = currentUser.email || ""; renderFriendCode(); refreshFriends();
    } else { loginView.style.display = "block"; userView.style.display = "none"; button.textContent = "Account"; }
}

createUi();
initFirebase().catch(() => {});
