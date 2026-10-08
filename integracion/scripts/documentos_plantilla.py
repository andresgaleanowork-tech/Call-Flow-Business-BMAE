"""documentos_plantilla.py — B4: plantillas de documentos (contrato / anexo-rgpd) → PDF.

Renderiza una plantilla de texto marcada como PLANTILLA BASE (revisión legal
obligatoria — el propio texto lo dixe y el PDF lo lleva al pie) con datos JSON,
genera un PDF con reportlab y lo registra en ``datos/documentos/documentos.json``
con huella SHA-256, al estilo del resto del sistema.

Jamás genera un documento a medias: si falta algún ``{{campo}}``, informa con
el listado completo de errores y no toca el libro ni el disco.

Uso:
    python documentos_plantilla.py --tipo contrato --datos datos.json \
        [--libro datos/documentos/documentos.json] [--pdf-dir datos/documentos/pdf] \
        [--plantillas datos/documentos/plantillas] [--informe informe.json]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

RAIZ = Path(__file__).resolve().parents[2]
TIPOS = ("contrato", "anexo-rgpd")

# Campos mínimos exigidos por tipo: honestidad ante el cliente — nunca un
# documento donde falte lo estructural (el resto se rellenan, si faltan, vacíos
# + aviso).
OBLIGATORIOS = {
    "contrato": ["ref_cliente", "nombre_cliente", "nif_cliente", "fecha_firma"],
    "anexo-rgpd": ["ref_cliente", "nombre_cliente", "nif_cliente", "fecha_firma"],
}

PATRON_CAMPO = re.compile(r"\{\{\s*([a-z0-9_]+)\s*\}\}")


@dataclass
class Resultado:
    ok: bool
    numero: Optional[str] = None
    pdf: Optional[str] = None
    huella: Optional[str] = None
    errores: Optional[list] = None
    avisos: Optional[list] = None


def campos_plantilla(texto: str) -> list:
    return sorted(set(PATRON_CAMPO.findall(texto)))


def renderizar(texto: str, datos: dict) -> tuple[str, list, list]:
    """Sustituye {{campo}}; devuelve (texto, faltantes, avisos-obligatorios)."""
    usados = campos_plantilla(texto)
    faltantes = [c for c in usados if not str(datos.get(c, "")).strip()]
    def _sub(m):
        return str(datos.get(m.group(1), "")).strip()
    texto_out = PATRON_CAMPO.sub(_sub, texto)
    return texto_out, faltantes


def pdf_de_texto(texto: str, destino: Path, titulo: str) -> None:
    """PDF de una página/continuación con el pie honesto de plantilla base."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError as e:  # pragma: no cover
        raise RuntimeError("Falta 'reportlab' (pip install reportlab).") from e
    c = canvas.Canvas(str(destino), pagesize=A4)
    ancho, alto = A4
    margen, y, linea_h = 50, alto - 60, 13
    c.setFont("Helvetica-Bold", 11)
    c.drawString(margen, y, titulo)
    y -= linea_h * 1.6
    c.setFont("Helvetica", 9)
    for bruto in texto.splitlines():
        # envolver la línea al ancho (~105 chars con 9pt)
        trozos = [bruto[i:i + 105] for i in range(0, max(len(bruto), 1), 105)] or [""]
        for t in trozos:
            if y < margen + linea_h * 3:
                c.setFont("Helvetica-Oblique", 7)
                c.drawString(margen, margen - 10, "PLANTILLA BASE B4 — requiere revisión legal antes de firmarla.")
                c.showPage()
                y = alto - 60
                c.setFont("Helvetica", 9)
            c.drawString(margen, y, t)
            y -= linea_h
    c.setFont("Helvetica-Oblique", 7)
    c.drawString(margen, 30, "PLANTILLA BASE B4 — requiere revisión legal antes de firmarla. Generado " + datetime.now(timezone.utc).isoformat())
    c.save()


