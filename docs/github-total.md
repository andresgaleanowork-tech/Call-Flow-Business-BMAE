# Decisión GitHub-Total — 07-oct-2026 (opción B, elegida por el usuario)

**Recontexto**: la norma §2 del maestro («nada fuera de GitHub salvo excepción
justificada») quedó ejecutada con 2 excepciones alojadas (VPS ERPNext v15 y
VPS Twenty). El usuario ha resuelto **purga total**: cero servicios externos
alojados, toda la operativa de la V1 sobre pura superficie GitHub
(Pages + Actions + Issues + Projects + Gist), y **facturación VeriFactu ya**,
desde workflows, concediendo los números de la fragilidad que se documentan
abajo (tolerancia informada, no descubrimiento posterior).

Este documento es la fuente de verdad de la re-arquitectura. Todo lo que
siga vigente de Twenty/ERPNext queda **archivado como referencia de
protocolo** (nada se borra).

## 1 · Veredicto §2 re-escrito

| Ocupaba | Pasa a | Estado |
| :--- | :--- | :--- |
| VPS ERPNext v15 (backend vivo) | **Cero**. La contabilidad/facturación se gobierna desde repo: «invoice-issues» + workflow SIF (§3) | archivado |
| VPS Twenty (CRM) | **GitHub Issues + Projects**: 1 issue por gestión comercial, labels = pipeline, board = vista | archivado |
| Login (OAuth + JWT RS256) | Sigue siendo GitHub-native; la rama gist heredada pasa a **única rama** y la V1 migra a *device flow* (ola F4G·w2) | vigente+pendiente |
| AEAT VeriFactu | **No opcional por ley**. La llamada sale desde Actions (antes: desde ERPNext) | vigente |

Servicios externos que **siguen existiendo como llamadas salientes** (no
alojados por nosotros): `github.com/login/oauth` (nuestro propio login),
`api.github.com` (nuestra superficie) y `*.aeat.es` (regulador, obligación
legal). Nada más: **0 alojados**.

## 2 · Mapeo de la V1 operativa

| Pieza V1 | Implementación GitHub-total | Notas |
| :--- | :--- | :--- |
| Web/landing/comparador/Call-Flow | Pages (salida por workflow `pages.yml`) | sin cambios |
| Identidad | OAuth GitHub; **device flow** para que la SPA obtenga token propio (F4G·w2, `frontend-auth/`) | hasta w2, canal CRM admite ruta manual honesta |
| Comparativa real | `import-catalogo-tarifas` hornea JSON versionado → cálculo en navegador | sin servidor |
| Cola Call-Flow → CRM | `lib/canalgithub.js` → comentario en **buzón-comercial** (issue fijado) → `cola-ingest.yml` crea/etiqueta issues de pipeline | §4 |
| Pipeline comercial | Labels (`segmento:*`, `resultado:*`) + Project board v2; el `opportunity-won` de Twenty se sustituye por label `pipeline:ganada` → checklist de alta | F4G·w3 |
| Clientes/contratos | Issues «ficha»; documentos en repo privado de operación | fuera de este repo público |
| Facturación VeriFactu | **workflow `verifactu-emitir.yml`**: invoice-issue (label `verifactu:emitir`) → XML SDK sellado → AEAT SOAP mTLS → CADENA en `datos/verifactu/cadena.json` (commit del bot) | §3 |
| Contabilidad | Export contable CSV por workflow (F4G·w4) + gestoría externa | gestoría ≠ software alojado |

## 3 · SIF VeriFactu en Actions — contrato

**Emisión de factura = creación de un invoice-issue** (plantilla
`.github/ISSUE_TEMPLATE/factura.yml`, JSON en el cuerpo). La cadena de
huellas (obligación de orden cerrado, RD 1007/2023) vive en
`datos/verifactu/cadena.json`, **en el propio repo**: cada emisión correcta
deja commit del bot — el libro de registro es audit-proof por definición de
Git.

| Aspecto | Contrato |
| :--- | :--- |
| Serialización | `concurrency: verifactu-cadena, cancel-in-progress: false` — NUNCA dos emisiones en paralelo (fork de la cadena) |
| Idempotencia | `ultimo.numero_serie` duplicado → NO-SOP exitoso; label `verifactu:registrada` ya puesta → salta |
| Entornos | `preproduccion` por defecto; label `verifactu:produccion` requiere environment `produccion` con **aprobación humana** |
| Secretos | `AEAT_CERT_PEM` + `AEAT_KEY_PEM` (certificado electrónico cualificado, enmascarado) en el environment, nunca en el repo |
| Respuesta AEAT | Comentario en el invoice-issue con huella, CSV o error; label `verifactu:registrada`/`verifactu:error` |
| Estado legible | `cadena.json` difeable en cada commit: «la factura N encadena con N-1» verificable a ojo |
| Firma XML | V1 sin XAdES (autenticación por certificado en el canal TLS, documento AEAT §4.3); si la misma AEAT exigiera firma → ola dedicada (xmlsec1) |

**Runbook de error**: fallo de curl/AEAT/500 → toast de workflow, label
`verifactu:error` con el XML como artefacto, nunca reintento ciego de la
misma `NumSerie` (idempotencia la decide el humano: corregir y re-etiquetar).

