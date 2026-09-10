// Firebase web configuration for WebMinecraftT.
// This config is safe to include in the browser. Firebase Authentication and
// your Firebase security rules control access to your project's data.
export const firebaseConfig = {
    apiKey: "AIzaSyDakscn99mlAkGBmKo9cKmXPsoK6jnnI2A",
    authDomain: "webminecrafta.firebaseapp.com",
    projectId: "webminecrafta",
    storageBucket: "webminecrafta.firebasestorage.app",
    messagingSenderId: "995664404150",
    appId: "1:995664404150:web:acce14f82ee1e41a1a5017"
};

export function isFirebaseConfigured() {
    return Object.values(firebaseConfig).every(Boolean);
}

// This module is imported by the account system on every page, so load the
// multiplayer player-count/list UI without changing the existing entrypoint.
import("./playerList.js").catch(error => console.warn("Player list UI failed to load:", error));
