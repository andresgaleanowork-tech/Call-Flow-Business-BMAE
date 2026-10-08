# -*- coding: utf-8 -*-
"""
A6 · test_engine_referencia.py — 50 facturas de referencia vs ENGINE real.

Los esperados vienen del ORÁCULO plano de tools/generar_fixtures.py
(doble implementación, §15.1: tolerancia ≤ 0,01 €; aquí exigimos incluso
igualdad exacta de los totales a 2 decimales, más fuerte que el umbral).
"""

from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path

import pytest

from bmae_comparador import (
    FacturaEntrada,
    FraccionHoraria,
    OfertaTarifa,
    PeriodoFactura,
    PreciosPorPeriodo,
    simular,
    validar_factura,
)

FIXTURES = Path(__file__).parent / "fixtures" / "facturas_50.json"
CASOS = json.loads(FIXTURES.read_text(encoding="utf-8"))["casos"]


def _vec(v):
    return PreciosPorPeriodo(valores=[Decimal(str(x)) for x in v])


def _oferta(o: dict) -> OfertaTarifa:
    kw = dict(
        id_oferta=o["id_oferta"], nombre=o["nombre"], peaje=o["peaje"],
        modalidad=o["modalidad"], precio_potencia=_vec(o["precio_potencia"]),
        version_vigente_desde=None,
    )
    if o["modalidad"] == "fija":
        kw["precio_energia"] = _vec(o["precio_energia"])
    else:
        kw.update(
            precio_market=_vec(o["precio_market"]),
            costes_comercializacion=_vec(o["costes_comercializacion"]),
            perdidas=_vec(o["perdidas"]),
            margen=Decimal(str(o["margen"])),
            peajes_energia=_vec(o["peajes_energia"]),
            cargos_energia=_vec(o["cargos_energia"]),
        )
    return OfertaTarifa(**kw)


def _factura(f: dict) -> FacturaEntrada:
    periodos = []
    for p in f["periodos"]:
        serie = None
        if p.get("serie") is not None:
            serie = FraccionHoraria(
                periodo=p["periodo"],
                potencias=[Decimal(str(x)) for x in p["serie"]],
            )
        periodos.append(
            PeriodoFactura(
                periodo=p["periodo"],
                energia_kwh=Decimal(str(p["energia_kwh"])),
                potencia_contratada_kw=Decimal(str(p["potencia_contratada_kw"])),
                potencia_maxima_kw=(
                    Decimal(str(p["potencia_maxima_kw"]))
                    if p.get("potencia_maxima_kw") is not None
                    else None
                ),
                reactiva_kvarh=Decimal(str(p.get("reactiva_kvarh", 0))),
                serie_cuartohoraria=serie,
            )
        )
    kw = dict(
        id_simulacion=f["id_simulacion"], cups=f["cups"], peaje=f["peaje"],
        zona=f.get("zona", "peninsula"),
        fecha_inicio=f["fecha_inicio"], fecha_fin=f["fecha_fin"],
        periodos=periodos,
        alquiler_equipo=Decimal(str(f.get("alquiler_equipo", 0))),
        otros=Decimal(str(f.get("otros", 0))),
        descuentos=Decimal(str(f.get("descuentos", 0))),
        financia_bono_social=f.get("financia_bono_social", True),
    )
    if f.get("tipo_iva") is not None:
        kw["tipo_iva"] = Decimal(str(f["tipo_iva"]))
    return validar_factura(FacturaEntrada(**kw))


@pytest.mark.parametrize(
    "caso", CASOS, ids=[c["entrada"]["factura"]["id_simulacion"] for c in CASOS]
)
def test_factura_referencia(caso):
    res = simular(_factura(caso["entrada"]["factura"]), _oferta(caso["entrada"]["oferta"]))
    esperado = caso["esperado"]
    # totales principales: igualdad textual a 2 decimales (≤ 0,01 € sobrado)
    for clave in (
        "termino_potencia",
        "termino_energia",
        "excesos_potencia",
        "energia_reactiva",
        "base_iee",
        "iee",
        "base_iva",
        "iva",
        "total_factura",
    ):
        assert res.totales[clave] == esperado[clave], (
            f"desajuste en {clave}: motor {res.totales[clave]} "
            f"≠ oráculo {esperado[clave]}"
        )
    # el total jamás se desvía más de 1 céntimo del esperado (regla §15.1)
    diff = abs(Decimal(res.totales["total_factura"]) - Decimal(esperado["total_factura"]))
    assert diff <= Decimal("0.01")


def test_son_50_casos_con_ids_unicos():
    assert len(CASOS) == 50
    assert len({c["entrada"]["factura"]["id_simulacion"] for c in CASOS}) == 50
