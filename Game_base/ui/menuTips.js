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

const splash = document.getElementById("menuSplash");
if (splash) {
    const tip = MENU_TIPS[Math.floor(Math.random() * MENU_TIPS.length)];
    splash.textContent = tip;
    splash.setAttribute("aria-label", `Minecraft tip: ${tip}`);
}
