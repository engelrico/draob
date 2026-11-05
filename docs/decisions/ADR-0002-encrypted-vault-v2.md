# ADR-0002: Verschlüsselter Tresor v2 (Metadaten, Tags, Favoriten)

> Das Projekt hieß früher MiroHero und heißt jetzt draob. Der Text bleibt als Verlauf unverändert.

**Status:** umgesetzt (2026-11-04) · ersetzt das Speicherformat aus ADR-0001 (Schlüsselmodell bleibt)

## Kontext
Bei 20–30+ Einträgen braucht die Liste Suche, Tags, Favoriten und Duplikaterkennung. In Schema v1 lagen Titel
und URL im Klartext (nur Passwörter verschlüsselt). Board- und Kundennamen sind aber selbst sensibel.

## Entscheidung
Alle Einträge liegen als ein einziger AES-GCM-verschlüsselter JSON-Blob im Tresor:
```
vault = { v: 2, kdf: { salt, iterations }, verifier: {iv,data}, data: {iv,data} }
data  = { entries: [{ id, title, url, password, tags[], favorite, createdAt, updatedAt }] }
```
Außerhalb des Blobs steht nichts Lesbares. Suche, Filter und Sortierung laufen im entsperrten Popup im Speicher
(`src/shared/entries.js`). Jeder Schreibvorgang verschlüsselt den Blob neu (frischer IV). Das ist für einige hundert
Einträge unkritisch.

Duplikate: Pro Miro-Board-ID höchstens ein Eintrag (`DuplicateError` beim Anlegen oder Ändern). Nicht-Miro-URLs
dürfen mehrfach vorkommen. Bestehende Duplikate (z. B. aus Importen) lassen sich unter Config zusammenführen.

## Migration v1 → v2
Beim Entsperren eines v1-Tresors werden alle Passwörter entschlüsselt und als v2-Blob geschrieben. Erst danach
wird geschrieben; schlägt ein Eintrag fehl, bleibt v1 unverändert und der Tresor gesperrt. Eine Kopie liegt in
`vaultBackupV1` und wird beim nächsten erfolgreichen Entsperren gelöscht.

## Alternativen
- Metadaten im Klartext lassen: einfacher, aber Board-Namen sind lesbar.
- Pro Eintrag einzeln verschlüsseln: schnelleres Schreiben, aber Suche müsste trotzdem alles entschlüsseln.

## Folgen
`list()` braucht den Schlüssel. Ein künftiger Export/Import kann das Blob-Format direkt nutzen.
Nicht abgedeckt: Passwort-Verlauf, Teilen, mehrere Tresore.
