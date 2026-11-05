import { useEffect, useMemo, useRef, useState } from 'react';
import { backupFilename, downloadJson } from '../shared/download';
import { ImportError, validateExport, vaultStore } from '../shared/storage';
import Button from '../shared/ui/Button';
import Icon from '../shared/ui/Icon';
import { Notice } from '../shared/ui/Field';

export default function OptionsApp() {
  const store = useMemo(() => vaultStore(), []);
  const fileInput = useRef(null);
  const [status, setStatus] = useState(null);
  const [notice, setNotice] = useState(null);
  const [pending, setPending] = useState(null); // { name, file } waiting for confirmation
  const [confirmReset, setConfirmReset] = useState(false);

  const refresh = () => store.status().then(setStatus);
  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (err) => setNotice({ kind: 'error', text: err.message });

  const exportBackup = async () => {
    try {
      downloadJson(await store.exportVault(), backupFilename());
      setNotice({
        kind: 'success',
        text: 'Sicherung gespeichert. Sie ist nur mit deinem Masterpasswort lesbar.',
      });
    } catch (err) {
      fail(err);
    }
  };

  const pickFile = async (event) => {
    const [file] = event.target.files;
    setPending(null);
    setNotice(null);
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      validateExport(parsed);
      setPending({ name: file.name, file: parsed });
    } catch (err) {
      fail(err instanceof ImportError ? err : new ImportError());
    }
  };

  const importBackup = async () => {
    try {
      await store.importVault(pending.file);
      setPending(null);
      fileInput.current.value = '';
      setNotice({
        kind: 'success',
        text: 'Wiederhergestellt. Öffne draob und entsperre mit dem Masterpasswort der Sicherung.',
      });
      refresh();
    } catch (err) {
      fail(err);
    }
  };

  const resetAll = async () => {
    await store.reset();
    setConfirmReset(false);
    setPending(null);
    setNotice({
      kind: 'success',
      text: 'Alles gelöscht. Beim nächsten Öffnen legst du ein neues Masterpasswort fest.',
    });
    refresh();
  };

  const hasVault = status && status !== 'uninitialized';

  return (
    <div className="app app--page">
      <header className="header">
        <img className="header__logo" src="icons/icon_48.png" alt="" />
        <h1 className="header__title">draob · Verwaltung</h1>
      </header>

      <div className="view">
        <div className="card">
          <h2 className="section-title">Sicherung</h2>
          <p className="muted" style={{ margin: '6px 0 12px', textAlign: 'left' }}>
            Speichert alle Einträge als verschlüsselte Datei. Ohne dein Masterpasswort ist sie
            wertlos, bewahre sie trotzdem sicher auf.
          </p>
          <Button onClick={exportBackup} disabled={!hasVault}>
            <Icon name="download" /> Sicherung speichern
          </Button>
        </div>

        <div className="card">
          <h2 className="section-title">Wiederherstellen</h2>
          <p className="muted" style={{ margin: '6px 0 12px', textAlign: 'left' }}>
            Ersetzt den aktuellen Tresor durch eine Sicherung. Der bisherige Tresor bleibt einmalig
            als Notfallkopie erhalten. Danach entsperrst du mit dem Masterpasswort der Sicherung.
          </p>
          <input
            ref={fileInput}
            className="input"
            type="file"
            accept="application/json,.json"
            aria-label="Sicherungsdatei wählen"
            onChange={pickFile}
          />
          {pending && (
            <div style={{ marginTop: 12 }}>
              <Notice kind="info">
                „{pending.name}“ ist eine gültige Sicherung. Der aktuelle Tresor wird ersetzt.
              </Notice>
              <Button variant="primary" block style={{ marginTop: 8 }} onClick={importBackup}>
                Aktuellen Tresor ersetzen
              </Button>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Zurücksetzen</h2>
          <p className="muted" style={{ margin: '6px 0 12px', textAlign: 'left' }}>
            Löscht alle Einträge und das Masterpasswort unwiderruflich. Nützlich, wenn du das
            Masterpasswort vergessen hast.
          </p>
          {confirmReset ? (
            <>
              <Notice kind="error">
                Alle Passwörter gehen verloren. Speichere vorher eine Sicherung, falls du dich noch
                an das Passwort erinnerst.
              </Notice>
              <div className="row" style={{ marginTop: 8 }}>
                <Button variant="danger" block onClick={resetAll}>
                  Ja, alles löschen
                </Button>
                <Button block onClick={() => setConfirmReset(false)}>
                  Abbrechen
                </Button>
              </div>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={!hasVault}>
              <Icon name="trash" /> Tresor zurücksetzen …
            </Button>
          )}
        </div>

        {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
      </div>
    </div>
  );
}
