import * as THREE from "three";
import { getBlockAt, setBlockAt, getBlockTypes } from "./world.js";
import { touchInput } from "./controls.js";
import { sendBlockChange, sendPlayerAction } from "./multiplayerClient.js";
import { handleDoorTarget } from "./door.js";
import { isSurvivalWorld } from "./survivalMode.js";

const raycaster = new THREE.Raycaster();
const CENTER = new THREE.Vector2(0, 0);
const RANGE = 5;
const DESPAWN_MS = 300000;
const PICKUP_RANGE = 1.15;
let sceneRef = null;
let cameraRef = null;
let mining = null;
let mobileHold = false;
let initialized = false;
const drops = [];

const HARDNESS = { 1:700,2:430,3:1050,4:380,5:900,6:280,7:1050,8:420,9:900,10:Infinity,11:1200,12:1250,13:750,14:300,15:800 };
const TEXTURES = {1:"Grass_Block_(top_texture)_JE2.png",2:"dirt.png",3:"stone.png",4:"sand.png",5:"oak_log_top.png",6:"oak-leaves-normal-original-default.png",7:"cobblestone.png",8:"dirt.png",9:"sand.png",15:"tnt_side.png"};
const COLORS = {1:0x73a83f,2:0x8c5e3c,3:0x8c8c8c,4:0xd9c28b,5:0x8f6238,6:0x3e8a3c,7:0x777777,8:0x8d806d,9:0xd5bd8d,10:0x4b4b4b,11:0x343434,12:0x929292,13:0xb68752,14:0xf1f7ff,15:0xd73636};

