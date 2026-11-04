import { useMemo } from 'react';
import { findDuplicateGroups } from '../shared/entries';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';

export default function ConfigView({ entries, onMerge }) {
  const groups = useMemo(() => findDuplicateGroups(entries), [entries]);

  return (
    <div className="view">
      <div className="card">
        <h2 className="section-title">Daten</h2>
        <p className="muted" style={{ margin: '6px 0 12px', textAlign: 'left' }}>
          Export und Import folgen in einer späteren Version.
        </p>
        <div className="row">
          <Button block disabled>
            <Icon name="download" /> Exportieren
          </Button>
          <Button block disabled>
            <Icon name="upload" /> Importieren
          </Button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Doppelte Einträge</h2>
        {groups.length === 0 ? (
          <p className="muted" style={{ marginTop: 6, textAlign: 'left' }}>
            Keine Doppelten gefunden.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group[0].id} className="dupe">
              <p>
                {group.map((e) => e.title).join(' · ')}
                <span className="muted"> – gleiches Board</span>
              </p>
              <Button
                block
                onClick={() =>
                  onMerge(
                    group[0].id,
                    group.slice(1).map((e) => e.id),
                  )
                }
              >
                Zusammenführen (behält „{group[0].title}“)
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
