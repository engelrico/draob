# Manuelle Release-Checkliste (echtes Chrome)

Vor jedem Einreichen im Chrome Web Store einmal komplett durchgehen. Ergebnis mit Datum und Chrome-Version unten eintragen.
Mindestversion laut Manifest: Chrome 110.

## Vorbereitung
- [ ] `npm ci && npm run build`
- [ ] `chrome://extensions` → Entwicklermodus → „Entpackte Erweiterung laden“ → `dist/`
- [ ] Name „draob“, Icon, Version und genau diese Berechtigungen sehen: `storage`, `activeTab`, `scripting` (+ Zugriff nur auf miro.com Boards)
- [ ] Fehlerseite der Erweiterung („Fehler“-Knopf) ist leer, Service-Worker-Konsole ohne Fehler

## Tresor
- [ ] Erster Start: Masterpasswort mit < 8 Zeichen wird abgelehnt, mit ≥ 8 klappt es
- [ ] Falsches Passwort beim Entsperren zeigt „Falsches Masterpasswort“
- [ ] „Sperren“ sperrt, Chrome komplett schließen und neu öffnen: Entsperren nötig, Einträge noch da
- [ ] **Migration:** Hast du einen Tresor aus der MiroHero-Zeit (Schema v1)? Entsperren, prüfen, dass alle Einträge samt Passwörtern da
      sind (Titel, URLs, Passwörter über „In Liste klicken“ kontrollieren)

## Board erkennen und einfügen
- [ ] Miro-Board öffnen und neu laden: goldener Punkt am Symbol, Tooltip „draob: Passwort für dieses Board“
- [ ] Popup auf einem **neuen** Board: Hinweis „Neues Miro-Board erkannt“, Titel ohne „| Miro“ und URL ohne Query vorausgefüllt
- [ ] Passwort eintragen, Tags vergeben, speichern; Popup schließen, erneut öffnen: „Dieses Board ist bereits gespeichert“, Eintrag geladen
- [ ] Passwortgeschütztes Board (Passwortseite): „In Miro einfügen“ trägt das Passwort ein, **ohne** abzusenden
- [ ] Auf einer Nicht-Board-Seite (z. B. miro.com/app/dashboard/) bleibt das Formular leer, kein Badge

## Liste, Suche, Ordnung
- [ ] Mehrere Einträge anlegen; Suche (Teilwort, Akzent, mehrere Wörter), Tag-Filter (mehrere Tags), Favoriten-Filter
- [ ] Stern setzt Favorit, Favoriten stehen oben
- [ ] Löschen fragt nach („Löschen? / Nein“)
- [ ] Link-Symbol an einem Eintrag: öffnet die gespeicherte Seite in einem **neuen Tab** (Popup schließt sich); Cmd/Strg-Klick öffnet im Hintergrund und das Popup bleibt
- [ ] Klick auf den Eintrag selbst öffnet **nur** das Formular, es öffnet sich kein Tab
- [ ] Auf dem geöffneten Board: goldener Punkt am Symbol → Icon klicken → „bereits gespeichert“ → „In Miro einfügen“
- [ ] Eintrag mit ungültiger Adresse (z. B. `irgendwas`): Link-Symbol ist deaktiviert
- [ ] Gleiches Board zweimal speichern: Hinweis „Für dieses Board gibt es schon einen Eintrag“ → „Bestehenden Eintrag aktualisieren“
- [ ] Config → „Doppelte Einträge“ zeigt keine Treffer (oder fasst vorhandene zusammen)

## Sicherung, Wiederherstellung, Reset
- [ ] Config → „Sicherung“ lädt `draob-backup-JJJJ-MM-TT.json` herunter; Datei öffnen: kein Titel, keine URL, kein Passwort im Klartext
- [ ] Config → „Verwaltung“ öffnet die Verwaltungsseite in einem Tab
- [ ] Verwaltung → Wiederherstellen: eine Textdatei oder fremde JSON wird abgelehnt, die echte Sicherung wird akzeptiert
- [ ] Nach dem Wiederherstellen: Entsperren mit dem Masterpasswort der Sicherung, alle Einträge da
- [ ] Entsperr-Bildschirm → „Passwort vergessen?“ → „Verschlüsselte Sicherung speichern“ funktioniert; „Abbrechen“ lässt alles unverändert
- [ ] „Ja, alles löschen“ führt zur Einrichtung („Masterpasswort festlegen“), alte Daten sind weg

## Oberfläche und Qualität
- [ ] About-Tab: Spendenlink öffnet paypal.me in neuem Tab (nur auf Klick, kein Popup beim Start)
- [ ] Popup öffnet in unter 200 ms, Tabs reagieren sofort
- [ ] Keine CSP-Fehler und keine Fehler in der Popup-Konsole (Rechtsklick auf das Popup → Untersuchen)
- [ ] Erweiterung deaktivieren/aktivieren, entfernen und neu laden: ohne Fehler
- [ ] Optional: Edge ausprobieren (gleicher Build)

## Ergebnis
| Datum | Chrome-Version | Ergebnis | Bemerkungen |
|---|---|---|---|
| | | | |
