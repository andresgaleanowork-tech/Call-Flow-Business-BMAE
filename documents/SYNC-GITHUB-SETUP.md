# ☁ Activación de la Sync GitHub (v1.2) — una vez, 10 minutos

**Qué hace:** cada comercial con perfil («Mi semana» → 👤) guarda automáticamente SU burbuja
(claves `bm_*`) en el repo privado **`CFB-datos-equipo/datos/<perfil>.json`**, con commit
automático por cambio. Al abrir en otro dispositivo, restaura en silencio si la nube es más reciente.

## 1 · Crear el repositorio (andresgaleanowork-tech)
- `https://github.com/new` → nombre **CFB-datos-equipo** · **PRIVADO** · Add README ✔.

## 2 · Crear la clave (token) — fine-grained, mínima pólvora
GitHub → foto perfil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**:
- Token name: `cfb-sync-datos` · **Expiration: 90 days** (rotación trimestral — programadla).
- Repository access: **Only select repositories → CFB-datos-equipo** (SOLO ese).
- Permissions: **Repository → Contents: Read and write**. Todo lo demás, vacío.
- **Generate** y COPIAR la clave (empieza por `github_pat_…`). Mostrada una sola vez.

## 3 · Distribuir la clave al equipo (boca a boca)
- Pásadla por el grupo privado (WhatsApp interno). **Nunca en el código, correo público o GitHub.**
- Cada dispositivo: abrir el guion → «📊 Mi semana» → bloque **☁ Guardado en la nube** →
  «Activar sync (pegar clave)» → pegar una vez. Queda guardada EN ESE DISPOSITIVO.
- En el mismo bloque: «👤 Dime quién eres» — cada quien pone su nombre al sentarse en un PC
  compartido (botón «Cambiar de persona»).

## 4 · Verificación rápida
- Tras la primera clase práctica: `repo CFB-datos-equipo/datos/` debe contener `<perfil>.json`
  con snapshots `{version, perfil, ts, kv:{bm_*}}`. En el hub figura «☁ Sync GitHub: ok · última HH:MM».

## ⚠ Reglas que lo mantienen seguro
1. La clave **jamás** entra al código del producto (GitHub la revocaría y, peor, regalaría acceso).
   Por eso sync funciona sin clave en el fuente: pega-por-dispositivo.
2. El repo de datos está separado del de la web: un token robado NO puede tocar el producto.
3. Sin red → la app va exactamente igual de completa; sync se reactiva sola.
4. Rotación: al vencer los 90 días, generáis otra y la recompartís; las antiguas se revocan.
5. El historial del repo de datos hace ruido de commits automáticos — es su propósito, no un bug.
6. Conflictos entre dispositivos: gana la nube si su fecha es más reciente (regla simple, estilo bolsillo).


---

# 🪪 v1.3 · Puerta con ID de empleado (lista cerrada)

Desde la 1.3 el menú pide identificarse antes de mostrar PYMES / Residencial / Tutorial.

## Ritual por dispositivo nuevo (dos pantallas y dentro)
1. **🔑 Clave del equipo** → pega la clave una sola vez (se queda solo en ese dispositivo).
2. **🪪 Tu ID de Iberdrola** → la primera vez te pide también tu **nombre**. Entras al menú.
3. Siguientes veces: «Hola, <nombre> · ID <id>» directo al menú. «Cambiar de usuario» para PC compartido.

## La lista: `equipo.json` en CFB-datos-equipo
- **Primer arranque**: si `equipo.json` no existe, la primera persona que entre con clave válida
  **crea la lista y queda ADMIN** (confirmación en pantalla). — Andrés: hazlo tú el primer día.
- **Autorizar gente**: admin abre «📊 Mi semana» → su saludo en el menú muestra **«👥 Autorizar ID»**
  → escribe ID + nombre → queda guardado al instante. El empleado ya puede entrar.
- Quitar a alguien: edita `equipo.json` en GitHub (botón ✏️) y borra su línea — efecto inmediato
  en el siguiente login (su perfil ya creado en algún dispositivo sigue local, pero no entrará de nuevo con clave).
- Formato del archivo (se autogestiona, no hace falta tocarlo):
  `{"autorizados":[{"id":"123456","nombre":"Ana","admin":true},{"id":"654321","nombre":"José"}]}`

## Modo local 🌫
Quien entre sin clave/red puede elegir «modo local»: trabaja normal pero **nada sale de ese
dispositivo** (queda marcado en su saludo y en «Mi semana»). Para pasar a nube: «Cambiar de usuario» y entrar con clave.

