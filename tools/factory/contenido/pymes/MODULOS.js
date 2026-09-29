const MODULOS = {

m0:{titulo:'Bienvenida — para qué existe todo esto', dur:'5 min', nivel:'básico', oblig:true, prev:'guia',
va:['Para qué sirve el guion: vender a la tripa y justificar con la razón','Qué NO es: ni teletrólex ni sustituto de su criterio','Los tres principios que no se negocian jamás'],
body:`
<div class="bloque"><h3>Vender a la tripa, justificar con la razón</h3>
<p>El dueño de una PYME no decide con una hoja de cálculo: decide con el miedo a que le fallen y con el alivio de saberse cubierto. Este guion habla primero a ese estómago —emoción, escena, pérdida— y solo después entrega los euros para que la cabeza firme lo que la tripa ya decidió.</p></div>
<div class="bloque"><h3>Qué NO es</h3>
<p>No es un teletrólex: si lo lee como un robot, el cliente cuelga. Las frases son la partitura; usted pone la voz, las pausas y el oído. Y no sustituye su criterio: si el guion dice A y el cliente pide B con claridad, manda el cliente.</p></div>
<div class="bloque"><h3>Los tres principios irrenunciables</h3>
<ul><li><b>Emoción antes que dato.</b> Los primeros 30 segundos de cada bloque mueven una emoción, no un número.</li>
<li><b>Cierre por elección.</b> Nunca «¿le interesa?». Siempre A/B: canal, día, hora o alcance.</li>
<li><b>Compliance por encima de todo.</b> Lista Robinson, horarios, verdades verificables. Una venta legal hoy vale más que diez dudosas mañana.</li></ul></div>
<div class="ejemplo"><b class="tag">Cómo se abre la herramienta</b><p>Doble clic en <code class="k">pymes.html</code> con Chrome o Edge (Firefox también va). Funciona offline: solo las fuentes letra viajan por red. Guion y tutorial viven en el mismo archivo: entre con el botón verde «Abrir el guion» de la cabecera. Consejo: una pestaña fija a la izquierda de su pantalla, CRM a la derecha, y manos libres siempre.</p></div>`,
ej:`Abra el guion, localice el botón «↺ Reiniciar», el banner ámbar de compliance y la pestaña 🇪🇸 Glosario. Después lea en voz alta la apertura del bloque 1 mirando al techo cada dos frases: si suena a leído, repítala.`},

m1:{titulo:'Tour por la interfaz — dónde está cada cosa', dur:'10 min', nivel:'básico', oblig:true,
va:['Los cuatro anclajes: cabecera, banner, progreso y paneles','Las 7 pestañas del panel derecho y para qué sirve cada una','El modal de «Datos de la llamada» y el color ámbar punteado'],
body:`
<div class="bloque"><h3>La cabecera, de izquierda a derecha</h3>
<ul><li><b>🔬 Capa neuro:</b> muestra/oculta las etiquetas de todos los bloques a la vez (entrenamiento).</li>
<li><b>🎯 Foco:</b> esconde distracciones (avisos, progreso y pestañas extra) y agranda el discurso —el árbol sigue a la vista. Oro puro en vivo.</li>
<li><b>📋 Datos de la llamada:</b> el modal de 13 variables que personaliza el guion.</li>
<li><b>🎭 Roleplay y ↺ Reiniciar:</b> simulador y vuelta a empezar.</li></ul></div>
<div class="bloque"><h3>La barra de progreso</h3>
<p>Nueve fases: Apertura → Presentación → Motivo → Permiso → Detección → Pitch → Objeción → Cierre → Seguimiento. El punto verde marca dónde está la llamada. Sirve de brújula: si lleva 6 minutos en Motivo, acelere.</p></div>
<div class="bloque"><h3>Los dos paneles</h3>
<p><b>Izquierdo (árbol):</b> las respuestas posibles del cliente como botones, un desplegable para abrir cualquier objeción y los atajos (Volver, Reiniciar, Ir al cierre). <b>Derecho (discurso):</b> siete pestañas — 🗣 Discurso, 🛡 Objeciones, 🤝 Cierre y seguimiento, 🧠 Anexo neuro, 🇪🇸 Glosario, 📈 KPIs, 🎭 Roleplay. En la llamada vivirá en la primera; el resto es escuela y consulta.</p></div>
<div class="ejemplo"><b class="tag">El color ámbar punteado</b><p>En los textos verá <span style="background:#F5F1E8;border-bottom:1px dotted #B4A272;padding:1px 4px">[NOMBRE_CLIENTE]</span>: son variables sin rellenar. En cuanto las escribe en el modal, el ámbar se convierte en el dato real. Ámbar = le falta contexto al guion.</p></div>`,
ej:`Sin ayuda, localice en 60 segundos: ① el desplegable de objeciones, ② la pestaña KPIs, ③ el botón Volver, ④ el modal de datos, ⑤ la marca de [PAUSA 2s] (active la capa neuro de la apertura). Cronómetro.`},

m2:{titulo:'Preparar la llamada — los 5 minutos que deciden la venta', dur:'5 min', nivel:'básico', oblig:true,
va:['Rellenar el modal de datos sin dejarse campos clave','Qué datos hay según la fuente del lead (Iberdrola, IBERCRM, IBERU)','Los dos chequeos legales: Lista Robinson y horario'],
body:`
<div class="bloque"><h3>El modal, campo a campo</h3>
<p>Abra «📋 Datos de la llamada» y rellene arriba-abajo: nombre del cliente y su nombre primero (van a sonar toda la llamada), después empresa, sector y ciudad, y por último lo comercial: comercializadora, tarifa, consumo, potencia. Cada campo escrito sustituye al ámbar punteado al momento. No hace falta guardar: se aplica solo y se recuerda entre llamadas.</p></div>
<div class="bloque"><h3>Qué sabe de cada lead</h3>
<table class="mini"><tr><th>Fuente</th><th>Qué tiene</th><th>Qué falta</th></tr>
<tr><td><b>Cliente Iberdrola</b></td><td>Todo</td><td>Nada: vaya al grano</td></tr>
<tr><td><b>Lead IBERCRM</b></td><td>Contacto y empresa</td><td>Tarifa y compañía actual: se descubren en Detección</td></tr>
<tr><td><b>IBERU</b></td><td>Consumos por distribuidora</td><td>Confirme identidad y Robinson</td></tr></table></div>
<div class="bloque"><h3>Los dos chequeos legales</h3>
<p>① Lista Robinson: consulte IberU antes de marcar. Si está inscrito, no se llama. ② Horario: 9:00–13:30 y 16:30–20:00. Fuera de ahí, ni el mejor discurso del mundo le salva de una reclamación. Y la regla del nombre: el nombre del cliente debe sonar <b>mínimo tres veces</b> durante la llamada — la familiaridad vende sola.</p></div>
<div class="ejemplo"><b class="tag">Ejemplo — ficha en 40 segundos</b><p>Lead frío: Bar «El Faro», Puerto de Sagunto. Usted apunta: nombre Manolo · hostelería · Puerto de Sagunto · frío. Listo. La tarifa de luz no la sabe: perfecto, es la segunda pregunta de Detección, no una laguna.</p></div>`,
ej:`Rellene el modal con esta ficha ficticia: Carmen Ruiz, «Clínica Dental Sonría», clínicas, Sagunto, lead entrante. Compruebe que en la apertura aparecen Carmen y su clínica en lugar del ámbar.`},

m3:{titulo:'Ejecutar la llamada — el ciclo leer–escuchar–pulsar', dur:'15 min', nivel:'básico', oblig:true,
va:['El ciclo de cada bloque: leer un párrafo, escuchar, pulsar, repetir','Cómo se interpretan las [PAUSA 2s] y los [TONO ↑ ↓]','Cuándo usar la capa neuro y el modo foco en vivo'],
body:`
<div class="bloque"><h3>El ciclo que manda</h3>
<p>① Lea UN párrafo del discurso. ② Calle y escuche de verdad. ③ Pulse en el árbol la respuesta más parecida a lo que ha oído. ④ El guion salta al bloque correcto. Repita. Jamás lea dos párrafos seguidos sin escuchar: la llamada la conduce el cliente; usted solo pisa los pedales.</p>
<p>Si pisa el botón equivocado, «← Volver» le devuelve. Y si el cliente se adelanta («¡mándeme eso ya!»), use el atajo «🤝 Ir al cierre»: el guion sirve al cliente, no al revés.</p></div>
<div class="bloque"><h3>Pausas y tonos</h3>
<p>Con la capa neuro visible (botón 🔬) verá marcas en cursiva: <i>‖ [PAUSA 2s]</i> es silencio sagrado — ahí el cerebro del cliente trabaja para usted, no lo rellene; <i>↗ [TONO ↑]</i> suba energía en preguntas abiertas; <i>↘ [TONO ↓]</i> baje la voz al cerrar: la voz grave suena a verdad.</p></div>
<div class="bloque"><h3>Capa y foco en vivo</h3>
<p>Regla de la primera semana: <b>capa neuro OFF en llamada real</b>. Las etiquetas son de entrenamiento; en vivo distraen. En cambio, el modo 🎯 Foco sí es de batalla: tras elegir la respuesta en el árbol, actívelo: el árbol sigue a mano y el discurso se lee a lo grande, sin distracciones.</p></div>
<div class="ejemplo"><b class="tag">Ejemplo — recorrido real de 3 minutos</b>
<p class="dial"><span class="cl">Cliente:</span> «¿Sí, dígame?»</p>
<p class="dial"><span class="co">Usted:</span> apertura completa, pausa, escucha. El cliente suelta: «Pues este mes la luz me ha dado un susto…» → pulse <b>Detección → Dolor de PRECIO</b>. El guion le da el pitch de la fuga con su sector. Termina en «¿WhatsApp o correo?» y el cliente elige WhatsApp. Pulse <b>Cierre B</b> y ejecute. Tres minutos, tres pulsaciones, cero improvisación.</p></div>`,
ej:`Llamada simulada completa, solo con un compañero o un grabador: cliente «restaurante de playa, paga mucho, acepta mandar la factura». Recorra Apertura→Permiso→Detección→Pitch→Cierre B→Seguimiento leyendo en voz alta y respetando cada [PAUSA 2s]. Grábese y escúchese una vez.`},

m4:{titulo:'Objeciones — el miedo detrás de cada “no”', dur:'10 min', nivel:'intermedio', oblig:false,
va:['El protocolo de 4 pasos: Validar → Desactivar → Reencuadrar → Avanzar','La 2ª ronda y el regalo de desbloqueo','La regla de los dos “no”: salir con elegancia'],
body:`
<div class="bloque"><h3>El protocolo de 4 pasos</h3>
<p>Toda objeción es un miedo disfrazado; por eso nunca se rebate en frío. ① <b>Validar:</b> «le entiendo, faltaría más» — baja la guardia. ② <b>Desactivar la amenaza:</b> «sin tocar nada, sin compromiso ninguno» — baja el cortisol. ③ <b>Reencuadrar:</b> pérdida actual, historia o contraste, nunca discutir. ④ <b>Avanzar:</b> pregunta abierta o elección A/B, jamás sí/no. En la herramienta cada objeción se abre desde el desplegable del árbol y muestra los cuatro pasos coloreados.</p></div>
<div class="bloque"><h3>La 2ª ronda y el regalo</h3>
<p>Si tras los 4 pasos insiste, pulse «Insiste en la objeción»: entra la 2ª ronda, que añade el desbloqueo permitido —<b>estudio de ahorro gratis</b> o <b>detalle de bienvenida (merchandising)</b>— más la prueba social de su sector y zona. El regalo no es soborno: es reciprocidad, la moneda más antigua de la venta.</p></div>
<div class="bloque"><h3>La regla de los dos “no”</h3>
<p>Dos negativas seguidas a la misma puerta = cierre de puerta, no de relación. Pulse «Retirada elegante»: agradecido, una imagen sembrada (el sábado sin luz, la factura que se dispara), su WhatsApp entregado y «que le vaya muy bien». Hoy pierde la batalla; en seis meses gana el cliente.</p></div>
<div class="ejemplo"><b class="tag">Ejemplo — «ya tengo compañía»</b>
<p class="dial"><span class="cl">Cliente:</span> «Es que ya tengo compañía.»</p>
<p class="dial"><span class="co">Usted:</span> «Claro, faltaría más, es lo normal. Y tranquilo, que no tocamos nada. Solo una curiosidad: ¿cuánto le cuesta al mes no mirarla? La última factura, ¿pasó de los cuatrocientos?»</p>
<p class="dial"><span class="cl">Cliente:</span> «Pues… anduvo por los cuatrocientos cincuenta.»</p>
<p>Objeción resuelta sin rebatir: validó, desactivó, reencuadró con pérdida y avanzó con ancla.</p></div>`,
ej:`Abra el desplegable, elija tres objeciones al azar y léalas en voz alta con un compañero haciendo de cliente borde. Después de cada una, diga qué paso del protocolo le funcionó mejor. Diez minutos al día esta semana.`},

m5:{titulo:'Cierres y seguimiento — donde se gana o se pierde todo', dur:'8 min', nivel:'intermedio', oblig:false,
va:['Los 4 tipos de cierre y cuándo toca cada uno','Peak-End: pico emocional + final limpio + voz alta','El plan de seguimiento multicanal y su cadencia'],
body:`
<div class="bloque"><h3>El cierre correcto para cada cliente</h3>
<table class="mini"><tr><th>Cliente</th><th>Cierre</th><th>Señal</th></tr>
<tr><td><b>Caliente</b> (pregunta precios, plazos)</td><td>C Alta o A cita esta semana</td><td>Compra ya: no lo enfríe</td></tr>
<tr><td><b>Tibio</b> (interesa, va liado)</td><td>B foto de factura</td><td>Micro-compromiso: una foto</td></tr>
<tr><td><b>Técnico</b> (placas, cuadros, 6.1TD)</td><td>D visita del ingeniero</td><td>Vende la visita, no el proyecto</td></tr>
<tr><td><b>Frío / dos no</b></td><td>Retirada elegante</td><td>Pierde hoy, gana en 6 meses</td></tr></table></div>
<div class="bloque"><h3>Peak-End</h3>
<p>El cerebro recuerda el pico y el final, no la media. Antes de pedir el compromiso dispare el pico: «imagínese mañana a esta hora abrir el móvil y ver en euros lo que le cuesta no mirarlo». Después, final limpio: acuerdo repetido <b>en voz alta por el cliente</b> («pues quedamos así») y resumen por WhatsApp <b>en menos de 5 minutos</b> — anti-arrepentimiento.</p></div>
<div class="bloque"><h3>El seguimiento que no molesta</h3>
<p>Cadencia: 1er toque 24–48 h con una novedad · 2º a la semana con un caso de su sector · 3º a los 15 días · luego puerta abierta mensual. Cada toque lleva un regalo y cierra con elección; jamás un «¿le sigue interesando?» vacío. WhatsApp manda; email apoya; SMS refuerza.</p></div>`,
ej:`Asigne cierre a estos tres: ① encargado de chiringuito interesado pero en pleno servicio, ② dueño de taller que pregunta por placas y baterías, ③ directora de clínica que ha dicho dos veces «el jueves sin falta le espero». Solución: ① B · ② D · ③ A, con WhatsApp de confirmación hoy mismo en los tres.`},

m6:{titulo:'Capa neuro — ver los hilos del guion', dur:'10 min', nivel:'intermedio', oblig:false,
va:['Qué es la capa neuro y cómo se activa (bloque y global)','Cómo leer las ocho etiquetas principales','Entrenar con capa visible, vender con capa oculta'],
body:`
<div class="bloque"><h3>Qué es</h3>
<p>Cada frase del guion lleva pegados en gris fino los mecanismos que la mueven: el porqué funciona. Con el interruptor general «🔬 Capa neuro» de la cabecera se ven todos; con el botón 🔬 de cada bloque, solo los de ese bloque. Active la capa siempre que entrene —nunca en llamada real la primera semana.</p></div>
<div class="bloque"><h3>Las ocho etiquetas que más verá</h3>
<table class="mini"><tr><th>Etiqueta</th><th>Qué hace</th></tr>
<tr><td><b>PÉRDIDA</b></td><td>Reformula el beneficio como dinero que se escapa hoy</td></tr>
<tr><td><b>ANCLA</b></td><td>El primer número grande que condiciona la comparación</td></tr>
<tr><td><b>PRUEBA SOCIAL</b></td><td>“Tres talleres de su zona ya lo tienen” — imita a los iguales</td></tr>
<tr><td><b>ZEIGARNIK</b></td><td>Pregunta pendiente que el cliente necesita cerrar</td></tr>
<tr><td><b>ELECCIÓN A/B</b></td><td>El cierre sin el “no”: canal, día, hora, lugar</td></tr>
<tr><td><b>CORTISOL ↓</b></td><td>“Sin tocar nada, sin compromiso” — baja la amenaza</td></tr>
<tr><td><b>FUTURE PACING</b></td><td>Transporta al cliente al día en que ya lo tiene</td></tr>
<tr><td><b>PEAK-END</b></td><td>Pico emocional + final limpio, lo que se recuerda</td></tr></table></div>
<div class="bloque"><h3>Uso dual</h3>
<p><b>Entrenar:</b> capa ON, lea un bloque y nombre cada etiqueta en voz alta. <b>Vender:</b> capa OFF, el mecanismo ya va dentro de su voz. La pestaña 🧠 Anexo lista las 12 leyes en una línea, el checklist de 10 puntos y las tablas de mecanismos por bloque — autogeneradas desde el propio guion.</p></div>`,
ej:`Active la capa global y analice tres bloques en voz alta: Apertura, Pitch de la fuga y Cierre B. De cada uno, nombre: la emoción que abre, el escenario que pinta, la micro-decisión que pide y dónde está la justificación diferida.`},

m7:{titulo:'Roleplay — el gimnasio donde no cuestan las caídas', dur:'8 min', nivel:'intermedio', oblig:false,
va:['Cómo funciona el simulador y sus dos escenarios','Cómo se lee el feedback (leyes aplicadas o rotas)','Cómo usarlo justo antes de una campaña'],
body:`
<div class="bloque"><h3>Cómo funciona</h3>
<p>La pestaña 🎭 Roleplay pone al sistema de cliente difícil. Usted lee su intervención, dice su respuesta en voz alta (sí, en voz alta: la voz entrena distinto) y elige la opción más parecida. Cada fallo explica qué ley rompió; cada acierto, qué hilos tiró bien. Dos escenarios: <b>🍽 El Ocupado</b> (restauración en pleno servicio) y <b>🕵️ El Desconfiado</b> (taller quemado por malas llamadas).</p></div>
<div class="bloque"><h3>Cómo sacarle jugo</h3>
<p>Antes de una campaña de hostelería: repita El Ocupado hasta pasarlo sin ❌. Semanal: un escenario al día, cada día leyendo en voz alta distinta (más rápido, más lento, más grave). Las opciones buenas contienen las frases del guion real: lo que aquí ensaya, allí sale solo.</p></div>
<div class="ejemplo"><b class="tag">Ejemplo de feedback útil</b><p>Elige «¿me podría regalar un minuto?» y el simulador responde: latinismo detectado, pregunta de sí/no y palabra “oferta” — tres errores en diez palabras. Ese golpe no se olvida jamás en una llamada real.</p></div>`,
ej:`Complete hoy El Ocupado sin ninguna ❌ (si falla, repita desde el inicio). Anote en una tarjeta la frase que le desbloqueó el paso más difícil: esa tarjeta va pegada a su monitor.`},

m8:{titulo:'KPIs — el embudo que le dice dónde repasar', dur:'5 min', nivel:'básico', oblig:false,
va:['Los 4 números que apuntan el día','Las 4 tasas que calcula solas','Qué repasar según dónde pierde el embudo'],
body:`
<div class="bloque"><h3>Cuatro entradas, cuatro verdades</h3>
<p>Al final de cada jornada rellene en 📈 KPIs: llamadas, contactos con decisor, estudios/citas y ventas. La herramienta calcula sola: tasa de contacto, citas por contacto, cierre por cita y conversión global. Se guardan en su navegador; cada lunes, foto y a la reunión.</p></div>
<div class="bloque"><h3>Leer el embudo</h3>
<p>Cada caída tiene su módulo de repaso: muchas llamadas y pocos contactos → <b>Apertura</b> (franjas y ancla de pérdida); contactos que no dan estudio → <b>Detección y Pitch</b> (regalo primero, petición mínima); atasco en objeciones → <b>protocolo y Roleplay</b>; citas sin venta → <b>Peak-End y confirmación en voz alta</b>.</p></div>
<div class="ejemplo"><b class="tag">Ejemplo con números</b><p>Semana: 60 llamadas, 22 contactos, 8 citas, 3 ventas → 37 % contacto, 36 % citas, 38 % cierre, 5 % global. Lectura: cae en el primer tramo; toca trabajar apertura y franjas horarias, no el pitch.</p></div>`,
ej:`Meta los números de su última semana (reales o inventados) y escriba una sola frase: «esta semana repaso ___ porque el embudo cae en ___». Esa frase es su plan.`},

m9:{titulo:'Editar la herramienta — para el responsable', dur:'10 min', nivel:'avanzado', oblig:false,
va:['Dónde vive el contenido editable (todo en el script final)','Las tres estructuras: línea hablada, marca y contexto','Añadir una objeción y colores sin romper nada'],
body:`
<div class="bloque"><h3>Dónde está todo</h3>
<p>Abra el HTML con el Bloc de notas, VS Code o similar y baje al <code class="k">&lt;script&gt;</code> final. Ahí viven: <code class="k">NODES</code> (guion), <code class="k">OBJECTIONS</code>, <code class="k">CIERRE_SECCIONES</code>, <code class="k">SEGUIMIENTO_PLAN</code>, <code class="k">SCENARIOS</code>, <code class="k">LEYES</code>, <code class="k">GLOSARIO</code> y los colores en el <code class="k">:root</code> del CSS. Regla de oro: <b>duplique el archivo antes de tocar</b>.</p></div>
<div class="bloque"><h3>Las tres formas de línea</h3>
<ul><li><code class="k">{t:'texto para leer', n:'ETIQUETA · ETIQUETA'}</code> — lo que se dice en voz alta.</li>
<li><code class="k">{mark:'[PAUSA 2s]'}</code> o <code class="k">{mark:'[TONO ↑]'}</code> — marcas de interpretación.</li>
<li><code class="k">{ctx:'…'}</code> — contexto interno, no se lee al cliente.
Opcional por bloque: <code class="k">nat:{alt:[…], notas:[…], zona:'…'}</code> alimenta el botón 🇪🇸.</li></ul></div>
<div class="bloque"><h3>Añadir una objeción nueva en 4 pasos</h3>
<p>① Copie un bloque de <code class="k">OBJECTIONS</code> existente entero. ② Cambie la clave (sin espacios, p. ej. <code class="k">cambio_autonomo</code>) y el <code class="k">nombre</code>. ③ Rellene los 6 campos siguiendo el protocolo. ④ Guardar y recargar: aparece sola en el desplegable del árbol y en la pestaña de objeciones, y el Anexo 🧠 se regenera con sus mecanismos. Si algo falla, validación rápida: consola del navegador (F12) le dirá la línea rota.</p></div>`,
ej:`En una copia del archivo: cambie una frase del Motivo (ahora más pérdida), recargue el guion, abra el Anexo y confirme que las etiquetas del bloque Motivo han cambiado. Si lo logra, ya domina el ciclo editar–probar–verificar.`},

m10:{titulo:'Compliance — la parte que no se negocia', dur:'5 min', nivel:'básico', oblig:true,
va:['Los dos filtros previos: Robinson y consentimiento','Las prohibiciones absolutas y por qué son sansalvavidas','Qué hacer con los datos de las facturas (RGPD)'],
body:`
<div class="bloque"><h3>Antes de marcar, siempre</h3>
<p>① <b>Lista Robinson:</b> consulte IberU; si el número está inscrito, no se llama y punto. ② <b>Consentimiento:</b> si el lead no es propio, verifique que existe base para llamar; hoy no hay protocolo documentado, así que ante la duda, no llame y avise al responsable. ③ <b>Horario:</b> 9:00–13:30 y 16:30–20:00. ④ <b>Grabaciones:</b> hoy no se graban; cuando se activen, se informa al cliente al inicio.</p></div>
<div class="bloque"><h3>Prohibiciones absolutas</h3>
<ul><li>Precios concretos sin estudio previo (orientativos en %, sí; cifra cerrada, no).</li>
<li>Prometer permanencias… ni prometer quitarlas: se mira la fecha en la factura y ya.</li>
<li>Nombrar a la competencia, ni para bien ni para mal.</li>
<li>Decir «no puedo»: siempre «lo que sí hago es…».</li>
<li>Prometer lo no verificable: todo lo que el guion asegura existe (estudio gratis, emergencia 24h, oficinas de Sagunto y el Puerto).</li></ul>
<div class="ley-tip"><b>Cortafuegos</b>La persuasión de este guion viaja montada en verdades. La forma es neuro; el contenido, literal. Eso también es compliance.</div></div>
<div class="bloque"><h3>Facturas y datos (RGPD)</h3>
<p>La factura del cliente contiene datos sensibles: se pide por el canal acordado (WhatsApp o email), se usa solo para su estudio, no se reenvía a terceros fuera del equipo autorizado, se custodia con cuidado y se elimina cuando la finalidad se agota. Si el cliente pide no ser llamado: se anota y se cumple al instante.</p></div>`,
ej:`Clasifique estas seis frases en “permitida / prohibida”: ① «le quito la permanencia» · ② «el estudio es gratis» · ③ «entre un 10 y un 20 % suelen mejorar» · ④ «su compañía actual es un desastre» · ⑤ «no se graban llamadas» · ⑥ «mañana le digo el precio exacto sin ver nada». Solución: P, ✅, ✅, P, ✅, P.`},

m11:{titulo:'Evaluación final — la prueba de fuego', dur:'5 min', nivel:'básico', oblig:false,
va:['En qué consiste: quiz + casos prácticos','El criterio de aprobación','Qué hacer si no sale a la primera'],
body:`
<div class="bloque"><h3>Las dos pruebas</h3>
<p>① <b>Quiz:</b> 10 preguntas tipo test sobre mecánica de la herramienta, protocolo y compliance. Cada pregunta se autocorrige al instante con su justificación. ② <b>Casos prácticos:</b> 3 situaciones de llamada real donde elegir la respuesta, la objeción y el cierre correctos.</p></div>
<div class="bloque"><h3>Criterio de aprobación</h3>
<p>Aprobado con <b>${CONFIG.notaAprobado}/10</b> en el quiz y <b>3/3</b> en los casos. Si no sale: el resultado le dice qué módulos repasar (el quiz los referencia en cada justificación) y repite cuando quiera — el simulador no se cansa. Una vez aprobado, ya puede llamar con guion en la mano; la maestría llega con las primeras 50 llamadas.</p></div>`,
ej:`Pulse abajo el botón para ir al quiz. Y recuerde la regla madre mientras responde: emoción primero, dato después; cierre por elección; compliance por encima de todo.`}
};