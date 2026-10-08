# Política de seguridad

## Cómo reportar (canal privado)

- **Gestión legal/operativa** (VeriFactu, facturación, ficha cliente):
  issue **privado** con etiqueta `seguridad` — nunca el título con nombre
  fiscal, CIF ni consumo de terceros.
- **Código/arquitectura**: issue privado con etiqueta `seguridad` o contacto
  directo con la dirección técnica. Este repo es privado por diseño; no hay
  comunidad abierta, no hay bounty público. Plazo de respuesta: **48 h**
  laborables para triage; corrección según severidad con sello (`Severity`).

## Fuera de alcance

- Bugs de GitHub/Actions/AEAT: se reportan a sus propios canales.
- Contenidos estáticos sin credenciales (los demás los rechazamos antes).
- Libreces estándar (X-Content-Type-Options en Pages, etc.): caída del
  índice por cacheo ≠ incidente.

## Principios activos (ya sellados en el repo)

- **Sin secretos en git**: `.gitignore` cubre `*.pem`, `*.p12`, `.env*`;
  rotación documentada en `docs/autenticacion.md`. Si un secreto entrara en
  un commit → revocación inmediata + history rewrite **solo** con PR rotulado.
- **Menos privilegio por defecto**: los workflows usan el `GITHUB_TOKEN`
  de acciones y permisos mínimos por job (`permissions:` explícito).
- **Defensa en profundidad PII**: guardián en navegador (JS) **y** guardián
  server-side en la ingesta (`cola_ingest.py`): mismo regex, dos fronteras.
- **La cadena VeriFactu es evidencia legal**: `concurrency: verifactu-cadena`
  serial todo acceso de escritura; commits `[bot del SIF]` no se reescriben.
