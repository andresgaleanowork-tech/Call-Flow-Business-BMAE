/**
 * roles.js — ESPEJO LITERAL de `auth/src/bmae_auth/roles.py` (§4.1/§4.3).
 * Fuente de verdad: el módulo Python. Si Instagram cambia, REGENERAR copia:
 * las pruebas (test_frontend_auth.test.mjs) verean la paridad de contenido.
 */

export const MAPEO_TEAMS = {
  comerciales: ["BMAE Comercial"],
  ingenieros: ["BMAE Ingeniero"],
  admin: ["System Manager", "BMAE Admin"],
  partners: ["BMAE Partner (ReadOnly)"],
};

export const MATRIZ = {
  "Publico/Lead": {
    frontend: ["landing", "comparador-basico"],
    twenty: ["crear-lead"],
    erpnext: [],
    verifactu: [],
  },
  "BMAE Partner (ReadOnly)": {
    frontend: ["comparador-b2b", "solo-lectura"],
    twenty: ["sus-leads"],
    erpnext: [],
    verifactu: [],
  },
  "BMAE Comercial": {
    frontend: ["comparador-completo", "pdf"],
    twenty: ["crud-sus-deals", "crud-cups"],
    erpnext: ["lectura-tarifas"],
    verifactu: [],
  },
  "BMAE Comercial Senior": {
    frontend: ["historico-global"],
    twenty: ["deals-equipo"],
    erpnext: ["facturas-cartera"],
    verifactu: [],
  },
  "BMAE Ingeniero": {
    frontend: ["estudio-fv", "proyectos"],
    twenty: ["oportunidades-tecnicas"],
    erpnext: ["projects", "stock"],
    verifactu: [],
  },
  "BMAE Administracion": {
    frontend: ["dashboard-financiero"],
    twenty: ["solo-lectura"],
    erpnext: ["contabilidad"],
    verifactu: ["emision", "envio"],
  },
  "System Manager": {
    frontend: ["vista-360"],
    twenty: ["control-total"],
    erpnext: ["system-manager"],
    verifactu: ["config", "auditoria"],
  },
  "BMAE Admin": {
    frontend: ["vista-360"],
    twenty: ["control-total"],
    erpnext: ["system-manager"],
    verifactu: ["config", "auditoria"],
  },
};

export function rolesDeTeams(teams) {
  const salida = [];
  for (const t of teams || []) {
    const slug = String(t).trim().toLowerCase().replace(/^bmae\//, "");
    for (const rol of MAPEO_TEAMS[slug] || []) {
      if (!salida.includes(rol)) salida.push(rol);
    }
  }
  return salida;
}

export function puede(roles, raiz, capacidad) {
  return (roles || []).some((rol) =>
    (MATRIZ[rol]?.[raiz] || []).includes(capacidad),
  );
}
