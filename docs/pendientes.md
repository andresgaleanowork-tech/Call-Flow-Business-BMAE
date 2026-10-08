# Pendientes — tablero único (fecha: 08-oct-2026)

Dos columnas: **tu parte** (gestos humanos, ninguno de código) y **nuestra
parte** (olas de trabajo ya listas para ejecutar). Cada casilla que se
marca, se commitea aquí — el Git lleva la memoria.

---

## 🟠 Tu parte (gestos humanos; sin código)

> **📥 PRÓXIMA ENTREGA TUYA (recordatorio al reanudar)**: base de datos de
> clientes (CSV/JSON) para A1+A3 y 5 facturas de comercializadoras distintas
> para A2 — lo has anunciado tú 08-oct; yo te lo repito cuando lo retomemos.

### Modo ALBARÁN (sin certificado, activo desde 08-oct) — ya construido aquí

Operativa diaria: abrir issue 📄 Albarán + label `albaran:crear` → PDF con
diseño y asiento en `datos/albaranes/`. Cuando el certificado llegue se
activa F4G·w1 encima — los albaranes NO son facturas ni se migran.

### Bloqueado hasta tener certificado (cadena F4G·w1)

- [ ] **[BLOQUEADO, sin fecha, el usuario lo confirma 08-oct sin fecha] Obtener el certificado electrónico cualificado** (FNMT-RCM,
      representante de la sociedad emisora) y las credenciales `.p12`.
      Guía: fnmt.es > Certificado electrónico de representante / apoderado.
- [ ] Convertirlo a PEM en base64 y subirlo como secret (paso 1 de
      `deploy-github.md` §GitHub-Total): environments `verifactu-
      preproduccion` y `verifactu-produccion` (con *required reviewers*).
- [ ] **Primera factura real en preproducción**: abrir un invoice-issue
      (plantilla 🧾 Factura VeriFactu), label `verifactu:emitir` y
      confirmar que el workflow comenta huella + respuesta AEAT.

### Imprescindible para entrar y operar (login + CRM diario)

- [ ] **Crear la OAuth App con Device Flow** (paso 5 de
      `deploy-github.md`): copiar el CLIENT_ID a
      `apps/web/src/lib/ghdevice.js` y el repo de operación a
      `lib/canalgithub.js` (`REPO_OPERACION = "tu-org/tu-repo-privado"`).
- [ ] **Fijar el buzón** (1 issue creado, título «BUZÓN COMERCIAL»,
      pin issue): el canal Call-Flow ya sabe a dónde escribir (nº 1).
- [ ] **Crear las labels** (`deploy-github.md` paso 3 — copiar lista).
- [ ] **Pasarme la base de datos de clientes** (CSV UTF-8 o JSON — del
      Excel basta «Guardar como»). Ya tengo el formato exacto en
      `docs/herramientas-web.md` A1 — con ella construyo `#/clientes`
      y A3 (vencimientos) el mismo día.
- [ ] **3-5 facturas reales de muestra** (sin bultin PII mejor que con) para
      entrenar el lector de consumos (A2).

### Repo público (higiene, 5 min)

- [ ] **Description + Topics + protección de `main`** (deploy §«Fichas
      de identidad del repo» — todo escrito).
- [ ] Revisar `CODEOWNERS`: sustituir `@direccion-tecnica`/@gestor por los
      nombres de usuario GitHub reales.

---

## 🟢 Nuestra parte (ola que recibo y ejecuto, o declarada para la contraprogramación)

| # | Ola | Estado | Hito de aceptación |
| :-- | :-- | :-- | :-- |
| F4G·w0 | SIF + canal CRM construidos | ✅ | sello sello |
| F4G·w2 | Login device-flow en la SPA | ✅ | solo falta atornillar el CLIENT_ID |
| F4G·w3 | Pipeline vivo desde Issues | ✅ V1 | Projects v2 auto-add = token de org (opcional) |
| F4G·w4 | Comparativa con tarifario horneado | ✅ V1 | actualizar precios = editar `datos/tarifario.json` |
| H2 | Panel + libro VeriFactu vivos | ✅ | desde `cadena.json` (bot del SIF) |
| F4G·w1 | Primera emisión real AEAT | ⏳ depende de tu certificado | workflow comenta CSV, QR, código error |
| A1 | `#/clientes` (importador + página) | **⏳ esperando tu base de datos** | fichas vivas + guardián RGPD |
| A3 | Vencimientos T-60/30/7 con issues cron | tras A1 | cero contratos vencen sin acción |
| A2 | Consumos reales por CUPS | ⏳ piezas 1-3 construidas 08-oct (extractor 3-piezas: texto pegado ✅, PDF honesto, config por comercializadora; caso real ya recalcula la comparativa) — **esperando tus 5 facturas** para afinar patrones y encajar formatos | comparativa con 12-36 m reales |
| A5 | Factura PDF con QR de cotejo AEAT | tras w1 | desde XML+cadena, commiteada por bot |
| ALB | **Módulo Albaranes (operativa sin cert)** | ✅ 08-oct | `albaran_crear.py`+workflow (5 tests) + `#/albaranes`+jsdom #22 + PDF con logo/arroba honesto |
| A4 | Solar vivo (presupuestos→garantías) | ✅ V1 08-oct | grupos+visitas vencidas en rojo + plantilla; garantía activa al cerrar instalación |
| B1 ✅ | Multirol permiso→rol→menú | 08-oct | test #26 |
| B2 ✅ | Portal del cliente (capability URL, dossier benigno, factura en local) | 08-oct | test #29; gestos: generar dossier real por cliente + mantener repo PRIVADO |
| B3 ✅ | Métricas campo C9 §4 (offline-first) | 08-oct | test #25 |
| B4 ✅ | Plantillas contrato/anexo RGPD → PDF + `#/documentos` | 08-oct | script + 6 pytest + test #28; revisión legal pendiente (gesto humano) |
| B5 ✅ | Incidencias y garantías SLA + RMA | 08-oct | `#/incidencias` + plantilla 🛠 + test #27 |
| B2 ✅ | Portal del cliente (capability URL, dossier benigno, factura en local) | 08-oct | test #29; gestos: generar dossier real por cliente + mantener repo PRIVADO |
| QA | 5 llamadas reales de un comercial en el Call-Flow | when listo | módulo validado sin tocar la v4.4.8 |

---

## 🗓️ Siguiente acción sugerida (en orden miopía: primero valor/riesgo)

1. Tu parte: **certificado FNMT + OAuth App Device Flow + base de datos de
   clientes + fijar buzón + 3-5 facturas** — todo «gesto humano» de una tarde.
2. Mientras lo consigues: **A1 + A3 se preparan aquí** en cuanto llegue tu
   CSV; **A5** espera a la primera factura real.
3. Opcional (cuando quieras, no bloquea): autorizar Projects v2 auto-add
   (token de organización) y revisar OMIE diario (C1) — externas.

Marcar `[x]` = commit por persona que lo cierra; si algo caduca, se borra
COMENTANDO por qué (no se deja huérfano).
