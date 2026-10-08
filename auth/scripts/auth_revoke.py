#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI B3 — revocación (logout forzado, §4.4). Puede dispararse por:
logout del propio usuario (endpoint), comentario «/revoke @usuario»
en Issue etiquetado `auth` (auditoría GitHub, §2.5) o cron de barrido.

    python auth/scripts/auth_revoke.py [--jti XXX | --subject @usuario] \
        --informe ..."""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_auth.flujos import revocar

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
from auth_refresh import GistDenylist  # noqa: E402 — storage compartido


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--jti", default=None)
    ap.add_argument("--subject", default=None)
    ap.add_argument("--informe", default="/tmp/auth-revoke-informe.json")
    a = ap.parse_args()

    deny = GistDenylist(os.environ["GIST_TOKEN"], os.environ["DENYLIST_GIST_ID"])
    try:
        informe = revocar(deny, jti=a.jti, subject=a.subject)
        informe["objetivo"] = {"jti": a.jti, "subject": a.subject}
        codigo = 0
    except Exception as e:  # noqa: BLE001
        informe = {"error": str(e)[:400]}
        codigo = 1
    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)
    return codigo


if __name__ == "__main__":
    sys.exit(main())
