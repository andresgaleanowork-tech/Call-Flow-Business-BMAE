/**
 * F3 · tests del shell y páginas (jsdom). Patrón heredado de componentes:
 * jsdom fuera del repo (`npm --prefix "$HOME/.deps" install jsdom@24`).
 * El fetch local se sirve desde DISCO (determinista, sin red): rutas
 * relativas del repo se leen del árbol real — así callflow prueba el catálogo
 * versionado de verdad.
 */

import { createRequire } from "node:module";
import os from "node:os";
import { readFile } from "node:fs/promises";
import path from "node:path";

const candidatos = [process.env.JSDOM_HOME, `${os.homedir()}/.deps`, "/tmp/deps"].filter(Boolean);
let JSDOM = null;
for (const base of candidatos) {
  try { ({ JSDOM } = createRequire(base + "/noop.js")("jsdom")); break; } catch { /* siguiente */ }
}
if (!JSDOM) { console.error('✗ jsdom no encontrado: npm --prefix "$HOME/.deps" install jsdom@24'); process.exit(1); }

const RAIZ = path.resolve(new URL("../../..", import.meta.url).pathname);

const { VirtualConsole } = createRequire(candidatos[0] + "/noop.js")("jsdom");
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => {
  // jsdom considera toda navegación "no implementada": en tests la guardamos
  // ruido fuera y verificamos el ESTADO resultante (landing visible), no la llamada.
  if (!/navigation/i.test(String(e?.message))) console.error(e);
});
const dom = new JSDOM(`<!DOCTYPE html><html lang="es"><body>
  <div id="vista-landing"><p id="marca-landing">LANDING</p></div>
  <main id="app" hidden></main>
</body></html>`, { url: "https://bmae.test/", virtualConsole: vc });
globalThis.document = dom.window.document;
globalThis.window = dom.window;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Option = dom.window.Option;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.location = dom.window.location;

// fetch local desde disco (solo rutas del repo; el resto, error honesto)
globalThis.fetch = async (ruta) => {
  const r = String(ruta);
  if (/^https?:/.test(r)) throw new Error("red prohibida en tests");
  const absol = path.join(RAIZ, decodeURI(r));
  try {
    const texto = await readFile(absol, "utf-8");
    return { ok: true, json: async () => JSON.parse(texto), text: async () => texto };
  } catch {
    return { ok: false, status: 404, json: async () => { throw new Error("404"); } };
  }
};

import test from "node:test";
import assert from "node:assert/strict";

const { resolver } = await import("../src/main.js");
const { sello, chipSello, eur } = await import("../src/lib/honesto.js");
const { api } = await import("../src/lib/api.js");
const { guardianPII } = await import("../src/paginas/callflow.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("router: sin hash de app, la landing manda y #app sigue oculta", async () => {
  dom.window.location.hash = "";
  await resolver();
  assert.equal(document.getElementById("vista-landing").hidden, false);
  assert.ok(document.getElementById("marca-landing"));
});

test("router: #/comparador vivo w4 — tarifario horneado real, orden por defecto y sello declarado (pública)", async () => {
  dom.window.location.hash = "#/comparador";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.equal(document.getElementById("vista-landing").hidden, true);
  assert.equal(app.hidden, false);
  assert.ok(app.textContent.includes("Tu comparativa"));
  // w4: el tarifario real del repo (fetch de disco en tests) — 5 ofertas activas
  assert.equal(app.querySelectorAll(".app-fila-oferta").length, 5);
  const selloChip = app.querySelector(".app-sello");
  assert.ok(selloChip.textContent.includes("precios publicados"));
  assert.ok(selloChip.textContent.includes("estimados")); // honestidad por escrito
  assert.ok(app.textContent.includes("Comparativa orientativa"));
  assert.ok(app.textContent.includes("caso estándar"));
  // recomendada = la de menor anual determinista (Endesa 0,129), no la del mock
  assert.ok(app.querySelector(".app-fila-oferta--recomendada"));
  const primera = app.querySelector(".app-fila-oferta--recomendada strong");
  assert.ok(primera.textContent.includes("Endesa"));
  // logo Iberdrola en su fila (uso comparativo) + línea base declarada
  assert.ok(app.querySelector('.app-fila-oferta img[src="diseno/marca/logo-iberdrola.png"]'));
  assert.ok(app.textContent.includes("contra la media"));
});

test("router: ordenar por precio reordena filas", async () => {
  const sel = document.querySelector("#app select");
  sel.value = "precio";
  sel.dispatchEvent(new dom.window.Event("change"));
  await sleep(10);
  const nombres = [...document.querySelectorAll("#app .app-fila-oferta strong")].map((n) => n.textContent);
  assert.ok(nombres[0].includes("Endesa")); // 0,129 el más barato
  assert.ok(nombres[nombres.length - 1].includes("TotalEnergies")); // 0,138 el más caro
});

test("router: ruta privada sin sesión redirige a #/login nativo (GitHub-Total w2) y NUNCA monta la privada", async () => {
  dom.window.sessionStorage.clear();
  dom.window.location.hash = "#/panel";
  await resolver();
  await sleep(10);
  // GitHub-Total w2: el guard no salta fuera; re-enruta al login SPA nativo.
  assert.equal(dom.window.location.hash, "#/login");
  const app = document.getElementById("app");
  assert.equal(app.hidden, false);
  // con CLIENT_ID vacío debe verse el estado honesto de «no cableado», nunca el panel
  assert.ok(app.textContent.includes("OAuth App"));
  assert.ok(!app.textContent.includes("KPI"));
});

test("router: con sesión B (claves reales bmae_*) el dashboard monta KPIs y gráfica", async () => {
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.location.hash = "#/panel";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Buenos días, Pilar"));
  assert.equal(app.querySelectorAll(".kpi").length, 4);
  const svg = app.querySelector("svg[role='img']");
  assert.ok(svg && svg.getAttribute("aria-label").includes("22 estimados"));
  assert.ok(app.querySelector(".app-side a[aria-current='page']"));
});

