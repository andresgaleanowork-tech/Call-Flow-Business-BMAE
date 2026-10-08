# -*- coding: utf-8 -*-
"""Tests de cola_ingest.py (canal GitHub-total §4). Sin red y sin GitHub:
guardián anti-PII, idempotencia por huella, formato de líneas."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "integracion" / "scripts" / "cola_ingest.py"


def _ejecutar(tmp: Path, lineas: list[str], indice_previo: object = None) -> tuple[dict, dict, Path]:
    com = tmp / "comentario.txt"
    com.write_text("\n".join(lineas), encoding="utf-8")
    ind = tmp / "indice.json"
    if indice_previo is not None:
        ind.write_text(json.dumps(indice_previo), encoding="utf-8")
    rep = tmp / "r.json"
    p = subprocess.run(
        [sys.executable, str(SCRIPT), "--comentario", str(com), "--indice", str(ind),
         "--autor", "comercial", "--reporte", str(rep)],
        capture_output=True, text=True)
    assert p.returncode == 0, p.stderr
    return json.loads(rep.read_text()), json.loads(ind.read_text()), ind


def _l(g: dict) -> str:
    return json.dumps({"v": 1, "canal": "callflow", **g}, ensure_ascii=False)


def test_gestiones_limpias_entran_y_el_indice_las_guarda(tmp_path):
    rep, ind, _ = _ejecutar(tmp_path, [
        _l({"segmento": "pymes", "resultado": "Interesado/a", "nota": "foto factura",
            "ts": "2026-10-07T10:00:00Z", "huella": "abc123", "pos": 0}),
        _l({"segmento": "residencial", "resultado": "Permanencia", "nota": "",
            "ts": "2026-10-07T10:05:00Z", "huella": "def456", "pos": 1}),
    ])
    assert len(rep["aceptadas"]) == 2
    assert rep["duplicadas"] == [] and rep["rechazadas"] == []
    assert set(ind["huellas"]) == {"abc123", "def456"}
    assert rep["aceptadas"][0]["segmento"] == "pymes"


def test_guardian_rechaza_telefono_email_y_documento(tmp_path):
    rep, _ind, _ = _ejecutar(tmp_path, [
        _l({"resultado": "x", "nota": "su móvil 612 345 678", "huella": "t1", "ts": "2026-10-07T10:01:00Z"}),
        _l({"resultado": "x", "nota": "escríbele a pepe@correo.es", "huella": "t2", "ts": "2026-10-07T10:02:00Z"}),
        _l({"resultado": "x", "nota": "dni 12345678Z", "huella": "t3", "ts": "2026-10-07T10:03:00Z"}),
        _l({"resultado": "x", "nota": "prefiere valle", "huella": "t4", "ts": "2026-10-07T10:04:00Z"}),
    ])
    assert len(rep["rechazadas"]) == 3
    assert [r["razon"] for r in rep["rechazadas"]] == [
        "PII: contiene teléfono", "PII: contiene email", "PII: contiene documento de identidad"]
    assert len(rep["aceptadas"]) == 1 and rep["aceptadas"][0]["nota"] == "prefiere valle"


def test_huella_duplicada_no_genera_issue_dos_veces(tmp_path):
    prev = {"v": 1, "upd": "2026-10-07", "huellas": ["vieja1"]}
    rep, ind, _ = _ejecutar(tmp_path, [
        _l({"resultado": "x", "nota": "", "huella": "vieja1", "ts": "2026-10-07T10:00:00Z"}),
        _l({"resultado": "x", "nota": "", "huella": "nueva9", "ts": "2026-10-07T10:01:00Z"}),
    ], indice_previo=prev)
    assert rep["duplicadas"] == ["vieja1"]
    assert [g["huella"] for g in rep["aceptadas"]] == ["nueva9"]
    assert set(ind["huellas"]) == {"vieja1", "nueva9"}


def test_lineas_robas_no_tumban_la_ingesta(tmp_path):
    rep, _ind, _ = _ejecutar(tmp_path, [
        "esto no es json",
        "{roto",
        _l({"resultado": "ok", "nota": "", "huella": "buena", "ts": "2026-10-07T10:00:00Z"}),
        json.dumps({"v": 1, "canal": "otro", "resultado": "x", "huella": "extra"}),
        _l({"resultado": "", "nota": "", "huella": "sin_res", "ts": "2026-10-07T10:01:00Z"}),
    ])
    assert [g["huella"] for g in rep["aceptadas"]] == ["buena"]
    assert len(rep["rechazadas"]) == 3  # json roto + canal ajeno + sin resultado
