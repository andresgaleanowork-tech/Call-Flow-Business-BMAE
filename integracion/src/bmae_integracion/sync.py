# -*- coding: utf-8 -*-
"""
sync.py — Núcleo PURO (sin HTTP) de la sincronización Twenty ⇄ ERPNext.

Reglas contractuales (§7.1 Prompt Maestro):
  · Dedup por NIF/CIF + CUPS (identidad compuesta).
  · Concurrencia optimista: última escritura gana por `modified`
    ISO 8601 UTC; empate → gana la que trae más datos (más campos no
    vacíos); empate total → empate declarado (no duplica).
  · Idempotencia: ejecutar dos veces el mismo plan produce cero
    escrituras la segunda vez.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


def _ts(x: str) -> datetime:
    """ISO 8601 tolerante; sin tz → UTC (no inventamos huso)."""

    d = datetime.fromisoformat(x.replace("Z", "+00:00"))
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d


def clave_identidad(reg: dict) -> tuple:
    """NIF/CIF normalizado + CUPS normalizado (vacío CUPS = «Sin CUPS»)."""

    nif = str(reg.get("nif", "") or "").strip().upper().replace(" ", "")
    cups = str(reg.get("cups", "") or "").strip().upper()
    return (nif, cups)


def dedup(registros: list) -> list:
    """Compacta duplicados por identidad: gana el `modified` mayor."""

    elegidos: dict = {}
    for r in registros:
        k = clave_identidad(r)
        if k not in elegidos or _ts(r["modified"]) > _ts(elegidos[k]["modified"]):
            elegidos[k] = r
    return [elegidos[k] for k in sorted(elegidos)]


def gana(uno: dict, otro: dict) -> dict:
    """Resolución determinista entre dos versiones del mismo registro."""

    t1, t2 = _ts(uno["modified"]), _ts(otro["modified"])
    if t1 != t2:
        return uno if t1 > t2 else otro
    no_vacios = lambda r: sum(1 for v in r.values() if v not in (None, "", [], {}))
    return uno if no_vacios(uno) >= no_vacios(otro) else otro


@dataclass
class PlanSync:
    """Acciones mínimas y reversibles (informadas al informe/DLQ)."""

    crear_en_erp: list = field(default_factory=list)
    actualizar_en_erp: list = field(default_factory=list)
    crear_en_twenty: list = field(default_factory=list)
    actualizar_en_twenty: list = field(default_factory=list)
    sin_cambio: list = field(default_factory=list)

    @property
    def es_idempotente_vacio(self) -> bool:
        return not (
            self.crear_en_erp
            or self.actualizar_en_erp
            or self.crear_en_twenty
            or self.actualizar_en_twenty
        )


def plan_sync(desde_twenty: list, desde_erp: list) -> PlanSync:
    """Cruce deduplicado de ambos mundos (bidireccional estricto)."""

    tw = {clave_identidad(r): r for r in dedup(desde_twenty)}
    erp = {clave_identidad(r): r for r in dedup(desde_erp)}
    plan = PlanSync()
    for k in sorted(set(tw) | set(erp)):
        a, b = tw.get(k), erp.get(k)
        if a is not None and b is None:
            plan.crear_en_erp.append(a)
        elif a is None and b is not None:
            plan.crear_en_twenty.append(b)
        else:
            if _ts(a["modified"]) == _ts(b["modified"]):
                plan.sin_cambio.append(a)
                continue
            mejor = gana(a, b)
            if mejor is a:
                plan.actualizar_en_erp.append(a)
            else:
                plan.actualizar_en_twenty.append(b)
    return plan


__all__ = ["PlanSync", "clave_identidad", "dedup", "gana", "plan_sync"]
