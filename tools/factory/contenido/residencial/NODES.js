const NODES = {

inicio:{
  step:0, fase:'Preparación',
  titulo:'Antes de marcar — coger aire y tono (45 segundos)',
  script:[
    {ctx:'REGLA MADRE: a un cliente de a pie no le entran las tarifas, le entran el susto de la factura y el alivio de pagar lo justo cada mes. Los primeros 30 segundos de cada bloque son EMOCIÓN (Sistema 1): la cocina, el horno, la calefacción, enero. Los números llegan después, a justificar lo que la tripa ya decidió.'},
    {ctx:'Ficha: lead [TIPO_LEAD] · vivienda [TIPO_VIVIENDA] · [CIUDAD]. Cliente de Iberdrola: lo tiene casi todo. Lead IBERCRM: faltan compañía y tarifa — se sacan en detección. IBERU: consumos previos. Cargue esta pestaña y respire: la importancia que usted le da a la llamada… se la da él.'},
    {ctx:'Y hable como habla la calle: usted toda la llamada, frases cortas, pretérito perfecto («¿le ha subido?», no «¿le subió?») y el nombre del cliente mínimo tres veces. Después de cada pregunta: SILENCIO. El que calla… escucha.'}
  ],
  notas:[
    'De pie o bien sentado: la voz cambia y se nota.',
    'Objetivo de la llamada: alta, foto de la factura o cita. Uno de los tres y la llamada ha ganado.',
    'Usted no «vende»: usted mira cuánto paga de más una casa y devuelve tranquilidad.'
  ],
  micro:'Entrar con la cabeza bien puesta: emoción primero, dato después.',
  opciones:[
    {ico:'📞', cls:'ok', label:'Llamada en frío', sub:'Primer contacto con el hogar', next:'apertura'},
    {ico:'📥', cls:'ok', label:'Lead entrante', sub:'Ya mostró interés', next:'apertura'},
    {ico:'🔁', cls:'ok', label:'Cliente antiguo / seguimiento', sub:'Ya hubo relación o contacto', next:'apertura_retorno'},
    {ico:'📭', cls:'warn', label:'No coge / buzón', sub:'Dejarle con la miel en los labios', next:'no_contesta'}
  ]
},

apertura:{
  step:0, fase:'1 · Apertura',
  titulo:'Apertura — identidad + emoción + escena (primeros 20 segundos)',
  script:[
    {say:[
      {t:'«Buenos días, ¿hablo con [NOMBRE_CLIENTE]?»', n:'IDENTIDAD · MICRO-SÍ Nº1'},
      {mark:'[PAUSA 2s]'},
      {t:'«Le llamo del Departamento RESIDENCIAL de Iberdrola.»', n:'AUTORIDAD · MERA EXPOSICIÓN'},
      {t:'«¿Le cojo en un mal momento? No se preocupe, no le robo más de un minuto.»', n:'CORTISOL ↓ · EMPATÍA · ESCASEZ'},
      {t:'«Fíjese en una cosa: muchos hogares de [CIUDAD] llevan meses pagando la luz de más…»', n:'FÍJESE · PRUEBA SOCIAL · PÉRDIDA'},
      {t:'«…y casi nadie se entera hasta que un mes les llega el susto. Sin que nadie les avise, oiga.»', n:'ESCENA MENTAL · PÉRDIDA ACTUAL'},
      {mark:'[PAUSA 2s]'},
      {mark:'[TONO ↑]'},
      {t:'«Dígame, [NOMBRE_CLIENTE]: su última factura de la luz, ¿ha venido bien… o ha venido de susto?»', n:'NOMBRE Nº2 · ELECCIÓN DOBLE · PRETÉRITO PERFECTO — ambas respuestas le meten en la conversación'}
    ]}
  ],
  nat:{
    alt:[
      '«Buenos días, ¿me pone con [NOMBRE_CLIENTE], por favor?» (si contesta otra persona de casa)',
      '«Mire, no le quito ni un minuto: solo una cosa y le dejo.»',
      '«¿Le pillo en buen momento para una cosita rápida?»'
    ],
    notas:[
      '«¿Le cojo en un mal momento?» es más empático que «¿tiene un momento?»: reconoce la molestia antes de que la nombre él, y eso desarma.',
      '«¿Ha venido de susto?» es habla de cocina, no de oficina: la factura que «llega mal» la conoce todo el mundo.',
      '«Fíjese en una cosa» capta atención sin sonar a teleoperador: es muletilla de calle, no de guion.',
      'Silencio de verdad tras la pregunta: quien habla primero tras un silencio, pierde terreno.'
    ],
    zona:'Península (una sola versión, con ajustes por franja: mañana/tarde).'
  },
  notas:['Objetivo del bloque: que suelte UNA palabra sobre su factura. Si le deja hablar, ya entró.'],
  micro:'Primer micro-sí (su nombre) + curiosidad abierta que él quiere cerrar.',
  opciones:[
    {ico:'✅', cls:'ok', label:'«Sí, soy yo, dígame»', sub:'Curiosidad activada', next:'presentacion'},
    {ico:'🤔', cls:'warn', label:'«¿De qué va esto? ¿Quién llama?»', next:'motivo'},
    {ico:'👥', cls:'bad', label:'«Eso lo lleva mi marido / mi mujer»', sub:'El decisor de casa', obj:'no_decisor', resume:'apertura'},
    {ico:'⏰', cls:'bad', label:'«Ahora no puedo, ando liada»', obj:'tiempo', resume:'motivo'},
    {ico:'🚫', cls:'bad', label:'«No me interesa»', obj:'no_interesa', resume:'motivo'}
  ]
},

apertura_retorno:{
  step:0, fase:'1 · Apertura',
  titulo:'Apertura — cliente antiguo o seguimiento (reconocer antes que vender)',
  script:[
    {say:[
      {t:'«[NOMBRE_CLIENTE], buenas. Soy [NOMBRE_COMERCIAL], del Dpto. RESIDENCIAL de Iberdrola.»', n:'NOMBRE Nº1 · AUTORIDAD · CONTINUIDAD'},
      {t:'«Hablamos en su día de la luz de su casa, ¿le suena?»', n:'MEMORIA · MICRO-SÍ'},
      {mark:'[PAUSA 2s]'},
      {t:'«Mire, no le llamo por llamar: han pasado cosas con los precios estos años… y muchas casas se han quedado con condiciones viejas.»', n:'NOVEDAD · VALIDACIÓN RETROACTIVA · PÉRDIDA'},
      {t:'«Ver si usted es de las que pagan de más… o de las que pagan bien, nos lleva un minuto. ¿Tiramos por ahí?»', n:'MÍNIMO ESFUERZO · ELECCIÓN ABIERTA'}
    ]}
  ],
  nat:{
    alt:[
      '«Buenas, [NOMBRE_CLIENTE], soy [NOMBRE_COMERCIAL], que hablamos en su día.»',
      '«Le prometí en su día mirar su factura como si fuera la mía. Vengo a eso.»',
      '«Disculpe que vuelva: es que el tema se ha movido mucho y me acordé de usted.»'
    ],
    notas:[
      'Quien vuelve a llamar recuerda o finge que recuerda: la continuidad genera familiaridad sin mentiras.',
      '«Me acordé de usted» personaliza sin invadir: es trato de barrio, no de callcenter.',
      'Validar su decisión pasada («hizo bien en buscar») antes de cualquier cambio: nadie abandona una decisión que le atacan.'
    ],
    zona:'Península.'
  },
  notas:['Si no le sitúa, no insista: deje que el contenido le vuelva a enganchar.'],
  micro:'Continuidad + novedad: «algo ha cambiado desde entonces».',
  opciones:[
    {ico:'✅', cls:'ok', label:'Receptivo, recuerda el contacto', next:'motivo'},
    {ico:'🙂', cls:'warn', label:'«Ah, sí… ¿y qué hay?»', next:'motivo'},
    {ico:'🚫', cls:'bad', label:'«Ya me lo pienso / ahora no»', obj:'lo_pienso', resume:'motivo'}
  ]
},

no_contesta:{
  step:8, fase:'Reintento',
  titulo:'No coge — dejarle con la miel en los labios (Zeigarnik puro)',
  script:[
    {ctx:'El buzón y el WhatsApp NO son para vender: son para dejar una puerta abierta que pique. Intriga + algo de usted + cero presión. Objetivo único: que cuando vea su número la próxima vez… le suene a pendiente suya, no a spam.'},
    {say:[
      {t:'Buzón (tono cercano, 15 s): «Buenas, [NOMBRE_CLIENTE], soy [NOMBRE_COMERCIAL], de Iberdrola Residencial. Le llamaba por una cosa de la factura de su casa de [CIUDAD]. Nada urgente: cuando tenga dos minutos, me tiene por aquí. Un saludo.»', n:'INTRIGA · PERTINENCIA LOCAL · ANTI-PRESIÓN'},
      {t:'WhatsApp (si el número da): «Buenas, [NOMBRE_CLIENTE] 🙂 Soy [NOMBRE_COMERCIAL], del Dpto. RESIDENCIAL de Iberdrola. Le llamaba por su factura de la luz — muchas casas de [CIUDAD] están pagando de más sin saberlo. Cuando tenga un rato, le cuento en dos líneas.»', n:'ZEIGARNIK · PRUEBA SOCIAL · UN EMOJI, NO TRES'}
    ]}
  ],
  nat:{
    alt:[
      'Variante aún más corta: «…le llamaba de Iberdrola por su factura. Sin prisa: me tiene por aquí.»',
      'Si es reintento nº3: mensaje de despedida elegante (ver Retirada) y no llamar más.'
    ],
    notas:[
      'Un emoji sonriente como mucho: más de uno suena a baratija de marketing.',
      '«Me tiene por aquí» = puerta abierta sin deber: la gente pone ustedes en «pendiente».'
    ],
    zona:'Península.'
  },
  notas:[
    'Reintentos con hora distinta (nunca a la misma): 10:30, 13:00, 17:30, 19:00.',
    'Anotar SIEMPRE en la ficha: día, hora y canal. Si no se apunta, no existe.',
    'Máximo 3 intentos: el cuarto ya es molestia… y su número queda quemado.'
  ],
  micro:'La llamada pendiente trabaja para usted mientras usted no trabaja.',
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
      {t:'«Y para que sepa con quién habla: yo no le vendo nada por teléfono. Quédese tranquilo de entrada.»', n:'CONTROL · CORTISOL ↓ · DIFERENCIACIÓN DEL SPAM'},
      {t:'«Yo trabajo en el departamento residencial, y lo que hacemos es una cosa muy simple: nos manda su factura, la miramos gratis y le decimos la verdad.»', n:'REGALO (RECIPROCIDAD) · MÍNIMO ESFUERZO · VERDAD'},
      {t:'«Si paga bien, se lo digo y tan contentos. Y si paga de más… se lo digo también, y usted decide.»', n:'HONESTIDAD ASIMÉTRICA · DEVOLVER EL CONTROL'}
    ]}
  ],
  nat:{
    alt:[
      '«No vengo a venderle nada hoy: vengo a mirarle la factura, que es distinto.»',
      '«Se lo pongo fácil: gratis, rápido y sin compromiso ninguno.»',
      '«Somos el departamento de hogares: pisos como el suyo los vemos a docenas cada semana.»'
    ],
    notas:[
      '«Quédese tranquilo» desactiva el miedo a que le líen: el anti-spam más barato que existe.',
      'Decirle que puede salir ganando Y que puede salir igual convierte la llamada en consulta, no en venta: baja defensas.',
      '«Usted decide» parece ceder poder… y justo por eso la gente se queda: el control percibido retiene.'
    ],
    zona:'Península.'
  },
  notas:['Autoridad blanda: departamento + trabajo concreto + honestidad. Nada de catálogo aquí.'],
  micro:'De «otro que vende» a «este me mira la factura».',
  opciones:[
    {ico:'👂', cls:'ok', label:'Escucha, le deja seguir', next:'motivo'},
    {ico:'🤔', cls:'warn', label:'«Vale… ¿y usted qué quiere?»', next:'motivo'},
    {ico:'🕵️', cls:'bad', label:'«¿Esto es para venderme algo?»', obj:'desconfianza', resume:'motivo'},
    {ico:'📅', cls:'bad', label:'«Es que tengo permanencia»', obj:'permanencia', resume:'motivo'}
  ]
},

