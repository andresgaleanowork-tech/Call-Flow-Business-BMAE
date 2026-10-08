# C11 — Estructura del frontend (§12 del maestro)

> Dónde vive cada cosa cuando llegue la SPA real (bloque E/F). **No se toca
> nada de lo ya sellado** (`auth/`, `frontend-auth/`, `motor/`, `verifactu/`,
> `integracion/`, `.github/workflows/`): esta guía solo añade el árbol nuevo y las
> reglas de convivencia. Hoy `diseno/` es la fábrica; en el bloque E se
> **importa** (no se copia a mano) a `apps/web/`.

---

## 1. Árbol objetivo del repositorio

```
bmae-plataforma/
├── motor/  verifactu/  integracion/  .github/workflows/ ← sellados (A) · no tocar
├── auth/  frontend-auth/                          ← sellados (B) · no tocar
├── twenty-sdk/  datos/  e2e/                      ← previos vigentes
├── diseno/                                        ← ESTE bloque (fábrica)
│   ├── tokens/design-tokens.json                  ← fuente única
│   ├── css/  tailwind/  componentes/  tests/
│   ├── figma/  mockups/  guias/  wireframes.md
│   └── export/            ← generado (§3)
├── datos/comercial/                               ← módulo Call-Flow (integrado 07-oct)
│   ├── catalogo.json  resultados.json  LEEME.md   (guiones/<segmento>.json en F3)
└── apps/
    └── web/               ← SPA pública + panel (bloque E, Vite+vanilla)
        ├── index.html                 (landing §01)
        ├── panel/index.html           (dashboard §06)
        ├── src/
        │   ├── tokens.css  base.css   ← importados de diseno/export
        │   ├── componentes/           ← importados de diseno/export
        │   ├── paginas/
        │   │   ├── captacion.js       (§03 asistente 3 pasos)
        │   │   ├── comparador.js      (§04)
        │   │   ├── alta.js            (§05)
        │   │   ├── dashboard.js       (§06)
        │   │   ├── suministro.js      (§07)
        │   │   ├── solar.js           (§08)
        │   │   ├── facturas.js        (§09)
        │   │   ├── gestor.js          (§10, rol gestor)
        │   │   └── callflow.js        (§11, rol comercial — guiones por segmento)
        │   ├── lib/
        │   │   ├── api.js             (fetch al endpoint Frappe, ver §4)
        │   │   ├── sesion.js          (reusa frontend-auth, §4)
        │   │   └── honesto.js         (sello honesto: meses reales vs estimados)
        │   └── main.js
        └── tests/                     (node --test, patrón B ya validado)
```

## 2. Reglas de estructura (vinculantes)

1. **Una página = un módulo** en `paginas/` que exporta `montar(el)` y usa solo
   fábricas de `componentes/`. Prohibido HTML inline en strings de los
   módulos de página (se compone DOM con las fábricas C5).
2. **Estado mínimo y local**: sin store global tipo Redux. La URL es el estado
   principal (rutas hash `#/comparador`); cada página pide sus datos al
   montar y muestra skeleton (§9) mientras.
3. **Rutas públicas vs privadas**: `#/` landing y `#/alta` públicas; el resto
   exige sesión (sesion.js comprueba al montar y redirige a `#/entrar`).
   El panel gestor `#/gestor` exige rol `gestor` (claim del exchange B).
4. **Datos numéricos** siempre en clase `.datos` (tabular-nums), fechas es-ES
   (`Intl.DateTimeFormat("es-ES")`), moneda `Intl.NumberFormat("es-ES",
   {style:"currency",currency:"EUR"})` — nunca concatenar «"€"» a mano.
5. **Toda cifra derivada de consumo** pasa por `lib/honesto.js`, que devuelve
   `{valor, mesesReales, mesesEstimados}`; la UI pinta el sello (C10 §3) con
   esos campos. Es imposible mostrar la cifra sin saber su procedencia.

## 3. Puente fábrica → SPA (`diseno/export/`)

El cierre de este bloque genera (script en `tests/`, sin magia manual):

```
diseno/export/
├── tokens.css            (copia verificada 1:1 de css/tokens.css)
├── base.css
├── components.css
└── componentes.js        (firma SHA-256 en el sello)
```

`apps/web` **enlaza estos archivos** (copia con hash comprobada en CI del
bloque E). Regla: si hay que cambiar un color o un componente, se cambia en
`diseno/` + tests, y se regenera el export. Nunca se edita `apps/web/src/…css`
a mano — así tokens, tests de contraste y código nunca divergen.

## 4. Contratos con backend (ya sellados, se reusan tal cual)

| Necesidad UI | Backend | Decisión vigente |
|---|---|---|
| Login / magic link / sesión SPA | `frontend-auth/` + endpoint Frappe | exchange síncrono D-B1 (sin tokens en cliente público) |
| Lectura de PDF factura (36 m) | `motor/` (treceo 3 piezas, decisión usuario) | resultado con sello `{reales, estimados}` |
| Comparativa | `motor/` vía endpoint agregado | una llamada, caché SWR 1 h (C9 §2.7) |
| Emitir/registrar facturas | `verifactu/` | estados ◌/✓/✗ con reintento visible (§09) |
| CRM pedidos/etapas | `twenty-sdk/` + `.github/workflows/` | drag&drop → workflow 24 (§10) |
| Datos personales | `integracion/` | borrado RGPD a petición (C10 §1) |

## 5. Lo que NO se construye aquí (alcance explícito)

- SSR/SEO framework: V1 es HTML estático por página pública (mockups C7 son
  su referencia); el panel no necesita SEO.
- PWA/offline: solo `manifest` básico en F; sin service worker en V1
  (riesgo de cachés raras en facturación > beneficio).
- Multi-idioma real: estructura preparada (C10 §5), ejecución fuera de V1.

**Criterio de hecho (C11)**: árbol §1 acordado, reglas §2–§4 no contradicen
ningún sello previo (A/B intactos), y `diseno/export/` queda listo para
importar en E sin edición manual.
