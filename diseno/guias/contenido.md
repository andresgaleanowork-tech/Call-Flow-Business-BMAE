# C10 — Guía de contenido y línea editorial

> **Principio rector «Energía Precisa»**: el sector eléctrico vive de la
> confusión. Nosotros ganamos aclarando. Cada texto se mide contra una
> pregunta: **¿esto ayuda a Pilar a decidir, o ayuda a que no mire?** Solo la
> primera respuesta es aceptable.

---

## 1. Voz y tono

| Situación | Tono | Ejemplo ✓ | Ejemplo ✗ |
|---|---|---|---|
| Normal | directo, cálido, plural «te» | «Te sobra 1,2 kW de potencia.» | «Se ha detectado un exceso de potencia contratada.» |
| Ahorro | preciso, nunca triunfalista | «−412 €/año con tu consumo.» | «¡¡AHORRA HASTA 412 €!!» |
| Error técnico | humano + siguiente paso | «No hemos podido leer el PDF. Súbelo de nuevo o escribe el CUPS a mano.» | «Error 422 en parse_factura()» |
| Error AEAT/VeriFactu | responsabilidad nuestra, no del cliente | «La factura no se ha registrado aún; lo estamos reintentando (intento 2 de 3). Te avisamos.» | «Fallo del sistema de la AEAT, contacte soporte» |
| Datos parciales | honestidad explícita | «14 meses reales + 22 estimados por estacionalidad.» | (silencio, aparentar 36 reales) |
| Vaciado de privacidad | derecho, no favor | «Borramos tus datos cuando nos lo pides. Sin llamada de retención.» | «¿Seguro que quieres perderte las ofertas?» |

Reglas duras:

1. **Números con unidad y contexto**: «298 kWh (▲ 8 % vs tu media)», nunca «298».
2. **Rangos donde no hay certeza**: retorno solar «5,5 años ±1,2»; producción
   «5 240 kWh/año, ±9 %». La exactitud fingida está prohibida (ver §3).
3. **Verbos antes que sustantivaciones**: «comparamos» mejor que «realizamos
   una comparativa».
4. **Sin pasiva distante** en errores: la responsabilidad es nuestra y se dice.
5. Fechas «1 nov 2026», moneda «412 €/año», decimales con coma (es-ES),
   millares con espacio fino: «2 870 €».

## 2. Jerga: glosario gobernado

Palabras del sector que **sí usamos** (el cliente las verá en su factura) y
cómo se explican la primera vez en cada pantalla:

| Término | Microexplicación canónica (≤12 palabras) |
|---|---|
| CUPS | «El DNI de tu punto de luz. Está en la factura.» |
| Potencia (P1/P2) | «Lo que pagas fijo por cuántos aparatos a la vez.» |
| kW vs kWh | «kW = potencia contratada; kWh = lo que consumes.» |
| PVPC / indexada | «Precio que cambia cada día con el mercado.» |
| Peaje | «Lo que cobra la red por llevarte la luz.» |
| Excedente | «Energía solar que sobra y te compensan.» |
| VeriFactu | «Registro de la factura en Hacienda, automático.» |

Prohibidas sin traducir: discriminación horaria (→ «horas valle/punta»),
término de energía (→ «lo que consumes»), CIE (→ «boletín eléctrico»).

## 3. El sello honesto (decisión F23) — norma de contenido

Siempre que se muestre una cifra derivada de datos del cliente:

1. Se declara **cuántos meses son reales y cuántos estimados**
   («14 reales + 22 estimados»), junto a la cifra, no en un pie.
2. Los estimados se ven distintos (gráfica con borde claro, §C8 §1.3).
3. Nunca se escriben verbos de certeza («pagaste», «ahorraste») sobre datos
   estimados; se usa «estimamos», «saldría», «ronda».
4. Sí se permite completar el año solar estimando; **no** se permite
   ocultarlo. Este texto es contractual y lo revisa cualquier cambio de copy.

## 4. Microcopy de los 12 componentes (diccionario aprobado)

| Componente | Texto base |
|---|---|
| Botón principal landing | «Analizar gratis» (acción + coste cero) |
| Loading | «Analizando tu factura…» (progreso real, con puntos) |
| Campo requerido vacío | «Este campo lo necesitamos para [motivo].» |
| CUPS inválido | «Ese CUPS no cuadra: son ES + 16 números + 2 letras. Lo ves en tu factura.» |
| Estado vacío simulaciones | «Aún no hay simulaciones. La primera tarda 30 segundos.» + CTA |
| Estado error comparador | «El tarifario no responde. Reintentamos contigo delante: [Reintentar].» |
| Modal baja suministro | «Dar de baja no se puede deshacer desde aquí. ¿Confirmamos?» |
| Toast éxito | «Guardado.» (dos palabras bastan) |
| Toast error | empieza con qué pasó + qué hacer, nunca con «Error» a secas |
| Skeleton | texto vivo «Cargando datos…» (lector de pantalla) |
| Confirmación pedido | «Pedido en tramitación. Te escribimos en menos de 24 h laborables.» |
| Empty columna gestor | «Sin pedidos nuevos. Buen momento para llamadas pendientes.» |

## 5. Localización

- **es-ES único idioma en V1**; toda cadena pasa por este diccionario
  (nada de texto inline en código que no esté aquí — facilita futura i18n y
  revisión legal).
- Fórmula de tratamiento «tú»; en comunicaciones VeriFactu/AEAT, tono
  formal «usted» porque va a terceros.
- València/Valencia: se respeta la forma del cliente en su dirección fiscal.

**Criterio de hecho (C10)**: tablas de tono §1 y glosario §2 aprobados; el
sello honesto §3 es requisito de copy en todo PR que toque cifras; microcopy
§4 cubre los 12 componentes de C5.
