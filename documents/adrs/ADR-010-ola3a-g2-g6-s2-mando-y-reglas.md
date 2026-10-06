# ADR-010 · Ola 3(a): G2 métricas anónimas al mando + G6 presupuesto colaborativo + S2 cadena de auditoría (v4.1.1)

**Estado:** aceptada · 06-10-2026 · Ola 3(a) del plan v6 · alcance elegido por el asistente bajo **carta blanca explícita del usuario** («lo que prefieras y veas mejor», 4/4 preguntas)

## Contexto
Ola 3 «Mando y reglas» necesita primero sus datos de mando: la flota produce resultados que hoy solo llegan al panel como resumen estático (`crmPublicaResumen` → bm_*) y la actividad (`actAdd` → registro de llamadas/gestiones). El mando no tiene vista temporal comparativa ni ranking anónimo; no hay circuito de presupuestos (base del artefacto F9 de Ola 4); y los acontecimientos críticos (altas/revoques de acceso, publicaciones de catálogo, lápidas, purgas RGPD, sync masivas) no dejan rastro auditable — S2 estaba pospuesto desde ADR-002/003 y ROTACION-CLAVE.

## Decisión

### G2 · `datos/metricas-equipo.json` — estilo de trabajo anónimo por persona (repo privado)
- Escritura **automática tras cada `cliSyncPush` con éxito** (misma PAT; hook offline en tests) y manual al pulsar el chip «⇄ Equipo».
- Por comercial, una entrada *rolling* por slug: `{ts, fichas_n, act_7d (notas con fecha ≤7 días), llam_reg_7d?, pipe_eur_mes (suma €/mes en canalización viva), emb:{prep,oferta,nego,gan,per}}`.
- **Garantía RGPD por diseño (testeada)**: jamás nombres, teléfonos, ciudades ni notas de cliente — solo slug de comercial + números.

### G3 · Tarjeta «🧭 Cuadro de mando» en `admin.html`
- Lee `metricas-equipo.json` con la PAT del admin y la pinta: ranking por **actividad 7d** con barra relativa, €/mes en canalización y embudo total del equipo; sin datos → «aún sin métricas».
- No crece JS nuevo complicado: la misma grapa de las tarjetas G5 (catPinta/catMsg) re-utilizada.

### G6 · Presupuesto colaborativo v1 (`datos/presupuestos.json`, repo privado)
- Entrada: `{id:'pre'+ts, nombre (ficha o libre), ah (€/año est.), nota, est: 'bor|r ev|apr' , yo (slug), ts}` — *borrador → en revisión → aprobada*.
- Merge por id (unión total): gana el estado **más avanzado** (bor<rev<apr); empate → ts más nuevo. Sin lápida (el 🗑 solo es local por ahora, documentado; un presupuesto borrado por quien no lo creó revive — aceptado v1).
- **Vista 💶 Ofertas** dentro de Clientes (`seg 'pre'`): lista con insignia de estado, €/año y flujo 1-clic (→revisión →aprobada, 🗑); **+ manual** (nombre + €/año) y **+ desde la última simulación** (`window._simRes` del F18+ si existe) — el arma de venta ya alimenta el circuito.
- Sync: `⇄` al entrar con throttle propio (`cfb_pre_ts`) + tras cada mutación con clave (online-only online pensado en tests offline).

### S2 · Cadena de auditoría (`datos/auditoria.json`, repo privado)
- Array de hasta **500** acontecimientos `{f, h, qui, ev, det}`; cap por poda FIFO.
- **Escribe la flota** (con su PAT de equipo): `borrar` (lápida), `rgpd_purga`, `sync_masiva`. **Escribe el admin**: `catalogo_publicar`, `acceso_revocar`, `clave_publicar` (rotación). Función única `audMarca(ev,det,cb)` anteponiendo a la flota igual que el admin (mismo Contents API + PAT).
- Tarjeta «🛡 Auditoría» en admin con los últimos 20 acontecimientos.
- Fuera de alcance: firmado criptográfico/inmutable — hoy es una cadena de confianza de equipo (mejora real documentada: GitHub ya conserva el historial de commits sobre el fichero).

## Alternativas descartadas
- G2 con métricas por-día en vez de *rolling*: archivo inflable; el mando ya tiene actividad granular (📊 Gestiones) si la necesita.
- G6 como artefacto F9 completo con PDF: es Ola 4 — aquí solo el circuito voto.
- S2 cifrada por entrada: el contenido ya es metadata de mando sin PII; cifrar entorpecería la lectura directa en GitHub — misma tensión resuelta en ADR-006 para fichas.
- Lápidas para presupuestos: coherente con F5-B, pero la urna no pedía ese caso; documentado como v2.

## Consecuencias
- Dos lectores nuevos del repo privado (metrics/auditoria) aumentan el tráfico Contents API al entrar — mismo patrón ya consolidado (anti-412+409).
- El flujo RGPD compleato una deuda real: cualquier purga deja ahora rastro auditable (F7-2 + S2).
- W24 (~20 checks: estáticos pymes/residencial/admin + funcionales offline con hook: métrica sin nombres, presupuesto merge por estado más avanzado, cadena FIFO cap 500, disparadores lápida/purga/sync).
- **Versionado**: v4.1.1 · sw cfb-v374.
