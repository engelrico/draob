# Architektur

## Komponenten
```
Miro-Tab ── content script (src/content)      noch leer
              │
Service Worker (src/background)  ── chrome.tabs.onUpdated ──► action.openPopup()
              │
Popup (src/popup, React)  ─┐
Options (src/options)      ├─► src/shared/crypto.js  (AES-GCM)
                           └─► chrome.storage.local  (Key: passwordStore)
```
Build: Webpack bündelt `src/*/index.js` zu `dist/<name>.bundle.js` und kopiert `public/` nach `dist/`.

## Storage (Ist)
`chrome.storage.local.passwordStore`: Array von `{ title, url, password: { iv: number[], data: number[] } }`.
Kein Versionsfeld. Der AES-Schlüssel wird in `App.jsx` bei jedem Start neu erzeugt und nicht gespeichert.

## Storage (Soll, siehe ADR-0001)
`{ v: 1, kdf: { salt, iterations }, verifier, entries: [...] }` hinter einer einzigen Schicht
`src/shared/storage.js`. Der abgeleitete Schlüssel liegt nur in `chrome.storage.session`.

## Bekannte Schulden
| Schuld | Auswirkung | Plan |
|---|---|---|
| Schlüssel nicht persistent | Passwörter nach Neustart unlesbar | ADR-0001 |
| `src/options/App.jsx` ist Platzhalter | Optionen ohne Funktion | Spec nötig |
| `src/popup/styles.css` ungenutzt | Layout aus `docs/requirements.md` fehlt | UI-Spec |
| Auto-Open per `openPopup` | unzuverlässig | Badge oder Side Panel |
| Keine E2E-Tests | UI nur manuell geprüft | Playwright |
