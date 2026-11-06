#!/usr/bin/env bash
# Renders tools/store-assets/handout.html to docs/handout.pdf with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --allow-file-access-from-files \
  --print-to-pdf=docs/handout.pdf "file://$PWD/tools/store-assets/handout.html" >/dev/null 2>&1
echo "docs/handout.pdf written"
