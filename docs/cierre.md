# Cierre y recomendaciones — Bloque E

**Fecha: 07-oct-2026 · Base: bloques A·B·C·D sellados (145 pytest · 18 node · 8 YAML)**

Este documento cierra el ciclo del prompt maestro con la mirada hacia fuera:
qué puede fallar (E1), en qué orden se despliega el resto (E2) y qué decisión
arquitectónica final se recomienda (E3).

---

## E1 — Matriz de riesgos completa

Escala: **P**robabilidad × **I**mpacto (1–5). Severidad = P×I. 🔴 ≥12 · 🟠 6–10 · 🟡 ≤5.

### Técnicos

| # | Riesgo | P | I | Sev | Mitigación (ya en el repo salvo indicación) |
|---|---|---|---|---|---|
| T1 | Fórmulas CNMC mal implementadas → facturas incorrectas | 2 | 5 | 🟠 10 | A3 Decimal + 50 facturas oráculo A6 **contra un oráculo independiente**; revisión por gestor antes del primer envío real |
| T2 | AEAT rechaza registros VeriFactu (huella/XML) | 2 | 4 | 🟠 8 | A4 huella encadenada + XML `RegistroFacturacionAlta` + daemon de auditoría (workflow); consulta previa en entorno de pruebas AEAT **antes** de producción (hito H2) |
| T3 | Token/exchange Frappe indisponible → login caído | 3 | 4 | 🔴 12 | D-B1 síncrono + endpoint con retry del cliente; monitorización uptime; **contingencia gist-opaco cifrado documentada** en autenticacion.md (no implementada de propósito) |
| T4 | Claves RS256/HKDF comprometidas | 1 | 5 | 🟡 5 | `kid` + JWKS con rotación documentada (B); secrets en GitHub Environment; revoke+denylist por Issue/cron |
| T5 | Tarifario actualizado rompe comparativas (schema drift) | 3 | 3 | 🟠 9 | `import-catalogo-tarifas.yml` valida esquema antes de publicar; caché SWR con última versión buena; alerta a gestor |
| T6 | Parser PDF de facturas falla con formatos nuevos | 4 | 2 | 🟠 8 | Treceo en 3 piezas (decisión usuario) + camino manual siempre disponible (wireframe 03); `datos/rma.json` para aprender de fallos |
| T7 | jsdom/deps de tests fuera del repo → sello no reproduce en frío | 3 | 1 | 🟡 3 | Resolución robusta D6 + paso de instalación documentado en README y en D7 |
| T8 | Divergencia diseño↔código al construir apps/web | 2 | 3 | 🟠 6 | `diseno/export/` con SHA-256 + test D8 que la caza; regla «se importa, no se edita» (C11 §3) |

### Operativos / negocio

| # | Riesgo | P | I | Sev | Mitigación |
|---|---|---|---|---|---|
| O1 | RGPD: datos de factura (consumo = hábitos) mal tratados | 2 | 5 | 🟠 10 | Consentimientos explícitos (wireframe 05), borrado a petición (C10 §1), sessionStorage no localStorage (B), integracion/ con minimización |
| O2 | Promesas de ahorro que no se cumplen → reclamaciones | 2 | 4 | 🟠 8 | **Sello honesto contractual** (C10 §3): todo estimado se declara; comparador «no vinculante»; sin exactitud fingida |
| O3 | Clausura por comercializadora (cambios de tarifa post-alta) | 2 | 3 | 🟠 6 | Control panel gestor (wireframe 10) + revisión trimestral automática (dashboard «próxima revisión») |
| O4 | Dependencia de una sola persona (bus factor) | 3 | 4 | 🔴 12 | Todo el conocimiento en repo: docs/ ×N + ADRs promovidos + CLEANUP; sello reproducible por cualquiera en 5 min (cuarentena D4 destruida 08-oct — inventario en docs/historico/) |
| O5 | **GitHub as SPOF de TOO** (opción B): caída de Actions bloquea facturación legal; GitHub podría cobrar en privado/limitado | 3 | 4 | 🔴 12 | Por eso es decisión, no accidente: §5 «Fragilidad en números» de docs/github-total.md + runbook (fallo → label error + humano re-etiqueta) + canary `verifactu:audit` semanal + export manual (`Exportar JSON` del comercial + `Importar JSON` del gestor) + history de Git como libro audit-proof. Mitigación residual: adopción temporal del patrón gist-opaco cifrado documentado en B si Actions se derails |
| O5 | Cliente abandona en asistente de 3 pasos | 3 | 3 | 🟠 9 | Guardado parcial real + «no pasa nada, a mano» + magic link (menos fricción que contraseña) |
| O6 | Coste/lock-in si se adopta Clerk/Auth0 más adelante | 2 | 2 | 🟡 4 | Capa de auth abstraída (B es intercambiable por §4.5 B; el frontend no conoce al proveedor) |

