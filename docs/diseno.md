# Diseño de la plataforma — «Energía Precisa»

**Bloque C del maestro · Estado: SELLADO · 07-oct-2026**

Documento formal del sistema de diseño. No repite el contenido técnico: lo
**gobierna**. Cada sección apunta al entregable verificable; las cifras de
contraste y estados citadas están **medidas por tests**, no supuestas.

- Suite de este bloque: **48 tests** (40 pytest tokens/contraste + 8 jsdom componentes) en verde.
- Precedentes sellados e intactos: Bloque A (82 tests), Bloque B (17 + 10 node).

---

## 1. Identidad

| Eje | Decisión |
|---|---|
| Nombre de producto | BMAE Energía (marca mantenida, decisión de estilo del usuario) |
| Concepto rector | **«Energía Precisa»**: el sector vive de la confusión; nosotros ganamos aclarando |
| Superficies | Todas: landing pública, asistente de captación, comparador, alta, panel cliente, solar, facturas VeriFactu, panel gestor |
| Objetivo | Premium: silencio visual (espacio, jerarquía, tipografía) en vez de decoración |
| Personalidad | 3 familias con papel: **Space Grotesk** titulares (carácter), **Inter** cuerpo (claridad), **JetBrains Mono** datos (precisión tabular) |

La identidad expresa honestidad técnica: por eso el «sello honesto»
(«14 meses reales + 22 estimados») es un **componente de diseño de primera
clase**, no una nota legal (ver §6 y `guias/contenido.md` §3).

## 2. Tokens (fuente única)

`diseno/tokens/design-tokens.json` → se proyecta sin ambigüedad a:

| Destino | Archivo | Paridad garantizada por |
|---|---|---|
| CSS custom properties | `diseno/css/tokens.css` | `tests/test_paridad_tokens.py` |
| Tailwind | `diseno/tailwind/tailwind.config.js` | mapeo literal, test de paridad |
| Figma | `diseno/figma/README.md` §2 | misma clave, dos colecciones (modos claro/oscuro) |

Contenido: paleta §8.2 (primaria/secundaria/neutra/semántica/modo oscuro),
escala tipográfica 1.25, espaciado base-4, grid 12/8/4, breakpoints
320→1536, radios, sombras, animación e iconografía (Lucide stroke-2).

## 3. Paleta y la decisión D-C8 (contraste real)

La paleta aspiracional §8.2 **viola WCAG AA en usos sugeridos**. Se midió
todo (`tests/test_contraste.py`, 27 casos) y se fijó la política
**«vivos = fondos/acentos; texto oscuro encima»**:

- PROHIBIDOS como texto sobre blanco: #F59E0B (2.15), #0EA5E9 (2.77),
  #FFD93D (1.38), #FF6B35 (2.84), #2ECC71 (2.1), «verde-oscuro sobre verde»
  (2.24).
- Sustitutos medidos ✓: azul-profundo sobre verde 7.39, sobre ámbar 7.23,
  sobre amarillo 11.28; negro-suave sobre info 6.44; error #DC2626 sobre
  blanco 4.83 (válido de fábrica); éxito #16A34A solo texto grande (3.30).
- Serie de datos: 4 colores <3:1 → borde oscuro + canal redundante
  (no-solo-color §1.4.11), aplicado ya en la gráfica 36 m del dashboard.

Tabla completa y régimen de auditoría: `diseno/guias/wcag.md` §1.

## 4. Tipografía

- Escala Major Third 1.25 (display 64 → micro 12.8), pesos 400/500/600/700.
- Self-hosted WOFF2 con `font-display:swap` (`css/base.css`) — presupuesto C9.
- Datos numéricos: `.datos` = tabular-nums; obligatorio en KPIs, tablas,
  importes y gráficas.
- Reglas de redacción de cifras (coma decimal, espacio fino de millares,
  rangos donde no hay certeza): `guias/contenido.md` §1.

## 5. Componentes (12, con sus 4 estados)

`diseno/componentes/components.css` + `componentes.js` (8 fábricas ES).

| Componente | Estados §9 verificados en test/jsdom |
|---|---|
| Botón (4 variantes × 2 tamaños) | reposo/hover/focus/loading/disabled, 44×44 |
| Campo (base/CUPS/NIF/IBAN…) | error ida y vuelta, aria-invalid+describedby, regex contractual CUPS |
| Selector, Checkbox/Radio/Toggle | (CSS; hit 44×44) |
| KPI | dato/skeleton/sin-dato, delta con aria (▲▼ + etiqueta) |
| Tabla | skeleton→vacío→error(reintentar)→datos + ordenación `aria-sort` + tarjetas @640 |
| Modal | aria-modal+labelledby, Esc, **focus trap**, retorno de foco |
| Toast | status/alert, polite/assertive, cierre manual+auto |
| Skeleton, Estado-vacío, Estado-error | copy aprobado C10 §4 |
| Badge/chip tarifario | PVPC/indexada/fija/verde + VeriFactu ✓ |

