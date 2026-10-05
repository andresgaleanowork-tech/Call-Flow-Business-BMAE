#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
importa-maestro.py — v3.5.0 · Carga de la base maestra de prospectos (33k)

Lee un CSV exportado de Excel (separador «;» o «,», UTF-8), normaliza los
teléfonos (9 dígitos finales), deduplica dentro del propio fichero y contra
·banco compartido ·exclusiones ·lotes ya subidos, trocea en puñados de 250 por
provincia y sube a los datos del repo:

    datos/maestro/lote_PNNNN.json   (500→250 prospectos por lote)
    datos/maestro/idx.json          (contadores por provincia/puñado/sector)
    datos/maestro/informe.json      (qué pasó con tu importación)

Uso:
    python3 tools/importa-maestro.py ruta/al/excel_exportado.csv            # ensayo (dry-run)
    python3 tools/importa-maestro.py ruta/al/excel_exportado.csv --subir   # sube de verdad

Token v3.7: $CFB_TOKEN · tools/.cfb_token (local) · (obsoleto: literal CFB_EMB en index.html).
"""
import csv, json, os, re, sys, time, urllib.request, urllib.error, base64

PUNADO = 250
OWNER = 'andresgaleanowork-tech'
REPO = 'CFB-datos-equipo'
PREFIJO_OK = re.compile(r'^[6-9]')
APLICA_RNG = re.compile(r'^(\+34|0034|34)?')

# ── lectura de claves ───────────────────────────────────────-
def token():
    # v3.7: el token ya NO está embebido en los binarios (desacople punto 3).
    # Fuentes, en orden:  $CFB_TOKEN  ·  tools/.cfb_token (local, no subir)  ·  CFB_EMB histórico si alguien vuelve a ponerlo
    t = os.environ.get('CFB_TOKEN', '').strip()
    if t: return t
    try:
        f = os.path.join(os.path.dirname(__file__), '.cfb_token')
        if os.path.exists(f):
            t = open(f, encoding='utf-8').read().strip().splitlines()[0]
            if t: return t
    except Exception:
        pass
    try:
        p = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web', 'index.html')
        s = open(p, encoding='utf-8').read()
        m = re.search(r"CFB_EMB=\(function\(\)\{var p=\[([^\]]+)\]", s)
        if not m: return ''
        parts = [x.strip().strip("'") for x in m.group(1).split(',')]
        return parts[0] + '_' + ''.join(parts[1:])
    except Exception:
        return ''

def gh(method, path, payload=None, ctype='application/json'):
    url = 'https://api.github.com/repos/%s/%s/%s' % (OWNER, REPO, path)
    data = json.dumps(payload).encode('utf-8') if payload is not None else None
    rq = urllib.request.Request(url, data=data, method=method,
        headers={'Authorization': 'token ' + token(), 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': ctype,
                 'User-Agent': 'cfb-importa-maestro'})
    try:
        with urllib.request.urlopen(rq, timeout=40) as r:
            body = r.read().decode('utf-8')
            return r.status, (json.loads(body) if body else None)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'replace') if e.fp else ''
        return e.code, {'body': body[:300]}

def gh_get_raw(path):
    st, j = gh('GET', 'contents/%s?ref=main' % path)
    if st == 200 and j and 'content' in j:
        try:
            return json.loads(base64.b64decode(j['content'].encode('ascii')).decode('utf-8'))
        except Exception:
            return None
    return None

# ── normalización ───────────────────────────────────────────
def norm_header(h):
    h = (h or '').strip().lower()
    for a, b in (('á','a'),('é','e'),('í','i'),('ó','o'),('ú','u'),('ü','u'),('ñ','n'),('º',''),('.','')):
        h = h.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '_', h).strip('_')

MAPAS = {
    'nombre':  {'nombre','empresa','cliente','razon_social','rs','comercio','denominacion','title','company','company_name','business','entidad'},
    'tel':     {'telefono','tel','movil','fijo','tlf','tfn','telefono_1','tel_1','phone','phone_1','contacto_tel','contacto_telefono','telephone'},
    'tel2':    {'telefono_2','tel_2','movil_2','fijo_2','telefono3','tel_3','movil_3','phone_2'},
    'ciudad':  {'ciudad','municipio','localidad','pueblo','poblacion','villa','cp_poblacion','city','town'},
    'prov':    {'provincia','prov','region','comunidad','ccaa','state','county'},
    'sector':  {'sector','actividad','cnae','epigrafe','categoria','oficio','giro','subsector','negocio'},
    'nota':    {'nota','notas','observaciones','comentario','comentarios','origen','feed','fuente'},
    'dir':     {'direccion','dir','direccion_1','address','domicilio','calle'},
    'cp':      {'cp','codigo_postal','postal_code','zip','zip_code','postal'},
    'email':   {'email','mail','correo','e_mail'},
    'web':     {'web','website','url','site','pagina_web'},
}

def norm_tel(s):
    d = re.sub(r'\D', '', s or '')
    if len(d) > 9: d = d[-9:] if len(d) >= 9 else d
    return d

def tel_valido(t):
    return len(t) == 9 and bool(PREFIJO_OK.match(t[0] if t else ''))

MAPEADOR = None
def detectar_columnas(cabeceras):
    solo = [norm_header(h) for h in cabeceras]
    fallos = {}
    for campo, alias in MAPAS.items():
        fallos[campo] = None
        for i, h in enumerate(solo):
            if h in alias or any(h.startswith(a) for a in alias if len(a) >= 5):
                if fallos[campo] is None: fallos[campo] = i
    return fallos

# ── núcleo ──────────────────────────────────────────────────
def leer_csv(ruta):
    raw = open(ruta, 'rb').read()
    txt = None
    for enc in ('utf-8-sig', 'utf-8', 'cp1252', 'latin-1'):
        try: txt = raw.decode(enc); break
        except Exception: pass
    if txt is None: txt = raw.decode('latin-1', 'replace')
    import io
    f = io.StringIO(txt)
    muestra = txt[:8192]
    sep = ';' if muestra.count(';') >= muestra.count(',') else ','
    readr = csv.reader(f, delimiter=sep)
    filas = [r for r in readr if any((c or '').strip() for c in r)]
    if not filas: return [], {}
    cab = filas[0]
    pos = detectar_columnas(cab)
    if pos['nombre'] is None or pos['tel'] is None:
        print('✘ No detecto columnas NOMBRE/TELÉFONO en la cabecera:', cab)
        sys.exit(2)
    out = []
    for r in filas[1:]:
        def g(campo):
            i = pos.get(campo)
            try: return (r[i].strip() if i is not None and i < len(r) else '')
            except Exception: return ''
        partes = []
        if g('dir'):   partes.append(g('dir')[:60])
        if g('cp'):    partes.append(g('cp')[:8])
        if g('email'): partes.append('✉ ' + g('email')[:50])
        if g('web'):   partes.append('🌐 ' + g('web')[:50])
        nota_rica = ' · '.join(partes)[:140]
        out.append({
            'n': g('nombre')[:80],
            'tel': norm_tel(g('tel')),
            'tel2': norm_tel(g('tel2')),
            'c': g('ciudad')[:40] or g('prov')[:40],
            'p': (g('prov') or g('ciudad'))[:30],
            's': g('sector')[:30],
            'nota': nota_rica,
            'fuente': (g('nota')[:60] or 'csv'),
        })
    return out, pos

def cargar_estado_repo():
    print('· bajando estado actual del repo (banco, exclusión, lotes)…')
    banco  = gh_get_raw('datos/prospeccion.json') or {'lista': []}
    notlf  = gh_get_raw('datos/exclusion.json') or {'items': []}
    st, jl = gh('GET', 'contents/datos/maestro?ref=main')
    lotes = []
    if st == 200 and isinstance(jl, list):
        for e in jl:
            if e.get('name', '').startswith('lote_P') and e.get('name', '').endswith('.json'):
                j = gh_get_raw('datos/maestro/' + e['name'])
                if j: lotes.append(j)
    return banco, notlf, lotes

def siguiente_prefijo(lotes):
    mx = 0
    for l in lotes:
        m = re.match(r'lote_P(\d+)$', l.get('lote', ''))
        if m: mx = max(mx, int(m.group(1)))
    return mx + 1

def subir(path, doc):
    # sha si existe (upsert con reintento simple por 409)
    st, j = gh('GET', 'contents/%s?ref=main' % path)
    sha = j.get('sha') if st == 200 and j else None
    body = {'message': 'CFB importa maestro: ' + path,
            'content': base64.b64encode(json.dumps(doc, ensure_ascii=False, separators=(',', ':')).encode('utf-8')).decode('ascii'),
            'branch': 'main'}
    if sha: body['sha'] = sha
    st2, j2 = gh('PUT', 'contents/' + path, body)
    if st2 == 409:  # alguien cambió en medio
        time.sleep(1.2)
        st, j = gh('GET', 'contents/%s?ref=main' % path)
        if st == 200 and j: body['sha'] = j['sha']
        st2, j2 = gh('PUT', 'contents/' + path, body)
    return st2

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    ruta = sys.argv[1]
    if not os.path.exists(ruta):
        print('✘ fichero no encontrado:', ruta); sys.exit(2)
    subir_flag = '--subir' in sys.argv[2:]

    crudos, pos = leer_csv(ruta)
    print('CSV: %d filas → columnas detectadas: %s' % (len(crudos), {k: v for k, v in pos.items() if v is not None}))

    banco, notlf, lotes = cargar_estado_repo()
    have_banco = {norm_tel(r.get('tel', '')) for r in banco.get('lista', [])}
    have_exc   = {it.get('tel', '') for it in notlf.get('items', []) if it.get('tel')}
    have_mae   = {}
    for l in lotes:
        for it in l.get('items', []):
            have_mae[norm_tel(it.get('tel', ''))] = (l.get('lote'), it.get('st'))

    vistos, unicos, dups_int, dups_repo, dudosos, sin_tel = set(), [], 0, 0, [], []
    for r in crudos:
        t = r['tel'] if tel_valido(r['tel']) else (r['tel2'] if tel_valido(r['tel2']) else '')
        if not t:
            r2 = dict(r); r2['tel'] = r['tel'] or r['tel2']; dudosos.append(r2); continue
        r['tel'] = t
        if t in vistos: dups_int += 1; continue
        vistos.add(t)
        if t in have_banco or t in have_exc or t in have_mae: dups_repo += 1; continue
        unicos.append({'id': '', 'n': r['n'], 'tel': r['tel'], 'c': r['c'], 'p': r['p'], 's': r['s'],
                       'nota': r.get('nota', ''), 'fuente': r['fuente'], 'st': 'libre', 'owner': '', 'ts': '', 'act': 0})

    # ids estables y troceo: por provincia × (sector si el CSV lo trae; si no, ciudad-grupo)
    hay_sector = sum(1 for r in unicos if r['s'])
    if hay_sector:
        grupo = lambda r: r['s'] or 'varios'
    else:
        pob = {}
        for r in unicos: pob[r['c'] or '—'] = pob.get(r['c'] or '—', 0) + 1
        def grupo(r):
            c = (r['c'] or '').strip()
            return c if c and pob.get(c, 0) >= 120 else 'RESTO'
        print('· sin columna sector → puñados agrupados por CIUDAD (top ≥120; resto plegado)')
    organizado = {}
    for r in unicos: organizado.setdefault(((r['p'] or '—'), grupo(r)), []).append(r)
    pn = siguiente_prefijo(lotes)
    nuevos_lotes = []
    llaves = sorted(organizado.keys(), key=lambda x: (x[0], x[1]))
    for prov, sect in llaves:
        filas = organizado[(prov, sect)]
        for i in range(0, len(filas), PUNADO):
            lote_id = 'P%04d' % pn; pn += 1
            items = filas[i:i + PUNADO]
            for k, it in enumerate(items):
                it['id'] = 'm%s_%d' % (lote_id, k)
            nuevos_lotes.append({'v': 1, 'lote': 'lote_' + lote_id, 'prov': prov,
                                 'sec': sect[:30], 'items': items})

    # índice ligero solo de libres (incluyendo viejos lotes)
    provs = {}
    for l in lotes + nuevos_lotes:
        prov = l.get('prov', '—')
        libres = sum(1 for it in l.get('items', []) if it.get('st') == 'libre')
        total = len(l.get('items', []))
        sec = l.get('sec') or 'varios'
        e = provs.setdefault(prov, {'p': prov, 'libres': 0, 'total': 0, 'sec': {}, 'pun': []})
        e['libres'] += libres; e['total'] += total
        e['sec'][sec] = e['sec'].get(sec, 0) + libres
        if libres: e['pun'].append({'id': l['lote'], 'libres': libres, 'total': total, 'sec': sec})
    idx = {'v': 1, 'ts': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
           'total_libres': sum(p['libres'] for p in provs.values()),
           'prov': sorted([{'p': p['p'], 'libres': p['libres'], 'total': p['total'],
                            'sec': sorted([{'s': s, 'libres': n} for s, n in p['sec'].items()], key=lambda x: -x['libres']),
                            'pun': p['pun']} for p in provs.values()], key=lambda x: -x['libres'])}
    informe = {'v': 1, 'ts': idx['ts'], 'csv': os.path.basename(ruta),
               'filas': len(crudos), 'unicos': len(unicos),
               'dups_en_csv': dups_int, 'dups_contra_repo': dups_repo,
               'dudosos': len(dudosos), 'lotes_nuevos': [l['lote'] for l in nuevos_lotes],
               'dudosos_sample': dudosos[:15]}

    bah = os.path.basename(ruta) + '.salida'
    os.makedirs(bah, exist_ok=True)
    with open(os.path.join(bah, 'informe.json'), 'w', encoding='utf-8') as f: json.dump(informe, f, ensure_ascii=False, indent=2)
    with open(os.path.join(bah, 'idx.json'), 'w', encoding='utf-8') as f: json.dump(idx, f, ensure_ascii=False, indent=2)
    for l in nuevos_lotes:
        with open(os.path.join(bah, l['lote'] + '.json'), 'w', encoding='utf-8') as f:
            json.dump(l, f, ensure_ascii=False)

    print('— RESUMEN IMPORT —')
    print('filas CSV      : %d' % len(crudos))
    print('únicos aptos   : %d  (dups internos %d · ya en repo %d · dudosos %d)' % (len(unicos), dups_int, dups_repo, len(dudosos)))
    print('puñados nuevos : %d  (lot P%04d… -> %d libres en índice)' % (len(nuevos_lotes), siguiente_prefijo(lotes), idx['total_libres']))
    print('copia local    : %s/' % bah)
    if dudosos[:5]:
        for dd in dudosos[:5]: print('  dudoso:', dd['n'][:40], repr(dd['tel']))

    if not subir_flag:
        print('(dry-run)  no he subido nada. Repite con --subir para publicar en el repo.')
        return

    print('· subiendo…')
    time.sleep(0.5)
    for i, l in enumerate(nuevos_lotes):
        st = subir('datos/maestro/%s.json' % l['lote'], l)
        print('  %s → %s' % (l['lote'], '✔' if st in (200, 201) else '✘ ' + str(st)))
    st = subir('datos/maestro/idx.json', idx); print('  idx.json → %s' % ('✔' if st in (200, 201) else '✘ ' + str(st)))
    st = subir('datos/maestro/informe.json', informe); print('  informe.json → %s' % ('✔' if st in (200, 201) else '✘ ' + str(st)))

if __name__ == '__main__':
    main()
