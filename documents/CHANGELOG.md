# Changelog — Call Flow Business

## v3.9.0 «Enlace de acceso» — 2026-10-02 · el comercial SOLO abre un enlace y pone su ID
- **Fricción cero para el equipo**: el admin genera desde su panel un **enlace de acceso** (`index.html#eq=<contraseña>`) y lo pasa por WhatsApp/correo interno. Quien lo abre **entra directo**: la app descifra la clave sola y solo queda poner el ID. Sin teclear contraseñas.
- **La contraseña viaja en el `#`fragmento**: nunca la envía el navegador a ningún servidor ni queda en logs/analíticas; y la app la **borra de la barra** tras usarla (`replaceState`).
- **Caducidad natural**: si el admin cambia la contraseña del equipo, los enlaces viejos dejan de servir → tarjeta con aviso «pide uno nuevo» (sin exponer nada). Con clave ya guardada, el enlace solo se limpia y sigue el arranque normal.
- Admin: botones «📋 Crear y copiar el enlace» / «👁 ver» en la tarjeta 🔑 (usa la contraseña del momento o la guardada).
- 🧪 **560** ✔ batería (+4) · e2e clave-equipo **29** ✔ (+7: entra sin teclear, hash limpio, caducado sin fuga, admin genera) · resto de suite ✔.
- 🔃 sw `cfb-v364` · EXE regenerado.

## v3.8.0 «Clave de equipo cifrada» — 2026-10-02 · el comercial solo usa su ID + contraseña del equipo
- **Modelo nuevo de claves (sustituye al reparto manual de v3.7)**: la clave real vive **cifrada en la web pública** (`clave-equipo.json` · AES-GCM-256 + PBKDF2 SHA-256 ×250.000, cifrado hecho en el navegador del admin). Cada comercial entra **una sola vez con su ID + la contraseña del equipo**; la app descifra y guarda la clave en local.
- **Panel admin → «🛡 Publicar / rotar la clave»**: pega la PAT (validada contra **ambos** repos antes de subir), elige la contraseña del equipo y publica. Rotación en 2 min sin tocar a nadie.
- **Rotación silenciosa en los dispositivos**: si el admin rota y republica, el móvil sin clave válida se autorrepara al entrar usando su contraseña guardada (`cfb_eq_pass`) — sin pedir nada a nadie.
- **Fallback intacto**: enlace «tengo la clave larga» siempre disponible (admin, PC de sobremesa, o si el cifrado nativo no está disponible en el navegador).
- Tarjeta 🔑 de dos modos en el gate: «contraseña del equipo» (si hay blob publicado) ⇄ «clave larga», con ida y vuelta.
- Procedimiento completo y riesgos/mitigaciones: `docs/ROTACION-CLAVE.md` (reescrito).
- 🧪 **556** ✔ batería (+8 de v3.8) · nuevo e2e `tests/e2e-clave-equipo.js` **22** ✔ (admin publica → móvil entra con contraseña → contraseña mala rechazada → rotación silenciosa → fallback) · 33+71+10+7 ✔ · i18n ✔ · D2 golden ✔.
- 🔃 sw `cfb-v363` · EXE regenerado.

