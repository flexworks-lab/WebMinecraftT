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
#savedWorlds[data-create-open="1"] .sw2-wrap > .sw2-head,#savedWorlds[data-create-open="1"] .sw2-wrap > .sw2-create-wrap,#savedWorlds[data-create-open="1"] .sw2-wrap > .sw2-body{display:none!important}\n#createWorldSettingsRoot{position:absolute;inset:0;width:100%;height:100%;display:flex;overflow:hidden;background:#3a3a3a;color:#fff;font-family:Arial,sans-serif;border:0;box-shadow:none}
#createWorldSettingsSidebar{width:260px;flex:0 0 260px;background:#2f2f2f;border-right:2px solid #171717;display:flex;flex-direction:column;overflow:hidden}
#createWorldSettingsPreview{position:relative;width:calc(100% - 16px);height:112px;margin:8px 8px 8px;flex:0 0 112px;overflow:hidden;background:linear-gradient(180deg,#88b6d1 0%,#d9ecf2 52%,#a4be7c 53%,#547247 100%);border:2px solid #111;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
#createWorldSettingsPreview:before{content:"";position:absolute;inset:0;background:linear-gradient(154deg,transparent 0 44%,rgba(54,73,44,.92) 44% 62%,transparent 62%),linear-gradient(25deg,transparent 0 50%,rgba(76,91,57,.9) 50% 69%,transparent 69%);clip-path:polygon(0 66%,10% 53%,20% 63%,31% 41%,42% 58%,55% 37%,66% 56%,79% 46%,90% 60%,100% 49%,100% 100%,0 100%)}
#createWorldSettingsPreview:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 73% 21%,rgba(255,255,220,.58) 0 22px,transparent 23px),linear-gradient(180deg,transparent 0 63%,rgba(0,0,0,.18) 63% 100%)}
#createWorldSettingsPreviewLabel{position:absolute;left:8px;top:7px;z-index:2;padding:4px 6px;background:rgba(0,0,0,.62);font-family:"MinecraftFont",monospace;font-size:10px;text-shadow:2px 2px #000}
#createWorldSettingsCreateWrap{padding:8px;background:#2f2f2f;border-bottom:1px solid #171717}
#createWorldSettingsCreate{width:100%;min-height:38px;padding:8px 12px;border:2px solid #1d5c20;background:#39a83f;color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;text-shadow:2px 2px #256a29;box-shadow:0 2px 0 #151515;cursor:pointer;border-radius:0}
#createWorldSettingsCreate:hover,#createWorldSettingsCreate:active{background:#39a83f;filter:none;transform:none}
#createWorldSettingsTabs{flex:1;overflow:auto;padding:3px 6px}
.createWorldSettingsTab{width:100%;min-height:30px;margin:1px 0;padding:6px 8px;text-align:left;border:1px solid #1a1a1a;background:#777;color:#eee;font-family:"MinecraftFont",monospace;font-size:10px;cursor:pointer;border-radius:0;text-shadow:1px 1px #333}
.createWorldSettingsTab:hover,.createWorldSettingsTab:active{background:#7e7e7e;filter:none;transform:none}
.createWorldSettingsTab.active{background:#999;color:#fff;border-color:#bdbdbd;box-shadow:inset 3px 0 0 #eee}\n.createWorldSettingsTab::before{content:"▣ ";color:#ddd}
#createWorldSettingsSidebarFooter{padding:8px 10px 10px;color:#999;background:#292929;font-size:9px;line-height:1.35;border-top:1px solid #171717}
#createWorldSettingsContent{min-width:0;flex:1;display:flex;flex-direction:column;background:#4a4a4a}
#createWorldSettingsHeader{height:42px;flex:0 0 42px;display:flex;align-items:center;padding:0 12px;background:#0d0d0d;border-bottom:2px solid #222}
#createWorldSettingsSectionTitle{margin:0;color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;text-shadow:2px 2px #000}
#createWorldSettingsClose{margin-left:auto;width:28px;height:28px;border:1px solid #555;background:#777;color:#fff;font-size:18px;cursor:pointer;border-radius:0;line-height:1}
#createWorldSettingsClose:hover{background:#aaa;filter:none}
#createWorldSettingsScroll{flex:1;overflow:auto;padding:10px 12px 16px}
.createWorldSettingsPage{display:none;max-width:980px;margin:0 auto}
.createWorldSettingsPage.active{display:block}
.createWorldSettingsGroup{margin:0 0 12px}
.createWorldSettingsGroupTitle{margin:0 0 6px;padding-bottom:4px;border-bottom:1px solid #777;font-family:"MinecraftFont",monospace;font-size:10px;color:#fff;text-shadow:1px 1px #111}
.createWorldSettingsRow{display:grid;grid-template-columns:minmax(0,1fr) 270px;align-items:center;gap:10px;min-height:48px;margin:4px 0;padding:7px 9px;background:#545454;border:1px solid #252525;border-top-color:#747474;border-left-color:#747474;border-radius:0;box-shadow:none}
.createWorldSettingsRow label{display:block;margin-bottom:3px;color:#fff;font-size:11px;font-weight:700}
.createWorldSettingsRow small{display:block;color:#c0c0c0;font-size:8px;line-height:1.3}
.createWorldSettingsControl{display:flex;justify-content:flex-end;align-items:center}
.createWorldSettingsInput{width:270px;min-height:31px;box-sizing:border-box;padding:6px 8px;background:#272727;color:#fff;border:1px solid #111;border-top-color:#777;border-left-color:#777;border-radius:0;outline:none}
.createWorldSettingsInput:focus{border-color:#8a8a8a;box-shadow:none}
.createWorldSettingsSeed{font-family:monospace;word-break:break-all}
.createWorldSettingsToggle{width:18px;height:18px;accent-color:#43b84f;cursor:pointer}
.createWorldSettingsMode{display:grid;grid-template-columns:1fr 1fr;width:270px;border:1px solid #161616}
.createWorldSettingsMode button,.createWorldSettingsDifficulty button{min-height:31px;border:0;border-right:1px solid #666;background:#aaa;color:#222;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer;border-radius:0}
.createWorldSettingsMode button:last-child,.createWorldSettingsDifficulty button:last-child{border-right:0}
.createWorldSettingsMode button.active,.createWorldSettingsDifficulty button.active{background:#8d8d8d;color:#fff}
.createWorldSettingsDifficulty{display:grid;grid-template-columns:repeat(4,1fr);width:100%;max-width:520px;border:1px solid #161616}
.createWorldSettingsRange{width:100%;max-width:270px;accent-color:#8a8a8a;cursor:pointer}
.createWorldSettingsStatic{padding:8px 9px;background:#333;border:1px solid #111;color:#bbb;font-size:11px;line-height:1.45}
.createWorldSettingsPack{display:flex;align-items:center;gap:8px;min-height:34px;padding:7px 9px;margin:4px 0;background:#545454;border:1px solid #252525;border-top-color:#747474;border-left-color:#747474}
.createWorldSettingsPackName{font-family:"MinecraftFont",monospace;font-size:9px;color:#fff}
.createWorldSettingsPackState{margin-left:auto;color:#aaa;font-size:10px}
#createWorldSettingsActions{max-width:980px;margin:12px auto 0;display:flex;justify-content:flex-end;gap:10px}
.createWorldSettingsAction{min-width:120px;min-height:34px;padding:7px 12px;border:1px solid #222;background:#aaa;color:#222;font-family:"MinecraftFont",monospace;font-size:10px;cursor:pointer;text-shadow:none;border-radius:0;box-shadow:0 2px 0 #888}
.createWorldSettingsAction:hover{background:#aaa;filter:none;transform:none}
#createWorldSettingsCancel{background:#aaa}
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
}`;
    document.head.appendChild(style);
}

function tabButton(label, page) {
    return `<button class="createWorldSettingsTab${page === "game" ? " active" : ""}" type="button" data-cw-tab="${page}">${label}</button>`;
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
                <div id="createWorldSettingsPreview"><div id="createWorldSettingsPreviewLabel">World Preview</div></div>
                <p id="createWorldSettingsSub">Set up your world before you create it.</p>
                <nav id="createWorldSettingsTabs" aria-label="Create world sections">
                    ${tabButton("General", "game")}
                    ${tabButton("Advanced", "world")}
                    ${tabButton("Multiplayer", "more")}
                    ${tabButton("Cheats", "more")}
                    ${tabButton("Resource Packs", "more")}
                    ${tabButton("Behavior Packs", "more")}
                </nav>
                <div id="createWorldSettingsSidebarFooter">World settings are saved with the world when it is created.</div>
            </aside>
            <section id="createWorldSettingsContent">
                <header id="createWorldSettingsHeader">
                    <h3 id="createWorldSettingsSectionTitle">Game</h3>
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
                                <div class="createWorldSettingsControl"><select id="cwGameMode" class="createWorldSettingsSelect"><option value="survival">Survival</option><option value="creative">Creative</option></select></div>
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
                        <button id="createWorldSettingsCreate" class="createWorldSettingsAction" type="button">Create World</button>
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
        const seed = Number(newSeedDisplay?.textContent?.trim());
        if (Number.isFinite(seed)) setWorldMode(seed, mode);
        document.body.classList.toggle("webminecraft-survival", mode === "survival");
        document.body.classList.toggle("webminecraft-creative", mode === "creative");
    };

    gameModeSelect?.addEventListener("change", applyCreateMode);
    applyCreateMode();

    modal.addEventListener("click", event => {
        const tab = event.target.closest("[data-cw-tab]");
        if (tab) {
            const page = tab.dataset.cwTab;
            modal.querySelectorAll("[data-cw-tab]").forEach(button => button.classList.toggle("active", button === tab));
            modal.querySelectorAll("[data-cw-page]").forEach(panel => panel.classList.toggle("active", panel.dataset.cwPage === page));
            const titles = { game: "General", world: "Advanced", more: tab.textContent.trim() || "Multiplayer" };
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
        newSeedDisplay.textContent = seedDisplay.textContent;
        applyCreateMode();
    });
    observer.observe(seedDisplay, { childList:true, characterData:true, subtree:true });

    // Keep the original hidden fields synchronized whenever the modal is opened/reused.
    const syncObserver = new MutationObserver(() => {
        newSeedDisplay.textContent = seedDisplay.textContent;
        newNameField.value = nameField.value;
        if (!newMessage.textContent) newMessage.textContent = message.textContent || "";
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
