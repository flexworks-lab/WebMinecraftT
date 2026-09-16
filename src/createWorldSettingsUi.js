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
#createWorldSettingsRoot{position:absolute;inset:0;display:flex;overflow:hidden;background:#1b1f1c;color:#fff;font-family:Arial,sans-serif}
#createWorldSettingsSidebar{width:280px;flex:0 0 280px;background:linear-gradient(180deg,#252b26,#181d19);border-right:2px solid #0a0d0b;padding:28px 18px 20px;display:flex;flex-direction:column;box-shadow:inset -1px 0 rgba(255,255,255,.05)}
#createWorldSettingsTitle{margin:0 10px 7px;font-family:"MinecraftFont",monospace;font-size:28px;text-shadow:2px 2px #000}
#createWorldSettingsSub{margin:0 10px 24px;color:#999;font-size:12px;line-height:1.45}
.createWorldSettingsTab{position:relative;width:100%;min-height:52px;margin:4px 0;padding:11px 13px;text-align:left;border:2px solid #101310;border-top-color:#777;border-left-color:#777;border-radius:5px;background:linear-gradient(180deg,#3e443f,#303530);color:#eee;font-family:"MinecraftFont",monospace;font-size:14px;cursor:pointer;text-shadow:2px 2px #111;transition:transform .1s ease,filter .1s ease,background .1s ease}
.createWorldSettingsTab:hover{transform:translateX(3px);filter:brightness(1.08)}
.createWorldSettingsTab.active{background:linear-gradient(180deg,#71885e,#536941);box-shadow:inset 2px 2px rgba(255,255,255,.1),0 3px #101410}
#createWorldSettingsSidebarFooter{margin-top:auto;padding:12px 10px 8px;color:#676d68;font-size:11px;line-height:1.4}
#createWorldSettingsContent{min-width:0;flex:1;display:flex;flex-direction:column;background:radial-gradient(circle at 55% 10%,rgba(127,174,90,.09),transparent 34%),linear-gradient(180deg,#292f2a,#1d211e)}
#createWorldSettingsHeader{height:82px;flex:0 0 82px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;background:#303630;border-bottom:2px solid #0d100e}
#createWorldSettingsSectionTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:21px;text-shadow:2px 2px #000}
#createWorldSettingsClose{width:44px;height:44px;border:2px solid #111;border-top-color:#8a8a8a;border-left-color:#8a8a8a;background:#565b56;color:#fff;font-size:22px;cursor:pointer;border-radius:5px;line-height:1}
#createWorldSettingsClose:hover{filter:brightness(1.1)}
#createWorldSettingsScroll{flex:1;overflow:auto;padding:26px 30px 36px}
.createWorldSettingsPage{display:none;max-width:980px;margin:0 auto}
.createWorldSettingsPage.active{display:block}
.createWorldSettingsGroup{margin:0 0 26px}
.createWorldSettingsGroupTitle{margin:0 0 10px;padding-bottom:9px;border-bottom:2px solid #111;font-family:"MinecraftFont",monospace;font-size:14px;color:#ddd;text-shadow:2px 2px #000}
.createWorldSettingsRow{display:grid;grid-template-columns:minmax(0,1fr) 230px;align-items:center;gap:22px;min-height:78px;margin:8px 0;padding:14px 16px;border:2px solid #111;border-top-color:#555;border-left-color:#555;border-radius:6px;background:linear-gradient(180deg,#373c37,#2c312d)}
.createWorldSettingsRow label{display:block;margin-bottom:5px;color:#f2f2f2;font-size:16px;font-weight:700}
.createWorldSettingsRow small{display:block;color:#9a9f9b;font-size:12px;line-height:1.35}
.createWorldSettingsControl{display:flex;justify-content:flex-end;align-items:center}
.createWorldSettingsInput,.createWorldSettingsSelect{width:230px;min-height:44px;padding:9px 11px;background:#171a18;color:#fff;border:2px solid #111;border-top-color:#777;border-left-color:#777;border-radius:4px;outline:none}
.createWorldSettingsInput:focus,.createWorldSettingsSelect:focus{border-color:#86aa62;box-shadow:0 0 0 2px rgba(134,170,98,.16)}
.createWorldSettingsSeed{font-family:monospace;word-break:break-all}
.createWorldSettingsToggle{width:24px;height:24px;accent-color:#84ad5e;cursor:pointer}
#createWorldSettingsActions{max-width:980px;margin:5px auto 0;display:flex;justify-content:flex-end;gap:10px}
.createWorldSettingsAction{min-width:160px;min-height:48px;padding:11px 18px;border:2px solid #111;border-top-color:#8c8c8c;border-left-color:#8c8c8c;border-radius:5px;background:linear-gradient(#686d68,#505550);color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px #222}
.createWorldSettingsAction:hover{filter:brightness(1.08)}
#createWorldSettingsCreate{background:linear-gradient(#789a58,#567640)}
#createWorldSettingsMessage{min-height:20px;margin:7px 0 0;color:#9bc47c;font-size:12px;text-align:right}
@media(max-width:760px){
#createWorldSettingsRoot{flex-direction:column}
#createWorldSettingsSidebar{width:100%;flex:0 0 auto;height:auto;padding:14px 12px 10px;border-right:0;border-bottom:2px solid #0a0d0b}
#createWorldSettingsTitle{margin:0 8px 3px;font-size:23px}
#createWorldSettingsSub{display:none}
#createWorldSettingsTabs{display:flex;gap:6px;overflow-x:auto}
.createWorldSettingsTab{flex:0 0 auto;width:auto;min-height:42px;margin:0;padding:8px 12px;font-size:12px}
#createWorldSettingsSidebarFooter{display:none}
#createWorldSettingsHeader{height:64px;flex-basis:64px;padding:0 14px}
#createWorldSettingsSectionTitle{font-size:17px}
#createWorldSettingsClose{width:38px;height:38px;font-size:19px}
#createWorldSettingsScroll{padding:18px 12px 24px}
.createWorldSettingsRow{grid-template-columns:1fr;gap:12px;padding:13px}
.createWorldSettingsControl{justify-content:flex-start}
.createWorldSettingsInput,.createWorldSettingsSelect{width:100%}
#createWorldSettingsActions{justify-content:stretch}
.createWorldSettingsAction{flex:1;min-width:0}
#createWorldSettingsMessage{text-align:left}
}
`;
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
