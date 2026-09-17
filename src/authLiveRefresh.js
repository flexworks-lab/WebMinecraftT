import "./cameraAndBlurFix.js";
import "./friendsCloseFix.js";

// Refresh account-dependent UI after an in-page login.
// This makes Friends, Discussions, admin controls, developer controls,
// announcements, and other auth-gated modules reinitialize from the new user.
let previousUid = null;
let authListenerStarted = false;
let receivedFirstAuthState = false;

function updateSavedLoginUi(user) {
    const apply = () => {
        const button = document.getElementById("accountButton");
        if (!button) return false;
        button.title = user?.email ? `Logged in as ${user.email}` : "Account";
        button.textContent = user?.email || user?.displayName || "Account";
        return true;
    };

    if (apply()) return;
    let tries = 0;
    const timer = window.setInterval(() => {
        if (apply() || ++tries >= 50) window.clearInterval(timer);
    }, 100);
}

function watchAuth() {
    if (authListenerStarted || !window.firebase?.auth) return;
    authListenerStarted = true;

    window.firebase.auth().onAuthStateChanged(user => {
        const uid = String(user?.uid || "");
        const justLoggedIn = receivedFirstAuthState && Boolean(uid) && !previousUid;
        receivedFirstAuthState = true;
        previousUid = uid || null;

        updateSavedLoginUi(user || null);
        window.dispatchEvent(new CustomEvent("webminecraft:auth-state-changed", { detail: { user: user || null } }));

        if (justLoggedIn) {
            window.setTimeout(() => window.location.reload(), 150);
        }
    });
}

function waitForAuth() {
    if (window.firebase?.auth) {
        watchAuth();
        return;
    }
    window.setTimeout(waitForAuth, 100);
}

waitForAuth();
