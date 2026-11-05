# AGENTS.md

draob („board“ rückwärts, früher MiroHero) ist eine Chrome-Extension (Manifest V3), die Passwörter für Miro-Boards speichert. Nicht mit Miro verbunden.
Stack: React 18, Webpack 5, Babel, Jest, ESLint, Prettier. Kein Backend.

## Befehle
```bash
npm ci              # Abhängigkeiten
npm run build       # baut nach dist/ (das ist die ladbare Extension)
npm test            # Jest (tests/unit)
npm run lint        # ESLint
npm run licenses    # Lizenzprüfung der ausgelieferten Pakete
npm run format      # Prettier
```
Extension testen: `chrome://extensions` → Entwicklermodus → "Entpackte Erweiterung laden" → `dist/`.
Nach jeder Code-Änderung neu bauen und die Extension neu laden.

## Verzeichnisse
| Pfad | Inhalt |
|---|---|
| `src/background/` | Service Worker (setzt Badge auf Miro-Board-Tabs) |
| `src/content/` | Content Script für `miro.com/app/board/*` |
| `src/popup/` | React-Popup (`index.js` + `App.jsx` + Views) |
| `src/options/` | Verwaltungsseite (Sicherung, Wiederherstellen, Zurücksetzen) |
| `src/shared/` | Geteilter Code: `crypto.js`, `storage.js` (Tresor v2), `entries.js` (Suche/Tags/Duplikate, rein), `miro.js` (Board-URLs), `tabs.js` (aktiver Tab), `download.js`, `ui/` (Komponenten), `theme.css` (Design-Tokens) |
| `scripts/` | Hilfsskripte, z. B. `sync-manifest-version.js` (läuft bei `npm version`) |
| `public/` | Wird 1:1 nach `dist/` kopiert: `manifest.json`, HTML, Icons |
| `tests/unit/` | Jest-Tests, spiegeln `src/shared/` |
| `docs/` | Wissensbasis, siehe unten |
| `specs/`, `.specify/` | spec-kit: Feature-Specs und Constitution |

`dist/` und `node_modules/` sind generiert und werden nie committet.
Es gibt kein Manifest, HTML oder Quellcode im Repo-Root.

## Harte Regeln
1. Passwörter dürfen nie im Klartext in `chrome.storage` oder im Code liegen. Verschlüsselung nur über `src/shared/crypto.js`, Schlüssel nur aus dem Masterpasswort (ADR-0001).
2. Kein Inline-Script, kein `eval` (CSP in `public/manifest.json`). Webpack nutzt deshalb `devtool: 'source-map'`.
3. Neue Permission oder Host-Permission nur mit Begründung in `docs/compliance.md`.
4. Nur `src/shared/storage.js` greift auf `chrome.storage` zu. UI und andere Module nutzen `vaultStore()`.
5. Jede Änderung an Krypto oder Storage braucht einen Unit-Test. Neue Eintragsfelder gehören in den verschlüsselten Blob (ADR-0002), nie als Klartext neben `vault.data`; Schema-Änderungen brauchen eine Migration mit Test.
6. Styling nur über CSS-Variablen aus `src/shared/theme.css` (keine Hex-Farben in Komponenten, keine Inline-Styles außer für Layout-Ausnahmen).
7. Neue Laufzeit-Bibliotheken nur mit Begründung, `npm run licenses` und sauberem `npm audit --omit=dev`; nichts per CDN nachladen (siehe `docs/dependencies.md`).
8. Der Spendenhinweis (`src/shared/support.js`) erscheint nur im About-Tab und in der README, nie als Popup, Overlay oder Aufforderung beim Start.

## Releases
Version nie von Hand ändern: `npm version <patch|minor|major>` gleicht `package.json` und `public/manifest.json` an, committet und taggt. Ein Tag-Push `vX.Y.Z`
startet den Workflow `Release`, der die ZIP als GitHub-Release anlegt. Ablauf und Fallstricke: `docs/releasing.md`.

## Konventionen
- ES-Module überall, keine CommonJS-Datei in `src/`.
- Code und Kommentare Englisch, UI-Texte Deutsch.
- Prettier-Stil (Single Quotes, 100 Spalten); `npm run format` vor dem Commit.
- Versionsnummer steht in `package.json` und `public/manifest.json`, beide gleichzeitig ändern.

## Definition of Done
`npm run lint`, `npm test` und `npm run build` sind grün, die Extension wurde manuell geladen
(`docs/manual-testing.md`), und betroffene Docs sind aktualisiert.

## Wissensbasis (hier nachlesen, nicht raten)
- `docs/architecture.md`: Komponenten, Datenfluss, Storage-Schema, bekannte Schulden
- `docs/requirements.md`: Anforderungen mit IDs (F-xx)
- `docs/decisions/`: Architekturentscheidungen (ADR): 0001 Masterpasswort/Schlüsselmodell, 0002 verschlüsselter Tresor v2
- `docs/dependencies.md`: ausgelieferte Bibliotheken, Update-Ablauf (Dependabot, Audit), offene Hauptversionen
- `docs/releasing.md`: Release-Ablauf (npm version, Tag, Workflow)
- `docs/compliance.md`: Chrome-Web-Store-Status, ehrlich mit offenen Punkten
- `docs/manual-testing.md`: manueller Testablauf
- `.specify/memory/constitution.md`: Projektprinzipien; `specs/<nr>-<name>/`: Spec, Plan, Tasks je Feature

## Bekannte Lücken (nicht verschlimmern)
- Kein Auto-Lock, kein Wechsel des Masterpassworts, keine Drosselung falscher Eingaben (ADR-0001).
- Ein vergessenes Masterpasswort bedeutet Datenverlust; es gibt nur den Reset (alles löschen) und Sicherungen, die das alte Passwort brauchen.
- E2E-Tests fehlen noch (Playwright geplant).
