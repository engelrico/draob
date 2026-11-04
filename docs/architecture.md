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
Board-Erkennung: Beim Öffnen liest `src/shared/tabs.js` (`getActiveBoard`) URL und Titel des aktiven Tabs
(erlaubt durch `activeTab`, keine `tabs`-Permission). `src/shared/miro.js` normalisiert die URL auf
`https://miro.com/app/board/<id>/`, säubert den Titel und findet bestehende Einträge per Board-ID. `App.jsx`
füllt das Formular einmal pro Öffnen vor und setzt `boardState` (`new` | `known`).

Passwort einfügen: Der Button "In Miro einfügen" ruft `fillPasswordInActiveTab` (`src/shared/tabs.js`) auf. Das führt
per `chrome.scripting.executeScript` die in sich geschlossene Funktion `fillPasswordField` (`src/shared/fillPassword.js`)
im aktiven Tab aus: erstes sichtbares, aktivierbares `input[type=password]` im Hauptframe, Wert über den nativen
Setter plus `input`/`change`-Events (damit React die Änderung übernimmt). Nur Miro-Board-Tabs, nur auf Klick, kein Absenden.
Die Seite von Miro hat dafür ein reguläres Feld (`placeholder="Passwort"`, kein `<form>`), Stand 2026-11.

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
