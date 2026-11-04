# ADR-0001: Schlüsselverwaltung per Masterpasswort

**Status:** umgesetzt (2026-11-04) · **Datum:** 2026-11-04

## Kontext
`App.jsx` erzeugt bei jedem Öffnen einen neuen AES-GCM-Schlüssel und speichert ihn nicht.
Gespeicherte Passwörter sind dadurch nach dem Schließen des Popups unbrauchbar.

## Entscheidung
Der Nutzer legt ein Masterpasswort fest. Daraus wird per PBKDF2 (SHA-256, ≥ 600 000 Iterationen,
zufälliges Salt) der AES-Schlüssel abgeleitet. Gespeichert werden Salt, Iterationszahl und ein
Verifier (verschlüsselter Konstantwert). Der Schlüssel selbst liegt nur in `chrome.storage.session`
und verfällt beim Schließen des Browsers. Zugriff auf Storage nur über `src/shared/storage.js`.

## Alternativen
- Schlüssel als JWK in `storage.local`: schützt nichts, wer den Speicher liest, hat beides.
- Kein Verschlüsseln: widerspricht der Constitution.

## Folgen
Nutzer muss das Masterpasswort pro Browser-Session eingeben. Vergessenes Masterpasswort bedeutet
Datenverlust. Migration der Bestandsdaten ist nicht nötig (sie sind nicht entschlüsselbar).

> Hinweis: Das Speicherformat wurde durch ADR-0002 abgelöst (alle Metadaten verschlüsselt, Schema v2). Das Schlüsselmodell gilt unverändert.

## Umsetzung
`src/shared/crypto.js` (`deriveKey`), `src/shared/storage.js` (`createVaultStore`), UI in `src/popup/App.jsx`.
Tests: `tests/unit/crypto.test.js`, `tests/unit/storage.test.js`. Mindestlänge Masterpasswort: 8 Zeichen.
Nicht abgedeckt: Masterpasswort ändern, Tresor zurücksetzen, Brute-Force-Drosselung, Auto-Lock nach Timeout.
Die Iterationszahl (600 000) ist pro Tresor gespeichert und kann später erhöht werden.