motivo:{
  step:2, fase:'3 · Motivo',
  titulo:'Motivo — la fuga de todos los meses (emoción primero, cifra después)',
  script:[
    {say:[
      {t:'«Le cuento por qué le llamo, [NOMBRE_CLIENTE].»', n:'NOMBRE Nº3 (de tres) · TRANSICIÓN'},
      {t:'«La factura de la luz es de las pocas cosas de casa que se pagan por inercia: llega, se domicilia… y no la mira nadie.»', n:'NORMALIZACIÓN · ESCENA DE INERCIA'},
      {t:'«Y entre la potencia que no usa, los horarios que no aprovecha y los conceptos que no entiende nadie… ahí se queda dormido bastante dinero de la casa.»', n:'PÉRDIDA ACTUAL · LENGUAJE DE COCINA'},
      {t:'«Una familia de [CIUDAD], un piso como el suyo: cuando lo miramos, había dinero suyo por ahí repartido cada mes. Sin darse cuenta, oiga.»', n:'CASO DE UN IGUAL CON LUGAR CERCANO'},
      {mark:'[PAUSA 2s]'},
      {t:'«Por eso le llamo: para mirar si en su casa pasa lo mismo.»', n:'PERTINENCIA PERSONAL'}
    ]}
  ],
  nat:{
    alt:[
      '«La luz se paga sola por el banco y justo por eso no se mira: le pasa a todo el mundo.»',
      '«Hay facturas que se quedan tranquilas años… cobrando de más.»',
      '«No es que la factura suba: es que nunca la bajó nadie.»'
    ],
    notas:[
      '«Se domicilia y no se mira» es verdad universal: el cliente asiente antes de darse cuenta.',
      'Prohibido aquí dar euros concretos de oferta: el número llega tras ver SU factura, no antes (y si lo suelta, se lo cree o se asusta).',
      'El caso de un igual funciona si es un hogar parecido al suyo: piso con piso, chalet con chalet, segunda residencia con segunda residencia.'
    ],
    zona:'Península.'
  },
  notas:['Si ya suelta la factura aquí («pues yo pagué no sé cuántos»), escúchela entera: es oro en bruto.'],
  micro:'De curiosidad a inquietud honesta: «¿y en mi casa?».',
  opciones:[
    {ico:'✅', cls:'ok', label:'Interés: «A ver, cuénteme»', next:'permiso'},
    {ico:'😐', cls:'warn', label:'Silencio / duda', next:'permiso'},
    {ico:'🏢', cls:'bad', label:'«Ya estoy con Iberdrola»', obj:'ya_tengo', resume:'permiso'},
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
      {t:'«Le hago tres preguntas y hemos terminado, ¿le parece?»', n:'PERMISO ACOTADO · MICRO-SÍ · ESCASEZ DE TIEMPO'},
      {mark:'[Sí, venga]'},
      {t:'«Gracias. Y si algo no le cuadra, me corta sin compromiso: aquí manda usted.»', n:'CONTROL · DEUDA DE RESPETO'}
    ]}
  ],
  nat:{
    alt:[
      '«¿Me deja que le haga tres preguntas rapiditas y le suelto?»',
      '«Un minuto de verdad: tres preguntas y cada uno a lo suyo.»'
    ],
    notas:[
      'El número «tres» concreto calma: finito y pequeño. «Unas preguntas» suena a interrogatorio.',
      '«Aquí manda usted» devuelve el control: la gente que se siente dueña de la llamada… se queda en ella.'
    ],
    zona:'Península.'
  },
  notas:['Si pone prisa, pase a detección con la pregunta de la factura primero: es la que más duele.'],
  micro:'El «sí, venga» que abre la puerta: pequeño pronunciamiento (consistencia).',
  opciones:[
    {ico:'✅', cls:'ok', label:'«Sí, venga, dígame»', next:'deteccion'},
    {ico:'⚡', cls:'warn', label:'«Que sea rápido, ¿eh?»', next:'deteccion', sub:'Pregunte UNA: la factura'},
    {ico:'🚫', cls:'bad', label:'«Mire, ahora no»', obj:'momento', resume:'cierre_hub'},
    {ico:'✉️', cls:'bad', label:'«Mándeme un correo»', obj:'email', resume:'permiso'}
  ]
},

