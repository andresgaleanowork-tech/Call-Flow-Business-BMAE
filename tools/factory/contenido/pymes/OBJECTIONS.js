const OBJECTIONS = {

ya_tengo:{
  nombre:'«Ya tengo comercializadora»',
  validacion:[
    {t:'«Claro que la tiene, faltaría más. Todas las empresas serias la tienen.»', n:'VALIDACIÓN · “faltaría más”'}
  ],
  desactiva:[
    {t:'«Y tranquilo, que no le voy a pedir que toque nada. Ni hoy ni mañana.»', n:'CORTISOL ↓ · CONTROL'}
  ],
  reencuadre:[
    {t:'«Mire usted, justo por eso le llamo. Tener compañía no es un freno: es el punto de partida.»', n:'REENCUADRE'},
    {t:'«La pregunta es otra: ¿cuánto le cuesta al mes no mirarla?»', n:'PÉRDIDA ACTUAL'}
  ],
  avance:[
    {t:'«Dígame una cosa: la última factura, ¿pasó de cuatrocientos euros o anduvo por ahí?»', n:'ABIERTA CON ANCLA · “anduvo por ahí”'}
  ],
  dialogo:[
    ['cliente','Es que ya tengo compañía.'],
    ['comercial','Claro, faltaría más, es lo normal. Y tranquilo, que no tocamos nada. Solo una curiosidad: ¿cuánto le cuesta al mes no mirarla? La última factura, ¿pasó de los cuatrocientos?'],
    ['cliente','Pues… anduvo por los cuatrocientos cincuenta.'],
    ['comercial','Pues mire, con una foto mañana ve su número en euros. Gratis total. ¿Por WhatsApp o por correo?']
  ],
  round2:[
    {t:'«Le dejo dos cosas de regalo: el estudio, que es gratis, y el detalle que les estamos haciendo a las empresas de la zona.»', n:'RECIPROCIDAD ×2'},
    {t:'«Tres [SECTOR] de por aquí, a menos de cinco kilómetros, ya lo tienen.»', n:'PRUEBA SOCIAL ESPECÍFICA'},
    {t:'«¿Cómo lo hacemos: me manda la foto… o paso yo a verle?»', n:'ELECCIÓN A/B · “paso a verle”'}
  ],
  nat:{
    alt:['«Lo normal, oiga. Lo raro sería no tener.»','«Si no la tuviera, me preocuparía yo por usted.»'],
    notas:['«Faltaría más» valida sin servilismo: es la marca española de aceptación total.','«Paso a verle» es el ofrecimiento español directo; mejor que «podríamos concertar una visita».','«Anduvo por ahí» es matizador de calle: ayuda a que el cliente redondee sin miedo.'],
    zona:'España (general).'
  }
},

permanencia:{
  nombre:'«Estoy en contrato / tengo permanencia»',
  validacion:[
    {t:'«Me alegro de que lo tenga controlado, eso habla muy bien de usted.»', n:'VALIDACIÓN · ORGULLO'}
  ],
  desactiva:[
    {t:'«Y tranquilo: hoy no tocamos nada. Ni este mes tampoco.»', n:'CORTISOL ↓ · TIEMPO'}
  ],
  reencuadre:[
    {t:'«Mire, en la factura viene la fecha exacta en que termina. A veces hay sorpresas de las buenas.»', n:'ZEIGARNIK · “de las buenas”'},
    {t:'«Y oiga, mientras llega ese día, cada mes se le va lo mismo de la caja. Esperar también cuesta.»', n:'PÉRDIDA ACTUAL'}
  ],
  avance:[
    {t:'«¿Lo miramos ahora juntos… o me manda una foto y se lo dejo por escrito?»', n:'ELECCIÓN A/B · “por escrito”'}
  ],
  dialogo:[
    ['cliente','No puedo, tengo permanencia hasta el año que viene.'],
    ['comercial','Me alegro de que lo tenga controlado, eso habla bien de usted. Y tranquilo, que hoy no tocamos nada. Pero fíjese: la fecha exacta está en su factura, y mientras llega, cada mes se le va lo mismo. ¿Lo vemos ahora juntos o me manda una foto y se lo dejo por escrito?']
  ],
  round2:[
    {t:'«El estudio es gratis y lo preparamos hoy. Y el día que le salga gratis… arranca solo.»', n:'GRATIS · AUTOMÁTICO · CORTISOL ↓'},
    {t:'«¿Se lo dejo listo con la factura… o lo vemos un ratito en persona?»', n:'ELECCIÓN A/B · DIMINUTIVO “un ratito”'}
  ],
  nat:{
    alt:['«Eso, con la factura en la mano, se ve en un minuto.»','«Mientras tanto, usted no firma nada. Faltaría más.»'],
    notas:['«De las buenas» (sorpresas de las buenas) es matiz coloquial español cariñoso.','«Un ratito» es diminutivo social: acorta la percepción del compromiso.','«Por escrito» tranquiliza al ordenado: deja constancia sin presión.'],
    zona:'España (general).'
  }
},

no_interesa:{
  nombre:'«No me interesa»',
  validacion:[
    {t:'«Le entiendo perfectamente, [NOMBRE_CLIENTE], faltaría más.»', n:'VALIDACIÓN · NOMBRE'}
  ],
  desactiva:[
    {t:'«Y no le pido interés, no se preocupe. Le pido medio minuto.»', n:'CORTISOL ↓ · ESCASEZ · “medio minuto”'}
  ],
  reencuadre:[
    {t:'«Es que el interés no se tiene, oiga. Se descubre.»', n:'REENCUADRE · FRASE ANCLA'},
    {t:'«Las empresas de [SECTOR] que he llamado esta semana tampoco tenían… hasta que vieron su número.»', n:'PRUEBA SOCIAL · ZEIGARNIK · PRETÉRITO PERFECTO'}
  ],
  avance:[
    {t:'«Dígame: ¿este año la factura le ha subido poco… o le ha subido bastante?»', n:'ELECCIÓN DOBLE · PÉRDIDA · PRETÉRITO PERFECTO'}
  ],
  dialogo:[
    ['cliente','No me interesa.'],
    ['comercial','Le entiendo perfectamente, faltaría más. Y no le pido interés: le pido medio minuto. Las empresas de su sector que he llamado esta semana tampoco tenían… hasta que vieron su número. Dígame, ¿este año le ha subido poco o bastante?'],
    ['cliente','Bastante, la verdad.'],
    ['comercial','Pues ahí tiene su número. Una foto y mañana lo tiene, gratis. ¿WhatsApp o correo?']
  ],
  round2:[
    {t:'«Le dejo mi WhatsApp y un regalo: el estudio gratis, listo para cuando usted diga.»', n:'CONTROL AL CLIENTE · RECIPROCIDAD'},
    {t:'«¿Se lo mando hoy… o le llamo dentro de un mes, sin compromiso?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Ya, ya me hago cargo.»','«Claro, cómo no.»'],
    notas:['«Faltaría más» tras «le entiendo» es la doble validación española clásica.','«Medio minuto» pesa menos que «treinta segundos». Úselo siempre en su lugar.','«Se descubre» como respuesta corta y rotunda: en España las frases de dos palabras convencen.'],
    zona:'España (general).'
  }
},

mas_caro:{
  nombre:'«Es más caro / Iberdrola es cara»',
  validacion:[
    {t:'«Gracias por decírmelo tan claro. Prefiero la verdad a la cortesía, oiga.»', n:'VALIDACIÓN · RESPETO'}
  ],
  desactiva:[
    {t:'«Y no le voy a discutir, no. Los números discuten solos.»', n:'CORTISOL ↓ · “no” pospuesto enfático [TONO ↓]'}
  ],
  reencuadre:[
    {t:'«Fíjese lo que vemos cada semana: empresas con la energía barata… y la potencia carísima, dormida.»', n:'REENCUADRE · PRUEBA SOCIAL'},
    {t:'«Por esta zona, de media, se escapa entre un diez y un veinte por ciento cada mes. Mes sí, mes también.»', n:'ANCLA % · PÉRDIDA ACTUAL · “se escapa”'},
    {t:'«Y un precio a ciegas no se lo doy, porque sería engañarle. Su verdad la tiene su factura, no yo.»', n:'HONESTIDAD — el no-precio ES el argumento'}
  ],
  avance:[
    {t:'«¿Qué miramos primero: las potencias… o el precio de la energía?»', n:'ELECCIÓN A/B'}
  ],
  dialogo:[
    ['cliente','Iberdrola es cara, eso lo sabe todo el mundo.'],
    ['comercial','Gracias por decírmelo claro. Y no le discuto, oiga: los números discuten solos. Cada semana vemos empresas con la energía barata y la potencia carísima, dormida: entre un diez y un veinte por ciento que se les escapa cada mes. Yo un precio a ciegas no se lo doy; se lo doy con su factura delante. ¿Miramos primero potencias o energía?']
  ],
  round2:[
    {t:'«Y sume una cosa a la cuenta: gestor personal, auditoría de cada factura y emergencia veinticuatro horas.»', n:'VALOR AÑADIDO · EXCLUSIVO'},
    {t:'«¿Lo comparamos gratis con su factura… o se acerca a la oficina y lo vemos con un café?»', n:'ELECCIÓN A/B · RECIPROCIDAD · “se acerca”'}
  ],
  nat:{
    alt:['«Puede que le sorprenda lo que hay dentro de esa factura…»','«Mire, hablar de caro o barato sin verla es echarlo a suertes.»'],
    notas:['El «no» pospuesto («no le voy a discutir, no») es marca española de énfasis verbal.','«Se escapa» pinta la pérdida sin acusar a nadie.','«A ciegas» suena a gente seria: no prometer sin ver es, aquí, el mejor argumento.'],
    zona:'España (general).'
  }
},

tiempo:{
  nombre:'«No tengo tiempo»',
  validacion:[
    {t:'«Claro, cómo no. Usted está trabajando, ya me hago cargo.»', n:'VALIDACIÓN · “ya me hago cargo”'}
  ],
  desactiva:[
    {t:'«Y no le quito tiempo: le quito trabajo.»', n:'CORTISOL ↓ · REENCUADRE DEL TIEMPO'},
    {t:'«Es una foto. Medio minuto. El resto lo hago yo.»', n:'MÍNIMO ESFUERZO'}
  ],
  reencuadre:[
    {t:'«Usted atiende su negocio y yo, mientras, le encuentro el dinero.»', n:'RECIPROCIDAD · FUTURE PACING'},
    {t:'«Ni se entera.»', n:'CORTISOL ↓ · brevedad que vende'}
  ],
  avance:[
    {t:'«¿Por WhatsApp o por correo? Como le venga mejor.»', n:'ELECCIÓN A/B DE CANAL'}
  ],
  dialogo:[
    ['cliente','No tengo tiempo.'],
    ['comercial','Ya me hago cargo, cómo no. Mire, no le quito tiempo: le quito trabajo. Una foto, medio minuto, y mientras usted atiende su negocio yo le encuentro el dinero. Ni se entera. ¿Por WhatsApp o por correo?']
  ],
  round2:[
    {t:'«Y si ni la foto cabe hoy, me adapto a su reloj, faltaría más.»', n:'CONTROL AL CLIENTE'},
    {t:'«¿Qué le molesta menos: primera hora de la mañana… o última de la tarde?»', n:'ELECCIÓN A/B · HUMOR LIGERO'}
  ],
  nat:{
    alt:['«Perdone que le moleste. Dos cosas y le dejo.»','«Le piso los talones solo 30 segundos, que sé que está liado.»'],
    notas:['«Ya me hago cargo» es LA respuesta empática española: equivale a «entiendo su situación» pero hablada.','«Como le venga mejor» entrega la elección sin abrir el no.','Interrumpir con educación está permitido: «perdone que le interrumpa un segundo…».'],
    zona:'España (general).'
  }
},

despues:{
  nombre:'«Llámame más tarde / otro día»',
  validacion:[
    {t:'«Perfecto, su tiempo manda. Faltaría más.»', n:'VALIDACIÓN · CONTROL AL CLIENTE'}
  ],
  desactiva:[
    {t:'«Y así la próxima llamada son dos minutos, no diez.»', n:'CORTISOL ↓ · ESCASEZ'}
  ],
  reencuadre:[
    {t:'«Le dejo mi WhatsApp ahora mismo. Si me adelanta la foto, le llamo ya con el estudio hecho.»', n:'RECIPROCIDAD · ZEIGARNIK'},
    {t:'«Imagínelo: descuelga el teléfono… y ya están los números.»', n:'FUTURE PACING · ALIVIO · “descuelga”'}
  ],
  avance:[
    {t:'«¿Qué le cuadra mejor: mañana a primera hora, sobre las nueve y media, o por la tarde, tipo cinco?»', n:'ELECCIÓN A/B · “¿le cuadra?” · “tipo cinco” — día y hora SIEMPRE concretos'}
  ],
  dialogo:[
    ['cliente','Llámame la semana que viene.'],
    ['comercial','Su tiempo manda, faltaría más. Le dejo mi WhatsApp ahora mismo: si me adelanta la foto de la factura, le llamo con el estudio hecho y le quito dos minutos, no diez. ¿Le cuadra el lunes a las nueve y media o el martes tipo cinco?']
  ],
  round2:[
    {t:'«Si la semana se le lía, no pasa nada: los números le esperan en el WhatsApp.»', n:'CORTISOL ↓ · ZEIGARNIK ESCRITO · “se le lía”'},
    {t:'«¿Le escribo el lunes… o el martes?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Sin problema, lo dejamos para cuando usted diga. Solo fíjeme un día.»','«Apuntado. Y le adelanto una cosa por WhatsApp para ir abriendo boca.»'],
    notas:['«¿Le cuadra?» es la pregunta de agenda española por excelencia.','«Tipo cinco» = sobre las cinco (coloquial, España).','«Se le lía» = se le complica: muy usado en la calle.','«Para ir abriendo boca» = para ir preparando el terreno.'],
    zona:'España (general).'
  }
},

no_decisor:{
  nombre:'«No soy el encargado»',
  validacion:[
    {t:'«Gracias por decírmelo, de verdad. Así no le hago perder el tiempo.»', n:'VALIDACIÓN · RESPETO'}
  ],
  desactiva:[
    {t:'«Y a usted no le compromete a nada, quédese tranquilo.»', n:'CORTISOL ↓'}
  ],
  reencuadre:[
    {t:'«Usted se conoce esta casa mejor que nadie, eso está claro.»', n:'ORGULLO — el filtro se convierte en experto'},
    {t:'«A quien decide le va a venir bien saberlo antes de que acabe el mes. Que cada mes cuenta.»', n:'PÉRDIDA TIEMPO · ALIADO INTERNO'}
  ],
  avance:[
    {t:'«¿Quién lleva el tema de la luz… y a qué hora le pillo más tranquilo?»', n:'ABIERTA DOBLE · “le pillo” (fórmula telefónica)'},
    {t:'«¿Y me apunta su nombre, para decir que llamo de su parte?»', n:'ALIADO · PERTENENCIA'}
  ],
  dialogo:[
    ['cliente','Aquí el que decide es el jefe, y ahora mismo no está.'],
    ['comercial','Gracias por decírmelo, así no le hago perder el tiempo. Usted se conoce esta casa mejor que nadie: a quien decide le vendrá bien saberlo antes de fin de mes. ¿Cómo se llama y a qué hora le pillo más tranquilo? …Apuntado. ¿Y me dice su nombre, para decir que llamo de su parte?']
  ],
  round2:[
    {t:'«Si prefiere, le dejo el resumen por correo para que se lo haga llegar… y así queda usted como un rey.»', n:'ALIADO · ORGULLO · “quedar como un rey”'},
    {t:'«¿Se lo mando al correo de la empresa… o se lo dejo a usted y se lo enseña?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«¿Me pone con él/ella cuando tenga un segundo?»','«¿Quién suele llevar estos temas por aquí?»'],
    notas:['«Quedar como un rey» es idiomático español puro: quedar muy bien.','«Le pillo más tranquilo» es fórmula telefónica auténtica de agenda.','Nunca presione al filtro: hoy le atiende, mañana le abre la puerta.'],
    zona:'España (general).'
  }
},

email:{
  nombre:'«Mándame un email»',
  validacion:[
    {t:'«Por supuesto, hoy mismo lo tiene.»', n:'VALIDACIÓN · COMPROMISO'}
  ],
  desactiva:[
    {t:'«Y qué va, nada de folletos: solo su caso.»', n:'CORTISOL ↓ · PERSONAL · “qué va”'}
  ],
  reencuadre:[
    {t:'«Para que no se pierda entre tanta bandeja, se lo personalizo con su sector.»', n:'PERSONALIZACIÓN'},
    {t:'«Las empresas de [SECTOR] de [CIUDAD] están encontrando dinero dormido cada mes, fíjese.»', n:'PRUEBA SOCIAL ESPECÍFICA · PÉRDIDA · ZEIGARNIK'}
  ],
  avance:[
    {t:'«Su factura del mes, ¿suele pasar de quinientos euros… o anda por debajo?»', n:'ELECCIÓN · “anda por debajo”'},
    {t:'«Hoy lo tiene en el correo y mañana le llamo un par de minutos: ¿a las diez o a las cinco?»', n:'ELECCIÓN A/B — correo sin llamada fijada = correo muerto'}
  ],
  dialogo:[
    ['cliente','Mándeme un correo y ya lo miro.'],
    ['comercial','Por supuesto, hoy mismo. Y nada de folletos: solo su caso. Para personalizarlo: ¿su factura suele pasar de quinientos euros o anda por debajo? …Perfecto. Le preparo algo con empresas de su sector. Lo tiene hoy y mañana le llamo un par de minutos: ¿a las diez o a las cinco?']
  ],
  round2:[
    {t:'«Si el correo se pierde entre papeles, no pasa nada: yo le busco el hilo.»', n:'HUMOR · PERSISTENCIA ELEGANTE · “buscar el hilo”'},
    {t:'«¿Le escribo mejor el jueves… o el lunes que viene, con más calma?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Sin problema ninguno. Le mando algo cortito y al grano.»','«Se lo dejo en cuatro líneas, que sé que el correo se atraganta.»'],
    notas:['«Qué va» es la negación suave española para desactivar ideas («nada de folletos, qué va»).','«Buscar el hilo» = retomar la conversación. Muy natural.','«Cortito» (diminutivo) promete correo breve: aumenta la lectura real.'],
    zona:'España (general).'
  }
},

lo_pienso:{
  nombre:'«Ya me lo pienso»',
  validacion:[
    {t:'«Claro que se lo piensa. Las cosas buenas se piensan.»', n:'VALIDACIÓN · ORGULLO'}
  ],
  desactiva:[
    {t:'«Y yo no decido por usted, ni falta que hace.»', n:'CORTISOL ↓ · CONTROL · “ni falta que hace”'}
  ],
  reencuadre:[
    {t:'«Pero pensar sin datos no es pensar, oiga. Es adivinar.»', n:'REENCUADRE · FRASE ANCLA'},
    {t:'«Déjeme darle los números, que son gratis, y piensa con la calculadora y no con la duda.»', n:'RECIPROCIDAD · SISTEMA 2 AL SERVICIO'},
    {t:'«Porque mientras lo piensa, cada mes se le va lo mismo. Eso no se piensa. Se paga.»', n:'PÉRDIDA ACTUAL · RITMO CORTANTE'}
  ],
  avance:[
    {t:'«¿Le preparo el estudio con la factura… o le mando antes el resumen por WhatsApp?»', n:'ELECCIÓN A/B'}
  ],
  dialogo:[
    ['cliente','Ya me lo pensaré.'],
    ['comercial','Claro, las cosas buenas se piensan, y yo no decido por usted, ni falta que hace. Pero pensar sin datos es adivinar. Le doy sus números gratis y piensa con calculadora. Porque mientras lo piensa, cada mes se le va lo mismo. ¿Le preparo el estudio con la factura o le mando el resumen por WhatsApp?']
  ],
  round2:[
    {t:'«Le dejo el estudio hecho igualmente, que los números no caducan.»', n:'RECIPROCIDAD · ZEIGARNIK'},
    {t:'«Lo comentamos la semana que viene: ¿lunes… o martes?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Hombre, cómo no se lo va a pensar. Es su dinero.»','«Ni se le ocurra decidir a ciegas, primero los números.»'],
    notas:['«Ni falta que hace» es marca española rotunda para «no es necesario».','«Los números no caducan» quita prisa sin quitar tensión útil.','«Hombre» úsese solo como matiz propio de énfasis, nunca para corregir al cliente.'],
    zona:'España (general).'
  }
},

no_cambiar:{
  nombre:'«No quiero cambiar de compañía»',
  validacion:[
    {t:'«Perfecto. Su empresa, sus reglas. Ahí no entro.»', n:'VALIDACIÓN · CONTROL · “ahí no entro”'}
  ],
  desactiva:[
    {t:'«Y no se toca nada, oiga. Ni una coma.»', n:'CORTISOL ↓ · “ni una coma”'}
  ],
  reencuadre:[
    {t:'«No le pido que se mueva. Le pido que mire.»', n:'CONTRASTE · MICRO-DECISIÓN'},
    {t:'«Mirar es gratis. No mirar, oiga, se paga cada mes.»', n:'GRATIS · PÉRDIDA ACTUAL'},
    {t:'«Y con el número delante decide mejor… aunque sea para quedarse igual.»', n:'CONTROL — permiso para no moverse'}
  ],
  avance:[
    {t:'«Pregunta honesta: ¿sabe hoy lo que paga por cada kilovatio… o ni idea?»', n:'ABIERTA · HUMOR — las dos respuestas justifican el estudio'}
  ],
  dialogo:[
    ['cliente','No quiero cambiar de compañía.'],
    ['comercial','Perfecto: su empresa, sus reglas, y no se toca ni una coma. No le pido que se mueva, le pido que mire. Mirar es gratis; no mirar se paga cada mes. Dígame con la mano en el corazón: ¿sabe lo que paga por cada kilovatio… o ni idea?'],
    ['cliente','Pues… ni idea, la verdad.'],
    ['comercial','Pues ahí empieza el dinero dormido. Una foto y mañana lo sabe. ¿WhatsApp o correo?']
  ],
  round2:[
    {t:'«Y de regalo, la revisión de potencias, que esa se hace sin tocar nada de lo suyo.»', n:'RECIPROCIDAD · CORTISOL ↓'},
    {t:'«¿Empezamos por ahí… o prefiere el estudio entero?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Ni se le pase por la cabeza ahora mismo. Solo mire el dato.»','«Usted no se mueve de sitio hasta ver los números. Así de claro.»'],
    notas:['«Con la mano en el corazón» pide honestidad sin acusar: muy español.','«Ni una coma» minimiza al máximo la amenaza.','«Ahí no entro» respeta su territorio: paradójicamente invita a que él lo abra.'],
    zona:'España (general).'
  }
},

contento:{
  nombre:'«Estoy contento con mi compañía actual»',
  validacion:[
    {t:'«Me alegro un montón, la verdad. Eso es lo primero.»', n:'VALIDACIÓN SINCERA'}
  ],
  desactiva:[
    {t:'«Y que le dure mucho. Nadie viene a estropeárselo.»', n:'CORTISOL ↓ · “que le dure”'}
  ],
  reencuadre:[
    {t:'«Le cuento un secreto del oficio: los más contentos… eran los que más pagaban. Fíjese qué cosa.»', n:'ZEIGARNIK · CONTRASTE · “fíjese qué cosa”'},
    {t:'«Estar contento y pagar de más se llevan muy bien. Hasta que alguien lo mira.»', n:'PÉRDIDA OCULTA'},
    {t:'«Un restaurante de por aquí dijo exactamente eso. Miramos: trescientos cuarenta euros dormidos al mes. Hoy sigue contento… pero con trescientos cuarenta más en la caja.»', n:'STORYTELLING · MISMA ZONA · PEAK'}
  ],
  avance:[
    {t:'«¿Le hago la misma prueba gratis… o le cuento antes cómo va lo de la emergencia 24 horas?»', n:'ELECCIÓN A/B · GRATIS · “lo de…”'}
  ],
  dialogo:[
    ['cliente','Yo estoy muy contento con la mía.'],
    ['comercial','Me alegro, y que le dure. Le cuento un secreto del oficio: los más contentos eran los que más pagaban. Un restaurante de por aquí dijo lo mismo; miramos y tenía trescientos cuarenta al mes dormidos. Hoy sigue contento, pero con ese dinero en la caja. ¿Le hago la misma prueba gratis o le cuento primero lo de la emergencia veinticuatro horas?']
  ],
  round2:[
    {t:'«Le dejo una última imagen: sábado por la noche, avería, el obrador parado. La última vez, ¿en cuánto le atendieron?»', n:'ESCENARIO · MIEDO MEDIDO · ABIERTA'},
    {t:'«Con nosotros: veinticuatro horas y técnico de la casa. ¿Lo comprobamos gratis… o se acerca a Sagunto y se lo enseño?»', n:'ELECCIÓN A/B · “de la casa”'}
  ],
  nat:{
    alt:['«Ojalá dure mil años, oiga.»','«Si es de verdad, que no le toque nadie. Solo verifíquelo.»'],
    notas:['«Fíjese qué cosa» es asombro compartido, muy español y nada agresivo.','«Lo de la emergencia» = fórmula coloquial para referirse a un tema sin elaborarlo.','«De la casa» = del propio equipo (restauración y empresa española lo usan mucho).'],
    zona:'España (general).'
  }
},

desconfianza:{
  nombre:'«No me fío / ¿esto es fiable?»',
  validacion:[
    {t:'«Hace usted muy bien en no fiarse. Y oiga, yo haría lo mismo.»', n:'VALIDACIÓN TOTAL'}
  ],
  desactiva:[
    {t:'«No le pido que se fíe de mí. Le pido que me compruebe.»', n:'CORTISOL ↓ · GIRO — la desconfianza se combate con verificación'}
  ],
  reencuadre:[
    {t:'«Una: dos oficinas oficiales, en Sagunto y en el Puerto. Puerta abierta y café, cuando quiera.»', n:'PRUEBA FÍSICA VERIFICABLE'},
    {t:'«Dos: por teléfono no le voy a pedir ni un dato del banco ni una firma. Una foto de la factura y punto.»', n:'SEGURIDAD · REGLA DEL 3 · “y punto”'},
    {t:'«Tres: si el estudio no le convence, aquí no ha pasado nada.»', n:'SALIDA FÁCIL · “aquí no ha pasado nada”'}
  ],
  avance:[
    {t:'«¿Qué le cuadra más: venir usted a la oficina… o que vayamos nosotros a su negocio?»', n:'ELECCIÓN A/B · “le cuadra”'}
  ],
  dialogo:[
    ['cliente','Es que ya no me fío de estas llamadas…'],
    ['comercial','Hace usted muy bien. Por eso no le pido que se fíe: le pido que me compruebe. Una: oficinas oficiales en Sagunto y el Puerto, puerta abierta y café. Dos: por teléfono ni datos del banco ni firmas, una foto y punto. Tres: si el estudio no le convence, aquí no ha pasado nada. ¿Le cuadra más venir aquí o que pasemos por su negocio?']
  ],
  round2:[
    {t:'«Trabajamos con comercios y talleres de la zona; si quiere, habla antes con alguno. Palabra de vecino.»', n:'PRUEBA SOCIAL ESPECÍFICA · REFERENCIA VIVA'},
    {t:'«¿Le paso el contacto de un cliente de su sector… o empezamos por el café de la oficina?»', n:'ELECCIÓN A/B'}
  ],
  nat:{
    alt:['«Desconfíe todo lo que quiera… y luego compruébeme.»','«Yo tampoco daría datos por teléfono. Ni uno.»'],
    notas:['«Aquí no ha pasado nada» es la salida limpia española: cero presión, máxima elegancia.','«Y punto» zanja sin aspereza.','«Cuando quiera» invita sin agobiar: la puerta abierta de verdad.'],
    zona:'España (general).'
  }
},

momento:{
  nombre:'«Ahora no es buen momento» (temporada, costes…)',
  validacion:[
    {t:'«Ya me hago cargo. Los tiempos mandan, no queda otra.»', n:'VALIDACIÓN · “no queda otra”'}
  ],
  desactiva:[
    {t:'«Y no le pido una decisión. Le pido un dato.»', n:'CORTISOL ↓ · MICRO-DECISIÓN'}
  ],
  reencuadre:[
    {t:'«Justo cuando aprieta el mes… es cuando más duele regalar dinero.»', n:'PÉRDIDA EN CONTEXTO'},
    {t:'«Recortar en luz no despide a nadie, no baja calidad… solo tapona una fuga.»', n:'REENCUADRE · “tapona una fuga”'}
  ],
  avance:[
    {t:'«¿Me manda la factura hoy… o mañana, cuando respire?»', n:'ELECCIÓN A/B SUAVE · “cuando respire”'}
  ],
  dialogo:[
    ['cliente','Ahora no es momento, andamos justos de todo.'],
    ['comercial','Ya me hago cargo, los tiempos mandan. Y justo cuando aprieta es cuando más duele regalar dinero cada mes. Recortar en luz no despide a nadie: solo tapona una fuga. No le pido una decisión, le pido un dato: ¿me manda la factura hoy o mañana, cuando respire?']
  ],
  round2:[
    {t:'«Si es cosa de temporada, dígame: ¿cuándo afloja el ritmo en su sector? Lo dejamos apuntado para esa semana… con el estudio ya hecho.»', n:'FUTURE PACING · “afloja”'},
    {t:'«¿En agosto… o en septiembre?»', n:'ELECCIÓN A/B — adáptelo a su calendario real'}
  ],
  nat:{
    alt:['«Lo entiendo, estos meses son una locura.»','«Ni pensarlo ahora, solo apúntemelo para más adelante.»'],
    notas:['«No queda otra» asume la realidad compartida sin dramatizar.','«Cuando respire» empatía con su agobio, muy natural.','«Lo dejamos apuntado» cierra sin formalidad: agenda hecha sin susto.'],
    zona:'España (general).'
  }
},

ya_llamaron:{
  nombre:'«Ya me llamaron / ya me lo ofrecieron»',
  validacion:[
    {t:'«Pues mejor, así me ahorro la presentación.»', n:'VALIDACIÓN · HUMOR · “me ahorro”'}
  ],
  desactiva:[
    {t:'«Y tranquilidad, que yo no repito guiones. Yo trabajo con números.»', n:'CORTISOL ↓ · DIFERENCIACIÓN'}
  ],
  reencuadre:[
    {t:'«Una cosa es que le llamen, y otra que le hagan SU estudio con SU factura, fíjese.»', n:'CONTRASTE'},
    {t:'«Dígame: ¿le llegó un número en euros… o palabras bonitas?»', n:'ZEIGARNIK · ABIERTA — casi siempre fueron palabras'}
  ],
  avance:[
    {t:'«Si no tiene su número, mañana lo tiene: ¿me manda la factura… o quedamos diez minutitos?»', n:'ELECCIÓN A/B · DIMINUTIVO “minutitos”'}
  ],
  dialogo:[
    ['cliente','Ya me llamaron de Iberdrola hace un mes.'],
    ['comercial','Pues mejor, me ahorro la presentación. Y tranquilidad, que yo no repito guiones: trabajo con números. Una cosa es que le llamen y otra que le hagan su estudio con su factura. ¿Le llegó un número en euros o palabras bonitas? …Ya. Pues mañana lo tiene: ¿me manda la foto o quedamos diez minutitos?']
  ],
  round2:[
    {t:'«Si ya le hicieron estudio y no tiró para adelante, casi seguro falló el seguimiento. Yo llamo cuando digo que llamo.»', n:'DIFERENCIACIÓN · “tirar para adelante”'},
    {t:'«Compruébelo: ¿le llamo el jueves a las diez… o el viernes a las doce?»', n:'ELECCIÓN A/B · DEMOSTRACIÓN INMEDIATA'}
  ],
  nat:{
    alt:['«Ah, pues somos compañeros de teléfono. Yo soy el de los números.»','«No le vendo lo que ya le contaron. Le enseño lo suyo.»'],
    notas:['«Minutitos» es el diminutivo social español en su máxima expresión.','«No tiró para adelante» = no salió adelante. Muy de la calle.','«Llamo cuando digo que llamo» es promesa demostrable al momento: el mejor antídoto contra el escepticismo.'],
    zona:'España (general).'
  }
},

datos:{
  nombre:'«¿De dónde habéis sacado mis datos?» (compliance)',
  validacion:[
    {t:'«Pregunta más que justa. Le contesto con la verdad entera.»', n:'VALIDACIÓN · HONESTIDAD'}
  ],
  desactiva:[
    {t:'«Y si me dice que no más llamadas, se acabó. Al instante.»', n:'CONTROL TOTAL AL CLIENTE · CORTISOL ↓'}
  ],
  reencuadre:[
    {t:'«Llamamos a empresas de la zona, en horario legal y mirando antes la Lista Robinson.»', n:'TRANSPARENCIA TOTAL'},
    {t:'«Ni trucos ni bases de datos raras. Así de claro.»', n:'SIMPLICIDAD · CONFIANZA'}
  ],
  avance:[
    {t:'«Y ahora usted manda: ¿le cuento en medio minuto por qué merece la pena… o lo apunto y le dejo tranquilo?»', n:'ELECCIÓN HONESTA — dar la salida devuelve la calma'}
  ],
  dialogo:[
    ['cliente','¿Y de dónde habéis sacado mi teléfono?'],
    ['comercial','Pregunta más que justa: llamamos a empresas de la zona desde el Dpto. PYMES de Iberdrola, en horario legal y consultando antes la Lista Robinson. Si prefiere no recibir más llamadas, lo apunto al instante y asunto zanjado. Dicho esto: ¿le cuento en medio minuto por qué le puede interesar… o lo apunto y le dejo tranquilo?']
  ],
  round2:[
    {t:'«Anotado: no vuelve a oírme.»', n:'CUMPLIMIENTO INMEDIATO — si pide la baja, se respeta sin réplica y se registra'},
    {t:'«Que tenga buen día, de verdad.»', n:'FINAL LIMPIO · PEAK-END'}
  ],
  nat:{
    alt:['«Se lo explico en dos líneas, que la transparencia es gratis.»','«Si le molesta que le llamemos, se apunta y hoy mismo.»'],
    notas:['«Asunto zanjado» cierra temas con limpieza española.','«Más que justa» intensifica la validación sin retórica.','«Al instante» = ahora mismo: estándar en España para promesas rápidas.'],
    zona:'España (general).'
  }
}
};