# Datenschutzerklärung für draob

Stand: 2026-11-05 · Diese Datei ist der Text für die öffentliche Datenschutzseite. Vor der Veröffentlichung die Platzhalter in
`[eckigen Klammern]` ausfüllen und die Seite unter einer **öffentlichen URL** bereitstellen (die Startseite eines privaten Repos
genügt nicht).

## Kurzfassung
draob verarbeitet deine Daten **ausschließlich lokal in deinem Browser**. Es gibt keinen Server, keine Konten, keine Analyse- oder
Werbe-Dienste und keine Weitergabe an Dritte. Der Entwickler hat keinen Zugriff auf deine Daten.

## Verantwortlicher
[Vor- und Nachname, Anschrift, E-Mail-Adresse des Entwicklers]. Da keine Daten an den Entwickler übertragen werden, verarbeitet der
Entwickler selbst keine personenbezogenen Daten der Nutzer.

## Welche Daten draob speichert (nur auf deinem Gerät)
Alles, was du in draob einträgst: Titel, URL, Tags, Favoritenmarkierung und das Passwort eines Miro-Boards. Diese Daten liegen
**verschlüsselt** (AES-256-GCM) in `chrome.storage.local` deines Browsers. Der Schlüssel wird aus deinem Masterpasswort abgeleitet
(PBKDF2-SHA-256, 600.000 Iterationen) und nie gespeichert. Das Masterpasswort selbst wird nicht gespeichert. Während du entsperrt bist,
liegt der abgeleitete Schlüssel in `chrome.storage.session`; er wird beim Schließen des Browsers oder per „Sperren“ gelöscht.

## Zugriff auf Websites
- Die Erweiterung läuft nur auf `https://*.miro.com/app/board/*`. Dort meldet ein kleines Skript lediglich, dass die Seite ein Board
  ist, damit am Symbol ein Hinweispunkt erscheint. Es liest keine Inhalte des Boards.
- Wenn du auf das draob-Symbol klickst, liest draob URL und Titel des aktuellen Tabs (Berechtigung `activeTab`), nur wenn es ein
  Miro-Board ist, um Titel und URL vorzubefüllen und vorhandene Einträge zu erkennen. Das passiert nur lokal.
- Wenn du „In Miro einfügen“ klickst, trägt draob das gespeicherte Passwort in das Passwortfeld der Miro-Seite ein (Berechtigung
  `scripting`). Abgesendet wird nichts, das bestätigst du selbst.

## Keine Weitergabe, keine Analyse
draob sendet keine Daten an den Entwickler oder an Dritte, nutzt keine Cookies, kein Tracking, keine Telemetrie und keinen
nachgeladenen Code.

## Sicherungsdateien
Mit „Sicherung speichern“ erzeugst du eine Datei, die nur den **verschlüsselten** Tresor enthält. Sie ist ohne dein Masterpasswort nicht
lesbar. Wo du sie ablegst, entscheidest du selbst. Bewahre sie sicher auf.

## Löschen deiner Daten
Unter „Verwaltung → Tresor zurücksetzen“ (oder bei „Passwort vergessen?“) löschst du alle Daten unwiderruflich. Beim Deinstallieren der
Erweiterung löscht Chrome die lokal gespeicherten Daten ebenfalls. Ein vergessenes Masterpasswort kann nicht wiederhergestellt werden.

## Externer Link (freiwillige Spende)
Im About-Tab gibt es einen Link zu paypal.me. Erst wenn du darauf klickst, verlässt du die Erweiterung. Für die Datenverarbeitung bei
PayPal gilt die Datenschutzerklärung von PayPal. draob selbst überträgt dabei keine Daten.

## Keine Verbindung zu Miro
draob ist ein unabhängiges Projekt und nicht mit Miro verbunden, von Miro unterstützt oder geprüft. „Miro“ ist eine Marke der jeweiligen
Inhaberin.

## Änderungen
Wenn sich etwas an der Datenverarbeitung ändert, wird diese Seite aktualisiert und das Datum oben angepasst.

## Kontakt
[E-Mail-Adresse für Fragen zum Datenschutz]

---

## Privacy policy (short, English)
draob processes everything locally in your browser. Titles, URLs, tags and board passwords are stored encrypted (AES-256-GCM, key derived
from your master password with PBKDF2) in the extension's local storage. There is no server, no account, no analytics, no tracking and no data
is sent to the developer or to third parties. The extension runs only on `https://*.miro.com/app/board/*`; it reads the URL and title of the
active tab only when you click its icon, and fills a password field only when you click "In Miro einfügen". You can erase all data at any time
via "Verwaltung → Tresor zurücksetzen". draob is not affiliated with Miro. Contact: [email].
