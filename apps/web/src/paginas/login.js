/** #/login — Entrada SPA GitHub-Total (wave w2): device flow nativo, sin
 * servidor. Muestra el user_code gigante, apunta a github.com/login/device y
 * sondea hasta aprobación. Estado siempre honesto (contrato §6). */

import { crearBoton, toast } from "../../../../diseno/export/componentes.js";
import { conectarGitHub, desconectar, CLIENT_ID } from "../lib/ghdevice.js";
import { REPO_OPERACION } from "../lib/canalgithub.js";
import { conBarra, h1 } from "../lib/shell.js";

function tarjeta(titulo, cuerpo) {
  const t = document.createElement("section");
  t.className = "app-filtros"; // estilo de panel sellado (C5, sin inline)
  const h = document.createElement("h2");
  h.className = "app-sub app-logros-sub";
  h.textContent = titulo;
  const p = document.createElement("p");
  p.className = "app-sub";
  p.textContent = cuerpo;
  t.append(h, p);
  return t;
}

export async function montar(el) {
  const caja = document.createElement("div");
  conBarra(el, "#/login", caja);

  const logueada = !!sessionStorage.getItem("bmae_gh_token");
  if (logueada) {
    caja.append(h1("Ya estás dentro", "Tu GitHub es tu sesión: el resto de la plataforma lo sabe (puente de claves B)."));
    const t = tarjeta("Sesión activa",
      "Los canales de operación (cola Call-Flow, pipeline, facturación) usan tu GitHub. Para salir o cambiar de cuenta, usa Desconectar.");
    const bOut = crearBoton({ texto: "Desconectar", variante: "secondary", onClick: () => {
      desconectar();
      toast("Sesión cerrada. La cola Call-Flow local sigue a salvo.", { tipo: "exito" });
      el.innerHTML = ""; montar(el);
    } });
    t.append(bOut.el);
    caja.append(t);
    return;
  }

  caja.append(h1("Entrar", "Tu GitHub es tu sesión: sin contraseñas en la plataforma y sin servidores propios (GitHub-Total)."));

  if (!CLIENT_ID) {
    const aviso = document.createElement("p");
    aviso.className = "app-sub";
    aviso.setAttribute("role", "note");
    aviso.textContent = "Login GitHub todavía no cableado en esta instancia: falta el gesto humano de crear la OAuth App (docs/deploy-github.md §5). Cola Call-Flow y «Exportar JSON» siguen disponibles sin entrar.";
    caja.append(aviso);
    return;
  }

  const t = tarjeta("Conectar GitHub (device flow)",
    "Sin contraseña y sin servidor propio: te damos un código, lo apruebas en GitHub y vuelves ya dentro. El token viaja contigo, no se guarda en ningún servidor nuestro.");
  const bConectar = crearBoton({ texto: "Conectar GitHub", variante: "primary", onClick: () => {
    bConectar.el.disabled = true;
    lanzar(bConectar);
  } });
  t.append(bConectar.el);
  caja.append(t);

  async function lanzar(btn) {
    const control = new AbortController();
    const abortar = () => control.abort();
    window.addEventListener("hashchange", abortar, { once: true });
    try {
      const info = await conectarGitHub({
        clientId: CLIENT_ID, repo: REPO_OPERACION, signal: control.signal,
        onCodigo: ({ userCode, verificationUri }) => mostrarCodigo(userCode, verificationUri),
      });
      window.removeEventListener("hashchange", abortar);
      toast(`✓ GitHub conectado como ${info.login}${info.operativo ? " · canal CRM operativo" : ""}.`, { tipo: "exito" });
      el.innerHTML = ""; montar(el);
    } catch (e) {
      window.removeEventListener("hashchange", abortar);
      toast(e?.message || "No se pudo conectar.", { tipo: "error", assertivo: true });
      btn.disabled = false;
    }
  }

  function mostrarCodigo(userCode, verificationUri) {
    const box = document.createElement("section");
    box.className = "app-filtros";
    const ley = document.createElement("p");
    ley.className = "app-sub";
    ley.textContent = "Entra este código en GitHub y aprueba la conexión:";
    const cod = document.createElement("code");
    cod.className = "app-h1";
    cod.setAttribute("role", "status");
    cod.textContent = userCode; // código GitHub del momento, no secreto
    const enlace = document.createElement("a");
    enlace.className = "btn btn--secondary";
    enlace.href = verificationUri;
    enlace.target = "_blank";
    enlace.rel = "noopener";
    enlace.textContent = "Abrir GitHub para aprobar";
    const esp = document.createElement("p");
    esp.className = "app-sub";
    esp.textContent = "Cuando lo apruebas, esta ventana continúa sola (sondeo respetando el ritmo de GitHub).";
    box.append(ley, cod, enlace, esp);
    caja.append(box);
  }
}
