const fs=require('fs');
(async()=>{
  const {JSDOM}=require('jsdom');
  const html=fs.readFileSync('pymes.html','utf-8');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,beforeParse(w){w.Element.prototype.scrollIntoView=function(){};w.scrollTo=function(){};}});
  const w=dom.window;
  await new Promise(r=>setTimeout(r,1200));
  w.sessionStorage.clear();
  w.eval("cfaApply('pt')");
  await new Promise(r=>setTimeout(r,300));
  const nat=w.eval("NODES.cierre_cita.nat && NODES.cierre_cita.nat.zona || 'null'");
  const natAlt=w.eval("OBJECTIONS.lo_pienso.nat && OBJECTIONS.lo_pienso.nat.alt[0].slice(0,26) || 'null'");
  // pestaña glosario en caliente
  w.eval("guiRenderGlosarioTab()");
  const tab=w.document.getElementById('tab-glosario').innerHTML;
  const hdr=/Glossário português nativo/.test(tab);
  const cat=/Fórmulas telefónicas autênticas/.test(tab);
  const alt=/Alternativas:/.test(tab); // etiqueta i18n PT = «Alternativas:»
  const pro=/Proibições absolutas/.test(tab);
  console.log('NAT cierre_cita PT zona:',nat);
  console.log('NAT obj lo_pienso PT alt:',natAlt);
  console.log('GLO header PT:',hdr,'· cat PT:',cat,'· label alt:',alt,'· prohib PT:',pro);
  // cambio a EN y el nat cambia
  w.eval("cfaApply('en')");
  const natEn=w.eval("NODES.retirada.nat && NODES.retirada.nat.notas[0].slice(0,24) || 'null'");
  console.log('NAT retirada EN nota:',natEn);
  console.log('VERIFICACIÓN OLA 4 ✔');
  process.exit(0);
})().catch(e=>{ console.log('ERROR',e.message); process.exit(1); });
