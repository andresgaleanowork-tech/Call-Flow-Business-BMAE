# ADR-005 · F3 «Hoy» — vista diaria unificada del CRM (v3.12.0)

**Estado:** aceptada · 05-10-2026 · Ola 1(c) del plan v6
**Contexto:** el CRM tenía próximas acciones vencidas/hoy escondidas en un bloque plano del segmento clientes y los potenciales «reintento hoy» en otro riñón — y, peor, **no existía ningún enlace navegable de Clientes → Potenciales** (hueco de UX descubierto al auditar el código de segmentos en E0).

## Decisión
1. **Nuevo segmento `hoy`** en la pestaña 👥 Clientes: agenda del día con tres grupos — **⚠ vencidas** (próx. acción de fichas abiertas con fecha < hoy, rojas), **🕐 hoy** (== hoy, ordenadas por hora) y **🔥 potenciales de reintento** (del banco compartido, `proTocaHoy()` ya existente) — más el marcador del día (llamadas hoy · vencidas · toca hoy · potenciales).
2. **Barra de segmentos unificada** «☀ Hoy / 👥 Clientes / 📋 Potenciales» visible en las **tres** vistas (cierra el hueco de navegación). El segmento por defecto **sigue siendo `cli`** (compatibilidad con hábitos y con la suite: nada de aterrizajes automáticos «inteligentes»).
3. **Atajos de acción** desde cada fila: «📞 preparar llamada» (precarga guion) y la fila al completo abre la ficha en clientes limpiando filtros (`crmIrFicha`). Las acciones siguen siendo síncronas sin estado global nuevo.
4. **Sin esquema ni sync nuevos**: vista pura sobre fichas v4 (`crmAbierto`, `prox`) y potenciales (`proTocaHoy`). El resumen al admin sigue inalterado y anónimo. Detrás quedan para olas sucesivas: logros del día (F17), sugerencias F22…
5. i18n: cadenas por `T()` igual que el resto del cromo; sin traducciones nuevas obligatorias (si faltan, se muestran en ES, patrón vigente).

## Consecuencias
- Positivas: el comercial abre la app y tiene la jornada entera a un chip; navegación clientes⇄potenciales por fin alcanzable desde ambas vistas.
- Riesgos: ninguno de datos (solo render). La vista se regenera idéntica en pymes/residencial (factoría, ADR D2).
