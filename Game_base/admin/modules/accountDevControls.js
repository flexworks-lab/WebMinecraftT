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
#devControlsButton{display:none !important}
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
