#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI de A5.4: Excel de tarifas → JSON validado Pydantic (+ rechazadas).

    python integracion/scripts/import_catalogo.py \
        --excel datos-entrada/tarifas/catalogo.xlsx \
        --salida /tmp/ofertas-validadas.json --rechazadas /tmp/ofertas-rechazadas.json

Vectores por periodo en Excel como CSV dentro de la celda: «40;40» o
«10;9;8;8;8;5». Salida ≠ 0 si hay rechazadas (el workflow hace `test ! -s`).
"""

from __future__ import annotations

import argparse
import json
import sys

import pandas as pd

from bmae_integracion import validar_filas


def _vec(cell):
    return [x.strip() for x in str(cell).replace(",", ".").split(";") if x.strip() != ""]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--excel", required=True)
    ap.add_argument("--salida", required=True)
    ap.add_argument("--rechazadas", required=True)
    a = ap.parse_args()

    df = pd.read_excel(a.excel, sheet_name=0, dtype=str).fillna("")
    filas = []
    for _, r in df.iterrows():
        f = {
            "id_oferta": r.get("id_oferta", ""), "nombre": r.get("nombre", ""),
            "peaje": r.get("peaje", ""), "modalidad": r.get("modalidad", "fija"),
            "precio_potencia": _vec(r.get("precio_potencia", "")),
        }
        for k in ("precio_energia", "precio_market", "costes_comercializacion",
                  "perdidas", "peajes_energia", "cargos_energia"):
            v = r.get(k, "")
            if str(v).strip():
                f[k] = _vec(v)
        if str(r.get("margen", "")).strip():
            f["margen"] = str(r["margen"]).strip()
        filas.append(f)

    ok, ko = validar_filas(filas)
    with open(a.salida, "w", encoding="utf-8") as fh:
        json.dump({"origen": a.excel, "aceptadas": len(ok), "ofertas": ok},
                  fh, ensure_ascii=False, indent=2)
    with open(a.rechazadas, "w", encoding="utf-8") as fh:
        json.dump(ko, fh, ensure_ascii=False, indent=2)
    return 0 if not ko else 1


if __name__ == "__main__":
    sys.exit(main())
