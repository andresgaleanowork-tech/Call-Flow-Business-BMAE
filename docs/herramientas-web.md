# Herramientas para completar la web (roadmap GitHub-Total)

Fecha: 08-oct-2026 · Estado base: w0·w2·w3·w4·H2 ✅ selladas.
Regla: cada herramienta se construye 100 % dentro de GitHub (Pages + Actions +
Issues/labels) y con sello honesto — jamás «parecer que tiene datos».
Ninguna sale del repo salvo excepción legal declarada (AEAT ya; OMIE se valora).

Heal oficina digital = «todo lo que una comercializadora opera cada día».

---

## A · Ya casi (dependen solo de que me llegue un dato tuyo)

### A1 — Clientes (CRM vivo, fichas + operativa día a día) · **✅ prospección 08-oct**
> Importador IberCRM→`datos/prospectos/` (32.582 únicos) + `#/prospectos` lazy +
> guionar directo a Call-Flow. Falta sólo el export de clientes con contratos
> para las fichas CRM propiamente (misma mecánica, ver A3).
**Qué**: importar tu base de datos → `datos/crm/clientes.json` + página
`#/clientes` con búsqueda, ficha viva (histórico, llamadas = issues
`canal:callflow`, facturas = cadena VeriFactu, tarifa actual, vencimientos),
pipeline unificado con `#/gestor`, y «nueva gestión» desde la propia ficha.
**Me falta de ti**: la base de datos (CSV o JSON exportado de tu herramienta
actual). Formato ideal (JsonLines o CSV con cabecera):
```
cliente_id, nombre_comercial, nif_cif, segmento (pymes|residencial|gran-proyecto),
cups_principal, tarifa_actual, comercializadora_actual, fin_contrato (YYYY-MM-DD),
consumo_anual_kwh, potencia_kw, telefono_ok (vacío si desconocido), email_ok,
gestor_asignado (login GitHub), notas_publicas
```
Guardián anti-PII heredado: teléfono/email solo en tus propios registros ya
consentidos; se importa con minimización y queda solo en repo **privado**.
RGPD: fichas sin DNI en la URL (huella como clave), derechos de borrado por
issue (workflow `clientes-dsr` borra + commitea la purga).
**Esfuerzo**: ≈1 sesión (importador + página + tests).

### A2 — Consumos reales por CUPS → comparativa real (fuera caso estándar) · **piezas 1-3 ✅ 08-oct** (`factura_extraer.py` + tarifario caso real en `bmae.consumo`; faltan muestras tuyas para encajar patrones)
**Qué**: subir factura del cliente (PDF/foto) → extracción (T6 ya sellado en 3
piezas: CUPS, períodos, kWh por periodo) → la comparativa calcula con los
kWh reales de 12-36 meses. Cierra la promesa del hero de la landing.
**Me faltaba**: facturas reales para calibrar — **ENTREGADAS 08-oct (5)**:
3 parseadas al 100 % (Iberdrola 2.0TD, Apolo Energies, Energía Libre 6.1TD)
y 2 honestas no-legibles (escaneada y glifos, ambas camino manual). Si llegan
más formatos, cada uno es una entrada nueva en el config + par de fixtures.
**Esfuerzo**: hecho 08-oct.

### A3 — Vencimientos y renovaciones («no dejar escapar un contrato»)
**Qué**: desde `fin_contrato` de cada cliente: workflow diario cron crea/
renueva issue cuándo un contrato entra a T-60/T-30/T-7, label `vence:*`,
listado en `#/panel` («12 contratos vencen este mes») y acción directa al
Call-Flow con el guión correcto. Cero pérdida por despiste.
**Esfuerzo**: 1 sesión. Depende de A1.

### A4 — Solar vivo (presupuestos + calendario de instalaciones) · **V1 ✅ 08-oct** (`#/solar` operativa leía de Issues `canal:solar`/`estado-solar:*`/`visita:*`; simulador C10 intacto; plantilla 🌞)
**Qué**: la página `#/solar` pasa de mock a vivo: presupuestos como issues
con labels, estado (visita→presupuesto→entrega), garantías del histórico
ADR-028 (garantía viva activable al completar), y panel de próximas visitas.
**Esfuerzo**: ≈2 sesiones.

