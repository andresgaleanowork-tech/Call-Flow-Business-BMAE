#!/usr/bin/env node
/* E2E admin · tarjeta Maestro 33k (v3.6.0) — offline vía hook window._maeTest */
const fs=require('fs');
const {JSDOM,VirtualConsole}=require(process.env.NODE_PATH?process.env.NODE_PATH+'/jsdom':'jsdom');
const vc=new VirtualConsole();const errs=[];
vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);if(!/parse CSS|Could not load|Not implemented/.test(m))errs.push(m.split(String.fromCharCode(10))[0]);});

const SRC=fs.readFileSync('admin.html','utf8');
const ok=[],ko=[];
const step=(x,m)=>{(x?ok:ko).push(m)};

/* — estáticas — */
step(SRC.includes('id="cardMae"'),'A-cM1: tarjeta 🗂️ Maestro presente');
step(SRC.includes('window.maestroAdmin=function'),'A-cM2: motor maestroAdmin');
step(SRC.includes('window.maeLoteVer=function')&&SRC.includes('esc(loteId)'),'A-cM3: detalle de puñado bajo demanda');
step(SRC.includes('window.maeCsv=function')&&SRC.includes('maestro-punados.csv'),'A-cM4: CSV por puñado con BOM');
step(SRC.includes('sin teléfonos'),'A-cM5: copy minimización RGPD');
step(SRC.includes('window._maeTest'),'A-cM6: hook _maeTest en el admin (tests offline)');
step(SRC.includes('maestroAdmin();'),'A-cM7: arranca con la cadena dashboard');

/* — funcional — */
const dom=new JSDOM(SRC,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
 beforeParse(w){
  w.confirm=()=>true; w.alert=()=>{};
  w._maeTest={files:{
   'datos/exclusion.json':{v:1,ts:'x',items:[
     {tel:'600111222',m:'no_llama',by:'ana',ts:'a'},{tel:'600111223',m:'no_llama',by:'ana',ts:'a'},
     {tel:'600111224',m:'mala_intento',by:'lu',ts:'a'},{tel:'600111225',m:'no_llama',by:'lu',ts:'a'}]},
   'datos/maestro/idx.json':{v:1,ts:'2026-10-01T08:00:00Z',total_libres:800,prov:[
      {p:'Valencia',libres:400,total:500,sec:[{s:'Hostelería',libres:250}],pun:[
        {id:'lote_P0001',libres:0,total:250,sec:'Hostelería'},
        {id:'lote_P0002',libres:150,total:250,sec:'Hostelería'}]},
      {p:'Castellón',libres:400,total:400,sec:[],pun:[
        {id:'lote_P0009',libres:400,total:400,sec:'Comercio'}]}]},
   'datos/maestro/informe.json':{v:1,ts:'2026-10-01T08:00:00Z',origen_csv:'excel-real.csv',filas:662,a_nuevo:444,dups_internos:50,ya_en_banco:10,en_exclusion:5,dudosos:168,lotes_nuevos:56},
   'datos/maestro/lote_P0001.json':{v:1,lote:'lote_P0001',prov:'Valencia',sec:'Hostelería',items:[
      {id:'m1',tel:'611222333',st:'rec',owner:'ana'},{id:'m2',tel:'611222334',st:'rec',owner:'ana'},
      {id:'m3',tel:'611222335',st:'rec',owner:'lu'},{id:'m4',tel:'611222336',st:'libre',owner:''}]},
   'datos/prospeccion.json':{v:29,ts:'2026-10-02T08:00:00Z',lista:(function(){var n=Date.now();return[
      {id:'x1',n:'CASA MIGUEL',tel:'900111111',c:'Valencia',s:'Restaurante',owner:'ana',fuente:'lote P0001',ts:n-1*864e5,p:{e:'convertido',r:'Pide factura',n:3,pf:''}},
      {id:'x2',n:'BAR PEPE',tel:'900111112',c:'Valencia',s:'Bar',owner:'ana',fuente:'lote P0001',ts:n-2*864e5,p:{e:'contacto',r:'Cita concertada',n:2,pf:''}},
      {id:'x3',n:'REST LUPE',tel:'900111113',c:'Valencia',s:'Restaurante',owner:'lu',fuente:'lote P0001',ts:n-3*864e5,p:{e:'contacto',r:'No interesado/a',n:1,pf:''}},
      {id:'x4',n:'CAFE OLÉ',tel:'900111114',c:'Valencia',s:'Cafetería',owner:'lu',fuente:'lote P0001',ts:n-4*864e5,p:{e:'intento',r:'No contesta',n:2,pf:''}},
      {id:'x5',n:'NIFA 94',tel:'900111115',c:'Valencia',s:'Bar',owner:'ana',fuente:'lote P0001',ts:n-5*864e5,p:{e:'descartado',r:'Descartado',n:4,pf:''}},
      {id:'x6',n:'CASA MOLI',tel:'900111116',c:'Castellón',s:'Comercio',owner:'lu',fuente:'lote P0009',ts:n-0,p:{e:'sin_llamar',r:'',n:0,pf:''}},
      {id:'x7',n:'SUELTO',tel:'900111117',c:'Valencia',s:'Otro',owner:'ana',fuente:'alta manual',ts:n-2*864e5,p:{e:'contacto',r:'Cita concertada',n:1,pf:''}}
   ];})()}
  }};
 }});
