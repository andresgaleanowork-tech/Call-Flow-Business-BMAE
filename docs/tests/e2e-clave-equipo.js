#!/usr/bin/env node
/* E2E «Clave de equipo cifrada» v3.8.0 — flujo completo offline:
   A) el ADMIN cifra y "publica" (PUT capturado, sin red)
   B) un MÓVIL nuevo entra con ID + contraseña del equipo contra ese blob
   C) contraseña mala → no entra · D) rotación silenciosa · E) sin blob → tarjeta manual */
const fs=require('fs');
const {webcrypto}=require('crypto');
const {TextEncoder,TextDecoder}=require('util');
const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
const vc=new VirtualConsole();const errs=[];
vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);if(!/parse CSS|Could not load|Not implemented/.test(m))errs.push(m.split(String.fromCharCode(10))[0]);});

const SRC_I=fs.readFileSync('index.html','utf8');
const SRC_A=fs.readFileSync('admin.html','utf8');
const ok=[],ko=[];
const step=(x,m)=>{(x?ok:ko).push(m)};

/* — estáticas — */
step(SRC_I.includes('clave-equipo.json'),'E1: index conoce el blob público clave-equipo.json');
step(/function eqDescifra\(/.test(SRC_I)&&/AES-GCM/.test(SRC_I)&&/PBKDF2/.test(SRC_I)&&/250000/.test(SRC_I),'E2: motor de descifrado (AES-GCM + PBKDF2 ×250.000)');
step(SRC_I.includes('function eqRotar(')&&SRC_I.includes('cfb_eq_pass'),'E3: rotación silenciosa con contraseña guardada');
step(SRC_I.includes('cfbClaveEqManual')&&SRC_I.includes('cfbClaveEqVolver'),'E4: tarjeta de dos modos (equipo ⇄ clave larga)');
step(SRC_A.includes('window.eqPublicar=function')&&SRC_A.includes('WEB_REPO'),'E5: admin puede publicar');
step(/iterations:250000/.test(SRC_A)&&/getRandomValues/.test(SRC_A),'E6: cifrado del admin con salt+IV aleatorios');
step(/!eqState\.blob/.test(SRC_I)&&/cfbClaveEq/.test(SRC_I),'E7: sin blob el equipo no engaña (cae a manual)');

/* helpers JSDOM */
function jsdomIndex(semillas){
  const calls=[];
  const dom=new JSDOM(SRC_I,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
   beforeParse(w){
    w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder;
    Object.defineProperty(w,'crypto',{value:webcrypto});
    w.confirm=()=>true; w.alert=()=>{};
    if(semillas&&semillas.blob!==undefined) w._eqTest={blob:semillas.blob};
    w.fetch=(u,o)=>{ calls.push({met:(o&&o.method)||'GET',u:String(u)});
      const m=/(repos\/[^/]+\/[^/?]+)($|\?)/.exec(String(u));
      if(/\/contents\//.test(String(u))) return Promise.resolve({status:404,json:()=>Promise.resolve({})});
      if(m) return Promise.resolve({status:200,json:()=>Promise.resolve({full_name:m[1]})});
      return Promise.resolve({status:404,json:()=>Promise.resolve({})});
    };
   }});
  return {dom,w:dom.window,calls};
}
function dormir(ms,fn){ setTimeout(fn,ms); }

/* cifra con Node (simula el blob que publicaría el admin) */
async function cifrarConNode(txt,pass){
  const salt=webcrypto.getRandomValues(new Uint8Array(16));
  const iv=webcrypto.getRandomValues(new Uint8Array(12));
  const ik=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);
  const k=await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},ik,{name:'AES-GCM',length:256},false,['encrypt']);
  const buf=await webcrypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(txt));
  const b64=u=>Buffer.from(u).toString('base64');
  return {v:1,alg:'AES-GCM-256',kdf:{name:'PBKDF2',hash:'SHA-256',iter:250000,salt:b64(salt)},iv:b64(iv),data:b64(new Uint8Array(buf)),ts:new Date().toISOString(),by:'ana'};
}