def crear_documento(tipo: str, datos: dict, *, libro_path: Path, pdf_dir: Path,
                    plantillas_dir: Path, emisor: Optional[dict] = None,
                    write: bool = True, informe_path: Optional[Path] = None) -> Resultado:
    if tipo not in TIPOS:
        r = Resultado(False, errores=[f"tipo desconocido {tipo!r}; vale: {', '.join(TIPOS)}"])
        _escribe_informe(informe_path, r)
        return r
    recto = (plantillas_dir / f"{tipo}.txt").read_text(encoding="utf-8")

    # huella base y emisor inyectados (nif_emisor & cia vienen del libro)
    libro = _lee_json(libro_path)
    em = emisor or libro.get("emisor") or {}
    base = {
        "nif_emisor": em.get("nif", "PENDIENTE"),
        "direccion_emisor": em.get("direccion", ""),
        "email_privacidad": em.get("email_privacidad", "PENDIENTE"),
        "nombre_firmante_emisor": em.get("nombre", "BMAE Energía S.L."),
        "lugar": em.get("direccion", "Valencia"),
    }
    mezclados = {**base, **{k: v for k, v in datos.items() if isinstance(v, (str, int, float))}}

    _, faltantes = renderizar(recto, mezclados)
    oblig = [c for c in OBLIGATORIOS[tipo] if not str(mezclados.get(c, "")).strip()]
    avisos = []
    if str(base["nif_emisor"]).upper().find("PENDIENTE") >= 0:
        avisos.append("el emisor declara NIF PENDIENTE — documento NO válido para firmar hasta cumplimentar el libro")
    if faltantes:
        # los no obligatorios son aviso; los obligatorios bloquean
        bloq = [c for c in faltantes if c in OBLIGATORIOS[tipo]]
        opcionales = [c for c in faltantes if c not in OBLIGATORIOS[tipo]]
        if opcionales:
            avisos.append(f"campos opcionales quedaron vacíos: {', '.join(opcionales)}")
        if bloq:
            r = Resultado(False, errores=[f"faltan campos obligatorios del {tipo}: {', '.join(bloq)}"], avisos=avisos)
            _escribe_informe(informe_path, r)
            return r
    if oblig:  # defensivo, lo cubre el bloque de arriba
        r = Resultado(False, errores=[f"faltan campos obligatorios: {', '.join(oblig)}"], avisos=avisos)
        _escribe_informe(informe_path, r)
        return r

    texto, _ = renderizar(recto, mezclados)
    ahora = datetime.now(timezone.utc)
    num = f"DOC-{tipo.upper().replace('ANEXO-RGPD', 'RGPD')}-{ahora.strftime('%Y%m%d')}-{len(libro.get('docs', [])) + 1:04d}"
    pdf_rel = f"datos/documentos/pdf/{num}.pdf"

    huella = None
    if write:
        destino = RAIZ / pdf_rel
        destino.parent.mkdir(parents=True, exist_ok=True)
        pdf_de_texto(texto, destino, titulo=f"{tipo.replace('-', ' ').upper()} · {num} · ref {mezclados.get('ref_cliente', '')}")
        huella = hashlib.sha256(destino.read_bytes()).hexdigest()
        entrada = {
            "numero": num, "tipo": tipo,
            "ref_cliente": mezclados.get("ref_cliente", ""),
            "fecha": ahora.isoformat(), "pdf": pdf_rel, "huella": huella,
        }
        libro.setdefault("docs", []).append(entrada)
        libro["ultimo"] = entrada
        libro_path.parent.mkdir(parents=True, exist_ok=True)
        libro_path.write_text(json.dumps(libro, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    r = Resultado(True, numero=num, pdf=pdf_rel, huella=huella, avisos=avisos or None)
    _escribe_informe(informe_path, r)
    return r


def _lee_json(p: Path) -> dict:
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))


def _escribe_informe(p: Optional[Path], r: Resultado) -> None:
    if p:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(vars(r), ensure_ascii=False, indent=2), encoding="utf-8")


def main(argv: Optional[list] = None) -> int:  # pragma: no cover
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--tipo", required=True, choices=TIPOS)
    ap.add_argument("--datos", required=True, help="JSON con los campos de la plantilla")
    ap.add_argument("--libro", type=Path, default=RAIZ / "datos/documentos/documentos.json")
    ap.add_argument("--pdf-dir", type=Path, default=RAIZ / "datos/documentos/pdf")
    ap.add_argument("--plantillas", type=Path, default=RAIZ / "datos/documentos/plantillas")
    ap.add_argument("--informe", type=Path, default=None)
    ap.add_argument("--dry-run", action="store_true", help="valida y muestra avisos sin escribir nada")
    args = ap.parse_args(argv)
    datos = json.loads(Path(args.datos).read_text(encoding="utf-8"))
    r = crear_documento(args.tipo, datos, libro_path=args.libro, pdf_dir=Path(args.pdf_dir),
                        plantillas_dir=Path(args.plantillas), write=not args.dry_run,
                        informe_path=args.informe)
    estado = "OK" if r.ok else "NO OK"
    print(f"{estado} {r.numero or ''} {r.pdf or ''} huella {r.huella or '-'}")
    for e in r.errores or []:
        print(f"  ERROR: {e}")
    for a in r.avisos or []:
        print(f"  AVISO: {a}")
    return 0 if r.ok else 2


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
