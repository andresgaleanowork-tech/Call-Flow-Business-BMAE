#!/usr/bin/env bash
# Rebuild «Call Flow Business.exe» — tras editar los HTML en apps/web/:
#   ./build.sh        (requiere Go en PATH, p. ej. export PATH=$HOME/.local/go/bin:$PATH)
set -euo pipefail
cd "$(dirname "$0")"
cp ../../web/index.html ../../web/tutorial.html ../../web/pymes.html ../../web/residencial.html assets/
cp ../../web/logo-iberdrola.png ../../web/logo-bm.png assets/
go vet .
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-H windowsgui -s -w" -o "../Call-Flow-Business.exe" .
echo "✔ ../Call-Flow-Business.exe regenerado"
sha256sum "../Call-Flow-Business.exe" | tee ../SHA256.txt
