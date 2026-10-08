# C6 — Wireframes (10 páginas)

> Baja fidelidad en ASCII + anotaciones de comportamiento. Desktop 12 col;
> la columna «móvil» resume la re-disposición (4 col). Cada página indica
> **estados obligatorios** (§9) y el componente C5 que la resuelve.
> Referencia pixel-real: `mockups/*.html` (landing, dashboard, comparador, solar).

Convenciones ASCII:
```
┌─┐ borde de caja      ▣ imagen/logo       [ texto ] botón
▒▒ skeleton            ● radio/activo      ( ) radio · [x] checkbox
─ ─ división           ⇅ ordenable         ▲▼ delta
```

---

## 01 · Landing pública  —  *objetivo: captar CUPS/factura*

```
┌───────────────────────────────────────────────────────────────────────┐
│ ▣ BMAE        Tarifas  Solar  Cómo funciona  FAQ        [ Entrar ]    │ ← header 72px sticky
│                                                       [ Pedir oferta ] │   (primario, 44px)
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Tu factura de la luz, negociada en serio.                           │ ← H1 Space Grotesk 48
│   Comparamos +40 comercializadoras con TU consumo real,               │   sub Inter 20 gris
│   no con medias de sector.                                            │
│                                                                       │
│   ┌───────────────────────────────────────────────┐                   │
│   │  CUPS o sube tu factura PDF  [____________]   │ ← captación hero  │
│   │  (o pégate la factura aquí)      [ Analizar ] │   btn lg          │
│   └───────────────────────────────────────────────┘                   │
│   ⌂ 1 847 análisis este mes · sin spam · borrado a petición           │ ← confianza
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  CÓMO FUNCIONA          AHORRO REAL           VERIFACTU INSIDE        │ ← 3 tarjetas 4col c/u
│  ▣ 1. Cuéntanos tu …   ▣ Comparador en 36 m   ▣ Facturas válidas      │
├───────────────────────────────────────────────────────────────────────┤
│  «Pasamos de 340 € a 251 € al mes» — panadería, Valencia   ▲ 26 %     │ ← prueba social (KPI)
│  ▣ logo   ▣ logo   ▣ logo   ▣ logo   ▣ logo                           │
├───────────────────────────────────────────────────────────────────────┤
│  footer: legal · privacidad · contacto · © 2026 BMAE                  │
└───────────────────────────────────────────────────────────────────────┘
```
**Móvil**: hero apilado, CTA ancho completo, tarjetas en scroll-vertical.
**Estados**: campo CUPS inválido (error in-line conregex C5) · PDF >10 MB (error) · analizando (skeleton→redirección a §03).

---

## 02 · Registro / Entrar  —  *auth sellada del Bloque B*

```
┌────────────────────────────────────────────┐
│                ▣ BMAE                       │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  [ Entrar ] [ Crear cuenta ]        │ ← segmented  │
│   │                                     │   │
│   │  Email     [____________________]   │ ← campo C5   │
│   │  Contraseña[____________________]👁 │   autocompl. │
│   │                                     │   │
│   │  [          Entrar          ]       │ ← primary lg │
│   │                                     │   │
│   │  ¿Olvidaste tu contraseña?          │   │
│   │  ─── o ───                          │   │
│   │  [ Magic link por email ]           │ ← ghost      │
│   └─────────────────────────────────────┘   │
│   Al continuar aceptas la privacidad (RGPD) │
└────────────────────────────────────────────┘
```
**Estados**: credenciales mal (toast error assertivo §11) · magic-link enviado (estado de confirmación) · loading en botón durante exchange Frappe (D-B1).

---

## 03 · Captación — «Cuéntanos tu suministro» (asistente 3 pasos)

```
┌───────────────────────────────────────────────────────────────────────┐
│  ●━━━ Paso 1 de 3 ━━━○━━━━○                            Guardar y salir│ ← progreso
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Tu suministro                                                       │
│                                                                       │
│   CUPS *               [_________________________]                    │
│   ⚠ lo encontramos en tu factura, arriba a la derecha                 │ ← ayuda con micro-ayuda
│                                                                       │
│   Consumo anual (kWh)  [________]  «si no lo sabes, lo estimamos»     │ ← opcional honesto
│                                                                       │
│   Tipo de vivienda     ( ) Hogar  ( ) Negocio  ( ) Comunidad          │
│                                                                       │
│   Código postal        [_____]                                        │
│                                                                       │
│   [← Atrás]                              [ Seguir →]                  │
└───────────────────────────────────────────────────────────────────────┘
Paso 2 (si hay PDF): parser muestra 36m extraídos ─ «¿Son correctos?» [Sí][Editar]
Paso 3: ¿Tienes placas o te interesa solar? → bifurca a §08.
```
**Móvil**: un campo por pantalla, teclado adecuado (`inputmode`).
**Estados**: CUPS ya registrado → ofrece entrar · parser sin resultados → «no pasa nada, a mano» · guardado parcial real (vuelves donde estabas).

