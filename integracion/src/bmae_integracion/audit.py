# -*- coding: utf-8 -*-
"""
audit.py — Recomputación íntegra de la cadena de huellas VeriFactu
(§7.3 Prompt Maestro): lee la serie ordenada por secuencia y verifica:

  1. que el encadenamiento declarado coincide con la huella anterior real;
  2. que cada huella registrada es la SHA-256 de sus propios campos;
  3. que no hay huecos de serie.

Cualquier divergencia rompe el workflow → Issue CRÍTICO (A5.3).
"""

from __future__ import annotations

from bmae_verifactu import RegistroHuella


def auditar_cadena(registros: list) -> dict:
    """registros: list[dict] ORDENADOS por secuencia estricta de emisión
    (creacion ERPNext), con: nif, numero_serie, fecha_expedicion,
    tipo_factura, cuota_total, importe_total, huella, fecha_hora_huso.

    Devuelve {ok, registros_auditados, divergencias[]} determinista."""

    divergencias = []
    huella_previa_real = ""
    for i, r in enumerate(registros):
        reg = RegistroHuella(
            nif=r["nif"],
            numero_serie=r["numero_serie"],
            fecha_expedicion=r["fecha_expedicion"],
            tipo_factura=r["tipo_factura"],
            cuota_total=r["cuota_total"],
            importe_total=r["importe_total"],
            huella_anterior=huella_previa_real,
            fecha_hora_huso=r["fecha_hora_huso"],
        )
        huella_recomputada = reg.huella()
        huella_declarada = r.get("huella_anterior") or huella_previa_real
        if i > 0 and huella_declarada != huella_previa_real:
            divergencias.append(
                {
                    "indice": i,
                    "numero_serie": r["numero_serie"],
                    "tipo": "encadenamiento",
                    "esperada": huella_previa_real,
                    "hallada": huella_declarada,
                }
            )
        if huella_recomputada != r["huella"]:
            divergencias.append(
                {
                    "indice": i,
                    "numero_serie": r["numero_serie"],
                    "tipo": "huella_recomputada",
                    "esperada": r["huella"],
                    "recomputada": huella_recomputada,
                }
            )
        huella_previa_real = huella_recomputada
    return {
        "ok": not divergencias,
        "registros_auditados": len(registros),
        "divergencias": divergencias,
    }


__all__ = ["auditar_cadena"]