test("página facturas (H2): libro VeriFactu vivo — vacío honesto ahora mismo + mapeo puro/aFilas+resumen (nunca mock legal)", async () => {
  // Estado REAL del repo hoy: cadena sin registros → UI lo declara, no simula.
  dom.window.location.hash = "#/facturas";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Cadena sin registros todavía"));
  assert.ok(app.textContent.includes("F4G·w1"));
  assert.ok(app.textContent.includes("libro VeriFactu vivo"));
  assert.ok(!app.querySelector("table")); // jamás tabla sa mock: es prueba legal

  // Mapeo puro (fixture de contrato §3) — sin página, sin red
  const { aFilas, resumenCadena } = await import("../src/lib/verifactu.js");
  const cadena = {
    v: 1, upd: "2026-10-08",
    emisor: { nombre_razon: "BMAE Energía", nif: "B87654321" },
    ultimo: { numero_serie: "BMAE-2026-0002", huella: "AB".repeat(32), fecha_hora_huso: "2026-10-08T10:00:00+02:00" },
    historial: [
      { numero_serie: "BMAE-2026-0001", fecha_expedicion: "07-10-2026", descripcion: "octubre", importe_total: "121.00", huella: "CD".repeat(32), qr: "https://prewww2.aeat.es/x" },
      { numero_serie: "BMAE-2026-0002", fecha_expedicion: "08-10-2026", descripcion: "refrigeración", importe_total: "60.50", huella: "AB".repeat(32), qr: null },
    ],
  };
  const filas = aFilas(cadena);
  assert.equal(filas.length, 2);
  assert.equal(filas[0].numero, "BMAE-2026-0002"); // más reciente primero
  assert.equal(filas[0].vfTxt, "registrada");     // la escribió el bot tras OK AEAT
  assert.equal(filas[1].huellaCorta, "CDCDCDCDCD…");
  assert.equal(filas[1].qr, "https://prewww2.aeat.es/x");
  const r = resumenCadena(cadena);
  assert.equal(r.numRegistros, 2);
  assert.equal(r.importeAcumulado, 121 + 60.5);
  assert.equal(r.ultimaHuellaCorta, "ABABABABAB…");
  assert.equal(r.emisorNif, "B87654321");
});

test("albaranes (modo sin cert): #/albaranes muestra el libro vivo o el vacío honesto con la acción correcta + mapeo puro", async () => {
  // repo real hoy: libro vacío → la página lo declara y enseña a generar uno
  dom.window.location.hash = "#/albaranes";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Libro de albaranes vacío"));
  assert.ok(app.textContent.includes("albaran:crear"));
  assert.ok(app.textContent.includes("no fiscal")); // disclaimers en H1/estado
  assert.ok(app.textContent.includes("NIF pendiente"));
  assert.ok(!app.querySelector("table"));

  // mapeo puro desde un libro con datos
  const { aFilas, resumen } = await import("../src/lib/albaranes.js");
  const libro = {
    v: 1, upd: "2026-10-08",
    emisor: { nombre_razon: "BMAE Energía", nif: "B87654321" },
    ultimo: { numero_serie: "ALB-2026-0002", fecha: "2026-10-08", total: "361,00", huella_integridad: "AB".repeat(32) },
    historial: [
      { numero_serie: "ALB-2026-0001", fecha: "2026-10-08", cliente_ref: "ref. #87", lineas: [{ descripcion: "Auditoría integral" }], total: "240,00", huella_integridad: "CD".repeat(32), pdf: "datos/albaranes/pdf/ALB-2026-0001.pdf" },
      { numero_serie: "ALB-2026-0002", fecha: "2026-10-08", cliente_ref: "ref. #88", lineas: [{ descripcion: "Instalación solar" }, { descripcion: "Puesta en marcha" }], total: "361,00", huella_integridad: "AB".repeat(32), pdf: "datos/albaranes/pdf/ALB-2026-0002.pdf" },
    ],
  };
  const filas = aFilas(libro);
  assert.equal(filas.length, 2);
  assert.equal(filas[0].numero, "ALB-2026-0002"); // más reciente primero
  assert.equal(filas[0].concepto, "Instalación solar · Puesta en marcha");
  assert.equal(filas[1].totalTxt, "240,00 €");
  assert.equal(filas[1].pdf, "datos/albaranes/pdf/ALB-2026-0001.pdf");
  const r = resumen(libro);
  assert.equal(r.num, 2);
  assert.equal(r.total, 240 + 361);
  assert.equal(r.nifPendiente, false);
  assert.equal(resumen({ emisor: { nombre_razon: "BMAE", nif: "PENDIENTE (x)" }, historial: [] }).nifPendiente, true);
});

test("tarifario A2: consumo real (bmae.consumo) cambia el caso y el comparador lo DECLARA (nunca lo esconde)", async () => {
  const { aComparativa } = await import("../src/lib/tarifario.js");
  const datos = {
    v: 1, upd: "2026-10-08", kwhReferencia: 4000, kwPotenciaReferencia: 5.5,
    items: [
      { id: "x", nombre: "X", tipo: "fija", precioKwh: 0.10, potenciaEurKwDia: 0.10 },
      { id: "y", nombre: "Y", tipo: "fija", precioKwh: 0.20, potenciaEurKwDia: 0.10 },
    ],
  };
  // caso estándar: 4 000 kWh
  const e = aComparativa(datos);
  assert.equal(e.casoEstandar.real, false);
  const anualXEstandar = e.ofertas.find((o) => o.id === "x").anual;
  // caso real 1 215 kWh (factura Iberdrola de muestra): anual recalcula exacto
  const eReal = aComparativa(datos, { kwh: 1215, kw: 5.75, cliente: "tu suministro" });
  assert.equal(eReal.casoEstandar.real, true);
  const anualXReal = eReal.ofertas.find((o) => o.id === "x").anual;
  assert.equal(anualXReal, Math.round(0.10 * 1215 + 0.10 * 5.75 * 365));
  assert.ok(anualXReal < anualXEstandar);
  assert.ok(eReal.sello.reales.some((s) => s.includes("consumo real del cliente")));
  assert.ok(eReal.sello.estimados.some((s) => s.includes("1215") || s.includes("1.215")));
  // validaciones duras: null/0 no cambian el caso
  assert.equal(aComparativa(datos, { kwh: 0 }).casoEstandar.real, false);

  // página: con bmae.consumo escrito, el aviso declara "tu consumo real"
  dom.window.sessionStorage.setItem("bmae.consumo", JSON.stringify({ kwh: 1215, kw: 5.75, origen: "fixture" }));
  dom.window.location.hash = "#/comparador";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("TU consumo real de factura"));
  assert.ok(app.textContent.includes("1.215 kWh") || app.textContent.includes("1215 kWh"));
  const sello = app.querySelector(".app-sello");
  assert.ok(sello.textContent.includes("consumo real"));
  dom.window.sessionStorage.removeItem("bmae.consumo");
});

