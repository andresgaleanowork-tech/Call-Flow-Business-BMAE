# B · Autenticación y autorización Zero-Trust — Plataforma BMAE

Documento hermano de [`arquitectura.md`](arquitectura.md) (Bloque A §4).
Entregables B1..B6 del Prompt Maestro §4, todos verificados: **17/17 tests
Python del núcleo, 10/10 tests Node del frontend, 3/3 workflows YAML
válidos**.

## 1 · Flujo contractual (§4.2) — implementación real

```mermaid
sequenceDiagram
    autonumber
    participant U as Navegador (GitHub Pages)
    participant GH as GitHub OAuth
    participant FX as Endpoint Frappe<br/>auth_exchange (VPS)
    participant ER as Traefik ForwardAuth (VPS)
    participant GA as GitHub Actions<br/>(auth-*.yml + sync-roles)

    U->>U: genera PKCE verifier (RFC 7636) + state CSRF<br/>sessionStorage (aislado por pestaña, §4.4)
    U->>GH: GET authorize?code_challenge(S256)&state&client_id
    GH-->>U: autoriza → callback ?code&state
    U->>U: valida state CSRF (mismatch → alto con alerta accesible)
    U->>FX: POST /auth_exchange {code, state, verifier}
    FX->>GH: code → access_token, /user + /user/teams
    FX->>FX: roles_de_teams (§4.1) → JWT RS256 (kid vigente)<br/>access 8 h + refresh rotativo 30 d
    FX-->>U: paquete cifrado por HTTPS (camino síncrono)
    U->>U: verifica JWT vs JWKS público (defensa en profundidad)<br/>guarda sessionStorage
    U->>ER: fetch API con Bearer JWT
    ER->>ER: valida firma/exp (JWKS) → intercambia por token de API
    Note over U,GA: expiración → refresh (§4.2.10): rotación ESTRICTA<br/>con denylist append-only (gist privado); logout → auth-revoke
```

## 2 · Decisiones con firma del Bloque B

| # | Decisión | Justificación / alternativa documentada |
| :--- | :--- | :--- |
| D-B1 | **Camino síncrono por endpoint Frappe `auth_exchange`** como principal (§4.1 lo cita nominalmente «endpoint Frappe / Traefik ForwardAuth»): responde el JWT directamente por HTTPS. | La variante **GitOps pura** (repository_dispatch → workflow → gist cifrado) está **implementada y testeada** como contingencia, pero es **ASÍNCRONA** y exige que **el servidor despache** (no existe token de dispatch anónimo desde un navegador público: exponerlo rompería §2). El gist de contingencia cifra HKDF(code) — solo abre quien tiene el efímero `code` de OAuth; su contenido es ruido para cualquier tercero y vive ≤10 min (cron de barrido). |
| D-B2 | **JWT sin librerías JWT externas**: RS256 = RSASSA-PKCS1-v1_5/SHA-256 implementado sobre `cryptography` (Python) y WebCrypto nativo (navegador) — ambos verificados cruzados (el test Node firma de verdad y Python la descartaría si estuviera mal). | Ser menos dependencia = menos superficie; RS256 de bandera es 60 líneas estándar. Los tests muerden tamper/kid/exp/type (§4.1). |
| D-B3 | **Refresh rotativo estricto con denylist append-only** (gist privado `revocations.json`): consumir un refresh ya rotado marca **reuso = robo** y **bloquea al sujeto completo** (§4.4 mitigación fuga JWT). | Más seguro que rotación laxa familia-A; confirma con Issue 🔐 crítico (audit GitHub §2.5). |
| D-B4 | **Entrega del JWT cifrada con HKDF(code)** en la contingencia gist (y no en claro ni firmada-tan-solo): el `code` de OAuth actúa como secreto efímero compartido solo por navegador↔GitHub. | Alternativa JWT-en-claro-por-gist-descartada: la URL del gist sería un collar de perlas. |
| D-B5 | **Verificación cliente ≠ autoridad**: el navegador verifica firma/exp para UX y defensa en profundidad; **la barrera es Traefik ForwardAuth** (§4.2.9). | Documentado en `jwt.js` para no vender una falsa sensación de seguridad. |
| D-B6 | **Roles: una sola fuente** (`roles.py`) con espejo literal en `roles.js` (testeada a paridad de comportamiento). | Los dos lados del sistema ven la misma matriz §4.1/§4.3. |

