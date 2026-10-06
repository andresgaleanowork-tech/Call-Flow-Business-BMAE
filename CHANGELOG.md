## v4.2.0 «Tarifas vivas y riesgo» — 🏁 sello de la Ola 3 · Ola 3(d): G10 OMIE + F22 churn (ADR-013)

> 📞 **Qué verás**: en ☀ Hoy, el botón **⚡** abre el precio del pool OMIE — último día con dato, medias a 7/30 días, tendencia semanal y su equivalente €/kWh — traído cada día por una GitHub Action del repo (la app **jamás** habla con omie.es; lo puedes pegar a mano y entonces solo vive en tu dispositivo). Y una sección nueva **🧯 Riesgo de fuga**: clientes con el contrato a punto de acabar, demasiados días sin tocarlos o pagando muy por encima del pool — cada aviso dice el motivo en lenguaje claro y te lleva a la ficha en un toque. En la ficha: dos campos nuevos (📑 **fin de contrato** · ⚡ **€/kWh que paga hoy**), badge 🧯 en la lista y banner con los motivos al abrirla. El informe semanal suma una línea agregada «en riesgo» (sin nombres) y el CSV exporta las 2 columnas nuevas al final.
> 👔 Si eres del despacho: tarjeta **⚡ Pool OMIE** en admin.html — último precio, medias 7/30 días y días guardados (dato de mercado público, cero PII). Si pone «sin datos», la Action aún no corre en el repo.

| pieza | qué es |
|---|---|
| **G10 · pool OMIE local-first** | `datos/omie.json` escrito por GitHub Action diaria (cron 12:35 UTC, parseo tolerante de marginalpdbc, poda 400 días) · `omieGet/omieMedia/omieUlt` con el patrón catálogo (caché LS 8 h · fetch relativo tolerante a 404) · modal ⚡ desde el Hoy + entrada manual 100 % local (`omieManual`) |
| **F22 · churn (riesgo de fuga)** | `crmRiesgo` 0–100 determinista: contrato ≤30 d → 50 · ≤60 d → 40 · ≤120 d → 25 · sin tocar ≥45/21/10 d → 25/18/8 · €/kWh >2,2× pool30 → 25 (>1,8× → 8) — fichas ✔ganadas también suenan, ✘perdidas no · `crmRiesgoList` (umbral 25) alimenta KPI+sección 🧯 del Hoy · ficha: badge ≥40, banner ≥25, inputs 📑⚡ + `crmGuardar` · CSV `+fin_contrato,+precio_kwh` · informe F6 con agregado anónimo |
| **RGPD / privacidad** | la app solo fetcha GitHub (omie.es vive en CI) · el riesgo ve nombres SOLO en el dispositivo · al admin no llega nada nuevo · anexión de campos sin bump de ficha (v6 sigue: la v solo sube con migración activa — W21/W23 intactos) |
| **certificación** | ADR-013 · batería 803 ✔ (W28 16 + V4c 4) · suite 9 ficheros ✔ · golden D2 ✔ · EXE · 🏁 **OLA 3 TERMINADA** |

## v4.1.4 «Informe y salud» — Ola 3(c) · F6 + Q7 (ADR-012)

> 📞 **Qué verás**: en ☀ Hoy, un botón **📄 Informe** abre tu semana en limpio — gestiones por día (con barritas), pipeline €/mes, túnel, movimientos del embudo y presupuestos del equipo — con **🖨 imprimir/guardar PDF** y **📋 copiar texto** listo para pegar en WhatsApp o correo. Todo **generado en tu móvil, con datos agregados**: no sale del dispositivo y no lleva nombres de clientes.
> 👔 Si eres del despacho: nueva tarjeta **🩺 Salud del equipo** en admin.html — velocidad de sincronización por persona (mediana y p95 con semáforo 🟢🟠🔴), choques 409, tamaño del lote y versión de app detectada.

| pieza | qué es |
|---|---|
| **F6 · informe semanal** | `infSemana()` reusa piezas certificadas (metMia, actividad 7 días, presupuestos); modal + whitelist de impresión (mismo patrón que la propuesta F18+) |
| **Q7 · telemetría técnica** | latencia `sync_total` + KB se anotan en cada sincronización; todo **409 se contabiliza antes del reintento**; agregado anónimo por seudónimo a `datos/salud.json` (privado): p50/p95, n409, KB máx, versión |
| **RGPD** | informe: 100 % local y agregado, sin fetch/put entre abrir e imprimir · salud: solo tiempos/contadores/tamaños |

Tests: batería +W27 (12 estáticas + 4 funcionales: mates p50/p95 exactos, ring 120 girando, publicación bajo seudónimo sin PII, agregación real del informe) · suite E2E ✔ · D2 ✔.

## v4.1.3 «Piel premium» — Ola estilo (decisión del usuario: trabajar el diseño antes de Ola 3(c))

> 🎨 **Qué verás**: la app se SIENTE de producto caro sin cambiar ni un menú ni la marca (verde Iberdrola + B&M intactos): tarjetas con aire y sombras en capas, chips en píldora con el segmento activo como una gota de verde degradado, botones que se elevan un pelo al tocarlos, campos con foco anillado de marca, modales que entran suaves con velo cinematográfico y la barra de progreso en degradado.
> En **las cuatro superficies**: pymes, residencial, la puerta (index) y el panel de despacho (admin) — una sola familia visual (capa `skinPremium`, última de cascada: solo añade, jamás quita).

| toque | detalle |
|---|---|
| sombras en capas | `--sh-1/2/3` (mecha fina + halo) en tarjetas, filas y modales |
| botones con física | degradado de marca, hover +1 px + sombra verde, `:active` que respira |
| chips píldora | `999 px`, activo = gota degradada `--grad-marca` con brillo verde |
| foco de marca | anillo `0 0 0 3 px` verde al 16 % en inputs del CRM/despacho |
| accesibilidad | `prefers-reduced-motion` mata las micro-transiciones (ya heredado): diseño premium sin mareos |

Tests: batería +W26 (estáticas de tokens/paridad/marka intacta) · batería VISUAL 13 ✔ tras la capa · suite E2E ✔ · D2 ✔.

## v4.1.2 «Automatismos» — Ola 3(b) · F4 bus de eventos + reglas en datos (ADR-011)

> 📞 **Qué verás**: en la vista **☀ Hoy** aparece una tarjeta **🔔 Automatismos** cuando la app actúa por ti: al mover un producto a Ofertado te recuerda preparar la comparativa, al ganarlo programa SOLO el post-venta a 15 días (nunca pisa tu agenda), al pedir factura te señala el simulador 📄 y al aprobarse un presupuesto 💶 del equipo te avisa de ir a por la firma. Con botón 🧹 limpiar.
> ⚙ Las reglas son **datos, no código**: viven sustituibles en `datos/reglas.json` del equipo (semilla embebida si falta; lectura pública sin clave, caché 8 h) — crecer = editar un JSON, no desplegar.

| pieza | qué es |
|---|---|
| **M4 · bus interno** | `busOn`/`busEmite` síncrono con oyentes aislados (uno roto no rompe nada) — eventos v1: `ficha.movio` · `pi.movio` · `pre.movio` · `nota.nueva` · `sync.ok` · `sim.hecha` |
| **M3 · motor de reglas** | `{cuando, todo, haz}` con plantilla `${campo}` saneada; efectos `aviso` (tarjeta 🔔 + toast) / `prox` (solo si la ficha no tiene agenda viva) / `nota`; anti-bucle ≤1/24 h por regla+evento+nombre |
| **semilla (4)** | oferta→comparativa · ganado→post-venta +15 d · pide factura→📄 simulación · presupuesto aprobado→firma |

Tests: batería +W25 (12 estáticas + 5 funcionales: aislamiento de oyentes, huella 24 h, prox exacto sin pisar, tarjeta, sustitución por JSON) · paridad literal pymes≡residencial · suite E2E ✔ · D2 ✔.

## v4.1.1 «Mando y reglas» — Ola 3(a) · G2+G3+G6+S2 (ADR-010)

> 📞 **Qué verás**: una pestaña nueva **💶 Ofertas** en Clientes (tablón del equipo: borrador → revisión → aprobada, con botón «desde la última simulación»); y si eres del despacho, dos tarjetas nuevas en admin.html: **🧭 Cuadro de mando** (ranking de actividad de 7 días, pipeline €/mes y túnel del equipo) y **🛡 Auditoría** (quién hizo qué y cuándo).
> 🔒 Nada de esto sale del repo privado y las métricas son **anónimas por persona (seudónimos)**: jamás viajan nombres, teléfonos ni notas de clientes.

| pieza | qué es |
|---|---|
| **G2 · métricas al mando** | cada sincronización de fichas sube una ficha agregada por persona (`datos/metricas-equipo.json`): nº de fichas, gestiones de 7 días, pipeline estimado y túnel — cero PII |
| **G3 · cuadro de mando (admin)** | tarjeta 🧭 en `admin.html`: ranking 7 días con 🥇, pipeline €/mes del equipo y túnel agregado |
| **G6 · presupuesto colaborativo** | `datos/presupuestos.json` compartido + vista 💶 en la app: alta manual o un clic desde el simulador; merge por id gana la fase más avanzada (nunca baja), tope 100 |
| **S2 · auditoría** | `datos/auditoria.json` FIFO-500 firmada con seudónimo: borrados, purgas RGPD y sync masivas (flota) + publicar catálogo, revocar acceso y rotar clave (despacho) — tarjeta 🛡 en admin |

