# Architektur

## Komponenten
```
Miro-Board-Tab ── content script (src/content) ── sendMessage(BOARD_DETECTED) ─┐
                                                                               ▼
Service Worker (src/background/badge.js) ── action.setBadgeText/Title für diesen Tab
              │
Popup (src/popup, React)  ─┐
Options (src/options)      └─► src/shared/storage.js ─► crypto.js (PBKDF2, AES-GCM)
                                    └─► chrome.storage.local / .session
```
UI-Komponenten (`src/popup/`): `App` (Status, aktiver Tab, Formularzustand) → `Header`, `Tabs`, `UnlockView`,
`HomeView`, `ListView`, `ConfigView`, `AboutView`. Wiederverwendbare Bausteine in `src/shared/ui/`
(`Button`, `Field`/`TextInput`/`PasswordInput`/`Notice`, `Icon`). Styles: `src/shared/theme.css`
(Design-Tokens als CSS-Variablen + Basis-Klassen), per `mini-css-extract-plugin` als `dist/popup.css` / `options.css`
ausgeliefert und in den HTML-Dateien verlinkt (keine Inline-Styles, CSP-konform).

Build: Webpack bündelt `src/*/index.js` zu `dist/<name>.bundle.js` und kopiert `public/` nach `dist/`.

## Storage (ADR-0001)
Nur `src/shared/storage.js` spricht mit `chrome.storage`. Die UI nutzt `vaultStore()`; Optionen laufen über `settingsStore()` (`userOptions`).

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
| Optionen haben nur Theme/Benachrichtigungen ohne Wirkung | kosmetisch | eigene Spec |
| Kein Auto-Lock, kein Masterpasswort-Wechsel, keine Drosselung | siehe ADR-0001 "Nicht abgedeckt" | eigene Spec |
| Keine E2E-Tests | UI nur manuell geprüft | Playwright |
