/**
 * twenty.js — F4-prep. Cliente de subida del canal H1b (cola local de
 * gestiones comerciales) al endpoint Frappe, de acuerdo con
 * docs/f4-contrato-subida.md y la decisión D-B1: una única llamada síncrona,
 * cero tokens de servicio en cliente (solo el Bearer de sesión de B).
 * HOY BASE=null: el placeholder §F2 se cumplimenta cuando el VPS responda.
 */

import { ApiError } from "./api.js";

const BASE = null; // F4: "https://erp.bmae.example" (placeholder §F2, igual que api.js)
const LOTE = 50;               // gestiones por POST (contrato §petición)
const ENDPOINT = "/api/method/bmae.callflow.registrar_gestiones";
const TIMEOUT_MS = 10000;

/**
 * djb2 → base36. FIN: idempotencia (dedupe server-side, ventana 24 h).
 * NO usar para seguridad (no es una función criptográfica).
 */
export function huella(g) {
  const s = `${g.segmento}|${g.resultado}|${g.nota}|${g.ts}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Esquema exacto del contrato: solo estos 6 campos salen del navegador. */
export function aPayload(cola) {
  return cola.map((g, i) => ({
    segmento: String(g.segmento ?? ""),
    resultado: String(g.resultado ?? ""),
    nota: String(g.nota ?? "").slice(0, 140),
    ts: String(g.ts || new Date().toISOString()),
    pos: i,
    huella: huella(g),
  }));
}

/**
 * Sube la cola en lotes de 50. Transaccional del lado servidor: si algo
 * falla LANZA (y fusionarEnTwenty conserva la cola — no se pierde nada).
 * fetchImpl inyectable: los tests no tocan red.
 */
export async function subirTwenty(cola, {
  base = BASE,
  fetchImpl = globalThis.fetch,
  timeoutMs = TIMEOUT_MS,
  storage = globalThis.sessionStorage,
} = {}) {
  if (!Array.isArray(cola) || !cola.length) return { subidas: 0 };
  if (!base) throw new ApiError("Canal Twenty sin endpoint: llega con F4 (tu cola sigue a salvo localmente)", 0);
  const token = storage?.getItem("bmae_access") || "";
  let subidas = 0;
  for (let i = 0; i < cola.length; i += LOTE) {
    const lote = aPayload(cola.slice(i, i + LOTE));
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${base}${ENDPOINT}`, {
        method: "POST",
        credentials: "include",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ gestiones: lote }),
      });
      if (!res.ok) throw new ApiError(`HTTP ${res.status} al subir gestiones a Twenty`, res.status);
      const cuerpo = await res.json().catch(() => ({}));
      const procesadas = cuerpo?.message?.procesadas ?? cuerpo?.procesadas;
      if (procesadas !== undefined && procesadas !== lote.length) {
        throw new ApiError(`respuesta incoherente: procesadas=${procesadas}, esperadas=${lote.length}`, 0);
      }
      subidas += lote.length;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError("Fallo de red subiendo a Twenty; la cola NO se ha tocado", 0);
    } finally {
      clearTimeout(t);
    }
  }
  return { subidas };
}
