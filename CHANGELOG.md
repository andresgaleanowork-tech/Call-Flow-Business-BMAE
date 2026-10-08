# Changelog

Hitos del proyecto, no de cada commit. Autoría: GitHub-Total (cada ola se
committea de una vez; el historial de Git es el changelog fino).

## 07-oct-2026 — GitHub-Total (decisión opción B)

**Grande:** todo lo que no puede ser silencio, vive en GitHub.

- **F4G·w0 ✅** ADR `docs/github-total.md` + SIF VeriFactu en Actions
  (`sif_emitir.py` + `verifactu-emitir.yml`: invoice-issue → SDK → AEAT mTLS →
  cadena SHA-256 en `datos/verifactu/cadena.json`, serialized, idempotente).
- **Cola → CRM** `cola_ingest.py` + `cola-ingest.yml` + `lib/canalgithub.js`:
  gestiones Call-Flow (1 JSON/línea, huella) → buzón → issues pipeline
  `segmento:*`/`resultado:*`/`canal:callflow` con reacción ✅/🚫. Ruta manual
  honesta «Exportar JSON» permanentemente disponible.
- **F4G·w2 ✅** Login device-flow nativo SPA (`#/login`, `lib/ghdevice.js`),
  puente de la auth sellada B; `frontend-auth/` queda inerte (sin borrar).
- **F4G·w3 ✅** Pipeline vivo `#/gestor` desde Issues (labels `estado:*`) con
  fallback contractual declarado; Projects v2 auto-add documentado como
  pendiente (requiere token de org).
- Docs `contencion-github.md` §2 reescrito a **0 servicios externos
  alojados**; única salida = AEAT legal (obligada).
- `docs/deploy-github.md`: gestos humanos (cert AEAT, OAuth App Device Flow,
  buzón, labels). Sección legal primera, no última.

### Ético-visible (sin versión)

- `sif_emitir.py` es *offline-friendly*: `--solo-xml` no toca red ni cadena.
- Cada flujo documentado con números de fragilidad (`github-total.md` §5).
- 0 PII añadida al repo: guardián en JS y en la ingesta server-side.

## 06-07-oct — Serie A→F sellada

A Backend (CNMC decimal + IEEE-verifacto oráculo) · B Auth PKCE+JWT+RBAC ·
C Diseño (tokens→componentes→export hash) · D Limpieza cuarentena D1-D3 ·
E Riesgos/fases (cierre.md) · F Contención (9 dominios verificados) ·
F3 SPA (11 páginas, Call-Flow integrado como módulo con guiones v4.4.8) ·
F4-prep (contrato subida, enchufe ≈1 sesión).

## 08-oct-2026 — A1 prospección viva (dataset IberCRM importado) + A3 honesto

- El usuario subió `DATASET-IBERCRM 300626.csv` (~33k filas): es un dataset
  de PROSPECCIÓN (empresas Valencia), no la BD de clientes con contratos.
  - **A1 ✅**: `integracion/scripts/prospectos_importar.py` (latin-1/`;`,
    mapeo de columnas alias, dedupe nombre+tel 579 descartadas, teléfono
    normalizado `999 99 99 99`, web sin protocolo, split por ciudad ≥25 con
    `__otras__`, ids estables, índice + dry-run + huella del CSV) → 32.582
    prospectos en `datos/prospectos/` (MISMA mecánica para reponer datos).
  - `#/prospectos` con carga perezosa por ciudad, búsqueda tolerante a
    tildes (cp-exacto → prefijo → contiene), ☎ tel:, y «Guionar en Call-Flow»
    → `bmae.prospecto` → banner en `#/callflow` con quitar. Rol comercial ve
    Prospectos pero no cobros (B1 sin cambios).
  - **A3 pendiente**: se declara LA VERDAD — para la cartera mensual falta un
    export de CLIENTES CON CONTRATOS (fechas), no está en este dataset.
- pytest +6 (181), node #30 (48). `pendientes.md` actualizado con lo pedido.

## 08-oct-2026 — A2 calibrado con las 5 facturas reales del usuario

