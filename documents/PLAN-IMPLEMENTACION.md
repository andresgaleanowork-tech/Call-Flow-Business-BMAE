# 🗺️ Plan de implementación · Call Flow Business
*Roadmap de las 10 mejoras propuestas · v0 → ejecución por fases semanales · 2026-09-14*

## Principios innegociables (test de cada check-in)
1. **Offline inviolable**: guion/tutorial/KPIs/progreso jamás piden red; solo los envíos esperan cobertura.
2. **Archivos autocontenidos**: las 4 web siguen siendo HTML únicos; exe y APK se fabrican con un script.
3. **Tests siempre verdes**: 45 (PYMES) + 47 (Residencial) + cada mejora añade sus checks ANTES de aplicarla.
4. **WEB/ es la única fuente** → build.sh generan apps/windows/ y apps/android/ → git push publica Pages.
5. **Líneas rojas del guion** (sin € con cifra, sin fechas prometidas, sin jerga) gobiernan también el texto nuevo.
6. Versionado: **v1.1, v1.2…** visible dentro de cada app + CHANGELOG.md; `versionCode` del APK sube +1 por release.

---

## 📀 FASE A — Cerrar el ciclo del feedback (semana 1) · v1.1 — ✅ ENTREGADO (14-09-2026)
*Objetivo: que lo que el equipo ve mal le llegue a Josaida/Andrés en <30 s y que DPNDs la herramienta se defienda sola en llamada.*

