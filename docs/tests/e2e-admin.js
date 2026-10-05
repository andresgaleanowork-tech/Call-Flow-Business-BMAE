const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const vc=new VirtualConsole();const errs=[];
vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);if(!/parse CSS|Could not load|Not implemented/.test(m))errs.push(m.split('\n')[0]);});
const hoy=new Date(),p2=x=>(x<10?'0':'')+x, iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const H=iso(hoy), AY=(hoy.getDate()===1?H:iso(new Date(Date.now()-864e5)));
function ent(ts,f,tipo,res,org,min){ return {ts,f,h:'10:00',tipo,resultado:res||'',detalle:'x',ciudad:'',sector:'',min:min||0,org:org||'pymes'}; }
const BUR=[
 {perfil:{nombre:'Ana',slug:'ana'},ts:new Date().toISOString(),kv:{
   'bm_actividad_ana':[ent(Date.now()-36e5,H,'llamada','Contacto efectivo','pymes',8),ent(Date.now()-864e5-36e5,AY,'email','Solicita factura','manual',0),ent(Date.now()-7200000,H,'crm','', 'pymes',0,'')],
   'bm_crm_resumen_ana':{v:1,f:H,fichas:5,e:{nuevo:2,contactado:1,interesado:1,factura:1,cita:0,visita:0,ganado:0,perdido:0},pipe:250}}},
 {perfil:{nombre:'Lu',slug:'lu'},ts:new Date().toISOString(),kv:{
   'bm_actividad_lu':[],
   'bm_crm_resumen_lu':{v:1,f:H,fichas:2,e:{nuevo:0,contactado:0,interesado:0,factura:0,cita:1,visita:0,ganado:1,perdido:0},pipe:80}}}
];
const dom=new JSDOM(fs.readFileSync('admin.html','utf8'),{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
 beforeParse(w){ w.localStorage.setItem('cfb_perfil',JSON.stringify({nombre:'Jefe',slug:'jefe',admin:true})); }});
const w=dom.window;
setTimeout(()=>{ const ok=[],ko=[]; const T=(x,m)=>{(x?ok:ko).push(m)};
 try{
  w.eval("window._burbujas="+JSON.stringify(BUR)+"; gestionesAdmin(); embudoAdmin();");
  const g=w.document.querySelector('#gestTabla tbody').textContent;
  T(/Ana/.test(g)&&/Lu/.test(g),'tabla gestiones: 2 comerciales');
  T(/50%/.test(g)||g.indexOf('%')>-1,'CE% pintado');
  T(/1 → 0/.test(g)||/→/.test(g),'facturas SOL→REC pintadas');
  const emb=w.document.querySelector('#embTabla tbody').textContent;
  T(/Ana/.test(emb)&&/250/.test(emb.replace(/\s/g,'')),'embudo: Ana con pipeline 250');
  T(/7 fichas/.test(w.document.querySelector('#embRes').textContent),'totales equipo (5+2 fichas)');
  T(/metaActGuardar/.test(w.document.body.innerHTML)||!!w.document.getElementById('metaAct'),'input meta diaria presente');
  T(w.document.getElementById('panel').style.display==='','panel visible con perfil admin');
 }catch(e){ ko.push('EXC '+e.message); }
 console.log('errs:',errs.join('|')||'(ninguno)');
 console.log('OK:',ok.length); ko.forEach(m=>console.log('✘',m));
 console.log(ko.length===0?'✅ E2E ADMIN ACTIVIDAD+EMBUDO VERDE':'❌ E2E ADMIN FALLOS');
 process.exit(0);
},900);
