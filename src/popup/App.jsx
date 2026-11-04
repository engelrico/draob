import { useCallback, useEffect, useMemo, useState } from 'react';
import { MIN_MASTER_LENGTH, vaultStore } from '../shared/storage';

function MasterPasswordForm({ mode, onSubmit }) {
  const [master, setMaster] = useState('');
  const creating = mode === 'uninitialized';
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(master);
      }}
    >
      <h3>{creating ? 'Masterpasswort festlegen' : 'Tresor entsperren'}</h3>
      {creating && (
        <p>Mindestens {MIN_MASTER_LENGTH} Zeichen. Ohne dieses Passwort sind die Daten verloren.</p>
      )}
      <input
        type="password"
        placeholder="Masterpasswort"
        value={master}
        onChange={(e) => setMaster(e.target.value)}
        autoFocus
      />
      <button type="submit">{creating ? 'Tresor anlegen' : 'Entsperren'}</button>
    </form>
  );
}

function Vault({ store, onLock, setInfo }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState([]);

  const refresh = useCallback(() => store.list().then(setEntries), [store]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    if (!title || !url || !password) return setInfo('Bitte alle Felder ausfüllen!');
    await store.add({ title, url, password });
    setTitle('');
    setUrl('');
    setPassword('');
    setInfo('Passwort verschlüsselt gespeichert!');
    refresh();
  };

  const fill = async (id) => {
    const entry = await store.reveal(id);
    setTitle(entry.title);
    setUrl(entry.url);
    setPassword(entry.password);
  };

  const remove = async (id) => {
    await store.remove(id);
    refresh();
  };

  return (
    <div>
      <input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <input
        placeholder="Passwort"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={save}>Speichern (verschlüsselt)</button>
      <button onClick={onLock}>Sperren</button>
      <h3>Gespeicherte Passwörter</h3>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <button onClick={() => fill(entry.id)}>{entry.title}</button> ({entry.url})
            <button onClick={() => remove(entry.id)}>Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const store = useMemo(() => vaultStore(), []);
  const [status, setStatus] = useState(null);
  const [info, setInfo] = useState('');

  useEffect(() => {
    store.status().then(setStatus);
  }, [store]);

  const submitMaster = async (master) => {
    try {
      if (status === 'uninitialized') await store.create(master);
      else await store.unlock(master);
      setInfo('');
      setStatus('unlocked');
    } catch (err) {
      setInfo(err.message);
    }
  };

  const lock = async () => {
    await store.lock();
    setStatus('locked');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>MiroHero</h2>
      {status === null && <p>Lade …</p>}
      {(status === 'uninitialized' || status === 'locked') && (
        <MasterPasswordForm key={status} mode={status} onSubmit={submitMaster} />
      )}
      {status === 'unlocked' && <Vault store={store} onLock={lock} setInfo={setInfo} />}
      <div>{info}</div>
    </div>
  );
}