test("solargh (A4): etapas+visitas ordenadas/vencidas, simulador C10 intacto, operativa vacía honesta sin login", async () => {
  const { aGrupos, etapaDe, visitaDe } = await import("../src/lib/solargh.js");
  assert.equal(etapaDe(["canal:solar", "estado-solar:instalacion"]), "instalacion");
  assert.equal(etapaDe(["canal:solar"]), "visita"); // default
  assert.equal(visitaDe(["visita:2026-10-20"]), "2026-10-20");
  const issues = [
    { number: 51, title: "[res] Tejado Valencia", state: "open", html_url: "https://gh/51", labels: [{ name: "canal:solar" }, { name: "estado-solar:visita" }, { name: "visita:2026-10-20" }] },
    { number: 52, title: "Bodega Utiel", state: "open", html_url: "https://gh/52", labels: [{ name: "canal:solar" }, { name: "estado-solar:visita" }, { name: "visita:2026-09-15" }] },
    { number: 53, title: "Nave Picanya", state: "closed", html_url: "https://gh/53", labels: [{ name: "canal:solar" }, { name: "estado-solar:garantia" }, { name: "visita:2026-05-01" }] },
    { number: 54, title: "PR colado", state: "open", pull_request: {}, labels: [{ name: "canal:solar" }] },
  ];
  const { grupos, proximas, abiertos } = aGrupos(issues.filter((i) => !i.pull_request), { hoy: "2026-10-08" });
  assert.equal(grupos.length, 4);
  const porTitulo = Object.fromEntries(grupos.map((g) => [g.titulo, g.tarjetas]));
  assert.equal(porTitulo["Visita pendiente"].length, 2);
  assert.equal(porTitulo["Garantía activa"].length, 1);
  // visitas abiertas ordenadas de fecha, vencida marcada (la de la ya cerrada no pasa)
  assert.deepEqual(proximas.map((p) => p.id), ["#52", "#51"]);
  assert.equal(proximas[0].vencida, true);  // 15-sep < 08-oct, abierta
  assert.equal(proximas[1].vencida, false);
  assert.equal(abiertos, 2);

  // página: simulador intacto + operativa declara vacío solo-simulador sin repo/token
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.location.hash = "#/solar";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("tejado puede trabajar")); // simulator C10 sigue
  assert.ok(app.textContent.includes("Operativa solar")); // sección A4 presente
  assert.ok(app.textContent.includes("REPO_OPERACION")); // aviso honesto visible
  assert.ok(app.querySelector("svg[viewBox]"));        // barras del simulador intactas
});

test("metricas B3: campoCola desglosa por segmento/resultado (solo esta máquina) y lineasPanel declara procedencia", async () => {
  const { campoCola, lineasPanel } = await import("../src/lib/metricas.js");
  const fake = (() => { let s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = v; }, removeItem: (k) => { delete s[k]; } }; })();
  fake.setItem("bmae.callflow.cola", JSON.stringify([
    { segmento: "pymes", resultado: "Interesado/a", nota: "", ts: "2026-10-08T09:00:00Z" },
    { segmento: "pymes", resultado: "Permanencia", nota: "", ts: "2026-10-07T09:00:00Z" },
    { segmento: "residencial", resultado: "Interesado/a", nota: "", ts: "2026-10-08T10:00:00Z" },
    { segmento: "", resultado: "Permanencia", nota: "", ts: "2026-10-05T09:00:00Z" },
  ]));
  const m = campoCola({ storage: fake, hoy: "2026-10-08" });
  assert.equal(m.totalEnCola, 4);
  assert.equal(m.deHoy, 2);
  assert.deepEqual(m.porSegmento, { pymes: 2, residencial: 1, "sin-segmentar": 1 });
  assert.equal(m.resultadosPorSegmento.pymes["Interesado/a"], 1);
  assert.equal(m.resultadosPorSegmento.pymes.Permanencia, 1);

  const filas = lineasPanel({ cola: m, albaranes: { num: 0, total: 0 }, cadena: { numRegistros: 0 } });
  const porTitulo = filas.find((f) => f[0].startsWith("  · pymes"));
  assert.ok(porTitulo[2].includes("Interesado/a ×1"));
  assert.ok(filas.find((f) => f[0].includes("Facturas"))[2].includes("cert AEAT"));
  assert.ok(filas.find((f) => f[0].includes("Albaranes"))[2].includes("vacío"));

  // el panel pinta la sección B3 aunque la máquina esté vacía (nunca silencio)
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.sessionStorage.setItem("bmae.callflow.cola", JSON.stringify([{ segmento: "pymes", resultado: "Interesado/a", ts: "2026-10-08T09:00:00Z" }]));
  dom.window.location.hash = "#/panel";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Métricas de campo (C9 §4)"));
  assert.ok(app.textContent.includes("Sin telemetría"));
  assert.ok(app.textContent.includes("pymes · 1") || app.textContent.includes("· pymes"));
});

test("ghdevice B1: rol = permiso real del repo (direccion/gestor/comercial), menú shell filtrado por rol", async () => {
  const { rolDePermiso } = await import("../src/lib/ghdevice.js");
  assert.equal(rolDePermiso("admin"), "direccion");
  assert.equal(rolDePermiso("maintain"), "direccion");
  assert.equal(rolDePermiso("push"), "gestor");
  assert.equal(rolDePermiso("triage"), "comercial");
  assert.equal(rolDePermiso("pull"), "comercial");
  assert.equal(rolDePermiso(null), null);

  const { itemsPara } = await import("../src/lib/shell.js");
  const nombres = (rr) => itemsPara(rr).map((i) => i[1]);
  // comercial: fuera Suministros/Solar/Facturas/Albaranes/Pipeline; dentro Panel/Guiones/Comparador
  const comercial = nombres(["comercial"]);
  assert.ok(comercial.includes("Guiones") && comercial.includes("Panel") && comercial.includes("Comparador"));
  assert.ok(!comercial.includes("Pipeline") && !comercial.includes("Facturas") && !comercial.includes("Albaranes"));
  assert.ok(comercial.includes("Prospectos")); // comercial prospecta, no cobra
  // gestor: todo visible
  const gestor = nombres(["gestor"]);
  assert.ok(gestor.includes("Pipeline") && gestor.includes("Albaranes"));
  // roles vacíos → sin filtrar (no fingir fence con datos vacíos)
  assert.equal(nombres([]).length, 11);
  // dirección = 8 también
  assert.equal(nombres(["direccion"]).length, 11);

  // conBarra aplica el filtro de verdad: rol comercial en sesión → nav sin Pipeline
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["comercial"]));
  dom.window.location.hash = "#/callflow";
  await resolver();
  await sleep(30);
  const nav = [...document.querySelectorAll("#app nav.app-side a")].map((a) => a.textContent);
  assert.ok(nav.includes("Guiones"));
  assert.ok(!nav.includes("Pipeline"));
  assert.ok(!nav.includes("Facturas"));
});

test("incidencias B5: compromiso de label o de body, vencida primero, RMA leído, vacío honesto", async () => {
  const { aFilas, estadoDe, compromisoDe } = await import("../src/lib/incidenciasgh.js");
  assert.equal(estadoDe(["estado-inc:en-curso"]), "en-curso");
  assert.equal(compromisoDe(["compromiso:2026-11-01"]), "2026-11-01");
  assert.equal(compromisoDe([], "…\nFecha compromiso (SLA YYYY-MM-DD): 2026-10-20"), "2026-10-20");
  const issues = [
    { number: 71, title: "Inc inversor", state: "open", html_url: "gh/71", labels: [{ name: "canal:incidencia" }, { name: "estado-inc:abierta" }, { name: "compromiso:2026-10-20" }], body: "" },
    { number: 72, title: "Inc contador", state: "open", html_url: "gh/72", labels: [{ name: "canal:incidencia" }, { name: "compromiso:2026-09-30" }], body: "RMA: TT-ADIT-311 abierto" },
    { number: 73, title: "Inc ya hecha", state: "closed", html_url: "gh/73", labels: [{ name: "canal:incidencia" }, { name: "estado-inc:resuelta" }, { name: "compromiso:2026-09-15" }], body: "" },
    { number: 74, title: "Inc sin sla", state: "open", html_url: "gh/74", labels: [{ name: "canal:incidencia" }], body: "Fecha compromiso: —" },
  ];
  const { filas, abiertas, vencidas } = aFilas(issues, { hoy: "2026-10-08" });
  assert.equal(abiertas, 3);    // la cerrada no cuenta
  assert.equal(vencidas, 1);    // solo la #72 (30-sep, abierta)
  assert.equal(filas[0].id, "#72");
  assert.equal(filas[0].vencida, true);
  assert.equal(filas[0].rma, "TT-ADIT-311");
  const sin = filas.find((f) => f.id === "#74");
  assert.equal(sin.vencida, false);
  const res = filas.find((f) => f.id === "#73"); // vence pasado pero cerrada/resuelta → no en rojo
  assert.equal(res.vencida, false);

  // página sin repo/token: estado vacío honesto propone el gesto 🛠
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.location.hash = "#/incidencias";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Incidencias y garantías"));
  assert.ok(app.textContent.includes("REPO_OPERACION") || app.textContent.includes("issue 🛠"));
});

