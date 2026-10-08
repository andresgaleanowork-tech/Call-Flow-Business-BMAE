/** #/callflow — guiones comerciales v4.4.8 VERBATIM integrados (F3·w1/w3).
 * Guion + Actividad (cola local lib/cola.js) + Admin (lectura; edición=commit).
 * Guardián anti-PII heredado (F10/F11-N2) en el registro. */

import { jsonLocal } from "../lib/api.js";
import { crearBoton, toast } from "../../../../diseno/export/componentes.js";
import { encolar, leerCola, contarPendientes, fusionarEnTwenty } from "../lib/cola.js";
import { subirGitHub } from "../lib/canalgithub.js";
import { fecha } from "../lib/honesto.js";
import { conBarra, h1, panel } from "../lib/shell.js";

const GUIONES_DISPONIBLES = ["residencial", "pymes"];
const TITULO = { residencial: "Residencial", pymes: "PYME" };
const ICONO = { residencial: "🏠", pymes: "🏢" };

const RE_TELEFONO = /(\+?\d[\d\s]{7,}\d)/;
const RE_EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const RE_DOCUMENTO = /\b\d{7,8}[A-Z]\b/i;

export function guardianPII(texto) {
  if (RE_TELEFONO.test(texto)) return "Quita el teléfono de la nota (no sale del dispositivo con datos de contacto).";
  if (RE_EMAIL.test(texto)) return "Quita el email de la nota; va en la ficha, no aquí.";
  if (RE_DOCUMENTO.test(texto)) return "Quita el documento de identidad de la nota.";
  return null;
}

export async function montar(el) { return montarGuiones(el); }

/* ── portada: selector de guiones ───────────────────────────────────── */

export function pintarProspectoDesdeA1(caja) {
  let pr = null;
  try { pr = JSON.parse(sessionStorage.getItem("bmae.prospecto") || "null"); } catch { pr = null; }
  if (!pr || !pr.nombre) return;
  const p = document.createElement("p");
  p.className = "app-callout";
  p.setAttribute("role", "note");
  p.innerHTML = `<b>Guionando a:</b> ${pr.nombre} (${pr.ciudad}${pr.telefono ? " · ☎ " + pr.telefono : ""}) ·
    <a href="#/prospectos">cambiar prospecto</a> · <button class="btn btn--ghost btn--sm" id="pro-quitar">quitar</button>`;
  caja.append(p);
  p.querySelector("#pro-quitar")?.addEventListener("click", () => { sessionStorage.removeItem("bmae.prospecto"); p.remove(); });
}

