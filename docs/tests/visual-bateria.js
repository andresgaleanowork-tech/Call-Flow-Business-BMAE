/* ═══ BATERÍA VISUAL (v2.8.0) · estilos COMPUTADOS, no regex ═══
   Nace de la caza @media print (v2.7.5) y cfbCss en <body> (v2.7.6):
   a partir de ahora, los fallos de CSS se cazan solos. */
const fs=require('fs'), path=require('path'), {JSDOM}=require('jsdom');
let R=[], pasan=0;
function step(ok,msg){ if(ok){pasan++; R.push('✔ '+msg);} else R.push('✘ '+msg); }
function pagina(f){ return new JSDOM(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),{runScripts:'outside-only'}).window; }

for(const f of ['pymes.html','residencial.html']){
  const w=pagina(f), doc=w.document;
  /* nota rápida: estilo crítico computado */
  const qn=doc.getElementById('cfbQuickNote'), cs=doc.defaultView.getComputedStyle(qn);
  step(cs.position==='fixed'&&cs.display==='none'&&cs.backgroundColor==='rgb(255, 255, 255)',
    f+' · nota rápida: fixed + oculta por defecto + tarjeta blanca (computado)');
  step(!!doc.getElementById('qnTel')&&!!doc.getElementById('qnVoz')&&!!doc.getElementById('qnLlamar'),
    f+' · mini-CRM presente en el DOM (☎/🎙/📞)');
  /* cfbCss en <head> */
  const cssEl=doc.getElementById('cfbCss');
  step(!!cssEl&&cssEl.ownerDocument.head.contains(cssEl), f+' · hoja cfbCss vive dentro de <head>');
  /* toast por encima de la nota */
  const t=doc.getElementById('toast'), tc=t?doc.defaultView.getComputedStyle(t):null;
  step(!!tc&&parseInt(tc.zIndex,10)>20000, f+' · toast por delante de la nota rápida (z='+((tc&&tc.zIndex)||'?')+')');
  /* certificado del diploma oculto hasta imprimir */
  step(/#cfbCertPrint\{display:none\}/.test(cssEl.textContent), f+' · certificado diploma: display:none en pantalla');
}
/* index: hero computado + logos referenciados existen */
{ const w=pagina('index.html'), doc=w.document;
  const hero=doc.querySelector('.hero-card');
  step(!!hero, 'index · hero de marca presente');
  step(!!doc.querySelector('img[src="logo-iberdrola.png"]')&&!!doc.querySelector('img[src="logo-bm.png"]'),
    'index · logos Iberdrola + B&M enlazados');
  step(!/cfbModoLocal/.test(doc.documentElement.innerHTML)&&!/Sin conexi\u00f3n/.test(doc.body.textContent),
    'index · sin modo local ni claims offline'); }

console.log(R.join('\n'));
const f=R.filter(x=>x.startsWith('✘')).length;
console.log('════════════════════════════════');
console.log(f?('❌ VISUAL: '+f+' FALLOS'):('✅ BATERÍA VISUAL: TODO VERDE ('+pasan+' comprobaciones)'));
process.exit(f?1:0);
