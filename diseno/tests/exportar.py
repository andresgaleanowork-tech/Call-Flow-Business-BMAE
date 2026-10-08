#!/usr/bin/env python3
"""Genera diseno/export/ — copia verificada (SHA-256) de los artefactos que
apps/web importará en el bloque E. Regla C11 §3: se importa, no se edita.

Uso: python3 diseno/tests/exportar.py           # genera/actualiza
     python3 diseno/tests/exportar.py --check   # CI: verifica que export == fuente
"""
import hashlib, pathlib, shutil, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PIEZAS = [
    ("css/tokens.css", "tokens.css"),
    ("css/base.css", "base.css"),
    ("componentes/components.css", "components.css"),
    ("componentes/componentes.js", "componentes.js"),
]

def sha(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main() -> int:
    destino = RAIZ / "export"
    errores = []
    if "--check" in sys.argv:
        for fuente, nombre in PIEZAS:
            f, e = RAIZ / fuente, destino / nombre
            if not e.exists():
                errores.append(f"FALTA en export: {nombre}")
            elif sha(f) != sha(e):
                errores.append(f"DIVERGE: {nombre} (export desactualizado — ejecuta exportar.py)")
        if errores:
            print("\n".join(errores))
            return 1
        print("export íntegro: 4/4 ficheros coinciden con su fuente")
        return 0

    destino.mkdir(exist_ok=True)
    manifiesto = ["# export generado — SHA-256 por fichero (regenera con exportar.py)"]
    for fuente, nombre in PIEZAS:
        f = RAIZ / fuente
        e = destino / nombre
        shutil.copyfile(f, e)
        manifiesto.append(f"{sha(e)}  {nombre}")
        print(f"  copiado {fuente} -> export/{nombre}")
    (destino / "MANIFIESTO.sha256").write_text("\n".join(manifiesto) + "\n", encoding="utf-8")
    print("manifiesto SHA-256 escrito")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
