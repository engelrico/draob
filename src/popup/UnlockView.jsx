import { useState } from 'react';
import { MIN_MASTER_LENGTH } from '../shared/storage';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';
import { Notice, PasswordInput } from '../shared/ui/Field';

function ForgotPassword({ onReset, onExport }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(null);

  const exportBackup = async () => {
    try {
      await onExport();
      setNote({ kind: 'success', text: 'Sicherung gespeichert (verschlüsselt).' });
    } catch (err) {
      setNote({ kind: 'error', text: err.message });
    }
  };

  if (!open) {
    return (
      <button type="button" className="linkbtn" onClick={() => setOpen(true)}>
        Passwort vergessen?
      </button>
    );
  }
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Notice kind="error">
        Das Masterpasswort lässt sich nicht wiederherstellen. Zurücksetzen löscht alle Einträge
        unwiderruflich.
      </Notice>
      <Button block onClick={exportBackup}>
        Verschlüsselte Sicherung speichern
      </Button>
      {note && <Notice kind={note.kind}>{note.text}</Notice>}
      <div className="row">
        <Button variant="danger" block onClick={onReset}>
          Ja, alles löschen
        </Button>
        <Button block onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

export default function UnlockView({ mode, onSubmit, onReset, onExport, error }) {
  const [master, setMaster] = useState('');
  const [busy, setBusy] = useState(false);
  const creating = mode === 'uninitialized';

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(master);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="view">
      <form className="card card--center" onSubmit={submit}>
        <span className="card__icon">
          <Icon name="lock" size={22} />
        </span>
        <h2 className="card__title">
          {creating ? 'Masterpasswort festlegen' : 'Tresor entsperren'}
        </h2>
        {creating && (
          <p className="muted">
            Mindestens {MIN_MASTER_LENGTH} Zeichen. Ohne dieses Passwort sind alle Daten verloren.
          </p>
        )}
        <div className="form" style={{ gridTemplateColumns: '1fr' }}>
          <PasswordInput
            label="Master"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
            disabled={busy}
            autoFocus
            autoComplete={creating ? 'new-password' : 'current-password'}
          />
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <Button variant="primary" type="submit" busy={busy} block>
          {creating ? 'Tresor anlegen' : 'Entsperren'}
        </Button>
      </form>
      {!creating && <ForgotPassword onReset={onReset} onExport={onExport} />}
    </div>
  );
}