Tests: batería **741 ✔** (W24 13 estáticas + 8 funcionales) · suite E2E 9 ficheros ✔ · D2 regen byte a byte ✔ · paridad literal pymes≡residencial del bloque completo.

## v4.1.0 «Pipeline y arma de venta» — 2026-10-06 · 🏁 sello de la Ola 2 (ventana E4 dura)
- **Qué es 4.1.0**: **ninguna función nueva** — es el sello de que la Ola 2 está terminada y estabilizada: base de venta (v4.0.1), embudo por producto (v4.0.2), simulador de potencia con propuesta imprimible (v4.0.3) y equipo+derechos (v4.0.4), todo endurecido en la ventana E4 dura (suite entera en verde, golden D2 byte a byte, EXE regenerado, documentación al día).
- **Ola 2 — lo que tenéis ya funcionando**:
  1. 🧰 **Fontanería del pipeline**: sync de fichas cifrado por equipo, catálogo compartido con editor admin y puente IBERCRM con ibe_id hasta la ficha.
  2. 🧩 **Embudo multi-producto**: cada empresa en varios negocios a la vez (🧰 Preparando → 📤 Ofertado → 🤝 Negociando → ✔ Ganado · ✘ Perdido), con resumen anónimo por producto×fase para el jefe.
  3. 📄 **Arma de venta**: simulador de potencia 2.0TD/3.0TD — pegas la factura, sale la propuesta con números e imprimible (sello RGPD), y con 💾 se anota sola en ficha y pasa el producto a Ofertado.
  4. ⇄🛡 **Equipo sin brújula suelta**: sync automática con la clave, borrados con lápida, ficha privada 🔒, RGPD operativo (borrar persona 1-clic, exportar ficha, retención 12 meses en «Hoy»).
- **Compatibilidad garantizada**: fichas viejas migran solas (vacuna v6), CSV viejo sigue leyéndose, resumen al admin sigue 100 % anónimo (RGPD por diseño, medido en tests).
- 🧪 certificado: batería **716** ✔ (+4 V4b del sello: versión/sw/changelog/plan) · suite completa (9 ficheros) ✔ · golden D2 ✔.
- 🔃 sw `cfb-v373`.

## v4.0.4 «Equipo y derechos» — 2026-10-06 · Ola 2(d): F5 privado⇄equipo + F7 RGPD (ADR-009, decisiones confirmadas por el usuario)
- **⇄ Sync automática**: si tienes la clave de datos del equipo instalada, tus fichas sincronizan; si no, todo queda en este móvil. **Cero opciones ni flags** — la pertenencia al equipo ES el interruptor (chip «⇄ Equipo: ON/OFF» en la barra de Clientes; clic = sincronizar ahora).
- **Borrados que dejan LÁPIDA** (`datos/crm-lapidas.json`, repo privado): borras una ficha y se borra en todo el equipo al sincronizar (poda >180 días, cap 300). Una privada jamás la borra la lápida de otro.
- **🔒 Ficha privada** (vacuna CRM v6, idempotente — migra desde v5 conservándolo todo): botón 🔒/⇄ en la ficha — así no sale de este dispositivo aunque la sync esté ON; el merge la respeta y nunca una remota la pisa. Icono 🔒 en la lista de Clientes.
- **ℹ RGPD in-app** (chip en la barra): qué datos hay, dónde viven (dispositivo; cifrados en GitHub si hay clave), qué sale (al admin solo números anónimos), derechos y retención.
- **🧹 Borrado de persona 1-clic** (derecho de supresión): busca por nombre o teléfono en fichas (incl. contactos) y potenciales, muestra el rastro y lo borra TODO de una vez — con su lápida para el equipo si hay clave.
- **📤 Exportar ficha JSON** (derecho de acceso/portabilidad): botón «📤 JSON» en cada ficha con marca de base jurídica.
- **🧹 Retención sugerida en «Hoy»**: lo que lleva >12 meses sin actividad (fichas y potenciales) aparece propuesto con su 🧹 — purgar deja de ser oscuridad y se vuelve un gesto diario.
- 🧪 **716** ✔ batería (+22 W23: lápidas offline con hook, privada vs remota, push filtrado, buscar/borrar persona, retención, export JSON) · suite completa (9 ficheros) ✔.
- 🔃 sw `cfb-v372`.

## v4.0.3 «Oferta de potencia» — 2026-10-06 · Ola 2(c): F18+ simulador de potencia + propuesta imprimible (ADR-008)
- **📄 Simulador de potencia (2.0TD / 3.0TD)**: pega el texto de una factura («Potencia contratada P1: 65,2 kW…») o introduce los datos a mano — parser 100 % local, tolerante, que **nunca manda nada fuera del dispositivo** (verificado en tests: 0 fetch).
- **Regla F18-1 trazable**: potencia óptima = `ceil(demanda máx. × (1+margen) × 100)/100` — margen (10 % por defecto) y precios €/kW·año por periodo **editables y visibles** en la propia vista (valores orientativos de inicio). 📈 SUBIR si la demanda supera lo contratado (evitas excesos), 📉 BAJAR si sobra, «sin cambio (aportar maximétero)» si falta el dato — nunca aconseja bajar sin demanda registrada.
- **Ahorro en euros, al momento**: Σ(contratada−óptima)×precio por periodo → €/año estimado, listo para decirlo en la llamada.
- **🖨 Propuesta imprimible (guardar como PDF)**: un clic genera el documento con los números, el desglose por periodo y el sello «esta factura no salió de este móvil en ningún momento» — offline-first (patrón de impresión ya usado por el certificado, sin librerías externas).
- **💾 Puente al embudo**: «Anotar en ficha» deja la nota con el resultado **y mueve el producto tarifa20/tarifa30 a 📤 Ofertado** (lo añade si no estaba; nunca baja una fase más avanzada) + actividad numérica anónima. La pistola carga sola.
- 🧪 **694** ✔ batería (+21 W22: parseo 2.0/3.0TD, regla exacta con epsilon de coma flotante, propuesta con sello RGPD, puente sin regresión de fase, defensive sin empresa) · suite completa (9 ficheros) ✔.
- 🔃 sw `cfb-v371`.

## v4.0.2 «Embudo por producto» — 2026-10-05 · Ola 2(b): F2 multi-producto (ADR-007)
- **F2 · vacuna v5**: cada empresa del CRM puede estar ahora en **varios negocios a la vez** — su ficha gana el embudo 🧩 por producto del catálogo: hasta 8 piezas `{producto, fase, nota}` con 5 fases cortas (🧰 Preparando → 📤 Ofertado → 🤝 Negociando → ✔ Ganado · ✘ Perdido). «Gané la tarifa pero el solar sigue en negociación» ya se representa sin perder contexto.
- **Editor 360º**: bloque «🧩 Productos» tras tags/contactos — añadir del catálogo activo (caché 8 h o semilla), cambiar fase en el propio chip, nota corta del negocio, ✕ para quitar. Todo estilo 1-clic como tags/contactos.
- **Embudo para el mando**: el resumen anónimo al admin agrega ahora **recuentos por producto×fase** (`pc`) — el jefe ve el pipeline por línea ⚡☀🔧 SIN que salga un solo nombre del dispositivo.
- **Filtro 🧩 por producto** en Clientes (solo negocios vivos), el **buscador global** encaja por producto/fase, y el **CSV** añade última columna `productos` (id:fase;id:fase) — formato viejo leíble igual.
- **Coherente con la caja fuerte**: `pis` viaja cifrado en el sync G4 (S1 cubierto por round-trip con producto), el resumen sigue 100 % anónimo por diseño.
- 🧪 **673** ✔ batería (+22 W21: vacuna v4→v5, saneado, CRUD, resumen anónimo, S1 con pis, filtro, opciones del embudo) · suite completa (9 ficheros) ✔.
- 🔃 sw `cfb-v370`.

## v4.0.1 «Base de venta» — 2026-10-05 · Ola 2(a): G4 + G5 + G7, la fontanería del pipeline (ADR-006)
- **G4 · sync v2 de fichas por GitHub (instalado, apagado por diseño)**: las fichas del CRM ya saben viajar por `datos/crm-fichas.json` (repo privado) con **pull→merge→push** y reintento de conflictos — cada ficha viaja con **tel/notas/valor/datos seguros cifrados** por equipo (S1 se enciende: AES-GCM-256 con la clave de datos; en claro solo lo de listar/cruzar). **Hoy está apagado** (`cfb_flag_cli_sync`): F5 (Ola 2d) decide la experiencia privado⇄equipo — la infraestructura está probada con 6 tests funcionales offline deterministas.
- **G5 · catálogo compartido del nicho**: nuevos productos/servicios del equipo viven en `datos/catalogo.json` (web pública, sin datos personales). La app lo lee sola (caché 8 h, **semilla embebida** si falta), y el **admin lo edita desde su panel** (tarjeta «📦 Catálogo»): añadir por id, editar nombre/área/tag, activar/desactivar y 💾 Publicar con la misma clave de ambos repos. 8 productos de inicio (2.0TD·3.0TD·gas·solar·batería·manto·ingeniería·comer).
- **G7 · extractos IBERCRM → banco**: botón «🟥 IBERCRM» en Potenciales — pega el extracto tal cual (separador automático tab/;/,; cabeceras españolas tolerantes: nombre · teléfono · ciudad · sector · **ibe_id** · factura), dedupe por teléfono, altas con marca de origen `IBERCRM(patrimonio)`. El `ibe_id` viaja también al **convertir en ficha** — el patrimonio queda cruzable desde el minuto uno, listo para el simulador F18+ (Ola 2c).
- **Correcciones duraderas**: la clave de datos se lee igual que la guarda el admin (LSg ya parsea — bug real cazado por W20); jsdom se reinstala con un script idempotente `tools/setup-jsdom.sh` (el entorno le mordía paquetes entre sesiones); quedan eliminadas las frases «modo local» del código (política de conexión obligatoria coherente).
- 🧪 **651** ✔ batería (+26 W20: merge/cripta round-trip/push-pull offline con hook/parser ES/cadena IBERCRM→ficha/catálogo fallback) · suite completa (9 ficheros) ✔.
- 🔃 sw `cfb-v369`.

