# 📐 PLAN-CRM/ERP — Call Flow Business: el sistema operativo del nicho energético

**v6 (blueprint) · 05-10-2026** · Base: v3.9.0 · **Estado: SOLO planificación** — sin código hasta el GO.
v6 no añade funciones: **divide el trabajo en etapas verificables** y fija el **marco de calidad y de crecimiento** para que sea «prolijo y detallista», sin regresiones y siempre ampliable. Nicho: **energía · mantenimiento eléctrico · ingeniería eléctrica · comercialización**.

---

## 0–1. Marco y referentes (sin cambios)
Colaboradores Iberdrola multi-producto (⚡·☀️·🔌·🔧·⚙️). Referentes: GHL · IBERCRM · Twenty/Espo/Suite · TuGesto · Salesforce. Principios: **sin servidor · offline-first · RGPD by design · fábrica · suite verde · mobile-first**.

## 2. Capa GitHub-native (G1–G11) · 3. Arquitectura portable →BBDD · 4. Modelo de datos — ver v5 (intactos).

## 5. Fases F1–F23/C1 (catálogo funcional, intacto de v5)
CRM: F1 base · F2 pipeline multi-producto · F3 «Hoy» · F4 automatismos · F5 privado⇄equipo · F6 informes · F7 RGPD · F8 UX. Flujo: F12 circuito + artefactos F9/F14/F15/F16 + F10 chat. Personas: F11 RRHH · F13 contraseñas. Seguridad: S1 cifrado selectivo · S2 auditoría. Nicho: **F18+ simulador factura inversa · F19 unifilar CAD · F20 checklist/visión · F21 GIS/CUPS · F22 churn/OMIE · F23 garantías-RMA · C1 WhatsApp.** Plugin diario: F17 recursos.

---

## 6. 🧱 SISTEMA DE ENTREGA (el corazón de la v6)

Cada ola se ejecuta en **5 etapas cerradas**; ninguna termina «a ojo». Cada etapa tiene entrada, salida y criterio de aceptación explícito:

| Etapa | Nombre | Salida exigible (Definition-of-Done) |
|---|---|---|
| **E0** | Diseño y ADR | ADR en `docs/adrs/` (contexto → decisión → consecuencias) + modelo de datos del módulo + pantallas en papel; **0 líneas de código** |
| **E1** | Datos y migraciones | Esquema JSON del módulo + **migrador versionado** (schema_v) probado con fixtures (importa → migra → round-trip idóntico) + vacuna de arranque |
| **E2** | Motor y adaptador | Lógica de negocio en funciones puras + adaptador de datos con contrato versionado + **tests de batería del módulo** |
| **E3** | Pantalla | UI en la app con estados: error/vacío/cargando/local/enviado-pendiente (sync cola) + traducciones ES/FR/PT/EN si aplica |
| **E4** | Sellado | **Ventana de endurecimiento** 2-3 días: solo estabilización, batería+e2e+PWA verdes, bump+sw+EXE, CHANGELOG, plan actualizado «hecho/pendiente», ADR cerrado |

**Reglas de la casa del sistema:**
- **TEST-FIRST para bugs**: todo error encontrado se convierte primero en un test que lo reproduce; el fix llega después. El error no vuelve a existir dos veces.
- **Cero código muerto**: cada etapa limpia lo suyo (lint + borrado), y `build.md` siempre sincronizado.
- **Olas cortables**: si una ola se alarga, se cierra por la mitad sana (E4 ya verde) — nunca se acumula producto a medio sellar.
- **Un sólo cambio «rompe-adaptador» por ola** (paracaídas: si algo falla, el resto sobrevive).

## 7. 🔬 MARCO DE CALIDAD — «sin errores de programación»

| Capa | Qué es | Estado |
|---|---|---|
| Q1 Convención + lint | estilo único, revisión de nombres, pantallas homogeneas, limpieza | activo |
| Q2 Batería QA | test por feature + por bug histórico | activo (560 ✔) |
| Q3 E2E jsdom | flujos completos (clave/v3.9, próx. módulos) | activo (29 ✔) |
| Q4 Migraciones | schema_v + fixtures + round-trip | patrón probado (vacuna CRM v2) |
| Q5 CI que bloquea | G1 escanea `datos/`, valide schemas, corre la batería — sin verde no hay deploy | Ola 1 |
| Q6 Ventana endurecimiento | E4: nada nuevo entra hasta que está estable en producción | desde Ola 1 |
| Q7 Telemetría de salud | latencia sync p95, 409, tamaños → panel admin | Ola 3 |

