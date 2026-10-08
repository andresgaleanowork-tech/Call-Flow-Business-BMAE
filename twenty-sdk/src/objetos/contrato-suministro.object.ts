/**
 * contrato-suministro.object.ts — §6.1.2 Prompt Maestro.
 */

import { defineObject, FieldType } from "../types-sdk";

export const ContratoSuministro = defineObject({
  nameSingular: "contratoSuministro",
  namePlural: "contratosSuministro",
  labelSingular: "Contrato de Suministro",
  labelPlural: "Contratos de Suministro",
  description:
    "Contrato de suministro (Luz/Gas/Dual) con estado contractual, tipo " +
    "de precio y descuentos ofertados.",
  icon: "IconFileText",
  fields: [
    {
      key: "numeroContrato",
      label: "Número de contrato",
      type: FieldType.TEXT,
      required: true,
      unique: true,
      description: "Identificador único del contrato (§6.1.2).",
    },
    {
      key: "tipo",
      label: "Tipo",
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: "LUZ", label: "Luz", color: "#FFD93D" },
        { value: "GAS", label: "Gas", color: "#FF6B35" },
        { value: "DUAL", label: "Dual (Luz+Gas)", color: "#8B5CF6" },
      ],
    },
    { key: "comercializadoraActual", label: "Comercializadora actual", type: FieldType.TEXT },
    { key: "fechaInicio", label: "Inicio", type: FieldType.DATE },
    { key: "fechaFin", label: "Fin", type: FieldType.DATE },
    {
      key: "estado",
      label: "Estado",
      type: FieldType.SELECT,
      required: true,
      defaultValue: "BORRADOR",
      options: [
        { value: "BORRADOR", label: "Borrador", color: "#94A3B8" },
        { value: "EN_TRAMITACION", label: "En tramitación", color: "#4A90E2" },
        { value: "ACTIVO", label: "Activo", color: "#2ECC71" },
        { value: "RESCINDIDO", label: "Rescindido", color: "#DC2626" },
      ],
    },
    {
      key: "tipoPrecio",
      label: "Tipo de precio",
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: "FIJO", label: "Precio fijo", color: "#1E4D8C" },
        { value: "INDEXADO", label: "Indexado a mercado (pass-through)", color: "#F59E0B" },
      ],
    },
    {
      key: "descuentos",
      label: "Descuentos",
      type: FieldType.RAW_JSON,
      description: "JSON de descuentos ofertados (§6.1.2).",
    },
    { key: "puntoDeSuministroId", label: "Punto de suministro", type: FieldType.RELATION, relationTarget: "puntoDeSuministro" },
    { key: "clienteId", label: "Cliente (Company)", type: FieldType.RELATION, relationTarget: "company" },
  ],
});

export type ContratoSuministroType = typeof ContratoSuministro;