deteccion:{
  step:4, fase:'5 · Detección',
  titulo:'Detección — dar antes de pedir: tres preguntas, tres porqués',
  script:[
    {ctx:'REGLA DE ORO: antes de cada pregunta, el para qué. Pedir datos en frío suena a fichero policial; pedir con motivo suena a profesional. Y la primera la responde todo el mundo sin miedo.'},
    {say:[
      {t:'«La primera, para ver si su tarifa es de las de mercado libre o de la regulada: ¿sabe con qué compañía tiene la luz y, más o menos, qué tipo de tarifa lleva?»', n:'Q1 FÁCIL · POR QUÉ PRIMERO'},
      {t:'«La segunda, que es la de verdad: un mes normal, ¿qué me dice qué suele pagar? ¿Pasa de los cien… o anda por debajo?»', n:'Q2 DOLOR · ANCLA SUAVE · ELECCIÓN DOBLE'},
      {t:'«Y la última, porque influye muchísimo: ¿tienen placas solares… o es algo que tienen en la cabeza?»', n:'Q3 TÉCNICA · ABIERTA (deja pista de valor)'}
    ]}
  ],
  nat:{
    alt:[
      '«¿Me dice, a ojo, lo de un mes normal? No hace falta dato fino.»',
      '«¿Factura de verano o de invierno? — La que peor les salga, esa es la buena para mirar.»',
      'Si no lo sabe: «Nada, no pasa nada: casi nadie lo sabe; para eso estamos.»'
    ],
    notas:[
      '«A ojo» y «más o menos» quitan el miedo a equivocarse: la gente no responde por protegerse del ridículo.',
      'Con la tarifa diga «mercado libre o regulada», nunca «PVPC» primero: si lo sabe él, mejor; si no, no le agobie.',
      'Escuche TAMBIÉN lo que no pregunta: niños, radiadores, «mi madre está mayor», «el chalet de la playa»… ahí vive la venta.'
    ],
    zona:'Península.'
  },
  notas:['Nunca nombre en voz alta la compañía actual que anote en la ficha: se apunta, no se pronuncia.'],
  micro:'Tres datos sin fricción → el dolor ordena el pitch: precio, servicio o retorno.',
  opciones:[
    {ico:'💶', cls:'ok', label:'Dolor de PRECIO: «pagamos un pastón»', next:'pitch_ahorro'},
    {ico:'⚡', cls:'ok', label:'Dolor de SERVICIO: cortes, atención, caos', next:'pitch_valor'},
    {ico:'😊', cls:'warn', label:'Sin dolor: contento con todo', next:'pitch_valor', sub:'Valor y verdad, no precio'},
    {ico:'🔁', cls:'ok', label:'Estuvo antes en Iberdrola', next:'pitch_retorno'},
    {ico:'❓', cls:'warn', label:'«Ni idea, eso lo lleva el banco»', next:'cierre_facturas', sub:'La foto lo resuelve'},
    {ico:'🚫', cls:'bad', label:'Le sale una objeción aquí', next:'deteccion', sub:'Use la pestaña Objeciones'}
  ]
},

