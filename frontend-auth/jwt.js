/**
 * jwt.js — JWT RS256 en el navegador (WebCrypto, cero dependencias).
 *
 * IMPORTANTE (honestidad §4): la VALIDACIÓN DE AUTORIDAD vive en el edge
 * (Traefik ForwardAuth, §4.2.9). Esta verificación cliente es defensa en
 * profundidad + UX (saber roles/exp antes de llamar), nunca la barrera.
 */

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

export function parsearJwt(token) {
  const partes = String(token || "").split(".");
  if (partes.length !== 3) throw new Error("forma JWT inválida");
  return {
    cabecera: JSON.parse(new TextDecoder().decode(unb64url(partes[0]))),
    payload: JSON.parse(new TextDecoder().decode(unb64url(partes[1]))),
    firma: partes[2],
    firme: `${partes[0]}.${partes[1]}`,
  };
}

/** Verifica firma RS256 con un JWKS (kid), iss/aud/type/exp (§4.1). */
export async function verificarJwt({
  token,
  jwks,
  tipoEsperado = "access",
  issuer = "bmae-auth",
  audience = "bmae",
  ahoraS = Math.floor(Date.now() / 1000),
  margenS = 30,
}) {
  const { cabecera, payload, firma, firme } = parsearJwt(token);
  if (cabecera.alg !== "RS256") throw new Error("alg distinto de RS256");
  const jwk = (jwks.keys || []).find((k) => k.kid === cabecera.kid);
  if (!jwk) throw new Error("kid desconocido en JWKS");
  const clave = await crypto.subtle.importKey(
    "jwk",
    { ...jwk, ext: true, key_ops: ["verify"] },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    clave,
    unb64url(firma),
    new TextEncoder().encode(firme),
  );
  if (!ok) throw new Error("firma RS256 inválida");
  if (payload.iss !== issuer || payload.aud !== audience) {
    throw new Error("iss/aud inesperados");
  }
  if (payload.type !== tipoEsperado) {
    throw new Error(`type ${payload.type} ≠ ${tipoEsperado}`);
  }
  if (payload.exp + margenS < ahoraS) throw new Error("token expirado");
  return payload;
}

export const expiraEnS = (token, ahoraS = Math.floor(Date.now() / 1000)) =>
  parsearJwt(token).payload.exp - ahoraS;
