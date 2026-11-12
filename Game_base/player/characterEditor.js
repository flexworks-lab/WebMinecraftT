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
const MAX_ROSTER_CHARACTERS = 60;
function extractTextureMapData(value) {
  const source = value?.textures && typeof value.textures === "object" ? value.textures : value;
  const result = {};
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const dataUrl = source?.[key];
    if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/") && dataUrl.length <= 50000) result[key] = dataUrl;
  }
  // Older character saves used one shared shirt map and one shared pants map.
  // Expand those legacy maps into the new independent body-part editors.
  const legacyShirt = source?.shirt;
  if (typeof legacyShirt === "string" && legacyShirt.startsWith("data:image/") && legacyShirt.length <= 50000) {
    for (const key of ["chest", "leftArm", "rightArm"]) if (!result[key]) result[key] = legacyShirt;
  }
  const legacyPants = source?.pants;
  if (typeof legacyPants === "string" && legacyPants.startsWith("data:image/") && legacyPants.length <= 50000) {
    for (const key of ["leftLeg", "rightLeg"]) if (!result[key]) result[key] = legacyPants;
  }
  return result;
}
function hasTextureMaps(value) { return Object.keys(extractTextureMapData(value)).length > 0; }
function hashTextureMap(value) {
  const source = JSON.stringify(extractTextureMapData(value)); let hash = 2166136261;
  for (let i = 0; i < source.length; i++) { hash ^= source.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16);
}
function createCharacterId() {
  try { if (typeof crypto?.randomUUID === "function") return "char-" + crypto.randomUUID(); } catch {}
  return "char-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}
function makeRosterRecord(textures, metadata = {}) {
  const clean = extractTextureMapData(textures);
  if (!Object.keys(clean).length) return null;
  return { ...clean,
    __characterId: String(metadata.__characterId || metadata.id || createCharacterId()),
    __characterName: String(metadata.__characterName || metadata.name || "Character").slice(0, 24),
    __savedAt: Math.max(0, Number(metadata.__savedAt || metadata.savedAt) || Date.now())
  };
}
function mergeRosterSlots(localSlots, incomingSlots) {
  const sources = [localSlots, incomingSlots].filter(Array.isArray);
  const length = Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, ...sources.map(s => s.length)));
  const merged = Array.from({ length }, (_, i) => {
    const a = sources[0]?.[i], b = sources[1]?.[i];
    if (hasTextureMaps(a) && hasTextureMaps(b)) return Number(b.__savedAt || 0) > Number(a.__savedAt || 0) ? b : a;
    return hasTextureMaps(a) ? a : (hasTextureMaps(b) ? b : null);
  });
  for (const slots of sources) slots.forEach((record, index) => {
    if (!hasTextureMaps(record)) return;
    const id = String(record.__characterId || "legacy-" + hashTextureMap(record));
    const duplicate = merged.findIndex(item => hasTextureMaps(item) && String(item.__characterId || "legacy-" + hashTextureMap(item)) === id);
    if (duplicate >= 0) {
      if (Number(record.__savedAt || 0) > Number(merged[duplicate].__savedAt || 0)) merged[duplicate] = record;
      return;
    }
    let target = index < 5 && !hasTextureMaps(merged[index]) ? index : -1;
    if (target < 0) target = merged.findIndex((item, i) => i >= 5 && !hasTextureMaps(item));
    if (target >= 0) merged[target] = record;
    else if (merged.length < MAX_ROSTER_CHARACTERS) merged.push(record);
  });
  while (merged.length > 5 && !merged[merged.length - 1]) merged.pop();
  return Array.from({ length: Math.max(5, merged.length) }, (_, i) => merged[i] || null);
}

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

function getRosterStorageKey() {
  let uid = String(window.__webMinecraftAccountUid || "").trim();
  if (!uid) {
    try {
      const user = window.firebase?.auth?.()?.currentUser || null;
      if (user?.isAnonymous !== true) uid = String(user?.uid || "").trim();
    } catch {}
  }
  return uid ? `${ROSTER_STORAGE_KEY}:account:${uid}` : ROSTER_STORAGE_KEY;
}

function readRosterTextureStore() {
  try {
    const storageKey = getRosterStorageKey();
    let raw = localStorage.getItem(storageKey);
    if (!raw && storageKey !== ROSTER_STORAGE_KEY) {
      raw = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (raw) localStorage.setItem(storageKey, raw);
    }
    const record = JSON.parse(raw || "null");
    if (!record || ![1, 2].includes(Number(record.version)) || !Array.isArray(record.slots)) return { slots: [null, null, null, null, null], savedAt: 0 };
    const savedAt = Math.max(0, Number(record.savedAt) || 0);
    const length = Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, record.slots.length));
    const slots = Array.from({ length }, (_, i) => {
      const source = record.slots[i], textures = extractTextureMapData(source);
      if (Object.keys(textures).length) return {
        ...textures,
        __characterId: String(source?.__characterId || "legacy-" + hashTextureMap(textures)),
        __characterName: String(source?.__characterName || (i === MAIN_PROFILE_SLOT ? "Main Character" : "Character " + (i + 1))).slice(0, 24),
        __savedAt: Math.max(0, Number(source?.__savedAt) || savedAt)
      };
      if (source?.__characterId) return { __characterId: String(source.__characterId), __characterName: String(source.__characterName || "Character " + (i + 1)).slice(0, 24), __savedAt: 0 };
      return null;
    });
    const deletedIds = Array.from(new Set((Array.isArray(record.deletedIds) ? record.deletedIds : [])
      .filter(id => typeof id === "string" && id.length > 0 && id.length <= 128)));
    const deleted = new Set(deletedIds);
    return { slots: slots.map(item => deleted.has(item?.__characterId) ? null : item), deletedIds, savedAt };
  } catch { return { slots: [null, null, null, null, null], deletedIds: [], savedAt: 0 }; }
}
function writeRosterTextureStore(savedAt = Date.now()) {
  try {
    const timestamp = Math.max(0, Number(savedAt) || Date.now());
    const length = Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, rosterTextureStore.slots.length));
    const deletedIds = Array.from(new Set((Array.isArray(rosterTextureStore.deletedIds) ? rosterTextureStore.deletedIds : [])
      .filter(id => typeof id === "string" && id.length > 0 && id.length <= 128)));
    const deleted = new Set(deletedIds);
    const slots = Array.from({ length }, (_, i) => {
      const source = rosterTextureStore.slots[i];
      if (deleted.has(source?.__characterId)) return null;
      if (hasTextureMaps(source)) return makeRosterRecord(source, source);
      if (source?.__characterId) return { __characterId: String(source.__characterId), __characterName: String(source.__characterName || "Character " + (i + 1)).slice(0, 24), __savedAt: 0 };
      return null;
    });
    rosterTextureStore.savedAt = timestamp;
    rosterTextureStore.deletedIds = deletedIds;
    rosterTextureStore.slots = slots;
    localStorage.setItem(getRosterStorageKey(), JSON.stringify({ version: 2, savedAt: timestamp, slots, deletedIds }));
    return true;
  } catch (error) { console.warn("Could not save character presets in this browser.", error); return false; }
}
function readSavedTextures() {
  return readCharacterTextureRecord()?.textures || null;
}

