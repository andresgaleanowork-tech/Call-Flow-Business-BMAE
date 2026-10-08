"""D8 — Tests de verificación de limpieza (§14 del maestro).

Sin dependencias externas: stdlib + pathlib. Se incluyen en el sello global
(`pytest … limpieza`). Si este archivo falla, el repo ha dejado de estar limpio.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
EXCLUIR_DIRS = {"node_modules", ".git", ".pytest_cache", "__pycache__", ".deps", "_cuarentena"}
EXCLUIR_PATRON_DIR = re.compile(r"\.egg-info$")  # regenerables (pip -e); no son contenido

JUNK = {".ds_store": ".DS_Store", "thumbs.db": "Thumbs.db", "desktop.ini": "desktop.ini"}
JUNK_EXT = {".bak", ".old", ".tmp", ".swp", ".log"}


def archivos() -> list[Path]:
    out = []
    for p in RAIZ.rglob("*"):
        if not p.is_file():
            continue
        if any(part in EXCLUIR_DIRS or EXCLUIR_PATRON_DIR.search(part) for part in p.parts):
            continue
        out.append(p)
    return out


def test_sin_basura_so():
    hallados = [
        str(p.relative_to(RAIZ))
        for p in archivos()
        if p.name.lower() in JUNK or p.suffix.lower() in JUNK_EXT or p.name.endswith("~")
    ]
    assert hallados == [], f"Basura §14.3 en el repo: {hallados}"


def test_duplicados_solo_pares_trazados_del_export():
    """Los únicos duplicados permitidos son los 4 pares diseno/X ↔ diseno/export/X
    (puente trazado C11 §3 con MANIFIESTO.sha256)."""
    hashes: dict[str, list[str]] = {}
    for p in archivos():
        h = hashlib.md5(p.read_bytes()).hexdigest()
        hashes.setdefault(h, []).append(str(p.relative_to(RAIZ)))
    duplicados = [v for v in hashes.values() if len(v) > 1]
    for grupo in duplicados:
        assert len(grupo) == 2, f"Triple+ duplicado: {grupo}"
        a, b = sorted(grupo)
        assert a.startswith("diseno/") and b == f"diseno/export/{Path(a).name}", (
            f"Duplicado no trazado: {grupo}"
        )
    assert len(duplicados) <= 4


def test_export_integro_sha256():
    manifiesto = (RAIZ / "diseno/export/MANIFIESTO.sha256").read_text(encoding="utf-8")
    for linea in manifiesto.splitlines():
        if not linea or linea.startswith("#"):
            continue
        sha, nombre = linea.split()
        archivo = RAIZ / "diseno/export" / nombre
        assert archivo.exists(), f"Falta en export: {nombre}"
        assert hashlib.sha256(archivo.read_bytes()).hexdigest() == sha, f"Hash diverge: {nombre}"


PATRONES_GITIGNORE_OBLIGATORIOS = [
    "__pycache__/", ".pytest_cache/", "*.egg-info/", "node_modules/",
    "dist/", "build/", "coverage/", ".DS_Store", "_cuarentena/",
]


def test_gitignore_cubre_patrones_del_maestro():
    gi = (RAIZ / ".gitignore").read_text(encoding="utf-8")
    for patron in PATRONES_GITIGNORE_OBLIGATORIOS:
        assert patron in gi, f".gitignore sin el patrón obligatorio: {patron}"


def test_html_sin_enlaces_locales_rotos():
    rotos = []
    for html in [p for p in archivos() if p.suffix == ".html"]:
        texto = html.read_text(encoding="utf-8")
        for attr in re.findall(r'(?:href|src)="([^"]+)"', texto):
            if attr.startswith(("#", "http", "mailto:", "data:")):
                continue
            destino = (html.parent / attr).resolve()
            if not destino.exists():
                rotos.append(f"{html.relative_to(RAIZ)} -> {attr}")
    assert rotos == [], f"Enlaces locales rotos: {rotos}"


def test_sin_rutas_absolutas_del_workspace_en_los_entregables():
    """Nada de /home/user/… hardcodeado salvo en el bloque de sello de docs (§11),
    donde es intencional y está marcado."""
    patron = re.compile("/home" + "/user/")  # construido: no se autodetecta a sí mismo
    hallados = []
    for p in archivos():
        if p.name == "test_limpieza.py":
            continue
        if p.suffix not in {".py", ".js", ".ts", ".css", ".html", ".yml", ".yaml", ".json"}:
            continue
        if patron.search(p.read_text(encoding="utf-8", errors="ignore")):
            hallados.append(str(p.relative_to(RAIZ)))
    assert hallados == [], f"Rutas absolutas del entorno en código: {hallados}"


def test_pages_listo_para_deploy_desde_raiz():
    """GitHub Pages: main/root. Punto de entrada + bypass de Jekyll + nada que
    dependa de rutas externas sin existir."""
    entrada = RAIZ / "index.html"
    assert entrada.exists(), "Falta index.html en la raíz (Pages no puede desplegar)"
    assert (RAIZ / ".nojekyll").exists(), "Falta .nojekyll (Jekyll rompería rutas/assets)"
    html = entrada.read_text(encoding="utf-8")
    # GitHub-Total w2 (07-oct): el login sellado (B) se suple ahora por la
    # entrada nativa device-flow en la SPA — SUPERSEDE `frontend-auth/login.html`.
    assert "#/login" in html, "La entrada debe enlazar al login nativo de la SPA (GitHub-Total w2)"
    externos = [u for u in re.findall(r"https?://[^\s\"'>)]+", html)
                if "w3.org/2000/svg" not in u]  # xmlns no es una carga de red
    assert externos == [], f"La portada de producción no debe depender de recursos externos: {externos}"


def test_guiones_callflow_contrato_y_verbatim():
    """Guiones v4.4.8 extractados: esquema, coherencia de flechas y tamaño del
    verbatim. Si alguien toca el extractor o los JSON, esto lo caza."""
    dir_guiones = RAIZ / "datos/comercial/guiones"
    for segmento in ("residencial", "pymes"):
        ruta = dir_guiones / f"{segmento}.json"
        assert ruta.exists(), f"Falta el guion extractado: {segmento}.json"
        g = json.loads(ruta.read_text(encoding="utf-8"))
        assert g["v"] == 1 and g["segmento"] == segmento
        assert "v4.4.8" in g["fuente"]
        nodos, objeciones = g["nodos"], g["objeciones"]
        assert len(nodos) >= 10, f"{segmento}: solo {len(nodos)} nodos"
        assert len(objeciones) >= 10, f"{segmento}: solo {len(objeciones)} objeciones"
        assert "inicio" in nodos, f"{segmento}: sin nodo de arranque"
        rotos = [f"{k}->{o['next']}" for k, n in nodos.items() for o in n.get("opciones", [])
                 if o.get("next") and o["next"] not in nodos]
        assert rotos == [], f"{segmento}: flechas rotas {rotos[:5]}"
        verbatim = sum(len(json.dumps(n.get("script", []), ensure_ascii=False)) for n in nodos.values())
        assert verbatim >= 9000, f"{segmento}: verbatim sospechosamente corto ({verbatim})"