test("documentos B4: libro vivo mapeado, marcas honestas, vacío con el gesto CLI", async () => {
  const { aFilas, resumen } = await import("../src/lib/documentos.js");
  const libro = {
    emisor: { nombre: "BMAE Energía S.L.", nif: "ESB99999999" },
    docs: [
      { numero: "DOC-CONTRATO-20261008-0001", tipo: "contrato", ref_cliente: "CLI-0042", fecha: "2026-10-08T10:00:00Z", pdf: "datos/documentos/pdf/x.pdf", huella: "a".repeat(64) },
      { numero: "DOC-RGPD-20261008-0002", tipo: "anexo-rgpd", ref_cliente: "CLI-0043", fecha: "2026-10-08T11:00:00Z", pdf: "datos/documentos/pdf/y.pdf", huella: "b".repeat(64) },
    ],
    ultimo: "DOC-RGPD-20261008-0002",
  };
  const filas = aFilas(libro.docs);
  assert.equal(filas[0].numero, "DOC-RGPD-20261008-0002"); // reciente primero
  assert.equal(filas[0].tipoTxt, "Anexo RGPD");
  assert.equal(filas[1].huellaCorta, "aaaaaaaaaaaa…");
  const r = resumen(libro);
  assert.equal(r.num, 2); assert.equal(r.ultimo, "DOC-RGPD-20261008-0002"); assert.equal(r.nifPendiente, false);
  assert.equal(resumen({ emisor: { nif: "PENDIENTE" }, docs: [] }).nifPendiente, true);

  // página con libro semilla real (docs: [] en este repo): vacío honesto + gesto CLI
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.location.hash = "#/documentos";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("contratos y anexos RGPD"));
  assert.ok(app.textContent.includes("revisión legal"));
  assert.ok(app.textContent.includes("documentos_plantilla.py")); // el gesto CLI, en texto
});

test("portal cliente B2: token/llave, dossier demo, factura leída EN LOCAL, contrato bmae.consumo, mailto honrado", async () => {
  const { tokenValido, extraerFactura, consumoParaComparativa, mailtoComercial } = await import("../src/lib/portalcliente.js");
  assert.equal(tokenValido("pc-cli0042-abcdef0123456789"), true);
  assert.equal(tokenValido("pc-cli0042-abc"), false);
  assert.equal(tokenValido("../secreto"), false);
  assert.equal(tokenValido("pc-x-000000000000000f"), true);

  const ext = extraerFactura("IBERDROLA\nConsumo 1.215 kWh\nPotencia 5,50 kW\nTOTAL A PAGAR 226,61 EUR\nCUPS ES0024000000000001AA");
  assert.equal(ext.kwh, 1215); assert.equal(ext.kw, 5.5); assert.equal(ext.importe, 226.61);
  assert.equal(ext.confianza, "alta"); assert.equal(ext.lecturaManualRecomendada, false);
  assert.deepEqual(consumoParaComparativa(ext), { kwh: 1215, kw: 5.5, origen: "portal-cliente" });
  assert.equal(consumoParaComparativa({ kwh: null, kw: 5, confianza: "baja" }), null);
  // nunca el subtotal: prioridad "total a pagar" sobre "subtotal"
  const ext2 = extraerFactura("Subtotal 178,20 €\nIVA\nTOTAL A PAGAR 226,61 €\nConsumo 950 kWh\nPotencia 5,50 kW");
  assert.equal(ext2.importe, 226.61);
  // calibración 08-oct (3 formatos reales → fixtures sintéticos sin PII)
  const apoloT = "CUPS: ES0021000001234000AD\nConsumo Acumulado 9.799,11 kWh\nConsumo Firmado 35.530 kWh/Año\nPot. P1 (kW) 17,00\nPot. P2 (kW) 19,80\nPot. P6 (kW) 19,80\nTotal Importe Factura 539,84 €\nApolo Business S.L.";
  const ea = extraerFactura(apoloT);
  assert.equal(ea.kwh, 35530);        // anual firmado tiene prioridad en la comparativa
  assert.equal(ea.campos.kwh, 9799);  // el del periodo queda en campos
  assert.equal(ea.kw, 19.8);          // máx P1..P6
  assert.equal(ea.importe, 539.84);
  assert.equal(ea.comercializadora, "Apolo Energies"); // antes que «iberdrola» en otras
  const elcT = "ENERGÍA LIBRE COMERCIALIZADORA, SLU.\nCUPS: ES0031100000000001AA0F\nPotencia contratada (kW): P1:10,000 P2:19,800 P3:19,800\nP4 125 kWh x 0,141607 €/kWh\nP5 90 kWh x 0,141415 €/kWh\nP6 124 kWh x 0,141262 €/kWh\nP4 125 kWh x 0,028473 €/kWh\nP5 90 kWh x 0,029225 €/kWh\nP6 124 kWh x 0,027104 €/kWh\nIMPORTE FACTURA 197,35 €";
  const ee = extraerFactura(elcT);
  assert.equal(ee.kwh, 339);          // 125+90+124 únicos, sin duplicar
  assert.equal(ee.kw, 19.8);          // «P1:10,000 …» también se entiende
  assert.equal(ee.importe, 197.35);
  assert.equal(ee.comercializadora, "Energia Libre Comercializadora");
  const ib = extraerFactura("IBERDROLA CLIENTES, S.A.U.\nIdentificación punto de suministro (CUPS): ES 0021 0000 1181 9574 FD\nEnergía consumida 326,42 kWh\nPotencia punta: 5,75 kW\nIMPORTE TOTAL 94,94 €");
  assert.deepEqual([ib.kwh, ib.kw, ib.importe, ib.comercializadora], [326, 5.75, 94.94, "Iberdrola"]);
  assert.equal(ib.campos.cups, "ES0021000011819574FD"); // normalizado sin espacios
  // confianza baja → lectura manual recomendada
  const floja = extraerFactura("Texto sin estructura ninguna");
  assert.equal(floja.confianza, "baja"); assert.equal(floja.lecturaManualRecomendada, true);
  const m = mailtoComercial("c@x.test", ext, "pc-cli0042-abcdef0123456789");
  assert.ok(m.startsWith("mailto:c@x.test") && decodeURIComponent(m).includes("revísalo tú"));

  // página: ruta pública sin sesión; token demo vive; la subida escribe en sessionStorage
  dom.window.sessionStorage.clear();
  dom.window.location.hash = "#/cliente/pc-demo-0123456789abcdef";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Hola, Panadería de Ejemplo"));
  assert.ok(app.textContent.includes("ALB-2026-0001"));
  const ta = app.querySelector("textarea");
  assert.ok(ta);
  ta.value = "Consumo 800 kWh\nPotencia 3,45 kW\nTOTAL A PAGAR 120,40 €\nCUPS ES0031100000000001AA";
  [...app.querySelectorAll("button")].find((b) => b.textContent.includes("Leer mi factura")).click();
  await sleep(5);
  assert.ok(app.textContent.includes("800 kWh"));
  const use = [...app.querySelectorAll("button")].find((b) => b.textContent.includes("Usar estos números"));
  assert.ok(use);
  use.click();
  await sleep(5);
  assert.deepEqual(JSON.parse(dom.window.sessionStorage.getItem("bmae.consumo")), { kwh: 800, kw: 3.45, origen: "portal-cliente" });
  assert.ok(app.querySelector('a[href="#/comparador"]')); // salto honesto a su comparativa
  // token malo → vacío honesto, nunca error en bruto
  dom.window.location.hash = "#/cliente/no-valido";
  await resolver();
  await sleep(30);
  assert.ok(document.getElementById("app").textContent.includes("no parece correcto"));
  dom.window.sessionStorage.removeItem("bmae.consumo");
});