**Riesgo residual asumido conscientemente**: T3 (dependencia del endpoint
Frappe) — es la única salida del ecosistema GitHub ya justificada en §2 del
maestro; ninguna arquitectura serverless dentro de GitHub puede hacer el
exchange sin token (demostrado en D-B1).

## E2 — Plan de implementación por fases

Lo sellado (A+B = núcleo y auth; C = diseño; D = orden) es **F0–F2 completas**.
Esto es lo que queda:

| Fase | Contenido | Hitos | Criterio de entrada | Criterio de salida (verificable) |
|---|---|---|---|---|
| **F3 · SPA apps/web** | Importar `diseno/export/`, construir las **11 páginas** de wireframes sobre componentes C5, `lib/api.js` + `lib/honesto.js` — incluye el **módulo Call-Flow** (guiones comerciales, decisión usuario 07-oct · `diseno/guias/integracion-callflow.md`) | **H1 ✅** + **w1 ✅** (guiones verbatim v4.4.8 18 nodos/15 objeciones ×2 segmentos consumidos por `#/callflow`) + **w3 ✅ 07-oct** (`#/callflow/actividad` + `#/callflow/admin` + onboarding · `lib/cola.js` con contrato: F4 solo implementa `subir(cola)` y la cola se conserva ante fallos · error boundary + `registrarRuta` · 0 estilos inline en la SPA · 17/17 jsdom). Resta: **H1b-canal** ✅ (`lib/canalgithub.js` + login device-flow w2; solo falta el CLIENT_ID gesto humano) · H2 ✅ 08-oct (panel GitHub-Total vivo + facturas = cadena real, vacío honesto) · QA: 5 llamadas reales con un comercial | D sellado ✔ | 11/11 páginas con estados §9; presupuestos C9 medidos en Lighthouse; tests por página (patrón jsdom); un comercial real cierra 5 llamadas en V1 sin tocar la v4.4.8 |
| **F4G · GitHub-Total (opción B, 07-oct)** | SIF VeriFactu en GitHub Actions (invoice-issue → SDK A4 → AEAT mTLS), cola Call-Flow por issue buzón → pipeline CRM en Issues+labels, cadena SHA-256 en `datos/verifactu/cadena.json` | **w0 ✅ 07-oct** (ADR `docs/github-total.md` · `sif_emitir.py`+worker, 8 tests · `cola_ingest.py`+worker, 7 tests · `lib/canalgithub.js`+test jsdom · 2 workflows · plantilla invoice-issue · gestos documentados en deploy-github.md). Faltan waves: **w1** primer envío real preprod + número fiscal «77-0001» gesto humano · **w2 ✅ 07-oct** login nativo device-flow (`lib/ghdevice.js` + ruta `#/login` + puente de claves B + test jsdom; gesto humano: crear OAuth App con Device Flow y pegar CLIENT_ID — deploy-github.md §5) · **w3 ✅ 07-oct** pipeline vivo `#/gestor` leyendo Issues (labels `estado:*`, fallback contractual honesto; Projects v2 auto-add pendiente token org) · **w4 ✅ V1 08-oct** tarifario horneado (`datos/tarifario.json`, comparativa viva con sello declarativo) | F3 w3 ✅ | Hitos: invoice-issue con escenario «121,00 € / 21,00 € / F1» produciendo huella exacta conocida en preprod; comentario del workflow con CSV o código de error AEAT; gestión de cola materializada en issue pipeline con reacción ✅ del workflow |
| **F5 · Producción** | Deploy Pages + Traefik ForwardAuth + JWKS rotación, monitoring, plan RGPD operativo | H5: primer cliente real en piloto | F4 verde + revisión legal AEAT | Piloto 2 semanas sin incidente S1; métricas de campo C9 §4 recogiendo |
| **F6 · Crecimiento** | Solar avanzado, i18n, PWA si se justifica, analytics agregado | continuos | F5 estable | por definir con datos del piloto |