## 8. 🌱 MARCO DE CRECIMIENTO — «optimizar y seguir creciendo sin rehacer»

- **M1 Módulos por dominio**: cada F vive en su módulo con contratos internos estables (`datos.módulo.k()` por el adaptador). Añadir un módulo = registrar un archivo; quitarlo = activar flag.
- **M2 Feature flags por equipo**: `equipo.json.modulos[]` → cada módulo se enciende por equipo (clave para la **distribución D1-D5**: un colaborador puede arrancar solo con «CRM+simulador»).
- **M3 Reglas en datos, no en código**: productos, circuitos, tarifas, garantías y automatismos viven en `equipo.json`/`catalogo` → **crecer = editar datos**, no desplegar.
- **M4 Bus interno de eventos**: «oportunidad.movió», «contrato.firmó»… F4 y los avisos se enchufan a eventos — añadir comportamiento no toca los módulos.
- **M5 Contratos versionados**: adaptador v1 → v2 en BBDD sin reescribir pantallas (lo exige la propia §3).
- **M6 Presupuesto de deuda**: cada ola reserva ~15 % a refactor pequeño decidido en E4 (micro-retro: qué dolió y qué quitamos).

## 9. Roadmap por olas → **sub-hitos** (E1…E5 estándar salvo que se indique otro byte)