### A5 — Factura PDF (ciclo completo del SIF) · precedida temporalmente por **ALBARÁN** ✅ (08-oct: operativa diaria con documento no fiscal mientras llega el certificado)
**Qué**: tras `cadena.json`, generar el PDF de la factura con el QR de cotejo
AEAT (`facturas/<NumSerie>.pdf`, commiteado por el bot) + enlace desde
`#/facturas` y desde la ficha cliente. Ya tenemos XML+huella+QR: el PDF es
un render.
**Esfuerzo**: 1 sesión. Depende de w1 (primera emisión real).

---

## B · Transversal (mejora de la plataforma, no nuevos silos)

| # | Herramienta | Valor | Esfuerzo |
| :-- | :-- | :-- | :-- |
| B1 | **Roles multirol por equipos GitHub** (comercial vs gestor vs dirección): al login device-flow, rol = permission del repo o team GitHub → menús + permisos de escritura · **✅ 08-oct (rol = permiso real; menú por rol; ver cierre.md)** | Seguridad y foco | 1 sesión |
| B2 | **Portal del cliente** · ✅ 08-oct: `#/cliente/<token>` capability-URL (sin login; el enlace es la llave), dossier `datos/clientes/{token}.json` de superficie benigna, factura leída EN SU NAVEGADOR (espejo del extractor Python), elección: comparativa propia (`bmae.consumo`) o mailto a su comercial; ficha demo incluida | — | — |
| B3 | **Métricas de campo C9 §4** · ✅ 08-oct: `#/panel` desglosa cola local por segmento/resultado + albaranes + cadena VeriFactu, con procedencia al lado y SIN telemetría (offline-first; las del pipeline vivo ya estaban en `#/gestor`) | — | — |
| B4 | **Plantillas de documentos** · ✅ 08-oct: contrato + anexo RGPD base (marca «revisión legal obligatoria» en texto y PDF) + `documentos_plantilla.py` con bloqueo por campos obligatorios, libro con huella y `#/documentos`; workflow dedicado cuando lo pidas | — | — |
| B5 | **Incidencias y garantías** · ✅ 08-oct: `#/incidencias` viva (issues `canal:incidencia`, estados `estado-inc:*`, SLA `compromiso:AAAA-MM-DD` en rojo si pasa sin resolver, RMA del cuerpo) + plantilla 🛠 | — | — |

## C · Oleada externa (decisión explícita tuya, opt-in)

| # | Herramienta | Tipo de salida | Valor |
| :-- | :-- | :-- | :-- |
| C1 | **Precio OMIE/PVPC diario** (API pública REE, solo Actions build-time → `datos/omie.json`) — comparativa indexada del día real | Llamada externa (no legal) | Tarifario indexado actualizado a diario |
| C2 | **Envío de la factura al cliente** (email) con proveedor de correo. Si quieres: ruta plantillada «mailto» que abre el cliente listo, 0 servicios extra | Opcional | Menos pasos manuales |
| C3 | **WhatsApp Business** para confirmaciones (plantillas aprobadas) | Opcional | Ratio de respuesta comercial |

## lo que NUNCA será herramienta de esta web

- Spam, boletines masivos ni tracking de clientes sin consentimiento.
- Analytics de terceros embebidos en páginas.
- IA que decida sobre clientes sin revisión humana de las recomendadas.
- Datos de terceros fuera de la minimización RGPD documentada.

---

## Prioridad propuesta (máximo valor / mínimo riesgo)

1. **A1 Clientes** ✅ prospección 08-oct (dataset importado). A3 espera el export clientes-contratos.
2. **A3 Vencimientos** (con A1, cierras marcas ingresos).
3. **A2 Consumos reales** (con 3-5 facturas de muestra).
4. **A5/A4** (cuando w1 emita la primera factura real).
5. **B1–B5** en este orden según el día a día lo pida.

**¿Listo?** Pásame la base de datos de clientes (CSV/JSON; si viene de Excel,
«guardar como CSV UTF-8» basta) y empiezo con el importador + `#/clientes`.
