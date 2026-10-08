/** #/comparador — comparativa (pública, w4): tarifario vivo horneado en el repo
 * (`datos/tarifario.json`, mismo origen, caso estándar honesto) con fallback
 * contractual declarado si el fichero no carga. */

import { api } from "../lib/api.js";
import { chipSello, eur, num } from "../lib/honesto.js";
import { crearBoton, toast } from "../../../../diseno/export/componentes.js";
import { comparativa as MOCK } from "../datos/mock.js";
import { cargarTarifario } from "../lib/tarifario.js";
import { cabeceraPublica } from "../lib/shell.js";

export async function montar(el) {
  el.append(cabeceraPublica());
  const wrap = document.createElement("div");
  wrap.className = "app-wrap app-wrap--ancho";

  const aviso = document.createElement("p");
  aviso.className = "app-nota";
  aviso.hidden = true;
  wrap.append(aviso);

  // A2: si el cliente trae consumo real (factura subida — sessionStorage
  // `bmae.consumo` = {"kwh":…, "kw":…, "origen":…}), el caso deja de ser estándar.
  let real = null;
  try {
    real = JSON.parse(sessionStorage.getItem("bmae.consumo") || "null");
  } catch { real = null; }
  let datos, vivo = false;
  try {
    datos = await cargarTarifario(real ? { kwh: real.kwh, kw: real.kw, cliente: "tu suministro" } : {});
    vivo = true;
  } catch {
    ({ datos } = await api("comparativa", { mock: MOCK }));
  }
  if (vivo && datos.casoEstandar.real) {
    aviso.textContent = `Comparativa con TU consumo real de factura: ${datos.casoEstandar.kwh.toLocaleString("es-ES")} kWh/año · ${datos.casoEstandar.kw} kW. Fuente y fecha en cada oferta; ahorro contra la media declarada.`;
    aviso.hidden = false;
  } else if (vivo) {
    aviso.textContent = `Comparativa orientativa: mismos consumos para todas (${datos.casoEstandar.kwh.toLocaleString("es-ES")} kWh/año · ${datos.casoEstandar.kw} kW potencia). Fuente y fecha en cada oferta.`;
    aviso.hidden = false;
  } else {
    aviso.textContent = "Tarifario no disponible ahora: vista con simulación contractual. Nunca se busca fuera del repo (GitHub-Total).";
    aviso.hidden = false;
  }

  const cab = document.createElement("div");
  cab.className = "app-cab-fila";
  const h = document.createElement("h1");
  h.className = "app-h1";
  h.textContent = "Tu comparativa";
  let sello;
  if (vivo) {
    // Sello honesto C10 §3 en modo vivo: reales y estimados, por escrito.
    sello = document.createElement("span");
    sello.className = "app-sello app-ml-8";
    sello.setAttribute("role", "status");
    const casoTxt = datos.casoEstandar.real ? "consumo real" : "caso estándar";
    sello.setAttribute("aria-label", `Precios publicados en el tarifario del ${datos.fechaTarifario}; anual y ahorro son estimaciones declaradas con ${casoTxt}`);
    sello.textContent = `✓ precios publicados ${datos.fechaTarifario} · anual/ahorro estimados (${casoTxt})`;
  } else {
    sello = chipSello(datos.sello);
    sello.classList.add("app-ml-8");
  }
  const orden = document.createElement("label");
  orden.className = "app-ml-auto";
  orden.textContent = "Ordenar por ";
  const sel = document.createElement("select");
  sel.className = "app-select";
  sel.setAttribute("aria-label", "Ordenar ofertas");
  sel.innerHTML = `<option value="ahorro">ahorro anual</option><option value="precio">precio €/kWh</option><option value="anual">€/año estimado</option>`;
  orden.append(sel);
  cab.append(h, sello, orden);
  wrap.append(cab);

  const lista = document.createElement("div");
  wrap.append(lista);

  const pintar = (criterio) => {
    lista.innerHTML = "";
    const clave = { ahorro: "ahorroAnual", precio: "precioKwh", anual: "anual" }[criterio];
    const asc = criterio !== "ahorro";
    const ordenadas = [...datos.ofertas].sort((a, b) => (asc ? a[clave] - b[clave] : b[clave] - a[clave]));
    for (const o of ordenadas) lista.append(fila(o));
  };
  sel.addEventListener("change", () => pintar(sel.value));
  pintar("ahorro");

  const dg = datos.desglose;
  const panel = document.createElement("section");
  panel.className = "app-panel";
  panel.innerHTML = `<h2 class="app-h2-azul">¿A dónde se va tu dinero con la recomendada?</h2>
    <div class="app-barra-desglose" role="img" aria-label="Composición: energía ${dg.energia} %, potencia ${dg.potencia} %, impuestos ${dg.impuestos} %">
      <span class="seg--energia" style="width:${dg.energia}%">energía ${dg.energia} %</span>
      <span class="seg--potencia" style="width:${dg.potencia}%">${dg.potencia} %</span>
      <span class="seg--impuestos" style="width:${dg.impuestos}%">${dg.impuestos} %</span>
    </div>`;
  wrap.append(panel);

  const pie = document.createElement("p");
  pie.className = "app-lbl";
  pie.textContent = vivo
    ? `Tarifario ${datos.fechaTarifario} · ${datos.vigencia} · ahorro medido contra la media (${eur(datos.precioActualEstimado)}/año)`
    : `Precios del tarifario del ${datos.fechaTarifario} · Simulación informativa, no vinculante`;
  wrap.append(pie);
  el.append(wrap);
}