- Recepción de 5 facturas reales: **3 legibles por máquina** (Iberdrola
  2.0TD autoconsumo · Apolo Energies pyme · Energía Libre 6.1TD) y **2 no**
  (1 escaneada sin capa de texto + 1 de glifos mapeados `/47 /58…`); ambos
  no-legibles quedan declarados `legible_por_maquina:false` con motivo y
  camino manual (jamás números inventados).
- `formatos-comercializadoras.json` v2: CUPS con espacios, consumo decimal
  y anual firmado (kWh/Año), potencia multi-periodo (máx P1..P6, ambos
  formatos de línea), importe por prioridad estricta, suma de kWh×€ únicos
  en facturas multi-periodo (sin duplicar), orden Apolo/ELC delante de
  Iberdrola (la distribuidora colaba en facturas ajenas).
- `factura_extraer.py` v2 exacto sobre las 3 reales: Iberdrola 326,42/5,75/94,94 ·
  Apolo 9.799,11/19,80/539,84/anual 35.530 · ELC 339/19,80/197,35 (+ motivo
  declarativo en las 2 no legibles, rc=3).
- Espejo JS del portal calibrado a la par (cups sin espacios, suma
  multi-periodo, anual prioriza comparativa; test #29 ampliado).
- `factura_extraer` extrae solo rutas y patrones — NINGÚN dato real de
  cliente se escribe en el repo (fixtures = texto sintético con esas
  marcas).
- pytest A2 5→9; sello global 176 pytest / 47 node / 17 YAML.

## 08-oct-2026 — B2 portal del cliente (capability URL)

- Ruta pública `#/cliente/<token>` (el enlace ES la llave; router normaliza
  la clave). Dossier `datos/clientes/{token}.json` con superficie benigna y
  nota «repo PRIVADO». Ficha demo de integración incluida.
- Subida de factura 100 % local: `extraerFactura()` espejo del script Python
  (prioridad `total a pagar` > `importe` > `total factura` > `total` — jamás
  el subtotal solo), confianza honesta y, si baja, lectura manual por teléfono.
- El cliente elige: guardar los números para SU comparativa (`bmae.consumo`,
  contrato A2 cerrando el bucle) o mandarlos en mailto claro a su comercial.
- Test node #29; pendientes/herramientas actualizadas.

## 08-oct-2026 — B5 incidencias y B4 plantillas de documentos

- **B5**: plantilla 🛠 + `#/incidencias` viva: SLA como label
  `compromiso:AAAA-MM-DD` (o línea del body), vencida en rojo si pasa sin
  resolver, primero en la lista; RMA leído del cuerpo («RMA: TT-ADIT-…»).
- **B4**: plantillas base contrato/anexo RGPD (¡revisión legal obligatoria!,
  en texto y al pie de cada PDF) + `integracion/scripts/documentos_plantilla.py`
  (bloquea sin campos obligatorios; aviso si NIF emisor PENDIENTE; libro con
  huella SHA-256 y dry-run) + `#/documentos` leyendo el libro.
- Bug RAIZ (`parents[3]`) corregido en ambos scripts de documentos/albaranes.
- Tests pytest +6 (171), tests node #27/#28 (46). YAML plantillas 7.

## 08-oct-2026 — B1 multirol y B3 métricas de campo

- **B1**: `rolDePermiso()` — el permiso REAL del repo de operación ES el rol
  (`admin/maintain→direccion`, `push→gestor`, `triage/pull→comercial`); login
  device-flow escribe `bmae_roles` por permiso (jamás rol inventado); menú
  shell filtrado por rol; roles vacíos → sin fence, con aviso.
- **B3**: `lib/metricas.js` + `#/panel` — desglose cola por segmento y
  resultado (solo esta máquina), albaranes y cadena, con procedencia visible;
  **sin telemetría, nada sale del navegador**.
- Tests #25/#26. Cierre del puente w2↔B1: contrato actualizado en el test del
  device flow (push → gestor).

## 08-oct-2026 — A4 solar vivo V1 (operativa sin bloqueos externos)

- `lib/solargh.js` + `#/solar`: sección «Operativa solar» leyendo Issues
  `canal:solar` + `estado-solar:*` + `visita:YYYY-MM-DD` (próximas visitas
  ordenadas y vencidas en rojo). Simulador C10 intacto arriba.
- Plantilla 🌞 solar.yml (sin PII en título) + labels documentadas.
- Recordatorio al usuario: base de clientes y 5 facturas al reanudar
  (anotado al front de `docs/pendientes.md`).

## 08-oct-2026 — A2 piezas 1-3 (comparativa de consumo real, preparada)

- `integracion/scripts/factura_extraer.py` (5 tests): TEXTO pegado ✅ (camino
  manual amable), PDF honesto (rama pypdf; sin backend ni inventa), regex por
  prioridad de importe («a pagar» manda; `\btotal` sin «subtotal»).
- `datos/tarifario/formatos-comercializadoras.json`: identificadores oficiales
  por comercializadora — se amplía con cada muestra tuya (camino "aprender").
- Comparativa caso real: `bmae.consumo` (`kwh`/`kw`) recalcula todo y el
  comparador SELLA «consumo real de factura» (test #23).
- Cuando lleguen tus 5 facturas: ajustar patrones regex por comercializadora
  + habilitar la subida desde captación.

## 08-oct-2026 — Modo ALBARÁN (operativa diaria sin certificado)

- `albaran_crear.py` (5 tests): numeración serial ALB-YYYY-####, totales
  Decimal, huella de integridad **declarada no fiscal**, anti-PII en
  `cliente_ref`, aviso honesto de NIF pendiente.
- PDF con `reportlab` + logo BMAE, commits del bot (libro + PDF por albarán).
- Plantilla 📄 Albarán + `albaranes-crear.yml` serialized + `#/albaranes` vivo.

## 08-oct-2026 — w4 + H2 (comparativa y libro vivos)

- **w4**: `datos/tarifario.json` horneado (5 comercializadoras, precio/fuente/
  fecha) + `lib/tarifario.js` — comparativa viva con caso estándar honesto
  (4 000 kWh · 5,5 kW) y ahorro contra la media; logo Iberdrola solo en su fila
  (uso comparativo). Sin red: mismo origen Pages.
- **H2**: `lib/verifactu.js` + `#/facturas` = **libro legal vivo** desde
  `datos/verifactu/cadena.json` (vacío honesto hasta w1; nunca mock en algo
  que es prueba legal) + panel «GitHub-Total vivo» en `#/panel` (cadena +
  cola local reales).
- Router anti doble-montaje (token de resolución) — carrera detectada al
  dupliziar dos resúmenes; el último commit gana.

## 08-oct-2026 — Autoría, marca y fichas del repositorio

- **Autoría formal**: [`AUTHORS.md`](AUTHORS.md) + cabeceras de
  [`LICENSE`](LICENSE) y [`README.md`](README.md): autor y desarrollador
  **Eduardo Andrés Galeano Aido** (NIE Z0002918W), con autorización de uso a
  **BMAE Energía**. Decisión expresa del autor: excepción única de documento
  de identidad en el repo (atribución legal); el resto de PII sigue prohibida.
- **Marca**: logos promovidos desde `_cuarentena/previo-f23` (copia 1:1 a
  [`diseno/marca/`](diseno/marca/LEEME.md)): `logo-bm.png` en README,
  `index.html` y shell SPA; `logo-iberdrola.png` solo en la banda
  «comercializadoras que comparamos» (uso comparativo, ® Iberdrola S.A.).
- **Entrada coherente con w2**: la landing ya no apunta a
  `frontend-auth/login.html` (inerte) — Entrar y «Pedir oferta» van a `#/login`.
- Fichas GitHub del turno anterior: `LICENSE`/`CONTRIBUTING`/`CODE_OF_CONDUCT`
  `SECURITY`/`SUPPORT`/`CHANGELOG` + `CODEOWNERS` + plantillas PR/issue.

## lo que NUNCA sale del repo

Los `.pem`/`.p12` y cualquier histórico de PII purgado de tests: sigue siendo
la misma regla desde A. La cuarentena ya no existe — **D4 ejecutada el
08-oct-2026 con autorización expresa tras verificación** (activos survivientes
promovidos: logos marca, catálogo, guiones v4.4.8, resultados; inventario en
`docs/historico/d4-inventario-destruido.txt`).
