<p align="left"><img src="diseno/marca/logo-bm.png" alt="BMAE Energía" height="64"></p>

# BMAE Plataforma Corporativa — Serie A→F completa ✅

> **Autor y desarrollador: Eduardo Andrés Galeano Aido** (NIE Z0002918W),
> con autorización de uso a **BMAE Energía** — ver [`AUTHORS.md`](AUTHORS.md) y
> [`LICENSE`](LICENSE).

Material del **Prompt Maestro Total Unificado** (DeepSeek 06-10-2026) —
ecosistema SPA Call-Flow-Business-BMAE bajo principio **GitHub-First →
GitHub-Total** (0 servicios externos alojados; contención verificada en
[`docs/contencion-github.md`](docs/contencion-github.md)). Marca:
[`diseno/marca/`](diseno/marca/LEEME.md) (BMAE; Iberdrola® solo para
comparativa de tarifas).

**Deploy**: GitHub Pages sirve desde **`main` / raíz** (entrada [`index.html`](index.html)
+ `.nojekyll`; `docs/` reservado a documentación formal) — o con sello bloqueante vía
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). Los 11 workflows viven en
[`.github/workflows/`](.github/workflows/) (Actions solo ejecuta esa ruta).
Checklist de publicación + OAuth **«push y salir»**: [`docs/deploy-github.md`](docs/deploy-github.md).

**Fichas del repositorio** (root + `.github/`): [`LICENSE`](LICENSE) (propietario — solo
organización) · [`CONTRIBUTING.md`](CONTRIBUTING.md) (flujo y sellos) ·
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) · [`SECURITY.md`](SECURITY.md) (reporte privado) ·
[`SUPPORT.md`](SUPPORT.md) · [`CHANGELOG.md`](CHANGELOG.md) (olas) · `.gitignore` / `.editorconfig` /
`.github/CODEOWNERS` · `.github/pull_request_template.md` · plantillas de issue
(`factura.yml` SIF, `incidencia.yml`) · roadmap de herramientas: [`docs/herramientas-web.md`](docs/herramientas-web.md) · tablero único de quien hace qué: [`docs/pendientes.md`](docs/pendientes.md).

> Estado: **A · B · C · D · E · F sellados 2026-10-07** + **F3 H1 · w1 · w3** (SPA + guiones
> verbatim + Call-Flow completo) + **GitHub-Total (opción B, 07-oct)** — 0 servicios externos
> alojados; el SIF VeriFactu vive en Actions (invoice-issue → SDK sellado → AEAT mTLS) con
> la cadena SHA-256 en [`datos/verifactu/cadena.json`](datos/verifactu/cadena.json) y el
> pipeline CRM por issue buzón (`cola-ingest.yml`). Contratos y números de fragilidad:
> [`docs/github-total.md`](docs/github-total.md). `twenty-sdk`/`subirTwenty` quedan
> **inertes** (conservados por trazabilidad; borrado diferido).
> **Sello: 181/181 pytest (147 + 8 GitHub-Total + 5 albaranes + 9 extractor A2 + 6 documentos + 6 prospectos A1) · 48/48 node (30+8+10) · comparativa viva w4 + libro VeriFactu vivo H2 · libro albaranes y documentos vivos · 17/17 YAML (12 workflows + 5 ficheros ISSUE_TEMPLATE) · export 4/4 íntegro.**
> Cierre: [`docs/cierre.md`](docs/cierre.md) (riesgos E1, fases E2, recomendación E3)
> · Contención: [`docs/contencion-github.md`](docs/contencion-github.md) (§2 = 0 alojados).

## F3 · SPA (H1 completado — hito del plan E2)

Shell en la raíz para **GitHub Pages** (hash-router, la URL es el estado C11 §2):

