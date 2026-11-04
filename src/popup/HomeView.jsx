import Button from '../shared/ui/Button';
import { Notice, PasswordInput, TextInput } from '../shared/ui/Field';

export default function HomeView({ form, setForm, onSave, onLock, notice }) {
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });
  const submit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form className="view" onSubmit={submit}>
      <div className="card form">
        <TextInput label="Titel" placeholder="z. B. Sprint-Board" {...bind('title')} />
        <TextInput label="URL" placeholder="https://miro.com/app/board/…" {...bind('url')} />
        <PasswordInput label="Passwort" placeholder="Board-Passwort" {...bind('password')} />
        <div className="form__actions">
          <Button variant="primary" type="submit">
            Speichern
          </Button>
          <Button type="button" onClick={onLock}>
            Sperren
          </Button>
        </div>
      </div>
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
    </form>
  );
}
