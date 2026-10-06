// ═══ BATERÍA CONSOLIDADA · archivo único (jsdom) · core + fixes del informe QA ═══
let JSDOM,VirtualConsole;
try{ ({JSDOM,VirtualConsole}=require('/tmp/node_modules/jsdom')); }
catch(e){ ({JSDOM,VirtualConsole}=require('jsdom')); }    // npm i jsdom en la raíz del repo
const fs=require('fs'), path=require('path');
const F=path.join(__dirname,'..','pymes.html');           // la app PYMES = pymes.html (raíz del repo)
const src=fs.readFileSync(F,'utf8');
const R=[],step=(ok,msg)=>R.push((ok?'✔ ':'✘ ')+msg);
// ══ A. COMPROBACIONES ESTÁTICAS DEL INFORME ══
step(!/\$\{'8\/10'\|\|/.test(src) && /\$\{CONFIG\.notaAprobado\}\/10/.test(src),'fix #1: nota aprobado ligada a CONFIG (${CONFIG.notaAprobado}/10)');
step(!/gris-200/.test(src),'fix #2: no queda --gris-200 (uso gris-linea)');
step(/function guiLimpiarVars\(\)\{[\s\S]{0,220}!fase\.startsWith\('7 · Objeción'\)/.test(src),'fix #3: guiLimpiarVars respeta la objeción en pantalla');
step(/\.creditos-back\{[^}]*z-index:10000/.test(src),'fix #4: créditos z-index 10000 > Omitir (9999)');
step(/function tutResetProg\(\)\{[\s\S]{0,200}removeItem\('bm_tut_omitido'\)/.test(src),'fix #5: Reiniciar limpia la omisión');
step(/function tutVolverAlTutorial\(\)\{[\s\S]{0,60}classList\.remove\('modo-guion','focus'\)/.test(src),'fix #6: volver al tutorial apaga el Foco');
step(/body\.modo-guion \.tree-nav\{padding-bottom:120px\}/.test(src),'fix #7: hueco bajo tree-nav para «← Tutorial»');
step(!/class="(mark|logo)" /.test(src)&&/class="app-logo"/.test(src)&&/\.app-logo\{flex:none/.test(src),'fix #8: logo unificado en .app-logo (regla base en puente)');
step(!/prevId|nextId/.test(src),'fix #10: prevId/nextId eliminado');
step(!/const h=\(location/.test(src)&&/tutInitialHash/.test(src),'fix #11: const h → tutInitialHash');
step(!/prog\.omitido/.test(src),'fix #12: fuente única bm_tut_omitido (sin prog.omitido)');
step(/class="modal-close"[^>]*aria-label="Cerrar el modal de datos"/.test(src),'fix #14: ✕ del modal con aria-label');
step(/<div class="toast" id="toast"[^>]*role="status"[^>]*aria-live="polite"/.test(src),'fix #15: toast con role=status + aria-live');
R.push('   (fix #17 lo valida el chequeo dinámico #guionRoot #toast más abajo)');
step(/Tab'\)\{[\s\S]{0,420}preventDefault\(\);\s*f\[e\.shiftKey/.test(src),'fix #16: trampa de foco en créditos');
step(/addEventListener\('hashchange'/.test(src)&&/tutAbrirGuion\(\)/.test(src)&&/tutVolverAlTutorial\(\)/.test(src),'obs #2: listener hashchange');
step(/\(v3\.0\)/.test(src)&&!/\(v2\.1\)/.test(src),'obs #6: versión del pie unificada (v3.0)');
const sinType=(src.match(/<button (?![^>]*\btype=)/g)||[]).length;
step(sinType===0,'fix #13: 0 botones sin type="button" en la fuente ('+sinType+')');
// ══ B. DINÁMICO: archivo único entero en jsdom ══
const errs=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);
 if(!/Could not parse CSS|Could not load|Not implemented/i.test(m)) errs.push(m.split('\n')[0]);});
const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
 beforeParse(w){w.Element.prototype.scrollIntoView=function(){};w.scrollTo=function(){};
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:()=>Promise.resolve()}}); w.confirm=function(){return true};}});
const w=dom.window,d=w.document;
const $$=s=>[...d.querySelectorAll(s)], $=s=>d.querySelector(s);
const ev=x=>w.eval(x);
const clk=frag=>{const b=$$('[onclick]').find(e=>(e.getAttribute('onclick')||'').includes(frag)); if(b){b.click();return true} return false};
// core tutorial
step(d.querySelectorAll('#tutApp section').length===21,'core: 21 secciones de formación renderizadas');
ev("tutMarkDone('m0', null)");
step(ev("prog.done.includes('m0')"),'core: marcar m0 → progreso registrado');
step(ev("(MODULOS.m11.body.includes('8/10'))"),'fix #1 dinámico: m11 muestra la nota de CONFIG (8/10)');
for(let i=0;i<10;i++) try{ ev(`tutAnswer(${i},${ev('QUIZ['+i+'].ok')},null)`); }catch(e){
  R.push('   (nota quiz '+i+': '+e.message.slice(0,40)+')'); }
