/**
 * #/cliente/<token> — Portal del cliente (B2): sin login; el enlace ES el
 * acceso. Muestra el dossier (albaranes/documentos/contacto) y deja subir la
 * factura EN EL PROPIO NAVEGADOR: se lee localmente y el cliente elige si la
 * usa en su comparativa (sessionStorage, contrato A2) o la manda a su
 * comercial por su correo. Nada sale de su máquina salvo ese mail.
 */

import { h1, panel } from "../lib/shell.js";
import {
  cargarDossier, consumoParaComparativa, extraerFactura, mailtoComercial, tokenValido,
} from "../lib/portalcliente.js";
import { eur } from "../lib/honesto.js";

export async function montar(el, tokenParam) {
  const token = tokenParam || (location.hash.replace(/^#\/cliente\//, "").split("?")[0]);
  const caja = document.createElement("div");
  caja.className = "portal-cliente";
  el.append(caja);

  if (!tokenValido(token)) { vacio(caja, "Este enlace no parece correcto. Pide a tu comercial el enlace completo (empieza por «pc-…»)."); return; }

  caja.append(h1("Tu área de cliente", "Sin usuario ni contraseña: este enlace es tu llave. Guárdalo."));

  let dos = null;
  try { dos = await cargarDossier(token); }
  catch (e) { vacio(caja, e.message); return; }

  pintarDossier(caja, dos);
  pintarSubidaFactura(caja, dos, token);
  notaPrivacidad(caja);
}

function vacio(caja, msg) {
  const v = document.createElement("div");
  v.className = "estado-vacio";
  v.innerHTML = `<p>${msg}</p><p class="app-p">No recogemos datos: este portal solo lee tu ficha y herramientas que tú decides usar.</p>`;
  caja.append(v);
}

function pintarDossier(caja, dos) {
  const p = panel();
  p.innerHTML = `<h2 class="app-h2-azul--mb10">Hola, ${dos.nombre}</h2>`;
  const sub = document.createElement("p");
  sub.className = "app-sub";
  sub.textContent = [dos.ref && `ref. ${dos.ref}`, dos.contactoComercial && `tu comercial: ${dos.contactoComercial.nombre || dos.contactoComercial}`].filter(Boolean).join(" · ");
  p.append(sub);

  if (dos.visitaProxima) {
    const v = document.createElement("p");
    v.className = "app-pedido-linea";
    v.innerHTML = `<span>Próxima visita programada</span><span class="app-chip app-chip--aviso">${dos.visitaProxima}</span>`;
    p.append(v);
  }

  for (const a of dos.albaranes || []) {
    const d = document.createElement("p");
    d.className = "app-pedido-linea";
    d.innerHTML = `<span>Albarán · <b>${a.concepto || a.ref || a.numero}</b></span>
      <span class="app-lbl"><span class="datos">${a.numero}</span> · ${a.fecha} · ${eur(a.total)}</span>`;
    if (a.pdf) {
      const link = document.createElement("a");
      link.className = "btn btn--ghost btn--sm";
      link.href = encodeURI(a.pdf); link.target = "_blank"; link.rel = "noopener";
      link.textContent = "Ver PDF";
      d.append(link);
    }
    p.append(d);
  }
  for (const doc of dos.documentos || []) {
    const d = document.createElement("p");
    d.className = "app-pedido-linea";
    d.innerHTML = `<span>Documento · <b>${doc.tipo}</b></span>
      <span class="app-lbl"><span class="datos">${doc.numero}</span> · ${doc.fecha}</span>`;
    if (doc.pdf) {
      const link = document.createElement("a");
      link.className = "btn btn--ghost btn--sm";
      link.href = encodeURI(doc.pdf); link.target = "_blank"; link.rel = "noopener";
      link.textContent = "Ver PDF";
      d.append(link);
    }
    p.append(d);
  }
  caja.append(p);
}

function pintarSubidaFactura(caja, dos, token) {
  const p = panel();
  p.innerHTML = `<h2 class="app-h2-azul--mb10">¿Quieres tu comparativa de azotea?</h2>
    <p class="app-sub">Pega aquí el texto de tu última factura (o selecciona el archivo .txt). <b>Se lee solo en tu navegador; no se sube a ningún sitio.</b>
    Si es PDF, ábrela, selecciona el texto y pégalo — los PDF escaneados no se pueden leer solos, avisa y te pedimos los números por teléfono.</p>`;

  const ta = document.createElement("textarea");
  ta.className = "app-textarea";
  ta.setAttribute("aria-label", "texto de tu factura");
  ta.placeholder = "Pega aquí el texto completo de la factura…";
  ta.rows = 8;
  p.append(ta);

  const fila = document.createElement("div");
  fila.className = "app-pedido-linea";
  const file = document.createElement("input");
  file.type = "file"; file.accept = ".txt,text/plain";
  file.setAttribute("aria-label", "o elige el archivo de texto de la factura");
  file.addEventListener("change", () => {
    const f = file.files?.[0];
    if (!f) return;
    if (!/\.txt$/i.test(f.name)) { resultado(p, null, "Solo leo facturas en texto (.txt). Si es PDF, pega el texto.", "nota"); return; }
    const lector = new FileReader();
    lector.onload = () => { ta.value = String(lector.result || "").slice(0, 50000); resultado(p, extraerFactura(ta.value), null, null, dos, token); };
    lector.readAsText(f);
  });
  const btn = document.createElement("button");
  btn.className = "btn btn--primary btn--sm";
  btn.textContent = "Leer mi factura";
  btn.addEventListener("click", () => {
    if (!ta.value.trim()) { resultado(p, null, "Pega primero el texto de la factura.", "nota"); return; }
    resultado(p, extraerFactura(ta.value), null, null, dos, token);
  });
  fila.append(file, btn);
  p.append(fila);
  caja.append(p);
}

function resultado(p, ext, msg, tipo, dos, token) {
  p.querySelector(".portal-resultado")?.remove();
  const box = document.createElement("div");
  box.className = "portal-resultado app-card app-p-mt14";
  if (msg) {
    box.innerHTML = `<p class="app-sub ${tipo === "nota" ? "app-chip--aviso" : ""}">${msg}</p>`;
    p.append(box); return;
  }
  const dl = document.createElement("dl");
  dl.className = "app-dl-kpis";
  const pares = [
    ["Consumo de la factura", ext.kwh != null ? `${ext.kwh} kWh` : "no legible"],
    ["Potencia contratada", ext.kw != null ? `${ext.kw} kW` : "no legible"],
    ["Importe total", ext.importe != null ? eur(ext.importe) : "no legible"],
    ["CUPS", ext.campos.cups || "no legible"],
  ];
  for (const [k, v] of pares) {
    const row = document.createElement("div");
    row.className = "app-dl-fila";
    row.innerHTML = `<dt class="app-lbl app-lbl--caps">${k}</dt><dd class="app-dd-right"><span class="app-num datos">${v}</span></dd>`;
    dl.append(row);
  }
  box.append(dl);
  const conf = document.createElement("p");
  conf.className = `app-chip ${ext.confianza === "baja" ? "app-chip--error" : "app-chip--aviso"}`;
  conf.textContent = ext.confianza === "baja"
    ? "Confianza baja: los números pueden no ser exactos — tu comercial los revisará siempre antes de usarlos."
    : `Lectura ${ext.confianza}: revisa los números contra tu factura antes de usarlos.`;
  box.append(conf);

  const acciones = document.createElement("div");
  acciones.className = "fila-botones";
  const comparativa = consumoParaComparativa(ext);
  if (comparativa) {
    const b = document.createElement("button");
    b.className = "btn btn--primary btn--sm";
    b.textContent = "Usar estos números en mi comparativa";
    b.addEventListener("click", () => {
      sessionStorage.setItem("bmae.consumo", JSON.stringify(comparativa));
      const ok = document.createElement("p");
      ok.className = "app-sub";
      ok.innerHTML = `Listo: guardado solo en tu navegador. <a href="#/comparador">Abrir mi comparativa →</a>`;
      box.append(ok);
    });
    acciones.append(b);
  }
  const email = dos?.contactoComercial?.email || null;
  if (email) {
    const m = document.createElement("a");
    m.className = "btn btn--ghost btn--sm";
    m.href = mailtoComercial(email, ext, token);
    m.textContent = `Mandarla a mi comercial (${email})`;
    acciones.append(m);
  }
  box.append(acciones);
  p.append(box);
}

function notaPrivacidad(caja) {
  const n = document.createElement("p");
  n.className = "app-lbl app-p-mt14";
  n.textContent = "Privacidad: este enlace es tu llave (no la compartas). Solo leemos tu ficha; la factura se procesa en tu dispositivo y nunca se sube sola.";
  caja.append(n);
}
