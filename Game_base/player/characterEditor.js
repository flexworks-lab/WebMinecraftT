import * as THREE from "three";
import {
  AVATAR_TEXTURE_PARTS,
  createAvatar,
  applyAvatarTextureData
} from "../multiplayer/multiplayerAvatars.js";
import { sendCharacterSkin } from "../multiplayer/multiplayerClient.js";
import { getCharacterAppearanceId, readCharacterTextureRecord, writeCharacterTextureRecord } from "./appearanceIdentity.js";

const STORAGE_KEY = "webminecraft-procedural-character-textures-v1";
const PALETTE = [
  "#171717", "#f4f4f4", "#c98d62", "#8b5a3c", "#f0c7a0", "#3974bd",
  "#4b8051", "#a94d42", "#d1a43c", "#303947", "#70472c", "#79b5c9",
  "#553e80", "#777777", "#b9b9b9", "#ffffff"
];
const TEXTURE_SIZE = 16;

function getIdentity() {
  let user = null;
  try { user = window.firebase?.auth?.()?.currentUser || null; } catch {}
  const username = String(
    user?.uid && user?.isAnonymous !== true
      ? (localStorage.getItem("webminecraft-account-username") || user.displayName || "Player")
      : (sessionStorage.getItem("webminecraft-guest-name") ||
         localStorage.getItem("webminecraft-player-name") || "Player")
  ).trim().slice(0, 16) || "Player";
  const appearanceId = getCharacterAppearanceId();
  return { id: appearanceId, appearanceId, name: username };
}

function readRosterTextureStore() {
  try {
    const record = JSON.parse(localStorage.getItem(ROSTER_STORAGE_KEY) || "null");
    if (!record || Number(record.version) !== 1 || !Array.isArray(record.slots)) return { slots: [{}, {}, {}, {}, {}] };
    return { slots: Array.from({ length: 5 }, (_, index) =>
      record.slots[index] && typeof record.slots[index] === "object" ? record.slots[index] : {}
    ) };
  } catch {
    return { slots: [{}, {}, {}, {}, {}] };
  }
}
function writeRosterTextureStore() {
  try {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify({ version: 1, slots: rosterTextureStore.slots }));
    return true;
  } catch (error) {
    console.warn("Could not save character presets in this browser.", error);
    return false;
  }
}
function readSavedTextures() {
  return readCharacterTextureRecord()?.textures || null;
}

function getTextureCanvas(textures, key) {
  return textures?.[key]?.userData?.canvas || null;
}

function snapshotTextures(textures) {
  const snapshots = {};
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = getTextureCanvas(textures, key);
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (context) snapshots[key] = context.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  }
  return snapshots;
}

