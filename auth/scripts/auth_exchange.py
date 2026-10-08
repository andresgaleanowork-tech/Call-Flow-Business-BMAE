#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI B4 — intercambio OAuth code → JWT RS256 (auth-exchange.yml y
endpoint Frappe comparten este mismo núcleo).

Modos:
  --uso endpoint   → imprime el paquete {access,refresh,exp} por stdout
                     (JSON) para el handler Frappe que responde al navegador.
  --uso gist       → deposita el paquete cifrado en el gist opaco
                     (HKDF(code)) y escribe el informe (rams GitOps).

Entorno: AUTH_PRIVATE_KEY_PEM (Environment Secret) · AUTH_PUBLIC_KEY_PEM
· GITHUB_OAUTH_CLIENT_ID/SECRET (intercambio code) · GIST_TOKEN (solo gist).
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_auth.flujos import ErrorIntercambio, intercambio
from bmae_auth import jwk_publico


class GistGitHub:
    """Gist público opaco de contingencia (§4.2.6f). Solo usable con
    GIST_TOKEN del workflow; JAMÁS desde el navegador."""

    def __init__(self, token: str):
        import requests

        self._s = requests.Session()
        self._s.headers["Authorization"] = f"token {token}"
        self._base = "https://api.github.com/gists"

    def escribir(self, nombre: str, contenido: str) -> str:
        r = self._s.post(
            self._base,
            json={
                "description": "bmae-auth-canal",
                "public": False,
                "files": {nombre: {"content": contenido}},
            },
            timeout=20,
        )
        r.raise_for_status()
        return r.json()["id"]


def _github_oficial(client_id: str, client_secret: str):
    """Intercambio real: code → access_token GitHub, /user + /user/teams."""

    import requests

    def llamada(code: str):
        r = requests.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
            timeout=20,
        )
        datos = r.json()
        token = datos.get("access_token")
        if not token:
            raise ErrorIntercambio(f"GitHub rechazó el code: {datos.get('error_description', datos)}")
        s = requests.Session()
        s.headers.update({"Authorization": f"token {token}", "Accept": "application/vnd.github+json"})
        usuario = s.get("https://api.github.com/user", timeout=20).json()["login"]
        teams = [t["slug"] for t in s.get("https://api.github.com/user/teams", timeout=20).json()]
        return usuario, teams

    return llamada


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code", required=True)
    ap.add_argument("--state", required=True)
    ap.add_argument("--uso", choices=["endpoint", "gist"], default="endpoint")
    ap.add_argument("--informe", default="/tmp/auth-exchange-informe.json")
    a = ap.parse_args()

    priv = os.environ["AUTH_PRIVATE_KEY_PEM"].encode()
    pub = os.environ["AUTH_PUBLIC_KEY_PEM"].encode()
    github = _github_oficial(
        os.environ["GITHUB_OAUTH_CLIENT_ID"], os.environ["GITHUB_OAUTH_CLIENT_SECRET"]
    )
    almacen = GistGitHub(os.environ["GIST_TOKEN"]) if a.uso == "gist" else None

    try:
        inf = intercambio(a.code, a.state, github, priv, pub, almacen=almacen)
        informe = {k: v for k, v in inf.items() if k != "paquete"}
        codigo = 0
    except Exception as e:  # noqa: BLE001 — informe DLQ del workflow
        informe = {"error": str(e)[:400]}
        codigo = 1

    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)

    if codigo == 0 and a.uso == "endpoint":
        print(json.dumps(inf["paquete"], separators=(",", ":")))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
