import { useMemo, useState } from 'react';
import { findDuplicateGroups } from '../shared/entries';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';
import { Notice } from '../shared/ui/Field';

export default function ConfigView({ entries, onMerge, onExport, onManage }) {
  const groups = useMemo(() => findDuplicateGroups(entries), [entries]);
  const [notice, setNotice] = useState(null);

  const exportBackup = async () => {
    try {
      await onExport();
      setNotice({ kind: 'success', text: 'Sicherung gespeichert (verschlüsselt).' });
    } catch (err) {
      setNotice({ kind: 'error', text: err.message });
    }
  };

  return (
    <div className="view">
      <div className="card">
        <h2 className="section-title">Daten</h2>
        <p className="muted" style={{ margin: '6px 0 12px', textAlign: 'left' }}>
          Die Sicherung enthält nur verschlüsselte Daten. Wiederherstellen und Zurücksetzen findest
          du in der Verwaltung.
        </p>
        <div className="row">
          <Button block onClick={exportBackup}>
            <Icon name="download" /> Sicherung
          </Button>
          <Button block onClick={onManage}>
            <Icon name="upload" /> Verwaltung
          </Button>
        </div>
        {notice && (
          <div style={{ marginTop: 10 }}>
            <Notice kind={notice.kind}>{notice.text}</Notice>
          </div>
        )}
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
                <span className="muted"> – gleiches Board, „{group[0].title}“ bleibt erhalten</span>
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
                Zusammenführen
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
