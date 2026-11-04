import React, { useState, useEffect } from 'react';

function OptionsApp() {
  const [theme, setTheme] = useState('default');
  const [notifications, setNotifications] = useState(false);
  const [info, setInfo] = useState('');

  useEffect(() => {
    chrome.storage.local.get('userOptions', (data) => {
      const options = data.userOptions || {};
      setTheme(options.theme || 'default');
      setNotifications(options.notifications || false);
    });
  }, []);

  const saveOptions = () => {
    chrome.storage.local.set({ userOptions: { theme, notifications } }, () => {
      setInfo('Optionen gespeichert!');
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>MiroHero Optionen (React)</h2>
      <label>
        Theme:
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="default">Default</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        Benachrichtigungen aktivieren
      </label>
      <button onClick={saveOptions}>Speichern</button>
      <div>{info}</div>
    </div>
  );
}

export default OptionsApp;