const style = document.createElement("style");
style.textContent = `
#characterEditor{position:fixed;inset:0;z-index:500;display:none;overflow:hidden;background:radial-gradient(ellipse at 58% 42%,rgba(18,27,42,.82),rgba(4,6,11,.96) 58%,#020307 100%);color:#f5f7fb;font-family:Arial,sans-serif}
#characterEditor.open{display:block}#characterEditor *{box-sizing:border-box}
#characterEditorShell{width:100%;height:100%;height:100dvh;display:flex;min-width:0;background:linear-gradient(115deg,rgba(20,28,42,.18),transparent 45%)}
#characterEditorSidebar{position:relative;z-index:5;flex:0 0 68px;width:68px;display:flex;flex-direction:column;gap:9px;padding:18px 9px;background:rgba(5,8,14,.94);border-right:1px solid rgba(160,180,210,.18);overflow:hidden;transition:width .2s ease,flex-basis .2s ease}
#characterEditorSidebar:hover,#characterEditorSidebar:focus-within{width:212px;flex-basis:212px}
#characterEditorBrand{height:42px;flex:0 0 42px;display:flex;align-items:center;gap:13px;padding:0 8px 12px;color:#fff;border-bottom:1px solid rgba(180,195,220,.16);font-size:12px;font-weight:800;letter-spacing:1.2px;white-space:nowrap}
#characterEditorBrand>span{opacity:0;transition:opacity .12s ease}#characterEditorSidebar:hover #characterEditorBrand>span,#characterEditorSidebar:focus-within #characterEditorBrand>span{opacity:1}
#characterEditorBrandMark{width:30px;height:30px;flex:0 0 30px;display:grid;place-items:center;background:#202d42;border:1px solid #536783;color:#dce9ff;font-size:17px}
.characterNavButton{height:46px;min-height:46px;width:100%;display:flex;align-items:center;gap:15px;padding:0 10px;border:1px solid transparent;background:transparent;color:#aab5c6;text-align:left;white-space:nowrap;font-size:12px;font-weight:700;cursor:pointer}
.characterNavButton svg{width:24px;height:24px;flex:0 0 24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.characterNavButton span{opacity:0;transition:opacity .12s ease}
#characterEditorSidebar:hover .characterNavButton span,#characterEditorSidebar:focus-within .characterNavButton span{opacity:1}
.characterNavButton:hover,.characterNavButton.active{background:#182438;border-color:#334965;color:#fff}
#characterSidebarSpacer{flex:1}
#characterClose{width:100%;height:42px;border:1px solid #45546a;background:#131b29;color:#fff;font-size:22px;cursor:pointer}
#characterEditorMain{position:relative;display:flex;flex:1;min-width:0;min-height:0;flex-direction:column}
#characterEditorTopbar{height:62px;min-height:62px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 28px;border-bottom:1px solid rgba(160,180,210,.16);background:rgba(4,7,12,.52)}
#characterEditorTopbarTitle{font-size:13px;font-weight:800;letter-spacing:2px;color:#f0f4fb}
#characterEditorTopbarSub{margin-top:4px;color:#8996aa;font-size:11px}
#characterEditorStatus{padding:7px 10px;border:1px solid #34465f;background:#111b2a;color:#b8d7ff;font-size:10px;font-weight:700;letter-spacing:.7px}
.characterEditorPage{flex:1;min-height:0;min-width:0;overflow:auto}
.characterEditorPage[hidden]{display:none!important}
#characterRosterPage{display:flex;flex-direction:column;align-items:stretch;padding:clamp(18px,3vh,34px) clamp(18px,3vw,44px) 18px}
#characterRosterIntro{text-align:center;flex:0 0 auto}
#characterRosterIntro h1{margin:0;color:#fff;font-size:clamp(22px,3vw,36px);font-weight:800;letter-spacing:1.2px}
#characterRosterIntro p{max-width:720px;margin:9px auto 0;color:#9ca9bb;font-size:13px;line-height:1.55}
#characterRosterStage{position:relative;flex:1 1 auto;min-height:330px;height:58vh;max-height:680px;margin:10px 0 0;overflow:hidden}
#characterRosterStage>canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:pan-y}
#characterRosterCards{position:absolute;inset:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-items:end;padding:0 5.2% 12px;pointer-events:none}
.rosterCard{height:100%;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;pointer-events:none}
.rosterCardNumber{padding:4px 9px;border:1px solid rgba(150,170,200,.35);background:rgba(5,9,16,.68);color:#aab9cf;font-size:11px;font-weight:800;letter-spacing:1px}
.rosterCardName{min-height:14px;color:#c3cede;font-size:10px;font-weight:800;letter-spacing:1px;text-align:center}
.rosterCard.isCenter .rosterCardNumber{border-color:#8bb7ed;background:#203653;color:#fff}
.rosterCard.isCenter .rosterCardName{color:#fff}
.rosterEditButton{width:min(108px,90%);height:36px;border:1px solid #607b9d;border-top-color:#9eb5d0;background:linear-gradient(#3c587b,#263b58);color:#fff;font-size:11px;font-weight:800;letter-spacing:1px;cursor:pointer;pointer-events:auto}
.rosterEditButton:hover{filter:brightness(1.18)}
.rosterArrow{position:absolute;top:47%;z-index:2;width:42px;height:54px;border:1px solid #455975;background:rgba(7,12,20,.86);color:#e5efff;font-size:32px;line-height:1;cursor:pointer}
.rosterArrow:hover{background:#1c2c42;border-color:#8ba8ce}
#rosterPrev{left:0}#rosterNext{right:0}
#characterRosterInstructions{flex:0 0 auto;max-width:900px;margin:4px auto 0;padding:12px 18px;border:1px solid rgba(130,155,190,.18);background:rgba(8,13,22,.6);color:#98a7bc;font-size:11px;line-height:1.6;text-align:center}
#characterRosterInstructions strong{color:#e5edf9}
#characterPaintPage{display:flex;flex-direction:column;overflow:hidden}
#characterPaintHeader{height:48px;min-height:48px;display:flex;align-items:center;gap:12px;padding:0 20px;border-bottom:1px solid rgba(160,180,210,.15);background:rgba(7,11,18,.8)}
#characterBackRoster{height:30px;padding:0 12px;border:1px solid #3d506b;background:#162235;color:#dbe8f8;font-size:11px;font-weight:700;cursor:pointer}
#characterEditingName{color:#fff;font-size:12px;font-weight:800;letter-spacing:1px}
#characterEditorWorkspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,420px);flex:1;min-height:0;overflow:hidden}
#characterEditorPreview{position:relative;min-width:0;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 50% 45%,rgba(28,39,57,.44),rgba(3,5,9,.96) 72%),#05070b}
#characterEditorPreview>canvas{width:100%;height:100%;display:block}
#characterEditorHint{position:absolute;left:18px;bottom:14px;padding:7px 10px;background:rgba(4,8,14,.72);border:1px solid rgba(145,165,195,.25);color:#aebbd0;font-size:10px;letter-spacing:.7px;text-transform:uppercase;pointer-events:none}
#characterEditorControls{padding:20px 18px 28px;overflow:auto;background:rgba(7,11,18,.96);border-left:1px solid rgba(150,170,200,.16)}
#characterEditorTitle{margin:0 0 5px;font-size:21px;letter-spacing:.7px}
#characterEditorSub{color:#9eabc0;font-size:12px;line-height:1.55;margin:0 0 12px}
.characterLabel{display:block;margin:13px 0 7px;color:#d2dceb;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
#avatarTextureList{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.avatarTextureChoice{min-width:0;padding:6px 3px 5px;border:1px solid #26364d;background:#121d2d;color:#e4ecf8;font-size:10px;font-weight:700;cursor:pointer}
.avatarTextureChoice.active{outline:2px solid #8cb6ec;outline-offset:1px;background:#243a56}
.avatarTextureChoice canvas{display:block;width:38px;height:38px;margin:0 auto 5px;image-rendering:pixelated;background-color:#777}
#skinCanvasWrap{width:min(100%,330px);aspect-ratio:1;background-color:#ddd;background-image:linear-gradient(45deg,#aaa 25%,transparent 25%),linear-gradient(-45deg,#aaa 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#aaa 75%),linear-gradient(-45deg,transparent 75%,#aaa 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0;border:2px solid #50617b;touch-action:none}
#skinCanvas{display:block;width:100%;height:100%;image-rendering:pixelated;cursor:crosshair;touch-action:none}
#skinTools{display:flex;gap:6px;flex-wrap:wrap}
.skinTool{min-height:30px;padding:0 9px;border:1px solid #283b56;background:#1c2c42;color:#fff;font-weight:700;font-size:10px;cursor:pointer}
.skinTool.active{outline:2px solid #9bbce7;outline-offset:1px;background:#344e70}
#skinPalette{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}
.skinColor{aspect-ratio:1;border:2px solid #111;outline:1px solid #62748d;cursor:pointer;min-width:0}
.skinColor[aria-pressed=true]{outline:3px solid white;outline-offset:1px}
#skinColorRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:#b9c6d8}
#skinCustomColor{width:38px;height:28px;padding:0;border:1px solid #647994;background:transparent;cursor:pointer}
#skinBrushSize{background:#101a28;color:#fff;border:1px solid #526680;padding:5px}
#characterActions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:15px}
.characterAction{min-height:38px;border:1px solid #425775;background:#263a55;color:white;font-weight:700;font-size:10px;cursor:pointer}
.characterAction.primary{background:#52733f;border-color:#78985c}
#characterHelpPage{padding:clamp(20px,4vw,52px);overflow:auto}
#characterHelpPanel{max-width:850px;margin:0 auto;padding:clamp(20px,4vw,40px);border:1px solid rgba(145,170,205,.25);background:rgba(8,13,22,.72)}
#characterHelpPanel h1{margin:0 0 10px;font-size:26px;color:#fff}
#characterHelpPanel p,#characterHelpPanel li{color:#aab8cb;font-size:13px;line-height:1.7}
#characterHelpPanel strong{color:#eff5ff}
#characterClose{height:34px;width:40px;border:1px solid #45546a;background:#131b29;color:#fff;font-size:22px;cursor:pointer}
#characterShowcase{position:fixed;left:calc(50% + 216px);right:auto;top:50%;bottom:auto;transform:translateY(4%);z-index:84;width:148px;height:210px;display:flex;flex-direction:column;overflow:visible;background:transparent;border:0;box-shadow:none;color:#fff;pointer-events:auto}
#characterShowcase[hidden]{display:none!important}
#characterShowcaseTitle{display:none!important}
#characterShowcasePreview{position:relative;flex:1 1 auto;min-height:0;overflow:visible;background:transparent;touch-action:pan-y}
#characterShowcasePreview>canvas{display:block;width:100%;height:100%;touch-action:pan-y;background:transparent}
#characterEditorOpen{width:100%;height:30px;flex:0 0 30px;margin:0;padding:0 4px;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#747474,#555);color:#fff;font:11px MinecraftFont,monospace;text-shadow:2px 2px 0 #222;cursor:pointer;box-shadow:2px 2px 0 #0008}
#characterEditorOpen:active{filter:brightness(.86)}
body.webminecraft-in-world #characterShowcase{display:none!important}
body:not(.webminecraft-in-world) #mainMenu{align-items:center!important}
body:not(.webminecraft-in-world) #mainMenu #menuPanel{width:min(760px,96vw)!important;margin:0 auto!important}
body:not(.webminecraft-in-world) #mainMenu #menuButtons{margin:0 auto!important;transform:translateY(26px)!important}
@media(max-width:1360px){#characterShowcase{left:calc(50% + 212px);width:138px;height:196px}}
@media(max-width:900px){
 #characterEditorSidebar{flex-basis:56px;width:56px;padding:12px 6px}
 #characterEditorSidebar:hover,#characterEditorSidebar:focus-within{width:184px;flex-basis:184px}
 #characterEditorTopbar{padding:0 12px}
 #characterRosterPage{padding:16px 10px}
 #characterRosterStage{height:54vh;min-height:290px}
 #characterRosterCards{padding-left:7%;padding-right:7%}
 .rosterArrow{width:34px;height:46px;font-size:27px}
 #characterRosterInstructions{font-size:10px;padding:9px}
 #characterEditorWorkspace{grid-template-columns:minmax(0,1fr) minmax(300px,38vw)}
 #characterEditorControls{padding:14px 12px}
 #skinCanvasWrap{width:min(100%,260px)}
}
@media(max-width:760px){
 body:not(.webminecraft-in-world) #mainMenu #menuPanel{width:min(420px,calc(100vw - 128px))!important;max-width:420px!important}
 body:not(.webminecraft-in-world) #mainMenu #menuButtons{transform:translateY(18px)!important}
 body:not(.webminecraft-in-world) #mainMenu #menuButtons .menuButton{height:clamp(38px,6.2vh,46px)!important;margin:6px auto!important;padding:5px 3px!important;font-size:clamp(10px,2.9vw,13px)!important}
 #menuTitle{font-size:clamp(22px,6.4vw,38px)!important;letter-spacing:-1px!important;-webkit-text-stroke:1.5px #111!important}
 #menuSubtitle{font-size:8px!important;line-height:1.25!important;margin:6px 0 8px!important}
 #characterShowcase{left:auto;right:10px;top:50%;bottom:auto;transform:translateY(8%);width:112px;height:160px}
 #characterEditorOpen{height:28px;flex-basis:28px;font-size:10px}
 #characterEditorTopbar{height:54px;min-height:54px}
 #characterEditorTopbarSub{display:none}
 #characterEditorStatus{font-size:9px;padding:5px}
 #characterRosterIntro p{font-size:11px}
 #characterRosterStage{height:50vh;min-height:260px}
 #characterRosterCards{padding-left:5%;padding-right:5%}
 .rosterCardNumber{font-size:9px;padding:3px 5px}
 .rosterCardName{font-size:8px}
 .rosterEditButton{height:30px;font-size:9px}
 .rosterArrow{width:27px;height:40px;font-size:23px}
 #characterEditorWorkspace{grid-template-columns:1fr;grid-template-rows:minmax(180px,36vh) minmax(0,1fr);overflow:auto}
 #characterEditorControls{border-left:0;border-top:1px solid rgba(150,170,200,.16)}
 #characterEditorPreview{min-height:180px}
 #characterPaintPage{overflow:auto}
 #characterEditorControls{overflow:visible}
 #characterEditorSidebar:hover,#characterEditorSidebar:focus-within{width:172px;flex-basis:172px}
}
@media(max-width:520px){
 #characterShowcase{right:8px;width:102px;height:146px}
}
`;
document.head.appendChild(style);

