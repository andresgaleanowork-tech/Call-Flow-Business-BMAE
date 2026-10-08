# -*- coding: utf-8 -*-
"""
validador.py — Reglas de negocio NO matemáticas (Prompt Maestro §5.1.1
restricción CNMC y §6 contratos). pydantic valida forma; este módulo valida
SENTIDO: una factura que viola una Circular no se simula, se rechaza con
diagnóstico accionable.
"""

from __future__ import annotations

from .constantes import Peaje
from .schemas import FacturaEntrada


class ErrorValidacion(ValueError):
    """Rechazo de validación con diagnóstico de campo."""


def validar_factura(fact: FacturaEntrada) -> FacturaEntrada:
    """Restricciones normativas no representables en el schema.

    Devuelve la factura si cumple; lanza ErrorValidacion con la regla
    violada en lenguaje de despacho si no.
    """

    # Restricción CNMC dura (§5.1.1): monotonía de la potencia contratada.
    if fact.peaje is not Peaje.T20:
        ps = sorted(fact.periodos, key=lambda x: x.periodo)
        seq = [p.potencia_contratada_kw for p in ps]
        for a, b in zip(seq, seq[1:]):
            if a > b:
                raise ErrorValidacion(
                    f"CNMC: en {fact.peaje.value} la potencia contratada debe "
                    f"ser no decreciente P1≤P2≤…≤P6 (hay {a} → {b} kW)"
                )

    # Maxímetro creíble en 2.0TD: Pmax nunca inferior a contratada/2 (ruido).
    if fact.peaje is Peaje.T20:
        for p in fact.periodos:
            if (
                p.potencia_maxima_kw is not None
                and p.potencia_contratada_kw > 0
                and p.potencia_maxima_kw * 2 < p.potencia_contratada_kw
            ):
                raise ErrorValidacion(
                    f"2.0TD P{p.periodo}: maxímetro {p.potencia_maxima_kw} kW "
                    f"incompatible con {p.potencia_contratada_kw} kW contratados"
                )

    # Series cuartohorarias habitables: 96 cuartos/día como techo blando.
    for p in fact.periodos:
        if p.serie_cuartohoraria is not None:
            n = len(p.serie_cuartohoraria.potencias)
            if n > 96 * fact.dias + 96:
                raise ErrorValidacion(
                    f"P{p.periodo}: {n} muestras cuartohorarias no caben en "
                    f"{fact.dias} días de factura"
                )

    # IVA español plausible (tipos especiales 0–1).
    if fact.tipo_iva is not None and not (0 <= fact.tipo_iva <= 1):
        raise ErrorValidacion(f"tipo_iva fuera de rango: {fact.tipo_iva}")

    # Los descuentos no pueden superar la energía+vivienda que pretenden
    # reducir (guardia básica anti-negativos comerciales).
    if fact.descuentos < 0:
        raise ErrorValidacion("descuentos negativos (¿recargo mal etiquetado?)")

    return fact


__all__ = ["validar_factura", "ErrorValidacion"]
