/** #/suministro — detalle del punto de suministro (privado). */

import { api } from "../lib/api.js";
import { crearBoton, crearModalConfirmacion, toast } from "../../../../diseno/export/componentes.js";
import { suministro as MOCK, SELLO } from "../datos/mock.js";
import { chipSello } from "../lib/honesto.js";
import { conBarra, h1, panel } from "../lib/shell.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/suministro", caja);
  const { datos } = await api("suministro", { mock: MOCK });

  const cab = h1(`Suministro ${datos.cups}`, `${datos.alias}`);
  cab.querySelector(".app-sub").append(" ", chipSello(SELLO));
  caja.append(cab);

  const p = panel();
  p.innerHTML = `
    <div class="app-grid-auto">
      <div><p class="app-lbl">Tarifa actual</p><p class="app-num app-num--16">${datos.tarifa}</p></div>
      <div><p class="app-lbl">Potencia</p><p class="app-num datos app-num--16">${datos.potencia.p1} kW (P1) · ${datos.potencia.p2} kW (P2)</p></div>
      <div><p class="app-lbl">Facturación</p><p class="app-num datos app-num--16">${datos.gastoMedio}</p></div>
    </div>
    <p class="app-chip app-chip--aviso app-mt16">⚠ Oportunidad detectada: ${datos.potencia.deteccion}</p>`;
  caja.append(p);

  const baja = crearBoton({ texto: "Dar de baja este suministro", variante: "danger" });
  baja.el.addEventListener("click", () => {
    const m = crearModalConfirmacion({
      titulo: "Dar de baja no se puede deshacer desde aquí",
      mensaje: `Se corta la luz de ${datos.alias} (${datos.cups}). Lo tramita gestión humana contigo al tanto. ¿Confirmamos?`,
      textoAceptar: "Confirmar baja",
      textoCancelar: "Cancelar",
      onAceptar: async () => toast("Solicitud de baja registrada en la simulación.", { tipo: "info" }),
    });
    m.api.abrir();
  });
  caja.append(baja.el);
}
