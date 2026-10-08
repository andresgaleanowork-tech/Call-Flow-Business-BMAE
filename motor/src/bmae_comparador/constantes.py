# -*- coding: utf-8 -*-
"""
constantes.py — Parámetros regulatorios del motor tarifario BMAE.

FUENTE DE VERDAD PARAMETRIZABLE (Prompt Maestro §5.2).
Nada de números mágicos en el engine: todo escenario normativo vive aquí,
con vigencia anual y zona fiscal, porque la Circular 3/2020 CNMC, el
RD 148/2021, la Ley 38/1992 y las Ordenes TED cambian por boletín y
NUNCA por commit de urgencia (Matriz de riesgos: «Cambios normativos
CNMC/AEAT — Alta/Alto — mitigación: parametrización + revisión trimestral»).

Reglas de edición:
  1. Un cambio regulatorio = una fecha de vigencia nueva, jamás sobrescribe
     la vigente (inmutabilidad histórica: facturas pasadas se recalculan con
     los parámetros de SU fecha).
  2. Toda magnitud monetaria va como string (Decimal exacto, binario jamás).
  3. El engine lee `para_fecha(fecha)` y `para_zona(zona)`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from enum import Enum


class Zona(str, Enum):
    """Zonas fiscales del Impuesto Especial sobre la Electricidad."""

    PENINSULA = "peninsula"
    BALEARES = "baleares"
    CANARIAS = "canarias"
    CEUTA_MELILLA = "ceuta_melilla"


class Peaje(str, Enum):
    """Peajes de acceso vigentes (Circular 3/2020)."""

    T20 = "2.0TD"
    T30 = "3.0TD"
    T61 = "6.1TD"
    T62 = "6.2TD"
    T63 = "6.3TD"
    T64 = "6.4TD"

    @property
    def periodos(self) -> int:
        return 2 if self is Peaje.T20 else 6

    @property
    def es_baja_tension(self) -> bool:
        return self in (Peaje.T20, Peaje.T30)


# ---------------------------------------------------------------------------
# Bloques normativos (inmutables por diseño: dataclass frozen)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ImpuestoElectrico:
    """Ley 38/1992. El mínimo por energía NO devenga en Canarias ni
    Ceuta y Melilla (el impuesto no se exige en esos territorios bajo el
    tipo general); se respeta como flag explícito por zona."""

    tipo: Decimal
    minimo_eur_mwh: Decimal
    aplica_minimo: bool = True


@dataclass(frozen=True)
class ExcesosPotencia:
    """RD 148/2021 art. 10.4 / Circular 3/2020.

    - precio_exceso_eur_kw: precio del kW de exceso por peaje.
    - coef_maximetro: multiplicador del término de potencia facturable al
      excedente en 2.0TD con maxímetro (Prompt Maestro §5.1.3: «2·(…)»).
    - umbral_maximetro: tolerancia CNMC del maxímetro (1.05).
    - teep: término de exceso de energía de potencia cuartohoraria (1.40).
    - metodo_cuartohorario: vease engine (`suma_raices` por defecto;
      DECISIÓN DOCUMENTADA en docs/arquitectura.md).
    """

    precio_exceso_eur_kw: Decimal
    coef_maximetro: Decimal
    umbral_maximetro: Decimal
    teep: Decimal
    metodo_cuartohorario: str = "suma_raices"


@dataclass(frozen=True)
class Reactiva:
    """Circular 3/2020: penaliza la reactiva inductiva por encima del
    33 % de la activa en los periodos P1..P5 (kVArh)."""

    fraccion_incluida: Decimal  # 0.33
    precio_tramo_alto: Decimal  # cos phi en [0.80, 0.95)
    precio_tramo_bajo: Decimal  # cos phi < 0.80
    cos_phi_alto: Decimal  # 0.95
    cos_phi_bajo: Decimal  # 0.80


@dataclass(frozen=True)
class ParametrosAnio:
    """Un juego normativo por anio natural de referencia."""

    anio: int
    iee: dict  # Zona -> ImpuestoElectrico
    excesos: dict  # Peaje -> ExcesosPotencia
    reactiva: Reactiva
    bono_social_cuota_diaria: Decimal
    iva_por_defecto: Decimal


# ---------------------------------------------------------------------------
# Juegos vigentes (Prompt Maestro §5.2). Cuota diaria bono social: valor
# editorial marcado pendiente de la Orden TED vigente — la financiación se
# CARGA por defecto y es desactivable por factura (ver schemas).
# ---------------------------------------------------------------------------

_REACTIVA_VIGENTE = Reactiva(
    fraccion_incluida=Decimal("0.33"),
    precio_tramo_alto=Decimal("0.041554"),
    precio_tramo_bajo=Decimal("0.062332"),
    cos_phi_alto=Decimal("0.95"),
    cos_phi_bajo=Decimal("0.80"),
)


def _iee_tabla() -> dict:
    return {
        Zona.PENINSULA: ImpuestoElectrico(
            tipo=Decimal("0.0511269632"), minimo_eur_mwh=Decimal("0.50")
        ),
        Zona.BALEARES: ImpuestoElectrico(
            tipo=Decimal("0.0511269632"), minimo_eur_mwh=Decimal("0.50")
        ),
        Zona.CANARIAS: ImpuestoElectrico(
            tipo=Decimal("0.007"), minimo_eur_mwh=Decimal("0.50"),
            aplica_minimo=False,
        ),
        Zona.CEUTA_MELILLA: ImpuestoElectrico(
            tipo=Decimal("0.005"), minimo_eur_mwh=Decimal("0.50"),
            aplica_minimo=False,
        ),
    }


def _excesos_tabla() -> dict:
    t = dict()
    t[Peaje.T20] = ExcesosPotencia(
        precio_exceso_eur_kw=Decimal("3.01307"),
        coef_maximetro=Decimal("2"),
        umbral_maximetro=Decimal("1.05"),
        teep=Decimal("0"),  # 2.0TD no usa cuartohorario
    )
    t[Peaje.T30] = ExcesosPotencia(
        precio_exceso_eur_kw=Decimal("3.39581"),
        coef_maximetro=Decimal("2"),
        umbral_maximetro=Decimal("1.05"),
        teep=Decimal("1.40"),
    )
    for pe in (Peaje.T61, Peaje.T62, Peaje.T63, Peaje.T64):
        t[pe] = ExcesosPotencia(
            precio_exceso_eur_kw=Decimal("3.566788"),
            coef_maximetro=Decimal("2"),
            umbral_maximetro=Decimal("1.05"),
            teep=Decimal("1.40"),
        )
    return t


_PARAMETROS: dict = {
    2024: ParametrosAnio(
        anio=2024,
        iee=_iee_tabla(),
        excesos=_excesos_tabla(),
        reactiva=_REACTIVA_VIGENTE,
        bono_social_cuota_diaria=Decimal("0.187258"),
        iva_por_defecto=Decimal("0.21"),
    ),
    2025: ParametrosAnio(
        anio=2025,
        iee=_iee_tabla(),
        excesos=_excesos_tabla(),
        reactiva=_REACTIVA_VIGENTE,
        bono_social_cuota_diaria=Decimal("0.187258"),
        iva_por_defecto=Decimal("0.21"),
    ),
    2026: ParametrosAnio(
        anio=2026,
        iee=_iee_tabla(),
        excesos=_excesos_tabla(),
        reactiva=_REACTIVA_VIGENTE,
        bono_social_cuota_diaria=Decimal("0.187258"),
        iva_por_defecto=Decimal("0.21"),
    ),
}

ANIO_MIN = min(_PARAMETROS)
ANIO_MAX = max(_PARAMETROS)


def para_anio(anio: int) -> ParametrosAnio:
    """Juego vigente del año; fuera de rango usa el más cercano publicado
    con trazabilidad (el engine anota la decisión en el desglose)."""

    if anio in _PARAMETROS:
        return _PARAMETROS[anio]
    if anio < ANIO_MIN:
        return _PARAMETROS[ANIO_MIN]
    return _PARAMETROS[ANIO_MAX]


def para_fecha(f: date) -> ParametrosAnio:
    return para_anio(f.year)


def dias_de_ano(anio: int) -> int:
    """366 bisiesto / 365 normal (Prompt Maestro §5.1.1)."""

    if anio % 4:
        return 365
    if anio % 100:
        return 366
    return 366 if anio % 400 == 0 else 365


__all__ = [
    "Zona",
    "Peaje",
    "ImpuestoElectrico",
    "ExcesosPotencia",
    "Reactiva",
    "ParametrosAnio",
    "para_anio",
    "para_fecha",
    "dias_de_ano",
    "ANIO_MIN",
    "ANIO_MAX",
]
