# Abhängigkeiten und wie sie aktuell bleiben

Stand 2026-11-05 (nach dem Update auf React 19). Geprüft mit `npm ls`, `npm audit` und `npm run licenses`.

## Was an Nutzer ausgeliefert wird
Nur React und sein Hilfsmodul `scheduler` (mit React 19 sind `loose-envify` und `js-tokens` entfallen). Alles ist in `popup.bundle.js` und `options.bundle.js` eingebaut (kein CDN, kein Nachladen, kein Remote-Code).

| Paket | Version | Lizenz | Zweck |
|---|---|---|---|
| `react` | 19.3.1 | MIT | Oberfläche |
| `react-dom` | 19.3.1 | MIT | Rendern im Popup und auf der Verwaltungsseite |
| `scheduler` | 0.28.0 | MIT | Hilfsmodul von `react-dom` |

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
| **Hauptversionen-Sperre** | `.github/dependabot.yml` (`ignore`) | Hauptversionen von `@babel/*`, `eslint`, `eslint-plugin-react-hooks`, `jest`, `babel-jest` und `jest-environment-jsdom` werden nicht vorgeschlagen, bis die gemeinsame Migration geplant ist (siehe Backlog). |
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
| `jest`, `babel-jest`, `jest-environment-jsdom` | 29.7.0 | 30.x | Zusammen aktualisieren: ein einzelnes Update (z. B. nur `jest-environment-jsdom` 30) mischt zwei Jest-Versionen im Baum. Dependabot schlägt diese Hauptversionen deshalb nicht vor (`ignore`). Soll die verbleibenden Tooling-Meldungen der Jest-Kette beheben (vor dem Update prüfen). |
| `@babel/*` | 7.29.x | 8.x | `@babel/core`, `preset-env` und `preset-react` nur zusammen (ein einzelnes Update scheitert am Peer-Konflikt). Konfiguration (`babel.config.json`) prüfen. |
| `eslint`, `eslint-plugin-react-hooks` | 8.57.1, 4.6.2 | 10.x, 7.x | ESLint 9 und neuer brauchen das Flat-Config-Format: `.eslintrc.json` muss migriert werden. `eslint-plugin-react-hooks` 7 meldet außerdem `src/popup/App.jsx` (setState synchron im Effekt, `react-hooks/set-state-in-effect`): vor dem Update den Effekt umbauen. |

## Bekannter Stand der Sicherheitsmeldungen (Tooling)
Nach den Updates auf `copy-webpack-plugin` 14 und React 19 meldet `npm audit` noch **6 niedrige Treffer**, alle in der Jest-Kette (`jest`, `@jest/core`, `jest-cli`,
`jest-config`, `create-jest`, `deepmerge`). Sie sollten mit Jest 30 verschwinden (noch nicht geprüft, siehe Backlog). Für die ausgelieferten Pakete gibt es **keine** Meldungen (`npm audit --omit=dev`).

## Eingespielte Updates
- 2026-11-05: React 18.3.1 → 19.3.1 (`react`, `react-dom`, `scheduler` 0.28.0), `copy-webpack-plugin` 12 → 14, GitHub Actions `checkout`, `setup-node`, `upload-artifact` auf v7.
  Geprüft: ausgelieferte Dateien bei `copy-webpack-plugin` 14 identisch; React 19 gegenüber 18 in 7 UI-Szenen pixelgleich bzw. gleicher DOM (nur Attributreihenfolge und `useId`-Format
  `:r0:` → `_r_0_` unterscheiden sich); Export, Import, Reset, Entsperren, Suche, Tags und Favoriten unter React 19 durchgespielt. Das Popup-Bundle ist durch React 19 von etwa 160 auf 237 KB gewachsen
  (`webpack.config.js`: Warnschwelle auf 400 KB, weil die Dateien lokal geladen werden).

- 2026-11-05 (später): `webpack-cli` 5 → 7 und `babel-loader` 9 → 10. Geprüft: gebaute Erweiterung Datei für Datei identisch (14 Dateien, gleiche SHA-256). `jest-environment-jsdom` 30 allein wurde bewusst
  abgelehnt (mischt Jest 29 und 30); Jest-Hauptversionen sind für Dependabot gesperrt, bis Jest 30 gemeinsam migriert wird.

## Nützliche Befehle
```bash
npm outdated                    # was ist veraltet?
npm audit --omit=dev            # Schwachstellen in ausgelieferten Paketen (muss 0 sein)
npm audit                       # Schwachstellen inklusive Bauwerkzeugen
npm run licenses                # Lizenzprüfung der ausgelieferten Pakete
npm update                      # sichere Updates innerhalb der erlaubten Bereiche
```
