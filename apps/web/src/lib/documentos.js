/**
 * documentos.js — B4 en la web: leer el libro datos/documentos/documentos.json
 * (generado por el script integracion/scripts/documentos_plantilla.py) y
 * pintarlo. La GENERACIÓN (render+PDF) ocurre en el script; esta superficie
 * solo lee + declara (las plantillas exigen revisión legal antes de firmarse).
 */

import { ApiError } from "./api.js";

const RUTA_LIBRO = "datos/documentos/documentos.json";

export function aFilas(docs = []) {
  return (docs || []).slice().reverse().map((d) => ({
    numero: d.numero || "—",
    tipoTxt: d.tipo === "anexo-rgpd" ? "Anexo RGPD" : d.tipo === "contrato" ? "Contrato" : d.tipo || "—",
    ref: d.ref_cliente || "ref. —",
    fechaTxt: (d.fecha || "").slice(0, 10),
    huellaCorta: d.huella ? d.huella.slice(0, 12) + "…" : "—",
    pdf: d.pdf || null,
  }));
}

export function resumen(libro = {}) {
  const docs = libro.docs || [];
  return {
    num: docs.length,
    ultimo: docs.length ? docs[docs.length - 1].numero : null,
    nifPendiente: /PENDIENTE/.test(libro?.emisor?.nif || ""),
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
    throw new ApiError("Libro de documentos no disponible ahora mismo", 0);
  } finally {
    clearTimeout(t);
  }
}
