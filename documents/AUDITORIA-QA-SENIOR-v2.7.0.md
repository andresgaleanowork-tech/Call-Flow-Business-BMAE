# Auditoría QA Senior — Call Flow Business v2.7.0 «Diploma»

## 0. Resumen ejecutivo

- **Tipo**: paquete completo (guion+tutorial ×2, index, admin, tutorial, instalar, PWA: sw + manifest + version.json)
- **Modo**: COMPLETO · **Intervención**: CONSERVADOR
- **Score global: 88 / 100**

| Cat | Score | | Cat | Score | | Cat | Score |
|---|---|---|---|---|---|---|---|
| A Sintaxis | 88 | | E SEO | 92 | | I Idioma | 98 |
| B Semántica | 94 | | F Rend./PWA | 90 | | J Versiones | 95 |
| C Formularios | 82 | | G Seguridad | 86 | | K Admin | 93 |
| D Accesibil. | 74 | | H RGPD | 97 | | L Tests | 100 |

- **S1 🔴 Crítico: 0** · **S2 🟡 Mayor: 3** · **S3 🟢 Menor: 5** · **S4 ⚪ Mejora: 4**
- **Top 3 riesgos**: ① modal del examen sin `role="dialog"`/focus trap ni Escape; ② `animation:cfbPulseG` referencia un `@keyframes` que **no existe** (el botón ⏱ no pulsa; fallo silencioso introducido en v2.5); ③ animaciones sin `prefers-reduced-motion` (WCAG 2.3.3).
- **Veredicto: listo para publicar** — sin bloqueantes; los S2 son mejoras de a11y/AA rápidas y seguras de aplicar.

## 1. Contexto faltante y supuestos