test("prospectos A1: búsqueda tolerante + página viva del dataset real (32k) + guionar → bmae.prospecto → banner Call-Flow", async () => {
  const { buscar } = await import("../src/lib/prospectos.js");
  const demo = [
    { id: "prs-p1", nombre: "PANADERIA LA DEMO SL", ciudad: "Valencia", cp: "46001", telefono: "966 55 51 11", email: "hola@demo.test", web: "demo.test" },
    { id: "prs-p2", nombre: "Talleres Fuji", ciudad: "Paterna", cp: "46980", telefono: "", email: "fuji@demo.test", web: "" },
    { id: "prs-p3", nombre: "José Martínez (demo)", ciudad: "Manises", cp: "46940", telefono: "640 20 30 40", email: "j@demo.test", web: "j.test" },
  ];
  assert.ok(buscar(demo, "fuji").length === 1);
  assert.ok(buscar(demo, "46001")[0].id === "prs-p1");       // cp exacto primero
  assert.ok(buscar(demo, "jose").length >= 1);               // tolerante a tildes
  assert.deepEqual(buscar(demo, "x"), []);                   // <2 chars = no busca
  assert.deepEqual(buscar([], "algo"), []);

  // página con el dataset REAL del repo: índice y carga perezosa de Valencia
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.location.hash = "#/prospectos";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("prospectos únicos"));
  assert.ok(app.textContent.includes("duplicados descartados"));
  const btnVal = [...app.querySelectorAll(".pro-ciudad")].find((b) => b.textContent.includes("Valencia"));
  assert.ok(btnVal, "debe existir la ciudad Valencia en el índice real");
  btnVal.click();
  await sleep(300); // 1-2 MB de ciudad: espera honesta en tests
  assert.ok(app.textContent.includes("prospectos cargados en esta sesión"));
  // guionar → contracto bmae.prospecto → banner en #/callflow
  const guionar = app.querySelector(".app-pedido-linea .btn--primary");
  assert.ok(guionar && guionar.textContent.includes("Guionar"));
  guionar.click();
  await sleep(20);
  assert.ok(dom.window.sessionStorage.getItem("bmae.prospecto"));
  dom.window.location.hash = "#/callflow";
  await resolver();
  await sleep(40);
  assert.ok(document.getElementById("app").textContent.includes("Guionando a:"));
  // quitar limpia
  document.getElementById("pro-quitar").click();
  assert.equal(dom.window.sessionStorage.getItem("bmae.prospecto"), null);
});

test("página captación: CUPS inválido = error; válido avanza y guarda parcial", async () => {
  dom.window.sessionStorage.clear();
  dom.window.location.hash = "#/captacion";
  await resolver();
  await sleep(30);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Cuéntanos tu suministro"));

  const input = app.querySelector("input");
  input.value = "corta";
  input.dispatchEvent(new dom.window.Event("blur"));
  const btn = [...app.querySelectorAll("button")].find((b) => b.textContent.includes("Seguir"));
  btn.click();
  assert.ok(app.textContent.includes("Cuéntanos tu suministro"), "no debe avanzar con CUPS inválido");

  input.value = "ES0021000000000001AA";
  btn.click();
  await sleep(10);
  assert.ok(app.textContent.includes("Recibido") || app.textContent.includes("Entrar y ver"));
  assert.equal(dom.window.sessionStorage.getItem("bmae.cups"), "ES0021000000000001AA");
});

test("honesto: sello declara reales+estimados y modo completo", () => {
  const s = sello({ mesesReales: 14, mesesEstimados: 22 });
  assert.equal(s.texto, "14 meses reales + 22 estimados");
  assert.equal(s.completo, false);
  const c = sello({ mesesReales: 36, mesesEstimados: 0 });
  assert.equal(c.completo, true);
  const chip = chipSello({ mesesReales: 36, mesesEstimados: 0 });
  assert.ok(chip.classList.contains("app-sello--completo"));
  const euros = eur(2870).replace(/[.\s ]/g, ""); // ICU-sensitive: 2870€ / 2.870 € / 2 870 €
  assert.equal(euros, "2870€");
});

test("api: mock contractual marcado como tal (honestidad de origen)", async () => {
  const r = await api("cualquiera", { mock: { ok: 1 } });
  assert.equal(r.origen, "mock-contrato");
  let lanzo = false;
  try { await api("sin-mock"); } catch { lanzo = true; }
  assert.ok(lanzo, "sin mock y sin backend debe fallar, no fingir");
});

test("cola lib/cola.js: contrato (tope 200, nota ≤140, sin resultado no encola, fusión conserva ante fallo)", async () => {
  const { encolar, leerCola, contarPendientes, fusionarEnTwenty } = await import("../src/lib/cola.js");
  const fake = (() => { let s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = v; }, clear: () => { s = {}; } }; })();

  assert.throws(() => encolar({ nota: "sin resultado" }, fake), /resultado/);
  const larga = "x".repeat(300);
  encolar({ segmento: "pymes", resultado: "Permanencia", nota: larga }, fake);
  assert.equal(leerCola(fake)[0].nota.length, 140);
  for (let i = 0; i < 250; i++) encolar({ resultado: "No contesta", nota: `${i}` }, fake);
  assert.equal(contarPendientes(fake), 200); // tope heredado ADR-028

  let subidas = 0;
  const r1 = await fusionarEnTwenty(async () => { throw new Error("sin red"); }, fake).catch(() => ({ fallo: true }));
  assert.ok(r1.fallo);
  assert.equal(contarPendientes(fake), 200); // ante fallo NO se vacía
  const r2 = await fusionarEnTwenty(async (cola) => { subidas = cola.length; }, fake);
  assert.equal(subidas, 200);
  assert.equal(r2.enviadas, 200);
  assert.equal(contarPendientes(fake), 0);
});

