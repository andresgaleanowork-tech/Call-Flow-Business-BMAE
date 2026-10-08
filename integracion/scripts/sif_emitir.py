#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI del SIF GitHub-total (decisión opción B, 07-oct): genera el
«RegistroFacturacionAlta» con el SDK sellado A4 (huella encadenada RD
1007/2023), lo enrola en el sobre SOAP document/document-literal del
WebService AEAT, lo envía con mTLS (certificado cualificado) y persiste la
cadena EN-git (`datos/verifactu/cadena.json`, commit del bot en cada emisión).

Modos:
    python integracion/scripts/sif_emitir.py --factura /tmp/factura.json \
        --cadena datos/verifactu/cadena.json --solo-xml /tmp/registro.xml

    python integracion/scripts/sif_emitir.py --factura /tmp/factura.json \
        --cadena datos/verifactu/cadena.json --entorno preproduccion \
        --cert "$AEAT_CERT_PEM" --key "$AEAT_KEY_PEM" --informe /tmp/resp.json

Idempotencia (§3 de docs/github-total.md): numero_serie duplicado en la
última posición del historial → devuelve ese registro sin reencadenar.

Timeout/errores: no reintenta internamente; el workflow gobierna (concurrencia
serialized + runbook). Salida ≠ 0 → label verifactu:error.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import sys
import tempfile
from dataclasses import asdict
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "verifactu"))
from bmae_verifactu.hash_chain import nueva_huella                    # noqa: E402
from bmae_verifactu.registro_alta import Emisor, Factura, registro_alta_xml  # noqa: E402
from bmae_verifactu.qr import url_cotejo                              # noqa: E402

ENDPOINTS = {
    "preproduccion": "https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP",
    "produccion": "https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP",
}
NS_SOAP = "http://schemas.xmlsoap.org/soap/envelope/"


def envolvente_soap(xml_registro: str) -> str:
    # Sobre «document» (doc oficial: SOAP 1.1 document/literal); Header vacío:
    # la autenticación viaja en el canal TLS (certificado cliente cualificado).
    return (
        f'<soapenv:Envelope xmlns:soapenv="{NS_SOAP}">'
        "<soapenv:Header/>"
        "<soapenv:Body>"
        f"{xml_registro}"
        "</soapenv:Body>"
        "</soapenv:Envelope>"
    )


def cargar_cadena(ruta: Path) -> dict:
    if not ruta.exists():
        return {"v": 1, "upd": "", "emisor": {}, "ultimo": None, "historial": []}
    return json.loads(ruta.read_text(encoding="utf-8"))


