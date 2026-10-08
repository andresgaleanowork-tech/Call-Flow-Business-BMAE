/**
 * main.js — Shell SPA F3 (Pages, raíz). Router por hash (la URL es el estado,
 * C11 §2.2): "#/…" monta la página en #app; cualquier otro hash de la portada
 * ("#analizar"…) no activa la app. Guard de sesión en rutas privadas (B).
 */

import { tieneSesion } from "./lib/sesion.js";

const RUTAS_PUBLICAS = new Set(["#/comparador", "#/captacion", "#/alta", "#/login", "#/cliente"]);
const PRIVADO_REDIRECT = "#/login"; // GitHub-Total w2: login nativo device-flow (frontend-auth Frappe queda inerte)

let paginas = null; // carga perezosa
let _resoluciones = 0; // token de la resolución vigente (anti carreras doble-montaje)

/** Registro extensible (plugins/tests): ruta → montar(el). Pública por diseño. */
export function registrarRuta(ruta, montarFn) {
  paginas = { ...(paginas || {}), [ruta]: montarFn };
}

async function cargarPaginas() {
  if (paginas?.__auto) return paginas;
  paginas = { ...(paginas || {}), __auto: true,
    "#/comparador": (await import("./paginas/comparador.js")).montar,
    "#/login": (await import("./paginas/login.js")).montar,
    "#/panel": (await import("./paginas/dashboard.js")).montar,
    "#/captacion": (await import("./paginas/captacion.js")).montar,
    "#/alta": (await import("./paginas/alta.js")).montar,
    "#/solar": (await import("./paginas/solar.js")).montar,
    "#/facturas": (await import("./paginas/facturas.js")).montar,
    "#/albaranes": (await import("./paginas/albaranes.js")).montar,
    "#/incidencias": (await import("./paginas/incidencias.js")).montar,
    "#/documentos": (await import("./paginas/documentos.js")).montar,
    "#/suministro": (await import("./paginas/suministro.js")).montar,
    "#/gestor": (await import("./paginas/gestor.js")).montar,
    "#/callflow": (await import("./paginas/callflow.js")).montarGuiones,
    "#/callflow/actividad": (await import("./paginas/callflow.js")).montarActividad,
    "#/callflow/admin": (await import("./paginas/callflow.js")).montarAdmin,
    "#/cliente": (await import("./paginas/cliente.js")).montar,
    "#/prospectos": (await import("./paginas/prospectos.js")).montar,
  };
  return paginas;
}

export function rutaActual() {
  const h = location.hash || "#/";
  return h.split("?")[0];
}

export async function resolver() {
  const landing = document.getElementById("vista-landing");
  const app = document.getElementById("app");
  const ruta = rutaActual();
  const mapa = await cargarPaginas();
  // #/cliente/<token> → clave fija "#/cliente" (pública; el token es la llave)
  const clave = ruta.startsWith("#/cliente/") ? "#/cliente" : ruta;
  const montar = mapa[clave];

  if (!montar) {
    if (app) { app.hidden = true; app.innerHTML = ""; }
    if (landing) landing.hidden = false;
    return landing;
  }

  if (!RUTAS_PUBLICAS.has(clave) && !tieneSesion()) {
    // coherencia visual: vuelve la landing antes de saltar al login sellado
    if (app) { app.hidden = true; app.innerHTML = ""; }
    if (landing) landing.hidden = false;
    location.assign(PRIVADO_REDIRECT);
    return null;
  }

  if (landing) landing.hidden = true;
  if (app) {
    app.hidden = false;
    const mi = ++_resoluciones; // solo el último resolver commitea (anti doble-montaje)
    const tmp = document.createElement("div");
    try {
      await montar(tmp);
    } catch (e) {
      if (mi !== _resoluciones) return null; // un resolver posterior ya manda
      app.innerHTML = "";
      const err = document.createElement("div");
      err.className = "estado-error"; // estilos en app.css (.estado-error)
      err.setAttribute("role", "alert");
      err.textContent = `✘ No se pudo montar «${ruta}»: ${e?.message || e}. Vuelve al inicio y reintenta.`;
      app.append(err);
      return app;
    }
    if (mi !== _resoluciones) return null; // stale: descarta su DOM por completo
    app.innerHTML = "";
    app.appendChild(tmp);
    return app;
  }
  return null;
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => { resolver(); });
  if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", resolver);
  else resolver();
}
