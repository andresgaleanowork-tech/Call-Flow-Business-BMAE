/**
 * pipeline.ts — Pipeline de ventas BMAE (§6.1 Prompt Maestro):
 * Lead → Estudio Viabilidad → Oferta Enviada → Negociación →
 * Adjudicado → Ganado/Perdido.
 *
 * El workflow `opportunity-won.yml` (A5) dispara en «GANADO»:
 * Customer + Sales Order + Project en ERPNext.
 */

export interface EtapaPipeline {
  key: string;
  label: string;
  probabilidadPct: number;
  color: string;
  dispara: string[];
}

export const PIPELINE_BMAE: EtapaPipeline[] = [
  {
    key: "LEAD",
    label: "Lead",
    probabilidadPct: 10,
    color: "#94A3B8",
    dispara: [],
  },
  {
    key: "ESTUDIO_VIABILIDAD",
    label: "Estudio Viabilidad",
    probabilidadPct: 25,
    color: "#4A90E2",
    dispara: ["peticion-factura-sips"],
  },
  {
    key: "OFERTA_ENVIADA",
    label: "Oferta Enviada",
    probabilidadPct: 50,
    color: "#FFD93D",
    dispara: ["simulacion-oferta (A3)", "pdf-oferta"],
  },
  {
    key: "NEGOCIACION",
    label: "Negociación",
    probabilidadPct: 70,
    color: "#FF6B35",
    dispara: ["tareas-comercial"],
  },
  {
    key: "ADJUDICADO",
    label: "Adjudicado",
    probabilidadPct: 90,
    color: "#2ECC71",
    dispara: ["contrato-borrador"],
  },
  {
    key: "GANADO",
    label: "Ganado",
    probabilidadPct: 100,
    color: "#16A34A",
    dispara: ["opportunity-won.yml → Customer 430 + Sales Order + Project (ERPNext)"],
  },
  {
    key: "PERDIDO",
    label: "Perdido",
    probabilidadPct: 0,
    color: "#DC2626",
    dispara: ["motivo-perdida (analítica F6)"],
  },
];

export function etapa(key: string): EtapaPipeline {
  const e = PIPELINE_BMAE.find((x) => x.key === key);
  if (!e) throw new Error(`etapa desconocida: ${key}`);
  return e;
}

/** Orden estricto del embudo: no se retrocede salvo a PERDIDO. */
export function transicionValida(desde: string, hacia: string): boolean {
  if (hacia === "PERDIDO") return true;
  const orden = PIPELINE_BMAE.map((x) => x.key);
  return orden.indexOf(hacia) > orden.indexOf(desde);
}
