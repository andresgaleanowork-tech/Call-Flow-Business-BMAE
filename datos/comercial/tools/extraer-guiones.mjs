#!/usr/bin/env node
/**
 * extraer-guiones.mjs — one-shot F3·w1 (reversible, revisado por humano).
 * Extrae el VERBATIM del guion de la v4.4.8 (cuarentena) a JSON contractual.
 * Método fiel: evalúa los literales `const NODES|OBJECTIONS|STEPS` en sandbox
 * aislado (No deja ejecutar lógica: solo objetos; se aborta si hay
 * identificadores externos).
 *
 * Uso:  node datos/comercial/tools/extraer-guiones.mjs
 *       node datos/comercial/tools/extraer-guiones.mjs --check   (sin escribir)
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = path.resolve(new URL("../../../..", import.meta.url).pathname); // /home/user
const REPO = path.join(RAIZ, "bmae-plataforma");
const FUENTES = [
  { segmento: "residencial", archivo: "_cuarentena/previo-f23/apps/web/residencial.html", version: "4.4.8" },
  { segmento: "pymes", archivo: "_cuarentena/previo-f23/apps/web/pymes.html", version: "4.4.8" },
];

function extraerLiteral(fuente, marca) {
  const i = fuente.indexOf(marca);
  if (i < 0) throw new Error(`no se encuentra «${marca}»`);
  const abre = fuente.indexOf("{", i + marca.length); // primera llave TRAS la marca
  let prof = 0, j = abre, enCadena = null, esc = false;
  for (; j < fuente.length; j++) {
    const c = fuente[j];
    if (enCadena) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === enCadena) enCadena = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { enCadena = c; continue; }
    if (c === "{") prof++;
    if (c === "}") { prof--; if (!prof) return fuente.slice(abre, j + 1); }
  }
  throw new Error(`literal «${marca}» sin cerrar`);
}

function sinCadenas(literal) {
  let out = "", enCadena = null, esc = false;
  for (const c of literal) {
    if (enCadena) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === enCadena) enCadena = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { enCadena = c; out += "''"; continue; }
    out += c;
  }
  return out;
}

function evaluarLiteral(literal, seguro = true) {
  const limpio = sinCadenas(literal).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
  const ids = limpio.match(/\b[A-Za-z_$][\w$]*\b/g) || [];
  const reservadas = new Set(["true", "false", "null", "undefined",
    "const", "let", "var", "return", "typeof", "in", "of"]);
  // excluye claves (word seguida de ':') — solo valores identificador desnudos
  const externas = [...new Set(ids.filter((x) =>
    !reservadas.has(x) && !new RegExp(`\\b${x}\\s*:`).test(limpio)))];
  if (seguro && externas.length) {
    throw new Error(`literal NO autosuficiente — identificadores externos: ${externas.slice(0, 8).join(", ")}`);
  }
  return new Function(`"use strict"; return (${literal});`)();
}

function normalizar(fuente, version, segmento, nodos, objeciones, steps) {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    v: 1,
    upd: hoy,
    segmento,
    fuente: `Call Flow Business v${version} (verbatim; cuarentena previo-f23)`,
    licenciaUso: "contenido comercial verbatim — la voz del guion se conserva (excepción C10)",
    steps,
    nodos: Object.fromEntries(Object.entries(nodos).map(([k, n]) => [k, {
      step: n.step, fase: n.fase, titulo: n.titulo,
      script: n.script ?? [], notas: n.notas ?? [], micro: n.micro ?? null,
      nat: n.nat ?? null, opciones: (n.opciones ?? []).map((o) => ({
        ico: o.ico ?? null, label: o.label, sub: o.sub ?? null, next: o.next,
      })),
    }])),
    objeciones,
  };
}

const soloCheck = process.argv.includes("--check");
let fallos = 0;

for (const { segmento, archivo, version } of FUENTES) {
  const ruta = path.join(RAIZ, archivo);
  let html;
  try { html = await readFile(ruta, "utf-8"); }
  catch { console.error(`✘ ${segmento}: fuente no legible (${archivo})`); fallos++; continue; }

  try {
    const nodos = evaluarLiteral(extraerLiteral(html, "const NODES = "));
    const objeciones = evaluarLiteral(extraerLiteral(html, "const OBJECTIONS = "));
    const pasos = html.match(/const STEPS = \[([^\]]+)\]/);
    const steps = pasos ? evaluarLiteral(`[${pasos[1]}]`) : [];
    const doc = normalizar(archivo, version, segmento, nodos, objeciones, steps);

    // verificación de contrato (misma que test_limpieza ampliará)
    const ids = new Set(Object.keys(doc.nodos));
    let rotos = 0;
    for (const n of Object.values(doc.nodos))
      for (const o of n.opciones) if (o.next && !ids.has(o.next)) rotos++;
    const textos = Object.values(doc.nodos).reduce((a, n) => a + JSON.stringify(n.script).length, 0);

    console.log(`${segmento}: ${ids.size} nodos · ${Object.keys(objeciones).length} objeciones · ${steps.length} steps · ${textos} car. verbatim · next rotos: ${rotos}`);
    if (!ids.size || rotos) { fallos++; }

    if (!soloCheck) {
      const destino = path.join(REPO, "datos/comercial/guiones", `${segmento}.json`);
      await writeFile(destino, JSON.stringify(doc, null, 2), "utf-8");
      console.log(`  → escrito ${destino}`);
    }
  } catch (e) {
    console.error(`✘ ${segmento}: ${e.message}`);
    fallos++;
  }
}
process.exit(fallos ? 1 : 0);
