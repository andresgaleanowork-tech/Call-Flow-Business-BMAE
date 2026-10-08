/**
 * shell.js — marco visual del área privada (sidebar) y cabecera pública.
 * B1: el menú se filtra por rol REAL (permiso del repo de operación):
 * roles vacíos → sin filtrar (fingir gatekeeping con datos vacíos es peor).
 */

import { roles } from "./sesion.js";

const ITEMS = [
  ["#/panel", "Panel", []],
  ["#/suministro", "Suministros", ["direccion", "gestor"]],
  ["#/solar", "Solar", ["direccion", "gestor"]],
  ["#/facturas", "Facturas", ["direccion", "gestor"]],
  ["#/albaranes", "Albaranes", ["direccion", "gestor"]],
  ["#/comparador", "Comparador", []],
  ["#/gestor", "Pipeline", ["direccion", "gestor"]],
  ["#/incidencias", "Incidencias", ["direccion", "gestor"]],
  ["#/documentos", "Documentos", ["direccion", "gestor"]],
  ["#/prospectos", "Prospectos", ["direccion", "gestor", "comercial"]],
  ["#/callflow", "Guiones", ["direccion", "gestor", "comercial"]],
];

/** ITEMS filtrados por rol: [] (rol sin metadatos) = visible siempre. */
export function itemsPara(rolesLista) {
  const r = new Set(rolesLista || []);
  return ITEMS.filter(([, , necesario]) =>
    !necesario.length || !r.size || necesario.some((n) => r.has(n)));
}

export function conBarra(el, rutaActual, contenido) {
  const shell = document.createElement("div");
  shell.className = "app-shell";
  const side = document.createElement("nav");
  side.className = "app-side";
  side.setAttribute("aria-label", "navegación del panel");
  const logo = document.createElement("a");
  logo.className = "app-logo";
  logo.href = "#/";
  logo.innerHTML = '<img src="diseno/marca/logo-bm.png" alt="BMAE Energía" width="72" height="22">';
  side.append(logo);
  for (const [ruta, nombre] of itemsPara(roles())) {
    const a = document.createElement("a");
    a.href = ruta;
    a.textContent = nombre;
    if (ruta === rutaActual) a.setAttribute("aria-current", "page");
    side.append(a);
  }
  const main = document.createElement("div");
  main.className = "app-main";
  main.append(contenido);
  shell.append(side, main);
  el.append(shell);
  return main;
}

export function cabeceraPublica() {
  const h = document.createElement("header");
  h.className = "app-cab-publica";
  h.innerHTML = `<a class="app-logo app-logo--plano" href="#/">
    <img src="diseno/marca/logo-bm.png" alt="BMAE Energía" width="72" height="22">
    <a class="btn btn--ghost btn--sm app-ml-auto" href="#/login">Entrar</a>`;
  return h;
}

export function h1(titulo, subtitulo = null) {
  const caja = document.createElement("div");
  const h = document.createElement("h1");
  h.className = "app-h1";
  h.textContent = titulo;
  caja.append(h);
  if (subtitulo) {
    const p = document.createElement("p");
    p.className = "app-sub";
    p.textContent = subtitulo;
    caja.append(p);
  }
  return caja;
}

export function panel() {
  const p = document.createElement("section");
  p.className = "app-panel";
  return p;
}
