# -*- coding: utf-8 -*-
"""
qr.py — URL de cotejo del QR normativo VeriFactu (ticket/factura impresa).

La URL oficial incrusta los datos identificativos de la factura para su
contrastación ante la AEAT («QR de cotejo», Orden HAC/1177/2024 TPVA/…).
Producción y preproducción usan hosts distintos: aquí parametrizados
sin hardcodear secretos ni certificados (eso vive en ERPNext como DocType
de configuración, con certificado X.509 en el propio servidor VPS — nunca
en el repositorio, §2 contención GitHub-first).
"""

from __future__ import annotations

from decimal import Decimal
from urllib.parse import urlencode

HOSTS = {
    "produccion": "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR",
    "preproduccion": "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR",
}


def url_cotejo(
    nif: str,
    numero_serie: str,
    fecha_expedicion: str,  # «DD-MM-YYYY»
    importe_total,
    entorno: str = "preproduccion",
) -> str:
    if entorno not in HOSTS:
        raise ValueError(f"entorno desconocido: {entorno}")
    total = f"{Decimal(str(importe_total)).quantize(Decimal('0.01')):f}"
    query = urlencode(
        {
            "nif": nif,
            "numserie": numero_serie,
            "fecha": fecha_expedicion,
            "importe": total,
        }
    )
    return f"{HOSTS[entorno]}?{query}"


__all__ = ["url_cotejo", "HOSTS"]