pitch_ahorro:{
  step:5, fase:'6 · Propuesta',
  titulo:'Pitch de la FUGA — para la casa que paga de más',
  script:[
    {say:[
      {t:'«Pues mire, [NOMBRE_CLIENTE], lo que usted me cuenta… lo vemos a diario. »', n:'NORMALIZACIÓN · NOMBRE Nº4'},
      {t:'«Imagínese esta escena: llega la factura, el banco la cobra sola, y dentro hay potencia que no usa y horarios que no aprovecha. Cada mes. Calladito.»', n:'ESCENA MENTAL · PÉRDIDA ACTUAL · HABLA DE CALLE'},
      {t:'«Ya le digo yo que no es que la luz esté cara: es que nadie le ha ajustado la tarifa a SU casa desde hace años.»', n:'REENCUADRE: CULPA FUERA DE ÉL · PERSONALIZACIÓN'},
      {t:'«La propuesta es tonta de lo simple: me manda una foto de la factura, la miramos… y mañana sabe en euros si paga de más o paga bien. Gratis.»', n:'FUTURE PACING · MÍNIMO ESFUERZO · DATO EN EUROS · GRATIS'},
      {t:'«Y si paga bien, se lo digo y se queda tranquilísimo, que también vale.»', n:'HONESTIDAD ASIMÉTRICA · RECOMPENSA ASEGURADA'}
    ]}
  ],
  nat:{
    alt:[
      '«La luz de su casa no cambia ni un bombilla: lo que cambia es lo que paga por ella.»',
      '«No le voy a vender ahorro: le voy a enseñar su número, que es más serio.»',
      '«Usted sigue dando al interruptor igual; solo deja de pagar de más.»'
    ],
    notas:[
      '«Calladito» y «un mes normal» son habla de cocina: la factura duele más cuando se cuenta doméstica.',
      'Nada de catalogar tarifas aquí (ni nombres ni precios): el guion vende el ESTUDIO, no el producto. El número sale de SU factura.',
      'Si pide el porcentaje: «depende de la factura, no le quiero mentir — por eso la miramos». Honestidad que frena el regateo en frío.'
    ],
    zona:'Península.'
  },
  notas:['Cliente que dice cifras de su factura en voz alta: repítalas de vuelta, despacio («¿cien veinte, me dice?»): asiente compromiso.'],
  micro:'Del susto abstracto a «mi número mañana, gratis».',
  opciones:[
    {ico:'📄', cls:'ok', label:'«Venga, le mando la factura»', next:'cierre_facturas'},
    {ico:'🗓', cls:'ok', label:'«Mejor lo vemos juntos en persona»', next:'cierre_cita'},
    {ico:'✍️', cls:'ok', label:'«Si sale bien, lo dejamos hecho»', next:'cierre_alta'},
    {ico:'☀️', cls:'warn', label:'Placas / térmicos en la mesa', next:'cierre_tecnico'},
    {ico:'💸', cls:'bad', label:'«¿Y cuánto me ahorro exactamente?»', next:'pitch_ahorro', sub:'No dé la cifra: reencauce al estudio'},
    {ico:'🤷', cls:'bad', label:'«Ya me lo pienso»', obj:'lo_pienso', resume:'cierre_hub'},
    {ico:'🔄', cls:'bad', label:'«No me cambio ni loco»', obj:'no_cambiar', resume:'cierre_hub'}
  ]
},

