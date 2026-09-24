let playerDataSyncCancelled = false;

function ensurePlayerDataSyncUi() {
    if (document.getElementById("playerDataSyncOverlay")) return;
    const style = document.createElement("style");
    style.id = "playerDataSyncStyles";
    style.textContent = `
#playerDataSyncOverlay{
    position:fixed;
    inset:0;
    z-index:1000;
    display:none;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:rgba(0,0,0,.72);
    pointer-events:auto;
}
#playerDataSyncPanel{
    width:min(430px,92vw);
    box-sizing:border-box;
    padding:26px 24px 22px;
    background:linear-gradient(#343434,#202020);
    color:#fff;
    border:2px solid #111;
    border-top-color:#8a8a8a;
    border-left-color:#8a8a8a;
    box-shadow:7px 7px 0 rgba(0,0,0,.55);
    text-align:center;
    font-family:Arial,sans-serif;
}
#playerDataSyncTitle{
    margin:0 0 8px;
    font:24px MinecraftFont,monospace;
    color:#fff;
    text-shadow:2px 2px 0 #000;
}
#playerDataSyncText{
    min-height:34px;
    margin:0 0 16px;
    color:#d7d7d7;
    font-size:12px;
    line-height:1.45;
}
#playerDataSyncProgressOuter{
    width:100%;
    height:22px;
    box-sizing:border-box;
    padding:3px;
    background:#111;
    border:2px solid #090909;
    border-top-color:#777;
    border-left-color:#777;
}
#playerDataSyncProgress{
    width:0%;
    height:100%;
    background:linear-gradient(#9dcc76,#5d843f);
    transition:width .18s ease;
}
#playerDataSyncPercent{
    margin-top:7px;
    min-height:16px;
    font:bold 11px Arial,sans-serif;
    color:#fff;
}
#playerDataSyncCancel{
    display:block;
    width:100%;
    min-height:42px;
    margin-top:17px;
    padding:9px 12px;
    box-sizing:border-box;
    border:2px solid #111;
    border-top-color:#888;
    border-left-color:#888;
    background:linear-gradient(#6b6b6b,#4d4d4d);
    color:#fff;
    font:13px MinecraftFont,monospace;
    text-shadow:2px 2px 0 #222;
    cursor:pointer;
}
#playerDataSyncCancel:hover{filter:brightness(1.1)}
#playerDataSyncCancel:active{transform:translateY(1px)}
@media(max-width:560px){
    #playerDataSyncPanel{padding:22px 18px 18px}
    #playerDataSyncTitle{font-size:21px}
}
`;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "playerDataSyncOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-live", "polite");
    overlay.innerHTML = `
<div id="playerDataSyncPanel">
    <h2 id="playerDataSyncTitle">Player Data Is Syncing</h2>
    <p id="playerDataSyncText">Please wait while your player data is synchronized.</p>
    <div id="playerDataSyncProgressOuter" aria-label="Player data sync progress">
        <div id="playerDataSyncProgress"></div>
    </div>
    <div id="playerDataSyncPercent">0%</div>
    <button id="playerDataSyncCancel" type="button">Cancel</button>
</div>`;
    document.body.appendChild(overlay);

    overlay.querySelector("#playerDataSyncCancel").addEventListener("click", () => {
        playerDataSyncCancelled = true;
        window.dispatchEvent(new CustomEvent("webminecraft:playerdatasynccancel"));
        hidePlayerDataSync();
    });
}

export function resetPlayerDataSyncCancellation() {
    playerDataSyncCancelled = false;
    ensurePlayerDataSyncUi();
}

export function isPlayerDataSyncCancelled() {
    return playerDataSyncCancelled;
}

export function showPlayerDataSync(message = "Please wait while your player data is synchronized.") {
    ensurePlayerDataSyncUi();
    const overlay = document.getElementById("playerDataSyncOverlay");
    overlay.style.display = "flex";
    setPlayerDataSyncProgress(0, message);
}

export function setPlayerDataSyncProgress(percent, message = null) {
    ensurePlayerDataSyncUi();
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const bar = document.getElementById("playerDataSyncProgress");
    const percentEl = document.getElementById("playerDataSyncPercent");
    const text = document.getElementById("playerDataSyncText");
    if (bar) bar.style.width = safePercent + "%";
    if (percentEl) percentEl.textContent = Math.round(safePercent) + "%";
    if (text && message) text.textContent = message;
}

export function hidePlayerDataSync() {
    const overlay = document.getElementById("playerDataSyncOverlay");
    if (overlay) overlay.style.display = "none";
}
