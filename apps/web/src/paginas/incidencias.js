/**
 * #/incidencias — Incidencias y garantías vivas (B5): issues `canal:incidencia`,
 * SLA en rojo si la fecha compromiso pasa sin resolver. Sin login/repo el
 * estado vacío siempre propone el gesto concreto (abrir issue con plantilla 🛠).
 */

import { conBarra, h1, panel } from "../lib/shell.js";
import { cargarIncidencias } from "../lib/incidenciasgh.js";
import { REPO_OPERACION } from "../lib/canalgithub.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/incidencias", caja);
  caja.append(h1("Incidencias y garantías",
    "Cada una es un issue con SLA (fecha compromiso). Ante ticket RMA, el número va en el cuerpo y el circuito vive en datos/rma.json."));

  const pl = panel();
  pl.innerHTML = `<h2 class="app-h2-azul--mb10">Vivo — GitHub Issues</h2>`;
  let datos = null;
  try {
    if (!REPO_OPERACION) throw new Error("REPO_OPERACION sin cumplimentar");
    datos = await cargarIncidencias({ repo: REPO_OPERACION });
  } catch (e) {
    const v = document.createElement("div");
    v.className = "estado-vacio";
    v.innerHTML = `<p>${e?.message || "Incidencias vivas no disponibles"}</p>
      <p class="app-p">Crea la primera: <b>issue 🛠 Incidencia o garantía</b> con el label <code>canal:incidencia</code>
      y el SLA como label <code>compromiso:AAAA-MM-DD</code>. Si hay ticket de visita técnica, cuerpo con «RMA: TT-ADIT-311» (estado abierto/cerrado, único activo por llamada).</p>`;
    pl.append(v);
  }
  if (datos) {
    const resumenP = document.createElement("p");
    resumenP.className = "app-sub";
    resumenP.textContent = `${datos.abiertas} incidencias abiertas${datos.vencidas ? ` · ⚠ ${datos.vencidas} con el SLA vencido` : ""}.`;
    pl.append(resumenP);
    if (!datos.filas.length) {
      const v = document.createElement("div");
      v.className = "estado-vacio";
      v.innerHTML = "<p>Sin incidencias registradas en el repo.</p>";
      pl.append(v);
    }
    for (const f of datos.filas) {
      const d = document.createElement("p");
      d.className = "app-pedido-linea";
      d.innerHTML = `<span>${f.titulo} · <span class="datos app-fw600">${f.id}</span>${f.rma ? ` · RMA ${f.rma}` : ""}${f.cerrada ? " · cerrada" : ""}</span>
        <span>
          <span class="app-chip">${f.estadoTxt}</span>
          ${f.compromiso ? `<span class="app-chip ${f.vencida ? "app-chip--error" : "app-chip--aviso"}">${f.vencida ? "⚠ SLA vencido " : "SLA "}${f.compromiso}</span>` : `<span class="app-chip">sin SLA marcado</span>`}
        </span>`;
      if (f.url) {
        const a = document.createElement("a");
        a.className = "btn btn--ghost btn--sm";
        a.href = f.url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = "Abrir";
        d.append(a);
      }
      pl.append(d);
    }
  }
  caja.append(pl);

}

export async function demo() { return { ok: true }; }
