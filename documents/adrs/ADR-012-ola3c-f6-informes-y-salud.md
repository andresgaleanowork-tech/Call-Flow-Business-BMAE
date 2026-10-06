# ADR-012 · Ola 3(c) — F6: informe semanal local + telemetría de salud (Q7) (v4.1.4 «Informe y salud»)

- **Estado**: ACEPTADO — implementado 06-10-2026 (v4.1.4, sw `cfb-v377`, batería +W27).
- **Marco**: PLAN §5 **F6 informes** y §7 **Q7 telemetría de salud → panel admin** (ambas previstas «Ola 3»). Carta blanca del usuario sobre alcance fino de la Ola 3 (desde ADR-010).
- **Depende de**: ADR-010 (métricas G2 — el informe REUSA `metMia()`; patrón repo privado por slug), ADR-011 (bus), whitelist de impresión (F18+, ADR-008).

## Contexto

Dos necesidades separadas que el roadmap junta en (c):

1. **El comercial quiere contar su semana** (al jefe, al equipo, o simplemente verse): hoy tiene actividad y embudo, pero ningún artefacto que la resuma.
2. **El despacho gestiona a ciegas técnicamente**: ¿la sincronización va lenta? ¿hay choques 409 (dos móviles escribiendo a la vez)? ¿pesan demasiado las fichas? Q7 pedía resolverlo con datos reales al panel admin.

## Decisión

### 1 · 📄 Informe semanal — `infSemana()` / `infAbrir()`

- **Datos**: `actLeer()` (actividad local: gestiones por día y movimientos del embudo por resultado) + `metMia()` (túnel y pipeline € ya testeados en W24) + `preLista()` (presupuestos del equipo por fase) + top de productos movidos la semana.
- **Entrada**: botón 📄 Informe en la cabecera del ☀ Hoy (motor → paridad pymes≡residencial de fábrica). Modal con el informe, botón **imprimir/guardar PDF** (`#cfbInfPrint` en la whitelist de impresión, mismo patrón que la propuesta F18+) y **copiar texto** (pegar en WhatsApp/correo, editable).
- **PRIVACIDAD — línea dura**: el informe es **100 % local**: jamás se sincroniza, jamás viaja al repo, jamás lo empuja ninguna regla. Además v1 muestra **solo agregados** (gestiones/día, €, movimientos, contadores — sin nombres de clientes): aún siendo local, viaja limpio si lo pega en un chat. RGPD: no añade ningún flujo nuevo de datos.

### 2 · 🩺 Salud del equipo — `salMarca()` / `salPublica()` + tarjeta admin

- **Ring local** `cfb_salud` (≤120 muestras `{tipo,ms,kb,f,h}`): latencias de sync y choques 409 que ya ocurren.
- **Disparadores**: `cliSyncPush` mide `sync_total` (ms + KB del lote cifrado) en su callback 200; `maePut` anota todo 409 **antes** de reintentar (el patrón anti-409 ya existente).
- **Publicación**: tras cada push ok (cadena G2 ya existente) → agregado por seudónimo a `datos/salud.json` (repo PRIVADO): `{ts, version, nPush, p50, p95, n409, kbMax, ultima}` — p50/p95 calculados sobre el ring (orden+índice exacto).
- **Panel**: tarjeta **🩺 Salud del equipo** en `admin.html` (tras 🧭/🛡): tabla por persona — versión de app, pushes, p50/p95 con semáforo (🟢 <2 s · 🟠 <5 s · 🔴 ≥5 s), contador 409, KB máximo y última actividad. Lectura por el `olaGet` ya creado en ADR-010.
- **Cero PII por diseño**: solo tiempos, contadores, tamaños y versión. Nunca nombres de clientes ni de fichas.

### 3 · Versión

Ola 3(c) → **v4.1.4 · sw `cfb-v377`** · tests **W27** (estáticas: hooks/panel/whitelist/paridad; funcionales: mates p95 exactos, ring acotado, publicación bajo seudónimo sin PII, informe agrega actividad real y queda fuera de cualquier sync).

## Alternativas descartadas (futuro, sin deuda)

- **Informe semanal del EQUIPO consolidado en admin**: v2 — cuando el despacho lo pida; ya tiene metros básicos en 🧭 (G3) y ahora salud 🩺.
- **Informe como artefacto F9 con plantilla/brand ed**: F9 sigue en roadmap; el informe v1 es HTML imprimible, suficiente para compartir.
- **Salud con histogramas completos por día**: el p50/p95 rodante responde la pregunta real (¿va lento?) sin ficheros pesados; descartado métricas por-día.
- **Aviso automático (regla F4) si p95 > 5 s**: fácil de añadir como regla cuando haya datos reales que calibren el umbral; prematuro ahora.
- **Telemetría a endpoint propio**: fuera de arquitectura (GitHub-duro); repo privado ≫.

## Consecuencias

- El comercial gana un **artefacto compartible** sin salir de la app; el despacho gestiona la salud técnica del despliegue **con datos, no con pálpito**.
- Todo reusa piezas certificadas (metMia, whitelist impresión, anti-409, olaGet, cadena G2) → superficie de fallo mínima.
