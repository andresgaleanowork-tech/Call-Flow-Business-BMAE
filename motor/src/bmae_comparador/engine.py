# -*- coding: utf-8 -*-
"""
engine.py — Motor de cálculo tarifario BMAE (`bmae_comparador.engine`).

Implementación literal del Prompt Maestro §5.1 con `decimal.Decimal`:

  TP = Σ_p  P_p · Pp_p · (DiasFactura / DiasAno)           [§5.1.1]
  TE = Σ_p  E_p · Pe_p                                     [§5.1.2]
       Pe_p (indexada) = (PM_p + CC_p + LOSS_p)·(1+m) + Peaje_p + Cargo_p
  EP 2.0TD (maxímetro): 0 si Pmax ≤ 1.05·Pc ;
       si no: 2·(Pmax − 1.05·Pc)·PrecioExceso              [§5.1.3]
  EP 3.0TD/6.XTD (cuartohoraria CNMC):
       K_p · 1.40 · Σ_i √(max(0, P_i − Pc)²) por periodo   [§5.1.3]
  ER: exceso_p = max(0, R_p − 0.33·A_p) en P1..P5;
       precio según cos φ por periodo                      [§5.1.4]
  Bono Social (financiación): DiasFactura · CuotaDiaria    [§5.1.5]
  IEE: BI = TP+TE+EP+ER+Otros−Descuentos ;
       IEE = max(BI·tipo, MWh·minimo)                      [§5.1.6]
  TF = (BI + IEE + Alquiler) · (1+IVA)                     [§5.1.7]

POLÍTICA DE REDONDEO (exigencia §5): precisión de trabajo 6 decimales
(ROUND_HALF_UP en cada cierre de término para determinismo total entre
plataformas) y CIERRE FINAL a 2 decimales ROUND_HALF_UP. Ningún `float`
cruza el módulo: sólo `str`/`Decimal`/`int`.

DECISIONES DOCUMENTADAS (docs/arquitectura.md):
  D-1 DiasAno se toma del año de `fecha_fin` (regla CNMC de prorrata:
      la cuota potencia se devenga por días naturales del periodo).
  D-2 La financiación del bono social SUMA a «otros» (cobro al
      comercializador repercutible), desactivable por factura.
  D-3 Método cuartohorario por defecto «suma_raices» (fórmula literal del
      §5.1.3); la variante BOE «raiz_suma» queda parametrizable en
      constantes.ExcesosPotencia.metodo_cuartohorario — ALTERNATIVA
      PRAGMÁTICA señalada al estudio regulatorio.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP, getcontext

from .constantes import Peaje, Zona, dias_de_ano, para_fecha
from .schemas import (
    ComponenteTermino,
    FacturaEntrada,
    LineaDesglose,
    OfertaTarifa,
    ResultadoSimulacion,
)

getcontext().prec = 40  # holgura interna; jamás redondeo implícito por contexto

_Q6 = Decimal("0.000001")
_Q2 = Decimal("0.01")
CERO = Decimal(0)


def _r6(x: Decimal) -> Decimal:
    return x.quantize(_Q6, rounding=ROUND_HALF_UP)


def _r2(x: Decimal) -> Decimal:
    return x.quantize(_Q2, rounding=ROUND_HALF_UP)


def _eur(x: Decimal) -> str:
    """Presentación fija «123.45» (2 dec) para totales serializables."""

    return f"{_r2(x):f}"


# ---------------------------------------------------------------------------
# Términos
# ---------------------------------------------------------------------------


def termino_potencia(
    fact: FacturaEntrada, oferta: OfertaTarifa
) -> ComponenteTermino:
    """§5.1.1 — producto escalar de vectores de potencia × precio, prorrateado."""

    dias = fact.dias
    dias_ano = dias_de_ano(fact.fecha_fin.year)  # D-1
    lineas, total = [], CERO
    for p in sorted(fact.periodos, key=lambda x: x.periodo):
        precio = oferta.precio_potencia.de(p.periodo)
        imp = p.potencia_contratada_kw * precio * (Decimal(dias) / Decimal(dias_ano))
        imp = _r6(imp)
        total += imp
        lineas.append(
            LineaDesglose(
                codigo=f"TP-P{p.periodo}",
                concepto="Término de potencia",
                detalle=(
                    f"{p.potencia_contratada_kw} kW × {precio} €/kW·año "
                    f"× {dias}/{dias_ano}"
                ),
                importe=_r2(imp),
                precisos=imp,
            )
        )
    return ComponenteTermino(termino="TP", importe_6dec=_r6(total), lineas=lineas)


def termino_energia(
    fact: FacturaEntrada, oferta: OfertaTarifa
) -> ComponenteTermino:
    """§5.1.2 — precio efectivo por periodo según modalidad."""

    lineas, total = [], CERO
    for p in sorted(fact.periodos, key=lambda x: x.periodo):
        precio = oferta.precio_energia_efectivo(p.periodo)
        imp = _r6(p.energia_kwh * precio)
        total += imp
        lineas.append(
            LineaDesglose(
                codigo=f"TE-P{p.periodo}",
                concepto="Término de energía",
                detalle=f"{p.energia_kwh} kWh × {_r6(precio)} €/kWh",
                importe=_r2(imp),
                precisos=imp,
            )
        )
    return ComponenteTermino(termino="TE", importe_6dec=_r6(total), lineas=lineas)


def excesos_potencia(fact: FacturaEntrada, oferta: OfertaTarifa) -> ComponenteTermino:
    """§5.1.3 — 2.0TD por maxímetro; resto por integración cuartohoraria."""

    params = para_fecha(fact.fecha_fin)
    reg = params.excesos[fact.peaje]
    lineas, total = [], CERO

    if fact.peaje is Peaje.T20:
        umbral_x = reg.umbral_maximetro
        for p in sorted(fact.periodos, key=lambda x: x.periodo):
            umbral = umbral_x * p.potencia_contratada_kw
            if p.potencia_maxima_kw <= umbral:
                imp = CERO
                nota = "≤ 105 % de contratada → sin exceso"
            else:
                exc = p.potencia_maxima_kw - umbral
                imp = _r6(reg.coef_maximetro * exc * reg.precio_exceso_eur_kw)
                nota = (
                    f"{reg.coef_maximetro}×({p.potencia_maxima_kw} − "
                    f"{umbral} kW)×{reg.precio_exceso_eur_kw} €/kW"
                )
            total += imp
            lineas.append(
                LineaDesglose(
                    codigo=f"EP-P{p.periodo}",
                    concepto="Exceso de potencia (maxímetro)",
                    detalle=nota,
                    importe=_r2(imp),
                    precisos=imp,
                )
            )
        return ComponenteTermino(termino="EP", importe_6dec=_r6(total), lineas=lineas)

    # -- cuartohorario con series validadas por schema --
    kp = Decimal(1)  # coeficiente de simultaneidad (parametrizable CNMC)
    for p in sorted(fact.periodos, key=lambda x: x.periodo):
        pc = p.potencia_contratada_kw
        excedentes = [
            (pi - pc) for pi in p.serie_cuartohoraria.potencias if pi > pc
        ]
        if reg.metodo_cuartohorario == "raiz_suma":  # variante BOE (D-3)
            base = (sum(x * x for x in excedentes)).sqrt() if excedentes else CERO
        else:  # «suma_raices»: Σ_i √(x_i²) = Σ |x_i| (x_i ≥ 0 aquí)
            base = sum((x * x).sqrt() for x in excedentes)
        imp = _r6(kp * reg.teep * base)
        total += imp
        lineas.append(
            LineaDesglose(
                codigo=f"EP-P{p.periodo}",
                concepto="Exceso de potencia (cuartohorario)",
                detalle=(
                    f"Σ|excedentes|={_r6(base)} kW × K_p={kp} × "
                    f"TEep={reg.teep}"
                    if excedentes
                    else "sin cuartos excedidos"
                ),
                importe=_r2(imp),
                precisos=imp,
            )
        )
    return ComponenteTermino(termino="EP", importe_6dec=_r6(total), lineas=lineas)


def energia_reactiva(fact: FacturaEntrada, oferta: OfertaTarifa) -> ComponenteTermino:
    """§5.1.4 — sólo P1..P5 y sólo si la reactiva supera el 33 % de la
    activa; el precio depende del cos φ del propio periodo."""

    params = para_fecha(fact.fecha_fin)
    reg = params.reactiva
    lineas, total = [], CERO
    for p in sorted(fact.periodos, key=lambda x: x.periodo):
        if p.periodo > 5:
            continue  # P6 exento de penalización de reactiva
        a, r = p.energia_kwh, p.reactiva_kvarh
        limite = reg.fraccion_incluida * a
        exceso = max(CERO, r - limite)
        if exceso <= 0 or a <= 0:
            lineas.append(
                LineaDesglose(
                    codigo=f"ER-P{p.periodo}",
                    concepto="Energía reactiva",
                    detalle="dentro del 33 % incluido → 0 €",
                    importe=CERO,
                    precisos=CERO,
                )
            )
            continue
        cos_phi = a / (a * a + r * r).sqrt()
        if cos_phi >= reg.cos_phi_bajo:
            precio = reg.precio_tramo_alto
            tramo = "0.80 ≤ cos φ < 0.95"
        else:
            precio = reg.precio_tramo_bajo
            tramo = "cos φ < 0.80"
        imp = _r6(exceso * precio)
        total += imp
        lineas.append(
            LineaDesglose(
                codigo=f"ER-P{p.periodo}",
                concepto="Energía reactiva",
                detalle=(
                    f"max(0, {r} − 0.33×{a})={_r6(exceso)} kVArh × "
                    f"{precio} €/kVArh ({tramo}; cos φ≈{_r6(cos_phi)})"
                ),
                importe=_r2(imp),
                precisos=imp,
            )
        )
    return ComponenteTermino(termino="ER", importe_6dec=_r6(total), lineas=lineas)


# ---------------------------------------------------------------------------
# Simulación completa
# ---------------------------------------------------------------------------


def simular(fact: FacturaEntrada, oferta: OfertaTarifa) -> ResultadoSimulacion:
    """Pipeline §5.1.1→§5.1.7 con desglose inmutable línea a línea."""

    if oferta.peaje is not fact.peaje:
        raise ValueError(
            f"oferta {oferta.id_oferta} ({oferta.peaje.value}) incompatible "
            f"con factura {fact.peaje.value}"
        )
    avisos: list = []
    params = para_fecha(fact.fecha_fin)
    if params.anio != fact.fecha_fin.year:
        avisos.append(
            f"parámetros del anio {params.anio} aplicados por proximidad "
            f"(factura de {fact.fecha_fin.year})"
        )

    c_tp = termino_potencia(fact, oferta)
    c_te = termino_energia(fact, oferta)
    c_ep = excesos_potencia(fact, oferta)
    c_er = energia_reactiva(fact, oferta)

    # -- §5.1.5 financiación bono social (suma a «otros», D-2) --
    if fact.financia_bono_social:
        bono = _r6(Decimal(fact.dias) * params.bono_social_cuota_diaria)
    else:
        bono = CERO
    otros_total = _r6(fact.otros + bono)

    # -- §5.1.6 IEE con mínimo por MWh --
    bi_iee = _r6(
        c_tp.importe_6dec + c_te.importe_6dec + c_ep.importe_6dec
        + c_er.importe_6dec + otros_total - fact.descuentos
    )
    reg_iee = params.iee[fact.zona]
    iee_porcentual = bi_iee * reg_iee.tipo
    if reg_iee.aplica_minimo:
        iee_minimo = _r6(fact.mwh * reg_iee.minimo_eur_mwh)
        iee_6 = _r6(max(iee_porcentual, iee_minimo))
        minimo_aplicado = iee_minimo > iee_porcentual
    else:
        iee_6 = _r6(iee_porcentual)
        minimo_aplicado = False

    # -- §5.1.7 total --
    iva = fact.tipo_iva if fact.tipo_iva is not None else params.iva_por_defecto
    bi_iva = _r6(bi_iee + iee_6 + fact.alquiler_equipo)
    total_6 = _r6(bi_iva * (Decimal(1) + iva))
    impuestos_6 = _r6(total_6 - bi_iva)

    componentes = [
        c_tp,
        c_te,
        c_ep,
        c_er,
        ComponenteTermino(
            termino="OTROS",
            importe_6dec=otros_total,
            lineas=[
                LineaDesglose(
                    codigo="OTROS",
                    concepto="Otros conceptos",
                    detalle=f"{fact.otros} € declarados",
                    importe=_r2(fact.otros),
                    precisos=fact.otros,
                ),
                LineaDesglose(
                    codigo="BONO",
                    concepto="Financiación bono social",
                    detalle=(
                        f"{fact.dias} días × {params.bono_social_cuota_diaria} €/día"
                        if fact.financia_bono_social
                        else "excluida por la factura de entrada"
                    ),
                    importe=_r2(bono),
                    precisos=bono,
                ),
            ],
        ),
        ComponenteTermino(
            termino="DTO",
            importe_6dec=_r6(-fact.descuentos) if fact.descuentos else CERO,
            lineas=[
                LineaDesglose(
                    codigo="DTO",
                    concepto="Descuentos",
                    detalle="restan de la base del impuesto",
                    importe=_r2(-fact.descuentos) if fact.descuentos else CERO,
                    precisos=-fact.descuentos if fact.descuentos else CERO,
                )
            ],
        ),
        ComponenteTermino(
            termino="IEE",
            importe_6dec=iee_6,
            lineas=[
                LineaDesglose(
                    codigo="IEE",
                    concepto="Impuesto Especial Electricidad (5,11269632 %)",
                    detalle=(
                        f"max(BI×{reg_iee.tipo}, "
                        f"{_r6(fact.mwh)} MWh×{reg_iee.minimo_eur_mwh} €/MWh)"
                        f" → {'mínimo por MWh' if minimo_aplicado else 'porcentual'}"
                    ),
                    importe=_r2(iee_6),
                    precisos=iee_6,
                )
            ],
        ),
        ComponenteTermino(
            termino="ALQ",
            importe_6dec=_r6(fact.alquiler_equipo),
            lineas=[
                LineaDesglose(
                    codigo="ALQ",
                    concepto="Alquiler equipo de medida",
                    detalle="suma a la base de IVA, fuera de la base del IEE",
                    importe=_r2(fact.alquiler_equipo),
                    precisos=fact.alquiler_equipo,
                )
            ],
        ),
        ComponenteTermino(
            termino="IVA",
            importe_6dec=impuestos_6,
            lineas=[
                LineaDesglose(
                    codigo="IVA",
                    concepto=f"IVA {iva * 100} %",
                    detalle=f"{_r6(bi_iva)} € × {iva}",
                    importe=_r2(impuestos_6),
                    precisos=impuestos_6,
                )
            ],
        ),
    ]

    totales = {
        "termino_potencia": _eur(c_tp.importe_6dec),
        "termino_energia": _eur(c_te.importe_6dec),
        "excesos_potencia": _eur(c_ep.importe_6dec),
        "energia_reactiva": _eur(c_er.importe_6dec),
        "otros_y_bono": _eur(otros_total),
        "descuentos": _eur(-fact.descuentos),
        "base_iee": _eur(bi_iee),
        "iee": _eur(iee_6),
        "alquiler_equipo": _eur(fact.alquiler_equipo),
        "base_iva": _eur(bi_iva),
        "iva": _eur(impuestos_6),
        "total_factura": _eur(total_6),
        "tipo_iva_aplicado": f"{iva}",
    }
    if minimo_aplicado:
        avisos.append("IEE liquidado por el mínimo de 0,50 €/MWh")

    return ResultadoSimulacion(
        id_simulacion=fact.id_simulacion,
        id_oferta=oferta.id_oferta,
        peaje=fact.peaje.value,
        zona=fact.zona.value,
        dias=fact.dias,
        componentes=componentes,
        totales=totales,
        avisos=avisos,
    )


__all__ = ["simular", "termino_potencia", "termino_energia",
           "excesos_potencia", "energia_reactiva"]
