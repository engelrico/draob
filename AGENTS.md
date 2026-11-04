# AGENTS.md

MiroHero ist eine Chrome-Extension (Manifest V3), die Passwörter für Miro-Boards speichert.
Stack: React 18, Webpack 5, Babel, Jest, ESLint, Prettier. Kein Backend.

## Befehle
```bash
npm ci              # Abhängigkeiten
npm run build       # baut nach dist/ (das ist die ladbare Extension)
npm test            # Jest (tests/unit)
npm run lint        # ESLint
npm run format      # Prettier
```
Extension testen: `chrome://extensions` → Entwicklermodus → "Entpackte Erweiterung laden" → `dist/`.
Nach jeder Code-Änderung neu bauen und die Extension neu laden.

## Verzeichnisse
| Pfad | Inhalt |
|---|---|
| `src/background/` | Service Worker (öffnet Popup auf Miro-Boards) |
| `src/content/` | Content Script für `miro.com/app/board/*` |
| `src/popup/`, `src/options/` | React-UIs (je `index.js` + `App.jsx`) |
| `src/shared/` | Geteilter Code: `crypto.js`, `models/` |
| `public/` | Wird 1:1 nach `dist/` kopiert: `manifest.json`, HTML, Icons |
| `tests/unit/` | Jest-Tests, spiegeln `src/shared/` |
| `docs/` | Wissensbasis, siehe unten |
| `specs/`, `.specify/` | spec-kit: Feature-Specs und Constitution |

`dist/` und `node_modules/` sind generiert und werden nie committet.
Es gibt kein Manifest, HTML oder Quellcode im Repo-Root.

## Harte Regeln
1. Passwörter dürfen nie im Klartext in `chrome.storage` oder im Code liegen. Verschlüsselung nur über `src/shared/crypto.js`.
2. Kein Inline-Script, kein `eval` (CSP in `public/manifest.json`). Webpack nutzt deshalb `devtool: 'source-map'`.
3. Neue Permission oder Host-Permission nur mit Begründung in `docs/compliance.md`.
4. UI-Code greift nicht direkt auf `chrome.storage` zu, sobald `src/shared/storage.js` existiert (siehe `docs/architecture.md`).
5. Jede Änderung an Krypto oder Storage braucht einen Unit-Test.

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
- `docs/decisions/`: Architekturentscheidungen (ADR)
- `docs/compliance.md`: Chrome-Web-Store-Status, ehrlich mit offenen Punkten
- `docs/manual-testing.md`: manueller Testablauf
- `.specify/memory/constitution.md`: Projektprinzipien; `specs/<nr>-<name>/`: Spec, Plan, Tasks je Feature

## Bekannte Lücken (nicht verschlimmern)
- Der Schlüssel in `src/popup/App.jsx` wird bei jedem Öffnen neu erzeugt: gespeicherte Passwörter sind
  danach nicht entschlüsselbar. Lösung geplant: ADR-0001. Bis dahin keine Features darauf aufbauen.
- Der Auto-Open des Popups per `openPopup` ist unzuverlässig (braucht meist eine Nutzergeste).
- E2E-Tests fehlen noch (Playwright geplant).