## v4.0.0 «CRM base y plataforma» — 2026-10-05 · 🏁 sello de la Ola 1 (ventana E4 dura)
- **Qué es 4.0.0**: **ninguna función nueva** — es el sello de que la Ola 1 está terminada y estabilizada: usuarios con accesos personales (v3.10), ficha empresarial (v3.11) y la vista «Hoy» (v3.12), todo endurecido en la ventana E4 dura (suite entera en verde, golden D2 byte a byte, EXE regenerado, documentación al día).
- **Ola 1 — lo que tenéis ya funcionando**:
  1. 🔑 **Cada persona su contraseña personal** (multi-entrada cifrada, enlace 1-clic `#ap=`, revocar/reset por persona, auto-cambio desde la app) — la clave real nunca la ve nadie.
  2. 🏢 **Ficha de empresa 360º** (contactos, tags, datos fiscales, valor €, origen, ibe_id) con buscador global y vacuna migratoria v→v4 — todo opcional, nada se te escapa.
  3. ☀ **Vista «Hoy»**: agenda del día (vencidas · toca hoy · potenciales) con acción directa — abriendo la app se ve qué toca.
- **Compatibilidad garantizada**: fichas viejas migran solas, CSV viejo sigue leyéndose, resumen al admin sigue 100 % anónimo (RGPD por diseño, medido en tests).
- 🧪 certificado: batería 625 ✔ (+4 V4: versión/sw/changelog/plan del sello) · suite completa (9 ficheros) ✔ · golden D2 ✔.
- 🔃 sw `cfb-v368` · EXE regenerado.
- 🚀 **Ola 2 «Pipeline y arma de venta» (v4.1)** arranca con G4/G5/G7 → F2 multi-producto → F18+ simulador de factura.

## v3.12.0 «Hoy» — 2026-10-05 · la agenda del día a un chip (F3)
- **F3 · ☀ Hoy (ADR-005)**: nueva vista «Hoy» en la pestaña 👥 Clientes con la jornada entera de un vistazo — **⚠ Vencidas** (próx. acciones de fichas abiertas con fecha pasada, marcadas en rojo), **🕐 Toca hoy** (ordenadas por hora) y **🔥 Potenciales a reintentar** (reintento del banco compartido) — más el marcador del día: 📞 llamadas hoy · ⚠ vencidas · 🕐 toca hoy · 🔥 potenciales.
- Cada fila abre la ficha en Clientes **limpiando filtros** (`crmIrFicha`) y lleva su botón «📞 preparar llamada» (precarga guion en el punto justo). «Día limpio 🌞» con consejo natural si no hay nada.
- **Hueco de UX cerrado**: se descubrió en E0 que **no había forma de navegar de Clientes → Potenciales** — ahora una **barra de segmentos unificada** («☀ Hoy / 👥 Clientes / 📋 Potenciales») corona las tres vistas y funciona en ambos sentidos. El segmento por defecto sigue siendo Clientes (no rompemos hábitos).
- Sin esquema ni sync nuevos: vista pura sobre fichas v4 y banco (`proTocaHoy()`); el resumen al admin sigue 100 % anónimo.
- **Bug cazado por test-first (W19-9)**: las próximas acciones con fecha futura colaban en «toca hoy» por un ternario tibio — corregido a ramales explícitos y cubierto.
- 🧪 **621** ✔ batería (+14 W19: grupos/recuentos, orden por hora, día limpio, navegación, paridad pymes≡residencial) · suite completa (9 ficheros) ✔ · sintaxis CFB verificada tras escapes.
- 🔃 sw `cfb-v367`.

## v3.11.0 «Base empresarial» — 2026-10-05 · la ficha cliente pasa a ficha de empresa (F1)
- **F1 · ficha empresarial v4 (ADR-004)**: el CRM deja de ser «nombre + teléfono + 4 asuntos» — cada ficha ahora puede llevar **datos postales y fiscales** (dirección, CP, email, web), **valor estimado del negocio (€)**, **origen** (⚡ Iberdrola · IBERCRM · IBERU · maestro · manual · referido), **ibe_id** (la llave para cruzar con los extractos IBERCRM de Ola 2) y hasta **8 contactos** (nombre/cargo/teléfono) + **12 tags** por empresa. TODO opcional: la práctica diaria sigue igual de rápida y quien no rellene nada no nota cambios.
- **Editor 360º** en la propia ficha desplegable: grid de empresa, chips de tags con ＋/✕, listado de contactos con alta/baja en clics, y el bloque Estado/Próx. acción intacto donde estaba.
- **Buscador global**: antes solo encontraba por nombre/teléfono/sector/ciudad — ahora encuentra también por dirección, CP, email, web, origen, **ibe_id**, tags y contactos (ej.: buscas «ES0021XX000777AAA» o «reforma» y salta la empresa).
- **Vacuna v4 (ADR-004)**: `crmNorm` migra cualquier ficha vieja v1/v3 → v4 **conservando notas y estado**, determinista e idempotente (round-trip JSON idéntico) — probado funcionalmente.
- **Importador/CSV**: el lead que llega desde Prospección trae su `origen` a la ficha; la exportación CSV añade 9 columnas F1 **al final** (el formato viejo se sigue leyendo igual).
- **Resumen al admin sigue 100 % anónimo** (estados + pipeline €): ni ibe_id, ni valor, ni email ni tags viajan fuera — verificado estática y funcionalmente (RGPD por diseño).
- **S1 encendido modular**: instalada la API `cfCifraParaSync`/`cfDescifraDeSync` del ADR-003 (hoy identidad con TODO F2; se activa cuando el sync de burbuja suba campos sensibles — sin volver a abrir la caja).
- **Lección de arquitectura aplicada**: el parche se escribió en la **fuente `tools/factory`** y `apps/web` se regeneró (golden D2 byte a byte) — nada de edits sueltos sobre los HTML generados.
- 🧪 **607** ✔ batería (+32 W18: vacuna, round-trip, saneo de valor/ibe_id/tags, dedupe, buscador, anonimato del resumen, paridad pymes≡residencial) · suite completa (9 ficheros: e2e clave-equipo 54, maestro-admin 33, act 10, admin 7, residencial 71, visual 13, ola4, árbol-i18n) ✔.
- 🔃 sw `cfb-v366` · EXE regenerado (SHA `5eae89a8…`).

## v3.10.0 «Usuarios y accesos» — 2026-10-05 · cada persona su contraseña, el admin gestiona por persona
- **F13 · accesos personales (ADR-002)**: `clave-equipo.json` pasa a **multi-entrada** (v2): cada trabajador/a tiene SU entrada cifrada con SU **contraseña personal** (PBKDF2-SHA256 ×250.000 + AES-GCM-256). La tarjeta de entrada pide **tu ID + tu contraseña**; nadie ve la clave real nunca.
- **Admin → tarjeta «👥 Accesos personales»**: por cada persona del «Equipo autorizado» ves si tiene acceso, le **creas** el acceso (la contraseña se sugiere sola tipo «sierra-brava-42», editable), lo **publicas con un clic**, le copias su **enlace personal** y le puedes **revocar** el acceso o **resetear** su contraseña. Todo con merge del bloque vigente (nunca pisa accesos ajenos).
- **📨 Enlace personal 1 clic** `index.html#ap=<slug>:<contraseña>`: quien lo abre entra directo; la contraseña viaja en el `#`fragmento (nunca toca servidores) y la app la borra de la barra. El legado `#eq=` (contraseña única v3.9) sigue valiendo mientras no migres a accesos personales.
- **🔑 «Mi acceso» (auto-servicio)**: cada persona cambia SU contraseña desde el menú de la app — la app recifra **solo su entrada** y la republica (commit «auto-cambio de contraseña»), sin tocar la de nadie más.
- **Baja de alguien**: el admin revoca su entrada (y lo quita del «Equipo autorizado») → su dispositivo ya no puede renovar la clave tras la próxima rotación; si urge, rotación completa con «🛡 Publicar/rotar» (procedimiento actualizado en ROTACION-CLAVE.md).
- **S1 infra (ADR-003 · doble clave datos/acceso)**: el payload cifrado incluye una **clave de datos** separada del token — los módulos nuevos cifrarán sus campos sensibles con ella de forma incremental. La fija automáticamente el dispositivo del admin.
- **Seguridad conservada y medida**: contraseña persistida **solo tras validación 200** de la nube (E6 v3.10), revocada → renovación silenciosa caduca y limpia, sin blob → tarjeta manual intacta.
- 🧪 **575** ✔ batería (+15 W17) · e2e clave-equipo **54** ✔ (+25: publicación por persona, slug correcto, payload cifrado auditado nodo, tarjeta 2 campos, pass mala, ID sin acceso, enlace personal, revocación) · dos bugs cazados por test-first (firma de sal en entradas v2 · pérdida de la contraseña editada al repintar).
- 🔃 sw `cfb-v365` · docs: `docs/adrs/ADR-001/002/003` (E0 del sistema de entrega).