const overlay = document.createElement("section");
overlay.id = "characterEditor";
overlay.setAttribute("aria-label", "Procedural character texture editor");
overlay.innerHTML = `
<div id="characterEditorShell">
  <aside id="characterEditorSidebar" aria-label="Character studio navigation">
    <div id="characterEditorBrand"><b id="characterEditorBrandMark">✦</b><span>CHARACTER STUDIO</span></div>
    <button class="characterNavButton active" type="button" data-editor-page="roster" title="Characters">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 20c.4-4 2.2-6 5.5-6s5.2 2 5.5 6M14 15c3.8-1.2 6.8.7 7.5 4.5"/></svg><span>Characters</span>
    </button>
    <button class="characterNavButton" type="button" data-editor-page="paint" title="Texture editor">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16 10-10 4 4L8 20H4z"/><path d="m12 8 4 4M4 20l4-1M17 3l4 4"/></svg><span>Texture editor</span>
    </button>
    <button class="characterNavButton" type="button" data-editor-page="guide" title="Instructions">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-1.2 1.1-1.9 1.4-1.9 3M12 17.5h.01"/></svg><span>Instructions</span>
    </button>
    <div id="characterSidebarSpacer"></div>
    <button id="characterClose" type="button" aria-label="Close character studio" title="Close">×</button>
  </aside>
  <main id="characterEditorMain">
    <header id="characterEditorTopbar">
      <div><div id="characterEditorTopbarTitle">CHARACTER SELECT</div><div id="characterEditorTopbarSub">Browse your five character slots and choose one to edit.</div></div>
      <div id="characterEditorStatus">ROSTER READY</div>
    </header>
    <section id="characterRosterPage" class="characterEditorPage">
      <div id="characterRosterIntro"><h1>CHOOSE YOUR CHARACTER</h1><p>Move through the lineup with the arrows. Each character has its own texture maps and an Edit button.</p></div>
      <div id="characterRosterStage">
        <button class="rosterArrow" id="rosterPrev" type="button" aria-label="Move previous character to center">‹</button>
        <div id="characterRosterCards">
          <div class="rosterCard" data-roster-position="0"><div class="rosterCardNumber">01</div><div class="rosterCardName"></div><button class="rosterEditButton" type="button">EDIT</button></div>
          <div class="rosterCard" data-roster-position="1"><div class="rosterCardNumber">02</div><div class="rosterCardName"></div><button class="rosterEditButton" type="button">EDIT</button></div>
          <div class="rosterCard" data-roster-position="2"><div class="rosterCardNumber">03</div><div class="rosterCardName"></div><button class="rosterEditButton" type="button">EDIT</button></div>
          <div class="rosterCard" data-roster-position="3"><div class="rosterCardNumber">04</div><div class="rosterCardName"></div><button class="rosterEditButton" type="button">EDIT</button></div>
          <div class="rosterCard" data-roster-position="4"><div class="rosterCardNumber">05</div><div class="rosterCardName"></div><button class="rosterEditButton" type="button">EDIT</button></div>
        </div>
        <button class="rosterArrow" id="rosterNext" type="button" aria-label="Move next character to center">›</button>
      </div>
      <div id="characterRosterInstructions"><strong>How the lineup works:</strong> The center character is highlighted. Press an arrow to slide the next character into the center. Choose <strong>EDIT</strong> under any character to paint its face, skin, shirt, pants, or shoes. Slot 3 is your live in-game character; the other four are browser-saved presets.</div>
    </section>
    <section id="characterPaintPage" class="characterEditorPage" hidden>
      <div id="characterPaintHeader"><button id="characterBackRoster" type="button">← BACK TO LINEUP</button><span id="characterEditingName">EDITING CHARACTER 3</span></div>
      <div id="characterEditorWorkspace">
        <div id="characterEditorPreview"><div id="characterEditorHint">Paint a map on the right · Changes preview on the model</div></div>
        <div id="characterEditorControls">
          <h2 id="characterEditorTitle">TEXTURE EDITOR</h2>
          <p id="characterEditorSub">Pick a map, choose a colour, then paint directly onto the 16 × 16 pixels. Your character model and proportions stay the same.</p>
          <span class="characterLabel">Choose a texture map</span>
          <div id="avatarTextureList"></div>
          <span class="characterLabel" id="activeTextureLabel">Face · 16 × 16</span>
          <div id="skinCanvasWrap"><canvas id="skinCanvas" width="16" height="16"></canvas></div>
          <span class="characterLabel">Paint tools</span>
          <div id="skinTools">
            <button class="skinTool active" type="button" data-tool="paint">PAINT</button>
            <button class="skinTool" type="button" data-tool="erase">ERASER</button>
            <button class="skinTool" type="button" data-tool="pick">PICK COLOR</button>
            <button class="skinTool" type="button" id="skinUndo">UNDO</button>
            <button class="skinTool" type="button" id="skinGrid" aria-pressed="true">PIXEL GRID: ON</button>
          </div>
          <div id="skinColorRow">Brush
            <select id="skinBrushSize" aria-label="Brush size">
              <option value="1">1 px</option><option value="2">2 px</option>
              <option value="3">3 px</option><option value="4">4 px</option>
            </select>
            <label for="skinCustomColor">Custom</label><input id="skinCustomColor" type="color" value="#3974bd">
          </div>
          <span class="characterLabel">Color palette</span><div id="skinPalette"></div>
          <div id="characterActions">
            <button class="characterAction" id="skinImport" type="button">IMPORT MAP PNG</button>
            <button class="characterAction" id="skinExport" type="button">EXPORT MAP PNG</button>
            <button class="characterAction" id="characterReset" type="button">RESET GENERATED TEXTURES</button>
            <button class="characterAction primary" id="characterSave" type="button">SAVE CHARACTER</button>
          </div>
          <input id="skinFileInput" type="file" accept="image/png,image/webp,image/jpeg" hidden>
        </div>
      </div>
    </section>
    <section id="characterHelpPage" class="characterEditorPage" hidden>
      <div id="characterHelpPanel">
        <h1>CHARACTER STUDIO GUIDE</h1>
        <p><strong>Browse the roster:</strong> There are five slots arranged from left to right. Use the arrows outside the lineup. The neighbour on that side slides into the center and the rest of the lineup shifts with it.</p>
        <p><strong>Edit a character:</strong> Press the EDIT button below a character. The texture editor opens for that exact slot. Use the left sidebar to return to Characters, open the Texture editor, or view these instructions.</p>
        <p><strong>Paint textures:</strong> Choose Face, Head Back, Head Side, Head Top, Skin, Shirt, Pants, or Shoes. Select a palette colour or use Custom. PAINT adds pixels, ERASER removes them, PICK COLOR samples a pixel, and UNDO reverses your last stroke.</p>
        <p><strong>Save rules:</strong> Slot 3 is the character used in your game and online rooms. Saving slot 3 also updates your browser and account profile when available. Slots 1, 2, 4, and 5 are separate presets saved in this browser only; they do not replace your online character.</p>
        <p><strong>Import and export:</strong> PNG files are resized to 16 × 16 pixels for the selected texture map. Export each map separately to keep a backup.</p>
        <p><strong>Tips:</strong> The 3D character follows your mouse anywhere on the screen. You can drag across the preview to rotate the whole model. Press ESC to close the studio or Ctrl+Z to undo a paint stroke.</p>
      </div>
    </section>
  </main>
</div>`;
document.body.appendChild(overlay);

