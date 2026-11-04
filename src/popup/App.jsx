import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findEntryByUrl } from '../shared/miro';
import { vaultStore } from '../shared/storage';
import { getActiveBoard } from '../shared/tabs';
import AboutView from './AboutView';
import ConfigView from './ConfigView';
import Header from './Header';
import HomeView from './HomeView';
import ListView from './ListView';
import Tabs from './Tabs';
import UnlockView from './UnlockView';

const EMPTY_FORM = { id: null, title: '', url: '', password: '' };

export default function App() {
  const store = useMemo(() => vaultStore(), []);
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState('home');
  const [form, setForm] = useState(EMPTY_FORM);
  const [entries, setEntries] = useState([]);
  const [notice, setNotice] = useState(null);
  const [unlockError, setUnlockError] = useState('');
  // undefined = still looking, null = active tab is no board
  const [board, setBoard] = useState(undefined);
  const [boardState, setBoardState] = useState(null); // 'new' | 'known' | null
  const boardHandled = useRef(false);

  const refresh = useCallback(async () => {
    const list = await store.list();
    setEntries(list);
    return list;
  }, [store]);

  useEffect(() => {
    store.status().then(setStatus);
    getActiveBoard().then(setBoard);
  }, [store]);

  // Once unlocked: load the list and prefill the form from the active Miro board (once per open).
  useEffect(() => {
    if (status !== 'unlocked' || board === undefined) return;
    refresh().then(async (list) => {
      if (boardHandled.current || !board) return;
      boardHandled.current = true;
      const known = findEntryByUrl(list, board.url);
      if (known) {
        setForm({ id: known.id, ...(await store.reveal(known.id)) });
        setBoardState('known');
      } else {
        setForm({ ...EMPTY_FORM, title: board.title, url: board.url });
        setBoardState('new');
      }
    });
  }, [status, board, refresh, store]);

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
    const { id, title, url, password } = form;
    if (!title || !url || !password) {
      return setNotice({ kind: 'error', text: 'Bitte Titel, URL und Passwort ausfüllen.' });
    }
    const wasUpdate = Boolean(id);
    let savedId = id;
    if (wasUpdate) await store.update(id, { title, url, password });
    else savedId = await store.add({ title, url, password });
    const list = await refresh();

    if (board && findEntryByUrl(list, board.url)?.id === savedId) {
      setForm({ ...form, id: savedId }); // stay on the board's entry
      setBoardState('known');
    } else {
      setForm(EMPTY_FORM);
    }
    setNotice({
      kind: 'success',
      text: wasUpdate ? 'Aktualisiert.' : 'Verschlüsselt gespeichert.',
    });
  };

  const pick = async (id) => {
    setForm({ id, ...(await store.reveal(id)) });
    changeTab('home');
  };

  const remove = async (id) => {
    await store.remove(id);
    if (form.id === id) setForm(EMPTY_FORM);
    const list = await refresh();
    if (board && !findEntryByUrl(list, board.url)) setBoardState('new');
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
              <HomeView
                form={form}
                setForm={setForm}
                onSave={save}
                onLock={lock}
                notice={notice}
                boardState={boardState}
              />
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
