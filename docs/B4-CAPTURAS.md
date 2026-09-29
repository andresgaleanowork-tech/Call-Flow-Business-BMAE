# B4 · Capturas — Call Flow Business v1.5.3 (15‑09‑2026)

Generadas con navegador headless real (Chromium/Playwright) sobre los HTML v1.5.3 exactos que van dentro del EXE/APK. Perfil de muestra: **Ana** (admin) con datos semilla (4 📞 hoy, 11 esta semana, meta 2/3).

## Escritorio (1280×800)

| Archivo | Qué muestra |
|---|---|
| `capturas/01-gate-index.png` | Puerta del menú: entrada solo con **ID Iberdrola** (lista cerrada) |
| `capturas/02-menu-index.png` | Menú tras entrar — «Hola, Ana», burbuja ☁ nube, Panel admin, y las 3 tarjetas (Pymes / Residencial / Tutorial) |
| `capturas/03-pymes-tutorial.png` | Primera apertura del guion Pymes: tutorial obligado una vez |
| `capturas/04-pymes-guion.png` | Árbol de decisión PYME en vivo (fases, objeciones, roleplay) |
| `capturas/05-hub-mi-semana.png` | «Mi semana» completo: sync, actividad, **Llamadas Hoy 4 / Semana 11**, recorrido, objeciones, insignias |
| `capturas/06-kpi-tab.png` | Pestaña KPIs — «Llamadas» **precargada con lo registrado hoy** (novedad v1.5.3) |
| `capturas/07-residencial-guion.png` | Guion Residencial (PVPC, placas, anti-timo) |
| `capturas/08-admin-puerta.png` | Panel del responsable: puerta de clave (repo privado, dashboard por comercial) |
| `capturas/09-pymes-qr.png` | «Entre dispositivos»: QR + código — ahora lleva **personalización y KPIs reales** (novedad v1.5.3) |

## Móvil (390×844)

| Archivo | Qué muestra |
|---|---|
| `capturas/m01-menu.png` | Menú en móvil |
| `capturas/m02-guion.png` | Árbol de llamada en móvil (una columna, botón «Registrar llamada») |
| `capturas/m03-hub.png` | «Mi semana» en móvil: foco en el diálogo (aria-modal, novedad v1.5.2) |

## Regenerar

El script vive en esta carpeta: `capturas/generar-capturas.js` — con `npm i playwright && npx playwright install chromium-headless-shell` basta `node generar-capturas.js` (escribe en `./capturas/`).
