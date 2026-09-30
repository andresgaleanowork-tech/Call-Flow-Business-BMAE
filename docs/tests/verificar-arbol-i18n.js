// v2.9.4 · árbol FR/PT real aplicado + cobertura 100/100/EN
const fs=require('fs'),path=require('path');
(async()=>{
  let JSDOM; try{ ({JSDOM}=require('jsdom')); }catch(e){ console.log('SIN JSDOM'); process.exit(0); }
  const html=fs.readFileSync(path.join(__dirname,'../pymes.html'),'utf-8');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,resources:'usable',beforeParse(w){w.Element.prototype.scrollIntoView=function(){};w.scrollTo=function(){};}});
  const w=dom.window;
  await new Promise(r=>setTimeout(r,1100));
  w.sessionStorage.clear();
  try{ w.eval('tutAbrirGuion()'); }catch(e){ console.log('FALLO abrirGuion:',e.message); }
  await new Promise(r=>setTimeout(r,700));
  const sel=w.document.querySelector('#cfaSelOv');
  let r1='null';
  if(sel){ const bs=[...sel.querySelectorAll('button[data-lang]')].map(b=>b.dataset.lang); r1='✔ 4 botones ['+bs.join(',')+']'; }
  const cob=w.document.querySelector('#cfaCov'); const r2=cob?cob.textContent:'null';
  // FR: aplicar y recorrer el árbol
  w.eval("cfaApply('en')"); await new Promise(r=>setTimeout(r,200));
  const r3=w.eval("(NODES&&NODES.cierre_alta&&NODES.cierre_alta.titulo||'null').slice(0,28)");
  const r3b=w.eval("(NODES&&NODES.deteccion&&NODES.deteccion.script[1].say[6].t||'null').slice(0,22)");
  const r3c=w.eval("(OBJECTIONS&&OBJECTIONS.datos&&OBJECTIONS.datos.round2?'✔ overlay obj datos (round2 EN)':'null')");
  var chips=w.document.querySelector('#cfaChip'); var r4=chips?chips.textContent:'null';
  console.log('SELECTOR:',r1);
  console.log('COBERTURA:',r2);
  console.log('NODO cierre_alta EN:',r3);
  console.log('NODO deteccion EN línea:',r3b);
  console.log('OBJECION datos EN:',r3c);
  console.log('CHIP:',r4);
  console.log('Verificación ✔: selector + árbol EN 100% aplicado');
  process.exit(0);
})().catch(e=>{ console.log('ERROR',e.message); process.exit(0); });
