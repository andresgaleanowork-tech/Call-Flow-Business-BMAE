# -*- coding: utf-8 -*-
"""
registro_alta.py — XML «RegistroFacturacionAlta» (schema SIF AEAT) para el
módulo VeriFactu de ERPNext (extensión de Sales Invoice, §6.2.4).

Sin librerías externas: xml.etree escapa atributos por defecto y garantiza
UTF-8. El namespace es el declarado por la AEAT para el sistema VeriFactu
(«sum» = SuministroLR). Versión 1.0 del esquema.
"""

from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass
from decimal import Decimal

NS_SUM = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd"
NS_SI = "https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd"

ET.register_namespace("sum", NS_SUM)
ET.register_namespace("sum1", NS_SI)


@dataclass(frozen=True)
class Emisor:
    nombre_razon: str
    nif: str


@dataclass(frozen=True)
class Factura:
    numero_serie: str
    fecha_expedicion: str  # «DD-MM-YYYY»
    tipo_factura: str      # «F1»…
    descripcion: str
    cuota_total: Decimal
    importe_total: Decimal
    huella_anterior: str
    huella: str
    fecha_hora_huso: str


def _eur(x) -> str:
    return f"{Decimal(str(x)).quantize(Decimal('0.01')):f}"


def registro_alta_xml(
    emisor: Emisor,
    factura: Factura,
    sistema_nombre: str = "BMAE-ERPNext",
    sistema_version: str = "15.0",
) -> str:
    """Genera el <RegistroFacturacionAlta> listo para enrolar en el
    LRVotaInformaticoSIF del WebService de producción/preal."""

    raiz = ET.Element(f"{{{NS_SUM}}}RegistroFacturacionAlta")
    idf = ET.SubElement(raiz, "IDFactura")
    ET.SubElement(idf, "IDEmisorFactura").text = emisor.nif
    ET.SubElement(idf, "NumSerieFactura").text = factura.numero_serie
    ET.SubElement(idf, "FechaExpedicionFactura").text = factura.fecha_expedicion

    ET.SubElement(raiz, "NombreRazonEmisor").text = emisor.nombre_razon
    ET.SubElement(raiz, "TipoFactura").text = factura.tipo_factura
    ET.SubElement(raiz, "DescripcionOperacion").text = factura.descripcion[:500]
    ET.SubElement(raiz, "CuotaTotal").text = _eur(factura.cuota_total)
    ET.SubElement(raiz, "ImporteTotal").text = _eur(factura.importe_total)

    enc = ET.SubElement(raiz, "Encadenamiento")
    if factura.huella_anterior:
        prim = ET.SubElement(enc, "RegistroAnterior")
        ET.SubElement(prim, "Huella").text = factura.huella_anterior
    else:
        ET.SubElement(enc, "PrimerRegistro").text = "S"

    sis = ET.SubElement(raiz, "SistemaInformatico")
    ET.SubElement(sis, "NombreRazon").text = emisor.nombre_razon
    ET.SubElement(sis, "NIF").text = emisor.nif
    ET.SubElement(sis, "NombreSistemaInformatico").text = sistema_nombre
    ET.SubElement(sis, "IdSistemaInformatico").text = "77"
    ET.SubElement(sis, "Version").text = sistema_version
    ET.SubElement(sis, "NumeroInstalacion").text = "001"

    ET.SubElement(raiz, "FechaHoraHusoGenRegistro").text = factura.fecha_hora_huso
    ET.SubElement(raiz, "TipoHuella").text = "01"  # SHA-256
    ET.SubElement(raiz, "Huella").text = factura.huella

    return ET.tostring(raiz, encoding="unicode")


__all__ = ["Emisor", "Factura", "registro_alta_xml", "NS_SUM"]
