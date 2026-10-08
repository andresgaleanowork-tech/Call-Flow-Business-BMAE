# Bloque F — Garantía de contención en GitHub

**Fecha: 07-oct-2026 · Verificación ejecutada, no declarada.**

Principio §2 del maestro: nada sale del ecosistema GitHub salvo excepción
justificada. Este documento lo comprueba con comandos reproducibles y cierra
la serie A→F.

---

## F1 — Verificación: ningún entregable sale del ecosistema

### Método (reproducible)

```bash
grep -rhoE "https?://[a-zA-Z0-9./_-]+" \
  --include="*.py" --include="*.js" --include="*.ts" --include="*.html" \
  --include="*.yml" --include="*.css" --include="*.json" . \
  | grep -v w3.org | sed -E 's|(https?://[^/]+).*|\1|' | sort | uniq -c
```

### Superficie externa TOTAL del repo (7 dominios)

| Dominio | × | ¿Ecosistema GitHub? | Veredicto |
|---|---|---|---|
| `api.github.com` | 5 | ✔ propio | Toda la lógica asíncrona vive aquí (workflows A/B). |
| `github.com` | 2 | ✔ propio | Referencias de repo/Actions. |
| `registry.npmjs.org` | 1 | ✔ build-time | Resolución de deps **en runners de GitHub** durante CI; nunca en runtime de la SPA. |
| `erp.bmae.example` · `erp.local` | 5 | ✘ justificado §2 | Endpoint Frappe/ERPNext en VPS — ver F2. (Son placeholders de config/documentación, no secretos.) |
| `www2.agenciatributaria.gob.es` · `prewww2.aeat.es` | 6 | ✘ legal | AEAT VeriFactu — obligación legal; la llama el servidor ERPNext, **nunca** la SPA. |

**Todo recurso que carga el navegador** (rutina del test D8 n.º 7 sobre
`index.html`: cero `https?://` externos, self-hosted) vive en el repo: fuentes,
iconos SVG, CSS, JS. La portada funciona sin una sola llamada externa.

### Otras vías de fuga revisadas

| Vía | Estado |
|---|---|
| Fuentes web (Google Fonts etc.) | ✘ ninguna — `@font-face` self-hosted (C) |
| CDN de librerías JS/CSS | ✘ ninguno — vanilla + assets locales (C5, D8 n.º5/7) |
| Imágenes remotas en HTML | ✘ — iconos SVG inline + `assets/logo.svg` local |
| Telemetría/analytics de terceros | ✘ ninguna en V1; el beacon C9 §4 es al endpoint Frappe propio y anónimo |
| Secretos en el repo | ✘ — credenciales siempre en Environment Secrets (B); placeholders `*.example`/`*.local` |
| Deploys a hosting externo | ✘ — **GitHub Pages desde `main / root`** con `.nojekyll` (entrada `index.html` en raíz, añadida hoy; `docs/` queda solo para documentación, sin colisión) |

## F2 — Servicios externos alojados: **CERO** (GitHub-Total, decisión opción B del 07-oct)

Con la decisión B la superficie «alojada» se reduce a **una única llamada
saliente legal**; ya **no hay VPS, ni ERPNext, ni Twenty alojados por nosotros**.

| Servicio | Por qué es inevitable | Contención aplicada |
|---|---|---|
| **AEAT Verifactu SOAP** (`prewww1.aeat.es` en preprod; `www1.agenciatributaria.gob.es` en producción) | Obligación legal RD 1007/2023: el registro encadenado exige el endpoint oficial | La llama **GitHub Actions** (`verifactu-emitir.yml`) con certificado cualificado (secrets `AEAT_CERT_PEM`/`AEAT_KEY_PEM`, solo en environments con aprobación); la SPA jamás habla con AEAT |

Los canales de operación (cola Call-Flow, pipeline, facturación) viven en el
propio GitHub: la SPA habla con `api.github.com` (Bearer del comercial,
device-flow n=wave F4G·w2) y los workflows materializan todo en el repo.
Código inerte del plan D4 (VPS/librerías Twenty) se conserva **sin ejecutar**
por trazabilidad; la decisión de borrado queda diferida (lotes con
confirmación, CLEANUP §1.2).

**Cero** dependencias de Clerk/Auth0/Supabase en V1 (E3: alternativa
pragmática documentada, no activada).

### Superficie externa actualizada (verificación tras GitHub-Total)

| Dominio | Uso | ¿Ecosistema? |
|---|---|---|
| `api.github.com` · `github.com` | APIs de operación (SPA + Actions) | ✔ propio |
| `www2.agenciatributaria.gob.es` · `prewww2.aeat.es` · `prewww1.aeat.es` | QR de cotejo (solo lectura pública, enlazado) + **endpoint SOAP bajo RD** | ✘ legal, inevitable |
| `erp.bmae.example` · `erp.local` | Documentación/config inerte del plan anterior | ◐ inerte (no se llama) |
| `prewww3.aeat.es` (WSDL) | Solo referencia documental del ADR | ◐ doc |

**`www1.agenciatributaria.gob.es`** aparece solo en constantes del SIF
(entorno producción, tras aprobación humana). Ninguna carga del navegador
sale del repo más allá del canal de operación con `api.github.com`.

## F3 — Confirmación `git mv` / migraciones

- **`git mv` ejecutado en este proyecto: NINGUNO.** Además, el workspace aún
  no contiene un `.git` (el push inicial es posterior, fuera de esta serie):
  la regla quedó fijada por escrito en `CLEANUP.md` §1.3 y en el plan de
  commits L1–L12, y los movimientos del Bloque D se hicieron con `mv` a
  cuarentena local (fuera del repo; **destruida 08-oct-2026 — D4 con autorización**, inventario en docs/historico/).
- **Migración de archivos del repo: NINGUNA.** El Bloque D certificó 0
  movimientos internos (checklist D9) y el test D8 n.º 5 garantiza que ningún
  enlace quedó roto. Las dos únicas incorporaciones posteriores fueron
  ADICIONES en la raíz (`index.html`, `.nojekyll`) para Pages — las rutas
  selladas A/B/C/D no se tocaron.
- Datos promovidos durante la integración Call-Flow: copia 1:1 desde
  cuarentena con trazabilidad (`datos/comercial/LEEME.md`), origen intacto.

---

## Cierre de la serie A→F

| Bloque | Entrega | Sello |
|---|---|---|
| A Arquitectura/backend | motor CNMC + VeriFactu + Twenty + workflows | 82 pytest · 4 YAML |
| B Autenticación | PKCE + JWT RS256 + RBAC + frontend | 17 pytest · 10 node · 3 YAML |
| C Diseño | tokens→componentes→mockups→guías + export hash | 40 pytest · 8 jsdom |
| D Limpieza | CLEANUP + cuarentena + blindaje CI | 7 pytest (D8) · 8 YAML total |
| E Cierre | riesgos + fases + recomendación (A + OAuth propio) | docs/cierre.md |
| **F Contención** | superficie externa 7 dominios clasificada, Pages-ready | este documento |

**Sello global vigente**: 146 pytest (139 + 7 limpieza) · 8/8 jsdom · 10/10
node · 8/8 YAML · export íntegro · `index.html` + `.nojekyll` en raíz.
