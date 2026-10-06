# ADR-008 · F18+ (Ola 2c): simulador de potencia con parseo local y propuesta imprimible (v4.0.3)

**Estado:** aceptada · 05-10-2026 · Ola 2(c) del plan v6 — «parseo local → reglas 2.0/3.0TD → propuesta PDF»

## Contexto
El cierre comercial del nicho arranca con una factura: el comercial mira potencia contratada vs demanda y propone optimización. Hoy eso se hace «de memoria» y sin documento. La app debe hacerlo en el dispositivo del comercial **sin que la factura salga del móvil** (RGPD por diseño) y con el producto del catálogo (tarifa20/tarifa30) ya creado en F2.

## Decisión

1. **Alcance v1: optimización de POTENCIA** (2.0TD: P1-P2 · 3.0TD: P1-P6). El componente precio-energía cambia a diario (F22/OMIE llega en Ola 3); la potencia es el bloque estable y el primero que se negocia.
2. **Parseo local**: pegar el texto de la factura (copiar del PDF) → extractor tolerante: detecta potencias contratadas por periodo, la tarifa (2 periodos → 2.0TD, 6 → 3.0TD) y el nombre si se ve. Nunca sale del dispositivo (no hay fetch): regla dura de esta pieza.
3. **Regla F18-1 (documentada y auditable)**: por periodo, con la **demanda real** (máximos de los últimos 12 m de maximétero, introducidos a mano o pegados) y el **margen de seguridad editable** (por defecto 10 %):
   - `popt = ceil(demanda_máx × (1+margen) × 100) / 100` kW;
   - demanda > contratada → propuesta 📈 (evita penalizaciones del mes); demanda ≤ contratada → propuesta 📉 al óptimo (ahorro);
   - sin dato de demanda en ese periodo → no se toca («sin cambio — aportar maximétero»).
   - El margen y los **precios €/kW·año por periodo son EDITABLES** (defaults orientativos 2.0TD≈35/3 € · 3.0TD≈13/8/5/3/2/1.5 €) porque la comercializadora del cliente los fija — el simulador computa el ahorro con los precios visibles en pantalla, nunca con números ocultos.
4. **Propuesta imprimible** (`🖨`): vista limpia (cabecera B&M + tabla periodo a periodo + ahorro total €/año + sello fecha/versión) impresa con el patrón `cfb-printing` ya existente (print dialogs de cualquier móvil/PC = «PDF» legal del usuario, firma/seco — sin librerías externas, todo offline).
5. **Puente al CRM** (el arma de venta real): botón «💾 Anotar en ficha» de la empresa origen — nota con resumen numérico (actual→propuesta por periodo + ahorro estimado) y el producto del catálogo **tarifa20/tarifa30 se marca 📤 Ofertado** (o entra al embudo) automáticamente. Actividad con resultado `X €/año` (solo números, anónimo).
6. **UI**: botón «📄 Simular oferta» en el editor de la ficha; sub-vista `CRM_FILTRO.sim` dentro de la pestaña Clientes con «← volver». Cliente precargado; también funciona suelta («empresa manual»).

## Alternativas descartadas
- PDF binario (jsPDF vía CDN): rompe offline-first y CSP — descartado; la ruta impresora→PDF es universal en el equipo.
- Precio de energía del catálogo (cambian semanalmente): para F2/F18+ el as de ventas es la potencia — precio llega con F22/OMIE (Ola 3) que trae tarifas vivas.
- Paridar vs maximétero automático: sin OCR (F20-IA posterior); pegado + regex tolerante es el honesto 80/20.

## Consecuencias
- Cero esquema nuevo: la simulación vive en notas + embudo (todo compatible con lo ya cifrado/S1/CSV).
- Reglas matemáticas deterministas y testeadas con fixtures exactas (W22) — los importes siempre son trazables a precios VISIBLES en pantalla (educación comercial: discute el precio con el cliente, no el Excel).
