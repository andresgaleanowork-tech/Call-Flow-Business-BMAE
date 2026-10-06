# ADR-011 · Ola 3(b) — F4: bus interno de eventos + reglas en datos (v4.1.2 «Automatismos»)

- **Estado**: ACEPTADO — implementado 06-10-2026 (v4.1.2, sw `cfb-v375`, batería +W25).
- **Marco**: PLAN-CRM §8 **M3** («reglas en datos, no en código — crecer = editar datos») y **M4** («bus interno: añadir comportamiento no toca los módulos»). Carta blanca del usuario sobre el alcance fino de la Ola 3 (misma sesión que ADR-010).
- **Depende de**: ADR-009 (sync ⇔ dk), ADR-010 (la vista «Hoy» ya existe como hogar de tarjetas; S2 auditoría disponible).

## Contexto

F4 en el catálogo es «automatismos»: que la app *reaccione* a lo que pasa (una oferta se mueve, una ficha pide factura…) sin que el comercial tenga que acordarse. El marco manda hacerlo en dos capas desacopladas:

1. **un bus de eventos interno** al que cualquier módulo presente y futuro se enchufa;
2. **las reglas como DATOS** (no código), con semilla embebida y sustitución por JSON — la misma arquitectura que G5 catálogo (ADR-006).

## Decisión

### 1 · Bus (M4)

`window.busOn(evt,fn)` / `window.busEmite(evt,data)` — **síncrono**, cada oyente en su `try/catch` (un oyente roto no mata a los demás ni al emisor), tope 20 oyentes por tipo. Emisores v1 (los puntos que YA existían):

| evento | dónde se emite | data |
|---|---|---|
| `ficha.movio` | `cliUp` (cambio real de estado) | `{nombre, de, a}` |
| `pi.movio` | `crmPiEst` | `{nombre, id, est}` |
| `pre.movio` | `preEst` / `preAdd` | `{id, est, nombre}` |
| `nota.nueva` | `cliAnadir` | `{nombre}` |
| `sync.ok` | `cliSyncPush` 200 | `{n}` |
| `sim.hecha` | puente simulador → embudo | `{nombre, tipo, ahorro, idProd}` |

Tras los oyentes, `busEmite` evalúa también el motor de reglas (§2) dentro de otro `try/catch` — **emitir nunca rompe nada**.

### 2 · Reglas en datos (M3)

- **Repositorio público** `datos/reglas.json` (mismo patrón que `datos/catalogo.json`: lectura Pages relativa sin token, caché sesión 8 h, semilla embebida si falta). Sin PII: son definiciones de automatismo del equipo.
- **Forma de regla** (normalizada a la entrada — tolerante por delante):

```json
{ "id": "pi-oferta", "cuando": "pi.movio",
  "todo": { "est": "oferta" },
  "haz":  { "tipo": "aviso", "texto": "📄 ${id} ofertado en ${nombre}: prepara comparativa" } }
```

- `todo` = todas las claves deben cumplirse (igualdad por string vaciada). `${campo}` en `texto` se rellena desde `data` del evento.
- **`haz.tipo` v1 (tres efectos, y solo tres)**:
  - `aviso` → queda en la tarjeta **🔔 de la vista «Hoy»** (`cfb_avisos`, ≤30, con botón limpiar) + intento de `toast`.
  - `prox` → si el evento trae `nombre` de ficha: programa próximo paso `hoy + dias` (def. 7) con `accion=texto` — **solo si la ficha no tiene ya algo programado hoy o a futuro** (un automatismo jamás pisa la agenda del comercial).
  - `nota` → apunta `texto` como nota de la ficha (`cliAnadir`, hereda su saneado).
- **Semilla (4 reglas)**:
  1. `pi-oferta`: `pi.movio` con `est=oferta` → aviso «prepara comparativa con su factura».
  2. `pi-gan`: `pi.movio` con `est=gan` → `prox` +15 d «post-venta: firma y primer ahorro».
  3. `ficha-factura`: `ficha.movio` con `a=factura` → aviso «pide la factura / simulación 📄 en la ficha».
  4. `pre-aprobada`: `pre.movio` con `est=apr` → aviso «a por la firma».
- **Anti-bucle**: huella `regla+evt+nombre` ≤1 vez por 24 h (LS), para no ahogar la vista «Hoy» si alguien mueve cinco veces lo mismo.

### 3 · Versión

Ola 3(b) → **v4.1.2 · sw `cfb-v375`** · tests **W25** (~17: estáticas ambas apps + funcionales jsdom del bus, la semilla, la huella 24 h, `prox` y la vía de sustitución por JSON).

## Alternativas descartadas (futuro, sin deuda)

- **Editor de reglas en admin.html (publicar → repo)**: la infra de lectura ya está hecha; la tarjeta de publicación entra cuando el equipo pida tocar reglas sin desplegar (mismo patrón que catálogo, sin cambiar nada del motor).
- **Cola asíncrona de eventos / prioridades**: YAGNI — eventos sincrónicos bastan; si un futuro efecto es caro se encapsula con `setTimeout` dentro de su oyente.
- **Notificaciones del sistema (Web Push)**: fuera de alcance; los avisos viven en «Hoy», que es donde el comercial empieza el día.
- **Reglas en el repo privado**: no — no contienen PII, y públicas las comparten TODOS los equipos de distribución D1-D5 sin PAT.
- **Efectos extra v1 (cambiar estado, crear presupuesto…)**: se añaden como `haz.tipo` nuevo cuando haga falta; el switch ya está centralizado.
- **Evento de actividad admin (G2) disparado por reglas**: la métrica 7d ya capta la sustancia (nota/prox cuentan como gestión del día al tocarse la ficha).

## Consecuencias

- **Añadir comportamiento = añadir una regla JSON o un `busOn`**, sin tocar módulos (M4 cumplido).
- El comercial ve lo que la regla hizo **donde trabaja** (tarjeta 🔔 en «Hoy», agenda, nota) — sin pantallas nuevas.
- Toda regla es **personalizable por despliegue** editando un JSON en la web del equipo: crecer sin desplegar (M3 cumplido).
