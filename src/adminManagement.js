const DEV_EMAIL = "worthmarcus19@gmail.com";
const ADMIN_COLLECTION = "admins";
let observerStarted = false;

function firebaseInstance(){try{return window.firebase||null;}catch{return null;}}
function currentUser(){try{return firebaseInstance()?.auth?.()?.currentUser||null;}catch{return null;}}
function isDeveloper(){return String(currentUser()?.email||"").trim().toLowerCase()===DEV_EMAIL.toLowerCase();}
function db(){try{return firebaseInstance()?.firestore?.()||null;}catch{return null;}}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}

function styles(){
 if(document.getElementById("adminManagementStyles"))return;
 const s=document.createElement("style");s.id="adminManagementStyles";s.textContent=`
#adminManagementSection{display:block!important;margin-bottom:14px;padding:14px;background:#202020;border:1px solid #444;color:#fff}
#adminManagementSection h3{margin:0 0 8px;font-family:MinecraftFont,monospace;font-size:15px}
.adminManageRow{display:flex;gap:8px;margin:10px 0}.adminManageInput{flex:1;min-width:0;background:#111;color:#fff;border:2px solid #555;padding:9px;font-size:12px;outline:none}.adminManageInput:focus{border-color:#aaa}
.adminManageStatus{min-height:18px;font-size:11px;color:#9fce72;margin:5px 0}.adminManageStatus.error{color:#e38a7b}.adminManageList{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}.adminManageItem{display:flex;align-items:center;gap:8px;padding:8px;background:#151515;border:1px solid #444;font-size:11px}.adminManageUid{flex:1;word-break:break-all}.adminManageToggle{background:#633f3b;color:#fff;border:1px solid #111;padding:6px 9px;font-size:9px;cursor:pointer}.adminManageToggle.on{background:#526f3c}.adminManageRemove{background:#8b3f3f;color:#fff;border:1px solid #111;padding:6px 9px;font-size:9px;cursor:pointer}@media(max-width:650px){.adminManageRow{flex-direction:column}.adminManageRow .devButton{width:100%}}
`;document.head.appendChild(s);
}

async function refresh(){
 const list=document.getElementById("adminManageList");if(!list||!isDeveloper())return;const firestore=db();if(!firestore)return;
 try{
  const snap=await firestore.collection(ADMIN_COLLECTION).get();list.innerHTML="";
  const docs=snap.docs.filter(d=>String(d.id)!==String(currentUser()?.uid||""));
  if(!docs.length){list.innerHTML='<div class="devHint">No admins added yet.</div>';return;}
  docs.forEach(doc=>{const data=doc.data()||{},uid=String(data.uid||doc.id),enabled=data.enabled===true,row=document.createElement("div");row.className="adminManageItem";row.innerHTML=`<span class="adminManageUid">${esc(uid)}</span><button class="adminManageToggle ${enabled?"on":""}" type="button">${enabled?"Turn Off":"Turn On"}</button><button class="adminManageRemove" type="button">Remove</button>`;row.querySelector(".adminManageToggle").onclick=async()=>{try{await firestore.collection(ADMIN_COLLECTION).doc(doc.id).set({uid,enabled:!enabled,updatedAt:new Date()},{merge:true});await refresh();}catch(e){alert(e?.message||"Could not change admin status.");}};row.querySelector(".adminManageRemove").onclick=async()=>{if(!confirm(`Remove ${uid} from admins completely?`))return;try{await firestore.collection(ADMIN_COLLECTION).doc(doc.id).delete();await refresh();}catch(e){alert(e?.message||"Could not remove admin.");}};list.appendChild(row);});
 }catch(e){list.innerHTML=`<div class="devHint">Could not load admins: ${esc(e?.message||"Unknown error")}</div>`;}
}

function install(){
 const body=document.getElementById("devControlsBody");if(!body)return;
 if(!isDeveloper()){document.getElementById("adminManagementSection")?.remove();return;}
 if(document.getElementById("adminManagementSection"))return;
 styles();
 const section=document.createElement("section");section.className="devSection";section.id="adminManagementSection";section.innerHTML=`<h3>Admin Accounts</h3><p class="devHint">Give an account Admin Controls. Admins can view Live Multiplayer Servers, kick players, and moderate Discussions. They cannot shut down or delete servers.</p><div class="adminManageRow"><input id="adminManageUid" class="adminManageInput" type="text" maxlength="128" placeholder="Player Firebase UID" autocomplete="off"><button id="adminManageAdd" class="devButton good" type="button">Make Admin</button></div><div id="adminManageStatus" class="adminManageStatus"></div><div id="adminManageList" class="adminManageList"><div class="devHint">Loading admins...</div></div>`;
 body.insertBefore(section,body.firstElementChild);
 const input=section.querySelector("#adminManageUid"),status=section.querySelector("#adminManageStatus");
 section.querySelector("#adminManageAdd").onclick=async()=>{
  const uid=input.value.trim();status.classList.remove("error");
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid)){status.textContent="Enter a valid Firebase UID.";status.classList.add("error");return;}
  if(uid===String(currentUser()?.uid||"")){status.textContent="The developer already has full access.";status.classList.add("error");return;}
  const firestore=db();if(!firestore){status.textContent="Firebase is not ready yet.";status.classList.add("error");return;}
  try{await firestore.collection(ADMIN_COLLECTION).doc(uid).set({uid,enabled:true,createdAt:new Date(),updatedAt:new Date()},{merge:true});input.value="";status.textContent=`${uid} is now an admin.`;await refresh();}catch(e){status.textContent=e?.message||"Could not add admin.";status.classList.add("error");}
 };
 refresh();
}

function watch(){if(observerStarted)return;observerStarted=true;styles();install();const observer=new MutationObserver(install);observer.observe(document.body,{childList:true,subtree:true});setInterval(install,500);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch,{once:true});else watch();