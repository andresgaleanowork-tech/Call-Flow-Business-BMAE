# -*- coding: utf-8 -*-
"""
pkce.py — RFC 7636: code_verifier / challenge S256 / state CSRF (§4.2).

El par (state, verifier) se genera SOLO en el frontend (el navegador); este
módulo valida su forma en el servidor y reconstruye la clave del canal
cifrado (hash del state) sin jamás conocer el verifier.
"""

from __future__ import annotations

import hashlib
import re
import secrets
import string

_ALFABETO_VERIFIER = string.ascii_letters + string.digits + "-._~"
RE_VERIFIER = re.compile(r"^[A-Za-z0-9\-._~]{43,128}$")
RE_STATE = re.compile(r"^[0-9a-f]{64}$")


def generar_verifier(longitud: int = 64) -> str:
    """43..128 chars del alfabeto RFC 7636 §4.1 (entropía de secrets)."""

    if not 43 <= longitud <= 128:
        raise ValueError("verifier fuera del rango RFC 7636 (43-128)")
    return "".join(secrets.choice(_ALFABETO_VERIFIER) for _ in range(longitud))


def challenge_s256(verifier: str) -> str:
    """BASE64URL-SHA256 sin padding (RFC 7636 §4.2)."""

    if not RE_VERIFIER.match(verifier):
        raise ValueError("code_verifier con forma inválida")
    import base64

    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def generar_state() -> str:
    """64 hex (32 bytes) — anti-CSRF + clave opaca del canal gist."""

    return secrets.token_hex(32)


def clave_canal(state: str) -> str:
    """Nombre opaco del fichero en el gist (sha256 del state): quien no
    tenga el state no puede ni enumerar el canal."""

    if not RE_STATE.match(state):
        raise ValueError("state CSRF con forma inválida")
    return hashlib.sha256(state.encode("ascii")).hexdigest()


__all__ = ["RE_VERIFIER", "RE_STATE", "generar_verifier", "challenge_s256",
           "generar_state", "clave_canal"]
