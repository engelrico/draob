import { useState } from 'react';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';

export default function ListView({ entries, onPick, onRemove }) {
  const [confirming, setConfirming] = useState(null);

  if (entries.length === 0) {
    return (
      <div className="view">
        <p className="empty">Noch keine Einträge gespeichert.</p>
      </div>
    );
  }

  return (
    <div className="view">
      <ul className="list">
        {entries.map((entry) => (
          <li key={entry.id} className="list__item">
            <button className="list__main" onClick={() => onPick(entry.id)}>
              <span className="list__title">{entry.title}</span>
              <span className="list__url">{entry.url}</span>
            </button>
            {confirming === entry.id ? (
              <>
                <Button variant="danger" onClick={() => onRemove(entry.id)}>
                  Löschen?
                </Button>
                <Button onClick={() => setConfirming(null)}>Nein</Button>
              </>
            ) : (
              <Button
                variant="danger"
                icon
                aria-label={`${entry.title} löschen`}
                onClick={() => setConfirming(entry.id)}
              >
                <Icon name="trash" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
