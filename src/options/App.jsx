import { useEffect, useMemo, useState } from 'react';
import { settingsStore } from '../shared/storage';
import Button from '../shared/ui/Button';
import { Field, Notice } from '../shared/ui/Field';

export default function OptionsApp() {
  const store = useMemo(() => settingsStore(), []);
  const [settings, setSettings] = useState({ theme: 'default', notifications: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    store.get().then(setSettings);
  }, [store]);

  const save = async (e) => {
    e.preventDefault();
    await store.set(settings);
    setSaved(true);
  };

  const change = (patch) => {
    setSaved(false);
    setSettings({ ...settings, ...patch });
  };

  return (
    <div className="app app--page">
      <header className="header">
        <h1 className="header__title">MiroHero · Optionen</h1>
      </header>
      <form className="view" onSubmit={save}>
        <div className="card form">
          <Field label={<label htmlFor="theme">Theme</label>}>
            <select
              id="theme"
              className="input"
              value={settings.theme}
              onChange={(e) => change({ theme: e.target.value })}
            >
              <option value="default">Standard</option>
              <option value="dark">Dunkel</option>
            </select>
          </Field>
          <span />
          <label className="check">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => change({ notifications: e.target.checked })}
            />
            Benachrichtigungen aktivieren
          </label>
          <div className="form__actions">
            <Button variant="primary" type="submit">
              Speichern
            </Button>
          </div>
        </div>
        {saved && <Notice>Optionen gespeichert.</Notice>}
      </form>
    </div>
  );
}