const skinCanvas = overlay.querySelector("#skinCanvas");
const skinCtx = skinCanvas.getContext("2d", { willReadFrequently: true, alpha: true });
skinCtx.imageSmoothingEnabled = false;
const textureList = overlay.querySelector("#avatarTextureList");
const palette = overlay.querySelector("#skinPalette");
const brushSelect = overlay.querySelector("#skinBrushSize");
const gridButton = overlay.querySelector("#skinGrid");
const customColorInput = overlay.querySelector("#skinCustomColor");
const fileInput = overlay.querySelector("#skinFileInput");
const canvasWrap = overlay.querySelector("#skinCanvasWrap");

let scene;
let camera;
let renderer;
let previewAvatar;
let currentTextures = {};
let baseSnapshots = {};
let savedTextureData = readSavedTextures() || {};
let dirtyTextureKeys = new Set();
let resetOverridesPending = false;
let currentIdentity = "";
let selectedTextureKey = "face";
let selectedColor = PALETTE[5];
const ROSTER_STORAGE_KEY = "webminecraft-character-roster-v1";
const MAIN_PROFILE_SLOT = 2;
let rosterAvatars = [];
let rosterBuildPromise = null;
let rosterOrder = [0, 1, 2, 3, 4];
let selectedRosterSlot = MAIN_PROFILE_SLOT;
let editorPage = "roster";
let rosterTextureStore = readRosterTextureStore();
let headLookX = 0;
let headLookY = 0;
let tool = "paint";
let brushSize = 1;
let painting = false;
let lastPixel = null;
let strokeSnapshot = null;
let undoStack = [];
let avatarYaw = -0.22;
let dragging = false;
let lastX = 0;
let livePreviewFrame = 0;
let onlineSkinSyncTimer = null;