---

## 04 · Comparador de ofertas  —  *la página del dinero*

```
┌───────────────────────────────────────────────────────────────────────┐
│  Tu comparativa                    ⌂ sellada con 36 meses reales  ⌂   │ ← sello honesto chip
│  Ordenar por [ahorro ▾]   ⚙ columnas                                  │
├───────────────────────────────────────────────────────────────────────┤
│ ┌─RECOMENDADA──────────────────────────────────────────────────────┐  │
│ │ ▣ Endesa One Luz          0,129 €/kWh     2 870 €/año   −412 €/año│  │ ← fila-comparador §Figma
│ │   fija · sin permanencia  potencia 0,098 €/kW·día        ▲ 12,6 % │  │
│ │   [x] VeriFactu                                    [ Pedir esta ] │  │
│ └──────────────────────────────────────────────────────────────────┘  │
│  ▣ Octopus Relax          0,131 €/kWh     2 915 €/año   −367 €/año   │
│    indexada PVPC+0,01     [x] VeriFactu                [ Pedir esta ]│
│  ▣ Iberdrola Plan Online 0,134 €/kWh     2 980 €/año   −302 €/año   │
│    …                                                                   │
├───────────────────────────────────────────────────────────────────────┤
│  ▒▒▒ desglose: energía 58 % · potencia 23 % · impuestos 19 %          │ ← gráfica composición
└───────────────────────────────────────────────────────────────────────┘
```
**Móvil**: filas → tarjetas apiladas (`.tabla--tarjetas`), recomendada primero con cinta.
**Estados**: calculando (skeleton filas §C5) · sin ofertas mejores («ya tienes la mejor del mercado indexada — te lo demostramos») · error tarifario (toast + reintentar).

---

## 05 · Alta / contratación asistida (gestor humano entra aquí)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Pedido #4816 · Panadería Sol            estado: ● Documentación      │ ← stepper Twenty
├───────────────────────────────────────────────────────────────────────┤
│  DATOS FISCALES (requerido VeriFactu)                                 │
│   NIF/CIF *   [___________]  ✓ válido                                 │ ← campoC5 NIF
│   Razón social[________________________]                              │
│   Dirección   [________________________]  CP [_____]                  │
│                                                                       │
│  CUENTA DE COBRO                                                      │
│   IBAN *      [ES__ ____ ____ ____ ________]  se valida dígito ctrl   │
│                                                                       │
│  CONSENTIMIENTOS RGPD                                                 │
│   [x] Cambio de comercializadora en mi nombre (obligatorio)           │ ← legalmente explícito
│   [ ] Comunicarme ofertas futuras (opcional)                          │
│                                                                       │
│  [ Descargar borrador PDF ]                [ Enviar a tramitación → ] │
└───────────────────────────────────────────────────────────────────────┘
```
**Estados**: NIF/IBAN inválido in-line · envío con `btn--loading` · éxito → modal confirmación «pedido en tramitación, te escribimos en 24 h» (componente Modal C5).

---

## 06 · Dashboard cliente  —  *la página de «qué pasa con mi luz»*

```
┌───────────────────────────────────────────────────────────────────────┐
│ ☰ BMAE        [Dashboard] Suministros Solar Facturas Ajustes   ▣ Ana ▾│ ← shell sidebar 240
├──────────┬────────────────────────────────────────────────────────────┤
│          │  Hola, Ana. Este mes llevas 26 € menos que en octubre 2025.│
│  KPIs →  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│          │ │ Gasto    │ │ Consumo  │ │ Ahorro   │ │ Próxima  │        │ ← 4× KPI C5
│          │ │ 214 €    │ │ 298 kWh  │ │ acum.    │ │ revisión │        │
│          │ │ ▼ 12 %   │ │ ▼ 8 %    │ │ 486 €    │ │ 12 días  │        │
│          │ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│          │                                                            │
│          │  CONSUMO 36 MESES — sello: 14 meses reales + 22 estimados   │ ← sello honesto SIEMPRE
│          │  ▂▃▅▃▂▆▅▃▂▃▆▇▅▃▂ …  ─ ─ media móvil                          │
│          │                                                            │
│          │  ALERTAS                          TUS PEDIDOS               │
│          │  ⚠ Tu tarifa sube el 1-nov      #4816 ● En tramitación     │
│          │    te interesa mirar 0,129 €    #4772 ✓ Completado         │
│          │    [Ver oferta →]               [Ver todos]                │
└──────────┴────────────────────────────────────────────────────────────┘
```
**Móvil**: KPIs 2×2, gráfica full-width scroll horizontal con snap.
**Estados**: cada KPI con skeleton/sin-dato «—» · gráfica con mensaje de datos parciales · sidebar colapsa a bottom-bar.

---

## 07 · Detalle de suministro

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Suministros / ES0021…0001AA (hogar)                [✎] [⚠ dar de baja]
├───────────────────────────────────────────────────────────────────────┤
│  TARIFA ACTUAL              POTENCIA                FACTURACIÓN       │
│  PVPC regulada              4,6 kW (P1) 4,6 kW (P2) 214 € mes medio   │
│  «te sobra 1,2 kW en P2»    ← oportunidad detectada                   │
├───────────────────────────────────────────────────────────────────────┤
│  FACTURAS (36)                                                      ▒ │
│  Mes ⇅     kWh ⇅    Importe ⇅   VeriFactu        PDF                  │
│  sep-26    298      61,20 €     ✓4f9c…a2  [descargar]                 │
│  ago-26    312      64,10 €     ✓7b1e…d0  [descargar]                 │
│  …                                       [ Cargar más ]               │
└───────────────────────────────────────────────────────────────────────┘
```
**Estados**: tabla skeleton 5 filas mientras carga · VeriFactu pendiente «enviando…» (chip ámbar) · baja → modal confirmación C5 con texto legal.

