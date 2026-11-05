import { DONATION_URL } from '../shared/support';

export default function AboutView() {
  return (
    <div className="view">
      <div className="card">
        <h2 className="card__title" style={{ textAlign: 'left' }}>
          Über draob
        </h2>
        <p className="muted" style={{ textAlign: 'left', marginTop: 6 }}>
          Speichert Passwörter für Miro-Boards lokal und verschlüsselt (AES-GCM, Schlüssel aus
          deinem Masterpasswort). Es verlässt nichts diesen Browser.
        </p>
      </div>

      {DONATION_URL && (
        <div className="card support">
          <h2 className="section-title">Gefällt dir draob?</h2>
          <p className="muted" style={{ textAlign: 'left' }}>
            draob ist kostenlos und bleibt es. Wenn es dir Zeit spart, freue ich mich über ein Bier.
          </p>
          <a
            className="btn btn--secondary btn--block"
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            🍺 Ein Bier für den Entwickler ↗
          </a>
        </div>
      )}
    </div>
  );
}
