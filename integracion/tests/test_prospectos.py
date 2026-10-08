# -*- coding: utf-8 -*-
"""Tests A1 — prospectos_importar: normalización, dedupe, split por ciudad,
índice, ids estables, dry-run. Fixtures 100% sintéticos (sin PII)."""

import csv
import json
import subprocess
import sys
from pathlib import Path

INTEG = Path(__file__).parent.parent
sys.path.insert(0, str(INTEG / "scripts"))
import prospectos_importar as pi  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]

CAB = ["Company Name", "Address", "Postal Code", "City", "State", "Phone", "Email", "Website"]
FILAS = [
    ["PANADERIA LA DEMO SL", "Calle Mayor 1", "46001", "Valencia", "Valencia", "966555111", "HOLA@DEMO.TEST", "http://www.demo.test/"],
    ["Talleres Mecanicos Fuji", "Avd. Cortes 3", "46980", "Paterna", "Valencia", "96 955 51 12", "fuji@demo.test", "https://fuji.test"],
    ["Talleres Mecanicos Fuji", "Avd. Cortes 3", "46980", "Paterna", "Valencia", "969555112", "fuji@demo.test", "fuji.test"],
    ["Ferreteria La Demo", "Calle 8", "46940", "Manises", "Valencia", "", "ferri@demo.test", ""],
    ["Autonomo Demo Individual", "Calle1", "46100", "Burjassot", "Valencia", "640 20 30 40", "auto@demo.test", "auto.test/"],
    ["", "sin nombre, se descarta", "46001", "Valencia", "Valencia", "966", "x@x", ""],
]


def csv_fixture(tmp_path):
    p = tmp_path / "demo.csv"
    with open(p, "w", encoding="latin-1", newline="") as fh:
        w = csv.writer(fh, delimiter=";")
        w.writerow(CAB)
        w.writerows(FILAS)
    return p


def test_norm_tel_y_dedupe(tmp_path):
    r = pi.importar(csv_fixture(tmp_path), tmp_path / "out", dry_run=True)
    inf = r["informe"]
    assert inf["importados"] == 4            # descarta duplicada y la sin-nombre
    assert inf["descartadas_duplicadas"] == 1
    assert inf["sin_nombre"] == 1


def test_normalizacion_contenido(tmp_path):
    out = tmp_path / "out"
    pi.importar(csv_fixture(tmp_path), out)
    pat = json.loads((out / "ciudad___otras__.json").read_text())  # <25 → agrupadas
    f = [p for p in pat["prospectos"] if p["email"] == "fuji@demo.test"][0]
    assert f["nombre"] == "Talleres Mecanicos Fuji"
    assert f["telefono"] == "969 55 51 12"
    assert f["web"] == "fuji.test"           # protocolo y slash final fuera
    assert f["id"].startswith("prs-otras-")
    val = [p for p in pat["prospectos"] if p["cp"] == "46001"][0]
    assert val["telefono"] == "966 55 51 11"


def test_ciudades_pequenas_agrupadas(tmp_path):
    out = tmp_path / "out"
    pi.importar(csv_fixture(tmp_path), out)
    idx = json.loads((out / "index.json").read_text())
    # fixture diminuto: todas < umbral → un único archivo __otras__
    otras = json.loads((out / "ciudad___otras__.json").read_text())["prospectos"]
    assert {o["ciudad"] for o in otras} == {"Paterna", "Manises", "Burjassot", "Valencia"}
    assert len(idx["ciudades"]) == 1 and idx["ciudades"][0]["n"] == 4
    # ciudad grande sí va a archivo propio: comprobado en el test de repo real


def test_ids_estables_e_idempotente(tmp_path):
    a, b = tmp_path / "a", tmp_path / "b"
    pi.importar(csv_fixture(tmp_path), a)
    pi.importar(csv_fixture(tmp_path), b)
    assert (a / "ciudad___otras__.json").read_text() == (b / "ciudad___otras__.json").read_text()


def test_cli_dry_run_no_escribe_y_huella(tmp_path):
    out = tmp_path / "nada"
    res = subprocess.run(
        [sys.executable, str(INTEG / "scripts" / "prospectos_importar.py"),
         "--csv", str(csv_fixture(tmp_path)), "--salida", str(out), "--dry-run"],
        capture_output=True, text=True)
    assert res.returncode == 0
    assert "huella_csv" in res.stdout
    assert not out.exists()


def test_repo_real_importado_index_minimo():
    idx = json.loads((RAIZ / "datos" / "prospectos" / "index.json").read_text(encoding="utf-8"))
    assert idx["total"] > 30000            # la entrega real 08-oct
    assert idx["deduplicadas"] > 0
    val = next(c for c in idx["ciudades"] if c["ciudad"].startswith("Valencia"))
    assert val["n"] > 5000
