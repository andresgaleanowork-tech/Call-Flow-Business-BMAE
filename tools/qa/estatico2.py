# -*- coding: utf-8 -*-
"""Xref: handlers onclick/oninput/onchange/onblur vs funciones definidas."""
import re, pathlib
for f in ['pymes.html','residencial.html']:
    H = pathlib.Path('/home/user/apps/web/'+f).read_text(encoding='utf-8')
    # 1) nombres llamados en atributos on*="fn(...)"
    llamadas = set()
    for m in re.finditer(r'on(?:click|input|change|blur|focus|keydown|submit)\s*=\s*"([^"]+)"', H):
        for fn in re.findall(r'([A-Za-z_$][\w$]*)\s*\(', m.group(1)):
            llamadas.add(fn)
    # handlers en comillas simples dentro de strings HTML ('...onclick=\'fn()\'...')
    for m in re.finditer(r"on(?:click|input|change|blur|focus|keydown|submit)\\?=\s*\\?'([^']+)'", H):
        for fn in re.findall(r'([A-Za-z_$][\w$]*)\s*\(', m.group(1)):
            llamadas.add(fn)
    definidas = set(re.findall(r'function\s+([A-Za-z_$][\w$]*)\s*\(', H))
    definidas |= set(re.findall(r'(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()', H))
    definidas |= set(re.findall(r'window\.([A-Za-z_$][\w$]*)\s*=', H))
    definidas |= set(re.findall(r'([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{', H))  # métodos shorthand
    builtin = {'if','for','while','return','switch','catch','setTimeout','setInterval','alert','confirm','parseInt','parseFloat','String','Number','Boolean','Array','Object','JSON','Math','Date','encodeURIComponent','decodeURIComponent','esc','toast','void'}
    rotas = sorted(llamadas - definidas - builtin)
    print(f'── {f}: {len(llamadas)} fns llamadas en atributos; {len(definidas)} definidas')
    for r in rotas:
        n = len(re.findall(re.escape(r)+r'\s*\(', H))
        print(f'   ⚠ {r}  (apariciones con “(” en el doc: {n})')
