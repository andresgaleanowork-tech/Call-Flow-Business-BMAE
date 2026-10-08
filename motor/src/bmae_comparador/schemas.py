# -*- coding: utf-8 -*-
"""
schemas.py — Contratos de datos EXACTOS del motor tarifario (pydantic v2).

Todo importe entra y sale como string/Decimal (jamás float): el dinero no
admite error de representación binaria. Las reglas de negocio que el
validador matemático no puede ver viven en `validador.py`.

Unidades:
  potencia kW · energía kWh · reactiva kVArh · precios €/(kW·año) salvo
  precio de energía €/kWh y excesos €/kW · precisión de trabajo 6 decimales,
  presentación 2 decimales (ROUND_HALF_UP SOLO al final, §5).
"""

from __future__ import annotations

import re
from datetime import date
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .constantes import Peaje, Zona

RE_CUPS = re.compile(r"^[A-Z]{2}[0-9]{16}[A-Z]{2}[0-9]{0,2}[A-Z]?$")


class Dec6(Decimal):
    """Marca documental: importe de trabajo a 6 decimales."""


# ---------------------------------------------------------------------------
# Tarifa (oferta de la comercializadora)
# ---------------------------------------------------------------------------


class FraccionHoraria(BaseModel):
    """Serie cuartohoraria de potencias activas (kW) de un periodo."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    periodo: int = Field(ge=1, le=6)
    potencias: list  # list[Decimal] — ver validador

    @field_validator("potencias")
    @classmethod
    def _a_decimal(cls, v):
        out = []
        for x in v:
            d = Decimal(str(x))
            if d < 0:
                raise ValueError("potencia cuartohoraria negativa")
            out.append(d)
        if not out:
            raise ValueError("serie cuartohoraria vacía")
        return out


class PreciosPorPeriodo(BaseModel):
    """Vector de precios indexado por periodo 1..N (2 en 2.0TD, 6 resto)."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    valores: list  # list[Decimal]

    @field_validator("valores")
    @classmethod
    def _a_decimal(cls, v):
        out = [Decimal(str(x)) for x in v]
        if not out or len(out) > 6:
            raise ValueError("vector de precios inválido")
        if any(x < 0 for x in out):
            raise ValueError("precio negativo")
        return out

    def de(self, periodo: int) -> Decimal:
        return self.valores[periodo - 1]


class OfertaTarifa(BaseModel):
    """Oferta comercial comparable. Modalidad «fija»: precios cerrados;
    «indexada»: precio de energía = (PM + CC + LOSS)·(1+margen) + peaje
    + cargo (pass-through CNMC, §5.1.2)."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id_oferta: str = Field(min_length=1, max_length=60)
    nombre: str = Field(min_length=1, max_length=120)
    peaje: Peaje
    modalidad: Literal["fija", "indexada"]
    precio_potencia: PreciosPorPeriodo  # €/kW·año por periodo
    precio_energia: Optional[PreciosPorPeriodo] = None  # fija, €/kWh
    # -- solo indexada --
    precio_market: Optional[PreciosPorPeriodo] = None  # PM_p €/kWh
    costes_comercializacion: Optional[PreciosPorPeriodo] = None  # CC_p
    perdidas: Optional[PreciosPorPeriodo] = None  # LOSS_p
    margen: Optional[Decimal] = None  # adimensional, p. ej. 0.05
    peajes_energia: Optional[PreciosPorPeriodo] = None  # €/kWh
    cargos_energia: Optional[PreciosPorPeriodo] = None  # €/kWh
    version_vigente_desde: Optional[date] = None

    @model_validator(mode="after")
    def _coherencia_modalidad(self):
        n = self.peaje.periodos
        if len(self.precio_potencia.valores) != n:
            raise ValueError(
                f"precio_potencia requiere {n} periodos en {self.peaje.value}"
            )
        if self.modalidad == "fija":
            if self.precio_energia is None:
                raise ValueError("oferta fija exige precio_energia")
            if len(self.precio_energia.valores) != n:
                raise ValueError(
                    f"precio_energia requiere {n} periodos en {self.peaje.value}"
                )
        else:
            faltan = [
                c
                for c, v in (
                    ("precio_market", self.precio_market),
                    ("costes_comercializacion", self.costes_comercializacion),
                    ("perdidas", self.perdidas),
                    ("peajes_energia", self.peajes_energia),
                    ("cargos_energia", self.cargos_energia),
                )
                if v is None
            ]
            if faltan:
                raise ValueError("oferta indexada incompleta: " + ", ".join(faltan))
            for c in (
                self.precio_market,
                self.costes_comercializacion,
                self.perdidas,
                self.peajes_energia,
                self.cargos_energia,
            ):
                if len(c.valores) != n:
                    raise ValueError(
                        f"vector indexado requiere {n} periodos en {self.peaje.value}"
                    )
            if self.margen is None:
                raise ValueError("oferta indexada exige margen")
            if self.margen < 0:
                raise ValueError("margen negativo")
        return self

    def precio_energia_efectivo(self, periodo: int) -> Decimal:
        """€/kWh definitivo del periodo según modalidad (§5.1.2)."""

        if self.modalidad == "fija":
            return self.precio_energia.de(periodo)
        base = (
            self.precio_market.de(periodo)
            + self.costes_comercializacion.de(periodo)
            + self.perdidas.de(periodo)
        )
        return (
            base * (Decimal(1) + self.margen)
            + self.peajes_energia.de(periodo)
            + self.cargos_energia.de(periodo)
        )


# ---------------------------------------------------------------------------
# Factura de entrada (contrato del que se simula)
# ---------------------------------------------------------------------------


class PeriodoFactura(BaseModel):
    """Un periodo p con sus magnitudes del mes."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    periodo: int = Field(ge=1, le=6)
    energia_kwh: Decimal = Field(default=Decimal(0), ge=0)
    potencia_contratada_kw: Decimal = Field(ge=0)
    potencia_maxima_kw: Optional[Decimal] = Field(default=None, ge=0)
    reactiva_kvarh: Decimal = Field(default=Decimal(0), ge=0)
    serie_cuartohoraria: Optional[FraccionHoraria] = None

    @field_validator("energia_kwh", "potencia_contratada_kw", "potencia_maxima_kw", "reactiva_kvarh", mode="before")
    @classmethod
    def _a_decimal(cls, v):
        if v is None:
            return v
        return Decimal(str(v))


