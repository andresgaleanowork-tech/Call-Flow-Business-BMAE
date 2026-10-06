function LSg(k,d){ try{ var v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }
function LSs(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function $(id){ return document.getElementById(id); }
function toast(m){ try{ if(typeof guiToast==='function') guiToast(m,true); else if(typeof toast==='function'&&toast!==arguments.callee){} else alert(m); }catch(e){ alert(m); } }

/* ═══ B1 · badge de versión en el pie ═══ */
function pinBadge(){
  var fs=document.querySelectorAll('footer');
  for(var i=0;i<fs.length;i++){
    var f=fs[i]; if(f.getAttribute('data-cfb-badge')) continue;
    f.setAttribute('data-cfb-badge','1');
    var s=document.createElement('span'); s.className='cfb-badge';
    s.textContent='· Call Flow Business · v'+VERSION+' · guion '+GUIAFECHA;
    f.appendChild(s);
  }
}

/* ═══ A1 · notificador de versión (silencioso sin red o en file://) ═══ */
window.CFB_UPDATE_URL=window.CFB_UPDATE_URL||'https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/version.json';   // ACTIVAR (FABRICA v2.3): URL pública del version.json de vuestra página (p. ej. https://USUARIO.github.io/REPO/version.json) → EXE/APK oirán el aviso de nuevas versiones
function checkVersion(){
  if(window.CFB_NO_VERCHECK) return;
  var url=window.CFB_UPDATE_URL||'version.json', ctrl=null, done=false;
  if(location.protocol.indexOf('http')!==0&&!window.CFB_UPDATE_URL) return;   // offline sin web oficial: sigue en silencio
  function fin(){ done=true; }
  function aviso(v){
    if(!v||!v.version) return;
    var ver=String(v.version).slice(0,24).replace(/[^\w.\-]/g,'');   /* v2.3.1 «Escoba»: version.json es entrada REMOTA → charset blanco (sin HTML ni comillas) */
    if(!ver||ver===VERSION) return;
    if(LSg('cfb_ver_visto','')===ver) return;
    var fecha=xh(String(v.fecha||'hoy').slice(0,40));
    var href=/^https:\/\//.test(v.url||'') ? String(v.url).replace(/["'\\\s]/g,'') : '#';
    var n=document.createElement('div'); n.id='cfbVerNote'; n.setAttribute('role','status');
    n.innerHTML='<button type="button" class="cfb-ver-x" aria-label="Cerrar aviso" '
      +'onclick="this.parentNode.style.display=\'none\';try{localStorage.setItem(\'cfb_ver_visto\',JSON.stringify(\''+ver+'\'))}catch(e){}">✕</button>'
      +'✨ Versión nueva <b>v'+ver+'</b> ('+fecha+') · '
      +'<a href="'+href+'">abrir la última publicación</a>';
    document.body.appendChild(n);
  }
  try{
    if(window.AbortController){ ctrl=new AbortController(); setTimeout(function(){ if(!done) ctrl.abort(); },1500); }
    fetch(url,{signal:ctrl?ctrl.signal:undefined,cache:'no-store'}).then(function(r){ return r.ok?r.json():null; })
      .then(aviso).catch(function(){}).then(fin);
  }catch(e){}
}

/* ═══ C1 · estadísticas locales (anónimas, en este dispositivo) ═══ */
function xh(s){ return String(s==null?'':s).replace(/[&<>]/g,function(c){ return c==='&'?'&amp;':(c==='<'?'&lt;':'&gt;'); }); }
function statsGet(){ return LSg('bm_stats'+SUF,{veces:{},nodo:[],obj:{},sesiones:0,dias:[],roleplay:0,casos:0,quizAciertos:0,quizTotal:0,desde:hoyLocal()}); }
window.cfbStatsGet=statsGet;
function racha(s){
  var ds=(s.dias||[]).slice().sort();
  var hoy=(new Date()); var p=function(n){return (n<10?'0':'')+n;};
  function clv(d){ return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
  var cur=clv(hoy); 
  if(ds.indexOf(cur)<0){ var ay=new Date(); ay.setDate(ay.getDate()-1); if(ds.indexOf(clv(ay))>=0){ cur=clv(ay); } else return 0; }
  var n=0; var d=new Date(cur+'T12:00:00');
  while(ds.indexOf(clv(d))>=0){ n++; d.setDate(d.getDate()-1); }
  return n;
}

/* ═══ B5 · Mis clientes (mini-CRM) — RGPD: prefijo cli_ = JAMÁS sale del dispositivo
       (sync/QR solo recogen claves bm_; aquí ni en tu repo ni en el panel). ═══ */
function cliNorm(t){ return String(t==null?'':t).trim().replace(/[<>&\"]/g,'').slice(0,60); }
function cliLeer(){ return LSg('cli_registros',{})||{}; }
function cliGuardarTodo(o){ try{ localStorage.setItem('cli_registros', JSON.stringify(o)); }catch(e){} try{ if(window.crmPublicaResumen) crmPublicaResumen(); }catch(e2){} /* v3.2.0: el agregado anónimo alimenta el panel admin */ }
function cliPurgar(){ /* retención: notas de más de 180 días desaparecen solas */
  var o=cliLeer(), quitadas=0, limite=86400000*180;
  Object.keys(o).forEach(function(c){
    var antes=(o[c].notas||[]).length;
    o[c].notas=(o[c].notas||[]).filter(function(nt){ var ok=(Date.now()-Date.parse((nt.f||'').replace(' ','T'))<limite); if(!ok) quitadas++; return ok; });
    if(!o[c].notas.length&&!o[c].fijo) delete o[c]; else if(o[c].notas.length!==antes) o[c].creado=o[c].creado||'';
  });
  if(quitadas) cliGuardarTodo(o);
  return quitadas;
}
function cliAnadir(nombre,texto){
  nombre=cliNorm(nombre); texto=String(texto==null?'':texto).trim().replace(/[<>&\"]/g,'').slice(0,300);
  if(!nombre||!texto) return false;
  var o=cliLeer();
  if(!o[nombre]){
    var claves=Object.keys(o);
    if(claves.length>=80){ /* tapón: cae la ficha con la nota más vieja */
      claves.sort(function(a,b){ var fa=(o[a].notas&&o[a].notas.length? o[a].notas[o[a].notas.length-1].f:o[a].creado)||''; var fb=(o[b].notas&&o[b].notas.length? o[b].notas[o[b].notas.length-1].f:o[b].creado)||''; return fa<fb?-1:1; });
      delete o[claves[0]];
    }
    o[nombre]={creado:hoyLocal(), notas:[]};
  }
  var ahora=new Date(), p=function(n){return (n<10?'0':'')+n;};
  o[nombre].notas.push({f:ahora.getFullYear()+'-'+p(ahora.getMonth()+1)+'-'+p(ahora.getDate())+' '+p(ahora.getHours())+':'+p(ahora.getMinutes()), t:texto});
  if(o[nombre].notas.length>20) o[nombre].notas=o[nombre].notas.slice(-20);
  cliGuardarTodo(o);
  try{ busEmite('nota.nueva',{nombre:nombre}); }catch(eB){}   /* F4 */
  return true;
}
function cliBorrar(nombre){ var o=cliLeer(); delete o[nombre]; cliGuardarTodo(o); }
function cliBorrarNota(nombre,idx){ var o=cliLeer(); if(o[nombre]){ o[nombre].notas.splice(idx,1); if(!o[nombre].notas.length) delete o[nombre]; cliGuardarTodo(o); } }
function cliTexto(nombre){ var o=cliLeer(); if(!o[nombre])return ''; return nombre+'\n'+o[nombre].notas.map(function(nt){ return nt.f+' — '+nt.t; }).join('\n'); }
function cliListaHtml(){
  var quitadas = (function(){ try{ return cliPurgar(); }catch(e){ return 0; } })();
  var o=cliLeer(), claves=Object.keys(o);
  if(!claves.length) return '<div class="cfb-nota">aún sin fichas — guarde su primera nota tras la próxima llamada.</div>';
  claves.sort(function(a,b){ var fa=o[a].notas&&o[a].notas.length? o[a].notas[o[a].notas.length-1].f:''; var fb=o[b].notas&&o[b].notas.length? o[b].notas[o[b].notas.length-1].f:''; return fb<fa?-1:1; });
  var h = quitadas?('<div class="cfb-nota">♻ Purga automática: '+quitadas+' notas de +180 días retiradas (RGPD).</div>'):'';
  h += claves.map(function(nombre){
    var n=o[nombre], ult=n.notas.length? n.notas[n.notas.length-1].f.slice(0,10):'-';
    var enc=encodeURIComponent(nombre).replace(/'/g,'%27');
    var filas=n.notas.slice().reverse().map(function(nt,i){
      var idx=n.notas.length-1-i;
      return '<div style="display:flex;gap:6px;align-items:baseline;border-top:1px dashed #eee;padding:4px 0">'
        +'<span style="color:#888;font-size:.7rem;white-space:nowrap">'+xh(nt.f)+'</span>'
        +'<span style="flex:1;font-size:.82rem">'+xh(nt.t)+'</span>'
        +'<button type="button" aria-label="Borrar nota" style="border:none;background:none;cursor:pointer;color:#C62828" onclick="cliBorraNota(decodeURIComponent(\''+enc+'\'),'+idx+')">✕</button></div>';
    }).join('');
    return '<details style="border:1px solid #eee;border-radius:8px;padding:6px 8px;margin-top:6px">'
      +'<summary style="cursor:pointer;font-size:.88rem"><b>'+xh(nombre)+'</b> <span style="color:#888;font-size:.72rem">· '+n.notas.length+' notas · '+ult+'</span></summary>'
      +filas
      +'<div style="display:flex;gap:12px;margin-top:6px;font-size:.78rem">'
      +'<a href="#" onclick="cliCopia(decodeURIComponent(\''+enc+'\'));return false" style="color:#007A3B">📋 copiar historial</a>'
      +'<a href="#" onclick="cliBorraFicha(decodeURIComponent(\''+enc+'\'));return false" style="color:#C62828">🗑 borrar ficha</a></div></details>';
  }).join('');
  return h;
}
window.cliVerTodo=function(){ var quitadas=cliPurgar(); var l=document.getElementById('cliLista'); if(l) l.innerHTML=cliListaHtml(); if(quitadas) toast('♻ Se retiraron '+quitadas+' notas de más de 180 días'); };
window.cliGuardaNueva=function(){
  var n=document.getElementById('cliNombre'), t=document.getElementById('cliNota');
  if(!cliAnadir(n?n.value:'', t?t.value:'')){ toast('📇 Nombre y nota, por favor'); return; }
  if(n) n.value=''; if(t) t.value='';
  toast('📇 Nota guardada — solo en este dispositivo');
  window.cliVerTodo();
};
window.cliBorraFicha=function(nombre){ if(confirm('¿Borrar la ficha de «'+nombre+'» y todas sus notas? (no hay vuelta atrás)')){ window.cliBorrar(nombre); toast('🗑 Ficha borrada · lápida para el equipo'); window.cliVerTodo(); } };
window.cliBorraNota=function(nombre,idx){ if(confirm('¿Borrar esta nota de «'+nombre+'»?')){ cliBorrarNota(nombre,idx); toast('🗑 Nota borrada'); window.cliVerTodo(); } };
window.cliCopia=function(nombre){
  var txt=cliTexto(nombre); var ok=function(){ toast('📋 Historial de «'+nombre+'» copiado — usted decide dónde lo pega'); };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok).catch(ok); return; } }catch(e){}
  try{ ok(); }catch(e){}
};
window.cliReset=function(){ if(confirm('⚠ ¿VACIAR todas las fichas de clientes de ESTE dispositivo?')){ cliGuardarTodo({}); toast('🗑 Registro de clientes vaciado'); window.cliVerTodo(); } };
/* superficie pública mínima (tests + reutilización futura) */
window.cfbRacha=racha; window.cfbMisInsignias=misInsignias;
/* ═══ v3.0.0 «CRM» · área Clientes: fichas con embudo, próximas acciones, preparar llamada ═══
   Reutiliza cli_registros (RGPD: JAMÁS sale del dispositivo). Registros v3: +tel/sector/ciudad/
   comercializadora/factura/dolor/estado/prox{f,h,accion}. Compat: las fichas viejas solo-notas siguen. */
var CRM_ESTADOS=[['nuevo','🆕 Nuevo','#64748B'],['contactado','📞 Contactado','#2563EB'],['interesado','🔥 Interesado','#D97706'],
 ['factura','📄 Factura recibida','#0F766E'],['cita','🗓 Cita','#4C3EBF'],['visita','🔧 Visita técnica','#7C3AED'],
 ['ganado','✅ Ganado','#007A3B'],['perdido','✖ Perdido','#B91C1C']];
var CRM_NODO={nuevo:'apertura',contactado:'apertura',interesado:'deteccion',factura:'cierre_facturas',cita:'cierre_cita',visita:'cierre_tecnico',ganado:'seguimiento',perdido:'retirada'};
var CRM_DOLOR={'':'—','precio':'💶 Precio','servicio':'⚡ Servicio','miedo':'😟 Miedo a averías','contento':'😊 Sin dolor'};
function crmDef(e){ for(var i=0;i<CRM_ESTADOS.length;i++) if(CRM_ESTADOS[i][0]===e) return CRM_ESTADOS[i]; return CRM_ESTADOS[0]; }
/* — v4.0.2 «Pipeline multi-producto» (F2 · ADR-007): pis = micro-pipeline por producto del catálogo — */
var PIS_EST=[['prep','🧰 Preparando'],['oferta','📤 Ofertado'],['nego','🤝 Negociando'],['gan','✔ Ganado'],['per','✘ Perdido']];
function crmPiDefId(e){ for(var i=0;i<PIS_EST.length;i++) if(PIS_EST[i][0]===e) return true; return false; }
/* v3.11 «Base empresarial» (F1 · ADR-004): ficha v4 = empresa con contactos[], datos postales/fiscales,
   tags, valor €, origen y cruce IBERCRM (ibe_id). TODO opcional: la práctica diaria sigue igual de rápida;
   la vacuna v3→v4 (y ahora →v5) es determinista e idempotente. */
function crmNorm(f){
  f=f&&typeof f==='object'?f:{};
  if(f.v!==6){ f.v=6; }                                   /* vacuna CRM v6 (idempotente: v≤5 conserva todo; añade privada='' — ADR-009 F5-C) */
  ['tel','sector','ciudad','comercializadora','factura','dolor','dir','cp','email','web','origen','ibe_id','valor','fin_contrato','precio_kwh'].forEach(function(k){ if(typeof f[k]!=='string') f[k]=''; });   /* F22 (ADR-013): +2 strings opcionales — anexión idempotente, sin bump de v */
  f.privada=(f.privada===1||f.privada===true||f.privada==='1')?1:'';   /* F5-C: 🔒 marca por dispositivo — jamás viaja (merge/push la limpian) */
  if(!Array.isArray(f.contactos)) f.contactos=[];
  f.contactos=f.contactos.filter(function(c){ return c&&typeof c==='object'; }).slice(0,8).map(function(c){
    return {n:String(c.n==null?'':c.n).slice(0,60), cargo:String(c.cargo==null?'':c.cargo).slice(0,60), tel:String(c.tel==null?'':c.tel).slice(0,30)};
  });
  if(!Array.isArray(f.tags)) f.tags=[];
  var _t={}, _tg=[];
  f.tags.forEach(function(t){ t=String(t==null?'':t).trim().slice(0,24); if(/[<>&\"]/.test(t)) return;   /* estricto: descarta tags con marcado */ if(t&&!_t[t.toLowerCase()]){ _t[t.toLowerCase()]=1; _tg.push(t); } });
  f.tags=_tg.slice(0,12);
  if(!Array.isArray(f.pis)) f.pis=[];
  f.pis=f.pis.filter(function(p){ return p&&typeof p==='object'; }).slice(0,8).map(function(p){
    var id=String(p.id||'').toLowerCase().replace(/[^a-z0-9_\-]/g,'').slice(0,24);
    if(!id) return null;
    var est=crmPiDefId(p.est)?p.est:'prep';
    var nota=String(p.nota==null?'':p.nota).replace(/[<>&\"]/g,'').slice(0,80);
    return {id:id,est:est,nota:nota};
  }).filter(Boolean);
  if(!crmDefId(f.estado)) f.estado='nuevo';
  if(!f.prox||typeof f.prox!=='object') f.prox={f:'',h:'',accion:''};
  if(!Array.isArray(f.notas)) f.notas=[];
  return f;
}
function crmDefId(e){ for(var i=0;i<CRM_ESTADOS.length;i++) if(CRM_ESTADOS[i][0]===e) return true; return false; }
function cliUp(nombre,campos){
  nombre=cliNorm(nombre); if(!nombre) return null;
  var o=cliLeer();
  if(!o[nombre]){
    var claves=Object.keys(o);
    if(claves.length>=80){ /* mismo tapón que cliAnadir: cae la ficha con la nota más vieja */
      claves.sort(function(a,b){ var fa=(o[a].notas&&o[a].notas.length? o[a].notas[o[a].notas.length-1].f:o[a].creado)||''; var fb=(o[b].notas&&o[b].notas.length? o[b].notas[o[b].notas.length-1].f:o[b].creado)||''; return fa<fb?-1:1; });
      delete o[claves[0]];
    }
  }
  var _estAnt=(o[nombre]&&String(o[nombre].estado||''));   /* F4: para ficha.movio */
  var f=crmNorm(o[nombre]||{creado:hoyLocal(),notas:[]});
  ['tel','sector','ciudad','comercializadora','factura','dolor','dir','cp','email','web','origen','ibe_id'].forEach(function(k){
    if(campos&&campos[k]!==undefined) f[k]=String(campos[k]==null?'':campos[k]).replace(/[<>&\"]/g,'').slice(0,80);
  });
  if(campos&&campos.valor!==undefined) f.valor=String(campos.valor==null?'':campos.valor).replace(/[^0-9.,]/g,'').slice(0,13);   /* F1: valor € numérico */
  if(campos&&Array.isArray(campos.contactos)) f.contactos=campos.contactos;
  if(campos&&Array.isArray(campos.tags)) f.tags=campos.tags;
  if(campos&&Array.isArray(campos.pis)) f.pis=campos.pis;
  if(campos&&(campos.contactos||campos.tags||campos.pis)) f=crmNorm(f);          /* sanea arrays (límites/dedupe) ANTES de guardar */
  if(campos&&campos.estado&&crmDefId(campos.estado)) f.estado=campos.estado;
  if(campos&&campos.prox&&typeof campos.prox==='object'){ f.prox={f:String(campos.prox.f||'').slice(0,10),h:String(campos.prox.h||'').slice(0,5),accion:String(campos.prox.accion||'').replace(/[<>&\"]/g,'').slice(0,80)}; }
  o[nombre]=f; cliGuardarTodo(o);
  if(campos&&campos.estado&&_estAnt!==f.estado){ try{ busEmite('ficha.movio',{nombre:nombre,de:_estAnt,a:f.estado}); }catch(eB){} }   /* F4 */
  return f;
}
/* v3.11.0 «Base empresarial»: buscador global (empresa completa, no solo nombre/tel) */
var CRM_ORIGENES=[['','— origen'],['Iberdrola','⚡ Iberdrola (cliente)'],['IBERCRM','🟥 IBERCRM (extracto)'],['IBERU','🟩 IBERU'],['maestro','🗂️ Maestro / Reponer'],['manual','✍ Manual'],['referido','🤝 Referido']];
function crmMatch(n,f,q){
  try{
    q=String(q==null?'':q).toLowerCase().trim(); if(!q) return true;
    var haystack=(n+' '+f.tel+' '+f.sector+' '+f.ciudad+' '+f.comercializadora+' '+f.dir+' '+f.cp+' '+f.email+' '+f.web+' '+f.origen+' '+f.ibe_id+' '+(f.tags||[]).join(' ')+' '+(f.pis||[]).map(function(p){return p.id+' '+p.est;}).join(' ')+' '+(f.contactos||[]).map(function(c){return c.n+' '+c.cargo+' '+c.tel;}).join(' ')).toLowerCase();
    return haystack.indexOf(q)>-1;
  }catch(e){ return true; }
}
/* S1 ENCENDIDA en G4 (ADR-003/006): cfCifraParaSync cifra los campos sensibles de cada ficha
   en un blob AES-GCM-256 por ficha (cf:{iv,blob}), dejando claro lo de merge/listado (n,estado,ciudad,sector,fresh).
   Sin cfb_data_key o sin crypto.subtle → identidad (equipo sin clave de datos: pasa igual). cb(out,err) siempre. */
var CRM_S1_SENSIBLES=['tel','comercializadora','factura','dolor','dir','cp','email','web','valor','ibe_id','origen','contactos','tags','pis','prox','notas','creado'];
window.cfS1Key=function(){
  try{
    var raw=LSg('cfb_data_key',''); if(!raw||typeof raw!=='object'||!(window.crypto&&crypto.subtle)) return Promise.resolve(null);   /* LSg ya parsea: raw = objeto JWK */
    return crypto.subtle.importKey('jwk',raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']).catch(function(){ return null; });
  }catch(e){ return Promise.resolve(null); }
};
function cfB64Dec(t){ return Uint8Array.from(atob(t||''),function(c){ return c.charCodeAt(0); }); }
function cfB64Enc(u8){ var t=[]; for(var off=0;off<u8.length;off+=8192) t.push(String.fromCharCode.apply(null,u8.subarray(off,off+8192))); return btoa(t.join('')); }
window.cfCifraParaSync=function(datos,cb){
  try{
    cfS1Key().then(function(k){
      if(!k){ cb(datos,null); return; }                            /* identidad sin dk (documentado ADR-006) */
      var salidas={}, nombres=Object.keys(datos||{}), pend=nombres.length;
      if(!pend){ cb(salidas,null); return; }
      var errRes=null;
      nombres.forEach(function(nom){
        var f=crmNorm(datos[nom]), fresca=cliFresh(f);
        var privado={}; CRM_S1_SENSIBLES.forEach(function(c2){ privado[c2]=f[c2]; });
        var iv=crypto.getRandomValues(new Uint8Array(12));
        crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(JSON.stringify(privado))).then(function(buf){
          salidas[nom]={v:1,cf:1,estado:f.estado,ciudad:f.ciudad,sector:f.sector,fresh:fresca,iv:cfB64Enc(iv),blob:cfB64Enc(new Uint8Array(buf))};
          if(--pend===0) cb(salidas,errRes);
        }).catch(function(e3){ errRes=e3?e3.message:'cifra'; salidas[nom]=undefined; if(--pend===0) cb(salidas,errRes); });
      });
    }).catch(function(e2){ cb(datos,e2?e2.message:null); });
  }catch(e){ cb(datos,e?e.message:null); }
};
window.cfDescifraDeSync=function(datos,cb){
  try{
    cfS1Key().then(function(k){
      if(!k){ cb(datos,null); return; }
      var salidas={}, nombres=Object.keys(datos||{}), pend=nombres.length;
      if(!pend){ cb(salidas,null); return; }
      var errRes=null;
      nombres.forEach(function(nom){
        var r=datos[nom];
        if(!r||!r.cf){ salidas[nom]=r; if(--pend===0) cb(salidas,errRes); return; }   /* legado sin cifrar pasa igual */
        crypto.subtle.decrypt({name:'AES-GCM',iv:cfB64Dec(r.iv)},k,cfB64Dec(r.blob)).then(function(buf){
          var privado=JSON.parse(new TextDecoder().decode(buf));
          var f={estado:r.estado,ciudad:r.ciudad,sector:r.sector}; Object.keys(privado).forEach(function(c2){ f[c2]=privado[c2]; });
          salidas[nom]=crmNorm(f); if(--pend===0) cb(salidas,errRes);
        }).catch(function(e3){ errRes=e3?e3.message:'descifra'; salidas[nom]=undefined; if(--pend===0) cb(salidas,errRes); });
      });
    }).catch(function(e2){ cb(datos,e2?e2.message:null); });
  }catch(e){ cb(datos,e?e.message:null); }
};
/* G4 (ADR-006): sync v2 de fichas CRM por GitHub Contents (repo privado datos/crm-fichas.json).
   DORMANT: flag cfb_flag_cli_sync=«1» — F5 (Ola 2d) decide la UX privado⇄equipo. Sin lápidas v1. */
function cliFresh(f){ var m=(f.prox&&f.prox.f)?f.prox.f:''; (f.notas||[]).forEach(function(nt){ if(nt&&nt.f&&nt.f>m) m=nt.f; }); return m||'0000-00-00'; }
window.cliMerge=function(local,remoto){
  var salida={},k;
  for(k in local||{}) salida[k]=crmNorm(local[k]);
  for(k in remoto||{}){
    var rf=crmNorm(remoto[k]); delete rf.privada;                       /* F5-C: la marca 🔒 es por dispositivo — no se hereda */
    if(!salida[k]){ salida[k]=rf; continue; }
    if(salida[k].privada) continue;                                     /* F5-C: una local privada NO es reemplazable por remota */
    if(cliFresh(rf)>cliFresh(salida[k])) salida[k]=rf;                  /* gana la más fresca; empate → local */
  }
  return salida;
};
window.cliSyncEstado=function(){ try{ return {on: !!LSg('cfb_data_key','')}; }catch(e){ return {on:false}; } };     /* F5-A (ADR-009): la clave de datos ES el interruptor; el flag legado cfb_flag_cli_sync queda inerte */
window.cliSyncJala=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  cliSyncLapJala(function(){                                             /* F5-B: lápidas primero (offline: las cacheadas) */
    var lapidas=cliLapLocal();
    maeGet('datos/crm-fichas.json',function(st,j){
      if(st!==200&&st!==404){ cb(false,'red '+st); return; }
      if(st===404){ var tot=Object.keys(cliLeer()).length; cb({mescladas:0,totales:tot,lapidas:0},null); return; }
      try{
        var contenido=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j;
        var remoto=(contenido&&contenido.fichas)||{};
        cfDescifraDeSync(remoto,function(desc,err){
          if(err){ cb(false,err); return; }
          var local=cliLeer(), mesclada=cliMerge(local,desc||{}), borradas=0, k;
          for(k in mesclada){ if(lapidas[k]&&!mesclada[k].privada&&cliFresh(mesclada[k])<lapidas[k].f){ delete mesclada[k]; borradas++; } }  /* lápida si la local es más vieja y no es 🔒 */
          cliGuardarTodo(mesclada);
          cb({mescladas:Object.keys(mesclada).length-Object.keys(local).length,totales:Object.keys(mesclada).length,lapidas:borradas},null);
        });
      }catch(e){ cb(false,e.message); }
    });
  });
};
window.cliSyncPush=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  var _t0Push=Date.now();   /* Q7: latencia total de la sincronización */
  cliSyncJala(function(res,err){
    if(err){ cb(false,err); return; }                                          /* pull antes de push (merge fresco) */
    var lapidas=cliLapLocal(), todo=cliLeer(), pub={}, k;
    for(k in todo){ if(todo[k].privada||lapidas[k]) continue; pub[k]=crmNorm(todo[k]); delete pub[k].privada; }   /* F5-C no viajan · F5-B bajo lápida no reviven */
    cfCifraParaSync(pub,function(cifradas,err2){
      if(err2){ cb(false,err2); return; }
      maePut('datos/crm-fichas.json',{v:1,upd:hoyLocal(),fichas:cifradas},function(st){
        if(st===200){ cliSyncLapJala(function(){ maePut(CLI_LAPIDAS,{v:1,upd:hoyLocal(),lapidas:cliLapLocal()},function(){}); }); try{ metPublica(function(){}); }catch(eM){} try{ busEmite('sync.ok',{n:Object.keys(cifradas).length}); }catch(eS){} }   /* lápida republicada + métrica anónima al mando (G2) + evento bus (F4) */
        if(st===200){ try{ salMarca('sync_total',Date.now()-_t0Push,Math.round(JSON.stringify(cifradas).length/1024)); salPublica(function(){}); }catch(eT){} }
        if(st===200){ try{ audMarca('sync_masiva',Object.keys(cifradas).length+' fichas',function(){}); }catch(eA){} }
        cb(st===200?{enviadas:Object.keys(cifradas).length}:false,st===200?null:('push '+st));
      });
    });
  });
};
window.crmMatch=crmMatch; window.CRM_ORIGENES=CRM_ORIGENES;                 /* F1: buscador y orígenes fuera del closure */

/* G5 (ADR-006): catálogo compartido de productos/servicios (web Pages, sin PII, ruta relativa) */
window.catalogoDef=function(){ return {v:1,items:[
  {id:'tarifa20', nombre:'Optimización tarifa luz 2.0TD', area:'energia', tag:'⚡', activo:true},
  {id:'tarifa30', nombre:'Optimización tarifa luz 3.0TD', area:'energia', tag:'⚡', activo:true},
  {id:'gas',      nombre:'Gas 3.x / punto de gas',        area:'energia', tag:'🔥', activo:true},
  {id:'solar',    nombre:'Solar autoconsumo RC',          area:'ingenieria', tag:'☀', activo:true},
  {id:'bateria',  nombre:'Batería / almacenamiento',      area:'ingenieria', tag:'🔋', activo:true},
  {id:'manto',    nombre:'Mantenimiento integral',        area:'mantenimiento', tag:'🔧', activo:true},
  {id:'ingenieria',nombre:'Ingeniería / proyecto técnico',area:'ingenieria', tag:'📐', activo:true},
  {id:'comer',    nombre:'Comisionamiento / outsourcing comercial', area:'comercial', tag:'🤝', activo:true}
]}; };
window.catalogoGet=function(cb){
  cb=cb||function(){};
  try{
    var c=LSg('cat_cache',null);
    if(c&&c.items&&c.ts&&(Date.now()-c.ts)<28800000){ cb(c.items,false,null); return; }   /* caché 8 h */
  }catch(e){}
  fetch('datos/catalogo.json',{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('http '+r.status);
    return r.json();
  }).then(function(j){
    var items=(j&&j.items||[]).filter(function(it){ return it&&it.id&&it.nombre; });
    try{ LSs('cat_cache',{ts:Date.now(),items:items}); }catch(e){}
    cb(items.length?items:catalogoDef().items,false,null);
  }).catch(function(){ cb(catalogoDef().items,false,'offline/seed'); });           /* semilla embebida si no hay red/JSON */
};
window.catalogoActivos=function(cbx){ catalogoGet(function(items,cache,err){ cbx(items.filter(function(it){ return it.activo!==false; }),cache,err); }); };
/* F2 (ADR-007): helpers síncronos sobre caché o seed — el editor del pipeline los usa sin esperar red */
function catalogoOptsSync(){ try{ var c=LSg('cat_cache',null); var items=(c&&c.items&&c.items.length?c.items:catalogoDef().items); return items.filter(function(it){ return it.activo!==false; }); }catch(e){ return catalogoDef().items; } }
function piNombre(id){ var items=catalogoOptsSync(); for(var i=0;i<items.length;i++) if(items[i].id===id) return items[i].nombre; return id; }
function piTag(id){ var items=catalogoOptsSync(); for(var i=0;i<items.length;i++) if(items[i].id===id) return items[i].tag||'🧩'; return '🧩'; }
function piDefEst(e){ for(var i=0;i<PIS_EST.length;i++){ if(PIS_EST[i][0]===e) return PIS_EST[i]; } return PIS_EST[0]; }
window.PIS_ESTADOS=PIS_EST; window.piNombre=piNombre; window.piTag=piTag; window.piDefEst=piDefEst; window.crmPiDefId=crmPiDefId; window.catalogoOptsSync=catalogoOptsSync;   /* F2: fuera del closure para el editor y los tests */


window.cliSetEstado=function(nombre,est){ if(cliUp(nombre,{estado:est})){ var d=crmDef(est); cliAnadir(nombre,'Estado → '+d[1]); try{ if(window.actAdd) actAdd('crm',{detalle:'Estado → '+d[1],resultado:est,ciudad:(cliLeer()[nombre]||{}).ciudad}); }catch(e2){} try{ toast(d[1]); }catch(e){} window.crmRenderTab(); } };
window.cliSetProx=function(nombre){ var f=document.getElementById('crmPf'),h=document.getElementById('crmPh'),a=document.getElementById('crmPa');
  var r=cliUp(nombre,{prox:{f:f?f.value:'',h:h?h.value:'',accion:a?a.value:''}});
  if(r&&r.prox.f) cliAnadir(nombre,'📅 Próxima acción: '+r.prox.f+(r.prox.h?(' '+r.prox.h):'')+(r.prox.accion?(' — '+r.prox.accion):''));
  window.crmRenderTab(); };
function crmAbierto(e){ return e!=='ganado'&&e!=='perdido'; }
window.crmHoyTodo=function(){
  var o=cliLeer(),hoy=hoyLocal(),res=[];
  Object.keys(o).forEach(function(n){ var f=crmNorm(o[n]); if(crmAbierto(f.estado)&&f.prox&&f.prox.f&&f.prox.f<=hoy) res.push({n:n,f:f}); });
  res.sort(function(a,b){ var fa=a.f.prox.f+(a.f.prox.h||''), fb=b.f.prox.f+(b.f.prox.h||''); return fa<fb?-1:1; });
  return res;
};
/* Preparar la llamada: rellena las variables del guion y salta al nodo idóneo del estado */
window.cliPrepLlamada=function(nombre){
  var o=cliLeer(), f=crmNorm(o[nombre]||{}); if(!f.creado){ return; }
  try{ var v=LSg('guion_vars'+SUF,{})||{};
    if(nombre) v.NOMBRE_CLIENTE=nombre;
    if(f.sector) v.SECTOR=f.sector;
    if(f.ciudad) v.CIUDAD=f.ciudad;
    if(f.comercializadora) v.COMERCIALIZADORA_ACTUAL=f.comercializadora;
    LSs('guion_vars'+SUF,v);
  }catch(e){}
  var nodo=CRM_NODO[f.estado]||'inicio';
  try{ if(typeof NODES!=='undefined'&&NODES[nodo]) guiIrA(nodo); }catch(e){ try{ guiIrA('inicio'); }catch(e2){} }
  try{ if(!document.body.classList.contains('modo-guion')&&window.tutAbrirGuion) tutAbrirGuion(); }catch(e){}
  try{ toast('📞 '+nombre+' listo: guion preparado en «'+nodo.split('_')[0]+'»'); }catch(e){}
  try{ if(window.guiPintarModal) guiPintarModal(); }catch(e){}
};
if(!window.cliUp){ window.cliUp=cliUp; window.crmNorm=crmNorm; window.cliLeer=cliLeer; }
function tel_de(f){ return (f&&f.tel)?f.tel.replace(/[^0-9+]/g,''):''; }
window.cliPrepLlamadaSafe=function(nombre){ try{ window.cliPrepLlamada(nombre); }catch(e){} };
/* ═══ v3.1.0 · Registro de actividad automático (lo consume actividad.html) ═══
   Una línea por gestión: {ts,f,h,tipo,resultado,detalle,ciudad,sector,min,org}.
   Clave bm_actividad con burbuja por comercial (cfbPref) → viaja por sync bm_.
   Nombres y teléfonos de clientes NUNCA entran aquí: permanecen en cli_registros (local). */
function actKeyLS(){ try{ if(window.cfbPref) return cfbPref('actividad'); }catch(e){} return 'bm_actividad'; }
function actLimpia(s,n){ return String(s==null?'':s).replace(/[<>&\"]/g,'').slice(0,n||80); }
window.actLeer=function(){ try{ var a=LSg(actKeyLS(),[]); return Array.isArray(a)?a:[]; }catch(e){ return []; } };
window.actGuardar=function(a){ try{ LSs(actKeyLS(),a); }catch(e){} };
window.actAdd=function(tipo,op){
  try{
    op=op||{};
    var ahora=new Date(), ah=ahora.getHours(), am=ahora.getMinutes();
    var e={ts:ahora.getTime(), f:hoyLocal(), h:(ah<10?'0':'')+ah+':'+(am<10?'0':'')+am,
      tipo:actLimpia(tipo,24), resultado:actLimpia(op.resultado,40), detalle:actLimpia(op.detalle,120),
      ciudad:actLimpia(op.ciudad,40), sector:actLimpia(op.sector,40),
      min:Math.max(0,Math.round(Number(op.min)||0)), org:(SUF==='_res'?'res':'pymes')};
    var a=window.actLeer(); a.push(e);
    if(a.length>3000) a=a.slice(a.length-3000);   /* tapón FIFO: 3000 gestiones */
    window.actGuardar(a); return e;
  }catch(err){ return null; }
};
window.actResultado=function(ts,resultado){ var a=window.actLeer(); for(var i=0;i<a.length;i++){ if(a[i].ts===ts){ a[i].resultado=actLimpia(resultado,40); window.actGuardar(a); return true; } } return false; };
window.actBorrar=function(ts){ window.actGuardar(window.actLeer().filter(function(e){ return e.ts!==ts; })); };
window.cfbActividadAbrir=function(){ try{ window.open('actividad.html','_blank'); }catch(e){ try{ location.href='actividad.html'; }catch(e2){} } };
/* ganchos automáticos: práctica (roleplay al salir, quiz al corregir, caso por respuesta) */
function actEngancha(){
  if(typeof cadena!=='function'){ setTimeout(actEngancha,150); return; }
  cadena('guiRpExit',function(){ if(window.actAdd) actAdd('practica',{detalle:'roleplay'}); });
  cadena('tutCorregir',function(){ try{ var ok=0; for(var i=0;i<QUIZ.length;i++) if(answered[i]===QUIZ[i].ok) ok++; actAdd('practica',{detalle:'quiz '+ok+'/'+QUIZ.length}); }catch(e){} });
  cadena('tutAnswerCaso',function(){ if(window.actAdd) actAdd('practica',{detalle:'caso práctico'}); });
}
actEngancha();
/* ═══ v3.2.0 · resumen CRM agregado hacia el panel admin ═══
   Publica SOLO contadores (fichas por estado + pipeline €/mes) en bm_crm_resumen_<burbuja>
   (viaja por sync bm_). Nombres, teléfonos y notas jamás salen del dispositivo. */
window.crmPublicaResumen=function(){
  try{
    if(!window.cfbPref) return;
    var o=cliLeer(), e={nuevo:0,contactado:0,interesado:0,factura:0,cita:0,visita:0,ganado:0,perdido:0}, pipe=0, pc={};
    Object.keys(o).forEach(function(n){
      var f=crmNorm(o[n]); if(e[f.estado]===undefined) f.estado='nuevo';
      e[f.estado]++;
      if(f.estado==='interesado'||f.estado==='factura'||f.estado==='cita'||f.estado==='visita'){
        var m=parseFloat(String(f.factura||'').replace(',','.')); if(m>0) pipe+=m;
      }
      (f.pis||[]).forEach(function(p){ if(!pc[p.id]) pc[p.id]={prep:0,oferta:0,nego:0,gan:0,per:0}; if(pc[p.id][p.est]===undefined) pc[p.id].prep++; else pc[p.id][p.est]++; });   /* v4.0.2 F2: embudo por producto, ANÓNIMO (recuentos) */
    });
    LSs(cfbPref('crm_resumen'),{v:1,f:hoyLocal(),fichas:Object.keys(o).length,e:e,pipe:pipe,pc:pc});
  }catch(e){}
};

/* ═══ v3.3.0 «Prospección» · banco de potenciales COMPARTIDO ═══
   Lista ligera de muchos (≤500 por comercial) que se convierten en gestión CRM.
   - Espejo local: 'pro_banco_cache' (NO bm_: viaja por datos/prospeccion.json, no en la burbuja).
   - Banco compartido de equipo: GET/PUT Contents API con fusión por id (gana el 'act' más reciente).
   - Resultados rápidos → anotan al registro de actividad; los positivos convierten a ficha CRM. */
var PRO_RES=['No contesta','No disponible','No interesado/a','Pide factura','Cita concertada','Ya es cliente','Descartado'];
function proAhora(){ return Date.now(); }
function proNorm(r){
  r=r&&typeof r==='object'?r:{};
  var id=String(r.id||('p'+proAhora().toString(36)+Math.floor(Math.random()*1e6).toString(36)));
  return {
    id:id,
    n:actLimpia(r.n,80), tel:String(r.tel||'').replace(/[^0-9+]/g,'').slice(0,20),
    c:actLimpia(r.c,40), s:actLimpia(r.s,40), fuente:actLimpia(r.fuente,30), i:actLimpia(r.i,30),   /* v4.0.1 G7: ibe_id (cruce IBERCRM) */
    p:{ e:(/^(sin_llamar|intento|contacto|descartado|convertido)$/.test(r.p&&r.p.e)?r.p.e:'sin_llamar'),
        n:Math.max(0,Math.round(Number(r.p&&r.p.n)||0)),
        r:actLimpia(r.p&&r.p.r,40),
        pf:actLimpia(r.p&&r.p.pf,10) },
    g:actLimpia(r.g,200),
    owner:actLimpia(r.owner,30), ts:Math.round(Number(r.ts)||proAhora()),
    act:Math.round(Number(r.act)||proAhora()),
    hist:Array.isArray(r.hist)?r.hist.slice(-6):[]
  };
}
function proLeer(){ try{ var a=LSg('pro_banco_cache',[]); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function proGuardar(a){ try{ LSs('pro_banco_cache',a); }catch(e){} try{ proSyncPush(); }catch(e){} }
window.proAlta=function(o){
  var a=proLeer();
  var activos=a.filter(function(r){ return r.p.e!=='convertido'; }).length;
  if(activos>=500){ try{ toast('⚠ Banco lleno (500): convierte o descarta antes de añadir'); }catch(e){} return null; }
  var r=proNorm(o||{}); if(!r.n) return null;
  var rt=proTelN(r.tel), dup=null;
  if(rt){ dup=a.filter(function(x){ return x.p.e!=='convertido'&&proTelN(x.tel)===rt&&proTelN(x.tel)!==''; })[0]||null; }
  if(dup) return {dup:dup};
  r.owner=proMiSlug();
  a.push(r); proGuardar(a); return r;
};
function proTocaHoy(){ var h=hoyLocal(); return proLeer().filter(function(r){ return r.p.e!=='convertido'&&r.p.e!=='descartado'&&r.p.pf&&r.p.pf<=h; }); }
/* resultado rápido: anota al registro + avanza el estado + conversión automática en positivos */
window.proResultado=function(id,res){
  var a=proLeer(), r=null;
  for(var i=0;i<a.length;i++){ if(a[i].id===id){ r=a[i]; break; } }
  if(!r) return false;
  var hoy=hoyLocal(), ahora=new Date(), hh=(ahora.getHours()<10?'0':'')+ahora.getHours()+':'+(ahora.getMinutes()<10?'0':'')+ahora.getMinutes();
  r.act=proAhora();
  if(res==='Descartado'){ r.p.e='descartado'; r.p.r=res; r.p.pf='';
    try{ if(window.confirm&&confirm('¿«'+r.n+'» pide NO VOLVER A LLAMAR MÁS? (Aceptar = lista de exclusión del equipo · Cancelar = solo descartado)')){ excAdd(r.tel,'no_llama',r.n); } }catch(x){} }
  else {
    r.p.n++; r.p.r=res;
    r.hist.push({f:hoy,h:hh,r:res}); r.hist=r.hist.slice(-6);
    if(res==='No contesta'||res==='No disponible'){ r.p.e='intento'; var d=new Date(ahora.getTime()+2*86400000); r.p.pf=(function(x){function p2(n){return(n<10?'0':'')+n;} return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate());})(d); }
    else { r.p.e='contacto'; if(res!=='Cita concertada') r.p.pf=hoy; }
  }
  try{ if(window.actAdd) actAdd('llamada',{resultado:(res==='Pide factura'?'Solicita factura':(res==='Cita concertada'?'Cita coordinada':(res==='No contesta'?'No contesta':res))),detalle:'potencial · '+r.n.split('·')[0],ciudad:r.c,sector:r.s}); }catch(e){}
  proGuardar(a);
  if(res==='Pide factura'||res==='Cita concertada'||res==='Ya es cliente') proConvertir(id,res==='Pide factura'?'factura':(res==='Cita concertada'?'cita':'contactado'));
  return true;
};
/* conversión: crea la ficha CRM en el estado dado y transcribe el historial de intentos como notas */
window.proConvertir=function(id,estado){
  var a=proLeer(), r=null;
  for(var i=0;i<a.length;i++){ if(a[i].id===id){ r=a[i]; break; } }
  if(!r||r.p.e==='convertido') return false;
  try{
    var f=cliUp(r.n,{tel:r.tel,sector:r.s,ciudad:r.c,estado:estado,origen:(r.fuente||'').slice(0,80),ibe_id:(r.i||'').slice(0,30)});   /* v3.11: origen · v4.0.1 G7: y también el ibe_id */
    if(f){
      (r.hist||[]).forEach(function(g){ cliAnadir(r.n,'[potencial] '+g.f+' '+g.h+' — '+g.r); });
      if(!r.hist.length) cliAnadir(r.n,'[potencial] convertido a cliente ('+estado+')');
    }
  }catch(e){}
  r.p.e='convertido'; r.p.r='convertir:'+estado; r.act=proAhora();
  proGuardar(a);
  try{ toast('🎉 '+r.n+' → ficha de cliente ('+estado+')'); }catch(e){}
  window.crmRenderTab();
  return true;
};
/* preparar la llamada a un potencial: precarga variables y abre el guion en APERTURA */
window.proPrepLlamada=function(id){
  var a=proLeer(), r=null;
  for(var i=0;i<a.length;i++){ if(a[i].id===id){ r=a[i]; break; } }
  if(!r) return;
  try{ var v=LSg('guion_vars'+SUF,{})||{};
    if(r.n) v.NOMBRE_CLIENTE=r.n; if(r.s) v.SECTOR=r.s; if(r.c) v.CIUDAD=r.c;
    LSs('guion_vars'+SUF,v); }catch(e){}
  try{ if(typeof NODES!=='undefined'&&NODES.apertura) guiIrA('apertura'); }catch(e){}
  try{ if(!document.body.classList.contains('modo-guion')&&window.tutAbrirGuion) tutAbrirGuion(); }catch(e){}
  try{ if(window.guiPintarModal) guiPintarModal(); }catch(e){}
  try{ toast('📞 '+r.n+': guion preparado en apertura'); }catch(e){}
};
/* purga: descartados +90 días · convertidos +30 días */
function proPurgar(a){ var lim90=proAhora()-90*86400000, lim30=proAhora()-30*86400000;
  return a.filter(function(r){ if(r.p.e==='descartado'&&r.act<lim90) return false; if(r.p.e==='convertido'&&r.act<lim30) return false; return true; }); }
/* fusión por id: gana el registro con 'act' más reciente */
function proMerge(base,otra){ var m={}; (base||[]).concat(otra||[]).forEach(function(r){ r=proNorm(r); if(!m[r.id]||(r.act||0)>=(m[r.id].act||0)) m[r.id]=r; });
  var out=Object.keys(m).map(function(k){ return m[k]; });
  out.sort(function(a,b){ return b.act-a.act; }); return proPurgar(out); }
if(!window.proLeer){ window.proLeer=proLeer; window.proMerge=proMerge; }
/* sync del banco compartido (datos/prospeccion.json) con fusión y reintento ante conflicto */
var _proPushT=null;

/* ── v3.4.0 «Sesión» helpers ── */
function proTelN(t){ t=String(t||'').replace(/\D/g,''); return t.length>9?t.slice(-9):t; }
function proMiSlug(){ try{ var p=perfil&&perfil(); return (p&&p.slug)||'comun'; }catch(e){ return 'comun'; } }
function proPrioridad(a){ var h=hoyLocal();
  return a.slice().sort(function(x,y){
    var k=function(r){ if(r.p.e==='descartado') return 9; if(r.p.pf&&r.p.pf<=h) return 0; if(r.p.n===0) return 1; if(r.p.e==='contacto') return 2; return 3; };
    var d=k(x)-k(y); if(d) return d;
    var px=x.p.pf||'9999', py=y.p.pf||'9999'; if(px!==py) return px<py?-1:1;
    return String(x.c||'').localeCompare(String(y.c||''));
  }); }
var PRO_SESION={on:false,t0:0,n:0};
window.proSesionToggle=function(){
  PRO_SESION.on=!PRO_SESION.on; CRM_FILTRO.proSesion=PRO_SESION.on;
  PRO_SESION.t0=Date.now(); PRO_SESION.n=0;
  try{ if(PRO_SESION.on){ document.addEventListener('keydown',proSesionKey); } else { document.removeEventListener('keydown',proSesionKey); } }catch(e){}
  window.crmRenderTab();
};
window.proSesionKey=function(e){
  if(!PRO_SESION.on||!CRM_FILTRO.proSesion||CRM_FILTRO.seg!=='pot') return;
  var t=e&&e.target; if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName||'')) return;
  var k=+((e&&e.key)||0); if(k>=1&&k<=7){ e.preventDefault(); proSesionRes(k-1); }
};
window.proSesionRes=function(k){
  var a=proLeer().filter(function(r){ return r.p.e!=='convertido'&&r.p.e!=='descartado'; });
  var next=proPrioridad(a)[0];
  if(next&&PRO_RES[k]){ proResultado(next.id,PRO_RES[k]); PRO_SESION.n++; window.crmRenderTab(); }
};
function proSesionHtml(){
  var a=proLeer().filter(function(r){ return r.p.e!=='convertido'&&r.p.e!=='descartado'; });
  var orden=proPrioridad(a), next=orden[0];
  var m=Math.max(0,Math.round((Date.now()-PRO_SESION.t0)/60000));
  var cab='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">'
   +'<button type="button" class="crm-chip on" onclick="proSesionToggle()">✕ Cerrar sesión</button>'
   +'<button type="button" class="crm-chip" onclick="proVer(\'cli\')">👥 Clientes</button>'
   +proSyncLey()
   +'<span class="crm-pill">🔥 '+PRO_SESION.n+' gestiones · '+m+' min'+(PRO_SESION.n&&m?(' · '+(m/PRO_SESION.n).toFixed(1)+' min/gestión'):'')+'</span></div>';
  if(!next) return '<div class="crm-wrap">'+cab+'<div class="crm-empty">✔ <b>¡Banco al día!</b> Nada pendiente: cierra la sesión o repasa los calientes a mano.</div></div>';
  var hist=(next.hist||[]).slice(-4).map(function(g){ return '<li>'+g.f.slice(8,10)+'/'+g.f.slice(5,7)+' '+g.h+' — '+xh(g.r)+(g.n?(' · '+xh(g.n)):'')+'</li>'; }).join('');
  var meta=((next.c?('📍'+next.c+' · '):'')+(next.s||''))+(next.g?(' · ✏ '+next.g):'');
  var botones=PRO_RES.map(function(r,i){ return '<button type="button" class="btn" style="margin:3px 4px 3px 0;font-size:.86rem" onclick="proSesionRes('+i+')"><b>'+(i+1)+'</b>· '+r+'</button>'; }).join('');
  return '<div class="crm-wrap">'+cab
    +'<div class="reglas" style="border-left:4px solid #E8890C">'
    +'<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">'
    +'<b style="font-size:1.15rem">'+xh(next.n)+'</b>'
    +(next.tel?('<a href="tel:'+next.tel+'" style="font-size:1.02rem;text-decoration:none">☎ '+next.tel+'</a>'):'')
    +(meta?('<span class="auto">'+xh(meta)+'</span>'):'')
    +(next.p.n?('<span class="auto">'+next.p.n+'🔁</span>'):'<span class="auto">sin llamar</span>')
    +(next.p.pf?('<span class="auto">↺ '+next.p.pf+'</span>'):'')+'</div>'
    +(hist?('<ul style="margin:8px 0 0 18px;font-size:.8rem;color:var(--gris-medio,#666)">'+hist+'</ul>'):'')
    +'<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    +'<button type="button" class="btn verde" onclick="proPrepLlamada(\''+escattr(next.id)+'\')">📞 Llamar</button>'
    +botones+'</div>'
    +'<p style="font-size:.72rem;color:var(--gris-medio,#888);margin:8px 0 0">Al marcar el resultado salta al siguiente automáticamente. Teclas <b>1</b>–<b>7</b> = resultado directo (durante la sesión).</p>'
    +'</div>'
    +(orden.length>1?('<div style="margin-top:10px;font-size:.78rem;color:var(--gris-medio,#555)">A continuación: '+orden.slice(1,7).map(function(r){ return '<span class="crm-pill">'+xh(r.n)+'</span>'; }).join('')+'</div>'):'')
    +'</div>';
}
function proSyncSt(e){ try{ LSs('pro_sync_st',e+':'+Date.now()); }catch(x){} try{ proPill(); }catch(x2){} }
function proSyncLey(){
  var v=''; try{ v=LSg('pro_sync_st','')||''; }catch(e){}
  if(!v) return '<span class="crm-pill" id="proSyncPill">☁ sync</span>';
  var e=v.split(':')[0], t=Math.round((Date.now()-((+v.split(':')[1])||0))/60000);
  var txt=(e==='ok')?('✔ sincronizado'+(t<1?' ahora':' · hace '+t+' min')):((e==='pend')?'⏳ sync pendiente':'☁ sync');
  return '<span class="crm-pill" id="proSyncPill" title="Banco compartido del equipo (datos/prospeccion.json)">'+txt+'</span>';
}
function proPill(){ var p=document.getElementById('proSyncPill'); if(p){ p.outerHTML=proSyncLey(); } }
window.proNotaToggle=function(id){ CRM_FILTRO.proEdit=(CRM_FILTRO.proEdit===id?'':id); window.crmRenderTab(); };
window.proNotaSave=function(id){
  var el=document.getElementById('proNotaIn'); if(!el) return;
  var a=proLeer(), r=a.filter(function(x){ return x.id===id; })[0]; if(!r) return;
  r.g=actLimpia(el.value,200); r.act=proAhora(); proGuardar(a);
  CRM_FILTRO.proEdit=''; try{ toast('✏ nota guardada'); }catch(e){} window.crmRenderTab();
};
function proSyncPush(){
  try{ if(!token()||typeof req!=='function') return; }catch(e){ return; }
  proSyncSt('pend');
  clearTimeout(_proPushT);
  _proPushT=setTimeout(function(){ proSyncFlush(true); },12000);
}
function proUrl(){ try{ return 'https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/datos/prospeccion.json'; }catch(e){ return ''; } }
function proSyncFlush(reintento){
  var u=proUrl(); if(!u||!token()) return;
  req('GET',u+'?ref=main',undefined,function(st,j){
    var remotos=[], sha=undefined;
    if(st===200&&j&&j.content){ sha=j.sha;
      try{ remotos=(JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\s+/g,''))))).lista)||[]; }catch(e){ remotos=[]; }
    }
    var fusion=proMerge(remotos,proLeer()); proGuardarSilencio(fusion);
    var cuerpo={message:'prospección: sync',content:btoa(unescape(encodeURIComponent(JSON.stringify({v:1,ts:(new Date()).toISOString(),lista:fusion})))),branch:'main'};
    if(sha) cuerpo.sha=sha;
    req('PUT',u,cuerpo,function(st2){
      if(st2===200||st2===201){ proSyncSt('ok'); }
      if(st2===409&&reintento){ proSyncFlush(false); }
    });
  });
}
function proGuardarSilencio(a){ try{ LSs('pro_banco_cache',a); }catch(e){} }

/* ── v3.5.0 «Maestro» : exclusión sincronizada + reponer del maestro ── */
function maeHook(){ try{ return (typeof window!=='undefined'&&window._maeTest)||null; }catch(e){ return null; } }
function maeGet(path,cb){
  var h=maeHook(); if(h){ try{ cb(h.files[path]?200:404, h.files[path]); }catch(e){ cb(404,null); } return; }
  req('GET','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path)+'?ref=main',undefined,function(st,j){ cb(st,j); });
}
function maePut(path,doc,cb){
  if(maeHook()){ try{ var h2=maeHook(); h2.files[path]=doc; h2.puts=(h2.puts||0)+1; cb(200); }catch(e){ cb(500); } return; }
  try{
    var body={message:'CFB maestro',content:btoa(unescape(encodeURIComponent(JSON.stringify(doc)))),branch:'main'};
    req('GET','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path)+'?ref=main',undefined,function(st,j){
      if(st===200&&j&&j.sha) body.sha=j.sha;
      req('PUT','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path),body,function(st2){
        if(st2===409){ try{ salMarca('409',0,0); }catch(e9){}   /* Q7: choque de escritura (dos dispositivos a la vez) */
          req('GET','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path)+'?ref=main',undefined,function(st3,j3){
          if(st3===200&&j3&&j3.sha) body.sha=j3.sha;
          req('PUT','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path),body,function(st4){ cb(st4); });
        }); return; }
        cb(st2);
      });
    });
  }catch(e){ cb(500); }
}
function maeParse(j){
  if(!j) return null;
  if(j.content){ try{ return JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\s+/g,''))))); }catch(e){ return null; } }
  return (typeof j==='object')?j:null;
}
/* —— exclusión (lista «no llamar más») —— */
function excLeer(){ try{ return LSg('mae_exc_cache',{v:1,ts:'',items:[]})||{v:1,items:[]}; }catch(e){ return {v:1,items:[]}; } }
function excSave(d){ try{ LSs('mae_exc_cache',d); }catch(e){} excSyncPush(); }
var _excT=null;
function excSyncPush(){ try{ if(!token()||typeof req!=='function') return; }catch(e){ return; }
  clearTimeout(_excT); _excT=setTimeout(function(){ excSyncFlush(); },9000); }
function excMerge(lo,re_){ var m={}, i;
  (re_||[]).forEach(function(x){ if(x&&x.tel) m[x.tel]=x; });
  (lo||[]).forEach(function(x){ if(x&&x.tel&&(!m[x.tel]||String(x.ts||'')>=String(m[x.tel].ts||''))) m[x.tel]=x; });
  var out=[],k; for(k in m) out.push(m[k]);
  out.sort(function(a,b){ return String(b.ts||'')<String(a.ts||'')?-1:1; });
  return out; }
function excSyncFlush(){
  maeGet('datos/exclusion.json',function(st,j){
    var rem=[],sha;
    if(st===200){ var d=maeParse(j); if(d&&d.items) rem=d.items; }
    var fusion=excMerge(excLeer().items||[],rem);
    var doc={v:1,ts:(new Date()).toISOString(),items:fusion};
    try{ LSs('mae_exc_cache',doc); }catch(e){}
    excAplica();
    maePut('datos/exclusion.json',doc,function(st2){ });
  });
}
function excAdd(tel,motivo,ref){
  var t=proTelN(tel); if(t.length!==9||!motivo) return;
  var e=excLeer();
  e.items=(e.items||[]).filter(function(x){ return x.tel!==t; });
  e.items.unshift({tel:t,m:motivo,by:proMiSlug(),ts:(new Date()).toISOString(),ref:String(ref||'').slice(0,60)});
  excSave(e);
}
window.excQuitar=function(tel){ var e=excLeer(); e.items=(e.items||[]).filter(function(x){ return x.tel!==proTelN(tel); }); excSave(e); }; window.excFlush=function(){ excSyncFlush(); };
/* marca ⚫ en el banco lo que aparece en exclusión */
function excAplica(){
  try{
    var e=excLeer(), map={},i;
    (e.items||[]).forEach(function(x){ if(x&&x.tel) map[x.tel]=x; });
    var a=proLeer(), ch=0;
    a.forEach(function(r){
      var it=map[proTelN(r.tel)];
      if(it&&r.p.e!=='convertido'&&r.p.e!=='descartado'){
        r.p.e='descartado'; r.p.r='Descartado'; r.act=proAhora();
        (r.hist=r.hist||[]).unshift({f:hoyLocal(),h:(new Date()).toTimeString().slice(0,5),r:'Descartado',n:'⚫ exclusión ('+(it.m||'')+')'});
        ch++;
      }
    });
    if(ch){ try{ proGuardar(a); toast('⚫ '+ch+' potencial(es) pasa(n) a exclusión'); }catch(x){} window.crmRenderTab(); }
    return ch;
  }catch(e){ return 0; }
}
/* —— 📥 Reponer (maestro → banco) —— */
function maeIdxGet(cb){
  var c=null,str=''; try{ c=LSg('mae_idx_cache',null); if(c) str=JSON.stringify(c); }catch(e){}
  cb(c);
  maeGet('datos/maestro/idx.json',function(st,j){
    if(st===200){ var d=maeParse(j);
      if(d&&d.prov&&JSON.stringify(d)!==str){
        try{ LSs('mae_idx_cache',d); }catch(e){}
        cb(d);
        try{ if(CRM_FILTRO.proRepo){ window.crmRenderTab(); } }catch(x){}
      }
    }
  });
}
function maeActivosBanco(){ return proLeer().filter(function(r){ return r.p.e!=='convertido'&&r.p.e!=='descartado'; }).length; }
window.maeReponer=function(){ CRM_FILTRO.proRepo=1; CRM_FILTRO.proSesion=0; window.crmRenderTab(); };
function maeRepoHtml(){
  var hueco=Math.max(0,500-maeActivosBanco());
  var cab='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">'
    +'<button type="button" class="crm-chip" onclick="window.maeSalirRepo()">← Banco</button>'
    +'<button type="button" class="crm-chip" onclick="proVer(\'cli\')">👥 Clientes</button>'
    +proSyncLey()
    +'<span class="crm-pill">hueco en el banco: <b>'+hueco+'</b> / 500</span></div>';
  var exc=excLeer().items||[];
  var excHtml = exc.length
    ? ('<p style="font-size:.76rem;color:var(--gris-medio,#666);margin:6px 0">⚫ '+exc.length+' número(s) en la lista de exclusión «no llamar más» (se saltan solos).</p>')
    : '';
  var cont=document.createElement?null:null;
  var body;
  var idx=(function(){ try{ return LSg('mae_idx_cache',null); }catch(e){ return null; } })();
  if(!idx){ body='<div class="crm-empty">⏳ Descargando el índice del maestro… (si tarda, actualiza conexion o sincroniza)</div>'; }
  else {
    var miProvs=[];
    idx.prov.forEach(function(pr){ (pr.pun||[]).forEach(function(u){ miProvs.push({prov:pr.p,sec:u.sec||'varios',lote:u.id,libres:u.libres,total:u.total}); }); });
    if(!miProvs.length){ body='<div class="crm-empty">🕳 Índice sin puñados libres — corre el importador (tools/importa-maestro.py) para alimentar el maestro con tu CSV.</div>'; }
    else {
      var grupos={};
      miProvs.forEach(function(x){ (grupos[x.prov]=grupos[x.prov]||[]).push(x); });
      body='<div class="crm-rows" style="margin-bottom:6px">'+Object.keys(grupos).sort().map(function(pr){
        return '<b style="font-size:.9rem">'+xh(pr)+'</b>'+ grupos[pr].map(function(x){
          return '<div style="display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--gris-linea,#eee);padding:6px 2px">'
            +'<span class="crm-pill">'+xh(x.sec)+'</span>'
            +'<span style="flex:1;font-size:.8rem;color:var(--gris-medio,#666)">'+x.lote+' · <b>'+x.libres+'</b> libres</span>'
            +'<button type="button" class="btn" onclick="maeServirme(\''+x.lote+'\')" '+(x.libres<1||hueco<1?'disabled':'')+'>'+(hueco<1?'banco lleno':'📥 servirme')+'</button></div>'; }).join(''); }).join('')+'</div>';
    }
  }
  return '<div class="crm-wrap">'+cab+excHtml+'<div class="reglas">📥 <b>Reponer desde el maestro</b> — te sirves tú de los puñados libres; el primero que reclama se lo lleva (el índice está sincronizado entre todos los dispositivos).</div>'+body+'</div>';
}
window.maeSalirRepo=function(){ CRM_FILTRO.proRepo=0; window.crmRenderTab(); };
window.maeServirme=function(loteId){
  maeGet('datos/exclusion.json',function(st,j){
    if(st===200){ var d=maeParse(j); if(d&&d.items){ var doc={v:1,ts:(new Date()).toISOString(),items:excMerge(excLeer().items||[],d.items)}; try{ LSs('mae_exc_cache',doc); }catch(e){} } }
    maeClaimLote(loteId,2);
  });
};
function maeClaimLote(loteId,intentos){
  var hueco=Math.max(0,500-maeActivosBanco());
  if(hueco<1){ try{ toast('⚠ Banco lleno: convierte/descarta antes de reponer'); }catch(e){} return; }
  maeGet('datos/maestro/'+loteId+'.json',function(st,j){
    var doc=maeParse(j);
    if(!doc||!doc.items){ try{ toast('✘ No pude leer el '+loteId); }catch(e){} return; }
    var mi=proMiSlug(), ahora=(new Date()).toISOString(), tomar=Math.min(hueco,250), tomados=[];
    doc.items.forEach(function(it){
      if(tomar>0&&it.st==='libre'){ it.st='rec'; it.owner=mi; it.ts=ahora; tomar--; tomados.push(it); }
    });
    if(tomados.length===0){ try{ toast('🕳 '+loteId+' ya está tomado por otro compañero'); }catch(e){} maeIdxGet(function(){}); window.crmRenderTab(); return; }
    maePut('datos/maestro/'+loteId+'.json',doc,function(st2){
      if(st2===409&&intentos>1){ maeClaimLote(loteId,intentos-1); return; }
      if(st2!==200&&st2!==201){ try{ toast('✘ Error guardando la reclamación ('+st2+')'); }catch(e){} return; }
      var a=proLeer(), e=excLeer(), excMap={}, i;
      (e.items||[]).forEach(function(x){ if(x&&x.tel) excMap[x.tel]=1; });
      var dentro=0,saltados=0;
      tomados.forEach(function(it){
        if(maeActivosBanco()+dentro>=500){ saltados++; return; }
        var t=proTelN(it.tel);
        if(excMap[t]||a.filter(function(r){ return proTelN(r.tel)===t&&r.p.e!=='convertido'; })[0]){ saltados++; return; }
        var r=proNorm({n:it.n,tel:it.tel,c:it.c,s:it.s,g:it.nota||'',fuente:'lote '+loteId.replace('lote_','')});
        r.owner=mi; a.push(r); dentro++;
      });
      if(dentro){ proGuardar(a); }
      try{ toast('📥 +'+dentro+' de '+loteId+(saltados?(' ('+saltados+' saltados: dup/exclusión/cupo)'):'')); }catch(x){}
      maeIdxRefresco();
      window.crmRenderTab();
    });
  });
}
function maeIdxRefresco(){ try{ LSs('mae_idx_cache',null); }catch(e){} maeIdxGet(function(){}); }
/* arranque: refresco de exclusión tras banco (para marcar ⚫ lo que pida otra compañera) */
if(typeof window!=='undefined') setTimeout(function(){
  try{ if(token()&&typeof req==='function'){ excSyncFlush(); } }catch(e){}
},6000);
/* baja del banco al arrancar (mejor caso: silencio total sin clave/red) */
if(typeof window!=='undefined') setTimeout(function(){
  try{ if(token()&&typeof req==='function'&&proUrl()){ proSyncFlushOnce(); } }catch(e){}
},4000);
function proSyncFlushOnce(){
  var u=proUrl(); if(!u) return;
  req('GET',u+'?ref=main',undefined,function(st,j){
    if(st===200&&j&&j.content){
      var remotos=[];
      try{ remotos=(JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\s+/g,''))))).lista)||[]; }catch(e){}
      if(remotos.length){ proGuardarSilencio(proMerge(remotos,proLeer())); try{ if(CRM_FILTRO.seg==='pot') window.crmRenderTab(); }catch(e){} }
    }
  });
}
/* ── UI del segmento dentro de la pestaña 👥 Clientes ── */
if(typeof CRM_FILTRO!=='undefined'&&!CRM_FILTRO.seg) CRM_FILTRO.seg='cli'; /* lazy: se fija al primer render */
window.proVer=function(seg){ CRM_FILTRO.seg=seg; window.crmRenderTab(); };
function proConteo(a){ var t={tot:0,sin:0,hoy:0,cal:0},h=hoyLocal();
  a.forEach(function(r){ if(r.p.e==='convertido'||r.p.e==='descartado') return; t.tot++;
    if(r.p.n===0) t.sin++; if(r.p.pf&&r.p.pf<=h) t.hoy++;
    if(r.p.e==='contacto'&&r.p.r!=='No contesta'&&r.p.r!=='No disponible'&&r.p.r!=='No interesado/a') t.cal++; });
  return t; }
function proHtml(){
  var a=proLeer().filter(function(r){ return r.p.e!=='convertido'; });
  var q=(CRM_FILTRO.proQ||'').toLowerCase(), chip=CRM_FILTRO.proChip||'hoy', h=hoyLocal();
  var c=proConteo(a), ow=CRM_FILTRO.proOwner||'', mi=proMiSlug(), edit=CRM_FILTRO.proEdit||'';
  var vista=a.filter(function(r){
    if(ow==='mio'&&r.owner!==mi) return false;
    if(ow==='otros'&&r.owner===mi) return false;
    if(chip==='sin'&&r.p.n>0) return false;
    if(chip==='hoy'&&!(r.p.pf&&r.p.pf<=h)) return false;
    if(chip==='cal'&&!(r.p.e==='contacto'&&r.p.r!=='No contesta'&&r.p.r!=='No disponible'&&r.p.r!=='No interesado/a')) return false;
    if(chip==='desc'&&r.p.e!=='descartado') return false;
    if(chip!=='desc'&&r.p.e==='descartado') return false;
    if(q&&(r.n.toLowerCase().indexOf(q)<0&&r.tel.indexOf(q)<0&&r.c.toLowerCase().indexOf(q)<0)) return false;
    return true;
  });
  if(chip==='ruta'){ vista.sort(function(x,y){ var d=String(x.c||'').localeCompare(String(y.c||'')); if(d) return d; var ax=(x.p.pf||'9999'), ay=(y.p.pf||'9999'); if(ax!==ay) return ax<ay?-1:1; return x.n<y.n?-1:1; }); }
  else { vista.sort(function(x,y){ var ax=(x.p.pf||'9999'), ay=(y.p.pf||'9999'); if(ax!==ay) return ax<ay?-1:1; return y.act-x.act; }); }
  var filas=vista.slice(0,120).map(function(r){
    var resOpts=PRO_RES.map(function(x){ return '<option'+(r.p.r===x?' selected':'')+'>'+x+'</option>'; }).join('');
    var hist=(r.hist||[]).map(function(g){ return '<li>'+g.f.slice(8,10)+'/'+g.f.slice(5,7)+' '+g.h+' — '+g.r+'</li>'; }).join('');
    var meta=(r.c?('📍'+r.c+' · '):'')+(r.s||'')+((r.owner&&r.owner!=='comun')?(' · 👤'+r.owner):'');
    var reintento=(r.p.e!=='descartado'&&r.p.pf)?(' · <b style="color:'+(r.p.pf<=h?'#C62828':'inherit')+'">↺ '+r.p.pf.slice(8,10)+'/'+r.p.pf.slice(5,7)+'</b>'):'';
    return '<details style="border-bottom:1px solid var(--gris-linea,#E5E5E5);padding:9px 2px"><summary style="cursor:pointer;display:flex;gap:8px;align-items:center;flex-wrap:wrap;list-style:none">'
      +'<b style="flex:1;min-width:170px">'+xh(r.n)+'</b>'
      +(r.tel?'<a href="tel:'+r.tel+'" style="text-decoration:none">☎'+r.tel+'</a>':'')
      +(r.p.n?('<span class="auto" title="intentos">'+r.p.n+'🔁</span>'):'<span class="auto">sin llamar</span>')
      +(r.p.e==='descartado'?'<span class="auto" style="color:#C62828">descartado</span>':reintento)
      +'</summary>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0 6px">'
      +'<span style="font-size:.78rem;color:var(--gris-medio,#666)">'+meta+'</span>'
      +(r.g?('<span class="auto" title="nota">✏ '+xh(r.g)+'</span>'):'')
      +(edit===r.id
        ?('<span style="display:inline-flex;gap:6px;align-items:center"><input id="proNotaIn" maxlength="200" style="font-size:.78rem;padding:4px 8px;border:1px solid var(--gris-linea,#ddd);border-radius:8px;width:min(280px,72%)" value="'+String(r.g||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\"/g,'&quot;')+'" placeholder="nota rápida (aparca, dueña, horario…)"><button type="button" class="btn" onclick="proNotaSave(\''+escattr(r.id)+'\')">💾</button></span>')
        :('<button type="button" class="crm-chip" onclick="proNotaToggle(\''+escattr(r.id)+'\')">✏</button>'))
      +'<select onchange="if(this.value){ proResultado(\'' +escattr(r.id)+'\',this.value); window.crmRenderTab(); }" style="border:1px solid var(--gris-linea,#ddd);border-radius:999px;padding:5px 9px;font-size:.78rem"><option value="">➜ resultado de la llamada…</option>'+resOpts+'</select>'
      +'<button type="button" class="btn" onclick="proPrepLlamada(\''+escattr(r.id)+'\')">📞 Llamar</button>'
      +(r.p.e!=='descartado'?'<button type="button" class="btn" onclick="if(confirm(\''+'¿Convertir «'+escattr(r.n)+'» a ficha de cliente?\')){ proConvertir(\''+escattr(r.id)+'\',\'nuevo\'); }">→ cliente</button>':'')
      +'<button type="button" class="btn" style="color:#C62828" onclick="if(confirm(\'¿Borrar a '+'«'+escattr(r.n)+'» del banco de potenciales?\')){ proBorrar(\''+escattr(r.id)+'\'); }">🗑</button>'
      +'</div>'
      +(hist?('<ul style="margin:4px 0 6px 18px;font-size:.76rem;color:var(--gris-medio,#666)">'+hist+'</ul>'):'')
      +'</details>';
  }).join('');
  return filas;
}
function escattr(s){ return String(s||'').replace(/[^a-zA-Z0-9_\-]/g,'').slice(0,40); }
window.proBorrar=function(id){ var a=proLeer().filter(function(r){ return r.id!==id; }); proGuardar(a); window.crmRenderTab(); };
window.proChip=function(c){ CRM_FILTRO.proChip=c; window.crmRenderTab(); };
window.proQ=function(v){ CRM_FILTRO.proQ=v; window.crmRenderTab(); };
window.proAltaForm=function(){
 var N=document.getElementById('proN'),T=document.getElementById('proT'),C=document.getElementById('proC'),S=document.getElementById('proS');
  var n=(N&&N.value||'').trim(); if(!n){ try{ toast('✘ Pon el nombre/local'); }catch(e){} return; }
  var r=proAlta({n:n,tel:(T&&T.value||''),c:(C&&C.value||''),s:(S&&S.value||''),fuente:'manual'});
  if(r&&r.dup){ try{ toast('⚠ Ya estaba en el banco: '+r.dup.n); }catch(e){} window.proQ(r.dup.n); return; }
  if(r&&r.n){ if(N) N.value=''; if(T) T.value=''; try{ toast('➕ '+r.n+' al banco de potenciales'); }catch(e){} window.crmRenderTab(); }
};
/* G7 (ADR-006): importar extractos IBERCRM → banco compartido (con ibe_id y marca de origen) */
window.proIbcParse=function(txt){
  var lineas=String(txt||'').split(/\r?\n/).map(function(l){ return l.trim(); }).filter(function(l){ return l; });
  if(!lineas.length) return {filas:[],saltadas:0,dupesInternos:0,sep:'.'};
  var sep=(lineas[0].split('\t').length>2?'\t':(lineas[0].split(';').length>2?';':(lineas[0].split('|').length>2?'|':(lineas[0].indexOf(',')>-1?',':';'))));
  function cols(l){ return l.split(sep).map(function(x){ return x.trim(); }); }
  var cab=cols(lineas[0]).map(function(h){ return h.toLowerCase().replace(/^\"|\"$/g,''); });
  function idx(variantes){ for(var v=0;v<variantes.length;v++){ var p=cab.indexOf(variantes[v]); if(p>-1) return p; } return -1; }
  var cN=idx(['nombre','empresa','cuenta','cliente','razón social','razon','comercial']);
  var cT=idx(['telefono','teléfono','tel','móvil','movil','telf']);
  var cC=idx(['ciudad','municipio','localidad','población','poblacion','provincia']);
  var cS=idx(['sector','actividad','cnae','tipo']);
  var cI=idx(['ibe_id','ibeid','codigo cliente','código cliente','id ibe','id_ibe','cups','ref. cliente','ref']);
  var cF=idx(['factura','importe','cuota','factura €','factura €/mes']);
  var caber=(cN>-1&&cT>-1);
  var altas=[], salt=0;
  for(var L=(caber?1:0);L<lineas.length;L++){
    var p=cols(lineas[L]);
    if(!p.length||((p.join('')).length<2)){ salt++; continue; }
    if(caber){
      var nom=p[cN]||''; if(!nom){ salt++; continue; }
      altas.push({n:nom, tel:cT>-1?(p[cT]||''):'', c:cC>-1?(p[cC]||''):'', s:cS>-1?(p[cS]||''):'', i:cI>-1?(p[cI]||''):'', g:(cF>-1&&p[cF])?('factura: '+p[cF]):''});
    }else{
      if(!p[0]){ salt++; continue; }
      altas.push({n:p[0]||'', tel:p[1]||'', c:p[2]||'', s:p[3]||'', i:p[4]||'', g:''});
    }
  }
  var porTel={}, unicas=[], dupes=0;
  altas.forEach(function(r){ var t=String(r.tel||'').replace(/[^0-9+]/g,''); if(t&&porTel[t]){ dupes++; return; } if(t) porTel[t]=1; unicas.push(r); });
  return {filas:unicas, saltadas:salt, dupesInternos:dupes, sep:(sep==='\t'?'tab':sep)};
};
/* alta de filas IBERCRM ya parseadas (marca de origen IBERCRM en todas) — usada por el panel y por los tests */
window.proIbcAlta=function(filas){
  var dups=0, altasN=0;
  (filas||[]).forEach(function(r){
    var q=proAlta({n:r.n,tel:r.tel,c:r.c,s:r.s,i:r.i,g:r.g,fuente:'IBERCRM(patrimonio)'});
    if(q&&q.dup) dups++; else if(q&&q.n) altasN++;
  });
  return {altas:altasN, yaEstaban:dups};
};
window.proImportaIbc=function(){
  var ta=document.getElementById('proIbcTa'); if(!ta) return;
  var res=proIbcParse(ta.value);
  var aq=proIbcAlta(res.filas); var dups=aq.yaEstaban, altasN=aq.altas;
  ta.value='';
  try{ toast('🟥 IBERCRM: '+altasN+' al banco'+(dups?(' · '+dups+' ya estaban'):'')+(res.dupesInternos?(' · '+res.dupesInternos+' duplicados en el pegado'):'')+(res.saltadas?(' · '+res.saltadas+' líneas vacías'):'')); }catch(e){}
  try{ if(window.actAdd) actAdd('crm',{detalle:'Import IBERCRM',resultado:altasN+' altas',ciudad:''}); }catch(e){}
  window.crmRenderTab();
};

/* ⬆ importador genérico (Nombre;Tel;Ciudad;Sector) — se mantiene */
window.proImporta=function(){
  var ta=document.getElementById('proImportTa'); if(!ta) return;
  var lineas=ta.value.split(/\r?\n/), altas=0, salt=0;
  lineas.forEach(function(l){
    l=l.trim(); if(!l) return;
    var partes=l.split(/[;\t,]/).map(function(x){return x.trim();});
    var r=proAlta({n:partes[0]||'',tel:partes[1]||'',c:partes[2]||'',s:partes[3]||'',fuente:'import'});
    if(r&&r.dup) salt++; else if(r&&r.n) altas++;
  });
  ta.value='';
  try{ toast('⬆ Importados: '+altas+(salt?(' · '+salt+' ya estaban'):'')); }catch(e){}
  window.crmRenderTab();
};


/* Render de la pestaña 👥 Clientes */
var CRM_FILTRO={estado:'',q:''};
window.crmFiltro=function(k,v){ CRM_FILTRO[k]=v; window.crmRenderTab(); };
/* — v3.12.0 «Hoy» (F3 · ADR-005): agenda diaria unificada + navegación de segmentos — */
function Tc(s){ try{ return cfaT(window.cfaLang||'es',s); }catch(e){ return s; } }        /* traductor compacto (ES si falta clave) */
window.crmDia=function(){
  var o=cliLeer(), h=hoyLocal(), ven=[], toc=[];
  Object.keys(o).forEach(function(n){
    var f=crmNorm(o[n]); if(!crmAbierto(f.estado)||!f.prox||!f.prox.f) return;
    if(f.prox.f<h) ven.push({n:n,f:f}); else if(f.prox.f===h) toc.push({n:n,f:f});   /* futuras NO entran (bug cazado por W19-9) */
  });
  var so=function(a,b){ var pa=a.f.prox.f+(a.f.prox.h||'99:99'), pb=b.f.prox.f+(b.f.prox.h||'99:99'); return pa<pb?-1:(pa>pb?1:(a.n<b.n?-1:1)); };
  ven.sort(so); toc.sort(so);
  var pot=[]; try{ pot=proTocaHoy().slice(0,6); }catch(e){}
  var lam=0; try{ if(window.cfbHoyLlamadas) lam=window.cfbHoyLlamadas()||0; }catch(e){}
  return {vencidas:ven, hoy:toc, pot:pot, llamadas:lam};
};
window.crmIrFicha=function(nombre){ CRM_FILTRO.estado=''; CRM_FILTRO.q=''; window.proVer('cli'); window.crmAbrir(nombre); };
function crmSegBar(act){
  var D=window.crmDia(), nT=D.vencidas.length+D.hoy.length;
  function c(id,label){ return '<button type="button" class="crm-chip'+(act===id?' on':'')+'" onclick="proVer(\''+id+'\')">'+label+'</button>'; }
  var eq=cliSyncEstado().on;
  var preN=0; try{ preN=preLista().length; }catch(eP){}
  var extra='<button type="button" class="crm-chip" title="'+Tc(eq?'F5: fichas con el equipo ON (clic para sincronizar ahora)':'F5: sin clave de equipo — solo en este móvil')+'" onclick="cliSyncAhora()">⇄ '+Tc('Equipo')+': '+(eq?'ON':'OFF')+'</button>'
   +'<button type="button" class="crm-chip'+(CRM_FILTRO.rgpd?' on':'')+'" title="'+Tc('RGPD: privacidad, derechos y borrado de persona')+'" onclick="crmRgpdToggle()">ℹ RGPD</button>';
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:4px 0 8px">'+c('hoy','☀ '+Tc('Hoy')+(nT?' <b>('+nT+')</b>':''))+c('cli','👥 '+Tc('Clientes'))+c('pot','📋 '+Tc('Potenciales'))+c('pre','💶 '+Tc('Ofertas')+(preN?' <b>('+preN+')</b>':''))+extra+'</div>'+(CRM_FILTRO.rgpd?crmRgpdCard():'');
}
window.crmHoyHtml=function(){
  var D=window.crmDia(), h=hoyLocal();
  var RGO=[]; try{ RGO=crmRiesgoList(); }catch(eR){}                      /* F22: riesgo de fuga (ADR-013) */
  function fila(it,roja){
    var f=it.f, e=encURI(it.n), d=crmDef(f.estado);
    return '<div class="crm-fila" style="border-color:'+(roja?'#D9534F':'#F3C267')+';cursor:pointer" onclick="crmIrFicha(decodeURIComponent(\''+e+'\'))">'
      +'<span class="crm-badge" style="background:'+d[2]+'">'+d[1]+'</span>'
      +'<span class="crm-f"><span class="crm-n">'+xh(it.n)+'</span><div class="crm-m">'
      +(roja?('📅 '+xh(f.prox.f)+' · '):'')+(f.prox.h?('🕐 '+xh(f.prox.h)+' '):'')+xh(f.prox.accion||Tc('(próxima acción sin descripción)'))
      +(tel_de(f)?(' · ☎'+xh(tel_de(f))):'')+(f.valor?(' · 💶 '+xh(f.valor)+' €'):'')+'</div></span>'
      +'<button type="button" class="crm-btn sec" style="padding:4px 10px" title="'+Tc('Preparar llamada')+'" onclick="event.stopPropagation();cliPrepLlamadaSafe(decodeURIComponent(\''+e+'\'))">📞</button></div>';
  }
  var hdr='<div class="reglas"><h4>☀ '+Tc('Hoy')+' — '+h+' <button type="button" class="crm-btn sec" style="padding:4px 10px;font-size:.8rem" onclick="infAbrir()">📄 '+Tc('Informe')+'</button> <button type="button" class="crm-btn sec" style="padding:4px 10px;font-size:.8rem" title="'+Tc('Pool OMIE: precio del mercado diario')+'" onclick="omieAbrir()">⚡</button></h4>'+Tc('La agenda del día: pendientes vencidos de clientes, lo que toca y los potenciales a reintentar — todo a un toque.')+'</div>';
  var stats='<div class="crm-stats"><span class="crm-kpi">📞 <b>'+D.llamadas+'</b> '+Tc('llamadas hoy')+'</span>'
    +'<span class="crm-kpi">⚠ <b>'+D.vencidas.length+'</b> '+Tc('vencidas')+'</span>'
    +'<span class="crm-kpi">🕐 <b>'+D.hoy.length+'</b> '+Tc('toca hoy')+'</span>'
    +'<span class="crm-kpi">🔥 <b>'+D.pot.length+'</b> '+Tc('potenciales')+'</span>'
    +(RGO.length?('<span class="crm-kpi" style="color:#B91C1C">🧯 <b>'+RGO.length+'</b> '+Tc('en riesgo')+'</span>'):'')+'</div>';
  var ven=D.vencidas.length?('<div class="crm-hoy"><b style="color:#B91C1C">⚠ '+Tc('Vencidas')+' ('+D.vencidas.length+')</b><div>'+D.vencidas.map(function(it){ return fila(it,true); }).join('')+'</div></div>'):'';
  var toc=D.hoy.length?('<div class="crm-hoy"><b>🕐 '+Tc('Toca hoy')+' ('+D.hoy.length+')</b><div>'+D.hoy.map(function(it){ return fila(it,false); }).join('')+'</div></div>'):'';
  var rgo=RGO.length?('<div class="crm-hoy"><b style="color:#B91C1C">🧯 '+Tc('Riesgo de fuga')+' ('+RGO.length+')</b><div>'
    +RGO.slice(0,5).map(function(it){ var ee=encURI(it.n);
      return '<div class="crm-fila" style="border-color:#D9534F;cursor:pointer" onclick="crmIrFicha(decodeURIComponent(\''+ee+'\'))">'
      +'<span class="crm-badge" style="background:'+(it.sc>=40?'#B91C1C':'#D97706')+'">🧯 '+it.sc+'</span>'
      +'<span class="crm-f"><span class="crm-n">'+xh(it.n)+'</span><div class="crm-m">'+it.por.map(xh).join(' · ')+'</div></span>'
      +'<button type="button" class="crm-btn sec" style="padding:4px 10px" title="'+Tc('Preparar llamada')+'" onclick="event.stopPropagation();cliPrepLlamadaSafe(decodeURIComponent(\''+ee+'\'))">📞</button></div>'; }).join('')
    +(RGO.length>5?('<div class="crm-mini" style="padding:4px 2px">+ '+(RGO.length-5)+' '+Tc('más en la pestaña Clientes')+'</div>'):'')
    +'</div></div>'):'';
  var pot=D.pot.length?('<div class="crm-hoy"><b>🔥 '+Tc('Potenciales a reintentar')+' ('+D.pot.length+')</b><div>'
    +D.pot.slice(0,5).map(function(r){ return '<div class="crm-fila" style="cursor:pointer" onclick="CRM_FILTRO.proChip=\'hoy\';proVer(\'pot\')"><span class="crm-f"><span class="crm-n">'+xh(r.n)+'</span><div class="crm-m">'+(r.tel?('☎'+xh(r.tel)+' · '):'')+xh(r.c||'')+(r.p.n?(' · '+r.p.n+' '+Tc('intentos')):'')+'</div></span></div>'; }).join('')
    +(D.pot.length>5?('<div class="crm-mini" style="padding:4px 2px">+ '+(D.pot.length-5)+' '+Tc('más en el banco')+'</div>'):'')
    +'</div><div style="margin-top:6px"><button type="button" class="crm-btn" onclick="CRM_FILTRO.proChip=\'hoy\';proVer(\'pot\')">🔥 '+Tc('Ir al banco de hoy')+'</button></div></div>'):'';
  var vacio=(!D.vencidas.length&&!D.hoy.length&&!D.pot.length&&!RGO.length)?('<div class="cfb-nota" style="padding:14px 4px;font-size:.95rem">🌞 '+Tc('Día limpio: nada vencido ni con fecha de hoy. Propón siempre una próxima acción al terminar la llamada y aparecerá aquí sola.')+'</div>'):'';
  var sob=''; try{ sob=crmSobranHtml(); }catch(e){}                      /* F7-4: retención 12 meses sugerida */
  return crmSegBar('hoy')+hdr+stats+busAvisosCard()+ven+toc+rgo+pot+sob+vacio;
};

/* — 4.0.3 «Simulador de potencia» (F18+ · ADR-008): parseo local → regla 2.0/3.0TD → propuesta imprimible — */
var SIM_PREC20=[35,3], SIM_PREC30=[13,8,5,3,2,1.5], SIM_MARGEN_DEF=10;
window.simParseFactura=function(txt){
  var res={tipo:'',nombre:'',pa:[null,null,null,null,null,null],ok:false};
  txt=String(txt||'');
  var map={};
  var re=/P\.?\s*([1-6])\s*[:.]?\s*([0-9]{1,4}(?:[.,][0-9]{1,3})?)\s*kW(?![hH])/gi, mm;
  while((mm=re.exec(txt))!==null){ var v=parseFloat(String(mm[2]).replace(',','.')); if(v>0&&v<20000) map[(~~mm[1])-1]=v; }
  var re2=/contratad\w*(?:\s|\.)*P\.?\s*([1-6])\s*[:=.\s]+([0-9]{1,4}(?:[.,][0-9]{1,3})?)/gi;
  while((mm=re2.exec(txt))!==null){ var i2=(~~mm[1])-1; if(map[i2]===undefined){ var v2=parseFloat(String(mm[2]).replace(',','.')); if(v2>0&&v2<20000) map[i2]=v2; } }
  var hits=Object.keys(map).length;
  if(!hits) return res;
  var mN=/(?:Nombre|Titular|Cliente|Empresa)\s*[:.]\s*([^\n\r\.]{3,60})/i.exec(txt);
  if(mN) res.nombre=mN[1].trim();
  res.ok=true;
  if(hits<=2&&map[2]===undefined){ res.tipo='20'; res.pa=[(map[0]||null),(map[1]||null),null,null,null,null]; }
  else { res.tipo='30'; res.pa=[(map[0]||null),(map[1]||null),(map[2]||null),(map[3]||null),(map[4]||null),(map[5]||null)]; }
  return res;
};
/* Regla F18-1 (ADR-008): por periodo, con demanda real (max 12m) y margen % editable:
   popt = ceil(demanda × (1+margen) × 100)/100 · sin dato → no se toca (sin cambio). 0 red → determinista. */
window.simRegla=function(tipo,pa,pd,opts){
  opts=opts||{};
  var margen=Number(opts.margen); if(!(margen>=0)) margen=SIM_MARGEN_DEF;
  var base=(tipo==='20'?SIM_PREC20:SIM_PREC30);
  var precios=[]; for(var i=0;i<6;i++){ pv=(opts.precios&&opts.precios[i]);
    precios.push((pv===undefined||pv===null||!(pv>=0))?(base[i]||0):pv); }
  var np=(tipo==='20'?2:6), periodos=[], ahorro=0;
  for(i=0;i<np;i++){
    var pA=Math.max(0,Number(pa[i])||0), dM=Math.max(0,Number(pd[i])||0), pre=precios[i];
    var accion,pO;
    if(dM<=0){ accion='≈ sin cambio (aportar maximétero)'; pO=pA; }
    else{
      pO=Math.ceil(dM*(1+margen/100)*100-1e-9)/100;
      accion=(pO<pA)?'📉 BAJAR':((pO>pA)?'📈 SUBIR':'✔ óptima ya');
    }
    pO=+(+pO).toFixed(2);
    var delta=(pA>0||dM>0)?+(pO-pA).toFixed(2):0;
    var ah=+((pA-pO)*pre).toFixed(2);   /* €/año: + = ahorro, − = coste extra (si sube) */
    ahorro=+(ahorro+ah).toFixed(2);
    periodos.push({p:'P'+(i+1),pa:pA,dem:dM,popt:pO,delta:delta,ah:ah,accion:accion,pre:pre});
  }
  return {tipo:tipo,periodos:periodos,ahorro:ahorro,margen:margen,precios:precios.slice(0,np)};
};
window.crmSimAbrir=function(nombre){ CRM_FILTRO.sim=1; CRM_FILTRO.simCli=nombre||''; window.crmRenderTab(); };
window.crmSimSalir=function(){ CRM_FILTRO.sim=0; window.crmRenderTab(); };
window.simPegar=function(){
  var ta=g('simTa'); if(!ta||!ta.value.trim()){ try{ toast('✘ Pega antes el texto de la factura'); }catch(e){} return; }
  var p=simParseFactura(ta.value);
  if(!p.ok){ try{ toast('✘ No he sido capaz de leer potencias (P1…P6 kW) — rellénalas abajo a mano'); }catch(e){} return; }
  if(p.nombre&&!CRM_FILTRO.simCli){ var cm=g('simCliManual'); if(cm) cm.value=p.nombre; }
  var np=(p.tipo==='20'?2:6);
  var st=g('simTipo'); if(st){ st.value=p.tipo; }
  window.crmSimHtml._deferPa=p.pa;
  try{ toast('📄 leída: '+(p.tipo==='20'?'2.0TD':'3.0TD')+(p.nombre?(' · '+p.nombre):'')); }catch(e){}
  window.crmRenderTab();
};
window.simCalc=function(){
  var tipo=(g('simTipo')&&g('simTipo').value)||'20';
  if(tipo!=='30') tipo='20';
  var np=(tipo==='20'?2:6), pa=[], pd=[], precios=[];
  for(var i=1;i<=6;i++){
    if(i<=np){
      pa.push(parseFloat(String((g('simP'+i)||{value:''}).value||'').replace(',','.'))||0);
      pd.push(parseFloat(String((g('simD'+i)||{value:''}).value||'').replace(',','.'))||0);
      var pv=parseFloat(String((g('simPre'+i)||{value:''}).value||'').replace(',','.'));
      precios.push((pv>=0)?pv:null);
    }else{ precios.push(null); }
  }
  var margen=parseFloat(String((g('simMargen')||{value:''}).value||'').replace(',','.'));
  var res=simRegla(tipo,pa,pd,{margen:margen,precios:precios});
  var nombre=CRM_FILTRO.simCli||((g('simCliManual')&&g('simCliManual').value||'').trim())||'(empresa sin nombre)';
  window._simRes={empresa:nombre,tipo:tipo,res:res,f:hoyLocal()};
  var el=g('simRes'); if(el){
    var filas=res.periodos.map(function(pp){
      return '<tr><td>'+pp.p+'</td><td>'+pp.pa+'</td><td>'+(pp.dem||'—')+'</td><td><b>'+pp.popt+'</b></td><td>'+pp.accion+'</td><td>'+pp.ah.toFixed(2)+' €</td></tr>';
    }).join('');
    el.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:.82rem;margin-top:8px">'
      +'<thead><tr><th style="text-align:left">Periodo</th><th>Contratada (kW)</th><th>Demanda 12m</th><th>Propuesta</th><th>Decisión</th><th>€/año</th></tr></thead><tbody>'+filas+'</tbody></table>'
      +'<div style="margin:10px 0;font-size:1.05rem"><b>Ahorro estimado: '+(res.ahorro>=0?'':'−')+Math.abs(res.ahorro).toFixed(2)+' €/año</b> <span class="crm-mini">(con los precios €/kW·año visibles arriba · margen '+res.margen+'%)</span></div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="crm-btn" onclick="simImprimir()">🖨 Imprimir propuesta (PDF)</button>'
      +'<button type="button" class="crm-btn sec" onclick="simAnotar()">💾 Anotar en la ficha</button></div>';
  }
  return res;
};
window.simImprimir=function(){
  var r=window._simRes; if(!r){ try{ toast('✘ Calcula la propuesta antes'); }catch(e){} return; }
  var viejo=document.getElementById('cfbSimPrint'); if(viejo) viejo.remove();
  var perfil=(function(){ try{ return LSg('cfb_perfil',{})||{}; }catch(e){ return {}; } })();
  var filas=r.res.periodos.map(function(pp){
    return '<tr><td>'+pp.p+'</td><td>'+pp.pa+'</td><td>'+(pp.dem||'—')+'</td><td><b>'+pp.popt+'</b></td><td>'+pp.accion.replace(' (aportar maximétero)','')+'</td><td>'+pp.ah.toFixed(2)+' €</td></tr>';
  }).join('');
  var h='<div id="cfbSimPrint"><div class="sp-head"><div class="sp-logo">Call Flow Business · B&M Asesores Energéticos</div>'
    +'<div class="sp-sub">Propuesta de optimización de potencia · Formato: '+(r.tipo==='20'?'2.0TD':'3.0TD')+' · '+xh(r.f)+' · v'+VERSION+'</div>'
    +'<div style="font-size:15px;font-weight:600;margin-top:8px">'+xh(r.empresa)+'</div></div>'
    +'<table><thead><tr><th>Periodo</th><th>Contratada (kW)</th><th>Demanda 12 m</th><th>Propuesta (kW)</th><th>Decisión</th><th>€/año</th></tr></thead><tbody>'+filas+'</tbody></table>'
    +'<div class="sp-ahorro">Ahorro estimado: '+(r.res.ahorro>=0?'':'−')+Math.abs(r.res.ahorro).toFixed(2)+' €/año</div>'
    +'<div class="sp-nota">Cálculo: potencia propuesta = demanda real (máximos de los últimos 12 meses) + margen de seguridad del '+r.res.margen+'% (redondeado al alza, 2 decimales). '
    +'Importes con los precios €/kW·año que aparecían en pantalla al generar (editables: discuta el precio con la comercializadora, no la regla). '
    +(((perfil.nombre)||'')?('Elaborada por '+xh(perfil.nombre)+' · '):'')+'Documento generado en el dispositivo del comercial: la factura origen no salió de este móvil en ningún momento.</div>'
    +'<div class="sp-firma"><div>El/La cliente</div><div>B&M Asesores Energéticos</div></div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('cfb-printing');
  var fin=function(){ document.body.classList.remove('cfb-printing'); var o=document.getElementById('cfbSimPrint'); if(o) o.remove(); };
  window.addEventListener('afterprint',fin);
  window.print(); setTimeout(fin,1500);
};
window.simAnotar=function(){
  var r=window._simRes; if(!r){ try{ toast('✘ Calcula la propuesta antes'); }catch(e){} return; }
  var nombre=CRM_FILTRO.simCli||((g('simCliManual')&&g('simCliManual').value||'').trim())||'';
  if(!nombre){ try{ toast('✘ Escribe la empresa (o abre el simulador desde su ficha)'); }catch(e){} return; }
  var lineas=r.res.periodos.filter(function(pp){ return pp.dem>0; }).map(function(pp){ return pp.p+' '+pp.pa+'→'+pp.popt+' kW'; }).join(' · ');
  if(!lineas) lineas='sin cambios (aportar maximétero)';
  cliAnadir(nombre,'📄 Simulación potencia ('+(r.tipo==='20'?'2.0TD':'3.0TD')+'): '+lineas+' — ahorro estimado ~'+r.res.ahorro.toFixed(2)+' €/año');
  /* puente al embudo (el arma de venta): el producto del catálogo queda Ofertado */
  var idProd=(r.tipo==='20'?'tarifa20':'tarifa30');
  var f=crmNorm((cliLeer()[cliNorm(nombre)])||{}), ix=-1;
  f.pis.forEach(function(p,i2){ if(p.id===idProd) ix=i2; });
  if(ix<0){ f.pis.push({id:idProd,est:'oferta',nota:'simulación '+hoyLocal()}); }
  else if(f.pis[ix].est==='prep'){ f.pis[ix].est='oferta'; }
  cliUp(nombre,{pis:f.pis});
  try{ if(window.actAdd) actAdd('crm',{detalle:'Simulación potencia '+(r.tipo==='20'?'2.0TD':'3.0TD'),resultado:(r.res.ahorro.toFixed(2)),ciudad:f.ciudad}); }catch(e2){}
  try{ busEmite('sim.hecha',{nombre:cliNorm(nombre),tipo:r.tipo,ahorro:Math.round(r.res.ahorro),idProd:idProd}); }catch(eB){}   /* F4 */
  try{ toast('💾 Anotado en '+nombre+' ('+idProd+' → Ofertado)'); }catch(e3){}
  window.crmRenderTab();
};
window.crmSimHtml=function(){
  var cli=CRM_FILTRO.simCli||'', tipo=CRM_FILTRO.simTipo||'20', np=(tipo==='20'?2:6);
  var pre=(tipo==='20'?SIM_PREC20:SIM_PREC30), defer=window.crmSimHtml._deferPa||null;
  var grid=', '.replace;   /* (guardia de minificación) */
  var inputs='';
  for(var i=1;i<=6;i++){
    var dis=(i>np);
    var vP=(!dis&&defer&&defer[i-1]!=null)?(' value="'+defer[i-1]+'"'):'';
    inputs+='<div style="'+(dis?'opacity:.35;':'')+'display:grid;gap:3px"><span class="crm-mini">P'+i+' kW actual '+(dis?'(no aplica)':'')+'</span><input class="crm-inp" id="simP'+i+'" inputmode="decimal" placeholder="65,2"'+(dis?' disabled':'')+vP+'>'
      +'<span class="crm-mini">Demanda 12 m</span><input class="crm-inp" id="simD'+i+'" inputmode="decimal" placeholder="máx. 12 meses"'+(dis?' disabled':'')+'>'
      +'<span class="crm-mini">€/kW·año</span><input class="crm-inp" id="simPre'+i+'" inputmode="decimal" value="'+(pre[i-1]||0)+'"'+(dis?' disabled':'')+'></div>';
  }
  window.crmSimHtml._deferPa=null;
  return crmSegBar('cli')
    +'<div class="reglas"><h4>📄 Simulador de potencia (2.0TD / 3.0TD)</h4>'+Tc('Pega la factura o rellena a mano: la app propone la potencia óptima por periodo con margen y genera la propuesta imprimible. Todo ocurre en este dispositivo: la factura no viaja a ningún servidor.')+'</div>'
    +'<div class="crm-wrap">'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">'
    +(cli?('<span class="crm-pill">🏢 <b>'+xh(cli)+'</b></span>'):'<input class="crm-inp" id="simCliManual" placeholder="Empresa (o abre «📄 Oferta» desde su ficha)" style="min-width:260px" value="'+xh(cli)+'">')
    +'<select class="crm-inp" style="width:auto" id="simTipo" onchange="CRM_FILTRO.simTipo=this.value;crmRenderTab()">'
    +'<option value="20"'+(tipo==='20'?' selected':'')+'>⚡ 2.0TD (P1-P2)</option>'
    +'<option value="30"'+(tipo==='30'?' selected':'')+'>⚡ 3.0TD (P1-P6)</option></select>'
    +'<span class="crm-mini">Margen seguridad %</span><input class="crm-inp" style="width:66px" id="simMargen" inputmode="decimal" value="'+SIM_MARGEN_DEF+'">'
    +'<button type="button" class="crm-chip" onclick="crmSimSalir()">← Volver</button></div>'
    +'<textarea id="simTa" rows="4" style="width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px solid var(--gris-linea,#ddd);border-radius:8px" placeholder="Pega aquí el texto de la factura (Ctrl+C desde el PDF) — se leen las potencias contratadas; NADA sale de este dispositivo"></textarea>'
    +'<div style="margin:6px 0 10px"><button type="button" class="btn" onclick="simPegar()">📄 Leer de la factura</button> <button type="button" class="btn verde" onclick="simCalc()">▶ Calcular propuesta</button> <button type="button" class="btn" onclick="crmSimSalir()">Cancelar</button></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:4px 0 10px">'+inputs+'</div>'
    +'<div id="simRes"></div>'
    +'<p class="crm-mini">Regla F18-1 (auditable): propuesta = demanda real (máximos 12 m) + margen · sin dato de demanda → «sin cambio, aportar maximétero». Precios €/kW·año editables. Los importes se computan SOLO con los precios visibles.</p>'
    +'</div>';
};

window.crmRenderTab=function(){
  var el=document.getElementById('tab-clientes'); if(!el) return;
  if(CRM_FILTRO.sim){ try{ el.innerHTML=crmSimHtml(); }catch(err){ el.innerHTML='<div class="crm-empty">✘ '+err.message+'</div>'; } return; }              /* v4.0.3 F18+: simulador */
  if(CRM_FILTRO.seg==='pre'){ try{ el.innerHTML=preHtml(); }catch(err){ el.innerHTML='<div class="crm-empty">✘ '+err.message+'</div>'; } return; }   /* v4.1.1 G6: presupuestos colaborativos */
  if(CRM_FILTRO.seg==='hoy'){ try{ el.innerHTML=crmHoyHtml(); }catch(err){ el.innerHTML='<div class="crm-empty">✘ '+err.message+'</div>'; } return; }   /* v3.12.0 F3: agenda diaria */
  /* v3.3.0: segmento «📋 Potenciales» dentro de 👥 Clientes */
  if(CRM_FILTRO.seg==='pot'){
    try{
      if(CRM_FILTRO.proRepo){ el.innerHTML=maeRepoHtml(); maeIdxGet(function(){}); return; }
      if(CRM_FILTRO.proSesion&&PRO_SESION.on){ el.innerHTML=proSesionHtml(); return; }
      var a=proLeer().filter(function(r){ return r.p.e!=='convertido'; });
      var c=proConteo(a), chip=CRM_FILTRO.proChip||'hoy';
      function chp(id,label){ return '<button type="button" class="crm-chip'+(chip===id?' on':'')+'" onclick="proChip(\''+id+'\')">'+label+'</button>'; }
      var html='<div class="crm-wrap">'
        +'<h3 style="margin:0">📋 Potenciales <span class="crm-pill">banco compartido del equipo</span></h3>'
        +'<p class="crm-sub">Prospectos ligeros: llama, marca el resultado (se anota solo en el registro de actividad) y los calientes se convierten en ficha de cliente con un toque. Se sincroniza con el equipo por la caja fuerte.</p>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">'
        +crmSegBar('pot')
        +'<button type="button" class="crm-chip" title="Modo sesión: cadena de llamadas con teclas 1-7" onclick="proSesionToggle()">🔥 Sesión</button>'
        +'<button type="button" class="crm-chip" title="Reponer desde el maestro compartido" onclick="maeReponer()">📥 Reponer</button>'
        +proSyncLey()
        +'<span style="flex:1"></span>'
        +'<span class="crm-pill">'+c.tot+' activos · '+c.sin+' sin llamar · '+c.hoy+' reintento hoy · '+c.cal+' calientes</span></div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px">'
        +chp('hoy','🔥 reintento hoy')+chp('sin','〰 sin llamar')+chp('cal','🤝 calientes')+chp('ruta','🗺 ruta')+chp('desc','descartados')+chp('todos','todos')
        +'<span style="flex:1"></span>'
        +'<button type="button" class="crm-chip'+((CRM_FILTRO.proOwner||'')==='mio'?' on':'')+'" onclick="crmFiltro(\'proOwner\',\''+(((CRM_FILTRO.proOwner||'')==='mio')?'':'mio')+'\')">👤 míos</button>'
        +'<button type="button" class="crm-chip'+((CRM_FILTRO.proOwner||'')==='otros'?' on':'')+'" onclick="crmFiltro(\'proOwner\',\''+(((CRM_FILTRO.proOwner||'')==='otros')?'':'otros')+'\')">👥 del equipo</button>'+'</div>'
        +'<div class="crm-rows" style="margin-bottom:10px">'
        +'<input id="proN" placeholder="Nombre o local (p. ej. Taller Remigio)" maxlength="80">'
        +'<input id="proT" placeholder="☎ Teléfono" maxlength="20">'
        +'<input id="proC" placeholder="Ciudad" maxlength="40">'
        +'<input id="proS" placeholder="Sector" maxlength="40">'
        +'<button type="button" class="btn verde" onclick="proAltaForm()">➕ Añadir</button></div>'
        +'<div class="crm-rows" style="margin-bottom:10px">'
        +'<input placeholder="🔎 Buscar nombre, teléfono, ciudad…" value="'+(CRM_FILTRO.proQ||'')+'" oninput="proQ(this.value)">'
        +'<button type="button" class="btn" onclick="var d=document.getElementById(\'proImp\'); d.style.display=d.style.display===\'none\'?\'block\':\'none\'; var d2=document.getElementById(\'proImpIbc\'); if(d2) d2.style.display=\'none\'">⬆ Importar lista</button>'
        +'<button type="button" class="btn" style="background:#B91C1C;color:#fff" title="Pega el extracto IBERCRM tal cual (conserva ibe_id para cruzarlo)" onclick="var d=document.getElementById(\'proImpIbc\'); d.style.display=d.style.display===\'none\'?\'block\':\'none\'; var d2=document.getElementById(\'proImp\'); if(d2) d2.style.display=\'none\'">🟥 IBERCRM</button></div>'
        +'<div id="proImp" style="display:none;margin-bottom:10px"><textarea id="proImportTa" rows="5" style="width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px solid var(--gris-linea,#ddd);border-radius:8px" placeholder="Una línea por potencial: Nombre;Teléfono;Ciudad;Sector"></textarea>'
        +'<button type="button" class="btn" onclick="proImporta()">Importar</button></div>'
        +'<div id="proImpIbc" style="display:none;margin-bottom:10px"><p class="crm-mini" style="margin:4px 0">🟥 Pega el <b>extracto IBERCRM</b> tal cual (cabeceras: nombre · teléfono · ciudad · sector · <b>ibe_id</b> · factura). Separador automático (tab / ; / , / |). El <b>ibe_id se conserva</b> para cruzarlo después — base del simulador F18+.</p>'
        +'<textarea id="proIbcTa" rows="6" style="width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px dashed #B91C1C;border-radius:8px" placeholder="nombre;telefono;ciudad;sector;ibe_id;factura"></textarea>'
        +'<button type="button" class="btn" style="background:#B91C1C;color:#fff" onclick="proImportaIbc()">Importar IBERCRM</button></div>'
        +'<div id="proLista"></div>'
        +'</div>';
      el.innerHTML=html;
      document.getElementById('proLista').innerHTML=proHtml()||'<div class="crm-empty">Sin potenciales en esta vista — añade arriba o importa una lista (Nombre;Teléfono;Ciudad;Sector).</div>';
    }catch(err){ el.innerHTML='<div class="crm-empty">✘ '+err.message+'</div>'; }
    return;
  }
  var o=cliLeer(), nombres=Object.keys(o), total=nombres.length, hoy=window.crmHoyTodo();
  var NCITAS=nombres.filter(function(n){ return crmNorm(o[n]).estado==='cita'; }).length;
  var NFACT=nombres.filter(function(n){ return crmNorm(o[n]).estado==='factura'; }).length;
  var T=function(s){ try{ return cfaT(window.cfaLang||'es',s); }catch(e){ return s; } };
  var chips=[''].concat(CRM_ESTADOS.map(function(e){return e[0];})).map(function(id){
    var on=CRM_FILTRO.estado===id?' on':'';
    var label=id?crmDef(id)[1]:T('Todos');
    return '<span class="crm-chip'+on+'" onclick="crmFiltro(\'estado\',\''+id+'\')">'+label+'</span>';
  }).join('');
  var mhoy = hoy.length?('<div class="crm-hoy"><b>⏰ '+T('Hoy toca')+' ('+hoy.length+')</b><div>'+hoy.map(function(it){
    var f=it.f, d=crmDef(f.estado);
    return '<div class="crm-fila" style="border-color:#F3C267" onclick="crmAbrir(decodeURIComponent(\''+encURI(it.n)+'\'))"><span class="crm-badge" style="background:'+d[2]+'">'+d[1]+'</span>'
      +'<span class="crm-f"><span class="crm-n">'+xh(it.n)+'</span><div class="crm-m">'+xh((f.prox.h?f.prox.h+' · ':'')+f.prox.accion)+(tel_de(f)?' · ☎'+tel_de(f):'')+'</div></span></div>';
  }).join('')+'</div></div>'):'';
  var lista = nombres.filter(function(n){
    var f=crmNorm(o[n]);
    if(CRM_FILTRO.estado&&f.estado!==CRM_FILTRO.estado) return false;
    if(CRM_FILTRO.q){ var q=CRM_FILTRO.q; if(!crmMatch(n,f,q)) return false; }   /* v3.11.0: buscador global (empresa+tags+contactos+ibe_id) */
    if(CRM_FILTRO.pi){ var _pid=CRM_FILTRO.pi; var _tiene=(f.pis||[]).some(function(p){ return p.id===_pid&&p.est!=='gan'&&p.est!=='per'; }); if(!_tiene) return false; }   /* v4.0.2 F2: embudo por producto (vivos) */
    return true;
  }).sort(function(a,b){ var fa=crmNorm(o[a]), fb=crmNorm(o[b]); var pa=fa.prox.f||'9999', pb=fb.prox.f||'9999'; return pa<pb?-1:(pa>pb?1:(a<b?-1:1)); });
  var _piSelOpts='<option value="">🧩 todos los productos</option>'+catalogoOptsSync().map(function(it){ return '<option value="'+it.id+'"'+(CRM_FILTRO.pi===it.id?' selected':'')+'>'+(it.tag||'🧩')+' '+it.nombre+'</option>'; }).join('');
  el.innerHTML='<div class="reglas"><h4>👥 '+T('Área Clientes')+'</h4>'+T('Mini-CRM de llamadas: fichas con estado, próxima acción y «📞 preparar llamada» (precarga las variables y abre el guion en el punto justo). Datos SOLO en este dispositivo.')+'</div>'
   +'<div class="crm-stats"><span class="crm-kpi">📇 <b>'+total+'</b> '+T('fichas')+'</span><span class="crm-kpi">⏰ <b>'+hoy.length+'</b> '+T('hoy/pendientes')+'</span>'
+(NCITAS?('<span class=\"crm-kpi\" style=\"cursor:pointer\" title=\"'+T('Clic para ver las fichas')+'\" onclick=\"crmFiltro(\'estado\',\'cita\')\">📅 <b>'+NCITAS+'</b> '+T('citas pendientes')+'</span>'):'')+(NFACT?('<span class=\"crm-kpi\" style=\"cursor:pointer\" title=\"'+T('Clic para ver las fichas')+'\" onclick=\"crmFiltro(\'estado\',\'factura\')\">📄 <b>'+NFACT+'</b> '+T('facturas en juego')+'</span>'):'')+'</div>'
   +crmSegBar('cli')
   +mhoy
   +'<div style="background:#fff;border:1px solid #E4E1F5;border-radius:10px;padding:10px 12px;margin-bottom:8px">'
   +'<b style="font-size:13px">'+T('Alta rápida')+'</b>'
   +'<input id="crmNomN" class="crm-inp" placeholder="'+T('Nombre o empresa (p. ej. Bar La Mareta)')+'" aria-label="'+T('Nombre del cliente')+'">'
   +'<input id="crmTelN" class="crm-inp" placeholder="'+T('☎ Teléfono (opcional)')+'" aria-label="'+T('Teléfono')+'">'
   +'<button type="button" class="crm-btn" onclick="crmAlta()">＋ '+T('Añadir cliente')+'</button>'
   +'<button type="button" class="crm-btn sec" onclick="crmCsv()">⬇ '+T('Exportar CSV')+'</button></div>'
   +'<div>'+chips+' <select class="crm-inp" style="display:inline-block;width:auto" onchange="crmFiltro(\'pi\',this.value)" title="'+T('Filtrar por producto del pipeline')+'">'+_piSelOpts+'</select> <input id="crmQ" class="crm-inp" style="display:inline-block;width:min(220px,60%)" placeholder="🔍 '+T('Buscar nombre, teléfono, sector…')+'" oninput="crmFiltro(\'q\',this.value)" value="'+xh(CRM_FILTRO.q)+'"></div>'
   +'<div id="crmLista">'
   +(lista.length?lista.map(function(n){ return crmFila(n,crmNorm(o[n])); }).join(''):'<div class="cfb-nota" style="padding:10px 2px">'+T('Sin fichas que mostrar — añada la primera o guarde una 📝 nota rápida tras la próxima llamada.')+'</div>')
   +'</div>';
};
function encURI(s){ return encodeURIComponent(s).replace(/'/g,'%27'); }
function crmFila(nombre,f){
  var d=crmDef(f.estado), e=encURI(nombre), notas=(f.notas||[]).length;
  var prox=f.prox&&f.prox.f?('📅 '+f.prox.f+(f.prox.h?' '+f.prox.h:'')+(f.prox.accion?' · '+f.prox.accion:'')):'';
  var rz={sc:0,por:[]}; try{ if(window.crmRiesgo) rz=crmRiesgo(f,omieDias()); }catch(eRZ){}   /* F22 (ADR-013): badge 🧯 y banner */
  var meta=[(f.privada?'🔒':''),f.tel?('☎'+f.tel):'',f.sector,f.ciudad,f.factura?(f.factura+' €'):'',CRM_DOLOR[f.dolor]&&f.dolor?CRM_DOLOR[f.dolor]:''].filter(Boolean).join(' · ');
  return '<details class="crm-fila" style="display:block" id="crmD_'+e.replace(/%/g,'_')+'">'
   +'<summary style="cursor:pointer;display:flex;gap:8px;align-items:center;list-style:none">'
   +'<span class="crm-badge" style="background:'+d[2]+'">'+d[1]+'</span>'
   +(rz.sc>=40?('<span class="crm-badge" style="background:#B91C1C" title="'+Tc('F22: riesgo de fuga — abre la ficha')+'">🧯'+rz.sc+'</span>'):'')
   +'<span class="crm-f"><span class="crm-n">'+xh(nombre)+'</span><div class="crm-m">'+xh(meta)+(prox?(' · '+xh(prox)):'')+'</div></span>'
   +'<span class="crm-mini">'+notas+'✎</span></summary>'
   +'<div style="border-top:1px dashed #eee;margin-top:6px;padding-top:6px">'
   +(rz.sc>=25?('<div style="background:#FEF3F2;border:1px solid #FECDCA;color:#B91C1C;border-radius:8px;padding:6px 8px;font-size:.82rem;margin-bottom:6px">🧯 <b>'+Tc('Riesgo de fuga')+' · '+rz.sc+'/100</b> — '+rz.por.map(xh).join(' · ')+'</div>'):'')
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px">'
   +'<input class="crm-inp" id="crmT_'+e+'" placeholder="☎ Teléfono" value="'+xh(f.tel)+'">'
   +'<input class="crm-inp" id="crmS_'+e+'" placeholder="Sector" value="'+xh(f.sector)+'">'
   +'<input class="crm-inp" id="crmC_'+e+'" placeholder="Ciudad" value="'+xh(f.ciudad)+'">'
   +'<input class="crm-inp" id="crmCo_'+e+'" placeholder="Compañía actual" value="'+xh(f.comercializadora)+'">'
   +'<input class="crm-inp" id="crmFa_'+e+'" placeholder="Factura mensual (€)" value="'+xh(f.factura)+'">'
   +'<select class="crm-inp" id="crmDo_'+e+'">'+Object.keys(CRM_DOLOR).map(function(k){ return '<option value="'+k+'"'+(f.dolor===k?' selected':'')+'>Dolor: '+CRM_DOLOR[k]+'</option>'; }).join('')+'</select>'
   +'</div>'
   +'<div style="margin-top:6px;border-top:1px dotted #eee;padding-top:6px">'
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px">'
   +'<input class="crm-inp" id="crmDi_'+e+'" placeholder="📍 Dirección" value="'+xh(f.dir)+'">'
   +'<input class="crm-inp" id="crmCp_'+e+'" placeholder="CP" value="'+xh(f.cp)+'">'
   +'<input class="crm-inp" id="crmEm_'+e+'" placeholder="✉ Email" value="'+xh(f.email)+'">'
   +'<input class="crm-inp" id="crmWe_'+e+'" placeholder="🌐 Web" value="'+xh(f.web)+'">'
   +'<input class="crm-inp" id="crmVa_'+e+'" placeholder="💶 Valor estimado (€)" value="'+xh(f.valor)+'">'
   +'<select class="crm-inp" id="crmOr_'+e+'">'+CRM_ORIGENES.map(function(o2){ return '<option value="'+o2[0]+'"'+(f.origen===o2[0]?' selected':'')+'>'+o2[1]+'</option>'; }).join('')+'</select>'
   +'<input class="crm-inp" id="crmIb_'+e+'" placeholder="ibe_id (cruce IBERCRM)" value="'+xh(f.ibe_id)+'">'
   +'</div>'
   +'<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center">'
   +'<span class="crm-mini">🏷</span>'
   +(f.tags||[]).map(function(tg,i2){ return '<span class="crm-chip on" style="padding:3px 8px;font-size:.75rem">'+xh(tg)+' <b style="cursor:pointer" title="quitar" onclick="crmTagDel(decodeURIComponent(\''+e+'\'),'+i2+')">✕</b></span>'; }).join('')
   +'<input class="crm-inp" style="width:120px;display:inline-block" id="crmTag_'+e+'" placeholder="+ tag">'
   +'<button type="button" class="crm-btn sec" style="padding:4px 10px;font-size:.75rem" onclick="crmTagAdd(decodeURIComponent(\''+e+'\'))">＋</button></div>'
   +'<div style="margin-top:6px">'
   +'<span class="crm-mini">👥 Contactos:</span>'
   +(f.contactos||[]).map(function(c,i2){ return '<div style="display:flex;gap:6px;align-items:center;margin-top:4px;font-size:.82rem"><b>'+xh(c.n)+'</b>'+(c.cargo?(' · '+xh(c.cargo)):'')+(c.tel?(' · ☎'+xh(c.tel)):'')+' <b style="cursor:pointer;color:#B91C1C" title="quitar" onclick="crmConDel(decodeURIComponent(\''+e+'\'),'+i2+')">✕</b></div>'; }).join('')
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-top:4px">'
   +'<input class="crm-inp" id="crmCn_'+e+'" placeholder="Nombre (persona)">'
   +'<input class="crm-inp" id="crmCc_'+e+'" placeholder="Cargo (gerente…)">'
   +'<input class="crm-inp" id="crmCt_'+e+'" placeholder="☎ Teléfono">'
   +'<button type="button" class="crm-btn sec" onclick="crmConAdd(decodeURIComponent(\''+e+'\'))">＋ contacto</button></div></div></div>'
   +'<div style="margin-top:6px;border-top:1px dotted #eee;padding-top:6px">'
   +'<span class="crm-mini">🧩 Productos (embudo):</span>'
   +(f.pis||[]).map(function(p,i2){ return '<div style="display:flex;gap:6px;align-items:center;margin-top:4px;font-size:.82rem;flex-wrap:wrap">'+piTag(p.id)+' <b>'+xh(piNombre(p.id))+'</b>'
     +'<select class="crm-inp" style="display:inline-block;width:auto;padding:2px 6px;font-size:.75rem" onchange="crmPiEst(decodeURIComponent(\''+e+'\'),'+i2+',this.value)">'+PIS_EST.map(function(es){ return '<option value="'+es[0]+'"'+(p.est===es[0]?' selected':'')+'>'+es[1]+'</option>'; }).join('')+'</select>'
     +(p.nota?('<span class="crm-mini">· '+xh(p.nota)+'</span>'):'')
     +'<b style="cursor:pointer;color:#B91C1C" title="quitar del embudo" onclick="crmPiDel(decodeURIComponent(\''+e+'\'),'+i2+')">✕</b></div>'; }).join('')
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin-top:4px">'
   +'<select class="crm-inp" id="crmPi_'+e+'"><option value="">＋ producto…</option>'+catalogoOptsSync().map(function(it){ return '<option value="'+it.id+'">'+(it.tag||'🧩')+' '+it.nombre+'</option>'; }).join('')+'</select>'
   +'<input class="crm-inp" id="crmPiN_'+e+'" placeholder="Nota corta del negocio (opcional)">'
   +'<button type="button" class="crm-btn sec" onclick="crmPiAdd(decodeURIComponent(\''+e+'\'))">＋ al embudo</button></div></div>'
   +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px">'
   +'<span class="crm-mini">Estado:</span><select class="crm-inp" style="width:auto;display:inline-block" id="crmE_'+e+'">'+CRM_ESTADOS.map(function(x){ return '<option value="'+x[0]+'"'+(f.estado===x[0]?' selected':'')+'>'+x[1]+'</option>'; }).join('')+'</select>'
   +'<span class="crm-mini">Próx.:</span><input type="date" class="crm-inp" style="width:auto;display:inline-block" id="crmPf" value="'+xh(f.prox.f)+'"><input type="time" class="crm-inp" style="width:auto;display:inline-block" id="crmPh" value="'+xh(f.prox.h)+'"><input class="crm-inp" style="width:150px;display:inline-block" id="crmPa" placeholder="¿Qué toca? (revisar factura…)" value="'+xh(f.prox.accion)+'">'
   +'<span class="crm-mini">📑 '+Tc('fin contrato')+':</span><input type="date" class="crm-inp" style="width:auto;display:inline-block" id="crmFc_'+e+'" title="'+Tc('F22: fin del contrato de energía (alimenta el aviso de fuga)')+'" value="'+xh(f.fin_contrato)+'">'
   +'<span class="crm-mini">⚡ €/kWh:</span><input class="crm-inp" style="width:82px;display:inline-block" id="crmPk_'+e+'" title="'+Tc('F22: €/kWh que paga hoy — se coteja con el pool OMIE local')+'" placeholder="0.150" value="'+xh(f.precio_kwh)+'">'
   +'</div>'
   +'<div>'
   +'<button type="button" class="crm-btn" onclick="crmGuardar(decodeURIComponent(\''+e+'\'))">💾 Guardar</button>'
   +'<button type="button" class="crm-btn" style="background:#007A3B" onclick="cliPrepLlamadaSafe(decodeURIComponent(\''+e+'\'))">📞 Preparar llamada</button>'
   +'<button type="button" class="crm-btn" style="background:#6D28D9" onclick="crmSimAbrir(decodeURIComponent(\''+e+'\'))">📄 Oferta</button>'
   +'<button type="button" class="crm-btn sec" title="'+Tc('F5: ficha privada (no sale de este dispositivo con la sync)')+'" onclick="crmPrivadaToggle(decodeURIComponent(\''+e+'\'))">'+(f.privada?'🔒 Privada':'⇄ Compartida')+'</button>'
   +'<button type="button" class="crm-btn sec" title="'+Tc('RGPD: exportar esta ficha (JSON) para el interesado')+'" onclick="crmFichaJson(decodeURIComponent(\''+e+'\'))">📤 JSON</button>'
   +'<button type="button" class="crm-btn sec" onclick="crmNota(decodeURIComponent(\''+e+'\'))">✎ Nota</button>'
   +'<button type="button" class="crm-btn sec" onclick="cliCopia(decodeURIComponent(\''+e+'\'))">📋 Historial</button>'
   +'<button type="button" class="crm-btn rojo" onclick="cliBorraFicha(decodeURIComponent(\''+e+'\'))">🗑</button>'
   +'</div>'
   +'<div id="crmN_'+e+'" style="margin-top:4px"></div>'
   +'</div></details>';
}
window.crmAbrir=function(nombre){ var d=document.getElementById('crmD_'+encURI(nombre).replace(/%/g,'_')); if(d){ d.open=true; try{ d.scrollIntoView({block:'nearest'}); }catch(e){} } };
window.crmAlta=function(){
  var n=document.getElementById('crmNomN'), t=document.getElementById('crmTelN');
  var nombre=n?n.value.trim():'', tel=t?t.value.replace(/[^0-9+ ]/g,'').trim():'';
  if(!nombre){ try{ toast('✘ Nombre/empresa, por favor'); }catch(e){} return; }
  cliUp(nombre,{tel:tel});
  if(!cliLeer()[cliNorm(nombre)].notas.length) cliAnadir(nombre,'Ficha creada');
  if(n) n.value=''; if(t) t.value='';
  try{ toast('👥 Ficha de «'+nombre+'» creada'); }catch(e){}
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmGuardar=function(nombre){
  var e=encURI(nombre);
  cliUp(nombre,{ tel:(g('crmT_'+e)||{value:''}).value, sector:(g('crmS_'+e)||{value:''}).value, ciudad:(g('crmC_'+e)||{value:''}).value,
    comercializadora:(g('crmCo_'+e)||{value:''}).value, factura:(g('crmFa_'+e)||{value:''}).value.replace(/[^0-9.,]/g,''), dolor:(g('crmDo_'+e)||{value:''}).value });
  cliUp(nombre,{ dir:(g('crmDi_'+e)||{value:''}).value, cp:(g('crmCp_'+e)||{value:''}).value.replace(/[^0-9]/g,'').slice(0,5), email:(g('crmEm_'+e)||{value:''}).value,
    web:(g('crmWe_'+e)||{value:''}).value, valor:(g('crmVa_'+e)||{value:''}).value, origen:(g('crmOr_'+e)||{value:''}).value, ibe_id:(g('crmIb_'+e)||{value:''}).value });   /* F1 */
  cliUp(nombre,{ fin_contrato:(g('crmFc_'+e)||{value:''}).value, precio_kwh:(g('crmPk_'+e)||{value:''}).value.replace(/[^0-9.,]/g,'').slice(0,8) });   /* F22 (ADR-013) */
  var est=(g('crmE_'+e)||{value:'nuevo'}).value;
  if(cliLeer()[cliNorm(nombre)].estado!==est) window.cliSetEstado(nombre,est);
  window.cliSetProx(nombre);
  try{ toast('💾 Ficha guardada'); }catch(e){}
  window.crmRenderTab(); window.crmAbrir(nombre);
};
function g(id){ return document.getElementById(id); }
window.crmNota=function(nombre){
  var e=encURI(nombre), caja=g('crmN_'+e);
  if(caja&&!caja.innerHTML){
    caja.innerHTML='<input class="crm-inp" id="crmNt_'+e+'" placeholder="Nota rápida (quedó en mandar factura…)"><button type="button" class="crm-btn" onclick="crmNotaOK(decodeURIComponent(\''+e+'\'))">✎ '+_cfaf_t(cfaLangE(),'✎ Guardar nota')+'</button>';
  }else if(caja){ caja.innerHTML=''; }
};
function cfaLangE(){ try{ return window.cfaLang||'es'; }catch(e){ return 'es'; } }
function _cfaf_t(l,s){ try{ return cfaT(l,s); }catch(e){ return s; } }
window.crmNotaOK=function(nombre){
  var e=encURI(nombre), inp=g('crmNt_'+e);
  var txt=inp?inp.value.trim():'';
  if(!txt){ try{ toast('✘ Escriba la nota'); }catch(e){} return; }
  cliAnadir(nombre,txt);
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmCsv=function(){
  var o=cliLeer(), filas=[['nombre','telefono','sector','ciudad','comercializadora','factura_eur','dolor','estado','prox_fecha','prox_hora','prox_accion','notas','creado','origen','valor_eur','tags','contactos','ibe_id','email','web','direccion','cp','productos','fin_contrato','precio_kwh']];
  Object.keys(o).sort().forEach(function(n){ var f=crmNorm(o[n]);
    filas.push([n,f.tel,f.sector,f.ciudad,f.comercializadora,f.factura,f.dolor,f.estado,f.prox.f,f.prox.h,f.prox.accion,String((f.notas||[]).length),f.creado||'',f.origen,f.valor,(f.tags||[]).join('|'),(f.contactos||[]).map(function(c){return c.n+(c.cargo?(' '+c.cargo):'');}).join('; '),f.ibe_id,f.email,f.web,f.dir,f.cp,(f.pis||[]).map(function(p){return p.id+':'+p.est;}).join(';'),f.fin_contrato,f.precio_kwh].map(function(c){ return '"' + String(c==null?'':c).replace(/"/g,'""') + '"'; }).join(','));
  });   /* v3.11: columnas F1 · v4.0.2 F2: +productos al final · v4.2 F22: +fin_contrato,+precio_kwh (el formato viejo se sigue leyendo igual) */
  try{ var blob=new Blob(['\ufeff'+filas.join('\n')],{type:'text/csv;charset=utf-8'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='clientes-'+hoyLocal()+'.csv';
    document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },600);
  }catch(e){}
};
/* v3.11.0: CRUD de tags y contactos dentro de la ficha empresarial */
window.crmTagAdd=function(nombre){
  var e=encURI(nombre), inp=g('crmTag_'+e);
  var t=inp?inp.value.trim():'';
  if(!t){ try{ toast('✘ Escriba el tag'); }catch(er){} return; }
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  f.tags.push(t); cliUp(nombre,{tags:f.tags});
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmTagDel=function(nombre,idx){
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  if(idx<0||idx>=f.tags.length) return;
  f.tags.splice(idx,1); cliUp(nombre,{tags:f.tags});
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmConAdd=function(nombre){
  var e=encURI(nombre);
  var cn=(g('crmCn_'+e)||{value:''}).value.trim(), cc=(g('crmCc_'+e)||{value:''}).value.trim(), ct=(g('crmCt_'+e)||{value:''}).value.replace(/[^0-9+ ]/g,'').trim();
  if(!cn){ try{ toast('✘ Nombre de la persona'); }catch(er){} return; }
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  f.contactos.push({n:cn,cargo:cc,tel:ct}); cliUp(nombre,{contactos:f.contactos});
  window.crmRenderTab(); window.crmAbrir(nombre);
  try{ toast('👤 contacto añadido a '+nombre); }catch(er){}
};
window.crmConDel=function(nombre,idx){
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  if(idx<0||idx>=f.contactos.length) return;
  f.contactos.splice(idx,1); cliUp(nombre,{contactos:f.contactos});
  window.crmRenderTab(); window.crmAbrir(nombre);
};

/* — v4.0.2 (F2 · ADR-007): CRUD del embudo por producto en la ficha — */
window.crmPiAdd=function(nombre){
  var e=encURI(nombre), sel=g('crmPi_'+e), no=g('crmPiN_'+e);
  var id=sel?sel.value:'';
  if(!id){ try{ toast('✘ Elige producto del catálogo'); }catch(er){} return; }
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  var nota=no?no.value.trim():'', ya=-1;
  f.pis.forEach(function(p,i2){ if(p.id===id) ya=i2; });
  if(ya>-1){ f.pis[ya].nota=nota||f.pis[ya].nota; try{ toast('🧩 ya estaba en el embudo (nota actualizada si la pusiste)'); }catch(e2){} }
  else { f.pis.push({id:id,est:'prep',nota:nota}); }
  cliUp(nombre,{pis:f.pis});
  try{ if(window.actAdd) actAdd('crm',{detalle:'＋ producto '+id+' al embudo',resultado:'prep',ciudad:(cliLeer()[cliNorm(nombre)]||{}).ciudad}); }catch(e3){}
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmPiDel=function(nombre,idx){
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  if(idx<0||idx>=f.pis.length) return;
  f.pis.splice(idx,1); cliUp(nombre,{pis:f.pis});
  window.crmRenderTab(); window.crmAbrir(nombre);
};
window.crmPiEst=function(nombre,idx,est){
  var o=cliLeer(), f=crmNorm(o[cliNorm(nombre)]||{});
  if(idx<0||idx>=f.pis.length||!crmPiDefId(est)) return;
  f.pis[idx].est=est;
  var nom=f.pis[idx].id;
  cliUp(nombre,{pis:f.pis});
  try{ if(window.actAdd) actAdd('crm',{detalle:'embudo '+nom+' → '+est,resultado:est,ciudad:(cliLeer()[cliNorm(nombre)]||{}).ciudad}); }catch(e4){}
  try{ toast(piDefEst(est)[1]+' · '+piNombre(nom)); }catch(e5){}
  try{ busEmite('pi.movio',{nombre:cliNorm(nombre),id:nom,est:est}); }catch(e6){}   /* F4 */
  window.crmRenderTab(); window.crmAbrir(nombre);
};

/* ⚙ menú ajustes + texto grande */
window.cfaAjToggle=function(){ var m=document.getElementById('cfaAjMenu'); if(m) m.classList.toggle('cfa-on'); };
window.cfaAjHide=function(){ var m=document.getElementById('cfaAjMenu'); if(m) m.classList.remove('cfa-on'); };
window.cfaTxtGreat=function(b){ var on=!document.body.classList.contains('cfb-txtgreat'); document.body.classList.toggle('cfb-txtgreat',on); try{ LSs('cfb_prefs',{txtgreat:on?1:0}); }catch(e){} if(b) b.textContent='🔡 Texto grande'+(on?' ✔':''); };
try{ var _p=LSg('cfb_prefs',{}); if(_p&&_p.txtgreat) document.body.classList.add('cfb-txtgreat'); }catch(e){}
try{ document.addEventListener('click',function(ev){ var w=document.getElementById('cfaAjWrap'); if(w&&!w.contains(ev.target)) window.cfaAjHide(); }); }catch(e){}
try{ if(typeof wraps==='function') wraps('guiActivarTab',function(id){ if(id==='tab-clientes') setTimeout(window.crmRenderTab,30); }); }catch(e){}
 window.cliAnadir=cliAnadir; window.cliBorrar=function(n){ try{ cliBorrar(n); }catch(e){} try{ if(cliSyncEstado().on) cliSyncLapPush(n,function(){}); }catch(e2){} };   /* F5-B: borrar con sync ON apunta lápida (offline: solo local, documentado) */
window.cliBorrarNota=cliBorrarNota;
/* ═══ v2.7 «Diploma» · examen final cronometrado + certificado ═══ */
function dipUmbral(){ return (typeof CONFIG!=='undefined'&&CONFIG.notaAprobado)?CONFIG.notaAprobado:8; }
function dipGet(){ return LSg('bm_diploma'+SUF,{})||{}; }
function dipTxt(){ var d=dipGet(); return d.nota==null?'—':(d.nota+'/10'+(d.aprobado?' ✔ aprobado':'')+' · '+(d.fecha||'')); }
window.cfbCertificado=function(){
  var d=dipGet();
  if(!d.aprobado){ try{ toast('✘ Primero apruebe el examen ('+dipUmbral()+'/10)'); }catch(e){} return; }
  var viejo=document.getElementById('cfbCertPrint'); if(viejo) viejo.remove();
  var nom=((LSg('cfb_perfil',{})||{}).nombre)||'________________';
  var guion=(document.title||'').replace(/\s*\(archivo único\)/,'').trim();
  var h='<div id="cfbCertPrint"><div class="cert-caja">'
   +'<div class="cert-tit">Call Flow Business</div>'
   +'<div class="cert-sub">B\u0026M Asesores Energéticos certifica la superación del examen final por</div>'
   +'<div class="cert-nom">'+xh(nom)+'</div>'
   +'<div class="cert-txt">con nota <b>'+d.nota+'/10</b> en «'+xh(guion)+'»<br>'+xh(d.fecha||'')+' · v'+VERSION+'</div>'
   +'<div class="cert-fir"><div>El/La participante</div><div>El/La responsable</div></div>'
   +'</div></div>';
  document.body.insertAdjacentHTML('beforeend',h);
  document.body.classList.add('cfb-printing');
  var fin=function(){ document.body.classList.remove('cfb-printing'); var o=document.getElementById('cfbCertPrint'); if(o) o.remove(); };
  window.addEventListener('afterprint',fin);
  window.print(); setTimeout(fin,1500);
  try{ renderHub(true); }catch(e){}
};
function examFallos(){ return LSg('bm_exam_fallo'+SUF,{})||{}; }
function examDebidas(){ var fm=examFallos(),out=[],esc=[1,3,7];
  Object.keys(fm).forEach(function(k){ var f=fm[k]||{}, d=Date.parse(f.d||'');
    if(isNaN(d)) return; if(Math.floor((Date.now()-d)/864e5)>=esc[Math.min((f.n||1)-1,2)]) out.push(~~k); });
  return out.filter(function(i){ return i>=0&&i<QUIZ.length; }); }
window.cfbExamen=function(soloQis){
  if(typeof QUIZ==='undefined'||!QUIZ.length){ try{ toast('✘ El banco de preguntas no está en esta página'); }catch(e){} return; }
  var viejo=document.getElementById('cfbExamOv'); if(viejo) viejo.remove();
  var ov=document.createElement('div'); ov.id='cfbExamOv';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:60000;display:flex;align-items:center;justify-content:center;padding:14px';
  ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Examen final');
  var _prevF=document.activeElement||null;
  function cierrExam(){ clearInterval(finT); ov.remove(); try{ if(_prevF&&_prevF.focus) _prevF.focus(); }catch(e){} }
  ov.addEventListener('keydown',function(e){ if(e.key==='Escape'){ cierrExam(); } });
  var orden=((soloQis&&soloQis.length)?soloQis.slice():QUIZ.map(function(q,i){ return i; })).sort(function(){ return Math.random()-0.5; });
  var rest=8*60, finT=null;
  function pinta(){
    var h='<div style="background:#fff;border-radius:14px;max-width:640px;width:100%;padding:16px;max-height:92vh;overflow:auto">'
     +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>🎓 Examen final</b><span id="examReloj" style="font:700 14px ui-monospace,monospace">8:00</span></div>'
     +'<div class="cfb-nota" style="margin:6px 0">'+orden.length+' preguntas'+(soloQis?' (repaso espaciado)':'')+' · aprobado con '+dipUmbral()+'/'+orden.length+' · sin ayudas 😉</div>'
     +(soloQis?'':'<div style="margin:2px 0 6px"><button type="button" class="cfb-btn cfb-sec" id="examRepaso" style="display:none">🧠 Repasar falladas</button></div>');
    orden.forEach(function(qi,n){
      var q=QUIZ[qi];
      h+='<div class="exam-q" data-q="'+n+'" data-qi="'+qi+'" style="border-top:1px solid #eee;padding:8px 0"><b>'+(n+1)+'. '+xh(q.q)+'</b>';
      q.o.forEach(function(op,j){
        h+='<label style="display:block;padding:4px 6px;border-radius:8px;cursor:pointer">'
         +'<input type="radio" name="exam-'+n+'" value="'+j+'"> '+xh(op)+'</label>';
      });
      h+='</div>';
    });
    h+='<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button type="button" class="cfb-btn" id="examCorr">Corregir examen</button>'
     +'<button type="button" class="cfb-btn cfb-sec" id="examCancel">Cancelar</button></div></div>';
    ov.innerHTML=h;
    ov.addEventListener('change',function(e){
      var r=e.target; if(!r||r.type!=='radio') return;
      var box=r.closest('[data-q]'); if(box) box.setAttribute('data-ans',r.value);
    });
    var rb=ov.querySelector('#examRepaso'); if(rb){ var due=examDebidas(); if(due.length){ rb.style.display=''; rb.textContent='🧠 Repasar falladas ('+due.length+')'; rb.onclick=function(){ cierrExam(); window.cfbExamen(due); }; } }
    ov.querySelector('#examCancel').onclick=function(){ cierrExam(); };
    ov.querySelector('#examCorr').onclick=function(){ corrige(); };
  }
  function corrige(){
    clearInterval(finT);
    var aciertos=0;
    orden.forEach(function(qi,n){
      var box=ov.querySelector('[data-q="'+n+'"]'); if(!box) return;
      var ans=parseInt(box.getAttribute('data-ans')||'-1',10);
      if(ans===QUIZ[qi].ok) aciertos++; else box.style.opacity=ans>=0?0.6:0.8;
    });
    try{ var fm=examFallos(); orden.forEach(function(qi,n){ var box=ov.querySelector('[data-q="'+n+'"]'); if(!box) return; var ans=parseInt(box.getAttribute('data-ans')||'-1',10);
      if(ans===QUIZ[qi].ok){ delete fm[qi]; } else { var f=fm[qi]||{n:0}; fm[qi]={d:hoyLocal(),n:f.n+1}; } });
      LSs('bm_exam_fallo'+SUF,fm); }catch(e){}
    var apr=aciertos>=dipUmbral();
    var anterior=dipGet();
    if(anterior.nota==null||aciertos>=anterior.nota) LSs('bm_diploma'+SUF,{nota:aciertos,fecha:hoyLocal(),aprobado:apr||(anterior.aprobado===true)});
    var rel=ov.querySelector('#examReloj'); if(rel) rel.textContent=aciertos+'/'+QUIZ.length+(apr?' ✔ APROBADO':'');
    var b=ov.querySelector('#examCorr'); if(b){ b.textContent='Cerrar'; b.onclick=function(){ cierrExam(); try{ renderHub(true); }catch(e){} }; }
    try{ toast(apr?'🎓 ¡Aprobado! Ya puedes generar tu 📜 certificado (Mi Cuenta → 🎓 Diploma)':'🎓 '+aciertos+'/'+QUIZ.length+' — te faltan '+Math.max(0,dipUmbral()-aciertos)+'. Inténtalo cuando quieras'); }catch(e){}
  }
  pinta();
  document.body.appendChild(ov);
  var f0=ov.querySelector('input,button'); if(f0){ try{ f0.focus(); }catch(e){} }
  finT=setInterval(function(){
    rest--;
    var el=ov.querySelector('#examReloj'); if(!el){ clearInterval(finT); return; }
    var m=(rest/60)|0,s=rest%60; el.textContent=m+':'+(s<10?'0':'')+s;
    if(rest<=0) corrige();
  },1000);
};
/* ═══════════════════ v2.9.0 «Babel» · idioma por sesión (ES/FR/PT) ═══════════════════
   Motor: overlays I18N.L.nodes/I18N.L.obj + cromo UI. applyLang clona- restaura y mezcla.
   Oleadas de contenido: 1 (UI+semilla) ✔ · 2 objeciones · 3 árbol · 4 glosario/casos.   */
var I18N={fr:{ui:{},obj:{},nodes:{}},pt:{ui:{},obj:{},nodes:{}},en:{ui:{},obj:{},nodes:{}},es:{ui:{},obj:{},nodes:{}}};
window.I18N=I18N;


/* — v4.0.4 Ola 2(d) «Equipo y derechos» (F5+F7 · ADR-009) — */
var CLI_LAPIDAS='datos/crm-lapidas.json';
function cliLapNorm(map){ map=(map&&typeof map==='object')?map:{}; var sal={},k; for(k in map){ var it=map[k]; var fv=(it&&typeof it.f==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(it.f))?it.f:''; if(fv) sal[k]={f:fv}; } return sal; }
window.cliLapLocal=function(){ var m={}; try{ m=LSg('cfb_crm_lapidas',{})||{}; }catch(e){} return cliLapNorm(m); };
window.cliLapPoda=function(map){ var lim=new Date(); lim.setDate(lim.getDate()-180); var lims=lim.toISOString().slice(0,10), ks=Object.keys(map).sort(function(a,b){ return map[a].f<map[b].f?1:-1; }), out={}, c=0; ks.forEach(function(k){ if(c<300&&map[k].f>=lims){ out[k]=map[k]; c++; } }); return out; };
function cliLapGuardar(m){ try{ LSs('cfb_crm_lapidas',cliLapPoda(cliLapNorm(m))); }catch(e){} }
window.cliSyncLapJala=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  maeGet(CLI_LAPIDAS,function(st,j){
    if(st!==200&&st!==404){ cb(false,'red '+st); return; }
    var remoto={};
    if(st===200){ try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; remoto=cliLapNorm((c&&c.lapidas)||{}); }catch(e){ cb(false,e.message); return; } }
    var loc=cliLapLocal(), k; for(k in remoto){ if(!loc[k]||remoto[k].f>loc[k].f) loc[k]=remoto[k]; }   /* unión por fecha más nueva */
    cliLapGuardar(loc); cb(loc,null);
  });
};
window.cliSyncLapPush=function(nombre,cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  var loc=cliLapLocal(); loc[nombre]={f:hoyLocal()}; cliLapGuardar(loc);
  cliSyncLapJala(function(){ maePut(CLI_LAPIDAS,{v:1,upd:hoyLocal(),lapidas:cliLapLocal()},function(st){ if(st===200){ try{ audMarca('borrar',nombre,function(){}); }catch(eA){} } cb(st===200?true:false,st===200?null:('lápida '+st)); }); });
};
window.cliSyncAhora=function(){                                                                          /* F5-D: chip ⇄ Equipo */
  try{
    if(!cliSyncEstado().on){ toast('⇄ '+Tc('Equipo OFF: falta la clave de equipo — pídala al administrador (Configuración/puerta)')); return; }
    toast('⇄ '+Tc('Sincronizando fichas con el equipo…'));
    cliSyncPush(function(ok,err){ try{ toast(ok?('⇄ '+ok.enviadas+' '+Tc('fichas arriba · frescas abajo')):('✘ '+(err||Tc('sin conexión')))); }catch(e){} try{ window.crmRenderTab(); }catch(e2){} });
  }catch(e){}
};
window.crmRgpdToggle=function(){ CRM_FILTRO.rgpd=CRM_FILTRO.rgpd?0:1; window.crmRenderTab(); };
window.crmRgpdCard=function(){                                                                           /* F7-1: aviso in-app */
  var eq=cliSyncEstado().on;
  return '<div class="reglas" style="border-left:4px solid #0E7490"><h4>🛡 '+Tc('Privacidad y derechos (RGPD)')+'</h4>'
   +'<div class="crm-mini" style="line-height:1.6">· '+Tc('Los datos de tus clientes viven <b>en este dispositivo</b>')+(eq?(' '+Tc('y —cifrados— en el repositorio privado del equipo (GitHub)')):' — '+Tc('sin clave de equipo: nada sale'))+'.<br>'
   +Tc('· Al administrador solo le llegan <b>números anónimos</b> (nunca nombres, teléfonos ni notas).')+'<br>'
   +Tc('· Derecho de <b>acceso</b>: el botón «📤 JSON» de cada ficha exporta todo lo que tenemos de ella.')+'<br>'
   +Tc('· Derecho de <b>supresión</b>: el borrador de aquí abajo (deja lápida en el equipo si hay clave).')+'<br>'
   +Tc('· <b>Retención</b> recomendada 12 meses sin actividad: la vista «☀ Hoy» te lo propone sola.')+'</div>'
   +'<div style="margin-top:8px;border-top:1px dashed #eee;padding-top:8px"><b>🧹 '+Tc('Borrado de persona')+'</b><div class="crm-mini">'+Tc('Busca en fichas y potenciales por nombre o teléfono y borra TODO rastro.')+'</div>'
   +'<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><input class="crm-inp" id="rgpdQ" placeholder="'+Tc('Nombre o teléfono…')+'" style="flex:1;min-width:150px"><button type="button" class="crm-btn" onclick="rgpdBuscarUI()">🔍 '+Tc('Buscar')+'</button></div>'
   +'<div id="rgpdRes" style="margin-top:6px"></div></div></div>';
};
function _rgNrm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
function _rgTel(t){ return String(t||'').replace(/\D/g,''); }
window.rgpdBuscar=function(q){                                                                           /* F7-2: localizador de persona */
  q=String(q||'').trim(); var out={fichas:[],pro:[]}; if(!q) return out;
  var nq=_rgNrm(q), tq=_rgTel(q), o=cliLeer(), k;
  for(k in o){ var f=crmNorm(o[k]), hit=_rgNrm(k).indexOf(nq)>-1;
    if(!hit&&tq.length>=6&&_rgTel(f.tel).indexOf(tq)>-1) hit=true;
    var m=0; while(!hit&&m<(f.contactos||[]).length){ var cn=f.contactos[m++]; hit=_rgNrm(cn.n).indexOf(nq)>-1||(tq.length>=6&&_rgTel(cn.tel).indexOf(tq)>-1); }
    if(hit) out.fichas.push(k);
  }
  proLeer().forEach(function(r){ if(_rgNrm(r.n).indexOf(nq)>-1||(tq.length>=6&&_rgTel(r.tel).indexOf(tq)>-1)) out.pro.push({id:r.id,n:r.n}); });
  return out;
};
window.rgpdBorra=function(q){                                                                            /* F7-2: supresión total */
  var r=rgpdBuscar(q), res={fichas:0,pro:0};
  r.fichas.forEach(function(n){ window.cliBorrar(n); res.fichas++; });                                   /* pasa por el envoltorio: lápida si hay clave */
  if(r.pro.length){ var a=proLeer().filter(function(x){ for(var i=0;i<r.pro.length;i++) if(r.pro[i].id===x.id) return false; return true; }); proGuardar(a); res.pro=r.pro.length; }
  if((res.fichas+res.pro)>0&&cliSyncEstado().on){ try{ audMarca('rgpd_purga',res.fichas+' fichas · '+res.pro+' potenciales',function(){}); }catch(eA){} }   /* S2: la purga deja rastro */
  return res;
};
window.rgpdBorraUN=function(persona){ if(confirm('RGPD — '+Tc('¿borrar TODO rastro de')+' «'+persona+'» '+Tc('(fichas + potenciales + lápida de equipo)?'))){ var res=rgpdBorra(persona); try{ toast('🧹 '+res.fichas+' '+Tc('fichas')+' · '+res.pro+' '+Tc('potenciales')); }catch(e){} window.crmRenderTab(); } };
window.rgpdBuscarUI=function(){
  var inp=g?g('rgpdQ'):null, box=g?g('rgpdRes'):null; if(!inp||!box) return;
  var q=(inp.value||'').trim(), r=rgpdBuscar(q);
  var tot=r.fichas.length+r.pro.length;
  if(!q){ box.innerHTML='<span class="crm-mini">'+Tc('Escriba nombre o teléfono primero.')+'</span>'; return; }
  var lista=(r.fichas.slice(0,4).map(function(n){ return '👤 '+xh(n); }).concat(r.pro.slice(0,4).map(function(p){ return '📋 '+xh(p.n); })).join(' · '))||Tc('sin coincidencias');
  box.innerHTML='<div class="crm-mini"><b>'+tot+'</b> '+Tc('rastros (fichas + potenciales)')+' — '+lista+(tot>4?' …':'')+'</div>'
   +(tot?('<div style="margin-top:6px"><button type="button" class="crm-btn" style="background:#B91C1C" onclick="rgpdBorraUN(document.getElementById(\'rgpdQ\').value)">🧹 '+Tc('Borrar todo rastro')+' ('+tot+')</button></div>'):'');
};
window.crmPrivadaToggle=function(nombre){                                                                /* F5-C */
  var o=cliLeer(); if(!o[nombre]) return;
  var f=crmNorm(o[nombre]); f.privada=f.privada?'':1; o[nombre]=f; cliGuardarTodo(o);
  try{ toast(f.privada?'🔒 '+Tc('Ficha privada: no sale de este dispositivo'):'⇄ '+Tc('Ficha compartida con el equipo')); }catch(e){}
  window.crmRenderTab();
};
window.crmFichaJson=function(nombre){                                                                    /* F7-3: derecho de acceso/portabilidad */
  try{
    var f=crmNorm(cliLeer()[nombre]||{});
    var payload={nombre:nombre,exportado:hoyLocal(),aviso:'Exportación RGPD del interesado. Base jurídica: interés legítimo/precontratual. No compartir más allá del interesado.',ficha:f};
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='rgpd-ficha-'+String(nombre).replace(/[^a-zA-Z0-9]+/g,'-')+'.json';
    document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e2){} },600);
  }catch(e){}
};
function hace12m(){ var d=new Date(); d.setFullYear(d.getFullYear()-1); var mm=('0'+(d.getMonth()+1)).slice(-2), dd=('0'+d.getDate()).slice(-2); return d.getFullYear()+'-'+mm+'-'+dd; }
window.crmSobran=function(){                                                                             /* F7-4: retención 12 meses */
  var lim=hace12m(), out={fichas:[],pro:[]}, o=cliLeer(), k;
  for(k in o){ var f=crmNorm(o[k]); var fr=cliFresh(f); var ref=(fr==='0000-00-00')?(f.creado||''):fr; if(ref&&/^\d{4}-\d{2}-\d{2}$/.test(ref)&&ref<lim) out.fichas.push({n:k,f:ref}); }
  var ahora=Date.now()-365*864e5;
  proLeer().forEach(function(r){ if((r.act||0)<ahora) out.pro.push({id:r.id,n:r.n}); });
  return out;
};
window.crmSobranHtml=function(){
  var s2=crmSobran(); if(!s2.fichas.length&&!s2.pro.length) return '';
  var rows=[];
  s2.fichas.slice(0,3).forEach(function(it){ rows.push('<div class="crm-fila" style="border-color:#E3B23C"><span class="crm-f"><span class="crm-n">'+xh(it.n)+'</span><div class="crm-m">'+Tc('ficha sin actividad desde')+' '+xh(it.f)+'</div></span><button type="button" class="crm-btn sec" style="padding:4px 10px;background:#E3B23C;color:#fff" title="'+Tc('Borrar rastro (RGPD)')+'" onclick="rgpdBorraUN(decodeURIComponent(\''+encURI(it.n)+'\'))">🧹</button></div>'); });
  s2.pro.slice(0,3).forEach(function(it){ rows.push('<div class="crm-fila" style="border-color:#E3B23C"><span class="crm-f"><span class="crm-n">'+xh(it.n)+'</span><div class="crm-m">'+Tc('potencial sin actividad >12 meses')+'</div></span><button type="button" class="crm-btn sec" style="padding:4px 10px;background:#E3B23C;color:#fff" onclick="rgpdBorraUN(decodeURIComponent(\''+encURI(it.n)+'\'))">🧹</button></div>'); });
  return '<div class="crm-hoy" style="border-left:4px solid #E3B23C"><b style="color:#8A6D1A">🧹 '+Tc('Sobran — retención recomendada 12 meses')+' ('+(s2.fichas.length+s2.pro.length)+')</b><div>'+rows.join('')+'</div></div>';
};



/* — v4.1.1 Ola 3(a) «Mando y reglas» (G2/G3-datos/G6/S2 · ADR-010 · carta blanca del usuario) — */
var MET_FILE='datos/metricas-equipo.json', PRE_FILE='datos/presupuestos.json', AUD_FILE='datos/auditoria.json';
/* G2: estilo anónimo por persona — NUNCA nombres ni teléfonos de clientes */
window.metMia=function(){
  var o=cliLeer(), n=0, act7=0, pipe=0, emb={prep:0,oferta:0,nego:0,gan:0,per:0}, lim=new Date(); lim.setDate(lim.getDate()-7);
  var lims=lim.toISOString().slice(0,10), k;
  for(k in o){ var f=crmNorm(o[k]); n++;
    (f.notas||[]).forEach(function(nt){ if(nt&&nt.f&&nt.f>=lims) act7++; });
    if(f.estado==='interesado'||f.estado==='factura'||f.estado==='cita'||f.estado==='visita'){ var m=parseFloat(String(f.factura||'').replace(',','.')); if(m>0) pipe+=m; }
    (f.pis||[]).forEach(function(p){ if(emb[p.est]!==undefined) emb[p.est]++; });
  }
  return {ts:Math.round(Date.now()/1000),fichas:n,act7:act7,pipe:pipe,emb:emb};
};
window.metPublica=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  maeGet(MET_FILE,function(st,j){
    if(st!==200&&st!==404){ cb(false,'red '+st); return; }
    var eq={};
    if(st===200){ try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; eq=(c&&c.eq)||{}; }catch(e){} }
    eq[proMiSlug()]=metMia();
    maePut(MET_FILE,{v:1,upd:hoyLocal(),eq:eq},function(st2){ cb(st2===200?{ok:1}:false,st2===200?null:('met '+st2)); });
  });
};
/* G6: presupuesto colaborativo v1 — borrador → revisión → aprobada (merge por estado más avanzado) */
var PRE_ORDEN=['bor','rev','apr'];
function preGuardar(a){ try{ LSs('cfb_presupuestos',(a||[]).slice(0,100)); }catch(e){} }
window.preLista=function(){ var a=LSg('cfb_presupuestos',[]); return Array.isArray(a)?a:[]; };
window.preAdd=function(o){
  o=o||{}; var a=preLista();
  var it={id:'pre'+Math.round(Date.now()/1000).toString(36)+Math.floor(Math.random()*1e4).toString(36),
    nombre:String(o.nombre||'').replace(/[<>&\"]/g,'').slice(0,60), ah:Math.round(Number(o.ah)||0),
    nota:String(o.nota||'').replace(/[<>&\"]/g,'').slice(0,120), est:PRE_ORDEN.indexOf(o.est)>-1?o.est:'bor',
    yo:proMiSlug(), ts:Math.round(Date.now()/1000)};
  if(!it.nombre) return null;
  a.push(it); preGuardar(a);
  try{ if(cliSyncEstado().on) prePush(function(){}); }catch(e){}
  try{ busEmite('pre.movio',{id:it.id,est:it.est,nombre:it.nombre}); }catch(eB){}   /* F4 */
  return it;
};
window.preEst=function(id,est){
  if(PRE_ORDEN.indexOf(est)<0) return false;
  var a=preLista(), f=false;
  a.forEach(function(it){ if(it.id===id){ it.est=est; it.ts=Math.round(Date.now()/1000); f=true; } });
  if(!f) return false;
  preGuardar(a);
  try{ if(cliSyncEstado().on) prePush(function(){}); }catch(e){}
  a.forEach(function(it){ if(it.id===id){ try{ busEmite('pre.movio',{id:it.id,est:est,nombre:it.nombre}); }catch(eB){} } });   /* F4 */
  return true;
};
window.preDel=function(id){ var a=preLista().filter(function(it){ return it.id!==id; }); preGuardar(a); };
window.preMerge=function(local,rem){
  var m={}; (local||[]).concat(rem||[]).forEach(function(it){
    if(!it||!it.id) return;
    var old=m[it.id];
    if(!old||PRE_ORDEN.indexOf(it.est)>PRE_ORDEN.indexOf(old.est)||(it.est===old.est&&(it.ts||0)>=(old.ts||0))) m[it.id]=it;
  });
  var sal=[]; for(var k in m) sal.push(m[k]);
  return sal.sort(function(x,y){ return (y.ts||0)-(x.ts||0); }).slice(0,100);
};
window.prePush=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  preJala(function(){
    var a=preLista();
    maePut(PRE_FILE,{v:1,upd:hoyLocal(),pres:a},function(st){ cb(st===200?{ok:a.length}:false,st===200?null:('pre '+st)); });
  });
};
window.preJala=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  maeGet(PRE_FILE,function(st,j){
    if(st!==200&&st!==404){ cb(false,'red '+st); return; }
    var rem=[];
    if(st===200){ try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; rem=(c&&c.pres)||[]; }catch(e){} }
    preGuardar(preMerge(preLista(),rem)); cb(true,null);
  });
};
window.preDesdeSim=function(){
  var r=window._simRes; if(!r||!r.res){ try{ toast('✘ '+Tc('Haga antes una simulación (pestaña 📄 Oferta)')); }catch(e){} return null; }
  var it=preAdd({nombre:r.empresa,ah:Math.round(r.res.ahorro),nota:Tc('Simulación potencia')+' '+(r.tipo==='30'?'3.0TD':'2.0TD')});
  if(it){ try{ CRM_FILTRO.seg='pre'; }catch(e){} window.crmRenderTab(); }
  return it;
};
window.preHtml=function(){
  var a=preLista(), eq=cliSyncEstado().on;
  var badge={bor:'#64748B',rev:'#B45309',apr:'#007A3B'}, lab={bor:Tc('🧰 Borrador'),rev:Tc('👀 En revisión'),apr:Tc('✔ Aprobada')};
  var filas=a.map(function(it){
    var nxt=(it.est==='bor'?'rev':(it.est==='rev'?'apr':''));
    return '<div class="crm-fila" style="border-color:'+badge[it.est]+'"><span class="crm-f"><span class="crm-n">'+xh(it.nombre)+' <span class="crm-pill" style="background:'+badge[it.est]+';color:#fff">'+lab[it.est]+'</span></span>'
      +'<div class="crm-m">'+(it.ah?('💶 '+it.ah+' €/año'):'')+(it.nota?(' · '+xh(it.nota)):'')+' · '+xh(it.yo)+'</div></span>'
      +'<span style="display:flex;gap:4px">'
      +(nxt?('<button type="button" class="crm-btn sec" style="padding:4px 8px;font-size:.8rem" onclick="preEst(\''+it.id+'\',\''+nxt+'\')">'+(nxt==='rev'?'👀':'✔')+'</button>'):'')
      +'<button type="button" class="crm-btn sec" style="padding:4px 8px;font-size:.8rem;color:#B91C1C" onclick="preDel(\''+it.id+'\');crmRenderTab()">🗑</button></span></div>';
  }).join('');
  return crmSegBar('pre')
    +'<div class="reglas"><h4>💶 '+Tc('Ofertas del equipo')+'</h4>'+Tc('Presupuestos colaborativos: borrador → revisión → aprobada. Viajan por la caja fuerte del equipo (repo privado).')+'</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">'
    +'<input class="crm-inp" id="preNom" placeholder="'+Tc('Empresa…')+'" style="width:160px">'
    +'<input class="crm-inp" id="preAh" placeholder="'+Tc('€/año est.')+'" type="number" style="width:110px">'
    +'<button type="button" class="crm-btn" onclick="preAddUI()">＋ '+Tc('Añadir')+'</button>'
    +(window._simRes?('<button type="button" class="crm-btn" style="background:#6D28D9" onclick="preDesdeSim()">⚡ '+Tc('Desde la última simulación')+'</button>'):'')
    +(eq?'<button type="button" class="crm-btn sec" onclick="prePush(function(ok){toast(ok?\'⇄ Ofertas con el equipo\':\'✘ red\');crmRenderTab();})">⇄ '+Tc('Sincronizar')+'</button>':'')
    +'</div>'
    +(filas||('<div class="crm-mini">'+Tc('Aún no hay ofertas. Cree una a mano o desde el 📄 simulador de una ficha.')+'</div>'));
};
window.preAddUI=function(){
  var n=g('preNom'), ah=g('preAh'); if(!n||!ah) return;
  var it=preAdd({nombre:n.value.trim(),ah:ah.value});
  if(!it){ try{ toast('✘ '+Tc('Nombre de empresa, por favor')); }catch(e){} return; }
  window.crmRenderTab();
};
/* S2: cadena de auditoría (array FIFO cap 500) — metadata de mando, sin PII */
window.audMarca=function(ev,det,cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'sin clave'); return; }
  maeGet(AUD_FILE,function(st,j){
    if(st!==200&&st!==404){ cb(false,'red '+st); return; }
    var a=[];
    if(st===200){ try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; a=Array.isArray(c&&c.a)?c.a:[]; }catch(e){} }
    var d=new Date(), hh=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    a.push({f:hoyLocal(),h:hh,qui:proMiSlug(),ev:String(ev).slice(0,24),det:String(det==null?'':det).slice(0,120)});
    a=a.slice(-500);
    maePut(AUD_FILE,{v:1,upd:hoyLocal(),a:a},function(st2){ cb(st2===200?true:false,st2===200?null:('aud '+st2)); });
  });
};
window.audLeer=function(cb){ /* lectura compartida flota/admin */
  cb=cb||function(){};
  maeGet(AUD_FILE,function(st,j){
    if(st!==200){ cb([],null); return; }
    try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; cb((c&&c.a)||[],null); }catch(e){ cb([],e.message); }
  });
};


/* — v4.1.2 Ola 3(b) «Automatismos» (F4 = M4 bus de eventos + M3 reglas en datos · ADR-011 · carta blanca del usuario) — */
var BUS_L={}, BUS_CAP=20;
window.busOn=function(evt,fn){
  if(typeof fn!=='function') return false;
  BUS_L[evt]=BUS_L[evt]||[]; if(BUS_L[evt].length>=BUS_CAP) return false;
  BUS_L[evt].push(fn); return true;
};
function busNucleo(evt,data){ (BUS_L[evt]||[]).forEach(function(fn){ try{ fn(data||{}); }catch(e1){} }); }   /* un oyente roto no rompe a los demás */
window.busEmite=function(evt,data){
  data=data||{};
  try{ busNucleo(evt,data); }catch(e0){}
  try{ reglasEval(evt,data); }catch(eR){}       /* el bus nunca rompe al emisor */
};
/* avisos visibles en «Hoy» (cfb_avisos ≤30) */
function avisosLeer(){ var a=LSg('cfb_avisos',[]); return Array.isArray(a)?a:[]; }
function avisosPush(txt,evt,nombre,regla){
  try{
    var a=avisosLeer();
    a.push({f:hoyLocal(),txt:String(txt||'').slice(0,160),evt:String(evt||'').slice(0,24),n:String(nombre||'').slice(0,60),r:String(regla||'').slice(0,24)});
    LSs('cfb_avisos',a.slice(-30));
  }catch(e){}
}
window.busLimpiaAvisos=function(){ try{ LSs('cfb_avisos',[]); }catch(e){} };
window.busAvisosCard=function(){
  var a=avisosLeer(); if(!a.length) return '';
  var filas=a.slice(-6).reverse().map(function(x){
    return '<div class="crm-fila" style="border-color:#6D28D9'+(x.n?(';cursor:pointer" onclick="crmIrFicha(decodeURIComponent(\''+encURI(x.n)+'\'))')+'' :'"')+'><span class="crm-f"><span class="crm-n">'+xh(x.txt)+'</span><div class="crm-m">📅 '+xh(x.f)+' · ⚙ '+xh(x.r)+'</div></span></div>';
  }).join('');
  return '<div class="reglas" style="border-left:4px solid #6D28D9"><h4>🔔 '+Tc('Automatismos')+' ('+a.length+') <button type="button" class="crm-btn sec" style="padding:2px 8px;font-size:.75rem" onclick="busLimpiaAvisos();crmRenderTab()">🧹 '+Tc('limpiar')+'</button></h4>'+filas+'</div>';
};
/* huella anti-bucle: misma regla+evento+nombre ≤1 por 24 h */
function regHuella(k){
  try{
    var m=LSg('cfb_reg_huellas',{})||{}, hoy=Date.now(), viejas=0;
    if(m[k]&&(hoy-m[k])<86400000) return true;
    m[k]=hoy;
    var ks=Object.keys(m); if(ks.length>200){ for(var i=0;i<ks.length;i++){ if(hoy-(m[ks[i]]||0)>604800000){ delete m[ks[i]]; viejas++; } } }   /* poda 7d */
    LSs('cfb_reg_huellas',m);
  }catch(e){}
  return false;
}
/* plantilla ${campo} con saneado */
function regTxt(t,data){
  return String(t||'').replace(/\$\{([a-zA-Z0-9_]+)\}/g,function(m,k){ return actLimpia(String(data[k]==null?'':data[k]),60); });
}
/* semilla embebida (los equipos la sustituyen con datos/reglas.json — patrón catálogo M3) */
var REGLAS_SEED=[
  {id:'pi-oferta',cuando:'pi.movio',todo:{est:'oferta'},haz:{tipo:'aviso',texto:'📄 ${id} ofertado en ${nombre}: prepara la comparativa con su factura'}},
  {id:'pi-gan',cuando:'pi.movio',todo:{est:'gan'},haz:{tipo:'prox',dias:15,texto:'Post-venta ${id} en ${nombre}: firma y primer ahorro'}},
  {id:'ficha-factura',cuando:'ficha.movio',todo:{a:'factura'},haz:{tipo:'aviso',texto:'🧾 ${nombre} pide la factura: simulación 📄 desde su ficha'}},
  {id:'pre-aprobada',cuando:'pre.movio',todo:{est:'apr'},haz:{tipo:'aviso',texto:'🏆 ${nombre}: presupuesto aprobado — a por la firma'}}
];
var REGLAS=REGLAS_SEED.slice();
function regNorm(r){
  if(!r||typeof r!=='object') return null;
  var haz=r.haz||{}, tipo=String(haz.tipo||'');
  if(['aviso','prox','nota'].indexOf(tipo)<0) return null;
  var todo={}, cnt=0;
  if(r.todo&&typeof r.todo==='object'){ for(var k in r.todo){ if(cnt>=6) break; todo[actLimpia(k,24)]=actLimpia(String(r.todo[k]),40); cnt++; } }
  return { id:actLimpia(r.id||('r'+Math.round(Math.random()*1e6)),24), cuando:actLimpia(r.cuando,24)||'',
    todo:todo, haz:{tipo:tipo,dias:Math.min(90,Math.max(1,Math.round(Number(haz.dias)||7))),texto:actLimpia(haz.texto,160)} };
}
window.reglasAplica=function(doc){   /* para tests / futuro admin: doc {v:1,reglas:[...]} → REGLAS vigentes; vacío ⇒ semilla */
  var arr=(doc&&Array.isArray(doc.reglas))?doc.reglas:[];
  var limpias=arr.map(regNorm).filter(function(x){ return x&&x.cuando; });
  REGLAS=limpias.length?limpias:REGLAS_SEED.slice();
  return REGLAS.length;
};
window.reglasJala=function(cb){
  cb=cb||function(){};
  try{
    var c=LSg('reg_cache',null);
    if(c&&c.ok&&c.ts&&(Date.now()-c.ts)<28800000){ cb(REGLAS.length,false); return; }   /* caché 8 h */
  }catch(e){}
  fetch('datos/reglas.json',{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('http '+r.status);
    return r.json();
  }).then(function(j){
    var n=reglasAplica(j);
    try{ LSs('reg_cache',{ts:Date.now(),ok:true}); }catch(e){}
    cb(n,false);
  }).catch(function(){ cb(REGLAS.length,'offline/seed'); });
};
var _REG_AUTO=false;
function reglasAuto(){ if(_REG_AUTO) return; _REG_AUTO=true; try{ reglasJala(function(){}); }catch(e){} }
var REG_BUSY=false;   /* anti-bucle v1: una regla no dispara reglas (documentado ADR-011) */
function reglasEval(evt,data){
  reglasAuto();
  if(REG_BUSY) return;
  REG_BUSY=true;
  try{
    (REGLAS||[]).slice(0,24).forEach(function(r){
      try{
        if(!r||r.cuando!==evt) return;
        var ok=true;
        for(var k in r.todo){ if(String(data[k]==null?'':data[k])!==String(r.todo[k])){ ok=false; break; } }
        if(!ok) return;
        if(regHuella((r.id||'?')+'|'+evt+'|'+(data.nombre||data.id||''))) return;
        var txt=regTxt(r.haz.texto,data);
        if(r.haz.tipo==='aviso'){ avisosPush(txt,evt,data.nombre||data.id||'',r.id); try{ toast(txt); }catch(eT){} }
        else if(r.haz.tipo==='prox'&&data.nombre){
          var f0=(cliLeer()[cliNorm(data.nombre)]);
          if(f0){
            f0=crmNorm(f0); var hoy=hoyLocal();
            if(!f0.prox||!f0.prox.f||f0.prox.f<hoy){       /* jamás pisa la agenda del comercial */
              var d2=new Date(); d2.setDate(d2.getDate()+r.haz.dias);
              cliUp(data.nombre,{prox:{f:d2.toISOString().slice(0,10),h:'',accion:txt}});
            }
          }
        }
        else if(r.haz.tipo==='nota'&&data.nombre){ cliAnadir(data.nombre,txt); }
      }catch(e1){}
    });
  }catch(e2){}
  REG_BUSY=false;
}
window.reglasEval=reglasEval;


/* — v4.1.4 Ola 3(c) «Informe y salud» (F6 + Q7 · ADR-012 · carta blanca del usuario) — */
/* Q7 · ring de telemetría técnica LOCAL (≤120) — nunca nombres de clientes */
function salLeer(){ var a=LSg('cfb_salud',[]); return Array.isArray(a)?a:[]; }
window.salMarca=function(tipo,ms,kb){
  try{
    var d=new Date(), hh=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    var a=salLeer();
    a.push({t:Date.now(),f:hoyLocal(),h:hh,tipo:String(tipo).slice(0,16),ms:Math.max(0,Math.round(Number(ms)||0)),kb:Math.max(0,Math.round(Number(kb)||0))});
    LSs('cfb_salud',a.slice(-120));
  }catch(e){}
};
window.salMia=function(){
  var a=salLeer(), ms=a.filter(function(x){ return x.tipo==='sync_total'; }).map(function(x){ return x.ms; }).sort(function(x,y){ return x-y; });
  var n=ms.length;
  return { ts:Math.round(Date.now()/1000), version:String(window.CFB_VERSION||'').slice(0,16),
    nPush:n, p50:(n?ms[Math.floor((n-1)*0.5)]:0), p95:(n?ms[Math.floor((n-1)*0.95)]:0),
    n409:a.filter(function(x){ return x.tipo==='409'; }).length,
    kbMax:Math.max(0,Math.max.apply(null,a.map(function(x){ return x.kb||0; }).concat([0]))),
    ultima:(a.length?a[a.length-1].t:0) };
};
window.salPublica=function(cb){
  cb=cb||function(){};
  if(!cliSyncEstado().on){ cb(false,'dormant'); return; }
  if(!salLeer().length){ cb(false,'sin datos'); return; }
  maeGet('datos/salud.json',function(st,j){
    if(st!==200&&st!==404){ cb(false,'red '+st); return; }
    var eq={};
    if(st===200){ try{ var c=j&&j.content?JSON.parse(decodeURIComponent(escape(atob(String(j.content).replace(/\n/g,''))))):j; eq=(c&&c.eq)||{}; }catch(e){} }
    eq[proMiSlug()]=salMia();   /* agregado ANÓNIMO: tiempos, contadores, tamaños, versión */
    maePut('datos/salud.json',{v:1,upd:hoyLocal(),eq:eq},function(st2){ cb(st2===200?{ok:1}:false,st2===200?null:('sal '+st2)); });
  });
};
/* F6 · informe semanal — 100 % LOCAL, solo agregados (sin nombres de clientes) */
window.infSemana=function(){
  var m=window.metMia();
  var a=actLeer(), lim=Date.now()-7*86400000, dias={}, total=0, movs={oferta:0,nego:0,gan:0,per:0}, top={}, llam={};
  a.forEach(function(e){
    if(!e||!e.ts||e.ts<lim) return;
    total++;
    dias[e.f]=(dias[e.f]||0)+1;
    if(e.tipo==='llamada'||e.tipo==='crm'||e.tipo==='prospeccion'){ llam[e.tipo]=(llam[e.tipo]||0)+1; }
    if(e.tipo==='crm'&&/embudo/.test(e.detalle||'')&&movs[e.resultado]!==undefined){
      movs[e.resultado]++;
      var mm=String(e.detalle||'').match(/embudo ([^ ]+)/);
      if(mm) top[mm[1]]=(top[mm[1]]||0)+1;
    }
  });
  var pre={bor:0,rev:0,apr:0};
  preLista().forEach(function(p){ if(pre[p.est]!==undefined) pre[p.est]++; });
  var rgo={alto:0,medio:0};
  try{ crmRiesgoList().forEach(function(it){ if(it.sc>=40) rgo.alto++; else rgo.medio++; }); }catch(eR){}   /* F22: agregado sin nombres (ADR-013) */
  var de=new Date(lim+86400000), hoy=new Date();
  return { de:de.toISOString().slice(0,10), a:hoy.toISOString().slice(0,10),
    total:total, dias:dias, llam:llam, movs:movs,
    top:Object.keys(top).map(function(k){ return {id:k,n:top[k]}; }).sort(function(x,y){ return y.n-x.n; }).slice(0,5),
    pre:pre, met:m, rgo:rgo };
};
function infTablaDias(dias){
  var ks=Object.keys(dias).sort();
  if(!ks.length) return '<div class="crm-mini">'+Tc('Aún sin gestiones esta semana: cada ficha tocada/creada cuenta.')+'</div>';
  var max=1; ks.forEach(function(k){ if(dias[k]>max) max=dias[k]; });
  return ks.map(function(k){
    var n=dias[k], pct=Math.max(6,Math.round(n/max*100));
    return '<div class="cfb-fila" style="display:flex;align-items:center;gap:8px"><span style="width:86px;flex:none">'+k.slice(5)+'</span>'
      +'<span style="flex:1;height:8px;background:var(--gris-linea);border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:'+pct+'%;background:var(--grad-marca,linear-gradient(135deg,#00A650,#007A3B));border-radius:99px"></span></span>'
      +'<b style="width:22px;text-align:right">'+n+'</b></div>';
  }).join('');
}
window.infTexto=function(){
  var r=infSemana(), L=[];
  L.push('📄 Informe semanal — Call Flow Business ('+r.de+' → '+r.a+')');
  L.push('· Gestiones registradas: '+r.total+' ('+(r.llam.llamada||0)+' llamadas · '+(r.llam.crm||0)+' CRM · '+(r.llam.prospeccion||0)+' prospección)');
  L.push('· Pipeline estimado: '+(r.met.pipe||0)+' €/mes en '+r.met.fichas+' fichas');
  L.push('· Túnel: '+r.met.emb.prep+' propuesta · '+r.met.emb.oferta+' oferta · '+r.met.emb.nego+' negociación · '+r.met.emb.gan+' ganada · '+r.met.emb.per+' perdida');
  L.push('· Movimientos 7d: '+r.movs.oferta+' a oferta · '+r.movs.nego+' a negociación · '+r.movs.gan+' ganadas · '+r.movs.per+' perdidas');
  if(r.top.length) L.push('· Producto estrella: '+r.top[0].id+' ('+r.top[0].n+'×)');
  if(r.rgo&&(r.rgo.alto+r.rgo.medio)) L.push('· Riesgo de fuga: '+r.rgo.alto+' altos · '+r.rgo.medio+' medios (agregados, sin nombres)');
  L.push('· Presupuestos del equipo: '+(r.pre.bor+r.pre.rev+r.pre.apr)+' ('+r.pre.bor+' borrador · '+r.pre.rev+' revisión · '+r.pre.apr+' aprobados)');
  L.push('— generado en este dispositivo, sin enviar nada fuera');
  return L.join('\n');
};
function infCuerpo(){
  var r=infSemana();
  return '<div class="cfb-fila" style="display:flex;gap:14px;flex-wrap:wrap;margin:4px 0 8px">'
    +'<span class="crm-chip on">🗓 '+r.de.slice(5)+' → '+r.a.slice(5)+'</span>'
    +'<span class="crm-chip">✍ <b>'+r.total+'</b> gestiones</span>'
    +'<span class="crm-chip">💶 <b>'+(r.met.pipe||0)+'</b> €/mes pipe</span>'
    +'<span class="crm-chip">📦 <b>'+r.met.fichas+'</b> fichas</span>'
    +(r.rgo&&(r.rgo.alto+r.rgo.medio)?('<span class="crm-chip">🧯 <b>'+(r.rgo.alto+r.rgo.medio)+'</b> en riesgo</span>'):'')+'</div>'
    +'<div class="cfb-bloque"><b>📅 Gestiones por día</b>'+infTablaDias(r.dias)+'</div>'
    +'<div class="cfb-bloque"><b>🧩 Túnel (ahora)</b><div class="cfb-fila"><span>🧰 '+r.met.emb.prep+' propuesta · 📄 '+r.met.emb.oferta+' oferta · 🤝 '+r.met.emb.nego+' negociación · 🏆 '+r.met.emb.gan+' ganada · ✖ '+r.met.emb.per+' perdida</span></div></div>'
    +'<div class="cfb-bloque"><b>↔ Movimientos de la semana</b><div class="cfb-fila"><span>'+r.movs.oferta+' a 📄 oferta · '+r.movs.nego+' a 🤝 negociación · '+r.movs.gan+' 🏆 ganadas · '+r.movs.per+' ✖ perdidas</span></div>'
    +(r.top.length?('<div class="cfb-fila"><span>⭐ Producto estrella: <b>'+xh(r.top[0].id)+'</b> ('+r.top[0].n+'×)</span></div>'):'')+'</div>'
    +'<div class="cfb-bloque"><b>💶 Presupuestos del equipo</b><div class="cfb-fila"><span>'+r.pre.bor+' 🧰 borrador · '+r.pre.rev+' 👀 revisión · '+r.pre.apr+' ✔ aprobados</span></div></div>'
    +'<div class="crm-mini" style="margin-top:6px">🔒 '+Tc('Informe generado en este dispositivo con datos agregados: no salió de este móvil y no lleva nombres de clientes.')+'</div>';
}
window.infAbrir=function(){
  var viejo=document.getElementById('cfbInf'); if(viejo) viejo.remove();
  var ov=document.createElement('div'); ov.id='cfbInf';
  ov.style.cssText='position:fixed;inset:0;background:rgba(10,10,10,.42);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px';
  ov.innerHTML='<div class="card" style="max-width:520px;width:100%;max-height:86vh;overflow-y:auto;padding:16px 18px;animation:skinPop 250ms var(--ease)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">📄 '+Tc('Informe semanal')+'</h3>'
    +'<button type="button" class="crm-btn sec" onclick="document.getElementById(\'cfbInf\').remove()" aria-label="Cerrar">✕</button></div>'
    +infCuerpo()
    +'<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'
    +'<button type="button" class="crm-btn" onclick="infImprimir()">🖨 '+Tc('Imprimir / PDF')+'</button>'
    +'<button type="button" class="crm-btn sec" onclick="infCopiar(this)">📋 '+Tc('Copiar texto')+'</button></div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
  document.body.appendChild(ov);
};
window.infCopiar=function(btn){
  var txt=infTexto();
  var ok=function(){ try{ if(btn){ var t=btn.textContent; btn.textContent='✔ '+Tc('Copiado'); setTimeout(function(){ btn.textContent=t; },1400); } }catch(e){} };
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok,function(){ infCopiarFallback(txt); ok(); }); return; }
  }catch(e){}
  infCopiarFallback(txt); ok();
};
function infCopiarFallback(txt){
  try{
    var ta=document.createElement('textarea'); ta.value=txt; ta.style.cssText='position:fixed;top:-999px';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }catch(e){}
}
window.infImprimir=function(){
  var r=infSemana();
  var viejo=document.getElementById('cfbInfPrint'); if(viejo) viejo.remove();
  var d=new Date(), hh=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
  var el=document.createElement('div'); el.id='cfbInfPrint';
  el.innerHTML='<div class="sp-head"><div class="sp-logo">Call Flow Business · B&amp;M Asesores Energéticos</div>'
    +'<div class="sp-meta">'+hoyLocal()+' · '+hh+'</div></div>'
    +'<h2 style="margin:10px 0 6px">📄 Informe semanal ('+r.de+' → '+r.a+')</h2>'
    +'<pre style="white-space:pre-wrap;font:13px/1.5 var(--font-body,monospace)">'+xh(infTexto())+'</pre>'
    +'<div class="sp-pie">Call Flow Business · informe local agregado · RGPD: no salió de este dispositivo</div>';
  document.body.appendChild(el);
  document.body.classList.add('cfb-printing');
  var fin=function(){ document.body.classList.remove('cfb-printing'); var o=document.getElementById('cfbInfPrint'); if(o) o.remove(); };
  window.addEventListener('afterprint',fin);
  try{ window.print(); }catch(e){} 
  setTimeout(fin,1200);
};

/* ═══ v4.2.0 «Tarifas vivas y riesgo» (Ola 3d · ADR-013) ═══
   G10 OMIE: pool diario €/MWh desde datos/omie.json (GitHub Action diaria — la app JAMÁS habla
   con el proveedor del pool: ese acopio vive en CI). Patrón catálogo: caché LS 8 h + fetch relativo tolerante a
   404 (repo sin Action = estado «sin datos», no error). Fallback manual 100 % local.
   F22 churn: score 0-100 determinista (fin de contrato · días sin toque · €/kWh vs pool30).
   Nada sale del dispositivo: el informe y el admin solo ven agregados sin nombres. */
window.omieGet=function(cb){
  cb=cb||function(){};
  try{ var c=LSg('omie_cache',null); if(c&&c.dias&&c.ts&&(Date.now()-c.ts)<28800000){ cb(c.dias,false,null); return; } }catch(e){}
  fetch('datos/omie.json',{cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('http '+r.status);
    return r.json();
  }).then(function(j){
    var limp=omieLimpia((j&&j.dias)||{});
    try{ LSs('omie_cache',{ts:Date.now(),dias:limp}); }catch(e){}
    cb(limp,false,null);
  }).catch(function(){ cb({},true,'offline/sin-omie'); });        /* 404 = repo sin Action todavía: estado «sin datos» */
};
function omieLimpia(dias){
  var limp={}; Object.keys(dias||{}).forEach(function(k){
    var v=Number(dias[k]);
    if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&isFinite(v)&&v>=0&&v<5000) limp[k]=Math.round(v*100)/100;
  });
  var ks=Object.keys(limp).sort();
  if(ks.length>400){ var rec={}; ks.slice(-400).forEach(function(k){ rec[k]=limp[k]; }); return rec; }   /* poda 400 días — mismo tope que el Action */
  return limp;
}
window.omieMedia=function(dias,n){
  var ks=Object.keys(dias||{}).sort().slice(-(n||30)), s=0, c=0;
  ks.forEach(function(k){ var v=Number(dias[k]); if(isFinite(v)){ s+=v; c++; } });
  return c?+(s/c).toFixed(2):null;
};
window.omieUlt=function(dias){
  var ks=Object.keys(dias||{}).sort();
  return ks.length?{f:ks[ks.length-1],e:+Number(dias[ks[ks.length-1]]).toFixed(2)}:null;
};
window.omieDias=function(){ try{ var c=LSg('omie_cache',null); return (c&&c.dias)||{}; }catch(e){ return {}; } };
window.omieManual=function(txt){
  txt=String(txt||'');
  var dias=omieDias(), n=0;
  txt.split(/[\n;]+/).forEach(function(l){
    l=l.trim(); if(!l) return;
    var m=/^(\d{4}-\d{2}-\d{2})[\s,]+([0-9]+(?:[.,][0-9]+)?)$/.exec(l);
    if(m){ var v=parseFloat(m[2].replace(',','.')); if(isFinite(v)&&v>=0&&v<5000){ dias[m[1]]=Math.round(v*100)/100; n++; } return; }
    var v2=parseFloat(l.replace(',','.'));
    if(isFinite(v2)&&v2>=0&&v2<5000){ dias[hoyLocal()]=Math.round(v2*100)/100; n++; }   /* suelto → hoy */
  });
  if(!n) return 0;
  try{ LSs('omie_cache',{ts:Date.now(),dias:omieLimpia(dias)}); }catch(e){}
  return n;
};
window.omieRefrescar=function(){ try{ LSs('omie_cache',{ts:0,dias:omieDias()}); }catch(e){} omieGet(function(){ window.omieAbrir(); }); };
window.omieAbrir=function(){
  var viejo=document.getElementById('cfbOmie'); if(viejo) viejo.remove();
  omieGet(function(dias,err,msg){
    var ult=omieUlt(dias), m7=omieMedia(dias,7), m30=omieMedia(dias,30);
    var ks=Object.keys(dias||{}).sort();
    function medRango(a,b){ var s=0,c=0; ks.slice(a,b).forEach(function(k){ s+=Number(dias[k]); c++; }); return c?(s/c):null; }
    var prev=medRango(-14,-7), act=medRango(-7);
    var tend=(prev&&act)?((act-prev)/prev*100):null;
    var ov=document.createElement('div'); ov.id='cfbOmie';
    ov.style.cssText='position:fixed;inset:0;background:rgba(10,10,10,.42);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px';
    ov.innerHTML='<div class="card" style="max-width:460px;width:100%;max-height:86vh;overflow-y:auto;padding:16px 18px;animation:skinPop 250ms var(--ease)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">⚡ '+Tc('Pool OMIE (mercado diario)')+'</h3>'
      +'<button type="button" class="crm-btn sec" onclick="document.getElementById(\'cfbOmie\').remove()" aria-label="Cerrar">✕</button></div>'
      +(ult
        ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 6px">'
          +'<span class="crm-chip on">📅 '+ult.f+' · <b>'+ult.e.toFixed(2)+'</b> €/MWh</span>'
          +(m7!=null?'<span class="crm-chip">7d <b>'+m7.toFixed(1)+'</b></span>':'')
          +(m30!=null?'<span class="crm-chip">30d <b>'+m30.toFixed(1)+'</b></span>':'')
          +(tend!=null?'<span class="crm-chip">'+(tend>=0?'▲ +':'▼ ')+tend.toFixed(1)+'% '+Tc('sem./sem.')+'</span>':'')
          +'</div>'
          +'<div class="crm-mini">'+Tc('Referencia para preparar la visita (pool puro 30 días, sin peajes): ')+'<b>'+(m30!=null?(m30/1000).toFixed(3):'—')+' €/kWh</b></div>'
        : '<div class="cfb-nota" style="padding:10px 2px">'+Tc('Sin precio todavía: la GitHub Action diaria del repo escribe datos/omie.json sola — o péguelo abajo a mano.')+'</div>')
      +'<div style="margin-top:10px"><b style="font-size:.85rem">✍ '+Tc('Entrada manual (solo en este dispositivo)')+'</b>'
      +'<textarea class="crm-inp" id="omieTa" style="width:100%;min-height:56px;margin-top:4px" placeholder="'+Tc('87.42  (→ hoy) — o una línea por día: 2026-10-06 87.42')+'"></textarea>'
      +'<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">'
      +'<button type="button" class="crm-btn" onclick="omieGuardarManual()">💾 '+Tc('Guardar aquí')+'</button>'
      +'<button type="button" class="crm-btn sec" onclick="omieRefrescar()">↻ '+Tc('Actualizar del repo')+'</button></div>'
      +'<div class="crm-mini" style="margin-top:6px">'+(err?('⚠ '+xh(String(msg||''))+' · '):'')+Tc('🔒 Dato de mercado: no lleva clientes; lo manual no sale de este dispositivo.')+'</div></div></div>';
    ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
    document.body.appendChild(ov);
  });
};
window.omieGuardarManual=function(){
  var ta=document.getElementById('omieTa');
  var n=omieManual(ta?ta.value:'');
  try{ toast(n>0?('⚡ '+n+' '+Tc('precio(s) guardados aquí')):('✘ '+Tc('No leí ningún número: p. ej. 87.42'))); }catch(e){}
  window.omieAbrir();
};
/* — F22 churn: score 0-100. Fichas vivas (abiertas o ✔ganadas) suenan; perdidas no. — */
var CHURN_PX_ALTO=2.2, CHURN_PX_MEDIO=1.8;
window.crmRiesgo=function(f,dias){
  f=crmNorm(f);
  var out={sc:0,por:[]};
  if(f.estado==='perdido') return out;
  var hoy=hoyLocal(), t0=Date.parse(hoy+'T00:00:00');
  if(f.fin_contrato){                                                          /* 1) contrato */
    var d=Math.round((Date.parse(f.fin_contrato+'T00:00:00')-t0)/86400000);
    if(d<=0){ out.sc+=50; out.por.push(Tc('contrato vencido')); }
    else if(d<=30){ out.sc+=50; out.por.push(Tc('contrato acaba en')+' '+d+' '+Tc('días')); }
    else if(d<=60){ out.sc+=40; out.por.push(Tc('contrato acaba en')+' '+d+' '+Tc('días')); }
    else if(d<=120){ out.sc+=25; out.por.push(Tc('contrato a')+' '+d+' '+Tc('días')); }
  }
  var ult=f.creado||'';                                                        /* 2) sin toque */
  (f.notas||[]).forEach(function(nt){ if(nt&&nt.f&&nt.f>ult) ult=nt.f; });
  if(/^\d{4}-\d{2}-\d{2}$/.test(ult)){
    var dt=Math.max(0,Math.round((t0-Date.parse(ult+'T00:00:00'))/86400000));
    if(dt>=45){ out.sc+=25; out.por.push(Tc('sin tocar')+' '+dt+' '+Tc('días')); }
    else if(dt>=21){ out.sc+=18; out.por.push(Tc('sin tocar')+' '+dt+' '+Tc('días')); }
    else if(dt>=10){ out.sc+=8; out.por.push(Tc('sin tocar')+' '+dt+' '+Tc('días')); }
  }
  var pk=parseFloat(String(f.precio_kwh||'').replace(',','.'));               /* 3) € vs pool */
  var m30=(dias&&omieMedia(dias,30));
  if(isFinite(pk)&&pk>0&&m30){
    var x=pk/(m30/1000);
    if(x>CHURN_PX_ALTO){ out.sc+=25; out.por.push(Tc('paga')+' '+x.toFixed(1)+'× '+Tc('el pool')); }
    else if(x>CHURN_PX_MEDIO){ out.sc+=8; out.por.push(Tc('precio sobre el pool')+' ('+x.toFixed(1)+'×)'); }
  }
  out.sc=Math.min(100,out.sc);
  return out;
};
window.crmRiesgoList=function(){
  var o=cliLeer(), dias=omieDias(), ar=[];
  Object.keys(o).forEach(function(n){
    var f=crmNorm(o[n]);
    var r=window.crmRiesgo(f,dias);
    if(r.sc>=25) ar.push({n:n,f:f,sc:r.sc,por:r.por});
  });
  ar.sort(function(a,b){ return b.sc-a.sc||(a.n<b.n?-1:1); });
  return ar;
};

/* ── cromo UI (100% FR/PT) ── */
(function(){
var U={
 'El cliente responde…':['Le client répond…','O cliente responde…','The client answers…'],
 '¿Objeción directa?':['Objection directe ?','Objeção direta?','Direct objection?'],
 '— Abrir manejo de objeción… —':['— Ouvrir la gestion d’objection… —','— Abrir gestão de objeção… —','— Open objection handling… —'],
 'Atajos':['Raccourcis','Atalhos','Shortcuts'],
 '🤝 Ir al cierre':['🤝 Aller à la conclusion','🤝 Ir ao fecho','🤝 Go to closing'],
 '🧠 Anexo neuro':['🧠 Annexe neuro','🧠 Anexo neuro','🧠 Neuro annex'],
 '🇪🇸 Glosario':['🇫🇷 Glossaire','🇵🇹 Glossário','🇬🇧 Glossary'],
 '← Volver':['← Retour','← Voltar','← Back'],
 '↺ Reiniciar':['↺ Recommencer','↺ Reiniciar','↺ Restart'],
 '🎯 Foco':['🎯 Focus','🎯 Foco'],
 '🎯 Foco: ON':['🎯 Focus : ON','🎯 Foco: ON','🎯 Focus: ON'],
 '✎ Guardar en Mis clientes':['✎ Enregistrer dans Mes clients','✎ Guardar em Os meus clientes','✎ Save to My clients'],
 'Ocultar':['Masquer','Ocultar','Hide'],
 '📝 Nota rápida de la llamada':['📝 Note rapide de l’appel','📝 Nota rápida da chamada','📝 Quick call note'],
 'Cliente (p. ej. Bar La Mareta)':['Client (p. ex. Bar La Mareta)','Cliente (p. ex. Bar La Mareta)','Client (e.g. Bar La Mareta)'],
 '☎ Teléfono (opc.)':['☎ Téléphone (fac.)','☎ Telefone (opc.)','☎ Phone (opt.)'],
 'Lo acordado, lo pendiente…':['Le convenu, le en suspens…','O combinado, o pendente…','What was agreed, what’s pending…'],
 '📞 Llamar':['📞 Appeler','📞 Ligar','📞 Call'],
 'Pulse la respuesta del cliente para avanzar':['Appuyez sur la réponse du client pour avancer','Toque na resposta do cliente para avançar','Tap the client’s answer to move on'],
 'Árbol de decisión':['Arbre de décision','Árvore de decisão','Decision tree'],
 '¿Cliente cede? ⏵ vuelve al flujo':['Le client cède ? ⏵ retour au flux','O cliente cede? ⏵ volta ao fluxo','Client relents? ⏵ back to flow'],
 '7 · Objeción':['7 · Objection','7 · Objeção'],
 'Cliente cede y seguimos':['Le client cède, on continue','O cliente cede e seguimos','Client relents, we go on'],
 'Volver al flujo donde íbamos':['Revenir au flux où nous étions','Voltar ao fluxo onde íamos','Back to the flow where we were'],
 'Idioma':['Langue','Idioma','Language'],
 'Cobertura traducida':['Couverture traduite','Cobertura traduzida','Translated coverage'],
 ' (oleadas en curso)':[' (vagues en cours)',' (vagas em curso)',' (waves in progress)'],