- **Fricción cero para el equipo**: el admin genera desde su panel un **enlace de acceso** (`index.html#eq=<contraseña>`) y lo pasa por WhatsApp/correo interno. Quien lo abre **entra directo**: la app descifra la clave sola y solo queda poner el ID. Sin teclear contraseñas.
- **La contraseña viaja en el `#`fragmento**: nunca la envía el navegador a ningún servidor ni queda en logs/analíticas; y la app la **borra de la barra** tras usarla (`replaceState`).
- **Caducidad natural**: si el admin cambia la contraseña del equipo, los enlaces viejos dejan de servir → tarjeta con aviso «pide uno nuevo» (sin exponer nada). Con clave ya guardada, el enlace solo se limpia y sigue el arranque normal.
- Admin: botones «📋 Crear y copiar el enlace» / «👁 ver» en la tarjeta 🔑 (usa la contraseña del momento o la guardada).
- 🧪 **560** ✔ batería (+4) · e2e clave-equipo **29** ✔ (+7: entra sin teclear, hash limpio, caducado sin fuga, admin genera) · resto de suite ✔.
- 🔃 sw `cfb-v364` · EXE regenerado.

## v3.8.0 «Clave de equipo cifrada» — 2026-10-02 · el comercial solo usa su ID + contraseña del equipo
- **Modelo nuevo de claves (sustituye al reparto manual de v3.7)**: la clave real vive **cifrada en la web pública** (`clave-equipo.json` · AES-GCM-256 + PBKDF2 SHA-256 ×250.000, cifrado hecho en el navegador del admin). Cada comercial entra **una sola vez con su ID + la contraseña del equipo**; la app descifra y guarda la clave en local.
- **Panel admin → «🛡 Publicar / rotar la clave»**: pega la PAT (validada contra **ambos** repos antes de subir), elige la contraseña del equipo y publica. Rotación en 2 min sin tocar a nadie.
- **Rotación silenciosa en los dispositivos**: si el admin rota y republica, el móvil sin clave válida se autorrepara al entrar usando su contraseña guardada (`cfb_eq_pass`) — sin pedir nada a nadie.
- **Fallback intacto**: enlace «tengo la clave larga» siempre disponible (admin, PC de sobremesa, o si el cifrado nativo no está disponible en el navegador).
- Tarjeta 🔑 de dos modos en el gate: «contraseña del equipo» (si hay blob publicado) ⇄ «clave larga», con ida y vuelta.
- Procedimiento completo y riesgos/mitigaciones: `docs/ROTACION-CLAVE.md` (reescrito).
- 🧪 **556** ✔ batería (+8 de v3.8) · nuevo e2e `tests/e2e-clave-equipo.js` **22** ✔ (admin publica → móvil entra con contraseña → contraseña mala rechazada → rotación silenciosa → fallback) · 33+71+10+7 ✔ · i18n ✔ · D2 golden ✔.
- 🔃 sw `cfb-v363` · EXE regenerado.

## v3.7.0 «Clave fuera + Decisión» — 2026-10-02 · Seguridad y Fase 3 del plan 33k
- **🔑 Clave desacoplada (punto 3)**: la app ya **no contiene** ninguna PAT de GitHub. Cada dispositivo pide la clave al primer uso (tarjeta «🔑 Clave del equipo»), la valida en vivo contra el repo y solo entonces la guarda en local. Vacuna v2: al cargar se purga automáticamente cualquier token heredado de builds ≤3.6. Si el token caduca o se revoca, la app lo detecta (401/403) y deja pegar una nueva. **El admin debe revocar la PAT vieja y repartir la nueva** → procedimiento en `docs/ROTACION-CLAVE.md`.
- **🎯 Decisión de tandas (Fase 3)** en la tarjeta Maestro del admin: join real `banco × maestro` —
  - **Ritmo**: fichas dedicadas en los últimos 7 días, puñados/semana y **previsión de semanas hasta agotar el maestro**.
  - **Tabla por puñado** (top 15): grupo, quién lo trabaja, reclamados, **CE%** (llamadas con resultado), **POS** (pide factura · cita · ya es cliente), **CONV** (altas reales al CRM con %), descartados y último toque. Las altas manuales no ensucian las métricas.
  - **Sugerencia de siguiente puñado**: con ≥20 trabajados, el libre del grupo con mejor conversión; si no, el mayor puñado libre.
  - **⬇ CSV conversión por puñado** y **🗄 Volcado maestro → CSV** (secuencial con progreso, tolera 404; solo admin).
- Importador `tools/importa-maestro.py`: orden de token v3.7 (`$CFB_TOKEN` → `tools/.cfb_token` → legacy).
- 🧪 548 ✔ batería · e2e maestro-admin 22→**33** (G1–G11 de decisión) · 71+10+7 ✔ · i18n ✔ · ola4 ✔.
- 🔃 sw `cfb-v362` · APK vc43 · EXE regenerado — las assets empaquetadas ya NO llevan clave.

## v3.7.0b (distribución) — 2026-10-02 · APK retirado temporalmente
- Se elimina `apps/android/` (proyecto WebView, APK, keystore demo) y el job de CI del APK: el canal Android queda en **PWA** (`instalar.html`). Guía completa de reconstrucción futura en `docs/android-historico.md` (incluye SHAs finales y receta de build sin Gradle). **Sin cambios en la app** (version.json sigue en 3.7.0; el EXE y la web actuales no requieren rebuild).

## v3.6.1 · 02-10-2026 · «Maestro nota» — Excel real dentro
- El DATASET IBERCRM (33.161 empresas de Valencia) ya está en el repo como **133 puñados**: 📥 Reponer ya tiene datos reales.
- Al reclamar un puñado, cada tarjeta llega al banco con **dirección + email + web** en su nota.
- El importador se acopla a tu Excel tal cual (Latin-1, cabecera en inglés, sin sector → por ciudad).

## v3.6.0 · 01-10-2026 · «Maestro admin» — estado del maestro en el panel
- El panel admin muestra la tarjeta 🗂️ **Maestro 33k**: totales libres/reclamados, barras por provincia, puñados con movimiento, quién lleva cada puñado, exclusión por motivo, informe del último importe y ⬇ CSV — todo **sin teléfonos** (RGPD-minimización).
- Debajo del capó: el motor (banco+maestro+exclusión+sync) vive ahora en **un único módulo** compartido por los dos guiones; un guardián lo vigila en los tests.

## v3.5.0 · 01-10-2026 · «Maestro» — reclamar puñados + exclusion compartida
- **📥 Reponer**: sirvete un puñado de 250 del maestro 33k con un toque. Gana el primero que lo reclama (sha + retry 409), nunca se pasan 500 activos y salta duplicados y exclusión.
- **Exclusion compartida**: «no volver a llamar» del equipo, sincronizada como el banco. Quitar: window.excQuitar.
- **Descarte dual**: «NO VOLVER A LLAMAR MÁS?» al descartar un potencial — Aceptar = lista de exclusion + fichero; Cancelar = solo descarte.
- **Importador**: `tools/importa-maestro.py` para trocear el Excel y publicarlo al repo (dry-run por defecto, `--subir` para publicar).

## v1.5.1 · 15-09-2026 · Auditoría integral (A–J)
- 🔴 **SUF determinista**: pymes/residencial ya no mezclan estadísticas (antes el olor a clave `bm_tut_omitido_res` hacía que abrir un guion contaminara el otro).
- 🔴 **Perfil global único**: sync y puerta hablan la misma clave `cfb_perfil` (residencial dejaba de sincronizar).
- 🔴 **Sello de fecha local en cada cambio**: desaparece la ventana de pérdida al editar offline y cerrar antes del envío.
- 🟡 Eco de restauración eliminado; números del hub se pintan al abrir; versión del snapshot viva; sw **network-first** con `admin.html` cacheada; pastilla «identifícate desde el menú» en guiones abiertos directos; botón del hub manda al menú (sin perfiles-chancla); copy pulsa/pega.
- 🧪 110/110 + 58/58 verdes con test funcional del pintado.

## v1.5 · 15-09-2026 · Registro de llamadas + Dashboard del equipo
- 📞 **«Registrar llamada +1»** en «Mi semana»: se pulsa al colgar cada llamada real (cuenta hoy/semana visible en el propio hub).
- 🎭 **Automático**: cada recorrido al cierre y cada roleplay suman al día (fecha LOCAL, no UTC).
- ☁ Se guarda en `bm_dias` dentro de la burbuja de cada comercial (sube con la sync normal).
- 📈 **Panel admin → «Llamadas del equipo»**: tabla por comercial con 📞 hoy / semana (lunes→hoy) / mes, actividad 🎭 y «visto hace…». 

## v1.4 · 15-09-2026 · Empleado = solo ID · Panel admin · registro por email
- 🔑 **Clave embebida** (troceada anti-revocación, vacuna auto por versión): el empleado **solo escribe su ID**. Nada que pegar, nada que repartir.
- 🛠 **`admin.html`**: panel del responsable — ver equipo, **alta/quitar IDs**, estado de la clave (botón comprobar), actividad de `datos/`.
- ✉️ **Registro por email**: en el login, «Solicita tu alta» abre correo prellenado a canalpymes@bmae.es (asunto «Alta Call Flow Business · ID …», cuerpo con Nombre/ID). Soporte y sugerencias en el pie → mismo correo.
- 🧪 Tests: reconstrucción de clave, pantalla única-ID, alta/razzia de tokens-literal (ningún HTML lleva la clave entera), panel admin estático+guard.

