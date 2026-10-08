#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI de A5.2: provisión ERPNext al ganar una oportunidad Twenty.

    python integracion/scripts/opportunity_won.py \
        --oportunidad "$OPPORTUNITY_ID" --informe /tmp/provision-informe.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_integracion import ErpnextCliente, TwentyCliente, provisionar


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--oportunidad", required=True)
    ap.add_argument("--informe", default="/tmp/provision-informe.json")
    a = ap.parse_args()

    erp = ErpnextCliente(
        os.environ["ERPNEXT_BASE_URL"],
        {"Authorization": f"token {os.environ['ERPNEXT_API_KEY']}:{os.environ['ERPNEXT_API_SECRET']}"},
    )
    tw = TwentyCliente(
        os.environ["TWENTY_BASE_URL"],
        {"Authorization": f"Bearer {os.environ['TWENTY_API_TOKEN']}"},
    )
    informe = {}
    try:
        op = tw.leer(f"/rest/opportunities/{a.oportunidad}")["data"]
        informe = provisionar(op, erp)
        code = 0
    except Exception as e:  # noqa: BLE001
        informe = {"oportunidad": a.oportunidad, "error": str(e)[:500]}
        code = 1
    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)
    return code


if __name__ == "__main__":
    sys.exit(main())
