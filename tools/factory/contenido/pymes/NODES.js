const NODES = {

inicio:{
  step:0, fase:'Preparación',
  titulo:'Antes de marcar — coger aire y tono (45 segundos)',
  script:[
    {ctx:'REGLA MADRE: al cliente no le entran las tarifas, le entran su miedo y su alivio. Los primeros 30 segundos de cada bloque son EMOCIÓN (Sistema 1). Los números llegan después, a justificar lo que la tripa ya decidió.'},
    {ctx:'Ficha: lead [TIPO_LEAD] · sector [SECTOR] · ciudad [CIUDAD]. Cliente de Iberdrola: lo tiene todo. Lead IBERCRM: faltan tarifa y compañía — se sacan en detección. IBERU: consumos previos. Lista Robinson mirada. Horario bien. Sonrisa puesta, que se oye. Usted no llama a pedir nada: llama a REGALAR un diagnóstico.'},
    {ctx:'Y hable como habla la calle: usted toda la llamada, frases cortas, pretérito perfecto ("¿le ha subido?", no "¿le subió?") y el nombre del cliente mínimo tres veces. Después de cada pregunta emocional: silencio. Que él rellene.'}
  ],
  notas:[
    'De pie o bien sentado: la voz cambia y se nota.',
    'Objetivo de la llamada: alta, factura recibida o cita. Uno de los tres y la llamada ha ganado.',
    'Usted no "vende": usted encuentra dinero dormido y devuelve tranquilidad.'
  ],
  micro:'Entrar con la cabeza bien puesta: emoción primero, dato después.',
  opciones:[
    {ico:'📞', cls:'ok', label:'Llamada en frío', sub:'Primer contacto con la empresa', next:'apertura'},
    {ico:'📥', cls:'ok', label:'Lead entrante', sub:'Ya mostró interés', next:'apertura'},
    {ico:'🔁', cls:'ok', label:'Cliente antiguo / seguimiento', sub:'Ya hubo relación o contacto', next:'apertura_retorno'},
    {ico:'📭', cls:'warn', label:'No coge / buzón', sub:'Dejarle con la miel en los labios', next:'no_contesta'}
  ]
},

apertura:{
  step:0, fase:'1 · Apertura',
  titulo:'Apertura — identidad + pérdida + ancla (primeros 20 segundos)',
  script:[
    {say:[
      {t:'«Buenos días, ¿hablo con [NOMBRE_CLIENTE]?»', n:'IDENTIDAD · MICRO-SÍ Nº1'},
      {mark:'[PAUSA 2s]'},
      {t:'«Le llamo del Departamento PYMES de Iberdrola.»', n:'AUTORIDAD · MERA EXPOSICIÓN'},
      {t:'«¿Le cojo en un mal momento? No se preocupe, no le robo más de un minuto.»', n:'CORTISOL ↓ · EMPATÍA · ESCASEZ'},
      {t:'«Fíjese en este dato: ocho de cada diez empresas de [SECTOR] están pagando de más cada mes…»', n:'FÍJESE · PRUEBA SOCIAL ESPECÍFICA · PÉRDIDA'},
      {t:'«…entre 800 y 1.500 €. Sin que nadie les avise, oiga.»', n:'ANCLA ALTA · PÉRDIDA ACTUAL'},
      {mark:'[PAUSA 2s]'},
      {mark:'[TONO ↑]'},
      {t:'«Dígame, [NOMBRE_CLIENTE]: su última factura, ¿le ha subido… o le ha subido mucho?»', n:'NOMBRE Nº2 · ELECCIÓN DOBLE · PRETÉRITO PERFECTO — ambas respuestas le meten en la conversación'}
    ]}
  ],
  nat:{
    alt:[
      '«Buenos días, ¿me pone con [NOMBRE_CLIENTE], por favor?» (si contesta un filtro)',
      '«Mire, no le quito ni un minuto: solo un dato y le dejo.»',
      '«¿Le pillo en buen momento para una cosita rápida?»'
    ],
    notas:[
      '«¿Le cojo en un mal momento?» es más empático que «¿tiene un momento?»: reconoce la molestia antes de que la nombre él, y eso desarma.',
      '«¿Le ha subido?» (pretérito perfecto) es marca de España. «¿Le subió?» suena a latino al momento.',
      '«Fíjese en este dato» capta atención sin sonar a teleoperador: es muletilla de calle, no de guion.',
      'No diga «llamo para ofrecerle…»: activa la alarma de venta y le cuelgan.'
    ],
    zona:'España (general). Válido en toda la península; sin rasgo valenciano marcado.'
  },
  notas:[
    'Los dos primeros segundos deciden la llamada: voz grave, ritmo lento, sonrisa.',
    'Ni una palabra de tarifas ni producto en la apertura. Solo identidad + pérdida.',
    'ESCUCHE el tono de la respuesta: curiosidad = siga el flujo; defensa = objeción directa.',
    'Si contesta un filtro: «¿Me pone con quien lleva el tema de la luz, por favor?» — amable y al grano.'
  ],
  micro:'Primer micro-sí (su nombre) + curiosidad abierta que él quiere cerrar.',
  opciones:[
    {ico:'✅', cls:'ok', label:'«Sí, soy yo, dígame»', sub:'Curiosidad activada', next:'presentacion'},
    {ico:'🤔', cls:'warn', label:'«¿De qué va esto? ¿Quién llama?»', next:'motivo'},
    {ico:'🙅', cls:'bad', label:'«Aquí el encargado no soy yo»', sub:'Filtro', obj:'no_decisor', resume:'apertura'},
    {ico:'⏰', cls:'bad', label:'«Ahora no puedo, ando liado»', obj:'tiempo', resume:'motivo'},
    {ico:'🚫', cls:'bad', label:'«No me interesa»', obj:'no_interesa', resume:'motivo'}
  ]
},

apertura_retorno:{
  step:0, fase:'1 · Apertura',
  titulo:'Apertura — cliente antiguo o seguimiento',
  script:[
    {say:[
      {t:'«[NOMBRE_CLIENTE], ¡qué alegría oírle otra vez!»', n:'FAMILIARIDAD · MERA EXPOSICIÓN · NOMBRE'},
      {t:'«Soy [NOMBRE_COMERCIAL], del Departamento PYMES de Iberdrola.»', n:'AUTORIDAD'},
      {t:'«Mire, desde la última vez que hablamos ha pasado una cosa con las empresas de [CIUDAD]…»', n:'ZEIGARNIK — frase a medias: el cerebro pide el cierre'},
      {mark:'[PAUSA 2s]'},
      {t:'«Las que revisaron la factura duermen tranquilas. Las que no… pues siguen soltando un pico cada mes.»', n:'CONTRASTE · PÉRDIDA ACTUAL · LENGUAJE DE CALLE'},
      {mark:'[TONO ↑]'},
      {t:'«¿Se lo cuento ahora en un minuto… o le dejo el resumen por WhatsApp y lo mira con calma?»', n:'ELECCIÓN A/B · MÍNIMO ESFUERZO'}
    ]}
  ],
  nat:{
    alt:[
      '«Le llamo para cerrar lo que dejamos a medias.»',
      '«Cuando hablamos quedó una cosa pendiente… y tiene arreglo fácil.»'
    ],
    notas:[
      '«Oírle otra vez» es más telefónico y cálido que «saludarle de nuevo».',
      '«Soltar un pico» = perder una cantidad importante de dinero (coloquial, España). Úselo, que pinta la pérdida sin técnica.',
      '«Con calma» ofrece la escapatoria tranquila: elección A/B donde las dos le traen de vuelta.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Retome EXACTAMENTE donde quedó la última conversación: lo inacabado tira del cliente (su factura pendiente es su aliada).',
    'Nada de remover el pasado ni disculparse: mire al alivio de ahora.',
    'La palabra clave de este bloque es "otra vez": usted ya no es un desconocido.'
  ],
  micro:'Reactivar la familiaridad y reabrir la conversación con curiosidad sana.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Receptivo, recuerda el contacto', next:'motivo'},
    {ico:'🙂', cls:'warn', label:'«Ah, sí… ¿y qué hay?»', sub:'Tibio', next:'motivo'},
    {ico:'🚫', cls:'bad', label:'«Ya me lo pienso / ahora no»', obj:'lo_pienso', resume:'motivo'}
  ]
},

