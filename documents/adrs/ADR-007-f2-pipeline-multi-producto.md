# ADR-007 · F2: pipeline multi-producto en la ficha (v4.0.2 · Ola 2b)

**Estado:** aceptada · 05-10-2026 · Ola 2(b) del plan v6

## Contexto
El cliente del nicho no compra «una cosa»: la misma empresa es candidata a tarifa 2.0TD + solar + mantenimiento en paralelo. Hoy la ficha v4 tiene **un único estado global**, así que «ganado la tarifa, negociando solar» no se puede representar — el arma de venta (F18+, Ola 2c) necesita además saber QUÉ producto se simula/propone en cada ficha. El catálogo (G5, Ola 2a) da ids estables para referenciar.

## Decisión

1. **Vacuna v5** en `crmNorm` (idempotente, round-trip): la ficha gana **`pis`** — ≤8 productos/pipeline del catálogo: `{id (≤24, saneado de ids del catálogo), est ∈ {prep,oferta,nego,gan,per}, nota ≤80 opcional}`. Micro-pipeline corto a propósito: el estado *global* de la ficha sigue gobernando la jornada (Hoy/F4); `pis` describe *qué* se vende y en qué fase está cada uno.
2. **Editor 360º** (bloque «🧩 Productos» tras Tags/Contactos): chips por producto (tag+nombre+fase), selector para añadir (del catálogo activo), fase y ✕ por pieza — CRUD inmediato estilo tags/contactos (`crmPiAdd/crmPiEst/crmPiDel`).
3. **Opciones del catálogo**: desde `cat_cache` si está caliente, si no el seed embebido; semántica: ids desconocidos del catálogo se conservan en ficha (el admin puede reactivarlos), solo se sanean por forma.
4. **Embudo por producto para el mando**: `crmPublicaResumen` agrega ahora `pc` (recuentos por producto×fase, **anónimos — sin nombres ni empresas**). El panel admin verá el pipeline comercial por línea. RGPD sin cambios: nada de texto personal sale del dispositivo.
5. **CSV + última columna** `productos` (`id:fase;id:fase`) — formato viejo se sigue leyendo igual.
6. **Buscador global** incluye los ids de producto (`pipo tarifa30` encuentra la ficha).
7. **Filtro 🧩 por producto** en la tabera de Clientes (ver solo fichas con X en prep/oferta/nego).

## Alternativas descartadas
- Una ficha por producto por empresa: duplicaría contactos/notas y rompería ☀ Hoy.
- Pipeline por producto de 8+ fases: demasiado para venta telefónica directa; 5 fases cortas auditan bien (F4 reglas las usará en Ola 3).
- Embudo con importes: sin importes por diseño en v1 (`pis.nota` libre); F18+ traerá cuantía simulada por producto.

## Consecuencias
- Esquema v5 con vacuna como en v4 (conserva todo, determinista); el sync G4 y el CSV crecen transparentemente (S1 ya cifra `pis` por pertenecer a `notas/campos sensibles`… **actualización**: `pis` se añade a CRM_S1_SENSIBLES para viajar cifrado).
- Seeds de supervivencia: fichas/admin/buscador funcionan aunque el catálogo no llegue.
