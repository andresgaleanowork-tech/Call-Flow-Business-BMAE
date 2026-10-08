# -*- coding: utf-8 -*-
"""
provision.py — opportunity-won: Customer (cuenta 430 PGC) + Sales Order +
Project en ERPNext, TODO por UPSERT idempotente (§7.2 Prompt Maestro).

La idempotencia se ancla en campos espejo:
  Customer.twenty_id = id oportunidad/cliente Twenty
  Sales Order.twenty_oportunidad_id · Project.twenty_oportunidad_id
Re-ejecutar el mismo dispatch re-lee y NO duplica.
"""

from __future__ import annotations


def provisionar(oportunidad: dict, erp, informe: dict | None = None) -> dict:
    """erp: cliente con upsert(doc_type, filtros, doc) -> nombre creado/hallado.

    Devuelve el informe de provisión (sirve de artefacto del workflow).
    """

    op_id = oportunidad["id"]
    informe = informe if informe is not None else {}
    informe["oportunidad"] = op_id
    informe["pasos"] = []

    # 1 · Customer con cuenta deudora 430 (PGC 2007) — dedup por NIF/ERP id
    customer_doc = {
        "doctype": "Customer",
        "customer_name": oportunidad["nombre_cliente"],
        "customer_type": "Company",
        "tax_id": oportunidad.get("nif", ""),
        "twenty_id": op_id,
        "default_receivable_account": "430.0000.00 Clientes",
    }
    nombre_cliente = erp.upsert(
        "Customer",
        filtros={"twenty_id": op_id},
        doc=customer_doc,
    )
    informe["pasos"].append({"paso": "customer", "nombre": nombre_cliente})

    # 2 · Sales Order: una por oportunidad ganada (idempotente por twenty_oportunidad_id)
    lineas = [
        {
            "item_code": l["codigo"], "qty": l["cantidad"], "rate": l["precio"],
            "description": l.get("concepto", ""),
        }
        for l in oportunidad.get("lineas", [])
    ]
    so_doc = {
        "doctype": "Sales Order",
        "customer": nombre_cliente,
        "twenty_oportunidad_id": op_id,
        "transaction_date": oportunidad["fecha_cierre"],
        "items": lineas,
    }
    nombre_so = erp.upsert(
        "Sales Order",
        filtros={"twenty_oportunidad_id": op_id},
        doc=so_doc,
    )
    informe["pasos"].append({"paso": "sales_order", "nombre": nombre_so})

    # 3 · Project (EPC fotovoltaico/VE/BESS si la línea lo declara)
    proyecto = None
    if oportunidad.get("es_epc"):
        prj_doc = {
            "doctype": "Project",
            "project_name": f"EPC {op_id} — {oportunidad['nombre_cliente']}",
            "customer": nombre_cliente,
            "twenty_oportunidad_id": op_id,
            "status": "Open",
        }
        proyecto = erp.upsert(
            "Project",
            filtros={"twenty_oportunidad_id": op_id},
            doc=prj_doc,
        )
    informe["pasos"].append({"paso": "project", "nombre": proyecto})

    informe["resultado"] = "ok"
    return informe


__all__ = ["provisionar"]
