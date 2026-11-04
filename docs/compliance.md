# Chrome Web Store: Compliance-Status

Stand 2026-11-04. Ein Haken heißt: im Repo belegt. Alles andere ist offen.

| Punkt | Status | Beleg / offen |
|---|---|---|
| Manifest V3 | erfüllt | `public/manifest.json` |
| Strikte CSP | erfüllt | `extension_pages: script-src 'self'; object-src 'self'` |
| Minimale Permissions | zu prüfen | `activeTab`, `scripting`, `storage`; `scripting` wird aktuell nicht genutzt, entfernen oder begründen |
| Passwörter verschlüsselt gespeichert | **offen** | Schlüssel nicht persistent, ADR-0001 |
| Automatisierte Tests | teilweise | Unit-Tests für Krypto und Modelle, keine UI/E2E-Tests |
| Manuelle Tests | offen | `docs/manual-testing.md` noch nicht durchgeführt |
| Security-Review | offen | |
| Performance-Ziele (UI < 200 ms) | ungemessen | |
| Store-Listing, Datenschutzerklärung, Screenshots | offen | |

Deploy: `Package extension` (GitHub Action, manuell) erzeugt `mirohero.zip`; Upload in den Store erfolgt von Hand.
