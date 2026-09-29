# -*- coding: utf-8 -*-
"""Barrido estático nº1: sinks dangerous, JSON.parse, escapes raros."""
import re, pathlib
H = pathlib.Path('/home/user/apps/web/pymes.html').read_text(encoding='utf-8')
scripts = re.findall(r'<script[^>]*>(.*?)</script>', H, re.S)
print('bloques <script>:', len(scripts), '| tamaños:', [len(s) for s in scripts])

def ctx(txt, i, w=110):
    a=max(0,i-w); b=min(len(txt),i+w)
    frag=txt[a:b].replace('\n',' ⏎ ')
    return frag

print('\n=== innerHTML / insertAdjacentHTML / outerHTML / document.write ===')
for m in re.finditer(r'(innerHTML|insertAdjacentHTML|outerHTML|document\.write)\s*[=(]', H):
    frag=ctx(H,m.start())
    # flag sospechoso si interpola ${ sin esc( cercano
    bad = '${' in frag and 'esc(' not in frag and 'txt(' not in frag and 'safe' not in frag.lower()
    print(('⚠ ' if bad else '  ')+frag[:200])

print('\n=== JSON.parse ===')
for m in re.finditer(r'JSON\.parse', H):
    frag=ctx(H,m.start(),160)
    guarded = 'try' in frag or 'catch' in frag or 'try{' in H[max(0,m.start()-400):m.start()]
    print(('  guardado ' if guarded else '⚠ SIN try ')+frag[:190])

print('\n=== eval / new Function / setTimeout(string) ===')
for m in re.finditer(r'\beval\s*\(|new Function|setTimeout\s*\(\s*[\'\"]', H):
    print('⚠ '+ctx(H,m.start()))