## Notas
- El ID no valida formato (números o lo que uses); se compara sin importar mayúsculas.
- La burbuja de cada uno pasa a `datos/i-<id>.json` (los perfiles antiguos por nombre, p. ej. `andres-galeano.json`, quedan como histórico; se pueden borrar a mano en el repo).
- Sin red: usa la última lista guardada (caché 6 h, hasta 24 h offline).


---

# 🛡 v1.4 · Panel del admin + alta por correo

Cambia quién da de alta: **pasa de autogestión («👤 Dime quién eres») a lista gestionada por el responsable**.

- **`admin.html`** (en WEB y en los binarios): página del responsable. Abre con la **misma clave del repo de datos**.
  Dentro: autorizar ID + nombre, quitar a alguien, y ver la lista — sin tocar `equipo.json` a mano.
- **Alta de gente nueva**: el empleado manda un correo a **canalpymes@bmae.es** pediendo «deseo dar de alta»
  con **Nombre + ID** (desde el error de la puerta hay botón ✉️ que prepara ese correo).
  El responsable lo autoriza en el panel y el empleado entra solo con su ID (sin pegar claves).
- **Soporte y sugerencias = mismo correo**: canalpymes@bmae.es (el botón «✍️ Proponer mejora» de Mi semana
  abre correo con la incidencia ya rellenada).

# 📈 v1.5 · Dashboard de llamadas por comercial

- En `admin.html`, botón **📈 Llamadas del equipo**: tabla por comercial con
  **📞 Hoy · 📞 Semana (lunes→hoy) · 📞 Mes · 🎭 automático semana · Visto hace…** (fechas locales).
- El comercial registra cada llamada real con **«📞 Registrar llamada +1»** en su «Mi semana» —
  **la app no está en la línea**: lo honesto es que el humano pulse al colgar.
- 🎭 = métrica automática sin intervención: veces que el guion llega a cierre + roleplays.
- Cada snapshot `datos/i-<id>.json` incluye ya `bm_dias_<slug>` reflejado, así el panel lee lo mismo
  que ve el comercial.

# 🧯 v1.5.1 · Auditoría A–J (endurecimiento de la sync)

Correcciones verificadas por la batería QA (128 comprobaciones):

- **Perfil en clave única global `cfb_perfil`** (la puerta y la sync leen lo mismo; antes Residencial
  miraba `cfb_perfil_res` y no sincronizaba tras la puerta).
- **`cfb_localts` se sella en CADA cambio local** — editar offline y cerrar antes de 10 s ya no pierde datos
  (regla «gana la nube si su fecha es más reciente» ahora usa la fecha real del cambio).
- Sin «commit eco»: al restaurar del pull ya no se dispara un push por clave.
- **Pymes y Residencial dejaron de compartir contadores** (sufijo determinista por guion, sin olfateo).
- El estado ☁ sale en «Mi semana» siempre (reintentos internos).
- SW network-first para documentos: las actualizaciones web llegan a la PRIMERA carga, no a la segunda.

# 🪨 v1.5.2 · Auditoría NIVEL-2

- **Importar código/QR ajeno ya no puede inyectar nada**: todo lo que entra se sanea recursivamente
  (cierra el vector de XSS persistente) y los paneles que pintan esos datos escapan su markup.
- Diálogo «Mi semana» accesible de verdad: `aria-modal` y el foco entra y VUELVE al cerrar.

# 💼 v1.5.3 · Auditoría NIVEL-3 (flujos reales)

- **El QR/código «entre dispositivos» YA lleva la personalización real** (`guion_vars`: nombre del cliente,
  sector, importe…) **y los KPIs apuntados** — antes viajaban vacíos sin avisar.
- La pestaña **KPIs precarga «Llamadas»** con lo registrado hoy en «Mi semana» (un solo número a tocar).
- Sumas de día/semana/mes blindadas contra entradas basura de importaciones.

## Estado actual (resumen operativo)

| Pieza | Dónde vive | Regla de oro |
|---|---|---|
| Clave (token fine-grained) | Solo dispositivos, jamás en el código | Rotar cada 90 días |
| Lista del equipo | `CFB-datos-equipo/equipo.json` — se gestiona desde `admin.html` | Altas: canalpymes@bmae.es |
| Burbujas de datos | `CFB-datos-equipo/datos/i-<id>.json` | Un commit por cambio; gana la nube más reciente |
| Sin red | Todo sigue funcionando 100 % local | Al volver, sync sola |
| Versionar | SW network-first + `version.json` (aviso ✨ al primer cambio) | EXE/APK se redistribuyen |