function getTextureCanvas(textures, key) {
  return textures?.[key]?.userData?.canvas || null;
}

function restoreRosterAvatarBase(entry) {
  if (!entry?.textures || !entry?.baseSnapshots) return;
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = getTextureCanvas(entry.textures, key);
    const pixels = entry.baseSnapshots[key];
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!context || !pixels) continue;
    context.putImageData(pixels, 0, 0);
    entry.textures[key].needsUpdate = true;
  }
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
#characterShowcase{position:fixed;left:calc(50% + 216px);right:auto;top:calc(50% - 58px);bottom:auto;transform:translateY(4%);z-index:84;width:250px;height:354px;display:flex;flex-direction:column;overflow:visible;background:transparent;border:0;box-shadow:none;color:#fff;pointer-events:auto}
#characterShowcase[hidden]{display:none!important}
#characterShowcaseTitle{display:none!important}
#characterShowcasePreview{position:relative;flex:1 1 auto;min-height:0;overflow:visible;background:transparent;touch-action:pan-y}
#characterShowcasePreview>canvas{display:block;width:100%;height:100%;touch-action:pan-y;background:transparent}
#characterEditorOpen{width:100%;height:30px;flex:0 0 30px;margin:-9px 0 0;padding:0 4px;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#747474,#555);color:#fff;font:11px MinecraftFont,monospace;text-shadow:2px 2px 0 #222;cursor:pointer;box-shadow:2px 2px 0 #0008}
#characterEditorOpen:active{filter:brightness(.86)}
body.webminecraft-in-world #characterShowcase{display:none!important}
body:not(.webminecraft-in-world) #mainMenu{align-items:center!important}
body:not(.webminecraft-in-world) #mainMenu #menuPanel{width:min(760px,96vw)!important;margin:0 auto!important}
body:not(.webminecraft-in-world) #mainMenu #menuButtons{margin:0 auto!important;transform:translateY(26px)!important}
@media(max-width:1360px){#characterShowcase{left:calc(50% + 212px);top:calc(50% - 48px);width:224px;height:318px}}
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
 #characterShowcase{left:auto;right:10px;top:calc(50% - 34px);bottom:auto;transform:translateY(8%);width:172px;height:244px}
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
 #characterShowcase{right:8px;width:150px;height:214px;top:calc(50% - 34px)}
}


