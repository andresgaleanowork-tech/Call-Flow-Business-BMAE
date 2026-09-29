# 🌐 Plan de oleadas i18n (FR/PT) — Call Flow Business

**Alcance acordado:** solo superficie de llamada (árbol + objeciones + glosario + cromo UI).
El onboarding (tutorial, quiz, diploma, casos, FAQ) **sigue en español** hasta nueva orden.

| Ola | Contenido | Peso aprox. | Estado |
|-----|-----------|-------------|--------|
| 1 | Motor de idiomas + selector por sesión + chip 🌐 + cromo UI (28 cadenas FR/PT) + semilla: `NODES.inicio` y `OBJECTIONS.ya_tengo` FR+PT | ~3 KB/idioma | ✅ v2.9.0 |
| 2 | **Objeciones completas** FR+PT (las 10-12 manejos) | ~29 KB ×2 | pendiente |
| 3 | **Árbol de decisión completo** FR+PT (nodos paso a paso) | ~44,5 KB ×2 | pendiente |
| 4 | Glosario + casos de escucha adaptados a cada mercado | ~7,5 KB ×2 + trabajo editorial | pendiente |

## Cómo se mide
`cfaCobertura(lang)` = 70%·nodos traducidos/total + 30%·objeciones traducidas/total.
El % sale **en vivo** dentro del selector 🌐. Tests W9 garantizan que el % es computable y paritario FR/PT.

## Cómo contribuye una oleada
Añadir entradas en `I18N.<fr|pt>.nodes.<id>` / `I18N.<fr|pt>.obj.<clave>` dentro de la plantilla.
El motor las mezcla en caliente (`cfaApply(lang)`) y basta con subir la batería (npm test).

## Nota editorial
Traducción comercial directa (sin revisión nativa), según lo decidido.
Las expresiones del glosario español no se «traducen»: en la ola 4 se adaptarán al registro telefónico propio de Francia y Portugal.
