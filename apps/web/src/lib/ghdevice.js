/**
 * ghdevice.js — Login GitHub por Device Flow (GitHub-Total w2, docs/github-total.md §6).
 * Sin servidor ni backend auth: el navegador pide a GitHub un código de usuario
 * (device/code), el humano lo aprueba en github.com/login/device, y la SPA
 * sondea (access_token) hasta recibir el token. Sin client secret: el Client ID
 * es público por diseño (OAuth App con "Device Flow" habilitado — gesto humano).
 *
 * Tras éxito queda (puente de claves heredado B, misma convención):
 *   sessionStorage.bmae_gh_token → Bearer del canal CRM (lib/canalgithub.js §4)
 *   sessionStorage.bmae_access   → el mismo token (puente de guard de rutas)
 *   sessionStorage.bmae_roles    → ["comercial"] si acceso de escritura al repo
 *
 * Siempre honesto: sin CLIENT_ID o sin acceso al repo, se informa y no se
 * finge conexión. La cola Call-Flow sigue a salvo aunque nunca se entre.
 */

import { ApiError } from "./api.js";

/** GESTO HUMANO (deploy-github.md §5): OAuth App propia con Device Flow. */
export const Ov23liDmMs16qvV65SOM = ""; // vacío = login no cableado todavía (estado honesto)

const DEVICE_URL = "https://github.com/login/device/code";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";
const INTERVALO_MIN = 5; // GitHub lo exige (429 si se sondea antes)

async function postForm(url, cuerpo, { fetchImpl, signal }) {
  const res = await fetchImpl(url, {
    method: "POST", mode: "cors", signal,
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(cuerpo).toString(),
  });
  const datos = await res.json().catch(() => ({}));
  return { status: res.status, datos };
}

/** Paso 1: GitHub devuelve device_code + user_code para mostrar al humano. */
export async function iniciarDevice({ clientId = CLIENT_ID, scope = "repo", fetchImpl = globalThis.fetch, signal } = {}) {
  if (!clientId) {
    throw new ApiError(
      "Login GitHub no cableado (wave w2): falta `CLIENT_ID` en apps/web/src/lib/ghdevice.js — gesto humano documentado en docs/deploy-github.md §5",
      0,
    );
  }
  const { status, datos } = await postForm(DEVICE_URL, { client_id: clientId, scope }, { fetchImpl, signal });
  if (!datos.device_code) {
    throw new ApiError(`GitHub no emitió device_code (HTTP ${status}). ¿Device Flow activado en la OAuth App?`, status);
  }
  return {
    deviceCode: datos.device_code,
    userCode: datos.user_code,
    verificationUri: datos.verification_uri || "https://github.com/login/device",
    expiresIn: datos.expires_in ?? 900,
    interval: Math.max(datos.interval ?? INTERVALO_MIN, INTERVALO_MIN),
  };
}

/** Paso 2: sondeo respetando el intervalo de GitHub (authorization_pending / slow_down). */
export async function esperarToken({
  deviceCode, clientId = CLIENT_ID, interval = INTERVALO_MIN, expiresIn = 900,
  fetchImpl = globalThis.fetch, signal, sleep = null,
} = {}) {
  if (!deviceCode) throw new ApiError("esperarToken sin deviceCode: llama primero a iniciarDevice()", 0);
  const esperar = sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
  const limite = globalThis.Date.now() + expiresIn * 1000;
  let espera = Math.max(interval, INTERVALO_MIN);
  while (globalThis.Date.now() < limite) {
    if (signal?.aborted) throw new ApiError("Device flow cancelado por la persona usuaria", 0);
    await esperar(espera * 1000);
    const { status, datos } = await postForm(TOKEN_URL, {
      client_id: clientId, device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    }, { fetchImpl, signal });
    if (datos.access_token) return datos.access_token;
    if (datos.error === "authorization_pending") continue;
    if (datos.error === "slow_down") { espera += 5; continue; }
    if (datos.error === "expired_token") throw new ApiError("El código expiró sin aprobarse. Vuelve a intentarlo.", 408);
    if (datos.error === "access_denied") throw new ApiError("Autorización rechazada en GitHub.", 403);
    throw new ApiError(`Token GitHub inesperado (HTTP ${status}): ${datos.error || "sin detalle"}`, status);
  }
  throw new ApiError("Tiempo agotado esperando la aprobación en GitHub.", 408);
}

/** Paso 3: perfil + acceso al repo de operación → roles honestos.
 * B1: el permiso REAL del repo ES el rol (nunca privilegio inventado):
 *   admin/maintain → "direccion" · push → "gestor" · triage/pull → "comercial"
 *   sin acceso → [] (la app lo declara, no finge). */
export function rolDePermiso(permiso) {
  return { admin: "direccion", maintain: "direccion", push: "gestor", triage: "comercial", pull: "comercial" }[permiso] || null;
}

export async function perfilIdentidad(token, { repo = "", fetchImpl = globalThis.fetch, signal } = {}) {
  const cab = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
  const ru = await fetchImpl(USER_URL, { headers: cab, signal });
  if (!ru.ok) throw new ApiError(`HTTP ${ru.status} leyendo /user tras el device flow`, ru.status);
  const usuario = await ru.json();
  let operativo = false, permiso = null;
  if (repo) {
    try {
      const rr = await fetchImpl(`https://api.github.com/repos/${repo}`, { headers: cab, signal });
      const r = rr.ok ? await rr.json() : null;
      permiso = r?.permissions?.admin ? "admin"
        : r?.permissions?.maintain ? "maintain"
        : r?.permissions?.push ? "push"
        : r?.permissions?.triage ? "triage"
        : r?.permissions?.pull ? "pull"
        : null;
      operativo = ["admin", "maintain", "push"].includes(permiso);
    } catch { operativo = false; }
  }
  return { login: usuario.login || "github", operativo, permiso, rol: rolDePermiso(permiso) };
}

/** Completo: device → token → identidad → escribe el puente de sesión. */
export async function conectarGitHub({
  clientId = CLIENT_ID, repo = "", fetchImpl = globalThis.fetch, signal, sleep,
  storage = globalThis.sessionStorage, onCodigo = () => {},
} = {}) {
  const d = await iniciarDevice({ clientId, fetchImpl, signal });
  onCodigo(d); // la UI muestra d.userCode + enlace
  const token = await esperarToken({ deviceCode: d.deviceCode, clientId, interval: d.interval, expiresIn: d.expiresIn, fetchImpl, signal, sleep });
  const id = await perfilIdentidad(token, { repo, fetchImpl, signal });
  try {
    storage?.setItem("bmae_gh_token", token);
    storage?.setItem("bmae_access", token); // puente del guard de rutas (B, mismas claves)
    storage?.setItem("bmae_roles", JSON.stringify(id.rol ? [id.rol] : []));
  } catch { /* webviews sin storage: el token no se persiste */ }
  return { token, ...id };
}

export function desconectar({ storage = globalThis.sessionStorage } = {}) {
  for (const k of ["bmae_gh_token", "bmae_access", "bmae_roles"]) {
    try { storage?.removeItem(k); } catch { /* noop */ }
  }
}