no_contesta:{
  step:8, fase:'Seguimiento',
  titulo:'No coge — dejarle con la miel en los labios (Zeigarnik puro)',
  script:[
    {say:[
      {t:'«Buenos días, [NOMBRE_CLIENTE]. Soy [NOMBRE_COMERCIAL], del Departamento PYMES de Iberdrola.»', n:'NOMBRE · AUTORIDAD'},
      {t:'«Le llamo por una cosa que están descubriendo las empresas de [CIUDAD]… y que a usted le interesa, fíjese.»', n:'ZEIGARNIK · PRUEBA SOCIAL — no lo cuente entero: la intriga le hace devolver la llamada'},
      {t:'«Ahora le dejo un WhatsApp y mañana lo hablamos en dos minutos. Que le vaya bien.»', n:'MÍNIMO ESFUERZO · DESPEDIDA ESPAÑOLA'}
    ]},
    {ctx:'WhatsApp inmediato: «Buenas, [NOMBRE_CLIENTE]. Soy [NOMBRE_COMERCIAL], del Dpto. PYMES de Iberdrola 👋 Le he llamado por una cosa que están descubriendo las empresas de [CIUDAD]… Cuando tenga 2 minutos, se lo cuento. Saludos.» Ni tarifas ni números: solo intriga.'}
  ],
  nat:{
    alt:[
      '«Cuando tenga un momentito, me tiene por aquí.»',
      '«Que vaya muy bien, ¿eh? Hasta mañana.»'
    ],
    notas:[
      '«Que le vaya bien» es la despedida telefónica estándar en España. Jamás «que tenga un excelente día» (doblaje puro).',
      '«Lo hablamos» con dativo es el español oral de toda la vida.',
      '«Buenas» es el saludo natural de WhatsApp: ni «Buen día» (formal raro) ni «Hola» a secas (seco).'
    ],
    zona:'España (general).'
  },
  notas:[
    'Reintente en otra franja: si llamó a las 10, pruebe a las 12:30 o a las 17:00.',
    'Máximo 3 intentos espaciados; luego, puerta abierta mensual.',
    'Nunca cuente el motivo completo por escrito: el misterio es el anzuelo.'
  ],
  micro:'Que le quede una pregunta abierta en la cabeza y un canal directo suyo.',
  opciones:[
    {ico:'📆', cls:'ok', label:'Anotar reintento y reiniciar', next:'inicio'},
    {ico:'✉️', cls:'warn', label:'Ver plantillas de seguimiento', next:'seguimiento'}
  ]
},

