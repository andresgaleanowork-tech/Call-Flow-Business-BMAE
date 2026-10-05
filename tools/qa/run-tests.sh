#!/usr/bin/env bash
# Suite completa, robusta al borrado de node_modules entre snapshots.
# Uso: ./tools/qa/run-tests.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
if ! node -e "require('/home/user/.deps/jsdom')" >/dev/null 2>&1; then
  echo "── reconstruyendo ~/.deps (jsdom)" >&2
  (cd apps/web && npm i --no-audit --no-fund >/dev/null 2>&1)
  mkdir -p /home/user/.deps && cp -a apps/web/node_modules/. /home/user/.deps/
fi
export NODE_PATH=/home/user/.deps
cd apps/web
node tests/bateria-qa.js           | tail -3
node tests/bateria-residencial.js  | tail -3
node tests/e2e-act.js              | tail -2
node tests/e2e-admin.js            | tail -2
node tests/e2e-maestro-admin.js     | tail -2
echo "🏁 suite completa (w �atas arriba)"
