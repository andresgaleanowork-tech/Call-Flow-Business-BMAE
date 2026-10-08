/**
 * componentes.js — C5 (§9 maestro): Button, Campo/Input, Card KPI, Modal
 * (focus trap + Esc + retorno de foco), Table (skeleton/empty/error/sorting)
 * y Toast (aria-live). Vanilla ES module + components.css.
 *
 * CADA fábrica devuelve { el, api } con el elemento y los controles de
 * estado exigidos por §9 (loading/error/vacío donde aplica).
 */

/* ───────────────────────────── Button ─────────────────────────────── */
export function crearBoton({ texto, variante = "primary", tamano = "md", onClick, icono = null, ariaLabel = null }) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `btn btn--${variante} btn--${tamano}`;
  if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
  const span = document.createElement("span");
  span.textContent = texto;
  if (icono) el.append(icono);
  el.append(span);
  const api = {
    loading(v) {
      el.classList.toggle("btn--loading", v);
      el.disabled = !!v;
      el.setAttribute("aria-busy", v ? "true" : "false");
      const ya = el.querySelector(".spinner");
      if (v && !ya) {
        const s = document.createElement("span");
        s.className = "spinner";
        s.setAttribute("aria-hidden", "true");
        el.prepend(s);
      } else if (!v && ya) ya.remove();
    },
    disabled(v) { el.disabled = !!v; },
  };
  el.addEventListener("click", (e) => {
    if (el.disabled || el.classList.contains("btn--loading")) return;
    onClick?.(e, api);
  });
  return { el, api };
}

/* ───────────────────────────── Campo / Input ──────────────────────── */
export const RE_CUPS = /^ES[0-9]{16}[A-Z]{2}[0-9]{0,2}[A-Z]?$/;
export const RE_NIF = /^[A-Z0-9][0-9]{7}[A-Z]$/i;

