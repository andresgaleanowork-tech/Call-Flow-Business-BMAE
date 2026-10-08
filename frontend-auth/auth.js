/**
 * auth.js — Orquestador de autenticación del portal BMAE (§4.2 maestro).
 *
 * ES module VANILLA (cero dependencias, GitHub Pages): PKCE RFC 7636 con
 * WebCrypto nativo, sessionStorage aislado por pestaña (§4.4 anti-XSS),
 * timeout de inactividad 30 min y envoltura fetch Bearer con refresh.
 *
 * El intercambio code→JWT SÍNCRONO lo hace el ENDPOINT Frappe
 * (`auth_exchange`, §4.1); la rama gist de contingencia está implementada
 * también (descifrarPaquete) para el flujo GitOps documentado.
 */

const GH_OAUTH = "https://github.com/login/oauth/authorize";
const ALFABETO =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const K_ACCESS = "bmae_access";
const K_REFRESH = "bmae_refresh";
const K_EXP = "bmae_exp";
const K_ROLES = "bmae_roles";
const K_USUARIO = "bmae_usuario";
const K_VERIFIER = "bmae_pkce_verifier";
const K_STATE = "bmae_pkce_state";
const INACTIVIDAD_MS = 30 * 60 * 1000; // §4.4
const MARGEN_REFRESH_S = 120; // anticipa el refresh 2 min antes del exp

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export function generarVerifier(longitud = 64) {
  if (longitud < 43 || longitud > 128) {
    throw new Error("verifier fuera del rango RFC 7636 (43-128)");
  }
  const rnd = crypto.getRandomValues(new Uint8Array(longitud));
  return [...rnd].map((x) => ALFABETO[x % ALFABETO.length]).join("");
}

export async function challengeS256(verifier) {
  const d = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return b64url(d);
}

export function generarState() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function claveCanalCifrado(secreto, state) {
  const ikm = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secreto),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(state),
      info: new TextEncoder().encode("bmae-auth-canal"),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

/** Espejo WebCrypto de `canal.descifrar` del núcleo Python (contingencia). */
export async function descifrarPaquete(blobB64, secreto, state) {
  const blob = unb64url(blobB64);
  const clave = await claveCanalCifrado(secreto, state);
  try {
    const plano = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: blob.slice(0, 12) },
      clave,
      blob.slice(12),
    );
    return new TextDecoder().decode(plano);
  } catch (e) {
    throw new Error("canal cifrado ilegible con este secreto (¿code ajeno?)");
  }
}

/** §4.2.2: sin sesión → GitHub OAuth con PKCE + state CSRF. */
export async function iniciarLogin({ clientId, redirectUri, scope = "read:user read:org" }) {
  const verifier = generarVerifier();
  const state = generarState();
  sessionStorage.setItem(K_VERIFIER, verifier);
  sessionStorage.setItem(K_STATE, state);
  const url = new URL(GH_OAUTH);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", await challengeS256(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

function guardarSesion(paquete) {
  sessionStorage.setItem(K_ACCESS, paquete.access);
  sessionStorage.setItem(K_REFRESH, paquete.refresh);
  sessionStorage.setItem(K_EXP, String(paquete.exp));
  sessionStorage.setItem(K_ROLES, JSON.stringify(paquete.roles || []));
  sessionStorage.setItem(K_USUARIO, paquete.usuario || "");
  programarVigilanteInactividad();
}

/** §4.2.4-7: valida state CSRF y completa el intercambio. */
export async function completarCallback({ search, intercambioFn }) {
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const state = params.get("state");
  const esperado = sessionStorage.getItem(K_STATE);
  if (!code) throw new Error("callback sin code OAuth");
  if (!state || state !== esperado) {
    throw new Error("state CSRF no coincide (posible suplantación)");
  }
  const verifier = sessionStorage.getItem(K_VERIFIER);
  if (!verifier) throw new Error("sesión PKCE perdida — repite el login");
  const paquete = await intercambioFn(code, state, verifier);
  sessionStorage.removeItem(K_VERIFIER);
  sessionStorage.removeItem(K_STATE);
  guardarSesion(paquete);
  return paquete;
}

let _temporizador = null;
export function programarVigilanteInactividad(alExpirar = () => cerrarSesion()) {
  const rearmar = () => {
    clearTimeout(_temporizador);
    _temporizador = setTimeout(alExpirar, INACTIVIDAD_MS);
  };
  // headless (tests/SSR): sin window solo se programa el temporizador
  if (typeof window !== "undefined") {
    for (const ev of ["click", "keydown", "pointermove", "scroll"]) {
      window.addEventListener(ev, rearmar, { passive: true });
    }
  }
  rearmar();
}

export const sesionActual = () => ({
  access: sessionStorage.getItem(K_ACCESS),
  refresh: sessionStorage.getItem(K_REFRESH),
  exp: Number(sessionStorage.getItem(K_EXP) || 0),
  roles: JSON.parse(sessionStorage.getItem(K_ROLES) || "[]"),
  usuario: sessionStorage.getItem(K_USUARIO) || "",
});

export const haySesion = () => !!sessionStorage.getItem(K_ACCESS);

/** fetch con Bearer + refresh anticipado (§4.2.8/10). */
export async function fetchConAuth(url, opciones = {}, refreshFn = null) {
  let s = sesionActual();
  const ahoraS = Math.floor(Date.now() / 1000);
  if (refreshFn && s.exp && s.exp - ahoraS < MARGEN_REFRESH_S && s.refresh) {
    const nuevo = await refreshFn(s.refresh);
    guardarSesion(nuevo);
    s = sesionActual();
  }
  const cabeceras = { ...(opciones.headers || {}) };
  cabeceras.Authorization = `Bearer ${s.access}`;
  const r = await fetch(url, { ...opciones, headers: cabeceras });
  return r;
}

/** §4.4: revoca en el servidor y limpia la pestaña (nada persiste). */
export async function cerrarSesion(revocarFn = null) {
  const s = sesionActual();
  clearTimeout(_temporizador);
  try {
    if (revocarFn && s.usuario) await revocarFn(s.usuario);
  } finally {
    for (const k of [K_ACCESS, K_REFRESH, K_EXP, K_ROLES, K_USUARIO]) {
      sessionStorage.removeItem(k);
    }
  }
}
