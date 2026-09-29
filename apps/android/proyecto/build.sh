#!/usr/bin/env bash
# ═══ Build Call-Flow-Business.apk sin Gradle (cadena mínima SDK) ═══
# Uso: ./build.sh     (una vez existe SDK en ~/.local/android-sdk y JDK21 en ~/.local/jdk-21)
# NOTA v2.3.2 (CAZA#A3): cfb.keystore y su contraseña viajan en el repo A PROPÓSITO (repo privado interno,
#   firma de reparto "demo"). Si el repo se hiciera público algún día → rotar keystore y mover el pass a secrets.
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_SDK_ROOT:-$HOME/.local/android-sdk}"; BT="$SDK/build-tools/34.0.0"; AJAR="$SDK/platforms/android-35/android.jar"
export PATH="${JDK_HOME:-$HOME/.local/jdk-21}/bin:$PATH"
JAVAC="${JDK_HOME:-$HOME/.local/jdk-21}/bin/javac"

echo "── 1· copiar web → assets"
cp ../../web/index.html ../../web/admin.html ../../web/tutorial.html ../../web/pymes.html ../../web/residencial.html assets/
cp ../../web/logo-iberdrola.png ../../web/logo-bm.png assets/

echo "── 2· aapt2 link (recursos + manifest + assets)"
rm -rf build && mkdir -p build/classes build/dex
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/app-unsigned.apk \
  -I "$AJAR" --manifest AndroidManifest.xml \
  -A assets build/res.zip \
  --min-sdk-version 24 --target-sdk-version 34

echo "── 3· javac"
$JAVAC --release 11 -d build/classes -cp "$AJAR" $(find src -name '*.java')   # d8 8.2.2 NPE con clases internas anónimas: usar --release y clases nombradas (CfbClient); v2.4: sin CfbChrome (cámara retirada)

echo "── 4· d8 → classes.dex"
"$BT/d8" --min-api 24 $(find build/classes -name '*.class') --output build/dex >/dev/null

echo "── 5· empaquetar + alinear + firmar"
cp build/app-unsigned.apk build/app-dex.apk
(cd build/dex && zip -q -u -X ../app-dex.apk classes.dex)
"$BT/zipalign" -f -p 4 build/app-dex.apk build/app-aligned.apk
"$BT/apksigner" sign --ks ../keys/cfb.keystore --ks-pass pass:android-cfb \
  --key-pass pass:android-cfb --out ../Call-Flow-Business.apk build/app-aligned.apk >/dev/null

echo "── 6· verificación"
"$BT/apksigner" verify --print-certs ../Call-Flow-Business.apk | grep -o "SHA-256.*" | head -1
echo "✔ ../Call-Flow-Business.apk ($(du -h ../Call-Flow-Business.apk | cut -f1))"
