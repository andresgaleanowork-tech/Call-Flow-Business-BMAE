# -*- coding: utf-8 -*-
"""
flujos.py — Lógica PURA de autenticación (B4/B5/B3): nada de HTTP/Gist
hardcodeado, todo se INYECTA → mismos flujos sirven al ENDPOINT Frappe
síncrono (camino principal, §4.1 «Token Exchange: endpoint Frappe
auth_exchange») y a los workflows GitOps (§4.2, fallback documentado).

DECISIÓN D-B1 (docs/autenticacion.md):
  - SÍNCRONO: el llamador (endpoint Frappe / script del workflow) recibe
    directamente el paquete {access, refresh, exp} y lo devuelve por HTTPS.
  - CONTINGENCIA: si `almacen` se inyecta, el paquete también se cifra con
    HKDF(code|refresh) y se deposita en un gist opaco (canal demostrado
    en tests; despacha el SERVIDOR con su token, nunca el navegador).
  · Access 8 h; refresh rotativo 30 días; kid trimestral (§4.1).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from .canal import cifrar
from .jwt_rs256 import ErrorJwt, emitir_jwt, verificar_jwt
from .pkce import clave_canal
from .roles import roles_de_teams

DENYLIST_FICHERO = "revocations.json"


class ErrorIntercambio(Exception):
    """Fallo controlado del intercambio OAuth/PKCE."""


def intercambio(
    code: str,
    state: str,
    github,
    priv_pem: bytes,
    pub_pem: bytes,
    almacen=None,
    ahora: datetime | None = None,
) -> dict:
    """B4 — code OAuth → (usuario, teams) → roles → 2 JWT RS256.

    `github`: callable(code) → (login, [slugs_teams]). `almacen` opcional
    con escribir(nombre, contenido) para el canal gist de contingencia.
    Devuelve el paquete listo para HTTPS (endpoint síncrono) SIEMPRE, MÁS
    informe sin secretos; si hay almacen, añade el nombre del fichero.
    """

    ahora = ahora or datetime.now(timezone.utc)
    if not code or not isinstance(code, str):
        raise ErrorIntercambio("code OAuth vacío")

    usuario, teams = github(code=code)
    roles = roles_de_teams(teams)
    if not roles:
        raise ErrorIntercambio(
            f"{usuario} sin membership en equipos BMAE (§4.1): "
            f"el rol Público/Lead opera fuera del portal, sin JWT"
        )

    access, jti_a, exp_a = emitir_jwt(priv_pem, pub_pem, usuario, roles, "access", ahora)
    refresh, jti_r, exp_r = emitir_jwt(priv_pem, pub_pem, usuario, roles, "refresh", ahora)

    paquete = {"access": access, "refresh": refresh,
               "exp": exp_a, "roles": roles, "usuario": usuario}
    informe = {
        "usuario": usuario, "roles": roles, "teams": teams,
        "jti_access": jti_a, "jti_refresh": jti_r,
        "exp_access": exp_a, "exp_refresh": exp_r,
        "paquete": paquete,
    }
    if almacen is not None:
        # Contingencia GitOps: gist cifrado solo-para-ella (HKDF del code,
        # efímero y compartido solo por navegador↔GitHub en el callback).
        canal = cifrar(
            json.dumps(paquete, separators=(",", ":")), secreto=code, state=state
        )
        informe["canal_fichero"] = clave_canal(state)
        almacen.escribir(informe["canal_fichero"], canal)
    return informe


def refresco(
    refresh_jwt: str,
    jwks: dict,
    almacen_deny,
    priv_pem: bytes,
    pub_pem: bytes,
    state: str = "",
    almacen=None,
    ahora: datetime | None = None,
) -> dict:
    """B5 — Rotación ESTRICTA 30 d: el refresh viejo se consume (jti a la
    denylist) y se emite uno nuevo. REUSO de un refresh ya rotado = robo
    → bloqueo total del sujeto (§4.4 mitigación phishing/fuga JWT)."""

    ahora = ahora or datetime.now(timezone.utc)
    payload = verificar_jwt(refresh_jwt, jwks, ahora, tipo_esperado="refresh")

    deny = almacen_deny.leer(DENYLIST_FICHERO)
    if payload["jti"] in deny.get("revocados", []):
        almacen_deny.escribir(
            DENYLIST_FICHERO,
            {
                "revocados": sorted(set(deny.get("revocados", []))),
                "subjects_bloqueados": sorted(set(
                    deny.get("subjects_bloqueados", []) + [payload["sub"]])),
            },
        )
        raise ErrorJwt(
            f"reuso de refresh revocado: sujeto {payload['sub']} BLOQUEADO"
        )
    if payload["sub"] in deny.get("subjects_bloqueados", []):
        raise ErrorJwt(f"sujeto {payload['sub']} bloqueado por seguridad")

    access, jti_a, exp_a = emitir_jwt(
        priv_pem, pub_pem, payload["sub"], payload["roles"], "access", ahora
    )
    refresh_nuevo, jti_r, exp_r = emitir_jwt(
        priv_pem, pub_pem, payload["sub"], payload["roles"], "refresh", ahora
    )
    almacen_deny.escribir(
        DENYLIST_FICHERO,
        {
            "revocados": sorted(set(deny.get("revocados", []) + [payload["jti"]])),
            "subjects_bloqueados": deny.get("subjects_bloqueados", []),
        },
    )

    paquete = {"access": access, "refresh": refresh_nuevo,
               "exp": exp_a, "roles": payload["roles"], "usuario": payload["sub"]}
    informe = {
        "usuario": payload["sub"], "roles": payload["roles"],
        "jti_access": jti_a, "jti_refresh_nuevo": jti_r,
        "exp_access": exp_a, "exp_refresh_nuevo": exp_r,
        "paquete": paquete,
    }
    if almacen is not None:
        canal = cifrar(
            json.dumps(paquete, separators=(",", ":")),
            secreto=refresh_jwt, state=state,
        )
        informe["canal_fichero"] = clave_canal(state)
        almacen.escribir(informe["canal_fichero"], canal)
    return informe


def revocar(almacen_deny, jti: str | None = None, subject: str | None = None) -> dict:
    """B3 — Logout forzado: jti suelto o subject entero a la denylist."""

    if not jti and not subject:
        raise ValueError("revocar exige jti o subject")
    deny = almacen_deny.leer(DENYLIST_FICHERO)
    revocados = sorted(set(deny.get("revocados", [])) | ({jti} if jti else set()))
    bloqueados = sorted(set(deny.get("subjects_bloqueados", [])) | ({subject} if subject else set()))
    almacen_deny.escribir(
        DENYLIST_FICHERO,
        {"revocados": revocados, "subjects_bloqueados": bloqueados},
    )
    return {"revocados": len(revocados), "subjects_bloqueados": len(bloqueados)}


__all__ = [
    "DENYLIST_FICHERO",
    "ErrorIntercambio",
    "intercambio",
    "refresco",
    "revocar",
]
