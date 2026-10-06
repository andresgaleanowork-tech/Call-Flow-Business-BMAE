# ADR-002 · Accesos personales: clave-equipo.json multi-entrada (F13)

**Fecha:** 05-10-2026 · **Estado:** Aceptada · Ola 1(a) · v3.10.0

## Contexto
v3.8/3.9 resolvió «el personal no toca la clave real» con un blob único cifrado con **una** contraseña de equipo compartida + enlace `#eq=`. Problema: compartir una sola contraseña impide bajas y altas individuales y cualquier fuga obliga a rotarla para todos. El usuario pidió gestionar usuarios por **contraseña personal**, desde el admin.

## Decisión
`clave-equipo.json` v2 es un contenedor **multi-entrada**: cada `entradas[i] = {slug, salt, iv, data}` cifra el mismo payload (la clave real, ADR-003) con la **contraseña personal** de esa persona (PBKDF2-SHA256 ×250.000 + AES-GCM-256 por entrada).

- **Alta/reseteo**: admin (desde admin.html, con la clave real en su dispositivo) define la contraseña personal, la app del admin cifra la entrada y publica el JSON completo (GET sha → PUT).
- **Login**: tarjeta «**tu ID + tu contraseña**» (2 campos) cuando hay blob v2; se descifra SOLO la entrada del slug indicado.
- **Enlace personal**: `index.html#ap=<slug>:<contraseña>` — 1 clic, sin teclear nada salvo ID. El legado `#eq=`+blob v1 sigue funcionando (compat).
- **Cambio de contraseña propio**: desde index.html con sesión iniciada, la app recifra SU entrada (tiene la clave real local de la sesión) y publica el JSON con solo su entrada reemplazada.
- **Revocación**: el admin borra la entrada del blob (y la desactiva en equipo.json). Efecto: el dispositivo ya no puede re-descifrar tras rotación de la clave. **Honestidad**: quitar la entrada no elimina la copia que dormía en el localStorage del revocado — el cierre real para bajas sensibles es la rotación de la clave real (flujo existente), documentado en ROTACION-CLAVE.md: «baja de persona = borrar entrada + planear rotación».

## Alternativas descartadas
- Servidor de login (rompe ADR-001). · Contraseñas como hash verificable en equipo.json (solo autentica la UI, no protege la clave real: falsa seguridad). · PKI por usuario (complejidad no justificada a esta escala).

## Consecuencias
- Sin servidor sigue sin haber 2FA ni bloqueo por intentos: la defensa es PBKDF2 fuerte (250k), contraseñas de 12+ caracteres, revocación y rotación de la clave real ante incidentes.
- Cualquiera con clave real (todo el equipo) podría teóricamente alterar el blob de otros — riesgo aceptado y documentado (igual podría leer datos del equipo); la mitigación real es confianza de equipo + rotación + S2 auditoría en fases.
- Genera el valor que justifica F11 RRHH y la futura multi-clave por equipo (distribución D1-D5).