export function crearCampo({
  etiqueta, tipo = "text", ayuda = "", requerido = false,
  validar = null, id = null, autocompletar = null,
}) {
  const uid = id || `c-${Math.random().toString(36).slice(2, 9)}`;
  const cont = document.createElement("div");
  cont.className = "campo";
  const lbl = document.createElement("label");
  lbl.className = "campo__etiqueta";
  lbl.htmlFor = uid;
  lbl.textContent = etiqueta;
  const input = document.createElement("input");
  input.className = "campo__control";
  input.type = tipo;
  input.id = uid;
  if (requerido) input.required = true;
  if (autocompletar) input.setAttribute("autocomplete", autocompletar);
  const pista = document.createElement("p");
  pista.className = "campo__ayuda";
  pista.id = `${uid}-ayuda`;
  pista.textContent = ayuda;
  if (ayuda) input.setAttribute("aria-describedby", pista.id);
  cont.append(lbl, input, pista);

  const api = {
    valor: () => input.value,
    poner: (v) => { input.value = v; },
    error(msg) {
      cont.classList.toggle("campo--error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      pista.textContent = msg || ayuda;
      if (msg) input.setAttribute("aria-describedby", pista.id);
    },
    validarAhora() {
      const v = input.value.trim();
      if (requerido && !v) { api.error("Este campo es obligatorio"); return false; }
      if (v && validar) {
        const r = validar(v);
        if (r !== true) { api.error(r || "Valor no válido"); return false; }
      }
      api.error(null);
      return true;
    },
  };
  input.addEventListener("blur", api.validarAhora);
  input.addEventListener("input", () => cont.classList.remove("campo--error"));
  return { el: cont, input, api };
}

// constructores de materias prima (§9 lista de inputs)
export const crearCampoCUPS = (cfg = {}) => crearCampo({
  ...cfg,
  autocompletar: "off",
  validar: (v) => (RE_CUPS.test(v.trim().toUpperCase()) ? true : "CUPS con formato inválido (ES0000000000000000AA)"),
});
export const crearCampoNIF = (cfg = {}) => crearCampo({
  ...cfg,
  autocompletar: "off",
  validar: (v) => (RE_NIF.test(v.trim()) ? true : "NIF/CIF inválido (una letra, 7-8 dígitos, letra final)"),
});

/* ───────────────────────────── Card KPI ───────────────────────────── */
export function crearKpi({ titulo, valor, delta = null }) {
  const el = document.createElement("article");
  el.className = "kpi";
  const h = document.createElement("h3");
  h.className = "kpi__titulo";
  h.textContent = titulo;
  const v = document.createElement("p");
  v.className = "kpi__valor";
  v.textContent = valor;
  el.append(h, v);
  const api = {
    ponerValor(nuevo) { v.textContent = nuevo; },
    ponerDelta({ texto, sentido = "neutro" }) {
      let d = el.querySelector(".kpi__delta");
      if (!d) {
        d = document.createElement("p");
        d.className = "kpi__delta";
        el.append(d);
      }
      d.className = `kpi__delta kpi__delta--${sentido}`;
      d.innerHTML = "";
      const flecha = document.createElement("span");
      flecha.setAttribute("aria-hidden", "true");
      flecha.textContent = sentido === "sube" ? "▲ " : sentido === "baja" ? "▼ " : "· ";
      d.append(flecha, document.createTextNode(texto));
      d.setAttribute("aria-label", `${sentido === "sube" ? "Aumenta" : sentido === "baja" ? "Disminuye" : "Sin cambio"}: ${texto}`);
    },
  };
  if (delta) api.ponerDelta(delta);
  return { el, api };
}

/* ───────────────────────────── Modal ──────────────────────────────── */
function focables(cont) {
  return [...cont.querySelectorAll(
    'a[href], button:not(:disabled), input:not(:disabled), select, textarea, [tabindex]:not([tabindex="-1"])'
  )];
}

export function crearModal({ titulo, contenido, acciones = [], pantallaCompleta = false, alCerrar = null }) {
  const fondo = document.createElement("div");
  fondo.className = "modal-fondo";
  const el = document.createElement("div");
  el.className = "modal" + (pantallaCompleta ? " modal--pantalla-completa" : "");
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  const tid = `m-${Math.random().toString(36).slice(2, 9)}`;
  el.setAttribute("aria-labelledby", tid);
  const h = document.createElement("h2");
  h.className = "modal__titulo";
  h.id = tid;
  h.textContent = titulo;
  const caja = document.createElement("div");
  caja.append(contenido);
  el.append(h, caja);
  const barra = document.createElement("div");
  barra.className = "modal__acciones";
  for (const a of acciones) barra.append(a);
  if (acciones.length) el.append(barra);
  fondo.append(el);
  const invocador = document.activeElement;

  const api = {
    abrir() {
      document.body.append(fondo);
      document.body.style.overflow = "hidden";
      setTimeout(() => (focables(el)[0] || el).focus(), 0);
      return api;
    },
    cerrar() {
      fondo.remove();
      document.body.style.overflow = "";
      alCerrar?.();
      invocador?.focus?.();
    },
    abierta: () => fondo.isConnected,
  };
  fondo.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); api.cerrar(); return; }
    if (e.key !== "Tab") return;
    const ls = focables(el);
    if (!ls.length) return;
    const primero = ls[0], ultimo = ls[ls.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });
  fondo.addEventListener("click", (e) => { if (e.target === fondo) api.cerrar(); });
  return { el: fondo, api };
}

export function crearModalConfirmacion({ titulo, mensaje, textoAceptar = "Confirmar", textoCancelar = "Cancelar", onAceptar }) {
  const aceptar = crearBoton({ texto: textoAceptar, variante: "primary" });
  const cancelar = crearBoton({ texto: textoCancelar, variante: "ghost" });
  const p = document.createElement("p");
  p.textContent = mensaje;
  const modal = crearModal({ titulo, contenido: p, acciones: [cancelar.el, aceptar.el] });
  cancelar.el.addEventListener("click", modal.api.cerrar);
  aceptar.el.addEventListener("click", async () => {
    aceptar.api.loading(true);
    try { await onAceptar?.(); modal.api.cerrar(); }
    finally { aceptar.api.loading(false); }
  });
  return modal;
}

