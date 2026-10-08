/**
 * punto-de-suministro.object.ts — §6.1.1 Prompt Maestro.
 * El CUPS es LA identidad del negocio: único y con regex normativa.
 */

import { defineObject, FieldType, RE_CUPS } from "../types-sdk";

export const PuntoDeSuministro = defineObject({
  nameSingular: "puntoDeSuministro",
  namePlural: "puntosDeSuministro",
  labelSingular: "Punto de Suministro",
  labelPlural: "Puntos de Suministro",
  description:
    "Punto de suministro eléctrico (CUPS ÚNICO IBÉRICO), con tarifa y " +
    "potencias contratadas P1..P6 según Circular 3/2020 CNMC.",
  icon: "IconPlug",
  fields: [
    {
      key: "cups",
      label: "CUPS",
      type: FieldType.TEXT,
      required: true,
      unique: true,
      pattern: RE_CUPS,
      description:
        "CUPS con regex ^[A-Z]{2}[0-9]{16}[A-Z]{2}[0-9]{0,2}[A-Z]?$ (§6.1.1).",
    },
    { key: "direccion", label: "Dirección", type: FieldType.TEXT, required: true },
    {
      key: "tarifa",
      label: "Peaje de acceso",
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: "2.0TD", label: "2.0TD (≤15 kW, 2 periodos)", color: "#1E4D8C" },
        { value: "3.0TD", label: "3.0TD (>15 kW BT, 6 periodos)", color: "#4A90E2" },
        { value: "6.1TD", label: "6.1TD (AT)", color: "#0A2540" },
        { value: "6.2TD", label: "6.2TD (AT)", color: "#0A2540" },
        { value: "6.3TD", label: "6.3TD (AT)", color: "#0A2540" },
        { value: "6.4TD", label: "6.4TD (AT)", color: "#0A2540" },
      ],
    },
    { key: "potenciaContratadaP1", label: "P contratada P1 (kW)", type: FieldType.NUMBER, required: true, precision: 3, unit: "kW" },
    { key: "potenciaContratadaP2", label: "P contratada P2 (kW)", type: FieldType.NUMBER, required: true, precision: 3, unit: "kW" },
    { key: "potenciaContratadaP3", label: "P contratada P3 (kW)", type: FieldType.NUMBER, precision: 3, unit: "kW", description: "Solo 3.0TD/6.XTD" },
    { key: "potenciaContratadaP4", label: "P contratada P4 (kW)", type: FieldType.NUMBER, precision: 3, unit: "kW", description: "Solo 3.0TD/6.XTD" },
    { key: "potenciaContratadaP5", label: "P contratada P5 (kW)", type: FieldType.NUMBER, precision: 3, unit: "kW", description: "Solo 3.0TD/6.XTD" },
    { key: "potenciaContratadaP6", label: "P contratada P6 (kW)", type: FieldType.NUMBER, precision: 3, unit: "kW", description: "Solo 3.0TD/6.XTD" },
    {
      key: "distribuidora",
      label: "Distribuidora",
      type: FieldType.TEXT,
      description: "i-DE, e-distribución, UFD… (protocolos SIPS, §18).",
    },
    { key: "consumoAnualActiva", label: "Consumo anual activa (kWh)", type: FieldType.NUMBER, unit: "kWh" },
    { key: "consumoAnualReactiva", label: "Consumo anual reactiva (kVArh)", type: FieldType.NUMBER, unit: "kVArh" },
    { key: "clienteId", label: "Cliente (Company)", type: FieldType.RELATION, relationTarget: "company" },
  ],
});

export type PuntoDeSuministroType = typeof PuntoDeSuministro;
