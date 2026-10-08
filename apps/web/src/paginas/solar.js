/** #/solar — simulador solar (privado). Regla C10: todo número con rango/"estimado". */

import { api } from "../lib/api.js";
import { eur, num } from "../lib/honesto.js";
import { crearBoton, toast } from "../../../../diseno/export/componentes.js";
import { solar as MOCK } from "../datos/mock.js";
import { conBarra, h1, panel } from "../lib/shell.js";
import { cargarSolar, ETAPAS_SOLAR } from "../lib/solargh.js";
import { REPO_OPERACION } from "../lib/canalgithub.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/solar", caja);
  const { datos } = await api("solar", { mock: MOCK });

  caja.append(h1("Tu tejado puede trabajar para ti", datos.direccion +
    (datos.catastro ? " · ✓ Superficie Catastro verificada" : "")));

  const p = panel();
  const dl = document.createElement("dl");
  dl.className = "app-dl-kpis";
  for (const [dt, dd, nota] of datos.kpis) {
    const row = document.createElement("div");
    row.className = "app-dl-fila";
    row.innerHTML = `<dt class="app-lbl app-lbl--caps">${dt}</dt>
      <dd class="app-dd-right"><span class="app-num datos">${dd}</span><br><span class="app-lbl">${nota}</span></dd>`;
    dl.append(row);
  }
  p.append(dl);

  const a = datos.ahorro;
  const dest = document.createElement("div");
  dest.className = "app-hero-solar";
  dest.innerHTML = `<p class="datos app-hero-solar__total">≈ ${eur(a.total)}/año</p>
    <p class="app-lbl app-lbl--hero">${eur(a.ahorroDirecto)} de ahorro directo + ${eur(a.compensacion)} de compensación de excedentes</p>
    <p class="app-hero-nota">Inversión estimada ${eur(a.inversion)} (ayudas no descontadas) → retorno en ${num(a.retornoAnos[0])} años, rango honesto ${num(a.retornoAnos[1])}–${num(a.retornoAnos[2])}.</p>`;
  p.append(dest);
  caja.append(p);

  // producción mensual (SVG generado — regla C9: sin librería de gráficas)
  const pp = panel();
  pp.append(h1("Producción estimada por mes", "Modelo con 12 años de irradiancia real de tu ubicación."));
  pp.append(barras(datos.produccionMensual));
  const cta = crearBoton({
    texto: "Pedir estudio a instalador certificado",
    variante: "primary",
    onClick: () => toast("Pedido registrado en la simulación; en producción abre el circuito del instalador.", { tipo: "info" }),
  });
  const nota = document.createElement("p");
  nota.className = "app-nota app-mt18";
  nota.innerHTML = "<b>Compromiso de honestidad:</b> estas cifras son estimaciones. El estudio del instalador puede moverlas ±15 % por sombras reales, estado de la cubierta u orientación exacta. Te lo diremos <i>antes</i> de firmar nada.";
  const cajaCta = document.createElement("div");
  cajaCta.className = "app-mt18";
  cajaCta.append(cta.el);
  pp.append(cajaCta, nota);
  caja.append(pp);

  await pintarOperativa(caja);
}

/** A4 — Operativa solar viva (issues del repo). El simulador (estimaciones
 * C10) se conserva intacto arriba; esto es el día a día real si hay login. */
async function pintarOperativa(caja) {
  const pv = panel();
  pv.innerHTML = `<h2 class="app-h2-azul--mb10">Operativa solar</h2>`;
  let datos = null;
  try {
    if (!REPO_OPERACION) throw new Error("REPO_OPERACION sin cumplimentar");
    datos = await cargarSolar({ repo: REPO_OPERACION });
  } catch (e) {
    const aviso = document.createElement("p");
    aviso.className = "app-sub";
    aviso.setAttribute("role", "note");
    aviso.textContent = `${e?.message || "Operativa viva no disponible"} — arriba sigue el simulador (estimaciones honestas, C10). Cada presupuesto solar se abre como issue con la plantilla 🌞 (labels canal:solar + estado-solar:*).`;
    pv.append(aviso);
  }
  if (datos) {
    const resumenP = document.createElement("p");
    resumenP.className = "app-sub";
    resumenP.textContent = `${datos.abiertos} proyecto(s) abiertos leídos de GitHub Issues.`;
    pv.append(resumenP);
    if (datos.proximas.length) {
      const h4 = document.createElement("h3");
      h4.className = "app-sub app-logros-sub";
      h4.textContent = "Próximas visitas (fecha compromiso; en rojo si pasada)";
      pv.append(h4);
      for (const v of datos.proximas) {
        const d = document.createElement("p");
        d.className = "app-pedido-linea";
        d.innerHTML = `<span>${v.titulo} · <span class="datos app-fw600">${v.id}</span></span>
          <span class="app-chip ${v.vencida ? "app-chip--error" : "app-chip--aviso"}">${v.vencida ? "⚠ visita pasada " : "visita "}${v.visita}</span>`;
        if (v.url) {
          const a = document.createElement("a");
          a.className = "btn btn--ghost btn--sm";
          a.href = v.url; a.target = "_blank"; a.rel = "noopener";
          a.textContent = "Abrir";
          d.append(a);
        }
        pv.append(d);
      }
    }
    const cols = document.createElement("div");
    cols.className = "app-columnas";
    for (const g of datos.grupos) {
      const c = document.createElement("section");
      const h = document.createElement("h3");
      h.textContent = `${g.titulo} (${g.tarjetas.length})`;
      c.append(h);
      if (!g.tarjetas.length) {
        const v = document.createElement("div");
        v.className = "estado-vacio";
        v.innerHTML = "<p>Sin proyectos aquí.</p>";
        c.append(v);
      }
      for (const t of g.tarjetas) {
        const card = document.createElement("article");
        card.className = "app-tarjeta-pedido";
        card.innerHTML = `<p class="app-mb2"><span class="datos app-fw600">${t.id}</span> <b>${t.titulo}</b></p>
          <p class="app-lbl app-lbl--mb10">${t.cerrada ? "cerrada" : "abierta"}${t.visita ? " · visita " + t.visita : ""}</p>`;
        if (t.url) {
          const a = document.createElement("a");
          a.className = "btn btn--ghost btn--sm";
          a.href = t.url; a.target = "_blank"; a.rel = "noopener";
          a.textContent = "Ver en GitHub";
          card.append(a);
        }
        c.append(card);
      }
      cols.append(c);
    }
    pv.append(cols);
  }
  caja.append(pv);
}

export { ETAPAS_SOLAR };

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function barras(datosMes) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 640 190");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "190");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Producción mensual estimada entre ${Math.min(...datosMes)} y ${Math.max(...datosMes)} kWh`);
  const max = Math.max(...datosMes);
  datosMes.forEach((v, i) => {
    const r = document.createElementNS(ns, "rect");
    const h = Math.round((v / max) * 150);
    Object.entries({ x: 20 + i * 52, y: 170 - h, width: 36, height: h, rx: 4, fill: "var(--color-secundario-verde-sostenible)" })
      .forEach(([k, val]) => r.setAttribute(k, val));
    svg.append(r);
    const t = document.createElementNS(ns, "text");
    Object.entries({ x: 38 + i * 52, y: 186, "font-size": 11, fill: "#94A3B8", "text-anchor": "middle" })
      .forEach(([k, val]) => t.setAttribute(k, val));
    t.textContent = MESES[i];
    svg.append(t);
  });
  return svg;
}
