/** #/gestor — pipeline comercial (GitHub-Total w3): en vivo desde los Issues
 * del repo de operación (labels canal:callflow + estado:*). Sin token/repo →
 * vista contractual (mock declarado), jamás fingir vivo. Arrastrar tarjetas no
 * es V1: se avanza con el label `estado:*` en el propio issue (botón abre). */

import { crearBoton, toast } from "../../../../diseno/export/componentes.js";
import { gestor as MOCK } from "../datos/mock.js";
import { cargarPipeline } from "../lib/pipelinegh.js";
import { REPO_OPERACION } from "../lib/canalgithub.js";
import { conBarra, h1 } from "../lib/shell.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/gestor", caja);

  let datos = { columnas: MOCK.columnas };
  let vivo = false;
  try {
    if (REPO_OPERACION) {
      datos = await cargarPipeline({ repo: REPO_OPERACION });
      vivo = true;
    }
  } catch (e) {
    toast(e?.message || "Pipeline vivo no disponible; mostrando vista contractual.", { tipo: "info" });
  }

  caja.append(h1("Pipeline",
    vivo
      ? `Vivo desde GitHub Issues (canal:callflow) · ${datos.vivas} abierta(s). Se avanza con el label \`estado:*\` en el issue.`
      : "Vista contractual (mock). Conecta tu GitHub en #/login y cumplimenta REPO_OPERACION para el vivo — GitHub-Total w3."));

  const columnas = document.createElement("div");
  columnas.className = "app-columnas";
  for (const col of datos.columnas) {
    const c = document.createElement("section");
    const h = document.createElement("h3");
    h.textContent = `${col.titulo} (${col.tarjetas.length})`;
    c.append(h);
    if (!col.tarjetas.length) {
      const v = document.createElement("div");
      v.className = "estado-vacio";
      v.innerHTML = "<p>En blanco. Buen momento para llamadas pendientes.</p>";
      c.append(v);
    }
    for (const t of col.tarjetas) {
      const card = document.createElement("article");
      card.className = "app-tarjeta-pedido";
      card.innerHTML = `<p class="app-mb2"><span class="datos app-fw600">${t.id}</span> <b>${t.cliente}</b></p>
        <p class="app-lbl app-lbl--mb10">${t.detalle}</p>`;
      const accion = vivo && t.url
        ? crearBoton({ texto: "Abrir en GitHub", variante: "ghost", tamano: "sm", onClick: () => window.open(t.url, "_blank", "noopener") })
        : crearBoton({ texto: t.accion || "Ver", variante: "ghost", tamano: "sm", onClick: () => toast("Conecta GitHub (#/login) para operar el pipeline real.", { tipo: "info" }) });
      card.append(accion.el);
      c.append(card);
    }
    columnas.append(c);
  }
  caja.append(columnas);
}