def guardar_cadena(ruta: Path, cadena: dict) -> None:
    ruta.write_text(json.dumps(cadena, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def preparar(cadena: dict, factura_in: dict, instante: datetime) -> tuple[Emisor, Factura, str, dict]:
    em = cadena["emisor"]
    ultimo = cadena.get("ultimo")
    huella_ant = ultimo["huella"] if ultimo else ""
    ah = datetime.fromisoformat(factura_in.get("fecha_hora_huso") or instante.astimezone().isoformat(timespec="seconds"))
    huella = nueva_huella(
        em["nif"], factura_in["numero_serie"], factura_in["fecha_expedicion"],
        factura_in["tipo_factura"], factura_in["cuota_total"], factura_in["importe_total"],
        huella_ant, ah,
    )
    fc = Factura(
        numero_serie=factura_in["numero_serie"],
        fecha_expedicion=factura_in["fecha_expedicion"],
        tipo_factura=factura_in["tipo_factura"],
        descripcion=factura_in["descripcion"],
        cuota_total=Decimal(str(factura_in["cuota_total"])),
        importe_total=Decimal(str(factura_in["importe_total"])),
        huella_anterior=huella_ant,
        huella=huella,
        fecha_hora_huso=ah.isoformat(timespec="seconds"),
    )
    xml = registro_alta_xml(
        Emisor(nombre_razon=em["nombre_razon"], nif=em["nif"]), fc,
        sistema_nombre=factura_in.get("sistema_nombre", "BMAE-GitHub-SIF"),
        sistema_version=factura_in.get("sistema_version", "1.0"),
    )
    entrada = {
        "numero_serie": fc.numero_serie,
        "fecha_expedicion": fc.fecha_expedicion,
        "tipo_factura": fc.tipo_factura,
        "descripcion": fc.descripcion,
        "cuota_total": str(fc.cuota_total),
        "importe_total": str(fc.importe_total),
        "huella_anterior": huella_ant,
        "huella": huella,
        "fecha_hora_huso": fc.fecha_hora_huso,
        "qr": url_cotejo(em["nif"], fc.numero_serie, fc.fecha_expedicion,
                         fc.importe_total, entorno=factura_in.get("entorno", "preproduccion")),
    }
    return Emisor(nombre_razon=em["nombre_razon"], nif=em["nif"]), fc, xml, entrada


def _tmp_descriptor(data_b64: str, suffix: str) -> str:
    fd, ruta = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "wb") as f:
        f.write(base64.b64decode(data_b64))
    return ruta


def enviar(envelop: str, entorno: str, cert_b64: str, key_b64: str, timeout: int = 60) -> dict:
    """curl con certificado cliente. Sin reintentos: el workflow decide."""
    cert = _tmp_descriptor(cert_b64, ".cert.pem")
    key = _tmp_descriptor(key_b64, ".key.pem")
    try:
        fd, cuerpo_tmp = tempfile.mkstemp(suffix=".soap.xml")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(envelop)
        r = subprocess.run(
            [
                "curl", "-sS", "-m", str(timeout),
                "--cert", cert, "--key", key,
                "-H", "Content-Type: text/xml;charset=UTF-8",
                "--data", f"@{cuerpo_tmp}",
                ENDPOINTS[entorno],
            ],
            capture_output=True, text=False, timeout=timeout + 15,
        )
        salida = (r.stdout or b"").decode("utf-8", "replace")
        return {
            "ok": r.returncode == 0 and "Error" not in salida and "faultcode" not in salida,
            "returncode": r.returncode,
            "stderr": (r.stderr or b"").decode("utf-8", "replace").strip(),
            "raw": salida,
        }
    finally:
        for p in (cert, key):
            try:
                os.unlink(p)
            except OSError:
                pass


def extraer_resultado(raw: str) -> dict:
    """Extracción mínima honesta de la respuesta AEAT (fax sin parsear de Edge):
    CSV o código de error legible para el comentario del invoice-issue."""
    for clave in ("IdSIT", "CSV", "CodigoErrorRegistro", "DescripcionErrorRegistro"):
        if f"<{clave}>" in raw:
            import re
            m = re.search(f"<{clave}>(.*?)</{clave}>", raw, re.S)
            if m:
                return {clave: m.group(1).strip()}
    if "faultcode" in raw:
        import re
        m = re.search(r"<faultstring>(.*?)</faultstring>", raw, re.S)
        return {"faultstring": (m.group(1).strip() if m else raw[:300])}
    return {"respuesta": raw[:300]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--factura", required=True, help="JSON: numero_serie fecha_expedicion tipo_factura descripcion cuota_total importe_total [entorno sistema_nombre version fecha_hora_huso]")
    ap.add_argument("--cadena", default="datos/verifactu/cadena.json")
    ap.add_argument("--entorno", choices=["preproduccion", "produccion"], default="preproduccion")
    ap.add_argument("--solo-xml", metavar="RUTA", help="escribir el sobre SOAP y salir sin enviar (dry-run)")
    ap.add_argument("--cert", default=os.environ.get("AEAT_CERT_PEM", ""))
    ap.add_argument("--key", default=os.environ.get("AEAT_KEY_PEM", ""))
    ap.add_argument("--informe", default="/tmp/sif-informe.json")
    ap.add_argument("--persistir-solo-aeat", action="store_true", help="en dry-run no reescribe la cadena (decisión §3)")
    a = ap.parse_args()

    factura_in = json.loads(Path(a.factura).read_text(encoding="utf-8"))
    for campo in ("numero_serie", "fecha_expedicion", "tipo_factura", "descripcion", "cuota_total", "importe_total"):
        if campo not in factura_in:
            print(f"✗ factura sin campo obligatorio «{campo}»", file=sys.stderr)
            return 2

    r_cadena = Path(a.cadena)
    cadena = cargar_cadena(r_cadena)

    if cadena.get("ultimo") and cadena["ultimo"]["numero_serie"] == factura_in["numero_serie"]:
        informe = {"idiempotente": True, "registro": cadena["ultimo"]}
        Path(a.informe).write_text(json.dumps(informe, ensure_ascii=False, indent=2))
        print(f"≡ {factura_in['numero_serie']} ya registrada (huella {cadena['ultimo']['huella'][:12]}…): no se reencadena")
        return 0

    instante = datetime.now(timezone.utc).astimezone()
    emisor, fc, xml, entrada = preparar(cadena, factura_in, instante)
    envelope = envolvente_soap(xml)
    entrada["idiempotente"] = False

    if a.solo_xml:
        Path(a.solo_xml).write_text(envelope, encoding="utf-8")
        informe = {"modo": "solo-xml", "envolvente": a.solo_xml, "entrada": entrada}
        Path(a.informe).write_text(json.dumps(informe, ensure_ascii=False, indent=2))
        print(f"→ {a.solo_xml} (huella {fc.huella[:12]}…; NO persistido, sin red: dry-run)")
        return 0

    if not a.cert or not a.key:
        print("✗ envío sin AEAT_CERT_PEM/AEAT_KEY_PEM: usa --solo-xml o prové el certificado cualificado", file=sys.stderr)
        return 2

    resp = enviar(envelope, a.entorno, a.cert, a.key)
    informe = {
        "entorno": a.entorno,
        "numero_serie": fc.numero_serie,
        "huella": fc.huella,
        "huella_anterior": fc.huella_anterior,
        "qr": entrada["qr"],
        "ok": resp["ok"],
        "returncode": resp["returncode"],
        "stderr": resp["stderr"],
        "extraido": extraer_resultado(resp["raw"]),
    }
    Path(a.informe).write_text(json.dumps(informe, ensure_ascii=False, indent=2))

    if not resp["ok"]:
        print(f"✗ AEAT no aceptó el envío (rc={resp['returncode']}): {informe['extraido']}", file=sys.stderr)
        informe["persistido"] = False
        Path(a.informe).write_text(json.dumps(informe, ensure_ascii=False, indent=2))
        return 1

    cadena["upd"] = datetime.now(timezone.utc).astimezone().date().isoformat()
    cadena["ultimo"] = {
        "numero_serie": fc.numero_serie,
        "huella": fc.huella,
        "fecha_hora_huso": fc.fecha_hora_huso,
    }
    cadena.setdefault("historial", []).append(entrada)
    guardar_cadena(r_cadena, cadena)
    informe["persistido"] = True
    Path(a.informe).write_text(json.dumps(informe, ensure_ascii=False, indent=2))
    print(f"✓ {fc.numero_serie} registrada: huella {fc.huella[:12]}… cadena persistida en {r_cadena}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
