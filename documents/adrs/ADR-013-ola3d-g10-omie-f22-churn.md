# ADR-013 — Ola 3(d): G10 OMIE (tarifas vivas) + F22 churn (riesgo de fuga) → 🏁 v4.2

## Contexto

La Ola 3 se cierra con las dos piezas de nicho que dependían una de la otra: **G10 OMIE**
(precio del pool eléctrico diario dentro de la app) y **F22 churn** (aviso de clientes con
riesgo de fuga). ADR-008 ya dejó escrito que «el precio llega con F22/OMIE (Ola 3) que trae
tarifas vivas». El nicho es energía (agentes/comercializadoras): el pool OMIE es la referencia
que el comercial cita en cada llamada, y la fecha de fin de contrato del cliente es LA señal
de riesgo número uno.

Restricciones heredadas que mandan aquí:
- **Línea dura RGPD**: la app solo hace `fetch` al propio repo (GitHub Pages / API GitHub).
  Nunca a terceros desde el dispositivo. OMIE.es NO se consulta desde la app.
- **Paridad de fábrica**: todo en `MOTOR_CORE.js` → pymes y residencial nacen iguales.
- **Vacuna idempotente + tests históricos congelados** (W21/W23 asertan literalmente
  `if(f.v!==6){ f.v=6; }` y `vac.v===6`). No se pisan.

## Decisión

### G10 — pool OMIE local-first (`datos/omie.json` + Action)

1. **Formato**: `datos/omie.json` = `{ "v":1, "dias":{ "AAAA-MM-DD": €/MWh (media aritmética
   del precio marginal diario, 2 decimales) } }`, podado a **400 días** (≈13 meses).
2. **Fuente = GitHub Action diaria** (`.github/workflows/omie.yml`, cron tras la publicación
   de resultados ~14:30 CET): descarga `marginalpdbc_AAAAMMDD.1` de omie.es con curl,
   parsea tolerante (split `;`, decimal con coma o punto), hace la media, la mergea y hace
   commit solo si hay cambio. Si omie.es no responde → `::warning::` y exit 0: el repo y la
   app no dependen de que ese día haya dato.
3. **Lectura en la app = patrón catálogo** (`catalogoGet`): caché LS `omie_cache` 8 h →
   `fetch('datos/omie.json')` relativo (mismo origen, no es tercero) → tolerante a 404
   (repo sin Action todavía = estado «sin datos», no error). Helpers síncronos
   `omieMedia(dias,n)` y `omieUlt(dias)`.
4. **Fallback manual 100 % local**: `omieManual(txt)` acepta `«87.42»` (→ hoy) o líneas
   `«AAAA-MM-DD 87.42»`; mergea sobre `omie_cache`. Caso de uso: comercial que ve el precio
   en la web de OMIE y quiere citarlo en la visita sin esperar al Action.
5. **Entrada UI**: botón ⚡ junto al 📄 del «Hoy» → modal (mismo patrón `infAbrir`): último
   precio+fecha, media 7/30 días, tendencia 7 días vs 7 previos (▲/▼ %), fuente
   (repo/caché/local), botón actualizar y pegado manual. Sin datos: mensaje honesto
   «sin precio todavía — péguelo aquí o active el Action».

### F22 — riesgo de fuga (`crmRiesgo` + sección en «Hoy»)

1. **Dos campos nuevos en ficha (sin bump de v)**: `fin_contrato` (`AAAA-MM-DD`) y
   `precio_kwh` (lo que paga hoy por kWh). Se añaden a la lista de strings que `crmNorm`
   ya normaliza (anexión idempotente: las fichas viejas los reciben vacíos al pasar por
   `crmNorm`). **Regla fijada**: la `v` solo sube cuando hay migración *activa*
   (recrear estructura anidada como v4 contactos / v5 pis / v6 privada); añadir strings
   opcionales no la justifica y protege los tests congelados. CSV: +2 columnas al final
   (el formato viejo se sigue leyendo igual — mismo patrón F2).
