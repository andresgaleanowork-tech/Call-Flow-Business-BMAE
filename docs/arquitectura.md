# A1 · Arquitectura de Alto Nivel — Plataforma Corporativa BMAE

**Ecosistema**: ERPNext v15+ · Twenty CRM · SPA Call-Flow-Business-BMAE
**Principio rector**: GitHub-First — nada sale del repositorio ni del
ecosistema GitHub salvo el VPS que aloja ERPNext/Twenty (única excepción
técnica permitida, justificada en §2 del Prompt Maestro).

## 1 · Mapa de 4 capas (vista lógica)

```mermaid
flowchart TB
    subgraph L1["CAPA 1 · PRESENTACIÓN & EDGE"]
        PAGES["GitHub Pages<br/>(SPA HTML5 + ESModules)"]
        LANDING["Landing pública +<br/>Calculadora Express"]
        COMP["Comparador<br/>2.0TD / 3.0TD / 6.XTD"]
        SOLAR["Estudio<br/>Fotovoltaico"]
        PORTAL["Portal autenticado<br/>OAuth2 + PKCE"]
        PAGES --> LANDING
        PAGES --> COMP
        PAGES --> SOLAR
        PAGES --> PORTAL
    end

    subgraph L2["CAPA 2 · SERVICIOS CORE (VPS Debian 12 hard.)"]
        TRAEFIK["Traefik v3<br/>mTLS · Let's Encrypt<br/>rate-limit · JWT edge"]
        ERP["ERPNext v15<br/>PGC 2007 · VeriFactu<br/>motor tarifario · facturación"]
        TWENTY["Twenty CRM<br/>pipeline · objetos<br/>CUPS/Contratos/PyS"]
        DB[("MariaDB 10.11 + Redis")]
        PG[("PostgreSQL 16 + pgvector")]
        TRAEFIK --> ERP
        TRAEFIK --> TWENTY
        ERP --> DB
        TWENTY --> PG
    end

    subgraph L3["CAPA 3 · GITOPS & EVENT HUB (GitHub Actions)"]
        WF1["sync-twenty-to-erpnext<br/>(bidireccional, idempotente)"]
        WF2["opportunity-won<br/>(Customer 430 + SO + Project)"]
        WF3["verifactu-audit-daemon<br/>(cadena SHA-256 diaria)"]
        WF4["import-catalogo-tarifas<br/>(Pydantic → PR, humano aprueba)"]
        WF5["auth-exchange/refresh/revoke<br/>+ sync-roles"]
        WF6["deploy-infra · GHCR"]
    end

    subgraph L4["CAPA 4 · CONECTORES EXTERNOS & REGULATORIOS"]
        SIPS["SIPS / CNMC<br/>(i-DE · e-distribución · UFD)"]
        OMIE_A["OMIE / ESIOS-REE<br/>PVPC, precios indexados"]
        AEAT["AEAT WebServices<br/>VeriFactu con cert. X.509"]
    end

    PORTAL -- "JWT RS256 (8 h) · Bearer" --> TRAEFIK
    COMP -- "simula sin login (rate 3/IP/10 min)" --> MOTOR_API["API simulación<br/>(Frappe, bmae_comparador)"]
    MOTOR_API --> ERP
    WF1 <--> TWENTY
    WF1 <--> ERP
    WF2 --> ERP
    WF3 --> ERP
    WF4 --> ERP
    WF5 --> GH_OAUTH["GitHub OAuth App<br/>+ Teams → roles"]
    WF6 --> GHCR[("ghcr.io<br/>imágenes")] --> L2
    ERP --> SIPS
    ERP --> OMIE_A
    ERP -- "cert. X.509 en VPS<br/>(jamás en repo)" --> AEAT
    GH_OAUTH -- "code + PKCE" --> PORTAL
```

## 2 · Secuencia — comparación de oferta pública (sin login)

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario (móvil)
    participant SPA as GitHub Pages SPA
    participant API as API simulación (VPS/Frappe)
    participant MOTOR as bmae_comparador.engine
    participant GH as GitHub Actions

    U->>SPA: introduce factura (CUPS, consumos)
    SPA->>API: POST /simulacion (sin auth — rate limited)
    API->>MOTOR: validar_factura() + simular()
    MOTOR-->>API: ResultadoSimulacion (desglose inmutable, 6 dec)
    API-->>SPA: 200 JSON (<1 s objetivo)
    SPA-->>U: comparativa + «pedir oferta»
    opt Lead capturado
        SPA->>GH: repository_dispatch (public-lead)
        GH->>GH: crea Lead en Twenty (crear-lead.yml, Bloque B/F7)
    end
