# -*- coding: utf-8 -*-
"""
A6 · test_reglas_regulatorias.py — reglas duras CNMC/AEAT e invariantes
del motor no medibles contra facturas (validador + políticas de redondeo).
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

from bmae_comparador import (
    ErrorValidacion,
    FacturaEntrada,
    FraccionHoraria,
    OfertaTarifa,
    PeriodoFactura,
    PreciosPorPeriodo,
    Peaje,
    Zona,
    simular,
    validar_factura,
)
from bmae_comparador.constantes import dias_de_ano, para_anio


CUPS = "ES0021000000000001AA"
SERIE = {"periodo": 1, "potencias": [Decimal("10")]}


def _p2(**kw):
    base = dict(periodo=1, energia_kwh=Decimal(100),
                potencia_contratada_kw=Decimal("4.6"),
                potencia_maxima_kw=Decimal("4.7"))
    base.update(kw)
    return PeriodoFactura(**base)


def _f20(oferta=None, **kw):
    base = dict(id_simulacion="t", cups=CUPS, peaje="2.0TD",
                fecha_inicio=date(2025, 6, 1), fecha_fin=date(2025, 6, 30),
                periodos=[_p2(), _p2(periodo=2)])
    base.update(kw)
    return validar_factura(FacturaEntrada(**base))


def _vec(v):
    return PreciosPorPeriodo(valores=[Decimal(str(x)) for x in v])


OF20 = OfertaTarifa(id_oferta="x", nombre="x", peaje="2.0TD", modalidad="fija",
                    precio_potencia=_vec([40, 40]), precio_energia=_vec(["0.15", "0.12"]))


def test_cnmc_monotonia_potencia_30td():
    ps = [
        PeriodoFactura(periodo=i, energia_kwh=Decimal(10),
                       potencia_contratada_kw=Decimal(v),
                       serie_cuartohoraria=FraccionHoraria(periodo=i, potencias=[Decimal("10")]))
        for i, v in enumerate(["15", "15", "15", "15", "15", "14"], start=1)
    ]
    f = FacturaEntrada(id_simulacion="x", cups="ES0031400000000002AB",
                       peaje="3.0TD", fecha_inicio=date(2025, 1, 1),
                       fecha_fin=date(2025, 1, 31), periodos=ps)
    with pytest.raises(ErrorValidacion, match="no decreciente"):
        validar_factura(f)


def test_bisiesto_366():
    assert dias_de_ano(2024) == 366
    assert dias_de_ano(2025) == 365
    assert dias_de_ano(2000) == 366
    assert dias_de_ano(1900) == 365


def test_anio_fuera_de_rango_usa_proximidad():
    assert para_anio(2023).anio == 2024
    assert para_anio(2031).anio == 2026


def test_redondeo_half_up_presentacion():
    # 100 kWh × 0.125 € = 12.5 € exactos; IVA lo lleva a la cifra de control
    res = simular(_f20(financia_bono_social=False), OF20)
    total = Decimal(res.totales["total_factura"])
    assert total == total.quantize(Decimal("0.01"))
    # desglose inmutable: suma de líneas de un término ≈ término (±0,01)
    comp = {c.termino: c for c in res.componentes}
    suma_te = sum(l.precisos for l in comp["TE"].lineas)
    assert abs(suma_te - comp["TE"].importe_6dec) <= Decimal("0.000001")


def test_iee_minimo_dispara_aviso():
    # El mínimo por MWh sólo vence al porcentual con BI baja y mucha energía:
    # TE ≈ 10000 kWh × 0,00001 € = 0,10 € → IEE(5,11 %) ≈ 0,043 € <
    # 10 MWh × 0,50 €/MWh = 5,00 € → se aplica el mínimo y se AVISA.
    of_low = OfertaTarifa(id_oferta="low", nombre="low", peaje="2.0TD", modalidad="fija",
                          precio_potencia=_vec([40, 40]),
                          precio_energia=_vec(["0.00001", "0.00001"]))
    f = FacturaEntrada(id_simulacion="x", cups=CUPS, peaje="2.0TD",
                       fecha_inicio=date(2025, 6, 1), fecha_fin=date(2025, 6, 30),
                       periodos=[_p2(energia_kwh=Decimal(10000), potencia_contratada_kw=Decimal("0.1"),
                                     potencia_maxima_kw=Decimal("0.1")),
                                 _p2(periodo=2, energia_kwh=Decimal(0),
                                     potencia_contratada_kw=Decimal("0.1"),
                                     potencia_maxima_kw=Decimal("0.1"))],
                       financia_bono_social=False, tipo_iva=Decimal("0"))
    res = simular(validar_factura(f), of_low)
    assert any("mínimo" in a for a in res.avisos)
    assert res.totales["iee"] == "5.00"


def test_oferta_incompatible_rechazada():
    of = OfertaTarifa(id_oferta="y", nombre="y", peaje="3.0TD", modalidad="fija",
                      precio_potencia=_vec([1] * 6), precio_energia=_vec([1] * 6))
    with pytest.raises(ValueError, match="incompatible"):
        simular(_f20(), of)


def test_cups_formato():
    with pytest.raises(ValueError, match="CUPS"):
        FacturaEntrada(id_simulacion="x", cups="MALO", peaje="2.0TD",
                       fecha_inicio=date(2025, 1, 1), fecha_fin=date(2025, 1, 2),
                       periodos=[_p2(), _p2(periodo=2)])


def test_fija_exige_precio_energia():
    with pytest.raises(ValueError, match="precio_energia"):
        OfertaTarifa(id_oferta="z", nombre="z", peaje="2.0TD", modalidad="fija",
                     precio_potencia=_vec([40, 40]))


def test_indexada_exige_formula_completa():
    with pytest.raises(ValueError, match="precio_market"):
        OfertaTarifa(id_oferta="z", nombre="z", peaje="2.0TD", modalidad="indexada",
                     precio_potencia=_vec([40, 40]))


def test_reactiva_p6_exenta():
    # P6 con reactiva brutal no penaliza (solo P1..P5)
    ps = [
        PeriodoFactura(periodo=i, energia_kwh=Decimal(400),
                       potencia_contratada_kw=Decimal("17.32") if i < 6 else Decimal("24"),
                       reactiva_kvarh=Decimal(0) if i < 6 else Decimal(9999),
                       serie_cuartohoraria=FraccionHoraria(periodo=i, potencias=[Decimal("10")]))
        for i in range(1, 7)
    ]
    f = FacturaEntrada(id_simulacion="x", cups="ES0031400000000002AB",
                       peaje="3.0TD", fecha_inicio=date(2025, 1, 1),
                       fecha_fin=date(2025, 1, 31), periodos=ps,
                       financia_bono_social=False)
    of = OfertaTarifa(id_oferta="q", nombre="q", peaje="3.0TD", modalidad="fija",
                      precio_potencia=_vec([1] * 6), precio_energia=_vec(["0.1"] * 6))
    res = simular(validar_factura(f), of)
    assert float(res.totales["energia_reactiva"]) == 0.0


def test_determinismo_total():
    r1 = simular(_f20(), OF20)
    r2 = simular(_f20(), OF20)
    assert r1.totales == r2.totales
