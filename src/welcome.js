const WELCOME_KEY = "webminecraft_welcome_seen_v1";

function shouldShowWelcome() {
    try { return localStorage.getItem(WELCOME_KEY) !== "1"; }
    catch { return true; }
}

function markWelcomeSeen() {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch {}
}

function addWelcomeStyles() {
    if (document.getElementById("welcomeStyles")) return;
    const style = document.createElement("style");
    style.id = "welcomeStyles";
    style.textContent = `
#welcomeScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:500;font-family:Arial,sans-serif;color:#fff}
#welcomeCard{width:min(700px,94vw);max-height:min(620px,90vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#1b1b1b);border:2px solid #101010;border-top-color:#777;border-left-color:#777;box-shadow:8px 8px 0 rgba(0,0,0,.58)}
#welcomeHeader{padding:24px 26px 16px;background:#303030;border-bottom:2px solid #111;text-align:center}
#welcomeTitle{margin:0 0 7px;font-family:MinecraftFont,monospace;font-size:30px;text-shadow:2px 2px 0 #000}
#welcomeSubtitle{margin:0;color:#aaa;font-size:12px;line-height:1.45}
#welcomeTabs{display:flex;gap:6px;padding:12px 16px;background:#222;border-bottom:2px solid #111;overflow-x:auto}
.welcomeTab{flex:1 1 0;min-width:110px;min-height:42px;padding:9px 12px;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#444;color:#eee;font-family:MinecraftFont,monospace;font-size:11px;text-shadow:2px 2px 0 #111;cursor:pointer;white-space:nowrap}
.welcomeTab:hover{background:#505050}.welcomeTab.active{background:linear-gradient(#6b6b6b,#525252)}
#welcomeContent{min-height:260px;overflow:auto;padding:24px 28px;background:#252525}
.welcomePage{display:none}.welcomePage.active{display:block}
.welcomePage h2{margin:0 0 12px;font-family:MinecraftFont,monospace;font-size:19px;text-shadow:2px 2px 0 #000}
.welcomePage p{margin:0 0 12px;color:#ccc;font-size:13px;line-height:1.55}
.welcomeInfo{margin:12px 0;padding:13px 15px;background:#303030;border:2px solid #111;border-top-color:#555;border-left-color:#555;color:#bbb;font-size:12px;line-height:1.55}
.welcomeInfo strong{color:#fff}.welcomeOkRow{padding:14px 18px;background:#202020;border-top:2px solid #111;display:flex;justify-content:flex-end}
#welcomeOk{min-width:150px;min-height:46px;padding:10px 18px;border:2px solid #111;border-top-color:#929292;border-left-color:#929292;background:linear-gradient(#718f52,#526f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:14px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#welcomeOk:hover{filter:brightness(1.1)}#welcomeOk:active{transform:translateY(2px);box-shadow:none}
#welcomeAccountStatus{margin-top:12px;padding:10px 12px;background:#1b1b1b;border:2px solid #101010;color:#aaa;font-size:12px}
#welcomeAccountButton{margin-top:10px;min-height:42px;padding:9px 14px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#555;color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
@media(max-width:600px){#welcomeCard{max-height:92vh}#welcomeHeader{padding:20px 18px 14px}#welcomeTitle{font-size:24px}#welcomeContent{padding:20px}.welcomeTab{min-width:92px}.welcomeOkRow{padding:12px}#welcomeOk{width:100%}}
`;
    document.head.appendChild(style);
}

