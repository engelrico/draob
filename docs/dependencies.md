# Abhängigkeiten und wie sie aktuell bleiben

Stand 2026-11-06 (alle direkten Abhängigkeiten auf der neuesten Version, `npm outdated` ist leer). Geprüft mit `npm ls`, `npm audit` und `npm run licenses`.

## Was an Nutzer ausgeliefert wird
Nur React und sein Hilfsmodul `scheduler` (mit React 19 sind `loose-envify` und `js-tokens` entfallen). Alles ist in `popup.bundle.js` und `options.bundle.js` eingebaut (kein CDN, kein Nachladen, kein Remote-Code).

| Paket | Version | Lizenz | Zweck |
|---|---|---|---|
| `react` | 19.3.1 | MIT | Oberfläche |
| `react-dom` | 19.3.1 | MIT | Rendern im Popup und auf der Verwaltungsseite |
| `scheduler` | 0.28.0 | MIT | Hilfsmodul von `react-dom` |

Die Lizenztexte stehen als `*.bundle.js.LEGAL.txt` im Build und damit auch in der ZIP. `npm run licenses` prüft, dass jedes ausgelieferte Paket
eine erlaubte Lizenz hat (MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD; bei SPDX-Ausdrücken zählt „A OR B“ erlaubt, wenn eine Seite erlaubt ist, und „A AND B“ nur, wenn beide erlaubt sind).

## Was nur zum Bauen gebraucht wird (nicht ausgeliefert)
esbuild (Build und Jest-Transformer), Jest 30, ESLint 10 mit `eslint-plugin-react-hooks`, Prettier (siehe `devDependencies` in `package.json`; Babel steckt nur noch indirekt in Jest). Hintergrund: ADR-0003 und ADR-0004. Sicherheitsmeldungen dort betreffen den Entwicklungsrechner und die CI,
nicht die Nutzer der Erweiterung.

## Wie Updates ankommen
| Mechanismus | Datei | Was passiert |
|---|---|---|
| **Dependabot** | `.github/dependabot.yml` | Montags 06:00 (Berlin) Vorschläge als Pull Requests: Gruppen `jest` (`jest` und `jest-environment-jsdom`) und `eslint` (`eslint` und `@eslint/js`), die immer zusammen und in jeder Versionsstufe kommen, eine Gruppe `dev-tooling` (alle übrigen minor- und patch-Updates der Bauwerkzeuge), eine Gruppe `react` (`react` und `react-dom` zusammen) und GitHub-Actions-Updates. Übrige Hauptversionen kommen als einzelne PRs. Nichts wird automatisch gemergt. |
| **CI** | `.github/workflows/ci.yml` | Prüft jeden Vorschlag: `npm audit --omit=dev --audit-level=high`, Lizenzen, Lint, Tests, Build. |
| **Wöchentlicher Audit** | `.github/workflows/audit.yml` | Montags früh (und manuell): ausgelieferte Pakete müssen frei von bekannten Schwachstellen sein, Lizenzen erlaubt; Tooling-Audit und `npm outdated` als Zusammenfassung. Ein fehlgeschlagener geplanter Lauf wird per E-Mail gemeldet. |
| **Release** | `.github/workflows/release.yml` | Auditiert und prüft Lizenzen vor jedem Release. |
| **Overrides** | `package.json` (`overrides`) | `minimatch` ^11.0.1 und `glob` ^14.0.2 erzwingen die korrigierten Versionen gegen zwei neue Sicherheitsmeldungen, die Jest 30 und ESLint 10 über ihre eigenen Abhängigkeiten mitbringen (siehe unten). |
| **Node-Version** | `.nvmrc` | Eine Stelle für CI, Release und Entwickler (`engines`: `>=22`). |

### Ablauf bei einem Dependabot-PR
1. CI ist grün? Dann prüfen, was sich ändert, und mergen.
2. Betrifft es **ausgelieferte** Pakete (`react`, `react-dom`)? Dann ein neues Release bauen (`npm version patch`, siehe `docs/releasing.md`). Nur Bauwerkzeuge brauchen kein Release.
3. Nutzer bekommen das Update erst mit dem neuen Release bzw. nach neuem Store-Upload samt Prüfung.

### Regeln
- Möglichst wenige Laufzeit-Bibliotheken. Eine neue Laufzeit-Bibliothek nur mit Begründung, bestandener Lizenzprüfung (`npm run licenses`) und sauberem `npm audit --omit=dev`.
- Keine Bibliothek per CDN oder zur Laufzeit nachladen (Store-Regel „kein Remote-Code“, strikte CSP).
- `package-lock.json` gehört ins Repo, die CI installiert mit `npm ci`.
- Sicherheitswarnungen und automatische Sicherheits-Updates (Repo-Einstellungen → Code security: Dependency graph, Dependabot alerts, Dependabot security updates) sollten eingeschaltet sein.

## Offene Hauptversionen und bekannte Restpunkte
Keine offenen Hauptversionen bei den direkten Abhängigkeiten. Bekannte Restpunkte:

