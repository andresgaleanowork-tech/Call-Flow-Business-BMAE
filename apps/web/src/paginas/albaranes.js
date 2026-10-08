/** #/albaranes — libro vivo de albaranes (modo sin-certificado AEAT). Mismo
 * patrón que #/facturas: lee el JSON del repo y, si está vacío, lo dice en
 * voz alta con la acción correcta (abrir issue con plantilla 📄 Albarán). */

import { crearTabla } from "../../../../diseno/export/componentes.js";
import { cargarLibro, aFilas, resumen } from "../lib/albaranes.js";
import { conBarra, h1 } from "../lib/shell.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/albaranes", caja);

  let libro = null;
  let error = null;
  try {
    libro = await cargarLibro();
  } catch (e) {
    error = e;
  }
  const r = resumen(libro || {});
  caja.append(h1(
    "Albaranes (operativa diaria — documento no fiscal)",
    `${r.emisor}${r.nifPendiente ? " (NIF pendiente de cumplimentar)" : ""} · ${r.num} albarán(es) · total acumulado ${r.total.toFixed(2).replace(".", ",")} €. Las facturas fiscales llegan con el certificado AEAT (F4G·w1).`,
  ));

  const panel = document.createElement("section");
  panel.className = "app-panel";
  if (error) {
    const err = document.createElement("div");
    err.className = "estado-error";
    err.setAttribute("role", "alert");
    err.textContent = `✘ No se pudo leer el libro de albaranes (${error.message}).`;
    panel.append(err);
    caja.append(panel);
    return;
  }

  if (r.num === 0) {
    const vacio = document.createElement("div");
    vacio.className = "estado-vacio";
    vacio.innerHTML = `<p><b>Libro de albaranes vacío todavía.</b></p>
      <p>Se genera un albarán abriendo un issue en el repo con la plantilla <b>📄 Albarán</b> (JSON dentro) y etiqueta <code>albaran:crear</code>. El bot commitea PDF + asiento aquí mismo.</p>`;
    panel.append(vacio);
    caja.append(panel);
    return;
  }

  const tabla = crearTabla({
    caption: "Albaranes registrados (más reciente primero)",
    columnas: [
      { titulo: "Número", clave: "numero" },
      { titulo: "Fecha", clave: "fechaTxt" },
      { titulo: "Cliente (ref.)", clave: "cliente" },
      { titulo: "Concepto", clave: "concepto" },
      { titulo: "Total", clave: "totalTxt", numerica: true },
      { titulo: "Integridad", clave: "huellaCorta" },
      { titulo: "PDF", clave: "pdf" },
    ],
    filas: [],
  });
  panel.append(tabla.el);
  const filas = aFilas(libro);
  tabla.api.cargar(filas.map((f) => ({ ...f, pdf: "" })));
  tabla.el.querySelectorAll("tbody tr").forEach((tr, i) => {
    const celda = tr.querySelector('[data-col="PDF"]');
    if (celda && filas[i].pdf) {
      const a = document.createElement("a");
      a.href = filas[i].pdf;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn btn--ghost btn--sm";
      a.textContent = "Ver PDF";
      celda.append(a);
    }
    const h = tr.querySelector('[data-col="Integridad"]');
    if (h) h.title = filas[i]._raw.huella_integridad || "";
  });
  const nota = document.createElement("p");
  nota.className = "app-lbl";
  nota.textContent = "Documento comercial sin valor fiscal. La huella de integridad es SHA-256 del contenido (garantía técnica, no fiscal). La emisión fiscal llega con el certificado AEAT.";
  panel.append(nota);
  caja.append(panel);
}
