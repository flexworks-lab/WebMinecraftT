const DEV_EMAIL = "worthmarcus19@gmail.com";

function isDevUser() {
    const email = window.firebase?.auth?.()?.currentUser?.email || "";
    return String(email).toLowerCase() === DEV_EMAIL.toLowerCase();
}

function installAccountDevButton() {
    const accountUser = document.getElementById("accountUser");
    const existing = document.getElementById("accountDevControlsButton");
    if (!accountUser) return;

    if (!isDevUser()) {
        existing?.remove();
        return;
    }

    if (existing) return;

    const button = document.createElement("button");
    button.id = "accountDevControlsButton";
    button.className = "accountAction";
    button.type = "button";
    button.textContent = "Dev Controls";
    button.addEventListener("click", () => {
        document.getElementById("devControlsButton")?.click();
    });

    const logout = document.getElementById("accountLogout");
    if (logout) accountUser.insertBefore(button, logout);
    else accountUser.appendChild(button);
}

function addAccountDevStyles() {
    if (document.getElementById("accountDevControlsStyles")) return;
    const style = document.createElement("style");
    style.id = "accountDevControlsStyles";
    style.textContent = `
#accountDevControlsButton{background:linear-gradient(#75504d,#5d3f3c)}
/* Keep the internal trigger hidden; Dev Controls is opened only from Account UI. */
#devControlsButton,
body.webminecraft-in-world #devControlsButton{display:none !important;visibility:hidden !important;opacity:0 !important;width:0 !important;height:0 !important;min-width:0 !important;min-height:0 !important;padding:0 !important;margin:0 !important;border:0 !important;pointer-events:none !important;position:absolute !important;overflow:hidden !important}
`;
    document.head.appendChild(style);
}

function watchAccount() {
    addAccountDevStyles();
    installAccountDevButton();

    const observer = new MutationObserver(() => installAccountDevButton());
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(installAccountDevButton, 1000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchAccount, { once: true });
else watchAccount();