test("twenty lib/twenty.js: contrato F4 (esquema estricto, Bearer, 200≠0 vacía, incoherente/500 conserva)", async () => {
  const { subirTwenty, aPayload, huella } = await import("../src/lib/twenty.js");
  const { fusionarEnTwenty } = await import("../src/lib/cola.js");
  const fake = (() => { let s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = v; }, clear: () => { s = {}; } }; })();
  fake.setItem("bmae_access", "tk.falso");
  const gest = [
    { segmento: "pymes", resultado: "Interesado/a", nota: "foto factura".padEnd(300, "x"), ts: "2026-10-07T10:00:00.000Z", extra: "BASURA" },
    { segmento: "residencial", resultado: "Permanencia", nota: "", ts: "2026-10-07T10:01:00.000Z" },
  ];

  // esquema estricto: solo los 6 campos del contrato, nota recortada, huella determinista
  const p = aPayload(gest);
  assert.deepEqual(Object.keys(p[0]).sort(), ["huella", "nota", "pos", "resultado", "segmento", "ts"]);
  assert.equal(p[0].nota.length, 140);
  assert.equal(p[0].pos, 0); assert.equal(p[1].pos, 1);
  assert.equal(huella(gest[0]), huella(gest[0])); // idempotencia estable
  assert.notEqual(huella(gest[0]), huella(gest[1]));

  // sin BASE → error honesto y nada tocado (canal aún no enchufado)
  await assert.rejects(() => subirTwenty(gest, { fetchImpl: () => { throw new Error("no debe llamarse"); } }), /sin endpoint/);
  assert.equal((await subirTwenty([], {}) || {}).subidas, 0);

  // 200 + procesadas==N → el cliente red recibe Bearer y esquema; fusionarEnTwenty vacía
  let recibido = null;
  const ok = async (url, cfg) => { recibido = { url, cfg }; return { ok: true, json: async () => ({ procesadas: 2 }) }; };
  fake.setItem("bmae.callflow.cola", JSON.stringify(gest));
  const r = await fusionarEnTwenty((lote) => subirTwenty(lote, { base: "https://erp.test", fetchImpl: ok, storage: fake }), fake);
  assert.equal(r.enviadas, 2);
  assert.equal(r.quedan, 0);
  assert.equal(recibido.url, "https://erp.test/api/method/bmae.callflow.registrar_gestiones");
  assert.equal(recibido.cfg.headers.Authorization, "Bearer tk.falso");
  assert.equal(recibido.cfg.method, "POST");
  const cuerpo = JSON.parse(recibido.cfg.body);
  assert.equal(cuerpo.gestiones.length, 2);
  assert.ok(!("extra" in cuerpo.gestiones[0]));

  // respuesta incoherente (procesadas≠N) → no vacía
  const inc = async () => ({ ok: true, json: async () => ({ procesadas: 1 }) });
  fake.setItem("bmae.callflow.cola", JSON.stringify(gest));
  await assert.rejects(() => fusionarEnTwenty((lote) => subirTwenty(lote, { base: "https://erp.test", fetchImpl: inc, storage: fake }), fake), /incoherente/);
  assert.equal(JSON.parse(fake.getItem("bmae.callflow.cola")).length, 2);

  // 500 → ApiError y cola intacta; red caída → mensaje honesto
  const ko = async () => ({ ok: false, status: 500 });
  fake.setItem("bmae.callflow.cola", JSON.stringify(gest));
  await assert.rejects(() => fusionarEnTwenty((lote) => subirTwenty(lote, { base: "https://erp.test", fetchImpl: ko, storage: fake }), fake), /500/);
  assert.equal(JSON.parse(fake.getItem("bmae.callflow.cola")).length, 2);
  await assert.rejects(() => subirTwenty(gest, { base: "https://erp.test", fetchImpl: () => { throw new TypeError("fetch failed"); }, storage: fake }), /se ha tocado/i);
});

test("canalgithub: contrato GitHub-total §4 (lineas§parser, Bearer gh, 201 vacía, 403/red conserva, sin identidad honesto)", async () => {
  const { subirGitHub, aLineas, cuerpoBuzon } = await import("../src/lib/canalgithub.js");
  const { fusionarEnTwenty } = await import("../src/lib/cola.js");
  const fake = (() => { let s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = v; }, clear: () => { s = {}; } }; })();
  const gest = [
    { segmento: "pymes", resultado: "Interesado/a", nota: "foto factura", ts: "2026-10-07T10:00:00.000Z" },
    { segmento: "residencial", resultado: "Permanencia", nota: "", ts: "2026-10-07T10:01:00.000Z" },
  ];

  // formato espejo del parser del workflow (una gestión por línea, canal fijo)
  const lineas = aLineas(gest);
  assert.equal(lineas.length, 2);
  for (const l of lineas) {
    const g = JSON.parse(l);
    assert.equal(g.canal, "callflow");
    assert.equal(g.v, 1);
    assert.ok("huella" in g && "pos" in g);
  }
  assert.ok(cuerpoBuzon(gest).body.includes("canalgithub §4"));

  // sin repo/token → error honesto, sin red
  await assert.rejects(() => subirGitHub(gest, { fetchImpl: () => { throw new Error("no debe llamarse"); } }), /sin identidad|sin repo/);
  assert.equal((await subirGitHub([], {}) || {}).subidas, 0);

  // 201 → el cliente recibe Bearer del token de sesión, la cola se vacía tras éxito
  let recibido = null;
  const ok = async (url, cfg) => { recibido = { url, cfg }; return { ok: true, status: 201, json: async () => ({ html_url: "https://gh/c/1" }) }; };
  fake.setItem("bmae_gh_token", "gh.fake.token");
  fake.setItem("bmae.callflow.cola", JSON.stringify(gest));
  const r = await fusionarEnTwenty((lote) => subirGitHub(lote, { repo: "org/operacion", fetchImpl: ok, storage: fake }), fake);
  assert.equal(r.enviadas, 2);
  assert.equal(r.quedan, 0);
  assert.equal(recibido.url, "https://api.github.com/repos/org/operacion/issues/1/comments");
  assert.equal(recibido.cfg.headers.Authorization, "Bearer gh.fake.token");
  assert.equal(recibido.cfg.headers["X-GitHub-Api-Version"], "2022-11-28");
  const cuerpo = JSON.parse(recibido.cfg.body);
  assert.equal(cuerpo.body.split("\n").filter((l) => l.startsWith("{")).length, 2);

  // 403 (rate/permiso) → cola intacta
  const ko = async () => ({ ok: false, status: 403 });
  fake.setItem("bmae.callflow.cola", JSON.stringify(gest));
  await assert.rejects(() => fusionarEnTwenty((lote) => subirGitHub(lote, { repo: "org/operacion", fetchImpl: ko, storage: fake }), fake), /403/);
  assert.equal(JSON.parse(fake.getItem("bmae.callflow.cola")).length, 2);
  await assert.rejects(() => subirGitHub(gest, { repo: "org/operacion", fetchImpl: () => { throw new TypeError("fetch failed"); }, storage: fake }), /no se ha tocado/i);
});

