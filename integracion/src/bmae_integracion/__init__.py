# -*- coding: utf-8 -*-
"""bmae_integracion — Lógica de sincronización y auditoría GitOps (Bloque A5).

Lógica pura testeable (sync/provision/audit/catalogo) + clientes HTTP
con backoff (clientes). Los CLIs viven en integracion/scripts/.
"""

from .audit import auditar_cadena
from .catalogo import validar_filas
from .clientes import ErpnextCliente, ErrorUpstream, HttpCliente, TwentyCliente
from .provision import provisionar
from .sync import PlanSync, clave_identidad, dedup, gana, plan_sync

__version__ = "0.1.0"

__all__ = [
    "PlanSync",
    "clave_identidad",
    "dedup",
    "gana",
    "plan_sync",
    "provisionar",
    "auditar_cadena",
    "validar_filas",
    "HttpCliente",
    "ErpnextCliente",
    "TwentyCliente",
    "ErrorUpstream",
    "__version__",
]
