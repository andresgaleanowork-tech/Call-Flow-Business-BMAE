<!-- Plantilla de PR — sello "readonly" al reproducible. Un tema por PR. -->

## Qué y por qué

<!-- Resumen de 1-2 líneas + issue enlazado (`Closes #123`). -->

## Checklist del sello (márcala o escribe la justificación)

- [ ] **Sello reproduido en local**: `pytest` (155+) + `node` (39+) + YAML en verde, y los números de `README.md` actualizados si aplican.
- [ ] **WCAG 2.1 AA** comprobada si toco HTML/CSS/JS del navegador.
- [ ] **Guardián anti-PII**: ningún dato de cliente/tercero en código, tests, comentarios ni archivos añadidos.
- [ ] **Sin secretos**: ningún `.pem`/.p12/.env en la diff (están en `.gitignore` pero verifícalo igualmente).
- [ ] **No `git mv`, no renombrados triviales**: solo adiciones o cambios contenidos.
- [ ] Si toco **SIF/cadena VeriFactu**: he leído `docs/github-total.md` §3 y el commit de `cadena.json` NO es manual (lo hace el bot tras respuesta AEAT).
- [ ] Si toco **workflows**: `concurrency:` correcta y `permissions:` mínimos explícitos.
- [ ] ¿Dependencia nueva? — justificada (principio GitHub-Total) o declarada build-time.

## Golpea (qué revisar primero)

<!-- Por dónde empezar la review, 1-2 líneas. -->