class FacturaEntrada(BaseModel):
    """Datos mínimos de la factura a simular. Contrato público del motor."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id_simulacion: str = Field(min_length=1, max_length=60)
    cups: str
    peaje: Peaje
    zona: Zona = Zona.PENINSULA
    fecha_inicio: date
    fecha_fin: date  # exclusiva no; inclusive (día de fin de periodo)
    periodos: list  # list[PeriodoFactura]
    tipo_iva: Optional[Decimal] = None  # si None: iva_por_defecto del año fin
    alquiler_equipo: Decimal = Decimal(0)
    otros: Decimal = Decimal(0)
    descuentos: Decimal = Decimal(0)
    financia_bono_social: bool = True

    @field_validator("cups")
    @classmethod
    def _cups_regex(cls, v):
        v = v.strip().upper()
        if not RE_CUPS.match(v):
            raise ValueError(f"CUPS con formato inválido: {v!r}")
        return v

    @field_validator("tipo_iva", "alquiler_equipo", "otros", "descuentos", mode="before")
    @classmethod
    def _a_decimal_opt(cls, v):
        if v is None:
            return v
        return Decimal(str(v))

    @model_validator(mode="after")
    def _coherencia_basica(self):
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError("fecha_fin anterior a fecha_inicio")
        n = self.peaje.periodos
        ids = sorted(p.periodo for p in self.periodos)
        if ids != list(range(1, n + 1)):
            raise ValueError(f"se exigen los periodos 1..{n} completos ({ids})")
        for p in self.periodos:
            if self.peaje is Peaje.T20 and p.potencia_maxima_kw is None:
                raise ValueError("2.0TD exige maxímetro por periodo (potencia_maxima_kw)")
            if self.peaje is not Peaje.T20 and p.serie_cuartohoraria is None:
                raise ValueError(
                    f"{self.peaje.value} exige serie cuartohoraria por periodo"
                )
            if p.serie_cuartohoraria is not None and p.serie_cuartohoraria.periodo != p.periodo:
                raise ValueError("serie cuartohoraria con periodo incoherente")
        return self

    @property
    def dias(self) -> int:
        return (self.fecha_fin - self.fecha_inicio).days + 1

    @property
    def mwh(self) -> Decimal:
        return sum(p.energia_kwh for p in self.periodos) / Decimal(1000)


# ---------------------------------------------------------------------------
# Resultado (desglose inmutable línea a línea)
# ---------------------------------------------------------------------------


class LineaDesglose(BaseModel):
    codigo: str
    concepto: str
    detalle: str
    importe: Decimal
    precisos: Decimal


class ComponenteTermino(BaseModel):
    termino: str
    importe_6dec: Decimal
    lineas: list
    notas: list = []


class ResultadoSimulacion(BaseModel):
    """Salida del motor. `totales` en 2 dec (ROUND_HALF_UP final);
    `componentes` a 6 dec trazables. El desglose es INMUTABLE: la oferta
    presentada en Twenty se guarda con esta foto (§6.1 SimulacionOferta)."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id_simulacion: str
    id_oferta: str
    peaje: str
    zona: str
    dias: int
    componentes: list
    totales: dict
    avisos: list = []
