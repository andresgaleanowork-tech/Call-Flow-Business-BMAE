# Changelog — Call Flow Business

## v3.1.0 «Actividad» — 2026-09-30
- **📊 Página `actividad.html` nueva** (enlace desde index y desde el menú ⚙ de ambos guiones):
  - **Registro automático** al terminar: ⏱ fin de llamada cronometrada (con duración), nota rápida (dedupe 10 min), roleplay, quiz corregido, caso práctico y cada cambio de estado CRM.
  - ＋ Gestión manual (llamada/email/seguimiento/reenvío factura/coordinación visita/CRM/otro) con resultado, ciudad, fecha y hora.
  - Dashboard por día/semana/mes: KPIs (gestiones, contacto efectivo %, fact. solicitadas→recibidas, minutos, práctica), **gráfica de barras por día con línea de objetivo (editable, def. 80)**, **embudo CRM en vivo**, top localidades, por tipo y resultado, y **pipeline €/mes**.
  - Resultado corregible en línea, borrado por gestión y **export CSV del mes** (semi-columns, BOM Excel).
  - Datos: clave `bm_actividad_<burbuja>` (vía `cfbPref`) → viaja por la sync del equipo; SIN nombres de cliente (los nombres quedan solo en `cli_registros`, que nunca sale). Tapón FIFO 3000.
- Corregido en el arnés de tests: el resumen de `bateria-qa.js` imprimía ANTES de las olas W11/W12 (las dejaba mudas); ahora cuenta de verdad (**472 comprobaciones**) y el tapón FIFO se prueba sembrando, no con 3000 escrituras reales.
- Versión 3.1.0 · versionCode 36 (APK, que ya empaqueta actividad.html) · caché SW `cfb-v310` · tests 472+64+13 ✔ · E2E actividad jsdom ×2 (10+2) ✔.

## v3.0.0 «Mini-CRM» — 2026-09-30
- **👥 Clientes (nueva pestaña + botón en barra)**: mini-CRM dentro de PYMES y Residencial.
  - Ficha completa: teléfono, sector, ciudad, comercializadora, factura €/mes, dolor, notas con fecha.
  - Embudo de estados: nuevo → contactado → interesado → factura → cita → visita → ganado / perdido (cambio deja nota automática).
  - Próxima acción (fecha/hora/texto) y vista **«⏰ Hoy toca»** (incluye vencidas); chips de filtro por estado + buscador.
  - **📞 Preparar llamada**: precarga `guion_vars` (NOMBRE_CLIENTE/SECTOR/CIUDAD/COMERCIALIZADORA_ACTUAL) y abre el guion en el nodo adecuado al estado (apertura/detección/cierre de factura, cita, técnico, seguimiento o retirada).
  - Export CSV (`clientes-YYYYMMDD.csv`), tapón de 80 fichas/20 notas, migración automática v1→v3.
  - Todo en `localStorage` (`cli_registros`), prefijo `cli_` — datos SOLO en el dispositivo (nunca sale en sync/QR).
- **Barra superior agrupada**: [🔬🎯⏱👥📋]·[🎭]·[⚙ Ajustes ▾]·[👤]; ↺ Reiniciar, 🔡 Texto grande (nuevo, persiste), 🗑 Vaciar clientes y © Créditos viven en el menú ⚙.
- 📝 Nota rápida enriquecida: si lleva teléfono, se guarda también en la ficha CRM.
- i18n: 22 cadenas nuevas ES→FR/PT/EN del cromo CRM.
- Versión 3.0.0 · versionCode 35 (APK) · caché SW `cfb-v300`.
- Tests: batería W11 (+19) → `pymes` 437 ✔ · `residencial` 61 ✔ · visual 13 ✔ · E2E CRM jsdom ×2 (10+4) ✔.

## v2.9.6 «Babel · ola 4» — 2026-09-28
- 93 bloques `nat` + glosarios por mercado dinámicos; superficie de llamada 100 % ES/FR/PT/EN (tutorial/quiz/diploma/casos/FAQ/onboarding quedan en ES).
- Tests 437+58+13 ✔ · `apps/web/tests/verificar-ola4.js`.

*(Entradas anteriores: ver docs/PLAN-OLAS-I18N.md y docs/PLAN-IMPLEMENTACION.md.)*