presentacion:{
  step:1, fase:'2 · Presentación',
  titulo:'Presentación — autoridad, regalo y control (tres frases)',
  script:[
    {say:[
      {t:'«Mire, se lo cuento rapidísimo, en tres frases.»', n:'REGLA DEL 3 · MIRE…'},
      {t:'«Uno: soy el encargado del Departamento PYMES de Iberdrola en Valencia.»', n:'AUTORIDAD'},
      {t:'«Dos: mi trabajo es regalarle el diagnóstico de su factura. Gratis total.»', n:'RECIPROCIDAD · GRATIS'},
      {t:'«Tres: sin compromiso ninguno. Sin tocar nada. Usted manda.»', n:'CORTISOL ↓ · CONTROL AL CLIENTE'},
      {mark:'[PAUSA 2s]'},
      {mark:'[TONO ↑]'},
      {t:'«¿Y si le dijera que en su factura tiene dinero suyo… dormido?»', n:'CONDICIONAL HIPNÓTICA · PÉRDIDA · ZEIGARNIK — el «¿y si…?» abre la escena sin pedir sí/no'}
    ]}
  ],
  nat:{
    alt:[
      '«Le cuento en dos líneas quién soy y qué le traigo.»',
      '«Voy al grano, que sé que está usted liado.»'
    ],
    notas:[
      '«Gratis total» y «sin compromiso ninguno» son refuerzos dobles muy de España: niegan con énfasis sin sonar a guion.',
      '«Usted manda» devuelve el control y baja las defensas: en España funciona mejor que «usted decide» (más de manual).',
      '«Rapidísimo» promete brevedad oral; «en tres frases» pone el final a la vista.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Las tres frases caen seguidas, como cuenta atrás. Tono bajo en «usted manda»: es la palabra de seguridad del bloque.',
    'ESCUCHE: un «¿dormido?» o un silencio interesado = luz verde.',
    'Si ya conoce B&M, puede nombrarla; si no, mantenga solo Iberdrola. Nunca diga «comercial» ni «vendedor».'
  ],
  micro:'Autoridad puesta, amenaza a cero y primera imagen mental (dinero dormido).',
  opciones:[
    {ico:'👂', cls:'ok', label:'Escucha, le deja seguir', next:'motivo'},
    {ico:'🤔', cls:'warn', label:'«Vale… ¿y usted qué quiere?»', sub:'Impaciente', next:'motivo'},
    {ico:'🕵️', cls:'bad', label:'«¿Esto es para venderme algo?»', obj:'desconfianza', resume:'motivo'},
    {ico:'📅', cls:'bad', label:'«Estoy atado, tengo permanencia»', obj:'permanencia', resume:'motivo'}
  ]
},

motivo:{
  step:2, fase:'3 · Motivo',
  titulo:'Motivo — la fuga de todos los meses (emoción primero, cifra después)',
  script:[
    {say:[
      {t:'«Le digo una cosa, [NOMBRE_CLIENTE]…»', n:'CONFIDENCIA · NOMBRE'},
      {t:'«En [CIUDAD] hay empresas como la suya regalando dinero todos los meses.»', n:'PÉRDIDA ACTUAL'},
      {t:'«Entre un diez y un veinte por ciento de cada factura. Mes sí, mes también.»', n:'ANCLA % · PÉRDIDA · “mes sí, mes también” = cada mes sin fallo'},
      {t:'«No porque quieran, ojo. Porque nadie les avisa.»', n:'INJUSTICIA · “ojo” = matiz oral español'},
      {mark:'[PAUSA 2s]'},
      {t:'«Ahora imagínese ese dinero volviendo a su caja cada mes.»', n:'FUTURE PACING · ALIVIO · ESCENARIO'},
      {mark:'[TONO ↓] — baje la voz: seguridad'},
      {mark:'[TONO ↑] — suba para la pregunta'},
      {t:'«¿Usted en qué lo gastaría: en la empresa… o en usted?»', n:'ELECCIÓN A/B · ESCENARIO DE DESEO'}
    ]},
    {ctx:'Los kilovatios, las potencias y la tarifa NO van aquí. Llegan en el pitch, con su factura delante: el Sistema 2 justificando lo que la tripa ya decidió.'}
  ],
  nat:{
    alt:[
      '«Mire, le voy a ser sincero…»',
      '«Verá, le pongo en situación rapidísimo…»'
    ],
    notas:[
      '«Mes sí, mes también» es la forma española de decir «todos los meses sin excepción». Muy natural.',
      '«Ojo» matiza y da cercanía; se usa una vez, no tres.',
      '«Le digo una cosa» abre confidencia: el cliente baja el volumen mental y escucha.',
      '«Empresas como la suya» suena mejor que «su tipo de negocio» (frío, de manual).'
    ],
    zona:'España (general).'
  },
  notas:[
    'Frases cortas, máximo 12 palabras. Si se enreda, respire y baje el ritmo: el ritmo lento suena a verdad.',
    'La pausa tras «nadie les avisa» es obligatoria: ahí nace el enfado sano que mueve al cliente.',
    'ESCUCHE: si suelta «pues pagué cuatrocientos y pico…», tiene el dolor etiquetado: PRECIO.'
  ],
  micro:'Abrir la herida (pérdida) y cerrarla con alivio imaginado. La curiosidad le lleva solo al permiso.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Interés: «A ver, cuénteme»', next:'permiso'},
    {ico:'😐', cls:'warn', label:'Silencio / duda', sub:'Pida permiso igualmente', next:'permiso'},
    {ico:'🏢', cls:'bad', label:'«Ya tengo compañía»', obj:'ya_tengo', resume:'permiso'},
    {ico:'💸', cls:'bad', label:'«Si es que Iberdrola es cara»', obj:'mas_caro', resume:'permiso'},
    {ico:'😊', cls:'bad', label:'«Yo estoy contento con la mía»', obj:'contento', resume:'permiso'},
    {ico:'🚫', cls:'bad', label:'«No me interesa»', obj:'no_interesa', resume:'permiso'},
    {ico:'⏰', cls:'bad', label:'«No tengo tiempo / luego»', obj:'tiempo', resume:'permiso'}
  ]
},

permiso:{
  step:3, fase:'4 · Permiso',
  titulo:'Permiso — tres preguntas y ya está (micro-síes encadenados)',
  script:[
    {say:[
      {t:'«Le hago tres preguntas rápidas y ya está, [NOMBRE_CLIENTE].»', n:'REGLA DEL 3 · “y ya está” · NOMBRE'},
      {t:'«Con eso le digo, gratis, si es su caso o no.»', n:'RECIPROCIDAD · GRATIS'},
      {t:'«¿Le viene bien? Son dos minutos.»', n:'MICRO-SÍ Nº2 · YES-SET'},
      {mark:'[PAUSA 2s]'},
      {t:'«¿Empezamos por la última factura… o le cuento antes el tema de las potencias?»', n:'ELECCIÓN A/B — las dos abren la detección'}
    ]}
  ],
  nat:{
    alt:[
      '«Una cosita rápida y le dejo, ¿le parece?»',
      '«Dos preguntas y cerramos el círculo.»'
    ],
    notas:[
      '«Y ya está» minimiza la petición: es el diminutivo funcional español por excelencia.',
      '«¿Le viene bien?» es la fórmula española de pedir paso sin agobiar. No abuse: una vez por bloque.',
      '«El tema de las potencias» suena mejor que «la optimización de potencias contratadas» (eslogan, no calle).'
    ],
    zona:'España (general).'
  },
  notas:[
    'El yes-set ya va cargado: nombre (sí), escuchó el motivo (sí), «¿le viene bien?» (sí). Cada sí empuja al siguiente.',
    'Si dice que no: «Sin problema: se lo resumo en veinte segundos y usted decide con datos.» — jamás «¿puedo…?».'
  ],
  micro:'Permiso concedido por elección, no por petición.',
  opciones:[
    {ico:'✅', cls:'ok', label:'«Sí, venga, dígame»', sub:'Permiso concedido', next:'deteccion'},
    {ico:'⚡', cls:'warn', label:'«Que sea rápido, ¿eh?»', sub:'Detección exprés: importe y compañía', next:'deteccion'},
    {ico:'🚫', cls:'bad', label:'«Mire, ahora no»', obj:'momento', resume:'cierre_hub'},
    {ico:'✉️', cls:'bad', label:'«Mándeme un correo»', obj:'email', resume:'cierre_hub'}
  ]
},

