/**
 * portalcliente.js — B2: portal del cliente SIN login.
 *
 * Modelo "capability URL": el token de la URL ES el acceso. No hay contraseñas
 * que robar ni sesiones que caducen: quien tiene el enlace, lo usa. El dossier
 * (`datos/clientes/{token}.json`) lleva SOLO superficie benigna (albaranes,
 * documentos, contacto del comercial) y el repo de operación debe ser PRIVADO
 * — se dice en el propio portal.
 *
 * La factura del cliente se procesa EN SU NAVEGADOR (nada sale de la
 * máquina): el texto se extrae con los mismos patrones que el script Python y
 * el resultado puede ① guardarse para SU comparativa (sessionStorage
 * `bmae.consumo`, contrato A2) o ② enviarse a su comercial por su propio
 * correo (mailto). Nunca una subida opaca.
 */

import { ApiError } from "./api.js";

/** token: pc-<ref>-<16+ hex> — rechaza rutas con `..` o caracteres raros. */
export function tokenValido(t) {
  return typeof t === "string" && /^pc-[a-z0-9]{1,20}-[0-9a-f]{16,32}$/i.test(t);
}

export async function cargarDossier(token, { fetchImpl = globalThis.fetch, timeoutMs = 8000, signal } = {}) {
  if (!tokenValido(token)) {
    throw new ApiError("Este enlace de cliente no tiene formato correcto. Pide a tu comercial uno nuevo.", 0);
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetchImpl(`datos/clientes/${token}.json`, { signal: ctrl.signal });
    if (!res.ok) {
      throw new ApiError("No encontramos tu ficha (enlace caducado o error en la dirección). Pide a tu comercial un enlace nuevo — no pedimos nada más.", res.status);
    }
    const d = await res.json();
    if (!d.nombre) throw new ApiError("La ficha existe pero está incompleta: avisa a tu comercial.", 0);
    return d;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("No se pudo cargar tu ficha ahora mismo (red). Inténtalo de nuevo en un minuto.", 0);
  } finally {
    clearTimeout(t);
  }
}

/* ---- Extracción de factura (espejo de integracion/scripts/factura_extraer.py)
 * Calibrado con las 5 facturas reales 08-oct (v2): CUPS con espacios, consumo
 * decimal tipo «9.799,11 kWh», «energía consumida», anual firmado kWh/Año,
 * potencia por máximo de P1..P6 (Apolo / Energía Libre) y prioridad estricta
 * del importe (jamás el subtotal solo). */

const num = (es) => {
  const m = /^([0-9]{1,3}(?:\.[0-9]{3})*|[0-9]+)(?:,([0-9]+))?$/.exec(String(es).trim());
  if (!m) return null;
  return Math.round(parseFloat(`${m[1].replace(/\./g, "")}.${m[2] || "0"}`) * 100) / 100;
};

const RE_CUPS = /ES\s*(?:\d{4}\s*){4}\d{0,2}\s*[A-Z0-9]{0,4}/;
const RE_KWH_SERIES = [
  /energ(?:í|i)a consumida\s*([0-9][0-9.]*(?:,[0-9]{1,2})?)\s*kwh/i,
  /consumo(?: acumulado| total(?: de)?)?\s*:?\s*([0-9][0-9.]*(?:,[0-9]{1,2})?)\s*kwh/i,
  /([0-9][0-9.]*(?:,[0-9]{1,2})?)\s*kwh(?!\/)/i,
];
const RE_KWH_ANUAL = /consumo[^\n]{0,20}?([0-9][0-9.]*)\s*k\s*w\s*h\s*\/\s*a(?:ñ|n)o/i;
const RE_KW_MULTI = /P[ot.]*\s*P(\d)\s*\(?\s*k[wW]\s*\)?\s*:?\s*([0-9]+[.,][0-9]+)/g;
const RE_KW_MULTI2 = /\bP(\d)\s*:\s*([0-9]+[.,]\d{3})/g; // «P1:10,000 …» (Energía Libre)
const RE_KWH_X = /(\d{1,7})\s*kWh\s*x\s*0,\d+/g;         // líneas «N kWh x 0,… €/kWh»
const RE_KW = /potencia punta\s*:?\s*([0-9]+,[0-9]+)\s*kW|potencia[^\n]{0,30}?([0-9]+[.,][0-9]+)\s*kW/i;
const RE_IMPORTE = [
  /total\s+a\s+pagar[^0-9]{0,20}([0-9][0-9.]*,[0-9]{2})/i,
  /importe\s+total[^0-9]{0,20}([0-9][0-9.]*,[0-9]{2})/i,
  /total\s+(?:importe\s+)?factura[^0-9]{0,20}([0-9][0-9.]*,[0-9]{2})/i,
  /importe\s+factura[^0-9]{0,40}([0-9][0-9.]*,[0-9]{2})/i,
  /(?:^|\s)total[^0-9]{1,20}([0-9][0-9.]*,[0-9]{2})\s*€/im,
];
const VENDEDORES = [
  ["apolo energies|apolo business", "Apolo Energies"],
  ["energ(i|í)a libre comerc", "Energia Libre Comercializadora"],
  ["endesa", "Endesa"],
  ["naturgy", "Naturgy"],
  ["repsol", "Repsol"],
  ["total ?energies", "TotalEnergies"],
  ["octopus", "Octopus"],
  ["edp", "EDP"],
  ["podo", "Podo"],
  ["holaluz", "Holaluz"],
  ["iberdrola", "Iberdrola"],
];

