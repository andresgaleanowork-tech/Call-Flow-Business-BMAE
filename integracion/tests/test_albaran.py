# -*- coding: utf-8 -*-
"""Tests del generador de albaranes (modo no-fiscal temporal, sin cert AEAT).
Sin red: validación, numeración serial, totales con Decimal, PDF honesto."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "integracion" / "scripts" / "albaran_crear.py"

ENTRADA = {
    "cliente_ref": "ref. captación #87",
    "fecha": "2026-10-08",
    "lineas": [
        {"descripcion": "Auditoría integral de suministro", "cantidad": 1, "precio": 240.00},
        {"descripcion": "Gestión de cambio de potencia", "cantidad": 2, "precio": 60.50},
    ],
}


def _ejecutar(tmp: Path, entrada: dict, libro_previo: dict | None = None, dry: bool = False) -> tuple:
    fj = tmp / "alb.json"
    fj.write_text(json.dumps(entrada), encoding="utf-8")
    libro = tmp / "libro.json"
    if libro_previo is not None:
        libro.write_text(json.dumps(libro_previo), encoding="utf-8")
    elif not libro.exists():
        libro.write_text(json.dumps({
            "v": 1, "upd": "2026-10-08",
            "emisor": {"nombre_razon": "BMAE Energía", "nif": "PENDIENTE"},
            "ultimo": None, "historial": [],
        }), encoding="utf-8")
    pdf_dir = tmp / "pdf"
    informe = tmp / "informe.json"
    p = subprocess.run(
        [sys.executable, str(SCRIPT), "--entrada", str(fj), "--libro", str(libro),
         "--pdf-dir", str(pdf_dir), "--logo", str(RAIZ / "diseno/marca/logo-bm.png"),
         "--informe", str(informe)] + (["--dry-run"] if dry else []),
        capture_output=True, text=True)
    return p, libro, pdf_dir, informe


def test_albaran_ok_totales_exactos_y_documento_pdf(tmp_path):
    p, libro, pdf_dir, _inf = _ejecutar(tmp_path, ENTRADA)
    assert p.returncode == 0, p.stderr
    estado = json.loads(libro.read_text())
    reg = estado["historial"][0]
    assert reg["numero_serie"].startswith("ALB-2026-")
    assert reg["total"] == "361,00"  # 240 + 2×60,50 — Decimal, no floats
    assert len(reg["huella_integridad"]) == 64
    assert "no fiscal" in reg["aviso"].lower()
    pdf = pdf_dir / f"{reg['numero_serie']}.pdf"
    assert pdf.exists() and pdf.read_bytes()[:5] == b"%PDF-"
    assert estado["ultimo"]["numero_serie"] == reg["numero_serie"]
    # NIF pendiente → aviso honesto al propio PDF (persiste en libro)
    assert reg.get("aviso_nif", "").startswith("Emisor sin NIF")


def test_numeracion_serial_no_devuelve_duplicados(tmp_path):
    prev = {"v": 1, "upd": "2026-10-08", "emisor": {"nombre_razon": "BMAE", "nif": "PENDIENTE"},
            "ultimo": {"numero_serie": "ALB-2026-0001", "fecha": "2026-10-08", "total": "10,00", "huella_integridad": "x"},
            "historial": [{"numero_serie": "ALB-2026-0001", "fecha": "2026-10-08",
                           "cliente_ref": "a", "lineas": [], "total": "10,00", "huella_integridad": "x", "pdf": ""}]}
    p, libro, _pdir, _inf = _ejecutar(tmp_path, ENTRADA, libro_previo=prev)
    assert p.returncode == 0
    regs = [h["numero_serie"] for h in json.loads(libro.read_text())["historial"]]
    assert regs == ["ALB-2026-0001", "ALB-2026-0002"]


def test_antipii_bloquea_telefono_como_cliente_ref(tmp_path):
    mala = dict(ENTRADA, cliente_ref="Juan Pérez 612 345 678")
    p, _l, _pd, inf = _ejecutar(tmp_path, mala)
    assert p.returncode == 2
    errores = json.loads(inf.read_text())["errores"]
    assert any("exceso de dígitos" in e for e in errores)
    assert not (tmp_path / "pdf").exists()  # nada se escribe


def test_sin_lineas_no_genera_nada(tmp_path):
    p, libro, _pd, inf = _ejecutar(tmp_path, dict(ENTRADA, lineas=[]))
    assert p.returncode == 2
    assert any("lineas obligatorio" in e for e in json.loads(inf.read_text())["errores"])
    assert json.loads(libro.read_text())["historial"] == []


def test_dry_run_no_toca_libro_ni_pdf(tmp_path):
    p, libro, pdf_dir, _inf = _ejecutar(tmp_path, ENTRADA, dry=True)
    assert p.returncode == 0
    salida = json.loads(p.stdout)
    assert salida["dry_run"] is True
    assert json.loads(libro.read_text())["historial"] == []
    assert not pdf_dir.exists()
