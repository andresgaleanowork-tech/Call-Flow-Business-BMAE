# -*- coding: utf-8 -*-
"""
hash_chain.py — Huella SHA-256 encadenada VeriFactu (Orden HAC/1177/2024).

Fórmula del Prompt Maestro §6.2:
  Hash_n = SHA256(NIF + NumFactura + FechaExp + TipoFactura + Cuota +
                  Importe + HuellaAnterior + FechaHoraHuso)

Decisión D-V1: el serializado de campos usa el formato de la SIF AEAT
(«Campo=Valor&Campo=Valor…») con los nombres exactos del esquema
RegistroFacturacionAlta, para poder cruzarse con la huella del XSD oficial
sin una segunda ordenación propia. Salida en HEXADECIMAL MAYÚSCULAS
(exigencia AEAT del campo «Huella»).

Inmutabilidad: cada registro encadena con la huella del registro INMEDIATO
anterior del mismo NIF; la primera factura usa cadena vacía. Esto hace la
cadena inviolable: reeditar una factura rompe todas las siguientes.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


def _eur(x) -> str:
    """Importe con 2 decimales y punto decimal, sin separador de miles
    (formato exigido en el esquema: «0.00»)."""

    return f"{Decimal(str(x)).quantize(Decimal('0.01')):f}"


@dataclass(frozen=True)
class RegistroHuella:
    nif: str
    numero_serie: str
    fecha_expedicion: str          # «DD-MM-YYYY»
    tipo_factura: str              # «F1», «F2», «R1»…
    cuota_total: str               # «0.00»
    importe_total: str             # «0.00»
    huella_anterior: str           # HEX mayúsculas o «» (primer registro)
    fecha_hora_huso: str           # ISO 8601 con huso: «2026-10-07T13:45:00+02:00»

    def texto_base(self) -> str:
        """Campos AEAT unidos por «&» en el orden contractual de §6.2."""

        return "&".join(
            [
                f"NIF={self.nif}",
                f"NumSerieFactura={self.numero_serie}",
                f"FechaExpedicionFactura={self.fecha_expedicion}",
                f"TipoFactura={self.tipo_factura}",
                f"CuotaTotal={self.cuota_total}",
                f"ImporteTotal={self.importe_total}",
                f"Huella={self.huella_anterior}",
                f"FechaHoraHusoGenRegistro={self.fecha_hora_huso}",
            ]
        )

    def huella(self) -> str:
        return (
            hashlib.sha256(self.texto_base().encode("utf-8")).hexdigest().upper()
        )


def nueva_huella(
    nif: str,
    numero_serie: str,
    fecha_expedicion: str,
    tipo_factura: str,
    cuota_total,
    importe_total,
    huella_anterior: str = "",
    instante: datetime | None = None,
) -> str:
    """Atajo de un solo uso: crea el registro y devuelve su huella."""

    if instante is None:
        instante = datetime.now().astimezone()
    reg = RegistroHuella(
        nif=nif,
        numero_serie=numero_serie,
        fecha_expedicion=fecha_expedicion,
        tipo_factura=tipo_factura,
        cuota_total=_eur(cuota_total),
        importe_total=_eur(importe_total),
        huella_anterior=huella_anterior,
        fecha_hora_huso=instante.isoformat(timespec="seconds"),
    )
    return reg.huella()


__all__ = ["RegistroHuella", "nueva_huella"]