| Pieza | Ruta | Estado |
| :-- | :--- | :--- |
| Router + guard de sesión (claves reales `bmae_*` de B) + **error boundary** + `registrarRuta` (patrón plugin) | [`apps/web/src/main.js`](apps/web/src/main.js) | ✅ |
| Lib: `api.js` (un cliente, origen anotado) · `honesto.js` (sello C10 §3) · `sesion.js` · `shell.js` · **`cola.js`** (H1b: contrato local hasta Twenty en F4) | [`apps/web/src/lib/`](apps/web/src/lib/) | ✅ |
| 9 páginas montables: comparador (pública) · captación · alta · panel · suministro · solar · facturas (◌/✓/✗) · pipeline · **callflow** (catálogo real del repo + guardián anti-PII F10/F11 heredado) | [`apps/web/src/paginas/`](apps/web/src/paginas/) | ✅ 11/11 jsdom |
| **Módulo Call-Flow completo**: `#/callflow` (guiones verbatim navegables + onboarding) · `#/callflow/actividad` (KPIs + embudo + registro + **botón «Enviar a Twenty»**, hoy informa de la espera del endpoint) · `#/callflow/admin` (lectura pura: edición = commit GitHub-First) | [`apps/web/src/paginas/callflow.js`](apps/web/src/paginas/callflow.js) | ✅ w3 |
| **F4-prep · canal Twenty**: `subirTwenty` (lotes ≤50, Bearer sesión B, huella idempotente djb2, timeout 10 s, transaccional) — enchufado en actividad; en cuanto el VPS cumplimente `BASE`, sube de verdad sin tocar UI | [`apps/web/src/lib/twenty.js`](apps/web/src/lib/twenty.js) + [`docs/f4-contrato-subida.md`](docs/f4-contrato-subida.md) | ✅ prep |
| Datos mock contractuales (forma = F4) | [`apps/web/src/datos/mock.js`](apps/web/src/datos/mock.js) | ✅ H1 |
| Contratos comerciales versionados | [`datos/comercial/`](datos/comercial/) | ✅ |
| **Guiones v4.4.8 verbatim** (18 nodos · 15 objeciones ×2 segmentos; extractor `--check`) | [`datos/comercial/guiones/`](datos/comercial/guiones/) | ✅ w1 |
| **17/17 tests SPA jsdom** (router, guard, páginas, callflow, cola, error boundary) | [`apps/web/tests/app.test.mjs`](apps/web/tests/app.test.mjs) | ✅ |

El diseño se **importa** de `diseno/export/` (regla C11 §3 verificada por hash);
el pipeline F4 conectará `api.js` al endpoint real.

## Bloque D — Limpieza (documento: [`CLEANUP.md`](CLEANUP.md))

| # | Entregable | Ruta | Veredicto |
| :-- | :--- | :--- | :--- |
| D1 | Inventario + clasificación (auditoría §14.2): 0 basura, 0 duplicados no trazados, 1 enlace roto real (`logo.svg`) | [`CLEANUP.md`](CLEANUP.md) §1–§3 | ✅ |
| D2·D4 | Cuarentena del trabajo previo F23/ERP (19 MB) **y destrucción final autorizada** | destruida 08-oct-2026 (inventario en `docs/historico/`) | ✅ D4 ejecutada con autorización |
| D3 | Plan de commits atómicos L1–L12 (Conventional Commits, sin `git mv`) | CLEANUP.md §7 | ✅ listo para push F |
| D4 | Configuraciones: `.gitignore` · `.editorconfig` · `.prettierrc.json` · `package.json` raíz | raíz del repo | ✅ |
| D5/D6 | Eliminaciones (12 dirs regenerables) + añadidos (`assets/logo.svg` bug real) | CLEANUP.md §4–§5 | ✅ |
| D7 | Workflow `clean-and-verify.yml` (3 jobs) + `pages.yml` (deploy con sello) | [`.github/workflows/clean-and-verify.yml`](.github/workflows/clean-and-verify.yml) | ✅ 9/9 YAML |
| D8 | Tests de limpieza — 6 invariantes | [`limpieza/test_limpieza.py`](limpieza/test_limpieza.py) | ✅ 6/6 |
| D9/D10 | Checklist de aceptación + este README | CLEANUP.md §8 | ✅ |

## Entregables C1..C12 — Diseño «Energía Precisa» (documento: [`docs/diseno.md`](docs/diseno.md))