pitch_valor:{
  step:5, fase:'6 · Propuesta',
  titulo:'Pitch de la TRANQUILIDAD — la luz de casa, que nunca falle',
  script:[
    {say:[
      {t:'«Déjeme que le cuente una escena: sábado, por la noche, cena en casa… y salta el automático. ¿A quién llama usted?»', n:'ESCENA + PREGUNTA QUE DUELE (día concreto)'},
      {mark:'[PAUSA 2s]'},
      {t:'«Pues ahí se ve la diferencia de compañías. No en el mes normal: el día de la avería, el día de la duda, el día de la reclamación.»', n:'CONTRASTE: VALOR VS PRECIO'},
      {t:'«Con Iberdrola detrás — que es la red, la atención y la aplicación de verdad — usted llama y le coge una persona. Y con el estudio de la factura encima… paga lo justo.»', n:'AUTORIDAD REAL · SERVICIO TANGIBLE'},
      {t:'«No le estoy pidiendo que se mueva hoy. Le pido que lo vea: foto de la factura, nosotros la miramos y le decimos la verdad.»', n:'ANTI-PRESIÓN · MÍNIMO ESFUERZO · VERDAD'}
    ]}
  ],
  nat:{
    alt:[
      '«El precio se nota una vez al mes; el servicio se nota el día que falla algo.»',
      '«Hay compañías que solo contestan el día de cobrar. Ese día usted quiere que cojan el teléfono.»',
      '«La factura de casa no se discute en euros: se discute en sustos.»'
    ],
    notas:[
      'La escena del sábado por la noche funciona porque es de todos: quién no ha vivido un «se ha ido la luz».',
      'Servicio tangible = teléfono que coge una persona + app + avisos: cosas que se ven, no adjetivos.',
      'Con el sin-dolor («yo estoy bien»): la verdad de la factura es el único argumento que no le ataca.'
    ],
    zona:'Península.'
  },
  notas:['Segunda residencia: escena cambia a «llega en verano tras meses cerrada y no funciona nada»: su peor sofá.'],
  micro:'La tranquilidad no se factura: se nota. Y el número, mañana.',
  opciones:[
    {ico:'📄', cls:'ok', label:'Acepta mandar la factura', next:'cierre_facturas'},
    {ico:'🗓', cls:'ok', label:'Prefiere verse en persona', next:'cierre_cita'},
    {ico:'☀️', cls:'ok', label:'Le interesa lo técnico (placas, aerotermia, cargador)', next:'cierre_tecnico'},
    {ico:'😊', cls:'bad', label:'Insiste: «de verdad que estoy bien»', obj:'contento', resume:'cierre_hub'},
    {ico:'🤷', cls:'bad', label:'«Ya me lo pienso»', obj:'lo_pienso', resume:'cierre_hub'}
  ]
},

pitch_retorno:{
  step:5, fase:'6 · Propuesta',
  titulo:'Pitch del RETORNO — quien se fue, que vuelva a dormir tranquilo',
  script:[
    {say:[
      {t:'«Mire, [NOMBRE_CLIENTE], si usted estuvo con Iberdrola y se fue… hizo bien en su momento: los precios bailaban y había que probar. Sin problema.»', n:'VALIDACIÓN RETROACTIVA (salva su decisión) · NOMBRE Nº5'},
      {t:'«Pero note esto: muchos que se fueron por un precio… volvían por un servicio. El teléfono que coge una persona, la factura que se entiende, la red que no es un número de atención raro.»', n:'CONTRASTE VALOR·SERVICIO · SIN ATACAR SU DECISIÓN'},
      {t:'«Y aquí no hay orgullo de por medio: volver no es rendirse, es volver a pagar lo justo en su casa.»', n:'REFRAME HEROICO · ALIVIO'},
      {t:'«Déjeme mirarle la factura: si su tarifa actual le sale bien, enhorabuena y se lo digo. Y si no… la cuenta es suya. »', n:'HONESTIDAD ASIMÉTRICA · CONTROL'}
    ]}
  ],
  nat:{
    alt:[
      '«Se fue con todo derecho; vuelva con toda la razón si le cuenta.»',
      '«La luz de casa no se cambia por enfado: se cambia por números. Mirémoslos.»',
      '«Ni culpa ni reproche: solo una mirada honesta a su factura de ahora.»'
    ],
    notas:[
      'Nunca «se equivocó»: el orgullo del cliente defiende sus decisiones pasadas como si fueran su familia.',
      '«La cuenta es suya» pone el tenor decididor en su sitio sin empujarle.',
      'Si suelta la mala experiencia pasada: escúchela entera, valide («comprendo, eso no se hace») y ofrezca verificación, no disculpas eternas.'
    ],
    zona:'Península.'
  },
  notas:['Con retorno, el dato de «qué le molestó» vale oro: anótelos en la ficha como PAIN100.'],
  micro:'Del «me fui» al «vuelvo a mirar» sin perder la dignidad.',
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
    {ctx:'Dos reglas de hierro: 1) el cierre siempre es A/B (esto o lo otro), nunca de sí o no. 2) Peak-End: lo último que oye es lo que se lleva. Pique la emoción buena una última vez y salga por arriba.'},
    {ctx:'Éxito = foto de la factura en camino · cita cerrada · alta activada · visita del técnico apuntada. Cualquiera de las cuatro gana la llamada. Que repita el acuerdo en voz alta: pronunciarlo lo hace suyo.'}
  ],
  notas:[
    'Cliente caliente (pregunta plazos, «¿y eso cuánto tarda?») → alta o cita esta misma semana.',
    'Cliente tibio (interesado pero liado) → foto por WhatsApp + llamada en 24–48 h.',
    'Cliente técnico (placas, aerotermia, cargador) → visita del técnico.',
    'Si el cliente calla después de usted: calle usted también. El silencio cierra.'
  ],
  micro:'UN compromiso concreto: día, hora, canal y confirmación en voz alta.',
  opciones:[
    {ico:'🗓', cls:'ok', label:'Cierre A: Cita en persona / videollamada', next:'cierre_cita'},
    {ico:'📄', cls:'ok', label:'Cierre B: La foto de la factura', next:'cierre_facturas'},
    {ico:'✍️', cls:'ok', label:'Cierre C: Activación directa', next:'cierre_alta'},
    {ico:'☀️', cls:'ok', label:'Cierre D: Visita del técnico', next:'cierre_tecnico'},
    {ico:'🚪', cls:'warn', label:'No hay cierre posible', sub:'Salida elegante con imagen final', next:'retirada'}
  ]
},

