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
#createWorldSettingsRoot{position:absolute;inset:0;display:flex;overflow:hidden;background:#171717;color:#fff;font-family:Arial,sans-serif}
#createWorldSettingsSidebar{width:292px;flex:0 0 292px;background:#202020;border-right:2px solid #080808;display:flex;flex-direction:column;overflow:hidden}
#createWorldSettingsPreview{position:relative;width:100%;height:188px;flex:0 0 188px;overflow:hidden;background:linear-gradient(180deg,#7ba4bf 0%,#bcd4df 52%,#8aa66a 53%,#44603a 100%);border-bottom:2px solid #080808}
#createWorldSettingsPreview:before{content:"";position:absolute;inset:0;background:linear-gradient(154deg,transparent 0 44%,rgba(54,73,44,.92) 44% 62%,transparent 62%),linear-gradient(25deg,transparent 0 50%,rgba(76,91,57,.9) 50% 69%,transparent 69%);clip-path:polygon(0 66%,10% 53%,20% 63%,31% 41%,42% 58%,55% 37%,66% 56%,79% 46%,90% 60%,100% 49%,100% 100%,0 100%)}
#createWorldSettingsPreview:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 73% 21%,rgba(255,255,220,.58) 0 22px,transparent 23px),linear-gradient(180deg,transparent 0 63%,rgba(0,0,0,.18) 63% 100%)}
#createWorldSettingsPreviewLabel{position:absolute;left:14px;top:13px;z-index:2;padding:6px 9px;background:rgba(0,0,0,.58);font-family:"MinecraftFont",monospace;font-size:12px;text-shadow:2px 2px #000}
#createWorldSettingsCreateWrap{padding:12px;background:#202020;border-bottom:2px solid #080808}
#createWorldSettingsCreate{width:100%;min-height:50px;padding:11px 18px;border:2px solid #173b18;background:#35b747;color:#fff;font-family:"MinecraftFont",monospace;font-size:15px;text-shadow:2px 2px #145f1c;box-shadow:inset 0 2px 0 rgba(255,255,255,.18),0 3px 0 #071407;cursor:pointer;border-radius:0}
#createWorldSettingsCreate:hover,#createWorldSettingsCreate:active{background:#35b747;filter:none;transform:none}
#createWorldSettingsTabs{flex:1;overflow:auto;padding:10px}
.createWorldSettingsTab{width:100%;min-height:46px;margin:3px 0;padding:10px 13px;text-align:left;border:0;background:#2d2d2d;color:#ddd;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;border-radius:0;text-shadow:2px 2px #111}
.createWorldSettingsTab:hover,.createWorldSettingsTab:active{background:#2d2d2d;filter:none;transform:none}
.createWorldSettingsTab.active{background:#4a4a4a;color:#fff}
#createWorldSettingsSidebarFooter{padding:10px 14px 13px;color:#7c7c7c;background:#191919;font-size:10px;line-height:1.4;border-top:1px solid #080808}
#createWorldSettingsContent{min-width:0;flex:1;display:flex;flex-direction:column;background:#1b1b1b}
#createWorldSettingsHeader{height:70px;flex:0 0 70px;display:flex;align-items:center;padding:0 24px;background:#000;border-bottom:2px solid #070707}
#createWorldSettingsSectionTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:21px;text-shadow:2px 2px #000}
#createWorldSettingsClose{margin-left:auto;width:42px;height:42px;border:2px solid #101010;background:#333;color:#fff;font-size:22px;cursor:pointer;border-radius:0;line-height:1}
#createWorldSettingsClose:hover{background:#333;filter:none}
#createWorldSettingsScroll{flex:1;overflow:auto;padding:22px 26px 34px}
.createWorldSettingsPage{display:none;max-width:980px;margin:0 auto}
.createWorldSettingsPage.active{display:block}
.createWorldSettingsGroup{margin:0 0 22px}
.createWorldSettingsGroupTitle{margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid #090909;font-family:"MinecraftFont",monospace;font-size:13px;color:#ccc;text-shadow:2px 2px #000}
.createWorldSettingsRow{display:grid;grid-template-columns:minmax(0,1fr) 270px;align-items:center;gap:18px;min-height:68px;margin:7px 0;padding:12px 14px;background:#292929;border:2px solid #111;border-top-color:#545454;border-left-color:#545454;border-radius:0}
.createWorldSettingsRow label{display:block;margin-bottom:4px;color:#f2f2f2;font-size:14px;font-weight:700}
.createWorldSettingsRow small{display:block;color:#959595;font-size:11px;line-height:1.35}
.createWorldSettingsControl{display:flex;justify-content:flex-end;align-items:center}
.createWorldSettingsInput{width:270px;min-height:42px;box-sizing:border-box;padding:9px 11px;background:#121212;color:#fff;border:2px solid #090909;border-top-color:#666;border-left-color:#666;border-radius:0;outline:none}
.createWorldSettingsInput:focus{border-color:#8a8a8a;box-shadow:none}
.createWorldSettingsSeed{font-family:monospace;word-break:break-all}
.createWorldSettingsToggle{width:24px;height:24px;accent-color:#43b84f;cursor:pointer}
.createWorldSettingsMode{display:grid;grid-template-columns:1fr 1fr;width:270px;border:2px solid #0a0a0a}
.createWorldSettingsMode button,.createWorldSettingsDifficulty button{min-height:42px;border:0;border-right:1px solid #141414;background:#353535;color:#d2d2d2;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer;border-radius:0}
.createWorldSettingsMode button:last-child,.createWorldSettingsDifficulty button:last-child{border-right:0}
.createWorldSettingsMode button.active,.createWorldSettingsDifficulty button.active{background:#555;color:#fff}
.createWorldSettingsDifficulty{display:grid;grid-template-columns:repeat(4,1fr);width:100%;max-width:520px;border:2px solid #0a0a0a}
.createWorldSettingsRange{width:100%;max-width:270px;accent-color:#8a8a8a;cursor:pointer}
.createWorldSettingsStatic{padding:11px 12px;background:#171717;border:2px solid #090909;color:#a4a4a4;font-size:11px;line-height:1.45}
.createWorldSettingsPack{display:flex;align-items:center;gap:10px;min-height:48px;padding:10px 12px;margin:6px 0;background:#292929;border:2px solid #111;border-top-color:#545454;border-left-color:#545454}
.createWorldSettingsPackName{font-family:"MinecraftFont",monospace;font-size:11px}
.createWorldSettingsPackState{margin-left:auto;color:#8f8f8f;font-size:10px}
#createWorldSettingsActions{max-width:980px;margin:12px auto 0;display:flex;justify-content:flex-end;gap:10px}
.createWorldSettingsAction{min-width:140px;min-height:46px;padding:10px 16px;border:2px solid #111;background:#3e3e3e;color:#fff;font-family:"MinecraftFont",monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px #222;border-radius:0}
.createWorldSettingsAction:hover{background:#3e3e3e;filter:none;transform:none}
#createWorldSettingsCancel{background:#3e3e3e}
#createWorldSettingsMessage{min-height:18px;margin:7px 0 0;color:#9bc47c;font-size:11px;text-align:right}
@media(max-width:760px){
#createWorldSettingsRoot{flex-direction:column}
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
    modal.style.cssText = "position:absolute;inset:0;display:none;background:#0000;padding:0;z-index:20";
    modal.innerHTML = `
        <div id="createWorldSettingsRoot">
            <aside id="createWorldSettingsSidebar">
                <h2 id="createWorldSettingsTitle">Create New World</h2>
                <p id="createWorldSettingsSub">Set up your world before you create it.</p>
                <nav id="createWorldSettingsTabs" aria-label="Create world sections">
                    ${tabButton("Game", "game")}
                    ${tabButton("World", "world")}
                    ${tabButton("More", "more")}
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
            const titles = { game: "Game", world: "World", more: "More" };
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
