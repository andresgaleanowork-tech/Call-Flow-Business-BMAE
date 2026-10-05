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
window.cliBorraFicha=function(nombre){ if(confirm('¿Borrar la ficha de «'+nombre+'» y todas sus notas? (no hay vuelta atrás)')){ cliBorrar(nombre); toast('🗑 Ficha borrada'); window.cliVerTodo(); } };
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
function crmNorm(f){
  f=f&&typeof f==='object'?f:{};
  if(f.v!==3){ f.v=3; }
  ['tel','sector','ciudad','comercializadora','factura','dolor'].forEach(function(k){ if(typeof f[k]!=='string') f[k]=''; });
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
  var f=crmNorm(o[nombre]||{creado:hoyLocal(),notas:[]});
  ['tel','sector','ciudad','comercializadora','factura','dolor'].forEach(function(k){
    if(campos&&campos[k]!==undefined) f[k]=String(campos[k]==null?'':campos[k]).replace(/[<>&\"]/g,'').slice(0,80);
  });
  if(campos&&campos.estado&&crmDefId(campos.estado)) f.estado=campos.estado;
  if(campos&&campos.prox&&typeof campos.prox==='object'){ f.prox={f:String(campos.prox.f||'').slice(0,10),h:String(campos.prox.h||'').slice(0,5),accion:String(campos.prox.accion||'').replace(/[<>&\"]/g,'').slice(0,80)}; }
  o[nombre]=f; cliGuardarTodo(o); return f;
}
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
    var o=cliLeer(), e={nuevo:0,contactado:0,interesado:0,factura:0,cita:0,visita:0,ganado:0,perdido:0}, pipe=0;
    Object.keys(o).forEach(function(n){
      var f=crmNorm(o[n]); if(e[f.estado]===undefined) f.estado='nuevo';
      e[f.estado]++;
      if(f.estado==='interesado'||f.estado==='factura'||f.estado==='cita'||f.estado==='visita'){
        var m=parseFloat(String(f.factura||'').replace(',','.')); if(m>0) pipe+=m;
      }
    });
    LSs(cfbPref('crm_resumen'),{v:1,f:hoyLocal(),fichas:Object.keys(o).length,e:e,pipe:pipe});
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
    c:actLimpia(r.c,40), s:actLimpia(r.s,40), fuente:actLimpia(r.fuente,30),
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
    var f=cliUp(r.n,{tel:r.tel,sector:r.s,ciudad:r.c,estado:estado});
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
        if(st2===409){ req('GET','https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+encodeURI(path)+'?ref=main',undefined,function(st3,j3){
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
window.crmRenderTab=function(){
  var el=document.getElementById('tab-clientes'); if(!el) return;
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
        +'<button type="button" class="crm-chip" onclick="proVer(\'cli\')">👥 Clientes</button>'
        +'<button type="button" class="crm-chip on">📋 Potenciales</button>'
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
        +'<button type="button" class="btn" onclick="var d=document.getElementById(\'proImp\'); d.style.display=d.style.display===\'none\'?\'block\':\'none\'">⬆ Importar lista</button></div>'
        +'<div id="proImp" style="display:none;margin-bottom:10px"><textarea id="proImportTa" rows="5" style="width:100%;font:12px ui-monospace,monospace;padding:8px;border:1px solid var(--gris-linea,#ddd);border-radius:8px" placeholder="Una línea por potencial: Nombre;Teléfono;Ciudad;Sector"></textarea>'
        +'<button type="button" class="btn" onclick="proImporta()">Importar</button></div>'
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
    if(CRM_FILTRO.q){ var q=CRM_FILTRO.q.toLowerCase(); if((n+' '+f.tel+' '+f.sector+' '+f.ciudad).toLowerCase().indexOf(q)<0) return false; }
    return true;
  }).sort(function(a,b){ var fa=crmNorm(o[a]), fb=crmNorm(o[b]); var pa=fa.prox.f||'9999', pb=fb.prox.f||'9999'; return pa<pb?-1:(pa>pb?1:(a<b?-1:1)); });
  el.innerHTML='<div class="reglas"><h4>👥 '+T('Área Clientes')+'</h4>'+T('Mini-CRM de llamadas: fichas con estado, próxima acción y «📞 preparar llamada» (precarga las variables y abre el guion en el punto justo). Datos SOLO en este dispositivo.')+'</div>'
   +'<div class="crm-stats"><span class="crm-kpi">📇 <b>'+total+'</b> '+T('fichas')+'</span><span class="crm-kpi">⏰ <b>'+hoy.length+'</b> '+T('hoy/pendientes')+'</span>'
+(NCITAS?('<span class=\"crm-kpi\" style=\"cursor:pointer\" title=\"'+T('Clic para ver las fichas')+'\" onclick=\"crmFiltro(\'estado\',\'cita\')\">📅 <b>'+NCITAS+'</b> '+T('citas pendientes')+'</span>'):'')+(NFACT?('<span class=\"crm-kpi\" style=\"cursor:pointer\" title=\"'+T('Clic para ver las fichas')+'\" onclick=\"crmFiltro(\'estado\',\'factura\')\">📄 <b>'+NFACT+'</b> '+T('facturas en juego')+'</span>'):'')+'</div>'
   +mhoy
   +'<div style="background:#fff;border:1px solid #E4E1F5;border-radius:10px;padding:10px 12px;margin-bottom:8px">'
   +'<b style="font-size:13px">'+T('Alta rápida')+'</b>'
   +'<input id="crmNomN" class="crm-inp" placeholder="'+T('Nombre o empresa (p. ej. Bar La Mareta)')+'" aria-label="'+T('Nombre del cliente')+'">'
   +'<input id="crmTelN" class="crm-inp" placeholder="'+T('☎ Teléfono (opcional)')+'" aria-label="'+T('Teléfono')+'">'
   +'<button type="button" class="crm-btn" onclick="crmAlta()">＋ '+T('Añadir cliente')+'</button>'
   +'<button type="button" class="crm-btn sec" onclick="crmCsv()">⬇ '+T('Exportar CSV')+'</button></div>'
   +'<div>'+chips+' <input id="crmQ" class="crm-inp" style="display:inline-block;width:min(220px,60%)" placeholder="🔍 '+T('Buscar nombre, teléfono, sector…')+'" oninput="crmFiltro(\'q\',this.value)" value="'+xh(CRM_FILTRO.q)+'"></div>'
   +'<div id="crmLista">'
   +(lista.length?lista.map(function(n){ return crmFila(n,crmNorm(o[n])); }).join(''):'<div class="cfb-nota" style="padding:10px 2px">'+T('Sin fichas que mostrar — añada la primera o guarde una 📝 nota rápida tras la próxima llamada.')+'</div>')
   +'</div>';
};
function encURI(s){ return encodeURIComponent(s).replace(/'/g,'%27'); }
function crmFila(nombre,f){
  var d=crmDef(f.estado), e=encURI(nombre), notas=(f.notas||[]).length;
  var prox=f.prox&&f.prox.f?('📅 '+f.prox.f+(f.prox.h?' '+f.prox.h:'')+(f.prox.accion?' · '+f.prox.accion:'')):'';
  var meta=[f.tel?('☎'+f.tel):'',f.sector,f.ciudad,f.factura?(f.factura+' €'):'',CRM_DOLOR[f.dolor]&&f.dolor?CRM_DOLOR[f.dolor]:''].filter(Boolean).join(' · ');
  return '<details class="crm-fila" style="display:block" id="crmD_'+e.replace(/%/g,'_')+'">'
   +'<summary style="cursor:pointer;display:flex;gap:8px;align-items:center;list-style:none">'
   +'<span class="crm-badge" style="background:'+d[2]+'">'+d[1]+'</span>'
   +'<span class="crm-f"><span class="crm-n">'+xh(nombre)+'</span><div class="crm-m">'+xh(meta)+(prox?(' · '+xh(prox)):'')+'</div></span>'
   +'<span class="crm-mini">'+notas+'✎</span></summary>'
   +'<div style="border-top:1px dashed #eee;margin-top:6px;padding-top:6px">'
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px">'
   +'<input class="crm-inp" id="crmT_'+e+'" placeholder="☎ Teléfono" value="'+xh(f.tel)+'">'
   +'<input class="crm-inp" id="crmS_'+e+'" placeholder="Sector" value="'+xh(f.sector)+'">'
   +'<input class="crm-inp" id="crmC_'+e+'" placeholder="Ciudad" value="'+xh(f.ciudad)+'">'
   +'<input class="crm-inp" id="crmCo_'+e+'" placeholder="Compañía actual" value="'+xh(f.comercializadora)+'">'
   +'<input class="crm-inp" id="crmFa_'+e+'" placeholder="Factura mensual (€)" value="'+xh(f.factura)+'">'
   +'<select class="crm-inp" id="crmDo_'+e+'">'+Object.keys(CRM_DOLOR).map(function(k){ return '<option value="'+k+'"'+(f.dolor===k?' selected':'')+'>Dolor: '+CRM_DOLOR[k]+'</option>'; }).join('')+'</select>'
   +'</div>'
   +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px">'
   +'<span class="crm-mini">Estado:</span><select class="crm-inp" style="width:auto;display:inline-block" id="crmE_'+e+'">'+CRM_ESTADOS.map(function(x){ return '<option value="'+x[0]+'"'+(f.estado===x[0]?' selected':'')+'>'+x[1]+'</option>'; }).join('')+'</select>'
   +'<span class="crm-mini">Próx.:</span><input type="date" class="crm-inp" style="width:auto;display:inline-block" id="crmPf" value="'+xh(f.prox.f)+'"><input type="time" class="crm-inp" style="width:auto;display:inline-block" id="crmPh" value="'+xh(f.prox.h)+'"><input class="crm-inp" style="width:150px;display:inline-block" id="crmPa" placeholder="¿Qué toca? (revisar factura…)" value="'+xh(f.prox.accion)+'">'
   +'</div>'
   +'<div>'
   +'<button type="button" class="crm-btn" onclick="crmGuardar(decodeURIComponent(\''+e+'\'))">💾 Guardar</button>'
   +'<button type="button" class="crm-btn" style="background:#007A3B" onclick="cliPrepLlamadaSafe(decodeURIComponent(\''+e+'\'))">📞 Preparar llamada</button>'
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
  var o=cliLeer(), filas=[['nombre','telefono','sector','ciudad','comercializadora','factura_eur','dolor','estado','prox_fecha','prox_hora','prox_accion','notas','creado']];
  Object.keys(o).sort().forEach(function(n){ var f=crmNorm(o[n]);
    filas.push([n,f.tel,f.sector,f.ciudad,f.comercializadora,f.factura,f.dolor,f.estado,f.prox.f,f.prox.h,f.prox.accion,String((f.notas||[]).length),f.creado||''].map(function(c){ return '"' + String(c==null?'':c).replace(/"/g,'""') + '"'; }).join(','));
  });
  try{ var blob=new Blob(['\ufeff'+filas.join('\n')],{type:'text/csv;charset=utf-8'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='clientes-'+hoyLocal()+'.csv';
    document.body.appendChild(a); a.click(); setTimeout(function(){ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} },600);
  }catch(e){}
};
/* ⚙ menú ajustes + texto grande */
window.cfaAjToggle=function(){ var m=document.getElementById('cfaAjMenu'); if(m) m.classList.toggle('cfa-on'); };
window.cfaAjHide=function(){ var m=document.getElementById('cfaAjMenu'); if(m) m.classList.remove('cfa-on'); };
window.cfaTxtGreat=function(b){ var on=!document.body.classList.contains('cfb-txtgreat'); document.body.classList.toggle('cfb-txtgreat',on); try{ LSs('cfb_prefs',{txtgreat:on?1:0}); }catch(e){} if(b) b.textContent='🔡 Texto grande'+(on?' ✔':''); };
try{ var _p=LSg('cfb_prefs',{}); if(_p&&_p.txtgreat) document.body.classList.add('cfb-txtgreat'); }catch(e){}
try{ document.addEventListener('click',function(ev){ var w=document.getElementById('cfaAjWrap'); if(w&&!w.contains(ev.target)) window.cfaAjHide(); }); }catch(e){}
try{ if(typeof wraps==='function') wraps('guiActivarTab',function(id){ if(id==='tab-clientes') setTimeout(window.crmRenderTab,30); }); }catch(e){}
 window.cliAnadir=cliAnadir; window.cliBorrar=cliBorrar; window.cliBorrarNota=cliBorrarNota;
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
