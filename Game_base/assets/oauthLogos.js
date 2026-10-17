const BRAND_LOGOS = {
    google: `<svg class="brandSvg googleBrand" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M24 9.5c3.54 0 6.35 1.22 8.69 3.6l6.35-6.35C35.2 3.2 30.1 1 24 1 14.65 1 6.63 6.36 2.73 14.18l7.48 5.81C12.07 14.07 17.49 9.5 24 9.5z"/><path fill="#34A853" d="M24 47c6.16 0 11.34-2.03 15.12-5.5l-7.01-5.43c-1.94 1.3-4.42 2.08-8.11 2.08-6.51 0-12.03-4.4-14.01-10.32l-7.54 5.82C6.39 41.02 14.53 47 24 47z"/><path fill="#FBBC05" d="M10 27.83A14.52 14.52 0 0 1 9.2 24c0-1.33.23-2.62.65-3.83l-7.5-5.99A23.92 23.92 0 0 0 1 24c0 3.55.79 6.92 2.2 9.96l7.54-5.83A14.55 14.55 0 0 1 10 27.83z"/><path fill="#EA4335" d="M24 18.5h13.13c.39 0 .78.03 1.16.08V24c0 4.07-1.36 7.52-3.66 10.07l7.01 5.43C45.1 35.7 47 30.21 47 24c0-1.66-.15-3.25-.43-4.77H24z"/></svg>`,
    yahoo: `<svg class="brandSvg yahooBrand" viewBox="0 0 84 48" aria-hidden="true"><text x="2" y="34" font-family="Arial,Helvetica,sans-serif" font-size="31" font-weight="800" letter-spacing="-1.2" fill="#fff">YAHOO!</text></svg>`,
    github: `<svg class="brandSvg githubBrand" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .3a12 12 0 0 0-3.79 23.38c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.48-1.33-5.48-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6-.03c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.82 5.61-5.5 5.91.43.37.81 1.1.81 2.22v3.28c0 .32.22.69.83.58A12 12 0 0 0 12 .3z"/></svg>`,
    playGames: `<svg class="brandSvg playGamesBrand" viewBox="0 0 48 48" aria-hidden="true"><path fill="#34A853" d="M8.4 13.2c2.8-3.3 8-4.1 11.6-1.8l4 2.5 4-2.5c3.6-2.3 8.8-1.5 11.6 1.8 3.2 3.7 4 9.5 2 14l-4.7 10.7c-1.4 3.2-5.5 4.1-8.2 1.7l-4.7-4.1-4.7 4.1c-2.7 2.4-6.8 1.5-8.2-1.7L6.4 27.2c-2-4.5-1.2-10.3 2-14z"/><path fill="#fff" d="M14 19h3v3h3v3h-3v3h-3v-3h-3v-3h3z"/><circle cx="31.5" cy="21" r="2.2" fill="#FBBC04"/><circle cx="35.5" cy="25" r="2.2" fill="#EA4335"/></svg>`
};

function installBrandLogos() {
    const mappings = [
        [".googleIcon", BRAND_LOGOS.google],
        [".yahooIcon", BRAND_LOGOS.yahoo],
        [".githubIcon", BRAND_LOGOS.github],
        [".playGamesIcon", BRAND_LOGOS.playGames]
    ];
    for (const [selector, svg] of mappings) {
        const el = document.querySelector(selector);
        if (!el) continue;
        el.innerHTML = svg;
        el.textContent = "";
    }

    if (!document.getElementById("brandLogoStyles")) {
        const style = document.createElement("style");
        style.id = "brandLogoStyles";
        style.textContent = `
.brandSvg{width:22px;height:22px;display:block;flex:0 0 22px}
.yahooBrand{width:45px;flex-basis:45px;height:24px}
.githubBrand{width:21px;height:21px;color:#fff}
.playGamesBrand{width:23px;height:23px}
.oauthIcon{overflow:hidden}
`;
        document.head.appendChild(style);
    }
}

function waitForOAuthButtons() {
    if (document.querySelector(".googleIcon")) return installBrandLogos();
    const observer = new MutationObserver(() => {
        if (document.querySelector(".googleIcon")) {
            observer.disconnect();
            installBrandLogos();
        }
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
    setTimeout(() => observer.disconnect(), 5000);
}

waitForOAuthButtons();
