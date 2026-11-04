# MiroHero

Chrome-Extension (Manifest V3) zum Speichern von Passwörtern für Miro-Boards.
**Status:** früher Prototyp. Die Verschlüsselung ist noch nicht alltagstauglich (siehe `docs/architecture.md`).

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
