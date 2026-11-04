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
| F-06 | Export und Import erscheinen unter Config | teilweise (Buttons deaktiviert, Funktion fehlt) |

## Verhalten
| ID | Anforderung | Status |
|---|---|---|
| F-10 | Auf `miro.com/app/board/` weist ein Badge am Icon auf MiroHero hin (statt automatischem Öffnen, das ohne Nutzergeste nicht zuverlässig geht) | umgesetzt |
| F-11 | Klick auf "Liste" zeigt die Listenansicht, "Home" wieder das Formular | umgesetzt |
| F-12 | Listenansicht: nur Titel und Tab-Leiste bleiben; alle gespeicherten Titel aufgelistet | umgesetzt |
| F-13 | Klick auf eine Listenzeile füllt das Formular mit den Werten | umgesetzt |
| F-14 | Passwörter speichern, auflisten, löschen | umgesetzt (verschlüsselt) |
| F-15 | Passwörter dauerhaft entschlüsselbar (Masterpasswort) | umgesetzt, ADR-0001 |
