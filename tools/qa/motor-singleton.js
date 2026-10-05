#!/usr/bin/env node
/* Guardián del motor ÚNICO (revisión tras v3.5.1-refactor):
   El motor compartido vive SOLO en tools/factory/contenido/comun/MOTOR_CORE.js
   y las plantillas lo insertan vía @@EDITORIAL:MOTOR_CORE@@.
   Este test falla si alguien vuelve a escribir una función del motor
   dentro de una plantilla (o copia el bloque a mano). */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const motor = fs.readFileSync(path.join(root, 'tools/factory/contenido/comun/MOTOR_CORE.js'), 'utf8');

// nombres definidos en el motor: `function X(` y `window.X=`
const defs = new Set();
for (const m of motor.matchAll(/^function ([A-Za-z_$][\w$]*)\s*\(/gm)) defs.add(['fn', m[1]]);
for (const m of motor.matchAll(/^window\.([A-Za-z_$][\w$]*)\s*=/gm)) defs.add(['win', m[1]]);
// Lista blanca (deliberada, documentada): los módulos históricos auto-contenidos
// (bm_dias v1.5 y el módulo sync v1.2) llevan SU copia local dentro de su IIFE.
const EXCEPCIONES = new Set(['LSg', 'LSs', 'toast']);
console.log(`motor: ${defs.size} nombres top-level vigilados`);

let mal = 0;
for (const g of ['pymes.html', 'residencial.html']) {
  const t = fs.readFileSync(path.join(root, 'tools/factory/plantillas', g), 'utf8');
  // quita el marcador (no es código) y revisa
  const sins = t.replace('@@EDITORIAL:MOTOR_CORE@@', '');
  for (const [tipo, n] of defs) {
    const re = tipo === 'fn'
      ? new RegExp('^function ' + n + '\\s*\\(', 'm')
      : new RegExp('^window\\.' + n + '\\s*=', 'm');
    if (re.test(sins) && !EXCEPCIONES.has(n)) { console.log(`✘ ${g}: '${n}' redefinida en la plantilla (debe vivir solo en MOTOR_CORE.js)`); mal++; }
  }
  if (!t.includes('@@EDITORIAL:MOTOR_CORE@@')) { console.log(`✘ ${g}: falta el marcador @@EDITORIAL:MOTOR_CORE@@`); mal++; }
}
// y el build acepta la carpeta comun/
const build = fs.readFileSync(path.join(root, 'tools/factory/build.js'), 'utf8');
if (!build.includes("contenido', 'comun'")) { console.log('✘ build.js no sabe mirar contenido/comun/'); mal++; }
console.log(mal ? `❌ ${mal} violaciones` : '✅ motor-singleton: el motor vive en un solo sitio');
process.exit(mal ? 1 : 0);
