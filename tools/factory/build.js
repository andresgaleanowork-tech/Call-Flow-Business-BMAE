/* ═══ D2 · GENERADOR editorial ═══
   Fuente de verdad: plantillas/<guion>.html + contenido/<guion>/<NOMBRE>.js
   Genera: WEB/<guion>.html  (byte-idéntico a lo editado a mano — verificado con --check)

   Uso:
     node tools/factory/build.js          → regenera apps/web/pymes.html y apps/web/residencial.html
     node tools/factory/build.js --check  → solo verifica (exit≠0 si la salida difiere de apps/web/)
*/
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..');
const WEB = path.join(RAIZ, 'apps', 'web');

const GUIONES = { 'pymes.html': 'pymes', 'residencial.html': 'residencial' };
const CHECK = process.argv.includes('--check');

function genera(htmlFile, guion) {
  let out = fs.readFileSync(path.join(__dirname, 'plantillas', htmlFile), 'utf8');
  const marcadores = [...out.matchAll(/@@EDITORIAL:([A-Z_]+)@@/g)].map(m => m[1]);
  if (!marcadores.length) throw new Error(`${htmlFile}: plantilla sin marcadores`);
  for (const b of marcadores) {
    let caja = path.join(__dirname, 'contenido', guion, b + '.js');
    if (!fs.existsSync(caja)) caja = path.join(__dirname, 'contenido', 'comun', b + '.js'); // motor único compartido
    const txt = fs.readFileSync(caja, 'utf8'); // bytes exactos del bloque
    out = out.split('@@EDITORIAL:' + b + '@@').join(txt);
  }
  if (out.includes('@@EDITORIAL:')) throw new Error(`${htmlFile}: quedaron marcadores sin sustituir`);
  return out;
}

let mal = 0;
for (const [html, guion] of Object.entries(GUIONES)) {
  const salida = genera(html, guion);
  const destino = path.join(WEB, html);
  if (CHECK) {
    const actual = fs.readFileSync(destino, 'utf8');
    if (actual === salida) {
      console.log(`✔ ${html}: regeneración byte-idéntica (${salida.length} B)`);
    } else {
      mal++; console.log(`✘ ${html}: DIFIERE (esperado ${actual.length} B, generado ${salida.length} B)`);
      const i = [...actual].findIndex((c, j) => c !== salida[j]);
      if (i > 0) console.log(`   primera diferencia en byte ${i}: actual=${JSON.stringify(actual.slice(i - 30, i + 30))} generado=${JSON.stringify(salida.slice(i - 30, i + 30))}`);
    }
  } else {
    fs.writeFileSync(destino, salida);
    console.log(`✔ ${html} regenerado (${salida.length} B)`);
  }
}
if (CHECK) {
  if (mal) { console.log('\n❌ D2: el contenido/plantillas y WEB/ están desincronizados — ejecuta `node tools/factory/build.js`'); process.exit(1); }
  console.log('\n✅ D2: fuentes editoriales regeneran WEB/ byte a byte');
}