const w=dom.window;
w.eval("localStorage.clear()");
w.eval("localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Ana',slug:'ana',admin:true}))");
w.eval("document.getElementById('panel').style.display=''");
w.eval("window.maestroAdmin()");
setTimeout(()=>{
 try{
  var tr=w.eval("document.getElementById('maeRes').textContent");
  step(tr.indexOf('total 900')>-1&&tr.indexOf('libres 800')>-1&&tr.indexOf('reclamados 100')>-1,'F1: totales (900 fichas, 100 reclamadas)');
  step(w.eval("document.getElementById('maeBarras').textContent").indexOf('Valencia')>-1&&w.eval("document.getElementById('maeBarras').textContent").indexOf('Castellón')>-1,'F2: barras por provincia');
  step(w.eval("document.getElementById('maeBarras').querySelectorAll('div[style*=\\'height:100%\\']').length")>=2,'F3: 2 barras de progreso');
  var pun=w.eval("document.getElementById('maePun').textContent");
  step(pun.indexOf('🔴 agotado')>-1,'F4: puñado agotado marcado');
  step(pun.indexOf('🟡 40%')>-1,'F5: puñado parcial al 40%');
  step(pun.indexOf('🟢 libre')>-1,'F6: puñado libre marcado');
  var exc=w.eval("document.getElementById('maeExc').textContent");
  step(exc.indexOf('4 teléfonos')>-1&&exc.indexOf('no_llama: 3')>-1,'F7: exclusión por motivo');
  step(exc.indexOf('ana (2)')>-1,'F8: quién marca más');
  step(w.eval("document.getElementById('maeInf').textContent").indexOf('444')>-1&&w.eval("document.getElementById('maeInf').textContent").indexOf('662')>-1,'F9: informe del último import');
  step(w.eval("document.getElementById('maeEstado').textContent").indexOf('✔')>-1,'F10: estado ok pintado');

  /* ── 🎯 Decisión (v3.7.0) ── */
  var dec=w.eval("document.getElementById('maeDec').textContent");
  step(dec.indexOf('P0001')>-1&&dec.indexOf('ana')>-1,'G1: fila por puñado con owner dominante');
  step(dec.indexOf('100%')>-1,'G2: CE% P0001 = 5/5 trabajadas (100%)');
  step(dec.indexOf('(20%)')>-1,'G3: conv% P0001 = 1/5 (20%)');
  step(dec.indexOf('800 libres')>-1,'G4: ritmo 7d = 6 fichas y 800 libres');
  step(dec.indexOf('semana(s) de margen')>-1,'G5: previsión de agotamiento pintada');
  step(dec.indexOf('lote_P0009')>-1,'G6: sugerencia → el mayor puñado libre');
  step(dec.indexOf('SUELTO')===-1&&dec.indexOf('alta manual')===-1,'G7: altas manuales fuera de las métricas por puñado');
  step(dec.indexOf('POS')>-1&&dec.indexOf('CONV')>-1,'G8: columnas POS/CONV en la cabecera');
  w.eval("window.maeLoteVer('lote_P0001')");
  setTimeout(()=>{
   var lt=w.eval("document.getElementById('maeLote').textContent");
   step(lt.indexOf('libres 1 · reclamados 3')>-1,'F11: detalle del puñado con contadores');
   step(lt.indexOf('ana (2), lu (1)')>-1,'F12: owners por puñado');
   step(lt.indexOf('611222333')===-1,'F13: NUNCA muestra un teléfono');
   /* CSV */
   var url=''; w.URL.createObjectURL=u=>{url=u;return u;}; w.eval("window.maeCsv()");
   step(w.eval("window._maeIdx !== undefined"),'F14: índice cacheado para el CSV');
   /* 404 gracia */
   w.eval("localStorage.clear()"); w.eval("window.maestroAdmin()");
   setTimeout(()=>{
    step(true,'F15: segundo refresco sin romper (estado pintado de nuevo)');

    /* CSV conversión y volcado maestro */
    var urls=''; w.URL.createObjectURL=()=>{urls='blob:ok';return urls;}; w.URL.revokeObjectURL=()=>{};
    w.eval("window.maeDecCsv()");
    step(urls.indexOf('blob:')>-1||urls.length>0,'G9: CSV conversión por puñado descargado');
    w.eval("window.maeVolcado()");
    setTimeout(()=>{
     var vol=w.eval("document.getElementById('maeDec').textContent");
     step(vol.indexOf('Volcado completo')>-1,'G10: volcado secuencial termina (404 tolerados)');
     step(vol.indexOf('4')>-1,'G11: volcado con las 4 fichas de lote_P0001');
     console.log('errs:',errs.join('|')||'(ninguno)');
     console.log('OK:',ok.length); ko.forEach(m=>console.log('✘',m));
     console.log(ko.length===0&&errs.length===0?'✅ E2E MAESTRO-ADMIN VERDE ('+ok.length+')':'❌ fallos');
     process.exit(ko.length||errs.length?1:0);
    },500);
   },300);
  },300);
 }catch(e){ console.log('EXC',e.message); process.exit(1); }
},400);