/** Extrae de texto plano; nunca da nada por cierto. Confianza alta/media/baja
 * y baja → lectura manual recomendada (el comercial puede pedirte los números). */
export function extraerFactura(texto) {
  const t = texto || "";
  const campos = {};
  let puntos = 0;
  const cups = RE_CUPS.exec(t);
  if (cups) { campos.cups = cups[0].replace(/\s+/g, "").toUpperCase(); puntos += 1; }

  let kwhVal = null;
  for (const re of RE_KWH_SERIES) {
    const m = re.exec(t);
    if (m) { kwhVal = num(m[1]); if (kwhVal != null) break; }
  }
  if (kwhVal != null) { campos.kwh = Math.round(kwhVal); puntos += 1; }
  const anual = RE_KWH_ANUAL.exec(t);
  if (anual) { campos.kwhAnual = num(anual[1]); puntos += 1; }

  let kwVal = null;
  const multi = [...t.matchAll(RE_KW_MULTI), ...t.matchAll(RE_KW_MULTI2)].map((m) => num(m[2])).filter((v) => v != null);
  if (multi.length >= 2) kwVal = Math.max(...multi);
  // consumo multi-periodo (suma de únicos en orden, misma regla que el Python)
  if (multi.length >= 2) {
    const crudos = [...t.matchAll(RE_KWH_X)].map((m) => parseInt(m[1], 10));
    const unicos = [...new Set(crudos)];
    if (unicos.length >= 3) {
      const suma = unicos.reduce((a, b) => a + b, 0);
      if (kwhVal == null || kwhVal <= Math.max(...unicos)) { kwhVal = suma; campos.kwh = Math.round(suma); }
    }
  }
  else if (multi.length) kwVal = multi[0];
  else {
    const m = RE_KW.exec(t);
    if (m) kwVal = num(m[1] || m[2]);
  }
  if (kwVal != null) { campos.kw = kwVal; puntos += 1; }

  let importe = null;
  for (const re of RE_IMPORTE) {
    const m = re.exec(t);
    if (m) { importe = num(m[1]); if (importe != null) break; }
  }
  if (importe != null) { campos.importe = importe; puntos += 1; }

  let vendedor = null;
  const bajo = t.toLowerCase();
  for (const [re, nombre] of VENDEDORES) {
    if (new RegExp(re, "i").test(bajo)) { vendedor = nombre; break; }
  }
  if (vendedor) { campos.comercializadora = vendedor; puntos += 1; }

  const conf = puntos >= 4 ? "alta" : puntos >= 3 ? "media" : "baja";
  return {
    campos,
    kwh: campos.kwhAnual ?? campos.kwh ?? null,
    kw: kwVal,
    importe,
    comercializadora: vendedor,
    confianza: conf,
    lecturaManualRecomendada: conf === "baja",
  };
}

/** El JSON que se guarda para SU comparativa (contrato A2, misma sessionStorage). */
export function consumoParaComparativa(ext, origen = "portal-cliente") {
  if (ext.kwh == null || ext.kw == null || ext.kwh <= 0 || ext.kw <= 0) return null;
  return { kwh: ext.kwh, kw: ext.kw, origen };
}

/** mailto honesto: el cliente decide; el asunto/cuerpo van en claro. */
export function mailtoComercial(email, ext, token) {
  const cuerpo = [
    `Soy el cliente con ref. ${(token || "").slice(3).split("-")[0] || "?"};`,
    `te mando lo leído de mi factura (revísalo tú antes de usarlo):`,
    `· consumo: ${ext.kwh ?? "no legible"} kWh`,
    `· potencia: ${ext.kw ?? "no legible"} kW`,
    `· importe total: ${ext.importe ?? "no legible"} €`,
    `· CUPS: ${ext.campos.cups ?? "no legible"}`,
    `· confianza del lector: ${ext.confianza}`,
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent("Mi factura (portal del cliente)")}&body=${encodeURIComponent(cuerpo)}`;
}