/* Minecraft-style Character Studio: square stone panels, bevelled controls, pixel type. */
#characterEditor{
  background:
    linear-gradient(rgba(0,0,0,.62),rgba(0,0,0,.76)),
    radial-gradient(ellipse at 50% 35%,#343434 0,#171717 58%,#090909 100%)!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  image-rendering:pixelated;
}
#characterEditorShell{
  background:
    linear-gradient(90deg,rgba(0,0,0,.22),transparent 18%,rgba(0,0,0,.12)),
    repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 2px,transparent 2px 4px),
    #242424!important;
}
#characterEditorSidebar{
  background:
    repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,transparent 2px 5px),
    linear-gradient(90deg,#303030,#242424)!important;
  border-right:3px solid #111!important;
  box-shadow:inset -2px 0 #777,4px 0 0 rgba(0,0,0,.32)!important;
  transition:width .16s steps(3,end),flex-basis .16s steps(3,end)!important;
}
#characterEditorSidebar:hover,#characterEditorSidebar:focus-within{
  width:218px!important;flex-basis:218px!important;
}
#characterEditorBrand{
  border-bottom:2px solid #111!important;
  box-shadow:0 1px 0 #777!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  letter-spacing:.4px!important;
}
#characterEditorBrandMark{
  background:linear-gradient(135deg,#888,#555)!important;
  border:2px solid #111!important;
  box-shadow:inset 2px 2px #c6c6c6,inset -2px -2px #333!important;
  color:#fff!important;
}
.characterNavButton{
  border:2px solid #111!important;
  border-top-color:#999!important;
  border-left-color:#999!important;
  background:linear-gradient(#686868,#505050)!important;
  color:#e8e8e8!important;
  font-family:"MinecraftFont",monospace!important;
  font-size:10px!important;
  text-shadow:2px 2px #333!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.13),inset -2px -2px rgba(0,0,0,.3)!important;
}
.characterNavButton svg{
  stroke:#fff!important;stroke-width:2.3!important;stroke-linecap:square!important;stroke-linejoin:miter!important;
  shape-rendering:crispEdges!important;
}
.characterNavButton:hover,.characterNavButton.active{
  background:linear-gradient(#78934f,#526e36)!important;
  border-color:#111!important;border-top-color:#c2d29b!important;border-left-color:#c2d29b!important;
  color:#fff!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.18),inset -2px -2px rgba(0,0,0,.3),0 2px #111!important;
}
#characterClose{
  border:2px solid #111!important;border-top-color:#aaa!important;border-left-color:#aaa!important;
  background:linear-gradient(#777,#555)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.12),inset -2px -2px rgba(0,0,0,.3)!important;
}
#characterEditorTopbar{
  background:linear-gradient(#555,#3a3a3a)!important;
  border-bottom:3px solid #111!important;
  box-shadow:inset 0 2px #999,0 2px #777!important;
}
#characterEditorTopbarTitle{
  font-family:"MinecraftFont",monospace!important;
  font-size:13px!important;letter-spacing:.5px!important;
  text-shadow:2px 2px #222!important;
}
#characterEditorTopbarSub{
  color:#d0d0d0!important;font-family:Arial,sans-serif!important;
}
#characterEditorStatus{
  border:2px solid #111!important;border-top-color:#aaa!important;border-left-color:#aaa!important;
  background:linear-gradient(#626262,#454545)!important;
  color:#e2f4c5!important;font-family:"MinecraftFont",monospace!important;
  text-shadow:2px 2px #222!important;
}
#characterRosterPage{
  background:
    radial-gradient(ellipse at 50% 48%,rgba(110,110,110,.14),transparent 55%),
    repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 2px,transparent 2px 32px),
    repeating-linear-gradient(90deg,rgba(255,255,255,.014) 0 2px,transparent 2px 32px),
    #202020!important;
}
#characterRosterIntro h1{
  font-family:"MinecraftFont",monospace!important;
  font-size:clamp(20px,2.7vw,32px)!important;
  font-weight:400!important;letter-spacing:.2px!important;
  color:#fff!important;text-shadow:3px 3px #222,5px 5px #080808!important;
}
#characterRosterIntro p{
  color:#d1d1d1!important;font-family:Arial,sans-serif!important;
  text-shadow:1px 1px #111!important;
}
#characterRosterStage{
  background:
    linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.52)),
    radial-gradient(ellipse at 50% 74%,rgba(145,145,145,.16),transparent 48%),
    repeating-linear-gradient(90deg,transparent 0 63px,rgba(255,255,255,.025) 63px 64px),
    #252525!important;
  border:3px solid #111!important;
  box-shadow:inset 3px 3px #777,inset -3px -3px #080808,0 3px #555!important;
}
#characterRosterCards{padding-bottom:14px!important}
.rosterCard{gap:7px!important}
.rosterCardNumber{
  border:2px solid #111!important;border-top-color:#999!important;border-left-color:#999!important;
  background:linear-gradient(#666,#444)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;text-shadow:2px 2px #222!important;
  box-shadow:inset 1px 1px rgba(255,255,255,.12)!important;
}
.rosterCardName{
  color:#d6d6d6!important;font-family:"MinecraftFont",monospace!important;
  font-size:9px!important;text-shadow:2px 2px #111!important;
}
.rosterCard.isCenter .rosterCardNumber{
  border-top-color:#c5dda2!important;border-left-color:#c5dda2!important;
  background:linear-gradient(#789b4e,#526f36)!important;color:#fff!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.2),0 2px #111!important;
}
.rosterCard.isCenter .rosterCardName{color:#e7f7d1!important}
.rosterEditButton{
  border:2px solid #111!important;border-top-color:#bbb!important;border-left-color:#bbb!important;
  background:linear-gradient(#777,#555)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;font-size:10px!important;
  text-shadow:2px 2px #292929!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.14),inset -2px -2px rgba(0,0,0,.32),0 2px #111!important;
}
.rosterEditButton:hover{
  background:linear-gradient(#88a85c,#5f7f3d)!important;filter:none!important;
}
.rosterArrow{
  border:2px solid #111!important;border-top-color:#aaa!important;border-left-color:#aaa!important;
  background:linear-gradient(#777,#505050)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;text-shadow:2px 2px #222!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.13),inset -2px -2px rgba(0,0,0,.3),0 3px #111!important;
}
.rosterArrow:hover{
  background:linear-gradient(#8cae5a,#668742)!important;border-top-color:#d5e6b4!important;border-left-color:#d5e6b4!important;
}
#characterRosterInstructions{
  border:2px solid #111!important;border-top-color:#888!important;border-left-color:#888!important;
  background:linear-gradient(#393939,#252525)!important;color:#dedede!important;
  font-family:Arial,sans-serif!important;box-shadow:inset 2px 2px rgba(255,255,255,.06),0 2px #111!important;
}
#characterRosterInstructions strong{color:#c7e5a4!important}
#characterPaintPage{background:#202020!important}
#characterPaintHeader{
  background:linear-gradient(#555,#393939)!important;border-bottom:3px solid #111!important;
  box-shadow:inset 0 2px #999!important;
}
#characterBackRoster,.skinTool,.characterAction,#characterSave{
  border:2px solid #111!important;border-top-color:#bbb!important;border-left-color:#bbb!important;
  border-radius:0!important;background:linear-gradient(#777,#555)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;font-size:10px!important;text-shadow:2px 2px #222!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.14),inset -2px -2px rgba(0,0,0,.34),0 2px #111!important;
}
#characterBackRoster:hover,.skinTool:hover,.characterAction:hover{background:linear-gradient(#898989,#626262)!important}
.skinTool.active,.characterAction.primary,#characterSave{
  background:linear-gradient(#789b4e,#526f36)!important;border-top-color:#c5dda2!important;border-left-color:#c5dda2!important;
}
#characterEditorPreview{
  background:
    radial-gradient(ellipse at 50% 45%,rgba(145,145,145,.17),transparent 53%),
    repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,transparent 2px 34px),
    repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 2px,transparent 2px 34px),
    #171717!important;
}
#characterEditorHint{
  border:2px solid #111!important;border-top-color:#888!important;border-left-color:#888!important;
  background:linear-gradient(#444,#292929)!important;color:#e6e6e6!important;
  font-family:"MinecraftFont",monospace!important;font-size:9px!important;
  text-shadow:2px 2px #111!important;
}
#characterEditorControls{
  background:
    repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 2px,transparent 2px 5px),
    linear-gradient(#3b3b3b,#292929)!important;
  border-left:3px solid #111!important;box-shadow:inset 2px 0 #777!important;
}
#characterEditorTitle{
  color:#fff!important;font-family:"MinecraftFont",monospace!important;
  font-size:17px!important;font-weight:400!important;text-shadow:2px 2px #171717!important;
}
#characterEditorSub{color:#dedede!important;font-family:Arial,sans-serif!important}
.characterLabel{
  color:#f0f0f0!important;font-family:"MinecraftFont",monospace!important;
  font-size:9px!important;letter-spacing:.3px!important;text-shadow:2px 2px #222!important;
}
.avatarTextureChoice{
  border:2px solid #111!important;border-top-color:#888!important;border-left-color:#888!important;
  border-radius:0!important;background:linear-gradient(#5c5c5c,#414141)!important;
  color:#fff!important;font-family:"MinecraftFont",monospace!important;
  box-shadow:inset 1px 1px rgba(255,255,255,.1),inset -1px -1px rgba(0,0,0,.28)!important;
}
.avatarTextureChoice.active{
  outline:2px solid #b5d98a!important;outline-offset:1px!important;
  background:linear-gradient(#6f9148,#4c682f)!important;
}
#skinCanvasWrap{
  border:3px solid #111!important;
  box-shadow:inset 2px 2px #999,0 0 0 1px #666!important;
}
#skinBrushSize{
  border:2px solid #111!important;border-top-color:#999!important;border-left-color:#999!important;
  border-radius:0!important;background:#555!important;color:#fff!important;
}
#skinCustomColor{border:2px solid #111!important;border-radius:0!important}
#skinPalette .skinColor{outline-offset:0!important}
#characterHelpPanel{
  border:3px solid #111!important;border-top-color:#999!important;border-left-color:#999!important;
  border-radius:0!important;background:linear-gradient(#454545,#292929)!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.08),inset -2px -2px rgba(0,0,0,.3),0 4px #111!important;
}
#characterHelpPanel h1{
  font-family:"MinecraftFont",monospace!important;font-weight:400!important;
  text-shadow:3px 3px #111!important;
}
#characterHelpPanel p{font-family:Arial,sans-serif!important;color:#ddd!important}
#characterHelpPanel strong{color:#c7e5a4!important}
#characterEditor button,#characterEditor select{border-radius:0!important}
#characterEditor button:focus-visible{outline:2px solid #c7e5a4!important;outline-offset:2px!important}
#characterShowcase #characterEditorOpen{
  border:2px solid #111!important;border-top-color:#bbb!important;border-left-color:#bbb!important;
  border-radius:0!important;background:linear-gradient(#777,#555)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;box-shadow:inset 2px 2px rgba(255,255,255,.14),inset -2px -2px rgba(0,0,0,.34),0 2px #111!important;
}
@media(max-width:620px){
  #characterEditorSidebar{background:linear-gradient(#303030,#202020)!important}
  #characterEditorTopbar{padding:0 9px!important}
  #characterRosterInstructions{font-size:9px!important}
  #characterEditorControls{border-top:3px solid #111!important}

}

/* Final roster cleanup: a floating lineup, with actions directly below each avatar. */
#characterEditorStatus{display:none!important}
#characterRosterPage{background:transparent!important}
#characterRosterStage{background:transparent!important;border:0!important;box-shadow:none!important}
#characterRosterInstructions{display:none!important}
.rosterCardActions{display:flex;align-items:center;justify-content:center;gap:4px;width:min(190px,96%);pointer-events:auto}
.rosterCardActions .rosterEditButton,.rosterCardActions .rosterSelectButton,.rosterCardActions .rosterDeleteButton{
  flex:1 1 0;min-width:0;width:auto!important;height:34px;padding:0 2px;
  font-size:clamp(6px,.62vw,9px)!important;letter-spacing:0!important;
}
.rosterCardActions .rosterDeleteButton{
  border:2px solid #111!important;border-top-color:#d5aaaa!important;border-left-color:#d5aaaa!important;
  background:linear-gradient(#984c4c,#713535)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;text-shadow:2px 2px #321717!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.12),inset -2px -2px rgba(0,0,0,.32),0 2px #111!important;
}
.rosterCardActions .rosterDeleteButton:hover:not(:disabled){background:linear-gradient(#b85b5b,#873d3d)!important}
.rosterCardActions .rosterDeleteButton:disabled{opacity:.42!important;cursor:default!important;filter:none!important}
.rosterCardActions .rosterSelectButton{
  border:2px solid #111!important;border-top-color:#b9d69a!important;border-left-color:#b9d69a!important;
  background:linear-gradient(#789b4e,#526f36)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;text-shadow:2px 2px #222!important;
  box-shadow:inset 2px 2px rgba(255,255,255,.14),inset -2px -2px rgba(0,0,0,.32),0 2px #111!important;
}
.rosterCardActions .rosterSelectButton:hover:not(:disabled){background:linear-gradient(#8cac5c,#62803f)!important}
.rosterCardActions .rosterSelectButton:disabled{
  opacity:1!important;cursor:default!important;filter:none!important;
  border-top-color:#b9d69a!important;border-left-color:#b9d69a!important;
  background:linear-gradient(#789b4e,#526f36)!important;color:#fff!important;
}
@media(max-width:900px){
  .rosterCardActions{gap:3px;width:96%}
  .rosterCardActions .rosterEditButton,.rosterCardActions .rosterSelectButton,.rosterCardActions .rosterDeleteButton{height:30px;font-size:6px!important}
}
@media(max-width:620px){
  .rosterCardActions{gap:2px;width:100%}
  .rosterCardActions .rosterEditButton,.rosterCardActions .rosterSelectButton,.rosterCardActions .rosterDeleteButton{height:27px;padding:0 1px;font-size:5px!important}
}

/* Keep roster actions exclusive to the character in the center slot. */
.rosterCard:not(.isCenter) .rosterCardActions{
  visibility:hidden!important;
  pointer-events:none!important;
}
.rosterCard.isCenter .rosterCardActions{
  visibility:visible!important;
  pointer-events:auto!important;
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
      <div><div id="characterEditorTopbarTitle">CHARACTER SELECT</div><div id="characterEditorTopbarSub">Browse characters and choose one to edit.</div></div>
      <div id="characterEditorStatus">ROSTER READY</div>
    </header>
    <section id="characterRosterPage" class="characterEditorPage">
      <div id="characterRosterIntro">
        <h1>CHOOSE YOUR CHARACTER</h1>
        <button class="rosterEditButton" id="characterAddButton" type="button"
          style="display:block;width:190px;height:36px;margin:12px auto 0">+ ADD CHARACTER</button>
      </div>
      <div id="characterRosterStage">
        <button class="rosterArrow" id="rosterPrev" type="button" aria-label="Move previous character to center">‹</button>
        <div id="characterRosterCards">
          <div class="rosterCard" data-roster-position="0"><div class="rosterCardNumber">01</div><div class="rosterCardName"></div><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="1"><div class="rosterCardNumber">02</div><div class="rosterCardName"></div><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="2"><div class="rosterCardNumber">03</div><div class="rosterCardName"></div><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="3"><div class="rosterCardNumber">04</div><div class="rosterCardName"></div><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="4"><div class="rosterCardNumber">05</div><div class="rosterCardName"></div><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
        </div>
        <button class="rosterArrow" id="rosterNext" type="button" aria-label="Move next character to center">›</button>
      </div>
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
        <p><strong>Edit or select:</strong> Press EDIT to paint a character. Press SELECT to make that appearance your live in-game character; your previous live appearance is kept in the preset you selected.</p>
        <p><strong>Paint textures:</strong> Choose Face, Head Back, Head Side, Head Top, Skin, Shirt, Pants, or Shoes. Select a palette colour or use Custom. PAINT adds pixels, ERASER removes them, PICK COLOR samples a pixel, and UNDO reverses your last stroke.</p>
        <p><strong>Save rules:</strong> The active character is shown in the center. Saving updates this browser and, when signed in, your account profile. All five character slots sync to devices that sign into the same account. Guests keep browser-only saves.</p>
        <p><strong>Import and export:</strong> PNG files are resized to 16 × 16 pixels for the selected texture map. Export each map separately to keep a backup.</p>
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
let avatarYaw = Math.PI;
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
function captureFullTextureData(avatar) {
  const textures = {};
  for (const { key } of AVATAR_TEXTURE_PARTS) {
    const canvas = getTextureCanvas(avatar?.textures, key);
    if (canvas) textures[key] = canvas.toDataURL("image/png");
  }
  return textures;
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

function setRosterWindow(centerSlot) {
  const count = rosterAvatars.length;
  if (!count) return;
  const center = ((Math.floor(centerSlot) % count) + count) % count;
  rosterOrder = Array.from({ length: 5 }, (_, p) => (center + p - 2 + count) % count);
}
function updateRosterCards() {
  overlay.querySelectorAll(".rosterCard").forEach((card, position) => {
    const slot = rosterOrder[position];
    if (!Number.isInteger(slot) || !rosterAvatars[slot]) { card.hidden = true; return; }
    card.hidden = false;
    card.dataset.slot = String(slot);
    card.classList.toggle("isCenter", position === 2);
    card.querySelector(".rosterCardNumber").textContent = String(slot + 1).padStart(2, "0");
    const record = rosterTextureStore.slots[slot], avatar = rosterAvatars[slot];
    const name = slot === MAIN_PROFILE_SLOT ? "MAIN CHARACTER" : (record?.__characterName || avatar?.characterName || "CHARACTER " + (slot + 1));
    card.querySelector(".rosterCardName").textContent = name;
    const edit = card.querySelector(".rosterEditButton");
    edit.dataset.slot = String(slot);
    edit.setAttribute("aria-label", "Edit " + name);
    const select = card.querySelector(".rosterSelectButton");
    select.dataset.slot = String(slot);
    const isSaved = hasTextureMaps(record);
    select.disabled = slot === MAIN_PROFILE_SLOT || !isSaved;
    select.textContent = slot === MAIN_PROFILE_SLOT ? "ACTIVE" : (isSaved ? "SELECT" : "EDIT FIRST");
    select.setAttribute("aria-label", slot === MAIN_PROFILE_SLOT ? "This is your active character" : (isSaved ? "Select " + name + " for gameplay" : "Edit and save this character before selecting it"));
    const remove = card.querySelector(".rosterDeleteButton");
    remove.dataset.slot = String(slot);
    remove.disabled = slot === MAIN_PROFILE_SLOT || !isSaved;
    remove.setAttribute("aria-label", slot === MAIN_PROFILE_SLOT ? "The active character cannot be deleted" : "Delete " + name);
  });
}
function applyRosterLayout() {
  const stage = overlay.querySelector("#characterRosterStage");
  const aspect = stage?.clientHeight ? stage.clientWidth / stage.clientHeight : 1.8;
  const viewHalfWidth = camera ? Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * aspect : 7.5;
  const slotSpacing = viewHalfWidth * 0.36;
  rosterAvatars.forEach(entry => {
    const position = rosterOrder.indexOf(entry.slotIndex);
    entry.targetX = position < 0 ? (entry.slotIndex - 2) * slotSpacing : (position - 2) * slotSpacing;
    entry.targetScale = position === 2 ? 1.16 : 0.88;
    entry.group.visible = editorPage === "roster" && position >= 0;
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
  const characterName = slot === MAIN_PROFILE_SLOT ? "MAIN CHARACTER" : (rosterTextureStore.slots[slot]?.__characterName || previewAvatar.characterName || "CHARACTER " + (slot + 1));
  overlay.querySelector("#characterEditingName").textContent = "EDITING " + characterName;
  updateRosterCards();
}

async function selectRosterCharacter(slot) {
  const selected = rosterAvatars[slot], main = rosterAvatars[MAIN_PROFILE_SLOT];
  const selectedRecord = rosterTextureStore.slots[slot];
  if (!selected || !main || slot === MAIN_PROFILE_SLOT || !hasTextureMaps(selectedRecord)) return;
  const selectButtons = [...overlay.querySelectorAll(".rosterSelectButton")];
  selectButtons.forEach(button => { button.disabled = true; });
  const clickedButton = selectButtons.find(button => Number(button.dataset.slot) === slot);
  if (clickedButton) clickedButton.textContent = "APPLYING";
  const selectedTextures = captureFullTextureData(selected), previousMainTextures = captureFullTextureData(main);
  if (!Object.keys(selectedTextures).length) { updateRosterCards(); return; }
  const previousSlots = rosterTextureStore.slots.map(record => record ? { ...record } : null);
  const previousMainRecord = rosterTextureStore.slots[MAIN_PROFILE_SLOT], previousMainWasSaved = hasTextureMaps(previousMainRecord);
  const savedAt = Date.now();
  const nextMainRecord = makeRosterRecord(selectedTextures, selectedRecord);
  // An untouched old active preview stays local and gets its own fresh ID.
  const nextPresetRecord = previousMainWasSaved
    ? makeRosterRecord(previousMainTextures, previousMainRecord)
    : { __characterId: createCharacterId(), __characterName: "Character " + (slot + 1), __savedAt: 0 };
  rosterTextureStore.slots[MAIN_PROFILE_SLOT] = nextMainRecord;
  rosterTextureStore.slots[slot] = nextPresetRecord;
  if (!writeRosterTextureStore(savedAt)) {
    rosterTextureStore.slots = previousSlots;
    alert("This browser could not save the character swap. Free some browser storage and try again.");
    updateRosterCards(); return;
  }
  if (!writeCharacterTextureRecord(selectedTextures, savedAt)) {
    rosterTextureStore.slots = previousSlots;
    writeRosterTextureStore();
    alert("This browser could not save the active character. Your previous character is unchanged.");
    updateRosterCards(); return;
  }
  try {
    await applyAvatarTextureData(main.textures, selectedTextures);
    if (previousMainWasSaved) {
      await applyAvatarTextureData(selected.textures, previousMainTextures);
    } else {
      disposePreviewAvatar(selected);
      const identity = getIdentity();
      const replacement = createAvatar(
        identity.id + "-roster-" + (slot + 1) + "-" + nextPresetRecord.__characterId,
        nextPresetRecord.__characterName,
        null,
        nextPresetRecord.__characterId
      );
      replacement.group.traverse(object => { if (object.isSprite) object.visible = false; });
      replacement.group.rotation.y = Math.PI;
      replacement.group.position.set((slot - 2) * 2.95, 0, 0);
      replacement.group.scale.setScalar(0.88);
      replacement.group.visible = false;
      scene.add(replacement.group);
      await replacement.textureReady;
      rosterAvatars[slot] = {
        ...replacement, slotIndex: slot, characterId: nextPresetRecord.__characterId,
        characterName: nextPresetRecord.__characterName, baseSnapshots: snapshotTextures(replacement.textures),
        savedTextureData: {}, dirtyTextureKeys: new Set(), resetOverridesPending: false,
        targetX: (slot - 2) * 2.95, targetScale: 0.88
      };
    }
  } catch (error) { console.warn("Character textures were saved, but the preview could not refresh immediately.", error); }
  main.savedTextureData = { ...selectedTextures }; main.characterId = nextMainRecord?.__characterId;
  main.characterName = nextMainRecord?.__characterName || "Main Character";
  main.dirtyTextureKeys = new Set(); main.resetOverridesPending = false;
  if (previousMainWasSaved) {
    selected.savedTextureData = { ...previousMainTextures };
    selected.characterId = nextPresetRecord?.__characterId || selected.characterId;
    selected.characterName = nextPresetRecord?.__characterName || selected.characterName;
    selected.dirtyTextureKeys = new Set(); selected.resetOverridesPending = false;
    selected.group.rotation.y = Math.PI;
  }
  main.group.rotation.y = Math.PI;
  avatarYaw = Math.PI; setRosterWindow(MAIN_PROFILE_SLOT); activateRosterSlot(MAIN_PROFILE_SLOT); applyRosterLayout();
  sendCharacterSkin(selectedTextures);
  window.dispatchEvent(new CustomEvent("webminecraft:character-changed", { detail: { textures: selectedTextures } }));
  let profileSaved = false, rosterSaved = false;
  try {
    [profileSaved, rosterSaved] = await Promise.all([
      Promise.resolve(window.webMinecraftSaveCharacterProfile?.(selectedTextures, savedAt)).then(Boolean).catch(() => false),
      Promise.resolve(window.webMinecraftSaveCharacterRoster?.(rosterTextureStore.slots, savedAt, rosterTextureStore.deletedIds || [])).then(Boolean).catch(() => false)
    ]);
  } catch (error) { console.warn("The active character was saved in this browser, but account sync did not finish.", error); }
  const sub = overlay.querySelector("#characterEditorTopbarSub");
  if (sub) {
    sub.textContent = profileSaved && rosterSaved ? "Selected character and roster synced to your account." : "Selected character is active on this browser. Account sync is unavailable.";
    window.setTimeout(() => { if (editorPage === "roster") sub.textContent = "Browse your saved characters."; }, 2600);
  }
  updateRosterCards();
}

async function deleteRosterCharacter(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot === MAIN_PROFILE_SLOT) return;
  const record = rosterTextureStore.slots[slot];
  if (!hasTextureMaps(record)) return;
  const name = record.__characterName || "Character " + (slot + 1);
  if (!window.confirm("Delete " + name + " from your character roster? This also removes it from your other signed-in devices.")) return;

  const characterId = String(record.__characterId || "");
  if (!characterId) return;
  const previousSlots = rosterTextureStore.slots.slice();
  const previousDeletedIds = [...(rosterTextureStore.deletedIds || [])];
  rosterTextureStore.slots[slot] = null;
  rosterTextureStore.deletedIds = Array.from(new Set([...previousDeletedIds, characterId]));
  const savedAt = Date.now();
  if (!writeRosterTextureStore(savedAt)) {
    rosterTextureStore.slots = previousSlots;
    rosterTextureStore.deletedIds = previousDeletedIds;
    alert("This browser could not update the roster. Free some browser storage and try again.");
    return;
  }

  // A deleted preset becomes an empty local preview slot, never a saved skin.
  try {
    const center = rosterOrder[2] ?? MAIN_PROFILE_SLOT;
    await buildPreview(true);
    setRosterWindow(Math.min(center, rosterAvatars.length - 1));
    activateRosterSlot(rosterOrder[2]);
    applyRosterLayout();
  } catch (error) {
    console.warn("Deleted character locally, but the preview could not refresh.", error);
  }

  let synced = false;
  try {
    synced = Boolean(await window.webMinecraftSaveCharacterRoster?.(
      rosterTextureStore.slots, savedAt, rosterTextureStore.deletedIds
    ));
  } catch (error) {
    console.warn("Character was deleted in this browser, but account sync did not finish.", error);
  }
  const sub = overlay.querySelector("#characterEditorTopbarSub");
  if (sub) {
    sub.textContent = synced ? name + " deleted from your account." : name + " deleted on this device; account sync is unavailable.";
    window.setTimeout(() => { if (editorPage === "roster") sub.textContent = "Browse your saved characters."; }, 2400);
  }
  updateRosterCards();
}

async function addRosterCharacter() {
  const slot = rosterAvatars.length;
  if (slot >= MAX_ROSTER_CHARACTERS) { alert("Your character roster is full. Remove a saved character before adding another."); return; }
  const identity = getIdentity(), characterId = createCharacterId(), characterName = "Character " + (slot + 1);
  rosterTextureStore.slots.length = Math.max(rosterTextureStore.slots.length, slot + 1);
  rosterTextureStore.slots[slot] = { __characterId: characterId, __characterName: characterName, __savedAt: 0 };
  writeRosterTextureStore();
  const avatar = createAvatar(identity.id + "-roster-" + (slot + 1) + "-" + characterId, characterName, null, characterId);
  avatar.group.traverse(object => { if (object.isSprite) object.visible = false; });
  avatar.group.rotation.y = Math.PI; avatar.group.position.set((slot - 2) * 2.95, 0, 0);
  avatar.group.scale.setScalar(0.88); avatar.group.visible = false; scene.add(avatar.group);
  await avatar.textureReady;
  rosterAvatars[slot] = { ...avatar, slotIndex: slot, characterId, characterName,
    baseSnapshots: snapshotTextures(avatar.textures), savedTextureData: {}, dirtyTextureKeys: new Set(),
    resetOverridesPending: false, targetX: (slot - 2) * 2.95, targetScale: 0.88 };
  setRosterWindow(slot); activateRosterSlot(slot); setEditorPage("paint"); updateRosterCards(); resize();
}

function moveRoster(direction) {
  if (editorPage !== "roster" || rosterAvatars.length < 5) return;
  setRosterWindow((rosterOrder[2] ?? MAIN_PROFILE_SLOT) + direction);
  activateRosterSlot(rosterOrder[2]); applyRosterLayout();
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
    sub.textContent = "Browse characters and choose one to edit.";
    status.textContent = "";
    const host = overlay.querySelector("#characterRosterStage");
    if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
    renderer.domElement.style.display = "block";
    applyRosterLayout();
    camera.position.set(0, 2.65, 10.5);
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
  const identity = getIdentity(), key = identity.id;
  if (!force && rosterAvatars.length >= 5 && currentIdentity === key) return;
  if (rosterBuildPromise) return rosterBuildPromise;
  const buildTask = (async () => {
    rosterAvatars.forEach(disposePreviewAvatar);
    rosterAvatars = [];
    previewAvatar = null;
    currentIdentity = key;
    rosterTextureStore = readRosterTextureStore();
    const activeRecord = readCharacterTextureRecord();
    const rosterMain = rosterTextureStore.slots[MAIN_PROFILE_SLOT];
    const storedMain = hasTextureMaps(rosterMain) ? extractTextureMapData(rosterMain) : extractTextureMapData(activeRecord?.textures);
    if (Object.keys(storedMain).length && !hasTextureMaps(rosterMain)) {
      rosterTextureStore.slots[MAIN_PROFILE_SLOT] = makeRosterRecord(storedMain, { id: "main-" + identity.id, name: "Main Character", savedAt: activeRecord?.savedAt });
      writeRosterTextureStore(activeRecord?.savedAt || Date.now());
    }
    const slotCount = Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, rosterTextureStore.slots.length));
    rosterTextureStore.slots.length = slotCount;
    for (let slot = 0; slot < slotCount; slot++) {
      const record = rosterTextureStore.slots[slot];
      const stored = slot === MAIN_PROFILE_SLOT ? storedMain : extractTextureMapData(record);
      const characterId = String(record?.__characterId || "preview-" + identity.id + "-" + (slot + 1));
      const appearanceId = slot === MAIN_PROFILE_SLOT ? identity.appearanceId : (record?.__characterId || identity.id + "-preset-" + (slot + 1));
      const avatarId = identity.id + "-roster-" + (slot + 1) + "-" + characterId;
      const avatarName = slot === MAIN_PROFILE_SLOT ? identity.name : (record?.__characterName || "Character " + (slot + 1));
      const avatar = createAvatar(avatarId, avatarName, null, appearanceId);
      avatar.group.traverse(object => { if (object.isSprite) object.visible = false; });
      avatar.group.rotation.y = Math.PI;
      avatar.group.position.set((slot - 2) * 2.95, 0, 0);
      avatar.group.scale.setScalar(slot === MAIN_PROFILE_SLOT ? 1.16 : 0.88);
      avatar.group.visible = slot === MAIN_PROFILE_SLOT;
      scene.add(avatar.group);
      await avatar.textureReady;
      const base = snapshotTextures(avatar.textures);
      if (Object.keys(stored).length) await applyAvatarTextureData(avatar.textures, stored);
      rosterAvatars[slot] = { ...avatar, slotIndex: slot, characterId, characterName: avatarName,
        baseSnapshots: base, savedTextureData: { ...stored }, dirtyTextureKeys: new Set(), resetOverridesPending: false,
        targetX: (slot - 2) * 2.95, targetScale: slot === MAIN_PROFILE_SLOT ? 1.16 : 0.88 };
    }
    currentIdentity = key;
    setRosterWindow(MAIN_PROFILE_SLOT);
    activateRosterSlot(MAIN_PROFILE_SLOT);
    rosterAvatars.forEach(entry => { entry.group.visible = entry.slotIndex === MAIN_PROFILE_SLOT; });
    updateRosterCards();
    // Generated previews are local only; edited skins are the ones saved and synced.
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
  if (overlay.classList.contains("open") && editorPage === "roster") applyRosterLayout();
}
async function show() {
  overlay.classList.add("open");
  // Do not trust an old in-memory preview when the editor is reopened.
  // Rehydrate from the current account's browser cache before displaying it.
  await buildPreview(true);
  if (!overlay.classList.contains("open")) return;
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
  const currentRecord = rosterTextureStore.slots[selectedRosterSlot], entry = previewAvatar;
  const record = makeRosterRecord(textures, {
    id: currentRecord?.__characterId || entry?.characterId || createCharacterId(),
    name: currentRecord?.__characterName || entry?.characterName || (selectedRosterSlot === MAIN_PROFILE_SLOT ? "Main Character" : "Character " + (selectedRosterSlot + 1)),
    savedAt
  });
  if (!record) { alert("This character has no saved texture changes yet."); return; }
  rosterTextureStore.slots[selectedRosterSlot] = record;
  if (!writeRosterTextureStore(savedAt)) {
    alert("Unable to save this character preset in this browser. Free some browser storage and try again.");
    return;
  }
  updateRosterCards();
  savedTextureData = extractTextureMapData(textures);
  if (previewAvatar) { previewAvatar.characterId = record.__characterId; previewAvatar.characterName = record.__characterName; }
  dirtyTextureKeys.clear();
  resetOverridesPending = false;
  rememberActiveEditorState();
  if (previewAvatar) {
    previewAvatar.savedTextureData = { ...textures };
    previewAvatar.dirtyTextureKeys = new Set();
    previewAvatar.resetOverridesPending = false;
  }
  const button = overlay.querySelector("#characterSave");
  let rosterSaved = false;
  try {
    rosterSaved = Boolean(await window.webMinecraftSaveCharacterRoster?.(rosterTextureStore.slots, savedAt, rosterTextureStore.deletedIds || []));
  } catch (error) {
    console.warn("Character presets are saved in this browser, but not to the account profile.", error);
  }
  if (selectedRosterSlot !== MAIN_PROFILE_SLOT) {
    button.textContent = rosterSaved ? "ACCOUNT + BROWSER SAVED ✓" : "BROWSER SAVED ✓";
    window.setTimeout(() => { button.textContent = "SAVE CHARACTER"; }, 1800);
    return;
  }
  let profileSaved = false;
  try {
    profileSaved = Boolean(await window.webMinecraftSaveCharacterProfile?.(textures, savedAt));
  } catch (error) {
    console.warn("Character textures were saved to this browser, but not to the cloud profile.", error);
  }
  button.textContent = profileSaved && rosterSaved
    ? "ACCOUNT + BROWSER SAVED ✓"
    : (profileSaved || rosterSaved ? "PARTIAL ACCOUNT SAVE" : "BROWSER SAVED ✓");
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
overlay.querySelector("#characterAddButton").addEventListener("click", () => {
  void addRosterCharacter().catch(error => { console.warn("Could not add a roster character:", error); alert("Could not create another character. Please try again."); });
});
overlay.querySelectorAll(".rosterEditButton").forEach(button => {
  if (button.id === "characterAddButton") return;
  button.addEventListener("click", () => { activateRosterSlot(Number(button.dataset.slot)); setEditorPage("paint"); });
});
overlay.querySelectorAll(".rosterSelectButton").forEach(button => button.addEventListener("click", () => {
  void selectRosterCharacter(Number(button.dataset.slot));
}));
overlay.querySelectorAll(".rosterDeleteButton").forEach(button => button.addEventListener("click", () => {
  void deleteRosterCharacter(Number(button.dataset.slot));
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
async function rebuildRosterForCurrentAccount() {
  if (rosterBuildPromise) {
    try { await rosterBuildPromise; } catch {}
  }
  if (currentIdentity !== getIdentity().id) await buildPreview(true);
}

window.addEventListener("webminecraft:account-identity-changed", () => {
  void rebuildRosterForCurrentAccount().catch(error => {
    console.warn("Could not load this account's character presets.", error);
  });
});

window.addEventListener("webminecraft:character-profile-loaded", event => {
  const textures = event.detail?.textures && typeof event.detail.textures === "object" ? event.detail.textures : {};
  const incomingDeletedIds = Array.from(new Set((Array.isArray(event.detail?.deletedCharacterIds) ? event.detail.deletedCharacterIds : [])
    .filter(id => typeof id === "string" && id.length > 0 && id.length <= 128)));
  const incomingRoster = Array.isArray(event.detail?.roster)
    ? Array.from({ length: Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, event.detail.roster.length)) }, (_, index) => {
        const source = event.detail.roster[index], textures = extractTextureMapData(source);
        if (Object.keys(textures).length) return { ...textures,
          __characterId: String(source?.__characterId || "remote-" + index + "-" + hashTextureMap(textures)),
          __characterName: String(source?.__characterName || "Character " + (index + 1)).slice(0, 24),
          __savedAt: Math.max(0, Number(source?.__savedAt) || 0) };
        return source?.__characterId ? { ...source } : null;
      })
    : null;
  const rosterSavedAt = Math.max(0, Number(event.detail?.rosterSavedAt) || 0);

  const applyAccountProfile = async () => {
    await rebuildRosterForCurrentAccount();
    const cachedRoster = readRosterTextureStore();
    const deletedIds = Array.from(new Set([...(cachedRoster.deletedIds || []), ...incomingDeletedIds]));
    const deleted = new Set(deletedIds);
    const mergedRoster = incomingRoster ? mergeRosterSlots(cachedRoster.slots, incomingRoster) : cachedRoster.slots;
    const rosterToApply = mergedRoster.map(record => deleted.has(record?.__characterId) ? null : record);
    const activeTextures = extractTextureMapData(textures);
    if (Object.keys(activeTextures).length) {
      const previousMain = rosterToApply[MAIN_PROFILE_SLOT];
      rosterToApply[MAIN_PROFILE_SLOT] = makeRosterRecord(activeTextures, {
        id: previousMain?.__characterId || "main-" + getIdentity().id,
        name: previousMain?.__characterName || "Main Character",
        savedAt: rosterSavedAt || Date.now()
      });
      writeCharacterTextureRecord(activeTextures, rosterSavedAt || Date.now());
    }
    rosterTextureStore = { slots: rosterToApply, deletedIds, savedAt: Math.max(cachedRoster.savedAt || 0, rosterSavedAt) };
    writeRosterTextureStore(rosterTextureStore.savedAt || Date.now());
    await buildPreview(true);
    setRosterWindow(MAIN_PROFILE_SLOT);
    activateRosterSlot(MAIN_PROFILE_SLOT);
    if (overlay.classList.contains("open") && editorPage === "paint") copySelectedTextureToEditor();
    scheduleLivePreview(); updateRosterCards(); resize();
  };

  void applyAccountProfile().catch(error => {
    console.warn("Could not apply saved account characters.", error);
  });
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
  const rosterTracking = editorOpen && editorPage === "roster";
  const centerAvatar = rosterTracking ? rosterAvatars[rosterOrder[2]] : null;
  const headTargets = rosterTracking ? rosterAvatars : [previewAvatar];
  for (const avatar of headTargets) {
    if (!avatar?.parts?.head) continue;
    const head = avatar.parts.head;
    const followsMouse = !rosterTracking || avatar === centerAvatar;
    const targetYaw = followsMouse ? headLookX * 0.62 : 0;
    const targetPitch = followsMouse ? -headLookY * 0.36 : 0;
    head.rotation.order = "YXZ";
    head.rotation.y += (targetYaw - head.rotation.y) * 0.16;
    head.rotation.x += (targetPitch - head.rotation.x) * 0.16;
  }
  if ((editorOpen || showcaseVisible) && renderer && scene && camera && previewAvatar) renderer.render(scene, camera);
}
render();
