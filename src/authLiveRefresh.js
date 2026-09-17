// Refresh account-dependent UI after an in-page login.
// This makes Friends, Discussions, admin controls, developer controls,
// announcements, and other auth-gated modules reinitialize from the new user.
let previousUid = null;
let authListenerStarted = false;

function watchAuth() {
    if (authListenerStarted || !window.firebase?.auth) return;
    authListenerStarted = true;

    window.firebase.auth().onAuthStateChanged(user => {
        const uid = String(user?.uid || "");
        const wasLoggedOut = previousUid === null;
        const justLoggedIn = Boolean(uid) && !wasLoggedOut && uid !== previousUid;

        // Always remember the current state. The first auth callback after a
        // normal page load does not reload the page; only a real account change
        // made while the page is already running triggers the refresh.
        previousUid = uid || null;

        if (!uid) {
            window.dispatchEvent(new CustomEvent("webminecraft:auth-state-changed", { detail: { user: null } }));
            return;
        }

        window.dispatchEvent(new CustomEvent("webminecraft:auth-state-changed", { detail: { user } }));

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
