/**
 * incidenciasgh.js — Incidencias/garantías vivas leídas de GitHub Issues
 * (B5 · GitHub-Total). Cada issue lleva `canal:incidencia` +
 * `estado-inc:abierta|en-curso|espera-pieza|resuelta` y la fecha compromiso
 * (SLA) como `compromiso:YYYY-MM-DD` (o línea «Fecha compromiso (SLA…)» del
 * body). **Vencida** = compromiso pasado y no resuelta → rojo en el panel.
 */

import { ApiError } from "./api.js";

const API = "https://api.github.com";

export const ESTADOS_INC = [
  ["abierta", "Abierta"],
  ["en-curso", "En curso"],
  ["espera-pieza", "Esperando pieza"],
  ["resuelta", "Resuelta"],
];

export function estadoDe(labels) {
  for (const l of labels || []) {
    const n = typeof l === "string" ? l : l?.name;
    if (typeof n === "string" && n.startsWith("estado-inc:")) return n.slice(11);
  }
  return "abierta";
}

/** compromiso: label `compromiso:YYYY-MM-DD` (prioridad) o línea «SLA…» del body. */
export function compromisoDe(labels, body = "") {
  for (const l of labels || []) {
    const n = typeof l === "string" ? l : l?.name;
    if (typeof n === "string" && n.startsWith("compromiso:")) return n.slice(11);
  }
  const m = /(?:compromiso|SLA)[^\n]*?(\d{4}-\d{2}-\d{2})/i.exec(body || "");
  return m ? m[1] : null;
}

/** issues Gh → filas planas: vencidas primero, luego por compromiso asc. */
export function aFilas(issues, { hoy = null } = {}) {
  const hoyIso = hoy || new Date().toISOString().slice(0, 10);
  const filas = (issues || [])
    .filter((i) => !i.pull_request)
    .map((i) => {
      const labels = (i.labels || []).map((l) => (typeof l === "string" ? l : l?.name || ""));
      const estado = estadoDe(labels);
      const compromiso = compromisoDe(labels, i.body || "");
      return {
        id: `#${i.number}`,
        titulo: (i.title || "").replace(/^\[[^\]]*\]\s*/, "") || "incidencia",
        estado: ESTADOS_INC.some(([k]) => k === estado) ? estado : "abierta",
        estadoTxt: (ESTADOS_INC.find(([k]) => k === estado) || ESTADOS_INC[0])[1],
        compromiso,
        vencida: !!(compromiso && compromiso < hoyIso && estado !== "resuelta" && i.state === "open"),
        rma: (i.body || "").match(/RMA:\s*([\w\-./]+)/i)?.[1] || null,
        url: i.html_url || null,
        cerrada: i.state === "closed",
      };
    });
  filas.sort((a, b) =>
    (b.vencida - a.vencida) ||
    (a.cerrada - b.cerrada) ||
    String(a.compromiso || "9999").localeCompare(String(b.compromiso || "9999")));
  const abiertas = filas.filter((f) => !f.cerrada);
  return { filas, abiertas: abiertas.length, vencidas: abiertas.filter((f) => f.vencida).length };
}

export async function cargarIncidencias({ repo = "", token = null, fetchImpl = globalThis.fetch, signal, timeoutMs = 10000, storage = globalThis.sessionStorage } = {}) {
  const ghToken = token ?? storage?.getItem("bmae_gh_token");
  if (!repo || !ghToken) {
    throw new ApiError("Incidencias vivas requieren login GitHub y REPO_OPERACION cumplimentado.", 0);
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetchImpl(`${API}/repos/${repo}/issues?labels=canal:incidencia&state=all&per_page=100&sort=created&direction=desc`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${ghToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo las incidencias`, res.status);
    return aFilas(await res.json());
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Fallo de red leyendo las incidencias.", 0);
  } finally {
    clearTimeout(t);
  }
}
