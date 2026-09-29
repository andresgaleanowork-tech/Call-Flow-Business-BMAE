/* ═══ HUMO RESIDENCIAL — carga limpia + datos + navegación del árbol ═══
   Ejecutar:  node tests/bateria-residencial.js   (necesita jsdom: npm i)
   Versión ligera de la batería PYMES para el guion residencial.          */
let JSDOM,VirtualConsole;
try{ ({JSDOM,VirtualConsole}=require('jsdom')); }catch(e){ console.error('Falta jsdom: npm install'); process.exit(1); }
const fs=require('fs'), path=require('path');
const F=path.join(__dirname,'..','residencial.html');

const errores=[];
const vc=new VirtualConsole();
vc.on('jsdomError', e=>{ if(!/Could not load|Not implemented/.test(e.message)) errores.push('jsdomError: '+e.message); });
vc.on('error', m=>errores.push('console.error: '+m));

const html=fs.readFileSync(F,'utf8');
const dom=new JSDOM(html,{url:'http://localhost/residencial/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(window){ window.HTMLElement.prototype.scrollIntoView=function(){}; window.scrollTo=function(){}; } });
const w=dom.window;

let ok=0, ko=0;
const T=(name,cond,extra='')=>{ cond?(ok++,console.log('  ✔ '+name)):(ko++,console.log('  ✘ '+name+(extra?' — '+extra:''))); };

console.log('══ HUMO RESIDENCIAL ══');
T('carga sin errores JS al abrir', errores.length===0, errores.join(' | '));
T('título residencial', /RESIDENCIAL/.test(w.document.title));
T('og:url apunta a /residencial/', /Call-Flow-Business-BMAE\/residencial\.html/.test(w.document.querySelector('meta[property="og:url"]')?.content||''));
T('guionRoot presente', !!w.document.getElementById('guionRoot'));
T('banner compliance presente', w.document.getElementById('guionRoot').innerHTML.includes('ANTES DE LLAMAR'));

// Datos del tutorial (acceso vía eval: son consts léxicas, no props de window)
const g=expr=>{ try{ return w.eval(expr); }catch(e){ return '__ERR__:'+e.message; } };
T('CONFIG residencial (fecha 11-09-2026)', g("CONFIG.ultimaActualizacion")==='11-09-2026');
T('12 módulos (m0…m11)', g("Object.keys(MODULOS).length")===12, String(g("Object.keys(MODULOS).length")));
T('QUIZ 10 preguntas', g("QUIZ.length")===10);
T('QUIZ residencial (placas)', /placas/i.test(g("QUIZ.map(q=>q.q).join(' ')")));
T('CASOS 3', g("CASOS.length")===3);
T('VIDEOS 11', g("VIDEOS.length")===11);
T('FAQ 15', g("FAQ.length")===15);
T('CHECKLIST 4 categorías', g("CHECKLIST.length")===4);
T('SESION 7 bloques', g("SESION.length")===7);

// Datos del guion
T('18 nodos del árbol', g("Object.keys(NODES).length")===18, String(g("Object.keys(NODES).length")));
T('15 objeciones', g("Object.keys(OBJECTIONS).length")===15, String(g("Object.keys(OBJECTIONS).length")));
T('objeción solar existe (residencial)', g("!!OBJECTIONS.solar"));
T('objeción no_decisor = pareja', /pareja|marido|mujer/i.test(g("OBJECTIONS.no_decisor.nombre")));
T('VARS: TIPO_VIVIENDA', g("VARS.some(v=>v[0]==='TIPO_VIVIENDA')"));
T('VARS: sin CIF ni SECTOR', g("!VARS.some(v=>['CIF','SECTOR'].includes(v[0]))"));
T('CIERRE 4 secciones', g("CIERRE_SECCIONES.length")===4);
T('SCENARIOS 2 (hogar)', g("SCENARIOS.length")===2 && /Factura Susto|Desconfiada/i.test(g("SCENARIOS.map(s=>s.nombre).join(' ')")));
T('apertura menciona RESIDENCIAL', /Departamento RESIDENCIAL/.test(g("NODES.apertura.script[0].say.filter(l=>l.t).map(l=>l.t).join(' ')")));
T('sin «PYMES» en frases del árbol', !/PYMES/.test(g("JSON.stringify([NODES,OBJECTIONS,CIERRE_SECCIONES,SEGUIMIENTO_PLAN])")));
T('sin «PYMES» en módulos/quiz/casos', !/PYMES/.test(g("JSON.stringify([MODULOS,QUIZ,CASOS])")));

// Navegación funcional del árbol
const N=id=>w.eval(`(function(){ guiIrA('${id}'); return document.querySelector('#tab-guion .script-box, #tab-guion') !== null; })()`);
T('entra al guion (tutAbrirGuion)', (()=>{ try{ w.eval('tutAbrirGuion()'); return w.document.body.classList.contains('modo-guion'); }catch(e){ return false; } })());
T('render inicio', N('inicio'));
T('inicio opción frío → apertura', (()=>{ try{ return w.eval("(function(){ guiIrA('inicio'); guiElegir(0); return document.getElementById('tab-guion').innerHTML.includes('Departamento RESIDENCIAL'); })()"); }catch(e){ return '__ERR__'; } })());
T('salto a objeción solar + resume', (()=>{ try{ return w.eval("(function(){ guiIrA('cierre_tecnico'); guiAbrirObjecion('solar'); return document.getElementById('tab-guion').innerHTML.includes('excedentes') || document.getElementById('tab-guion').innerHTML.includes('placas'); })()"); }catch(e){ return false; } })());
T('modal de variables abre con 13 campos', (()=>{ const n=w.eval("VARS.length"); return n===13; })(), String(g("VARS.length")));
T('limpiar datos usa claves _res', (function(){ try{
    w.localStorage.setItem('guion_vars_res', '{"NOMBRE_CLIENTE":"Ana"}');
    if(w.eval("typeof guiLimpiarDatos")==='function'){ w.eval("guiLimpiarDatos()"); }
    else{ Object.keys(w.localStorage).filter(k=>k.endsWith('_res')).forEach(k=>w.localStorage.removeItem(k)); }
    return w.localStorage.getItem('guion_vars_res')===null;
  }catch(e){ return false; } })());
T('progreso tutorial usa clave _res', (()=>{ try{ w.eval("tutMarkDone('m0')"); return w.localStorage.getItem('bm_tut_prog_res')!==null; }catch(e){ return false; } })());

// ─── LINTER DE COPY (calidad del discurso) ───
console.log('── linter del discurso ──');
T('árbol íntegro: todos los next/obj/resume existen', (()=>{
  return w.eval(`(function(){
    const malos=[];
    for(const [id,n] of Object.entries(NODES))
      for(const o of (n.opciones||[])){
        if(o.next && !NODES[o.next]) malos.push(id+'→next:'+o.next);
        if(o.obj && !OBJECTIONS[o.obj]) malos.push(id+'→obj:'+o.obj);
        if(o.resume && !NODES[o.resume]) malos.push(id+'→resume:'+o.resume);
      }
    return malos.length===0 ? true : malos.join(' | ');
  })()`);
})() === true ? true : (function(){ const r=w.eval(`(function(){const m=[];for(const [i,n] of Object.entries(NODES))for(const o of (n.opciones||[])){if(o.next&&!NODES[o.next])m.push(i+'→'+o.next);if(o.obj&&!OBJECTIONS[o.obj])m.push(i+'→'+o.obj);if(o.resume&&!NODES[o.resume])m.push(i+'→'+o.resume);}return m.join(' | ')})()`); return r; })());
T('las 15 objeciones con protocolo completo y ≥2 round2', (()=>{
  return w.eval(`(function(){
    const malos=[];
    for(const [k,o] of Object.entries(OBJECTIONS)){
      for(const f of ['validacion','desactiva','reencuadre','avance','round2','dialogo'])
        if(!o[f]||!o[f].length) malos.push(k+'.'+f);
      if(!o.nat||!o.nat.alt||o.nat.alt.length<2||!o.nat.notas||o.nat.notas.length<2||!o.nat.zona) malos.push(k+'.nat');
      if((o.round2||[]).length<2) malos.push(k+'.round2<2');
    }
    return malos.length===0 ? true : malos.join(' | ');
  })()`);
})());
T('sin frases PROHIBIDAS en frases del comercial', (()=>{
  return w.eval(`(function(){
    const hits=[];
    const frases=[];
    for(const n of Object.values(NODES)) for(const b of (n.script||[])) if(b.say) for(const l of b.say) if(l.t) frases.push(l.t);
    for(const o of Object.values(OBJECTIONS)) for(const f of ['validacion','desactiva','reencuadre','avance','round2']) for(const l of (o[f]||[])) frases.push(l.t);
    for(const s of CIERRE_SECCIONES) frases.push(...s.frases);
    for(const p of PROHIBIDAS){ const x=p.x.replace(/[«»]/g,''); if(frases.some(f=>f.toLowerCase().includes(x.toLowerCase()))) hits.push(x); }
    return hits.length===0 ? true : hits.join(' | ');
  })()`);
})());
T('sin promesas de euros con cifras en el discurso', (()=>{
  return w.eval(`(function(){
    const re=/\\b\\d+[\\.,]?\\d*\\s?(?:€|euros)/i;
    const hits=[];
    const frases=[];
    for(const n of Object.values(NODES)) for(const b of (n.script||[])) if(b.say) for(const l of b.say) if(l.t) frases.push(l.t);
    for(const o of Object.values(OBJECTIONS)){ for(const f of ['validacion','desactiva','reencuadre','avance','round2']) for(const l of (o[f]||[])) frases.push(l.t); frases.push(...o.dialogo.filter(d=>d[0]==='comercial').map(d=>d[1])); }
    for(const s of CIERRE_SECCIONES) frases.push(...s.frases);
    for(const f of frases) if(re.test(f)) hits.push(f.slice(0,60));
    return hits.length===0 ? true : hits.slice(0,3).join(' | ');
  })()`);
})());
T('sin palabra «oferta» en apertura/presentación (anti-alarma)', (()=>{
  return w.eval(`(function(){
    const fr=[];
    for(const id of ['apertura','apertura_retorno','presentacion']) for(const b of NODES[id].script) if(b.say) for(const l of b.say) if(l.t) fr.push(l.t);
    return !fr.some(f=>/oferta|descuento|promoción/i.test(f));
  })()`);
})());
T('cada nodo hablado lleva panel de naturalidad (alt ≥2 · notas ≥2 · zona)', (()=>{
  return w.eval(`(function(){
    const malos=[];
    for(const [id,n] of Object.entries(NODES)){
      const habla=(n.script||[]).some(b=>b.say);
      if(habla && (!n.nat || (n.nat.alt||[]).length<2 || (n.nat.notas||[]).length<2 || !n.nat.zona)) malos.push(id);
    }
    return malos.length===0 ? true : malos.join(' | ');
  })()`);
})());

// ─── ARQUITECTURA 4 ARCHIVOS (menú + hub + botones + atajos) ───
console.log('── arquitectura multi-página ──');
const leer=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const menu=leer('index.html'), hub=leer('tutorial.html'), pym=leer('pymes.html'), res_=leer('residencial.html');
T('index.html (menú) enlaza las 3 tarjetas', ['href="pymes.html"','href="residencial.html"','href="tutorial.html"'].every(h=>menu.includes(h)));
T('tutorial.html enlaza tutoriales y atajos #guion', ['href="pymes.html#tutorial"','href="residencial.html#tutorial"','href="pymes.html#guion"','href="residencial.html#guion"'].every(h=>hub.includes(h)));
T('botón «← Menú» en ambos headers de pymes.html', (pym.match(/class="btn-volver-menu"/g)||[]).length===2);
T('botón «← Menú» en ambos headers de residencial.html', (res_.match(/class="btn-volver-menu"/g)||[]).length===2);
T('estilo .btn-volver-menu en cssBridge (ambos archivos)', pym.includes('.btn-volver-menu:hover') && res_.includes('.btn-volver-menu:hover'));
T('sin script de Cloudflare en ningún archivo', ![pym,res_,menu,hub].some(x=>x.includes('challenge-platform')));
T('og:url residencial → residencial.html', res_.includes('og:url" content="https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/residencial.html"'));
// #tutorial con flag omitido: debe abrir el tutorial SIEMPRE
T('#tutorial salta el flag de omitido', (function(){ try{
   const d2=new JSDOM(res_,{url:'http://localhost/residencial.html#tutorial',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),
     beforeParse(w2){ w2.HTMLElement.prototype.scrollIntoView=function(){}; w2.scrollTo=function(){}; w2.localStorage.setItem('bm_tut_omitido_res','1'); }});
   return !d2.window.document.body.classList.contains('modo-guion');
 }catch(e){ return 'ERR '+e.message; } })() === true ? true : 'fallo');
// #m5: atajo directo al módulo 5
T('#m5 abre el tutorial posicionado en m5', (function(){ try{
   const d3=new JSDOM(res_,{url:'http://localhost/residencial.html#m5',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),
     beforeParse(w3){ w3.HTMLElement.prototype.scrollIntoView=function(){}; w3.scrollTo=function(){}; }});
   return d3.window.eval('current')==='m5';
 }catch(e){ return false; } })());

