# F4-prep · Contrato de subida Call-Flow → Twenty (vía Frappe)

Canal **H1b** sellado 07-oct-2026. La SPA sube su cola local (`lib/cola.js`) al
backend GitHub-First; **nunca habla con Twenty directamente** (tokens de
servicio solo en servidor, §2 de `contencion-github.md`; una única llamada
síncrona, D-B1). Cuando el VPS ERPNext esté operativo, se cumplimenta
`BASE` en `apps/web/src/lib/twenty.js` (mismo placeholder §F2 que `api.js`)
y el canal queda enchufado **sin tocar una línea de UI**.

## Topología

```
SPA (Pages)  ── POST /api/method/bmae.callflow.registrar_gestiones ──▶  Frappe (VPS)
    Authorization: Bearer <bmae_access de B>                                 │
                                                     crea Note/Activity +    │
                                                     mueve etapa Opportunity ▼
                                                                   Twenty (mismo VPS)
```

- `opportunity-won.yml` / `sync-twenty-to-erpnext.yml` (A5) siguen siendo los
  dueños del pipeline; la subida **solo añade actividad y etapa**, nunca rompe
  la sincronía bidireccional.

## Petición

| Aspecto | Contrato |
| :-- | :-- |
| Método / ruta | `POST {BASE}/api/method/bmae.callflow.registrar_gestiones` |
| Auth | `Bearer` con `bmae_access` (sesión B; en F4 la envoltura con refresh de `frontend-auth/auth.js` sustituye la lectura directa) |
| Body | `{ "gestiones": [ {segmento, resultado, nota, ts, pos, huella} … ] }` |
| Lote | máx. **50** gestiones por POST; el cliente envía los lotes secuencialmente (cola total ≤ 200, contrato `cola.js`) |
| Timeout | 10 s por lote (`AbortController`) |
| `huella` | djb2(`segmento\|resultado\|nota\|ts`) en base36 — **idempotencia, no seguridad**: el servidor descarta duplicados por huella con ventana de 24 h |
| PII | **doble guardián**: el cliente rechaza teléfono/email/documento *antes de encolar*; el servidor vuelve a validar y rechaza el lote completo ante cualquier violación. La cola jamás lleva CUPS ni datos de contacto (eso va en la ficha, flujo captación/alta) |

## Respuestas

| HTTP | Significado | Efecto en la cola local |
| :-- | :-- | :-- |
| `200` `{procesadas: N}` | **transaccional**: las N gestiones del lote quedaron registradas | el cliente vacía la cola (`fusionarEnTwenty`) solo tras subirla íntegra |
| cualquier `{procesadas}≠N` | respuesta incoherente: se trata como fallo | **intacta** |
| `4xx/5xx/red` | nada comprometido en servidor (idempotencia por huella: el reintento es seguro) | **intacta** — nunca se pierde una gestión |

## Mapeo en Twenty (lado servidor)

| `resultado` | Acción Twenty |
| :-- | :-- |
| `Interesado/a` | Activity+Note; Opportunity → etapa caliente del pipeline A5 |
| `Pendiente de seguimiento` | Activity+Note con recordatorio (next-activity) |
| `Permanencia`, `No interesado/a`, `No contesta`, `No disponible` | Activity+Note con etiqueta de resultado; etapa según playbook A5.1 |
| `segmento` (`residencial`/`pymes`) | etiqueta de canal comercial |
| `nota` (≤140) | cuerpo de la Note |

## Cliente ya implementado

- `apps/web/src/lib/twenty.js` — `subirTwenty(cola, {base?, fetchImpl?})` con
  transporte inyectable (tests offline), lotes, timeout, Bearer y saneado.
- `apps/web/src/paginas/callflow.js` → `#/callflow/actividad`: botón
  **«⬆ Enviar cola a Twenty»**; hoy informa honestamente de que el endpoint
  llega con F4 (cola a salvo), mañana sube de verdad.
- Tests: contrato verificado sin red (200/500/payload/ParseError) en
  `apps/web/tests/app.test.mjs`.

## Checklist para enchufar (F4, ~1 sesión si el VPS responde)

1. `twenty.js` y `api.js`: escribir `BASE` real (§F2).
2. Implementar y publicar el método Frappe `bmae.callflow.registrar_gestiones`
   (valida guardián + huella + transacción + mapeo Twenty).
3. Envoltura fetch con refresh (B) llamando a `subirTwenty`.
4. QA E2E: 3 gestiones de prueba → Notes/Activities visibles en Twenty.
