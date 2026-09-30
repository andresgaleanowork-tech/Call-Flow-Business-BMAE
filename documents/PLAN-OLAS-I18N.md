# 🌐 Plan de oleadas i18n (FR/PT) — Call Flow Business

**Alcance acordado:** solo superficie de llamada (árbol + objeciones + glosario + cromo UI).
El onboarding (tutorial, quiz, diploma, casos, FAQ) **sigue en español** hasta nueva orden.

| Ola | Contenido | Peso aprox. | Estado |
|-----|-----------|-------------|--------|
| 1 | Motor de idiomas + selector por sesión + chip 🌐 + cromo UI (28 cadenas FR/PT) + semilla: `NODES.inicio` y `OBJECTIONS.ya_tengo` FR+PT | ~3 KB/idioma | ✅ v2.9.0 |
| 2 | **Objeciones completas** FR+PT (las 15 manejos, incl. `round2`) | ~40 KB ×2 | ✅ v2.9.2 |
| 3 | **Árbol de decisión completo** FR+PT (18/18 nodos: título, micro, guion palabra a palabra, notas y etiquetas de opciones; marks `[PAUSA]`/`[TONO]` sin traducir a propósito) | ~44 KB ×2 | ✅ v2.9.4 |
| 4 | **Voz de mercado (nat{}) + glosarios**: 93 bloques `nat` (15 obj + 18 nodos, alt/notas/zona por mercado: vouvoiement FR · «o senhor» PT · cordial-formal UK) + **glosario completo por mercado** (9 categorías × 4 idiomas) con pestaña dinámica y botón/panel 🌐 traducidos. Casos de escucha siguen en ES (alcance onboarding). | ~46 KB ×3 | ✅ v2.9.6 |
| 3b | Ola transversal EN: selector 4 botones + cromo UI 25+2 cadenas + cobertura + chip 🌐 EN | ~14 KB | ✅ v2.9.4 |
| 3c | EN contenido: **15/15 objeciones** (validación→round2) + **18/18 nodos** del árbol (mismo patrón de overlays; sufijo de cobertura dinámico y traducido) | ~60 KB | ✅ v2.9.5 |

## Cómo se mide
`cfaCobertura(lang)` = 70%·nodos traducidos/total + 30%·objeciones traducidas/total.
El % sale **en vivo** dentro del selector 🌐. Tests W9 garantizan que el % es computable y paritario FR/PT.

## Cómo contribuye una oleada
Añadir entradas en `I18N.<fr|pt>.nodes.<id>` / `I18N.<fr|pt>.obj.<clave>` dentro de la plantilla.
El motor las mezcla en caliente (`cfaApply(lang)`) y basta con subir la batería (npm test).

## Nota editorial
Traducción comercial directa (sin revisión nativa), según lo decidido.
Las expresiones del glosario español no se «traducen»: en la ola 4 se adaptarán al registro telefónico propio de Francia y Portugal.
