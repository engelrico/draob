# ADR-0003: esbuild statt Webpack und Babel

**Status:** umgesetzt (2026-11-06)

## Kontext
Der Build bestand aus Webpack, Babel und fünf Zusatzpaketen (webpack-cli, babel-loader, css-loader, mini-css-extract-plugin, copy-webpack-plugin) und zog mit dem
Rest der Werkzeuge **670 Pakete** (137 MB `node_modules`) für 2.243 Zeilen eigenen Code und 3 ausgelieferte Pakete. Jede Abhängigkeit ist Angriffsfläche in der Lieferkette
(Entwicklerrechner, CI) und erzeugt Dependabot-Aufwand; für die Nutzer der Erweiterung bringt sie nichts. Gemessen: ein Build dauerte etwa 3,2 s.

## Entscheidung
- **esbuild** baut alles (`scripts/build.mjs`, rund 40 Zeilen): vier Bundles (Background, Content, Popup, Verwaltung) plus eine gemeinsame `theme.css`, kopiert `public/`,
  schreibt nur **externe** Source-Maps (CSP: kein eval) und legt Lizenzhinweise als `*.LEGAL.txt` neben die Bundles. Build: etwa 45 ms.
- **Jest ohne Babel:** `scripts/jest-esbuild-transform.cjs` wandelt ESM und JSX per esbuild in CommonJS (statt `babel-jest`).
- Der Build ist durch `tests/unit/build.test.js` abgesichert: Jede Datei, auf die Manifest und HTML zeigen, muss im Ausgabeordner liegen, keine Bundles mit `eval`, Lizenzhinweise vorhanden.
- **React bleibt** (19.x). Die Oberfläche ist unverändert; Popup und Verwaltungsseite sind gegenüber dem Webpack-Build in 7 von 8 Szenen pixelgleich, die achte weicht nur durch eine Farb-Überblendung ab.
- Formularzustand wird nur noch als Funktion aktualisiert (`setForm((current) => …)`), weil bei Preact und bei gleichzeitigem Autofill sonst Eingaben verloren gehen.

## Ergebnis
670 → 524 Pakete, `node_modules` 137 → 108 MB, Lock-Datei 9.885 → 7.625 Zeilen, Build 3,2 s → 45 ms. Babel bleibt indirekt im Baum, solange Jest es mitbringt.

## Bewusst nicht entschieden (mögliche nächste Stufen)
Ein Spike außerhalb des Repos hat gezeigt, was darüber hinaus möglich wäre, ohne dass wir es eingeführt haben:
- **Preact statt React:** Popup 237 → 38 KB, Verwaltungsseite 224 → 26 KB; alle Abläufe liefen identisch, **vorausgesetzt** der Zustand wird wie oben als Funktion aktualisiert.
  Für lokal installierte Erweiterungen ist der Gewinn für Nutzer gering, deshalb nicht umgesetzt.
- **Vitest statt Jest** (Jest bringt mit jsdom rund 285 Pakete) und **Biome statt ESLint und Prettier** (`eslint-plugin-react` allein 125 Pakete): möglich, aber mehr Umbau
  (Testsyntax, einmalige Neuformatierung).

## Folgen
- Neue Bundles oder Seiten müssen in `scripts/build.mjs` eingetragen werden.
- Ein Ausgabeordner lässt sich mit `node scripts/build.mjs --outdir <ordner>` erzeugen (so nutzt ihn der Build-Test).
