# Integración del módulo Call-Flow — decisión del usuario (opción 1), 07-oct-2026

> La herramienta **Call Flow Business v4.4.8** (guiones comerciales por
> segmento, promovido del trabajo previo `_cuarentena/previo-f23` —
> **destruida 08-oct-2026 (D4 con autorización expresa)**: las rutas "cuarentena"
> de este documento describen el origen histórico, ya no accesible) pasa a ser un **módulo
> de la plataforma**: página 11 del diseño, rol `comercial`, rutas
> `#/callflow*`. El contenido se **porta**; la arquitectura se **reconstruye**
> sobre el sistema C5 (los HTML «archivo único» no entran al repo).
> Su URL final es la misma que ya publicaba la v4.4.8 (§4.2 maestro):
> `…/Call-Flow-Business-BMAE/#/callflow`.

---

## 1. Inventario de portación (verificado contra la v4.4.8 en cuarentena)

| Pieza de la v4.4.8 | Qué hace | Decisión | Cómo aterriza |
|---|---|---|---|
| Guion NEURO **residencial** + **pymes** | árbol de fases (Preparación → …), «10 pasos para empezar hoy», «vender a la tripa, justificar con la razón», 3 principios irrenunciables, personalización «datos de la llamada», barra de progreso, dos paneles | **PORTAR contenido** (verbatim como datos del guion; la voz del guion es literatura comercial y se conserva — excepción explícita a C10, que gobierna copy de producto, no el discurso del vendedor) | JSON de guiones por segmento en `datos/comercial/guiones/<segmento>.json` (se extraen en F3 de los HTML); UI con C5 |
| Resultados de llamada | lista visible en la v4.4.8: `No contesta · No disponible · No interesado/a · Permanencia · Pendiente de seguimiento · (otros validados)` | **PORTAR** como contrato cerrado | `datos/comercial/resultados.json` |
| `catalogo.json` | 8 ofertas activas (tarifa 2.0TD/3.0TD, gas, solar, batería, mantenimiento, ingeniería, comisionamiento) con `area/tag/activo` | **PORTADO HOY** ✅ | `datos/comercial/catalogo.json` (copia 1:1 ya en repo + LEEME) |
| **Actividad** (panel propio) | gestiones/día, embudo CRM, por tipo, por resultado, top localidades, registro | **RECONSTRUIR** sobre Twenty (es el CRM de la plataforma, A2/A5): cada gestión = actividad ligada al Deal | vista actividad con KPIs/tabla C5 leyendo de Twenty vía `twenty-sdk` |
| `admin.html` | gestión del catálogo/guiones | **RECONSTRUIR** como `#/callflow/admin` solo rol gestor | edición del catálogo → commit/workflow (GitHub-First §2) |
| `tutorial.html`, onboarding «Guía rápida» | formación del comercial | **PORTAR contenido** dentro del propio módulo (acordeón «Cómo funciona») | sección del wireframe 11 |
| `instalar.html`, `manifest`, `sw.js`, iconos PWA | instalación PWA | **NO SE PORTA** — V1 sin service worker (decisión E3/C11 §5); se revisita en F6 | — |
| Canal `datos/rma.json` (ADR-028, garantías de instaladores) | incidencias contra garantía viva, anti-PII | **FUERA de este módulo** — pertenece a la app de instaladores (Ola 5), no a diálogos comerciales. Queda registrado para su propia batalla cuando llegue | cuarentena (consultable) |

## 2. Wireframe 11 — Comercial / Guiones (ver `../wireframes.md` §11)

Rutas: `#/callflow` (selector segmento + guion) · `#/callflow/actividad` ·
`#/callflow/admin` (rol gestor). Componentes C5 usados: Botón, Campo,
Selector, Badge, Toast, Tabla, KPI, Modal (confirmar «cerrar llamada»).

## 3. Contratos de datos

```jsonc
// datos/comercial/guiones/<segmento>.json  (v1, se extrae en F3)
{ "v": 1, "segmento": "residencial",
  "principios": ["…", "…", "…"],           // los 3 irrenunciables, verbatim
  "fases": [ { "id": "preparacion", "titulo": "Preparación",
               "nodos": [ { "id": "…", "texto": "… plantillas {{nombre}} …",
                            "siguiente": "…", "resultado_sugerido": null } ] } ] }

// datos/comercial/resultados.json  (del árbol v4.4.8)
{ "v": 1, "items": [ "No contesta", "No disponible", "No interesado/a",
                     "Permanencia", "Pendiente de seguimiento", "Interesado/a" ] }

// gestion registrada → Twenty (actividad del Deal; A2/A5)
{ "dealId": "…", "resultado": "Permanencia", "nota": "≤140, guardián anti-PII",
  "segmento": "pymes", "duracion_s": 240, "ts": "ISO-8601" }
```