(async()=>{
try{
 const TOKEN='github_pat_FIXTURE000111222333444555666777888999000111';
 const PASS='faro-mantel-luna-29';

 /* ══ A · el ADMIN publica (cifra en el navegador y sube) ══ */
 const callsA=[];
 const domA=new JSDOM(SRC_A,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
  beforeParse(w){
   w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder;
   Object.defineProperty(w,'crypto',{value:webcrypto});
   w.confirm=()=>true; w.alert=()=>{};
   w.fetch=(u,o)=>{ callsA.push({met:(o&&o.method)||'GET',u:String(u),body:o&&o.body});
     const us=String(u);
     if(/contents\/clave-equipo\.json/.test(us)&&(o&&o.method)==='PUT') return Promise.resolve({status:201,json:()=>Promise.resolve({content:{sha:'nuevo'}})});
     if(/contents\//.test(us)) return Promise.resolve({status:404,json:()=>Promise.resolve({})});
     if(/repos\/[^/]+\/[^/?]+(\?|$)/.test(us)) return Promise.resolve({status:200,json:()=>Promise.resolve({full_name:'x'})});
     return Promise.resolve({status:404,json:()=>Promise.resolve({})});
   };
  }});
 const wA=domA.window;
 wA.eval("localStorage.clear()");
 wA.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Ana',slug:'ana',admin:true,autorizado:true}))");
 wA.eval("document.getElementById('panel').style.display=''");
 wA.eval("document.getElementById('eqTok').value='"+TOKEN+"'");
 wA.eval("document.getElementById('eqPass').value='"+PASS+"';document.getElementById('eqPass2').value='"+PASS+"'");
 wA.eval("window.eqPublicar()");

 await new Promise(r=>setTimeout(r,1800));
 const put=callsA.find(c=>c.met==='PUT'&&/clave-equipo/.test(c.u));
 step(!!put,'F1: admin hace PUT de clave-equipo.json al repo de la web');
 step(/Call-Flow-Business-BMAE/.test(put?put.u:''),'F2: …al repo de la web público (no al de datos)');
 step(callsA.some(c=>/CFB-datos-equipo/.test(c.u))&&callsA.some(c=>/Call-Flow-Business-BMAE/.test(c.u)),'F3: validó la clave contra AMBOS repos antes de publicar');
 const msg=wA.eval("document.getElementById('eqPubMsg').textContent");
 step(/Publicada/.test(msg),'F4: mensaje de éxito al admin');

 /* el blob del PUT: ¿descifra con la contraseña dada? (compat Node→app) */
 let blobPublicado=null;
 if(put){
   blobPublicado=JSON.parse(Buffer.from(JSON.parse(put.body).content,'base64').toString('utf8'));
   step(blobPublicado.alg==='AES-GCM-256'&&blobPublicado.kdf&&blobPublicado.kdf.iter===250000,'F5: blob publicado bien formado (alg+kdf+iter)');
 }

 /* ══ B · móvil nuevo: ID + contraseña del equipo contra el blob del PUT ══ */
 const B=jsdomIndex({blob:blobPublicado});
 await new Promise(r=>setTimeout(r,300));
 const tarj=B.w.eval("document.getElementById('cfbGate').innerHTML");
 step(/cfbClaveEq/.test(tarj)&&/contraseña del equipo/.test(tarj),'F6: arranque con blob → tarjeta de contraseña del equipo (NO clave larga)');
 step(!/cfbClave\"/.test(tarj),'F7: la clave larga ni se muestra por defecto');
 wB=B.w;
 wB.eval("document.getElementById('cfbClaveEq').value='"+PASS+"';document.querySelector('#cfbGate form').onsubmit&&null;");
 wB.eval("(function(){var f=document.querySelector('#cfbGate form'); window.__r=window.cfbClaveEqOk(f);})()");
 await new Promise(r=>setTimeout(r,1800));
 step(wB.eval("localStorage.getItem('cfb_sync_token')")==='"'+TOKEN+'"','F8: contraseña buena → la CLAVE REAL queda guardada (descifrada del blob)');
 step(wB.eval("localStorage.getItem('cfb_eq_pass')")==='"'+PASS+'"','F9: contraseña del equipo guardada (servirá para rotaciones)');
 step(!/cfbClaveEq/.test(wB.eval("document.getElementById('cfbGate').innerHTML")),'F10: tras entrar ya no queda el formulario de contraseña');

 /* ══ C · contraseña mala ══ */
 const C=jsdomIndex({blob:blobPublicado});
 await new Promise(r=>setTimeout(r,300));
 C.w.eval("document.getElementById('cfbClaveEq').value='contraseña-equivocada';");
 C.w.eval("(function(){var f=document.querySelector('#cfbGate form'); window.cfbClaveEqOk(f);})()");
 await new Promise(r=>setTimeout(r,1800));
 step(C.w.eval("localStorage.getItem('cfb_sync_token')")===null,'F11: contraseña mala → NO se guarda clave');
 step(/Contraseña incorrecta/.test(C.w.eval("document.getElementById('cfbGateError').textContent")),'F12: error claro sin filtrar la buena');

 /* ══ D · rotación silenciosa: admin rotó; el móvil solo con contraseña guardada ══ */
 const TOKEN2='github_pat_NUEVA000111222333444555666777888999111222';
 const blob2=await cifrarConNode(TOKEN2,PASS);
 const D=jsdomIndex({blob:blob2});
 D.w.eval("localStorage.clear()");
 D.w.eval("localStorage.setItem('cfb_eq_pass',JSON.stringify('"+PASS+"'))");
 await new Promise(r=>setTimeout(r,500));
 /* dispara el arranque como si recargara tras la revocación */
 D.w.eval("(function(){\
   /* simula boot: sin token pero con pass guardada */\
   window.__rotada=null;\
   (function boot(){\
     /* localmente: llamar directo a través del boot ya ocurrido al parse → forzamos */\
   })();})()");
 /* el boot ya corrió al parse ANTES de fijar la pass; repetimos el escenario recargando: */
 const D2=jsdomIndex({blob:blob2});
 D2.w.eval("localStorage.setItem('cfb_eq_pass',JSON.stringify('"+PASS+"'))");
 D2.w.eval("location.reload&&null;");
 /* forzar el camino del boot con una nueva carga completa es caro; en su lugar invocamos eqRotar manual: */
 D2.w.eval("window.__rot=null; (function(){ /* a través de la API interna */ })()");
 D2.w.eval("(function(){ try{ (window.eqRotar||function(){})(function(ok){ window.__rot=ok; }); }catch(e){ window.__err=e.message; } })()");
 await new Promise(r=>setTimeout(r,1800));
 step(D2.w.eval("window.__rot")===true,'F13: rotación silenciosa funcionó (ok=true sin pedir nada)');
 step(D2.w.eval("localStorage.getItem('cfb_sync_token')")==='"'+TOKEN2+'"','F14: la clave NUEVA quedó guardada sola');

 /* ══ E · sin blob → tarjeta manual intacta (fallback v3.7) ══ */
 const E=jsdomIndex({blob:null});
 await new Promise(r=>setTimeout(r,300));
 step(/cfbClave\"/.test(E.w.eval("document.getElementById('cfbGate').innerHTML")),'F15: sin blob → tarjeta de clave larga (fallback)');

 /* ══ F · ENLACE DE ACCESO (v3.9): el comercial solo abre el enlace y pone su ID ══ */
 function jsdomIndexConUrl(url,blob){
   const calls=[];
   const dom=new JSDOM(SRC_I,{runScripts:'dangerously',url:url,virtualConsole:vc,
    beforeParse(w){
     Object.defineProperty(w,'crypto',{value:webcrypto});
     w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder;
     w.confirm=()=>true; w.alert=()=>{};
     if(blob!==undefined) w._eqTest={blob:blob};
     w.fetch=(u,o)=>{ calls.push({met:(o&&o.method)||'GET',u:String(u)});
       if(/\/contents\//.test(String(u))) return Promise.resolve({status:404,json:()=>Promise.resolve({})});
       if(/repos\/[^/]+\/[^/?]+(\?|$)/.test(String(u))) return Promise.resolve({status:200,json:()=>Promise.resolve({full_name:'x'})});
       return Promise.resolve({status:404,json:()=>Promise.resolve({})});
     };
    }});
   return {dom,w:dom.window};
 }
 /* F16-18: enlace BUENO → entra sin escribir nada y limpia la barra */
 const F=jsdomIndexConUrl('https://local.test/index.html#eq='+encodeURIComponent(PASS),blobPublicado);
 await new Promise(r=>setTimeout(r,1800));
 step(F.w.eval("localStorage.getItem('cfb_sync_token')")==='"'+TOKEN+'"','F16: con solo ABRIR el enlace, la clave quedó guardada');
 step(F.w.eval("localStorage.getItem('cfb_eq_pass')")==='"'+PASS+'"','F17: contraseña guardada para futuras rotaciones (sin haberla tecleado)');
 step(F.w.eval("location.hash").indexOf('eq=')===-1,'F18: la contraseña desapareció de la barra de direcciones');
 step(!/cfbClaveEq/.test(F.w.eval("document.getElementById('cfbGate').innerHTML")),'F19: nunca se le mostró un formulario de contraseña');
 /* F20: enlace con contraseña CADUCADA → aviso claro, sin fuga */
 const F2=jsdomIndexConUrl('https://local.test/index.html#eq='+encodeURIComponent('contraseña-vieja-ko'),blobPublicado);
 await new Promise(r=>setTimeout(r,1800));
 step(F2.w.eval("localStorage.getItem('cfb_sync_token')")===null,'F20: enlace caducado → NO se guarda clave');
 step(/ya no sirve|caduc/.test(F2.w.eval("document.getElementById('cfbGateError').textContent")),'F21: aviso «pide uno nuevo» (no expone nada)');
 /* F22: el admin CREA el enlace (clipboard capturado) */
 let copiado='';
 const domL=new JSDOM(SRC_A,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
  beforeParse(w){
   Object.defineProperty(w,'crypto',{value:webcrypto});
   w.TextEncoder=TextEncoder; w.TextDecoder=TextDecoder;
   w.confirm=()=>true; w.alert=()=>{};
   w.navigator.clipboard={writeText:t=>{copiado=t;return Promise.resolve();}};
   w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})});
  }});
 const wL=domL.window;
 wL.eval("localStorage.clear()");
 wL.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Ana',slug:'ana',admin:true,autorizado:true}))");
 wL.eval("document.getElementById('panel').style.display=''");
 wL.eval("document.getElementById('eqPass').value='"+PASS+"'");
 wL.eval("window.eqEnlaceCopiar()");
 step(copiado.indexOf('#eq='+encodeURIComponent(PASS))>-1&&copiado.indexOf('index.html')>-1,'F22: admin genera el enlace con la contraseña en el #fragmento');

 console.log('errs:',errs.join('|')||'(ninguno)');
 console.log('OK:',ok.length); ko.forEach(m=>console.log('✘',m));
 console.log(ko.length===0&&errs.length===0?'✅ E2E CLAVE-EQUIPO VERDE ('+ok.length+')':'❌ fallos');
 process.exit(ko.length||errs.length?1:0);
}catch(e){ console.log('EXC',e.stack); process.exit(1); }
})();