cierre_cita:{
  step:7, fase:'8 · Cierre',
  titulo:'Cierre A — Quedar en persona o videollamada (escena + elección doble)',
  script:[
    {say:[
      {t:'«Póngase en la escena: usted y yo con su factura encima de la mesa de su casa. Un cuarto de hora… y se va sabiendo en euros lo que le pasa.»', n:'PICO EMOCIONAL · ESCENA CONCRETA · MÍNIMO TIEMPO'},
      {t:'«¿Le viene mejor que nos veamos esta semana o la que viene?»', n:'ELECCIÓN DOBLE Nº1'},
      {t:'«¿Y por la mañana o por la tarde? — Mire, si lo hacemos por videollamada ni se mueve del sofá: misma factura, menos desplazamiento.»', n:'ELECCIÓN DOBLE Nº2 + MÍNIMO ESFUERZO'},
      {t:'«Pues quedamos así, [NOMBRE_CLIENTE]. Dígamelo usted también: quedamos así. En cinco minutitos tiene mi WhatsApp con el día y la hora apuntados.»', n:'COMPROMISO EN VOZ ALTA · NOMBRE Nº6 · RESUMEN <5 MIN (anti-arrepentimiento)'}
    ]}
  ],
  nat:{
    alt:[
      '«No se preocupe por ordenar papeles: con la última factura sobra.»',
      '«Si quiere que esté su marido/mujer, mejor aún: entre los dos se decide antes.»'
    ],
    notas:[
      '«Quedamos así» + repetición en su voz = cita que no se anula sola.',
      'Si duda entre persona y videollamada: videollamada para la primera toma de contacto; casa para casos técnicos.'
    ],
    zona:'Península.'
  },
  notas:['Llevar: una factura suya impresa, móvil cargado y sonrisa. Y presentarse con «soy [NOMBRE_COMERCIAL], que hablamos».'],
  micro:'Compromiso pequeño confirmado en voz alta: la piedra angular.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Cita cerrada y confirmada', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Antes quiere mandar la factura', next:'cierre_facturas'},
    {ico:'👥', cls:'warn', label:'Quiere hablarlo antes con su pareja', obj:'no_decisor', resume:'cierre_cita'},
    {ico:'🚪', cls:'warn', label:'No termina de concretar', next:'retirada'}
  ]
},

cierre_facturas:{
  step:7, fase:'8 · Cierre',
  titulo:'Cierre B — La foto de la factura (mañana a esta hora, en euros)',
  script:[
    {say:[
      {t:'«Imagíneselo: mañana a esta hora abre el móvil… y ve en euros lo que paga de más su casa. No una idea: su número.»', n:'FUTURE PACING · PICO EMOCIONAL · DATO EN EUROS'},
      {t:'«Es una foto. Medio minuto. Le escribo yo primero.»', n:'MÍNIMO ESFUERZO ×3 · DAR ANTES DE PEDIR'},
      {t:'«¿Por WhatsApp o por correo?»', n:'ELECCIÓN DE CANAL A/B'},
      {mark:'[canal elegido]'},
      {t:'«Que se vea entera, de arriba abajo: ahí está todo lo que miramos. Y si se corta algo, me manda la segunda hoja, tan rápido.»', n:'INSTRUCCIÓN CLARA · MICRO-PASO'},
      {t:'«Y mañana le llamo con el resultado: ¿sobre las once o sobre las cinco?»', n:'ELECCIÓN DOBLE DE LLAMADA · CONSISTENCIA'}
    ]}
  ],
  nat:{
    alt:[
      '«Personalmente, yo se lo miro hoy; pero le devuelvo la llamada mañana, que hoy cena tranquilo.»',
      '«Ni apps raras ni formularios: una foto de WhatsApp, como a su hermana.»'
    ],
    notas:[
      '«Medio minuto» minimiza más que «treinta segundos». «Le escribo yo primero» = usted da antes de pedir.',
      'La factura entera: que se vea TITULAR · CUPS · POTENCIAS · CONSUMOS del año si sale. Sin tapar nada "por vergüenza": a nosotros nos da igual, solo mira números.',
      'Si dice «ahora no la encuentro»: «Nada, la busca con calma y me la manda cuando la tenga, mañana me llamó.» Cero presión.'
    ],
    zona:'Península.'
  },
  notas:['Cuando llegue la foto: confirme al minuto («recibida, se la miro yo»). El silencio post-entrega mata la confianza.'],
  micro:'Canal + hora de devolución: la factura prometida cierra la llamada.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Factura prometida / recibida', next:'seguimiento'},
    {ico:'🗓', cls:'warn', label:'Mejor lo vemos juntos en persona', next:'cierre_cita'},
    {ico:'🕵️', cls:'bad', label:'Le da cosa mandar la factura', obj:'desconfianza', resume:'cierre_facturas'},
    {ico:'🚪', cls:'warn', label:'No se compromete', next:'retirada'}
  ]
},