function fila(o) {
  const f = document.createElement("article");
  f.className = "app-fila-oferta" + (o.recomendada ? " app-fila-oferta--recomendada" : "");
  const marca = document.createElement("span");
  marca.className = "app-marca";
  if (o.logo) {
    const img = document.createElement("img");
    img.src = o.logo;
    img.alt = o.logoAlt || o.nombre;
    img.title = o.logoAlt || o.nombre;
    img.width = 22; img.height = 22;
    marca.style.background = "transparent";
    marca.append(img);
  } else {
    marca.style.background = o.color;
    marca.textContent = o.marca;
  }

  const nombre = document.createElement("div");
  nombre.innerHTML = `<strong class="app-oferta-nombre">${o.nombre}${o.recomendada ? ' <span class="app-chip--vf app-chip">Recomendada</span>' : ""}</strong>`;
  const chips = document.createElement("div");
  chips.innerHTML =
    `<span class="app-chip">${o.tipo}</span>` +
    (o.detalle ? `<span class="app-chip">${o.detalle}</span>` : "") +
    (o.permanencia ? `<span class="app-chip">permanencia</span>` : `<span class="app-chip">sin permanencia</span>`) +
    (o.verifactu ? `<span class="app-chip app-chip--vf">✓ VeriFactu</span>` : "");
  nombre.append(chips);

  const precio = document.createElement("div");
  precio.innerHTML = `<span class="app-num datos">${num(o.precioKwh)} €/kWh</span><span class="app-lbl">energía</span>`;

  const anual = document.createElement("div");
  anual.innerHTML = `<span class="app-num datos">${eur(o.anual)}/año</span><span class="app-lbl">caso estándar (4 000 kWh/año)</span>`;

  const dcha = document.createElement("div");
  dcha.className = "app-col-end";
  const ahorro = document.createElement("span");
  ahorro.className = "app-num datos app-ahorro";
  ahorro.innerHTML = `<span aria-hidden="true">▼</span> −${eur(o.ahorroAnual)}/año`;
  ahorro.setAttribute("aria-label", `Ahorro estimado: ${eur(o.ahorroAnual)} al año, ${o.ahorroPct} % menos`);
  const btn = crearBoton({
    texto: "Sin sesión: entra y pídela",
    variante: o.recomendada ? "primary" : "secondary",
    onClick: () => { toast("Tras entrar podrás solicitar esta oferta.", { tipo: "info" }); location.assign("#/login"); },
  });
  dcha.append(ahorro, btn.el);
  f.append(marca, nombre, precio, anual, dcha);
  return f;
}