- Auditoría sobre el **build** (`WEB/*.html`) y fuentes editoriales presentes en el workspace: contexto completo, nada inventado.
- Contraste de color (D2): **requiere contexto CSS** — no medible sin render; declarado, no puntuado a la baja sistemática.
- Objetivo táctil ≥24 px (D9) en JS-dinámicos: se revisa por tipo de clase (`.cfb-btn`, `.btn*`), no pixel a pixel.
- **Supuestos**: (1) GitHub Pages no permite cabeceras CSP propias — la opción realista sería `<meta http-equiv="Content-Security-Policy">`; (2) el archivo único se abrirá también desde `file://` (EXE/APK), donde CSP no aplica; (3) las Google Fonts quedan CONSCIENTEMENTE externas (CAZA#A4).

## 2. Tabla de hallazgos

| # | Ref (snippet) | Sev | Cat | Regla | Problema | Corrección | Confianza |
|---|---|---|---|---|---|---|---|
| 1 | `.btn-blanco.timer-on{…animation:cfbPulseG 1.2s…}` | S3 🟢 | A | WHATWG/CSS válido pero referencia colgante + proyecto §7 | solo hay `@keyframes fade` ×2: el nombre no existe → el botón ⏱ activo **no pulsa** (silencioso) | definir `@keyframes cfbPulseG` en `cfbCss` | Alta |
| 2 | `ov.style.cssText='position:fixed;inset:0;…z-index:60000…'` (#cfbExamOv) | S2 🟡 | D7 | WCAG 2.2 — 4.1.2 Nombre/Rol/Valor, ARIA 1.2 dialog | modal del examen sin `role="dialog"`, `aria-modal="true"`, focus trap ni retorno ni Escape | añadir attrs + trap mínimo (ver §3) | Alta |
| 3 | `animation:fade …` ×4 y resto de keyframes sin guarda (5 sitios) | S2 🟡 | D8 | WCAG 2.2 — 2.3.3 / 2.3.4 AAA ↔ criterio del proyecto D8 | `prefers-reduced-motion` **ausente en los 6 archivos**; toast/pulse/`card:hover` autorreproducibles | bloque único `@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}` en cada hoja | Alta |
| 4 | `<input id="qnNombre" … placeholder="Cliente…">`, `<textarea id="qnNota">`, `#cliNombre`/`#cliNota`, inputs KPI (`type="number"…oninput="guiCalcKpis()"`) | S3 🟢 | C1 | WCAG 1.3.1 / 3.3.2 / 4.1.2 | el *placeholder* se usa como único nombre accesible (los radios del examen van bien: `<label>` envolvente ✔) | `aria-label="Nombre del cliente"` etc. (0 HTML visible) | Alta |
| 5 | cabeceras de `pymes.html`/`residencial.html`/`tutorial.html` | S3 🟢 | A1 | WHATWG/meta + proyecto §A1 | sin `<meta name="theme-color">` ni `rel="manifest"` en guiones; tutorial sin manifest ni sw-register; status-bar móvil sin marca | añadir theme-color (y opcional manifest) en plantillas editoriales | Alta |
| 6 | `admin.html` y `instalar.html` | S3 🟢 | E2 | SEO mínimo del proyecto §A1 | sin `meta description` (admin va `noindex` ✔ bien; instalar sí se indexa) | añadir description a `instalar.html` (admin: opcional/por noindex) | Alta |
| 7 | 79 `onclick=`, 2 `oninput=`, 3 `onchange=` en guiones (+2 en index, +6 en admin) | S2 🟡 | G2 | OWASP/CSP + proyecto §G2 | CSP estricta imposible hoy: todos los handlers son inline (decisión heredada del archivo único) | **no se impone** (ver §4): dejar documentado; si llega meta-CSP → migrar a delegación | Alta |
| 8 | `id="cfbGateError"` ×2 en fuente de `index.html` | S4 ⚪ | A6 | WHATWG (ids únicos por documento) | dos tarjetas del gate llevan el mismo id, **pero son ramas excluyentes** («Entrar →» vs «Entrar ✔»): nunca conviven en el DOM (verificado en fuente) | opcional: renombrar a clase `cfbGateError` — no urgente | Alta |
| 9 | `tutorial.html` | S4 ⚪ | F6 | PWA §F5/F6 | fuera del paraguas PWA (sin manifest/sw/theme-color) | opcional: registrar sw + manifest como en index | Alta |
| 10 | `<noscript>` ausente en todas las páginas | S4 ⚪ | A1 | accesibilidad progresiva | sin mensaje «requiere JS» (la app no funciona sin JS por diseño) | opcional: `<noscript>` en index | Media |
| 11 | `animation`/`transition` en `.card:hover` (admin/index) | S4 ⚪ | D8 | igual que #3 | incluidas en la corrección global de #3 | (unificada) | Alta |
| 12 | `#btnTimer` inline sin `aria-pressed`/etiqueta de estado | S4 ⚪ | D9 | WCAG 4.1.2 estado | el estado «cronometrando» solo se anuncia con color/infinite pulse | al activar, añadir `aria-live` al timer o `aria-pressed="true"` | Alta |

### Verificaciones superadas (no son hallazgo — se fijan para memoria)

- **H1 RGPD ✔**: `snapshot()` solo copia claves con prefijo `bm_` (`k.indexOf('bm_')===0`) → `cli_registros` **nunca** sale del dispositivo. Purga `cliPurga` a 180 días presente. `bm_errores` limitado a 20 (`slice(-20)`, solo mensajes técnicos).
- **G5 ✔**: `cfb_sync_token` solo aparece en función `token()`/`cfbSyncPush` — **nunca** se renderiza ni se loguea.
- **J1 ✔**: `VERSION '2.7.0'` = `version.json 2.7.0` = `cfc-v270` (sw) = última entrada `CHANGELOG v2.7.0` = `GUIAFECHA '16-09-2026'`.
- **G4 ✔**: escapador `xh()` presente y usado en HTML de datos de usuario (certificado, examen, vars).
- **I ✔**: «regalar un minuto» ×5, «excelente día» ×6, «en un rato» ×1 — **todas** ocurren dentro de `PROHIBIDAS`/feedback didáctico marcando su uso como error. El copy operativo está limpio.
- **J3 ✔**: `const esc = s => …` aparece una sola vez; el comentario sobre la colisión quedó como documentación; 0 errores JS en carga jsdom.
- **K3 ✔**: `equipo.json` PUT envía `sha` (`cuerpo.sha=EQUIPO._sha`). **K5 ✔** 8 columnas. BOM CSV `\ufeff` ✔. `noindex,nofollow` ✔.
- **C3 ✔**: `type="password"` solo para el token (admin).
- **A5 ✔**: ningún `user-scalable=no`. Sin `tabindex` positivo. Sin `javascript:`. Sin `target="_blank"`. 1/1 `<img>` con alt. Toast con `aria-live="polite"`.
- **L ✔**: `npm test` → **187/187 + 58/58 · 0 errores JS** (hoy, tras el build v2.7.0).

## 3. Código corregido (propuesta mínima — parche «v2.7.1 DIA», sin rebuild manual: aplicar en `_dev/editorial/plantillas/*` + `build.js` + batería)

**#1 + #3 · cfbCss (ambas plantillas):**

```css
/* corrección #1: keyframes que faltaban */
@keyframes cfbPulseG{
  0%,100%{ box-shadow:0 0 0 0 rgba(198,40,40,.55) }
  50%    { box-shadow:0 0 0 7px rgba(198,40,40,0) }
}
/* corrección #3: WCAG 2.3.3 — una sola guarda global */
@media (prefers-reduced-motion: reduce){
  *{ animation: none !important; transition: none !important; scroll-behavior: auto !important }
}
```

(Punto de inserción: dentro de `<style id="cfbCss">`, junto a `.btn-blanco.timer-on`. En `index.html`/`admin.html`/`tutorial.html`/`instalar.html` añadir el mismo `@media` al `<style>` principal.)

**#2 · modal del examen (v2.7) — en `window.cfbExamen`, tras crear `ov`:**

```js
ov.setAttribute('role','dialog');
ov.setAttribute('aria-modal','true');
ov.setAttribute('aria-label','Examen final');
// foco inicial + retorno + Escape:
var _prevF=document.activeElement||null;
ov.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ clearInterval(finT); ov.remove(); if(_prevF&&_prevF.focus)_prevF.focus(); }
});
document.body.appendChild(ov);
var f0=ov.querySelector('input,button'); if(f0) f0.focus();
```

(y al cerrar vía «Cerrar/Cancelar», devolver foco con `_prevF`)

**#4 + #12 · accesibilidad de entrada:**

```html
<input id="qnNombre" … aria-label="Nombre del cliente">
<textarea id="qnNota" … aria-label="Nota rápida de la llamada"></textarea>
<input id="cliNombre" aria-label="Nombre del cliente"> <textarea id="cliNota" aria-label="Nota del cliente">
<!-- KPIs del tutorial: -->
<input … aria-label="KPI: llamadas por hora"> <!-- etc. por posición -->
```

y en `pintarTimer()`, cuando está activo: `b.setAttribute('aria-pressed','true')` / al parar `'false'`.

**#5/#6 · cabeceras (editorial):** añadir en plantillas `<meta name="theme-color" content="#004d2d">` (idénticas a `index`/`instalar`), y en `instalar.html` una `<meta name="description" content="Cómo instalar Call Flow Business como app en su móvil (iPhone y Android).">`.

Ninguna corrección toca claves `bm_/cfb_/cli_`, ni `snapshot`, ni `tutSetHojas`, ni ids de `<style>/<script>` → **tests intactos**; se añadirían 3 checks (P1 keyframes, P2 attrs modal, P3 reduced-motion/aria-labels) → 187→190.

## 4. Coste/beneficio declarado (intervención conservador)

- ✅ **Aplicar ya (v2.7.1)**: #1, #2, #3, #4, #5, #6 → ~20 líneas, 4 archivos editoriales + 2 sueltos; cero riesgo de sync/RGPD/tests.
- 📦 **Documentado, no ejecutar**: #7 (G2 inline handlers) — obliga a rediseñar todo el event-wiring del archivo único para una CSP que GitHub Pages no puede servir por cabecera; dejar como deuda técnica justificada offline-first.
- ⚪ **Opcionales**: #8, #9, #10.

**Autoverificación**: cada hallazgo tiene regla real citada (WCAG 2.2 nº criteria, WHATWG, OWASP, RGPD art. 5.m. minimización para H, reglas duras del proyecto §1–§8); sin líneas inventadas; las afirmaciones «no medibles» quedan marcadas como «requiere contexto».


---

## 5. Estado posterior — CORREGIDO en v2.7.1 «DIA» (16-09-2026)
Aplicados los hallazgos #1–#6 y #12 tal como propone el §3: `@keyframes cfbPulseG` + `prefers-reduced-motion` (8 archivos), examen con `role="dialog"`/`aria-modal`/Escape/foco, `aria-label` en nota-CRM, `aria-pressed` en ⏱, `theme-color` en plantillas y `description` en instalar. Baterías **190/190 + 58/58 · 0 errores JS**. Pendientes por decisión del producto: #7 (G2 inline handlers — deuda documentada, ver §4), #8–#10 opcionales. **Score revisado tras el hotfix: 94/100.**