| # | Entregable | Ruta | Veredicto |
| :-- | :--- | :--- | :--- |
| C2 | Tokens fuente única (paleta §8.2, escala 1.25, grid, dark, iconografía) | [`diseno/tokens/design-tokens.json`](diseno/tokens/design-tokens.json) | ✅ |
| C8 | WCAG 2.1 AA + **decisión D-C8** (6 pares §8.2 prohibidos medidos, sustitutos ✓) | [`diseno/guias/wcag.md`](diseno/guias/wcag.md) + [`diseno/tests/test_contraste.py`](diseno/tests/test_contraste.py) | ✅ 40/40 pytest |
| C3/C4 | CSS custom properties + base (focus 2+2, 44×44, reduced-motion) + Tailwind literal | [`diseno/css/`](diseno/css/) · [`diseno/tailwind/`](diseno/tailwind/) | ✅ paridad testeada |
| C5 | 12 componentes: CSS + 8 fábricas JS (focus trap, aria-sort, live regions, estados §9) | [`diseno/componentes/`](diseno/componentes/) | ✅ **8/8 jsdom** |
| C1 | Biblioteca Figma replicable <1 jornada (matriz 12×variantes×estados, puente código) | [`diseno/figma/README.md`](diseno/figma/README.md) | ✅ |
| C6 | Wireframes ASCII de las 10 páginas + estados por página | [`diseno/wireframes.md`](diseno/wireframes.md) | ✅ 10/10 |
| C7 | 4 mockups autocontenidos (landing · comparador · dashboard · solar) | [`diseno/mockups/`](diseno/mockups/) | ✅ preview sin red |
| C9/C10 | Performance (presupuestos vinculantes) + contenido (voz, glosario, sello honesto) | [`diseno/guias/`](diseno/guias/) | ✅ |
| C11/C12 | Estructura §12 apps/web + export con SHA-256 + plan sub-fases 6a→6i | [`diseno/guias/estructura.md`](diseno/guias/estructura.md) · [`diseno/export/`](diseno/export/) | ✅ |

Reproducir el sello C:

```bash
cd bmae-plataforma
python3 -m pytest diseno/tests -q                          # → 40 passed
python3 diseno/tests/exportar.py --check                   # export íntegro
npm --prefix "$HOME/.deps" install jsdom@24                # 1ª vez por sesión (jsdom no se versiona)
cd diseno/componentes && node --test tests-componentes.test.mjs   # → 8/8
```

## Entregables B1..B6 (documento: [`docs/autenticacion.md`](docs/autenticacion.md))

| # | Entregable | Ruta | Veredicto |
| :-- | :--- | :--- | :--- |
| B1-B3 | Workflows `auth-exchange` / `auth-refresh` / `auth-revoke` (+ `/revoke @usuario` por Issue, cron de barrido) | [`.github/workflows/`](.github/workflows/) | ✅ 3/3 YAML válidos |
| B4-B5 | `auth_exchange.py` y `auth_refresh.py` (mismo núcleo que el endpoint Frappe; denylist gist append-only) | [`auth/scripts/`](auth/scripts/) | ✅ vía núcleo testeado |
| B6 | Frontend `login.html`/`callback.html` + `auth.js`/`jwt.js`/`roles.js` (PKCE WebCrypto, CSP, dark, WCAG) | [`frontend-auth/`](frontend-auth/) | ✅ **10/10 node --test** |
| núcleo B | `bmae_auth`: PKCE RFC 7636 · JWT RS256 con kid/JWKS · canal HKDF/AES-GCM · roles Teams→RBAC · flujos exchange/refresh/revoke | [`auth/src/bmae_auth/`](auth/src/bmae_auth/) | ✅ **17/17 pytest** |

Reproducir el sello B:

```bash
cd bmae-plataforma
python3 -m pip install -e ./auth cryptography
python3 -m pytest auth/tests -q          # → 17 passed
cd frontend-auth && node --test tests/   # → 10 passed
```

## Entregables A1..A6

| # | Entregable | Ruta | Veredicto |
| :-- | :--- | :--- | :--- |
| A1 | Arquitectura de Alto Nivel (3 diagramas Mermaid + 7 decisiones documentadas) | [`docs/arquitectura.md`](docs/arquitectura.md) | ✅ |
| A2 | Objetos Twenty en TypeScript (PuntoDeSuministro · ContratoSuministro · SimulacionOferta · InstalacionFotovoltaica + pipeline Deal→…→Ganado) | [`twenty-sdk/src/`](twenty-sdk/src/) | ✅ `tsc --noEmit --strict` 0 errores |
| A3 | Motor tarifario CNMC `bmae_comparador` (**Decimal** puro: 6 dec trabajo, ROUND_HALF_UP **final** a 2) | [`motor/src/bmae_comparador/`](motor/src/bmae_comparador/) | ✅ 62/62 pytest |
| A4 | Módulo VeriFactu ERPNext: huella SHA-256 **encadenada** + XML `RegistroFacturacionAlta` + QR de cotejo AEAT | [`verifactu/bmae_verifactu/`](verifactu/bmae_verifactu/) | ✅ 7/7 pytest |
| A5 | Workflows GitHub Actions + lógica de integración (sync bidireccional dedup NIF/CIF+CUPS, opportunity-won, verifactu-audit-daemon, import-catalogo) | [`.github/workflows/`](.github/workflows/) + [`integracion/`](integracion/) | ✅ 4/4 YAML · 13/13 pytest |
| A6 | Suite de 50 facturas de referencia (oráculo plano independiente, tolerancia ≤0,01 €) | [`motor/tests/fixtures/facturas_50.json`](motor/tests/fixtures/facturas_50.json) | ✅ 50/50 exactas |