## 3 · Hardening §4.4 — estado

| Regla del maestro | Implementación entregada |
| :--- | :--- |
| CSRF: state + PKCE S256 | `state` 64 hex exigido igual textual; S256 solo método aceptado |
| XSS: sessionStorage, CSP estricta, sanitización | sessionStorage por pestaña; meta CSP `default-src 'self'` + `frame-ancestors 'none'` en login/callback; cero HTML inyectado del servidor |
| Fuerza bruta 10/min | rate-limit en Traefik (capa infra A5/E — se referencia) + PKCE efímero |
| 2FA admin/dirección | obligatorio en GitHub org (comerciales admin TOTP; comprobado por sync-roles en Bloque E) |
| Rotación de secretos 90 d | `kid` trimestral programado (JWKS coexistente 2 kid testeado) + Nota deploy en workflows |
| Audit log append-only | denylist gist privada + Issues auth etiquetados + artefactos 30/90 d |
| Cierre al cerrar navegador / 30 min inactividad / revocación | sessionStorage + vigilante 30 min + auth-revoke (issue `/revoke @usuario` por owners) |
| IP allowlist opcional admin | franja Traefik (infra) — punto de configuración documentado |
| CORS y CSP | CORS estricto en el endpoint (allowlist del origen Pages), CSP por página |

## 4 · ALTERNATIVA PRAGMÁTICA (§4.5) — señalada expresamente

> **Clerk/Auth0 (plan gratuito) como capa transversal de autenticación**
> sustituye esta pieza: ahorra **4–6 semanas** del F5 y la operación de
> rotaciones (`kid`), 2FA y revocación quedan delegados. Coste: la
> auth deja de ser GitOps-pura (la §4.5 del maestro lo permite
> explícitamente: «no viola GitHub-First porque la autenticación no es un
> middleware de negocio»).
>
> Recomendación de bloque: **mantener GitHub OAuth propio si el calendario
> F5 (2-3 sem) entra**; con prisa comercial, Clerk + GitHub-OAuth para
> partners es salida digna documentada — decidir en el Bloque E con los
> números de la matriz de riesgos.

## 5 · Estado de entregables B1..B6

| # | Entregable | Ruta | Estado |
| :-- | :--- | :--- | :--- |
| B1 | `auth-exchange.yml` (dispatch del servidor + barrido + Issue incidencia) | `.github/workflows/auth-exchange.yml` | ✅ YAML válido·6 steps |
| B2 | `auth-refresh.yml` (rotación estricta + Issue 🔐 en reuso-robo) | `.github/workflows/auth-refresh.yml` | ✅ YAML válido·6 steps |
| B3 | `auth-revoke.yml` (comment `/revoke @usuario` por owners + cron barrido) | `.github/workflows/auth-revoke.yml` | ✅ YAML válido·7 steps |
| B4 | `scripts/auth_exchange.py` (uso endpoint/gist, GitHub OAuth real) | `auth/scripts/auth_exchange.py` | ✅ probado vía núcleo |
| B5 | `scripts/auth_refresh.py` (denylist gist privada append-only) | `auth/scripts/auth_refresh.py` | ✅ probado vía núcleo |
| B6 | `login.html` + `callback.html` + `auth.js` + `jwt.js` + `roles.js` (PKCE/WebCrypto/WCAG/CSP/dark) | `frontend-auth/` | ✅ 10/10 node --test |
| núcleo | `bmae_auth`: pkce · jwt_rs256 · canal HKDF · roles · flujos | `auth/src/bmae_auth/` | ✅ **17/17 pytest** |

**Siguiente bloque: C (Design System «Energía Precisa») — pedir con
«continúa».**
