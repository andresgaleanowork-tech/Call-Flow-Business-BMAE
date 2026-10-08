#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""prospectos_importar.py — A1 prospección viva: CSV export (IberCRM,
latin-1, separador `;`) → datos/prospectos/ normalizado para la SPA.

Contrato de salida (repo PRIVADO — los datos son prospectos reales):
  · <salida>/index.json       → {generado, total, ciudades: [{ciudad, n, archivo}]}
  · <salida>/ciudad_<slug>.json → {"ciudad": …, "prospectos": [fila, …]}

filas (tolerantes con columnas faltantes):
  Company Name;Address;Postal Code;City;State;Phone;Email;Website

Reglas honestas:
  · dedupe por (nombre, teléfono) — informes cuentan las descartadas;
  · teléfono normalizado a `999 99 99 99`; email minúsculas;
  · web sin protocolo; nombre tal cual (nada de title-case agresivo);
  · id estable `prs-<slug-ciudad>-<n>`, enlace trazable desde la SPA;
  · nunca escribe fuera de --salida; --dry-run informa sin tocar nada.

    python integracion/scripts/prospectos_importar.py --csv export.csv
    python integracion/scripts/prospectos_importar.py --csv export.csv --dry-run
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import unicodedata
from pathlib import Path

SALIDA_DEF = Path(__file__).resolve().parents[2] / "datos" / "prospectos"
UMBRAL_ARCHIVO = 25   # ciudades con <25 prospectos → agrupadas en "__otras__"

COLUMNAS = {
    "nombre": ["company name", "nombre", "empresa", "company"],
    "direccion": ["address", "direccion", "dirección"],
    "cp": ["postal code", "cp", "código postal", "codigo postal"],
    "ciudad": ["city", "ciudad", "municipio", "poblacion", "población"],
    "estado": ["state", "provincia", "region"],
    "telefono": ["phone", "telefono", "teléfono", "tel"],
    "email": ["email", "correo", "e-mail"],
    "web": ["website", "web", "url"],
}


def slug(txt: str) -> str:
    s = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "sin-ciudad"


def norm_tel(t: str) -> str:
    dig = re.sub(r"\D", "", t)
    if not dig:
        return ""
    if dig.startswith("34") and len(dig) == 11:
        dig = dig[2:]
    if len(dig) == 9:
        return f"{dig[:3]} {dig[3:5]} {dig[5:7]} {dig[7:]}"
    return dig


def mapear_columnas(cabecera: list[str]) -> dict:
    bajas = [c.strip().lower() for c in cabecera]
    mapa = {}
    for campo, alias in COLUMNAS.items():
        for a in alias:
            if a in bajas:
                mapa[campo] = bajas.index(a)
                break
        else:
            mapa[campo] = None
    return mapa


def importar(csv_path: Path, salida: Path, dry_run: bool = False) -> dict:
    texto = csv_path.read_text(encoding="latin-1", errors="replace").lstrip("\ufeff")
    lineas = csv.reader(io.StringIO(texto), delimiter=";")
    filas = [f for f in lineas if any((c or "").strip() for c in f)]
    if len(filas) < 2:
        return {"ok": False, "errores": ["CSV vacío o sin filas de datos"]}
    mapa = mapear_columnas(filas[0])
    if mapa["nombre"] is None:
        return {"ok": False, "errores": [f"no encuentro la columna del nombre en {filas[0][:8]}"]}

    def col(f, campo):
        i = mapa[campo]
        return (f[i].strip() if i is not None and i < len(f) else "")

    vistos = set()
    por_ciudad: dict[str, list[dict]] = {}
    descartadas = columnas_cortas = 0
    for f in filas[1:]:
        nombre = col(f, "nombre")
        if not nombre:
            columnas_cortas += 1
            continue
        tel = norm_tel(col(f, "telefono"))
        clave = (nombre.lower(), re.sub(r"\D", "", tel))
        if clave in vistos:
            descartadas += 1
            continue
        vistos.add(clave)
        ciudad = col(f, "ciudad").title() if col(f, "ciudad") else "Sin ciudad"
        fila = {
            "id": None,  # se asigna tras ordenar
            "nombre": nombre,
            "direccion": col(f, "direccion"),
            "cp": col(f, "cp"),
            "ciudad": ciudad,
            "telefono": tel,
            "email": col(f, "email").lower(),
            "web": re.sub(r"^https?://(www\.)?", "", col(f, "web"), flags=re.I).strip("/"),
        }
        por_ciudad.setdefault(ciudad, []).append(fila)

    # agrupar ciudades pequeñas y asignar ids/orden alfabético
    archivos: dict[str, list[dict]] = {}
    ciudades_index = []
    for ciudad, lista in sorted(por_ciudad.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        dest = slug(ciudad) if len(lista) >= UMBRAL_ARCHIVO else "__otras__"
        base = archivos.setdefault(dest, [])
        if dest == "__otras__" and len(lista) < UMBRAL_ARCHIVO:
            base.extend(lista)
            continue
        base.extend(lista)
        ciudades_index.append((ciudad, len(lista), f"ciudad_{dest}.json"))

    total = 0
    for arch, lista in archivos.items():
        lista.sort(key=lambda r: (r["nombre"].lower()))
        for i, fila in enumerate(lista, 1):
            fila["id"] = f"prs-{arch.replace('__', '').replace('_', '-')}-{i:05d}"
        total += len(lista)

    # índice real tras agrupación
    indice = {
        "v": 1,
        "total": total,
        "deduplicadas": descartadas,
        "columnas_mapeadas": {k: v for k, v in mapa.items()},
        "ciudades": [],
    }
    for arch, lista in sorted(archivos.items(), key=lambda kv: -len(kv[1])):
        nombres = "otras ciudades" if arch == "__otras__" else lista[0]["ciudad"]
        indice["ciudades"].append({"ciudad": nombres, "n": len(lista), "archivo": f"ciudad_{arch}.json"})

    informe = {
        "origen": str(csv_path.name),
        "total_filas": len(filas) - 1,
        "importados": total,
        "descartadas_duplicadas": descartadas,
        "sin_nombre": columnas_cortas,
        "archivos": len(archivos),
        "huella_csv": hashlib.sha256(csv_path.read_bytes()).hexdigest()[:16],
    }
    if not dry_run:
        salida.mkdir(parents=True, exist_ok=True)
        for arch, lista in archivos.items():
            (salida / f"ciudad_{arch}.json").write_text(
                json.dumps({"ciudad": lista[0]["ciudad"] if arch != "__otras__" else "otras", "prospectos": lista},
                           ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        (salida / "index.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"ok": True, "informe": informe}


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True)
    ap.add_argument("--salida", type=Path, default=SALIDA_DEF)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--informe", type=Path, default=None)
    a = ap.parse_args(argv)
    p = Path(a.csv)
    if not p.exists():
        print(f"✗ no existe {p}", file=sys.stderr)
        return 2
    r = importar(p, a.salida, a.dry_run)
    out = json.dumps(r.get("informe") or r, ensure_ascii=False, indent=2)
    print(out)
    if a.informe:
        a.informe.write_text(out + "\n", encoding="utf-8")
    return 0 if r.get("ok") else 2


if __name__ == "__main__":
    raise SystemExit(main())
