# Chrome Web Store: Compliance-Status

Stand 2026-11-04. Ein Haken heißt: im Repo belegt. Alles andere ist offen.

| Punkt | Status | Beleg / offen |
|---|---|---|
| Manifest V3 | erfüllt | `public/manifest.json` |
| Strikte CSP | erfüllt | `extension_pages: script-src 'self'; object-src 'self'` |
| Spendenlink | umgesetzt, Store-Listing noch offen | Externer, klar gekennzeichneter Link nur im About-Tab, nicht aufdringlich, ohne Einfluss auf Funktionen. In der Store-Beschreibung offenlegen. Steuer und Trader-Status liegen beim Entwickler |
| Auto-Hinweis auf Boards | umgesetzt, in Chrome noch zu prüfen | Content-Script meldet Board, Badge statt `openPopup` (braucht keine `tabs`-/Host-Permission) |
| Zugriff auf Tab-URL/-Titel | umgesetzt, in Chrome noch zu prüfen | nur über `activeTab` beim Klick auf das Icon, nur Miro-Board-URLs werden verwendet |
| Permission `scripting` | begründet | wird nur für "In Miro einfügen" genutzt: setzt auf Klick den Wert des Passwortfelds auf Miro-Boards |
| Minimale Permissions | zu prüfen | `activeTab`, `scripting`, `storage`; `scripting` siehe oben |
| Daten verschlüsselt gespeichert | erfüllt | AES-GCM, Schlüssel aus Masterpasswort (PBKDF2); Passwörter, Titel, URLs und Tags liegen nur im verschlüsselten Blob (ADR-0002), `tests/unit/storage.test.js` prüft, dass kein Klartext im Storage landet |
| Automatisierte Tests | teilweise | Unit-Tests für Krypto, Storage und Modelle, keine UI/E2E-Tests |
| Manuelle Tests | offen | `docs/manual-testing.md` noch nicht durchgeführt |
| Security-Review | offen | |
| Performance-Ziele (UI < 200 ms) | ungemessen | |
| Store-Listing, Datenschutzerklärung, Screenshots | offen | |

Deploy: `Package extension` (GitHub Action, manuell) erzeugt `draob.zip`; Upload in den Store erfolgt von Hand.
