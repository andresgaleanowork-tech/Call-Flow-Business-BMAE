# ADR-009 · Ola 2(d): F5 privado⇄equipo (auto-ON + lápidas + ficha privada) + F7 RGPD v1 (v4.0.4)

**Estado:** aceptada · 06-10-2026 · Ola 2(d) del plan v6 · **Decisiones F5/F7 CONFIRMADAS por el usuario** (Q1-b · Q2-a · Q3-a · Q4-c)

## Contexto
Ola 2 verse en «Pipeline y arma de venta». G4 (ADR-006) quedó instalado **dormant** por diseño tras `cfb_flag_cli_sync`, con dos limitaciones documentadas que pospuso a esta ola: (a) *«F5 lo decidirá»* — si los borrados sincronizan; (b) la UX privado⇄equipo en sí. F7 «RGPD» es la capa de derechos: supresión, acceso, APD y retención.

## Decisión

### F5-A · El interruptor desaparece: sync ON ⇔ hay clave de datos (dk)
`cliSyncEstado().on` = existe `cfb_data_key` instalada (ADR-003). **Cero opciones para el comercial** (decisión del usuario): si pertenece al equipo, sus fichas viajan; si no, modo local y silencio. El flag legado `cfb_flag_cli_sync` queda **inerte** (no-op documentado; los tests antiguos que lo activaban pasan a comprobar «sin dk = dormido»).

### F5-B · Borrados sincronizan: lápidas (`datos/crm-lapidas.json`)
`{v:1, upd, lapidas:{NombreFicha:{f:'AAAA-MM-DD'}}}` en el mismo repo privado (Contents API, `maeGet/maePut`):
- `cliBorrar` queda envuelta: con sync ON apunta lápida (push de solo-lápida) y sin sync ON borra solo local (documentado).
- `cliSyncJala`: tras el merge, **aplica lápidas**: borra la ficha local si `cliFresh(local) < lápida.f` **y la ficha NO es privada 🔒**; una privada jamás la borra una lápida ajena.
- `cliSyncPush`: tras merge, las fichas bajo lápida **no viajan** (no reviven) y la lápida se Republica.
- **Poda**: lápidas ≥180 días se eliminan; cap 300 entradas.
- El borrado RGPD de una persona (F7-2) las usa de forma nativa — el derecho de supresión queda así cubierto en el equipo.

### F5-C · Ficha privada 🔒 por ficha (vacuna v5→v6)
`crmNorm` alcanza **la vacuna v6** (idempotente; v≤5 conserva absolutamente todo): cada ficha gana el campo **`privada`** saneado (`1`/`''`).
- Botón en el editor 360º «🔒 Privada» ⇄ «⇄ Compartida»: alterna el campo + repinta; la fila de Clientes muestra el icono 🔒 en su zona de metadatos.
- `cliSyncPush` **nunca envía** fichas privadas; `cliMerge` **nunca deja que una remota pise una local privada** (gestión de la clave: si la local es privada, se ignora la clave remota entera).

### F5-D · UX del interruptor
- Chip de estado en la barra de segmentos de Clientes: «⇄ Equipo: ON» (clic → push manual ahora, toast con enviadas) · «⇄ Equipo: OFF» (clic → tarjeta explicando que falta la clave de equipo; con enlace a configuración).
- **Auto-pull al abrir Clientes** (throttle 15 min, `cfb_cli_sync_ts`): ÚNICA descarga automática — las fichas del equipo aparecen sin gestos. El push antes hace pull (merge fresco) — patrón ya usado en v4.0.1.

### F7-1 · Cabecera/avisos RGPD in-app
Chip **«ℹ RGPD»** en la barra de Clientes: abre tarjeta inline con 5 líneas: (1) dónde están los datos (este dispositivo; con clave de equipo, además en el repo privado y cifrados); (2) qué sale (al admin, solo números anónimos); (3) derechos: acceso → 📤 exportador por ficha (F7-3); supresión → 🧹 borrador de persona (F7-2); (4) retención recomendada: 12 meses (la vista «Hoy» lo propone, F7-4); (5) la propuesta del simulador ya lleva el sello RGPD.

### F7-2 · 🧹 Borrado de persona 1-clic
`rgpdBuscar(q)`: recorre fichas (nombre, contactos n/tel, tel propio, normalizado tel a dígitos) y potenciales (banco) y devuelve `{fichas:[…], pro:[…]}`.
UI: tarjeta inline con campo q + Buscar → lista ambos conjuntos con sus contadores + botón «🧹 Borrar todo rastro (N fichas · M potenciales)» (doble confirmación `confirm` texto). `rgpdBorra(q)`:
- Ficha → `cliBorrar` (que, con sync ON, apunta la **lápida** F5-B; existe una sobrecarga interna que permite borrar varias sin un sync por cada una).
- Potencial → quita del banco local y, con sync del banco activo, `proBorrar` haría el push: los llamamos directamente para no depender de la sesión de prospección.
- Devuelve contadores; toast resumen.

### F7-3 · 📤 Exportar ficha (derecho de acceso / portabilidad)
`crmFichaJson(nombre)`: descarga `{nombre, exportado, ficha (crmNormada), aviso: base legal + no compartir}` como JSON (`URL.createObjectURL` + download), mismo patrón Dense del CSV. Botón «📤 JSON» en el editor junto a «📄 Oferta».

### F7-4 · Retención sugerida en «Hoy»
Sección colapsable caja amarilla **«🧹 Sobran (>12 meses)»**: hasta 5 entre:
- potenciales del banco con `act < ahora−365 días` (cualquier estado no convertido);
- fichas sin notas ni acción en 365 días (`cliFresh < hace12m`).
Cada fila lleva su edad en meses y un 🧹 que invoca el mismo flujo F7-2 para ese nombre — la retención deja de ser oscuridad y se vuelve un gesto diario.

## Alternativas descartadas
- El admin central enciende a toda la flota (Q1-c): contradice «cada uno su acceso»; la dk ya representa pertenencia al equipo, no la voluntad del admin de ese día.
- Sync con toggle manual por comercial (Q1-a): marea de estados distintos entre dispositivos del mismo equipo local.
- Lápidas solo al borrar por RGPD: deja rotos los borrados ordinarios del equipo (F5 los vuelve coherentes).
- «Todo o nada» sin ficha privada (Q3-b): hay fichas que un comercial no quiere compartir aún y era una pregunta candente; mejor respuesta explícita.
- Aviso RGPD por modal del sistema con navegación: demasiado «app fraud»; una tarjeta inline tranquila bastan.
- Retención automática sin sugerir (purgar sola): nunca sin testigo humano.

## Consecuencias
- `crmNorm` despega a **v6** → los checks históricos «vacuna v5» se pontan a v6 (los valores viejos migran sin perder nada; W18/W21 verifican indempotente).
- W20-3/W20-22 (dormido por flag) pasan a «dormido por ausencia de dk» — el flag muere documentado.
- Lápidas: nombres de fichas en claro en el repo privado (igual que en `crm-fichas.json` — no es un nuevo canal de datos).
- El sync del banco de potenciales sigue como estaba (datos/prospeccion.json) — fuera del alcance de esta ola.
- Tests-fórmula: todo campo fecha es `AAAA-MM-DD` y la poda de lápidas compara strings (determinista).
- EV0 primero: W23 (~22 checks: estáticos + funcionales con maeHook offline).
