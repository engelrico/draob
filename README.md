# MiroHero

Chrome-Extension (Manifest V3) zum Speichern von Passwörtern für Miro-Boards.
**Status:** früher Prototyp. Passwörter werden mit einem Masterpasswort verschlüsselt (siehe `docs/decisions/ADR-0001-key-management.md`); UI-Layout und Optionen fehlen noch.

## Entwickeln
```bash
npm ci
npm run build   # → dist/
```
In Chrome `chrome://extensions` → Entwicklermodus → "Entpackte Erweiterung laden" → Ordner `dist/`.

Weitere Befehle: `npm test`, `npm run lint`, `npm run format`.

## Dokumentation
Einstieg für Menschen und Agenten: [AGENTS.md](AGENTS.md).
Details: [Architektur](docs/architecture.md) · [Anforderungen](docs/requirements.md) ·
[Entscheidungen](docs/decisions/) · [Compliance](docs/compliance.md) · [Manuelle Tests](docs/manual-testing.md)
