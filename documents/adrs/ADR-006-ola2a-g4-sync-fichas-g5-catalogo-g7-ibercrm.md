# ADR-006 · Ola 2(a): G4 sync v2 de fichas + G5 catálogo compartido + G7 extractos IBERCRM (v4.0.1)

**Estado:** aceptada · 05-10-2026 · Ola 2(a) del plan v6 (definiciones del catálogo G reconstruidas y CONFIRMADAS por el usuario)

## Contexto
Ola 2 «Pipeline y arma de venta» necesita su fontanería antes de F2/F18+: (G4) las fichas deben poder viajar por GitHub cuando F5 decida privado⇄equipo; (G5) un catálogo de productos común que el pipeline multi-producto referencie por id; (G7) un puente para traerse los extractos IBERCRM al banco conservando la llave `ibe_id` creada en F1.

## Decisión

### G4 — sync v2 de fichas por GitHub (push/pull cifrado nativo, **dormant**)
- Reutiliza `maeGet/maePut` (Contents API + reintento 409 ya existente) sobre **`datos/crm-fichas.json`** del repo privado `CFB-datos-equipo`.
- **S1 se enciende AQUÍ**: `cfCifraParaSync/cfDescifraDeSync` pasan de identidad a reales — si existe `cfb_data_key` (ADR-003) y `crypto.subtle`, cada ficha viaja con sus **campos sensibles cifrados en un blob AES-GCM-256** (todo menos nombre/estado/ciudad/sector/frescura, que quedan legibles para merge y listados). Sin dk → identidad documentada (modo local sin equipo).
- **Merge por nombre**: unión de fichas; en conflicto gana la ficha **más fresca** (máxima fecha entre notas y próx. acción); empate → remora la remota. `cliSyncPush/cliSyncJala` devueltos por callback.
- **Interruptor `cfb_flag_cli_sync`** creado en **OFF**: la infraestructura queda instalada y probada pero inactiva hasta que **F5 (Ola 2d)** decida la UX privado⇄equipo. Limitación conocida v1: borrados no sincronizan (sin lápidas) — F5 lo decidirá; hoy una ficha borrada puede revivir si otro dispositivo la conserva (documentado).

### G5 — catálogo compartido de productos/servicios
- **`datos/catalogo.json` en el repo PÚBLICO de la web** (no tiene PII): lectura desde la app por **ruta relativa de Pages** (sin token), caché local 8 h, **semilla embebida** si 404 (7 productos del nicho: optimización tarifa luz 2.0TD/3.0TD·gas·solar autoconsumo·batería·mantenimiento integral·ingeniería/proyecto·comisionamiento).
- **El admin lo edita** desde su panel (tarjeta «📦 Catálogo»): filas nombre/área/activo + alta + 💾 Publicar (Contents PUT en `Call-Flow-Business-BMAE` con la misma PAT multi-repo ya requerida en v3.10).
- F2 (Ola 2b) referenciará productos por **id estable**; los ids de la semilla quedan congelados.

### G7 — extractos IBERCRM → banco compartido
- `proNorm` gana el campo **`i` (ibe_id, ≤30 saneado)** — migración-lite igual que la vacuna v4 (default `''`).
- **Importador «🟥 IBERCRM»** en Potenciales: textarea → parser tolerante (detecta `\t ; | ,`; cabeceras españolas variantes: nombre/empresa, telefono/tel/móvil, ciudad/municipio/provincia, sector/actividad, **ibe_id/código cliente**, factura/importe) → **dedupe por teléfono** dentro del pegado y contra el banco+exclusión → crea potenciales con `fuente:'IBERCRM(patrimonio)'`. El banco ya sincroniza al equipo por `datos/prospeccion.json` (repo privado).
- **`proConvertir` hereda `ibe_id:r.i`** a la ficha (además del `origen` ya heredado en v3.11): la ficha queda cruzable desde el minuto uno, base del simulador F18+.

## Alternativas descartadas
- Sync de fichas con merge por campo: demasiado pronto; v1 = ficha completa más fresca (determinista y testeable).
- Catálogo en repo privado: obligaría a leer con PAT desde la app por algo sin PII — Pages relativo es más robusto y cacheable.
- IBERCRM por subida-carga al maestro-lote: se queda opcional para una ola posterior; el banco compartido ya alcanza para el equipo.

## Consecuencias
- G4 dormido = riesgo nulo operativo; los tests (W20) lo ejercitan con `maeHook` offline y WebCrypto inyectada.
- Catálogo: datos públicos versionados (auditable en git); fallback hace la app robusta sin deploy del JSON.
- G7 cierra el círculo F1→G7: patrimonio IBERCRM llega con ibe_id hasta la ficha, listo para F18+ (simulador) sin pérdida de contexto.
