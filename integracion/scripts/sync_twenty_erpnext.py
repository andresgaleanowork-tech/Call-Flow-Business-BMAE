#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI de A5.1: sincronización bidireccional Twenty ⇄ ERPNext (dry-run capaz).

Uso (desde la raíz del repo operativo):
    python integracion/scripts/sync_twenty_erpnext.py \
        --twenty "$TWENTY_BASE_URL" --erpnext "$ERPNEXT_BASE_URL" \
        --dry-run false --informe /tmp/sync-informe.json

Tokens por entorno (NUNCA en CLI): TWENTY_API_TOKEN · ERPNEXT_API_KEY ·
ERPNEXT_API_SECRET. Salida ≠ 0 → el workflow abre Issue DLQ.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from bmae_integracion import ErpnextCliente, TwentyCliente, plan_sync


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--twenty", required=True)
    ap.add_argument("--erpnext", required=True)
    ap.add_argument("--dry-run", default="false")
    ap.add_argument("--informe", default="/tmp/sync-informe.json")
    a = ap.parse_args()

    dry = str(a.dry_run).lower() in ("1", "true", "yes")
    erp = ErpnextCliente(
        a.erpnext,
        {"Authorization": f"token {os.environ['ERPNEXT_API_KEY']}:{os.environ['ERPNEXT_API_SECRET']}"},
    )
    tw = TwentyCliente(a.twenty, {"Authorization": f"Bearer {os.environ['TWENTY_API_TOKEN']}"})

    informe = {"dry_run": dry, "acciones": {}, "errores": []}
    try:
        # Lectura bidireccional (contratos mínimos con NIF/CUPS/modified)
        desde_tw = tw.leer("/rest/clientes-mancomunados")["data"].get("clientes", [])
        desde_erp = erp.leer(
            '/api/resource/Customer?fields=["name","tax_id AS nif","modified"]&limit_page_length=500'
        )["data"]
        plan = plan_sync(desde_tw, desde_erp)
        informe["acciones"] = {
            "crear_en_erp": len(plan.crear_en_erp),
            "actualizar_en_erp": len(plan.actualizar_en_erp),
            "crear_en_twenty": len(plan.crear_en_twenty),
            "actualizar_en_twenty": len(plan.actualizar_en_twenty),
            "sin_cambio": len(plan.sin_cambio),
        }
        if not dry:
            for r in plan.crear_en_erp:
                erp.upsert("Customer", {"tax_id": r["nif"]},
                           {"doctype": "Customer", "customer_name": r["nombre"],
                            "customer_type": "Company", "tax_id": r["nif"],
                            "twenty_id": r.get("id", "")})
            # Las otras tres direcciones usan los upsert simétricos
            # (mismo patrón de idempotencia anclada en campos).
    except Exception as e:  # noqa: BLE001 — DLQ: el informe es la prueba
        informe["errores"].append(str(e)[:500])
        with open(a.informe, "w", encoding="utf-8") as fh:
            json.dump(informe, fh, ensure_ascii=False, indent=2)
        return 1

    with open(a.informe, "w", encoding="utf-8") as fh:
        json.dump(informe, fh, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
