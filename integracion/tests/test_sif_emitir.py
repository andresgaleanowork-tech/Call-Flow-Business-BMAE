# -*- coding: utf-8 -*-
"""Tests del SIF GitHub-total (sif_emitir.py). Sin red: solo dry-run, cadena
e idempotencia. El envío real es responsabilidad del workflow (curl + AEAT)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "verifactu"))
from bmae_verifactu.hash_chain import nueva_huella  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "integracion" / "scripts" / "sif_emitir.py"

FACTURA = {
    "numero_serie": "BMAE-2026-0001",
    "fecha_expedicion": "07-10-2026",
    "tipo_factura": "F1",
    "descripcion": "Suministro eléctrico octubre <prueba & escenarios>",
    "cuota_total": "21.00",
    "importe_total": "121.00",
    "fecha_hora_huso": "2026-10-07T10:30:00+02:00",
}


def _cadena(tmp: Path) -> Path:
    c = tmp / "cadena.json"
    c.write_text(json.dumps({
        "v": 1, "upd": "2026-10-07",
        "emisor": {"nombre_razon": "BMAE Energía & Pruebas SL", "nif": "B87654321"},
        "ultimo": None, "historial": [],
    }), encoding="utf-8")
    return c


def _run(cadena: Path, factura_json: dict, tmp: Path) -> tuple:
    fj = tmp / "factura.json"
    fj.write_text(json.dumps(factura_json), encoding="utf-8")
    xml = tmp / "registro.xml"
    informe = tmp / "informe.json"
    for p in (xml, informe):
        if p.exists():
            p.unlink()
    p = subprocess.run(
        [sys.executable, str(SCRIPT), "--factura", str(fj), "--cadena", str(cadena),
         "--solo-xml", str(xml), "--informe", str(informe)],
        capture_output=True, text=True,
    )
    return p.returncode, xml, (json.loads(informe.read_text()) if informe.exists() else {}), p


def test_dry_run_genera_sobre_soap_y_no_toca_cadena(tmp_path):
    cadena = _cadena(tmp_path)
    rc, xml, inf, _p = _run(cadena, FACTURA, tmp_path)
    assert rc == 0
    assert xml.exists()
    texto = xml.read_text(encoding="utf-8")
    assert '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">' in texto
    assert "<soapenv:Header/>" in texto
    assert "<PrimerRegistro>S</PrimerRegistro>" in texto
    # Huella via SDK sellado A4 (determinista); el script no inventa otra.
    # NB: el instante forma parte de la huella — usar EXACTAMENTE el de la factura.
    from datetime import datetime, timedelta, timezone
    inst = datetime(2026, 10, 7, 10, 30, tzinfo=timezone(timedelta(hours=2)))
    h_ref = nueva_huella("B87654321", "BMAE-2026-0001", "07-10-2026", "F1",
                         "21.00", "121.00", "", instante=inst)
    assert inf["entrada"]["huella_anterior"] == ""
    assert len(inf["entrada"]["huella"]) == 64  # SHA-256 hex
    assert inf["entrada"]["huella"] == h_ref
    # escapes XML del SIF
    assert "&lt;" in texto and "&amp;" in texto
    assert "prewww2.aeat.es" in inf["entrada"]["qr"]  # QR de cotejo preproducción
    # dry-run no muta la cadena
    assert json.loads(cadena.read_text())["ultimo"] is None
    assert json.loads(cadena.read_text())["historial"] == []


def test_campos_obligatorios_son_requeridos(tmp_path):
    cadena = _cadena(tmp_path)
    mala = dict(FACTURA)
    del mala["cuota_total"]
    fj = tmp_path / "f.json"
    fj.write_text(json.dumps(mala))
    p = subprocess.run([sys.executable, str(SCRIPT), "--factura", str(fj), "--cadena", str(cadena)],
                       capture_output=True, text=True)
    assert p.returncode == 2
    assert "cuota_total" in p.stderr


def test_encadenamiento_a_partir_de_estado_persistido(tmp_path):
    """Tras una emisión persistida (workflow tras OK AEAT), la siguiente debe
    encadenar con su huella y no persistir todavía en dry-run."""
    cadena = _cadena(tmp_path)
    estado = json.loads(cadena.read_text())
    h1 = nueva_huella("B87654321", "BMAE-2026-0001", "07-10-2026", "F1", "21.00", "121.00", "")
    estado["ultimo"] = {"numero_serie": "BMAE-2026-0001", "huella": h1,
                        "fecha_hora_huso": "2026-10-07T10:30:00+02:00"}
    estado["historial"].append({"numero_serie": "BMAE-2026-0001", "huella": h1})
    cadena.write_text(json.dumps(estado))

    segunda = dict(FACTURA, numero_serie="BMAE-2026-0002", fecha_expedicion="08-10-2026",
                   descripcion="segunda", cuota_total="10.00", importe_total="60.00",
                   fecha_hora_huso="2026-10-08T09:00:00+02:00")
    rc, xml, inf, _p = _run(cadena, segunda, tmp_path)
    assert rc == 0
    texto = xml.read_text(encoding="utf-8")
    assert inf["entrada"]["huella_anterior"] == h1
    assert f"<Huella>{h1}</Huella>" in texto
    assert "<RegistroAnterior>" in texto and "PrimerRegistro" not in texto
    # dry-run nunca avanza la cadena
    assert json.loads(cadena.read_text())["ultimo"]["numero_serie"] == "BMAE-2026-0001"


def test_idempotencia_misma_numserie_no_reencadena(tmp_path):
    cadena = _cadena(tmp_path)
    estado = json.loads(cadena.read_text())
    h = nueva_huella("B87654321", "BMAE-2026-0001", "07-10-2026", "F1", "21.00", "121.00", "")
    estado["ultimo"] = {"numero_serie": "BMAE-2026-0001", "huella": h,
                        "fecha_hora_huso": "2026-10-07T10:30:00+02:00"}
    estado["historial"].append({"numero_serie": "BMAE-2026-0001", "huella": h})
    cadena.write_text(json.dumps(estado))

    fj = tmp_path / "factura.json"
    fj.write_text(json.dumps(FACTURA))
    informe = tmp_path / "informe.json"
    p = subprocess.run([sys.executable, str(SCRIPT), "--factura", str(fj),
                        "--cadena", str(cadena), "--informe", str(informe)],
                       capture_output=True, text=True)
    assert p.returncode == 0
    assert "no se reencadena" in p.stdout
    assert json.loads(informe.read_text())["idiempotente"] is True
    assert len(json.loads(cadena.read_text())["historial"]) == 1