## v3.7.0 «Clave fuera + Decisión» — 2026-10-02 · Seguridad y Fase 3 del plan 33k
- **🔑 Clave desacoplada (punto 3)**: la app ya **no contiene** ninguna PAT de GitHub. Cada dispositivo pide la clave al primer uso (tarjeta «🔑 Clave del equipo»), la valida en vivo contra el repo y solo entonces la guarda en local. Vacuna v2: al cargar se purga automáticamente cualquier token heredado de builds ≤3.6. Si el token caduca o se revoca, la app lo detecta (401/403) y deja pegar una nueva. **El admin debe revocar la PAT vieja y repartir la nueva** → procedimiento en `docs/ROTACION-CLAVE.md`.
- **🎯 Decisión de tandas (Fase 3)** en la tarjeta Maestro del admin: join real `banco × maestro` —
  - **Ritmo**: fichas dedicadas en los últimos 7 días, puñados/semana y **previsión de semanas hasta agotar el maestro**.
  - **Tabla por puñado** (top 15): grupo, quién lo trabaja, reclamados, **CE%** (llamadas con resultado), **POS** (pide factura · cita · ya es cliente), **CONV** (altas reales al CRM con %), descartados y último toque. Las altas manuales no ensucian las métricas.
  - **Sugerencia de siguiente puñado**: con ≥20 trabajados, el libre del grupo con mejor conversión; si no, el mayor puñado libre.
  - **⬇ CSV conversión por puñado** y **🗄 Volcado maestro → CSV** (secuencial con progreso, tolera 404; solo admin).
- Importador `tools/importa-maestro.py`: orden de token v3.7 (`$CFB_TOKEN` → `tools/.cfb_token` → legacy).
- 🧪 548 ✔ batería · e2e maestro-admin 22→**33** (G1–G11 de decisión) · 71+10+7 ✔ · i18n ✔ · ola4 ✔.
- 🔃 sw `cfb-v362` · APK vc43 · EXE regenerado — las assets empaquetadas ya NO llevan clave.

## v3.7.0b (distribución) — 2026-10-02 · APK retirado temporalmente
- Se elimina `apps/android/` (proyecto WebView, APK, keystore demo) y el job de CI del APK: el canal Android queda en **PWA** (`instalar.html`). Guía completa de reconstrucción futura en `docs/android-historico.md` (incluye SHAs finales y receta de build sin Gradle). **Sin cambios en la app** (version.json sigue en 3.7.0; el EXE y la web actuales no requieren rebuild).

## v3.6.1 «Maestro nota» — 2026-10-02 · DATASET IBERCRM real cargado
- **Maestro real publicado**: `DATASET-IBERCRM 300626.csv` (33.161 filas · 100 % Valencia) → **29.152 únicos** → **133 puñados** (`lote_P0001…P0133`) + `idx.json` (9,6 KB) + `informe.json` en `datos/maestro/`. Dedupes: 2.707 internos · 0 contra repo · 1.302 dudosos (sin tel).
- **Importador acoplado al CSV real**: encoding robusto (utf-8 → latin-1), cabeceras en inglés (`Company Name/State/City/…`), columnas Address/Postal/Email/Website, y **agrupación por ciudad** cuando no hay sector (top ≥120, resto plegado).
- **Nota rica en cada tarjeta**: dirección · CP · ✉ email · 🌐 web viaja en el lote y **al reclamar entra al banco** (campo `g`); el comercial los ve sin tocar nada (W16-16b).
- 🧪 544+71 ✔ + E2E ×3 (maestro-admin 22) · D2 golden ✔.
- 🔃 sw `cfb-v361` · APK vc42 · EXE regenerado.

## v3.6.0 «Maestro admin» — 2026-10-01 · Fase 2 del plan 33k
- **🗂️ Tarjeta «Maestro» en el panel admin** (`admin.html`): totales libres/reclamados con %, barras por provincia (verde/ámbar/rojo), tabla de puñados con movimiento (🟢 libre · 🟡 parcial · 🔴 agotado), detalle on-demand por puñado (contadores y por quién se lo llevó — **nunca teléfonos**), exclusión por motivo y por quién, informe del último import, y botón ⬇ CSV por puñado (con BOM, sin teléfonos).
- **Motor único (deuda estructural)**: los 129 símbolos top-level del motor (banco, maestro, exclusión, sync, CRM, examen…) se pusieron **una sola vez** en `tools/factory/contenido/comun/MOTOR_CORE.js`; ambas plantillas lo inyectan vía `@EDITORIAL:MOTOR_CORE@` y build.js entiende la carpeta `contenido/comun/`. Plantillas −1.011 líneas. Nuevo guardián `tools/qa/motor-singleton.js` que falla si alguien re-duplica el motor.
- **Robustez del taller**: `tools/qa/run-tests.sh` (mantiene jsdom en `~/.deps` tras limpiezas de snapshot) y `tools/setup-toolchains.sh` (JDK21 + SDK-Android + Go reinstalables idempotente).
- 🧪 543+71 ✔ + E2E ×3 (actividad 10, admin 7, **maestro-admin 22**) · D2 golden byte-idéntico tras el refactor.
- 🔃 sw `cfb-v360`, APK vc41.

