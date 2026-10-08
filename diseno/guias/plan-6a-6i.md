# C12 — Plan de ejecución de las sub-fases 6a→6i (§16 del maestro)

> Cómo se ha ejecutado el trabajo de diseño y qué queda. Cada sub-fase tiene
> **entregable verificable** y **estado** (✅ sellado / 🔶 parcial / ⬜ pendiente).
> Orden de dependencias: tokens → contraste → componentes → páginas → guías → sello.

---

## Mapa sub-fase → entregable → estado

| §16 | Sub-fase | Entregable concreto | Estado |
|---|---|---|---|
| 6a | Tokens de diseño (fuente única) | `tokens/design-tokens.json` + `css/tokens.css` + `css/base.css` + `tailwind/tailwind.config.js` | ✅ 40/40 tests |
| 6b | Verificación de contraste / AA | `tests/test_contraste.py` (27 casos medidos) + decisión D-C8 | ✅ medido, no supuesto |
| 6c | Biblioteca de componentes | `componentes/components.css` (12 componentes) + `componentes.js` (8 fábricas) | ✅ 8/8 jsdom |
| 6d | Especificación Figma | `figma/README.md` (matriz 12×variantes×estados, variables, puente código) | ✅ replicable <1 jornada |
| 6e | Wireframes de páginas | `wireframes.md` — 10 páginas ASCII + estados §9 por página | ✅ 10/10 |
| 6f | Mockups navegables | `mockups/landing.html` · `dashboard.html` · `comparador.html` · `solar.html` | ✅ autocontenidos |
| 6g | Guía de accesibilidad | `guias/wcag.md` (contrastes D-C8 + checklist por capa + auditoría) | ✅ |
| 6h | Guías de performance y contenido | `guias/performance.md` (presupuestos vinculantes) + `guias/contenido.md` (voz, glosario, sello honesto) | ✅ |
| 6i | Estructura §12 + planificación | `guias/estructura.md` (árbol apps/web + export puente) + este plan + documento formal `docs/diseno.md` | 🔶 falta solo el documento formal y el sello |

## Camino crítico seguido (y por qué este orden)

1. **6a primero**: todo lo demás consume tokens; sin fuente única, cada
   entregable inventaría sus colores (deuda inmediata).
2. **6b justo después**: medir el contraste *antes* de componentes evitó
   construir 12 componentes sobre combinaciones prohibidas. La cacería real
   cambió la paleta de uso (D-C8) **antes** de que costara rehacer nada.
3. **6c sobre la verdad medida**: components.css solo usa pares ✓AA.
4. **6d+6e en paralelo lógico** tras componentes: Figma y wireframes refieren
   la misma matriz, así se escriben una vez con dos formatos.
5. **6f después de 6e**: los mockups revisten wireframes con tokens reales.
6. **6g–6i cierran**: documentan *lo medido y construido*, no intenciones.
7. **Sello final**: ver §«Sello».

## Riesgos detectados durante la ejecución (resueltos)

| Riesgo | Materialización | Respuesta aplicada |
|---|---|---|
| Paleta §8.2 incumple AA | Ocurrió (6 pares prohibidos medidos) | D-C8: sustituciones medidas + tests vinculantes |
| Gráficas no-solo-color | 4/8 colores de serie <3:1 | borde oscuro + leyenda + separador real/estimado |
| Divergencia diseño↔código | — (prevenido) | `diseno/export/` con hash; apps/web importa, no edita (C11 §3) |
| Exactitud fingida en cifras | — (prevenido) | sello honesto contractual en contenido.md §3 + `lib/honesto.js` (C11) |
| Dependencias jsdom en entorno | `~/.deps` no persistía | reinstalado; test usa `createRequire` robusto a la ruta |

## Pendiente para el sello del Bloque C

- [ ] `docs/diseno.md` (documento formal §8–§16 integrado, referencias a todo lo anterior)
- [ ] Generar `diseno/export/` (copia + SHA-256)
- [ ] Actualizar `README.md` raíz (A✅ B✅ C✅)
- [ ] Sello: suite completa (A 82 + B 17 + C 48+8) verde

**Criterio de hecho (C12)**: esta tabla es el mapa vivo del bloque; cuando
todas las filas son ✅ y el pendiente de sello está tachado, el Bloque C se
cierra y se presenta `docs/diseno.md`.
