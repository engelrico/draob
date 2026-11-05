# Anforderungen

Status: `offen` = nicht umgesetzt. Quelle: ursprüngliche Featureliste des Projektinhabers.

## UI-Layout
| ID | Anforderung | Status |
|---|---|---|
| F-01 | Titel, URL, Passwort sind Beschriftungen links, die Eingabefelder rechts daneben | umgesetzt |
| F-02 | Alle Eingabefelder gleich lang, linksbündig untereinander | umgesetzt |
| F-03 | Versionsnummer klein rechts oben neben dem Titel | umgesetzt |
| F-04 | Kopfzeile zeigt immer Logo, Titel, Version, darunter eine gelbe Linie | umgesetzt |
| F-05 | Obere Leiste mit Home, Liste, Config, About; verhält sich wie Tabs | umgesetzt |
| F-06 | Export und Import unter Config | umgesetzt: Export im Config-Tab, Wiederherstellen in der Verwaltungsseite (ADR-0002) |

## Verhalten
| ID | Anforderung | Status |
|---|---|---|
| F-10 | Auf `miro.com/app/board/` weist ein Badge am Icon auf draob hin (statt automatischem Öffnen, das ohne Nutzergeste nicht zuverlässig geht) | umgesetzt |
| F-11 | Klick auf "Liste" zeigt die Listenansicht, "Home" wieder das Formular | umgesetzt |
| F-12 | Listenansicht: nur Titel und Tab-Leiste bleiben; alle gespeicherten Titel aufgelistet | umgesetzt |
| F-13 | Klick auf eine Listenzeile füllt das Formular mit den Werten | umgesetzt |
| F-16 | Beim Öffnen auf einer Miro-Board-Seite werden URL (normalisiert, ohne Query) und Seitentitel (ohne "| Miro") übernommen | umgesetzt |
| F-17 | Ist das Board anhand der Board-ID schon gespeichert, wird der Eintrag geladen ("Aktualisieren"), sonst als neuer Eintrag zum Speichern angeboten | umgesetzt |
| F-18 | Bei bekanntem Board trägt der Button "In Miro einfügen" das Passwort ins Passwortfeld der Miro-Seite ein (füllt nur aus, sendet nie ab) | umgesetzt |
| F-20 | Suche in Titel, URL und Tags (Mehrwort UND, ohne Groß-/Kleinschreibung und Akzente) | umgesetzt |
| F-21 | Tags pro Eintrag, Filter-Chips mit Zähler (Mehrfachauswahl UND) | umgesetzt |
| F-22 | Favoriten (Stern), stehen oben, Filter "nur Favoriten" | umgesetzt |
| F-23 | Duplikate (gleiche Miro-Board-ID) beim Speichern verhindern, bestehende unter Config zusammenführen | umgesetzt |
| F-25 | Dezenter, freiwilliger Spendenlink im About-Tab und in der README (nie als Popup oder Overlay), abschaltbar über `DONATION_URL` | umgesetzt |
| F-26 | Reset bei vergessenem Masterpasswort („Passwort vergessen?“ im Entsperren, zweistufig, löscht alles) | umgesetzt |
| F-27 | Verwaltungsseite (Optionsseite): Sicherung speichern, Wiederherstellen, Zurücksetzen | umgesetzt |
| F-24 | Alle Metadaten (Titel, URL, Tags) verschlüsselt speichern | umgesetzt, ADR-0002 |
| F-14 | Passwörter speichern, auflisten, löschen | umgesetzt (verschlüsselt) |
| F-15 | Passwörter dauerhaft entschlüsselbar (Masterpasswort) | umgesetzt, ADR-0001 |
