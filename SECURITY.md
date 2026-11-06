# Sicherheit / Security policy

## Sicherheitslücke melden
Bitte **nicht** öffentlich als Issue, sondern per E-Mail an **draob@engelrico.de**. Hilfreich sind: betroffene Version (`manifest.json`), Schritte zum Nachstellen und die erwartete Auswirkung.
Ich antworte so schnell wie möglich und melde mich, sobald eine Korrektur veröffentlicht ist. Ein Bug-Bounty gibt es nicht.

## Unterstützte Versionen
Es wird jeweils nur die neueste Version unterstützt (siehe [Releases](https://github.com/engelrico/draob/releases)).

## Wichtig zum Verständnis
- draob speichert alles lokal und verschlüsselt (AES-256-GCM, Schlüssel aus dem Masterpasswort). Ein vergessenes Masterpasswort lässt sich nicht wiederherstellen.
- Details zum Modell: `docs/decisions/ADR-0001-key-management.md` und `docs/decisions/ADR-0002-encrypted-vault-v2.md`.

## Reporting a vulnerability (English)
Please do **not** open a public issue. Email **draob@engelrico.de** with the affected version, steps to reproduce and the expected impact. Only the latest release is supported.