/* ───────────────────────────── Table ──────────────────────────────── */
export function crearTabla({ columnas, filas = [], responsive = false, caption = "", paginacion = 12 }) {
  const wrap = document.createElement("div");
  wrap.className = "tabla-envolvente";
  const api = {
    skeleton(n = 4) {
      wrap.innerHTML = "";
      const zona = document.createElement("div");
      zona.setAttribute("aria-hidden", "true");
      zona.style.display = "grid";
      zona.style.gap = "8px";
      zona.style.padding = "16px";
      for (let i = 0; i < n; i++) {
        const s = document.createElement("div");
        s.className = "esqueleto";
        s.style.height = "18px";
        zona.append(s);
      }
      const vivo = document.createElement("p");
      vivo.setAttribute("aria-live", "polite");
      vivo.style.position = "absolute";
      vivo.style.left = "-9999px";
      vivo.textContent = "Cargando datos…";
      wrap.append(zona, vivo);
    },
    vacio(titulo, detalle = "") {
      wrap.innerHTML = "";
      const e = document.createElement("div");
      e.className = "estado-vacio";
      e.setAttribute("role", "status");
      const h = document.createElement("p");
      h.className = "t-h4";
      h.textContent = titulo;
      e.append(h);
      if (detalle) { const d = document.createElement("p"); d.textContent = detalle; e.append(d); }
      wrap.append(e);
    },
    error(mensaje, onReintentar) {
      wrap.innerHTML = "";
      const e = document.createElement("div");
      e.className = "estado-error";
      e.setAttribute("role", "alert");
      const p = document.createElement("p");
      p.textContent = `✘ ${mensaje}`;
      e.append(p);
      if (onReintentar) {
        const b = crearBoton({ texto: "Reintentar", variante: "secondary", onClick: () => onReintentar() });
        e.append(b.el);
      }
      wrap.append(e);
    },
    orden: null,
    cargar(datos) {
      wrap.innerHTML = "";
      api.renderizar(datos);
    },
    renderizar(datos) {
      if (!datos.length) { api.vacio("Sin resultados", "Cuando haya elementos los verás aquí."); return; }
      const tabla = document.createElement("table");
      if (responsive) tabla.className = "tabla tabla--tarjetas";
      else tabla.className = "tabla";
      if (caption) { const c = document.createElement("caption"); c.textContent = caption; tabla.append(c); }
      const thead = document.createElement("thead");
      const htr = document.createElement("tr");
      for (const col of columnas) {
        const th = document.createElement("th");
        th.scope = "col";
        const b = document.createElement("button");
        b.className = "orden-btn";
        b.textContent = col.titulo + " ";
        const flecha = document.createElement("span");
        flecha.setAttribute("aria-hidden", "true");
        b.append(flecha);
        b.setAttribute("aria-label", `Ordenar por ${col.titulo}`);
        b.addEventListener("click", () => {
          const dir = api.orden?.clave === col.clave && api.orden?.dir === "asc" ? "desc" : "asc";
          api.orden = { clave: col.clave, dir };
          document.querySelectorAll("th").forEach((x) => x.removeAttribute("aria-sort"));
          th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
          flecha.textContent = dir === "asc" ? "↑" : "↓";
          const copia = [...datos].sort((a, b) => {
            const va = a[col.clave], vb = b[col.clave];
            const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "es", { numeric: true });
            return dir === "asc" ? cmp : -cmp;
          });
          tbodyT.innerHTML = "";
          for (const f of copia) tbodyT.append(creaFila(f));
        });
        th.append(b);
        htr.append(th);
      }
      thead.append(htr);
      const tbodyT = document.createElement("tbody");
      function creaFila(f) {
        const tr = document.createElement("tr");
        for (const col of columnas) {
          const td = document.createElement("td");
          if (col.numerica) td.className = "numerica";
          td.setAttribute("data-col", col.titulo);
          td.textContent = f[col.clave] ?? "";
          tr.append(td);
        }
        return tr;
      }
      for (const f of datos.slice(0, paginacion)) tbodyT.append(creaFila(f));
      tabla.append(thead, tbodyT);
      wrap.append(tabla);
    },
  };
  api.renderizar(filas);
  return { el: wrap, api };
}

/* ───────────────────────────── Toast ──────────────────────────────── */
let _zona = null;
function zona() {
  if (!_zona || !_zona.isConnected) {
    _zona = document.createElement("div");
    _zona.className = "toast-zona";
    _zona.setAttribute("role", "region");
    _zona.setAttribute("aria-label", "Notificaciones");
    document.body.append(_zona);
  }
  return _zona;
}

export function toast(mensaje, { tipo = "info", duracion = 5000, assertivo = false } = {}) {
  const t = document.createElement("div");
  t.className = `toast toast--${tipo}`;
  t.setAttribute("role", assertivo ? "alert" : "status");
  t.setAttribute("aria-live", assertivo ? "assertive" : "polite");
  const txt = document.createElement("span");
  txt.textContent = mensaje;
  const x = document.createElement("button");
  x.className = "toast__cerrar";
  x.type = "button";
  x.setAttribute("aria-label", "Cerrar aviso");
  x.textContent = "×";
  const api = { cerrar: () => t.remove() };
  x.addEventListener("click", api.cerrar);
  t.append(txt, x);
  zona().append(t);
  if (duracion) setTimeout(api.cerrar, duracion);
  return api;
}