| Ola | Sub-hitos secuenciales (cada uno E0→E4 cerrado) |
|---|---|
| **Ola 1 · v4.0 «CRM base y plataforma»** | ✅ **(a) HECHA 05-10-2026 → v3.10.0**: F13 usuarios+contraseñas+revocar/reset+enlace personal «#ap=» + S1-infra (ADR-001/002/003; sus G8/G1/G9 siguen pendientes: avisar al usuario para activarlos en GitHub) · ✅ **(b) HECHA 05-10-2026 → v3.11.0 «Base empresarial»**: F1 ficha empresa v4 (contactos ≤8, tags ≤12, dir/cp/email/web, valor €, origen, ibe_id; editor 360º, buscador global, CSV+9 cols, origen heredado) + S1 API instalada sin encender (ADR-004; batería 607 ✔, suite 9 ficheros ✔) · ✅ **(c) HECHA 05-10-2026 → v3.12.0 «Hoy»**: F3 vista diaria unificada (vencidas/hoy/potenciales+marcador del día, acción directa) + hueco de navegación Clientes→Potenciales cerrado con barra de segmentos (ADR-005; batería 621 ✔; bug fecha-futura cazado por W19-9) · ✅ **VENTANA E4 DURA HECHA 05-10-2026 → 🏁 v4.0.0 «CRM base y plataforma» SELLADA** (batería 625 ✔, suite 9 ficheros ✔, golden D2 ✔, EXE) — **OLA 1 TERMINADA** · siguiente: Ola 2 (a) G4/G5/G7 |
| **Ola 2 · v4.1 «Pipeline y arma de venta»** | ✅ **(a) HECHA 05-10-2026 → v4.0.1 «Base de venta»**: G4 sync fichas v2 + S1 encendida (cifrado selectivo AES-GCM, **dormant** hasta F5) · G5 catálogo `datos/catalogo.json` + editor admin · G7 importador IBERCRM con ibe_id en toda la cadena hasta la ficha (ADR-006; batería 651 ✔, suite 9 ✔; G-catálogo reconstruido y confirmado por el usuario) · ✅ **(b) HECHA 05-10-2026 → v4.0.2 «Embudo por producto»**: F2 multi-producto — ficha v5 con embudo 🧩 ≤8 productos del catálogo (5 fases), editor/CRUD en la ficha, filtro+buscador, resumen anónimo por producto×fase (pc) para el admin, CSV+col, pis cifrado en S1 (ADR-007; batería 673 ✔, suite 9 ✔) · ✅ **(c) HECHA 06-10-2026 → v4.0.3 «Oferta de potencia»**: F18+ simulador de potencia (2.0TD P1-P2 / 3.0TD P1-P6) — parser de factura pegada 100 % local, regla F18-1 `ceil(demanda×(1+margen)×100)/100` con margen y precios €/kW·año editables y visibles, ahorro €/año, propuesta imprimible (guardar como PDF, sello «no salió de este móvil») y puente 💾 al embudo (tarifa20/30 📤 Ofertado, nunca baja fase) + actAdd numérico anónimo (ADR-008; batería 694 ✔, suite 9 ✔) · ✅ **(d) HECHA 06-10-2026 → v4.0.4 «Equipo y derechos»**: F5 sync auto ⇔ clave de datos (flag legado inerte) · borrados con lápidas en repo privado (poda 180d/cap 300) · ficha privada 🔒 por ficha (vacuna v6) · F7 RGPD: aviso in-app + borrado de persona 1-clic con lápida + exportar ficha JSON + retención 12 meses sugerida en «Hoy» (ADR-009, decisiones del usuario; batería 716 ✔, suite 9 ✔) · ✅ **VENTANA E4 DURA HECHA 06-10-2026 → 🏁 v4.1.0 «Pipeline y arma de venta» SELLADA** (batería 716+4 V4b ✔, suite 9 ficheros ✔, golden D2 ✔, EXE) — **OLA 2 TERMINADA** · **OLA 3 (a) HECHA → v4.1.1 «Mando y reglas» (G2/G3/G6/S2 · ADR-010 · 741✔ · sw cfb-v374)** · **(b) HECHA → v4.1.2 «Automatismos» (F4 bus+reglas · ADR-011 · W25 ✔)** · ⏸ pausa pedida por el usuario → **OLA ESTILO HECHA 06-10-2026 → v4.1.3 «Piel premium»** (skin cascada-final a las 4 superficies: sombras en capas, chips píldora, botones con degradado+elevación, foco anillado, modales suaves — marca intacta; W26 ✔) · **(c) HECHA → v4.1.4 «Informe y salud» (F6 informe semanal local + Q7 telemetría → admin · ADR-012 · W27 ✔)** · ✅ **(d) HECHA 06-10-2026 → 🏁 v4.2.0 «Tarifas vivas y riesgo» SELLADA**: G10 pool OMIE local-first — GitHub Action diaria escribe `datos/omie.json` (la app jamás habla con omie.es; caché LS 8 h, tolerante 404, modal ⚡ en el Hoy, entrada manual local) · F22 churn: `fin_contrato`/`precio_kwh` en ficha por anexión (sin bump de v — W21/W23 intactos) + `crmRiesgo` 0-100 (contrato ≤30d→50 · sin toque ≥45d→25 · >2,2× pool30→25; ✔ganadas suenan, ✘perdidas no) + sección 🧯 en Hoy + badge/banner en ficha + CSV +2 col + agregado anónimo en informe F6 + tarjeta ⚡ Pool OMIE en admin (ADR-013; batería 803 ✔, suite 9 ✔, golden D2 ✔, EXE) — **OLA 3 TERMINADA** |
| **Ola 3 · v4.2 «Mando y reglas»** | ✅ **OLA 3 TERMINADA 06-10-2026 → 🏁 v4.2.0** · (a) G2/G3/G6/S2 ✔ → (b) **F4** bus+reglas ✔ → (c) **F6** informes+salud ✔ → (d) **G10 OMIE** + **F22 churn** ✔ — detalle completo en la fila de arriba |
| **Ola 4 · v4.3 «Flujo punto a punto»** | (a) **F12** circuito+«Mi bandeja» → (b) artefactos **F9→F15→F16** (una pieza por sub-hito) → (c) **F10** chat → (d) **F20-N1** checklist → (e) **C1 v1** wa.me |
| **Ola 5 · v4.4 «Personas y dinero»** | (a) **F11** RRHH (fichajes→ausencias→portal) → (b) **F14** finanzas → (c) **F23** garantías → (d) **C1 v2/G11** Cloud API (tras Meta) |
| **Ola 6 · v4.5 «Escaparate e ingeniería»** | (a) **F21** GIS/CUPS → (b) F8 UX/F17 → (c) **D1-D5** template → (d) **F19** unifilar (cierre) |
| Decisión BBDD ~mes 6-8 | disparadores medidos (F6/Q7) |

## 10. Decisiones abiertas (v6: quedan ≠, sin nuevas)

Las 15 de v5 (catálogo, valor €, zonas, S1 en Ola 1, simulador v1 parseo local, WhatsApp escalonado, DXF «preliminar», IA-N2 post-BBDD…). Ninguna nueva: v6 solo añade *cómo* se construye, no *qué* se construye.

---
*Regla de la casa: GitHub como plataforma, cero servidor, privacidad primero, suite verde siempre, y ningún módulo sin test-first, migración probada y ADR cerrado. v6 convierte el plan en una cadena de montaje: cada pieza entra por E0 y sale por E4 verde.*
