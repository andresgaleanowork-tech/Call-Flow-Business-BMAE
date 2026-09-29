# Lanzador nativo Windows (offline)

**Qué es:** un .exe Go puro (2,8 MB) que embebe los 4 HTML y:
1. los extrae a `%LOCALAPPDATA%\Call Flow Business\` (carpeta fija → localStorage/progreso persiste),
2. abre el menú en **ventana app** (`msedge --app=` → sin pestañas; fallback Chrome / navegador predeterminado).

**Rebuild tras cambiar los HTML:** `./build.sh`

**Reparto interno:** enviar el .exe por Teams/email. Primera ejecución puede activar SmartScreen
(«Más información → Ejecutar de todos modos») por no estar firmado; firma de código eliminaría el aviso.

**Actualización:** sustituir el .exe; sobrescribe la carpeta y conserva el progreso (claves bm_*).

**Prueba en equipo:** doble clic → menú en ventana nativa → PYMES/Residencial/Tutorial navegan →
cierra y vuelve a abrir para comprobar progreso persistente.
