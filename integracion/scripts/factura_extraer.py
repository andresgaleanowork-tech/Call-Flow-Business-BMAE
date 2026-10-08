#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extractor de consumos reales de facturas de luz (A2, calibrado 08-oct-2026).

v2 con 5 facturas reales del usuario (3 legibles + 2 no):
  · CUPS con espacios (Iberdrola: «ES 0021 0000 1181 9574 FD») → normalizado.
  · Consumo con decimales («9.799,11 kWh» Apolo / «326,42 kWh» Iberdrola) y
    «Consumo Firmado … kWh/Año» (anual directo para la comparativa).
  · Potencia multi-periodo: «Pot. P1 (kW) 17,00 … P6» / «P1:10,000 … P6:19,800»
    (Energía Libre) → máximo contratado; «Potencia punta: 5,75 kW» residencial.
  · Importe por prioridad estricta (jamás «subtotal» suelto).
  · PDFs escaneados o de glifos mapeados (/47 /58 …) → declarado de forma
    honesta: confianza baja + camino manual, NUNCA números inventados.

    python integracion/scripts/factura_extraer.py --texto pega.txt
    python integracion/scripts/factura_extraer.py --pdf factura.pdf --informe out.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

_R_CONFIG = Path(__file__).resolve().parents[2] / "datos/tarifario/formatos-comercializadoras.json"
RE_COMMA = re.compile(r"^([0-9]{1,3}(?:\.[0-9]{3})*|[0-9]+)(?:,([0-9]+))?$")
RE_GLIFO = re.compile(r"(\s|^)/\d{1,3}(\s|$)")  # PDFs de glifos mapeados


def cargar_config(ruta: Path = _R_CONFIG) -> dict:
    return json.loads(ruta.read_text(encoding="utf-8"))


def _num_es(txt: str) -> float | None:
    m = RE_COMMA.match(str(txt).strip())
    if not m:
        return None
    enteros = m.group(1).replace(".", "")
    try:
        return round(float(f"{enteros}.{m.group(2) or '0'}"), 2)
    except ValueError:
        return None


def _primer_match(patron_o_lista, texto, flags=re.I, flags_extra=0):
    patrones = patron_o_lista if isinstance(patron_o_lista, list) else [patron_o_lista]
    for rx in patrones:
        m = re.search(rx, texto, flags | flags_extra)
        if m:
            return m
    return None


def detectar_comercializadora(texto: str, fmt: dict) -> str | None:
    bajo = texto.lower()
    for ident in fmt.get("identificadores", []):
        if any(p.lower() in bajo for p in ident.get("pistas", [])):
            return ident["nombre"]
    return None