```

## 3 · Secuencia — oportunidad ganada → ERPNext facturable

```mermaid
sequenceDiagram
    autonumber
    participant T as Twenty CRM
    participant GH as GitHub Actions (opportunity-won)
    participant E as ERPNext
    participant A as AEAT (VeriFactu)
    participant DAEMON as verifactu-audit-daemon (03:00 UTC)

    T->>GH: webhook → repository_dispatch(opportunity-won, id)
    GH->>E: Customer (cuenta 430, dedup NIF/CIF)
    GH->>E: Sales Order (líneas de la oferta congelada)
    GH->>E: Project (EPC si aplica)
    GH-->>T: enlaces ERPNext (twenty_id ↔ erpnext_id)
    Note over GH,E: TODO idempotente: replay de un dispatch<br/>re-lee y NO duplica (upsert por id)
    E->>A: al facturar: RegistroFacturacionAlta + huella encadenada
    DAEMON->>E: recomputa cadena SHA-256 cada noche
    alt divergencia
        DAEMON->>GH: Issue 🚨 CRÍTICO (contención GitHub, §2.5)
    end
```

## 4 · Decisiones de diseño del Bloque A (documentación exigida)

| # | Decisión | Alternativa / mitigación |
| :--- | :--- | :--- |
| D-1 | **DiasAno** del TP se toma del año de **fecha_fin** de factura (cuota de potencia devengada por días naturales del periodo de cobro). | Facturas a caballo de año usan el año del devengo — regla sectorial estándar; documentar en la propia factura (ya va en `detalle` de cada línea). |
| D-2 | **Financiación bono social SUMA** a «Otros» (la repercute el comercializador en precio); desactivable por factura (`financia_bono_social=false`). | Si la CNMC publica orden distinta, se cambia la constante anual — jamás el código (parametrización, §5.2). |
| D-3 | Método de excesos cuartohorarios **`suma_raices`** (fórmula literal §5.1.3 del Prompt Maestro: `Σ_i√(P_i−Pc)²`). | La variante BOE `raiz_suma` está parametrizada en `ExcesosPotencia.metodo_cuartohorario`; el estudio regulatorio F0/F3 elige y sólo editando constantes. **ALTERNATIVA PRAGMÁTICA** señalada al equipo legal. |
| D-4 | Hash VeriFactu con **serializado `Campo=Valor&…` de la AEAT** (nombres de campo del schema oficial) en HEX mayúsculas. | §6.2 del maestro confirma campos; el formato exacto AEAT permite contrastar con el XSD sin traducciones propias. Validado en tests contra la fórmula literal. |
| D-5 | **Doble implementación** del motor: oráculo plano en `tools/generar_fixtures.py` fija 50 facturas; el engine se contrasta contra el JSON (tolerancia exigida 0,01 €, real: igualdad a 2 dec). | Regresión dura: un refactor que mueva ≥0,01 € rompe 50 tests simultáneos. |
| D-6 | Publicación del catálogo tarifario **solo por PR humano** (A5.4). | La última barrera regulatoria es una persona firmando números, no un bot. GitHub-First se respeta (el PR vive en el propio repo). |
| D-7 | DLQ unificado como **Issues privados etiquetados `dlq`** + artefactos con retención (30/90/400 d según sensibilidad). | Nada sale de GitHub; la retención larga fiscal (≈7 a) se consolida en Releases anuales (verificación A5.3). |

## 5 · Contención GitHub-First (verificación A)

- Los 4 workflows (A5) escriben **Issues, PRs, artefactos y Releases**:
  cero destinos externos (salvo APIs de negocio de ERPNext/Twenty, VPS
  justificado §3).
- Secretos exclusivamente GitHub (Environment Secrets, rotación 90 d).
- Imágenes en GHCR; despliegue por SSH desde GitHub Actions (deploy-infra
  se sella en Bloque B/E).
- El certificado X.509 de AEAT vive SOLO en el VPS (cifrado en disco),
  nunca en el repo ni en artefactos.

## 6 · Estado de los entregables del Bloque A

| # | Entregable | Ruta | Estado |
| :-- | :--- | :--- | :--- |
| A1 | Este documento (arquitectura Mermaid) | `bmae-plataforma/docs/arquitectura.md` | ✅ completo |
| A2 | Objetos Twenty (Metadata SDK, TS strict) | `bmae-plataforma/twenty-sdk/src/` | ✅ tsc --noEmit 0 errores |
| A3 | Motor Python `bmae_comparador.engine` | `bmae-plataforma/motor/src/bmae_comparador/` | ✅ 62/62 pytest |
| A4 | Módulo VeriFactu ERPNext | `bmae-plataforma/verifactu/bmae_verifactu/` | ✅ 7/7 pytest |
| A5 | Workflows de sincronización | `bmae-plataforma/.github/workflows/` | ✅ 4/4 YAML válidos |
| A6 | Suite pytest 50 facturas | `bmae-plataforma/motor/tests/` | ✅ 50/50 + 12 reglas |

**Siguiente bloque (B — autenticación PKCE/JWT RS256): pedir con
«continúa Bloque B».**
