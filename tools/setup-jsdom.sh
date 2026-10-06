#!/usr/bin/env bash
# setup-jsdom.sh — (re)instala jsdom de forma idempotente en ~/.deps/node_modules.
# Uso: bash tools/setup-jsdom.sh
# Los tests lo resuelven con NODE_PATH=$HOME/.deps/node_modules
# (el snapshot de sesión excluye node_modules y puede mutilar ~/.deps entre mensajes:
#  si jsdom no carga, basta re-ejecutar este script — es idempotente y no toca código).
set -e
D="$HOME/.deps"
if [ -d "$D/node_modules/jsdom" ]; then echo "jsdom ya presente en $D/node_modules ✔"; exit 0; fi
mkdir -p "$D"
echo "instalando jsdom en $D (npm --prefix)…"
npm install --prefix "$D" --no-audit --no-fund --loglevel=error jsdom
echo "jsdom listo: NODE_PATH=$D/node_modules"