| Item | Qué se hace | Dependencias | Esfuerzo |
|---|---|---|---|
| v2.7.4 | 16-09-2026 | Quicknote: botones estilados fuera del hub + ✎ reforzado (foco/validación/refresco CRM) + redundancia reaparición Foco | 196/196 + 58/58 |
| v2.7.5 | 16-09-2026 | cfcbCss: reglas de pantalla atrapadas en @media print desde v2.7 → nota rápida sin estilos (captura usuario). Reestructurado + tests Q7 estructurales | 200/200 + 58/58 |
| v2.7.6 | 16-09-2026 | cfbCss de <body> a <head> (visores estrictos) + estilo crítico inline + qnSync | 203/203 + 58/58 |
| v2.7.7 | 16-09-2026 | Portada de marca (hero Iberdrola×B&M, PNGs servidos) + offline/modo local fuera del relato y de la puerta + dedupe puerta ID ×4→×1 | 204/204 + 58/58 |
| v2.8.0 | 16-09-2026 | Las 10 mejoras: mini-CRM+voz+buscador+repaso espaciado+meta admin+métricas práctica+fin modo local+CSP p1+batería visual+deploy doc | 211/211 + 58/58 + 13/13 |
| A1 · **Notificador de versión** (mejora 3) | `version.json` en la raíz del repo ({"version":"1.1"}); al abrir, fetch SOLO si hay red (timeout 1,5 s, fallo→silencio); banner discreto «hay actualización nueva» con enlace. | Repo en Pages ✔ | ~1,5 h |
| A2 · **Ficha de llamada exportable** (mejora 5) | Botón en CIERRE «🖨️ Ficha imprimible»: vista print-friendly (config/yield de variables) → `window.print()` (guardar-PDF en el móvil) + descarga .txt (ya existe contarlos pa'l informe; se formaliza). | — | ~1,5 h |
| A3 · **Feedback in-app** (mejora 1) | Botón «✍️ Proponer mejora» en cabecera del guion y de cada objeción: copia al portapapeles la ficha pre-rellenada (nodo ID auto + frase actual) y abre `mailto:` a Josaida con plantilla. | — | ~2,5 h |

**Entregables:** WEB v1.1 + EXE/APK recompilados + git push + email corto al equipo («novedades v1.1»).
**Aceptación:** en modo avión no hay rastro del notificador; la ficha mailto sale con su nodo relleno; print genera PDF 1-2 páginas; 47+3×n checks verdes.
**Riesgos/rollback:** cada item protegido por un flag `FEATURE.***` desactivable sin tocar el resto; rollback = archivo anterior del git.

## 📦 FASE B — Instalación y disciplina de release (semana 2–3) · v1.2
| Item | Qué se hace | Esfuerzo |
|---|---|---|
| ✅ B1 · **Badge + CHANGELOG** (mejora 10) — ENTREGADO en v1.1 | Etiqueta «Call Flow Business · v1.1 · guion 15/09» en el pie de los 4 HTML; `CHANGELOG.md` público en apps/web/. | ~45 min |
| ⏩ B2 · **PWA instalable** (mejora 2) — núcleo entregado en v1.1 (manifest+sw+meta); falta el humo Lighthouse | `manifest.webmanifest` + `sw.js` (cache-first de los 4 HTML), meta theme-color y «Añadir a pantalla de inicio». NO sustituye al APK: lo complementa y da app-PC. Tests de humo: toda la suite funciona servida por el SW en modo avión. | ~3,5 h |
| B3 · **Firma del .exe** (mejora 10, parte) | Park — requiere decidir compra de certificado (~100–300 €/año); mientras: doc de SmartScreen ida vuelta ya existente. | decisión |
| B4 · **Capturas de humo visuales** (mejora 10, parte) | Script Playwright/puppeteer headless en _dev: abre las 4 web y guarda PNGs de referencia; compara siguiente release (salvapantallas anti-regresión visual). | ~2 h |

**Aceptación:** lighthouse PWA = instalable + offline; badge visible en los 4 HTML; changelog al día; capturas base guardadas en `_dev/capturas/`.

## 📊 FASE C — Datos y accesibilidad (semana 3–4) · v1.3
| Item | Qué se hace | Esfuerzo |
|---|---|---|
| ✅ C1 · **Métrica local agregada** (mejora 6) — ENTREGADO en v1.1 («Mi semana», hub 📊) | Contadores por nodo/objeción en localStorage (`bm_stats_*`, acumulativos, sin hora ni identidad) + pantalla «Mi semana» con exportar-copia-pega para el grupo (voluntario, con texto claro de qué se comparte). | ~2,5 h |
| ✅ C2 · **Progreso entre dispositivos (QR)** (mejora 7) — ENTREGADO en v1.1 (export QR + copie/pege código; cámara queda para v1.2) | «↔ exportar a otro dispositivo»: JSON gzip→QR mostrado en pantalla; «📷 importar»: lee con cámara (jsQR inline). Cero red, cero cuentas. | ~3 h |
| ✅ C3 · **Accesibilidad** (mejora 9) — ENTREGADO en v1.1 (◐ contraste · 🔤 letra · ficha print) | Toggle alto contraste + tamaño letra (persistente); revisión tabindex/aria del guion; versión print-friendly del guion same basics as C. | ~2 h |

**Aceptación:** en modo avión funcionan las tres; export métrica describe EXACTAMENTE qué se comparte (nada de permisos implícitos); WCAG básico AA en contraste del guion.

## 🎮 FASE D — Motivación y base editorial (semana 5–6) · v2.0
| Item | Qué se hace | Esfuerzo |
|---|---|---|
| ✅ D1 · **Gamificación** (mejora 8) — ENTREGADO en v1.1 (4 insignias + meta de roleplay) | Insignias por hitos de práctica (quiz 10/10, 3 roleplays/sem, tutorial 100%) + meta de Josaida opcional visible. Discreto, editorial, sin sonidos. | ~3 h |
| ✅ D2 · **Fuente editorial única** (mejora 4) — ENTREGADO en **v2.0.0** | Extraer textos PYMES al estilo `_dev/res` de residencial: `SEGMENTS`/árbol/objeciones en ficheros editables → ambos HTML se GENERAN. Hash golden: la salida después del refactor es byte-idéntica a la actual salvo whitespace. Tras esto, las correcciones semanales se hacen editando texto, nunca HTML. | 1,5 jornadas |

**Aceptación D2 (estricto):** build regenera los 4 HTML y las 2 baterías (45+47) pasan sin un solo cambio operativo; diff de texto = vacío.

---

## 🔁 Cadencia de release (cada viernes tras la revisión de fichas)
1. Andrés aplica correcciones aprobadas por Josaida (fichas del equipo).
2. `cd apps/web && npm test` → verde; `build.sh` Windows + Android; hash/sha a READMEs.
3. `git add -A && git commit -m "v1.x: …" && git push`.
4. Reparto: exe/apk nuevos → Teams; notificador de versión (FASE A) avisa solo.

## 📋 Riesgo global y mitigación
- **Rompimiento silencioso de la herramienta en producción** → tests + flag por feature + rollback por git (criterio: release anterior instalable en <10 min).
- **Privacidad (métricas)** → todo local, anónimo, bilateral, con texto de qué se comparte; revisión legal interna opcional.
- **Scope creep** → cada fase cierra con entrega y email; lo no soltado NO se anuncia al equipo.

*Aprobado por: —·— (firmar)*

## Registro de ejecución
**v1.1 (14-09-2026):** A1 ✅ · A2 ✅ · A3 ✅ · B1 ✅ · B2 núcleo ✅ · C1 ✅ · C2 ✅ (importa por código; cámara → v1.2) · C3 ✅ · D1 ✅.
Tests: 60 QA + 53 humo, 0 errores JS. Web y EXE v1.1 entregados; **APK v1.1 ENTREGADO** en el reintento (zips directos de componentes: versionCode 2 · versionName 1.1 · 607 KB · se actualiza encima sin pérdida).
- **16-09 · v2.4 «LÓGICA» ENTREGADA** — cada área con un único dueño: «Mi semana»→«Mi Cuenta» (+🚪 Cerrar sesión), sync fuera del hub (vive en admin), admin EDITA el token con verificación en vivo, aviso legal con ✕ persistente (bm_), retirada TOTAL del QR (−27 % KB) y de la cámara de la APK. EXE + firmado DEMO, APK v18. **168/168 + 58/58 · 0 errores JS**.
- **16-09 · v2.3.2 «SILENCIO» ENTREGADA** — avisos de la caza cerrados: EXE con MessageBox nativa ante fallos (CAZA#A1), sw cae a caché ante 404/500 (CAZA#A2); A3 (keystore) riesgo aceptado documentado; A4 cosméticos. EXE + firmado DEMO, APK v17. **176/176 + 58/58 · 0 errores JS**.
- **16-09 · v2.3.1 «ESCOBA» ENTREGADA** — caza de bugs: CI env vacío (CAZA#1), racha en UTC (CAZA#2), apóstrofo en CRM (CAZA#3), ✕ del aviso sin memoria (CAZA#4), version.json sin sanear (CAZA#5) + test decorativo de la batería reparado (CAZA#7). EXE + firmado DEMO, APK v16. **174/174 + 58/58 · 0 errores JS**.
- **15-09 · v2.3 «FÁBRICA» ENTREGADA** — GitHub Actions CI (tests→EXE→firma-por-secretos→APK→Artifacts), auto-aviso EXE/APK vía CFB_UPDATE_URL (web/mailto/tel salen de la app; CfbClient nombrada), registro de errores local bm_errores (tope 20, va en la ficha de soporte). EXE + firmado DEMO, APK v15. **167/167 + 58/58 · 0 errores JS**.
- **15-09 · v2.2 «MEMORIA» ENTREGADA** — 📇 mini-CRM por cliente 100 % local (cli_: ni sync/QR/panel; purga +180 días; 80×20; borrado por nota/ficha/todo; memo RGPD `docs/RGPD-MINI.md`) + 🔥 racha e insignias 5/10/20. EXE + firmado DEMO, APK v14. **155/155 + 58/58 · 0 errores JS**.
- **15-09 · v2.1 «MANDO» ENTREGADA (Frente 1: 1–4)** — sparkline SVG 28 días por comercial (sin librerías), delta ▲/▼ vs semana anterior, CSV Excel (BOM+;), alertas salmón ≥3 días laborales sin 📞. EXE + firmado DEMO, APK v13. **145/145 + 58/58 · 0 errores JS**.
- **15-09 · v2.0.1 QR-CÁMARA (D3) ENTREGADA — TABLERO A CERO** — 📷 «Escanear QR con la cámara» en Entre dispositivos (jsQR 1.4.0 inline offline, Apache-2.0), importador unificado texto/cámara, Android: permiso CAMERA por demanda + WebChromeClient concede solo cuando la página la pide (bug d8 8.2.2 NPE esquivado con CfbChrome nombrada + javac --release). EXE + firmado DEMO, APK v12. **136/136 + 58/58 · 0 errores JS**.
- **15-09 · v2.0.0 FUENTE EDITORIAL ÚNICA (D2) ENTREGADA** — 20 bloques por guion a `tools/factory/contenido/`, plantillas + `build.js` (regeneración byte-idéntica, golden hash), check «D2» dentro de la batería (129/129 + 58/58), workflow «editar texto → build → tests → binarios». EXE + firmado DEMO, APK v11.
- **15-09 · v1.5.3 AUDITORÍA NIVEL-3 + B3 + B4 ENTREGADOS** — QR entre dispositivos YA lleva personalización real y KPIs (maleta vacía corregida), KPIs se precargan con el registro del día, «Proponer mejora» abre canalpymes@bmae.es, sumas por fecha a prueba de basura. **B3**: EXE firmado (DEMO autofirmado RSA-3072 + sello RFC-3161 DigiCert, verificado) + receta para certificado real en `docs/B3-FIRMA-EXE.md`. **B4**: 12 capturas reales (desktop/móvil) en `docs/capturas/` + script regenerador. EXE/APK v10. **128/128 + 58/58 · 0 errores JS**.
- **15-09 · v1.5.2 AUDITORÍA NIVEL-2 (L2) ENTREGADA** — 🛡️ importación QR/código ahora saneada en profundidad (cierra XSS persistente por código ajeno), escapes de salida en hub/ficha, pincel sync con reintentos reseteados, diálogo con aria-modal+foco viajero. EXE/APK v9. **119/119 + 58/58 · 0 errores JS**.
- **15-09 · v1.5.1 AUDITORÍA A–J ENTREGADA** — SUF determinista (sin mezcla pymes/residencial), perfil global único, sello ts por cambio local (cero pérdida offline), sin eco de restauración, hooks tras render, versión snapshot viva, sw network-first + admin cacheada, pastilla identifícate en guiones, sin perfiles-chancla. EXE/APK v8. **110/110 + 58/58**.
- **15-09 · v1.5 Dashboard de llamadas ENTREGADO** — 📞 «Registrar llamada +1» en «Mi semana» (manual, honesto) + 🎭 auto al cierre/roleplay, fecha LOCAL en `bm_dias` (sube por sync); **admin.html → «Llamadas del equipo»**: por comercial 📞 hoy / semana (L→hoy) / mes + actividad + «visto». EXE/APK v7. Baterías **98/98 + 58/58** con dashboard funcional en jsdom.
- **15-09 · v1.4 ENTREGADA — empleado = solo ID + panel admin** — Clave embebida (troceada anti-revocación, vacuna auto por versión); empleado login solo con ID; **`admin.html`**: alta/quitar IDs, estado de clave, actividad `datos/`; registro por email prellenado a canalpymes@bmae.es desde el login; soporte/sugerencias en pies → mismo correo. Web/EXE(v5 ficheros)/APK (vCode 6). Baterías **91/91 + 58/58**. Clave embebida verificada autenticando reconstruida desde el fuente (nunca entera en archivos).
- **15-09 · v1.3 Puerta ID empleado ENTREGADA** — login en index (clave→ID→nombre→menú), **lista cerrada** `equipo.json` (primer arranque auto-admin, «👥 Autorizar ID» desde la app), modo local explícito, «Cambiar de usuario». Web/EXE/APK 1.3 (vCode 5). Baterías 83/83 + 58/58. Validado contra GitHub real (seed→merge→limpieza ✔).
- **15-09 · v1.2.1 HOTFIX (reemplaza a v1.2)** — verificación integral cazó 3 defectos: `url`→`u` (push no salía a la red), `insertBefore` sobre `.cfb-nota` no hija directa (bloque ☁ nunca se pintaba = «no veo el sync»), reintentos infinitos capeados. Sello E2E real contra GitHub (A sube → B restaura byte a byte). Baterías 69/69 + 57/57 con camino feliz cubierto. **Web/EXE/APK v1.2.1 (vCode 4) regenerados y verificados dentro de los binarios.**
- **15-09 · APK v1.2 + EXE v1.2 ENTREGADOS** — perfil por comercial (burbuja `bm_*` namespaced, migración transparente) + **☁ Sync GitHub automático**: guardado central sin exportar/importar (repo privado `CFB-datos-equipo`, clave fine-grained Contents:RW por dispositivo, doc `docs/SYNC-GITHUB-SETUP.md`). Web v1.2 ya en `WEB/` + `version.json`. QA 67/67 · Humo 56/56 · 0 errores JS. Misma firma → actualización sobre instalación sin perder datos.
- **16-09 · v2.5.0 «Salud» → v2.7.0 «Diploma» (tren aprobado ENTREGADO)** — (v2.5) ⏱ cronómetro de llamada en cabecera (registro auto con duración al colgar) + admin: columna «⏱ Media» y línea 🩺 de errores por comercial (lee `bm_errores*` del kv) + CSV ampliado. (v2.6) 📨 seguimiento mail/WhatsApp personalizado desde Mi Cuenta + 📝 nota CRM directa en modo Foco. (v2.7) 🎓 examen final cronometrado (10 preguntas, 8 min, 8/10) + 📜 certificado imprimible + 🔔 auto-aviso ACTIVADO (URL pública) + 📲 instalar.html (iPhone/Android PWA). Binarios únicos 2.7.0 (APK **v19**, EXE firmado). QA **187/187 + 58/58 · 0 errores JS**. sw `cfb-v270`.
**+hotfix v2.7.1 «DIA»**: aplicados ya los hallazgos de `docs/AUDITORIA-QA-SENIOR-v2.7.0.md` (keyframes cfbPulseG, examen con role=dialog/Escape, reduced-motion ×5 archivos, aria-labels, theme-color/description). QA **190/190 + 58/58**. sw `cfb-v271`, APK **v20**, EXE 2.7.1 firmado.
**+v2.7.2 (bug campo)**: «Ocultar» de la nota rápida cerraba el modo Foco entero → ahora solo esconde la nota (`.qn-off`) y se recupera determinista al entrar de nuevo en Foco (hook `cadena`). QA **192/192 + 58/58**, sw `cfb-v272`, APK **v21**, EXE 2.7.2.
**+v2.7.3 (campo)**: toast (z:200) invisible bajo la nota rápida (z:20000) — «los botones no responden» era feedback sepultado. `.toast` → z:100002. QA **193/193 + 58/58**, sw `cfb-v273`, APK **v22**, EXE 2.7.3.
**v1.2 (pendiente):** B3 firma .exe (decisión €) · B4 capturas de humo · Lighthouse PWA · QR-cámara.
**v2.0 (ENTREGADA 15-09):** `tools/factory/{plantillas,contenido}` + `build.js --check` (golden hash en la QA).
