// Firebase web configuration for WebMinecraftT.
// This config is safe to include in the browser. Firebase Authentication and
// your Firebase security rules control access to your project's data.
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

// These modules are loaded globally so the player list and Discussions are
// available from the home screen without changing the main entrypoint.
import("./playerList.js").catch(error => console.warn("Player list UI failed to load:", error));
import("./discussion.js").catch(error => console.warn("Discussion UI failed to load:", error));