- **Overrides auf `minimatch` und `glob`:** Ohne sie melden Jest 30 und ESLint 10 zusammen 22 Tooling-Treffer (`glob` ≤ 14.0.1: Abbruch einer Suche umgehbar, `minimatch` < 11.0.1: Rechenaufwand bei bestimmten Mustern).
  Beide betreffen nur den Testlauf auf dem Entwicklerrechner, sind aber nicht mit den von Jest und ESLint erlaubten Versionen behebbar. Getestet mit den Overrides: 64 Tests, `jest --coverage`, `--findRelatedTests`,
  Testpfad-Muster und ESLint laufen unverändert. **Entfernen**, sobald `npm ls minimatch glob` ohne Override schon `minimatch` ≥ 11.0.1 und `glob` ≥ 14.0.2 zeigt (dann `overrides` löschen und `npm audit` prüfen).
  Dependabot aktualisiert Overrides nicht; die wöchentliche Audit-Zusammenfassung zeigt, wenn das Thema erledigt ist.
- **`deepmerge` (niedrig):** Prototype Poisoning in `deepmerge` ≤ 4.3.1, kommt über `jest-config`; es gibt keine korrigierte Version. Erzeugt die 5 verbleibenden niedrigen Tooling-Meldungen.
- **`whatwg-encoding` (Hinweis „deprecated“):** kommt über `jsdom` 26 aus `jest-environment-jsdom` 30; die letzte Warnung bei `npm ci`.
- **Fehlende Lint-Regeln für React:** `eslint-plugin-react` ist nur bis ESLint 9 freigegeben und wurde weggelassen (ADR-0004). Regeln wie „`key` in Listen“ prüft React zur Laufzeit. Wenn das Plugin ESLint 10 unterstützt, kann es als optionaler Zusatz zurückkommen.

## Bekannter Stand der Sicherheitsmeldungen (Tooling)
`npm audit` meldet **5 niedrige Treffer**, alle aus der `deepmerge`-Kette (siehe oben). Für die ausgelieferten Pakete gibt es **keine** Meldungen (`npm audit --omit=dev`).

## Eingespielte Updates
- 2026-11-05: React 18.3.1 → 19.3.1 (`react`, `react-dom`, `scheduler` 0.28.0), `copy-webpack-plugin` 12 → 14, GitHub Actions `checkout`, `setup-node`, `upload-artifact` auf v7.
  Geprüft: ausgelieferte Dateien bei `copy-webpack-plugin` 14 identisch; React 19 gegenüber 18 in 7 UI-Szenen pixelgleich bzw. gleicher DOM (nur Attributreihenfolge und `useId`-Format
  `:r0:` → `_r_0_` unterscheiden sich); Export, Import, Reset, Entsperren, Suche, Tags und Favoriten unter React 19 durchgespielt. Das Popup-Bundle ist durch React 19 von etwa 160 auf 237 KB gewachsen
  (`webpack.config.js`: Warnschwelle auf 400 KB, weil die Dateien lokal geladen werden).

- 2026-11-05 (später): `webpack-cli` 5 → 7 und `babel-loader` 9 → 10. Geprüft: gebaute Erweiterung Datei für Datei identisch (14 Dateien, gleiche SHA-256). `jest-environment-jsdom` 30 allein wurde bewusst
  abgelehnt (mischt Jest 29 und 30); Jest-Hauptversionen sind für Dependabot gesperrt, bis Jest 30 gemeinsam migriert wird.

- 2026-11-06: Build von Webpack und Babel auf **esbuild** umgestellt (ADR-0003). Entfernt: `webpack`, `webpack-cli`, `babel-loader`, `css-loader`, `mini-css-extract-plugin`,
  `copy-webpack-plugin`, `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `babel-jest`; neu: `esbuild`. Pakete 670 → 524, `node_modules` 137 → 108 MB, Build 3,2 s → 45 ms.
  Geprüft: Popup und Verwaltungsseite in 7 von 8 UI-Szenen pixelgleich (achte: nur Tab-Überblendung), Export, Import, Reset, Entsperren, Suche, Tags, Favoriten, Speichern, Löschen
  unverändert; 64 Tests (5 neue Build-Tests). Zusätzlich Formularzustand auf Funktions-Updates umgestellt (siehe `AGENTS.md`).

- 2026-11-06 (später): **ESLint 8 → 10** (Flat Config `eslint.config.mjs`, `eslint-plugin-react-hooks` 4 → 7, `eslint-plugin-react` entfällt) und **Jest 29 → 30** (`jest-environment-jsdom` 30, jsdom 26), dazu Overrides für `minimatch`/`glob` (ADR-0004).
  Pakete 524 → 425, Veraltet-Hinweise bei `npm ci` 9 → 1, Tooling-Audit 6 → 5 niedrige Treffer, `npm outdated` leer. `src/popup/App.jsx`: der Effekt nach dem Entsperren setzt Zustand jetzt im Rückruf der Speicherabfrage
  und verwirft veraltete Ergebnisse (Regel `react-hooks/set-state-in-effect`). `npm run coverage` funktioniert wieder (V8-Anbieter, bisher 0 % seit dem esbuild-Umbau).
  Geprüft: 64 Tests, UI in 7 von 8 Szenen pixelgleich (achte: Fokus-Rahmen), alle Abläufe im Browser unverändert.

## Nützliche Befehle
```bash
npm outdated                    # was ist veraltet?
npm audit --omit=dev            # Schwachstellen in ausgelieferten Paketen (muss 0 sein)
npm audit                       # Schwachstellen inklusive Bauwerkzeugen
npm run licenses                # Lizenzprüfung der ausgelieferten Pakete
npm update                      # sichere Updates innerhalb der erlaubten Bereiche
```
