#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera un albarán (documento comercial SIN valor fiscal) y lo registra.

Mientras el certificado AEAT está pendiente (F4G·w1), la operativa diaria va
con albaranes: numerados, honrados y con su huella de integridad SHA-256
(declarada NO fiscal — no es la cadena VeriFactu; esa llega con el cert).
La entrada llega como issue `albaran:crear` con JSON (la guardía anti-PII
también manda aquí); el bot commitea libro + PDF.

    python integracion/scripts/albaran_crear.py --entrada /tmp/albaran.json \
        --libro datos/albaranes/albaranes.json --pdf-dir datos/albaranes/pdf \
        --informe /tmp/albaran-informe.json

Contrato de entrada:
    {"cliente_ref": "ref. sin PII (p. ej. #87)", "fecha": "YYYY-MM-DD" (opc.),
     "lineas": [{"descripcion": "…", "cantidad": 2, "precio": 240.00}]}
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

SERIE = "ALB"
RE_NIF_PENDIENTE = "PENDIENTE"
EUR = lambda d: f"{d:.2f}".replace(".", ",")  # es-ES, sin separador de miles


def _dec(x: object) -> Decimal:
    return Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def validar_entrada(e: dict) -> list[str]:
    errores = []
    if not isinstance(e.get("cliente_ref"), str) or not e["cliente_ref"].strip():
        errores.append("cliente_ref obligatorio (referencia, nunca nombre/DNI real)")
    elif any(c.isdigit() for c in e["cliente_ref"]) and len([c for c in e["cliente_ref"] if c.isdigit()]) >= 7:
        errores.append("cliente_ref con exceso de dígitos: no introduzcas teléfonos ni documentos")
    lineas = e.get("lineas")
    if not isinstance(lineas, list) or not lineas:
        errores.append("lineas obligatorio (al menos una línea)")
    else:
        for i, l in enumerate(lineas, 1):
            if not isinstance(l.get("descripcion"), str) or not l["descripcion"].strip():
                errores.append(f"línea {i}: descripcion obligatoria")
            for k in ("cantidad", "precio"):
                try:
                    if _dec(l.get(k, "x")) < 0:
                        errores.append(f"línea {i}: {k} negativo")
                except Exception:
                    errores.append(f"línea {i}: {k} inválido")
    return errores


def numerar(libro: dict) -> str:
    y = datetime.now(timezone.utc).astimezone().year
    for h in reversed(libro.get("historial", [])):
        ns = h.get("numero_serie", "")
        if ns.startswith(f"{SERIE}-{y}-"):
            return f"{SERIE}-{y}-{int(ns.rsplit('-', 1)[-1]) + 1:04d}"
    return f"{SERIE}-{y}-0001"


def preparar(libro: dict, entrada: dict, ahora: datetime) -> dict:
    fecha = entrada.get("fecha") or ahora.date().isoformat()
    numero = numerar(libro)
    lineas = []
    total = Decimal("0")
    for l in entrada["lineas"]:
        cantidad = _dec(l["cantidad"])
        precio = _dec(l["precio"])
        importe = _dec(cantidad * precio)
        total += importe
        lineas.append({"descripcion": l["descripcion"].strip(), "cantidad": str(cantidad), "precio": EUR(precio), "importe": EUR(importe)})
    total = _dec(total)
    registro = {
        "numero_serie": numero,
        "fecha": fecha,
        "cliente_ref": entrada["cliente_ref"].strip(),
        "lineas": lineas,
        "total": EUR(total),
        "huella_integridad": "",       # se rellena abajo
        "pdf": f"datos/albaranes/pdf/{numero}.pdf",
        "aviso": "Documento no fiscal. No sustituye a la factura (pendiente certificado AEAT).",
    }
    base = "|".join([numero, fecha, entrada["cliente_ref"].strip(), str(total)])
    registro["huella_integridad"] = hashlib.sha256(base.encode("utf-8")).hexdigest().upper()
    return registro