deteccion:{
  step:4, fase:'5 · Detección',
  titulo:'Detección — dar antes de pedir: tres datos, tres porqués',
  script:[
    {ctx:'Regla: primero dé algo y luego pida (reciprocidad). Cada dato se pide como favor que le conviene A ÉL, no como necesidad suya. De uno en uno. Y después de preguntar: silencio, que él rellena.'},
    {say:[
      {t:'«Mire, primero le regalo un dato, [NOMBRE_CLIENTE]: el dinero dormido casi siempre está en las potencias.»', n:'DAR ANTES DE PEDIR · NOMBRE · ZEIGARNIK'},
      {mark:'[PAUSA 2s]'},
      {t:'«Lo primero, que es lo fácil: la factura del mes pasado. ¿Cuánto fue, más o menos?»', n:'MICRO-DECISIÓN · ABIERTA · “más o menos” = matizador español'},
      {t:'«Se lo digo para que el ahorro sea de verdad, no de boquilla.»', n:'JUSTIFICACIÓN-BENEFICIO · HONESTIDAD'},
      {t:'«Lo segundo: ¿con quién tiene la luz ahora mismo?»', n:'ABIERTA — anótela en [COMERCIALIZADORA_ACTUAL] y NO la nombre jamás en voz alta'},
      {t:'«Y lo tercero: ¿le han mirado las potencias alguna vez?»', n:'ABIERTA · PRETÉRITO PERFECTO · SIEMBRA DE DUDA'},
      {t:'«Si no lo tiene claro… normalmente ahí está el pico.»', n:'PÉRDIDA · ZEIGARNIK — la duda trabaja para usted'}
    ]},
    {ctx:'Bonus (abre ingeniería B&M): «Y ya de paso, curiosidad mía: ¿el local es suyo o de alquiler?» — local propio + factura alta = visita técnica casi segura.'}
  ],
  nat:{
    alt:[
      '«¿Me lo puede decir así, a ojo?»',
      '«¿Tiene la factura a mano o se la pido luego?»'
    ],
    notas:[
      '«A ojo» y «más o menos» quitan presión al número: el cliente redondea sin miedo.',
      '«De boquilla» = de palabra, sin realidad. Muy español, y pinta la diferencia entre hablar y demostrar.',
      '«La luz» es como habla todo dueño de PYME. Nadie en un bar dice «el suministro eléctrico».',
      '«¿Tiene la factura a mano o se la pido luego?» es la forma española de pedir sin presionar.'
    ],
    zona:'España (general). Léxico PYME real.'
  },
  notas:[
    'Anote TODO en los campos […]: importe, compañía, potencias y el dolor con sus palabras («pago un pastón», «se va la luz», «llamé y nada»).',
    'La emoción importa más que la cifra: etiquete el dolor: PRECIO / SERVICIO / MIEDO A AVERÍAS.',
    'Si no sabe sus datos: mejor todavía — la factura es su mini-cierre. No insista tres veces.'
  ],
  micro:'Tres datos anotados + dolor etiquetado + ya está colaborando (primera concesión).',
  opciones:[
    {ico:'💶', cls:'ok', label:'Dolor de PRECIO: «pago un pastón»', sub:'Pitch de la fuga', next:'pitch_ahorro'},
    {ico:'⚡', cls:'ok', label:'Dolor de SERVICIO: cortes, averías, mala atención', sub:'Pitch de la tranquilidad', next:'pitch_valor'},
    {ico:'😊', cls:'warn', label:'Sin dolor: está contento con todo', next:'pitch_valor'},
    {ico:'🔁', cls:'ok', label:'Estuvo antes en Iberdrola', next:'pitch_retorno'},
    {ico:'❓', cls:'warn', label:'«Ni idea, no llevo eso»', sub:'Pedir factura = mini-cierre', next:'cierre_facturas'},
    {ico:'🚫', cls:'bad', label:'Le sale una objeción aquí', sub:'Ábrala en el desplegable de abajo', next:'deteccion', keepObj:true}
  ]
},

pitch_ahorro:{
  step:5, fase:'6 · Pitch',
  titulo:'Pitch de la FUGA — para el que paga de más',
  script:[
    {ctx:'Tres emociones: pérdida, alivio y orgullo. Luego la historia. Luego la elección. Los kilovatios que los cuente la factura, no usted.'},
    {say:[
      {t:'«Le digo una cosa, [NOMBRE_CLIENTE]: tres puntos y acabo.»', n:'NOMBRE Nº3 · REGLA DEL 3'},
      {t:'«Uno: hoy está pagando cosas que no usa. Todos los meses.»', n:'PÉRDIDA ACTUAL'},
      {t:'«Dos: mi equipo de ingeniería lo encuentra y le dice exactamente cuánto es. En euros.»', n:'ALIVIO · EXPERTICIA'},
      {t:'«Tres: los que ya lo han hecho ahora miran la caja de otra manera.»', n:'ORGULLO · PRUEBA SOCIAL · PRETÉRITO PERFECTO'},
      {mark:'[PAUSA 2s]'},
      {t:'«Fíjese: hace un par de meses estuve con un [SECTOR] de por aquí, a cuatro calles.»', n:'STORYTELLING · MISMO SECTOR · MISMA ZONA'},
      {t:'«Se le iban casi 400 € al mes en potencias. Un pastón. Lo encontramos en una tarde.»', n:'ANCLA · PÉRDIDA RECUPERADA · lenguaje de calle medido'},
      {t:'«Ahora ese dinero se queda en su casa. Donde tiene que estar.»', n:'ALIVIO · PEAK'},
      {t:'«Y mire, se lo digo de corazón: si no hay nada que encontrar, se lo digo a la cara.»', n:'HONESTIDAD · CONFIANZA · “de corazón / a la cara”'},
      {mark:'[TONO ↓]'},
      {mark:'[TONO ↑]'},
      {t:'«¿Qué le tira más: el ahorro de cada mes… o dormir tranquilo?»', n:'ELECCIÓN DOBLE · “tirar” = atraer (coloquial)'},
      {t:'«Y para empezar solo hace falta una cosita: una foto de su factura.»', n:'MÍNIMO ESFUERZO · DIMINUTIVO SOCIAL'},
      {t:'«¿Por WhatsApp o por correo? Como le venga mejor.»', n:'ELECCIÓN A/B DE CANAL'}
    ]}
  ],
  nat:{
    alt:[
      '«Y aquí viene lo bueno…» (para volver sobre el beneficio)',
      '«Le hago un resumen de tres líneas.»',
      '«¿Cuál de las dos le pesa más?» (variante de la elección)'
    ],
    notas:[
      '«¿Qué le tira más?» = qué le motiva más. Coloquial pero profesional; en España suena a conversación de verdad.',
      '«De por aquí, a cuatro calles» crea cercanía territorial: la prueba social que de verdad muerde es la del vecino.',
      '«Pastón» úselo UNA vez por llamada como mucho: marca el registro sin caer en vulgaridad.',
      '«Se lo digo de corazón» + «a la cara» es la doble firma de honestidad española.'
    ],
    zona:'España (general). “De por aquí” personalícelo con su zona real.'
  },
  notas:[
    'Repita SU cifra y SU sector: eso separa una conversación de un guion.',
    'La historia dura 15-20 segundos: protagonista parecido, número concreto, final feliz.',
    'ESCUCHE: un «¿y eso cómo lo veis?» es el Sistema 2 pidiendo justificación. Entregue el estudio, no la teoría.',
    'Orientativo sí, promesa no: jamás una cifra cerrada de SU caso antes de ver la factura.'
  ],
  micro:'Decisión emocional tomada + petición mínima (una foto) con elección de canal.',
  opciones:[
    {ico:'📄', cls:'ok', label:'«Venga, le mando la factura»', sub:'Mini-cierre logrado', next:'cierre_facturas'},
    {ico:'🗓', cls:'ok', label:'«Mejor lo vemos en persona»', next:'cierre_cita'},
    {ico:'✍️', cls:'ok', label:'«Si sale bien, lo activo ya»', next:'cierre_alta'},
    {ico:'💸', cls:'bad', label:'«¿Y cuánto me ahorro, exactamente?»', sub:'No dé la cifra: reencauce al estudio', obj:'mas_caro', resume:'cierre_hub'},
    {ico:'🤷', cls:'bad', label:'«Ya me lo pienso»', obj:'lo_pienso', resume:'cierre_hub'},
    {ico:'🔄', cls:'bad', label:'«No quiero moverme de donde estoy»', obj:'no_cambiar', resume:'cierre_hub'}
  ]
},

