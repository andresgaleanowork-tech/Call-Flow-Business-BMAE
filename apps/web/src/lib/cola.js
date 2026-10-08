/**
 * cola.js — canal local de gestiones comerciales (H1b, listo para F4).
 * Contrato heredado del trabajo previo (ADR-028 / cfbDias15): tope 200,
 * saneado a la entrada, saneado de nuevo al fusionar, jamás PII (el guardián
 * la rechaza antes de encolar; aquí además se confirma).
 * F4: `fusionarEnTwenty()` sube la cola al endpoint y la vacía tras 200 OK.
 */

const K = "bmae.callflow.cola";
const TOPE = 200;

function leerBruto(storage = globalThis.sessionStorage) {
  try { return JSON.parse(storage.getItem(K) || "[]") || []; }
  catch { return []; }
}

export function leerCola(storage = globalThis.sessionStorage) {
  return leerBruto(storage).filter((g) => g && typeof g.resultado === "string" && g.resultado.length > 0);
}

/** Encola una gestión ya VALIDADA por el guardián (defensa en profundidad). */
export function encolar(gestion, storage = globalThis.sessionStorage) {
  if (!gestion || typeof gestion.resultado !== "string" || !gestion.resultado) {
    throw new Error("gestión sin resultado: no se encola");
  }
  const nota = String(gestion.nota || "").slice(0, 140);
  const limpia = {
    segmento: String(gestion.segmento || ""),
    nodo: String(gestion.nodo || ""),
    resultado: gestion.resultado,
    nota,
    ts: gestion.ts || new Date().toISOString(),
  };
  const cola = [...leerCola(storage), limpia].slice(-TOPE);
  storage.setItem(K, JSON.stringify(cola));
  return limpia;
}

export function contarPendientes(storage = globalThis.sessionStorage) {
  return leerCola(storage).length;
}

/** F4: subida real. H1b: forma y punto de extensión únicos (sin red aquí). */
export async function fusionarEnTwenty(subir, storage = globalThis.sessionStorage) {
  const cola = leerCola(storage);
  if (!cola.length) return { enviadas: 0, quedan: 0 };
  await subir(cola); // F4: POST al endpoint; si falla, NO se vacía (no se pierde nada)
  storage.setItem(K, "[]");
  return { enviadas: cola.length, quedan: 0 };
}