function textureUrl(name){return `${import.meta.env.BASE_URL}textures/${encodeURIComponent(name)}`;}
function installUI(){
    if(document.getElementById("survivalMiningProgress"))return;
    const style=document.createElement("style");style.id="survivalMiningSystemV2Styles";style.textContent=`
#survivalMiningProgress{position:fixed;left:50%;top:calc(50% + 28px);transform:translateX(-50%);z-index:9997;display:none;min-width:164px;padding:5px 7px;background:rgba(0,0,0,.58);border:1px solid rgba(255,255,255,.25);border-radius:4px;pointer-events:none;font:700 10px Arial,sans-serif;color:#fff;text-align:center;text-shadow:1px 1px #000}
#survivalMiningProgress.active{display:block}.survivalMiningBar{height:4px;margin-top:4px;background:#222;border:1px solid #111;overflow:hidden}.survivalMiningFill{height:100%;width:0;background:#fff}
`;document.head.appendChild(style);
    const hud=document.createElement("div");hud.id="survivalMiningProgress";hud.innerHTML=`<div class="survivalMiningLabel">Breaking</div><div class="survivalMiningBar"><div class="survivalMiningFill"></div></div>`;document.body.appendChild(hud);
}
function getTarget(){
    if(!sceneRef||!cameraRef)return null;
    cameraRef.updateMatrixWorld(true);raycaster.setFromCamera(CENTER,cameraRef);raycaster.near=.01;raycaster.far=RANGE;
    const hits=raycaster.intersectObjects(sceneRef.children,true);const hit=hits.find(entry=>{if(!entry.object?.userData?.isChunk||!entry.face)return false;let o=entry.object;while(o){if(o.userData?.isWater===true)return false;o=o.parent;}return true;});
    raycaster.near=0;raycaster.far=Infinity;if(!hit)return null;
    const n=hit.face.normal.clone().normalize(),p=hit.point;const x=Math.floor(p.x-n.x*.01+.5),y=Math.floor(p.y-n.y*.01+.5),z=Math.floor(p.z-n.z*.01+.5),type=getBlockAt(x,y,z);
    return type&&type!==getBlockTypes().AIR?{x,y,z,type,normal:n}:null;
}
function crackTexture(stage){
    const c=document.createElement("canvas");c.width=c.height=128;const ctx=c.getContext("2d");if(!ctx)return null;ctx.strokeStyle="rgba(0,0,0,.96)";ctx.lineWidth=4;
    const paths=[[[64,63],[51,49],[56,30],[43,15]],[[64,63],[78,49],[71,32],[87,19]],[[64,63],[47,69],[29,63],[14,73]],[[64,63],[78,71],[95,66],[113,79]],[[64,63],[60,80],[50,98],[43,114]],[[64,63],[72,78],[84,97],[90,114]],[[64,63],[58,51],[40,41],[24,38]],[[64,63],[73,53],[91,43],[108,46]]];
    for(let i=0;i<Math.min(8,1+stage*2);i++){ctx.beginPath();ctx.moveTo(...paths[i][0]);for(let j=1;j<paths[i].length;j++)ctx.lineTo(...paths[i][j]);ctx.stroke();}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t;
}
function createCracks(target){
    const group=new THREE.Group();group.position.set(target.x,target.y,target.z);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),target.normal);group.name="survivalMiningCracks";
    const geometry=new THREE.PlaneGeometry(.995,.995),stages=[];for(let i=0;i<5;i++){const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:crackTexture(i),transparent:true,depthTest:false,side:THREE.DoubleSide}));mesh.position.z=.508;mesh.visible=false;mesh.renderOrder=1200;group.add(mesh);stages.push(mesh);}sceneRef.add(group);return{group,stages};
}
function updateCracks(overlay,progress){const stage=Math.min(4,Math.floor(progress*5));overlay.stages.forEach((m,i)=>m.visible=i===stage);const hud=document.getElementById("survivalMiningProgress");if(hud){hud.querySelector(".survivalMiningFill").style.width=`${Math.round(progress*100)}%`;hud.querySelector(".survivalMiningLabel").textContent=`Breaking ${Math.round(progress*100)}%`;hud.classList.add("active");}}
function destroyCracks(overlay){if(!overlay)return;sceneRef?.remove(overlay.group);for(const m of overlay.stages){m.material.map?.dispose();m.material.dispose();}overlay.group.clear();}
function burst(center,type){const geo=new THREE.BoxGeometry(.07,.07,.07),parts=[],start=performance.now();for(let i=0;i<8;i++){const p=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:COLORS[type]??0xaaa,transparent:true}));p.position.copy(center).add(new THREE.Vector3((Math.random()-.5)*.65,(Math.random()-.5)*.65,(Math.random()-.5)*.65));p.userData.v=new THREE.Vector3((Math.random()-.5)*2.1,.9+Math.random()*1.8,(Math.random()-.5)*2.1);p.userData.s=start;sceneRef.add(p);parts.push(p);}function tick(time){let alive=false;for(const p of parts){if(!p.parent)continue;const age=time-p.userData.s;if(age>=450){p.parent.remove(p);p.material.dispose();continue;}alive=true;p.userData.v.y-=.085;p.position.addScaledVector(p.userData.v,.016);p.rotation.x+=.1;p.rotation.y+=.08;p.material.opacity=1-age/450;}if(alive)requestAnimationFrame(tick);}requestAnimationFrame(tick);}
function createDrop(type,pos){const g=new THREE.Group();g.name="survivalDroppedItem";g.userData={type,count:1,spawnedAt:performance.now(),bob:Math.random()*Math.PI*2};const tn=TEXTURES[type];let mat;if(tn){const t=new THREE.TextureLoader().load(textureUrl(tn));t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;mat=new THREE.MeshLambertMaterial({map:t});}else mat=new THREE.MeshLambertMaterial({color:COLORS[type]??0xaaa});const m=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,.25),mat);g.add(m);g.position.copy(pos).add(new THREE.Vector3(0,.28,0));sceneRef.add(g);drops.push(g);}
function mergeDrops(){for(let i=drops.length-1;i>=0;i--){const a=drops[i];if(!a.parent){drops.splice(i,1);continue;}for(let j=i-1;j>=0;j--){const b=drops[j];if(!b.parent||a.userData.type!==b.userData.type||a.position.distanceTo(b.position)>.7)continue;b.userData.count+=a.userData.count;a.parent.remove(a);drops.splice(i,1);break;}}}
function addToInventory(type,count){try{const raw=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]"),inv=Array.isArray(raw)&&raw.length===36?raw:Array.from({length:36},()=>null);let left=count;for(const s of inv){if(s?.itemId===type&&Number(s.count)<64){const add=Math.min(left,64-Number(s.count));s.count=Number(s.count)+add;left-=add;if(!left)break;}}for(let i=0;i<inv.length&&left;i++)if(!inv[i]){const add=Math.min(left,64);inv[i]={itemId:type,count:add};left-=add;}localStorage.setItem("webminecraft_inventory",JSON.stringify(inv));window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"));return left===0;}catch{return false;}}
function updateDrops(time){if(!sceneRef||!cameraRef||!isSurvivalWorld())return;mergeDrops();const player=cameraRef.position;for(let i=drops.length-1;i>=0;i--){const d=drops[i];if(!d.parent){drops.splice(i,1);continue;}if(time-d.userData.spawnedAt>=DESPAWN_MS){d.parent.remove(d);drops.splice(i,1);continue;}d.userData.baseY??=d.position.y;d.position.y=d.userData.baseY+Math.sin(time*.003+d.userData.bob)*.045;d.rotation.y+=.018;const dist=d.position.distanceTo(player);if(dist<=PICKUP_RANGE){const dir=player.clone().sub(d.position);d.position.addScaledVector(dir.normalize(),Math.min(.2,Math.max(.035,(PICKUP_RANGE-dist)*.12)));}if(d.position.distanceTo(player)<.5&&addToInventory(d.userData.type,d.userData.count)){d.parent.remove(d);drops.splice(i,1);}}}
function beginMining(){if(!isSurvivalWorld()||!document.body.classList.contains("webminecraft-in-world")||mining)return;if(handleDoorTarget("break")){sendPlayerAction("mine");return;}const t=getTarget();if(!t)return;const duration=HARDNESS[t.type]??700;if(!Number.isFinite(duration))return;mining={...t,started:performance.now(),duration,overlay:createCracks(t)};updateCracks(mining.overlay,.01);sendPlayerAction("mine");}
function cancelMining(){if(!mining)return;destroyCracks(mining.overlay);mining=null;document.getElementById("survivalMiningProgress")?.classList.remove("active");}
function finishMining(){if(!mining)return;if(getBlockAt(mining.x,mining.y,mining.z)!==mining.type){cancelMining();return;}if(!setBlockAt(mining.x,mining.y,mining.z,getBlockTypes().AIR)){cancelMining();return;}sendBlockChange(mining.x,mining.y,mining.z,getBlockTypes().AIR);window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:mining.x,y:mining.y,z:mining.z,type:getBlockTypes().AIR,brokenType:mining.type}}));burst(new THREE.Vector3(mining.x,mining.y,mining.z),mining.type);createDrop(mining.type,new THREE.Vector3(mining.x,mining.y,mining.z));destroyCracks(mining.overlay);mining=null;document.getElementById("survivalMiningProgress")?.classList.remove("active");}
function tickMining(time,held){if(!mining)return;if(!held){cancelMining();return;}const t=getTarget();if(!t||t.x!==mining.x||t.y!==mining.y||t.z!==mining.z){cancelMining();return;}const p=Math.min(1,(time-mining.started)/mining.duration);updateCracks(mining.overlay,p);if(p>=1)finishMining();}
function capture(){if(!THREE.Object3D.prototype.__wmMiningAdd){const add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...o){if(this.isScene)sceneRef=this;return add.apply(this,o);};THREE.Object3D.prototype.__wmMiningAdd=true;}if(!THREE.Raycaster.prototype.__wmMiningCamera){const set=THREE.Raycaster.prototype.setFromCamera;THREE.Raycaster.prototype.setFromCamera=function(...a){cameraRef=a[1]||cameraRef;return set.apply(this,a);};THREE.Raycaster.prototype.__wmMiningCamera=true;}}
function init(){if(initialized)return;initialized=true;installUI();capture();document.addEventListener("mousedown",e=>{if(!isSurvivalWorld()||!document.body.classList.contains("webminecraft-in-world")||document.body.classList.contains("mobile-mode")||e.button!==0)return;if(e.target instanceof Element&&e.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a"))return;e.preventDefault();e.stopImmediatePropagation();beginMining();},true);document.addEventListener("mouseup",e=>{if(e.button===0)cancelMining();},true);window.addEventListener("blur",cancelMining);document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelMining();});
    const touchStart=e=>{if(!isSurvivalWorld()||!document.body.classList.contains("mobile-mode"))return;const b=e.target.closest?.("#touchBreak");if(!b)return;e.preventDefault();e.stopImmediatePropagation();mobileHold=true;beginMining();b.setPointerCapture?.(e.pointerId);};
    const touchEnd=e=>{if(e.target.closest?.("#touchBreak")){mobileHold=false;cancelMining();}};
    document.addEventListener("pointerdown",touchStart,true);document.addEventListener("pointerup",touchEnd,true);document.addEventListener("pointercancel",touchEnd,true);document.addEventListener("lostpointercapture",touchEnd,true);
    function frame(time){const mobile=document.body.classList.contains("mobile-mode");tickMining(time,mobile?mobileHold:!!mining);updateDrops(time);requestAnimationFrame(frame);}requestAnimationFrame(frame);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
