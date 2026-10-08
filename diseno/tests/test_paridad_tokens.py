# -*- coding: utf-8 -*-
"""
C2·C3·C4 · test_paridad_tokens.py — PARIDAD LITERAL de la fuente única:
design-tokens.json ⇄ css/tokens.css ⇄ tailwind/tailwind.config.js.

Si el diseñador toca UN valor en un solo sitio, esto explota por CI (la
filosofía de «paridad pymes≡residencial» de Call-Flow llevada al design).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

RAIZ = Path(__file__).parent.parent
T = json.loads((RAIZ / "tokens" / "design-tokens.json").read_text())
CSS = (RAIZ / "css" / "tokens.css").read_text()
TAILWIND = (RAIZ / "tailwind" / "tailwind.config.js").read_text()


def _hexen(texto):
    return {h.upper() for h in re.findall(r"#[0-9A-Fa-f]{6}\b", texto)}


def todos_los_hex_json():
    def recol(obj):
        if isinstance(obj, str) and re.fullmatch(r"#[0-9A-Fa-f]{6}", obj):
            yield obj.upper()
        elif isinstance(obj, list):
            for x in obj:
                yield from recol(x)
        elif isinstance(obj, dict):
            for v in obj.values():
                yield from recol(v)
    return set(recol(T["color"]))


def test_todo_hex_del_json_esta_en_css_y_tailwind():
    css = _hexen(CSS)
    tw = _hexen(TAILWIND)
    esperados = todos_los_hex_json()
    faltan_css = esperados - css
    faltan_tw = esperados - tw
    assert not faltan_css, f"en tokens.json pero no en css/tokens.css: {sorted(faltan_css)}"
    assert not faltan_tw, f"en tokens.json pero no en tailwind.config.js: {sorted(faltan_tw)}"


def test_css_no_trae_hex_que_no_sea_token_color():
    """Nada improvisado fuera del sistema: todos los hex de tokens.css
    deben ser colores de §8 (o sus variantes oscuras α)."""
    permitidos = todos_los_hex_json()
    # sombras usan rgba con el negro-suave; no admitimos hex nuevos
    for h in _hexen(CSS):
        assert h in permitidos, f"hex fuera de design-tokens.json: {h}"


def test_escala_tipografica_en_rem_y_razon():
    razones = []
    pasos = list(T["tipografia"]["escala"]["pasos"].values())
    # display 64→48 etc: la razón 1.25 solo aplica de body-m en adelante
    assert T["tipografia"]["escala"]["razon"] == 1.25
    for paso in pasos:
        assert f"{paso['px']/16:g}rem" in CSS or f"{paso['px']/16}" in CSS
        assert f"{paso['linea']/16:g}rem" in CSS or f"{paso['linea']/16}" in CSS
        # px exactos también en tailwind (fontSize arrays)
    assert "-0.02em" in CSS and "-0.01em" in CSS and "0.08em" in CSS


def test_espaciado_grid_breakpoints_replicados():
    for px in T["espaciado"]["pasos"].values():
        assert f"{px/16:g}rem" in CSS and f"{px/16:g}rem" in TAILWIND
    for b in T["breakpoints"].values():
        assert f"{b}px" in TAILWIND
    assert f"{T['grid']['desktop']['maxAncho']}px" in CSS
    assert f"{T['grid']['tablet']['maxAncho']}px" in TAILWIND or f"{T['grid']['tablet']['maxAncho']}px" in CSS


def test_radios_sombras_animaciones_replicadas():
    for r in T["radios"].values():
        esperado = f"{r}px"
        assert esperado in CSS and esperado in TAILWIND
    for s in T["sombras"].values():
        assert s.replace(" ", "") in CSS.replace(" ", "") and s.replace(" ", "") in TAILWIND.replace(" ", "")
    for ms in T["animaciones"]["duraciones"].values():
        assert f"{ms}ms" in CSS and f"{ms}ms" in TAILWIND
    for bezier in T["animaciones"]["easing"].values():
        assert bezier in CSS and bezier in TAILWIND


def test_reduced_motion_duro_tokens_css():
    assert "prefers-reduced-motion" in CSS
    assert "animation-duration: 0.01ms" in CSS
    assert "transition-duration: 0.01ms" in CSS


def test_dark_mode_tokens_explícitos_presentes():
    for k, hexv in T["color"]["modo-oscuro"].items():
        clave = k.replace("-", "_")
        assert hexv in CSS, f"dark {k} ausente en tokens.css"
    assert "prefers-color-scheme: dark" in CSS
