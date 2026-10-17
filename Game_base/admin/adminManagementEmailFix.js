// Allow the owner to add administrators by email instead of requiring a Firebase UID.
// The actual admin record still uses the user's Firebase UID so Firestore rules continue
// to grant access to the authenticated account itself.
const PROFILE_COLLECTION = "profiles";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let installed = false;
let firebaseReady = null;

function waitForFirebase(timeout = 15000) {
    if (firebaseReady) return firebaseReady;
    firebaseReady = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            try {
                const firebase = window.firebase;
                if (firebase && typeof firebase.firestore === "function" && typeof firebase.auth === "function") {
                    resolve(firebase);
                    return;
                }
            } catch {}
            if (Date.now() - started >= timeout) {
                resolve(null);
                return;
            }
            setTimeout(check, 100);
        };
        check();
    });
    return firebaseReady;
}

function currentUser(firebase) {
    try { return firebase?.auth?.()?.currentUser || null; } catch { return null; }
}

function setStatus(text, error = false) {
    const status = document.getElementById("adminManageStatus");
    if (!status) return;
    status.textContent = text || "";
    status.classList.toggle("error", error);
}

async function findUidByEmail(email) {
    const firebase = await waitForFirebase();
    const user = currentUser(firebase);
    const firestore = firebase?.firestore?.();
    if (!user || !firestore) throw new Error("Firebase is not ready yet.");

    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) throw new Error("Enter an email address.");

    // Fast path for the normal profile value.
    const exact = await firestore.collection(PROFILE_COLLECTION)
        .where("email", "==", normalized)
        .limit(1)
        .get();
    if (!exact.empty) {
        const data = exact.docs[0].data() || {};
        const uid = String(data.uid || exact.docs[0].id || "").trim();
        if (uid) return uid;
    }

    // Firebase email matching is case-insensitive, so handle older profiles that
    // stored the email with different capitalization.
    const allProfiles = await firestore.collection(PROFILE_COLLECTION).get();
    const match = allProfiles.docs.find(doc => {
        const data = doc.data() || {};
        return String(data.email || "").trim().toLowerCase() === normalized;
    });
    if (!match) throw new Error("No WebMinecraft account was found with that email.");

    const data = match.data() || {};
    const uid = String(data.uid || match.id || "").trim();
    if (!uid) throw new Error("That account does not have a Firebase UID yet.");
    return uid;
}

function updatePlaceholder() {
    const input = document.getElementById("adminManageUid");
    if (input) {
        input.placeholder = "Enter the player's email (including iCloud)";
        input.setAttribute("aria-label", "Player email");
    }
}

async function handleAddClick(event) {
    const button = event.target?.closest?.("#adminManageAdd");
    if (!button) return;
    const input = document.getElementById("adminManageUid");
    if (!input) return;

    const value = String(input.value || "").trim();
    if (!EMAIL_PATTERN.test(value)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (input.dataset.emailResolving === "1") return;
    input.dataset.emailResolving = "1";
    button.disabled = true;
    setStatus(`Looking up ${value}...`);

    try {
        const uid = await findUidByEmail(value);
        input.value = uid;
        setStatus("Account found. Adding Admin Controls...");
        button.disabled = false;
        input.dataset.emailResolving = "0";
        // The original admin-management handler accepts a UID. Trigger it after
        // resolving the email so it can create the normal /admins/{uid} record.
        button.click();
    } catch (error) {
        input.dataset.emailResolving = "0";
        button.disabled = false;
        setStatus(error?.message || "Could not find that account.", true);
    }
}

function watchDom() {
    if (installed) return;
    installed = true;
    updatePlaceholder();
    document.addEventListener("click", handleAddClick, true);
    const observer = new MutationObserver(updatePlaceholder);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(updatePlaceholder, 1000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchDom, { once: true });
} else {
    watchDom();
}