pitch_valor:{
  step:5, fase:'6 · Pitch',
  titulo:'Pitch de la TRANQUILIDAD — el sábado a las ocho y media',
  script:[
    {ctx:'Para el contento o el que sufre averías. Técnica: abrir una herida imaginada (escena concreta) y cerrarla con alivio exclusivo. Miedo medido, nunca terror: con el cortisol alto no se compra, se huye.'},
    {say:[
      {t:'«Me alegro un montón de que le vaya bien, [NOMBRE_CLIENTE]. De verdad.»', n:'VALIDACIÓN · NOMBRE'},
      {t:'«Ahora déjeme ponerle una escena. Solo una.»', n:'ZEIGARNIK · PREPARA EL ESCENARIO'},
      {t:'«Sábado. Las ocho y media de la tarde. Se va la luz.»', n:'ESCENARIO SENSORIAL · MIEDO MEDIDO'},
      {t:'«La cámara frigorífica. El horno. El compresor. Todo parado.»', n:'SENSORIAL · ADAPTADO A SU SECTOR [SECTOR]'},
      {mark:'[PAUSA 2s] — déjele vivir la escena'},
      {mark:'[TONO ↑]'},
      {t:'«¿A quién llama usted ese día… y quién le coge el teléfono?»', n:'ABIERTA · “coger el teléfono” = atender (España) — que la responda él: su respuesta es el argumento'},
      {mark:'[PAUSA 2s]'},
      {t:'«Con nosotros le coge el teléfono una persona de verdad. Y sale un técnico de la casa. A cualquier hora. Veinticuatro.»', n:'ALIVIO · EXCLUSIVO'},
      {t:'«Eso hoy no se lo da nadie. Nadie.»', n:'EXCLUSIVIDAD · refuerzo doble'},
      {t:'«Usted se ha dejado la piel en esa empresa. Se merece dormir tranquilo.»', n:'ORGULLO · IDENTIDAD · “dejarse la piel”'},
      {mark:'[TONO ↓]'},
      {t:'«¿Empezamos por el estudio gratis de la factura… o le presento primero al gestor que llevaría su zona?»', n:'ELECCIÓN A/B · GRATIS · PERSONAL'}
    ]}
  ],
  nat:{
    alt:[
      '«Póngase en lo peor un segundo: un sábado por la noche sin luz.»',
      '«Piense en su cámara un día de agosto sin luz.»'
    ],
    notas:[
      '«Coger el teléfono» es la expresión española para atender una llamada. «Contestar el teléfono» suena a traducción.',
      '«De la casa» = propio, del equipo. Muy usado en España: «un técnico de la casa».',
      '«Dejarse la piel» conecta con el esfuerzo real del dueño de PYME: se siente visto, no vendido.',
      '«Un montón» es informal pero cálido; encaja aquí porque sigue a una emoción positiva.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Adapte la escena a su sector: horno en panadería, cámara en restaurante, máquina en taller, clima en clínica.',
    'El silencio tras «¿quién le coge el teléfono?» es el corazón del bloque. No lo rellene usted.',
    'Si YA sufrió un apagón: es oro. «¿Y cuánto le costó aquel día?» y silencio.'
  ],
  micro:'El cliente ve el riesgo con sus ojos y le asocia a usted como la salida exclusiva.',
  opciones:[
    {ico:'📄', cls:'ok', label:'Acepta mandar la factura', next:'cierre_facturas'},
    {ico:'🗓', cls:'ok', label:'Prefiere verse en persona', next:'cierre_cita'},
    {ico:'🔧', cls:'ok', label:'Le interesa lo técnico (cuadros, placas, averías)', next:'cierre_tecnico'},
    {ico:'😊', cls:'bad', label:'Insiste: «de verdad que estoy bien»', obj:'contento', resume:'cierre_hub'},
    {ico:'🤷', cls:'bad', label:'«Ya me lo pienso»', obj:'lo_pienso', resume:'cierre_hub'}
  ]
},

pitch_retorno:{
  step:5, fase:'6 · Pitch',
  titulo:'Pitch del RETORNO — quien vuelve, vuelve a dormir tranquilo',
  script:[
    {say:[
      {t:'«[NOMBRE_CLIENTE], usted ya nos conoce de antes. Eso juega a favor.»', n:'FAMILIARIDAD · MERA EXPOSICIÓN · NOMBRE'},
      {t:'«Y le hablo claro: quien vuelve, vuelve por una cosa.»', n:'ZEIGARNIK'},
      {mark:'[PAUSA 2s]'},
      {t:'«Por dormir tranquilo. Por saber que al otro lado hay alguien.»', n:'ALIVIO'},
      {t:'«Hace tres meses volvió un [SECTOR] de por aquí.»', n:'STORYTELLING · MISMO SECTOR'},
      {t:'«Me soltó una frase que se me quedó: “no sabes lo que tienes hasta que lo pierdes”.»', n:'PÉRDIDA VIVIDA · PEAK · cita literal = verdad oral'},
      {t:'«Ahora además está el Departamento PYMES aquí en Valencia. Gestor personal. Emergencia veinticuatro horas.»', n:'EXCLUSIVO · NOVEDAD'},
      {t:'«Imagíneselo: la factura controlada… y un teléfono que siempre coge alguien.»', n:'FUTURE PACING · ALIVIO'},
      {mark:'[TONO ↑]'},
      {t:'«¿Retomamos con una foto de la factura… o nos vemos esta semana y listo?»', n:'ELECCIÓN A/B · “y listo” = cierre ágil español'}
    ]}
  ],
  nat:{
    alt:[
      '«Le voy a hablar con franqueza…»',
      '«A ver si le convenzo con un dato…»'
    ],
    notas:[
      'Citar literal («me soltó una frase que se me quedó») da veracidad: nadie se inventa una cita tan de bar.',
      '«Y listo» al final es cierre coloquial español: corta con ligereza después de la elección.',
      '«De antes» marca que hay historia: usted no es un desconocido, es un viejo conocido.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Nada de remover por qué se fue. El pasado duele y no vende; el alivio de hoy, sí.',
    'Si saca una mala experiencia: «tiene usted razón, eso no debió pasar» y gire al gestor personal de ahora.',
    'Mera exposición: repita Iberdrola y su nombre con naturalidad. Lo conocido da seguridad.'
  ],
  micro:'Reactivar su decisión pasada como prueba de que la de hoy es segura.',
  opciones:[
    {ico:'📄', cls:'ok', label:'Acepta mandar la factura', next:'cierre_facturas'},
    {ico:'🗓', cls:'ok', label:'Acepta verse en persona', next:'cierre_cita'},
    {ico:'🕵️', cls:'bad', label:'Mala experiencia pasada / «no me fío»', obj:'desconfianza', resume:'cierre_hub'},
    {ico:'💸', cls:'bad', label:'«Me fui por el precio, oiga»', obj:'mas_caro', resume:'cierre_hub'}
  ]
},

cierre_hub:{
  step:7, fase:'8 · Cierre',
  titulo:'Cierre — el pico emocional y la elección (nunca el sí/no)',
  script:[
    {ctx:'Dos reglas de hierro: 1) el cierre siempre es A/B (esto o lo otro), nunca de sí o no. 2) Peak-End: lo último que oye es lo que se lleva. Pique la emoción buena y cierre limpio, sin paja.'},
    {ctx:'Éxito = factura en camino · cita cerrada · alta activada · visita técnica apuntada. Cualquiera de las cuatro gana la llamada. Que repita el acuerdo en voz alta y mándele el resumen por WhatsApp en menos de 5 minutos.'}
  ],
  notas:[
    'Cliente caliente (pregunta plazos, pide números) → alta o cita esta misma semana.',
    'Cliente tibio (interesado pero liado) → factura por WhatsApp + llamada en 24–48 h.',
    'Cliente técnico (placas, cuadros, 6.1TD) → visita del ingeniero.',
    'Si el cliente calla después de usted: calle usted también. El silencio cierra.'
  ],
  micro:'UN compromiso concreto: día, hora, canal y confirmación en voz alta.',
  opciones:[
    {ico:'🗓', cls:'ok', label:'Cierre A: Cita presencial', next:'cierre_cita'},
    {ico:'📄', cls:'ok', label:'Cierre B: La foto de la factura', next:'cierre_facturas'},
    {ico:'✍️', cls:'ok', label:'Cierre C: Activación directa', next:'cierre_alta'},
    {ico:'🔧', cls:'ok', label:'Cierre D: Visita del técnico', next:'cierre_tecnico'},
    {ico:'🚪', cls:'warn', label:'No hay cierre posible', sub:'Salida elegante con imagen final', next:'retirada'}
  ]
},

cierre_cita:{
  step:7, fase:'8 · Cierre A',
  titulo:'Cierre A — Quedar en persona (escena + elección doble)',
  script:[
    {say:[
      {t:'«Póngase en la escena: su factura encima de la mesa.»', n:'ESCENARIO SENSORIAL'},
      {t:'«Un cuarto de hora… y sale sabiendo cuánto dinero suyo hay dormido.»', n:'PICO EMOCIONAL · “un cuarto de hora” (España)'},
      {t:'«Y sin compromiso ninguno: si no hay nada, se lo digo y nos damos la mano.»', n:'CORTISOL ↓ · HONESTIDAD'},
      {mark:'[TONO ↑]'},
      {t:'«¿Le viene mejor mañana a primera hora en su negocio… o por la tarde en la oficina del Puerto?»', n:'ELECCIÓN DOBLE (hora × lugar)'},
      {mark:'[PAUSA 2s]'},
      {t:'«Pues quedamos así, [NOMBRE_CLIENTE]. Dígamelo usted también: quedamos así.»', n:'COMPROMISO EN VOZ ALTA · “quedamos así” = EL cierre español'},
      {t:'«Ahora mismo le mando el WhatsApp con el día y la hora, para que lo tenga por escrito.»', n:'RESUMEN <5 MIN · “ahora mismo”'}
    ]},
    {ctx:'Lleve a la cita: el estudio previo si lo hay, la documentación por si acelera, y el detalle de bienvenida (merchandising): entrar regalando multiplica la reciprocidad.'}
  ],
  nat:{
    alt:[
      '«¿Qué día le cuadra mejor: martes o miércoles?»',
      '«Paso a verle yo, que así conozco la casa.»'
    ],
    notas:[
      '«Pues quedamos así» es EL cierre de acuerdos en España. «¿Confirmamos?» suena a call center.',
      '«Ahora mismo» = inmediatamente. Nunca «en un rato» (latinismo).',
      '«Un cuarto de hora» más natural que «quince minutos» en conversación.',
      '«¿Le cuadra?» es la pregunta de agenda española por antonomasia.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Proponga usted día y hora: llevar el calendario da seguridad.',
    'El WhatsApp de confirmación quita los plantones a la mitad. No lo negocie.',
    'Peak-End: despídase con la imagen del alivio, no con trámites.'
  ],
  micro:'Cita con día, hora y lugar, repetida por el cliente y escrita en WhatsApp.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Cita cerrada y confirmada', sub:'A seguimiento', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Antes quiere mandar la factura', next:'cierre_facturas'},
    {ico:'🚪', cls:'warn', label:'No termina de concretar', next:'retirada'}
  ]
},

cierre_facturas:{
  step:7, fase:'8 · Cierre B',
  titulo:'Cierre B — La foto (mañana a esta hora, en euros)',
  script:[
    {say:[
      {t:'«Imagíneselo: mañana, a esta misma hora.»', n:'FUTURE PACING'},
      {t:'«Abre el móvil… y ve en euros lo que le cuesta no mirarlo.»', n:'PICO EMOCIONAL · PÉRDIDA ACTUAL'},
      {t:'«Es una foto. Medio minuto suyo. El resto lo hago yo todo.»', n:'MÍNIMO ESFUERZO · RECIPROCIDAD · “medio minuto” suena a menos que “treinta segundos”'},
      {t:'«Le escribo yo primero, así tiene mi número guardado.»', n:'DAR ANTES DE PEDIR'},
      {mark:'[TONO ↑]'},
      {t:'«¿Por WhatsApp o por correo? Lo que le sea más cómodo.»', n:'ELECCIÓN A/B DE CANAL'},
      {t:'«En cuanto la tenga, le confirmo. Y mañana… números.»', n:'RESPUESTA RÁPIDA · ZEIGARNIK — queda algo pendiente: su estudio'}
    ]},
    {ctx:'Pida la factura ENTERA («que se vea toda, de arriba abajo»): así le llegan CUPS, CIF, titular, potencias y consumos sin pedir nada más. Y fije la llamada: «¿Le llamo mañana sobre las once o sobre las cinco?»'}
  ],
  nat:{
    alt:[
      '«Hágame el favor y sáquele una foto ahora, que son veinte segundos.»',
      '«Si la tiene a mano, mejor que mejor.»'
    ],
    notas:[
      '«Medio minuto» minimiza más que «treinta segundos»: mismo tiempo, menos peso.',
      '«Lo que le sea más cómodo» devuelve el control sin abrir el no.',
      '«Mi número» es como se dice en España; «mi contacto» suena a folleto.',
      '«En cuanto la tenga» promete rapidez real: cúmplalo, es su primera prueba de servicio.'
    ],
    zona:'España (general).'
  },
  notas:[
    'WhatsApp primero: la foto llega en un minuto; el correo, a veces, nunca.',
    'Si dice «luego la mando»: «Perfecto, le escribo ahora y me contesta cuando pueda, ¿hoy o mañana?» — elección, nunca espera abierta.',
    'Recibida la factura: confirme al momento.'
  ],
  micro:'Factura en camino + próxima llamada con día y franja.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Factura prometida / recibida', next:'seguimiento'},
    {ico:'🗓', cls:'warn', label:'Mejor lo vemos en persona', next:'cierre_cita'},
    {ico:'🚪', cls:'warn', label:'No se compromete', next:'retirada'}
  ]
},

