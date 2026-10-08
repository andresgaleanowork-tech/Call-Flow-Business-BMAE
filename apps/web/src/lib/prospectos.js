/**
 * prospectos.js — A1 prospección viva: leer datos/prospectos/ (importado del
 * export IberCRM). 32k empresas NO se descargan de golpe: índice primero y
 * después solo la ciudad pedida (lazy). Búsqueda 100% en el navegador.
 */

import { ApiError } from "./api.js";

const BASE = "datos/prospectos";

export async function cargarIndexPros({ fetchImpl = globalThis.fetch, timeoutMs = 8000, signal } = {}) {
  return _get(`${BASE}/index.json`, { fetchImpl, timeoutMs, signal });
}

export async function cargarCiudad(archivo, { fetchImpl = globalThis.fetch, timeoutMs = 10000, signal } = {}) {
  if (!/^ciudad_[a-z0-9_-]+\.json$/i.test(archivo || "")) {
    throw new ApiError("Nombre de fichero de ciudad inesperado (nunca request libre a datos/).", 0);
  }
  return _get(`${BASE}/${archivo}`, { fetchImpl, timeoutMs, signal });
}

/** búsqueda tolerante: nombre, ciudad, CP, email o web; ordena cp-exacto → prefijo → contiene. */
export function buscar(prospectos = [], q = "", limite = 40) {
  q = (q || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (q.length < 2) return [];
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const salida = [];
  for (const p of prospectos) {
    const n = norm(p.nombre);
    if (p.cp === q) salida.push([0, p]);
    else if (n.startsWith(q)) salida.push([1, p]);
    else if (n.includes(q) || norm(p.ciudad).includes(q) || norm(p.email).startsWith(q) || norm(p.web).startsWith(q)) salida.push([2, p]);
    if (salida.length > limite * 3) break;
  }
  salida.sort((a, b) => a[0] - b[0]);
  return salida.slice(0, limite).map(([, p]) => p);
}

async function _get(url, { fetchImpl, timeoutMs, signal }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo ${url}`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("No se pudo cargar la base de prospectos (red).", 0);
  } finally {
    clearTimeout(t);
  }
}
