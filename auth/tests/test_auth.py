# -*- coding: utf-8 -*-
"""
Bloque B · tests del núcleo de autenticación (§4 maestro), 100 % en memoria:
PKCE, JWT RS256 (firma/exp/kid/tamper), roles Teams→RBAC, canal HKDF y
los tres flujos (intercambio, rotación estricta, revocación en cascada).
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

import pytest

from bmae_auth import (
    ErrorJwt,
    challenge_s256,
    clave_canal,
    emitir_jwt,
    generar_par_rsa,
    generar_state,
    generar_verifier,
    jwk_publico,
    kid_de,
    roles_de_teams,
    puede,
    verificar_jwt,
)
from bmae_auth.canal import cifrar, descifrar
from bmae_auth.flujos import ErrorIntercambio, intercambio, refresco, revocar

AHORA = datetime(2026, 10, 7, 12, 0, 0, tzinfo=timezone.utc)
PRIV, PUB = generar_par_rsa(2048)  # 2048 en tests (3072 en producción)
JWKS = {"keys": [jwk_publico(PUB)]}


class GistFalso:
    """Almacén gist inyectable (escribir/leer por nombre)."""

    def __init__(self):
        self.ficheros = {}

    def escribir(self, nombre, contenido):
        self.ficheros[nombre] = contenido

    def leer(self, nombre):
        return self.ficheros.get(nombre, {"revocados": [], "subjects_bloqueados": []})


# ---------------------------------------------------------------------------
# PKCE (RFC 7636)
# ---------------------------------------------------------------------------


def test_pkce_verifier_range_y_challenge():
    v = generar_verifier()
    assert 43 <= len(v) <= 128
    c1, c2 = challenge_s256(v), challenge_s256(v)
    assert c1 == c2 and len(c1) == 43 and "=" not in c1  # b64url sin padding
    with pytest.raises(ValueError):
        challenge_s256("corto")


def test_state_y_canal():
    s = generar_state()
    assert len(s) == 64 and s.islower() and s.isalnum()
    n = clave_canal(s)
    assert len(n) == 64 and n != s
    with pytest.raises(ValueError):
        clave_canal("mal")


# ---------------------------------------------------------------------------
# JWT RS256
# ---------------------------------------------------------------------------


def test_jwt_emision_y_verificacion_ok():
    token, jti, exp = emitir_jwt(PRIV, PUB, "bea", ["BMAE Comercial"], ahora=AHORA)
    p = verificar_jwt(token, JWKS, ahora=AHORA)
    assert p["sub"] == "bea" and p["roles"] == ["BMAE Comercial"] and p["jti"] == jti
    assert exp - int(AHORA.timestamp()) == 8 * 3600


def test_jwt_tamperado_no_pasa_firma():
    token, _, _ = emitir_jwt(PRIV, PUB, "bea", ["BMAE Comercial"], ahora=AHORA)
    partes = token.split(".")
    limite = partes[1]
    payload = json.loads(__import__("base64").urlsafe_b64decode(limite + "=" * (-len(limite) % 4)))
    payload["roles"] = ["System Manager"]  # mano negra
    import base64
    partes[1] = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    with pytest.raises(ErrorJwt, match="firma"):
        verificar_jwt(".".join(partes), JWKS, ahora=AHORA)


def test_jwt_expirado_rechazado():
    token, _, _ = emitir_jwt(PRIV, PUB, "bea", ["BMAE Comercial"], ahora=AHORA)
    with pytest.raises(ErrorJwt, match="expirado"):
        verificar_jwt(token, JWKS, ahora=AHORA + timedelta(hours=8, minutes=5))


def test_jwt_kid_desconocido_rechazado():
    _, pub2 = generar_par_rsa(2048)
    token, _, _ = emitir_jwt(PRIV, PUB, "bea", ["BMAE Comercial"], ahora=AHORA)
    with pytest.raises(ErrorJwt, match="kid"):
        verificar_jwt(token, {"keys": [jwk_publico(pub2)]}, ahora=AHORA)


def test_jwt_rotacion_trimestral_coexisten_dos_kid():
    priv2, pub2 = generar_par_rsa(2048)
    jwks2 = {"keys": [jwk_publico(PUB), jwk_publico(pub2)]}
    t_viejo, _, _ = emitir_jwt(PRIV, PUB, "maria", ["BMAE Ingeniero"], ahora=AHORA)
    t_nuevo, _, _ = emitir_jwt(priv2, pub2, "maria", ["BMAE Ingeniero"], ahora=AHORA)
    assert verificar_jwt(t_viejo, jwks2, ahora=AHORA)["sub"] == "maria"
    assert verificar_jwt(t_nuevo, jwks2, ahora=AHORA)["sub"] == "maria"
    assert kid_de(PUB) != kid_de(pub2)


def test_tipo_incorrecto_rechazado():
    token, _, _ = emitir_jwt(PRIV, PUB, "bea", ["BMAE Comercial"], tipo="refresh", ahora=AHORA)
    with pytest.raises(ErrorJwt, match="type"):
        verificar_jwt(token, JWKS, ahora=AHORA, tipo_esperado="access")


# ---------------------------------------------------------------------------
# Roles: Teams → roles (§4.1) y RBAC (§4.3)
# ---------------------------------------------------------------------------


def test_roles_de_teams_exacto_del_maestro():
    assert roles_de_teams(["comerciales"]) == ["BMAE Comercial"]
    assert roles_de_teams(["ingenieros"]) == ["BMAE Ingeniero"]
    assert roles_de_teams(["admin"]) == ["System Manager", "BMAE Admin"]
    assert roles_de_teams(["partners"]) == ["BMAE Partner (ReadOnly)"]
    assert roles_de_teams(["comerciales", "admin"]) == ["BMAE Comercial", "System Manager", "BMAE Admin"]
    assert roles_de_teams(["otro-raro"]) == []


def test_rbac_matriz():
    assert puede(["BMAE Comercial"], "frontend", "pdf")
    assert not puede(["BMAE Comercial"], "verifactu", "emision")
    assert puede(["BMAE Administracion"], "verifactu", "emision")
    assert puede(["System Manager"], "twenty", "control-total")
    assert not puede(["BMAE Partner (ReadOnly)"], "twenty", "crud-sus-deals")


# ---------------------------------------------------------------------------
# Canal cifrado HKDF/AES-GCM (contingencia gist)
# ---------------------------------------------------------------------------


def test_canal_ida_y_vuelta():
    secreto, state = "codigo-oauth-efimero", generar_state()
    blob = cifrar('{"access":"x","refresh":"y"}', secreto, state)
    assert descifrar(blob, secreto, state) == '{"access":"x","refresh":"y"}'
    with pytest.raises(Exception):
        descifrar(blob, "otro-secreto", state)


# ---------------------------------------------------------------------------
# Flujos (B4 intercambio · B5 rotación estricta · B3 revocación)
# ---------------------------------------------------------------------------


def _github_ok(code):
    return ("bea", ["comerciales"]) if code == "valido" else ("fantasma", [])


def test_intercambio_emite_dos_tokens_e_informe_limpio():
    inf = intercambio("valido", generar_state(), _github_ok, PRIV, PUB, ahora=AHORA)
    assert inf["roles"] == ["BMAE Comercial"]
    pak = inf["paquete"]
    assert verificar_jwt(pak["access"], JWKS, ahora=AHORA)["type"] == "access"
    assert verificar_jwt(pak["refresh"], JWKS, ahora=AHORA, tipo_esperado="refresh")
    assert inf["paquete"]["exp"] - int(AHORA.timestamp()) == 8 * 3600


def test_intercambio_rechaza_sin_membership():
    with pytest.raises(ErrorIntercambio, match="membership"):
        intercambio("malo", generar_state(), _github_ok, PRIV, PUB, ahora=AHORA)


def test_intercambio_canal_gist_de_contingencia_solo_para_ella():
    state = generar_state()
    gist = GistFalso()
    inf = intercambio("valido", state, _github_ok, PRIV, PUB, almacen=gist, ahora=AHORA)
    nombre = inf["canal_fichero"]
    blob = gist.ficheros[nombre]
    # solo quien tiene el code puede descifrar su propio paquete
    paquete = json.loads(descifrar(blob, "valido", state))
    assert verificar_jwt(paquete["access"], JWKS, ahora=AHORA)["type"] == "access"
    with pytest.raises(Exception):
        descifrar(blob, "codigo-de-otra-usuaria", state)


def test_refresco_rota_y_consumir_el_viejo_es_robo():
    inf = intercambio("valido", generar_state(), _github_ok, PRIV, PUB, ahora=AHORA)
    refresh1 = inf["paquete"]["refresh"]
    deny = GistFalso()
    inf2 = refresco(refresh1, JWKS, deny, PRIV, PUB, ahora=AHORA + timedelta(hours=2))
    assert inf2["paquete"]["refresh"] != refresh1
    # reuso del viejo tras rotar: robo detectado → sujeto bloqueado
    with pytest.raises(ErrorJwt, match="reuso"):
        refresco(refresh1, JWKS, deny, PRIV, PUB, ahora=AHORA + timedelta(hours=3))
    # y ya nada nuevo puede emitirse para ese sujeto
    with pytest.raises(ErrorJwt, match="bloqueado"):
        refresco(inf2["paquete"]["refresh"], JWKS, deny, PRIV, PUB,
                 ahora=AHORA + timedelta(hours=4))


def test_revocar_subject_cierra_todas_sus_sesiones():
    deny = GistFalso()
    inf = intercambio("valido", generar_state(), _github_ok, PRIV, PUB, ahora=AHORA)
    out = revocar(deny, subject="bea")
    assert out["subjects_bloqueados"] == 1
    with pytest.raises(ErrorJwt, match="bloqueado"):
        refresco(inf["paquete"]["refresh"], JWKS, deny, PRIV, PUB, ahora=AHORA)


def test_revocar_exige_objetivo():
    deny = GistFalso()
    with pytest.raises(ValueError):
        revocar(deny)