export async function montarGuiones(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/callflow", caja);
  pintarProspectoDesdeA1(caja);
  caja.append(h1("Guiones comerciales", "¿Con qué segmento vas a llamar hoy?"));

  let resultados = { items: [] };
  try { resultados = await jsonLocal("datos/comercial/resultados.json"); } catch { /* vacío controlado */ }

  const guiones = [];
  for (const seg of GUIONES_DISPONIBLES) {
    try { guiones.push({ seg, doc: await jsonLocal(`datos/comercial/guiones/${seg}.json`) }); }
    catch { /* tarjeta propia de error abajo */ }
  }

  if (!guiones.length) {
    const e = document.createElement("div");
    e.className = "estado-error";
    e.setAttribute("role", "alert");
    e.textContent = "✘ No se pudieron leer los guiones versionados del repo.";
    caja.append(e);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "cf-cards";
  for (const { seg, doc } of guiones) {
    const card = document.createElement("article");
    card.className = "app-tarjeta-pedido";
    card.innerHTML = `<h3 class="cf-h3--azul">
      <span aria-hidden="true">${ICONO[seg] || "📞"} </span>Guion ${TITULO[seg] || seg}</h3>
      <p class="app-lbl app-lbl--mb10">${Object.keys(doc.nodos).length} nodos · ${Object.keys(doc.objeciones).length} objeciones · ${doc.fuente.split("(")[0].trim()}</p>`;
    const b = crearBoton({ texto: "Abrir guion", variante: "primary", tamano: "sm",
      onClick: () => abrirGuion(el, doc, seg, resultados.items) });
    card.append(b.el);
    grid.append(card);
  }
  caja.append(grid);

  // accesos a actividad / admin + onboarding
  const accesos = document.createElement("div");
  accesos.className = "app-acciones-form";
  const aAct = crearBoton({ texto: "📊 Mi actividad", variante: "secondary", onClick: () => { location.hash = "#/callflow/actividad"; } });
  const aAdm = crearBoton({ texto: "⚙ Admin (lectura)", variante: "ghost", onClick: () => { location.hash = "#/callflow/admin"; } });
  accesos.append(aAct.el, aAdm.el);
  caja.append(accesos);

  const pendientes = contarPendientes();
  if (pendientes) {
    const n = document.createElement("p");
    n.className = "app-nota";
    n.textContent = `${pendientes} gestión(es) en cola local: se enviarán al buzón del CRM (GitHub-total, docs/github-total.md).`;
    caja.append(n);
  }

  const onboarding = document.createElement("details");
  onboarding.className = "app-panel cf-detalles";
  onboarding.innerHTML = `<summary class="cf-summary">Cómo funciona (guía rápida)</summary>
    <ol class="cf-notas cf-ol-top">
      <li>Abre el guion de tu segmento y personaliza <b>nombre</b> y <b>ciudad</b>: las plantillas se rellenan solas.</li>
      <li>Lee las líneas hasta la marca <i>[PAUSA]</i> y <b>calla después de cada pregunta</b>: el que calla, escucha.</li>
      <li>Si hay objeción, abre el cajón de objeciones y sigue validación → desactiva → reencuadre.</li>
      <li>Al colgar, registra la gestión: resultado obligatorio; la nota no admite teléfono, email ni documento.</li>
      <li>Objetivo de la llamada: alta, foto de la factura o cita. Uno de los tres y la llamada ha ganado.</li>
    </ol>`;
  caja.append(onboarding);
}

/* ── vista de guion (árbol real) ────────────────────────────────────── */

function personalizar(texto, nombre, ciudad) {
  return String(texto)
    .replaceAll("[NOMBRE_CLIENTE]", nombre || "[NOMBRE_CLIENTE]")
    .replaceAll("[CIUDAD]", ciudad || "[CIUDAD]");
}

const lineas = (cont, items, p) => {
  for (const it of items) {
    if (it.mark) { const m = document.createElement("p"); m.className = "cf-marca-cue"; m.textContent = it.mark; cont.append(m); }
    else if (it.t) {
      const l = document.createElement("p"); l.className = "cf-linea"; l.textContent = personalizar(it.t, p.nombre, p.ciudad); cont.append(l);
      if (it.n) { const t = document.createElement("p"); t.className = "cf-tecnica"; t.textContent = it.n; cont.append(t); }
    } else if (it.ctx) {
      const c = document.createElement("div"); c.className = "cf-ctx"; c.textContent = personalizar(it.ctx, p.nombre, p.ciudad); cont.append(c);
    }
  }
};

function abrirGuion(el, doc, seg, resultados) {
  el.innerHTML = "";
  const caja = document.createElement("div");
  conBarra(el, "#/callflow", caja);

  const volver = crearBoton({ texto: "← Elegir otro guion", variante: "ghost",
    onClick: () => { el.innerHTML = ""; montarGuiones(el); } });
  caja.append(volver.el);
  caja.append(h1(`Guion ${TITULO[seg] || seg}`, `Verbatim ${doc.fuente}. ${doc.steps.length} pasos: ${doc.steps.join(" · ").toLowerCase()}.`));

  const datosLlamada = panel();
  datosLlamada.innerHTML = `<h3 class="cf-h3">📋 Datos de la llamada — personaliza el guion</h3>
    <div class="app-grid-auto">
      <div class="campo"><label class="campo__etiqueta" for="cf-nombre">Nombre del cliente</label>
      <input class="campo__control" id="cf-nombre" autocomplete="off"></div>
      <div class="campo"><label class="campo__etiqueta" for="cf-ciudad">Ciudad / zona</label>
      <input class="campo__control" id="cf-ciudad" autocomplete="off"></div>
    </div>`;
  caja.append(datosLlamada);

  const vista = panel();
  const faseTxt = document.createElement("h2");
  faseTxt.className = "cf-fase";
  const progreso = document.createElement("p");
  progreso.className = "app-progreso";
  const tituloTxt = document.createElement("p");
  tituloTxt.className = "cf-titulo-nodo";
  const bloque = document.createElement("div");
  const notasBox = document.createElement("div");
  const opcionesBox = document.createElement("div");
  opcionesBox.className = "app-acciones-form";
  vista.append(faseTxt, progreso, tituloTxt, bloque, notasBox, opcionesBox);
  caja.append(vista);

  let nodoId = "inicio";

  function pintar() {
    const n = doc.nodos[nodoId];
    const p = {
      nombre: document.getElementById("cf-nombre")?.value.trim() || "",
      ciudad: document.getElementById("cf-ciudad")?.value.trim() || "",
    };
    faseTxt.textContent = n.fase || "";
    const paso = typeof n.step === "number"
      ? `paso ${n.step + 1} de ${doc.steps.length}${doc.steps[n.step] ? ` · ${doc.steps[n.step]}` : ""}` : "";
    progreso.innerHTML = `●━━ <b>${paso}</b>${n.micro ? " · " + personalizar(n.micro, p.nombre, p.ciudad) : ""}`;
    tituloTxt.textContent = personalizar(n.titulo || "", p.nombre, p.ciudad);
    bloque.innerHTML = "";
    for (const trozo of n.script) lineas(bloque, trozo.say ? trozo.say : [trozo], p);
    notasBox.innerHTML = "";
    if (n.notas?.length) {
      const ul = document.createElement("ul");
      ul.className = "cf-notas";
      for (const nt of n.notas) { const li = document.createElement("li"); li.textContent = personalizar(nt, p.nombre, p.ciudad); ul.append(li); }
      notasBox.append(ul);
    }
    if (n.nat?.alt?.length) {
      const d = document.createElement("details");
      d.className = "cf-detalles";
      d.innerHTML = "<summary>Variantes naturales</summary>";
      const ul = document.createElement("ul");
      ul.className = "cf-notas";
      for (const a of n.nat.alt) { const li = document.createElement("li"); li.textContent = personalizar(a, p.nombre, p.ciudad); ul.append(li); }
      d.append(ul);
      notasBox.append(d);
    }
    opcionesBox.innerHTML = "";
    for (const o of n.opciones) {
      const b = crearBoton({
        texto: `${o.ico ? o.ico + " " : ""}${personalizar(o.label, p.nombre, p.ciudad)}`,
        variante: o.cls === "warn" ? "ghost" : "secondary",
        onClick: () => {
          if (o.next && doc.nodos[o.next]) { nodoId = o.next; pintar(); window.scrollTo?.(0, 0); }
          else toast("Este camino no existe en el guion extraído.", { tipo: "error" });
        },
      });
      if (o.sub) b.el.title = personalizar(o.sub, p.nombre, p.ciudad);
      opcionesBox.append(b.el);
    }
  }
  datosLlamada.addEventListener("input", pintar);
  pintar();

  caja.append(panelObjeciones(doc));
  caja.append(panelRegistro(seg, resultados));
}

function panelObjeciones(doc) {
  const p = panel();
  const h = document.createElement("h3");
  h.className = "cf-h3";
  h.textContent = `Objeciones (${Object.keys(doc.objeciones).length})`;
  const sel = document.createElement("select");
  sel.className = "app-select";
  sel.setAttribute("aria-label", "Elegir objeción");
  sel.append(new Option("El cliente dice…", ""));
  for (const [k, o] of Object.entries(doc.objeciones)) sel.append(new Option(o.nombre || k, k));
  const resp = document.createElement("div");
  sel.addEventListener("change", () => {
    resp.innerHTML = "";
    const o = doc.objeciones[sel.value];
    if (!o) return;
    const p2 = {
      nombre: document.getElementById("cf-nombre")?.value.trim() || "",
      ciudad: document.getElementById("cf-ciudad")?.value.trim() || "",
    };
    for (const fase of ["validacion", "desactiva", "reencuadre"]) {
      if (!o[fase]?.length) continue;
      const t = document.createElement("p");
      t.className = "cf-obj-fase";
      t.textContent = fase;
      resp.append(t);
      lineas(resp, o[fase], p2);
    }
  });
  p.append(h, sel, resp);
  return p;
}

function panelRegistro(seg, resultados) {
  const reg = panel();
  reg.innerHTML = `<h3 class="cf-h3">Registrar la gestión</h3>`;
  const selRes = document.createElement("select");
  selRes.className = "app-select";
  selRes.setAttribute("aria-label", "Resultado de la llamada");
  selRes.append(new Option("Resultado…", ""), ...resultados.map((r) => new Option(r, r)));
  const nota = document.createElement("textarea");
  nota.className = "cf-area";
  nota.setAttribute("aria-label", "Nota de la gestión (sin datos de contacto)");
  nota.placeholder = "Nota ≤140 caracteres. Sin teléfono, email ni documento: eso va en la ficha.";
  nota.maxLength = 140;
  const avisoPII = document.createElement("p");
  avisoPII.className = "app-lbl cf-aviso";
  avisoPII.setAttribute("aria-live", "polite");
  /** Aviso accesible: el color nunca va solo — icono + texto, y clase semántica. */
  const avisar = (txt, ok) => {
    avisoPII.textContent = txt;
    avisoPII.classList.toggle("cf-aviso--error", !ok);
    avisoPII.classList.toggle("cf-aviso--ok", ok);
  };
  const registrar = crearBoton({
    texto: "Registrar gestión",
    variante: "primary",
    onClick: () => {
      if (!selRes.value) { toast("Dime el resultado de la llamada para registrarla.", { tipo: "error", assertivo: true }); selRes.focus(); return; }
      const mal = guardianPII(nota.value);
      if (mal) { avisar(`✘ ${mal}`, false); nota.focus(); return; }
      encolar({ segmento: seg, resultado: selRes.value, nota: nota.value.trim() });
      toast("Gestión registrada en cola local; llegará al buzón del CRM con el canal GitHub-total.", { tipo: "exito" });
      nota.value = ""; selRes.value = "";
      avisar(`✓ En cola (máx. 200). Pendientes: ${contarPendientes()}.`, true);
    },
  });
  const cajaBtn = document.createElement("div");
  cajaBtn.className = "cf-btn-top";
  cajaBtn.append(registrar.el);
  reg.append(selRes, nota, avisoPII, cajaBtn);
  return reg;
}

/* ── #/callflow/actividad — semana 3 (datos REALES de la cola local) ── */

export async function montarActividad(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/callflow/actividad", caja);
  caja.append(h1("Mi actividad", "Registro local de esta pestaña (sesión). Llega al buzón del CRM con el canal GitHub-total."));

  const cola = leerCola();
  if (!cola.length) {
    const v = document.createElement("div");
    v.className = "estado-vacio";
    v.setAttribute("role", "status");
    const h = document.createElement("p");
    h.className = "cf-h3 cf-h3--16";
    h.textContent = "Aún no hay gestiones registradas";
    const d = document.createElement("p");
    d.className = "cf-ol-top";
    d.textContent = "Cuando cuelgues la primera llamada y la registres, aquí verás tu embudo del día.";
    const ir = crearBoton({ texto: "Abrir guiones", variante: "primary", onClick: () => { location.hash = "#/callflow"; } });
    v.append(h, d, ir.el);
    caja.append(v);
    return;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const deHoy = cola.filter((g) => String(g.ts).startsWith(hoy)).length;
  const porResultado = {};
  for (const g of cola) porResultado[g.resultado] = (porResultado[g.resultado] || 0) + 1;

  const kpis = document.createElement("div");
  kpis.className = "app-kpis";
  for (const [t, v] of [["Gestiones hoy", deHoy], ["En cola (sesión)", cola.length], ["Resultados distintos", Object.keys(porResultado).length]]) {
    const k = document.createElement("article");
    k.className = "kpi";
    k.innerHTML = `<h3>${t}</h3><p class="kpi__valor datos">${v}</p>`;
    kpis.append(k);
  }
  caja.append(kpis);

  const embudo = panel();
  embudo.append(h1("Embudo por resultado", "Basado en tu cola local de esta sesión."));
  const barra = document.createElement("div");
  barra.className = "cf-funnel";
  Object.entries(porResultado).sort((a, b) => b[1] - a[1]).forEach(([r, n], i) => {
    const s = document.createElement("span");
    s.className = `cf-seg--${i % 6}`;
    s.style.width = `${(n / cola.length) * 100}%`; // ancho proporcional: dato, no decoración
    s.textContent = n > 1 || cola.length <= 6 ? `${r} ${n}` : "";
    barra.append(s);
  });
  const ley = document.createElement("p");
  ley.className = "app-lbl cf-leyenda";
  ley.textContent = Object.entries(porResultado).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r}: ${n}`).join(" · ");

  // Canal GitHub-total (opción B, docs/github-total.md §4): sube al buzón del
  // CRM; sin token/repo informa honestamente y ofrece export local (JSON).
  const bSubir = crearBoton({
    texto: `⬆ Enviar ${cola.length} al CRM`,
    variante: "secondary",
    onClick: async () => {
      bSubir.el.disabled = true;
      try {
        const r = await fusionarEnTwenty((lote) => subirGitHub(lote));
        toast(`✓ ${r.enviadas} gestiones en el buzón del CRM.`, { tipo: "exito" });
        el.innerHTML = "";
        await montarActividad(el);
      } catch (e) {
        toast(e?.message || "No se pudo subir; tu cola sigue a salvo.", { tipo: "error", assertivo: true });
        bSubir.el.disabled = false;
      }
    },
  });
  // Export honesto (ruta manual vigente hasta F4G·w2 device-flow):
  // descarga la cola como JSONL listo para pegar en el buzón con `gh`.
  const bExport = crearBoton({
    texto: "Exportar JSON",
    variante: "ghost",
    onClick: () => {
      const filas = cola.map((g, i) => JSON.stringify({
        v: 1, canal: "callflow", segmento: g.segmento ?? "", nodo: g.nodo ?? "",
        resultado: g.resultado, nota: g.nota ?? "", ts: g.ts,
        pos: i, huella: "manual", // la huella real la calcula el ingest si viene de canal
      }));
      const blob = new Blob([filas.join("\n")], { type: "application/jsonlines" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cola-callflow-${new Date().toISOString().slice(0, 10)}.jsonl`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Descargado. Pégalo como comentario del buzón (issue fijado) o usa `gh issue comment`.", { tipo: "info" });
    },
  });
  const fila = document.createElement("div");
  fila.className = "app-acciones-form app-ml-auto";
  fila.append(bSubir.el, bExport.el);
  embudo.append(barra, ley, fila);
  caja.append(embudo);

  const reg = panel();
  reg.append(h1("Registro", "La más reciente primero."));
  const ul = document.createElement("ul");
  ul.className = "cf-notas";
  for (const g of [...cola].reverse().slice(0, 20)) {
    const li = document.createElement("li");
    li.textContent = `${fecha(g.ts)} · ${g.segmento || "—"} · ${g.resultado}${g.nota ? ` — ${g.nota}` : ""}`;
    ul.append(li);
  }
  reg.append(ul);
  caja.append(reg);
}