**Guardián anti-PII heredado** (regla F10/F11-N2 del trabajo previo, se mantiene):
las notas rechazan teléfono/email/documento antes de salir del dispositivo.

## 4. Encaje con la plataforma (sin romper sellos)

- **Diseño C**: el módulo se construye SOLO con tokens + componentes C5
  (regla C11 §2.1). Ningún CSS de la v4.4.8 entra al repo.
- **Auth B**: rol `comercial` = claim del exchange; el panel `#/gestor`
  sigue siendo de gestor; `#/callflow/*` sin sesión → `#/entrar`.
- **Backend**: el guion y catálogo son datos estáticos versionados (GitHub,
  §2); la actividad escribe al CRM (Twenty) como el resto del pipeline — no se
  inventa un segundo almacén.
- **Performance C9**: guiones por segmento cargan *lazy* por segmento; el
  catálogo (858 B) viaja inline en el bundle del módulo.
- **Sello honesto**: no aplica a cifras de consumo aquí, pero sí a «top
  localidades / embudo»: la vista de actividad indica el rango incluido
  («últimos 30 días»), nunca aparentar totales de siempre.

## 5. Plan de aterrizaje (dentro de F3, `docs/cierre.md` E2)

Semana 1: extracción de guiones a JSON (script one-shot desde cuarentena,
revisión humana del verbatim) + contratos §3 + tests de contrato jsdom.
**✅ HECHA 07-oct**: `datos/comercial/guiones/{residencial,pymes}.json`
(18 nodos + 15 objeciones + 9 steps por segmento, 0 flechas rotas, **verbatim
verificado byte-exact** contra la fuente) · extractor reejecutable con
`--check` en `datos/comercial/tools/extraer-guiones.mjs` · `#/callflow` ya
navega el árbol real con personalización [NOMBRE_CLIENTE]/[CIUDAD] · contrato
blindado en `limpieza/test_limpieza.py`. ⚠ Pendiente humano: los guiones son
los textos v4.4.8 tal cual (marca «Iberdrola Departamento…», muletillas del
equipo) — el responsable comercial coordina la versión oficial sobre este JSON.
Semana 2: `#/callflow` funcional con árbol navegable y registro en Twenty. ✅
árbol hecho; el registro sigue en cola local hasta F4.
Semana 3: actividad + admin + onboarding. Criterio de salida: un comercial
real cierra 5 llamadas contra la V1 sin tocar la v4.4.8.
**✅ HECHA 07-oct** (código y cobertura; el criterio de 5 llamadas reales es QA
humana pendiente): `#/callflow/actividad` (KPIs del día, embudo `.cf-funnel`
por resultado y registro de las 20 gestiones más recientes, todo sobre la
cola local de `apps/web/src/lib/cola.js` — contrato: tope 200, nota ≤140,
resultado obligatorio, y `fusionarEnTwenty` **conserva la cola ante fallos de
subida**; F4 solo implementa `subir(cola)`) · `#/callflow/admin` (lectura pura
del catálogo 8/8 y guiones versionados; la edición es commit GitHub-First, no
UI) · onboarding plegable en `#/callflow` · **error boundary**: cualquier
página que lance en el router pinta `.estado-error` con `role="alert"` (§9,
nunca página blanca) y se puede inyectar páginas de prueba/conector con
`registrarRuta(ruta, fn)` · pasada de calidad completa: **todos los estilos
inline de la SPA** extraídos a clases en `app.css` (quedan solo `width` de
barras y color de marca, que son datos), `sed`/`edit` verificados con grep.
Cobertura: **18/18** `app.test.mjs` (contrato de cola, actividad vacía y con
datos, admin, router-error real, verbatims, **contrato F4 `subirTwenty`** con
red simulada) · 8/8 componentes · 10/10 frontend-auth · 147/147 pytest.

**F4-prep 07-oct**: el canal de subida ya está implementado
(`lib/twenty.js` + botón «⬆ Enviar a Twenty» en actividad) siguiendo
[`docs/f4-contrato-subida.md`](../../docs/f4-contrato-subida.md): lotes ≤ 50,
Bearer de la sesión B, huella djb2 idempotente, respuesta transaccional
(procesadas=N o nada), y ante cualquier fallo **la cola no se pierde jamás**.
Solo falta que el VPS ERPNext/Twenty exponga
`POST /api/method/bmae.callflow.registrar_gestiones` y cumplimentar `BASE`.
