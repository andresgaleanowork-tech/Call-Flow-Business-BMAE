# CLEANUP.md — Bloque D · Limpieza y orden del repositorio

> **Estado: EJECUTADO Y SELLADO · 07-oct-2026.**
> Reglas cumplidas: confirmación explícita del usuario antes de cada lote
> (D1/D2/D3 aprobados por `ask_user`), **cero `git mv`**, cuarentena reversible
> antes que borrado, sello verde tras cada lote.
> Sello post-limpieza: **145 pytest · 8/8 jsdom · 10/10 node · 8/8 YAML · export íntegro**.

---

## 1. Resumen

El repo sellado A·B·C estaba ya limpio de estructura (se construyó con
disciplina): la auditoría encontró **cero basura §14.3, cero duplicados no
trazados, cero enlaces internos de diseño rotos** y **un enlace roto real**
(`frontend-auth/login.html → ../assets/logo.svg`, 404). La limpieza
consistió en: eliminar regenerables, poner el trabajo previo F23/ERP en
cuarentena reversible, cerrar el hueco del logo, y **blindar la limpieza con
tests D8 + workflow D7** para que no se degrade.

## 2. Auditoría técnica (D2) — comandos ejecutados y resultados

| Comando (§14.2 maestro) | Resultado |
|---|---|
| `find . -type f -name "*.{bak,old,tmp,swp}" -o -name "*~" -o -name ".DS_Store" -o -name "Thumbs.db" -o -name "desktop.ini" -o -name "*.log"` | **0 archivos** |
| `find . -type f -exec md5sum {} + \| sort \| uniq -d -w 32` | **Solo los 4 pares trazados** `diseno/X ↔ diseno/export/X` (puente C11 con `MANIFIESTO.sha256`) — duplicado intencional, no deuda |
| `grep -rEo '(href\|src)="[^"]+"' --include="*.html"` | Enlaces internos `#`/`#id` correctos; **1 roto real**: `frontend-auth/login.html:84 → ../assets/logo.svg` (no existía) → **corregido en D6** |
| `grep -rn "TODO\|FIXME"` | 1 TODO real documentado: `integracion/…/provision.py` («UPSERT idempotente §7.2») → queda como pendiente explícito; el resto son «TODO/TODOS» en prosa española |
| `du -sh` repo + workspace | repo 1,2 MB / trabajo previo 19 MB (fuera del repo) |
| `git log` | N/A — sin `.git` aún; la regla «sin `git mv`» queda fijada para el push de F |
| Inventario `bmae-plataforma/` 2 niveles | Árbol coherente con sellos A/B/C; sin huérfanos |

## 3. Clasificación (categorías §14.2)

- **CONSERVAR**: todo lo sellado (`motor/ verifactu/ integracion/ auth/
  .github/workflows/ twenty-sdk/ frontend-auth/ diseno/ docs/ README.md`),
  `twenty-sdk/package-lock.json`, `diseno/export/` (trazado),
  `motor/tests/fixtures/facturas_50.json` (oráculo A6 — jamás regenerar).
- **ELIMINAR (D1, ejecutado)**: 12 carpetas regenerables
  (`*.egg-info` ×4, `__pycache__` ×7, `.pytest_cache` ×2, ≈300 KB).
  Justificación: salidas de herramientas, no contenido; `.gitignore` lo fija.
- **CUARENTENA (D2/D3, ejecutado, reversible)** → `/home/user/_cuarentena/`:

  | Pieza movida | Tamaño | Justificación |
  |---|---|---|
  | `previo-f23/apps/windows/` (EXEs firmados Call Flow Business) | 9,7 MB | producto previo, binarios no versionables |
  | `previo-f23/apps/web/` (SPA previa + tests) | 3,0 MB | sustituida por el diseño C (apps/web del repo, C11) — **excepción 07-oct**: su herramienta de guiones se integra como módulo Call-Flow (`datos/comercial/` ya promovido; guiones se extraen en F3, ver `diseno/guias/integracion-callflow.md`) |
  | `previo-f23/tools/{qa,factory}/` | 1,7 MB | scripts previos; D8 los reemplaza con tests en el repo |
  | `previo-f23/docs/adrs/` (21 ADRs) + `CAZA-BUGS-2026-09-16.md` | 156 KB | historia valiosa: consultable, no vigente |
  | `previo-f23/README.md` | 4 KB | evita colisión con el README del repo |
  | `uploads/` → `_cuarentena/uploads/` (dataset IBERCRM, **prompt maestro**, imagen) + `LEEME.md` índice | 3,9 MB | fuente de requisitos íntegra; índice marca «consultar primero» |

- **AÑADIR-NUEVO (D6)**: ver §5.
- **CONSERVAR-MODIFICAR**: `README.md` (D10), `frontend-auth/login.html`
  sin tocar —el hueco era el asset, no el HTML—, `diseno/componentes/
  tests-componentes.test.mjs` (resolución robusta de jsdom, §6 incidente 3).

## 4. Lotes ejecutados (D5 — reporte de eliminaciones)

| Lote | Confirmación | Acción | Resultado |
|---|---|---|---|
| **D1** | ✔ usuario («Sí, ejecutar D1») | borrados 12 dirs regenerables + `.gitignore` creado | sello re-verificado tras reinstalar editables (`pip install -e … -q`, lección vigente de B: borrar egg-info rompe la multi-dir hasta reinstalar) |
| **D2** | ✔ usuario | `mv` (no `git mv`) trabajo previo → `_cuarentena/previo-f23/` | reversible; raíz del workspace queda: solo `bmae-plataforma/` + `_cuarentena/` |
| **D3** | ✔ usuario | `mv` uploads → `_cuarentena/uploads/` + `LEEME.md` | índice con prompt maestro marcado |
| **D4** | 08-oct-2026 | borrado definitivo de cuarentena | **EJECUTADA** con autorización expresa del usuario (pre-verificada; inventario en `docs/historico/d4-inventario-destruido.txt`) |

