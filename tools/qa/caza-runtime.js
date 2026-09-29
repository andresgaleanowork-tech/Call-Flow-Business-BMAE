// ═══ CAZA DE BUGS · fuzzing dinámico sobre pymes.html (jsdom) ═══
// Herramienta de auditoría (no CI). Trampas por la VÍA REAL de la app.
const path=require('path'); const {JSDOM,VirtualConsole}=require(path.join(__dirname,'../../apps/web/node_modules/jsdom'));
const fs=require('fs');
const src=fs.readFileSync(path.join(__dirname,'../../apps/web/pymes.html'),'utf8');

function carga(pre){
  const errs=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);
    if(!/Could not parse CSS|Could not load|Not implemented/i.test(m)) errs.push(m.split('\n')[0]);});
  const dom=new JSDOM(src,{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
    beforeParse(w){ w.Element.prototype.scrollIntoView=function(){}; w.scrollTo=function(){};
      Object.defineProperty(w.navigator,'clipboard',{value:{writeText:()=>Promise.resolve()}});
      if(pre) pre(w); }});
  return {w:dom.window,d:dom.window.document,errs};
}
const R=[]; const hall=(id,msg)=>R.push('🐞 '+id+': '+msg); const ok=(id,msg)=>R.push('   OK '+id+': '+msg);

/* ── T1 · storage 100 % corrupto: arranque sin errores ── */
{
  const {w,errs}=carga(w=>{
    ['bm_stats','bm_badges','bm_a11y','bm_vars','bm_tut_prog','bm_badge','bm_guionkpis',
     'cli_registros','guion_vars','guion_kpis','cfb_perfil','cfb_ver_visto','bm_errores']
     .forEach(k=>w.localStorage.setItem(k,'{¡corrupción!'));
  });
  const abreHub=w.eval("try{ cfbHubAbrir(); 'ok' }catch(e){ 'EXC:'+e.message }");
  const lista=w.eval("try{ cliVerTodo(); 'ok' }catch(e){ 'EXC:'+e.message }");
  if(errs.length||abreHub!=='ok'||lista!=='ok') hall('T1','storage corrupto → jsdom='+JSON.stringify(errs)+' hub='+abreHub+' crm='+lista);
  else ok('T1','arranca con todo corrupto (hub y CRM abren, 0 errores JS)');
}

/* ── T2 · localStorage lleno (QuotaExceeded en setItem) ── */
{
  const {w,errs}=carga(w=>{
    const ls=w.localStorage, orig=ls.setItem.bind(ls); let n=0;
    ls.setItem=(k,v)=>{ if(/^(bm_stats|cli_registros|bm_errores)/.test(k)&&n++<4){ const e=new Error('cuota'); e.name='QuotaExceededError'; throw e; } return orig(k,v); };
  });
  const nota=w.eval("try{ cliAnadir('Pepe Quota','nota'); 'ok' }catch(e){ 'EXC' }");
  if(errs.length) hall('T2','quota → errores JS visibles: '+JSON.stringify(errs.slice(0,3)));
  else ok('T2','quota agotada → degradación silenciosa (cliAnadir='+nota+')');
}

/* ── T3 · bug apóstrofo: click REAL al botón ✕ de la ficha ── */
{
  const {w,d,errs}=carga();
  w.eval("cliAnadir(\"L'Olivé Tarrés\",'primera nota')");
  w.eval("cfbHubAbrir(); cliVerTodo();");
  const enc=((d.getElementById('cliLista')||{innerHTML:''}).innerHTML.match(/decodeURIComponent\('([^)]*)'\)/)||[])[1]||'';
  const btn=[...d.querySelectorAll('#cliLista [onclick]')].find(b=>/cliBorraNota|cliCopia|cliBorraFicha/.test(b.getAttribute('onclick')));
  if(btn) btn.click();
  if(errs.length||/'/.test(enc))
    hall('T3','apóstrofo sin codificar → enc='+JSON.stringify(enc)+' · click real → '+JSON.stringify(errs.slice(0,2)));
  else ok('T3','fichas con apóstrofo manejables');
}

/* ── T4 · bug UTC: carga a las 00:30 Madrid → ¿qué día se anota? ── */
{
  let hoyLocal,dias;
  const RealDate=Date;
  const falsa=new RealDate('2026-09-17T00:30:00+02:00').getTime(); // 00:30 del día 17 en Madrid
  class FakeDate extends RealDate{ constructor(...a){ super(...(a.length?a:[falsa])); } static now(){ return falsa; } }
  const {w}=carga(w=>{ w.Date=FakeDate; });
  setTimeout(()=>{
    hoyLocal=w.eval("(function(){var d=new Date(),p=n=>(n<10?'0':'')+n;return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())})()");
    dias=w.eval("JSON.stringify(cfbStatsGet().dias)");
    const racha=w.eval("String(cfbRacha(cfbStatsGet()))");
    if(dias!=='[]'&&!dias.includes(hoyLocal))
      hall('T4','hoy local='+hoyLocal+' pero dias='+dias+' (UTC) · racha vista por el usuario='+racha+' tras practicar hoy');
    else if(dias==='[]') ok('T4','(init no anotó día — revisar) dias='+dias);
    else ok('T4','días en hora local: '+dias+' · racha='+racha);
    t4listo=true;
  },350);
}

/* ── T5 · version.json hostil por la vía real (checkVersion en init) ── */
{
  const {w,d}=carga(w=>{
    w.CFB_UPDATE_URL='https://update.test/v.json';
    w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({
      version:'"><img src=x onerror=window.__pwnd=1>', fecha:'hoy', url:'javascript:alert(1)'})});
  });
  setTimeout(()=>{
    const n=d.getElementById('cfbVerNote');
    const img=n&&n.querySelector('img');
    const href=n&&n.querySelector('a')&&n.querySelector('a').getAttribute('href');
    if(n&&img) hall('T5','aviso inyecta HTML del JSON: <img onerror> creado='+!!img+' · href='+href+' · __pwnd='+w.eval('String(!!window.__pwnd)'));
    else ok('T5','aviso saneado (o no mostrado)');
    pinta();
  },400);
}
function pinta(){ const to=setInterval(()=>{ if(t4listo){ clearInterval(to); console.log(R.join('\n')); } },60); setTimeout(()=>{clearInterval(to); console.log(R.join('\n')); process.exit(0);},4000); }
var t4listo=false;
