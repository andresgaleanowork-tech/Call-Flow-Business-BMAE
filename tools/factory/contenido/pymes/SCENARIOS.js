const SCENARIOS = [
  {
    nombre:'🍽 El Ocupado',
    desc:'Encargado de restaurante a la una y diez, en pleno servicio. Corta rápido. El feedback cita las leyes neuro y las claves idiomáticas.',
    pasos:[
      {
        cliente:'«¿Sí, dígame? ¿Quién es? Que estoy en medio del servicio…»',
        opciones:[
          {texto:'«Le llamo de Iberdrola porque tenemos una oferta de luz muy interesante para empresas, ¿me podría regalar un minuto?»',
           fb:'b', feedback:'❌ Triple tropiezo: «oferta» activa la alarma de venta, «¿me podría regalar un minuto?» es latinismo de manual (en España: «¿me concede un minuto?» o mejor, ni pedirlo) y la pregunta de sí/no invita al NO. Ley 7 rota y naturalidad rota.'},
          {texto:'«Le cojo en un mal momento, perdone. Soy [NOMBRE_COMERCIAL], del Dpto. PYMES de Iberdrola. Una pregunta y le dejo: ¿su restaurante ha pagado este mes más de luz que antes del verano… o mucho más?»',
           fb:'g', feedback:'✅ Empatía con su momento («le cojo en un mal momento», pura España), autoridad sin «oferta», pretérito perfecto («ha pagado») y ELECCIÓN DOBLE DE PÉRDIDA: responda lo que responda, reconoce el dolor y la conversación sigue viva.', next:1}
        ]
      },
      {
        cliente:'«Vale, a ver… ¿usted qué quiere?»',
        opciones:[
          {texto:'«Tenemos tarifa fija, indexada, por tramos, gestor personal, auditoría, optimización de potencias, emergencia 24h, placas…»',
           fb:'n', feedback:'⚠️ El catálogo activa el Sistema 2 y mata al Sistema 1. Con alguien ocupado: UNA emoción y UNA petición de medio minuto. Pruebe la otra.', next:2},
          {texto:'«Que deje de regalar dinero, ni más ni menos. Ocho de cada diez restaurantes pagan potencia dormida cada mes. Con una foto de su factura lo veo yo, gratis. ¿Por WhatsApp o por correo?»',
           fb:'g', feedback:'✅ «Ni más ni menos» baja la petición a tierra; pérdida actual + prueba social de su sector + gratis + mínimo esfuerzo + elección de canal. Seis mecanismos en veinte palabras. Así suena un comercial de verdad.', next:2}
        ]
      },
      {
        cliente:'«Es que yo ya tengo compañía y la verdad, estoy contento.»',
        opciones:[
          {texto:'«Ya, pero seguro que le están cobrando de más, todas hacen lo mismo…»',
           fb:'b', feedback:'❌ Doble falta: prometer sin ver la factura («seguro que…») y hablar mal por inercia. El cliente defiende sus decisiones pasadas: no las abandona. Valide, desactive, reencuadre.'},
          {texto:'«Me alegro un montón, oiga, y que le dure. Le cuento un secreto del oficio: los más contentos eran los que más pagaban. Un restaurante de por aquí: trescientos cuarenta euros dormidos al mes. ¿Le hago la misma prueba gratis… o le cuento lo de la emergencia 24 horas?»',
           fb:'g', feedback:'✅ Protocolo perfecto: VALIDAR («me alegro un montón», «que le dure») → DESACTIVAR → REENCUADRAR con historia de un igual (número concreto, «de por aquí») → AVANCE por elección. Las pegas idiomáticas («oiga», «lo de la…») suenan a calle, no a guion.', next:3}
        ]
      },
      {
        cliente:'«Uf… mándeme un correo y ya lo miro.»',
        opciones:[
          {texto:'«Vale, se lo mando. ¡Gracias!»',
           fb:'n', feedback:'⚠️ Correo genérico sin continuidad = correo enterrado. Un correo solo se acepta personalizado Y con próxima llamada fijada por elección.', next:4},
          {texto:'«Por supuesto, hoy mismo y sin folletos: solo su caso. Para personalizarlo: ¿su factura suele pasar de quinientos euros o anda por debajo? …Perfecto. Lo tiene hoy y mañana le llamo un par de minutos: ¿a la una como ahora o mejor a las cinco, con más calma?»',
           fb:'g', feedback:'✅ El correo se convierte en arma: personalización con elección (yes-set) + llamada fijada con alternativa adaptada a SU ritmo («con más calma»). «Anda por debajo» y «un par de minutos»: español de la calle que no molesta.', next:4}
        ]
      },
      {
        cliente:'FIN DEL ESCENARIO',
        opciones:[],
        fin:'🏁 Con el ocupado, ganar no es vender hoy: es salir con UN compromiso pequeño, confirmado y con fecha. Leyes dominantes: escasez (su tiempo), mínimo esfuerzo (una foto), elección y Peak-End. Y hablando su idioma: «medio minuto», «a ojo», «quedamos así».'
      }
    ]
  },
  {
    nombre:'🕵️ El Desconfiado',
    desc:'Gerente de taller quemado por llamadas de energía. Dificultad: alta. Aquí manda la Ley 6 (amenaza) y la transparencia total.',
    pasos:[
      {
        cliente:'«¿Iberdrola? Mire, ya me llamaron una vez con el mismo cuento y casi me la cuelan. Ahora no me fío ni de mi sombra.»',
        opciones:[
          {texto:'«No, no, nosotros no somos así, se lo aseguro, somos totalmente de fiar.»',
           fb:'b', feedback:'❌ «Somos de fiar, créame» es una promesa, y las promesas son justo lo que le quemó. La desconfianza se combate con VERIFICACIÓN (pruebas físicas), nunca con juramentos. Ley 6: primero baje la amenaza.'},
          {texto:'«Hace usted muy bien en no fiarse, y oiga, yo haría lo mismo. Por eso no le pido que se fíe: le pido que me compruebe. Primera prueba: oficinas oficiales en Sagunto y el Puerto — se acerca hoy si quiere, hay café. Segunda: por teléfono ni un dato del banco ni una firma. ¿Qué le cuadra más: acercarse usted… o que vayamos nosotros al taller?»',
           fb:'g', feedback:'✅ Validación total → giro maestro (pide verificación, no fe) → prueba física real → regla de seguridad → cierre por elección con «le cuadra». Nada que creer: todo que comprobar. Además le da la razón de entrada: al desconfiado le desarma que le den la razón.', next:1}
        ]
      },
      {
        cliente:'«Es que encima creo que firmé permanencia hasta el año que viene…»',
        opciones:[
          {texto:'«La permanencia se puede quitar sin problema, de eso nos ocupamos nosotros.»',
           fb:'b', feedback:'❌ PROHIBIDO prometer quitar permanencias: falso y fuera de cumplimiento. Un desconfiado que pilla UNA exageración descarta TODO lo demás. La verdad también vende, oiga.'},
          {texto:'«Me alegro de que lo tenga controlado, eso habla bien de usted. Y hoy no se toca nada, quédese tranquilo. Fíjese: la fecha exacta viene en su factura — a veces hay sorpresas de las buenas. Y mientras llega ese día, cada mes se le va lo mismo de la caja. ¿Lo miramos ahora juntos… o me manda una foto y se lo dejo por escrito?»',
           fb:'g', feedback:'✅ Validar → desactivar («hoy no se toca nada») → Zeigarnik («sorpresas de las buenas», sin prometerlas) → pérdida real de esperar → elección de modalidad («por escrito» tranquiliza al desconfiado). Honesto y en movimiento.', next:2}
        ]
      },
      {
        cliente:'«Mire… ya me lo pensaré.»',
        opciones:[
          {texto:'«Vale, piénselo y ya hablamos.»',
           fb:'n', feedback:'⚠️ «Piense en el aire» es la muerte silenciosa de la venta: sin datos, la duda siempre le gana al interés. Déle algo físico contra qué pensar.', next:3},
          {texto:'«Claro, las cosas buenas se piensan, y yo no decido por usted, ni falta que hace. Pero pensar sin datos es adivinar. Le preparo el estudio gratis con una foto de la factura… y piensa con calculadora, que la duda ya se tiene sola. Mientras lo piensa, cada mes se le va lo mismo. ¿Le escribo yo primero al WhatsApp o me escribe usted?»',
           fb:'g', feedback:'✅ «Ni falta que hace» (pura España) + reencuadre («adivinar») + reciprocidad + pérdida actual + cierre por elección de canal. Y la frase «la duda ya se tiene sola» le quita la carga de decidir hoy… para decidir mejor mañana.', next:3}
        ]
      },
      {
        cliente:'FIN DEL ESCENARIO',
        opciones:[],
        fin:'🏁 Con el desconfiado manda la Ley 6: cada frase baja la amenaza ANTES de pedir nada. Pruebas físicas (oficinas de verdad), cero datos sensibles por teléfono, salida fácil siempre a la vista. Y recuerde: el desconfiado convencido acaba siendo el cliente más fiel… y su mejor prueba social para el taller de enfrente.'
      }
    ]
  }
];