test("ghdevice (w2): device flow completo contra fetch simulado — pending/slow_down, puente de claves, expiración y honestidad sin CLIENT_ID", async () => {
  const { iniciarDevice, esperarToken, conectarGitHub, desconectar } = await import("../src/lib/ghdevice.js");

  // sin CLIENT_ID → error honesto, sin red
  await assert.rejects(() => iniciarDevice({ clientId: "", fetchImpl: () => { throw new Error("no debe llamarse"); } }), /no cableado|CLIENT_ID/);

  // device/code → user_code
  const resp = (datos, status = 200) => ({ ok: status < 400, status, json: async () => datos });
  const fCode = async (url, cfg) => {
    assert.equal(url, "https://github.com/login/device/code");
    assert.match(cfg.body, /client_id=CID.LOCAL/);
    assert.match(cfg.body, /scope=repo/);
    return resp({ device_code: "DC1", user_code: "WDJB-MJHT", verification_uri: "https://github.com/login/device", expires_in: 900, interval: 5 });
  };
  const d = await iniciarDevice({ clientId: "CID.LOCAL", fetchImpl: fCode });
  assert.equal(d.userCode, "WDJB-MJHT");
  assert.equal(d.interval, 5);

  // sondeo: authorization_pending → slow_down (sube espera) → token
  let toquesEspera = [];
  const sleep = async (ms) => { toquesEspera.push(ms); };
  let llamadas = 0;
  const fToken = async () => {
    const fase = ["pend", "slow", "ok"][Math.min(llamadas, 2)];
    llamadas += 1;
    if (fase === "pend") return resp({ error: "authorization_pending" });
    if (fase === "slow") return resp({ error: "slow_down" });
    return resp({ access_token: "gh.tok.w2" });
  };
  const tok = await esperarToken({ deviceCode: "DC1", clientId: "CID.LOCAL", interval: 5, fetchImpl: fToken, sleep });
  assert.equal(tok, "gh.tok.w2");
  assert.equal(toquesEspera[0], 5000);
  assert.equal(toquesEspera[1], 5000);  // pending: espera se mantiene
  assert.equal(toquesEspera[2], 10000); // slow_down: +5 s (y sondeo posterior)
  // expirado → error claro
  await assert.rejects(() => esperarToken({ deviceCode: "DC1", clientId: "CID.LOCAL", fetchImpl: async () => resp({ error: "expired_token" }), sleep }), /expir/);

  // flujo completo guarda el puente de claves B (bmae_access) + roles por repo
  const fake = (() => { let s = {}; return { getItem: (k) => s[k] ?? null, setItem: (k, v) => { s[k] = v; }, removeItem: (k) => { delete s[k]; }, clear: () => { s = {}; } }; })();
  const fTodo = async (url, cfg) => {
    if (url.includes("/device/code")) return resp({ device_code: "DC2", user_code: "ZZZZ", verification_uri: "u", interval: 5 });
    if (url.includes("/oauth/access_token")) return resp({ access_token: "gh.tok.w2" });
    if (url.endsWith("/user")) return resp({ login: "comercial1" });
    if (url.includes("/repos/org/operacion")) return resp({ permissions: { push: true } });
    return resp({ message: "nope" }, 404);
  };
  let codigoVisto = null;
  const r = await conectarGitHub({ clientId: "CID.LOCAL", repo: "org/operacion", fetchImpl: fTodo, sleep, storage: fake, onCodigo: (x) => { codigoVisto = x.userCode; } });
  assert.equal(codigoVisto, "ZZZZ");
  assert.equal(r.login, "comercial1");
  assert.equal(r.operativo, true);
  assert.equal(fake.getItem("bmae_gh_token"), "gh.tok.w2");
  assert.equal(fake.getItem("bmae_access"), "gh.tok.w2");
  // B1: rol = permiso real del repo (push → gestor; nunca rol inventado)
  assert.equal(r.permiso, "push");
  assert.equal(r.rol, "gestor");
  assert.deepEqual(JSON.parse(fake.getItem("bmae_roles")), ["gestor"]);
  desconectar({ storage: fake });
  assert.equal(fake.getItem("bmae_gh_token"), null);
  assert.equal(fake.getItem("bmae_access"), null);
});

test("pipelinegh (w3): columnas vivas desde issues GitHub (estado:*), sin token = error honesto, #/gestor hace fallback contractual", async () => {
  const { cargarPipeline, aColumnas, etapaDe } = await import("../src/lib/pipelinegh.js");
  // mapeo puro
  assert.equal(etapaDe(["canal:callflow", "estado:ganada"]), "ganada");
  assert.equal(etapaDe(["canal:callflow"]), "contactada"); // default
  const issues = [
    { number: 41, title: "[pymes] Interesado/a — llamada 2026-10-07", state: "open", created_at: "2026-10-07T10:00:00Z", html_url: "https://gh/41", labels: [{ name: "canal:callflow" }, { name: "estado:propuesta" }, { name: "segmento:pymes" }] },
    { number: 42, title: "Ganada", state: "open", created_at: "2026-10-07T11:00:00Z", html_url: "https://gh/42", labels: [{ name: "canal:callflow" }, { name: "estado:ganada" }] },
    { number: 43, title: "sin estado", state: "closed", created_at: "2026-10-07T12:00:00Z", html_url: "https://gh/43", labels: [{ name: "canal:callflow" }] },
    { number: 44, title: "PR colado", state: "open", pull_request: {}, labels: [] }, // mismo endpoint: se filtra
  ];
  const { columnas, vivas } = aColumnas(issues.filter((i) => !i.pull_request));
  assert.equal(columnas.length, 4);
  assert.equal(columnas[0].titulo, "Contactada");
  const porTitulo = Object.fromEntries(columnas.map((c) => [c.titulo, c.tarjetas]));
  assert.equal(porTitulo["Propuesta"][0].id, "#41");
  assert.equal(porTitulo["Propuesta"][0].cliente, "Interesado/a — llamada 2026-10-07");
  assert.ok(porTitulo["Propuesta"][0].detalle.includes("segmento:pymes"));
  assert.equal(porTitulo["Ganada"].length, 1);
  assert.equal(porTitulo["Contactada"].length, 1); // la #43 va al default
  assert.equal(vivas, 2); // #43 cerrada no cuenta

  // sin token/repo → error honesto, sin red
  await assert.rejects(() => cargarPipeline({ repo: "", fetchImpl: () => { throw new Error("no debe llamarse"); } }), /entrar con GitHub|REPO_OPERACION/);

  // cargar contra API simulada: filtra PRs y cuenta abiertas
  const fApi = async (url, cfg) => {
    assert.ok(url.startsWith("https://api.github.com/repos/org/operacion/issues"));
    assert.match(url, /labels=canal:callflow/);
    assert.equal(cfg.headers.Authorization, "Bearer gh.fake");
    return { ok: true, status: 200, json: async () => issues };
  };
  const vivo = await cargarPipeline({ repo: "org/operacion", token: "gh.fake", fetchImpl: fApi });
  assert.equal(vivo.vivas, 2);
  const total = vivo.columnas.reduce((n, c) => n + c.tarjetas.length, 0);
  assert.equal(total, 3);

  // #/gestor sin token GitHub: fallback contractual declarado (nunca finge vivo).
  // NB: es ruta privada → necesita el puente B (bmae_access); el canal CRM queda vacío.
  dom.window.sessionStorage.setItem("bmae_access", "t.access.falso");
  dom.window.sessionStorage.setItem("bmae_roles", JSON.stringify(["gestor"]));
  dom.window.sessionStorage.removeItem("bmae_gh_token");
  dom.window.location.hash = "#/gestor";
  const app = document.getElementById("app");
  await resolver();
  await sleep(10);
  assert.ok(app.textContent.includes("Vista contractual"));
  assert.ok(app.textContent.includes("REPO_OPERACION"));
});

