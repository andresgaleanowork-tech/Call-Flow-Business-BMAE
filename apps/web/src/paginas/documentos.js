/**
 * #/documentos — B4 plantillas (contrato/anexo RGPD): lista el libro vivo.
 * Generar = script `integracion/scripts/documentos_plantilla.py` (hoy
 * manual/CLI; workflow dedicado cuando lo pidas). Las plantillas exigen
 * revisión legal antes de firmarse — dicho aquí, allí y al pie de cada PDF.
 */

import { conBarra, h1, panel } from "../lib/shell.js";
import { aFilas, cargarLibro, resumen } from "../lib/documentos.js";

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/documentos", caja);
  caja.append(h1("Documentos: contratos y anexos RGPD",
    "Generados a partir de plantillas base. Requiere revisión legal antes de su firma (el propio PDF lo lleva al pie)."));

  const pl = panel();
  pl.innerHTML = `<h2 class="app-h2-azul--mb10">Generaciones registradas</h2>`;
  let libro = null;
  try {
    libro = await cargarLibro();
  } catch (e) {
    const v = document.createElement("div");
    v.className = "estado-vacio";
    v.innerHTML = `<p>${e?.message || "Libro de documentos no disponible"}</p>`;
    pl.append(v);
  }
  if (libro) {
    const r = resumen(libro);
    const resumenP = document.createElement("p");
    resumenP.className = "app-sub";
    resumenP.textContent = `${r.num} documento(s) registrados${r.ultimo ? ` · último ${r.ultimo}` : ""}.`;
    pl.append(resumenP);
    if (r.nifPendiente) {
      const aviso = document.createElement("p");
      aviso.className = "app-chip app-chip--aviso";
      aviso.setAttribute("role", "note");
      aviso.textContent = "El emisor declara NIF PENDIENTE: los documentos generados no son firmables hasta cumplimentar datos/documentos/documentos.json.";
      pl.append(aviso);
    }
    const filas = aFilas(libro.docs || []);
    if (!filas.length) {
      const v = document.createElement("div");
      v.className = "estado-vacio";
      v.innerHTML = `<p>Todavía no hay documentos generados.</p>
        <p class="app-p">Genera el primero con el gesto:
          <code>python integracion/scripts/documentos_plantilla.py --tipo contrato --datos cliente.json</code>
          (o <code>--tipo anexo-rgpd</code>). El PDF queda registrado aquí con huella.</p>`;
      pl.append(v);
    }
    for (const f of filas) {
      const d = document.createElement("p");
      d.className = "app-pedido-linea";
      d.innerHTML = `<span><b>${f.tipoTxt}</b> · ${f.ref} · <span class="datos app-fw600">${f.numero}</span></span>
        <span class="app-lbl">${f.fechaTxt} · huella ${f.huellaCorta}</span>`;
      if (f.pdf) {
        const a = document.createElement("a");
        a.className = "btn btn--ghost btn--sm";
        a.href = encodeURI(f.pdf.startsWith("datos/") ? f.pdf : `datos/documentos/pdf/${f.pdf.split("/").pop()}`);
        a.target = "_blank"; a.rel = "noopener";
        a.textContent = "Ver PDF";
        d.append(a);
      }
      pl.append(d);
    }
  }
  caja.append(pl);

  const nota = document.createElement("p");
  nota.className = "app-lbl app-p-mt14";
  nota.textContent = "Registro de integridad: cada PDF lleva huella SHA-256 en el libro. No es un servicio de firma electrónica; la firma (y la revisión legal) son gestos humanos.";
  caja.append(nota);
}
