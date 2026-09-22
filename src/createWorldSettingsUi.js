// Create World settings UI enhancer.
// This only changes the Create New World modal appearance and navigation.
// The existing worldsV2.js create/cancel handlers remain the source of truth.

import { setWorldMode } from "./survivalMode.js";

const STYLE_ID = "webminecraft-create-world-settings-ui";
const MODAL_MARK = "data-create-world-settings-ui";

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#savedWorlds[data-create-open="1"] .sw2-wrap > :not(.sw2-modal){display:none!important}\n#createWorldSettingsRoot{position:absolute;inset:0;width:100%;height:100%;display:flex;overflow:hidden;background:rgba(58,58,58,.04);color:#fff;font-family:Arial,sans-serif;border:0;box-shadow:inset 1px 1px 0 rgba(255,255,255,.05),inset -1px -1px 0 rgba(0,0,0,.16)}
#createWorldSettingsTitle{display:none!important}\n#createWorldSettingsSidebar{width:315px;flex:0 0 315px;background:rgba(47,47,47,.04);border-right:2px solid #171717;display:flex;flex-direction:column;overflow:hidden}
#createWorldSettingsPreview{position:relative;width:calc(100% - 18px);height:145px;margin:9px 9px 9px;flex:0 0 145px;overflow:hidden;background:#5f7c91;border:2px solid #111;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
#createWorldSettingsPreviewCanvas{position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:auto}\n#createWorldSettingsPreview:before{content:"";position:absolute;inset:0;background:linear-gradient(154deg,transparent 0 44%,rgba(54,73,44,.92) 44% 62%,transparent 62%),linear-gradient(25deg,transparent 0 50%,rgba(76,91,57,.9) 50% 69%,transparent 69%);clip-path:polygon(0 66%,10% 53%,20% 63%,31% 41%,42% 58%,55% 37%,66% 56%,79% 46%,90% 60%,100% 49%,100% 100%,0 100%)}
#createWorldSettingsPreview:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 73% 21%,rgba(255,255,220,.58) 0 22px,transparent 23px),linear-gradient(180deg,transparent 0 63%,rgba(0,0,0,.18) 63% 100%)}
#createWorldSettingsPreviewLabel{position:absolute;left:8px;top:7px;z-index:2;padding:4px 6px;background:rgba(0,0,0,.62);font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px #000}
#createWorldSettingsCreateWrap{padding:9px;background:#2f2f2f;border-bottom:1px solid #171717}
#createWorldSettingsCreate{width:100%;min-height:44px;padding:9px 14px;border:2px solid #1d5c20;background:#39a83f;color:#fff;font-family:"MinecraftFont",monospace;font-size:14px;text-shadow:2px 2px #256a29;box-shadow:0 2px 0 #151515;cursor:pointer;border-radius:0}
#createWorldSettingsCreate:hover,#createWorldSettingsCreate:active{background:#39a83f;filter:none;transform:none}
#createWorldSettingsTabs{flex:1;overflow:auto;padding:7px 8px}
.createWorldSettingsTab{--tab-accent:#6ec8ff;--tab-accent-dark:#245f86;width:100%;min-height:44px;margin:4px 0;padding:8px 10px;text-align:left;display:flex;align-items:center;gap:10px;border:2px solid #1a1a1a;border-top-color:var(--tab-accent);border-left-color:var(--tab-accent);background:linear-gradient(180deg,#747474,#4e4e4e);color:#f4f4f4;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;border-radius:4px;text-shadow:1px 1px #222;box-shadow:inset 2px 2px 0 rgba(255,255,255,.1),inset -3px -4px 0 rgba(0,0,0,.24),0 4px 0 #151515;transition:transform .08s ease,filter .08s ease,box-shadow .08s ease,background .12s ease}
.createWorldSettingsTab:hover{background:linear-gradient(180deg,var(--tab-accent-dark),#4f4f4f);filter:brightness(1.06);transform:translateY(-1px)}
.createWorldSettingsTab:active{transform:translateY(2px);box-shadow:inset 2px 2px 0 rgba(0,0,0,.2),inset -2px -2px 0 rgba(255,255,255,.08),0 2px 0 #1c1c1c}
.createWorldSettingsTab.active{background:linear-gradient(180deg,var(--tab-accent-dark),#303030);color:#fff;border-color:var(--tab-accent);box-shadow:inset 4px 0 0 var(--tab-accent),inset 0 0 0 1px rgba(255,255,255,.08),0 4px 0 #151515}
.createWorldSettingsTabIcon{width:26px;height:26px;flex:0 0 26px;display:grid;place-items:center;background:var(--tab-accent);color:#162016;border:2px solid rgba(0,0,0,.65);border-top-color:rgba(255,255,255,.75);border-left-color:rgba(255,255,255,.75);box-shadow:inset 2px 2px 0 rgba(255,255,255,.18),inset -2px -2px 0 rgba(0,0,0,.25),0 2px 0 rgba(0,0,0,.4);font-family:Arial,sans-serif;font-weight:900;font-size:14px;line-height:1;text-shadow:none;border-radius:2px}
.createWorldSettingsTabLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.createWorldSettingsTab[data-cw-icon="general"]{--tab-accent:#5cc8ff;--tab-accent-dark:#1d7097}
.createWorldSettingsTab[data-cw-icon="advanced"]{--tab-accent:#b88cff;--tab-accent-dark:#65419a}
.createWorldSettingsTab[data-cw-icon="multiplayer"]{--tab-accent:#64e0c0;--tab-accent-dark:#267e6a}
.createWorldSettingsTab[data-cw-icon="cheats"]{--tab-accent:#ff806e;--tab-accent-dark:#9e3d31}
.createWorldSettingsTab[data-cw-icon="resources"]{--tab-accent:#7ed957;--tab-accent-dark:#3d7d29}
.createWorldSettingsTab[data-cw-icon="behavior"]{--tab-accent:#ffd65c;--tab-accent-dark:#98731c}
#createWorldSettingsTabs{background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,0,0,.12));border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(0,0,0,.35)}
#createWorldSettingsSidebarFooter{padding:8px 10px 10px;color:#999;background:#292929;font-size:9px;line-height:1.35;border-top:1px solid #171717}
#createWorldSettingsContent{min-width:0;flex:1;display:flex;flex-direction:column;background:rgba(66,66,66,.58)}
#createWorldSettingsHeader{height:56px;flex:0 0 56px;display:flex;align-items:center;padding:0 18px;background:#d0d0d0;border-bottom:2px solid #9a9a9a;box-shadow:0 2px 0 rgba(0,0,0,.25)}
#createWorldSettingsSectionTitle{margin:0;color:#fff;position:relative;font-family:"MinecraftFont",monospace;font-size:17px;text-shadow:2px 2px #000;letter-spacing:.3px}
#createWorldSettingsClose{margin-left:auto;width:34px;height:34px;padding:0;border:0!important;background:transparent!important;color:#fff;font-size:28px;cursor:pointer;border-radius:0;line-height:34px;box-shadow:none!important;text-shadow:2px 2px #222}
#createWorldSettingsClose:hover{background:transparent!important;color:#fff;filter:none!important;transform:none!important;box-shadow:none!important}
#createWorldSettingsScroll{flex:1;overflow:auto;padding:16px 20px 22px}
.createWorldSettingsPage{display:none;max-width:980px;margin:0 auto}
.createWorldSettingsPage.active{display:block}
.createWorldSettingsGroup{margin:0 auto 16px;max-width:1040px}
.createWorldSettingsGroupTitle{margin:0 0 8px;padding:0 0 7px 3px;border-bottom:2px solid #686868;font-family:"MinecraftFont",monospace;font-size:12px;color:#fff;text-shadow:1px 1px #111}
.createWorldSettingsRow{display:grid;grid-template-columns:minmax(0,1fr) 320px;align-items:center;gap:18px;min-height:62px;margin:6px 0;padding:10px 13px;background:linear-gradient(180deg,#595959,#505050);border:1px solid #292929;border-top-color:#747474;border-left-color:#747474;border-radius:0;box-shadow:none}
.createWorldSettingsRow label{display:block;margin-bottom:3px;color:#fff;font-size:12px;font-weight:700}
.createWorldSettingsRow small{display:block;color:#c0c0c0;font-size:9px;line-height:1.35}
.createWorldSettingsControl{display:flex;justify-content:flex-end;align-items:center}\n.createWorldSettingsSelect{width:320px;min-height:36px;box-sizing:border-box;padding:7px 9px;background:#aaa;color:#222;border:1px solid #171717;border-top-color:#777;border-left-color:#777;border-radius:0;outline:none;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer}\n.createWorldSettingsSelect:focus{border-color:#bdbdbd;box-shadow:none}\n
.createWorldSettingsInput{width:320px;min-height:36px;box-sizing:border-box;padding:7px 9px;background:#272727;color:#fff;border:1px solid #111;border-top-color:#777;border-left-color:#777;border-radius:0;outline:none}
.createWorldSettingsInput:focus{border-color:#8a8a8a;box-shadow:none}
.createWorldSettingsSeed{font-family:monospace;word-break:break-all}
.createWorldSettingsToggle{width:18px;height:18px;accent-color:#43b84f;cursor:pointer}
.createWorldSettingsMode{display:grid;grid-template-columns:1fr 1fr;width:320px;border:1px solid #161616}
.createWorldSettingsMode button,.createWorldSettingsDifficulty button{min-height:36px;border:2px solid #555;border-right-width:1px;border-top-color:#aaa;border-left-color:#aaa;background:linear-gradient(180deg,#aaa,#888);color:#222;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer;border-radius:2px;box-shadow:inset 2px 2px 0 rgba(255,255,255,.16),inset -2px -2px 0 rgba(0,0,0,.18),0 3px 0 #555;transition:transform .08s ease,filter .08s ease,box-shadow .08s ease}
.createWorldSettingsMode button:last-child,.createWorldSettingsDifficulty button:last-child{border-right:0}
.createWorldSettingsMode button.active,.createWorldSettingsDifficulty button.active{background:#8d8d8d;color:#fff}
.createWorldSettingsChoices{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:320px}
.createWorldSettingsChoice{min-height:76px!important;padding:8px 10px!important;display:flex;align-items:center;gap:10px;text-align:left!important;background:linear-gradient(180deg,#d7d7d7,#bcbcbc)!important;color:#222!important;border:2px solid #222!important;border-top-color:#f2f2f2!important;border-left-color:#f2f2f2!important;border-radius:4px!important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.28),inset -3px -4px 0 rgba(0,0,0,.18),0 4px 0 #151515!important}
.createWorldSettingsChoice:hover{background:linear-gradient(180deg,#e4e4e4,#c8c8c8)!important;transform:translateY(-1px)!important;filter:none!important}
.createWorldSettingsChoice.active{background:linear-gradient(180deg,#c9f0cb,#a8d7aa)!important;border-color:#1d6c2a!important;box-shadow:inset 4px 0 0 #39a83f,inset 2px 2px 0 rgba(255,255,255,.22),inset -3px -4px 0 rgba(0,0,0,.18),0 4px 0 #151515!important}
.createWorldSettingsChoiceIcon{width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;background:#9f9f9f;border:2px solid #222;border-top-color:#f1f1f1;border-left-color:#f1f1f1;font-family:Arial,sans-serif;font-weight:900;font-size:16px;box-shadow:inset 2px 2px 0 rgba(255,255,255,.16),inset -2px -2px 0 rgba(0,0,0,.2)}
.createWorldSettingsChoice.active .createWorldSettingsChoiceIcon{background:#55b95c;color:#fff;border-color:#1d5c20}
.createWorldSettingsChoice strong{display:block;font-family:"MinecraftFont",monospace;font-size:11px;line-height:1.1}
.createWorldSettingsChoice small{display:block;margin-top:4px;color:#555;font:700 8px/1.25 Arial,sans-serif}
.createWorldSettingsChoice.active small{color:#315f34}
#cwGameMode{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}

.createWorldSettingsDifficulty{display:grid;grid-template-columns:repeat(4,1fr);width:100%;max-width:600px;border:1px solid #161616}
.createWorldSettingsRange{width:100%;max-width:270px;accent-color:#8a8a8a;cursor:pointer}
.createWorldSettingsStatic{padding:8px 9px;background:#333;border:1px solid #111;color:#bbb;font-size:11px;line-height:1.45}
.createWorldSettingsPack{display:flex;align-items:center;gap:8px;min-height:34px;padding:7px 9px;margin:4px 0;background:#545454;border:1px solid #252525;border-top-color:#747474;border-left-color:#747474}
.createWorldSettingsPackName{font-family:"MinecraftFont",monospace;font-size:9px;color:#fff}
.createWorldSettingsPackState{margin-left:auto;color:#aaa;font-size:10px}
#createWorldSettingsActions{max-width:980px;margin:12px auto 0;display:flex;justify-content:flex-end;gap:10px}
.createWorldSettingsAction{min-width:135px;min-height:38px;padding:7px 12px;border:1px solid #222;background:#aaa;color:#222;font-family:"MinecraftFont",monospace;font-size:10px;cursor:pointer;text-shadow:none;border-radius:0;box-shadow:0 2px 0 #888}
.createWorldSettingsAction:hover{background:#aaa;filter:none;transform:none}
#createWorldSettingsCancel{background:linear-gradient(180deg,#8a8a8a,#666)}
#createWorldSettingsMessage{min-height:14px;margin:4px 0 0;color:#b7b7b7;font-size:11px;text-align:right}
@media(max-width:760px){
#createWorldSettingsSidebar{width:180px;flex-basis:180px}
#createWorldSettingsRoot{width:100%;height:100%;border:0;box-shadow:none;flex-direction:row}
#createWorldSettingsSidebar{width:100%;flex:0 0 auto;max-height:260px;border-right:0;border-bottom:2px solid #080808}
#createWorldSettingsPreview{height:105px;flex-basis:105px}
#createWorldSettingsCreateWrap{padding:9px}
#createWorldSettingsCreate{min-height:46px}
#createWorldSettingsTabs{display:flex;gap:6px;overflow-x:auto;padding:8px}
.createWorldSettingsTab{flex:0 0 132px;width:132px;min-height:40px;margin:0}
#createWorldSettingsSidebarFooter{display:none}
#createWorldSettingsHeader{height:58px;flex-basis:58px;padding:0 14px}
#createWorldSettingsSectionTitle{font-size:17px}
#createWorldSettingsClose{width:36px;height:36px}
#createWorldSettingsScroll{padding:16px 12px 22px}
.createWorldSettingsRow{grid-template-columns:1fr;gap:10px;padding:12px}
.createWorldSettingsControl{justify-content:flex-start}
.createWorldSettingsInput{width:100%}
.createWorldSettingsMode,.createWorldSettingsDifficulty{width:100%}
#createWorldSettingsActions{justify-content:stretch}
.createWorldSettingsAction{flex:1;min-width:0}
#createWorldSettingsMessage{text-align:left}
}
/* Create World visual correction v2 */
#createWorldSettingsPreview{
    position:relative!important;
    width:calc(100% - 18px)!important;
    height:145px!important;
    margin:9px 9px 8px!important;
    flex:0 0 145px!important;
    overflow:hidden!important;
    background:#111!important;
    border:3px solid #111!important;
    border-top-color:#a4a4a4!important;
    border-left-color:#a4a4a4!important;
    box-shadow:inset 3px 3px 0 rgba(255,255,255,.12),inset -4px -4px 0 rgba(0,0,0,.34),0 5px 0 #151515,0 9px 14px rgba(0,0,0,.24)!important;
}
#createWorldSettingsPreview:before,
#createWorldSettingsPreview:after{
    display:none!important;
}
#createWorldSettingsPreviewImg{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    display:block!important;
    object-fit:cover!important;
    object-position:center!important;
}
#createWorldSettingsCreateWrap{
    padding:8px 9px 10px!important;
    background:#2f2f2f!important;
}
#createWorldSettingsCreate{
    width:100%!important;
    min-height:50px!important;
    padding:10px 14px!important;
    border:2px solid #173b19!important;
    border-top-color:#91d395!important;
    border-left-color:#91d395!important;
    background:linear-gradient(180deg,#45bb4b,#2e8f37)!important;
    color:#fff!important;
    font-family:"MinecraftFont",monospace!important;
    font-size:14px!important;
    text-shadow:2px 2px #205d24!important;
    box-shadow:inset 3px 3px 0 rgba(255,255,255,.16),inset -4px -5px 0 rgba(0,0,0,.3),0 5px 0 #151515,0 8px 13px rgba(0,0,0,.22)!important;
    cursor:pointer!important;
    border-radius:3px!important;
    transition:transform .08s ease,filter .08s ease,box-shadow .08s ease!important;
}
#createWorldSettingsCreate:hover{
    filter:brightness(1.08)!important;
    transform:translateY(-1px)!important;
}
#createWorldSettingsCreate:active{
    transform:translateY(3px)!important;
    box-shadow:inset 3px 3px 0 rgba(0,0,0,.24),inset -2px -2px 0 rgba(255,255,255,.08),0 2px 0 #151515!important;
}
#createWorldSettingsRoot button{
    position:relative;
}
.createWorldSettingsTab,
.createWorldSettingsAction,
#createWorldSettingsClose,
.createWorldSettingsMode button,
.createWorldSettingsDifficulty button{
    border-top-color:#aaaaaa!important;
    border-left-color:#aaaaaa!important;
    border-right-color:#222222!important;
    border-bottom-color:#222222!important;
    border-width:2px!important;
    box-shadow:inset 3px 3px 0 rgba(255,255,255,.13),inset -4px -5px 0 rgba(0,0,0,.24),0 4px 0 #151515,0 7px 12px rgba(0,0,0,.16)!important;
}
.createWorldSettingsTab:hover,
.createWorldSettingsAction:hover,
#createWorldSettingsClose:hover,
.createWorldSettingsMode button:hover,
.createWorldSettingsDifficulty button:hover{
    filter:brightness(1.07)!important;
    transform:translateY(-1px)!important;
}
.createWorldSettingsTab:active,
.createWorldSettingsAction:active,
#createWorldSettingsClose:active,
.createWorldSettingsMode button:active,
.createWorldSettingsDifficulty button:active{
    transform:translateY(3px)!important;
    box-shadow:inset 3px 3px 0 rgba(0,0,0,.22),inset -2px -2px 0 rgba(255,255,255,.08),0 2px 0 #151515!important;
}
.createWorldSettingsTab.active{
    box-shadow:inset 3px 0 0 #eee,inset -4px -4px 0 rgba(0,0,0,.22),0 4px 0 #151515!important;
}
    `;
    document.head.appendChild(style);
}

function tabButton(label, page, icon, iconName) {
    return `<button class="createWorldSettingsTab${page === "game" ? " active" : ""}" type="button" data-cw-tab="${page}" data-cw-icon="${iconName}">
        <span class="createWorldSettingsTabIcon" aria-hidden="true">${icon}</span>
        <span class="createWorldSettingsTabLabel">${label}</span>
    </button>`;
}

function enhance(modal) {
    if (!modal || modal.getAttribute(MODAL_MARK) === "1") return;
    const nameField = modal.querySelector("[data-name]");
    const seedDisplay = modal.querySelector("[data-new-seed]");
    const message = modal.querySelector("[data-create-message]");
    const createButton = modal.querySelector('[data-act="create"]');
    const cancelButton = modal.querySelector('[data-act="cancel"]');
    if (!nameField || !seedDisplay || !message || !createButton || !cancelButton) return;

    modal.setAttribute(MODAL_MARK, "1");
    modal.style.cssText = "position:absolute;inset:0;display:none;background:rgba(0,0,0,.58);padding:0;z-index:20;box-sizing:border-box";
    modal.innerHTML = `
        <div id="createWorldSettingsRoot">
            <aside id="createWorldSettingsSidebar">
                <h2 id="createWorldSettingsTitle">CREATE NEW WORLD</h2>
                <div id="createWorldSettingsPreview"><img id="createWorldSettingsPreviewImg" src="./wrld%20preview.png" alt="World preview"><div id="createWorldSettingsPreviewLabel">World Preview</div></div>
                <div id="createWorldSettingsCreateWrap"><button id="createWorldSettingsCreate" class="createWorldSettingsAction" type="button">Create World</button></div>
                <p id="createWorldSettingsSub">Set up your world before you create it.</p>
                <nav id="createWorldSettingsTabs" aria-label="Create world sections">
                    ${tabButton("General", "game", "◆", "general")}
                    ${tabButton("Advanced", "world", "⚙", "advanced")}
                    ${tabButton("Multiplayer", "more", "●", "multiplayer")}
                    ${tabButton("Cheats", "more", "✦", "cheats")}
                    ${tabButton("Resource Packs", "more", "✚", "resources")}
                    ${tabButton("Behavior Packs", "more", "◇", "behavior")}
                </nav>
                <div id="createWorldSettingsSidebarFooter">World settings are saved with the world when it is created.</div>
            </aside>
            <section id="createWorldSettingsContent">
                <header id="createWorldSettingsHeader">
                    <h3 id="createWorldSettingsSectionTitle">General</h3>
                    <button id="createWorldSettingsClose" type="button" aria-label="Close create world">×</button>
                </header>
                <div id="createWorldSettingsScroll">
                    <section class="createWorldSettingsPage active" data-cw-page="game">
                        <div class="createWorldSettingsGroup">
                            <h4 class="createWorldSettingsGroupTitle">General</h4>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwWorldName">World Name</label><small>The name shown in your saved worlds list.</small></div>
                                <div class="createWorldSettingsControl"><input id="cwWorldName" class="createWorldSettingsInput" maxlength="40" autocomplete="off" placeholder="World name"></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwGameMode">Game Mode</label><small>Choose how you play in this world.</small></div>
                                <div class="createWorldSettingsControl">
    <div id="cwGameModeChoices" class="createWorldSettingsChoices" role="radiogroup" aria-label="Game Mode">
        <button type="button" class="createWorldSettingsChoice active" data-game-mode="survival" role="radio" aria-checked="true">
            <span class="createWorldSettingsChoiceIcon" aria-hidden="true">⚔</span>
            <span><strong>Survival</strong><small>Gather, craft, and survive.</small></span>
        </button>
        <button type="button" class="createWorldSettingsChoice" data-game-mode="creative" role="radio" aria-checked="false">
            <span class="createWorldSettingsChoiceIcon" aria-hidden="true">✦</span>
            <span><strong>Creative</strong><small>Build freely with unlimited resources.</small></span>
        </button>
    </div>
    <select id="cwGameMode" class="createWorldSettingsSelect" aria-hidden="true" tabindex="-1">
        <option value="survival">Survival</option>
        <option value="creative">Creative</option>
    </select>
</div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwDifficulty">Difficulty</label><small>Controls the world difficulty.</small></div>
                                <div class="createWorldSettingsControl"><select id="cwDifficulty" class="createWorldSettingsSelect"><option>Peaceful</option><option selected>Easy</option><option>Normal</option><option>Hard</option></select></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwSeed">World Seed</label><small>The seed used to generate the world.</small></div>
                                <div class="createWorldSettingsControl"><div id="cwSeed" class="createWorldSettingsInput createWorldSettingsSeed" data-new-seed></div></div>
                            </div>
                        </div>
                    </section>
                    <section class="createWorldSettingsPage" data-cw-page="world">
                        <div class="createWorldSettingsGroup">
                            <h4 class="createWorldSettingsGroupTitle">Terrain</h4>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwWorldType">World Type</label><small>Controls the base terrain style.</small></div>
                                <div class="createWorldSettingsControl"><select id="cwWorldType" class="createWorldSettingsSelect"><option selected>Default</option><option>Flat</option><option>Large Biomes</option></select></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwStructures">Generate Structures</label><small>Allow structures to generate in the world.</small></div>
                                <div class="createWorldSettingsControl"><input id="cwStructures" class="createWorldSettingsToggle" type="checkbox" checked></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label for="cwBonusChest">Bonus Chest</label><small>Start with a bonus chest near spawn.</small></div>
                                <div class="createWorldSettingsControl"><input id="cwBonusChest" class="createWorldSettingsToggle" type="checkbox"></div>
                            </div>
                        </div>
                    </section>
                    <section class="createWorldSettingsPage" data-cw-page="more">
                        <div class="createWorldSettingsGroup">
                            <h4 class="createWorldSettingsGroupTitle">Game Rules</h4>
                            <div class="createWorldSettingsRow">
                                <div><label>Keep Inventory</label><small>Keep inventory items after death.</small></div>
                                <div class="createWorldSettingsControl"><input class="createWorldSettingsToggle" type="checkbox"></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label>Daylight Cycle</label><small>Allow the time of day to continue changing.</small></div>
                                <div class="createWorldSettingsControl"><input class="createWorldSettingsToggle" type="checkbox" checked></div>
                            </div>
                            <div class="createWorldSettingsRow">
                                <div><label>Cheats</label><small>Enable command-style gameplay options.</small></div>
                                <div class="createWorldSettingsControl"><input class="createWorldSettingsToggle" type="checkbox"></div>
                            </div>
                        </div>
                    </section>
                    <div id="createWorldSettingsActions">
                        <button id="createWorldSettingsCancel" class="createWorldSettingsAction" type="button">Cancel</button>
                    </div>
                    <div id="createWorldSettingsMessage" aria-live="polite"></div>
                </div>
            </section>
        </div>
    `;

    const newNameField = modal.querySelector("#cwWorldName");
    const newSeedDisplay = modal.querySelector("#cwSeed");
    const newMessage = modal.querySelector("#createWorldSettingsMessage");
    const gameModeSelect = modal.querySelector("#cwGameMode");
    const gameModeChoices = [...modal.querySelectorAll("[data-game-mode]")];
    const syncGameModeChoices = () => {
        const mode = gameModeSelect?.value === "creative" ? "creative" : "survival";
        gameModeChoices.forEach(choice => {
            const active = choice.dataset.gameMode === mode;
            choice.classList.toggle("active", active);
            choice.setAttribute("aria-checked", active ? "true" : "false");
        });
    };
    gameModeChoices.forEach(choice => {
        choice.addEventListener("click", () => {
            if (!gameModeSelect) return;
            gameModeSelect.value = choice.dataset.gameMode === "creative" ? "creative" : "survival";
            syncGameModeChoices();
            applyCreateMode();
            newMessage.textContent = "";
        });
    });
    const renderWorldPreview = () => {};// Static preview image is used for the Create World screen.

    const hiddenCreate = document.createElement("button");
    hiddenCreate.type = "button";
    hiddenCreate.dataset.act = "create";
    hiddenCreate.style.display = "none";
    modal.appendChild(hiddenCreate);
    const hiddenCancel = document.createElement("button");
    hiddenCancel.type = "button";
    hiddenCancel.dataset.act = "cancel";
    hiddenCancel.style.display = "none";
    modal.appendChild(hiddenCancel);

    // Keep the selectors used by worldsV2.js attached to the new controls.
    newNameField.setAttribute("data-name", "");
    newSeedDisplay.setAttribute("data-new-seed", "");
    newMessage.setAttribute("data-create-message", "");

    createButton.remove();
    cancelButton.remove();

    const applyCreateMode = () => {
        const mode = gameModeSelect?.value === "creative" ? "creative" : "survival";
        window.webMinecraftSelectedWorldMode = mode;
        window.__webminecraftPendingSingleplayerMode = mode;
        try { localStorage.setItem("webminecraft-pending-singleplayer-mode", mode); } catch {}
        const seed = Number(newSeedDisplay?.textContent?.trim());
        if (Number.isFinite(seed)) setWorldMode(seed, mode);
        document.body.classList.toggle("webminecraft-survival", mode === "survival");
        document.body.classList.toggle("webminecraft-creative", mode === "creative");
        syncGameModeChoices();
    };

    gameModeSelect?.addEventListener("change", () => {
        syncGameModeChoices();
        applyCreateMode();
    });
    modal.querySelector("#cwWorldType")?.addEventListener("change", renderWorldPreview);
    applyCreateMode();

    modal.addEventListener("click", event => {
        const tab = event.target.closest("[data-cw-tab]");
        if (tab) {
            const page = tab.dataset.cwTab;
            modal.querySelectorAll("[data-cw-tab]").forEach(button => button.classList.toggle("active", button === tab));
            modal.querySelectorAll("[data-cw-page]").forEach(panel => panel.classList.toggle("active", panel.dataset.cwPage === page));
            const tabLabel = tab.querySelector(".createWorldSettingsTabLabel")?.textContent?.trim() || "";
            const titles = { game: "General", world: "Advanced", more: tabLabel || "Multiplayer" };
            modal.querySelector("#createWorldSettingsSectionTitle").textContent = titles[page] || "Game";
            return;
        }
        if (event.target.closest("#createWorldSettingsClose,#createWorldSettingsCancel")) {
            hiddenCancel.click();
            return;
        }
        if (event.target.closest("#createWorldSettingsCreate")) {
            applyCreateMode();
            hiddenCreate.click();
        }
    });

    newNameField.addEventListener("input", () => {
        nameField.value = newNameField.value;
        message.textContent = "";
    });
    newNameField.addEventListener("keydown", event => {
        event.stopPropagation();
        if (event.key === "Enter") {
            applyCreateMode();
            hiddenCreate.click();
        }
        if (event.key === "Escape") hiddenCancel.click();
    });

    // worldsV2.js writes the generated seed into [data-new-seed]. Mirror it to the visual seed field.
    const observer = new MutationObserver(() => {
        renderWorldPreview();
        applyCreateMode();
    });
    observer.observe(newSeedDisplay, { childList:true, characterData:true, subtree:true });


    // Keep the original hidden fields synchronized whenever the modal is opened/reused.
    const syncObserver = new MutationObserver(() => {
        newSeedDisplay.textContent = seedDisplay.textContent;
        newNameField.value = nameField.value;
        if (!newMessage.textContent) newMessage.textContent = message.textContent || "";
        renderWorldPreview();
        applyCreateMode();
    });
    syncObserver.observe(modal, { attributes:true, attributeFilter:["style"] });
}

function watchForCreateModal() {
    injectStyle();
    const find = () => document.querySelector("#savedWorlds .sw2-modal");
    const existing = find();
    if (existing) enhance(existing);
    const observer = new MutationObserver(() => {
        const modal = find();
        if (modal) enhance(modal);
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchForCreateModal, { once:true });
else watchForCreateModal();
