#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_fixtures.py — Genera tests/fixtures/facturas_50.json (A6).

METODOLOGÍA (doble implementación de despacho):
  · El JSON se calcula con un ORÁCULO escrito aquí, de forma plana y
    literal al Prompt Maestro §5.1, SIN importar nada del engine.
  · pytest (test_engine_referencia.py) ejecuta el ENGINE real y compara
    contra este JSON con tolerancia ≤ 0,01 € (exigencia §15.1).
  · Cualquier cambio del motor que mueva ≥0,01 € en cualquiera de las 50
    facturas rompe la suite: regresión dura por construcción.

Los escenarios están anonimizados (CUPS de laboratorio sintético
ES0000... válido por regex, nunca identificable).
"""

from __future__ import annotations

import json
import os
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

Q6 = Decimal("0.000001")


def r6(x):
    return x.quantize(Q6, rounding=ROUND_HALF_UP)


def r2s(x):
    return f"{x.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP):f}"


IEE_TIPO = {"peninsula": Decimal("0.0511269632"), "baleares": Decimal("0.0511269632"),
            "canarias": Decimal("0.007"), "ceuta_melilla": Decimal("0.005")}
IEE_MIN_MWH = Decimal("0.50")
BONO_DIA = Decimal("0.187258")
EXC_PRECIO = {"2.0TD": Decimal("3.01307"), "3.0TD": Decimal("3.39581"),
              "6.1TD": Decimal("3.566788"), "6.2TD": Decimal("3.566788"),
              "6.3TD": Decimal("3.566788"), "6.4TD": Decimal("3.566788")}
REAC_ALTO = Decimal("0.041554")
REAC_BAJO = Decimal("0.062332")


def sqrt_dec(x: Decimal) -> Decimal:
    return x.sqrt()


def es_bisiesto(anio: int) -> bool:
    return (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0


def oraculo_total(f: dict, o: dict) -> dict:
    """Implementación plana §5.1.1→§5.1.7 con la misma política de redondeo
    documentada del motor: 6 dec por línea, HALF_UP final a 2."""
    dias = (date.fromisoformat(f["fecha_fin"]) - date.fromisoformat(f["fecha_inicio"])).days + 1
    dias_ano = 366 if es_bisiesto(date.fromisoformat(f["fecha_fin"]).year) else 365
    peaje = f["peaje"]
    ps = sorted(f["periodos"], key=lambda p: p["periodo"])

    # TP
    tp = Decimal(0)
    for p in ps:
        precio = Decimal(o["precio_potencia"][p["periodo"] - 1])
        tp += r6(Decimal(p["potencia_contratada_kw"]) * precio * (Decimal(dias) / Decimal(dias_ano)))
    tp = r6(tp)

    # TE (fija o pass-through)
    te = Decimal(0)
    for p in ps:
        i = p["periodo"] - 1
        if o["modalidad"] == "fija":
            pe = Decimal(o["precio_energia"][i])
        else:
            base = (Decimal(o["precio_market"][i]) + Decimal(o["costes_comercializacion"][i])
                    + Decimal(o["perdidas"][i]))
            pe = base * (Decimal(1) + Decimal(o["margen"])) + Decimal(o["peajes_energia"][i]) + Decimal(o["cargos_energia"][i])
        te += r6(Decimal(p["energia_kwh"]) * pe)
    te = r6(te)

    # EP
    ep = Decimal(0)
    for p in ps:
        pc = Decimal(p["potencia_contratada_kw"])
        if peaje == "2.0TD":
            pmax = Decimal(p["potencia_maxima_kw"])
            umbral = Decimal("1.05") * pc
            if pmax <= umbral:
                imp = Decimal(0)
            else:
                imp = r6(Decimal(2) * (pmax - umbral) * EXC_PRECIO[peaje])
        else:
            exced = [Decimal(x) - pc for x in p["serie"] if Decimal(x) > pc]
            base = sum(sqrt_dec(x * x) for x in exced)
            imp = r6(Decimal(1) * Decimal("1.40") * base)
        ep += imp
    ep = r6(ep)

    # ER solo P1..P5
    er = Decimal(0)
    for p in ps:
        if p["periodo"] > 5:
            continue
        a, r = Decimal(p["energia_kwh"]), Decimal(p["reactiva_kvarh"])
        exceso = max(Decimal(0), r - Decimal("0.33") * a)
        if exceso > 0 and a > 0:
            cos = a / sqrt_dec(a * a + r * r)
            precio = REAC_ALTO if cos >= Decimal("0.80") else REAC_BAJO
            er += r6(exceso * precio)
    er = r6(er)

    bono = r6(Decimal(dias) * BONO_DIA) if f.get("financia_bono_social", True) else Decimal(0)
    otros_total = r6(Decimal(f.get("otros", "0")) + bono)
    descuentos = Decimal(f.get("descuentos", "0"))
    alquiler = Decimal(f.get("alquiler_equipo", "0"))

    bi_iee = r6(tp + te + ep + er + otros_total - descuentos)
    zona = f.get("zona", "peninsula")
    tipo = IEE_TIPO[zona]
    iee_pct = bi_iee * tipo
    mwh = sum(Decimal(p["energia_kwh"]) for p in ps) / Decimal(1000)
    aplica_min = zona in ("peninsula", "baleares")
    if aplica_min:
        iee = r6(max(iee_pct, r6(mwh * IEE_MIN_MWH)))
    else:
        iee = r6(iee_pct)
    iva = Decimal(f["tipo_iva"]) if f.get("tipo_iva") is not None else Decimal("0.21")
    bi_iva = r6(bi_iee + iee + alquiler)
    total = r6(bi_iva * (Decimal(1) + iva))
    return {
        "termino_potencia": r2s(tp), "termino_energia": r2s(te),
        "excesos_potencia": r2s(ep), "energia_reactiva": r2s(er),
        "otros_y_bono": r2s(otros_total), "descuentos": r2s(-descuentos),
        "base_iee": r2s(bi_iee), "iee": r2s(iee), "alquiler_equipo": r2s(alquiler),
        "base_iva": r2s(bi_iva), "iva": r2s(r6(total - bi_iva)),
        "total_factura": r2s(total),
    }


def P(pe, energia, pc, pmax=None, reactiva=0, serie=None):
    d = {"periodo": pe, "energia_kwh": energia, "potencia_contratada_kw": pc,
         "reactiva_kvarh": reactiva}
    if pmax is not None:
        d["potencia_maxima_kw"] = pmax
    if serie is not None:
        d["serie"] = serie
    return d


def fija(idf, nombre, peaje, ppot, pener):
    return {"id_oferta": idf, "nombre": nombre, "peaje": peaje,
            "modalidad": "fija", "precio_potencia": ppot, "precio_energia": pener}


def indexada(idf, nombre, peaje, ppot, pm, cc, loss, margen, peajes, cargos):
    return {"id_oferta": idf, "nombre": nombre, "peaje": peaje,
            "modalidad": "indexada", "precio_potencia": ppot,
            "precio_market": pm, "costes_comercializacion": cc,
            "perdidas": loss, "margen": margen,
            "peajes_energia": peajes, "cargos_energia": cargos}


def fact(fid, peaje, fi, ff, periodos, **kw):
    d = {"id_simulacion": fid, "cups": "ES0021000000000001AA" if peaje == "2.0TD" else "ES0031400000000002AB",
         "peaje": peaje, "fecha_inicio": fi, "fecha_fin": ff, "periodos": periodos}
    d.update(kw)
    return d


CUPS20 = "ES0021000000000001AA"
CUPS30 = "ES0031400000000002AB"

OF20 = fija("OF-20F-001", "Plana Ahorro 2.0", "2.0TD", ["40", "40"], ["0.15", "0.12"])
OF20B = fija("OF-20F-002", "Plana Hogar 2.0", "2.0TD", ["35", "35"], ["0.13", "0.10"])
OF20I = indexada("OF-20I-001", "Indexada Liberal 2.0", "2.0TD", ["40", "40"],
                 ["0.09", "0.07"], ["0.004", "0.004"], ["0.01", "0.01"], "0.05",
                 ["0.03", "0.015"], ["0.02", "0.015"])
OF30 = fija("OF-30F-001", "Industria Fija 3.0", "3.0TD",
            ["18", "15", "12", "12", "12", "8"],
            ["0.14", "0.12", "0.10", "0.08", "0.07", "0.06"])
OF30I = indexada("OF-30I-001", "Industria Indexada 3.0", "3.0TD",
                 ["18", "15", "12", "12", "12", "8"],
                 ["0.08", "0.08", "0.075", "0.07", "0.07", "0.065"],
                 ["0.004", "0.004", "0.004", "0.004", "0.004", "0.004"],
                 ["0.012", "0.012", "0.012", "0.012", "0.012", "0.012"], "0.04",
                 ["0.028", "0.02", "0.014", "0.012", "0.01", "0.008"],
                 ["0.02", "0.016", "0.012", "0.01", "0.009", "0.008"])
OF61 = fija("OF-61F-001", "Alta Tensión 6.1", "6.1TD",
            ["10", "9", "8", "8", "8", "5"],
            ["0.10", "0.09", "0.08", "0.07", "0.06", "0.05"])

SIN_EXCESO = ["15.0", "16.8", "17.1", "16.9", "17.3"]
CON_EXCESO = ["16.0", "17.0", "19.5", "18.2", "16.4"]


def casos_20():
    C = []
    C.append((fact("sim-F001", "2.0TD", "2025-03-01", "2025-03-30",
                   [P(1, 150, 4.6, 4.7), P(2, 100, 4.6, 4.7)],
                   otros="1.00", descuentos="0.50", financia_bono_social=False), OF20))
    C.append((fact("sim-F002", "2.0TD", "2025-06-01", "2025-06-30",
                   [P(1, 90, 3.45, 3.5), P(2, 60, 3.45, 3.5)]), OF20))
    C.append((fact("sim-F003", "2.0TD", "2025-06-01", "2025-06-30",
                   [P(1, 0, 3.45, 3.5), P(2, 0, 3.45, 3.5)]), OF20))
    C.append((fact("sim-F004", "2.0TD", "2025-07-01", "2025-07-31",
                   [P(1, 220, 5.75, 5.8, 40), P(2, 140, 5.75, 5.8, 30)],
                   alquiler_equipo="0.81"), OF20B))
    C.append((fact("sim-F005", "2.0TD", "2024-02-01", "2024-02-29",
                   [P(1, 160, 4.6, 5.9), P(2, 120, 4.6, 4.9)], tipo_iva="0.10"), OF20))
    C.append((fact("sim-F006", "2.0TD", "2025-02-01", "2025-02-28",
                   [P(1, 160, 4.6, 5.9), P(2, 120, 4.6, 4.9)]), OF20))
    C.append((fact("sim-F007", "2.0TD", "2025-08-10", "2025-08-10",
                   [P(1, 8, 4.6, 4.7), P(2, 6, 4.6, 4.7)]), OF20))
    C.append((fact("sim-F008", "2.0TD", "2025-11-01", "2025-11-30",
                   [P(1, 300, 6.9, 8.9), P(2, 200, 6.9, 7.1)],
                   otros="2.50", descuentos="5.00", alquiler_equipo="1.00"), OF20B))
    C.append((fact("sim-F009", "2.0TD", "2025-04-01", "2025-04-30",
                   [P(1, 180, 4.6, 4.4), P(2, 120, 4.6, 4.4)]), OF20I))
    C.append((fact("sim-F010", "2.0TD", "2025-04-01", "2025-04-30",
                   [P(1, 60, 4.6, 9.9), P(2, 40, 4.6, 4.7)]), OF20I))
    C.append((fact("sim-F011", "2.0TD", "2025-05-01", "2025-05-31",
                   [P(1, 460, 9.2, 9.25), P(2, 300, 9.2, 9.25)],
                   alquiler_equipo="0.81", financia_bono_social=False), OF20B))
    C.append((fact("sim-F012", "2.0TD", "2025-09-01", "2025-09-30",
                   [P(1, 130, 4.6, 4.83), P(2, 90, 4.6, 4.8)]), OF20))
    C.append((fact("sim-F013", "2.0TD", "2025-10-01", "2025-10-31",
                   [P(1, 210, 5.75, 6.05), P(2, 140, 5.75, 6.04)],
                   descuentos="3.00", tipo_iva="0.21"), OF20I))
    C.append((fact("sim-F014", "2.0TD", "2025-12-15", "2026-01-14",
                   [P(1, 170, 4.6, 4.7), P(2, 110, 4.6, 4.7)]), OF20))
    return C


def casos_30():
    PC = ["17.32", "17.32", "17.32", "17.32", "17.32", "24.0"]
    C = []
    C.append((fact("sim-F015", "3.0TD", "2025-03-01", "2025-03-31",
                   [P(1, 900, PC[0], None, 200, SIN_EXCESO),
                    P(2, 800, PC[1], None, 150, SIN_EXCESO),
                    P(3, 700, PC[2], None, 120, SIN_EXCESO),
                    P(4, 600, PC[3], None, 90, SIN_EXCESO),
                    P(5, 500, PC[4], None, 80, SIN_EXCESO),
                    P(6, 400, PC[5], None, 60, SIN_EXCESO)]), OF30))
    C.append((fact("sim-F016", "3.0TD", "2025-03-01", "2025-03-31",
                   [P(1, 900, PC[0], None, 0, CON_EXCESO),
                    P(2, 800, PC[1], None, 0, SIN_EXCESO),
                    P(3, 700, PC[2], None, 0, SIN_EXCESO),
                    P(4, 600, PC[3], None, 0, SIN_EXCESO),
                    P(5, 500, PC[4], None, 0, SIN_EXCESO),
                    P(6, 400, PC[5], None, 0, CON_EXCESO)]), OF30))
    C.append((fact("sim-F017", "3.0TD", "2025-06-01", "2025-06-30",
                   [P(1, 1200, "17.32", None, 700, SIN_EXCESO),
                    P(2, 900, "17.32", None, 480, SIN_EXCESO),
                    P(3, 700, "17.32", None, 300, SIN_EXCESO),
                    P(4, 500, "17.32", None, 200, SIN_EXCESO),
                    P(5, 400, "17.32", None, 100, SIN_EXCESO),
                    P(6, 300, "24.0", None, 800, SIN_EXCESO)],
                   alquiler_equipo="1.50"), OF30))
    C.append((fact("sim-F018", "3.0TD", "2025-06-01", "2025-06-30",
                   [P(1, 300, "17.32", None, 900, SIN_EXCESO),
                    P(2, 250, "17.32", None, 700, SIN_EXCESO),
                    P(3, 200, "17.32", None, 500, SIN_EXCESO),
                    P(4, 150, "17.32", None, 400, SIN_EXCESO),
                    P(5, 100, "17.32", None, 300, SIN_EXCESO),
                    P(6, 80, "24.0", None, 0, SIN_EXCESO)]), OF30))
    C.append((fact("sim-F019", "3.0TD", "2024-02-01", "2024-02-29",
                   [P(1, 800, "15.0", None, 0, ["14", "15", "16.1"]),
                    P(2, 700, "15.0", None, 0, SIN_EXCESO),
                    P(3, 600, "15.0", None, 0, SIN_EXCESO),
                    P(4, 500, "16.0", None, 0, SIN_EXCESO),
                    P(5, 400, "16.0", None, 0, SIN_EXCESO),
                    P(6, 300, "17.5", None, 0, SIN_EXCESO)], tipo_iva="0.10"), OF30I))
    C.append((fact("sim-F020", "3.0TD", "2025-08-01", "2025-08-31",
                   [P(1, 50, "17.32", None, 0, SIN_EXCESO),
                    P(2, 40, "17.32", None, 0, SIN_EXCESO),
                    P(3, 30, "17.32", None, 0, SIN_EXCESO),
                    P(4, 20, "17.32", None, 0, SIN_EXCESO),
                    P(5, 10, "17.32", None, 0, SIN_EXCESO),
                    P(6, 5, "24.0", None, 0, SIN_EXCESO)]), OF30))
    C.append((fact("sim-F021", "3.0TD", "2025-09-01", "2025-09-30",
                   [P(i, 550 + 50 * i, PC[i - 1], None, 0, ["17.0", "17.2", "17.4"] if i <= 5 else ["23.5", "24.0", "24.2"]) for i in range(1, 7)],
                   otros="4.00", descuentos="10.00", financia_bono_social=False), OF30I))
    return C


def casos_zonas_y_at():
    PC = ["17.32", "17.32", "17.32", "17.32", "17.32", "24.0"]
    base = [P(i, 500, PC[i - 1], None, 0, SIN_EXCESO) for i in range(1, 7)]
    C = []
    C.append((fact("sim-F022", "3.0TD", "2025-05-01", "2025-05-31",
                   [dict(p) for p in base], zona="baleares"), OF30))
    C.append((fact("sim-F023", "3.0TD", "2025-05-01", "2025-05-31",
                   [dict(p) for p in base], zona="canarias"), OF30))
    C.append((fact("sim-F024", "3.0TD", "2025-05-01", "2025-05-31",
                   [dict(p) for p in base], zona="ceuta_melilla"), OF30))
    C.append((fact("sim-F025", "3.0TD", "2025-05-01", "2025-05-31",
                   [P(i, 60, PC[i - 1], None, 0, SIN_EXCESO) for i in range(1, 7)],
                   zona="canarias", tipo_iva="0.05"), OF30))
    PCA = ["45", "45", "45", "45", "45", "60"]
    C.append((fact("sim-F026", "6.1TD", "2025-07-01", "2025-07-31",
                   [P(i, 6000, PCA[i - 1], None, 1500 if i == 2 else 0, ["44", "45", "46"] if i == 1 else ["59", "60", "60.3"]) for i in range(1, 7)],
                   alquiler_equipo="3.20", financia_bono_social=False), OF61))
    C.append((fact("sim-F027", "6.1TD", "2025-07-01", "2025-07-31",
                   [P(i, 900, PCA[i - 1], None, 0, ["59.5"] if i == 6 else ["44.9"]) for i in range(1, 7)]),
               OF61))
    C.append((fact("sim-F028", "6.1TD", "2024-12-20", "2025-01-19",
                   [P(i, 3200, PCA[i - 1], None, 2100 if i == 3 else 0, ["44"]) for i in range(1, 7)],
                   descuentos="200.00"), OF61))
    return C


def casos_bordes():
    C = []
    C.append((fact("sim-F029", "2.0TD", "2024-12-16", "2024-12-31",
                   [P(1, 40, 4.6, 4.65), P(2, 30, 4.6, 4.65)]), OF20))
    C.append((fact("sim-F030", "2.0TD", "2024-02-28", "2024-03-01",
                   [P(1, 20, 4.6, 4.65), P(2, 10, 4.6, 4.65)]), OF20))
    C.append((fact("sim-F031", "2.0TD", "2026-02-01", "2026-02-28",
                   [P(1, 140, 4.6, 4.7), P(2, 90, 4.6, 4.7)]), OF20))
    C.append((fact("sim-F032", "2.0TD", "2023-06-01", "2023-06-30",
                   [P(1, 140, 4.6, 4.7), P(2, 90, 4.6, 4.7)]), OF20))
    C.append((fact("sim-F033", "2.0TD", "2027-06-01", "2027-06-30",
                   [P(1, 140, 4.6, 4.7), P(2, 90, 4.6, 4.7)]), OF20))
    C.append((fact("sim-F034", "2.0TD", "2025-01-01", "2025-12-31",
                   [P(1, 1400, 4.6, 4.7), P(2, 900, 4.6, 4.7)],
                   alquiler_equipo="9.72"), OF20B))
    C.append((fact("sim-F035", "2.0TD", "2025-03-15", "2025-04-14",
                   [P(1, 155, 4.6, 5.5), P(2, 105, 4.6, 5.0)], tipo_iva="0"), OF20))
    return C


def casos_reactiva_estres():
    C = []
    PC = ["17.32", "17.32", "17.32", "17.32", "17.32", "24.0"]
    C.append((fact("sim-F036", "3.0TD", "2025-10-01", "2025-10-31",
                   [P(i, 400, PC[i - 1], None, 133 if i <= 5 else 4000, SIN_EXCESO) for i in range(1, 7)]), OF30))
    C.append((fact("sim-F037", "3.0TD", "2025-10-01", "2025-10-31",
                   [P(i, 400, PC[i - 1], None, 134 if i <= 5 else 0, SIN_EXCESO) for i in range(1, 7)]), OF30))
    C.append((fact("sim-F038", "3.0TD", "2025-10-01", "2025-10-31",
                   [P(1, 1000, PC[0], None, 3000, SIN_EXCESO),
                    P(2, 1000, PC[1], None, 0, SIN_EXCESO),
                    P(3, 1000, PC[2], None, 200, SIN_EXCESO),
                    P(4, 1000, PC[3], None, 350, SIN_EXCESO),
                    P(5, 1000, PC[4], None, 331, SIN_EXCESO),
                    P(6, 1000, PC[5], None, 5000, SIN_EXCESO)]), OF30))
    C.append((fact("sim-F039", "3.0TD", "2025-10-01", "2025-10-31",
                   [P(i, 700, PC[i - 1], None, 231 + (1 if i == 4 else 0), SIN_EXCESO) for i in range(1, 7)],
                   otros="1.00"), OF30I))
    return C


def casos_excesos_estres():
    C = []
    PC = ["17.32", "17.32", "17.32", "17.32", "17.32", "24.0"]
    C.append((fact("sim-F040", "3.0TD", "2025-11-01", "2025-11-30",
                   [P(1, 500, PC[0], None, 0, ["17.32", "17.33", "18.0", "21.5"]),
                    P(2, 500, PC[1], None, 0, ["10", "12", "13"]),
                    P(3, 500, PC[2], None, 0, ["17.3"]),
                    P(4, 500, PC[3], None, 0, ["25.0", "26.0", "27.0"]),
                    P(5, 500, PC[4], None, 0, SIN_EXCESO),
                    P(6, 500, PC[5], None, 0, ["24.01"]), ]), OF30))
    C.append((fact("sim-F041", "3.0TD", "2025-11-01", "2025-11-30",
                   [P(i, 450, PC[i - 1], None, 0, ["18.0"] * 4 if i == 2 else SIN_EXCESO) for i in range(1, 7)],
                   financia_bono_social=False), OF30I))
    C.append((fact("sim-F042", "2.0TD", "2025-11-01", "2025-11-30",
                   [P(1, 150, 4.6, 4.83), P(2, 100, 4.6, 4.92)]), OF20))
    C.append((fact("sim-F043", "2.0TD", "2025-11-01", "2025-11-30",
                   [P(1, 150, 4.6, 4.8305), P(2, 100, 4.6, 4.9295)]), OF20))
    C.append((fact("sim-F044", "6.1TD", "2025-11-01", "2025-11-30",
                   [P(i, 4000, ["45", "45", "45", "45", "45", "60"][i - 1], None, 0,
                      ["45.001"] if i == 5 else ["59.999"]) for i in range(1, 7)]), OF61))
    C.append((fact("sim-F045", "3.0TD", "2025-11-01", "2025-11-30",
                   [P(i, 380, PC[i - 1], None, 0, ["17.320001"] if i == 3 else ["24.1"]) for i in range(1, 7)],
                   otros="0.50"), OF30))
    return C


def casos_finales():
    C = []
    C.append((fact("sim-F046", "2.0TD", "2025-12-01", "2025-12-31",
                   [P(1, 500, 4.6, 4.7), P(2, 300, 4.6, 4.7)],
                   otros="0.10", tipo_iva="0.10"), OF20B))
    C.append((fact("sim-F047", "2.0TD", "2025-12-01", "2025-12-31",
                   [P(1, 5, 4.6, 4.7), P(2, 3, 4.6, 4.7)],
                   zona="baleares", financia_bono_social=False), OF20B))
    C.append((fact("sim-F048", "3.0TD", "2025-12-01", "2025-12-31",
                   [P(i, 610 - 50 * i, ["17.32", "17.32", "17.32", "17.32", "17.32", "24.0"][i - 1], None, 30 * i, SIN_EXCESO) for i in range(1, 7)],
                   descuentos="250.00", alquiler_equipo="2.00"), OF30I))
    C.append((fact("sim-F049", "6.1TD", "2025-12-01", "2025-12-31",
                   [P(i, 5500, ["45", "45", "45", "45", "45", "60"][i - 1], None, 0,
                      ["44", "44.5"] if i != 6 else ["59.9", "60.0"]) for i in range(1, 7)],
                   otros="120.00"), OF61))
    C.append((fact("sim-F050", "2.0TD", "2025-07-01", "2025-07-31",
                   [P(1, 260, 4.6, 10.4), P(2, 180, 4.6, 10.4)],
                   zona="peninsula", alquiler_equipo="0.81", descuentos="1.00",
                   tipo_iva="0.05"), OF20I))
    return C


def main():
    todos = (casos_20() + casos_30() + casos_zonas_y_at() + casos_bordes()
             + casos_reactiva_estres() + casos_excesos_estres() + casos_finales())
    assert len(todos) == 50, f"son {len(todos)}, no 50"
    ids = [c[0]["id_simulacion"] for c in todos]
    assert len(set(ids)) == 50, "ids repetidos"
    out = []
    for f, o in todos:
        out.append({"entrada": {"factura": f, "oferta": o},
                    "esperado": oraculo_total(f, o)})
    destino = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures",
                           "facturas_50.json")
    destino = os.path.normpath(destino)
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump({"meta": {"casos": 50, "tolerancia_eur": "0.01",
                            "generado_por": "tools/generar_fixtures.py (oráculo plano §5.1, sin importar el engine)"},
                   "casos": out}, fh, ensure_ascii=False, indent=1)
    print(f"✔ {len(out)} casos → {destino}")


if __name__ == "__main__":
    main()
