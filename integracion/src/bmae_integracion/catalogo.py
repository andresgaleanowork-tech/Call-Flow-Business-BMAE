# -*- coding: utf-8 -*-
"""
catalogo.py — Validación Pydantic estricta de filas de Excel de ofertas
antes de poblar «Oferta Electricidad» de ERPNext (§7.4 Prompt Maestro).

Cada fila aceptada es un dict válido para `OfertaTarifa`; cada rechazada
sale con diagnóstico legible por despacho (columna/error exactos).
"""

from __future__ import annotations

from bmae_comparador import OfertaTarifa


def validar_filas(filas: list) -> tuple:
    """filas: list[dict] ya volcadas de Excel (cabecera = claves).

    Devuelve (aceptadas, rechazadas). NUNCA lanza: el workflow lee
    rechazadas y falla de forma controlada (DSQ/PR de corrección)."""

    aceptadas, rechazadas = [], []
    for i, f in enumerate(filas, start=2):  # fila 1 = cabecera del Excel
        try:
            oferta = OfertaTarifa(
                id_oferta=str(f["id_oferta"]).strip(),
                nombre=str(f["nombre"]).strip(),
                peaje=str(f["peaje"]).strip(),
                modalidad=str(f.get("modalidad", "fija")).strip(),
                precio_potencia={"valores": f["precio_potencia"]},
                precio_energia=(
                    {"valores": f["precio_energia"]} if f.get("precio_energia") is not None else None
                ),
                precio_market=(
                    {"valores": f["precio_market"]} if f.get("precio_market") is not None else None
                ),
                costes_comercializacion=(
                    {"valores": f["costes_comercializacion"]}
                    if f.get("costes_comercializacion") is not None else None
                ),
                perdidas=(
                    {"valores": f["perdidas"]} if f.get("perdidas") is not None else None
                ),
                margen=f.get("margen"),
                peajes_energia=(
                    {"valores": f["peajes_energia"]} if f.get("peajes_energia") is not None else None
                ),
                cargos_energia=(
                    {"valores": f["cargos_energia"]} if f.get("cargos_energia") is not None else None
                ),
            )
            aceptadas.append(oferta.model_dump(mode="json"))
        except Exception as e:  # noqa: BLE001 — diagnóstico agregado, no aborto
            rechazadas.append({"fila": i, "fila_datos": f, "error": str(e)[:400]})
    return aceptadas, rechazadas


__all__ = ["validar_filas"]
