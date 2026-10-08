/**
 * api.js — F3. Cliente único hacia el endpoint Frappe (decisión D-B1 vigente:
 * una llamada síncrona, sin tokens en cliente público). H1 funciona con datos
 * mock contractuales: cada consulta declara su mock y el código JAMÁS pinta
 * un dato cuya procedencia no esté anotada (sello honesto).
 *
 * Uso: const r = await api("comparativa", { mock: MOCK.comparativa });
 *      → { datos, origen: "api" | "mock-contrato" }
 */

const BASE = null; // F4: "https://erp.bmae.example" (placeholder documentado §F2)

export class ApiError extends Error {
  constructor(mensaje, estado) { super(mensaje); this.estado = estado; }
}

export async function api(ruta, { mock = null, timeoutMs = 8000 } = {}) {
  if (!BASE) {
    if (mock === null) throw new ApiError("Backend no configurado en esta fase (H1)", 0);
    return { datos: mock, origen: "mock-contrato" };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/api/${ruta}`, {
      credentials: "include",
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} en ${ruta}`, res.status);
    return { datos: await res.json(), origen: "api" };
  } catch (e) {
    if (mock !== null) return { datos: mock, origen: "mock-contrato" };
    throw e instanceof ApiError ? e : new ApiError("Red inalcanzable", 0);
  } finally {
    clearTimeout(t);
  }
}

/** JSON estático versionado en el repo (catálogo comercial, guiones, resultados). */
export async function jsonLocal(ruta) {
  const res = await fetch(encodeURI(ruta), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(`HTTP ${res.status} en ${ruta}`, res.status);
  return res.json();
}
