/** #/alta — datos fiscales + consentimientos (pública; modal confirmación C5). */

import { crearBoton, crearCampoNIF, crearModalConfirmacion, toast } from "../../../../diseno/export/componentes.js";
import { cabeceraPublica, h1 } from "../lib/shell.js";

export async function montar(el) {
  el.append(cabeceraPublica());
  const wrap = document.createElement("div");
  wrap.className = "app-wrap";
  el.append(wrap);
  wrap.append(h1("Datos para tramitar tu cambio", "Los justos para cumplir la ley y registrar tus facturas. Nada más."));

  const nif = crearCampoNIF({ etiqueta: "NIF/CIF", ayuda: "Una letra, 7-8 dígitos, letra final", requerido: true });
  const social = document.createElement("div");
  social.innerHTML = `
    <div class="campo"><label class="campo__etiqueta" for="a-razon">Razón social / nombre</label>
    <input class="campo__control" id="a-razon" autocomplete="organization">
    <p class="campo__ayuda">Tal como sale en tu factura.</p></div>
    <div class="campo"><label class="campo__etiqueta" for="a-iban">IBAN</label>
    <input class="campo__control datos" id="a-iban" autocomplete="off" placeholder="ES00 0000 0000 0000 0000 0000">
    <p class="campo__ayuda">Solo para tu domiciliación. Sale cifrado.</p></div>`;

  const consent = document.createElement("fieldset");
  consent.className = "app-consent"; // estilos extraídos a app.css
  consent.innerHTML = `<legend>Consentimientos (RGPD)</legend>
    <label>
      <input type="checkbox" id="c-cambio">
      <span>Pido el cambio de comercializadora en mi nombre (obligatorio para tramitar).</span></label>
    <label>
      <input type="checkbox" id="c-ofertas">
      <span>Quiero que me aviséis si aparece algo mejor para mi consumo (opcional, opción real).</span></label>`;

  const form = document.createElement("div");
  form.className = "app-grid-form";
  form.append(nif.el, social, consent);

  const enviar = crearBoton({ texto: "Enviar a tramitación →", variante: "primary" });
  const acciones = document.createElement("div");
  acciones.className = "app-acciones-form";
  acciones.append(enviar.el);
  form.append(acciones);
  wrap.append(form);

  enviar.el.addEventListener("click", () => {
    if (!nif.api.validarAhora()) { nif.input.focus(); return; }
    if (!document.getElementById("c-cambio").checked) {
      toast("Necesitamos tu consentimiento expreso para el cambio; sin él no podemos tocar nada.", { tipo: "error", assertivo: true });
      return;
    }
    const modal = crearModalConfirmacion({
      titulo: "Pedido en tramitación",
      mensaje: "Te escribimos en menos de 24 h laborables con el siguiente paso. Nada cambia hasta que tú lo confirmas con tu comercializadora actual.",
      textoAceptar: "Entendido",
      textoCancelar: "Revisar datos",
      onAceptar: async () => {
        toast("Pedido registrado en la simulación; en producción se crea el expediente en el CRM.", { tipo: "exito" });
      },
    });
    modal.api.abrir();
  });
}
