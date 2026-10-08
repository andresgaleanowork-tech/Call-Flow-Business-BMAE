/**
 * verifactu.js — El libro de facturas vivo: `datos/verifactu/cadena.json`
 * (GitHub-Total §3; la escribe SOLO el bot del SIF tras respuesta AEAT y el
 * Git es prueba legal). La SPA lo LEE, jamás lo inventa: este panel muestra
 * el historial real o el estado vacío honesto de «aún no emitido».
 */

import { ApiError } from "./api.js";

export const RUTA_CADENA = "datos/verifactu/cadena.json";

/** Filas de tabla desde el historial real (más reciente primero). */
export function aFilas(cadena) {
  const historial = Array.isArray(cadena?.historial) ? cadena.historial : [];
  return [...historial].reverse().map((r) => ({
    serie: (r.numero_serie || "").split("-")[0],
    numero: r.numero_serie,
    fechaTxt: r.fecha_expedicion || "—",
    cliente: r.descripcion || "—",
    totalTxt: r.importe_total ? `${String(r.importe_total).replace(".", ",")} €` : "—",
    vfTxt: "registrada", // si está en la cadena es que AEAT aceptó (la escribe el bot tras OK)
    huella: r.huella || "",
    huellaCorta: r.huella ? r.huella.slice(0, 10) + "…" : "—",
    qr: r.qr || null,
    _raw: r,
  }));
}

/** KPIs reales del libro (0 si aún no emitido). */
export function resumenCadena(cadena) {
  const historial = Array.isArray(cadena?.historial) ? cadena.historial : [];
  const total = historial.reduce((n, r) => n + parseFloat(r.importe_total || 0), 0);
  const ultimo = cadena?.ultimo || null;
  return {
    numRegistros: historial.length,
    importeAcumulado: total,
    ultimaHuellaCorta: ultimo?.huella ? ultimo.huella.slice(0, 10) + "…" : null,
    upd: cadena?.upd || "—",
    emisor: cadena?.emisor?.nombre_razon || "—",
    emisorNif: cadena?.emisor?.nif || "—",
  };
}

export async function cargarCadena({ fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(RUTA_CADENA, { signal: ctrl.signal });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo ${RUTA_CADENA}`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Cadena VeriFactu no disponible ahora mismo", 0);
  } finally {
    clearTimeout(t);
  }
}