## v1.3 · 15-09-2026 · Puerta con ID de empleado
- 🪪 **Login en el menú**: clave del equipo → tu **ID Iberdrola** → (1ª vez) tu nombre → menú (PYMES / Residencial / Tutorial). Sin contraseña ni correo.
- 🔒 **Lista cerrada**: solo entran IDs autorizados, guardados en `equipo.json` del repo privado de datos.
- 👑 **Primer arranque admin**: la primera persona con clave crea la lista y queda admin; admin puede **«👥 Autorizar ID»** desde su propia app.
- 🌫 **Modo local** explícito para quien entre sin clave/red (no sincroniza; marcado en el saludo y en «Mi semana»).
- 🔁 «Cambiar de usuario» para PC compartido; el perfil persiste por dispositivo.

# Registro de cambios · Call Flow Business


## v1.2.1 · 15-09-2026 (hotfix de sync, mismo día)
- 🐛 **`url`→`u`**: el push moría antes de tocar la red (el guardado automático no llegaba a GitHub).
- 🐛 **Bloque ☁ invisible**: `insertBefore` apuntaba a una `.cfb-nota` no hija directa → el bloque de sync nunca se pintaba en «Mi semana».
- 🧹 Reintentos de estado limitados (antes poll de 200 ms infinito con el hub cerrado).
- 🧪 Batería: camino feliz con clave cubierto (GET+PUT a Contents API) + regresión estática de ambos bugs. **69/69 + 57/57, 0 errores JS.**
- ✅ Sello E2E real contra GitHub: Dispositivo A sube → Dispositivo B (vacío) restaura byte a byte.

## v1.2 — 14-09-2026
- ☁ Sync GitHub (auto-guardado): cada comercial tiene burbuja propia y todo lo local (`bm_*`)
  se guarda solo en el repo privado de datos (Contents API) — con silencio offline y sin pasos manuales.
- 👤 Perfil local: «¿Quién eres?» una vez por dispositivo; imprescindible en PCs compartidos.
- 🔁 Restauración automática entre dispositivos (la nube gana si es más reciente).
- ⚠ Requiere activación (una vez): repo privado `CFB-datos-equipo` + clave fine-grained — ver `_documentos/SYNC-GITHUB-SETUP.md`.

## v1.1 — 14-09-2026
- 🔔 Notificador de versión discreto (solo consulta si hay red; aviso si hay publicación nueva).
- 🖨️ Ficha de llamada imprimible (PDF vía imprimir) desde el hub 📊.
- ✍️ Botón «Proponer mejora»: ficha pre-rellenada con el nodo actual (portapapeles + correo).
- 📊 Hub «Mi semana»: hora de sesiones, recorrido, objeciones, insignias, QR entre dispositivos, export voluntario.
- 📈 Estadísticas locales anónimas (recorrido por nodos / objeciones) con reinicio manual.
- 💈 Accesibilidad: alto contraste y letra grande persistentes; versión print-friendly de la ficha.
- 🏅 Insignias discretas por hitos de práctica (tutorial, quiz, roleplay, árbol).
- 📲 PWA instalable en el menú (manifest + service worker: la suite carga offline tras la primera visita).
- 🏷️ Badge de versión visible en el pie de todas las pantallas.

## v1.0 — 11-09-2026
- Arquitectura multi-página (menú / tutorial / PYMES / Residencial) + guion Residencial estrenado.
- Rebrand *Call Flow Business* y repo `Call-Flow-Business-BMAE`. Ejecutable Windows y APK Android.

## v1.5.2 — 15-09-2026 · Auditoría NIVEL-2 (L2)
- **L2-1 🛡️ Importación QR/código endurecida**: un código ajeno ya no puede inyectar HTML/JS persistente (antes podía contaminar `bm_stats` y «ejecutarse» al pintar el hub/ficha). Saneo recursivo de claves y valores + tipos y tope de tamaño.
- **L2-2 🛡️ Escapes de salida**: pills de recorrido, objeciones, fecha «desde» y ficha imprimible escapan datos dinámicos (defensa en profundidad).
- **L2-3 El pincel de sync resetea sus reintentos** al tener éxito (ya no se queda mudo tras 60 intentos tempranos).
- **L2-4 Accesibilidad fina** del diálogo «Mi semana»: `aria-modal` + el foco entra al abrir y vuelve a donde estaba al cerrar.
- Baterías: **119/119 QA + 58/58 residencial · 0 errores JS**.

## v1.5.3 — 15-09-2026 · Auditoría NIVEL-3 (UX/flujos con datos reales)
- **R3-X El progreso entre dispositivos YA viaja entero**: el QR/código ahora exporta la personalización real del guion (`guion_vars`) y los KPIs apuntados — antes se exportaba una maleta `bm_vars` siempre vacía y las variables se quedaban atrás.
- **R3-A Doble medidor armonizado**: la pestaña KPIs precarga «Llamadas» con lo que se registró hoy en «Mi semana» (un solo número, ajustable).
- **R3-B «Proponer mejora» abre el correo oficial** canalpymes@bmae.es con la ficha ya rellena (además de copiarla); se acabó el «pégala en WhatsApp a la encargada».
- **R3-C Las sumas por fecha ignoran claves basura** (importaciones con entradas no-fecha ya no hinchan día/semana/mes).
- **R3-E Tabla admin «aún sin datos» con colspan correcto.**
- Baterías: **128/128 QA + 58/58 residencial · 0 errores JS**.

## v2.0.0 — 15-09-2026 · D2 Fuente editorial única
- **Los textos ya no viven dentro del código**: el contenido de ambos guiones (árbol NODES, 15 objeciones, roleplay, quiz, glosario, checklist, FAQ, KPIs…) se extrae a `_dev/editorial/contenido/<guion>/<BLOQUE>.js` (20 bloques por guion editables como texto).
- Los HTML ahora **se generan** (`node _dev/editorial/build.js` o `npm run build:editorial`) desde `plantillas/` + `contenido/`.
- **Hash dorado respaldado por la batería**: regeneración byte-idéntica a la v1.5.3; nueva comprobación «D2» en la QA (129/129 + 58/58) que caza cualquier HTML editado a mano.
- A las correcciones semanales: se toca `contenido/…`, se hace build, tests, build de binarios y push. Nunca más editar guiones a mano.

## v2.0.1 — 15-09-2026 · D3 QR-cámara
- **«Entre dispositivos» sube de nivel**: nuevo botón 📷 **Escanear QR con la cámara** — apuntas al QR que el otro dispositivo muestra y tu progreso (personalización, KPIs, estadísticas, insignias) se traslada solo. Sin red, sin cuentas (jsQR 1.4.0 embebido, Apache-2.0).
- Android: el WebView pide la cámara **solo al pulsar 📷** (permiso CAMERA + concesión por demanda en `MainActivity`); en PC usa la webcam del navegador. Si el visor no da cámara, el cuadro de texto sigue funcionando igual.
- Importador unificado texto/cámara (`cfbQRImportarTexto`), saneo idéntico del QR v3.
- Baterías: **136/136 + 58/58 · 0 errores JS** (round-trip cámara verificado, manifest/Android auditados).

## v2.1.0 — 15-09-2026 · «Mando»: el panel es un instrumento
- **📊 Tendencia 28 días por comercial**: sparkline SVG inline (sin librerías) con llamadas/día + tooltip (total y hoy).
- **▲/▼ Delta vs semana anterior** en la columna Semana (verde/rojo; «=» si está plano).
- **⬇ CSV (Excel)**: un clic descarga la tabla completa — separador `;`, BOM UTF-8, celdas escapadas.
- **⚠ Alertas de inactividad**: fila salmón + «sin 📞 desde…» para quien lleve ≥3 días laborables sin registrar (o no haya registrado nunca).
- Baterías: **145/145 + 58/58 · 0 errores JS** (funcionales: sparkline, delta, RGB salmón, CSV con BOM).

## v2.2.0 — 15-09-2026 · «Memoria»: mini-CRM de bolsillo + racha
- **📇 Mis clientes (en «Mi semana»)**: notas por cliente (motivo, acuerdos, pendiente) con historial plegable, 📋 copiar historial y 🗑 borrado por nota / ficha / registro completo.
- **🛡 RGPD por diseño** (memo en `_documentos/RGPD-MINI.md`): prefijo `cli_` ⇒ **NUNCA** sale del dispositivo (ni sync, ni QR, ni panel); purga automática +180 días con aviso; tapón 80 fichas / 20 notas (minimización).
- **🔥 Racha de práctica** en Actividad + 3 insignias nuevas (5/10/20 días seguidos). Si hoy no has practicado aún, la racha desde ayer sigue viva.
- Baterías: **155/155 + 58/58 · 0 errores JS** (funcionales: racha+badge, saneo nombre/nota, tapón, borrado completo).

## v2.3.0 — 15-09-2026 · «Fábrica»: CI + auto-aviso + registro de errores
- **🏭 GitHub Actions CI** (`.github/workflows/build.yml`): cada push a main corre la batería (167+58) → compila EXE + APK → sube **Artifacts** con SHA-256; si configuras `secrets.CFB_CERT_B64/CFB_CERT_PASS` el EXE sale **firmado con el certificado real** automáticamente (docs: `_documentos/v2.3-FABRICA.md`).
- **✨ Auto-aviso para EXE/APK**: configurando una línea (`window.CFB_UPDATE_URL` en plantillas) los binarios avisan de nuevas versiones apuntando a nuestra página; en la APK los enlaces web/mailto/tel ya abren en el navegador/correo del sistema (`CfbClient` nombrado, bug d8 esquivado otra vez).
- **🧾 Registro de errores del dispositivo** (`bm_errores`, tope 20): captura errores JS y promesas; 📋 copiar / 🧼 vaciar en Utilidades; la ficha de soporte a canalpymes@bmae.es lo lleva pegado.
- Baterías: **167/167 + 58/58 · 0 errores JS**.

