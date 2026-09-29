# -*- coding: utf-8 -*-
"""Paridad pymes/residencial de los 3 bugs confirmados (substring literals)."""
import pathlib
H = pathlib.Path('/home/user/apps/web/pymes.html').read_text(encoding='utf-8')
R = pathlib.Path('/home/user/apps/web/residencial.html').read_text(encoding='utf-8')
BS = chr(92)  # backslash
casos = [
    ("ver_visto crudo (bug3)", "setItem(" + BS + "'cfb_ver_visto" ),
    ("crm enc onclick (bug1)", "decodeURIComponent(" + BS + "''+enc+" ),
    ("dias UTC (bug2)", "var hoy=(new Date()).toISOString().slice(0,10)"),
    ("aviso sin sanear (T5)", "><b>v'+v.version+'</b>"),
]
for nombre, sub in casos:
    print(f"{nombre}: pymes={H.count(sub)} · residencial={R.count(sub)}")
