/**
 * instalacion-fotovoltaica.object.ts — §6.1.4 Prompt Maestro.
 */

import { defineObject, FieldType } from "../types-sdk";

export const InstalacionFotovoltaica = defineObject({
  nameSingular: "instalacionFotovoltaica",
  namePlural: "instalacionesFotovoltaicas",
  labelSingular: "Instalación fotovoltaica",
  labelPlural: "Instalaciones fotovoltaicas",
  description:
    "Estudio fotovoltaico (autoconsumo RD 244/2019) con producción, " +
    "CAPEX, ROI y TIR estimados.",
  icon: "IconSolarPanel",
  fields: [
    { key: "potenciaPico_kWp", label: "Potencia pico (kWp)", type: FieldType.NUMBER, required: true, precision: 2, unit: "kWp" },
    { key: "capacidadBateria_kWh", label: "Batería (kWh)", type: FieldType.NUMBER, precision: 2, unit: "kWh" },
    { key: "inclinacion", label: "Inclinación (°)", type: FieldType.NUMBER, precision: 1, unit: "°" },
    {
      key: "orientacion",
      label: "Orientación",
      type: FieldType.SELECT,
      required: true,
      options: [
        { value: "SUR", label: "Sur", color: "#FFD93D" },
        { value: "ESTE", label: "Este", color: "#FF6B35" },
        { value: "OESTE", label: "Oeste", color: "#F59E0B" },
        { value: "ESTE_OESTE", label: "Este-Oeste", color: "#2ECC71" },
      ],
    },
    { key: "produccionAnualEstimada_kWh", label: "Producción anual (kWh)", type: FieldType.NUMBER, unit: "kWh" },
    { key: "capexEstimado", label: "CAPEX estimado (€)", type: FieldType.CURRENCY, precision: 2 },
    { key: "retornoInversionAnos", label: "Payback (años)", type: FieldType.NUMBER, precision: 1, unit: "años" },
    { key: "tir", label: "TIR (%)", type: FieldType.NUMBER, precision: 2, unit: "%" },
    {
      key: "tipoAutoconsumo",
      label: "Tipo de autoconsumo",
      type: FieldType.SELECT,
      options: [
        { value: "IND_SIN_EXCEDENTES", label: "Individual sin excedentes", color: "#1E4D8C" },
        { value: "IND_CON_EXCEDENTES", label: "Individual con excedentes (comp. simplificada)", color: "#4A90E2" },
        { value: "COLECTIVO_CON_EXCEDENTES", label: "Colectivo con excedentes", color: "#2ECC71" },
      ],
    },
    { key: "clienteId", label: "Cliente (Company)", type: FieldType.RELATION, relationTarget: "company" },
    { key: "oportunidadId", label: "Oportunidad", type: FieldType.RELATION, relationTarget: "opportunity" },
  ],
});

export type InstalacionFotovoltaicaType = typeof InstalacionFotovoltaica;