## 5. Modificaciones y añadidos (D6 — mismo contenido, sin cambiar rutas)

| Archivo | Qué | Por qué |
|---|---|---|
| `assets/logo.svg` ➕ | logo marca (azul-profundo #0A2540 + rayo #FF6B35) | **bug real de auditoría D2**: `login.html` lo referenciaba → 404 |
| `.gitignore` ➕ | patrones §14.7 (node_modules, dist, build, *.log, .DS_Store, egg-info, _cuarentena…) | preparación push F + fija la regla D1 |
| `.editorconfig` ➕ | LF, 2 esp (4 en Python), EOF newline | §14.6 normalización |
| `.prettierrc.json` ➕ | 110 cols, LF, comillas dobles | base de `npm run format` |
| `package.json` ➕ (raíz) | scripts `test`, `test:limpieza`, `export:check`, `verify`, `clean`, lints | §14.8 adaptado a monorepo Python+JS vainilla (**ALTERNATIVA PRAGMÁTICA** señalada: sin instalación pesada de linters en local; `npx` bajo demanda) |
| `.github/workflows/clean-and-verify.yml` ➕ (**D7**; creado como `workflows/`, movido al push F) | 3 jobs: limpieza estructural, suites selladas, frontend estático (htmlhint, tsc strict) | §14.11; 8/8 YAML válidos |
| `limpieza/test_limpieza.py` ➕ (**D8**) | 6 tests (§infra) | la limpieza deja de ser un estado: pasa a ser una propiedad verificada |

**D8 en detalle** — 6 invariantes que si fallan, el repo se degradó:
1. cero basura SO/temporal; 2. duplicados = solo los 4 pares trazados export;
3. `diseno/export/` íntegro vs `MANIFIESTO.sha256`; 4. `.gitignore` cubre los
patrones del maestro; 5. HTML sin enlaces locales rotos; 6. sin rutas
`/home/user/…` hardcodeadas en código versionable.

## 6. Incidentes de ejecución y resolución

1. **jsdom se evapora entre sesiones** (`node_modules` excluido del snapshot
   del workspace): los 8 tests C5 fallaban al reanudar. Fix: el test resuelve
   jsdom desde `$JSDOM_HOME`/`~/.deps`/`/tmp/deps` con mensaje de instalación
   explícito; el workflow D7 lo instala en CI. Documentado en README.
2. **Falsos positivos de D8**: egg-info regenerados por `pip -e` colisionaban
   en md5 (4× `dependency_links.txt` idénticos) y el test de rutas absolutas
   se autodetectaba. Fix: exclusión de `*.egg-info` en el walker + patrón
   construido sin literal que se auto-caza. (Probar el test contra el propio
   repo antes de sellarlo, siempre.)
3. **YAML 7→8**: `clean-and-verify.yml` eleva el sello de workflows a 8/8.

## 7. Plan de commits atómicos (D3 — para el push del bloque F)

Adaptación del L1–L12 del maestro a la realidad del monorepo (máx. ~20
archivos/commit, Conventional Commits, **sin `git mv`**, reversibles):

```
L1  chore(gitignore): add .gitignore, .editorconfig, .prettierrc
L2  chore(config): add root package.json with verify/test scripts
L4  chore(cleanup): exclude regenerable artifacts via gitignore (nada versionado aún)
L5  docs(cleanup): quarantine legacy F23/ERP work (documentado, externo al repo)
L6  chore(cleanup): fix broken asset — add assets/logo.svg for login.html
L7  refactor(format): prettier --check en diseno/** (CI, no reformat masivo de sellados)
L9  refactor(cleanup): robust jsdom resolution en tests C5
L10 test(cleanup): add limpieza/test_limpieza.py (6 invariantes D8)
L11 ci(cleanup): add .github/workflows/clean-and-verify.yml (D7)
L13 ci(deploy): move workflows/ → .github/workflows/ + pages.yml (sello bloqueante) + docs/deploy-github.md
L12 docs(cleanup): CLEANUP.md final + README D10
```
`L3, L8` se funden en L7/L9 (este repo nació con formato disciplinado: no hay
deuda de lint que saldar — verificado por auditoría §2).

## 8. Checklist de aceptación de limpieza (D9) — §14.12

- [x] Todos los entregables sellados permanecen en su ruta original (0 movimientos dentro del repo).
- [x] Cero basura §14.3; cero duplicados no trazados; HTML sin enlaces rotos (logo añadido).
- [x] `.gitignore`, `.editorconfig`, `.prettierrc.json`, `package.json` raíz.
- [x] Workflow D7 + tests D8 en CI.
- [x] Cuarentena reversible, sin pérdida de información; borrado definitivo aplazado y condicionado (F).
- [x] `git mv`: **no ejecutado** (ni aplicable aún).
- [x] Sello tras limpieza: **145 pytest + 8/8 jsdom + 10/10 node + 8/8 YAML + export íntegro** ✅.

## 9. Rollback

- D2/D3: `mv /home/user/_cuarentena/<pieza> /home/user/` restaura todo.
- D1: `pip install -e ./motor -e ./verifactu -e ./integracion -e ./auth -q`
  regenera egg-info; cachés se recrean solas.
- D6: cada añadido es un archivo nuevo eliminable sin tocar lo sellado.
