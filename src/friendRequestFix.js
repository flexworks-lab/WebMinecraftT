const FRIEND_FIX_STYLE_ID = "friendRequestFixStyles";

function addFriendFixStyles() {
    if (document.getElementById(FRIEND_FIX_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = FRIEND_FIX_STYLE_ID;
    style.textContent = `
#friendRequestStatus{min-height:18px;margin:6px 0 0;padding:0 2px;color:#aaa;font:11px Arial,sans-serif;line-height:1.4;text-align:center}
#friendRequestStatus.success{color:#9dcc76}
#friendRequestStatus.error{color:#ff8b8b}
#friendAdd.friendSending{opacity:.7;cursor:wait}
`;
    document.head.appendChild(style);
}

function friendStatus(message = "", type = "") {
    const el = document.getElementById("friendRequestStatus");
    if (!el) return;
    el.textContent = message;
    el.className = type;
}

function normalizeFriendCode(value) {
    return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function explainFriendError(error) {
    const code = error?.code || "";
    if (code === "permission-denied") return "Friend request blocked by Firestore permissions. Publish your firestore.rules file in Firebase Console.";
    if (code === "failed-precondition") return "Firebase needs an index or configuration update before friend requests can be sent.";
    if (code === "unavailable") return "Firebase is temporarily unavailable. Check your connection and try again.";
    return error?.message || "Could not send the friend request. Please try again.";
}

async function sendFriendRequestFixed() {
    const button = document.getElementById("friendAdd");
    const input = document.getElementById("friendCodeInput");
    if (!button || !input) return;

    const firebase = window.firebase;
    const user = firebase?.auth?.().currentUser;
    if (!user) {
        friendStatus("Please log in before sending a friend request.", "error");
        return;
    }

    const code = normalizeFriendCode(input.value);
    input.value = code;
    if (!code) {
        friendStatus("Enter a friend code.", "error");
        input.focus();
        return;
    }

    const ownCode = normalizeFriendCode(window.__webMinecraftFriendCode || "");
    if (ownCode && code === ownCode) {
        friendStatus("You cannot add yourself.", "error");
        return;
    }

    const db = firebase.firestore();
    button.disabled = true;
    button.classList.add("friendSending");
    button.textContent = "Sending…";
    friendStatus("Looking up player…");

    try {
        const snap = await db.collection("publicProfiles").where("friendCode", "==", code).limit(1).get();
        if (snap.empty) {
            friendStatus("No account was found with that friend code.", "error");
            return;
        }

        const target = snap.docs[0].data() || {};
        if (!target.uid || target.uid === user.uid) {
            friendStatus("You cannot add yourself.", "error");
            return;
        }

        const requestId = `${user.uid}_${target.uid}`;
        const requestRef = db.collection("friendRequests").doc(requestId);
        const existing = await requestRef.get();

        if (existing.exists) {
            const status = existing.data()?.status;
            if (status === "accepted") {
                friendStatus("You are already friends.", "error");
                return;
            }
            if (status === "pending") {
                friendStatus("A friend request is already pending.", "error");
                return;
            }
        }

        const now = new Date();
        await requestRef.set({
            fromUid: user.uid,
            toUid: target.uid,
            fromName: user.displayName || "Player",
            toName: target.displayName || "Player",
            status: "pending",
            createdAt: now,
            updatedAt: now
        });

        input.value = "";
        friendStatus(`Friend request sent to ${target.displayName || "Player"}!`, "success");
    } catch (error) {
        console.warn("Friend request failed:", error);
        friendStatus(explainFriendError(error), "error");
    } finally {
        button.disabled = false;
        button.classList.remove("friendSending");
        button.textContent = "Send Friend Request";
    }
}

function installFriendRequestFix() {
    addFriendFixStyles();
    const button = document.getElementById("friendAdd");
    const input = document.getElementById("friendCodeInput");
    if (!button || !input || button.dataset.friendFixInstalled === "1") return;

    // Replace the original button so the old listener cannot fire as well.
    const replacement = button.cloneNode(true);
    button.replaceWith(replacement);
    replacement.dataset.friendFixInstalled = "1";
    replacement.addEventListener("click", sendFriendRequestFixed);

    const status = document.createElement("div");
    status.id = "friendRequestStatus";
    replacement.insertAdjacentElement("afterend", status);

    input.addEventListener("input", () => {
        input.value = normalizeFriendCode(input.value).slice(0, 9);
        if (status.textContent) friendStatus("");
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            replacement.click();
        }
    });
}

function watchForFriendUi() {
    installFriendRequestFix();
    const observer = new MutationObserver(() => installFriendRequestFix());
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(installFriendRequestFix, 1000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchForFriendUi, { once: true });
} else {
    watchForFriendUi();
}