**Dependencias críticas**: F4G/GitHub-Total depende de T2 (certificado
cualificado + pruebas AEAT preprod) — gesto humano irreducible, hacerlo
**ya** (docs/deploy-github.md); el resto de waves no dependen de nada
externo a GitHub.

Estimaciones honestas (equipo 1–2 personas): F3 = 3–4 sem · F4 = 2–3 sem ·
F5 = 2 sem · paralelizable F4-backend con F3 un 40 %.

## E3 — Recomendación final

### Arquitectura: **A — GitHub-First 4 capas (la construida)** ✔

| Candidata (lens §4.5/E3 maestro) | Veredicto |
|---|---|
| **A · GitHub-First monorepo** (Pages + Actions + GHCR + endpoint Frappe justificado) | **MANTENER** — es lo sellado A–D; riesgos conocidos y mitigados (E1); contención total demostrable (Bloque F) |
| B · Capa transversal Clerk/Auth0 | **ALTERNATIVA PRAGMÁTICA** registrada (autenticacion.md §4): adoptar solo si F4 revela que el ciclo auth-revocación operado por Issues no escala humanamente; coste de migración bajo por diseño (proveedor abstraído) |
| C · Supabase Auth (todo-en-uno) | **RECHAZADA** — rompe el principio §2 de contención en GitHub sin ganancia justificada |

### Auth: **GitHub OAuth PKCE propio (B1–B6 sellado)** ✔

Coherente con la recomendación literal del maestro §4.5 («GitHub OAuth propio
si hay tiempo»). La ventana «Clerk ahorra 4–6 semanas» ya no aplica:
**el trabajo está hecho y testado** (27 checks). Mantener la ALTERNATIVA
PRAGMÁTICA documentada como plan B contractual.

### Priorización

1. **AHORA**: F3 (SPA) — es el único frente sin dependencias externas y el
   que convierte lo sellado en producto visible.
2. **EN PARALELO**: burocracia AEAT (T2) — gratuito y es el cuello de F4.
3. **DESPUÉS**: F4 → F5 con piloto de 2 semanas.
4. **NUNCA en V1**: PWA/service worker, toggle oscuro manual, i18n real,
   refactor de lo sellado sin test que lo justifique (D ya blindó que la
   limpieza es una propiedad verificada, no un estado).

---

*Bloque E cerrado. Resta Bloque F (garantía de contención en GitHub: F1
verificación, F2 servicios externos justificados, F3 confirmación de cero
`git mv`).*

— Seguimiento operativo día a día: [`docs/pendientes.md`](pendientes.md) (tu parte vs nuestra parte, checklist committed).

- 08-oct **Modo ALBARÁN** (usuario: «sin certificado, trabajemos en forma de albaranes»): `albaran_crear.py` (albarán numerado SHA-256 **declarado no fiscal**, PDF reportlab con `diseno/marca/logo-bm.png`) + `albaranes-crear.yml` + plantilla + semilla `datos/albaranes/` + `#/albaranes` viva. Guardián de `cliente_ref` sin PII. La facturación fiscal se activa con F4G·w1 sin reescritura.
