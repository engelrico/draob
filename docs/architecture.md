# Architektur

## Komponenten
```
Miro-Tab ── content script (src/content)      noch leer
              │
Service Worker (src/background)  ── chrome.tabs.onUpdated ──► action.openPopup()
              │
Popup (src/popup, React)  ─┐
Options (src/options)      └─► src/shared/storage.js ─► crypto.js (PBKDF2, AES-GCM)
                                    └─► chrome.storage.local / .session
```
Build: Webpack bündelt `src/*/index.js` zu `dist/<name>.bundle.js` und kopiert `public/` nach `dist/`.

## Storage (ADR-0001)
Nur `src/shared/storage.js` spricht mit `chrome.storage`. Die UI nutzt `vaultStore()`.

`chrome.storage.local["vault"]`:
```
{ v: 1,
  kdf: { salt: number[16], iterations: number },     // PBKDF2-SHA256
  verifier: { iv, data },                            // verschlüsselter Konstantwert, prüft das Masterpasswort
  entries: [{ id: uuid, title, url, password: { iv, data } }] }
```
`chrome.storage.session["sessionKey"]`: abgeleiteter AES-Schlüssel als JWK. Nur in vertrauenswürdigen
Extension-Kontexten lesbar, verschwindet beim Schließen des Browsers.

Zustände: `uninitialized` → `create()` → `unlocked` ⇄ `lock()`/`unlock()` ⇄ `locked`.
Titel und URL liegen unverschlüsselt (die Liste braucht keinen Schlüssel); nur Passwörter sind verschlüsselt.

## Bekannte Schulden
| Schuld | Auswirkung | Plan |
|---|---|---|
| `src/options/App.jsx` ist Platzhalter | Optionen ohne Funktion | Spec nötig |
| `src/popup/styles.css` ungenutzt | Layout aus `docs/requirements.md` fehlt | UI-Spec |
| Auto-Open per `openPopup` | unzuverlässig | Badge oder Side Panel |
| Kein Auto-Lock, kein Masterpasswort-Wechsel, keine Drosselung | siehe ADR-0001 "Nicht abgedeckt" | eigene Spec |
| Keine E2E-Tests | UI nur manuell geprüft | Playwright |
