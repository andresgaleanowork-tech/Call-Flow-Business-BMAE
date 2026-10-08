# C9 — Guía de performance

> Presupuestos **vinculantes** (se miden en el sello del bloque E y se auditan
> sobre la SPA real). Todo lo que aquí se decide ya está aplicado en lo
> construido (tokens CSS, componentes C5, mockups C7).

---

## 1. Presupuestos por página (4G medio, Moto G-power class)

| Métrica | Landing | Dashboard | Comparador | Solar |
|---|---|---|---|---|
| LCP | ≤ 1.8 s | ≤ 2.2 s | ≤ 2.2 s | ≤ 2.2 s |
| INP | ≤ 200 ms | ≤ 200 ms | ≤ 200 ms | ≤ 200 ms |
| CLS | **≤ 0.02** | ≤ 0.05 | ≤ 0.05 | ≤ 0.05 |
| JS inicial (gzip) | ≤ 35 KB | ≤ 70 KB | ≤ 70 KB | ≤ 60 KB |
| CSS total (gzip) | ≤ 12 KB | ≤ 12 KB | ≤ 12 KB | ≤ 12 KB |
| Tipografías | 2 familias / 4 pesos | 3 / 4 | 3 / 4 | 3 / 4 |
| Imágenes above-fold | 1 hero WebP ≤ 90 KB | 0 | 0 | SVG inline |

Regla maestra: **si un PR supera presupuesto, no mergea**; se autoriza solo con
justificación y compensación (quitar otra cosa).

---

## 2. Decisiones de arquitectura que ya lo garantizan

1. **Sin framework pesado en la captación pública**: landing y comparador
   sirven HTML+CSS vainilla (los mockups C7 funcionan con 0 KB de JS);
   componentes C5 (~9 KB gzip sin minificar) se cargan solo donde interactúan.
2. **Fuentes self-hosted WOFF2** (`tokens.css` los `@font-face`), `font-display:
   swap` + `preload` de los dos pesos críticos → sin bloqueo ni salto (CLS).
3. **Nada de imágenes para iconos**: Lucide inline SVG stroke-2 (mockups);
   un solo sprite por página si hiciera falta caché.
4. **Gráficas en SVG generado**, no librerías de charting de 200 KB. La
   gráfica de 36 m del dashboard son 36 `<rect>`: pesa bytes y es accesible
   (`role="img"` + `aria-label` resumen).
5. **Tabla→tarjetas** es CSS puro (@640 px), no JS de re-layout: cero coste
   de INP al rotar móvil.
6. **`content-visibility: auto`** en secciones por debajo del pliegue de
   listados largos (comparador con 40 filas, facturas 36 m) +
   paginación dura de 12 filas por defecto (C5 `crearTabla`).
7. **Fetch disciplinado**: comparador pide la comparativa con un único
   endpoint agregado (`/api/comparativa`) y muestra skeleton (C5) mientras;
   nada de N+1 por comercializadora. Caché `stale-while-revalidate` 1 h en
   tarifario (dato público, cambia a diario como mucho).
8. **Login/exchange Frappe (Bloque B)** ya es una sola llamada síncrona —
   no añadir polling: sesiones con `EventSource`/WebSocket solo en dashboard
   autenticado, con backoff si la pestaña está oculta (`visibilitychange`).

---

## 3. Imágenes (cuando existan)

- Formato: **WebP** (fotos, testimonios) con `width/height` reservados siempre
  (CLS); hero con `fetchpriority="high"`, resto `loading="lazy"` + `decoding="async"`.
- Tamaños por `srcset`: 640 / 1024 / 1536 px; nunca servir > 2× ancho del slot.
- Ilustraciones propias: SVG optimizado (svgo), ≤ 15 KB cada una.

---

## 4. Medición (sin humo)

| Momento | Herramienta | Qué se archiva |
|---|---|---|
| Cada cierre de bloque | Lighthouse CLI headless (móvil) | JSON en `audits/perf-AAAA-MM-DD.json` |
| Al tocar CSS/JS común | `wc -c` + gzip de bundles | comparación vs presupuesto §1 |
| Trimestral | WebPageTest 4G Valencia | nota en `docs/` si hay deriva |

Selección de **datos reales de campo** cuando el tráfico lo permita: beacon
`PerformanceObserver` anónimo (LCP/INP/CLS) al endpoint Frappe ya existente —
RGPD: sin cookies, sin fingerprint, agregado por URL.

---

## 5. Antipatrones prohibidos (lista negra explícita)

- ✗ Carruseles con autoplay (INP + accesibilidad + nadie pasa del slide 1).
- ✗ `position: fixed` bars que tapan contenido al hacer zoom 200 %.
- ✗ Fuentes de 6 pesos «por si acaso»; cada peso = ~20 KB.
- ✗ Frameworks CSS completos importados para usar 12 clases.
- ✗ Animaciones que no respeten reduced-motion (es defecto, no opción, §C8).
- ✗ Reintentos JS en bucle sin backoff (el toast «error de red» de C5 espera
  acción humana, no machaca).

**Criterio de hecho (C9)**: presupuestos §1 definidos y medibles, decisiones
§2 implementadas en lo ya construido, y la lista negra §5 referenciada desde
la plantilla de PR del bloque E.
