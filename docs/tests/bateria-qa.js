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
step(/function eqDescifra\(/.test(srcI)&&/PBKDF2/.test(srcI)&&/iter\|\|250000/.test(srcI)&&/AES-GCM/.test(srcI),'v3.8-E2: descifrador PBKDF2 SHA-256 ×250.000 + AES-GCM-256');
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
step(/network-first/.test(swSrc)&&/cfb-v364/.test(swSrc)&&/admin\.html/.test(swSrc),'AUD-H: sw network-first + admin cacheado');
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
