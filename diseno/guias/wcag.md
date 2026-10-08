# C8 — Guía de accesibilidad (WCAG 2.1 AA) y decisión D-C8

> **Estado**: verificada por máquina. Cada afirmación de contraste de este
> documento sale de un cálculo ejecutado en `../tests/test_contraste.py`
> (**40/40 PASS**). Si alguien cambia un color, los tests lo cazan en rojo.

---

## 1. La cacería de contrastes reales (por qué existe este documento)

La paleta aspiracional del maestro §8.2 **viola AA en varios de sus usos
sugeridos**. En lugar de suavizar el análisis, se midieron todos los pares y se
fijaron **sustituciones concretas** que sí cumplen. Es la **decisión D-C8**.

### 1.1 Pares PROHIBIDOS (medidos, ratio < umbral)

| Par §8.2 original | Ratio medido | Veredicto |
|---|---|---|
| Texto `verde-oscuro #1E8449` sobre `verde #2ECC71` | **2.24:1** | ✗ PROHIBIDO para cualquier texto |
| Texto `advertencia #F59E0B` sobre blanco | 2.15:1 | ✗ texto prohibido |
| Texto `info #0EA5E9` sobre blanco | 2.77:1 | ✗ texto prohibido |
| Texto `amarillo #FFD93D` sobre blanco | 1.38:1 | ✗ texto prohibido |
| Texto `naranja #FF6B35` sobre blanco | 2.84:1 | ✗ texto prohibido |
| Texto `verde-sostenible #2ECC71` sobre blanco | 2.10:1 | ✗ texto prohibido |
| Texto `éxito #16A34A` sobre blanco | 3.30:1 | ⚠ Solo **texto grande** (≥24 px / 18.66 px bold) e iconos ≥3:1 |
| Serie datos `#2ECC71`, `#FFD93D`, `#FF6B35`, `#06B6D4` sobre blanco | 1.38–2.84:1 | ✗ <3:1 → ver §1.3 |

### 1.2 Sustituciones aprobadas (medidas ✓)

| Uso necesario | Solución fijada | Ratio medido |
|---|---|---|
| Texto sobre fondo `verde #2ECC71` (chips de ahorro, badges) | texto `azul-profundo #0A2540` | **7.39:1** ✓ AA normal |
| Texto sobre fondo `advertencia #F59E0B` | texto `azul-profundo` | **7.23:1** ✓ |
| Texto sobre fondo `amarillo #FFD93D` | texto `azul-profundo` | **11.28:1** ✓ |
| Texto sobre fondo `info #0EA5E9` | texto `negro-suave #0F172A` | **6.44:1** ✓ |
| Error como texto sobre blanco | `error #DC2626` (ya válido) | **4.83:1** ✓ |
| Acento hero sobre `azul-profundo` | `amarillo #FFD93D` | 5.4:1 ✓ (verificado en mockup landing) |

**Regla derivada**: los colores «vivos» secundarios **son fondos o acentos,
nunca texto sobre blanco**. El texto encima siempre es oscuro de la familia
primaria. Esto ya está aplicado en la biblioteca Figma (C1 §2), en
`components.css` (badges, toasts) y en los 4 mockups.

### 1.3 Serie de datos (gráficas): no-solo-color (§1.4.11 uso de color)

4 de los 8 colores de serie no llegan a 3:1 sobre blanco. Política fijada:

1. **Borde oscuro** (`azul-profundo` 1 px) en barras/áreas de color claro —
   ya aplicado en la gráfica del dashboard (barras estimadas `#C7D9F2` + borde `#4A90E2`).
2. **Redundancia de canal**: además del color, la serie lleva nombre directo
   en leyenda con muestras, patrón/grosor alterno en líneas, y separador
   visual «estimado vs real» (línea discontinua + etiqueta de texto).
3. Nunca transportar información *solo* por color (alerta roja = icono ⚠ +
   texto; estado VeriFactu = ✓/◌/✗ + palabra).

---

## 2. Checklist operativa por capa

### 2.1 Teclado (2.1.x)
- Todo lo interactivo alcanzable con Tab; **focus-visible** anillo
  2 px `azul-claro` + offset 2 px (base.css, nunca `outline:none` a pelo).
- Orden de foco = orden visual; modales con **focus trap** + Esc cierra +
  foco devuelto al invocador (`crearModal` C5, test n.º 5).
- Skip link `Saltar al contenido` (`.salto`) primer foco de cada pantalla.

### 2.2 Texto y tipografía
- Cuerpo ≥ 16 px (Inter), contraste texto/fondo ≥ 4.5:1; grandes ≥ 3:1.
- Datos numéricos con `font-variant-numeric: tabular-nums` (`.datos`,
  KPIs y tablas) para escaneo alineado.
- Zoom 200 % sin pérdida: layouts fluidos con `clamp()` y grid.

### 2.3 Objetivos táctiles (2.5.5)
- Mínimo **44 × 44 px** en todo (botones, chips clicables, filas tabla).
- En Figma: hit-area separada del glyph cuando el dibujo es 20–24 px.

### 2.4 Formularios (3.2–3.3)
- `label` visible siempre; placeholder nunca sustituye a la etiqueta.
- Error: `aria-invalid` + `aria-describedby` al mensaje + icono (no solo rojo);
  validación contractual CUPS/NIF en `componentes.js` con mensaje humano.
- `autocomplete` correcto (email, tel, cp) y `inputmode` en móvil.

### 2.5 Dinámico (4.1.3 mensajes de estado)
- Toasts: `role="status"`/`aria-live="polite"`; errores que exigen acción:
  `role="alert"` assertivo. Cerrable a mano y con auto-cierre ≥ 5 s.
- Skeletons `aria-hidden` + texto «Cargando…» en región viva (tabla C5).
- Tablas de datos: `th[scope]`, `caption`, ordenación con `aria-sort`.

### 2.6 Movimiento (2.3.3)
- `prefers-reduced-motion`: **duro**, sin excepciones — desactiva ondas de
  skeleton, transiciones y parallax (base.css `*{animation:none;
  transition:none!important}` dentro de la media query).

### 2.7 Modo oscuro
- Misma exigencia AA con la paleta `modo-oscuro.*` de los tokens
  (test contraste cubre el par `texto/fondo` oscuro).
- Preferencia: `prefers-color-scheme`; sin conmutador manual en V1.

---

## 3. Cómo se audita (reproducible)

```bash
# 1) Contraste + paridad tokens (rápido, sin dependencias)
cd diseno && python3 -m pytest tests/ -q            # → 40 passed

# 2) Componentes (foco, aria, estados) con jsdom
cd diseno/componentes && node --test tests-componentes.test.mjs   # → 8/8

# 3) Manual por pantalla nueva (15 min):
#    - recorrer SOLO con teclado, - con lector (VO/NVDA) los estados §9,
#    - zoom 200 %, - prefers-reduced-motion activado.
```

**Criterio de hecho (C8)**: ningún texto usa un par prohibido de §1.1; toda
información dinámica tiene canal redundante además del color; los checks 1–2
pasan en verde y se documenta en el sello de cierre del bloque.
