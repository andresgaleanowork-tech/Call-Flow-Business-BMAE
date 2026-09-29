const PROHIBIDAS = [
  {x:'«¿Me podría regalar un minuto?»', y:'«¿Me concede un minuto?» (o ni pedirlo)', why:'Latinismo de manual. En España «regalar un minuto» suena a traducción.'},
  {x:'«Ahorita le atiendo»', y:'«Ahora mismo le atiendo» · «Enseguida estoy con usted»', why:'Latinismo evidente. «Ahorita» no existe en la península.'},
  {x:'«Platicar»', y:'«Hablar» · «comentar» · «charlar» (coloquial)', why:'Latinismo. Nadie en España «platica» por teléfono.'},
  {x:'«Celular» / «computadora» / «carro»', y:'«Móvil» · «ordenador» · «coche»', why:'Marcadores latinoamericanos directos.'},
  {x:'«¿En qué puedo asistirle?»', y:'«¿En qué le puedo ayudar?»', why:'Doblaje puro. En España nadie «asiste» a un cliente.'},
  {x:'«Tenga un excelente día»', y:'«Que le vaya bien» · «Que tenga buen día»', why:'Doblaje de call center. El «excelente día» no existe en la calle.'},
  {x:'«Su satisfacción es nuestra prioridad»', y:'(Eliminar: decirlo con hechos, no con eslóganes)', why:'Frase de folleto que no dice nada y desgasta la confianza.'},
  {x:'«Estoy aquí para servirle»', y:'«Aquí me tiene para lo que necesite»', why:'Doblaje servil. La alternativa española es cálida sin arrastrarse.'},
  {x:'«Hacer una diferencia»', y:'«Marcar la diferencia»', why:'Calco del inglés. En España se «marca» la diferencia.'},
  {x:'«Empoderar»', y:'(Eliminar del discurso)', why:'Traducción de manual de marketing. No la diría nadie en un taller.'},
  {x:'«Recién» (por «acabo de…»)', y:'«Acabo de verlo» · «Lo he visto ahora mismo»', why:'Latinismo. En España «recién» solo en «recién hecho» (pan, café).'},
  {x:'«En un rato le llamo»', y:'«Ahora le llamo» · «Luego le llamo» · «Le llamo en un momento»', why:'«En un rato» es latinismo de espera.'},
  {x:'«Ustedes» por «vosotros» (a varios conocidos)', y:'Ustedes = formal · Vosotros = informal. No mezclar.', why:'En España ambos existen y marcan registro. A varios jefes, «ustedes»; si hay confianza, «vosotros».'},
  {x:'«¿Vio usted la factura?»', y:'«¿Ha visto usted la factura?»', why:'Indefinido tipo latino en contexto reciente. En España, pretérito perfecto.'},
  {x:'«Ofrecemos una amplia gama de servicios»', y:'«Hacemos de todo un poco en electricidad: de la factura al cuadro»', why:'Folletos y robótica. Hable en concreto, no en catálogo.'}
];