---

## 08 · Solar / autoconsumo

```
┌───────────────────────────────────────────────────────────────────────┐
│  Simulador solar — techo en Calle Colón 12 (Catastro ✓)               │
├───────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐   PANELES propuestos: 8 × 455 W = 3,64 kWp          │
│  │   ▣ mapa/     │   PRODUCCIÓN estimada: 5 240 kWh/año                │
│  │   techo       │   AUTOCONSUMO: 68 % · EXCEDENTE: 32 %               │
│  │   (SVG)       │   AHORRO: 812 €/año + compensación 165 €            │
│  └───────────────┘   INVERSIÓN: 5 400 € → retorno 5,5 años ±1,2       │ ← rango honesto
│                                                                       │
│  ▂▃▅▆▇▇▆▅▃▂▁ producción por mes (se ve el verano)                      │
│                                                                       │
│                     [ Pedir estudio a instalador ]                    │
└───────────────────────────────────────────────────────────────────────┘
```
**Nota de diseño**: TODOS los números con rango / «estimado»; prohibido prometer exactitud (línea editorial C10).

---

## 09 · Facturas & VeriFactu (admin + cliente)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Facturas                          [+ Nueva factura]  ⬇ exportar CSV  │
├───────────────────────────────────────────────────────────────────────┤
│  Serie   Núm   Fecha ⇅    Cliente          Base+IVA    Estado VF      │
│  F26     0140  01-oct-26  Panadería Sol    61,20 €     ✓ registrada   │
│  F26     0139  01-oct-26  Taller Roig      112,40 €    ✓ registrada   │
│  F26     0138  30-sep-26  Ana Ferrer       48,90 €     ◌ enviando…    │ ← ámbar 3× retry
│  F26     0137  30-sep-26  Café Ruzafa      96,15 €     ✗ error AEAT   │ ← rojo + acción
│                                                       [ Corregir → ]  │
├───────────────────────────────────────────────────────────────────────┤
│  Detalle 0137: encadenamiento roto en huella — motivo AEAT «4105»      │
│  [ Reintentar registro ]  [ Ver expediente completo ]                  │
└───────────────────────────────────────────────────────────────────────┘
```
**Estados críticos**: `◌ enviando` (skeleton chip) · `✗ error` (no solo color: icono × + texto acción) · lista vacía («emisión automática al activar VeriFactu»).

---

## 10 · Panel gestor (pipeline Twenty embebido)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Pipeline · 23 pedidos activos        ⚡olio: hoy 4 cierres            │
├───────────────────────────────────────────────────────────────────────┤
│  NUEVO (3)        DOCUMENTACIÓN (5)     TRAMITANDO (9)   ACTIVADO (6) │
│ ┌────────────┐   ┌────────────┐        ┌────────────┐  ┌────────────┐ │
│ │#4821 Ana F.│   │#4816 Pana- │        │#4809 Café  │  │#4771 Casa  │ │
│ │hogar·4,6kW │   │dería · CIF │        │Ruzafa · VF │  │Solar · VF ✓│ │
│ │hoy 09:12   │   │✓ falta IBAN│        │AEAT ✓      │  │alta 4-oct  │ │
│ │[ Contactar]│   │[ Recordar ]│        │[ Seguir ]  │  │[ Ficha ]   │ │
│ └────────────┘   └────────────┘        └────────────┘  └────────────┘ │
│  …                                                                   │
├───────────────────────────────────────────────────────────────────────┤
│  al arrastrar tarjeta → Twenty REST (workflows/24) · SLA 24 h por etapa│
└───────────────────────────────────────────────────────────────────────┘
```
**Estados**: error de red arrastrando (toast + revert visual) · columna vacía (empty state «sin pedidos nuevos, buen momento para llamadas») · rol solo-lectura (cliente final nunca ve esto).

