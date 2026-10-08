/**
 * tarifario.js — Comparativa viva con el tarifario horneado del repo
 * (GitHub-Total w4: `datos/tarifario.json`, mismo servidor estático, 0 red).
 *
 * El cálculo es determinista y HONESTO: mismo caso estándar para todas las
 * ofertas (kwhReferencia y kwPotencia del propio fichero), anual = energía +
 * potencia; ahorro = diferencia contra la MEDIA de las ofertas activas
 * (línea base declarada, no contra "tu factura" fingida: eso llega cuando el
 * CUPS aporta consumo real — captación). Sello: estimadas todas, fuente y
 * fecha del tarifario visibles.
 */

import { ApiError } from "./api.js";

export const RUTA_TARIFARIO = "datos/tarifario.json";

/** Validación mínima (misma regla que el workflow import-catalogo-tarifas). */
export function validarTarifario(datos) {
  if (!datos || !Array.isArray(datos.items)) throw new ApiError("tarifario sin lista de items", 0);
  for (const o of datos.items) {
    for (const k of ["id", "nombre", "tipo", "precioKwh"]) {
      if (o[k] === undefined || o[k] === null || o[k] === "") throw new ApiError(`tarifario: oferta sin «${k}»`, 0);
    }
    if (!(typeof o.precioKwh === "number" && o.precioKwh > 0 && o.precioKwh < 1)) {
      throw new ApiError(`tarifario: precioKwh fuera de rango en ${o.id}`, 0);
    }
  }
  return datos;
}

/** Caso determinista → ofertas con anual/ahorro/línea base honesta.
 * A2: con `kwh`/`kw` REALES (de factura del cliente) el caso deja de ser
 * estándar: se declara explícitamente en el sello y en la cabecera. */
export function aComparativa(datos, { cliente = "caso estándar", kwh = null, kw = null } = {}) {
  validarTarifario(datos);
  const kwhUso = (typeof kwh === "number" && kwh > 0) ? kwh : (datos.kwhReferencia || 4000);
  const kwUso = (typeof kw === "number" && kw > 0) ? kw : (datos.kwPotenciaReferencia || 5.5);
  const esCasoReal = kwhUso !== (datos.kwhReferencia || 4000) || kwUso !== (datos.kwPotenciaReferencia || 5.5);
  const kwhUsado = kwhUso, kwUsado = kwUso;
  const activas = datos.items.filter((o) => o.activo !== false);
  const anual = (o) => Math.round(o.precioKwh * kwhUsado + (o.potenciaEurKwDia || 0) * kwUsado * 365);
  const media = activas.reduce((n, o) => n + anual(o), 0) / Math.max(activas.length, 1);
  const precioActualEstimado = Math.round(media); // línea base declarada (media de las activas)
  const ofertas = activas.map((o) => {
    const a = anual(o);
    const ahorro = Math.max(Math.round(precioActualEstimado - a), 0);
    return {
      ...o,
      anual: a,
      ahorroAnual: ahorro,
      ahorroPct: precioActualEstimado ? +(ahorro / precioActualEstimado * 100).toFixed(1) : 0,
      verifactu: true, // las contrata BMAE y lleva VeriFactu nativo
      recomendada: false, // se calcula después (menor anual)
    };
  });
  const mejor = [...ofertas].sort((a, b) => a.anual - b.anual)[0];
  for (const o of ofertas) o.recomendada = !!(mejor && o.id === mejor.id);
  const desglose = { energia: 58, potencia: 23, impuestos: 19 }; // composición tipo 2.0TD (referencia CNMC)
  return {
    cliente,
    fechaTarifario: datos.upd,
    vigencia: datos.vigencia || "orientativa",
    casoEstandar: { kwh: kwhUsado, kw: kwUsado, real: esCasoReal },
    sello: {
      reales: [`precios de tarifas publicadas (tarifario ${datos.upd})`, `fuentes de cada oferta`].concat(
        esCasoReal ? [`consumo real del cliente (${kwhUsado.toLocaleString("es-ES")} kWh · ${kwUsado} kW, de factura)`] : []),
      estimados: [
        `anual con ${kwhUsado.toLocaleString("es-ES")} kWh/año y ${kwUsado} kW de potencia${esCasoReal ? " real" : " estándar"}`,
        `ahorro contra la media de las ofertas (${precioActualEstimado} €)`,
        `desglose orientativo CNMC`,
      ],
    },
    precioActualEstimado,
    ofertas,
    desglose,
  };
}

/** Carga desde el repo (mismo origen, sin red). Timeout razonable.
 * A2: con `kwh`/`kw`/`cliente` calcula el caso real (de factura del cliente). */
export async function cargarTarifario({ fetchImpl = globalThis.fetch, timeoutMs = 8000, kwh = null, kw = null, cliente = undefined } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(RUTA_TARIFARIO, { signal: ctrl.signal });
    if (!res.ok) throw new ApiError(`HTTP ${res.status} leyendo ${RUTA_TARIFARIO}`, res.status);
    return aComparativa(await res.json(), { cliente, kwh, kw });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Tarifario no disponible ahora mismo", 0);
  } finally {
    clearTimeout(t);
  }
}
