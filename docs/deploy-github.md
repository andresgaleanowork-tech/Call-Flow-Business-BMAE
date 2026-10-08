# Deploy a GitHub — checklist operativa (07-oct-2026)

El repo ya está **push-ready**: rutas 100 % relativas, `.nojekyll`, workflows
en `.github/workflows/` (validados 9/9), sin build ni dependencias de runtime.
Quedan 3 gestos en la web de GitHub (ninguno es código).

## 1 · Publicar el sitio (elige UNO de los dos modos)

### Opción A — Actions con sello bloqueante (recomendada)
Publica solo si pasan 147 pytest + 36 node + export SHA-256 + YAML (`.github/workflows/pages.yml`).

1. Repo → **Settings → Pages**.
2. **Build and deployment → Source**: elige **«GitHub Actions»** (no «Deploy from a branch»).
3. Haz `git push origin main` (o **Actions → pages-deploy → Run workflow**) y espera el ✅.
4. La URL aparece en el propio workflow (`pages_url`): `https://<usuario>.github.io/bmae-plataforma/`.

### Opción B — Deploy from branch (clásica, sin puerta de tests)
1. Settings → Pages → Source: **«Deploy from a branch»** → Branch: **`main`**, carpeta **`(root)`** → Save.
2. Publica lo que haya en `main` al instante (los workflows siguen validando en CI, pero no bloquean la publicación).

> **No actives ambos**: con «GitHub Actions» como Source, la Opción B queda anulada; con «Deploy from a branch》, el job `publicar` de pages.yml fallará por no tener Pages habilitado para Actions.

## 2 · Alta de la OAuth App (login B, GitHub-native)

El `client_id` de una OAuth App **es público** (viaja en la URL de autorización), el **secret jamás** entra al repo: va en Secrets y lo usa `auth-exchange.yml` en servidor.

1. GitHub (avatar) → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Campos exactos:
   - **Application name**: `BMAE Plataforma`
   - **Homepage URL**: `https://<usuario>.github.io/bmae-plataforma/`
   - **Authorization callback URL**: `https://<usuario>.github.io/bmae-plataforma/frontend-auth/callback.html`
     (la ruta la compone sola desde `login.html:129`, relativa = funciona igual con dominio propio)
3. **Register application** → copia el **Client ID** y crea un **Client Secret**.
4. Inyecta el Client ID en el repo (placeholder documentado, `frontend-auth/login.html:128`):
   ```bash
   sed -i "s/__GITHUB_OAUTH_CLIENT_ID__/<CLIENT_ID>/" frontend-auth/login.html
   git add frontend-auth/login.html
   ```
   (sed → dif visible en el commit; al ser id público, se commitea sin problema.)

## 3 · Secrets y variables del repo (para los workflows de auth)

Repo → **Settings → Secrets and variables → Actions**:

| Tipo | Nombre | Qué es | Lo usan |
| :-- | :-- | :-- | :-- |
| Variable | `GITHUB_OAUTH_CLIENT_ID` | el Client ID del paso 2 | auth-exchange |
| Secret | `GITHUB_OAUTH_CLIENT_SECRET` | el Secret del paso 2 | auth-exchange |
| Secret | `AUTH_PRIVATE_KEY_PEM` / `AUTH_PUBLIC_KEY_PEM` | par de claves del JWT sellado (bloque B §4) | exchange · refresh · revoke |
| Secret | `GIST_TOKEN` | PAT de solo-gist de la cuenta de servicio (rama de contingencia) | exchange · refresh · revoke |
| Secret | `DENYLIST_GIST_ID` | id del Gist de denylist (revocación) | refresh |

> ¿Dudas de dónde sale cada cosa? `docs/autenticacion.md` documenta el flujo B1–B3 campo a campo.

## Fichas de identidad del repo (gestos humanos — 2 min, nunca código)

Tras el primer push, completa la tarjeta pública del repo en GitHub:

1. **Settings → General**: *Description* — «Plataforma corporativa GitHub-Total: SPA + SIF VeriFactu en Actions + CRM por Issues. 0 servicios externos alojados.»
2. *Topics*: `verifactu`, `billing`, `spa`, `github-actions`, `español`.
3. **Settings → Branches → main** *(protección, recomendado)*: require PR + 1 review (la zona legal ya la fuerza CODEOWNERS), require status checks (`clean-and-verify`).
4. *License*: no seleccionar plantilla — este repo usa `LICENSE` propietaria propia (verbatim en raíz). GitHub mostrará «View license».

## Verificación post-gestos (2 min)

1. `https://<usuario>.github.io/bmae-plataforma/` carga la landing; `#/comparador` monta el sello honesto; el botón **Entrar** redirige a GitHub para autorizar.
2. **Actions**: los 11 workflows aparecen y `clean-and-verify` + `pages-deploy` en ✅.
3. En `frontend-auth/login.html` ya no aparece `__GITHUB_OAUTH_CLIENT_ID__` (grep).

## Lo que NO se despliega en GitHub (por diseño §2 de `docs/contencion-github.md`)

