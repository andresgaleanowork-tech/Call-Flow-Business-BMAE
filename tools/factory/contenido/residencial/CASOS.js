const CASOS = [
 {titulo:'Caso 1 · La cena a medias',
  escena:'Piso de ciudad, lunes 19:40. Coge la señora: «¿Sí? ¿Quién es? Que estoy en medio de la cena de los niños…»',
  o:['«No se preocupe, le cuento rapidito nuestra oferta de luz, son solo unos minutos»','«Le cojo en un mal momento, perdone. Una pregunta y le dejo: su última factura, ¿le ha venido bien… o ha venido de susto?»','«Le llamo en otro momento, disculpe», y cuelga usted'],
  ok:1,
  sol:'Respeta su tiempo Y abre conversación: empatía («le cojo en un mal momento», pura España), escasez («una pregunta») y elección doble de pérdida — responda lo que responda, ya habla de SU factura. La primera opción activa la alarma de «oferta» con la sartén en la mano; la tercera regala la llamada sin intentarlo.'},
 {titulo:'Caso 2 · El quemado con permanencia',
  escena:'Chalet adosado. El dueño: «Ya me la colaron una vez de otra compañía, y encima creo que firmé permanencia hasta el año que viene».',
  o:['«No se preocupe, la permanencia se la quitamos nosotros y aquí nadie le va a colar nada, palabra»','«Hace bien en desconfiar. Hoy no tocamos nada: mándeme la factura, vemos la fecha real de esa permanencia y le digo la verdad. Y lo que decida, por escrito antes de firmar nada»','«Eso de la permanencia no es verdad, ya verá usted»'],
  ok:1,
  sol:'Dos verdades endurecidas: ① no se promete quitar permanencias (prohibido), se consulta la fecha REAL en la factura; ② la desconfianza se combate con verificación y escritura, no con «palabra». La tercera invalida su experiencia: no conoce su contrato.'},
 {titulo:'Caso 3 · La contenta que pide precio',
  escena:'Propietaria de segunda residencia, educada: «Yo estoy encantada con mi compañía, la verdad. Pero dígame, ¿en cuánto me saldría a mí?»',
  o:['Darle un precio orientativo al momento para no perderla','«Me alegro mucho, y que le dure. Un precio a ciegas no se lo doy porque sería mentirle: cada casa es un número. Me manda la factura y mañana se lo digo en euros, gratis»','«Pues más barato que lo que paga, seguro»'],
  ok:1,
  sol:'Pide precio: señal de interés, no de cierre. La respuesta correcta valida su satisfacción, convierte el NO-precio en prueba de honestidad («sería mentirle») y avanza hacia el estudio — que es el éxito de llamada. Las otras dos prometen sin haber visto el papel: el anticumbre del guion.'}
];