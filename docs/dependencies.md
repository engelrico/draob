# Abhängigkeiten und wie sie aktuell bleiben

Stand 2026-11-05. Geprüft mit `npm ls`, `npm audit` und `npm run licenses`.

## Was an Nutzer ausgeliefert wird
Nur React und seine Hilfsmodule. Alles ist in `popup.bundle.js` und `options.bundle.js` eingebaut (kein CDN, kein Nachladen, kein Remote-Code).

| Paket | Version | Lizenz | Zweck |
|---|---|---|---|
| `react` | 18.3.1 | MIT | Oberfläche |
| `react-dom` | 18.3.1 | MIT | Rendern im Popup und auf der Verwaltungsseite |
| `scheduler` | 0.23.2 | MIT | Hilfsmodul von `react-dom` |
| `loose-envify` | 1.4.0 | MIT | Hilfsmodul von React |
| `js-tokens` | 4.0.0 | MIT | Hilfsmodul von `loose-envify` |

Die Lizenztexte stehen als `*.bundle.js.LICENSE.txt` im Build und damit auch in der ZIP. `npm run licenses` prüft, dass jedes ausgelieferte Paket
eine erlaubte Lizenz hat (MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD; bei SPDX-Ausdrücken zählt „A OR B“ erlaubt, wenn eine Seite erlaubt ist, und „A AND B“ nur, wenn beide erlaubt sind).

## Was nur zum Bauen gebraucht wird (nicht ausgeliefert)
Webpack, Babel, Jest, ESLint, Prettier und ihre Plugins (siehe `devDependencies` in `package.json`). Sicherheitsmeldungen dort betreffen den Entwicklungsrechner und die CI,
nicht die Nutzer der Erweiterung.

## Wie Updates ankommen
| Mechanismus | Datei | Was passiert |
|---|---|---|
| **Dependabot** | `.github/dependabot.yml` | Montags 06:00 (Berlin) Vorschläge als Pull Requests: eine Gruppe `dev-tooling` (alle minor- und patch-Updates der Bauwerkzeuge), eine Gruppe `react` (`react` und `react-dom` zusammen), GitHub-Actions-Updates. Hauptversionen der Bauwerkzeuge kommen als einzelne PRs. Nichts wird automatisch gemergt. |
| **CI** | `.github/workflows/ci.yml` | Prüft jeden Vorschlag: `npm audit --omit=dev --audit-level=high`, Lizenzen, Lint, Tests, Build. |
| **Wöchentlicher Audit** | `.github/workflows/audit.yml` | Montags früh (und manuell): ausgelieferte Pakete müssen frei von bekannten Schwachstellen sein, Lizenzen erlaubt; Tooling-Audit und `npm outdated` als Zusammenfassung. Ein fehlgeschlagener geplanter Lauf wird per E-Mail gemeldet. |
| **Release** | `.github/workflows/release.yml` | Auditiert und prüft Lizenzen vor jedem Release. |
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

## Offene Hauptversionen (Backlog)
Diese Updates brauchen Umbauarbeit und werden einzeln mit Tests eingespielt. Empfohlene Reihenfolge:

| Paket | Aktuell | Neu | Hinweise |
|---|---|---|---|
| `react`, `react-dom` | 18.3.1 | 19.x | Kleine App, `createRoot` wird schon genutzt; `eslint-plugin-react` und Tests prüfen. Betrifft ausgelieferten Code, danach Release. |
| `jest`, `babel-jest`, `jest-environment-jsdom` | 29.7.0 | 30.x | Zusammen aktualisieren. Entfernt die verbleibenden Tooling-Meldungen der Jest-Kette. |
| `copy-webpack-plugin` | 12.0.2 | 14.x | Behebt die offene „hoch“-Meldung zu `serialize-javascript` (nur Build-Zeit). |
| `webpack-cli`, `babel-loader` | 5.1.4, 9.2.1 | 7.x, 10.x | Zusammen mit Webpack prüfen. |
| `@babel/*` | 7.29.x | 8.x | Konfiguration (`babel.config.json`) prüfen. |
| `eslint`, `eslint-plugin-react-hooks` | 8.57.1, 4.6.2 | 10.x, 7.x | ESLint 9 und neuer brauchen das Flat-Config-Format: `.eslintrc.json` muss migriert werden. |

## Bekannter Stand der Sicherheitsmeldungen (Tooling)
Nach dem Update innerhalb der Versionsbereiche meldet `npm audit` noch 8 Treffer (6 niedrig, 1 mittel, 1 hoch), **alle in Bauwerkzeugen**: `serialize-javascript` und
`copy-webpack-plugin` (behoben mit `copy-webpack-plugin` 14) sowie die Jest-Kette (behoben mit Jest 30). Für die ausgelieferten Pakete gibt es **keine** Meldungen
(`npm audit --omit=dev`).

## Nützliche Befehle
```bash
npm outdated                    # was ist veraltet?
npm audit --omit=dev            # Schwachstellen in ausgelieferten Paketen (muss 0 sein)
npm audit                       # Schwachstellen inklusive Bauwerkzeugen
npm run licenses                # Lizenzprüfung der ausgelieferten Pakete
npm update                      # sichere Updates innerhalb der erlaubten Bereiche
```
