# Chrome Web Store: Listing-Texte (zum Kopieren ins Dashboard)

Alle Angaben in `[eckigen Klammern]` müssen vor dem Einreichen ersetzt werden. Sprache des Listings: **Deutsch** (die Oberfläche ist
nur Deutsch). Sichtbarkeit beim ersten Upload: **Nicht gelistet (Unlisted)**, nach dem Probelauf auf **Öffentlich** umstellen.

## Grunddaten
- **Name:** draob (kommt aus dem Manifest; „Miro“ nicht im Namen)
- **Kurzbeschreibung (max. 132 Zeichen, steht im Manifest als `description`):**
  `Board-Passwörter verschlüsselt speichern, durchsuchen und mit einem Klick auf Miro-Boards einfügen. Alles lokal, ohne Konto.` (124 Zeichen)
- **Kategorie:** Produktivität
- **Sprache:** Deutsch
- **Webseite / Support:** https://github.com/engelrico/draob · **Support-E-Mail:** draob@engelrico.de
- **Datenschutzerklärung (URL):** [öffentliche URL der Seite aus `docs/privacy.md`]

## Detaillierte Beschreibung
```
Schluss mit „Wie war nochmal das Passwort für dieses Board?“

draob speichert die Passwörter deiner Miro-Boards verschlüsselt auf deinem Gerät, erkennt beim Öffnen eines Boards, ob es schon
gespeichert ist, und fügt das Passwort auf Klick in das Passwortfeld ein.

• Board erkannt: Titel und URL werden übernommen, vorhandene Einträge automatisch gefunden
• Gespeicherte Seite mit einem Klick auf das Link-Symbol im neuen Tab öffnen
• Passwort mit einem Klick einfügen (du bestätigst selbst, draob sendet nie etwas ab)
• Sofort-Suche in Titel, URL und Tags, ohne Beachtung von Groß-/Kleinschreibung und Akzenten
• Tags und Favoriten für 20, 30 oder mehr Boards
• Dubletten werden verhindert, vorhandene lassen sich zusammenführen
• Verschlüsselte Sicherung und Wiederherstellung
• Feedback per Klick im About-Tab (GitHub oder E-Mail), ohne dass die App Daten sendet
• Alles lokal: AES-256-GCM, Schlüssel aus deinem Masterpasswort (PBKDF2), keine Konten, kein Server, kein Tracking

Wichtig: Ein vergessenes Masterpasswort lässt sich nicht wiederherstellen. Speichere bei Bedarf eine verschlüsselte Sicherung.

Berechtigungen: draob nutzt nur „storage“ (lokaler Tresor), „activeTab“ (URL und Titel des Tabs, auf den du klickst) und „scripting“
(Passwort auf Klick einfügen). Das Hinweis-Skript läuft ausschließlich auf miro.com/app/board/.

Freiwillige Unterstützung: Im About-Tab gibt es einen optionalen Spendenlink (PayPal). draob bleibt kostenlos.

draob ist ein unabhängiges Projekt und nicht mit Miro verbunden, von Miro unterstützt oder geprüft. „Miro“ ist eine Marke der jeweiligen
Inhaberin.
```

## Dashboard: „Datenschutzpraktiken“ (Privacy practices)
- **Single Purpose (Beschreibung des einzigen Zwecks):** Passwörter für passwortgeschützte Miro-Boards lokal verschlüsselt speichern,
  verwalten und auf Wunsch in das Passwortfeld des Boards einfügen.
- **Begründung `storage`:** Speichert den verschlüsselten Tresor lokal (`chrome.storage.local`) und den Sitzungsschlüssel bis zum Schließen
  des Browsers (`chrome.storage.session`).
- **Begründung `activeTab`:** Liest URL und Titel des aktuellen Miro-Board-Tabs, nur wenn der Nutzer auf das Symbol klickt, um Titel und URL
  vorzubefüllen und einen vorhandenen Eintrag zu erkennen.
- **Begründung `scripting`:** Trägt auf Klick auf „In Miro einfügen“ das gespeicherte Passwort in das sichtbare Passwortfeld der aktiven
  Miro-Board-Seite ein. Es wird nichts gelesen oder abgesendet.
- **Begründung Host-/Content-Script (`https://*.miro.com/app/board/*`):** Das Skript meldet nur „diese Seite ist ein Board“ an den Service
  Worker, der ein Badge am Symbol setzt. Es liest keine Seiteninhalte.
- **Remote-Code:** Nein, die Erweiterung lädt keinen externen Code.
- **Datenkategorien (Empfehlung, bitte gegen das aktuelle Formular prüfen):**
  - Authentifizierungsinformationen: ja (vom Nutzer eingegebene Board-Passwörter, nur lokal gespeichert)
  - Website-Inhalt / Webverlauf: URLs und Titel von Miro-Boards, vom Nutzer gespeichert, nur lokal
  - Alles andere: nein
- **Erklärungen (Zertifizierung):** Daten werden nicht verkauft, nicht für fremde Zwecke genutzt, nicht für Kreditwürdigkeit oder Kredite
  verwendet.

## Grafiken
Siehe `docs/store/` (erzeugt über `tools/store-assets/`):
- Screenshots 1280×800 (1 bis 5): `screenshot-1.png` bis `screenshot-4.png`
- Kleine Kachel 440×280: `promo-small.png`
- Marquee 1400×560 (optional): `promo-marquee.png`
- Store-Icon 128×128: `public/icons/icon_128.png`
