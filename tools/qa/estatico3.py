# -*- coding: utf-8 -*-
import re, pathlib
for f in ['index.html','pymes.html','residencial.html','admin.html','tutorial.html']:
    H = pathlib.Path('/home/user/apps/web/'+f).read_text(encoding='utf-8')
    ids = re.findall(r'\bid="([^"]+)"', H)
    dupe = sorted({i for i in ids if ids.count(i)>1})
    # script src externos / http recursos externos (offline roto si no es inline)
    ext = re.findall(r'(?:src|href)\s*=\s*"https?://[^"]+"', H)
    ext = [e for e in ext if 'github.com' not in e and 'ibex' not in e.lower()]
    print(f'{f}: ids={len(ids)} duplicados={dupe or "ninguno"} · recursos http externos={len(ext)}')
    for e in ext[:6]: print('   ⚠', e[:110])
