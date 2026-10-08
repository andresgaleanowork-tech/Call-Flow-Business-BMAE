# -*- coding: utf-8 -*-
"""
canal.py — Entrega cifrada del JWT vía gist opaco (diseño D-B1, §4.2.6f-g).

Problema real del flujo del maestro: GitHub Actions es ASÍNCRONO — el
frontend público no puede recibir el JWT por conexión directa. Solución:
el workflow escribe un Gist PÚBLICO cuyo ID es aleatorio y cuyo contenido
está cifrado con AES-256-GCM, clave derivada por HKDF-SHA256 de un secreto
que SOLO conoce el legítimo destinatario:

  · exchange → secreto = code_verifier del PKCE (jamás sale del navegador;
    el servidor solo recibe el challenge SHA-256, irreversible).
  · refresh  → secreto = el propio refresh token que se está rotando.

Sin el secreto, el gist es bytes indiferenciables de ruido. El gist se
autodestruye por cron (TTL 10 min, ver workflows/auth-*.yml) y el fichero
se nombra por sha256(state) — nadie puede ni enumerar canales ajenos.

Wire format del fichero: base64url(nonce 12 B ‖ ciphertext ‖ tag 16 B).
"""

from __future__ import annotations

import base64
import secrets

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

INFO = b"bmae-auth-canal"
LARGO_CLAVE = 32  # AES-256


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _unb64(s: str) -> bytes:
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)


def clave_canal_cifrado(secreto: str, state: str) -> bytes:
    """HKDF-SHA256(secreto, salt=state, info=bmae-auth-canal) → 32 B."""

    return HKDF(
        algorithm=hashes.SHA256(),
        length=LARGO_CLAVE,
        salt=state.encode("ascii"),
        info=INFO,
    ).derive(secreto.encode("utf-8"))


def cifrar(texto: str, secreto: str, state: str) -> str:
    """Cifra para el gist: el navegador descifra con WebCrypto (AES-GCM)."""

    nonce = secrets.token_bytes(12)
    aead = AESGCM(clave_canal_cifrado(secreto, state))
    c = aead.encrypt(nonce, texto.encode("utf-8"), None)
    return _b64(nonce + c)


def descifrar(blob_b64: str, secreto: str, state: str) -> str:
    """Espejo de cifrar (tests + CLI; en el navegador vive el código JS)."""

    blob = _unb64(blob_b64)
    if len(blob) < 12 + 16:
        raise ValueError("blob cifrado demasiado corto")
    nonce, c = blob[:12], blob[12:]
    aead = AESGCM(clave_canal_cifrado(secreto, state))
    return aead.decrypt(nonce, c, None).decode("utf-8")


__all__ = ["INFO", "cifrar", "descifrar", "clave_canal_cifrado"]
