/**
 * mock.js — F3·H1: datos MOCK CONTRACTUALES. Forma idéntica a la que servirán
 * el motor A3 / VeriFactu A4 en F4. Caducidad declarada de la simulación.
 */

export const SELLO = { mesesReales: 14, mesesEstimados: 22 };

export const comparativa = {
  cups: "ES0021…0001AA",
  cliente: "Panadería Sol",
  fechaTarifario: "2026-10-05",
  sello: SELLO,
  ofertas: [
    { id: "endesa-one", marca: "EN", color: "#0A7A3E", nombre: "Endesa One Luz", tipo: "fija",
      permanencia: false, precioKwh: 0.129, potenciaEurKwDia: 0.098, anual: 2870, ahorroAnual: 412,
      ahorroPct: 12.6, verifactu: true, recomendada: true },
    { id: "octopus-relax", marca: "OC", color: "#7C3AED", nombre: "Octopus Relax", tipo: "indexada",
      detalle: "PVPC + 0,01 €/kWh", permanencia: false, precioKwh: 0.131, anual: 2915,
      ahorroAnual: 367, ahorroPct: 11.2, verifactu: true, recomendada: false },
    { id: "iberdrola-online", marca: "IB", color: "#D92626", nombre: "Iberdrola Plan Online", tipo: "fija 12 m",
      permanencia: true, precioKwh: 0.134, potenciaEurKwDia: 0.105, anual: 2980, ahorroAnual: 302,
      ahorroPct: 9.2, verifactu: false, recomendada: false },
  ],
  desglose: { energia: 58, potencia: 23, impuestos: 19 },
};

export const dashboard = {
  saludo: "Pilar",
  resumen: "Este mes llevas 26 € menos que en octubre del año pasado con la misma actividad.",
  kpis: [
    { titulo: "Gasto este mes", valor: "214 €", delta: { texto: "▲ 12 % vs oct-25", sentido: "sube" } },
    { titulo: "Consumo", valor: "298 kWh", delta: { texto: "▲ 8 % vs media 12 m", sentido: "sube" } },
    { titulo: "Ahorro acumulado", valor: "486 €", delta: { texto: "desde el cambio (9 m)", sentido: "neutro" } },
    { titulo: "Próxima revisión", valor: "12 días", delta: { texto: "tarifario noviembre", sentido: "neutro" } },
  ],
  // 36 barras (kWh×10): [22 estimadas][14 reales] — la UI las distingue (C8 §1.3)
  barras: [38,42,48,54,60,66,70,68,62,56,50,44,40,43,49,54,59,63,67,66,61,55,
           51,53,49,45,52,56,61,64,65,63,59,56,53,52],
  sello: SELLO,
  alertas: [
    { tipo: "advertencia", titulo: "Tu tarifa sube el 1 de noviembre",
      detalle: "Con tu consumo, la alternativa indexada saldría a 0,129 €/kWh." },
    { tipo: "info", titulo: "Te sobra 1,2 kW de potencia en P2",
      detalle: "Bajarla te ahorraría unos 64 €/año sin cambiar nada más." },
  ],
  pedidos: [
    { id: "#4816", asunto: "Cambio a One Luz", estado: "En tramitación", tono: "tramite" },
    { id: "#4772", asunto: "Baja de potencia P2", estado: "Completado", tono: "ok" },
    { id: "#4701", asunto: "Alta suministro obrador", estado: "Completado", tono: "ok" },
  ],
};

export const facturas = [
  { serie: "F26", numero: "0140", fecha: "2026-10-01", cliente: "Panadería Sol", total: 61.20, vf: "registrada" },
  { serie: "F26", numero: "0139", fecha: "2026-10-01", cliente: "Taller Roig", total: 112.40, vf: "registrada" },
  { serie: "F26", numero: "0138", fecha: "2026-09-30", cliente: "Ana Ferrer", total: 48.90, vf: "enviando" },
  { serie: "F26", numero: "0137", fecha: "2026-09-30", cliente: "Café Ruzafa", total: 96.15, vf: "error" },
];

export const solar = {
  direccion: "Obrador · Calle Colón 12, Valencia",
  catastro: true,
  kpis: [
    ["Potencia propuesta", "3,64 kWp", "8 paneles × 455 W"],
    ["Producción estimada", "5 240 kWh/año", "± 9 % según año"],
    ["Autoconsumo", "68 %", "el obrador consume de día"],
    ["Excedente vertido", "32 %", "compensación en factura"],
  ],
  ahorro: { total: 977, ahorroDirecto: 812, compensacion: 165, inversion: 5400, retornoAnos: [5.5, 4.3, 6.7] },
  produccionMensual: [280, 300, 360, 400, 430, 450, 460, 455, 420, 370, 300, 265],
};

export const gestor = {
  columnas: [
    { titulo: "NUEVO", tarjetas: [
      { id: "#4821", cliente: "Ana F.", detalle: "hogar · 4,6 kW · hoy 09:12", accion: "Contactar" },
    ]},
    { titulo: "DOCUMENTACIÓN", tarjetas: [
      { id: "#4816", cliente: "Panadería Sol", detalle: "CIF ✓ falta IBAN", accion: "Recordar" },
    ]},
    { titulo: "TRAMITANDO", tarjetas: [
      { id: "#4809", cliente: "Café Ruzafa", detalle: "VeriFactu AEAT ✓", accion: "Seguir" },
    ]},
    { titulo: "ACTIVADO", tarjetas: [
      { id: "#4771", cliente: "Casa Solar", detalle: "alta 4-oct · VF ✓", accion: "Ficha" },
    ]},
  ],
};

export const suministro = {
  cups: "ES0021000000000001AA",
  alias: "hogar",
  tarifa: "PVPC regulada",
  potencia: { p1: 4.6, p2: 4.6, deteccion: "te sobra 1,2 kW en P2" },
  gastoMedio: "214 € mes medio",
};

/** Guion demo residencial — forma contractual; el verbatim completo se extrae en F3-w1. */
export const guionResidencial = {
  segmento: "residencial",
  principios: ["Sin humo: prometemos lo que la matemática sostiene", "El cliente manda, nosotros aclaramos", "Sin prisa artificial: la oferta existe mañana igual"],
  fases: [
    { id: "preparacion", titulo: "Preparación", nodos: [
      { id: "n1", texto: "Hola {{nombre}}, te llamo de BMAE; ¿tienes un minuto? Trabajamos vuestra zona de {{localidad}} con la luz.", siguiente: "n2" },
      { id: "n2", texto: "¿Quién se ocupa de la factura en casa — eres tú, {{nombre}}?", siguiente: "n3" },
      { id: "n3", texto: "Te pido un favor de 20 segundos: dime el consumo de tu última factura o el CUPS. Con eso te digo si te interesa hablar o no — te juro que hay veces que no hay nada que hacer.", siguiente: null },
    ]},
  ],
};