## Cómo reproducir el sello global (5 minutos)

```bash
cd bmae-plataforma
python3 -m pip install -e ./motor -e ./verifactu -e ./integracion -e ./auth -q
python3 -m pytest motor/ verifactu/ integracion/ auth/ diseno/tests limpieza
# → 146 passed (A 82 + B 17 + C 40 + D 7)
npm --prefix "$HOME/.deps" install jsdom@24 -q               # jsdom fuera del repo (1ª vez por sesión)
cd diseno/componentes && node --test tests-componentes.test.mjs    # → 8/8
cd ../../frontend-auth && node --test tests/                       # → 10/10
cd ../apps/web/tests && node --test app.test.mjs                   # → 11/11
cd .. && python3 -c "
import yaml, glob
fs = glob.glob('.github/workflows/*.yml')
[yaml.safe_load(open(f, encoding='utf-8')) for f in fs]
print(f'✔ {len(fs)}/8 workflows YAML válidos')"

Sello A (aislado, histórico):

```bash
python3 -m pytest motor/tests verifactu/tests integracion/tests -q
# → 82 passed
cd twenty-sdk && npm ci && npx tsc --noEmit   # → 0 errores
cd .. && python3 -c "
import yaml, glob
[yaml.safe_load(open(f, encoding='utf-8')) for f in glob.glob('.github/workflows/*.yml')]
print('✔ 4/4 workflows YAML válidos')"
```

El JSON de las 50 facturas se regenera (de forma determinista) con:

```bash
python3 motor/tools/generar_fixtures.py
```

**NO** lo regeneres sin leer `tests/fixtures/facturas_50.json` antes: ese JSON
es la regresión — regenerarlo equivale a mover el arbitraje.

## Decisiones con firma (resumen — detalle en `docs/arquitectura.md` §4)

- **D-1** DiasAno del prorrata de potencia = año de `fecha_fin`.
- **D-2** Financiación bono social SUMA a «otros»; desactivable por factura.
- **D-3** Excesos cuartohorarios: `suma_raices` (fórmula literal del maestro
  §5.1.3) con variante BOE `raiz_suma` parametrizada — **ALTERNATIVA
  PRAGMÁTICA** señalada a legal.
- **D-4** Formato de huella VeriFactu = serializado `Campo=Valor&…` oficial
  AEAT, HEX mayúsculas.
- **D-5** Doble implementación (oráculo plano) para las 50 facturas.
- **D-B1** Exchange síncrono en endpoint Frappe (repository_dispatch anónimo imposible).
- **D-C8** Contraste real medido: 6 usos §8.2 prohibidos → sustitutos ✓AA —
  «vivos = fondos/acentos, texto oscuro encima» ([`docs/diseno.md`](docs/diseno.md) §3).
- **D-6** El catálogo tarifario solo entra a producción por PR humano.
- **D-7** DLQ unificado en Issues privados `dlq` + artefactos con retención.

## Convenciones de seguridad heredadas del maestro

- Secretos jamás en código/repos: GitHub Environment Secrets (rotación 90 d).
- El certificado X.509 AEAT vive **SOLO** en el VPS (disco cifrado).
- En 3.0TD/6.XTD: P1≤…≤P6 lo impone el validador, no la buena voluntad.
- Dinero: `Decimal` desde la entrada hasta el último céntimo; los tests de la
  suite muerden si alguien introduce `float`.

## Siguientes bloques (pedir expresamente)

- **Bloque C** — Diseño frontend «Energía Precisa»: tokens→contraste(D-C8)→
  componentes(12)→Figma→wireframes(10)→mockups(4)→guías (wcag/performance/
  contenido/estructura/plan 6a-6i) → export con hash → [`docs/diseno.md`](docs/diseno.md).
- **Bloque B** — Autenticación PKCE + JWT RS256 (auth-exchange/refresh/revoke
  + frontend `auth/`).
- Bloque D (limpieza, con CLEANUP.md y **confirmación explícita previa**,
  prohibido `git mv`) →
  E (cierre) → F (contención).

El repo operativo `Call-Flow-Business-BMAE` **no se ha tocado**: este material
es la referencia aprobable/copy-paste del Bloque A.
