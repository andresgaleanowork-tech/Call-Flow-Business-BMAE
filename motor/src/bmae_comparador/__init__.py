# -*- coding: utf-8 -*-
"""bmae_comparador — Motor de cálculo tarifario CNMC de BMAE (Bloque A3).

Uso canónico::

    from bmae_comparador import FacturaEntrada, OfertaTarifa, simular, validar_factura

    res = simular(validar_factura(factura), oferta)
"""

from .constantes import ANIO_MAX, ANIO_MIN, Peaje, Zona, para_anio, para_fecha
from .engine import simular
from .schemas import (
    FacturaEntrada,
    FraccionHoraria,
    OfertaTarifa,
    PeriodoFactura,
    PreciosPorPeriodo,
    ResultadoSimulacion,
)
from .validador import ErrorValidacion, validar_factura

__version__ = "0.1.0"

__all__ = [
    "Peaje",
    "Zona",
    "FacturaEntrada",
    "OfertaTarifa",
    "PeriodoFactura",
    "PreciosPorPeriodo",
    "FraccionHoraria",
    "ResultadoSimulacion",
    "simular",
    "validar_factura",
    "ErrorValidacion",
    "para_anio",
    "para_fecha",
    "ANIO_MIN",
    "ANIO_MAX",
    "__version__",
]
