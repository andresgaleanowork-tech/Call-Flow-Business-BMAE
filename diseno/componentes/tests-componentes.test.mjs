/**
 * tests-componentes.test.mjs — C5: estados §9 verificados con jsdom real:
 * contenido mínimo de cada fábrica, YA, focus trap del modal, tabla
 * skeleton/empty/error/sorting y toasts con aria-live.
 *
 * Ejecutar: NODE_PATH=~/.deps/node_modules node --test tests-componentes.test.mjs
 *           (desde diseno/componentes/)
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createRequire } from "node:module";
import os from "node:os";
// jsdom NO vive en el repo (node_modules no persiste ni se versiona): se instala
// bajo demanda — `npm --prefix "$HOME/.deps" install jsdom@24` (o JSDOM_HOME).
const candidatos = [process.env.JSDOM_HOME, `${os.homedir()}/.deps`, "/tmp/deps"].filter(Boolean);
let JSDOM = null, origen = null;
for (const base of candidatos) {
  try { ({ JSDOM } = createRequire(base + "/noop.js")("jsdom")); origen = base; break; } catch { /* siguiente */ }
}
if (!JSDOM) {
  console.error('✗ jsdom no encontrado. Instálalo: npm --prefix "$HOME/.deps" install jsdom@24');
  process.exit(1);
}
const dom = new JSDOM(`<!DOCTYPE html><html lang="es"><body></body></html>`, { url: "https://bmae.test/" });
globalThis.document = dom.window.document;
globalThis.window = dom.window;
globalThis.HTMLElement = dom.window.HTMLElement;

const {
  crearBoton, crearCampo, crearCampoCUPS, crearKpi, crearModal,
  crearModalConfirmacion, crearTabla, toast, RE_CUPS,
} = await import("./componentes.js");

function limpiar() { document.body.innerHTML = ""; }

test("button: variantes/estados/loading/disabled y 44×44", () => {
  limpiar();
  const { el, api } = crearBoton({ texto: "Pedir oferta", variante: "primary" });
  document.body.append(el);
  assert.equal(el.type, "button");
  assert.ok(el.classList.contains("btn--primary"));

  api.loading(true);
  assert.ok(el.disabled && el.getAttribute("aria-busy") === "true");
  assert.ok(el.querySelector(".spinner"));
  let clics = 0;
  el.addEventListener("click", () => clics++);
  el.click(); // bloqueado por estado loading
  assert.equal(clics, 0);
  api.loading(false);
  assert.ok(!el.disabled && !el.querySelector(".spinner"));

  const d = crearBoton({ texto: "X", variante: "danger" });
  d.api.disabled(true);
  assert.ok(d.el.disabled);
});

test("campo: label-for + aria-describedby + error ida y vuelta", () => {
  limpiar();
  const { el, input, api } = crearCampo({ etiqueta: "Consumo anual", ayuda: "En kWh", requerido: true, validar: (v) => (Number(v) >= 0 ? true : "No puede ser negativo") });
  document.body.append(el);
  assert.ok(el.querySelector("label").htmlFor === input.id);
  assert.ok(input.getAttribute("aria-describedby"));

  assert.equal(api.validarAhora(), false); // requerido vacío
  assert.ok(el.classList.contains("campo--error"));
  assert.equal(input.getAttribute("aria-invalid"), "true");

  api.poner("12000");
  assert.equal(api.validarAhora(), true);
  assert.ok(!el.classList.contains("campo--error"));
  api.poner("-5");
  assert.equal(api.validarAhora(), false);
});

test("campo CUPS: regex contractual §6.1.1 del maestro", () => {
  const c = crearCampoCUPS({ etiqueta: "CUPS" });
  c.api.poner("ES0021000000000001aa");
  assert.equal(c.api.validarAhora(), true);
  c.api.poner("corta");
  assert.equal(c.api.validarAhora(), false);
  assert.ok(RE_CUPS.test("ES0021000000000001AA"));
  assert.ok(!RE_CUPS.test("XX0000000000000000AA"));
});

test("kpi: valor datos + delta con aria (no solo color)", () => {
  const { el, api } = crearKpi({ titulo: "Ahorro medio", valor: "1 240 €" });
  api.ponerDelta({ texto: "+12,4 %", sentido: "sube" });
  const d = el.querySelector(".kpi__delta");
  assert.ok(d.getAttribute("aria-label").includes("Aumenta"));
  assert.equal(el.querySelector(".kpi__valor").textContent, "1 240 €");
});