function getCurrentTextureOverrides() {
  const textures = resetOverridesPending ? {} : { ...savedTextureData };
  for (const key of dirtyTextureKeys) {
    const canvas = textureCanvas(key);
    if (canvas) textures[key] = canvas.toDataURL("image/png");
  }
  return textures;
}
function scheduleLivePreview() {
  if (selectedRosterSlot !== MAIN_PROFILE_SLOT || livePreviewFrame) return;
  const textures = currentTextures;
  livePreviewFrame = requestAnimationFrame(() => {
    livePreviewFrame = 0;
    if (selectedRosterSlot !== MAIN_PROFILE_SLOT) return;
    window.dispatchEvent(new CustomEvent("webminecraft:character-live-preview", { detail: { textures } }));
  });
}
function scheduleOnlineSkinSync() {
  if (selectedRosterSlot !== MAIN_PROFILE_SLOT) return;
  if (onlineSkinSyncTimer) clearTimeout(onlineSkinSyncTimer);
  onlineSkinSyncTimer = window.setTimeout(() => {
    onlineSkinSyncTimer = null;
    if (selectedRosterSlot !== MAIN_PROFILE_SLOT) return;
    const textures = getCurrentTextureOverrides();
    sendCharacterSkin(Object.keys(textures).length ? textures : null);
  }, 320);
}

function setSelectedColor(color) {
  selectedColor = color;
  customColorInput.value = color;
  for (const button of palette.children) {
    button.setAttribute("aria-pressed", String(button.dataset.color === selectedColor));
  }
}
for (const color of PALETTE) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "skinColor";
  button.dataset.color = color;
  button.style.background = color;
  button.title = color;
  button.setAttribute("aria-label", `Select ${color}`);
  button.setAttribute("aria-pressed", String(color === selectedColor));
  button.addEventListener("click", () => setSelectedColor(color));
  palette.appendChild(button);
}
customColorInput.addEventListener("input", event => setSelectedColor(event.target.value));
brushSelect.addEventListener("change", () => { brushSize = Number(brushSelect.value) || 1; });

function textureCanvas(key) {
  return getTextureCanvas(currentTextures, key);
}
function refreshTextureButtons() {
  for (const button of textureList.children) {
    const key = button.dataset.textureKey;
    const thumb = button.querySelector("canvas");
    const source = textureCanvas(key);
    if (thumb && source) {
      const ctx = thumb.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 16, 16);
      ctx.drawImage(source, 0, 0, 16, 16);
    }
    button.classList.toggle("active", key === selectedTextureKey);
  }
}
function copySelectedTextureToEditor() {
  const source = textureCanvas(selectedTextureKey);
  if (!source) return;
  skinCtx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  skinCtx.drawImage(source, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  skinCtx.imageSmoothingEnabled = false;
  const descriptor = AVATAR_TEXTURE_PARTS.find(part => part.key === selectedTextureKey);
  overlay.querySelector("#activeTextureLabel").textContent = `${descriptor?.label || selectedTextureKey} · 16 × 16`;
  refreshTextureButtons();
}
function pushEditorIntoTexture() {
  const target = textureCanvas(selectedTextureKey);
  const texture = currentTextures[selectedTextureKey];
  if (!target || !texture) return;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(skinCanvas, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  texture.needsUpdate = true;
  refreshTextureButtons();
  scheduleLivePreview();
}
function chooseTexture(key) {
  pushEditorIntoTexture();
  selectedTextureKey = key;
  undoStack = [];
  copySelectedTextureToEditor();
}
for (const { key, label } of AVATAR_TEXTURE_PARTS) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "avatarTextureChoice";
  button.dataset.textureKey = key;
  button.innerHTML = `<canvas width="16" height="16" aria-hidden="true"></canvas><span>${label}</span>`;
  button.addEventListener("click", () => chooseTexture(key));
  textureList.appendChild(button);
}

function makeScene() {
  scene = new THREE.Scene();
  scene.background = null;
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 2.55, 8.1);
  camera.lookAt(0, 1.05, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  overlay.querySelector("#characterEditorPreview").prepend(renderer.domElement);
  const previewCanvas = renderer.domElement;
  previewCanvas.style.touchAction = "pan-y";
  previewCanvas.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    previewCanvas.setPointerCapture(event.pointerId);
  });
  previewCanvas.addEventListener("pointermove", event => {
    if (!dragging || !previewAvatar) return;
    avatarYaw += (event.clientX - lastX) * 0.012;
    lastX = event.clientX;
    previewAvatar.group.rotation.y = avatarYaw;
  });
  const stopDragging = () => { dragging = false; };
  previewCanvas.addEventListener("pointerup", stopDragging);
  previewCanvas.addEventListener("pointercancel", stopDragging);
  window.addEventListener("pointermove", event => {
    const rect = renderer.domElement.getBoundingClientRect();
    const anchorX = rect.width > 0 ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const anchorY = rect.height > 0 ? rect.top + rect.height * 0.43 : window.innerHeight / 2;
    const spanX = Math.max(window.innerWidth * 0.42, rect.width * 0.55, 1);
    const spanY = Math.max(window.innerHeight * 0.42, rect.height * 0.7, 1);
    headLookX = THREE.MathUtils.clamp((event.clientX - anchorX) / spanX, -1, 1);
    headLookY = THREE.MathUtils.clamp((event.clientY - anchorY) / spanY, -1, 1);
  }, { passive: true });
  scene.add(new THREE.HemisphereLight("#e9f4ff", "#6b5946", 1.8));
  const key = new THREE.DirectionalLight("#fff1d8", 2.1);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight("#9bbfff", 1);
  rim.position.set(-4, 4, -3);
  scene.add(rim);
}

function disposePreviewAvatar(avatar) {
  if (!avatar?.group) return;
  scene.remove(avatar.group);
  const materials = new Set();
  avatar.group.traverse(object => {
    object.geometry?.dispose?.();
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material) continue;
      if (material.map) material.map.dispose?.();
      materials.add(material);
    }
  });
  for (const material of materials) material.dispose?.();
}

function updateRosterCards() {
  overlay.querySelectorAll(".rosterCard").forEach((card, position) => {
    const slot = rosterOrder[position];
    card.dataset.slot = String(slot);
    card.classList.toggle("isCenter", position === 2);
    card.querySelector(".rosterCardNumber").textContent = String(slot + 1).padStart(2, "0");
    card.querySelector(".rosterCardName").textContent = slot === MAIN_PROFILE_SLOT ? "MAIN CHARACTER" : "PRESET " + (slot + 1);
    const edit = card.querySelector(".rosterEditButton");
    edit.dataset.slot = String(slot);
    edit.setAttribute("aria-label", "Edit character slot " + (slot + 1));
  });
}

function applyRosterLayout() {
  rosterAvatars.forEach(entry => {
    const position = rosterOrder.indexOf(entry.slotIndex);
    entry.targetX = (position - 2) * 2.95;
    entry.targetScale = position === 2 ? 1.16 : 0.88;
    entry.group.visible = editorPage === "roster";
  });
  updateRosterCards();
}

