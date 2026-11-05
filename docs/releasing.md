# Releases

Ein Release ist ein fertiger Download (`draob-<Version>.zip`) auf der GitHub-Seite unter **Releases**. Er entsteht aus einem Versions-Tag.
Dieselbe ZIP lädst du später in den Chrome Web Store hoch.

## Neues Release in drei Befehlen
```bash
npm version minor                      # 0.1.0 -> 0.2.0 (oder patch / major / eine feste Zahl wie 1.0.0)
git push origin 001-f-hre-eine:main    # den Release-Commit zu GitHub schicken
git push origin v0.2.0                 # den Tag schicken: das startet den Release-Workflow
```
`npm version` erhöht die Version in `package.json` und `package-lock.json`, gleicht `public/manifest.json` über
`scripts/sync-manifest-version.js` an, macht daraus den Commit „Release vX.Y.Z“ und setzt den Tag `vX.Y.Z`. Der Arbeitsbaum muss dafür sauber sein.
**Versionen nie von Hand ändern.**

## Was dann passiert
Der Workflow `Release` (`.github/workflows/release.yml`) startet nur bei einem Tag `v*` und:
1. führt Lint, Tests und Build aus,
2. prüft, dass Tag, `package.json` und `manifest.json` dieselbe Version haben (sonst Abbruch),
3. packt `dist/` ohne `.map`-Dateien zu `draob-<Version>.zip` und erzeugt `draob-<Version>.zip.sha256`,
4. legt das GitHub-Release mit Installationstext an (oder hängt die Dateien an ein schon vorhandenes Release an).
Versionen vor 1.0 erscheinen als **Vorabversion** (pre-release). Normale Pushes auf `main` starten nur die CI, nie ein Release.

## Erstes Release ohne Versionssprung
Die Version steht schon auf `0.1.0`, also nur Tag setzen und schicken:
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Probelauf ohne Release
Actions → **Release** → **Run workflow**. Das baut und lädt nur die ZIP als Workflow-Artefakt hoch (90 Tage). Es entsteht kein Release.

## Release korrigieren
- ZIP ersetzen: den Workflow für den Tag erneut starten, er überschreibt die Dateien im vorhandenen Release (`--clobber`).
- Falschen Tag entfernen: `git push --delete origin vX.Y.Z` und `git tag -d vX.Y.Z`; das Release auf der GitHub-Seite getrennt löschen.

## Hinweise
- **Sichtbarkeit:** Solange das Repo privat ist, sehen nur du und Eingeladene die Release-Seite. Für alle sichtbar wird sie, sobald das Repo öffentlich ist.
- **Version für Chrome:** 1 bis 4 Zahlenblöcke, keine Zusätze wie `-beta`. Jeder Store-Upload braucht eine höhere Version als der vorherige.
- **Installation aus der ZIP:** entpacken → `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“. Chrome installiert Erweiterungen außerhalb des
  Stores nicht per Doppelklick.
