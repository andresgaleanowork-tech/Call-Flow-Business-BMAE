# ✍️ Fuente editorial única (v2.0 · D2)

**De «texto dentro del código» a «texto que genera código».**
Las correcciones semanales de contenido se hacen aquí, nunca editando `WEB/*.html` a mano.

## Cómo está organizado

```
_dev/editorial/
├── build.js                 ← el generador (ver abajo)
├── extraer.js               ← extracción inicial (histórico, solo referencia)
├── plantillas/
│   ├── pymes.html           ← el guion PYMES con huecos @@EDITORIAL:NOMBRE@@
│   └── residencial.html     ← ídem Residencial (código, estilos y lógica viven aquí)
└── contenido/
    ├── pymes/               ← 20 bloques de texto puro (CONFIG, MODULOS, NODES, OBJECTIONS…)
    │   ├── NODES.js
    │   ├── OBJECTIONS.js
    │   └── …
    └── residencial/         ← sus 20 bloques equivalentes
```

## Regla de oro del viernes de fichas

1. **Edita `contenido/<guion>/<BLOQUE>.js`** (es texto: nodos, objeciones, quiz, glosario…).
2. `node _dev/editorial/build.js`  → regenera `WEB/pymes.html` y `WEB/residencial.html`.
3. `cd WEB && npm test` → debe seguir todo verde.
4. Rebuild EXE/APK (recetario del PLAN) y `git push`.

`node _dev/editorial/build.js --check` solo **verifica** que las fuentes y WEB/ están sincronizadas
(la batería QA ya lo hace sola — si alguien edita HTML a mano, sale ✘ al instante).

## Cambios de CÓDIGO (no de contenido)

Van a `plantillas/<guion>.html` (estilos, módulo sync, hub, tutorial engine…) y luego `build.js`.
Los patchers históricos (`_dev/parches/*.py`) quedan **congelados**: desde v2.0, parchear =
editar plantilla o contenido + build.

## Para añadir un bloque nuevo editable

1. Sustituye el `const NUEVO = …;` de la plantilla por `@@EDITORIAL:NUEVO@@`.
2. Guarda el bloque en `contenido/<guion>/NUEVO.js` (bytes exactos, terminado en `;`).
3. `node build.js --check` ✔.
