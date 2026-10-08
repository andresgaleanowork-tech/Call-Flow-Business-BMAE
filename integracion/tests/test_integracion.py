# -*- coding: utf-8 -*-
"""
A5 · tests de integración GitOps con transporte EN MEMORIA (cero red):
idempotencia, dedup NIF/CIF+CUPS, resolución por timestamp ISO UTC,
provisión opportunity-won y auditoría de cadena VeriFactu.
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from decimal import Decimal

from bmae_verifactu import nueva_huella
from bmae_integracion import (
    ErpnextCliente,
    auditar_cadena,
    dedup,
    gana,
    plan_sync,
    provisionar,
    validar_filas,
)


# ---------------------------------------------------------------------------
# Transporte falso en memoria (cero red; ver §15.2 del Prompt Maestro)
# ---------------------------------------------------------------------------


class TransporteMemoria:
    def __init__(self):
        self.docs = {}      # nombre -> doc
        self.sec = 0
        self.rutas_patch = []

    def __call__(self, metodo, url, cabeceras, json=None):
        if metodo == "GET":
            # /api/resource/<DocType>?filters=[["DocType","clave","=","valor"]]&fields=["name"]
            import re as _re
            tipo = _re.search(r"/resource/([^?]+)\?", url).group(1)
            clave_m = _re.search(r'"=","([^"]+)"\]\]', url)
            valor = clave_m.group(1) if clave_m else None
            hallados = [
                {"name": n} for n, d in self.docs.items()
                if d.get("doctype") == tipo and (valor is None or valor in str(d.values()))
            ]
            return 200, {"data": hallados}
        if metodo == "POST":
            self.sec += 1
            nombre = json.get("name") or f"{json['doctype'].replace(' ', '-')}-{self.sec:04d}"
            json = dict(json, name=nombre)
            self.docs[nombre] = json
            return 200, {"data": json}
        if metodo == "PATCH":
            nombre = url.rsplit("/", 1)[-1]
            self.docs[nombre].update(json or {})
            self.rutas_patch.append(url)
            return 200, {"data": self.docs[nombre]}
        return 405, {}


def R(nif, cups, modified, extra=None):
    d = {"nif": nif, "cups": cups, "modified": modified, "nombre": nif}
    if extra:
        d.update(extra)
    return d


# ---------------------------------------------------------------------------
# sync.py (núcleo puro)
# ---------------------------------------------------------------------------


def test_dedup_gana_el_mas_fresco():
    viejos = [R("A1", "C1", "2026-01-01T10:00:00Z"),
              R("A1", "C1", "2026-01-02T10:00:00Z", {"tlf": "600"})]
    out = dedup(viejos)
    assert len(out) == 1 and out[0].get("tlf") == "600"


def test_dedup_por_nif_cups_compuesta():
    regs = [R("A1", "C1", "2026-01-01T10:00:00Z"),
            R("A1", "C2", "2026-01-01T10:00:00Z"),
            R("B1", "C1", "2026-01-01T10:00:00Z")]
    assert len(dedup(regs)) == 3


def test_gana_por_timestamp_y_desempate_por_completitud():
    a = R("A", "C", "2026-01-02T00:00:00Z")
    b = R("A", "C", "2026-01-01T00:00:00Z", {"x": 1})
    assert gana(a, b) is a
    a2 = R("A", "C", "2026-01-01T00:00:00Z")
    b2 = R("A", "C", "2026-01-01T00:00:00Z", {"x": 1})
    assert gana(a2, b2) is b2


def test_plan_bidireccional_completo():
    tw = [R("A1", "C1", "2026-02-01T00:00:00Z"),
          R("B2", "C2", "2026-01-01T00:00:00Z", {"solo_en_tw": 1})]
    erp = [R("A1", "C1", "2026-01-01T00:00:00Z"),
           R("C3", "C3", "2026-01-01T00:00:00Z")]
    plan = plan_sync(tw, erp)
    assert len(plan.actualizar_en_erp) == 1       # A1 gana Twenty (más fresco)
    assert len(plan.crear_en_erp) == 1            # B2 solo en Twenty
    assert len(plan.crear_en_twenty) == 1         # C3 solo en ERPNext


def test_plan_idempotente_a_la_segunda():
    regs = [R("A1", "C1", "2026-02-01T00:00:00Z")]
    p1 = plan_sync(regs, [])
    assert p1.crear_en_erp
    p2 = plan_sync(regs, regs)  # tras aplicar, ambos lados iguales
    assert p2.es_idempotente_vacio and len(p2.sin_cambio) == 1


# ---------------------------------------------------------------------------
# provision.py (opportunity-won)
# ---------------------------------------------------------------------------


def _erp_mem():
    return ErpnextCliente("https://erp.local", {"Authorization": "token x"},
                          transporte=TransporteMemoria())


def test_provisionar_crea_las_3_piezas():
    erp = _erp_mem()
    op = {
        "id": "opp-77", "nombre_cliente": "Hotel Mirador SL", "nif": "B46000001",
        "fecha_cierre": "2026-10-07", "es_epc": True,
        "lineas": [{"codigo": "SRV-EPMS", "cantidad": 1, "precio": "4800.00"}],
    }
    inf = provisionar(op, erp)
    pasos = {p["paso"]: p["nombre"] for p in inf["pasos"]}
    assert pasos["customer"].startswith("Customer-")
    assert pasos["sales_order"].startswith("Sales-Order-")
    assert pasos["project"].startswith("Project-")
    assert inf["resultado"] == "ok"


def test_provisionar_es_idempotente_en_replay():
    erp = _erp_mem()
    op = {"id": "opp-78", "nombre_cliente": "Frutería Puerto", "nif": "B46666002",
          "fecha_cierre": "2026-10-07", "es_epc": False, "lineas": []}
    provisionar(op, erp)
    n_docs = len(erp.transporte.docs)
    provisionar(op, erp)  # replay del mismo dispatch
    assert len(erp.transporte.docs) == n_docs  # CERO duplicados


def test_provision_sin_epc_no_crea_proyecto():
    erp = _erp_mem()
    op = {"id": "opp-79", "nombre_cliente": "Bar Canario", "nif": "B38333003",
          "fecha_cierre": "2026-10-07", "es_epc": False, "lineas": []}
    inf = provisionar(op, erp)
    pasos = {p["paso"]: p["nombre"] for p in inf["pasos"]}
    assert pasos["project"] is None


# ---------------------------------------------------------------------------
# audit.py (cadena VeriFactu)
# ---------------------------------------------------------------------------


def _registros(n=3, base=None):
    base = base or {}
    regs = []
    anterior = base.get("huella_inicial", "")
    tz = timezone(timedelta(hours=2))
    for i in range(1, n + 1):
        instante = datetime(2026, 10, i, 10, 0, 0, tzinfo=tz)
        h = nueva_huella("B87654321", f"2026/{i:04d}", f"0{i}-10-2026", "F1",
                         Decimal("21.00"), Decimal("121.00"), anterior, instante)
        regs.append({
            "nif": "B87654321", "numero_serie": f"2026/{i:04d}",
            "fecha_expedicion": f"0{i}-10-2026", "tipo_factura": "F1",
            "cuota_total": "21.00", "importe_total": "121.00",
            "huella": h, "fecha_hora_huso": instante.isoformat(timespec="seconds"),
            "huella_anterior": anterior,
        })
        anterior = h
    return regs


def test_cadena_integra_pasa():
    inf = auditar_cadena(_registros(5))
    assert inf["ok"] and inf["registros_auditados"] == 5 and not inf["divergencias"]


def test_huella_manipulada_rompe_cadena():
    regs = _registros(3)
    regs[1]["importe_total"] = "999.00"   # mano negra
    inf = auditar_cadena(regs)
    assert not inf["ok"]
    tipos = {d["tipo"] for d in inf["divergencias"]}
    assert "huella_recomputada" in tipos


def test_registro_intercalado_rompe_encadenamiento():
    regs = _registros(3)
    # simula alguien que borra el 2º y rehace el 3º apuntando al 1º
    del regs[1]
    inf = auditar_cadena(regs)
    assert not inf["ok"]


# ---------------------------------------------------------------------------
# catalogo.py (validación Pydantic de Excel)
# ---------------------------------------------------------------------------


def test_catalogo_acepta_fijas_validas():
    filas = [
        {"id_oferta": "O1", "nombre": "Fija", "peaje": "2.0TD", "modalidad": "fija",
         "precio_potencia": [40, 40], "precio_energia": ["0.15", "0.12"]},
        {"id_oferta": "O2", "nombre": "Indexada", "peaje": "3.0TD", "modalidad": "indexada",
         "precio_potencia": [10] * 6, "precio_market": ["0.08"] * 6,
         "costes_comercializacion": ["0.004"] * 6, "perdidas": ["0.01"] * 6,
         "margen": "0.05", "peajes_energia": ["0.02"] * 6, "cargos_energia": ["0.02"] * 6},
    ]
    ok, ko = validar_filas(filas)
    assert len(ok) == 2 and ko == []


def test_catalogo_rechaza_con_diagnostico_de_fila():
    filas = [
        {"id_oferta": "O1", "nombre": "Fija", "peaje": "2.0TD", "modalidad": "fija",
         "precio_potencia": [40, 40], "precio_energia": ["0.15", "0.12"]},
        {"id_oferta": "O2", "nombre": "Rota", "peaje": "2.0TD", "modalidad": "fija",
         "precio_potencia": [40], "precio_energia": ["0.15"]},  # vector corto
    ]
    ok, ko = validar_filas(filas)
    assert len(ok) == 1 and len(ko) == 1
    assert ko[0]["fila"] == 3 and "precio_potencia" in ko[0]["error"]
