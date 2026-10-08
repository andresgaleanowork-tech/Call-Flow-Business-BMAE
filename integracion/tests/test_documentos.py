"""Tests B4 — documentos_plantilla: render honesto, nunca documento a medias,
libro con huella, dry-runs y el aviso de NIF pendiente en superficie seria."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

INTEG = Path(__file__).parent.parent
sys.path.insert(0, str(INTEG / "scripts"))
import documentos_plantilla as dp  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]

pytest.importorskip("reportlab", reason="reportlab opcional en sandbox; se reinstala")

PLANTILLAS = RAIZ / "datos" / "documentos" / "plantillas"

DATOS_OK = {
    "ref_cliente": "CLI-0042",
    "nombre_cliente": "Panadería La Estrella",
    "nif_cliente": "B12345678",
    "direccion_cliente": "Valencia",
    "descripcion_servicio": "Suministro eléctrico tarifa 3.0TD",
    "cups": "ES0031100000000001AA0F",
    "potencia_kw": "15",
    "consumo_kwh": "12000",
    "forma_pago": "transferencia mensual",
    "duracion_permanencia": "12 meses prorrogables",
    "fecha_firma": "2026-10-08",
}


def libro_vacio(tmp_path, pii=True):
    lib = {
        "emisor": {
            "nombre": "BMAE Energía S.L.", "nif": "ESB99999999" if pii else "PENDIENTE",
            "direccion": "Valencia", "email_privacidad": "privacidad@bmae.test",
        },
        "docs": [], "ultimo": None,
    }
    p = tmp_path / "documentos.json"
    p.write_text(json.dumps(lib), encoding="utf-8")
    return p


def test_campos_y_marca_sobre_plantillas_reales():
    texto = (PLANTILLAS / "contrato.txt").read_text(encoding="utf-8")
    assert "PLANTILLA BASE" in texto
    campos = dp.campos_plantilla(texto)
    assert {"ref_cliente", "nombre_cliente", "nif_cliente", "fecha_firma"} <= set(campos)


def test_render_no_deja_marcadores():
    texto = "Hola {{nombre_cliente}} en {{fecha_firma}}"
    out, faltantes = dp.renderizar(texto, DATOS_OK)
    assert "{{" not in out and faltantes == []
    out2, f2 = dp.renderizar(texto, {"nombre_cliente": "X"})
    assert f2 == ["fecha_firma"]


def test_contrato_completo_genera_pdf_y_registra_en_libro(tmp_path):
    lib_path = libro_vacio(tmp_path)
    r = dp.crear_documento("contrato", DATOS_OK, libro_path=lib_path,
                           pdf_dir=tmp_path, plantillas_dir=PLANTILLAS)
    assert r.ok and r.huella and len(r.huella) == 64
    pdf = RAIZ / r.pdf
    try:
        assert pdf.exists() and b"%PDF" in pdf.read_bytes()[:8]
    finally:
        pdf.unlink(missing_ok=True)
    libro = json.loads(lib_path.read_text(encoding="utf-8"))
    assert len(libro["docs"]) == 1
    assert libro["docs"][0]["huella"] == r.huella
    assert libro["ultimo"]["ref_cliente"] == "CLI-0042"


def test_campos_obligatorios_ausentes_nunca_escriben_nada(tmp_path):
    lib_path = libro_vacio(tmp_path)
    r = dp.crear_documento("contrato", {"nombre_cliente": "Solo nombre"}, libro_path=lib_path,
                           pdf_dir=tmp_path, plantillas_dir=PLANTILLAS)
    assert not r.ok
    assert any("ref_cliente" in e and "fecha_firma" in e for e in r.errores)
    # ni libro tocado ni PDF
    assert json.loads(lib_path.read_text(encoding="utf-8"))["docs"] == []
    assert not list(tmp_path.glob("*.pdf"))


def test_nif_emisor_pendiente_aparece_como_aviso_bloqueante_a_la_vista(tmp_path):
    lib_path = libro_vacio(tmp_path, pii=False)
    r = dp.crear_documento("anexo-rgpd", DATOS_OK, libro_path=lib_path,
                           pdf_dir=tmp_path, plantillas_dir=PLANTILLAS)
    assert r.ok and r.avisos and any("PENDIENTE" in a for a in r.avisos)
    pdf = RAIZ / r.pdf
    try:
        assert pdf.exists()
    finally:
        pdf.unlink(missing_ok=True)


def test_cli_dry_run_con_plantilla_real_no_toca_el_libro(tmp_path):
    (tmp_path / "cli.json").write_text(json.dumps(DATOS_OK), encoding="utf-8")
    lib_path = libro_vacio(tmp_path)
    res = subprocess.run(
        [sys.executable, str(INTEG / "scripts" / "documentos_plantilla.py"),
         "--tipo", "contrato", "--datos", str(tmp_path / "cli.json"),
         "--libro", str(lib_path), "--pdf-dir", str(tmp_path), "--dry-run"],
        capture_output=True, text=True, timeout=60,
    )
    assert res.returncode == 0, res.stderr + res.stdout
    assert "OK" in res.stdout
    assert json.loads(lib_path.read_text(encoding="utf-8"))["docs"] == []