function rememberActiveEditorState() {
  if (!previewAvatar) return;
  previewAvatar.savedTextureData = { ...savedTextureData };
  previewAvatar.dirtyTextureKeys = new Set(dirtyTextureKeys);
  previewAvatar.resetOverridesPending = resetOverridesPending;
}

function activateRosterSlot(slot) {
  const entry = rosterAvatars[slot];
  if (!entry) return;
  if (previewAvatar && previewAvatar.slotIndex !== slot) {
    pushEditorIntoTexture();
    rememberActiveEditorState();
  }
  selectedRosterSlot = slot;
  previewAvatar = entry;
  currentTextures = entry.textures;
  savedTextureData = { ...(entry.savedTextureData || {}) };
  dirtyTextureKeys = new Set(entry.dirtyTextureKeys || []);
  resetOverridesPending = Boolean(entry.resetOverridesPending);
  baseSnapshots = entry.baseSnapshots || {};
  avatarYaw = entry.group.rotation.y || 0;
  undoStack = [];
  copySelectedTextureToEditor();
  overlay.querySelector("#characterEditingName").textContent = "EDITING CHARACTER " + (slot + 1) + (slot === MAIN_PROFILE_SLOT ? " · MAIN" : " · PRESET");
  updateRosterCards();
}

function moveRoster(direction) {
  if (editorPage !== "roster") return;
  const current = rosterOrder.slice();
  rosterOrder = direction > 0
    ? [current[1], current[2], current[3], current[4], current[0]]
    : [current[4], current[0], current[1], current[2], current[3]];
  activateRosterSlot(rosterOrder[2]);
  applyRosterLayout();
}

function setEditorPage(page) {
  if (page === "paint" && !previewAvatar) activateRosterSlot(MAIN_PROFILE_SLOT);
  if (page === "roster" && previewAvatar && previewAvatar.slotIndex !== rosterOrder[2]) activateRosterSlot(rosterOrder[2]);
  editorPage = page;
  overlay.querySelector("#characterRosterPage").hidden = page !== "roster";
  overlay.querySelector("#characterPaintPage").hidden = page !== "paint";
  overlay.querySelector("#characterHelpPage").hidden = page !== "guide";
  overlay.querySelectorAll("[data-editor-page]").forEach(button => button.classList.toggle("active", button.dataset.editorPage === page));
  const title = overlay.querySelector("#characterEditorTopbarTitle");
  const sub = overlay.querySelector("#characterEditorTopbarSub");
  const status = overlay.querySelector("#characterEditorStatus");
  if (page === "roster") {
    title.textContent = "CHARACTER SELECT";
    sub.textContent = "Browse your five character slots and choose one to edit.";
    status.textContent = "5 CHARACTER SLOTS";
    const host = overlay.querySelector("#characterRosterStage");
    if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
    renderer.domElement.style.display = "block";
    applyRosterLayout();
    rosterAvatars.forEach(entry => { entry.group.visible = true; });
    camera.position.set(0, 2.65, 15.2);
    camera.lookAt(0, 1.02, 0);
  } else if (page === "paint") {
    title.textContent = "TEXTURE EDITOR";
    sub.textContent = "Paint directly onto the generated texture maps.";
    status.textContent = "EDITING SLOT " + (selectedRosterSlot + 1);
    const host = overlay.querySelector("#characterEditorPreview");
    if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
    renderer.domElement.style.display = "block";
    rosterAvatars.forEach(entry => {
      entry.group.visible = entry.slotIndex === selectedRosterSlot;
      if (entry.slotIndex === selectedRosterSlot) {
        entry.group.position.set(0, 0, 0);
        entry.group.scale.setScalar(1.12);
      }
    });
    camera.position.set(3.1, 2.55, 7.6);
    camera.lookAt(0, 1.12, 0);
    copySelectedTextureToEditor();
  } else {
    title.textContent = "CHARACTER GUIDE";
    sub.textContent = "Learn how the lineup and texture tools work.";
    status.textContent = "HELP";
    rosterAvatars.forEach(entry => { entry.group.visible = false; });
  }
  resize();
}

async function buildPreview(force = false) {
  const identity = getIdentity();
  const key = identity.id;
  if (!force && rosterAvatars.length === 5 && currentIdentity === key) return;
  if (rosterBuildPromise) return rosterBuildPromise;

  const buildTask = (async () => {
    rosterAvatars.forEach(disposePreviewAvatar);
    rosterAvatars = [];
    previewAvatar = null;
    currentIdentity = key;
    const mainTextures = readSavedTextures() || {};
    rosterTextureStore = readRosterTextureStore();
    for (let slot = 0; slot < 5; slot++) {
      const appearanceId = slot === MAIN_PROFILE_SLOT ? identity.appearanceId : identity.appearanceId + "-preset-" + (slot + 1);
      const avatarId = identity.id + "-roster-" + (slot + 1);
      const avatarName = slot === MAIN_PROFILE_SLOT ? identity.name : "Character " + (slot + 1);
      const avatar = createAvatar(avatarId, avatarName, null, appearanceId);
      avatar.group.traverse(object => { if (object.isSprite) object.visible = false; });
      avatar.group.rotation.y = slot === MAIN_PROFILE_SLOT ? avatarYaw : 0;
      avatar.group.position.set((slot - 2) * 2.95, 0, 0);
      avatar.group.scale.setScalar(slot === MAIN_PROFILE_SLOT ? 1.16 : 0.88);
      avatar.group.visible = slot === MAIN_PROFILE_SLOT;
      scene.add(avatar.group);
      await avatar.textureReady;
      const base = snapshotTextures(avatar.textures);
      const stored = slot === MAIN_PROFILE_SLOT ? mainTextures : (rosterTextureStore.slots[slot] || {});
      if (Object.keys(stored).length) await applyAvatarTextureData(avatar.textures, stored);
      rosterAvatars[slot] = {
        ...avatar,
        slotIndex: slot,
        baseSnapshots: base,
        savedTextureData: { ...stored },
        dirtyTextureKeys: new Set(),
        resetOverridesPending: false,
        targetX: (slot - 2) * 2.95,
        targetScale: slot === MAIN_PROFILE_SLOT ? 1.16 : 0.88
      };
    }
    currentIdentity = key;
    activateRosterSlot(MAIN_PROFILE_SLOT);
    rosterAvatars.forEach(entry => { entry.group.visible = entry.slotIndex === MAIN_PROFILE_SLOT; });
    updateRosterCards();
    scheduleLivePreview();
  })();
  rosterBuildPromise = buildTask;
  try {
    await buildTask;
  } finally {
    if (rosterBuildPromise === buildTask) rosterBuildPromise = null;
  }
}

