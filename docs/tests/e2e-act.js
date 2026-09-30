const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
function nw(file,seed){
 const vc=new VirtualConsole(); const errs=[];
 vc.on('jsdomError',e=>{const m=String((e.detail&&(e.detail.message||e.detail.stack))||e.message);if(!/parse CSS|Could not load|Not implemented/.test(m))errs.push(m.split('\n')[0]);});
 const dom=new JSDOM(fs.readFileSync(file,'utf8'),{runScripts:'dangerously',url:'https://local.test/',virtualConsole:vc,
  beforeParse(w){ w.Element.prototype.scrollIntoView=function(){}; w.scrollTo=function(){}; w.confirm=()=>true;
   if(seed){ Object.keys(seed).forEach(k=>{ try{ w.localStorage.setItem(k,typeof seed[k]==='string'?seed[k]:JSON.stringify(seed[k])); }catch(e){} }); } }});
 return [dom,errs]; }
const ok=[],ko=[]; const T=(x,m)=>{(x?ok:ko).push(m)};
{const [dom,errs]=nw('pymes.html'); const w=dom.window;
 setTimeout(()=>{ try{
  w.eval("localStorage.removeItem('bm_actividad_comun'); localStorage.removeItem('cli_registros')");
  w.eval('cfbLlamadaToggle()');
  setTimeout(()=>{
   w.eval('cfbLlamadaToggle()');
   var a=JSON.parse(w.eval("localStorage.getItem('bm_actividad_comun')||'[]'"));
   T(a.length===1&&a[0].tipo==='llamada'&&a[0].org==='pymes','⏱ fin de llamada → gestión automática');
   w.eval("var n=document.getElementById('qnNombre'),t=document.getElementById('qnNota'); if(n&&t){n.value='Bar Act';t.value='pide factura';window.qnGuardar();}");
   var a2=JSON.parse(w.eval("localStorage.getItem('bm_actividad_comun')||'[]'"));
   T(a2.length===1,'nota rápida tras ⏱ NO duplica (dedupe 10 min)');
   if(errs.length) ko.push('errores JS plantilla: '+errs[0]);
   const hoy=new Date(),p2=x=>(x<10?'0':'')+x, iso=p=>p.getFullYear()+'-'+p2(p.getMonth()+1)+'-'+p2(p.getDate());
   const seed={'bm_actividad_comun':a2.concat([
     {ts:Date.now()-3*864e5,f:iso(new Date(Date.now()-3*864e5)),h:'10:00',tipo:'llamada',resultado:'Contacto efectivo',detalle:'x',ciudad:'Sagunto',min:6,org:'pymes'},
     {ts:Date.now()-864e5,f:iso(new Date(Date.now()-864e5)),h:'11:00',tipo:'email',resultado:'Solicita factura',detalle:'y',ciudad:'Torrent',min:0,org:'manual'}]),
    'cli_registros':{'Bar Act':{creado:iso(hoy),notas:[],v:3,estado:'cita',ciudad:'Sagunto',factura:'120'},'Bar Dos':{creado:iso(hoy),notas:[],v:3,estado:'nuevo',ciudad:'Valencia',factura:'200'}}};
   const [dom2,errs2]=nw('actividad.html',seed); const w2=dom2.window;
   setTimeout(()=>{ try{
    const kp=w2.document.querySelector('#kpis').textContent;
    T(/gestiones en el periodo/.test(kp)&&/contacto efectivo/.test(kp),'KPIs pintados');
    T(w2.document.querySelectorAll('#chart svg rect').length>=2,'gráfica de barras por día');
    T(/Sagunto/.test(w2.document.querySelector('#rkLoc').textContent),'ranking localidades');
    T(/Cita/.test(w2.document.querySelector('#embudo').textContent),'embudo CRM en vivo');
    T(/120/.test(w2.document.querySelector('#pipekpi').textContent),'pipeline €/mes');
    const lista=w2.document.querySelector('#lista');
    T(lista.querySelectorAll('.fila').length===3,'registro lista 3 gestiones (mes)');
    T(!!lista.querySelector('select'),'resultado editable en línea');
    w2.eval("pModo('semana'); pModo('dia')");
    T(w2.document.querySelector('#lista').querySelectorAll('.fila').length===1,'vista Hoy filtra');
    if(errs2.length) ko.push('errores JS página: '+errs2[0]);
    console.log('OK:',ok.length); ko.forEach(m=>console.log('✘',m));
    console.log(ko.length===0?'✅ E2E ACTIVIDAD VERDE ('+ok.length+' comprobaciones)':'❌ E2E ACTIVIDAD FALLOS');
    process.exit(ko.length?1:0);
   }catch(e){ console.log('✘ EXC página:',e.message); process.exit(1);} },900);
  },150);
 }catch(e){ console.log('✘ EXC plantilla:',e.message); process.exit(1);} },1500);
}
