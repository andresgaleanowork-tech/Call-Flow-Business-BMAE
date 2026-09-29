const SCENARIOS = [
  {
    nombre:'🌙 El de la Factura Susto',
    desc:'Cliente de piso en la ciudad, abre la llamada a las siete y media, con la factura de enero aún en la cabeza. Corta rápido pero tiene dolor: el precio le perturba.',
    pasos:[
      {
        cliente:'«¿Sí, dígame? ¿Quién es? Que estoy recogiendo la cena…»',
        opciones:[
          {texto:'«Le llamo de Iberdrola porque tenemos una tarifa muy interesante para particulares, ¿me podría regalar un minuto?»',
           fb:'b', feedback:'❌ Triple tropiezo: «tarifa» de entrada activa la alarma de venta, «¿me podría regalar un minuto?» es latinismo de manual (en España: ni se pide, se da) y con la cena en la mano el tiempo es oro: hay que bajar la petición y ganar la escena.'},
          {texto:'«Le cojo en un mal momento, perdone. Soy [NOMBRE_COMERCIAL], del Dpto. RESIDENCIAL de Iberdrola. Una pregunta y le dejo: su última factura de la luz, ¿ha venido bien… o ha venido de susto?»',
           fb:'g', feedback:'✅ Empatía con su momento («le cojo en un mal momento», pura España), autoridad sin «oferta», pretérito perfecto («ha venido») y ELECCIÓN DOBLE DE PÉRDIDA: responda lo que responda abre la conversación sobre SU factura.'}
        ]
      },
      {
        cliente:'«Hombre, vino mal, como todos los eneros… pero ¿y usted qué quiere?»',
        opciones:[
          {texto:'«Tenemos tarifa fija, tres periodos, PVPC, mercado libre, batería virtual, placas, cargador…»',
           fb:'n', feedback:'⚠️ El catálogo activa el Sistema 2 y mata al Sistema 1. Con alguien con la cena a medias: UNA emoción y UNA petición de medio minuto. Pruebe la otra.'},
          {texto:'«Pues evitarle otro enero así, ni más ni menos. Muchos hogares de la zona pagan de más cada mes sin saberlo. Con una foto de su factura lo vemos gratis. ¿Por WhatsApp o por correo?»',
           fb:'g', feedback:'✅ «Ni más ni menos» baja la petición a tierra; pérdida actual + prueba social de hogares cercanos + gratis + mínimo esfuerzo + elección de canal. Seis mecanismos en veinticinco palabras.'}
        ]
      },
      {
        cliente:'«Uf… es que yo estos temas los lleva mi marido, la verdad.»',
        opciones:[
          {texto:'«No se preocupe, se lo explico yo a usted y luego usted se lo cuenta.»',
           fb:'b', feedback:'❌ Menosprecia la decisión en pareja y genera el «cuento de segunda mano» que mata ventas. Las cosas de casa se deciden entre los dos: ni ataque al decisor ausente ni sustitución forzada. Pruebe otra.'},
          {texto:'«Claro, las cosas de casa se deciden entre los dos, como tiene que ser. Lo mejor es que lo oigan igual: ¿les va mejor esta noche sobre las ocho o mañana por la mañana? O le dejo un WhatsApp para enseñarle, lo que usted diga.»',
           fb:'g', feedback:'✅ VALIDAR la pareja → OFRECER DOS CAMINOS (llamada con ambos o WhatsApp para mostrar) → ELECCIÓN DOBLE con franja real. El «lo que usted diga» cierra sin presión y da el control de verdad.'}
        ]
      },
      {
        cliente:'«Vale… mándeme un WhatsApp y ya vemos.»',
        opciones:[
          {texto:'«Vale, se lo mando. ¡Gracias!»',
           fb:'n', feedback:'⚠️ WhatsApp genérico sin personalización ni próxima llamada fijada = mensaje enterrado entre el grupo del cole y el de los primos. Un mensaje solo se acepta si lleva algo suyo y hora de vuelta.'},
          {texto:'«Marchando. Para que sea SU mensaje y no un folleto: un mes normal, ¿pasa de cien la factura o anda por debajo? …Perfecto. Lo tiene hoy y mañana le llamo un momento: ¿sobre las seis o sobre las ocho?»',
           fb:'g', feedback:'✅ El WhatsApp se convierte en arma: personalización con elección (micro-sí) + llamada fijada con alternativa adaptada a SU horario de casa. «Lo tiene hoy» cierra el círculo sin pesadez.'}
        ]
      },
      {
        cliente:'FIN DEL ESCENARIO',
        opciones:[],
        fin:'🏁 Con el cliente de casa, ganar no es vender hoy: es salir con UN compromiso pequeño, personalizado y con fecha. Leyes dominantes: escasez (su tiempo), mínimo esfuerzo (una foto), decisión en pareja y elección. Idioma: «le cojo en un mal momento», «anda por debajo», «lo tiene hoy».'
      }
    ]
  },
  {
    nombre:'🕵️ La Desconfiada Quemada',
    desc:'Señora que sufrió un timo de «cambio de compañía» hace dos años. Dificultad: alta. Aquí manda la ley de amenaza y la transparencia total: verificar, no jurar.',
    pasos:[
      {
        cliente:'«¿Iberdrola? Mire, a mí ya me engañaron una vez con lo de la luz. Ahora no me fío de nadie.»',
        opciones:[
          {texto:'«No, no, nosotros no somos así, somos totalmente de fiar, se lo aseguro.»',
           fb:'b', feedback:'❌ «Somos de fiar, créame» es una promesa, y las promesas son justo lo que la quemó. La desconfianza se combate con VERIFICACIÓN (pruebas físicas que ella controla), nunca con juramentos. Lea la otra.'},
          {texto:'«Hace usted muy bien en no fiarse, y oiga, yo haría lo mismo. Por eso no le pido que se fíe: le pido que me compruebe. Primera prueba: el 900 de Iberdrola de su propia factura — llame y pregunte por el Departamento Residencial. Y para el estudio no necesito ni DNI ni claves: con la factura tapando lo que usted quiera, me vale. ¿Le cuadra?»',
           fb:'g', feedback:'✅ Validación total → giro maestro (compruebe, no crea) → prueba física real → privacidad con control suyo → cierre por elección con «le cuadra». Nada que creer: todo para comprobar.'}
        ]
      },
      {
        cliente:'«Bueno… ¿y qué me tendría que mandar? Porque datos míos, pocos.»',
        opciones:[
          {texto:'«Pues su DNI, el CUPS, el IBAN para la domiciliación y a ver si tiene el contrato firmado…»',
           fb:'b', feedback:'❌ Pedir IBAN primero a una quemada es pedirle el bolso. El orden se invierte: primero ver sin compromiso (factura con datos simples), después — si quiere activar — lo demás, con verificación grabada y por escrito.'},
          {texto:'«Para mirar solo la factura de la luz, como la recibe cada mes. Y la manda usted tapando lo que quiera, que las tapitas son gratis y me dan igual: yo miro números, no personas. Lo demás — lo de activar nada — solo si usted lo decide después y por escrito. ¿Le suena bien así?»',
           fb:'g', feedback:'✅ Pide SOLO lo necesario para el estudio → control de privacidad en su mano («tapando lo que quiera») → separación clara mirar/deciDIR → confirmación con preguntas abiertas. La quemada vuelve cuando el método es el contrario del timo.'}
        ]
      },
      {
        cliente:'«Es que la otra vez me dijeron lo mismo: que sin compromiso.»',
        opciones:[
          {texto:'«Já, los de siempre. Con nosotros no se preocupe, que es diferente de verdad.»',
           fb:'n', feedback:'⚠️ «Diferente de verdad» es la frase que dijeron los otros. El quemado no necesita adverbios: necesita EVIDENCIA concreta — qué pasó la otra vez y qué lo evita ahora.'},
          {texto:'«La diferencia es que usted lo verá todo por escrito antes de decir sí: la propuesta, el precio, las condiciones. Y la verificación de llamada le obliga a confirmar sabiendo qué dice sí. Ni un cambio por accidente ni con letra que no leyó. Esta vez, testigos por escrito.»',
           fb:'g', feedback:'✅ Garantías CONCRETAS y reales (escrito antes, verificación obligada) en vez de adjetivos. «Testigos por escrito» es la idea que la quemada guarda: de la conversación al papel.'}
        ]
      },
      {
        cliente:'FIN DEL ESCENARIO',
        opciones:[],
        fin:'🏁 Con la quemada, el alta es el premio gordo: primero se gana la mirada honesta (factura gratis, testigos por escrito). Nada de juramentos: solo verificación, privacidad con control y escritura antes que firma. Eso es lo que el timo nunca hizo.'
      }
    ]
  }
];