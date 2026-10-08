/**
 * test_frontend_auth.test.mjs — Tests Node nativos (node --test) del
 * frontend-auth: PKCE, JWT RS256 cliente con WebCrypto real (Node ≥20),
 * paridad literal roles.js ≡ roles.py y sesión (sessionStorage falso).
 *
 * Ejecutar:  node --test tests/   (desde frontend-auth/)
 */

import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// ---- Entorno mínimo de navegador en Node 20: WebCrypto + TextEncoder ya
//      son globales; sessionStorage se simula con Map. location/window se
//      esquivan evitando llamar a las funciones que los usan.
globalThis.sessionStorage = {
  _m: new Map(),
  getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
  setItem(k, v) { this._m.set(k, String(v)); },
  removeItem(k) { this._m.delete(k); },
};

const {
  generarVerifier,
  challengeS256,
  generarState,
  descifrarPaquete,
  completarCallback,
  sesionActual,
  haySesion,
  cerrarSesion,
} = await import("../auth.js");
const { parsearJwt, verificarJwt, expiraEnS } = await import("../jwt.js");
const { rolesDeTeams, puede, MAPEO_TEAMS, MATRIZ } = await import("../roles.js");

// ---------------------------------------------------------------------------
// PKCE (RFC 7636)
// ---------------------------------------------------------------------------

test("PKCE: verifier en rango y challenge S256 b64url sin padding", async () => {
  const v = generarVerifier();
  assert.ok(v.length >= 43 && v.length <= 128);
  const c = await challengeS256(v);
  assert.strictEqual(c.length, 43);
  assert.ok(!c.includes("="));
  // el mismo verifier SIEMPRE da el mismo challenge (determinismo S256)
  assert.strictEqual(c, await challengeS256(v));
  assert.throws(() => generarVerifier(42), /rango/);
});

test("PKCE: state 64 hex y único", () => {
  const a = generarState();
  const b = generarState();
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notStrictEqual(a, b);
});

// ---------------------------------------------------------------------------
// JWT cliente: firma RS256 creada con node:crypto → verificada con WebCrypto
// ---------------------------------------------------------------------------

async function parYToken({ expOffsetS = 8 * 3600, roles = ["BMAE Comercial"], type = "access" } = {}) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicExponent: 0x10001,
  });
  const nE = publicKey.export({ format: "jwk" });
  const kid = crypto.createHash("sha256").update(publicKey.export({ type: "spki", format: "pem" })).digest("hex").slice(0, 8);
  const jwk = { kty: "RSA", use: "sig", alg: "RS256", kid, n: nE.n, e: nE.e };
  const b64 = (x) => Buffer.from(x).toString("base64url");
  const ahoraS = Math.floor(Date.now() / 1000);
  const cab = b64(JSON.stringify({ alg: "RS256", typ: "JWT", kid }));
  const pay = b64(JSON.stringify({
    iss: "bmae-auth", aud: "bmae", sub: "bea", roles, type,
    iat: ahoraS, exp: ahoraS + expOffsetS, jti: crypto.randomBytes(8).toString("hex"),
  }));
  const firma = crypto.sign("sha256", Buffer.from(`${cab}.${pay}`), privateKey);
  return { jwks: { keys: [jwk] }, token: `${cab}.${pay}.${firma.toString("base64url")}`, ahoraS };
}

test("JWT cliente: firma real RS256 verifica y devuelve claims", async () => {
  const { jwks, token, ahoraS } = await parYToken();
  const p = await verificarJwt({ token, jwks, ahoraS });
  assert.strictEqual(p.sub, "bea");
  assert.deepStrictEqual(p.roles, ["BMAE Comercial"]);
});

test("JWT cliente: tamper de claims rompe la firma", async () => {
  const { jwks, token, ahoraS } = await parYToken();
  const [c, p, f] = token.split(".");
  const sucio = JSON.parse(Buffer.from(p, "base64url").toString());
  sucio.roles = ["System Manager"];
  const tamper = `${c}.${Buffer.from(JSON.stringify(sucio)).toString("base64url")}.${f}`;
  await assert.rejects(() => verificarJwt({ token: tamper, jwks, ahoraS }), /firma/);
});

test("JWT cliente: expirado y kid desconocido rechazados", async () => {
  const { jwks, token, ahoraS } = await parYToken({ expOffsetS: -120 });
  await assert.rejects(() => verificarJwt({ token, jwks, ahoraS }), /expirado/);
  const bueno = await parYToken();
  await assert.rejects(
    () => verificarJwt({ token: bueno.token, jwks, ahoraS: bueno.ahoraS }),
    /kid/,
  );
});

test("JWT cliente: parseo + cuenta atrás de exp", async () => {
  const { token, ahoraS } = await parYToken({ expOffsetS: 60 });
  assert.strictEqual(expiraEnS(token, ahoraS), 60);
  assert.throws(() => parsearJwt("sin-tres-partes"), /forma/);
});

