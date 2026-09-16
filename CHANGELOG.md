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
