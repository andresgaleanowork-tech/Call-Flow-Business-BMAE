const GLOSARIO = [
  {cat:'📞 Fórmulas telefónicas auténticas', items:[
    {e:'«¿Le cojo en un mal momento?»', u:'Apertura empática: reconoce la molestia antes de que la diga él. Más suave que «¿tiene un momento?».', alt:'«¿Le pillo en buen momento?» (más neutro) · «Perdone que le moleste» (más formal)'},
    {e:'«No le robo más de un minuto»', u:'Promesa de brevedad con humor. El verbo «robar» marca registro de calle sin faltar.', alt:'«Un segundito y le dejo» · «Dos cosas rápidas y ya está»'},
    {e:'«¿Me pone con…?»', u:'Pedir paso con un filtro. Directo y educado a la vez.', alt:'«¿Podría pasarme con…?» (más formal) · «¿Está por ahí…?» (más coloquial)'},
    {e:'«Le dejo, que sé que está usted liado»', u:'Cierre cortés cuando el cliente va justo de tiempo.', alt:'«Le suelto ya» · «No le entretengo más»'},
    {e:'«Que le vaya bien»', u:'La despedida telefónica estándar de España.', alt:'«Que vaya muy bien» · «Que tenga buen día» (jamás «excelente día»)'},
    {e:'«Pues quedamos así»', u:'EL cierre de acuerdos en España. Limpio, sin pedir confirmación explícita.', alt:'«Pues cerrado» · «Pues apuntado, ¿le parece?»'},
    {e:'«Ahora mismo le mando…»', u:'Promesa inmediata estándar. «Ahora mismo» = en este momento.', alt:'«En cinco minutitos lo tiene» · «Le escribo enseguida»'}
  ]},
  {cat:'💚 Validación y empatía', items:[
    {e:'«Le entiendo perfectamente, faltaría más»', u:'La doble validación española clásica. «Faltaría más» niega que haya opción de no entenderle.', alt:'«Como no iba a entenderle» · «Ya me hago cargo»'},
    {e:'«Ya me hago cargo»', u:'Empatía pura: me pongo en su situación sin frase hecha de manual.', alt:'«Me lo imagino» · «Le entiendo, vaya si le entiendo»'},
    {e:'«Claro, cómo no»', u:'Aceptación total en dos palabras.', alt:'«Por descontado» · «Hombre, por supuesto» (énfasis propio, nunca para corregir)'},
    {e:'«Sin problema ninguno»', u:'Doble refuerzo típico español: niega con énfasis sin sonar ensayado.', alt:'«Ningún problema» · «No hay ningún problema»'}
  ]},
  {cat:'🧵 Muletillas y conectores con función (con mesura: 1-2 por bloque)', items:[
    {e:'«Mire…»', u:'Abre y centra la atención. El imperativo social español por excelencia.', alt:'«Oiga…» (igual de bueno) · «Verá…» (más explicativo)'},
    {e:'«Le digo una cosa…»', u:'Crea confidencia: anuncia verdad sin adornos.', alt:'«Le voy a ser sincero…» · «Se lo digo de corazón…»'},
    {e:'«Fíjese…»', u:'Marca de asombro que invita a mirar el dato.', alt:'«Fíjese qué cosa…» · «Fíjese usted…»'},
    {e:'«Y aquí viene lo bueno…»', u:'Expectativa oral antes del beneficio.', alt:'«Y ahora, lo mejor…» · «Y escuche esto…»'},
    {e:'«A ver…»', u:'Compra medio segundo pensando en voz alta. Humaniza.', alt:'«Vamos a ver…» · «Pues mire…»'},
    {e:'«Oiga»', u:'Guinda vocal de cercanía al final de frase («…nadie les avisa, oiga»).', alt:'«¿eh?» (solo si el cliente ya tutéa y con moderación)'}
  ]},
  {cat:'🎛 Reformuladores de control', items:[
    {e:'«¿Me sigue?»', u:'Comprueba que el hilo no se pierde sin condescender.', alt:'«¿Me explico?» · «¿Lo ve?»'},
    {e:'«¿Le cuadra?»', u:'La pregunta de agenda española por antonomasia.', alt:'«¿Le viene bien?» · «¿Le encaja?»'},
    {e:'«¿Le parece?»', u:'Cierre suave de propuesta. Úselo una vez, no tres.', alt:'«¿Vamos bien?» · «¿Le va?»'}
  ]},
  {cat:'🤏 Matizadores y diminutivos sociales', items:[
    {e:'«Más o menos / a ojo»', u:'Quitan presión al número: el cliente redondea sin miedo.', alt:'«Poco más o menos» · «Así por encima»'},
    {e:'«Medio minuto»', u:'Minimiza la petición más que «treinta segundos». Mismo tiempo, menos peso.', alt:'«Un momentito» · «Un segundito»'},
    {e:'«Tipo cinco»', u:'Sobre las cinco. Coloquial agenda España.', alt:'«Sobre las cinco» · «A eso de las cinco»'},
    {e:'«Un ratito / unos minutitos»', u:'Diminutivo con función social: suaviza sin infantilizar si se usa una vez.', alt:'«Un par de minutos» · «Diez minutitos»'},
    {e:'«Anduvo por ahí / anda por debajo»', u:'El cliente estima sin compromiso de exactitud.', alt:'«Rondaba» · «Se movía por esa zona»'}
  ]},
  {cat:'🔥 La pérdida en español de la calle (medido: una vez por llamada)', items:[
    {e:'«Se le va un pico cada mes»', u:'Pinta la pérdida sin técnica. Coloquial, España.', alt:'«Se le escapa un pico» · «Se le está yendo dinero…»'},
    {e:'«Está regalando dinero»', u:'La pérdida como acción voluntaria involuntaria: duele bien.', alt:'«Le está saliendo gratis a la compañía»'},
    {e:'«Un pastón»', u:'Cantidad grande de dinero. Úselo UNA vez: marca registro sin vulgarizar.', alt:'«Un dineral» · «Pastizal» (aún más coloquial, mejor no)'},
    {e:'«Le cuesta un ojo de la cara no mirarlo»', u:'Hiperbólico español clásico. Con humor ligero.', alt:'«Le sale carísimo» · «Le sangra la caja» (coloquial, medido)'}
  ]},
  {cat:'🏁 Cierres naturales', items:[
    {e:'«Pues quedamos así»', u:'Cierre de acuerdo estándar. Sin interrogante.', alt:'«Pues apañado» (más coloquial) · «Pues cerrado, ¿le parece?»'},
    {e:'«Venga, pues cualquier cosa me dice»', u:'Cierre cálido que deja canal abierto.', alt:'«Vale, cualquier cosa me avisa» · «Cualquier duda, me tiene aquí»'},
    {e:'«Un placer, [NOMBRE]. Que le vaya muy bien»', u:'Despedida de negocios española: cordial sin servilismo.', alt:'«Encantado, [NOMBRE]. Que vaya bien» · «Un placer. Hablamos pronto»'}
  ]},
  {cat:'🏭 Léxico del dueño de PYME española', items:[
    {e:'La nave · el local · el taller · el almacén', u:'Así se refiere él a su sitio de trabajo. Hable SU idioma.', alt:'«Oficina» · «obrador» · «consulta» (por sector)'},
    {e:'La luz · el gas · el recibo', u:'Cómo se dicen las facturas en la calle. «El suministro eléctrico» no existe fuera del folleto.', alt:'«La factura de la luz» · «el término de energía» (si entra en técnica)'},
    {e:'Las potencias · los peajes', u:'Los temas técnicos por su nombre de calle.', alt:'«La potencia que tiene puesta» · «lo que paga de potencia»'},
    {e:'«Me está matando la luz» · «vengo pagando un pastón»', u:'Frases del CLIENTE: escúchelas y devuélvaselas. Son su dolor con sus palabras.', alt:'«Esto no hay quien lo entienda» · «no hay derecho» (escuchar y validar)'},
    {e:'La plantilla · los chavales', u:'Los empleados, en su idioma. «Chavales» solo si él lo usa primero.', alt:'«El equipo» · «la gente»'}
  ]},
  {cat:'⏱ Tiempos verbales marca España', items:[
    {e:'Pretérito perfecto: «¿le ha subido?»', u:'La marca gramatical de España en conversación. «¿Le subió?» suena a latino al momento.', alt:'«¿Le han mirado alguna vez…?» · «Le he llamado porque…» · «¿Ha visto que…?»'},
    {e:'Imperativo de usted bien puesto', u:'«Mire», «Oiga», «Dígame», «Cuénteme», «Espéreme un segundo».', alt:'Nunca «mires», «cuéntame» en primera llamada (eso ya es tuteo)'},
    {e:'Usted SIEMPRE en primera llamada', u:'El tuteo llega solo si el cliente lo abre dos veces. Jamás mezclar usted y tú en la misma frase.', alt:'Si él tutea dos veces: «¿Nos tuteamos, si le parece?»'}
  ]}
];