cierre_alta:{
  step:7, fase:'8 · Cierre',
  titulo:'Cierre C — Activación directa (la primera factura distinta)',
  script:[
    {say:[
      {t:'«Y aquí viene lo bueno: ni obras, ni cortes, ni llamadas a nadie. De eso nos encargamos nosotros todo.»', n:'LOS 3 MIEDOS DESACTIVADOS ANTES (cortisol ↓)'},
      {t:'«Usted va a seguir dando al interruptor exactamente igual. Solo va a cambiar lo que paga cada mes.»', n:'CONTINUIDAD TOTAL · BENEFICIO ÚNICO'},
      {t:'«No va a notar nada de nada… hasta la primera factura. Imagínese abrirla y verla más baja que la de siempre.»', n:'PICO: PRIMERA FACTURA DISTINTA (end vivido)'},
      {t:'«Para arrancar me hacen falta sus datos de titular y la cuenta: ¿me los va diciendo, o prefiere mandarme la factura y lo saco yo de ahí?»', n:'ELECCIÓN A/B (nunca sí/no) · MÍNIMO ESFUERZO'}
    ]}
  ],
  nat:{
    alt:[
      '«La luz no se va a ir ni un segundo: el cambio es de papel, no de contador.»',
      '«Y si en dos meses no le gusta, se vuelve como estaba. Sin dramas.»'
    ],
    notas:[
      '«Imagínese abrirla y verla más baja» es el pico: el cliente se ve haciéndolo, y eso es venderle el final.',
      'Con permanencia todavía activa: nunca la quite ni la prometa; apunte fecha y haga seguimiento. Verdad.',
      'IBAN por teléfono: dígalo siempre con «solo para domiciliar, como ahora» y ofrezca hacerlo por escrito si prefiere. Coherencia.'
    ],
    zona:'Península.'
  },
  notas:['Documentación para el alta: factura completa · CUPS · TITULAR · DNI/NIE · IBAN · firma de la verificación de llamada.'],
  micro:'De «qué pesadez» a «pues ya está hecho»: primera factura distinta.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Alta en marcha', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Falta documentación → la foto primero', next:'cierre_facturas'},
    {ico:'📅', cls:'bad', label:'«La permanencia me acaba en unos meses»', obj:'permanencia', resume:'cierre_alta'},
    {ico:'🕵️', cls:'bad', label:'Se echa para atrás por los datos', obj:'desconfianza', resume:'cierre_alta'},
    {ico:'🚪', cls:'warn', label:'Se arrepiente del todo', next:'retirada'}
  ]
},

cierre_tecnico:{
  step:7, fase:'8 · Cierre',
  titulo:'Cierre D — Visita del técnico: su casa trabajando para usted',
  script:[
    {say:[
      {t:'«Mire, su caso va más allá de la tarifa: imagínese su tejado trabajando para usted mientras está de vacaciones. Sol hecho caja, literal.»', n:'REENCUADRE · ESCENA DE ORGULLO · TANGIBLE'},
      {t:'«Se acerca nuestro técnico, lo mira a la vera y le cuenta la verdad: si le compensa poner placas, aerotermia o cargador… y cuánto le devuelve.»', n:'AUTORIDAD TÉCNICA REAL · VERDAD · GRATIS'},
      {t:'«Con un informe por escrito y sin compromiso: usted decide después con números delante, que es como se decide bien.»', n:'DATO OBJETIVO · ANTI-PRESIÓN'},
      {t:'«¿Esta semana o la que viene? ¿Por la mañana o por la tarde?»', n:'ELECCIÓN DOBLE ×2'}
    ]}
  ],
  nat:{
    alt:[
      '«Si tiene vecino con placas, pregúntele; y luego pregúntenos a nosotros, que le contamos la parte que no se ve.»',
      '«La casa no va a cambiar nada: solo que su tejado empieza a dejar dinero.»'
    ],
    notas:[
      '«Se acerca» = hace una visita (natural). «La semana que viene», nunca «la próxima semana entera».',
      'Chalet / adosado: tejado propio es el sueño. Piso: comunidad o balcón — el técnico mira y dice.',
      'Segunda residencia cerrada meses: el dolor del arrastre mensual sin usar nada es su botón.'
    ],
    zona:'Península.'
  },
  notas:['Anote: dirección · franja · alcance (placas ± batería / aerotermia / cargador de coche / revisión de la instalación).'],
  micro:'Visita con informe = cliente que decide con números, no con miedo.',
  opciones:[
    {ico:'✅', cls:'ok', label:'Visita apuntada', next:'seguimiento'},
    {ico:'📄', cls:'warn', label:'Antes quiere el estudio de la factura', next:'cierre_facturas'},
    {ico:'☀️', cls:'bad', label:'«Ya tengo placas y pago poquísimo»', obj:'solar', resume:'cierre_tecnico'},
    {ico:'🚪', cls:'warn', label:'No concreta', next:'retirada'}
  ]
},

