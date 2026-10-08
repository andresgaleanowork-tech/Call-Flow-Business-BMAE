# Cómo contribuir — BMAE Plataforma

Este repo es **GitHub-Total**: vive entero en GitHub (Pages + Actions +
Issues). Para contribuir no necesitas infraestructura, solo permisos y estas
normas que ya vienen escritas en el sello.

## Antes de empezar

- Lee el principio rector en `README.md` y el estado de fases en
  `docs/cierre.md`. La arquitectura viva es `docs/github-total.md`.
- Vas a tocar la superficie legal (facturación)? Lee **antes** el contrato
  §3 (SIF) de `docs/github-total.md`. La cadena VeriFactu en
  `datos/verifactu/cadena.json` es sagrada: no se edita a mano, la escribe el
  bot del SIF tras respuesta AEAT.
- Cuarentena (`_cuarentena/`): ya no existe (D4 ejecutada 08-oct-2026 con
  autorización). No regenerarla como basurero: las decisiones se documentan
  en el propio repo (`CLEANUP.md`).

## Flujo de trabajo (todo es un proceso conocido del repo)

1. **Issue primero.** Toda pieza nace como issue (`bug`, `contribución` o
   plantilla). Si involucra datos, pasa por delante por el guardián anti-PII
   (`/issues/comments`, `reg:...,... y evidencia`).
2. **Rama.** `feat/...`, `fix/...` o `docs/...` desde `main`.
3. **Sello en local ANTES de PR** (mismo que corre `clean-and-verify.yml`):
   ```bash
   pip install -e ./motor -e ./verifactu -e ./integracion -e ./auth cryptography pyyaml
   python -m pytest motor/tests verifactu/tests integracion/tests auth/tests diseno/tests limpieza
   npm --prefix "$HOME/.deps" install jsdom@24   # solo la 1.ª vez del sandbox
   NODE_PATH="$HOME/.deps/node_modules" node apps/web/tests/app.test.mjs
   # (igual para diseno/componentes y frontend-auth)
   ```
   El PR va con verde o con explicación explícita de por qué no puede.
4. **Commits.** Prefijo por módulo (`callflow:`, `verifactu:`, `docs:` …), en
   español, un tema por commit. Los commits `[bot del SIF]`/`[bot]` son del
   workflow; no se reescriben (la cadena es prueba legal).
5. **PR.** Usa la plantilla (checkbox de sello + WCAG + sin PII). Reviewable
   ≈40 min máx.; más grande → parte y plantea una ola.

## Reglas innegociables (viene ya del maestro)

- **Español** en código, docs y tests; métodos e IDs en inglés técnico.
- **WCAG 2.1 AA** en cualquier HTML/CSS/JS que toque navegador.
- **Sin PII** del navegador de un tercero: guardián anti-PII heredado; el
  repo tampoco guarda documentos/nombres reales (ofusca en tests y fixtures).
- **Prohibido `git mv`** y renombrados triviales: añaden ruido a la
  trazabilidad (usa `git mv` solo con PR dedicado y justificado).
- **Sin secretos en el repo**: certificados y tokens van en `secrets` de
  environments (ver `docs/deploy-github.md` §GitHub-Total).
- **El sello manda**: ninguna PR reduce los números de `README.md` sin
  justificarlo en la propia PR.

## Licencia

Contribuir implica aceptar `LICENSE` (propietario-BMAE, organización
interna). Si tienes dudas de IP, plantéalo en el issue antes de empezar.
