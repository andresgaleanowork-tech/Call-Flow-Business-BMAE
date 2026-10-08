/**
 * sesion.js — F3. Puente con la auth sellada (Bloque B): usa EXACTAMENTE las
 * mismas claves de sessionStorage que frontend-auth/auth.js
 * ("bmae_access" | "bmae_refresh" | "bmae_exp" | "bmae_roles").
 * F4 sustituirá el stub por validación real/expiración contra el endpoint.
 */

const K_ACCESS = "bmae_access";
const K_ROLES = "bmae_roles";

export function tieneSesion() {
  try { return !!sessionStorage.getItem(K_ACCESS); }
  catch { return false; }
}

export function roles() {
  try { return JSON.parse(sessionStorage.getItem(K_ROLES) || "[]"); }
  catch { return []; }
}

export function tieneRol(rol) {
  return roles().includes(rol);
}

/** Guard de ruta privada: sin sesión → login sellado (ruta relativa Pages). */
export function exigirSesion(loginURL = "frontend-auth/login.html") {
  if (tieneSesion()) return true;
  location.assign(loginURL);
  return false;
}