function pixelFromEvent(event) {
  const rect = skinCanvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(15, Math.floor((event.clientX - rect.left) / rect.width * 16))),
    y: Math.max(0, Math.min(15, Math.floor((event.clientY - rect.top) / rect.height * 16)))
  };
}
function pushUndoSnapshot() {
  strokeSnapshot = {
    key: selectedTextureKey,
    image: skinCtx.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
  };
}
function applyBrush(x, y) {
  if (tool === "pick") {
    const pixel = skinCtx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, "0")).join("");
      setSelectedColor(hex);
    }
    tool = "paint";
    overlay.querySelectorAll("[data-tool]").forEach(button => button.classList.toggle("active", button.dataset.tool === "paint"));
    skinCanvas.style.cursor = "crosshair";
    return;
  }
  const start = Math.floor((brushSize - 1) / 2);
  const left = Math.max(0, Math.min(16 - brushSize, x - start));
  const top = Math.max(0, Math.min(16 - brushSize, y - start));
  if (tool === "erase") skinCtx.clearRect(left, top, brushSize, brushSize);
  else {
    skinCtx.fillStyle = selectedColor;
    skinCtx.fillRect(left, top, brushSize, brushSize);
  }
  dirtyTextureKeys.add(selectedTextureKey);
  pushEditorIntoTexture();
}
function paintLine(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i++) {
    applyBrush(
      Math.round(from.x + dx * i / steps),
      Math.round(from.y + dy * i / steps)
    );
  }
}
skinCanvas.addEventListener("pointerdown", event => {
  if (tool === "pick") {
    const p = pixelFromEvent(event);
    applyBrush(p.x, p.y);
    return;
  }
  painting = true;
  skinCanvas.setPointerCapture(event.pointerId);
  pushUndoSnapshot();
  lastPixel = pixelFromEvent(event);
  applyBrush(lastPixel.x, lastPixel.y);
});
skinCanvas.addEventListener("pointermove", event => {
  if (!painting || !lastPixel) return;
  const next = pixelFromEvent(event);
  paintLine(lastPixel, next);
  lastPixel = next;
});
function finishStroke() {
  if (painting && strokeSnapshot) {
    undoStack.push(strokeSnapshot);
    if (undoStack.length > 40) undoStack.shift();
    strokeSnapshot = null;
    scheduleLivePreview();
    scheduleOnlineSkinSync();
  }
  painting = false;
  lastPixel = null;
}
skinCanvas.addEventListener("pointerup", finishStroke);
skinCanvas.addEventListener("pointercancel", finishStroke);

function undo() {
  pushEditorIntoTexture();
  const previous = undoStack.pop();
  if (!previous) return;
  if (previous.key !== selectedTextureKey) {
    selectedTextureKey = previous.key;
    copySelectedTextureToEditor();
  }
  skinCtx.putImageData(previous.image, 0, 0);
  pushEditorIntoTexture();
  scheduleLivePreview();
  scheduleOnlineSkinSync();
}
overlay.querySelector("#skinUndo").addEventListener("click", undo);
overlay.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => {
  tool = button.dataset.tool;
  overlay.querySelectorAll("[data-tool]").forEach(item => item.classList.toggle("active", item === button));
  skinCanvas.style.cursor = tool === "pick" ? "copy" : tool === "erase" ? "cell" : "crosshair";
}));
gridButton.addEventListener("click", () => {
  const on = gridButton.getAttribute("aria-pressed") !== "true";
  gridButton.setAttribute("aria-pressed", String(on));
  gridButton.textContent = `PIXEL GRID: ${on ? "ON" : "OFF"}`;
  skinCanvas.style.imageRendering = on ? "pixelated" : "auto";
  canvasWrap.style.borderColor = on ? "#888" : "#555";
});

function resize() {
  if (!renderer || !camera) return;
  const host = renderer.domElement.parentElement;
  if (!host) return;
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
async function show() {
  overlay.classList.add("open");
  await buildPreview();
  activateRosterSlot(rosterOrder[2] ?? MAIN_PROFILE_SLOT);
  setEditorPage("roster");
  resize();
}
function close() {
  rememberActiveEditorState();
  overlay.classList.remove("open");
  editorPage = "roster";
  activateRosterSlot(MAIN_PROFILE_SLOT);
  rosterAvatars.forEach(entry => {
    entry.group.visible = entry.slotIndex === MAIN_PROFILE_SLOT;
    if (entry.slotIndex === MAIN_PROFILE_SLOT) {
      entry.group.position.set(0, 0, 0);
      entry.group.scale.setScalar(1.16);
    }
  });
  const showcaseHost = document.getElementById("characterShowcasePreview");
  if (showcaseHost && renderer?.domElement.parentElement !== showcaseHost) showcaseHost.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  camera.position.set(0, 2.55, 8.1);
  camera.lookAt(0, 1.1, 0);
  resize();
}

function resetTextures() {
  pushEditorIntoTexture();
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = textureCanvas(key);
    const image = baseSnapshots[key];
    if (!canvas || !image) continue;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.putImageData(image, 0, 0);
    currentTextures[key].needsUpdate = true;
  }
  savedTextureData = {};
  dirtyTextureKeys.clear();
  resetOverridesPending = true;
  undoStack = [];
  copySelectedTextureToEditor();
  refreshTextureButtons();
  scheduleLivePreview();
  scheduleOnlineSkinSync();
}
async function saveTextures() {
  pushEditorIntoTexture();
  if (!resetOverridesPending && dirtyTextureKeys.size === 0) {
    const button = overlay.querySelector("#characterSave");
    button.textContent = "ALREADY SAVED";
    window.setTimeout(() => { button.textContent = "SAVE CHARACTER"; }, 1200);
    return;
  }
  const textures = resetOverridesPending ? {} : { ...savedTextureData };
  for (const key of dirtyTextureKeys) {
    const canvas = textureCanvas(key);
    if (canvas) textures[key] = canvas.toDataURL("image/png");
  }
  const savedAt = Date.now();
  if (selectedRosterSlot === MAIN_PROFILE_SLOT) {
    if (!writeCharacterTextureRecord(textures, savedAt)) {
      alert("Unable to save these textures in this browser. Try exporting the individual maps instead.");
      return;
    }
    sendCharacterSkin(Object.keys(textures).length ? textures : null);
    window.dispatchEvent(new CustomEvent("webminecraft:character-changed", { detail: { textures } }));
  }
  rosterTextureStore.slots[selectedRosterSlot] = textures;
  if (!writeRosterTextureStore()) {
    alert("Unable to save this character preset in this browser. Free some browser storage and try again.");
    return;
  }
  savedTextureData = textures;
  dirtyTextureKeys.clear();
  resetOverridesPending = false;
  rememberActiveEditorState();
  if (previewAvatar) {
    previewAvatar.savedTextureData = { ...textures };
    previewAvatar.dirtyTextureKeys = new Set();
    previewAvatar.resetOverridesPending = false;
  }
  const button = overlay.querySelector("#characterSave");
  if (selectedRosterSlot !== MAIN_PROFILE_SLOT) {
    button.textContent = "SAVED TO BROWSER ✓";
    window.setTimeout(() => { button.textContent = "SAVE CHARACTER"; }, 1800);
    return;
  }
  let profileSaved = false;
  try {
    profileSaved = Boolean(await window.webMinecraftSaveCharacterProfile?.(textures, savedAt));
  } catch (error) {
    console.warn("Character textures were saved to this browser, but not to the cloud profile.", error);
  }
  button.textContent = profileSaved ? "PROFILE + BROWSER SAVED ✓" : "BROWSER SAVED ✓";
  window.setTimeout(() => { button.textContent = "SAVE CHARACTER"; }, 1800);
}

