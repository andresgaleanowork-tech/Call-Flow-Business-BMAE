/* ═══ D2 · EXTRACTOR (una sola vez) ═══
   Divide WEB/{pymes,residencial}.html en:
     · plantillas/<guion>.html  → igual, pero cada bloque de contenido = @@EDITORIAL:NOMBRE@@
     · contenido/<guion>/<NOMBRE>.js → el bloque de texto EXACTO (const X = …;)
   Solo se ejecuta una vez; después la verdad vive en plantillas/ + contenido/. */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..');
const WEB = path.join(RAIZ, 'WEB');
const OUT = __dirname;

const BLOQUES = [
  // tutorial
  'CONFIG','SECTIONS','MODULOS','QUIZ','CASOS','VIDEOS','FAQ','CHECKLIST','SESION',
  // guion
  'VARS','STEPS','NODES','OBJECTIONS','CIERRE_SECCIONES','SCENARIOS',
  'CHECKLIST_NEURO','GLOSARIO','PROHIBIDAS','FILTRO_IDIOMA','KPI_FIELDS'
];

/* Escáner tolerante a strings simples/dobles, template-literals con ${}, y comentarios */
function localiza(src, nombre) {
  let start = src.indexOf('const ' + nombre + ' ');
  if (start < 0) start = src.indexOf('const ' + nombre + '=');
  if (start < 0) return null;
  let i = start, depth = 0, estado = 'N', tok = ''; let pila = [];
  while (i < src.length) {
    const c = src[i], c2 = src[i + 1];
    if (estado === 'N') {
      if (c === "'") estado = 'S';
      else if (c === '"') estado = 'D';
      else if (c === '`') { estado = 'T'; pila.push(0); }
      else if (c === '/' && c2 === '/') estado = 'L';
      else if (c === '/' && c2 === '*') estado = 'B';
      else if ('{(['.includes(c)) depth++;
      else if ('})]'.includes(c)) depth--;
      else if (c === ';' && depth === 0) return { start, end: i + 1 };
    } else if (estado === 'S') { if (c === '\\') i++; else if (c === "'") estado = 'N'; }
    else if (estado === 'D') { if (c === '\\') i++; else if (c === '"') estado = 'N'; }
    else if (estado === 'T') {
      if (c === '\\') i++;
      else if (c === '`' && pila[pila.length - 1] === 0) { estado = 'N'; pila.pop(); }
      else if (c === '$' && c2 === '{') { pila[pila.length - 1]++; i++; }
      else if (c === '}' && pila[pila.length - 1] > 0) pila[pila.length - 1]--;
    } else if (estado === 'L') { if (c === '\n') estado = 'N'; }
    else if (estado === 'B') { if (c === '*' && c2 === '/') { estado = 'N'; i++; } }
    i++;
  }
  return null;
}

function extrae(guion) {
  const f = path.join(WEB, guion);
  const src = fs.readFileSync(f, 'utf8');
  const cortes = [];
  const dirC = path.join(OUT, 'contenido', guion.replace('.html', ''));
  fs.mkdirSync(dirC, { recursive: true });
  for (const b of BLOQUES) {
    const loc = localiza(src, b);
    if (!loc) throw new Error(`${guion}: no localicé el bloque ${b}`);
    cortes.push({ b, ...loc });
    const txt = src.slice(loc.start, loc.end);
    fs.writeFileSync(path.join(dirC, b + '.js'), txt);   // bytes exactos, sin newline forzado
  }
  // construye la plantilla sustituyendo de atrás hacia delante
  let plantilla = src;
  cortes.sort((a, z) => z.start - a.start);
  for (const c of cortes) {
    plantilla = plantilla.slice(0, c.start) + '@@EDITORIAL:' + c.b + '@@' + plantilla.slice(c.end);
  }
  fs.mkdirSync(path.join(OUT, 'plantillas'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'plantillas', guion), plantilla);
  console.log(`${guion}: ${cortes.length} bloques extraídos (${cortes.reduce((a, c) => a + (c.end - c.start), 0)} B de contenido)`);
}

extrae('pymes.html');
extrae('residencial.html');
console.log('✔ extracción D2 hecha — ahora: node build.js --check');
