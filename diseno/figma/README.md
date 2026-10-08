# C1 — Biblioteca Figma «Energía Precisa»

> **Qué es este archivo**: no podemos exportar un `.fig` desde aquí (Figma no tiene
> API de escritura pública para bibliotecas), así que este documento es la
> **especificación exacta, replicable en <1 jornada**, de la biblioteca de diseño.
> Todo valor mencionado sale de `../tokens/design-tokens.json` (fuente única de
> verdad) — si Figma y tokens difieren, **ganan los tokens**.

---

## 1. Estructura del archivo

```
📁 Energía Precisa — Design System
├── 🎨 00 · Tokens            (variables Figma, ver §2)
├── 🧱 01 · Fundaciones       (tipografía, grid, sombras, iconos)
├── 🔘 02 · Componentes       (los 12 de §3, con variantes)
├── 📐 03 · Patrones          (composiciones: formulario captación, comparador…)
├── 🖥 04 · Páginas            (los 10 wireframes de ../wireframes.md revestidos)
└── 🌗 05 · Temas             (duplicados Light/Dark de cada página)
```

Convención de nombres: **`Dominio / Componente / Variante`** en español de producto:
`Acciones / Botón / Primario`, `Datos / Tabla / Tarjetas`, `Feedback / Toast / Error`.
Los nombres Figma **coinciden con las clases CSS** (`btn--primary` ↔ `Botón/Primario`)
para que el handoff sea literal.

---

## 2. Variables (equivale a tokens)

Importar `../tokens/design-tokens.json` con el plugin **Tokens Studio** (o «Figma
variables import») creando dos **colecciones**:

| Colección | Modos | Contenido |
|---|---|---|
| `primitivos` | único | paleta §8.2 completa, escala tipográfica 1.25, espaciado base-4, radios, sombras, duraciones |
| `semánticos` | `claro` / `oscuro` | `fondo`, `superficie`, `texto`, `texto-tenue`, `borde`, `acento`, `error`, `exito`, `advertencia`, `info` → referencias a primitivos |

Regla de oro: **ninguna capa usa primitivos directamente**; todo pasa por
semánticos. Así el modo oscuro es un cambio de modo en la colección, no un repintado.

### Sustituciones WCAG ya aplicadas (decisión D-C8, medida por tests)

No crear variables para combinaciones **prohibidas medidas**; en su lugar:

| §8.2 original | Contraste medido | Sustituto en biblioteca |
|---|---|---|
| texto `verde-oscuro #1E8449` sobre `verde #2ECC71` | **2.24 ✗AA** | `azul-profundo` sobre `verde` → **7.39 ✓** |
| texto `advertencia #F59E0B` sobre blanco | 2.15 ✗ | solo como **fondo** con texto `azul-profundo` (7.23 ✓) |
| texto `info #0EA5E9` sobre blanco | 2.77 ✗ | fondo + texto `negro-suave` (6.44 ✓) |
| serie-datos `#2ECC71 #FFD93D #FF6B35 #06B6D4` sobre blanco | 1.38–2.84 ✗ | líneas/barra con **borde oscuro + patrón** (no-solo-color) |

Referencia completa: `../guias/wcag.md` y tests `../tests/test_contraste.py` (40/40).

---

## 3. Componentes (12) — matriz de variantes

Cada componente = **Auto Layout + propiedades de variante**. La columna «estado»
es obligatoria: en Figma se diseña **todos los estados**, no solo el feliz.

| # | Componente | Variantes | Estados obligatorios | Notas de diseño |
|---|---|---|---|---|
| 1 | Botón | `primario / secundario / fantasma / peligro` × `md / lg` | reposo, hover, **focus-visible** (anillo 2+2), loading (spinner), disabled | alto mín. 44 px; loading conserva ancho |
| 2 | Campo de texto | `base / CUPS / NIF / IBAN / email / teléfono / importe` | vacío, relleno, error (mensaje bajo), disabled, focus | label siempre visible (nunca solo placeholder); error = icono ⚠ + texto, no solo color |
| 3 | Selector | `simple / búsqueda (tarifario)` | idem campo + abierto con opción activa | lista máx. 7 visibles con scroll |
| 4 | Checkbox / Radio / Toggle | — | off, on, indeterminado, error, disabled | hit-area 44×44 aunque el glyph sea 20 |
| 5 | Tarjeta KPI | `valor / valor+delta` | dato, **cargando (skeleton), sin-dato («—»)** | delta con flecha ▲▼ + texto (aria-friendly) |
| 6 | Tabla | `normal / tarjetas (móvil <640)` | datos, skeleton filas, vacío (ilustración + CTA), error (reintentar) | ordenación con `aria-sort` reflejado en flecha |
| 7 | Modal | `estándar / pantalla-completa (móvil)` | abierto | overlay 60 %, título `aria-labelledby`, botón cerrar siempre |
| 8 | Toast | `info / éxito / advertencia / error` | visible | esquina inf-dcha desktop, inf-centro móvil; × cierre manual |
| 9 | Skeleton | `texto / tarjeta / tabla` | animando (respeta reduced-motion) | onda 1.2 s, no en bucle infinito de CPU |
| 10 | Estado vacío | por contexto (simulaciones, facturas, alertas) | único | siempre: qué es + cómo crear el primero |
| 11 | Estado error | `in-line / página / sección` | único | mensaje humano + botón reintentar |
| 12 | Badge / Chip tarifario | `PVPC / indexada / fija / verde` | único | píldora 12 px radio, texto 12.8 px medium |

### Componentes específicos del dominio (patrones §4)

- **Fila-comparador**: logo comercializadora · nombre tarifa · precio
  €/kWh destacado (fuente datos, 20 px) · €/año estimado · badge «VeriFactu» ·
  CTA secundario «Pedir esta oferta». Variante `recomendada` con borde acento.
- **Gráfica consumo 36 m** (sello honesto): barras mensuales + media móvil;
  nota visible del rango real disponible si < 36 m.
- **Sello honesto**: chip que declara el horizonte de datos usado
  («cálculo con 14 meses reales»), variante `completo/parcial`.

---

## 4. Páginas y grids

- Desktop: **grid 12 col / 1200 max / gutter 24** (`--grid-*` en tokens).
- Tablet 8 col @768, móvil 4 col @320–640; los mockups HTML de `../mockups/`
  son la referencia pixel-real de landing, dashboard, comparador y solar.
- Cada frame de página existe en **modo claro y oscuro** (cambio de modo de la
  colección `semánticos`, sin duplicar componentes).

---

## 5. Handoff a código (puente ya construido)

| Figma | Código existente |
|---|---|
| Variables | `../css/tokens.css` (mismas claves, `--ep-*`) |
| Tipografías | `../css/base.css` + `@font-face` self-hosted |
| Componentes 1–12 | `../componentes/components.css` + `componentes.js` (8 fábricas, 8/8 tests jsdom) |
| Config Tailwind | `../tailwind/tailwind.config.js` (mapeo literal de tokens) |
| Iconos | Lucide (stroke 2, tamaños 16/20/24), nombre del icono = nombre de la capa |

**Criterio de hecho (C1)**: la matriz de §3 está completa (12/12, con estados),
las variables reproducen 1:1 `design-tokens.json` y el puente Figma↔código de §5
no deja ningún valor «huérfano» que exista en un sitio y no en el otro.