- **`_cuarentena/`**: ya no existe — D4 ejecutada el 08-oct-2026 con autorización expresa; inventario previo en `docs/historico/d4-inventario-destruido.txt`.
- El plan VPS/ERPNext/Twenty quedó **inerte** (GitHub-Total, 07-oct): no hay servicios externos alojados que desplegar, solo configurar lo siguiente.

---

## GitHub-Total (opción B, 07-oct) — gestos en el repo ANTES de la primera emisión

Contrato completo y números: [`docs/github-total.md`](docs/github-total.md).
Esto reemplaza cualquier despliegue V1 «funcionando» basado en VPS.

### 1) Certificado AEAT (OBLIGATORIO para emitir; no se ejecuta nada sin él)

1. Obtén el **certificado electrónico cualificado** (p. ej. FNMT-RCM, representante de la sociedad emisora) en formato `.p12` y su contraseña.
2. Ábrelo localmente (jamás lo subas en claro ni lo pegues en un issue):
   ```bash
   openssl pkcs12 -in certificado.p12 -out /tmp/cert.pem -clcerts -nokeys
   openssl pkcs12 -in certificado.p12 -out /tmp/key.pem  -nodes -nocerts
   base64 -w0 /tmp/cert.pem > /tmp/cert.b64 && base64 -w0 /tmp/key.pem > /tmp/key.b64
   ```
3. Repo → **Settings → Environments**: crea `verifactu-preproduccion` y `verifactu-produccion`.
   - En **`verifactu-preproduccion`**: secrets `AEAT_CERT_PEM`, `AEAT_KEY_PEM` (contenido de los `.b64`).
   - En **`verifactu-produccion`**: los mismos secrets + activa **Required reviewers** (2 personas). Sin esto, cualquier label `verifactu:emitir-produccion` dispararía producción sin gesto humano.
   > Importante: los secrets viven en los **environments**, NO en los secrets del repo, para que el base PEM nunca salga de ahí. Borra los ficheros `/tmp/*.pem`/`.b64` tras pegarlos.

### 2) Buzón de la cola Call-Flow (1 issue de alojamiento, fijado)

1. Repo → Issues → nuevo issue, título «**BUZÓN COMERCIAL**», cuerpo:
   «**Este issue es el contrato §4 (docs/github-total.md). Los comentarios JSON de la SPA materializan gestiones en el pipeline. Solo Owner/Member/Collaborator.**»
2. Fíjalo (*pin issue*) y anota su número (por defecto la SPA usa el **`#1`** del repo de operación).
3. En `apps/web/src/lib/canalgithub.js` cumplimenta `REPO_OPERACION = "tu-org/tu-repo-operacion"` (privado — los comentarios son datos comerciales, §4).

### 3) Labels necesarias (crear una vez)

```
verifactu:emitir · verifactu:emitir-produccion · verifactu:registrada · verifactu:error
pipeline · canal:callflow · segmento:* · resultado:* · estado:contactada · estado:propuesta · estado:ganada · estado:perdida
canal:solar · estado-solar:visita · estado-solar:presupuesto · estado-solar:instalacion · estado-solar:garantia · visita:AAAA-MM-DD
canal:incidencia · estado-inc:abierta · estado-inc:en-curso · estado-inc:espera-pieza · estado-inc:resuelta · compromiso:AAAA-MM-DD (SLA)
```
(Actions crea `pipeline`/`canal:*` al primer uso y el resto al etiquetar; crearlas de antemano es opcional pero recomendable.)

### 4) Primera emisión (prueba, preproducción)

1. Issues → **New issue → 🧾 Factura VeriFactu** (la plantilla incluye el JSON).
2. Añade label **`verifactu:emitir`**. En ~30–60 s el workflow comenta con la huella, el QR de cotejo y la respuesta AEAT; el bot commitea `datos/verifactu/cadena.json`.
3. Para producción: cambia a **`verifactu:emitir-produccion`** y aprueba en el environment.

### 5) Login (wave F4G·w2) — OAuth App con Device Flow

El login ya NO es el esqueleto Frappe/B: es **device flow nativo en la SPA**
(`#/login`, `lib/ghdevice.js`). Solo falta el gesto humano de crear la OAuth App:

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - *Application name*: `BMAE Plataforma (device flow)`; *Homepage URL*: la Pages del repo.
   - *Authorization callback URL*: cualquier URL válida (device flow no la usa; requerida por el formulario).
2. En la app creada, marca **«Enable Device Flow»**.
3. Copia el **Client ID** (público; device flow no usa secret) y pégalo en:
   - `apps/web/src/lib/ghdevice.js` → `CLIENT_ID`, y
   - `apps/web/src/lib/canalgithub.js` → `REPO_OPERACION = "tu-org/tu-repo-operacion"` (privado).
4. Verificación E2E: entra a `#/login` → «Conectar GitHub» → aparece el user-code → lo apruebas en github.com/login/device → toast «✓ GitHub conectado» y el botón «Enviar al CRM» del Call-Flow ya funciona. Si GitHub pincha CORS desde el navegador (Apps antiguas), vuelve el estado honesto — en ese caso la ruta manual `Exportar JSON` sigue siendo la operativa.