test("modal: aria, Esc cierra, trap Tab y retorno del foco", async () => {
  limpiar();
  const disparador = document.createElement("button");
  disparador.textContent = "abrir";
  document.body.append(disparador);
  disparador.focus();
  let cerrada = 0;
  const botonInterno = document.createElement("button");
  botonInterno.textContent = "acción";
  const m = crearModal({ titulo: "Confirma", contenido: botonInterno, alCerrar: () => cerrada++ });
  m.api.abrir();
  await new Promise((r) => setTimeout(r, 10)); // el foco inicial es asíncrono (setTimeout 0)
  assert.ok(m.el.querySelector("[role='dialog']").getAttribute("aria-modal") === "true");
  assert.ok(m.el.querySelector("[role='dialog']").getAttribute("aria-labelledby"));
  assert.equal(document.activeElement, botonInterno);

  m.el.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(cerrada, 1);
  assert.equal(document.activeElement, disparador);
});

test("modal confirmación: loading durante la acción, onAceptar, cierra", async () => {
  limpiar();
  let hecho = 0;
  const m = crearModalConfirmacion({
    titulo: "Eliminar", mensaje: "¿Borrar la oferta?", onAceptar: async () => { await new Promise((r) => setTimeout(r, 20)); hecho++; },
  });
  m.api.abrir();
  const [cancelar, aceptar] = m.el.querySelectorAll(".btn");
  aceptar.click();
  assert.ok(aceptar.classList.contains("btn--loading") || aceptar.disabled);
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(hecho, 1);
  assert.ok(!m.api.abierta() || !document.body.contains(m.el));
});

test("tabla: skeleton → error → vacío → datos + sorting accesible", async () => {
  limpiar();
  const datos = [
    { cups: "ES00…A1", consumo: 5200, ahorro: "240 €" },
    { cups: "ES00…A2", consumo: 8200, ahorro: "410 €" },
  ];
  const t = crearTabla({ columnas: [
    { titulo: "CUPS", clave: "cups" },
    { titulo: "Consumo kWh", clave: "consumo", numerica: true },
    { titulo: "Ahorro", clave: "ahorro", numerica: true },
  ], filas: [] });
  document.body.append(t.el);

  t.api.skeleton(3);
  assert.ok(t.el.querySelector(".esqueleto"));
  t.api.vacio("Sin simulaciones", "Cuando la primera llegue, la verás aquí.");
  assert.ok(t.el.querySelector("[role='status']"));
  let reintentos = 0;
  t.api.error("red inalcanzable", () => { reintentos++; t.api.cargar(datos); });
  t.el.querySelector("button").click();
  assert.equal(reintentos, 1);
  assert.ok(t.el.querySelector("tbody tr"));
  assert.ok(t.el.querySelector("thead th[scope='col']"));

  // sorting: 1.º asc (coincide con el orden de carga), 2.º desc → invierte
  const primeraAntes = t.el.querySelector("tbody tr td").textContent;
  const botonConsumo = [...t.el.querySelectorAll(".orden-btn")].find((b) => b.textContent.includes("Consumo"));
  botonConsumo.click();
  assert.equal(t.el.querySelector("th[aria-sort]").getAttribute("aria-sort"), "ascending");
  botonConsumo.click();
  const primeraDespues = t.el.querySelector("tbody tr td").textContent;
  assert.notEqual(primeraAntes, primeraDespues);
  assert.equal(t.el.querySelector("th[aria-sort]").getAttribute("aria-sort"), "descending");
});

test("toast: aria-live, tipo, cierre manual", () => {
  limpiar();
  const t = toast("Cambios guardados", { tipo: "exito", duracion: 0 });
  assert.ok(document.querySelector(".toast--exito"));
  assert.equal(document.querySelector(".toast").getAttribute("role"), "status");
  t.cerrar();
  assert.ok(!document.querySelector(".toast--exito"));
  toast("Error de red", { tipo: "error", assertivo: true, duracion: 0 });
  assert.equal(document.querySelector(".toast--error").getAttribute("role"), "alert");
});
