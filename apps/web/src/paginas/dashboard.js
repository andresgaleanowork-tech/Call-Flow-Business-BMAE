/** #/panel — dashboard cliente (privado). KPIs reales C5 + gráfica 36 m SVG. */

import { api } from "../lib/api.js";
import { chipSello } from "../lib/honesto.js";
import { cargarCadena, resumenCadena } from "../lib/verifactu.js";
import { contarPendientes } from "../lib/cola.js";
import { campoCola, lineasPanel } from "../lib/metricas.js";
import { cargarLibro as cargarAlbaranes, resumen as resumenAlbaranes } from "../lib/albaranes.js";
import { crearKpi } from "../../../../diseno/export/componentes.js";
import { dashboard as MOCK } from "../datos/mock.js";
import { conBarra, h1, panel } from "../lib/shell.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/panel", caja);
  const { datos } = await api("dashboard", { mock: MOCK });

  caja.append(h1(`Buenos días, ${datos.saludo}.`, datos.resumen));

  const kpis = document.createElement("div");
  kpis.className = "app-kpis";
  for (const k of datos.kpis) {
    const { el: kpi } = crearKpi({ titulo: k.titulo, valor: k.valor });
    if (k.delta) {
      const d = document.createElement("p");
      d.className = "app-kpi-delta";
      d.textContent = k.delta.texto; // texto plano: clase unifica tipografía y tono neutro
      kpi.append(d);
    }
    kpis.append(kpi);
  }
  caja.append(kpis);

  // gráfica 36 m — primeras 22 estimadas (borde claro), últimas 14 reales (sólidas) — C8 §1.3
  const p = panel();
  const cab = document.createElement("div");
  cab.className = "app-cab-flex";
  const h = document.createElement("h2");
  h.className = "app-h2-azul--flat";
  h.textContent = "Consumo · últimos 36 meses";
  const sello = chipSello(datos.sello);
  sello.classList.add("app-ml-auto");
  cab.append(h, sello);
  p.append(cab);
  p.append(grafica(datos.barras, datos.sello.mesesEstimados));
  const ley = document.createElement("p");
  ley.className = "app-lbl app-mt10";
  ley.innerHTML = "■ meses reales (factura) · ▨ meses estimados";
  p.append(ley);
  caja.append(p);

  const duo = document.createElement("div");
  duo.className = "app-grid-duo";
  const pa = panel();
  pa.innerHTML = `<h2 class="app-h2-azul--mb10">Alertas</h2>`;
  for (const a of datos.alertas) {
    const d = document.createElement("p");
    d.className = "app-alerta";
    const icono = a.tipo === "advertencia" ? "⚠" : "ℹ";
    d.innerHTML = `<span aria-hidden="true">${icono}</span> <b>${a.titulo}</b> ${a.detalle}`;
    pa.append(d);
  }
  const pp = panel();
  pp.innerHTML = `<h2 class="app-h2-azul--mb10">Tus pedidos</h2>`;
  for (const pd of datos.pedidos) {
    const d = document.createElement("p");
    d.className = "app-pedido-linea";
    d.innerHTML = `<span><span class="datos app-fw600">${pd.id}</span> · ${pd.asunto}</span>
      <span class="app-chip ${pd.tono === "ok" ? "app-chip--vf" : "app-chip--aviso"}">${pd.estado}</span>`;
    pp.append(d);
  }
  duo.append(pa, pp);
  caja.append(duo);

  // H2 — panel vivo GitHub-Total: cadena VeriFactu real + cola Call-Flow real.
  // Datos de ESTA instancia (repo + sessionStorage), nunca simulados.
  try {
    const cadena = await cargarCadena();
    const r = resumenCadena(cadena);
    const vivo = panel();
    vivo.innerHTML = `<h2 class="app-h2-azul--mb10">GitHub-Total vivo</h2>`;
    const pendientes = contarPendientes();
    const lineas = [
      ["Facturas en cadena VeriFactu", `${r.numRegistros}`, r.numRegistros ? `importe acumulado ${r.importeAcumulado.toFixed(2).replace(".", ",")} €` : "vacía hasta F4G·w1 (certificado AEAT)"],
      ["Última huella", r.ultimaHuellaCorta || "—", r.ultimaHuellaCorta ? "encadenada SHA-256" : "—"],
      ["Gestiones en cola Call-Flow", `${pendientes}`, pendientes ? "«Enviar al CRM» en #/callflow/actividad" : "cola vacía"],
    ];
    for (const [titulo, valor, detalle] of lineas) {
      const d = document.createElement("p");
      d.className = "app-pedido-linea";
      d.innerHTML = `<span>${titulo} · <b class="datos">${valor}</b></span><span class="app-chip">${detalle}</span>`;
      vivo.append(d);
    }
    const enlace = document.createElement("a");
    enlace.href = "#/facturas";
    enlace.textContent = chainEnlaceTexto(r);
    vivo.append(enlace);
    caja.append(vivo);
  } catch {
    // libro no legible: el panel vivo simplemente no se pinta; #/facturas lo cuenta honesto
  }

  // B3 — Métricas de campo C9 §4: SOLO lo que hay en esta máquina y en los
  // libros del repo. Nunca telemetría se envía; la procedencia va al lado.
  await pintarMetricasCampo(caja);
}