Matriz de variantes para diseño: `figma/README.md` §3.

## 6. Patrones de producto

1. **Captación 3 pasos** (CUPS → consumo → bifurcación solar) con guardado
   parcial real y parser de PDF tolerante («no pasa nada, a mano»).
2. **Sello honesto** (F23): toda cifra derivada declara meses reales vs
   estimados, junto a la cifra, con copy contractual. Implementación:
   `lib/honesto.js` (C11 §2.5) que hace imposible pintar el valor sin su
   procedencia; visualmente, meses estimados con borde claro en la gráfica.
3. **VeriFactu visible**: estados ◌ enviando / ✓ registrada / ✗ error AEAT
   con acción humana (reintento), nunca solo color.
4. **Errores con responsabilidad nuestra** y siguiente paso (C10 §1).

## 7. Accesibilidad (WCAG 2.1 AA)

Objetivo formal del maestro, garantizado en tres capas:

- **Preventiva**: D-C8 (§3) prohíbe pares inválidos; componentes nacen con
  aria correcto (tests jsdom: focus trap, aria-sort, live regions…).
- **Estructural**: base.css (skip link, focus-visible 2+2, 44×44,
  reduced-motion duro), teclado completo, zoom 200 %.
- **Verificativa**: `pytest diseno/tests` 40/40 + `node --test` 8/8 +
  protocolo manual por pantalla nueva (`guias/wcag.md` §3).

Modo oscuro: misma exigencia AA con paleta `modo-oscuro.*`;
preferencia SO, sin toggle en V1.

## 8. Performance

Presupuestos vinculantes por página (`guias/performance.md` §1): LCP ≤1.8–2.2 s,
INP ≤200 ms, **CLS ≤0.02 landing**, JS ≤35 KB landing / ≤70 KB panel,
CSS ≤12 KB, fuentes ≤4 pesos.

Decisiones habilitantes ya tomadas: captación sin framework, SVG en vez de
charting (la gráfica de 36 m son 36 rectángulos), tabla→tarjetas por CSS,
una llamada agregada + skeleton, SWR 1 h tarifario, lista negra de
antipatrones §5 de la guía.

## 9. Páginas (11) y navegación

Wireframes completos con estados: `diseno/wireframes.md`. Mockups
pixel-real autocontenidos (preview in-app sin red): `mockups/landing.html`,
`comparador.html`, `dashboard.html`, `solar.html`.

```
Públicas            Privadas (sesión B)          Rol gestor         Rol comercial
──────────          ──────────────────           ────────────       ─────────────────
#/  landing          #/panel        dashboard     #/gestor pipeline   #/callflow guiones
#/captacion 3 pasos  #/suministro   detalle                           #/callflow/actividad
#/alta               #/solar        simulador                         #/callflow/admin (gestor)
                     #/facturas     VeriFactu
```

La página 11 es el **módulo Call-Flow integrado** (guiones comerciales por
segmento, ex «Call Flow Business» v4.4.8): especificación y contratos en
`diseno/guias/integracion-callflow.md`; decisión del usuario 07-oct-2026.

## 10. Sistema de trabajo (§12) y puente a código

`guias/estructura.md` fija el árbol `apps/web/` del bloque E y la regla de
oro: **se importa `diseno/export/` (copia con SHA-256 verificado); nunca se
editan copias a mano**. Cualquier cambio visual entra por `diseno/` + tests.
`guias/plan-6a-6i.md` es el mapa de sub-fases 6a→6i: 6a–6h ✅, 6i se cierra
con este documento y el sello.

## 11. Sello de cierre

```bash
# Todo el monolito, una pasada:
cd /home/user/bmae-plataforma
python3 -m pytest motor/ verifactu/ integracion/ auth/ diseno/tests -q
#   → 82 + 17 + 40 = 139 passed
cd diseno/componentes && node --test tests-componentes.test.mjs   # →  8/8
cd ../../frontend-auth && node --test tests/                      # → 10/10
python3 - <<'EOF'   # integridad del export
import hashlib, pathlib
for f in pathlib.Path("diseno/export").glob("*"):
    print(hashlib.sha256(f.read_bytes()).hexdigest()[:12], f.name)
EOF
```

| Suite | Resultado |
|---|---|
| pytest total (A 82 + B 17 + C 40) | **139 passed** |
| node componentes C5 | **8/8** |
| node frontend-auth (B) | **10/10** |
| workflows YAML (A) | **7 válidos** |

**Decisiones de este bloque**: D-C8 (contraste real: sustituciones medidas
§3) · sello honesto como patrón de producto · vivos=fondos (política de uso)
· export con hash como única vía diseño→código · sin charting lib ni toggle
oscuro en V1.
