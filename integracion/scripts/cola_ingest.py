#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ingesta del canal GitHub-total (docs/github-total.md §4): valida el
comentario del buzón Call-Flow, aplica el guardián anti-PII heredado
(defensa en profundidad; el navegador ya rechaza) y separa gestiones
aceptadas/duplicadas. Escribe el índice de huellas en datos/crm/.

    python integracion/scripts/cola_ingest.py --comentario /tmp/c.txt \
        --indice datos/crm/huellas-ingeridas.json --autor comercial --reporte /tmp/r.json

Formato esperado por línea JSON (espejo de lib/canalgithub.js):
    {"v":1,"canal":"callflow","segmento","resultado","nota","ts","huella","pos"}
El índice es solo de huellas ingeridas (idempotencia entre reintentos).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RE_TELEFONO = re.compile(r"(\+?\d[\d\s]{7,}\d)")
RE_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
RE_DOCUMENTO = re.compile(r"\b\d{7,8}[A-Z]\b", re.I)

TOPE_INDICE = 5000


def guardia(nota: str) -> str | None:
    if RE_TELEFONO.search(nota):
        return "PII: contiene teléfono"
    if RE_EMAIL.search(nota):
        return "PII: contiene email"
    if RE_DOCUMENTO.search(nota):
        return "PII: contiene documento de identidad"
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--comentario", required=True)
    ap.add_argument("--indice", default="datos/crm/huellas-ingeridas.json")
    ap.add_argument("--autor", default="")
    ap.add_argument("--reporte", default="/tmp/cola-ingest.json")
    a = ap.parse_args()

    ruta = Path(a.indice)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    indice = json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {
        "v": 1, "upd": "", "huellas": []}
    vistas = set(indice.get("huellas", []))

    aceptadas, rechazadas, duplicadas = [], [], []
    for linea in Path(a.comentario).read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or not linea.startswith("{"):
            continue
        try:
            g = json.loads(linea)
        except json.JSONDecodeError:
            rechazadas.append({"razon": "JSON inválido", "linea": linea[:80]})
            continue
        if g.get("canal") != "callflow":
            rechazadas.append({"razon": "canal no callflow", "linea": linea[:80]})
            continue
        if not isinstance(g.get("resultado"), str) or not g["resultado"]:
            rechazadas.append({"razon": "sin resultado", "linea": linea[:80]})
            continue
        pii = guardia(str(g.get("nota", "")))
        if pii:
            rechazadas.append({"razon": pii, "huella": g.get("huella", "")[:12]})
            continue
        h = str(g.get("huella", ""))
        if h and h in vistas:
            duplicadas.append(h)
            continue
        aceptadas.append({
            "segmento": str(g.get("segmento", "")),
            "nodo": str(g.get("nodo", "")),
            "resultado": g["resultado"],
            "nota": str(g.get("nota", ""))[:140],
            "ts": str(g.get("ts", "")),
            "huella": h,
            "pos": g.get("pos", 0),
        })
        if h:
            vistas.add(h)

    aceptadas.sort(key=lambda g: (g["ts"], g["pos"]))

    indice["upd"] = aceptadas[-1]["ts"][:10] if aceptadas else indice.get("upd", "")
    indice["huellas"] = sorted(vistas, reverse=True)[:TOPE_INDICE]
    ruta.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    reporte = {
        "autor": a.autor,
        "aceptadas": aceptadas,
        "rechazadas": rechazadas,
        "duplicadas": duplicadas,
        "total_lineas": len([x for x in Path(a.comentario).read_text(encoding="utf-8").splitlines() if x.strip().startswith("{")]),
    }
    Path(a.reporte).write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"aceptadas: {len(aceptadas)} · rechazadas: {len(rechazadas)} · duplicadas: {len(duplicadas)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
