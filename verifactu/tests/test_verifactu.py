# -*- coding: utf-8 -*-
"""A4 · tests VeriFactu: huella encadenada, XML RegistroFacturacionAlta y QR."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone, timedelta
from decimal import Decimal

from bmae_verifactu import (
    Emisor,
    Factura,
    RegistroHuella,
    nueva_huella,
    registro_alta_xml,
    url_cotejo,
)

INSTANTE = datetime(2026, 10, 7, 13, 45, 0,
                    tzinfo=timezone(timedelta(hours=2)))  # CEST Madrid oct.


def test_huella_es_sha256_hex_mayuscula_y_determinista():
    h1 = nueva_huella("B87654321", "2026/0001", "07-10-2026", "F1",
                      "210.00", "1210.00", "", INSTANTE)
    h2 = nueva_huella("B87654321", "2026/0001", "07-10-2026", "F1",
                      "210.00", "1210.00", "", INSTANTE)
    assert h1 == h2
    assert len(h1) == 64 and h1.upper() == h1
    int(h1, 16)  # parseable como hex


def test_huella_reproduce_la_formula_literal():
    reg = RegistroHuella(
        nif="B87654321", numero_serie="2026/0002", fecha_expedicion="08-10-2026",
        tipo_factura="F1", cuota_total="21.00", importe_total="121.00",
        huella_anterior="AA" * 32, fecha_hora_huso=INSTANTE.isoformat(timespec="seconds"),
    )
    base = reg.texto_base()
    esperado = (
        "NIF=B87654321&NumSerieFactura=2026/0002&FechaExpedicionFactura=08-10-2026"
        f"&TipoFactura=F1&CuotaTotal=21.00&ImporteTotal=121.00"
        f"&Huella={'AA' * 32}&FechaHoraHusoGenRegistro={INSTANTE.isoformat(timespec='seconds')}"
    )
    assert base == esperado
    assert reg.huella() == hashlib.sha256(esperado.encode()).hexdigest().upper()


def test_encadenamiento_rompe_si_se_reescribe():
    h1 = nueva_huella("B87654321", "2026/0001", "07-10-2026", "F1", 10, 110, "", INSTANTE)
    h2 = nueva_huella("B87654321", "2026/0002", "08-10-2026", "F1", 10, 110, h1, INSTANTE)
    h2_reescrita = nueva_huella("B87654321", "2026/0002", "08-10-2026", "F1", 20, 120, h1, INSTANTE)
    # reeditar la factura 2 cambia su huella: cadena inviolable hacia delante
    assert h2 != h2_reescrita
    h1_otro = nueva_huella("B87654321", "2026/0001", "07-10-2026", "F1", 11, 111, "", INSTANTE)
    assert h1 != h1_otro


def test_primer_registro_con_huella_vacia():
    reg = RegistroHuella("B87654321", "2026/0000", "01-01-2026", "F1",
                         "0.00", "0.00", "", INSTANTE.isoformat(timespec="seconds"))
    assert "&Huella=&" in reg.texto_base()


def test_xml_registro_alta_estructura_y_escapes():
    em = Emisor(nombre_razon="BMAE Ingeniería & Energía SL", nif="B87654321")
    h = nueva_huella("B87654321", "2026/0001", "07-10-2026", "F1", 21, 121, "", INSTANTE)
    fc = Factura(numero_serie="2026/0001", fecha_expedicion="07-10-2026",
                 tipo_factura="F1", descripcion="Suministro eléctrico <periodo> octubre",
                 cuota_total=Decimal("21.00"), importe_total=Decimal("121.00"),
                 huella_anterior="", huella=h,
                 fecha_hora_huso=INSTANTE.isoformat(timespec="seconds"))
    xml = registro_alta_xml(em, fc)
    assert "<NumSerieFactura>2026/0001</NumSerieFactura>" in xml
    assert "<CuotaTotal>21.00</CuotaTotal>" in xml
    assert "<ImporteTotal>121.00</ImporteTotal>" in xml
    assert "<PrimerRegistro>S</PrimerRegistro>" in xml
    assert f"<Huella>{h}</Huella>" in xml
    assert "<TipoHuella>01</TipoHuella>" in xml
    assert "&lt;periodo&gt;" in xml and "<periodo>" not in xml.replace("&lt;", "§").replace("§", "<periodo>", 0)
    assert "&amp;" in xml  # «&» del nombre escapada


def test_xml_con_registro_anterior():
    em = Emisor("BMAE", "B87654321")
    h_ant = "BB" * 32
    h = nueva_huella("B87654321", "2026/0003", "09-10-2026", "F1", 5, 55, h_ant, INSTANTE)
    fc = Factura("2026/0003", "09-10-2026", "F1", "x", Decimal(5), Decimal(55),
                 h_ant, h, INSTANTE.isoformat(timespec="seconds"))
    xml = registro_alta_xml(em, fc)
    assert "<RegistroAnterior>" in xml and f"<Huella>{h_ant}</Huella>" in xml
    assert "PrimerRegistro" not in xml


def test_qr_cotejo_entornos():
    u = url_cotejo("B87654321", "2026/0001", "07-10-2026", "121.00", "preproduccion")
    assert u.startswith("https://prewww2.aeat.es/")
    assert "nif=B87654321" in u and "importe=121.00" in u
    up = url_cotejo("B87654321", "2026/0001", "07-10-2026", "121.00", "produccion")
    assert up.startswith("https://www2.agenciatributaria.gob.es/")
    try:
        url_cotejo("B", "x", "01-01-2026", 1, "otro")
        assert False, "entorno desconocido debería fallar"
    except ValueError:
        pass
