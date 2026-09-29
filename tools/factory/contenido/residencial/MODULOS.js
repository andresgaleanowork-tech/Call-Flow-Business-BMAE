const MODULOS = {

m0:{titulo:'Bienvenida — para qué existe todo esto', dur:'5 min', nivel:'básico', oblig:true, prev:'guia',
va:['Para qué sirve el guion: vender a la tripa y justificar con la razón','Qué NO es: ni teletrólex ni sustituto de su criterio','Los tres principios que no se negocian jamás'],
body:`
<div class="bloque"><h3>Vender a la tripa, justificar con la razón</h3>
<p>El cliente de a pie no decide con una hoja de cálculo: decide con el susto de la última factura y con el alivio de pagar lo justo cada mes en su casa. Este guion habla primero a ese estómago —emoción, escena, pérdida actual— y luego da los números para que la cabeza firme lo que la tripa ya decidió. Así se llama a un hogar.</p></div>
<div class="bloque"><h3>Qué NO es</h3>
<p>No es un teletrólex: si lo lee como un robot, el cliente cuelga. Las frases son la partitura; usted pone la voz, las pausas y el oído. Y no sustituye su criterio: si el guion dice A y el cliente necesita B, manda el cliente. El guion es su mapa, no su jaula.</p></div>
<div class="bloque"><h3>Los tres principios irrenunciables</h3>
<ul><li><b>Emoción antes que dato.</b> Los primeros 30 segundos de cada bloque mueven una emoción, no un número.</li>
<li><b>Cierre por elección.</b> Nunca «¿le interesa?». Siempre A/B: canal, día, hora o modalidad.</li>
<li><b>Compliance por encima de todo.</b> Lista Robinson, horarios, verdades verificables. Una venta legal hoy vale más que diez dudosas mañana.</li></ul></div>
<div class="ejemplo"><b class="tag">Cómo se abre la herramienta</b><p>Mismo archivo, mismo guion residencial: doble clic o la URL publicada, con Chrome o Edge (Firefox también va). Funciona sin internet: guárdela en el escritorio y olvídese de contraseñas.</p></div>`,
ej:`Abra el guion, localice el botón «↺ Reiniciar», el banner ámbar de compliance y la pestaña 🇪🇸 Glosario. Después lea en voz alta la apertura del bloque 1 mirando una ventana. Si sonó a usted hablándole a un vecino, va bien.`},

m1:{titulo:'Tour por la interfaz — dónde está cada cosa', dur:'10 min', nivel:'básico', oblig:true,
va:['Los cuatro anclajes: cabecera, banner, progreso y paneles','Las 7 pestañas del panel derecho y para qué sirve cada una','El modal de «Datos de la llamada» y el color ámbar'],
body:`
<div class="bloque"><h3>La cabecera, de izquierda a derecha</h3>
<ul><li><b>🔬 Capa neuro:</b> muestra/oculta las etiquetas de todos los bloques a la vez (entrenamiento).</li>
<li><b>🎯 Foco:</b> esconde distracciones (avisos, progreso y pestañas extra) y agranda el discurso —el árbol sigue a la vista. Oro puro en vivo.</li>
<li><b>📋 Datos de la llamada:</b> el modal de 13 variables que personaliza el guion.</li>
<li><b>🧹 Limpiar datos:</b> borra los datos del cliente al acabar cada llamada (privacidad).</li>
<li><b>🎭 Roleplay y ↺ Reiniciar:</b> simulador y vuelta a empezar.</li></ul></div>
<div class="bloque"><h3>La barra de progreso</h3>
<p>Nueve fases: Apertura → Presentación → Motivo → Permiso → Detección → Pitch → Objeción → Cierre → Seguimiento. El punto de acento marca dónde está la llamada. Si se pierde, mire el punto: siempre le devuelve.</p></div>
<div class="bloque"><h3>Los dos paneles</h3>
<p>Izquierda: el <b>árbol</b> con los bloques y sus opciones (cada opción es «lo que dice el cliente»: púlsela y el discurso salta). Las opciones rojitas abren la objeción justa y le devuelven después al punto donde estaba. Derecha, siete pestañas — 🗣 Discurso, 🛡 Objeciones, 🤝 Cierre y seguimiento, 🧠 Anexo neuro, 🇪🇸 Glosario, 📈 KPIs, 🎭 Roleplay. En la llamada vivirá en la primera; el resto es escuela y consulta.</p></div>`,
ej:`Con el guion abierto: active 🎯 Foco y desactívelo; abra 📋 Datos y rellene solo tres variables (nombre, tipo de vivienda, ciudad); pulse una opción roja del árbol y vuelva con «⬅ Volver». Luego, capa neuro global ON y descubra las etiquetas.`},

m2:{titulo:'Preparar la llamada — compliance y ficha', dur:'8 min', nivel:'básico', oblig:true,
va:['Las tres comprobaciones legales antes de marcar','Rellenar el modal de datos con mínimo suficiente','El tono: pretérito perfecto, usted y silencios'],
body:`
<div class="bloque"><h3>Antes de marcar (no negociable)</h3>
<ul><li><b>Lista Robinson</b> comprobada en IberU para ese número.</li>
<li><b>Horario legal:</b> 9:00–13:30 y 16:30–20:00. Ni un minuto fuera.</li>
<li><b>Consentimiento razonable</b>: el lead tiene recorrido (IBERCRM, cliente, solicitud propia).</li></ul>
<p>Si falla una, no se marca. La duda siempre se resuelve a favor del cliente.</p></div>
<div class="bloque"><h3>El modal «📋 Datos de la llamada»</h3>
<p>Mínimo suficiente: nombre, tipo de vivienda, ciudad y factura aproximada si la sabe. El guion se rellena solo: [NOMBRE_CLIENTE], [CIUDAD] y compañía cambian cada frase. Datos guardados SOLO en su navegador; <b>🧹 Limpiar datos</b> al terminar = privacidad real con su icono de confirmación.</p></div>
<div class="bloque"><h3>La marca idiomática</h3>
<p>Usted toda la llamada. Pretérito perfecto («¿le ha subido?»). Tres veces su nombre como mínimo. Y después de cada pregunta: silencio de verdad. El que calla primero tras la pregunta, gana.</p></div>`,
ej:`Rellene el modal con un cliente ficticio («María, piso, Valencia, 95 €») y recorra el bloque 0 y la apertura viendo cómo se personalizan solas. Después, 🧹 Limpiar datos y compruebe que el icono confirma.`},

m3:{titulo:'Ejecutar la llamada — la mecánica exacta', dur:'12 min', nivel:'básico', oblig:true,
va:['El ciclo: leer 1 párrafo, escuchar, pulsar, repetir','Cómo usar el silencio y la vuelta atrás','Qué hacer si se equivoca de pulsación'],
body:`
<div class="bloque"><h3>El ciclo de oro</h3>
<p><b>Lea un párrafo</b> (el primero con marca), <b>escuche</b> lo que dice el cliente (de verdad, no pensando en su siguiente frase), <b>pulse</b> la opción del árbol que más se parezca a lo que oyó. Repita. Nada más. Si suena a conversación, va bien; si suena a lectura, usted está leyendo demasiado de una vez.</p></div>
<div class="bloque"><h3>El silencio como herramienta</h3>
<p>Tras cada pregunta del guion hay silencio marcado o implícito. Respételo: es donde el cliente decide y donde usted gana. Rellenarlo con «¿sí? ¿me oye?» destroza el mecanismo. Cuente tres segundos en su cabeza si le cuesta.</p></div>
<div class="bloque"><h3>Errores y retorno</h3>
<p>Pulsó mal: «⬅ Volver» le devuelve un paso sin drama. El guion no se rompe porque usted se equivoque de opción; se rompe solo si usted empieza a improvisar fuera de él sin querer. Reiniciar (↺) devuelve todo a «Antes de marcar».</p></div>`,
ej:`Pareja o solo: recorra apertura→presentación→motivo leyendo en voz alta y pulsando la opción correcta tras cada frase del «cliente». Cronometrado: si cada párrafo tarda más de 20 segundos, está leyendo demasiado.`},

m4:{titulo:'Objeciones — el protocolo de cuatro pasos', dur:'15 min', nivel:'intermedio', oblig:false,
va:['VALIDAR → DESACTIVAR → REENCUADRAR → AVANZAR','Las 15 objeciones residenciales y su truco','La 2ª ronda con regalo y la regla de los dos noes'],
body:`
<div class="bloque"><h3>El protocolo universal</h3>
<p>Validar («me alegro / le entiendo») → Desactivar («no vamos a tocar nada») → Reencuadrar (el truco) → Avanzar (una pregunta pequeña). Rebatir en frío sube el cortisol y cierra el oído; el protocolo lo abre. Cada objeción del guion viene con estas cuatro piezas ya escritas.</p></div>
<div class="bloque"><h3>Las 15 objeciones de hogar</h3>
<p>Ya estoy con Iberdrola · estoy contento · Iberdrola es cara · ¿es un timo? · no me interesa · no tengo tiempo · llámeme luego · mándeme un correo · me lo pienso · hablo con mi pareja · permanencia · ahora no puedo · ya me llamaron · no me cambio ni loco · tengo placas. La pestaña 🛡 Objeciones las tiene todas con protocolo + diálogo de muestra.</p></div>
<div class="bloque"><h3>2ª ronda y la regla de los noes</h3>
<p>Si insiste, pulse «2ª ronda»: argumento con REGALO (el estudio, la comparativa) y prueba social cercana. Después de dos noes claros, salida elegante (Peak-End): el no de hoy con buena imagen es el sí de dentro de tres meses. Jamás un tercer asalto.</p></div>`,
ej:`Elija tres objeciones al azar (desconfianza, mas_caro y la que más le cueste a usted) y lea el protocolo + diálogo en voz alta. Luego cierre el guion y repita el truco con sus palabras. Si sale, lo tiene.`},

m5:{titulo:'Cierres y seguimiento — ganar sin empujar', dur:'12 min', nivel:'intermedio', oblig:false,
va:['Los cuatro cierres posibles y cuándo usar cada uno','Cierre A/B nunca sí/no, y el Peak-End','El seguimiento: intriga, novedad y puerta abierta'],
body:`
<div class="bloque"><h3>Los cuatro cierres</h3>
<p>🗓 Cita (caliente, quiere verse) · 📄 Foto de la factura (tibio: el cierre por defecto) · ✍️ Activación directa (pregunta plazos, cero fricción) · ☀️ Visita del técnico (placas, aerotermia, cargador). Cualquiera de los cuatro gana la llamada: la venta vendrá después, con datos.</p></div>
<div class="bloque"><h3>A/B y Peak-End</h3>
<p>Nunca «¿le interesa?». Siempre «¿WhatsApp o correo?», «¿mañana o la semana que viene?», «¿solo o juntos?». Y que lo último que oiga sea bueno: el resumen del acuerdo, el halago sincero, la puerta abierta. La última impresión es la que trabaja cuando usted ya no está.</p></div>
<div class="bloque"><h3>Seguimiento que no aburre</h3>
<p>WhatsApp en menos de 5 minutos (anti-arrepentimiento). Cadencia: 24–48 h con novedad, 1 semana con caso parecido, 15 días, puerta abierta mensual. Jamás «¿lo pensó?» seco. Cada toque se apunta en la ficha: canal, fecha, hora, siguiente paso.</p></div>`,
ej:`Practique el Cierre B completo en voz alta (futuro, medio minuto, canal, hora de devolución) dos veces seguidas sin leer. Es el cierre que más usará: que salga solo.`},

m6:{titulo:'La capa neuro — leer los hilos', dur:'10 min', nivel:'intermedio', oblig:false,
va:['Qué son las 8 leyes y dónde se ven en el guion','Cuándo llevar la capa encendida y cuándo apagada','La checklist neuro de 10 puntos'],
body:`
<div class="bloque"><h3>Las 8 leyes en el Anexo neuro</h3>
<p>Pérdida actual · Sistema 1→2 · Zeigarnik (lo pendiente engancha) · Prueba social · Elección doble · Amenaza/cortisol ↓ · Peak-End · Reciprocidad. Cada etiqueta del guion (EN MAYÚSCULAS junto a la frase) dice qué ley está usando y por qué funciona. Está todo en la pestaña 🧠 Anexo neuro.</p></div>
<div class="bloque"><h3>ON en la escuela, OFF en la cancha</h3>
<p>Primera semana: capa neuro global ON para entrenar el ojo. En llamada real: 🔬 OFF salvo repaso previo. Las etiquetas son el andamiaje; la conversación es el edificio. Con el tiempo las notará aunque estén apagadas: eso es haberlas aprendido.</p></div>
<div class="bloque"><h3>Checklist neuro</h3>
<p>Diez preguntas no negociables por frase (emoción primero, ancla de pérdida, escena concreta, micro-síes, cierre A/B…). Revísala tras cada sesión de práctica: es el mantenimiento de su oído.</p></div>`,
ej:`Active 🔬 Capa neuro global y recorra apertura y pitch_ahorro leyendo SOLO las etiquetas. Luego diga la frase explicando en voz alta qué ley usa. Dos rondas: una leyendo, una sin leer.`},

m7:{titulo:'Roleplay — ensayo antes de la llamada real', dur:'10 min', nivel:'intermedio', oblig:false,
va:['Cómo funciona el simulador (decisiones y feedback)','Los dos escenarios: el de la factura-susto y la desconfiada','Cuántos roleplays antes de llamar en real'],
body:`
<div class="bloque"><h3>El simulador</h3>
<p>Pestaña 🎭 Roleplay: el cliente habla, usted elige la respuesta, el feedback le dice qué ley neuro aplicó o rompió y las claves idiomáticas. Verde: perfecto; amarillo: se puede mejorar; rojo: lea la lección — siempre hay otra opción para aprender.</p></div>
<div class="bloque"><h3>Los dos escenarios</h3>
<p>🌙 El de la factura-susto (cena a medias, dolor de precio, decisión en pareja) y 🕵️ La desconfiada quemada (timo anterior, solo se fía de lo que puede comprobar). Cubren el 80 % de lo que se encontrará: prisa doméstica y miedo al engaño.</p></div>
<div class="bloque"><h3>Cuántos antes de la real</h3>
<p>${CONFIG?CONFIG.roleplaysMinimos:2} roleplays completos como mínimo, con feedback positivo en la mayoría de pasos, antes de la primera llamada real. Y mejor con un compañero delante haciendo de cliente: el simulador ensaya la decisión; el compañero ensaya el oído.</p></div>`,
ej:`Pase los dos escenarios completos en el simulador. Si saca más de un rojo, repítalo mañana antes de llamar. Anote qué ley neuro le cuesta más: es su deber de la semana.`},

m8:{titulo:'KPIs — los números que le mejoran', dur:'8 min', nivel:'avanzado', oblig:false,
va:['Qué se anota cada día y cuándo','Las cuatro tasas y su lectura','El ritual del lunes con su responsable'],
body:`
<div class="bloque"><h3>Qué se anota</h3>
<p>Al final de cada jornada, en la pestaña 📈 KPIs: llamadas, contactos con cliente, estudios/citas conseguidos y altas. Cuatro números en dos minutos. Se guardan solo en su navegador.</p></div>
<div class="bloque"><h3>Las cuatro tasas</h3>
<p>La herramienta calcula sola: tasa de contacto, citas por contacto, cierre por cita y conversión global. La lectura manda: si el contacto es bajo, cambie franjas; si la cita cae, revise detección; si el cierre flojea, repase el M5.</p></div>
<div class="bloque"><h3>El ritual del lunes</h3>
<p>Foto a sus KPIs y a la reunión con el responsable. No es control: es diagnóstico. Un dato semanal vale más que mil sensaciones de «hoy iba bien».</p></div>`,
ej:`Rellene los cuatro campos de un día ficticio (20 llamadas, 12 contactos, 4 estudios, 1 alta) y observe las tasas que salen. Borre después con el reset de la pestaña.`},

m9:{titulo:'Editar la herramienta — normas de la casa', dur:'6 min', nivel:'avanzado', oblig:false,
va:['Dónde vive el contenido y qué se puede tocar','La regla de oro: edite sobre copia y pase el filtro idiomático','Quién coordina la versión oficial'],
body:`
<div class="bloque"><h3>Dónde vive todo</h3>
<p>El contenido está en el script final del propio HTML: el tutorial en las constantes de arriba (CONFIG, MODULOS, QUIZ…) y el guion en las del final (NODES, OBJECTIONS, cierres, glosario). Nada de servidores: es texto que puede editarse con cualquier editor.</p></div>
<div class="bloque"><h3>Editar sin romper</h3>
<p>Sobre una copia, siempre. Toda frase NUEVA del guion pasa antes por el filtro idiomático de la pestaña 🇪🇸 Glosario (¿suena a comercial español de verdad? ¿algún latinismo? ¿frase de folleto?). Y pase la batería de la carpeta <code class="k">tests</code> antes de publicar.</p></div>
<div class="bloque"><h3>La versión oficial</h3>
<p>El responsable coordina la versión del equipo para no multiplicar guiones distintos. Si cambia algo útil en su copia, propóngalo: las mejores frases del guion las escribieron los que llaman a diario.</p></div>`,
ej:`Localice en el código los tres bloques de datos del guion (NODES, OBJECTIONS, SCENARIOS) y lea su estructura. Sin editar nada: solo saber dónde están.`},

m10:{titulo:'Compliance — lo que nunca se toca', dur:'10 min', nivel:'básico', oblig:true,
va:['Lista Robinson y horario legal: las dos barreras','Verdades verificables y promesas prohibidas','Protección de datos y de personas vulnerables'],
body:`
<div class="bloque"><h3>Las dos barreras de entrada</h3>
<p>Lista Robinson en IberU antes de cada marcación, y horario 9:00–13:30 / 16:30–20:00. Si una falla o duda: no se llama. El «ya que estamos» no existe en compliance: ni una excepción, ni al mejor cliente.</p></div>
<div class="bloque"><h3>Verdad y promesas</h3>
<p>Solo verdades verificables: lo del estudio gratis, la revisión, la oficina, el 900 oficial. PROHIBIDO: prometer quitar permanencias, dar precios sin haber visto la factura, citar ahorros concretos que no salgan de su papel, presionar a mayores o a quien no entiende bien el castellano. A la mínima señal de vulnerabilidad: se llama con más calma o no se llama.</p></div>
<div class="bloque"><h3>Datos y privacidad</h3>
<p>Datos mínimos necesarios para el estudio; el cliente decide qué tapa de su factura y eso se respeta sin replicar. Los datos del modal viven solo en su navegador: 🧹 Limpiar datos al acabar cada llamada, siempre. Local y Limpiar son la base de la protección real.</p></div>`,
ej:`Consulte la checklist de compliance en la pestaña de práctica y léala en voz alta. Luego, tres preguntas rápidas sin mirar: ¿horario? ¿mínimo de datos? ¿qué hacemos si dudamos?`},

m11:{titulo:'Evaluación final — su sello de operativo', dur:'15 min', nivel:'intermedio', oblig:true, prev:'m10',
va:['El quiz de 10 preguntas (aprobado: '+(typeof CONFIG!=='undefined'?CONFIG.notaAprobado:8)+'/10)','Los 3 casos prácticos (aprobado: 3/3)','El acta de roleplay y el alta como operativo'],
body:`
<div class="bloque"><h3>Cómo se evalúa</h3>
<p>Tres pruebas, en cualquier orden, en la sección «Práctica y examen»: el quiz de conocimiento (10), los casos prácticos (3) y su acta de roleplay (2 escenarios con el feedback en acierto dominante). La nota de corte del quiz es la que marca la configuración del tutorial.</p></div>
<div class="bloque"><h3>Si suspende</h3>
<p>Nada grave, forma parte: repase el módulo que falle (el quiz dice cuál) y reintente. Nadie sale a llamar con dudas: es la protección del cliente y la suya.</p></div>
<div class="bloque"><h3>Cuando lo tenga</h3>
<p>Aviso al responsable → primera semana con capa neuro ON en la escuela y OFF en la cancha → revisión de KPIs el primer lunes. A partir de ahí, el guion es suyo y usted es del guion… hasta que lo domine y sea al revés.</p></div>`,
ej:`Haga el quiz ahora. Después los casos. Después avise a su responsable de que está listo para el roleplay presencial de validación.`}

};