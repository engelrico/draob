import { useMemo, useState } from 'react';
import { collectTags, filterEntries, sortEntries } from '../shared/entries';
import Button from '../shared/ui/Button';
import Chip from '../shared/ui/Chip';
import Icon from '../shared/ui/Icon';

export default function ListView({ entries, onPick, onRemove, onToggleFavorite }) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const tags = useMemo(() => collectTags(entries), [entries]);
  const visible = useMemo(
    () => sortEntries(filterEntries(entries, { query, tags: activeTags, favoritesOnly })),
    [entries, query, activeTags, favoritesOnly],
  );
  const filtering = Boolean(query.trim()) || activeTags.length > 0 || favoritesOnly;

  const toggleTag = (tag) =>
    setActiveTags((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));
  const reset = () => {
    setQuery('');
    setActiveTags([]);
    setFavoritesOnly(false);
  };

  if (entries.length === 0) {
    return (
      <div className="view">
        <p className="empty">Noch keine Einträge gespeichert.</p>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="list-tools">
        <div className="input-wrap searchbar">
          <span className="searchbar__icon">
            <Icon name="search" size={16} />
          </span>
          <input
            className="input"
            type="search"
            placeholder="Suchen in Titel, URL, Tags …"
            aria-label="Einträge durchsuchen"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="chips" role="group" aria-label="Filter">
          <Chip active={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
            ★ Favoriten
          </Chip>
          {tags.map(({ tag, count }) => (
            <Chip key={tag} active={activeTags.includes(tag)} onClick={() => toggleTag(tag)}>
              {tag} <span className="chip__count">{count}</span>
            </Chip>
          ))}
        </div>
        <p className="muted counter" aria-live="polite">
          {visible.length} von {entries.length} Einträgen
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>Keine Treffer.</p>
          {filtering && (
            <Button onClick={reset} style={{ marginTop: 10 }}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
      ) : (
        <ul className="list">
          {visible.map((entry) => (
            <li key={entry.id} className="list__item">
              <button
                className={`star${entry.favorite ? ' star--on' : ''}`}
                aria-pressed={entry.favorite}
                aria-label={`${entry.title} ${entry.favorite ? 'aus Favoriten entfernen' : 'zu Favoriten'}`}
                onClick={() => onToggleFavorite(entry.id, !entry.favorite)}
              >
                <Icon name="star" size={16} filled={entry.favorite} />
              </button>
              <button className="list__main" onClick={() => onPick(entry.id)}>
                <span className="list__title">{entry.title}</span>
                <span className="list__url">{entry.url}</span>
                {entry.tags.length > 0 && (
                  <span className="list__tags">
                    {entry.tags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </span>
                )}
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
      )}
    </div>
  );
}
