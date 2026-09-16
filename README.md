# Call Flow Business · B&M Asesores Energéticos

> Estado: **v2.7.2** (16-09-2026 · hotfix campo) · ver el [registro de cambios](CHANGELOG.md)

Sistema de diálogo para el equipo comercial: guion NEURO de Iberdrola con árbol
de decisión en vivo, objeciones, roleplay, onboarding completo, CRM local de
clientes, marcador de llamadas, examen final y certificado. Todo en **un
archivo HTML por guion**, que funciona **sin conexión** y sincroniza el
progreso por comercial (GitHub, cifrado por burbujas por-usuario).

## Estructura

- `index.html` — portada/gate (entra con **tu ID Iberdrola**; la primera vez te pide nombre).
- `pymes.html` — guion NEURO **PYMES** + tutorial.
- `residencial.html` — guion NEURO **Residencial** + tutorial.
- `tutorial.html` — hub para elegir tutorial.
- `admin.html` — panel del responsable (equipo, actividad, llamadas, ⏱ medias, 🩺 salud, token).
- `instalar.html` — cómo instalarla como app en el móvil (iPhone/Android).
- `version.json`, `sw.js`, `manifest.webmanifest` — versionado y PWA.
- `tests/` — baterías de calidad (ver `tests/README.md`).

## Lo que incluye (v2.5–v2.7)

- ⏱ **Cronómetro de llamada**: al colgar, la llamada se registra sola y con su duración.
- 📞 **Marcador diario** y 🏅 insignias, 📇 **CRM local** (notas por cliente), 🖨 ficha de llamada imprimible.
- 📨 **Seguimiento mail/WhatsApp** personalizado con los datos de la llamada.
- 📝 **Nota CRM** dentro del modo 🎯 Foco (sin salir de la conversación).
- 🎓 **Examen final cronometrado** (10 preguntas, 8 min, 8/10) + 📜 **certificado imprimible**.
- 🔔 **Aviso de nueva versión** automático (lee `version.json` del sitio oficial).
- 🩺 **Salud del equipo en el panel admin**: errores JS captados del dispositivo de cada comercial + duración media de la semana.

## Uso

Cada archivo es autocontenido: se guarda en el escritorio y se abre con doble
clic, o se sirve por HTTPS (GitHub Pages) y se instala como app.

- **En PC**: programa de Windows oficial (`WINDOWS/Call Flow Business.exe`) o la web.
- **En Android**: app oficial (APK, `ANDROID/`) o instalación PWA desde Chrome.
- **En iPhone**: Safari → Compartir → «Añadir a pantalla de inicio» (guía: `instalar.html`).

## URLs tras desplegar

- Menú: `https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/`
- PYMES: `https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/pymes.html`
- Residencial: `…/residencial.html` · Tutorial: `…/tutorial.html`
- Panel admin: `…/admin.html` · Instalar en móvil: `…/instalar.html`

## Soporte

✉️ **canalpymes@bmae.es** — peticiones de alta, soporte y sugerencias (el alta
la realiza el responsable; cada empleado entra solo con su ID Iberdrola).

## Calidad

Baterías automáticas por ruta: **192 comprobaciones** (QA + core, jsdom) +
**58** (humo residencial) · **0 errores JS** de carga. Regeneración editorial:
`cd WEB && node ../_dev/editorial/build.js` (golden hash incluido en la QA).

Herramienta interna · Uso exclusivo de *B&M Asesores Energéticos* · © 2026
