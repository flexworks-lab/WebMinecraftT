// UI fixes consolidated here so small account-related behaviors stay together.
(function installCameraAndBlurFix() {
    if (window.__webMinecraftCameraAndBlurFix) return;
    window.__webMinecraftCameraAndBlurFix = true;
    const style = document.createElement("style");
    style.id = "webMinecraftCameraAndBlurFix";
    style.textContent = `
#mainMenu,#mainMenu::after,#accountModal,#devControlsModal,#discussionModal,#welcomeOverlay,#welcomeModal,.modalOverlay{
    -webkit-backdrop-filter:none!important;backdrop-filter:none!important;filter:none!important;
}
#mainMenu::after{background:transparent!important;}
`;
    document.head.appendChild(style);
})();

(function installFriendsCloseFix() {
    if (window.__webMinecraftFriendsCloseFix) return;
    window.__webMinecraftFriendsCloseFix = true;
    let ignoreAccountUntil = 0;
    function hideAccountUi() {
        const accountModal = document.getElementById("accountModal");
        if (accountModal) accountModal.style.display = "none";
    }
    function handleFriendsClose(event) {
        const closeButton = event.target?.closest?.("#friendsClose");
        if (!closeButton) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        ignoreAccountUntil = Date.now() + 900;
        document.getElementById("friendsModal")?.classList.remove("open");
        hideAccountUi();
    }
    const eventTypes = ["pointerdown", "mousedown", "touchstart", "pointerup", "mouseup", "touchend", "click"];
    eventTypes.forEach(type => document.addEventListener(type, handleFriendsClose, true));
    eventTypes.forEach(type => document.addEventListener(type, event => {
        if (Date.now() >= ignoreAccountUntil || !event.target?.closest?.("#accountButton")) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hideAccountUi();
    }, true));
    const guard = () => {
        if (Date.now() < ignoreAccountUntil) hideAccountUi();
        window.requestAnimationFrame(guard);
    };
    window.requestAnimationFrame(guard);
})();

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
