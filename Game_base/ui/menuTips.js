const MENU_TIPS = [
    "A crafting table makes bigger recipes possible.",
    "Use the number keys 1–9 to pick a hotbar slot.",
    "Share your world seed with a friend.",
    "Watch your step around deep water.",
    "Break blocks to collect them in Survival.",
    "Try another seed to find a new landscape.",
    "Keep an eye on your inventory space.",
    "Hold Shift to sprint.",
    "Place blocks to make your own paths and bridges.",
    "Your saved worlds stay in this browser."
];

const tipStyle = document.createElement("style");
tipStyle.id = "webMinecraftMenuTipFit";
tipStyle.textContent = `
#menuPanel{max-width:calc(100vw - 24px)}
#menuSplash{display:block!important;box-sizing:border-box!important;width:min(560px,calc(100vw - 32px))!important;max-width:calc(100% - 12px)!important;margin:3px auto 12px!important;padding:6px 12px!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;text-align:center!important;line-height:1.25!important;transform:rotate(-1deg)!important}
@media(max-width:760px){#menuSplash{width:100%!important;max-width:100%!important;font-size:clamp(9px,2.8vw,12px)!important;margin:2px auto 8px!important;padding:5px 6px!important}}
`;
document.head.appendChild(tipStyle);

const splash = document.getElementById("menuSplash");
if (splash) {
    const tip = MENU_TIPS[Math.floor(Math.random() * MENU_TIPS.length)];
    splash.textContent = tip;
    splash.setAttribute("aria-label", `Minecraft tip: ${tip}`);
}