---

## 11 · Comercial / Guiones Call-Flow — *módulo integrado (decisión usuario 07-oct)*

Especificación completa: `guias/integracion-callflow.md`. Rol `comercial`.

```
┌───────────────────────────────────────────────────────────────────────┐
│ ☰ BMAE Comercial   [Guiones] Actividad            ▣ Comp. Rodríguez ▾ │
├───────────────────────────────────────────────────────────────────────┤
│  ¿Con qué segmento vas a llamar hoy?        ← verbatim v4.4.8 (puerta)│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │
│  │ 🏠 Residencial   │ │ 🏢 PYME          │ │ ☀ Solar/ingeniería│ ← catalógo│
│  │ tarifa 2.0TD     │ │ tarifa 3.0TD/gas │ │ + mantenimiento   │   filtra │
│  │ [ Abrir guion ]  │ │ [ Abrir guion ]  │ │ [ Abrir guion ]   │   área   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘          │
├───────────────────────────────────────────────────────────────────────┤
│ GUION · Residencial                          ●━━ Preparación ━○ ○ ○ ○ │ ← progreso
│ ┌─ DATOS DE LA LLAMADA (personaliza el guion) ──────────────────────┐ │
│ │ Nombre [________]  Empresa/localidad [________]  Tarifa [_______] │ │ ← campos C5, plantillas {{…}}
│ └───────────────────────────────────────────────────────────────────┘ │
│ ┌─ PANEL GUION (izq) ───────────────┐ ┌─ PANEL NOTAS (dcha) ────────┐ │
│ │ «Hola {{nombre}}, te llamo de     │ │ nota ≤140 car.               │ │
│ │ BMAE…»                            │ │ [guardián anti-PII activo]   │ │
│ │                                   │ │ ─────────────────────────    │ │
│ │                      [ Seguir → ] │ │ histórico llamada (≤3)       │ │
│ └───────────────────────────────────┘ └──────────────────────────────┘ │
│ Resultado: [Permanencia ▾]      [ Registrar gestión ] [ Cerrar llamada]│
└───────────────────────────────────────────────────────────────────────┘
Vista Actividad (#/callflow/actividad): KPIs C5 {gestiones hoy · embudo
últimos 30 días · tasa interés} + tabla registro (resultado Badge C5).
```
**Móvil**: paneles apilados (guion primero, notas tras «Seguir»); tarjetas de
segmento a una columna.
**Estados**: guardián anti-PII bloquea nota (error in-line con regla) ·
registro sin resultado (campo requerido) · Twenty caído (toast error +
reintento, la nota NO se pierde: cola local).

---

## Cobertura del criterio de hecho (C6, 11 páginas)

| Página | C5 usados | Estados §9 cubiertos |
|---|---|---|
| 01 Landing | Botón, Campo(CUPS), KPI(prueba social) | error campo, loading CTA |
| 02 Auth | Campo, Botón, Toast | credenciales, magic-link, loading |
| 03 Captación | Campo, Selector, Checkbox, Botón | bifurcación parser, guardado parcial |
| 04 Comparador | Tabla→tarjetas, Badge, Toast | skeleton, sin-ofertas, error tarifario |
| 05 Alta | Campo(NIF/IBAN), Checkbox, Modal | validaciones, éxito |
| 06 Dashboard | KPI, Skeleton, Toast, gráfica | sin-dato, parciales |
| 07 Suministro | Tabla, Badge, Modal(confirmación) | skeleton, VF pendiente, baja |
| 08 Solar | KPI, Botón, gráfica | rangos honestos |
| 09 Facturas | Tabla, Badge(VF), Toast | enviando/error AEAT |
| 10 Gestor | Tarjetas, Toast, Estado-vacío | revert red, columnas vacías |
| 11 Call-Flow | Campo, Selector, Badge, Toast, Modal | anti-PII, requerido, cola offline |
