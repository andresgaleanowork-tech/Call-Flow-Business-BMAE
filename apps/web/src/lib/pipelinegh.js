/**
 * pipelinegh.js — Pipeline CRM leído en vivo desde GitHub Issues (GitHub-total
 * w3). Cada gestión materializada por `cola-ingest.yml` es un issue con labels
 * `canal:callflow` (+ `segmento:*` `resultado:*` y `estado:*` para la columna).
 *
 * V1 = lectura + enlace (Projects v2 auto-add requiere token de organización —
 * §5 «fragilidad en números» de docs/github-total.md; la tarjeta no arrastra,
 * se avanza editando el label `estado:*` en GitHub o dejando que el gestor lo
 * haga; el botón de la tarjeta abre el issue directamente).
 */

import { ApiError } from "./api.js";

const API = "https://api.github.com";

/** Etapas del comercial BMAE (label `estado:<clave>`; orden del embudo). */
export const ETAPAS = [
  ["contactada", "Contactada"],
  ["propuesta", "Propuesta"],
  ["ganada", "Ganada"],
  ["perdida", "Perdida"],
];

export function etapaDe(labels) {
  for (const l of labels || []) {
    const n = typeof l === "string" ? l : l?.name;
    if (typeof n === "string" && n.startsWith("estado:")) return n.slice(7);
  }
  return "contactada";
}

/** Adapta issues GitHub → el contrato de columnas de #/gestor. */
export function aColumnas(issues) {
  const columnas = ETAPAS.map(([clave, titulo]) => ({ clave, titulo, tarjetas: [] }));
  const indice = Object.fromEntries(columnas.map((c) => [c.clave, c]));
  for (const i of issues || []) {
    const labels = (i.labels || []).map((l) => (typeof l === "string" ? l : l?.name || ""));
    const etapa = indice[etapaDe(labels)] ? etapaDe(labels) : "contactada";
    const segs = labels.filter((n) => n.startsWith("segmento:") || n.startsWith("resultado:"));
    indice[etapa].tarjetas.push({
      id: `#${i.number}`,
      cliente: (i.title || "").replace(/^\[[^\]]*\]\s*/, "") || "gestión",
      detalle: [segs.join(" · ") || "sin etiquetar", new Date(i.created_at || Date.now()).toLocaleDateString("es-ES")].join(" · "),
      accion: "Abrir en GitHub",
      url: i.html_url || null,
    });
  }
  return { columnas, vivas: (issues || []).filter((i) => i.state === "open").length };
}

/** GET issues del buzón materializado (repo privado → Bearer obligatorio). */
export async function cargarPipeline({ repo = "", token = null, fetchImpl = globalThis.fetch, signal, timeoutMs = 10000, storage = globalThis.sessionStorage } = {}) {
  const ghToken = token ?? storage?.getItem("bmae_gh_token");
  if (!repo || !ghToken) {
    throw new ApiError("Pipeline vivo requiere entrar con GitHub y repo de operación (REPO_OPERACION); mostrando vista contractual.", 0);
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  try {
    const url = `${API}/repos/${repo}/issues?labels=canal:callflow&state=all&per_page=100&sort=created&direction=desc`;
    const res = await fetchImpl(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${ghToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo el pipeline de Issues`, res.status);
    const datos = await res.json();
    const issues = Array.isArray(datos) ? datos.filter((i) => !i.pull_request) : [];
    return aColumnas(issues);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Fallo de red leyendo el pipeline; la vista vuelve a la contractual.", 0);
  } finally {
    clearTimeout(t);
  }
}
