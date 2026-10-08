/**
 * solargh.js — Operativa solar viva leída de GitHub Issues (A4 · GitHub-Total).
 * Cada presupuesto/instalación es un issue con:
 *   `canal:solar` + `estado-solar:*` (visita/presupuesto/instalacion/garantia)
 *   y opcional `visita:YYYY-MM-DD` (fecha compromiso mostrada/en rojo si pasada).
 * Simulator C10 (estimaciones honestas) queda intacto: esto es OPERATIVA.
 */

import { ApiError } from "./api.js";

const API = "https://api.github.com";

export const ETAPAS_SOLAR = [
  ["visita", "Visita pendiente"],
  ["presupuesto", "Presupuesto enviado"],
  ["instalacion", "Instalación"],
  ["garantia", "Garantía activa"],
];

export function etapaDe(labels) {
  for (const l of labels || []) {
    const n = typeof l === "string" ? l : l?.name;
    if (typeof n === "string" && n.startsWith("estado-solar:")) return n.slice(13);
  }
  return "visita";
}

export function visitaDe(labels) {
  for (const l of labels || []) {
    const n = typeof l === "string" ? l : l?.name;
    if (typeof n === "string" && n.startsWith("visita:")) return n.slice(7);
  }
  return null;
}

/** issues GitHub → grupos por etapa + visitas ordenadas por fecha. */
export function aGrupos(issues, { hoy = null } = {}) {
  const hoyIso = hoy || new Date().toISOString().slice(0, 10);
  const grupos = ETAPAS_SOLAR.map(([clave, titulo]) => ({ clave, titulo, tarjetas: [] }));
  const indice = Object.fromEntries(grupos.map((g) => [g.clave, g]));
  const proximas = [];
  for (const i of issues || []) {
    const labels = (i.labels || []).map((l) => (typeof l === "string" ? l : l?.name || ""));
    const clave = indice[etapaDe(labels)] ? etapaDe(labels) : "visita";
    const visita = visitaDe(labels);
    const vencida = !!(visita && visita < hoyIso && i.state === "open" && clave === "visita");
    const tarjeta = {
      id: `#${i.number}`,
      titulo: (i.title || "").replace(/^\[[^\]]*\]\s*/, "") || "solar",
      visita,
      vencida,
      url: i.html_url || null,
      cerrada: i.state === "closed",
    };
    indice[clave].tarjetas.push(tarjeta);
    if (visita && !tarjeta.cerrada) proximas.push(tarjeta);
  }
  proximas.sort((a, b) => a.visita.localeCompare(b.visita));
  return { grupos, proximas, abiertos: (issues || []).filter((i) => i.state !== "closed").length };
}

export async function cargarSolar({ repo = "", token = null, fetchImpl = globalThis.fetch, signal, timeoutMs = 10000, storage = globalThis.sessionStorage } = {}) {
  const ghToken = token ?? storage?.getItem("bmae_gh_token");
  if (!repo || !ghToken) {
    throw new ApiError("Operativa solar viva requiere login GitHub y REPO_OPERACION; mostrando solo el simulador (estimaciones honestas).", 0);
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetchImpl(`${API}/repos/${repo}/issues?labels=canal:solar&state=all&per_page=100&sort=created&direction=desc`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${ghToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo la operativa solar`, res.status);
    return aGrupos((await res.json()).filter((i) => !i.pull_request));
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Fallo de red leyendo la operativa solar; se muestra solo el simulador.", 0);
  } finally {
    clearTimeout(t);
  }
}
