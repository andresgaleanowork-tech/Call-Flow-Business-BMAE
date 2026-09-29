# 🛡 RGPD mini-memo — por qué «Mis clientes» (v2.2) es privado por defecto

**Fecha:** 15‑09‑2026 · **Componente:** mini-CRM por cliente en «Mi semana» (`cli_registros`)

## 1 · Qué datos nuevos entran
- Nombre/referencia del negocio llamado (p. ej. «Bar La Mareta») y notas breves (motivo, acuerdos, pendientes).
- **No** teléfonos, NIF, direcciones ni datos de personas físicas identificadas (el diseño disuade de meterlos: campos cortos, sin adjuntos, sin fotos).

## 2 · La decisión de ingeniería que lo hace seguro
| Regla | Implementación |
|---|---|
| **Nada sale del dispositivo** | Prefijo `cli_` — la sync solo recoge claves `bm_`; el QR y el panel admin tampoco lo ven. Ni el repo privado contiene fichas de cliente. |
| **Retención automática** | Las notas de **+180 días se purgan solas** al abrir «Mi semana» (con aviso de cuántas se retiraron). |
| **Borrado ejercitable** | 🗑 por nota · 🗑 por ficha · «Vaciar registro» completo — respuesta a derecho de supresión al instante, en manos del propio usuario. |
| **Minimización y tapón** | Nombre ≤60 chars, nota ≤300, máx 20 notas/cliente y 80 fichas (cayendo la más vieja). |
| **Copia = decisión del usuario** | El botón 📋 copia al portapapeles; queda claro en el copy que a partir de ahí es responsabilidad del usuario. |

## 3 · Base jurídica y obligaciones
- **Base:** interés legítimo en la gestión comercial de clientes potenciales (art. 6.1.f RGPD) / medidas precontractuales cuando aplica.
- **Responsable del tratamiento:** B&M Asesores Energéticos. El dato **no se comunica** a terceros ni a la empresa (por diseño técnico, no por promesa).
- **Protección del dispositivo:** se exige bloqueo con PIN/biometría del móvil/PC del comercial (las fichas viven en localStorage, sin cifrado adicional).
- **Derechos (ACEIPLS):** se ejercen por escrito a **canalpymes@bmae.es**; como el dato no sale del aparato, la supresión es inmediata y verificable por el propio titular observando la app.
- **Registro de actividades de tratamiento:** anotar esta actividad con esta misma memo como justificante.

## 4 · Lo que NO se hace (alcance)
- No exportación al repo de datos del equipo. No creación del CRM compartido en el panel (eso sí requeriría encargo de tratamiento, cifrado y PIA — **queda fuera hasta decisión expresa**).
- Si algún día se quieren fichas de cliente compartidas en la nube: **round-trip legal previo obligatorio** (se documenta aquí y no se programa sin ✅).
