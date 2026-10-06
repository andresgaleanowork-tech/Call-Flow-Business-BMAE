# ADR-001 · GitHub como backend (sin servidor)

**Fecha:** 05-10-2026 · **Estado:** Aceptada

## Contexto
El CRM/ERP del equipo debe funcionar sin servidor propio, con coste cero operativo, despliegue continuo y RGPD by design, y debe poder demostrar valor en 6-8 meses antes de decidir migración a BBDD.

## Decisión
GitHub es la plataforma completa: **Pages** como CDN de lectura de datos públicos y de los propios ficheros de la app, **Contents API** como escritura/lectura con token, **Actions** como capa de automatización (CI de datos, jobs cron, workers con secrets), **branch protection** como control de acceso del código de la app, y **repos** como unidad de tenencia (un equipo = un conjunto de repos + una clave).

## Alternativas descartadas
- Apps Script / Google Sheets: dependencia de cuenta Google, cuotas opacas, difícil de distribuir.
- Backend propio (VPS): rompe el principio sin servidor y el coste cero.
- Firebase/Supabase gratis: son ya «BBDD»; la decisión de BBDD es posterior y debe casarse con la migración documentada.

## Consecuencias
- Escritura con token fine-grained (solo `contents:read+write` en los repos del equipo).
- Los datos sensibles NO se publican en claro en el repo público: cifrado en el cliente (ADR-002/003).
- Todo lo automatizable vive en Actions con secrets; ningún secreto viaja en el código.
- Disparadores objetivos de migración a BBDD documentados y medidos (PLAN §3).
