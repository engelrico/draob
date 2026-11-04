import React, { useState, useEffect } from 'react';
import { generateKey, encryptPassword, decryptPassword } from '../shared/crypto';

function App() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [key, setKey] = useState(null);
  const [info, setInfo] = useState('');
  const [passwordList, setPasswordList] = useState([]);

  useEffect(() => {
    // Generate or load key (for demo: generate new each time)
    generateKey().then(setKey);
    // Load password list from storage
    chrome.storage.local.get(['passwordStore'], (data) => {
      setPasswordList(data.passwordStore || []);
    });
  }, []);

  const savePassword = async () => {
    if (!title || !url || !password || !key) {
      setInfo('Bitte alle Felder ausfüllen!');
      return;
    }
    const encrypted = await encryptPassword(password, key);
    const entry = { title, url, password: encrypted };
    chrome.storage.local.get(['passwordStore'], (data) => {
      const passwords = data.passwordStore || [];
      passwords.push(entry);
      chrome.storage.local.set({ passwordStore: passwords }, () => {
        setInfo('Passwort verschlüsselt gespeichert!');
        setPasswordList(passwords);
      });
    });
  };

  const showDecrypted = async (entry) => {
    if (!key) return;
    const decrypted = await decryptPassword(entry.password, key);
    setInfo(`Entschlüsseltes Passwort: ${decrypted}`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>MiroHero Passwort Manager (React)</h2>
      <input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
      <input placeholder="Passwort" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={savePassword}>Speichern (verschlüsselt)</button>
      <div>{info}</div>
      <h3>Gespeicherte Passwörter</h3>
      <ul>
        {passwordList.map((entry, idx) => (
          <li key={idx}>
            {entry.title} ({entry.url})
            <button onClick={() => showDecrypted(entry)}>Anzeigen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
