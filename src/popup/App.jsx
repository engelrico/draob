import { useCallback, useEffect, useMemo, useState } from 'react';
import { vaultStore } from '../shared/storage';
import AboutView from './AboutView';
import ConfigView from './ConfigView';
import Header from './Header';
import HomeView from './HomeView';
import ListView from './ListView';
import Tabs from './Tabs';
import UnlockView from './UnlockView';

const EMPTY_FORM = { title: '', url: '', password: '' };

export default function App() {
  const store = useMemo(() => vaultStore(), []);
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState('home');
  const [form, setForm] = useState(EMPTY_FORM);
  const [entries, setEntries] = useState([]);
  const [notice, setNotice] = useState(null);
  const [unlockError, setUnlockError] = useState('');

  const refresh = useCallback(() => store.list().then(setEntries), [store]);

  useEffect(() => {
    store.status().then(setStatus);
  }, [store]);

  useEffect(() => {
    if (status === 'unlocked') refresh();
  }, [status, refresh]);

  const changeTab = (id) => {
    setNotice(null);
    setTab(id);
  };

  const submitMaster = async (master) => {
    try {
      if (status === 'uninitialized') await store.create(master);
      else await store.unlock(master);
      setUnlockError('');
      setStatus('unlocked');
    } catch (err) {
      setUnlockError(err.message);
    }
  };

  const lock = async () => {
    await store.lock();
    setForm(EMPTY_FORM);
    setStatus('locked');
  };

  const save = async () => {
    if (!form.title || !form.url || !form.password) {
      return setNotice({ kind: 'error', text: 'Bitte Titel, URL und Passwort ausfüllen.' });
    }
    await store.add(form);
    setForm(EMPTY_FORM);
    setNotice({ kind: 'success', text: 'Verschlüsselt gespeichert.' });
    refresh();
  };

  const pick = async (id) => {
    setForm(await store.reveal(id));
    changeTab('home');
  };

  const remove = async (id) => {
    await store.remove(id);
    refresh();
  };

  return (
    <div className="app">
      <Header />
      {status === null && <div className="view muted">Lade …</div>}
      {(status === 'uninitialized' || status === 'locked') && (
        <UnlockView key={status} mode={status} onSubmit={submitMaster} error={unlockError} />
      )}
      {status === 'unlocked' && (
        <>
          <Tabs active={tab} onChange={changeTab} />
          <div
            id="view"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            style={{ display: 'contents' }}
          >
            {tab === 'home' && (
              <HomeView form={form} setForm={setForm} onSave={save} onLock={lock} notice={notice} />
            )}
            {tab === 'list' && <ListView entries={entries} onPick={pick} onRemove={remove} />}
            {tab === 'config' && <ConfigView />}
            {tab === 'about' && <AboutView />}
          </div>
        </>
      )}
    </div>
  );
}
