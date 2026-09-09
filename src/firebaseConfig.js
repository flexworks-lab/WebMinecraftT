// Firebase web configuration for WebMinecraftT.
// Get these values from Firebase Console -> Project settings -> Your apps -> Web app.
// This configuration is safe to ship in a web app; access is controlled by Firebase Authentication rules.
export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export function isFirebaseConfigured() {
    return Object.values(firebaseConfig).every(Boolean);
}
