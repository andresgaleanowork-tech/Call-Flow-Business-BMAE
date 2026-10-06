# ADR-004 · Ficha empresarial y vacuna CRM v2 (F1, Ola 1b)

**Fecha:** 05-10-2026 · **Estado:** Aceptada · v3.11.0

## Contexto
Las fichas de cliente actuales (privadas por comercial, `cli_*` + burbuja) nacieron de lo que el diálogo necesitaba: nombre, estado, nota, próxima acción. El CRM multi-producto (PLAN §4) exige entidad empresarial completa: empresa con contactos[], datos postales/fiscales, tags, valor €, origen y cruce con IBERCRM (`ibe_id`).

## Decisión
- **Esquema de ficha versionado** (`v:2`): campos nuevos **opcionales** (`contactos[], dir, cp, ciudad, email, web, tags[], valor, origen, ibe_id`) con defaults vacíos; nada obligatorio → cero fricción añadida a la práctica diaria (el diálogo sigue igual de rápido).
- **Vacuna CRM v2** determinista e **idempotente** al arrancar (alza a v2 lo que viene de versions 1, conserva absolutamente cada dato viejo); medida por round-trip test en batería (ya probado en E1).
- **Ámbito**: las fichas permanecen en su burbuja (privada por comercial) — la decisión «privada⇄equipo» (PLAN §12-1) se cierra con **F5 (Ola 2)** junto al pipeline; no se mezclan las dos migraciones.
- **Timeline 360º**: la tarjeta del cliente muestra contactos, fuente del banco si su teléfono vive en `datos/prospeccion.json`, historial de gestiones y próxima acción en una vista unificada (sin pantalla nueva: el editor actual se enriquece).
- **S1 (ADR-003)**: esta versión instala el helper genérico de cifrado selectivo y NO lo aplica todavía a ningún campo — lo encenderán F2 (valor/notas) junto al pipeline multi-producto para no tocar dos veces las rutas de lectura/escritura.

## Consecuencias
- Los CSV exportados y la práctica actual no cambian de formato; los campos nuevos solo los usan quien los rellene.
- Base real para el catálogo/circuitos (F2+, F12): el tag y el origen son los disparadores de las reglas por venir.