## 4 · Cola Call-Flow → CRM GitHub — contrato

`fusionarEnTwentySubida`: la SPA conserva `lib/cola.js` INTACTA (contrato
sellado); `subirGitHub(cola)` sustituye a `subirTwenty` en el botón de
`#/callflow/actividad`:

| Aspecto | Contrato |
| :--- | :--- |
| Transporte | `POST /repos/{owner}/{repo}/issues/{buzon}/comments` con **body JSON** (una gestión por línea, huella djb2 incluida) |
| Auth | `Bearer <token GitHub del comercial>` (`sessionStorage.bmae_gh_token`, procedente de device flow w2); **sin token → toast honesto + export JSON local** (manual SÍ, silencio NO) |
| Trigger | `issue_comment.created` en el issue buzón → `cola-ingest.yml` |
| Validación en Actions | autor ∈ (OWNER, MEMBER, COLLABORATOR); guardián anti-PII de nuevo; JSON bien formado; reacciona ✅/🚫 por comentario |
| Materialización | un issue por gestión en el proyecto operativo, labels `segmento:*`/`resultado:*`, origen `canal:callflow` |
| Idempotencia | índice `datos/crm/huellas-ingeridas.json` (commit del bot): huella ya vista → reacciona ♻️, no duplica |
| Rate | límites GitHub sobrados (5 000 req/h): ~1 600 gestiones/día/comercial de techo teórico |

## 5 · La fragilidad concedida — con números

Estos son los precios reales de la opción B, aceptados por el usuario el
07-oct-2026. Cada uno con su mitigación.

| Riesgo | Número honesto | Mitigación |
| :--- | :--- | :--- |
| **Latencia triggers** (`issue_comment` → job) | p50 ≈ 30–60 s, p99 = minutos en hora punta | la cola local (`cola.js`) sobrevive 200 eventos; subir ≠ urgente |
| **Colas de verifactu** | coincide, misma métrica; pero «remisión inmediata» del RD tolera ventanas cortas si el gesto fiscal es la emisión del issue | emisión = commit/issue; reintentos en `workflow_run`; alerta si error |
| **Minutos Actions** en free (repo privado) | 2 000 min/mes; SIF+ingest ≈ 1–2 min/gesto → ~100 facturas/día encajan x3 | control de uso en workflow mensual |
| **Rate limits API** | 5 000 req/h token usuario | lotes de 50 → 1 req; sobrado |
| **Cadena forkeada** (2 verifactu a la vez) | **imposible** por `concurrency` serialized | canary: `verifactu:audit` semanal valida cadena íntegra |
| **Bloqueo de Actions** (caída GitHub) | histórico ≈ 99.9 % | constancia + reintento humano; AEAT también cae y lo contempla el RD |
| **Secretos certificado** | PEM en cipher-at-rest; expuesto solo al job | rotación manual; environment con revisión |
| **Dosificador humano** | Projects v2 no es 100 % automatizable con `GITHUB_TOKEN` (v2 items necesitan token organizacional) | V1 usa labels+filtros guardados; auto-add = oleada futura |

## 6 · Oleadas

| Ola | Entregable | Estado |
| :--- | :--- | :--- |
| **F4G·w0 (esta)** | Decisión + canal GitHub construido (cola→CRM + SIF preprod) + docs + sello | ✅ 07-oct |
| F4G·w1 | Primer envío REAL preprod con certificado cualificado (gesto humano: alta certificado) → SMV/CSD/CSV comprobados; runbook | pendiente cert |
| F4G·w2 | Login device-flow nativo SPA (`lib/ghdevice.js` + ruta `#/login`, puente de claves B): token propio del comercial, rol comercial por acceso de escritura al repo | ✅ 07-oct · falta gesto humano CLIENT_ID (deploy §5) |
| F4G·w3 | Pipeline vivo en SPA (`lib/pipelinegh.js` + `#/gestor`: columnas por label `estado:*`, leído de Issues `canal:callflow` con Bearer del comercial) + ingest etiqueta `estado:contactada` por defecto + fallback contractual honesto | **V1 ✅ 07-oct** · Projects v2 auto-add pendiente (necesita token de org, §5) — arrastrar tarjetas = edición de `estado:*` en el issue |
| F4G·w4 | Comparativa con tarifario horneado (`datos/tarifario.json` + `lib/tarifario.js`: caso estándar honesto, logo Iberdrola comparativo, sello a rescrito) + H2 (facturas y panel vivo desde `cadena.json`, nunca mock legal) | ✅ V1 08-oct · actualización del tarifario = edición del JSON con `upd` |

## 7 · Checklist de aceptación de cumplimiento (entrada a producción)

1. Workflow `verifactu-emitir` ejecutado ≥ 3 veces en prewww2 con CSV
   devuelto y cadena íntegra (commites audibles).
2. Environment `produccion` con **aprobación obligatoria** activa.
3. Canal cola→CRM con 5 gestiones reales de un comercial sin error.
4. `contencion-github.md` re-verificado: grep de 0 dominios externos
   alojados (spa/servidor) salvo login + AEAT saliente.
5. Aviso comercial: este SIF cubre el RD 1007/2023 en su capa técnica
   únicamente; el asesor fiscal valida el circuito completo (obligaciones
   del emisor, conservación de QR/CSV por factura).