## v2.3.1 — 16-09-2026 · «Escoba»: caza de bugs (5 corregidos + 1 en la propia batería)
Jornada de auditoría sobre v2.3.0 (informe completo: `_documentos/CAZA-BUGS-2026-09-16.md`, trampas reproducibles en `_dev/caza/`):
- 🔴 **CAZA#1 · CI**: `${{ env.ANDROID_SDK_ROOT }}` siempre vacío → el step APK habría fallado en el primer push. Ahora resuelve `${ANDROID_SDK_ROOT:-$ANDROID_HOME}` e instala build-tools 34.0.0 si falta.
- 🔴 **CAZA#2 · racha tras medianoche**: `bumpVid` anotaba el día en **UTC** y `racha()` lo lee en hora local → entre las 00:00–01:59 (CEST) la sesión caía «en ayer» y la racha/insignias mentían. Nuevo `hoyLocal()` para días, `desde`, `creado` e insignias.
- 🟡 **CAZA#3 · CRM con apóstrofo**: `encodeURIComponent` no codifica `'` → los 3 botones de una ficha «L'Olivé» morían (SyntaxError). `%27` explícito.
- 🟡 **CAZA#4 · ✕ del aviso ✨ sin memoria**: guardaba la versión en crudo pero la leía con `JSON.parse` → reaparecía en cada arranque. Ahora guarda JSON.
- 🟡 **CAZA#5 · version.json sin sanear**: versión/fecha/url remotos entraban al DOM tal cual (única entrada remota de la app). Charset blanco `\w.-`, fecha con `xh()`, url solo `https://`.
- 🔧 **CAZA#7 (en la propia batería)**: el test del aviso ✨ devolvía un `Promise` sin `await` → siempre verde **y** llamaba a `checkVersion()` que no era pública. Test reparado de verdad; nuevo export `cfbCheckVersion()`.
- 🧪 Baterías: **174/174 + 58/58 · 0 errores JS** (7 checks nuevos clavando cada bug: E1–E6 + F1 funcional). Trampas de caza re-ejecutadas: todas en OK. sw `cfb-v231`, APK v16.

## v2.3.2 — 16-09-2026 · «Silencio»: se cierran los 2 avisos funcionales de la caza
- 🪟 **CAZA#A1 · el EXE ya no muere en silencio**: con `-H windowsgui` los errores iban a un stderr invisible (doble clic y «no pasa nada»). Ahora `exit()` abre un **MessageBoxW nativo** (user32.dll vía syscall, sin dependencias; `aviso_windows.go`/`aviso_other.go` con build tags) y el caso «sin navegador» incluye la ruta del HTML para abrirlo a mano.
- 📦 **CAZA#A2 · sw**: ante una respuesta !ok (404/500 del hosting) el network-first servía el error aun teniendo copia buena → ahora cae a caché (`hit||r`). sw `cfb-v232`.
- ⚪ **CAZA#A3 (keystore en repo)**: decisión documentada en `build.sh` — riesgo aceptado mientras el repo sea privado; si algún día se hace público, rotar keystore y mover la contraseña a secrets.
- ⚪ **CAZA#A4**: comentarios saneados (main.go «5 HTML»); las Google Fonts externas se quedan CONSCIENTEMENTE (`display=swap` + stack del sistema: offline degradan sin romper nada).
- 🧪 Baterías: **176/176 + 58/58 · 0 errores JS** (E7/E8 nuevos). APK v17.

## v2.4.0 — 16-09-2026 · «Lógica»: cada área con un único dueño
Revisión de lógica del producto a petición del equipo — se elimina lo redundante y se cierran los huecos de flujo:
- 👤 **«Mi semana» → «Mi Cuenta»** en guiones y panel admin. Dentro, nuevo bloque **👤 Sesión** con **🚪 Cerrar sesión** (limpia `cfb_perfil` y vuelve al menú; el progreso queda intacto).
- ☁ **La sync sale de Mi Cuenta**: la pilla «Guardado en la nube» desaparece del hub; la app sigue guardando sola y **el estado/clave se gestionan en el panel admin**.
- 🔑 **El admin ya EDITA el token** (antes solo lo comprobaba): «✏️ Cambiar la clave de ESTE dispositivo» → pega la nueva → se verifica en vivo contra GitHub → si responde ✔ queda activa al instante; si falla, restaura la anterior.
- ⚖️ **El aviso legal («ANTES DE LLAMAR…») lleva ✕ «no volver a mostrar»**: persiste en `bm_compliance_off` → viaja con la sync del usuario y respeta los dos perfiles (pymes/residencial).
- 🔁➡️🗑 **Retirada TOTAL del apartado QR** («Entre dispositivos»): con la sync por usuario no tenía sentido. Fuera jsQR + qrcode-generator + import/export de códigos + overlay de cámara → **los guiones adelgazan ~27 %** (722→528 KB). La APK pierde el **permiso de cámara** (`CfbChrome` eliminado).
- 🧪 **168/168 + 58/58 · 0 errores JS** (retirados 15 checks de funciones muertas, 10 nuevos fijando cada cambio: L1–L7 estáticos + 3 funcionales). sw `cfb-v240`, APK v18, EXE firmado.

## v2.5.0 — 16-09-2026 · «Salud»: la llamada se cronometra y el error llega al responsable
- ⏱ **Cronómetro de llamada real** (botón «⏱ Llamada» en la cabecera de ambos guiones): pulse al descolgar y de nuevo al colgar → la llamada se **registra sola** (como el +1) **con su duración** (`bm_dias.[fecha].segs`). Si solo quiere el cronómetro sin registro, basta con no colgarlo desde el botón.
- 📈 **El panel admin gana la columna «⏱ Media»**: duración media de las llamadas de la semana — el dato que dice si se respetan los 2–3 minutos de conversación útil. También sale en el CSV.
- 🩺 **Salud por comercial en el panel**: la línea «🩺 sin errores registrados / N error(es) · último…» lee `bm_errores*` de cada burbuja (ya viajaban con la sync) y despliega los 3 últimos errores captados del dispositivo (tipo, perfil, hora, mensaje). Un comercial en rojo = la herramienta se está rompiendo en su móvil/PC.
- 🧪 **174/174 + 58/58 · 0 errores JS** (S1–S6 nuevos; el test v2.1/AUD3-G del colspan pasa a 8 columnas).

## v2.6.0 — 16-09-2026 · «Plantilla»: el seguimiento se escribe solo y la nota vive en el Foco
- 📨 **«Seguimiento al cliente» en Mi Cuenta**: un toque abre tu *correo* o *WhatsApp* con el texto de seguimiento **ya personalizado** con el nombre del cliente y el del comercial (toma «📋 Datos de la llamada»). Editable siempre antes de enviar.
- 📝 **Nota CRM en modo Foco**: con el guion en pantalla limpia, abajo a la izquierda aparece «📝 Nota rápida de la llamada» (cliente + nota) que se guarda **directo en Mis clientes** del CRM local — sin salir de la llamada, sin abrir menús.
- 🧪 **179/179 + 58/58 · 0 errores JS** (E1–E5 nuevos: estáticos y dos ciclos funcionales completos).

## v2.7.0 — 16-09-2026 · «Diploma»: examen final cronometrado y certificado imprimible
- 🎓 **Examen final** (Mi Cuenta → 🎓 Diploma): 10 preguntas al azar del banco del curso, 8 minutos de reloj, aprobado con 8/10. El resultado convive con la mejor nota (`bm_diploma`, con sufijo por perfil) y se puede repetir la vez que haga falta.
- 📜 **Certificado imprimible**: al aprobar se habilita «📜 Certificado PDF» — diploma con nombre, programa, nota y fecha listo para imprimir o guardar como PDF (reutiliza el sistema de impresión de la ficha de llamada).
- 🔔 **Auto-aviso de versiones ACTIVADO**: las plantillas ya consultan el `version.json` público (v2.3 lo dejaba preparado comentado) — cuando salga una versión nueva, el aviso ✨ aparece solo en PC y móvil.
- 📲 **Página «Instalar en tu móvil»** (`instalar.html`): pasos ilustrados para iPhone (Safari → «Añadir a pantalla de inicio») y Android (instalación PWA nativa), enlazada desde la página de entrada y cacheada por el service worker.
- 🧪 **187/187 + 58/58 · 0 errores JS** (D1–D6 y PAR-PWA1/2 nuevos; el check v2.3-F3 ahora exige la URL activa). sw `cfb-v270`, APK v19, EXE firmado.

## v2.7.1 — 16-09-2026 · «DIA»: a un vistazo del auditor (QA senior en caliente)
Tras la auditoría en profundidad recién entregada (`_documentos/AUDITORIA-QA-SENIOR-v2.7.0.md`), se corrigen en el acto sus hallazgos seguros:
- 🔴→✔ **El ⏱ no pulsaba**: la regla `.timer-on` referenciaba `@keyframes cfbPulseG` que no existía. Se define (latido rojo + halo) y se deja comprobado.
- 🟡→✔ **Examen accesible** (WCAG 2.2 4.1.2 / ARIA 1.2): `role="dialog"`, `aria-modal`, `aria-label`, foco inicial, retorno de foco al cerrar y **Escape**.
- 🟡→✔ **WCAG 2.3.3**: `prefers-reduced-motion` en las plantillas editoriales y en index/admin/tutorial — animación y transición cortadas para quien lo pidió.
- ♿ Labels accesibles en la nota de Foco y el CRM (`aria-label`, el placeholder ya no hace de nombre) + `aria-pressed` en el ⏱.
- 🎨 `theme-color` en plantillas y `description` en `instalar.html` (SEO mínimo/A1).
- 🧪 **190/190 + 58/58 · 0 errores JS** (P1–P3 nuevos). sw `cfb-v271`, APK v20, EXE 2.7.1 firmado.