/** Métricas campo: siempre la mitad offline (la cola); albaranes/cadena si cargan. */
async function pintarMetricasCampo(caja) {
  let albaranes = null, cadenaRes = null;
  try { albaranes = resumenAlbaranes(await cargarAlbaranes()); } catch { /* libro no legible */ }
  try { const { resumenCadena } = await import("../lib/verifactu.js"); const { cargarCadena } = await import("../lib/verifactu.js"); cadenaRes = resumenCadena(await cargarCadena()); } catch { /* idem */ }
  const pv = panel();
  pv.innerHTML = `<h2 class="app-h2-azul--mb10">Métricas de campo (C9 §4)</h2>
    <p class="app-lbl">Calculado SOLO con esta máquina (cola local) y libros del repo. Sin telemetría: nada sale de tu navegador.</p>`;
  const filas = lineasPanel({ cola: campoCola(), albaranes, cadena: cadenaRes });
  for (const [titulo, valor, ...resto] of filas) {
    const d = document.createElement("p");
    d.className = "app-pedido-linea";
    d.innerHTML = `<span>${titulo} · <b class="datos">${valor}</b></span>
      <span class="app-lbl">${resto.join(" · ")}</span>`;
    pv.append(d);
  }
  caja.append(pv);
}

function chainEnlaceTexto(r) {
  return r.numRegistros ? "Ver el libro completo en Facturas →" : "Ver el estado del SIF en Facturas →";
}

function grafica(barras, estimadas) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 1080 240");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "240");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label",
    `Barras de consumo 36 meses: ${barras.length - estimadas} reales de factura y ${estimadas} estimados`);
  const ns = "http://www.w3.org/2000/svg";
  const base = document.createElementNS(ns, "line");
  Object.entries({ x1: 40, y1: 210, x2: 1060, y2: 210, stroke: "#E2E8F0" }).forEach(([k, v]) => base.setAttribute(k, v));
  svg.append(base);
  const max = Math.max(...barras);
  barras.forEach((v, i) => {
    const r = document.createElementNS(ns, "rect");
    const hgt = Math.round((v / max) * 180);
    Object.entries({
      x: 48 + i * 28, y: 210 - hgt, width: 20, height: hgt, rx: 3,
      fill: i < estimadas ? "#C7D9F2" : "#1E4D8C",
      stroke: i < estimadas ? "#4A90E2" : "none",
    }).forEach(([k, val]) => r.setAttribute(k, val));
    svg.append(r);
  });
  return svg;
}