/* ── #/callflow/admin — lectura pura (edición = commit, GitHub-First) ─ */

export async function montarAdmin(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/callflow/admin", caja);
  caja.append(h1("Admin comercial", "Lectura pura. Editar catálogo o guiones = commit al repo (GitHub-First §2)."));

  const p = panel();
  let cat = null;
  try { cat = await jsonLocal("datos/comercial/catalogo.json"); } catch { /* abajo */ }
  if (!cat) {
    const e = document.createElement("div");
    e.className = "estado-error";
    e.setAttribute("role", "alert");
    e.textContent = "✘ Catálogo no legible.";
    caja.append(e);
    return;
  }
  const activas = cat.items.filter((i) => i.activo).length;
  p.innerHTML = `<p class="cf-h3"><b>Catálogo</b> v${cat.v} · actualizado ${cat.upd} · ${activas}/${cat.items.length} ofertas activas</p>`;
  const ul = document.createElement("ul");
  ul.className = "cf-notas";
  for (const i of cat.items) {
    const li = document.createElement("li");
    li.innerHTML = `${i.activo ? "🟢" : "⚪"} <b>${i.nombre}</b> — ${i.area} <span class="app-lbl">(${i.id})</span>`;
    ul.append(li);
  }
  p.append(ul);

  const p2 = panel();
  const h2 = document.createElement("h3");
  h2.className = "cf-h3";
  h2.textContent = "Guiones versionados";
  const ul2 = document.createElement("ul");
  ul2.className = "cf-notas";
  for (const seg of GUIONES_DISPONIBLES) {
    try {
      const g = await jsonLocal(`datos/comercial/guiones/${seg}.json`);
      const li = document.createElement("li");
      li.innerHTML = `📞 <b>${TITULO[seg] || seg}</b> — ${Object.keys(g.nodos).length} nodos · ${Object.keys(g.objeciones).length} objeciones · <span class="app-lbl">${g.fuente}</span>`;
      ul2.append(li);
    } catch {
      const li = document.createElement("li");
      li.textContent = `✘ ${seg}.json no legible`;
      ul2.append(li);
    }
  }
  p2.append(h2, ul2);
  const nota = document.createElement("p");
  nota.className = "app-nota";
  nota.textContent = "Para cambiar un texto: edita el JSON en datos/comercial/, revisión humana comercial, y el sello (contrato limpieza n.º 8) certifica la coherencia.";
  p2.append(nota);
  caja.append(p, p2);
}