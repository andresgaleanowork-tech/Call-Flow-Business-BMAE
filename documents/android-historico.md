# 📱 Android (retirado temporalmente) — guía de reconstrucción

El **2-10-2026** se retiró `apps/android/` del repo (proyecto WebView + APK + keystore demo) a petición del responsable: «lo desarrollaremos en un futuro». La distribución actual es **web (GitHub Pages) + EXE Windows**. En móvil se instala como **PWA** desde el navegador (ver `instalar.html`).

Este documento basta para reconstruir el APK de cero el día que toque.

## 1. Qué se eliminó

- `apps/android/proyecto/` — fuentes Java (WebView de una actividad), `AndroidManifest.xml`, `res/` (iconos), `build.sh`.
- `apps/android/Call-Flow-Business.apk` + `.idsig` + `SHA256.txt` + `keys/cfb.keystore`.
- Job «APK Android» del CI (`.github/workflows/build.yml`) y sus Líneas en Artifacts.

## 2. Último estado publicado

| Campo | Valor |
|---|---|
| Versión | **3.7.0** (versionCode **43**) |
| SHA-256 del APK | `7c0802f2a67adea07248dbc6919b37c98b656ec6fbb4ef6d075b90c8c98a41f1` |
| Firma | keystore demo `cfb.keystore` (pass `android-cfb` en ambos niveles) — **perdido con la retirada**: la app futura firmará distinto → habrá que **desinstalar** la vieja en los móviles donde esté e instalada antes de instalar la nueva (o mantener el mismo keystore si alguien conservó una copia fuera del repo) |

## 3. Reconstrucción (resumen exacto de cómo estaba montado)

1. **Toolchains**: `bash tools/setup-toolchains.sh all` (Go + JDK 21 Temurin + Android cmdline-tools con build-tools 34.0.0 y platform android-35 en `~/.local/`). El script ya sabe hacerlo todo.
2. **Estructura mínima** a recrear: `apps/android/proyecto/{AndroidManifest.xml,build.sh,res/,src/com/bm/callflow/MainActivity.java,assets/}`.
3. **Assets**: la build copiaba `apps/web/{index,admin,tutorial,actividad,pymes,residencial}.html` + logos a `assets/` (ver el build.sh histórico en ci ordens de commit o pedir regeneración).
4. **Build sin Gradle** (cadena directa, reproducible):
   - `aapt2 compile --dir res -o build/res.zip` → `aapt2 link -o build/app-unsigned.apk -I android.jar --manifest AndroidManifest.xml -A assets build/res.zip --min-sdk-version 24 --target-sdk-version 34`
   - `javac --release 11 -d build/classes -cp android.jar <src>` — ojo: **d8 8.2.2 da NPE con clases internas anónimas** → usar clases nombradas (así estaba hecho el `CfbClient`).
   - `d8 --min-api 24` → `zip -u classes.dex` → `zipalign -f -p 4` → `apksigner sign --ks keys/cfb.keystore --ks-pass pass:android-cfb --key-pass pass:android-cfb`.
5. **Keystore nuevo**: `keytool -genkeypair -v -keystore keys/cfb.keystore -alias cfb -keyalg RSA -keysize 2048 -validity 10000` (y actualizar passes en el build.sh; si el repo vuelve a ser privado interno puede viajar como antes, si no → GitHub Secrets).
6. **CI**: recrear el job del workflow con `actions/setup-java@v4` (temurin 21) + las dos líneas de sdkmanager (`build-tools;34.0.0`, `platforms;android-35`) + el build.sh + Artifacts.
7. **Manifest**: package `com.bm.callflow`, `android:versionCode` seguir de 44 en adelante, `versionName` = versión de `apps/web/version.json`.

## 4. Decisiones de producto pendientes cuando vuelva

- ¿WebView empaquetando la web (como antes) o WebView apuntando a la URL pública? Antes: empaquetada (offline total).
- El aviso de nueva versión lo lee `window.CFB_UPDATE_URL` → `version.json` (sigue funcionando).
- Minimizar permisos: la versión retirada no pedía cámara (retirada en v2.4) ni nada más que INTERNET.
