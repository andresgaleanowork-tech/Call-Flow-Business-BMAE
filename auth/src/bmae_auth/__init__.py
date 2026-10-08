# -*- coding: utf-8 -*-
"""bmae_auth — Núcleo de autenticación GitHub OAuth + PKCE + JWT RS256.

Piezas:
  · pkce      — RFC 7636 (verifier/challenge/state) y clave del canal cifrado
  · jwt_rs256 — emisión/verificación RS256 con kid + JWKS (§4.1)
  · roles     — Teams → roles BMAE + matriz RBAC (§4.1/§4.3)
  · canal     — AES-256-GCM con clave HKDF(code_verifier) para el gist opaco
  · flujos    — intercambio code→JWT, refresh rotativo 30d, revocación

El diseño del canal gist de entrega está documentado en
`docs/autenticacion.md` (D-B1): el JWT NUNCA viaja en claro por un canal
público; el gist es opaco y su contenido, indescifrable sin el verifier.
"""

from .jwt_rs256 import (
    ACCESS_TTL,
    AUDIENCE,
    ISSUER,
    REFRESH_TTL,
    ErrorJwt,
    emitir_jwt,
    generar_par_rsa,
    jwk_publico,
    kid_de,
    verificar_jwt,
)
from .pkce import RE_STATE, RE_VERIFIER, challenge_s256, clave_canal, generar_state, generar_verifier
from .roles import MAPEO_TEAMS, MATRIZ, puede, roles_de_teams

__version__ = "0.1.0"

__all__ = [
    "ACCESS_TTL",
    "AUDIENCE",
    "ISSUER",
    "REFRESH_TTL",
    "ErrorJwt",
    "emitir_jwt",
    "generar_par_rsa",
    "jwk_publico",
    "kid_de",
    "verificar_jwt",
    "RE_STATE",
    "RE_VERIFIER",
    "challenge_s256",
    "clave_canal",
    "generar_state",
    "generar_verifier",
    "MAPEO_TEAMS",
    "MATRIZ",
    "puede",
    "roles_de_teams",
    "__version__",
]