seguimiento:{
  step:8, fase:'9 · Seguimiento',
  titulo:'Seguimiento — la intriga que trabaja para usted (Peak-End en cada toque)',
  script:[
    {ctx:'El estudio pendiente es su aliado (Zeigarnik): el cliente quiere cerrar lo que quedó abierto. Cada contacto lleva algo nuevo: jamás un «¿lo pensó?» seco — eso aburre y baja estatus.'},
    {say:[
      {t:'WhatsApp (día 0, en menos de 5 min): «Buenas, [NOMBRE_CLIENTE]. Soy [NOMBRE_COMERCIAL], del Dpto. RESIDENCIAL de Iberdrola. Su factura ya está en marcha 🔎 Mándeme una foto entera en cuanto la tenga, así mañana le digo la verdad con su número delante.»', n:'RAPIDEZ · COMPROMISO VISIBLE · UN EMOJI'},
      {t:'Email (día 0) — Asunto: «[NOMBRE_CLIENTE], en su factura hay algo — su estudio Residencial de Iberdrola». Cuerpo: 4 líneas: lo que quedamos + lo que necesito + hora de la devolución. Nada más: limpio.', n:'ASUNTO PERSONAL · BREVEDAD · UN SOLO OBJETIVO'},
      {t:'SMS (refuerzo): «Iberdrola Residencial · [NOMBRE_COMERCIAL]: le he mandado sus números por [CANAL_SEGUIMIENTO]. Cuando los mire, lo hablamos en 2 minutos.»', n:'RECORDATORIO TANGIBLE · MICRO-PASO'},
      {t:'Cadencia: 1er toque a las 24–48 h (con una novedad) · 2º a la semana (un caso de un hogar parecido al suyo) · 3º a los 15 días · luego puerta abierta mensual.', n:'RITMO CON NOVEDAD · CIERRE BLANCO'}
    ]}
  ],
  nat:{
    alt:[
      '«Cuando saque un hueco, lo vemos. Sin prisa.»',
      '«Le dejo mi WhatsApp, que me tiene cerquita.»',
      '«Lo suyo lo miro yo, usted a lo suyo.»'
    ],
    notas:[
      'Peor error: «¿lo ha pensado?». Mejor: «le cuento algo nuevo que le afecta a su caso».',
      'Cada toque finaliza con puerta abierta: es el Peak-End de la relación, no solo de la venta.',
      'Ficha SIEMPRE actualizada: canal, día, hora, siguiente paso. Un "pendiente" mal apuntado es una venta olvidada.'
    ],
    zona:'Península.'
  },
  notas:['Si la foto de la factura tarda más de 48 h: un WhatsApp nuevo («¿le miro a ojo algo sin factura? dos minutos») y nunca reproche.'],
  micro:'Cada toque = novedad + cercanía + puerta abierta. Intrigar, no acosar.',
  opciones:[
    {ico:'🏁', cls:'ok', label:'Llamada terminada — anotar resultado', next:'inicio'},
    {ico:'🔄', cls:'warn', label:'Nueva objeción en el seguimiento', next:'inicio', sub:'Pestaña Objeciones y retome'}
  ]
},

retirada:{
  step:8, fase:'Salida',
  titulo:'Salida elegante — perder la batalla, sembrar la imagen (Peak-End)',
  script:[
    {say:[
      {t:'«Pues mire, [NOMBRE_CLIENTE], se lo agradezco de verdad: me ha escuchado con una educación que no es habitual.»', n:'AGRADECIMIENTO SINCERO · ELOGIO (se lo lleva)'},
      {t:'«Ni tocamos nada ni le doy más guerra: usted sigue con su factura como hasta hoy, tan tranquilo.»', n:'ANTI-PRESIÓN · NORMALIZACIÓN'},
      {t:'«Guárdeme una cosa: mi nombre es [NOMBRE_COMERCIAL]. Si algún mes la factura le da un susto… ya sabe dónde encontrarme.»', n:'PUERTA ABIERTA · NOMBRE COMO ANCLA'},
      {t:'«Que le vaya muy bien, y un saludo a toda la casa.»', n:'PEAK-END: CIERRE HUMANO'}
    ]}
  ],
  nat:{
    alt:[
      '«Nada, que le vaya todo muy bien. Y acuérdese de mí si cambia algo.»',
      '«Le dejo en paz, que es lo que más se agradece hoy en día.»'
    ],
    notas:[
      'La última impresión es la que se lleva: salir bien hoy = llamada receptiva dentro de 6 meses.',
      'Jamás cierre con reproche («pues se pierde el ahorro»): eso quema al cliente Y a la marca.',
      'Marque en la ficha «no hoy» con fecha de revisión: los noes de enero son síes de marzo a veces.'
    ],
    zona:'Península.'
  },
  notas:['Si insiste en que no le llamen más: se respeta al instante y se anota. Cortesía y cumplimiento.'],
  micro:'Salir por arriba: el último recuerdo es el que permanece.',
  opciones:[
    {ico:'📅', cls:'ok', label:'Apuntar contacto futuro y terminar', next:'inicio'},
    {ico:'✉️', cls:'warn', label:'Dejar plantilla de seguimiento', next:'seguimiento'}
  ]
}

};