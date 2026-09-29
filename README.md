# Call Flow Business — Workspace

> Estructura reordenada el **16-09-2026** (reestructuración arquitectónica completa).
> Estado vigente: **v2.9.0 «Babel» · idiomas ES/FR/PT por sesión · 225/225 + 58/58 + 13/13 visual · 0 errores JS**.

```
/
├── apps/
│   ├── web/        ← el sitio (GitHub Pages): index/pymes/residencial/tutorial/admin/instalar
│   │                 + sw.js, manifest, version.json + tests/ (batería QA) + PNG de marca
│   ├── android/    ← Call-Flow-Business.apk + proyecto/ (fuentes WebView, build.sh) + keys/cfb.keystore ⚠️
│   └── windows/    ← Call-Flow-Business.exe + «Call Flow Business (firmado).exe» + lanzador/ (Go) + firma/
├── tools/
│   ├── factory/    ← build.js + plantillas/ + contenido/  →  node tools/factory/build.js [--check]
│   └── qa/         ← utilidades puntuales de caza de bugs
├── docs/           ← PLAN-IMPLEMENTACION, auditorías, firma EXE, sync GitHub, emails, pruebas
└── .github/workflows/build.yml  ← CI: tests → EXE firmado + APK + Artifacts
```

## Comandos clave

| Qué | Comando |
|---|---|
| **Tests** (203+58) | `cd apps/web && npm install && npm test` |
| **Regenerar guiones** desde contenido | `node tools/factory/build.js` (`--check` = solo verificar) |
| **APK** | `cd apps/android/proyecto && ANDROID_SDK_ROOT=… JDK_HOME=… bash build.sh` (SDK 34.0.0 + JDK21) |
| **EXE** | `cd apps/windows/lanzador && GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-H windowsgui -s -w" -o "../Call-Flow-Business.exe" .` |
| **Firmar EXE** | `osslsigncode sign -pkcs12 apps/windows/firma/demo.pfx -pass cfbdemo -n "Call Flow Business" -in Call-Flow-Business.exe -out "Call Flow Business (firmado).exe"` |

## Reglas de oro (no negociables)

1. **`tools/factory` es la fuente de verdad** de pymes/residencial: se edita `plantillas/` + `contenido/`, nunca el HTML generado a mano.
2. Tras cada versión: batería verde + `CHANGELOG.md` + `PLAN-IMPLEMENTACION.md` + SHAs + bump `versionCode/versionName` + `sw cfb-vXXX`.
3. `apps/android/keys/cfb.keystore` **no se toca ni se pierde**: sin ella no hay actualizaciones.
4. Toolchains (Go/JDK/SDK) se descargan a `.cache/toolchains/` (nunca `/tmp` — se llena) y **se borran al terminar**.
5. Historial de versiones: `apps/web/CHANGELOG.md`. Esta reestructura no cambió producto (sigue siendo v2.7.6).
