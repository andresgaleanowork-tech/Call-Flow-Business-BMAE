#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI B5 — rotación estricta de refresh tokens (auth-refresh.yml).

    python auth/scripts/auth_refresh.py --refresh "$REFRESH" --informe ... \
        [--uso endpoint|gist]

Denylist: Gist PRIVADO append-only (`revocations.json`) — la revocación
nunca se borra: rotado 30 d, reuso-bloqueo y revocación explícita
conviven con trazabilidad total (§4.4)."""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_auth import jwk_publico
from bmae_auth.flujos import refresco


class GistDenylist:
    """Gist privado del owner con `revocations.json` (append-only)."""

    def __init__(self, token: str, gist_id: str):
        import requests

        self._s = requests.Session()
        self._s.headers["Authorization"] = f"token {token}"
        self._url = f"https://api.github.com/gists/{gist_id}"

    def leer(self, nombre: str):
        r = self._s.get(self._url, timeout=20)
        r.raise_for_status()
        fich = r.json()["files"].get(nombre, {})
        contenido = fich.get("content", "{}")
        try:
            return json.loads(contenido)
        except json.JSONDecodeError:
            return {"revocados": [], "subjects_bloqueados": []}

    def escribir(self, nombre: str, datos: dict):
        r = self._s.patch(
            self._url,
            json={"files": {nombre: {"content": json.dumps(datos, ensure_ascii=False, indent=2)}}},
            timeout=20,
        )
        r.raise_for_status()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh", required=True)
    ap.add_argument("--informe", default="/tmp/auth-refresh-informe.json")
    ap.add_argument("--uso", choices=["endpoint", "gist"], default="endpoint")
    a = ap.parse_args()

    priv = os.environ["AUTH_PRIVATE_KEY_PEM"].encode()
    pub = os.environ["AUTH_PUBLIC_KEY_PEM"].encode()
    deny = GistDenylist(os.environ["GIST_TOKEN"], os.environ["DENYLIST_GIST_ID"])

    try:
        inf = refresco(a.refresh, {"keys": [jwk_publico(pub)]}, deny, priv, pub)
        informe = {k: v for k, v in inf.items() if k != "paquete"}
        codigo = 0
    except Exception as e:  # noqa: BLE001
        informe = {"error": str(e)[:400]}
        codigo = 1
    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)
    if codigo == 0:
        print(json.dumps(inf["paquete"], separators=(",", ":")))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
