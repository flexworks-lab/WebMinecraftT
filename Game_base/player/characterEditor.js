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
const LOCKER_CATEGORIES = ["HATS", "FACES", "TOPS", "MUSCLES", "PANTS", "HANDS"];
const LOCKER_ITEMS = [
  { id:"cap-cobalt", name:"Cobalt Cap", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#285b9c", accent:"#8dc8ff", pattern:"cap", tag:"HEADWEAR" },
  { id:"beanie-violet", name:"Violet Beanie", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#60438e", accent:"#c7a8ff", pattern:"beanie", tag:"HEADWEAR" },
  { id:"crown-gold", name:"Gold Crown", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#b98520", accent:"#ffe28a", pattern:"crown", tag:"HEADWEAR" },
  { id:"visor-ice", name:"Ice Visor", category:"FACES", slot:"face", keys:["face"], base:"#253d57", accent:"#9be8ff", pattern:"visor", tag:"FACE" },
  { id:"warpaint-ember", name:"Ember Warpaint", category:"FACES", slot:"face", keys:["face"], base:"#c68c67", accent:"#a62f29", pattern:"warpaint", tag:"FACE" },
  { id:"shadow-mask", name:"Shadow Mask", category:"FACES", slot:"face", keys:["face"], base:"#c68c67", accent:"#232832", pattern:"mask", tag:"FACE" },
  { id:"arctic-jacket", name:"Arctic Jacket", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#354f70", accent:"#a8d5ee", pattern:"jacket", tag:"OUTFIT" },
  { id:"ember-armor", name:"Ember Armor", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#773c35", accent:"#e7a34c", pattern:"armor", tag:"OUTFIT" },
  { id:"night-hoodie", name:"Night Hoodie", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#242b39", accent:"#7689aa", pattern:"hoodie", tag:"OUTFIT" },
  { id:"power-build", name:"Power Build", category:"MUSCLES", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#b87954", accent:"#704533", pattern:"muscles", tag:"BODY" },
  { id:"athletic-build", name:"Athletic Build", category:"MUSCLES", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#d09a72", accent:"#875a43", pattern:"athletic", tag:"BODY" },
  { id:"cargo-olive", name:"Olive Cargo", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#526344", accent:"#a9b982", pattern:"cargo", tag:"LEGS" },
  { id:"denim-dark", name:"Dark Denim", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#273d5c", accent:"#819cb9", pattern:"denim", tag:"LEGS" },
  { id:"track-neon", name:"Neon Track Pants", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#282f3b", accent:"#72d6b8", pattern:"track", tag:"LEGS" },
  { id:"onyx-gloves", name:"Onyx Gloves", category:"HANDS", slot:"hands", keys:["hand"], base:"#202631", accent:"#8297b3", pattern:"gloves", tag:"HANDS" },
  { id:"ember-wraps", name:"Ember Wraps", category:"HANDS", slot:"hands", keys:["hand"], base:"#673b35", accent:"#d78b62", pattern:"wraps", tag:"HANDS" },
  { id:"helmet-iron", name:"Iron Vanguard Helmet", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#59636e", accent:"#c6d0d8", pattern:"helmet", tag:"HEADWEAR" },
  { id:"helmet-emerald", name:"Emerald Sentinel Helm", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#1f725b", accent:"#5fe4ad", pattern:"helmet", tag:"HEADWEAR" },
  { id:"sand-bucket", name:"Sand Explorer Bucket", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#9b8664", accent:"#d8c4a0", pattern:"bucket", tag:"HEADWEAR" },
  { id:"wizard-amethyst", name:"Amethyst Wizard Hat", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#493574", accent:"#bc91ff", pattern:"wizard", tag:"HEADWEAR" },
  { id:"top-hat-noir", name:"Midnight Top Hat", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#1b2027", accent:"#b8c5d4", pattern:"topHat", tag:"HEADWEAR" },
  { id:"headphones-neon", name:"Neon Headphones", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#232a37", accent:"#59e7de", pattern:"headphones", tag:"HEADWEAR" },
  { id:"ranger-hood", name:"Forest Ranger Hood", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#415b3e", accent:"#91ad71", pattern:"hood", tag:"HEADWEAR" },
  { id:"crimson-bandana", name:"Crimson Bandana", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#812f37", accent:"#e6a5a6", pattern:"bandana", tag:"HEADWEAR" },
  { id:"flower-crown", name:"Wildflower Crown", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#5d8f52", accent:"#ffb8c6", pattern:"flower", tag:"HEADWEAR" },
  { id:"void-horns", name:"Void Horns", category:"HATS", slot:"headwear", keys:["headTop","headSide"], base:"#373044", accent:"#aa91de", pattern:"horns", tag:"HEADWEAR" },
  { id:"aviator-goggles", name:"Pilot Goggles", category:"FACES", slot:"face", keys:["face"], base:"#9d7742", accent:"#92d8ec", pattern:"goggles", tag:"FACE" },
  { id:"pixel-shades", name:"Pixel Shades", category:"FACES", slot:"face", keys:["face"], base:"#202936", accent:"#46b8cb", pattern:"shades", tag:"FACE" },
  { id:"frost-mask", name:"Frostbite Mask", category:"FACES", slot:"face", keys:["face"], base:"#d4eaf2", accent:"#76bcd5", pattern:"frostMask", tag:"FACE" },
  { id:"deep-sea-respirator", name:"Deep-Sea Respirator", category:"FACES", slot:"face", keys:["face"], base:"#405567", accent:"#a9c7d9", pattern:"respirator", tag:"FACE" },
  { id:"scarlet-mark", name:"Scarlet War Mark", category:"FACES", slot:"face", keys:["face"], base:"#c58c67", accent:"#bd3640", pattern:"mark", tag:"FACE" },
  { id:"starlight-paint", name:"Starlight Face Paint", category:"FACES", slot:"face", keys:["face"], base:"#c58c67", accent:"#dfd8ff", pattern:"stars", tag:"FACE" },
  { id:"forest-ranger", name:"Forest Ranger Jacket", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#40583c", accent:"#a1b77a", pattern:"jacket", tag:"OUTFIT" },
  { id:"crimson-varsity", name:"Crimson Varsity Jacket", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#71313a", accent:"#f0d5a1", pattern:"varsity", tag:"OUTFIT" },
  { id:"deep-sea-suit", name:"Deep-Sea Diving Suit", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#294b66", accent:"#67c8dc", pattern:"suit", tag:"OUTFIT" },
  { id:"obsidian-chest", name:"Obsidian Chestplate", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#30283d", accent:"#a58bd2", pattern:"armor", tag:"OUTFIT" },
  { id:"desert-poncho", name:"Desert Poncho", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#9b744d", accent:"#e0bd79", pattern:"cloak", tag:"OUTFIT" },
  { id:"creeper-hoodie", name:"Creeper Hoodie", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#315d42", accent:"#7fd36f", pattern:"hoodie", tag:"OUTFIT" },
  { id:"arctic-parka", name:"Arctic Expedition Parka", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#738b9c", accent:"#d9edf4", pattern:"jacket", tag:"OUTFIT" },
  { id:"royal-tunic", name:"Royal Tunic", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#4b377c", accent:"#e2c36e", pattern:"tunic", tag:"OUTFIT" },
  { id:"mechanic-vest", name:"Mechanic Utility Vest", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#8a713d", accent:"#e5c36b", pattern:"vest", tag:"OUTFIT" },
  { id:"neon-streetwear", name:"Neon Streetwear", category:"TOPS", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#252c3b", accent:"#60e0ce", pattern:"hoodie", tag:"OUTFIT" },
  { id:"heavyweight-build", name:"Heavyweight Build", category:"MUSCLES", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#b87954", accent:"#714332", pattern:"muscles", tag:"BODY" },
  { id:"runner-build", name:"Runner Build", category:"MUSCLES", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#d09a72", accent:"#875a43", pattern:"athletic", tag:"BODY" },
  { id:"defined-build", name:"Defined Build", category:"MUSCLES", slot:"upper", keys:["chest","leftArm","rightArm"], base:"#ba805d", accent:"#744a37", pattern:"defined", tag:"BODY" },
  { id:"snow-camo", name:"Snow-Camo Trousers", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#b7c5cb", accent:"#edf3ef", pattern:"snow", tag:"LEGS" },
  { id:"redline-joggers", name:"Redline Joggers", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#242a34", accent:"#c64a50", pattern:"joggers", tag:"LEGS" },
  { id:"ranger-cargo", name:"Ranger Cargo Pants", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#526344", accent:"#a9b982", pattern:"cargo", tag:"LEGS" },
  { id:"royal-trousers", name:"Royal Trousers", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#49366f", accent:"#d7b96c", pattern:"trousers", tag:"LEGS" },
  { id:"tactical-pants", name:"Tactical Pants", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#303b3d", accent:"#81958b", pattern:"tactical", tag:"LEGS" },
  { id:"netherite-greaves", name:"Netherite Greaves", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#383743", accent:"#8a8292", pattern:"armor", tag:"LEGS" },
  { id:"summer-shorts", name:"Summer Shorts", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#347aa1", accent:"#f1d37c", pattern:"shorts", tag:"LEGS" },
  { id:"ice-track-pants", name:"Ice-Track Pants", category:"PANTS", slot:"legs", keys:["leftLeg","rightLeg"], base:"#344d67", accent:"#82d6e8", pattern:"track", tag:"LEGS" },
  { id:"frost-gauntlets", name:"Frost Gauntlets", category:"HANDS", slot:"hands", keys:["hand"], base:"#637e91", accent:"#d1f3ff", pattern:"gauntlets", tag:"HANDS" },
  { id:"fingerless-gloves", name:"Fingerless Gloves", category:"HANDS", slot:"hands", keys:["hand"], base:"#343b46", accent:"#bf8b5a", pattern:"fingerless", tag:"HANDS" },
  { id:"copper-bracers", name:"Copper Bracers", category:"HANDS", slot:"hands", keys:["hand"], base:"#8e512f", accent:"#d99661", pattern:"bracers", tag:"HANDS" },
  { id:"emerald-wraps", name:"Emerald Wraps", category:"HANDS", slot:"hands", keys:["hand"], base:"#236b51", accent:"#8ce0b0", pattern:"wraps", tag:"HANDS" },
  { id:"void-gloves", name:"Void Gloves", category:"HANDS", slot:"hands", keys:["hand"], base:"#29263a", accent:"#9d89d5", pattern:"gloves", tag:"HANDS" },
  { id:"racer-grips", name:"Racer Grips", category:"HANDS", slot:"hands", keys:["hand"], base:"#303c4a", accent:"#e5b34f", pattern:"fingerless", tag:"HANDS" },
];
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
    __savedAt: Math.max(0, Number(metadata.__savedAt || metadata.savedAt) || Date.now()),
    __lockerItems: metadata.__lockerItems && typeof metadata.__lockerItems === "object" ? { ...metadata.__lockerItems } : {},
    __lockerBaseTextures: extractTextureMapData(metadata.__lockerBaseTextures || {})
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
    if (!record || ![1, 2, 3].includes(Number(record.version)) || !Array.isArray(record.slots)) return { slots: [null, null, null, null, null], deletedIds: [], savedAt: 0 };
    const savedAt = Math.max(0, Number(record.savedAt) || 0);
    const length = Math.min(MAX_ROSTER_CHARACTERS, Math.max(5, record.slots.length));
    const slots = Array.from({ length }, (_, i) => {
      const source = record.slots[i], textures = extractTextureMapData(source);
      if (Object.keys(textures).length) return {
        ...textures,
        __characterId: String(source?.__characterId || "legacy-" + hashTextureMap(textures)),
        __characterName: String(source?.__characterName || (i === MAIN_PROFILE_SLOT ? "Main Character" : "Character " + (i + 1))).slice(0, 24),
        __savedAt: Math.max(0, Number(source?.__savedAt) || savedAt),
        __lockerItems: source?.__lockerItems && typeof source.__lockerItems === "object" ? { ...source.__lockerItems } : {},
        __lockerBaseTextures: extractTextureMapData(source?.__lockerBaseTextures || {})
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
.rosterCardName{min-height:14px;color:#c3cede;font-size:10px;font-weight:800;letter-spacing:1px;text-align:center;border:0;padding:3px 6px;background:transparent;cursor:pointer;font-family:inherit}
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

#characterLockerPage{display:flex;flex-direction:column;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 50% 12%,rgba(45,57,76,.18),transparent 60%),#10151e}
#characterLockerPage[hidden]{display:none!important}
#lockerRosterView{display:flex;flex:1;min-height:0;flex-direction:column;padding:clamp(18px,3vh,30px) clamp(16px,3vw,38px);overflow:auto}
#lockerRosterView[hidden],#lockerCustomizeView[hidden]{display:none!important}
.lockerSectionHeading{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}
.lockerSectionHeading h1{margin:0;color:#fff;font-size:clamp(22px,3vw,34px);letter-spacing:1.6px}
.lockerSectionHeading p{margin:7px 0 0;color:#9eacc0;font-size:12px}
#lockerCharacterCount{padding:8px 11px;border:1px solid #40516a;background:#111c2b;color:#b9cdec;font-size:10px;font-weight:800;letter-spacing:1px;white-space:nowrap}
#lockerRosterGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(142px,1fr));gap:12px;align-content:start;padding-bottom:20px}
.lockerCharacterCard{min-width:0;display:flex;flex-direction:column;align-items:stretch;padding:8px;border:2px solid #343f51;border-top-color:#718096;background:linear-gradient(145deg,#303947,#171e29);color:#fff;text-align:left;cursor:pointer;box-shadow:inset 2px 2px rgba(255,255,255,.08),inset -2px -2px rgba(0,0,0,.3),0 3px #080b10}
.lockerCharacterCard:hover,.lockerCharacterCard:focus-visible{border-color:#9ccaff;background:linear-gradient(145deg,#3e5874,#202d40);outline:none;transform:translateY(-2px)}
.lockerCharacterPortrait{display:block;width:100%;height:118px;image-rendering:pixelated;background:radial-gradient(ellipse at 50% 40%,#59677a,#18202c 70%)}
.lockerCharacterCard strong{padding:8px 2px 2px;font-size:11px;letter-spacing:.7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lockerCharacterCard small{padding:0 2px 5px;color:#9eacc0;font-size:9px}
#lockerCustomizeView{display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden}
#lockerCustomizeHeader{height:48px;min-height:48px;display:flex;align-items:center;gap:16px;padding:0 20px;border-bottom:1px solid rgba(160,180,210,.18);background:#0a1019}
#lockerBackToRoster{height:30px;padding:0 12px;border:1px solid #566982;background:linear-gradient(#43536a,#263346);color:#fff;font-size:10px;font-weight:800;cursor:pointer}
#lockerSelectedName{font-size:12px;letter-spacing:1px;color:#fff}
#lockerCustomizeHeader>span{margin-left:auto;color:#93a8c2;font-size:10px;font-weight:800;letter-spacing:1.5px}
#lockerCustomizeWorkspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,43%);flex:1;min-height:0;overflow:hidden}
#lockerCharacterStage{position:relative;min-width:0;min-height:0;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,rgba(65,82,107,.45),rgba(5,8,13,.98) 72%)}
#lockerCharacterPreview{position:absolute;inset:0;min-width:0;min-height:0}
#lockerCharacterPreview>canvas{display:block;width:100%;height:100%;touch-action:pan-y}
#lockerPreviewHint{position:absolute;left:16px;bottom:14px;padding:8px 10px;border:1px solid rgba(154,181,215,.25);background:rgba(4,8,14,.72);color:#aebfd5;font-size:9px;letter-spacing:1px;pointer-events:none}
#lockerItemsPanel{display:flex;flex-direction:column;min-width:0;min-height:0;padding:16px 14px 12px;border-left:2px solid #080b10;background:linear-gradient(135deg,#252d39,#141a24)}
#lockerItemsHeading{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:12px}
#lockerItemsHeading h2{margin:0;color:#fff;font-size:19px;letter-spacing:1.5px}
#lockerItemsHeading span{color:#91a6c1;font-size:8px;font-weight:800;letter-spacing:.7px}
#lockerCategoryTabs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}
.lockerCategoryTab{height:29px;padding:0 9px;border:1px solid #414d5e;background:#151d29;color:#aebbd0;font-size:9px;font-weight:800;letter-spacing:.5px;cursor:pointer}
.lockerCategoryTab.active{border-color:#a9cfff;background:#345071;color:#fff;box-shadow:0 0 0 1px #8fb5e6}
#lockerItemsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;align-content:start;overflow:auto;min-height:0;padding:2px 4px 14px 2px}
.lockerItemCard{min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:5px;padding:7px;border:2px solid #3a4658;border-top-color:#77859a;background:linear-gradient(145deg,#343f4f,#1d2531);color:#fff;text-align:left;cursor:pointer;box-shadow:inset 1px 1px rgba(255,255,255,.08),inset -1px -1px rgba(0,0,0,.3)}
.lockerItemCard:hover{border-color:#9ecbff;background:linear-gradient(145deg,#405a76,#202e40)}
.lockerItemCard.equipped{border-color:#9fc8f5;background:linear-gradient(145deg,#395a7e,#20344c);box-shadow:0 0 0 1px #8ab8ed,inset 1px 1px rgba(255,255,255,.13)}
.lockerItemCard canvas{display:block;width:100%;aspect-ratio:1;max-height:86px;image-rendering:pixelated;background:#151c28}
.lockerItemCard strong{font-size:9px;line-height:1.25;min-height:22px}
.lockerItemCard small{color:#a8bad1;font-size:8px;letter-spacing:.4px}
#lockerEquippedStatus{flex:0 0 auto;padding:10px 3px 0;border-top:1px solid rgba(160,180,210,.16);color:#9fb3ce;font-size:8px;font-weight:800;letter-spacing:.8px}
@media(max-width:850px){#lockerCustomizeWorkspace{grid-template-columns:minmax(0,1fr) minmax(285px,46%)}#lockerItemsGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){#lockerRosterView{padding:14px 10px}#lockerRosterGrid{grid-template-columns:repeat(auto-fill,minmax(116px,1fr));gap:8px}.lockerCharacterPortrait{height:96px}#lockerCustomizeWorkspace{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(220px,42vh) minmax(0,1fr);overflow:auto}#lockerItemsPanel{border-left:0;border-top:2px solid #080b10;padding:10px}#lockerItemsGrid{grid-template-columns:repeat(3,minmax(0,1fr))}#lockerCustomizeHeader{padding:0 9px;gap:8px}#lockerSelectedName{font-size:10px}#lockerCustomizeHeader>span{font-size:8px}}

/* Minecraft inventory skin for the Item Locker */
#characterLockerPage{
  background:
    repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 2px,transparent 2px 4px),
    linear-gradient(135deg,#777,#555 48%,#414141)!important;
  color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  image-rendering:pixelated;
}
#lockerRosterView,#lockerCustomizeView{background:transparent!important}
.lockerSectionHeading h1,.lockerSectionHeading p,#lockerCharacterCount,
#lockerItemsHeading h2,#lockerItemsHeading span,#lockerEquippedStatus,
#lockerPreviewHint,#lockerSelectedName{font-family:"MinecraftFont",monospace!important}
.lockerSectionHeading h1{font-size:clamp(20px,2.7vw,30px)!important;letter-spacing:0!important;text-shadow:2px 2px #333}
.lockerSectionHeading p{color:#f0f0f0!important;font-size:10px!important}
#lockerCharacterCount{
  border:2px solid #111!important;border-top-color:#ddd!important;border-left-color:#ddd!important;
  background:#555!important;color:#fff!important;box-shadow:inset 2px 2px #888,inset -2px -2px #333!important;
}
.lockerCharacterCard{
  padding:7px!important;border-radius:0!important;
  border:2px solid #111!important;border-top-color:#e0e0e0!important;border-left-color:#e0e0e0!important;
  background:linear-gradient(135deg,#a0a0a0,#777)!important;color:#fff!important;
  box-shadow:inset 2px 2px #cfcfcf,inset -2px -2px #555,0 3px #222!important;
}
.lockerCharacterCard:hover,.lockerCharacterCard:focus-visible{
  border-top-color:#fff!important;border-left-color:#fff!important;
  background:linear-gradient(135deg,#b2b2b2,#888)!important;outline:2px solid #fff!important;
  transform:none!important;
}
.lockerCharacterPortrait{
  height:126px!important;object-fit:contain!important;image-rendering:auto!important;
  background:
    linear-gradient(45deg,#777 25%,transparent 25%,transparent 75%,#777 75%),
    linear-gradient(45deg,#777 25%,transparent 25%,transparent 75%,#777 75%),
    #999!important;
  background-position:0 0,8px 8px!important;background-size:16px 16px!important;
  border:2px solid #333!important;box-shadow:inset 2px 2px #555,inset -2px -2px #bbb!important;
}
.lockerCharacterCard strong{font-family:"MinecraftFont",monospace!important;font-size:9px!important;letter-spacing:0!important;color:#fff!important;text-shadow:2px 2px #333}
.lockerCharacterCard small{font-family:"MinecraftFont",monospace!important;font-size:7px!important;color:#eeeeee!important}
#lockerCustomizeHeader{
  border-bottom:2px solid #111!important;background:#555!important;
  box-shadow:inset 0 2px #aaa!important;
}
#lockerBackToRoster,.lockerCategoryTab,.lockerItemCard{
  border-radius:0!important;border:2px solid #111!important;
  border-top-color:#e0e0e0!important;border-left-color:#e0e0e0!important;
  background:linear-gradient(#999,#747474)!important;color:#fff!important;
  font-family:"MinecraftFont",monospace!important;
  box-shadow:inset 2px 2px #cfcfcf,inset -2px -2px #555,0 2px #222!important;
  text-shadow:2px 2px #444!important;
}
#lockerBackToRoster:hover,.lockerCategoryTab:hover,.lockerItemCard:hover{
  filter:brightness(1.1)!important;border-top-color:#fff!important;border-left-color:#fff!important;
}
#lockerItemsPanel{
  border-left:3px solid #111!important;
  background:linear-gradient(135deg,#8c8c8c,#686868)!important;
  box-shadow:inset 2px 2px #bbb,inset -2px -2px #333!important;
}
#lockerItemsHeading h2{font-size:16px!important;letter-spacing:0!important;text-shadow:2px 2px #333}
#lockerItemsHeading span{color:#f1f1f1!important;font-size:7px!important}
#lockerCategoryTabs{gap:4px!important}
.lockerCategoryTab{height:31px!important;padding:0 8px!important;font-size:8px!important}
.lockerCategoryTab.active{
  background:linear-gradient(#dedede,#aaa)!important;color:#222!important;
  border:2px solid #111!important;border-top-color:#fff!important;border-left-color:#fff!important;
  text-shadow:1px 1px #fff!important;outline:1px solid #222!important;outline-offset:-4px;
}
#lockerItemsGrid{gap:7px!important}
.lockerItemCard{
  padding:6px!important;background:linear-gradient(#929292,#696969)!important;
}
.lockerItemCard.equipped{
  background:linear-gradient(#d2d2d2,#999)!important;color:#222!important;
  border-color:#111!important;border-top-color:#fff!important;border-left-color:#fff!important;
  box-shadow:inset 2px 2px #fff,inset -2px -2px #555,0 0 0 2px #292929!important;
  text-shadow:1px 1px #fff!important;
}
.lockerItemCard canvas{image-rendering:pixelated!important;border:2px solid #333!important;box-shadow:inset 2px 2px #555,inset -2px -2px #bbb!important}
.lockerItemCard strong{font-family:"MinecraftFont",monospace!important;font-size:8px!important}
.lockerItemCard small{font-family:"MinecraftFont",monospace!important;font-size:7px!important;color:#f0f0f0!important}
#lockerEquippedStatus{border-top:2px solid #333!important;color:#fff!important;font-size:7px!important;text-shadow:1px 1px #333}
#lockerCharacterStage{background:radial-gradient(ellipse at 50% 44%,#777 0,#4b4b4b 56%,#292929 100%)!important}
#lockerPreviewHint{border:2px solid #111!important;border-top-color:#bbb!important;border-left-color:#bbb!important;background:#555!important;color:#fff!important;text-shadow:1px 1px #222}
@media(max-width:620px){
 .lockerCharacterPortrait{height:106px!important}
 #lockerItemsPanel{border-top:3px solid #111!important;border-left:0!important}
}

/* Subtle moss-green accents keep the stone inventory look while adding more life. */
#characterEditorShell{
  background:linear-gradient(100deg,rgba(65,88,42,.12),transparent 46%),#242724!important;
}
#characterEditorSidebar{
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.022) 0 2px,transparent 2px 5px),linear-gradient(90deg,#343b2e,#252a23)!important;
}
#characterEditorTopbar{
  background:linear-gradient(#515b43,#373e31)!important;
  border-bottom-color:#1a2115!important;
}
#characterEditorBrandMark{background:linear-gradient(135deg,#77934d,#4b6334)!important}
#characterLockerPage{
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 2px,transparent 2px 4px),linear-gradient(135deg,#737b66,#535d47 52%,#343b2e)!important;
}
#lockerRosterView{background:radial-gradient(ellipse at 50% 12%,rgba(145,183,91,.13),transparent 62%)!important}
#lockerItemsPanel{
  background:linear-gradient(135deg,#657052,#444d3b)!important;
  border-left-color:#22291c!important;
}
#lockerCustomizeHeader{background:linear-gradient(#626e4d,#424b36)!important}
#lockerCharacterCount{border-top-color:#c2d89b!important;background:linear-gradient(#667b49,#455936)!important}
.lockerCharacterCard:hover,.lockerCharacterCard:focus-visible{
  border-top-color:#d5efad!important;border-left-color:#d5efad!important;
  background:linear-gradient(135deg,#81965c,#596c43)!important;
}
.lockerCategoryTab.active{
  background:linear-gradient(#91aa63,#627e40)!important;color:#fff!important;
  border-top-color:#d6eab2!important;border-left-color:#d6eab2!important;
  text-shadow:2px 2px #354328!important;
}
.lockerItemCard:hover{background:linear-gradient(#82965f,#596b43)!important}
.lockerItemCard.equipped{
  background:linear-gradient(#91a96b,#607b45)!important;color:#fff!important;
  border-top-color:#d7edb5!important;border-left-color:#d7edb5!important;
  text-shadow:2px 2px #354328!important;
}
.lockerCharacterPortrait{
  background:radial-gradient(ellipse at 50% 40%,#71805b,#303a2a 72%)!important;
}
.lockerItemCard img.lockerItemPreview3D{
  display:block;width:100%;aspect-ratio:1;max-height:108px;object-fit:contain;
  image-rendering:auto;background:radial-gradient(ellipse at 50% 42%,#75805f,#3a4432 76%);
  border:2px solid #303a28;box-shadow:inset 2px 2px #a0ad86,inset -2px -2px #303a29;
}
#lockerCharacterStage{
  background:radial-gradient(ellipse at 50% 42%,#788366 0,#4c5940 58%,#293125 100%)!important;
}
#lockerPreviewHint{background:linear-gradient(#66764e,#475638)!important;border-top-color:#c2d69c!important;border-left-color:#c2d69c!important}
#characterShowcase #characterEditorOpen{background:linear-gradient(#829b5b,#5d783f)!important;border-top-color:#d6eab0!important;border-left-color:#d6eab0!important}
@media(max-width:620px){
  .lockerCharacterPortrait{height:126px!important}
  .lockerItemCard img.lockerItemPreview3D{max-height:92px}
}
.rosterCardName::after{content:"  ✎";color:#c9e6a6;font-size:9px;opacity:.78}
.rosterCardName:hover,.rosterCardName:focus-visible{color:#e5ffc9!important;text-decoration:underline;text-decoration-color:#a8ca7d;text-underline-offset:3px;outline:none}
#characterRosterRenameHint{margin:7px auto 0;color:#c8dda9;font:8px "MinecraftFont",monospace;letter-spacing:.5px;text-shadow:1px 1px #222}


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
    <button class="characterNavButton" type="button" data-editor-page="locker" title="Item Locker">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v12H4zM3 8l2-4h14l2 4M9 12h6M8 16h8"/></svg><span>Item Locker</span>
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
        <div id="characterRosterRenameHint">CLICK A CHARACTER NAME TO RENAME IT</div>
      </div>
      <div id="characterRosterStage">
        <button class="rosterArrow" id="rosterPrev" type="button" aria-label="Move previous character to center">‹</button>
        <div id="characterRosterCards">
          <div class="rosterCard" data-roster-position="0"><div class="rosterCardNumber">01</div><button class="rosterCardName" type="button" title="Click to rename this character"></button><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="1"><div class="rosterCardNumber">02</div><button class="rosterCardName" type="button" title="Click to rename this character"></button><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="2"><div class="rosterCardNumber">03</div><button class="rosterCardName" type="button" title="Click to rename this character"></button><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="3"><div class="rosterCardNumber">04</div><button class="rosterCardName" type="button" title="Click to rename this character"></button><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
          <div class="rosterCard" data-roster-position="4"><div class="rosterCardNumber">05</div><button class="rosterCardName" type="button" title="Click to rename this character"></button><div class="rosterCardActions"><button class="rosterEditButton" type="button">EDIT</button><button class="rosterSelectButton" type="button">SELECT</button><button class="rosterDeleteButton" type="button">DELETE</button></div></div>
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
    <section id="characterLockerPage" class="characterEditorPage" hidden>
      <div id="lockerRosterView">
        <div class="lockerSectionHeading">
          <div><h1>ITEM LOCKER</h1><p>Choose a character to customize. Your loadout is saved separately for each character.</p></div>
          <span id="lockerCharacterCount">0 CHARACTERS</span>
        </div>
        <div id="lockerRosterGrid"></div>
      </div>
      <div id="lockerCustomizeView" hidden>
        <header id="lockerCustomizeHeader">
          <button id="lockerBackToRoster" type="button">← ALL CHARACTERS</button>
          <strong id="lockerSelectedName">CHARACTER</strong>
          <span>ITEM LOCKER</span>
        </header>
        <div id="lockerCustomizeWorkspace">
          <div id="lockerCharacterStage">
            <div id="lockerCharacterPreview"></div>
            <div id="lockerPreviewHint">FULL CHARACTER PREVIEW · DRAG TO ROTATE</div>
          </div>
          <aside id="lockerItemsPanel">
            <div id="lockerItemsHeading"><h2>LOCKER</h2><span>SELECT AN ITEM TO EQUIP</span></div>
            <nav id="lockerCategoryTabs" aria-label="Locker item categories"></nav>
            <div id="lockerItemsGrid"></div>
            <div id="lockerEquippedStatus">EQUIPMENT SAVES TO THIS CHARACTER</div>
          </aside>
        </div>
      </div>
    </section>
    <section id="characterHelpPage" class="characterEditorPage" hidden>
      <div id="characterHelpPanel">
        <h1>CHARACTER STUDIO GUIDE</h1>
        <p><strong>Browse the roster:</strong> There are five slots arranged from left to right. Use the arrows outside the lineup. The neighbour on that side slides into the center and the rest of the lineup shifts with it.</p>
        <p><strong>Edit or select:</strong> Press EDIT to paint a character. Press SELECT to make that appearance your live in-game character; your previous live appearance is kept in the preset you selected.</p>
        <p><strong>Paint textures:</strong> Choose Face, Head Back, Head Side, Head Top, Skin, Hands, Chest, Left Arm, Right Arm, Left Leg, Right Leg, or Shoes. Each body part has its own 16 × 16 map.</p>
        <p><strong>Item Locker:</strong> Open the Item Locker side tab, choose a character card, then equip or remove hats, faces, tops, muscle designs, pants, and hand items. Each loadout is saved to that character and syncs with your account.</p>
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
let lockerSelectedSlot = null;
let lockerSelectedCategory = "HATS";
let lockerThumbnailGeneration = 0;
const lockerThumbnailImageCache = new Map();
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

function lockerItemById(id) {
  return LOCKER_ITEMS.find(item => item.id === id) || null;
}

function makeLockerHatMesh(item) {
  const hat = new THREE.Group();
  hat.name = "itemLockerHat";
  hat.userData.lockerItemId = item.id;
  const base = new THREE.MeshLambertMaterial({ color: item.base });
  const accent = new THREE.MeshLambertMaterial({ color: item.accent });
  const dark = new THREE.MeshLambertMaterial({ color: 0x27313c });
  const bright = new THREE.MeshLambertMaterial({ color: 0xffe49b });
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hat.add(mesh);
    return mesh;
  };
  const pattern = item.pattern;
  // The head cube is 0.62 units wide and its top is y=0.31. Every piece
  // is a separate voxel mesh parented to the animated head pivot.
  if (pattern === "cap") {
    box(.70, .18, .68, 0, .39, 0, base);
    box(.76, .07, .76, 0, .32, 0, accent);
    box(.75, .055, .30, 0, .29, -.39, base);
    box(.18, .035, .045, 0, .495, -.02, accent);
    box(.24, .025, .045, 0, .50, -.04, bright);
  } else if (pattern === "beanie") {
    box(.68, .16, .68, 0, .39, 0, base);
    box(.72, .075, .72, 0, .325, 0, accent);
    box(.56, .12, .56, 0, .515, 0, base);
    box(.22, .10, .22, 0, .63, 0, accent);
    box(.12, .07, .12, 0, .715, 0, bright);
  } else if (pattern === "crown") {
    box(.70, .12, .70, 0, .35, 0, accent);
    box(.60, .22, .60, 0, .515, 0, base);
    box(.12, .20, .12, -.22, .72, -.22, accent);
    box(.12, .20, .12, .22, .72, -.22, accent);
    box(.12, .20, .12, -.22, .72, .22, accent);
    box(.12, .20, .12, .22, .72, .22, accent);
    box(.12, .12, .12, 0, .68, 0, bright);
    box(.18, .08, .035, 0, .50, -.315, bright);
  } else if (pattern === "helmet") {
    box(.70, .25, .70, 0, .43, 0, base);
    box(.58, .12, .60, 0, .60, -.015, accent);
    box(.73, .08, .74, 0, .34, 0, dark);
    box(.58, .12, .045, 0, .36, .37, bright);
    box(.13, .18, .10, -.30, .32, .22, accent);
    box(.13, .18, .10, .30, .32, .22, accent);
  } else if (pattern === "bucket") {
    box(.70, .16, .70, 0, .39, 0, base);
    box(.82, .07, .82, 0, .32, 0, accent);
    box(.54, .10, .54, 0, .51, 0, base);
    box(.58, .05, .58, 0, .45, 0, dark);
    box(.16, .12, .07, 0, .47, .30, accent);
  } else if (pattern === "wizard") {
    box(.78, .07, .78, 0, .34, 0, accent);
    box(.58, .12, .58, 0, .42, 0, base);
    box(.43, .15, .43, 0, .55, 0, base);
    box(.29, .15, .29, 0, .69, 0, base);
    box(.16, .14, .16, 0, .83, 0, base);
    box(.62, .055, .62, 0, .44, 0, bright);
    box(.035, .16, .035, .12, .70, .18, bright);
  } else if (pattern === "topHat") {
    box(.82, .07, .82, 0, .34, 0, accent);
    box(.55, .42, .55, 0, .57, 0, base);
    box(.58, .08, .58, 0, .79, 0, base);
    box(.57, .07, .58, 0, .49, .01, dark);
    box(.57, .06, .04, 0, .51, .30, accent);
  } else if (pattern === "headphones") {
    box(.68, .07, .12, 0, .65, -.25, dark);
    box(.10, .13, .50, -.32, .48, 0, base);
    box(.10, .13, .50, .32, .48, 0, base);
    box(.14, .16, .24, -.37, .48, .18, accent);
    box(.14, .16, .24, .37, .48, .18, accent);
    box(.06, .08, .12, -.37, .48, .32, bright);
    box(.06, .08, .12, .37, .48, .32, bright);
  } else if (pattern === "hood") {
    box(.72, .28, .72, 0, .43, -.04, base);
    box(.78, .10, .15, 0, .35, .34, accent);
    box(.12, .22, .14, -.33, .34, .28, dark);
    box(.12, .22, .14, .33, .34, .28, dark);
    box(.42, .07, .12, 0, .29, .34, accent);
  } else if (pattern === "bandana") {
    box(.70, .10, .74, 0, .34, 0, base);
    box(.72, .055, .76, 0, .42, 0, accent);
    box(.12, .18, .10, -.30, .28, .31, base);
    box(.12, .18, .10, .30, .28, .31, base);
    box(.05, .09, .045, -.30, .17, .33, accent);
  } else if (pattern === "flower") {
    box(.68, .055, .68, 0, .35, 0, base);
    const flowers = [[-.27,.42,-.19],[.27,.42,-.19],[-.27,.42,.19],[.27,.42,.19],[0,.45,-.31],[0,.45,.31]];
    for (const [x,y,z] of flowers) {
      box(.12,.12,.12,x,y,z,accent);
      box(.07,.07,.07,x,y+.07,z,bright);
    }
    box(.66,.045,.66,0,.38,0,dark);
  } else if (pattern === "horns") {
    box(.68,.14,.68,0,.37,0,base);
    box(.14,.18,.14,-.24,.50,.06,accent);
    box(.12,.15,.12,-.27,.64,.06,base);
    box(.14,.18,.14,.24,.50,.06,accent);
    box(.12,.15,.12,.27,.64,.06,base);
    box(.08,.08,.08,-.29,.74,.06,bright);
    box(.08,.08,.08,.29,.74,.06,bright);
  }
  return hat;
}
function syncLockerAccessories(entry) {
  const head = entry?.parts?.head;
  if (!head) return;
  const previous = head.getObjectByName("itemLockerHat");
  if (previous) {
    head.remove(previous);
    previous.traverse(object => {
      object.geometry?.dispose();
      if (object.material) object.material.dispose();
    });
  }
  entry.lockerHatGroup = null;
  const item = lockerItemById(entry.lockerItems?.headwear);
  if (!item || item.category !== "HATS") return;
  const hat = makeLockerHatMesh(item);
  head.add(hat);
  entry.lockerHatGroup = hat;
}

function captureLocker3DThumbnail(entry, width = 132, height = 164, frame = "full") {
  if (!renderer || !scene || !camera || !entry?.group) return "";
  const size = renderer.getSize(new THREE.Vector2());
  const cameraPosition = camera.position.clone();
  const cameraQuaternion = camera.quaternion.clone();
  const cameraAspect = camera.aspect;
  const cameraFov = camera.fov;
  const saved = rosterAvatars.filter(Boolean).map(avatar => ({
    avatar,
    visible: avatar.group.visible,
    position: avatar.group.position.clone(),
    rotation: avatar.group.rotation.clone(),
    scale: avatar.group.scale.clone()
  }));
  const framing = {
    full:   { fov: 31, position: [1.25, 1.55, 4.55], target: [0, 1.03, 0], scale: 1.14 },
    HATS:   { fov: 27, position: [1.05, 2.04, 2.78], target: [0, 1.73, 0], scale: 1.08 },
    FACES:  { fov: 33, position: [1.3, 1.65, 3.05], target: [0, 1.46, 0], scale: 1.06 },
    TOPS:   { fov: 33, position: [1.3, 1.43, 3.05], target: [0, 1.08, 0], scale: 1.06 },
    MUSCLES:{ fov: 33, position: [1.3, 1.43, 3.05], target: [0, 1.08, 0], scale: 1.06 },
    PANTS:  { fov: 34, position: [1.2, .88, 3.0], target: [0, .48, 0], scale: 1.08 },
    HANDS:  { fov: 37, position: [1.8, 1.16, 3.1], target: [.34, .84, 0], scale: 1.08 }
  }[frame] || {
    fov: 31, position: [1.25, 1.55, 4.55], target: [0, 1.03, 0], scale: 1.14
  };
  try {
    for (const avatar of rosterAvatars) if (avatar) avatar.group.visible = avatar === entry;
    entry.group.position.set(0, 0, 0);
    entry.group.rotation.set(0, Math.PI, 0);
    entry.group.scale.setScalar(framing.scale);
    camera.fov = framing.fov;
    camera.aspect = width / height;
    camera.position.set(...framing.position);
    camera.lookAt(...framing.target);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL("image/png");
  } catch (error) {
    console.warn("Could not render a 3D Item Locker thumbnail.", error);
    return "";
  } finally {
    for (const state of saved) {
      state.avatar.group.visible = state.visible;
      state.avatar.group.position.copy(state.position);
      state.avatar.group.rotation.copy(state.rotation);
      state.avatar.group.scale.copy(state.scale);
    }
    camera.fov = cameraFov;
    camera.aspect = cameraAspect;
    camera.position.copy(cameraPosition);
    camera.quaternion.copy(cameraQuaternion);
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, size.x), Math.max(1, size.y), false);
    if (previewAvatar && renderer.domElement.parentElement) renderer.render(scene, camera);
  }
}

function loadLockerThumbnailImage(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) return Promise.resolve(null);
  if (lockerThumbnailImageCache.has(dataUrl)) return lockerThumbnailImageCache.get(dataUrl);
  const pending = new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
  lockerThumbnailImageCache.set(dataUrl, pending);
  if (lockerThumbnailImageCache.size > 80) lockerThumbnailImageCache.delete(lockerThumbnailImageCache.keys().next().value);
  return pending;
}

async function captureLockerItem3DThumbnail(item, entry, width = 112, height = 112) {
  if (!entry?.group || !entry.textures) return "";
  const previousItems = { ...(entry.lockerItems || {}) };
  const textureBackups = [];
  try {
    if (item.category === "HATS") {
      entry.lockerItems = { ...previousItems, headwear: item.id };
      syncLockerAccessories(entry);
    } else {
      const sourceOverrides = {};
      for (const key of item.keys) {
        const baseUrl = entry.lockerBaseTextures?.[key];
        if (!baseUrl) continue;
        const image = await loadLockerThumbnailImage(baseUrl);
        if (!image) continue;
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = sourceCanvas.height = TEXTURE_SIZE;
        const sourceContext = sourceCanvas.getContext("2d");
        sourceContext.imageSmoothingEnabled = false;
        sourceContext.drawImage(image, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
        sourceOverrides[key] = sourceCanvas;
      }
      const previewMaps = item.keys.map(key => ({
        key,
        canvas: buildLockerTextureCanvas(item, key, entry, sourceOverrides[key] || null)
      }));
      for (const previewMap of previewMaps) {
        const texture = entry.textures[previewMap.key];
        const target = getTextureCanvas(entry.textures, previewMap.key);
        const context = target?.getContext("2d", { willReadFrequently: true });
        if (!texture || !target || !context) continue;
        textureBackups.push({ texture, context, pixels: context.getImageData(0, 0, TEXTURE_SIZE, TEXTURE_SIZE) });
        context.clearRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
        context.drawImage(previewMap.canvas, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
        texture.needsUpdate = true;
      }
    }
    return captureLocker3DThumbnail(entry, width, height, item.category);
  } catch (error) {
    console.warn("Could not build a 3D item preview.", item.name, error);
    return "";
  } finally {
    for (const backup of textureBackups) {
      backup.context.putImageData(backup.pixels, 0, 0);
      backup.texture.needsUpdate = true;
    }
    entry.lockerItems = previousItems;
    syncLockerAccessories(entry);
  }
}

function buildLockerTextureCanvas(item, key, avatar, sourceOverride = null) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = sourceOverride || getTextureCanvas(avatar?.textures, key);
  ctx.imageSmoothingEnabled = false;
  if (source) ctx.drawImage(source, 0, 0, 16, 16);
  else {
    ctx.fillStyle = item.base;
    ctx.fillRect(0, 0, 16, 16);
  }
  const base = item.base, accent = item.accent;
  const px = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  const pattern = item.pattern;

  if (item.category === "HATS") {
    if (key === "headTop") {
      px(1, 2, 14, 11, base);
      if (pattern === "wizard") {
        px(5, 0, 6, 3, accent); px(4, 3, 8, 3, base); px(2, 6, 12, 3, base);
        px(0, 10, 16, 4, accent); px(7, 2, 2, 2, "#fff0b0");
      } else if (pattern === "helmet") {
        px(1, 1, 14, 12, base); px(3, 0, 10, 4, accent); px(0, 11, 16, 3, "#303b45");
      } else if (pattern === "bucket") {
        px(1, 1, 14, 11, base); px(0, 9, 16, 4, accent); px(4, 0, 8, 2, "#d8c4a0");
      } else if (pattern === "topHat") {
        px(4, 0, 8, 10, base); px(2, 9, 12, 4, accent); px(5, 2, 6, 2, "#414a56");
      } else if (pattern === "headphones") {
        px(1, 1, 14, 3, accent); px(0, 4, 3, 8, base); px(13, 4, 3, 8, base);
        px(1, 11, 14, 3, "#202936");
      } else if (pattern === "hood") {
        px(0, 1, 16, 11, base); px(2, 0, 12, 3, accent); px(1, 11, 14, 4, "#202a20");
      } else if (pattern === "bandana") {
        px(0, 9, 16, 4, base); px(2, 7, 12, 3, accent); px(2, 13, 3, 2, base);
      } else if (pattern === "flower") {
        px(1, 10, 14, 3, base); px(2, 8, 3, 3, accent); px(7, 7, 3, 3, "#f7e2a0"); px(12, 8, 3, 3, accent);
      } else if (pattern === "horns") {
        px(0, 1, 16, 11, base); px(0, 0, 3, 5, accent); px(13, 0, 3, 5, accent);
        px(1, 0, 2, 3, "#d4c5f4"); px(13, 0, 2, 3, "#d4c5f4");
      } else {
        px(3, 0, 10, 3, accent); px(0, 10, 16, 3, accent);
        if (pattern === "crown") { px(1, 0, 3, 4, accent); px(6, 0, 4, 4, accent); px(12, 0, 3, 4, accent); }
        else if (pattern === "beanie") { px(2, 1, 12, 3, accent); px(6, 0, 4, 2, "#e7ddff"); }
        else { px(2, 12, 12, 2, "#17202d"); px(10, 8, 5, 2, accent); }
      }
    } else {
      px(0, 0, 16, 5, base);
      px(0, 4, 16, 2, accent);
      if (pattern === "helmet") { px(0, 6, 16, 5, "#303b45"); px(2, 8, 12, 2, accent); }
      if (pattern === "bucket") { px(0, 6, 16, 5, accent); px(2, 11, 12, 2, base); }
      if (pattern === "wizard") { px(2, 0, 12, 3, base); px(1, 5, 14, 2, accent); }
      if (pattern === "topHat") { px(2, 0, 12, 12, base); px(2, 4, 12, 2, accent); }
      if (pattern === "headphones") { px(0, 2, 3, 12, accent); px(13, 2, 3, 12, accent); }
      if (pattern === "hood") { px(0, 0, 3, 14, base); px(13, 0, 3, 14, base); }
      if (pattern === "bandana") { px(0, 3, 16, 5, accent); px(0, 8, 3, 5, base); }
      if (pattern === "flower") { px(2, 6, 3, 3, accent); px(7, 5, 3, 3, "#f7e2a0"); px(12, 6, 3, 3, accent); }
      if (pattern === "horns") { px(0, 0, 3, 5, accent); px(13, 0, 3, 5, accent); }
      if (pattern === "crown") { px(2, 0, 2, 3, accent); px(7, 0, 2, 3, accent); px(12, 0, 2, 3, accent); }
      if (pattern === "beanie") { px(1, 0, 14, 2, accent); px(2, 6, 12, 1, accent); }
    }
  } else if (item.category === "FACES") {
    if (pattern === "visor") {
      px(0, 5, 16, 5, base); px(1, 6, 14, 3, accent); px(2, 7, 4, 1, "#efffff"); px(10, 7, 4, 1, "#efffff");
    } else if (pattern === "warpaint" || pattern === "mark") {
      px(2, 5, 3, 6, accent); px(11, 5, 3, 6, accent);
      if (pattern === "mark") { px(6, 3, 4, 2, accent); px(7, 5, 2, 6, accent); }
      else px(6, 8, 4, 2, "#f2c49d");
    } else if (pattern === "mask" || pattern === "frostMask") {
      px(0, 8, 16, 7, base); px(1, 7, 14, 4, accent);
      px(3, 8, 3, 2, "#80c4d7"); px(10, 8, 3, 2, "#80c4d7");
      if (pattern === "frostMask") { px(0, 12, 16, 2, "#eafaff"); px(5, 8, 6, 2, "#c4eaf3"); }
    } else if (pattern === "goggles" || pattern === "shades") {
      px(1, 6, 6, 4, pattern === "goggles" ? "#b98742" : base);
      px(9, 6, 6, 4, pattern === "goggles" ? "#b98742" : base);
      px(2, 7, 4, 2, accent); px(10, 7, 4, 2, accent);
      px(7, 7, 2, 1, "#272d35");
      if (pattern === "goggles") { px(2, 6, 4, 1, "#f6e0a1"); px(10, 6, 4, 1, "#f6e0a1"); }
      else { px(0, 7, 2, 1, base); px(14, 7, 2, 1, base); }
    } else if (pattern === "respirator") {
      px(3, 8, 10, 6, base); px(2, 9, 3, 4, accent); px(11, 9, 3, 4, accent);
      px(6, 9, 4, 4, "#c1d0d9"); px(7, 10, 2, 2, "#384a5a");
    } else if (pattern === "stars") {
      px(3, 5, 2, 2, accent); px(11, 5, 2, 2, accent);
      px(7, 3, 2, 2, "#fff2a5"); px(5, 11, 2, 2, accent); px(10, 11, 2, 2, accent);
    } else {
      px(0, 8, 16, 7, base); px(1, 7, 14, 4, accent); px(3, 8, 3, 2, "#80c4d7"); px(10, 8, 3, 2, "#80c4d7");
    }
  } else if (item.category === "TOPS") {
    px(0, 0, 16, 16, base);
    px(0, 0, 2, 16, accent); px(14, 0, 2, 16, accent);
    if (pattern === "armor") {
      px(0, 1, 5, 4, "#a9b5c3"); px(11, 1, 5, 4, "#a9b5c3");
      px(4, 6, 8, 2, accent); px(5, 10, 6, 5, "#313b4b");
      px(0, 0, 16, 2, "#d5dce5");
    } else if (pattern === "suit" || pattern === "tunic") {
      px(7, 0, 2, 16, "#172332");
      px(6, 1, 4, 3, "#f2e7d4"); px(7, 4, 2, 3, pattern === "suit" ? "#c4474d" : accent);
      px(3, 9, 3, 3, accent); px(10, 9, 3, 3, accent);
      if (pattern === "tunic") { px(0, 13, 16, 2, "#d8ba66"); px(6, 13, 4, 2, "#d8ba66"); }
    } else if (pattern === "cloak") {
      px(1, 0, 14, 16, base); px(0, 0, 3, 16, accent); px(13, 0, 3, 16, accent);
      px(4, 0, 8, 3, "#ead39e"); px(6, 5, 4, 4, accent); px(7, 6, 2, 2, base);
    } else if (pattern === "vest") {
      px(0, 0, 4, 16, "#333b3c"); px(12, 0, 4, 16, "#333b3c");
      px(4, 1, 8, 8, base); px(4, 9, 3, 4, accent); px(9, 9, 3, 4, accent);
      px(7, 0, 2, 16, "#252d31");
    } else if (pattern === "varsity") {
      px(0, 0, 3, 16, "#f0d5a1"); px(13, 0, 3, 16, "#f0d5a1");
      px(7, 0, 2, 16, "#f0d5a1"); px(3, 2, 3, 3, accent); px(10, 2, 3, 3, accent);
    } else {
      px(7, 0, 2, 16, "#172332"); px(6, 2, 4, 2, accent);
      for (let y = 5; y < 15; y += 4) px(7, y, 2, 1, "#d5e3ef");
      if (pattern === "hoodie") { px(4, 0, 8, 3, "#4b5669"); px(5, 11, 6, 4, "#111925"); }
      if (key !== "chest") { px(0, 0, 16, 3, accent); px(0, 13, 16, 3, "#182434"); }
    }
  } else if (item.category === "MUSCLES") {
    px(0, 0, 16, 16, base);
    if (key === "chest") {
      px(2, 2, 5, 5, accent); px(9, 2, 5, 5, accent);
      px(3, 3, 3, 3, base); px(10, 3, 3, 3, base);
      px(4, 8, 3, 3, accent); px(9, 8, 3, 3, accent);
      px(5, 9, 2, 2, base); px(9, 9, 2, 2, base);
      px(7, 3, 2, 11, "#523b34"); px(3, 13, 10, 2, "#5d4037");
      if (pattern === "athletic") { px(1, 1, 2, 14, "#e1b08b"); px(13, 1, 2, 14, "#e1b08b"); }
      if (pattern === "defined") { px(4, 3, 2, 3, "#e5b18a"); px(10, 3, 2, 3, "#e5b18a"); px(6, 7, 4, 2, "#714a38"); }
    } else {
      px(0, 2, 3, 11, accent); px(13, 2, 3, 11, accent);
      px(2, 5, 2, 5, base); px(12, 5, 2, 5, base);
    }
  } else if (item.category === "PANTS") {
    px(0, 0, 16, 16, base);
    px(1, 0, 2, 16, accent); px(13, 0, 2, 16, accent);
    px(6, 0, 1, 16, "#182431"); px(9, 0, 1, 16, "#182431");
    if (pattern === "cargo") { px(3, 5, 3, 4, "#a4ad79"); px(10, 5, 3, 4, "#a4ad79"); px(3, 10, 3, 2, "#333f32"); px(10, 10, 3, 2, "#333f32"); }
    if (pattern === "denim") { px(3, 2, 2, 12, "#526b8b"); px(11, 2, 2, 12, "#526b8b"); px(7, 1, 2, 2, accent); }
    if (pattern === "track") { px(4, 0, 2, 16, accent); px(10, 0, 2, 16, accent); }
    if (pattern === "snow") { for (let y=2;y<15;y+=4) { px(3,y,2,2,"#edf3ef"); px(10,y+1,2,2,"#d5e2e7"); } }
    if (pattern === "joggers") { px(3, 1, 2, 14, accent); px(11, 1, 2, 14, accent); px(4, 13, 8, 2, "#151b23"); }
    if (pattern === "trousers") { px(4, 0, 2, 16, accent); px(10, 0, 2, 16, accent); px(7, 1, 2, 3, "#e9d18a"); }
    if (pattern === "tactical") { px(3, 3, 3, 4, "#66796f"); px(10, 3, 3, 4, "#66796f"); px(3, 9, 3, 3, "#222c30"); px(10, 9, 3, 3, "#222c30"); }
    if (pattern === "armor") { px(2, 1, 4, 13, "#777785"); px(10, 1, 4, 13, "#777785"); px(3, 2, 2, 10, accent); px(11, 2, 2, 10, accent); }
    if (pattern === "shorts") { px(1, 0, 14, 10, base); px(1, 10, 5, 6, "#d5bd80"); px(10, 10, 5, 6, "#d5bd80"); px(7, 0, 2, 8, accent); }
  } else if (item.category === "HANDS") {
    px(0, 0, 16, 16, base);
    px(1, 0, 14, 4, accent); px(2, 5, 12, 3, base); px(2, 9, 12, 5, accent);
    if (pattern === "gloves" || pattern === "gauntlets") {
      px(1, 13, 14, 3, "#111820"); px(4, 2, 2, 7, "#b5c7dc"); px(10, 2, 2, 7, "#b5c7dc");
      if (pattern === "gauntlets") { px(0, 0, 16, 3, "#d6f1fa"); px(2, 8, 12, 5, "#4e7189"); px(4, 9, 8, 2, accent); }
    } else if (pattern === "wraps") {
      px(0, 5, 16, 2, "#e9ad78"); px(0, 10, 16, 2, "#e9ad78");
      px(2, 2, 12, 2, accent);
    } else if (pattern === "bracers") {
      px(0, 3, 16, 4, "#bd7846"); px(1, 4, 14, 2, "#efbd72"); px(0, 11, 16, 3, "#75432c");
    } else if (pattern === "fingerless") {
      px(1, 0, 14, 3, "#202a34"); px(2, 7, 12, 4, accent); px(2, 12, 12, 4, "#d0a070");
      px(4, 12, 2, 3, "#efc79d"); px(10, 12, 2, 3, "#efc79d");
    }
  }
  return canvas;
}

function drawLockerCharacterPortrait(avatar, canvas) {
  const ctx = canvas.getContext("2d");
  const maps = avatar?.textures || {};
  const drawMap = (key, x, y, w, h, fallback) => {
    const source = getTextureCanvas(maps, key);
    if (source) ctx.drawImage(source, x, y, w, h);
    else { ctx.fillStyle = fallback; ctx.fillRect(x, y, w, h); }
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#182231"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#26374e"; ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.imageSmoothingEnabled = false;
  drawMap("headTop", 29, 5, 38, 16, "#453020");
  drawMap("headSide", 26, 13, 44, 22, "#453020");
  drawMap("face", 31, 17, 34, 31, "#c58c68");
  drawMap("leftArm", 13, 49, 15, 43, "#48688b");
  drawMap("rightArm", 69, 49, 15, 43, "#48688b");
  drawMap("chest", 28, 47, 41, 48, "#48688b");
}

function renderLockerRoster() {
  const grid = overlay.querySelector("#lockerRosterGrid");
  grid.replaceChildren();
  const deletedIds = new Set(rosterTextureStore.deletedIds || []);
  const entries = rosterAvatars.filter(entry => {
    if (!entry) return false;
    if (entry.slotIndex === MAIN_PROFILE_SLOT) return true;
    const record = rosterTextureStore.slots[entry.slotIndex];
    return Boolean(record?.__characterId && !deletedIds.has(String(record.__characterId)));
  });
  overlay.querySelector("#lockerCharacterCount").textContent = entries.length + " CHARACTERS";
  const thumbnailQueue = [];
  const generation = ++lockerThumbnailGeneration;
  for (const entry of entries) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lockerCharacterCard";
    button.dataset.slot = String(entry.slotIndex);
    const portrait = document.createElement("img");
    portrait.className = "lockerCharacterPortrait";
    portrait.alt = "3D preview of " + (entry.characterName || "character");
    portrait.loading = "lazy";
    const name = document.createElement("strong");
    name.textContent = rosterTextureStore.slots[entry.slotIndex]?.__characterName ||
      (entry.slotIndex === MAIN_PROFILE_SLOT ? "MAIN CHARACTER" : (entry.characterName || "CHARACTER " + (entry.slotIndex + 1)));
    const saved = document.createElement("small");
    saved.textContent = hasTextureMaps(rosterTextureStore.slots[entry.slotIndex]) ? "CUSTOM CHARACTER" : "UNMODIFIED PREVIEW";
    button.append(portrait, name, saved);
    button.addEventListener("click", () => {
      lockerThumbnailGeneration++;
      pushEditorIntoTexture();
      rememberActiveEditorState();
      activateRosterSlot(entry.slotIndex);
      lockerSelectedSlot = entry.slotIndex;
      syncLockerAccessories(entry);
      setEditorPage("locker");
    });
    grid.appendChild(button);
    thumbnailQueue.push({ entry, portrait });
  }

  // Render real model thumbnails from the same 3D scene used by the large preview.
  // A few per frame keeps the locker responsive with large character collections.
  let nextIndex = 0;
  const renderBatch = () => {
    if (generation !== lockerThumbnailGeneration || editorPage !== "locker" || lockerSelectedSlot !== null) return;
    const stop = Math.min(nextIndex + 3, thumbnailQueue.length);
    while (nextIndex < stop) {
      const item = thumbnailQueue[nextIndex++];
      if (!item.portrait.isConnected) continue;
      const image = captureLocker3DThumbnail(item.entry, 104, 126);
      if (image) item.portrait.src = image;
    }
    if (nextIndex < thumbnailQueue.length) requestAnimationFrame(renderBatch);
  };
  requestAnimationFrame(renderBatch);
}

function renderLockerItems() {
  const tabs = overlay.querySelector("#lockerCategoryTabs");
  const grid = overlay.querySelector("#lockerItemsGrid");
  tabs.replaceChildren();
  grid.replaceChildren();
  for (const category of LOCKER_CATEGORIES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lockerCategoryTab" + (category === lockerSelectedCategory ? " active" : "");
    button.textContent = category;
    button.addEventListener("click", () => { lockerSelectedCategory = category; renderLockerItems(); });
    tabs.appendChild(button);
  }
  const entry = previewAvatar;
  const equipped = entry?.lockerItems || {};
  const visibleItems = LOCKER_ITEMS.filter(item => item.category === lockerSelectedCategory);
  const thumbnailQueue = [];
  for (const item of visibleItems) {
    const button = document.createElement("button");
    button.type = "button";
    const isEquipped = equipped[item.slot] === item.id;
    button.className = "lockerItemCard" + (isEquipped ? " equipped" : "");
    const preview = document.createElement("img");
    preview.className = "lockerItemPreview3D";
    preview.alt = "3D model preview of " + item.name;
    preview.loading = "lazy";
    const title = document.createElement("strong");
    title.textContent = item.name;
    const sub = document.createElement("small");
    sub.textContent = isEquipped ? "EQUIPPED · CLICK TO REMOVE" : item.tag;
    button.append(preview, title, sub);
    button.addEventListener("click", () => { void equipLockerItem(item); });
    grid.appendChild(button);
    thumbnailQueue.push({ item, preview });
  }
  const generation = ++lockerThumbnailGeneration;
  let nextIndex = 0;
  const renderBatch = async () => {
    if (generation !== lockerThumbnailGeneration || editorPage !== "locker" || lockerSelectedSlot === null) return;
    const stop = Math.min(nextIndex + 2, thumbnailQueue.length);
    while (nextIndex < stop) {
      const queued = thumbnailQueue[nextIndex++];
      const image = await captureLockerItem3DThumbnail(queued.item, entry, 112, 112);
      if (generation !== lockerThumbnailGeneration || editorPage !== "locker" || lockerSelectedSlot === null) return;
      if (image && queued.preview.isConnected) queued.preview.src = image;
    }
    if (nextIndex < thumbnailQueue.length) requestAnimationFrame(() => { void renderBatch(); });
  };
  requestAnimationFrame(() => { void renderBatch(); });
  const equippedCount = Object.keys(equipped).length;
  overlay.querySelector("#lockerEquippedStatus").textContent =
    equippedCount + " ITEMS EQUIPPED · SAVED TO THIS CHARACTER";
}

async function persistLockerLoadout(entry) {
  const slot = entry.slotIndex;
  const savedAt = Date.now();
  const textures = captureFullTextureData(entry);
  const previous = rosterTextureStore.slots[slot] || {};
  const record = makeRosterRecord(textures, {
    __characterId: previous.__characterId || entry.characterId || createCharacterId(),
    __characterName: previous.__characterName || entry.characterName || (slot === MAIN_PROFILE_SLOT ? "Main Character" : "Character " + (slot + 1)),
    __savedAt: savedAt,
    __lockerItems: entry.lockerItems || {},
    __lockerBaseTextures: entry.lockerBaseTextures || {}
  });
  if (!record) return false;
  rosterTextureStore.slots[slot] = record;
  if (!writeRosterTextureStore(savedAt)) return false;
  entry.characterId = record.__characterId;
  entry.characterName = record.__characterName;
  entry.savedTextureData = { ...textures };
  entry.dirtyTextureKeys = new Set();
  entry.resetOverridesPending = false;
  if (previewAvatar === entry) {
    savedTextureData = { ...textures };
    dirtyTextureKeys.clear();
    resetOverridesPending = false;
  }
  updateRosterCards();
  let rosterSaved = false;
  try {
    rosterSaved = Boolean(await window.webMinecraftSaveCharacterRoster?.(
      rosterTextureStore.slots, savedAt, rosterTextureStore.deletedIds || []
    ));
  } catch (error) { console.warn("Locker items saved in this browser, but roster sync failed.", error); }
  if (slot === MAIN_PROFILE_SLOT) {
    writeCharacterTextureRecord(textures, savedAt);
    sendCharacterSkin(textures);
    window.dispatchEvent(new CustomEvent("webminecraft:character-changed", { detail: { textures } }));
    let profileSaved = false;
    try { profileSaved = Boolean(await window.webMinecraftSaveCharacterProfile?.(textures, savedAt)); }
    catch (error) { console.warn("Locker items saved locally, but active profile sync failed.", error); }
    return rosterSaved || profileSaved;
  }
  return rosterSaved;
}

async function equipLockerItem(item) {
  const entry = previewAvatar;
  if (!entry || lockerSelectedSlot !== entry.slotIndex) return;

  const slot = item.slot;
  const currentId = entry.lockerItems?.[slot] || "";
  const previousItem = lockerItemById(currentId);
  const baseTextures = { ...(entry.lockerBaseTextures || {}) };

  // Restore the original texture maps before replacing or removing an item.
  if (previousItem) {
    const restore = {};
    for (const key of previousItem.keys) {
      if (baseTextures[key]) restore[key] = baseTextures[key];
    }
    if (Object.keys(restore).length) await applyAvatarTextureData(entry.textures, restore);

    if (currentId === item.id) {
      delete entry.lockerItems[slot];
      for (const key of previousItem.keys) delete baseTextures[key];
      entry.lockerBaseTextures = baseTextures;
      entry.dirtyTextureKeys = new Set(previousItem.keys);
      if (previousItem.category === "HATS") syncLockerAccessories(entry);
      const synced = await persistLockerLoadout(entry);
      renderLockerItems();
      overlay.querySelector("#lockerEquippedStatus").textContent =
        synced ? "ITEM REMOVED · CHARACTER SAVED" : "ITEM REMOVED · LOCAL SAVE";
      scheduleLivePreview();
      scheduleOnlineSkinSync();
      return;
    }
  }

  // Keep one pristine copy per texture surface. Cosmetic pixels are written
  // into the avatar maps as well as the local 3D hat mesh, so multiplayer
  // players and signed-in devices see the same complete outfit.
  for (const key of item.keys) {
    if (!baseTextures[key]) {
      const canvas = getTextureCanvas(entry.textures, key);
      if (canvas) baseTextures[key] = canvas.toDataURL("image/png");
    }
  }

  const maps = {};
  for (const key of item.keys) {
    const canvas = buildLockerTextureCanvas(item, key, entry);
    maps[key] = canvas.toDataURL("image/png");
  }
  await applyAvatarTextureData(entry.textures, maps);
  entry.lockerItems = { ...(entry.lockerItems || {}), [slot]: item.id };
  entry.lockerBaseTextures = baseTextures;
  entry.dirtyTextureKeys = new Set(item.keys);
  if (item.category === "HATS") syncLockerAccessories(entry);

  const synced = await persistLockerLoadout(entry);
  renderLockerItems();
  overlay.querySelector("#lockerEquippedStatus").textContent =
    synced ? item.name.toUpperCase() + " EQUIPPED · SAVED" : item.name.toUpperCase() + " EQUIPPED · LOCAL SAVE";
  scheduleLivePreview();
  scheduleOnlineSkinSync();
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
    const nameButton = card.querySelector(".rosterCardName");
    nameButton.textContent = name;
    nameButton.dataset.slot = String(slot);
    nameButton.setAttribute("aria-label", "Rename " + name);
    nameButton.title = "Click to rename " + name;
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
  main.lockerItems = { ...(nextMainRecord?.__lockerItems || {}) };
  main.lockerBaseTextures = extractTextureMapData(nextMainRecord?.__lockerBaseTextures || {});
  main.dirtyTextureKeys = new Set(); main.resetOverridesPending = false;
  if (previousMainWasSaved) {
    selected.savedTextureData = { ...previousMainTextures };
    selected.characterId = nextPresetRecord?.__characterId || selected.characterId;
    selected.characterName = nextPresetRecord?.__characterName || selected.characterName;
    selected.lockerItems = { ...(nextPresetRecord?.__lockerItems || {}) };
    selected.lockerBaseTextures = extractTextureMapData(nextPresetRecord?.__lockerBaseTextures || {});
    selected.dirtyTextureKeys = new Set(); selected.resetOverridesPending = false;
    selected.group.rotation.y = Math.PI;
  }
  syncLockerAccessories(main);
  if (previousMainWasSaved) syncLockerAccessories(selected);
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

async function renameRosterCharacter(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= rosterAvatars.length) return;
  const avatar = rosterAvatars[slot];
  if (!avatar) return;
  const currentRecord = rosterTextureStore.slots[slot] || {};
  const currentName = String(currentRecord.__characterName || avatar.characterName ||
    (slot === MAIN_PROFILE_SLOT ? "Main Character" : "Character " + (slot + 1))).slice(0, 24);
  const entered = window.prompt("Name this character (1–24 characters):", currentName);
  if (entered === null) return;
  const name = String(entered).trim().replace(/\s+/g, " ").slice(0, 24);
  if (!name) {
    alert("Character names cannot be empty.");
    return;
  }
  const previousRecord = currentRecord;
  const previousName = avatar.characterName;
  const savedAt = Date.now();
  const id = String(currentRecord.__characterId || avatar.characterId || createCharacterId());
  const nextRecord = hasTextureMaps(currentRecord)
    ? makeRosterRecord(currentRecord, { ...currentRecord, __characterId: id, __characterName: name, __savedAt: savedAt })
    : { ...currentRecord, __characterId: id, __characterName: name, __savedAt: savedAt };
  rosterTextureStore.slots[slot] = nextRecord;
  avatar.characterId = id;
  avatar.characterName = name;
  if (!writeRosterTextureStore(savedAt)) {
    rosterTextureStore.slots[slot] = previousRecord;
    avatar.characterName = previousName;
    alert("This browser could not save the character name. Free some browser storage and try again.");
    updateRosterCards();
    return;
  }

  updateRosterCards();
  renderLockerRoster();
  if (selectedRosterSlot === slot) {
    overlay.querySelector("#characterEditingName").textContent = "EDITING " + name.toUpperCase();
  }
  if (lockerSelectedSlot === slot) {
    overlay.querySelector("#lockerSelectedName").textContent = name.toUpperCase();
  }
  let synced = false;
  try {
    synced = Boolean(await window.webMinecraftSaveCharacterRoster?.(
      rosterTextureStore.slots, savedAt, rosterTextureStore.deletedIds || []
    ));
  } catch (error) {
    console.warn("Character name saved in this browser, but account sync did not finish.", error);
  }
  const sub = overlay.querySelector("#characterEditorTopbarSub");
  if (sub && editorPage === "roster") {
    sub.textContent = synced ? name + " saved to your character roster." : name + " saved on this device; account sync is unavailable.";
    window.setTimeout(() => {
      if (editorPage === "roster") sub.textContent = "Browse your characters and choose one to edit.";
    }, 2200);
  }
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
  if (lockerSelectedSlot === slot) lockerSelectedSlot = null;
  updateRosterCards();
  renderLockerRoster();
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
  overlay.querySelector("#characterLockerPage").hidden = page !== "locker";
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
  } else if (page === "locker") {
    title.textContent = "ITEM LOCKER";
    sub.textContent = lockerSelectedSlot === null
      ? "Choose a character to customize."
      : "Equip items and designs to this character.";
    status.textContent = lockerSelectedSlot === null ? "CHARACTER SELECT" : "CUSTOMIZING";
    const rosterView = overlay.querySelector("#lockerRosterView");
    const customizeView = overlay.querySelector("#lockerCustomizeView");
    rosterView.hidden = lockerSelectedSlot !== null;
    customizeView.hidden = lockerSelectedSlot === null;
    rosterAvatars.forEach(entry => {
      const selected = lockerSelectedSlot !== null && entry.slotIndex === lockerSelectedSlot;
      entry.group.visible = selected;
      if (selected) {
        entry.group.position.set(0, 0, 0);
        entry.group.scale.setScalar(1.12);
      }
    });
    if (lockerSelectedSlot !== null && previewAvatar) {
      const host = overlay.querySelector("#lockerCharacterPreview");
      if (renderer.domElement.parentElement !== host) host.prepend(renderer.domElement);
      renderer.domElement.style.display = "block";
      camera.position.set(3.1, 2.75, 8.3);
      camera.lookAt(0, 1.18, 0);
      const name = rosterTextureStore.slots[lockerSelectedSlot]?.__characterName || previewAvatar.characterName || "CHARACTER";
      overlay.querySelector("#lockerSelectedName").textContent = name.toUpperCase();
      renderLockerItems();
    } else {
      renderer.domElement.style.display = "none";
      renderLockerRoster();
    }
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
        lockerItems: { ...(record?.__lockerItems || {}) },
        lockerBaseTextures: extractTextureMapData(record?.__lockerBaseTextures || {}),
        targetX: (slot - 2) * 2.95, targetScale: slot === MAIN_PROFILE_SLOT ? 1.16 : 0.88 };
      syncLockerAccessories(rosterAvatars[slot]);
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
  if (previewAvatar) {
    previewAvatar.lockerItems = {};
    previewAvatar.lockerBaseTextures = {};
  }
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
    savedAt,
    __lockerItems: entry?.lockerItems || currentRecord?.__lockerItems || {},
    __lockerBaseTextures: entry?.lockerBaseTextures || currentRecord?.__lockerBaseTextures || {}
  });
  if (!record) { alert("This character has no saved texture changes yet."); return; }
  rosterTextureStore.slots[selectedRosterSlot] = record;
  if (!writeRosterTextureStore(savedAt)) {
    alert("Unable to save this character preset in this browser. Free some browser storage and try again.");
    return;
  }
  updateRosterCards();
  savedTextureData = extractTextureMapData(textures);
  if (previewAvatar) {
    previewAvatar.characterId = record.__characterId;
    previewAvatar.characterName = record.__characterName;
    previewAvatar.lockerItems = { ...(record.__lockerItems || {}) };
    previewAvatar.lockerBaseTextures = extractTextureMapData(record.__lockerBaseTextures || {});
  }
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
overlay.querySelector("#lockerBackToRoster").addEventListener("click", () => {
  lockerSelectedSlot = null;
  setEditorPage("locker");
});
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
overlay.querySelectorAll(".rosterCardName").forEach(button => button.addEventListener("click", () => {
  void renameRosterCharacter(Number(button.dataset.slot));
}));
overlay.querySelectorAll(".rosterDeleteButton").forEach(button => button.addEventListener("click", () => {
  void deleteRosterCharacter(Number(button.dataset.slot));
}));
overlay.querySelectorAll("[data-editor-page]").forEach(button => button.addEventListener("click", () => {
  const page = button.dataset.editorPage;
  if (page === "paint") activateRosterSlot(selectedRosterSlot);
  if (page === "locker") lockerSelectedSlot = null;
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
          __savedAt: Math.max(0, Number(source?.__savedAt) || 0),
          __lockerItems: source?.__lockerItems && typeof source.__lockerItems === "object" ? { ...source.__lockerItems } : {},
          __lockerBaseTextures: extractTextureMapData(source?.__lockerBaseTextures || {}) };
        return source?.__characterId ? {
          ...source,
          __lockerItems: source?.__lockerItems && typeof source.__lockerItems === "object" ? { ...source.__lockerItems } : {},
          __lockerBaseTextures: extractTextureMapData(source?.__lockerBaseTextures || {})
        } : null;
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
        savedAt: rosterSavedAt || Date.now(),
        __lockerItems: previousMain?.__lockerItems || {},
        __lockerBaseTextures: previousMain?.__lockerBaseTextures || {}
      });
      writeCharacterTextureRecord(activeTextures, rosterSavedAt || Date.now());
    }
    rosterTextureStore = { slots: rosterToApply, deletedIds, savedAt: Math.max(cachedRoster.savedAt || 0, rosterSavedAt) };
    writeRosterTextureStore(rosterTextureStore.savedAt || Date.now());
    await buildPreview(true);
    setRosterWindow(MAIN_PROFILE_SLOT);
    activateRosterSlot(MAIN_PROFILE_SLOT);
    if (overlay.classList.contains("open") && editorPage === "paint") copySelectedTextureToEditor();
    if (overlay.classList.contains("open") && editorPage === "locker") {
      if (lockerSelectedSlot !== null && rosterAvatars[lockerSelectedSlot]) {
        activateRosterSlot(lockerSelectedSlot);
        setEditorPage("locker");
      } else {
        lockerSelectedSlot = null;
        setEditorPage("locker");
      }
    }
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
  ["#characterEditorSidebar", "#characterRosterStage", "#characterEditorPreview", "#lockerRosterGrid", "#lockerCharacterPreview", "#lockerItemsGrid"].forEach(selector => {
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
  const lockerPreviewVisible = editorPage !== "locker" || lockerSelectedSlot !== null;
  if (((editorOpen && lockerPreviewVisible) || showcaseVisible) && renderer && scene && camera && previewAvatar) renderer.render(scene, camera);
}
render();
