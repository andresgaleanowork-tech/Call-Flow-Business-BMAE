# 🔑 Clave del equipo: modelo central cifrado (v3.8.0+)

## Cómo funciona ahora

- La **clave real** (PAT de GitHub) **no viaja en la app** ni se reparte a nadie: vive **cifrada** en la web pública (`clave-equipo.json`, cifrado AES-GCM-256 + PBKDF2 SHA-256 ×250.000 que se hace **en tu propio navegador** al publicarla).
- Cada comercial entra **una sola vez** con su **ID + la contraseña del equipo** (una frase corta que tú eliges, ej. «faro-mantel-luna-29»). La app descifra la clave en su dispositivo y la guarda; ya entra directo siempre.
- Cuando **rotes la clave**, publicas la nueva tú solo desde el panel admin y **los dispositivos se renuevan solos** con la contraseña que ya conocen. Nadie tiene que volver a escribir nada.
- Rescate: cualquiera siempre puede entrar «con la clave larga» (enlace en la tarjeta 🔑) — útil para ti en PC.

## Puesta en marcha (una sola vez, ~10 min)

1. **Revoca la clave vieja** (la que viajó en builds ≤3.6):
   <https://github.com/settings/tokens?type=beta> → busca el token usado antes → **Delete**.
2. **Crea la nueva** en la misma pantalla → “Generate new token”:
   - Nombre: `cfb-equipo-v2`
   - Repositorios: selecciona **AMBOS**: `CFB-datos-equipo` **y** `Call-Flow-Business-BMAE`
   - Permisos: **Contents: Read and Write** (en cada uno)
   - Caducidad: 90 días (o la política del equipo)
3. **Publícala cifrada** desde la app (esto **ya está montado**):
   - Abre el **panel admin** → tarjeta **«🔑 Clave del equipo»** → «🛡 Publicar / rotar la clave para todo el equipo»
   - Pega la PAT nueva y escribe la **contraseña del equipo** (mín. 12 caracteres, fácil de decir en voz alta) ×2 → **«🛡 Cifrar y publicar en la web»**
   - El panel la valida contra **ambos** repos antes de subir; si falta permiso en uno te lo dice.
4. **El comercial no escribe nada** (v3.9): en la misma tarjeta 🔑 del panel pulsa **«📋 Crear y copiar el enlace»** y pégalo en el WhatsApp/correo del equipo. Quien lo abra **entra directo y solo le pide el ID**.
   - El enlace lleva la contraseña **en el `#`fragmento**: el navegador no la manda a ningún servidor y la app la borra de la barra tras usarla.
   - Los enlaces **caducan** si cambias la contraseña del equipo (entonces genera y reparte uno nuevo).
   - Rescate manual siempre disponible en la tarjeta 🔑 («contraseña del equipo» o «clave larga») para aulas, pantallas compartidas o si el enlace llegó roto.

## Rotaciones futuras (2 min)

GitHub tokens → regenerate/crear nueva → publicar de nuevo desde el admin con la **misma contraseña** → revocar la anterior. Los dispositivos fallan → se renuevan solos al entrar (silencioso). Si además cambias la **contraseña**, solo eso tendrás que volver a comunicar.

## Riesgo honesto y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El archivo `clave-equipo.json` es público → ataque de fuerza bruta offline a la contraseña | PBKDF2 ×250.000 hace cada intento ~¼ s: con frase de 3-4 palabras el ataque tarda años. Si sospechas filtración → revoca y republica (2 min) |
| Un móvil perdido tiene la clave descifrada en local | Igual que antes: revoca y republica; el resto se autorrepara. El móvil perdido solo podrá seguir hasta que reveques |
| El PC de sobremesa (file://) no soporta cifrado nativo | Por eso existe el acceso «clave larga»; el flujo de contraseña va por HTTPS (GitHub Pages) |
| ¿Qué pasa si borras `clave-equipo.json`? | Nada grave: los dispositivos sin clave verán la tarjeta de «clave larga» (v3.7) hasta que republiques |

## Verificación rápida

```bash
grep -rn "github_pat_" apps/web/index.html apps/web/admin.html   # solo placeholders de inputs
curl -s https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/clave-equipo.json | head -c 120   # debe verse cifrado (base64), nunca una clave
```
