# Plan — Base maestra de prospectos (33k) · Call Flow Business
_Estado: APROBADO el diseño (2026-10-01) · Aún no se implementa nada_
_Binarios vigentes al redactar: v3.4.0 «Sesión»_

## Decisiones cerradas (usuario, 2026-10-01)
1. **Maestro en el repo de datos troceado** (CFB-datos-equipo), no en Google Sheet ni dentro del binario.
2. **Cada comercial se sirve** de la cola libre, con anti-pisotón: primera reclamación gana el número.
3. **Lista de exclusión sincronizada** (mismo patrón que el banco — la excepción a privacidad ya autorizada se extiende a este fichero, SOLO teléfonos normalizados + motivo, sin notas de persona).

⚠️ Condición persistente: la clave del repo está incrustada en los binarios. Mientras el APK/EXE sean uso **interno** vale; el día que se reparta fuera (punto 12 pendiente) EXIGE mover maestro+exclusión fuera del alcance de esa clave o girar las credenciales.

## Arquitectura (4 niveles)

```
MAESTRO (33k, estático)  →  reclama →  BANCO compartido (≤500)  →  CRM local
datos/maestro/*.json        atómico      datos/prospeccion.json      dispositivo
                exclusiones.json (aplica en los 3 niveles)
```

### Ficheros nuevos en el repo de datos
| Fichero | Contenido | Tamaño aprox. | Acceso |
|---|---|---|---|
| `datos/maestro/idx.json` | Índice ligero: puñados disponibles por provincia/sector (contadores, sin teléfonos) | <60 KB | GET por dispositivo al abrir «Reponer» |
| `datos/maestro/lote_XXX.json` | 500 prospectos / lote, agrupados por provincia×sector: `{id,n,tel,c,p,s,st(lbe:libre/rec/rec*),owner,ts,fuente}` | ~55 KB × 66 lotes | GET solo del puñado reclamado |
| `datos/maestro/informe.json` | Resumen del último import: únicos, dups, por provincia, sectores top, dudosos | <20 KB | Panel Admin |
| `datos/exclusion.json` | `tel→{m: motivo, ts, by}` ("no llamar más", "número erróneo", "fuera de segmento") | pequeño y lento | GET al arrancar + PUT al marcar |
| `datos/prospeccion.json` | banco vivo (ya existe, se mantiene con su límite 500 activos) | ~60 KB | ahora |

### Regla de tamaño inviolable
Ningún dispositivo descarga 33k nunca: máximo índice (60 KB) + un puñado (55 KB) a la vez. El sync del banco se mantiene pequeño.

## Carga (import del Excel)
Pipeline en `tools/importa-maestro.py` (local, en el repo — se ejecuta a mano por el jefe, una vez por tanda nueva):
1. **Entrada**: CSV `;` exportado del Excel/Sheet (columnas: `Nombre;Teléfono;Pueblo;Provincia;Sector;Nota_origen`), UTF-8 BOM.
2. Normaliza teléfono = 9 dígitos finales (mismo `proTelN` que la app), marca dudosos (longitud, prefijo).
3. **Dedupe** dentro del propio Excel → probable colapso notable de 33k.
4. Dedupe contra banco + convertidos activos + **exclusión** (no resucita "no llamar más").
5. Trocea en lotes de 500 por provincia×sector; sube lotes + índice + informe (PUT por fichero, mismas credenciales de hoy, idempotente por nombre).
6. Informe accionable antes de tocar nada en el app.

## Gestión operativa (app)
- **📥 Reponer**: chip en Potenciales (junto a 🔥 Sesión). Muestra solo puñados libres del índice (por tu pueblo/sector, con contadores). "Servirme este puñado" → marca `st:rec + owner + ts` (PUT atómico del lote, con fusión y reintento ante 409 — mismo patrón sha) e inserta en el banco como `fuente:'lote-NNN'` respetando: no-dup, no-exclusión, tope 500 («libera N del banco» si no cabe).
- **Ciclo cerrado**: convertir/descartar libera hueco → «📥 Reponer» sigue teniendo sentido siempre.
- **Descartado dual**: al marcar «Descartado» pregunta: *¿No llama más?* → si sí, añade su teléfono a `exclusion.json` (sync) y queda fuera de futuras importaciones y reposiciones. Si solo «hoy no», se queda con su purga normal de 90 d.
- **Exclusión en el banco**: se aplica al arranque — si un teléfono activo entra en exclusión por otro dispositivo, se marca ⚫ en la próxima sincronización.

## Exportaciones
1. **Banco vivo → CSV** ✅ (hecho en v3.4.0).
2. **Resultados por lote → CSV** (admin): por lote → intentos, CE, conversión, pendientes, y por provincia agregado → retroalimenta el Sheet de back-office y decide la siguiente tanda.
3. **Volcado maestro con marcadores** (admin): para reconciliar el Excel madre cada N semanas (manual; sin credenciales nuevas).

## Fases de implementación
- **Fase 1 (v3.5.0)** — fundamento: `tools/importa-maestro.py` + esquema JSON + `exclusion.json` sincronizada + descartado dual («¿No llama más?») + chip «📥 Reponer» con sello de provincia + anti-pisotón atómico. W16 en baterías, docs, binarios.
> **✅ COMPLETADA 01-10-2026** — v3.5.0 publicada (APK vc40 + EXE + sw cfb-v350), W16 verde en batería (12 funcionales), importador con dry-run validado.
- **Fase 2 (v3.6.0)** — panel Admin: card «🏛 Maestro» (informe de import, contadores por lote y conversión) + export lote→CSV + vista de exclusión.
> **✅ COMPLETADA 01-10-2026** — v3.6.0: tarjeta Maestro en admin (totales/barras/puñados/detalle-owners/CSV sin teléfonos + exclusión por motivo + informe), E2E maestro-admin 22 ✔.
- **Fase 3 (posterior)** — aprendizaje: métricas de conversión por lote/sector para ordenar las siguientes tandas; opcional sincronización con Google Sheet vía Action con credenciales (decisión aparte).

## Riesgos vigilados
- Clave incrustada ↔ maestro en repo: aceptado internamente; bloquea nº12 hasta desacoplarlos.
- Conflicto de reclamación simultánea: resolver por fusión temporal (gana ts menor); el resultado fuerza re-fetch antes de insertar en banco (el perdedor ve el puñado como tomado).
- RGPD: exclusión solo teléfonos; nombres maestros viven solo en el repo privado de la casa + Sheet interno.