## v2.7.2 — 16-09-2026 · «Ocultar NO saca del Foco» (bug de campo)
El equipo cazó el fallo en producción: el botón **«Ocultar» de la nota rápida (modo Foco) cerraba el modo Foco ENTERO** — siguiendo el flujo del guion, perder el Foco en mitad de una llamada es lo peor posible. Era consecuencia de un acceso directo a `guiToggleFoco` heredado de v2.6; el auditor lo verificó en el DOM y trazó el comportamiento exacto:
- ✔ **«Ocultar» ahora solo esconde la nota** (clase `.qn-off`); el guion sigue en pantalla limpia.
- ✔ **La nota reaparece sola al entrar de nuevo en Foco** (next hook determinista sobre `guiToggleFoco` — nada de timers espurios), vía el mecanismo `cadena()` ya usado por los contadores de prácticas.
- 🧪 **192/192 + 58/58** (Q1/Q2 prueban el comportamiento exacto: Ocultar + persistencia del Foco + reaparición al re-entrar). sw `cfb-v272`, APK v21, EXE 2.7.2.

## v2.8.0 — 16-09-2026 · Las 10 mejoras (petición del usuario: «aplica ya mismo todo»)

1. **Deploy Pages** — preparado; ver `docs/DESPLIEGUE-PAGES.md` (un push lo deja en vivo).
2. **Nota rápida = mini-CRM** — campo ☎ teléfono (opc.), botón **📞 Llamar** (aparece al rellenarlo) y el teléfono viaja prefijado en la ficha del cliente.
3. **Dictado por voz 🎙** — `SpeechRecognition` es-ES con detección de soporte; dicta directo al textarea en medio de la llamada.
4. **Buscador del guion en vivo 🔍** — caja arriba-derecha (solo en vista guion): filtra nodos y objeciones al escribir (acento-insensible), 8 resultados, navega con un clic; Esc o clic fuera cierra.
5. **Examen con repetición espaciada 🧠** — cada examen registra fallos (`bm_exam_fallo`) y ofrece «Repasar falladas (N)» con escalera 1/3/7 días (acierto limpia la ficha).
6. **Admin: práctica por comercial** — columnas nuevas **🎭 Rol** (roleplays acumulados) y **🎓 Quiz** (aciertos/preguntas) desde `bm_stats_<slug>` ya sincronizado.
7. **Meta semanal configurable 🎯** — tarjeta nueva en el panel: `equipo.json.metaRoleplay` (1–40) → «Mi Cuenta» muestra el objetivo y la barra con ese número (puerta y admin conservan el campo al escribir).
8. **Modo local retirado también de los guiones** — se acabó la excepción: todo perfil sincroniza igual; coherencia total con «conexión necesaria» (decisión v2.7.7, completada).
9. **CSP primer paso** — los botones de la nota rápida ya van por `addEventListener` (sin `onclick`); hoja de ruta completa en `docs/CSP-ROADMAP.md`.
10. **Batería VISUAL** — `tests/visual-bateria.js` (jsdom, estilos computados: nota fixed/oculta, cfbCss en `<head>`, toast sobre nota, hero, diploma oculto) integrada en `npm test`: los fallos CSS se cazan solos.

Tests: **211/211 + 58/58 + 13/13 visual · 0 errores JS** · sw `cfb-v280` · version.json 2.8.0.

## v2.7.7 — 16-09-2026 · Portada de marca (logos Iberdrola × B&M en primer plano) + fin del discurso «sin conexión»

- **Hero de marca**: nueva sección en primer plano con el logo oficial Iberdrola y el de B&M servidos como PNG (`logo-iberdrola.png`, `logo-bm.png` — los data-URI internos pasan a archivos cacheables por GitHub Pages y el sw). Tarjeta blanca con sombra, «×» divisorio y subtítulo «Socia Colaboradora Oficial de Iberdrola».
- **Offline fuera del relato**: la app vive en GitHub Pages → se eliminan el claim «Funciona sin conexión» del intro, el bloque «Sin conexión» del pie (sustituido por «Conexión y nube del equipo») y el **modo local** de la puerta (función + enlace + chip del saludo). El error de red ahora dice: «Comprueba tu conexión y vuelve a intentarlo». (El soporte interno `_pp.local` de los guiones se mantiene por compatibilidad; la puerta ya no ofrece crear perfiles locales.)
- **Limpieza estructural detectada en caliente**: el CSS de la puerta ID estaba pegado ×4 y el script anti-flash ×4 (copia-pega heredado) → ×1 cada uno. index.html: 25,4 KB → 20,6 KB.
- Tests: 2 nuevos (hero+PNGs, rebranding sin claims offline) → **204/204 + 58/58** · sw `cfb-v277` (con los 2 logos en caché) · version.json 2.7.7.

## v2.7.6 — 16-09-2026 · Caza definitiva del «área rota»: cfbCss estaba en <body> (visores estrictos la ignoran) + blindaje inline

- **Síntoma persistente**: tras v2.7.5 el usuario seguía viendo la nota sin estilos en el visor web del móvil.
- **Causa**: `<style id="cfbCss">` vivía en el `<body>` (las hojas que sí se aplican —cssTut/cssGuion/cssBridge— están en `<head>`). Los visores estrictos (p. ej. el de Arena) descartan las hojas del body → la nota se veía al desnudo aunque el CSS fuese correcto.
- **Fix estructural**: cfbCss movida a `<head>` en ambas plantillas.
- **Blindaje extra**: la nota lleva ahora su estilo crítico inline (tarjeta flotante) y `window.qnSync()` gobierna su `display` (Foco ∧ ¬oculta), sincronizando en cada clic — funciona aunque un visor ignore todas las hojas.
- **Verificación comportamental (jsdom)**: arranque none → Foco block → «Ocultar» none (Foco intacto) → salir none → volver block ✔.
- Tests Q8–Q10 (head, inline, qnSync) → **203/203 + 58/58** · sw `cfb-v276`.

## v2.7.5 — 16-09-2026 · CAZA REAL: la nota rápida llevaba SIN ESTILOS desde v2.7 (reglas dentro de @media print)

- **Causa raíz (captura del usuario)**: al añadir el diploma (v2.7), el bloque CSS nuevo —`#cfbCertPrint`, pulso del cronómetro, `prefers-reduced-motion` y **todas las reglas de `#cfbQuickNote`**— quedó anidado *dentro* de `@media print{…}`. En pantalla no se aplicaba nada: la nota salía en el flujo del documento, sin tarjeta, campos desbordados y botones nativos; solo se hubiera visto bien AL IMPRIMIR.
- **Fix**: reestructurado `cfbCss` — `@media print` contiene sólo reglas de impresión; el resto vuelve a pantalla (pymes + residencial).
- **Efectos colaterales curados**: el certificado del diploma ya se puede previsualizar bien, el cronómetro del examen pulsa en rojo a partir de 60 s y `prefers-reduced-motion` vuelve a respetarse.
- **Tests**: Q7a–d estructurales (cierre de llaves real, no regex) → NINGUNA regla de pantalla puede volver a colarse en `@media print`. Verificación adicional con estilo computado (jsdom): `display:none · position:fixed · min(320px,86vw)` en ambas versiones.
- Batería: **200/200 + 58/58** · sw `cfb-v275`.

## v2.7.4 — 16-09-2026 · Nota rápida: back reforzado + front de los botones ✎/Ocultar

- **Front (causa raíz del reporte «botones raros»)**: `.cfb-btn` solo tenía estilo *dentro* de `#cfbHub`; los botones de la nota rápida (fuera del hub) salían con el look nativo del navegador (gris, sinsombra). Nuevas reglas `#cfbQuickNote .cfb-btn` y `.cfb-sec` (violeta corporativo, `flex:1`, feedback táctil `:active`).
- **Back verificado** (`cliAnadir`, persistencia `localStorage['cli_registros']`, sanitización `<>&"`, límites 60/300, tapón 80 fichas + 20 notas, purga RGPD 180 días): sano. Refuerzos:
  - `qnGuardar` valida con `trim`, enfoca el campo vacío, mantiene el nombre del cliente a propósito (varias notas en la misma llamada), refresca **Mis clientes** al instante (`cliVerTodo`) y devuelve el foco al nombre.
  - Redundancia Foco: listener en captura sobre `#btnFoco` re-muestra la nota aunque `guiToggleFoco` falle; `window.qnMostrar` público.
- Batería: **196/196 + 58/58** (nuevas Q4 estilos, Q5 validación+refresco, Q6 redundancia Foco). sw `cfb-v274`.