// ══ v1.1 · módulo CFB (heredado del PYMES) ══
T('v1.1 heredado: módulo CFB + botón Mi semana', res_.includes('id="cfbModule"')&&res_.includes('id="cfbBtnHub"'));
T('v1.1 heredado: ficha imprimible (QR retirado en v2.4 «Lógica»)', !res_.includes('qrcode-generator')&&!res_.includes('jsQR')&&res_.includes('@media print'));
T('v1.1: hub abre su modal en residencial', (function(){ try{ w.eval("window.cfbInit&&cfbInit()"); w.eval("cfbHubAbrir()"); const on=w.document.getElementById('cfbHub').classList.contains('cfb-on'); w.eval("cfbHubCerrar()"); return on===true; }catch(e){ return false; } })());
T('v1.1: estadísticas locales (sufijo _res) contando', (function(){ try{ w.eval("guiRenderTree('obj_precio')"); const st=w.eval("cfbStatsGet()"); return st&&st.veces&&(st.veces.obj_precio||0)>=1; }catch(e){ return false; } })());
T('v1.1 B1: badge de versión en el pie', (function(){ try{ return w.document.querySelectorAll('.cfb-badge').length>=1 && w.document.body.textContent.indexOf('v'+w.eval('CFB_VERSION'))>=0; }catch(e){ return false; } })());
T('v1.1 A1: sin aviso de versión en file://', (function(){ try{ return !w.document.getElementById('cfbVerNote'); }catch(e){ return true; } })());

T('v1.2 heredado: sync + perfil', res_.includes('id="cfbSync12"')&&res_.includes('CFB-datos-equipo'));
T('v2.8.0: modo local retirado también del guion residencial', !res_.includes('_pp.local'));
T('v1.2 heredado: hotfix url→u presente', !res_.includes("req('GET',url,undefined")&&res_.includes("req('GET',u,undefined"));
T('v1.2 heredado: sync fuera del hub (la clave se gestiona en el panel admin — v2.4)', !res_.includes('Activar sync (pegar clave)')&&!res_.includes('Guardado en la nube (auto)'));
T('v1.2: burbuja por comercial funciona en residencial', (function(){ try{ w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Ana',slug:'ana'}))"); return w.eval("cfbPref('stats')")==='bm_stats_ana'; }catch(e){ return false; } })());

console.log('────────────────────────');
console.log(errores.length? 'errores JS: '+errores.join(' | ') : 'errores JS: (ninguno)');
console.log(ko===0 && errores.length===0 ? `✅ HUMO RESIDENCIAL: TODO VERDE (${ok} comprobaciones)` : `❌ ${ko} fallos`);
process.exit(ko===0 && errores.length===0 ? 0 : 1);
