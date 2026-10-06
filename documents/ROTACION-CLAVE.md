# 🔑 Clave del equipo: modelo central cifrado multi-entrada (v3.8 → v3.10.0+)

## Cómo funciona ahora (F13 · ADR-002/003)

- La **clave real** (PAT de GitHub) **no viaja en la app** ni se reparte a nadie: vive **cifrada una vez por persona** en la web pública (`clave-equipo.json` multi-entrada · AES-GCM-256 + PBKDF2-x250.000 hecho en tu propio navegador).
- **Cada persona tiene SU contraseña** (tú la defines generada o a mano al darle de alta en el panel admin → tarjeta «👥 Accesos personales»). Nadie mira ni comparte la contraseña de otro.
- **Alta**: creas su acceso → copias su **enlace personal** (`index.html#ap=<slug>:<contraseña>`) por WhatsApp/correo interno → **entra de 1 clic** y solo teclea su ID.
- **Baja**: revocas su entrada (+ quitarlo del «Equipo autorizado»). Efecto: su dispositivo ya no puede renovar la clave tras la próxima rotación; si la baja es delicada, cierra del todo con «🛡 Publicar/rotar» (ver abajo).
- **El usuario cambia su propia contraseña** desde el menú («🔑 Mi acceso»): la app recifra SOLO su entrada y la republica.
- **Doble clave (ADR-003)**: dentro del cifrado viaja también una **clave de datos** distinta del token, que usarán los módulos para los campos sensibles; la fija tu dispositivo admin una sola vez.
- Modelo LEGADO intacto: blob de contraseña única (v3.8/3.9) sigue funcionando como pasarela — al publicar el primer acceso personal pasa solo a multi-entrada.

## Puesta en marcha en accesos personales (una vez, ~15 min)

1. Asegúrate de que la **PAT vigente tiene `contents:read+write` en AMBOS repos** (`CFB-datos-equipo` **y** `Call-Flow-Business-BMAE`). Si no, crea una nueva igual que antes y revoca la vieja (<https://github.com/settings/tokens?type=beta>).
2. Entra al **panel admin** con tu ID → tarjeta «🔑 Clave del equipo» → details **«👥 Accesos personales»**.
3. Para **cada** persona del equipo: pulsa **«＋ crear su acceso»** → acepta la contraseña sugerida (o escríbela: 12+ caracteres, fácil de decir en voz alta) → **«🛡 Publicar su acceso»** → **«📋 enlace personal»** → mételo en el WhatsApp/correo interno de esa persona.
4. **Tú también**: crea tu propio acceso (entrada con tu ID de admin) y entra a la app con tu enlace → así tu dispositivo fija la **clave de datos** oficialmente.
5. Revoca la PAT vieja en GitHub si aún no lo hiciste.

## Rotaciones futuras

- **Rotación de la clave real** (cuando GitHub la expire o por prevención): crea/regenera PAT → «🛡 Publicar/rotar» (la publicador vigente sigue arriba vieja: republica la contraseña única + RESCATE) **o**, mejor, desde «Accesos personales» republic uno a uno cada acceso con la **nueva clave real de este dispositivo** (si haces la rotación desde este ordenador ya la conoce).
- **Activar la revocación** inmediata de una persona → borra su entrada + rota la clave real.
- **Contraseña personal olvidada** → desde el admin: «🔁 reset contraseña» (nueva + enlace nuevo); el antiguo enlace caduca solo.

## Riesgo honesto y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Blob público → fuerza bruta offline a cualquier contraseña personal | PBKDF2 ×250.000 (~¼ s por intento) + contraseñas de 3-4 palabras: años. Sospecha → reset/rotación en minutos |
| Móvil perdido con la clave descifrada en local | Revoca su entrada (+ rotación de la clave real si el riesgo es serio) — **quitar la entrada no borra la copia que dormía en su dispositivo** mientras la clave real siga válida: sé honesto con esto |
| Sin servidor: sin 2FA ni bloqueo por intentos | Es la frontera del modelo: queda mitigada por revocación+rotación y por monitorizar el historial del repo (cada publicación es un commit visible) |
| **Compromiso del cifrado multi-entrada**: cualquiera con la clave real podría alterar las entradas de otros | Todo el equipo tiene ya la clave real en sus dispositivos: no empeora el estado actual; el remediado real es S2 (cadena de auditoría) y, llegado el momento, servidor/BBDD (PLAN §3) |

## Verificación rápida

```bash
grep -rn "github_pat_" apps/web/index.html apps/web/admin.html   # solo placeholders de inputs
curl -s https://andresgaleanowork-tech.github.io/Call-Flow-Business-BMAE/clave-equipo.json | head -c 200   # cifrado (base64), jamás una clave
```
