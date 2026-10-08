# -*- coding: utf-8 -*-
"""
clientes.py — Clientes HTTP ultradelgados para Twenty y ERPNext con
reintentos tenacidad (backoff exponencial, §15.2 Prompt Maestro:
«resistencia a fallos de red con Exponential Backoff»).

Transport inyectable: los tests pasan un transporte falso en memoria y NO
hace falta red; en producción los workflows lo crean con `requests`.
"""

from __future__ import annotations

from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential


class ErrorUpstream(Exception):
    """Fallo de red/5xx persistido tras reintentos."""


class HttpCliente:
    """Cliente mínimo GET/POST/PATCH con upsert idempotente."""

    def __init__(self, base_url: str, cabeceras: dict, transporte=None):
        self.base_url = base_url.rstrip("/")
        self.cabeceras = cabeceras
        self.transporte = transporte  # callable(metodo, url, cabeceras, json) -> (status, payload)
        if self.transporte is None:
            import requests

            sesion = requests.Session()

            def transporte_real(metodo, url, cabeceras, json=None):
                r = sesion.request(metodo, url, headers=cabeceras, json=json, timeout=30)
                if r.status_code >= 500:
                    raise ErrorUpstream(f"{r.status_code} de {url}")
                return r.status_code, r.json()

            self.transporte = transporte_real

    @retry(
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=0.5, min=1, max=8),
        retry=retry_if_exception_type(ErrorUpstream),
        reraise=True,
    )
    def _llamar(self, metodo: str, ruta: str, **kw):
        status, payload = self.transporte(
            metodo, f"{self.base_url}{ruta}", self.cabeceras, kw.get("json")
        )
        if status >= 400:
            raise ErrorUpstream(f"{metodo} {ruta} → {status}: {str(payload)[:200]}")
        return payload

    def leer(self, ruta: str):
        return self._llamar("GET", ruta)

    def escribir(self, ruta: str, doc: dict):
        return self._llamar("POST", ruta, json=doc)

    def actualizar(self, ruta: str, doc: dict):
        return self._llamar("PATCH", ruta, json=doc)


class ErpnextCliente(HttpCliente):
    """Frappe API con upsert por filtros (idempotencia anclada en campos)."""

    def upsert(self, doc_type: str, filtros: dict, doc: dict) -> str:
        """Devuelve el `name` del documento creado o YA EXISTENTE (idempotente)."""

        args = "&".join(f'filters=[["{doc_type}","{k}","=","{v}"]]' for k, v in filtros.items())
        hallado = self.leer(f"/api/resource/{doc_type}?{args}&fields=[\"name\"]")
        datos = hallado.get("data", [])
        if datos:
            return datos[0]["name"]
        creado = self.escribir(f"/api/resource/{doc_type}", doc)
        return creado["data"]["name"]


class TwentyCliente(HttpCliente):
    """Twenty GraphQL/REST mínimo (create/update por id externo)."""

    def upsert_objeto(self, tipo: str, clave_externa: str, doc: dict) -> str:
        ruta = f"/rest/{tipo}?filter=externalId[eq]:{clave_externa}"
        hallado = self.leer(ruta)
        datos = hallado.get("data", {}).get(tipo, [])
        if datos:
            return datos[0]["id"]
        creado = self.escribir(f"/rest/{tipo}", {**doc, "externalId": clave_externa})
        return creado["data"]["id"]


__all__ = ["HttpCliente", "ErpnextCliente", "TwentyCliente", "ErrorUpstream"]
