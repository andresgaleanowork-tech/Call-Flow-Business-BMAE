#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI de A5.3: auditoría diaria de la cadena de huellas VeriFactu.

    python integracion/scripts/verifactu_audit.py \
        --erpnext "$ERPNEXT_BASE_URL" --serie "" --informe /tmp/verifactu-audit.json

Salida ≠ 0 → Issue CRÍTICO (cadena comprometida).
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_integracion import ErpnextCliente, auditar_cadena

CAMPOS = (
    '["naming_series","tax_id","posting_date","custom_tipo_factura",'
    '"total_taxes_and_charges","grand_total","custom_verifactu_huella",'
    '"custom_verifactu_instante","creation"]'
)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--erpnext", required=True)
    ap.add_argument("--serie", default="")
    ap.add_argument("--informe", default="/tmp/verifactu-audit.json")
    a = ap.parse_args()

    erp = ErpnextCliente(
        a.erpnext,
        {"Authorization": f"token {os.environ['ERPNEXT_API_KEY']}:{os.environ['ERPNEXT_API_SECRET']}"},
    )
    filtros = f'&filters=[["Sales Invoice","naming_series","like","{a.serie}%"]]' if a.serie else ""
    try:
        datos = erp.leer(
            f"/api/resource/Sales Invoice?fields={CAMPOS}{filtros}"
            "&limit_page_length=0&order_by=creation asc"
        )["data"]
        registros = [
            {
                "nif": d["tax_id"], "numero_serie": d["name"] if "name" in d else d["naming_series"],
                "fecha_expedicion": d["posting_date"],
                "tipo_factura": d.get("custom_tipo_factura", "F1"),
                "cuota_total": str(d["total_taxes_and_charges"]),
                "importe_total": str(d["grand_total"]),
                "huella": d["custom_verifactu_huella"],
                "fecha_hora_huso": d["custom_verifactu_instante"],
                "huella_anterior": d.get("custom_verifactu_huella_anterior"),
            }
            for d in datos
        ]
        informe = auditar_cadena(registros)
        informe["serie"] = a.serie or "(todas)"
        code = 0 if informe["ok"] else 1
    except Exception as e:  # noqa: BLE001
        informe = {"serie": a.serie, "error": str(e)[:500], "ok": False}
        code = 1
    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)
    return code


if __name__ == "__main__":
    sys.exit(main())
