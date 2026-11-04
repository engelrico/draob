import { useState } from 'react';
import { MIN_MASTER_LENGTH } from '../shared/storage';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';
import { Notice, PasswordInput } from '../shared/ui/Field';

export default function UnlockView({ mode, onSubmit, error }) {
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
    </div>
  );
}
