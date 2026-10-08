# -*- coding: utf-8 -*-
"""
C8 · test_contraste.py — VERIFICACIÓN REAL de contraste WCAG 2.1 AA contra
design-tokens.json. Ningún par se entrega «por fe»: cada pareja pasa por la
fórmula oficial sRGB → luminancia → ratio.

CAZADA DE LA PIEZA (documentada en guias/wcag.md § D-C8): varios «usos»
del maestro §8.2 NO cumplían per se:
  · «Verde Oscuro #1E8449 texto sobre verde» mide 2.24:1 → NO AA.
  · éxito #16A34A sobre blanco mide 3.30:1 → solo TEXTO GRANDE.
  · advertencia/info/naranja/amarillo sobre blanco miden < 3:1 → NO TEXTO
    sobre blanco: son cromo o llevan texto OSCURO encima (AA probado).
Las sustituciones AA están FIJADAS por estos tests.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

TOK = json.loads((Path(__file__).parent.parent / "tokens" / "design-tokens.json").read_text())["color"]


def _lin(c: float) -> float:
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminancia(hexc: str) -> float:
    hexc = hexc.lstrip("#")
    r, g, b = (int(hexc[i : i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(fg: str, bg: str) -> float:
    l1, l2 = luminancia(fg), luminancia(bg)
    return round((max(l1, l2) + 0.05) / (min(l1, l2) + 0.05), 2)


# ---------------------------------------------------------------------------
# Pares que cumplen TEXTO NORMAL (≥4.5:1) — uso liberado
# ---------------------------------------------------------------------------

PARES_AA_NORMAL = [
    # claro, estructura básica
    (TOK["neutro"]["negro-suave"], TOK["neutro"]["blanco"], "texto-fuerte / blanco"),
    (TOK["neutro"]["negro-suave"], TOK["neutro"]["gris-050"], "texto-fuerte / gris-050"),
    (TOK["neutro"]["gris-600"], TOK["neutro"]["blanco"], "texto-suave / blanco"),
    (TOK["neutro"]["gris-600"], TOK["neutro"]["gris-050"], "texto-suave / gris-050"),
    (TOK["primario"]["azul-medio"], TOK["neutro"]["blanco"], "azul-medio / blanco (links/boton)"),
    # oscuro
    (TOK["modo-oscuro"]["texto"], TOK["modo-oscuro"]["fondo"], "texto / fondo (dark)"),
    (TOK["modo-oscuro"]["texto"], TOK["modo-oscuro"]["fondo-2"], "texto / fondo-2 (dark)"),
    (TOK["modo-oscuro"]["texto"], TOK["modo-oscuro"]["fondo-3"], "texto / fondo-3 (dark)"),
    (TOK["modo-oscuro"]["texto-2"], TOK["modo-oscuro"]["fondo"], "texto-2 / fondo (dark)"),
    (TOK["modo-oscuro"]["texto-2"], TOK["modo-oscuro"]["fondo-2"], "texto-2 / fondo-2 (dark)"),
    (TOK["modo-oscuro"]["azul"], TOK["modo-oscuro"]["fondo"], "azul-dark / fondo (dark)"),
    # semánticos que SÍ dan texto normal
    (TOK["semantico"]["error"], TOK["neutro"]["blanco"], "error / blanco"),
    # CTAs de marca con texto OSCURO sobre color vívido — todos miden ≥ 4.5
    (TOK["primario"]["azul-profundo"], TOK["secundario"]["amarillo-energia"], "azul-profundo / amarillo-CTA (11.28)"),
    (TOK["primario"]["azul-profundo"], TOK["semantico"]["advertencia"], "azul-profundo / advertencia (7.23)"),
    (TOK["primario"]["azul-profundo"], TOK["secundario"]["verde-sostenible"], "azul-profundo / verde-sostenible (7.39)"),
    (TOK["primario"]["azul-profundo"], TOK["semantico"]["exito"], "azul-profundo / éxito (4.71)"),
    (TOK["primario"]["azul-profundo"], TOK["secundario"]["naranja-calido"], "azul-profundo / naranja (5.48)"),
    (TOK["neutro"]["negro-suave"], TOK["semantico"]["info"], "negro-suave / info (6.44)"),
]

# Pares que cumplen solo TEXTO GRANDE / UI de datos (≥3.0:1)
PARES_AA_GRANDE = [
    (TOK["neutro"]["negro-suave"], TOK["neutro"]["gris-200"], "texto-fuerte / gris-200"),
    (TOK["neutro"]["gris-600"], TOK["neutro"]["gris-200"], "texto-suave / gris-200"),
    (TOK["primario"]["azul-claro"], TOK["neutro"]["blanco"], "azul-claro / blanco (3.29, grande)"),
    (TOK["semantico"]["exito"], TOK["neutro"]["blanco"], "éxito / blanco (3.30, GRANDE y titulares)"),
    (TOK["modo-oscuro"]["texto-2"], TOK["modo-oscuro"]["fondo-3"], "texto-2 / fondo-3 (dark)"),
    (TOK["modo-oscuro"]["amarillo"], TOK["modo-oscuro"]["fondo"], "amarillo-dark / fondo (dark)"),
    (TOK["secundario"]["amarillo-energia"], TOK["primario"]["azul-profundo"], "amarillo / azul-profundo"),
    (TOK["modo-oscuro"]["azul"], TOK["modo-oscuro"]["fondo-2"], "azul-dark / fondo-2 (dark)"),
]

# Uso PROHIBIDO como texto (medida real < 3:1 sobre blanco) — estos colores
# solo sirven de CROMO/fondo con texto oscuro encima, o como datos de
# gráfico con borde/patrón redundante (nunca color-único, §11.1)
PROHIBIDOS_TEXTO_SOBRE_BLANCO = [
    (TOK["semantico"]["advertencia"], "advertencia", 2.15),
    (TOK["semantico"]["info"], "info", 2.77),
    (TOK["secundario"]["amarillo-energia"], "amarillo-energia", 1.38),
    (TOK["secundario"]["naranja-calido"], "naranja-calido", 2.84),
    (TOK["secundario"]["verde-sostenible"], "verde-sostenible", None),  # <3 confirmado en medición
]

# ❗ El «texto sobre verde» del maestro §8.2 (verde-oscuro sobre verde) = 2.24:1
PAR_PROHIBIDO_MAESTRO = (TOK["secundario"]["verde-oscuro"], TOK["secundario"]["verde-sostenible"], 2.24)


@pytest.mark.parametrize("fg,bg,nombre", PARES_AA_NORMAL)
def test_ratio_texto_normal_aa(fg, bg, nombre):
    r = ratio(fg, bg)
    assert r >= 4.5, f"{nombre}: {r}:1 < 4.5:1 (AA texto normal)"


@pytest.mark.parametrize("fg,bg,nombre", PARES_AA_GRANDE)
def test_ratio_texto_grande_aa(fg, bg, nombre):
    r = ratio(fg, bg)
    assert r >= 3.0, f"{nombre}: {r}:1 < 3:1 (AA grande/datos)"


@pytest.mark.parametrize("color,nombre,medida", PROHIBIDOS_TEXTO_SOBRE_BLANCO)
def test_prohibido_como_texto_sobre_blanco(color, nombre, medida):
    r = ratio(color, TOK["neutro"]["blanco"])
    assert r < 3.0, (
        f"{nombre}/blanco mide ahora {r}:1 (antes < 3): SI la paleta cambia, "
        f"tocar guias/wcag.md §D-C8 — este test vela la prohibición vigente"
    )
    if medida:
        assert abs(r - medida) < 0.01, f"{nombre} midió {medida}:1 al sellado"


def test_el_uso_que_el_maestro_sugeria_no_cumple():
    fg, bg, medida = PAR_PROHIBIDO_MAESTRO
    r = ratio(fg, bg)
    assert r < 3.0, (
        f"verde-oscuro/verde-sostenible mide {r}:1: ¡cambió! Tocar §D-C8"
    )
    # y la sustitución AA que lo sustituye (azul-profundo sobre verde) sigue OK
    assert ratio(TOK["primario"]["azul-profundo"], TOK["secundario"]["verde-sostenible"]) >= 4.5


def test_matriz_de_datos_mide_ingles_minimo_aceptable():
    """Datos (§8.2): las series <3:1 sobre blanco llevan SIEMPRE borde
    oscuro + patrón/símbolo redundante (§11.1 no-solo-color). El test fija
    CUÁLES exigen ese acompañamiento; contraer el set exige tocar la guía."""
    exigen_redundancia = {h.upper() for h in TOK["datos"] if ratio(h, TOK["neutro"]["blanco"]) < 3.0}
    assert exigen_redundancia == {"#2ECC71", "#FFD93D", "#FF6B35", "#06B6D4"}
    # el resto de la serie sí resiste como trazo solo sobre blanco
    assert ratio("#1E4D8C", "#FFFFFF") >= 3.0
    assert ratio("#8B5CF6", "#FFFFFF") >= 3.0
    assert ratio("#EC4899", "#FFFFFF") >= 3.0
    assert ratio("#64748B", "#FFFFFF") >= 3.0
