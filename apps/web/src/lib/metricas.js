/**
 * metricas.js — Métricas de campo C9 §4, versión GitHub-Total honesta: se
 * calcula SOLO con lo que hay en ESTA máquina (cola Call-Flow local) y en
 * los libros del repo (albaranes/cadena). Sin telemetría oculta, sin enviar
 * nada. El subtítulo en el panel lo dice siempre por escrito.
 */

import { leerCola } from "./cola.js";

/** Desglose de la cola local por segmento y resultado (llamadas de hoy). */
export function campoCola({ storage = globalThis.sessionStorage, hoy = null } = {}) {
  const cola = leerCola(storage);
  const hoyIso = hoy || new Date().toISOString().slice(0, 10);
  const deHoy = cola.filter((g) => String(g.ts || "").slice(0, 10) === hoyIso);
  const porSegmento = {};
  const resultadosPorSegmento = {};
  const porResultado = {};
  for (const g of cola) {
    const seg = g.segmento || "sin-segmentar";
    porSegmento[seg] = (porSegmento[seg] || 0) + 1;
    resultadosPorSegmento[seg] = resultadosPorSegmento[seg] || {};
    resultadosPorSegmento[seg][g.resultado] = (resultadosPorSegmento[seg][g.resultado] || 0) + 1;
    porResultado[g.resultado] = (porResultado[g.resultado] || 0) + 1;
  }
  return {
    totalEnCola: cola.length,
    deHoy: deHoy.length,
    porSegmento,
    resultadosPorSegmento,
    porResultado,
    hoy: hoyIso,
  };
}

/** Suma de filas para el panel, con IH — ni un número sin "de dónde sale". */
export function lineasPanel({ cola = null, albaranes = null, cadena = null } = {}) {
  const filas = [];
  if (cola) {
    filas.push(["Gestiones Call-Flow (esta máquina)", `${cola.totalEnCola}`,
      cola.deHoy ? `${cola.deHoy} hoy ${cola.hoy}` : "ninguna hoy",
      `cola local — todavía no subió al buzón`]);
    for (const [seg, n] of Object.entries(cola.porSegmento).sort((a, b) => b[1] - a[1])) {
      const desglose = Object.entries(cola.resultadosPorSegmento[seg] || {})
        .map(([r, m]) => `${r} ×${m}`).join(" · ");
      filas.push([`  · ${seg}`, `${n}`, desglose || "—"]);
    }
  }
  if (albaranes) {
    filas.push(["Albaranes registrados", `${albaranes.num}`,
      albaranes.num ? `total ${albaranes.total.toFixed(2).replace(".", ",")} € acumulado` : "libro vacío",
      "datos/albaranes — bot del modulo albarán"]);
  }
  if (cadena) {
    filas.push(["Facturas VeriFactu (libro legal)", `${cadena.numRegistros}`,
      cadena.numRegistros ? "huella encadenada SHA-256" : "vacía hasta cert AEAT",
      "datos/verifactu — bot del SIF"]);
  }
  return filas;
}