2. **Score 0–100, determinista, tres señales sumadas** (sin red, sin ML):
   - **Contrato** (a abierto o ganado): vencido/≤30 d → 50 · ≤60 d → 40 · ≤120 d → 25 ·
     después o sin fecha → 0. *(ganado cuenta: es justo donde la fuga duele; `perdido` no suena).*
   - **Sin toque** (máx de `creado` y `notas[].f`): ≥45 d → 25 · ≥21 d → 18 · ≥10 d → 8.
   - **Precio vs pool** (solo si hay las dos cosas): `precio_kwh > 2.2 × pool30` → 25 ·
     `> 1.8 ×` → 8. Pool30 = `omieMedia(dias,30)/1000` €/kWh. El factor es la amplificación
     habitual pool→precio final (peajes+márgenes); sin OMIE o sin precio → 0, nunca inventa.
   - Cap a 100. Devuelve `{sc,por:[motivos en lenguaje humano]}` — el vendedor lee el porqué.
3. **Superficie**:
   - «Hoy»: KPI `🧯 n en riesgo` en la barra de stats + sección **«🧯 Riesgo de fuga»**
     (top 5 por score ≥25, fila → ficha) solo si hay alguno (día limpio no grita).
   - Fila de lista: badge 🧯 score cuando ≥40; ficha abierta: banner con los motivos.
   - Editor de ficha: dos inputs (📑 date + ⚡ número) en la misma línea que «Próx.».
4. **Privacidad**: nada nuevo sale del dispositivo. Los dos campos viajan con la sync F5
   como el resto de la ficha (datos de empresa, no especiales). El informe F6 suma una
   línea **agregada** (`🧯 3 en riesgo alto · 2 medios`) sin nombres. Admin: tarjeta
   pequeña «⚡ OMIE» (último precio + fecha de los datos públicos del repo) — cero PII.

### Sello

Al cerrar (d) con la batería verde y los 9 ficheros de suite: **🏁 v4.2.0 «Tarifas vivas y
riesgo» — OLA 3 TERMINADA**. (Actualizar PLAN-CRM y README; bump `cfb-v378`.)

## Alternativas descartadas

- **Fetch directo a OMIE/ESIOS desde la app**: viola la línea dura (solo GitHub) y mete CORS,
  tokens de REE y disponibilidad de terceros en el móvil del comercial. El Action mueve ese
  acopio a CI, donde fallar es gratis.
- **Vacuna v7**: dos strings opcionales no son migración; rompía W21-2/W21-14/W23-14
  congelados para ganar nada.
- **Score con ML / historia**: sin dataset, no determinista, no explicable al vendedor.
- **Churn en admin agregado por compañero**: aplazado — el resumen F5 ya lleva pc y el
  dueño lo ve en su informe si lo quiere; F22 v2 lo decidirá un ADR.
- **Widget OMIE permanente en cabecera**: ruido; el pool se consulta cuando se prepara
  llamada/oferta, no 40 veces al día.

## Consecuencias

- `MOTOR_CORE.js`: bloque G10/F22 ante el ancla del cromo + toques en `crmNorm` (lista),
  `crmHoyHtml` (KPI+sección+botón ⚡), `crmFila` (badge/inputs/banner), `crmGuardar`,
  `crmCsv`, `infSemana` (línea agregada). Plantillas: **sin cambios** (modal OMIE sin
  impresión propia).
- `admin.html`: tarjeta ⚡ OMIE (lectura pública).
- `.github/workflows/omie.yml`: nuevo (repo de datos; no afecta al build).
- W28 ≈16 (estáticas + funcionales jsdom: medias/tendencia OMIE, score por señal,
  sección «Hoy», CSV columnas, anexión sin v, informe con riesgo). Suite 9/9 + D2 + EXE.
