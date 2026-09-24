(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const bS="modulepreload",vS=function(n){return"/WebMinecraftT/"+n},Jg={},dn=function(e,t,i){let r=Promise.resolve();if(t&&t.length>0){let l=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),s=a?.nonce||a?.getAttribute("nonce");r=l(t.map(c=>{if(c=vS(c),c in Jg)return;Jg[c]=!0;const d=c.endsWith(".css"),f=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${f}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":bS,d||(u.as="script"),u.crossOrigin="",u.href=c,s&&u.setAttribute("nonce",s),document.head.appendChild(u),d)return new Promise((p,m)=>{u.addEventListener("load",p),u.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${c}`)))})}))}function o(a){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=a,window.dispatchEvent(s),!s.defaultPrevented)throw a}return r.then(a=>{for(const s of a||[])s.status==="rejected"&&o(s.reason);return e().catch(o)})},Uu="webminecraft-local-worlds",yS="worlds",jg="webminecraft-world-fallback-v1",Qg="/__webminecraft_world_storage__",e0="webminecraft_world_storage_fallback",t0="__webMinecraftWorldFallbackInstalled";if(!window[t0]){let r=function(f){if(f===void 0)return f;try{return structuredClone(f)}catch{return JSON.parse(JSON.stringify(f))}},s=function(f){const u={result:void 0,error:null,onsuccess:null,onerror:null};return Promise.resolve().then(async()=>{try{u.result=await f(),u.onsuccess?.({target:u})}catch(p){u.error=p,u.onerror?.({target:u})}}),u},l=function(f,u){let p=null,m=null,b=!1;const g=[],h={mode:u,error:null,objectStore(){return{getAll:()=>s(()=>[...f.values()].map(r)),get:_=>s(()=>r(f.get(String(_)))),put:_=>{const S=s(async()=>(f.set(String(_.seed),r(_)),await a(f),_));return g.push(S),S},delete:_=>{const S=s(async()=>{f.delete(String(_)),await a(f)});return g.push(S),S}}},abort(){b=!0,h.error=new Error("Browser world storage transaction aborted."),m?.({target:h})}};return Object.defineProperties(h,{oncomplete:{get:()=>p,set:_=>{p=_,g.length&&Promise.all(g).then(()=>{b||p?.({target:h})}).catch(S=>{h.error=S,m?.({target:h})})}},onerror:{get:()=>m,set:_=>{m=_}},onabort:{get:()=>m,set:_=>{m=_}}}),h},c=function(f){return{name:Uu,version:1,objectStoreNames:{contains:u=>u===yS},transaction:(u,p)=>l(f,p),close(){}}},d=function(){let f=null,u=null;const p={result:null,error:null,source:null,transaction:null};return Object.defineProperties(p,{onupgradeneeded:{get:()=>null,set:()=>{}},onsuccess:{get:()=>f,set:m=>{f=m}},onerror:{get:()=>u,set:m=>{u=m}}}),o().then(m=>{p.result=c(m),Promise.resolve().then(()=>f?.({target:p}))}).catch(m=>{p.error=m,Promise.resolve().then(()=>u?.({target:p}))}),p};window[t0]=!0;const n=window.indexedDB,e=n?.open?.bind(n);let t=null,i=Promise.resolve();async function o(){return t||(t=(async()=>{try{if(window.caches){const u=await(await caches.open(jg)).match(Qg);if(u){const p=await u.json();if(Array.isArray(p))return new Map(p.map(m=>[String(m.seed),m]))}}}catch{}try{const f=localStorage.getItem(e0),u=JSON.parse(f||"[]");if(Array.isArray(u))return new Map(u.map(p=>[String(p.seed),p]))}catch{}return new Map})(),t)}async function a(f){const u=[...f.values()].map(r);return i=i.then(async()=>{let p=!1;try{window.caches&&(await(await caches.open(jg)).put(Qg,new Response(JSON.stringify(u),{headers:{"Content-Type":"application/json"}})),p=!0)}catch{}if(!p)try{localStorage.setItem(e0,JSON.stringify(u)),p=!0}catch{}return p}).catch(()=>!1),i}try{const f=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(n),"open"),u=e;f?.get||typeof f?.value=="function"?Object.defineProperty(Object.getPrototypeOf(n),"open",{configurable:f.configurable,enumerable:f.enumerable,writable:!0,value(p,m){return p===Uu?d():u(p,m)}}):e&&Object.defineProperty(n,"open",{configurable:!0,writable:!0,value(p,m){return p===Uu?d():e(p,m)}})}catch{}}const cm="185",wS=0,n0=1,_S=2,Wa=1,SS=2,Qs=3,eo=0,Nn=1,jt=2,fr=0,Ga=1,i0=2,r0=3,o0=4,MS=5,xo=100,ES=101,TS=102,AS=103,CS=104,RS=200,LS=201,IS=202,PS=203,Mp=204,Ep=205,DS=206,NS=207,FS=208,US=209,kS=210,BS=211,OS=212,zS=213,HS=214,Tp=0,Ap=1,Cp=2,os=3,Rp=4,Lp=5,Ip=6,Pp=7,nu=0,WS=1,GS=2,Gi=0,Kv=1,Zv=2,Jv=3,iu=4,jv=5,Qv=6,ey=7,ty=300,ko=301,as=302,ku=303,Bu=304,ru=306,ss=1e3,En=1001,Dp=1002,Fe=1003,VS=1004,rc=1005,sn=1006,Ou=1007,So=1008,Vn=1009,ny=1010,iy=1011,yl=1012,dm=1013,qi=1014,Si=1015,mr=1016,um=1017,fm=1018,wl=1020,ry=35902,oy=35899,ay=1021,sy=1022,Mi=1023,gr=1026,Mo=1027,pm=1028,hm=1029,Bo=1030,mm=1031,gm=1033,ed=33776,td=33777,nd=33778,id=33779,Np=35840,Fp=35841,Up=35842,kp=35843,Bp=36196,Op=37492,zp=37496,Hp=37488,Wp=37489,ud=37490,Gp=37491,Vp=37808,Xp=37809,qp=37810,$p=37811,Yp=37812,Kp=37813,Zp=37814,Jp=37815,jp=37816,Qp=37817,eh=37818,th=37819,nh=37820,ih=37821,rh=36492,oh=36494,ah=36495,sh=36283,lh=36284,fd=36285,ch=36286,XS=3200,pd=0,qS=1,Br="",st="srgb",hd="srgb-linear",md="linear",dt="srgb",oa=7680,a0=519,$S=512,YS=513,KS=514,xm=515,ZS=516,JS=517,bm=518,jS=519,dh=35044,QS=35048,s0="300 es",zi=2e3,_l=2001;function e1(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Sl(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function t1(){const n=Sl("canvas");return n.style.display="block",n}const l0={};function gd(...n){const e="THREE."+n.shift();console.log(e,...n)}function ly(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ie(...n){n=ly(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ke(...n){n=ly(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Va(...n){const e=n.join(" ");e in l0||(l0[e]=!0,Ie(...n))}function n1(n,e,t){return new Promise(function(i,r){function o(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(o,t);break;default:i()}}setTimeout(o,t)})}const i1={[Tp]:Ap,[Cp]:Ip,[Rp]:Pp,[os]:Lp,[Ap]:Tp,[Ip]:Cp,[Pp]:Rp,[Lp]:os};class Ko{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const o=r.indexOf(t);o!==-1&&r.splice(o,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let o=0,a=r.length;o<a;o++)r[o].call(this,e);e.target=null}}}const bn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let c0=1234567;const ul=Math.PI/180,Ml=180/Math.PI;function pr(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(bn[n&255]+bn[n>>8&255]+bn[n>>16&255]+bn[n>>24&255]+"-"+bn[e&255]+bn[e>>8&255]+"-"+bn[e>>16&15|64]+bn[e>>24&255]+"-"+bn[t&63|128]+bn[t>>8&255]+"-"+bn[t>>16&255]+bn[t>>24&255]+bn[i&255]+bn[i>>8&255]+bn[i>>16&255]+bn[i>>24&255]).toLowerCase()}function Ye(n,e,t){return Math.max(e,Math.min(t,n))}function vm(n,e){return(n%e+e)%e}function r1(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function o1(n,e,t){return n!==e?(t-n)/(e-n):0}function fl(n,e,t){return(1-t)*n+t*e}function a1(n,e,t,i){return fl(n,e,1-Math.exp(-t*i))}function s1(n,e=1){return e-Math.abs(vm(n,e*2)-e)}function l1(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function c1(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function d1(n,e){return n+Math.floor(Math.random()*(e-n+1))}function u1(n,e){return n+Math.random()*(e-n)}function f1(n){return n*(.5-Math.random())}function p1(n){n!==void 0&&(c0=n);let e=c0+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function h1(n){return n*ul}function m1(n){return n*Ml}function g1(n){return(n&n-1)===0&&n!==0}function x1(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function b1(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function v1(n,e,t,i,r){const o=Math.cos,a=Math.sin,s=o(t/2),l=a(t/2),c=o((e+i)/2),d=a((e+i)/2),f=o((e-i)/2),u=a((e-i)/2),p=o((i-e)/2),m=a((i-e)/2);switch(r){case"XYX":n.set(s*d,l*f,l*u,s*c);break;case"YZY":n.set(l*u,s*d,l*f,s*c);break;case"ZXZ":n.set(l*f,l*u,s*d,s*c);break;case"XZX":n.set(s*d,l*m,l*p,s*c);break;case"YXY":n.set(l*p,s*d,l*m,s*c);break;case"ZYZ":n.set(l*m,l*p,s*d,s*c);break;default:Ie("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function vi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ut(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Be={DEG2RAD:ul,RAD2DEG:Ml,generateUUID:pr,clamp:Ye,euclideanModulo:vm,mapLinear:r1,inverseLerp:o1,lerp:fl,damp:a1,pingpong:s1,smoothstep:l1,smootherstep:c1,randInt:d1,randFloat:u1,randFloatSpread:f1,seededRandom:p1,degToRad:h1,radToDeg:m1,isPowerOfTwo:g1,ceilPowerOfTwo:x1,floorPowerOfTwo:b1,setQuaternionFromProperEuler:v1,normalize:ut,denormalize:vi},kg=class kg{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ye(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),o=this.x-e.x,a=this.y-e.y;return this.x=o*i-a*r+e.x,this.y=o*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};kg.prototype.isVector2=!0;let De=kg;class Zo{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,o,a,s){let l=i[r+0],c=i[r+1],d=i[r+2],f=i[r+3],u=o[a+0],p=o[a+1],m=o[a+2],b=o[a+3];if(f!==b||l!==u||c!==p||d!==m){let g=l*u+c*p+d*m+f*b;g<0&&(u=-u,p=-p,m=-m,b=-b,g=-g);let h=1-s;if(g<.9995){const _=Math.acos(g),S=Math.sin(_);h=Math.sin(h*_)/S,s=Math.sin(s*_)/S,l=l*h+u*s,c=c*h+p*s,d=d*h+m*s,f=f*h+b*s}else{l=l*h+u*s,c=c*h+p*s,d=d*h+m*s,f=f*h+b*s;const _=1/Math.sqrt(l*l+c*c+d*d+f*f);l*=_,c*=_,d*=_,f*=_}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,r,o,a){const s=i[r],l=i[r+1],c=i[r+2],d=i[r+3],f=o[a],u=o[a+1],p=o[a+2],m=o[a+3];return e[t]=s*m+d*f+l*p-c*u,e[t+1]=l*m+d*u+c*f-s*p,e[t+2]=c*m+d*p+s*u-l*f,e[t+3]=d*m-s*f-l*u-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,o=e._z,a=e._order,s=Math.cos,l=Math.sin,c=s(i/2),d=s(r/2),f=s(o/2),u=l(i/2),p=l(r/2),m=l(o/2);switch(a){case"XYZ":this._x=u*d*f+c*p*m,this._y=c*p*f-u*d*m,this._z=c*d*m+u*p*f,this._w=c*d*f-u*p*m;break;case"YXZ":this._x=u*d*f+c*p*m,this._y=c*p*f-u*d*m,this._z=c*d*m-u*p*f,this._w=c*d*f+u*p*m;break;case"ZXY":this._x=u*d*f-c*p*m,this._y=c*p*f+u*d*m,this._z=c*d*m+u*p*f,this._w=c*d*f-u*p*m;break;case"ZYX":this._x=u*d*f-c*p*m,this._y=c*p*f+u*d*m,this._z=c*d*m-u*p*f,this._w=c*d*f+u*p*m;break;case"YZX":this._x=u*d*f+c*p*m,this._y=c*p*f+u*d*m,this._z=c*d*m-u*p*f,this._w=c*d*f-u*p*m;break;case"XZY":this._x=u*d*f-c*p*m,this._y=c*p*f-u*d*m,this._z=c*d*m+u*p*f,this._w=c*d*f+u*p*m;break;default:Ie("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],o=t[8],a=t[1],s=t[5],l=t[9],c=t[2],d=t[6],f=t[10],u=i+s+f;if(u>0){const p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(d-l)*p,this._y=(o-c)*p,this._z=(a-r)*p}else if(i>s&&i>f){const p=2*Math.sqrt(1+i-s-f);this._w=(d-l)/p,this._x=.25*p,this._y=(r+a)/p,this._z=(o+c)/p}else if(s>f){const p=2*Math.sqrt(1+s-i-f);this._w=(o-c)/p,this._x=(r+a)/p,this._y=.25*p,this._z=(l+d)/p}else{const p=2*Math.sqrt(1+f-i-s);this._w=(a-r)/p,this._x=(o+c)/p,this._y=(l+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ye(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,o=e._z,a=e._w,s=t._x,l=t._y,c=t._z,d=t._w;return this._x=i*d+a*s+r*c-o*l,this._y=r*d+a*l+o*s-i*c,this._z=o*d+a*c+i*l-r*s,this._w=a*d-i*s-r*l-o*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,r=e._y,o=e._z,a=e._w,s=this.dot(e);s<0&&(i=-i,r=-r,o=-o,a=-a,s=-s);let l=1-t;if(s<.9995){const c=Math.acos(s),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+o*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+o*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),o=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),o*Math.sin(t),o*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Bg=class Bg{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(d0.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(d0.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*r,this.y=o[1]*t+o[4]*i+o[7]*r,this.z=o[2]*t+o[5]*i+o[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,o=e.elements,a=1/(o[3]*t+o[7]*i+o[11]*r+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*r+o[12])*a,this.y=(o[1]*t+o[5]*i+o[9]*r+o[13])*a,this.z=(o[2]*t+o[6]*i+o[10]*r+o[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,o=e.x,a=e.y,s=e.z,l=e.w,c=2*(a*r-s*i),d=2*(s*t-o*r),f=2*(o*i-a*t);return this.x=t+l*c+a*f-s*d,this.y=i+l*d+s*c-o*f,this.z=r+l*f+o*d-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r,this.y=o[1]*t+o[5]*i+o[9]*r,this.z=o[2]*t+o[6]*i+o[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,o=e.z,a=t.x,s=t.y,l=t.z;return this.x=r*l-o*s,this.y=o*a-i*l,this.z=i*s-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return zu.copy(this).projectOnVector(e),this.sub(zu)}reflect(e){return this.sub(zu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ye(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Bg.prototype.isVector3=!0;let R=Bg;const zu=new R,d0=new Zo,Og=class Og{constructor(e,t,i,r,o,a,s,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,a,s,l,c)}set(e,t,i,r,o,a,s,l,c){const d=this.elements;return d[0]=e,d[1]=r,d[2]=s,d[3]=t,d[4]=o,d[5]=l,d[6]=i,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,o=this.elements,a=i[0],s=i[3],l=i[6],c=i[1],d=i[4],f=i[7],u=i[2],p=i[5],m=i[8],b=r[0],g=r[3],h=r[6],_=r[1],S=r[4],w=r[7],A=r[2],M=r[5],C=r[8];return o[0]=a*b+s*_+l*A,o[3]=a*g+s*S+l*M,o[6]=a*h+s*w+l*C,o[1]=c*b+d*_+f*A,o[4]=c*g+d*S+f*M,o[7]=c*h+d*w+f*C,o[2]=u*b+p*_+m*A,o[5]=u*g+p*S+m*M,o[8]=u*h+p*w+m*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],s=e[5],l=e[6],c=e[7],d=e[8];return t*a*d-t*s*c-i*o*d+i*s*l+r*o*c-r*a*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],s=e[5],l=e[6],c=e[7],d=e[8],f=d*a-s*c,u=s*l-d*o,p=c*o-a*l,m=t*f+i*u+r*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const b=1/m;return e[0]=f*b,e[1]=(r*c-d*i)*b,e[2]=(s*i-r*a)*b,e[3]=u*b,e[4]=(d*t-r*l)*b,e[5]=(r*o-s*t)*b,e[6]=p*b,e[7]=(i*l-c*t)*b,e[8]=(a*t-i*o)*b,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,o,a,s){const l=Math.cos(o),c=Math.sin(o);return this.set(i*l,i*c,-i*(l*a+c*s)+a+e,-r*c,r*l,-r*(-c*a+l*s)+s+t,0,0,1),this}scale(e,t){return Va("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Hu.makeScale(e,t)),this}rotate(e){return Va("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Hu.makeRotation(-e)),this}translate(e,t){return Va("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Hu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Og.prototype.isMatrix3=!0;let ke=Og;const Hu=new ke,u0=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),f0=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function y1(){const n={enabled:!0,workingColorSpace:hd,spaces:{},convert:function(r,o,a){return this.enabled===!1||o===a||!o||!a||(this.spaces[o].transfer===dt&&(r.r=hr(r.r),r.g=hr(r.g),r.b=hr(r.b)),this.spaces[o].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[o].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===dt&&(r.r=Xa(r.r),r.g=Xa(r.g),r.b=Xa(r.b))),r},workingToColorSpace:function(r,o){return this.convert(r,this.workingColorSpace,o)},colorSpaceToWorking:function(r,o){return this.convert(r,o,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Br?md:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,o=this.workingColorSpace){return r.fromArray(this.spaces[o].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,o,a){return r.copy(this.spaces[o].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,o){return Va("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,o)},toWorkingColorSpace:function(r,o){return Va("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,o)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[hd]:{primaries:e,whitePoint:i,transfer:md,toXYZ:u0,fromXYZ:f0,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:st},outputColorSpaceConfig:{drawingBufferColorSpace:st}},[st]:{primaries:e,whitePoint:i,transfer:dt,toXYZ:u0,fromXYZ:f0,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:st}}}),n}const Ze=y1();function hr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Xa(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let aa;class w1{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{aa===void 0&&(aa=Sl("canvas")),aa.width=e.width,aa.height=e.height;const r=aa.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=aa}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Sl("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),o=r.data;for(let a=0;a<o.length;a++)o[a]=hr(o[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(hr(t[i]/255)*255):t[i]=hr(t[i]);return{data:t,width:e.width,height:e.height}}else return Ie("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let _1=0;class ym{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_1++}),this.uuid=pr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let o;if(Array.isArray(r)){o=[];for(let a=0,s=r.length;a<s;a++)r[a].isDataTexture?o.push(Wu(r[a].image)):o.push(Wu(r[a]))}else o=Wu(r);i.url=o}return t||(e.images[this.uuid]=i),i}}function Wu(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?w1.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ie("Texture: Unable to serialize Texture."),{})}let S1=0;const Gu=new R;class cn extends Ko{constructor(e=cn.DEFAULT_IMAGE,t=cn.DEFAULT_MAPPING,i=En,r=En,o=sn,a=So,s=Mi,l=Vn,c=cn.DEFAULT_ANISOTROPY,d=Br){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:S1++}),this.uuid=pr(),this.name="",this.source=new ym(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=o,this.minFilter=a,this.anisotropy=c,this.format=s,this.internalFormat=null,this.type=l,this.offset=new De(0,0),this.repeat=new De(1,1),this.center=new De(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Gu).x}get height(){return this.source.getSize(Gu).y}get depth(){return this.source.getSize(Gu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ie(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ie(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ty)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ss:e.x=e.x-Math.floor(e.x);break;case En:e.x=e.x<0?0:1;break;case Dp:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ss:e.y=e.y-Math.floor(e.y);break;case En:e.y=e.y<0?0:1;break;case Dp:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=ty;cn.DEFAULT_ANISOTROPY=1;const zg=class zg{constructor(e=0,t=0,i=0,r=1){this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,o=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*o,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*o,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*o,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*o,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,o;const l=e.elements,c=l[0],d=l[4],f=l[8],u=l[1],p=l[5],m=l[9],b=l[2],g=l[6],h=l[10];if(Math.abs(d-u)<.01&&Math.abs(f-b)<.01&&Math.abs(m-g)<.01){if(Math.abs(d+u)<.1&&Math.abs(f+b)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(c+1)/2,w=(p+1)/2,A=(h+1)/2,M=(d+u)/4,C=(f+b)/4,v=(m+g)/4;return S>w&&S>A?S<.01?(i=0,r=.707106781,o=.707106781):(i=Math.sqrt(S),r=M/i,o=C/i):w>A?w<.01?(i=.707106781,r=0,o=.707106781):(r=Math.sqrt(w),i=M/r,o=v/r):A<.01?(i=.707106781,r=.707106781,o=0):(o=Math.sqrt(A),i=C/o,r=v/o),this.set(i,r,o,t),this}let _=Math.sqrt((g-m)*(g-m)+(f-b)*(f-b)+(u-d)*(u-d));return Math.abs(_)<.001&&(_=1),this.x=(g-m)/_,this.y=(f-b)/_,this.z=(u-d)/_,this.w=Math.acos((c+p+h-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this.w=Ye(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this.w=Ye(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};zg.prototype.isVector4=!0;let Rt=zg;class M1 extends Ko{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Rt(0,0,e,t),this.scissorTest=!1,this.viewport=new Rt(0,0,e,t),this.textures=[];const r={width:e,height:t,depth:i.depth},o=new cn(r),a=i.count;for(let s=0;s<a;s++)this.textures[s]=o.clone(),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:sn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,o=this.textures.length;r<o;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new ym(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Vi extends M1{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class cy extends cn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Fe,this.minFilter=Fe,this.wrapR=En,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class E1 extends cn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Fe,this.minFilter=Fe,this.wrapR=En,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const tu=class tu{constructor(e,t,i,r,o,a,s,l,c,d,f,u,p,m,b,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,a,s,l,c,d,f,u,p,m,b,g)}set(e,t,i,r,o,a,s,l,c,d,f,u,p,m,b,g){const h=this.elements;return h[0]=e,h[4]=t,h[8]=i,h[12]=r,h[1]=o,h[5]=a,h[9]=s,h[13]=l,h[2]=c,h[6]=d,h[10]=f,h[14]=u,h[3]=p,h[7]=m,h[11]=b,h[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new tu().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,r=1/sa.setFromMatrixColumn(e,0).length(),o=1/sa.setFromMatrixColumn(e,1).length(),a=1/sa.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,o=e.z,a=Math.cos(i),s=Math.sin(i),l=Math.cos(r),c=Math.sin(r),d=Math.cos(o),f=Math.sin(o);if(e.order==="XYZ"){const u=a*d,p=a*f,m=s*d,b=s*f;t[0]=l*d,t[4]=-l*f,t[8]=c,t[1]=p+m*c,t[5]=u-b*c,t[9]=-s*l,t[2]=b-u*c,t[6]=m+p*c,t[10]=a*l}else if(e.order==="YXZ"){const u=l*d,p=l*f,m=c*d,b=c*f;t[0]=u+b*s,t[4]=m*s-p,t[8]=a*c,t[1]=a*f,t[5]=a*d,t[9]=-s,t[2]=p*s-m,t[6]=b+u*s,t[10]=a*l}else if(e.order==="ZXY"){const u=l*d,p=l*f,m=c*d,b=c*f;t[0]=u-b*s,t[4]=-a*f,t[8]=m+p*s,t[1]=p+m*s,t[5]=a*d,t[9]=b-u*s,t[2]=-a*c,t[6]=s,t[10]=a*l}else if(e.order==="ZYX"){const u=a*d,p=a*f,m=s*d,b=s*f;t[0]=l*d,t[4]=m*c-p,t[8]=u*c+b,t[1]=l*f,t[5]=b*c+u,t[9]=p*c-m,t[2]=-c,t[6]=s*l,t[10]=a*l}else if(e.order==="YZX"){const u=a*l,p=a*c,m=s*l,b=s*c;t[0]=l*d,t[4]=b-u*f,t[8]=m*f+p,t[1]=f,t[5]=a*d,t[9]=-s*d,t[2]=-c*d,t[6]=p*f+m,t[10]=u-b*f}else if(e.order==="XZY"){const u=a*l,p=a*c,m=s*l,b=s*c;t[0]=l*d,t[4]=-f,t[8]=c*d,t[1]=u*f+b,t[5]=a*d,t[9]=p*f-m,t[2]=m*f-p,t[6]=s*d,t[10]=b*f+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(T1,e,A1)}lookAt(e,t,i){const r=this.elements;return zn.subVectors(e,t),zn.lengthSq()===0&&(zn.z=1),zn.normalize(),Ar.crossVectors(i,zn),Ar.lengthSq()===0&&(Math.abs(i.z)===1?zn.x+=1e-4:zn.z+=1e-4,zn.normalize(),Ar.crossVectors(i,zn)),Ar.normalize(),oc.crossVectors(zn,Ar),r[0]=Ar.x,r[4]=oc.x,r[8]=zn.x,r[1]=Ar.y,r[5]=oc.y,r[9]=zn.y,r[2]=Ar.z,r[6]=oc.z,r[10]=zn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,o=this.elements,a=i[0],s=i[4],l=i[8],c=i[12],d=i[1],f=i[5],u=i[9],p=i[13],m=i[2],b=i[6],g=i[10],h=i[14],_=i[3],S=i[7],w=i[11],A=i[15],M=r[0],C=r[4],v=r[8],T=r[12],P=r[1],L=r[5],B=r[9],O=r[13],q=r[2],F=r[6],V=r[10],X=r[14],k=r[3],j=r[7],ee=r[11],ce=r[15];return o[0]=a*M+s*P+l*q+c*k,o[4]=a*C+s*L+l*F+c*j,o[8]=a*v+s*B+l*V+c*ee,o[12]=a*T+s*O+l*X+c*ce,o[1]=d*M+f*P+u*q+p*k,o[5]=d*C+f*L+u*F+p*j,o[9]=d*v+f*B+u*V+p*ee,o[13]=d*T+f*O+u*X+p*ce,o[2]=m*M+b*P+g*q+h*k,o[6]=m*C+b*L+g*F+h*j,o[10]=m*v+b*B+g*V+h*ee,o[14]=m*T+b*O+g*X+h*ce,o[3]=_*M+S*P+w*q+A*k,o[7]=_*C+S*L+w*F+A*j,o[11]=_*v+S*B+w*V+A*ee,o[15]=_*T+S*O+w*X+A*ce,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],o=e[12],a=e[1],s=e[5],l=e[9],c=e[13],d=e[2],f=e[6],u=e[10],p=e[14],m=e[3],b=e[7],g=e[11],h=e[15],_=l*p-c*u,S=s*p-c*f,w=s*u-l*f,A=a*p-c*d,M=a*u-l*d,C=a*f-s*d;return t*(b*_-g*S+h*w)-i*(m*_-g*A+h*M)+r*(m*S-b*A+h*C)-o*(m*w-b*M+g*C)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],r=e[8],o=e[1],a=e[5],s=e[9],l=e[2],c=e[6],d=e[10];return t*(a*d-s*c)-i*(o*d-s*l)+r*(o*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],a=e[4],s=e[5],l=e[6],c=e[7],d=e[8],f=e[9],u=e[10],p=e[11],m=e[12],b=e[13],g=e[14],h=e[15],_=t*s-i*a,S=t*l-r*a,w=t*c-o*a,A=i*l-r*s,M=i*c-o*s,C=r*c-o*l,v=d*b-f*m,T=d*g-u*m,P=d*h-p*m,L=f*g-u*b,B=f*h-p*b,O=u*h-p*g,q=_*O-S*B+w*L+A*P-M*T+C*v;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/q;return e[0]=(s*O-l*B+c*L)*F,e[1]=(r*B-i*O-o*L)*F,e[2]=(b*C-g*M+h*A)*F,e[3]=(u*M-f*C-p*A)*F,e[4]=(l*P-a*O-c*T)*F,e[5]=(t*O-r*P+o*T)*F,e[6]=(g*w-m*C-h*S)*F,e[7]=(d*C-u*w+p*S)*F,e[8]=(a*B-s*P+c*v)*F,e[9]=(i*P-t*B-o*v)*F,e[10]=(m*M-b*w+h*_)*F,e[11]=(f*w-d*M-p*_)*F,e[12]=(s*T-a*L-l*v)*F,e[13]=(t*L-i*T+r*v)*F,e[14]=(b*S-m*A-g*_)*F,e[15]=(d*A-f*S+u*_)*F,this}scale(e){const t=this.elements,i=e.x,r=e.y,o=e.z;return t[0]*=i,t[4]*=r,t[8]*=o,t[1]*=i,t[5]*=r,t[9]*=o,t[2]*=i,t[6]*=r,t[10]*=o,t[3]*=i,t[7]*=r,t[11]*=o,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),o=1-i,a=e.x,s=e.y,l=e.z,c=o*a,d=o*s;return this.set(c*a+i,c*s-r*l,c*l+r*s,0,c*s+r*l,d*s+i,d*l-r*a,0,c*l-r*s,d*l+r*a,o*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,o,a){return this.set(1,i,o,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,o=t._x,a=t._y,s=t._z,l=t._w,c=o+o,d=a+a,f=s+s,u=o*c,p=o*d,m=o*f,b=a*d,g=a*f,h=s*f,_=l*c,S=l*d,w=l*f,A=i.x,M=i.y,C=i.z;return r[0]=(1-(b+h))*A,r[1]=(p+w)*A,r[2]=(m-S)*A,r[3]=0,r[4]=(p-w)*M,r[5]=(1-(u+h))*M,r[6]=(g+_)*M,r[7]=0,r[8]=(m+S)*C,r[9]=(g-_)*C,r[10]=(1-(u+b))*C,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];const o=this.determinantAffine();if(o===0)return i.set(1,1,1),t.identity(),this;let a=sa.set(r[0],r[1],r[2]).length();const s=sa.set(r[4],r[5],r[6]).length(),l=sa.set(r[8],r[9],r[10]).length();o<0&&(a=-a),pi.copy(this);const c=1/a,d=1/s,f=1/l;return pi.elements[0]*=c,pi.elements[1]*=c,pi.elements[2]*=c,pi.elements[4]*=d,pi.elements[5]*=d,pi.elements[6]*=d,pi.elements[8]*=f,pi.elements[9]*=f,pi.elements[10]*=f,t.setFromRotationMatrix(pi),i.x=a,i.y=s,i.z=l,this}makePerspective(e,t,i,r,o,a,s=zi,l=!1){const c=this.elements,d=2*o/(t-e),f=2*o/(i-r),u=(t+e)/(t-e),p=(i+r)/(i-r);let m,b;if(l)m=o/(a-o),b=a*o/(a-o);else if(s===zi)m=-(a+o)/(a-o),b=-2*a*o/(a-o);else if(s===_l)m=-a/(a-o),b=-a*o/(a-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+s);return c[0]=d,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,o,a,s=zi,l=!1){const c=this.elements,d=2/(t-e),f=2/(i-r),u=-(t+e)/(t-e),p=-(i+r)/(i-r);let m,b;if(l)m=1/(a-o),b=a/(a-o);else if(s===zi)m=-2/(a-o),b=-(a+o)/(a-o);else if(s===_l)m=-1/(a-o),b=-o/(a-o);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+s);return c[0]=d,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=f,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=m,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};tu.prototype.isMatrix4=!0;let at=tu;const sa=new R,pi=new at,T1=new R(0,0,0),A1=new R(1,1,1),Ar=new R,oc=new R,zn=new R,p0=new at,h0=new Zo;class $i{constructor(e=0,t=0,i=0,r=$i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,o=r[0],a=r[4],s=r[8],l=r[1],c=r[5],d=r[9],f=r[2],u=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Ye(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-a,o)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ye(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(s,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,o),this._z=0);break;case"ZXY":this._x=Math.asin(Ye(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,o));break;case"ZYX":this._y=Math.asin(-Ye(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,o)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ye(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-f,o)):(this._x=0,this._y=Math.atan2(s,p));break;case"XZY":this._z=Math.asin(-Ye(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(s,o)):(this._x=Math.atan2(-d,p),this._y=0);break;default:Ie("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return p0.makeRotationFromQuaternion(e),this.setFromRotationMatrix(p0,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return h0.setFromEuler(this),this.setFromQuaternion(h0,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}$i.DEFAULT_ORDER="XYZ";class wm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let C1=0;const m0=new R,la=new Zo,ji=new at,ac=new R,Fs=new R,R1=new R,L1=new Zo,g0=new R(1,0,0),x0=new R(0,1,0),b0=new R(0,0,1),v0={type:"added"},I1={type:"removed"},ca={type:"childadded",child:null},Vu={type:"childremoved",child:null};class Wt extends Ko{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:C1++}),this.uuid=pr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Wt.DEFAULT_UP.clone();const e=new R,t=new $i,i=new Zo,r=new R(1,1,1);function o(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(o),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new at},normalMatrix:{value:new ke}}),this.matrix=new at,this.matrixWorld=new at,this.matrixAutoUpdate=Wt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return la.setFromAxisAngle(e,t),this.quaternion.multiply(la),this}rotateOnWorldAxis(e,t){return la.setFromAxisAngle(e,t),this.quaternion.premultiply(la),this}rotateX(e){return this.rotateOnAxis(g0,e)}rotateY(e){return this.rotateOnAxis(x0,e)}rotateZ(e){return this.rotateOnAxis(b0,e)}translateOnAxis(e,t){return m0.copy(e).applyQuaternion(this.quaternion),this.position.add(m0.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(g0,e)}translateY(e){return this.translateOnAxis(x0,e)}translateZ(e){return this.translateOnAxis(b0,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ji.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ac.copy(e):ac.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ji.lookAt(Fs,ac,this.up):ji.lookAt(ac,Fs,this.up),this.quaternion.setFromRotationMatrix(ji),r&&(ji.extractRotation(r.matrixWorld),la.setFromRotationMatrix(ji),this.quaternion.premultiply(la.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(v0),ca.child=e,this.dispatchEvent(ca),ca.child=null):Ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(I1),Vu.child=e,this.dispatchEvent(Vu),Vu.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ji.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ji.multiply(e.parent.matrixWorld)),e.applyMatrix4(ji),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(v0),ca.child=e,this.dispatchEvent(ca),ca.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,e,R1),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,L1,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,r=e.z,o=this.matrix.elements;o[12]+=t-o[0]*t-o[4]*i-o[8]*r,o[13]+=i-o[1]*t-o[5]*i-o[9]*r,o[14]+=r-o[2]*t-o[6]*i-o[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const o=this.children;for(let a=0,s=o.length;a<s;a++)o[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(s=>({...s,boundingBox:s.boundingBox?s.boundingBox.toJSON():void 0,boundingSphere:s.boundingSphere?s.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(s=>({...s})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function o(s,l){return s[l.uuid]===void 0&&(s[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=o(e.geometries,this.geometry);const s=this.geometry.parameters;if(s!==void 0&&s.shapes!==void 0){const l=s.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const f=l[c];o(e.shapes,f)}else o(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const s=[];for(let l=0,c=this.material.length;l<c;l++)s.push(o(e.materials,this.material[l]));r.material=s}else r.material=o(e.materials,this.material);if(this.children.length>0){r.children=[];for(let s=0;s<this.children.length;s++)r.children.push(this.children[s].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let s=0;s<this.animations.length;s++){const l=this.animations[s];r.animations.push(o(e.animations,l))}}if(t){const s=a(e.geometries),l=a(e.materials),c=a(e.textures),d=a(e.images),f=a(e.shapes),u=a(e.skeletons),p=a(e.animations),m=a(e.nodes);s.length>0&&(i.geometries=s),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),d.length>0&&(i.images=d),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=r,i;function a(s){const l=[];for(const c in s){const d=s[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}Wt.DEFAULT_UP=new R(0,1,0);Wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Tn extends Wt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const P1={type:"move"};class Xu{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,o=null,a=null;const s=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const b of e.hand.values()){const g=t.getJointPose(b,i),h=this._getHandJoint(c,b);g!==null&&(h.matrix.fromArray(g.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=g.radius),h.visible=g!==null}const d=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=d.position.distanceTo(f.position),p=.02,m=.005;c.inputState.pinching&&u>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(l.matrix.fromArray(o.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,o.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(o.linearVelocity)):l.hasLinearVelocity=!1,o.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(o.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));s!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&o!==null&&(r=o),r!==null&&(s.matrix.fromArray(r.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,r.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(r.linearVelocity)):s.hasLinearVelocity=!1,r.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(r.angularVelocity)):s.hasAngularVelocity=!1,this.dispatchEvent(P1)))}return s!==null&&(s.visible=r!==null),l!==null&&(l.visible=o!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Tn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const dy={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Cr={h:0,s:0,l:0},sc={h:0,s:0,l:0};function qu(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ae{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=st){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ze.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=Ze.workingColorSpace){if(e=vm(e,1),t=Ye(t,0,1),i=Ye(i,0,1),t===0)this.r=this.g=this.b=i;else{const o=i<=.5?i*(1+t):i+t-i*t,a=2*i-o;this.r=qu(a,o,e+1/3),this.g=qu(a,o,e),this.b=qu(a,o,e-1/3)}return Ze.colorSpaceToWorking(this,r),this}setStyle(e,t=st){function i(o){o!==void 0&&parseFloat(o)<1&&Ie("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let o;const a=r[1],s=r[2];switch(a){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:Ie("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const o=r[1],a=o.length;if(a===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(o,16),t);Ie("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=st){const i=dy[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ie("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hr(e.r),this.g=hr(e.g),this.b=hr(e.b),this}copyLinearToSRGB(e){return this.r=Xa(e.r),this.g=Xa(e.g),this.b=Xa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=st){return Ze.workingToColorSpace(vn.copy(this),e),Math.round(Ye(vn.r*255,0,255))*65536+Math.round(Ye(vn.g*255,0,255))*256+Math.round(Ye(vn.b*255,0,255))}getHexString(e=st){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.workingToColorSpace(vn.copy(this),t);const i=vn.r,r=vn.g,o=vn.b,a=Math.max(i,r,o),s=Math.min(i,r,o);let l,c;const d=(s+a)/2;if(s===a)l=0,c=0;else{const f=a-s;switch(c=d<=.5?f/(a+s):f/(2-a-s),a){case i:l=(r-o)/f+(r<o?6:0);break;case r:l=(o-i)/f+2;break;case o:l=(i-r)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=Ze.workingColorSpace){return Ze.workingToColorSpace(vn.copy(this),t),e.r=vn.r,e.g=vn.g,e.b=vn.b,e}getStyle(e=st){Ze.workingToColorSpace(vn.copy(this),e);const t=vn.r,i=vn.g,r=vn.b;return e!==st?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Cr),this.setHSL(Cr.h+e,Cr.s+t,Cr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Cr),e.getHSL(sc);const i=fl(Cr.h,sc.h,t),r=fl(Cr.s,sc.s,t),o=fl(Cr.l,sc.l,t);return this.setHSL(i,r,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*r,this.g=o[1]*t+o[4]*i+o[7]*r,this.b=o[2]*t+o[5]*i+o[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const vn=new Ae;Ae.NAMES=dy;class _m{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ae(e),this.near=t,this.far=i}clone(){return new _m(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Eo extends Wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $i,this.environmentIntensity=1,this.environmentRotation=new $i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const hi=new R,Qi=new R,$u=new R,er=new R,da=new R,ua=new R,y0=new R,Yu=new R,Ku=new R,Zu=new R,Ju=new Rt,ju=new Rt,Qu=new Rt;class ai{constructor(e=new R,t=new R,i=new R){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),hi.subVectors(e,t),r.cross(hi);const o=r.lengthSq();return o>0?r.multiplyScalar(1/Math.sqrt(o)):r.set(0,0,0)}static getBarycoord(e,t,i,r,o){hi.subVectors(r,t),Qi.subVectors(i,t),$u.subVectors(e,t);const a=hi.dot(hi),s=hi.dot(Qi),l=hi.dot($u),c=Qi.dot(Qi),d=Qi.dot($u),f=a*c-s*s;if(f===0)return o.set(0,0,0),null;const u=1/f,p=(c*l-s*d)*u,m=(a*d-s*l)*u;return o.set(1-p-m,m,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,er)===null?!1:er.x>=0&&er.y>=0&&er.x+er.y<=1}static getInterpolation(e,t,i,r,o,a,s,l){return this.getBarycoord(e,t,i,r,er)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(o,er.x),l.addScaledVector(a,er.y),l.addScaledVector(s,er.z),l)}static getInterpolatedAttribute(e,t,i,r,o,a){return Ju.setScalar(0),ju.setScalar(0),Qu.setScalar(0),Ju.fromBufferAttribute(e,t),ju.fromBufferAttribute(e,i),Qu.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Ju,o.x),a.addScaledVector(ju,o.y),a.addScaledVector(Qu,o.z),a}static isFrontFacing(e,t,i,r){return hi.subVectors(i,t),Qi.subVectors(e,t),hi.cross(Qi).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hi.subVectors(this.c,this.b),Qi.subVectors(this.a,this.b),hi.cross(Qi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ai.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ai.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,o){return ai.getInterpolation(e,this.a,this.b,this.c,t,i,r,o)}containsPoint(e){return ai.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ai.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,o=this.c;let a,s;da.subVectors(r,i),ua.subVectors(o,i),Yu.subVectors(e,i);const l=da.dot(Yu),c=ua.dot(Yu);if(l<=0&&c<=0)return t.copy(i);Ku.subVectors(e,r);const d=da.dot(Ku),f=ua.dot(Ku);if(d>=0&&f<=d)return t.copy(r);const u=l*f-d*c;if(u<=0&&l>=0&&d<=0)return a=l/(l-d),t.copy(i).addScaledVector(da,a);Zu.subVectors(e,o);const p=da.dot(Zu),m=ua.dot(Zu);if(m>=0&&p<=m)return t.copy(o);const b=p*c-l*m;if(b<=0&&c>=0&&m<=0)return s=c/(c-m),t.copy(i).addScaledVector(ua,s);const g=d*m-p*f;if(g<=0&&f-d>=0&&p-m>=0)return y0.subVectors(o,r),s=(f-d)/(f-d+(p-m)),t.copy(r).addScaledVector(y0,s);const h=1/(g+b+u);return a=b*h,s=u*h,t.copy(i).addScaledVector(da,a).addScaledVector(ua,s)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Jo{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(mi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(mi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=mi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let a=0,s=o.count;a<s;a++)e.isMesh===!0?e.getVertexPosition(a,mi):mi.fromBufferAttribute(o,a),mi.applyMatrix4(e.matrixWorld),this.expandByPoint(mi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),lc.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),lc.copy(i.boundingBox)),lc.applyMatrix4(e.matrixWorld),this.union(lc)}const r=e.children;for(let o=0,a=r.length;o<a;o++)this.expandByObject(r[o],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,mi),mi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Us),cc.subVectors(this.max,Us),fa.subVectors(e.a,Us),pa.subVectors(e.b,Us),ha.subVectors(e.c,Us),Rr.subVectors(pa,fa),Lr.subVectors(ha,pa),lo.subVectors(fa,ha);let t=[0,-Rr.z,Rr.y,0,-Lr.z,Lr.y,0,-lo.z,lo.y,Rr.z,0,-Rr.x,Lr.z,0,-Lr.x,lo.z,0,-lo.x,-Rr.y,Rr.x,0,-Lr.y,Lr.x,0,-lo.y,lo.x,0];return!ef(t,fa,pa,ha,cc)||(t=[1,0,0,0,1,0,0,0,1],!ef(t,fa,pa,ha,cc))?!1:(dc.crossVectors(Rr,Lr),t=[dc.x,dc.y,dc.z],ef(t,fa,pa,ha,cc))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(tr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),tr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),tr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),tr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),tr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),tr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),tr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),tr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(tr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const tr=[new R,new R,new R,new R,new R,new R,new R,new R],mi=new R,lc=new Jo,fa=new R,pa=new R,ha=new R,Rr=new R,Lr=new R,lo=new R,Us=new R,cc=new R,dc=new R,co=new R;function ef(n,e,t,i,r){for(let o=0,a=n.length-3;o<=a;o+=3){co.fromArray(n,o);const s=r.x*Math.abs(co.x)+r.y*Math.abs(co.y)+r.z*Math.abs(co.z),l=e.dot(co),c=t.dot(co),d=i.dot(co);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>s)return!1}return!0}const qt=new R,uc=new De;let D1=0;class gn extends Ko{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:D1++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=dh,this.updateRanges=[],this.gpuType=Si,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,o=this.itemSize;r<o;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)uc.fromBufferAttribute(this,t),uc.applyMatrix3(e),this.setXY(t,uc.x,uc.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix3(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=vi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ut(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=vi(t,this.array)),t}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=vi(t,this.array)),t}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=vi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=vi(t,this.array)),t}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array),r=ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array),r=ut(r,this.array),o=ut(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==dh&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class uy extends gn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class fy extends gn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Mt extends gn{constructor(e,t,i){super(new Float32Array(e),t,i)}}const N1=new Jo,ks=new R,tf=new R;class Es{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):N1.setFromPoints(e).getCenter(i);let r=0;for(let o=0,a=e.length;o<a;o++)r=Math.max(r,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ks.subVectors(e,this.center);const t=ks.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(ks,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(tf.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ks.copy(e.center).add(tf)),this.expandByPoint(ks.copy(e.center).sub(tf))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let F1=0;const Zn=new at,nf=new Wt,ma=new R,Hn=new Jo,Bs=new Jo,rn=new R;class un extends Ko{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:F1++}),this.uuid=pr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(e1(e)?fy:uy)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const o=new ke().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Zn.makeRotationFromQuaternion(e),this.applyMatrix4(Zn),this}rotateX(e){return Zn.makeRotationX(e),this.applyMatrix4(Zn),this}rotateY(e){return Zn.makeRotationY(e),this.applyMatrix4(Zn),this}rotateZ(e){return Zn.makeRotationZ(e),this.applyMatrix4(Zn),this}translate(e,t,i){return Zn.makeTranslation(e,t,i),this.applyMatrix4(Zn),this}scale(e,t,i){return Zn.makeScale(e,t,i),this.applyMatrix4(Zn),this}lookAt(e){return nf.lookAt(e),nf.updateMatrix(),this.applyMatrix4(nf.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ma).negate(),this.translate(ma.x,ma.y,ma.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,o=e.length;r<o;r++){const a=e[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Mt(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const o=e[r];t.setXYZ(r,o.x,o.y,o.z||0)}e.length>t.count&&Ie("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const o=t[i];Hn.setFromBufferAttribute(o),this.morphTargetsRelative?(rn.addVectors(this.boundingBox.min,Hn.min),this.boundingBox.expandByPoint(rn),rn.addVectors(this.boundingBox.max,Hn.max),this.boundingBox.expandByPoint(rn)):(this.boundingBox.expandByPoint(Hn.min),this.boundingBox.expandByPoint(Hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Es);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(e){const i=this.boundingSphere.center;if(Hn.setFromBufferAttribute(e),t)for(let o=0,a=t.length;o<a;o++){const s=t[o];Bs.setFromBufferAttribute(s),this.morphTargetsRelative?(rn.addVectors(Hn.min,Bs.min),Hn.expandByPoint(rn),rn.addVectors(Hn.max,Bs.max),Hn.expandByPoint(rn)):(Hn.expandByPoint(Bs.min),Hn.expandByPoint(Bs.max))}Hn.getCenter(i);let r=0;for(let o=0,a=e.count;o<a;o++)rn.fromBufferAttribute(e,o),r=Math.max(r,i.distanceToSquared(rn));if(t)for(let o=0,a=t.length;o<a;o++){const s=t[o],l=this.morphTargetsRelative;for(let c=0,d=s.count;c<d;c++)rn.fromBufferAttribute(s,c),l&&(ma.fromBufferAttribute(e,c),rn.add(ma)),r=Math.max(r,i.distanceToSquared(rn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,o=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new gn(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const s=[],l=[];for(let v=0;v<i.count;v++)s[v]=new R,l[v]=new R;const c=new R,d=new R,f=new R,u=new De,p=new De,m=new De,b=new R,g=new R;function h(v,T,P){c.fromBufferAttribute(i,v),d.fromBufferAttribute(i,T),f.fromBufferAttribute(i,P),u.fromBufferAttribute(o,v),p.fromBufferAttribute(o,T),m.fromBufferAttribute(o,P),d.sub(c),f.sub(c),p.sub(u),m.sub(u);const L=1/(p.x*m.y-m.x*p.y);isFinite(L)&&(b.copy(d).multiplyScalar(m.y).addScaledVector(f,-p.y).multiplyScalar(L),g.copy(f).multiplyScalar(p.x).addScaledVector(d,-m.x).multiplyScalar(L),s[v].add(b),s[T].add(b),s[P].add(b),l[v].add(g),l[T].add(g),l[P].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let v=0,T=_.length;v<T;++v){const P=_[v],L=P.start,B=P.count;for(let O=L,q=L+B;O<q;O+=3)h(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const S=new R,w=new R,A=new R,M=new R;function C(v){A.fromBufferAttribute(r,v),M.copy(A);const T=s[v];S.copy(T),S.sub(A.multiplyScalar(A.dot(T))).normalize(),w.crossVectors(M,T);const L=w.dot(l[v])<0?-1:1;a.setXYZW(v,S.x,S.y,S.z,L)}for(let v=0,T=_.length;v<T;++v){const P=_[v],L=P.start,B=P.count;for(let O=L,q=L+B;O<q;O+=3)C(e.getX(O+0)),C(e.getX(O+1)),C(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new gn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);const r=new R,o=new R,a=new R,s=new R,l=new R,c=new R,d=new R,f=new R;if(e)for(let u=0,p=e.count;u<p;u+=3){const m=e.getX(u+0),b=e.getX(u+1),g=e.getX(u+2);r.fromBufferAttribute(t,m),o.fromBufferAttribute(t,b),a.fromBufferAttribute(t,g),d.subVectors(a,o),f.subVectors(r,o),d.cross(f),s.fromBufferAttribute(i,m),l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,g),s.add(d),l.add(d),c.add(d),i.setXYZ(m,s.x,s.y,s.z),i.setXYZ(b,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,p=t.count;u<p;u+=3)r.fromBufferAttribute(t,u+0),o.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),d.subVectors(a,o),f.subVectors(r,o),d.cross(f),i.setXYZ(u+0,d.x,d.y,d.z),i.setXYZ(u+1,d.x,d.y,d.z),i.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)rn.fromBufferAttribute(e,t),rn.normalize(),e.setXYZ(t,rn.x,rn.y,rn.z)}toNonIndexed(){function e(s,l){const c=s.array,d=s.itemSize,f=s.normalized,u=new c.constructor(l.length*d);let p=0,m=0;for(let b=0,g=l.length;b<g;b++){s.isInterleavedBufferAttribute?p=l[b]*s.data.stride+s.offset:p=l[b]*d;for(let h=0;h<d;h++)u[m++]=c[p++]}return new gn(u,d,f)}if(this.index===null)return Ie("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new un,i=this.index.array,r=this.attributes;for(const s in r){const l=r[s],c=e(l,i);t.setAttribute(s,c)}const o=this.morphAttributes;for(const s in o){const l=[],c=o[s];for(let d=0,f=c.length;d<f;d++){const u=c[d],p=e(u,i);l.push(p)}t.morphAttributes[s]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let s=0,l=a.length;s<l;s++){const c=a[s];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let o=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let f=0,u=c.length;f<u;f++){const p=c[f];d.push(p.toJSON(e.data))}d.length>0&&(r[l]=d,o=!0)}o&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const s=this.boundingSphere;return s!==null&&(e.data.boundingSphere=s.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const c in r){const d=r[c];this.setAttribute(c,d.clone(t))}const o=e.morphAttributes;for(const c in o){const d=[],f=o[c];for(let u=0,p=f.length;u<p;u++)d.push(f[u].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,d=a.length;c<d;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const s=e.boundingBox;s!==null&&(this.boundingBox=s.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class U1{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=dh,this.updateRanges=[],this.version=0,this.uuid=pr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,o=this.stride;r<o;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Cn=new R;class xd{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Cn.fromBufferAttribute(this,t),Cn.applyMatrix4(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Cn.fromBufferAttribute(this,t),Cn.applyNormalMatrix(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Cn.fromBufferAttribute(this,t),Cn.transformDirection(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=vi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ut(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=vi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=vi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=vi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=vi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array),r=ut(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),i=ut(i,this.array),r=ut(r,this.array),o=ut(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=o,this}clone(e){if(e===void 0){gd("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return new gn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new xd(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){gd("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let k1=0;class oo extends Ko{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:k1++}),this.uuid=pr(),this.name="",this.type="Material",this.blending=Ga,this.side=eo,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Mp,this.blendDst=Ep,this.blendEquation=xo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=a0,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=oa,this.stencilZFail=oa,this.stencilZPass=oa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ie(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ie(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector2&&i&&i.isVector2||r&&r.isEuler&&i&&i.isEuler||r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ga&&(i.blending=this.blending),this.side!==eo&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Mp&&(i.blendSrc=this.blendSrc),this.blendDst!==Ep&&(i.blendDst=this.blendDst),this.blendEquation!==xo&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==os&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==a0&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==oa&&(i.stencilFail=this.stencilFail),this.stencilZFail!==oa&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==oa&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(o){const a=[];for(const s in o){const l=o[s];delete l.metadata,a.push(l)}return a}if(t){const o=r(e.textures),a=r(e.images);o.length>0&&(i.textures=o),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ae().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new De().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new De().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let o=0;o!==r;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class py extends oo{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ga;const Os=new R,xa=new R,ba=new R,va=new De,zs=new De,hy=new at,fc=new R,Hs=new R,pc=new R,w0=new De,rf=new De,_0=new De;class B1 extends Wt{constructor(e=new py){if(super(),this.isSprite=!0,this.type="Sprite",ga===void 0){ga=new un;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new U1(t,5);ga.setIndex([0,1,2,0,2,3]),ga.setAttribute("position",new xd(i,3,0,!1)),ga.setAttribute("uv",new xd(i,2,3,!1))}this.geometry=ga,this.material=e,this.center=new De(.5,.5),this.count=1}raycast(e,t){e.camera===null&&Ke('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),xa.setFromMatrixScale(this.matrixWorld),hy.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ba.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&xa.multiplyScalar(-ba.z);const i=this.material.rotation;let r,o;i!==0&&(o=Math.cos(i),r=Math.sin(i));const a=this.center;hc(fc.set(-.5,-.5,0),ba,a,xa,r,o),hc(Hs.set(.5,-.5,0),ba,a,xa,r,o),hc(pc.set(.5,.5,0),ba,a,xa,r,o),w0.set(0,0),rf.set(1,0),_0.set(1,1);let s=e.ray.intersectTriangle(fc,Hs,pc,!1,Os);if(s===null&&(hc(Hs.set(-.5,.5,0),ba,a,xa,r,o),rf.set(0,1),s=e.ray.intersectTriangle(fc,pc,Hs,!1,Os),s===null))return;const l=e.ray.origin.distanceTo(Os);l<e.near||l>e.far||t.push({distance:l,point:Os.clone(),uv:ai.getInterpolation(Os,fc,Hs,pc,w0,rf,_0,new De),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function hc(n,e,t,i,r,o){va.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(zs.x=o*va.x-r*va.y,zs.y=r*va.x+o*va.y):zs.copy(va),n.copy(e),n.x+=zs.x,n.y+=zs.y,n.applyMatrix4(hy)}const nr=new R,of=new R,mc=new R,Ir=new R,af=new R,gc=new R,sf=new R;class Sm{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,nr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=nr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(nr.copy(this.origin).addScaledVector(this.direction,t),nr.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){of.copy(e).add(t).multiplyScalar(.5),mc.copy(t).sub(e).normalize(),Ir.copy(this.origin).sub(of);const o=e.distanceTo(t)*.5,a=-this.direction.dot(mc),s=Ir.dot(this.direction),l=-Ir.dot(mc),c=Ir.lengthSq(),d=Math.abs(1-a*a);let f,u,p,m;if(d>0)if(f=a*l-s,u=a*s-l,m=o*d,f>=0)if(u>=-m)if(u<=m){const b=1/d;f*=b,u*=b,p=f*(f+a*u+2*s)+u*(a*f+u+2*l)+c}else u=o,f=Math.max(0,-(a*u+s)),p=-f*f+u*(u+2*l)+c;else u=-o,f=Math.max(0,-(a*u+s)),p=-f*f+u*(u+2*l)+c;else u<=-m?(f=Math.max(0,-(-a*o+s)),u=f>0?-o:Math.min(Math.max(-o,-l),o),p=-f*f+u*(u+2*l)+c):u<=m?(f=0,u=Math.min(Math.max(-o,-l),o),p=u*(u+2*l)+c):(f=Math.max(0,-(a*o+s)),u=f>0?o:Math.min(Math.max(-o,-l),o),p=-f*f+u*(u+2*l)+c);else u=a>0?-o:o,f=Math.max(0,-(a*u+s)),p=-f*f+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),r&&r.copy(of).addScaledVector(mc,u),p}intersectSphere(e,t){nr.subVectors(e.center,this.origin);const i=nr.dot(this.direction),r=nr.dot(nr)-i*i,o=e.radius*e.radius;if(r>o)return null;const a=Math.sqrt(o-r),s=i-a,l=i+a;return l<0?null:s<0?this.at(l,t):this.at(s,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,o,a,s,l;const c=1/this.direction.x,d=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(i=(e.min.x-u.x)*c,r=(e.max.x-u.x)*c):(i=(e.max.x-u.x)*c,r=(e.min.x-u.x)*c),d>=0?(o=(e.min.y-u.y)*d,a=(e.max.y-u.y)*d):(o=(e.max.y-u.y)*d,a=(e.min.y-u.y)*d),i>a||o>r||((o>i||isNaN(i))&&(i=o),(a<r||isNaN(r))&&(r=a),f>=0?(s=(e.min.z-u.z)*f,l=(e.max.z-u.z)*f):(s=(e.max.z-u.z)*f,l=(e.min.z-u.z)*f),i>l||s>r)||((s>i||i!==i)&&(i=s),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,nr)!==null}intersectTriangle(e,t,i,r,o){af.subVectors(t,e),gc.subVectors(i,e),sf.crossVectors(af,gc);let a=this.direction.dot(sf),s;if(a>0){if(r)return null;s=1}else if(a<0)s=-1,a=-a;else return null;Ir.subVectors(this.origin,e);const l=s*this.direction.dot(gc.crossVectors(Ir,gc));if(l<0)return null;const c=s*this.direction.dot(af.cross(Ir));if(c<0||l+c>a)return null;const d=-s*Ir.dot(sf);return d<0?null:this.at(d/a,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ji extends oo{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.combine=nu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const S0=new at,uo=new Sm,xc=new Es,M0=new R,bc=new R,vc=new R,yc=new R,lf=new R,wc=new R,E0=new R,_c=new R;class Oe extends Wt{constructor(e=new un,t=new Ji){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=r.length;o<a;o++){const s=r[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=o}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,o=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const s=this.morphTargetInfluences;if(o&&s){wc.set(0,0,0);for(let l=0,c=o.length;l<c;l++){const d=s[l],f=o[l];d!==0&&(lf.fromBufferAttribute(f,e),a?wc.addScaledVector(lf,d):wc.addScaledVector(lf.sub(t),d))}t.add(wc)}return t}raycast(e,t){const i=this.geometry,r=this.material,o=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),xc.copy(i.boundingSphere),xc.applyMatrix4(o),uo.copy(e.ray).recast(e.near),!(xc.containsPoint(uo.origin)===!1&&(uo.intersectSphere(xc,M0)===null||uo.origin.distanceToSquared(M0)>(e.far-e.near)**2))&&(S0.copy(o).invert(),uo.copy(e.ray).applyMatrix4(S0),!(i.boundingBox!==null&&uo.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,uo)))}_computeIntersections(e,t,i){let r;const o=this.geometry,a=this.material,s=o.index,l=o.attributes.position,c=o.attributes.uv,d=o.attributes.uv1,f=o.attributes.normal,u=o.groups,p=o.drawRange;if(s!==null)if(Array.isArray(a))for(let m=0,b=u.length;m<b;m++){const g=u[m],h=a[g.materialIndex],_=Math.max(g.start,p.start),S=Math.min(s.count,Math.min(g.start+g.count,p.start+p.count));for(let w=_,A=S;w<A;w+=3){const M=s.getX(w),C=s.getX(w+1),v=s.getX(w+2);r=Sc(this,h,e,i,c,d,f,M,C,v),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),b=Math.min(s.count,p.start+p.count);for(let g=m,h=b;g<h;g+=3){const _=s.getX(g),S=s.getX(g+1),w=s.getX(g+2);r=Sc(this,a,e,i,c,d,f,_,S,w),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,b=u.length;m<b;m++){const g=u[m],h=a[g.materialIndex],_=Math.max(g.start,p.start),S=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let w=_,A=S;w<A;w+=3){const M=w,C=w+1,v=w+2;r=Sc(this,h,e,i,c,d,f,M,C,v),r&&(r.faceIndex=Math.floor(w/3),r.face.materialIndex=g.materialIndex,t.push(r))}}else{const m=Math.max(0,p.start),b=Math.min(l.count,p.start+p.count);for(let g=m,h=b;g<h;g+=3){const _=g,S=g+1,w=g+2;r=Sc(this,a,e,i,c,d,f,_,S,w),r&&(r.faceIndex=Math.floor(g/3),t.push(r))}}}}function O1(n,e,t,i,r,o,a,s){let l;if(e.side===Nn?l=i.intersectTriangle(a,o,r,!0,s):l=i.intersectTriangle(r,o,a,e.side===eo,s),l===null)return null;_c.copy(s),_c.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(_c);return c<t.near||c>t.far?null:{distance:c,point:_c.clone(),object:n}}function Sc(n,e,t,i,r,o,a,s,l,c){n.getVertexPosition(s,bc),n.getVertexPosition(l,vc),n.getVertexPosition(c,yc);const d=O1(n,e,t,i,bc,vc,yc,E0);if(d){const f=new R;ai.getBarycoord(E0,bc,vc,yc,f),r&&(d.uv=ai.getInterpolatedAttribute(r,s,l,c,f,new De)),o&&(d.uv1=ai.getInterpolatedAttribute(o,s,l,c,f,new De)),a&&(d.normal=ai.getInterpolatedAttribute(a,s,l,c,f,new R),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const u={a:s,b:l,c,normal:new R,materialIndex:0};ai.getNormal(bc,vc,yc,u.normal),d.face=u,d.barycoord=f}return d}class my extends cn{constructor(e=null,t=1,i=1,r,o,a,s,l,c=Fe,d=Fe,f,u){super(null,a,s,l,c,d,r,o,f,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class T0 extends gn{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const ya=new at,A0=new at,Mc=[],C0=new Jo,z1=new at,Ws=new Oe,Gs=new Es;class gy extends Oe{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new T0(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,z1)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jo),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ya),C0.copy(e.boundingBox).applyMatrix4(ya),this.boundingBox.union(C0)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Es),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ya),Gs.copy(e.boundingSphere).applyMatrix4(ya),this.boundingSphere.union(Gs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,o=i.length+1,a=e*o+1;for(let s=0;s<i.length;s++)i[s]=r[a+s]}raycast(e,t){const i=this.matrixWorld,r=this.count;if(Ws.geometry=this.geometry,Ws.material=this.material,Ws.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Gs.copy(this.boundingSphere),Gs.applyMatrix4(i),e.ray.intersectsSphere(Gs)!==!1))for(let o=0;o<r;o++){this.getMatrixAt(o,ya),A0.multiplyMatrices(i,ya),Ws.matrixWorld=A0,Ws.raycast(e,Mc);for(let a=0,s=Mc.length;a<s;a++){const l=Mc[a];l.instanceId=o,l.object=this,t.push(l)}Mc.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new T0(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new my(new Float32Array(r*this.count),r,this.count,pm,Si));const o=this.morphTexture.source.data.data;let a=0;for(let c=0;c<i.length;c++)a+=i[c];const s=this.geometry.morphTargetsRelative?1:1-a,l=r*e;return o[l]=s,o.set(i,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const cf=new R,H1=new R,W1=new ke;class mo{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=cf.subVectors(i,t).cross(H1.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const r=e.delta(cf),o=this.normal.dot(r);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/o;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||W1.getNormalMatrix(e),r=this.coplanarPoint(cf).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fo=new Es,G1=new De(.5,.5),Ec=new R;class Mm{constructor(e=new mo,t=new mo,i=new mo,r=new mo,o=new mo,a=new mo){this.planes=[e,t,i,r,o,a]}set(e,t,i,r,o,a){const s=this.planes;return s[0].copy(e),s[1].copy(t),s[2].copy(i),s[3].copy(r),s[4].copy(o),s[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=zi,i=!1){const r=this.planes,o=e.elements,a=o[0],s=o[1],l=o[2],c=o[3],d=o[4],f=o[5],u=o[6],p=o[7],m=o[8],b=o[9],g=o[10],h=o[11],_=o[12],S=o[13],w=o[14],A=o[15];if(r[0].setComponents(c-a,p-d,h-m,A-_).normalize(),r[1].setComponents(c+a,p+d,h+m,A+_).normalize(),r[2].setComponents(c+s,p+f,h+b,A+S).normalize(),r[3].setComponents(c-s,p-f,h-b,A-S).normalize(),i)r[4].setComponents(l,u,g,w).normalize(),r[5].setComponents(c-l,p-u,h-g,A-w).normalize();else if(r[4].setComponents(c-l,p-u,h-g,A-w).normalize(),t===zi)r[5].setComponents(c+l,p+u,h+g,A+w).normalize();else if(t===_l)r[5].setComponents(l,u,g,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fo.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fo.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fo)}intersectsSprite(e){fo.center.set(0,0,0);const t=G1.distanceTo(e.center);return fo.radius=.7071067811865476+t,fo.applyMatrix4(e.matrixWorld),this.intersectsSphere(fo)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Ec.x=r.normal.x>0?e.max.x:e.min.x,Ec.y=r.normal.y>0?e.max.y:e.min.y,Ec.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ec)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Em extends oo{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const bd=new R,vd=new R,R0=new at,Vs=new Sm,Tc=new Es,df=new R,L0=new R;class V1 extends Wt{constructor(e=new un,t=new Em){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let r=1,o=t.count;r<o;r++)bd.fromBufferAttribute(t,r-1),vd.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=bd.distanceTo(vd);e.setAttribute("lineDistance",new Mt(i,1))}else Ie("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,o=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Tc.copy(i.boundingSphere),Tc.applyMatrix4(r),Tc.radius+=o,e.ray.intersectsSphere(Tc)===!1)return;R0.copy(r).invert(),Vs.copy(e.ray).applyMatrix4(R0);const s=o/((this.scale.x+this.scale.y+this.scale.z)/3),l=s*s,c=this.isLineSegments?2:1,d=i.index,u=i.attributes.position;if(d!==null){const p=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let b=p,g=m-1;b<g;b+=c){const h=d.getX(b),_=d.getX(b+1),S=Ac(this,e,Vs,l,h,_,b);S&&t.push(S)}if(this.isLineLoop){const b=d.getX(m-1),g=d.getX(p),h=Ac(this,e,Vs,l,b,g,m-1);h&&t.push(h)}}else{const p=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let b=p,g=m-1;b<g;b+=c){const h=Ac(this,e,Vs,l,b,b+1,b);h&&t.push(h)}if(this.isLineLoop){const b=Ac(this,e,Vs,l,m-1,p,m-1);b&&t.push(b)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,a=r.length;o<a;o++){const s=r[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[s]=o}}}}}function Ac(n,e,t,i,r,o,a){const s=n.geometry.attributes.position;if(bd.fromBufferAttribute(s,r),vd.fromBufferAttribute(s,o),t.distanceSqToSegment(bd,vd,df,L0)>i)return;df.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(df);if(!(c<e.near||c>e.far))return{distance:c,point:L0.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}const I0=new R,P0=new R;class xy extends V1{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let r=0,o=t.count;r<o;r+=2)I0.fromBufferAttribute(t,r),P0.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+I0.distanceTo(P0);e.setAttribute("lineDistance",new Mt(i,1))}else Ie("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class by extends cn{constructor(e=[],t=ko,i,r,o,a,s,l,c,d){super(e,t,i,r,o,a,s,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class jo extends cn{constructor(e,t,i,r,o,a,s,l,c){super(e,t,i,r,o,a,s,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ls extends cn{constructor(e,t,i=qi,r,o,a,s=Fe,l=Fe,c,d=gr,f=1){if(d!==gr&&d!==Mo)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:f};super(u,r,o,a,s,l,d,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ym(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class X1 extends ls{constructor(e,t=qi,i=ko,r,o,a=Fe,s=Fe,l,c=gr){const d={width:e,height:e,depth:1},f=[d,d,d,d,d,d];super(e,e,t,i,r,o,a,s,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class vy extends cn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ft extends un{constructor(e=1,t=1,i=1,r=1,o=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:o,depthSegments:a};const s=this;r=Math.floor(r),o=Math.floor(o),a=Math.floor(a);const l=[],c=[],d=[],f=[];let u=0,p=0;m("z","y","x",-1,-1,i,t,e,a,o,0),m("z","y","x",1,-1,i,t,-e,a,o,1),m("x","z","y",1,1,e,i,t,r,a,2),m("x","z","y",1,-1,e,i,-t,r,a,3),m("x","y","z",1,-1,e,t,i,r,o,4),m("x","y","z",-1,-1,e,t,-i,r,o,5),this.setIndex(l),this.setAttribute("position",new Mt(c,3)),this.setAttribute("normal",new Mt(d,3)),this.setAttribute("uv",new Mt(f,2));function m(b,g,h,_,S,w,A,M,C,v,T){const P=w/C,L=A/v,B=w/2,O=A/2,q=M/2,F=C+1,V=v+1;let X=0,k=0;const j=new R;for(let ee=0;ee<V;ee++){const ce=ee*L-O;for(let me=0;me<F;me++){const nt=me*P-B;j[b]=nt*_,j[g]=ce*S,j[h]=q,c.push(j.x,j.y,j.z),j[b]=0,j[g]=0,j[h]=M>0?1:-1,d.push(j.x,j.y,j.z),f.push(me/C),f.push(1-ee/v),X+=1}}for(let ee=0;ee<v;ee++)for(let ce=0;ce<C;ce++){const me=u+ce+F*ee,nt=u+ce+F*(ee+1),Pt=u+(ce+1)+F*(ee+1),it=u+(ce+1)+F*ee;l.push(me,nt,it),l.push(nt,Pt,it),k+=6}s.addGroup(p,k,T),p+=k,u+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ft(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Ts extends un{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const o=e/2,a=t/2,s=Math.floor(i),l=Math.floor(r),c=s+1,d=l+1,f=e/s,u=t/l,p=[],m=[],b=[],g=[];for(let h=0;h<d;h++){const _=h*u-a;for(let S=0;S<c;S++){const w=S*f-o;m.push(w,-_,0),b.push(0,0,1),g.push(S/s),g.push(1-h/l)}}for(let h=0;h<l;h++)for(let _=0;_<s;_++){const S=_+c*h,w=_+c*(h+1),A=_+1+c*(h+1),M=_+1+c*h;p.push(S,w,M),p.push(w,A,M)}this.setIndex(p),this.setAttribute("position",new Mt(m,3)),this.setAttribute("normal",new Mt(b,3)),this.setAttribute("uv",new Mt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ts(e.width,e.height,e.widthSegments,e.heightSegments)}}class Vl extends un{constructor(e=1,t=32,i=16,r=0,o=Math.PI*2,a=0,s=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:o,thetaStart:a,thetaLength:s},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+s,Math.PI);let c=0;const d=[],f=new R,u=new R,p=[],m=[],b=[],g=[];for(let h=0;h<=i;h++){const _=[],S=h/i,w=a+S*s,A=e*Math.cos(w),M=Math.sqrt(e*e-A*A);let C=0;h===0&&a===0?C=.5/t:h===i&&l===Math.PI&&(C=-.5/t);for(let v=0;v<=t;v++){const T=v/t,P=r+T*o;f.x=-M*Math.cos(P),f.y=A,f.z=M*Math.sin(P),m.push(f.x,f.y,f.z),u.copy(f).normalize(),b.push(u.x,u.y,u.z),g.push(T+C,1-S),_.push(c++)}d.push(_)}for(let h=0;h<i;h++)for(let _=0;_<t;_++){const S=d[h][_+1],w=d[h][_],A=d[h+1][_],M=d[h+1][_+1];(h!==0||a>0)&&p.push(S,w,M),(h!==i-1||l<Math.PI)&&p.push(w,A,M)}this.setIndex(p),this.setAttribute("position",new Mt(m,3)),this.setAttribute("normal",new Mt(b,3)),this.setAttribute("uv",new Mt(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vl(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function cs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];if(D0(r))r.isRenderTargetTexture?(Ie("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone();else if(Array.isArray(r))if(D0(r[0])){const o=[];for(let a=0,s=r.length;a<s;a++)o[a]=r[a].clone();e[t][i]=o}else e[t][i]=r.slice();else e[t][i]=r}}return e}function Rn(n){const e={};for(let t=0;t<n.length;t++){const i=cs(n[t]);for(const r in i)e[r]=i[r]}return e}function D0(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function q1(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function yy(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}const $1={clone:cs,merge:Rn};var Y1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,K1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ci extends oo{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Y1,this.fragmentShader=K1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cs(e.uniforms),this.uniformsGroups=q1(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const r=e.uniforms[i];switch(this.uniforms[i]={},r.type){case"t":this.uniforms[i].value=t[r.value]||null;break;case"c":this.uniforms[i].value=new Ae().setHex(r.value);break;case"v2":this.uniforms[i].value=new De().fromArray(r.value);break;case"v3":this.uniforms[i].value=new R().fromArray(r.value);break;case"v4":this.uniforms[i].value=new Rt().fromArray(r.value);break;case"m3":this.uniforms[i].value=new ke().fromArray(r.value);break;case"m4":this.uniforms[i].value=new at().fromArray(r.value);break;default:this.uniforms[i].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Z1 extends Ci{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class lt extends oo{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ae(16777215),this.specular=new Ae(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=pd,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.combine=nu,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Xn extends oo{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=pd,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.combine=nu,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class J1 extends oo{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=XS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class j1 extends oo{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const uf={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(N0(n)||(this.files[n]=e))},get:function(n){if(this.enabled!==!1&&!N0(n))return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};function N0(n){try{const e=n.slice(n.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Q1{constructor(e,t,i){const r=this;let o=!1,a=0,s=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(d){s++,o===!1&&r.onStart!==void 0&&r.onStart(d,a,s),o=!0},this.itemEnd=function(d){a++,r.onProgress!==void 0&&r.onProgress(d,a,s),a===s&&(o=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(d){r.onError!==void 0&&r.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,f){return c.push(d,f),this},this.removeHandler=function(d){const f=c.indexOf(d);return f!==-1&&c.splice(f,2),this},this.getHandler=function(d){for(let f=0,u=c.length;f<u;f+=2){const p=c[f],m=c[f+1];if(p.global&&(p.lastIndex=0),p.test(d))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const eM=new Q1;class Tm{constructor(e){this.manager=e!==void 0?e:eM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const i=this;return new Promise(function(r,o){i.load(e,r,t,o)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Tm.DEFAULT_MATERIAL_NAME="__DEFAULT";const wa=new WeakMap;class tM extends Tm{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const o=this,a=uf.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)o.manager.itemStart(e),setTimeout(function(){t&&t(a),o.manager.itemEnd(e)},0);else{let f=wa.get(a);f===void 0&&(f=[],wa.set(a,f)),f.push({onLoad:t,onError:r})}return a}const s=Sl("img");function l(){d(),t&&t(this);const f=wa.get(this)||[];for(let u=0;u<f.length;u++){const p=f[u];p.onLoad&&p.onLoad(this)}wa.delete(this),o.manager.itemEnd(e)}function c(f){d(),r&&r(f),uf.remove(`image:${e}`);const u=wa.get(this)||[];for(let p=0;p<u.length;p++){const m=u[p];m.onError&&m.onError(f)}wa.delete(this),o.manager.itemError(e),o.manager.itemEnd(e)}function d(){s.removeEventListener("load",l,!1),s.removeEventListener("error",c,!1)}return s.addEventListener("load",l,!1),s.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(s.crossOrigin=this.crossOrigin),uf.add(`image:${e}`,s),o.manager.itemStart(e),s.src=e,s}}class As extends Tm{constructor(e){super(e)}load(e,t,i,r){const o=new cn,a=new tM(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(s){o.image=s,o.needsUpdate=!0,t!==void 0&&t(o)},i,r),o}}class ou extends Wt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class wy extends ou{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const ff=new at,F0=new R,U0=new R;class _y{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new De(512,512),this.mapType=Vn,this.map=null,this.mapPass=null,this.matrix=new at,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mm,this._frameExtents=new De(1,1),this._viewportCount=1,this._viewports=[new Rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;F0.setFromMatrixPosition(e.matrixWorld),t.position.copy(F0),U0.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(U0),t.updateMatrixWorld(),ff.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ff,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===_l||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ff)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Cc=new R,Rc=new Zo,Di=new R;class Sy extends Wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new at,this.projectionMatrix=new at,this.projectionMatrixInverse=new at,this.coordinateSystem=zi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Cc,Rc,Di),Di.x===1&&Di.y===1&&Di.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Cc,Rc,Di.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Cc,Rc,Di),Di.x===1&&Di.y===1&&Di.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Cc,Rc,Di.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Pr=new R,k0=new De,B0=new De;class Pn extends Sy{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ml*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ul*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ml*2*Math.atan(Math.tan(ul*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Pr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z),Pr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Pr.x,Pr.y).multiplyScalar(-e/Pr.z)}getViewSize(e,t){return this.getViewBounds(e,k0,B0),t.subVectors(B0,k0)}setViewOffset(e,t,i,r,o,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ul*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,o=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;o+=a.offsetX*r/l,t-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const s=this.filmOffset;s!==0&&(o+=e*s/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class nM extends _y{constructor(){super(new Pn(90,1,.5,500)),this.isPointLightShadow=!0}}class Am extends ou{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new nM}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Cm extends Sy{constructor(e=-1,t=1,i=1,r=-1,o=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=o,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,o,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let o=i-e,a=i+e,s=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=c*this.view.offsetX,a=o+c*this.view.width,s-=d*this.view.offsetY,l=s-d*this.view.height}this.projectionMatrix.makeOrthographic(o,a,s,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class iM extends _y{constructor(){super(new Cm(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class yd extends ou{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.target=new Wt,this.shadow=new iM}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class My extends ou{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const _a=-90,Sa=1;class rM extends Wt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Pn(_a,Sa,e,t);r.layers=this.layers,this.add(r);const o=new Pn(_a,Sa,e,t);o.layers=this.layers,this.add(o);const a=new Pn(_a,Sa,e,t);a.layers=this.layers,this.add(a);const s=new Pn(_a,Sa,e,t);s.layers=this.layers,this.add(s);const l=new Pn(_a,Sa,e,t);l.layers=this.layers,this.add(l);const c=new Pn(_a,Sa,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,o,a,s,l]=t;for(const c of t)this.remove(c);if(e===zi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),s.up.set(0,1,0),s.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===_l)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),s.up.set(0,-1,0),s.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[o,a,s,l,c,d]=this.children,f=e.getRenderTarget(),u=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const b=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,1,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,3,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=b,e.setRenderTarget(i,5,r),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(f,u,p),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}}class oM extends Pn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const O0=new at;class Xl{constructor(e,t,i=0,r=1/0){this.ray=new Sm(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new wm,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ke("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return O0.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(O0),this}intersectObject(e,t=!0,i=[]){return uh(e,this,i,t),i.sort(z0),i}intersectObjects(e,t=!0,i=[]){for(let r=0,o=e.length;r<o;r++)uh(e[r],this,i,t);return i.sort(z0),i}}function z0(n,e){return n.distance-e.distance}function uh(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){const o=n.children;for(let a=0,s=o.length;a<s;a++)uh(o[a],e,t,!0)}}const Hg=class Hg{constructor(e,t,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){const o=this.elements;return o[0]=e,o[2]=t,o[1]=i,o[3]=r,this}};Hg.prototype.isMatrix2=!0;let H0=Hg;function W0(n,e,t,i){const r=aM(i);switch(t){case ay:return n*e;case pm:return n*e/r.components*r.byteLength;case hm:return n*e/r.components*r.byteLength;case Bo:return n*e*2/r.components*r.byteLength;case mm:return n*e*2/r.components*r.byteLength;case sy:return n*e*3/r.components*r.byteLength;case Mi:return n*e*4/r.components*r.byteLength;case gm:return n*e*4/r.components*r.byteLength;case ed:case td:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case nd:case id:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Fp:case kp:return Math.max(n,16)*Math.max(e,8)/4;case Np:case Up:return Math.max(n,8)*Math.max(e,8)/2;case Bp:case Op:case Hp:case Wp:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case zp:case ud:case Gp:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Vp:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Xp:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case qp:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case $p:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Yp:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Kp:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Zp:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Jp:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case jp:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Qp:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case eh:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case th:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case nh:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ih:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case rh:case oh:case ah:return Math.ceil(n/4)*Math.ceil(e/4)*16;case sh:case lh:return Math.ceil(n/4)*Math.ceil(e/4)*8;case fd:case ch:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function aM(n){switch(n){case Vn:case ny:return{byteLength:1,components:1};case yl:case iy:case mr:return{byteLength:2,components:1};case um:case fm:return{byteLength:2,components:4};case qi:case dm:case Si:return{byteLength:4,components:1};case ry:case oy:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:cm}}));typeof window<"u"&&(window.__THREE__?Ie("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=cm);function Ey(){let n=null,e=!1,t=null,i=null;function r(o,a){t(o,a),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){n=o}}}function sM(n){const e=new WeakMap;function t(s,l){const c=s.array,d=s.usage,f=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,d),s.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=n.HALF_FLOAT;else if(c instanceof Uint16Array)s.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:s.version,size:f}}function i(s,l,c){const d=l.array,f=l.updateRanges;if(n.bindBuffer(c,s),f.length===0)n.bufferSubData(c,0,d);else{f.sort((p,m)=>p.start-m.start);let u=0;for(let p=1;p<f.length;p++){const m=f[u],b=f[p];b.start<=m.start+m.count+1?m.count=Math.max(m.count,b.start+b.count-m.start):(++u,f[u]=b)}f.length=u+1;for(let p=0,m=f.length;p<m;p++){const b=f[p];n.bufferSubData(c,b.start*d.BYTES_PER_ELEMENT,d,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(s){return s.isInterleavedBufferAttribute&&(s=s.data),e.get(s)}function o(s){s.isInterleavedBufferAttribute&&(s=s.data);const l=e.get(s);l&&(n.deleteBuffer(l.buffer),e.delete(s))}function a(s,l){if(s.isInterleavedBufferAttribute&&(s=s.data),s.isGLBufferAttribute){const d=e.get(s);(!d||d.version<s.version)&&e.set(s,{buffer:s.buffer,type:s.type,bytesPerElement:s.elementSize,version:s.version});return}const c=e.get(s);if(c===void 0)e.set(s,t(s,l));else if(c.version<s.version){if(c.size!==s.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,s,l),c.version=s.version}}return{get:r,remove:o,update:a}}var lM=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,cM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,dM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,uM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,mM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,gM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,xM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,vM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yM=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wM=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,_M=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,SM=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,MM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,EM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,TM=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,AM=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,CM=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,RM=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,LM=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,IM=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,PM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,DM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,NM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,FM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,UM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,kM=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,BM="gl_FragColor = linearToOutputTexel( gl_FragColor );",OM=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,HM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,WM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,GM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,VM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,XM=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,qM=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,$M=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,YM=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,KM=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ZM=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,JM=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jM=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,QM=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,eE=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,tE=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,nE=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,iE=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rE=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,oE=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,aE=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,sE=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lE=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cE=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,dE=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,uE=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fE=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pE=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hE=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mE=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gE=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xE=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,bE=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vE=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yE=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wE=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_E=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,SE=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ME=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,EE=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,TE=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,AE=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,CE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,RE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,LE=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,IE=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,PE=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,DE=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,NE=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,FE=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,UE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,kE=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,BE=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,OE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,HE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,WE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,GE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,VE=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,XE=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,qE=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,$E=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,YE=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,KE=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ZE=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,JE=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jE=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,QE=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,eT=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tT=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,nT=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,iT=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,rT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,oT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,aT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,sT=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const lT=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cT=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uT=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pT=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mT=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,gT=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,xT=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,bT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vT=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yT=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wT=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_T=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ST=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,MT=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ET=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TT=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,AT=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CT=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,RT=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,LT=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,IT=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,PT=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,DT=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NT=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,FT=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,UT=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,kT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,BT=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,OT=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zT=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,HT=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:lM,alphahash_pars_fragment:cM,alphamap_fragment:dM,alphamap_pars_fragment:uM,alphatest_fragment:fM,alphatest_pars_fragment:pM,aomap_fragment:hM,aomap_pars_fragment:mM,batching_pars_vertex:gM,batching_vertex:xM,begin_vertex:bM,beginnormal_vertex:vM,bsdfs:yM,iridescence_fragment:wM,bumpmap_pars_fragment:_M,clipping_planes_fragment:SM,clipping_planes_pars_fragment:MM,clipping_planes_pars_vertex:EM,clipping_planes_vertex:TM,color_fragment:AM,color_pars_fragment:CM,color_pars_vertex:RM,color_vertex:LM,common:IM,cube_uv_reflection_fragment:PM,defaultnormal_vertex:DM,displacementmap_pars_vertex:NM,displacementmap_vertex:FM,emissivemap_fragment:UM,emissivemap_pars_fragment:kM,colorspace_fragment:BM,colorspace_pars_fragment:OM,envmap_fragment:zM,envmap_common_pars_fragment:HM,envmap_pars_fragment:WM,envmap_pars_vertex:GM,envmap_physical_pars_fragment:eE,envmap_vertex:VM,fog_vertex:XM,fog_pars_vertex:qM,fog_fragment:$M,fog_pars_fragment:YM,gradientmap_pars_fragment:KM,lightmap_pars_fragment:ZM,lights_lambert_fragment:JM,lights_lambert_pars_fragment:jM,lights_pars_begin:QM,lights_toon_fragment:tE,lights_toon_pars_fragment:nE,lights_phong_fragment:iE,lights_phong_pars_fragment:rE,lights_physical_fragment:oE,lights_physical_pars_fragment:aE,lights_fragment_begin:sE,lights_fragment_maps:lE,lights_fragment_end:cE,lightprobes_pars_fragment:dE,logdepthbuf_fragment:uE,logdepthbuf_pars_fragment:fE,logdepthbuf_pars_vertex:pE,logdepthbuf_vertex:hE,map_fragment:mE,map_pars_fragment:gE,map_particle_fragment:xE,map_particle_pars_fragment:bE,metalnessmap_fragment:vE,metalnessmap_pars_fragment:yE,morphinstance_vertex:wE,morphcolor_vertex:_E,morphnormal_vertex:SE,morphtarget_pars_vertex:ME,morphtarget_vertex:EE,normal_fragment_begin:TE,normal_fragment_maps:AE,normal_pars_fragment:CE,normal_pars_vertex:RE,normal_vertex:LE,normalmap_pars_fragment:IE,clearcoat_normal_fragment_begin:PE,clearcoat_normal_fragment_maps:DE,clearcoat_pars_fragment:NE,iridescence_pars_fragment:FE,opaque_fragment:UE,packing:kE,premultiplied_alpha_fragment:BE,project_vertex:OE,dithering_fragment:zE,dithering_pars_fragment:HE,roughnessmap_fragment:WE,roughnessmap_pars_fragment:GE,shadowmap_pars_fragment:VE,shadowmap_pars_vertex:XE,shadowmap_vertex:qE,shadowmask_pars_fragment:$E,skinbase_vertex:YE,skinning_pars_vertex:KE,skinning_vertex:ZE,skinnormal_vertex:JE,specularmap_fragment:jE,specularmap_pars_fragment:QE,tonemapping_fragment:eT,tonemapping_pars_fragment:tT,transmission_fragment:nT,transmission_pars_fragment:iT,uv_pars_fragment:rT,uv_pars_vertex:oT,uv_vertex:aT,worldpos_vertex:sT,background_vert:lT,background_frag:cT,backgroundCube_vert:dT,backgroundCube_frag:uT,cube_vert:fT,cube_frag:pT,depth_vert:hT,depth_frag:mT,distance_vert:gT,distance_frag:xT,equirect_vert:bT,equirect_frag:vT,linedashed_vert:yT,linedashed_frag:wT,meshbasic_vert:_T,meshbasic_frag:ST,meshlambert_vert:MT,meshlambert_frag:ET,meshmatcap_vert:TT,meshmatcap_frag:AT,meshnormal_vert:CT,meshnormal_frag:RT,meshphong_vert:LT,meshphong_frag:IT,meshphysical_vert:PT,meshphysical_frag:DT,meshtoon_vert:NT,meshtoon_frag:FT,points_vert:UT,points_frag:kT,shadow_vert:BT,shadow_frag:OT,sprite_vert:zT,sprite_frag:HT},ue={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new De(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new R},probesMax:{value:new R},probesResolution:{value:new R}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new De(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},Bi={basic:{uniforms:Rn([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Rn([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Ae(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Rn([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Rn([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Rn([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Rn([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Rn([ue.points,ue.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Rn([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Rn([ue.common,ue.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Rn([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Rn([ue.sprite,ue.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Rn([ue.common,ue.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Rn([ue.lights,ue.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};Bi.physical={uniforms:Rn([Bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new De(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new De},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new De},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Lc={r:0,b:0,g:0},WT=new at,Ty=new ke;Ty.set(-1,0,0,0,1,0,0,0,1);function GT(n,e,t,i,r,o){const a=new Ae(0);let s=r===!0?0:1,l,c,d=null,f=0,u=null;function p(_){let S=_.isScene===!0?_.background:null;if(S&&S.isTexture){const w=_.backgroundBlurriness>0;S=e.get(S,w)}return S}function m(_){let S=!1;const w=p(_);w===null?g(a,s):w&&w.isColor&&(g(w,1),S=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,o),(n.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function b(_,S){const w=p(S);w&&(w.isCubeTexture||w.mapping===ru)?(c===void 0&&(c=new Oe(new ft(1,1,1),new Ci({name:"BackgroundCubeMaterial",uniforms:cs(Bi.backgroundCube.uniforms),vertexShader:Bi.backgroundCube.vertexShader,fragmentShader:Bi.backgroundCube.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,M,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=w,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(WT.makeRotationFromEuler(S.backgroundRotation)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Ty),c.material.toneMapped=Ze.getTransfer(w.colorSpace)!==dt,(d!==w||f!==w.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,d=w,f=w.version,u=n.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null)):w&&w.isTexture&&(l===void 0&&(l=new Oe(new Ts(2,2),new Ci({name:"BackgroundMaterial",uniforms:cs(Bi.background.uniforms),vertexShader:Bi.background.vertexShader,fragmentShader:Bi.background.fragmentShader,side:eo,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=w,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=Ze.getTransfer(w.colorSpace)!==dt,w.matrixAutoUpdate===!0&&w.updateMatrix(),l.material.uniforms.uvTransform.value.copy(w.matrix),(d!==w||f!==w.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,d=w,f=w.version,u=n.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function g(_,S){_.getRGB(Lc,yy(n)),t.buffers.color.setClear(Lc.r,Lc.g,Lc.b,S,o)}function h(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(_,S=1){a.set(_),s=S,g(a,s)},getClearAlpha:function(){return s},setClearAlpha:function(_){s=_,g(a,s)},render:m,addToRenderList:b,dispose:h}}function VT(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=u(null);let o=r,a=!1;function s(L,B,O,q,F){let V=!1;const X=f(L,q,O,B);o!==X&&(o=X,c(o.object)),V=p(L,q,O,F),V&&m(L,q,O,F),F!==null&&e.update(F,n.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,w(L,B,O,q),F!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return n.createVertexArray()}function c(L){return n.bindVertexArray(L)}function d(L){return n.deleteVertexArray(L)}function f(L,B,O,q){const F=q.wireframe===!0;let V=i[B.id];V===void 0&&(V={},i[B.id]=V);const X=L.isInstancedMesh===!0?L.id:0;let k=V[X];k===void 0&&(k={},V[X]=k);let j=k[O.id];j===void 0&&(j={},k[O.id]=j);let ee=j[F];return ee===void 0&&(ee=u(l()),j[F]=ee),ee}function u(L){const B=[],O=[],q=[];for(let F=0;F<t;F++)B[F]=0,O[F]=0,q[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:O,attributeDivisors:q,object:L,attributes:{},index:null}}function p(L,B,O,q){const F=o.attributes,V=B.attributes;let X=0;const k=O.getAttributes();for(const j in k)if(k[j].location>=0){const ce=F[j];let me=V[j];if(me===void 0&&(j==="instanceMatrix"&&L.instanceMatrix&&(me=L.instanceMatrix),j==="instanceColor"&&L.instanceColor&&(me=L.instanceColor)),ce===void 0||ce.attribute!==me||me&&ce.data!==me.data)return!0;X++}return o.attributesNum!==X||o.index!==q}function m(L,B,O,q){const F={},V=B.attributes;let X=0;const k=O.getAttributes();for(const j in k)if(k[j].location>=0){let ce=V[j];ce===void 0&&(j==="instanceMatrix"&&L.instanceMatrix&&(ce=L.instanceMatrix),j==="instanceColor"&&L.instanceColor&&(ce=L.instanceColor));const me={};me.attribute=ce,ce&&ce.data&&(me.data=ce.data),F[j]=me,X++}o.attributes=F,o.attributesNum=X,o.index=q}function b(){const L=o.newAttributes;for(let B=0,O=L.length;B<O;B++)L[B]=0}function g(L){h(L,0)}function h(L,B){const O=o.newAttributes,q=o.enabledAttributes,F=o.attributeDivisors;O[L]=1,q[L]===0&&(n.enableVertexAttribArray(L),q[L]=1),F[L]!==B&&(n.vertexAttribDivisor(L,B),F[L]=B)}function _(){const L=o.newAttributes,B=o.enabledAttributes;for(let O=0,q=B.length;O<q;O++)B[O]!==L[O]&&(n.disableVertexAttribArray(O),B[O]=0)}function S(L,B,O,q,F,V,X){X===!0?n.vertexAttribIPointer(L,B,O,F,V):n.vertexAttribPointer(L,B,O,q,F,V)}function w(L,B,O,q){b();const F=q.attributes,V=O.getAttributes(),X=B.defaultAttributeValues;for(const k in V){const j=V[k];if(j.location>=0){let ee=F[k];if(ee===void 0&&(k==="instanceMatrix"&&L.instanceMatrix&&(ee=L.instanceMatrix),k==="instanceColor"&&L.instanceColor&&(ee=L.instanceColor)),ee!==void 0){const ce=ee.normalized,me=ee.itemSize,nt=e.get(ee);if(nt===void 0)continue;const Pt=nt.buffer,it=nt.type,J=nt.bytesPerElement,re=it===n.INT||it===n.UNSIGNED_INT||ee.gpuType===dm;if(ee.isInterleavedBufferAttribute){const te=ee.data,Ne=te.stride,ze=ee.offset;if(te.isInstancedInterleavedBuffer){for(let Ce=0;Ce<j.locationSize;Ce++)h(j.location+Ce,te.meshPerAttribute);L.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ce=0;Ce<j.locationSize;Ce++)g(j.location+Ce);n.bindBuffer(n.ARRAY_BUFFER,Pt);for(let Ce=0;Ce<j.locationSize;Ce++)S(j.location+Ce,me/j.locationSize,it,ce,Ne*J,(ze+me/j.locationSize*Ce)*J,re)}else{if(ee.isInstancedBufferAttribute){for(let te=0;te<j.locationSize;te++)h(j.location+te,ee.meshPerAttribute);L.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let te=0;te<j.locationSize;te++)g(j.location+te);n.bindBuffer(n.ARRAY_BUFFER,Pt);for(let te=0;te<j.locationSize;te++)S(j.location+te,me/j.locationSize,it,ce,me*J,me/j.locationSize*te*J,re)}}else if(X!==void 0){const ce=X[k];if(ce!==void 0)switch(ce.length){case 2:n.vertexAttrib2fv(j.location,ce);break;case 3:n.vertexAttrib3fv(j.location,ce);break;case 4:n.vertexAttrib4fv(j.location,ce);break;default:n.vertexAttrib1fv(j.location,ce)}}}}_()}function A(){T();for(const L in i){const B=i[L];for(const O in B){const q=B[O];for(const F in q){const V=q[F];for(const X in V)d(V[X].object),delete V[X];delete q[F]}}delete i[L]}}function M(L){if(i[L.id]===void 0)return;const B=i[L.id];for(const O in B){const q=B[O];for(const F in q){const V=q[F];for(const X in V)d(V[X].object),delete V[X];delete q[F]}}delete i[L.id]}function C(L){for(const B in i){const O=i[B];for(const q in O){const F=O[q];if(F[L.id]===void 0)continue;const V=F[L.id];for(const X in V)d(V[X].object),delete V[X];delete F[L.id]}}}function v(L){for(const B in i){const O=i[B],q=L.isInstancedMesh===!0?L.id:0,F=O[q];if(F!==void 0){for(const V in F){const X=F[V];for(const k in X)d(X[k].object),delete X[k];delete F[V]}delete O[q],Object.keys(O).length===0&&delete i[B]}}}function T(){P(),a=!0,o!==r&&(o=r,c(o.object))}function P(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:s,reset:T,resetDefaultState:P,dispose:A,releaseStatesOfGeometry:M,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:b,enableAttribute:g,disableUnusedAttributes:_}}function XT(n,e,t){let i;function r(l){i=l}function o(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,d){d!==0&&(n.drawArraysInstanced(i,l,c,d),t.update(c,i,d))}function s(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,d);let u=0;for(let p=0;p<d;p++)u+=c[p];t.update(u,i,1)}this.setMode=r,this.render=o,this.renderInstances=a,this.renderMultiDraw=s}function qT(n,e,t,i){let r;function o(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(C){return!(C!==Mi&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(C){const v=C===mr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Vn&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Si&&!v)}function l(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const d=l(c);d!==c&&(Ie("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const f=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Ie("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),h=n.getParameter(n.MAX_VERTEX_ATTRIBS),_=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),S=n.getParameter(n.MAX_VARYING_VECTORS),w=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=n.getParameter(n.MAX_SAMPLES),M=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:s,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:m,maxTextureSize:b,maxCubemapSize:g,maxAttributes:h,maxVertexUniforms:_,maxVaryings:S,maxFragmentUniforms:w,maxSamples:A,samples:M}}function $T(n){const e=this;let t=null,i=0,r=!1,o=!1;const a=new mo,s=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const p=f.length!==0||u||i!==0||r;return r=u,i=f.length,p},this.beginShadows=function(){o=!0,d(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(f,u){t=d(f,u,0)},this.setState=function(f,u,p){const m=f.clippingPlanes,b=f.clipIntersection,g=f.clipShadows,h=n.get(f);if(!r||m===null||m.length===0||o&&!g)o?d(null):c();else{const _=o?0:i,S=_*4;let w=h.clippingState||null;l.value=w,w=d(m,u,S,p);for(let A=0;A!==S;++A)w[A]=t[A];h.clippingState=w,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(f,u,p,m){const b=f!==null?f.length:0;let g=null;if(b!==0){if(g=l.value,m!==!0||g===null){const h=p+b*4,_=u.matrixWorldInverse;s.getNormalMatrix(_),(g===null||g.length<h)&&(g=new Float32Array(h));for(let S=0,w=p;S!==b;++S,w+=4)a.copy(f[S]).applyMatrix4(_,s),a.normal.toArray(g,w),g[w+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,g}}const Vr=4,G0=[.125,.215,.35,.446,.526,.582],bo=20,YT=256,Xs=new Cm,V0=new Ae;let pf=null,hf=0,mf=0,gf=!1;const KT=new R;class X0{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,o={}){const{size:a=256,position:s=KT}=o;pf=this._renderer.getRenderTarget(),hf=this._renderer.getActiveCubeFace(),mf=this._renderer.getActiveMipmapLevel(),gf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,s),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Y0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(pf,hf,mf),this._renderer.xr.enabled=gf,e.scissorTest=!1,Ma(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ko||e.mapping===as?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),pf=this._renderer.getRenderTarget(),hf=this._renderer.getActiveCubeFace(),mf=this._renderer.getActiveMipmapLevel(),gf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:sn,minFilter:sn,generateMipmaps:!1,type:mr,format:Mi,colorSpace:hd,depthBuffer:!1},r=q0(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=q0(e,t,i);const{_lodMax:o}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=ZT(o)),this._blurMaterial=jT(o,e,t),this._ggxMaterial=JT(o,e,t)}return r}_compileMaterial(e){const t=new Oe(new un,e);this._renderer.compile(t,Xs)}_sceneToCubeUV(e,t,i,r,o){const l=new Pn(90,1,t,i),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],f=this._renderer,u=f.autoClear,p=f.toneMapping;f.getClearColor(V0),f.toneMapping=Gi,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(r),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Oe(new ft,new Ji({name:"PMREM.Background",side:Nn,depthWrite:!1,depthTest:!1})));const b=this._backgroundBox,g=b.material;let h=!1;const _=e.background;_?_.isColor&&(g.color.copy(_),e.background=null,h=!0):(g.color.copy(V0),h=!0);for(let S=0;S<6;S++){const w=S%3;w===0?(l.up.set(0,c[S],0),l.position.set(o.x,o.y,o.z),l.lookAt(o.x+d[S],o.y,o.z)):w===1?(l.up.set(0,0,c[S]),l.position.set(o.x,o.y,o.z),l.lookAt(o.x,o.y+d[S],o.z)):(l.up.set(0,c[S],0),l.position.set(o.x,o.y,o.z),l.lookAt(o.x,o.y,o.z+d[S]));const A=this._cubeSize;Ma(r,w*A,S>2?A:0,A,A),f.setRenderTarget(r),h&&f.render(b,l),f.render(e,l)}f.toneMapping=p,f.autoClear=u,e.background=_}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===ko||e.mapping===as;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Y0()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$0());const o=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=o;const s=o.uniforms;s.envMap.value=e;const l=this._cubeSize;Ma(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Xs)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodMeshes.length;for(let o=1;o<r;o++)this._applyGGXFilter(e,o-1,o);t.autoClear=i}_applyGGXFilter(e,t,i){const r=this._renderer,o=this._pingPongRenderTarget,a=this._ggxMaterial,s=this._lodMeshes[i];s.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-d*d),u=0+c*1.25,p=f*u,{_lodMax:m}=this,b=this._sizeLods[i],g=3*b*(i>m-Vr?i-m+Vr:0),h=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=m-t,Ma(o,g,h,3*b,2*b),r.setRenderTarget(o),r.render(s,Xs),l.envMap.value=o.texture,l.roughness.value=0,l.mipInt.value=m-i,Ma(e,g,h,3*b,2*b),r.setRenderTarget(e),r.render(s,Xs)}_blur(e,t,i,r,o){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",o),this._halfBlur(a,e,i,i,r,"longitudinal",o)}_halfBlur(e,t,i,r,o,a,s){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Ke("blur direction must be either latitudinal or longitudinal!");const d=3,f=this._lodMeshes[r];f.material=c;const u=c.uniforms,p=this._sizeLods[i]-1,m=isFinite(o)?Math.PI/(2*p):2*Math.PI/(2*bo-1),b=o/m,g=isFinite(o)?1+Math.floor(d*b):bo;g>bo&&Ie(`sigmaRadians, ${o}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${bo}`);const h=[];let _=0;for(let C=0;C<bo;++C){const v=C/b,T=Math.exp(-v*v/2);h.push(T),C===0?_+=T:C<g&&(_+=2*T)}for(let C=0;C<h.length;C++)h[C]=h[C]/_;u.envMap.value=e.texture,u.samples.value=g,u.weights.value=h,u.latitudinal.value=a==="latitudinal",s&&(u.poleAxis.value=s);const{_lodMax:S}=this;u.dTheta.value=m,u.mipInt.value=S-i;const w=this._sizeLods[r],A=3*w*(r>S-Vr?r-S+Vr:0),M=4*(this._cubeSize-w);Ma(t,A,M,3*w,2*w),l.setRenderTarget(t),l.render(f,Xs)}}function ZT(n){const e=[],t=[],i=[];let r=n;const o=n-Vr+1+G0.length;for(let a=0;a<o;a++){const s=Math.pow(2,r);e.push(s);let l=1/s;a>n-Vr?l=G0[a-n+Vr-1]:a===0&&(l=0),t.push(l);const c=1/(s-2),d=-c,f=1+c,u=[d,d,f,d,f,f,d,d,f,f,d,f],p=6,m=6,b=3,g=2,h=1,_=new Float32Array(b*m*p),S=new Float32Array(g*m*p),w=new Float32Array(h*m*p);for(let M=0;M<p;M++){const C=M%3*2/3-1,v=M>2?0:-1,T=[C,v,0,C+2/3,v,0,C+2/3,v+1,0,C,v,0,C+2/3,v+1,0,C,v+1,0];_.set(T,b*m*M),S.set(u,g*m*M);const P=[M,M,M,M,M,M];w.set(P,h*m*M)}const A=new un;A.setAttribute("position",new gn(_,b)),A.setAttribute("uv",new gn(S,g)),A.setAttribute("faceIndex",new gn(w,h)),i.push(new Oe(A,null)),r>Vr&&r--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function q0(n,e,t){const i=new Vi(n,e,t);return i.texture.mapping=ru,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ma(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function JT(n,e,t){return new Ci({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:YT,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:au(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:fr,depthTest:!1,depthWrite:!1})}function jT(n,e,t){const i=new Float32Array(bo),r=new R(0,1,0);return new Ci({name:"SphericalGaussianBlur",defines:{n:bo,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:au(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:fr,depthTest:!1,depthWrite:!1})}function $0(){return new Ci({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:au(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fr,depthTest:!1,depthWrite:!1})}function Y0(){return new Ci({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:au(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fr,depthTest:!1,depthWrite:!1})}function au(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Ay extends Vi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new by(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ft(5,5,5),o=new Ci({name:"CubemapFromEquirect",uniforms:cs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Nn,blending:fr});o.uniforms.tEquirect.value=t;const a=new Oe(r,o),s=t.minFilter;return t.minFilter===So&&(t.minFilter=sn),new rM(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const o=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(o)}}function QT(n){let e=new WeakMap,t=new WeakMap,i=null;function r(u,p=!1){return u==null?null:p?a(u):o(u)}function o(u){if(u&&u.isTexture){const p=u.mapping;if(p===ku||p===Bu)if(e.has(u)){const m=e.get(u).texture;return s(m,u.mapping)}else{const m=u.image;if(m&&m.height>0){const b=new Ay(m.height);return b.fromEquirectangularTexture(n,u),e.set(u,b),u.addEventListener("dispose",c),s(b.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){const p=u.mapping,m=p===ku||p===Bu,b=p===ko||p===as;if(m||b){let g=t.get(u);const h=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==h)return i===null&&(i=new X0(n)),g=m?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{const _=u.image;return m&&_&&_.height>0||b&&_&&l(_)?(i===null&&(i=new X0(n)),g=m?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",d),g.texture):null}}}return u}function s(u,p){return p===ku?u.mapping=ko:p===Bu&&(u.mapping=as),u}function l(u){let p=0;const m=6;for(let b=0;b<m;b++)u[b]!==void 0&&p++;return p===m}function c(u){const p=u.target;p.removeEventListener("dispose",c);const m=e.get(p);m!==void 0&&(e.delete(p),m.dispose())}function d(u){const p=u.target;p.removeEventListener("dispose",d);const m=t.get(p);m!==void 0&&(t.delete(p),m.dispose())}function f(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:f}}function eA(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&Va("WebGLRenderer: "+i+" extension not supported."),r}}}function tA(n,e,t,i){const r={},o=new WeakMap;function a(f){const u=f.target;u.index!==null&&e.remove(u.index);for(const m in u.attributes)e.remove(u.attributes[m]);u.removeEventListener("dispose",a),delete r[u.id];const p=o.get(u);p&&(e.remove(p),o.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function s(f,u){return r[u.id]===!0||(u.addEventListener("dispose",a),r[u.id]=!0,t.memory.geometries++),u}function l(f){const u=f.attributes;for(const p in u)e.update(u[p],n.ARRAY_BUFFER)}function c(f){const u=[],p=f.index,m=f.attributes.position;let b=0;if(m===void 0)return;if(p!==null){const _=p.array;b=p.version;for(let S=0,w=_.length;S<w;S+=3){const A=_[S+0],M=_[S+1],C=_[S+2];u.push(A,M,M,C,C,A)}}else{const _=m.array;b=m.version;for(let S=0,w=_.length/3-1;S<w;S+=3){const A=S+0,M=S+1,C=S+2;u.push(A,M,M,C,C,A)}}const g=new(m.count>=65535?fy:uy)(u,1);g.version=b;const h=o.get(f);h&&e.remove(h),o.set(f,g)}function d(f){const u=o.get(f);if(u){const p=f.index;p!==null&&u.version<p.version&&c(f)}else c(f);return o.get(f)}return{get:s,update:l,getWireframeAttribute:d}}function nA(n,e,t){let i;function r(f){i=f}let o,a;function s(f){o=f.type,a=f.bytesPerElement}function l(f,u){n.drawElements(i,u,o,f*a),t.update(u,i,1)}function c(f,u,p){p!==0&&(n.drawElementsInstanced(i,u,o,f*a,p),t.update(u,i,p))}function d(f,u,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,o,f,0,p);let b=0;for(let g=0;g<p;g++)b+=u[g];t.update(b,i,1)}this.setMode=r,this.setIndex=s,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function iA(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,a,s){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=s*(o/3);break;case n.LINES:t.lines+=s*(o/2);break;case n.LINE_STRIP:t.lines+=s*(o-1);break;case n.LINE_LOOP:t.lines+=s*o;break;case n.POINTS:t.points+=s*o;break;default:Ke("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function rA(n,e,t){const i=new WeakMap,r=new Rt;function o(a,s,l){const c=a.morphTargetInfluences,d=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,f=d!==void 0?d.length:0;let u=i.get(s);if(u===void 0||u.count!==f){let T=function(){C.dispose(),i.delete(s),s.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();const p=s.morphAttributes.position!==void 0,m=s.morphAttributes.normal!==void 0,b=s.morphAttributes.color!==void 0,g=s.morphAttributes.position||[],h=s.morphAttributes.normal||[],_=s.morphAttributes.color||[];let S=0;p===!0&&(S=1),m===!0&&(S=2),b===!0&&(S=3);let w=s.attributes.position.count*S,A=1;w>e.maxTextureSize&&(A=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const M=new Float32Array(w*A*4*f),C=new cy(M,w,A,f);C.type=Si,C.needsUpdate=!0;const v=S*4;for(let P=0;P<f;P++){const L=g[P],B=h[P],O=_[P],q=w*A*4*P;for(let F=0;F<L.count;F++){const V=F*v;p===!0&&(r.fromBufferAttribute(L,F),M[q+V+0]=r.x,M[q+V+1]=r.y,M[q+V+2]=r.z,M[q+V+3]=0),m===!0&&(r.fromBufferAttribute(B,F),M[q+V+4]=r.x,M[q+V+5]=r.y,M[q+V+6]=r.z,M[q+V+7]=0),b===!0&&(r.fromBufferAttribute(O,F),M[q+V+8]=r.x,M[q+V+9]=r.y,M[q+V+10]=r.z,M[q+V+11]=O.itemSize===4?r.w:1)}}u={count:f,texture:C,size:new De(w,A)},i.set(s,u),s.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let p=0;for(let b=0;b<c.length;b++)p+=c[b];const m=s.morphTargetsRelative?1:1-p;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:o}}function oA(n,e,t,i,r){let o=new WeakMap;function a(c){const d=r.render.frame,f=c.geometry,u=e.get(c,f);if(o.get(u)!==d&&(e.update(u),o.set(u,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),o.get(c)!==d&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),o.set(c,d))),c.isSkinnedMesh){const p=c.skeleton;o.get(p)!==d&&(p.update(),o.set(p,d))}return u}function s(){o=new WeakMap}function l(c){const d=c.target;d.removeEventListener("dispose",l),i.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:s}}const aA={[Kv]:"LINEAR_TONE_MAPPING",[Zv]:"REINHARD_TONE_MAPPING",[Jv]:"CINEON_TONE_MAPPING",[iu]:"ACES_FILMIC_TONE_MAPPING",[Qv]:"AGX_TONE_MAPPING",[ey]:"NEUTRAL_TONE_MAPPING",[jv]:"CUSTOM_TONE_MAPPING"};function sA(n,e,t,i,r,o){const a=new Vi(e,t,{type:n,depthBuffer:r,stencilBuffer:o,samples:i?4:0,depthTexture:r?new ls(e,t):void 0}),s=new Vi(e,t,{type:mr,depthBuffer:!1,stencilBuffer:!1}),l=new un;l.setAttribute("position",new Mt([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Mt([0,2,0,0,2,0],2));const c=new Z1({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Oe(l,c),f=new Cm(-1,1,1,-1,0,1);let u=null,p=null,m=!1,b,g=null,h=[],_=!1;this.setSize=function(S,w){a.setSize(S,w),s.setSize(S,w);for(let A=0;A<h.length;A++){const M=h[A];M.setSize&&M.setSize(S,w)}},this.setEffects=function(S){h=S,_=h.length>0&&h[0].isRenderPass===!0;const w=a.width,A=a.height;for(let M=0;M<h.length;M++){const C=h[M];C.setSize&&C.setSize(w,A)}},this.begin=function(S,w){if(m||S.toneMapping===Gi&&h.length===0)return!1;if(g=w,w!==null){const A=w.width,M=w.height;(a.width!==A||a.height!==M)&&this.setSize(A,M)}return _===!1&&S.setRenderTarget(a),b=S.toneMapping,S.toneMapping=Gi,!0},this.hasRenderPass=function(){return _},this.end=function(S,w){S.toneMapping=b,m=!0;let A=a,M=s;for(let C=0;C<h.length;C++){const v=h[C];if(v.enabled!==!1&&(v.render(S,M,A,w),v.needsSwap!==!1)){const T=A;A=M,M=T}}if(u!==S.outputColorSpace||p!==S.toneMapping){u=S.outputColorSpace,p=S.toneMapping,c.defines={},Ze.getTransfer(u)===dt&&(c.defines.SRGB_TRANSFER="");const C=aA[p];C&&(c.defines[C]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=A.texture,S.setRenderTarget(g),S.render(d,f),g=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),s.dispose(),l.dispose(),c.dispose()}}const Cy=new cn,fh=new ls(1,1),Ry=new cy,Ly=new E1,Iy=new by,K0=[],Z0=[],J0=new Float32Array(16),j0=new Float32Array(9),Q0=new Float32Array(4);function Cs(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let o=K0[r];if(o===void 0&&(o=new Float32Array(r),K0[r]=o),e!==0){i.toArray(o,0);for(let a=1,s=0;a!==e;++a)s+=t,n[a].toArray(o,s)}return o}function en(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function tn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function su(n,e){let t=Z0[e];t===void 0&&(t=new Int32Array(e),Z0[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function lA(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function cA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2fv(this.addr,e),tn(t,e)}}function dA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(en(t,e))return;n.uniform3fv(this.addr,e),tn(t,e)}}function uA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4fv(this.addr,e),tn(t,e)}}function fA(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;Q0.set(i),n.uniformMatrix2fv(this.addr,!1,Q0),tn(t,i)}}function pA(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;j0.set(i),n.uniformMatrix3fv(this.addr,!1,j0),tn(t,i)}}function hA(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;J0.set(i),n.uniformMatrix4fv(this.addr,!1,J0),tn(t,i)}}function mA(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function gA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2iv(this.addr,e),tn(t,e)}}function xA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;n.uniform3iv(this.addr,e),tn(t,e)}}function bA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4iv(this.addr,e),tn(t,e)}}function vA(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function yA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2uiv(this.addr,e),tn(t,e)}}function wA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;n.uniform3uiv(this.addr,e),tn(t,e)}}function _A(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4uiv(this.addr,e),tn(t,e)}}function SA(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let o;this.type===n.SAMPLER_2D_SHADOW?(fh.compareFunction=t.isReversedDepthBuffer()?bm:xm,o=fh):o=Cy,t.setTexture2D(e||o,r)}function MA(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Ly,r)}function EA(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Iy,r)}function TA(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Ry,r)}function AA(n){switch(n){case 5126:return lA;case 35664:return cA;case 35665:return dA;case 35666:return uA;case 35674:return fA;case 35675:return pA;case 35676:return hA;case 5124:case 35670:return mA;case 35667:case 35671:return gA;case 35668:case 35672:return xA;case 35669:case 35673:return bA;case 5125:return vA;case 36294:return yA;case 36295:return wA;case 36296:return _A;case 35678:case 36198:case 36298:case 36306:case 35682:return SA;case 35679:case 36299:case 36307:return MA;case 35680:case 36300:case 36308:case 36293:return EA;case 36289:case 36303:case 36311:case 36292:return TA}}function CA(n,e){n.uniform1fv(this.addr,e)}function RA(n,e){const t=Cs(e,this.size,2);n.uniform2fv(this.addr,t)}function LA(n,e){const t=Cs(e,this.size,3);n.uniform3fv(this.addr,t)}function IA(n,e){const t=Cs(e,this.size,4);n.uniform4fv(this.addr,t)}function PA(n,e){const t=Cs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function DA(n,e){const t=Cs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function NA(n,e){const t=Cs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function FA(n,e){n.uniform1iv(this.addr,e)}function UA(n,e){n.uniform2iv(this.addr,e)}function kA(n,e){n.uniform3iv(this.addr,e)}function BA(n,e){n.uniform4iv(this.addr,e)}function OA(n,e){n.uniform1uiv(this.addr,e)}function zA(n,e){n.uniform2uiv(this.addr,e)}function HA(n,e){n.uniform3uiv(this.addr,e)}function WA(n,e){n.uniform4uiv(this.addr,e)}function GA(n,e,t){const i=this.cache,r=e.length,o=su(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));let a;this.type===n.SAMPLER_2D_SHADOW?a=fh:a=Cy;for(let s=0;s!==r;++s)t.setTexture2D(e[s]||a,o[s])}function VA(n,e,t){const i=this.cache,r=e.length,o=su(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||Ly,o[a])}function XA(n,e,t){const i=this.cache,r=e.length,o=su(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||Iy,o[a])}function qA(n,e,t){const i=this.cache,r=e.length,o=su(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||Ry,o[a])}function $A(n){switch(n){case 5126:return CA;case 35664:return RA;case 35665:return LA;case 35666:return IA;case 35674:return PA;case 35675:return DA;case 35676:return NA;case 5124:case 35670:return FA;case 35667:case 35671:return UA;case 35668:case 35672:return kA;case 35669:case 35673:return BA;case 5125:return OA;case 36294:return zA;case 36295:return HA;case 36296:return WA;case 35678:case 36198:case 36298:case 36306:case 35682:return GA;case 35679:case 36299:case 36307:return VA;case 35680:case 36300:case 36308:case 36293:return XA;case 36289:case 36303:case 36311:case 36292:return qA}}class YA{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=AA(t.type)}}class KA{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$A(t.type)}}class ZA{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let o=0,a=r.length;o!==a;++o){const s=r[o];s.setValue(e,t[s.id],i)}}}const xf=/(\w+)(\])?(\[|\.)?/g;function ex(n,e){n.seq.push(e),n.map[e.id]=e}function JA(n,e,t){const i=n.name,r=i.length;for(xf.lastIndex=0;;){const o=xf.exec(i),a=xf.lastIndex;let s=o[1];const l=o[2]==="]",c=o[3];if(l&&(s=s|0),c===void 0||c==="["&&a+2===r){ex(t,c===void 0?new YA(s,n,e):new KA(s,n,e));break}else{let f=t.map[s];f===void 0&&(f=new ZA(s),ex(t,f)),t=f}}}class rd{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const s=e.getActiveUniform(t,a),l=e.getUniformLocation(t,s.name);JA(s,l,this)}const r=[],o=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):o.push(a);r.length>0&&(this.seq=r.concat(o))}setValue(e,t,i,r){const o=this.map[t];o!==void 0&&o.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let o=0,a=t.length;o!==a;++o){const s=t[o],l=i[s.id];l.needsUpdate!==!1&&s.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,o=e.length;r!==o;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function tx(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const jA=37297;let QA=0;function e2(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let a=r;a<o;a++){const s=a+1;i.push(`${s===e?">":" "} ${s}: ${t[a]}`)}return i.join(`
`)}const nx=new ke;function t2(n){Ze._getMatrix(nx,Ze.workingColorSpace,n);const e=`mat3( ${nx.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(n)){case md:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return Ie("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function ix(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),o=(n.getShaderInfoLog(e)||"").trim();if(i&&o==="")return"";const a=/ERROR: 0:(\d+)/.exec(o);if(a){const s=parseInt(a[1]);return t.toUpperCase()+`

`+o+`

`+e2(n.getShaderSource(e),s)}else return o}function n2(n,e){const t=t2(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const i2={[Kv]:"Linear",[Zv]:"Reinhard",[Jv]:"Cineon",[iu]:"ACESFilmic",[Qv]:"AgX",[ey]:"Neutral",[jv]:"Custom"};function r2(n,e){const t=i2[e];return t===void 0?(Ie("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ic=new R;function o2(){Ze.getLuminanceCoefficients(Ic);const n=Ic.x.toFixed(4),e=Ic.y.toFixed(4),t=Ic.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function a2(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(el).join(`
`)}function s2(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function l2(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const o=n.getActiveAttrib(e,r),a=o.name;let s=1;o.type===n.FLOAT_MAT2&&(s=2),o.type===n.FLOAT_MAT3&&(s=3),o.type===n.FLOAT_MAT4&&(s=4),t[a]={type:o.type,location:n.getAttribLocation(e,a),locationSize:s}}return t}function el(n){return n!==""}function rx(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ox(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const c2=/^[ \t]*#include +<([\w\d./]+)>/gm;function ph(n){return n.replace(c2,u2)}const d2=new Map;function u2(n,e){let t=Ge[e];if(t===void 0){const i=d2.get(e);if(i!==void 0)t=Ge[i],Ie('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ph(t)}const f2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ax(n){return n.replace(f2,p2)}function p2(n,e,t,i){let r="";for(let o=parseInt(e);o<parseInt(t);o++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return r}function sx(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const h2={[Wa]:"SHADOWMAP_TYPE_PCF",[Qs]:"SHADOWMAP_TYPE_VSM"};function m2(n){return h2[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const g2={[ko]:"ENVMAP_TYPE_CUBE",[as]:"ENVMAP_TYPE_CUBE",[ru]:"ENVMAP_TYPE_CUBE_UV"};function x2(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":g2[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const b2={[as]:"ENVMAP_MODE_REFRACTION"};function v2(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":b2[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const y2={[nu]:"ENVMAP_BLENDING_MULTIPLY",[WS]:"ENVMAP_BLENDING_MIX",[GS]:"ENVMAP_BLENDING_ADD"};function w2(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":y2[n.combine]||"ENVMAP_BLENDING_NONE"}function _2(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function S2(n,e,t,i){const r=n.getContext(),o=t.defines;let a=t.vertexShader,s=t.fragmentShader;const l=m2(t),c=x2(t),d=v2(t),f=w2(t),u=_2(t),p=a2(t),m=s2(o),b=r.createProgram();let g,h,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(el).join(`
`),g.length>0&&(g+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(el).join(`
`),h.length>0&&(h+=`
`)):(g=[sx(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(el).join(`
`),h=[sx(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Gi?"#define TONE_MAPPING":"",t.toneMapping!==Gi?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Gi?r2("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,n2("linearToOutputTexel",t.outputColorSpace),o2(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(el).join(`
`)),a=ph(a),a=rx(a,t),a=ox(a,t),s=ph(s),s=rx(s,t),s=ox(s,t),a=ax(a),s=ax(s),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,h=["#define varying in",t.glslVersion===s0?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===s0?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);const S=_+g+a,w=_+h+s,A=tx(r,r.VERTEX_SHADER,S),M=tx(r,r.FRAGMENT_SHADER,w);r.attachShader(b,A),r.attachShader(b,M),t.index0AttributeName!==void 0?r.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(b,0,"position"),r.linkProgram(b);function C(L){if(n.debug.checkShaderErrors){const B=r.getProgramInfoLog(b)||"",O=r.getShaderInfoLog(A)||"",q=r.getShaderInfoLog(M)||"",F=B.trim(),V=O.trim(),X=q.trim();let k=!0,j=!0;if(r.getProgramParameter(b,r.LINK_STATUS)===!1)if(k=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,b,A,M);else{const ee=ix(r,A,"vertex"),ce=ix(r,M,"fragment");Ke("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(b,r.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+F+`
`+ee+`
`+ce)}else F!==""?Ie("WebGLProgram: Program Info Log:",F):(V===""||X==="")&&(j=!1);j&&(L.diagnostics={runnable:k,programLog:F,vertexShader:{log:V,prefix:g},fragmentShader:{log:X,prefix:h}})}r.deleteShader(A),r.deleteShader(M),v=new rd(r,b),T=l2(r,b)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=r.getProgramParameter(b,jA)),P},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=QA++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=A,this.fragmentShader=M,this}let M2=0;class E2{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(i)===!1&&(r.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new T2(e),t.set(e,i)),i}}class T2{constructor(e){this.id=M2++,this.code=e,this.usedTimes=0}}function A2(n){return n===Bo||n===ud||n===fd}function C2(n,e,t,i,r,o){const a=new wm,s=new E2,l=new Set,c=[],d=new Map,f=i.logarithmicDepthBuffer;let u=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function b(v,T,P,L,B,O){const q=L.fog,F=B.geometry,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,k=e.get(v.envMap||V,X),j=k&&k.mapping===ru?k.image.height:null,ee=p[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&Ie("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));const ce=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,me=ce!==void 0?ce.length:0;let nt=0;F.morphAttributes.position!==void 0&&(nt=1),F.morphAttributes.normal!==void 0&&(nt=2),F.morphAttributes.color!==void 0&&(nt=3);let Pt,it,J,re;if(ee){const ve=Bi[ee];Pt=ve.vertexShader,it=ve.fragmentShader}else{Pt=v.vertexShader,it=v.fragmentShader;const ve=s.getVertexShaderStage(v),Nt=s.getFragmentShaderStage(v);s.update(v,ve,Nt),J=ve.id,re=Nt.id}const te=n.getRenderTarget(),Ne=n.state.buffers.depth.getReversed(),ze=B.isInstancedMesh===!0,Ce=B.isBatchedMesh===!0,Ot=!!v.map,$e=!!v.matcap,ht=!!k,rt=!!v.aoMap,Je=!!v.lightMap,Vt=!!v.bumpMap&&v.wireframe===!1,Kt=!!v.normalMap,nn=!!v.displacementMap,fn=!!v.emissiveMap,Dt=!!v.metalnessMap,Xt=!!v.roughnessMap,D=v.anisotropy>0,Un=v.clearcoat>0,ct=v.dispersion>0,E=v.iridescence>0,x=v.sheen>0,U=v.transmission>0,W=D&&!!v.anisotropyMap,$=Un&&!!v.clearcoatMap,ne=Un&&!!v.clearcoatNormalMap,oe=Un&&!!v.clearcoatRoughnessMap,Y=E&&!!v.iridescenceMap,Z=E&&!!v.iridescenceThicknessMap,ae=x&&!!v.sheenColorMap,Se=x&&!!v.sheenRoughnessMap,de=!!v.specularMap,se=!!v.specularColorMap,Te=!!v.specularIntensityMap,Re=U&&!!v.transmissionMap,He=U&&!!v.thicknessMap,I=!!v.gradientMap,ie=!!v.alphaMap,K=v.alphaTest>0,le=!!v.alphaHash,he=!!v.extensions;let Q=Gi;v.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Q=n.toneMapping);const _e={shaderID:ee,shaderType:v.type,shaderName:v.name,vertexShader:Pt,fragmentShader:it,defines:v.defines,customVertexShaderID:J,customFragmentShaderID:re,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:Ce,batchingColor:Ce&&B._colorsTexture!==null,instancing:ze,instancingColor:ze&&B.instanceColor!==null,instancingMorph:ze&&B.morphTexture!==null,outputColorSpace:te===null?n.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Ze.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Ot,matcap:$e,envMap:ht,envMapMode:ht&&k.mapping,envMapCubeUVHeight:j,aoMap:rt,lightMap:Je,bumpMap:Vt,normalMap:Kt,displacementMap:nn,emissiveMap:fn,normalMapObjectSpace:Kt&&v.normalMapType===qS,normalMapTangentSpace:Kt&&v.normalMapType===pd,packedNormalMap:Kt&&v.normalMapType===pd&&A2(v.normalMap.format),metalnessMap:Dt,roughnessMap:Xt,anisotropy:D,anisotropyMap:W,clearcoat:Un,clearcoatMap:$,clearcoatNormalMap:ne,clearcoatRoughnessMap:oe,dispersion:ct,iridescence:E,iridescenceMap:Y,iridescenceThicknessMap:Z,sheen:x,sheenColorMap:ae,sheenRoughnessMap:Se,specularMap:de,specularColorMap:se,specularIntensityMap:Te,transmission:U,transmissionMap:Re,thicknessMap:He,gradientMap:I,opaque:v.transparent===!1&&v.blending===Ga&&v.alphaToCoverage===!1,alphaMap:ie,alphaTest:K,alphaHash:le,combine:v.combine,mapUv:Ot&&m(v.map.channel),aoMapUv:rt&&m(v.aoMap.channel),lightMapUv:Je&&m(v.lightMap.channel),bumpMapUv:Vt&&m(v.bumpMap.channel),normalMapUv:Kt&&m(v.normalMap.channel),displacementMapUv:nn&&m(v.displacementMap.channel),emissiveMapUv:fn&&m(v.emissiveMap.channel),metalnessMapUv:Dt&&m(v.metalnessMap.channel),roughnessMapUv:Xt&&m(v.roughnessMap.channel),anisotropyMapUv:W&&m(v.anisotropyMap.channel),clearcoatMapUv:$&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:ne&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Y&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:Z&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:Se&&m(v.sheenRoughnessMap.channel),specularMapUv:de&&m(v.specularMap.channel),specularColorMapUv:se&&m(v.specularColorMap.channel),specularIntensityMapUv:Te&&m(v.specularIntensityMap.channel),transmissionMapUv:Re&&m(v.transmissionMap.channel),thicknessMapUv:He&&m(v.thicknessMap.channel),alphaMapUv:ie&&m(v.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(Kt||D),vertexNormals:!!F.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!F.attributes.uv&&(Ot||ie),fog:!!q,useFog:v.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||F.attributes.normal===void 0&&Kt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Ne,skinning:B.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:me,morphTextureStride:nt,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Q,decodeVideoTexture:Ot&&v.map.isVideoTexture===!0&&Ze.getTransfer(v.map.colorSpace)===dt,decodeVideoTextureEmissive:fn&&v.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(v.emissiveMap.colorSpace)===dt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===jt,flipSided:v.side===Nn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:he&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(he&&v.extensions.multiDraw===!0||Ce)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return _e.vertexUv1s=l.has(1),_e.vertexUv2s=l.has(2),_e.vertexUv3s=l.has(3),l.clear(),_e}function g(v){const T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(const P in v.defines)T.push(P),T.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(h(T,v),_(T,v),T.push(n.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function h(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function _(v,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function S(v){const T=p[v.type];let P;if(T){const L=Bi[T];P=$1.clone(L.uniforms)}else P=v.uniforms;return P}function w(v,T){let P=d.get(T);return P!==void 0?++P.usedTimes:(P=new S2(n,T,v,r),c.push(P),d.set(T,P)),P}function A(v){if(--v.usedTimes===0){const T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),d.delete(v.cacheKey),v.destroy()}}function M(v){s.remove(v)}function C(){s.dispose()}return{getParameters:b,getProgramCacheKey:g,getUniforms:S,acquireProgram:w,releaseProgram:A,releaseShaderCache:M,programs:c,dispose:C}}function R2(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let s=n.get(a);return s===void 0&&(s={},n.set(a,s)),s}function i(a){n.delete(a)}function r(a,s,l){n.get(a)[s]=l}function o(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:o}}function L2(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function lx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function cx(){const n=[];let e=0;const t=[],i=[],r=[];function o(){e=0,t.length=0,i.length=0,r.length=0}function a(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function s(u,p,m,b,g,h){let _=n[e];return _===void 0?(_={id:u.id,object:u,geometry:p,material:m,materialVariant:a(u),groupOrder:b,renderOrder:u.renderOrder,z:g,group:h},n[e]=_):(_.id=u.id,_.object=u,_.geometry=p,_.material=m,_.materialVariant=a(u),_.groupOrder=b,_.renderOrder=u.renderOrder,_.z=g,_.group=h),e++,_}function l(u,p,m,b,g,h){const _=s(u,p,m,b,g,h);m.transmission>0?i.push(_):m.transparent===!0?r.push(_):t.push(_)}function c(u,p,m,b,g,h){const _=s(u,p,m,b,g,h);m.transmission>0?i.unshift(_):m.transparent===!0?r.unshift(_):t.unshift(_)}function d(u,p,m){t.length>1&&t.sort(u||L2),i.length>1&&i.sort(p||lx),r.length>1&&r.sort(p||lx),m&&(t.reverse(),i.reverse(),r.reverse())}function f(){for(let u=e,p=n.length;u<p;u++){const m=n[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:r,init:o,push:l,unshift:c,finish:f,sort:d}}function I2(){let n=new WeakMap;function e(i,r){const o=n.get(i);let a;return o===void 0?(a=new cx,n.set(i,[a])):r>=o.length?(a=new cx,o.push(a)):a=o[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function P2(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new Ae};break;case"SpotLight":t={position:new R,direction:new R,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new R,halfWidth:new R,halfHeight:new R};break}return n[e.id]=t,t}}}function D2(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let N2=0;function F2(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function U2(n){const e=new P2,t=D2(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new R);const r=new R,o=new at,a=new at;function s(c){let d=0,f=0,u=0;for(let T=0;T<9;T++)i.probe[T].set(0,0,0);let p=0,m=0,b=0,g=0,h=0,_=0,S=0,w=0,A=0,M=0,C=0;c.sort(F2);for(let T=0,P=c.length;T<P;T++){const L=c[T],B=L.color,O=L.intensity,q=L.distance;let F=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Bo?F=L.shadow.map.texture:F=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)d+=B.r*O,f+=B.g*O,u+=B.b*O;else if(L.isLightProbe){for(let V=0;V<9;V++)i.probe[V].addScaledVector(L.sh.coefficients[V],O);C++}else if(L.isDirectionalLight){const V=e.get(L);if(V.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const X=L.shadow,k=t.get(L);k.shadowIntensity=X.intensity,k.shadowBias=X.bias,k.shadowNormalBias=X.normalBias,k.shadowRadius=X.radius,k.shadowMapSize=X.mapSize,i.directionalShadow[p]=k,i.directionalShadowMap[p]=F,i.directionalShadowMatrix[p]=L.shadow.matrix,_++}i.directional[p]=V,p++}else if(L.isSpotLight){const V=e.get(L);V.position.setFromMatrixPosition(L.matrixWorld),V.color.copy(B).multiplyScalar(O),V.distance=q,V.coneCos=Math.cos(L.angle),V.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),V.decay=L.decay,i.spot[b]=V;const X=L.shadow;if(L.map&&(i.spotLightMap[A]=L.map,A++,X.updateMatrices(L),L.castShadow&&M++),i.spotLightMatrix[b]=X.matrix,L.castShadow){const k=t.get(L);k.shadowIntensity=X.intensity,k.shadowBias=X.bias,k.shadowNormalBias=X.normalBias,k.shadowRadius=X.radius,k.shadowMapSize=X.mapSize,i.spotShadow[b]=k,i.spotShadowMap[b]=F,w++}b++}else if(L.isRectAreaLight){const V=e.get(L);V.color.copy(B).multiplyScalar(O),V.halfWidth.set(L.width*.5,0,0),V.halfHeight.set(0,L.height*.5,0),i.rectArea[g]=V,g++}else if(L.isPointLight){const V=e.get(L);if(V.color.copy(L.color).multiplyScalar(L.intensity),V.distance=L.distance,V.decay=L.decay,L.castShadow){const X=L.shadow,k=t.get(L);k.shadowIntensity=X.intensity,k.shadowBias=X.bias,k.shadowNormalBias=X.normalBias,k.shadowRadius=X.radius,k.shadowMapSize=X.mapSize,k.shadowCameraNear=X.camera.near,k.shadowCameraFar=X.camera.far,i.pointShadow[m]=k,i.pointShadowMap[m]=F,i.pointShadowMatrix[m]=L.shadow.matrix,S++}i.point[m]=V,m++}else if(L.isHemisphereLight){const V=e.get(L);V.skyColor.copy(L.color).multiplyScalar(O),V.groundColor.copy(L.groundColor).multiplyScalar(O),i.hemi[h]=V,h++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ue.LTC_FLOAT_1,i.rectAreaLTC2=ue.LTC_FLOAT_2):(i.rectAreaLTC1=ue.LTC_HALF_1,i.rectAreaLTC2=ue.LTC_HALF_2)),i.ambient[0]=d,i.ambient[1]=f,i.ambient[2]=u;const v=i.hash;(v.directionalLength!==p||v.pointLength!==m||v.spotLength!==b||v.rectAreaLength!==g||v.hemiLength!==h||v.numDirectionalShadows!==_||v.numPointShadows!==S||v.numSpotShadows!==w||v.numSpotMaps!==A||v.numLightProbes!==C)&&(i.directional.length=p,i.spot.length=b,i.rectArea.length=g,i.point.length=m,i.hemi.length=h,i.directionalShadow.length=_,i.directionalShadowMap.length=_,i.pointShadow.length=S,i.pointShadowMap.length=S,i.spotShadow.length=w,i.spotShadowMap.length=w,i.directionalShadowMatrix.length=_,i.pointShadowMatrix.length=S,i.spotLightMatrix.length=w+A-M,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=M,i.numLightProbes=C,v.directionalLength=p,v.pointLength=m,v.spotLength=b,v.rectAreaLength=g,v.hemiLength=h,v.numDirectionalShadows=_,v.numPointShadows=S,v.numSpotShadows=w,v.numSpotMaps=A,v.numLightProbes=C,i.version=N2++)}function l(c,d){let f=0,u=0,p=0,m=0,b=0;const g=d.matrixWorldInverse;for(let h=0,_=c.length;h<_;h++){const S=c[h];if(S.isDirectionalLight){const w=i.directional[f];w.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(g),f++}else if(S.isSpotLight){const w=i.spot[p];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),w.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(g),p++}else if(S.isRectAreaLight){const w=i.rectArea[m];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),a.identity(),o.copy(S.matrixWorld),o.premultiply(g),a.extractRotation(o),w.halfWidth.set(S.width*.5,0,0),w.halfHeight.set(0,S.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),m++}else if(S.isPointLight){const w=i.point[u];w.position.setFromMatrixPosition(S.matrixWorld),w.position.applyMatrix4(g),u++}else if(S.isHemisphereLight){const w=i.hemi[b];w.direction.setFromMatrixPosition(S.matrixWorld),w.direction.transformDirection(g),b++}}}return{setup:s,setupView:l,state:i}}function dx(n){const e=new U2(n),t=[],i=[],r=[];function o(u){f.camera=u,t.length=0,i.length=0,r.length=0}function a(u){t.push(u)}function s(u){i.push(u)}function l(u){r.push(u)}function c(){e.setup(t)}function d(u){e.setupView(t,u)}const f={lightsArray:t,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:o,state:f,setupLights:c,setupLightsView:d,pushLight:a,pushShadow:s,pushLightProbeGrid:l}}function k2(n){let e=new WeakMap;function t(r,o=0){const a=e.get(r);let s;return a===void 0?(s=new dx(n),e.set(r,[s])):o>=a.length?(s=new dx(n),a.push(s)):s=a[o],s}function i(){e=new WeakMap}return{get:t,dispose:i}}const B2=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,O2=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,z2=[new R(1,0,0),new R(-1,0,0),new R(0,1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1)],H2=[new R(0,-1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1),new R(0,-1,0),new R(0,-1,0)],ux=new at,qs=new R,bf=new R;function W2(n,e,t){let i=new Mm;const r=new De,o=new De,a=new Rt,s=new J1,l=new j1,c={},d=t.maxTextureSize,f={[eo]:Nn,[Nn]:eo,[jt]:jt},u=new Ci({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new De},radius:{value:4}},vertexShader:B2,fragmentShader:O2}),p=u.clone();p.defines.HORIZONTAL_PASS=1;const m=new un;m.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const b=new Oe(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wa;let h=this.type;this.render=function(M,C,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||M.length===0)return;this.type===SS&&(Ie("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Wa);const T=n.getRenderTarget(),P=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),B=n.state;B.setBlending(fr),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const O=h!==this.type;O&&C.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(F=>F.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,F=M.length;q<F;q++){const V=M[q],X=V.shadow;if(X===void 0){Ie("WebGLShadowMap:",V,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;r.copy(X.mapSize);const k=X.getFrameExtents();r.multiply(k),o.copy(X.mapSize),(r.x>d||r.y>d)&&(r.x>d&&(o.x=Math.floor(d/k.x),r.x=o.x*k.x,X.mapSize.x=o.x),r.y>d&&(o.y=Math.floor(d/k.y),r.y=o.y*k.y,X.mapSize.y=o.y));const j=n.state.buffers.depth.getReversed();if(X.camera._reversedDepth=j,X.map===null||O===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Qs){if(V.isPointLight){Ie("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Vi(r.x,r.y,{format:Bo,type:mr,minFilter:sn,magFilter:sn,generateMipmaps:!1}),X.map.texture.name=V.name+".shadowMap",X.map.depthTexture=new ls(r.x,r.y,Si),X.map.depthTexture.name=V.name+".shadowMapDepth",X.map.depthTexture.format=gr,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Fe,X.map.depthTexture.magFilter=Fe}else V.isPointLight?(X.map=new Ay(r.x),X.map.depthTexture=new X1(r.x,qi)):(X.map=new Vi(r.x,r.y),X.map.depthTexture=new ls(r.x,r.y,qi)),X.map.depthTexture.name=V.name+".shadowMap",X.map.depthTexture.format=gr,this.type===Wa?(X.map.depthTexture.compareFunction=j?bm:xm,X.map.depthTexture.minFilter=sn,X.map.depthTexture.magFilter=sn):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Fe,X.map.depthTexture.magFilter=Fe);X.camera.updateProjectionMatrix()}const ee=X.map.isWebGLCubeRenderTarget?6:1;for(let ce=0;ce<ee;ce++){if(X.map.isWebGLCubeRenderTarget)n.setRenderTarget(X.map,ce),n.clear();else{ce===0&&(n.setRenderTarget(X.map),n.clear());const me=X.getViewport(ce);a.set(o.x*me.x,o.y*me.y,o.x*me.z,o.y*me.w),B.viewport(a)}if(V.isPointLight){const me=X.camera,nt=X.matrix,Pt=V.distance||me.far;Pt!==me.far&&(me.far=Pt,me.updateProjectionMatrix()),qs.setFromMatrixPosition(V.matrixWorld),me.position.copy(qs),bf.copy(me.position),bf.add(z2[ce]),me.up.copy(H2[ce]),me.lookAt(bf),me.updateMatrixWorld(),nt.makeTranslation(-qs.x,-qs.y,-qs.z),ux.multiplyMatrices(me.projectionMatrix,me.matrixWorldInverse),X._frustum.setFromProjectionMatrix(ux,me.coordinateSystem,me.reversedDepth)}else X.updateMatrices(V);i=X.getFrustum(),w(C,v,X.camera,V,this.type)}X.isPointLightShadow!==!0&&this.type===Qs&&_(X,v),X.needsUpdate=!1}h=this.type,g.needsUpdate=!1,n.setRenderTarget(T,P,L)};function _(M,C){const v=e.update(b);u.defines.VSM_SAMPLES!==M.blurSamples&&(u.defines.VSM_SAMPLES=M.blurSamples,p.defines.VSM_SAMPLES=M.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new Vi(r.x,r.y,{format:Bo,type:mr})),u.uniforms.shadow_pass.value=M.map.depthTexture,u.uniforms.resolution.value=M.mapSize,u.uniforms.radius.value=M.radius,n.setRenderTarget(M.mapPass),n.clear(),n.renderBufferDirect(C,null,v,u,b,null),p.uniforms.shadow_pass.value=M.mapPass.texture,p.uniforms.resolution.value=M.mapSize,p.uniforms.radius.value=M.radius,n.setRenderTarget(M.map),n.clear(),n.renderBufferDirect(C,null,v,p,b,null)}function S(M,C,v,T){let P=null;const L=v.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(L!==void 0)P=L;else if(P=v.isPointLight===!0?l:s,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const B=P.uuid,O=C.uuid;let q=c[B];q===void 0&&(q={},c[B]=q);let F=q[O];F===void 0&&(F=P.clone(),q[O]=F,C.addEventListener("dispose",A)),P=F}if(P.visible=C.visible,P.wireframe=C.wireframe,T===Qs?P.side=C.shadowSide!==null?C.shadowSide:C.side:P.side=C.shadowSide!==null?C.shadowSide:f[C.side],P.alphaMap=C.alphaMap,P.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,P.map=C.map,P.clipShadows=C.clipShadows,P.clippingPlanes=C.clippingPlanes,P.clipIntersection=C.clipIntersection,P.displacementMap=C.displacementMap,P.displacementScale=C.displacementScale,P.displacementBias=C.displacementBias,P.wireframeLinewidth=C.wireframeLinewidth,P.linewidth=C.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const B=n.properties.get(P);B.light=v}return P}function w(M,C,v,T,P){if(M.visible===!1)return;if(M.layers.test(C.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&P===Qs)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,M.matrixWorld);const O=e.update(M),q=M.material;if(Array.isArray(q)){const F=O.groups;for(let V=0,X=F.length;V<X;V++){const k=F[V],j=q[k.materialIndex];if(j&&j.visible){const ee=S(M,j,T,P);M.onBeforeShadow(n,M,C,v,O,ee,k),n.renderBufferDirect(v,null,O,ee,M,k),M.onAfterShadow(n,M,C,v,O,ee,k)}}}else if(q.visible){const F=S(M,q,T,P);M.onBeforeShadow(n,M,C,v,O,F,null),n.renderBufferDirect(v,null,O,F,M,null),M.onAfterShadow(n,M,C,v,O,F,null)}}const B=M.children;for(let O=0,q=B.length;O<q;O++)w(B[O],C,v,T,P)}function A(M){M.target.removeEventListener("dispose",A);for(const v in c){const T=c[v],P=M.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function G2(n,e){function t(){let I=!1;const ie=new Rt;let K=null;const le=new Rt(0,0,0,0);return{setMask:function(he){K!==he&&!I&&(n.colorMask(he,he,he,he),K=he)},setLocked:function(he){I=he},setClear:function(he,Q,_e,ve,Nt){Nt===!0&&(he*=ve,Q*=ve,_e*=ve),ie.set(he,Q,_e,ve),le.equals(ie)===!1&&(n.clearColor(he,Q,_e,ve),le.copy(ie))},reset:function(){I=!1,K=null,le.set(-1,0,0,0)}}}function i(){let I=!1,ie=!1,K=null,le=null,he=null;return{setReversed:function(Q){if(ie!==Q){const _e=e.get("EXT_clip_control");Q?_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.ZERO_TO_ONE_EXT):_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.NEGATIVE_ONE_TO_ONE_EXT),ie=Q;const ve=he;he=null,this.setClear(ve)}},getReversed:function(){return ie},setTest:function(Q){Q?te(n.DEPTH_TEST):Ne(n.DEPTH_TEST)},setMask:function(Q){K!==Q&&!I&&(n.depthMask(Q),K=Q)},setFunc:function(Q){if(ie&&(Q=i1[Q]),le!==Q){switch(Q){case Tp:n.depthFunc(n.NEVER);break;case Ap:n.depthFunc(n.ALWAYS);break;case Cp:n.depthFunc(n.LESS);break;case os:n.depthFunc(n.LEQUAL);break;case Rp:n.depthFunc(n.EQUAL);break;case Lp:n.depthFunc(n.GEQUAL);break;case Ip:n.depthFunc(n.GREATER);break;case Pp:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}le=Q}},setLocked:function(Q){I=Q},setClear:function(Q){he!==Q&&(he=Q,ie&&(Q=1-Q),n.clearDepth(Q))},reset:function(){I=!1,K=null,le=null,he=null,ie=!1}}}function r(){let I=!1,ie=null,K=null,le=null,he=null,Q=null,_e=null,ve=null,Nt=null;return{setTest:function(yt){I||(yt?te(n.STENCIL_TEST):Ne(n.STENCIL_TEST))},setMask:function(yt){ie!==yt&&!I&&(n.stencilMask(yt),ie=yt)},setFunc:function(yt,Li,Ii){(K!==yt||le!==Li||he!==Ii)&&(n.stencilFunc(yt,Li,Ii),K=yt,le=Li,he=Ii)},setOp:function(yt,Li,Ii){(Q!==yt||_e!==Li||ve!==Ii)&&(n.stencilOp(yt,Li,Ii),Q=yt,_e=Li,ve=Ii)},setLocked:function(yt){I=yt},setClear:function(yt){Nt!==yt&&(n.clearStencil(yt),Nt=yt)},reset:function(){I=!1,ie=null,K=null,le=null,he=null,Q=null,_e=null,ve=null,Nt=null}}}const o=new t,a=new i,s=new r,l=new WeakMap,c=new WeakMap;let d={},f={},u={},p=new WeakMap,m=[],b=null,g=!1,h=null,_=null,S=null,w=null,A=null,M=null,C=null,v=new Ae(0,0,0),T=0,P=!1,L=null,B=null,O=null,q=null,F=null;const V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,k=0;const j=n.getParameter(n.VERSION);j.indexOf("WebGL")!==-1?(k=parseFloat(/^WebGL (\d)/.exec(j)[1]),X=k>=1):j.indexOf("OpenGL ES")!==-1&&(k=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),X=k>=2);let ee=null,ce={};const me=n.getParameter(n.SCISSOR_BOX),nt=n.getParameter(n.VIEWPORT),Pt=new Rt().fromArray(me),it=new Rt().fromArray(nt);function J(I,ie,K,le){const he=new Uint8Array(4),Q=n.createTexture();n.bindTexture(I,Q),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let _e=0;_e<K;_e++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(ie,0,n.RGBA,1,1,le,0,n.RGBA,n.UNSIGNED_BYTE,he):n.texImage2D(ie+_e,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,he);return Q}const re={};re[n.TEXTURE_2D]=J(n.TEXTURE_2D,n.TEXTURE_2D,1),re[n.TEXTURE_CUBE_MAP]=J(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),re[n.TEXTURE_2D_ARRAY]=J(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),re[n.TEXTURE_3D]=J(n.TEXTURE_3D,n.TEXTURE_3D,1,1),o.setClear(0,0,0,1),a.setClear(1),s.setClear(0),te(n.DEPTH_TEST),a.setFunc(os),Vt(!1),Kt(n0),te(n.CULL_FACE),rt(fr);function te(I){d[I]!==!0&&(n.enable(I),d[I]=!0)}function Ne(I){d[I]!==!1&&(n.disable(I),d[I]=!1)}function ze(I,ie){return u[I]!==ie?(n.bindFramebuffer(I,ie),u[I]=ie,I===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ie),I===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ie),!0):!1}function Ce(I,ie){let K=m,le=!1;if(I){K=p.get(ie),K===void 0&&(K=[],p.set(ie,K));const he=I.textures;if(K.length!==he.length||K[0]!==n.COLOR_ATTACHMENT0){for(let Q=0,_e=he.length;Q<_e;Q++)K[Q]=n.COLOR_ATTACHMENT0+Q;K.length=he.length,le=!0}}else K[0]!==n.BACK&&(K[0]=n.BACK,le=!0);le&&n.drawBuffers(K)}function Ot(I){return b!==I?(n.useProgram(I),b=I,!0):!1}const $e={[xo]:n.FUNC_ADD,[ES]:n.FUNC_SUBTRACT,[TS]:n.FUNC_REVERSE_SUBTRACT};$e[AS]=n.MIN,$e[CS]=n.MAX;const ht={[RS]:n.ZERO,[LS]:n.ONE,[IS]:n.SRC_COLOR,[Mp]:n.SRC_ALPHA,[kS]:n.SRC_ALPHA_SATURATE,[FS]:n.DST_COLOR,[DS]:n.DST_ALPHA,[PS]:n.ONE_MINUS_SRC_COLOR,[Ep]:n.ONE_MINUS_SRC_ALPHA,[US]:n.ONE_MINUS_DST_COLOR,[NS]:n.ONE_MINUS_DST_ALPHA,[BS]:n.CONSTANT_COLOR,[OS]:n.ONE_MINUS_CONSTANT_COLOR,[zS]:n.CONSTANT_ALPHA,[HS]:n.ONE_MINUS_CONSTANT_ALPHA};function rt(I,ie,K,le,he,Q,_e,ve,Nt,yt){if(I===fr){g===!0&&(Ne(n.BLEND),g=!1);return}if(g===!1&&(te(n.BLEND),g=!0),I!==MS){if(I!==h||yt!==P){if((_!==xo||A!==xo)&&(n.blendEquation(n.FUNC_ADD),_=xo,A=xo),yt)switch(I){case Ga:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case i0:n.blendFunc(n.ONE,n.ONE);break;case r0:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case o0:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ke("WebGLState: Invalid blending: ",I);break}else switch(I){case Ga:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case i0:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case r0:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case o0:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",I);break}S=null,w=null,M=null,C=null,v.set(0,0,0),T=0,h=I,P=yt}return}he=he||ie,Q=Q||K,_e=_e||le,(ie!==_||he!==A)&&(n.blendEquationSeparate($e[ie],$e[he]),_=ie,A=he),(K!==S||le!==w||Q!==M||_e!==C)&&(n.blendFuncSeparate(ht[K],ht[le],ht[Q],ht[_e]),S=K,w=le,M=Q,C=_e),(ve.equals(v)===!1||Nt!==T)&&(n.blendColor(ve.r,ve.g,ve.b,Nt),v.copy(ve),T=Nt),h=I,P=!1}function Je(I,ie){I.side===jt?Ne(n.CULL_FACE):te(n.CULL_FACE);let K=I.side===Nn;ie&&(K=!K),Vt(K),I.blending===Ga&&I.transparent===!1?rt(fr):rt(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),o.setMask(I.colorWrite);const le=I.stencilWrite;s.setTest(le),le&&(s.setMask(I.stencilWriteMask),s.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),s.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),fn(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?te(n.SAMPLE_ALPHA_TO_COVERAGE):Ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function Vt(I){L!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),L=I)}function Kt(I){I!==wS?(te(n.CULL_FACE),I!==B&&(I===n0?n.cullFace(n.BACK):I===_S?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ne(n.CULL_FACE),B=I}function nn(I){I!==O&&(X&&n.lineWidth(I),O=I)}function fn(I,ie,K){I?(te(n.POLYGON_OFFSET_FILL),(q!==ie||F!==K)&&(q=ie,F=K,a.getReversed()&&(ie=-ie),n.polygonOffset(ie,K))):Ne(n.POLYGON_OFFSET_FILL)}function Dt(I){I?te(n.SCISSOR_TEST):Ne(n.SCISSOR_TEST)}function Xt(I){I===void 0&&(I=n.TEXTURE0+V-1),ee!==I&&(n.activeTexture(I),ee=I)}function D(I,ie,K){K===void 0&&(ee===null?K=n.TEXTURE0+V-1:K=ee);let le=ce[K];le===void 0&&(le={type:void 0,texture:void 0},ce[K]=le),(le.type!==I||le.texture!==ie)&&(ee!==K&&(n.activeTexture(K),ee=K),n.bindTexture(I,ie||re[I]),le.type=I,le.texture=ie)}function Un(){const I=ce[ee];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function ct(){try{n.compressedTexImage2D(...arguments)}catch(I){Ke("WebGLState:",I)}}function E(){try{n.compressedTexImage3D(...arguments)}catch(I){Ke("WebGLState:",I)}}function x(){try{n.texSubImage2D(...arguments)}catch(I){Ke("WebGLState:",I)}}function U(){try{n.texSubImage3D(...arguments)}catch(I){Ke("WebGLState:",I)}}function W(){try{n.compressedTexSubImage2D(...arguments)}catch(I){Ke("WebGLState:",I)}}function $(){try{n.compressedTexSubImage3D(...arguments)}catch(I){Ke("WebGLState:",I)}}function ne(){try{n.texStorage2D(...arguments)}catch(I){Ke("WebGLState:",I)}}function oe(){try{n.texStorage3D(...arguments)}catch(I){Ke("WebGLState:",I)}}function Y(){try{n.texImage2D(...arguments)}catch(I){Ke("WebGLState:",I)}}function Z(){try{n.texImage3D(...arguments)}catch(I){Ke("WebGLState:",I)}}function ae(I){return f[I]!==void 0?f[I]:n.getParameter(I)}function Se(I,ie){f[I]!==ie&&(n.pixelStorei(I,ie),f[I]=ie)}function de(I){Pt.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),Pt.copy(I))}function se(I){it.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),it.copy(I))}function Te(I,ie){let K=c.get(ie);K===void 0&&(K=new WeakMap,c.set(ie,K));let le=K.get(I);le===void 0&&(le=n.getUniformBlockIndex(ie,I.name),K.set(I,le))}function Re(I,ie){const le=c.get(ie).get(I);l.get(ie)!==le&&(n.uniformBlockBinding(ie,le,I.__bindingPointIndex),l.set(ie,le))}function He(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),d={},f={},ee=null,ce={},u={},p=new WeakMap,m=[],b=null,g=!1,h=null,_=null,S=null,w=null,A=null,M=null,C=null,v=new Ae(0,0,0),T=0,P=!1,L=null,B=null,O=null,q=null,F=null,Pt.set(0,0,n.canvas.width,n.canvas.height),it.set(0,0,n.canvas.width,n.canvas.height),o.reset(),a.reset(),s.reset()}return{buffers:{color:o,depth:a,stencil:s},enable:te,disable:Ne,bindFramebuffer:ze,drawBuffers:Ce,useProgram:Ot,setBlending:rt,setMaterial:Je,setFlipSided:Vt,setCullFace:Kt,setLineWidth:nn,setPolygonOffset:fn,setScissorTest:Dt,activeTexture:Xt,bindTexture:D,unbindTexture:Un,compressedTexImage2D:ct,compressedTexImage3D:E,texImage2D:Y,texImage3D:Z,pixelStorei:Se,getParameter:ae,updateUBOMapping:Te,uniformBlockBinding:Re,texStorage2D:ne,texStorage3D:oe,texSubImage2D:x,texSubImage3D:U,compressedTexSubImage2D:W,compressedTexSubImage3D:$,scissor:de,viewport:se,reset:He}}function V2(n,e,t,i,r,o,a){const s=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new De,d=new WeakMap,f=new Set;let u;const p=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(E,x){return m?new OffscreenCanvas(E,x):Sl("canvas")}function g(E,x,U){let W=1;const $=ct(E);if(($.width>U||$.height>U)&&(W=U/Math.max($.width,$.height)),W<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const ne=Math.floor(W*$.width),oe=Math.floor(W*$.height);u===void 0&&(u=b(ne,oe));const Y=x?b(ne,oe):u;return Y.width=ne,Y.height=oe,Y.getContext("2d").drawImage(E,0,0,ne,oe),Ie("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+ne+"x"+oe+")."),Y}else return"data"in E&&Ie("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),E;return E}function h(E){return E.generateMipmaps}function _(E){n.generateMipmap(E)}function S(E){return E.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?n.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function w(E,x,U,W,$,ne=!1){if(E!==null){if(n[E]!==void 0)return n[E];Ie("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let oe;W&&(oe=e.get("EXT_texture_norm16"),oe||Ie("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=x;if(x===n.RED&&(U===n.FLOAT&&(Y=n.R32F),U===n.HALF_FLOAT&&(Y=n.R16F),U===n.UNSIGNED_BYTE&&(Y=n.R8),U===n.UNSIGNED_SHORT&&oe&&(Y=oe.R16_EXT),U===n.SHORT&&oe&&(Y=oe.R16_SNORM_EXT)),x===n.RED_INTEGER&&(U===n.UNSIGNED_BYTE&&(Y=n.R8UI),U===n.UNSIGNED_SHORT&&(Y=n.R16UI),U===n.UNSIGNED_INT&&(Y=n.R32UI),U===n.BYTE&&(Y=n.R8I),U===n.SHORT&&(Y=n.R16I),U===n.INT&&(Y=n.R32I)),x===n.RG&&(U===n.FLOAT&&(Y=n.RG32F),U===n.HALF_FLOAT&&(Y=n.RG16F),U===n.UNSIGNED_BYTE&&(Y=n.RG8),U===n.UNSIGNED_SHORT&&oe&&(Y=oe.RG16_EXT),U===n.SHORT&&oe&&(Y=oe.RG16_SNORM_EXT)),x===n.RG_INTEGER&&(U===n.UNSIGNED_BYTE&&(Y=n.RG8UI),U===n.UNSIGNED_SHORT&&(Y=n.RG16UI),U===n.UNSIGNED_INT&&(Y=n.RG32UI),U===n.BYTE&&(Y=n.RG8I),U===n.SHORT&&(Y=n.RG16I),U===n.INT&&(Y=n.RG32I)),x===n.RGB_INTEGER&&(U===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),U===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),U===n.UNSIGNED_INT&&(Y=n.RGB32UI),U===n.BYTE&&(Y=n.RGB8I),U===n.SHORT&&(Y=n.RGB16I),U===n.INT&&(Y=n.RGB32I)),x===n.RGBA_INTEGER&&(U===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),U===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),U===n.UNSIGNED_INT&&(Y=n.RGBA32UI),U===n.BYTE&&(Y=n.RGBA8I),U===n.SHORT&&(Y=n.RGBA16I),U===n.INT&&(Y=n.RGBA32I)),x===n.RGB&&(U===n.UNSIGNED_SHORT&&oe&&(Y=oe.RGB16_EXT),U===n.SHORT&&oe&&(Y=oe.RGB16_SNORM_EXT),U===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),U===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),x===n.RGBA){const Z=ne?md:Ze.getTransfer($);U===n.FLOAT&&(Y=n.RGBA32F),U===n.HALF_FLOAT&&(Y=n.RGBA16F),U===n.UNSIGNED_BYTE&&(Y=Z===dt?n.SRGB8_ALPHA8:n.RGBA8),U===n.UNSIGNED_SHORT&&oe&&(Y=oe.RGBA16_EXT),U===n.SHORT&&oe&&(Y=oe.RGBA16_SNORM_EXT),U===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),U===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function A(E,x){let U;return E?x===null||x===qi||x===wl?U=n.DEPTH24_STENCIL8:x===Si?U=n.DEPTH32F_STENCIL8:x===yl&&(U=n.DEPTH24_STENCIL8,Ie("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===qi||x===wl?U=n.DEPTH_COMPONENT24:x===Si?U=n.DEPTH_COMPONENT32F:x===yl&&(U=n.DEPTH_COMPONENT16),U}function M(E,x){return h(E)===!0||E.isFramebufferTexture&&E.minFilter!==Fe&&E.minFilter!==sn?Math.log2(Math.max(x.width,x.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?x.mipmaps.length:1}function C(E){const x=E.target;x.removeEventListener("dispose",C),T(x),x.isVideoTexture&&d.delete(x),x.isHTMLTexture&&f.delete(x)}function v(E){const x=E.target;x.removeEventListener("dispose",v),L(x)}function T(E){const x=i.get(E);if(x.__webglInit===void 0)return;const U=E.source,W=p.get(U);if(W){const $=W[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&P(E),Object.keys(W).length===0&&p.delete(U)}i.remove(E)}function P(E){const x=i.get(E);n.deleteTexture(x.__webglTexture);const U=E.source,W=p.get(U);delete W[x.__cacheKey],a.memory.textures--}function L(E){const x=i.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),i.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let $=0;$<x.__webglFramebuffer[W].length;$++)n.deleteFramebuffer(x.__webglFramebuffer[W][$]);else n.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)n.deleteFramebuffer(x.__webglFramebuffer[W]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const U=E.textures;for(let W=0,$=U.length;W<$;W++){const ne=i.get(U[W]);ne.__webglTexture&&(n.deleteTexture(ne.__webglTexture),a.memory.textures--),i.remove(U[W])}i.remove(E)}let B=0;function O(){B=0}function q(){return B}function F(E){B=E}function V(){const E=B;return E>=r.maxTextures&&Ie("WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+r.maxTextures),B+=1,E}function X(E){const x=[];return x.push(E.wrapS),x.push(E.wrapT),x.push(E.wrapR||0),x.push(E.magFilter),x.push(E.minFilter),x.push(E.anisotropy),x.push(E.internalFormat),x.push(E.format),x.push(E.type),x.push(E.generateMipmaps),x.push(E.premultiplyAlpha),x.push(E.flipY),x.push(E.unpackAlignment),x.push(E.colorSpace),x.join()}function k(E,x){const U=i.get(E);if(E.isVideoTexture&&D(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&U.__version!==E.version){const W=E.image;if(W===null)Ie("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ie("WebGLRenderer: Texture marked for update but image is incomplete");else{Ne(U,E,x);return}}else E.isExternalTexture&&(U.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,U.__webglTexture,n.TEXTURE0+x)}function j(E,x){const U=i.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&U.__version!==E.version){Ne(U,E,x);return}else E.isExternalTexture&&(U.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,U.__webglTexture,n.TEXTURE0+x)}function ee(E,x){const U=i.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&U.__version!==E.version){Ne(U,E,x);return}t.bindTexture(n.TEXTURE_3D,U.__webglTexture,n.TEXTURE0+x)}function ce(E,x){const U=i.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&U.__version!==E.version){ze(U,E,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,U.__webglTexture,n.TEXTURE0+x)}const me={[ss]:n.REPEAT,[En]:n.CLAMP_TO_EDGE,[Dp]:n.MIRRORED_REPEAT},nt={[Fe]:n.NEAREST,[VS]:n.NEAREST_MIPMAP_NEAREST,[rc]:n.NEAREST_MIPMAP_LINEAR,[sn]:n.LINEAR,[Ou]:n.LINEAR_MIPMAP_NEAREST,[So]:n.LINEAR_MIPMAP_LINEAR},Pt={[$S]:n.NEVER,[jS]:n.ALWAYS,[YS]:n.LESS,[xm]:n.LEQUAL,[KS]:n.EQUAL,[bm]:n.GEQUAL,[ZS]:n.GREATER,[JS]:n.NOTEQUAL};function it(E,x){if(x.type===Si&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===sn||x.magFilter===Ou||x.magFilter===rc||x.magFilter===So||x.minFilter===sn||x.minFilter===Ou||x.minFilter===rc||x.minFilter===So)&&Ie("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(E,n.TEXTURE_WRAP_S,me[x.wrapS]),n.texParameteri(E,n.TEXTURE_WRAP_T,me[x.wrapT]),(E===n.TEXTURE_3D||E===n.TEXTURE_2D_ARRAY)&&n.texParameteri(E,n.TEXTURE_WRAP_R,me[x.wrapR]),n.texParameteri(E,n.TEXTURE_MAG_FILTER,nt[x.magFilter]),n.texParameteri(E,n.TEXTURE_MIN_FILTER,nt[x.minFilter]),x.compareFunction&&(n.texParameteri(E,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(E,n.TEXTURE_COMPARE_FUNC,Pt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Fe||x.minFilter!==rc&&x.minFilter!==So||x.type===Si&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const U=e.get("EXT_texture_filter_anisotropic");n.texParameterf(E,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function J(E,x){let U=!1;E.__webglInit===void 0&&(E.__webglInit=!0,x.addEventListener("dispose",C));const W=x.source;let $=p.get(W);$===void 0&&($={},p.set(W,$));const ne=X(x);if(ne!==E.__cacheKey){$[ne]===void 0&&($[ne]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,U=!0),$[ne].usedTimes++;const oe=$[E.__cacheKey];oe!==void 0&&($[E.__cacheKey].usedTimes--,oe.usedTimes===0&&P(x)),E.__cacheKey=ne,E.__webglTexture=$[ne].texture}return U}function re(E,x,U){return Math.floor(Math.floor(E/U)/x)}function te(E,x,U,W){const ne=E.updateRanges;if(ne.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,U,W,x.data);else{ne.sort((Se,de)=>Se.start-de.start);let oe=0;for(let Se=1;Se<ne.length;Se++){const de=ne[oe],se=ne[Se],Te=de.start+de.count,Re=re(se.start,x.width,4),He=re(de.start,x.width,4);se.start<=Te+1&&Re===He&&re(se.start+se.count-1,x.width,4)===Re?de.count=Math.max(de.count,se.start+se.count-de.start):(++oe,ne[oe]=se)}ne.length=oe+1;const Y=t.getParameter(n.UNPACK_ROW_LENGTH),Z=t.getParameter(n.UNPACK_SKIP_PIXELS),ae=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let Se=0,de=ne.length;Se<de;Se++){const se=ne[Se],Te=Math.floor(se.start/4),Re=Math.ceil(se.count/4),He=Te%x.width,I=Math.floor(Te/x.width),ie=Re,K=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,He),t.pixelStorei(n.UNPACK_SKIP_ROWS,I),t.texSubImage2D(n.TEXTURE_2D,0,He,I,ie,K,U,W,x.data)}E.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Y),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Z),t.pixelStorei(n.UNPACK_SKIP_ROWS,ae)}}function Ne(E,x,U){let W=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=n.TEXTURE_3D);const $=J(E,x),ne=x.source;t.bindTexture(W,E.__webglTexture,n.TEXTURE0+U);const oe=i.get(ne);if(ne.version!==oe.__version||$===!0){if(t.activeTexture(n.TEXTURE0+U),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const K=Ze.getPrimaries(Ze.workingColorSpace),le=x.colorSpace===Br?null:Ze.getPrimaries(x.colorSpace),he=x.colorSpace===Br||K===le?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,he)}t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment);let Z=g(x.image,!1,r.maxTextureSize);Z=Un(x,Z);const ae=o.convert(x.format,x.colorSpace),Se=o.convert(x.type);let de=w(x.internalFormat,ae,Se,x.normalized,x.colorSpace,x.isVideoTexture);it(W,x);let se;const Te=x.mipmaps,Re=x.isVideoTexture!==!0,He=oe.__version===void 0||$===!0,I=ne.dataReady,ie=M(x,Z);if(x.isDepthTexture)de=A(x.format===Mo,x.type),He&&(Re?t.texStorage2D(n.TEXTURE_2D,1,de,Z.width,Z.height):t.texImage2D(n.TEXTURE_2D,0,de,Z.width,Z.height,0,ae,Se,null));else if(x.isDataTexture)if(Te.length>0){Re&&He&&t.texStorage2D(n.TEXTURE_2D,ie,de,Te[0].width,Te[0].height);for(let K=0,le=Te.length;K<le;K++)se=Te[K],Re?I&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,se.width,se.height,ae,Se,se.data):t.texImage2D(n.TEXTURE_2D,K,de,se.width,se.height,0,ae,Se,se.data);x.generateMipmaps=!1}else Re?(He&&t.texStorage2D(n.TEXTURE_2D,ie,de,Z.width,Z.height),I&&te(x,Z,ae,Se)):t.texImage2D(n.TEXTURE_2D,0,de,Z.width,Z.height,0,ae,Se,Z.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Re&&He&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ie,de,Te[0].width,Te[0].height,Z.depth);for(let K=0,le=Te.length;K<le;K++)if(se=Te[K],x.format!==Mi)if(ae!==null)if(Re){if(I)if(x.layerUpdates.size>0){const he=W0(se.width,se.height,x.format,x.type);for(const Q of x.layerUpdates){const _e=se.data.subarray(Q*he/se.data.BYTES_PER_ELEMENT,(Q+1)*he/se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,Q,se.width,se.height,1,ae,_e)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,0,se.width,se.height,Z.depth,ae,se.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,K,de,se.width,se.height,Z.depth,0,se.data,0,0);else Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Re?I&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,0,se.width,se.height,Z.depth,ae,Se,se.data):t.texImage3D(n.TEXTURE_2D_ARRAY,K,de,se.width,se.height,Z.depth,0,ae,Se,se.data)}else{Re&&He&&t.texStorage2D(n.TEXTURE_2D,ie,de,Te[0].width,Te[0].height);for(let K=0,le=Te.length;K<le;K++)se=Te[K],x.format!==Mi?ae!==null?Re?I&&t.compressedTexSubImage2D(n.TEXTURE_2D,K,0,0,se.width,se.height,ae,se.data):t.compressedTexImage2D(n.TEXTURE_2D,K,de,se.width,se.height,0,se.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Re?I&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,se.width,se.height,ae,Se,se.data):t.texImage2D(n.TEXTURE_2D,K,de,se.width,se.height,0,ae,Se,se.data)}else if(x.isDataArrayTexture)if(Re){if(He&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ie,de,Z.width,Z.height,Z.depth),I)if(x.layerUpdates.size>0){const K=W0(Z.width,Z.height,x.format,x.type);for(const le of x.layerUpdates){const he=Z.data.subarray(le*K/Z.data.BYTES_PER_ELEMENT,(le+1)*K/Z.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,le,Z.width,Z.height,1,ae,Se,he)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,ae,Se,Z.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,de,Z.width,Z.height,Z.depth,0,ae,Se,Z.data);else if(x.isData3DTexture)Re?(He&&t.texStorage3D(n.TEXTURE_3D,ie,de,Z.width,Z.height,Z.depth),I&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,ae,Se,Z.data)):t.texImage3D(n.TEXTURE_3D,0,de,Z.width,Z.height,Z.depth,0,ae,Se,Z.data);else if(x.isFramebufferTexture){if(He)if(Re)t.texStorage2D(n.TEXTURE_2D,ie,de,Z.width,Z.height);else{let K=Z.width,le=Z.height;for(let he=0;he<ie;he++)t.texImage2D(n.TEXTURE_2D,he,de,K,le,0,ae,Se,null),K>>=1,le>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in n){const K=n.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),Z.parentNode!==K){K.appendChild(Z),f.add(x),K.onpaint=le=>{const he=le.changedElements;for(const Q of f)he.includes(Q.image)&&(Q.needsUpdate=!0)},K.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Z);else{const he=n.RGBA,Q=n.RGBA,_e=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,he,Q,_e,Z)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Te.length>0){if(Re&&He){const K=ct(Te[0]);t.texStorage2D(n.TEXTURE_2D,ie,de,K.width,K.height)}for(let K=0,le=Te.length;K<le;K++)se=Te[K],Re?I&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,ae,Se,se):t.texImage2D(n.TEXTURE_2D,K,de,ae,Se,se);x.generateMipmaps=!1}else if(Re){if(He){const K=ct(Z);t.texStorage2D(n.TEXTURE_2D,ie,de,K.width,K.height)}I&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae,Se,Z)}else t.texImage2D(n.TEXTURE_2D,0,de,ae,Se,Z);h(x)&&_(W),oe.__version=ne.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function ze(E,x,U){if(x.image.length!==6)return;const W=J(E,x),$=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,E.__webglTexture,n.TEXTURE0+U);const ne=i.get($);if($.version!==ne.__version||W===!0){t.activeTexture(n.TEXTURE0+U);const oe=Ze.getPrimaries(Ze.workingColorSpace),Y=x.colorSpace===Br?null:Ze.getPrimaries(x.colorSpace),Z=x.colorSpace===Br||oe===Y?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);const ae=x.isCompressedTexture||x.image[0].isCompressedTexture,Se=x.image[0]&&x.image[0].isDataTexture,de=[];for(let Q=0;Q<6;Q++)!ae&&!Se?de[Q]=g(x.image[Q],!0,r.maxCubemapSize):de[Q]=Se?x.image[Q].image:x.image[Q],de[Q]=Un(x,de[Q]);const se=de[0],Te=o.convert(x.format,x.colorSpace),Re=o.convert(x.type),He=w(x.internalFormat,Te,Re,x.normalized,x.colorSpace),I=x.isVideoTexture!==!0,ie=ne.__version===void 0||W===!0,K=$.dataReady;let le=M(x,se);it(n.TEXTURE_CUBE_MAP,x);let he;if(ae){I&&ie&&t.texStorage2D(n.TEXTURE_CUBE_MAP,le,He,se.width,se.height);for(let Q=0;Q<6;Q++){he=de[Q].mipmaps;for(let _e=0;_e<he.length;_e++){const ve=he[_e];x.format!==Mi?Te!==null?I?K&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e,0,0,ve.width,ve.height,Te,ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e,He,ve.width,ve.height,0,ve.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e,0,0,ve.width,ve.height,Te,Re,ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e,He,ve.width,ve.height,0,Te,Re,ve.data)}}}else{if(he=x.mipmaps,I&&ie){he.length>0&&le++;const Q=ct(de[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,le,He,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(Se){I?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,de[Q].width,de[Q].height,Te,Re,de[Q].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,He,de[Q].width,de[Q].height,0,Te,Re,de[Q].data);for(let _e=0;_e<he.length;_e++){const Nt=he[_e].image[Q].image;I?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e+1,0,0,Nt.width,Nt.height,Te,Re,Nt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e+1,He,Nt.width,Nt.height,0,Te,Re,Nt.data)}}else{I?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Te,Re,de[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,He,Te,Re,de[Q]);for(let _e=0;_e<he.length;_e++){const ve=he[_e];I?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e+1,0,0,Te,Re,ve.image[Q]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_e+1,He,Te,Re,ve.image[Q])}}}h(x)&&_(n.TEXTURE_CUBE_MAP),ne.__version=$.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function Ce(E,x,U,W,$,ne){const oe=o.convert(U.format,U.colorSpace),Y=o.convert(U.type),Z=w(U.internalFormat,oe,Y,U.normalized,U.colorSpace),ae=i.get(x),Se=i.get(U);if(Se.__renderTarget=x,!ae.__hasExternalTextures){const de=Math.max(1,x.width>>ne),se=Math.max(1,x.height>>ne);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?t.texImage3D($,ne,Z,de,se,x.depth,0,oe,Y,null):t.texImage2D($,ne,Z,de,se,0,oe,Y,null)}t.bindFramebuffer(n.FRAMEBUFFER,E),Xt(x)?s.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,W,$,Se.__webglTexture,0,Dt(x)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,W,$,Se.__webglTexture,ne),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ot(E,x,U){if(n.bindRenderbuffer(n.RENDERBUFFER,E),x.depthBuffer){const W=x.depthTexture,$=W&&W.isDepthTexture?W.type:null,ne=A(x.stencilBuffer,$),oe=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Xt(x)?s.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Dt(x),ne,x.width,x.height):U?n.renderbufferStorageMultisample(n.RENDERBUFFER,Dt(x),ne,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,ne,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,oe,n.RENDERBUFFER,E)}else{const W=x.textures;for(let $=0;$<W.length;$++){const ne=W[$],oe=o.convert(ne.format,ne.colorSpace),Y=o.convert(ne.type),Z=w(ne.internalFormat,oe,Y,ne.normalized,ne.colorSpace);Xt(x)?s.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Dt(x),Z,x.width,x.height):U?n.renderbufferStorageMultisample(n.RENDERBUFFER,Dt(x),Z,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,Z,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function $e(E,x,U){const W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,E),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const $=i.get(x.depthTexture);if($.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if($.__webglInit===void 0&&($.__webglInit=!0,x.depthTexture.addEventListener("dispose",C)),$.__webglTexture===void 0){$.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),it(n.TEXTURE_CUBE_MAP,x.depthTexture);const ae=o.convert(x.depthTexture.format),Se=o.convert(x.depthTexture.type);let de;x.depthTexture.format===gr?de=n.DEPTH_COMPONENT24:x.depthTexture.format===Mo&&(de=n.DEPTH24_STENCIL8);for(let se=0;se<6;se++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+se,0,de,x.width,x.height,0,ae,Se,null)}}else k(x.depthTexture,0);const ne=$.__webglTexture,oe=Dt(x),Y=W?n.TEXTURE_CUBE_MAP_POSITIVE_X+U:n.TEXTURE_2D,Z=x.depthTexture.format===Mo?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===gr)Xt(x)?s.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,Y,ne,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,Z,Y,ne,0);else if(x.depthTexture.format===Mo)Xt(x)?s.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,Y,ne,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,Z,Y,ne,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ht(E){const x=i.get(E),U=E.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==E.depthTexture){const W=E.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){const $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",$)};W.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=W}if(E.depthTexture&&!x.__autoAllocateDepthBuffer)if(U)for(let W=0;W<6;W++)$e(x.__webglFramebuffer[W],E,W);else{const W=E.texture.mipmaps;W&&W.length>0?$e(x.__webglFramebuffer[0],E,0):$e(x.__webglFramebuffer,E,0)}else if(U){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=n.createRenderbuffer(),Ot(x.__webglDepthbuffer[W],E,!1);else{const $=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=x.__webglDepthbuffer[W];n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ne)}}else{const W=E.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),Ot(x.__webglDepthbuffer,E,!1);else{const $=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ne)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function rt(E,x,U){const W=i.get(E);x!==void 0&&Ce(W.__webglFramebuffer,E,E.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),U!==void 0&&ht(E)}function Je(E){const x=E.texture,U=i.get(E),W=i.get(x);E.addEventListener("dispose",v);const $=E.textures,ne=E.isWebGLCubeRenderTarget===!0,oe=$.length>1;if(oe||(W.__webglTexture===void 0&&(W.__webglTexture=n.createTexture()),W.__version=x.version,a.memory.textures++),ne){U.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer[Y]=[];for(let Z=0;Z<x.mipmaps.length;Z++)U.__webglFramebuffer[Y][Z]=n.createFramebuffer()}else U.__webglFramebuffer[Y]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer=[];for(let Y=0;Y<x.mipmaps.length;Y++)U.__webglFramebuffer[Y]=n.createFramebuffer()}else U.__webglFramebuffer=n.createFramebuffer();if(oe)for(let Y=0,Z=$.length;Y<Z;Y++){const ae=i.get($[Y]);ae.__webglTexture===void 0&&(ae.__webglTexture=n.createTexture(),a.memory.textures++)}if(E.samples>0&&Xt(E)===!1){U.__webglMultisampledFramebuffer=n.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let Y=0;Y<$.length;Y++){const Z=$[Y];U.__webglColorRenderbuffer[Y]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,U.__webglColorRenderbuffer[Y]);const ae=o.convert(Z.format,Z.colorSpace),Se=o.convert(Z.type),de=w(Z.internalFormat,ae,Se,Z.normalized,Z.colorSpace,E.isXRRenderTarget===!0),se=Dt(E);n.renderbufferStorageMultisample(n.RENDERBUFFER,se,de,E.width,E.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Y,n.RENDERBUFFER,U.__webglColorRenderbuffer[Y])}n.bindRenderbuffer(n.RENDERBUFFER,null),E.depthBuffer&&(U.__webglDepthRenderbuffer=n.createRenderbuffer(),Ot(U.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ne){t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture),it(n.TEXTURE_CUBE_MAP,x);for(let Y=0;Y<6;Y++)if(x.mipmaps&&x.mipmaps.length>0)for(let Z=0;Z<x.mipmaps.length;Z++)Ce(U.__webglFramebuffer[Y][Z],E,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else Ce(U.__webglFramebuffer[Y],E,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);h(x)&&_(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(oe){for(let Y=0,Z=$.length;Y<Z;Y++){const ae=$[Y],Se=i.get(ae);let de=n.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(de=E.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(de,Se.__webglTexture),it(de,ae),Ce(U.__webglFramebuffer,E,ae,n.COLOR_ATTACHMENT0+Y,de,0),h(ae)&&_(de)}t.unbindTexture()}else{let Y=n.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(Y=E.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Y,W.__webglTexture),it(Y,x),x.mipmaps&&x.mipmaps.length>0)for(let Z=0;Z<x.mipmaps.length;Z++)Ce(U.__webglFramebuffer[Z],E,x,n.COLOR_ATTACHMENT0,Y,Z);else Ce(U.__webglFramebuffer,E,x,n.COLOR_ATTACHMENT0,Y,0);h(x)&&_(Y),t.unbindTexture()}E.depthBuffer&&ht(E)}function Vt(E){const x=E.textures;for(let U=0,W=x.length;U<W;U++){const $=x[U];if(h($)){const ne=S(E),oe=i.get($).__webglTexture;t.bindTexture(ne,oe),_(ne),t.unbindTexture()}}}const Kt=[],nn=[];function fn(E){if(E.samples>0){if(Xt(E)===!1){const x=E.textures,U=E.width,W=E.height;let $=n.COLOR_BUFFER_BIT;const ne=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=i.get(E),Y=x.length>1;if(Y)for(let ae=0;ae<x.length;ae++)t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer);const Z=E.texture.mipmaps;Z&&Z.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let ae=0;ae<x.length;ae++){if(E.resolveDepthBuffer&&(E.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),Y){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,oe.__webglColorRenderbuffer[ae]);const Se=i.get(x[ae]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Se,0)}n.blitFramebuffer(0,0,U,W,0,0,U,W,$,n.NEAREST),l===!0&&(Kt.length=0,nn.length=0,Kt.push(n.COLOR_ATTACHMENT0+ae),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Kt.push(ne),nn.push(ne),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,nn)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Kt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Y)for(let ae=0;ae<x.length;ae++){t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,oe.__webglColorRenderbuffer[ae]);const Se=i.get(x[ae]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,Se,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){const x=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function Dt(E){return Math.min(r.maxSamples,E.samples)}function Xt(E){const x=i.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function D(E){const x=a.render.frame;d.get(E)!==x&&(d.set(E,x),E.update())}function Un(E,x){const U=E.colorSpace,W=E.format,$=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||U!==hd&&U!==Br&&(Ze.getTransfer(U)===dt?(W!==Mi||$!==Vn)&&Ie("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",U)),x}function ct(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=O,this.getTextureUnits=q,this.setTextureUnits=F,this.setTexture2D=k,this.setTexture2DArray=j,this.setTexture3D=ee,this.setTextureCube=ce,this.rebindTextures=rt,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=Vt,this.updateMultisampleRenderTarget=fn,this.setupDepthRenderbuffer=ht,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Xt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function X2(n,e){function t(i,r=Br){let o;const a=Ze.getTransfer(r);if(i===Vn)return n.UNSIGNED_BYTE;if(i===um)return n.UNSIGNED_SHORT_4_4_4_4;if(i===fm)return n.UNSIGNED_SHORT_5_5_5_1;if(i===ry)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===oy)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===ny)return n.BYTE;if(i===iy)return n.SHORT;if(i===yl)return n.UNSIGNED_SHORT;if(i===dm)return n.INT;if(i===qi)return n.UNSIGNED_INT;if(i===Si)return n.FLOAT;if(i===mr)return n.HALF_FLOAT;if(i===ay)return n.ALPHA;if(i===sy)return n.RGB;if(i===Mi)return n.RGBA;if(i===gr)return n.DEPTH_COMPONENT;if(i===Mo)return n.DEPTH_STENCIL;if(i===pm)return n.RED;if(i===hm)return n.RED_INTEGER;if(i===Bo)return n.RG;if(i===mm)return n.RG_INTEGER;if(i===gm)return n.RGBA_INTEGER;if(i===ed||i===td||i===nd||i===id)if(a===dt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(i===ed)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===td)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===nd)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===id)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(i===ed)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===td)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===nd)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===id)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Np||i===Fp||i===Up||i===kp)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(i===Np)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Fp)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Up)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===kp)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Bp||i===Op||i===zp||i===Hp||i===Wp||i===ud||i===Gp)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(i===Bp||i===Op)return a===dt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(i===zp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC;if(i===Hp)return o.COMPRESSED_R11_EAC;if(i===Wp)return o.COMPRESSED_SIGNED_R11_EAC;if(i===ud)return o.COMPRESSED_RG11_EAC;if(i===Gp)return o.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Vp||i===Xp||i===qp||i===$p||i===Yp||i===Kp||i===Zp||i===Jp||i===jp||i===Qp||i===eh||i===th||i===nh||i===ih)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(i===Vp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Xp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===qp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===$p)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Yp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Kp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Zp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Jp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===jp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Qp)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===eh)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===th)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===nh)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ih)return a===dt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===rh||i===oh||i===ah)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(i===rh)return a===dt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===oh)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ah)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===sh||i===lh||i===fd||i===ch)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(i===sh)return o.COMPRESSED_RED_RGTC1_EXT;if(i===lh)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===fd)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ch)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===wl?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const q2=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$2=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Y2{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new vy(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ci({vertexShader:q2,fragmentShader:$2,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Oe(new Ts(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class K2 extends Ko{constructor(e,t){super();const i=this;let r=null,o=1,a=null,s="local-floor",l=1,c=null,d=null,f=null,u=null,p=null,m=null;const b=typeof XRWebGLBinding<"u",g=new Y2,h={},_=t.getContextAttributes();let S=null,w=null;const A=[],M=[],C=new De;let v=null;const T=new Pn;T.viewport=new Rt;const P=new Pn;P.viewport=new Rt;const L=[T,P],B=new oM;let O=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let re=A[J];return re===void 0&&(re=new Xu,A[J]=re),re.getTargetRaySpace()},this.getControllerGrip=function(J){let re=A[J];return re===void 0&&(re=new Xu,A[J]=re),re.getGripSpace()},this.getHand=function(J){let re=A[J];return re===void 0&&(re=new Xu,A[J]=re),re.getHandSpace()};function F(J){const re=M.indexOf(J.inputSource);if(re===-1)return;const te=A[re];te!==void 0&&(te.update(J.inputSource,J.frame,c||a),te.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){r.removeEventListener("select",F),r.removeEventListener("selectstart",F),r.removeEventListener("selectend",F),r.removeEventListener("squeeze",F),r.removeEventListener("squeezestart",F),r.removeEventListener("squeezeend",F),r.removeEventListener("end",V),r.removeEventListener("inputsourceschange",X);for(let J=0;J<A.length;J++){const re=M[J];re!==null&&(M[J]=null,A[J].disconnect(re))}O=null,q=null,g.reset();for(const J in h)delete h[J];e.setRenderTarget(S),p=null,u=null,f=null,r=null,w=null,it.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){o=J,i.isPresenting===!0&&Ie("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){s=J,i.isPresenting===!0&&Ie("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return f===null&&b&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(J){if(r=J,r!==null){if(S=e.getRenderTarget(),r.addEventListener("select",F),r.addEventListener("selectstart",F),r.addEventListener("selectend",F),r.addEventListener("squeeze",F),r.addEventListener("squeezestart",F),r.addEventListener("squeezeend",F),r.addEventListener("end",V),r.addEventListener("inputsourceschange",X),_.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(C),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,Ne=null,ze=null;_.depth&&(ze=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=_.stencil?Mo:gr,Ne=_.stencil?wl:qi);const Ce={colorFormat:t.RGBA8,depthFormat:ze,scaleFactor:o};f=this.getBinding(),u=f.createProjectionLayer(Ce),r.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),w=new Vi(u.textureWidth,u.textureHeight,{format:Mi,type:Vn,depthTexture:new ls(u.textureWidth,u.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{const te={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:o};p=new XRWebGLLayer(r,t,te),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),w=new Vi(p.framebufferWidth,p.framebufferHeight,{format:Mi,type:Vn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(s),it.setContext(r),it.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function X(J){for(let re=0;re<J.removed.length;re++){const te=J.removed[re],Ne=M.indexOf(te);Ne>=0&&(M[Ne]=null,A[Ne].disconnect(te))}for(let re=0;re<J.added.length;re++){const te=J.added[re];let Ne=M.indexOf(te);if(Ne===-1){for(let Ce=0;Ce<A.length;Ce++)if(Ce>=M.length){M.push(te),Ne=Ce;break}else if(M[Ce]===null){M[Ce]=te,Ne=Ce;break}if(Ne===-1)break}const ze=A[Ne];ze&&ze.connect(te)}}const k=new R,j=new R;function ee(J,re,te){k.setFromMatrixPosition(re.matrixWorld),j.setFromMatrixPosition(te.matrixWorld);const Ne=k.distanceTo(j),ze=re.projectionMatrix.elements,Ce=te.projectionMatrix.elements,Ot=ze[14]/(ze[10]-1),$e=ze[14]/(ze[10]+1),ht=(ze[9]+1)/ze[5],rt=(ze[9]-1)/ze[5],Je=(ze[8]-1)/ze[0],Vt=(Ce[8]+1)/Ce[0],Kt=Ot*Je,nn=Ot*Vt,fn=Ne/(-Je+Vt),Dt=fn*-Je;if(re.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(Dt),J.translateZ(fn),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),ze[10]===-1)J.projectionMatrix.copy(re.projectionMatrix),J.projectionMatrixInverse.copy(re.projectionMatrixInverse);else{const Xt=Ot+fn,D=$e+fn,Un=Kt-Dt,ct=nn+(Ne-Dt),E=ht*$e/D*Xt,x=rt*$e/D*Xt;J.projectionMatrix.makePerspective(Un,ct,E,x,Xt,D),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function ce(J,re){re===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(re.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(r===null)return;let re=J.near,te=J.far;g.texture!==null&&(g.depthNear>0&&(re=g.depthNear),g.depthFar>0&&(te=g.depthFar)),B.near=P.near=T.near=re,B.far=P.far=T.far=te,(O!==B.near||q!==B.far)&&(r.updateRenderState({depthNear:B.near,depthFar:B.far}),O=B.near,q=B.far),B.layers.mask=J.layers.mask|6,T.layers.mask=B.layers.mask&-5,P.layers.mask=B.layers.mask&-3;const Ne=J.parent,ze=B.cameras;ce(B,Ne);for(let Ce=0;Ce<ze.length;Ce++)ce(ze[Ce],Ne);ze.length===2?ee(B,T,P):B.projectionMatrix.copy(T.projectionMatrix),me(J,B,Ne)};function me(J,re,te){te===null?J.matrix.copy(re.matrixWorld):(J.matrix.copy(te.matrixWorld),J.matrix.invert(),J.matrix.multiply(re.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(re.projectionMatrix),J.projectionMatrixInverse.copy(re.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ml*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=J)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(B)},this.getCameraTexture=function(J){return h[J]};let nt=null;function Pt(J,re){if(d=re.getViewerPose(c||a),m=re,d!==null){const te=d.views;p!==null&&(e.setRenderTargetFramebuffer(w,p.framebuffer),e.setRenderTarget(w));let Ne=!1;te.length!==B.cameras.length&&(B.cameras.length=0,Ne=!0);for(let $e=0;$e<te.length;$e++){const ht=te[$e];let rt=null;if(p!==null)rt=p.getViewport(ht);else{const Vt=f.getViewSubImage(u,ht);rt=Vt.viewport,$e===0&&(e.setRenderTargetTextures(w,Vt.colorTexture,Vt.depthStencilTexture),e.setRenderTarget(w))}let Je=L[$e];Je===void 0&&(Je=new Pn,Je.layers.enable($e),Je.viewport=new Rt,L[$e]=Je),Je.matrix.fromArray(ht.transform.matrix),Je.matrix.decompose(Je.position,Je.quaternion,Je.scale),Je.projectionMatrix.fromArray(ht.projectionMatrix),Je.projectionMatrixInverse.copy(Je.projectionMatrix).invert(),Je.viewport.set(rt.x,rt.y,rt.width,rt.height),$e===0&&(B.matrix.copy(Je.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Ne===!0&&B.cameras.push(Je)}const ze=r.enabledFeatures;if(ze&&ze.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&b){f=i.getBinding();const $e=f.getDepthInformation(te[0]);$e&&$e.isValid&&$e.texture&&g.init($e,r.renderState)}if(ze&&ze.includes("camera-access")&&b){e.state.unbindTexture(),f=i.getBinding();for(let $e=0;$e<te.length;$e++){const ht=te[$e].camera;if(ht){let rt=h[ht];rt||(rt=new vy,h[ht]=rt);const Je=f.getCameraImage(ht);rt.sourceTexture=Je}}}}for(let te=0;te<A.length;te++){const Ne=M[te],ze=A[te];Ne!==null&&ze!==void 0&&ze.update(Ne,re,c||a)}nt&&nt(J,re),re.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:re}),m=null}const it=new Ey;it.setAnimationLoop(Pt),this.setAnimationLoop=function(J){nt=J},this.dispose=function(){}}}const Z2=new at,Py=new ke;Py.set(-1,0,0,0,1,0,0,0,1);function J2(n,e){function t(g,h){g.matrixAutoUpdate===!0&&g.updateMatrix(),h.value.copy(g.matrix)}function i(g,h){h.color.getRGB(g.fogColor.value,yy(n)),h.isFog?(g.fogNear.value=h.near,g.fogFar.value=h.far):h.isFogExp2&&(g.fogDensity.value=h.density)}function r(g,h,_,S,w){h.isNodeMaterial?h.uniformsNeedUpdate=!1:h.isMeshBasicMaterial?o(g,h):h.isMeshLambertMaterial?(o(g,h),h.envMap&&(g.envMapIntensity.value=h.envMapIntensity)):h.isMeshToonMaterial?(o(g,h),f(g,h)):h.isMeshPhongMaterial?(o(g,h),d(g,h),h.envMap&&(g.envMapIntensity.value=h.envMapIntensity)):h.isMeshStandardMaterial?(o(g,h),u(g,h),h.isMeshPhysicalMaterial&&p(g,h,w)):h.isMeshMatcapMaterial?(o(g,h),m(g,h)):h.isMeshDepthMaterial?o(g,h):h.isMeshDistanceMaterial?(o(g,h),b(g,h)):h.isMeshNormalMaterial?o(g,h):h.isLineBasicMaterial?(a(g,h),h.isLineDashedMaterial&&s(g,h)):h.isPointsMaterial?l(g,h,_,S):h.isSpriteMaterial?c(g,h):h.isShadowMaterial?(g.color.value.copy(h.color),g.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function o(g,h){g.opacity.value=h.opacity,h.color&&g.diffuse.value.copy(h.color),h.emissive&&g.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(g.map.value=h.map,t(h.map,g.mapTransform)),h.alphaMap&&(g.alphaMap.value=h.alphaMap,t(h.alphaMap,g.alphaMapTransform)),h.bumpMap&&(g.bumpMap.value=h.bumpMap,t(h.bumpMap,g.bumpMapTransform),g.bumpScale.value=h.bumpScale,h.side===Nn&&(g.bumpScale.value*=-1)),h.normalMap&&(g.normalMap.value=h.normalMap,t(h.normalMap,g.normalMapTransform),g.normalScale.value.copy(h.normalScale),h.side===Nn&&g.normalScale.value.negate()),h.displacementMap&&(g.displacementMap.value=h.displacementMap,t(h.displacementMap,g.displacementMapTransform),g.displacementScale.value=h.displacementScale,g.displacementBias.value=h.displacementBias),h.emissiveMap&&(g.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,g.emissiveMapTransform)),h.specularMap&&(g.specularMap.value=h.specularMap,t(h.specularMap,g.specularMapTransform)),h.alphaTest>0&&(g.alphaTest.value=h.alphaTest);const _=e.get(h),S=_.envMap,w=_.envMapRotation;S&&(g.envMap.value=S,g.envMapRotation.value.setFromMatrix4(Z2.makeRotationFromEuler(w)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Py),g.reflectivity.value=h.reflectivity,g.ior.value=h.ior,g.refractionRatio.value=h.refractionRatio),h.lightMap&&(g.lightMap.value=h.lightMap,g.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,g.lightMapTransform)),h.aoMap&&(g.aoMap.value=h.aoMap,g.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,g.aoMapTransform))}function a(g,h){g.diffuse.value.copy(h.color),g.opacity.value=h.opacity,h.map&&(g.map.value=h.map,t(h.map,g.mapTransform))}function s(g,h){g.dashSize.value=h.dashSize,g.totalSize.value=h.dashSize+h.gapSize,g.scale.value=h.scale}function l(g,h,_,S){g.diffuse.value.copy(h.color),g.opacity.value=h.opacity,g.size.value=h.size*_,g.scale.value=S*.5,h.map&&(g.map.value=h.map,t(h.map,g.uvTransform)),h.alphaMap&&(g.alphaMap.value=h.alphaMap,t(h.alphaMap,g.alphaMapTransform)),h.alphaTest>0&&(g.alphaTest.value=h.alphaTest)}function c(g,h){g.diffuse.value.copy(h.color),g.opacity.value=h.opacity,g.rotation.value=h.rotation,h.map&&(g.map.value=h.map,t(h.map,g.mapTransform)),h.alphaMap&&(g.alphaMap.value=h.alphaMap,t(h.alphaMap,g.alphaMapTransform)),h.alphaTest>0&&(g.alphaTest.value=h.alphaTest)}function d(g,h){g.specular.value.copy(h.specular),g.shininess.value=Math.max(h.shininess,1e-4)}function f(g,h){h.gradientMap&&(g.gradientMap.value=h.gradientMap)}function u(g,h){g.metalness.value=h.metalness,h.metalnessMap&&(g.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,g.metalnessMapTransform)),g.roughness.value=h.roughness,h.roughnessMap&&(g.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,g.roughnessMapTransform)),h.envMap&&(g.envMapIntensity.value=h.envMapIntensity)}function p(g,h,_){g.ior.value=h.ior,h.sheen>0&&(g.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),g.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(g.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,g.sheenColorMapTransform)),h.sheenRoughnessMap&&(g.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,g.sheenRoughnessMapTransform))),h.clearcoat>0&&(g.clearcoat.value=h.clearcoat,g.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(g.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,g.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(g.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Nn&&g.clearcoatNormalScale.value.negate())),h.dispersion>0&&(g.dispersion.value=h.dispersion),h.iridescence>0&&(g.iridescence.value=h.iridescence,g.iridescenceIOR.value=h.iridescenceIOR,g.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(g.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,g.iridescenceMapTransform)),h.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),h.transmission>0&&(g.transmission.value=h.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),h.transmissionMap&&(g.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,g.transmissionMapTransform)),g.thickness.value=h.thickness,h.thicknessMap&&(g.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=h.attenuationDistance,g.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(g.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(g.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=h.specularIntensity,g.specularColor.value.copy(h.specularColor),h.specularColorMap&&(g.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,g.specularColorMapTransform)),h.specularIntensityMap&&(g.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,h){h.matcap&&(g.matcap.value=h.matcap)}function b(g,h){const _=e.get(h).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function j2(n,e,t,i){let r={},o={},a=[];const s=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,A){const M=A.program;i.uniformBlockBinding(w,M)}function c(w,A){let M=r[w.id];M===void 0&&(g(w),M=d(w),r[w.id]=M,w.addEventListener("dispose",_));const C=A.program;i.updateUBOMapping(w,C);const v=e.render.frame;o[w.id]!==v&&(u(w),o[w.id]=v)}function d(w){const A=f();w.__bindingPointIndex=A;const M=n.createBuffer(),C=w.__size,v=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,C,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,A,M),M}function f(){for(let w=0;w<s;w++)if(a.indexOf(w)===-1)return a.push(w),w;return Ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(w){const A=r[w.id],M=w.uniforms,C=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,A);for(let v=0,T=M.length;v<T;v++){const P=M[v];if(Array.isArray(P))for(let L=0,B=P.length;L<B;L++)p(P[L],v,L,C);else p(P,v,0,C)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(w,A,M,C){if(b(w,A,M,C)===!0){const v=w.__offset,T=w.value;if(Array.isArray(T)){let P=0;for(let L=0;L<T.length;L++){const B=T[L],O=h(B);m(B,w.__data,P),typeof B!="number"&&typeof B!="boolean"&&!B.isMatrix3&&!ArrayBuffer.isView(B)&&(P+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(T,w.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,w.__data)}}function m(w,A,M){typeof w=="number"||typeof w=="boolean"?A[0]=w:w.isMatrix3?(A[0]=w.elements[0],A[1]=w.elements[1],A[2]=w.elements[2],A[3]=0,A[4]=w.elements[3],A[5]=w.elements[4],A[6]=w.elements[5],A[7]=0,A[8]=w.elements[6],A[9]=w.elements[7],A[10]=w.elements[8],A[11]=0):ArrayBuffer.isView(w)?A.set(new w.constructor(w.buffer,w.byteOffset,A.length)):w.toArray(A,M)}function b(w,A,M,C){const v=w.value,T=A+"_"+M;if(C[T]===void 0)return typeof v=="number"||typeof v=="boolean"?C[T]=v:ArrayBuffer.isView(v)?C[T]=v.slice():C[T]=v.clone(),!0;{const P=C[T];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return C[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function g(w){const A=w.uniforms;let M=0;const C=16;for(let T=0,P=A.length;T<P;T++){const L=Array.isArray(A[T])?A[T]:[A[T]];for(let B=0,O=L.length;B<O;B++){const q=L[B],F=Array.isArray(q.value)?q.value:[q.value];for(let V=0,X=F.length;V<X;V++){const k=F[V],j=h(k),ee=M%C,ce=ee%j.boundary,me=ee+ce;M+=ce,me!==0&&C-me<j.storage&&(M+=C-me),q.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=M,M+=j.storage}}}const v=M%C;return v>0&&(M+=C-v),w.__size=M,w.__cache={},this}function h(w){const A={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(A.boundary=4,A.storage=4):w.isVector2?(A.boundary=8,A.storage=8):w.isVector3||w.isColor?(A.boundary=16,A.storage=12):w.isVector4?(A.boundary=16,A.storage=16):w.isMatrix3?(A.boundary=48,A.storage=48):w.isMatrix4?(A.boundary=64,A.storage=64):w.isTexture?Ie("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(w)?(A.boundary=16,A.storage=w.byteLength):Ie("WebGLRenderer: Unsupported uniform value type.",w),A}function _(w){const A=w.target;A.removeEventListener("dispose",_);const M=a.indexOf(A.__bindingPointIndex);a.splice(M,1),n.deleteBuffer(r[A.id]),delete r[A.id],delete o[A.id]}function S(){for(const w in r)n.deleteBuffer(r[w]);a=[],r={},o={}}return{bind:l,update:c,dispose:S}}const Q2=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Ni=null;function eC(){return Ni===null&&(Ni=new my(Q2,16,16,Bo,mr),Ni.name="DFG_LUT",Ni.minFilter=sn,Ni.magFilter=sn,Ni.wrapS=En,Ni.wrapT=En,Ni.generateMipmaps=!1,Ni.needsUpdate=!0),Ni}class Rm{constructor(e={}){const{canvas:t=t1(),context:i=null,depth:r=!0,stencil:o=!1,alpha:a=!1,antialias:s=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:u=!1,outputBufferType:p=Vn}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;const b=p,g=new Set([gm,mm,hm]),h=new Set([Vn,qi,yl,wl,um,fm]),_=new Uint32Array(4),S=new Int32Array(4),w=new R;let A=null,M=null;const C=[],v=[];let T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Gi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let L=!1,B=null,O=null,q=null,F=null;this._outputColorSpace=st;let V=0,X=0,k=null,j=-1,ee=null;const ce=new Rt,me=new Rt;let nt=null;const Pt=new Ae(0);let it=0,J=t.width,re=t.height,te=1,Ne=null,ze=null;const Ce=new Rt(0,0,J,re),Ot=new Rt(0,0,J,re);let $e=!1;const ht=new Mm;let rt=!1,Je=!1;const Vt=new at,Kt=new R,nn=new Rt,fn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Dt=!1;function Xt(){return k===null?te:1}let D=i;function Un(y,N){return t.getContext(y,N)}try{const y={alpha:!0,depth:r,stencil:o,antialias:s,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${cm}`),t.addEventListener("webglcontextlost",Nt,!1),t.addEventListener("webglcontextrestored",yt,!1),t.addEventListener("webglcontextcreationerror",Li,!1),D===null){const N="webgl2";if(D=Un(N,y),D===null)throw Un(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(y){throw Ke("WebGLRenderer: "+y.message),y}let ct,E,x,U,W,$,ne,oe,Y,Z,ae,Se,de,se,Te,Re,He,I,ie,K,le,he,Q;function _e(){ct=new eA(D),ct.init(),le=new X2(D,ct),E=new qT(D,ct,e,le),x=new G2(D,ct),E.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),O=D.createFramebuffer(),q=D.createFramebuffer(),F=D.createFramebuffer(),U=new iA(D),W=new R2,$=new V2(D,ct,x,W,E,le,U),ne=new QT(P),oe=new sM(D),he=new VT(D,oe),Y=new tA(D,oe,U,he),Z=new oA(D,Y,oe,he,U),I=new rA(D,E,$),Te=new $T(W),ae=new C2(P,ne,ct,E,he,Te),Se=new J2(P,W),de=new I2,se=new k2(ct),He=new GT(P,ne,x,Z,m,l),Re=new W2(P,Z,E),Q=new j2(D,U,E,x),ie=new XT(D,ct,U),K=new nA(D,ct,U),U.programs=ae.programs,P.capabilities=E,P.extensions=ct,P.properties=W,P.renderLists=de,P.shadowMap=Re,P.state=x,P.info=U}_e(),b!==Vn&&(T=new sA(b,t.width,t.height,s,r,o));const ve=new K2(P,D);this.xr=ve,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const y=ct.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=ct.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(y){y!==void 0&&(te=y,this.setSize(J,re,!1))},this.getSize=function(y){return y.set(J,re)},this.setSize=function(y,N,G=!0){if(ve.isPresenting){Ie("WebGLRenderer: Can't change size while VR device is presenting.");return}J=y,re=N,t.width=Math.floor(y*te),t.height=Math.floor(N*te),G===!0&&(t.style.width=y+"px",t.style.height=N+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,y,N)},this.getDrawingBufferSize=function(y){return y.set(J*te,re*te).floor()},this.setDrawingBufferSize=function(y,N,G){J=y,re=N,te=G,t.width=Math.floor(y*G),t.height=Math.floor(N*G),this.setViewport(0,0,y,N)},this.setEffects=function(y){if(b===Vn){Ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let N=0;N<y.length;N++)if(y[N].isOutputPass===!0){Ie("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(ce)},this.getViewport=function(y){return y.copy(Ce)},this.setViewport=function(y,N,G,z){y.isVector4?Ce.set(y.x,y.y,y.z,y.w):Ce.set(y,N,G,z),x.viewport(ce.copy(Ce).multiplyScalar(te).round())},this.getScissor=function(y){return y.copy(Ot)},this.setScissor=function(y,N,G,z){y.isVector4?Ot.set(y.x,y.y,y.z,y.w):Ot.set(y,N,G,z),x.scissor(me.copy(Ot).multiplyScalar(te).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(y){x.setScissorTest($e=y)},this.setOpaqueSort=function(y){Ne=y},this.setTransparentSort=function(y){ze=y},this.getClearColor=function(y){return y.copy(He.getClearColor())},this.setClearColor=function(){He.setClearColor(...arguments)},this.getClearAlpha=function(){return He.getClearAlpha()},this.setClearAlpha=function(){He.setClearAlpha(...arguments)},this.clear=function(y=!0,N=!0,G=!0){let z=0;if(y){let H=!1;if(k!==null){const pe=k.texture.format;H=g.has(pe)}if(H){const pe=k.texture.type,be=h.has(pe),fe=He.getClearColor(),ye=He.getClearAlpha(),Me=fe.r,We=fe.g,Xe=fe.b;be?(_[0]=Me,_[1]=We,_[2]=Xe,_[3]=ye,D.clearBufferuiv(D.COLOR,0,_)):(S[0]=Me,S[1]=We,S[2]=Xe,S[3]=ye,D.clearBufferiv(D.COLOR,0,S))}else z|=D.COLOR_BUFFER_BIT}N&&(z|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),G&&(z|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&D.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),B=y},this.dispose=function(){t.removeEventListener("webglcontextlost",Nt,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",Li,!1),He.dispose(),de.dispose(),se.dispose(),W.dispose(),ne.dispose(),Z.dispose(),he.dispose(),Q.dispose(),ae.dispose(),ve.dispose(),ve.removeEventListener("sessionstart",Gg),ve.removeEventListener("sessionend",Vg),so.stop()};function Nt(y){y.preventDefault(),gd("WebGLRenderer: Context Lost."),L=!0}function yt(){gd("WebGLRenderer: Context Restored."),L=!1;const y=U.autoReset,N=Re.enabled,G=Re.autoUpdate,z=Re.needsUpdate,H=Re.type;_e(),U.autoReset=y,Re.enabled=N,Re.autoUpdate=G,Re.needsUpdate=z,Re.type=H}function Li(y){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Ii(y){const N=y.target;N.removeEventListener("dispose",Ii),uS(N)}function uS(y){fS(y),W.remove(y)}function fS(y){const N=W.get(y).programs;N!==void 0&&(N.forEach(function(G){ae.releaseProgram(G)}),y.isShaderMaterial&&ae.releaseShaderCache(y))}this.renderBufferDirect=function(y,N,G,z,H,pe){N===null&&(N=fn);const be=H.isMesh&&H.matrixWorld.determinantAffine()<0,fe=mS(y,N,G,z,H);x.setMaterial(z,be);let ye=G.index,Me=1;if(z.wireframe===!0){if(ye=Y.getWireframeAttribute(G),ye===void 0)return;Me=2}const We=G.drawRange,Xe=G.attributes.position;let Ee=We.start*Me,pt=(We.start+We.count)*Me;pe!==null&&(Ee=Math.max(Ee,pe.start*Me),pt=Math.min(pt,(pe.start+pe.count)*Me)),ye!==null?(Ee=Math.max(Ee,0),pt=Math.min(pt,ye.count)):Xe!=null&&(Ee=Math.max(Ee,0),pt=Math.min(pt,Xe.count));const zt=pt-Ee;if(zt<0||zt===1/0)return;he.setup(H,z,fe,G,ye);let Ft,mt=ie;if(ye!==null&&(Ft=oe.get(ye),mt=K,mt.setIndex(Ft)),H.isMesh)z.wireframe===!0?(x.setLineWidth(z.wireframeLinewidth*Xt()),mt.setMode(D.LINES)):mt.setMode(D.TRIANGLES);else if(H.isLine){let xn=z.linewidth;xn===void 0&&(xn=1),x.setLineWidth(xn*Xt()),H.isLineSegments?mt.setMode(D.LINES):H.isLineLoop?mt.setMode(D.LINE_LOOP):mt.setMode(D.LINE_STRIP)}else H.isPoints?mt.setMode(D.POINTS):H.isSprite&&mt.setMode(D.TRIANGLES);if(H.isBatchedMesh)if(ct.get("WEBGL_multi_draw"))mt.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const xn=H._multiDrawStarts,ge=H._multiDrawCounts,On=H._multiDrawCount,je=ye?oe.get(ye).bytesPerElement:1,Kn=W.get(z).currentProgram.getUniforms();for(let Pi=0;Pi<On;Pi++)Kn.setValue(D,"_gl_DrawID",Pi),mt.render(xn[Pi]/je,ge[Pi])}else if(H.isInstancedMesh)mt.renderInstances(Ee,zt,H.count);else if(G.isInstancedBufferGeometry){const xn=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,ge=Math.min(G.instanceCount,xn);mt.renderInstances(Ee,zt,ge)}else mt.render(Ee,zt)};function Wg(y,N,G){y.transparent===!0&&y.side===jt&&y.forceSinglePass===!1?(y.side=Nn,y.needsUpdate=!0,ic(y,N,G),y.side=eo,y.needsUpdate=!0,ic(y,N,G),y.side=jt):ic(y,N,G)}this.compile=function(y,N,G=null){G===null&&(G=y),M=se.get(G),M.init(N),v.push(M),G.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(M.pushLight(H),H.castShadow&&M.pushShadow(H))}),y!==G&&y.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(M.pushLight(H),H.castShadow&&M.pushShadow(H))}),M.setupLights();const z=new Set;return y.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const pe=H.material;if(pe)if(Array.isArray(pe))for(let be=0;be<pe.length;be++){const fe=pe[be];Wg(fe,G,H),z.add(fe)}else Wg(pe,G,H),z.add(pe)}),M=v.pop(),z},this.compileAsync=function(y,N,G=null){const z=this.compile(y,N,G);return new Promise(H=>{function pe(){if(z.forEach(function(be){W.get(be).currentProgram.isReady()&&z.delete(be)}),z.size===0){H(y);return}setTimeout(pe,10)}ct.get("KHR_parallel_shader_compile")!==null?pe():setTimeout(pe,10)})};let Nu=null;function pS(y){Nu&&Nu(y)}function Gg(){so.stop()}function Vg(){so.start()}const so=new Ey;so.setAnimationLoop(pS),typeof self<"u"&&so.setContext(self),this.setAnimationLoop=function(y){Nu=y,ve.setAnimationLoop(y),y===null?so.stop():so.start()},ve.addEventListener("sessionstart",Gg),ve.addEventListener("sessionend",Vg),this.render=function(y,N){if(N!==void 0&&N.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;B!==null&&B.renderStart(y,N);const G=ve.enabled===!0&&ve.isPresenting===!0,z=T!==null&&(k===null||G)&&T.begin(P,k);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),ve.enabled===!0&&ve.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(ve.cameraAutoUpdate===!0&&ve.updateCamera(N),N=ve.getCamera()),y.isScene===!0&&y.onBeforeRender(P,y,N,k),M=se.get(y,v.length),M.init(N),M.state.textureUnits=$.getTextureUnits(),v.push(M),Vt.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),ht.setFromProjectionMatrix(Vt,zi,N.reversedDepth),Je=this.localClippingEnabled,rt=Te.init(this.clippingPlanes,Je),A=de.get(y,C.length),A.init(),C.push(A),ve.enabled===!0&&ve.isPresenting===!0){const be=P.xr.getDepthSensingMesh();be!==null&&Fu(be,N,-1/0,P.sortObjects)}Fu(y,N,0,P.sortObjects),A.finish(),P.sortObjects===!0&&A.sort(Ne,ze,N.reversedDepth),Dt=ve.enabled===!1||ve.isPresenting===!1||ve.hasDepthSensing()===!1,Dt&&He.addToRenderList(A,y),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),rt===!0&&Te.beginShadows();const H=M.state.shadowsArray;if(Re.render(H,y,N),rt===!0&&Te.endShadows(),(z&&T.hasRenderPass())===!1){const be=A.opaque,fe=A.transmissive;if(M.setupLights(),N.isArrayCamera){const ye=N.cameras;if(fe.length>0)for(let Me=0,We=ye.length;Me<We;Me++){const Xe=ye[Me];qg(be,fe,y,Xe)}Dt&&He.render(y);for(let Me=0,We=ye.length;Me<We;Me++){const Xe=ye[Me];Xg(A,y,Xe,Xe.viewport)}}else fe.length>0&&qg(be,fe,y,N),Dt&&He.render(y),Xg(A,y,N)}k!==null&&X===0&&($.updateMultisampleRenderTarget(k),$.updateRenderTargetMipmap(k)),z&&T.end(P),y.isScene===!0&&y.onAfterRender(P,y,N),he.resetDefaultState(),j=-1,ee=null,v.pop(),v.length>0?(M=v[v.length-1],$.setTextureUnits(M.state.textureUnits),rt===!0&&Te.setGlobalState(P.clippingPlanes,M.state.camera)):M=null,C.pop(),C.length>0?A=C[C.length-1]:A=null,B!==null&&B.renderEnd()};function Fu(y,N,G,z){if(y.visible===!1)return;if(y.layers.test(N.layers)){if(y.isGroup)G=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(N);else if(y.isLightProbeGrid)M.pushLightProbeGrid(y);else if(y.isLight)M.pushLight(y),y.castShadow&&M.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||ht.intersectsSprite(y)){z&&nn.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Vt);const be=Z.update(y),fe=y.material;fe.visible&&A.push(y,be,fe,G,nn.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||ht.intersectsObject(y))){const be=Z.update(y),fe=y.material;if(z&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),nn.copy(y.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),nn.copy(be.boundingSphere.center)),nn.applyMatrix4(y.matrixWorld).applyMatrix4(Vt)),Array.isArray(fe)){const ye=be.groups;for(let Me=0,We=ye.length;Me<We;Me++){const Xe=ye[Me],Ee=fe[Xe.materialIndex];Ee&&Ee.visible&&A.push(y,be,Ee,G,nn.z,Xe)}}else fe.visible&&A.push(y,be,fe,G,nn.z,null)}}const pe=y.children;for(let be=0,fe=pe.length;be<fe;be++)Fu(pe[be],N,G,z)}function Xg(y,N,G,z){const{opaque:H,transmissive:pe,transparent:be}=y;M.setupLightsView(G),rt===!0&&Te.setGlobalState(P.clippingPlanes,G),z&&x.viewport(ce.copy(z)),H.length>0&&nc(H,N,G),pe.length>0&&nc(pe,N,G),be.length>0&&nc(be,N,G),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function qg(y,N,G,z){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[z.id]===void 0){const Ee=ct.has("EXT_color_buffer_half_float")||ct.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[z.id]=new Vi(1,1,{generateMipmaps:!0,type:Ee?mr:Vn,minFilter:So,samples:Math.max(4,E.samples),stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace})}const pe=M.state.transmissionRenderTarget[z.id],be=z.viewport||ce;pe.setSize(be.z*P.transmissionResolutionScale,be.w*P.transmissionResolutionScale);const fe=P.getRenderTarget(),ye=P.getActiveCubeFace(),Me=P.getActiveMipmapLevel();P.setRenderTarget(pe),P.getClearColor(Pt),it=P.getClearAlpha(),it<1&&P.setClearColor(16777215,.5),P.clear(),Dt&&He.render(G);const We=P.toneMapping;P.toneMapping=Gi;const Xe=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),M.setupLightsView(z),rt===!0&&Te.setGlobalState(P.clippingPlanes,z),nc(y,G,z),$.updateMultisampleRenderTarget(pe),$.updateRenderTargetMipmap(pe),ct.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let pt=0,zt=N.length;pt<zt;pt++){const Ft=N[pt],{object:mt,geometry:xn,material:ge,group:On}=Ft;if(ge.side===jt&&mt.layers.test(z.layers)){const je=ge.side;ge.side=Nn,ge.needsUpdate=!0,$g(mt,G,z,xn,ge,On),ge.side=je,ge.needsUpdate=!0,Ee=!0}}Ee===!0&&($.updateMultisampleRenderTarget(pe),$.updateRenderTargetMipmap(pe))}P.setRenderTarget(fe,ye,Me),P.setClearColor(Pt,it),Xe!==void 0&&(z.viewport=Xe),P.toneMapping=We}function nc(y,N,G){const z=N.isScene===!0?N.overrideMaterial:null;for(let H=0,pe=y.length;H<pe;H++){const be=y[H],{object:fe,geometry:ye,group:Me}=be;let We=be.material;We.allowOverride===!0&&z!==null&&(We=z),fe.layers.test(G.layers)&&$g(fe,N,G,ye,We,Me)}}function $g(y,N,G,z,H,pe){y.onBeforeRender(P,N,G,z,H,pe),y.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),H.onBeforeRender(P,N,G,z,y,pe),H.transparent===!0&&H.side===jt&&H.forceSinglePass===!1?(H.side=Nn,H.needsUpdate=!0,P.renderBufferDirect(G,N,z,H,y,pe),H.side=eo,H.needsUpdate=!0,P.renderBufferDirect(G,N,z,H,y,pe),H.side=jt):P.renderBufferDirect(G,N,z,H,y,pe),y.onAfterRender(P,N,G,z,H,pe)}function ic(y,N,G){N.isScene!==!0&&(N=fn);const z=W.get(y),H=M.state.lights,pe=M.state.shadowsArray,be=H.state.version,fe=ae.getParameters(y,H.state,pe,N,G,M.state.lightProbeGridArray),ye=ae.getProgramCacheKey(fe);let Me=z.programs;z.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?N.environment:null,z.fog=N.fog;const We=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;z.envMap=ne.get(y.envMap||z.environment,We),z.envMapRotation=z.environment!==null&&y.envMap===null?N.environmentRotation:y.envMapRotation,Me===void 0&&(y.addEventListener("dispose",Ii),Me=new Map,z.programs=Me);let Xe=Me.get(ye);if(Xe!==void 0){if(z.currentProgram===Xe&&z.lightsStateVersion===be)return Kg(y,fe),Xe}else fe.uniforms=ae.getUniforms(y),B!==null&&y.isNodeMaterial&&B.build(y,G,fe),y.onBeforeCompile(fe,P),Xe=ae.acquireProgram(fe,ye),Me.set(ye,Xe),z.uniforms=fe.uniforms;const Ee=z.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Ee.clippingPlanes=Te.uniform),Kg(y,fe),z.needsLights=xS(y),z.lightsStateVersion=be,z.needsLights&&(Ee.ambientLightColor.value=H.state.ambient,Ee.lightProbe.value=H.state.probe,Ee.directionalLights.value=H.state.directional,Ee.directionalLightShadows.value=H.state.directionalShadow,Ee.spotLights.value=H.state.spot,Ee.spotLightShadows.value=H.state.spotShadow,Ee.rectAreaLights.value=H.state.rectArea,Ee.ltc_1.value=H.state.rectAreaLTC1,Ee.ltc_2.value=H.state.rectAreaLTC2,Ee.pointLights.value=H.state.point,Ee.pointLightShadows.value=H.state.pointShadow,Ee.hemisphereLights.value=H.state.hemi,Ee.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ee.spotLightMatrix.value=H.state.spotLightMatrix,Ee.spotLightMap.value=H.state.spotLightMap,Ee.pointShadowMatrix.value=H.state.pointShadowMatrix),z.lightProbeGrid=M.state.lightProbeGridArray.length>0,z.currentProgram=Xe,z.uniformsList=null,Xe}function Yg(y){if(y.uniformsList===null){const N=y.currentProgram.getUniforms();y.uniformsList=rd.seqWithValue(N.seq,y.uniforms)}return y.uniformsList}function Kg(y,N){const G=W.get(y);G.outputColorSpace=N.outputColorSpace,G.batching=N.batching,G.batchingColor=N.batchingColor,G.instancing=N.instancing,G.instancingColor=N.instancingColor,G.instancingMorph=N.instancingMorph,G.skinning=N.skinning,G.morphTargets=N.morphTargets,G.morphNormals=N.morphNormals,G.morphColors=N.morphColors,G.morphTargetsCount=N.morphTargetsCount,G.numClippingPlanes=N.numClippingPlanes,G.numIntersection=N.numClipIntersection,G.vertexAlphas=N.vertexAlphas,G.vertexTangents=N.vertexTangents,G.toneMapping=N.toneMapping}function hS(y,N){if(y.length===0)return null;if(y.length===1)return y[0].texture!==null?y[0]:null;w.setFromMatrixPosition(N.matrixWorld);for(let G=0,z=y.length;G<z;G++){const H=y[G];if(H.texture!==null&&H.boundingBox.containsPoint(w))return H}return null}function mS(y,N,G,z,H){N.isScene!==!0&&(N=fn),$.resetTextureUnits();const pe=N.fog,be=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?N.environment:null,fe=k===null?P.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Ze.workingColorSpace,ye=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Me=ne.get(z.envMap||be,ye),We=z.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Xe=!!G.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ee=!!G.morphAttributes.position,pt=!!G.morphAttributes.normal,zt=!!G.morphAttributes.color;let Ft=Gi;z.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Ft=P.toneMapping);const mt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,xn=mt!==void 0?mt.length:0,ge=W.get(z),On=M.state.lights;if(rt===!0&&(Je===!0||y!==ee)){const wt=y===ee&&z.id===j;Te.setState(z,y,wt)}let je=!1;z.version===ge.__version?(ge.needsLights&&ge.lightsStateVersion!==On.state.version||ge.outputColorSpace!==fe||H.isBatchedMesh&&ge.batching===!1||!H.isBatchedMesh&&ge.batching===!0||H.isBatchedMesh&&ge.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&ge.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&ge.instancing===!1||!H.isInstancedMesh&&ge.instancing===!0||H.isSkinnedMesh&&ge.skinning===!1||!H.isSkinnedMesh&&ge.skinning===!0||H.isInstancedMesh&&ge.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&ge.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&ge.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&ge.instancingMorph===!1&&H.morphTexture!==null||ge.envMap!==Me||z.fog===!0&&ge.fog!==pe||ge.numClippingPlanes!==void 0&&(ge.numClippingPlanes!==Te.numPlanes||ge.numIntersection!==Te.numIntersection)||ge.vertexAlphas!==We||ge.vertexTangents!==Xe||ge.morphTargets!==Ee||ge.morphNormals!==pt||ge.morphColors!==zt||ge.toneMapping!==Ft||ge.morphTargetsCount!==xn||!!ge.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(je=!0):(je=!0,ge.__version=z.version);let Kn=ge.currentProgram;je===!0&&(Kn=ic(z,N,H),B&&z.isNodeMaterial&&B.onUpdateProgram(z,Kn,ge));let Pi=!1,Mr=!1,ia=!1;const gt=Kn.getUniforms(),Ht=ge.uniforms;if(x.useProgram(Kn.program)&&(Pi=!0,Mr=!0,ia=!0),z.id!==j&&(j=z.id,Mr=!0),ge.needsLights){const wt=hS(M.state.lightProbeGridArray,H);ge.lightProbeGrid!==wt&&(ge.lightProbeGrid=wt,Mr=!0)}if(Pi||ee!==y){x.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),gt.setValue(D,"projectionMatrix",y.projectionMatrix),gt.setValue(D,"viewMatrix",y.matrixWorldInverse);const Tr=gt.map.cameraPosition;Tr!==void 0&&Tr.setValue(D,Kt.setFromMatrixPosition(y.matrixWorld)),E.logarithmicDepthBuffer&&gt.setValue(D,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&gt.setValue(D,"isOrthographic",y.isOrthographicCamera===!0),ee!==y&&(ee=y,Mr=!0,ia=!0)}if(ge.needsLights&&(On.state.directionalShadowMap.length>0&&gt.setValue(D,"directionalShadowMap",On.state.directionalShadowMap,$),On.state.spotShadowMap.length>0&&gt.setValue(D,"spotShadowMap",On.state.spotShadowMap,$),On.state.pointShadowMap.length>0&&gt.setValue(D,"pointShadowMap",On.state.pointShadowMap,$)),H.isSkinnedMesh){gt.setOptional(D,H,"bindMatrix"),gt.setOptional(D,H,"bindMatrixInverse");const wt=H.skeleton;wt&&(wt.boneTexture===null&&wt.computeBoneTexture(),gt.setValue(D,"boneTexture",wt.boneTexture,$))}H.isBatchedMesh&&(gt.setOptional(D,H,"batchingTexture"),gt.setValue(D,"batchingTexture",H._matricesTexture,$),gt.setOptional(D,H,"batchingIdTexture"),gt.setValue(D,"batchingIdTexture",H._indirectTexture,$),gt.setOptional(D,H,"batchingColorTexture"),H._colorsTexture!==null&&gt.setValue(D,"batchingColorTexture",H._colorsTexture,$));const Er=G.morphAttributes;if((Er.position!==void 0||Er.normal!==void 0||Er.color!==void 0)&&I.update(H,G,Kn),(Mr||ge.receiveShadow!==H.receiveShadow)&&(ge.receiveShadow=H.receiveShadow,gt.setValue(D,"receiveShadow",H.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&N.environment!==null&&(Ht.envMapIntensity.value=N.environmentIntensity),Ht.dfgLUT!==void 0&&(Ht.dfgLUT.value=eC()),Mr){if(gt.setValue(D,"toneMappingExposure",P.toneMappingExposure),ge.needsLights&&gS(Ht,ia),pe&&z.fog===!0&&Se.refreshFogUniforms(Ht,pe),Se.refreshMaterialUniforms(Ht,z,te,re,M.state.transmissionRenderTarget[y.id]),ge.needsLights&&ge.lightProbeGrid){const wt=ge.lightProbeGrid;Ht.probesSH.value=wt.texture,Ht.probesMin.value.copy(wt.boundingBox.min),Ht.probesMax.value.copy(wt.boundingBox.max),Ht.probesResolution.value.copy(wt.resolution)}rd.upload(D,Yg(ge),Ht,$)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(rd.upload(D,Yg(ge),Ht,$),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&gt.setValue(D,"center",H.center),gt.setValue(D,"modelViewMatrix",H.modelViewMatrix),gt.setValue(D,"normalMatrix",H.normalMatrix),gt.setValue(D,"modelMatrix",H.matrixWorld),z.uniformsGroups!==void 0){const wt=z.uniformsGroups;for(let Tr=0,ra=wt.length;Tr<ra;Tr++){const Zg=wt[Tr];Q.update(Zg,Kn),Q.bind(Zg,Kn)}}return Kn}function gS(y,N){y.ambientLightColor.needsUpdate=N,y.lightProbe.needsUpdate=N,y.directionalLights.needsUpdate=N,y.directionalLightShadows.needsUpdate=N,y.pointLights.needsUpdate=N,y.pointLightShadows.needsUpdate=N,y.spotLights.needsUpdate=N,y.spotLightShadows.needsUpdate=N,y.rectAreaLights.needsUpdate=N,y.hemisphereLights.needsUpdate=N}function xS(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(y,N,G){const z=W.get(y);z.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),W.get(y.texture).__webglTexture=N,W.get(y.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:G,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,N){const G=W.get(y);G.__webglFramebuffer=N,G.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(y,N=0,G=0){k=y,V=N,X=G;let z=null,H=!1,pe=!1;if(y){const fe=W.get(y);if(fe.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(D.FRAMEBUFFER,fe.__webglFramebuffer),ce.copy(y.viewport),me.copy(y.scissor),nt=y.scissorTest,x.viewport(ce),x.scissor(me),x.setScissorTest(nt),j=-1;return}else if(fe.__webglFramebuffer===void 0)$.setupRenderTarget(y);else if(fe.__hasExternalTextures)$.rebindTextures(y,W.get(y.texture).__webglTexture,W.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const We=y.depthTexture;if(fe.__boundDepthTexture!==We){if(We!==null&&W.has(We)&&(y.width!==We.image.width||y.height!==We.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(y)}}const ye=y.texture;(ye.isData3DTexture||ye.isDataArrayTexture||ye.isCompressedArrayTexture)&&(pe=!0);const Me=W.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Me[N])?z=Me[N][G]:z=Me[N],H=!0):y.samples>0&&$.useMultisampledRTT(y)===!1?z=W.get(y).__webglMultisampledFramebuffer:Array.isArray(Me)?z=Me[G]:z=Me,ce.copy(y.viewport),me.copy(y.scissor),nt=y.scissorTest}else ce.copy(Ce).multiplyScalar(te).floor(),me.copy(Ot).multiplyScalar(te).floor(),nt=$e;if(G!==0&&(z=O),x.bindFramebuffer(D.FRAMEBUFFER,z)&&x.drawBuffers(y,z),x.viewport(ce),x.scissor(me),x.setScissorTest(nt),H){const fe=W.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+N,fe.__webglTexture,G)}else if(pe){const fe=N;for(let ye=0;ye<y.textures.length;ye++){const Me=W.get(y.textures[ye]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+ye,Me.__webglTexture,G,fe)}}else if(y!==null&&G!==0){const fe=W.get(y.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,fe.__webglTexture,G)}j=-1},this.readRenderTargetPixels=function(y,N,G,z,H,pe,be,fe=0){if(!(y&&y.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=W.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&be!==void 0&&(ye=ye[be]),ye){x.bindFramebuffer(D.FRAMEBUFFER,ye);try{const Me=y.textures[fe],We=Me.format,Xe=Me.type;if(y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+fe),!E.textureFormatReadable(We)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!E.textureTypeReadable(Xe)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=y.width-z&&G>=0&&G<=y.height-H&&D.readPixels(N,G,z,H,le.convert(We),le.convert(Xe),pe)}finally{const Me=k!==null?W.get(k).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,Me)}}},this.readRenderTargetPixelsAsync=async function(y,N,G,z,H,pe,be,fe=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=W.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&be!==void 0&&(ye=ye[be]),ye)if(N>=0&&N<=y.width-z&&G>=0&&G<=y.height-H){x.bindFramebuffer(D.FRAMEBUFFER,ye);const Me=y.textures[fe],We=Me.format,Xe=Me.type;if(y.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+fe),!E.textureFormatReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!E.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ee=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ee),D.bufferData(D.PIXEL_PACK_BUFFER,pe.byteLength,D.STREAM_READ),D.readPixels(N,G,z,H,le.convert(We),le.convert(Xe),0);const pt=k!==null?W.get(k).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,pt);const zt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await n1(D,zt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ee),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,pe),D.deleteBuffer(Ee),D.deleteSync(zt),pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,N=null,G=0){const z=Math.pow(2,-G),H=Math.floor(y.image.width*z),pe=Math.floor(y.image.height*z),be=N!==null?N.x:0,fe=N!==null?N.y:0;$.setTexture2D(y,0),D.copyTexSubImage2D(D.TEXTURE_2D,G,0,0,be,fe,H,pe),x.unbindTexture()},this.copyTextureToTexture=function(y,N,G=null,z=null,H=0,pe=0){let be,fe,ye,Me,We,Xe,Ee,pt,zt;const Ft=y.isCompressedTexture?y.mipmaps[pe]:y.image;if(G!==null)be=G.max.x-G.min.x,fe=G.max.y-G.min.y,ye=G.isBox3?G.max.z-G.min.z:1,Me=G.min.x,We=G.min.y,Xe=G.isBox3?G.min.z:0;else{const Ht=Math.pow(2,-H);be=Math.floor(Ft.width*Ht),fe=Math.floor(Ft.height*Ht),y.isDataArrayTexture?ye=Ft.depth:y.isData3DTexture?ye=Math.floor(Ft.depth*Ht):ye=1,Me=0,We=0,Xe=0}z!==null?(Ee=z.x,pt=z.y,zt=z.z):(Ee=0,pt=0,zt=0);const mt=le.convert(N.format),xn=le.convert(N.type);let ge;N.isData3DTexture?($.setTexture3D(N,0),ge=D.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?($.setTexture2DArray(N,0),ge=D.TEXTURE_2D_ARRAY):($.setTexture2D(N,0),ge=D.TEXTURE_2D),x.activeTexture(D.TEXTURE0),x.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,N.flipY),x.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),x.pixelStorei(D.UNPACK_ALIGNMENT,N.unpackAlignment);const On=x.getParameter(D.UNPACK_ROW_LENGTH),je=x.getParameter(D.UNPACK_IMAGE_HEIGHT),Kn=x.getParameter(D.UNPACK_SKIP_PIXELS),Pi=x.getParameter(D.UNPACK_SKIP_ROWS),Mr=x.getParameter(D.UNPACK_SKIP_IMAGES);x.pixelStorei(D.UNPACK_ROW_LENGTH,Ft.width),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ft.height),x.pixelStorei(D.UNPACK_SKIP_PIXELS,Me),x.pixelStorei(D.UNPACK_SKIP_ROWS,We),x.pixelStorei(D.UNPACK_SKIP_IMAGES,Xe);const ia=y.isDataArrayTexture||y.isData3DTexture,gt=N.isDataArrayTexture||N.isData3DTexture;if(y.isDepthTexture){const Ht=W.get(y),Er=W.get(N),wt=W.get(Ht.__renderTarget),Tr=W.get(Er.__renderTarget);x.bindFramebuffer(D.READ_FRAMEBUFFER,wt.__webglFramebuffer),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,Tr.__webglFramebuffer);for(let ra=0;ra<ye;ra++)ia&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(y).__webglTexture,H,Xe+ra),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(N).__webglTexture,pe,zt+ra)),D.blitFramebuffer(Me,We,be,fe,Ee,pt,be,fe,D.DEPTH_BUFFER_BIT,D.NEAREST);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(H!==0||y.isRenderTargetTexture||W.has(y)){const Ht=W.get(y),Er=W.get(N);x.bindFramebuffer(D.READ_FRAMEBUFFER,q),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,F);for(let wt=0;wt<ye;wt++)ia?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ht.__webglTexture,H,Xe+wt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ht.__webglTexture,H),gt?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Er.__webglTexture,pe,zt+wt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Er.__webglTexture,pe),H!==0?D.blitFramebuffer(Me,We,be,fe,Ee,pt,be,fe,D.COLOR_BUFFER_BIT,D.NEAREST):gt?D.copyTexSubImage3D(ge,pe,Ee,pt,zt+wt,Me,We,be,fe):D.copyTexSubImage2D(ge,pe,Ee,pt,Me,We,be,fe);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else gt?y.isDataTexture||y.isData3DTexture?D.texSubImage3D(ge,pe,Ee,pt,zt,be,fe,ye,mt,xn,Ft.data):N.isCompressedArrayTexture?D.compressedTexSubImage3D(ge,pe,Ee,pt,zt,be,fe,ye,mt,Ft.data):D.texSubImage3D(ge,pe,Ee,pt,zt,be,fe,ye,mt,xn,Ft):y.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,pe,Ee,pt,be,fe,mt,xn,Ft.data):y.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,pe,Ee,pt,Ft.width,Ft.height,mt,Ft.data):D.texSubImage2D(D.TEXTURE_2D,pe,Ee,pt,be,fe,mt,xn,Ft);x.pixelStorei(D.UNPACK_ROW_LENGTH,On),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,je),x.pixelStorei(D.UNPACK_SKIP_PIXELS,Kn),x.pixelStorei(D.UNPACK_SKIP_ROWS,Pi),x.pixelStorei(D.UNPACK_SKIP_IMAGES,Mr),pe===0&&N.generateMipmaps&&D.generateMipmap(ge),x.unbindTexture()},this.initRenderTarget=function(y){W.get(y).__webglFramebuffer===void 0&&$.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?$.setTextureCube(y,0):y.isData3DTexture?$.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?$.setTexture2DArray(y,0):$.setTexture2D(y,0),x.unbindTexture()},this.resetState=function(){V=0,X=0,k=null,x.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}}const Dy=new ft(1,1,1);function fx(n,e=0){const t=Math.sin(n*127.1+e*311.7)*43758.5453123;return t-Math.floor(t)}function Lm(n,e,t=45,i=1){const o=document.createElement("canvas");o.width=16,o.height=16;const a=o.getContext("2d");a.imageSmoothingEnabled=!1,a.fillStyle=n,a.fillRect(0,0,16,16);for(let l=0;l<t;l++){const c=Math.floor(fx(l+i,i*3.17)*16),d=Math.floor(fx(l+i*7.1,i*5.3)*16);a.fillStyle=e[l%e.length],a.fillRect(c,d,1,1),l%13===0&&a.fillRect((c+1)%16,d,1,1)}const s=new jo(o);return s.magFilter=Fe,s.minFilter=Fe,s.colorSpace=st,s}function Lt(n,e=n){const t=new As().load(n,i=>{i.needsUpdate=!0},void 0,i=>{console.error(`[WebMinecraftT] Failed to load texture: ${e}`,i)});return t.magFilter=Fe,t.minFilter=Fe,t.wrapS=En,t.wrapT=En,t.colorSpace=st,t.needsUpdate=!0,t}const It=n=>`/WebMinecraftT/textures/${encodeURIComponent(n)}`,tC=Lt(It("Grass_Block_(top_texture)_JE2.png")),nC=Lt(It("grass_block_side.png")),iC=Lt(It("dirt.png")),rC=Lt(It("oak_log.png")),oC=Lt(It("oak_log_top.png")),aC=Lt(It("stone.png")),sC=Lt(It("cobblestone.png"),"cobblestone"),lC=Lm("#74716a",["#5e5b54","#858178","#626057","#918d82"],80,19),cC=Lm("#b9a568",["#a89155","#c9b77a","#9d864c","#d0c18b"],54,14),dC=Lm("#a9966a",["#988455","#b9a878","#8f7b49","#c5b58a"],42,20),uC=Lt(It("bedrock.png"),"bedrock"),fC=Lt(It("coal_ore.png"),"coal ore"),pC=Lt(It("iron_ore.png"),"iron ore"),hC=Lt(It("oak_planks.png"),"oak planks"),mC=Lt(It("oak-leaves-normal-original-default.png")),gC=Lt(It("snow.png"),"snow"),xC=Lt(It("tnt_bottom.png"),"TNT bottom"),bC=Lt(It("tnt_side.png"),"TNT side"),vC=Lt(It("tnt_top.png"),"TNT top"),yC=Lt(It("bricks.png"),"bricks"),wC=Lt(It("stone_bricks.png"),"stone bricks"),_C=Lt(It("cracked_stone_bricks.png"),"cracked stone bricks"),SC=Lt(It("mossy_stone_bricks.png"),"mossy stone bricks"),MC=Lt(It("dirt_path_side.png"),"dirt path side"),EC=Lt(It("dirt_path_top.png"),"dirt path top"),_t=Lt(It("Water_(texture)_JE4.png"),"Water texture"),Bt=14211288,Im=8750469,Ny=2763306,Fy=.32,Ct={vertexColors:!0,emissive:Ny,emissiveIntensity:Fy},TC=new lt({map:tC,color:Im,...Ct}),Pc=new lt({map:nC,color:Im,...Ct}),lu=new lt({map:iC,color:Im,...Ct}),ql=new lt({map:aC,color:Bt,...Ct}),Pm=new lt({map:sC,color:Bt,...Ct}),$l=new lt({map:lC,color:Bt,...Ct}),cu=new lt({map:cC,color:Bt,...Ct}),Dm=new lt({map:dC,color:Bt,...Ct}),Nm=new lt({map:uC,color:Bt,...Ct}),Fm=new lt({map:fC,color:Bt,...Ct}),Um=new lt({map:pC,color:Bt,...Ct}),Dc=new lt({map:rC,color:Bt,...Ct}),px=new lt({map:oC,color:Bt,...Ct}),km=new lt({map:hC,color:Bt,...Ct}),Bm=new lt({map:yC,color:Bt,...Ct}),Om=new lt({map:wC,color:Bt,...Ct}),zm=new lt({map:_C,color:Bt,...Ct}),Hm=new lt({map:SC,color:Bt,...Ct}),$s=new lt({map:MC,color:Bt,...Ct}),AC=new lt({map:EC,color:Bt,...Ct}),Wm=new lt({map:mC,transparent:!1,opacity:1,alphaTest:.1,depthWrite:!0,depthTest:!0,side:jt,vertexColors:!0,color:Bt,emissive:Ny,emissiveIntensity:Fy}),Gm=new lt({map:gC,color:Bt,...Ct}),tl=new lt({map:bC,color:Bt,...Ct}),Uy=new lt({map:vC,color:Bt,...Ct}),ky=new lt({map:xC,color:Bt,...Ct});new lt({map:_t,color:3968960,transparent:!0,opacity:.76,depthWrite:!1,side:jt,emissive:730162,emissiveIntensity:.18});const wd=[Pc,Pc,TC,lu,Pc,Pc],_d=[Dc,Dc,px,px,Dc,Dc],Vm=[tl,tl,Uy,ky,tl,tl],Xm=[$s,$s,AC,$s,$s,$s],we=19,By=128,Ri=-32,Yi=16,Rs=Ri+By-1,Or=6,hx=Or+2,xe={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,OAK:5,LEAVES:6,COBBLESTONE:7,GRAVEL:8,SANDSTONE:9,BEDROCK:10,COAL_ORE:11,IRON_ORE:12,OAK_PLANKS:13,SNOW:14,TNT:15,OAK_DOOR:17,BRICKS:18,STONE_BRICKS:19,CRACKED_STONE_BRICKS:20,MOSSY_STONE_BRICKS:21,DIRT_PATH:22},CC="webminecraft-world-type-",RC=20;function LC(){try{const n=new Uint32Array(2);return crypto.getRandomValues(n),n[0]*4096+(n[1]>>>20)>>>0}catch{return Math.floor(Math.random()*4294967296)>>>0}}let Kr=LC();function wr(){try{return localStorage.getItem(`${CC}${Kr}`)==="flat"}catch{return!1}}function du(n){const e=Number(n);return Number.isFinite(e)&&(Kr=Math.floor(Math.abs(e))>>>0),Kr}const ci=new Map,El=new Map,Po=[],Tl=new Set,qm=new Map;let Zr=null,hh=1/0,mh=1/0;const Oy=[wd[0],wd[2],lu,ql,cu,_d[0],_d[2],Wm,Pm,$l,Dm,Nm,Fm,Um,km,Gm,tl,Uy,ky,Bm,Om,zm,Hm,Xm],IC=new lt({color:16777215,vertexColors:!0,transparent:!0,opacity:.56,depthWrite:!1,side:jt,shininess:120,specular:15268095,flatShading:!1}),PC=[{normal:[1,0,0],corners:[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]},{normal:[-1,0,0],corners:[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]},{normal:[0,1,0],corners:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},{normal:[0,-1,0],corners:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]},{normal:[0,0,1],corners:[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]]},{normal:[0,0,-1],corners:[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]}];function xr(n,e){return`${n},${e}`}function Yl(n,e){const t=Math.floor(n/we),i=Math.floor(e/we),r=(Math.floor(n)%we+we)%we,o=(Math.floor(e)%we+we)%we;return{chunkX:t,chunkZ:i,localX:r,localZ:o}}function Kl(n,e,t){return(e-Ri)*we*we+t*we+n}function vo(n,e){return ci.get(xr(n,e))}function qn(n,e,t=0){let i=Math.imul((n|0)^2654435769,374761393);return i=Math.imul(i^(e|0),668265263),i=Math.imul(i^Kr+t,1274126177),i^=i>>>13,i=Math.imul(i,1103515245),i^=i>>>16,(i>>>0)/4294967295}function jn(n,e,t,i=0){let r=Math.imul((n|0)^2654435769,374761393);return r=Math.imul(r^(e|0),668265263),r=Math.imul(r^(t|0),2147483647),r=Math.imul(r^Kr+i,1274126177),r^=r>>>13,r=Math.imul(r,1103515245),r^=r>>>16,(r>>>0)/4294967295}function pl(n){return n*n*(3-2*n)}function Ui(n,e,t){return n+(e-n)*t}function DC(n,e,t=1,i=0){const r=n/t,o=e/t,a=Math.floor(r),s=Math.floor(o),l=pl(r-a),c=pl(o-s);return Ui(Ui(qn(a,s,i),qn(a+1,s,i),l),Ui(qn(a,s+1,i),qn(a+1,s+1,i),l),c)}function NC(n,e,t,i=1,r=0){const o=n/i,a=e/i,s=t/i,l=Math.floor(o),c=Math.floor(a),d=Math.floor(s),f=pl(o-l),u=pl(a-c),p=pl(s-d),m=jn(l,c,d,r),b=jn(l+1,c,d,r),g=jn(l,c+1,d,r),h=jn(l+1,c+1,d,r),_=jn(l,c,d+1,r),S=jn(l+1,c,d+1,r),w=jn(l,c+1,d+1,r),A=jn(l+1,c+1,d+1,r),M=Ui(m,b,f),C=Ui(g,h,f),v=Ui(_,S,f),T=Ui(w,A,f),P=Ui(M,C,u),L=Ui(v,T,u);return Ui(P,L,p)}function Xr(n,e,t,i,r,o){let a=0,s=1,l=1,c=0;for(let d=0;d<t;d++)a+=DC(n,e,i/l,o+d*101)*s,c+=s,s*=r,l*=2;return a/c}function Sd(n,e,t,i,r,o,a){let s=0,l=1,c=1,d=0;for(let f=0;f<i;f++)s+=NC(n,e,t,r/c,a+f*83)*l,d+=l,l*=o,c*=2;return s/d}function zy(n,e){return{temperature:Xr(n+900,e-1200,3,420,.55,11),humidity:Xr(n-1700,e+600,3,360,.58,29)}}function gh(n,e){if(wr())return"plains";const{temperature:t,humidity:i}=zy(n,e),r=Xr(n+300,e+700,2,220,.55,47);return t<.24?i>.45?"snow":"tundra":t>.86&&i<.24?r>.72?"badlands":"desert":i>.79?"forest":i<.12?"plains":r>.88&&t>.58?"desert":i>.54?"forest":"plains"}function ds(n,e){if(wr())return{height:RC,continentalness:1,erosion:0,peaks:0,detail:0};const t=Xr(n,e,4,320,.52,61),i=Xr(n+1400,e-800,3,160,.54,73),r=Xr(n-600,e+1100,4,120,.5,89),o=Xr(n+2400,e-1700,3,28,.5,97);let a=21+(t-.5)*21;a+=(.5-i)*10;const s=Math.max(0,(r-.57)/.43);a+=s*s*30,a+=(o-.5)*5;const l=Math.max(0,.09-t)/.09;return a-=l*4,{height:Math.floor(Be.clamp(a,Ri+4,Rs-8)),continentalness:t,erosion:i,peaks:r,detail:o}}function FC(n,e,t,i){if(wr()||e>i-6||e>42||e<Ri+3)return!1;const r=i-e,o=Sd(n,e,t,3,44,.55,121),a=Sd(n,e,t,2,24,.53,157);return r>22&&o>.67&&o<.78||r>9&&Math.abs(a-.5)<.032}function mx(n,e,t,i,r){return Sd(n,e,t,2,r,.55,i)}function nl(n,e,t,i){if(wr())return xe.STONE;const r=jn(n,e,t,911),o=Sd(n,e,t,2,13,.55,313);if(e<i-3){if(e<=18&&mx(n,e,t,211,22)>.765)return xe.IRON_ORE;if(e>-8&&mx(n+73,e-19,t-51,239,16)>.79)return xe.COAL_ORE;if(r>.93&&o>.57)return xe.COBBLESTONE;if(o<.2)return xe.GRAVEL}return xe.STONE}function UC(n,e,t,i){const r=i-e,o=jn(n,e,t,1701),a=jn(n,e,t,1707);return r<=0?o<.72?xe.DIRT:o<.94?xe.SAND:xe.STONE:r<=4?a<.64?xe.DIRT:a<.88?xe.SAND:xe.STONE:a<.46?xe.DIRT:a<.67?xe.SAND:nl(n,e,t,i)}function kC(n,e,t,i,r){if(wr())return e===t?xe.GRASS:e>=t-3?xe.DIRT:xe.STONE;const o=t<Yi,a=!o&&t<=Yi+1;if(o)return UC(i,e,r,t);if(n==="desert")return e>=t-4?xe.SAND:e>=t-7?xe.SANDSTONE:nl(i,e,r,t);if(n==="badlands")return e===t?xe.SAND:e>=t-5?xe.SANDSTONE:nl(i,e,r,t);if(n==="snow"||n==="tundra")return e===t?xe.SNOW:e>=t-4?xe.DIRT:nl(i,e,r,t);if(a){if(e>=t-1)return xe.SAND;if(e===t-2)return xe.SANDSTONE}return e===t?xe.GRASS:e>=t-3?xe.DIRT:nl(i,e,r,t)}function ar(n,e,t,i){if(e<Ri||e>Rs)return!1;const{chunkX:r,chunkZ:o,localX:a,localZ:s}=Yl(n,t),l=vo(r,o);return l?(l.blocks[Kl(a,e,s)]=i,!0):!1}function uu(n,e,t){if(n=Math.floor(n),e=Math.floor(e),t=Math.floor(t),e<Ri||e>Rs)return xe.AIR;const{chunkX:i,chunkZ:r,localX:o,localZ:a}=Yl(n,t),s=vo(i,r);return s&&s.blocks[Kl(o,e,a)]||xe.AIR}function Pe(n,e,t){return uu(n,e,t)}function vt(){return{...xe}}function BC(n,e,t){if(wr())return!1;const i=ds(Math.floor(n),Math.floor(t));if(i.height>=Yi)return!1;const r=Yi+.42,o=i.height+.5;return e<r-.02&&e>o+.05}function gx(n,e){if(wr())return 0;const{temperature:t,humidity:i}=zy(n,e);if(t<.28||i<.3)return 0;const r=Be.clamp((i-.34)/.34,0,1),o=qn(n,e,1201),a=qn(n+137,e-411,1207),s=i>.6?.18+r*.14:.045+r*.045;return o*.78+a*.22<s?1:0}function OC(n,e,t){const i=qn(n,t,1301),r=qn(n,t,1303),o=qn(n,t,1307),a=4+Math.floor(i*4),s=r>.78?3:r>.38?2:1,l=o>.68?4:o>.32?3:2;for(let d=0;d<a;d++)ar(n,e+d,t,xe.OAK);const c=e+a-1;for(let d=0;d<l;d++){const f=c-d,u=d===l-1?Math.max(1,s-1):s;for(let p=-u;p<=u;p++)for(let m=-u;m<=u;m++){const b=Math.sqrt(p*p+m*m),g=qn(n+p*31+d*17,t+m*37-d*11,1313),h=u+.35+g*.35;b>h||d===0&&p===0&&m===0||ar(n+p,f,t+m,xe.LEAVES)}}ar(n,c+1,t,xe.LEAVES),o>.56&&(ar(n-1,c,t,xe.LEAVES),ar(n+1,c,t,xe.LEAVES)),s>=3&&r>.86&&(ar(n,c-1,t-2,xe.LEAVES),ar(n,c-1,t+2,xe.LEAVES))}function zC(n){const e=n.x*we,t=n.z*we;for(let i=0;i<we;i++)for(let r=0;r<we;r++){const o=e+i,a=t+r,s=gh(o,a),l=ds(o,a).height;for(let c=Ri;c<=l;c++){let d=c===Ri?xe.BEDROCK:kC(s,c,l,o,a);d!==xe.BEDROCK&&FC(o,c,a,l)&&(d=xe.AIR),ar(o,c,a,d)}}if(!wr())for(let i=0;i<we;i++)for(let r=0;r<we;r++){const o=e+i,a=t+r,s=gh(o,a),l=ds(o,a).height;if(l<=Yi+1||s==="desert"||s==="badlands"||s==="snow"||s==="tundra")continue;if(Xr(o-400,a+900,2,11,.55,1409)>.82){const d=2+Math.floor(qn(o,a,1411)*2);for(let f=0;f<d;f++)uu(o,l-f,a)===xe.DIRT&&ar(o,l-f,a,xe.GRASS)}}}function HC(n){if(wr())return;const e=n.x*we,t=n.z*we;for(let i=2;i<we-2;i++)for(let r=2;r<we-2;r++){const o=e+i,a=t+r,s=gh(o,a);if(s!=="forest"&&s!=="plains")continue;const l=ds(o,a).height;if(l<Yi+1||uu(o,l,a)!==xe.GRASS||!gx(o,a))continue;let c=!1;for(let d=-1;d<=1&&!c;d++)for(let f=-1;f<=1;f++)if(!(d===0&&f===0)&&gx(o+d,a+f)&&qn(o+d,a+f,1417)>.48){c=!0;break}c||OC(o,l+1,a)}}function WC(n){for(const[e,t]of qm){const[i,r,o]=e.split(",").map(Number);if(!Number.isFinite(i)||!Number.isFinite(r)||!Number.isFinite(o)||Math.floor(i/we)!==n.x||Math.floor(o/we)!==n.z||r<Ri||r>Rs)continue;const a=(i%we+we)%we,s=(o%we+we)%we;n.blocks[Kl(a,r,s)]=t}}function Hy(n,e){const t=xr(n,e);if(ci.has(t))return ci.get(t);const i={x:n,z:e,blocks:new Uint8Array(we*we*By),generated:!1,waterMesh:null};return ci.set(t,i),zC(i),HC(i),WC(i),i.generated=!0,i}function GC(n,e){switch(n){case xe.GRASS:return e===2?1:e===3?2:0;case xe.DIRT:return 2;case xe.STONE:return 3;case xe.SAND:return 4;case xe.OAK:return e===2||e===3?6:5;case xe.LEAVES:return 7;case xe.COBBLESTONE:return 8;case xe.GRAVEL:return 9;case xe.SANDSTONE:return 10;case xe.BEDROCK:return 11;case xe.COAL_ORE:return 12;case xe.IRON_ORE:return 13;case xe.OAK_PLANKS:return 14;case xe.SNOW:return 15;case xe.TNT:return e===2?17:e===3?18:16;case xe.BRICKS:return 19;case xe.STONE_BRICKS:return 20;case xe.CRACKED_STONE_BRICKS:return 21;case xe.MOSSY_STONE_BRICKS:return 22;case xe.DIRT_PATH:return 23;default:return 0}}function xx(n){return n!==xe.AIR&&n!==xe.OAK_DOOR}function VC(n,e,t,i){if(n>=Yi||e>n)return 1;const r=Math.max(0,Yi-(e+.5)),o=Be.clamp(r/24,0,1),a=Be.lerp(1,.43,o),s=.96+jn(t,e,i,1911)*.06;return Be.clamp(a*s,.4,1)}function XC(n){const e=[],t=[],i=[],r=[],o=Array.from({length:Oy.length},()=>[]);let a=0;for(let c=0;c<we;c++)for(let d=0;d<we;d++){const f=n.x*we+c,u=n.z*we+d,p=ds(f,u).height;for(let m=Ri;m<=Rs;m++){const b=n.blocks[Kl(c,m,d)];if(!xx(b))continue;const g=VC(p,m,f,u);for(let h=0;h<6;h++){const _=PC[h],S=uu(f+_.normal[0],m+_.normal[1],u+_.normal[2]);if(xx(S)&&S!==xe.LEAVES)continue;const w=a;for(const M of _.corners)e.push(f+M[0],m+M[1],u+M[2]),t.push(_.normal[0],_.normal[1],_.normal[2]),r.push(g,g,g);i.push(0,0,0,1,1,1,1,0);const A=GC(b,h);o[A].push(w,w+1,w+2,w,w+2,w+3),a+=4}}}if(a===0)return null;const s=new un;s.setAttribute("position",new Mt(e,3)),s.setAttribute("normal",new Mt(t,3)),s.setAttribute("uv",new Mt(i,2)),s.setAttribute("color",new Mt(r,3));const l=[];for(let c=0;c<o.length;c++){const d=l.length;l.push(...o[c]),o[c].length&&s.addGroup(d,o[c].length,c)}return s.setIndex(l),s.computeBoundingSphere(),s.computeBoundingBox(),s}function qC(n){const e=[],t=[],i=[],r=[],o=[];let a=0;const s=n.x*we,l=n.z*we;for(let d=0;d<we;d++)for(let f=0;f<we;f++){const u=s+d,p=l+f;if(ds(u,p).height>=Yi)continue;const b=Yi+.42,g=Math.sin((u+p)*.19)*.042,h=Math.sin(u*.31-p*.17+1.7)*.025,_=Math.cos(u*.13+p*.27-.6)*.02,S=a;e.push(u-.5,b+g+_,p-.5,u-.5,b+h,p+.5,u+.5,b-g+_*.5,p+.5,u+.5,b-h,p-.5),t.push(0,1,0,0,1,0,0,1,0,0,1,0);const w=.94+qn(u,p,1931)*.12;r.push(.16*w,.52*w,.8*w,.2*w,.59*w,.86*w,.13*w,.47*w,.75*w,.19*w,.56*w,.84*w),i.push(0,0,0,1,1,1,1,0),o.push(S,S+1,S+2,S,S+2,S+3),a+=4}if(a===0)return null;const c=new un;return c.setAttribute("position",new Mt(e,3)),c.setAttribute("normal",new Mt(t,3)),c.setAttribute("uv",new Mt(i,2)),c.setAttribute("color",new Mt(r,3)),c.setIndex(o),c.computeBoundingSphere(),c}function $m(n){if(!n||!Zr)return;const e=xr(n.x,n.z),t=El.get(e);t&&(Zr.remove(t),t.geometry.dispose(),El.delete(e)),n.waterMesh&&(Zr.remove(n.waterMesh),n.waterMesh.geometry.dispose(),n.waterMesh=null)}function yo(n){if(!n||!Zr)return;$m(n);const e=XC(n);if(e){const i=new Oe(e,Oy);i.userData.isChunk=!0,i.castShadow=!0,i.receiveShadow=!0,Zr.add(i),El.set(xr(n.x,n.z),i)}const t=qC(n);if(t){const i=new Oe(t,IC);i.userData.isChunk=!0,i.userData.isWater=!0,i.castShadow=!1,i.receiveShadow=!1,Zr.add(i),n.waterMesh=i}}function Wy(n,e){const t=[];for(let i=-Or;i<=Or;i++)for(let r=-Or;r<=Or;r++){if(Math.max(Math.abs(i),Math.abs(r))>Or)continue;const o=n+i,a=e+r,s=xr(o,a);ci.has(s)||Tl.has(s)||t.push({x:o,z:a,distance:Math.sqrt(i*i+r*r)})}t.sort((i,r)=>i.distance-r.distance);for(const i of t){const r=xr(i.x,i.z);Tl.add(r),Po.push(i)}}function $C(){const n=Po.shift();if(!n)return;const e=xr(n.x,n.z);if(Tl.delete(e),ci.has(e))return;const t=Hy(n.x,n.z);yo(t)}function YC(n,e){for(const[t,i]of ci)Math.max(Math.abs(i.x-n),Math.abs(i.z-e))>hx&&($m(i),ci.delete(t));for(let t=Po.length-1;t>=0;t--){const i=Po[t];Math.max(Math.abs(i.x-n),Math.abs(i.z-e))>hx&&(Tl.delete(xr(i.x,i.z)),Po.splice(t,1))}}function KC(n,e){if(!e)return;const t=new R;if(e.getWorldDirection(t),t.y=0,t.lengthSq()<1e-4)return;t.normalize();const i=Yl(n.x,n.z),r=Or+1;for(const o of ci.values()){const a=El.get(xr(o.x,o.z)),s=o.waterMesh;if(!a&&!s)continue;const l=o.x-i.chunkX,c=o.z-i.chunkZ;if(Math.max(Math.abs(l),Math.abs(c))>r){a&&(a.visible=!1),s&&(s.visible=!1);continue}const d=new R(l,0,c),f=d.length(),u=f<2.4||d.normalize().dot(t)>-.72;a&&(a.visible=u),s&&(s.visible=u)}}function An(n,e,t,i){if(n=Math.floor(n),e=Math.floor(e),t=Math.floor(t),i=Math.floor(Number(i)),![n,e,t,i].every(Number.isFinite)||e<Ri||e>Rs)return!1;qm.set(`${n},${e},${t}`,i);const{chunkX:r,chunkZ:o,localX:a,localZ:s}=Yl(n,t),l=vo(r,o);if(!l)return!0;if(l.blocks[Kl(a,e,s)]=i,yo(l),a===0){const c=vo(r-1,o);c&&yo(c)}if(a===we-1){const c=vo(r+1,o);c&&yo(c)}if(s===0){const c=vo(r,o-1);c&&yo(c)}if(s===we-1){const c=vo(r,o+1);c&&yo(c)}return!0}function Gy(){for(const n of ci.values())$m(n);ci.clear(),El.clear(),Po.length=0,Tl.clear(),qm.clear(),hh=1/0,mh=1/0}function Vy(n){Zr=n,Gy();for(let e=-1;e<=1;e++)for(let t=-1;t<=1;t++){const i=Hy(e,t);yo(i)}Wy(0,0)}function Xy(n,e){if(!Zr||!n)return;const{chunkX:t,chunkZ:i}=Yl(n.x,n.z);(t!==hh||i!==mh)&&(hh=t,mh=i,Wy(t,i),YC(t,i)),$C(),KC(n,e)}function ZC(){return{loadedChunks:ci.size,queuedChunks:Po.length,renderDistance:Or,seed:Kr}}function to(){return Kr}let Md=!1,sr=null,At=null,Ym="",vf=null,xh=null,bh=null,wo=!0,To=new Map,lr=0;function yf(n){window.__webMinecraftFirebaseLoads||(window.__webMinecraftFirebaseLoads=new Map);const e=window.__webMinecraftFirebaseLoads;if(e.has(n))return e.get(n);const t=new Promise((i,r)=>{const o=document.querySelector(`script[src="${n}"]`);if(o){if(n.includes("firebase-app-compat")?window.firebase:n.includes("firebase-auth-compat")?window.firebase?.auth:window.firebase?.firestore)return i();const l=()=>{o.removeEventListener("load",c),o.removeEventListener("error",d)},c=()=>{l(),i()},d=()=>{l(),r(new Error(`Could not load ${n}`))};o.addEventListener("load",c,{once:!0}),o.addEventListener("error",d,{once:!0});return}const a=document.createElement("script");a.src=n,a.async=!0,a.onload=()=>i(),a.onerror=()=>r(new Error(`Could not load ${n}`)),document.head.appendChild(a)});return e.set(n,t),t}function Km(n){let e=2166136261;for(const o of String(n))e^=o.charCodeAt(0),e=Math.imul(e,16777619);let t=e>>>0;const i="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let r="";for(let o=0;o<8;o++)t=Math.imul(t^t>>>13,1274126177)+1013904223>>>0,r+=i[t%i.length];return`${r.slice(0,4)}-${r.slice(4)}`}function Zm(){return Ym||(At?.uid?Km(At.uid):"")}async function JC(n){if(!n?.uid||!n?.email||!window.firebase?.firestore)return;const e=window.firebase.firestore(),t=Km(n.uid);Ym=t;try{await e.collection("profiles").doc(n.uid).set({uid:n.uid,email:n.email,displayName:n.displayName||"",photoURL:n.photoURL||"",updatedAt:new Date},{merge:!0}),await e.collection("publicProfiles").doc(n.uid).set({uid:n.uid,displayName:n.displayName||"Player",photoURL:n.photoURL||"",friendCode:t,updatedAt:new Date},{merge:!0})}catch(i){console.warn("Could not sync account profile:",i)}}async function qy(){if(Md)return!0;if(!mu())return!1;try{const n="12.18.0";if(await yf(`https://www.gstatic.com/firebasejs/${n}/firebase-app-compat.js`),!window.firebase)throw new Error("Firebase SDK did not load.");const e=window.firebase.apps||[];let t=e.length?e[0]:null;if(!t)t=window.firebase.initializeApp(xi);else{const i=t.options||{};if(!(i.apiKey===xi.apiKey&&i.authDomain===xi.authDomain&&i.projectId===xi.projectId&&i.appId===xi.appId)){try{await t.delete()}catch{}t=window.firebase.initializeApp(xi)}}return await Promise.all([yf(`https://www.gstatic.com/firebasejs/${n}/firebase-auth-compat.js`),yf(`https://www.gstatic.com/firebasejs/${n}/firebase-firestore-compat.js`)]),sr=window.firebase.auth(t),sr.onAuthStateChanged(i=>{At=i||null,Ym=At?Km(At.uid):"",wo=!0,To.clear(),lr=0,us(),i?(JC(i),nR(i)):(Yy(),vf&&clearTimeout(vf),vf=null),vh()}),Md=!0,!0}catch(n){return console.error("Firebase authentication setup failed:",n),!1}}function jC(){if(document.getElementById("accountStyles"))return;const n=document.createElement("style");n.id="accountStyles",n.textContent=`
#accountButton{position:fixed;top:92px;right:20px;left:auto;z-index:90;min-width:48px;height:48px;padding:0 10px;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:#4c4c4c;color:#fff;font:bold 13px Arial,sans-serif;cursor:pointer;box-shadow:0 3px 0 #171717;display:flex;align-items:center;justify-content:center;gap:7px}
#accountButton:hover{background:#5e5e5e}
.accountButtonAvatar{width:25px;height:25px;flex:0 0 25px;border-radius:50%;object-fit:cover;background:#4a4a4a;border:1px solid #111;box-shadow:1px 1px 0 rgba(0,0,0,.55)}
#accountButton.friendRequestAlert{animation:friendButtonPulse .75s steps(2,end) infinite}
.friendRequestBadge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;margin-left:0;padding:0 4px;border:2px solid #111;background:#b53a3a;color:#fff;font:bold 10px Arial,sans-serif;vertical-align:middle;box-shadow:1px 1px 0 #000}
#friendRequestToast{position:fixed;top:92px;right:20px;width:min(360px,calc(100vw - 40px));z-index:500;display:flex;align-items:center;gap:12px;padding:13px;background:linear-gradient(#3f3f3f,#292929);border:2px solid #111;border-top-color:#999;border-left-color:#999;box-shadow:5px 5px 0 rgba(0,0,0,.65);color:#fff;font-family:Arial,sans-serif;cursor:pointer;transform:translateX(calc(100% + 40px));opacity:0;pointer-events:none}
#friendRequestToast.show{animation:friendToastIn .28s cubic-bezier(.2,.9,.25,1) forwards}
#friendRequestToast.hide{animation:friendToastOut .22s ease forwards}
.friendToastIcon{width:42px;height:42px;flex:0 0 42px;display:flex;align-items:center;justify-content:center;background:#6d8d4e;border:2px solid #111;border-top-color:#a6c886;border-left-color:#a6c886;font:bold 22px Arial,sans-serif;box-shadow:2px 2px 0 #111}
.friendToastBody{min-width:0;flex:1}.friendToastTitle{font:15px MinecraftFont,monospace;text-shadow:2px 2px 0 #000;margin-bottom:4px}.friendToastText{font-size:12px;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.friendToastHint{margin-top:5px;color:#9dcc76;font-size:10px}
@keyframes friendToastIn{0%{transform:translateX(calc(100% + 40px));opacity:0}70%{transform:translateX(-8px);opacity:1}100%{transform:translateX(0);opacity:1}}
@keyframes friendToastOut{0%{transform:translateX(0);opacity:1}100%{transform:translateX(calc(100% + 40px));opacity:0}}
@keyframes friendButtonPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
#accountModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:250;padding:20px}
#accountPanel{width:min(480px,94vw);max-height:90vh;overflow:auto;background:linear-gradient(#282828,#1b1b1b);border:2px solid #101010;border-top-color:#707070;border-left-color:#707070;box-shadow:7px 7px 0 rgba(0,0,0,.55);padding:26px 24px 22px;color:#fff;font-family:Arial,sans-serif}
#accountTitle{margin:0 0 6px;font-family:MinecraftFont,monospace;font-size:28px;text-align:center;text-shadow:2px 2px 0 #000}
#accountSubtitle{margin:0 0 18px;color:#999;font-size:12px;text-align:center;line-height:1.45}
.accountField{display:block;box-sizing:border-box;width:100%;height:44px;margin:9px 0;padding:0 12px;background:#111;color:#fff;border:2px solid #080808;border-top-color:#777;border-left-color:#777;outline:none}
.accountField:focus{border-color:#84ad5e;box-shadow:0 0 0 2px rgba(132,173,94,.18)}
.accountAction{display:block;width:100%;min-height:44px;margin:9px 0;padding:10px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#6d6d6d,#505050);color:#fff;font-family:MinecraftFont,monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}
.accountAction:hover{filter:brightness(1.1)}
.accountPrimary{background:linear-gradient(#6d8d4e,#526f3c)}
.googleAction{background:#fff;color:#222;text-shadow:none;font-family:Arial,sans-serif;font-weight:700}
.oauthAction{font-family:Arial,sans-serif;font-weight:700;text-shadow:none;display:flex;align-items:center;justify-content:center;gap:10px}
.oauthIcon{width:21px;height:21px;flex:0 0 21px;display:inline-flex;align-items:center;justify-content:center;line-height:1}
.yahooIcon{font-size:17px;font-weight:800;font-family:Arial,sans-serif;color:#fff}
.githubIcon{font-size:18px;color:#fff}
.playGamesIcon{font-size:18px}
.yahooAction{background:#6a1b9a;color:#fff}
.githubAction{background:#242424;color:#fff}
.playGamesAction{background:linear-gradient(#3d5afe,#283593);color:#fff}
#accountSwitch{margin-top:14px;text-align:center;color:#aaa;font-size:12px}
#accountSwitch button,#accountForgot{border:0;background:none;color:#9dcc76;text-decoration:underline;cursor:pointer;padding:0;font-size:inherit}
#accountForgot{display:block;margin:4px auto 10px}
#accountMessage{min-height:20px;margin:10px 0 0;color:#d8d8d8;text-align:center;font-size:12px;line-height:1.4}
#accountUser{display:none;text-align:center}
#accountAvatar{width:64px;height:64px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 10px;background:#4a4a4a}
#accountName{font-size:18px;font-weight:700;margin-bottom:4px}
#accountEmail{font-size:12px;color:#999;word-break:break-all;margin-bottom:12px}
#friendCodeBox{margin:12px 0 16px;padding:13px;background:#161616;border:1px solid #4b4b4b;text-align:left}
#friendCodeLabel{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px}
#friendCodeValue{font:bold 21px MinecraftFont,monospace;letter-spacing:2px;color:#b5dd87;text-align:center;text-shadow:2px 2px 0 #000}
#friendCopy{margin-top:8px;min-height:36px;font-size:11px}
.friendSection{margin-top:16px;text-align:left;border-top:1px solid #3f3f3f;padding-top:14px}
.friendSectionTitle{font:14px MinecraftFont,monospace;margin-bottom:8px;text-shadow:2px 2px 0 #000}
.friendRow{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;margin:5px 0;background:#303030;border:1px solid #484848;font-size:12px}
.friendRowName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.friendRowCode{color:#999;font-size:9px;margin-top:2px}.friendRow button{flex:0 0 auto;min-height:30px;padding:5px 9px;background:#4c4c4c;color:#fff;border:1px solid #777;cursor:pointer}
.friendEmpty{padding:10px;color:#888;background:#181818;border:1px solid #333;font-size:11px}
#accountClose{background:#454545}
#accountLoading{font-size:12px;color:#aaa;text-align:center;padding:10px 0}
@media(max-width:560px){#accountButton{top:76px;right:12px}.friendRequestBadge{min-width:17px;height:17px}#friendRequestToast{top:76px;right:12px;width:calc(100vw - 24px)}}
`,document.head.appendChild(n)}function QC(){if(document.getElementById("accountButton"))return;jC();const n=document.createElement("button");n.id="accountButton",n.type="button",n.textContent="Account",n.addEventListener("click",$y),document.body.appendChild(n);const e=document.createElement("div");e.id="accountModal",e.innerHTML=`
<div id="accountPanel">
<section id="accountLoginView"><h2 id="accountTitle">Player Account</h2><p id="accountSubtitle">Save your profile and use the same account across devices.</p><input id="accountEmailInput" class="accountField" type="email" autocomplete="email" placeholder="Email"><input id="accountPasswordInput" class="accountField" type="password" autocomplete="current-password" placeholder="Password"><button id="accountSubmit" class="accountAction accountPrimary" type="button">Log In</button><button id="accountGoogle" class="accountAction googleAction oauthAction" type="button"><span class="oauthIcon googleIcon">G</span><span>Continue with Google</span></button><button id="accountYahoo" class="accountAction oauthAction yahooAction" type="button"><span class="oauthIcon yahooIcon">Y!</span><span>Continue with Yahoo</span></button><button id="accountGithub" class="accountAction oauthAction githubAction" type="button"><span class="oauthIcon githubIcon">●</span><span>Continue with GitHub</span></button><button id="accountPlayGames" class="accountAction oauthAction playGamesAction" type="button"><span class="oauthIcon playGamesIcon">🎮</span><span>Continue with Google Play Games</span></button><button id="accountForgot" type="button">Forgot password?</button><div id="accountSwitch">New here? <button id="accountSwitchButton" type="button">Create an account</button></div><div id="accountMessage"></div><button id="accountClose" class="accountAction" type="button">Close</button></section>
<section id="accountUser"><h2 id="accountTitle">Your Account</h2><img id="accountAvatar" alt=""><div id="accountName"></div><div id="accountEmail"></div><div id="friendCodeBox"><div id="friendCodeLabel">Your Friend Code</div><div id="friendCodeValue">--------</div><button id="friendCopy" class="accountAction accountPrimary" type="button">Copy Friend Code</button></div><div class="friendSection"><div class="friendSectionTitle">Add a Friend</div><input id="friendCodeInput" class="accountField" maxlength="9" autocomplete="off" placeholder="Enter friend code"><button id="friendAdd" class="accountAction accountPrimary" type="button">Send Friend Request</button></div><div class="friendSection"><div class="friendSectionTitle">Friend Requests</div><div id="friendRequests"><div class="friendEmpty">No pending requests.</div></div></div><div class="friendSection"><div class="friendSectionTitle">Friends</div><div id="friendList"><div class="friendEmpty">No friends yet.</div></div></div><button id="accountLogout" class="accountAction accountPrimary" type="button">Log Out</button><button id="accountCloseUser" class="accountAction" type="button">Close</button></section>
<div id="accountLoading">Connecting to account service…</div></div>`,document.body.appendChild(e);const t=()=>e.style.display="none";e.addEventListener("click",l=>{l.target===e&&t()}),e.querySelector("#accountClose").addEventListener("click",t),e.querySelector("#accountCloseUser").addEventListener("click",t),e.querySelector("#accountLogout").addEventListener("click",async()=>{if(sr)try{await sr.signOut()}catch(l){Et(l)}}),e.querySelector("#friendCopy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(Zm()),e.querySelector("#friendCopy").textContent="Copied!",setTimeout(()=>e.querySelector("#friendCopy").textContent="Copy Friend Code",1200)}catch{Et("Could not copy the friend code.")}}),e.querySelector("#friendAdd").addEventListener("click",tR);let i=!1;const r=e.querySelector("#accountSubmit"),o=e.querySelector("#accountSwitchButton"),a=e.querySelector("#accountPasswordInput"),s=e.querySelector("#accountEmailInput");o.addEventListener("click",()=>{i=!i,r.textContent=i?"Sign Up":"Log In",a.autocomplete=i?"new-password":"current-password",a.placeholder=i?"Create a password":"Password",o.textContent=i?"Log in instead":"Create an account",e.querySelector("#accountSwitch").firstChild.textContent=i?"Already have an account? ":"New here? ",Et("")}),r.addEventListener("click",async()=>{if(!await qa())return;const l=s.value.trim(),c=a.value;if(!l||!c)return Et("Enter your email and password.");try{r.disabled=!0,i?await sr.createUserWithEmailAndPassword(l,c):await sr.signInWithEmailAndPassword(l,c),Et("")}catch(d){Et(d)}finally{r.disabled=!1}}),e.querySelector("#accountGoogle").addEventListener("click",async()=>{if(await qa())try{await sr.signInWithPopup(new window.firebase.auth.GoogleAuthProvider)}catch(l){Et(l)}}),e.querySelector("#accountYahoo").addEventListener("click",()=>bx("yahoo.com","Yahoo")),e.querySelector("#accountGithub").addEventListener("click",()=>bx("github.com","GitHub")),e.querySelector("#accountPlayGames").addEventListener("click",()=>Et("Google Play Games sign-in is available for Android/Unity, not this web version.")),e.querySelector("#accountForgot").addEventListener("click",async()=>{if(!await qa())return;const l=s.value.trim();if(!l)return Et("Enter your email first.");try{await sr.sendPasswordResetEmail(l),Et("Password reset email sent.")}catch(c){Et(c)}})}async function bx(n,e){if(await qa())try{const t=new window.firebase.auth.OAuthProvider(n);n==="yahoo.com"&&(t.addScope("openid"),t.addScope("profile"),t.addScope("email")),await sr.signInWithPopup(t)}catch(t){if(t?.code==="auth/popup-closed-by-user")return Et(`${e} sign-in was closed.`);if(t?.code==="auth/operation-not-allowed")return Et(`${e} sign-in is not enabled in Firebase yet.`);if(t?.code==="auth/account-exists-with-different-credential")return Et("An account already exists with a different sign-in method.");Et(t)}}function Et(n){const e=document.getElementById("accountMessage");if(!e)return;if(!n){e.textContent="";return}if(typeof n=="string"){e.textContent=n;return}const t={"auth/invalid-email":"That email address is not valid.","auth/user-not-found":"No account was found with that email.","auth/wrong-password":"That password is incorrect.","auth/invalid-credential":"The email or password is incorrect.","auth/email-already-in-use":"That email is already in use.","auth/weak-password":"Use a stronger password.","auth/popup-closed-by-user":"Sign-in was closed.","auth/operation-not-allowed":"This sign-in method is not enabled yet."};e.textContent=t[n?.code]||n?.message||"Something went wrong. Please try again."}async function qa(){const n=document.getElementById("accountLoading");if(!mu())return n&&(n.textContent="Firebase is not connected yet. Add your Firebase web config in src/firebaseConfig.js."),!1;if(Md)return!0;n&&(n.style.display="block");const e=await qy();return n&&(n.style.display="none"),e||Et("Could not connect to the account service."),e}function $y(){const n=document.getElementById("accountModal");if(!n)return;n.style.display="flex";const e=document.getElementById("accountLoading");if(!mu()){e&&(e.style.display="block",e.textContent="Connect Firebase to enable accounts."),vh();return}qa().then(()=>vh())}function eR(){const n=document.getElementById("friendCodeValue");n&&(n.textContent=Zm()||"--------")}async function tR(){if(!await qa()||!At)return;const n=document.getElementById("friendCodeInput"),e=n.value.trim().toUpperCase();if(!e)return Et("Enter a friend code.");if(e===Zm())return Et("You cannot add yourself.");const t=window.firebase.firestore();try{const i=await t.collection("publicProfiles").where("friendCode","==",e).limit(1).get();if(i.empty)return Et("No account was found with that friend code.");const r=i.docs[0].data();if(r.uid===At.uid)return Et("You cannot add yourself.");const o=`${At.uid}_${r.uid}`,a=await t.collection("friendRequests").doc(o).get();if(a.exists){const s=a.data().status;if(s==="accepted")return Et("You are already friends.");if(s==="pending")return Et("A friend request is already pending.")}await t.collection("friendRequests").doc(o).set({fromUid:At.uid,toUid:r.uid,fromName:At.displayName||"Player",toName:r.displayName||"Player",status:"pending",createdAt:new Date,updatedAt:new Date}),n.value="",Et(`Friend request sent to ${r.displayName||"Player"}.`),fu()}catch(i){console.warn("Friend request failed:",i),Et("Could not send the friend request. Check your Firestore rules.")}}async function vx(n,e){if(!(!At||!window.firebase?.firestore))try{await window.firebase.firestore().collection("friendRequests").doc(n).update({status:e?"accepted":"declined",updatedAt:new Date}),To.delete(n),fu()}catch{Et("Could not update that friend request.")}}async function fu(){if(!At||!window.firebase?.firestore)return;const n=window.firebase.firestore(),e=document.getElementById("friendRequests"),t=document.getElementById("friendList");if(!(!e||!t))try{const[i,r,o]=await Promise.all([n.collection("friendRequests").where("toUid","==",At.uid).get(),n.collection("friendRequests").where("fromUid","==",At.uid).get(),n.collection("friendRequests").where("toUid","==",At.uid).get()]),a=i.docs.map(l=>({id:l.id,...l.data()})).filter(l=>l.status==="pending");e.innerHTML=a.length?a.map(l=>`<div class="friendRow"><div><div class="friendRowName">${il(l.fromName||"Player")}</div><div class="friendRowCode">Friend request</div></div><div><button data-friend-accept="${il(l.id)}">Accept</button><button data-friend-decline="${il(l.id)}">Decline</button></div></div>`).join(""):'<div class="friendEmpty">No pending requests.</div>',e.querySelectorAll("[data-friend-accept]").forEach(l=>l.addEventListener("click",()=>vx(l.dataset.friendAccept,!0))),e.querySelectorAll("[data-friend-decline]").forEach(l=>l.addEventListener("click",()=>vx(l.dataset.friendDecline,!1)));const s=new Map;for(const l of[...r.docs,...o.docs]){const c=l.data();if(c.status!=="accepted")continue;const d=c.fromUid===At.uid?c.toUid:c.fromUid,f=c.fromUid===At.uid?c.toName:c.fromName;d&&s.set(d,{uid:d,name:f||"Player"})}t.innerHTML=s.size?[...s.values()].map(l=>`<div class="friendRow"><div class="friendRowName">${il(l.name)}</div><span class="friendRowCode">Friend</span></div>`).join(""):'<div class="friendEmpty">No friends yet.</div>'}catch(i){console.warn("Could not load friends:",i),e.innerHTML='<div class="friendEmpty">Friends are unavailable right now.</div>',t.innerHTML='<div class="friendEmpty">Friends are unavailable right now.</div>'}}function nR(n){if(Yy(),!n?.uid||!window.firebase?.firestore)return;const e=window.firebase.firestore();bh=n.uid,wo=!0,To=new Map;try{xh=e.collection("friendRequests").where("toUid","==",n.uid).onSnapshot(t=>{if(bh!==n.uid)return;let i=!1;for(const r of t.docChanges()){const o=r.doc.data()||{},a=To.get(r.doc.id)==="pending";if(r.type==="removed"){To.delete(r.doc.id);continue}To.set(r.doc.id,o.status||""),(!wo&&r.type==="added"&&o.status==="pending"||!wo&&r.type==="modified"&&o.status==="pending"&&!a)&&(yx(o),i=!0)}wo&&(wo=!1),us(t.docs.filter(r=>r.data()?.status==="pending").length,i),fu()},t=>{console.warn("Friend request listener failed:",t)})}catch(t){console.warn("Could not start friend request listener:",t)}}function Yy(){try{xh?.()}catch{}xh=null,bh=null,To.clear(),wo=!0,lr=0,us()}function us(n=lr,e=!1){lr=Math.max(0,Number(n)||0);const t=document.getElementById("accountButton");if(!t)return;if(t.classList.toggle("friendRequestAlert",e||lr>0),t.querySelector(".friendRequestBadge")?.remove(),lr>0){const r=document.createElement("span");r.className="friendRequestBadge",r.textContent=lr>99?"99+":String(lr),t.appendChild(r)}}function yx(n){const e=il(n?.fromName||"Player"),t=document.getElementById("friendRequestToast")||iR(),i=t.querySelector(".friendToastTitle"),r=t.querySelector(".friendToastText");i&&(i.textContent="Friend Request"),r&&(r.textContent=`${e} sent you a friend request`),t.classList.remove("hide"),t.offsetWidth,t.classList.add("show"),us(Math.max(lr,1),!0),rR(),clearTimeout(t._hideTimer),t._hideTimer=setTimeout(()=>Ky(t),7e3)}function iR(){const n=document.createElement("div");return n.id="friendRequestToast",n.innerHTML='<div class="friendToastIcon">+</div><div class="friendToastBody"><div class="friendToastTitle">Friend Request</div><div class="friendToastText">Someone sent you a friend request</div><div class="friendToastHint">Click to open your account</div></div>',n.addEventListener("click",()=>{Ky(n),$y()}),document.body.appendChild(n),n}function Ky(n=document.getElementById("friendRequestToast")){n&&(n.classList.remove("show"),n.classList.add("hide"))}function rR(){try{const n=window.AudioContext||window.webkitAudioContext;if(!n)return;const e=new n,t=e.createGain(),i=e.createOscillator();i.type="square",i.frequency.setValueAtTime(660,e.currentTime),i.frequency.exponentialRampToValueAtTime(880,e.currentTime+.11),t.gain.setValueAtTime(1e-4,e.currentTime),t.gain.exponentialRampToValueAtTime(.045,e.currentTime+.012),t.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+.18),i.connect(t),t.connect(e.destination),i.start(),i.stop(e.currentTime+.2),setTimeout(()=>e.close?.(),350)}catch{}}function il(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}function vh(){const n=document.getElementById("accountLoginView"),e=document.getElementById("accountUser"),t=document.getElementById("accountLoading"),i=document.getElementById("accountButton");if(!(!n||!e||!i))if(t&&Md&&(t.style.display="none"),At){n.style.display="none",e.style.display="block",i.textContent="";const r=document.createElement("img");r.className="accountButtonAvatar",r.alt="",r.src=At.photoURL||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%234a4a4a'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23aaa'/%3E%3Cpath d='M14 57c2-12 10-18 18-18s16 6 18 18' fill='%23aaa'/%3E%3C/svg%3E",i.appendChild(r);const o=document.createElement("span");o.textContent=At.displayName?`Hi, ${At.displayName.split(" ")[0]}`:"Account",i.appendChild(o);const a=document.getElementById("accountAvatar");a&&(a.src=At.photoURL||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%234a4a4a'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23aaa'/%3E%3Cpath d='M14 57c2-12 10-18 18-18s16 6 18 18' fill='%23aaa'/%3E%3C/svg%3E"),document.getElementById("accountName").textContent=At.displayName||"Player",document.getElementById("accountEmail").textContent=At.email||"",eR(),fu(),us()}else n.style.display="block",e.style.display="none",i.textContent="Account",us()}QC();qy().catch(()=>{});const ot={};let _n=0,di=0,Jr=!1;function Jm(n=0,e=0){_n=n,di=e}const Le={moveX:0,moveZ:0,jump:!1,sprint:!1,breakPressed:!1,punchPressed:!1,placePressed:!1,lookActive:!1,blockTouchActive:!1,blockTouchStarted:0,blockTouchX:0,blockTouchY:0,blockTapPending:!1,blockTapX:0,blockTapY:0};let Ys=null,wf=null,_f=0,Sf=0,Mf=0,Ef=0;function Zy(n,e,t){return Math.max(e,Math.min(t,n))}function wx(n){return n/Math.max(window.innerWidth,1)*2-1}function _x(n){return 1-n/Math.max(window.innerHeight,1)*2}function Ks(n,e,t=""){const i=document.createElement("button");return i.id=n,i.className=`touchControl ${t}`.trim(),i.type="button",i.textContent=e,i.addEventListener("contextmenu",r=>r.preventDefault()),i.addEventListener("selectstart",r=>r.preventDefault()),i}function Tf(n,e){const t=r=>{r.preventDefault(),r.stopPropagation(),n.setPointerCapture?.(r.pointerId),Le[e]=!0,n.classList.add("pressed")},i=()=>{Le[e]=!1,n.classList.remove("pressed")};n.addEventListener("pointerdown",t),n.addEventListener("pointerup",i),n.addEventListener("pointercancel",i),n.addEventListener("lostpointercapture",i)}function oR(){if(document.getElementById("touchControls"))return;const n=document.createElement("div");n.id="touchControls",n.innerHTML=`
        <div id="touchMovePad" aria-label="Movement controls">
            <button id="moveForward" class="moveKey" type="button" aria-label="Move forward">▲</button>
            <button id="moveLeft" class="moveKey" type="button" aria-label="Move left">◀</button>
            <button id="moveBack" class="moveKey" type="button" aria-label="Move backward">▼</button>
            <button id="moveRight" class="moveKey" type="button" aria-label="Move right">▶</button>
        </div>
        <div id="touchActions"></div>
        <div id="touchAimKnob" aria-hidden="true"></div>
        <div id="touchLookArea"></div>
        <div id="touchHint">Drag to look • Tap a block to mine</div>
    `;const e=n.querySelector("#touchActions"),t=Ks("touchBreak","MINE","actionButton mineButton"),i=Ks("touchPlace","PLACE","actionButton placeButton"),r=Ks("touchJump","JUMP","actionButton jumpButton"),o=Ks("touchSprint","RUN","actionButton sprintButton"),a=Ks("touchFly","FLY","actionButton flyButton");e.append(t,i,o,a,r),Tf(t,"breakPressed"),Tf(i,"placePressed"),Tf(o,"sprint"),a.addEventListener("pointerdown",_=>{_.preventDefault(),_.stopPropagation(),Jr=!Jr,a.classList.toggle("pressed",Jr)});const s=_=>{_.preventDefault(),_.stopPropagation(),r.setPointerCapture?.(_.pointerId),Le.jump=!0,r.classList.add("pressed")},l=()=>{Le.jump=!1,r.classList.remove("pressed")};r.addEventListener("pointerdown",s),r.addEventListener("pointerup",l),r.addEventListener("pointercancel",l),r.addEventListener("lostpointercapture",l),document.body.appendChild(n);const c=n.querySelector("#touchMovePad"),d={moveForward:{x:0,z:-1},moveLeft:{x:-1,z:0},moveBack:{x:0,z:1},moveRight:{x:1,z:0}},f=new Set,u=()=>{let _=0,S=0;for(const A of f)_+=d[A].x,S+=d[A].z;const w=Math.hypot(_,S);w>1&&(_/=w,S/=w),Le.moveX=_,Le.moveZ=S};for(const[_,S]of Object.entries(d)){const w=c.querySelector(`#${_}`),A=C=>{C.preventDefault(),C.stopPropagation(),w.setPointerCapture?.(C.pointerId),f.add(_),w.classList.add("pressed"),u()},M=()=>{f.delete(_),w.classList.remove("pressed"),u()};w.addEventListener("pointerdown",A),w.addEventListener("pointerup",M),w.addEventListener("pointercancel",M),w.addEventListener("lostpointercapture",M)}const p=n.querySelector("#touchLookArea"),m=n.querySelector("#touchAimKnob");p.addEventListener("pointerdown",_=>{_.pointerType!=="mouse"&&(_.preventDefault(),!(Ys!==null||wf!==null)&&(wf=_.pointerId,Mf=_.clientX,Ef=_.clientY,Le.blockTouchX=wx(_.clientX),Le.blockTouchY=_x(_.clientY),Le.blockTouchActive=!0,Le.blockTouchStarted=performance.now(),_f=_.clientX,Sf=_.clientY,Ys=_.pointerId,p.setPointerCapture?.(_.pointerId),m.style.left=`${_.clientX}px`,m.style.top=`${_.clientY}px`,m.classList.add("visible")))},{passive:!1}),p.addEventListener("pointermove",_=>{if(_.pointerId!==Ys)return;_.preventDefault();const S=_.clientX-_f,w=_.clientY-Sf;Math.hypot(_.clientX-Mf,_.clientY-Ef)>18&&(Le.blockTouchActive=!1),_f=_.clientX,Sf=_.clientY;const A=Number(localStorage.getItem("webminecraft-touch-sensitivity")||1);_n-=S*.006*A,di-=w*.006*A,di=Zy(di,-Math.PI/2+.01,Math.PI/2-.01),Le.lookActive=!0,m.style.left=`${_.clientX}px`,m.style.top=`${_.clientY}px`},{passive:!1});const b=_=>{if(_.pointerId!==Ys)return;_.preventDefault(),Math.hypot(_.clientX-Mf,_.clientY-Ef)<=18&&Le.blockTouchActive&&(Le.blockTapX=wx(_.clientX),Le.blockTapY=_x(_.clientY),Le.blockTapPending=!0),Ys=null,wf=null,Le.blockTouchActive=!1,Le.blockTouchStarted=0,Le.lookActive=!1,m.classList.remove("visible")};p.addEventListener("pointerup",b,{passive:!1}),p.addEventListener("pointercancel",b,{passive:!1}),p.addEventListener("lostpointercapture",b,{passive:!1});const g=document.createElement("style");g.id="mobileGameplayControlsStyles",g.textContent=`
#touchControls{display:none;position:fixed;inset:0;z-index:40;pointer-events:none;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-touch-callout:none}
body.mobile-mode #touchControls{display:block}
#touchLookArea{position:absolute;left:31%;right:0;top:0;bottom:0;pointer-events:auto;touch-action:none;z-index:1;-webkit-tap-highlight-color:transparent}
#touchMovePad{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(28px,env(safe-area-inset-bottom));width:168px;height:168px;display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(3,56px);z-index:5;pointer-events:none;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.65))}
#moveForward{grid-column:2;grid-row:1}#moveLeft{grid-column:1;grid-row:2}#moveBack{grid-column:2;grid-row:3}#moveRight{grid-column:3;grid-row:2}
.moveKey{width:52px;height:52px;margin:2px;border:2px solid #111;border-right-color:#555;border-bottom-color:#555;background:#7b7b7b;color:#fff;font:700 22px Arial,sans-serif;border-radius:2px;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:inset 2px 2px 0 rgba(255,255,255,.22),inset -2px -2px 0 rgba(0,0,0,.28);text-shadow:2px 2px 0 #333}
.moveKey:active,.moveKey.pressed{background:#9a9a9a;border-color:#111;transform:translate(1px,1px);box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -1px -1px 0 rgba(0,0,0,.3)}
#touchActions{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(26px,env(safe-area-inset-bottom));width:185px;height:205px;z-index:6;pointer-events:none;filter:drop-shadow(3px 3px 0 rgba(0,0,0,.65))}
.touchControl{position:absolute;width:70px;height:52px;border:2px solid #111;border-right-color:#555;border-bottom-color:#555;border-radius:2px;background:#7b7b7b;color:#fff;font:700 11px Arial,sans-serif;letter-spacing:.5px;text-shadow:2px 2px 0 #333;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;box-shadow:inset 2px 2px 0 rgba(255,255,255,.22),inset -2px -2px 0 rgba(0,0,0,.28)}
.touchControl.pressed{background:#9a9a9a;transform:translate(1px,1px);box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -1px -1px 0 rgba(0,0,0,.3)}
#touchJump{right:0;top:0;width:82px;height:64px;font-size:12px}
#touchBreak{right:0;top:76px}#touchPlace{right:0;top:134px}#touchSprint{left:0;top:76px}#touchFly{left:0;top:134px}
#touchFly.pressed{background:#6f914b;border-right-color:#3f572d;border-bottom-color:#3f572d}
#touchAimKnob{position:fixed;width:32px;height:32px;margin:-16px 0 0 -16px;border-radius:0;border:2px solid rgba(255,255,255,.75);background:rgba(255,255,255,.08);box-shadow:0 0 0 2px rgba(0,0,0,.55);pointer-events:none;z-index:4;opacity:0;transition:opacity .08s ease}
#touchAimKnob.visible{opacity:1}
#touchHint{position:absolute;top:max(10px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:90%;text-align:center;color:rgba(255,255,255,.5);font:11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none;z-index:7}
@media(max-width:680px){#touchMovePad{transform:scale(.94);transform-origin:bottom left}#touchActions{transform:scale(.94);transform-origin:bottom right}}
@media(orientation:portrait){#touchMovePad{left:max(12px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom));transform:scale(.88)}#touchActions{right:max(12px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));transform:scale(.88)}#touchLookArea{left:28%}#touchHint{font-size:10px}}
body.mobile-mode #settingsButton{z-index:70;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right))}
html,body,.mobile-mode,canvas{touch-action:none;overscroll-behavior:none}
@media(max-width:680px){body.mobile-mode canvas{touch-action:none!important}}
`,document.head.appendChild(g),(navigator.maxTouchPoints>0||"ontouchstart"in window)&&document.body.classList.add("mobile-mode");const h=_=>{document.body.classList.contains("mobile-mode")&&_.preventDefault()};document.addEventListener("gesturestart",h,{passive:!1}),document.addEventListener("gesturechange",h,{passive:!1}),document.addEventListener("gestureend",h,{passive:!1}),document.addEventListener("dblclick",h,{passive:!1}),document.addEventListener("touchmove",_=>{document.body.classList.contains("mobile-mode")&&_.touches.length>1&&_.preventDefault()},{passive:!1})}function Jy(){window.addEventListener("keydown",n=>{if(document.body.classList.contains("mobile-mode")){for(const e of Object.keys(ot))ot[e]=!1;return}n.code==="KeyF"&&!n.repeat&&(Jr=!Jr),ot[n.code]=!0,["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(n.code)&&n.preventDefault()}),window.addEventListener("keyup",n=>{if(document.body.classList.contains("mobile-mode")){ot[n.code]=!1;return}ot[n.code]=!1}),window.addEventListener("mousemove",n=>{if(document.pointerLockElement!==document.body||document.body.classList.contains("mobile-mode"))return;const e=Number(localStorage.getItem("webminecraft-mouse-sensitivity")||1);_n-=n.movementX*.0025*e;const t=localStorage.getItem("webminecraft-invert-y")==="true";di+=(t?1:-1)*n.movementY*.0025*e,di=Zy(di,-Math.PI/2+.01,Math.PI/2-.01)}),oR(),dn(()=>import("./settings-BsiiWpbE.js"),[]).catch(n=>console.warn("Settings extras failed to load:",n))}const aR=Object.freeze(Object.defineProperty({__proto__:null,get isFlying(){return Jr},keys:ot,get pitch(){return di},resetView:Jm,setupControls:Jy,touchInput:Le,get yaw(){return _n}},Symbol.toStringTag,{value:"Module"})),Ed="webminecraft-world-mode-",sR="webminecraft-singleplayer-world-state-";function Ls(n){return n==="survival"?"survival":"creative"}function ao(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function jy(){return ao(new URLSearchParams(window.location.search).get("seed"))}function jm(n=jy()){const e=ao(n),t=window.webMinecraftSelectedWorldMode;if(window.__webminecraftMultiplayerActive===!0){if(t==="survival"||t==="creative")return t;if(e===null)return"creative";try{return Ls(localStorage.getItem(`${Ed}${e}`))}catch{return"creative"}}if(e!==null)try{const i=localStorage.getItem(`${Ed}${e}`);if(i==="survival"||i==="creative")return i}catch{}return t==="survival"||t==="creative"?t:"creative"}function pu(n,e){const t=ao(n);if(t===null)return;const i=Ls(e);try{localStorage.setItem(`${Ed}${t}`,i)}catch{}}function Bn(n=jy()){return jm(n)==="survival"}function Qy(n){const e=ao(n);return e===null?null:`${sR}${e}`}function lR(n){const e=Qy(n);if(!e)return null;try{const t=JSON.parse(localStorage.getItem(e)||"null");return t&&typeof t=="object"?t:null}catch{return null}}function hl(n){return Number.isFinite(Number(n))}function cR(n){return n&&hl(n.x)&&hl(n.y)&&hl(n.z)}function ew(n){return Array.isArray(n)&&n.length===36}function dR(n){const e=ao(n);if(e===null)return"creative";try{const t=localStorage.getItem(`${Ed}${e}`);return t==="survival"||t==="creative"?t:"creative"}catch{return"creative"}}let $a=null,yh=0,Sx=!1;function Qm(){return document.body.classList.contains("webminecraft-in-world")&&window.__webminecraftMultiplayerActive!==!0}function uR(){if(!Qm())return;const n=window.__webminecraftCamera;if(!n)return;const e=ao(to());if(e===null||e===$a)return;$a=e,yh=performance.now();const t=lR(e),i=Ls(t?.mode||dR(e));if(pu(e,i),window.webMinecraftSelectedWorldMode=i,document.body.classList.toggle("webminecraft-survival",i==="survival"),document.body.classList.toggle("webminecraft-creative",i!=="survival"),window.dispatchEvent(new CustomEvent("webminecraft-modechange",{detail:{mode:i}})),cR(t?.position)&&n.position.set(Number(t.position.x),Number(t.position.y),Number(t.position.z)),hl(t?.yaw)&&hl(t?.pitch)&&(Jm(Number(t.yaw),Number(t.pitch)),n.rotation.order="YXZ",n.rotation.y=Number(t.yaw),n.rotation.x=Number(t.pitch)),ew(t?.inventory)){try{localStorage.setItem("webminecraft_inventory",JSON.stringify(t.inventory))}catch{}window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged"))}}function Nc(n=!1){if(!Qm())return;const e=window.__webminecraftCamera,t=ao(to());if(!e||t===null||$a!==null&&t!==$a)return;const i=performance.now();if(!n&&i-yh<500)return;yh=i,$a=t;let r=[];try{const l=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]");r=ew(l)?l:Array.from({length:36},()=>null)}catch{r=Array.from({length:36},()=>null)}const o=jm(t),a={version:1,seed:t,mode:o,position:{x:Number(e.position.x),y:Number(e.position.y),z:Number(e.position.z)},yaw:Number(_n),pitch:Number(di),inventory:r,updatedAt:new Date().toISOString()},s=Qy(t);if(s)try{localStorage.setItem(s,JSON.stringify(a))}catch{}}function fR(){if(Sx)return;Sx=!0,setInterval(()=>{if(!Qm()){$a=null;return}uR(),Nc()},100),window.addEventListener("pagehide",()=>Nc(!0)),window.addEventListener("beforeunload",()=>Nc(!0)),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Nc(!0)})}function pR(){if(document.getElementById("survivalModePickerStyles"))return;const n=document.createElement("style");n.id="survivalModePickerStyles",n.textContent=`
#savedWorlds .sw2-mode-label{margin-top:18px;margin-bottom:9px;font-weight:800;color:#eee}
#savedWorlds .sw2-mode-picker{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
#savedWorlds .sw2-mode-card{position:relative;min-height:118px;padding:16px;border:2px solid #151515;border-radius:9px;background:linear-gradient(145deg,#383838,#242424);color:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 0 #101010,0 8px 18px #0006;transition:transform .12s ease,border-color .12s ease,background .12s ease,box-shadow .12s ease;box-sizing:border-box}
#savedWorlds .sw2-mode-card:hover{transform:translateY(-1px);background:linear-gradient(145deg,#454545,#292929)}
#savedWorlds .sw2-mode-card.selected{border-color:#a7d36d;background:linear-gradient(145deg,#50663a,#293521);box-shadow:0 4px 0 #18210f,0 8px 18px #0007}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected{border-color:#8eb9df;background:linear-gradient(145deg,#3d5870,#263543);box-shadow:0 4px 0 #17232d,0 8px 18px #0007}
#savedWorlds .sw2-mode-icon{font-size:28px;line-height:1;margin-bottom:8px;display:block}
#savedWorlds .sw2-mode-title{font-size:16px;font-weight:900;display:block;margin-bottom:5px}
#savedWorlds .sw2-mode-desc{display:block;color:#c3c3c3;font-size:10px;line-height:1.4}
#savedWorlds .sw2-mode-check{position:absolute;right:9px;top:8px;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;background:#111;color:#fff;font-size:12px;opacity:0}
#savedWorlds .sw2-mode-card.selected .sw2-mode-check{opacity:1;background:#86ad55}
#savedWorlds .sw2-mode-card[data-mode="creative"].selected .sw2-mode-check{background:#6c9bc3}
#savedWorlds [data-world-mode]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
@media(max-width:560px){#savedWorlds .sw2-mode-picker{grid-template-columns:1fr}.sw2-mode-card{min-height:100px!important}}
`,document.head.appendChild(n)}function hR(n){const e=Ls(n);window.webMinecraftSelectedWorldMode=e,document.body.classList.toggle("webminecraft-survival",e==="survival"),document.body.classList.toggle("webminecraft-creative",e!=="survival"),window.dispatchEvent(new CustomEvent("webminecraft-modechange",{detail:{mode:e}}))}function mR(){const n=document.querySelector("#savedWorlds .sw2-modal-card");if(!n||n.querySelector("[data-world-mode]"))return!1;pR();const e=document.createElement("p");e.className="sw2-label sw2-mode-label",e.textContent="Choose your game mode";const t=document.createElement("div");t.className="sw2-mode-picker",t.setAttribute("role","radiogroup"),t.setAttribute("aria-label","Game mode");const i=document.createElement("select");i.dataset.worldMode="",i.setAttribute("aria-label","Game mode"),i.innerHTML='<option value="survival">Survival</option><option value="creative">Creative</option>';const r=[{mode:"survival",icon:"⛏️",title:"Survival",desc:"Health, normal mining, no flying, and achievements."},{mode:"creative",icon:"🧱",title:"Creative",desc:"Unlimited building, instant mining, flying, no health damage."}],o=[];function a(c){const d=Ls(c);i.value=d,o.forEach(f=>{const u=f.dataset.mode===d;f.classList.toggle("selected",u),f.setAttribute("aria-checked",String(u))}),hR(d)}for(const c of r){const d=document.createElement("button");d.type="button",d.className="sw2-mode-card",d.dataset.mode=c.mode,d.setAttribute("role","radio"),d.innerHTML=`<span class="sw2-mode-check">✓</span><span class="sw2-mode-icon">${c.icon}</span><span class="sw2-mode-title">${c.title}</span><span class="sw2-mode-desc">${c.desc}</span>`,d.addEventListener("click",()=>a(c.mode)),t.appendChild(d),o.push(d)}a("survival");const s=document.createElement("p");return s.className="sw2-help",s.style.margin="10px 0 0",s.textContent="Pick the mode before creating the world. The selected mode is saved with that world's seed.",n.querySelector("[data-new-seed]")?.parentElement?.insertAdjacentElement("afterend",e),e.insertAdjacentElement("afterend",t),t.insertAdjacentElement("afterend",i),i.insertAdjacentElement("afterend",s),!0}function gR(){const n=document.querySelector("#savedWorlds [data-new-seed]"),e=document.querySelector("#savedWorlds [data-world-mode]"),t=document.querySelector("#savedWorlds #cwGameMode"),i=e||t;if(!n||!i)return;const r=ao(n.textContent.trim());if(r===null)return;const o=Ls(i.value);window.webMinecraftSelectedWorldMode=o,pu(r,o),window.__webminecraftPendingSingleplayerMode=o}function Af(){const n=jm();document.body.classList.toggle("webminecraft-survival",n==="survival"),document.body.classList.toggle("webminecraft-creative",n!=="survival")}function Mx(){const n=()=>{mR()&&e.disconnect()},e=new MutationObserver(n);n(),document.querySelector("#savedWorlds [data-world-mode]")||e.observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("click",t=>{t.target.closest('#savedWorlds [data-act="create"]')&&gR()},!0),Af(),fR(),window.addEventListener("popstate",Af),window.addEventListener("webminecraft-modechange",Af)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Mx,{once:!0}):Mx();const tw="webminecraft-multiplayer-game-mode",xR=new Set(["survival","creative"]);function Al(n){return xR.has(String(n))?String(n):"survival"}function od(){try{return Al(localStorage.getItem(tw))}catch{return"survival"}}function wh(n){const e=Al(n);window.__webminecraftMultiplayerMode=e;try{localStorage.setItem(tw,e)}catch{}return e}function nw(){try{dn(async()=>{const{isFlying:n}=await Promise.resolve().then(()=>aR);return{isFlying:n}},void 0).then(({isFlying:n})=>{if(!n)return;document.body.classList.contains("mobile-mode")?document.getElementById("touchFly")?.dispatchEvent(new PointerEvent("pointerdown",{bubbles:!0,cancelable:!0,pointerId:-1,pointerType:"touch"})):window.dispatchEvent(new KeyboardEvent("keydown",{bubbles:!0,cancelable:!0,code:"KeyF",key:"f"}))}).catch(()=>{})}catch{}}function bR(){if(!document.getElementById("multiplayerGameplayUiFixes")){const t=document.createElement("style");t.id="multiplayerGameplayUiFixes",t.textContent=`
body.webminecraft-multiplayer #mainMenu,
body.webminecraft-multiplayer #seedMenu,
body.webminecraft-multiplayer #multiplayerMenu,
body.webminecraft-multiplayer #accountButton,
body.webminecraft-multiplayer #newsButton,
body.webminecraft-multiplayer #friendsButton,
body.webminecraft-multiplayer #globalPlayerPanel,
body.webminecraft-multiplayer #menuUpdates,
body.webminecraft-multiplayer #devControlsButton{display:none!important}
body.webminecraft-multiplayer #crosshair,
body.webminecraft-multiplayer #webMinecraftCrosshair{display:block!important}
body.webminecraft-multiplayer #hotbar.textured-hotbar{display:flex!important}
body.webminecraft-multiplayer.mobile-mode #touchControls{display:block!important}
body.webminecraft-multiplayer:not(.mobile-mode) #touchControls{display:none!important}
body.webminecraft-multiplayer.webminecraft-survival #touchFly{display:none!important;pointer-events:none!important}
        `,document.head.appendChild(t)}document.body.classList.add("webminecraft-in-world","webminecraft-multiplayer");const n=["mainMenu","seedMenu","multiplayerMenu","accountButton","newsButton","friendsButton","globalPlayerPanel","menuUpdates","devControlsButton"];for(const t of n){const i=document.getElementById(t);i&&i.style.setProperty("display","none","important")}const e=document.getElementById("menuSettingsButton");e&&e.style.setProperty("display","none","important"),nw()}function vR(n,e=null){const t=wh(n);window.webMinecraftSelectedWorldMode=t,window.__webminecraftMultiplayerModeApplied=!0,document.body.classList.toggle("webminecraft-survival",t==="survival"),document.body.classList.toggle("webminecraft-creative",t==="creative"),bR(),t==="survival"&&nw(),e!==null&&Number.isFinite(Number(e))&&pu(e,t),window.dispatchEvent(new CustomEvent("webminecraft-modechange",{detail:{mode:t}}))}function yR(n){if(!n||document.getElementById("multiplayerGameModePicker"))return;const e=document.createElement("div");e.className="multiplayerField",e.id="multiplayerGameModePicker",e.innerHTML=`
        <label>Game Mode</label>
        <div class="multiplayerGameModeButtons" role="radiogroup" aria-label="Game mode">
            <button id="multiplayerSurvivalMode" class="multiplayerTypeButton" type="button" role="radio" aria-checked="false">SURVIVAL</button>
            <button id="multiplayerCreativeMode" class="multiplayerTypeButton" type="button" role="radio" aria-checked="false">CREATIVE</button>
        </div>
        <div class="multiplayerHint">Choose the mode for a new room. Players joining the room use its saved mode.</div>
    `;const t=document.createElement("style");t.id="multiplayerGameModeStyles",t.textContent=`
        .multiplayerGameModeButtons{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .multiplayerGameModeButtons .multiplayerTypeButton{margin:0}
    `,document.head.appendChild(t);const i=n.querySelector("#multiplayerServer")?.closest(".multiplayerField");i?n.insertBefore(e,i):n.appendChild(e);const r=e.querySelector("#multiplayerSurvivalMode"),o=e.querySelector("#multiplayerCreativeMode"),a=()=>{const s=Al(window.__webminecraftMultiplayerMode||od());r.classList.toggle("selected",s==="survival"),o.classList.toggle("selected",s==="creative"),r.setAttribute("aria-checked",String(s==="survival")),o.setAttribute("aria-checked",String(s==="creative"))};r.addEventListener("click",()=>{wh("survival"),a()}),o.addEventListener("click",()=>{wh("creative"),a()}),a()}function Ex(){const n=()=>{const t=document.querySelector("#multiplayerRoomView .multiplayerAdvanced");t&&yR(t)};new MutationObserver(n).observe(document.body,{childList:!0,subtree:!0}),n()}function Tx(){const n=document.getElementById("mainMenu");n&&window.__webminecraftMultiplayerModeApplied&&window.__webminecraftMultiplayerActive!==!0&&getComputedStyle(n).display!=="none"&&(window.__webminecraftMultiplayerModeApplied=!1,delete window.webMinecraftSelectedWorldMode,document.body.classList.remove("webminecraft-survival","webminecraft-creative","webminecraft-in-world","webminecraft-multiplayer"))}function Ax(){const n=document.getElementById("mainMenu");if(!n)return;new MutationObserver(Tx).observe(n,{attributes:!0,attributeFilter:["style","class"]}),Tx()}function wR(){if(window.__webminecraftMultiplayerModeBridgeInstalled||!window.WebSocket)return;window.__webminecraftMultiplayerModeBridgeInstalled=!0,window.__webminecraftMultiplayerMode=od();const n=WebSocket.prototype.send;WebSocket.prototype.send=function(t){if(typeof t=="string")try{const i=JSON.parse(t);i&&i.type==="join"&&(i.mode=Al(window.__webminecraftMultiplayerMode||od()),t=JSON.stringify(i))}catch{}return n.call(this,t)};const e=WebSocket.prototype.addEventListener;WebSocket.prototype.addEventListener=function(t,i,r){if(t!=="message"||typeof i!="function")return e.call(this,t,i,r);const o=a=>{try{const s=JSON.parse(a.data);if(s?.type==="joined"){const l=Al(s.mode||window.__webminecraftMultiplayerMode||od());vR(l,s.worldSeed)}}catch{}return i.call(this,a)};return e.call(this,t,o,r)}}wR();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Ex(),Ax()},{once:!0}):(Ex(),Ax());const Fa=new Map,iw=new Set,Cl=new Map;let Cx=!1,rl=null;const _h=1e3;window.__webminecraftGetRemotePlayers=()=>Fa;window.__webminecraftTouchInput=Le;window.__webminecraftTouchPunchPressed=()=>!!Le.punchPressed;window.__webminecraftConsumeTouchPunch=()=>{Le.punchPressed=!1};function hu(){return document.body.classList.contains("webminecraft-multiplayer")&&document.body.classList.contains("webminecraft-survival")}function Cf(n){if(!n?.rotation)return;const e=Number(n.rotation.z);if(!Number.isFinite(e)||Math.abs(e)<900)return;const t=Math.floor(e/_h),i=e-t*_h;t>=0&&t<=15&&Math.abs(i)<20&&(n.heldItemId=t,n.rotation.z=i)}function _R(n){if(!(!n||typeof n!="object")){if(n.type==="joined"){rl=String(n.playerId||""),Fa.clear();for(const e of n.players||[])e?.id&&String(e.id)!==rl&&(Cf(e),Fa.set(String(e.id),e))}else if(n.type==="player_joined")n.player?.id&&String(n.player.id)!==rl&&(Cf(n.player),Fa.set(String(n.player.id),n.player));else if(n.type==="player_left")n.playerId&&Fa.delete(String(n.playerId));else if(n.type==="player_states"){for(const e of n.players||[])e?.id&&String(e.id)!==rl&&(Cf(e),Fa.set(String(e.id),e));SR(n.players||[])}}}function SR(n){if(!hu())return;const e=window.__webMinecraftMiningScene;for(const t of n)if(Array.isArray(t?.claimedDropIds))for(const i of t.claimedDropIds){const r=String(i||"");if(!r)continue;iw.add(r);const o=Cl.get(r);if(o){if(e){for(const a of[...e.children])if(a?.name==="survivalDroppedItem"&&Number(a.userData?.type)===Number(o.type)&&!(a.position.distanceTo({x:o.x,y:o.y+.28,z:o.z})>.8)){a.parent?.remove(a);break}}Cl.delete(r)}}}function MR(n){if(!hu())return;const e=n.detail||{},t=Math.floor(Number(e.brokenType)),i=Math.floor(Number(e.x)),r=Math.floor(Number(e.y)),o=Math.floor(Number(e.z));if(!Number.isFinite(t)||t<=0||![i,r,o].every(Number.isFinite))return;const a=`${rl||"local"}:${i}:${r}:${o}:${t}:${Date.now()}:${Math.random().toString(36).slice(2,8)}`;Cl.set(a,{id:a,x:i,y:r,z:o,type:t})}function ER(){try{const n=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]"),e=Number(window.__webminecraftSelectedSlot??0);return Math.max(0,Math.floor(Number(n?.[e]?.itemId)||0))}catch{return 0}}function TR(n){if(typeof n!="string"||!hu())return n;try{const e=JSON.parse(n);if(e?.type!=="player_state")return n;if(Array.isArray(e.sharedDrops)&&(e.sharedDrops=e.sharedDrops.filter(t=>!iw.has(String(t?.id||"")))),Array.isArray(window.__webminecraftClaimedDropIds)&&(e.claimedDropIds=[...new Set(window.__webminecraftClaimedDropIds.map(String))].slice(-32)),e.rotation&&typeof e.rotation=="object"){const t=ER(),i=Number(e.rotation.z);Number.isFinite(i)&&(e.rotation.z=i+t*_h)}return JSON.stringify(e)}catch{return n}}function AR(){if(Cx||!window.WebSocket)return;Cx=!0;const n=WebSocket.prototype.send;WebSocket.prototype.send=function(t){return n.call(this,TR(t))};const e=WebSocket.prototype.addEventListener;WebSocket.prototype.addEventListener=function(t,i,r){if(t!=="message"||typeof i!="function")return e.call(this,t,i,r);const o=a=>{try{_R(JSON.parse(a.data))}catch{}return i.call(this,a)};return e.call(this,t,o,r)}}window.addEventListener("webminecraft:blockchange",MR);window.addEventListener("webminecraft:selectedslot",n=>{window.__webminecraftSelectedSlot=Number(n.detail?.slot??0)});window.addEventListener("webminecraft:inventorychanged",()=>{if(!hu())return;const n=window.__webMinecraftMiningCamera;if(!n)return;const e=n.position;for(const t of[...Cl.values()]){const i=e.x-t.x,r=e.y-(t.y+.28),o=e.z-t.z;Math.hypot(i,r,o)<=2.5&&Cl.delete(t.id)}});AR();window.__webminecraftSurvivalBridgeReady=!0;let Rx=!1,Rf=!1;function rw(){return window.__webminecraftMultiplayerActive===!0}function CR(){return rw()&&document.body.classList.contains("webminecraft-creative")}function Lx(){if(!rw())return;document.body.classList.add("webminecraft-in-world","webminecraft-multiplayer");const n=document.getElementById("mainMenu");n&&n.style.setProperty("display","none","important");const e=["seedMenu","multiplayerMenu","accountButton","newsButton","friendsButton","globalPlayerPanel","menuUpdates","devControlsButton","menuButtons","playButton","multiplayerButton"];for(const r of e)document.getElementById(r)?.style.setProperty("display","none","important");document.getElementById("crosshair")?.style.setProperty("display","block","important"),document.getElementById("webMinecraftCrosshair")?.style.setProperty("display","block","important"),document.getElementById("hotbar")?.style.setProperty("display","flex","important");const t=document.getElementById("heldBlock3DCanvas");t&&t.style.setProperty("display","block","important");const i=document.getElementById("touchControls");if(i){const r=document.body.classList.contains("mobile-mode");i.style.setProperty("display",r?"block":"none","important")}}function RR(){if(Rx)return;Rx=!0,document.addEventListener("mousedown",e=>{if(!CR()||Rf||e.button!==0||e.target instanceof Element&&e.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a"))return;const t=document.querySelector("body > canvas");if(t){if(document.pointerLockElement!==document.body&&typeof document.body.requestPointerLock=="function")try{document.body.requestPointerLock()}catch{}Rf=!0;try{t.dispatchEvent(new MouseEvent("mousedown",{bubbles:!0,cancelable:!0,button:0,buttons:1,clientX:e.clientX,clientY:e.clientY}))}catch{}Rf=!1,e.preventDefault(),e.stopImmediatePropagation()}},!0);const n=document.createElement("style");n.id="multiplayerGameplayStateFixStyles",n.textContent=`
body.webminecraft-multiplayer #heldBlock3DCanvas{display:block!important;visibility:visible!important;opacity:1!important}
body.webminecraft-multiplayer.webminecraft-creative #touchFly{display:block!important;pointer-events:auto!important}
body.webminecraft-multiplayer.webminecraft-survival #touchFly{display:none!important;pointer-events:none!important}
body.webminecraft-multiplayer #hotbar{visibility:visible!important;opacity:1!important}
body.webminecraft-multiplayer #webMinecraftCrosshair{visibility:visible!important;opacity:1!important}
`,document.head.appendChild(n),setInterval(Lx,100),Lx()}RR();const ow={1:wd,2:lu,3:ql,4:cu,5:_d,6:Wm,7:Pm,8:$l,9:Dm,10:Nm,11:Fm,12:Um,13:km,14:Gm,15:Vm,18:Bm,19:Om,20:zm,21:Hm,22:Xm},Sh=new Set,Mh=new WeakMap,LR=Wt.prototype.add;let Ix=!1;function Eh(n){if(!n?.clone)return n;const e=n.clone();return e.vertexColors=!1,e.color&&e.color.setRGB(1,1,1),e.needsUpdate=!0,e}function IR(n){const e=ow[n];return e?Array.isArray(e)?e.map(Eh):Eh(e):null}function PR(){const n=new Oe(new ft(.42,.42,.42),Eh(ql));return n.name="multiplayerHeldBlock",n.castShadow=!0,n.receiveShadow=!0,n.position.set(.53,.87,-.24),n.rotation.set(.08,.28,-.06),n.visible=!1,n.userData.itemId=0,n}function DR(){Ix||(Ix=!0,Wt.prototype.add=function(...n){const e=LR.apply(this,n);for(const t of n){if(!t?.userData?.multiplayerAvatar)continue;let i=Mh.get(t);i||(i=PR(),t.add(i),Mh.set(t,i),Sh.add(t))}return e})}function NR(){try{return window.__webminecraftGetRemotePlayers?.()||new Map}catch{return new Map}}function FR(n,e){let t=null,i=1/0;for(const r of e.values()){const o=r?.position;if(!o)continue;const a=Number(o.x)-n.position.x,s=Number(o.y)-n.position.y,l=Number(o.z)-n.position.z,c=a*a+s*s+l*l;c<i&&(i=c,t=r)}return i<=4?t:null}function UR(n,e){const t=Mh.get(n);if(!t)return;const i=Math.floor(Number(e?.heldItemId)||0);if(!ow[i]){t.visible=!1,t.userData.itemId=0;return}if(t.userData.itemId!==i){const r=IR(i);if(r){const o=t.material;t.material=r,Array.isArray(o)?o.forEach(a=>a?.dispose?.()):o?.dispose?.(),t.userData.itemId=i}}t.visible=!0}function aw(){const n=NR();for(const e of[...Sh]){if(!e.parent){Sh.delete(e);continue}UR(e,FR(e,n))}requestAnimationFrame(aw)}DR();window.addEventListener("webminecraft:selectedslot",n=>{window.__webminecraftSelectedSlot=Number(n.detail?.slot??0)});aw();(function(){if(window.__webMinecraftCameraAndBlurFix)return;window.__webMinecraftCameraAndBlurFix=!0;const e=document.createElement("style");e.id="webMinecraftCameraAndBlurFix",e.textContent=`
#mainMenu,
#mainMenu::after,
#accountModal,#devControlsModal,#discussionModal,#welcomeOverlay,#welcomeModal,.modalOverlay{
    -webkit-backdrop-filter:none!important;
    backdrop-filter:none!important;
    filter:none!important;
}

#mainMenu::after{
    background:transparent!important;
}
`,document.head.appendChild(e)})();(function(){if(window.__webMinecraftFriendsCloseFix)return;window.__webMinecraftFriendsCloseFix=!0;let e=0;function t(){const o=document.getElementById("accountModal");o&&(o.style.display="none")}function i(o){o.target?.closest?.("#friendsClose")&&(o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),e=Date.now()+900,document.getElementById("friendsModal")?.classList.remove("open"),t())}["pointerdown","mousedown","touchstart","pointerup","mouseup","touchend","click"].forEach(o=>{document.addEventListener(o,i,!0)}),["pointerdown","mousedown","touchstart","pointerup","mouseup","touchend","click"].forEach(o=>{document.addEventListener(o,a=>{Date.now()>=e||a.target?.closest?.("#accountButton")&&(a.preventDefault(),a.stopPropagation(),a.stopImmediatePropagation(),t())},!0)});const r=()=>{Date.now()<e&&t(),window.requestAnimationFrame(r)};window.requestAnimationFrame(r)})();let Px=null,Dx=!1,Nx=!1;function kR(n){const e=()=>{const r=document.getElementById("accountButton");return r?(r.title=n?.email?`Logged in as ${n.email}`:"Account",r.textContent=n?.email||n?.displayName||"Account",!0):!1};if(e())return;let t=0;const i=window.setInterval(()=>{(e()||++t>=50)&&window.clearInterval(i)},100)}function BR(){Dx||!window.firebase?.auth||(Dx=!0,window.firebase.auth().onAuthStateChanged(n=>{const e=String(n?.uid||""),t=Nx&&!!e&&!Px;Nx=!0,Px=e||null,kR(n||null),window.dispatchEvent(new CustomEvent("webminecraft:auth-state-changed",{detail:{user:n||null}})),t&&window.setTimeout(()=>window.location.reload(),150)}))}function sw(){if(window.firebase?.auth){BR();return}window.setTimeout(sw,100)}sw();(function(){if(window.__webminecraftEarlyNewsButtonPosition)return;window.__webminecraftEarlyNewsButtonPosition=!0;const e=document.createElement.bind(document);document.createElement=function(t,i){const r=e(t,i);if(String(t).toLowerCase()!=="button")return r;const o=Object.getOwnPropertyDescriptor(r,"id");let a=r.id;return Object.defineProperty(r,"id",{configurable:!0,enumerable:!0,get(){return a},set(s){a=String(s??""),o?.set?o.set.call(this,a):this.setAttribute("id",a),a==="newsButton"&&(this.style.position="fixed",this.style.left=window.innerWidth<=560?"12px":"28px",this.style.bottom=window.innerWidth<=560?"18px":"28px",this.style.width=window.innerWidth<=560?"calc(50vw - 18px)":"118px",this.style.margin="0",this.style.zIndex="97")}}),r},window.addEventListener("resize",()=>{const t=document.getElementById("newsButton");if(!t)return;const i=window.innerWidth<=560;t.style.left=i?"12px":"28px",t.style.bottom=i?"18px":"28px",t.style.width=i?"calc(50vw - 18px)":"118px"},{passive:!0})})();const xi={apiKey:"AIzaSyByaINh47IFMYmnc9Ty49aHTfTBe2u-jyU",authDomain:"webminecraft-f9064.firebaseapp.com",databaseURL:"https://webminecraft-f9064-default-rtdb.firebaseio.com",projectId:"webminecraft-f9064",storageBucket:"webminecraft-f9064.firebasestorage.app",messagingSenderId:"781747330238",appId:"1:781747330238:web:2324f527da2074cf82d2ef",measurementId:"G-EC7BZ58BRK"};function mu(){return!!(xi.apiKey&&xi.authDomain&&xi.projectId&&xi.appId)}(function(){if(!mu()||window.__webMinecraftStartupFirebase)return;window.__webMinecraftStartupFirebase=!0;const e="12.18.0",t=i=>{window.__webMinecraftFirebaseLoads||(window.__webMinecraftFirebaseLoads=new Map);const r=window.__webMinecraftFirebaseLoads;if(r.has(i))return r.get(i);const o=new Promise((a,s)=>{const l=document.querySelector(`script[src="${i}"]`);if(l){if(i.includes("firebase-app-compat")?window.firebase:i.includes("firebase-auth-compat")?window.firebase?.auth:window.firebase?.firestore)return a();l.addEventListener("load",()=>a(),{once:!0}),l.addEventListener("error",()=>s(new Error(`Could not load ${i}`)),{once:!0});return}const c=document.createElement("script");c.src=i,c.async=!0,c.onload=()=>a(),c.onerror=()=>s(new Error(`Could not load ${i}`)),document.head.appendChild(c)});return r.set(i,o),o};Promise.resolve().then(()=>t(`https://www.gstatic.com/firebasejs/${e}/firebase-app-compat.js`)).then(()=>{if(!window.firebase)throw new Error("Firebase SDK did not load.");return(window.firebase.apps||[]).length||window.firebase.initializeApp(xi),Promise.all([t(`https://www.gstatic.com/firebasejs/${e}/firebase-auth-compat.js`),t(`https://www.gstatic.com/firebasejs/${e}/firebase-firestore-compat.js`)])}).then(()=>{if(!window.firebase?.auth)throw new Error("Firebase Auth did not load.");const i=window.firebase.auth(),r=window.firebase.auth.Auth?.Persistence?.LOCAL;return r?i.setPersistence(r).catch(o=>console.warn("Could not enable saved login persistence:",o)):null}).catch(i=>{window.__webMinecraftStartupFirebase=null,console.warn("Startup Firebase setup failed:",i)})})();try{const n="webminecraft_announcement_popup_reset_v1";localStorage.getItem(n)||(localStorage.removeItem("webminecraft_seen_announcement"),localStorage.setItem(n,"1"))}catch{}dn(()=>import("./devControls-DNZL7b5_.js"),[]).catch(n=>console.warn("Developer controls failed to load:",n));dn(()=>import("./devServerControls-CjrXdWjJ.js"),[]).catch(n=>console.warn("Developer server controls failed to load:",n));dn(()=>import("./adminChatFix-1NfSQYiO.js"),[]).catch(n=>console.warn("Admin server chat fix failed to load:",n));dn(()=>import("./adminGameChatFix-CCO8qpUa.js"),[]).catch(n=>console.warn("Admin multiplayer chat styling failed to load:",n));dn(()=>import("./adminManagement-BkLedzfG.js"),[]).catch(n=>console.warn("Admin management failed to load:",n));dn(()=>import("./adminManagementEmailFix-CHvkQfcd.js"),[]).catch(n=>console.warn("Admin email support failed to load:",n));dn(()=>import("./adminControls-Df3gg6Km.js"),[]).catch(n=>console.warn("Admin controls failed to load:",n));dn(()=>import("./accountDevControls-BadiyPCI.js"),[]).catch(n=>console.warn("Account developer controls failed to load:",n));dn(()=>import("./announcementDev-C7mWxVdI.js"),[]).catch(n=>console.warn("Announcement controls failed to load:",n));dn(()=>import("./newsLive-DPsYtMxW.js"),[]).catch(n=>console.warn("Live News tabs failed to load:",n));dn(()=>import("./newsFreshStart-Dtg_5CKV.js"),[]).catch(n=>console.warn("Fresh News start failed to load:",n));dn(()=>import("./announcements-ChTi5Mcf.js"),[]).catch(n=>console.warn("Website announcements failed to load:",n));dn(()=>import("./friendsLive-Cb5aylJE.js"),[]).catch(n=>console.warn("Live friend presence failed to load:",n));dn(()=>import("./friendsPresence-BvDz0rbe.js"),[]).catch(n=>console.warn("Live friend presence failed to load:",n));dn(()=>import("./oauthLogos-D2aBLJ4k.js"),[]).catch(n=>console.warn("OAuth logo UI failed to load:",n));let Qe=null,$t=null,Ua=null,ka=new Map;const Td=new Map;let Ya="idle";const lw="wss://webminecraft-server.onrender.com/multiplayer",OR="https://webminecraft-server.onrender.com";function Lf(n){const e=Math.floor(Number(n?.x)),t=Math.floor(Number(n?.y)),i=Math.floor(Number(n?.z)),r=n?.blockType??n?.type,o=Math.floor(Number(r));[e,t,i,o].every(Number.isFinite)&&Td.set(`${e},${t},${i}`,{x:e,y:t,z:i,type:o})}function Ad(){for(const[n,e]of Td)An(e.x,e.y,e.z,e.type)&&Td.delete(n)}function Cd(){if(document.getElementById("multiplayerChat"))return;const n=document.createElement("style");n.id="multiplayerChatStyles",n.textContent=`
        #multiplayerChat{position:fixed;top:12px;left:12px;width:min(380px,calc(100vw - 24px));z-index:180;display:none;font-family:Arial,sans-serif;text-shadow:1px 1px 2px #000;pointer-events:none}
        #multiplayerChatFeed{box-sizing:border-box;max-height:230px;overflow-y:auto;padding:8px 9px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.16);scrollbar-width:thin}
        .multiplayerChatLine{font-size:13px;line-height:1.4;color:#fff;overflow-wrap:anywhere;margin:2px 0}
        .multiplayerChatSystem{color:#c6c6c6;font-style:italic}
        .multiplayerChatName{font-weight:700}
        .multiplayerChatName.multiplayerChatAdmin{color:#55ff55}
        .multiplayerChatVerify{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;margin-left:3px;margin-right:2px;border-radius:50%;background:#3f8cff;color:#fff;font:700 9px Arial,sans-serif;text-shadow:none;vertical-align:-1px;box-shadow:0 0 2px rgba(0,0,0,.8)}
        #multiplayerChatInput{box-sizing:border-box;width:100%;height:34px;margin-top:6px;padding:6px 9px;background:rgba(0,0,0,.72);color:#fff;border:1px solid rgba(255,255,255,.2);outline:none;pointer-events:auto;font:13px Arial,sans-serif}
        #multiplayerChatInput::placeholder{color:#aaa}
    `,document.head.appendChild(n);const e=document.createElement("div");e.id="multiplayerChat",e.innerHTML='<div id="multiplayerChatFeed" aria-live="polite"></div><input id="multiplayerChatInput" maxlength="120" autocomplete="off" placeholder="Press Enter to chat...">',document.body.appendChild(e);const t=e.querySelector("#multiplayerChatFeed"),i=e.querySelector("#multiplayerChatInput");window.__webminecraftChatAdd=(r,o=!1,a="",s=!1)=>{const l=document.createElement("div");if(l.className=`multiplayerChatLine${o?" multiplayerChatSystem":""}`,o)l.textContent=r;else{const c=!!s||String(a).toLowerCase()==="admin",d=document.createElement("span");if(d.className=`multiplayerChatName${c?" multiplayerChatAdmin":""}`,d.textContent=`${a}: `,l.appendChild(d),c){const f=document.createElement("span");f.className="multiplayerChatVerify",f.textContent="✓",f.title="Verified admin",f.setAttribute("aria-label","Verified admin"),d.insertAdjacentElement("afterend",f)}l.appendChild(document.createTextNode(r))}for(t.appendChild(l);t.children.length>30;)t.firstElementChild.remove();t.scrollTop=t.scrollHeight},window.__webminecraftChatShow=()=>{e.style.display="block"},window.__webminecraftChatHide=()=>{e.style.display="none",i.blur()},i.addEventListener("keydown",r=>{if(r.stopPropagation(),r.key==="Enter"){const o=i.value.trim();if(o&&_r())try{$t.send(JSON.stringify({type:"chat_message",text:o}))}catch{}i.value="",i.blur(),r.preventDefault()}else r.key==="Escape"&&(i.value="",i.blur(),r.preventDefault())})}function Fx(n=""){if(!_r())return;Cd(),window.__webminecraftChatShow?.();const e=document.getElementById("multiplayerChatInput");e&&(e.value=n,e.focus(),e.setSelectionRange(e.value.length,e.value.length))}function zR(){if(document.getElementById("multiplayerMenuStyles"))return;const n=document.createElement("style");n.id="multiplayerMenuStyles",n.textContent=`
        #multiplayerMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(8,12,14,.76);z-index:210;color:#fff;backdrop-filter:blur(3px);animation:mpFadeIn .16s ease-out}
        @keyframes mpFadeIn{from{opacity:0}to{opacity:1}}
        #multiplayerPanel{position:relative;width:min(900px,96vw);max-height:min(92vh,840px);overflow:auto;padding:0;background:linear-gradient(180deg,#2e332f 0%,#202522 100%);border:3px solid #111;border-top-color:#8f9a8f;border-left-color:#8f9a8f;box-shadow:0 14px 0 rgba(0,0,0,.25),10px 10px 0 rgba(0,0,0,.52),0 20px 50px rgba(0,0,0,.35);font-family:Arial,sans-serif}
        #multiplayerPanel::before{content:"";display:block;height:8px;background:repeating-linear-gradient(135deg,#6e8e50 0 10px,#5c7844 10px 20px);border-bottom:3px solid #1a1a1a}
        #multiplayerHero{padding:22px 24px 18px;background:linear-gradient(180deg,#39443a,#2c352e);border-bottom:2px solid #141814;display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
        #multiplayerHeroMain{min-width:0}
        #multiplayerEyebrow{font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:2px;color:#a6bc93;font-weight:800;margin-bottom:8px}
        #multiplayerTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:32px;line-height:1.05;letter-spacing:.3px;text-shadow:3px 3px 0 #111}
        #multiplayerSubtitle{margin:8px 0 0;color:#c3cbc3;font-size:12px;line-height:1.5;max-width:620px}
        #multiplayerLivePill{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:8px 11px;background:#20261f;border:2px solid #111;border-top-color:#68735e;border-left-color:#68735e;color:#d8e4d0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        #multiplayerLiveDot{width:8px;height:8px;background:#7fc15b;box-shadow:0 0 8px rgba(127,193,91,.5)}
        #multiplayerSteps{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 24px;background:#252b26;border-bottom:1px solid #151915}
        .multiplayerStep{display:flex;align-items:center;gap:9px;padding:8px 10px;background:#1b201c;border:1px solid #3d463e;color:#8f9890;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        .multiplayerStepNum{display:grid;place-items:center;width:20px;height:20px;background:#303830;color:#aeb8ad;font-family:"MinecraftFont",monospace;font-size:11px}
        .multiplayerStep.active{background:#30422d;border-color:#6c8b58;color:#edf5e8}
        .multiplayerStep.active .multiplayerStepNum{background:#6d8e52;color:#fff}
        #multiplayerContent{padding:18px 24px 20px}
        .multiplayerSectionHead{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:10px}
        .multiplayerSectionTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:18px;text-shadow:2px 2px 0 #111}
        .multiplayerSectionHint{color:#8f9990;font-size:10px}
        #multiplayerServerList,#multiplayerRoomList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 14px}
        .multiplayerCard{width:100%;min-width:0;text-align:left;padding:14px;background:linear-gradient(180deg,#3a413b,#303632);color:#fff;border:2px solid #111;border-top-color:#788176;border-left-color:#788176;cursor:pointer;box-shadow:0 3px 0 #181d19;transition:transform .12s,filter .12s,background .12s,border-color .12s}
        .multiplayerCard:hover{background:linear-gradient(180deg,#465047,#384139);transform:translateY(-2px);filter:brightness(1.04);border-top-color:#98a995;border-left-color:#98a995}
        .multiplayerCard:active{transform:translateY(1px)}
        .multiplayerOnline,.multiplayerOffline{font-size:10px;font-weight:800;padding:5px 7px;border:1px solid #465241;background:#20261f;white-space:nowrap}
        .multiplayerOnline{color:#a7d57f}.multiplayerOffline{color:#df9387}
        .multiplayerCardTop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}
        .multiplayerCardName{font-family:"MinecraftFont",monospace;font-size:14px;line-height:1.35;text-shadow:2px 2px 0 #111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .multiplayerMeta{color:#aeb6af;font-size:10px;line-height:1.55;overflow-wrap:anywhere}
        .multiplayerEmpty{padding:22px;background:#1b201c;color:#98a099;border:1px dashed #465047;font-size:11px;line-height:1.5;text-align:center;grid-column:1/-1}
        .multiplayerEmpty::before{content:"✦";display:block;margin-bottom:5px;color:#769260;font-size:18px}
        .multiplayerField{margin:0 0 12px}.multiplayerField label{display:block;margin-bottom:6px;color:#d8ded8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px}
        .multiplayerField input{box-sizing:border-box;width:100%;height:42px;padding:8px 11px;background:#171b18;color:#fff;border:2px solid #111;border-top-color:#717a70;border-left-color:#717a70;outline:none;font:12px Arial,sans-serif;box-shadow:inset 0 2px 0 rgba(255,255,255,.03)}
        .multiplayerField input::placeholder{color:#69716b}.multiplayerField input:focus{border-top-color:#92b576;border-left-color:#92b576;box-shadow:0 0 0 2px rgba(125,166,95,.18)}
        #multiplayerSelected{padding:11px 13px;margin-bottom:10px;background:#1b211c;border:1px solid #4a564b;color:#cbd2cb;font-size:11px;line-height:1.5}
        #multiplayerSelected strong{color:#fff;font-family:"MinecraftFont",monospace;text-shadow:1px 1px 0 #111}
        #multiplayerServerType{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 12px}.multiplayerTypeButton{padding:11px;background:#252b26;color:#9ea69f;border:2px solid #111;border-top-color:#717a70;border-left-color:#717a70;cursor:pointer;font-family:"MinecraftFont",monospace;font-size:11px;transition:background .12s,transform .12s}.multiplayerTypeButton:hover{background:#303831}.multiplayerTypeButton:active{transform:translateY(1px)}.multiplayerTypeButton.selected{background:linear-gradient(#587344,#465d37);color:#fff;border-color:#88a86a;box-shadow:0 2px 0 #1b2418}
        #multiplayerPrivateCode{display:none}#multiplayerPrivateCode.visible{display:block}
        #multiplayerStatus{min-height:18px;margin:4px 0 8px;padding:9px 10px;background:#1a1f1b;border-left:3px solid #6f8e58;color:#a8ca8e;font-size:10px;line-height:1.5}
        #multiplayerButtons{display:flex;gap:10px;padding:14px 24px 20px;background:#252b26;border-top:1px solid #151915}.multiplayerButton{min-height:42px;padding:9px 14px;border:2px solid #111;border-top-color:#879184;border-left-color:#879184;background:linear-gradient(#686f69,#505752);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #171b18;transition:transform .1s,filter .1s,background .1s}.multiplayerButton:hover{filter:brightness(1.08)}.multiplayerButton:active{transform:translateY(2px);box-shadow:0 1px 0 #171b18}.multiplayerButton:disabled{opacity:.52;cursor:default;transform:none;filter:none}
        #multiplayerJoin{flex:1;background:linear-gradient(#719251,#57743e)}#multiplayerBack{min-width:170px}#multiplayerRefresh{width:auto;min-width:152px}
        .multiplayerHint{color:#7f8980;font-size:9px;line-height:1.45;margin-top:4px}.multiplayerAdvanced{margin-top:4px;padding-top:12px;border-top:1px solid #3a433c}
        @media(max-width:700px){#multiplayerMenu{padding:10px}#multiplayerHero{padding:18px}.multiplayerLivePill{display:none}#multiplayerSteps{padding:10px 18px}#multiplayerContent{padding:16px 18px 18px}#multiplayerServerList,#multiplayerRoomList{grid-template-columns:1fr}#multiplayerButtons{padding:12px 18px 16px}.multiplayerCardName{font-size:13px}#multiplayerBack{min-width:0}}
        @media(max-width:480px){#multiplayerTitle{font-size:26px}#multiplayerSubtitle{font-size:11px}.multiplayerStep{font-size:9px}.multiplayerStepNum{width:18px;height:18px}.multiplayerSectionTitle{font-size:16px}}
    `,document.head.appendChild(n)}function If(){const n=window.location.hostname||"localhost";return n==="localhost"||n==="127.0.0.1"?`ws://${n}:2567`:lw}function HR(n){const e=document.getElementById("seedInput"),t=document.getElementById("openWorldButton"),i=Number(n);if(!e||!t||!Number.isFinite(i))return;const r=Math.floor(Math.abs(i))>>>0;du(r),e.value=String(r),window.__webminecraftMultiplayerActive=!0,window.__webminecraftMultiplayerPlayerId=Ua,Ya="idle",Cd(),window.__webminecraftChatShow?.(),Qe&&(Qe.style.display="none",Qe.setAttribute("aria-hidden","true")),t.click(),requestAnimationFrame(Ad)}function WR(){if(Qe)return;zR(),Qe=document.createElement("div"),Qe.id="multiplayerMenu",Qe.innerHTML=`
        <div id="multiplayerPanel" role="dialog" aria-modal="true" aria-labelledby="multiplayerTitle">
            <div id="multiplayerHero">
                <div id="multiplayerHeroMain">
                    <div id="multiplayerEyebrow">WebMinecraft • Online</div>
                    <h2 id="multiplayerTitle">Multiplayer</h2>
                    <p id="multiplayerSubtitle">Pick a server, choose a room, and jump into a world with other players.</p>
                </div>
                <div id="multiplayerLivePill"><span id="multiplayerLiveDot"></span>Live servers</div>
            </div>
            <div id="multiplayerSteps">
                <div id="multiplayerStepServer" class="multiplayerStep active"><span class="multiplayerStepNum">1</span><span>Choose a server</span></div>
                <div id="multiplayerStepRoom" class="multiplayerStep"><span class="multiplayerStepNum">2</span><span>Choose a room</span></div>
            </div>
            <div id="multiplayerContent">
                <section id="multiplayerServerView">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Servers</h3><div class="multiplayerSectionHint">Find an online WebMinecraft server</div></div><button id="multiplayerRefresh" class="multiplayerButton" type="button">↻ Refresh</button></div>
                    <div id="multiplayerServerList"><div class="multiplayerEmpty">Loading servers...</div></div>
                    <div class="multiplayerHint">Private servers can still appear here, but they need their private code when you join.</div>
                </section>
                <section id="multiplayerRoomView" style="display:none">
                    <div class="multiplayerSectionHead"><div><h3 class="multiplayerSectionTitle">Rooms</h3><div class="multiplayerSectionHint">Choose where you want to spawn</div></div></div>
                    <div id="multiplayerSelected"></div>
                    <div id="multiplayerRoomList"></div>
                    <div class="multiplayerAdvanced">
                        <div class="multiplayerField"><label for="multiplayerName">Your Player Name</label><input id="multiplayerName" maxlength="16" autocomplete="nickname" placeholder="Player"></div>
                        <div class="multiplayerField"><label for="multiplayerRoom">Room Name</label><input id="multiplayerRoom" maxlength="32" autocomplete="off" placeholder="MyWorld"></div>
                        <div id="multiplayerServerType" role="group" aria-label="Server type"><button id="multiplayerPublic" class="multiplayerTypeButton selected" type="button">PUBLIC</button><button id="multiplayerPrivate" class="multiplayerTypeButton" type="button">PRIVATE</button></div>
                        <div id="multiplayerPrivateCode" class="multiplayerField"><label for="multiplayerPrivateCodeInput">Private Code</label><input id="multiplayerPrivateCodeInput" maxlength="16" autocomplete="off" placeholder="Enter code or leave blank to create"></div>
                        <div class="multiplayerField"><label for="multiplayerServer">Server Address</label><input id="multiplayerServer" autocomplete="off" placeholder="ws://localhost:2567"></div>
                    </div>
                    <div class="multiplayerHint">Public and private servers both work. Private rooms require the correct code.</div>
                    <div id="multiplayerStatus" aria-live="polite"></div>
                </section>
            </div>
            <div id="multiplayerButtons"><button id="multiplayerJoin" class="multiplayerButton" type="button" disabled>Join Room</button><button id="multiplayerBack" class="multiplayerButton" type="button">Back</button></div>
        </div>`,document.body.appendChild(Qe);const n=Qe.querySelector("#multiplayerServerView"),e=Qe.querySelector("#multiplayerRoomView"),t=Qe.querySelector("#multiplayerServerList"),i=Qe.querySelector("#multiplayerRoomList"),r=Qe.querySelector("#multiplayerSelected"),o=Qe.querySelector("#multiplayerRefresh"),a=Qe.querySelector("#multiplayerName"),s=Qe.querySelector("#multiplayerRoom"),l=Qe.querySelector("#multiplayerServer"),c=Qe.querySelector("#multiplayerPublic"),d=Qe.querySelector("#multiplayerPrivate"),f=Qe.querySelector("#multiplayerPrivateCode"),u=Qe.querySelector("#multiplayerPrivateCodeInput"),p=Qe.querySelector("#multiplayerStatus"),m=Qe.querySelector("#multiplayerJoin"),b=Qe.querySelector("#multiplayerBack"),g=Qe.querySelector("#multiplayerStepServer"),h=Qe.querySelector("#multiplayerStepRoom");let _=!1;a.value=localStorage.getItem("webminecraft-player-name")||"Player",s.value=localStorage.getItem("webminecraft-room")||"default",l.value=If();const S=(O,q=!1)=>{p.textContent=O,p.style.color=q?"#ef9a8e":"#a8ca8e",p.style.borderLeftColor=q?"#b96a60":"#6f8e58"},w=O=>{_=!!O,c.classList.toggle("selected",!_),d.classList.toggle("selected",_),f.classList.toggle("visible",_),_||(u.value="")};c.addEventListener("click",()=>w(!1)),d.addEventListener("click",()=>w(!0));const A=()=>{w(!1),e.style.display="none",n.style.display="block",m.disabled=!0,g.classList.add("active"),h.classList.remove("active"),S(""),b.textContent="Back"},M=O=>{i.innerHTML="";const q=[...O.rooms||[]].sort((F,V)=>String(F.id).localeCompare(String(V.id)));if(!q.length){i.innerHTML='<div class="multiplayerEmpty">No rooms are listed yet. Create one below.</div>';return}for(const F of q){const V=document.createElement("button");V.type="button",V.className="multiplayerCard";const X=Number(F.players)||0,k=Number(F.maxPlayers)||0,j=!!(F.private||F.isPrivate);V.innerHTML=`<div class="multiplayerCardTop"><span class="multiplayerCardName">${Ea(F.name||F.id||"Room")}</span><span class="${j?"multiplayerOffline":"multiplayerOnline"}">${j?"🔒 PRIVATE":`${X}${k?`/${k}`:""} online`}</span></div><div class="multiplayerMeta">${Ea(F.id||"default")} • ${j?"Private room • code required":"Joinable room"}</div>`,V.addEventListener("click",()=>{s.value=String(F.id||F.name||"default").slice(0,32),w(j),m.disabled=!1,j?(u.value="",S("🔒 Private room selected. Enter its private code to join."),requestAnimationFrame(()=>{u.focus()})):S(`Selected room "${F.name||F.id||"default"}".`)}),i.appendChild(V)}},C=O=>{n.style.display="none",e.style.display="block",g.classList.remove("active"),h.classList.add("active"),l.value=O.websocket||If(),r.innerHTML=`<strong>${Ea(O.name||"Server")}</strong> · ${Ea(O.description||"Multiplayer server")}`,M(O),m.disabled=!1,S(""),b.textContent="Back to Servers"},v=O=>{if(t.innerHTML="",!O.length){t.innerHTML='<div class="multiplayerEmpty">No servers found.</div>';return}for(const q of O){const F=document.createElement("button");F.type="button",F.className="multiplayerCard";const V=q.online!==!1;F.innerHTML=`<div class="multiplayerCardTop"><span class="multiplayerCardName">${Ea(q.name||"Server")}</span><span class="${V?"multiplayerOnline":"multiplayerOffline"}">${V?"● ONLINE":"○ OFFLINE"}</span></div><div class="multiplayerMeta">${Ea(q.description||"Multiplayer server")} · ${V?"Ready to join":"Unavailable"}</div>`,F.addEventListener("click",()=>C(q)),t.appendChild(F)}},T=()=>({name:"Official WebMinecraft Server",description:"Official multiplayer server",online:!0,websocket:If(),rooms:[]}),P=async()=>{v([T()]),o.disabled=!0;try{const O=await fetch(`${OR}/servers`,{cache:"no-store"});if(!O.ok)throw new Error(`HTTP ${O.status}`);const q=await O.json(),F=(Array.isArray(q.servers)?q.servers:[]).map(V=>({...V,websocket:V.websocket||lw}));v(F.length?F:[T()])}catch(O){console.error("Failed to load multiplayer servers:",O),S("Live server list unavailable. The official server is still available.",!1)}finally{o.disabled=!1}},L=()=>{if($t){try{$t.close()}catch{}$t=null}ka.clear(),Ua=null,Ya="idle",window.__webminecraftMultiplayerActive=!1,window.__webminecraftMultiplayerPlayerId=null,window.__webminecraftChatHide?.(),Qe.style.display="none",Qe.setAttribute("aria-hidden","true"),A(),S(""),m.disabled=!0,m.textContent="Join Room"},B=()=>{const O=l.value.trim(),q=(a.value.trim()||"Player").slice(0,16),F=(s.value.trim()||"default").slice(0,32),V=u.value.trim().slice(0,16);if(!O)return S("Enter a server address.",!0);if(!/^wss?:\/\//i.test(O))return S("Server address must start with ws:// or wss://.",!0);if(!F)return S("Enter a room name.",!0);if($t){try{$t.close()}catch{}$t=null}localStorage.setItem("webminecraft-player-name",q),localStorage.setItem("webminecraft-room",F),m.disabled=!0,m.textContent="Joining...",S("Connecting to server...");try{$t=new WebSocket(O)}catch{m.disabled=!1,m.textContent="Join Room",S("Could not create the connection.",!0);return}$t.addEventListener("open",()=>{S("Connected. Joining room..."),$t.send(JSON.stringify({type:"join",room:F,name:q,private:_,privateCode:V,position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},action:"idle"}))}),$t.addEventListener("message",X=>{let k;try{k=JSON.parse(X.data)}catch{return}if(k.type==="server_info")S(`Server online. ${k.maxPlayers||"?"} player slots available.`);else if(k.type==="joined"){Ua=k.playerId||null,ka=new Map((k.players||[]).filter(ee=>ee.id!==Ua).map(ee=>[ee.id,ee])),Td.clear();for(const ee of k.worldChanges||[])Lf(ee);const j=k.private?` · Private code: ${k.privateCode||"use the code you entered"}`:" · Public";S(`Joined server "${k.serverName||k.room}". Players: ${k.players?.length||1}${j}.`),m.textContent="Connected",HR(Number(k.worldSeed)||0)}else if(k.type==="block_change")Lf(k),Ad();else if(k.type==="chat_system")Cd(),window.__webminecraftChatShow?.(),window.__webminecraftChatAdd?.(String(k.text||""),!0);else if(k.type==="chat_message")Cd(),window.__webminecraftChatShow?.(),window.__webminecraftChatAdd?.(String(k.text||""),!1,String(k.name||"Player"),!!k.isAdmin);else if(k.type==="player_joined")k.player?.id&&k.player.id!==Ua&&ka.set(k.player.id,k.player);else if(k.type==="player_left")k.playerId&&ka.delete(k.playerId);else if(k.type==="world_sync"){if(Number.isFinite(Number(k.worldSeed))){const j=Number(k.worldSeed)>>>0;if(j!==0){du(j);const ee=document.getElementById("seedInput");ee&&Number(ee.value)!==j&&(ee.value=String(j))}}for(const j of k.worldChanges||[])Lf(j);Ad()}else if(k.type==="player_states")for(const j of k.players||[])j.id!==Ua&&ka.set(j.id,j);else k.type==="error"&&(S(k.message||"Server error.",!0),m.disabled=!1,m.textContent="Join Room",k.code==="private_code_required"&&(w(!0),u.value="",requestAnimationFrame(()=>u.focus())))}),$t.addEventListener("close",()=>{window.__webminecraftMultiplayerActive&&S("Disconnected from server.",!0),window.__webminecraftChatHide?.(),m.disabled=!1,m.textContent="Join Room",$t=null}),$t.addEventListener("error",()=>S("Multiplayer connection failed.",!0))};o.addEventListener("click",P),m.addEventListener("click",B),b.addEventListener("click",()=>{e.style.display!=="none"?A():L()}),window.addEventListener("keydown",O=>{if(!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)&&_r()){if(O.key==="/"){O.preventDefault(),O.stopImmediatePropagation(),Fx("/");return}(O.key==="Enter"||O.key.toLowerCase()==="t")&&(O.preventDefault(),O.stopImmediatePropagation(),Fx())}},!0),window.addEventListener("beforeunload",()=>{if($t)try{$t.close()}catch{}}),Qe.addEventListener("click",O=>{O.target===Qe&&A()}),P()}function Ea(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}function _r(){return!!(window.__webminecraftMultiplayerActive&&$t&&$t.readyState===WebSocket.OPEN)}function cw(n,e,t=null){if(!_r())return;const i=Ya!=="idle"?Ya:t||"idle";Ya="idle",$t.send(JSON.stringify({type:"player_state",position:{x:Number(n?.x)||0,y:Number(n?.y)||0,z:Number(n?.z)||0},rotation:{x:Number(e?.x)||0,y:Number(e?.y)||0,z:Number(e?.z)||0},action:["idle","walk","mine","place","jump"].includes(i)?i:"idle"}))}function ki(n){["mine","place","jump"].includes(n)&&(Ya=n)}function br(n,e,t,i){_r()&&$t.send(JSON.stringify({type:"block_change",x:Math.floor(n),y:Math.floor(e),z:Math.floor(t),blockType:Math.floor(i)}))}function dw(){_r()&&Ad()}function uw(){return ka}function GR(){WR(),Qe.style.display="flex",Qe.setAttribute("aria-hidden","false")}const VR=Object.freeze(Object.defineProperty({__proto__:null,getRemotePlayers:uw,isMultiplayerActive:_r,openMultiplayerMenu:GR,sendBlockChange:br,sendPlayerAction:ki,sendPlayerState:cw,syncWorldChanges:dw},Symbol.toStringTag,{value:"Module"})),Ta=new Map;let Ux=!1;const Fc=1.35,kx=[15979190,15120530,13867634,12089170,9854275,7422769],Bx=[1511693,2759186,4861212,7029029,8014379,10709821],Ox=[4157346,6196551,10702403,8477855,12613690,4161915,6712176,4216700],zx=[2571091,3425348,4864047,3753821,4868682,3943986],Hx=[1841173,3156517,5264730,2304565];function Nr(n){let e=2166136261;const t=String(n??"");for(let i=0;i<t.length;i++)e^=t.charCodeAt(i),e=Math.imul(e,16777619);return e>>>0}function gu(n){let e=n>>>0;return()=>{e+=1831565813;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Ei(n,e){const t=new Ae(n);return t.offsetHSL(0,0,e),`#${t.getHexString()}`}function eg(n){const e=document.createElement("canvas");e.width=16,e.height=16;const t=e.getContext("2d");t.imageSmoothingEnabled=!1,n(t);const i=new jo(e);return i.colorSpace=st,i.magFilter=Fe,i.minFilter=Fe,i.generateMipmaps=!1,i.needsUpdate=!0,i}function XR(n,e,t){const i=gu(n^4027431597),r=`#${new Ae(e).getHexString()}`,o=Ei(e,.035),a=Ei(e,-.055),s=`#${new Ae(t).getHexString()}`,l=Ei(t,.04),c=i()>.5?"#171717":"#2b211b";return eg(d=>{d.fillStyle=r,d.fillRect(0,0,16,16),d.fillStyle=a,d.fillRect(0,4,2,9),d.fillRect(14,4,2,9),d.fillRect(2,13,12,3),d.fillStyle=o,d.fillRect(3,5,10,7),d.fillStyle=s,d.fillRect(0,0,16,4),d.fillRect(1,3,14,2);for(let f=1;f<15;f++)i()>.38&&d.fillRect(f,4+Math.floor(i()*2),1,1);i()>.55&&d.fillRect(0,2,2,4),i()>.55&&d.fillRect(14,2,2,4),d.fillStyle=c,d.fillRect(4,7,2,2),d.fillRect(10,7,2,2),i()>.68&&(d.fillStyle="#6d8794",d.fillRect(5,7,1,1),d.fillRect(10,7,1,1)),d.fillStyle=a,d.fillRect(7,9,2,1),d.fillRect(8,10,1,1),d.fillStyle=i()>.5?"#7c3f3d":"#6b3431",d.fillRect(6,12,4,1),i()>.55&&(d.fillStyle=Ei(e,-.025),d.fillRect(3,10,2,1),d.fillRect(11,10,2,1)),d.fillStyle=l,i()>.6&&d.fillRect(4,1,2,1),i()>.6&&d.fillRect(10,2,2,1)})}function Pf(n,e,t,i){const r=gu(n^i*668265261),o=`#${new Ae(e).getHexString()}`,a=Ei(e,.025),s=Ei(e,-.075),l=`#${new Ae(t).getHexString()}`,c=Ei(t,.06);return eg(d=>{if(i===2){d.fillStyle=l,d.fillRect(0,0,16,16),d.fillStyle=c;for(let f=1;f<15;f+=3)for(let u=f%2+1;u<16;u+=4)d.fillRect(u,f,2,1);d.fillStyle=Ei(t,-.055);for(let f=1;f<16;f+=4)d.fillRect(f,12,2,1);return}d.fillStyle=o,d.fillRect(0,0,16,16),d.fillStyle=a;for(let f=0;f<10;f++)d.fillRect(Math.floor(r()*14)+1,Math.floor(r()*13)+2,1,1);d.fillStyle=s;for(let f=0;f<8;f++)d.fillRect(Math.floor(r()*14)+1,Math.floor(r()*13)+2,1,1);if(d.fillStyle=l,i===0){d.fillRect(0,0,16,4),d.fillRect(1,3,14,3);for(let f=0;f<16;f+=3)d.fillRect(f,4,1,2)}else d.fillRect(0,0,16,3),d.fillRect(0,2,5,6),d.fillRect(11,2,5,6);d.fillStyle=c;for(let f=0;f<5;f++)d.fillRect(Math.floor(r()*13)+1,Math.floor(r()*5),1,1)})}function Wx(n,e,t){const i=gu(n^t*73244475),r=Ei(e,-.08),o=Ei(e,.07),a=Ei(e,i()>.5?.13:-.13),s=Math.floor(i()*4);return eg(l=>{l.fillStyle=e,l.fillRect(0,0,16,16);for(let c=0;c<16;c++)for(let d=0;d<16;d++){const f=i();f>.9?(l.fillStyle=o,l.fillRect(d,c,1,1)):f<.08&&(l.fillStyle=r,l.fillRect(d,c,1,1))}if(l.fillStyle=r,s===0)for(let c=2;c<16;c+=4)l.fillRect(c,0,1,16);else if(s===1)for(let c=2;c<16;c+=4)l.fillRect(0,c,16,1);else if(s===2)for(let c=-16;c<32;c+=4)l.fillRect(c,0,1,16);else l.fillRect(0,6,16,2),l.fillRect(6,0,2,16);if(l.fillStyle=a,s===3)l.fillRect(2,2,2,2),l.fillRect(12,3,2,2),l.fillRect(4,12,2,2),l.fillRect(11,11,2,2);else for(let c=0;c<5;c++)l.fillRect(Math.floor(i()*14)+1,Math.floor(i()*14)+1,1,1)})}function Dr(n,e={}){return n instanceof cn?new Xn({map:n,...e}):new Xn({color:n,...e})}function qR(n,e){const t=gu(Nr(n)),i=kx[Math.floor(t()*kx.length)],r=Bx[Math.floor(t()*Bx.length)],o=Ox[Math.floor(t()*Ox.length)],a=zx[Math.floor(t()*zx.length)],s=Hx[Math.floor(t()*Hx.length)],l=XR(Nr(n),i,r),c=Pf(Nr(n),i,r,0),d=Pf(Nr(n),i,r,1),f=Pf(Nr(n),i,r,2),u=Wx(Nr(n),`#${new Ae(o).getHexString()}`,1),p=Wx(Nr(n),`#${new Ae(a).getHexString()}`,2),m=Dr(i),b=Dr(l),g=Dr(c),h=Dr(d),_=Dr(f),S=Dr(u),w=Dr(p),A=Dr(s),M=new Tn;M.userData.multiplayerAvatar=!0;const C=new Oe(new ft(.62,.62,.62),[h,h,_,m,g,b]);C.position.y=1.8;const v=new Oe(new ft(.76,.78,.44),S);v.position.y=1.1;const T=new Oe(new ft(.28,.58,.38),S);T.position.set(-.53,1.23,0);const P=T.clone();P.position.x=.53;const L=new Oe(new ft(.3,.16,.38),m);L.position.set(-.53,.86,0);const B=L.clone();B.position.x=.53;const O=new Oe(new ft(.34,.7,.4),w);O.position.set(-.2,.35,0);const q=O.clone();q.position.x=.2;const F=new Oe(new ft(.36,.18,.46),A);F.position.set(-.2,.09,-.025);const V=F.clone();V.position.x=.2,M.add(C,v,T,P,L,B,O,q,F,V);const X=document.createElement("canvas");X.width=384,X.height=72;const k=X.getContext("2d"),j=String(e||"Player").slice(0,16);k.clearRect(0,0,384,72),k.font="bold 30px Arial",k.textAlign="center",k.textBaseline="middle",k.lineWidth=8,k.strokeStyle="rgba(0,0,0,.9)",k.fillStyle="#fff",k.strokeText(j,192,36),k.fillText(j,192,36);const ee=new jo(X);ee.colorSpace=st,ee.minFilter=sn,ee.magFilter=sn;const ce=new B1(new py({map:ee,transparent:!0,depthTest:!1}));return ce.scale.set(Math.max(1.1,Math.min(2.8,.8+j.length*.13)),.36,1),ce.position.y=2.28,M.add(ce),M.traverse(me=>{me.isMesh&&(me.castShadow=!0,me.receiveShadow=!0)}),{group:M,parts:{head:C,torso:v,leftArm:T,rightArm:P,leftHand:L,rightHand:B,leftLeg:O,rightLeg:q,leftShoe:F,rightShoe:V}}}function Gx(n){const e=new Set;n.traverse(t=>{if(t.geometry&&t.geometry.dispose(),t.material)for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)});for(const t of e)t.map&&t.map.dispose(),t.dispose()}function Th(n,e){return Be.euclideanModulo(e-n+Math.PI,Math.PI*2)-Math.PI}function fw(n){return Be.euclideanModulo(n+Math.PI,Math.PI*2)-Math.PI}function $R(n,e,t){const i=n.parts,r=n.lastPosition,o=n.group.position,a=o.x-r.x,s=o.z-r.z,l=Math.hypot(a,s)/Math.max(n.lastTimeDelta,1/60);if(n.lastPosition.copy(o),n.lastTimeDelta=Math.max((t-n.lastTime)/1e3,1/60),n.lastTime=t,l>.35){const m=Math.atan2(a,-s),b=Th(n.bodyYaw,m);n.bodyYaw=fw(n.bodyYaw+b*.18)}n.group.rotation.y=n.bodyYaw;const c=String(e.action||"")==="walk"||l>.35,d=t*.014+n.walkPhase,f=c?Math.sin(d)*Math.min(.72,.28+l*.08):0,u=c?Math.abs(Math.sin(d*2))*.045:0;i.leftLeg.rotation.x=Be.lerp(i.leftLeg.rotation.x,f,.35),i.rightLeg.rotation.x=Be.lerp(i.rightLeg.rotation.x,-f,.35),i.leftArm.rotation.x=Be.lerp(i.leftArm.rotation.x,-f*.8,.35),i.rightArm.rotation.x=Be.lerp(i.rightArm.rotation.x,f*.8,.35),i.leftHand.rotation.x=Be.lerp(i.leftHand.rotation.x,-f*.35,.35),i.rightHand.rotation.x=Be.lerp(i.rightHand.rotation.x,f*.35,.35),i.torso.position.y=Be.lerp(i.torso.position.y,1.1+u,.3),i.head.position.y=Be.lerp(i.head.position.y,1.8+u*.7,.3);const p=String(e.action||"idle");if(p==="mine"){const m=Math.sin((t-n.actionStarted)*.035),b=-1.05-Math.max(0,m)*.65;i.rightArm.rotation.x=Be.lerp(i.rightArm.rotation.x,b,.5),i.rightHand.rotation.x=Be.lerp(i.rightHand.rotation.x,b*.55,.5),i.torso.rotation.x=Be.lerp(i.torso.rotation.x,-.08,.25)}else if(p==="place"){const m=Math.sin((t-n.actionStarted)*.028),b=-.35+Math.max(0,m)*.9;i.rightArm.rotation.x=Be.lerp(i.rightArm.rotation.x,b,.45),i.rightHand.rotation.x=Be.lerp(i.rightHand.rotation.x,b*.7,.45)}else i.torso.rotation.x=Be.lerp(i.torso.rotation.x,0,.2)}function YR(n){if(!_r()){for(const i of Ta.values())n.remove(i.group),Gx(i.group);Ta.clear();return}const e=uw(),t=performance.now();for(const[i,r]of e){if(!r?.position)continue;let o=Ta.get(i);if(!o){const p=qR(i,r.name);n.add(p.group),o={...p,target:new R,lastPosition:new R(Number(r.position.x)||0,(Number(r.position.y)||0)-1.8,Number(r.position.z)||0),lastTime:t,lastTimeDelta:1/60,walkPhase:Nr(i)%1e3,actionStarted:t,lastAction:"idle",bodyYaw:0},o.group.position.copy(o.lastPosition),Ta.set(i,o)}o.target.set(Number(r.position.x)||0,(Number(r.position.y)||0)-1.8,Number(r.position.z)||0),o.group.position.lerp(o.target,.32);const a=String(r.action||"idle");a!==o.lastAction&&(o.lastAction=a,o.actionStarted=t),$R(o,r,t);const s=Number(r.rotation?.x)||0,l=Be.clamp(s,-1.25,1.25),c=Number(r.rotation?.y)||0;let d=Th(o.bodyYaw,c);if(Math.abs(d)>Fc){const p=Math.abs(d)-Fc,m=d>0?1:-1;o.bodyYaw=fw(o.bodyYaw+m*p*.16),o.group.rotation.y=o.bodyYaw,d=Th(o.bodyYaw,c)}const f=Be.clamp(d,-Fc,Fc),u=o.parts;u.head.rotation.order="YXZ",u.head.rotation.x=Be.lerp(u.head.rotation.x,l,.28),u.head.rotation.y=Be.lerp(u.head.rotation.y,f,.28),u.head.rotation.z=Be.lerp(u.head.rotation.z,0,.35)}for(const[i,r]of Ta)e.has(i)||(n.remove(r.group),Gx(r.group),Ta.delete(i))}function KR(n){if(Ux)return;Ux=!0;const e=()=>{YR(n),requestAnimationFrame(e)};requestAnimationFrame(e)}const ZR="ShortGrassVegetation",Aa=40,JR=700,Ah=1800,ol=.82,pw=.68,jR=180,Ca=7,Vx=22,QR=24,e3=30;let In=null,Gn=null,Sn=null,po=null,Xx=null,qx=!1,Rd=0,$x=0,Yx=null,Df=null,Nf=null,Rl=new Set,ii=null;const zr=new Map;function Ff(n,e,t,i=0){let r=Math.imul((n|0)^2654435769,374761393);return r=Math.imul(r^(e|0),668265263),r=Math.imul(r^(t|0)+i,1274126177),r^=r>>>13,r=Math.imul(r,1103515245),r^=r>>>16,(r>>>0)/4294967295}function t3(){const n=new As().load("/WebMinecraftT/textures/shortgrass.png");return n.magFilter=Fe,n.minFilter=Fe,n.wrapS=En,n.wrapT=En,n.colorSpace=st,n}function n3(){const n=pw*.5;return po=new un,po.setAttribute("position",new gn(new Float32Array([-n,0,0,n,0,0,n,ol,0,-n,ol,0,0,0,-n,0,0,n,0,ol,n,0,ol,-n]),3)),po.setAttribute("uv",new gn(new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]),2)),po.setAttribute("normal",new gn(new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0]),3)),po.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]),po.computeBoundingSphere(),po}function i3(){Sn||(Xx=new Xn({map:t3(),transparent:!0,alphaTest:.45,side:jt,depthWrite:!0,fog:!0}),Sn=new gy(n3(),Xx,Ah),Sn.name="ShortGrassInstancedMesh",Sn.instanceMatrix.setUsage(QS),Sn.frustumCulled=!1,Sn.count=0,In.add(Sn))}function r3(){if(ii)return;const n=pw*.5+.04,e=.03,t=ol+.04,i=n,r=new Float32Array([-n,e,-i,n,e,-i,n,e,-i,n,t,-i,n,t,-i,-n,t,-i,-n,t,-i,-n,e,-i,-n,e,i,n,e,i,n,e,i,n,t,i,n,t,i,-n,t,i,-n,t,i,-n,e,i,-n,e,-i,-n,e,i,n,e,-i,n,e,i,-n,t,-i,-n,t,i,n,t,-i,n,t,i]),o=new un;o.setAttribute("position",new gn(r,3)),ii=new xy(o,new Em({color:16777215,transparent:!0,opacity:.95,depthTest:!0})),ii.name="shortGrassSelectionOutline",ii.visible=!1,ii.renderOrder=20,In.add(ii)}function hw(n,e,t){const i=Math.min(127,Math.floor(t+20)),r=Math.max(-32,Math.floor(t-32));for(let o=i;o>=r;o--){const a=Pe(n,o,e);if(a!==0)return{y:o,type:a}}return null}function o3(n,e,t,i){const r=`${e},${t},${i}`,o=vt();if(zr.has(r)||Pe(e,t,i)!==o.GRAVEL||Pe(e,t-1,i)!==o.AIR)return!1;const a=$l.clone(),s=new Oe(Dy,[a]);return s.position.set(e,t,i),s.castShadow=!0,s.receiveShadow=!0,s.userData.dynamicBlockType="gravel",n.add(s),zr.set(r,{x:e,y:t,z:i,velocity:0,mesh:s}),An(e,t,i,o.AIR)?(br(e,t,i,o.AIR),window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:e,y:t,z:i,type:o.AIR}})),!0):(zr.delete(r),n.remove(s),a.dispose(),!1)}function a3(){if(!Gn||!In?.visible)return;const n=vt(),e=Math.floor(Gn.position.x),t=Math.floor(Gn.position.z),i=Math.min(127,Math.floor(Gn.position.y+Vx)),r=Math.max(-32,Math.floor(Gn.position.y-Vx));for(let o=-Ca;o<=Ca;o++)for(let a=-Ca;a<=Ca;a++){if(a*a+o*o>Ca*Ca)continue;const s=e+a,l=t+o;for(let c=i;c>=r;c--)Pe(s,c,l)===n.GRAVEL&&Pe(s,c-1,l)===n.AIR&&o3(Gn.parent,s,c,l)}}function s3(n){if(zr.size===0)return;const e=vt(),t=Math.min(Math.max(n,0),.05);for(const[i,r]of zr){if(!r.mesh?.parent){zr.delete(i);continue}r.velocity=Math.min(r.velocity+QR*t,e3);const o=r.y,a=o-r.velocity*t,s=Math.floor(a-.5+1e-5);let l=null;for(let c=Math.floor(o-.5+1e-5);c>=s;c--)if(Pe(r.x,c,r.z)!==e.AIR){l=c+1;break}if(l!==null&&l<=o){r.y=l,r.mesh.position.y=l,zr.delete(i);const c=r.mesh;if(c.parent&&c.parent.remove(c),Array.isArray(c.material))for(const d of c.material)d.dispose();An(r.x,l,r.z,e.GRAVEL),br(r.x,l,r.z,e.GRAVEL),window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:r.x,y:l,z:r.z,type:e.GRAVEL}}));continue}if(r.y=a,r.mesh.position.y=a,a<-60){zr.delete(i);const c=r.mesh;if(c.parent&&c.parent.remove(c),Array.isArray(c.material))for(const d of c.material)d.dispose()}}}function Ld(){if(!In||!Gn||!Sn)return;if(In.visible=document.body.classList.contains("webminecraft-in-world"),!In.visible){Sn.count=0,ii&&(ii.visible=!1);return}const n=to();n!==Yx&&(Yx=n,Rd=0,Rl.clear());const e=vt(),t=Math.floor(Gn.position.x),i=Math.floor(Gn.position.z),r=Gn.position.y,o=new at,a=new R;let s=0;for(let l=-Aa;l<=Aa&&s<Ah;l++)for(let c=-Aa;c<=Aa&&s<Ah;c++){if(c*c+l*l>Aa*Aa)continue;const d=t+c,f=i+l;if(Ff(d,f,n,31)>.16)continue;const u=hw(d,f,r);if(!u||u.type!==e.GRASS)continue;const p=`${d},${u.y},${f}`;if(Rl.has(p)||Pe(d,u.y+1,f)!==e.AIR)continue;const m=.84+Ff(d,f,n,59)*.3;o.makeRotationY(Ff(d,f,n,83)*Math.PI*2),o.setPosition(d+.5,u.y+.505,f+.5),a.set(m,m,m),o.scale(a),Sn.setMatrixAt(s++,o)}Sn.count=s,Sn.instanceMatrix.needsUpdate=!0}function mw(){if(!Sn||!In?.visible)return null;const n=new Xl;n.setFromCamera(new De(0,0),Gn);const e=n.intersectObject(Sn,!1)[0];if(!e||e.instanceId==null||e.distance>5)return null;const t=new at;Sn.getMatrixAt(e.instanceId,t);const i=new R().setFromMatrixPosition(t),r=Math.floor(i.x),o=Math.floor(i.z),a=vt(),s=hw(r,o,Gn.position.y);return!s||s.type!==a.GRASS||Pe(r,s.y+1,o)!==a.AIR?null:{x:r,y:s.y,z:o}}function l3(){if(!ii)return;const n=mw();if(!n){ii.visible=!1;return}ii.position.set(n.x+.5,n.y+.505,n.z+.5),ii.visible=!0}function c3(n){if(!Sn||!In?.visible||n.button!==0||n.target?.closest?.("#hotbar, #inventoryScreen, button, input, select, textarea, a"))return;const e=mw();e&&(Rl.add(`${e.x},${e.y},${e.z}`),Ld())}function ad(n){n-Rd>=JR&&(Rd=n,Ld()),n-$x>=jR&&($x=n,a3()),s3((n-(ad.lastTime||n))/1e3),ad.lastTime=n,l3(),requestAnimationFrame(ad)}function gw(n,e){Gn=e,In||(In=new Tn,In.name=ZR,In.renderOrder=5,n.add(In)),i3(),r3(),Df||(Df=new MutationObserver(()=>{In&&(In.visible=document.body.classList.contains("webminecraft-in-world"))}),Df.observe(document.body,{attributes:!0,attributeFilter:["class"]})),Nf||(Nf=t=>{const i=t.detail||{};Number.isFinite(i.x)&&Number.isFinite(i.y)&&Number.isFinite(i.z)&&(i.type!==0?Rl.delete(`${i.x},${i.y-1},${i.z}`):Rl.delete(`${i.x},${i.y},${i.z}`)),Rd=performance.now(),Ld()},window.addEventListener("webminecraft:blockchange",Nf)),qx||(qx=!0,requestAnimationFrame(ad),document.addEventListener("mousedown",c3)),Ld()}const xu=n=>`/WebMinecraftT/textures/${encodeURIComponent(n)}`,xw=new As,bw=xw.load(xu("oak_door_bottom.png")),vw=xw.load(xu("oak_door_top.png"));for(const n of[bw,vw])n.magFilter=Fe,n.minFilter=Fe,n.generateMipmaps=!1,n.colorSpace=st;let Ll=null,yw=!1,Oo=null,Ti=null,ml=!1;const zo=new Map,fs=new Map,Ao=vt(),Hi=Ao.OAK_DOOR??17,Zs=14,d3=-3,u3=4;let Kx=0;function Ki(n,e,t){return`${n},${e},${t}`}function Zx(n){return new Promise((e,t)=>{const i=new Image;i.onload=()=>e(i),i.onerror=t,i.src=xu(n)})}async function f3(){try{const[n,e]=await Promise.all([Zx("oak_door_bottom.png"),Zx("oak_door_top.png")]),t=Math.max(n.naturalWidth||n.width,e.naturalWidth||e.width,1),i=Math.max(n.naturalHeight||n.height,e.naturalHeight||e.height,1),r=document.createElement("canvas");r.width=t,r.height=i*2;const o=r.getContext("2d");if(!o)return;o.imageSmoothingEnabled=!1,o.clearRect(0,0,r.width,r.height),o.drawImage(e,0,0,t,i),o.drawImage(n,0,i,t,i),Ll=r.toDataURL("image/png"),yw=!0,ww(),Ch()}catch(n){console.warn("WebMinecraft: failed to combine oak door textures",n)}}function ww(){if(!Ll)return;const n=['[data-item-id="17"] .catalogTexture','[data-item-id="17"] .hotbarTexture','[data-item-id="17"] .inventoryTexture','.catalogTexture[style*="oak_door_bottom"]','.hotbarTexture[style*="oak_door_bottom"]','.inventoryTexture[style*="oak_door_bottom"]'];document.querySelectorAll(n.join(",")).forEach(e=>{e.style.backgroundImage=`url("${Ll}")`,e.style.backgroundSize="100% 100%",e.style.backgroundPosition="center",e.style.backgroundRepeat="no-repeat",e.style.imageRendering="pixelated"})}function p3(n){const e=new jo(n);return e.colorSpace=st,e.magFilter=Fe,e.minFilter=Fe,e.generateMipmaps=!1,e}function h3(){return Ti?.getObjectByName("WebMinecraftHeldBlock")||null}let Fi=null;function Ch(){const n=h3();if(!n||!yw||!Ll)return;const e=Number.isInteger(window.webMinecraftSelectedSlot)?window.webMinecraftSelectedSlot:0,t=document.querySelectorAll("#hotbar .slot")[e];if(!(Number(t?.dataset.itemId||t?.getAttribute("data-item-id")||0)===Hi||!!t?.querySelector('.hotbarTexture[style*="oak_door_bottom"]'))){Fi&&(Fi.visible=!1);return}if(Fi)Fi.visible=!0;else{const o=new Image;o.onload=()=>{if(Fi)return;const a=p3(o);Fi=new Tn,Fi.name="HeldOakDoor";const s=Array.from({length:6},()=>new Xn({map:a,side:jt})),l=new Oe(new ft(.42,.72,.08),s);l.position.set(-.04,.28,-.24),l.rotation.set(.08,-.22,.1),Fi.add(l),n.add(Fi),Fi.visible=!0},o.src=Ll}}function _w(n,e,t,i="z",r=0){if(!Oo)return null;const o=new Tn,a=i==="x"?new R(n,e,t+.43):new R(n-.43,e,t);o.position.copy(a),o.rotation.y=i==="x"?Math.PI/2:0,o.userData.isDoor=!0,o.userData.doorBase={x:n,y:e,z:t};const s=r||fs.get(Ki(n,e,t))||0;o.userData.open=s!==0,o.userData.openAngle=s,o.userData.facing=i,o.userData.hinge=a.clone();const l=new Tn;l.rotation.y=s;const c=new Oe(new ft(.86,1,.1),new lt({map:bw,color:16777215,side:jt})),d=new Oe(new ft(.86,1,.1),new lt({map:vw,color:16777215,side:jt}));c.position.set(.43,.5,0),d.position.set(.43,1.5,0);for(const f of[c,d])f.userData.isDoor=!0,f.userData.doorBase={x:n,y:e,z:t},l.add(f);return o.add(l),Oo.add(o),zo.set(Ki(n,e,t),o),o}function Sw(n,e,t){const i=zo.get(Ki(n,e,t));i&&(Oo?.remove(i),i.traverse(r=>{r.geometry&&r.geometry.dispose(),r.material&&r.material.dispose()}),zo.delete(Ki(n,e,t)))}function m3(n){if(!n)return!1;const{x:e,y:t,z:i}=n.userData.doorBase,r=Ki(e,t,i);return n.userData.open?fs.set(r,n.userData.openAngle||Math.PI/2):fs.delete(r),!0}function g3(n){if(!n)return!1;const{x:e,z:t}=n.userData.doorBase;if(n.userData.open)n.userData.open=!1,n.userData.openAngle=0;else{const r=n.userData.facing==="x"?Ti.position.x-e:Ti.position.z-t;n.userData.open=!0,n.userData.openAngle=r>=0?Math.PI/2:-Math.PI/2}m3(n);const i=n.children[0];return i&&(i.rotation.y=n.userData.openAngle),!0}function x3(n,e,t){return!fs.has(Ki(n,e,t))}function b3(n){let e=n;for(;e;){if(e.userData?.isDoor&&e.userData?.doorBase){const{x:t,y:i,z:r}=e.userData.doorBase;return zo.get(Ki(t,i,r))||null}e=e.parent}return null}function v3(n,e,t){const i=Pe(n+1,e,t)===Hi||Pe(n-1,e,t)===Hi,r=Pe(n,e,t+1)===Hi||Pe(n,e,t-1)===Hi;return i&&!r?"z":r&&!i?"x":"z"}function Mw(n=!1){if(!Oo||!Ti)return;const e=performance.now();if(!n&&e-Kx<400)return;Kx=e;const t=Math.floor(Ti.position.x),i=Math.floor(Ti.position.y-1),r=Math.floor(Ti.position.z),o=new Set;for(let a=t-Zs;a<=t+Zs;a++)for(let s=r-Zs;s<=r+Zs;s++)for(let l=i+d3;l<=i+u3;l++){if(Pe(a,l,s)!==Hi||Pe(a,l+1,s)!==Hi||Pe(a,l-1,s)===Hi)continue;const c=Ki(a,l,s);o.add(c),zo.has(c)||_w(a,l,s,v3(a,l,s))}for(const[a,s]of zo){const l=s.userData.doorBase;(Math.max(Math.abs(l.x-t),Math.abs(l.z-r))>Zs+3||!Pe(l.x,l.y,l.z)||!Pe(l.x,l.y+1,l.z))&&!o.has(a)&&!s.userData.open&&Sw(l.x,l.y,l.z)}}function Ew(){if(!Oo||!Ti)return null;Mw(!0);const n=new Xl;n.setFromCamera(new De(0,0),Ti),n.near=.01,n.far=5;const e=n.intersectObjects([...zo.values()],!0);n.near=0,n.far=1/0;const t=e.find(o=>o.distance<=5);if(!t)return null;const i=b3(t.object);if(!i)return null;const r=i.userData.doorBase;return{door:i,x:r.x,y:r.y,z:r.z,hit:t,normal:t.face?.normal?.clone()||new R(0,0,1),isDoor:!0}}function Rh(n){const e=Ew();if(!e)return!1;if(n==="break"){const{x:t,y:i,z:r}=e;return fs.delete(Ki(t,i,r)),An(t,i,r,Ao.AIR),An(t,i+1,r,Ao.AIR),Sw(t,i,r),!0}return n==="use"?g3(e.door):!1}function y3(){return ml}function w3(n,e){if(Oo=n,Ti=e,!document.getElementById("doorSelectButton")){const t=document.createElement("button");t.id="doorSelectButton",t.type="button",t.title="Oak Door",t.setAttribute("aria-label","Oak Door"),t.innerHTML='<span class="doorIcon"></span><span class="doorLabel">Door</span>',Object.assign(t.style,{position:"fixed",left:"50%",bottom:"84px",transform:"translateX(-50%)",width:"58px",height:"58px",padding:"4px",display:"none",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px",zIndex:"10001",border:"2px solid #555",background:"rgba(35,35,35,.96)",color:"#fff",cursor:"pointer",imageRendering:"pixelated"});const i=document.createElement("style");i.textContent=`#doorSelectButton .doorIcon{display:block;width:28px;height:36px;background:url('${xu("oak_door_bottom.png")}') center/100% 100% no-repeat;image-rendering:pixelated}#doorSelectButton .doorLabel{font:700 9px Arial,sans-serif;text-shadow:1px 1px 0 #000}#doorSelectButton.selected{border-color:#fff;box-shadow:0 0 0 2px #222}body.mobile-mode.webminecraft-in-world #doorSelectButton{bottom:76px}body.webminecraft-in-world #doorSelectButton{display:flex}body:not(.webminecraft-in-world) #doorSelectButton{display:none}`,document.head.appendChild(i),document.body.appendChild(t),t.addEventListener("click",r=>{r.preventDefault(),ml=!ml,t.classList.toggle("selected",ml)})}document.addEventListener("webminecraft:selectedslot",Ch),Ch(),Mw(!0)}function _3(n){if(!Oo||!Ti||!n)return!1;const e=n.normal.clone().set(Math.round(n.normal.x),Math.round(n.normal.y),Math.round(n.normal.z));if(e.y<0)return!1;const t=n.x+e.x,i=n.y+e.y,r=n.z+e.z;if(Pe(t,i,r)!==Ao.AIR||Pe(t,i+1,r)!==Ao.AIR||Pe(t,i-1,r)===Ao.AIR)return!1;const o=Math.abs(e.x)>Math.abs(e.z)?"x":"z";return fs.delete(Ki(t,i,r)),An(t,i,r,Hi)?An(t,i+1,r,Hi)?(_w(t,i,r,o),ml=!1,document.getElementById("doorSelectButton")?.classList.remove("selected"),!0):(An(t,i,r,Ao.AIR),!1):!1}function Tw(){return Ew()}f3();const Jx=new MutationObserver(ww);document.body?Jx.observe(document.body,{childList:!0,subtree:!0}):window.addEventListener("DOMContentLoaded",()=>Jx.observe(document.body,{childList:!0,subtree:!0}),{once:!0});let ir=0,Wn=0,rr=0,cr=!1,Uf=!1,jx=0;const S3=.8,tg=1.8,qr=S3/2,M3=4.3,E3=5.6,T3=10,A3=18,C3=32,R3=8,L3=24,I3=1.5,P3=24,D3=8,N3=.6,$n=.001,et=0,F3=1/120;function no(n,e,t){const i=Pe(n,e,t);return i?i===17?x3(n,e,t):!0:!1}function Zl(n){return{minX:n.position.x-qr,maxX:n.position.x+qr,minY:n.position.y-tg,maxY:n.position.y,minZ:n.position.z-qr,maxZ:n.position.z+qr}}function U3(n,e,t,i){return n.minX<e+.5-et&&n.maxX>e-.5+et&&n.minY<t+.5-$n&&n.maxY>t-.5+$n&&n.minZ<i+.5-et&&n.maxZ>i-.5+et}function Ho(n){const e=Zl(n),t=Math.floor(e.minX-.5),i=Math.floor(e.maxX+.5),r=Math.floor(e.minY-.5),o=Math.floor(e.maxY+.5),a=Math.floor(e.minZ-.5),s=Math.floor(e.maxZ+.5);for(let l=t;l<=i;l++)for(let c=r;c<=o;c++)for(let d=a;d<=s;d++)if(no(l,c,d)&&U3(e,l,c,d))return!0;return!1}function Qx(n){const e=Zl(n),t=e.minY,i=Math.floor(t-.5),r=Math.floor(e.minX+et),o=Math.floor(e.maxX-et),a=Math.floor(e.minZ+et),s=Math.floor(e.maxZ-et);let l=-1/0;for(let c=r;c<=o;c++)for(let d=a;d<=s;d++)for(let f=i-1;f<=i+1;f++){if(!no(c,f,d)||!(e.maxX>c-.5+et&&e.minX<c+.5-et&&e.maxZ>d-.5+et&&e.minZ<d+.5-et))continue;const p=f+.5;p<=t+.08&&p>=t-.08&&(l=Math.max(l,p))}if(l!==-1/0&&Wn<=0){n.position.y=l+tg,Wn=0,cr=!0;return}cr=!1}function ng(n){return{minX:Math.floor(n.minX-.5),maxX:Math.floor(n.maxX+.5),minY:Math.floor(n.minY-.5),maxY:Math.floor(n.maxY+.5),minZ:Math.floor(n.minZ-.5),maxZ:Math.floor(n.maxZ+.5)}}function Aw(n,e,t){if(!cr||Wn>0)return!1;const i=n.position.x,r=n.position.y,o=n.position.z;return n.position.y+=N3,Ho(n)||(n.position[e]+=t,Ho(n))?(n.position.set(i,r,o),!1):!0}function k3(n,e){if(e===0||(n.position.x+=e,!Ho(n))||(n.position.x-=e,Aw(n,"x",e)))return!0;n.position.x+=e;const t=Zl(n),i=ng(t);let r=!1;if(e>0){let o=1/0;for(let a=i.minX;a<=i.maxX;a++)for(let s=i.minY;s<=i.maxY;s++)for(let l=i.minZ;l<=i.maxZ;l++){if(!no(a,s,l))continue;const c=a-.5;t.minX<c&&t.maxY>s-.5+$n&&t.minY<s+.5-$n&&t.maxZ>l-.5+et&&t.minZ<l+.5-et&&(o=Math.min(o,c-qr-et))}o!==1/0&&(n.position.x=o,r=!0)}else{let o=-1/0;for(let a=i.minX;a<=i.maxX;a++)for(let s=i.minY;s<=i.maxY;s++)for(let l=i.minZ;l<=i.maxZ;l++){if(!no(a,s,l))continue;const c=a+.5;t.maxX>c&&t.maxY>s-.5+$n&&t.minY<s+.5-$n&&t.maxZ>l-.5+et&&t.minZ<l+.5-et&&(o=Math.max(o,c+qr+et))}o!==-1/0&&(n.position.x=o,r=!0)}return(!r||Ho(n))&&(n.position.x-=e),!1}function B3(n,e){if(e===0||(n.position.z+=e,!Ho(n))||(n.position.z-=e,Aw(n,"z",e)))return!0;n.position.z+=e;const t=Zl(n),i=ng(t);let r=!1;if(e>0){let o=1/0;for(let a=i.minX;a<=i.maxX;a++)for(let s=i.minY;s<=i.maxY;s++)for(let l=i.minZ;l<=i.maxZ;l++){if(!no(a,s,l))continue;const c=l-.5;t.minZ<c&&t.maxX>a-.5+et&&t.minX<a+.5-et&&t.maxY>s-.5+$n&&t.minY<s+.5-$n&&(o=Math.min(o,c-qr-et))}o!==1/0&&(n.position.z=o,r=!0)}else{let o=-1/0;for(let a=i.minX;a<=i.maxX;a++)for(let s=i.minY;s<=i.maxY;s++)for(let l=i.minZ;l<=i.maxZ;l++){if(!no(a,s,l))continue;const c=l+.5;t.maxZ>c&&t.maxX>a-.5+et&&t.minX<a+.5-et&&t.maxY>s-.5+$n&&t.minY<s+.5-$n&&(o=Math.max(o,c+qr+et))}o!==-1/0&&(n.position.z=o,r=!0)}return(!r||Ho(n))&&(n.position.z-=e),!1}function O3(n,e){if(e===0||(n.position.y+=e,!Ho(n)))return;const t=Zl(n),i=ng(t);if(e<0){let o=-1/0;for(let a=i.minX;a<=i.maxX;a++)for(let s=i.minY;s<=i.maxY;s++)for(let l=i.minZ;l<=i.maxZ;l++){if(!no(a,s,l))continue;const c=s+.5;t.minY<c&&t.maxY>s-.5+$n&&t.maxX>a-.5+et&&t.minX<a+.5-et&&t.maxZ>l-.5+et&&t.minZ<l+.5-et&&(o=Math.max(o,c))}n.position.y=o!==-1/0?o+tg:n.position.y-e,Wn=0,cr=!0;return}let r=1/0;for(let o=i.minX;o<=i.maxX;o++)for(let a=i.minY;a<=i.maxY;a++)for(let s=i.minZ;s<=i.maxZ;s++){if(!no(o,a,s))continue;const l=a-.5;t.maxY>l&&t.minY<a+.5-$n&&t.maxX>o-.5+et&&t.minX<o+.5-et&&t.maxZ>s-.5+et&&t.minZ<s+.5-et&&(r=Math.min(r,l))}n.position.y=r!==1/0?r-$n:n.position.y-e,Wn=0}function ho(n,e,t){return n<e?Math.min(n+t,e):n>e?Math.max(n-t,e):e}function z3(n,e){if(Jr){const m=-Math.sin(_n),b=-Math.cos(_n),g=Math.cos(_n),h=-Math.sin(_n);let _=Le.moveX*g+Le.moveZ*m,S=Le.moveX*h+Le.moveZ*b;ot.KeyW&&(_+=m,S+=b),ot.KeyS&&(_-=m,S-=b),ot.KeyA&&(_-=g,S-=h),ot.KeyD&&(_+=g,S+=h);const w=Math.hypot(_,S);w>1&&(_/=w,S/=w);const M=ot.ShiftLeft||ot.ShiftRight||Le.sprint?A3:T3,C=_*M,v=S*M;ir=ho(ir,C,45*e),rr=ho(rr,v,45*e);let T=0;(ot.Space||Le.jump)&&(T+=1),(ot.ControlLeft||ot.ControlRight)&&(T-=1),Wn=ho(Wn,T*M,45*e),n.position.x+=ir*e,n.position.y+=Wn*e,n.position.z+=rr*e,cr=!1,Uf=!!ot.Space||Le.jump;return}Qx(n);const t=-Math.sin(_n),i=-Math.cos(_n),r=Math.cos(_n),o=-Math.sin(_n);let a=Le.moveX*r+Le.moveZ*t,s=Le.moveX*o+Le.moveZ*i;ot.KeyW&&(a+=t,s+=i),ot.KeyS&&(a-=t,s-=i),ot.KeyA&&(a-=r,s-=o),ot.KeyD&&(a+=r,s+=o);const l=Math.hypot(a,s);l>1&&(a/=l,s/=l);const d=(ot.ShiftLeft||ot.ShiftRight||Le.sprint)&&(ot.KeyW||Math.hypot(Le.moveX,Le.moveZ)>.65)?E3:M3,f=a*d,u=s*d;if(l>.02){const m=cr?C3:R3;ir=ho(ir,f,m*e),rr=ho(rr,u,m*e)}else{const m=cr?L3:I3;ir=ho(ir,0,m*e),rr=ho(rr,0,m*e)}const p=!!ot.Space||Le.jump;p&&!Uf&&cr&&(Wn=D3,cr=!1),Uf=p,Wn-=P3*e,Wn=Math.max(Wn,-40),k3(n,ir*e)||(ir=0),B3(n,rr*e)||(rr=0),O3(n,Wn*e),Qx(n)}function H3(n){if(!_r())return;const e=performance.now();e-jx<50||(jx=e,cw({x:n.position.x,y:n.position.y,z:n.position.z},{x:di,y:_n,z:0}))}function W3(n,e,t=1/60){t=Math.min(t,.05),n.rotation.order="YXZ",n.rotation.y=_n,n.rotation.x=di;let i=t;for(;i>0;){const r=Math.min(i,F3);z3(n,r),i-=r}n.rotation.y=_n,n.rotation.x=di,H3(n),dw()}const ps=36,ig=9,Ka=64,Cw=6,Lh=[{id:1,name:"Grass Block",texture:"grass_block_side.png",category:"natural"},{id:2,name:"Dirt",texture:"dirt.png",category:"natural"},{id:3,name:"Stone",texture:"stone.png",category:"natural"},{id:4,name:"Sand",texture:"sand.png",category:"natural"},{id:5,name:"Oak Log",texture:"oak_log_top.png",category:"natural"},{id:6,name:"Oak Leaves",texture:"oak-leaves-normal-original-default.png",category:"natural"},{id:7,name:"Cobblestone",texture:"cobblestone.png",category:"natural"},{id:8,name:"Gravel",texture:"gravel.png",category:"natural"},{id:9,name:"Sandstone",texture:"sandstone.png",category:"natural"},{id:10,name:"Bedrock",texture:"bedrock.png",category:"natural"},{id:11,name:"Coal Ore",texture:"coal_ore.png",category:"natural"},{id:12,name:"Iron Ore",texture:"iron_ore.png",category:"natural"},{id:13,name:"Oak Planks",texture:"oak_planks.png",category:"natural"},{id:14,name:"Snow",texture:"snow.png",category:"natural"},{id:15,name:"TNT",texture:"tnt_side.png",category:"tools"},{id:16,name:"Flint and Steel",texture:"Flint_and_Steel_JE4_BE2.png",category:"tools"},{id:17,name:"Oak Door",texture:"oak_door_bottom.png",category:"tools"},{id:18,name:"Bricks",texture:"bricks.png",category:"natural"},{id:19,name:"Stone Bricks",texture:"stone_bricks.png",category:"natural"},{id:20,name:"Cracked Stone Bricks",texture:"cracked_stone_bricks.png",category:"natural"},{id:21,name:"Mossy Stone Bricks",texture:"mossy_stone_bricks.png",category:"natural"},{id:22,name:"Dirt Path",texture:"dirt_path_top.png",category:"natural"}],G3=[{id:"tools",label:"Tools & Utilities",icon:"⚒"},{id:"natural",label:"Natural Blocks",icon:"◆"},{id:"search",label:"Search",icon:"⌕"},{id:"survival",label:"Survival Inventory",icon:"▣"}];let Tt=Array.from({length:ps},()=>null),Za=!1,si="natural",hs="",ms=null,Co=null,_o=null,kf=null,Bf=new Map;function bu(n){return`/WebMinecraftT/textures/${encodeURIComponent(n)}`}function gs(n){return Lh.find(e=>e.id===Number(n))||null}function V3(n){if(!n||!Number.isFinite(Number(n.itemId))||!Number.isFinite(Number(n.count)))return null;const e=Math.floor(Number(n.itemId)),t=gs(e);if(!t)return null;const i=Math.max(1,Math.min(Ka,Math.floor(Number(n.count))));return{itemId:e,count:i,texture:n.texture||t.texture||null}}function Rw(n){return!Array.isArray(n)||n.length!==ps?Array.from({length:ps},()=>null):n.map(V3)}function Is(){Tt=Rw(Tt);try{localStorage.setItem("webminecraft_inventory",JSON.stringify(Tt))}catch{}}function X3(){Tt=Array.from({length:ps},()=>null);try{localStorage.setItem("webminecraft_inventory_ui_version",String(Cw)),Is()}catch{}}function eb(){let n=null;try{n=Number(localStorage.getItem("webminecraft_inventory_ui_version"))}catch{}if(n!==Cw){X3();return}try{const e=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]");if(Array.isArray(e)&&e.length===ps){Tt=Rw(e);try{localStorage.setItem("webminecraft_inventory",JSON.stringify(Tt))}catch{}}}catch{}}function q3(n,e=1){const t=gs(n);if(!t)return!1;let i=e;for(const r of Tt){if(i<=0)break;if(r?.itemId===n&&r.count<Ka){const o=Math.min(i,Ka-r.count);r.count+=o,i-=o}}for(let r=0;r<Tt.length&&i>0;r++)if(!Tt[r]){const o=Math.min(i,Ka);Tt[r]={itemId:n,count:o,texture:t.texture||null},i-=o}return Is(),io(),i===0}function $3(n,e=1){const t=Tt[n];return!t||t.count<e?!1:(t.count-=e,t.count<=0&&(Tt[n]=null),Is(),io(),!0)}function Lw(){let n=!1;for(let e=0;e<ig;e++)Tt[e]!==null&&(Tt[e]=null,n=!0);n&&Is(),io(),$r()}function tb(n){return hs.trim()?n.name.toLowerCase().includes(hs.trim().toLowerCase()):!0}function Y3(){return si==="search"?Lh.filter(tb):si==="survival"?[]:Lh.filter(n=>n.category===si&&tb(n))}function K3(n){return n==="tools"?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.2a5 5 0 0 0-6.1 6.1l-5 5a2 2 0 0 0 2.8 2.8l5-5a5 5 0 0 0 6.1-6.1l-3 3-2-2 3-3Z"/><path d="m15 15 5.2 5.2M17.8 12.2l4-4M19.8 4.2l1.9 1.9"/></svg>':n==="natural"?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c4.9 2.5 8 6.1 8 10.1A8 8 0 1 1 4 13.1C4 9.8 6.7 6 12 3Z"/><path d="M12 21c0-5 1.8-9 5.9-12"/></svg>':n==="building"?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l8-5 8 5v12H4Z"/><path d="M8 20v-6h8v6M7 9h2M15 9h2M7 12h2M15 12h2"/></svg>':n==="search"?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v13H4z"/><path d="M7 6.5v-2h10v2M7 10h10M7 14h4"/></svg>'}function Z3(n){return n.texture?`<span class="catalogIcon catalogTexture" style="background-image:url('${bu(n.texture)}')"></span><span class="catalogFallback">${n.name.charAt(0)}</span>`:'<span class="catalogIcon catalogColor" style="--item-color:#777"></span>'}function J3(){if(document.getElementById("inventoryScreen"))return;const n=document.createElement("div");n.id="inventoryScreen",n.innerHTML=`
        <div id="inventoryPanel">
            <div id="inventoryTopBar">
                <div id="inventoryTitle">Creative</div>
                <button id="inventoryClose" type="button" aria-label="Close inventory">×</button>
            </div>
            <div id="creativeTabs" role="tablist" aria-label="Inventory categories"></div>
            <div id="inventoryBody">
                <div id="catalogPanel">
                    <div id="catalogToolbar">
                        <div id="catalogSectionName">Natural Blocks</div>
                        <div id="catalogSearchWrap"><span class="searchIcon">⌕</span><input id="catalogSearch" type="search" autocomplete="off" spellcheck="false" placeholder="Search" aria-label="Search items"></div>
                    </div>
                    <div id="catalogViewport"><div id="catalogGrid"></div></div>
                </div>
                <div id="survivalPanel" hidden></div>
            </div>
            <div id="inventoryBottom">
                <div id="destroySlot" class="destroySlot" title="Destroy item" aria-label="Destroy item">×</div>
                <div id="hotbarInventory"></div>
                <div id="offhandSlot" class="offhandSlot" title="Off-hand"></div>
            </div>
        </div>`,document.body.appendChild(n);const e=document.createElement("button");e.id="inventoryMobileButton",e.type="button",e.textContent="▣",e.title="Inventory",e.setAttribute("aria-label","Inventory"),e.addEventListener("click",Pw),document.body.appendChild(e);const t=document.createElement("div");t.id="heldBlock",t.setAttribute("aria-hidden","true"),document.body.appendChild(t);const i=document.createElement("style");i.id="webMinecraftInventoryStyles",i.textContent=`
#inventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.64);z-index:999999;pointer-events:auto;font-family:Arial,sans-serif;color:#fff}
#inventoryScreen.open{display:flex}
body.inventory-open #hotbar.textured-hotbar{display:none!important}
#inventoryPanel{position:relative;z-index:1000000;width:min(900px,94vw);height:min(690px,91vh);display:flex;flex-direction:column;padding:10px;background:#3b3b3b;border:3px solid #151515;border-top-color:#777;border-left-color:#777;box-shadow:10px 10px 0 rgba(0,0,0,.58),inset 2px 2px 0 #5b5b5b;image-rendering:pixelated;overflow:hidden}
#inventoryTopBar{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 4px 6px;flex:0 0 auto}
#inventoryTitle{font-size:22px;font-weight:700;text-shadow:2px 2px 0 #171717}
#inventoryClose{width:38px;height:36px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#696969;color:#fff;font-size:27px;line-height:25px;cursor:pointer;box-shadow:inset -2px -2px 0 #444}
#creativeTabs{display:flex;gap:6px;flex:0 0 auto;padding:0 3px 8px;border-bottom:2px solid #171717}
.inventoryTab{width:54px;height:48px;border:2px solid #161616;border-top-color:#8b8b8b;border-left-color:#8b8b8b;background:#5e5e5e;color:#ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:inset -2px -2px 0 #444;position:relative}
.inventoryTab:hover{filter:brightness(1.14)}.inventoryTab.active{background:#898989;border-color:#f0f0f0;color:#fff;transform:translateY(1px)}
.inventoryTab svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:square;stroke-linejoin:miter}.inventoryTab:nth-child(2) svg{fill:currentColor;stroke:currentColor}
#inventoryBody{min-height:0;flex:1;display:flex;padding-top:10px}
#catalogPanel{min-width:0;flex:1;display:flex;flex-direction:column;background:#252525;border:2px solid #111;padding:8px}
#catalogToolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex:0 0 auto}
#catalogSectionName{font-size:16px;font-weight:700;text-shadow:1px 1px 0 #000}
#catalogSearchWrap{width:min(300px,45%);height:34px;display:flex;align-items:center;border:2px solid #121212;background:#131313;box-shadow:inset 2px 2px 0 #080808}
#catalogSearchWrap .searchIcon{font-size:22px;color:#aaa;padding:0 5px 2px}
#catalogSearch{width:100%;height:100%;border:0;outline:0;background:transparent;color:#fff;padding:0 8px;font-size:14px}
#catalogSearch::placeholder{color:#858585}
#catalogViewport{min-height:0;flex:1;overflow-y:auto;overflow-x:hidden;padding:2px 2px 2px 1px;scrollbar-color:#777 #171717;scrollbar-width:thin}
#catalogGrid{display:grid;grid-template-columns:repeat(9,minmax(44px,1fr));gap:5px;align-content:start}
.catalogSlot{position:relative;min-width:0;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#858585;cursor:grab;box-shadow:inset -1px -1px 0 #444;touch-action:none}
.catalogSlot:active{cursor:grabbing}.catalogSlot:hover{filter:brightness(1.13);border-color:#fff}
.catalogIcon{position:absolute;inset:6px;display:block}.catalogTexture{background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.catalogTexture{background-color:transparent}
.catalogFallback{position:absolute;inset:6px;display:none;align-items:center;justify-content:center;font-size:22px;font-weight:700;text-shadow:2px 2px 0 #222;background:#666;color:#fff}
.catalogColor{background:var(--item-color);box-shadow:inset 3px 3px 0 rgba(255,255,255,.14),inset -3px -3px 0 rgba(0,0,0,.2)}
.catalogName{position:absolute;left:2px;right:2px;bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:8px;text-shadow:1px 1px 0 #000;opacity:0;pointer-events:none}
.catalogSlot:hover .catalogName{opacity:1}
#survivalPanel{flex:1;background:#252525;border:2px solid #111;padding:10px}
#inventoryBottom{height:96px;flex:0 0 auto;display:grid;grid-template-columns:76px 1fr 76px;align-items:center;gap:12px;padding-top:10px}
#hotbarInventory{display:grid;grid-template-columns:repeat(9,minmax(42px,58px));justify-content:center;gap:5px}
.inventorySlot,.destroySlot,.offhandSlot{position:relative;aspect-ratio:1;border:2px solid #5d5d5d;border-top-color:#202020;border-left-color:#202020;background:#858585;box-shadow:inset -1px -1px 0 #444;min-width:0}
.inventorySlot{cursor:grab;touch-action:none}.inventorySlot:hover{filter:brightness(1.12);border-color:#fff}.inventorySlot.dragging{opacity:.42}
.slotTexture{position:absolute;inset:6px;background-position:center;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.slotFallback{position:absolute;inset:6px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;text-shadow:2px 2px 0 #222}
.slotCount{position:absolute;right:3px;bottom:1px;font:bold 14px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none}.slotNumber{position:absolute;left:3px;top:1px;font:bold 11px Arial,sans-serif;text-shadow:1px 1px 0 #000;pointer-events:none}
.destroySlot,.offhandSlot{width:64px;height:64px;justify-self:center;display:flex;align-items:center;justify-content:center;font-size:38px;color:#d33;background:#5b3838;cursor:pointer}
.destroySlot{color:#f14}.destroySlot:hover{background:#733b3b;filter:brightness(1.15)}.offhandSlot{color:#bbb;font-size:13px;cursor:default}
.offhandSlot::after{content:"";position:absolute;inset:10px;border:2px dashed #aaa;opacity:.35}
#inventoryMobileButton{display:none;position:fixed;right:18px;bottom:84px;width:54px;height:54px;z-index:10001;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:#555;color:#fff;font-size:27px;box-shadow:0 3px 0 #171717;touch-action:manipulation}
body.mobile-mode.webminecraft-in-world #inventoryMobileButton{display:block;left:calc(50% - min(252px,45vw) - 66px);right:auto;bottom:8px;z-index:10001}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{z-index:10000!important;bottom:8px!important}
#heldBlock{display:none!important;pointer-events:none}
@media(max-width:700px){#inventoryPanel{width:96vw;height:94vh;padding:7px}#catalogGrid{grid-template-columns:repeat(6,minmax(42px,1fr))}#creativeTabs{gap:4px}.inventoryTab{width:48px;height:44px}#catalogToolbar{align-items:flex-start;flex-direction:column;gap:6px}#catalogSearchWrap{width:100%}#inventoryBottom{grid-template-columns:54px 1fr 54px;gap:5px}#hotbarInventory{grid-template-columns:repeat(9,minmax(27px,1fr));gap:3px}.destroySlot,.offhandSlot{width:50px;height:50px;font-size:30px}}
`,document.head.appendChild(i),Il(),document.getElementById("catalogSearch").addEventListener("input",r=>{hs=r.target.value,hs.trim()&&(si="search"),Il(),Pl()}),n.addEventListener("pointerdown",r=>{r.target===n&&gl()}),document.getElementById("inventoryClose").addEventListener("click",gl),document.getElementById("destroySlot").addEventListener("dragover",r=>r.preventDefault()),document.getElementById("destroySlot").addEventListener("drop",r=>{r.preventDefault(),Co!==null?(Tt[Co]=null,Co=null,Is(),io()):ms&&(ms=null)})}function Il(){const n=document.getElementById("creativeTabs");n&&(n.innerHTML=G3.map(e=>`<button class="inventoryTab${si===e.id?" active":""}" type="button" data-tab="${e.id}" title="${e.label}" aria-label="${e.label}">${K3(e.id)}</button>`).join(""),n.querySelectorAll(".inventoryTab").forEach(e=>e.addEventListener("click",()=>{if(si=e.dataset.tab,si!=="search"){hs="";const t=document.getElementById("catalogSearch");t&&(t.value="")}Il(),Pl(),Dl()})))}function Pl(){const n=document.getElementById("catalogGrid"),e=document.getElementById("catalogSectionName"),t=document.getElementById("catalogSearchWrap");if(!n||!e)return;if(si==="survival"){document.getElementById("catalogPanel").style.display="none",document.getElementById("survivalPanel").hidden=!1;return}document.getElementById("catalogPanel").style.display="flex",document.getElementById("survivalPanel").hidden=!0,e.textContent=si==="search"?"Search Results":si==="tools"?"Tools & Utilities":"Natural Blocks",t&&(t.style.display=si==="search"||hs?"flex":"none");const i=Y3();n.innerHTML=i.length?i.map(r=>`<div class="catalogSlot" draggable="true" data-item-id="${r.id}" title="${r.name}">${Z3(r)}<span class="catalogName">${r.name}</span></div>`).join(""):'<div style="grid-column:1/-1;color:#999;text-align:center;padding:30px 10px;font-size:13px">No items found</div>',n.querySelectorAll(".catalogSlot").forEach(r=>{const o=Number(r.dataset.itemId);r.addEventListener("dragstart",a=>{ms=o,r.style.opacity=".45",a.dataTransfer.effectAllowed="copy",a.dataTransfer.setData("text/plain",String(o))}),r.addEventListener("dragend",()=>{ms=null,r.style.opacity=""}),r.addEventListener("click",()=>q3(o,Ka))}),n.querySelectorAll(".catalogTexture").forEach(r=>{const o=r.nextElementSibling;r.addEventListener("error",()=>{r.style.display="none",o&&(o.style.display="flex")})})}function Iw(n,e,t={}){const i=document.createElement("div");if(i.className=t.extraClass||"inventorySlot",i.draggable=!!n,n){const r=gs(n.itemId);if(r){const o=n.texture||r.texture,a=o?`<span class="slotTexture" style="background-image:url('${bu(o)}')"></span><span class="slotFallback">${r.name.charAt(0)}</span>`:'<span class="slotTexture" style="background:#777"></span>';i.innerHTML=a+`<span class="slotCount">${n.count>1?n.count:""}</span>`+(t.hotbar?`<span class="slotNumber">${e+1}</span>`:""),i.title=`${r.name} (${n.count})`,i.addEventListener("dragstart",s=>{Co=e,i.classList.add("dragging"),s.dataTransfer.effectAllowed="move",s.dataTransfer.setData("text/plain",`inventory:${e}`)}),i.addEventListener("dragend",()=>{Co=null,i.classList.remove("dragging")})}}else t.hotbar&&(i.innerHTML=`<span class="slotNumber">${e+1}</span>`,i.title="Empty slot");return i.addEventListener("dragover",r=>r.preventDefault()),i.addEventListener("drop",r=>{r.preventDefault();const o=Co,a=ms;if(o!=null){if(o===e)return;[Tt[e],Tt[o]]=[Tt[o],Tt[e]]}else if(a!=null){const s=gs(a);Tt[e]=s?{itemId:a,count:Ka,texture:s.texture||null}:null}else return;Co=null,ms=null,Is(),io()}),i}function io(){const n=document.getElementById("hotbarInventory");if(n){n.innerHTML="";for(let e=0;e<ig;e++)n.appendChild(Iw(Tt[e],e,{hotbar:!0}));si==="survival"&&Dl(),j3()}}function Dl(){const n=document.getElementById("survivalPanel");if(!n)return;n.innerHTML='<div style="font-weight:700;font-size:16px;margin-bottom:10px">Inventory</div><div id="survivalGrid"></div>';const e=document.getElementById("survivalGrid");e.style.cssText="display:grid;grid-template-columns:repeat(9,minmax(38px,1fr));gap:5px;max-width:620px";for(let t=ig;t<ps;t++)e.appendChild(Iw(Tt[t],t))}function j3(){document.querySelectorAll("#hotbar .slot").forEach((n,e)=>{let t=n.querySelector(".hotbarCount");t||(t=document.createElement("span"),t.className="hotbarCount",n.appendChild(t));const i=Tt[e];let r=n.querySelector(".hotbarTexture");if(i?.itemId){const o=gs(i.itemId),a=i.texture||o?.texture||null;a?(r||(r=document.createElement("span"),r.className="hotbarTexture",n.appendChild(r)),r.style.backgroundImage=`url('${bu(a)}')`,r.style.backgroundSize="100% 100%",r.style.backgroundPosition="center",r.style.backgroundRepeat="no-repeat",r.style.imageRendering="pixelated",r.style.position="absolute",r.style.inset="3px",r.style.zIndex="1"):r&&r.remove(),t.textContent=i.count>1?String(i.count):"",t.style.zIndex="3"}else r&&r.remove(),t.textContent=""}),$r()}function Q3(n){if(kf||(kf=new As),Bf.has(n.texture))return Bf.get(n.texture);const e=kf.load(bu(n.texture));return e.colorSpace=st,e.magFilter=Fe,e.minFilter=Fe,e.generateMipmaps=!1,Bf.set(n.texture,e),e}function eL(){const n=document.createElement("canvas");n.width=16,n.height=16;const e=n.getContext("2d");if(!e)return new Xn({color:13998962});e.fillStyle="#d79b72",e.fillRect(0,0,16,16),e.fillStyle="#bf815c",e.fillRect(0,11,16,5),e.fillStyle="#e4ad85",e.fillRect(3,1,10,7);const t=new jo(n);return t.colorSpace=st,t.magFilter=Fe,t.minFilter=Fe,t.generateMipmaps=!1,new Xn({map:t})}function tL(n){if(!n||_o)return;const e=new Tn;e.name="WebMinecraftHeldBlock",e.position.set(.62,-.48,-1.18),e.rotation.set(-.08,-.18,-.16),e.visible=!1;const t=eL(),i=new Oe(new ft(.22,.62,.22),t);i.position.set(.2,-.11,.06),i.rotation.set(.08,-.12,-.16),e.add(i);const r=new Oe(new ft(.3,.28,.28),t);r.position.set(.07,.17,-.02),r.rotation.set(.12,-.08,-.12),e.add(r);const o=new Oe(new ft(.58,.58,.58),Array.from({length:6},()=>new Xn({color:16777215})));o.name="HeldTexturedBlock",o.position.set(-.03,.26,-.22),o.rotation.set(.08,-.22,.1),e.add(o),n.add(e),_o={root:e,block:o,forearm:i,hand:r}}function $r(){const n=document.body.classList.contains("webminecraft-in-world")&&!Za,e=Number.isInteger(window.webMinecraftSelectedSlot)?window.webMinecraftSelectedSlot:0,t=Tt[e];if(!_o)return;if(!n||!t){_o.root.visible=!1;return}const i=gs(t.itemId),r=t.texture||i?.texture;if(!i||!r){_o.root.visible=!1;return}const o=Q3({...i,texture:r});for(const a of _o.block.material)a.map=o,a.needsUpdate=!0;_o.root.visible=!0}function nL(n){return Tt[n]?.itemId??null}function Uc(n){return $3(n,1)}function iL(n){eb(),J3(),tL(n),Il(),io(),Pl(),Dl(),window.webMinecraftSelectedSlot=0,$r(),window.addEventListener("webminecraft:selectedslot",t=>{window.webMinecraftSelectedSlot=t.detail?.slot??0,$r()}),window.addEventListener("webminecraft:inventorychanged",()=>{eb(),io(),Pl(),Dl(),$r()}),document.addEventListener("keydown",t=>{document.body.classList.contains("mobile-mode")||(t.key.toLowerCase()==="e"&&!t.repeat&&document.body.classList.contains("webminecraft-in-world")&&(t.preventDefault(),Za?gl():Pw()),t.key==="Escape"&&Za&&document.body.classList.contains("webminecraft-in-world")&&gl())}),new MutationObserver(()=>{!document.body.classList.contains("webminecraft-in-world")&&Za&&gl(),$r()}).observe(document.body,{attributes:!0,attributeFilter:["class"]})}function Pw(){document.body.classList.contains("webminecraft-in-world")&&(Za=!0,document.body.classList.add("inventory-open"),document.getElementById("inventoryScreen")?.classList.add("open"),document.exitPointerLock?.(),Il(),io(),Pl(),Dl(),$r())}function gl(){if(Za=!1,document.body.classList.remove("inventory-open"),document.getElementById("inventoryScreen")?.classList.remove("open"),$r(),!document.body.classList.contains("mobile-mode")&&document.body.classList.contains("webminecraft-in-world"))try{document.body.requestPointerLock?.()}catch{}}const Ih="⁣WM_TNT:";let Of=!1;function rL(){if(Of)return;const n=()=>{const t=window.__webminecraftChatAdd;if(typeof t!="function"||t.__webminecraftTNTBridge)return;const i=(r,o=!1,a="")=>{const s=String(r??"");if(s.startsWith(Ih)){const l=s.slice(Ih.length).split(",").map(Number);l.length===3&&l.every(Number.isFinite)&&window.dispatchEvent(new CustomEvent("webminecraft:tntignite",{detail:{x:l[0],y:l[1],z:l[2]}}));return}return t(s,o,a)};i.__webminecraftTNTBridge=!0,window.__webminecraftChatAdd=i,Of=!0};n();const e=setInterval(()=>{n(),Of&&clearInterval(e)},50)}function oL(n,e,t){const i=document.getElementById("multiplayerChatInput");return i?(i.value=`${Ih}${Math.floor(n)},${Math.floor(e)},${Math.floor(t)}`,i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",bubbles:!0,cancelable:!0})),!0):!1}rL();const aL=16,nb=2500,Fr=4,ib=5,sL=22,lL=28,cL=22,dL=28,uL=22,fL=28,pL=300,hL=12,Dw=[];for(let n=-Fr;n<=Fr;n++)for(let e=-Fr;e<=Fr;e++)for(let t=-Fr;t<=Fr;t++)Math.hypot(n,e,t)<=Fr&&Dw.push({dx:n,dy:e,dz:t});const Ra=new Xl,mL=new De(0,0),zf=new Set,Hr=new Map,Wr=new Map,Ph=new Set;let Dh=!1,Zi=null,rb=!1,Hf=performance.now();function vu(n,e,t){return`${n},${e},${t}`}function rg(n,e,t,i){window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:n,y:e,z:t,type:i}}))}function yu(n,e=vt()){return!!n&&n!==e.AIR&&n!==e.WATER}function wu(n,e,t,i){Dh=!0;try{return An(n,e,t,i)?(br(n,e,t,i),rg(n,e,t,i),!0):!1}finally{Dh=!1}}function gL(n){return n.map(e=>e.clone())}function og(n,e,t,i,r,o){const a=gL(r),s=new Oe(Dy,a);return s.position.set(e,t,i),s.castShadow=!0,s.receiveShadow=!0,s.userData.dynamicBlockType=o,s.userData.originalColors=a.map(l=>l.color.clone()),n.add(s),s}function Wo(n){if(n&&(n.parent&&n.parent.remove(n),Array.isArray(n.material)))for(const e of n.material)e.dispose()}function xL(n,e,t,i){const r=vu(e,t,i),o=vt();if(Hr.has(r)||Pe(e,t,i)!==o.SAND||yu(Pe(e,t-1,i),o))return!1;const a=og(n,e,t,i,[cu],"sand");return Hr.set(r,{x:e,y:t,z:i,velocity:0,mesh:a}),wu(e,t,i,o.AIR)?!0:(Hr.delete(r),Wo(a),!1)}function bL(n,e,t,i){const r=vu(e,t,i),o=vt();if(Wr.has(r)||Pe(e,t,i)!==o.GRAVEL||yu(Pe(e,t-1,i),o))return!1;const a=og(n,e,t,i,[$l],"gravel");return Wr.set(r,{x:e,y:t,z:i,velocity:0,mesh:a}),wu(e,t,i,o.AIR)?!0:(Wr.delete(r),Wo(a),!1)}function ob(n,e,t,i){const r=vt();Pe(e,t,i)===r.SAND&&xL(n,e,t,i)}function Nh(n,e,t,i){const r=vt();Pe(e,t,i)===r.GRAVEL&&bL(n,e,t,i)}function vL(n,e){if(Dh||!n||!e)return;const{x:t,y:i,z:r,type:o}=e,a=vt();if(o===a.SAND){ob(n,t,i,r);return}if(o===a.GRAVEL){Nh(n,t,i,r);return}if(o===a.AIR)for(let s=1;s<=4;s++)ob(n,t,i+s,r),Nh(n,t,i+s,r)}function ag(n,e,t,i,r){const o=Math.floor(e-.5+1e-5),a=Math.floor(t-.5+1e-5);for(let s=o;s>=a;s--)if(yu(Pe(n,s,i),r))return s+1;return null}function yL(n){if(!Zi||Hr.size===0)return;const e=vt(),t=Math.min(Math.max(n,0),.05);for(const[i,r]of Hr){if(!r.mesh?.parent){Hr.delete(i);continue}r.velocity=Math.min(r.velocity+cL*t,dL);const o=r.y,a=o-r.velocity*t,s=ag(r.x,o,a,r.z,e);if(s!==null&&s<=o){r.y=s,r.mesh.position.y=s,Hr.delete(i),Wo(r.mesh),wu(r.x,s,r.z,e.SAND);continue}r.y=a,r.mesh.position.y=a,a<-60&&(Hr.delete(i),Wo(r.mesh))}}function wL(n){if(!Zi||Wr.size===0)return;const e=vt(),t=Math.min(Math.max(n,0),.05);for(const[i,r]of Wr){if(!r.mesh?.parent){Wr.delete(i);continue}r.velocity=Math.min(r.velocity+uL*t,fL);const o=r.y,a=o-r.velocity*t,s=ag(r.x,o,a,r.z,e);if(s!==null&&s<=o){r.y=s,r.mesh.position.y=s,Wr.delete(i),Wo(r.mesh),wu(r.x,s,r.z,e.GRAVEL);continue}r.y=a,r.mesh.position.y=a,a<-60&&(Wr.delete(i),Wo(r.mesh))}}let ab=!1;function _L(){if(ab)return;ab=!0;const n=()=>{if(!Zi)return;const e=window.__webminecraftCamera,t=Number.isFinite(e?.position?.x)?Math.floor(e.position.x):0,i=Number.isFinite(e?.position?.y)?Math.floor(e.position.y):32,r=Number.isFinite(e?.position?.z)?Math.floor(e.position.z):0,o=vt(),a=10,s=Math.max(-31,i-10),l=Math.min(127,i+18);for(let c=t-a;c<=t+a;c++)for(let d=r-a;d<=r+a;d++)for(let f=s;f<=l;f++)Pe(c,f,d)===o.GRAVEL&&!yu(Pe(c,f-1,d),o)&&Nh(Zi,c,f,d)};n(),setInterval(n,350)}function Nw(){if(rb)return;rb=!0;const n=e=>{const t=Math.min((e-Hf)/1e3,.05);Hf=e,yL(t),wL(t),requestAnimationFrame(n)};Hf=performance.now(),requestAnimationFrame(n)}function SL(n,e){e.updateMatrixWorld(!0),Ra.setFromCamera(mL,e),Ra.near=.01,Ra.far=ib;const i=Ra.intersectObjects(n.children,!0).find(d=>{if(!d.object?.userData?.isChunk||!d.face)return!1;let f=d.object;for(;f;){if(f.userData?.isWater===!0)return!1;f=f.parent}return!0});if(Ra.near=0,Ra.far=1/0,!i||i.distance>ib)return null;const r=i.face.normal.clone().normalize(),o=i.point.clone().sub(r.clone().multiplyScalar(.01)),a=Math.floor(o.x+.5),s=Math.floor(o.y+.5),l=Math.floor(o.z+.5),c=Pe(a,s,l);return c?{x:a,y:s,z:l,type:c}:null}function ML(n,e,t){Array.isArray(n.material)&&n.material.forEach((i,r)=>{i?.color&&(t?(i.color.setHex(16777215),i.emissive&&(i.emissive.setHex(16777215),i.emissiveIntensity=1.15)):(i.color.copy(e[r]),i.emissive&&(i.emissive.setHex(0),i.emissiveIntensity=0)))})}function sg(n,e,t,i,r=!0,o=!1){const a=vu(e,t,i),s=vt();if(zf.has(a))return!1;const l=Pe(e,t,i);if(l!==s.TNT&&!(o&&l===s.AIR))return!1;if(l===s.TNT){if(!An(e,t,i,s.AIR))return!1;rg(e,t,i,s.AIR),r&&br(e,t,i,s.AIR)}else if(!o)return!1;zf.add(a),r&&oL(e,t,i);const c=og(n,e,t,i,Vm,"primedTNT");c.userData.isPrimedTNT=!0;const d=new Oe(new Vl(.065,6,4),new Ji({color:16768341}));d.position.set(e,t+.58,i),n.add(d);const f=new Am(16742446,1.8,4);f.position.set(e,t+.45,i),n.add(f);const u=c.userData.originalColors.map(S=>S.clone());let p=!1,m=0,b=t,g=performance.now();const h=performance.now(),_=S=>{const w=Math.min(Math.max((S-g)/1e3,0),.05);g=S;const A=S-h,M=Math.min(A/nb,1),C=Be.lerp(150,55,M),v=Math.floor(A/C)%2===0;m=Math.min(m+sL*w,lL);const T=b-m*w,P=ag(e,b,T,i,s);if(P!==null&&P<=b?(b=P,m=0):b=T,c.position.y=b,d.position.y=b+.58,f.position.y=b+.45,d.visible=v,f.intensity=1.5+Math.sin(A*.06)*.9,v!==p&&(p=v,ML(c,u,v)),A<nb){requestAnimationFrame(_);return}Wo(c),n.remove(d),d.geometry.dispose(),d.material.dispose(),n.remove(f),f.dispose(),zf.delete(a),AL(n,e,Math.round(b),i)};return requestAnimationFrame(_),!0}function EL(n,e,t,i){const r=new Am(16751170,7,9);r.position.set(e,t+.5,i),n.add(r);const o=new Vl(.35,8,6),a=new Ji({color:16751170,transparent:!0,opacity:.72,depthWrite:!1}),s=new Oe(o,a);s.position.set(e,t+.5,i),n.add(s);const l=performance.now(),c=d=>{const f=Math.min((d-l)/220,1),u=.6+f*(Fr*.8);if(s.scale.setScalar(u),a.opacity=.72*(1-f),r.intensity=7*(1-f),f>=1){n.remove(s),o.dispose(),a.dispose(),n.remove(r),r.dispose();return}requestAnimationFrame(c)};requestAnimationFrame(c)}function TL(n){const{scene:e,BLOCK:t,offsets:i}=n;for(const r of i){const o=n.cx+r.dx,a=n.cy+r.dy,s=n.cz+r.dz,l=Pe(o,a,s);if(!(!l||l===t.AIR||l===t.BEDROCK)){if(l===t.TNT&&!(o===n.cx&&a===n.cy&&s===n.cz)){const c=vu(o,a,s);if(!n.chainTNT.has(c)){n.chainTNT.add(c);const d=80+Math.random()*pL;setTimeout(()=>sg(e,o,a,s),d)}continue}An(o,a,s,t.AIR)&&(br(o,a,s,t.AIR),rg(o,a,s,t.AIR))}}Ph.delete(n),EL(e,n.cx,n.cy,n.cz)}function AL(n,e,t,i){if(Ph.size>=hL)return;const r=vt(),o={scene:n,cx:e,cy:t,cz:i,BLOCK:r,offsets:Dw,chainTNT:new Set};Ph.add(o),TL(o)}window.addEventListener("webminecraft:tntignite",n=>{if(!Zi)return;const e=Number(n.detail?.x),t=Number(n.detail?.y),i=Number(n.detail?.z);[e,t,i].every(Number.isFinite)&&sg(Zi,Math.floor(e),Math.floor(t),Math.floor(i),!1,!0)});window.addEventListener("webminecraft:blockchange",n=>{Zi&&vL(Zi,n.detail)});function sb(n,e,t){if(Zi=n,Nw(),t!==aL)return!1;const i=vt(),r=SL(n,e);return!r||r.type!==i.TNT?!1:sg(n,r.x,r.y,r.z,!0,!1)}function CL(n){Zi=n,Nw(),_L()}const La=new Xl,RL=new De(0,0),LL=5,lb=2.5,IL=2.5,PL=300*1e3,DL=18,Wf=.125,Gf=-64;let fi=null,Xi=null,Ve=null,cb=!1,Vf=0;const yi=[],NL={1:700,2:430,3:1050,4:380,5:900,6:280,7:1050,8:420,9:900,10:1/0,11:1200,12:1250,13:750,14:300,15:800,18:900,19:1100,20:1100,21:1100,22:500},Fw={1:"Grass_Block_(top_texture)_JE2.png",2:"dirt.png",3:"stone.png",4:"sand.png",5:"oak_log_top.png",6:"oak-leaves-normal-original-default.png",7:"cobblestone.png",8:"gravel.png",9:"sandstone.png",10:"bedrock.png",11:"coal_ore.png",12:"iron_ore.png",13:"oak_planks.png",14:"snow.png",15:"tnt_side.png",18:"bricks.png",19:"stone_bricks.png",20:"cracked_stone_bricks.png",21:"mossy_stone_bricks.png",22:"dirt_path_top.png"},Uw={1:7579711,2:9199164,3:9211020,4:14271115,5:9396792,6:4098620,7:7829367,8:9273453,9:14007693,10:4934475,11:3421236,12:9605778,13:11962194,14:15857663,15:14104118,18:10767163,19:8355711,20:7368816,21:6257488,22:9402965};function kw(n){return`/WebMinecraftT/textures/${encodeURIComponent(n)}`}function Bw(){if(!fi||!Xi)return null;Xi.updateMatrixWorld(!0),La.setFromCamera(RL,Xi),La.near=.01,La.far=LL;const e=La.intersectObjects(fi.children,!0).find(l=>{if(!l.object?.userData?.isChunk||!l.face)return!1;let c=l.object;for(;c;){if(c.userData?.isWater===!0)return!1;c=c.parent}return!0});if(La.near=0,La.far=1/0,!e)return null;const t=e.face.normal.clone().normalize(),i=e.point,r=Math.floor(i.x-t.x*.01+.5),o=Math.floor(i.y-t.y*.01+.5),a=Math.floor(i.z-t.z*.01+.5),s=Pe(r,o,a);return!s||s===vt().AIR?null:{x:r,y:o,z:a,type:s,normal:t}}function FL(n){const e=document.createElement("canvas");e.width=e.height=128;const t=e.getContext("2d");if(!t)return null;t.strokeStyle="rgba(0,0,0,.96)",t.lineWidth=4,t.lineCap="square";const i=[[[64,63],[51,49],[56,30],[43,15]],[[64,63],[78,49],[71,32],[87,19]],[[64,63],[47,69],[29,63],[14,73]],[[64,63],[78,71],[95,66],[113,79]],[[64,63],[60,80],[50,98],[43,114]],[[64,63],[72,78],[84,97],[90,114]],[[64,63],[58,51],[40,41],[24,38]],[[64,63],[73,53],[91,43],[108,46]]],r=Math.min(i.length,1+n*2);for(let a=0;a<r;a++){const s=i[a];t.beginPath(),t.moveTo(s[0][0],s[0][1]);for(let l=1;l<s.length;l++)t.lineTo(s[l][0],s[l][1]);t.stroke()}const o=new jo(e);return o.colorSpace=st,o.magFilter=Fe,o.minFilter=Fe,o}function UL(n){const e=new Tn;e.name="survivalMiningCracks",e.position.set(n.x,n.y,n.z);const t=new Ts(.995,.995),i=[],r=[{normal:new R(1,0,0)},{normal:new R(-1,0,0)},{normal:new R(0,1,0)},{normal:new R(0,-1,0)},{normal:new R(0,0,1)},{normal:new R(0,0,-1)}];for(let o=0;o<r.length;o++){const a=r[o].normal,s=new Zo().setFromUnitVectors(new R(0,0,1),a);for(let l=0;l<5;l++){const c=new Ji({map:FL(l),transparent:!0,depthTest:!1,side:jt}),d=new Oe(t,c);d.quaternion.copy(s),d.position.copy(a).multiplyScalar(.508),d.visible=!1,d.renderOrder=1200,e.add(d),i.push({mesh:d,faceIndex:o,stage:l})}}return fi.add(e),{group:e,stages:i}}function Ow(n,e){const t=Math.min(4,Math.floor(Math.max(0,e)*5));for(const i of n.stages)i.mesh.visible=i.stage===t}function zw(n){if(!n)return;fi?.remove(n.group);const e=new Set;for(const t of n.stages)t.mesh.material&&e.add(t.mesh.material);for(const t of e)t.map?.dispose(),t.dispose();n.group.clear()}function kL(n,e){const t=new ft(.07,.07,.07),i=[],r=performance.now();for(let a=0;a<8;a++){const s=new Oe(t,new Ji({color:Uw[e]??11184810,transparent:!0}));s.position.copy(n).add(new R((Math.random()-.5)*.65,(Math.random()-.5)*.65,(Math.random()-.5)*.65)),s.userData.velocity=new R((Math.random()-.5)*2.1,.9+Math.random()*1.8,(Math.random()-.5)*2.1),s.userData.start=r,fi.add(s),i.push(s)}function o(a){let s=!1;for(const l of i){if(!l.parent)continue;const c=a-l.userData.start;if(c>=450){l.parent.remove(l),l.material.dispose();continue}s=!0,l.userData.velocity.y-=.085,l.position.addScaledVector(l.userData.velocity,.016),l.rotation.x+=.1,l.rotation.y+=.08,l.material.opacity=1-c/450}s&&requestAnimationFrame(o)}requestAnimationFrame(o)}function BL(n,e){const t=new Tn;t.name="survivalDroppedItem",t.userData.type=n,t.userData.count=1,t.userData.spawnedAt=performance.now(),t.userData.bob=Math.random()*Math.PI*2,t.userData.velocityY=1.2,t.userData.grounded=!1;const i=Fw[n];let r;if(i){const a=new As().load(kw(i));a.colorSpace=st,a.magFilter=Fe,a.minFilter=Fe,r=new Xn({map:a})}else r=new Xn({color:Uw[n]??11184810});const o=new Oe(new ft(.25,.25,.25),r);o.userData.isDroppedItem=!0,t.add(o),t.position.copy(e).add(new R(0,.28,0)),fi.add(t),yi.push(t)}function OL(){for(let n=yi.length-1;n>=0;n--){const e=yi[n];if(!e.parent){yi.splice(n,1);continue}for(let t=n-1;t>=0;t--){const i=yi[t];if(!(!i.parent||e.userData.type!==i.userData.type||e.position.distanceTo(i.position)>.7)){i.userData.count+=e.userData.count,e.parent.remove(e),yi.splice(n,1);break}}}}function zL(n,e){try{const t=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]"),i=Array.isArray(t)&&t.length===36?t:Array.from({length:36},()=>null);let r=e;for(const o of i)if(o?.itemId===n&&Number(o.count)<64){const a=Math.min(r,64-Number(o.count));if(o.count=Number(o.count)+a,r-=a,!r)break}for(let o=0;o<i.length&&r;o++)if(!i[o]){const a=Math.min(r,64);i[o]={itemId:n,count:a},r-=a}return localStorage.setItem("webminecraft_inventory",JSON.stringify(i)),window.dispatchEvent(new CustomEvent("webminecraft:inventorychanged")),r===0}catch{return!1}}function HL(){const n=document.getElementById("hotbar");if(!n)return;const e=n.querySelectorAll(".slot");let t=[];try{const i=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]");t=Array.isArray(i)&&i.length>=9?i:Array.from({length:36},()=>null)}catch{t=Array.from({length:36},()=>null)}e.forEach((i,r)=>{let o=i.querySelector(".hotbarTexture");o||(o=document.createElement("span"),o.className="hotbarTexture",i.appendChild(o));const a=t[r],s=a?.itemId!=null?Fw[a.itemId]:null;if(s&&a?.count>0){o.style.backgroundImage=`url("${kw(s)}")`,o.style.display="block",i.dataset.itemId=String(a.itemId);let l=i.querySelector(".hotbarCount");l||(l=document.createElement("span"),l.className="hotbarCount",i.appendChild(l)),l.textContent=a.count>1?String(a.count):""}else o.style.backgroundImage="none",o.style.display="none",delete i.dataset.itemId,i.querySelector(".hotbarCount")?.remove()})}function WL(n){if(!fi||!Xi||!Bn())return;OL();const e=Xi.position,t=Vf>0?Math.min(.05,Math.max(.001,(n-Vf)/1e3)):.016;Vf=n;for(let i=yi.length-1;i>=0;i--){const r=yi[i];if(!r.parent){yi.splice(i,1);continue}if(n-r.userData.spawnedAt>=PL){r.parent.remove(r),yi.splice(i,1);continue}if(r.userData.grounded){const a=r.userData.baseY??(r.userData.baseY=r.position.y);r.position.y=a+Math.sin(n*.003+r.userData.bob)*.045}else{r.userData.velocityY-=DL*t;const a=r.position.y+r.userData.velocityY*t,s=Math.floor(r.position.x+.5),l=Math.floor(r.position.z+.5);let c=null;const d=Math.floor(a-Wf+.5);for(let f=d;f>=Gf;f--){const u=Pe(s,f,l);if(u&&u!==vt().AIR){c=f;break}}c!==null&&a-Wf<=c+.5?(r.position.y=c+.5+Wf,r.userData.velocityY=0,r.userData.grounded=!0):(r.position.y=a,r.position.y<Gf&&(r.position.y=Gf))}r.rotation.y+=.018;const o=r.position.distanceTo(e);if(o<=lb){const a=e.clone().sub(r.position),s=Math.min(.24,Math.max(.055,(lb-o)*.11));a.lengthSq()>1e-4&&r.position.addScaledVector(a.normalize(),s)}r.position.distanceTo(e)<=IL&&zL(r.userData.type,r.userData.count)&&(r.parent.remove(r),yi.splice(i,1),HL())}}function Id(n,e){if(n&&(fi=n),e&&(Xi=e),!Bn()||!document.body.classList.contains("webminecraft-in-world")||Ve)return;if(Rh("break")){ki("mine");return}const t=Bw();if(!t)return;const i=NL[t.type]??700;Number.isFinite(i)&&(Ve={...t,started:performance.now(),duration:i,overlay:UL(t)},Ow(Ve.overlay,.01),ki("mine"))}function Do(){Ve&&(zw(Ve.overlay),Ve=null)}function GL(){if(Ve){if(Pe(Ve.x,Ve.y,Ve.z)!==Ve.type){Do();return}if(!An(Ve.x,Ve.y,Ve.z,vt().AIR)){Do();return}br(Ve.x,Ve.y,Ve.z,vt().AIR),window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:Ve.x,y:Ve.y,z:Ve.z,type:vt().AIR,brokenType:Ve.type}})),kL(new R(Ve.x,Ve.y,Ve.z),Ve.type),BL(Ve.type,new R(Ve.x,Ve.y,Ve.z)),zw(Ve.overlay),Ve=null}}function VL(n,e){if(!Ve)return;if(!e){Do();return}const t=Bw();if(!t||t.x!==Ve.x||t.y!==Ve.y||t.z!==Ve.z){Do();return}const i=Math.min(1,(n-Ve.started)/Ve.duration);Ow(Ve.overlay,i),i>=1&&GL()}function db(){if(cb)return;cb=!0,document.addEventListener("mousedown",e=>{!Bn()||!document.body.classList.contains("webminecraft-in-world")||document.body.classList.contains("mobile-mode")||e.button===0&&(e.target instanceof Element&&e.target.closest("#hotbar,#inventoryScreen,#survivalInventoryScreen,button,input,select,textarea,a")||(e.preventDefault(),e.stopImmediatePropagation(),Id(fi,Xi)))},!0),document.addEventListener("mouseup",e=>{e.button===0&&Do()},!0),window.addEventListener("blur",Do),document.addEventListener("visibilitychange",()=>{document.hidden&&Do()});function n(e){const t=document.body.classList.contains("mobile-mode"),i=t?!!Le.punchPressed:!!Ve;t&&i&&!Ve&&Id(fi,Xi),VL(e,i),WL(e),requestAnimationFrame(n)}requestAnimationFrame(n)}function XL(n,e){fi=n||fi,Xi=e||Xi}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",db,{once:!0}):db();const lg="webminecraft_deleted_worlds",Hw="webminecraft_pending_cloud_deletes",qL=40,ub=16;let kc=null,al=null,Xf=!1,qf=!1,Pd=null,sl=null;function Yn(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function $L(){if(window.__webMinecraftFirebaseDatabaseLoad)return window.__webMinecraftFirebaseDatabaseLoad;const e="https://www.gstatic.com/firebasejs/12.18.0/firebase-database-compat.js";return window.__webMinecraftFirebaseDatabaseLoad=new Promise((t,i)=>{const r=document.querySelector(`script[src="${e}"]`);if(r){if(window.firebase?.database)return t();r.addEventListener("load",()=>t(),{once:!0}),r.addEventListener("error",()=>i(new Error(`Could not load ${e}`)),{once:!0});return}const o=document.createElement("script");o.src=e,o.async=!0,o.onload=()=>t(),o.onerror=()=>i(new Error(`Could not load ${e}`)),document.head.appendChild(o)}),window.__webMinecraftFirebaseDatabaseLoad}async function cg(n=12e3){return kc||(kc=new Promise(e=>{const t=Date.now(),i=async()=>{try{if(window.firebase?.apps?.length&&window.firebase.auth&&(await $L(),window.firebase.database)){e({auth:window.firebase.auth(),db:window.firebase.database()});return}}catch(r){console.warn("Realtime Database SDK setup failed:",r)}if(Date.now()-t>=n){e(null);return}setTimeout(i,100)};i()}),kc)}async function Ww(n,e=12e3){return n?.auth?al||(al=new Promise(t=>{let i=!1;const r=a=>{i||(i=!0,t(a||null))},o=setTimeout(()=>r(n.auth.currentUser||null),e);try{const a=n.auth.onAuthStateChanged(s=>{clearTimeout(o);try{a?.()}catch{}r(s)})}catch{clearTimeout(o),r(n.auth.currentUser||null)}}),al):null}async function Ps(){const n=await cg();if(!n?.db||!n?.auth)return null;const e=await Ww(n);return e?{user:e,db:n.db}:null}function Jl(){try{const n=JSON.parse(localStorage.getItem(lg)||"[]");return new Set(Array.isArray(n)?n.map(Yn).filter(e=>e!==null):[])}catch{return new Set}}function Fh(n){const e=Yn(n);if(e===null)return;const t=Jl();t.add(e);try{localStorage.setItem(lg,JSON.stringify([...t]))}catch{}}function YL(n){const e=Yn(n);if(e===null)return;const t=Jl();t.delete(e);try{localStorage.setItem(lg,JSON.stringify([...t]))}catch{}}function dg(){try{const n=JSON.parse(localStorage.getItem(Hw)||"[]");return new Set(Array.isArray(n)?n.map(Yn).filter(e=>e!==null):[])}catch{return new Set}}function Gw(n){try{localStorage.setItem(Hw,JSON.stringify([...n]))}catch{}}function fb(n){const e=Yn(n);if(e===null)return;const t=dg();t.add(e),Gw(t)}function ug(n){const e=Yn(n);if(e===null)return;const t=dg();t.delete(e),Gw(t)}function KL(n,e,t){return n.ref(`users/${e}/worlds/${t}`)}function Vw(n,e,t){return n.ref(`users/${e}/worldData/${t}`)}function Xw(n,e,t){return n.ref(`users/${e}/deletedWorlds/${t}`)}function ZL(n){const[e,,t]=String(n).split(",").map(Number);return!Number.isFinite(e)||!Number.isFinite(t)?null:`${Math.floor(e/ub)},${Math.floor(t/ub)}`}function JL(n){const e=new Map;for(const[t,i]of Object.entries(n||{})){const r=ZL(t),o=Number(i);!r||!Number.isFinite(o)||(e.has(r)||e.set(r,{}),e.get(r)[t]=o)}return e}function jL(){return window.firebase?.database?.ServerValue?.TIMESTAMP||Date.now()}async function qw(n,e,t){return(await Xw(n,e.uid,t).once("value")).exists()}async function QL(n){const e=await Ps(),t=Yn(n?.seed);if(!e||!n||t===null||Jl().has(t)||await qw(e.db,e.user,t))return!1;const i=n.updatedAt||new Date().toISOString(),r=JL(n.blocks||{}),o={name:String(n.name||`World ${t}`).trim().slice(0,qL)||`World ${t}`,seed:t,createdAt:n.createdAt||i,updatedAt:i,deleted:!1},a=`users/${e.user.uid}`,s={};s[`worlds/${t}`]=o,s[`deletedWorlds/${t}`]=null;const c=(await Vw(e.db,e.user.uid,t).once("value")).val()||{},d=new Set(r.keys());for(const f of Object.keys(c))d.has(f)||(s[`worldData/${t}/${f}`]=null);for(const[f,u]of r)s[`worldData/${t}/${f}`]={blocks:u,updatedAt:i};return await e.db.ref(a).update(s),!0}async function _u(n){try{return await QL(n)}catch(e){return console.warn("Realtime Database world save failed:",e),!1}}async function $w(n,e=null){const t=Yn(n);if(t===null||Jl().has(t))return null;try{const i=await Ps();if(!i)return e;if(await qw(i.db,i.user,t))return Fh(t),null;const r=await KL(i.db,i.user.uid,t).once("value");if(!r.exists())return e;const o=r.val()||{};if(o.deleted===!0)return Fh(t),null;const s=(await Vw(i.db,i.user.uid,t).once("value")).val()||{},l={};for(const c of Object.values(s))!c?.blocks||typeof c.blocks!="object"||Object.assign(l,c.blocks);return{...e||{},seed:t,name:String(o.name||e?.name||`World ${t}`),createdAt:o.createdAt||e?.createdAt||new Date().toISOString(),updatedAt:o.updatedAt||e?.updatedAt||new Date().toISOString(),blocks:l}}catch(i){return console.warn("Realtime Database world load failed:",i),e}}async function Yw(n){const e=Yn(n);if(e===null)return!1;Fh(e);const t=await Ps();if(!t)return fb(e),!1;try{const i=`users/${t.user.uid}`,r={};return r[`worlds/${e}`]=null,r[`worldData/${e}`]=null,r[`deletedWorlds/${e}`]={seed:e,deletedAt:jL()},await t.db.ref(i).update(r),ug(e),window.dispatchEvent(new CustomEvent("webminecraft:cloudworldschanged",{detail:{type:"deleted",seed:e}})),!0}catch(i){return fb(e),console.warn("Realtime Database world delete failed; will retry automatically:",i),!1}}async function jl(){if(!qf){qf=!0;try{for(const n of[...dg()])try{await Yw(n)&&ug(n)}catch{}}finally{qf=!1}}}async function eI(n){const e=Yn(n);if(e===null)return!1;YL(e),ug(e);const t=await Ps();if(!t)return!1;try{return await Xw(t.db,t.user.uid,e).remove(),!0}catch(i){return console.warn("Could not clear Realtime Database world deletion:",i),!1}}async function Kw(){try{const n=await Ps();if(!n)return[];const e=n.db.ref(`users/${n.user.uid}/worlds`),t=n.db.ref(`users/${n.user.uid}/deletedWorlds`),[i,r]=await Promise.all([e.once("value"),t.once("value")]),o=i.val()||{},a=r.val()||{};return Object.entries(o).map(([s,l])=>({id:s,...l||{}})).filter(s=>{const l=Yn(s.seed??s.id);return l!==null&&!a[l]&&s.deleted!==!0})}catch(n){return console.warn("Could not list Realtime Database worlds:",n),[]}}async function fg(){if(!Xf){Xf=!0;try{const n=window.webMinecraftWorldStorage;if(!n?.saveLocalWorld||!await Ps())return;await jl();const t=await Kw();for(const i of t){const r=Yn(i.seed??i.id);if(r===null||Jl().has(r))continue;const o=await n.getLocalWorld(r).catch(()=>null),a=new Date(i.updatedAt||0).getTime(),s=new Date(o?.updatedAt||0).getTime();if(o&&s>a){await _u(o).catch(()=>{});continue}const l=await $w(r,o);l&&await n.saveLocalWorld(l).catch(()=>{})}window.dispatchEvent(new CustomEvent("webminecraft:cloudworldssynced"))}finally{Xf=!1}}}function Zw(){if(sl){try{const n=Pd;n&&(sl.db.ref(`users/${n}/worlds`).off(),sl.db.ref(`users/${n}/deletedWorlds`).off())}catch{}Pd=null,sl=null}}async function tI(n){const e=n?.user?.uid;if(!e||Pd===e)return;Zw(),Pd=e,sl=n;const t=n.db.ref(`users/${e}/worlds`),i=n.db.ref(`users/${e}/deletedWorlds`),r=async(o,a)=>{const s=Yn(a?.key);window.dispatchEvent(new CustomEvent("webminecraft:cloudworldschanged",{detail:{type:o,seed:s,world:a?.val()||null}}));try{await fg()}catch{}};t.on("child_added",o=>r("added",o)),t.on("child_changed",o=>r("changed",o)),t.on("child_removed",o=>r("deleted",o)),i.on("child_added",o=>r("deleted",o))}window.webMinecraftCloudSync=fg;window.webMinecraftSaveCloudWorld=_u;window.webMinecraftDeleteCloudWorld=Yw;window.webMinecraftRetryCloudDeletes=jl;window.webMinecraftClearCloudWorldDeletion=eI;window.webMinecraftListCloudWorlds=Kw;window.webMinecraftWaitForAuth=async()=>{const n=await cg();return Ww(n)};cg().then(n=>{n?.auth?.onAuthStateChanged&&n.auth.onAuthStateChanged(e=>{al=Promise.resolve(e||null),e?(tI({...n,user:e}).catch(()=>{}),setTimeout(()=>fg().catch(()=>{}),250),setTimeout(()=>jl().catch(()=>{}),500)):Zw(),window.dispatchEvent(new CustomEvent("webminecraft:authstatechanged",{detail:{user:e}}))})});setInterval(()=>{navigator.onLine!==!1&&jl().catch(()=>{})},5e3);window.addEventListener("online",()=>jl().catch(()=>{}));const pb="webminecraft-create-world-settings-ui",hb="data-create-world-settings-ui";function nI(){if(document.getElementById(pb))return;const n=document.createElement("style");n.id=pb,n.textContent=`
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
`,document.head.appendChild(n)}function $f(n,e){return`<button class="createWorldSettingsTab${e==="game"?" active":""}" type="button" data-cw-tab="${e}">${n}</button>`}function mb(n){if(!n||n.getAttribute(hb)==="1")return;const e=n.querySelector("[data-name]"),t=n.querySelector("[data-new-seed]"),i=n.querySelector("[data-create-message]"),r=n.querySelector('[data-act="create"]'),o=n.querySelector('[data-act="cancel"]');if(!e||!t||!i||!r||!o)return;n.setAttribute(hb,"1"),n.style.cssText="position:absolute;inset:0;display:none;background:#0000;padding:0;z-index:20",n.innerHTML=`
        <div id="createWorldSettingsRoot">
            <aside id="createWorldSettingsSidebar">
                <h2 id="createWorldSettingsTitle">Create New World</h2>
                <p id="createWorldSettingsSub">Set up your world before you create it.</p>
                <nav id="createWorldSettingsTabs" aria-label="Create world sections">
                    ${$f("Game","game")}
                    ${$f("World","world")}
                    ${$f("More","more")}
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
    `;const a=n.querySelector("#cwWorldName"),s=n.querySelector("#cwSeed"),l=n.querySelector("#createWorldSettingsMessage"),c=n.querySelector("#cwGameMode"),d=document.createElement("button");d.type="button",d.dataset.act="create",d.style.display="none",n.appendChild(d);const f=document.createElement("button");f.type="button",f.dataset.act="cancel",f.style.display="none",n.appendChild(f),a.setAttribute("data-name",""),s.setAttribute("data-new-seed",""),l.setAttribute("data-create-message",""),r.remove(),o.remove();const u=()=>{const b=c?.value==="creative"?"creative":"survival";window.webMinecraftSelectedWorldMode=b;const g=Number(s?.textContent?.trim());Number.isFinite(g)&&pu(g,b),document.body.classList.toggle("webminecraft-survival",b==="survival"),document.body.classList.toggle("webminecraft-creative",b==="creative")};c?.addEventListener("change",u),u(),n.addEventListener("click",b=>{const g=b.target.closest("[data-cw-tab]");if(g){const h=g.dataset.cwTab;n.querySelectorAll("[data-cw-tab]").forEach(S=>S.classList.toggle("active",S===g)),n.querySelectorAll("[data-cw-page]").forEach(S=>S.classList.toggle("active",S.dataset.cwPage===h));const _={game:"Game",world:"World",more:"More"};n.querySelector("#createWorldSettingsSectionTitle").textContent=_[h]||"Game";return}if(b.target.closest("#createWorldSettingsClose,#createWorldSettingsCancel")){f.click();return}b.target.closest("#createWorldSettingsCreate")&&(u(),d.click())}),a.addEventListener("input",()=>{e.value=a.value,i.textContent=""}),a.addEventListener("keydown",b=>{b.stopPropagation(),b.key==="Enter"&&(u(),d.click()),b.key==="Escape"&&f.click()}),new MutationObserver(()=>{s.textContent=t.textContent,u()}).observe(t,{childList:!0,characterData:!0,subtree:!0}),new MutationObserver(()=>{s.textContent=t.textContent,a.value=e.value,l.textContent||(l.textContent=i.textContent||""),u()}).observe(n,{attributes:!0,attributeFilter:["style"]})}function gb(){nI();const n=()=>document.querySelector("#savedWorlds .sw2-modal"),e=n();e&&mb(e),new MutationObserver(()=>{const i=n();i&&mb(i)}).observe(document.documentElement,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",gb,{once:!0}):gb();const iI="webminecraft-world-type-";function rI(){const n=Number(document.getElementById("cwSeed")?.textContent);return Number.isFinite(n)?Math.floor(Math.abs(n))>>>0:null}function oI(){const n=rI(),e=document.getElementById("cwWorldType");if(n===null||!e)return;const t=String(e.value||"Default").trim().toLowerCase();try{localStorage.setItem(`${iI}${n}`,t==="flat"?"flat":"default")}catch{}}document.addEventListener("click",n=>{n.target.closest("#createWorldSettingsCreate")&&oI()},!0);if(!Object.prototype.hasOwnProperty.call(globalThis,"playerChunkChunkZ"))try{Object.defineProperty(globalThis,"playerChunkChunkZ",{configurable:!0,enumerable:!1,get(){const n=globalThis.__webminecraftCamera,e=Number(n?.position?.z);return Number.isFinite(e)?Math.floor(e/19):0}})}catch{}const Jw="webminecraft_saved_world_index_v2",jw="webminecraft_deleted_worlds",aI="webminecraft-worlds-v2",sI="/__webminecraft_world_v2__/",lI="webminecraft_world_v2_",cI="webminecraft_world_v2_chunk_";let Yf=null,Bc=null;function Nl(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function Qw(){try{const n=JSON.parse(localStorage.getItem(Jw)||"[]");return Array.isArray(n)?n:[]}catch{return[]}}function dI(n){try{localStorage.setItem(Jw,JSON.stringify(n))}catch{}}function uI(){try{const n=JSON.parse(localStorage.getItem(jw)||"[]");return new Set(Array.isArray(n)?n.map(Nl).filter(e=>e!==null):[])}catch{return new Set}}function fI(n){try{localStorage.setItem(jw,JSON.stringify([...n]))}catch{}}async function pI(n){const e=Nl(n);if(e!==null){if(window.caches)try{await(await caches.open(aI)).delete(new Request(`${location.origin}${sI}${e}.json`))}catch{}try{const t=`${lI}${e}`,i=JSON.parse(localStorage.getItem(t)||"null"),r=Number(i?.chunks);if(Number.isInteger(r)&&r>0)for(let o=0;o<r;o++)localStorage.removeItem(`${cI}${e}_${o}`);localStorage.removeItem(t)}catch{}}}function hI(n,e,t){const i=n.dataset.seed||n.getAttribute("data-seed")||n.querySelector("[data-seed]")?.textContent,r=Nl(i?.trim?.()??i);return r!==null?r:Nl(t[e]?.seed)}function mI(){if(document.getElementById("sw2BulkDeleteStyles"))return;const n=document.createElement("style");n.id="sw2BulkDeleteStyles",n.textContent=`
#sw2BulkToolbar{max-width:1180px;margin:0 auto 18px;padding:12px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:rgba(25,25,25,.94);border:1px solid #555;border-radius:8px;box-shadow:0 4px 12px #0007}
#sw2BulkToolbar label{display:flex;align-items:center;gap:9px;color:#fff;font-weight:700;cursor:pointer}
#sw2BulkToolbar input{width:22px;height:22px;accent-color:#84ad5e;cursor:pointer}
#sw2BulkCount{color:#aaa;font-size:12px;margin-right:auto}
#sw2BulkDelete{min-height:40px;padding:8px 14px;border:1px solid #111;border-top-color:#888;border-left-color:#888;border-radius:6px;background:#774747;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 3px #111}
#sw2BulkDelete:disabled{opacity:.45;cursor:default}
.sw2-bulk-check{position:absolute;top:12px;left:12px;width:23px;height:23px;z-index:3;accent-color:#84ad5e;cursor:pointer}
.sw2-card.sw2-selected{outline:2px solid #84ad5e;outline-offset:1px}
.sw2-card.sw2-has-bulk-check{position:relative;padding-left:50px}
@media(max-width:700px){#sw2BulkToolbar{align-items:stretch}#sw2BulkCount{width:100%;margin:0}.sw2-bulk-check{top:10px;left:10px}}
`,document.head.appendChild(n)}function Dd(){const n=document.querySelector("#savedWorlds .sw2-grid");if(!n)return[];const e=Qw();return[...n.querySelectorAll(":scope > .sw2-card")].map((t,i)=>({card:t,seed:hI(t,i,e)})).filter(t=>t.seed!==null)}function e_(){return Dd().filter(({card:n})=>n.querySelector(".sw2-bulk-check")?.checked)}function Kf(){const n=document.getElementById("sw2BulkToolbar");if(!n)return;const e=Dd(),t=e_(),i=e.length>0&&t.length===e.length,r=t.length>0&&!i,o=n.querySelector("#sw2BulkSelectAll"),a=n.querySelector("#sw2BulkDelete"),s=n.querySelector("#sw2BulkCount");o&&(o.checked=i,o.indeterminate=r),a&&(a.disabled=t.length===0),s&&(s.textContent=`${t.length} selected / ${e.length} worlds`),e.forEach(({card:l})=>{const c=!!l.querySelector(".sw2-bulk-check")?.checked;l.classList.toggle("sw2-selected",c)})}function gI(){const n=document.querySelector("#savedWorlds .sw2-grid");if(!n)return!1;mI();let e=document.getElementById("sw2BulkToolbar");return e||(e=document.createElement("div"),e.id="sw2BulkToolbar",e.innerHTML=`
<label><input id="sw2BulkSelectAll" type="checkbox"> Select All</label>
<span id="sw2BulkCount">0 selected / 0 worlds</span>
<button id="sw2BulkDelete" type="button" disabled>Delete Selected</button>`,n.parentNode.insertBefore(e,n),e.querySelector("#sw2BulkSelectAll").addEventListener("change",t=>{Dd().forEach(({card:i})=>{const r=i.querySelector(".sw2-bulk-check");r&&(r.checked=t.target.checked)}),Kf()}),e.querySelector("#sw2BulkDelete").addEventListener("click",xI)),Dd().forEach(({card:t})=>{if(t.querySelector(".sw2-bulk-check"))return;const i=document.createElement("input");i.type="checkbox",i.className="sw2-bulk-check",i.title="Select this world",i.setAttribute("aria-label","Select this world"),i.addEventListener("click",r=>r.stopPropagation()),i.addEventListener("change",Kf),t.classList.add("sw2-has-bulk-check"),t.appendChild(i)}),Kf(),!0}async function xI(){const n=e_();if(!n.length)return;const e=n.map(({card:l})=>l.querySelector("h3")?.textContent?.trim()||"Unnamed world"),t=n.length===1?`Delete “${e[0]}”? This cannot be undone.`:`Delete these ${n.length} worlds? This cannot be undone.`;if(!window.confirm(t))return;const i=document.getElementById("sw2BulkDelete");i&&(i.disabled=!0,i.textContent="Deleting…");const r=Qw(),o=new Set(n.map(l=>l.seed)),a=uI();o.forEach(l=>a.add(l)),fI(a),await Promise.all([...o].map(pI)),dI(r.filter(l=>!o.has(Nl(l?.seed))));const s=document.querySelector('#savedWorlds [data-act="reload"]');s?s.click():window.location.reload()}function Zf(){!document.getElementById("savedWorlds")||!(getComputedStyle(document.getElementById("savedWorlds")).display!=="none")||gI()}function xb(){Yf||Bc||(Yf=new MutationObserver(()=>{clearTimeout(Bc),Bc=setTimeout(()=>{Bc=null,Zf()},0)}),Yf.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style","class"]}),Zf(),window.addEventListener("resize",Zf,{passive:!0}))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",xb,{once:!0}):xb();const t_="webminecraft_saved_world_index_v2",n_="webminecraft_deleted_worlds",pg="webminecraft-worlds-v2",bI="/__webminecraft_world_v2__/",Nd="webminecraft_world_v2_",hg="webminecraft_world_v2_chunk_",bb=12e4,i_=40;let on=null,ur=null,xs=null,ll=null,Go=null,Fd=null,vb=!1,Uh=null,Ln=[],xl=null,Jf=!1;function kt(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function vr(){try{const n=JSON.parse(localStorage.getItem(n_)||"[]");return new Set(Array.isArray(n)?n.map(kt).filter(e=>e!==null):[])}catch{return new Set}}function r_(n){try{localStorage.setItem(n_,JSON.stringify([...n]))}catch{}}function vI(n){const e=kt(n);if(e===null)return;const t=vr();t.add(e),r_(t)}function yI(n){const e=kt(n);if(e===null)return;const t=vr();t.delete(e),r_(t)}function Qo(n,e=0){const t=kt(n?.seed);if(t===null||vr().has(t))return null;const i=n?.createdAt||new Date().toISOString();return{seed:t,name:String(n?.name||`World ${e+1}`).trim().slice(0,i_)||`World ${e+1}`,createdAt:i,updatedAt:n?.updatedAt||i,blocks:n?.blocks&&typeof n.blocks=="object"&&!Array.isArray(n.blocks)?n.blocks:{}}}function mg(n){return new Request(`${location.origin}${bI}${n}.json`)}async function wI(n){if(!window.caches)return null;try{const t=await(await caches.open(pg)).match(mg(kt(n)));return t?Qo(await t.json()):null}catch{return null}}async function _I(n){return window.caches?(await(await caches.open(pg)).put(mg(n.seed),new Response(JSON.stringify(n),{headers:{"Content-Type":"application/json","Cache-Control":"no-store"}})),!0):!1}async function SI(n){if(window.caches)try{await(await caches.open(pg)).delete(mg(kt(n)))}catch{}}function Ud(n){const e=kt(n);if(e!==null)try{const t=JSON.parse(localStorage.getItem(`${Nd}${e}`)||"null"),i=Number(t?.chunks);if(Number.isInteger(i))for(let r=0;r<i;r++)localStorage.removeItem(`${hg}${e}_${r}`);localStorage.removeItem(`${Nd}${e}`)}catch{}}function MI(n){const e=n.seed,t=JSON.stringify(n),i=[];for(let r=0;r<t.length;r+=bb)i.push(t.slice(r,r+bb));Ud(e);try{return i.forEach((r,o)=>localStorage.setItem(`${hg}${e}_${o}`,r)),localStorage.setItem(`${Nd}${e}`,JSON.stringify({version:2,chunks:i.length,updatedAt:n.updatedAt})),!0}catch{return Ud(e),!1}}function EI(n){const e=kt(n);if(e===null)return null;try{const t=JSON.parse(localStorage.getItem(`${Nd}${e}`)||"null"),i=Number(t?.chunks);if(!Number.isInteger(i)||i<1)return null;let r="";for(let o=0;o<i;o++){const a=localStorage.getItem(`${hg}${e}_${o}`);if(a===null)return null;r+=a}return Qo(JSON.parse(r))}catch{return null}}function gg(){try{const n=JSON.parse(localStorage.getItem(t_)||"[]"),e=vr();return Array.isArray(n)?n.filter(t=>{const i=kt(t?.seed);return i!==null&&!e.has(i)}):[]}catch{return[]}}function xg(n){const e=vr(),t=n.map(Qo).filter(Boolean).filter(i=>!e.has(i.seed)).map(i=>({seed:i.seed,name:i.name,createdAt:i.createdAt,updatedAt:i.updatedAt}));try{localStorage.setItem(t_,JSON.stringify(t))}catch{}}async function Su(n){const e=kt(n);return e===null||vr().has(e)?null:await wI(e)||EI(e)}async function bg(n){const e=Qo(n);if(!e)throw new Error("This world is deleted or invalid.");if(vr().has(e.seed))throw new Error("This world was deleted.");let t=!1;try{t=await _I(e)}catch(i){console.warn("World Cache Storage save failed:",i)}if(t)Ud(e.seed);else if(!MI(e))throw new Error("Could not save the world. Browser storage may be full or disabled.");if(vr().has(e.seed))throw await vg(e.seed),new Error("World was deleted while it was being saved.");return xg([...gg().filter(i=>kt(i.seed)!==e.seed),e]),e}async function vg(n){await SI(n),Ud(n)}async function TI(n){const e=kt(n);e!==null&&(vI(e),await vg(e),xg(gg().filter(t=>kt(t.seed)!==e)))}async function Fl(){const n=[];for(const e of gg()){const t=await Su(e.seed);t&&n.push(t)}return n}async function AI(){try{if(window.caches){const e=await(await caches.open("webminecraft-world-fallback-v1")).match(new Request(`${location.origin}/__webminecraft_world_storage__`));if(e){const t=await e.json();if(Array.isArray(t))for(const i of t){const r=Qo(i);if(r&&!await Su(r.seed))try{await bg(r)}catch{}}}}}catch(n){console.warn("Old world migration skipped:",n)}}function jf(n){return String(n??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function CI(n){const e=new Date(n);return Number.isNaN(e.getTime())?"Saved locally":`Last saved ${e.toLocaleString()}`}function RI(){if(document.getElementById("savedWorldsV2Style"))return;const n=document.createElement("style");n.id="savedWorldsV2Style",n.textContent=`
#savedWorlds{position:fixed;inset:0;z-index:240;display:none;background:#171717;color:#fff;font-family:Arial,sans-serif}#savedWorlds .sw2-wrap{height:100%;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 0,#3b3b3b 0,#191919 55%,#111 100%)}#savedWorlds .sw2-head{display:flex;align-items:center;gap:10px;padding:18px 26px;background:#292929;border-bottom:2px solid #111}#savedWorlds .sw2-title{margin:0 auto 0 0;font-size:28px;font-weight:800;text-shadow:2px 2px #000}#savedWorlds .sw2-count{color:#aaa;font-size:12px;margin-left:8px}.sw2-btn{min-height:42px;padding:9px 14px;border:1px solid #0b0b0b;border-radius:6px;background:#4a4a4a;color:#fff;cursor:pointer;font-weight:700;box-shadow:0 3px #0b0b0b}.sw2-btn:hover{filter:brightness(1.12)}.sw2-btn:disabled{opacity:.5;cursor:default}.sw2-green{background:#65864b}.sw2-red{background:#774747}#savedWorlds .sw2-body{flex:1;overflow:auto;padding:26px}.sw2-grid{max-width:1180px;margin:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px}.sw2-card{background:linear-gradient(145deg,#424242,#2b2b2b);border:1px solid #101010;border-radius:9px;padding:18px;box-shadow:0 9px 22px #0006;display:flex;flex-direction:column;min-height:175px}.sw2-card h3{margin:0 0 8px;font-size:20px;word-break:break-word}.sw2-badge{align-self:flex-start;padding:4px 8px;border-radius:99px;background:#1e1e1e;color:#aaa;font-size:10px;text-transform:uppercase;letter-spacing:.5px}.sw2-meta{margin-top:auto;color:#aaa;font-size:12px;line-height:1.5}.sw2-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:15px}.sw2-empty{max-width:600px;margin:12vh auto;padding:34px;text-align:center;background:#252525;border:1px solid #555;border-radius:10px;color:#aaa}.sw2-empty h2{color:#fff;margin:0 0 10px;font-size:26px}.sw2-panel{position:fixed;right:24px;top:100px;width:min(430px,calc(100% - 48px));max-height:calc(100% - 124px);overflow:auto;transform:translateX(120%);transition:.18s;background:#222;border:1px solid #666;border-radius:10px;box-shadow:0 18px 40px #000a}.sw2-panel.open{transform:translateX(0)}.sw2-panel-head{padding:17px;border-bottom:1px solid #111;display:flex;align-items:center}.sw2-panel-head h2{margin:0 auto 0 0}.sw2-panel-body{padding:20px}.sw2-label{color:#999;font-size:12px;margin:0 0 7px}.sw2-seed{padding:13px;background:#101010;border:1px solid #000;border-radius:6px;font-family:monospace;word-break:break-all}.sw2-field{width:100%;height:44px;margin-top:10px;padding:0 11px;border-radius:6px;border:1px solid #555;background:#111;color:#fff;box-sizing:border-box}.sw2-modal{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:#000b;padding:20px}.sw2-modal-card{width:min(480px,94vw);background:#272727;border:1px solid #666;border-radius:10px;padding:25px;box-sizing:border-box}.sw2-modal-card h2{margin:0 0 8px}.sw2-help{color:#aaa;font-size:12px;line-height:1.5;margin:0 0 15px}@media(max-width:700px){#savedWorlds .sw2-head{flex-wrap:wrap;padding:12px 14px}.sw2-title{width:100%;font-size:22px}.sw2-count{margin-left:auto}.sw2-grid{grid-template-columns:1fr}.sw2-panel{right:12px;top:12px;width:calc(100% - 24px);max-height:calc(100% - 24px)}}`,document.head.appendChild(n)}function o_(){on||(RI(),on=document.createElement("div"),on.id="savedWorlds",on.innerHTML='<div class="sw2-wrap"><div class="sw2-head"><h1 class="sw2-title">Saved Worlds <span class="sw2-count"></span></h1><button class="sw2-btn" data-act="reload">↻ Reload</button><button class="sw2-btn sw2-green" data-act="new">+ New World</button><button class="sw2-btn" data-act="back">← Back</button></div><div class="sw2-body"><div class="sw2-grid"></div><aside class="sw2-panel"><div class="sw2-panel-head"><h2></h2><button class="sw2-btn" data-act="close">×</button></div><div class="sw2-panel-body"><p class="sw2-label">World seed</p><div class="sw2-seed" data-seed>—</div><p class="sw2-help">Your complete world, including block changes, is stored in this browser and synced to your account when signed in.</p><button class="sw2-btn" style="width:100%;margin:5px 0" data-act="copy">Copy Seed</button><button class="sw2-btn sw2-green" style="width:100%;margin:5px 0" data-act="play">Play World</button><button class="sw2-btn sw2-red" style="width:100%;margin:5px 0" data-act="delete">Delete World</button><div data-message style="min-height:20px;margin-top:8px;font-size:12px"></div></div></aside><div class="sw2-modal"><div class="sw2-modal-card"><h2>Create New World</h2><p class="sw2-help">Give the world a name. The seed below is unique and can be copied later.</p><p class="sw2-label">Seed</p><div class="sw2-seed" data-new-seed></div><input class="sw2-field" maxlength="40" placeholder="World name" data-name><div data-create-message style="min-height:20px;font-size:12px;margin-top:8px"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px"><button class="sw2-btn sw2-green" data-act="create">Create & Play</button><button class="sw2-btn" data-act="cancel">Cancel</button></div></div></div></div>',document.body.appendChild(on),ll=on.querySelector(".sw2-grid"),ur=on.querySelector(".sw2-panel"),xs=on.querySelector(".sw2-modal"),on.addEventListener("click",n=>{const e=n.target.closest("[data-act]")?.dataset.act;e&&(e==="reload"&&UI(),e==="new"&&FI(),e==="back"&&yg(),e==="close"&&Mu(),e==="copy"&&PI(),e==="play"&&DI(),e==="delete"&&NI(),e==="cancel"&&Ul(),e==="create"&&yb())}),on.querySelector("[data-name]").addEventListener("keydown",n=>{n.stopPropagation(),n.key==="Enter"&&yb(),n.key==="Escape"&&Ul()}),on.addEventListener("keydown",n=>n.stopPropagation()))}function kh(){try{const n=new Uint32Array(2);return crypto.getRandomValues(n),(n[0]^n[1])>>>0}catch{return Math.floor(Math.random()*4294967296)>>>0}}function LI(){on.style.display="block",document.getElementById("mainMenu")?.style&&(document.getElementById("mainMenu").style.display="none")}function yg(){Lw(),Mu(),Ul(),on&&(on.style.display="none");const n=document.getElementById("mainMenu");n&&(n.style.display="flex")}function Vo(n){if(Ln=n.map(Qo).filter(Boolean).sort((e,t)=>new Date(t.updatedAt).getTime()-new Date(e.updatedAt).getTime()),xg(Ln),on.querySelector(".sw2-count").textContent=`${Ln.length} world${Ln.length===1?"":"s"}`,!Ln.length){ll.innerHTML='<div class="sw2-empty"><h2>No saved worlds</h2><p>Create a world and your block changes will be saved here automatically.</p><button class="sw2-btn sw2-green" data-act="new">+ Create New World</button></div>';return}ll.innerHTML=Ln.map((e,t)=>`<article class="sw2-card"><h3>${jf(e.name||`World ${t+1}`)}</h3><span class="sw2-badge">Synced</span><div class="sw2-meta">Seed: ${jf(e.seed)}<br>${jf(CI(e.updatedAt))}</div><div class="sw2-actions"><button class="sw2-btn sw2-green" data-play-seed="${e.seed}">Play</button><button class="sw2-btn" data-details-seed="${e.seed}">Details</button></div></article>`).join(""),ll.querySelectorAll("[data-play-seed]").forEach(e=>e.addEventListener("click",()=>wg(Ln.find(t=>t.seed===kt(e.dataset.playSeed))))),ll.querySelectorAll("[data-details-seed]").forEach(e=>e.addEventListener("click",()=>II(Ln.find(t=>t.seed===kt(e.dataset.detailsSeed)))))}function II(n){n&&(Go=n,ur.querySelector("h2").textContent=n.name,ur.querySelector("[data-seed]").textContent=String(n.seed),ur.querySelector("[data-message]").textContent="",ur.classList.add("open"))}function Mu(){ur?.classList.remove("open"),Go=null}async function PI(){if(!Go)return;let n=!1;try{await navigator.clipboard.writeText(String(Go.seed)),n=!0}catch{}const e=ur.querySelector("[data-message]");e.style.color=n?"#9bc47c":"#d7a0a0",e.textContent=n?"Seed copied!":"Could not copy the seed."}function wg(n){!n||!Uh||(yg(),Uh(n.seed))}function DI(){wg(Go)}async function NI(){if(!Go)return;const n=Go;if(!confirm(`Delete "${String(n.name).replaceAll(`
`," ")}"? This will remove the world from this browser and from cloud storage when available.`))return;const e=kt(n.seed);if(e===null)return;const t=ur.querySelector('[data-act="delete"]');t.disabled=!0,t.textContent="Deleting...";try{await TI(e),Ln=Ln.filter(r=>kt(r.seed)!==e),Vo(Ln),Mu();const i=window.webMinecraftDeleteCloudWorld;if(typeof i=="function"){let r=!1;try{r=await i(e)}catch{}if(!r)try{const o="webminecraft_pending_cloud_deletes",a=JSON.parse(localStorage.getItem(o)||"[]"),s=new Set(Array.isArray(a)?a.map(kt).filter(l=>l!==null):[]);s.add(e),localStorage.setItem(o,JSON.stringify([...s]))}catch{}}await vg(e)}catch(i){console.error(i)}finally{t.disabled=!1,t.textContent="Delete World"}}function FI(){Fd=kh();const n=xs;n.querySelector("[data-new-seed]").textContent=Fd,n.querySelector("[data-name]").value="",n.querySelector("[data-create-message]").textContent="",n.style.display="flex",n.querySelector("[data-name]").focus()}function Ul(){xs&&(xs.style.display="none"),Fd=null}async function yb(){const n=xs,e=n.querySelector("[data-name]"),t=n.querySelector("[data-create-message]"),i=n.querySelector('[data-act="create"]');let r=kt(Fd)??kh();const o=e.value.trim().slice(0,i_)||`World ${Ln.length+1}`;i.disabled=!0,t.textContent="Creating world...";try{for(;await Su(r);)r=kh();yI(r);const a=new Date().toISOString(),s=await bg({seed:r,name:o,createdAt:a,updatedAt:a,blocks:{}});if(typeof window.webMinecraftClearCloudWorldDeletion=="function")try{await window.webMinecraftClearCloudWorldDeletion(r)}catch{}typeof window.webMinecraftSaveCloudWorld=="function"&&(await window.webMinecraftSaveCloudWorld(s)||console.warn("World created locally but could not be uploaded to the account yet.")),Ln=[s,...Ln.filter(l=>l.seed!==r)],Vo(Ln),Ul(),wg(s)}catch(a){console.error(a),t.style.color="#d7a0a0",t.textContent=a?.message||"Could not create the world."}finally{i.disabled=!1}}async function a_(){const n=window.webMinecraftDeleteCloudWorld;if(typeof n!="function")return;const e="webminecraft_pending_cloud_deletes";let t=[];try{t=JSON.parse(localStorage.getItem(e)||"[]")}catch{}if(!Array.isArray(t)||!t.length)return;const i=[];for(const r of[...new Set(t.map(kt).filter(o=>o!==null))])try{await n(r)||i.push(r)}catch{i.push(r)}try{localStorage.setItem(e,JSON.stringify(i))}catch{}}async function wb(){if(Jf||navigator.onLine===!1)return;const n=window.webMinecraftListCloudWorlds;if(typeof n=="function"){Jf=!0;try{const e=await n(),t=await Fl(),i=new Map(t.map(o=>[o.seed,o])),r=e.map(o=>{const a=kt(o.seed??o.id),s=i.get(a);return Qo({...s||{},seed:a,name:o.name||s?.name,createdAt:o.createdAt||s?.createdAt,updatedAt:o.updatedAt||s?.updatedAt,blocks:s?.blocks||{}})}).filter(Boolean);Vo(r)}catch(e){console.warn("Live saved-world refresh failed:",e)}finally{Jf=!1}}}async function UI(){const n=on.querySelector('[data-act="reload"]');n.disabled=!0;try{await a_();const e=await Fl();if(Vo(e),typeof window.webMinecraftCloudSync=="function"){try{await window.webMinecraftCloudSync()}catch{}Vo(await Fl())}}catch(e){console.error("Could not reload worlds:",e)}finally{n.disabled=!1}}async function kI(){o_(),LI();try{if(await xl,await a_(),Vo(await Fl()),typeof window.webMinecraftCloudSync=="function"){try{await window.webMinecraftCloudSync()}catch{}Vo(await Fl())}}catch(n){console.error("Could not load saved worlds:",n)}}async function BI(n){return Su(n)}async function OI(n){return bg(n)}function bt(n){const e=kt(n);return e!==null&&vr().has(e)}async function zI(){return xl||(xl=AI()),await xl,!0}function HI({onOpenWorld:n}={}){if(vb)return;vb=!0,Uh=n,o_(),xl=zI();const e=document.getElementById("playButton");e&&e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),kI()},!0),window.addEventListener("webminecraft:cloudworldschanged",()=>{wb().catch(()=>{})}),window.addEventListener("webminecraft:cloudworldssynced",()=>{on?.style.display==="block"&&wb().catch(()=>{})}),window.addEventListener("keydown",t=>{t.code==="Escape"&&on?.style.display==="block"&&(ur?.classList.contains("open")?Mu():xs?.style.display==="flex"?Ul():yg())})}(function(){if(window.__webminecraftNewsInsertionPatched)return;window.__webminecraftNewsInsertionPatched=!0;const e=Node.prototype.insertBefore;Node.prototype.insertBefore=function(t,i){if(t&&t.id==="newsButton"){const r=window.innerWidth<=560;t.style.position="fixed",t.style.left=r?"12px":"28px",t.style.bottom=r?"18px":"28px",t.style.width=r?"calc(50vw - 18px)":"118px",t.style.margin="0",t.style.zIndex="97"}return e.call(this,t,i)}})();const WI=50,GI=1500,VI=5e3,XI="webminecraft-singleplayer-world-blocks-",qI="webminecraft-singleplayer-world-state-";let qe=null,Fn=null,Ai={},jr=null,bl=null,kd=null,Mn=0;const Xo=new Map;function s_(n){return new Promise(e=>setTimeout(e,n))}function ea(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function l_(){return ea(new URLSearchParams(window.location.search).get("seed"))}async function Eu(n=1e4){const e=Date.now();for(;Date.now()-e<n;){const t=window.webMinecraftWorldStorage;if(t&&typeof t.getLocalWorld=="function")return t;await s_(50)}return null}function c_(n){const e=ea(n);return e===null?null:`${XI}${e}`}function $I(n){const e=ea(n);return e===null?null:`${qI}${e}`}function _g(n){const e=c_(n);if(!e)return{};try{const t=JSON.parse(localStorage.getItem(e)||"{}");return t&&typeof t=="object"&&!Array.isArray(t)?t:{}}catch{return{}}}function Tu(n,e){const t=c_(n);if(t)try{localStorage.setItem(t,JSON.stringify(e||{}))}catch{}}function YI(n){return{1:"grass_block_side.png",2:"dirt.png",3:"stone.png",4:"sand.png",5:"oak_log_top.png",6:"oak-leaves-normal-original-default.png",7:"cobblestone.png",8:"gravel.png",9:"sandstone.png",10:"bedrock.png",11:"coal_ore.png",12:"iron_ore.png",13:"oak_planks.png",14:"snow.png",15:"tnt_side.png",16:"Flint_and_Steel_JE4_BE2.png",17:"oak_door_bottom.png",18:"bricks.png",19:"stone_bricks.png",20:"cracked_stone_bricks.png",21:"mossy_stone_bricks.png",22:"dirt_path_top.png"}[Number(n)]||null}function KI(n){return!Array.isArray(n)||n.length!==36?Array.from({length:36},()=>null):n.map(e=>{if(!e||!Number.isFinite(Number(e.itemId))||!Number.isFinite(Number(e.count)))return null;const t=Math.floor(Number(e.itemId)),i=Math.max(1,Math.min(64,Math.floor(Number(e.count))));return{itemId:t,count:i,texture:e.texture||YI(t)}})}function ZI(){try{return KI(JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]"))}catch{return Array.from({length:36},()=>null)}}function Au(n,e=!1){const t=$I(n),i=window.__webminecraftCamera;if(!t||!i||!e&&window.__webminecraftMultiplayerActive===!0)return;let r={};try{const a=JSON.parse(localStorage.getItem(t)||"{}");a&&typeof a=="object"&&(r=a)}catch{}const o={...r,version:2,seed:ea(n),position:r.position&&Number.isFinite(Number(r.position.x))&&Number.isFinite(Number(r.position.y))&&Number.isFinite(Number(r.position.z))?r.position:{x:Number(i.position.x),y:Number(i.position.y),z:Number(i.position.z)},inventory:ZI(),updatedAt:new Date().toISOString()};try{localStorage.setItem(t,JSON.stringify(o))}catch{}}async function JI(n,e){const t=ea(n);if(t===null||bt(t))return null;if(qe&&qe.seed===t&&Fn===t)return qe;const i=await Eu();if(!i||bt(t))return null;const r=await i.getLocalWorld(t).catch(()=>null);return!r||bt(t)?null:(e===Mn&&!bt(t)&&(qe={...r,seed:t},Fn=t),qe||r)}async function jI(n,e){const t=ea(n);if(t===null||bt(t))return null;try{const i=await JI(t,e);if(e!==Mn||bt(t))return null;const r=await $w(t,i).catch(()=>null);if(e!==Mn||bt(t))return null;const o=_g(t),a=r?.blocks&&typeof r.blocks=="object"?r.blocks:{},s=i?.blocks&&typeof i.blocks=="object"?i.blocks:{},l={};for(const u of Xo.values())l[`${u.x},${u.y},${u.z}`]=u.type;const c={...a,...s,...o,...l},d=r||i;if(!d)return null;qe={...d,seed:t,blocks:c},Fn=t,Ai={...c};const f=await Eu();if(!f||bt(t)||e!==Mn)return null;await f.saveLocalWorld(qe).catch(()=>{});for(const[u,p]of Object.entries(Ai)){if(e!==Mn||Fn!==t||bt(t))return null;const m=u.split(",").map(Number);if(m.length!==3||m.some(g=>!Number.isFinite(g)))continue;const b=Number(p);Number.isFinite(b)&&An(m[0],m[1],m[2],b)}return Tu(t,Ai),eP(),qe}catch(i){return console.warn("Could not load saved world blocks:",i),null}}async function Bd(n,e=Mn){if(!n||bt(n.seed)||e!==Mn||Fn!==n.seed||qe!==n)return!1;try{return await _u(n),!0}catch(t){return console.warn("Cloud world save failed:",t),!1}}function QI(n,e=Mn,t=!1){if(clearTimeout(bl),!(!n||bt(n.seed))){if(t){Bd(n,e);return}bl=setTimeout(async()=>{bl=null,await Bd(n,e)},GI)}}function eP(){clearInterval(kd),kd=setInterval(()=>{!qe||!Fn||bt(Fn)||Xo.size>0||jr||(Au(Fn),Bd(qe,Mn))},VI)}function tP(){clearInterval(kd),kd=null}async function Bh(){if(jr=null,!qe)return;const n=qe,e=n.seed,t=Mn;if(bt(e)){Xo.clear();return}const i={...Ai,..._g(e)};Xo.clear(),Ai={...i},Tu(e,i),Au(e,!0);const r=await Eu();if(!r?.saveLocalWorld||t!==Mn||qe!==n||bt(e)){qe===n&&Fn===e&&t===Mn&&!bt(e)&&(jr=setTimeout(Bh,1e3));return}try{n.blocks=i,n.updatedAt=new Date().toISOString();const o=await r.saveLocalWorld(n);o&&qe===n&&Fn===e&&t===Mn&&!bt(e)&&(qe=o,QI(o,t))}catch(o){console.warn(`Could not save world blocks for seed ${e}:`,o),qe===n&&Fn===e&&t===Mn&&!bt(e)&&(jr=setTimeout(Bh,1e3))}}window.addEventListener("webminecraft:blockchange",n=>{const e=n.detail||{},t=Math.floor(Number(e.x)),i=Math.floor(Number(e.y)),r=Math.floor(Number(e.z)),o=Math.floor(Number(e.type));if(![t,i,r,o].every(Number.isFinite))return;const a=l_();if(a===null||bt(a))return;const s=`${t},${i},${r}`;Ai[s]=o,Xo.set(s,{x:t,y:i,z:r,type:o}),Tu(a,Ai),Au(a),qe&&Fn===a&&(qe.blocks={...qe.blocks,...Ai},qe.updatedAt=new Date().toISOString())});async function d_(n){const e=ea(n);if(e===null)return null;const t=++Mn;return clearTimeout(jr),clearTimeout(bl),tP(),jr=null,bl=null,Xo.clear(),Ai={},qe=null,Fn=e,bt(e)?(Fn=null,null):jI(e,t)}async function nP(n){return d_(n)}async function Sg(){if(!qe||bt(qe.seed))return null;if(clearTimeout(jr),jr=null,Xo.size>0&&await Bh(),qe&&!bt(qe.seed)){const n={...Ai,..._g(qe.seed)};Ai=n,qe.blocks=n,qe.updatedAt=new Date().toISOString(),Tu(qe.seed,n),Au(qe.seed,!0);const e=await Eu();if(e?.saveLocalWorld&&Fn===qe.seed&&!bt(qe.seed))try{qe=await e.saveLocalWorld(qe)||qe}catch{}await Bd(qe,Mn)}return qe}async function iP(){const n=l_();n!==null&&(await s_(WI),await d_(n))}window.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Sg()});window.addEventListener("pagehide",()=>{Sg()});window.addEventListener("beforeunload",()=>{Sg()});iP().catch(n=>console.warn("World persistence initialization failed:",n));const u_={1:wd,2:lu,3:ql,4:cu,5:_d,6:Wm,7:Pm,8:$l,9:Dm,10:Nm,11:Fm,12:Um,13:km,14:Gm,15:Vm,18:Bm,19:Om,20:zm,21:Hm,22:Xm},Oc=new R(.84,-.76,-1.05),zc=new $i(.08,-.18,-.1),rP=180,oP=n=>`/WebMinecraftT/textures/${encodeURIComponent(n)}`;let Jn,Ia,Pa,Qn,ni,Oi,Js,kl=!1,Ja=0,Oh=0,sd=null,f_=0;function aP(n){const e=new As().load(oP(n));return e.magFilter=Fe,e.minFilter=Fe,e.colorSpace=st,e}const sP=aP("Flint_and_Steel_JE4_BE2.png");function lP(){const n=document.createElement("canvas");n.width=n.height=16;const e=n.getContext("2d");e.imageSmoothingEnabled=!1,e.fillStyle="#d69b72",e.fillRect(0,0,16,16),e.fillStyle="#e2ad83",e.fillRect(1,1,12,10),e.fillStyle="#c18461",e.fillRect(0,11,16,5),e.fillStyle="#b87655",e.fillRect(12,3,4,10),e.fillStyle="#754932",e.fillRect(0,0,16,1),e.fillRect(0,15,16,1);const t=new jo(n);return t.magFilter=t.minFilter=Fe,t.colorSpace=st,t}function _b(n){if(!n?.clone)return n;const e=n.clone();return e.vertexColors=!1,e.color&&e.color.setRGB(1,1,1),e.needsUpdate=!0,e}function cP(n){const e=u_[n]||ql;return Array.isArray(e)?e.map(_b):_b(e)}function dP(){const n=document.body.classList.contains("webminecraft-in-world"),e=document.getElementById("mainMenu"),t=document.getElementById("seedMenu"),i=document.getElementById("savedWorlds");return n&&(!e||getComputedStyle(e).display==="none")&&(!t||getComputedStyle(t).display==="none")&&(!i||getComputedStyle(i).display==="none")}function Hc(){kl=dP(),Jn&&(Jn.domElement.style.display=kl?"block":"none")}function uP(){ni&&(ni.geometry.dispose(),Array.isArray(ni.material)?ni.material.forEach(n=>n?.dispose?.()):ni.material?.dispose?.(),Qn.remove(ni),ni=null),Oi&&(Oi.geometry.dispose(),Oi.material?.dispose?.(),Qn.remove(Oi),Oi=null)}function p_(){if(uP(),Ja===16){const n=new Ts(.48,.72),e=new Ji({map:sP,transparent:!0,alphaTest:.05,depthWrite:!1,side:jt});Oi=new Oe(n,e),Oi.position.set(-.01,.02,-.03),Oi.rotation.set(.02,.12,-.12),Oi.renderOrder=3,Qn.add(Oi);return}u_[Ja]&&(ni=new Oe(new ft(.64,.64,.64),cP(Ja)),ni.position.set(-.04,.1,0),ni.rotation.set(.06,.32,-.06),ni.renderOrder=2,Qn.add(ni))}function h_(n){try{const e=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]");return Number(e?.[n]?.itemId)||0}catch{return 0}}function Sb(){const n=h_(Oh);n!==Ja&&(Ja=n,p_())}function Qf(n){kl&&(sd=n,f_=performance.now())}function fP(){return!!(ot.KeyW||ot.KeyA||ot.KeyS||ot.KeyD||Math.abs(Le.moveX||0)>.08||Math.abs(Le.moveZ||0)>.08)}function Mb(){if(document.getElementById("heldBlock3DCanvas"))return;Jn=new Rm({alpha:!0,antialias:!1,powerPreference:"high-performance"}),Jn.setPixelRatio(1),Jn.setSize(window.innerWidth,window.innerHeight),Jn.setClearColor(0,0),Jn.outputColorSpace=st,Jn.domElement.id="heldBlock3DCanvas",Object.assign(Jn.domElement.style,{position:"fixed",left:"0",top:"0",width:"100vw",height:"100vh",pointerEvents:"none",zIndex:"35",display:"none"}),document.body.appendChild(Jn.domElement);const n=document.createElement("style");n.id="heldBlock3DStyles",n.textContent="#heldBlock{display:none!important}",document.head.appendChild(n),Pa=new Eo,Ia=new Pn(30,window.innerWidth/window.innerHeight,.01,30),Ia.position.set(0,0,3),Ia.lookAt(0,0,0),Pa.add(new My(16777215,2.8));const e=new yd(16777215,3.5);e.position.set(-2,3,4),Pa.add(e);const t=new yd(16777215,1.5);t.position.set(3,1,2),Pa.add(t),Qn=new Tn,Qn.position.copy(Oc),Qn.rotation.copy(zc),Qn.scale.setScalar(1.08),Pa.add(Qn),Js=new Oe(new ft(.3,.76,.3),new Ji({map:lP()})),Js.position.set(.22,-.29,.08),Js.rotation.x=-.22,Js.rotation.z=-.12,Qn.add(Js),Ja=h_(Oh),p_(),Hc(),window.addEventListener("resize",()=>{Jn.setSize(window.innerWidth,window.innerHeight),Ia.aspect=window.innerWidth/window.innerHeight,Ia.updateProjectionMatrix()}),window.addEventListener("webminecraft:selectedslot",o=>{Oh=Number(o.detail?.slot??0),Sb(),Hc()}),window.addEventListener("mousedown",o=>{!kl||document.body.classList.contains("mobile-mode")||document.pointerLockElement===document.body&&(o.button===0&&Qf("mine"),o.button===2&&Qf("place"))}),window.addEventListener("webminecraft:heldaction",o=>{const a=o.detail?.type;(a==="mine"||a==="place")&&Qf(a)}),new MutationObserver(Hc).observe(document.body,{attributes:!0,attributeFilter:["class"]}),setInterval(()=>{Sb(),Hc()},100);function r(){if(requestAnimationFrame(r),!kl)return;const o=performance.now(),a=fP(),s=a?.012:.0022,l=a?Math.sin(o*s)*.055:Math.sin(o*s)*.008,c=a?Math.cos(o*s*.52)*.018:0;let d=0,f=0,u=0,p=0;if(sd){const m=Be.clamp((o-f_)/rP,0,1),b=Math.sin(Math.PI*m);sd==="mine"?(d=-.72*b,f=.18*b,u=.11*b,p=.1*b):(d=-.38*b,f=.1*b,u=-.04*b,p=.12*b),m>=1&&(sd=null)}Qn.position.set(Oc.x+c+u,Oc.y+l-Math.abs(u)*.2,Oc.z+p),Qn.rotation.set(zc.x+d,zc.y,zc.z+f+c*.5),Jn.render(Pa,Ia)}r()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Mb,{once:!0}):Mb();const Da=new Xl,pP=new De(0,0),Eb=5;let or=0,ep=!1,Tb=!1;function hP(){let n=document.getElementById("hotbar");if(!n){n=document.createElement("div"),n.id="hotbar";for(let e=0;e<9;e++){const t=document.createElement("div");t.className="slot",n.appendChild(t)}document.body.appendChild(n)}for(;n.querySelectorAll(".slot").length<9;){const e=document.createElement("div");e.className="slot",n.appendChild(e)}if(n.classList.add("textured-hotbar"),n.style.removeProperty("display"),n.style.removeProperty("visibility"),n.style.removeProperty("opacity"),n.style.setProperty("pointer-events","auto","important"),n.querySelectorAll(".slot").forEach((e,t)=>{e.title=`${t+1}`,e.setAttribute("aria-label",`Hotbar slot ${t+1}`),e.innerHTML=`<span class="hotbarNumber">${t+1}</span>`}),!document.getElementById("webMinecraftTexturedHotbarStyles")){const e=document.createElement("style");e.id="webMinecraftTexturedHotbarStyles",e.textContent=`
#hotbar.textured-hotbar{position:fixed!important;left:50%!important;bottom:20px!important;transform:translateX(-50%)!important;display:flex!important;gap:0!important;padding:4px!important;background:rgba(25,25,25,.96)!important;border:3px solid #111!important;box-shadow:inset 2px 2px 0 #777,inset -2px -2px 0 #333,0 3px 0 rgba(0,0,0,.65)!important;z-index:10000!important;image-rendering:pixelated;pointer-events:auto!important}
body:not(.webminecraft-in-world) #hotbar.textured-hotbar{display:none!important}
body.inventory-open #hotbar.textured-hotbar{display:none!important}
#savedWorlds{z-index:20000!important}
#savedWorlds:not([style*="display: none"]) ~ #hotbar.textured-hotbar{display:none!important}
#hotbar.textured-hotbar .slot{position:relative;width:52px!important;height:52px!important;flex:0 0 52px!important;padding:0!important;margin:0!important;border:2px solid #555!important;background:#222!important;overflow:hidden;cursor:pointer;image-rendering:pixelated}
#hotbar.textured-hotbar .slot.selected{border:3px solid #fff!important;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111!important;z-index:2}
#hotbar.textured-hotbar .hotbarNumber{position:absolute;left:2px;top:1px;min-width:13px;height:14px;padding:0 2px;color:#fff;font:11px/14px Arial,sans-serif;font-weight:700;text-align:center;text-shadow:1px 1px 0 #000;background:rgba(0,0,0,.45);pointer-events:none;z-index:3}
#hotbar.textured-hotbar .hotbarCount{position:absolute;right:3px;bottom:1px;color:#fff;font:bold 13px Arial,sans-serif;text-shadow:2px 2px 0 #000;pointer-events:none;z-index:3}
.hotbarTexture{position:absolute!important;inset:5px!important;display:block!important;background-position:center!important;background-size:100% 100%!important;background-repeat:no-repeat!important;image-rendering:pixelated!important;pointer-events:none!important;z-index:1!important}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar{left:50%!important;bottom:8px!important;transform:translateX(-50%)!important;z-index:10000!important;max-width:calc(100vw - 92px)!important;overflow-x:auto!important;scrollbar-width:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar::-webkit-scrollbar{display:none}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar .slot{width:56px!important;height:56px!important;flex-basis:56px!important}
body.mobile-mode.webminecraft-in-world #hotbar.textured-hotbar + #inventoryButton{z-index:10001!important}
@media(max-width:700px){#hotbar.textured-hotbar .slot{width:48px!important;height:48px!important;flex-basis:48px!important}}
`,document.head.appendChild(e)}}function mP(){let n=document.getElementById("webMinecraftCrosshair");if(n)return n;n=document.createElement("div"),n.id="webMinecraftCrosshair",n.setAttribute("aria-hidden","true"),n.innerHTML="<span></span><span></span>",n.style.cssText="position:fixed;left:50%;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);pointer-events:none;z-index:9999;";const e=document.createElement("style");return e.id="webMinecraftCrosshairStyles",e.textContent=`
#webMinecraftCrosshair span{position:absolute;display:block;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.8)}
#webMinecraftCrosshair span:first-child{left:1px;right:1px;top:8px;height:2px}
#webMinecraftCrosshair span:last-child{top:1px;bottom:1px;left:8px;width:2px}
body.webminecraft-in-world #webMinecraftCrosshair{display:block}
body:not(.webminecraft-in-world) #webMinecraftCrosshair{display:none}
`,document.head.appendChild(e),document.body.appendChild(n),n}function gP(n,e){window.__webminecraftMiningScene=n,window.__webminecraftMiningCamera=e;const t=vt();CL(n),XL(n,e),hP(),iL(e),w3(n,e),d();const i=xP();n.add(i),mP();const r=()=>{document.querySelectorAll("#hotbar .slot").forEach((u,p)=>u.classList.toggle("selected",p===or)),window.dispatchEvent(new CustomEvent("webminecraft:selectedslot",{detail:{slot:or}}))};document.addEventListener("keydown",u=>{if(document.body.classList.contains("mobile-mode")&&u.isTrusted)return;const p=Number(u.key);p>=1&&p<=9&&(or=p-1,r())}),document.querySelectorAll("#hotbar .slot").forEach((u,p)=>{u.addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),or=p,r()})}),document.addEventListener("mousedown",u=>{if(!document.body.classList.contains("mobile-mode")&&document.body.classList.contains("webminecraft-in-world")&&!document.body.classList.contains("inventory-open")&&!(u.target instanceof Element&&u.target.closest("#hotbar, #inventoryScreen, #doorSelectButton, button, input, select, textarea, a"))){if(u.button===0){if(a()){u.preventDefault(),u.stopImmediatePropagation(),Id(n,e);return}l()}u.button===2&&c()}}),document.addEventListener("contextmenu",u=>{document.body.classList.contains("webminecraft-in-world")&&u.preventDefault()});function o(){const u=document.body.classList.contains("mobile-mode"),p=u&&!!Le.breakPressed,m=u&&!!Le.placePressed;p&&!ep&&a()?Id(n,e):p&&!ep&&l(),m&&!Tb&&c(),ep=p,Tb=m,d(),requestAnimationFrame(o)}o();function a(){return document.body.classList.contains("webminecraft-survival")}function s(u,p,m,b){window.dispatchEvent(new CustomEvent("webminecraft:blockchange",{detail:{x:u,y:p,z:m,type:b}}))}function l(){if(Rh("break")){ki("mine");return}const u=Wc(n,e);if(!u)return;const p=Pe(u.x,u.y,u.z);!p||p===t.AIR||p===t.BEDROCK||An(u.x,u.y,u.z,t.AIR)&&(ki("mine"),br(u.x,u.y,u.z,t.AIR),s(u.x,u.y,u.z,t.AIR),yP(n,new R(u.x,u.y,u.z)))}function c(){if(Tw()){Rh("use")&&ki("place");return}const u=nL(or);if(!u)return;if(u===17||y3()){const _=Wc(n,e);if(!_)return;_3(_)&&(u===17&&Uc(or),ki("place"));return}if(u===16){sb(n,e,u)&&(Uc(or),ki("place"));return}if(u>t.DIRT_PATH)return;const p=Wc(n,e);if(!p)return;if(sb(n,e,u)){Uc(or)&&ki("place");return}const m=p.normal.clone().set(Math.round(p.normal.x),Math.round(p.normal.y),Math.round(p.normal.z)),b=p.x+m.x,g=p.y+m.y,h=p.z+m.z;if(Pe(b,g,h)===t.AIR&&!vP({x:b,y:g,z:h},e)&&An(b,g,h,u)){if(!Uc(or)){An(b,g,h,t.AIR);return}ki("place"),br(b,g,h,u),s(b,g,h,u)}}function d(){if(!document.body.classList.contains("mobile-mode")||!document.body.classList.contains("webminecraft-in-world"))return;const u=document.getElementById("hotbar"),p=document.getElementById("inventoryButton");if(!u||!p||u.offsetParent===null)return;const m=u.getBoundingClientRect(),b=Math.max(m.height,48);p.style.setProperty("position","fixed","important"),p.style.setProperty("left",`${Math.max(6,m.left-b-8)}px`,"important"),p.style.setProperty("top",`${m.top+(m.height-b)/2}px`,"important"),p.style.setProperty("width",`${b}px`,"important"),p.style.setProperty("height",`${b}px`,"important"),p.style.setProperty("right","auto","important"),p.style.setProperty("bottom","auto","important"),p.style.setProperty("z-index","10001","important")}function f(){const u=Wc(n,e);u?(bP(i,u),i.visible=!0):i.visible=!1,requestAnimationFrame(f)}f(),r()}function Wc(n,e,t){const i=Tw();if(i)return i;e.updateMatrixWorld(!0),Da.setFromCamera(pP,e),Da.near=.01,Da.far=Eb;const o=Da.intersectObjects(n.children,!0).find(c=>{if(!c.object?.userData?.isChunk||!c.face)return!1;let d=c.object;for(;d;){if(d.userData?.isWater===!0)return!1;d=d.parent}return!0});if(Da.near=0,Da.far=1/0,!o||o.distance>Eb)return null;const a=o.face.normal.clone().normalize(),s=o.point.clone(),l={x:Math.floor(s.x-a.x*.01+.5),y:Math.floor(s.y-a.y*.01+.5),z:Math.floor(s.z-a.z*.01+.5)};return{hit:o,normal:a,x:l.x,y:l.y,z:l.z}}function xP(){const n=new Tn;n.name="blockSelectionOutline";const e=new Em({color:0,transparent:!0,opacity:.9}),t=new un,i=new Float32Array([-.501,-.501,-.501,.501,-.501,-.501,.501,-.501,-.501,.501,.501,-.501,.501,.501,-.501,-.501,.501,-.501,-.501,.501,-.501,-.501,-.501,-.501,-.501,-.501,.501,.501,-.501,.501,.501,-.501,.501,.501,.501,.501,.501,.501,.501,-.501,.501,.501,-.501,.501,.501,-.501,-.501,.501,-.501,-.501,-.501,-.501,-.501,.501,.501,-.501,-.501,.501,-.501,.501,.501,.501,-.501,.501,.501,.501,-.501,.501,-.501,-.501,.501,.501]);t.setAttribute("position",new gn(i,3));const r=new xy(t,e);return r.name="selectionEdges",n.add(r),n}function bP(n,e,t){n.position.set(e.x,e.y,e.z)}function vP(n,e){const t=e.position;return t.x>n.x-.3&&t.x<n.x+1.3&&t.z>n.z-.3&&t.z<n.z+1.3&&t.y>n.y-1.8&&t.y<n.y+1.8}function yP(n,e,t,i){const r=new ft(.07,.07,.07),o=[];for(let a=0;a<8;a++){const s=new Ji({color:9408399,transparent:!0}),l=new Oe(r,s);l.position.copy(e).add(new R((Math.random()-.5)*.7,(Math.random()-.5)*.7,(Math.random()-.5)*.7)),n.add(l),o.push(l)}setTimeout(()=>o.forEach(a=>{n.remove(a),a.material.dispose()}),450)}const Od=3,wP=1,_P=78,Ab=105,Gc=9,Cb=2048,SP=.45;let wn=null,m_=0,Cu=[],cl=0,Rb=!1,zh=performance.now(),tp=null,Bl=null,kr=null,Oa=null,Lb=!1,g_=[];const MP=new Ji({color:16777215,transparent:!1,opacity:1,depthWrite:!1,depthTest:!0,fog:!0,toneMapped:!1}),EP=new ft(Od,wP,Od),TP=new R(.48,.76,.44).normalize();function Zt(n,e,t=0){let i=Math.imul((n|0)^2654435769,374761393);return i=Math.imul(i^(e|0),668265263),i=Math.imul(i^(t|0),1274126177),i=Math.imul(i^(m_|0),1103515245),i^=i>>>13,i=Math.imul(i,2246822519),i^=i>>>16,(i>>>0)/4294967295}function np(n,e,t){n.push(new R(e*Od,0,t*Od))}function AP(n,e){const t=[],i=new Set,r=11+Math.floor(Zt(n,e,17)*13),o=4+Math.floor(Zt(n,e,23)*8);for(let c=-o;c<=o;c++){const d=Zt(n,e,30+c+o),f=Math.max(3,Math.floor(r*(.48+d*.52))),u=Math.floor((Zt(n,e,70+c+o)-.5)*r*.5);for(let p=-f+u;p<=f+u;p++)np(t,p,c)}const a=9+Math.floor(Zt(n,e,140)*10);for(let c=0;c<a;c++){const d=-o+Math.floor(Zt(n,e,150+c)*(o*2+1)),f=Zt(n,e,180+d+o),u=Math.max(3,Math.floor(r*(.48+f*.52))),p=Math.floor((Zt(n,e,220+d+o)-.5)*r*.5),m=Zt(n,e,260+c)>.5?1:-1,b=1+Math.floor(Zt(n,e,280+c)*5),g=m>0?u+p-b+1:-u+p,h=m>0?u+p:-u+p+b-1;for(let _=g;_<=h;_++)i.add(`${_}|${d}`)}const s=5+Math.floor(Zt(n,e,320)*8);for(let c=0;c<s;c++){const d=Math.floor(Zt(n,e,330+c)*4),f=1+Math.floor(Zt(n,e,350+c)*6),u=1+Math.floor(Zt(n,e,370+c)*4);if(d===0||d===1){const p=-o+Math.floor(Zt(n,e,390+c)*(o*2+1)),m=d===0?-r-f:r,b=d===0?-r-1:r+f-1;for(let g=m;g<=b;g++)for(let h=p-u;h<=p+u;h++)np(t,g,h)}else{const p=-r+Math.floor(Zt(n,e,430+c)*(r*2+1)),m=d===2?-o-f:o,b=d===2?-o-1:o+f-1;for(let g=m;g<=b;g++)for(let h=p-u;h<=p+u;h++)np(t,h,g)}}const l=new Map;for(const c of t){const d=`${c.x}|${c.z}`;i.has(d)||l.set(d,c)}return[...l.values()]}function CP(n,e){const t=AP(n,e),i=new gy(EP,MP,t.length),r=new at;for(let c=0;c<t.length;c++)r.makeTranslation(t[c].x,t[c].y,t[c].z),i.setMatrixAt(c,r);i.instanceMatrix.needsUpdate=!0,i.userData.isCloud=!0,i.userData.isInteractive=!1,i.castShadow=!1,i.receiveShadow=!1,i.renderOrder=10;const o=Zt(n,e,500),a=Zt(n,e,510),s=(n+o-.5)*Ab,l=(e+a-.5)*Ab;wn.add(i),Cu.push({mesh:i,baseX:s,baseZ:l,baseY:_P})}function RP(n){if(kr)return;const e=new Vl(1e3,32,16),t=new Ci({uniforms:{topColor:{value:new Ae(4169704)},horizonColor:{value:new Ae(10477055)},bottomColor:{value:new Ae(7519719)},sunDirection:{value:TP.clone()}},vertexShader:"varying vec3 vSkyDirection; void main(){vSkyDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec3 vSkyDirection; uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 bottomColor; uniform vec3 sunDirection; void main(){vec3 dir=normalize(vSkyDirection);float h=clamp(dir.y*0.5+0.5,0.0,1.0);vec3 sky=h<0.5?mix(bottomColor,horizonColor,h*2.0):mix(horizonColor,topColor,(h-0.5)*2.0);vec3 upAxis=abs(sunDirection.y)>0.95?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0);vec3 sunRight=normalize(cross(sunDirection,upAxis));vec3 sunUp=normalize(cross(sunRight,sunDirection));float sx=dot(dir,sunRight);float sy=dot(dir,sunUp);float d=max(abs(sx),abs(sy));float mask=1.0-smoothstep(0.012,0.014,d);float glow=1.0-smoothstep(0.018,0.085,d);vec3 sunColor=vec3(1.0,0.86,0.36);sky+=sunColor*glow*0.18;sky=mix(sky,sunColor,mask);gl_FragColor=vec4(sky,1.0);}",side:Nn,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!1});kr=new Oe(e,t),kr.name="MinecraftSkybox",kr.frustumCulled=!1,kr.renderOrder=-100,n.add(kr)}function LP(n){if(!Oa&&(Oa=new My(8889784,.22),Oa.name="MinecraftUndergroundAmbient",n.add(Oa),g_=n.children.filter(e=>e.isDirectionalLight||e.isHemisphereLight),!Lb)){for(const e of n.children)if(!(!e.isPointLight||e.color?.getHex?.()!==10335954)){e.intensity=0;try{Object.defineProperty(e,"intensity",{configurable:!0,get(){return 0},set(){}})}catch{e.intensity=0}}Lb=!0}}function IP(n){n.traverse(e=>{const t=e.material;!t||Array.isArray(t)||!t.isMeshPhongMaterial||!t.transparent||(t.shininess=0,t.specular?.set?t.specular.set(0):t.specular=0,t.needsUpdate=!0)})}function x_(){Bl&&kr&&kr.position.copy(Bl.position)}function PP(){if(!Bl||!Oa)return;const n=Bl.position.y,e=1-Be.smoothstep(n,-1,8),t=1-Be.smoothstep(n,-24,-1),i=n>=8;for(const r of g_)r.visible=i;Oa.intensity=e*(.08+(1-t)*.04)}function DP(){if(Cu.length=0,!!wn)for(;wn.children.length;)wn.remove(wn.children[0])}function NP(n){m_=Math.floor(Math.abs(Number(n)))>>>0||0,DP();for(let e=-Gc;e<=Gc;e++)for(let t=-Gc;t<=Gc;t++)Zt(e,t,97)<.32||CP(e,t);x_()}function b_(n){const e=Math.min((n-zh)/1e3,.1);if(zh=n,cl+=SP*e,cl>Cb&&(cl-=Cb),wn?.visible)for(const t of Cu)t.mesh.position.set(t.baseX+cl,t.baseY,t.baseZ);x_(),PP(),requestAnimationFrame(b_)}function FP(n,e=null){return Bl=e,RP(n),LP(n),IP(n),wn||(wn=new Tn,wn.name="MinecraftWorldClouds",wn.renderOrder=2,wn.visible=document.body.classList.contains("webminecraft-in-world"),n.add(wn)),Rb||(Rb=!0,zh=performance.now(),requestAnimationFrame(b_)),tp||(tp=new MutationObserver(()=>{wn&&(wn.visible=document.body.classList.contains("webminecraft-in-world"))}),tp.observe(document.body,{attributes:!0,attributeFilter:["class"]})),wn}function v_(n){if(wn){NP(n);for(const e of Cu)e.mesh.position.set(e.baseX+cl,e.baseY,e.baseZ)}}const Yt=0,bs=7,Ru=-32,Mg=95,UP=500,kP=1400,BP=6,y_=9e4,OP=4,zP=12e4,Lu=[[1,0],[-1,0],[0,1],[0,-1]],Ol=vt(),ln=new Map,yr=new Map,vs=[],Hh=new Set,dr=new Set,ip=new Map,ja=new Map,Wh=new WeakMap,No=new Map,za=new Map;let Fo=null,Ib=!1,Ro=0,Gh=0,Eg=!1;_t.wrapS=ss;_t.wrapT=En;_t.magFilter=Fe;_t.minFilter=Fe;_t.colorSpace=st;_t.needsUpdate=!0;const w_=new lt({map:_t,color:16777215,transparent:!0,opacity:.82,depthWrite:!1,depthTest:!0,side:jt,shininess:85,specular:9424872,emissive:465442,emissiveIntensity:.08,vertexColors:!0});w_.forceSinglePass=!0;const ri=(n,e,t)=>`${n},${e},${t}`,ta=n=>n.split(",").map(Number),wi=(n,e)=>`${Math.floor(n/we)},${Math.floor(e/we)}`,ui=n=>Math.floor(Number(n));function kn(n,e,t){if(n=ui(n),e=ui(e),t=ui(t),!Number.isFinite(n)||!Number.isFinite(e)||!Number.isFinite(t)||e<Ru||e>Mg)return;const i=ri(n,e,t);Hh.has(i)||vs.length-Ro>=zP||(Hh.add(i),vs.push(i))}function ro(n,e,t){kn(n+1,e,t),kn(n-1,e,t),kn(n,e+1,t),kn(n,e-1,t),kn(n,e,t+1),kn(n,e,t-1)}function HP(){Ro<4096||Ro*2<vs.length||(vs.splice(0,Ro),Ro=0)}function qo(n,e){const t=Math.floor(n/we),i=Math.floor(e/we);dr.add(wi(n,e)),Math.floor((n+1)/we)!==t&&dr.add(wi(n+1,e)),Math.floor((n-1)/we)!==t&&dr.add(wi(n-1,e)),Math.floor((e+1)/we)!==i&&dr.add(wi(n,e+1)),Math.floor((e-1)/we)!==i&&dr.add(wi(n,e-1))}function Qa(n,e,t){return e>=Ru&&e<=Mg&&Pe(n,e,t)===Ol.AIR}function Dn(n,e,t){return ln.get(ri(n,e,t))||null}function Vh(n){return!!n&&(n.level===Yt||n.falling||n.source)}function dl(n,e,t){return e<=Ru||Pe(n,e-1,t)!==Ol.AIR?!0:Vh(Dn(n,e-1,t))}function yn(n,e=!1,t=!1,i=!1){return t?{level:Yt,falling:!1,source:!0,createdSource:i}:e?{level:Yt,falling:!0,source:!1,createdSource:!1}:{level:Be.clamp(Math.floor(n),1,bs),falling:!1,source:!1,createdSource:!1}}function __(n,e){return!!n==!!e&&(!n||n.level===e.level&&n.falling===e.falling&&n.source===e.source&&n.createdSource===e.createdSource)}function WP(n,e,t,i,r=!0){if(n=ui(n),e=ui(e),t=ui(t),e<Ru||e>Mg||!Qa(n,e,t))return!1;const o=ri(n,e,t),a=ln.get(o);if(a){const l={...i,createdSource:a.createdSource||i.createdSource};return __(a,l)?!1:(ln.set(o,{...a,...l}),kn(n,e,t),ro(n,e,t),qo(n,t),!0)}if(ln.size>=y_)return!1;ln.set(o,{...i});let s=yr.get(wi(n,t));return s||(s=new Set,yr.set(wi(n,t),s)),s.add(o),r&&(kn(n,e,t),ro(n,e,t)),qo(n,t),!0}function S_(n,e,t){const i=ri(ui(n),ui(e),ui(t));if(!ln.has(i))return!1;const[r,o,a]=ta(i);ln.delete(i);const s=yr.get(wi(r,a));return s&&(s.delete(i),s.size||yr.delete(wi(r,a))),kn(r,o,a),ro(r,o,a),qo(r,a),!0}function GP(n){if(!n?.userData?.isChunk||n.userData?.isDynamicWater)return null;if(n.userData.waterPhysicsChunkRegistered)return n.userData.waterPhysicsChunkKey||null;const e=n.geometry;if(!e||(e.boundingBox||e.computeBoundingBox(),!e.boundingBox))return null;const t=(e.boundingBox.min.x+e.boundingBox.max.x)*.5,i=(e.boundingBox.min.z+e.boundingBox.max.z)*.5,r=`${Math.floor(t/we)},${Math.floor(i/we)}`;return ja.set(r,(ja.get(r)||0)+1),n.userData.waterPhysicsChunkRegistered=!0,n.userData.waterPhysicsChunkKey=r,r}function VP(n){const e=yr.get(n);if(!e?.size)return;const t=[];for(const i of e){const[r,o,a]=ta(i),s=(r%we+we)%we,l=(a%we+we)%we;(s===0||s===we-1||l===0||l===we-1)&&t.push([r,o,a]),No.delete(i),ln.delete(i)}yr.delete(n),dr.delete(n);for(const[i,r,o]of t)ro(i,r,o)}function XP(n){if(!n)return;const e=(ja.get(n)||1)-1;e<=0?(ja.delete(n),VP(n)):ja.set(n,e)}function qP(n){const e=(No.get(n)||0)+1;return No.set(n,e),e}function $P(n){const e=(No.get(n)||0)-1;if(e>0){No.set(n,e);return}No.delete(n);const t=ln.get(n);if(!t||t.createdSource)return;t.source=!1,t.level===Yt&&!t.falling&&(t.level=1);const[i,r,o]=ta(n);kn(i,r,o),ro(i,r,o),qo(i,o)}function YP(n){if(!n||n.userData?.isDynamicWater||n.userData?.waterPhysicsRegistered||n.userData?.isWater!==!0&&!n.name?.toLowerCase().includes("water"))return;const e=n.geometry?.getAttribute("position");if(!e)return;n.userData.waterPhysicsRegistered=!0,n.visible=!1;const t=new Set;Wh.set(n,t);for(let i=0;i<e.count;i+=4){const r=Math.round(e.getX(i)+(n.position?.x||0)),o=Math.round(e.getY(i)+(n.position?.y||0)),a=Math.round(e.getZ(i)+(n.position?.z||0));if(!Number.isFinite(r)||!Number.isFinite(o)||!Number.isFinite(a))continue;const s=ri(r,o,a);if(t.has(s))continue;t.add(s),qP(s);const l=ln.get(s);l?(l.level=Yt,l.falling=!1,l.source=!0,kn(r,o,a),ro(r,o,a),qo(r,a)):WP(r,o,a,yn(Yt,!1,!0),!1)}}function KP(n){const e=Wh.get(n);if(e){for(const t of e)$P(t);Wh.delete(n)}}function Xh(n){!n||n.userData?.isDynamicWater||(GP(n),YP(n))}function Pb(n){!n||n.userData?.isDynamicWater||(n.userData?.waterPhysicsChunkRegistered&&(XP(n.userData.waterPhysicsChunkKey),delete n.userData.waterPhysicsChunkRegistered,delete n.userData.waterPhysicsChunkKey),KP(n))}function ZP(){if(Ib)return;Ib=!0;const n=Eo.prototype.add;Eo.prototype.add=function(...t){const i=n.apply(this,t);for(const r of t)r?.traverse?r.traverse(Xh):Xh(r);return i};const e=Eo.prototype.remove;Eo.prototype.remove=function(...t){const i=e.apply(this,t);for(const r of t)r?.traverse?r.traverse(Pb):Pb(r);return i}}function JP(){Fo&&Fo.traverse(Xh)}function Tg(n,e,t){return Qa(n,e,t)}function Gr(n){return n?n.source||n.falling||n.level===Yt?1:(bs+1-n.level)/(bs+1):0}function jP(n,e,t){const i=Dn(n,e,t);if(!i||i.falling)return{x:0,z:0};const r=Gr(i);let o=r-Gr(Dn(n+1,e,t));o-=r-Gr(Dn(n-1,e,t));let a=r-Gr(Dn(n,e,t+1));a-=r-Gr(Dn(n,e,t-1));const s=Math.hypot(o,a);return s<1e-4?{x:0,z:0}:{x:o/s,z:a/s}}function Vc(n,e,t,i,r,o){const a=i>0?[0,1]:[-1,0],s=r>0?[0,1]:[-1,0],l=[];for(const c of a)for(const d of s){const f=Dn(n+c,e,t+d);f&&l.push(Gr(f))}return l.length?l.reduce((c,d)=>c+d,0)/l.length:o}function QP(n,e,t,i,r){const o=`${n},${e},${t},${i},${r}`;if(za.has(o))return za.get(o);for(let a=0;a<=OP;a++){const s=n+i*a,l=t+r*a;if(!Tg(s,e,l))break;if(Qa(s,e-1,l))return za.set(o,a),a}return za.set(o,1/0),1/0}function Db(n,e,t){const i=[];for(const[o,a]of Lu){const s=n+o,l=t+a;Tg(s,e,l)&&i.push({x:s,z:l,dx:o,dz:a,dropDistance:QP(s,e,l,o,a)})}if(!i.length)return[];const r=Math.min(...i.map(o=>o.dropDistance));return Number.isFinite(r)?i.filter(o=>o.dropDistance===r):i}function eD(n,e,t){let i=0;for(const[r,o]of Lu)Dn(n+r,e,t+o)?.source&&i++;return i}function M_(n,e,t){return!Tg(n,e,t)||Dn(n,e,t)||!dl(n,e,t)?null:eD(n,e,t)>=2?yn(Yt,!1,!0,!0):null}function tD(n,e,t){let i=1/0;for(const[r,o]of Lu){const a=Dn(n+r,e,t+o);!a||a.falling||(i=Math.min(i,a.source?Yt:a.level))}return Number.isFinite(i)?i:null}function rp(n,e,t){const i=M_(n,e,t);if(i)return i;const r=tD(n,e,t);return r==null||r+1>bs?null:yn(r+1)}function nD(n,e,t,i){const r=ri(n,e,t),o=ln.get(r);if(!Qa(n,e,t)){pn(i,r,null);return}if(!o){if((No.get(r)||0)>0){pn(i,r,yn(Yt,!1,!0));return}const d=M_(n,e,t);if(d){pn(i,r,d);return}const f=rp(n,e,t);f&&pn(i,r,f);return}if(o.source){if(pn(i,r,yn(Yt,!1,!0,o.createdSource)),Qa(n,e-1,t)&&!Dn(n,e-1,t)){pn(i,ri(n,e-1,t),yn(Yt,!0));return}if(dl(n,e,t))for(const d of Db(n,e,t))pn(i,ri(d.x,e,d.z),yn(1));return}const a=Dn(n,e+1,t),s=Dn(n,e-1,t),l=Qa(n,e-1,t);if(o.falling){if(l&&!s){pn(i,r,yn(Yt,!0)),pn(i,ri(n,e-1,t),yn(Yt,!0));return}if(dl(n,e,t)){pn(i,r,a&&Vh(a)?yn(Yt):rp(n,e,t)||yn(1));return}pn(i,r,yn(Yt,!0));return}if(l&&!s){pn(i,r,yn(Yt,!0)),pn(i,ri(n,e-1,t),yn(Yt,!0));return}if(a&&Vh(a)&&!dl(n,e,t)){pn(i,r,yn(Yt,!0));return}const c=rp(n,e,t);if(!c){pn(i,r,null);return}if(pn(i,r,c),c.level<bs&&dl(n,e,t)){const d=c.level+1;for(const f of Db(n,e,t))pn(i,ri(f.x,e,f.z),yn(d))}}function Nb(n){return n?(n.source?100:n.falling?75:1)+bs-n.level:0}function pn(n,e,t){const i=n.get(e);(!i||Nb(t)>Nb(i))&&n.set(e,t)}function iD(n){for(const[e,t]of n){const[i,r,o]=ta(e),a=ln.get(e);if(!t){a&&S_(i,r,o);continue}const s={...t};if(a?.source?(s.source=!0,s.createdSource=a.createdSource,s.level=Yt,s.falling=!1):a?.createdSource&&(s.createdSource=!0),!__(a,s)){if(a)ln.set(e,{...a,...s});else{if(ln.size>=y_)continue;ln.set(e,s);let l=yr.get(wi(i,o));l||(l=new Set,yr.set(wi(i,o),l)),l.add(e)}kn(i,r,o),ro(i,r,o),qo(i,o)}}}function rD(){za.clear();const n=new Map;let e=0;for(;e<kP&&Ro<vs.length;){const t=vs[Ro++];Hh.delete(t);const[i,r,o]=ta(t);nD(i,r,o,n),e++}iD(n),HP()}function oD(n){const t=Math.cos(n),i=Math.sin(n);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([r,o])=>[.5+(r*t-o*i)*.34,.5+(r*i+o*t)*.34])}function Fb(n,e,t,i,r,o,a,s,l,c){for(const d of o)n.push(...d);for(let d=0;d<4;d++)e.push(...a),i.push(l,l,l);for(const d of s)t.push(...d);return r.push(c,c+1,c+2,c,c+2,c+3),c+4}function aD(n){if(!Fo||!ja.has(n))return;const e=yr.get(n),t=ip.get(n);if(t&&(Fo.remove(t),t.geometry.dispose(),ip.delete(n)),!e?.size)return;const i=[],r=[],o=[],a=[],s=[];let l=0;for(const f of e){const u=ln.get(f);if(!u)continue;const[p,m,b]=ta(f),g=Gr(u),h=m-.5,_=h+g;if(!Dn(p,m+1,b)){const S=jP(p,m,b);l=Fb(i,r,o,a,s,[[p-.5,h+Vc(p,m,b,-1,-1,g),b-.5],[p+.5,h+Vc(p,m,b,1,-1,g),b-.5],[p+.5,h+Vc(p,m,b,1,1,g),b+.5],[p-.5,h+Vc(p,m,b,-1,1,g),b+.5]],[0,1,0],oD(Math.atan2(S.z,S.x)),.96,l)}for(const[S,w]of Lu){const A=Dn(p+S,m,b+w),M=Gr(A);if(M>=g-1e-4)continue;const C=h+M;let v,T;S===1?(v=[[p+.5,h,b-.5],[p+.5,_,b-.5],[p+.5,C,b+.5],[p+.5,h,b+.5]],T=[1,0,0]):S===-1?(v=[[p-.5,h,b+.5],[p-.5,_,b+.5],[p-.5,C,b-.5],[p-.5,h,b-.5]],T=[-1,0,0]):w===1?(v=[[p+.5,h,b+.5],[p+.5,_,b+.5],[p-.5,C,b+.5],[p-.5,h,b+.5]],T=[0,0,1]):(v=[[p-.5,h,b-.5],[p-.5,_,b-.5],[p+.5,C,b-.5],[p+.5,h,b-.5]],T=[0,0,-1]),l=Fb(i,r,o,a,s,v,T,[[0,0],[0,Math.max(.15,g)],[1,Math.max(.15,g)],[1,0]],.84,l)}}if(!i.length)return;const c=new un;c.setAttribute("position",new Mt(i,3)),c.setAttribute("normal",new Mt(r,3)),c.setAttribute("uv",new Mt(o,2)),c.setAttribute("color",new Mt(a,3)),c.setIndex(s),c.computeBoundingBox(),c.computeBoundingSphere();const d=new Oe(c,w_);d.userData.isDynamicWater=!0,d.userData.waterChunk=n,d.frustumCulled=!0,ip.set(n,d),Fo.add(d)}function E_(n=BP){let e=0;for(const t of dr)if(dr.delete(t),aD(t),++e>=n)break}function T_(n){if(n){Fo=n,Eg=!0,Gh=performance.now(),ZP(),JP();for(const[e,t]of ln)t.source&&kn(...ta(e));for(;dr.size;)E_(64)}}function sD(n,e,t,i=Ol.AIR){Eg&&(n=ui(n),e=ui(e),t=ui(t),!(!Number.isFinite(n)||!Number.isFinite(e)||!Number.isFinite(t))&&(i!==Ol.AIR&&ln.has(ri(n,e,t))&&S_(n,e,t),za.clear(),kn(n,e,t),ro(n,e,t),qo(n,t)))}function lD(){if(!Eg||!Fo)return;const n=performance.now();n-Gh>=UP&&(Gh=n,rD()),E_()}if(typeof window<"u"){window.addEventListener("webminecraft:blockchange",e=>{const t=e.detail||{};!Number.isFinite(t.x)||!Number.isFinite(t.y)||!Number.isFinite(t.z)||sD(t.x,t.y,t.z,t.type??Ol.AIR)});const n=()=>{lD(),window.setTimeout(n,100)};window.setTimeout(n,100)}const cD="discussions",zd={bugs:{title:"Report Bugs",subtitle:"Tell us about a problem you found."},chat:{title:"Universal Chat",subtitle:"Chat with everyone playing WebMinecraftT."}},Ub=1e3,dD=40,uD=2880*60*1e3;let Xc=null,Jt=null,oi=null,Lo=null,Hd=null,ld=null,Ql="chat",Io=null,kb=null,Bb=!1;function Iu(n=15e3){return Xc||(Xc=new Promise(e=>{const t=Date.now(),i=()=>{try{const r=window.firebase;if(r&&typeof r.auth=="function"&&typeof r.firestore=="function"){const o=r.firestore();if(o&&typeof o.collection=="function"){e(r);return}}}catch{}if(Date.now()-t>=n){e(null);return}setTimeout(i,100)};i()}),Xc)}function Pu(n){try{return n?.firestore?.()}catch{return null}}function Ag(n,e){return Pu(n)?.collection(cD).doc(e).collection("messages")||null}function op(n){return String(n??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function fD(){if(document.getElementById("discussionStyles"))return;const n=document.createElement("style");n.id="discussionStyles",n.textContent=`
#discussionButton{position:fixed;left:28px;bottom:82px;width:118px;min-height:48px;z-index:97;border:2px solid #111;border-top-color:#888;border-left-color:#888;border-radius:3px;background:linear-gradient(#666,#4c4c4c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#discussionButton:hover{filter:brightness(1.1)}
body.webminecraft-in-world #discussionButton{display:none !important}
body.webminecraft-in-world #discussionModal{display:none !important}
#discussionModal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:260;padding:20px;box-sizing:border-box}
#discussionPanel{width:min(760px,96vw);height:min(700px,90vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#1a1a1a);border:2px solid #101010;border-top-color:#747474;border-left-color:#747474;box-shadow:8px 8px 0 rgba(0,0,0,.45);color:#fff;font-family:Arial,sans-serif;box-sizing:border-box}
#discussionHeader{display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:2px solid #0d0d0d;background:#323232}
#discussionTitle{margin:0;font-family:MinecraftFont,monospace;font-size:24px;text-shadow:2px 2px 0 #000}
#discussionClose{margin-left:auto;width:42px;height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#4c4c4c;color:#fff;font-size:20px;cursor:pointer}
#discussionTabs{display:grid;grid-template-columns:1fr 1fr;border-bottom:2px solid #0d0d0d;background:#242424}
.discussionTab{height:50px;border:0;border-right:1px solid #111;background:#333;color:#aaa;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer}
.discussionTab.active{background:#5c7b43;color:#fff;box-shadow:inset 0 -3px 0 #89aa69}
#discussionSubtitle{margin:12px 18px 4px;color:#aaa;font-size:12px}
#discussionWarning{margin:8px 18px 0;padding:9px 11px;background:#4a3920;border:1px solid #80652f;color:#f3dca5;font-size:11px;line-height:1.4}
#discussionMessages{flex:1;min-height:0;overflow:auto;padding:12px 18px 18px;display:flex;flex-direction:column;gap:9px}
.discussionMessage{padding:10px 12px;background:#222;border:1px solid #3f3f3f;border-radius:4px}
.discussionMessageHead{display:flex;align-items:center;gap:9px;margin-bottom:5px}
.discussionMessageName{font-weight:700;color:#b8dc95;word-break:break-word}
.discussionMessageTime{font-size:10px;color:#777;margin-left:auto;white-space:nowrap}
.discussionMessageText{font-size:13px;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#eee}
#discussionEmpty{text-align:center;color:#777;padding:50px 20px;font-size:13px}
#discussionComposer{padding:12px 18px;border-top:2px solid #0d0d0d;background:#292929}
#discussionInput{width:100%;min-height:78px;resize:none;padding:10px 12px;box-sizing:border-box;background:#111;color:#fff;border:2px solid #0a0a0a;border-top-color:#666;border-left-color:#666;outline:none;font:13px Arial,sans-serif}
#discussionInput:focus{border-color:#79a158}
#discussionComposerBottom{display:flex;align-items:center;gap:10px;margin-top:9px}
#discussionStatus{flex:1;min-height:18px;color:#999;font-size:11px}
#discussionSend{min-width:110px;min-height:40px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#6d8d4e,#526f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:12px;cursor:pointer;text-shadow:2px 2px 0 #222}
#discussionSend:disabled{opacity:.55;cursor:default}
@media(max-width:600px){#discussionButton{left:14px;bottom:82px;width:112px}#discussionPanel{height:94vh;width:98vw}#discussionTitle{font-size:19px}.discussionMessageTime{display:none}}
`,document.head.appendChild(n)}function A_(){if(Jt)return;fD();const n=document.createElement("button");n.id="discussionButton",n.type="button",n.textContent="Discussions",n.addEventListener("click",R_),document.body.appendChild(n),Jt=document.createElement("div"),Jt.id="discussionModal",Jt.innerHTML=`
<div id="discussionPanel" role="dialog" aria-modal="true" aria-labelledby="discussionTitle">
    <header id="discussionHeader"><h2 id="discussionTitle">Discussions</h2><button id="discussionClose" type="button" aria-label="Close">×</button></header>
    <div id="discussionTabs">
        <button class="discussionTab" data-channel="bugs" type="button">Report Bugs</button>
        <button class="discussionTab active" data-channel="chat" type="button">Universal Chat</button>
    </div>
    <div id="discussionSubtitle"></div>
    <div id="discussionWarning">⚠ Please be respectful. Do not post bad, hateful, threatening, or inappropriate content. Keep the chat friendly for everyone.</div>
    <div id="discussionMessages"><div id="discussionEmpty">Loading…</div></div>
    <div id="discussionComposer">
        <textarea id="discussionInput" maxlength="1000" placeholder="Write a message..."></textarea>
        <div id="discussionComposerBottom"><div id="discussionStatus"></div><button id="discussionSend" type="button">Send</button></div>
    </div>
</div>`,document.body.appendChild(Jt),oi=Jt.querySelector("#discussionMessages"),Lo=Jt.querySelector("#discussionInput"),Hd=Jt.querySelector("#discussionSend"),ld=Jt.querySelector("#discussionStatus"),Jt.querySelector("#discussionClose").addEventListener("click",Wd),Jt.addEventListener("click",e=>{e.target===Jt&&Wd()}),Jt.querySelectorAll(".discussionTab").forEach(e=>e.addEventListener("click",()=>gD(e.dataset.channel))),Hd.addEventListener("click",Ob),Lo.addEventListener("keydown",e=>{e.stopPropagation(),e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),Ob())}),Lo.addEventListener("keyup",e=>e.stopPropagation()),Lo.addEventListener("keypress",e=>e.stopPropagation())}function pD(n){return String(n?.displayName||n?.email?.split("@")[0]||"Player").trim().slice(0,dD)||"Player"}function bi(n,e=!1){ld&&(ld.textContent=n||"",ld.style.color=e?"#d99a9a":"#999")}function hD(n){const e=n.data()||{},t=document.createElement("article");t.className="discussionMessage";const i=e.createdAt?.toDate?.()||(e.createdAt?new Date(e.createdAt):null),r=i&&!Number.isNaN(i.getTime())?i:null,o=r?r.toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"";return t.innerHTML=`<div class="discussionMessageHead"><span class="discussionMessageName">${op(e.name||"Player")}</span><span class="discussionMessageTime">${op(o)}</span></div><div class="discussionMessageText">${op(e.text||"")}</div>`,t}function mD(n){if(oi){if(oi.innerHTML="",n.empty){oi.innerHTML=`<div id="discussionEmpty">${Ql==="bugs"?"No bug reports yet.":"No messages yet. Start the conversation!"}</div>`;return}n.docs.forEach(e=>oi.appendChild(hD(e))),oi.scrollTop=oi.scrollHeight}}async function C_(){if(Io&&(Io(),Io=null),!oi)return;oi.innerHTML='<div id="discussionEmpty">Loading…</div>';const n=await Iu();if(!n){oi.innerHTML='<div id="discussionEmpty">Could not connect to discussions.</div>',bi("Firebase is not ready.",!0);return}try{const e=Ag(n,Ql),t=Pu(n);if(!e||!t)throw new Error("Firestore is not available.");Io=e.where("expiresAt",">",new Date).orderBy("expiresAt","asc").onSnapshot(mD,i=>{console.error("Discussion load failed:",i),oi.innerHTML='<div id="discussionEmpty">Could not load discussions.</div>',bi("Could not load discussions. Check your Firebase rules.",!0)})}catch(e){console.error("Could not subscribe to discussions:",e),oi.innerHTML='<div id="discussionEmpty">Could not load discussions.</div>',bi("Could not load discussions.",!0)}}async function qh(){const n=await Iu();if(n)try{const e=Pu(n);if(!e)return;const t=new Date;for(const i of Object.keys(zd)){const r=Ag(n,i);if(!r)continue;const o=await r.where("expiresAt","<=",t).limit(50).get();if(o.empty)continue;const a=e.batch();o.docs.forEach(s=>a.delete(s.ref)),await a.commit()}}catch(e){console.warn("Discussion cleanup failed:",e)}}async function Ob(){const n=Lo?.value||"";if(!n.trim())return bi("Write a message first.",!0);if(n.length>Ub)return bi(`Messages are limited to ${Ub} characters.`,!0);const t=await Iu(),i=t?.auth?.()?.currentUser||null,r=Pu(t);if(!t||!i||!r){bi("You need to log in to post in Discussions.",!0);return}try{Hd.disabled=!0,bi("Sending...");const o=new Date,a=new Date(Date.now()+uD),s=Ag(t,Ql);if(!s)throw new Error("Firestore is not available.");await s.add({uid:i.uid,name:pD(i),text:n,createdAt:o,expiresAt:a}),Lo.value="",bi("Sent!")}catch(o){console.error("Discussion send failed:",o),bi(o?.message||"Could not send your message.",!0)}finally{Hd.disabled=!1}}function gD(n){zd[n]&&(Ql=n,Jt.querySelectorAll(".discussionTab").forEach(e=>e.classList.toggle("active",e.dataset.channel===n)),Jt.querySelector("#discussionSubtitle").textContent=zd[n].subtitle,Lo.placeholder=n==="bugs"?"Describe the bug and what happened...":"Write a message...",bi(""),C_())}async function R_(){if(A_(),!((await Iu())?.auth?.()?.currentUser||null)){Wd(),setTimeout(()=>alert("You need to log in to use Discussions."),0);return}Jt.style.display="flex",document.exitPointerLock?.(),Jt.querySelector("#discussionSubtitle").textContent=zd[Ql].subtitle,bi("Please keep the chat respectful."),await C_(),await qh()}function Wd(){Jt&&(Jt.style.display="none",Io&&(Io(),Io=null))}async function zb(){Bb||(Bb=!0,A_(),await qh(),clearInterval(kb),kb=setInterval(qh,600*1e3),window.webMinecraftDiscussion={open:R_,close:Wd})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",zb,{once:!0}):zb();const L_="webminecraft_welcome_seen_v1";function xD(){try{return localStorage.getItem(L_)!=="1"}catch{return!0}}function bD(){try{localStorage.setItem(L_,"1")}catch{}}function vD(){if(document.getElementById("welcomeStyles"))return;const n=document.createElement("style");n.id="welcomeStyles",n.textContent=`
#welcomeScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.7);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);z-index:500;font-family:Arial,sans-serif;color:#fff}
#welcomeCard{width:min(700px,94vw);max-height:min(620px,90vh);display:flex;flex-direction:column;background:linear-gradient(#292929,#1b1b1b);border:2px solid #101010;border-top-color:#777;border-left-color:#777;box-shadow:8px 8px 0 rgba(0,0,0,.58)}
#welcomeHeader{padding:24px 26px 16px;background:#303030;border-bottom:2px solid #111;text-align:center}
#welcomeTitle{margin:0 0 7px;font-family:MinecraftFont,monospace;font-size:30px;text-shadow:2px 2px 0 #000}
#welcomeSubtitle{margin:0;color:#aaa;font-size:12px;line-height:1.45}
#welcomeTabs{display:flex;gap:6px;padding:12px 16px;background:#222;border-bottom:2px solid #111;overflow-x:auto}
.welcomeTab{flex:1 1 0;min-width:110px;min-height:42px;padding:9px 12px;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#444;color:#eee;font-family:MinecraftFont,monospace;font-size:11px;text-shadow:2px 2px 0 #111;cursor:pointer;white-space:nowrap}
.welcomeTab:hover{background:#505050}.welcomeTab.active{background:linear-gradient(#6b6b6b,#525252)}
#welcomeContent{min-height:260px;overflow:auto;padding:24px 28px;background:#252525}
.welcomePage{display:none}.welcomePage.active{display:block}
.welcomePage h2{margin:0 0 12px;font-family:MinecraftFont,monospace;font-size:19px;text-shadow:2px 2px 0 #000}
.welcomePage p{margin:0 0 12px;color:#ccc;font-size:13px;line-height:1.55}
.welcomeInfo{margin:12px 0;padding:13px 15px;background:#303030;border:2px solid #111;border-top-color:#555;border-left-color:#555;color:#bbb;font-size:12px;line-height:1.55}
.welcomeInfo strong{color:#fff}.welcomeOkRow{padding:14px 18px;background:#202020;border-top:2px solid #111;display:flex;justify-content:flex-end}
#welcomeOk{min-width:150px;min-height:46px;padding:10px 18px;border:2px solid #111;border-top-color:#929292;border-left-color:#929292;background:linear-gradient(#718f52,#526f3c);color:#fff;font-family:MinecraftFont,monospace;font-size:14px;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#welcomeOk:hover{filter:brightness(1.1)}#welcomeOk:active{transform:translateY(2px);box-shadow:none}
#welcomeAccountStatus{margin-top:12px;padding:10px 12px;background:#1b1b1b;border:2px solid #101010;color:#aaa;font-size:12px}
#welcomeAccountButton{margin-top:10px;min-height:42px;padding:9px 14px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:#555;color:#fff;font-family:MinecraftFont,monospace;font-size:11px;cursor:pointer;text-shadow:2px 2px 0 #222}
@media(max-width:600px){#welcomeCard{max-height:92vh}#welcomeHeader{padding:20px 18px 14px}#welcomeTitle{font-size:24px}#welcomeContent{padding:20px}.welcomeTab{min-width:92px}.welcomeOkRow{padding:12px}#welcomeOk{width:100%}}
`,document.head.appendChild(n)}function yD(){if(document.getElementById("welcomeScreen"))return;vD();const n=document.createElement("div");n.id="welcomeScreen",n.setAttribute("aria-hidden","true"),n.innerHTML=`
<div id="welcomeCard" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
    <header id="welcomeHeader">
        <h1 id="welcomeTitle">Welcome to WebMinecraft</h1>
        <p id="welcomeSubtitle">A quick guide before you start playing.</p>
    </header>
    <nav id="welcomeTabs" aria-label="Welcome sections">
        <button class="welcomeTab active" data-page="welcome" type="button">Welcome</button>
        <button class="welcomeTab" data-page="setup" type="button">Setup</button>
        <button class="welcomeTab" data-page="account" type="button">Account</button>
        <button class="welcomeTab" data-page="gameplay" type="button">Gameplay</button>
    </nav>
    <main id="welcomeContent">
        <section class="welcomePage active" data-page-content="welcome">
            <h2>You're ready to play</h2>
            <p>WebMinecraft is a browser version of Minecraft-style survival and building. Your worlds are generated from seeds, so the same seed can recreate the same terrain.</p>
            <div class="welcomeInfo"><strong>Tip:</strong> Your first visit is being remembered on this browser so this welcome screen will not keep appearing.</div>
        </section>
        <section class="welcomePage" data-page-content="setup">
            <h2>Website setup</h2>
            <p>Use <strong>Singleplayer</strong> for your saved worlds. Use <strong>Mobile Mode</strong> on phones and tablets for touch controls.</p>
            <div class="welcomeInfo"><strong>World seeds:</strong> Create a world, copy its seed, and use that seed later to return to the same generated world.</div>
            <div class="welcomeInfo"><strong>Settings:</strong> Open Options to change graphics, shadows, brightness, and performance settings.</div>
        </section>
        <section class="welcomePage" data-page-content="account">
            <h2>Player account</h2>
            <p>A player account is needed for the saved-world system. Signing in lets WebMinecraft save your worlds to your account instead of only keeping them in the browser.</p>
            <div id="welcomeAccountStatus">Checking account status...</div>
            <button id="welcomeAccountButton" type="button">Open Account</button>
        </section>
        <section class="welcomePage" data-page-content="gameplay">
            <h2>Basic gameplay</h2>
            <p><strong>Move:</strong> WASD &nbsp; <strong>Look:</strong> Mouse &nbsp; <strong>Jump:</strong> Space &nbsp; <strong>Fly:</strong> F</p>
            <p>Break and place blocks, explore the generated terrain, and use your hotbar to switch blocks.</p>
            <div class="welcomeInfo"><strong>Remember:</strong> World changes are saved to the world you are playing, so switching to another world keeps its data separate.</div>
        </section>
    </main>
    <div class="welcomeOkRow"><button id="welcomeOk" type="button">OK</button></div>
</div>`,document.body.appendChild(n);const e=[...n.querySelectorAll(".welcomePage")],t=[...n.querySelectorAll(".welcomeTab")];function i(o){t.forEach(a=>a.classList.toggle("active",a.dataset.page===o)),e.forEach(a=>a.classList.toggle("active",a.dataset.pageContent===o)),o==="account"&&r()}t.forEach(o=>o.addEventListener("click",()=>i(o.dataset.page))),n.querySelector("#welcomeOk").addEventListener("click",()=>{bD(),n.style.display="none",n.setAttribute("aria-hidden","true")}),n.querySelector("#welcomeAccountButton").addEventListener("click",()=>{document.getElementById("accountButton")?.click()}),n.addEventListener("click",o=>{o.target});function r(){const o=n.querySelector("#welcomeAccountStatus");if(!o)return;const a=window.firebase?.auth?.().currentUser;a?(o.textContent=`Signed in as ${a.displayName||a.email||"Player"}.`,o.style.color="#8fca68"):(o.textContent="Not signed in yet. You can open Account and sign in before using saved worlds.",o.style.color="#c9b36a")}return{screen:n,updateAccountStatus:r}}function Hb(){const n=yD();!n||!xD()||(n.screen.style.display="flex",n.screen.setAttribute("aria-hidden","false"),n.updateAccountStatus())}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Hb,{once:!0}):Hb();const wD="https://webminecraft-server.onrender.com/health",_D="https://webminecraft-server.onrender.com/servers",SD=4e3;let ei=null,gi=null,$h=null,Wb=null,Ur=!1,Yh=localStorage.getItem("webminecraft-player-name")||"Player";function Gb(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}function MD(){const n=document.getElementById("mainMenu");return!!(n&&getComputedStyle(n).display!=="none")}function Cg(){if(ei)return;const n=document.createElement("style");n.id="globalPlayerListStyles",n.textContent=`
#globalPlayerCount{position:fixed;left:auto;right:28px;bottom:28px;z-index:96;display:none;width:176px;min-height:54px;padding:9px 14px;text-align:left;background:linear-gradient(180deg,#3f3f3f 0%,#292929 100%);border:2px solid #111;border-top-color:#8e8e8e;border-left-color:#8e8e8e;color:#fff;font-family:"MinecraftFont",monospace;cursor:pointer;text-shadow:2px 2px 0 #111;box-shadow:5px 5px 0 rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .12s,filter .12s}
#globalPlayerCount:hover{filter:brightness(1.12);transform:translateY(-2px)}
#globalPlayerCount:active{transform:translateY(1px);filter:brightness(.95)}
#globalPlayerCount strong{display:block;font-size:16px;line-height:1}
#globalPlayerCount span{display:block;margin-top:6px;color:#aaa;font:10px Arial,sans-serif}
#globalPlayerCount::before{content:"";display:inline-block;width:7px;height:7px;margin-right:7px;vertical-align:2px;background:#78bd52;box-shadow:0 0 7px rgba(120,189,82,.55)}
#globalPlayerPanel{position:fixed;left:auto;right:28px;bottom:92px;z-index:97;width:min(430px,calc(100vw - 40px));max-height:min(570px,calc(100vh - 116px));display:none;overflow:hidden;background:linear-gradient(180deg,#242424,#1b1b1b);color:#fff;border:2px solid #111;border-top-color:#888;border-left-color:#888;box-shadow:8px 8px 0 rgba(0,0,0,.5),0 12px 35px rgba(0,0,0,.28);font-family:Arial,sans-serif;animation:serverPanelIn .13s ease-out}
@keyframes serverPanelIn{from{opacity:0;transform:translateY(7px) scale(.985)}to{opacity:1;transform:none}}
#globalPlayerHeader{padding:15px 17px 13px;background:linear-gradient(180deg,#353535,#292929);border-bottom:2px solid #111;display:flex;align-items:center;justify-content:space-between;gap:12px}
#globalPlayerTitle{font:18px "MinecraftFont",monospace;text-shadow:2px 2px 0 #000;letter-spacing:.2px}
#globalPlayerSubtitle{margin-top:4px;color:#999;font-size:10px}
#globalPlayerTotal{flex:0 0 auto;padding:6px 9px;background:#202020;border:1px solid #4c4c4c;color:#9fce72;font-size:10px;font-weight:bold}
#globalPlayerList{overflow:auto;padding:11px;max-height:455px;scrollbar-width:thin;scrollbar-color:#555 #202020}
.globalServerGroup{position:relative;margin:0 0 10px;padding:0;overflow:hidden;background:#292929;border:1px solid #4b4b4b;box-shadow:0 2px 0 rgba(0,0,0,.22)}
.globalServerGroup:last-child{margin-bottom:0}
.globalServerHead{padding:11px 12px 9px;background:linear-gradient(180deg,#333,#2c2c2c);border-bottom:1px solid #454545}
.globalServerName{font-family:"MinecraftFont",monospace;font-size:13px;color:#eee;text-shadow:1px 1px 0 #000}
.globalServerMeta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;color:#999;font-size:10px}
.globalServerStatus{color:#80bd59;font-weight:bold}
.globalServerCapacity{height:4px;margin-top:8px;background:#1d1d1d;overflow:hidden}
.globalServerCapacityFill{height:100%;background:#78b954;min-width:3px;box-shadow:0 0 5px rgba(120,185,84,.25)}
.globalServerPlayers{padding:7px 8px 8px}
.globalPlayerRow{display:flex;align-items:center;gap:9px;padding:8px 9px;margin:3px 0;background:#343434;border:1px solid #484848;font-size:12px;transition:background .1s,border-color .1s}
.globalPlayerRow:hover{background:#3b3b3b;border-color:#5a5a5a}
.globalPlayerDot{width:8px;height:8px;flex:0 0 8px;background:#83b95f;box-shadow:0 0 5px rgba(131,185,95,.5)}
.globalPlayerName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ddd}
.globalPlayerMe{color:#a8d77b;font-weight:bold}
.globalPlayerEmpty{padding:25px 14px;color:#999;text-align:center;font-size:11px;line-height:1.5}
@media(max-width:600px){#globalPlayerCount{right:12px;bottom:40px;width:180px}#globalPlayerPanel{right:12px;bottom:105px;width:calc(100vw - 24px);max-height:calc(100vh - 125px)}#globalPlayerList{max-height:calc(100vh - 225px)}}
`,document.head.appendChild(n),ei=document.createElement("button"),ei.type="button",ei.id="globalPlayerCount",ei.innerHTML="<strong>0 Players</strong><span>View servers and players</span>",document.body.appendChild(ei),gi=document.createElement("div"),gi.id="globalPlayerPanel",gi.innerHTML='<div id="globalPlayerHeader"><div><div id="globalPlayerTitle">Servers</div><div id="globalPlayerSubtitle">Multiplayer worlds online</div></div><div id="globalPlayerTotal">0 online</div></div><div id="globalPlayerList"><div class="globalPlayerEmpty">No players are online.</div></div>',document.body.appendChild(gi),$h=gi.querySelector("#globalPlayerList"),ei.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),Ur=!Ur,gi.style.display=Ur?"block":"none"}),document.addEventListener("click",e=>{!Ur||e.target===ei||gi.contains(e.target)||(Ur=!1,gi.style.display="none")}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Ur&&(Ur=!1,gi.style.display="none")}),document.addEventListener("click",e=>{const t=e.target instanceof Element?e.target.closest("button"):null;if(!t||!window.__webminecraftMultiplayerActive)return;const i=String(t.textContent||"").replace(/\s+/g," ").trim().toLowerCase();!i.includes("main menu")||!i.includes("return")||window.setTimeout(()=>{window.__webminecraftMultiplayerActive&&window.location.reload()},0)},!0)}function ap(n){Cg();const e=Number(n?.totalPlayers)||0;ei.querySelector("strong").textContent=`${e} ${e===1?"Player":"Players"}`,ei.querySelector("span").textContent=e?"View servers and players":"No players online",gi.querySelector("#globalPlayerTotal").textContent=`${e} online`;const i=(Array.isArray(n?.rooms)?n.rooms:[]).filter(r=>Array.isArray(r.playerNames)&&r.playerNames.length>0);if(!i.length){$h.innerHTML='<div class="globalPlayerEmpty">No multiplayer players are online right now.</div>';return}$h.innerHTML=i.map(r=>{const o=r.name||r.id||"World",a=Number(r.players)||r.playerNames.length,s=Number(r.maxPlayers)||10,l=Math.max(3,Math.min(100,a/s*100)),c=r.playerNames.map(d=>{const f=String(d).toLowerCase()===String(Yh).toLowerCase();return`<div class="globalPlayerRow"><span class="globalPlayerDot"></span><span class="globalPlayerName${f?" globalPlayerMe":""}">${Gb(d)}${f?" (You)":""}</span></div>`}).join("");return`<div class="globalServerGroup"><div class="globalServerHead"><div class="globalServerName">${Gb(o)}</div><div class="globalServerMeta"><span class="globalServerStatus">● Online</span><span>${a}/${s} players</span></div><div class="globalServerCapacity"><div class="globalServerCapacityFill" style="width:${l}%"></div></div></div><div class="globalServerPlayers">${c}</div></div>`}).join("")}async function ED(){if(Cg(),!MD()){ei.style.display="none",gi.style.display="none",Ur=!1;return}ei.style.display="block",Yh=localStorage.getItem("webminecraft-player-name")||Yh||"Player";try{const e=await fetch(_D,{cache:"no-store"});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json(),i=(t.servers||[]).flatMap(r=>(r.rooms||[]).map(o=>({...o,serverName:r.name})));ap({totalPlayers:Number(t.servers?.reduce?.((r,o)=>r+(Number(o.players)||0),0))||0,rooms:i})}catch{try{const t=await(await fetch(wD,{cache:"no-store"})).json();ap({totalPlayers:Number(t.players)||0,rooms:[]})}catch{ap({totalPlayers:0,rooms:[]})}}}function I_(){ED(),clearTimeout(Wb),Wb=setTimeout(I_,SD)}Cg();I_();const P_="webminecraft-known-world-seeds",TD=4e3;let Vb=!1,Kh=new Set,sp=!1,Xb=!1;function AD(){try{return window.firebase?.auth?.()?.currentUser||null}catch{return null}}function CD(){try{return window.firebase?.firestore?.()||null}catch{return null}}function Gd(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function D_(){try{const n=JSON.parse(localStorage.getItem(P_)||"[]");return new Set(Array.isArray(n)?n.map(Gd).filter(e=>e!==null):[])}catch{return new Set}}function Vd(n){try{localStorage.setItem(P_,JSON.stringify([...n]))}catch{}}async function qb(){const n=window.webMinecraftWorldStorage;if(!n)return new Set;if(typeof n.getLocalSeeds=="function"){const e=await n.getLocalSeeds();return new Set([...e].map(Gd).filter(t=>t!==null))}if(typeof window.webMinecraftBrowserWorldStorage?.getAllWorlds=="function"){const e=await window.webMinecraftBrowserWorldStorage.getAllWorlds();return new Set(e.map(t=>Gd(t?.seed)).filter(t=>t!==null))}return new Set}async function RD(n){const e=window.webMinecraftWorldStorage;if(e?.deleteLocalWorld){await e.deleteLocalWorld(n);return}window.webMinecraftBrowserWorldStorage?.deleteWorld&&await window.webMinecraftBrowserWorldStorage.deleteWorld(n)}function N_(n,e){return n.collection("users").doc(e).collection("deletedWorlds")}async function LD(n,e,t){const i=D_(),r=[...i].filter(l=>!t.has(l));if(!r.length)return;const o=n.batch(),a=N_(n,e),s=Date.now();for(const l of r)o.set(a.doc(String(l)),{seed:l,deletedAt:s});await o.commit();for(const l of r)i.delete(l);Vd(i)}async function ID(n,e,t){const i=await N_(n,e).get();if(i.empty)return t;let r=!1;const o=new Set(t);for(const a of i.docs){const s=Gd(a.data()?.seed??a.id);s===null||!o.has(s)||(await RD(s),o.delete(s),r=!0)}return r&&(Kh=o,Vd(o),window.dispatchEvent(new CustomEvent("webminecraft-worlds-changed"))),o}async function lp(){if(sp)return;const n=AD(),e=CD();if(!(!n||!e)){sp=!0;try{const t=await qb();if(!D_().size&&t.size)Vd(t);else{await ID(e,n.uid,t);const r=await qb();await LD(e,n.uid,r),Vd(r),Kh=r;return}Kh=t}catch{Xb||(Xb=!0,console.warn("World sync temporarily unavailable; worlds remain stored locally."))}finally{sp=!1}}}function $b(){if(Vb)return;Vb=!0;const n=()=>lp();window.webMinecraftWorldStorage?n():window.setTimeout(n,250),window.setInterval(lp,TD),window.addEventListener("webminecraft-worlds-changed",lp)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$b,{once:!0}):$b();function Yb(n,e,t,i,r=null){if(document.getElementById(e))return;const o=document.createElement("button");o.id=e,o.className="touchControl flightVerticalButton",o.type="button",o.textContent=t,o.setAttribute("aria-label",t);const a=l=>{l.preventDefault(),l.stopPropagation(),o.setPointerCapture?.(l.pointerId),r?ot[r]=!0:Le[i]=!0,o.classList.add("pressed")},s=()=>{r?ot[r]=!1:Le[i]=!1,o.classList.remove("pressed")};o.addEventListener("pointerdown",a),o.addEventListener("pointerup",s),o.addEventListener("pointercancel",s),o.addEventListener("lostpointercapture",s),n.appendChild(o)}function Kb(){const n=document.getElementById("touchActions");if(!n)return;Yb(n,"touchFlyUp","UP","jump"),Yb(n,"touchFlyDown","DOWN","flyDown","ControlLeft");const e=document.createElement("style");e.id="mobileFlightControlsStyles",e.textContent=`
#touchFlyUp,#touchFlyDown{display:none}
body.mobile-mode #touchFlyUp,body.mobile-mode #touchFlyDown{display:none}
body.mobile-mode #touchFlyUp.flightVisible,body.mobile-mode #touchFlyDown.flightVisible{display:block}
#touchFlyUp{left:0;top:0}
#touchFlyDown{left:0;top:58px}
`,document.head.appendChild(e);const t=()=>{const i=document.body.classList.contains("mobile-mode")&&Jr;document.getElementById("touchFlyUp")?.classList.toggle("flightVisible",i),document.getElementById("touchFlyDown")?.classList.toggle("flightVisible",i),i||(Le.jump=!1,ot.ControlLeft=!1)};t(),setInterval(t,50)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Kb,{once:!0}):Kb();const Zb="webMinecraftFriendsStyles",Xd="friendsModal",PD="12.18.0";let qc=null,tt=null,Qt=null,Jb=!1,zl=null,qd=null,Hl=null,$d=null,Yd=null,Kd=null,jb=null;function Du(){return qc||(qc=new Promise(n=>{const e=Date.now(),t=()=>{if(window.firebase?.auth&&window.firebase?.database){try{Qt=window.firebase.database(),n(!0)}catch(i){console.warn("Could not initialize Realtime Database:",i),n(!1)}return}if(window.firebase?.auth&&!window.firebase?.database&&!document.querySelector('script[src*="firebase-database-compat"]')){const i=document.createElement("script");i.src=`https://www.gstatic.com/firebasejs/${PD}/firebase-database-compat.js`,i.async=!0,i.onload=()=>{try{Qt=window.firebase.database(),n(!0)}catch(r){console.warn("Could not initialize Realtime Database:",r),n(!1)}},i.onerror=()=>n(!1),document.head.appendChild(i);return}if(Date.now()-e>1e4){n(!1);return}setTimeout(t,80)};t()}),qc)}function DD(){try{return window.firebase?.auth?.().currentUser||null}catch{return null}}function ND(n){let e=2166136261;for(const o of String(n))e^=o.charCodeAt(0),e=Math.imul(e,16777619);let t=e>>>0;const i="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let r="";for(let o=0;o<8;o++)t=Math.imul(t^t>>>13,1274126177)+1013904223>>>0,r+=i[t%i.length];return`${r.slice(0,4)}-${r.slice(4)}`}function _i(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;")}function FD(){if(document.getElementById(Zb))return;const n=document.createElement("style");n.id=Zb,n.textContent=`
#friendsButton{position:fixed !important;left:158px !important;bottom:28px !important;width:126px !important;height:48px !important;margin:0 !important;z-index:98 !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;padding:0 14px !important;border:2px solid #111 !important;border-top-color:#9a9a9a !important;border-left-color:#9a9a9a !important;border-radius:5px !important;background:linear-gradient(#5f7fa0,#3d5873) !important;color:#fff !important;font:bold 13px Arial,sans-serif !important;letter-spacing:.2px !important;cursor:pointer !important;text-shadow:2px 2px 0 #18212a !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.13),inset -2px -3px 0 rgba(0,0,0,.32),0 4px 0 #151515 !important;transition:transform .08s ease,filter .08s ease !important}
#friendsButton::before{content:"♟";font-size:17px;line-height:1;transform:rotate(180deg);display:inline-block;opacity:.95}
#friendsButton:hover{filter:brightness(1.12) !important;transform:translateY(-1px) !important}
#friendsButton:active{transform:translateY(2px) !important;box-shadow:inset 2px 2px 0 rgba(0,0,0,.25),inset -2px -2px 0 rgba(255,255,255,.06),0 1px 0 #171717 !important}
#friendsButton.friendAlert{animation:friendsButtonPulse .8s steps(2,end) infinite !important}
#friendsButton .friendsBadge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;border:2px solid #111;border-radius:2px;background:#b83d3d;color:#fff;font:bold 10px Arial,sans-serif;box-shadow:1px 1px 0 #000;text-shadow:none}
@keyframes friendsButtonPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
#accountUser #friendCodeBox,#accountUser .friendSection{display:none !important}
#friendsModal{position:fixed;inset:0;z-index:450;display:none;background:rgba(8,10,12,.94);font-family:Arial,sans-serif;color:#fff;overflow:auto}
#friendsModal.open{display:block}
#friendsPage{min-height:100%;box-sizing:border-box;padding:32px 38px 46px;background:radial-gradient(circle at 50% 0%,rgba(91,127,80,.16),transparent 42%),linear-gradient(rgba(0,0,0,.07),rgba(0,0,0,.2))}
#friendsTop{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1220px;margin:0 auto 24px}
#friendsHeading{margin:0;font-family:MinecraftFont,monospace;font-size:34px;text-shadow:3px 3px 0 #000;letter-spacing:.5px}
#friendsSubheading{margin:6px 0 0;color:#aaa;font-size:12px}
#friendsClose{min-width:110px;height:44px;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#676767,#474747);color:#fff;font:bold 13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-shadow:0 3px 0 #111}
#friendsClose:hover{filter:brightness(1.12)}
#friendsGrid{max-width:1220px;margin:0 auto;display:grid;grid-template-columns:minmax(270px,340px) minmax(0,1fr);gap:20px}
.friendsCard{background:linear-gradient(#292929,#191919);border:2px solid #101010;border-top-color:#757575;border-left-color:#757575;box-shadow:6px 6px 0 rgba(0,0,0,.45);padding:21px}
.friendsCard h3{margin:0 0 13px;font:16px MinecraftFont,monospace;text-shadow:2px 2px 0 #000}
#friendsCodeCard{text-align:center}
#friendsCodeLabel{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px}
#friendsCodeValue{margin:10px 0 16px;padding:14px 8px;background:#101010;border:1px solid #505050;color:#b7df8b;font:bold 26px MinecraftFont,monospace;letter-spacing:3px;text-shadow:2px 2px 0 #000}
.friendsAction{width:100%;min-height:43px;padding:9px 12px;margin:8px 0;border:2px solid #111;border-top-color:#999;border-left-color:#999;background:linear-gradient(#6e8f50,#526f3c);color:#fff;font:13px MinecraftFont,monospace;cursor:pointer;text-shadow:2px 2px 0 #222;box-sizing:border-box}
.friendsAction:hover{filter:brightness(1.1)}
.friendsInput{width:100%;height:44px;box-sizing:border-box;padding:0 12px;background:#101010;color:#fff;border:2px solid #070707;border-top-color:#737373;border-left-color:#737373;outline:none;margin-bottom:4px}
.friendsInput:focus{border-color:#88b363;box-shadow:0 0 0 2px rgba(136,179,99,.16)}
#friendsStatus{min-height:20px;margin:8px 0 0;color:#aaa;font-size:12px;line-height:1.4;text-align:center}
#friendsSections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.friendsList{min-height:120px}
.friendSectionLabel{padding:8px 2px 4px;color:#aaa;font:11px MinecraftFont,monospace;text-transform:uppercase;letter-spacing:.7px}
.friendFullRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;margin:7px 0;background:#303030;border:1px solid #4d4d4d}
.friendFullName{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.friendFullMeta{font-size:10px;color:#999;margin-top:3px}.friendFullActions{display:flex;gap:6px;flex:0 0 auto}.friendSmallAction{min-height:32px;padding:5px 10px;background:#4d4d4d;border:1px solid #777;color:#fff;cursor:pointer}.friendSmallAction.accept{background:#5e8242}.friendSmallAction.decline,.friendSmallAction.unfriend{background:#6a3f3f}.friendSmallAction:disabled{opacity:.55;cursor:default}.friendEmpty{padding:16px;color:#888;background:#181818;border:1px solid #333;font-size:12px;text-align:center}
@media(max-width:850px){#friendsPage{padding:18px 14px 30px}#friendsGrid{grid-template-columns:1fr}#friendsSections{grid-template-columns:1fr}#friendsTop{align-items:flex-start}.friendsCard{padding:17px}}
@media(max-width:560px){#friendsButton{left:calc(50vw + 6px) !important;bottom:18px !important;width:calc(50vw - 18px) !important;height:46px !important}.friendsBadge{min-width:17px !important;height:17px !important}}
`,document.head.appendChild(n)}function UD(){if(document.getElementById(Xd))return;const n=document.createElement("div");n.id=Xd,n.innerHTML=`
<div id="friendsPage">
  <div id="friendsTop"><div><h1 id="friendsHeading">Friends</h1><p id="friendsSubheading">Add people, manage requests, and see who is on your friends list.</p></div><button id="friendsClose" type="button">Close</button></div>
  <div id="friendsGrid">
    <div>
      <div class="friendsCard" id="friendsCodeCard"><h3>Your Friend Code</h3><div id="friendsCodeLabel">Share this code with someone</div><div id="friendsCodeValue">--------</div><button class="friendsAction" id="friendsCopy" type="button">Copy Friend Code</button></div>
      <div class="friendsCard" style="margin-top:20px"><h3>Add a Friend</h3><input id="friendsCodeInput" class="friendsInput" maxlength="9" autocomplete="off" placeholder="Enter friend code"><button class="friendsAction" id="friendsAdd" type="button">Send Friend Request</button><div id="friendsStatus"></div></div>
    </div>
    <div id="friendsSections">
      <div class="friendsCard"><h3>Friend Requests</h3><div id="friendsRequests" class="friendsList"><div class="friendEmpty">Sign in to see requests.</div></div></div>
      <div class="friendsCard"><h3>Your Friends</h3><div id="friendsList" class="friendsList"><div class="friendEmpty">Sign in to see friends.</div></div></div>
    </div>
  </div>
</div>`,document.body.appendChild(n),n.addEventListener("click",e=>{(e.target===n||e.target.id==="friendsPage")&&Qb()}),n.querySelector("#friendsClose").addEventListener("click",Qb),n.querySelector("#friendsCopy").addEventListener("click",BD),n.querySelector("#friendsAdd").addEventListener("click",ev),n.querySelector("#friendsCodeInput").addEventListener("input",e=>{e.target.value=e.target.value.replace(/\s+/g,"").toUpperCase().slice(0,9)}),n.querySelector("#friendsCodeInput").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),ev())})}function F_(){return document.getElementById("friendsButton")}function ys(){return tt?.uid?ND(tt.uid):""}function hn(n,e=""){const t=document.getElementById("friendsStatus");t&&(t.textContent=n||"",t.style.color=e==="error"?"#ff8b8b":e==="success"?"#9dcc76":"#aaa")}function U_(n=0){const e=F_();if(!e)return;const t=Math.max(0,Number(n)||0);if(e.classList.toggle("friendAlert",t>0),e.querySelector(".friendsBadge")?.remove(),!t)return;const i=document.createElement("span");i.className="friendsBadge",i.textContent=t>99?"99+":String(t),e.appendChild(i)}function Qb(){document.getElementById(Xd)?.classList.remove("open")}async function kD(){const n=document.getElementById(Xd);if(n){if(n.classList.add("open"),await Du(),tt=DD(),k_(),!tt){hn("Sign in to add and manage friends.","error"),B_();return}(!zl||!Hl)&&H_(),await O_()}}function k_(){const n=document.getElementById("friendsCodeValue");n&&(n.textContent=ys()||"--------")}function B_(){document.getElementById("friendsCodeValue")?.replaceChildren(document.createTextNode("--------"));const n=document.getElementById("friendsRequests"),e=document.getElementById("friendsList");n&&(n.innerHTML='<div class="friendEmpty">Sign in to see requests.</div>'),e&&(e.innerHTML='<div class="friendEmpty">Sign in to see friends.</div>'),U_(0)}async function O_(){!Qt||!tt||await Qt.ref(`publicProfiles/${tt.uid}`).update({uid:tt.uid,displayName:tt.displayName||"Player",friendCode:ys(),updatedAt:window.firebase.database.ServerValue.TIMESTAMP})}async function BD(){const n=ys();if(!n)return hn("Sign in to get a friend code.","error");try{await navigator.clipboard.writeText(n),hn("Friend code copied!","success")}catch{hn("Could not copy the friend code.","error")}}async function ev(){if(!await Du()||!tt){hn("Sign in to add friends.","error");return}const n=document.getElementById("friendsCodeInput"),e=document.getElementById("friendsAdd");if(!n||!e)return;const t=n.value.replace(/\s+/g,"").toUpperCase();if(!t){hn("Enter a friend code.","error");return}if(t===ys()){hn("You cannot add yourself.","error");return}e.disabled=!0,e.textContent="Sending…",hn("Looking up player…");try{const i=await Qt.ref("publicProfiles").orderByChild("friendCode").equalTo(t).limitToFirst(1).once("value");let r=null;if(i.forEach(u=>(r=u.val(),!0)),!r?.uid||r.uid===tt.uid){hn("No account was found with that friend code.","error");return}const o=`${tt.uid}_${r.uid}`,a={incoming:`friendRequests/${r.uid}/${o}`,sent:`sentFriendRequests/${tt.uid}/${o}`,mineFriend:`friends/${tt.uid}/${r.uid}`},[s,l,c]=await Promise.all([Qt.ref(a.incoming).once("value"),Qt.ref(a.sent).once("value"),Qt.ref(a.mineFriend).once("value")]);if(c.exists()){hn("You are already friends.","error");return}if(s.exists()||l.exists()){hn("A request is already pending.","error");return}const d={requestId:o,fromUid:tt.uid,toUid:r.uid,fromName:tt.displayName||"Player",toName:r.displayName||"Player",fromCode:ys(),toCode:r.friendCode||t,status:"pending",createdAt:window.firebase.database.ServerValue.TIMESTAMP,updatedAt:window.firebase.database.ServerValue.TIMESTAMP},f={};f[a.incoming]=d,f[a.sent]=d,await Qt.ref().update(f),n.value="",hn(`Friend request sent to ${r.displayName||"Player"}.`,"success")}catch(i){console.warn("RTDB friend request failed:",i),hn(i?.code==="PERMISSION_DENIED"?"Friend request blocked by Realtime Database rules.":"Could not send the friend request.","error")}finally{e.disabled=!1,e.textContent="Send Friend Request"}}async function OD(n,e){if(!Qt||!tt||!n)return;const t=document.querySelector(`[data-request-action="${_i(n)}"]`);t&&(t.disabled=!0);try{const o=(await Qt.ref(`friendRequests/${tt.uid}/${n}`).once("value")).val();if(!o?.fromUid)return;const a={};a[`friendRequests/${tt.uid}/${n}`]=null,a[`sentFriendRequests/${o.fromUid}/${n}`]=null,e&&(a[`friends/${tt.uid}/${o.fromUid}`]={uid:o.fromUid,name:o.fromName||"Player",friendCode:o.fromCode||""},a[`friends/${o.fromUid}/${tt.uid}`]={uid:tt.uid,name:tt.displayName||"Player",friendCode:ys()}),await Qt.ref().update(a),hn(e?`You are now friends with ${o.fromName||"Player"}!`:"Friend request declined.",e?"success":"")}catch(i){console.warn("RTDB friend response failed:",i),hn(i?.code==="PERMISSION_DENIED"?"Friend request update blocked by Realtime Database rules.":"Could not update that friend request.","error")}}async function zD(n){if(!Qt||!tt||!n||n===tt.uid)return;const e=document.querySelector(`[data-unfriend="${_i(n)}"]`);e&&(e.disabled=!0,e.textContent="Removing…");try{const t={};t[`friends/${tt.uid}/${n}`]=null,t[`friends/${n}/${tt.uid}`]=null,await Qt.ref().update(t),hn("Friend removed.","success")}catch(t){console.warn("RTDB unfriend failed:",t),hn(t?.code==="PERMISSION_DENIED"?"Unfriend blocked by Realtime Database rules.":"Could not remove that friend.","error")}}function Zh(n){const e=[];return n.forEach(t=>{const i=t.val()||{};e.push({id:t.key,...i})}),e}function HD(n){const e=n.filter(t=>t.status==="pending");return e.sort((t,i)=>Number(t.createdAt||0)-Number(i.createdAt||0)),e.map(t=>`
        <div class="friendFullRow">
            <div style="min-width:0">
                <div class="friendFullName">${_i(t.fromName||"Player")}</div>
                <div class="friendFullMeta">Incoming friend request</div>
            </div>
            <div class="friendFullActions">
                <button class="friendSmallAction accept" type="button" data-request-action="${_i(t.id)}" data-action-accept="${_i(t.id)}">Accept</button>
                <button class="friendSmallAction decline" type="button" data-request-action="${_i(t.id)}" data-action-decline="${_i(t.id)}">Decline</button>
            </div>
        </div>`).join("")}function WD(n){const e=n.filter(t=>t.status==="pending");return e.sort((t,i)=>Number(t.createdAt||0)-Number(i.createdAt||0)),e.map(t=>`
        <div class="friendFullRow">
            <div style="min-width:0">
                <div class="friendFullName">${_i(t.toName||"Player")}</div>
                <div class="friendFullMeta">Pending request</div>
            </div>
            <div class="friendFullActions"><span style="padding:8px 6px;color:#aaa;font-size:11px">Pending…</span></div>
        </div>`).join("")}function GD(n,e){const t=document.getElementById("friendsRequests");if(!t)return;const i=Zh(n),r=Zh(e),o=i.filter(c=>c.status==="pending");r.filter(c=>c.status==="pending"),U_(o.length);const a=HD(i),s=WD(r),l=[];a&&l.push(`<div class="friendSectionLabel">Incoming</div>${a}`),s&&l.push(`<div class="friendSectionLabel">Sent</div>${s}`),t.innerHTML=l.length?l.join(""):'<div class="friendEmpty">No pending requests.</div>'}function VD(n){const e=document.getElementById("friendsList");if(!e)return;const t=Zh(n);t.sort((i,r)=>String(i.name||"Player").localeCompare(String(r.name||"Player"))),e.innerHTML=t.length?t.map(i=>`
            <div class="friendFullRow">
                <div style="min-width:0">
                    <div class="friendFullName">${_i(i.name||"Player")}</div>
                    <div class="friendFullMeta">Friend${i.friendCode?` • ${_i(i.friendCode)}`:""}</div>
                </div>
                <div class="friendFullActions">
                    <button class="friendSmallAction unfriend" type="button" data-unfriend="${_i(i.id)}">Unfriend</button>
                </div>
            </div>`).join(""):'<div class="friendEmpty">No friends yet.</div>'}function z_(){try{zl?.off("value",$d)}catch{}try{qd?.off("value",Yd)}catch{}try{Hl?.off("value",Kd)}catch{}zl=null,qd=null,Hl=null,$d=null,Yd=null,Kd=null}function H_(){if(z_(),!Qt||!tt)return;zl=Qt.ref(`friendRequests/${tt.uid}`),qd=Qt.ref(`sentFriendRequests/${tt.uid}`),Hl=Qt.ref(`friends/${tt.uid}`);let n=null,e=null;const t=()=>{!n||!e||GD(n,e)};$d=i=>{n=i,t()},Yd=i=>{e=i,t()},Kd=i=>VD(i),zl.on("value",$d,i=>console.warn("Live incoming friend requests failed:",i)),qd.on("value",Yd,i=>console.warn("Live outgoing friend requests failed:",i)),Hl.on("value",Kd,i=>console.warn("Live friends list failed:",i))}function tv(){const n=document.getElementById("friendsRequests");n&&n.dataset.liveControlsAttached!=="1"&&(n.dataset.liveControlsAttached="1",n.addEventListener("click",t=>{const i=t.target.closest("[data-action-accept]"),r=t.target.closest("[data-action-decline]");if(!i&&!r)return;t.preventDefault(),t.stopPropagation();const o=(i||r).dataset.actionAccept||(i||r).dataset.actionDecline;OD(o,!!i)}));const e=document.getElementById("friendsList");e&&e.dataset.liveControlsAttached!=="1"&&(e.dataset.liveControlsAttached="1",e.addEventListener("click",t=>{const i=t.target.closest("[data-unfriend]");i&&(t.preventDefault(),t.stopPropagation(),zD(i.dataset.unfriend))}))}function nv(){const n=F_();!n||n.dataset.friendsLiveAttached==="1"||(n.dataset.friendsLiveAttached="1",n.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),kD()}))}function iv(){jb||!window.firebase?.auth||(jb=window.firebase.auth().onAuthStateChanged(async n=>{if(z_(),tt=n||null,k_(),!tt){B_();return}if(!(!await Du()||!Qt)){try{await O_()}catch(e){console.warn("Could not sync public friend profile:",e)}H_()}}))}async function rv(){if(Jb)return;if(Jb=!0,FD(),UD(),nv(),tv(),new MutationObserver(()=>{nv(),tv()}).observe(document.body,{childList:!0,subtree:!0}),await Du())iv();else{const e=Date.now(),t=()=>{if(window.firebase?.auth){iv();return}Date.now()-e<15e3&&setTimeout(t,100)};t()}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",rv,{once:!0}):rv();const XD="webminecraft-local-worlds",ws="worlds",qD="webminecraft_saved_worlds";function $D(){if(document.getElementById("webMinecraftGameplayLayoutFixes"))return;const n=document.createElement("style");n.id="webMinecraftGameplayLayoutFixes",n.textContent=`
body.mobile-mode.webminecraft-in-world #settingsButton{top:18px !important;right:18px !important;z-index:90 !important}
body.mobile-mode.webminecraft-in-world #touchChatButton{top:76px !important;right:18px !important;bottom:auto !important;z-index:91 !important}
body.mobile-mode.webminecraft-in-world #touchActions{right:18px !important;bottom:24px !important;z-index:43 !important}
body.mobile-mode.webminecraft-in-world #touchMovePad{left:18px !important;bottom:24px !important;z-index:43 !important}
body.mobile-mode.webminecraft-in-world #touchLookArea{left:34% !important;right:0 !important;top:0 !important;bottom:0 !important}
body.mobile-mode.webminecraft-in-world #hotbar{bottom:18px !important;z-index:12 !important}
body.mobile-mode.webminecraft-in-world #crosshair{z-index:10 !important}
@media(max-width:700px){
body.mobile-mode.webminecraft-in-world #hotbar{transform:translateX(-50%) scale(.88);transform-origin:center bottom}
body.mobile-mode.webminecraft-in-world #touchActions{transform:scale(.9);transform-origin:right bottom}
body.mobile-mode.webminecraft-in-world #touchMovePad{transform:scale(.9);transform-origin:left bottom}
}
#savedWorldDeleteAll{background:linear-gradient(#8d5353,#6e4040) !important}
@media(max-width:700px){#savedWorldDeleteAll{width:100%}}
.savedWorldCardDelete{background:linear-gradient(#8d5353,#6e4040) !important}
`,document.head.appendChild(n)}function W_(){return new Promise((n,e)=>{const t=indexedDB.open(XD,1);t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error||new Error("Could not open world storage.")),t.onupgradeneeded=()=>{const i=t.result;i.objectStoreNames.contains(ws)||i.createObjectStore(ws,{keyPath:"seed"})}})}function YD(n){return W_().then(e=>new Promise((t,i)=>{const r=e.transaction(ws,"readwrite");r.objectStore(ws).delete(Number(n)>>>0),r.oncomplete=t,r.onerror=()=>i(r.error||new Error("Could not delete world.")),r.onabort=()=>i(r.error||new Error("Could not delete world."))}))}function KD(){return W_().then(n=>new Promise((e,t)=>{const i=n.transaction(ws,"readwrite");i.objectStore(ws).clear(),i.oncomplete=e,i.onerror=()=>t(i.error||new Error("Could not delete saved worlds.")),i.onabort=()=>t(i.error||new Error("Could not delete saved worlds."))})).then(()=>{try{localStorage.removeItem(qD)}catch{}})}function ov(){const n=document.getElementById("savedWorldsHeader");if(!n||document.getElementById("savedWorldDeleteAll"))return;const e=document.getElementById("savedWorldBack"),t=document.createElement("button");t.id="savedWorldDeleteAll",t.className="savedWorldButton",t.type="button",t.textContent="Delete All",t.title="Delete every saved world from this browser",t.addEventListener("click",async i=>{i.preventDefault(),i.stopPropagation();const r=document.getElementById("savedWorldsCount")?.textContent||"saved worlds";if(window.confirm(`Delete all ${r}? This cannot be undone.`)){t.disabled=!0;try{await KD(),window.location.reload()}catch(o){t.disabled=!1,window.alert(o?.message||"Could not delete saved worlds.")}}}),e?n.insertBefore(t,e):n.appendChild(t)}function av(){const n=document.getElementById("savedWorldsGrid");if(n)for(const e of n.querySelectorAll(".savedWorldCard")){if(e.querySelector(".savedWorldCardDelete"))continue;const t=e.querySelector(".savedWorldActions"),i=e.querySelector(".savedWorldPlay");if(!t||!i)continue;const o=(e.querySelector(".savedWorldMeta")?.textContent||"").match(/Seed:\s*(\d+)/);if(!o)continue;const a=Number(o[1]),s=document.createElement("button");s.className="savedWorldButton savedWorldCardDelete",s.type="button",s.textContent="Delete",s.addEventListener("click",async l=>{l.preventDefault(),l.stopPropagation();const c=e.querySelector("h3")?.textContent||"this world";if(window.confirm(`Delete "${c}"? This cannot be undone.`)){s.disabled=!0;try{await YD(a),e.remove();const d=document.getElementById("savedWorldsCount");if(d){const f=n.querySelectorAll(".savedWorldCard").length;d.textContent=`${f} saved world${f===1?"":"s"}`}}catch(d){s.disabled=!1,window.alert(d?.message||"Could not delete this world.")}}}),t.appendChild(s)}}function sv(){ov(),av();const n=document.getElementById("savedWorlds");if(!n||n.dataset.managementFixesInstalled)return;n.dataset.managementFixesInstalled="1";const e=new MutationObserver(()=>{ov(),av()}),t=document.getElementById("savedWorldsHeader"),i=document.getElementById("savedWorldsGrid");t&&e.observe(t,{childList:!0,subtree:!0}),i&&e.observe(i,{childList:!0,subtree:!0})}function ZD(){const n=()=>{const t=document.getElementById("touchMovePad");if(!t||t.dataset.joystickInstalled)return;t.dataset.joystickInstalled="1",t.innerHTML='<div id="mobileJoystickBase" aria-label="Movement joystick"><div id="mobileJoystickThumb"></div></div>';const i=t.querySelector("#mobileJoystickBase"),r=t.querySelector("#mobileJoystickThumb");let o=null;const a=58,s=(d,f)=>{const u=i.getBoundingClientRect(),p=u.left+u.width/2,m=u.top+u.height/2;let b=d-p,g=f-m;const h=Math.hypot(b,g);h>a&&(b=b/h*a,g=g/h*a),Le.moveX=b/a,Le.moveZ=-g/a,r.style.transform=`translate(calc(-50% + ${b}px), calc(-50% + ${g}px))`},l=()=>{o=null,Le.moveX=0,Le.moveZ=0,r.style.transform="translate(-50%, -50%)",i.classList.remove("active")};i.addEventListener("pointerdown",d=>{d.preventDefault(),d.stopPropagation(),o===null&&(o=d.pointerId,i.setPointerCapture?.(d.pointerId),i.classList.add("active"),s(d.clientX,d.clientY))},{passive:!1}),i.addEventListener("pointermove",d=>{d.pointerId===o&&(d.preventDefault(),s(d.clientX,d.clientY))},{passive:!1}),i.addEventListener("pointerup",l),i.addEventListener("pointercancel",l),i.addEventListener("lostpointercapture",l);const c=document.createElement("style");c.id="mobileJoystickStyles",c.textContent=`
body.mobile-mode.webminecraft-in-world #touchMovePad{width:132px !important;height:132px !important;display:block !important;pointer-events:none !important;filter:none !important}
#touchMovePad .moveKey{display:none !important}
#mobileJoystickBase{position:absolute;left:0;bottom:0;width:132px;height:132px;border-radius:50%;box-sizing:border-box;border:3px solid rgba(255,255,255,.32);background:rgba(0,0,0,.32);box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),0 3px 8px rgba(0,0,0,.45);pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#mobileJoystickBase.active{background:rgba(0,0,0,.4)}
#mobileJoystickThumb{position:absolute;left:50%;top:50%;width:62px;height:62px;border-radius:50%;box-sizing:border-box;border:3px solid rgba(255,255,255,.55);background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 2px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.45);pointer-events:none;transform:translate(-50%,-50%)}
@media(max-width:700px){body.mobile-mode.webminecraft-in-world #touchMovePad{transform:none !important}}
@media(orientation:portrait){body.mobile-mode.webminecraft-in-world #touchMovePad{width:118px !important;height:118px !important}#mobileJoystickBase{width:118px;height:118px}}
`,document.head.appendChild(c)};n(),new MutationObserver(n).observe(document.body,{childList:!0,subtree:!0})}function lv(){$D(),sv(),ZD(),new MutationObserver(()=>sv()).observe(document.body,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",lv,{once:!0}):lv();const Wi=32,JD=10;let Zd=!1,cv=!1,cp=0,dv=0;_t.wrapS=ss;_t.wrapT=En;_t.magFilter=Fe;_t.minFilter=Fe;_t.colorSpace=st;_t.needsUpdate=!0;function jD(){const n=_t.image;return{image:n,width:Number(n?.naturalWidth||n?.videoWidth||n?.width||0),height:Number(n?.naturalHeight||n?.videoHeight||n?.height||0)}}function QD(n,e){return!n||!e?null:e===n*Wi?{axis:"y",sourceFrameCount:Wi,frameWidth:n,frameHeight:n}:n===e*Wi?{axis:"x",sourceFrameCount:Wi,frameWidth:e,frameHeight:e}:e>=n*2?{axis:"y",sourceFrameCount:Math.max(1,Math.round(e/n)),frameWidth:n,frameHeight:n}:n>=e*2?{axis:"x",sourceFrameCount:Math.max(1,Math.round(n/e)),frameWidth:e,frameHeight:e}:{axis:"single",sourceFrameCount:1,frameWidth:Math.min(n,e),frameHeight:Math.min(n,e)}}function eN(n,e,t){try{const i=n.getImageData(0,0,e,t);for(let r=0;r<i.data.length;r+=4){const o=i.data[r],a=i.data[r+1],s=i.data[r+2];i.data[r+3]>0&&o<18&&a<18&&s<18&&(i.data[r+3]=0)}n.putImageData(i,0,0)}catch{}}function tN(n,e,t,i,r,o){const a=t.frameWidth,s=t.frameHeight;if(t.axis==="x"){const f=i*a;n.drawImage(e,f,0,a,s,0,o,r,r);return}if(t.axis==="y"){const f=i*s;n.drawImage(e,0,f,a,s,0,o,r,r);return}const l=document.createElement("canvas");l.width=r*2,l.height=r;const c=l.getContext("2d");if(!c)return;c.imageSmoothingEnabled=!1,c.drawImage(e,0,0,r,r),c.drawImage(e,r,0,r,r);const d=i/Wi*r;n.drawImage(l,d,0,r,r,0,o,r,r)}function Jh(){if(Zd)return!0;const{image:n,width:e,height:t}=jD();if(!n||!e||!t)return!1;const i=QD(e,t);if(!i)return!1;const r=i.frameWidth,o=document.createElement("canvas");o.width=r,o.height=r*Wi;const a=o.getContext("2d",{willReadFrequently:!0});if(!a)return!1;a.imageSmoothingEnabled=!1;for(let s=0;s<Wi;s++){const l=i.sourceFrameCount===1?s:s%i.sourceFrameCount;tN(a,n,i,l,r,s*r)}return eN(a,o.width,o.height),_t.image=o,_t.repeat.set(1,1/Wi),_t.offset.set(0,0),_t.wrapS=ss,_t.wrapT=En,_t.magFilter=Fe,_t.minFilter=Fe,_t.needsUpdate=!0,Zd=!0,!0}function G_(n){Zd||Jh(),Zd&&n-dv>=1e3/JD&&(dv=n,cp=(cp+1)%Wi,_t.offset.x=0,_t.offset.y=cp/Wi,_t.needsUpdate=!0),window.requestAnimationFrame(G_)}function nN(){cv||(cv=!0,window.requestAnimationFrame(G_))}if(typeof window<"u"&&(nN(),!Jh())){const n=()=>{Jh()||window.setTimeout(n,100)};window.setTimeout(n,100)}const V_="webminecraft-progression-v1";function iN(){try{const n=JSON.parse(localStorage.getItem(V_)||"null");return n&&typeof n=="object"?n:{mined:0,placed:0,xp:0,achievements:[]}}catch{return{mined:0,placed:0,xp:0,achievements:[]}}}function rN(n){try{localStorage.setItem(V_,JSON.stringify(n))}catch{}}function uv(){if(document.getElementById("webMinecraftProgressHud"))return;const n=iN();let e=0,t=0,i=null;const r=document.createElement("div");r.id="webMinecraftProgressHud",r.innerHTML=`
        <div class="progressTitle">⛏️ ADVENTURE</div>
        <div class="progressRow"><span>Level</span><b id="progressLevel">1</b></div>
        <div class="progressBar"><i id="progressBarFill"></i></div>
        <div class="progressRow muted"><span id="progressStats">0 mined • 0 placed</span><span id="progressStreak"></span></div>
    `,document.body.appendChild(r);const o=document.createElement("div");o.id="webMinecraftAchievementToast",document.body.appendChild(o);const a=document.createElement("style");a.id="webMinecraftProgressStyles",a.textContent=`
#webMinecraftProgressHud{position:fixed;right:14px;top:14px;width:190px;padding:9px 11px;color:#fff;background:rgba(18,18,18,.68);border:2px solid rgba(0,0,0,.8);border-top-color:rgba(255,255,255,.25);border-left-color:rgba(255,255,255,.18);border-radius:7px;box-shadow:0 4px 18px rgba(0,0,0,.25);font:11px/1.3 Arial,sans-serif;z-index:9998;pointer-events:none;text-shadow:1px 1px 0 #000;backdrop-filter:blur(5px)}
.progressTitle{font:700 12px monospace;margin-bottom:6px;letter-spacing:.6px}.progressRow{display:flex;justify-content:space-between;gap:8px}.progressRow.muted{margin-top:5px;color:#bbb;font-size:10px}.progressBar{height:6px;margin-top:5px;background:#111;border:1px solid #000;border-radius:3px;overflow:hidden}.progressBar i{display:block;width:0;height:100%;background:linear-gradient(90deg,#6fa34d,#b7d96f);transition:width .25s ease}
#webMinecraftAchievementToast{position:fixed;left:50%;top:13%;transform:translate(-50%,-18px) scale(.98);opacity:0;z-index:10020;padding:10px 16px;border:2px solid #111;border-top-color:#999;border-left-color:#999;border-radius:7px;background:rgba(22,22,22,.94);color:#fff;font:700 13px Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.45);pointer-events:none;text-shadow:1px 1px 0 #000;transition:opacity .18s ease,transform .18s ease}
#webMinecraftAchievementToast.show{opacity:1;transform:translate(-50%,0) scale(1)}
body:not(.webminecraft-in-world) #webMinecraftProgressHud,body:not(.webminecraft-in-world) #webMinecraftAchievementToast,body.webminecraft-creative #webMinecraftProgressHud,body.webminecraft-creative #webMinecraftAchievementToast{display:none}
@media(max-width:600px){#webMinecraftProgressHud{top:8px;right:8px;width:155px;padding:7px 8px;font-size:10px}.progressTitle{font-size:11px}}
`,document.head.appendChild(a);const s=r.querySelector("#progressLevel"),l=r.querySelector("#progressBarFill"),c=r.querySelector("#progressStats"),d=r.querySelector("#progressStreak"),f=[[1,"🌱 First block — welcome to the world!"],[10,"⛏️ Stone age — 10 blocks mined."],[50,"🔥 Deep miner — 50 blocks mined."],[100,"👑 Master builder — 100 blocks mined."]];function u(g){return Math.floor(Math.sqrt(Math.max(0,g)/10))+1}function p(){const g=u(n.xp),h=Math.pow(g-1,2)*10,_=Math.pow(g,2)*10,S=Math.max(0,Math.min(100,(n.xp-h)/Math.max(1,_-h)*100));s.textContent=String(g),l.style.width=`${S}%`,c.textContent=`${n.mined} mined • ${n.placed} placed`,d.textContent=e>1?`🔥 x${e}`:""}function m(g){o.textContent=`🏆 ${g}`,o.classList.add("show"),clearTimeout(i),i=setTimeout(()=>o.classList.remove("show"),2600)}function b(g){if(!document.body.classList.contains("webminecraft-in-world")||!Bn())return;const h=performance.now();if(e=h-t<2200?e+1:1,t=h,g.detail?.type===0){n.mined+=1,n.xp+=5;const S=f.find(([w])=>n.mined===w);S&&!n.achievements.includes(S[0])?(n.achievements.push(S[0]),n.xp+=25,m(`${S[1]} +25 XP`)):e===5&&(m("🔥 5-block build streak! +10 XP"),n.xp+=10)}else n.placed+=1,n.xp+=3,e===5&&(m("🔥 5-block build streak! +10 XP"),n.xp+=10);rN(n),p()}window.addEventListener("webminecraft:blockchange",b),p()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",uv,{once:!0}):uv();const fv="webminecraft-settings";function oN(){try{const n=JSON.parse(localStorage.getItem(fv)||"null"),e=n&&typeof n=="object"?n:{},t=navigator.hardwareConcurrency||4,i=matchMedia("(max-width: 700px), (pointer: coarse)").matches,r=navigator.deviceMemory||4;(i||t<=4||r<=4)&&((e.pixelRatio==null||e.pixelRatio>1)&&(e.pixelRatio=1),(e.shadowQuality==null||e.shadowQuality>768)&&(e.shadowQuality=512)),i&&e.shadows==null&&(e.shadows=!1),localStorage.setItem(fv,JSON.stringify(e))}catch{}}function aN(){document.addEventListener("visibilitychange",()=>{document.body.classList.toggle("webminecraft-tab-hidden",document.hidden)},{passive:!0})}oN();aN();function sN(){if(document.getElementById("webMinecraftDirtBackgrounds"))return;const n=document.createElement("style");n.id="webMinecraftDirtBackgrounds",n.textContent=`
#savedWorlds {
    background-color:rgba(35,24,16,.72) !important;
    background-image:url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsShell {
    background-color:rgba(28,20,14,.82) !important;
    background-image:linear-gradient(rgba(20,14,10,.62),rgba(20,14,10,.82)),url("./textures/dirt.png") !important;
    background-repeat:repeat !important;
    background-size:64px 64px !important;
}
#savedWorldsBody { background:rgba(0,0,0,.08); }
`,document.head.appendChild(n)}function lN(){if(document.getElementById("webMinecraftMenuUiFixes"))return;const n=document.createElement("style");n.id="webMinecraftMenuUiFixes",n.textContent=`
#newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:118px !important;margin:0 !important;z-index:97 !important}
#friendsButton{position:fixed !important;left:158px !important;bottom:28px !important;width:118px !important;height:48px !important;margin:0 !important;z-index:97 !important}
#globalPlayerCount{left:auto !important;right:28px !important;bottom:28px !important;width:142px !important;min-height:48px !important;text-align:center !important}
#globalPlayerPanel{left:auto !important;right:28px !important;bottom:88px !important}
#mobileModeButton{margin-top:12px !important;background:linear-gradient(#536b82,#3e5265) !important;border-color:#111 !important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),inset -2px -3px 0 rgba(0,0,0,.3),0 3px 0 rgba(0,0,0,.72) !important}
#mobileModeButton:hover,#mobileModeButton:focus-visible{background:linear-gradient(#617c96,#496178) !important}
#mobileModeButton.mobileOn{background:linear-gradient(#6d8d4e,#526f3c) !important}
#mobileModeButton.mobileOn:hover,#mobileModeButton.mobileOn:focus-visible{background:linear-gradient(#7da65a,#5f8145) !important}
#mobileModeButton::before{content:"▣ "}

body:not(.webminecraft-in-world) #crosshair,
body:not(.webminecraft-in-world) #hotbar,
body:not(.webminecraft-in-world) #performanceHud,
body:not(.webminecraft-in-world) #touchControls,
body:not(.webminecraft-in-world) #touchAimKnob,
body:not(.webminecraft-in-world) #touchHint{display:none !important}
body.webminecraft-in-world #accountButton,
body.webminecraft-in-world #newsButton,
body.webminecraft-in-world #friendsButton,
body.webminecraft-in-world #globalPlayerPanel,
body.webminecraft-in-world #mainMenu button,
body.webminecraft-in-world #menuButtons,
body.webminecraft-in-world #playButton,
body.webminecraft-in-world #multiplayerButton,
body.webminecraft-in-world #menuSettingsButton,
body.webminecraft-in-world #mobileModeButton,
body.webminecraft-in-world #mainMenu .menuButton,
body.webminecraft-in-world #seedMenu,
body.webminecraft-in-world #menuUpdates{display:none !important}
body.webminecraft-in-world #devControlsButton{display:none !important;visibility:hidden !important;pointer-events:none !important}
body.webminecraft-in-world #webMinecraftMovingClouds{display:none !important}
body.webminecraft-in-world #globalPlayerCount{display:none !important}
#settingsVersion{display:none !important}
#gameVersionButton,#gameVersionPicker{display:none !important}
#webMinecraftMovingClouds{display:none !important}
#touchMovePad{overflow:visible}
@media(max-width:560px){
    #newsButton{left:12px !important;bottom:18px !important;width:calc(50vw - 18px) !important}
    #friendsButton{left:calc(50vw + 6px) !important;bottom:18px !important;width:calc(50vw - 18px) !important}
}
`,document.head.appendChild(n);const e=document.getElementById("settingsButton"),t=document.getElementById("mainMenu"),i=document.getElementById("mobileModeButton");if(!t)return;const r=()=>{const f=new URLSearchParams(window.location.search);return f.get("mobile")==="1"||f.get("mode")==="mobile"},o=()=>{const f=document.getElementById("newsButton");if(!f)return;const u=r()||window.innerWidth<=560;f.style.position="fixed",f.style.left=u?"12px":"28px",f.style.bottom=u?"18px":"28px",f.style.width=u?"calc(50vw - 18px)":"118px",f.style.margin="0",f.style.zIndex="97"},a=document.getElementById("menuButtons");a&&new MutationObserver(o).observe(a,{childList:!0}),o(),window.addEventListener("resize",o,{passive:!0});const s=()=>{if(document.getElementById("friendsButton"))return;const f=document.createElement("button");f.id="friendsButton",f.type="button",f.textContent="Friends",f.addEventListener("click",()=>{const u=document.getElementById("accountButton");u&&u.click()}),document.body.appendChild(f)};s();const l=()=>{const f=getComputedStyle(t).display!=="none",u=!f;document.body.classList.toggle("webminecraft-in-world",u),e&&(e.style.display=f||u&&r()?"block":"none"),s(),o()},c=()=>{if(!i)return;const f=r();i.classList.toggle("mobileOn",f),i.textContent=f?"Desktop Mode":"Mobile Mode",i.title=f?"Switch back to desktop controls":"Use touch-friendly mobile controls",i.setAttribute("aria-pressed",String(f))};l(),c();const d=new MutationObserver(()=>{l(),c()});d.observe(t,{attributes:!0,attributeFilter:["style","class"]}),e&&d.observe(e,{attributes:!0,attributeFilter:["style","class"]})}function pv(){sN(),lN()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pv,{once:!0}):pv();const ec="webminecraft-chat-open",cN=25e3,dN=1e4,uN=5e3;let Qr=null,hv=null,jh=null,mv="",gv=0;function dp(){return!!window.__webminecraftMultiplayerActive}function tc(){return document.querySelector("#multiplayerChat input, #multiplayerChat textarea")}function es(){return document.getElementById("multiplayerChat")}function Qh(){return document.body.classList.contains(ec)}function X_(){return document.querySelector("#multiplayerChat .chat-messages, #multiplayerChat .messages, #multiplayerChat [class*=message], #multiplayerChatFeed")}function $c(n){const e=X_();if(!e)return;const t=document.createElement("div");t.textContent=n,t.style.opacity=".8",e.appendChild(t),e.scrollTop=e.scrollHeight}function fN(n){const e=n.trim().toLowerCase();if(e==="/help")$c("Commands: /help, /seed, /clear, /ping");else if(e==="/seed")$c(`Seed: ${window.__webminecraftSeed??"unknown"}`);else if(e==="/clear"){const t=X_();t&&(t.innerHTML="")}else $c(e==="/ping"?"Pong!":`Unknown command: ${n}`)}function Jd(){if(document.getElementById("webMinecraftFullscreenChatStyles"))return;const n=document.createElement("style");n.id="webMinecraftFullscreenChatStyles",n.textContent=`
#multiplayerChat{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;box-sizing:border-box!important;z-index:50000!important;display:none!important;pointer-events:auto!important;font-family:Arial,sans-serif;text-shadow:2px 2px 0 #000;background:rgba(0,0,0,.72)!important;padding:clamp(18px,4vw,52px)!important}
body.webminecraft-chat-open #multiplayerChat{display:flex!important;flex-direction:column!important}
#multiplayerChat::before{content:"CHAT";display:block;flex:0 0 auto;color:#fff;font-family:"MinecraftFont",monospace;font-size:clamp(24px,4vw,38px);font-weight:700;letter-spacing:1px;text-shadow:3px 3px 0 #000;margin:0 0 14px}
#multiplayerChatFeed{box-sizing:border-box!important;width:100%!important;max-width:1100px!important;flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;padding:16px 18px!important;background:rgba(0,0,0,.34)!important;border:2px solid rgba(255,255,255,.18)!important;scrollbar-width:thin!important;margin:0 auto!important}
.multiplayerChatLine{font-size:clamp(15px,2vw,19px)!important;line-height:1.55!important;color:#fff!important;overflow-wrap:anywhere!important;margin:4px 0!important;text-shadow:2px 2px 0 #000!important}.multiplayerChatSystem{color:#cfcfcf!important;font-style:italic!important}.multiplayerChatName{font-weight:700!important;color:#fff!important}
#multiplayerChatInput{box-sizing:border-box!important;width:100%!important;max-width:1100px!important;height:52px!important;flex:0 0 52px!important;margin:14px auto 0!important;padding:9px 13px!important;background:rgba(0,0,0,.82)!important;color:#fff!important;border:2px solid #777!important;border-top-color:#aaa!important;border-left-color:#aaa!important;outline:none!important;pointer-events:auto!important;font:18px Arial,sans-serif!important;text-shadow:1px 1px 0 #000!important}
#multiplayerChatInput:focus{border-color:#fff!important}#multiplayerChatInput::placeholder{color:#aaa!important}
#webMinecraftChatNotifications{position:fixed!important;top:14px!important;left:14px!important;width:min(520px,calc(100vw - 28px))!important;z-index:49999!important;display:flex!important;flex-direction:column!important;gap:4px!important;pointer-events:none!important;font-family:Arial,sans-serif!important;text-shadow:2px 2px 0 #000!important}.webMinecraftChatNotification{box-sizing:border-box!important;width:100%!important;padding:8px 12px!important;background:rgba(0,0,0,.82)!important;border:2px solid rgba(255,255,255,.18)!important;color:#fff!important;font-size:16px!important;line-height:1.35!important;overflow-wrap:anywhere!important;animation:webMinecraftChatNotificationIn .16s ease-out!important}.webMinecraftChatNotificationName{font-weight:700!important;color:#fff!important}@keyframes webMinecraftChatNotificationIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}body.webminecraft-chat-open #webMinecraftChatNotifications{display:none!important}body.webminecraft-chat-open #touchChatButton{display:none!important}
@media(max-width:700px){#multiplayerChat{padding:14px!important;background:rgba(0,0,0,.78)!important}#multiplayerChat::before{font-size:25px!important;margin-bottom:10px!important}#multiplayerChatFeed{padding:11px 12px!important}.multiplayerChatLine{font-size:15px!important;line-height:1.5!important;margin:3px 0!important}#multiplayerChatInput{height:50px!important;flex-basis:50px!important;margin-top:10px!important;font-size:16px!important}#webMinecraftChatNotifications{top:10px!important;left:10px!important;width:calc(100vw - 20px)!important}.webMinecraftChatNotification{font-size:14px!important;padding:7px 10px!important}}
`,document.head.appendChild(n)}function em(){let n=document.getElementById("webMinecraftChatNotifications");return n||(n=document.createElement("div"),n.id="webMinecraftChatNotifications",n.setAttribute("aria-live","polite"),document.body.appendChild(n),n)}function pN(n){if(Qh())return;const e=n?.[1]===!0,t=typeof n?.[0]=="string"?n[0].trim():"",i=typeof n?.[2]=="string"?n[2].trim():"";if(e||!t)return;const r=`${i}
${t}`,o=Date.now();if(r===mv&&o-gv<1e3)return;mv=r,gv=o;const a=em(),s=document.createElement("div");if(s.className="webMinecraftChatNotification",i){const l=document.createElement("span");l.className="webMinecraftChatNotificationName",l.textContent=`${i}: `,s.appendChild(l)}for(s.appendChild(document.createTextNode(t)),a.appendChild(s);a.children.length>4;)a.firstElementChild?.remove();clearTimeout(hv),hv=setTimeout(()=>{Qh()||(a.innerHTML="")},uN)}function hN(n=""){const e=es();if(!e)return!1;clearTimeout(Qr),Jd(),document.body.classList.add(ec),e.style.display="flex";const t=tc();if(t){t.value!==n&&(t.value=n),t.focus({preventScroll:!0});try{t.setSelectionRange(t.value.length,t.value.length)}catch{}}return!0}function Rg(){clearTimeout(Qr),Qr=null,document.body.classList.remove(ec);const n=tc();n&&n.blur()}function xv(){clearTimeout(Qr),document.body.classList.add(ec),Qr=setTimeout(Rg,cN)}function mN(){clearTimeout(Qr),document.body.classList.add(ec);const n=()=>{const e=tc();if(!!(e&&(document.activeElement===e||e.value.trim()))){Qr=setTimeout(n,1e3);return}Rg()};Qr=setTimeout(n,dN)}function vl(n=""){if(hN(n))try{document.exitPointerLock?.()}catch{}}function Wl(){Rg()}function up(){const n=window.__webminecraftChatAdd;if(typeof n!="function")return;if(n.__webminecraftChatNotificationWrapper===!0){jh=n;return}const e=function(...t){const i=n.apply(this,t);return pN(t),i};e.__webminecraftChatNotificationWrapper=!0,e.__webminecraftChatOriginal=n,window.__webminecraftChatAdd=e,jh=e}function fp(){const n=tc();!n||n.dataset.webminecraftChatInstalled==="1"||(n.dataset.webminecraftChatInstalled="1",n.addEventListener("keydown",e=>{if(e.key==="Enter"){const t=n.value.trim();if(!t){e.preventDefault(),e.stopImmediatePropagation(),Wl();return}if(t.startsWith("/")){e.preventDefault(),e.stopImmediatePropagation(),fN(t),n.value="",xv();return}xv()}e.key==="Escape"&&(e.preventDefault(),e.stopImmediatePropagation(),n.value="",Wl())},!0))}function pp(){const n=es();!n||n.dataset.webminecraftBackgroundClose==="1"||(n.dataset.webminecraftBackgroundClose="1",n.addEventListener("click",e=>{e.target===n&&Wl()}))}function gN(){Jd(),em(),fp(),pp(),up(),new MutationObserver(()=>{fp(),pp(),up(),em(),es()&&Jd()}).observe(document.body,{childList:!0,subtree:!0});let e=0;const t=setInterval(()=>{up(),fp(),pp(),++e>=30&&jh&&clearInterval(t)},250)}function xN(){if(document.getElementById("touchChatButton"))return;const n=document.createElement("button");n.id="touchChatButton",n.type="button",n.textContent="CHAT",n.addEventListener("click",()=>{vl(""),mN()}),document.body.appendChild(n);const e=document.createElement("style");e.textContent='#touchChatButton{display:none;position:fixed;right:18px;top:18px;width:74px;min-height:44px;padding:8px 10px;z-index:190;pointer-events:auto;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;user-select:none;-webkit-user-select:none;touch-action:none}body.mobile-mode.webminecraft-in-world #touchChatButton{display:block}body:not(.webminecraft-in-world) #touchChatButton{display:none!important}body:not(.mobile-mode) #touchChatButton{display:none!important}',document.head.appendChild(e)}function bN(n){if(!n||!n.tagName)return!1;const e=n.tagName.toLowerCase();return(e==="input"||e==="textarea"||n.isContentEditable)&&!n.closest("#multiplayerChat")}function vN(){window.addEventListener("keydown",n=>{const e=n.target,t=tc(),i=Qh();if(!(t&&e===t)&&!bN(e)){if(n.key==="Escape"&&i){n.preventDefault(),n.stopImmediatePropagation(),Wl();return}if(n.key==="/"||n.code==="Slash"){if(!dp()&&!es())return;n.preventDefault(),n.stopImmediatePropagation(),vl("/");return}if(n.key.toLowerCase()==="t"){if(!dp()&&!es())return;n.preventDefault(),n.stopImmediatePropagation(),vl("");return}if(n.key==="Enter"&&!i){if(!dp()&&!es())return;n.preventDefault(),n.stopImmediatePropagation(),vl("")}}},!0)}function yN(){window.__webminecraftOpenChat=vl,window.__webminecraftCloseChat=Wl}function bv(){Jd(),gN(),xN(),vN(),yN()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",bv,{once:!0}):bv();const wN=[{id:1,name:"Grass Block",texture:"grass_block_side.png"},{id:2,name:"Dirt",texture:"dirt.png"},{id:3,name:"Stone",texture:"stone.png"},{id:4,name:"Sand",texture:"sand.png"},{id:5,name:"Oak Log",texture:"oak_log_top.png"},{id:6,name:"Oak Leaves",texture:"oak-leaves-normal-original-default.png"},{id:7,name:"Cobblestone",texture:"cobblestone.png"},{id:8,name:"Gravel",texture:"gravel.png"},{id:9,name:"Sandstone",texture:"sandstone.png"},{id:10,name:"Bedrock",texture:"bedrock.png"},{id:11,name:"Coal Ore",texture:"coal_ore.png"},{id:12,name:"Iron Ore",texture:"iron_ore.png"},{id:13,name:"Oak Planks",texture:"oak_planks.png"},{id:14,name:"Snow",texture:"snow.png"},{id:15,name:"TNT",texture:"tnt_side.png"},{id:16,name:"Flint and Steel",texture:"Flint_and_Steel_JE4_BE2.png"},{id:17,name:"Oak Door",texture:"oak_door_bottom.png"}];let an=null,Na=null,js=null,hp=null,mp=null,q_=0,ts=!1,tm=[],cd=0;function go(){return document.body.classList.contains("webminecraft-in-world")}function _N(n){return`/WebMinecraftT/textures/${encodeURIComponent(n)}`}function $_(n){return wN.find(e=>e.id===Number(n))}function SN(n){if(!n||!Number.isFinite(Number(n.itemId))||!Number.isFinite(Number(n.count)))return null;const e=$_(n.itemId);return e?{itemId:Number(n.itemId),count:Math.max(1,Math.min(64,Math.floor(Number(n.count)))),texture:n.texture||e.texture||null}:null}function Y_(){try{const n=JSON.parse(localStorage.getItem("webminecraft_inventory")||"[]");tm=Array.isArray(n)&&n.length===36?n.map(SN):Array.from({length:36},()=>null)}catch{tm=Array.from({length:36},()=>null)}}function MN(n){if(!n?.itemId)return"";const e=$_(n.itemId);if(!e)return"";const t=n.texture||e.texture;return`${t?`<img class="svi-item" src="${_N(t)}" alt="" draggable="false">`:'<span class="svi-item svi-color" style="--c:#777"></span>'}${n.count>1?`<b>${n.count}</b>`:""}`}function vv(n,e){const t=document.createElement("button");return t.type="button",t.className="svi-slot",t.dataset.index=String(n),t.title=e||`Slot ${n+1}`,t.setAttribute("aria-label",t.title),t.innerHTML=MN(tm[n]),t.addEventListener("click",()=>EN(n)),t}function Lg(){const n=an.querySelector("#svi-storage"),e=an.querySelector("#svi-hotbar");n.innerHTML="",e.innerHTML="";for(let t=9;t<36;t++)n.appendChild(vv(t,`Storage slot ${t-8}`));for(let t=0;t<9;t++){const i=vv(t,`Hotbar slot ${t+1}`);t===cd&&i.classList.add("selected"),e.appendChild(i)}}function EN(n){if(n<0||n>=9)return;cd=n;const e=new KeyboardEvent("keydown",{key:String(cd+1),code:`Digit${cd+1}`,bubbles:!0});window.dispatchEvent(e),document.dispatchEvent(e),Lg()}function dd(){ts=!1,an?.classList.remove("open"),document.body.classList.remove("survival-inventory-open"),cancelAnimationFrame(q_)}function yv(){return!go()||!Bn()?!1:(Y_(),an||CN(),Lg(),an.classList.add("open"),document.body.classList.add("survival-inventory-open"),ts=!0,K_(),!0)}function TN(){const n=new Tn,e=new Xn({color:13867634}),t=new Xn({color:4157346}),i=new Xn({color:2571091}),r=new Xn({color:2759186}),o=new Oe(new ft(.82,.82,.82),[e,e,e,e,r,e]);o.position.y=2.25;const a=new Oe(new ft(.96,1,.55),t);a.position.y=1.35;const s=new Oe(new ft(.36,1,.5),t);s.position.set(-.66,1.35,0);const l=s.clone();l.position.x=.66;const c=new Oe(new ft(.42,1,.48),i);c.position.set(-.25,.35,0);const d=c.clone();return d.position.x=.25,n.add(o,a,s,l,c,d),n.traverse(f=>{f.isMesh&&(f.castShadow=!0,f.receiveShadow=!0)}),n}function K_(){const n=an.querySelector("#svi-player-preview");if(!Na){Na=new Rm({canvas:n,antialias:!0,alpha:!0}),Na.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),Na.outputColorSpace=st,js=new Eo,js.add(new wy(16777215,4473924,1.6));const t=new yd(16777215,2.2);t.position.set(2,5,4),js.add(t),hp=new Pn(34,1,.1,50),hp.position.set(3.2,2.4,4.2),mp=TN(),js.add(mp)}const e=n.getBoundingClientRect();Na.setSize(Math.max(1,e.width),Math.max(1,e.height),!1),mp.rotation.y+=.008,Na.render(js,hp),ts&&(q_=requestAnimationFrame(K_))}function AN(){const n=an.querySelector("#svi-recipe-book"),e=an.querySelector("#svi-recipe-panel"),t=!e.hidden;e.hidden=t,n.classList.toggle("active",!t)}function CN(){an=document.createElement("div"),an.id="survivalInventoryScreen",an.innerHTML=`
      <div id="svi-panel">
        <header id="svi-header"><span>Survival Inventory</span><button id="svi-close" type="button">×</button></header>
        <div id="svi-top">
          <section id="svi-player-box">
            <canvas id="svi-player-preview"></canvas>
            <div id="svi-armor">
              <div class="svi-armor-slot" title="Helmet">⛑</div>
              <div class="svi-armor-slot" title="Chestplate">▣</div>
              <div class="svi-armor-slot" title="Leggings">▥</div>
              <div class="svi-armor-slot" title="Boots">◈</div>
            </div>
            <div id="svi-offhand" title="Off-hand">🛡</div>
            <span class="svi-box-label">Character & Armor</span>
          </section>
          <section id="svi-crafting">
            <div class="svi-section-title">Crafting</div>
            <div class="svi-craft-row"><div id="svi-craft-grid"></div><span class="svi-arrow">→</span><div class="svi-craft-output"> </div></div>
            <button id="svi-recipe-book" type="button">📗 Recipe Book</button>
            <div id="svi-recipe-panel" hidden>Basic recipes will appear here as they are added.</div>
          </section>
        </div>
        <section id="svi-storage-section"><div class="svi-section-title">Inventory</div><div id="svi-storage"></div></section>
        <section id="svi-hotbar-section"><div class="svi-section-title">Hotbar <small>1–9</small></div><div id="svi-hotbar"></div></section>
      </div>`,document.body.appendChild(an);const n=an.querySelector("#svi-craft-grid");for(let t=0;t<4;t++)n.appendChild(document.createElement("div")).className="svi-craft-slot";an.querySelector("#svi-close").addEventListener("click",dd),an.querySelector("#svi-recipe-book").addEventListener("click",AN);const e=document.createElement("style");e.textContent=`
#survivalInventoryScreen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.64);z-index:1000000;font-family:Arial,sans-serif;color:#fff}
#survivalInventoryScreen.open{display:flex}
#svi-panel{width:min(790px,92vw);height:min(585px,88vh);box-sizing:border-box;padding:10px;background:linear-gradient(#353535,#2a2a2a);border:2px solid #141414;border-top-color:#8b8b8b;border-left-color:#8b8b8b;box-shadow:8px 8px 0 rgba(0,0,0,.38),inset 1px 1px #555;display:flex;flex-direction:column;gap:8px;overflow:auto;border-radius:4px}
#svi-header{display:flex;align-items:center;justify-content:space-between;font-size:19px;font-weight:800;text-shadow:2px 2px #111;min-height:30px}#svi-close{width:32px;height:30px;background:#5d5d5d;color:#fff;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;border-radius:3px;font-size:22px;line-height:22px;cursor:pointer;box-shadow:inset -1px -1px #333}#svi-close:hover{filter:brightness(1.12)}
#svi-top{display:grid;grid-template-columns:1fr 1fr;gap:8px;min-height:205px}.svi-section-title{font-size:13px;font-weight:800;margin-bottom:5px;text-shadow:1px 1px #111}.svi-section-title small{color:#aaa;font-size:10px;font-weight:600}
#svi-player-box,#svi-crafting,#svi-storage-section,#svi-hotbar-section{background:#222;border:2px solid #0f0f0f;padding:8px;box-sizing:border-box;border-radius:3px;box-shadow:inset 1px 1px rgba(255,255,255,.05)}.svi-box-label{display:block;color:#999;font-size:10px;margin-top:4px}
#svi-player-box{position:relative;display:grid;grid-template-columns:1fr 58px;grid-template-rows:1fr 40px;min-height:205px}#svi-player-preview{width:100%;height:100%;min-height:145px;background:radial-gradient(circle,#565656 0%,#252525 70%)}#svi-armor{display:flex;flex-direction:column;gap:4px;padding-left:6px;align-items:center;justify-content:center}.svi-armor-slot,.svi-craft-slot,.svi-craft-output,#svi-offhand{border:2px solid #555;border-top-color:#1d1d1d;border-left-color:#1d1d1d;background:#747474;box-shadow:inset -1px -1px #414141;display:grid;place-items:center;font-size:20px;color:#ddd;border-radius:2px}.svi-armor-slot{width:38px;height:38px}.svi-armor-slot:hover,#svi-offhand:hover{filter:brightness(1.15)}#svi-offhand{width:40px;height:40px;grid-column:2;grid-row:2;justify-self:center}
#svi-crafting{display:flex;flex-direction:column;align-items:center}.svi-craft-row{display:flex;align-items:center;justify-content:center;gap:9px;flex:1}.svi-arrow{font-size:30px;color:#bbb}.svi-craft-output{width:48px;height:48px}.svi-craft-slot{width:42px;height:42px}.svi-craft-slot:hover,.svi-craft-output:hover{filter:brightness(1.15)}#svi-craft-grid{display:grid;grid-template-columns:repeat(2,42px);gap:4px}#svi-recipe-book{margin-top:5px;border:2px solid #315d34;background:#4c8a50;color:#fff;border-radius:4px;padding:5px 9px;cursor:pointer;font-weight:800;font-size:11px}#svi-recipe-book.active{background:#6cad6c}#svi-recipe-panel{width:100%;margin-top:5px;padding:6px;background:#171717;border:1px solid #555;color:#aaa;font-size:10px;text-align:center;border-radius:2px}
#svi-storage-section{flex:1;min-height:174px}#svi-storage,#svi-hotbar{display:grid;grid-template-columns:repeat(9,minmax(34px,1fr));gap:4px}.svi-slot{position:relative;aspect-ratio:1;background:#7c7c7c;border:2px solid #575757;border-top-color:#202020;border-left-color:#202020;box-shadow:inset -1px -1px #3c3c3c;color:#fff;padding:0;cursor:pointer;overflow:hidden;border-radius:2px}.svi-slot:hover{filter:brightness(1.12)}.svi-slot.selected{border:2px solid #fff;box-shadow:inset 0 0 0 1px #bbb,0 0 0 1px #111}.svi-item{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);object-fit:cover;object-position:center;image-rendering:pixelated;pointer-events:none}.svi-color{background:var(--c);box-shadow:inset 3px 3px rgba(255,255,255,.15),inset -3px -3px rgba(0,0,0,.2)}.svi-slot b{position:absolute;right:3px;bottom:1px;font-size:12px;text-shadow:2px 2px #111}.svi-slot::after{content:attr(data-index);position:absolute;left:3px;top:1px;color:rgba(255,255,255,.55);font-size:8px;text-shadow:1px 1px #111;pointer-events:none}
#svi-hotbar-section{flex:0 0 auto}#svi-hotbar{grid-template-columns:repeat(9,42px);justify-content:center}.survival-inventory-open #hotbar{display:none!important}.survival-inventory-open #inventoryScreen{display:none!important}
@media(max-width:720px){#svi-panel{width:min(520px,94vw);height:88vh;padding:8px;gap:6px}#svi-top{grid-template-columns:1fr;min-height:0;gap:6px}#svi-player-box{min-height:180px}#svi-player-preview{min-height:120px}#svi-storage-section{min-height:0}.svi-slot{min-width:0}.svi-item{inset:3px;width:calc(100% - 6px);height:calc(100% - 6px)}#svi-hotbar{grid-template-columns:repeat(9,minmax(26px,40px))}.svi-section-title{font-size:12px}}
`,document.head.appendChild(e)}function wv(){document.addEventListener("keydown",e=>{!go()||!Bn()||((e.code==="KeyE"||e.code==="KeyI")&&(e.preventDefault(),e.stopImmediatePropagation(),yv()),e.code==="Escape"&&ts&&(e.preventDefault(),dd()))},!0),document.addEventListener("click",e=>{!go()||!Bn()||!e.target.closest?.("#inventoryButton, #inventoryMobileButton")||(e.preventDefault(),e.stopImmediatePropagation(),yv())},!0),window.addEventListener("webminecraft:inventorychanged",()=>{Y_(),!(!ts||!an||!go()||!Bn())&&Lg()}),window.addEventListener("webminecraft:modechange",()=>{(!go()||!Bn())&&dd()}),new MutationObserver(()=>{!go()&&ts&&dd(),!go()&&an?.classList.contains("open")&&an.classList.remove("open")}).observe(document.body,{attributes:!0,attributeFilter:["class"]})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",wv,{once:!0}):wv();const RN="webminecraft-singleplayer-world-blocks-",Ig=180,_v=750;let nm=null,gp=!1,Ba=new Set;const jd=new Map;function $o(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function Z_(){const n=$o(typeof to=="function"?to():null);return n!==null?n:$o(new URLSearchParams(window.location.search).get("seed"))}function J_(n){const e=$o(n);return e===null?null:`${RN}${e}`}function im(n){const e=J_(n);if(!e)return{};try{const t=JSON.parse(localStorage.getItem(e)||"{}");return t&&typeof t=="object"&&!Array.isArray(t)?t:{}}catch{return{}}}function LN(n,e){const t=J_(n);if(!t)return!1;try{return localStorage.setItem(t,JSON.stringify(e||{})),!0}catch(i){return console.warn("Block snapshot save failed:",i),!1}}function j_(n){const e=$o(n);if(e===null)return 0;const t=(jd.get(e)||0)+1;return jd.set(e,t),t}function ns(n,e=Ig){const t=$o(n);t===null||bt(t)||(Ba.add(t),clearTimeout(nm),nm=setTimeout(PN,e))}async function IN(n){const e=$o(n);if(e===null||bt(e))return;const t=jd.get(e)||0,i=im(e);if(Object.keys(i).length)try{const r=await BI(e);if(!r||bt(e)){ns(e,_v);return}const o=im(e),a={...r.blocks&&typeof r.blocks=="object"?r.blocks:{},...o},s={...r,seed:e,blocks:a,updatedAt:new Date().toISOString()};await OI(s);try{await _u(s)}catch(l){console.warn("Cloud block save failed:",l)}(jd.get(e)||0)!==t&&ns(e,Ig)}catch(r){console.warn(`World block save failed for seed ${e}:`,r),ns(e,_v)}}async function PN(){if(nm=null,gp||Ba.size===0)return;gp=!0;const n=[...Ba];Ba.clear();try{for(const e of n)await IN(e)}finally{gp=!1,Ba.size&&ns([...Ba][0],Ig)}}function DN(n,e){const t=$o(n);if(t===null||bt(t))return;const i=Math.floor(Number(e?.x)),r=Math.floor(Number(e?.y)),o=Math.floor(Number(e?.z)),a=Math.floor(Number(e?.type));if(![i,r,o,a].every(Number.isFinite))return;const s=im(t);s[`${i},${r},${o}`]=a,LN(t,s),j_(t),ns(t)}window.addEventListener("webminecraft:blockchange",n=>{DN(Z_(),n.detail||{})});function Q_(){const n=Z_();n===null||bt(n)||(j_(n),ns(n,0))}window.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Q_()});window.addEventListener("pagehide",Q_);const rm=20;let Sv=null,Mv=null;function NN(){const n=document.getElementById("mainMenu"),e=document.getElementById("savedWorlds"),t=document.getElementById("seedMenu"),i=n?.style.display==="none",r=e&&e.style.display!=="none",o=t&&t.style.display!=="none";return!!(i&&!r&&!o)}function eS(){let n=document.getElementById("webMinecraftHealthHud");if(n||(n=document.createElement("div"),n.id="webMinecraftHealthHud",n.innerHTML='<span class="healthHearts" aria-label="20 health">❤❤❤❤❤❤❤❤❤❤</span>',document.body.appendChild(n)),!document.getElementById("webMinecraftHealthStyles")){const e=document.createElement("style");e.id="webMinecraftHealthStyles",e.textContent="#webMinecraftHealthHud{position:fixed;left:0;bottom:84px;transform:none;z-index:10001;display:none;align-items:center;padding:0;pointer-events:none;white-space:nowrap}body.webminecraft-survival.webminecraft-in-world #webMinecraftHealthHud{display:flex!important}body.webminecraft-survival.webminecraft-in-world #touchFly{display:none!important}.healthHearts{color:#ef5350;letter-spacing:1px;font-size:20px;line-height:1;text-shadow:2px 2px 0 #000,-1px -1px 0 #000;white-space:nowrap}@media(max-width:700px){.healthHearts{font-size:16px;letter-spacing:0}}",document.head.appendChild(e)}}function Pg(){const n=document.getElementById("webMinecraftHealthHud"),e=document.getElementById("hotbar");if(!n||!e)return;const t=e.getBoundingClientRect();if(!t.width||!t.height)return;const i=t.left+4;n.style.left=`${i}px`,n.style.bottom=`${window.innerHeight-t.top+6}px`,n.style.transform="none"}function FN(){const n=document.getElementById("webMinecraftHealthHud");if(!n||!Bn())return;const e=n.querySelector(".healthHearts");if(!e)return;const t=Number(window.webMinecraftSurvivalHealth??rm),i=Math.max(0,Math.min(rm,t)),r=Math.floor(i/2),o=i%2,a="❤".repeat(r)+(o?"♥":"")+"♡".repeat(10-r-o);e.textContent!==a&&(e.textContent=a);const s=`${i} health`;e.getAttribute("aria-label")!==s&&e.setAttribute("aria-label",s),Pg()}function Ev(){const n=Bn(),e=NN();(n!==Sv||e!==Mv)&&(Sv=n,Mv=e,document.body.classList.toggle("webminecraft-survival",n),document.body.classList.toggle("webminecraft-creative",!n),document.body.classList.toggle("webminecraft-in-world",e)),n&&e&&(window.webMinecraftSurvivalHealth==null&&(window.webMinecraftSurvivalHealth=rm),eS(),FN(),Pg(),document.getElementById("touchFly")?.classList.remove("pressed"))}function Tv(){eS(),Ev(),window.setInterval(Ev,100),window.addEventListener("resize",Pg),document.addEventListener("keydown",n=>{!Bn()||n.code!=="KeyF"||(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation())},!0),document.addEventListener("pointerdown",n=>{!Bn()||!n.target.closest?.("#touchFly")||(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation())},!0),document.addEventListener("click",n=>{!Bn()||!n.target.closest?.("#touchFly")||(n.preventDefault(),n.stopPropagation(),n.stopImmediatePropagation())},!0)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Tv,{once:!0}):Tv();const St=new Eo;KR(St);const Ha=new Ae(8900331),Av=new Ae(1119514),Cv=new Ae(465707);St.background=Ha.clone();St.fog=new _m(Ha.clone(),40,120);const Ue=new Pn(75,window.innerWidth/window.innerHeight,.1,180);window.__webminecraftCamera=Ue;Ue.position.set(0,7,5);Ue.up.set(0,1,0);Ue.rotation.order="YXZ";const mn=new Rm({antialias:!1,powerPreference:"high-performance"});mn.setSize(window.innerWidth,window.innerHeight);mn.setPixelRatio(1);mn.outputColorSpace=st;mn.toneMapping=iu;mn.toneMappingExposure=1.05;mn.shadowMap.enabled=!0;mn.shadowMap.type=Wa;document.body.appendChild(mn.domElement);const tS=new wy(12577023,3419174,1.35);St.add(tS);const Gt=new yd(16773583,3.2);Gt.position.set(45,85,30);Gt.castShadow=!0;Gt.shadow.mapSize.width=1024;Gt.shadow.mapSize.height=1024;Gt.shadow.camera.left=-80;Gt.shadow.camera.right=80;Gt.shadow.camera.top=80;Gt.shadow.camera.bottom=-80;Gt.shadow.camera.near=1;Gt.shadow.camera.far=220;Gt.shadow.bias=-5e-4;Gt.shadow.normalBias=.02;St.add(Gt);St.add(Gt.target);const om=new Am(10335954,0,1,2);St.add(om);const am=new URLSearchParams(window.location.search);function nS(n){const e=Number(n);return Number.isFinite(e)?Math.floor(Math.abs(e))>>>0:null}function UN(){try{const n=new Uint32Array(2);return crypto.getRandomValues(n),n[0]*4096+(n[1]>>>20)>>>0}catch{return Math.floor(Math.random()*4294967296)>>>0}}const Rv=nS(am.get("seed"));Rv!==null&&du(Rv);Vy(St);gw(St,Ue);T_(St);FP(St,Ue);v_(to());const na=am.get("mobile")==="1"||am.get("mode")==="mobile";na&&document.body.classList.add("mobile-mode");let Sr=!1;const Lv={shadows:!0,shadowQuality:1024,pixelRatio:1,lightingQuality:"high",brightness:1,showCoordinates:!1};let xt;try{const n=JSON.parse(localStorage.getItem("webminecraft-settings")||"null");xt={...Lv,...n&&typeof n=="object"?n:{}}}catch{xt={...Lv}}function Ds(){try{localStorage.setItem("webminecraft-settings",JSON.stringify(xt))}catch{}}function kN(){return xt.lightingQuality==="performance"?{sun:2.7,sky:1.1,ambientFloor:.12,undergroundSun:.05}:xt.lightingQuality==="balanced"?{sun:3,sky:1.25,ambientFloor:.09,undergroundSun:.035}:{sun:3.35,sky:1.35,ambientFloor:.06,undergroundSun:.02}}function Ns(){mn.shadowMap.enabled=xt.shadows,Gt.castShadow=xt.shadows,Gt.shadow.mapSize.width=xt.shadowQuality,Gt.shadow.mapSize.height=xt.shadowQuality,mn.setPixelRatio(Math.min(xt.pixelRatio,1.5)),mn.toneMapping=iu,mn.shadowMap.type=Wa,mn.toneMappingExposure=.9+xt.brightness*.35;for(const n of St.children)n.isMesh&&(n.castShadow=xt.shadows,n.receiveShadow=xt.shadows);Dg()}function Iv(n,e,t){const i=Be.clamp((t-n)/(e-n),0,1);return i*i*(3-2*i)}function Dg(){const n=Ue.position.y,e=1-Iv(-1,8,n),t=1-Iv(-24,-1,n),i=BC(Ue.position.x,Ue.position.y,Ue.position.z),r=kN(),o=Be.lerp(1,r.undergroundSun,e),a=Be.lerp(1,r.ambientFloor,e),c=Be.lerp(1,.62,t)*(.9+xt.brightness*.35)*(i?.68:1);Gt.intensity=r.sun*o*(i?.55:1),tS.intensity=r.sky*a*(i?.62:1),om.intensity=e*(.08+(1-t)*.08),om.position.set(Ue.position.x,Ue.position.y+1,Ue.position.z),mn.toneMappingExposure=c,i?(St.background.lerpColors(Ha,Cv,.98),St.fog.color.lerpColors(Ha,Cv,.98),St.fog.near=2.5,St.fog.far=30):(St.background.lerpColors(Ha,Av,e*.86),St.fog.color.lerpColors(Ha,Av,e*.9),St.fog.near=Be.lerp(40,8,e),St.fog.far=Be.lerp(120,55,e))}Ns();const _s=document.getElementById("mainMenu");document.getElementById("playButton");const Pv=document.getElementById("multiplayerButton"),Dv=document.getElementById("menuSettingsButton"),is=document.getElementById("seedMenu"),Yr=document.getElementById("seedInput"),Nv=document.getElementById("seedTitle"),Fv=document.getElementById("seedSubtitle"),li=document.getElementById("seedLinkStatus"),Uv=document.getElementById("copySeedButton"),kv=document.getElementById("copyWorldLinkButton"),sm=document.getElementById("openWorldButton"),Bv=document.getElementById("openSeedButton"),Qd=document.getElementById("mobileModeButton"),eu=document.getElementById("settingsButton"),Ss=document.getElementById("settingsMenu"),xp=document.getElementById("closeSettings"),bp=document.getElementById("settingsCloseTop"),Ov=document.getElementById("menuUpdates"),zv=document.getElementById("crosshair"),Hv=document.getElementById("hotbar"),Ms=document.createElement("div");Ms.id="coordinatesHud";Ms.setAttribute("aria-live","polite");Ms.textContent="X: 0  Y: 0  Z: 0";document.body.appendChild(Ms);function Ng(){const n=Sr&&xt.showCoordinates===!0&&Ss?.style.display!=="flex";Ms.style.display=n?"block":"none",n&&(Ms.textContent="X: "+Math.floor(Ue.position.x)+"  Y: "+Math.floor(Ue.position.y)+"  Z: "+Math.floor(Ue.position.z))}const Yc=document.getElementById("showCoordinatesToggle");Yc&&(Yc.checked=xt.showCoordinates===!0,Yc.addEventListener("change",()=>{xt.showCoordinates=Yc.checked,Ds(),Ng()}));setInterval(Ng,100);function Fg(){Ss&&(Ss.style.display="flex",document.exitPointerLock?.())}function Gl(){Ss&&(Ss.style.display="none",Sr&&!na&&iS())}function iS(){Sr&&!na&&document.pointerLockElement!==document.body&&document.body.requestPointerLock?.()}function BN(n){const e=new URL(window.location.href);n?e.searchParams.set("mobile","1"):e.searchParams.delete("mobile"),e.searchParams.delete("mode"),window.location.href=e.toString()}function rS(n){const e=n?"":"none";zv&&(zv.style.display=e),Hv&&(Hv.style.display=e),eu&&(eu.style.display=e),Ov&&(Ov.style.display=n?"block":"none"),Yo&&(Yo.style.display=e),Ng()}function ON(){const n=vt();for(let e=0;e<700;e++){const t=Math.floor(Math.random()*97)-48,i=Math.floor(Math.random()*97)-48;for(let r=70;r>=-31;r--){if(Pe(t,r,i)!==n.GRASS||Pe(t,r+1,i)!==n.AIR||Pe(t,r+2,i)!==n.AIR)continue;let o=!0;for(let a=-1;a<=1&&o;a++)for(let s=-1;s<=1;s++){if(a===0&&s===0)continue;const l=Pe(t+a,r,i+s);if(l!==n.GRASS&&l!==n.DIRT){o=!1;break}}if(o)return{x:t+.5,y:r+.5+1.8,z:i+.5};break}}for(let e=-16;e<=16;e++)for(let t=-16;t<=16;t++)for(let i=60;i>=-31;i--)if(Pe(e,i,t)===n.GRASS&&!(Pe(e,i+1,t)!==n.AIR||Pe(e,i+2,t)!==n.AIR))return{x:e+.5,y:i+.5+1.8,z:t+.5};return{x:.5,y:80,z:.5}}function zN(){const n=ON();Ue.up.set(0,1,0),Ue.position.set(n.x,n.y,n.z);const e=Math.random()*Math.PI*2;return Jm(e,0),Ue.rotation.order="YXZ",Ue.rotation.set(0,e,0),Ue.updateMatrixWorld(!0),!0}function HN(n="create"){if(!is||Sr)return;const e=n==="create"?UN():to();Nv&&(Nv.textContent=n==="create"?"Create World":"Open World"),Fv&&(Fv.textContent=n==="create"?"Your new world seed is below. Copy it to share the exact same world later.":"Enter a seed number to return to the exact same world."),Yr&&(Yr.value=String(e),Yr.focus(),Yr.select()),li&&(li.textContent=""),is.style.display="flex",is.setAttribute("aria-hidden","false")}function oS(){is&&(is.style.display="none",is.setAttribute("aria-hidden","true"))}function Ug(){const n=nS(Yr?.value?.trim());return n===null?(li&&(li.textContent="Enter a valid seed number."),Yr?.focus(),null):n}function WN(n){const e=new URL(window.location.href);e.searchParams.set("seed",String(n)),na?e.searchParams.set("mobile","1"):e.searchParams.delete("mobile"),window.history.replaceState({},"",e.toString())}async function aS(n){try{return await navigator.clipboard.writeText(n),!0}catch{const e=document.createElement("textarea");e.value=n,e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select();let t=!1;try{t=document.execCommand("copy")}catch{}return e.remove(),t}}function sS(n){Lw(),du(n),Vy(St),gw(St,Ue),T_(St),v_(n),WN(n),zN(),Sr=!0,oS(),_s&&(_s.style.display="none"),rS(!1),iS(),nP(n).catch(e=>console.warn("World persistence load failed:",e))}HI({onOpenWorld:sS});Pv&&Pv.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation();try{const{openMultiplayerMenu:e}=await dn(async()=>{const{openMultiplayerMenu:t}=await Promise.resolve().then(()=>VR);return{openMultiplayerMenu:t}},void 0);e()}catch(e){console.error("Failed to open multiplayer menu:",e)}});Bv&&Bv.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),HN("open")});Uv&&Uv.addEventListener("click",async()=>{const n=Ug();n!==null&&(await aS(String(n))?li&&(li.textContent="Seed copied!"):li&&(li.textContent="Could not copy automatically."))});kv&&kv.addEventListener("click",async()=>{const n=Ug();if(n===null)return;const e=new URL(window.location.href);e.searchParams.set("seed",String(n)),na?e.searchParams.set("mobile","1"):e.searchParams.delete("mobile"),await aS(e.toString())?li&&(li.textContent="World link copied!"):li&&(li.textContent="Could not copy automatically.")});sm&&sm.addEventListener("click",()=>{const n=Ug();n!==null&&sS(n)});Yr&&Yr.addEventListener("keydown",n=>{n.key==="Enter"&&sm?.click(),n.key==="Escape"&&oS()});Dv&&Dv.addEventListener("click",Fg);Qd&&Qd.addEventListener("click",()=>BN(!na));eu&&eu.addEventListener("pointerdown",n=>{n.preventDefault(),n.stopPropagation(),Fg()});xp&&(xp.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),Gl()}),xp.addEventListener("pointerdown",n=>{n.preventDefault(),n.stopPropagation(),Gl()}));bp&&(bp.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),Gl()}),bp.addEventListener("pointerdown",n=>{n.preventDefault(),n.stopPropagation(),Gl()}));document.addEventListener("keydown",n=>{n.code==="Escape"&&(Ss?.style.display==="flex"?Gl():Sr&&setTimeout(Fg,0))});Qd&&(Qd.textContent=na?"Desktop Mode":"Mobile Mode");const Kc=document.getElementById("shadowsToggle"),Zc=document.getElementById("shadowQuality"),Jc=document.getElementById("pixelQuality"),jc=document.getElementById("lightingQuality"),Qc=document.getElementById("brightnessControl");Kc&&(Kc.checked=xt.shadows,Kc.addEventListener("change",()=>{xt.shadows=Kc.checked,Ds(),Ns()}));Zc&&(Zc.value=String(xt.shadowQuality),Zc.addEventListener("change",()=>{xt.shadowQuality=Number(Zc.value),Ds(),Ns()}));Jc&&(Jc.value=String(xt.pixelRatio),Jc.addEventListener("change",()=>{xt.pixelRatio=Number(Jc.value),Ds(),Ns()}));jc&&(jc.value=xt.lightingQuality,jc.addEventListener("change",()=>{xt.lightingQuality=jc.value,Ds(),Ns()}));Qc&&(Qc.value=String(xt.brightness),Qc.addEventListener("input",()=>{xt.brightness=Number(Qc.value),Ds(),Ns()}));Jy();gP(St,Ue);const Yo=document.createElement("div");Yo.id="performanceHud";Yo.style.cssText="position:fixed;top:12px;left:12px;padding:6px 8px;background:rgba(0,0,0,.45);color:white;font:12px monospace;line-height:1.4;pointer-events:none;z-index:15;border-radius:5px;";Yo.textContent="FPS: -- | Chunks: -- | Calls: --";document.body.appendChild(Yo);rS(!0);window.addEventListener("resize",()=>{Ue.aspect=window.innerWidth/window.innerHeight,Ue.updateProjectionMatrix(),mn.setSize(window.innerWidth,window.innerHeight)});const ti={x:0,y:0,targetX:0,targetY:0};window.addEventListener("pointermove",n=>{Sr||!_s||_s.style.display==="none"||(ti.targetX=Be.clamp((n.clientX/Math.max(window.innerWidth,1)-.5)*2,-1,1),ti.targetY=Be.clamp((n.clientY/Math.max(window.innerHeight,1)-.5)*2,-1,1))});window.addEventListener("pointerleave",()=>{ti.targetX=0,ti.targetY=0});let lm=performance.now(),vp=lm,yp=0,Wv=Ue.position.x,Gv=Ue.position.z;const Vv=8,Xv=Math.random()*Math.PI*2,qv=48+Math.random()*112,$v=new R(Math.round(Math.cos(Xv)*qv/16)*16,10,Math.round(Math.sin(Xv)*qv/16)*16),Ut={position:new R($v.x,16,$v.z),targetY:16,angle:Math.random()*Math.PI*2,speed:.035,swayX:0,swayY:0,safeHeight:null};function GN(){const n=Math.floor(Ut.position.x),e=Math.floor(Ut.position.z),t=vt();for(let i=94;i>=-31;i--)if(Pe(n,i,e)!==t.AIR)return i+4.5;return 32}function VN(n){if(Sr||!_s||_s.style.display==="none")return;Ut.angle+=Ut.speed*n,ti.x=Be.lerp(ti.x,ti.targetX,Math.min(n*2.5,1)),ti.y=Be.lerp(ti.y,ti.targetY,Math.min(n*2.5,1)),Ut.swayX=Be.lerp(Ut.swayX,ti.x,Math.min(n*1.8,1)),Ut.swayY=Be.lerp(Ut.swayY,ti.targetY,Math.min(n*1.8,1)),Xy(Ut.position,Ue),Ut.safeHeight===null&&(Ut.safeHeight=GN(),Ut.position.y=Math.max(20,Ut.safeHeight),Ut.targetY=Math.max(16,Ut.position.y-10)),Ue.position.copy(Ut.position);const e=40,t=Ut.swayX*.12,i=Ut.swayY*.055,r=Ut.angle+t,o=new R(Ut.position.x+Math.sin(r)*e,Ut.targetY-i*e,Ut.position.z+Math.cos(r)*e);Ue.up.set(0,1,0),Ue.lookAt(o),Dg()}function XN(){const n=Ue.position.x-Wv,e=Ue.position.z-Gv;n*n+e*e<Vv*Vv||(Wv=Ue.position.x,Gv=Ue.position.z,Gt.target.position.set(Ue.position.x,Ue.position.y,Ue.position.z),Gt.position.set(Ue.position.x+45,Ue.position.y+85,Ue.position.z+30),Gt.target.updateMatrixWorld())}function lS(){requestAnimationFrame(lS);const n=performance.now(),e=Math.min((n-lm)/1e3,.05);if(lm=n,Sr?(W3(Ue,St,e),Xy(Ue.position,Ue),XN(),Dg()):VN(e),mn.render(St,Ue),yp++,n-vp>=500){const t=Math.round(yp*1e3/(n-vp)),i=ZC();Yo.textContent=`FPS: ${t} | Chunks: ${i.loadedChunks} | Calls: ${mn.info.render.calls}`,yp=0,vp=n}}lS();document.getElementById("menuUpdates");const Uo=document.getElementById("mainMenu"),rs=document.getElementById("seedMenu"),wp="webminecraft-game-version",_p=["v1.0","v1.1","v1.2","Beta"],cS="webminecraft-news-seen-v2",qN=[{version:"LATEST • World Saves",title:"Separate World Saves Fixed",body:"Each saved world now keeps its own block data. Creating or opening another world no longer overwrites the first world's saved blocks."},{version:"LATEST • Welcome",title:"New Player Welcome Screen",body:"New players now get a centered welcome screen with tabs explaining WebMinecraftT, setup, account information, and gameplay before they start playing."},{version:"LATEST • News",title:"New News Center",body:"The main menu news feed is now opened from a dedicated News button. All update notes are shown in one scrollable list, with details available for every update."},{version:"LATEST • Saved Worlds",title:"Saved Worlds",body:"Singleplayer now has a proper saved-world list with world names, seeds, details, creation dates, and Play controls."},{version:"LATEST • Drive",title:"Google Drive World Backup",body:"Saved worlds can be backed up to Google Drive and discovered again when loading the saved-world screen."},{version:"BETA • Multiplayer",title:"WebMinecraftT Beta",body:"WebMinecraftT is now in beta. Multiplayer servers, shared worlds, chat, private servers, mobile support, and more are being actively improved."},{version:"BETA • Private Servers",title:"Private Servers",body:"Private servers stay visible in the server list. Players can select a private server and enter its private code before joining."},{version:"BETA • Shared World",title:"Live World Changes",body:"Breaking and placing blocks can sync between players in the same multiplayer server so everyone can build together."},{version:"BETA • Chat",title:"Server Chat",body:"Multiplayer includes in-game chat with join messages so players can talk while they play together."},{version:"v1.2 • Server Making",title:"Make Your Own Server",body:"Players can enter a new server name when joining to create their own multiplayer server. The first player becomes the server owner."},{version:"v1.1 • World Seeds",title:"World Seeds",body:"World generation uses the world seed for reproducible terrain, caves, biomes, trees, water, and world spawning."},{version:"v1.1 • Seed Links",title:"Shareable Seed Links",body:"Copy a world link with the seed attached so another player can open the same generated world."},{version:"v1.1 • Settings",title:"Graphics Settings",body:"Graphics, shadow quality, lighting quality, brightness, and render scale can be adjusted from the settings screen."},{version:"v1.0 • Mobile",title:"Mobile Mode",body:"Mobile Mode provides touch-friendly controls and a layout designed for smaller screens."}];function dS(){if(document.getElementById("newsButtonStyles"))return;const n=document.createElement("style");n.id="newsButtonStyles",n.textContent=`
        #menuUpdates{display:none!important}
        #newsButton{position:fixed !important;left:28px !important;bottom:28px !important;width:118px !important;margin:0 !important;z-index:1000 !important;display:block !important;pointer-events:auto !important}
        #newsButton.newsHasUnread::after{content:"";position:absolute;top:7px;right:7px;width:10px;height:10px;border-radius:50%;background:#e33;border:2px solid #4b0000;box-shadow:0 0 0 1px rgba(0,0,0,.65),0 0 8px rgba(255,40,40,.55)}
        #newsCenter{position:fixed;inset:0;display:none;background:linear-gradient(180deg,#1b1b1b,#111);z-index:240;color:#fff;overflow:hidden}
        #newsPanel{position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;display:grid;grid-template-columns:minmax(260px,31vw) minmax(0,1fr);grid-template-rows:100%;background:#1a1a1a;overflow:hidden}
        #newsSidebar{min-width:0;min-height:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#242424,#191919);border-right:2px solid #0b0b0b}
        #newsHeader{flex:0 0 auto;padding:28px 24px 22px;background:linear-gradient(180deg,#343434,#292929);border-bottom:2px solid #0f0f0f}
        #newsTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(26px,2.5vw,38px);text-shadow:3px 3px 0 #000}
        #newsSubtitle{margin:7px 0 0;color:#aaa;font-size:13px;line-height:1.4}
        #newsList{flex:1 1 auto;min-height:0;padding:14px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:#6f6f6f #151515}
        #newsList::-webkit-scrollbar{width:13px}
        #newsList::-webkit-scrollbar-track{background:#151515}
        #newsList::-webkit-scrollbar-thumb{background:#686868;border:2px solid #151515}
        #newsList::-webkit-scrollbar-thumb:hover{background:#818181}
        .newsItem{display:block;width:100%;margin:0 0 10px;padding:15px;text-align:left;background:#3b3b3b;border:2px solid #171717;border-top-color:#777;border-left-color:#777;color:#fff;cursor:pointer}
        .newsItem:hover,.newsItem:focus-visible{filter:brightness(1.1);outline:2px solid rgba(255,255,255,.65);outline-offset:1px}
        .newsItem:last-child{margin-bottom:0}
        .newsItemVersion{color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:1px 1px 0 #111}
        .newsItemTitle{margin-top:5px;font-family:"MinecraftFont",monospace;font-size:16px;text-shadow:2px 2px 0 #111}
        .newsItemBody{margin-top:6px;color:#cfcfcf;font-size:12px;line-height:1.45}
        #newsClose{width:calc(100% - 28px);margin:14px 14px 18px;min-height:44px;flex:0 0 auto}
        #newsReading{min-width:0;min-height:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#2b2b2b,#202020)}
        #newsReadingHeader{flex:0 0 auto;padding:26px 34px 20px;border-bottom:2px solid #111;background:#2e2e2e}
        #newsReadingVersion{margin-bottom:8px;color:#9dcc76;font-family:"MinecraftFont",monospace;font-size:14px;text-shadow:2px 2px 0 #111}
        #newsReadingTitle{margin:0;font-family:"MinecraftFont",monospace;font-size:clamp(28px,3vw,44px);line-height:1.15;text-shadow:3px 3px 0 #000}
        #newsReadingBody{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:28px 34px 60px;color:#d9d9d9;font-size:16px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;scrollbar-width:thin;scrollbar-color:#777 #171717}
        #newsReadingBody::-webkit-scrollbar{width:14px}
        #newsReadingBody::-webkit-scrollbar-track{background:#171717}
        #newsReadingBody::-webkit-scrollbar-thumb{background:#707070;border:2px solid #171717;border-radius:7px}
        #newsReadingBody::-webkit-scrollbar-thumb:hover{background:#898989}
        @media(max-width:700px){
            #newsButton{left:12px !important;bottom:18px !important;width:calc(50vw - 18px) !important}
            #newsPanel{grid-template-columns:1fr;grid-template-rows:44% 56%}
            #newsSidebar{border-right:0;border-bottom:2px solid #0b0b0b}
            #newsHeader{padding:16px 16px 12px}
            #newsList{padding:10px}
            .newsItem{padding:12px;margin-bottom:8px}
            .newsItemBody{font-size:11px}
            #newsClose{margin:8px 12px 10px;width:calc(100% - 24px)}
            #newsReadingHeader{padding:18px 18px 14px}
            #newsReadingBody{padding:18px 18px 34px;font-size:14px;line-height:1.6}
        }
    `,document.head.appendChild(n)}function Yv(n){const e=document.getElementById("newsButton");e&&e.classList.toggle("newsHasUnread",n);try{localStorage.setItem(cS,n?"0":"1")}catch{}}function $N(){try{return localStorage.getItem(cS)==="1"}catch{return!1}}function YN(){if(document.getElementById("newsButton"))return;dS();const n=document.createElement("button");n.id="newsButton",n.className="menuButton",n.type="button",n.textContent="News",document.body.appendChild(n);const e=document.createElement("div");e.id="newsCenter",e.setAttribute("aria-hidden","true"),e.innerHTML=`
        <div id="newsPanel" role="dialog" aria-modal="true" aria-labelledby="newsTitle">
            <aside id="newsSidebar">
                <header id="newsHeader"><h2 id="newsTitle">News & Updates</h2><p id="newsSubtitle">The latest WebMinecraftT changes</p></header>
                <div id="newsList"></div>
                <button id="newsClose" class="menuButton" type="button">Back to Main Menu</button>
            </aside>
            <section id="newsReading">
                <header id="newsReadingHeader"><div id="newsReadingVersion">Open a patch note</div><h2 id="newsReadingTitle">Open a patch note</h2></header>
                <div id="newsReadingBody">Select a patch note from the list to view its full details.</div>
            </section>
        </div>`,document.body.appendChild(e);const t=e.querySelector("#newsList"),i=e.querySelector("#newsReadingVersion"),r=e.querySelector("#newsReadingTitle"),o=e.querySelector("#newsReadingBody"),a=c=>{i.textContent=c.version,r.textContent=c.title,o.textContent=c.body};qN.forEach((c,d)=>{const f=document.createElement("button");f.className="newsItem",f.type="button",f.innerHTML=`<div class="newsItemVersion">${Sp(c.version)}</div><div class="newsItemTitle">${Sp(c.title)}</div><div class="newsItemBody">${Sp(c.body)}</div>`,f.addEventListener("click",u=>{u.stopPropagation(),a(c)}),t.appendChild(f),d===0&&a(c)});const s=()=>{e.style.display="none",e.setAttribute("aria-hidden","true")},l=c=>{c?.preventDefault(),c?.stopPropagation(),e.style.display="block",e.setAttribute("aria-hidden","false"),Yv(!1),t.scrollTop=0};n.addEventListener("click",l),e.querySelector("#newsClose").addEventListener("click",s),document.addEventListener("keydown",c=>{c.code==="Escape"&&e.style.display==="block"&&s()},!0),Yv(!$N())}function Sp(n){return String(n??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function KN(){if(document.getElementById("pauseMenu"))return;const n=document.createElement("style");n.id="pauseMenuStyles",n.textContent='#pauseMenu{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);color:#fff;z-index:500;pointer-events:auto}#pausePanel{width:min(420px,90vw);padding:30px 28px 26px;background:#262626;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:6px 6px 0 rgba(0,0,0,.6);text-align:center}#pauseTitle{margin:0 0 8px;font-family:"MinecraftFont",monospace;font-size:34px;text-shadow:3px 3px 0 #000}#pauseSeed{min-height:20px;margin:0 0 20px;color:#999;font:12px Arial,sans-serif;overflow-wrap:anywhere}#pauseButtons{display:grid;gap:9px}.pauseButton{width:100%;min-height:46px;padding:9px 12px;border:2px solid #111;border-top-color:#888;border-left-color:#888;background:linear-gradient(#696969,#505050);color:#fff;font-family:"MinecraftFont",monospace;font-size:13px;cursor:pointer;text-shadow:2px 2px 0 #222}#pauseResume{background:linear-gradient(#6d8d4e,#526f3c)}#pauseReturn{background:linear-gradient(#5d5d5d,#444)}',document.head.appendChild(n);const e=document.createElement("div");e.id="pauseMenu",e.setAttribute("aria-hidden","true"),e.innerHTML='<div id="pausePanel"><h2 id="pauseTitle">Game Paused</h2><div id="pauseSeed"></div><div id="pauseButtons"><button id="pauseResume" class="pauseButton" type="button">Resume Game</button><button id="pauseSettings" class="pauseButton" type="button">Settings</button><button id="pauseMobile" class="pauseButton" type="button">Mobile Mode</button><button id="pauseReturn" class="pauseButton" type="button">Return to Main Menu</button></div></div>',document.body.appendChild(e);const t=()=>!!(Uo&&Uo.style.display==="none");let i=!1;const r=a=>{a?.preventDefault(),i=!1,e.style.display="none",e.setAttribute("aria-hidden","true"),t()&&document.body.requestPointerLock?.()},o=a=>{a?.preventDefault(),a?.stopPropagation(),t()&&(i=!0,e.querySelector("#pauseSeed").textContent=`Seed: ${to()}`,e.style.display="flex",e.setAttribute("aria-hidden","false"),document.exitPointerLock?.(),e.querySelector("#pauseResume").focus())};e.querySelector("#pauseResume").addEventListener("click",r),e.querySelector("#pauseSettings").addEventListener("click",a=>{a.preventDefault(),e.style.display="none",e.setAttribute("aria-hidden","true"),document.getElementById("settingsMenu")?.style.setProperty("display","flex"),document.exitPointerLock?.(),i=!1}),e.querySelector("#pauseMobile").addEventListener("click",()=>{const a=new URL(window.location.href);a.searchParams.get("mobile")==="1"||a.searchParams.get("mode")==="mobile"?(a.searchParams.delete("mobile"),a.searchParams.delete("mode")):(a.searchParams.set("mobile","1"),a.searchParams.delete("mode")),window.location.href=a.toString()}),e.querySelector("#pauseReturn").addEventListener("click",()=>window.location.reload()),document.addEventListener("keydown",a=>{a.code==="Escape"&&(i?r(a):t()&&o(a))},!0),document.getElementById("settingsButton")?.addEventListener("pointerdown",a=>{t()&&(a.preventDefault(),a.stopImmediatePropagation(),o(a))},!0),window.webminecraftPause={open:o,close:r,isOpen:()=>i}}function ZN(){const n=document.getElementById("backSeedButton");!n||n.dataset.backHookInstalled||(n.dataset.backHookInstalled="1",n.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),rs&&(rs.style.display="none",rs.setAttribute("aria-hidden","true")),Uo&&(Uo.style.display="flex"),window.setTimeout(()=>window.location.reload(),80)}))}function JN(){if(document.getElementById("gameVersionPicker"))return;const n=document.createElement("style");n.id="gameVersionStyles",n.textContent='#gameVersionButton{position:fixed;right:10px;bottom:8px;min-width:88px;height:34px;padding:5px 10px;border:2px solid #111;border-top-color:#9a9a9a;border-left-color:#9a9a9a;background:linear-gradient(#666,#4d4d4d);color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-shadow:2px 2px 0 #222;cursor:pointer;z-index:97;box-shadow:inset 2px 2px 0 rgba(255,255,255,.12),0 2px 0 rgba(0,0,0,.7)}#gameVersionPicker{position:fixed;right:10px;bottom:48px;width:160px;padding:6px;background:#191919;border:2px solid #111;border-top-color:#777;border-left-color:#777;box-shadow:4px 4px 0 rgba(0,0,0,.55);z-index:97;display:none}.gameVersionOption{display:block;width:100%;min-height:34px;margin:3px 0;border:2px solid #111;border-top-color:#777;border-left-color:#777;background:#3d3d3d;color:#fff;font-family:"MinecraftFont",monospace;font-size:11px;text-align:left;padding:7px 9px;cursor:pointer;text-shadow:2px 2px 0 #111}.gameVersionOption.active{background:#5e5e5e}',document.head.appendChild(n);const e=document.createElement("button");e.id="gameVersionButton",e.type="button";const t=document.createElement("div");t.id="gameVersionPicker";let i=_p.includes(localStorage.getItem(wp))?localStorage.getItem(wp):_p[0];_p.forEach(o=>{const a=document.createElement("button");a.className="gameVersionOption",a.type="button",a.dataset.version=o,a.textContent=o,a.addEventListener("click",()=>{i=o,localStorage.setItem(wp,o),window.webminecraftVersion=o,r(),t.style.display="none"}),t.appendChild(a)});const r=()=>{e.textContent=i,t.querySelectorAll(".gameVersionOption").forEach(o=>o.classList.toggle("active",o.dataset.version===i))};e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),t.style.display=t.style.display==="block"?"none":"block"}),document.addEventListener("click",o=>{o.target!==e&&!t.contains(o.target)&&(t.style.display="none")}),document.addEventListener("keydown",o=>{o.code==="Escape"&&(t.style.display="none")}),document.body.append(e,t),window.webminecraftVersion=i,r(),Uo&&new MutationObserver(()=>{const a=getComputedStyle(Uo).display!=="none";e.style.display=a?"block":"none",a||(t.style.display="none")}).observe(Uo,{attributes:!0,attributeFilter:["style","class"]})}dS();YN();KN();ZN();JN();if(rs){let n=!1;new MutationObserver(()=>{const t=getComputedStyle(rs).display!=="none";t&&!n?(Gy(),n=!0):t||(n=!1)}).observe(rs,{attributes:!0,attributeFilter:["style","class"]})}export{dn as _,VR as m};