cierre_alta:{
  step:7, fase:'8 · Cierre C',
  titulo:'Cierre C — Activación directa (la primera factura distinta)',
  script:[
    {say:[
      {t:'«Y aquí viene lo bueno: sin permanencia, sin cortes y sin que usted tenga que mover un dedo.»', n:'CORTISOL ↓ · REGLA DEL 3 · “aquí viene lo bueno” — los tres miedos fuera ANTES de que los nombre'},
      {t:'«No va a notar nada de nada… hasta la primera factura.»', n:'ANTICIPACIÓN · PEAK · “nada de nada”'},
      {t:'«Imagínese abrirla y verla más baja que la de siempre.»', n:'FUTURE PACING · ALIVIO · PICO EMOCIONAL'},
      {t:'«Nosotros lo movemos todo desde aquí. Usted, a disfrutar.»', n:'MÍNIMO ESFUERZO · CONTROL'},
      {mark:'[TONO ↑]'},
      {t:'«¿Me dice el CIF y empezamos… o me manda la factura y lo saco yo de ahí?»', n:'ELECCIÓN A/B'}
    ]},
    {ctx:'Documentación: factura completa (CUPS, potencias, consumos) · CIF · titular · cuenta bancaria. Provincia de Valencia: la factura le llega de Iberdrola. Fuera de Valencia: suministro en nombre de Iberdrola con facturación de B&M Asesores Energéticos. Lo de la permanencia es verdad y es su mejor argumento: dígalo con orgullo.'}
  ],
  nat:{
    alt:[
      '«¿Empezamos ya? Solo es decirme un par de datos.»',
      '«Si le cuadra, lo dejamos arrancado hoy mismo.»'
    ],
    notas:[
      '«Aquí viene lo bueno» genera expectativa oral muy española: el cliente levanta la oreja.',
      '«Nada de nada» es refuerzo típico; mejor que «absolutamente nada» (formal raro).',
      '«Usted, a disfrutar» cierra con ligereza: la venta buena acaba sonriendo.',
      'Evite «procederemos a gestionar el cambio de titularidad»: eso suena a call center, no a persona.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Los tres miedos (corte, permanencia, papeleo) se quitan ANTES de que salgan: así no llegan a ser objeción.',
    'No active nada sin datos verificados. Si falta algo: Cierre B y a seguir.',
    'Peak-End: termine con la imagen de la primera factura baja, y confirme el siguiente contacto.'
  ],
  micro:'Alta en marcha o documentación en camino con fecha.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Alta en marcha', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Falta documentación → la foto primero', next:'cierre_facturas'},
    {ico:'📅', cls:'bad', label:'«La permanencia me acaba en unos meses»', obj:'permanencia', resume:'cierre_hub'},
    {ico:'🚪', cls:'warn', label:'Se echa para atrás', next:'retirada'}
  ]
},

