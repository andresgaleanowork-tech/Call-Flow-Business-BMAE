/**
 * simulacion-oferta.object.ts — §6.1.3 Prompt Maestro.
 * Guarda la FOTO INMUTABLE del desglose del motor (bmae_comparador) como
 * precipitado de la oferta presentada: `resultadoJson` nunca se recalcula.
 */

import { defineObject, FieldType } from "../types-sdk";

export const SimulacionOferta = defineObject({
  nameSingular: "simulacionOferta",
  namePlural: "simulacionesOferta",
  labelSingular: "Simulación de oferta",
  labelPlural: "Simulaciones de oferta",
  description:
    "Resultado inmutable del motor tarifario (A3) asociado a " +
    "oportunidad y CUPS; alimenta el cierre de venta.",
  icon: "IconCalculator",
  fields: [
    { key: "opportunityId", label: "Oportunidad", type: FieldType.RELATION, relationTarget: "opportunity", required: true },
    { key: "cupsId", label: "Punto de suministro", type: FieldType.RELATION, relationTarget: "puntoDeSuministro", required: true },
    {
      key: "resultadoJson",
      label: "Desglose del motor (inmutable)",
      type: FieldType.RAW_JSON,
      required: true,
      description: "ResultadoSimulacion completo (línea a línea, 6 dec).",
    },
    {
      key: "ahorroAnualEstimado",
      label: "Ahorro anual estimado (€)",
      type: FieldType.CURRENCY,
      precision: 2,
    },
    {
      key: "porcentajeAhorro",
      label: "% ahorro",
      type: FieldType.NUMBER,
      precision: 2,
    },
    { key: "ofertaRecomendadaId", label: "Oferta recomendada", type: FieldType.TEXT },
    {
      key: "estado",
      label: "Estado",
      type: FieldType.SELECT,
      required: true,
      defaultValue: "PRESENTADA",
      options: [
        { value: "PRESENTADA", label: "Presentada", color: "#4A90E2" },
        { value: "ACEPTADA", label: "Aceptada", color: "#2ECC71" },
        { value: "RECHAZADA", label: "Rechazada", color: "#DC2626" },
      ],
    },
    { key: "hashSha256", label: "SHA-256 del desglose", type: FieldType.TEXT, unique: true,
      description: "Anti-manipulación: cualquier edición invalida la oferta." },
  ],
});

export type SimulacionOfertaType = typeof SimulacionOferta;
