/** #/facturas — el LIBRO VeriFactu real (GitHub-Total H2): lee
 * datos/verifactu/cadena.json, que solo escribe el bot del SIF tras respuesta
 * AEAT. Nunca mock: vacío honesto mientras la cadena no tenga registros
 * (wave w1 pendiente del certificado cualificado). Chips con icono+texto
 * (no solo color) y huella truncada + QR de cotejo AEAT por fila. */

import { crearTabla } from "../../../../diseno/export/componentes.js";
import { cargarCadena, aFilas, resumenCadena } from "../lib/verifactu.js";
import { conBarra, h1 } from "../lib/shell.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/facturas", caja);

  let cadena = null;
  let errorCarga = null;
  try {
    cadena = await cargarCadena();
  } catch (e) {
    errorCarga = e;
  }

  const resu = resumenCadena(cadena || {});
  caja.append(h1(
    "Facturas (libro VeriFactu vivo)",
    `Emisor: ${resu.emisor} · ${resu.emisorNif} · registros en cadena: ${resu.numRegistros} · actualizada ${resu.upd}. La escribe el bot del SIF tras ok de AEAT; aquí solo se lee.`,
  ));

  const panel = document.createElement("section");
  panel.className = "app-panel";
  if (errorCarga) {
    const err = document.createElement("div");
    err.className = "estado-error";
    err.setAttribute("role", "alert");
    err.textContent = `✘ No se pudo leer el libro (${errorCarga.message}).`;
    panel.append(err);
    caja.append(panel);
    return;
  }

  if (resu.numRegistros === 0) {
    const vacio = document.createElement("div");
    vacio.className = "estado-vacio";
    vacio.innerHTML = `<p><b>Cadena sin registros todavía.</b></p>
      <p>El primer envío real (wave F4G·w1) requiere el certificado cualificado AEAT — gesto humano documentado en <code>docs/deploy-github.md</code>. Aquí jamás verás ejemplo de facturas: solo el libro legal.</p>`;
    panel.append(vacio);
    caja.append(panel);
    return;
  }

  const tabla = crearTabla({
    caption: "Registros del libro VeriFactu encadenado (más reciente primero)",
    columnas: [
      { titulo: "NumSerie", clave: "numero" },
      { titulo: "Fecha", clave: "fechaTxt" },
      { titulo: "Descripción", clave: "cliente" },
      { titulo: "Total", clave: "totalTxt", numerica: true },
      { titulo: "VeriFactu", clave: "vfTxt" },
      { titulo: "Huella SHA-256", clave: "huellaCorta" },
      { titulo: "Cotejo", clave: "qr" },
    ],
    filas: [],
  });
  panel.append(tabla.el);
  const filas = aFilas(cadena);
  tabla.api.cargar(filas.map((f) => ({ ...f, huellaCorta: f.huellaCorta, qr: "" })));
  tabla.el.querySelectorAll("tbody tr").forEach((tr, i) => {
    const vi = tr.querySelector('[data-col="VeriFactu"]');
    if (vi) vi.innerHTML = `<span class="app-chip app-chip--vf">✓ registrada AEAT</span>`;
    const hq = tr.querySelector('[data-col="Huella SHA-256"]');
    if (hq) hq.title = filas[i].huella;
    const cota = tr.querySelector('[data-col="Cotejo"]');
    if (cota && filas[i].qr) {
      const a = document.createElement("a");
      a.href = filas[i].qr;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn btn--ghost btn--sm";
      a.textContent = "Verificar QR";
      cota.append(a);
    }
  });
  const nota = document.createElement("p");
  nota.className = "app-lbl";
  nota.textContent = "La cadena es prueba legal: cada huella encadena con la anterior (RD 1007/2023); Git guarda la historia de los commits [bot del SIF].";
  panel.append(nota);
  caja.append(panel);
}