def generar_pdf(reg: dict, emisor: dict, logo: Path, salida: Path) -> Path:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    salida.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(salida), pagesize=A4)
    an, al = A4
    if logo.exists():
        c.drawImage(str(logo), 20*mm, al-32*mm, width=52*mm, height=16*mm,
                    preserveAspectRatio=True, anchor="c", mask="auto")
    c.setFont("Helvetica-Bold", 20)
    c.drawString(110*mm, al-25*mm, "ALBARÁN")
    c.setFont("Helvetica-Bold", 9)
    c.setFillGray(0.35)
    c.drawString(110*mm, al-31*mm, "DOCUMENTO SIN VALOR FISCAL — no sustituye a la factura")
    c.setFillGray(0)
    c.setFont("Helvetica", 10)
    c.drawString(110*mm, al-38*mm, f"Número: {reg['numero_serie']}")
    c.drawString(110*mm, al-43.5*mm, f"Fecha: {reg['fecha']}")
    c.drawString(20*mm, al-45*mm, "")
    y = al - 48*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(20*mm, y, "Emisor")
    c.setFont("Helvetica", 10)
    c.drawString(20*mm, y-5*mm, emisor.get("nombre_razon", ""))
    c.drawString(20*mm, y-10*mm, f"NIF: {emisor.get('nif', '')}")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(110*mm, y, "Cliente")
    c.setFont("Helvetica", 10)
    c.drawString(110*mm, y-5*mm, reg["cliente_ref"])
    y -= 20*mm
    c.line(20*mm, y, 190*mm, y)
    y -= 6*mm
    c.setFont("Helvetica-Bold", 9)
    for x, txt in ((20, "Descripción"), (130, "Cant."), (150, "Precio €"), (170, "Importe €")):
        c.drawString(x*mm, y, txt)
    y -= 5*mm
    c.setFont("Helvetica", 9)
    for l in reg["lineas"]:
        c.drawString(20*mm, y, l["descripcion"][:72])
        c.drawString(130*mm, y, l["cantidad"])
        c.drawString(150*mm, y, l["precio"])
        c.drawString(170*mm, y, l["importe"])
        y -= 5*mm
        if y < 30*mm:
            c.showPage(); y = al - 20*mm; c.setFont("Helvetica", 9)
    c.line(20*mm, y, 190*mm, y)
    y -= 7*mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(140*mm, y, "TOTAL")
    c.drawString(170*mm, y, f"{reg['total']} €")
    y -= 12*mm
    c.setFont("Helvetica", 7.5)
    c.setFillGray(0.4)
    c.drawString(20*mm, y, f"Huella de integridad SHA-256 (no fiscal): {reg['huella_integridad'][:32]}…")
    c.drawString(20*mm, y-4*mm, reg["aviso"])
    c.drawString(20*mm, y-8*mm, "Software: autor Eduardo Andrés Galeano Aido, uso autorizado a BMAE Energía (AUTHORS.md).")
    c.save()
    return salida


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", required=True)
    ap.add_argument("--libro", default="datos/albaranes/albaranes.json")
    ap.add_argument("--pdf-dir", default="datos/albaranes/pdf")
    ap.add_argument("--logo", default="diseno/marca/logo-bm.png")
    ap.add_argument("--informe", default="/tmp/albaran-informe.json")
    ap.add_argument("--dry-run", action="store_true", help="prepara y pinta, no escribe libro ni PDF")
    a = ap.parse_args()

    entrada = json.loads(Path(a.entrada).read_text(encoding="utf-8"))
    errores = validar_entrada(entrada)
    if errores:
        print("".join(f"✗ {e}\n" for e in errores), file=sys.stderr)
        Path(a.informe).write_text(json.dumps({"ok": False, "errores": errores}, ensure_ascii=False, indent=2))
        return 2

    r_libro = Path(a.libro)
    libro = json.loads(r_libro.read_text(encoding="utf-8")) if r_libro.exists() else {
        "v": 1, "upd": "", "emisor": {}, "ultimo": None, "historial": []}
    reg = preparar(libro, entrada, datetime.now(timezone.utc).astimezone())
    if RE_NIF_PENDIENTE in str(libro.get("emisor", {}).get("nif", "")):
        reg["aviso_nif"] = "Emisor sin NIF cumplimentado todavía (gesto humano, docs/pendientes.md). El albarán sigue siendo documento comercial válido identificado con razón social."

    if a.dry_run:
        print(json.dumps({**reg, "dry_run": True}, ensure_ascii=False, indent=2))
        return 0

    pdf = generar_pdf(reg, libro.get("emisor", {}), Path(a.logo), Path(a.pdf_dir) / f"{reg['numero_serie']}.pdf")
    libro["upd"] = datetime.now(timezone.utc).astimezone().date().isoformat()
    libro["ultimo"] = {"numero_serie": reg["numero_serie"], "fecha": reg["fecha"],
                       "total": reg["total"], "huella_integridad": reg["huella_integridad"]}
    libro.setdefault("historial", []).append(reg)
    r_libro.parent.mkdir(parents=True, exist_ok=True)
    r_libro.write_text(json.dumps(libro, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    Path(a.informe).write_text(json.dumps({"ok": True, "registro": reg, "pdf": str(pdf)}, ensure_ascii=False, indent=2))
    print(f"✓ {reg['numero_serie']} registrado ({reg['total']} €) → libro + {pdf}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
