import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';

export default function ConfigView() {
  return (
    <div className="view">
      <div className="card">
        <h2 className="section-title">Daten</h2>
        <p className="muted" style={{ margin: '6px 0 12px' }}>
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
    </div>
  );
}
