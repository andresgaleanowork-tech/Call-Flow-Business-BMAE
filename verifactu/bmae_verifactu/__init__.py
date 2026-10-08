# -*- coding: utf-8 -*-
"""bmae_verifactu — Módulo VeriFactu (Orden HAC/1177/2024) para ERPNext.

Piezas: huella SHA-256 encadenada (hash_chain), XML
RegistroFacturacionAlta (registro_alta) y QR de cotejo AEAT (qr).
El envío por WebService con certificado X.509 vive en la custom app
Frappe (bmae-erpnext-app): este paquete es el núcleo puro y testable.
"""

from .hash_chain import RegistroHuella, nueva_huella
from .qr import HOSTS, url_cotejo
from .registro_alta import Emisor, Factura, registro_alta_xml

__version__ = "0.1.0"

__all__ = [
    "RegistroHuella",
    "nueva_huella",
    "Emisor",
    "Factura",
    "registro_alta_xml",
    "url_cotejo",
    "HOSTS",
    "__version__",
]