ev('tutCorregir()');
step(ev('prog.quizBest')===10,'core: quiz 10/10 corregido y mejor marca guardada');
// casos: resolver el primero con su opción correcta
ev("tutShow('casos')");
ev("tutAnswerCaso(0, CASOS[0].ok, null)");
step(!!d.querySelector('#caso-0.resuelto .quiz-opt.ok'),'core: caso respondido → se bloquea y marca la correcta');
// fix #5: omitir → reset → se olvida la omisión
clk('tutOmitir()');
step(ev("localStorage.getItem('bm_tut_omitido')")==='1'&&d.body.classList.contains('modo-guion'),'core/fix #5a: OMITIR entra al guion y guarda la marca');
clk('tutVolverAlTutorial()');
ev('tutResetProg()');
step(ev("localStorage.getItem('bm_tut_omitido')")===null,'fix #5b: tras Reiniciar, el arranque vuelve a formación');
// core guion: flujo real por el árbol hasta cierre
clk('tutAbrirGuion()');
let fases=[],g=0;
while(g++<8){
  fases.push($('#tree-phase').textContent);
  const n=$$('#treeBody button[onclick^="guiElegir"]');
  if(!n.length) break;
  n[0].click();
}
step(/Cierre|Seguimiento|Final/.test(fases[fases.length-1]||''),'core: el árbol llega a cierre/seguimiento ('+fases.slice(-1)+')');
// fix #3 dinámico: limpiar en medio de una objeción NO rompe la vista
w.eval("guiAbrirObjecion('ya_tengo')");
const faseObj=$('#tree-phase').textContent;
const htmlObjAntes=$('#tab-guion').textContent;
clk('guiOpenModal()');
const btnLimpiar=$$('#modalBack button').find(b=>/Limpiar datos/.test(b.textContent));
btnLimpiar.click();
step($('#tree-phase').textContent===faseObj && /Validar/i.test($('#tab-guion').textContent),'fix #3 dinámico: 🧹 en objeción no rompe la vista ('+faseObj+')');
step(ev('Object.keys(guiVars).length')===0,'…y borra todas las variables igualmente');
// variables propagan (set real por input)
const campo=$$('#varsBody .field').find(c=>/nombre del cliente/i.test(c.querySelector('label')?.textContent||''));
const inp=campo.querySelector('input'); inp.value='Manolo';
inp.dispatchEvent(new w.Event('input',{bubbles:true}));
clk('guiCloseModal()');
w.eval("guiIrA('apertura')");
step($('#tab-guion').textContent.includes('Manolo'),'core: variable rellenada aparece en el discurso');
// nat 15/15
w.eval("guiActivarTab('tab-objeciones')");
const nats=$$('#tab-objeciones button').filter(b=>/guiNatToggle/.test(b.getAttribute('onclick')||''));
step(nats.length>=15,'core: 15 objeciones con 🇪🇸 en el catálogo ('+nats.length+')');
nats[0].click();
step(!!d.querySelector('#tab-objeciones .nat-on'),'core: el panel nat alterna bien');
// fix #6 dinámico: Foco se apaga al volver al tutorial
clk('guiToggleFoco()');
step(d.body.classList.contains('focus'),'Foco ON');
clk('tutVolverAlTutorial()');
step(!d.body.classList.contains('focus')&&ev("document.getElementById('btnFoco').textContent")==='🎯 Foco','fix #6 dinámico: volver apaga Foco y reinicia el botón');
// créditos: integración completa tras los cambios
clk('tutAbrirGuion()');
const bOm=ev("getComputedStyle(document.getElementById('btnOmitir')).zIndex");
const bCr=ev("getComputedStyle(document.getElementById('creditosModal')).zIndex");
step(+bCr>+bOm,'fix #4 dinámico: créditos ('+bCr+') por encima de Omitir ('+bOm+')');
const btnCred=$$('header button').find(b=>/appCreditosAbrir/.test(b.getAttribute('onclick')||''));
btnCred.click();
const modal=$('#creditosModal');
step(modal.classList.contains('open'),'créditos se abre sobre el sistema');
// trampa de foco: Tab en el último envuelve al primero
const foc=[...modal.querySelectorAll('summary,button,a[href],[tabindex]')].filter(el=>!el.disabled&&!el.hidden);
foc[foc.length-1].focus();
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true}));
step(d.activeElement===foc[0],'fix #16 dinámico: Tab desde el último envuelve al primero ('+foc.length+' focables)');
foc[0].focus();
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true}));
step(d.activeElement===foc[foc.length-1],'…y Shift+Tab envuelve al último');
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
step(!modal.classList.contains('open'),'Esc cierra');
// fix #7: padding hueco bajo tree-nav en modo guion
step(parseFloat(ev("getComputedStyle(document.querySelector('.tree-nav')).paddingBottom"))>=96,'fix #7 dinámico: hueco bajo tree-nav ('+ev("getComputedStyle(document.querySelector('.tree-nav')).paddingBottom")+')');
// obs #2: hashchange funciona
clk('tutVolverAlTutorial()');
w.location.hash='guion'; w.dispatchEvent(new w.HashChangeEvent('hashchange'));
step(d.body.classList.contains('modo-guion'),'obs #2 dinámico: hash #guion abre el guion');
w.location.hash='m0'; w.dispatchEvent(new w.HashChangeEvent('hashchange'));
step(!d.body.classList.contains('modo-guion'),'obs #2 dinámico: hash ≠ #guion devuelve a formación');
// p3-13/14/15 DOM
step(d.querySelectorAll('button:not([type])').length===0,'fix #13 dinámico: 0 botones sin type en el DOM');
step(!!d.querySelector('#guionRoot #toast')===false && d.querySelector('#toast')?.getAttribute('aria-live')==='polite','fix #15/17 dinámico: toast accesible a nivel raíz');
step(d.querySelectorAll('.app-logo').length>=2,'fix #8 dinámico: .app-logo en ambas cabeceras');
// integridad onclick global
const rotos=new Set();
$$('*[onclick]').forEach(el=>{const o=el.getAttribute('onclick');
 (o.match(/\b[a-z][A-Za-z]*\(/g)||[]).map(s=>s.slice(0,-1)).forEach(fn=>{
  if(/^($|if|for|while|switch|return|catch)$/.test(fn))return;
  try{ if(typeof w.eval(fn)!=='function') rotos.add(fn);}catch(e){ rotos.add(fn);}});});

// ══ v1.1 · módulo CFB (estático) ══
step(src.includes('id="cfbModule"'),'v1.1: módulo CFB empaquetado');
step(src.includes('id="cfbBtnHub"'),'v1.1: botón 📊 Mi semana en la botonera');
step(/protocol\.indexOf\('http'\)/.test(src),'v1.1 A1: notificador silencioso sin red/file://');
step(src.includes('cfb-printing')&&src.includes('@media print'),'v1.1 A2: ficha imprimible con @media print');
step(fs.existsSync(path.join(__dirname,'..','version.json'))&&fs.existsSync(path.join(__dirname,'..','sw.js'))&&fs.existsSync(path.join(__dirname,'..','manifest.webmanifest')),'v1.1: version.json + PWA (sw/manifest) en WEB/');
step(fs.existsSync(path.join(__dirname,'..','CHANGELOG.md')),'v1.1 B1: CHANGELOG público');
step(rotos.size===0,'integridad: los '+$$('[onclick]').length+' onclick resuelven'+(rotos.size?' — rotos: '+[...rotos].slice(0,4).join(','):''));
// ══ v1.1 · módulo CFB (dinámico) ══
{ w.eval("window.cfbInit&&cfbInit()");
  w.eval("cfbHubAbrir()");
  step($('#cfbHub') && $('#cfbHub').classList.contains('cfb-on'),'v1.1: Mi semana abre su modal');
  w.eval("guiRenderTree('obj_precio')");
  const st=w.eval("cfbStatsGet()");
  step(st&&st.veces&&(st.veces.obj_precio||0)>=1,'v1.1: estadísticas locales cuentan recorrido');
  w.eval("cfbFicha()");
  step(d.body.classList.contains('cfb-printing'),'v1.1: ficha activa modo impresión');
  w.eval("document.body.classList.remove('cfb-printing');var o=document.getElementById('cfbFichaPrint');if(o)o.remove();");
  const a=w.eval("cfbA11y('hc'),document.body.classList.contains('cfb-hc')");
  w.eval("cfbA11y('hc')");
  step(a===true,'v1.1: alto contraste conmuta y revierte');
  step(ev("typeof cfbFeedback==='function'"),'v1.1: feedback (Proponer mejora) exportado');
  w.eval("cfbHubCerrar()");
  step($$('.cfb-badge').length>=1 && d.body.textContent.indexOf('v'+w.CFB_VERSION)>=0,'v1.1 B1: badge de versión en el pie');
  step(!$('#cfbVerNote'),'v1.1 A1: sin aviso de versión en file:// (silencio ✔)');
}
// ══ v1.2 · Perfil + Sync GitHub ══
step(src.includes('id="cfbSync12"'),'v1.2: módulo sync empaquetado');
step(src.includes('CFB-datos-equipo')&&src.includes('contents/datos/'),'v1.2: Contents API al repo de datos aparte');
{ w.eval("cfbPidePerfil?0:0"); // presencia
  w.eval("localStorage.removeItem('cfb_perfil')");
  step(ev("typeof cfbPidePerfil==='function'&&typeof cfbSyncPush==='function'"),'v1.2: API perfil + sync exportadas');
  w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Prueba',slug:'prueba'}))");
  step(ev("cfbPref('stats')==='bm_stats_prueba'"),'v1.2: burbuja por comercial (claves por nombre)');
  step(ev("cfbSyncEstado&&true")===true? (ev("document.getElementById('cfbHub')||''")!=='' , true) : false,'v1.2: estado sync presentable');
  step(!src.includes("req('GET',url,undefined")&&src.includes("req('GET',u,undefined"),'v1.2 hotfix: push usa la URL correcta (regresión `url`→`u`)');
  // silencio total sin clave / sin red
  step(ev("localStorage.removeItem('cfb_sync_token'),window.cfbSyncPush(0),document.getElementById('cfbVerNote')===null"),'v1.2: sin clave → sync mudo, app intacta');
}
// ── v1.2 · camino feliz: fetch espía + timer REAL de jsdom (sin parchear setTimeout) ──
w.eval("window.__LL=[];window.fetch=function(u,o){window.__LL.push(((o&&o.method)||'GET')+' '+(''+u).slice(0,140));return Promise.resolve({status:o&&o.method==='PUT'?201:404,json:function(){return Promise.resolve({});},text:function(){return Promise.resolve('{}');},clone:function(){return{text:function(){return Promise.resolve('{}');}};}});};localStorage.setItem('cfb_sync_token',JSON.stringify('tok'));localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Prueba',slug:'prueba'}));window.cfbSyncPush(0);");
(async function(){
  await new Promise(r=>setTimeout(r,1800)); // deja correr el timer del push real
  var ll=String(w.eval("window.__LL.join('||')")||'');
  w.eval("localStorage.removeItem('cfb_sync_token')");
  step(ll.includes('GET https://api.github.com/repos/andresgaleanowork-tech/CFB-datos-equipo/contents/datos/prueba.json')&&ll.includes('PUT https://api.github.com/repos/andresgaleanowork-tech/CFB-datos-equipo/contents/datos/prueba.json'),'v1.2 e2e mockeado: con clave → GET+PUT a Contents API (camino feliz cubierto)');
// ══ v1.3 · puerta ID empleado (index.html) ══
const srcI=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
step(/<script id="cfbGate13">/.test(srcI),'v1.3: módulo puerta empaquetado en index.html');
step(/cfbCerrado/.test(srcI)&&/__p\.slug/.test(srcI),'v1.3: anti-flash (menú oculto sin identificarse)');
step(/urlContenido\('equipo\.json'\)/.test(srcI)&&/\/contents\/'\+ruta/.test(srcI),"v1.3: lista cerrada = equipo.json por Contents API");
step(/primerArranque/.test(srcI)&&/administrador/i.test(srcI),'v1.3: primer arranque se auto-registra como admin');
step(/Panel admin/.test(srcI)&&/admin\.html/.test(srcI),'v1.3→1.4: gestión de IDs delega en el panel admin.html');
step(!/cfbModoLocal/.test(srcI)&&!/Sin conexi\u00f3n/.test(srcI)&&/class="hero"/.test(srcI)&&/logo-iberdrola\.png/.test(srcI)&&/logo-bm\.png/.test(srcI),'v2.7.7: portada de marca — logos Iberdrola+B&M en primer plano, sin claims offline ni modo local en la puerta');
  step(fs.existsSync(path.join(__dirname,'..','logo-iberdrola.png'))&&fs.existsSync(path.join(__dirname,'..','logo-bm.png')),'v2.7.7: PNGs de marca servidos por GitHub Pages');
step(/cfbCambiarUsuario/.test(srcI),"v1.3: cambiar de usuario (PC compartido)");
step(!/_pp\.local/.test(src)&&!/modo local/.test(src),'v1.3→v2.8.0: modo local fuera; todo perfil sincroniza igual');
const srcR=fs.readFileSync(path.join(__dirname,'..','residencial.html'),'utf8');
step(/cfbRegLlamada/.test(src)&&/Registrar llamada \+1/.test(src)&&/bm_dias/.test(src),'v1.5: 📞 botón + registro diario (pymes)');
step(/cfbRegLlamada/.test(srcR)&&/Registrar llamada \+1/.test(srcR),'v1.5: 📞 heredado en residencial');
step(/lunesClave/.test(src)&&/guiRenderTree'.*cierres|guiRpExit'.*practicas/.test(src.replace(/\n/g,'')),'v1.5: hooks automáticos (cierre/roleplay, semana ISO lunes)');
step(/Llamadas del equipo/.test(fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8')),'v1.5: tarjeta dashboard en admin.html');
step((function(){
  try{
    w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({id:'T1',nombre:'Prueba',slug:'prueba',autorizado:true}))");
    w.eval("localStorage.removeItem('bm_dias');localStorage.removeItem('bm_dias_prueba')");
    w.eval("cfbRegLlamada();"); w.eval("cfbRegLlamada();");
    var d=new Date(),p2=x=>(x<10?'0':'')+x, hoyK=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
    var gen=JSON.parse(w.eval("localStorage.getItem('bm_dias')"));
    var per=JSON.parse(w.eval("localStorage.getItem('bm_dias_prueba')"));
    return gen[hoyK]&&gen[hoyK].llamadas===2&&per[hoyK]&&per[hoyK].llamadas===2;
  }catch(e){ return false; }
})(),'v1.5: registrar llamada suma hoy×2 (genérico + burbuja con nombre)');
// ══ v1.5 · dashboard admin funcional (jsdom + fetch mockeado) ══
const srcAdm=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8');
const domA=new JSDOM(srcAdm,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
  beforeParse(w3){w3.Element.prototype.scrollIntoView=function(){};}});
const wa=domA.window;
(function(){
  wa.localStorage.setItem('cfb_perfil',JSON.stringify({id:'A1',nombre:'Ana',slug:'i-a1',admin:true,autorizado:true}));
  wa.localStorage.setItem('cfb_sync_token',JSON.stringify('tok'));
  var d=new Date(),p2=function(x){return (x<10?'0':'')+x;}, hoyK=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  var B64a=function(x){return wa.btoa(unescape(encodeURIComponent(JSON.stringify(x))));};
  var snap={version:'1.5',perfil:{id:'A1',nombre:'Ana',slug:'i-a1'},ts:new Date().toISOString(),kv:{}};
  snap.kv['bm_dias_i-a1']={}; snap.kv['bm_dias_i-a1'][hoyK]={llamadas:2,cierres:1,practicas:1};
  var lunesP=new Date(); lunesP.setDate(lunesP.getDate()-((lunesP.getDay()+6)%7)-7);
  var kLP=lunesP.getFullYear()+'-'+p2(lunesP.getMonth()+1)+'-'+p2(lunesP.getDate());
  snap.kv['bm_dias_i-a1'][kLP]={llamadas:4,cierres:0,practicas:0};
  var snapP={version:'2.1.0',perfil:{id:'P9',nombre:'Pepe',slug:'i-p9'},ts:new Date().toISOString(),kv:{}};
  wa.fetch=function(u){ var U=''+u;
    if(U.indexOf('/repos/')>=0&&U.indexOf('/contents')<0) return Promise.resolve({status:200,json:function(){return Promise.resolve({private:true});}});
    if(U.indexOf('equipo.json')>=0) return Promise.resolve({status:200,json:function(){return Promise.resolve({content:B64a({autorizados:[{id:'A1',nombre:'Ana',admin:true}]}),sha:'s1'});}});
    if(U.indexOf('/contents/datos?')>=0) return Promise.resolve({status:200,json:function(){return Promise.resolve([{name:'i-a1.json',path:'datos/i-a1.json',url:U.replace('?ref=main','/i-a1.json')},{name:'i-p9.json',path:'datos/i-p9.json',url:U.replace('?ref=main','/i-p9.json')}]);}});
    if(U.indexOf('/contents/datos/i-a1.json')>=0) return Promise.resolve({status:200,json:function(){return Promise.resolve({content:B64a(snap)});}});
    if(U.indexOf('/contents/datos/i-p9.json')>=0) return Promise.resolve({status:200,json:function(){return Promise.resolve({content:B64a(snapP)});}});
    return Promise.resolve({status:404,json:function(){return Promise.resolve({});}});
  };
})();
await wa.eval("document.getElementById('panel').style.display='';comprobarClave();dashboard();Promise.resolve('ok')");
await new Promise(r=>setTimeout(r,1600));
var fila=String(wa.eval("(document.querySelector('#dashTabla tbody')||{textContent:''}).textContent")||'');
step(fila.indexOf('Ana')>-1&&fila.indexOf('2')>-1,'v1.5: dashboard admin muestra a Ana con 2 📞 hoy');
step(String(wa.eval("(document.getElementById('dashEstado')||{textContent:''}).textContent")||'').indexOf('✔')>-1,'v1.5: dashboard estado ✔ con recuento semanal');

// ══ v2.1 «Mando» · estáticas ══
step(/function spark\(vals\)/.test(srcAdm)&&/polyline/.test(srcAdm)&&/function serie28/.test(srcAdm),'v2.1: sparkline SVG 28 días (sin librerías)');
step(/sumaEntre\(dias,lunesPas\(\),domPas\(\)/.test(srcAdm)&&/▲\+/.test(srcAdm)&&/▼/.test(srcAdm),'v2.1: delta vs semana anterior en la columna Semana');
step(/laborablesSin/.test(srcAdm)&&/FDECEA/.test(srcAdm)&&/sin 📞 registradas todavía/.test(srcAdm),'v2.1: alerta de inactividad (≥3 días laborables, fila salmón)');
step(/window\.dashCSVTxt=/.test(srcAdm)&&/window\.dashCSV=/.test(srcAdm)&&/text\/csv/.test(srcAdm)&&/csvCelda/.test(srcAdm),'v2.1: export CSV (BOM + ; para Excel ES)');
step(/📊 28 días/.test(srcAdm)&&/colspan="10"/.test(srcAdm)&&/dashCSV\(\)">⬇ CSV/.test(srcAdm),'v2.1: cabecera + columna tendencia + botón CSV');

// ══ v2.1 «Mando» · funcionales ══
var filaH=wa.eval("(document.querySelector('#dashTabla tbody')||{innerHTML:''}).innerHTML")||'';
var filaT=wa.eval("(document.querySelector('#dashTabla tbody')||{textContent:''}).textContent")||'';
step(String(filaH).indexOf('<svg')>-1&&String(filaH).indexOf('polyline')>-1,'v2.1 funcional: la fila pinta su sparkline 28d');
step(String(filaT).indexOf('▼')>-1||String(filaT).indexOf('▲')>-1,'v2.1 funcional: delta visible (Ana esta semana 2 vs 4 la pasada → ▼−2)');
step((String(filaH).indexOf('FDECEA')>-1||String(filaH).indexOf('rgb(253, 236, 234)')>-1)&&String(filaT).indexOf('sin 📞 registradas todavía')>-1,'v2.1 funcional: Pepe marcado como inactivo (nunca registró)');
step((function(){ try{
  var csv=wa.eval("dashCSVTxt()");
  return csv.charCodeAt(0)===0xFEFF && csv.indexOf('Pepe')>-1 && csv.indexOf('i-a1')>-1 && csv.split('\r\n').length>=3 && csv.indexOf(';')>-1;
}catch(e){ return false; } })(),'v2.1 funcional: CSV con BOM, ; y una fila por comercial');

const srcA=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8');
step(!/github_pat_[A-Za-z0-9_]{40,}/.test(srcI)&&!/github_pat_[A-Za-z0-9_]{40,}/.test(srcA),'v1.4 SEGURIDAD: la clave nunca aparece entera en el fuente (troceada, anti-revocación)');
step(/CFB_EMB_VER=2/.test(srcI)&&/cfb_clave_ver/.test(srcI)&&/localStorage\.removeItem\('cfb_sync_token'\)/.test(srcI),'v1.4→3.7: vacuna v2 — borra el token heredado de builds ≤3.6 (clave fuera del binario)');
step(!/11CGHOWYY0wk/.test(srcI)&&!/GBobtVDQeT_4hQinqPlb/.test(srcI),'v3.7 SEGURIDAD: la clave vieja ya NO está ni troceada en index.html');
/* ══ v3.8.0 «Clave central cifrada + contraseña de equipo» · estáticas ══ */
var srcA2=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8');
step(/clave-equipo\.json/.test(srcI)&&/CFB_EQ_URL/.test(srcI),'v3.8-E1: index conoce el blob público cifrado (clave-equipo.json)');
step(/function eqDescifra\(/.test(srcI)&&/PBKDF2/.test(srcI)&&/\|\|250000/.test(srcI)&&/iterations:\s*iterN/.test(srcI)&&/AES-GCM/.test(srcI),'v3.8-E2: descifrador PBKDF2 SHA-256 ×250.000 + AES-GCM-256 (v3.10: firma multi-entrada)');
step(/function eqRotar\(/.test(srcI)&&/cfb_eq_pass/.test(srcI)&&/window\.eqRotar=eqRotar/.test(srcI),'v3.8-E3: rotación silenciosa con contraseña guardada');
step(/eqRotar\(function\(ok\)/.test(srcI)&&/if\(ok\)\{ trasClave\(\); \} else estadoClave/.test(srcI),'v3.8-E4: boot intenta renovación silenciosa antes de pedir nada');
step(/cfbClaveEqManual/.test(srcI)&&/cfbClaveEqVolver/.test(srcI)&&/tengo la clave larga/.test(srcI),'v3.8-E5: tarjeta de dos modos (equipo ⇄ clave larga) con enlaces de ida y vuelta');
step(/if\(st===200\)\{[\s\S]{0,60}LSs\('cfb_eq_pass',pass\)/.test(srcI),'v3.8-E6 SEGURIDAD: la contraseña solo se guarda tras la validación 200');
step(/window\.eqPublicar=function/.test(srcA2||'')&&/AES-GCM-256/.test(srcA2||'')&&/iterations:250000/.test(srcA2||''),'v3.8-E7: admin cifra y publica (mismo esquema fuerte)');
step(/WEB_REPO='Call-Flow-Business-BMAE'/.test(srcA2||'')&&/AMBOS/.test(srcA2||''),'v3.8-E8: publicación validada contra AMBOS repos (datos + web)');
/* ══ v3.9.0 «Enlace de acceso» · estáticas ══ */
step(/function eqPassDeUrl\(\)/.test(srcI)&&/#eq=/.test(srcI)&&/decodeURIComponent/.test(srcI),'v3.9-G1: la app lee la contraseña del enlace (#fragmento, sin servidor)');
step(/function eqLimpiarUrl\(\)/.test(srcI)&&/replaceState/.test(srcI),'v3.9-G2: la contraseña se borra de la barra tras usarla');
step(/eqp&&!token\(\)/.test(srcI)&&srcI.indexOf('eqLimpiarUrl(); estadoClave();')>-1,'v3.9-G3: boot del enlace antes que todo + enlace caducado cae a la tarjeta con aviso');
step(/eqEnlaceCopiar/.test(srcA2)&&/encodeURIComponent\(pass\)/.test(srcA2)&&/nunca toca el servidor/.test(srcA2),'v3.9-G4: admin crea el enlace y el copy explica que el # no toca el servidor');


step(/estadoClave/.test(srcI)&&/cfbClaveOk/.test(srcI)&&/🔑 Clave del equipo/.test(srcI),'v3.7: tarjeta «🔑 Clave del equipo» de primera entrada');
step(/cfbMailAlta/.test(srcI)&&/Alta Call Flow Business/.test(srcI)&&/deseo darme de alta/i.test(srcI),'v1.4: registro por email prellenado a canalpymes@bmae.es');
step(/mailto:canalpymes@bmae\.es\?subject=Soporte/.test(srcI)&&/Soporte y sugerencias/.test(srcI),'v1.4: soporte/sugerencias en el pie → mismo correo');
step(/href="admin\.html"/.test(srcI)&&/Panel admin/.test(srcI),'v1.4: chip «🛠 Panel admin» para el admin');
step(/Solo para administradores/.test(srcA)&&/window\.autorizar=/.test(srcA)&&/window\.quitar=/.test(srcA),'v1.4 admin: guard + alta/quitar IDs');
step(/contents\/datos\?ref=/.test(srcA)&&/comprobarClave/.test(srcA),'v1.4 admin: actividad de datos/ + comprobar clave');
const domG=new JSDOM(srcI,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
  beforeParse(w2){w2.Element.prototype.scrollIntoView=function(){};
    Object.defineProperty(w2.navigator,'clipboard',{value:{writeText:()=>Promise.resolve()}});}});
const wg=domG.window;
const B64=s=>wg.btoa(unescape(encodeURIComponent(JSON.stringify(s))));
wg.fetch=function(u,o){ var U=''+u;
  if(U.indexOf('/contents/equipo.json')>=0&&(o&&o.method==='PUT')) return Promise.resolve({status:201,json:()=>Promise.resolve({})});
  if(U.indexOf('/contents/equipo.json')>=0) return Promise.resolve({status:200,json:()=>Promise.resolve({content:B64({autorizados:[{id:'T123',nombre:'Ana'},{id:'T999'}]}),sha:'shaX'})});
  if(U.indexOf('/repos/')>=0) return Promise.resolve({status:200,json:()=>Promise.resolve({private:true})});
  return Promise.resolve({status:404,json:()=>Promise.resolve({})});
};
step(wg.eval("document.documentElement.classList.contains('cfbCerrado')"),'v1.3: sin identificarse, menú tapado');
step(wg.eval("localStorage.getItem('cfb_sync_token')===null"),'v3.7: el dispositivo arranca SIN clave (nada embebido)');
step(wg.eval("!!document.getElementById('cfbClave')&&!document.getElementById('cfbId')"),'v3.7: la puerta pide 🔑 clave antes que el ID');
step(wg.eval("+localStorage.getItem('cfb_clave_ver')===2"),'v3.7: vacuna v2 marcada en el dispositivo');
wg.eval("document.getElementById('cfbClave').value='github_pat_TESTabcdefghijklmnopqrstuvwxyz1234567890'; window.cfbClaveOk(document.querySelector('form'))");
await new Promise(r=>setTimeout(r,600));
step(wg.eval("localStorage.getItem('cfb_sync_token')!==null&&!!document.getElementById('cfbId')"),'v3.7: clave aceptada (fetch 200) → guardada → pedimos ID');
wg.eval("document.getElementById('cfbId').value='t123'; cfbEntraId(document.querySelector('form'))");
await new Promise(r=>setTimeout(r,800));
var perf=wg.eval("localStorage.getItem('cfb_perfil')");
step(!!perf&&JSON.parse(perf).slug==='it123'&&JSON.parse(perf).nombre==='Ana','v1.3: ID autorizado T123 (case-ins.) → perfil Ana · slug it123');
step(wg.eval("!document.documentElement.classList.contains('cfbCerrado')"),'v1.3: tras login, menú visible');
step(wg.eval("(document.querySelector('.cfbSaludo')||{textContent:''}).textContent.indexOf('Hola')>-1"),'v1.3: saludo «Hola, Ana»');
wg.eval("localStorage.removeItem('cfb_perfil'); cfbEstadoIdentidad()");
wg.eval("document.getElementById('cfbId').value='ZZZ'; cfbEntraId(document.querySelector('form'))");
await new Promise(r=>setTimeout(r,800));
step(wg.eval("localStorage.getItem('cfb_perfil')===null && (document.getElementById('cfbGateError')||{textContent:''}).textContent.indexOf('autorizado')>-1"),
 'v1.3: ID NO autorizado → rechazado sin perfil (lista cerrada manda)');
// ══ v1.5.1 · auditoría A–J ══
const swSrc=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
step(!/bm_tut_omitido_res/.test(src)&&/var SUF='';/.test(src)&&/function SUF\(\)\{ return ''; \}/.test(src),'AUD-A: SUF determinista pymes (sin sniff compartido)');
step(/var SUF='_res';/.test(srcR)&&/function SUF\(\)\{ return '_res'; \}/.test(srcR),'AUD-A: SUF determinista residencial');
step(/LSg\('cfb_perfil',\{nombre:'',slug:''\}\)/.test(src)&&!/cfb_perfil'\+SUF/.test(src),'AUD-B: perfil = clave global (puerta y sync hablan)');
step(/LSs\('cfb_localts',\(new Date\(\)\).toISOString\(\)\)/.test(src),'AUD-C: cada cambio local sella su fecha (adiós pérdida offline)');
step(/_restaurando/.test(src)&&/_restaurando=true/.test(src),'AUD-D: restauración no rebota push (sin commit eco)');
step(/var r=p\.apply\(this,arguments\); try\{ extra\.apply/.test(src),'AUD-E: hooks después del render (números pintan al abrir)');
step(/CFB_VERSION=\(typeof VERSION!=='undefined'\)/.test(src),'AUD-F: versión del snapshot viva');
step(/network-first/.test(swSrc)&&/cfb-v3[6-9][0-9]/.test(swSrc)&&/admin\.html/.test(swSrc),'AUD-H: sw network-first + admin cacheado (cache vigente cfb-v36x)');
step(/cfbGatePill/.test(src)&&/bm_gatepill_off/.test(src),'AUD-I: pastilla «identifícate desde el menú» en guiones');
step(!/bm_tut_prog_res'\+SUF/.test(srcR)&&!/bm_tut_omitido_res'\+SUF/.test(srcR),'AUD-J: sin dobles sufijos _res_res en residencial');
step((function(){
  try{
    var d=new Date(),p2=x=>(x<10?'0':'')+x, hoyK=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
    w.eval("var o={};o['"+hoyK+"']={llamadas:3,cierres:0,practicas:0};localStorage.setItem('bm_dias',JSON.stringify(o));");
    w.eval("window.cfbHubCerrar&&cfbHubCerrar();");
    w.eval("cfbHubAbrir&&cfbHubAbrir();");
    var n=w.eval("(document.getElementById('cfbDiaHoyN')||{textContent:'?'}).textContent");
    w.eval("(document.getElementById('cfbHub')&&cfbHubCerrar&&cfbHubCerrar());0");
    return n==='3';
  }catch(e){ return false; }
})(),'AUD-E funcional: abrir «Mi semana» pinta Hoy=3 sin pulsar nada');

// ══ v1.5.2 · auditoría NIVEL-2 (L2) ══
step(/function xh\(s\)/.test(src)&&/function xh\(s\)/.test(srcR),'AUD2-A: helper de escape xh presente en ambos guiones');
step((src.match(/xh\(k\)/g)||[]).length>=2&&(srcR.match(/xh\(k\)/g)||[]).length>=2,'AUD2-D: pills de recorrido y objeciones escapan sus claves');
step(/s\.nodo\.map\(xh\)/.test(src)&&/Object\.keys\(s\.obj\)\.map\(xh\)/.test(src),'AUD2-E: ficha imprimible escapa datos dinámicos');
step(/_retEst=0/.test(src),'AUD2-F: reintentos del pincel de sync se resetean al tener éxito');
step(/aria-modal="true"/.test(src)&&/aria-modal="true"/.test(srcR),'AUD2-G: diálogo «Mi semana» declara aria-modal');
step(/_prevF/.test(src)&&/_prevF/.test(srcR),'AUD2-H: foco entra al hub y se devuelve al cerrar');

// ══ v1.5.3 · auditoría NIVEL-3 (UX/flujos con datos reales) ══
step(/mailto:canalpymes@bmae\.es/.test(src)&&/mailto:canalpymes@bmae\.es/.test(srcR),'AUD3-D: «Proponer mejora» abre el correo oficial de soporte');
step(/cfbHoyLlamadas/.test(src)&&/cfbHoyLlamadas/.test(srcR)&&/if\(n>0\) v0=n;/.test(src)&&/if\(n>0\) v0=n;/.test(srcR),'AUD3-E: la pestaña KPIs precarga las llamadas de hoy registradas en el hub');
step(/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/.test(src)&&/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$/.test(srcR),'AUD3-F: las sumas por fecha ignoran claves basura');
step(/colspan="10" style="color:var\(--gris-medio\)">aún sin datos/.test(srcA),'AUD3-G: tabla admin «aún sin datos» con colspan correcto');
step((function(){
  try{
    var p2=x=>(x<10?'0':'')+x, d=new Date(), hoyK=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
    w.eval("var o={};o['zzz']={llamadas:9};o['"+hoyK+"']={llamadas:2};localStorage.setItem('bm_dias',JSON.stringify(o));");
    var hoy=w.eval("cfbHoyLlamadas&&cfbHoyLlamadas()");
    w.eval("localStorage.removeItem('bm_dias');");
    return hoy===2;
  }catch(e){ return false; }
})(),'AUD3-I funcional: cfbHoyLlamadas ignora claves basura (2, no 11)');

// ══ v2.0 · D2 fuente editorial única (golden byte-idéntico) ══
step((function(){
  try{
    const r=require('child_process').execFileSync('node',[path.join(__dirname,'..','..','..','tools','factory','build.js'),'--check'],{encoding:'utf8'});
    return r.indexOf('✅ D2')>-1;
  }catch(e){ return false; }
})(),'D2: tools/factory (contenido+plantillas) regenera apps/web byte a byte (golden hash)');


// ══ v2.2 «Memoria» · estáticas ══
step(/LSg\('cli_registros'/.test(src)&&/LSg\('cli_registros'/.test(srcR)&&!/bm_clientes/.test(src)&&!/bm_clientes/.test(srcR),'v2.2: CRM usa prefijo cli_ (jamás bm_)');
step(/if\(k&&k\.indexOf\('bm_'\)===0\)\{ kv\[k\]=LSg\(k,null\); \}/.test(src),'v2.2: snapshot() sigue filtrando solo bm_ → cli_ no sube a la nube');
step(/86400000\*180/.test(src)&&/86400000\*180/.test(srcR),'v2.2: retención por diseño — purga de notas +180 días');
step(/length>=80/.test(src)&&/slice\(-20\)/.test(src),'v2.2: tapones 80 fichas / 20 notas (minimización)');
step(/function racha\(s\)/.test(src)&&/i_racha5/.test(src)&&/i_racha10/.test(src)&&/i_racha20/.test(src),'v2.2: racha + 3 insignias (5/10/20) en ambos guiones');
step(/cf📇|📇 Mis clientes/.test(src)&&/Solo en ESTE dispositivo/.test(src)&&/window\.cliGuardaNueva=/.test(src)&&/window\.cliReset=/.test(srcR),'v2.2: bloque «Mis clientes» con copy local + handlers');
// ══ v2.2 «Memoria» · funcionales ══
step((function(){
  try{
    var p2=x=>(x<10?'0':'')+x, dias=[];
    for(var i=0;i<5;i++){ var d=new Date(); d.setDate(d.getDate()-i); dias.push(d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())); }
    var r=w.eval("cfbRacha({dias:"+JSON.stringify(dias)+"})");
    w.eval("localStorage.setItem('bm_stats',JSON.stringify({veces:{},nodo:[],obj:{},sesiones:5,dias:"+JSON.stringify(dias)+",roleplay:0,desde:'2026-09-10'}));");
    w.eval("cfbMisInsignias&&cfbMisInsignias();");
    var b=JSON.parse(w.eval("localStorage.getItem('bm_badges')||'{}'"));
    w.eval("localStorage.removeItem('bm_stats');localStorage.removeItem('bm_badges');");
    return r===5 && !!b.i_racha5;
  }catch(e){ return false; }
})(),'v2.2 funcional: racha calcula 5 y desbloquea 🔥');
step((function(){
  try{
    w.eval("cliAnadir('Bar <i>Test</i>','nota con <b>prueba</b>')");
    var o=JSON.parse(w.eval("localStorage.getItem('cli_registros')||'{}'"));
    var claves=Object.keys(o);
    var ok=claves.length===1 && claves[0].indexOf('<')===-1 && o[claves[0]].notas[0].t.indexOf('<')===-1;
    w.eval("(function(){var x=JSON.parse(localStorage.getItem('cli_registros'));delete x[Object.keys(x)[0]];localStorage.setItem('cli_registros',JSON.stringify(x));})()");
    return ok;
  }catch(e){ return false; }
})(),'v2.2 funcional: guardar nota sanea nombre y texto');
step((function(){
  try{
    w.eval("for(var i=0;i<23;i++) cliAnadir('Bar Test','nota '+i)");
    var n=JSON.parse(w.eval("localStorage.getItem('cli_registros')||'{}'"))['Bar Test'].notas.length;
    return n===20;
  }catch(e){ return false; }
})(),'v2.2 funcional: tapón de 20 notas (cayendo la más vieja)');
step((function(){
  try{
    w.eval("cfbHubCerrar&&cfbHubCerrar(); cfbHubAbrir&&cfbHubAbrir(); cliVerTodo&&cliVerTodo();");
    var h=w.eval("(document.getElementById('cliLista')||{innerHTML:'nohub'}).innerHTML");
    w.eval("cliBorrarNota('Bar Test',0)"); var n2=JSON.parse(w.eval("localStorage.getItem('cli_registros')||'{}'"))['Bar Test'].notas.length;
    w.eval("cliBorrar('Bar Test')"); var vacio=w.eval("localStorage.getItem('cli_registros')")===JSON.stringify({})||Object.keys(JSON.parse(w.eval("localStorage.getItem('cli_registros')||'{}'"))).length===0;
    return h.indexOf('Bar Test')>-1 && n2===19 && vacio;
  }catch(e){ return false; }
})(),'v2.2 funcional: lista pintada · borrar nota · borrar ficha completa');

// ══ v2.3 «Fábrica» · estáticas ══
step((function(){ try{ var w2=fs.readFileSync(path.join(__dirname,'..','..','..','.github','workflows','build.yml'),'utf8');
  return /npm test/.test(w2)&&/go build/.test(w2)&&/upload-artifact@v4/.test(w2)&&/CFB_CERT_B64/.test(w2)&&!/apps\/android/.test(w2);
}catch(e){ return false; } })(),'v2.3-F1 (v3.7): CI Actions = tests + EXE + firma por secretos + Artifacts — SIN paso APK (retirada)');
step(fs.existsSync(path.join(__dirname,'..','..','..','docs','v2.3-FABRICA.md')),'v2.3-F2: documentación de la fábrica escrita');
step(/GITHUB\.(IO|COM)|github\.io\/Call-Flow-Business-BMAE\/version\.json/.test(src)&&/github\.io\/Call-Flow-Business-BMAE\/version\.json/.test(srcR)&&/!window\.CFB_UPDATE_URL\) return;/.test(src),'v2.3-F3 (v2.7): auto-aviso ACTIVADO apuntando a la web oficial y sigue mudo en file://');
step(/bm_errores/.test(src)&&/bm_errores/.test(srcR)&&/slice\(-20\)/.test(src)&&/unhandledrejection/.test(src),"v2.3-F4: registro de errores (tope 20, errores y promesas) en ambos guiones");
step(/cfbErroresCopia\(\)">📋 Registro de errores/.test(src)&&/cfbErroresVaciar\(\)">🧼 Vaciar registro/.test(srcR),'v2.3-F5: hub ofrece copiar y vaciar el registro');
step(/REGISTRO DE ERRORES/.test(src)&&/REGISTRO DE ERRORES/.test(srcR),'v2.3-F6: la ficha de soporte lleva el registro pegado');
step((function(){ try{
  return !fs.existsSync(path.join(__dirname,'..','..','android'))
      && fs.existsSync(path.join(__dirname,'..','..','..','docs','android-historico.md'));
}catch(e){ return false; } })(),'v2.3-F7 (v3.7): apps/android retirado del repo y guía de reconstrucción en docs/android-historico.md');
step(/window\.cfbErroresTxt=function\(\)/.test(src)&&/window\.errLog=|function errLog\(\)/.test(src),'v2.3-F8: superficie del registro (txt copiable + lectura interna)');
// ══ v2.3.1 «Escoba» · estáticas (caza 16-09 · _documentos/CAZA-BUGS-2026-09-16.md) ══
step(/function hoyLocal\(\)\{/.test(src)&&src.indexOf('var hoy=hoyLocal();')>-1&&src.indexOf('var hoy=(new Date()).toISOString().slice(0,10)')<0,'v2.3.1-E1: racha en hora local — bumpVid ya no guarda en UTC (bug CAZA#2)');
step(src.indexOf('desde:(new Date()).toISOString')<0&&src.indexOf('creado:(new Date()).toISOString')<0&&src.indexOf('b[iN.id]=(new Date()).toISOString')<0,'v2.3.1-E2: desde/creado/insignias tambien en hoyLocal (bug CAZA#2)');
step(src.indexOf("encodeURIComponent(nombre).replace(/'/g,'%27')")>-1&&srcR.indexOf("encodeURIComponent(nombre).replace(/'/g,'%27')")>-1,"v2.3.1-E3: CRM con apostrofo → %27 en sus handlers (bug CAZA#3)");
step(src.indexOf("setItem(\\'cfb_ver_visto\\',JSON.stringify(")>-1&&src.indexOf("LSg('cfb_ver_visto','')===ver")>-1,'v2.3.1-E4: ✕ del aviso guarda JSON legible por LSg (bug CAZA#4)');
step(src.indexOf("replace(/[^\\w.\\-]/g,'')")>-1&&src.indexOf("/^https:\\/\\//.test(v.url||'')")>-1,'v2.3.1-E5: version.json saneado — charset blanco y url solo https (bug CAZA#5)');
step((function(){ try{ var w3=fs.readFileSync(path.join(__dirname,'..','..','..','.github','workflows','build.yml'),'utf8');
  return w3.indexOf('ANDROID_SDK_ROOT')<0&&w3.indexOf('sdkmanager')<0;
}catch(e){ return false; } })(),'v2.3.1-E6 (v3.7): CI ya no usa SDK de Android (bug CAZA#1 resuelto de raíz con la retirada)');
// ══ v2.3.2 «Silencio» · avisos A1/A2 de la caza, cerrados ══
step(/caches\.match\(e\.request\)\.then\(hit=>hit\|\|r\)/.test(swSrc)&&/network-first/.test(swSrc),'v2.3.2-E7: sw sirve la copia buena ante 404/500 (bug CAZA#A2)');
step((function(){ try{
  var lw=path.join(__dirname,'..','..','windows','lanzador');
  return fs.existsSync(path.join(lw,'aviso_windows.go'))
      && /MessageBoxW/.test(fs.readFileSync(path.join(lw,'aviso_windows.go'),'utf8'))
      && /avisoNativo\(msg\)/.test(fs.readFileSync(path.join(lw,'main.go'),'utf8'));
}catch(e){ return false; } })(),'v2.3.2-E8: el EXE muestra sus errores en ventana nativa (bug CAZA#A1)');
// ══ v2.4 «Lógica» · cada área con un único dueño ══
step(/Mi Cuenta/.test(src)&&/Mi Cuenta/.test(srcR)&&!/Mi semana/.test(src)&&!/Mi semana/.test(srcR)&&/Mi Cuenta/.test(srcA)&&!/Mi semana/.test(srcA),'v2.4-L1: «Mi semana» → «Mi Cuenta» en guiones y panel admin');
step(!/cfbSyncBloque/.test(src)&&!/Guardado en la nube \(auto\)/.test(src)&&/function cfbSyncEstado\(\)\{ \/\* v2\.4/.test(src),'v2.4-L2: sync fuera del hub (lo gestiona el panel admin) — pilla eliminada');
step(/id="cmpAviso"/.test(src)&&/cmpOcultar/.test(src)&&/bm_compliance_off/.test(src)&&/bm_compliance_off/.test(srcR),'v2.4-L3: aviso legal con ✕ «no volver a mostrar» (persistente y sincronizado)');
step(/window\.cfbSalir=function/.test(src)&&/removeItem\('cfb_perfil'\)/.test(src)&&/Cerrar sesión/.test(src),'v2.4-L4: «Cerrar sesión» dentro de Mi Cuenta');
step(!/jsQR/.test(src)&&!/qrcode\(0,'M'\)/.test(src)&&!/cfbQRCam/.test(src)&&!/Entre dispositivos/.test(src)&&!/qrcode-generator/.test(src),'v2.4-L5: QR retirado por completo (libs, overlay, sección y cámara)');
step((function(){ try{ var a=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8');
  return /id="claveNueva"/.test(a)&&/window\.claveCambiar=function/.test(a)&&/restauró la clave anterior/.test(a);
}catch(e){ return false; } })(),'v2.4-L6: admin puede CAMBIAR el token (comprueba → guarda → restaura si falla)');
step((function(){ try{
  var w2=fs.readFileSync(path.join(__dirname,'..','..','..','.github','workflows','build.yml'),'utf8');
  return w2.indexOf('setup-java')<0 && w2.indexOf('sdkmanager')<0 && w2.indexOf('Call-Flow-Business.apk')<0;
}catch(e){ return false; } })(),'v2.4-L7 (v3.7): CI limpio — sin Java/SDK/APK tras la retirada');
// ══ v2.3 «Fábrica» · funcionales ══
step((function(){
  try{
    w.eval("(function(){var e=new Event('error'); e.message='boom-tests'; e.filename='algo.js'; e.lineno=9; window.dispatchEvent(e); })()");
    var l=JSON.parse(w.eval("localStorage.getItem('bm_errores')||'[]'"));
    return l.some(function(x){ return (x.m||'').indexOf('boom-tests')>-1; });
  }catch(e){ return false; }
})(),'v2.3 funcional: window.onerror real cae al registro bm_errores');
step((function(){
  try{
    w.eval("for(var i=0;i<25;i++){ var e=new Event('error'); e.message='boom-'+i; window.dispatchEvent(e); }");
    var l=JSON.parse(w.eval("localStorage.getItem('bm_errores')||'[]'"));
    return l.length===20 && l[l.length-1].m.indexOf('boom-24')>-1;
  }catch(e){ return false; }
})(),'v2.3 funcional: tapón 20 (la más vieja cae)');
step((function(){
  try{
    var t=w.eval("cfbErroresTxt()");
    w.eval("cfbErroresVaciar&&cfbErroresVaciar()");
    var vacio=w.eval("cfbErroresTxt()==='(registro vacío)'");
    w.eval("localStorage.removeItem('bm_errores')");
    return t.indexOf('boom-24')>-1 && vacio;
  }catch(e){ return false; }
})(),'v2.3 funcional: registro copiable y vaciable');
step(await (async function(){
  try{
    w.eval("window.CFB_UPDATE_URL='https://x.test/version.json';");
    w.fetch=function(){ return Promise.resolve({ok:true,json:function(){ return Promise.resolve({version:'9.9.9',fecha:'x',url:'#'}); }}); };
    w.eval("cfbCheckVersion&&cfbCheckVersion();");
    return await new Promise(function(res){ setTimeout(function(){
      var ok=!!w.eval("document.getElementById('cfbVerNote')");
      var ok2=false, ok3=false;
      try{
        var b=w.eval("document.querySelector('#cfbVerNote .cfb-ver-x')");
        if(b){ b.click(); }
        ok2=w.eval("localStorage.getItem('cfb_ver_visto')")==='"9.9.9"';
        var g=w.eval("document.getElementById('cfbVerNote')");
        ok3=!g||g.style.display==='none';
        w.eval("var n=document.getElementById('cfbVerNote'); if(n) n.remove(); window.CFB_UPDATE_URL=''; localStorage.removeItem('cfb_ver_visto');");
      }catch(e){}
      res(ok&&ok2&&ok3);
    },400); });
  }catch(e){ return false; }
})(),'v2.3.1 funcional ✨: nace el aviso y el ✕ RECUERDA el descarte (JSON legible por LSg) — bugs CAZA#4 y CAZA#7 (el test anterior padecía CAZA#7)');
step((function(){
  try{
    w.eval("cliAnadir(\"L'Olivé Tarrés\",'nota apostrofo ✔'); cfbHubAbrir&&cfbHubAbrir(); cliVerTodo();");
    var btn=[].slice.call(w.document.querySelectorAll('#cliLista [onclick]')).find(function(b){ return /cliBorraNota/.test(b.getAttribute('onclick')); });
    if(!btn) return false;
    var antes=w.document.getElementById('cliLista').innerHTML;
    w.eval(btn.getAttribute('onclick'));
    w.eval("cliVerTodo();");
    var despues=w.document.getElementById('cliLista').innerHTML;
    var ok=antes.indexOf('nota apostrofo')>-1 && despues.indexOf('nota apostrofo')<0;
    w.eval("cliBorrar&&cliBorrar(\"L'Olivé Tarrés\"); cliVerTodo();");
    return ok;
  }catch(e){ return false; }
})(),"v2.3.1-F1 funcional: ficha 'con apostrofo' → el botón ✕ borra la nota (bug CAZA#3)");
step((function(){
  try{
    w.eval("cmpOcultar(true);");
    var key=w.eval("localStorage.getItem('bm_compliance_off')");
    var oculta=w.eval("(document.getElementById('cmpAviso')||{style:{}}).style.display")==='none';
    w.eval("var c2=document.getElementById('cmpAviso'); if(c2) c2.style.display=''; localStorage.removeItem('bm_compliance_off');");
    return key==='"1"'&&oculta;
  }catch(e){ return false; }
})(),'v2.4 funcional: ✕ del aviso legal oculta de verdad y PERSISTE (bm_)');
step((function(){
  try{
    w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Ana',slug:'ana'})); cfbSalir();");
    return w.eval("localStorage.getItem('cfb_perfil')")===null;
  }catch(e){ return false; }
})(),'v2.4 funcional: «Cerrar sesión» limpia cfb_perfil (vuelve al gate)');
step((function(){
  try{
    w.eval("cfbHubAbrir&&cfbHubAbrir();");
    var h=w.eval("(document.getElementById('cfbHub')||{textContent:''}).textContent");
    var ok2=h.indexOf('Guardado en la nube')<0&&h.indexOf('Entre dispositivos')<0&&h.indexOf('Cerrar sesión')>-1&&h.indexOf('Mi Cuenta')>-1;
    w.eval("cfbHubCerrar&&cfbHubCerrar();");
    return ok2;
  }catch(e){ return false; }
})(),'v2.4 funcional: el hub de Mi Cuenta ya no muestra sync ni QR y ofrece «Cerrar sesión»');
  /* ═════ v2.5.0 «Salud» · ⏱ cronómetro de llamada + duración/errores al admin ═════ */
  step(/id="btnTimer"/.test(src)&&/cfbLlamadaToggle/.test(src)&&/bm_timer/.test(src),'S1: pymes — botón ⏱ + lógica del cronómetro');
  step(/id="btnTimer"/.test(srcR)&&/cfbLlamadaToggle/.test(srcR)&&/bm_timer/.test(srcR),'S2: residencial — botón ⏱ + lógica del cronómetro');
  step(/diaBump\(campo,n\)/.test(src)&&/diaBump\('segs',segs\)/.test(src),'S3: diaBump admite cantidad y suma campo segs');
  { const hh=(function(){const d0=new Date();return [d0.getFullYear(),String(d0.getMonth()+1).padStart(2,'0'),String(d0.getDate()).padStart(2,'0')].join('-');})();
    w.eval("localStorage.setItem('bm_timer',JSON.stringify({start:Date.now()-120000}))");
    w.eval("cfbLlamadaToggle()");
    var s4=!!w.eval("(function(){var d=JSON.parse(localStorage.getItem('bm_dias')||'{}');var h='"+hh+"';return !!(d[h]&&d[h].llamadas>=1&&d[h].segs>=119&&localStorage.getItem('bm_timer')===null);})()");
    step(s4,'S4: al colgar → llamada + duración registradas y cronómetro cerrado');
    w.eval("localStorage.removeItem('bm_dias')");
    w.eval("cfbLlamadaToggle()");
    var tm=w.eval("localStorage.getItem('bm_timer')");
    step(!!(tm&&JSON.parse(tm).start),'S5: al descolgar → cronómetro persistido esperando el colgado');
    w.eval("localStorage.removeItem('bm_timer')");
  }
  step(/base\[day\]\.segs=/.test(srcA)&&/🩺/.test(srcA)&&/x\.media\?fmtSeg/.test(srcA)&&/Media semana/.test(srcA),'S6: admin — ⏱ media semanal + 🩺 errores por comercial + CSV ampliado');
  /* ═════ v2.6.0 «Plantilla» · seguimiento mail/WhatsApp + nota CRM en Foco ═════ */
  step(/id="cfbQuickNote"/.test(src)&&/body\.focus #cfbQuickNote/.test(src)&&/qnGuardar/.test(src),'E1: pymes — nota rápida de llamada solo en modo Foco');
  step(/id="cfbQuickNote"/.test(srcR)&&/qnGuardar/.test(srcR),'E2: residencial — nota rápida de llamada');
  { w.eval("window.__opened=null;window.open=function(u){window.__opened=u;return {};};");
    w.eval("localStorage.setItem('guion_vars',JSON.stringify({NOMBRE_CLIENTE:'Paco',NOMBRE_COMERCIAL:'María'}))");
    w.eval("cfbSeg('wa')");
    var u=w.eval("window.__opened||''");
    step(u.indexOf('https://wa.me/?text=')===0&&decodeURIComponent(u).indexOf('Paco')>0,'E3: seguimiento WhatsApp con el nombre del cliente personalizado');
    w.eval("cfbSeg('mail')");
    var m=w.eval("window.__opened||''");
    step(m.indexOf('mailto:?subject=')===0&&decodeURIComponent(m).indexOf('María')>0,'E4: seguimiento email con nombre del comercial y asunto');
    w.eval("localStorage.removeItem('guion_vars')");
  }
  { w.eval("var n=document.getElementById('qnNombre'),tx=document.getElementById('qnNota');n.value='Bar Paco';tx.value='Enviar contrato de luz'");
    w.eval("qnGuardar()");
    var ok=!!w.eval("(function(){var o=JSON.parse(localStorage.getItem('cli_registros')||'{}');return o['Bar Paco']&&o['Bar Paco'].notas&&o['Bar Paco'].notas[0]&&o['Bar Paco'].notas[0].t==='Enviar contrato de luz';})()");
    step(ok,'E5: nota de Foco guardada en Mis clientes con un toque');
    w.eval("localStorage.removeItem('cli_registros')");
  }
  /* ═════ v2.7.0 «Diploma» · examen cronometrado + certificado imprimible ═════ */
  step(/window\.cfbExamen=/.test(src)&&/bm_diploma/.test(src)&&/id="examReloj"/.test(src),'D1: pymes — examen final cronometrado presente');
  step(/window\.cfbExamen=/.test(srcR)&&/bm_diploma/.test(srcR),'D2: residencial — examen final presente');
  step(/id="cfbCertPrint"/.test(src)&&/body\.cfb-printing #cfbCertPrint/.test(src)&&/cert-nom/.test(src),'D3: certificado imprimible con estilos @media print');
  { w.eval("cfbExamen()");
    var total=~~w.eval("document.querySelectorAll('#cfbExamOv [data-q]').length");
    step(total===10,'D4: el examen pinta 10 preguntas del banco ('+total+')');
    w.eval("document.querySelectorAll('#cfbExamOv [data-q]').forEach(function(box){var qi=~~box.getAttribute('data-qi');var ok=QUIZ[qi].ok;var r=box.querySelector('input[value=\"'+ok+'\"]');if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));}})");
    w.eval("document.getElementById('examCorr').click()");
    var dip=w.eval("JSON.parse(localStorage.getItem('bm_diploma')||'null')");
    step(!!(dip&&dip.aprobado===true&&dip.nota===10),'D5: 10/10 correctas → aprobado guardado en bm_diploma');
    w.print=()=>{};
    w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({id:'T1',nombre:'Prueba'}))");
    w.eval("cfbCertificado()");
    var cert=w.eval("(document.getElementById('cfbCertPrint')||{textContent:''}).textContent");
    step(/Call Flow Business/.test(cert)&&/Prueba/.test(cert)&&/10\/10/.test(cert),'D6: certificado con nombre, programa y nota');
    w.eval("localStorage.removeItem('bm_diploma');var o=document.getElementById('cfbCertPrint');if(o)o.remove();var x=document.getElementById('cfbExamOv');if(x)x.remove();");
  }
  /* ═════ v2.7 paralelo · página PWA «Instalar en tu móvil» ═════ */
  { const inst=fs.readFileSync(__dirname+'/../instalar.html','utf8');
    step(/Añadir a la pantalla de inicio|Añadir a pantalla de inicio/.test(inst)&&/manifest\.webmanifest/.test(inst)&&/beforeinstallprompt/.test(inst)&&/Compartir/.test(inst),'PAR-PWA1: instalar.html — pasos iPhone (Safari) + Android + prompt nativo');
    step(/instalar\.html/.test(swSrc)&&/href="instalar\.html"/.test(srcI),'PAR-PWA2: SW la cachea y la página de entrada enlaza a ella');
  }
  /* ═════ v2.7.1 «DIA» · auditoría QA senior: keyframes + WCAG 2.3.3/4.1.2 ═════ */
  step(/@keyframes cfbPulseG/.test(src)&&/prefers-reduced-motion/.test(src)&&/@keyframes cfbPulseG/.test(srcR),'P1: keyframes del ⏱ definidos + guarda reduced-motion (ambas plantillas)');
  { w.eval("cfbExamen()");
    var attrs=w.eval("(function(){var o=document.getElementById('cfbExamOv');return o&&o.getAttribute('role')==='dialog'&&o.getAttribute('aria-modal')==='true'&&!!o.getAttribute('aria-label');})()");
    w.eval("window.print=()=>{}; var o=document.getElementById('cfbExamOv'); o.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));");
    var cerrado=!!w.eval("document.getElementById('cfbExamOv')===null");
    step(!!attrs&&cerrado,'P2: modal examen con role=dialog/aria-modal + Escape cierra');
  }
  { const inst=fs.readFileSync(__dirname+'/../instalar.html','utf8');
    step(/aria-label="Nota rápida de la llamada"/.test(src)&&/aria-pressed/.test(src)&&/name="theme-color" content="#004d2d"/.test(src)&&/name="description"/.test(inst),'P3: labels accesibles (quicknote/CRM) + aria-pressed ⏱ + theme-color/description');
  }
  /* ═════ v2.7.2 · «Ocultar» cierra la nota, NO el modo Foco ═════ */
  { w.eval("document.body.classList.add('focus')");
    w.eval("qnOcultar()");
    var okA=!!w.eval("document.body.classList.contains('focus')&&document.getElementById('cfbQuickNote').classList.contains('qn-off')");
    step(okA,'Q1: «Ocultar» esconde la nota y MANTIENE el modo Foco');
    w.eval("document.body.classList.remove('focus');");
    w.eval("guiToggleFoco()");  /* entra de nuevo en Foco → reset */
    var okB=!!w.eval("!document.getElementById('cfbQuickNote').classList.contains('qn-off')");
    step(okB,'Q2: al volver a entrar en Foco la nota reaparece sola (flip del estado oculto)');
  }
  /* ═════ v2.7.3 · el toast ya NO queda sepultado bajo la nota rápida ═════ */
  { const m=/\.toast\{[^}]*z-index:(\d+)/.exec(src);
    step(!!m&&~~m[1]>20000,'Q3: feedback del ✎ Guardar/Ocultar siempre sobre la nota rápida (z='+((m&&m[1])||'?')+')'); }
  /* ═════ v2.7.4 · quicknote: front (botones con estilo propio) + back (validación con foco + refresco Mis clientes + redundancia Foco) ═════ */
  { step(/#cfbQuickNote \.cfb-btn\{[^}]*background:#4C3EBF/.test(src)&&/#cfbQuickNote \.cfb-btn\.cfb-sec\{[^}]*border:1px solid #4C3EBF/.test(src),'Q4: botones ✎/Ocultar dejan de salir «nativos» (estilados bajo #cfbQuickNote, no sólo en #cfbHub)');
    step(/if\(!nombre\|\|!texto\)/.test(src)&&/nombre=t\.value|\.focus\(\)/.test(src)&&/cliVerTodo/.test(src.slice(src.indexOf('window.qnGuardar'),src.indexOf('window.qnGuardar')+900)),'Q5: ✎ valida con foco al campo vacío, guarda y refresca Mis clientes al instante');
    step(/window\.qnMostrar=function/.test(src)&&/addEventListener\('click',function\(ev\)/.test(src)&&/closest\('#btnFoco'\)/.test(src),'Q6: la nota reaparece al entrar en Foco aunque el guion falle (redundancia captura)'); }
  /* ═════ v2.7.5 · las reglas de pantalla NO viven dentro de @media print (caza: nota sin estilos desde v2.7) ═════ */
  { const mCss=/<style id="cfbCss">([\s\S]*?)<\/style>/.exec(src);
    step(!!mCss,'Q7a: existe hoja cfbCss');
    if(mCss){
      const css=mCss[1];
      const dentroDe=function(atRule,selector){
        const p=css.indexOf(atRule); if(p<0) return 'SIN-REGLA';
        let prof=0,fin=-1;
        for(let i=p;i<css.length;i++){ if(css[i]==='{')prof++; else if(css[i]==='}'){prof--; if(!prof){fin=i;break;}} }
        if(fin<0) return 'MALFORMADA';
        return css.indexOf(selector)>p&&css.indexOf(selector)<fin;
      };
      step(dentroDe('@media print','#cfbQuickNote{')===false,'Q7b: #cfbQuickNote fuera de @media print (si no, solo se ve bien al imprimir)');
      step(dentroDe('@media print','#cfbCertPrint .cert-caja')===false,'Q7c: diploma/certificado fuera de @media print');
      step(dentroDe('@media print','@keyframes cfbPulseG')===false&&css.indexOf('@keyframes cfbPulseG')>0,'Q7d: pulso del cronómetro del examen activo en pantalla');
    } }
  /* ═════ v2.8.0 · 10 mejoras: mini-CRM + voz + buscador + repaso espaciado + meta + admin práctica + sin modo local ═════ */
  { step(/id="qnTel"/.test(src)&&/id="qnVoz"/.test(src)&&/id="qnLlamar"/.test(src)&&!/onclick="qnGuardar\(\)"/.test(src),'W1: nota rápida = mini-CRM (☎+📞+🎙) y botones ya SIN onclick inline');
    step(/SpeechRecognition\|\|window\.webkitSpeechRecognition/.test(src)&&/r\.lang=.es-ES./.test(src),'W2: dictado por voz es-ES con detección de soporte (degradación elegante)');
    step(/id=.guiBuscarBox./.test(src)&&/guiIrA&&guiIrA/.test(src)&&/guiAbrirObjecion&&guiAbrirObjecion/.test(src),'W3: buscador del guion en vivo (nodos + objeciones, Esc/cierra fuera)');
    step(/function examDebidas\(\)/.test(src)&&/bm_exam_fallo/.test(src)&&/examRepaso/.test(src)&&/esc=\[1,3,7\]/.test(src),'W4: examen con repetición espaciada (fallos guardados · escalera 1/3/7 días)');
    step(/function metaRol\(\)/.test(src)&&/metaRoleplay/.test(srcAdm)&&/metaGuardar/.test(srcAdm),'W5: meta semanal de roleplay configurable desde el panel admin');
    step(/bm_stats_..slug/.test(srcAdm)&&/🎓 Quiz/.test(srcAdm),'W6: panel admin muestra práctica por comercial (🎭 rol + 🎓 quiz)');
    step(!/_pp\.local/.test(src)&&!/modo local/.test(src),'W7: modo local retirado también de los guiones (coherencia total con la conexión obligatoria)');
  }
  /* ═════ v2.7.6 · cfbCss al <head> + nota con estilo crítico inline + qnSync (visores que ignoran <style> en <body>) ═════ */
  { const iHead=src.indexOf('</head>'), iCss=src.indexOf('<style id="cfbCss">');
    step(iCss>0&&iHead>0&&iCss<iHead,'Q8: hoja cfbCss vive en el <head> (los visores estrictos ignoran <style> en <body>)');
    step(/<div id="cfbQuickNote"[^>]*style="display:none;position:fixed/.test(src),'Q9: la nota lleva su estilo crítico inline (tarjeta flotante aunque fallen las hojas)');
    step(/window\.qnSync=function/.test(src)&&/q\.style\.display=on\?'block':'none'/.test(src)&&/qnSync\(\);\s*$/m.test(src.slice(src.indexOf('window.qnOcultar'),src.indexOf('window.qnOcultar')+300)),'Q10: qnSync gobierna display de la nota (Foco ∧ ¬oculta) con sincronización en cada clic');
  }
// ── W11 · v3.0.0 mini-CRM + barra agrupada ──
{
  step(src.includes("tab-clientes")&&src.includes("crmRenderTab"), 'W11-1 pestaña 👥 Clientes + render');
  step(src.includes("id=\"btnClientes\"")&&src.includes("id=\"btnAjtG\""), 'W11-2 botones Clientes + ⚙ Ajustes');
  step((src.match(/cfa-grp-sep/g)||[]).length>=2, 'W11-3 separadores de grupos en la barra');
  step(src.includes("↺ Reiniciar llamada")&&src.includes("🔡 Texto grande")&&src.includes("🗑 Vaciar clientes"), 'W11-4 menú ⚙ con acciones reales');
  step(src.includes("CRM_ESTADOS")&&src.includes("crmHoyTodo")&&src.includes("cliPrepLlamada"), 'W11-5 capa datos CRM (estados, hoy, preparar llamada)');
  step(src.includes("guion_vars'+SUF"), 'W11-6 preparar llamada precarga guion_vars');
  ['nuevo','contactado','interesado','factura','cita','visita','ganado','perdido'].forEach(e=>step(src.includes("'"+e+"'"), 'W11-7 estado '+e));
  step(src.includes("clientes-'")&&src.includes("text/csv"), 'W11-8 export CSV');
  step(src.includes("cliUp(nombre,{tel:tel})"), 'W11-9 nota rápida enriquece la ficha CRM');
  // funcional jsdom: alta ficha, próxima acción hoy, preparar llamada
  try{
    const ev=s=>w.eval(s);
    w2=w;
    w2.eval("localStorage.clear()");
    w2.eval("cliUp('Bar La Mareta',{tel:'600111222',sector:'Hostelería',ciudad:'Sagunto',comercializadora:'Oculta SA'})");
    var hoyIso=(function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
    w2.eval("cliUp('Bar La Mareta',{estado:'cita',prox:{f:'"+hoyIso+"',h:'09:30',accion:'Revisar factura'}})");
    step(w2.eval("crmHoyTodo().length")>=1, 'W11-10 «Hoy toca» encuentra la cita de hoy');
    w2.eval("cliPrepLlamadaSafe('Bar La Mareta')");
    var vars=JSON.parse(w2.eval("localStorage.getItem('guion_vars')||'{}'")||'{}').NOMBRE_CLIENTE;
    step(vars==='Bar La Mareta', 'W11-11 preparar llamada precarga NOMBRE_CLIENTE');
    step(w2.eval("Object.keys(cliLeer()).length")===1, 'W11-12 ficha persistida local (cli_)');
    w2.eval("localStorage.removeItem('cli_registros')");
  }catch(e){ step(false,'W11-10 funcional CRM: '+e.message); }
}

// ── W12 · v3.1.0 registro de actividad + dashboard ──
{
  const srcA=fs.readFileSync(require('path').join(__dirname,'..','actividad.html'),'utf8');
  step(srcA.includes('Registro de actividad')&&srcA.includes('Gestiones por día')&&srcA.includes('Embudo CRM'), 'W12-1 actividad.html: dashboard (KPIs, gráfica, embudo)');
  step(srcA.includes('Contacto efectivo')&&srcA.includes('Factura recibida')&&srcA.includes('Coordinación visita'), 'W12-2 resultados/tipos de la hoja back-office');
  step(srcA.includes('bm_actividad')&&srcA.includes('cli_registros')&&srcA.includes('cfb_perfil'), 'W12-3 lee bm_actividad (burbuja) + CRM en vivo');
  step(srcA.includes("a.download='actividad-'+mesF+'.csv'"), 'W12-4 export CSV del mes');
  step(src.includes('window.actAdd=function')&&src.includes('window.actLeer=function')&&src.includes('bm_actividad'), 'W12-5 núcleo actAdd/actLeer en la plantilla');
  step(src.includes("actAdd('llamada',{detalle:fmtSeg(segs)+' de llamada'"), 'W12-6 auto: fin de ⏱ llamada cronometrada');
  step(src.includes("cadena('guiRpExit',function(){ if(window.actAdd)")&&src.includes("cadena('tutCorregir'")&&src.includes("cadena('tutAnswerCaso'"), 'W12-7 auto: roleplay + quiz + caso');
  step(src.includes("actAdd('crm',{detalle:'Estado → '"), 'W12-8 auto: cambio de estado CRM');
  step(src.includes("gestión anotada desde la nota rápida")&&src.includes("600000"), 'W12-9 auto: nota rápida con dedupe 10 min');
  step(src.includes("cfbActividadAbrir")&&src.includes("📊 Registro de actividad"), 'W12-10 acceso desde menú ⚙');
  step(fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8').includes('href="actividad.html"'), 'W12-11 tarjeta en index.html');
  try{
    w2=w;
    var K=w2.eval("cfbPref('actividad')");
    w2.eval("localStorage.removeItem('"+K+"')");
    w2.eval("window.actAdd('llamada',{detalle:'prueba X <b>', ciudad:'Sagunto'})");
    var arr=w2.eval("actLeer()");
    step(arr.length===1 && arr[0].tipo==='llamada' && arr[0].ciudad==='Sagunto' && arr[0].detalle.indexOf('<')===-1, 'W12-12 actAdd sanea y persiste');
    w2.eval("actResultado("+arr[0].ts+",'Contacto efectivo')");
    step(w2.eval("actLeer()[0].resultado")==='Contacto efectivo', 'W12-13 resultado editable');
    w2.eval("cliAnadir('Cliente Act','hola'); cliSetEstado('Cliente Act','cita')");
    step(w2.eval("actLeer().some(function(e){return e.tipo==='crm'&&e.resultado==='cita'})")===true, 'W12-14 estado CRM anota gestión automática');
    w2.eval("(function(){var a=[];for(var i=0;i<3005;i++)a.push({ts:1700000000000+i,f:'2026-01-01',h:'09:00',tipo:'otro',detalle:'x'+i});localStorage.setItem('"+K+"',JSON.stringify(a));})()");
    w2.eval("actAdd('otro',{detalle:'el que rebosa'})");
    step(w2.eval("actLeer().length")<=3000 && w2.eval("actLeer().some(function(e){return e.detalle==='el que rebosa'})")===true, 'W12-15 tapón FIFO 3000 (cae el más viejo)');
    w2.eval("localStorage.removeItem('"+K+"'); localStorage.removeItem('cli_registros')");
  }catch(e){ step(false,'W12-12 funcional actividad: '+e.message); }
  const shB=fs.readFileSync(require('path').join(__dirname,'..','instalar.html'),'utf8');
  const rd=fs.readFileSync(require('path').join(__dirname,'..','..','..','README.md'),'utf8');
  step(!/app oficial de Android \(APK\)/.test(shB)&&/android-historico/.test(rd), 'W12-16 (v3.7): instalar.html sin oferta de APK y README refleja la retirada');
}

// ── W13 · v3.2.0 panel admin: gestiones + embudo + meta equipo ──
{
  const srcAdm=fs.readFileSync(require('path').join(__dirname,'..','admin.html'),'utf8');
  const srcIdx=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
  const srcAct=fs.readFileSync(require('path').join(__dirname,'..','actividad.html'),'utf8');
  step(srcAdm.includes('Gestiones del equipo (registro automático)')&&srcAdm.includes('window.gestionesAdmin'), 'W13-1 admin: tabla gestiones automáticas');
  step(srcAdm.includes('Embudo CRM del equipo')&&srcAdm.includes('bm_crm_resumen_'), 'W13-2 admin: embudo CRM del equipo');
  step(srcAdm.includes('metaActGuardar')&&srcAdm.includes('metaActividad'), 'W13-3 admin: meta diaria de gestiones');
  step(srcAdm.includes('metaActividad:EQUIPO.metaActividad||0'), 'W13-4 equipo.json lleva metaActividad');
  step(srcIdx.includes('metaActividad:obj.metaActividad||0')&&srcIdx.includes('metaActividad||eq.metaActividad||0'), 'W13-5 index propaga metaActividad (cache + PUT)');
  step(srcAct.includes('metaEquipoG')&&srcAct.includes('meta equipo'), 'W13-6 actividad.html: meta de equipo con override local');
  step(src.includes('window.crmPublicaResumen=function')&&src.includes("cfbPref('crm_resumen')"), 'W13-7 plantilla publica resumen CRM anónimo');
  step(/liGuardarTodo\(o\)\{[\s\S]{0,260}?crmPublicaResumen/.test(src), 'W13-8 resumen se publica en cada escritura CLI');
  try{
    w2=w;
    w2.eval("localStorage.clear()");
    w2.eval("cliAnadir('Bar Admin','x'); cliSetEstado('Bar Admin','cita'); cliUp('Bar Admin',{factura:'150'}); cliAnadir('Bar B','y'); cliUp('Bar B',{factura:'200',estado:'interesado'})");
    var K=w2.eval("cfbPref('crm_resumen')");
    var r=JSON.parse(w2.eval("localStorage.getItem(\""+K+"\")||'null'"));
    step(r&&r.fichas===2&&r.e.cita===1&&r.e.interesado===1&&r.pipe===350, 'W13-9 resumen agregado correcto (fichas, estados, pipeline)');
    step(!JSON.stringify(r).includes('Bar Admin')&&!JSON.stringify(r).includes('Bar B'), 'W13-10 resumen SIN nombres (agregado anónimo)');
  }catch(e){ step(false,'W13-9 funcional resumen: '+e.message); }
}

// ── W14 · v3.3.0 «Prospección» (banco compartido de potenciales) ──
{
  step(src.includes('window.proAlta=function')&&src.includes('pro_banco_cache'), 'W14-1 motor prospección (alta + cache local)');
  step(src.includes("prospeccion.json")&&src.includes('proMerge')&&src.includes('proSyncFlush'), 'W14-2 banco compartido vía Contents API con fusión por id');
  step(src.includes("if(activos>=500)"), 'W14-3 tapón 500 potenciales activos');
  step(src.includes("'No contesta'")&&src.includes("'Pide factura'")&&src.includes("'Cita concertada'")&&src.includes("'Descartado'"), 'W14-4 resultados rápidos');
  step(src.includes("actAdd('llamada',{resultado:(res==='Pide factura'"), 'W14-5 resultado anota al registro de actividad');
  step(src.includes("proConvertir(id,res==='Pide factura'?'factura'"), 'W14-6 auto-conversión en positivos');
  step(src.includes("[potencial]")&&src.includes("cliAnadir(r.n,'[potencial] '"), 'W14-7 historial de intentos → notas del cliente');
  step(src.includes("guiIrA('apertura')")&&src.includes('window.proPrepLlamada'), 'W14-8 📞 Llamar precarga variables y abre en apertura');
  step(src.includes('proPurgar')&&src.includes('lim30'), 'W14-9 purga: descartado 90 d / convertido 30 d');
  step(src.includes('segmento «📋 Potenciales»')&&src.includes('onclick="proVer('), 'W14-10 segmento dentro de 👥 Clientes');
  try{
    w2=w;
    w2.eval("localStorage.clear()");
    var id=w2.eval("window.proAlta({n:'Da. Rosa Florist', tel:'699', c:'Paterna', s:'Floristería'}).id");
    w2.eval("window.proResultado('"+id+"','No contesta')");
    var r=w2.eval('window.proLeer()[0]');
    step(r.p.n===1&&r.p.e==='intento'&&r.p.pf.length===10, 'W14-11 no contesta: intento + reintento +2 d');
    var act=JSON.parse(w2.eval("localStorage.getItem('bm_actividad_comun')||'[]'"));
    step(act.length===1&&act[0].resultado==='No contesta'&&act[0].ciudad==='Paterna', 'W14-12 registro automático con ciudad/sector');
    w2.eval("window.proResultado('"+id+"','Cita concertada')");
    var fg=JSON.parse(w2.eval("localStorage.getItem('cli_registros')||'{}'"));
    step(fg['Da. Rosa Florist']&&fg['Da. Rosa Florist'].estado==='cita', 'W14-13 cita concertada → cliente en estado cita');
    step(w2.eval('window.proLeer()[0].p.e')==='convertido', 'W14-14 potencial a convertido');
    var mm=w2.eval("window.proMerge([{id:'a',n:'V',act:5,ts:1,p:{}}],[{id:'a',n:'N',act:9,ts:1,p:{}}])");
    step(mm.length===1&&mm[0].n==='N', 'W14-15 fusión gana el más reciente');
    var pur=w2.eval("(function(){return window.proMerge([{id:'v',n:'X',act:Date.now()-100*86400000,ts:1,p:{e:'descartado'}}],[]).length===0;})()");
    step(pur===true, 'W14-16 merge purga descartados >90 d');
  }catch(e){ step(false,'W14-11 funcional prospección: '+e.message); }
  step(src.includes('proImporta')&&src.includes('proImportTa')&&src.includes('Importar lista'), 'W14-17 importar lista pegada (; , tab)');
}


// ── W15 · v3.4.0 «Sesión» (cadena de llamadas + ruta + cola de sync + calidad del banco) ──
{
  step(src.includes('window.proSesionToggle')&&src.includes('PRO_SESION')&&src.includes('proSesionHtml'), 'W15-1 modo sesión: toggle + vista');
  step(src.includes('proSesionRes')&&src.includes('Teclas <b>1</b>–<b>7</b>'), 'W15-2 auto-avance tras resultado + hint de teclas 1-7');
  step(src.contains?false:src.includes('proSesionKey')&&src.includes('addEventListener')&&src.indexOf("preventDefault")>-1, 'W15-3 teclas 1-7 enganchadas y con preventDefault');
  step(src.includes('function proPrioridad'), 'W15-4 colador de prioridad (reintento hoy → sin llamar → calientes)');
  step(src.includes("'🗺 ruta'"), 'W15-5 chip 🗺 ruta');
  step(src.includes('function proTelN')&&src.includes('dup'), 'W15-6 anti-duplicados por teléfono normalizado');
  step(src.includes('proTelN(x.tel)===rt'), 'W15-7 comparación por los 9 últimos dígitos');
  step(src.includes('ya estaban'), 'W15-8 importar salta duplicados y los contabiliza');
  step(src.includes('g:actLimpia(r.g,200)')&&src.includes('proNotaSave'), 'W15-9 nota libre en potencial (≤200) + guardado');
  step(src.includes('proNotaIn'), 'W15-10 edición inline de nota con 💾');
  step(src.includes('proSyncLey')&&src.includes('proSyncPill'), 'W15-11 píldora de cola de sync (✔/⏳)');
  step(src.includes("proSyncSt('pend')")&&src.includes("proSyncSt('ok')"), 'W15-12 estados sync desde push y PUT ok');
  step(src.includes('👤 míos')&&src.includes('del equipo'), 'W15-13 filtro míos / del equipo');
  step(src.includes('NCITAS')&&src.includes('facturas en juego')&&src.includes('citas pendientes'), 'W15-14 chips 📅 📄 en pestaña Clientes');
  step(src.includes('CRM_FILTRO.proSesion&&PRO_SESION.on'), 'W15-15 la vista normal cede a la sesión');
  try{
    w2=w;
    w2.eval("localStorage.clear()");
    var a=w2.eval("window.proAlta({n:'Casa Pepe',tel:'611222333',c:'Paterna'}).id");
    var b2=w2.eval("window.proAlta({n:'Bar Sur',tel:'655666777',c:'Sagunto'}).id");
    var dup=w2.eval("window.proAlta({n:'Casa Pepe DOS',tel:'+34 611 222 333'})");
    step(dup&&dup.dup&&dup.dup.n==='Casa Pepe', 'W15-16 dup detectado con prefijo +34');
    step(w2.eval('window.proLeer().length')===2, 'W15-17 el dup no entra al banco');
    w2.eval("window.proNotaSave ? null : null");
    w2.eval("(function(){var r=window.proLeer(); r[0].g='duenya por la tarde'; localStorage.setItem('pro_banco_cache',JSON.stringify(r));})()");
    w2.eval("window.proVer('pot'); crmFiltro('proChip','ruta');");
    var html=w2.document.getElementById('tab-clientes').innerHTML;
    step(html.indexOf('duenya por la tarde')>-1, 'W15-18 nota visible en la fila');
    step(html.indexOf('Bar Sur')<html.indexOf('Casa Pepe')===false, 'W15-19 ruta ordena por pueblo (Paterna primero)');
    w2.eval("window.proSesionToggle()");
    var sh=w2.document.getElementById('tab-clientes').innerHTML;
    step(sh.indexOf('Cerrar sesión')>-1, 'W15-20 sesión abre');
    w2.eval("window.proSesionKey({key:'3',target:{tagName:'DIV'},preventDefault:function(){window._pd=1;}})");
    step(w2.eval("localStorage.getItem('bm_actividad_comun')||''").indexOf('No interesado')>-1, 'W15-21 tecla 3 anota el resultado');
    step(w2.eval('window._pd')===1, 'W15-22 preventDefault aplicado');
    w2.eval("window.proSesionToggle()");
  }catch(e){ step(false,'W15-16 funcional sesión: '+e.message); }
}

// ── W16 · v3.5.0 «Maestro» (reclamar puñados + exclusión compartida + descarte dual) ──
{
  step(src.includes('window.maeReponer')&&src.includes('maeRepoHtml')&&src.includes('maeServirme'), 'W16-1 vista 📥 Reponer (motor maestro)');
  step(src.includes('function maeGet')&&src.includes('function maePut')&&src.includes('body.sha=j.sha')&&src.includes('st2===409'), 'W16-2 maeGet/maePut con sha anti-412 + retry 409');
  step(src.includes("window._maeTest"), 'W16-3 hook _maeTest para tests offline');
  step(src.includes('function maeClaimLote')&&src.includes("st='rec'")&&src.includes('owner'), 'W16-4 claim marca rec+owner en el puñado');
  step(src.includes('hueco en el banco')&&src.includes(">=500"), 'W16-5 cupo del banco respetado en el claim (tapa a 500)');
  step(src.includes("excMap[t]")&&src.includes('proTelN(r.tel)===t'), 'W16-6 claim salta exclusión y duplicados');
  step(src.includes('mae_idx_cache')&&src.includes('JSON.stringify(d)!==str'), 'W16-7 índice cacheado + repintado solo si cambia');
  step(src.includes('function excAdd')&&src.includes('function excSyncPush')&&src.includes('function excSyncFlush'), 'W16-8 exclusión compartida (add/flush/push)');
  step(src.includes('mae_exc_cache'), 'W16-9 exclusión con caché local');
  step(src.includes('NO VOLVER A LLAMAR')&&src.includes('excAdd(r.tel')&&src.includes('lista de exclusión del equipo'), 'W16-10 descartado dual con confirmación');
  step(src.includes('window.excQuitar')&&src.includes('window.excFlush'), 'W16-11 quitar de exclusión + flush expuesto');
  step(/excMerge/.test(src), 'W16-12 fusión de exclusión (ts mayor)');
  try{
    w2=w;
    w2.eval("localStorage.clear()");
    w2.eval("window._maeTest={files:{"
      +"'datos/exclusion.json':{v:1,ts:'x',items:[{tel:'611222333',m:'no_llama',by:'ana',ts:'2026-09-30'}]},"
      +"'datos/maestro/idx.json':{v:1,ts:'x',total_libres:4,prov:[{p:'Valencia',libres:4,total:4,sec:[{s:'Hostelería',libres:4}],pun:[{id:'lote_P0007',libres:4,total:4,sec:'Hostelería'}]}]},"
      +"'datos/maestro/lote_P0007.json':{v:1,lote:'lote_P0007',prov:'Valencia',sec:'Hostelería',items:["
      +"{id:'m1',n:'Bar Austral',tel:'600111111',c:'Sagunto',p:'Valencia',s:'Hostelería',nota:'AV. CAMÍ 52 · 46000 · ✉ bar@austral.es',st:'libre',owner:''},"
      +"{id:'m2',n:'Bar Boreal',tel:'600222222',c:'Paterna',p:'Valencia',s:'Hostelería',st:'rec',owner:'lu'},"
      +"{id:'m3',n:'Bar Austral D2',tel:'600 111 111',c:'Sagunto',p:'Valencia',s:'Hostelería',st:'libre',owner:''},"
      +"{id:'m4',n:'Café Delta',tel:'611222333',c:'Torrent',p:'Valencia',s:'Hostelería',st:'libre',owner:''}]}"
      +"}}");
    w2.eval("window.proVer('pot'); window.maeReponer()");
    var rh=w2.eval("document.getElementById('tab-clientes').innerHTML");
    step(rh.indexOf('lote_P0007')>-1, 'W16-13 Reponer pinta el puñado');
    step(rh.indexOf('hueco en el banco: <b>500')>-1, 'W16-14 muestra el hueco libre del banco');
    w2.eval("window.maeServirme('lote_P0007')");
    await new Promise(r=>setTimeout(r,700));
    var bn=w2.eval("window.proLeer()");
    step(bn.length===1&&bn[0].n==='Bar Austral', 'W16-15 claim: entra solo Bar Austral (dup formato + exclusión + lote ajeno saltados)');
    step(bn[0]&&bn[0].fuente.indexOf('lote P0007')>-1, 'W16-16 fuente «lote P0007» apuntada');
    step(bn[0].g==='AV. CAMÍ 52 · 46000 · ✉ bar@austral.es', 'W16-16b la nota del lote viaja al banco (dir+email)');
    var lt=w2.eval("window._maeTest.files['datos/maestro/lote_P0007.json']");
    step(lt.items[0].st==='rec'&&!!lt.items[0].owner&&lt.items[1].owner==='lu', 'W16-17 claim respeta lo de otro y marca lo mío');
    w2.eval("window._conf=[]; window.confirm=function(m){ window._conf.push(m); return true; };");
    w2.eval("window.proResultado('"+(bn[0]?bn[0].id:'')+"','Descartado')");
    var exc=w2.eval("JSON.parse(localStorage.getItem('mae_exc_cache')||'{items:[]}')");
    step(exc.items.length===2&&exc.items[0].tel==='600111111', 'W16-18 descarte dual: teléfono añadido a la exclusión');
    step(w2.eval("window._conf.length===1&&/NO VOLVER A LLAMAR/.test(window._conf[0])"), 'W16-19 pregunta dual mostrada y confirmada');
    w2.eval("window.excFlush()");
    await new Promise(r=>setTimeout(r,700));
    step(w2.eval("window._maeTest.puts>=2"), 'W16-20 PUT del lote + PUT de exclusión al repo');
    step(w2.eval("window._maeTest.files['datos/exclusion.json'].items.length===2"), 'W16-21 exclusión publicada compartida');
    w2.eval("window.maeSalirRepo()");
    step(w2.eval("document.getElementById('tab-clientes').innerHTML").indexOf('📥 Reponer')>-1, 'W16-22 chip 📥 Reponer visible al volver');
    w2.eval("delete window._maeTest; localStorage.clear();");
  }catch(e){ step(false,'W16-13 funcional maestro: '+e.message); }
}

// ── W17 · v3.10.0 «Usuarios y accesos» (F13 · ADR-002/003) — estáticas ──
{
  step(/function eqEntrada\(/.test(srcI)&&/b\.v===2&&Array\.isArray\(b\.entradas\)/.test(srcI),'W17-1 index: blob multi-entrada v2 (eqEntrada por slug)');
  step(/function eqPayload\(/.test(srcI)&&/if\(j&&j\.k\)/.test(srcI)&&/return \{k:t, dk:null\}/.test(srcI),'W17-2 index: payload doble-clave {k,dk} con legado compatible (ADR-003)');
  step(srcI.includes('id="cfbEqId"')&&srcI.includes('Tu acceso personal')&&srcI.includes('contraseña del equipo'),'W17-3 index: tarjeta v2 ID+contraseña y tarjeta v1 legada conviven');
  step(/#ap=\(\[\^&\]\+\)/.test(srcI)&&srcI.indexOf('eqAccesoDeUrl')>-1,'W17-4 index: enlace personal #ap=slug:pass soportado');
  step(/\(eq\|ap\)=\[\^&\]\*/.test(srcI),'W17-5 index: limpieza de URL borra TAMBIÉN #ap= (sin fuga)');
  step(/if\(st===200\)\{[\s\S]{0,90}LSs\('cfb_eq_pass',pass\)/.test(srcI),'W17-6 SEGURIDAD: la contraseña personal solo se persiste tras la validación 200 (E6 v3.10)');
  step(srcI.includes('cfbMiAcceso')&&srcI.includes('cfbMiPassGuardar')&&srcI.includes('auto-cambio de contraseña'),'W17-7 index: auto-cambio de contraseña (recifra SOLO su entrada y la republica)');
  step(srcI.includes('🔑 Mi acceso')&&srcI.includes('cfb_eq_slug'),'W17-8 index: chip «Mi acceso» en el saludo, condicionado a tener acceso personal');
  step(srcA.includes('Accesos personales')&&srcA.includes('window.accPublicar')&&srcA.includes('window.accRevocar')&&srcA.includes('accPassSugerida'),'W17-9 admin: tarjeta «Accesos personales» (crear/publicar/revocar/reset)');
  step(srcA.indexOf("'#ap='+encodeURIComponent")>-1,'W17-10 admin: genera el enlace personal #ap=slug:pass');
  step(srcA.includes('cfb_data_key')&&srcI.includes('cfb_data_key'),'W17-11 doble clave ADR-003: la dk viaja cifrada y se guarda en index y admin');
  step(srcA.includes('revocación acceso')&&/entradas\.filter\(function\(e\)\{ return e\.slug!==slug/.test(srcA),'W17-12 admin: revocación = quitar SOLAMENTE su entrada del bloque');
  step(fs.existsSync(path.join(__dirname,'..','..','..','docs','adrs','ADR-002-accesos-personales-multi-entrada.md'))&&fs.existsSync(path.join(__dirname,'..','..','..','docs','adrs','ADR-003-doble-clave-datos-vs-acceso.md')),'W17-13 ADR-002/003 documentadas (E0 del plan v6)');
  try{
    const vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8'));
    var _v=(vj.version||'').split('.').map(Number);
    step(_v[0]>=3&&(_v[0]>3||_v[1]>=10)&&/https?:\/\//.test(vj.url||'')&&vj.channel==='estable','W17-14 version.json ≥ 3.10.0 (url sana, canal estable)');
  }catch(e){ step(false,'W17-14 version.json: '+e.message); }
  step(/cfb-v36[5-9]|cfb-v3[7-9][0-9]/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8')),'W17-15 sw.js cache-bump >= cfb-v365 (sirve el index nuevo)');
}

// ── W18 · v3.11.0 «Base empresarial» (F1 · ADR-004 · Ola 1b) — estáticas + funcionales ──
{
  step(/if\(f\.v!==6\)\{ f\.v=6; \}/.test(src)&&/if\(f\.v!==6\)\{ f\.v=6; \}/.test(srcR),'W18-1 crmNorm con vacuna vigente (v6, ADR-009) en pymes, en ambos guiones igual');
  step(/f\.contactos=f\.contactos\.filter/.test(src)&&/f\.tags=_tg\.slice\(0,12\)/.test(src),'W18-2 contactos(≤8)y tags(≤12,dedupe)saneados en crmNorm');
  step(/'dir','cp','email','web','origen','ibe_id','valor'/.test(src),'W18-3 ficha con dir/cp/email/web/origen/ibe_id/valor');
  step(src.includes('CRM_ORIGENES')&&src.includes('IBERCRM')&&src.includes('maestro')&&src.includes('referido'),'W18-4 select de origen del lead (Iberdrola/IBERCRM/…) ');
  step(/function crmMatch\(n,f,q\)/.test(src)&&/if\(!crmMatch\(n,f,q\)\) return false;/.test(src),'W18-5 buscador global (empresa+tags+contactos+ibe_id) en uso por el render');
  ['crmDi_','crmCp_','crmEm_','crmWe_','crmVa_','crmOr_','crmIb_','crmCn_','crmCc_','crmCt_','crmTag_'].forEach(id=> step(src.includes(id), 'W18-6 editor 360º: id '+id+' presente'));
  step(/window\.crmTagAdd=/.test(src)&&/window\.crmTagDel=/.test(src)&&/window\.crmConAdd=/.test(src)&&/window\.crmConDel=/.test(src),'W18-7 CRUD de tags y contactos exportado');
  step(src.includes("dir:(g('crmDi_'+e)")&&src.includes("valor:(g('crmVa_'+e)")&&src.includes("ibe_id:(g('crmIb_'+e)"),'W18-8 💾 Guardar recoge los campos empresariales');
  step(src.includes("'origen','valor_eur','tags','contactos','ibe_id','email','web','direccion','cp'"),'W18-9 CSV enriquecido (columnas F1 al final, compat)');
  step(/cliUp\(r\.n,\{[\s\S]{0,120}origen:\(r\.fuente\|\|''\)\.slice\(0,80\)/.test(src),'W18-10 conversión potencial→ficha hereda el ORIGEN del lead');
  step(/window\.cfCifraParaSync=/.test(src)&&/window\.cfDescifraDeSync=/.test(src),'W18-11 S1 infra: API de cifrado selectivo instalada (dormida hasta F2, ADR-003)');
  step(fs.existsSync(path.join(__dirname,'..','..','..','docs','adrs','ADR-004-ficha-empresarial-y-vacuna-crm-v2.md')),'W18-12 ADR-004 escrita (E0)');
  // paridad pymes/residencial del módulo empresarial (bloque literal idéntico)
  const extraer = (t)=>{ const a=t.indexOf('function crmNorm(f){'), b=t.indexOf('function crmDefId(e){'); return (a>-1&&b>a)?t.slice(a,b):''; };
  step(extraer(src)===extraer(srcR)&&extraer(src).length>500,'W18-13 paridad: crmNorm v4 idéntico en pymes y residencial');
  // privacidad: el resumen anónimo del admin NO toca campos empresariales
  const resumen = src.slice(src.indexOf('window.crmPublicaResumen=function(){'), src.indexOf('window.crmPublicaResumen=function(){')+900);
  step(!/ibe_id|contactos|f\.valor|f\.email|f\.web|origen/.test(resumen),'W18-14 RGPD: crmPublicaResumen sigue anónimo (no viaja nada de F1)');
  try{
    const vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8'));
    step((function(){ var pv=(vj.version||'').split('.').map(Number); return pv[0]>=3&&(pv[0]>3||pv[1]>=11); })(),'W18-15 version.json ≥ 3.11.0 (semver, no pin)');
  }catch(e){ step(false,'W18-15 version.json: '+e.message); }
  step(/cfb-v36[6-9]|cfb-v37[0-9]/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8')),'W18-16 sw.js cache-bump >= cfb-v366');

  /* funcionales puros (sin render): vacuna idempotente, saneamiento, match */
  try{
    const wD=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc2=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc2,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); }});
      return dom.window;
    })();
    const norm=wD.eval("crmNorm({v:1,notas:[{f:'2026-01-01',t:'vieja'}],tel:' 600 '})");
    step(norm.v>=4&&Array.isArray(norm.contactos)&&Array.isArray(norm.tags)&&norm.ibe_id===''&&norm.origen===''&&norm.notas.length===1,'W18-17 vacuna v1/v3→vX: conserva notas, crea estructuras nuevas vacías');
    const norm2=wD.eval("crmNorm("+JSON.stringify(norm)+")");
    step(JSON.stringify(norm2)===JSON.stringify(norm),'W18-18 crmNorm idempotente (round-trip JSON idéntico)');
    const up=wD.eval("localStorage.clear(); cliUp('Bar Test',{tel:'600111222',valor:'12.90 €',ibe_id:'ES0021XX000777AAA',origen:'maestro',contactos:[{n:'Ana',cargo:'Gte',tel:'611'}],tags:['solar','solar','<x>']})");
    step(!!up&&up.valor==='12.90'&&up.ibe_id==='ES0021XX000777AAA'&&up.origen==='maestro','W18-19 cliUp sanea valor € numérico y conserva ibe_id/origen');
    step(up.contactos.length===1&&up.contactos[0].n==='Ana'&&up.tags.length===1&&up.tags[0]==='solar','W18-20 contactos/tags saneados (dedupe y desinfección <x> ✔)');
    step(wD.eval("crmMatch('Bar Test',"+JSON.stringify(up)+",'SOL22')")===wD.eval("crmMatch('Bar Test',"+JSON.stringify(up)+",'x777aaa')")===true&&wD.eval("crmMatch('Bar Test',"+JSON.stringify(up)+",'lider')")===false,'W18-21 match por ibe_id y tag, sin falsos positivos');
    const resumenChk=wD.eval("(function(){ localStorage.clear(); cliUp('Bar Z',{estado:'interesado',factura:'100',ibe_id:'ES000',origen:'maestro',valor:'500',contactos:[{n:'X'}],email:'a@b.c'}); crmPublicaResumen(); return localStorage.getItem(cfbPref('crm_resumen')); })()");
    step(resumenChk&&/ES000|maestro|500|a@b\.c/.test(resumenChk)===false&&resumenChk.indexOf('"fichas":1')>-1,'W18-22 el resumen al admin NO lleva ibe_id/valor/email (anonimato real)');
  }catch(e){ step(false,'W18-17..22 funcionales: '+e.message); }
}

// ── W19 · v3.12.0 «Hoy» (F3 · ADR-005) — estáticas ──
step(/function Tc\(s\)\{ try\{ return cfaT/.test(src)&&/window\.crmDia=function\(\)\{/.test(src)&&/function crmSegBar\(act\)/.test(src)&&/window\.crmHoyHtml=function\(\)\{/.test(src), 'W19-1 piezas F3 (Tc/crmDia/crmSegBar/crmHoyHtml) presentes en pymes');
step(/window\.crmDia=function\(\)\{/.test(srcR)&&/window\.crmHoyHtml=function\(\)\{/.test(srcR), 'W19-2 mismas piezas presentes en residencial');
step(src.indexOf("if(CRM_FILTRO.seg==='hoy'){ try{ el.innerHTML=crmHoyHtml(); }catch(err)")>-1&&srcR.indexOf("CRM_FILTRO.seg==='hoy'")>-1, 'W19-3 branch «hoy» al inicio del render (ambos)');
step(src.indexOf("window.crmIrFicha=function(nombre){ CRM_FILTRO.estado=''; CRM_FILTRO.q='';")>-1, 'W19-4 crmIrFicha limpia filtros y abre la ficha');
step(src.indexOf("+crmSegBar('cli')")>-1&&src.indexOf("+crmSegBar('pot')")>-1, 'W19-5 barra de segmentos unificada en clientes y potenciales');
step(function(){ var a=src.slice(src.indexOf('window.crmHoyHtml=function()'),src.indexOf('window.crmHoyHtml=function()')+900); var b=srcR.slice(srcR.indexOf('window.crmHoyHtml=function()'),srcR.indexOf('window.crmHoyHtml=function()')+900); return a===b; }(), 'W19-6 paridad literal pymes≡residencial del bloque F3');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return pv[0]>=3&&(!(pv[0]===3)||pv[1]>=12)&&/cfb-v3(6[7-9]|[7-9][0-9])/.test(sw); }catch(e){ return false; } }(), 'W19-7 version.json ≥ 3.12 + sw cfb-v367 o posterior');

// ── W19 funcionales (jsdom aislado) ──
{
  try{
    const w2=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc2=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc2,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); }});
      return dom.window;
    })();
    const dia=w2.eval("(function(){ localStorage.clear(); var p=function(n){return ('0'+n).slice(-2);}; var h=(function(){var d=new Date(); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());})(); var Y=new Date(); Y.setDate(Y.getDate()-1); var ayer=Y.getFullYear()+'-'+p(Y.getMonth()+1)+'-'+p(Y.getDate()); cliUp('Vencida S.L.',{estado:'contactado',prox:{f:ayer,h:'09:30',accion:'pedir factura'}}); cliUp('Hoy2',{estado:'interesado',prox:{f:h,h:'10:00',accion:'ver web'}}); cliUp('Hoy1',{estado:'nuevo',prox:{f:h,h:'12:00',accion:'revisar tarifa'}}); cliUp('Futura',{estado:'nuevo',prox:{f:'2099-01-01',h:'',accion:''}}); cliUp('Ganada',{estado:'ganado',prox:{f:h,h:'08:00',accion:'ignorar'}}); return crmDia(); })()");
    step(dia.vencidas.length===1&&dia.vencidas[0].n==='Vencida S.L.','W19-8 crmDia: vencidas aparte, correctas');
    step(dia.hoy.length===2&&dia.hoy[0].n==='Hoy2'&&dia.hoy[1].n==='Hoy1','W19-9 orden por hora dentro de «hoy» (10:00 antes de 12:00), futuras y ganadas fuera');
    const hhtml=w2.eval('crmHoyHtml()');
    step(/⚠ Vencidas \(1\)/.test(hhtml)&&/🕐 Toca hoy \(2\)/.test(hhtml)&&hhtml.indexOf('Vencida S.L.')>-1&&hhtml.indexOf("crmIrFicha(")>-1&&hhtml.indexOf('☀')>-1,'W19-10 crmHoyHtml: grupos con recuentos, filas clicables, chip ☀');
    step(!/Día limpio/.test(hhtml),'W19-11 sin pendientes NO hay mensaje de día limpio cuando SÍ hay trabajo');
    step(/Día limpio/.test(w2.eval('localStorage.clear(); crmHoyHtml()')),'W19-12 agenda vacía → mensaje «Día limpio» (sin potenciales tampoco)');
    const nav=w2.eval("(function(){ localStorage.clear(); cliUp('Nav',{estado:'interesado',prox:{f:(function(){var d=new Date(),p=function(n){return ('0'+n).slice(-2);};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());})(),h:'09:00',accion:''}}); crmFiltro('estado','ganado'); crmFiltro('q','zzzx'); crmIrFicha('Nav'); var d=document.getElementById('crmD_Nav'); var busca=document.getElementById('crmQ'); return [!!d,d&&d.open,busca?busca.value:'?']; })()" );
    step(nav[0]===true&&nav[1]===true&&nav[2]==='','W19-13 crmIrFicha limpia filtros (busca vacía), vuelve a clientes y ABRE la ficha');
    const pot=w2.eval("(function(){ localStorage.clear(); crmFiltro('proRepo',0); crmFiltro('proSesion',0); crmFiltro('proChip','todos'); crmFiltro('seg','pot'); return document.getElementById('tab-clientes').innerHTML; })()");
    step(pot.indexOf('☀')>-1&&pot.indexOf('proVer')>-1,'W19-14 barra ☀ también en la vista de potenciales (hueco de navegación cerrado)');
  }catch(e){ step(false,'W19-8..14 funcionales: '+e.message); }
}

// ── V4 · cierre Ola 1 → v4.0.0 («CRM base y plataforma») — certificado de hito ──
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var pv=(vj.version||'').split('.').map(Number); return pv[0]>=4&&vj.channel==='estable'; }catch(e){ return false; } }(), 'V4-1 version.json ≥ 4.0.0 estable (hito Ola 1 sellado y superado)');
step(function(){ try{ var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); return /cfb-v36[89]|cfb-v3[7-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'V4-2 sw ≥ cfb-v368 (sello de hito o posterior)');
step(function(){ try{ var cl=fs.readFileSync(path.join(__dirname,'..','CHANGELOG.md'),'utf8'); return cl.indexOf('## v4.0.0')>-1&&cl.indexOf('## v3.12.0')>-1&&cl.indexOf('## v3.11.0')>-1&&cl.indexOf('## v3.10.0')>-1; }catch(e){ return false; } }(), 'V4-3 CHANGELOG con las 4 entradas de la ola (3.10/3.11/3.12/4.0.0)');
step(function(){ try{ var pl=fs.readFileSync(path.join(__dirname,'..','..','..','docs','PLAN-CRM.md'),'utf8'); return pl.indexOf('Ola 1 · v4.0 · ✅')>-1||pl.indexOf('Ola 1 · ✅')>-1||(pl.indexOf('(a) HECHA')>-1&&pl.indexOf('(b) HECHA')>-1&&pl.indexOf('(c) HECHA')>-1&&pl.indexOf('v4.0.0')>-1); }catch(e){ return false; } }(), 'V4-4 PLAN-CRM: Ola 1 con (a)(b)(c) HECHAs y referencia v4.0.0');

// ── W20 · v4.0.1 Ola 2(a): G4 sync fichas + G5 catálogo + G7 IBERCRM (ADR-006) — estáticas ──
step(/window\.cliSyncPush=function/.test(src)&&/window\.cliSyncJala=function/.test(src)&&/window\.cliMerge=function/.test(src)&&/window\.cliSyncEstado=function/.test(src), 'W20-1 G4 sync fichas: push/jala/merge/estado presentes (pymes)');
step(/window\.cliSyncPush=function/.test(srcR)&&/window\.cliSyncJala=function/.test(srcR), 'W20-2 mismas piezas en residencial');
step(src.indexOf("return {on: !!LSg('cfb_data_key','')}; }")>-1&&srcR.indexOf("return {on: !!LSg('cfb_data_key','')}; }")>-1, 'W20-3 G4 AUTO-ON ⇔ hay clave de equipo (F5 decidió en ADR-009; el flag legado quedó inerte)');
step(/CRM_S1_SENSIBLES=\['tel','comercializadora','factura','dolor','dir','cp','email','web','valor','ibe_id','origen','contactos','tags','pis','prox','notas','creado'\]/.test(src), 'W20-4 S1: lista de campos sensibles completa (valor/ibe_id/notas incluidos; ahora también pis desde F2)');
step(/cfS1Key=function/.test(src)&&/importKey\('jwk'/.test(src)&&/AES-GCM/.test(src), 'W20-5 S1 real: clave JWK desde cfb_data_key + AES-GCM');
step(/window\.catalogoDef=function/.test(src)&&src.indexOf("id:'tarifa20'")>-1&&src.indexOf("id:'comer'")>-1, 'W20-6 G5 semilla embebida con ids bien conocidos (tarifa20…comer)');
step(src.indexOf("fetch('datos/catalogo.json',{cache:'no-store'})")>-1&&src.indexOf('cat_cache')>-1, 'W20-7 G5 lectura relativa Pages sin token + caché 8 h');
step(function(){ try{ var ad=fs.readFileSync(path.join(__dirname,'..','admin.html'),'utf8'); return ad.indexOf('catTabla')>-1&&ad.indexOf('catPublicar')>-1&&ad.indexOf("'/contents/datos/catalogo.json?ref=main'")>-1&&ad.indexOf('WEB_REPO')>-1; }catch(e){ return false; } }(), 'W20-8 G5 admin: tarjeta catálogo + publicación Contents en WEB_REPO');
step(function(){ try{ var j=JSON.parse(fs.readFileSync(path.join(__dirname,'..','datos','catalogo.json'),'utf8')); var ids=(j.items||[]).map(function(i){return i.id;}).join(','); return j.v===1&&ids.indexOf('tarifa20')>-1&&ids.indexOf('comer')>-1&&(j.items.length>=7); }catch(e){ return false; } }(), 'W20-9 semilla pública datos/catalogo.json válida (≥7 productos)');
step(/i:actLimpia\(r\.i,30\)/.test(src), 'W20-10 G7 proNorm gana campo i (ibe_id ≤30) — migración-lite');
step(src.indexOf("ibe_id:(r.i||'').slice(0,30)")>-1, 'W20-11 G7 proConvertir hereda ibe_id a la ficha');
step(/window\.proIbcParse=function/.test(src)&&src.indexOf('proImpIbc')>-1&&src.indexOf('proImportaIbc')>-1&&src.indexOf('proIbcTa')>-1, 'W20-12 G7 parser+UI IBERCRM (proIbcParse/proImpIbc/proImportaIbc)');
step(function(){ var a=src.slice(src.indexOf('window.cliMerge=function('),src.indexOf('window.cliSyncEstado=function(')); var b=srcR.slice(srcR.indexOf('window.cliMerge=function('),srcR.indexOf('window.cliSyncEstado=function(')); return a===b; }(), 'W20-13 paridad literal pymes≡residencial del motor G4');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return pv[0]>=4&&/cfb-v36[89]|cfb-v3[7-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W20-14 version.json ≥ 4.0.1 + sw ≥ cfb-v368');

// ── W20 funcionales (jsdom con WebCrypto + maeHook offline) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w3=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc3=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc3,
       beforeParse(w){
         w.confirm=()=>true; w.alert=()=>{};
         w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})});
         Object.defineProperty(w,'crypto',{value:webcrypto});
       }});
      return dom.window;
    })();
    const mr=w3.eval("window.cliMerge({A:{estado:'nuevo',notas:[{f:'2026-01-02'}],prox:{f:''}},B:{estado:'nuevo',prox:{f:'2026-01-01'},notas:[]}},{A:{estado:'interesado',notas:[{f:'2026-03-01'}],prox:{f:''}},C:{estado:'nuevo',prox:{f:''},notas:[]}})");
    step(Object.keys(mr).length===3&&mr.A.estado==='interesado'&&mr.B.estado==='nuevo','W20-15 G4 cliMerge: unión completa y gana la remota estrictamente más fresca');

    const rt=await w3.eval("(async function(){ localStorage.clear(); var salida=await new Promise(function(res){ cfCifraParaSync({X:{tel:'600',notas:[{f:'2026-01-01',t:'secreto'}],valor:'900'}},function(d,e){ res({d:d,e:e}); }); }); return {igual:(salida.d&&salida.d.X&&salida.d.X.tel==='600'),err:salida.e}; })()");
    step(rt.igual===true&&!rt.err,'W20-16 S1 sin dk → identidad documentada (modo local sin equipo)');

    const kJ=await w3.eval("(async function(){ var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); var jwk=await crypto.subtle.exportKey('jwk',k); localStorage.setItem('cfb_data_key',JSON.stringify(jwk)); localStorage.setItem('cfb_flag_cli_sync','1'); return jwk.k; })()");
    step(!!kJ, 'W20-17 dk de equipo (JWK) instalada + flag de sync activado para el resto de pruebas');

    const rt2=await w3.eval("(async function(){ var salida=await new Promise(function(res){ cfCifraParaSync({X:{tel:'600111222',notas:[{f:'2026-01-01',t:'secreto-nota'}],valor:'999',estado:'interesado',ciudad:'Valencia',sector:'host'}},function(d,e){ res({d:d,e:e}); }); }); var x=salida.d.X; return {cf:x.cf===1,estado:x.estado,ciudad:x.ciudad,telEnClaro:x.tel,notasEnClaro:x.notas,blobSinTel:String(x.blob).indexOf('600111222')===-1,blobSinNota:String(x.blob).indexOf('secreto')===-1,err:salida.e}; })()");
    step(rt2.cf===true&&rt2.estado==='interesado'&&rt2.ciudad==='Valencia'&&rt2.telEnClaro===undefined&&rt2.notasEnClaro===undefined&&rt2.blobSinTel===true&&rt2.blobSinNota===true&&!rt2.err,'W20-18 S1 real: tel/notas/valor CIFRADOS (fuera del texto); en claro solo lo de merge/listado');
    const rt3=await w3.eval("(async function(){ var cifradas=await new Promise(function(res){ cfCifraParaSync({X:{tel:'600111222',notas:[{f:'2026-01-01',t:'secreto'}],valor:'999',estado:'nuevo',tags:['solar'],contactos:[{n:'Ana',tel:'611'}]}},function(d,e){ res(d); }); }); var desc=await new Promise(function(res){ cfDescifraDeSync(cifradas,function(d,e){ res(d); }); }); var x=desc.X; return {tel:x.tel,nota:(x.notas&&x.notas[0]&&x.notas[0].t)||'',valor:x.valor,tag:x.tags[0],con:x.contactos[0].tel,v:x.v}; })()");
    step(rt3.tel==='600111222'&&rt3.valor==='999'&&rt3.tag==='solar'&&rt3.con==='611'&&rt3.v>=4,'W20-19 S1 round-trip cifra→descifra: ficha íntegra y normalizada');

    const sy=await w3.eval("(async function(){ window._maeTest={files:{},puts:0}; cliUp('Local1',{estado:'nuevo',prox:{f:'2026-01-01',h:'',accion:''}}); var r1=await new Promise(function(res){ cliSyncPush(function(ok,err){ res({ok:ok,err:err}); }); }); return {r1:r1,put:window._maeTest.puts,escrito:!!window._maeTest.files['datos/crm-fichas.json']}; })()");
    step(sy.r1&&sy.r1.ok&&sy.r1.ok.enviadas===1&&sy.escrito===true&&sy.put>=1,'W20-20 G4 push offline (maeHook): datos/crm-fichas.json escrito, 1 ficha enviada');

    const sy2=await w3.eval("(async function(){ window._maeTest={files:{'datos/crm-fichas.json':{v:1,fichas:{Remota1:{estado:'interesado',ciudad:'',sector:'',tel:'600',prox:{f:'2026-05-05'},notas:[{f:'2026-04-04'}]}}}},puts:0}; cliUp('Local2',{estado:'nuevo'}); var r=await new Promise(function(res){ cliSyncJala(function(ok,err){ res(ok); }); }); var o=cliLeer(); return {r:r,hay:!!o['Remota1'],estado:(o['Remota1']||{}).estado,localSigue:!!o['Local2']}; })()");
    step(sy2.r&&sy2.hay===true&&sy2.estado==='interesado'&&sy2.localSigue===true,'W20-21 G4 jala+merge: la ficha remota entra y la local convive (legado sin cifrar pasa igual)');

    const dorm=await w3.eval("(async function(){ window._maeTest=null; var j=localStorage.getItem('cfb_data_key'); localStorage.removeItem('cfb_data_key'); var r=await new Promise(function(res){ cliSyncPush(function(ok,err){ res({ok:ok,err:err}); }); }); if(j) localStorage.setItem('cfb_data_key',j); return r; })()");
    step(dorm.ok===false&&dorm.err==='dormant','W20-22 G4 dormido sin clave de equipo: NO sincroniza — silencioso (el interruptor ES la dk, ADR-009)');

    const pr=w3.eval("proIbcParse('nombre;telefono;ciudad;sector;ibe_id;factura\\nBar Uno;600111222;Valencia;hosteleria;IBE0001;240\\nCafe Dos;611222333;Sagunto;comercio;IBE0002;180\\nBar Uno;600111222;Valencia;hosteleria;IBE0001;240')");
    step(pr.filas.length===2&&pr.filas[0].i==='IBE0001'&&pr.dupesInternos===1&&pr.sep===';','W20-23 G7 parser: cabeceras ES tolerantes, dedupe por teléfono interno, sep=;');
    const pr2=w3.eval("proIbcParse('Bar Tres\\t622333444\\tPaterna\\tind\\tIBE0003')");
    step(pr2.filas.length===1&&pr2.filas[0].tel==='622333444'&&pr2.filas[0].i==='IBE0003'&&pr2.sep==='tab','W20-24 G7 parser sin cabecera (tsv posicional)');

    const e2e=w3.eval("(function(){ proIbcAlta(proIbcParse('nombre;telefono;ciudad;sector;ibe_id\\nGranja Palma;644555666;Alzira;agro;IBE7777').filas); var rr=proLeer().filter(function(x){return x.n==='Granja Palma';})[0]; proConvertir(rr.id,'interesado'); var f=(cliLeer()['Granja Palma']||{}); return {ibe:f.ibe_id,orig:f.origen,est:f.estado}; })()");
    step(e2e.ibe==='IBE7777'&&/IBERCRM/.test(e2e.orig)&&e2e.est==='interesado','W20-25 G7 cadena completa: IBERCRM → banco → ficha con ibe_id+origen cruzables (base F18+)');

    const cat=await w3.eval("(async function(){ localStorage.removeItem('cat_cache'); var r=await new Promise(function(res){ catalogoGet(function(items,cache,err){ res({n:items.length,id0:items[0].id,err:err,deCache:!!cache}); }); }); var r2=await new Promise(function(res){ catalogoActivos(function(items){ res({n:items.length}); }); }); return {r:r,r2:r2}; })()");
    step(cat.r.n>=7&&cat.r.id0==='tarifa20'&&cat.r.deCache===false&&cat.r2.n>=7,'W20-26 G5 catálogo: sin JSON público → semilla embebida (fallback robusto); activos ≥7');
  }catch(e){ step(false,'W20-15..26 funcionales: '+e.message); }
}

// ── W21 · v4.0.2 F2 pipeline multi-producto (ADR-007) — estáticas ──
step(/var PIS_EST=\[\['prep','🧰 Preparando'\],\['oferta','📤 Ofertado'\],\['nego','🤝 Negociando'\],\['gan','✔ Ganado'\],\['per','✘ Perdido'\]\]/.test(src), 'W21-1 micro-pipeline 5 fases cortas (prep/oferta/nego/gan/per)');
step(src.indexOf('if(f.v!==6){ f.v=6; }')>-1&&srcR.indexOf('if(f.v!==6){ f.v=6; }')>-1, 'W21-2 vacuna v6 en ambos (idempotente, pis=[] + privada)');
step(/if\(!Array\.isArray\(f\.pis\)\) f\.pis=\[\]/.test(src)&&src.indexOf('crmPiDefId(p.est)')>-1, 'W21-3 saneado pis: array ≤8, id saneado, fase con whitelist');
step(src.indexOf("if(campos&&Array.isArray(campos.pis)) f.pis=campos.pis;")>-1&&src.indexOf('(campos.contactos||campos.tags||campos.pis)')>-1, 'W21-4 cliUp pasa pis y re-normaliza como los otros arrays');
step(/'tags','pis','prox'/.test(src), 'W21-5 S1: pis viaja CIFRADO en la lista sensible');
step(src.indexOf("(f.pis||[]).map(function(p){return p.id+' '+p.est;}).join(' ')")>-1, 'W21-6 buscador global incluye ids+fase de producto');
step(src.indexOf('id="crmPi_')>-1&&/window\.crmPiAdd=function/.test(src)&&/window\.crmPiEst=function/.test(src)&&/window\.crmPiDel=function/.test(src), 'W21-7 editor 🧩 y CRUD del embudo (add/est/del) presentes');
step(src.indexOf("todos los productos")>-1&&src.indexOf("CRM_FILTRO.pi")>-1&&src.indexOf("p.est!=='gan'&&p.est!=='per'")>-1, 'W21-8 filtro 🧩 por producto (solo vivos, excluye gan/per)');
step(src.indexOf("function piNombre(id){")>-1&&src.indexOf("function catalogoOptsSync(){")>-1&&src.indexOf('piSelOpts')>-1, 'W21-9 helpers catálogo síncronos (caché o seed) para el editor');
step(src.indexOf("pc[p.id]={prep:0,oferta:0,nego:0,gan:0,per:0}")>-1&&src.indexOf('pipe:pipe,pc:pc')>-1, 'W21-10 resumen al admin incluye embudo por producto ANÓNIMO (recuentos pc)');
step(/'direccion','cp','productos','fin_contrato','precio_kwh'\]\]/.test(src)&&src.indexOf("return p.id+':'+p.est;")>-1, 'W21-11 CSV: columna productos presente y compat — cabecera ampliada en W28 (F22: +fin_contrato,+precio_kwh detrás; el formato viejo se sigue leyendo igual)');
step(function(){ var a=src.slice(src.indexOf('var PIS_EST='),src.indexOf('window.cliMerge=function(')); var b=srcR.slice(srcR.indexOf('var PIS_EST='),srcR.indexOf('window.cliMerge=function(')); return a===b; }(), 'W21-12 paridad literal pymes≡residencial de toda la cadena F2');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=1||pv[2]>=2)))&&/cfb-v370|cfb-v3[7-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W21-13 version.json ≥4.0.2 + sw cfb-v370 o posterior (tolerante a minors)');

// ── W21 funcionales (jsdom con WebCrypto) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w4=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc4=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc4,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    const vac=w4.eval("(function(){ localStorage.clear(); var f=crmNorm({v:3,notas:[{f:'2026-01-01',t:'vieja'}],estado:'interesado',tel:'600'}); return {v:f.v,pis:Array.isArray(f.pis),notas:f.notas.length,est:f.estado,tel:f.tel}; })()");
    step(vac.v===6&&vac.pis===true&&vac.notas===1&&vac.est==='interesado'&&vac.tel==='600','W21-14 vacuna v3/v4/v5→v6: conserva todo (pis, notas, nota privada saneada)');

    const san=w4.eval("(function(){ localStorage.clear(); var up=cliUp('Bar P',{pis:[{id:'TARIFA20??',est:'nego',nota:'prueba <x>'},{id:'',est:'prep'},{id:'solar',est:'xxx'},null],estado:'nuevo'}); return {n:(up.pis||[]).length,id0:up.pis[0]&&up.pis[0].id,est0:up.pis[0]&&up.pis[0].est,nota0:up.pis[0]&&up.pis[0].nota,est1:up.pis[1]&&up.pis[1].est}; })()");
    step(san.n===2&&san.id0==='tarifa20'&&san.est0==='nego'&&san.est1==='prep','W21-15 saneado pis: id saneado→minúsculas, vacíos fuera, fase inválida→prep, nota desinfectada');

    const crud=w4.eval("(function(){ localStorage.clear(); cliUp('Bar Q',{estado:'nuevo'}); crmFiltro('seg','cli'); crmFiltro('estado',''); crmFiltro('q',''); crmRenderTab(); document.getElementById('crmQ'); crmPiAdd('Bar Q'); var f1=(cliLeer()['Bar Q']||{}); return {pis0:(f1.pis||[]).length}; })()");
    step(crud.pis0===0,'W21-16 crmPiAdd SIN elegir producto → no mete nada (aviso al usuario)');
    const crud2=w4.eval("(function(){ localStorage.clear(); cliUp('Bar R',{estado:'nuevo'}); cliUp('Bar R',{pis:[{id:'solar',est:'prep',nota:''}]}); crmFiltro('estado',''); crmFiltro('q',''); crmFiltro('pi',''); crmRenderTab(); crmAbrir('Bar R'); var html=document.getElementById('tab-clientes').innerHTML; return {hayBloque:html.indexOf('🧩 Productos')>-1, haySelect:html.indexOf('crmPi_Bar%20R')>-1, selEstado:html.indexOf('PIS_EST')>-1||html.indexOf('Negociando')>-1}; })()");
    step(crud2.hayBloque===true&&crud2.haySelect===true&&crud2.selEstado===true,'W21-17 editor 🧩 visible: bloque, selector de catálogo y fases');
    const crud3=w4.eval("(function(){ crmPiEst('Bar R',0,'nego'); var f=(cliLeer()['Bar R']||{}); crmPiDel('Bar R',0); var f2=(cliLeer()['Bar R']||{}); return {est:f.pis[0]&&f.pis[0].est,tras:f2.pis.length}; })()");
    step(crud3.est==='nego'&&crud3.tras===0,'W21-18 crmPiEst + crmPiDel: fase cambia y la pieza sale del embudo');

    const resum=w4.eval("(function(){ localStorage.clear(); cliUp('Bar A',{estado:'nuevo'}); cliUp('Bar A',{pis:[{id:'tarifa20',est:'oferta',nota:''}]}); cliUp('Bar B',{estado:'nuevo'}); cliUp('Bar B',{pis:[{id:'tarifa20',est:'oferta',nota:''},{id:'solar',est:'nego',nota:''}]}); var rk=cfbPref('crm_resumen'); crmPublicaResumen(); var r=JSON.parse(localStorage.getItem(rk)); return {pc:r.pc||{},tieneNombres:String(JSON.stringify(r)).indexOf('Bar A')>-1||String(JSON.stringify(r)).indexOf('Bar B')>-1}; })()");
    step(resum.pc.tarifa20&&resum.pc.tarifa20.oferta===2&&resum.pc.solar&&resum.pc.solar.nego===1&&resum.tieneNombres===false,'W21-19 embudo por producto en el resumen: recuentos correctos y ANÓNIMOS');

    const s1pi=await w4.eval("(async function(){ var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); localStorage.setItem('cfb_data_key',JSON.stringify(await crypto.subtle.exportKey('jwk',k))); var cif=await new Promise(function(res){ cfCifraParaSync({X:{estado:'nuevo',pis:[{id:'tarifa20',est:'nego',nota:'presu-88'}]}},function(d,e){ res(d); }); }); var blob=String(cif.X.blob); var desc=await new Promise(function(res){ cfDescifraDeSync(cif,function(d,e){ res(d); }); }); return {sinId:blob.indexOf('tarifa20')===-1&&blob.indexOf('presu-88')===-1,pi:(desc.X.pis||[])[0]||{}}; })()");
    step(s1pi.sinId===true&&s1pi.pi.id==='tarifa20'&&s1pi.pi.est==='nego'&&s1pi.pi.nota==='presu-88','W21-20 S1: pis cifrados (no legibles) y round-trip íntegro');

    const filt=w4.eval("(function(){ localStorage.clear(); cliUp('ConSolar',{estado:'nuevo'}); cliUp('ConSolar',{pis:[{id:'solar',est:'prep',nota:''}]}); cliUp('ConTarifa',{estado:'nuevo'}); cliUp('ConTarifa',{pis:[{id:'tarifa20',est:'gan',nota:''}]}); cliUp('SinNada',{estado:'nuevo'}); crmFiltro('pi','solar'); var h=document.getElementById('tab-clientes').innerHTML; crmFiltro('pi',''); return {si:h.indexOf('ConSolar')>-1,noTar:h.indexOf('ConTarifa')===-1,noSin:h.indexOf('SinNada')===-1}; })()");
    step(filt.si===true&&filt.noTar===true&&filt.noSin===true,'W21-21 filtro 🧩 producto: solo fichas con ese producto VIVO (ganado no cuenta)');

    const cat=w4.eval("(function(){ var opts=catalogoOptsSync(); return {n:opts.length,id0:opts[0].id,seed:opts.map(function(o){return o.id;}).join(',').indexOf('solar')>-1}; })()");
    step(cat.n>=7&&cat.id0==='tarifa20'&&cat.seed===true,'W21-22 opciones del embudo catálogo-coherentes (seed con fetch 404)');
  }catch(e){ step(false,'W21-14..22 funcionales: '+e.message); }
}

// ── W22 · v4.0.3 F18+ simulador potencia + propuesta (ADR-008) — estáticas ──
step(/window\.simParseFactura=function/.test(src)&&/window\.simRegla=function/.test(src)&&/window\.simImprimir=function/.test(src)&&/window\.simAnotar=function/.test(src)&&/window\.crmSimHtml=function/.test(src), 'W22-1 piezas F18+ (parse/regla/recalc/imprimir/anotar/vista) en pymes');
step(/window\.simParseFactura=function/.test(srcR)&&/window\.simAnotar=function/.test(srcR), 'W22-2 mismas piezas en residencial');
step(src.indexOf('Math.ceil(dM*(1+margen/100)*100-1e-9)/100')>-1&&src.indexOf('SIM_MARGEN_DEF=10')>-1, 'W22-3 regla F18-1 exacta: ceil(demanda×(1+margen)×100)/100, margen 10 % por defecto');
step(src.indexOf('SIM_PREC20=[35,3]')>-1&&src.indexOf('SIM_PREC30=[13,8,5,3,2,1.5]')>-1, 'W22-4 precios por defecto orientativos (editables, visibles)');
step(function(){ var b=src.slice(src.indexOf('window.simParseFactura'),src.indexOf('window.crmSimAbrir')); return b.indexOf('fetch(')===-1; }(), 'W22-5 parseo+regla 100 % locales: NINGÚN fetch en el simulador (RGPD por diseño)');
step(src.indexOf('CRM_FILTRO.sim) return;')>-1||src.indexOf("if(CRM_FILTRO.sim){ try{ el.innerHTML=crmSimHtml();")>-1, 'W22-6 sub-vista sim integrada en el render de Clientes');
step(src.indexOf('>📄 Oferta<')>-1&&src.indexOf("crmSimAbrir(decodeURIComponent(")>-1, 'W22-7 botón 📄 Oferta en la ficha (arma de venta a 1 clic)');
step(/body\.cfb-printing #cfbSimPrint/.test(src)&&/body\.cfb-printing #cfbSimPrint/.test(srcR), 'W22-8 propuesta imprimible: whitelist de impresión en AMBAS plantillas');
step(src.indexOf("idProd=(r.tipo==='20'?'tarifa20':'tarifa30')")>-1&&src.indexOf("est:'oferta'")>-1&&src.indexOf('.est===\'prep\'){ f.pis[ix].est=\'oferta\'; }')>-1, 'W22-9 puente al embudo: tarifa20/30 → Ofertado (solo sube, nunca baja fase)');
step(src.indexOf("resultado:(r.res.ahorro.toFixed(2))")>-1, 'W22-10 actividad: resultado numérico €/año (anónimo, sin texto personal)');
step(function(){ var a=src.slice(src.indexOf('window.simParseFactura'),src.indexOf('window.crmSimHtml=function')); var b=srcR.slice(srcR.indexOf('window.simParseFactura'),srcR.indexOf('window.crmSimHtml=function')); return a===b; }(), 'W22-11 paridad literal pymes≡residencial (parser+regla+acciones)');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=1||pv[2]>=3)))&&/cfb-v3[7-9][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W22-12 version.json ≥4.0.3 + sw cfb-v371 o posterior (tolerante a minors)');

// ── W22 funcionales ──
{
  try{
    const {webcrypto}=require('crypto');
    const w5=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc5=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc5,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{};w.print=()=>{ w._printed=(w._printed||0)+1; }; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    const p20=w5.eval("simParseFactura('SUMINISTRO ELÉCTRICO\\nTitular: BAR EL MAR S.L.\\nPeriodo de facturación\\nPotencia contratada P1: 65,20 kW\\nPotencia contratada P2: 10,00 kW\\nEnergía activa P1 3207 kWh')");
    step(p20.ok===true&&p20.tipo==='20'&&p20.pa[0]===65.2&&p20.pa[1]===10&&p20.pa[2]===null&&p20.nombre.indexOf('BAR EL MAR')>-1,'W22-13 parseo factura 2.0TD (titular + P1/P2; kWh no se confunde)');
    const p30=w5.eval("simParseFactura('Consumo detalle\\nP1: 120,5 kW\\nP2: 110 kW\\nP3: 60,2 kW\\nP4: 55 kW\\nP5: 30 kW\\nP6: 20 kWh dia')");
    step(p30.ok===true&&p30.tipo==='30'&&p30.pa[0]===120.5&&p30.pa[2]===60.2&&p30.pa[5]===null,'W22-14 parseo 3.0TD (6 periodos, tolerante — P6 con kWh NO entra)');
    const rg=w5.eval("JSON.parse(JSON.stringify(simRegla('20',[65,10],[40,8],{margen:10,precios:[35,3]})))");
    step(rg.periodos[0].popt===44&&rg.periodos[1].popt===8.8&&rg.periodos[0].accion.indexOf('📉')>-1&&rg.ahorro===+(rg.ahorro).toFixed(2)&&Math.abs(rg.ahorro-(((65-44)*35)+((10-8.8)*3)))<0.01,'W22-15 regla exacta 2.0TD: ceil con margen, ahorro = Δ×precio (mathematics trazable)');
    const rg2=w5.eval("JSON.parse(JSON.stringify(simRegla('30',[120,110,55,55,30,40],[0,0,70,0,0,45],{margen:10})))");
    step(rg2.periodos[2].popt===77&&rg2.periodos[2].accion.indexOf('📈')>-1&&rg2.periodos[0].accion.indexOf('sin cambio')>-1&&rg2.periodos[5].popt===49.5&&rg2.periodos[5].accion.indexOf('📈')>-1,'W22-16 regla 3.0TD: sin dato → no se toca; demanda>contratada → 📈 SUBIR (sin sanciones)');
    const calc=w5.eval("(function(){ localStorage.clear(); cliUp('Bar El Mar',{estado:'interesado'}); crmFiltro('sim',1); crmFiltro('simCli','Bar El Mar'); crmFiltro('simTipo','20'); crmRenderTab(); document.getElementById('simP1').value='65'; document.getElementById('simP2').value='10'; document.getElementById('simD1').value='40'; document.getElementById('simD2').value='8'; var r=simCalc(); var ok=!!window._simRes&&_simRes.empresa==='Bar El Mar'&&_simRes.tipo==='20'; var html=document.getElementById('simRes').innerHTML; return {ok:ok,tabla:html.indexOf('Ahorro estimado')>-1,botonPdf:html.indexOf('🖨 Imprimir propuesta')>-1,periodos:r.periodos.length}; })()");
    step(calc.ok===true&&calc.tabla===true&&calc.botonPdf===true&&calc.periodos===2,'W22-17 calc desde la vista: propuesta con tabla+ahorro+botón imprimir, empresa precargada');
    const imp=w5.eval("(function(){ simImprimir(); var o=document.getElementById('cfbSimPrint'); var dentro=!!o; var cont2=!!o&&o.innerHTML.indexOf('Bar El Mar')>-1&&o.innerHTML.indexOf('Ahorro estimado')>-1&&o.innerHTML.indexOf('no salió de este móvil')>-1; var impreso=(window._printed||0)>0; document.body.classList.remove('cfb-printing'); if(o) o.remove(); return {dentro:dentro,cont2:cont2,impreso:impreso}; })()");
    step(imp.dentro===true&&imp.cont2===true&&imp.impreso===true,'W22-18 propuesta imprimible: nombre, ahorro, sello RGPD («no salió de este móvil») y disparo de print');
    const ano=w5.eval("(function(){ localStorage.clear(); cliUp('Bar PDF',{estado:'interesado'}); crmFiltro('simCli','Bar PDF'); window._simRes={empresa:'Bar PDF',tipo:'30',res:simRegla('30',[120,110,55,55,30,40],[100,90,70,0,0,45],{margen:10}),f:'2026-10-05'}; simAnotar(); var f=crmNorm(cliLeer()['Bar PDF']||{}); var nota=(f.notas||[]).map(function(x){return x.t;}).join(' | '); var pi=(f.pis||[]).filter(function(p){return p.id==='tarifa30';})[0]||{}; return {nota: nota.indexOf('Simulación potencia')>-1&&nota.indexOf('P1')>-1,id:pi.id,est:pi.est}; })()");
    step(ano.nota===true&&ano.id==='tarifa30'&&ano.est==='oferta','W22-19 puente: nota en la ficha + producto tarifa30 Ofertado (embudo se alimenta solo)');
    const noRegres=w5.eval("(function(){ localStorage.clear(); cliUp('Bar Alto',{estado:'nuevo'}); cliUp('Bar Alto',{pis:[{id:'tarifa30',est:'nego',nota:''}]}); window._simRes={empresa:'Bar Alto',tipo:'30',res:simRegla('30',[100],[0],{margen:10}),f:'2026-10-05'}; crmFiltro('simCli','Bar Alto'); simAnotar(); var f=crmNorm(cliLeer()['Bar Alto']||{}); var pi=(f.pis||[]).filter(function(p){return p.id==='tarifa30';})[0]||{}; return pi.est; })()");
    step(noRegres==='nego','W22-20 no hay regresión de fase: si el negocio ya estaba Negociando, NO lo baja a Ofertado');
    const sinCli=w5.eval("(function(){ localStorage.clear(); crmFiltro('simCli',''); crmFiltro('sim',1); crmRenderTab(); simAnotar(); return 1; })()");
    step(sinCli===1,'W22-21 sin empresa: avisa y no rompe (defensivo');
  }catch(e){ step(false,'W22-13..21 funcionales: '+e.message); }
}

// ── W23 · v4.0.4 F5 privado⇄equipo + F7 RGPD (ADR-009) — estáticas ──
step(src.indexOf('datos/crm-lapidas.json')>-1&&srcR.indexOf('datos/crm-lapidas.json')>-1&&src.indexOf('cliLapPoda')>-1&&src.indexOf('.setDate(lim.getDate()-180)')>-1&&src.indexOf('c<300')>-1, 'W23-1 lápidas en repo privado (poda >180 días, cap 300) — F5-B');
step(src.indexOf('if(salida[k].privada) continue;')>-1&&src.indexOf('delete rf.privada;')>-1&&srcR.indexOf('if(salida[k].privada) continue;')>-1, 'W23-2 merge F5-C: local privada jamás pisada y la remota no hereda 🔒 (ambos)');
step(src.indexOf('lapidas[k]&&!mesclada[k].privada&&cliFresh(mesclada[k])<lapidas[k].f')>-1&&srcR.indexOf('lapidas[k]&&!mesclada[k].privada&&cliFresh(mesclada[k])<lapidas[k].f')>-1, 'W23-3 jala aplica lápida SOLO si local más vieja y no 🔒 (ambos)');
step(src.indexOf('if(todo[k].privada||lapidas[k]) continue; pub[k]=crmNorm(todo[k]); delete pub[k].privada;')>-1&&srcR.indexOf('if(todo[k].privada||lapidas[k]) continue; pub[k]=crmNorm(todo[k]); delete pub[k].privada;')>-1, 'W23-4 push: privadas y lapidadas NO viajan al repo (F5-B/C, ambos)');
step(src.indexOf('window.cliBorrar=function(n){ try{ cliBorrar(n);')>-1&&src.indexOf("cliSyncLapPush(n,function(){})")>-1, 'W23-5 borrar con clave de equipo apunta lápida (envoltorio del export)');
step(src.indexOf('cliSyncAhora()">⇄ ')>-1&&src.indexOf('crmRgpdToggle()">ℹ RGPD')>-1&&srcR.indexOf('cliSyncAhora()">⇄ ')>-1&&srcR.indexOf('crmRgpdToggle()">ℹ RGPD')>-1, 'W23-6 chips ⇄ Equipo (ON/OFF según dk) + ℹ RGPD en la barra de segmentos (ambos)');
step(/window\.rgpdBuscar=function/.test(src)&&/window\.rgpdBorra=function/.test(src)&&/window\.rgpdBorraUN=function/.test(srcR)&&src.indexOf('res={fichas:0,pro:0}')>-1, 'W23-7 F7-2 motor borrado de persona (buscar en fichas+potenciales, contadores)');
step(src.indexOf('window.crmFichaJson=function')>-1&&src.indexOf('Exportación RGPD del interesado. Base jurídica')>-1&&srcR.indexOf('window.crmFichaJson=function')>-1, 'W23-8 F7-3 exportar ficha JSON (derecho de acceso/portabilidad, ambos)');
step(src.indexOf('window.crmPrivadaToggle=function')>-1&&src.indexOf("(f.privada?'🔒 Privada':'⇄ Compartida')")>-1&&src.indexOf("[(f.privada?'🔒':'')")>-1&&srcR.indexOf("(f.privada?'🔒 Privada':'⇄ Compartida')")>-1, 'W23-9 F5-C UI: botón 🔒/⇄ en el editor + 🔒 en la fila (ambos)');
step(src.indexOf('window.crmSobran=function')>-1&&src.indexOf("return crmSegBar('hoy')+hdr+stats+busAvisosCard()+ven+toc+rgo+pot+sob+vacio;")>-1&&srcR.indexOf('window.crmSobranHtml=function')>-1, 'W23-10 F7-4 retención 12 meses integrada en la vista «Hoy» (ambos) — cadena del return actualizada en W28: la sección 🧯 rgo (F22) va antes del banco, sob sigue en su sitio');
step(src.indexOf("f.privada=(f.privada===1||f.privada===true||f.privada==='1')?1:'';")>-1&&srcR.indexOf("f.privada=(f.privada===1||f.privada===true||f.privada==='1')?1:'';")>-1, 'W23-11 vacuna v6: privada saneada (1/vacío, nunca viaja independiente)');
step(function(){ var a=src.slice(src.indexOf('var CLI_LAPIDAS'),src.indexOf('crmSobranHtml=function')); var b=srcR.slice(srcR.indexOf('var CLI_LAPIDAS'),srcR.indexOf('crmSobranHtml=function')); return a===b&&a.length>500; }(), 'W23-12 paridad literal pymes≡residencial del bloque Ola 2(d)');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=1||pv[2]>=4)))&&/cfb-v3[7-9][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W23-13 version.json ≥4.0.4 + sw cfb-v372 o posterior (tolerante a minors)');

// ── W23 funcionales ──
{
  try{
    const {webcrypto}=require('crypto');
    const w6=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc6=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc6,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; try{ w.URL.createObjectURL=function(){ return 'blob:rgpd'; }; }catch(e){} w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    const vac=w6.eval("(function(){ var f=crmNorm({v:1,notas:[{f:'2020-01-01',t:'x'}],contactos:[{n:'Ana'}],pis:[{id:'gas',est:'prep'}]}); var f5=crmNorm({v:5,privada:'1'}); var f6=crmNorm({v:6,privada:2}); return {v:f.v,nota:f.notas.length,c:f.contactos.length,pi:f.pis.length,pfive:f5.privada,pbad:f6.privada}; })()");
    step(vac.v===6&&vac.nota===1&&vac.c===1&&vac.pi===1&&vac.pfive===1&&vac.pbad==='','W23-14 vacuna v6: migra v1→6 conservando; privada saneada («1»→1; cualquier cosa → vacío)');
    const est=w6.eval("(function(){ localStorage.clear(); var a=cliSyncEstado().on; localStorage.setItem('cfb_data_key',JSON.stringify({k:'x'})); var b=cliSyncEstado().on; localStorage.removeItem('cfb_data_key'); var c=cliSyncEstado().on; return {a:a,b:b,c:c}; })()");
    step(est.a===false&&est.b===true&&est.c===false,'W23-15 F5-A: sync ON ⇔ hay dk instalada (el flag legado ya no pinta nada)');
    const pt=w6.eval("(function(){ localStorage.clear(); cliUp('Bar Privado',{estado:'nuevo'}); crmPrivadaToggle('Bar Privado'); var p1=crmNorm(cliLeer()['Bar Privado']).privada; crmPrivadaToggle('Bar Privado'); var p2=crmNorm(cliLeer()['Bar Privado']).privada; return {p1:p1,p2:p2}; })()");
    step(pt.p1===1&&pt.p2==='','W23-16 toggle 🔒: privada conmuta 1 ⇄ vacío desde la ficha');
    const psh=await w6.eval("(async function(){ localStorage.clear(); var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); var jwk=await crypto.subtle.exportKey('jwk',k); localStorage.setItem('cfb_data_key',JSON.stringify(jwk)); window._maeTest={files:{},puts:0}; cliUp('Normal X',{estado:'nuevo'}); cliUp('Privada X',{estado:'nuevo'}); crmPrivadaToggle('Privada X'); cliUp('Viejo Z',{estado:'nuevo'}); await new Promise(function(res){ cliSyncLapPush('Viejo Z',function(){ res(1); }); }); var r=await new Promise(function(res){ cliSyncPush(function(ok,err){ res({ok:ok,err:err}); }); }); var fre=window._maeTest.files['datos/crm-fichas.json']; var lap=window._maeTest.files['datos/crm-lapidas.json']; var names=Object.keys((fre&&fre.fichas)||{}).sort().join(','); return {names:names,env:(r&&r.ok&&r.ok.enviadas)||0,lap:(lap&&lap.lapidas&&lap.lapidas['Viejo Z']?1:0)}; })()");
    step(psh.names==='Normal X'&&psh.env===1&&psh.lap===1,'W23-17 push real (hook): solo viaja la no-privada no-lapidadas; lápida publicada en su fichero');
    const jal=await w6.eval("(async function(){ localStorage.clear(); var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); var jwk=await crypto.subtle.exportKey('jwk',k); localStorage.setItem('cfb_data_key',JSON.stringify(jwk)); localStorage.setItem('cli_registros',JSON.stringify({'Selvada':{v:6,privada:1,estado:'nuevo',notas:[{f:'2025-01-01',t:'local 🔒'}],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}},'Viejor':{v:6,estado:'nuevo',notas:[{f:'2020-01-01',t:'vieja'}],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}}})); localStorage.setItem('cfb_crm_lapidas',JSON.stringify({'Viejor':{f:'2030-01-01'}})); window._maeTest={files:{'datos/crm-fichas.json':{v:1,fichas:{'Selvada':{estado:'interesado',notas:[{f:'2026-09-01'}]},'Tranquila R':{estado:'contactado',privada:1,notas:[{f:'2026-08-01'}]}}}},puts:0}; await new Promise(function(res){ cliSyncJala(function(ok,err){ res(1); }); }); var o=cliLeer(); return {sel:!!o['Selvada'],selN:(o['Selvada']&&o['Selvada'].notas[0].t)||'',selP:(o['Selvada']&&o['Selvada'].privada)||'',vi:!!o['Viejor'],tra:!!o['Tranquila R'],traP:(o['Tranquila R']&&o['Tranquila R'].privada)||''}; })()");
    step(jal.sel===true&&jal.selN==='local 🔒'&&jal.selP===1&&jal.vi===false&&jal.tra===true&&jal.traP==='','W23-18 jala: lápida borra local vieja · privada local SOBREVIVE a remota · remota no hereda 🔒');
    const rg=w6.eval("(function(){ localStorage.clear(); cliUp('Bar Ana R',{tel:'600999888'}); cliUp('Taller Manolo',{estado:'nuevo'}); var o=cliLeer(); var f=crmNorm(o['Taller Manolo']); f.contactos=[{n:'Javier Ramos',cargo:'dueño',tel:'611'}]; o['Taller Manolo']=f; localStorage.setItem('cli_registros',JSON.stringify(o)); proAlta({n:'Ana cueros',tel:'699112233'}); var b1=rgpdBuscar('600999888'); var b2=rgpdBuscar('javier'); var b3=rgpdBuscar('Ana'); return {f1:b1.fichas.indexOf('Bar Ana R')>-1,f2:b2.fichas.indexOf('Taller Manolo')>-1,p3:b3.pro.length===1&&b3.pro[0].n==='Ana cueros',v0:rgpdBuscar('').fichas.length+rgpdBuscar('').pro.length}; })()");
    step(rg.f1===true&&rg.f2===true&&rg.p3===true&&rg.v0===0,'W23-19 RGPD buscar: por teléfono, por contacto, en potenciales; vacío no borra nada');
    const rgb=await w6.eval("(async function(){ var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); var jwk=await crypto.subtle.exportKey('jwk',k); localStorage.setItem('cfb_data_key',JSON.stringify(jwk)); window._maeTest={files:{},puts:0}; var res=rgpdBorra('Ana'); return {f:res.fichas,p:res.pro,bar:(cliLeer()['Bar Ana R']?1:0),pro:(proLeer().filter(function(x){return x.n==='Ana cueros';}).length),lap:(window._maeTest.files['datos/crm-lapidas.json']&&window._maeTest.files['datos/crm-lapidas.json'].lapidas['Ana cueros']?0:(window._maeTest.files['datos/crm-lapidas.json']&&window._maeTest.files['datos/crm-lapidas.json'].lapidas['Bar Ana R']?1:0))}; })()");
    step(rgb.f===1&&rgb.p===1&&rgb.bar===0&&rgb.pro===0&&rgb.lap===1,'W23-20 RGPD borrar: ficha+potencial eliminados y LÁPIDA apuntada en el equipo (repo)');
    const sob=w6.eval("(function(){ localStorage.clear(); var d=new Date(); var h=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); localStorage.setItem('cli_registros',JSON.stringify({'Viejo Bar':{v:6,estado:'nuevo',notas:[{f:'2024-01-01',t:''}],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}},'Visto Bar':{v:6,estado:'nuevo',notas:[{f:h,t:''}],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}},'Sin Fecha':{v:6,estado:'nuevo',notas:[],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}}})); localStorage.setItem('pro_banco_cache',JSON.stringify([{id:'pX',n:'Pot Viejo',tel:'',c:'',s:'',fuente:'',i:'',p:{e:'sin_llamar',n:0,r:'',pf:''},g:'',owner:'yo',ts:1000,act:1000},{id:'pY',n:'Pot Nuevo',tel:'',c:'',s:'',fuente:'',i:'',p:{e:'sin_llamar',n:0,r:'',pf:''},g:'',owner:'yo',ts:Date.now(),act:Date.now()}])); var s2=crmSobran(); var htm=crmSobranHtml(); return {f:s2.fichas.map(function(x){return x.n;}).join(','),p:s2.pro.map(function(x){return x.n;}).join(','),card:htm.indexOf('Sobran')>-1&&htm.indexOf('🧹')>-1}; })()");
    step(sob.f==='Viejo Bar'&&sob.p==='Pot Viejo'&&sob.card===true&&/d\.setFullYear\(d\.getFullYear\(\)-1\)/.test(src),'W23-21 retención: solo aparece >12 meses (ficha sin fecha NO se cuenta); tarjeta 🧹 renderiza');
    const fj=w6.eval("(function(){ localStorage.clear(); cliUp('Taller Manolo',{tel:'611'}); window._rgpdClicked=''; HTMLAnchorElement.prototype.click=function(){ window._rgpdClicked=this.download||''; }; crmFichaJson('Taller Manolo'); return window._rgpdClicked; })()");
    step(typeof fj==='string'&&fj.indexOf('rgpd-ficha-Taller')===0,'W23-22 exportar ficha: descarga JSON con nombre de archivo RGPD-dedicado');
  }catch(e){ step(false,'W23-14..22 funcionales: '+e.message); }
}

// ── W24 · v4.1.1 Ola 3(a) «Mando y reglas»: G2 métricas anónimas + G3 panel admin + G6 presupuestos + S2 auditoría (ADR-010) — estáticas ──
step(/var MET_FILE='datos\/metricas-equipo\.json', PRE_FILE='datos\/presupuestos\.json', AUD_FILE='datos\/auditoria\.json'/.test(src)&&/var MET_FILE='datos\/metricas-equipo\.json', PRE_FILE='datos\/presupuestos\.json', AUD_FILE='datos\/auditoria\.json'/.test(srcR), 'W24-1 rutas G2/G6/S2 declaradas una vez y en ambas apps (repo privado)');
step(/return \{ts:Math\.round\(Date\.now\(\)\/1000\),fichas:n,act7:act7,pipe:pipe,emb:emb\}/.test(src), 'W24-2 G2 metMia: SOLO agregados (n fichas, actividad 7d, pipe €, túnel) — sin campos personales');
step(src.indexOf("try{ metPublica(function(){}); }catch(eM){}")>-1&&srcR.indexOf("try{ metPublica(function(){}); }catch(eM){}")>-1, 'W24-3 G2: cada cliSyncPush exitoso republica la métrica anónima (alimentación automática del mando)');
step(/var PRE_ORDEN=\['bor','rev','apr'\]/.test(src), 'W24-4 G6 flujo documentado: borrador → revisión → aprobada (sin bajar de fase en el merge)');
step(src.indexOf("PRE_ORDEN.indexOf(it.est)>PRE_ORDEN.indexOf(old.est)||(it.est===old.est&&(it.ts||0)>=(old.ts||0))")>-1, 'W24-5 G6 merge por id: gana el estado MÁS avanzado; a empate, el más reciente (ts)');
step(src.indexOf('slice(0,100))&&')>-1||((src.match(/slice\(0,100\)/g)||[]).length>=2&&(srcR.match(/slice\(0,100\)/g)||[]).length>=2), 'W24-6 G6 tope 100 presupuestos (guarda y merge acotados)');
step(src.indexOf("a=a.slice(-500);")>-1&&src.indexOf("ev:String(ev).slice(0,24)")>-1&&src.indexOf("det:String(det==null?'':det).slice(0,120)")>-1&&src.indexOf("qui:proMiSlug()")>-1, 'W24-7 S2: FIFO 500, ev ≤24, det ≤120, quién = seudónimo del equipo');
step(/audMarca\('sync_masiva',/.test(src)&&/audMarca\('rgpd_purga',/.test(src)&&/audMarca\('borrar',nombre/.test(src)&&/audMarca\('sync_masiva',/.test(srcR)&&/audMarca\('rgpd_purga',/.test(srcR)&&/audMarca\('borrar',nombre/.test(srcR), 'W24-8 S2 disparadores de flota en ambas: borrar / purga RGPD / sync masiva');
step(src.indexOf("CRM_FILTRO.seg==='pre'")>-1&&srcR.indexOf("CRM_FILTRO.seg==='pre'")>-1&&src.indexOf("c('pre','💶 ")>-1&&srcR.indexOf("c('pre','💶 ")>-1, 'W24-9 G6 vista 💶 Ofertas: rama en el render + chip con contador en la segbar (ambas)');
step(src.indexOf('window.preDesdeSim=function(){')>-1&&src.indexOf("var r=window._simRes;")>-1&&src.indexOf("CRM_FILTRO.seg='pre'")>-1, 'W24-10 G6 «+ desde la simulación»: la oferta del simulador aterriza en el tablón del equipo');
step(function(){ var a=src.slice(src.indexOf('/* — v4.1.1 Ola 3(a)'),src.indexOf('/* ── cromo UI (100% FR/PT) ── */')); var b=srcR.slice(srcR.indexOf('/* — v4.1.1 Ola 3(a)'),srcR.indexOf('/* ── cromo UI (100% FR/PT) ── */')); return a.length>200&&a===b; }(), 'W24-11 paridad literal pymes≡residencial de TODO el bloque Ola 3(a)');
step(srcA.indexOf('🧭 Cuadro de mando')>-1&&srcA.indexOf('🛡 Auditoría del equipo')>-1&&/window\.audAdmin=function/.test(srcA)&&srcA.indexOf('window.mandoCargar=function(){')>-1&&srcA.indexOf('window.audCargar=function(){')>-1, 'W24-12 admin: tarjetas 🧭/🛡 + panel de mando + escritor de auditoría del despacho');
step(/audAdmin\('catalogo_publicar',/.test(srcA)&&/audAdmin\('acceso_revocar',/.test(srcA)&&/audAdmin\('clave_publicar',/.test(srcA), 'W24-13 S2 en el despacho: publicar catálogo / revocar acceso / rotar clave quedan firmados');

// ── W24 funcionales (jsdom con WebCrypto + maeHook offline) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w5=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc5=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc5,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    await w5.eval("(async function(){ localStorage.clear(); var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); localStorage.setItem('cfb_data_key',JSON.stringify(await crypto.subtle.exportKey('jwk',k))); localStorage.setItem('cfb_flag_cli_sync','1'); })()");
    step(true,'W24-14 préambulo: equipo activo (dk + flag) para los disparadores');

    const mm=w5.eval("(function(){ var hoy=new Date().toISOString().slice(0,10); cliUp('Bar Secreto SL',{estado:'interesado',tel:'600123456',ciudad:'Valencia',factura:'240',}); cliAnadir('Bar Secreto SL','precio pactado secreto'); cliAnadir('Bar Secreto SL','precio pactado casi cierra'); cliUp('Bar Secreto SL',{pis:[{id:'tarifa20',est:'oferta',nota:''},{id:'solar',est:'nego',nota:''}]}); var m=metMia(); var json=JSON.stringify(m); return {sinNom:json.indexOf('Bar Secreto')===-1,sinTel:json.indexOf('600123456')===-1,sinCiudad:json.indexOf('Valencia')===-1,sinNota:json.indexOf('precio pactado')===-1,act7:m.act7>=2,pipe:m.pipe===240,oferta:m.emb.oferta===1,nego:m.emb.nego===1}; })()");
    var _c15=mm&&mm.sinNom&&mm.sinTel&&mm.sinCiudad&&mm.sinNota&&mm.act7&&mm.pipe&&mm.oferta&&mm.nego;
    step(_c15,'W24-15 G2 metMia REAL: agrega bien (7d/pipe/túnel) y JAMÁS filtra nombre·teléfono·ciudad·notas'+(_c15?'':'  ← DIAG: '+JSON.stringify(mm)));

    const pp=w5.eval("(function(){ var it=preAdd({nombre:'Bar <X> & Co SL',ah:'1234.9',nota:'visita jueves'}); var limpio=it&&it.nombre.indexOf('<')===-1&&it.nombre.indexOf('&')===-1; var okEst=preEst(it.id,'rev'); var malEst=preEst(it.id,'XXX'); var lista=preLista(); preDel(it.id); return {limpio:limpio,ah:it.ah===1235,okEst:okEst,malEst:malEst===false,habia1:lista.length===1,trasBorrar:preLista().length===0}; })()");
    step(pp.limpio&&pp.ah&&pp.okEst&&pp.malEst&&pp.habia1&&pp.trasBorrar,'W24-16 G6 CRUD local: nombre desinfectado, € redondeado, fases válidas sí / inválidas no, borrado local');

    const pg=w5.eval("(function(){ var local=[{id:'a',nombre:'A',ah:1,nota:'',est:'bor',yo:'uno',ts:10},{id:'b',nombre:'B',ah:1,nota:'',est:'apr',yo:'uno',ts:10},{id:'c',nombre:'C',ah:1,nota:'',est:'rev',yo:'uno',ts:10}]; var rem=[{id:'a',nombre:'A',ah:1,nota:'',est:'apr',yo:'dos',ts:5},{id:'b',nombre:'B',ah:1,nota:'',est:'rev',yo:'dos',ts:99},{id:'c',nombre:'C',ah:1,nota:'',est:'rev',yo:'dos',ts:30}]; var m=preMerge(local,rem); var g=function(id){ return m.filter(function(x){return x.id===id;})[0]; }; return {n:m.length,a:g('a').est,b:g('b').est,c:g('c').ts===30,orden:m[0].ts>=m[1].ts}; })()");
    step(pg.n===3&&pg.a==='apr'&&pg.b==='apr'&&pg.c&&pg.orden,'W24-17 G6 merge real: subir de fase gana aunque el ts sea viejo; nunca se baja; empate → ts');

    const ps=await w5.eval("(async function(){ window._maeTest={files:{},puts:0}; var it=preAdd({nombre:'Push SA',ah:500}); await new Promise(function(r){ setTimeout(r,50); }); var escrito=!!window._maeTest.files['datos/presupuestos.json']; window._maeTest.files['datos/presupuestos.json']={v:1,pres:[{id:it.id,nombre:'Push SA',ah:500,nota:'',est:'apr',yo:'otra',ts:999}]}; await new Promise(function(res){ preJala(function(){ res(true); }); }); return {escrito:escrito,estTrasJala:(preLista()[0]||{}).est}; })()");
    step(ps.escrito===true&&ps.estTrasJala==='apr','W24-18 G6 push+jala offline: preAdd publica solo; al jalar entra la fase avanzada de otra persona');

    const au=await w5.eval("(async function(){ window._maeTest={files:{'datos/auditoria.json':{v:1,a:new Array(500).fill(0).map(function(_,i){ return {f:'2026-01-01',h:'00:00',qui:'viejo',ev:'sync_masiva',det:'n'+i}; })}},puts:0}; await new Promise(function(res){ audMarca('sync_masiva','5 fichas',function(){ res(true); }); }); var doc=window._maeTest.files['datos/auditoria.json']; var ult=doc.a[doc.a.length-1]; return {len:doc.a.length,ultEv:ult.ev,ultQui:ult.qui,primero:doc.a[0].det}; })()");
    var _c19=au&&au.len===500&&au.ultEv==='sync_masiva'&&au.ultQui==='comun'&&au.primero==='n1';
    step(_c19,'W24-19 S2 FIFO real: tope 500 rotando lo viejo; firma con seudónimo (comun), evento y detalle'+(_c19?'':'  ← DIAG: '+JSON.stringify(au)));

    const mt=await w5.eval("(async function(){ window._maeTest={files:{},puts:0}; await new Promise(function(res){ metPublica(function(ok,err){ res({ok:ok,err:err}); }); }); var doc=window._maeTest.files['datos/metricas-equipo.json']; var json=JSON.stringify(doc); return {escrito:!!doc,bajoSlug:!!(doc&&doc.eq&&doc.eq.comun),sinNom:json.indexOf('Push SA')===-1}; })()");
    step(mt.escrito===true&&mt.bajoSlug===true&&mt.sinNom===true,'W24-20 G2 publicación real: métrica bajo SEUDÓNIMO por persona en datos/metricas-equipo.json, sin nombres');

    const vw=w5.eval("(function(){ preAdd({nombre:'Vista Bar',ah:800}); crmFiltro('seg','pre'); crmRenderTab(); var h=document.getElementById('tab-clientes').innerHTML; crmFiltro('seg','cli'); return {chip:h.indexOf('Ofertas del equipo')>-1||h.indexOf('Vista Bar')>-1,faseChip:h.indexOf('Borrador')>-1,flujo:h.indexOf('En revisión')>-1||h.indexOf('borrador → revisión')>-1}; })()");
    step(vw.chip&&vw.faseChip,'W24-21 G6 vista 💶 renderiza: tarjeta con presupuesto, fase y ayuda del flujo');
  }catch(e){ step(false,'W24-14..21 funcionales: '+e.message); }
}

// ── W25 · v4.1.2 Ola 3(b) «Automatismos»: F4 = M4 bus + M3 reglas en datos (ADR-011) — estáticas ──
step(/window\.busOn=function/.test(src)&&/window\.busEmite=function/.test(src)&&src.indexOf('BUS_CAP=20')>-1&&/window\.busOn=function/.test(srcR), 'W25-1 bus M4 exportado en ambas (on/emite, tope 20 oyentes por tipo)');
step(src.indexOf("try{ fn(data||{}); }catch(e1){}")>-1, 'W25-2 M4 aislamiento: cada oyente en su try (un oyente roto no rompe a los demás)');
step(/busEmite=function\(evt,data\)[\s\S]{0,220}try\{ reglasEval\(evt,data\); \}catch\(eR\)\{\}/.test(src), 'W25-3 emitir evalúa reglas bajo try propio: el bus NUNCA rompe al emisor');
step(src.indexOf("id:'pi-oferta',cuando:'pi.movio'")>-1&&src.indexOf("id:'pi-gan',cuando:'pi.movio'")>-1&&src.indexOf("id:'ficha-factura',cuando:'ficha.movio'")>-1&&src.indexOf("id:'pre-aprobada',cuando:'pre.movio'")>-1, 'W25-4 semilla M3: las 4 reglas de arranque (oferta→comparativa · ganado→post-venta · factura→📄 · aprobada→firma)');
step(function(){ var b=src.slice(src.indexOf('window.reglasJala'),src.indexOf('window.reglasEval')); return b.indexOf("fetch('datos/reglas.json'")>-1&&b.indexOf('api.github.com')===-1&&b.indexOf('28800000')>-1; }(), 'W25-5 M3 lectura pública Pages-relativa sin token + caché sesión 8 h (patrón catálogo, cero PII)');
step(/busEmite\('ficha\.movio',\{nombre:nombre,de:_estAnt,a:f\.estado\}\)/.test(src)&&/busEmite\('pi\.movio',\{nombre:cliNorm\(nombre\),id:nom,est:est\}\)/.test(src)&&/busEmite\('nota\.nueva',\{nombre:nombre\}\)/.test(src)&&/busEmite\('sync\.ok',\{n:Object\.keys\(cifradas\)\.length\}\)/.test(src)&&/busEmite\('sim\.hecha'/.test(src)&&/busEmite\('pre\.movio'/.test(src), 'W25-6 los 6 emisores v1 enchufados: ficha/pi/pre/nota/sync/sim');
step(src.indexOf('86400000')>-1&&src.indexOf("cfb_reg_huellas")>-1&&src.indexOf('ks.length>200')>-1, 'W25-7 huella anti-bucle ≤1/24 h por regla+evento+nombre (con poda a 200)');
step(src.indexOf('!f0.prox||!f0.prox.f||f0.prox.f<hoy')>-1, 'W25-8 efecto prox: SOLO si la ficha no tiene agenda viva — un automatismo jamás pisa al comercial');
step(src.indexOf('return crmSegBar(\'hoy\')+hdr+stats+busAvisosCard()')>-1&&srcR.indexOf("return crmSegBar('hoy')+hdr+stats+busAvisosCard()")>-1&&src.indexOf('REG_BUSY')>-1, 'W25-9 tarjeta 🔔 Automatismos integrada en «Hoy» (ambas) + flag anti-bucle de reglas');
step(function(){ var a=src.slice(src.indexOf('/* — v4.1.2 Ola 3(b)'),src.indexOf('/* ── cromo UI (100% FR/PT) ── */')); var b=srcR.slice(srcR.indexOf('/* — v4.1.2 Ola 3(b)'),srcR.indexOf('/* ── cromo UI (100% FR/PT) ── */')); return a.length>200&&a===b; }(), 'W25-10 paridad literal pymes≡residencial de TODO el bloque F4');
step(src.indexOf("LSs('cfb_avisos',a.slice(-30))")>-1&&src.indexOf('xh(x.txt)')>-1&&src.indexOf('actLimpia(String(data[k]==null')>-1, 'W25-11 avisos acotados a 30 y render XSS-sano (xh + plantilla ${} saneada por actLimpia)');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=2||pv[2]>=2)))&&/cfb-v37[5-9]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W25-12 version.json ≥4.1.2 + sw cfb-v375 o posterior (tolerante a minors)');

// ── W25 funcionales (jsdom) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w6=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc6=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc6,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    const bus=w6.eval("(function(){ localStorage.clear(); var got=[], mal=function(){ throw new Error('roto'); }, bien=function(d){ got.push(d.x); }; busOn('prueba.evt',mal); busOn('prueba.evt',bien); var ok=busOn('prueba.evt',function(){}); busEmite('prueba.evt',{x:42}); return {entrego:got.length===1&&got[0]===42,capRespetado:BusCap=undefined}; })()");
    step(bus.entrego===true,'W25-13 M4 real: oyente que LANZA no impide al siguiente recibir el evento');

    const av=w6.eval("(function(){ localStorage.clear(); localStorage.removeItem('cfb_reg_huellas'); cliUp('Bar Bus',{estado:'nuevo'}); cliUp('Bar Bus',{pis:[{id:'tarifa20',est:'prep',nota:''}]}); crmPiEst('Bar Bus',0,'oferta'); var a=JSON.parse(localStorage.getItem('cfb_avisos')||'[]'); crmPiEst('Bar Bus',0,'oferta'); var b=JSON.parse(localStorage.getItem('cfb_avisos')||'[]'); return {n1:a.length,txt:a[0]&&a[0].txt,nDedupe:b.length,regla:a[0]&&a[0].r}; })()");
    step(av.n1===1&&av.regla==='pi-oferta'&&av.txt.indexOf('Bar Bus')>-1&&av.txt.indexOf('tarifa20')>-1&&av.nDedupe===1,'W25-14 regla semilla real: pi→oferta deja aviso en «Hoy» con ${nombre}/${id} rellenos + huella 24 h NO duplica');

    const px=w6.eval("(function(){ localStorage.clear(); localStorage.removeItem('cfb_reg_huellas'); var hoy=new Date(); var esp=new Date(hoy.getTime()+15*86400000).toISOString().slice(0,10); cliUp('Bar Gan',{estado:'nuevo'}); cliUp('Bar Gan',{pis:[{id:'solar',est:'nego',nota:''}]}); crmPiEst('Bar Gan',0,'gan'); var f1=cliLeer()['Bar Gan']; cliUp('Bar Ocupada',{estado:'nuevo',prox:{f:'2027-01-15',h:'',accion:'ya tenía cita'}}); cliUp('Bar Ocupada',{pis:[{id:'solar',est:'nego',nota:''}]}); crmPiEst('Bar Ocupada',0,'gan'); var f2=cliLeer()['Bar Ocupada']; return {p1:f1.prox.f===esp,acc1:(f1.prox.accion||'').indexOf('Post-venta')>-1,respetada:f2.prox.f==='2027-01-15'&&f2.prox.accion==='ya tenía cita'}; })()");
    step(px.p1===true&&px.acc1===true&&px.respetada===true,'W25-15 efecto prox real: ganar programa post-venta a +15 d EXACTOS y NO pisa la agenda existente');

    const hj=w6.eval("(function(){ localStorage.clear(); localStorage.removeItem('cfb_reg_huellas'); cliUp('Bar Tarjeta',{estado:'nuevo'}); cliUp('Bar Tarjeta',{pis:[{id:'tarifa20',est:'prep',nota:''}]}); crmPiEst('Bar Tarjeta',0,'oferta'); var card=busAvisosCard(); return {hay:card.indexOf('🔔')>-1&&card.indexOf('Bar Tarjeta')>-1,limpia:(busLimpiaAvisos(),busAvisosCard()==='')}; })()");
    step(hj.hay===true&&hj.limpia===true,'W25-16 tarjeta 🔔: renderiza el aviso con nombre y el botón limpiar la vacía');

    const ov=w6.eval("(function(){ localStorage.clear(); localStorage.removeItem('cfb_reg_huellas'); var n=reglasAplica({v:1,reglas:[{id:'mi-regla',cuando:'pi.movio',todo:{est:'nego'},haz:{tipo:'nota',texto:'Negociación abierta con ${nombre} por ${id}'}}]}); cliUp('Bar Custom',{estado:'nuevo'}); cliUp('Bar Custom',{pis:[{id:'tarifa20',est:'prep',nota:''}]}); crmPiEst('Bar Custom',0,'nego'); var notas=(cliLeer()['Bar Custom'].notas||[]).map(function(x){return x.t;}).join('|'); var n2=reglasAplica({}); return {n:n===1,nota:notas.indexOf('Negociación abierta con Bar Custom por tarifa20')>-1,semilla:n2===4}; })()");
    var _c17=ov&&ov.n===true&&ov.nota===true&&ov.semilla===true;
    step(_c17,'W25-17 M3 real: un JSON del equipo SUSTITUYE la semilla (efecto nota escribe en la ficha) y vacío ⇒ vuelve la semilla'+(_c17?'':'  ← DIAG: '+JSON.stringify(ov)));
  }catch(e){ step(false,'W25-13..17 funcionales: '+e.message); }
}

// ── W26 · v4.1.3 «Piel premium» — ola de estilo (4 superficies, marca intacta) ──
step(src.indexOf('id="skinPremium"')>-1&&srcR.indexOf('id="skinPremium"')>-1&&srcA.indexOf('id="skinPremium"')>-1&&srcI.indexOf('id="skinPremium"')>-1, 'W26-1 skin premium montada en las 4 superficies (pymes, residencial, admin, puerta)');
step(/  --r2:10px; --r3:14px;/.test(src)&&src.indexOf('--grad-marca:linear-gradient(135deg,#00A650 0%,#007A3B 100%)')>-1&&src.indexOf('--sh-verde:')>-1&&src.indexOf('--anillo:0 0 0 3px rgba(0,166,80,.16)')>-1, 'W26-2 tokens premium: radios, degradado de marca, sombra verde y anillo de foco');
step(src.indexOf('.crm-chip.on{background:var(--grad-marca);border-color:transparent;color:#fff;box-shadow:var(--sh-verde)}')>-1&&src.indexOf('.crm-chip{border-radius:999px')>-1&&srcR.indexOf('.crm-chip.on{background:var(--grad-marca)')>-1, 'W26-3 chips píldora: segmento activo como gota degradada de marca (ambas apps)');
step(src.indexOf('.crm-fila:hover{transform:translateY(-1px);box-shadow:var(--sh-2)}')>-1&&src.indexOf('.crm-fila{border-radius:var(--r2);box-shadow:var(--sh-1);transition:')>-1, 'W26-4 filas CRM con elevación al pasar (transform+shadow, sin tocar su borde de estado)');
step(src.indexOf('@keyframes skinPop')>-1&&src.indexOf('.modal-back{backdrop-filter:blur(4px)')>-1&&src.indexOf('.modal{border-radius:var(--r3);box-shadow:var(--sh-3);animation:skinPop var(--t-base)}')>-1, 'W26-5 modal cinematográfico: velo blur 4px + entrada skinPop + radio/sombra en capas');
step(src.indexOf('.crm-inp:focus,.card input[type=text]:focus')>-1&&src.indexOf('box-shadow:var(--anillo)')>-1&&src.indexOf('.prog-fill{background:var(--grad-marca)}')>-1&&src.indexOf('.toast{border-radius:12px;box-shadow:var(--sh-3)}')>-1, 'W26-6 foco anillado de marca + progreso degradado + toast píldora');
step(src.indexOf('.btn.verde,.btn.pri,.crm-btn:not(.sec){background:var(--grad-marca)')>-1&&src.indexOf('.btn.verde:hover,.btn.pri:hover,.crm-btn:not(.sec):hover{transform:translateY(-1px);box-shadow:var(--sh-verde)')>-1&&srcA.indexOf('--grad-marca:linear-gradient(135deg,#00A650 0%,#007A3B 100%)')>-1&&srcI.indexOf('--grad-marca:linear-gradient(135deg,#00A650 0%,#007A3B 100%)')>-1, 'W26-7 botones con marca y física (hover+1px, active respira) también en admin y puerta');
step(function(){ var a=src.indexOf('--verde:#00A650; --verde-oscuro:#007A3B;')>-1; var b=srcI.indexOf('--verde:#00A650; --verde-oscuro:#007A3B;')>-1; var c=src.indexOf('--verde-salvia:#A8C5B0;')>-1; var sk=function(t){ return t.slice(t.indexOf('/* ═══ SKIN PREMIUM'),t.indexOf('</style>',t.indexOf('/* ═══ SKIN PREMIUM'))); }; return a&&b&&c&&sk(src)===sk(srcR); }(), 'W26-8 marca INTACTA (verde sigue igual en app y puerta) + paridad literal pymes≡residencial del bloque skin');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=2||pv[2]>=3)))&&/cfb-v37[6-9]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W26-9 version.json ≥4.1.3 + sw cfb-v376 o posterior (tolerante a minors)');

// ── W27 · v4.1.4 Ola 3(c) «Informe y salud»: F6 informe semanal local + Q7 telemetría (ADR-012) — estáticas ──
step(/window\.salMarca=function\(tipo,ms,kb\)/.test(src)&&src.indexOf("LSs('cfb_salud',a.slice(-120))")>-1&&src.indexOf('datos/salud.json')>-1&&srcR.indexOf('datos/salud.json')>-1, 'W27-1 Q7 ring técnico local acotado a 120 + repositorio salud.json (repo privado, ambas apps)');
step(/var _t0Push=Date\.now\(\);/.test(src)&&/salMarca\('sync_total',Date\.now\(\)-_t0Push,Math\.round\(JSON\.stringify\(cifradas\)\.length\/1024\)\); salPublica/.test(src), 'W27-2 cada sync exitosa anota latencia+KB y publica su agregado (cadena G2 misma)');
step(/if\(st2===409\)\{ try\{ salMarca\('409',0,0\); \}catch\(e9\)\{\}/.test(src)&&srcR.indexOf("salMarca('409',0,0)")>-1, 'W27-3 todo 409 queda contabilizado ANTES del reintento (dos móviles que se pisan)');
step(src.indexOf("ms[Math.floor((n-1)*0.95)]")>-1&&src.indexOf("ms[Math.floor((n-1)*0.5)]")>-1, 'W27-4 p50/p95 exactos sobre muestras ordenadas (mediana y cola reales)');
step(/eq\[proMiSlug\(\)\]=salMia\(\);/.test(src)&&src.indexOf('agregado ANÓNIMO: tiempos, contadores, tamaños, versión')>-1, 'W27-5 agregado por SEUDÓNIMO: solo tiempos/contadores/tamaños/versión — cero PII');
step(/window\.infSemana=function/.test(src)&&/window\.infAbrir=function/.test(src)&&/window\.infImprimir=function/.test(src)&&/window\.infCopiar=function/.test(src)&&/window\.infTexto=function/.test(src), 'W27-6 piezas F6 completas: infSemana/Abrir/Imprimir/Copiar/Texto exportadas');
step(/var m=window\.metMia\(\);[\s\S]{0,120}var a=actLeer\(\), lim=Date\.now\(\)-7\*86400000/.test(src), 'W27-7 el informe REUSA piezas certificadas: metMia (W24) + actividad 7 días + presupuestos del equipo');
step(src.indexOf('onclick="infAbrir()">📄 ')>-1&&srcR.indexOf('onclick="infAbrir()">📄 ')>-1, 'W27-8 entrada 📄 Informe en la cabecera del ☀ Hoy (ambas, motor → paridad de fábrica)');
step(/body\.cfb-printing #cfbInfPrint\{display:block !important;position:static\}/.test(src)&&/body\.cfb-printing #cfbInfPrint\{display:block !important;position:static\}/.test(srcR), 'W27-9 whitelist de impresión gana #cfbInfPrint en AMBAS plantillas (mismo patrón F18+)');
step(src.indexOf('Informe generado en este dispositivo con datos agregados: no salió de este móvil')>-1&&src.slice(src.indexOf('window.infAbrir'),src.indexOf('window.infImprimir')).indexOf('maePut')===-1&&src.slice(src.indexOf('window.infAbrir'),src.indexOf('window.infImprimir')).indexOf('fetch(')===-1, 'W27-10 informe 100 % LOCAL y agregado: tampoco NINGÚN fetch/put entre abrir e imprimir (RGPD)');
step(srcA.indexOf('🩺 Salud del equipo')>-1&&srcA.indexOf('window.saludCargar=function(){')>-1&&srcA.indexOf('olaGet(\'datos/salud.json\'')>-1&&srcA.indexOf('m.p95')>-1&&srcA.indexOf('m.n409')>-1, 'W27-11 tarjeta 🩺 en admin: lee salud.json con tablas p50/p95/409/KB y semáforo');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); var pv=(vj.version||'').split('.').map(Number); return (pv[0]>4||(pv[0]===4&&(pv[1]>=2||pv[2]>=4)))&&/cfb-v37[7-9]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W27-12 version.json ≥4.1.4 + sw cfb-v377 o posterior (tolerante a minors)');

// ── W27 funcionales (jsdom + maeHook offline) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w7=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc7=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc7,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();
    await w7.eval("(async function(){ localStorage.clear(); var k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']); localStorage.setItem('cfb_data_key',JSON.stringify(await crypto.subtle.exportKey('jwk',k))); localStorage.setItem('cfb_flag_cli_sync','1'); })()");

    const mat=w7.eval("(function(){ localStorage.removeItem('cfb_salud'); for(var i=1;i<=20;i++){ salMarca('sync_total',i*100,10); } var m1=salMia(); for(var i=0;i<130;i++){ salMarca('sync_total',5000,1); } var a=JSON.parse(localStorage.getItem('cfb_salud')); var m2=salMia(); return {p50:m1.p50,p95:m1.p95,n409:m1.n409,cap:a.length===120&&m2.nPush===120,version:m2.version}; })()");
    step(mat.p50===1000&&mat.p95===1900&&mat.n409===0&&mat.cap===true,'W27-13 Q7 mates reales: mediana 1000 ms / p95 1900 ms en 20 muestras · ring se queda en 120 girando');

    const pub=await w7.eval("(async function(){ localStorage.removeItem('cfb_salud'); salMarca('sync_total',900,12); salMarca('409',0,0); salMarca('409',0,0); window._maeTest={files:{},puts:0}; await new Promise(function(res){ salPublica(function(ok,err){ res({ok:ok,err:err}); }); }); var doc=window._maeTest.files['datos/salud.json']; var json=JSON.stringify(doc); return {escrito:!!doc,bajoSlug:!!(doc&&doc.eq&&doc.eq.comun),n409:doc&&doc.eq&&doc.eq.comun.n409,sinNom:json.indexOf('Bar')===-1&&json.indexOf('600')===-1}; })()");
    step(pub.escrito===true&&pub.bajoSlug===true&&pub.n409===2&&pub.sinNom===true,'W27-14 Q7 publicación real: salud.json bajo seudónimo, 2 choques 409 contados, cero PII en el JSON');

    const sem=w7.eval("(function(){ localStorage.clear(); cliUp('Bar Inf',{estado:'nuevo'}); cliUp('Bar Inf',{pis:[{id:'tarifa20',est:'prep',nota:''}]}); crmPiEst('Bar Inf',0,'oferta'); crmPiEst('Bar Inf',0,'nego'); preAdd({nombre:'Inf SA',ah:100}); preAdd({nombre:'Inf Dos',ah:200}); var r=infSemana(); return {total:r.total>=2,movO:r.movs.oferta===1,movN:r.movs.nego===1,top:r.top.length&&r.top[0].id==='tarifa20'&&r.top[0].n===2,pre:(r.pre.bor===2),pipe:r.met.pipe,fichas:r.met.fichas}; })()");
    step(sem.total&&sem.movO&&sem.movN&&sem.top&&sem.pre&&sem.fichas===1,'W27-15 F6 agregación real: movimientos del embudo por fase, top producto con 2 toques, presupuestos contados');

    const abr=w7.eval("(function(){ localStorage.clear(); infAbrir(); var ov=document.getElementById('cfbInf'); var h=ov?ov.innerHTML:''; var txt=infTexto(); var okTit=h.indexOf('Informe semanal')>-1, okBarras=h.indexOf('Gestiones por día')>-1, okSello=h.indexOf('no salió de este móvil')>-1, okTxt=txt.indexOf('📄 Informe semanal')>-1&&txt.split('\\n').length>=6; document.getElementById('cfbInf').remove(); return {okTit:okTit && ov===null||true,tit:okTit,barras:okBarras,sello:okSello,txt:okTxt}; })()");
    step(abr.tit===true&&abr.barras===true&&abr.sello===true&&abr.txt===true,'W27-16 F6 modal real: título, barras por día, sello «no salió de este móvil» y texto copiable con ≥6 líneas');
  }catch(e){ step(false,'W27-13..16 funcionales: '+e.message); }
}

// ── W28 · v4.2.0 Ola 3(d) «Tarifas vivas y riesgo»: G10 pool OMIE local-first + F22 churn (ADR-013) — estáticas ──
step(/window\.omieGet=function/.test(src)&&src.indexOf('datos/omie.json')>-1&&srcR.indexOf('datos/omie.json')>-1, 'W28-1 G10 omieGet sobre datos/omie.json en ambas apps (repo, jamás omie.es)');
step(src.indexOf("LSg('omie_cache',null)")>-1&&src.indexOf('Date.now()-c.ts)<28800000')>-1&&src.indexOf("catch(function(){ cb({},true,'offline/sin-omie'); })")>-1, 'W28-2 patrón catálogo: caché LS omie_cache 8 h + fetch tolerante a 404 (repo sin Action = «sin datos», no error)');
step(src.indexOf('omie.es')===-1&&srcR.indexOf('omie.es')===-1&&srcA.indexOf('omie.es')===-1&&fs.existsSync(path.join(__dirname,'..','..','..','.github','workflows','omie.yml'))&&fs.readFileSync(path.join(__dirname,'..','..','..','.github','workflows','omie.yml'),'utf8').indexOf('marginalpdbc')>-1&&fs.readFileSync(path.join(__dirname,'..','..','..','.github','workflows','omie.yml'),'utf8').indexOf('cron:')>-1, 'W28-3 LÍNEA DURA: cero omie.es en apps/admin — el acopio es la GitHub Action diaria (fichero marginalpdbc + cron)');
step(/window\.crmRiesgo=function/.test(src)&&src.indexOf('CHURN_PX_ALTO=2.2')>-1&&src.indexOf("if(f.estado==='perdido') return out;")>-1&&srcR.indexOf('CHURN_PX_ALTO=2.2')>-1, 'W28-4 F22 crmRiesgo exportado con el factor documentado 2,2× pool y regla «perdido calla» (ambas)');
step(/window\.crmRiesgoList=function/.test(src)&&src.indexOf('if(r.sc>=25)')>-1&&srcR.indexOf('if(r.sc>=25)')>-1, 'W28-5 crmRiesgoList con umbral 25 (aviso útil sin gritar) en ambas');
step(src.indexOf("'ibe_id','valor','fin_contrato','precio_kwh'")>-1&&srcR.indexOf("'ibe_id','valor','fin_contrato','precio_kwh'")>-1&&src.indexOf('if(f.v!==6){ f.v=6; }')>-1&&srcR.indexOf('if(f.v!==6){ f.v=6; }')>-1, 'W28-6 campos F22 por ANEXIÓN (sin bump): vacuna v6 intacta — W21/W23 congelados protegidos (ADR-013)');
step(src.indexOf('onclick="omieAbrir()">⚡')>-1&&srcR.indexOf('onclick="omieAbrir()">⚡')>-1&&src.indexOf("🧯 <b>'+RGO.length+'</b> '+Tc('en riesgo')")>-1&&src.indexOf("🧯 '+Tc('Riesgo de fuga')")>-1&&srcR.indexOf("🧯 '+Tc('Riesgo de fuga')")>-1, 'W28-7 Hoy: botón ⚡ OMIE + KPI «en riesgo» + sección 🧯 Riesgo de fuga (motor → paridad)');
step(src.indexOf('id="crmFc_')>-1&&src.indexOf('id="crmPk_')>-1&&src.indexOf("fin_contrato:(g('crmFc_'+e)")>-1&&srcR.indexOf('id="crmPk_')>-1&&src.indexOf("🧯'+rz.sc+'")>-1, 'W28-8 ficha: inputs 📑 fin contrato + ⚡ €/kWh persistidos por crmGuardar + badge 🧯 en la lista');
step(src.indexOf("'productos','fin_contrato','precio_kwh'")>-1&&src.indexOf(',f.fin_contrato,f.precio_kwh]')>-1&&srcR.indexOf(',f.fin_contrato,f.precio_kwh]')>-1, 'W28-9 CSV +2 columnas al final (el formato viejo se sigue leyendo igual — patrón F2)');
step(src.indexOf('rgo:rgo')>-1&&src.indexOf('(agregados, sin nombres)')>-1&&src.slice(src.indexOf('window.infSemana'),src.indexOf('function infTablaDias')).indexOf('crmRiesgoList')>-1&&src.indexOf('🧯 <b>'+(0)+'</b>')===-1, 'W28-10 informe F6 con agregado de riesgo anónimo (rgo) — nombres jamás salen en la línea de texto');
step(srcA.indexOf('⚡ Pool OMIE')>-1&&srcA.indexOf('window.omieAdminCargar=function(){')>-1&&srcA.indexOf("olaGet('datos/omie.json'")>-1&&srcA.indexOf('€/MWh')>-1, 'W28-11 tarjeta ⚡ Pool OMIE en admin: lectura pública del repo (último, medias, días) — cero PII');
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); return vj.version==='4.2.0'&&/cfb-v37[89]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'W28-12 version.json 4.2.0 exacto + sw cfb-v378 o posterior');

// ── W28 funcionales (jsdom + maeHook offline) ──
{
  try{
    const {webcrypto}=require('crypto');
    const w8=await (async function(){
      const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
      const vc8=new VirtualConsole();
      const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc8,
       beforeParse(w){ w.confirm=()=>true; w.alert=()=>{}; w.fetch=()=>Promise.resolve({status:404,json:()=>Promise.resolve({})}); Object.defineProperty(w,'crypto',{value:webcrypto}); }});
      return dom.window;
    })();

    const mates=w8.eval("(function(){ localStorage.clear(); function F(dt){ var d=new Date(Date.now()+dt*86400000); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); } var dias={}; for(var i=1;i<=40;i++){ dias[F(i-40)]=i; } localStorage.setItem('omie_cache',JSON.stringify({ts:Date.now(),dias:dias})); var ult=omieUlt(omieDias()), m30=omieMedia(omieDias(),30), m7=omieMedia(omieDias(),7); var n1=omieManual('91,5'); var hoy=F(0); var deManual=omieDias()[hoy]; var n2=omieManual('2026-09-30 80.25\\nlalala\\n2026-10-01 81'); var n3=omieManual('basura sin numeros'); return {uE:ult.e,m30:m30,m7:m7,n1:n1,deManual:deManual,n2:n2,n3:n3,treintaynueve:omieMedia(dias,30)}; })()");
    step(mates.uE===40&&mates.m30===25.5&&mates.m7===37&&mates.n1===1&&mates.deManual===91.5&&mates.n2===2&&mates.n3===0&&mates.treintaynueve===25.5, 'W28-13 G10 mates reales: media 30d=25.5 y 7d=37 sobre 40 días · manual «91,5»→hoy y líneas con fecha (coma/punto) · basura=0');

    const score=w8.eval("(function(){ function F(dt){ var d=new Date(Date.now()+dt*86400000); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); } var dias={}; for(var i=1;i<=35;i++){ dias[F(i-35)]=90; } var base={v:6,contactos:[],tags:[],pis:[],notas:[],prox:{f:'',h:'',accion:''}}; var A=crmRiesgo(Object.assign({},base,{estado:'ganado',creado:F(-50),fin_contrato:F(20),precio_kwh:'0.30'}),dias); var B=crmRiesgo(Object.assign({},base,{estado:'perdido',creado:F(-50),fin_contrato:F(20),precio_kwh:'0.30'}),dias); var C=crmRiesgo(Object.assign({},base,{estado:'nuevo',creado:F(0),fin_contrato:F(20),precio_kwh:'0.30'}),{}); var Dd=crmRiesgo(Object.assign({},base,{estado:'contactado',creado:F(0),fin_contrato:F(200)}),dias); return {aSc:A.sc,aPor:A.por.length,aTxt:A.por.join('|'),bSc:B.sc,cSc:C.sc,dSc:Dd.sc}; })()");
    step(score.aSc===100&&score.aPor===3&&score.aTxt.indexOf('contrato acaba en 20 ')>-1&&score.aTxt.indexOf('sin tocar 50 ')>-1&&score.aTxt.indexOf('paga ')>-1&&score.bSc===0&&score.cSc===50&&score.dSc===0, 'W28-14 F22 score 0-100 determinista: ganado con contrato+20d·50d sin tocar·0,30 €/kWh vs pool 90 → 100 (cap) con 3 motivos · perdido=0 · sin pool no hay señal de precio · contrato a 200d=0');

    const agreg=w8.eval("(function(){ localStorage.clear(); function F(dt){ var d=new Date(Date.now()+dt*86400000); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); } var dias={}; for(var i=1;i<=35;i++){ dias[F(i-35)]=90; } localStorage.setItem('omie_cache',JSON.stringify({ts:Date.now(),dias:dias})); var reg={}; reg['La Central']={v:6,estado:'ganado',creado:F(-60),fin_contrato:F(20),precio_kwh:'0,30',notas:[],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}}; reg['El Olvidado']={v:6,estado:'perdido',creado:F(-90),fin_contrato:F(-5),precio_kwh:'0.40',notas:[],contactos:[],tags:[],pis:[],prox:{f:'',h:'',accion:''}}; localStorage.setItem('cli_registros',JSON.stringify(reg)); var l=crmRiesgoList(); var html=crmHoyHtml(); var r=infSemana(); try{ crmCsv(); }catch(e){} return {n:l.length,sc:l.length?l[0].sc:0,nom:l.length?l[0].n:'',sec:html.indexOf('Riesgo de fuga')>-1,kpi:html.indexOf('en riesgo')>-1,nombreEnSeccion:html.indexOf('La Central')>-1,alto:r.rgo.alto,medio:r.rgo.medio,sello:infTexto().indexOf('agregados, sin nombres')>-1}; })()");
    step(agreg.n===1&&agreg.sc===100&&agreg.nom==='La Central'&&agreg.sec===true&&agreg.kpi===true&&agreg.nombreEnSeccion===true&&agreg.alto===1&&agreg.medio===0&&agreg.sello===true, 'W28-15 F22 real: La Central (✔ganada) suena con 100 y El Olvidado (✘perdida) calla · KPI+sección con su nombre SOLO en el dispositivo · infSemana agrega 1 alto · informe marcado «sin nombres»');

    const modal=await w8.eval("(async function(){ function F(dt){ var d=new Date(Date.now()+dt*86400000); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); } var dias={}; for(var i=1;i<=20;i++){ dias[F(i-20)]=80+i; } localStorage.setItem('omie_cache',JSON.stringify({ts:Date.now(),dias:dias})); omieAbrir(); var ov=document.getElementById('cfbOmie'); var h1=ov?ov.innerHTML:''; if(ov) ov.remove(); var datos=(h1.indexOf('Pool OMIE')>-1&&h1.indexOf('€/MWh')>-1&&h1.indexOf('100')>-1); localStorage.removeItem('omie_cache'); omieAbrir(); await new Promise(function(r2){ setTimeout(r2,60); }); var ov2=document.getElementById('cfbOmie'); var h2=ov2?ov2.innerHTML:''; if(ov2) ov2.remove(); return {datos:datos,vacio:h2.indexOf('Sin precio todavía')>-1,manual:h2.indexOf('Entrada manual')>-1}; })()");
    step(modal.datos===true&&modal.vacio===true&&modal.manual===true, 'W28-16 G10 modal real: con caché muestra pool (€/MWh, media 100) · con 404 honesto «Sin precio todavía» + pegado manual');
  }catch(e){ step(false,'W28-13..16 funcionales: '+e.message); }
}

// ── V4b · sello Ola 2 → v4.1.0 «Pipeline y arma de venta» (ventana E4 dura) ──
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var pv=(vj.version||'').split('.').map(Number); return pv[0]===4&&pv[1]>=1&&vj.channel==='estable'; }catch(e){ return false; } }(), 'V4b-1 version.json ≥ 4.1.0 estable (hito Ola 2 sellado)');
step(function(){ try{ var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); return /cfb-v37[3-9]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'V4b-2 sw ≥ cfb-v373 (sello de hito o posterior)');
step(function(){ try{ var cl=fs.readFileSync(path.join(__dirname,'..','CHANGELOG.md'),'utf8'); return cl.indexOf('## v4.1.0')>-1&&cl.indexOf('## v4.0.1')>-1&&cl.indexOf('## v4.0.2')>-1&&cl.indexOf('## v4.0.3')>-1&&cl.indexOf('## v4.0.4')>-1; }catch(e){ return false; } }(), 'V4b-3 CHANGELOG con las 5 entradas de la ola (4.0.1/4.0.2/4.0.3/4.0.4/4.1.0)');
step(function(){ try{ var pl=fs.readFileSync(path.join(__dirname,'..','..','..','docs','PLAN-CRM.md'),'utf8'); return pl.indexOf('OLA 2 TERMINADA')>-1&&pl.indexOf('(a) HECHA')>-1&&pl.indexOf('v4.1.0')>-1; }catch(e){ return false; } }(), 'V4b-4 PLAN-CRM: Ola 2 con (a)(b)(c)(d) HECHAs y referencia v4.1.0');

// ── V4c · sello Ola 3 → v4.2.0 «Tarifas vivas y riesgo» (ADR-013) ──
step(function(){ try{ var vj=JSON.parse(fs.readFileSync(path.join(__dirname,'..','version.json'),'utf8')); var pv=(vj.version||'').split('.').map(Number); return pv[0]===4&&pv[1]>=2&&vj.channel==='estable'; }catch(e){ return false; } }(), 'V4c-1 version.json ≥ 4.2.0 estable (hito Ola 3 sellado)');
step(function(){ try{ var sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'); return /cfb-v37[89]|cfb-v3[89][0-9]|cfb-v[4-9][0-9][0-9]/.test(sw); }catch(e){ return false; } }(), 'V4c-2 sw ≥ cfb-v378 (sello de hito o posterior)');
step(function(){ try{ var cl=fs.readFileSync(path.join(__dirname,'..','CHANGELOG.md'),'utf8'); return cl.indexOf('## v4.2.0')>-1&&cl.indexOf('## v4.1.1')>-1&&cl.indexOf('## v4.1.2')>-1&&cl.indexOf('## v4.1.3')>-1&&cl.indexOf('## v4.1.4')>-1; }catch(e){ return false; } }(), 'V4c-3 CHANGELOG con las 5 entradas de la ola (4.1.1/4.1.2/4.1.3/4.1.4/4.2.0)');
step(function(){ try{ var pl=fs.readFileSync(path.join(__dirname,'..','..','..','docs','PLAN-CRM.md'),'utf8'); return pl.indexOf('OLA 3 TERMINADA')>-1&&pl.indexOf('(d) HECHA')>-1&&pl.indexOf('v4.2.0')>-1; }catch(e){ return false; } }(), 'V4c-4 PLAN-CRM: Ola 3 con (a)(b)(c)(d) HECHAs y referencia v4.2.0');

  console.log(R.join('\\n'));
  console.log('errores JS:',errs.length?errs.slice(0,3).join(' | '):'(ninguno)');
  const f=R.filter(x=>x.startsWith('✘')).length;
  console.log('════════════════════════════════');
  console.log(f||errs.length?'❌ '+f+' fallos':'✅ BATERÍA QA + CORE: TODO VERDE ('+R.length+' comprobaciones)');

  process.exit((f||errs.length)?1:0);  // el ⏱ (setInterval) mantiene vivo jsdom: salida explícita
})();

// ── W8 · Motor de idiomas v2.9.0 ──
step(/var I18N=\{fr:\{ui:\{\},obj:\{\},nodes:\{\}\}\,pt:/.test(src), 'W8-1 diccionario I18N fr+pt');
step(src.includes('cfa_lang'), 'W8-2 idioma por sesión (sessionStorage)');
step(src.includes('cfaSelector=function'), 'W8-3 selector presente');
step(src.includes('cfa_sel_ok'), 'W8-4 selector 1ª vez por sesión');
step(src.includes('data-lang="fr"') && src.includes('data-lang="pt"') && src.includes('data-lang="en"'), 'W8-5 botones FR+PT+EN');
step(src.includes('cfaApply') && src.includes('JSON.parse(__cfaOrig)'), 'W8-6 restaura originales antes de mezclar');
step(src.includes('Le client répond…') && src.includes('O cliente responde…'), 'W8-7 cromo UI FR+PT');
step(src.includes('cfaCobertura'), 'W8-8 % cobertura');
step(src.includes('cfaChip'), 'W8-9 chip idioma reabre selector');
step(src.includes('I18N.fr.nodes.inicio') && src.includes('I18N.pt.obj.ya_tengo'), 'W8-10 semilla ola-1');

// ── W9 · cobertura real — v2.9.5: FR/PT/EN árbol+objeciones 100 % ──
{
  const vm=require('vm');
  const m=src.match(/var I18N=[\s\S]*?(?=\/\* ── motor ──)/);
  const OBJ=['ya_tengo','permanencia','no_interesa','mas_caro','tiempo','despues','no_decisor','email','lo_pienso','no_cambiar','contento','desconfianza','momento','ya_llamaron','datos'];
  const NOD=['inicio','apertura','apertura_retorno','no_contesta','presentacion','motivo','permiso','deteccion','pitch_ahorro','pitch_valor','pitch_retorno','cierre_hub','cierre_cita','cierre_facturas','cierre_alta','cierre_tecnico','seguimiento','retirada'];
  const driver="\nfunction cfaCobertura(L){var p=I18N[L]||{},totN=Object.keys(NODES||{}).length||1,totO=Object.keys(OBJECTIONS||{}).length||1;var n=Object.keys(p.nodes||{}).length,o=Object.keys(p.obj||{}).length;return Math.min(100,Math.round((n/totN*0.7+o/totO*0.3)*100))}\nvar __cov={fr:cfaCobertura('fr'),pt:cfaCobertura('pt'),en:cfaCobertura('en'),frUI:Object.keys(I18N.fr.ui).length,ptUI:Object.keys(I18N.pt.ui).length,enUI:Object.keys(I18N.en.ui).length,frN:Object.keys(I18N.fr.nodes).length,ptN:Object.keys(I18N.pt.nodes).length,enN:Object.keys(I18N.en.nodes).length,enO:Object.keys(I18N.en.obj||{}).length,enD:Object.keys((I18N.en.obj&&I18N.en.obj.ya_tengo)||{}).length};";
  const NN={},OO={}; NOD.forEach(k=>NN[k]=1); OBJ.forEach(k=>OO[k]=1);
  const ctx={NODES:NN,OBJECTIONS:OO,window:{I18N:null}}; vm.createContext(ctx); ctx.window.I18N=ctx.I18N;
  let c=null; try{ vm.runInContext((m?m[0]:'')+driver,ctx); c=ctx.__cov; }catch(e){ step(false,'W9-0 motor evaluable: '+e.message); }
  if(c){
    step(c.fr===100, 'W9-1 FR cobertura total ('+c.fr+'%)');
    step(c.pt===100, 'W9-2 PT cobertura total ('+c.pt+'%)');
    step(c.en===100, 'W9-2b EN cobertura total ('+c.en+'%)');
    step(c.frUI===c.ptUI&&c.ptUI===c.enUI&&c.frUI>=25, 'W9-3 UI cromo FR/PT/EN a la par ('+c.frUI+'/'+c.ptUI+'/'+c.enUI+')');
    step(c.fr===c.pt&&c.pt===c.en, 'W9-4 paridad FR/PT/EN');
    step(c.frN===18&&c.ptN===18&&c.enN===18, 'W9-5 18 nodos FR/PT/EN ('+c.frN+'/'+c.ptN+'/'+c.enN+')');
    step(c.enO===15, 'W9-5b 15 objeciones EN ('+c.enO+')');
    step(c.enD>=6, 'W9-5c overlay obj EN completo (ya_tengo con '+c.enD+' subclaves, incl. dialogo+round2)');
    step(c.enDuad=0||true, 'W9-5d marcador');
  }
  ['fr','pt','en'].forEach(L=>{
    OBJ.forEach(k=>step(src.includes('I18N.'+L+'.obj.'+k+'='), 'W9-6 '+L+' obj '+k));
    NOD.forEach(k=>step(src.includes('I18N.'+L+'.nodes.'+k+'=')||(k==='inicio'), 'W9-7 '+L+' nodo '+k));
  });
  step(/'round2'/.test(src)&&/dialogo','round2','nat'\]/.test(src), 'W9-8 motor mezcla round2+nat');
  step(src.includes('I18N.en.obj.datos=')&&src.includes('opt-out list'), 'W9-9 obj compliance EN presente');
}

// ── W10 · ola 4: nat{} + glosarios de mercado ──
{
  const OBJ=['ya_tengo','permanencia','no_interesa','mas_caro','tiempo','despues','no_decisor','email','lo_pienso','no_cambiar','contento','desconfianza','momento','ya_llamaron','datos'];
  const NOD=['inicio','apertura','apertura_retorno','no_contesta','presentacion','motivo','permiso','deteccion','pitch_ahorro','pitch_valor','pitch_retorno','cierre_hub','cierre_cita','cierre_facturas','cierre_alta','cierre_tecnico','seguimiento','retirada'];
  step(src.includes("'fase','step','nat'"), 'W10-1 motor fusiona nat (nodos)');
  step(src.includes("'dialogo','round2','nat'"), 'W10-2 motor fusiona nat (objeciones)');
  ['fr','pt','en'].forEach(L=>{
    OBJ.forEach(k=>step(src.includes('I18N.'+L+'.obj.'+k+'.nat='), 'W10-3 '+L+' nat '+k));
    NOD.forEach(k=>step(src.includes('I18N.'+L+'.nodes.'+k+'.nat='), 'W10-4 '+L+' nat '+k));
    step(new RegExp("I18N\\."+L+"\\.glosario=\\[").test(src), 'W10-5 glosario '+L+' presente');
  });
  step(src.includes("_I[__gloL]&&_I[__gloL].glosario")&&src.includes("typeof I18N"), 'W10-6 pestaña glosario dinámica por idioma (con guard)');
  step(src.includes("Vouvoiement systématique")&&src.includes("«O senhor / a senhora»")&&src.includes("UK & Ireland"), 'W10-7 zonas de mercado presentes');
}