def legible_por_maquina(texto: str) -> tuple[bool, str | None]:
    """Declara los dos casos ya observados en las muestras reales (08-oct)."""
    if len(texto.strip()) < 40:
        return False, "escaneado o sin capa de texto (imagen)"
    lineas = [l for l in texto.splitlines() if l.strip()][:30]
    con_glifos = sum(1 for l in lineas if RE_GLIFO.search(l))
    if lineas and con_glifos >= max(3, len(lineas) // 2):
        return False, "glifos mapeados (/47 /58 …) sin tabla de texto"
    return True, None


def extraer_campos(texto: str, fmt: dict) -> dict:
    pat = fmt["patrones_campo"]
    salida = {}

    legible, motivo = legible_por_maquina(texto)
    salida["legible_por_maquina"] = legible
    salida["motivo_no_legible"] = motivo

    # CUPS: con o sin espacios → SIEMPRE normalizado sin espacios
    m = _primer_match(pat["cups"], texto)
    cups = re.sub(r"\s+", "", m.group(0)).upper() if m else None
    if cups and not re.match(r"^ES\d{16}", cups):
        m2 = _primer_match(pat.get("cups_compacto", pat["cups"]), texto)
        cups = re.sub(r"\s+", "", m2.group(0)).upper() if m2 else cups
    salida["cups"] = cups

    # consumo del periodo (con decimales tipo «9.799,11 kWh»)
    m = _primer_match(pat["consumo_kwh_total"] if isinstance(pat["consumo_kwh_total"], list) else [pat["consumo_kwh_total"]], texto)
    salida["consumo_kwh_total"] = _num_es(m.group(1)) if m else None

    # consumo anual firmado para la comparativa («kWh/Año»)
    if pat.get("consumo_anual_kwh"):
        m = re.search(pat["consumo_anual_kwh"], texto, re.I)
        salida["consumo_anual_kwh"] = _num_es(m.group(1)) if m else None
    else:
        salida["consumo_anual_kwh"] = None

    # potencia: máximo de los periodos P1..P6 si cabecera multi-periodo,
    # si no «potencia punta» residencial / patrón genérico
    rxs = pat.get("potencia_p_max", [])
    if isinstance(rxs, str):
        rxs = [rxs]
    potencias = []
    for rx in rxs:
        potencias += [_num_es(g[1]) for g in re.findall(rx, texto, re.M)]
    potencias = [p for p in potencias if p]
    if len(potencias) >= 2:
        salida["potencia_kw"] = round(max(potencias), 2)
    else:
        m = _primer_match(pat["potencia_kw"], texto)
        salida["potencia_kw"] = _num_es(m.group(1)) if m else None

    # consumo multi-periodo: facturas con líneas «N kWh x 0,… €/kWh» (p.ej.
    # Energía Libre 6.1TD): el «total» genérico atrapa sólo un periodo.
    # Regla honesta: suma de valores únicos en orden si hay ≥3 líneas.
    if len(potencias) >= 2 and pat.get("consumo_kwh_x_euro"):
        crudos = re.findall(pat["consumo_kwh_x_euro"], texto)
        unicos = list(dict.fromkeys(crudos))
        if len(unicos) >= 3:
            suma = sum(int(x) for x in unicos)
            actual = salida.get("consumo_kwh_total")
            if actual is None or actual <= max(int(x) for x in unicos):
                salida["consumo_kwh_total"] = float(suma)

    # fechas
    m = _primer_match(pat["fecha_desde"], texto)
    salida["fecha_desde"] = m.group(1) if m else None
    m = _primer_match(pat["fecha_hasta"], texto)
    salida["fecha_hasta"] = m.group(1) if m else None

    # importe: prioridad ESCRITA en el propio config
    importe = None
    for rx in pat["importe_total"]:
        m = re.search(rx, texto, re.I | re.M)
        if m:
            importe = _num_es(m.group(1))
            break
    salida["importe_total"] = importe

    salida["comercializadora"] = detectar_comercializadora(texto, fmt)
    return salida


def informar(campos: dict, origen: str) -> dict:
    if campos.get("legible_por_maquina") is False:
        confianza = "baja"
    else:
        encontrados = sum(
            1 for k in ("cups", "consumo_kwh_total", "potencia_kw",
                        "fecha_desde", "fecha_hasta", "importe_total",
                        "comercializadora", "consumo_anual_kwh")
            if campos.get(k) is not None
        )
        confianza = "alta" if encontrados >= 5 else "media" if encontrados >= 3 else "baja"
    return {
        "origen": origen,
        "confianza": confianza,
        "campos": campos,
        "camino_manual_recomendado": confianza == "baja",
    }


def texto_desde_pdf(ruta: Path) -> str:
    try:
        import pypdf
    except ImportError:
        raise SystemExit("✗ pypdf no está instalado (pip install pypdf) — mientras tanto usa --texto con el contenido pegado de la factura (camino manual heredado)")
    texto = []
    with open(ruta, "rb") as f:
        lector = pypdf.PdfReader(f)
        for pagina in lector.pages:
            texto.append(pagina.extract_text() or "")
    return "\n".join(texto)


def main() -> int:
    ap = argparse.ArgumentParser()
    grupo = ap.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--texto", help="fichero con el texto pegado de la factura (camino manual amable)")
    grupo.add_argument("--pdf", help="factura PDF directa (requiere pypdf)")
    ap.add_argument("--config", default=str(_R_CONFIG))
    ap.add_argument("--informe", default="/tmp/factura-extraida.json")
    a = ap.parse_args()

    if a.texto:
        if not Path(a.texto).exists():
            print(f"✗ no existe {a.texto}", file=sys.stderr)
            return 2
        texto = Path(a.texto).read_text(encoding="utf-8", errors="replace")
        origen = f"texto:{Path(a.texto).name}"
    else:
        if not Path(a.pdf).exists():
            print(f"✗ no existe {a.pdf}", file=sys.stderr)
            return 2
        texto = texto_desde_pdf(Path(a.pdf))
        origen = f"pdf:{Path(a.pdf).name}"

    fmt = cargar_config(Path(a.config))
    inf = informar(extraer_campos(texto, fmt), origen)
    Path(a.informe).write_text(json.dumps(inf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(inf, ensure_ascii=False, indent=2))
    if inf["camino_manual_recomendado"]:
        motivo = inf["campos"].get("motivo_no_legible")
        extra = f" ({motivo})" if motivo else ""
        print(f"⚠ Confianza baja{extra}: completa los campos a mano (la captación permite el camino manual, T6).", file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
