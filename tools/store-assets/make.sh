#!/usr/bin/env bash
# Regenerates the Chrome Web Store graphics in docs/store/ from the current build.
# Needs: Google Chrome (override with CHROME=...), Python 3, npm. Uses demo data only.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${PORT:-8791}"
WORK="tools/store-assets/.work"
OUT="docs/store"

npm run build >/dev/null
rm -rf "$WORK"; mkdir -p "$WORK/shots" "$OUT"
cp -R dist/. "$WORK/"
cp tools/store-assets/harness.html "$WORK/harness.html"

(cd "$WORK" && python3 -m http.server "$PORT" >/dev/null 2>&1) &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1

shoot() { # name url width height scale out
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor="$5" --window-size="$3,$4" --virtual-time-budget=20000 \
    --screenshot="$6" "$2" >/dev/null 2>&1
}

# 1) popup scenes (380x640 @2x) from the real bundles with demo data
for scene in home-known home-new list tags unlock config; do
  shoot "$scene" "http://localhost:$PORT/harness.html?scene=$scene" 380 640 2 "$WORK/shots/$scene.png"
done

# 2) store graphics
page="file://$PWD/tools/store-assets"
compose() { shoot "$1" "$page/shot.html?img=$2&title=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$3")&sub=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$4")" 1280 800 1 "$OUT/$1.png"; }
compose screenshot-1 home-known "Board erkannt.|Ein Klick." "Passwort in Miro einfügen. Du bestätigst selbst, draob sendet nie etwas ab."
compose screenshot-2 tags "Auch bei 30 Boards|sofort gefunden." "Suche, Tags und Favoriten. Mehrere Tags lassen sich kombinieren."
compose screenshot-3 home-new "Neues Board?|Schon ausgefüllt." "Titel und URL werden übernommen, du ergänzt nur das Passwort."
compose screenshot-4 unlock "Alles lokal.|Verschlüsselt." "AES-256-GCM, Schlüssel aus deinem Masterpasswort. Kein Konto, kein Server."
compose screenshot-5 config "Backup inklusive." "Verschlüsselte Sicherung speichern und Dubletten aufräumen."
shoot promo-small "$page/promo-small.html" 440 280 1 "$OUT/promo-small.png"
shoot promo-marquee "$page/promo-marquee.html" 1400 560 1 "$OUT/promo-marquee.png"
echo "Done: $(ls "$OUT" | tr '\n' ' ')"