cierre_tecnico:{
  step:7, fase:'8 · Cierre D',
  titulo:'Cierre D — Visita del técnico: su tejado trabajando para usted',
  script:[
    {say:[
      {t:'«Mire, su caso va más allá de la tarifa. Y eso, fíjese, es buena noticia.»', n:'REENCUADRE · ZEIGARNIK'},
      {t:'«Imagine su tejado sacando euros mientras usted trabaja. Sol hecho caja.»', n:'FUTURE PACING · ORGULLO · ESCENARIO'},
      {t:'«O un cuadro eléctrico que no le vuelve a dar un susto un sábado.»', n:'ALIVIO · ESCENARIO'},
      {t:'«Nuestro técnico se acerca, lo mira… y le cuenta la verdad. Gratis total.»', n:'RECIPROCIDAD · GRATIS · “se acerca” = visita (natural)'},
      {t:'«Se lleva un informe: qué conviene hacer, qué cuesta y qué le devuelve.»', n:'JUSTIFICACIÓN DIFERIDA'},
      {mark:'[TONO ↑]'},
      {t:'«¿Esta semana o la que viene? ¿Por la mañana o por la tarde?»', n:'ELECCIÓN DOBLE × 2 · “la que viene” (España)'}
    ]},
    {ctx:'Ideal para 6.1TD, naves, talleres, industria y tejado propio. Anote: dirección, mejor franja y qué quiere mirar (placas ± baterías, cuadros, condensadores, cargadores, reformas, mantenimiento). La visita técnica también abre la tarifa: es una puerta, no un rodeo.'}
  ],
  nat:{
    alt:[
      '«Le paso al ingeniero y que lo vea en persona, que vale oro.»',
      '«Sin comprar nada, oiga: solo mirar y decirle la verdad.»'
    ],
    notas:[
      '«La semana que viene» es la forma española; «la próxima semana» también vale pero es más escrita.',
      '«Se acerca» = hace una visita. Más natural que «le realizaremos una inspección técnica».',
      '«Tejado» (España) en vez de «cubierta» si habla con comercios; en industria ambas valen.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Venda la VISITA, no el proyecto: es gratis y pequeña; el proyecto se decide después.',
    'El ingeniero es su prueba de autoridad: nómbrelo («nuestro ingeniero de zona»).',
    'Peak-End: cierre con la imagen («su tejado dándole euros»), no con el papeleo.'
  ],
  micro:'Visita apuntada con fecha, franja y alcance.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Visita apuntada', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Antes quiere el estudio de la factura', next:'cierre_facturas'},
    {ico:'🚪', cls:'warn', label:'No concreta', next:'retirada'}
  ]
},

