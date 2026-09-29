# Tests — batería consolidada

Batería de **193 comprobaciones** (estáticas + dinámicas con jsdom) sobre `pymes.html`:
estructura de datos del guion y del tutorial, flujo de llamada por el árbol, objeciones
con naturalidad, modal de variables, modo Foco, créditos (focus trap, z-index, Escape),
accesibilidad y regresiones fijadas por versión: sync por comercial, gate por ID,
«Mi Cuenta» (sesión, cierre), aviso legal persistente, ⏱ cronómetro de llamada con
registro automático, seguimiento mail/WhatsApp personalizado, nota CRM en modo Foco,
🎓 examen final cronometrado + 📜 certificado imprimible, auto-aviso de versiones y
página PWA de instalación. Panel admin: llamadas por períodos, ⏱ media semanal,
🩺 errores por comercial y CSV.

## Ejecutar

```bash
npm install jsdom          # una vez, en la raíz del repo
node tests/bateria-qa.js
```

Salida esperada: `✅ BATERÍA QA + CORE: TODO VERDE (193 comprobaciones)`.

## Versión residencial

```bash
node tests/bateria-residencial.js    # humo: 58 comprobaciones sobre residencial.html
```

`npm test` ejecuta ambas. Páselas siempre antes de publicar cambios en las plantillas
editoriales (`tools/factory/plantillas/`) y reconstruye después con
`node ../tools/factory/build.js` desde `WEB/`.
