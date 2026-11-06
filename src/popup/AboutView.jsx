import {
  ISSUES_URL,
  FEEDBACK_EMAIL,
  REVIEW_URL,
  describeEnvironment,
  feedbackMailto,
} from '../shared/feedback';
import { DONATION_URL } from '../shared/support';
import { appVersion } from '../shared/version';

export default function AboutView() {
  const version = appVersion();
  const env = describeEnvironment();

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

      <div className="card support">
        <h2 className="section-title">Feedback</h2>
        <p className="muted" style={{ textAlign: 'left' }}>
          Fehler gefunden oder eine Idee? Ich freue mich über deine Rückmeldung.
        </p>
        <a
          className="btn btn--secondary btn--block"
          href={ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          🐞 Fehler oder Idee auf GitHub melden ↗
        </a>
        <a
          className="btn btn--secondary btn--block"
          href={feedbackMailto({ version, env })}
          target="_blank"
          rel="noopener noreferrer"
        >
          ✉️ Per E-Mail schreiben
        </a>
        {REVIEW_URL && (
          <a
            className="btn btn--secondary btn--block"
            href={REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            ⭐ Im Chrome Web Store bewerten ↗
          </a>
        )}
        <p className="muted card__meta">
          Version {version || 'unbekannt'} · {env.browser}
          <br />
          {FEEDBACK_EMAIL}
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
