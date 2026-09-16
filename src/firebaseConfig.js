// Firebase web configuration for WebMinecraftT.
// This config is safe to include in the browser. Firebase Authentication and
// your Firebase security rules control access to your project's data.
import "./browserWorldFallback.js";
import "./multiplayerServerMode.js";
import "./multiplayerGameplayStateFix.js";

// The News button is created by menuUpdates.js. Give any button that becomes
// #newsButton its final fixed position before it is inserted into the DOM.
// This runs before main.js/menuUpdates.js because firebaseConfig.js is loaded first.
(function installEarlyNewsButtonPosition(){
    if (window.__webminecraftEarlyNewsButtonPosition) return;
    window.__webminecraftEarlyNewsButtonPosition = true;

    const createElement = document.createElement.bind(document);
    document.createElement = function(tagName, options) {
        const element = createElement(tagName, options);
        if (String(tagName).toLowerCase() !== "button") return element;

        const originalIdDescriptor = Object.getOwnPropertyDescriptor(element, "id");
        let currentId = element.id;
        Object.defineProperty(element, "id", {
            configurable: true,
            enumerable: true,
            get() {
                return currentId;
            },
            set(value) {
                currentId = String(value ?? "");
                if (originalIdDescriptor?.set) originalIdDescriptor.set.call(this, currentId);
                else this.setAttribute("id", currentId);

                if (currentId === "newsButton") {
                    this.style.position = "fixed";
                    this.style.left = window.innerWidth <= 560 ? "12px" : "28px";
                    this.style.bottom = window.innerWidth <= 560 ? "18px" : "28px";
                    this.style.width = window.innerWidth <= 560 ? "calc(50vw - 18px)" : "118px";
                    this.style.margin = "0";
                    this.style.zIndex = "97";
                }
            }
        });

        return element;
    };

    window.addEventListener("resize", () => {
        const button = document.getElementById("newsButton");
        if (!button) return;
        const mobile = window.innerWidth <= 560;
        button.style.left = mobile ? "12px" : "28px";
        button.style.bottom = mobile ? "18px" : "28px";
        button.style.width = mobile ? "calc(50vw - 18px)" : "118px";
    }, { passive: true });
})();

export const firebaseConfig = {
    apiKey: "AIzaSyByaINh47IFMYmnc9Ty49aHTfTBe2u-jyU",
    authDomain: "webminecraft-f9064.firebaseapp.com",
    databaseURL: "https://webminecraft-f9064-default-rtdb.firebaseio.com",
    projectId: "webminecraft-f9064",
    storageBucket: "webminecraft-f9064.firebasestorage.app",
    messagingSenderId: "781747330238",
    appId: "1:781747330238:web:2324f527da2074cf82d2ef",
    measurementId: "G-EC7BZ58BRK"
};

export function isFirebaseConfigured() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

// Website announcements need Firestore as soon as the main page loads.
// Previously Firebase was initialized by the account/auth flow, which meant
// the announcement module could sit waiting until the Account button was used.
// Start the minimal Firebase app + Firestore setup immediately instead.
(function initializeFirebaseForStartupAnnouncements() {
    if (!isFirebaseConfigured() || window.__webMinecraftStartupFirebase) return;
    window.__webMinecraftStartupFirebase = true;

    const version = "12.18.0";
    const loadScript = src => {
        if (!window.__webMinecraftFirebaseLoads) window.__webMinecraftFirebaseLoads = new Map();
        const loads = window.__webMinecraftFirebaseLoads;
        if (loads.has(src)) return loads.get(src);
        const promise = new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                const ready = src.includes("firebase-app-compat") ? window.firebase : window.firebase?.firestore;
                if (ready) return resolve();
                existing.addEventListener("load", () => resolve(), { once: true });
                existing.addEventListener("error", () => reject(new Error(`Could not load ${src}`)), { once: true });
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Could not load ${src}`));
            document.head.appendChild(script);
        });
        loads.set(src, promise);
        return promise;
    };

    Promise.resolve()
        .then(() => loadScript(`https://www.gstatic.com/firebasejs/${version}/firebase-app-compat.js`))
        .then(() => {
            if (!window.firebase) throw new Error("Firebase SDK did not load.");
            const apps = window.firebase.apps || [];
            if (!apps.length) window.firebase.initializeApp(firebaseConfig);
            return loadScript(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore-compat.js`);
        })
        .catch(error => {
            window.__webMinecraftStartupFirebase = null;
            console.warn("Startup Firebase setup failed:", error);
        });
})();

import("./admin/devControls.js").catch(error => console.warn("Developer controls failed to load:", error));
import("./admin/devServerControls.js").catch(error => console.warn("Developer server controls failed to load:", error));
import("./admin/adminChatFix.js").catch(error => console.warn("Admin server chat fix failed to load:", error));
import("./admin/adminGameChatFix.js").catch(error => console.warn("Admin multiplayer chat styling failed to load:", error));
import("./admin/adminManagement.js").catch(error => console.warn("Admin management failed to load:", error));
import("./admin/adminControls.js").catch(error => console.warn("Admin controls failed to load:", error));
import("./admin/accountDevControls.js").catch(error => console.warn("Account developer controls failed to load:", error));
import("./admin/announcementDev.js").catch(error => console.warn("Announcement controls failed to load:", error));
import("./newsLive.js").catch(error => console.warn("Live News tabs failed to load:", error));
import("./newsFreshStart.js").catch(error => console.warn("Fresh News start failed to load:", error));
import("./announcements.js").catch(error => console.warn("Website announcements failed to load:", error));
import("./friendsLive.js").catch(error => console.warn("Live friends UI failed to load:", error));
import("./friendsPresence.js").catch(error => console.warn("Live friend presence failed to load:", error));
import("./oauthLogos.js").catch(error => console.warn("OAuth logo UI failed to load:", error));