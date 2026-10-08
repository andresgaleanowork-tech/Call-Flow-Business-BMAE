# -*- coding: utf-8 -*-
"""
jwt_rs256.py — JWT STATELESS firmado RS256 (§4.1): 8 h de acceso, refresh
rotativo 30 días, `kid` rotado trimestralmente con JWKS público.

Sin librerías JWT externas: RS256 = RSASSA-PKCS1-v1_5/SHA-256, implementado
sobre `cryptography` con base64url canónico. La verificación admite un JWKS
(cualquier `kid` vigente) — el edge (Traefik ForwardAuth) solo necesita el
JWKS público, §4.2 paso 9.

Tipos: `type=access` (8h) y `type=refresh` (30d). Revocación por `jti` en
denylist (gist privado append-only, ver refresh.py).
"""

from __future__ import annotations

import base64
import hashlib
import json
import secrets
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

ISSUER = "bmae-auth"
AUDIENCE = "bmae"
ACCESS_TTL = timedelta(hours=8)
REFRESH_TTL = timedelta(days=30)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)


# ---------------------------------------------------------------------------
# Claves
# ---------------------------------------------------------------------------


def generar_par_rsa(bits: int = 3072) -> tuple:
    """Par RSA de rotación trimestral (§4.1). Devuelve (PEM_priv, PEM_pub)
    en bytes. La PRIVADA jamás sale del Environment Secret."""

    clave = rsa.generate_private_key(public_exponent=65537, key_size=bits)
    priv = clave.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    )
    pub = clave.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return priv, pub


def kid_de(pub_pem: bytes) -> str:
    """kid estable: 8 chars del sha256 de la pública (rotación trazable)."""

    return hashlib.sha256(pub_pem).hexdigest()[:8]


def jwk_publico(pub_pem: bytes, kid: str | None = None) -> dict:
    """JWK pública del JWKS (n, e, kid, alg, use — RFC 7517/7518)."""

    pub = serialization.load_pem_public_key(pub_pem)
    nums = pub.public_numbers()
    kid = kid or kid_de(pub_pem)
    return {
        "kty": "RSA",
        "use": "sig",
        "alg": "RS256",
        "kid": kid,
        "n": _b64(nums.n.to_bytes((nums.n.bit_length() + 7) // 8, "big")),
        "e": _b64(nums.e.to_bytes((nums.e.bit_length() + 7) // 8, "big")),
    }


# ---------------------------------------------------------------------------
# Emisión
# ---------------------------------------------------------------------------


def _firmar(priv_pem: bytes, cabecera: dict, payload: dict) -> str:
    priv = serialization.load_pem_private_key(priv_pem, password=None)
    p_seg = _b64(json.dumps(cabecera, separators=(",", ":")).encode())
    s_seg = _b64(json.dumps(payload, separators=(",", ":")).encode())
    firme = priv.sign(
        f"{p_seg}.{s_seg}".encode(),
        padding.PKCS1v15(),
        hashes.SHA256(),
    )
    return f"{p_seg}.{s_seg}.{_b64(firme)}"


def emitir_jwt(
    priv_pem: bytes,
    pub_pem: bytes,
    usuario: str,
    roles: list,
    tipo: str = "access",
    ahora: datetime | None = None,
) -> tuple:
    """Devuelve (token, jti, exp_epoch). `roles` ya canonizados (roles.py)."""

    if tipo not in ("access", "refresh"):
        raise ValueError("tipo debe ser access|refresh")
    ahora = ahora or datetime.now(timezone.utc)
    ttl = ACCESS_TTL if tipo == "access" else REFRESH_TTL
    jti = secrets.token_hex(16)
    exp = ahora + ttl
    cabecera = {"alg": "RS256", "typ": "JWT", "kid": kid_de(pub_pem)}
    payload = {
        "iss": ISSUER,
        "aud": AUDIENCE,
        "sub": usuario,
        "roles": list(roles),
        "type": tipo,
        "iat": int(ahora.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": jti,
    }
    return _firmar(priv_pem, cabecera, payload), jti, int(exp.timestamp())


# ---------------------------------------------------------------------------
# Verificación
# ---------------------------------------------------------------------------


class ErrorJwt(Exception):
    """Token inválido, expirado o de tipo inesperado."""


def verificar_jwt(
    token: str,
    jwks: dict,
    ahora: datetime | None = None,
    tipo_esperado: str = "access",
    margen_s: int = 30,
) -> dict:
    """Verifica firma RS256 contra el JWKS (cualquier kid vigente), iss,
    aud, exp y type. Devuelve el payload si TODO cuadra."""

    ahora = ahora or datetime.now(timezone.utc)
    partes = token.split(".")
    if len(partes) != 3:
        raise ErrorJwt("forma JWT inválida (3 segmentos)")
    cabecera = json.loads(_unb64(partes[0]))
    payload = json.loads(_unb64(partes[1]))
    if cabecera.get("alg") != "RS256":
        raise ErrorJwt("alg distinto de RS256")
    jwk = None
    for k in jwks.get("keys", []):
        if k.get("kid") == cabecera.get("kid"):
            jwk = k
            break
    if jwk is None:
        raise ErrorJwt("kid desconocido (¿rotado sin publicar JWKS?)")
    n = int.from_bytes(_unb64(jwk["n"]), "big")
    e = int.from_bytes(_unb64(jwk["e"]), "big")
    pub = rsa.RSAPublicNumbers(e, n).public_key()
    try:
        pub.verify(
            _unb64(partes[2]),
            f"{partes[0]}.{partes[1]}".encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
    except Exception as exc:  # noqa: BLE001 — firma NO cuadra, punto
        raise ErrorJwt("firma RS256 inválida") from exc
    if payload.get("iss") != ISSUER or payload.get("aud") != AUDIENCE:
        raise ErrorJwt("iss/aud inesperados")
    if payload.get("type") != tipo_esperado:
        raise ErrorJwt(f"type {payload.get('type')} ≠ {tipo_esperado}")
    if int(payload["exp"]) + margen_s < int(ahora.timestamp()):
        raise ErrorJwt("token expirado")
    return payload


__all__ = [
    "ACCESS_TTL",
    "REFRESH_TTL",
    "ISSUER",
    "AUDIENCE",
    "ErrorJwt",
    "generar_par_rsa",
    "kid_de",
    "jwk_publico",
    "emitir_jwt",
    "verificar_jwt",
]