// ---------------------------------------------------------------------------
// roles.js — paridad ESPEJO con roles.py (§4.1/§4.3)
// ---------------------------------------------------------------------------

test("roles.js espejo: mapeo exacto del maestro §4.1", () => {
  assert.deepStrictEqual(rolesDeTeams(["comerciales"]), ["BMAE Comercial"]);
  assert.deepStrictEqual(rolesDeTeams(["admin"]), ["System Manager", "BMAE Admin"]);
  assert.deepStrictEqual(rolesDeTeams(["partners"]), ["BMAE Partner (ReadOnly)"]);
  assert.deepStrictEqual(rolesDeTeams(["desconocido"]), []);
  assert.deepStrictEqual(
    rolesDeTeams(["bmae/ingenieros", "comerciales"]),
    ["BMAE Ingeniero", "BMAE Comercial"],
  );
});

test("roles.js espejo: matriz §4.3 (comercial no emite VeriFactu)", () => {
  assert.ok(puede(["BMAE Comercial"], "frontend", "pdf"));
  assert.ok(!puede(["BMAE Comercial"], "verifactu", "emision"));
  assert.ok(puede(["BMAE Administracion"], "verifactu", "emision"));
  assert.ok(puede(["System Manager"], "twenty", "control-total"));
});

// ---------------------------------------------------------------------------
// Canal gist cifrado HKDF/AES-GCM (espejo de canal.py en WebCrypto)
// ---------------------------------------------------------------------------

test("canal: cifrado con el code solo lo abre quien lo tiene", async () => {
  const { subtle } = crypto;
  const state = generarState();
  const texto = JSON.stringify({ access: "x", refresh: "y", exp: 1 });
  const claveDe = async (secreto) => {
    const ikm = await subtle.importKey("raw", Buffer.from(secreto, "utf8"), "HKDF", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt: Buffer.from(state, "utf8"), info: Buffer.from("bmae-auth-canal") },
      ikm, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
    );
  };
  const clave = await claveDe("code-legitimo");
  const iv = crypto.randomBytes(12);
  const c = Buffer.from(await subtle.encrypt({ name: "AES-GCM", iv }, clave, Buffer.from(texto)));
  const blob = Buffer.concat([iv, c]).toString("base64url");

  const claveOk = await claveDe("code-legitimo");
  const claro = await subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(blob, "base64url").slice(0, 12) }, claveOk, Buffer.from(blob, "base64url").slice(12));
  assert.strictEqual(Buffer.from(claro).toString(), texto);

  const claveMal = await claveDe("code-ajeno");
  await assert.rejects(() =>
    subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(blob, "base64url").slice(0, 12) }, claveMal, Buffer.from(blob, "base64url").slice(12)),
  );
  // y descifrarPaquete exportado también falla con el secreto ajeno
  await assert.rejects(() => descifrarPaquete(blob, "code-ajeno", state), /canal cifrado ilegible/);
  // y descifra con el bueno
  assert.strictEqual(await descifrarPaquete(blob, "code-legitimo", state), texto);
});

// ---------------------------------------------------------------------------
// Callback completo + sesión en sessionStorage (aislada por pestaña, §4.4)
// ---------------------------------------------------------------------------

test("callback: state CSRF malo aborta; bueno guarda sesión", async () => {
  sessionStorage.setItem("bmae_pkce_state", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  sessionStorage.setItem("bmae_pkce_verifier", "v" + "x".repeat(60));
  // state AJENO al guardado → anti-CSRF
  await assert.rejects(
    () => completarCallback({ search: "?code=x&state=" + "b".repeat(64), intercambioFn: async () => ({}) }),
    /CSRF/,
  );
  // state correcto → paquete guardado y PKCE consumida
  const stateBueno = "a".repeat(64);
  const paquete = { access: "tok", refresh: "rfk", exp: 4102444800, roles: ["BMAE Comercial"], usuario: "bea" };
  const res = await completarCallback({
    search: `?code=x&state=${stateBueno}`,
    intercambioFn: async (code, state, verifier) => {
      assert.strictEqual(verifier.length, 61);
      return paquete;
    },
  });
  assert.deepStrictEqual(res, paquete);
  const s = sesionActual();
  assert.strictEqual(s.access, "tok");
  assert.strictEqual(s.refresh, "rfk");
  assert.deepStrictEqual(s.roles, ["BMAE Comercial"]);
  assert.strictEqual(s.usuario, "bea");
  assert.ok(haySesion());
  assert.strictEqual(sessionStorage.getItem("bmae_pkce_verifier"), null);
  await cerrarSesion(async () => {});
  assert.strictEqual(sesionActual().access, null);
});
