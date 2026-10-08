/**
 * #/prospectos — A1 prospección viva: 32.582 empresas de tu dataset IberCRM
 * (importado 08-oct por integracion/scripts/prospectos_importar.py desde TU
 * CSV). Carga perezosa por ciudad; búsqueda local. Gesto 1-clic a guión
 * Call-Flow (sessionStorage bmae.prospecto) o a issue canal:callflow.
 */

import { conBarra, h1, panel } from "../lib/shell.js";
import { buscar, cargarCiudad, cargarIndexPros } from "../lib/prospectos.js";

const CACHE = new Map();

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/prospectos", caja);
  caja.append(h1("Prospectos (tu dataset IberCRM)",
    "Importado 08-oct. Sin telemetría: búsqueda en tu navegador sobre ficheros del repo."));

  const pIdx = panel();
  pIdx.innerHTML = `<h2 class="app-h2-azul--mb10">Cobertura</h2>`;
  let idx = null;
  try {
    idx = await cargarIndexPros();
  } catch (e) {
    const v = document.createElement("div");
    v.className = "estado-vacio";
    v.innerHTML = `<p>${e?.message || "Índice no disponible"}</p>
      <p class="app-p">La base se regenera con:
      <code>python integracion/scripts/prospectos_importar.py --csv TU-EXPORT.csv</code></p>`;
    pIdx.append(v);
  }
  if (idx) {
    const res = document.createElement("p");
    res.className = "app-sub";
    res.textContent = `${idx.total.toLocaleString("es-ES")} prospectos únicos · ${idx.deduplicadas} duplicados descartados en la importación.`;
    pIdx.append(res);
    const cIdx = document.createElement("p");
    cIdx.className = "app-lbl";
    cIdx.innerHTML = idx.ciudades.slice(0, 8).map((c) =>
      `<button class="btn btn--ghost btn--sm app-mr6 pro-ciudad" data-arc="${c.archivo}">${c.ciudad} (${c.n})</button>`).join("");
    pIdx.append(cIdx);
  }
  caja.append(pIdx);

  const pB = panel();
  pB.innerHTML = `<h2 class="app-h2-azul--mb10">Buscar y guionar</h2>`;
  const estado = { ciudad: null, datos: [] };
  const cargaP = document.createElement("p");
  cargaP.className = "app-lbl";
  cargaP.textContent = "Elige una ciudad (carga perezosa: solo se descarga lo que uses).";
  pB.append(cargaP);

  const busc = document.createElement("input");
  busc.className = "app-input";
  busc.type = "search";
  busc.placeholder = "Nombre, ciudad, CP, email…";
  busc.setAttribute("aria-label", "buscar en el dataset");
  busc.disabled = true;
  pB.append(busc);

  const lista = document.createElement("div");
  lista.className = "app-p-mt14";
  pB.append(lista);
  caja.append(pB);

  const nota = document.createElement("p");
  nota.className = "app-lbl app-p-mt14";
  nota.textContent = "Dicho de frente: esta lista es para llamar/prospectar; el cliente final real vive con contratos (sheet por llegar, A3). Nada de PII se sube a otro sitio: todo ocurre aquí.";
  caja.append(nota);

  async function cargar(archivo, ciudad) {
    if (CACHE.has(archivo)) return CACHE.get(archivo);
    cargaP.textContent = `Cargando ${ciudad}…`;
    const d = await cargarCiudad(archivo, {});
    const datos = d.prospectos || [];
    CACHE.set(archivo, datos);
    estado.ciudad = ciudad;
    estado.datos = datos;
    cargaP.textContent = `${ciudad}: ${datos.length} prospectos cargados en esta sesión (solo en tu navegador).`;
    busc.disabled = false;
    pintarLista(lista, datos.slice(0, 24), "");
    return datos;
  }

  pIdx.addEventListener("click", (e) => {
    const b = e.target.closest(".pro-ciudad");
    if (!b) return;
    cargar(b.dataset.arc, b.textContent.replace(/\s*\(\d+\)/, "")).catch((err) => {
      cargaP.textContent = err?.message || "No se pudo cargar la ciudad.";
    });
  });
  busc.addEventListener("input", () => pintarLista(lista, buscar(estado.datos, busc.value, 40), busc.value));
}

function pintarLista(lista, filas, q) {
  lista.innerHTML = "";
  if (!filas.length && q && q.length >= 2) {
    lista.innerHTML = `<div class="estado-vacio"><p>Sin resultados para «${q}» en esta ciudad. Prueba otra ciudad arriba o amplía la búsqueda.</p></div>`;
    return;
  }
  for (const p of filas) {
    const d = document.createElement("p");
    d.className = "app-pedido-linea";
    d.innerHTML = `<span><b>${p.nombre}</b> · ${p.ciudad} ${p.cp}</span>
      <span class="app-lbl">${[p.telefono, p.email, p.web].filter(Boolean).join(" · ")}</span>`;
    const acc = document.createElement("span");
    acc.className = "fila-botones";
    const guion = document.createElement("button");
    guion.className = "btn btn--primary btn--sm";
    guion.textContent = "Guionar en Call-Flow";
    guion.addEventListener("click", () => {
      sessionStorage.setItem("bmae.prospecto", JSON.stringify({ id: p.id, nombre: p.nombre, telefono: p.telefono, ciudad: p.ciudad }));
      location.hash = "#/callflow";
    });
    const tel = p.telefono ? p.telefono.replace(/\s/g, "") : null;
    if (tel) {
      const llamar = document.createElement("a");
      llamar.className = "btn btn--ghost btn--sm";
      llamar.href = `tel:+34${tel}`;
      llamar.textContent = `☎ ${p.telefono}`;
      acc.append(llamar);
    }
    acc.append(guion);
    d.append(acc);
    lista.append(d);
  }
}
