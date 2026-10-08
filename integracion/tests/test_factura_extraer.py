# -*- coding: utf-8 -*-
"""Tests del extractor A2: formato sintético Iberdrola/Endesa (pegado), guess
de comercializadora, confianza baja con camino manual. Sin red, sin PDF real
(hasta que lleguen las muestras del gestor)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPT = RAIZ / "integracion" / "scripts" / "factura_extraer.py"

TEXTO_IBERDROLA = """Factura de electricidad
IBERDROLA CLIENTES, S.A.U. — comercializadora
Nº factura: 2026-12345 · factura emitida
Identificación punto de suministro (CUPS): ES 0021 0000 1234 5678 AB
Periodo de facturación: del 01/09/2026 al 30/09/2026 (30 días)
Potencia punta: 5,75 kW
Consumo facturado: Energía consumida 1.215 kWh
Termino energía (punta/valle): subtotal 178,20 €
Impuesto eléctrico (5,11 %): 9,11 €
IVA (21 %): 39,30 €
IMPORTE TOTAL 226,61 €
Forma de pago: domiciliación
"""

TEXTO_ENDESA = """FACTURA ELECTRICIDAD — ENDESA ENERGÍA S.A.U.
Cliente (sin NIF real en fixture)
CUPS ES0021000009988776CD01
Facturación periodo del 15/08/2026 al 15/09/2026
Potencia contratada punta/valle 4,60 kW
Consumo total periodo: 960 kWh
Total factura 189,75 €
"""

TEXTO_VACIO = """Recibo de panadería artesana · 2 barras 1,30 €
Nada de CUPS ni kWh aquí.
"""

TEXTO_APOLO = """Factura pyme — Apolo Business S.L. (fixture sintético, sin datos reales)
CUPS: ES0021000001234000AD
Periodo de Facturación 01/05/2026 al 31/05/2026
Consumo Acumulado 9.799,11 kWh
Consumo Firmado 35.530 kWh/Año
Pot. P1 (kW) 17,00
Pot. P2 (kW) 19,80
Pot. P3 (kW) 19,80
Pot. P4 (kW) 19,80
Pot. P5 (kW) 19,80
Pot. P6 (kW) 19,80
Término Energía P4 805,00 kWh x 13,4705 c€/kWh 108,44 €
Base imponible 445,33 € · IVA 21 % 93,51 €
Total Importe Factura 539,84 €
"""

TEXTO_ELCMULTI = """Factura 6.1TD (fixture sintético, sin datos reales)
ENERGÍA LIBRE COMERCIALIZADORA, SLU.
Contrato: 0000001 CUPS: ES0031100000000001AA0F
Periodo Facturación: del 17/10/2025 al 30/04/2026
Potencia contratada (kW): P1:10,000   P2:19,800  P3:19,800
17,70 €P4 125 kWh x 0,141607 €/kWh
12,73 €P5 90 kWh x 0,141415 €/kWh
17,52 €P6 124 kWh x 0,141262 €/kWh
3,56 €P4 125 kWh x 0,028473 €/kWh
2,63 €P5 90 kWh x 0,029225 €/kWh
3,36 €P6 124 kWh x 0,027104 €/kWh
IMPORTE FACTURA:
VALOR línea textual cualquiera 197,35 €
Base Imponible 163,10 €
"""


def _run(tmp: Path, texto: str) -> tuple:
    fj = tmp / "pegado.txt"
    fj.write_text(texto, encoding="utf-8")
    inf = tmp / "inf.json"
    p = subprocess.run(
        [sys.executable, str(SCRIPT), "--texto", str(fj), "--informe", str(inf)],
        capture_output=True, text=True)
    return p, (json.loads(inf.read_text()) if inf.exists() else {})


def test_iberdrola_extrae_campos_clave(tmp_path):
    p, inf = _run(tmp_path, TEXTO_IBERDROLA)
    assert p.returncode == 0, p.stderr
    c = inf["campos"]
    assert c["comercializadora"] == "Iberdrola"
    assert c["cups"] == "ES0021000012345678AB"  # normalizado sin espacios
    assert c["consumo_kwh_total"] == 1215.0
    assert c["potencia_kw"] == 5.75
    assert c["fecha_desde"] == "01/09/2026"
    assert c["fecha_hasta"] == "30/09/2026"
    assert c["importe_total"] == 226.61
    assert inf["confianza"] == "alta"
    assert not inf["camino_manual_recomendado"]


def test_endesa_extrae_tambien_aux_formato_distinto(tmp_path):
    p, inf = _run(tmp_path, TEXTO_ENDESA)
    assert p.returncode == 0, p.stderr
    c = inf["campos"]
    assert c["comercializadora"] == "Endesa"
    assert c["cups"] == "ES0021000009988776CD01"
    assert c["consumo_kwh_total"] == 960.0
    assert c["potencia_kw"] == 4.60
    assert c["importe_total"] == 189.75


def test_sin_campos_confianza_baja_y_camino_manual(tmp_path):
    p, inf = _run(tmp_path, TEXTO_VACIO)
    assert p.returncode == 3
    assert inf["confianza"] == "baja"
    assert inf["camino_manual_recomendado"] is True
    assert inf["campos"]["cups"] is None
    assert "camino manual" in p.stderr.lower()


def test_pdf_sin_pypdf_error_honesto(tmp_path):
    fj = tmp_path / "fake.pdf"
    fj.write_bytes(b"%PDF-1.3 fixture")
    p = subprocess.run(
        [sys.executable, str(SCRIPT), "--pdf", str(fj)],
        capture_output=True, text=True)
    # sin pypdf instalado: ni XML invented = error honesto + rc≠0
    if "pypdf no está instalado" in p.stderr:
        assert p.returncode != 0
        assert "--texto" in p.stderr  # ofrece el camino manual
    else:
        # pypdf presente: fixture rompe la lectura, pero con error humano (no inventa)
        assert p.returncode != 0


def test_importar_no_persiste_nada(tmp_path):
    fj = tmp_path / "pegado.txt"
    fj.write_text(TEXTO_ENDESA, encoding="utf-8")
    antes = fj.read_text()
    subprocess.run([sys.executable, str(SCRIPT), "--texto", str(fj), "--informe", str(tmp_path / "x.json")],
                   capture_output=True)
    assert fj.read_text() == antes  # nunca modifica el original
    copia_json = json.loads((tmp_path / "x.json").read_text())
    assert copia_json["origen"] == "texto:pegado.txt"


def test_apolo_anual_y_potencia_max_p(tmp_path):
    p, inf = _run(tmp_path, TEXTO_APOLO)
    assert p.returncode == 0, p.stderr
    c = inf["campos"]
    assert c["comercializadora"] == "Apolo Energies"
    assert c["consumo_kwh_total"] == 9799.11
    assert c["consumo_anual_kwh"] == 35530.0
    assert c["potencia_kw"] == 19.8          # máximo de P1..P6
    assert c["importe_total"] == 539.84


def test_elc_multiperiodo_suma_unicos(tmp_path):
    p, inf = _run(tmp_path, TEXTO_ELCMULTI)
    assert p.returncode == 0, p.stderr
    c = inf["campos"]
    assert c["comercializadora"] == "Energia Libre Comercializadora"
    assert c["consumo_kwh_total"] == 339.0   # 125 + 90 + 124 (únicos, sin duplicar)
    assert c["potencia_kw"] == 19.80
    assert c["importe_total"] == 197.35
    assert c["cups"] == "ES0031100000000001AA0F"


def test_escaneado_declarado_no_legible(tmp_path):
    vacio = tmp_path / "casivacio.txt"
    vacio.write_text("\n \n", encoding="utf-8")
    p = subprocess.run([sys.executable, str(SCRIPT), "--texto", str(vacio),
                        "--informe", str(tmp_path / "inf.json")], capture_output=True, text=True)
    assert p.returncode == 3
    inf = json.loads((tmp_path / "inf.json").read_text())
    assert inf["confianza"] == "baja" and inf["camino_manual_recomendado"] is True
    assert inf["campos"]["legible_por_maquina"] is False
    assert "escaneado" in inf["campos"]["motivo_no_legible"]
    # nunca inventa números:
    assert inf["campos"]["consumo_kwh_total"] is None
    assert inf["campos"]["importe_total"] is None


def test_glifos_declarados_no_legibles(tmp_path):
    g = tmp_path / "glifos.txt"
    g.write_text("\n".join(f"/{n} /{n+1} /{n+2} /{n+3} /{n+4} /{n+5}" for n in range(1, 300, 7)),
                 encoding="utf-8")
    p = subprocess.run([sys.executable, str(SCRIPT), "--texto", str(g),
                        "--informe", str(tmp_path / "inf.json")], capture_output=True, text=True)
    assert p.returncode == 3
    inf = json.loads((tmp_path / "inf.json").read_text())
    assert inf["campos"]["legible_por_maquina"] is False
    assert "glifos" in inf["campos"]["motivo_no_legible"]