function buildWelcome() {
    if (document.getElementById("welcomeScreen")) return;
    addWelcomeStyles();

    const screen = document.createElement("div");
    screen.id = "welcomeScreen";
    screen.setAttribute("aria-hidden", "true");
    screen.innerHTML = `
<div id="welcomeCard" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
    <header id="welcomeHeader">
        <h1 id="welcomeTitle">Welcome to WebMinecraft</h1>
        <p id="welcomeSubtitle">A quick guide before you start playing.</p>
    </header>
    <nav id="welcomeTabs" aria-label="Welcome sections">
        <button class="welcomeTab active" data-page="welcome" type="button">Welcome</button>
        <button class="welcomeTab" data-page="setup" type="button">Setup</button>
        <button class="welcomeTab" data-page="account" type="button">Account</button>
        <button class="welcomeTab" data-page="gameplay" type="button">Gameplay</button>
    </nav>
    <main id="welcomeContent">
        <section class="welcomePage active" data-page-content="welcome">
            <h2>You're ready to play</h2>
            <p>WebMinecraft is a browser version of Minecraft-style survival and building. Your worlds are generated from seeds, so the same seed can recreate the same terrain.</p>
            <div class="welcomeInfo"><strong>Tip:</strong> Your first visit is being remembered on this browser so this welcome screen will not keep appearing.</div>
        </section>
        <section class="welcomePage" data-page-content="setup">
            <h2>Website setup</h2>
            <p>Use <strong>Singleplayer</strong> for your saved worlds. Use <strong>Mobile Mode</strong> on phones and tablets for touch controls.</p>
            <div class="welcomeInfo"><strong>World seeds:</strong> Create a world, copy its seed, and use that seed later to return to the same generated world.</div>
            <div class="welcomeInfo"><strong>Settings:</strong> Open Options to change graphics, shadows, brightness, and performance settings.</div>
        </section>
        <section class="welcomePage" data-page-content="account">
            <h2>Player account</h2>
            <p>A player account is needed for the saved-world system. Signing in lets WebMinecraft save your worlds to your account instead of only keeping them in the browser.</p>
            <div id="welcomeAccountStatus">Checking account status...</div>
            <button id="welcomeAccountButton" type="button">Open Account</button>
        </section>
        <section class="welcomePage" data-page-content="gameplay">
            <h2>Basic gameplay</h2>
            <p><strong>Move:</strong> WASD &nbsp; <strong>Look:</strong> Mouse &nbsp; <strong>Jump:</strong> Space &nbsp; <strong>Fly:</strong> F</p>
            <p>Break and place blocks, explore the generated terrain, and use your hotbar to switch blocks.</p>
            <div class="welcomeInfo"><strong>Remember:</strong> World changes are saved to the world you are playing, so switching to another world keeps its data separate.</div>
        </section>
    </main>
    <div class="welcomeOkRow"><button id="welcomeOk" type="button">OK</button></div>
</div>`;

    document.body.appendChild(screen);

    const pages = [...screen.querySelectorAll(".welcomePage")];
    const tabs = [...screen.querySelectorAll(".welcomeTab")];
    function showPage(name) {
        tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.page === name));
        pages.forEach(page => page.classList.toggle("active", page.dataset.pageContent === name));
        if (name === "account") updateAccountStatus();
    }

    tabs.forEach(tab => tab.addEventListener("click", () => showPage(tab.dataset.page)));
    screen.querySelector("#welcomeOk").addEventListener("click", () => {
        markWelcomeSeen();
        screen.style.display = "none";
        screen.setAttribute("aria-hidden", "true");
    });
    screen.querySelector("#welcomeAccountButton").addEventListener("click", () => {
        document.getElementById("accountButton")?.click();
    });
    screen.addEventListener("click", event => {
        if (event.target === screen) return;
    });

    function updateAccountStatus() {
        const status = screen.querySelector("#welcomeAccountStatus");
        if (!status) return;
        const user = window.firebase?.auth?.().currentUser;
        if (user) {
            status.textContent = `Signed in as ${user.displayName || user.email || "Player"}.`;
            status.style.color = "#8fca68";
        } else {
            status.textContent = "Not signed in yet. You can open Account and sign in before using saved worlds.";
            status.style.color = "#c9b36a";
        }
    }

    return { screen, updateAccountStatus };
}

function initWelcome() {
    const ui = buildWelcome();
    if (!ui || !shouldShowWelcome()) return;
    ui.screen.style.display = "flex";
    ui.screen.setAttribute("aria-hidden", "false");
    ui.updateAccountStatus();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWelcome, { once: true });
} else {
    initWelcome();
}
