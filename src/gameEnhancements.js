const STORAGE_KEY = "webminecraft-progression-v1";

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        return saved && typeof saved === "object" ? saved : { mined: 0, placed: 0, xp: 0, achievements: [] };
    } catch {
        return { mined: 0, placed: 0, xp: 0, achievements: [] };
    }
}

function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}

function initProgressionHud() {
    if (document.getElementById("webMinecraftProgressHud")) return;
    const progress = loadProgress();
    let streak = 0;
    let lastActionAt = 0;
    let toastTimer = null;

    const hud = document.createElement("div");
    hud.id = "webMinecraftProgressHud";
    hud.innerHTML = `
        <div class="progressTitle">⛏️ ADVENTURE</div>
        <div class="progressRow"><span>Level</span><b id="progressLevel">1</b></div>
        <div class="progressBar"><i id="progressBarFill"></i></div>
        <div class="progressRow muted"><span id="progressStats">0 mined • 0 placed</span><span id="progressStreak"></span></div>
    `;
    document.body.appendChild(hud);

    const toast = document.createElement("div");
    toast.id = "webMinecraftAchievementToast";
    document.body.appendChild(toast);

    const style = document.createElement("style");
    style.id = "webMinecraftProgressStyles";
    style.textContent = `
#webMinecraftProgressHud{position:fixed;right:14px;top:14px;width:190px;padding:9px 11px;color:#fff;background:rgba(18,18,18,.68);border:2px solid rgba(0,0,0,.8);border-top-color:rgba(255,255,255,.25);border-left-color:rgba(255,255,255,.18);border-radius:7px;box-shadow:0 4px 18px rgba(0,0,0,.25);font:11px/1.3 Arial,sans-serif;z-index:9998;pointer-events:none;text-shadow:1px 1px 0 #000;backdrop-filter:blur(5px)}
.progressTitle{font:700 12px monospace;margin-bottom:6px;letter-spacing:.6px}.progressRow{display:flex;justify-content:space-between;gap:8px}.progressRow.muted{margin-top:5px;color:#bbb;font-size:10px}.progressBar{height:6px;margin-top:5px;background:#111;border:1px solid #000;border-radius:3px;overflow:hidden}.progressBar i{display:block;width:0;height:100%;background:linear-gradient(90deg,#6fa34d,#b7d96f);transition:width .25s ease}
#webMinecraftAchievementToast{position:fixed;left:50%;top:13%;transform:translate(-50%,-18px) scale(.98);opacity:0;z-index:10020;padding:10px 16px;border:2px solid #111;border-top-color:#999;border-left-color:#999;border-radius:7px;background:rgba(22,22,22,.94);color:#fff;font:700 13px Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45);pointer-events:none;text-shadow:1px 1px 0 #000;transition:opacity .18s ease,transform .18s ease}
#webMinecraftAchievementToast.show{opacity:1;transform:translate(-50%,0) scale(1)}
body:not(.webminecraft-in-world) #webMinecraftProgressHud,body:not(.webminecraft-in-world) #webMinecraftAchievementToast{display:none}
@media(max-width:600px){#webMinecraftProgressHud{top:8px;right:8px;width:155px;padding:7px 8px;font-size:10px}.progressTitle{font-size:11px}}
`;
    document.head.appendChild(style);

    const levelEl = hud.querySelector("#progressLevel");
    const fillEl = hud.querySelector("#progressBarFill");
    const statsEl = hud.querySelector("#progressStats");
    const streakEl = hud.querySelector("#progressStreak");
    const achievements = [
        [1, "🌱 First block — welcome to the world!"],
        [10, "⛏️ Stone age — 10 blocks mined."],
        [50, "🔥 Deep miner — 50 blocks mined."],
        [100, "👑 Master builder — 100 blocks mined."],
    ];

    function levelFromXp(xp) { return Math.floor(Math.sqrt(Math.max(0, xp) / 10)) + 1; }
    function render() {
        const level = levelFromXp(progress.xp);
        const currentBase = Math.pow(level - 1, 2) * 10;
        const nextBase = Math.pow(level, 2) * 10;
        const percent = Math.max(0, Math.min(100, ((progress.xp - currentBase) / Math.max(1, nextBase - currentBase)) * 100));
        levelEl.textContent = String(level);
        fillEl.style.width = `${percent}%`;
        statsEl.textContent = `${progress.mined} mined • ${progress.placed} placed`;
        streakEl.textContent = streak > 1 ? `🔥 x${streak}` : "";
    }

    function showToast(text) {
        toast.textContent = `🏆 ${text}`;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
    }

    function handleBlockChange(event) {
        if (!document.body.classList.contains("webminecraft-in-world")) return;
        const now = performance.now();
        streak = now - lastActionAt < 2200 ? streak + 1 : 1;
        lastActionAt = now;
        const type = event.detail?.type;
        if (type === 0) {
            progress.mined += 1;
            progress.xp += 5;
            const achievement = achievements.find(([count]) => progress.mined === count);
            if (achievement && !progress.achievements.includes(achievement[0])) {
                progress.achievements.push(achievement[0]);
                progress.xp += 25;
                showToast(`${achievement[1]} +25 XP`);
            } else if (streak === 5) {
                showToast("🔥 5-block build streak! +10 XP");
                progress.xp += 10;
            }
        } else {
            progress.placed += 1;
            progress.xp += 3;
            if (streak === 5) {
                showToast("🔥 5-block build streak! +10 XP");
                progress.xp += 10;
            }
        }
        saveProgress(progress);
        render();
    }

    window.addEventListener("webminecraft:blockchange", handleBlockChange);
    render();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initProgressionHud, { once: true });
else initProgressionHud();
