const OBJECTIONS = {

ya_tengo:{
  nombre:'«Ya estoy con Iberdrola»',
  validacion:[
    {t:'«Pues mejor, mejor. La mitad del trabajo está hecha: ya conoce al equipo y ya tiene todo con nosotros.»', n:'VALIDACIÓN · “mejor, mejor”'}
  ],
  desactiva:[
    {t:'«Y tranquilo, que no le voy a mover nada hoy. Solo mirar.»', n:'CORTISOL ↓ · CONTROL'}
  ],
  reencuadre:[
    {t:'«Mire usted, precisamente a nuestros clientes les revisamos la tarifa gratis: porque llevar años no premia por sí solo.»', n:'REENCUADRE · CLIENTE FIEL'},
    {t:'«Hay tarifas de hace tres o cuatro años que hoy salen peor que las nuevas. Es como el móvil: el contrato viejo envejece, la casa no.»', n:'ANALOGÍA MÓVIL · PÉRDIDA POR INERCIA'}
  ],
  avance:[
    {t:'«Dígame una cosa: su última factura, ¿pasó de los cien euros o anduvo por ahí? Solo para ver si le toca revisión.»', n:'ANCLA SUAVE · ELECCIÓN DOBLE'}
  ],
  dialogo:[
    ['cliente','Es que yo ya estoy con Iberdrola.'],
    ['comercial','Pues mejor, mejor: la mitad del trabajo hecho. Y tranquilo, que hoy no tocamos nada, solo miramos. Sabe que a los clientes fieles les revisamos gratis, porque tarifas viejas salen peor que las nuevas.'],
    ['cliente','Ya… pues yo pago lo de siempre.'],
    ['comercial','Pues justo por eso: “lo de siempre” en luz es dinero dormido. ¿Pasó de los cien la última o anduvo por ahí? …Vale. Mándeme una foto y mañana le digo si le toca revisión. ¿WhatsApp?']
  ],
  round2:[
    {t:'«Le doy dos cosas sin que usted haga nada: la revisión gratis y la comparativa con lo que pagan hogares como el suyo ahora.»', n:'RECIPROCIDAD ×2 · PRUEBA SOCIAL'},
    {t:'«Varias familias de por aquí se han encontrado veinte euros al mes dormidos. Sin cambiar nada más.»', n:'CASO DE IGUALES · EUROS SIN PROMESA'},
    {t:'«¿Me manda la foto… o se la miro yo con usted delante, un minuto por videollamada?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Pues enhorabuena, de las buenas. Aun así: las tarifas envejecen, se lo digo yo.»','«Ya, y justo por eso le llamo: a los de fuera ni les toca esta revisión.»'],
    notas:['Con cliente propio hay confianza extra: usarla, jamás abusar. La fidelidad maltratada se va sin avisar.','«El contrato viejo envejece» es la analogía que todo el mundo entiende sin técnica ninguna.'],
    zona:'España (general).'
  }
},

contento:{
  nombre:'«Estoy contento con mi compañía»',
  validacion:[
    {t:'«Me alegro un montón, oiga, y que le dure. Contento con la luz no está casi nadie hoy.»', n:'VALIDACIÓN TOTAL · “montón”'}
  ],
  desactiva:[
    {t:'«Y no se la voy a desmontar, ni falta que me hace. Tranquilo.»', n:'ANTI-AMENAZA'}
  ],
  reencuadre:[
    {t:'«Ahora, le cuento un secreto del oficio: los más contentos eran a veces los que más pagaban. Porque ni la miraban.»', n:'SECRETO · PÉRDIDA INVISIBLE'},
    {t:'«Está usted contento con el servicio; nosotros miramos otra cosa: el número. ¿Me deja que lo miremos, sin tocar nada?»', n:'SEPARAR SERVICIO DE PRECIO'}
  ],
  avance:[
    {t:'«Si sale bien, se lo digo y usted sigue tan contento… pero con certeza. ¿Le parece?»', n:'GANA SIEMPRE · ELECCIÓN ABIERTA'}
  ],
  dialogo:[
    ['cliente','Yo es que estoy muy contento con mi compañía.'],
    ['comercial','Me alegro un montón, y que le dure. Le cuento algo del oficio: a veces los más contentos son los que más pagaban, porque ni la miraban. Usted está contento con el servicio; nosotros miramos solo el número.'],
    ['cliente','Hombre, el número… no me quejo.'],
    ['comercial','Pues si sale bien, se lo digo y duerme el doble de tranquilo. Una foto de la factura y mañana lo sabe. ¿Se la miro?']
  ],
  round2:[
    {t:'«Piense en esto: nadie se arrepintió nunca de saber. De no saber… todos los meses, oiga.»', n:'ARREPENTIMIENTO · PÉRDIDA MENSUAL'},
    {t:'«El estudio le cuesta una foto; no hacerlo, puede costarle todos los meses.»', n:'MÍNIMO ESFUERZO VS PÉRDIDA CRÓNICA'},
    {t:'«¿Qué me dice: lo miramos y a dormir tranquilo… o lo dejamos correr?»', n:'ELECCIÓN DOBLE CON EMOCIÓN'}
  ],
  nat:{
    alt:['«Que le dure mil años — y si cabe, que le cueste menos.»','«Perfecto, porque el guion no cambia su contento: solo mira si es caro.»'],
    notas:['Atacar al contento es pelea perdida: validar la emoción y abrir la duda del número.','«A dormir tranquilo» es el regalo que le queda aunque le diga que no: honestidad que vuelve un día.'],
    zona:'España (general, funciona mejor en zonas donde la fidelidad a comercializadora local es alta).'
  }
},

mas_caro:{
  nombre:'«Iberdrola es de las caras»',
  validacion:[
    {t:'«Entendido, se lo compro: el anuncio del vecino perpetuamente dice lo contrario, ¿verdad?»', n:'VALIDACIÓN · IRONÍA SUAVE'}
  ],
  desactiva:[
    {t:'«Pero note una cosa: caro o barato se mide con SU factura, no con la tele.»', n:'BIFURCACIÓN: DE PUBLICIDAD A DATO'}
  ],
  reencuadre:[
    {t:'«A mí me han contado que «mejor X que Iberdrola» sin ver jamás una factura. Y veo luego que la factura contaba otra película.»', n:'HISTORIA DE IGUALES · EVIDENCIA CONTRASTADA'},
    {t:'«Barato de verdad es pagar por lo que gasta su casa y no un céntimo más. Nada más barato que lo ajustado.»', n:'REFRAME DE “BARATO”'}
  ],
  avance:[
    {t:'«Hagamos una cosa: méreme la factura y mañana hablamos con números. Si el vecino lleva razón, se lo digo. ¿Vale?»', n:'COMPROMISO DE VERDAD · HUMOR BAJO'}
  ],
  dialogo:[
    ['cliente','Si es que Iberdrola es de las caras, todo el mundo lo sabe.'],
    ['comercial','Entendido: los anuncios lo tienen fácil. Pero caro se mide con su factura, no con la tele. A mí me dijeron «mejor X» sin verme jamás una factura… y la factura contaba otra película.'],
    ['cliente','Hombre, yo pago un señalado, eso sí.'],
    ['comercial','Pues mire: mándemela y mañana le digo si es caro o está ajustado. Y si el vecino lleva razón, se lo digo yo a usted. ¿WhatsApp?']
  ],
  round2:[
    {t:'«Le pongo un reto sencillo: un mes con la cifra ajustada a su casa. Si no lo nota, se vuelve sin drama.»', n:'PRUEBA · SIN COMPROMISO'},
    {t:'«De momento no hablamos de tarifas: hablamos de su número. Y su número solo lo sabemos cuando me manda la foto.»', n:'REENCUADRE AL ESTUDIO'},
    {t:'«¿WhatsApp o correo? …Y mañana hablamos con números, que es como se discute bien.»', n:'ELECCIÓN DE CANAL · CIERRE DE BUCLE'}
  ],
  nat:{
    alt:['«Todo el mundo sabe muchas cosas que no salen en su factura, oiga.»','«Caro sin factura es opinión de bar. Mirémoslo con la suya.»'],
    notas:['Nunca rebate «caro» con adjetivos: rebátalo con la invitación a medirlo con su propio papel.','«El vecino» o «la tele» como contrincante retórico quita el enfrentamiento directo con el cliente.'],
    zona:'España (general).'
  }
},

desconfianza:{
  nombre:'«¿Esto es un timo? / No doy datos»',
  validacion:[
    {t:'«Hace usted muy bien en desconfiar, oiga. Yo haría lo mismo en su sitio, con la de llamadas raras que hay.»', n:'VALIDACIÓN TOTAL · EMPATÍA'}
  ],
  desactiva:[
    {t:'«Y note esto: no le pido que se fíe. Le pido que me compruebe. Son cosas distintas.»', n:'GIRO MAESTRO: VERIFICAR ≠ FIARSE'}
  ],
  reencuadre:[
    {t:'«Prueba primera y fácil: llame usted al 900 de Iberdrola de su factura y pregunte por el Departamento Residencial — y por mí si quiere. Con eso ya filtra.»', n:'VERIFICACIÓN FÍSICA REAL'},
    {t:'«Y para el estudio no necesito su DNI completo ni claves ni nada raro: con la factura tal cual la recibe me vale, que usted la manda y usted decide qué tapa.»', n:'PRIVACIDAD DISEÑADA · CONTROL DEL CLIENTE'}
  ],
  avance:[
    {t:'«¿Le parece si lo hacemos así: usted me manda la foto tapando lo que quiera… y yo le digo la verdad igual?»', n:'ELECCIÓN CON SEGURIDAD'}
  ],
  dialogo:[
    ['cliente','Mire, no sé quién es usted, yo no doy datos por teléfono.'],
    ['comercial','Muy bien hecho, oiga, yo tampoco los daría. No le pido que se fíe: le pido que me compruebe. Llame al 900 de Iberdrola de su factura y pregunte por el Departamento Residencial. Y para mirar su caso no necesito ni DNI ni claves: con la factura normal me vale, y la manda usted tapando lo que quiera.'],
    ['cliente','Hombre, eso está mejor.'],
    ['comercial','Pues hágamelo así y nos citamos mañana con la verdad en la mano. ¿WhatsApp?']
  ],
  round2:[
    {t:'«Regla de seguridad que yo mismo aplico: jamás les pedimos claves bancarias ni contraseñas. Si se las piden a usted, cuelgue, sea quien sea.»', n:'AUTORIDAD POR PROTECCIÓN · DAR CONSEJO GRATIS'},
    {t:'«La oficina existe, el 900 existe, mi nombre existe. Los timadores no se dejan comprobar: precisamente por eso le doy yo todas las pistas.»', n:'INVERSIÓN: QUIEN ES TIMO NO PERMITE VERIFICAR'},
    {t:'«¿Probamos con la factura tapadita y me cuenta usted luego?»', n:'MÍNIMO RIESGO · TONO DE BARRIO'}
  ],
  nat:{
    alt:['«Si le hubieran engañado a usted, le diría yo lo primero: desconfíe, es sano.»','«Hoy día hacerlo sin verificar es de tontos. Usted no lo es, se nota.»'],
    notas:['Nunca «somos de fiar, créame»: la fe no se pide, se comprueba con pistas concretas.','«Tapando lo que quiera» da el control total de la privacidad: mágico con los quemados.'],
    zona:'España (general; más frecuente en mayores y en zonas con olas de llamadas spam conocidas).'
  }
},

no_interesa:{
  nombre:'«No me interesa»',
  validacion:[
    {t:'«Claro, me lo esperaba. «No me interesa» es lo que se dice cuando uno no sabe aún de qué le están hablando.»', n:'VALIDACIÓN · NORMALIZACIÓN'}
  ],
  desactiva:[
    {t:'«Ni tiene por qué interesarle todavía, oiga. Faltaría tiempo para que pique. »', n:'ANTI-PRESIÓN'}
  ],
  reencuadre:[
    {t:'«Le cuento lo que sí interesa a todo el mundo: pagar por la luz lo justo. Eso no es de «clientes de Iberdrola», es de listos.»', n:'REDEFINIR EL INTERÉS'},
    {t:'«Y mire, no es un producto: es su factura. La tiene ya. Solo falta verla con ojos de profesional.»', n:'PERTINENCIA · MÍNIMO ESFUERZO'}
  ],
  avance:[
    {t:'«Déjeme una pregunta: su última factura, ¿le cuadra o le sorprendió? …Ahí está la respuesta.»', n:'UNA PREGUNTA · AUTODESCUBRIMIENTO'}
  ],
  dialogo:[
    ['cliente','No me interesa, de verdad.'],
    ['comercial','Claro, me lo esperaba: nadie dice «sí que me interesa» a la primera. Le cuento lo que sí le interesa a todo el mundo: pagar lo justo por la luz de su casa. Eso no es de una compañía ni de otra: es de listos.'],
    ['cliente','Eso también es verdad…'],
    ['comercial','Pues una pregunta: la última factura, ¿le cuadró o le sorprendió? …Pues eso. Mándemela, la miramos y a otra cosa. ¿Va?']
  ],
  round2:[
    {t:'«Le propongo algo: si en veinte segundos no le interesa de verdad, le dejo y no me oye más. ¿Trato?»', n:'RELOJ VISIBLE · CORTESÍA DE DESPEDIDA'},
    {t:'«Y la pregunta de los veinte segundos es esta: ¿cuánto lleva sin mirar su factura con un profesional? …Pues eso.»', n:'MICRO-PREGUNTA QUE ABRE'},
    {t:'«¿Le hago el favor de la mirada gratis… o le dejo ya?»', n:'ELECCIÓN FINAL CON ESTILO'}
  ],
  nat:{
    alt:['«Perfecto, porque aquí no se fía nadie a la primera. Ni usted ni yo.»','«Me vale con que no le cueste nada escucharme veinte segundos.»'],
    notas:['El «no me interesa» es a la «oferta», no a su factura: separe una cosa de otra rápido.','«Veinte segundos» pone un contador visible: escuchar deja de ser infinito.'],
    zona:'España (general).'
  }
},

tiempo:{
  nombre:'«No tengo tiempo»',
  validacion:[
    {t:'«Se lo creo, oiga: con una casa, tiempo justo es lo que tiene. »', n:'VALIDACIÓN · ESCENA DOMÉSTICA'}
  ],
  desactiva:[
    {t:'«Por eso soy tan rápido: un minuto, dos a lo sumo, y le suelto.»', n:'ESCASEZ COMPARTIDA'}
  ],
  reencuadre:[
    {t:'«Piense que la factura le lleva más tiempo pagándola que yo le llevo mirándola. Solo una vez.»', n:'PROPORCIÓN AMENA'},
    {t:'«Y para la foto de la factura no necesita ni estar delante: la manda cuando saque un rato, y yo le cuento luego.»', n:'ASINCRONÍA · MÍNIMO ESFUERZO'}
  ],
  avance:[
    {t:'«¿Le hago una preguntita y ya está? Solo una: un mes normal, ¿pasa de cien o anda por debajo?»', n:'UNA SOLA · ELECCIÓN DOBLE'}
  ],
  dialogo:[
    ['cliente','No tengo tiempo ahora, lo siento.'],
    ['comercial','Se lo creo, con una casa tiempo es lo que hace falta. Por eso: un minuto y le suelto, palabra. Solo una preguntita: un mes normal de luz, ¿pasa de cien o anda por debajo?'],
    ['cliente','Hombre… suele pasar, la verdad.'],
    ['comercial','Pues eso ya me vale. Mándeme la factura cuando tenga un rato — le escribo yo primero — y yo le cuento mañana. Ni tiene que estar delante, oiga.']
  ],
  round2:[
    {t:'«Le robé ya medio minuto; los otros treinta se los devuelvo mañana con su número. ¿Trato?»', n:'HUMOR · DEUDA POSITIVA'},
    {t:'«O ni le robo: le mando un WhatsApp corto y usted contesta cuando quiera. ¿Le cuadra?»', n:'ASINCRONÍA TOTAL'},
    {t:'«La foto va cuando quiera. ¿Hoy o mañana?»', n:'ELECCIÓN DOBLE PEQUEÑA'}
  ],
  nat:{
    alt:['«El tiempo lo tiene la luz, que se cobra sola. Robémosle un minuto.»','«Un minuto, reloj en mano. Si me paso, me corta.»'],
    notas:['«Palabra» tras un límite corto crea contador: la gente aguanta cuando ve el final.','Si de verdad está liado (conduciendo, con niños): corte usted primero («mejor otro rato, dígame hora»): cortesía que se recuerda.'],
    zona:'España (general; horario mañana: más paciencia; 14:00–16:00: nulos).'
  }
},

despues:{
  nombre:'«Llámeme otro día / luego»',
  validacion:[
    {t:'«Perfecto, encantado de respetarle su tiempo: llámale otro día, digo, otro rato mejor.»', n:'ACEPTACIÓN CON AJUSTE'}
  ],
  desactiva:[
    {t:'«Y le ahorro el susto de que le coja otra vez en mal momento.»', n:'ANTICIPACIÓN DEL PROBLEMA'}
  ],
  reencuadre:[
    {t:'«Solo una cosita para que la llamada de luego sea buena: ¿prefiere mañana a la misma hora o mejor por la noche?»', n:'PREGUNTA QUE ACOTA · ELECCIÓN DOBLE'},
    {t:'«Porque mire: «luego» sin hora suele ser nunca, y ni usted ni yo somos de nunca.»', n:'REFRAME DEL “LUEGO” CON ELEGANCIA'}
  ],
  avance:[
    {t:'«¿Mañana por la tarde o por la noche? …Apuntado. Y si quiere adelantar, le mando un WhatsApp y lo ve cuando quiera.»', n:'HORA FIJA · CANAL PUENTE'}
  ],
  dialogo:[
    ['cliente','Llámeme usted luego, que ahora no puedo.'],
    ['comercial','Claro, pero una cosita para que la de luego sea buena: ¿mañana a la misma hora o mejor por la noche? Porque «luego» sin hora suele ser nunca, y usted no me parece de nunca.'],
    ['cliente','Hombre, mañana por la noche me va bien.'],
    ['comercial','Apuntado: mañana, pasadas las siete. Y si se adelanta, le mando WhatsApp y lo ve cuando pueda. ¡Hasta mañana!']
  ],
  round2:[
    {t:'«Le prometo una cosa rara: la llamada de mañana durará lo que usted diga. Si son dos minutos, dos.»', n:'CONTROL · MICRO-COMPROMISO'},
    {t:'«Y traigo novedad: un caso de un hogar como el suyo que se encontró un buen pico dormido. Se lo cuento de primero.»', n:'CEBO DE NOVEDAD · PRUEBA SOCIAL'},
    {t:'«Mañana tarde o noche: lo que usted mande.»', n:'ELECCIÓN FINAL'}
  ],
  nat:{
    alt:['«Apuntado en la agenda de verdad, no en la de mentira.»','«Luego con hora, para que no le coja otra vez en medio de algo.»'],
    notas:['«Luego» = «no» educado la mitad de las veces: se rescata solo con hora concreta elegida por él.','Anote la hora en la ficha con reminders: la preparación para la 2ª llamada empieza en cómo se despide la 1ª.'],
    zona:'España (general).'
  }
},

email:{
  nombre:'«Mándeme un correo / WhatsApp»',
  validacion:[
    {t:'«Por supuesto, encantado de mandárselo: es lo suyo con una casa, oiga, mirarse las cosas escritas.»', n:'VALIDACIÓN · DIGNIDAD DEL PAPEL'}
  ],
  desactiva:[
    {t:'«Ahora bien: un correo genérico es un correo que no se abre. Se lo personalizo… o no vale.»', n:'PROBLEMA DEL CORREO GENÉRICO'}
  ],
  reencuadre:[
    {t:'«Personalizar tarda dos minutos: me dice su mes normal de factura y ya lo hago suyo, no un panfleto.»', n:'MÍNIMO ESFUERZO · SIGNIFICADO'},
    {t:'«Y la segunda mitad del cuento: se lo mando hoy y mañana le llamo Y lo vemos juntos. ¿Le cuadra así?»', n:'COMPROMISO DE IDA Y VUELTA'}
  ],
  avance:[
    {t:'«Para personalizarlo: ¿su factura suele pasar de cien o anda por debajo? …Ya está. ¿Mañana por la tarde le viene bien?»', n:'MICRO-RESPUESTA + CIERRE A/B'}
  ],
  dialogo:[
    ['cliente','Mándeme un correo y ya lo miro con calma.'],
    ['comercial','Encantado. Pero correo genérico no se abre; se lo personalizo, que tarda dos minutos: un mes normal en casa, ¿pasa de cien o anda por debajo? …Vale. Se lo mando hoy y mañana le llamo y lo vemos. ¿Tarde o noche?'],
    ['cliente','Bueno, si es así… la tarde.'],
    ['comercial','Pues hoy lo tiene en su correo, mañana a la tarde suena su teléfono. Es un trato.']
  ],
  round2:[
    {t:'«Le pongo en el correo una sola pregunta grande: «¿sabe usted…?». La respuesta se la doy yo mañana.»', n:'INTRIGA ESCRITA (ZEIGARNIK EN GMAIL)'},
    {t:'«Sin folletos ni cuarenta adjuntos: su caso, cuatro líneas, mi firma.»', n:'MÍNIMO RUIDO · CERCANÍA'},
    {t:'«¿Correo o WhatsApp? El que usted mire más.»', n:'ELECCIÓN DE CANAL'}
  ],
  nat:{
    alt:['«Se lo mando de mi cuenta, que no es de robot.»','«Escrito y cortito, como me gustan a mí: cuatro líneas y al punto.»'],
    notas:['El correo sin llamada de vuelta fijada es un entierro digital: el pacto es «escrito hoy, voz mañana».','«Mi firma» personaliza de verdad: su nombre, su departamento, su horario.'],
    zona:'España (general).'
  }
},

lo_pienso:{
  nombre:'«Me lo tengo que pensar»',
  validacion:[
    {t:'«Pues muy bien, eso es de cabeza pensante. Las cosas de casa se piensan.»', n:'VALIDACIÓN REAL'}
  ],
  desactiva:[
    {t:'«Y yo no voy a ser el pesado que le quita el pensar, tranquilo.»', n:'ANTI-ACOSO'}
  ],
  reencuadre:[
    {t:'«Permítame una pregunta: ¿qué es exactamente lo que se piensa? ¿El precio, si fiarse… o hablarlo con alguien de casa?»', n:'OT DEL «PIENSO»'},
    {t:'«Porque el «pienso» suele esconder una de esas tres, y cada una tiene arreglo distinto — la última es la más fácil.»', n:'SIGUIENTE PASO SEGÚN CAUSA'}
  ],
  avance:[
    {t:'«Le propongo algo que sí no piensa: la foto de la factura ni cuesta ni compromete. Es solo ver. ¿Me la manda y mientras tú piensas, yo miro?»', n:'ACCIÓN SIN DECISIÓN · PARALELO EN LA MENTE'}
  ],
  dialogo:[
    ['cliente','No sé, me lo tengo que pensar.'],
    ['comercial','Claro, las cosas de casa se piensan. Permítame: ¿qué se piensa exactamente? ¿El precio, fiarse, hablarlo con alguien?'],
    ['cliente','Hombre, un poco hablarlo en casa.'],
    ['comercial','Perfecto, eso es lo más fácil. Mire: mándeme la foto de la factura — que ni cuesta ni compromete — y mientras ustedes lo hablan, yo la miro. Mañana hablamos con datos, no con dudas. ¿Va?']
  ],
  round2:[
    {t:'«Si quiere pensar con compañía: hago llamada con usted y su pareja, los dos escuchan lo mismo y deciden en casa.»', n:'INCLUSIÓN DEL TERCERO'},
    {t:'«Y le dejo algo para enseñar: un WhatsApp corto con lo suyo. Papel para pensar en casa, oiga.»', n:'APOYO MÚTIL PARA LA MESA'},
    {t:'«Trato: usted lo piensa y yo miro la factura. Mañana tarde hablamos. ¿Llamada juntos o solo?»', n:'ELECCIÓN DE MODALIDAD'}
  ],
  nat:{
    alt:['«Pensar siempre; decidir sin datos, nunca.»','«La factura mientras tanto no se piensa: se paga.»'],
    notas:['El «me lo pienso» puro casi nunca es verdad completa: preguntar qué exactamente lo convierte en tres objeciones normales.','La foto que «mira» mientras él piensa es el truco: convierte espera en progreso.'],
    zona:'España (general).'
  }
},

no_decisor:{
  nombre:'«Tengo que hablarlo con mi marido / mi mujer»',
  validacion:[
    {t:'«Claro, y me alegra un montón: las cosas de casa se deciden entre los dos, como tiene que ser.»', n:'VALIDACIÓN TOTAL · NORMA DE CASA'}
  ],
  desactiva:[
    {t:'«Ni se me ocurriría pedirle que decida solo algo del hogar, oiga.»', n:'RESPETO A LA PAREJA'}
  ],
  reencuadre:[
    {t:'«Lo más natural: que estén los dos y así lo oyen igual, deciden en casa y no hay «que me dijo no sé qué».»', n:'LLAMADA CON AMBOS · TRANSPARENCIA'},
    {t:'«O bien: le dejo un WhatsApp cortito, usted se lo enseña esta noche, y mañana hablamos si les cuadra. Como usted diga.»', n:'APOYO MÚTIL · ELECCIÓN'}
  ],
  avance:[
    {t:'«¿Les pilla mejor a los dos esta noche sobre las siete / ocho, o mañana por la mañana?»', n:'ELECCIÓN DOBLE · FRANJA REAL DE PAREJA'}
  ],
  dialogo:[
    ['cliente','Tengo que hablarlo con mi marido, que él lleva eso.'],
    ['comercial','Claro, y me alegra: las cosas de casa entre los dos, como tiene que ser. Lo mejor es que estén los dos y lo oyen igual. ¿Les va mejor esta noche, sobre las siete y media, o mañana por la mañana?'],
    ['cliente','Hombre, esta noche, después de cenar igual.'],
    ['comercial','Pues sobre las ocho les llamo y lo ven los dos. Sin folletos: solo lo de su casa. Y si antes quiere, le dejo mi WhatsApp para enseñarle.']
  ],
  round2:[
    {t:'«Piense que cuando se lo cuente a su pareja, le van a preguntar lo mismo que yo le he preguntado a usted. Hablemos con los dos y ya tiene respuestas.»', n:'ANTICIPACIÓN DEL DIÁLOGO DOMÉSTICO'},
    {t:'«Nada de presionar a uno: si entre los dos no sale, es que no salía, y tan amigos.»', n:'ANTI-PRESIÓN · CORTESÍA'},
    {t:'«¿Les cito a los dos esta noche, o prefiere mandarle primero el WhatsApp y después llamo?»', n:'DOS CAMINOS, LOS DOS BUENOS'}
  ],
  nat:{
    alt:['«Las cosas de casa, habladitas en casa. Yo solo me apunto a ayudar.»','«Con su pareja delante si quiere: así no hay cuento de segunda mano.»'],
    notas:['Atacar al decisor ausente es destrozar la decisión del presente: nunca lo haga.','La pareja como aliada: el que decide bien en pareja, decide quedarse cuando estácontento.'],
    zona:'España (general; trato con mayores: aún más cierto).'
  }
},

permanencia:{
  nombre:'«Tengo permanencia con mi compañía»',
  validacion:[
    {t:'«Normal, oiga: medio país tiene permanencia firmada sin acordarse de cuándo acaba.»', n:'NORMALIZACIÓN · MEMORIA DIFUSA'}
  ],
  desactiva:[
    {t:'«Y tranquilidad: ni la quito yo ni la prometo nadie: está ahí hasta que está. Lo que sí se puede es mirar.»', n:'3 VERDADES: NO LA QUITO / NO LA PROMETO / SÍ LA MIRO'}
  ],
  reencuadre:[
    {t:'«Mire usted: muchas permanencias ya caducaron y la gente paga el precio viejo de después sin saberlo. A veces la permanencia es de papel.»', n:'PÉRDIDA INVISIBLE · CADUCIDAD OCULTA'},
    {t:'«La fecha la tiene en la factura, escrita pequeña. Con una foto la vemos en un minuto y hablamos con la verdad.»', n:'VERIFICACIÓN REAL · FACTURA COMO FUENTE'}
  ],
  avance:[
    {t:'«Déjeme dos cosas: la fecha exacta si la sabe, y el permiso de mirar la factura. ¿La tiene a mano o se la miro cuando la encuentre?»', n:'DOBLE MICRO-PASO'}
  ],
  dialogo:[
    ['cliente','Es que creo que tengo permanencia hasta el año que viene.'],
    ['comercial','Normal, medio país con la permanencia difusa. Tranquilo: ni la quito yo ni la prometo nadie. Lo que sí se puede es mirar: muchas ya caducaron y siguen cobrando. ¿Tiene la factura a mano?'],
    ['cliente','Por aquí tengo una de hace poco.'],
    ['comercial','Pues mándemela entera y le digo: fecha real de permanencia, o si ya se quedó atado de balde. Con la verdad en la mano, mañana hablamos. ¿WhatsApp?']
  ],
  round2:[
    {t:'«Si sigue atado unos meses, planificamos para que le pille el cambio justo al final: ni penalización ni prisa.»', n:'PLANIFICACIÓN ÉTICA · SIN PÉRDIDA'},
    {t:'«Y mientras, aprovechamos: revisarle si la potencia le pasó de puntillas, que eso sí no dice la permanencia.»', n:'GANCHO PARALELO GRATIS'},
    {t:'«¿Me apunta hoy la fecha… o me manda la factura y la vemos juntos?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«La permanencia no muerde: lo que muerde es no saber cuándo acaba.»','«Firmó su día; hoy ya es historia muchas veces.»'],
    notas:['Prohibido prometer quitar permanencias: se mira la fecha REAL en la factura y se habla con ella.','Si no sabe ni cuándo la firmó: hay factura, hay verdad. Todo se resuelve mirando, no jurando.'],
    zona:'España (general).'
  }
},

momento:{
  nombre:'«Ahora no puedo (conduzco, niños, trabajo)»',
  validacion:[
    {t:'«Perdone, con eso no se juega: si va conduciendo o con carritos, corte ahora mismo.»', n:'SEGURIDAD PRIMERO · CORTESÍA REAL'}
  ],
  desactiva:[
    {t:'«La luz espera; su familia no. Le llamo otro rato, sin falta.»', n:'PRIORIDADES EN SU SITIO'}
  ],
  reencuadre:[
    {t:'«Solo dígame cuándo suena mal menos la campana: ¿mañana a esta misma o por la noche?»', n:'SALIR CON HORA · HUMOR FINO'},
    {t:'«O le mando un WhatsApp ahora —que lo lee cuando le dé— y mañana hablamos. ¿Cómo le viene?»', n:'PUENTE ASÍNCRONO'}
  ],
  avance:[
    {t:'«¿WhatsApp ahora o llamada mañana por la noche?»', n:'ELECCIÓN DOBLE CORTA'}
  ],
  dialogo:[
    ['cliente','Ahora no, que voy conduciendo.'],
    ['comercial','¡Perdone, corte ya! La luz espera, la carretera no. ¿WhatsApp ahora para verlo luego, o le llamo mañana por la noche?'],
    ['cliente','El WhatsApp, que el coche…'],
    ['comercial','Marchando. Se lo dejo ahora mismo y lo mira cuando pare. ¡Buen viaje!']
  ],
  round2:[
    {t:'«Apuntado y sin sustos: mañana tarde, cuando la casa baja el ritmo.»', n:'FRANJA EMPÁTICA'},
    {t:'«Le dejo mi nombre y el motivo en una línea, que si se olvida el número no le suene a robot.»', n:'IDENTIDAD CLARA · ANTI-SPAM'},
    {t:'«¿Prefiere que le escriba yo… o que le llame directamente mañana?»', n:'ELECCIÓN DE CANAL'}
  ],
  nat:{
    alt:['«Conduciendo no se vende ni se compra. Corte y a cuidarse.»','«Los niños no esperan a que uno cuelgue. Vamos a su hora.»'],
    notas:['Cortar usted primero cuando la seguridad manda: gesto que se recuerda más que cualquier discurso.','«Buen viaje» / «que descanse» cierra humano: la gente guarda esas palabras como quien dice «vaya chico majo».'],
    zona:'España (general).'
  }
},

ya_llamaron:{
  nombre:'«Ya me llamaron / no dejáis de llamar»',
  validacion:[
    {t:'«Tiene toda la razón del mundo, y se lo digo yo que esto es un continuo. Perdone la pesadez.»', n:'VALIDACIÓN + DISCULPA ÚNICA'}
  ],
  desactiva:[
    {t:'«Mire, hoy no es más de lo mismo: hoy no le vendo nada. Hoy le pido algo distinto.»', n:'CAMBIO DE REGISTRO'}
  ],
  reencuadre:[
    {t:'«Me explico: antes le contaban ofertas. Yo solo le pido una foto de su factura, mirarla gratis y decirle la verdad.»', n:'DEL SPAM AL ESTUDIO'},
    {t:'«Y si no quiere ni eso, se lo apunto para que no le molesten más: palabra. Su teléfono, sus reglas.»', n:'CONTROL TOTAL · SALIDA DIGNA'}
  ],
  avance:[
    {t:'«¿Le miro la factura, que es distinto… o le apunto «no más» y le dejo en paz?»', n:'ELECCIÓN FINAL HUMANA'}
  ],
  dialogo:[
    ['cliente','Ya me llamasteis el otro día, qué pesadez.'],
    ['comercial','Razón tiene, y perdóneme de verdad. Hoy no es más de lo mismo: no le vendo nada. Solo le pido una foto de su factura, la miro gratis y le digo la verdad. Y si ni eso: apunto aquí «no más llamadas» y le dejo en paz, palabra.'],
    ['cliente','Hombre… pues con esa frente.'],
    ['comercial','Pues eso. ¿Le hago el favor de la mirada… o me apunto su “no” y todos tranquilos?']
  ],
  round2:[
    {t:'«Le firmo lo que dice: ni una llamada de seguimiento si me dice que no. Su teléfono, su regla.»', n:'PROMESA ESCRITABLE'},
    {t:'«Y si cura la desconfianza con la foto: mañana le cuento lo que muchos de por aquí se han encontrado. Sin spam.»', n:'PUERTA CON DATO LOCAL'},
    {t:'«¿Le miro la factura hoy… o hoy es el adiós elegante?»', n:'DOS DESPEDIDAS POSIBLES'}
  ],
  nat:{
    alt:['«Razón y perdón, que es lo que suele faltar.»','«Su teléfono suena mucho; hoy suena distinto.»'],
    notas:['Una disculpa, no dos: más de una ya es servilismo y baja autoridad.','Si dice NO rotundo: respetar + anotar en ficha con fecha. La reputación de la marca pesa más que una venta forzada.'],
    zona:'España (general; en zonas con saturación comercial conocida, esta objeción sube).'
  }
},

no_cambiar:{
  nombre:'«No me cambio: una vez me cambiaron y fue un desastre»',
  validacion:[
    {t:'«No me extraña, oiga: si a uno le fallan así, no se vuelve a mover. Cualquiera se queda pegado. »', n:'VALIDACIÓN DE LA HERIDA'}
  ],
  desactiva:[
    {t:'«Y aquí no le voy a pedir que se mueva: solo que mire. Los pies quietos, los ojos abiertos.»', n:'SEPARAR MIRAR DE MOVERSE'}
  ],
  reencuadre:[
    {t:'«El desastre casi siempre fue lo mismo: cambiado sin ver la factura, con letra pequeña y sin verificación. Justo lo contrario de esto.»', n:'DIAGNÓSTICO DEL MAL PASADO'},
    {t:'«Con nosotros usted lo ve todo por escrito antes, y la verificación de llamada le obliga a decir sí sabiendo qué. Ni un cambio por accidente.»', n:'GARANTÍAS LEGALES REALES'}
  ],
  avance:[
    {t:'«Hagamos una cosa que no sea mudanza: mándeme la factura, la miro y le digo con su número si vale la pena quedarse o no. ¿Va?»', n:'MÍNIMO MOVIMIENTO · DATO'}
  ],
  dialogo:[
    ['cliente','No me cambio ni loco, que una vez me cambiaron y fue un desastre.'],
    ['comercial','No me extraña: fallan así y cualquiera se queda pegado. Mire, aquí no se muda nadie hoy: solo mira. Los desastres pasaron por cambiar sin factura ni verificación. Con nosotros lo ve todo por escrito y la verificación le obliga a decir sí sabiendo qué.'],
    ['cliente','Eso está bien… pero ya estoy escarmentado.'],
    ['comercial','Pues escarmentado y con datos, que es más. Una foto, la miro, y si su tarifa actual es buena, se lo digo y se queda con el gusto de saberlo. ¿Va?']
  ],
  round2:[
    {t:'«Le doy la regla de oro que usted ya sabe: si no lo ve por escrito, no firma. Mi propuesta: escrito primero, firma después o nunca.»', n:'REGLA DEL PROPIO CLIENTE DEVUELTA'},
    {t:'«Y la alternativa blanda: quedarse como está, pero sabiendo. El «no» con información vale más que el «no» con miedo.»', n:'REFRAME DEL NO'},
    {t:'«¿Factura mirada… o seguimos sin verla?»', n:'ELECCIÓN SIMPLE'}
  ],
  nat:{
    alt:['«Escarmentado, pero con factura: mejor combo que hay.»','«Quien mal cambió, sabe que verlo por escrito es el cambio.»'],
    notas:['No discuta su experiencia pasada: úsela como prueba de que el método suyo es el contrario.','«Firma después o nunca» pone el poder de veto en su mano: la gente dice sí cuando no la empujan.'],
    zona:'España (general; muy habitual en clientes que estuvieron en ofertas tipo “descuento permanente” de terceros).'
  }
},

solar:{
  nombre:'«Tengo placas solares, pago poquísimo»',
  validacion:[
    {t:'«¡Pues enhorabuena, adelantado! De los pocos que vieron el futuro antes que la factura. »', n:'ELOGIO SINCERO · PIONERO'}
  ],
  desactiva:[
    {t:'«Y tranquilo: no vengo a montarle nada. Usted ya montó lo suyo.»', n:'ANTI-INVASIÓN'}
  ],
  reencuadre:[
    {t:'«Precisamente por tener placas le conviene mirar una cosa: si sus excedentes los están compensando bien… o si se le quedan en el tejado.»', n:'EXCEDENTES Y COMPENSACIÓN · PÉRDIDA ACTUAL'},
    {t:'«Hay casos de placas con batería virtual mal configurada que pagan de más lo importado. Con sus números lo veo en un momento.»', n:'DIAGNÓSTICO TÉCNICO GRATIS'}
  ],
  avance:[
    {t:'«Déjeme ver su factura — la de compensación también — y le digo si su sol está sacando todo el rendimiento. ¿Le suena?»', n:'FACTURA COMPLETA · RENDIMIENTO'}
  ],
  dialogo:[
    ['cliente','Yo tengo placas solares, pago poquísimo.'],
    ['comercial','¡Enhorabuena, adelantado! De los pocos que se adelantaron a la factura. Y no vengo a montarle nada. Precisamente por sus placas: ¿sabe si sus excedentes los compensan bien? Hay placas con batería virtual mal fina que pagan de más lo que cojen de noche.'],
    ['cliente','Hombre, yo veo que sí me bajan bastante…'],
    ['comercial','Pues si es así, se lo confirmo gratis — y si no, se lo descubro. Factura de compensación incluida. ¿Me la manda?']
  ],
  round2:[
    {t:'«Y si le falta cacharro (batería física, más placas, cargador de coche en casa): el técnico se acerca y le hace el informe. Gratis.»', n:'EXTENSIÓN TÉCNICA · INFORME GRATIS'},
    {t:'«Con su sol, el error no es no tener tarifa: es no aprovecharla entera. Lo vemos con sus mismos números.»', n:'RENDIMIENTO · DATO PROPIO'},
    {t:'«¿Factura por WhatsApp o visita del técnico? Lo que le pida el cuerpo.»', n:'ELECCIÓN A/B TÉCNICA'}
  ],
  nat:{
    alt:['«Usted ya sabe lo que es mirar facturas: el mío es el siguiente paso.»','«Los que tienen placas son mis clientes favoritos: entienden de números.»'],
    notas:['El pionero solar odia que le traten de ignorante: trátese de igual a igual, con respeto técnico.','Batería virtual + compensación de excedentes: es el punto donde se suele perder dinero sin ruido.'],
    zona:'España (general; muy frecuente en urbanizaciones y chalets de costa).'
  }
}

};