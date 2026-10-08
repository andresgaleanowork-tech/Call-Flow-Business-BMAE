/**
 * types-sdk.ts — Espejo tipado y AUTOSUFICIENTE del Twenty Metadata SDK.
 *
 * El paquete oficial (@twentyhq/sdk) se fijará en el repo operativo
 * `bmae-twenty-config`; aquí el Bloque A2 entrega contratos compilables
 * standalone (tsc --strict, cero dependencias) que dejan fijados TODOS los
 * campos, regex y contratos regulatorios (§6.1 Prompt Maestro).
 */

export enum FieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  SELECT = "SELECT",
  MULTI_SELECT = "MULTI_SELECT",
  RELATION = "RELATION",
  RAW_JSON = "RAW_JSON",
  CURRENCY = "CURRENCY",
  UUID = "UUID",
}

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  color: string;
}

export interface FieldMetadata {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  description?: string;
  pattern?: RegExp;
  defaultValue?: unknown;
  options?: SelectOption[];
  relationTarget?: string;
  precision?: number;
  unit?: string;
}

export interface ObjectMetadata {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
  fields: FieldMetadata[];
}

/** Registra un objeto custom igual que `defineObject` del SDK oficial. */
export function defineObject(meta: ObjectMetadata): ObjectMetadata {
  const keys = new Set<string>();
  for (const f of meta.fields) {
    if (keys.has(f.key)) {
      throw new Error(`campo duplicado ${f.key} en ${meta.nameSingular}`);
    }
    keys.add(f.key);
  }
  return meta;
}

/** Valida una regex CUPS como la exige el campo `cups` (§6.1.1). */
export const RE_CUPS = /^[A-Z]{2}[0-9]{16}[A-Z]{2}[0-9]{0,2}[A-Z]?$/;
