// Firebase web configuration for WebMinecraftT.
// This config is safe to include in the browser. Firebase Authentication and
authentication and your Firebase security rules control access to your project's data.
import "./browserWorldFallback.js";

export const firebaseConfig = {
    apiKey: "AIzaSyByaINh47IFMYmnc9Ty49aHTfTBe2u-jyU",
    authDomain: "webminecraft-f9064.firebaseapp.com",
    projectId: "webminecraft-f9064",
    storageBucket: "webminecraft-f9064.firebasestorage.app",
    messagingSenderId: "781747330238",
    appId: "1:781747330238:web:2324f527da2074cf82d2ef",
    measurementId: "G-EC7BZ58BRK"
};

export function isFirebaseConfigured() {
    return Object.values(firebaseConfig).every(Boolean);
}

import("./multiplayerServerEvents.js").catch(error => console.warn("Multiplayer server event bridge failed to load:", error));
import("./fastCloudDelete.js").catch(error => console.warn("Fast cloud delete failed to load:", error));
import("./playerList.js").catch(error => console.warn("Player list UI failed to load:", error));
import("./discussion.js").catch(error => console.warn("Discussion UI failed to load:", error));
import("./moderation.js").catch(error => console.warn("Moderation system failed to load:", error));
import("./devControls.js").catch(error => console.warn("Developer controls failed to load:", error));
import("./devServerControls.js").catch(error => console.warn("Developer server controls failed to load:", error));
import("./adminManagement.js").catch(error => console.warn("Admin management failed to load:", error));
import("./adminControls.js").catch(error => console.warn("Admin controls failed to load:", error));
import("./accountDevControls.js").catch(error => console.warn("Account developer controls failed to load:", error));
import("./announcementDev.js").catch(error => console.warn("Announcement controls failed to load:", error));
import("./announcements.js").catch(error => console.warn("Website announcements failed to load:", error));
