/**
 * albaranes.js — Libro de albaranes vivo (`datos/albaranes/albaranes.json`).
 * Los escribe SOLO el bot de `albaranes-crear.yml`; la SPA lee. Documento
 * comercial sin valor fiscal: el aviso se muestra SIEMPRE por escrito.
 */

import { ApiError } from "./api.js";

export const RUTA_LIBRO = "datos/albaranes/albaranes.json";

export function aFilas(libro) {
  const historial = Array.isArray(libro?.historial) ? libro.historial : [];
  return [...historial].reverse().map((r) => ({
    numero: r.numero_serie,
    fechaTxt: r.fecha || "—",
    cliente: r.cliente_ref || "—",
    concepto: (r.lineas || []).map((l) => l.descripcion).join(" · ") || "—",
    totalTxt: `${r.total} €`,
    huellaCorta: (r.huella_integridad || "").slice(0, 12) + "…",
    pdf: r.pdf || null,
    _raw: r,
  }));
}

export function resumen(libro) {
  const historial = Array.isArray(libro?.historial) ? libro.historial : [];
  const parsear = (t) => parseFloat(String(t || "0").replace(",", ".") || 0);
  return {
    num: historial.length,
    total: historial.reduce((n, r) => n + parsear(r.total), 0),
    ultimo: libro?.ultimo || null,
    nifPendiente: /PENDIENTE/.test(libro?.emisor?.nif || ""),
    emisor: libro?.emisor?.nombre_razon || "BMAE Energía",
  };
}

export async function cargarLibro({ fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(RUTA_LIBRO, { signal: ctrl.signal });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo ${RUTA_LIBRO}`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Libro de albaranes no disponible ahora mismo", 0);
  } finally {
    clearTimeout(t);
  }
}
