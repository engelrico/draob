import { useState } from 'react';
import {
  ISSUES_URL,
  FEEDBACK_EMAIL,
  REVIEW_URL,
  describeEnvironment,
  feedbackGmail,
  feedbackMailto,
} from '../shared/feedback';
import { DONATION_URL } from '../shared/support';
import { appVersion } from '../shared/version';

export default function AboutView() {
  const version = appVersion();
  const env = describeEnvironment();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="view view--compact">
      <div className="card card--compact">
        <h2 className="card__title" style={{ textAlign: 'left' }}>
          Über draob
        </h2>
        <p className="muted" style={{ textAlign: 'left', marginTop: 4 }}>
          Speichert Miro-Board-Passwörter lokal und verschlüsselt. Es verlässt nichts diesen
          Browser.
        </p>
      </div>

      <div className="card card--compact support">
        <h2 className="section-title">Feedback</h2>
        <a
          className="btn btn--secondary btn--block"
          href={ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          🐞 Fehler oder Idee auf GitHub melden ↗
        </a>
        <div className="row">
          {/* No target on mailto: a new tab would only show an empty page */}
          <a
            className="btn btn--secondary"
            style={{ flex: 1 }}
            href={feedbackMailto({ version, env })}
          >
            ✉️ Mail
          </a>
          <a
            className="btn btn--secondary"
            style={{ flex: 1 }}
            href={feedbackGmail({ version, env })}
            target="_blank"
            rel="noopener noreferrer"
          >
            Gmail ↗
          </a>
          <button
            type="button"
            className="btn btn--secondary"
            style={{ flex: 1 }}
            onClick={copyAddress}
          >
            {copied ? '✓ Kopiert' : '📋 Kopie'}
          </button>
        </div>
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
          {FEEDBACK_EMAIL} · v{version || '?'} · {env.browser}
        </p>
      </div>

      {DONATION_URL && (
        <div className="card card--compact support">
          <h2 className="section-title">Gefällt dir draob?</h2>
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
