# 📱 Call Flow Business · App Android

**Qué es:** la suite completa (menú + tutorial + PYMES + Residencial) dentro de una app
Android NATIVA vía WebView. 100% offline · 560 KB · 0 permisos · icono de marca propio.

📦 **Producto final:** `Call-Flow-Business.apk` (firmado · minSdk 24 / Android 7+ · target 34)

## Instalación en cada móvil (una sola vez)
1. Pasar el .apk al móvil (Teams, correo interno o cable).
2. Al abrirlo, Android pedirá permitir *«instalar apps desconocidas»* (Ajustes → Apps → permiso
   para el origen). Eso es todo: icono «Call Flow Business» en el cajón de apps.
3. Primer arranque: menú → cada guion abre su tutorial la 1ª vez · progreso y KPIs se
   guardan EN EL TELÉFONO entre aperturas (mismas claves bm_* que en web/exe).
4. Botón atrás del móvil = página anterior (atado al historial interno, no cierra de golpe).

## Actualizar el contenido (cuando cambien los HTML de apps/web/)
```bash
cd proyecto && ./build.sh        # copia ../WEB/*.html → assets → compila → firma
```
**Obligado al publicar versión nueva:** subir `android:versionCode` (+1) y `android:versionName`
en `AndroidManifest.xml` antes de lanzar build.sh. Al firmar con el MISMO keystore, la
actualización se instala encima SIN perder el progreso del equipo.

## Fichaje técnico
- `proyecto/` — fuentes (MainActivity WebView + manifest + recursos + build.sh)
- `keys/cfb.keystore` — FIRMA DE LA APP (no borrar; sin ella no hay updates que conserven datos)
  · contraseñas de taller: storepass/keypass = android-cfb · alias = cfb
  · SHA-256 del certificado: 6dbd659b…f2bbd329d
- Toolchain del sandbox: SDK en ~/.local/android-sdk · JDK21 en ~/.local/jdk-21

## Limitaciones conocidas (honestas)
- No se ha podido ejecutar en emulador aquí (el sandbox no tiene KVM): la verificación es
  estructural (aapt2 badging + apksigner + contenido). **Hace falta instalarla en 1 móvil real**.
- WebView del diseñador = la versión de Chrome del sistema del móvil; en móviles MUY viejos
  conviene actualizar «Android System WebView» desde Play Store.
