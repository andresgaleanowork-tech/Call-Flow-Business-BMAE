/** #/captacion — asistente 3 pasos (público; guardado parcial en pestaña). */

import { crearBoton, crearCampoCUPS, toast } from "../../../../diseno/export/componentes.js";
import { cabeceraPublica, h1 } from "../lib/shell.js";

const K_PARCIAL = "bmae.captacion";

export async function montar(el) {
  el.append(cabeceraPublica());
  const wrap = document.createElement("div");
  wrap.className = "app-wrap";
  el.append(wrap);

  wrap.append(h1("Cuéntanos tu suministro", "Tres pasos. Si falta algo, trabajamos con lo que tengas y te decimos exactamente con qué."));

  const progreso = document.createElement("p");
  progreso.className = "app-progreso";
  wrap.append(progreso);

  // recuperación de guardado parcial (regla wireframe 03)
  let parcial = {};
  try { parcial = JSON.parse(sessionStorage.getItem(K_PARCIAL) || "{}"); } catch { /* sin datos */ }
  const cupsPrevio = parcial.cups || sessionStorage.getItem("bmae.cups") || "";

  const campoCups = crearCampoCUPS({
    etiqueta: "CUPS",
    ayuda: "Está en tu factura, arriba a la derecha",
    requerido: false,
  });
  if (cupsPrevio) campoCups.api.poner(cupsPrevio);

  const campoConsumoEl = document.createElement("div");
  campoConsumoEl.innerHTML = `
    <div class="campo"><label class="campo__etiqueta" for="c-consumo">Consumo anual (kWh)</label>
    <input class="campo__control datos" id="c-consumo" type="number" inputmode="numeric" min="0" value="${parcial.consumo || ""}">
    <p class="campo__ayuda">Si no lo sabes, lo estimamos — te lo diremos claramente.</p></div>`;

  const paso1 = document.createElement("div");
  const siguiente = crearBoton({ texto: "Seguir →", variante: "primary" });
  paso1.append(campoCups.el, campoConsumoEl, siguiente.el);

  wrap.append(paso1);

  let paso = 1;
  const marcar = () => { progreso.innerHTML = `●━━ <b>Paso ${paso} de 3</b>`; };
  marcar();

  siguiente.el.addEventListener("click", () => {
    if (campoCups.api.valor() && !campoCups.api.validarAhora()) return;
    const datos = {
      cups: campoCups.api.valor().toUpperCase(),
      consumo: campoConsumoEl.querySelector("input").value,
    };
    sessionStorage.setItem(K_PARCIAL, JSON.stringify(datos));
    sessionStorage.setItem("bmae.cups", datos.cups || "");
    paso = 2;
    marcar();
    paso1.remove();
    const fin = document.createElement("div");
    fin.append(h1("Recibido", "Datos guardados en esta pestaña. Tras entrar, te llevamos directo a tu comparativa."));
    const ir = crearBoton({
      texto: "Entrar y ver mi comparativa →",
      variante: "primary",
      onClick: () => location.assign("frontend-auth/login.html"),
    });
    fin.append(ir.el);
    wrap.append(fin);
    toast("Datos guardados. Sigues donde lo dejaste cuando vuelvas.", { tipo: "exito" });
  });
}
