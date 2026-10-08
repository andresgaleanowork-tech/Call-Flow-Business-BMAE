/**
 * canalgithub.js — Canal GitHub-total (docs/github-total.md §4, opción B 07-oct).
 * Sustituye al canal Twenty/F4: cada subida empaqueta las gestiones validadas
 * de la cola local como UN comentario JSON por línea en el issue buzón
 * del repo de operación; `cola-ingest.yml` las materializa en el pipeline.
 *
 * Identidad: Bearer con el token GitHub del comercial (`bmae_gh_token`,
 * wave F4G·w2 device-flow). Sin identidad → error honesto, jamás vaciar.
 */

import { ApiError } from "./api.js";
import { aPayload, huella as _huella } from "./twenty.js"; // reutiliza lote e idempotencia

export const REPO_OPERACION = ""; // F4G: "org/repo-operacion" (privado, §4 del ADR)
const API = "https://api.github.com";
const BUZON_DEFAULT = 1; // number del issue «BUZÓN COMERCIAL» del repo de operación
const TIMEOUT_MS = 10000;

export { _huella as huella };

/** Una gestión por línea — espejo de integracion/scripts/cola_ingest.py. */
export function aLineas(cola) {
  return aPayload(cola).map((g) => JSON.stringify({ v: 1, canal: "callflow", ...g }));
}

export function cuerpoBuzon(cola) {
  const lineas = aLineas(cola);
  return {
    title: `📥 Buzón comercial — ${new Date().toISOString().slice(0, 10)} — ${lineas.length} gestión(es)`,
    body: [
      `<!-- canalgithub §4 · lote ${lineas.length} gestiones · huella-rng -> idempotente -->`,
      ...lineas,
    ].join("\n"),
  };
}

/**
 * Sube la cola como comentario del buzón (issues/{buzon}/comments).
 * Transaccional: ante cualquier fallo LANZA → fusionarEnVenta conserva cola.
 */
export async function subirGitHub(cola, {
  repo = REPO_OPERACION,
  buzon = BUZON_DEFAULT,
  token = null,
  fetchImpl = globalThis.fetch,
  timeoutMs = TIMEOUT_MS,
  storage = globalThis.sessionStorage,
} = {}) {
  if (!Array.isArray(cola) || !cola.length) return { subidas: 0 };
  const ghToken = token ?? storage?.getItem("bmae_gh_token");
  if (!repo || !ghToken) {
    throw new ApiError(
      "Canal GitHub sin identidad o sin repo de operación: llega con la wave de login (docs/github-total.md §6); tu cola sigue a salvo localmente",
      0,
    );
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(`${API}/repos/${repo}/issues/${buzon}/comments`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${ghToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ body: cuerpoBuzon(cola).body }),
    });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} al comentar el buzón de CRM`, res.status);
    const cuerpo = await res.json().catch(() => ({}));
    return { subidas: cola.length, url: cuerpo?.html_url ?? null };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Fallo de red escribiendo en el buzón; la cola NO se ha tocado", 0);
  } finally {
    clearTimeout(t);
  }
}
