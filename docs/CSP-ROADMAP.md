# 🛡 Hoja de ruta CSP (mejora #9, por tramos)

Objetivo final: `Content-Security-Policy` estricta sin `unsafe-inline` en scripts/handlers (OWASP).

## Hecho en v2.8.0
- Botones de la nota rápida: `onclick="qnGuardar()"/"qnOcultar()"` → `addEventListener` en `qnInit` (referencia de patrón a seguir). Cubierto por test W1 (prohíbe regresión).

## Tramos pendientes (riesgo decreciente)
1. **QuickNote/hub/examen** (hecho el primero): migrar handlers de módulos cfb → listeners.
2. **Guion (árbol/objeciones/tabs)**: grueso de `onclick` restante; migrar por familias (`guiElegir`, `guiIrA`, `guiAbrirObjecion`, `guiActivarTab`) con data-attrs + delegación.
3. **Tutorial/quiz/casos**: misma técnica.
4. **Activar CSP** por meta tag en dos fases: primero `Content-Security-Policy-Report-Only` (recoger violaciones), luego enforce.
5. **Inline `<script>`**: mover a archivos o nonce; hasta entonces CSP cubre solo handlers.

Restricción del proyecto: archivos únicos HTML + funcionamiento en WebView/APK → meta tag (no cabeceras) y cero dependencias de build externo.