## v2.7.3 — 16-09-2026 · «el toast ya sale por delante» (bug de campo, nota rápida)
Segunda pasada al área de la nota rápida tras el reporte del equipo «los botones no hacen nada»:
- 🔎 **Causa cazada por z-index**: la nota de Foco flota en `z-index:20000` y el **toast único de la app va en `z-index:200`** → tras «✎ Guardar» u «Ocultar», el mensaje de confirmación quedaba **escondido exactamente bajo el cuadro blanco** (en móvil, el ancho del cuadro ≈ pantalla entera). Los botones sí funcionaban; el feedback era invisible.
- ✔ Corrección de una línea: `.toast` sube a `z-index:100002` — visible sobre nota, hub, modales y píldora de versión (es transitorio por diseño; no tapa nada a posteriori).
- ✅ Verificación de integridad añadida tras un episodio de lecturas corruptas del panel: `admin.html` auditado byte a byte (JS válido, marcadores v2.5 presentes, md5 estable con su copia del lanzador).
- 🧪 **193/193 + 58/58** (Q3 clava que el toast quede siempre por encima de la nota). sw `cfb-v273`, APK v22, EXE 2.7.3.

## v2.9.0 «Babel» — guion multidioma por sesión (ES/FR/PT) · 2026-09-29
- **🌐 Selector de idioma por sesión al entrar al guion** (🇪🇸/🇫🇷/🇵🇹, chip 🌐 en la barra para cambiarlo cuando quieras; se recuerda durante la sesión).
- **Motor de overlays `I18N`**: restaura originales + mezcla el idioma elegido en caliente; el cromo de la vista script (botones, atajos, nota rápida, foco, títulos) cambia al 100% en FR/PT.
- **Ola 1 de contenidos**: cromo UI 100% FR/PT (28 cadenas) + semilla del árbol (`inicio` FR/PT) y objeción `ya_tengo` («J’ai déjà un fournisseur» / «Já tenho comercializadora») como demostración del motor.
- **Cobertura real visible en el selector** (% de nodos 70% + objeciones 30%) — hoy FR 7% / PT 7% aprox. sobre contenido total; las oleadas 2-4 la suben.
- Tests: W8 (motor, 10 checks) + W9 (cobertura evaluada en vm, 4 checks). Baterías: 225 + 58 + 13 ✔.
- Sin tocar: onboarding/tutorial/quiz/diploma siguen en ES (fuera del alcance acordado).

## v2.9.1 — Limpieza de workspace + marca unificada «Call Flow» · 2026-09-29
- 🧹 **Limpieza profunda**: 145 → ~105 ficheros y 85 MB → ~8 MB. Eliminados: `go.tgz` (73 MB), copias regenerables de `assets/` en android/lanzador, EXE sin firmar, `.idsig`, log de firma anterior, `docs/emails/`, `docs/pruebas/` y dotfiles fugaces.
- 🏷️ **Adiós «diagsystem»**: nuevos `callflow-icon-192/512.png` (icono PWA, zona segura maskable) y `callflow-social-preview.png` 1200×630 (og:image), compuestos con los logos reales Iberdrola + B&M. Actualizados `manifest.webmanifest`, precache de `sw.js` (`cfb-v291`) y `og:image` de ambos guiones.
- Sin cambios funcionales de la app. Tests: 225 + 58 + 13 ✔ · version.json 2.9.1.

## v2.9.2 «Babel · ola 2» — las 15 objeciones en francés y portugués · 2026-09-29
- 🌐 **Ola 2 completada**: los 15 manejos de objeción PYMES traducidos en caliente (FR vouvoiement · PT europeo «o senhor»): nombre + validación + desactivación + reencuadre + avance + **diálogo completo** + **round 2**. Incluye matiz conforme: FR «liste d’opposition» (tipo Bloctel), horario legal en ambos.
- 🔧 Motor: `cfaApply` mezcla ahora también `round2` (antes se quedaba en español al cambiar de idioma).
- 📊 Cobertura en el selector 🌐: FR/PT 7 % → **~32 %** (objeciones 15/15; árbol y glosario siguen en pertinente ola 3/4).
- Tests: 242 QA (W9 ahora mide banda de ola 2 + presencia de las 15 claves FR/PT + mezcla de `round2`) · 58 residencial · 13 visual ✔. sw `cfb-v292`.

## v2.9.6 «Babel · ola 4» — la voz de cada mercado (nat{}) + glosarios FR/PT/EN · 2026-09-30
- **🗣 93 bloques `nat{}` traducidos y activos** — las 15 objeciones y los 18 nodos llevan ahora, por idioma, su voz natural de mercado: frases alternativas (alt), notas culturales (por qué suena a Francia/Portugal/Reino Unido) y zona de registro (vouvoiement francés · «o senhor / a senhora» portugués · cordial-formal británico). El botón/panel 🇪🇸 pasa a 🌐 y se traduce (« Voir le naturel » / « Ver naturalidade » / « See market voice »).
- **📚 Glosario nativo por mercado** — 9 categorías × idioma (fórmulas telefónicas, validación, conectores, reformuladores, matizadores, la pérdida de la calle, cierres naturales, léxico del dueño de PME, gramática hablada) todos reescritos para cada mercado (nada de traducción literal: « Então fica combinado » PT, « On fait comme ça, alors » FR, “So we’re settled, then” EN). La pestaña GLOSARIO se renderiza por idioma (encabezado, categorías, la etiqueta «Alternativas» y el título de prohibiciones, traducidos; la tabla de prohibiciones queda en ES, es guía interna del guion español).
- 🔧 Motor: el overlay fusiona ahora `nat` (nodos y objeciones), `I18N` y `cfaT` se exponen en `window` para las pestañas (con guardas `typeof` para jsdom), y cambiar de idioma repinta la pestaña del glosario si está abierta.
- Tests: **437 + 58 + 13 ✔** (nueva batería W10: 3×15 nat obj + 3×18 nat nodos + glosarios + wiring). jsdom verificado: nat PT en nodos y objeciones, pestaña glosario completa en portugués, nat EN al vuelo.
- sw `cfb-v296`. Queda en ES por alcance: onboarding, casos de escucha y tabla interna de prohibiciones.

## v2.9.5 «Babel · 100 % EN» — inglés completo en la superficie de llamada · 2026-09-29
- **🌐 Olas 3b+3c cerradas: EN al 100 %** — las **15 objeciones** (nombre, validación, desactivación, reencuadre, avance, **diálogo completo** y **round 2**) y los **18 nodos** del árbol de decisión traducidos al inglés británico neutro comercial («sleeping money», «plug a leak», «no strings attached»), con la misma mecánica (`next/obj/resume/cls/keepObj` intactos) y marcas `[PAUSA]`/`[TONO]` sin traducir.
- Cobertura en el selector: **FR 100 % · PT 100 % · EN 100 %**.
- El sufijo «(oleadas en curso)» ahora es **dinámico y multidioma**: desaparece cuando los tres idiomas están al 100 %; las dos cadenas de la línea de cobertura pasan al diccionario UI traducido (27 cadenas/idioma).
- Tests: aserciones por idioma × clave (3×15 obj + 3×18 nodos), paridad FR/PT/EN, overlay obj EN completo (dialogo+round2) → **331 + 58 + 13 ✔**. jsdom verificado: árbol y objeciones EN aplicados en caliente, chip 🌐 EN, cobertura trilingüe 100/100/100.
- sw `cfb-v295`. Queda fuera como siempre: `nat{}` (ola 4) y onboarding/tutorial/quiz (ES).

## v2.9.4 «Babel · EN + ola 3» — 4º idioma (inglés) y árbol PYMES FR/PT al 100 % · 2026-09-29
- **🌐 🇬🇧 Cuarto idioma EN** (petición explícita del usuario sobre la mesa): selector 🇪🇸/🇫🇷/🇵🇹/🇬🇧, cromo UI traducido a inglés (25 cadenas), chip `🌐 EN`, cobertura trilingüe `FR · PT · EN` en el selector y semilla `I18N.en.nodes.inicio`. EN arranca al **4 %** (cromo + semilla); sus objeciones/árbol van en las olas 3b/3c del plan.
- **📖 Ola 3 cerrada: árbol de decisión PYMES FR/PT al 100 %** — los 18 nodos (`inicio … retirada`) traducidos: título, micro-frase, **guion (el diálogo completo palabra a palabra)**, notas de táctica y etiquetas/sub de opciones. `next/obj/resume/cls/ico` intactos (mecánica idéntica), y las marcas de dirección `[PAUSA 2s]`/`[TONO ↑/↓]` se mantienen sin traducir a propósito (se leen en voz alta por ti).
- Cobertura en el selector: **FR 100 % · PT 100 % · EN 4 %**.
- 📊 Tests: mocks con claves reales (18 nodos + 15 objeciones), W9-1/2 a 100 %, nuevas W9-5/6/7/8/9 (paridad, conteo de nodos, presencia por clave, mezcla `round2`, semilla EN) → **261 + 58 + 13 ✔**. sw `cfb-v294`.
- Sin cambios: `nat{}` de nodos sigue ES (ola 4), onboarding/tutorial/quiz en ES, referencias `fidelización` y matriz de mercado sin tocar.

## v2.9.3 «Babel · hotfix selector» · 2026-09-29
- 🐛 **El selector 🌐 no aparecía al entrar al guion** (reporte directo del usuario): el enganche usaba el helper `cadena()`, no disponible de forma fiable en ese momento → se tragaba la excepción y no se ponía la trampa. Reescrito con `wraps()` (el helper probado en producción) + bucle de reintento (250 ms × 60) hasta que `tutAbrirGuion` existe. Verificado en jsdom: al entrar al guion aparece el diálogo 🇪🇸/🇫🇷/🇵🇹 con cobertura FR 34 % · PT 34 %, y reentrar en la misma sesión aplica el idioma guardado.
- sw `cfb-v293` (fuerza refresco del PWA).
