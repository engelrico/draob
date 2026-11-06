# ADR-0004: ESLint 10 (ohne eslint-plugin-react), Jest 30 und gezielte Overrides

**Status:** umgesetzt (2026-11-06)

## Kontext
`npm ci` zeigte 9 Veraltet-Hinweise (ESLint 8, Jest 29, jsdom 20) und 6 niedrige Tooling-Meldungen. Beide Werkzeuge waren je eine Hauptversion zurück. Zusätzlich gilt ESLint 9 laut npm
schon als nicht mehr unterstützt.

## Entscheidung
- **ESLint 10** mit Flat Config (`eslint.config.mjs`, ersetzt `.eslintrc.json`) und `eslint-plugin-react-hooks` 7 (enthält die React-Compiler-Prüfungen).
  `eslint-plugin-react` ist nur bis ESLint 9 freigegeben (und bringt rund 125 Pakete mit) und wird **bewusst weggelassen**. ESLint 10 erkennt die Verwendung von Komponenten im JSX selbst
  (geprüft: ein nur im JSX benutzter Import wird nicht als unbenutzt gemeldet, ein ungenutzter schon). Verloren gehen einzelne React-Stilregeln, vor allem „`key` in Listen“; React meldet das zur Laufzeit.
  Alternativen: `@eslint-react/eslint-plugin` (zieht TypeScript als Pflicht-Peer nach), ESLint 9 mit dem Plugin (bereits nicht mehr unterstützt).
- **Jest 30** mit `jest-environment-jsdom` 30. Unser esbuild-Transformer (ADR-0003) läuft unverändert. Einzige nötige Anpassung: `coverageProvider: 'v8'`, weil der Transformer keine Instrumentierung einfügt
  (`npm run coverage`, bisher 0 %).
- **`overrides`** für `minimatch` (^11.0.1) und `glob` (^14.0.2): Jest 30 und ESLint 10 bringen Versionen mit, auf die zwei neue Sicherheitsmeldungen zutreffen und die sich innerhalb ihrer erlaubten Bereiche nicht beheben
  lassen. Ohne Overrides: 22 Tooling-Treffer. Mit Overrides: 5 niedrige (nur `deepmerge`, ohne Korrektur). Geprüft: 64 Tests, Coverage-Lauf, `--findRelatedTests`, Testpfad-Muster, ESLint.
- **Dependabot:** Statt Hauptversionen zu sperren, bündeln Gruppen zusammengehörige Pakete (`jest` + `jest-environment-jsdom`, `eslint` + `@eslint/js`).
- Code: Der Effekt in `src/popup/App.jsx` setzt Zustand im Rückruf der Speicherabfrage und verwirft veraltete Ergebnisse (Regel `react-hooks/set-state-in-effect`).

## Ergebnis
Pakete 524 → 425, Veraltet-Hinweise bei `npm ci` 9 → 1 (`whatwg-encoding` über jsdom), Tooling-Audit 6 → 5 niedrige Treffer, `npm outdated` leer.

## Folgen und Pflichten
- Overrides **entfernen**, sobald Jest und ESLint selbst `minimatch` ≥ 11.0.1 und `glob` ≥ 14.0.2 verlangen (Bedingung und Prüfweg in `docs/dependencies.md`).
- Beim nächsten Jest- oder ESLint-Update `npm ls minimatch glob` prüfen.
- Bleibt offen und wird bewusst nicht gelöst: die `deepmerge`-Meldung (keine korrigierte Version existiert) und der Hinweis zu `whatwg-encoding`.
