#!/usr/bin/env bash
# ═══ Reinstala en ~/.local los toolchains de los binarios (idempotente) ═══
# Libera Go 1.23 (EXE), JDK 21 + SDK cmdline-tools + build-tools34 + android-35 (APK).
# Uso: ./tools/setup-toolchains.sh            — baja lo que falta
#      ./tools/setup-toolchains.sh apk|exe    — solo un lado
set -euo pipefail
cd "$HOME"
QUE="${1:-all}"
mkdir -p "$HOME/.local"   # ~/.local queda fuera de snapshots: puede no existir tras restaurar
say(){ printf '\n── %s\n' "$*"; }

if [[ "$QUE" == "apk" || "$QUE" == "all" ]]; then
  if [[ ! -x "$HOME/.local/jdk-21/bin/javac" ]]; then
    say "JDK 21 (Adoptium Temurin)"
    mkdir -p "$HOME/.local/jdk-21"
    curl -sL --retry 3 -o /tmp/jdk21.tgz "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse"
    tar -xzf /tmp/jdk21.tgz -C "$HOME/.local/jdk-21" --strip-components=1
    rm -f /tmp/jdk21.tgz
  fi
  if [[ ! -x "$HOME/.local/android-sdk/cmdline-tools/latest/bin/sdkmanager" ]]; then
    say "Android cmdline-tools"
    mkdir -p "$HOME/.local/android-sdk/cmdline-tools"
    curl -sL --retry 3 -o /tmp/cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    (cd "$HOME/.local/android-sdk/cmdline-tools" && rm -rf cmdline-tools latest && unzip -q /tmp/cmdtools.zip && mv cmdline-tools latest)
    rm -f /tmp/cmdtools.zip
  fi
  export PATH="$HOME/.local/jdk-21/bin:$PATH" ANDROID_SDK_ROOT="$HOME/.local/android-sdk"
  yes | "$HOME/.local/android-sdk/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true
  "$HOME/.local/android-sdk/cmdline-tools/latest/bin/sdkmanager" "build-tools;34.0.0" "platforms;android-35" >/dev/null
fi

if [[ "$QUE" == "exe" || "$QUE" == "all" ]]; then
  if [[ ! -x "$HOME/.local/go/bin/go" ]]; then
    say "Go 1.23.4"
    curl -sL --retry 3 -o /tmp/go.tgz "https://go.dev/dl/go1.23.4.linux-amd64.tar.gz"
    tar -xzf /tmp/go.tgz -C "$HOME/.local"
    rm -f /tmp/go.tgz
  fi
fi

say "toolchains listos:"
"$HOME/.local/go/bin/go" version         2>/dev/null || true
"$HOME/.local/jdk-21/bin/javac" -version 2>/dev/null || true
[[ -x "$HOME/.local/android-sdk/build-tools/34.0.0/aapt2" ]] && echo "aapt2 34.0.0 ✔"