test("callflow: vaciado de actividad → estado vacío honesto con CTA", async () => {
  // NB: ruta privada — test 7 (captación) limpia la sesión que montó el test 5
  dom.window.sessionStorage.setItem("bmae_access", "t");
  dom.window.sessionStorage.removeItem("bmae.callflow.cola");
  dom.window.location.hash = "#/callflow/actividad";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.querySelector(".estado-vacio"));
  assert.ok(app.textContent.includes("Aún no hay gestiones"));
});

test("callflow: actividad con datos de cola real (KPIs, embudo, registro)", async () => {
  const { encolar } = await import("../src/lib/cola.js");
  dom.window.sessionStorage.setItem("bmae_access", "t");
  dom.window.sessionStorage.removeItem("bmae.callflow.cola"); // arranque limpio: no heredar colas de otros tests
  encolar({ segmento: "pymes", resultado: "Permanencia", nota: "valle" }, dom.window.sessionStorage);
  encolar({ segmento: "residencial", resultado: "Interesado/a", nota: "foto factura" }, dom.window.sessionStorage);
  dom.window.location.hash = "#/callflow/actividad";
  await resolver();
  await sleep(40);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Mi actividad"));
  assert.equal(app.querySelectorAll(".kpi").length, 3);
  assert.ok(app.textContent.includes("Permanencia"));
  assert.ok(app.textContent.includes("Interesado/a"));
  assert.ok(app.querySelector(".cf-funnel"));
});

test("callflow: admin lectura — catálogo real y guiones versionados", async () => {
  dom.window.sessionStorage.setItem("bmae_access", "t"); // privada: no depender del orden de los tests
  dom.window.location.hash = "#/callflow/admin";
  await resolver();
  await sleep(60);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("Lectura pura"));
  assert.ok(app.textContent.includes("8/8 ofertas activas") || app.textContent.includes("ofertas activas"));
  assert.ok(app.textContent.includes("Guiones versionados"));
  assert.ok(app.textContent.includes("18 nodos"));
});

test("router: si una página explota, monta estado-error visible (no blanco)", async () => {
  const { registrarRuta } = await import("../src/main.js");
  dom.window.sessionStorage.setItem("bmae_access", "t");
  registrarRuta("#/rompe", () => { throw new Error("boom deliberado"); });
  dom.window.location.hash = "#/rompe";
  appEl().innerHTML = "";
  await resolver();
  await sleep(10);
  const err = document.querySelector("#app .estado-error");
  assert.ok(err, "estado-error visible obligatorio §9");
  assert.ok(err.textContent.includes("boom deliberado"));
  assert.equal(err.getAttribute("role"), "alert");
});

const appEl = () => document.getElementById("app");

test("callflow guardián anti-PII heredado: teléfono/email/documento bloqueados", () => {
  assert.ok(guardianPII("quedamos en el 612345678").includes("teléfono"));
  assert.ok(guardianPII("escríbele a pepe@correo.com").includes("email"));
  assert.ok(guardianPII("su dni es 12345678Z").toLowerCase().includes("documento"));
  assert.equal(guardianPII("prefiere tarifa nocturna, vuelvo el lunes"), null);
});

test("callflow: monta guiones reales y abre el verbatim v4.4.8", async () => {
  dom.window.sessionStorage.setItem("bmae_access", "t");
  dom.window.location.hash = "#/callflow";
  await resolver();
  await sleep(60);
  const app = document.getElementById("app");
  assert.ok(app.textContent.includes("¿Con qué segmento vas a llamar hoy?"));
  assert.ok(app.textContent.includes("Guion Residencial"));
  assert.ok(app.textContent.includes("Guion PYME"));

  const abrir = [...app.querySelectorAll("button")].find((b) => b.textContent.includes("Abrir guion"));
  abrir.click();
  await sleep(30);
  // nodo 'inicio' con verbatim real de la v4.4.8
  assert.ok(app.textContent.includes("REGLA MADRE") || app.textContent.includes("Antes de marcar"));
  // personalización [NOMBRE_CLIENTE]
  const nom = app.querySelector("#cf-nombre");
  nom.value = "Pilar";
  nom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  // navegar: primera opción → apertura
  const op1 = [...app.querySelectorAll(".app-acciones-form button")][0];
  op1.click();
  await sleep(10);
  assert.ok(app.textContent.includes("Departamento RESIDENCIAL de Iberdrola"), "verbatim apertura");
  assert.ok(app.textContent.includes("¿hablo con Pilar?"), "plantilla sustituida");
});

test("callflow: objeciones reales + registro con guardián", async () => {
  const app = document.getElementById("app");
  const sels = [...app.querySelectorAll("select")];
  const selObj = sels.find((s) => s.getAttribute("aria-label") === "Elegir objeción");
  selObj.value = "ya_tengo";
  selObj.dispatchEvent(new dom.window.Event("change"));
  assert.ok(app.textContent.includes("VALIDACIÓN") || app.textContent.toLowerCase().includes("valida"));

  const selRes = sels.find((s) => s.getAttribute("aria-label") === "Resultado de la llamada");
  selRes.value = "Permanencia";
  const nota = app.querySelector("textarea");
  nota.value = "le paso mi móvil 612 34 56 78 para seguimiento";
  const registrar = [...app.querySelectorAll("button")].find((b) => b.textContent.includes("Registrar gestión"));
  registrar.click();
  assert.ok(app.textContent.includes("teléfono"), "guardián debe bloquear");

  nota.value = "prefiere valle, vuelvo el lunes";
  const antes = JSON.parse(dom.window.sessionStorage.getItem("bmae.callflow.cola") || "[]").length;
  registrar.click();
  await sleep(10);
  const cola = JSON.parse(dom.window.sessionStorage.getItem("bmae.callflow.cola") || "[]");
  assert.equal(cola.length, antes + 1, "registra +1 gestión (sin depender de estado heredado)");
  assert.equal(cola[antes].resultado, "Permanencia");
  assert.ok(cola[antes].nota.includes("valle"));
  assert.equal(cola[0].resultado, "Permanencia");
});