function exportPng() {
  pushEditorIntoTexture();
  const canvas = textureCanvas(selectedTextureKey);
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `webminecraft-${selectedTextureKey}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
function importPng(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    pushUndoSnapshot();
    undoStack.push(strokeSnapshot);
    strokeSnapshot = null;
    if (undoStack.length > 40) undoStack.shift();
    const target = textureCanvas(selectedTextureKey);
    if (!target) { URL.revokeObjectURL(url); return; }
    const ctx = target.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, 16, 16);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, 16, 16);
    currentTextures[selectedTextureKey].needsUpdate = true;
    dirtyTextureKeys.add(selectedTextureKey);
    URL.revokeObjectURL(url);
    copySelectedTextureToEditor();
    scheduleLivePreview();
    scheduleOnlineSkinSync();
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    alert("That image could not be loaded. Choose a valid image.");
  };
  image.src = url;
}
overlay.querySelector("#skinImport").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", event => {
  importPng(event.target.files?.[0]);
  event.target.value = "";
});
overlay.querySelector("#skinExport").addEventListener("click", exportPng);
overlay.querySelector("#characterReset").addEventListener("click", resetTextures);
overlay.querySelector("#characterSave").addEventListener("click", saveTextures);
overlay.querySelector("#characterClose").addEventListener("click", close);
overlay.querySelector("#characterBackRoster").addEventListener("click", () => setEditorPage("roster"));
overlay.querySelector("#rosterPrev").addEventListener("click", () => moveRoster(-1));
overlay.querySelector("#rosterNext").addEventListener("click", () => moveRoster(1));
overlay.querySelectorAll(".rosterEditButton").forEach(button => button.addEventListener("click", () => {
  activateRosterSlot(Number(button.dataset.slot));
  setEditorPage("paint");
}));
overlay.querySelectorAll("[data-editor-page]").forEach(button => button.addEventListener("click", () => {
  const page = button.dataset.editorPage;
  if (page === "paint") activateRosterSlot(selectedRosterSlot);
  setEditorPage(page);
}));
overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
window.addEventListener("keydown", event => {
  if (!overlay.classList.contains("open")) return;
  if (event.key === "Escape") close();
  if (editorPage === "roster" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault();
    moveRoster(event.key === "ArrowRight" ? 1 : -1);
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }
});
window.addEventListener("resize", resize);
window.addEventListener("webminecraft:multiplayer-state-changed", () => {
  if (overlay.classList.contains("open")) void buildPreview();
});
window.addEventListener("webminecraft:character-profile-loaded", event => {
  const textures = event.detail?.textures && typeof event.detail.textures === "object" ? event.detail.textures : {};
  const applyMainProfile = async () => {
    const main = rosterAvatars[MAIN_PROFILE_SLOT];
    if (!main) return;
    await applyAvatarTextureData(main.textures, textures);
    main.savedTextureData = { ...textures };
    if (selectedRosterSlot === MAIN_PROFILE_SLOT) {
      savedTextureData = { ...textures };
      if (overlay.classList.contains("open") && editorPage === "paint") copySelectedTextureToEditor();
      scheduleLivePreview();
    }
    resize();
  };
  if (rosterAvatars[MAIN_PROFILE_SLOT]) {
    void applyMainProfile();
  } else {
    void buildPreview().then(applyMainProfile);
  }
});

makeScene();

if (typeof ResizeObserver !== "undefined") {
  const characterEditorResizeObserver = new ResizeObserver(() => {
    const host = renderer?.domElement?.parentElement;
    if (host?.clientWidth && host?.clientHeight) resize();
  });
  ["#characterEditorSidebar", "#characterRosterStage", "#characterEditorPreview"].forEach(selector => {
    const element = overlay.querySelector(selector);
    if (element) characterEditorResizeObserver.observe(element);
  });
}

function addMenuButton() {
  if (document.getElementById("characterShowcase")) return;
  const showcase = document.createElement("aside");
  showcase.id = "characterShowcase";
  showcase.setAttribute("aria-label", "Your character");
  showcase.innerHTML = `
    <div id="characterShowcasePreview" aria-label="Move your mouse to look around"></div>
    <button id="characterEditorOpen" type="button">CHARACTER</button>
  `;
  showcase.querySelector("#characterEditorOpen").addEventListener("click", show);
  document.body.appendChild(showcase);
  const previewHost = showcase.querySelector("#characterShowcasePreview");
  if (renderer?.domElement && renderer.domElement.parentElement !== previewHost) previewHost.appendChild(renderer.domElement);
  void buildPreview().then(resize).catch(error => console.warn("Could not build the character showcase:", error));
}
addMenuButton();
window.addEventListener("DOMContentLoaded", addMenuButton, { once: true });

function render() {
  requestAnimationFrame(render);
  const editorOpen = overlay.classList.contains("open");
  const showcase = document.getElementById("characterShowcase");
  const showcaseVisible = Boolean(
    showcase &&
    !document.body.classList.contains("webminecraft-in-world") &&
    getComputedStyle(showcase).display !== "none" &&
    showcase.getBoundingClientRect().width > 0
  );
  if (editorOpen && editorPage === "roster") {
    rosterAvatars.forEach(entry => {
      entry.group.position.x += (entry.targetX - entry.group.position.x) * 0.16;
      const nextScale = entry.group.scale.x + (entry.targetScale - entry.group.scale.x) * 0.16;
      entry.group.scale.setScalar(nextScale);
    });
  }
  if (previewAvatar?.parts?.head) {
    const head = previewAvatar.parts.head;
    head.rotation.order = "YXZ";
    head.rotation.y += (headLookX * 0.62 - head.rotation.y) * 0.16;
    head.rotation.x += (headLookY * 0.36 - head.rotation.x) * 0.16;
  }
  if ((editorOpen || showcaseVisible) && renderer && scene && camera && previewAvatar) renderer.render(scene, camera);
}
render();