seguimiento:{
  step:8, fase:'9 · Seguimiento',
  titulo:'Seguimiento — la intriga que trabaja para usted (Peak-End en cada toque)',
  script:[
    {ctx:'El estudio pendiente es su aliado (Zeigarnik): el cliente quiere cerrar lo que quedó abierto. Cada contacto lleva algo nuevo: jamás un «¿lo pensó?» vacío.'},
    {say:[
      {t:'WhatsApp (día 0, en menos de 5 min): «Buenas, [NOMBRE_CLIENTE]. Soy [NOMBRE_COMERCIAL], del Dpto. PYMES de Iberdrola. Su estudio ya está en marcha 🔎 Mándeme una foto de la última factura y mañana ve, en euros, el dinero que tiene dormido. Sin compromiso ninguno. En cuanto la reciba le confirmo.»', n:'NOMBRE · ZEIGARNIK · GRATIS · PÉRDIDA · MÍNIMO ESFUERZO'},
      {t:'Email (día 0) — Asunto: «[NOMBRE_CLIENTE], en su factura hay algo — su estudio PYMES de Iberdrola». Cuerpo: 4 líneas: lo que quedamos + el dato de las potencias + su teléfono directo + la próxima llamada. Ni un folleto adjunto.', n:'NOMBRE EN ASUNTO · ZEIGARNIK · PERSONAL'},
      {t:'SMS (refuerzo): «Iberdrola PYMES Valencia · [NOMBRE_COMERCIAL]: le he mandado la propuesta por [CANAL_SEGUIMIENTO]. Cuando la mire, lo hablamos en 2 minutos. Saludos.»', n:'AUTORIDAD · MÍNIMO ESFUERZO · “lo hablamos”'},
      {t:'Cadencia: 1er toque a las 24–48 h (con una novedad) · 2º a la semana (un caso de SU sector) · 3º a los 15 días · luego puerta abierta mensual.', n:'RITMO · cada toque cierra con elección, nunca con «¿le sigue interesando?»'}
    ]}
  ],
  nat:{
    alt:[
      '«Cuando saque un hueco, lo vemos. Sin prisa.»',
      '«Le escribo el jueves y retomamos, ¿le parece?»'
    ],
    notas:[
      '«Buenas» es el saludo estándar de WhatsApp en España. «Buen día» suena raro; «Estimado cliente», peor.',
      '«Lo hablamos» (con dativo) es el español oral auténtico para «hablaremos de ello».',
      '«Saludos» cierra bien un SMS: ni seco ni cursi.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Cada toque lleva UN regalo: un dato, un caso de su sector, el recordatorio de su cita. Reciprocidad continua.',
    'Apunte canal, fecha y próxima acción en la ficha: lo que no se apunta, se pierde.',
    'Cuando el estudio esté listo, la llamada de seguimiento ES la llamada de cierre: lleve el pico emocional preparado.'
  ],
  micro:'Cadencia apuntada y primera acción hecha antes de colgar.',
  opciones:[
    {ico:'🏁', cls:'ok', label:'Llamada terminada — anotar resultado', next:'inicio'},
    {ico:'🔁', cls:'warn', label:'Nueva objeción en el seguimiento', next:'inicio', keepObj:true}
  ]
},

retirada:{
  step:8, fase:'9 · Final limpio',
  titulo:'Salida elegante — perder la batalla, sembrar la imagen (Peak-End)',
  script:[
    {say:[
      {t:'«[NOMBRE_CLIENTE], muchísimas gracias por su tiempo, de verdad.»', n:'RESPETO · NOMBRE · fórmula telefónica auténtica'},
      {t:'«Quédese solo con una imagen:»', n:'PEAK-END · PREPARA LA ESCENA FINAL'},
      {t:'«el mes que la factura se dispara sin avisar…»', n:'ESCENARIO · PÉRDIDA FUTURA'},
      {t:'«o el sábado que se va la luz a las diez de la noche.»', n:'ESCENARIO · MIEDO MEDIDO'},
      {mark:'[PAUSA 2s]'},
      {t:'«Ese día se acuerda: en Valencia tiene a alguien que le coge el teléfono. Veinticuatro horas.»', n:'ALIVIO · FINAL LIMPIO'},
      {t:'«Le dejo mi WhatsApp para cuando usted quiera. Sin compromiso ninguno.»', n:'CONTROL AL CLIENTE · PUERTA ABIERTA'},
      {t:'«Un placer, [NOMBRE_CLIENTE]. Que le vaya muy bien.»', n:'MERA EXPOSICIÓN · NOMBRE · despedida española de negocios'}
    ]}
  ],
  nat:{
    alt:[
      '«Aquí me tiene para lo que le haga falta.»',
      '«Cuando quiera retomarlo, me tiene a un teléfono de distancia.»'
    ],
    notas:[
      '«Que le vaya bien» / «que le vaya muy bien» es LA despedida española. «Que tenga un excelente día» sonaría a doblaje.',
      '«Muchísimas gracias por su tiempo» cierra con altura y sin arrastrarse.',
      '«A un teléfono de distancia» transmite cercanía sin invadir: muy valorado en el trato con PYMEs.'
    ],
    zona:'España (general).'
  },
  notas:[
    'Salga con la misma energía con la que entró: lo último es lo que se recuerda (Peak-End).',
    'Si pide que no le llamen: cumpla al instante y anótelo. La elegancia también es cumplimiento.',
    'Un «no» de hoy con buena imagen es un estudio aceptado en seis meses. Apunte la puerta abierta mensual.'
  ],
  micro:'Imagen sembrada + contacto entregado + llamada anotada con la dignidad intacta.',
  opciones:[
    {ico:'📅', cls:'ok', label:'Apuntar contacto futuro y terminar', next:'inicio'},
    {ico:'✉️', cls:'warn', label:'Dejar plantilla de seguimiento', next:'seguimiento'}
  ]
}
};