## v3.5.0 «Maestro» — 2026-10-01 · Fase 1 del plan 33k
- **📥 Reponer (reclamar puñados)**: nueva vista dentro de potenciales. El equipo ve el maestro 33k del repo (puñados de 250 por provincia × sector) y se sirve un puñado entero de una pulsación. El claim marca `st:rec + owner` con sha/409-retry — si dos piden lo mismo, gana el primero y el segundo solo trae los libres restantes.
- **Frenos del claim**: nunca supera los 500 activos del banco, salta teléfonos ya presentes (mismo proTelN de 9 dígitos) y salta lo ya tomado por otro compañero.
- **Exclusion compartida del equipo**: nueva lista `datos/exclusion.json` («no volver a llamar»). Se sincroniza como el banco (push debounced 9 s, flush al arrancar+sync a la vuelta de red) y se aplica a cualquier alta o claim por teléfono normalizado. Quitar es posible con `window.excQuitar`.
- **Descarte dual**: al marcar «Descartado» en un potencial, la app pregunta «¿‚NO VOLVER A LLAMAR MÁS?» — Aceptar lo añade a la exclusión compartida + cierra la ficha; Cancelar solo descarta.
- **Importador** `tools/importa-maestro.py`: CSV Excel cualquier cabecera (aliases nombre/tel/tel2/ciudad/provincia/sector/nota, sep auto, UTF-8-sig), normaliza teléfonos a 9 dígitos, dedupe interno + contra banco + contra exclusión + contra lotes ya en el repo, trocea en puñados de 250 homogéneos provincia×sector, genera `idx.json` (sin teléfonos) + `informe.json` y sube todo con `--subir` (dry-run por defecto).
- **Banco 500 intocable**: el maestro no entra en ningún dispositivo; cada app solo descarga el índice (<60KB) + el puñado reclamado (~55KB).
- 🧪 543+71 ✔ + E2E ×2 · W16 = 10 funcionales jsdom (Reponer/conferma/claim/exclusión dual PUTs).
- 🔃 sw `cfb-v350`, APK vc40, EXE regenerado (firma AuthentiCode por CI al tag).

## v3.2.0 «Admin actividad» — 2026-09-30
- **Panel admin actualizado** con todo lo nuevo:
  - **📊 Gestiones del equipo (registro automático)**: Hoy/Semana/Mes por comercial, contacto efectivo %, facturas solicitadas→recibidas, minutos cronometrados, % anotado sin tocar nada y última actividad — todo leído de las burbujas `bm_actividad_<slug>` (mismo botón ↻ Actualizar).
  - **🧲 Embudo CRM del equipo**: cada dispositivo publica `bm_crm_resumen_<slug>` (solo CONTADORES: fichas por estado, fichas totales y pipeline €/mes — **jamás nombres, teléfonos ni notas**). Admin ve totales del equipo + tabla por comercial.
  - **🎯 Objetivo de gestiones diario del equipo**: campo `metaActividad` en `equipo.json` (1–300); `actividad.html` lo muestra como «meta equipo» y cada comercial puede sobreescribirla local (`bm_act_meta`).
- Dispositivos: el resumen CRM se republica en cada escritura CLI (hook en `cliGuardarTodo`), en ambos guiones.
- Versión 3.2.0 · versionCode 37 (APK) · caché SW `cfb-v320` · tests 482+66+13 ✔ · E2E admin jsdom ✔.

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
